import { axiosWrapper } from "./utils/axios_helper.js";
import { current_user } from "./user/user_profile.js";


const signupCheck = {
  emailCheck: false,
  nicknameCheck: false,
  passwordCheck: false,
  password2Check: false,
};


// 전환시 input 초기화
function input_init(id) {
  const input_list = $(id).find("input");
  
  for (let i = 0; i < input_list.length; i++) {
    $(input_list[i]).val("");
  }
  if (id === "#signup") {
    const p_list = $(id).find("p");
    console.log("p_list: ", p_list)
    for (let i = 0; i < p_list.length; i++) {
      $(p_list[i]).text("");
    }
  }
}


// 로그인/회원가입 전환
$(".change-btn").on("click", function(e) {
  e.preventDefault();
  const id = "#" + $(this).attr("id").split("-")[0];
  const chagned_id = id === "#login" ? "#signup" : "#login";
  input_init(chagned_id);

  $(chagned_id).hide();
  $(id).fadeIn(600);
});


$(".duplicate-check").on("propertychange change keyup paste input", function(e) {
  const id = $(this).attr("id");
  const helper = `#${id}-helper-text`;

  if (id === "email") {
    const email = $(this).val();
    const regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;

    if (email.match(regExp) !== null) {
      $(helper).text("");
      $(this).next().attr("disabled", false);
    } else {
      $(helper).text("잘못된 이메일 형식입니다.");
      $(this).next().attr("disabled", true);
      signupCheck.emailCheck = false;
    }
  } else {
    $(helper).text("");
    signupCheck.nicknameCheck = false;
  }
})


// 이메일/비밀번호 중복 체크
$(".check").on("click", function(e) {
  e.preventDefault();
  const idx = $(this).prev();
  const id = idx.attr("id");
  const helper = `#${id}-helper-text`;

  // 입력 여부 확인
  if ($(idx).val() === undefined || $(idx).val() === "") {
    alert("값을 입력하세요.");
    return;
  }

  if (id === "email") { // 이메일 중복체크인 경우
    const email = $(idx).val();

    // 이메일 중복 검사 시행
    axiosWrapper("POST", "/users/auth/check", {"email": email}, (res) => {
      $(helper).text(res.data.message);
      signupCheck.emailCheck = true;
    }, (e) => {
      $(helper).text(e.response.data.message);
      signupCheck.emailCheck = false;
    })
  } else if (id === "nickname") { // 닉네임 중복체크인 경우
    const nickname = $(idx).val();

    // 닉네임 중복 검사 시행
    axiosWrapper("POST", "/users/auth/check", {"nickname": nickname}, (res) => {
      $(helper).text(res.data.message);
      signupCheck.nicknameCheck = true;
    }, (e) => {
      $(helper).text(e.response.data.message);
      signupCheck.nicknameCheck = false;
    });
  }
});


// 비밀번호 체크
$("#pwd1").on("propertychange change keyup paste input", function() {
  const id = "#" + $(this).attr("id");
  const helper = `${id}-helper-text`;
  const pwd = $(this).val();

  if (pwd.length < 8) {
    $(helper).text("비밀번호는 최소 8자입니다.");
    signupCheck.passwordCheck = false;
  } else if (pwd.length > 15) {
    $(helper).text("비밀번호는 8~15자로 구성되어야 합니다.");
    signupCheck.passwordCheck = false;
  } else {
    $(helper).text(/^(?=.*[a-zA-Z])((?=.*\d)+(?=.*\W)).{8,15}$/.test(pwd) ? "" : "영문자, 숫자, 특수문자를 혼용해야 합니다.");
    signupCheck.passwordCheck = true;
  }
});


$("#pwd2").on("propertychange change keyup paste input", function() {
  const id = "#" + $(this).attr("id");
  const helper = `${id}-helper-text`;
  const pwd1 = $("#pwd1").val();
  const pwd2 = $(this).val();
  if (pwd1 !== pwd2) {
    $(helper).text("비밀번호가 같지 않습니다.");
    signupCheck.password2Check = false;
  }
  else {
    $(helper).text("");
    signupCheck.password2Check = true;
  }
});


// 회원가입
$("#signup-btn").on("click", function(e) {
  e.preventDefault();

  if (!(signupCheck.emailCheck && signupCheck.nicknameCheck && signupCheck.passwordCheck && signupCheck.password2Check)) {
    alert("작성이 완료되지 않았습니다.");
    return
  }

  const data = {
    email: $("#email").val(),
    nickname: $("#nickname").val(),
    password: $("#pwd1").val(),
    password2: $("#pwd2").val(),
  };

  axiosWrapper("POST", "/users/signup", data, (res) => {
    if (res.status === 201) {
      alert(res.data.message);
      location.href = "/login";
    }
  }, (e) => {
    console.log("error: ", e);
    alert(e.response.data.message);
  });
});


// 로그인
$("#login-btn").on("click", function(e) {
  e.preventDefault();

  const data = {
    email: $("#email-si").val(),
    password: $("#pwd").val()
  }
  if (!(data.email && data.password)) {
    alert("값을 입력하세요.");
    return
  } else {
    axiosWrapper("POST", "/users/login", data, (res) => {
      if (res.status === 200) {
        localStorage.setItem("user", JSON.stringify(res.data));
        location.replace("/");
      }
    }, (e) => {
      console.log("error: ", e);
      if (e.response.status === 400 || e.response.status === 401) alert(e.response.data.message || "로그인에 실패했습니다.");
      else alert("로그인에 실패했습니다.");
    });
  }
});


// 로그아웃
$("#logout-btn").on("click", function(e) {
  e.preventDefault();
  const user = current_user();
  if (user) {
    axiosWrapper("GET", "/users/logout", null, (res) => {
      if (res.status === 200) {
        localStorage.removeItem("user");
        location.replace("/");
      }
    }, (e) => {
      alert("로그아웃 되었습니다.");
      console.log("res: ",e);
      localStorage.removeItem("user");
      location.replace("/");
    });
  } else {
    alert("로그인되지 않았습니다.");
  }
})