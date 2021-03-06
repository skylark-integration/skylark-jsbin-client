define([
  "skylark-langx",
  "skylark-jquery",
  "skylark-jsbin-chrome/analytics",
   "../jsbin"
],function (langx,$,analytics,jsbin) {
  langx.mixin(analytics ,  {

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
  });

  // misses the asset upload one
  $('a[data-pro="true"]').on('click', function () {
    analytics.track('try-pro', $(this).text());
  });

  return  analytics;
});