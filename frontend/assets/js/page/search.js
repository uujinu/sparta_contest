import { axiosWrapper } from "../utils/axios_helper.js";
import { throttle, mouse_event, search_func, auto_list_select, auto_list_ctrl } from "../search.js"


// 검색어 자동완성 선택(클릭)
function search_li_select(autodiv) {
  const li = autodiv.children();
  if (li.length) {
    $(li).on("click", function(e) {
      const now = $(e.target);
      const _id = now.attr("id").split("_")[1];
      location.href = `search?q=${now.text()}&id=${_id}`;
    });
  }
};


// 검색 버튼 클릭
function search_btn() {
  const btn = $("#search-box").find("button");
  const input = btn.prev().children(":first");
  btn.on("click", function(e) {
    const autoli = input.next().find("li");
    search_func(input, autoli);
  });
};


// 검색어 자동완성
function search_auto() {
  const autocomp = $(".auto-comp-box");
  const input = autocomp.prev();

  input.on("propertychange change keyup paste input click", function(e) {
    const now_val = $(this).val();
    const auto_div = autocomp.children(":first");
    const key = e.keyCode;

    if (now_val.length && (key !== 40 && key !== 38 && key !==13)) {
      throttle(
        axiosWrapper("GET", `/recipes/search?iname=${encodeURIComponent(now_val)}`, null, (res) => {
          auto_div.empty();
          const ingre_list = res.data;
          let temp_html = "";

          for (let i = 0; i < ingre_list.length; i++) {
            temp_html += `<li id="ingre_${ingre_list[i][0]}">${ingre_list[i][1]}</li>`;
          }

          if (temp_html !== "") {
            autocomp.css("display", "block");
            auto_div.append(temp_html);
          } else autocomp.css("display", "none");
          mouse_event(auto_div);
          search_li_select(auto_div);

        }, (e) => {
          console.log("e: ", e);
        }), 500);
    }
  });
};


// 메인페이지 search
function MainSearch() {
  const _input = $("#search-box").find("input");
  search_auto();
  auto_list_select(_input);
  auto_list_ctrl(_input, 28);
  search_btn();
};

$(document).ready(MainSearch);

// 자동완성 닫기
$(document).mouseup(function(e) {
  const auto_list = $("#search-box").find("ul");
  if (auto_list.has(e.target).length === 0) {
    $(".auto-comp-box").css("display", "none");
  }
});