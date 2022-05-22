import { inputEvent } from "./file-upload.js";

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
      name: "",
      quantity: ""
    },
    "li-2": {
      name: "",
      quantity: ""
    },
    "li-3": {
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
    const _name = $(this).children(":first");
    const _quantity = _name.next();
    const _idx_n = _name.attr("name").split("_")[1];
    const _idx_q = _quantity.attr("name").split("_")[1];
  
    state.ingredient[_id][_idx_n] = _name.val();
    state.ingredient[_id][_idx_q] = _quantity.val();
  })
}
ingreAdd();


// 재료 추가
$(".p-ili").on("click", function() {
  const parent = $(".ingre-list");
  let id = "";
  if (parent.children().length === 0)
    id = "1";
  else id = String(parseInt($(".ingre-list li:last-child").attr("id").split("-")[1]) + 1);

  // state에 추가
  state.ingredient[`li-${id}`] = {
    name: "",
    quantity: ""
  }

  const html = `
    <li id="li-${id}">
      <input id="ii-${id}" name="li-${id}_name" placeholder="재료" required autocomplete="off">
      <input id="ii-${id}" name="li-${id}_quantity" placeholder="용량" required autocomplete="off">
      <span class="span-d"><i class="bi bi-x-circle d-btn"></i></span>
    </li>`
  
  parent.append(html);
  parent.children(":last-child").children("span").on("click", function() {
    $(this).parent().remove();
    const _id = $(this).parent().attr("id");
    delete state.ingredient[_id];
  });
  ingreAdd();
})


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
}
stepState();


// 레시피 삭제 후 step-num 정렬
function num_asc() {
  const child_list = $(".sli-list").children();

  for (let i = 0; i < child_list.length; i++) {
    const _temp = $(child_list[i]).children(); 
    _temp.first().text(`Step ${i + 1}`); // 라벨 변경
    _temp.find("textarea").attr("placeholder", `Step ${i + 1} 과정 설명`);
  }
}


// 레시피 추가
$(".p-sli").on("click", function() {
  let id = "";
  const parent = $(this).parent().prev();
  const num = parent.children().length;
  let _temp = parent.children(":last-child");

  num_asc();

  if (num === 0) id = "1";
  else id = String(parseInt(_temp.attr("id").split("-")[1]) + 1);

  state.cook_step[`sli-${id}`] = {
    step_desc: "",
    step_image: ""
  }

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
})


function stepDel() {
  $(".span-ds").on("click", function() {
    const _t = $(this).parents().eq(2);
    const _id = _t.attr("id")
    delete state.cook_step[_id];
    _t.remove();
    num_asc();
  });
}
stepDel();