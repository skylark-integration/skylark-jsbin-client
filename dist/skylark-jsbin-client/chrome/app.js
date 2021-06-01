/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["skylark-jquery","skylark-jsbin-coder/editors/codemirror","../jsbin","./gist","./analytics"],function(e,o,d,t,a){if(/gist\/.*/.test(window.location.pathname)&&(window.editors=editors,loadGist=function(){window.gist=new t(window.location.pathname.replace(/.*\/([^/]+)$/,"$1"))},editors.ready?loadGist():d.$document.on("jsbinReady",loadGist)),d.mobile||(document.body.onscroll=window.onscroll=function(){return 0!==document.body.scrollTop&&window.scrollTo(0,0),!1}),window.CodeMirror=o,o.keyMap&&o.keyMap.default){var i="mac"===e.browser.platform?"Cmd":"Ctrl";delete o.keyMap.default[i+"-L"],delete o.keyMap.default[i+"-T"],delete o.keyMap.default[i+"-W"],delete o.keyMap.default[i+"-J"],delete o.keyMap.default[i+"-R"]}d.embed&&a.embed()});
//# sourceMappingURL=../sourcemaps/chrome/app.js.map
