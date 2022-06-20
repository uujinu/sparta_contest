import { state } from "./recipe-elements.js";


export function prvEvent(_temp, file) {
  const img = _temp.children()[0];
  const btn = _temp.children()[1];

  img.src = file instanceof Blob ? URL.createObjectURL(file) : file;
  btn.addEventListener("click", function() {
    $(this).parent().hide();
    const __temp = $(this).prev();

    __temp.removeAttr("src");
    if (__temp.attr("name") === "thumb_img") state.thumbnail = "";
    else if (__temp.attr("name") === "comp_img") {
      if (file instanceof Blob) {
        delete state.images.images[file.name];
      } else {
        delete state.images.images[file];
      }
    }

    if (($(this).parent().attr("class") === "prv-wrapper mti")) {
      $(this).parent().remove();
      if (!$(".mti-prv-box").children().length) {
        $(".mti-prv-wrapper").hide();
      }
    }
  });
  _temp.show();
};


export function multi_file(_prv, _temp, files) {
  for (const file of files) {
    const __temp = _temp.children(); 
    if (__temp.length < 5) { // 5장까지만 첨부
      const html = `<div class="prv-wrapper mti">
                      <img class="prv-img" name="comp_img">
                      <span class="prv-d-btn"><i class="bi bi-x-circle-fill"></i></span>
                    </div>`;
      _temp.append(html);
      prvEvent(_temp.children(":last-child"), file); // 이벤트 등록

      // state 변화
      fileUploadState(_prv, file);
    } else {
      alert("5장까지 첨부할 수 있습니다.");
      break;
    }
  }

  if (_prv.parent().next().children().length) {
    _prv.parent().next().show();
  }
}


$(".upload-file").change(function(e) {
  const files = e.target.files;
  const len = files.length;
  let multi = false;
  if (len === 0) {
    return;
  }

  let _temp = $(this).next();
  if ($(this).attr("id") === "images") { // 멀티이미지 업로드
    _temp = $(this).parent().next().find("div.mti-prv-box");
    multi = true;
  }

  if (multi) {
    multi_file($(this), _temp, files);
  }
  else {
    prvEvent(_temp, files[0]);
    fileUploadState($(this), files[0]);
  }
});


export function step_prv_btn(btn) {
  btn.on("click", function() {
    const _id = $(this).parent().prev().attr("name").split("_")[0];
    state.cook_step[_id].step_image = "";

    $(this).parent().hide();
    $(this).prev().removeAttr("src");
  });
}


// 조리 순서에 대한 input 이벤트
export function inputEvent(e) {
  const files = e.target.files;
  const len = files.length;
  const name = e.target.name;
  if (len === 0) return;

  if (len === 1) {
    const img= $(this).next().children()[0];
    const _id = name.split("_")[0];
    state.cook_step[_id].step_image = files[0];

    img.src = files[0] instanceof Blob ? URL.createObjectURL(files[0]) : files[0];
    $(this).next().show();
    
    // 프리뷰 삭제 버튼 이벤트
    step_prv_btn($(this).next().children(":last-child"));
  }
}


// 파일 업로드 state
function fileUploadState(_temp, file) {
  const name = _temp.attr("name");

  if (name === "thumbnail") {
    state.images.thumbnail = file;
  } else if (name === "images") {
    if (file instanceof Blob) {
      state.images.images[file.name] = file;
    } else {
      state.images.images[file] = file;
    }
  } else { // cookStep Image
    const _id = name.split("_")[0];
    const _img = "step_image";
    state.cook_step[_id][_img] = file;
  }
};