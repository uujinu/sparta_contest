import { state } from "./recipe-elements.js";


/**********************************
 *  필수 문항 작성 체크 
 * ********************************/
function submitCheck() {
  const check = state.title && state.description && state.portion_info && state.time_info && state.degree_info;
  let ingre = false;
  let step = false;

  // 재료 입력 확인
  const ingres = state.ingredient;
  if (Object.keys(ingres).length) {
    Object.keys(ingres).map((keys) => {
      if (ingres[keys].name && ingres[keys].quantity)
        ingre = true;
    });
  }

  // 과정 입력 확인
  const steps = state.cook_step;
  if (Object.keys(steps).length) {
    Object.keys(steps).map((keys) => {
      if (steps[keys].description) step = true;
      else {
        if (Object.keys(steps[keys].stepImage).length) step = false;
      }
    });
  }

  // 필수 요소 입력 확인
  if (check && ingre && step) return true;
  return false;
}