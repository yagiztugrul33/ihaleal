(function () {
  try {
    var h = window.location.hash;
    if (h && h.length > 1 && h.charAt(1) === '/') {
      var clean = h.slice(1);
      var qIdx = clean.indexOf('?');
      var path = qIdx >= 0 ? clean.slice(0, qIdx) : clean;
      var hashQuery = qIdx >= 0 ? clean.slice(qIdx) : '';
      var search = window.location.search || hashQuery || '';
      window.history.replaceState(null, '', path + search);
    }
  } catch (e) {}
})();
