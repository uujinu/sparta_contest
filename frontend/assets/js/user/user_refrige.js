import { axiosWrapper } from "../utils/axios_helper.js";
import { current_user } from "./user_profile.js";


// 재료 수정
export function ingre_edit() {
  const edit_btn = $(".edit-btn");
  const cancel_btn = $(".ingre-btn-active");
  const _input = cancel_btn.prev().find("input");
  const _text = cancel_btn.prev().find("textarea");
  const add_btn = cancel_btn.next();

  edit_btn.on("click", function() {
    const _name = $(this).parent().parent().children("h4");
    const _memo = $(this).parent().parent().children(".ingre-info");
    if (location.href === "http://127.0.0.1:8080/" || location.hash) {
      location.href = "/manage?tab=refrige";
    } else {
      cancel_btn.css("display", "inline-block");
      _input.val(_name.text().trim());
      _text.val(_memo.text().trim());
      add_btn.text("수정");
      add_btn.attr("id", $(this).parents(".ingre-card-box").attr("id"));
      
      cancel_btn.on("click", function() {
        if (cancel_btn.css("display") === "inline-block") {
          _input.val("");
          _text.val("");
          cancel_btn.css("display", "none");
          add_btn.text("추가");
          add_btn.removeAttr("id");
        }
      });
    }
  });
};


// 재료 삭제
export function ingre_del(_user) {
  const del_btn = $(".del-btn");
  del_btn.on("click", function() {
    if(confirm("재료를 삭제하시겠습니까?")) {
      const _id = $(this).parents(".ingre-card-box").attr("id");
      const _url = `users/${_user.id}/refrige/${_id.split("_")[1]}`;

      axiosWrapper("DELETE", _url, null, (res) => {
        const user_info = JSON.parse(localStorage.getItem("user"));
        const _ingre_data = user_info.refrige[0].ingredients;
        for (let i = 0; i < _ingre_data.length; i++) {
          if (_ingre_data[i].id === parseInt(_id.split("_")[1])) {
            _ingre_data.splice(i, 1);
            user_info.refrige[0].ingredients = _ingre_data;
            localStorage.setItem("user", JSON.stringify(user_info));
            $(`#${_id}`).remove();
            break;
          }
        }
        alert(res.data.message);
      }, (e) => {
        if (e.response.status === 404) {
          alert("존재하지 않는 재료입니다.");
        } else {
          alert("오류가 발생했습니다.");
        }
      });
    }
  });
};


// 나의 냉장고 관리
export const refrige_controller = (function() {
  const user = current_user();
  if (user) {
    const ingre_list = JSON.parse(localStorage.getItem("user")).refrige[0].ingredients;
    const card_wrapper = $(".ingre-card-wrapper");
    let ingre_total = "";

    if (card_wrapper.length) {
      for (let i = 0; i <ingre_list.length; i++) {
        const ingre_item = ingre_list[i];
        const ingre_html = `<div class="ingre-card-box" id="ingre_${ingre_item.id}">
                              <div class="ingre-card">
                                <h4>
                                  ${ingre_item.name}
                                </h4>
                                <span>${ingre_item.created_at.split("T")[0]}</span>
                                <div class="ingre-info">
                                  ${ingre_item.memo}
                                </div>
                                <div class="ingre-btn">
                                  <button class="edit-btn"><i class="bi bi-pencil"></i></button>
                                  <button class="del-btn bg-secondary"><i class="bi bi-trash"></i></button>
                                </div>
                              </div>
                            </div>`;
        ingre_total += ingre_html;
      };
      card_wrapper.append(ingre_total);
      ingre_edit();
      ingre_del(user);
    }
  }
}());