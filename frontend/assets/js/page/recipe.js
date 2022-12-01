import { axiosWrapper } from "../utils/axios_helper.js";
import { current_user } from "../user/user_profile.js";


export const portion_choices = {
  "_1p": "1인분",
  "_2p": "2인분",
  "_3p": "3인분",
  "_4p": "4인분",
  "_5p": "5인분",
  "_6p": "6인분 이상"
};


export const time_choices = {
  "_1t": "5분 이내",
  "_2t": "10분 이내",
  "_3t": "15분 이내",
  "_4t": "20분 이내",
  "_5t": "30분 이내",
  "_6t": "60분 이내",
  "_7t": "90분 이내",
  "_8t": "2시간 이내",
  "_9t": "2시간 이상"
};


export const degree_choices = {
  "_1d": "아무나",
  "_2d": "초급",
  "_3d": "중급",
  "_4d": "고급"
};


const user = current_user();


function user_like() {
  if (user) {
    const like_btn = $(".like-box").children(":first");
    like_btn.on("click", function() {
      const num = parseInt($(this).next().text());
      const html = $(this).children(":first").attr("class") === "bi bi-heart" ? `<i class="bi bi-heart-fill"></i>` : `<i class="bi bi-heart"></i>`
      $(this).children(":first").remove();
      $(this).append(html);
      $(this).next().text(num + 1);
    });
  } else {
    alert("로그인이 필요합니다.");
  }
};


function post_init(data) {
  const default_img = "https://jjbs-s3.s3.ap-northeast-2.amazonaws.com/static/profile_basic.png";
  const default_thumb = "https://jjbs-s3.s3.ap-northeast-2.amazonaws.com/static/thumb_basic.png";
  const top_section = $(".top-section");
  const post_sum = $(top_section.children()[1]);
  const thumb_pic = $(".thumb-pic");
  const user_info = $(".user-info");
  const thumb = data.thumbnail ? data.thumbnail : default_thumb;
  const user = data.author.profile_image ? data.author.profile_image : default_img; 
  const title = $(top_section.children(":first"));
  const info = $(".post-info").find("span");

  const thumb_img = `<img id="main_thumb" src="${thumb}" class="post-thumb"/>`;
  const _user_img = `<a class="user-img" href="profile?id=${data.author.id}">
                        <img src="${user}" class="user-thumb"/>
                     </a>
                     <span>${data.author.nickname}</span>`;
  
  thumb_pic.append(thumb_img);
  user_info.append(_user_img);
  title.html(data.title);
  post_sum.html(data.description);

  $(info[0]).append(`<p>${portion_choices[data.info.portion_info]}</p>`)
  $(info[1]).append(`<p>${time_choices[data.info.time_info]}</p>`)
  $(info[2]).append(`<p>${degree_choices[data.info.degree_info]}</p>`)

  // 재료
  const ingre_box = $(".ingre-box").children(":first");
  if (data.ingredients.length) {
    let ingre_list = "";
    for (let i = 0; i < data.ingredients.length; i++) {
      const ingre = data.ingredients[i];
      ingre_list += `<li>${ingre.name} <span>${ingre.quantity}</span></li>`;
    }
    ingre_box.append(ingre_list);
  }

  // 조리순서
  const step_box = $(".step-box").children(":first");
  if (data.steps.length) {
    let step_list = "";
    for (let i = 0; i < data.steps.length; i++) {
      const step = data.steps[i];
      step_list += `<div class="step-comb">
                      <div class="step-div">
                        <h2 class="step-num">${i + 1}</h2>
                        <div class="step-des">${step.step_desc}</div>
                      </div>`;
      if (step.step_image) {
        step_list += `<div class="step-img">
                        <div>
                          <img src=${step.step_image} />
                        </div>
                      </div>`;
      }
      step_list += "</div>"
    }
    step_box.append(step_list);
  }

  // 이미지
  if (data.images.length) {
    const wrapper = $(".swiper-wrapper");
    let img_html = "";
    for (let i = 0; i < data.images.length; i++) {
      img_html += `<div class="swiper-slide">
                    <div class="testimonial-item">
                      <img src="${data.images[i]}" />
                    </div>
                  </div>`;
    }
    wrapper.append(img_html);
  } else {
    $(".recipe-img").remove();
  }
};


export function recipe_content() {
  const _id = location.search.split("?id=")[1];
  let user_likes = "";

  if (user) { // 레시피 좋아요 목록
    axiosWrapper("GET", `users/${user.id}/likes`, null, (res) => {
      user_likes = res.data;
    }, (e) => {
      console.log("e: ", e);
    });
  }

  if (_id) {
    axiosWrapper("GET", `recipes/${_id}`, null, (res) => {
      post_init(res.data);

      let flag = true;
      const like_box = $(".like-box");

      if (user_likes.length) {
        for (let i = 0; i < user_likes.length; i++) {
          if (String(user_likes[i].id) === _id) {
            like_box.append(`<a class="like-btn"><i class="bi bi-heart-fill"></i></a><p>${res.data.likes}</p>`);
            flag = false;
            break;
          }
        }
      }

      if (flag) {
        like_box.append(`<a class="like-btn"><i class="bi bi-heart"></i></a><p>${res.data.likes}</p>`);
      }

      user_like();
    }, (e) => {
      console.log("e: ", e);
    });
  } else {
    alert("잘못된 접근입니다.");
    location.href = "/";
  }
};

$(document).ready(recipe_content);