chrome.commands.onCommand.addListener(function(command) {
    console.log(command);
    if (command === 'busyfy') {

        chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
            var url = tabs[0].url;
            if (url.includes('https://steemit.com')) {
                chrome.tabs.getSelected(null, function (tab) {
                    var code = url.replace('https://steemit.com', 'https://busy.org');
                    chrome.tabs.update(tab.id, {url: code});
                });
            }
            else if (url.includes('https://busy.org')) {
                console.log('b2');
                chrome.tabs.getSelected(null, function (tab) {
                    var code = url.replace('https://busy.org', 'https://steemit.com');
                    chrome.tabs.update(tab.id, {url: code});
                });
            }
        });

    }
    else if (command === 'steemdify') {

        chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
            var url = tabs[0].url;
            if (url.includes('https://steemit.com')) {
                chrome.tabs.getSelected(null, function (tab) {
                    var code = url.replace('https://steemit.com', 'https://steemd.com');
                    chrome.tabs.update(tab.id, {url: code});
                });
            }
            else if (url.includes('https://steemd.com')) {
                console.log('b2');
                chrome.tabs.getSelected(null, function (tab) {
                    var code = url.replace('https://steemd.com', 'https://steemit.com');
                    chrome.tabs.update(tab.id, {url: code});
                });
            }
        });

    }
});