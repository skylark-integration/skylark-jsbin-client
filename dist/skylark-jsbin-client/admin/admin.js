/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["skylark-jquery","../jsbin"],function(t,e){"use strict";t("#flag-bin").submit(function(e){e.preventDefault();var a=t(this),s=a.find("input[name=bin]").val(),n=a.find("input[name=_csrf]"),i=a.find(".responseFeedback"),u=new RegExp("(?:https*:\\/\\/"+window.host+"\\/)*([\\w\\d-_]+)\\/*(\\d+)*\\/*.*","i"),r=s.match(u),l=r[1]||"",c=r[2]||"latest";i.show().text("Checking..."),t.ajax({url:a.attr("action"),data:{bin:l,rev:c,_csrf:n.val()},type:"POST",dataType:"json",complete:function(e){var a=t.parseJSON(e.responseText)||{};200===e.status&&i.show().text("Bin flagged succesfully"),400===e.status&&a.all&&i.show().text(a.all)}})}),t("#flag-user, #validate-user").submit(function(e){e.preventDefault();var a=t(this),s=a.find("input[name=username]").val(),n=a.find("input[name=_csrf]"),i=a.find(".responseFeedback");i.show().text("Checking..."),t.ajax({url:a.attr("action"),data:{username:s,_csrf:n.val()},type:"POST",dataType:"json",complete:function(e){var a=t.parseJSON(e.responseText)||{};200===e.status&&i.show().text("Update succesful"),400===e.status&&a.all&&i.show().text(a.all)}})})});
//# sourceMappingURL=../sourcemaps/admin/admin.js.map
