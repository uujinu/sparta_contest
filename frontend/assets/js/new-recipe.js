import { state } from "./recipe-elements.js";


/**********************************
 *  필수 문항 작성 체크 
 * ********************************/
function submitCheck() {
  const check = state.title && state.description && state.portion_info && state.time_info && state.degree_info;
  let ingre = false;
  let step = false;
  console.log("check: ", check);

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
  console.log("steps: ", step);


  // 필수 요소 입력 확인
  if (check && ingre && step) {
    alert("입력이 완료되었습니다.");
    return true;   
  } 
  alert("입력이 완료되지 않았습니다.");
  return false;
}

$("#save-btn").on("click", function(e) {
  e.preventDefault();

  // 필수요소 작성 체크
  if (submitCheck()) { // 작성 완료일 경우
    
  } else {  // 미완료일 경우

  }

  console.log("state: ", state);
});