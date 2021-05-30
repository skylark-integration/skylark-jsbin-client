/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["skylark-jquery","../jsbin"],function(t,e){var n=t("a.transfer").on("click",function(n){n.preventDefault();var r=prompt("Enter the username to transfer this bin to");(r=(r||"").trim().toLowerCase()).length&&t.ajax({url:e.getURL({withRevision:!0})+"/transfer",method:"post",data:{to:r,_csrf:e.state.token},success:function(){window.location.reload()},error:function(t){console.log(t),403===t.status?alert("This bin cannot be transferred as you do not own it."):400===t.status?alert('The user "'+r+"\" couldn't be found, sorry."):alert("Failed to transfer bin")}})});return function(){e.owner()?n.show():n.hide()}});
//# sourceMappingURL=../sourcemaps/chrome/transfer.js.map
