import { axiosWrapper } from "./utils/axios_helper.js";
import { current_user } from "./user/user_profile.js";


const signupCheck = {
  emailCheck: false,
  nicknameCheck: false,
  passwordCheck: false,
  password2Check: false,
};


// 로그인/회원가입 전환
$(".change-btn").on("click", function(e) {
  e.preventDefault();
  const id = "#" + $(this).attr("id").split("-")[0];
  const chagned_id = id === "#login" ? "#signup" : "#login";

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

  if (pwd.length < 8)
    $(helper).text("비밀번호는 최소 8자입니다.");
  else if (pwd.length > 15)
    $(helper).text("비밀번호는 8~15자로 구성되어야 합니다.");
  else
    $(helper).text(/^(?=.*[a-zA-Z])((?=.*\d)+(?=.*\W)).{8,15}$/.test(pwd) ? "" : "영문자, 숫자, 특수문자를 혼용해야 합니다.");
});

$("#pwd2").on("propertychange change keyup paste input", function() {
  const id = "#" + $(this).attr("id");
  const helper = `${id}-helper-text`;
  const pwd1 = $("#pwd1").val();
  const pwd2 = $(this).val();
  if (pwd1 !== pwd2)
    $(helper).text("비밀번호가 같지 않습니다.");
  else $(helper).text("");
});