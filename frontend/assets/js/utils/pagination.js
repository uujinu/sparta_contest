export function page_select() {
  const page_nav = $("#page-nav");
  const nav_li = page_nav.find("a");

  nav_li.on("click", function() {
    const _label = $(this).attr("aria-label");

    if (_label !== "Previous" && _label !== "Next") {
      const _bgcolor = $(nav_li[0]).css("background-color");
      
      for (let i = 1; i < nav_li.length - 1; i++) {
        const now = $(nav_li[i]);
        now.css("background-color", _bgcolor);
        now.parent().removeClass("disabled");
      }
      $(this).css("background-color", "#e9ecef");
      $(this).parent().toggleClass("disabled");
    }
  });
};


export function init_nav(nav_ul, _page_num, _page = undefined) {
  const page_idx = 5;

  let _hash = _page ? _page : location.hash ? parseInt(location.hash.split("#")[1]) : 1;
  const _start = parseInt((_hash - 1) / page_idx) * page_idx + 1;
  const _prev = _start === 1 ? "" : _start - 1;
  const _next = _start + page_idx > _page_num ? "" : _start + page_idx;

  nav_ul.empty();
  const pre_html = `<li class="page-item prev disabled">
                      <a class="page-link" href="#${_prev}" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                      </a>
                    </li>`;
  const next_html = `<li class="page-item next disabled">
                      <a class="page-link" href="#${_next}" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                      </a>
                    </li>`;
  nav_ul.append(pre_html);
  
  for (let i = _start; (i < _start + page_idx && i <= _page_num); i++) {
    nav_ul.append(`<li class="page-item"><a class="page-link" href="#${i}">${i}</a></li>`);
    if (_hash === i) {
      const now = nav_ul.children().last(); 
      now.toggleClass("disabled");
      now.children(":first").css("background", "#e9ecef");
    }
  }
  nav_ul.append(next_html);

  const nav_li = nav_ul.children();

  if (_prev !== "") $(nav_li[0]).toggleClass("disabled");
  if (_next !== "") $(nav_li.last()).toggleClass("disabled");

  page_select();
};