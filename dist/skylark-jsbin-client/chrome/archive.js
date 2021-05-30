/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
define(["skylark-jquery","../jsbin","./analytics"],function(e,t,i){function n(){t.state.metadata&&t.state.metadata.archive?(e("a.archivebin").hide(),e("a.unarchivebin").show()):(e("a.archivebin").show(),e("a.unarchivebin").hide())}return n(),t.archive=function(a){"use strict";var r=!1===a?"unarchive":"archive",o=!1===a?"restore from archive":"archiving";i[r](t.getURL({withRevision:!0})),t.user.name?t.owner()?e.ajax({type:"POST",url:t.getURL({withRevision:!0})+"/"+r,error:function(){$document.trigger("tip",{type:"error",content:"The "+o+" failed. If this continues, please can you file an issue?"})},success:function(){t.state.metadata.archive=!1!==a,n(),$document.trigger("tip",{type:"notication",autohide:5e3,content:"This bin is now "+(!1===a?"restored from the archive.":"archived.")})}}):t.$document.trigger("tip",{type:"notication",content:"The "+o+" failed. You can only archive bins that you own."}):t.$document.trigger("tip",{type:"notication",content:"You must be logged in and the owner of the bin to archive."})}});
//# sourceMappingURL=../sourcemaps/chrome/archive.js.map
