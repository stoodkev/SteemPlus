if (typeof chrome !== 'undefined') {
    window.SMI_AJAX = function(ajax) {
        var eid = chrome.runtime.id;
        console.log(ajax);
        chrome.runtime.sendMessage(eid, {
            type: 'ajax',
            ajax: ajax
        }, function(response) {
            console.log(response);
            if (response.error) {
                ajax.error(response.error);
            } else {
                ajax.success(response.data);
            }
        });
    };
} else {
    var SMI_R_MAP = {};
    var SMI_R_NEXT_INDEX = 1;

    window.SMI_AJAX = function(ajax) {
        var index = SMI_R_NEXT_INDEX++;
        SMI_R_MAP[index] = {
            type: 'ajax',
            success: ajax.success,
            error: ajax.error
        };
        delete ajax.success;
        delete ajax.error;

        window.postMessage({
            direction: "from-page-script",
            index: index,
            message: {
                type: 'ajax',
                ajax: ajax
            }
        }, "*");
    };

    window.addEventListener("message", function(event) {
        if (event.source == window &&
            event.data &&
            event.data.direction == "from-content-script") {

            var index = event.data.index;
            var r = SMI_R_MAP[index];
            if (!r) {
                return;
            }
            if (r.type === 'ajax') {
                var response = event.data.message;
                if (response.error) {
                    r.error(response.error);
                } else {
                    r.success(response.data);
                }
            }
            delete SMI_R_MAP[index];
        }
    });

}