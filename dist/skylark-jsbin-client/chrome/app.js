/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["skylark-jquery","../jsbin","./gist","./analytics"],function(e,o,r,d){if(/gist\/.*/.test(window.location.pathname)&&(window.editors=editors,loadGist=function(){window.gist=new r(window.location.pathname.replace(/.*\/([^/]+)$/,"$1"))},editors.ready?loadGist():$document.on("jsbinReady",loadGist)),o.mobile||(document.body.onscroll=window.onscroll=function(){return 0!==document.body.scrollTop&&window.scrollTo(0,0),!1}),window.CodeMirror=CodeMirror,CodeMirror.keyMap&&CodeMirror.keyMap.default){var i="mac"===e.browser.platform?"Cmd":"Ctrl";delete CodeMirror.keyMap.default[i+"-L"],delete CodeMirror.keyMap.default[i+"-T"],delete CodeMirror.keyMap.default[i+"-W"],delete CodeMirror.keyMap.default[i+"-J"],delete CodeMirror.keyMap.default[i+"-R"]}o.embed&&d.embed()});
//# sourceMappingURL=../sourcemaps/chrome/app.js.map
