/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["skylark-jquery","skylark-jsbin-chrome/hideOpen","../jsbin"],function(e,n,i){i.$document.keydown(function(e){27==e.which&&n()}),i.$document.delegate(".modal","click",function(i){e(i.target).is(".modal")&&n()})});
//# sourceMappingURL=../sourcemaps/chrome/esc.js.map
