import { state } from "./recipe-elements.js";


function prvEvent(_temp, file) {
  const img = _temp.children()[0];
  const btn = _temp.children()[1];

  img.src = file instanceof Blob ? URL.createObjectURL(file) : file;
  btn.addEventListener("click", function() {
    $(this).parent().hide();
    const __temp = $(this).prev();

    __temp.removeAttr('src');
    if (__temp.attr("name") === "thumb_img") state.thumbnail = "";
    else if (__temp.attr("name") === "comp_img") {
      delete state.images.images[file.name];
    }

    if (($(this).parent().attr("class") === "prv-wrapper mti")) {
      $(this).parent().remove();
      if (!$(".mti-prv-box").children().length) {
        $(".mti-prv-wrapper").hide();
      }
    }
  })
  _temp.show();
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
        fileUploadState($(this), file);
      } else {
        alert("5장까지 첨부할 수 있습니다.");
        break;
      }
    }

    if ($(this).parent().next().children().length) {
      $(this).parent().next().show();
    }
  }
  else {
    prvEvent(_temp, files[0]);
    fileUploadState($(this), files[0]);
  }
})


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
    $(this).next().children(":last-child").on("click", function() {
      const _id = $(this).parent().prev().attr("name").split("_")[0];
      state.cook_step[_id].step_image = "";

      $(this).parent().hide();
      $(this).prev().removeAttr('src');
    })
  }
}


// 파일 업로드 state
function fileUploadState(_temp, file) {
  const name = _temp.attr("name");

  if (name === "thumbnail") {
    state.thumbnail = file;
  } else if (name === "images") {
    state.images.images[file.name] = file;
  } else { // cookStep Image
    const _id = name.split("_")[0];
    const _img = "step_image";
    state.cook_step[_id][_img] = file;
  }
}