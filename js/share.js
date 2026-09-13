/**
 * Shareable result card for Curved Barbell Calculator (PoliShare).
 */
'use strict';

(function () {
  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value : '';
  }

  function text(id) {
    var el = document.getElementById(id);
    return el ? el.textContent.trim() : '';
  }

  function selText(id) {
    var el = document.getElementById(id);
    return el && el.selectedIndex >= 0 ? el.options[el.selectedIndex].text : '';
  }

  PoliShare.init({
    tool: 'curved-barbell-calculator',
    mount: '#results',

    getState: function () {
      var mm = val('anatomy-mm');
      if (!mm) return null;
      return {
        'piercing-type': val('piercing-type'),
        'healing-stage': val('healing-stage'),
        'anatomy-mm': mm,
      };
    },

    applyState: function (s) {
      var ids = ['piercing-type', 'healing-stage', 'anatomy-mm'];
      ids.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && s[id] !== undefined) el.value = s[id];
      });
      var btn = document.getElementById('calc-btn');
      if (btn) btn.click();
    },

    getCard: function () {
      var results = document.getElementById('results');
      if (!results || !results.textContent.trim()) return null;
      var piercing = selText('piercing-type') || val('piercing-type');
      var mm = val('anatomy-mm');
      var lines = results.textContent.trim().split('\n').filter(function (l) { return l.trim(); });
      var h = lines[0] || '';
      return {
        t: piercing + ' barbell: ' + h,
        d: [
          ['Piercing type', piercing],
          ['Anatomy (mm)', mm],
          ['Healing stage', selText('healing-stage') || val('healing-stage')],
          ['Recommendation', h],
        ].concat(lines.slice(1, 4).map(function (l, i) { return ['Detail ' + (i + 1), l.trim()]; })),
      };
    },
  });
})();
