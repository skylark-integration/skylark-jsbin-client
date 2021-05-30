/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define([],function(){var global=window;function sortci(e,t){return e.toLowerCase()<t.toLowerCase()?-1:1}function stringify(e,t){var n,i="",s={}.toString.call(e),a=[],o=[];if("[object String]"==s)i='"'+e.replace(/\n/g,"\\n").replace(/"/g,'\\"')+'"';else if("[object Array]"==s){for(i="[",n=0;n<e.length;n++)a.push(stringify(e[n],t));i+=a.join(", ")+"]"}else if("[object Object]"==s){for(n in i="{",e)o.push(n);for(o.sort(sortci),n=0;n<o.length;n++)a.push(stringify(o[n])+": "+stringify(e[o[n]],t));i+=a.join(", ")+"}"}else if("[object Number]"==s)i=e+"";else if("[object Boolean]"==s)i=e?"true":"false";else if("[object Function]"==s)i=e.toString();else if(null===e)i="null";else if(void 0===e)i="undefined";else if(void 0==t){for(n in i=s+"{\n",e)o.push(n);for(o.sort(sortci),n=0;n<o.length;n++)a.push(o[n]+": "+stringify(e[o[n]],!0));i+=a.join(",\n")+"\n}"}else try{i=e+""}catch(e){}return i}function addEvent(e,t){window.addEventListener?window.addEventListener(e,t,!1):window.attachEvent("on"+e,t)}function cleanPath(e){return(""+e).replace(/[^a-z0-9\/]/gi,"")}function error(e,t){var n=JSON.stringify({response:e.message,cmd:t,type:"error"});global.remoteWindow?global.remoteWindow.postMessage(n,origin):queue.push(n)}var store=function(){var useSS;try{sessionStorage.getItem("foo"),useSS=!0}catch(e){}return{set:function(e){var t=stringify(e);return useSS?sessionStorage.spike=t:window.name=t,t},get:function(){var rawData=useSS?sessionStorage.spike:window.name,data;if(!useSS&&1==window.name||!rawData)return data;try{eval("data = "+rawData)}catch(e){}return data}}}();function restore(){var e=store.get()||{};addEvent("load",function(){window.scrollTo(e.x,e.y)})}function reload(e){store.set({y:window.scrollY,x:window.scrollX}),window.location.reload()}function renderStream(){es.addEventListener("css:processed",function(e){var t=document.getElementById("jsbin-css");t.styleSheet?t.styleSheet.cssText=e.data:t.innerHTML=e.data}),es.addEventListener("reload",reload),es.addEventListener("bump-revision",function(e){window.location.pathname=cleanPath(e.data)}),es.addEventListener("javascript:processed",reload),es.addEventListener("html:processed",reload)}function codecastStream(){if(jsbin&&jsbin.panels&&jsbin.panels.panels){var e=jsbin.panels.panels;es.addEventListener("bump-revision",function(e){window.location.pathname=cleanPath(e.data)+"/edit"}),es.addEventListener("css",t),es.addEventListener("javascript",t),es.addEventListener("html",t)}function t(t){var n=t.type;if(e[n]){var i=e[n].editor.getCursor();e[n].setCode(t.data),e[n].editor.setCursor(i)}}}function isCodeCasting(){var e=location.pathname;return"/edit"===e.slice(-1*"/edit".length)||"/watch"===e.slice(-1*"/watch".length)}var id=location.pathname.replace(/\/(preview|edit|watch).*$/,""),codecasting=isCodeCasting();function startStream(){if(es=new EventSource(id+"?"+Math.random()),codecasting?codecastStream():renderStream(),window.jQuery){var e=$(document);es.addEventListener("stats",function(t){e.trigger("stats",[t.data])})}return es}function handleVisibility(e,t){var n="hidden"in document?"hidden":"webkitHidden"in document?"webkitHidden":"mozHidden"in document?"mozHidden":null;if("visibilityState"in document?"visibilityState":"webkitVisibilityState"in document?"webkitVisibilityState":"mozVisibilityState"in document?"mozVisibilityState":null){var i=n.replace(/hidden/i,"visibilitychange");document.addEventListener(i,function(){document[n]?e.close():e=t()})}}queue=[],msgType="",useSS=!1,es=null,setTimeout(function(){es&&es.close(),es=startStream(),handleVisibility(es,startStream)},500),codecasting||(addEvent("error",function(e){error({message:e.message},e.filename+":"+e.lineno)}),restore())});
//# sourceMappingURL=sourcemaps/spike.js.map
