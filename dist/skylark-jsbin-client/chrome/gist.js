/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["skylark-jquery","skylark-jsbin-bintofile","skylark-jsbin-processors","skylark-jsbin-coder/editors/panels","../jsbin"],function(e,t,s,n,i){"use strict";if(!!!("withCredentials"in new XMLHttpRequest||"undefined"!=typeof XDomainRequest))return e(function(){e("#export-as-gist").remove()});var o=function(t){var s=this,n="";return s.code={},i.user&&i.user.github_token&&(n="?access_token="+i.user.github_token),e.get("https://api.github.com/gists/"+t+n,function(t){t&&(e.each(t.files,function(e,t){var n=e.split(".").slice(-1).join("");s.code[n]=t.content}),s.setCode())}),this};return o.prototype.setCode=function(){e.each(this.code,function(e,t){var o=i.processors.findByExtension(e),r=o.target||o.id,c=n.named[r];c&&(s.set(r,o.id),i.saveDisabled=!0,c.setCode(t),i.saveDisabled=!1)})},e("a.export-as-gist").click(function(){var o={public:!0,files:{}},r=[n.named.html.render(),n.named.javascript.render(),n.named.css.render()];return Promise.all(r).then(function(r){var c={html:r[0],javascript:r[1],css:r[2]};Object.keys(c).forEach(function(e){var t=s[e].extensions?s[e].extensions[0]:e,n=["jsbin",i.state.code||"untitled",t].join(".");c[e].length&&(o.files[n]={content:c[e]})}),o.files.javascript||o.files.css||delete o.files[["jsbin",i.state.code||"untitled","html"].join(".")],i.state.processors&&(n.source=i.state.processors,Object.keys(n.source).forEach(function(e){n.source[e]=n.named[e].getCode()}));var a=t(c);o.files["index.html"]={content:a};var u=[];i.state.title&&u.push(i.state.title),i.state.description&&u.push(i.state.description),u.push("// source "+i.getURL()),o.description=u.join("\n\n");var l="";i.user&&i.user.github_token&&(l="?access_token="+i.user.github_token),e.ajax({type:"POST",url:"https://api.github.com/gists"+l,data:JSON.stringify(o),dataType:"json",crossDomain:!0,success:function(e){i.$document.trigger("tip",{type:"notification",content:'Gist created! <a href="'+e.html_url+'" target="_blank">Open in new tab.</a>'})},error:function(e,t,s){i.$document.trigger("tip",{type:"error",content:"There was a problem creating the gist: "+s}),console.group("gist"),console.log(o),console.groupEnd("gist")}})},function(e){console.error(e.stack)}),!1}),o});
//# sourceMappingURL=../sourcemaps/chrome/gist.js.map
