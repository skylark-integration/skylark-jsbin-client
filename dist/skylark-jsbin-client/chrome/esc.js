/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["skylark-jquery","../jsbin"],function(e,o){var n=!1,l=!1,a=!1,s=!1,c=!1,d=!1;function i(){d&&(e("#infocard").removeClass("open"),d=!1),c&&($body.removeClass("show-nav"),c=!1),s?($body.removeClass("urlHelp"),s=!1,analytics.closeMenu("help")):a?($body.removeClass("keyboardHelp"),a=!1,analytics.closeMenu("keyboardHelp")):l?closedropdown():n&&(e("#login").hide(),analytics.closeMenu("login"),n=!1)}o.$document.keydown(function(e){27==e.which&&i()}),o.$document.delegate(".modal","click",function(o){e(o.target).is(".modal")&&i()})});
//# sourceMappingURL=../sourcemaps/chrome/esc.js.map
