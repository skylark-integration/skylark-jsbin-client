define([
  "skylark-jquery",
  "skylark-jsbin-base/storage",
  "skylark-jsbin-chrome/hideOpen",
  "skylark-jsbin-coder/editors/panels",
   "../jsbin",
   "./analytics",
   "./archive",
   "./settings"
],function ($,store,hideOpen, panels,jsbin,analytics, archive,settings) {
  var $startingpoint = $('a.startingpoint').click(function (event) {
    event.preventDefault();
    if (localStorage) {
      analytics.saveTemplate();
      localStorage.setItem('saved-javascript', panels.named.javascript.getCode());
      localStorage.setItem('saved-html', panels.named.html.getCode());
      localStorage.setItem('saved-css', panels.named.css.getCode());

      localStorage.setItem('saved-processors', JSON.stringify({
        javascript: panels.named.javascript.processor.id,
        html: panels.named.html.processor.id,
        css: panels.named.css.processor.id,
      }));

      jsbin.$document.trigger('tip', {
        type: 'notification',
        content: 'Starting template updated and saved',
        autohide: 3000
      });
    } else {
      jsbin.$document.trigger('tip', {
        type: 'error',
        content: 'Saving templates isn\'t supported in this browser I\'m afraid. Sorry'
      });
    }
    return false;
  });

  // if (localStorage && localStorage['saved-html']) {
    // $startingpoint.append('')
  // }

  $('a.disabled').on('click mousedown mouseup', function (event) {
    event.stopImmediatePropagation();
    return false;
  });

  $('#loginbtn').click(function () {
    analytics.login();
    $(this).toggleClass('open');
    // $('#login').show();
    // loginVisible = true;
    // return false;
  });

  $('a.logout').click(function (event) {
    event.preventDefault();

    // We submit a form here because I can't work out how to style the button
    // element in the form to look the same as the anchor. Ideally we would
    // remove that and just let the form submit itself...
    $(this.hash).submit();
    // Clear session storage so private bins wont be cached.
    for (i = 0; i < store.sessionStorage.length; i++) {
      key = store.sessionStorage.key(i);
      if (key.indexOf('jsbin.content.') === 0) {
        store.sessionStorage.removeItem(key);
      }
    }
  });

  $('.homebtn').click(function (event, data) {
    if (this.id === 'avatar') {
      analytics.openFromAvatar();
    } else if (this.id === 'profile') {
      analytics.openFromAvatar();
      $(this).closest('.open').removeClass('open');
    } else {
      analytics.open(data);
    }

    hideOpen();

    panels.hideAll();
    return false;
  });

  var $lockrevision = $('div.lockrevision').on('click', function (event) {
    event.preventDefault();
    jsbin.saveChecksum = false;
    jsbin.$document.trigger('locked');
  }).on('mouseup', function () {
    return false;
  });

  jsbin.$document.on('locked', function () {
    if (!$lockrevision.data('locked')) {
      analytics.lock();
      $lockrevision.removeClass('icon-unlocked').addClass('icon-lock');
      $lockrevision.html('<span>This bin is now locked from further changes</span>');
      $lockrevision.data('locked', true);
    }
  });

  // var $lockrevision = $('.lockrevision').on('click', function (event) {
  // });

  jsbin.$document.on('saved', function () {
    $lockrevision.removeClass('icon-lock').addClass('icon-unlocked').data('locked', false);
    $lockrevision.html('<span>Click to lock and prevent further changes</span>');
  });

  // TODO decide whether to remove this, since it definitely doesn't work!
  // $('#share input[type=text], #share textarea').on('beforecopy', function (event) {
  //   console.log(this, this.getAttribute('data-path'));
  //   analytics.share('copy', this.getAttribute('data-path').substring(1) || 'output');
  // });

  if (!$('#sharemenu .share-split').length) {
    var $panelCheckboxes = $('#sharepanels input[type="checkbox"]').on('change', function () {
      updateSavedState();
    });
    $('#sharemenu').bind('open', function () {
      $panelCheckboxes.attr('checked', false);
      panels.getVisible().forEach(function (panel) {
        $panelCheckboxes.filter('[data-panel="' + panel.id + '"]').prop('checked', true).change();
      });

    });

  }


  $('#jsbinurl').click(function (e) {
    setTimeout(function () {
      panels.named.live.hide();
    }, 0);
  });

  $('#runwithalerts, li.run-with-js a').click(function (event, data) {
    analytics.run(data);
    if (panels.named.console.visible) {
      panels.named.console.render(true);
    } else {
      panels.renderLivePreview(true);
    }
    return false;
  });

  $('#runconsole').click(function () {
    analytics.runconsole();
    panels.named.console.render(true);
    return false;
  });

  $('#clearconsole').click(function () {
    jsconsole.clear();
    return false;
  });

  $('#showhelp').click(function () {
    $body.toggleClass('keyboardHelp');
    keyboardHelpVisible = $body.is('.keyboardHelp');
    if (keyboardHelpVisible) {
      // analytics.help('keyboard');
    }
    return false;
  });

  $('a.toggle-side-nav').on(jsbin.mobile ? 'touchstart' : 'click', function () {
    $body.toggleClass('show-nav');
    sideNavVisible = $body.is('.show-nav');
    if (!sideNavVisible && !jsbin.mobile) {
      // we only focus the editor in desktop, otherwise the keyboard jumps up
      $('#skipToEditor').click();
    }
    return sideNavVisible;
  });


  $('#showurls').click(function () {
    $body.toggleClass('urlHelp');
    urlHelpVisible = $body.is('.urlHelp');
    if (urlHelpVisible) {
      // analytics.urls();
    }
    return false;
  });

  $('.code.panel > .label > span.name').dblclick(function () {
    panels.allEditors(function (panel) {
      var lineNumbers = !panel.editor.getOption('lineNumbers');
      panel.editor.setOption('lineNumbers', lineNumbers);
      jsbin.settings.editor.lineNumbers = lineNumbers;
    });
  });

  $('a.createnew').click(function (event) {
    event.preventDefault();
    var i, key;
    analytics.createNew();
    // FIXME this is out and out [cr]lazy....
    panels.savecontent = function(){};
    for (i = 0; i < store.sessionStorage.length; i++) {
      key = store.sessionStorage.key(i);
      if (key.indexOf('jsbin.content.') === 0) {
        store.sessionStorage.removeItem(key);
      }
    }

    // clear out the write checksum too
    store.sessionStorage.removeItem('checksum');

    panels.saveOnExit = false;

    // first try to restore their default panels
    panels.restore();

    // if nothing was shown, show html & live
    setTimeout(function () {
      if (panels.getVisible().length === 0) {
        panels.named.html.show();
        panels.named.live.show();
      }
      window.location = jsbin.root;
    }, 0);
  });

  var $privateButton = $('#control a.visibilityToggle#private');
  var $publicButton = $('#control a.visibilityToggle#public');

  var $visibilityButtons = $('#control a.visibilityToggle').click(function(event) {
    event.preventDefault();

    var visibility = $(this).data('vis');

    $.ajax({
      url: jsbin.getURL({ withRevision: true }) + '/' + visibility,
      type: 'post',
      success: function (data) {

        jsbin.$document.trigger('tip', {
          type: 'notification',
          content: 'This bin is now ' + visibility,
          autohide: 6000
        });

        $visibilityButtons.css('display', 'none');

        if (visibility === 'public') {
          $privateButton.css('display', 'block');
        } else {
          $publicButton.css('display', 'block');
        }

      }
    });
  });

  $('form.login').closest('.menu').bind('close', function () {
    $(this).find('.loginFeedback').empty().hide();
    $('#login').removeClass('forgot');
  });

  $('#lostpass').click(function (e) {
    $('#login').addClass('forgot').find('input[name=email]').focus();
    return false;
  });

  jsbin.settings.includejs = jsbin.settings.includejs === undefined ? true : jsbin.settings.includejs;

  // ignore for embed as there might be a lot of embeds on the page
  if (!jsbin.embed && store.sessionStorage.getItem('runnerPending')) {
    jsbin.$document.trigger('tip', {
      content: 'It looks like your last session may have crashed, so I\'ve disabled "Auto-run JS" for you',
      type: 'error',
    });
    store.sessionStorage.removeItem('runnerPending');
    jsbin.settings.includejs = false;
  }

  $('#enablejs').change(function () {
    jsbin.settings.includejs = this.checked;
    analytics.enableLiveJS(jsbin.settings.includejs);
    panels.named.live.render();
  }).attr('checked', jsbin.settings.includejs);

  if (!jsbin.embed && jsbin.settings.hideheader) {
    jsbin.$body.addClass('hideheader');
  }

  var cancelUp = false;
  $('form input, form textarea').focus(function () {
    this.select();
    cancelUp = true;
  }).mouseup(function () {
    if (cancelUp) {
      cancelUp = false;
      return false;
    }
  });

  if (window.location.hash) {
    $('a[href$="' + window.location.hash + '"]').mousedown();
  }

  var ismac = navigator.userAgent.indexOf(' Mac ') !== -1,
      mackeys = {
        'ctrl': '⌘',
        'shift': '⇧',
        'del': '⌫'
      };

  $('#control').find('a[data-shortcut]').each(function () {
    var $this = $(this),
        data = $this.data();

    var key = data.shortcut;
    if (ismac) {
      key = key.replace(/ctrl/i, mackeys.ctrl).replace(/shift/, mackeys.shift).replace(/del/, mackeys.del).replace(/\+/g, '').toUpperCase();
    }

    $this.append('<span class="keyshortcut">' + key + '</span>');
  });

  (function () {

  var re = {
    head: /<head(.*)\n/i,
    meta: /<meta name="description".*?>/i,
    metaContent: /content=".*?"/i
  };

  var metatag = '<meta name="description" content="[add your bin description]">\n';

  $('#addmeta').click(function () {
    // if not - insert
    // <meta name="description" content="" />
    // if meta description is in the HTML, highlight it
    var editor = panels.named.html,
        cm = editor.editor,
        html = editor.getCode();

    if (!editor.visible) {
      editor.show();
    }

    if (!re.meta.test(html)) {
      if (re.head.test(html)) {
        html = html.replace(re.head, '<head$1\n' + metatag);
      } else {
        // slap in the top
        html = metatag + html;
      }
    }

    editor.setCode(html);

    // now select the text
    // editor.editor is the CM object...yeah, sorry about that...
    var cursor = cm.getSearchCursor(re.meta);
    cursor.findNext();

    var contentCursor = cm.getSearchCursor(re.metaContent);
    contentCursor.findNext();

    var from = { line: cursor.pos.from.line, ch: cursor.pos.from.ch + '<meta name="description" content="'.length },
        to = { line: contentCursor.pos.to.line, ch: contentCursor.pos.to.ch - 1 };

    cm.setCursor(from);
    cm.setSelection(from, to);
    cm.on('cursoractivity', function () {
      cm.on('cursoractivity', null);
      mark.clear();
    });

    var mark = cm.markText(from, to, { className: 'highlight' });

    cm.focus();

    return false;
  });

  $('a.publish-to-vanity').on('click', function (event) {
    event.preventDefault();
    analytics.publishVanity();

    $.ajax({
      type: 'post',
      url: this.href,
      data: { url: jsbin.getURL({ withRevision: true }) },
      success: function () {
        jsbin.$document.trigger('tip', {
          type: 'notification',
          content: 'This bin is now published to your vanity URL: <a target="_blank" href="' + jsbin.shareRoot + '">' + jsbin.shareRoot + '</a>'
        });
      },
      error: function (xhr) {
        jsbin.$document.trigger('tip', {
          type: 'error',
          content: 'There was a problem publishing to your vanity URL. Can you try again or file a <a target="_blank" href="' + githubIssue() + '">new issue</a>?'
        });
      }
    })
  });

  jsbin.$document.on('click', 'a.deleteallbins', function () {
    if (jsbin.user && jsbin.state.metadata.name === jsbin.user.name) {
      if (confirm('Delete all snapshots of this bin including this one?')) {
      analytics.deleteAll();
      $.ajax({
        type: 'post',
        url: jsbin.getURL() + '/delete-all',
        success: function () {
          jsbin.state.deleted = true;
          jsbin.$document.trigger('tip', {
            type: 'error',
            content: 'This bin and history is now deleted. You can continue to edit, but once you leave the bin can\'t be retrieved'
          });
        },
        error: function (xhr) {
          if (xhr.status === 403) {
            jsbin.$document.trigger('tip', {
              content: 'You don\'t own this bin, so you can\'t delete it.',
              autohide: 5000
            });
          }
        }
      });

    }
    } else {
      jsbin.$document.trigger('tip', {
        type: 'error',
        content: 'You must be logged in <em><strong>the bin owner</strong></em> to delete all snapshots. <a target="_blank" href="/help/delete-a-bin">Need help?</a>'
      });
    }
  });

  $('a.deletebin').on('click', function (e) {
    e.preventDefault();
    if (confirm('Delete this bin?')) {
      analytics['delete']();
      $.ajax({
        type: 'post',
        url: jsbin.getURL({ withRevision: true }) + '/delete',
        data: { checksum: jsbin.state.checksum },
        success: function () {
          jsbin.state.deleted = true;
          jsbin.$document.trigger('tip', {
            type: 'error',
            content: 'This bin is now deleted. You can continue to edit, but once you leave the bin can\'t be retrieved'
          });
        },
        error: function (xhr) {
          if (xhr.status === 403) {
            jsbin.$document.trigger('tip', {
              content: 'You don\'t own this bin, so you can\'t delete it.',
              autohide: 5000
            });
          }
        }
      });

    }
  });

  $('a.archivebin').on('click', function (e) {
    e.preventDefault();
    archive();
  });

  $('a.unarchivebin').on('click', function (e) {
    e.preventDefault();
    archive(false);
  });

  var $enableUniversalEditor = $('#enableUniversalEditor').on('change', function (e) {
    e.preventDefault();

    jsbin.settings.editor.simple = this.checked;
    analytics.universalEditor(jsbin.settings.editor.simple);
    settings.save(function () {
      window.location.reload();
    });
  });

  if (jsbin.settings.editor.simple) {
    $enableUniversalEditor.prop('checked', true);
  }

  $('#skipToEditor').on('click keypress', function () {
    var first = (panels.getVisible() || ['html']).shift();
    if (jsbin.settings.editor.simple || jsbin.mobile) {
      $('#' + first.id).focus();
    } else if (first) {
      first.editor.focus();
    } else {
      panels.named.html.editor.focus();
    }
    return false;
  });

  }());

});