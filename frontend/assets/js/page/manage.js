import { current_user } from "../user/user_profile.js";
import { axiosWrapper } from "../utils/axios_helper.js";
import { state } from "../recipe-elements.js";
import { ingre_edit, ingre_del } from "../user/user_refrige.js";
import { init_nav } from "../utils/pagination.js";
import { recipe_pagination, recipe_init } from "./search.js";


const info_state = {
  nickname: "",
  profile_image: ""
};
const user_data = {
  posts: [],
  likes: [],
  refrige: []
};
let info_ch_idx = false;
const default_img = "https://jjbs-s3.s3.ap-northeast-2.amazonaws.com/static/profile_basic.png";
const default_thumb = "https://jjbs-s3.s3.ap-northeast-2.amazonaws.com/static/thumb_basic.png";


const user = current_user();
(function() {
  if (user === null || user.id === null) {
    alert("권한이 없습니다.");
    location.replace("/");
  } else {
    if (location.href.split("?tab=")[1] === "refrige") {
      $("#my-info").toggleClass("active");
      $("#my-refrige").toggleClass("active");
      $("#user-info").css("display", "none");
      $("#user-refrige").css("display", "block");
    }
  }
}());


// user data init
$(document).ready(function() {
  // posts, likes, refrige
  const content = $("#content");
  const post_ul = content.children(":nth-child(3)").children(":first").children(":first");
  const like_ul = content.children(":nth-child(4)").children(":first").children(":first");
  const posts_nav_ul = post_ul.parent().next().children(":first");
  const likes_nav_ul = like_ul.parent().next().children(":first");;
  const _page = location.hash ? parseInt(location.hash.substring(1)) : 1;
  const idx = 30;
  const start = (_page - 1) * idx;
  const end = start + idx;

  axiosWrapper("GET", `/users/${user.id}`, null, (res) => {
    const user_info = res.data;
    user_info["profile_image"] = user_info.profile_url ? user_info.profile_url : default_img;
    localStorage.setItem("user", JSON.stringify(user_info));
    user_data.posts = user_info.posts;
    user_data.likes = user_info.likes;
    user_data.refrige = user_info.refrige;

    const posts_page_num = (user_data.posts.length % idx) ? parseInt(user_data.posts.length / idx) + 1 : parseInt(user_data.posts.length / idx);
    const likes_page_num = (user_data.likes.length % idx) ? parseInt(user_data.likes.length / idx) + 1 : parseInt(user_data.likes.length / idx);

    if (user_data.posts.length) {
      init_nav(posts_nav_ul, posts_page_num, _page);
      posts_nav_ul.on("click", function() {
        recipe_init(post_ul, user_data.posts, posts_page_num, posts_nav_ul);
      });
      recipe_pagination(post_ul, start, end, user_data.posts);
    } else {
      post_ul.append("<span>작성한 글이 없습니다. 나만의 레시피를 작성해보세요.</span>");
    }

    if (user_data.likes.length) {
      init_nav(likes_nav_ul, likes_page_num, _page);
      likes_nav_ul.on("click", function() {
        recipe_init(like_ul, user_data.likes, likes_page_num, likes_nav_ul);
      });
      recipe_pagination(like_ul, start, end, user_data.likes);
    } else {
      like_ul.append("<span>좋아요한 글이 없습니다.</span>");
    }
  }, (e) => {
    console.log("error: ", e);
  });
});


// sidebar toggle
$(document).ready(function() {
  $("#sidebarCollapse").on("click", function() {
    $("#sidebar").toggleClass("active");
    const btn_left = $(this).parent();
    const btn_i = $(this).children().first();
    const content = $(".m-content");
    const toggle_left = btn_left.css("left") === "0" ? "-1px" : "0";
    const toggle_i = btn_i.attr("class") === "bi bi-box-arrow-in-left" ? "bi bi-box-arrow-right" : "bi bi-box-arrow-in-left";
    const toggle_border = content.css("border-left") === "none" ? "8px solid #f6f0df" : "none";
    btn_left.css("left", toggle_left);
    btn_i.attr("class", toggle_i);
    content.css("border-left", toggle_border);
  });
});


// 프로필 이미지 변경 이벤트
function pf_change() {
  const input_img = $("#pf-img");
  const prev_img = $(".info-img");
  const remove_img = $(".info-img-x");

  input_img.on("change", function(e) { // 이미지 변경
    const files = e.target.files;
    const len = files.length;
    if (len === 0) return;
    
    info_state.profile_image = files[0];
    prev_img.attr("src", URL.createObjectURL(files[0]));
  });

  remove_img.on("click", function() { // 이미지 삭제
    info_state.profile_image = "null";
    prev_img.attr("src", default_img);
  });
};


// 닉네임 변경 이벤트
function nick_change(nick) {
  const info_nickname = nick;
  const info_btn = nick.next();

  $(info_nickname).on("propertychange change keyup paste input", function() {
    const new_nick = $(this).val();
    info_ch_idx = false;
    info_state.nickname = "";

    if (new_nick && new_nick !== user.nickname) {
      info_btn.attr("disabled", false);
      info_btn.css("background", "#dc3545");
      info_btn.css("cursor", "pointer");
      return;
    }
    info_btn.attr("disabled", true);
    info_btn.css("background", "#adb5bd");
    info_btn.css("cursor", "default");
  });

  info_btn.on("click", function(e) { // 닉네임 중복체크
    e.preventDefault();
    const new_nick = nick.val();

    if (new_nick && new_nick !== user.nickname) {
      axiosWrapper("POST", "/users/auth/check", {"nickname": new_nick}, (res) => {
          alert(res.data.message);
          info_state.nickname = new_nick;
          info_ch_idx = true;
      }, (e) => {
        alert(e.response.data.message);
        info_state.nickname = "";
        info_ch_idx = false;
      });
    }
  });
};


// 비밀번호 변경 이벤트
function pwd_change() {
  const pwd_box = $(".pwd-ch-box");
  const pwd_btn = pwd_box.next().children(":first");
  pwd_btn.on("click", function(e) {
    e.preventDefault();

    const email = pwd_box.find("#email");
    const pwd1 = pwd_box.find("#pwd1");
    const pwd2 = pwd_box.find("#pwd2");
    const helper1 = pwd_box.find("#pwd1-helper-text");
    const helper2 = pwd_box.find("#pwd2-helper-text");
    const val_check = (email.val() === user.email) && pwd1.val() && pwd2.val() && (pwd1.val() === pwd2.val());
    const helper_check = !(helper1.text() || helper2.text());
    if (val_check && helper_check) {
      const data = {
        email: email.val(),
        password: pwd1.val(),
        password2: pwd2.val()
      };
      
      axiosWrapper("POST", "/users/auth/passwd", data, (res) => {
        if (res.status === 200) {
          alert(res.data.message);
          localStorage.removeItem("user");
          location.replace("/login");
        }
      }, (e) => {
        console.log("error: ", e);
        alert(e.response.data.message);
      });
    } else {
      alert("입력이 완료되지 않았습니다.");
    }
  });
}


// 저장
function info_save(info_box) {
  $(".info-save-btn").on("click", function(e) {
    e.preventDefault();
    const info_nickname = info_box.find(".info-nick input").val();

    if (info_nickname !== user.nickname || info_state.profile_image) {
      const formData = new FormData();

      if (info_nickname) {
        if (info_nickname !== user.nickname) { // 닉네임 변경
          if (info_ch_idx) { // 중복 검사 완료
            formData.append("nickname", info_state.nickname);
          } else {
            alert("닉네임 중복검사를 해주세요.");
            return;
          }
        } 
      } else {
        alert("닉네임을 입력하세요.");
      }

      if (info_state.profile_image) { // 프로필 이미지 변경
        formData.append("profile_image", info_state.profile_image);
      }

      axiosWrapper("PATCH", `/users/${user.id}`, formData, (res) => {
        alert(res.data.message);

        const userinfo = JSON.parse(localStorage.getItem("user"));
        if (info_state.nickname) userinfo["nickname"] = info_state.nickname;
        if (res.data.profile_url !== undefined) {
          userinfo["profile_image"] = res.data.profile_url ? res.data.profile_url : default_img;
        }
        localStorage.setItem("user", JSON.stringify(userinfo)); // 회원정보 업데이트
        location.reload();
      }, (e) => {
        console.log("error: ", e);
        alert(e.response.data.message);
      });    
    } else {
      alert("변경 사항이 없습니다.");
    }
  });
};


// 내 정보 프로필 화면 구성
$(document).ready(function() {
  const info_box = $(".info-box");
  // 프로필 이미지
  info_box.find("img").attr("src", user.profile_image); // 초기화
  pf_change(); // 이벤트 등록

  // 닉네임
  const info_nickname = info_box.find(".info-nick input");
  info_nickname.val(user.nickname);
  nick_change(info_nickname); // 이벤트 등록

  // 비밀번호 변경
  pwd_change(); // 이벤트 등록

  // 저장
  info_save(info_box); // 이벤트 등록
});


// sidebar menu toggle
$("ul.components > li").on("click", function(e) {
  e.preventDefault();
  location.hash = "#";

  const section = $(this).closest("#sidebar").next().find("section");
  const _id = $(this).attr("id").split("-")[1];

  if ($(this).attr("class") === "active") return;

  const active_can = $(this).siblings();
  for (let i = 0; i < active_can.length; i++) {
    if ($(active_can[i]).attr("class") === "active") {
        $(active_can[i]).toggleClass("active");
        break;
    }
  }
  $(this).toggleClass("active");
  section.css("display", "none");
  for (let i = 0; i < section.length; i++) {
    if ($(section[i]).attr("id") === `user-${_id}`) {
      $(section[i]).css("display", "block");
      break;
    }
  }
});


$(".ingre-btn-box").on("click", function(e) {
  const _input = $(e.target).prev().prev().find("input");
  const _desc = $(e.target).prev().prev().find("textarea");
  const _data = {
    ingre_id: state.ingredient["li-1"].ingre_id,
    name: _input.val(),
    memo: _desc.val(),
  };

  if (_input.val()) {
    const _btn_txt = $(this).text();
    const _id = $(this).attr("id");
    const user_info = JSON.parse(localStorage.getItem("user"));
    let _method = "POST";
    let _url = `users/${user.id}/refrige`;

    if (_id && _btn_txt === "수정") {
      _method = "PUT";
      _url += `/${_id.split("_")[1]}`;
    }

    axiosWrapper(_method, _url, _data, (res) => {
      if (_method === "POST" && res.status === 201) {
        user_info.refrige[0].ingredients.push(res.data);
        localStorage.setItem("user", JSON.stringify(user_info)); // 회원정보 업데이트
        const card_wrapper = $(".ingre-card-wrapper");
        const ingre_html = `<div class="ingre-card-box" id="ingre_${res.data.id}">
                              <div class="ingre-card">
                                <h4>
                                  ${res.data.name}
                                </h4>
                                <span>${res.data.created_at.split("T")[0]}</span>
                                <div class="ingre-info">
                                  ${res.data.memo}
                                </div>
                                <div class="ingre-btn">
                                  <button class="edit-btn"><i class="bi bi-pencil"></i></button>
                                  <button class="del-btn bg-secondary"><i class="bi bi-trash"></i></button>
                                </div>
                              </div>
                            </div>`;
        card_wrapper.append(ingre_html);
        ingre_edit();
        ingre_del();
        alert("냉장고에 재료가 추가되었습니다.");
      } else if (_method === "PUT" && res.data.status === "success") { // 수정 
        const _ingre_data = user_info.refrige[0].ingredients;
        for (let i = 0; i < _ingre_data.length; i++) { // user데이터 수정
          if (_ingre_data[i].id === parseInt(_id.split("_")[1])) {
            _ingre_data[i].ingre_id = _data.ingre_id;
            _ingre_data[i].name = _data.name;
            _ingre_data[i].memo = _data.memo;
            user_info.refrige[0].ingredients = _ingre_data;
            localStorage.setItem("user", JSON.stringify(user_info));
            break;
          }
        }

        const ingre_card = $(`#${_id}`);
        ingre_card.find("h4").text(_data.name);
        ingre_card.find("div.ingre-info").text(_data.memo);
        alert(res.data.message);
      } else {
        alert("오류가 발생했습니다.");
      }

      _input.val("");
      _desc.val("");
    }, (e) => {
      alert("오류가 발생했습니다.");
    });
  } else {
    alert("재료명을 입력하세요.");
  }
});


function cont_pagination() {
  const sidebar = $("#sidebar");
  const side_li = sidebar.find("li");
  const idx = 30;

  side_li.on("click", function(e) {
    const _id = $(this).attr("id");

    if (_id === "my-posts" || _id === "my-likes") {
      const sec_id = "user" + _id.substring(2);
      const cont = $(`#${sec_id}`);
      const nav_ul = cont.find("ul.pagination");
      const data_len = _id === "my-posts" ? user_data.posts.length : user_data.likes.length;
      const _page_num = (data_len % idx) ? parseInt(data_len / idx) + 1 : parseInt(data_len / idx);

      if (data_len) init_nav(nav_ul, _page_num);
    }
  });
};


$(document).ready(cont_pagination);