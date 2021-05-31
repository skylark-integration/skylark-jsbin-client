/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["../jsbin"],function(e){var t={todo:{html:!1,css:!1,javascript:!1},_inprogress:!1,inprogress:function(e){if(void 0===e)return t._inprogress;if(t._inprogress=e,!1===e){var n=["html","css","javascript"],s=function(){var e=n.pop();e&&t.todo[e]?(t._inprogress=!0,m(e,s),t.todo[e]=!1):e&&s()};s()}}};function n(t){var s=e.panels.panels.html.getCode(),a="";return-1===s.indexOf("<"+t)?a:"title"!==t&&"meta"!==t?(console.error("getTagContent for "+t+" is not supported"),a):(s.replace(n.re[t],function(e,n,s){a="title"===t?n:s}),a)}n.re={meta:/(<meta name="description" content=")([^"]*)/im,title:/<title>(.*)<\/title>/im},$("a.save").click(function(t){t.preventDefault(),analytics.milestone();var n=!0;return!0===e.saveDisabled&&(n=!1),(e.state.changed||e.mobile||!e.owner())&&g("save",n),!1});var s=$("#share .link"),a=$("#sharemenu #sharepanels input"),i=$("#sharemenu .share-split").length;function o(){"use strict";if(!i){var t={live:"output",javascript:"js",css:"css",html:"html",console:"console"},n=a.filter(":checked").map(function(){return t[this.getAttribute("data-panel")]}).get().join(",");s.each(function(){var t=this.getAttribute("data-path"),s=e.getURL({withRevision:!0})+t+(n&&"livepreview"!==this.id?"?"+n:""),a=this.nodeName,i=panels.getHighlightLines();i&&(i="#"+i),"A"===a?this.href=s:"INPUT"===a?(this.value=s,"/edit"===t&&(this.value+=i)):"TEXTAREA"===a&&(this.value=('<a class="jsbin-embed" href="'+s+i+'">'+documentTitle+'</a><script src="'+e.static+'/js/embed.js"><\/script>').replace(/<>"&/g,function(e){return{"<":"&lt;",">":"&gt;",'"':"&quot;","&":"&amp;"}[e]}))})}}$("#sharemenu").bind("open",o),$("#sharebintype input[type=radio]").on("click",function(){"snapshot"===this.value&&(e.state.checksum=!1,d=!1),o()});var r=null;function c(t,s){if(!s||"html"===s.panelId){var a=e.panels.panels.html.getCode();if(r!==a){r=a;var i=n("meta");i!==e.state.description&&(e.state.description=i,e.state.updateSettings({description:i}));var o=n("title");o!==e.state.title&&(e.state.title=o,e.state.updateSettings({title:o}),documentTitle=o,documentTitle?document.title=documentTitle+" - "+e.name:document.title=e.name)}}}$document.on("saveComplete",c),$document.on("saved",function(){e.state.changed=!1,o(),$('#sharebintype input[type=radio][value="realtime"]').prop("checked",!0),s.closest(".menu").removeClass("hidden"),$("#jsbinurl").attr("href",e.getURL()).removeClass("hidden"),$("#clone").removeClass("hidden"),c()});var d=e.state.checksum||store.sessionStorage.getItem("checksum")||!1;function l(e,t){413===e.status?($("#tip p").html("Sorry this bin is too large for us to save"),$(document.documentElement).addClass("showtip")):403===e.status?$document.trigger("tip",{type:"error",content:"I think there's something wrong with your session and I'm unable to save. <a href=\""+window.location+'"><strong>Refresh to fix this</strong></a>, you <strong>will not</strong> lose your code.'}):t&&(t&&p[t].text("Saving...").animate({opacity:1},100),window._console.error({message:"Warning: Something went wrong while saving. Your most recent work is not saved."}))}if(e.state.checksum=d,d?$("#share div.disabled").removeClass("disabled").unbind("click mousedown mouseup"):$("#share div.disabled").one("click",function(e){e.preventDefault(),$("a.save").click()}),$document.one("saved",function(){$("#share div.disabled").removeClass("disabled").unbind("click mousedown mouseup")}),e.saveDisabled)$document.one("jsbinReady",function(){"use strict";var t=!1;e.embed||e.sandbox||$document.on("codeChange.live",function(n,s){if(!s.onload&&!t&&"setValue"!==s.origin){t=!0;var a=-1!==navigator.userAgent.indexOf(" Mac "),i=a?"⌘":"ctrl",o=a?"⇧":"shift",r=a?"":"+";$document.trigger("tip",{type:"notification",content:'You\'re currently viewing someone else\'s live stream, but you can <strong><a class="clone" href="'+e.root+'/clone">clone your own copy</a></strong> ('+i+r+o+r+"S) at any time to save your edits"})}})});else{$(".code.panel .label .name").append('<span class="saved">Saved</span>');var p={html:$(".panel.html .name span.saved"),javascript:$(".panel.javascript .name span.saved"),css:$(".panel.css .name span.saved")};$document.bind("jsbinReady",function(){e.state.changed=!1,e.panels.allEditors(function(t){t.on("processor",function(){e.root!==e.getURL()&&$document.trigger("codeChange",[{panelId:t.id}])})}),$document.bind("codeChange",function(t,n){e.state.changed=!0,p[n.panelId]&&p[n.panelId].css({opacity:0}).stop(!0,!0)}),$document.bind("saveComplete",throttle(function(e,t){p[t.panelId].text("Saved").stop(!0,!0).animate({opacity:1},100).delay(1200).animate({opacity:0},500)},500)),$document.bind("codeChange",throttle(function(n,s){if(s.panelId&&!e.state.deleted){var a=s.panelId;e.panels.savecontent(),t.inprogress()?t.todo[a]=!0:(t.inprogress(!0),d&&e.state.code?m(a):g("save",!0))}},3e4))})}function u(e,t){t.compressed=e,e.split(",").forEach(function(e){t[e]=LZString.compressToUTF16(t[e])})}function m(n,s){var a={};e.state.processors&&(a.processors=e.state.processors);var i={code:e.state.code,revision:e.state.revision,method:"update",panel:n,content:editors[n].getCode(),checksum:d,settings:JSON.stringify(a)};e.settings.useCompression&&"http:"===location.protocol&&u("content",i),e.state.processors[n]&&e.state.processors[n]!==n&&e.state.cache[n]&&(i.processed=e.state.cache[n].result),$.ajax({url:e.getURL({withRevision:!0})+"/save",data:i,type:"post",dataType:"json",headers:{Accept:"application/json"},success:function(t){$document.trigger("saveComplete",{panelId:n}),t.error?g("save",!0,function(){}):e.state.latest=!0},error:function(e){l(e,n)},complete:function(){t.inprogress(!1),s&&s()}})}function h(t){return t.preventDefault(),e.panels.save(),analytics.clone(),v("save,new").submit(),!1}function v(t){var n=$("form#saveform").empty().append('<input type="hidden" name="javascript" />').append('<input type="hidden" name="html" />').append('<input type="hidden" name="css" />').append('<input type="hidden" name="method" />').append('<input type="hidden" name="_csrf" value="'+e.state.token+'" />').append('<input type="hidden" name="settings" />').append('<input type="hidden" name="checksum" />'),s={};return e.state.processors&&(s.processors=e.state.processors),"welcome"===e.state.code&&n.attr("action","/save"),n.find("input[name=settings]").val(JSON.stringify(s)),n.find("input[name=javascript]").val(editors.javascript.getCode()),n.find("input[name=css]").val(editors.css.getCode()),n.find("input[name=html]").val(editors.html.getCode()),n.find("input[name=method]").val(t),n.find("input[name=checksum]").val(e.state.checksum),n}function g(n,s,a){var o=v(n);e.panels.save(),e.panels.saveOnExit=!0;var r=o.serializeArray().reduce(function(e,t){return e[t.name]=t.value,e},{});e.settings.useCompression&&u("html,css,javascript",r),s?$.ajax({url:e.getURL({withRevision:!0})+"/save",data:r,dataType:"json",type:"post",headers:{Accept:"application/json"},success:function(t){if(a&&a(t),store.sessionStorage.setItem("checksum",t.checksum),d=t.checksum,e.state.checksum=d,e.state.code=t.code,e.state.revision=t.revision,e.state.latest=!0,e.state.metadata={name:e.user.name},o.attr("action",e.getURL({withRevision:!0})+"/save"),window.history&&window.history.pushState){var n=panels.getHighlightLines();n&&(n="#"+n);var s=panels.getQuery();s&&(s="?"+s),window.history.pushState(null,"",e.getURL({withRevision:!i})+"/edit"+s+n),store.sessionStorage.setItem("url",e.getURL({withRevision:!i}))}else window.location.hash=t.edit;$document.trigger("saved")},error:function(e){l(e,null)},complete:function(){t.inprogress(!1)}}):o.submit()}$("a.clone").click(h),$("#tip").delegate("a.clone","click",h)});
//# sourceMappingURL=../sourcemaps/chrome/save.js.map