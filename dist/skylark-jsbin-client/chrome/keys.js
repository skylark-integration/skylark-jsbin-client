/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["skylark-jquery","../jsbin"],function(e,t){"use strict";if(!t.user||!t.user.name){var n={},o=function(e){return(n[e||t.getURL({withRevision:!0,withoutRoot:!0})]||{}).c};try{"localStorage"in window&&window.localStorage}catch(e){return o}return $document.on("saved",function(){n[t.getURL({withRevision:!1,withoutRoot:!0})]={s:t.state.revsion,c:t.state.checksum,d:(new Date).getTime()},localStorage.keys=JSON.stringify(n)}),window.addEventListener("storage",function(e){"keys"===e.key&&i()}),i(),t.keys=o}function i(){n=JSON.parse(localStorage.keys||"{}")}});
//# sourceMappingURL=../sourcemaps/chrome/keys.js.map
