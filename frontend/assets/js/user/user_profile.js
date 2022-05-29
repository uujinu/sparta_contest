// 현재 로그인된 사용자 get
export function current_user() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user !== null && user.id !== "")
    return user;
  return null;
};


// 헤더 세팅
export const header_set = (function() {
  const user = current_user();
  const navbar_ul = $("#navbar").children().first();
  const link = document.location.href; // 현재 url
  const idx = link.split("http://127.0.0.1:8080/")[1];

  const home_url = idx === "" ? "#hero" : "/";
  const refrige_url = idx === "" ? (user !== null ? "#refrige" : "#about") : (idx[0] === "#" ? (user !== null ? "#refrige" : "about") : "/manage/refrige");
  const search_url = idx === "" ? "#cta" : "/search";
  const recom_rul = idx === "" ? "#portfolio" : "/recipes";

  let base_header_html = `<li><a class="nav-link scrollto active" href="${home_url}">Home</a></li>
                            <li><a class="nav-link scrollto" href="${refrige_url}">나의 냉장고</a></li>
                            <li><a class="nav-link scrollto" href="${search_url}">레시피 검색</a></li>
                            <li><a class="nav-link scrollto" href="${recom_rul}">추천</a></li>` 

  if (user) { // 로그인한 상태
    const user_html = `<li class="user-li">
                        <a class="nav-link scrollto user-phone-access user-page">마이페이지</a>
                        <button class="nav-link scrollto profile-btn user-page">
                          <div class="avatar-root">
                            <img class="avatar-img" src="${user.profile_image}">
                          </div>
                        </button>
                        <div class="collapse user-collapse">
                          <div class="card card-body">
                            <ul class="collapse-ul">
                              <li class="collapse-li"><a class="collapse-a user-page" href="/manage">마이페이지</a></li>
                              <li class="collapse-li"><a class="collapse-a" href="/new-recipe">글 작성하기</a></li>
                              <li id="logout-btn" class="collapse-li"><a class="collapse-a">로그아웃</a></li>
                            </ul>
                          </div>
                        </div>
                    </li>`;
    
    base_header_html += user_html

    navbar_ul.append(base_header_html);

    // user-collapse 설정
    const avatar_root = $(".avatar-root");
    avatar_root.on("click", function(e) {
      e.preventDefault();

      const user_collapse = avatar_root.parent().next();
      if (user_collapse.css("display") === "none")
        user_collapse.css("display", "block");
      else user_collapse.css("display", "none");
    });

  } else { // 비로그인 상태
    const anonymous_html = `<li class="login-li"><a class="nav-link scrollto" href="/login">로그인</a></li>`;
    base_header_html += anonymous_html;
    navbar_ul.append(base_header_html);
  }
}());