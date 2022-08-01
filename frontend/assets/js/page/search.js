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
        axiosWrapper("GET", `/recipes/ingredients?iname=${encodeURIComponent(now_val)}`, null, (res) => {
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


// 검색 결과
function SearchResult() {
  const query_str = new URLSearchParams(location.search);
  const default_img = "https://jjbs-s3.s3.ap-northeast-2.amazonaws.com/static/profile_basic.png";
  const default_thumb = "https://jjbs-s3.s3.ap-northeast-2.amazonaws.com/static/thumb_basic.png";
  const search_span = $(".search-kw");
  const post_ul = search_span.next().children(":first");

  if (query_str.get("q")) {
    search_span.text(`'${query_str.get("q")}'에 대한 검색 결과입니다.`);

    let _url = `/recipes/search?q=${encodeURIComponent(query_str.get("q"))}`;
    if (query_str.get("id")) {
      _url += `&id=${query_str.get("id")}`;
    }
    axiosWrapper("GET", _url, null, (res) => {
      post_ul.empty();
      if (res.data.length) {
        for (let i = 0; i < res.data.length; i++) {
          const temp_html = `<li class="post-list-li">
                              <div class="post-card-box">
                                <a href="/recipe/${res.data[i].id}" class="card-link">
                                  <img src="${res.data[i].thumbnail ? res.data[i].thumbnail : default_thumb}" class="post-img">
                                </a>
                              </div>
                              <div class="post-card-info">
                                <div class="card-info-tit">${res.data[i].title}</div>
                                <div class="card-info-btm">
                                  <div class="card-info-user">
                                    <a href="/profile/${res.data[i].author.id}">
                                      <img src="${res.data[i].author.profile_image ? res.data[i].author.profile_image : default_img}">
                                      ${res.data[i].author.nickname}
                                    </a>
                                  </div>
                                  <div class="card-btm">
                                    <span><i class="bi bi-heart-fill"></i> 좋아요 ${res.data[i].likes}</span>
                                  </div>
                                </div>
                              </div>
                            </li>`;
          post_ul.append(temp_html);
        }
      } else {
        post_ul.append(`<p>검색 결과가 없습니다.</p>`);
      }
    }, (e) => {
      console.log("e: ", e);
    });
  }
};

$(document).ready(SearchResult);
$(document).ready(MainSearch);

// 자동완성 닫기
$(document).mouseup(function(e) {
  const auto_list = $("#search-box").find("ul");
  if (auto_list.has(e.target).length === 0) {
    $(".auto-comp-box").css("display", "none");
  }
});