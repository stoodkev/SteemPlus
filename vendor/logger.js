const IS_DEV_MODE = !('update_url' in chrome.runtime.getManifest());


var logInfo = function(message) {
    console.log(message);
}

var logDebug = function(message) {
    if (IS_DEV_MODE) {
        console.log(message);
    }
}