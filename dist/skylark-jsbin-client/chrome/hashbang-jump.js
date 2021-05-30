/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["skylark-jquery","../jsbin"],function(o,i){location.hash&&/#\/.*?\/(\d+\/)?edit/i.test(location.hash)&&(window.location=i.root+location.hash.substring(1)+location.search)});
//# sourceMappingURL=../sourcemaps/chrome/hashbang-jump.js.map
