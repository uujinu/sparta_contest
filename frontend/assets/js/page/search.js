import { axiosWrapper } from "../utils/axios_helper.js";
import { throttle, mouse_event, search_func, auto_list_select, auto_list_ctrl } from "../search.js"
import { init_nav } from "../utils/pagination.js";


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


// 레시피 붙이는 함수
export function recipe_pagination(post_ul, start, end, data) {
  const default_img = "https://jjbs-s3.s3.ap-northeast-2.amazonaws.com/static/profile_basic.png";
  const default_thumb = "https://jjbs-s3.s3.ap-northeast-2.amazonaws.com/static/thumb_basic.png";
  const len = data.length;

  for (let i = start; i < len && i < end; i++) {
    const temp_html = `<li class="post-list-li">
                        <div class="post-card-box">
                          <a href="/recipe/${data[i].id}" class="card-link">
                            <img src="${data[i].thumbnail ? data[i].thumbnail : default_thumb}" class="post-img">
                          </a>
                        </div>
                        <div class="post-card-info">
                          <div class="card-info-tit">${data[i].title}</div>
                          <div class="card-info-btm">
                            <div class="card-info-user">
                              <a href="/profile/${data[i].author.id}">
                                <img src="${data[i].author.profile_image ? data[i].author.profile_image : default_img}">
                                ${data[i].author.nickname}
                              </a>
                            </div>
                            <div class="card-btm">
                              <span><i class="bi bi-heart-fill"></i> 좋아요 ${data[i].likes}</span>
                            </div>
                          </div>
                        </div>
                      </li>`;
    post_ul.append(temp_html);
  }
};


// nav 버튼 클릭 이벤트
function nav_event(page_num, post_ul, data, m_nav_ul = undefined) {
  const nav_ul = m_nav_ul ? m_nav_ul : $(".pagination");
  const nav_li = nav_ul.find("a");
  const idx = 30;

  nav_li.on("click", function(e) {
    post_ul.empty();
    const _label = $(this).attr("aria-label"); 
    const _page = parseInt($(this).attr("href").substring(1)); 
    const start = (_page - 1) * idx;
    const end = start + idx;

    if (_label === "Previous" || _label === "Next") {
      init_nav(nav_ul, page_num, _page);
      recipe_pagination(post_ul, start, end, data)
    } else {
      recipe_pagination(post_ul, start, end, data);
    }
  });
};


export function recipe_init(post_ul, data, page_num, m_nav_ul = undefined) {
  const nav_ul = m_nav_ul ? m_nav_ul : $(".pagination");
  const nav_li = nav_ul.find("a");
  const idx = 30;

  nav_li.on("click", function(e) {
    post_ul.empty();
    const _label = $(this).attr("aria-label"); 
    const _page = parseInt($(this).attr("href").substring(1)); 
    const start = (_page - 1) * idx;
    const end = start + idx;

    if (_label === "Previous" || _label === "Next") {
      init_nav(nav_ul, page_num, _page);
      recipe_pagination(post_ul, start, end, data);
      nav_event(page_num, post_ul, data, nav_ul);
    } else {
      recipe_pagination(post_ul, start, end, data);
    }
  });
};


// 검색 결과
function SearchResult() {
  const query_str = new URLSearchParams(location.search);
  const search_span = $(".search-kw");
  const post_ul = search_span.next().children(":first");
  const idx = 30;
  const nav_ul = $(".pagination");

  if (query_str.get("q")) {
    search_span.text(`'${query_str.get("q")}'에 대한 검색 결과입니다.`);
    const _page = location.hash ? parseInt(location.hash.substring(1)) : 1;

    let _url = `/recipes/search?q=${encodeURIComponent(query_str.get("q"))}`;
    if (query_str.get("id")) {
      _url += `&id=${query_str.get("id")}`;
    }
    axiosWrapper("GET", _url, null, (res) => {
      const _page_num = (res.data.length % idx) ? parseInt(res.data.length / idx) + 1 : parseInt(res.data.length / idx);
      post_ul.empty();

      init_nav(nav_ul, _page_num);
      nav_ul.on("click", function() {
        recipe_init(post_ul, res.data, _page_num);
      });

      if (res.data.length) {
        const start = (_page - 1) * idx;
        const end = start + idx;
        recipe_pagination(post_ul, start, end, res.data);
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