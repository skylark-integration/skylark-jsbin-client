/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["skylark-jquery","../jsbin","./analytics"],function(n,o,i){n("#download").click(function(n){n.preventDefault(),window.location=o.getURL({withRevision:!0})+"/download",i.download()})});
//# sourceMappingURL=../sourcemaps/chrome/download.js.map
