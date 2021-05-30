/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["skylark-jquery","../jsbin"],function(e,t){var n,o=function(e){var n=e.getElementsByTagName("head")[0],o="#output li, #exec, .fakeInput, .fakeInput:before, #exec:before, #bin .editbox .CodeMirror, .mobile .editbox textarea",a=t.settings.font||14;function r(t){var a=o+"{ font-size: "+t+"px; }",r=e.createElement("style");r.type="text/css",r.styleSheet?r.styleSheet.cssText=a:r.appendChild(e.createTextNode(a)),n.appendChild(r)}if(Object.defineProperty&&t.settings)try{Object.defineProperty(t.settings,"font",{configurable:!0,enumerable:!0,get:function(){return a},set:function(e){r(a=1*e)}})}catch(e){}return r(a),r}(document);function a(e){var t=document.createElement("style");t.innerHTML=e,document.head.appendChild(t)}try{(n=window.localStorage.getItem("fonts"))&&("a3a02e450f1f79f4c3482279d113b07e"===(n=JSON.parse(n)).md5?a(n.value):(window.localStorage.removeItem("fonts"),n=null))}catch(e){return}return n||window.addEventListener("load",function(){var e=new XMLHttpRequest,n=t.static+"/css/fonts.a3a02e450f1f79f4c3482279d113b07e.woff.json?"+t.version;e.open("GET",n,!0),e.onload=function(){if(200==this.status)try{a(JSON.parse(this.response).value),window.localStorage.setItem("fonts",this.response)}catch(e){}},e.send()}),t.font=o});
//# sourceMappingURL=../sourcemaps/chrome/font.js.map
