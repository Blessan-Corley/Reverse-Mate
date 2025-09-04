(function () {
    var q = [];
    function defer(fn) {
        if (typeof fn === 'function') q.push(fn);
    }
    function flush() {
        if (!q.length) return;
        
        for (var i = 0; i < q.length; i++) {
            try {
                q[i]();
            } catch (e) {}
        }
        q.length = 0;
    }
    if (typeof window !== 'undefined') {
        window.Perf = { defer: defer, flush: flush };
    }
})();
