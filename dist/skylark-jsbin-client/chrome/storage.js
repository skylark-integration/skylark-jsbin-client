/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["skylark-jquery","../jsbin"],function(e,n){function t(e){try{return e in window&&null!==window[e]}catch(e){return!1}}var o,i,r,a,l,s=!1;return t("sessionStorage")?o=window.sessionStorage:(s=!0,r=window.name?JSON.parse(window.name):{},a=Object.keys(r),l={key:function(e){return Object.keys(r)[e]||null},length:a.length,clear:function(){r={},window.name="",l.length=0},getItem:function(e){return r[e]||null},removeItem:function(e){delete r[e],window.name=JSON.stringify(r),l.length--},setItem:function(e,n){r[e]=n,window.name=JSON.stringify(r),l.length++}},a.forEach(function(e){l[e]=r[e]}),o=l),t("localStorage")?t("localStorage")&&(i=window.localStorage):i=e.extend({},o),!n.embed&&s&&(e(document).one("jsbinReady",function(){e(document).trigger("tip",{type:"error",content:"JS Bin uses cookies to protect against CSRF attacks, so with cookies disabled, you will not be able to save your work"})}),n.saveDisabled=!0,n.sandbox=!0),{polyfill:s,sessionStorage:o,localStorage:i}});
//# sourceMappingURL=../sourcemaps/chrome/storage.js.map
