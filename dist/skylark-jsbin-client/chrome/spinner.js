/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["skylark-jquery","../jsbin"],function(t,e){return e.spinner=function(t){"use strict";var e=t||document.createElement("canvas");if(!e.getContext)return!1;var n=e.getContext("2d"),r=null;e.height=e.width=11;var i=Math.PI/180,a=e.width,o=e.height,l=0,s=4,c=4,u=1/7;n.strokeStyle="rgba(0,0,0,.5)",n.lineWidth=1.5;var f=!0;return{element:e,start:function t(){r=window.requestAnimationFrame(t);var e=(l+=c)*u%360,h=l%360;h===e&&(f=!f,e-=1),n.fillStyle="#f9f9f9",n.strokeStyle="#111",n.fillRect(a/2-2*s,o/2-2*s,4*s,4*s),n.beginPath(),n.arc(a/2+.5,o/2+.5,s,e*i,h*i,f),n.stroke(),n.strokeStyle="#999",n.beginPath(),n.arc(a/2+.5,o/2+.5,s,h*i,e*i,f),n.stroke(),n.closePath()},stop:function(){window.cancelAnimationFrame(r)}}}});
//# sourceMappingURL=../sourcemaps/chrome/spinner.js.map
