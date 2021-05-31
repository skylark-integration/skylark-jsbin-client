/**
 * skylark-jsbin-client - A version of jsbin-editor  that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-jsbin-client/
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx-ns");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('skylark-jsbin-client/jsbin',[
  "skylark-jsbin-base"
],function(jsbin){
  return jsbin;
});


define('skylark-jsbin-client/chrome/font',[
  "skylark-jquery",
   "../jsbin"
],function ($,jsbin) {
  /** =========================================================================
   * font
   * Reads user setting and configures the CodeMirror font size
   * ========================================================================== */
  /*global jsbin:true*/
  var font = (function (document) {
    var head = document.getElementsByTagName('head')[0],
        selectors = '#output li, #exec, .fakeInput, .fakeInput:before, #exec:before, #bin .editbox .CodeMirror, .mobile .editbox textarea',
        size = jsbin.settings.font || 14;

    // via http://stackoverflow.com/questions/2041495/create-dynamic-inline-stylesheet
    function font(size) {
      var cssText = selectors + '{ font-size: ' + size + 'px; }',
          el = document.createElement('style');

      el.type = 'text/css';
      if (el.styleSheet) {
        el.styleSheet.cssText = cssText;//IE only
      } else {
        el.appendChild(document.createTextNode(cssText));
      }
      head.appendChild(el);
    }

    if (Object.defineProperty && jsbin.settings) {
      try {
        Object.defineProperty(jsbin.settings, 'font', {
          configurable: true,
          enumerable: true,
          get: function () {
            return size;
          },
          set: function (val) {
            size = val * 1;
            font(size);
          }
        });
      } catch (e) {
        // IE8 seems to attempt the code above, but it totally fails
      }
    }

    font(size);

    return font;
  })(document);

  var md5 = 'a3a02e450f1f79f4c3482279d113b07e';
  var key = 'fonts';
  var cache;

  function insertFont(value) {
    var style = document.createElement('style');
    style.innerHTML = value;
    document.head.appendChild(style);
  }

  try {
    cache = window.localStorage.getItem(key);
    if (cache) {
      cache = JSON.parse(cache);
      if (cache.md5 === md5) {
        insertFont(cache.value);
      } else {
        // busting cache when md5 doesn't match
        window.localStorage.removeItem(key);
        cache = null;
      }
    }
  } catch (e) {
    // most likely LocalStorage disabled
    return;
  }

  if (!cache) {
    // fonts not in LocalStorage or md5 did not match
    window.addEventListener('load', function () {
      var request = new XMLHttpRequest();
      var response;
      var url = jsbin.static + '/css/fonts.a3a02e450f1f79f4c3482279d113b07e.woff.json?' + jsbin.version;
      request.open('GET', url, true);
      request.onload = function () {
        if (this.status == 200) {
          try {
            response = JSON.parse(this.response);
            insertFont(response.value);
            window.localStorage.setItem(key, this.response);
          } catch (e) {
            // localStorage is probably full
          }
        }
      };
      request.send();
    });
  }

  return jsbin.font = font;
});
define('skylark-jsbin-client/chrome/splitter',[
  "skylark-jquery",
   "../jsbin"
],function ($,jsbin) {
  $.fn.splitter = function () {
    var $document = $(document),
        $blocker = $('<div class="block"></div>'),
        $body = $('body');
        // blockiframe = $blocker.find('iframe')[0];

    var splitterSettings = JSON.parse(store.localStorage.getItem('splitterSettings') || '[]');
    return this.each(function () {
      var $el = $(this),
          $originalContainer = $(this),
          guid = $.fn.splitter.guid++,
          $parent = $el.parent(),
          type = 'x',
          $prev = type === 'x' ? $el.prevAll(':visible:first') : $el.nextAll(':visible:first'),
          $handle = $('<div class="resize"></div>'),
          dragging = false,
          width = $parent.width(),
          parentOffset = $parent.offset(),
          left = parentOffset.left,
          top = parentOffset.top, // usually zero :(
          props = {
            x: {
              currentPos: $parent.offset().left,
              multiplier: 1,
              cssProp: 'left',
              otherCssProp: 'right',
              size: $parent.width(),
              sizeProp: 'width',
              moveProp: 'pageX',
              init: {
                top: 0,
                bottom: 0,
                width: jsbin.mobile ? 44 : 8,
                'margin-left': jsbin.mobile ? '-22px' : '-4px',
                height: '100%',
                left: 'auto',
                right: 'auto',
                opacity: 0,
                position: 'absolute',
                cursor: 'ew-resize',
                // 'border-top': '0',
                'border-left': '1px solid rgba(218, 218, 218, 0.5)',
                'z-index': 99999
              }
            },
            y: {
              currentPos: $parent.offset().top,
              multiplier: -1,
              size: $parent.height(),
              cssProp: 'bottom',
              otherCssProp: 'top',
              sizeProp: 'height',
              moveProp: 'pageY',
              init: {
                top: 'auto',
                cursor: 'ns-resize',
                bottom: 'auto',
                height: 8,
                width: '100%',
                left: 0,
                right: 0,
                opacity: 0,
                position: 'absolute',
                border: 0,
                // 'border-top': '1px solid rgba(218, 218, 218, 0.5)',
                'z-index': 99999
              }
            }
          },
          refreshTimer = null,
          settings = splitterSettings[guid] || {};

      var tracker = {
        down: { x: null, y: null },
        delta: { x: null, y: null },
        track: false,
        timer: null
      };
      $handle.bind('mousedown', function (event) {
        tracker.down.x = event.pageX;
        tracker.down.y = event.pageY;
        tracker.delta = { x: null, y: null };
        tracker.target = $handle[type == 'x' ? 'height' : 'width']() * 0.25;
      });

      $document.bind('mousemove', function (event) {
        if (dragging) {
          tracker.delta.x = tracker.down.x - event.pageX;
          tracker.delta.y = tracker.down.y - event.pageY;
          clearTimeout(tracker.timer);
          tracker.timer = setTimeout(function () {
            tracker.down.x = event.pageX;
            tracker.down.y = event.pageY;
          }, 250);
          var targetType = type == 'x' ? 'y' : 'x';
          if (Math.abs(tracker.delta[targetType]) > tracker.target) {
            $handle.trigger('change', targetType, event[props[targetType].moveProp]);
            tracker.down.x = event.pageX;
            tracker.down.y = event.pageY;
          }
        }
      });

      function moveSplitter(pos) {
        if (type === 'y') {
          pos -= top;
        }
        var v = pos - props[type].currentPos,
            split = 100 / props[type].size * v,
            delta = (pos - settings[type]) * props[type].multiplier,
            prevSize = $prev[props[type].sizeProp](),
            elSize = $el[props[type].sizeProp]();

        if (type === 'y') {
          split = 100 - split;
        }

        // if prev panel is too small and delta is negative, block
        if (prevSize < 100 && delta < 0) {
          // ignore
        } else if (elSize < 100 && delta > 0) {
          // ignore
        } else {
          // allow sizing to happen
          $el.css(props[type].cssProp, split + '%');
          $prev.css(props[type].otherCssProp, (100 - split) + '%');
          var css = {};
          css[props[type].cssProp] = split + '%';
          $handle.css(css);
          settings[type] = pos;
          splitterSettings[guid] = settings;
          store.localStorage.setItem('splitterSettings', JSON.stringify(splitterSettings));

          // wait until animations have completed!
          if (moveSplitter.timer) clearTimeout(moveSplitter.timer);
          moveSplitter.timer = setTimeout(function () {
            $document.trigger('sizeeditors');
          }, 120);
        }
      }

      function resetPrev() {
        $prev = type === 'x' ? $handle.prevAll(':visible:first') : $handle.nextAll(':visible:first');
      }

      $document.bind('mouseup touchend', function () {
        if (dragging) {
          dragging = false;
          $blocker.remove();
          // $handle.css( 'opacity', '0');
          $body.removeClass('dragging');
        }
      }).bind('mousemove touchmove', function (event) {
        if (dragging) {
          moveSplitter(event[props[type].moveProp] || event.originalEvent.touches[0][props[type].moveProp]);
        }
      });

      $blocker.bind('mousemove touchmove', function (event) {
        if (dragging) {
          moveSplitter(event[props[type].moveProp] || event.originalEvent.touches[0][props[type].moveProp]);
        }
      });

      $handle.bind('mousedown touchstart', function (e) {
        dragging = true;
        $body.append($blocker).addClass('dragging');
        props[type].size = $parent[props[type].sizeProp]();
        props[type].currentPos = 0; // is this really required then?

        resetPrev();
        e.preventDefault();
      });

      /*
      .hover(function () {
        $handle.css('opacity', '1');
      }, function () {
        if (!dragging) {
          $handle.css('opacity', '0');
        }
      })
    */

      $handle.bind('init', function (event, x) {
        $handle.css(props[type].init);
        props[type].size = $parent[props[type].sizeProp]();
        resetPrev();

        // can only be read at init
        top = $parent.offset().top;

        $blocker.css('cursor', type == 'x' ? 'ew-resize' : 'ns-resize');

        if (type == 'y') {
          $el.css('border-right', 0);
          $prev.css('border-left', 0);
          $prev.css('border-top', '2px solid #ccc');
        } else {
          // $el.css('border-right', '1px solid #ccc');
          $el.css('border-top', 0);
          // $prev.css('border-right', '2px solid #ccc');
        }

        if ($el.is(':hidden')) {
          $handle.hide();
        } else {
          if ($prev.length) {
            $el.css('border-' + props[type].cssProp, '1px solid #ccc');
          } else {
            $el.css('border-' + props[type].cssProp, '0');
          }
          moveSplitter(x !== undefined ? x : $el.offset()[props[type].cssProp]);
        }
      }); //.trigger('init', settings.x || $el.offset().left);

      $prev.css('width', 'auto');
      $prev.css('height', 'auto');
      $el.data('splitter', $handle);
      $el.before($handle);

      // if (settings.y) {
      //   $handle.trigger('change', 'y');
      // }
    });
  };

  $.fn.splitter.guid = 0;
});
define('skylark-jsbin-client/chrome/analytics',[
  "skylark-jquery",
   "../jsbin"
],function ($,jsbin) {
  var analytics =  {
    track: function (category, action, label) { // , value
      window.ga && ga('send', 'event', category, action, label);
    },
    experiment: function (type) {
      analytics.track('experiment', type);
    },
    universalEditor: function (value) {
      analytics.track('menu', 'universalEditor', value);
    },
    library: function (action, value) {
      analytics.track('menu', action, 'library', value);
    },
    infocard: function (action, value) {
      analytics.track('infocard', action, value);
    },
    embed: function () {
      try {
        analytics.track('state', 'embed', window.top.location);
      } catch (e) {
        analytics.track('state', 'embed');
      }
    },
    milestone: function () {
      analytics.track('bin', 'save', window.location.pathname);
    },
    clone: function () {
      analytics.track('bin', 'clone', window.location.pathname);
    },
    'delete': function () {
      analytics.track('bin', 'delete', window.location.pathname);
    },
    lock: function () {
      analytics.track('bin', 'lock', window.location.pathname);
    },
    openShare: function () {
      analytics.track('menu', 'open', 'share');
    },
    saveTemplate: function () {
      analytics.track('menu', 'select', 'save-template');
    },
    createNew: function (from) {
      analytics.track(from || 'menu', 'select', 'new');
    },
    open: function (from) {
      analytics.track(from || 'menu', 'select', 'open');
    },
    openFromAvatar: function () {
      analytics.track('menu', 'select', 'open via avatar');
    },
    openMenu: function (label) {
      analytics.track('menu', 'open', label);
    },
    closeMenu: function (label) {
      analytics.track('menu', 'close', label);
    },
    selectMenu: function (item) {
      if (item) {
        analytics.track('menu', 'select', item);
      }
    },
    share: function (action, label) {
      analytics.track('share', action, label);
    },
    download: function (from) {
      analytics.track(from || 'menu', 'select', 'download');
    },
    showPanel: function (panelId) {
      analytics.track('panel', 'show', panelId);
    },
    hidePanel: function (panelId) {
      analytics.track('panel', 'hide', panelId);
    },
    logout: function () {
      analytics.track('menu', 'select', 'logout');
    },
    register: function (success) {
      if (success === undefined) {
        analytics.track('menu', 'open', 'login');
      } else {
        analytics.track('user', 'register', ok ? 'success' : 'fail');
      }
    },
    login: function (ok) {
      if (ok === undefined) {
        analytics.track('menu', 'open', 'login');
      } else {
        analytics.track('user', 'login', ok ? 'success' : 'fail');
      }
    },
    enableLiveJS: function (ok) {
      analytics.track('button', 'auto-run js', ok ? 'on' : 'off');
    },
    archiveView: function (visible) {
      analytics.track('button', 'view archive', visible ? 'on' : 'off');
    },
    archive: function (url) {
      analytics.track('button', 'archive', url);
    },
    unarchive: function (url) {
      analytics.track('button', 'unarchive', url);
    },
    loadGist: function (id) {
      analytics.track('state', 'load gist', id);
    },
    layout: function (panelsVisible) {
      var layout = [], panel = '';

      for (panel in panelsVisible) {
        layout.push(panel.id);
      }

      analytics.track('layout', 'update', layout.sort().join(',') || 'none');
    },
    run: function (from) {
      analytics.track(from || 'button', 'run with js');
    },
    publishVanity: function () {
      analytics.track('bin', 'publish-vanity');
    },
    runconsole: function (from) {
      analytics.track(from || 'button', 'run console');
    },
    welcomePanelState: function (state) {
      var s = 'close';
      if (state) {
        s = 'open';
      }
      analytics.track('state', 'welcome-panel', s);
    },
    welcomePanelLink: function (url) {
      analytics.track('welcome-panel-link', url);
    }
  };

  // misses the asset upload one
  $('a[data-pro="true"]').on('click', function () {
    analytics.track('try-pro', $(this).text());
  });

  return jsbin.analytics = analytics;
});
define('skylark-jsbin-client/chrome/settings',[
  "skylark-jquery",
   "../jsbin"
],function ($,jsbin) {
  /*global jsbin, $*/

  var settings = {
    save: function (callback) {
      localStorage.setItem('settings', JSON.stringify(jsbin.settings));
      if (!callback) {
        callback = function () {};
      }

      $.ajax({
        url: '/account/editor',
        type: 'POST',
        dataType: 'json',
        data: {
          settings: localStorage.settings,
          _csrf: jsbin.state.token
        },
        success: function () {
          if (console && console.log) {
            console.log('settings saved');
          }
          callback(true);
        },
        error: function (xhr, status) {
          callback(false);
        }
      });
    }
  };
});
define('skylark-jsbin-client/render/saved-history-preview',[
  "skylark-jquery",
   "../jsbin"
],function ($,jsbin) {
  /*global jsbin, $, $document, analytics*/
  'use strict';
  if (!jsbin.user || !jsbin.user.name || jsbin.embed) {
    return;
  }

  var $body = $('body'),
      loaded = false,
      requestAttempts = 5,
      $history; // set in hookUserHistory()

  $document.on('history:open', function () {
    if ($history && jsbin.panels.getVisible().length === 0) {
      $history.appendTo('main');
    }
  }).on('history:close', function () {
    if ($history === null) {
      $history = $('#history').detach();
    }
  });

  var loadList = function () {
    if (loaded) {
      return;
    }

    if ($('html').hasClass('public-listing')) {
      hookUserHistory();
    } else {
      $.ajax({
        dataType: 'html',
        url: jsbin.root + '/list',
        error: function () {
          requestAttempts--;
          if (requestAttempts > 0) {
            $('#history').remove();
            setTimeout(loadList, 500);
          } else {
            console.error('Giving up to load history');
          }
        },
        success: function (html) {
          $('#history').remove();
          var frag = $(html);
          if (jsbin.mobile) {
            // mobile is particularly slow at rendering 1,000s of tbodys
            // so we'll remove some to relieve the pressure.
            frag.find('tbody:gt(50)').remove();
          }
          $body.append(frag);
          hookUserHistory();
          loaded = true;
        }
      });
    }
  };

  var updatePreview = function(url, $iframe) {
    $iframe.attr('src', url + '/quiet');
    $iframe.removeAttr('hidden');
  };

  var updateViewing = function (url, $viewing) {
    $viewing.html('<a href="' + url + '">' + url + '</a>');
  };

  var updateLayout = function ($tbodys, archiveMode) {
    var $parent = $tbodys.parent();
    $tbodys
      .detach()
      .each(function () {
        var $tbody = $(this),
            filter = archiveMode ? '.archived' : ':not(.archived)',
            $trs = $('tr' + filter, $tbody).filter(':not(.spacer)');
        if ($trs.length > 0) {
          $trs.filter('.first').removeClass('first');
          $tbody.removeClass('hidden');
          $trs.first().addClass('first');
        } else {
          $tbody.addClass('hidden');
        }
      })
      .appendTo($parent);
  };

  var hookUserHistory = function () {
    // Loading the HTML from the server may have failed
    $history = $('#history').detach();
    if (!$history.length) {
      return $history;
    }

    // Cache some useful elements
    var $iframe = $('iframe', $history),
        $viewing = $('#viewing', $history),
        $bins = $history,
        $tbodys = $('tbody', $history),
        $trs = $('tr', $history),
        $toggle = $('.toggle_archive', $history),
        current = null,
        hoverTimer = null;

    // Archive & un-archive click handlers
    $bins.delegate('.archive, .unarchive', 'click', function () {
      var $this = $(this),
          $row = $this.parents('tr');
      // Instantly update this row and the page layout
      $row.toggleClass('archived');

      analytics[this.pathname.indexOf('unarchive') === -1 ? 'archive' : 'unarchive'](jsbin.root + $row.data('url'));

      updateLayout($tbodys, $history.hasClass('archive_mode'));
      // Then send the update to the server
      $.ajax({
        type: 'POST',
        url: $this.attr('href'),
        error: function () {
          // Undo if something went wrong
          alert('Something went wrong, please try again');
          $row.toggleClass('archived');
          updateLayout($tbodys, $history.hasClass('archive_mode'));
        },
        success: function () {}
      });
      return false;
    });

    // Handle toggling of archive view
    $toggle.change(function () {
      $history.toggleClass('archive_mode');
      var archive = $history.hasClass('archive_mode');
      analytics.archiveView(archive);
      updateLayout($tbodys, archive);
    });

    var selected = null;
    $bins.delegate('a', 'click', function (event) {
      if (event.shiftKey || event.metaKey) { return; }

      var $this = $(this);

      if ($this.closest('.action').length) {
        // let the existing handlers deal with action links
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation(); // prevent further delegates
      if ($this.data('toggle') === 'history') {
        jsbin.panels.allEditors(function (panel) {
          if (panel.editor.getCode().trim().length) {
            panel.show();
          }
        });
        return;
      }
      var $tr = $this.closest('tr');
      var data = $tr.data();
      var url = jsbin.root + data.url;

      if (selected === this) {
        window.location = data.editUrl;
      } else {
        $trs.removeClass('selected');
        $tr.addClass('selected');
        updatePreview(url, $iframe);
        updateViewing(url, $viewing);

        selected = this;
      }
    });

    // Load bin from data-edit-url attribute when user clicks on a row
    $bins.delegate('tr:not(.spacer)', 'click', function (event) {
      if (event.shiftKey || event.metaKey) { return; }
      $(this).find('.url a:first').click();
    });

    // Update the time every 30 secs
    // Need to replace Z in ISO8601 timestamp with +0000 so prettyDate() doesn't
    // completely remove it (and parse the date using the local timezone).
    $('a[pubdate]', $history).attr('pubdate', function (i, val) {
      return val.replace('Z', '+0000');
    }).prettyDate();

    // Update the layout straight away
    setTimeout(function () {
      updateLayout($tbodys, false);
    }, 0);

    $document.trigger('history:open');

    return $history;
  };

  // inside a ready call because history DOM is rendered *after* our JS to improve load times.
  $(document).on('jsbinReady', function ()  {
    if (jsbin.embed) {
      return;
    }

    var $panelButtons = $('#panels a'),
        $homebtn = $('.homebtn'),
        panelsVisible = $body.hasClass('panelsVisible');

    var panelCloseIntent = function() {
      var activeCount = $panelButtons.filter('.active').length;
      if (activeCount === 1 && $(this).hasClass('active')) {
        loadList();
      }
    };

    // this code attempts to only call the list ajax request only if
    // the user should want to see the list page - most users will
    // jump in and jump out of jsbin, and never see this page,
    // so let's not send this ajax request.
    //
    // The list should be loaded when:
    //   - user hovers the home button
    //   - they close all the panels
    //   - they arrive at the page with no panels open

    $homebtn.on('click', loadList);
    $panelButtons.on('mousedown', panelCloseIntent);

    $document.on('history:load', loadList);

    if (!panelsVisible) {
      loadList();
    }

  });

  return {
    loadList,
    updatePreview,
    updateViewing,
    updateLayout,
    hookUserHistory
  };

});
define('skylark-jsbin-client/chrome/esc',[
  "skylark-jquery",
   "../jsbin"
],function ($,jsbin) {
  var loginVisible = false,
      dropdownOpen = false,
      keyboardHelpVisible = false,
      urlHelpVisible = false,
      sideNavVisible = false,
      infocardVisible = false;

  jsbin.$document.keydown(function (event) {
    if (event.which == 27) {//} || (keyboardHelpVisible && event.which == 191 && event.shiftKey && event.metaKey)) {
      hideOpen();
    }
  });

  function hideOpen() {
    if (infocardVisible) {
      $('#infocard').removeClass('open');
      infocardVisible = false;
    }
    if (sideNavVisible) {
      $body.removeClass('show-nav');
      sideNavVisible = false;
    }
    if (urlHelpVisible) {
      $body.removeClass('urlHelp');
      urlHelpVisible = false;
      analytics.closeMenu('help');
    } else if (keyboardHelpVisible) {
      $body.removeClass('keyboardHelp');
      keyboardHelpVisible = false;
      analytics.closeMenu('keyboardHelp');
    } else if (dropdownOpen) {
      closedropdown();
    } else if (loginVisible) {
      $('#login').hide();
      analytics.closeMenu('login');
      loginVisible = false;
    }
  }

  jsbin.$document.delegate('.modal', 'click', function (event) {
    if ($(event.target).is('.modal')) {
      hideOpen();
    }
  });
});

define('skylark-jsbin-client/chrome/share',[
  "skylark-jquery",
   "../jsbin"
],function ($,jsbin) {
  'use strict';
  /*globals $, panels, saveChecksum, jsbin, $document, documentTitle*/

  // only continue if the new share is enabled
  if ($('#sharemenu .share-split').length === 0) {
    return;
  }

  var mapping = {
    live: 'output',
    javascript: 'js'
  };
  var $sharepanels = $('#sharepanels input[type="checkbox"]');

  var selectedSnapshot = jsbin.state.revision;

  $document.on('saved', function () {
    selectedSnapshot = jsbin.state.revision;
  });

  $document.on('snapshot', function () {
    jsbin.state.changed = false;
    if (window.history.replaceState) {
      window.history.replaceState(null, '', jsbin.getURL({ withRevision: true }) + '/edit?' + panels.getQuery());
    }
  });

  var $sharemenu = $('#sharemenu').bind('open', function () {
    // select the right panels
    // hideOpen();
    $sharepanels.prop('checked', false);
    jsbin.panels.getVisible().forEach(function (p) {
      $sharepanels.filter('[value="' + (mapping[p.id] || p.id) + '"]').prop('checked', true);
    });

    // if we're the latest bin, then allow the user to switch to a snapshot
    if (jsbin.state.latest) {
      // if they have write access then select the latest & live by default
      if (jsbin.state.checksum) {
        $realtime.prop('checked', jsbin.state.latest);
        $snapshot.prop('checked', false);

        $andlive.show();
      // otherwise select the snapshot first
      } else {
        $realtime.prop({ checked: false });
        $snapshot.prop('checked', true);
        $andlive.hide();
      }

      $withLiveReload.show();
    } else {
      // otherwise, disable live
      $realtime.prop({ checked: false, disabled: true });
      $snapshot.prop('checked', true);
      $withLiveReload.hide();
    }

    update();
  });
  $sharemenu.find('.lockrevision').on('change', function () {
    saveChecksum = false; // jshint ignore:line
    jsbin.state.checksum = false;
    $document.trigger('locked');
  });
  var $sharepreview = $('#share-preview');
  var $realtime = $('#sharebintype input[type=radio][value="realtime"]');
  var $snapshot = $('#sharebintype input[type=radio][value="snapshot"]');
  var link = $sharemenu.find('a.link')[0];
  var linkselect = $sharemenu.find('input[name="url"]')[0];
  var embed = $sharemenu.find('textarea')[0];
  var form = $sharemenu.find('form')[0];
  var $directLinks = $sharemenu.find('.direct-links');
  var $andlive = $('#andlive');
  var $withLiveReload = $sharemenu.find('.codecasting');

  // get an object representation of a form's state
  function formData(form) {
    var length = form.length;
    var data = {};
    var value;
    var el;
    var type;
    var name;

    var append = function (data, name, value) {
      if (data[name] === undefined) {
        data[name] = value;
      } else {
        if (typeof data[name] === 'string') {
          data[name] = [data[name]];
        }
        data[name].push(value);
      }
    };

    for (var i = 0; i < length; i++) {
      el = form[i];
      value = el.value;
      type = el.type;
      name = el.name;

      if (type === 'radio') {
        if (el.checked) {
          append(data, name, value);
        }
      } else if (type === 'checkbox') {
        if (data[name] === undefined) {
          data[name] = [];
        }
        if (el.checked) {
          append(data, name, value);
        }
      } else {
        append(data, name, value);
      }
    }

    return data;
  }

  function update() {
    var data = formData(form);
    var url = jsbin.getURL({ root: jsbin.shareRoot });
    var OGurl = jsbin.getURL();

    if (data.state === 'snapshot' && jsbin.state.latest) {
      url += '/' + selectedSnapshot;
      OGurl += '/' + selectedSnapshot;
    }

    var shareurl = url;

    // get a comma separated list of the panels that should be shown
    var query = data.panel.join(',');

    if (query) {
      query = '?' + query;
    }

    $sharepanels.prop('disabled', data.view === 'output');
    $sharepreview.attr('class', data.view);

    if (data.view !== 'output') {
      $sharepreview.find('.editor div').each(function () {
        this.hidden = data.panel.indexOf(this.className) === -1;
      });
    }

    if (data.view === 'editor') {
      shareurl += '/edit';
    } else {
      query = '';
    }

    // create the direct links, it'll be faster to inject HTML rather than
    // updating hrefs of a bunch of HTML elements
    $directLinks.empty();

    var directLinksHTML = []; //['<a href="' + url + '.html">html</a>'];

    var code = ''
    var ext = '';

    code = jsbin.panels.panels.html.getCode().trim();

    if (code) {
      ext = processors[jsbin.state.processors.html || 'html'].extensions[0];
      if (ext !== 'html') {
        directLinksHTML.push('<a target="_blank" href="' + url + '.' + ext + '">' + ext + '</a>');
      } else if (code.toLowerCase().indexOf('<svg') === 0) {
        directLinksHTML.push('<a target="_blank" href="' + url + '.svg">svg</a>');
      }
    }

    if (jsbin.panels.panels.css.getCode().trim()) {
      ext = processors[jsbin.state.processors.css || 'css'].extensions[0];
      if (ext !== 'css') {
        directLinksHTML.push('<a target="_blank" href="' + url + '.css">css</a>');
      }
      directLinksHTML.push('<a target="_blank" href="' + url + '.' + ext + '">' + ext + '</a>');
    }

    code = jsbin.panels.panels.javascript.getCode().trim();

    if (code) {
      ext = processors[jsbin.state.processors.javascript || 'javascript'].extensions[0];

      if (ext !== 'js') {
        directLinksHTML.push('<a target="_blank" href="' + url + '.js">js</a>');
      }

      try {
        JSON.parse(code);
        directLinksHTML.push('<a target="_blank" href="' + url + '.json">json</a>');
      } catch (e) {
        directLinksHTML.push('<a target="_blank" href="' + url + '.' + ext + '">' + ext + '</a>');
      }

    }

    $directLinks.html(directLinksHTML.join(''));

    linkselect.value = link.href = shareurl + query;
    embed.value = ('<a class="jsbin-embed" href="' + OGurl + '/embed' + query + '">' + documentTitle + ' on jsbin.com</a><' + 'script src="' + jsbin.static + '/js/embed.min.js?' + jsbin.version + '"><' + '/script>').replace(/<>"&/g, function (m) {
        return {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          '&': '&amp;'
        }[m];
      });
  }

  // when the user clicks on "snapshot" we automatically create a snapshot at
  // that point (technically this isn't a snapshot, but clearing the write
  // access, so the next user input creates the *next* snapshot - which is
  // actually the latest copy).
  $('#sharebintype input[type=radio]').on('change', function () {
    if (this.value === 'snapshot') {
      jsbin.state.checksum = false;
      saveChecksum = false; // jshint ignore:line
      $withLiveReload.hide();
    } else {
      $withLiveReload.show();
    }
  });

  $sharemenu.find('input').on('change', update);

  $document.on('saved', function () {

    // revert to the latest bin state
    $realtime.prop('checked', true);

    // show the share menu
    $sharemenu.removeClass('hidden');

    update();
  });

  var $share = $('#share').closest('.menu');
  var shareElement = $('#sharemenu a')[0];
  var $showShare = $('a.show-share').on('click', function () {
    if ($share.hasClass('open')) {
      closedropdown(shareElement);
    } else {
      opendropdown(shareElement, true); // true = no focus
    }
    $showShare.blur();
  });

});

define('skylark-jsbin-client/chrome/issue',[
  "skylark-jquery",
   "../jsbin"
],function ($,jsbin) {

  /*global $:true, jsbin:true */
    'use strict';

    function githubIssue() {
      var url = 'http://github.com/jsbin/jsbin/issues/new';
      var body = ['Please provide any additional information, record a screencast ',
                 'with http://quickcast.io or http://screenr.com and attach a screenshot ',
                 'if possible.\n\n**JS Bin info**\n\n* [%url%/edit](%url%/edit)\n* ',
                 window.navigator.userAgent + '\n',
                 (jsbin.user && jsbin.user.name ? '* ' + jsbin.user.name : ''),
                 '\n'].join('');

      return url + '?body=' + encodeURIComponent(body.replace(/%url%/g, jsbin.getURL({ withRevision: true })));
    }

    var $newissue = $('#newissue');

    $('#help').parent().on('open', function () {
      $newissue.attr('href', githubIssue());
    });

    return githubIssue;


});
define('skylark-jsbin-client/chrome/download',[
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
define('skylark-jsbin-client/chrome/login',[
  "skylark-jquery",
   "../jsbin"
],function ($,jsbin) {
  /* global $ */

  $('form.login').submit(function (event) {
    'use strict';
    event.preventDefault();

    var form = $(this),
        name = form.find('input[name=username]').val(),
        key = form.find('input[name=password]').val(),
        email = form.find('input[name=email]').val(),
        $loginFeedback = form.find('.loginFeedback');


    // jsbin.settings.home = name; // will save later
    $loginFeedback.show().text('Checking...');

    $.ajax({
      url: form.attr('action'),
      data: { username: name, key: key, email: email },
      type: 'POST',
      dataType: 'json',
      complete: function (jqXHR) {
        var data = $.parseJSON(jqXHR.responseText) || {};
        // cookie is required to share with the server so we can do a redirect on new bin
        if (jqXHR.status === 200) {
          if (data.avatar) {
            $('a.avatar').find('img').remove().end().prepend('<img src="' + data.avatar + '">');
          }
          if (data.message) {
            $loginFeedback.text(data.message);
          } else {
            window.location = window.location.pathname + window.location.search;
          }
        } else {
          analytics.login(false);
          $loginFeedback.text(data.message || ('"' + name + '" has already been taken. Please either double check the password, or choose another username.'));
        }
      }
    });
  });

});
define('skylark-jsbin-client/chrome/tips',[
  "skylark-jquery",
   "../jsbin"
],function ($,jsbin) {

    var $html = $(document.documentElement),
        $tip = $('#tip'),
        $tipContent = $('p', $tip),
        tipTimeout;

    var removeTip = function (cb) {
      $html.removeClass('showtip');
      $tip.removeClass();
      $tipContent.html('');
      $(window).resize();
      cb && setTimeout(cb, 0);
    };

    var setTip = function (data) {
      clearTimeout(tipTimeout);
      $tipContent.html(data.content);
      $tip.removeClass().addClass(data.type || 'info');
      $html.addClass('showtip');
      if (!data.autohide) return;
      tipTimeout = setTimeout(function () {
        removeTip();
      }, parseInt(data.autohide, 10) || 5 * 1000);
    };

    /**
     * Trigger a tip to be shown.
     *
     *   $document.trigger('tip', 'You have an infinite loop in your HTML.');
     *
     *    $document.trigger('tip', {
     *      type: 'error',
     *      content: 'Do you even Javascript?',
     *      autohide: 8000
     *    });
     */
    jsbin.$document.on('tip', function (event, data) {
      var tipData = data;
      if (typeof data === 'string') {
        tipData = {};
        tipData.content = data;
        tipData.type = 'info';
      }
      // If the content and the type haven't changed, just set it again.
      if ($tipContent.html() === tipData.content &&
          $tip.hasClass(tipData.type)) return setTip(data);
      removeTip(function () {
        setTip(tipData);
      });
    });

    $('#tip').on('click', 'a.dismiss', function () {
      removeTip();
      return false;
    });

    // Escape
   jsbin.$document.keydown(function (event) {
      if (event.which == 27) {
        removeTip();
      }
    });

  });
define('skylark-jsbin-client/chrome/keys',[
  "skylark-jquery",
   "../jsbin"
],function ($,jsbin) {
  /*global jsbin*/
  /*global $document*/
  'use strict';

  // don't store the keys if they're logged in, since we have this on the server
  if (jsbin.user && jsbin.user.name) {
    return;
  }

  var keys = {};

  var find = function (url) {
    var key = keys[url || jsbin.getURL({ withRevision: true, withoutRoot: true })] || {};
    return key.c;
  };

  try {
    if ('localStorage' in window && window['localStorage'] !== null) { // jshint ignore:line

    }
  } catch(e){
    return find;
  }

  function init() {
    keys = JSON.parse(localStorage.keys || '{}');
  }

  $document.on('saved', function () {
    keys[jsbin.getURL({ withRevision: false, withoutRoot: true })] = { s: jsbin.state.revsion, c: jsbin.state.checksum, d: (new Date()).getTime() };
    localStorage.keys = JSON.stringify(keys);
  });

  // update the key lookup when a new key is stored
  window.addEventListener('storage', function (event) {
    if (event.key === 'keys') {
      init();
    }
  });

  init();

  return jsbin.keys = find;

});
define('skylark-jsbin-client/chrome/save',[
   "../jsbin"
],function (jsbin) {
  /*jshint strict: false */
  /*globals $, analytics, jsbin, documentTitle, $document, throttle, editors*/
  var saving = {
    todo: {
      html: false,
      css: false,
      javascript: false
    },
    _inprogress: false,
    inprogress: function (inprogress) {
      if (typeof inprogress === 'undefined') {
        return saving._inprogress;
      }

      saving._inprogress = inprogress;
      if (inprogress === false) {
        var panels = ['html','css','javascript'];

        var save = function () {
          var todo = panels.pop();
          if (todo && saving.todo[todo]) {
            saving._inprogress = true;
            updateCode(todo, save);
            saving.todo[todo] = false;
          } else if (todo) {
            save();
          }
        };

        save();
      }
    }
  };

  function getTagContent(tag) {
    var html = jsbin.panels.panels.html.getCode();
    var result = '';

    // if we don't have the tag, bail with an empty string
    if (html.indexOf('<' + tag) === -1) {
      return result;
    }

    if (tag !== 'title' && tag !== 'meta') {
      console.error('getTagContent for ' + tag + ' is not supported');
      return result;
    }

    // grab the content based on the earlier defined regexp
    html.replace(getTagContent.re[tag], function (all, capture1, capture2) {
      result = tag === 'title' ? capture1 : capture2;
    });

    return result;
  }

  getTagContent.re = {
    meta: /(<meta name="description" content=")([^"]*)/im,
    title: /<title>(.*)<\/title>/im
  };


  // to allow for download button to be introduced via beta feature
  $('a.save').click(function (event) {
    event.preventDefault();

    analytics.milestone();
    // if save is disabled, hitting save will trigger a reload
    var ajax = true;
    if (jsbin.saveDisabled === true) {
      ajax = false;
    }

    if ((jsbin.state.changed || jsbin.mobile) || !jsbin.owner()) {
      saveCode('save', ajax);
    }

    return false;
  });

  var $shareLinks = $('#share .link');
  var $panelCheckboxes = $('#sharemenu #sharepanels input');

  // TODO remove split when live
  var split = $('#sharemenu .share-split').length;

  // TODO candidate for removal
  function updateSavedState() {
    'use strict';
    if (split) {
      return;
    }

    var mapping = {
      live: 'output',
      javascript: 'js',
      css: 'css',
      html: 'html',
      console: 'console'
    };

    var withRevision = true;

    var query = $panelCheckboxes.filter(':checked').map(function () {
      return mapping[this.getAttribute('data-panel')];
    }).get().join(',');
    $shareLinks.each(function () {
      var path = this.getAttribute('data-path');
      var url = jsbin.getURL({ withRevision: withRevision }) + path + (query && this.id !== 'livepreview' ? '?' + query : ''),
          nodeName = this.nodeName;
      var hash = panels.getHighlightLines();

      if (hash) {
        hash = '#' + hash;
      }

      if (nodeName === 'A') {
        this.href = url;
      } else if (nodeName === 'INPUT') {
        this.value = url;
        if (path === '/edit') {
          this.value += hash;
        }
      } else if (nodeName === 'TEXTAREA') {
        this.value = ('<a class="jsbin-embed" href="' + url + hash + '">' + documentTitle + '</a><' + 'script src="' + jsbin.static + '/js/embed.js"><' + '/script>').replace(/<>"&/g, function (m) {
            return {
              '<': '&lt;',
              '>': '&gt;',
              '"': '&quot;',
              '&': '&amp;'
            }[m];
          });
      }
    });
  }

  $('#sharemenu').bind('open', updateSavedState);
  $('#sharebintype input[type=radio]').on('click', function () {
    if (this.value === 'snapshot') {
      jsbin.state.checksum = false;
      saveChecksum = false;
    }
    updateSavedState();
  });

  var lastHTML = null;

  function updateDocMeta(event, data) {
    if (data) {
      if (data.panelId !== 'html') {
        return; // ignore non-html updates
      }
    }

    var currentHTML = jsbin.panels.panels.html.getCode();
    if (lastHTML !== currentHTML) {
      lastHTML = currentHTML;

      var description = getTagContent('meta');
      if (description !== jsbin.state.description) {
        jsbin.state.description = description;
        jsbin.state.updateSettings({ description: description });
      }

      var title = getTagContent('title');
      if (title !== jsbin.state.title) {
        jsbin.state.title = title;
        jsbin.state.updateSettings({ title: title });

        documentTitle = title;
        if (documentTitle) {
          document.title = documentTitle + ' - ' + jsbin.name;
        } else {
          document.title = jsbin.name;
        }
      }
    }
  }

  $document.on('saveComplete', updateDocMeta); // update, not create

  $document.on('saved', function () {
    jsbin.state.changed = false;
    updateSavedState();

    $('#sharebintype input[type=radio][value="realtime"]').prop('checked', true);

    $shareLinks.closest('.menu').removeClass('hidden');

    $('#jsbinurl').attr('href', jsbin.getURL()).removeClass('hidden');
    $('#clone').removeClass('hidden');

    updateDocMeta();
  });

  var saveChecksum = jsbin.state.checksum || store.sessionStorage.getItem('checksum') || false;

  // store it back on state
  jsbin.state.checksum = saveChecksum;

  if (saveChecksum) {
    // remove the disabled class, but also remove the cancelling event handlers
    $('#share div.disabled').removeClass('disabled').unbind('click mousedown mouseup');
  } else {
    $('#share div.disabled').one('click', function (event) {
      event.preventDefault();
      $('a.save').click();
    });
  }

  $document.one('saved', function () {
    $('#share div.disabled').removeClass('disabled').unbind('click mousedown mouseup');
  });

  function onSaveError(jqXHR, panelId) {
    if (jqXHR.status === 413) {
      // Hijack the tip label to show an error message.
      $('#tip p').html('Sorry this bin is too large for us to save');
      $(document.documentElement).addClass('showtip');
    } else if (jqXHR.status === 403) {
      $document.trigger('tip', {
        type: 'error',
        content: 'I think there\'s something wrong with your session and I\'m unable to save. <a href="' + window.location + '"><strong>Refresh to fix this</strong></a>, you <strong>will not</strong> lose your code.'
      });
    } else if (panelId) {
      if (panelId) { savingLabels[panelId].text('Saving...').animate({ opacity: 1 }, 100); }
      window._console.error({message: 'Warning: Something went wrong while saving. Your most recent work is not saved.'});
    }
  }



  // only start live saving it they're allowed to (whereas save is disabled if they're following)
  if (!jsbin.saveDisabled) {
    $('.code.panel .label .name').append('<span class="saved">Saved</span>');

    var savingLabels = {
      html: $('.panel.html .name span.saved'),
      javascript: $('.panel.javascript .name span.saved'),
      css: $('.panel.css .name span.saved'),
    };

    $document.bind('jsbinReady', function () {
      jsbin.state.changed = false;
      jsbin.panels.allEditors(function (panel) {
        panel.on('processor', function () {
          // if the url doesn't match the root - i.e. they've actually saved something then save on processor change
          if (jsbin.root !== jsbin.getURL()) {
            $document.trigger('codeChange', [{ panelId: panel.id }]);
          }
        });
      });

      $document.bind('codeChange', function (event, data) {
        jsbin.state.changed = true;
        // savingLabels[data.panelId].text('Saving');
        if (savingLabels[data.panelId]) {
          savingLabels[data.panelId].css({ 'opacity': 0 }).stop(true, true);
        }
      });

      $document.bind('saveComplete', throttle(function (event, data) {
        // show saved, then revert out animation
        savingLabels[data.panelId]
          .text('Saved')
          .stop(true, true)
          .animate({ opacity: 1 }, 100)
          .delay(1200)
          .animate({ opacity: 0 }, 500);
      }, 500));

      $document.bind('codeChange', throttle(function (event, data) {
        if (!data.panelId) {
          return;
        }

        if (jsbin.state.deleted) {
          return;
        }

        var panelId = data.panelId;

        jsbin.panels.savecontent();

        if (saving.inprogress()) {
          // queue up the request and wait
          saving.todo[panelId] = true;
          return;
        }

        saving.inprogress(true);

        // We force a full save if there's no checksum OR if there's no bin code/url
        if (!saveChecksum || !jsbin.state.code) {
          // create the bin and when the response comes back update the url
          saveCode('save', true);
        } else {
          updateCode(panelId);
        }
      }, 30 * 1000));
    });
  } else {
    $document.one('jsbinReady', function () {
      'use strict';
      var shown = false;
      if (!jsbin.embed && !jsbin.sandbox) {
        $document.on('codeChange.live', function (event, data) {
          if (!data.onload && !shown && data.origin !== 'setValue') {
            shown = true;
            var ismac = navigator.userAgent.indexOf(' Mac ') !== -1;
            var cmd = ismac ? '⌘' : 'ctrl';
            var shift = ismac ? '⇧' : 'shift';
            var plus = ismac ? '' : '+';

            $document.trigger('tip', {
              type: 'notification',
              content: 'You\'re currently viewing someone else\'s live stream, but you can <strong><a class="clone" href="' + jsbin.root + '/clone">clone your own copy</a></strong> (' + cmd + plus + shift + plus + 'S) at any time to save your edits'
            });
          }
        });
      }
    });
  }

  function compressKeys(keys, obj) {
    obj.compressed = keys;
    keys.split(',').forEach(function (key) {
      obj[key] = LZString.compressToUTF16(obj[key]);
    });
  }

  function updateCode(panelId, callback) {
    var panelSettings = {};

    if (jsbin.state.processors) {
      panelSettings.processors = jsbin.state.processors;
    }

    var data = {
      code: jsbin.state.code,
      revision: jsbin.state.revision,
      method: 'update',
      panel: panelId,
      content: editors[panelId].getCode(),
      checksum: saveChecksum,
      settings: JSON.stringify(panelSettings),
    };

    if (jsbin.settings.useCompression && location.protocol === 'http:') {
      compressKeys('content', data);
    }

    if (jsbin.state.processors[panelId] &&
      jsbin.state.processors[panelId] !== panelId &&
      jsbin.state.cache[panelId]) {
      data.processed = jsbin.state.cache[panelId].result;
    }

    $.ajax({
      url: jsbin.getURL({ withRevision: true }) + '/save',
      data: data,
      type: 'post',
      dataType: 'json',
      headers: {'Accept': 'application/json'},
      success: function (data) {
        $document.trigger('saveComplete', { panelId: panelId });
        if (data.error) {
          saveCode('save', true, function () {
            // savedAlready = data.checksum;
          });
        } else {
          jsbin.state.latest = true;
        }
      },
      error: function (jqXHR) {
        onSaveError(jqXHR, panelId);
      },
      complete: function () {
        saving.inprogress(false);
        if (callback) { callback(); }
      }
    });
  }

  $('a.clone').click(clone);
  $('#tip').delegate('a.clone', 'click', clone);

  function clone(event) {
    event.preventDefault();

    // save our panel layout - assumes our user is happy with this layout
    jsbin.panels.save();
    analytics.clone();

    var $form = setupform('save,new');
    $form.submit();

    return false;
  }

  function setupform(method) {
  var $form = $('form#saveform').empty()
      .append('<input type="hidden" name="javascript" />')
      .append('<input type="hidden" name="html" />')
      .append('<input type="hidden" name="css" />')
      .append('<input type="hidden" name="method" />')
      .append('<input type="hidden" name="_csrf" value="' + jsbin.state.token + '" />')
      .append('<input type="hidden" name="settings" />')
      .append('<input type="hidden" name="checksum" />');

    var settings = {};

    if (jsbin.state.processors) {
      settings.processors = jsbin.state.processors;
    }

    // this prevents new revisions forking off the welcome bin
    // because it's looking silly!
    if (jsbin.state.code === 'welcome') {
      $form.attr('action', '/save');
    }

    $form.find('input[name=settings]').val(JSON.stringify(settings));
    $form.find('input[name=javascript]').val(editors.javascript.getCode());
    $form.find('input[name=css]').val(editors.css.getCode());
    $form.find('input[name=html]').val(editors.html.getCode());
    $form.find('input[name=method]').val(method);
    $form.find('input[name=checksum]').val(jsbin.state.checksum);

    return $form;
  }

  function pad(n){
    return n<10 ? '0'+n : n;
  }

  function ISODateString(d){
    return d.getFullYear()+'-'
      + pad(d.getMonth()+1)+'-'
      + pad(d.getDate())+'T'
      + pad(d.getHours())+':'
      + pad(d.getMinutes())+':'
      + pad(d.getSeconds())+'Z';
  }

  function saveCode(method, ajax, ajaxCallback) {
    // create form and post to it
    var $form = setupform(method);
    // save our panel layout - assumes our user is happy with this layout
    jsbin.panels.save();
    jsbin.panels.saveOnExit = true;

    var data = $form.serializeArray().reduce(function(obj, data) {
      obj[data.name] = data.value;
      return obj;
    }, {});

    if (jsbin.settings.useCompression) {
      compressKeys('html,css,javascript', data);
    }

    if (ajax) {
      $.ajax({
        url: jsbin.getURL({ withRevision: true }) + '/save',
        data: data,
        dataType: 'json',
        type: 'post',
        headers: {'Accept': 'application/json'},
        success: function (data) {
          if (ajaxCallback) {
            ajaxCallback(data);
          }

          store.sessionStorage.setItem('checksum', data.checksum);
          saveChecksum = data.checksum;

          jsbin.state.checksum = saveChecksum;
          jsbin.state.code = data.code;
          jsbin.state.revision = data.revision;
          jsbin.state.latest = true; // this is never not true...end of conversation!
          jsbin.state.metadata = { name: jsbin.user.name };
          $form.attr('action', jsbin.getURL({ withRevision: true }) + '/save');

          if (window.history && window.history.pushState) {
            // updateURL(edit);
            var hash = panels.getHighlightLines();
            if (hash) { hash = '#' + hash; }
            var query = panels.getQuery();
            if (query) { query = '?' + query; }
            // If split is truthy (> 0) then we are using the revisonless feature
            // this is temporary until we release the feature!
            window.history.pushState(null, '', jsbin.getURL({withRevision: !split}) + '/edit' + query + hash);
            store.sessionStorage.setItem('url', jsbin.getURL({withRevision: !split}));
          } else {
            window.location.hash = data.edit;
          }

          $document.trigger('saved');
        },
        error: function (jqXHR) {
          onSaveError(jqXHR, null);
        },
        complete: function () {
          saving.inprogress(false);
        }
      });
    } else {
      $form.submit();
    }
  }

});
define('skylark-jsbin-client/chrome/navigation',[
  "skylark-jquery",
   "../jsbin"
],function ($,jsbin) {
  var $startingpoint = $('a.startingpoint').click(function (event) {
    event.preventDefault();
    if (localStorage) {
      analytics.saveTemplate();
      localStorage.setItem('saved-javascript', editors.javascript.getCode());
      localStorage.setItem('saved-html', editors.html.getCode());
      localStorage.setItem('saved-css', editors.css.getCode());

      localStorage.setItem('saved-processors', JSON.stringify({
        javascript: jsbin.panels.panels.javascript.processor.id,
        html: jsbin.panels.panels.html.processor.id,
        css: jsbin.panels.panels.css.processor.id,
      }));

      $document.trigger('tip', {
        type: 'notification',
        content: 'Starting template updated and saved',
        autohide: 3000
      });
    } else {
      $document.trigger('tip', {
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

    jsbin.panels.hideAll();
    return false;
  });

  var $lockrevision = $('div.lockrevision').on('click', function (event) {
    event.preventDefault();
    saveChecksum = false;
    $document.trigger('locked');
  }).on('mouseup', function () {
    return false;
  });

  $document.on('locked', function () {
    if (!$lockrevision.data('locked')) {
      analytics.lock();
      $lockrevision.removeClass('icon-unlocked').addClass('icon-lock');
      $lockrevision.html('<span>This bin is now locked from further changes</span>');
      $lockrevision.data('locked', true);
    }
  });

  // var $lockrevision = $('.lockrevision').on('click', function (event) {
  // });

  $document.on('saved', function () {
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
      jsbin.panels.getVisible().forEach(function (panel) {
        $panelCheckboxes.filter('[data-panel="' + panel.id + '"]').prop('checked', true).change();
      });

    });

  }

  var dropdownOpen = false,
      onhover = false,
      menuDown = false;

  function opendropdown(el, nofocus) {
    var menu;
    if (!dropdownOpen) {
      menu = $(el).closest('.menu').addClass('open').trigger('open');
      // $body.addClass('menuinfo');
      analytics.openMenu(el.hash.substring(1));
      var input = menu.find(':text:visible:first');

      if (input.length && !jsbin.mobile) {
        input.focus();
        setTimeout(function () {
          input[0].select();
        }, 0);
      }
      dropdownOpen = el;
    }
  }

  function closedropdown() {
    menuDown = false;
    if (dropdownOpen) {
      dropdownButtons.closest('.menu').removeClass('open').trigger('close');
      // $body.removeClass('menuinfo');
      dropdownOpen = false;
      onhover = false;
      var f = jsbin.panels.focused;
      if (f && !jsbin.mobile) {
        f.focus();
        if (f.editor) {
          f.editor.focus();
        }
      }
    }
  }

  var dropdownButtons = $('.button-dropdown, .button-open').mousedown(function (e) {
    $dropdownLinks.removeClass('hover');
    if (dropdownOpen && dropdownOpen !== this) {
      closedropdown();
    }
    if (!dropdownOpen) {
      menuDown = true;
      opendropdown(this);
    }
    e.preventDefault();
    return false;
  }).mouseup(function () {
    if (menuDown) return false;
  }).click(function () {
    if (!menuDown) {
      analytics.closeMenu(this.hash.substring(1));
      closedropdown();
    }
    if (menuDown) {
      $(this.hash).attr('tabindex', 0);
      menuDown = false;
      return jsbin.mobile;
    }

    menuDown = false;

    $(this.hash).attr('tabindex', -1);
    return false;
  });

  $('#actionmenu').click(function () {
    dropdownOpen = true;
  });

  var ignoreUp = false;
  $body.bind('mousedown', function (event) {
    if (dropdownOpen) {
      if ($(event.target).closest('.menu').length) {
        ignoreUp = true;
      }
    }
  }).bind('click mouseup', function (event) {
    if (dropdownOpen && !ignoreUp) {
      if (!$(event.target).closest('.menu').length) {
        closedropdown();
        return false;
      }
    }
    ignoreUp = false;
  });

  var fromClick = false;
  var $dropdownLinks = $('.dropdownmenu a, .dropdownmenu .button').mouseup(function (e) {
    if (e.target.nodeName === 'INPUT') {
      return;
    }

    setTimeout(closedropdown, 0);
    analytics.selectMenu(this.getAttribute('data-label') || this.hash.substring(1) || this.href);
    if (!fromClick) {
      if (this.hostname === window.location.hostname) {
        if ($(this).triggerHandler('click') !== false) {
          window.location = this.href;
        }
      } else {
        if (this.getAttribute('target')) {
          window.open(this.href);
        } else {
          window.location = this.href;
        }
      }
    }
    fromClick = false;
  }).mouseover(function () {
    $dropdownLinks.removeClass('hover');
    $(this).addClass('hover');
  }).mousedown(function (e) {
    if (e.target.nodeName === 'INPUT') {
      return;
    }
    fromClick = true;
  });

  $('#jsbinurl').click(function (e) {
    setTimeout(function () {
      jsbin.panels.panels.live.hide();
    }, 0);
  });

  $('#runwithalerts, li.run-with-js a').click(function (event, data) {
    analytics.run(data);
    if (editors.console.visible) {
      editors.console.render(true);
    } else {
      renderLivePreview(true);
    }
    return false;
  });

  $('#runconsole').click(function () {
    analytics.runconsole();
    editors.console.render(true);
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
    jsbin.panels.allEditors(function (panel) {
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
    jsbin.panels.savecontent = function(){};
    for (i = 0; i < store.sessionStorage.length; i++) {
      key = store.sessionStorage.key(i);
      if (key.indexOf('jsbin.content.') === 0) {
        store.sessionStorage.removeItem(key);
      }
    }

    // clear out the write checksum too
    store.sessionStorage.removeItem('checksum');

    jsbin.panels.saveOnExit = false;

    // first try to restore their default panels
    jsbin.panels.restore();

    // if nothing was shown, show html & live
    setTimeout(function () {
      if (jsbin.panels.getVisible().length === 0) {
        jsbin.panels.panels.html.show();
        jsbin.panels.panels.live.show();
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

        $document.trigger('tip', {
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
    $document.trigger('tip', {
      content: 'It looks like your last session may have crashed, so I\'ve disabled "Auto-run JS" for you',
      type: 'error',
    });
    store.sessionStorage.removeItem('runnerPending');
    jsbin.settings.includejs = false;
  }

  $('#enablejs').change(function () {
    jsbin.settings.includejs = this.checked;
    analytics.enableLiveJS(jsbin.settings.includejs);
    editors.live.render();
  }).attr('checked', jsbin.settings.includejs);

  if (!jsbin.embed && jsbin.settings.hideheader) {
    $body.addClass('hideheader');
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
    var editor = jsbin.panels.panels.html,
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
        $document.trigger('tip', {
          type: 'notification',
          content: 'This bin is now published to your vanity URL: <a target="_blank" href="' + jsbin.shareRoot + '">' + jsbin.shareRoot + '</a>'
        });
      },
      error: function (xhr) {
        $document.trigger('tip', {
          type: 'error',
          content: 'There was a problem publishing to your vanity URL. Can you try again or file a <a target="_blank" href="' + githubIssue() + '">new issue</a>?'
        });
      }
    })
  });

  $document.on('click', 'a.deleteallbins', function () {
    if (jsbin.user && jsbin.state.metadata.name === jsbin.user.name) {
      if (confirm('Delete all snapshots of this bin including this one?')) {
      analytics.deleteAll();
      $.ajax({
        type: 'post',
        url: jsbin.getURL() + '/delete-all',
        success: function () {
          jsbin.state.deleted = true;
          $document.trigger('tip', {
            type: 'error',
            content: 'This bin and history is now deleted. You can continue to edit, but once you leave the bin can\'t be retrieved'
          });
        },
        error: function (xhr) {
          if (xhr.status === 403) {
            $document.trigger('tip', {
              content: 'You don\'t own this bin, so you can\'t delete it.',
              autohide: 5000
            });
          }
        }
      });

    }
    } else {
      $document.trigger('tip', {
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
          $document.trigger('tip', {
            type: 'error',
            content: 'This bin is now deleted. You can continue to edit, but once you leave the bin can\'t be retrieved'
          });
        },
        error: function (xhr) {
          if (xhr.status === 403) {
            $document.trigger('tip', {
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
    var first = (jsbin.panels.getVisible() || ['html']).shift();
    if (jsbin.settings.editor.simple || jsbin.mobile) {
      $('#' + first.id).focus();
    } else if (first) {
      first.editor.focus();
    } else {
      jsbin.panels.panels.html.editor.focus();
    }
    return false;
  });

  }());

});
define('skylark-jsbin-client/chrome/file-drop',[
  "skylark-jquery",
   "../jsbin"
],function ($,jsbin) {
  function allowDrop(holder) {
    var cursorPosition = null;
    var panel = null;

    var guid = (function() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
      }
      return function() {
        return s4() + s4();
      };
    })();

    function uploadAsset(file) {
      var loading = document.createElement('div');
      loading.className = 'assetLoading';
      loading.innerHTML = '0% uploading...';
      var currentStatus = 0;

      var progress = function progress(percent, status) {
        if (percent - currentStatus < 10) {
          currentStatus = percent;
        } else {
          currentStatus += 10;
          requestAnimationFrame(function () {
            progress(percent, status);
          });
        }

        if (loading && currentStatus > 0) {
          if (currentStatus > 97) {
            loading.innerHTML = '97% uploaded...';
            // because there's some lag between 100% and actually rendering
          } else {
            loading.innerHTML = currentStatus + '% uploaded...';
          }
        }
      };

      var widget = null;
      var insertPosition = cursorPosition || panel.getCursor();
      if (!jsbin.lameEditor) {
        var line = cursorPosition ? cursorPosition.line : panel.getCursor().line;
        widget = panel.addLineWidget(line, loading, {coverGutter: false, nohscroll: true});
      } else {
        insertTextArea(panel, 'Uploading ...', true);
      }

      var s3upload = new S3Upload({
        s3_sign_put_url: '/account/assets/sign',
        s3_object_name: file.name.replace(/\s+/g, '-'),
        files: [file],

        onProgress: function (percent, status) {
          if (!jsbin.lameEditor) {
            requestAnimationFrame(function () {
              progress(percent, status);
            });
          }
        },

        onError: function (reason, fromServer) {
          currentStatus = -1;
          console.error('Failed to upload: ' + fromServer);
          loading.innerHTML = fromServer || 'Failed to complete';
          loading.style.color = 'red';
          panel = null;
          cursorPosition = null;
          if (widget) {
            setTimeout(function () {
              widget.clear();
            }, 4000);
          }
        },

        onFinishS3Put: function (url) {
          if (!jsbin.lameEditor) {
            widget.clear();
            panel.replaceRange(getInsertText(file.type, panel, url), insertPosition);
          } else {
            insertTextArea(panel, getInsertText(file.type, panel, url));
            $(document).trigger('codeChange', { panelId: panel.id });
          }
          panel = null;
          cursorPosition = null;
        }
      });
    }

    function insertTextArea(el, string, select) {
      var start = el.selectionStart;
      var end = el.selectionEnd;

      var target = el;
      var value = target.value;

      // set textarea value to: text before caret + tab + text after caret
      target.value = value.substring(0, start) + string + value.substring(end);

      // put caret at right position again (add one for the tab)
      el.selectionStart = el.selectionEnd = start + 1;

      if (select) {
        el.selectionStart -= 1;
        el.selectionEnd = el.selectionEnd + string.length;
      } else {
        el.selectionStart = el.selectionEnd = start + string.length;
      }
    }

    function getInsertText(mime, cm, url) {
      // var panel = jsbin.panels.panels[cm.id];
      var processor = jsbin.state.processors[cm.id];

      if (cm.id === 'html') {
        if (mime.indexOf('image/') === 0) {
          if (processor === 'markdown') {
            return '![' + url + '](' + url + ')';
          }

          if (processor === 'jade') {
            return 'img(src="' + url + '")';
          }

          return '<img src="' + url + '">';
        }

        return url;
      }

      if (cm.id === 'css') {
        if (mime.indexOf('image/') === 0) {
          return 'url(' + url + ')';
        }

        return url;
      }

      // note: js just gets the url...
      return url;
    }

    var dragging = false;

    holder.ondragover = function () {
      dragging = true;
      return false;
    };

    holder.ondragend = function () {
      dragging = false;
      return false;
    };

    function getFileData(item) {
      return new Promise(function (resolve, reject) {
        if (item.kind === 'string') {
          item.getAsString(function (filename) {
            resolve(filename);
          });
        } else {
          resolve(item.getAsFile());
        }
      });
    }

    $('#bin textarea').on('paste', function (jQueryEvent) {
      if ($(this).closest('.CodeMirror').length) {
        panel = $(this).closest('.CodeMirror')[0].CodeMirror;
      } else {
        panel = this;
      }

      var event = jQueryEvent.originalEvent;
      var items = event.clipboardData.items;

      // this means we've copied a file that's an app icon, or it's just text
      // which we don't want to kick in anyway.
      if (!items || event.clipboardData.types[0].indexOf('text/') === 0) {
        return;
      }

      var file = null;
      var promises = [];
      for (var i = 0; i < items.length; i++) {
        promises.push(getFileData(items[i]));
      }

      Promise.all(promises).then(function (data) {
        var blobname = data.sort(function (a, b) {
          return typeof a === 'string' ? 1 : -1;
        });
        var file = data[0];
        file.name = data[1] || guid() + '.' + file.type.split('/')[1];

        uploadAsset(file);
      }).catch(function (error) {
        console.log(error.stack);
      });

      // FIXME???
      jQueryEvent.preventDefault();
    });

    $('.CodeMirror').on('mousemove', function (e) {
      if (!dragging) {
        return;
      }

      panel = this.CodeMirror;
      cursorPosition = this.CodeMirror.coordsChar({ top: event.y, left: event.x });
      this.CodeMirror.setCursor(cursorPosition);
    });

    var jstypes = ['javascript', 'coffeescript', 'coffee', 'js'];
    var csstypes = ['css', 'less', 'sass', 'scss'];
    var htmltypes = ['html', 'markdown', 'plain'];

    holder.ondrop = function (e) {
      dragging = false;
      e.preventDefault();

      if ($(e.target).closest('.CodeMirror').length) {
        panel = $(e.target).closest('.CodeMirror')[0].CodeMirror;
      } else {
        panel = e.target;
      }

      var file = e.dataTransfer.files[0],
          reader = new FileReader();

      if (file.type.indexOf('text/') !== 0) {
        // this isn't a text file for populating the panel, try uploading instead
        uploadAsset(file);
        return;
      }

      reader.onload = function (event) {
        // put JS in the JavaScript panel
        var type = file.type ? file.type.toLowerCase().replace(/^(text|application)\//, '') : file.name.toLowerCase().replace(/.*\./g, ''),
            panelId = null,
            panel = editors[panelId],
            syncCode = event.target.result,
            scroller = null;

        if (jstypes.indexOf(type) !== -1) {
          panelId = 'javascript';
        } else if (csstypes.indexOf(type) !== -1) {
          panelId = 'css';
        } else if (htmltypes.indexOf(type) !== -1) {
          panelId = 'html';
        }

        if (panelId === null) {
          // then we have an asset upload
          return uploadAsset(file);
        }

        panel = editors[panelId];
        scroller = panel.editor.scroller;

        panel.setCode(event.target.result);
        panel.show();

        try {
          // now kick off - basically just doing a copy and paste job from @wookiehangover - thanks man! :)
          var worker = new Worker(jsbin['static'] + '/js/editors/sync-worker.js');

          // pass the worker the file object
          worker.postMessage(file);

          panel.$el.find('> .label').append('<small> (live: edit & save in your fav editor)</small>');

          // bind onmessage handler
          worker.onmessage = function (event) {
            var top = scroller.scrollTop;
            panel.setCode(event.data.body);
            scroller.scrollTop = top;
            syncCode = event.data.body;
          };
        } catch (e) {
          // fail on the awesomeness...oh well
        }
      };

      reader.readAsText(file);

      return false;
    };
  }

  // test for dnd and file api first
  if (!!(window.File && window.FileList && window.FileReader)) {
    allowDrop(document.body);
  }
});
define('skylark-jsbin-client/chrome/gist',[
  "skylark-jquery",
  "skylark-jsbin-coder/editors/panels",
   "../jsbin"
],function ($,panels,jsbin) {
    /*global $:true, jsbin:true, processors:true, $document*/
    'use strict';

    // Only allow gist import/export if CORS is supported
    var CORS = !!('withCredentials' in new XMLHttpRequest() ||
                  typeof XDomainRequest !== 'undefined');
    if (!CORS) {
      return $(function () {
        $('#export-as-gist').remove();
      });
    }

    var Gist = function (id) {
      var gist = this,
          token = '';
      gist.code = {};
      if (jsbin.user && jsbin.user.github_token) { // jshint ignore:line
        token = '?access_token=' + jsbin.user.github_token; // jshint ignore:line
      }
      $.get('https://api.github.com/gists/' + id + token, function (data) {
        if (!data) {return;}
        $.each(data.files, function (fileName, fileData) {
          var ext = fileName.split('.').slice(-1).join('');
          gist.code[ext] = fileData.content;
        });
        gist.setCode();
      });
      return this;
    };

    Gist.prototype.setCode = function () {
      var gist = this;
      $.each(gist.code, function (ext, data) {
        var processorInit = jsbin.processors.findByExtension(ext),
            target = processorInit.target || processorInit.id,
            panel = panels.named[target];
        if (!panel) {return;}
        processors.set(target, processorInit.id);
        jsbin.saveDisabled = true;
        panel.setCode(data);
        jsbin.saveDisabled = false;
      });
    };

    /**
     * Export as gist
     */

    $('a.export-as-gist').click(function () {
      var gist = {
        public: true,
        files: {}
      };

      var panels = {
        html: panels.named.html.render(),
        javascript: panels.named.javascript.render(),
        css: panels.named.css.render()
      };

      Promise.all(panels).then(function (panels) { // RSVP.hash
        // Build a file name
        Object.keys(panels).forEach(function (key) {
          var ext = processors[key].extensions ? processors[key].extensions[0] : key;
          var file = ['jsbin', (jsbin.state.code || 'untitled'), ext].join('.');
          if (panels[key].length) {
            gist.files[file] = {
              content: panels[key]
            };
          }
        });

        if (!gist.files.javascript && !gist.files.css) {
          delete gist.files[['jsbin', (jsbin.state.code || 'untitled'), 'html'].join('.')]
        }

        if (jsbin.state.processors) {
          panels.source = jsbin.state.processors;
          Object.keys(panels.source).forEach(function (key) {
            panels.source[key] = jsbin.panels.panels[key].getCode();
          });
        }

        var index = binToFile(panels);

        gist.files['index.html'] = {
          content: index
        };

        var desc = [];

        if (jsbin.state.title) {
          desc.push(jsbin.state.title);
        }

        if (jsbin.state.description) {
          desc.push(jsbin.state.description);
        }

        desc.push('// source ' + jsbin.getURL());

        gist.description = desc.join('\n\n');

        var token = '';
        if (jsbin.user && jsbin.user.github_token) { // jshint ignore:line
          token = '?access_token=' + jsbin.user.github_token; // jshint ignore:line
        }

        $.ajax({
          type: 'POST',
          url: 'https://api.github.com/gists' + token,
          data: JSON.stringify(gist),
          dataType: 'json',
          crossDomain: true,
          success: function (data) {
            jsbin.$document.trigger('tip', {
              type: 'notification',
              content: 'Gist created! <a href="' + data.html_url + '" target="_blank">Open in new tab.</a>' // jshint ignore:line
            });
          },
          error: function (xhr, status, error) {
            jsbin.$document.trigger('tip', {
              type: 'error',
              content: 'There was a problem creating the gist: ' + error
            });
            console.group('gist');
            console.log(gist);
            console.groupEnd('gist');
          }
        });
      }, function (error) {
        console.error(error.stack);
      });

      // return false becuase there's weird even stuff going on. ask @rem.
      return false;
    });

    return Gist;


});
define('skylark-jsbin-client/chrome/spinner',[
  "skylark-jquery",
   "../jsbin"
],function ($,jsbin) {
  function spinner(element) {
    'use strict';
    var c = element || document.createElement('canvas');
    if (!c.getContext) {
      return false;
    }
    var ctx = c.getContext('2d');

    var rafID = null;

    c.height = c.width = 11;

    var TORADIAN = Math.PI / 180;
    var w = c.width;
    var h = c.height;
    var deg = 0;
    var r = 4;
    var speed = 4;
    var tailspeed = 1/7;

    ctx.strokeStyle = 'rgba(0,0,0,.5)';
    ctx.lineWidth = 1.5;

    var last = true;
    function draw() {
      rafID = window.requestAnimationFrame(draw);

      deg += speed;

      var start = ((deg * tailspeed)) % 360; // A / TAIL
      var end = deg % 360;              // B / HEAD
      var flip = end === start;

      if (flip) {
        last = !last;
        // this prevents a single blank frame when
        // the start and end have the same value
        start -= 1;
      }

      ctx.fillStyle = '#f9f9f9';
      ctx.strokeStyle = '#111';
      ctx.fillRect(w/2 - r*2, h/2 - r*2, r * 4, r * 4);
      ctx.beginPath();
      ctx.arc(w/2 + 0.5, h/2 + 0.5, r, start * TORADIAN, end * TORADIAN, last);
      ctx.stroke();

      ctx.strokeStyle = '#999';
      ctx.beginPath();
      ctx.arc(w/2 + 0.5, h/2 + 0.5, r, end * TORADIAN, start * TORADIAN, last);
      ctx.stroke();

      ctx.closePath();

    }

    return {
      element: c,
      start: draw,
      stop: function () {
        window.cancelAnimationFrame(rafID);
      }
    };
  }

  return jsbin.spinner = spinner;
});
define('skylark-jsbin-client/chrome/infocard',[
  "skylark-jquery",
   "../jsbin"
],function ($,jsbin) {
  if ('EventSource' in global) {
    return setupInfocard()
  } else {
    $.getScript(jsbin['static'] + '/js/vendor/eventsource.js', setupInfocard);
  }
  function setupInfocard() {
    /*global spinner, $, jsbin, prettyDate, EventSource, throttle, $document, analytics, throttle*/
    'use strict';

    // don't insert this on embeded views
    if (jsbin.embed) {
      return;
    }

    var $template = $('#infocard'); // donkey way of cloning from template
    var $header = $template.find('header');
    var canvas = $header.find('canvas')[0];
    var s = spinner(canvas);
    var htmlpanel = jsbin.panels.panels.html;
    var viewers = 0;
    var es = null;

    var re = {
      head: /<head(.*)\n/i,
      meta: /(<meta name="description" content=")([^"]*)/im,
      title: /<title>(.*)<\/title>/im
    };

    if ($template.length === 0) {
      return;
    }



    function updateStats(event, _data) {
      var data = _data ? JSON.parse(_data) : JSON.parse(event.data);

      if (data.connections > 0 && viewers === 0) {
        $template.addClass('viewers');
      }

      if (viewers !== data.connections) {
        var $b = $header.find('.viewers b').removeClass('up down').html('<b>' + data.connections + '<br>' + viewers + '<br>' + data.connections + '</b>'),
            c = viewers > data.connections ? 'down' : 'up';
        setTimeout(function () {
          $b.addClass(c);
        }, 0);
      }

      viewers = data.connections;

      if (viewers === 0) {
        setTimeout(function () {
          $template.removeClass('viewers');
        }, 250);
      }

    }

    function listenStats(owner) {
      if (window.EventSource && owner) {
        // TODO use pagevisibility api to close connection
        if (es) {
          es.close();
        }
        es = new EventSource(jsbin.getURL() + '/stats?checksum=' + jsbin.state.checksum);
        es.addEventListener('stats', throttle(updateStats, 1000));
      }
    }

    function insertTag(tag) {
      var cm = htmlpanel.editor;
      var html = htmlpanel.getCode();

      if (tag === 'meta') {
        tag = 'meta name="description';
      }


      if (html.indexOf('<' + tag) === -1) {
        var userhtml = getPanelText(tag === 'title' ? 'title' : 'description', '');
        if (re.head.test(html)) {
          html = html.replace(re.head, '<head$1\n' + userhtml);
        } else {
          // slap in the top
          html = userhtml + html;
        }
        htmlpanel.setCode(html);
      }
    }

    function getPanelText(type, text) {
      var processor = jsbin.state.processors.html;

      text = text.replace(/"/g, '&quot;');

      if (type === 'title') {
        if (processor === 'jade') {
          return 'title ' + text + '\n';
        }

        return '<title>' + text + '</title>\n';
      }

      if (type === 'description') {
        if (processor === 'jade') {
          return 'meta(name="description", content="' + text + '")\n';
        }

        return '<meta name="description" content="' + text + '">\n';
      }

      return text;
    }


    if ($template.find('.settings')) {
      $template.find('#title').on('input', function () {
        insertTag('title');
        var html = htmlpanel.getCode();
        var value = this.value;
        var result = html.replace(re.title, function (all, capture) {
          return '<title>' + value.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</title>';
        });
        updateCode(result);
        jsbin.state.updateSettings({ title: this.value });
      });

      $template.find('#description').on('input', function () {
        insertTag('meta');
        var html = htmlpanel.getCode();
        var value = this.value;
        var result = html.replace(re.meta, function (all, capture) {
          return capture + value.replace(/"/g, '&quot;');
        });
        updateCode(result);
        jsbin.state.updateSettings({ description: this.value });
      });
    }

    function updateCode(result) {
      // capture selection and cursor
      var state = null;
      var cursor = null;
      var cm = htmlpanel.editor;
      var selected = cm.somethingSelected();
      if (jsbin.panels.panels.html.visible) {
        if (selected) {
          state = cm.listSelections();
        }
        cursor = cm.getCursor();
      }

      htmlpanel.setCode(result);

      // then restore
      if (jsbin.panels.panels.html.visible) {
        if (!jsbin.mobile) cm.setCursor(cursor);
        if (selected) {
          cm.setSelections(state);
        }
      }
    }

    function updateInfoCard(event) {
      var meta = jsbin.state.metadata || {};
      var classes = [];
      var owner = false;

      if (meta.name) {
        $header.find('.name b').html(meta.name);
        $header.find('img').attr('src', meta.avatar);
        classes.push(meta.name);
      }

      if (jsbin.state.checksum || (jsbin.user && (meta.name === jsbin.user.name))) {
        owner = true;
        classes.push('author');
      }

      if (s) {
        s.stop();
      }

      if (!jsbin.state.streaming || owner === true) {
        $header.find('time').html(event ? 'just now' : prettyDate(meta.last_updated));
      } else if (owner === false) {
        $header.find('time').html('Streaming');
        classes.push('streaming');
        if (s) {
          s.start();
        }
      }

      if (!jsbin.checksum) {
        classes.push('meta');
      }

      if (meta.pro) {
        classes.push('pro');
      }

      $header.find('.visibility').text(meta.visibility);

      if (meta.visibility === 'private') {
        classes.push('private');
      } else if (meta.visibility === 'public') {
        classes.push('public');
      } // TODO handle team

      if (jsbin.state.code) {
        $template.addClass(classes.join(' ')).parent().removeAttr('hidden');
      }

      if (jsbin.state.streaming) {
        if (window.EventSource && owner) {
          listenStats(owner);
          handleVisibility(owner);
          var url = jsbin.getURL();
          $document.on('saved', function () {
            var newurl = window.location.toString();
            if (url !== newurl) {
              es.close();
              listenStats(owner);
            }
          });
        } else if (jsbin.saveDisabled === true && window.location.pathname.slice(-5) === '/edit') {
          $.getScript(jsbin.static + '/js/spike.js?' + jsbin.version);
          $document.on('stats', throttle(updateStats, 1000));
        }
      }
    }

    function handleVisibility(owner) {
      var hiddenProperty = 'hidden' in document ? 'hidden' :
        'webkitHidden' in document ? 'webkitHidden' :
        'mozHidden' in document ? 'mozHidden' :
        null;
      var visibilityStateProperty = 'visibilityState' in document ? 'visibilityState' :
        'webkitVisibilityState' in document ? 'webkitVisibilityState' :
        'mozVisibilityState' in document ? 'mozVisibilityState' :
        null;

      if (visibilityStateProperty) {
        var visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
        document.addEventListener(visibilityChangeEvent, function visibilityChangeEvent() {
          if (document[hiddenProperty]) { // hidden
            es.close();
          } else {
            listenStats(owner);
          }
        });
      }
    }

    function initHandlers() {
      $('a.more').add($header).on('mousedown touchstart', function (e) {
        infocardVisible = !infocardVisible; // this is hack :-\
        hideOpen();
        e.preventDefault();
        analytics.infocard('click', 'no-result');
        var toTrigger;
        $template.toggleClass(function (index, klass) {
          toTrigger = klass.indexOf('open') === -1 ? 'open' : 'close';
          infocardVisible = toTrigger === 'open';
          return 'open';
        }).trigger(toTrigger);
      });

      $template.one('open', function () {
        var statusCode = $('#status').data('status') || 200;
        $.getJSON(jsbin.static + '/js/http-codes.json', function (codes) {
          var html = '';
          codes.forEach(function (code) {
            html += '<option value="' + code.code + '">' + code.string + '</option>';
          });
          $('#status').html(html).val(statusCode).on('change', function () {
            jsbin.state.updateSettings({ statusCode: this.value });
          });
        });
      }).on('close', function () {

      });

      function updateHeaders() {
        // grab all the headers with values and send that instead
        var headers = {};
        $template.find('.row').each(function () {
          if ($(this).find('[name="header-value"]').val().trim()) {
            headers[$(this).find('input:first').val()] = $(this).find('input:last').val();
          }
        });

        jsbin.state.updateSettings({ headers: headers }, 'PUT');
      }

      var $headers = $template.find('#headers');
      $template.on('click', '#headers button', function (event) {
        event.preventDefault();
        var $fields = $headers.find('span:last');
        updateHeaders();

        var $clones = $fields.clone(true);
        $fields.before($clones);
        $fields.find('input').val('').eq(0).focus();
      });

      $template.on('input', '.row input', function () {
        updateHeaders($(this).closest('.row'));
      });
    }

    initHandlers();
    updateInfoCard();
    $document.bind('saved', updateInfoCard);
  }
});

define('skylark-jsbin-client/chrome/last-bin',[
  "skylark-jquery",
   "../jsbin"
],function ($,jsbin) {
  'use strict';

  function getExpires() {
    var d = new Date();

    // expires in 1 hour from now
    d.setTime(+d + 1000 * 60 * 60);
    return d.toUTCString();
  }

  function save() {
    var url = window.location.href;
    if (url) {
      document.cookie = 'last=' + encodeURIComponent(url) + '; expires=' + getExpires() + '; path=/';
    } else {
      // expire cookie
      document.cookie = 'last=""; expires=-1; path=/';
    }
  }

  function readCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }

  function updateBackButton() {
    var el = document.getElementById('back');
    var back = readCookie('last');

    if (el && back !== null && back !== '%2Fedit') {
      el.href = decodeURIComponent(back);
    }
  }

  // save the bin url when the bin is saved, changed and when we load first time
  if (jsbin && jsbin.getURL) {
    $document.on('saved', save);
    save();
  } else {
    updateBackButton();
  }
});
define('skylark-jsbin-client/chrome/archive',[
  "skylark-jquery",
   "../jsbin",
   "./analytics"
],function ($,jsbin,analytics) {
  function archive(unarchive) {
    /*global jsbin, $, $document, analytics*/
    'use strict';
    var type = unarchive === false ? 'unarchive' : 'archive';
    var text = unarchive === false ? 'restore from archive' : 'archiving';
    analytics[type](jsbin.getURL({ withRevision: true }));
    if (!jsbin.user.name) {
      jsbin.$document.trigger('tip', {
        type: 'notication',
        content: 'You must be logged in and the owner of the bin to archive.'
      });
    } else if (jsbin.owner()) {
      $.ajax({
        type: 'POST',
        url: jsbin.getURL({ withRevision: true }) + '/' + type,
        error: function () {
          $document.trigger('tip', {
            type: 'error',
            content: 'The ' + text + ' failed. If this continues, please can you file an issue?'
          });
        },
        success: function () {
          jsbin.state.metadata.archive = unarchive !== false;
          updateArchiveMenu();
          $document.trigger('tip', {
            type: 'notication',
            autohide: 5000,
            content: 'This bin is now ' + (unarchive === false ? 'restored from the archive.' : 'archived.')
          });
        }
      });
    } else {
      jsbin.$document.trigger('tip', {
        type: 'notication',
        content: 'The ' + text + ' failed. You can only archive bins that you own.'
      });
    }
  }

  function updateArchiveMenu() {
    if (jsbin.state.metadata && jsbin.state.metadata.archive) {
      $('a.archivebin').hide();
      $('a.unarchivebin').show();
    } else {
      $('a.archivebin').show();
      $('a.unarchivebin').hide();
    }
  }

  updateArchiveMenu();

  return jsbin.archive = archive;
});
define('skylark-jsbin-client/chrome/transfer',[
  "skylark-jquery",
   "../jsbin"
],function ($,jsbin) {
   var $transfers = $('a.transfer').on('click', function (event) {
      event.preventDefault();
      var to = prompt('Enter the username to transfer this bin to');
      to = (to || '').trim().toLowerCase();

      if (to.length) {
        $.ajax({
          url: jsbin.getURL({ withRevision: true }) + '/transfer',
          method: 'post',
          data: {
            to: to,
            _csrf: jsbin.state.token,
          },
          success: function () {
            window.location.reload();
          },
          error: function (e) {
            console.log(e);
            if (e.status === 403) {
              alert('This bin cannot be transferred as you do not own it.');
            } else if (e.status === 400) {
              alert('The user "' + to + '" couldn\'t be found, sorry.');
            } else {
              alert('Failed to transfer bin');
            }
          }
        });
      }

    });

    var updateTransfer = function () {
      if (jsbin.owner()) {
        $transfers.show();
      } else {
        $transfers.hide();
      }
    }

    ///updateTransfer();

    return updateTransfer;
});
define('skylark-jsbin-client/chrome/welcome-panel',[
  "skylark-jquery",
   "../jsbin",
   "./analytics"
],function ($,jsbin,analytics) {
    /*global jsbin, $, $body, $document, analytics, settings*/
    'use strict';

    if (!$('#toppanel').length) {
      return;
    }

    if (jsbin.settings.gui === undefined) {
      jsbin.settings.gui = {};
    }
    if (jsbin.settings.gui.toppanel === undefined) {
      jsbin.settings.gui.toppanel = true;
      store.localStorage.setItem('settings', JSON.stringify(jsbin.settings));
    }

    if ($body.hasClass('toppanel') && jsbin.settings.gui.toppanel === false) {
      $body.addClass('toppanel-close');
      $body.removeClass('toppanel');
    }

    // analytics for panel state
    analytics.welcomePanelState(jsbin.settings.gui.toppanel);

    var removeToppanel = function() {
      jsbin.settings.gui.toppanel = false;
      settings.save();
      $body.addClass('toppanel-close');
      $body.removeClass('toppanel');

      // $document.trigger('sizeeditors');
    };

    var showToppanel = function() {
      jsbin.settings.gui.toppanel = true;
      settings.save();
      $body.removeClass('toppanel-close');
      $body.addClass('toppanel');
    };

    var goSlow = function(e) {
      $body.removeClass('toppanel-slow');
      if (e.shiftKey) {
        $body.addClass('toppanel-slow');
      }
    };

    $('.toppanel-logo').on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
      $document.trigger('sizeeditors');
    });

    $('.toppanel-hide').click(function(event) {
      event.preventDefault();
      goSlow(event);
      removeToppanel();
    });
    $('.toppanel-logo').click(function(event) {
      event.preventDefault();
      goSlow(event);
      showToppanel();
    });
    // $document.keydown(function (event) {
    //   if (event.which === 27) {
    //     if ($body.hasClass('toppanel')) {
    //       removeToppanel();
    //     }
    //   }
    // });

    function shuffle(array) {
      var m = array.length, t, i;

      // While there remain elements to shuffle...
      while (m) {

        // Pick a remaining element...
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
      }

      return array;
    }

    $.ajax({
      // tries to cache once a day
      url: '/blog/all.json?' + (new Date()).toString().split(' ').slice(0, 4).join('-'),
      dataType: 'json',
      cache: true,
      success: function (data) {
        var blogpost = data.blog[0];
        // this is daft, but it means that the landing page is the same
        // for all, and ensures that blog comments end up on a single place
        var root = jsbin.root.replace(/^https/, 'http');
        $('.toppanel-blog ul').html('<li><a href="' + root + '/' + blogpost.slug + '" target="_blank" class="toppanel-link">' + blogpost.title.replace(/TWDTW.*:\s/, '') + '</a></li>');

        var last = null;
        var count = 1;
        try {
          last = store.localStorage.getItem('lastpost') || null;
        } catch (e) {}

        if (last !== null) {
          last *= 1;
          if (last < blogpost.timestamp) {
            count = data.blog.reduce(function (prev, current) {
              if (last < current.timestamp) {
                return prev + 1;
              }
              return prev;
            }, 0);
          } else {
            count = 0;
          }
        }

        if (count) {
          $('.blog a').attr('href', root + '/' + data.blog[count-1].slug).attr('data-count', count).on('click', function () {
            // this is a weird hack work around to try to clear the storage
            // item that says which was the last post viewed. so we update
            // the timestamp when the user clicks the link, because we know
            // they'll land on the latest post
            try {
              localStorage.lastpost = data.blog[count-1].timestamp;
            } catch (e) {}
          });
        }

        var help = shuffle(data.help);

        $('.toppanel-help ul').html('<li><a href="' + root + '/' + help[0].slug + '" target="_blank" class="toppanel-link">' + help[0].title + '</a></li><li><a href="' + root + '/' + help[1].slug + '" target="_blank" class="toppanel-link">' + help[1].title + '</a></li>');

      }
    })

    // analytics for links
    $('#toppanel').find('.toppanel-link').mousedown(function() {
      analytics.welcomePanelLink(this.href);
    });

 });
define('skylark-jsbin-client/chrome/help-search',[
  "skylark-jquery",
   "../jsbin"
],function ($,jsbin) {

    'use strict';
    var results = $('#results');
    var resultCount = $('#result-count');
    var searchTerms = [];
    var search = $('#helpsearch');
    var position = -1;

    search.on('input', throttle(function () {
      if (searchTerms.length === 0) {
        $.ajax({
          url: '/help/search.json?' + (new Date()).toString().split(' ').slice(0, 4).join('-'),
          dataType: 'json',
          cache: true,
          success: function (data) {
            searchTerms = data;
            searchFor(this.value, searchTerms);
          }.bind(this)
        });
      } else {
        searchFor(this.value, searchTerms);
      }
      position = -1;
    }, 200));

    // document.documentElement.addEventListener('click', function (event) {
    //   if (event.target.id === 'search' || event.target.id === 'results') {

    //   } else {
    //     resultsEl.hidden = true;
    //   }
    // });

    results.on('mousemove', function () {
      if (position !== -1) {
        results.children().remove('highlight');
        position = -1;
      }
    });

    search.on('keydown', function (event) {
      var key = event.which;
      if (key === 38 || key === 40) { // up / down
        event.preventDefault();
        var inc = 1;
        if (key === 38) {
          inc = -1;
        }

        position += inc;

        var children = results.children();

        var length = children.length;
        children.removeClass('hover');

        if (position < 0) {
          position = length - 1;
        } else if (position > length - 1) {
          position = 0;
        }

        children.eq(position).addClass('hover');
      } else if (key === 13) { // select
        var url = results.find('.hover')[0];
        if (url) {
          window.open(url.href);
          // window.location = url.href;
        }
      }
    });

    // search.on('focus', function () {
    //   results.hide();
    // });

    function wordmap(input) {
      var ignore = "a an and on in it of if for the i is i'm i'd it's or to me be not was do so at are what bin bins".split(' ');

      var endings = 'ing ly lies s';
      var endingRe = new RegExp('(' + endings.split(' ').join('|') + ')$');

      return (input||'')
        //- strip html
        .replace(/(<([^>]+)>)/ig,'')
        //- strip non-letters
        .replace(/\W/g, ' ').replace(/["'\.,]/g, '')
        //- turn in to array of lower case words
        .toLowerCase().split(' ')
        //- filter out ignored words
        .filter(function (word) {
          return ignore.indexOf(word.trim()) === -1;
        }).filter(function (e, i, words) {
          //- return unique
          return words.lastIndexOf(e) === i;
        }).filter(function (word) {
          //- return words 3 chars or longer
          return word.length > 2;
        }).map(function (word) {
          return word.trim().replace(endingRe, '');
        }).sort();
    }

    function searchFor(needles, haystack) {
      'use strict';
      needles = wordmap(needles);
      var matches = haystack.map(function (data) {
        var matches = needles.filter(function (needle) {
          return data.words.indexOf(needle) !== -1;
        }).length;

        return {
          type: data.type,
          title: data.title,
          slug: data.slug,
          category: data.category,
          matches: matches
        };
      }).filter(function (data) {
        return data.matches > 0;
      }).sort(function (a, b) {
        return b.matches - a.matches;
      });

      results.html(matches.map(function (result) {
        return '<a target="_blank" class="button" href="/' + result.slug + '">' + result.title + (result.type === 'blog' ? ' (blog)' : '') + '</a>';
      }).join('\n'));

      results.show();
      var s = '';
      if (matches.length !== 1) {
        s = 's';
      }
      resultCount.html(matches.length + ' result' + s);
    }


});

define('skylark-jsbin-client/chrome/app',[
  "skylark-jquery",
   "../jsbin",
   "./gist",
   "./analytics"
],function ($,jsbin,Gist,analytics) {
  // if a gist has been requested, lazy load the gist library and plug it in
  if (/gist\/.*/.test(window.location.pathname)) {
    window.editors = editors; // needs to be global when the callback triggers to set the content
    loadGist = function () {
      window.gist = new Gist(window.location.pathname.replace(/.*\/([^/]+)$/, "$1"));
    };

    if (editors.ready) {
      loadGist();
    } else {
      $document.on('jsbinReady', loadGist);
    }
  }

  // prevent the app from accidently getting scrolled out of view
  if (!jsbin.mobile) {
    document.body.onscroll = window.onscroll = function () {
      if (document.body.scrollTop !== 0) {
        window.scrollTo(0,0);
      }
      return false;
    };
  }

  window.CodeMirror = CodeMirror; // fix to allow code mirror to break naturally

  // These are keys that CodeMirror (and Emmet) should never take over
  // ref: https://gist.github.com/rodneyrehm/5213304
  if (CodeMirror.keyMap && CodeMirror.keyMap['default']) {
    var cmd = $.browser.platform === 'mac' ? 'Cmd' : 'Ctrl';
    delete CodeMirror.keyMap['default'][cmd + '-L'];
    delete CodeMirror.keyMap['default'][cmd + '-T'];
    delete CodeMirror.keyMap['default'][cmd + '-W'];
    delete CodeMirror.keyMap['default'][cmd + '-J'];
    delete CodeMirror.keyMap['default'][cmd + '-R'];
  }

  // var link = document.createElement('link');
  // link.rel = 'stylesheet';
  // link.href = jsbin['static'] + '/css/font.css?' + jsbin.version;
  // link.type = 'text/css';
  // document.getElementsByTagName('head')[0].appendChild(link);

  if (jsbin.embed) {
    analytics.embed();
  }

});
define('skylark-jsbin-client/main',[
	"skylark-jsbin-coder",
	"./jsbin",
    "./chrome/font",
    "./chrome/splitter",
    "./chrome/analytics",
    "./chrome/settings",
    "./render/saved-history-preview",
    "./chrome/esc",
    "./chrome/share",
    "./chrome/issue",
    "./chrome/download",
    "./chrome/login",
    "./chrome/tips",
    "./chrome/keys",
    "./chrome/save",
    "./chrome/navigation",
    "./chrome/file-drop",
    "./chrome/gist",
    "./chrome/spinner",
    "./chrome/infocard",
    "./chrome/last-bin",
    "./chrome/archive",
    "./chrome/transfer",
    "./chrome/welcome-panel",
    "./chrome/help-search",
    "./chrome/app"

],function(coder,jsbin){
	return jsbin;
});
define('skylark-jsbin-client', ['skylark-jsbin-client/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-jsbin-client.js.map
