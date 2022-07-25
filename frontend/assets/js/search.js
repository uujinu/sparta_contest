export function throttle(fn, delay) {
  let timer;
  return function() {
    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        fn.apply(this, arguments);
      }, delay);
    }
  }
};


export function debounce(fn, delay) {
  let timer;
  return function() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, arguments)
    }, delay);
  }
};


let index = 1;

export function auto_bg(li, now) {
  li.not(now).css("background", "#fff");
  now.css("background", "#e9e9e9");
};


// 마우스 hover
export function mouse_event(autodiv) {
  const li = autodiv.children();
  if (li.length) {
    $(li).hover(function(e) {
      if (autodiv.has(e.target).length && e.target.nodeName.toLowerCase() === "li") {
        auto_bg(li, $(e.target));
        index = $(e.target).index() + 1;
      }
    });
  }
};


export function search_func(input, autoli) {
  if (input.val() === "") {
    alert("검색어를 입력하세요.");
  } else {
    let _url = `search?q=${input.val()}`;
    if (autoli.length) {
      for (let i = 0; i < autoli.length; i++) {
        if (input.val() === $(autoli[i]).text()) {
          const _id = $(autoli[i]).attr("id").split("_")[1];
          _url += `&id=${_id}`;
          break;
        }
      }
      location.href = _url;
    }
  }
}

export function auto_list_select(input) {
  const autodiv = input.next();

  $(input).keydown(function(e) {
    const autoli = autodiv.find("li");
    const key = e.keyCode;
    if(key === 13) {
      search_func(input, autoli);
    }
  });
};


export function auto_list_ctrl(input, h) {
  const autoli = input.next().children(":first");

  $(input).keydown(throttle(function (e) {
    const now_input = e.target;
    const scrollBox = $(now_input).next();
    const autocomp = scrollBox.children(":first");
    const li = autocomp.children();
    const len = scrollBox.find("li").length;
    const key = e.keyCode;
    const _height = h;
    let now = autocomp.children(`:nth-child(${index})`);

    if (len > 0) {
      if (key === 40 || key === 38) {
        if (key === 40) { // 방향키 아래  
          if (index > 4) {
            const scroll = scrollBox.scrollTop();
            scrollBox.animate({scrollTop: scroll + _height}, 0);
          }
          index = index === len ? 1 : index + 1;
        } else if (key === 38) { // 방향키 위
          if (index === 1) {
            const scrollBottom = scrollBox.children(":first").height();
            scrollBox.animate({scrollTop: scrollBottom}, 0);
          } else {
            
            const scroll = scrollBox.scrollTop();
            if (scroll <= _height * index) {
              scrollBox.animate({scrollTop: scroll - _height}, 0);
            }  
          }
          index = index === 1 ? len : index - 1;
        }
        if (index === 1) {
          scrollBox.scrollTop(0);
        }
        now = autocomp.children(`:nth-child(${index})`);
        $(now_input).val(now.text());
        auto_bg(li, now);
      }
    }
  }, 0));
  mouse_event(autoli);  
};