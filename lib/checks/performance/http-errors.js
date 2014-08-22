// detect HTTP errors
exports.name = "http-errors";
exports.category = "performance";

var self = this;

exports.check = function (checker, browser) {
    var urlparse = require("url");

    var sink = checker.sink;
    browser.on('har', function (har) {
        if (har && har.log && har.log.entries) {
            var errors = [];
            var faviconNotFound = false;
            for (var i = 0; i < har.log.entries.length ; i++) {
                var entry = har.log.entries[i];
                if (entry.response.status >= 400) {
                    var urlObj = urlparse.parse(entry.request.url);
                    if (urlObj.path === '/favicon.ico' && entry.response.status === 404) {
                        faviconNotFound = entry.request.url;
                    } else {
                        errors.push({url: entry.request.url,
                                     status: entry.response.status,
                                     statusText: entry.response.statusText});
                    }
                }
            }
            if (errors.length) {
                var errorReports = errors.map(function (e) {
                    return e.url + " with error " + e.status + ' "'
                        + e.statusText + '"';
                });
                checker.report(sink, "http-errors-detected", self.name, self.category, {number: errors.length, errors: errorReports.join(", ")});
            }
            if (faviconNotFound) {
                checker.report(sink, "favicon", self.name, self.category, {url: faviconNotFound});
            }
        }
    });
}