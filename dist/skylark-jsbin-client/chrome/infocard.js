/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["skylark-jquery","skylark-jsbin-chrome/hideOpen","skylark-jsbin-chrome/spinner","skylark-jsbin-chrome/prettyDate","skylark-jsbin-coder/editors/panels","../jsbin","./analytics"],function(t,e,n,i,s,a,o){if("EventSource"in window)return r();function r(){"use strict";if(!a.embed){var r=t("#infocard"),c=r.find("header"),d=c.find("canvas")[0],u=n(d),l=s.named.html,m=0,f=null,p={head:/<head(.*)\n/i,meta:/(<meta name="description" content=")([^"]*)/im,title:/<title>(.*)<\/title>/im};0!==r.length&&(r.find(".settings")&&(r.find("#title").on("input",function(){b("title");var t=l.getCode(),e=this.value;g(t.replace(p.title,function(t,n){return"<title>"+e.replace(/</g,"&lt;").replace(/>/g,"&gt;")+"</title>"})),a.state.updateSettings({title:this.value})}),r.find("#description").on("input",function(){b("meta");var t=l.getCode(),e=this.value;g(t.replace(p.meta,function(t,n){return n+e.replace(/"/g,"&quot;")})),a.state.updateSettings({description:this.value})})),function(){function n(){var e={};r.find(".row").each(function(){t(this).find('[name="header-value"]').val().trim()&&(e[t(this).find("input:first").val()]=t(this).find("input:last").val())}),a.state.updateSettings({headers:e},"PUT")}t("a.more").add(c).on("mousedown touchstart",function(t){var n;infocardVisible=!infocardVisible,e(),t.preventDefault(),o.infocard("click","no-result"),r.toggleClass(function(t,e){return n=-1===e.indexOf("open")?"open":"close",infocardVisible="open"===n,"open"}).trigger(n)}),r.one("open",function(){var e=t("#status").data("status")||200;t.getJSON(a.static+"/js/http-codes.json",function(n){var i="";n.forEach(function(t){i+='<option value="'+t.code+'">'+t.string+"</option>"}),t("#status").html(i).val(e).on("change",function(){a.state.updateSettings({statusCode:this.value})})})}).on("close",function(){});var i=r.find("#headers");r.on("click","#headers button",function(t){t.preventDefault();var e=i.find("span:last");n();var s=e.clone(!0);e.before(s),e.find("input").val("").eq(0).focus()}),r.on("input",".row input",function(){n(t(this).closest(".row"))})}(),w(),a.$document.bind("saved",w))}function v(t,e){var n=e?JSON.parse(e):JSON.parse(t.data);if(n.connections>0&&0===m&&r.addClass("viewers"),m!==n.connections){var i=c.find(".viewers b").removeClass("up down").html("<b>"+n.connections+"<br>"+m+"<br>"+n.connections+"</b>"),s=m>n.connections?"down":"up";setTimeout(function(){i.addClass(s)},0)}0===(m=n.connections)&&setTimeout(function(){r.removeClass("viewers")},250)}function h(t){window.EventSource&&t&&(f&&f.close(),(f=new EventSource(a.getURL()+"/stats?checksum="+a.state.checksum)).addEventListener("stats",a.throttle(v,1e3)))}function b(t){l.editor;var e=l.getCode();if("meta"===t&&(t='meta name="description'),-1===e.indexOf("<"+t)){var n=function(t,e){var n=a.state.processors.html;if(e=e.replace(/"/g,"&quot;"),"title"===t)return"jade"===n?"title "+e+"\n":"<title>"+e+"</title>\n";if("description"===t)return"jade"===n?'meta(name="description", content="'+e+'")\n':'<meta name="description" content="'+e+'">\n';return e}("title"===t?"title":"description","");e=p.head.test(e)?e.replace(p.head,"<head$1\n"+n):n+e,l.setCode(e)}}function g(t){var e=null,n=null,i=l.editor,o=i.somethingSelected();s.named.html.visible&&(o&&(e=i.listSelections()),n=i.getCursor()),l.setCode(t),s.named.html.visible&&(a.mobile||i.setCursor(n),o&&i.setSelections(e))}function w(e){var n=a.state.metadata||{},s=[],o=!1;if(n.name&&(c.find(".name b").html(n.name),c.find("img").attr("src",n.avatar),s.push(n.name)),(a.state.checksum||a.user&&n.name===a.user.name)&&(o=!0,s.push("author")),u&&u.stop(),a.state.streaming&&!0!==o?!1===o&&(c.find("time").html("Streaming"),s.push("streaming"),u&&u.start()):c.find("time").html(e?"just now":i(n.last_updated)),a.checksum||s.push("meta"),n.pro&&s.push("pro"),c.find(".visibility").text(n.visibility),"private"===n.visibility?s.push("private"):"public"===n.visibility&&s.push("public"),a.state.code&&r.addClass(s.join(" ")).parent().removeAttr("hidden"),a.state.streaming)if(window.EventSource&&o){h(o),function(t){var e="hidden"in document?"hidden":"webkitHidden"in document?"webkitHidden":"mozHidden"in document?"mozHidden":null;if("visibilityState"in document||("webkitVisibilityState"in document||"mozVisibilityState"in document)){var n=e.replace(/hidden/i,"visibilitychange");document.addEventListener(n,function(){document[e]?f.close():h(t)})}}(o);var d=a.getURL();a.$document.on("saved",function(){var t=window.location.toString();d!==t&&(f.close(),h(o))})}else!0===a.saveDisabled&&"/edit"===window.location.pathname.slice(-5)&&(t.getScript(a.static+"/js/spike.js?"+a.version),a.$document.on("stats",a.throttle(v,1e3)))}}t.getScript(a.static+"/js/vendor/eventsource.js",r)});
//# sourceMappingURL=../sourcemaps/chrome/infocard.js.map
