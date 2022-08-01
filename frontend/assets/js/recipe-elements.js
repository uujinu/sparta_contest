import { inputEvent } from "./file-upload.js";
import { axiosWrapper } from "./utils/axios_helper.js";
import { throttle, mouse_event, auto_list_ctrl } from "./search.js";


// 글 내용
export const state = {
  title: "",
  description: "",
  info: {
    portion_info: "",
    time_info: "",
    degree_info: ""
  },
  ingredient: {
    "li-1": {
      ingre_id: "",
      name: "",
      quantity: ""
    },
    "li-2": {
      ingre_id: "",
      name: "",
      quantity: ""
    },
    "li-3": {
      ingre_id: "",
      name: "",
      quantity: ""
    }
  },
  cook_step: {
    "sli-1": {
      step_desc: "",
      step_image: ""
    },
    "sli-2": {
      step_desc: "",
      step_image: ""
    }
  },
  images: {
    thumbnail: "",
    images: {},
  }
};


// 1. 제목
$("#title").on("propertychange change keyup paste input", function(e) {
  state.title = $(this).val();
});


// 2. 소개
$("#description").on("propertychange change keyup paste input", function(e) {
  state.description = $(this).val();
});


// 3. 레시피 정보
$(".form-select").on("change", function(e) {
  const { id, value } = e.target;
  state.info[id] = value;
});


// 4. 재료
function ingreAdd() {
  $(".ingre-list > li").on("propertychange change keyup paste input", function(e) {
    const _id = $(this).attr("id");
    const _name = $(this).children(":first").children(":first");
    const _quantity = _name.parent().next();
    const _idx_n = _name.attr("name").split("_")[1];
    const _idx_q = _quantity.attr("name").split("_")[1];

    // 자동완성
    const autodiv = _name.next().children(":first");
    const li = autodiv.children();
    
    if (li.length) {
      for (let i = 0; i < li.length; i++) {
        if (_name.val() === $(li[i]).text()) {
          const _ingre_id = $(li[i]).attr("id").split("-")[1];
          state.ingredient[_id].ingre_id = _ingre_id;
          break;
        }
      }
    } else state.ingredient[_id].ingre_id = "";
  
    state.ingredient[_id][_idx_n] = _name.val();
    state.ingredient[_id][_idx_q] = _quantity.val();
  });
};
ingreAdd();


// 재료 자동완성 선택(위, 아래 이동)
$(document).ready(function() {
  const ingre_input = $(".li-auto-div > input");
  for (let i = 0; i < ingre_input.length; i++) {
    const name = ingre_input.attr("name").split("_")[1];
    if (name === "name") {
      auto_list_ctrl($(ingre_input[i]), 24);
    }
  }
});


// 재료 자동완성 닫기
$(document).mouseup(function (e) {
  const autocomp = $(".li-auto");
  const auto_list = autocomp.find("ul");

  // 현재 열린 자동완성
  const opened = [];
  for (let i = 0; i < auto_list.length; i++) {
    if ($(auto_list[i]).css("display") === "block")
      opened.push(auto_list[i]);
  }

  if (auto_list.has(e.target).length === 0) {
    // 닫기
    for (let i = 0; i < opened.length; i++) {
      if ($(opened[i]).parent().css("display") === "block") {
        $(opened[i]).parent().css("display", "none");
      }
    }
  }
});


function auto_close() {
  const input = $(".li-auto-div > input");
  input.on("click", function(e) {
    const _input = $(e.target);
    const li_auto = _input.next();

    if (li_auto.children(":first").children().length) {
      if (li_auto.css("display") === "none") {
        li_auto.css("display", "block");
      } else li_auto.css("display", "none");
    }
  });

  input.on("keydown", function(e) {
    const _input = $(e.target);
    const key = e.keyCode;
    const li = _input.next().find("li");
    let now = "";
    if (li.length) {
      for (let i = 0; i < li.length; i++) {
        const _t = $(li[i]);
        if (_t.css("background") === "e9e9e9") {
          now = _t;
          break;
        }
      }
    }
    if (key === 13 && now !== "") {
      const ingre_id = now.attr("id");
      if (ingre_id !== "") {
        state.ingredient[_id].ingre_id = ingre_id.split("-")[1];
        state.ingredient[_id][_idx_n] = input.val();
      }
      _input.next().css("display", "none");
    }
  });
};
auto_close();


// 재료 자동완성 선택(클릭, 엔터) 
function ingre_li_select(autodiv) {
  const input = autodiv.parent().prev();
  const _id = input.attr("id");
  const _idx_n = input.attr("name").split("_")[1];
  const li = autodiv.children();
  if (li.length) {
    $(li).on("click", function(e) { 
      const now = $(e.target);
      const ingre_id = now.attr("id");
      if (ingre_id !== "") {
        input.val(now.text());
        state.ingredient[_id].ingre_id = ingre_id.split("-")[1];
        state.ingredient[_id][_idx_n] = input.val();
      }

      if (now.parent().parent().css("display") === "block") {
        now.parent().parent().css("display", "none");
      }
    });
  }
};


// 재료 자동완성
function ingre_auto() {
  const autocomp = $(".li-auto");
  const input = autocomp.prev();

  input.on("propertychange change keyup paste input click", function(e) {
    const now_val = $(this).val();
    const auto_div = $(this).next().children(":first");
    const key = e.keyCode;

    if (now_val.length && (key !== 40 && key !== 38 && key !== 13)) {
      throttle(
        axiosWrapper("GET", `/recipes/ingredients?iname=${encodeURIComponent(now_val)}`, null, (res) => {
          auto_div.empty();
          if (res.data.length) {
            const suggestions = res.data.filter(function(data) {
              return data[1].startsWith(now_val);
            });
          
            suggestions.forEach(function(suggested) {
              const html = `<li id="i-${suggested[0]}">${suggested[1]}</li>`;
              auto_div.append(html);
            });

            if (suggestions.length) {
              auto_div.parent().css("display", "block");
            } else {
              auto_div.parent().css("display", "none");
            }
            mouse_event(auto_div);
            ingre_li_select(auto_div);
          } else {
            auto_div.parent().css("display", "none");
          }
        }, (e) => {
          console.log("error: ", e);
        }), 500);
    }
  });
};
ingre_auto();


export function ingre_add_func() {
  const parent = $(".ingre-list");
  let id = "";
  if (parent.children().length === 0)
    id = "1";
  else id = String(parseInt($(".ingre-list > li:last-child").attr("id").split("-")[1]) + 1);

  // state에 추가
  state.ingredient[`li-${id}`] = {
    ingre_id: "",
    name: "",
    quantity: ""
  }

  const html = `
    <li id="li-${id}">
      <div class="li-auto-div position-relative">
        <input id="li-${id}" name="li-${id}_name" placeholder="재료" required autocomplete="off">
        <div class="li-auto">
          <ul></ul>
        </div>
      </div>
      <input id="li-${id}" name="li-${id}_quantity" placeholder="용량" required autocomplete="off">
      <span class="span-d"><i class="bi bi-x-circle d-btn"></i></span>
    </li>`;
  
  parent.append(html);
  parent.children(":last-child").children("span").on("click", function() {
    $(this).parent().remove();
    const _id = $(this).parent().attr("id");
    delete state.ingredient[_id];
  });
  ingreAdd();
  ingre_auto();
  auto_close();

  const input = parent.children(":last-child").find(".li-auto").prev();
  auto_list_ctrl(input, 24);
};

// 재료 추가
$(".p-ili").on("click", function() {
  ingre_add_func();
});


// 재료 삭제
$(".span-d").on("click", function() {
  const _id = $(this).parent().attr("id");
  delete state.ingredient[_id];
  $(this).parent().remove();
});


// 5. 레시피 순서
function stepState() {
  $(".sli-list > div > li").on("propertychange change keyup paste input", function(e) {
    const _id = $(this).attr("id");
    const _desc = $(this).children(":first");
    const _idx_d = "step_desc";

    state.cook_step[_id][_idx_d] = _desc.val();  
  })
};
stepState();


// 레시피 삭제 후 step-num 정렬
function num_asc() {
  const child_list = $(".sli-list").children();

  for (let i = 0; i < child_list.length; i++) {
    const _temp = $(child_list[i]).children(); 
    _temp.first().text(`Step ${i + 1}`); // 라벨 변경
    _temp.find("textarea").attr("placeholder", `Step ${i + 1} 과정 설명`);
  }
};


export function step_add_func(sli) {
  let id = "";
  const _sli = sli ? sli : $(".p-sli");
  const parent = _sli.parent().prev();
  const num = parent.children().length;
  let _temp = parent.children(":last-child");

  num_asc();

  if (num === 0) id = "1";
  else id = String(parseInt(_temp.attr("id").split("-")[1]) + 1);

  state.cook_step[`sli-${id}`] = {
    step_desc: "",
    step_image: ""
  };

  const html = `<div id="sli-${id}" class="step-comb">
                  <p class="step-num">Step ${num + 1}</p>
                  <li id="sli-${id}" class="step-li-row">
                    <textarea id="sli-${id}" name="sli-${id}_description" class="sli-desc" placeholder="Step ${num + 1} 과정 설명"></textarea>
                    <div class="side-d">
                      <div class="img-wrapper">
                        <div class="file-upload-comp">
                          <span class="file-img"><i class="bi bi-image"></i></span>
                          <input class="upload-file" id="upload" name="sli-${id}_stepImage" type="file" title="" accept="image/*">
                          <!--이미지 프리뷰-->
                          <div class="prv-wrapper">
                            <img class="prv-img">
                            <span class="prv-d-btn"><i class="bi bi-x-circle-fill"></i></span>
                          </div>
                          <!--end 이미지 프리뷰-->
                        </div>                 
                      </div>
                      <span class="span-ds"><i class="bi bi-x-circle d-sli d-btn"></i></span>
                    </div>
                  </li>
                </div>`;

  parent.append(html);
  if (num !== 0) _temp = _temp.next();

  _temp = parent.children(":last-child");

  // 삭제 이벤트 등록
  stepDel();

  // 프리뷰 이벤트 등록
  _temp.find("input.upload-file").on("change", inputEvent);
  
  // state 이벤트 등록
  stepState();
};


// 레시피 추가
$(".p-sli").on("click", function() {
  step_add_func($(this));
});


function stepDel() {
  $(".span-ds").on("click", function() {
    const _t = $(this).parents().eq(2);
    const _id = _t.attr("id")
    delete state.cook_step[_id];
    _t.remove();
    num_asc();
  });
};
stepDel();