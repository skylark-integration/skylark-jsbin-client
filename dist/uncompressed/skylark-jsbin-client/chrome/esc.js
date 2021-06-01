define([
  "skylark-jquery",
  "skylark-jsbin-chrome/hideOpen",
   "../jsbin"
],function ($, hideOpen, jsbin) {

  jsbin.$document.keydown(function (event) {
    if (event.which == 27) {//} || (keyboardHelpVisible && event.which == 191 && event.shiftKey && event.metaKey)) {
      hideOpen();
    }
  });


  jsbin.$document.delegate('.modal', 'click', function (event) {
    if ($(event.target).is('.modal')) {
      hideOpen();
    }
  });
});
