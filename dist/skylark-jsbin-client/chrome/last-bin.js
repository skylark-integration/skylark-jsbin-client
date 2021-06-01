/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["skylark-jquery","../jsbin"],function(e,t){"use strict";function n(){var e,t=window.location.href;document.cookie=t?"last="+encodeURIComponent(t)+"; expires="+((e=new Date).setTime(+e+36e5),e.toUTCString())+"; path=/":'last=""; expires=-1; path=/'}var o,r;t&&t.getURL?(t.$document.on("saved",n),n()):(o=document.getElementById("back"),r=function(e){for(var t=e+"=",n=document.cookie.split(";"),o=0;o<n.length;o++){for(var r=n[o];" "==r.charAt(0);)r=r.substring(1,r.length);if(0==r.indexOf(t))return r.substring(t.length,r.length)}return null}("last"),o&&null!==r&&"%2Fedit"!==r&&(o.href=decodeURIComponent(r)))});
//# sourceMappingURL=../sourcemaps/chrome/last-bin.js.map
