import { state, ingre_add_func, step_add_func } from "./recipe-elements.js";
import { axiosWrapper } from "./utils/axios_helper.js";
import { current_user } from "./user/user_profile.js";
import { prvEvent, step_prv_btn, multi_file } from "./file-upload.js";


const mode = {
  method: "",
  url: ""
};


function recipe_edit_init(data) {
  state.title = data.title;
  $("#title").val(state.title);
  state.description = data.description;
  $("#description").val(state.description);

  // info
  state.info = data.info;
  Object.keys(state.info).map((val) => {
    const _id = val;
    const _selected = state.info[val];
    $(`#${_id} > option:nth-child(${parseInt(_selected[1]) + 1})`).prop("selected", true);
  });

  // ingredients
  const ingre_list = $(".ingre-list");
  data.ingredients.forEach((val, idx) => {
    const _t = { ...val };
    const _li = ingre_list.find(`#li-${idx + 1}`);
    let _input = [];
    
    if (_li.length) {
      _input = _li.find("input");
    } else {
      ingre_add_func();
      _input = ingre_list.find(`#li-${idx + 1}`).find("input");
    }
    state.ingredient[`li-${idx + 1}`] = _t;

    $(_input[0]).val(val.name);
    $(_input[1]).val(val.quantity);
  });  
  

  // steps
  const step_list = $(".sli-list");
  data.steps.forEach((val, idx) => {
    const _sli = step_list.find(`#sli-${idx + 1}`);
    let _txt = "";
    let _prv = "";
    let _img = "";
    if (_sli.length) {
      _txt = _sli.find("textarea");
      _prv = _sli.find(".prv-wrapper");
      _img = _sli.find("img");
    } else {
      step_add_func();
      _txt = step_list.find(`#sli-${idx + 1}`).find("textarea");
      _prv = step_list.find(`#sli-${idx + 1}`).find(".prv-wrapper");
      _img = _prv.find("img");
    }
    state.cook_step[`sli-${idx + 1}`].step_desc = val.step_desc;
    state.cook_step[`sli-${idx + 1}`].step_image = val.step_image ? val.step_image : "";
    _txt.val(val.step_desc);
    if (val.step_image) {
      _img.attr("src", val.step_image);
      _prv.css("display", "block");
      step_prv_btn($(_prv.find("span")));
    }
  });

  // thumbnail
  if (data.thumbnail) {
    const _prv = $("#thumbnail-box");
    prvEvent(_prv, data.thumbnail);
  }

  // images
  if (data.images.length) {
    const _prv = $(".mti-w > input");
    const _temp = $(".mti-prv-box");
    multi_file(_prv, _temp, data.images);
  }
}


// method 구분
$(document).ready(function() {
  let _id = location.href.split("new-recipe")[1];
  _id = _id === "" ? _id : _id.split("?id=")[1];
  mode.method = _id === "" ? "POST" : "PUT";
  mode.url = _id === "" ? "/recipes" : `/recipes/${_id}`;

  if (_id !== "" && current_user()) {
    axiosWrapper("GET", mode.url + "?manage=true", null, (res) => {
      console.log("data: ", res);
      recipe_edit_init(res.data);
    }, (e) => {
      if (e.response.status === 403) {
        alert(e.response.data.message);
      } else {
        alert("오류가 발생했습니다.");
      }
      location.replace("/");
    });
  }
});


/**********************************
 *  필수 문항 작성 체크 
 * ********************************/
function submitCheck() {
  const check = state.title && state.description && state.info.portion_info && state.info.time_info && state.info.degree_info;
  let ingre = false;
  let step = false;

  // 재료 입력 확인
  const ingres = state.ingredient;
  const ingre_keys = Object.keys(ingres);

  if (ingre_keys.length) {
    for (let i = 0; i < ingre_keys.length; i++) {
      if (!ingres[ingre_keys[i]].name && !ingres[ingre_keys[i]].quantity) continue;
      if (ingres[ingre_keys[i]].name) {
        if (ingres[ingre_keys[i]].quantity) {
          ingre = true;
        }
        else {
          ingre = false;
          break;
        }
      } else {
        ingre = false;
        break;
      }
    }
  }

  // 과정 입력 확인
  const steps = state.cook_step;
  const step_keys = Object.keys(steps);
  if (step_keys.length) {
    for (let i = 0; i < step_keys.length; i++) {
      if (!steps[step_keys[i]].step_desc && !steps[step_keys[i]].step_image) continue;
      if (steps[step_keys[i]].step_desc) step = true;
      else {
        step = false;
        break;
      }
    }
  }

  // 필수 요소 입력 확인
  if (check && ingre && step) {
    return true;
  } 
  alert("입력이 완료되지 않았습니다.");
  return false;
};


$("#save-btn").on("click", function(e) {
  e.preventDefault();

  // 필수요소 작성 체크
  if (submitCheck()) { // 작성 완료일 경우
    const formData = new FormData();
    formData.append("title", state.title);
    formData.append("description", state.description);
    formData.append("info", JSON.stringify(state.info));

    // ingredients
    const ingres = [];
    Object.values(state.ingredient).map((value) => {
      if (value.name && value.quantity) {
        ingres.push(value);
      }
    });
    formData.append("ingredients", JSON.stringify(ingres));

    // steps
    const steps = [];
    Object.values(state.cook_step).map((value, idx) => {
      if (value.step_desc) {
        if (value.step_image instanceof Blob) {
          steps.push({ step_desc: value.step_desc, step_image: "img" });
          formData.append(`img_${idx}`, value.step_image);
        }
        else {
          steps.push(value);
        }
      }
    });
    formData.append("steps", JSON.stringify(steps));

    // images
    const imgs = [];
    Object.values(state.images.images).map((value) => {
      if (value instanceof Blob) {
        formData.append("images", value);
      } else imgs.push(value);
    });

    if (mode.method === "PUT") {
      formData.append("imgs", JSON.stringify(imgs));
    }

    // thumbnail
    formData.append("thumbnail", state.images.thumbnail);
    
    axiosWrapper(mode.method, mode.url, formData, (res) => {
      if (res.data.status === "success") {
        alert(res.data.message);
        location.href = "/";
      } else alert("오류가 발생했습니다.");
    }, (e) => {
      console.log("error: ", e);
      alert("오류가 발생했습니다.");
    });
  }
});


$("#clr-btn").on("click", function(e) {
  e.preventDefault();

  if (confirm("작성된 내용이 저장되지 않습니다. 취소하시겠습니까?")) {
    location.href = "/";
  }
});