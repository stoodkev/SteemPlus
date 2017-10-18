chrome.commands.onCommand.addListener(function(command) {
    console.log(command);
    if (command === 'busyfy') {

        chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
            var url = tabs[0].url;
            if (url.includes('steemit.com')) {
                chrome.tabs.getSelected(null, function (tab) {
                    var code = url.replace('steemit.com', 'busy.org');
                    chrome.tabs.update(tab.id, {url: code});
                });
            }
            else if (url.includes('busy.org')) {
                console.log('b2');
                chrome.tabs.getSelected(null, function (tab) {
                    var code = url.replace('busy.org', 'steemit.com');
                    chrome.tabs.update(tab.id, {url: code});
                });
            }
        });

    }
    else if (command === 'steemdify') {

        chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
            var url = tabs[0].url;
            if (url.includes('steemit.com')) {
                chrome.tabs.getSelected(null, function (tab) {
                    var code = url.replace('steemit.com', 'steemd.com');
                    chrome.tabs.update(tab.id, {url: code});
                });
            }
            else if (url.includes('steemd.com')) {
                console.log('b2');
                chrome.tabs.getSelected(null, function (tab) {
                    var code = url.replace('steemd.com', 'steemit.com');
                    chrome.tabs.update(tab.id, {url: code});
                });
            }
        });

    }
});