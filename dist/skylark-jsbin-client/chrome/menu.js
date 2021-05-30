/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["skylark-jquery","../jsbin"],function(e,t){if("dataset"in document.createElement("i")){var o=e("#control"),s=e("#menuinfo p"),a=-1!==navigator.userAgent.indexOf(" Mac "),n=/ctrl/g;o.delegate("[data-desc]","mouseover mouseout",function(e){if("mouseover"===e.type){var t=this.dataset;if(void 0!==t.desc){var o="";t.shortcut&&(o+="<code>[",o+=a?t.shortcut.replace(n,"cmd"):t.shortcut,o+="]</code>"),o+=" "+t.desc,s.html(o),$body.addClass("menuinfo")}}else $body.removeClass("menuinfo")})}});
//# sourceMappingURL=../sourcemaps/chrome/menu.js.map
