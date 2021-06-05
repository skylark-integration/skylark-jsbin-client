/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["skylark-jquery","../jsbin"],function(t,e){var s={save:function(s){localStorage.setItem("settings",JSON.stringify(e.settings)),s||(s=function(){}),t.ajax({url:"/account/editor",type:"POST",dataType:"json",data:{settings:localStorage.settings,_csrf:e.state.token},success:function(){console&&console.log&&console.log("settings saved"),s(!0)},error:function(t,e){s(!1)}})}};return e.chrome.settings=s});
//# sourceMappingURL=../sourcemaps/chrome/settings.js.map
