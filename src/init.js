define([
	"skylark-jquery",
	"./chrome/transfer"
],function($,updateTransfer){

	function init() {
		/*
		$(document).on('jsbinReady', function () {
			getRenderedCode.html = getRenderedCode.render('html');
			getRenderedCode.javascript = getRenderedCode.render('javascript');
			getRenderedCode.css = getRenderedCode.render('css');
		});	
		*/
		// moved from chrome/transfer
		updateTransfer();	
	}


	return init;

});