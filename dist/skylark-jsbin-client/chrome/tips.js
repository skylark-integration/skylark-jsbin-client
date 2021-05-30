/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["skylark-jquery","../jsbin"],function(t,n){var e,o=t(document.documentElement),i=t("#tip"),s=t("p",i),u=function(n){o.removeClass("showtip"),i.removeClass(),s.html(""),t(window).resize(),n&&setTimeout(n,0)},c=function(t){clearTimeout(e),s.html(t.content),i.removeClass().addClass(t.type||"info"),o.addClass("showtip"),t.autohide&&(e=setTimeout(function(){u()},parseInt(t.autohide,10)||5e3))};n.$document.on("tip",function(t,n){var e=n;if("string"==typeof n&&((e={}).content=n,e.type="info"),s.html()===e.content&&i.hasClass(e.type))return c(n);u(function(){c(e)})}),t("#tip").on("click","a.dismiss",function(){return u(),!1}),n.$document.keydown(function(t){27==t.which&&u()})});
//# sourceMappingURL=../sourcemaps/chrome/tips.js.map
