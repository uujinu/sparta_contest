import { current_user } from "../user/user_profile.js";
import { axiosWrapper } from "../utils/axios_helper.js";


const info_state = {
  nickname: "",
  profile_image: ""
};
let info_ch_idx = false;


const user = current_user();
(function() {
  if (user === null || user.id === null) {
    alert("권한이 없습니다.");
    location.replace("/");
  }
}());


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
    const default_img = "https://jjbs-s3.s3.ap-northeast-2.amazonaws.com/static/profile_basic.png";
    prev_img.attr("src", default_img);
  });
};


// 닉네임 변경 이벤트
function nick_change(nick) {
  const info_nickname = nick;
  const info_btn = nick.next();

  $(info_nickname).on("propertychange change keyup paste input", function() {
    const new_nick = $(this).val();

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
        info_ch_idx = false;
      });
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
});


// sidebar menu toggle
$("ul.components > li").on("click", function(e) {
  e.preventDefault();

  if ($(this).attr("class") === "active") return;

  const active_can = $(this).siblings();
  for (let i = 0; i < active_can.length; i++) {
    if ($(active_can[i]).attr("class") === "active") {
        $(active_can[i]).toggleClass("active");
        break;
    }
  }
  $(this).toggleClass("active");
});