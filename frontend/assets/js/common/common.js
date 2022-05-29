import { header_set } from "../user/user_profile.js";
import { main_set } from "../page/main.js";
import { refrige_controller } from "../user/user_refrige.js";


$(document).ready(main_set);
$(document).ready(refrige_controller);

$(document).ready(header_set);
$(document).mouseup(function (e) {
    const avatar_root = $(".avatar-root");
    const user_collapse = avatar_root.parent().next();
    if (avatar_root.has(e.target).length === 0 && user_collapse.css("display") !== "none") {
        user_collapse.css("display", "none");
    }
})