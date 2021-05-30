/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["skylark-jquery","../jsbin"],function(e,a){e("form.login").submit(function(a){"use strict";a.preventDefault();var n=e(this),t=n.find("input[name=username]").val(),i=n.find("input[name=password]").val(),s=n.find("input[name=email]").val(),o=n.find(".loginFeedback");o.show().text("Checking..."),e.ajax({url:n.attr("action"),data:{username:t,key:i,email:s},type:"POST",dataType:"json",complete:function(a){var n=e.parseJSON(a.responseText)||{};200===a.status?(n.avatar&&e("a.avatar").find("img").remove().end().prepend('<img src="'+n.avatar+'">'),n.message?o.text(n.message):window.location=window.location.pathname+window.location.search):(analytics.login(!1),o.text(n.message||'"'+t+'" has already been taken. Please either double check the password, or choose another username.'))}})})});
//# sourceMappingURL=../sourcemaps/chrome/login.js.map
