define([
  "skylark-jquery",
   "../jsbin",
   "./analytics"
],function ($,jsbin,analytics) {
	$('#download').click(function (event) {
	  event.preventDefault();
	  window.location = jsbin.getURL({ withRevision: true }) + '/download';
	  analytics.download();
	});
});