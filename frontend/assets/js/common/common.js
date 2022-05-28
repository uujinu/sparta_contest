import { header_set } from "../user/user_profile.js";


$(document).ready(header_set);
$(document).mouseup(function (e) {
    const avatar_root = $(".avatar-root");
    const user_collapse = avatar_root.parent().next();
    if (avatar_root.has(e.target).length === 0 && user_collapse.css("display") !== "none") {
        user_collapse.css("display", "none");
    }
})