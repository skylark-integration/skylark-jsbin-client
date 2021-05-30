/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["skylark-jquery","../jsbin"],function(n,e){"use strict";function t(){var n=["Please provide any additional information, record a screencast ","with http://quickcast.io or http://screenr.com and attach a screenshot ","if possible.\n\n**JS Bin info**\n\n* [%url%/edit](%url%/edit)\n* ",window.navigator.userAgent+"\n",e.user&&e.user.name?"* "+e.user.name:"","\n"].join("");return"http://github.com/jsbin/jsbin/issues/new?body="+encodeURIComponent(n.replace(/%url%/g,e.getURL({withRevision:!0})))}var i=n("#newissue");return n("#help").parent().on("open",function(){i.attr("href",t())}),t});
//# sourceMappingURL=../sourcemaps/chrome/issue.js.map
