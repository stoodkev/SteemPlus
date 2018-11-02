// Content script interfacing the website and the extension
var steem_keychain = {
    current_id: 1000,
    requests: {},

    requestHandshake: function(callback) {
        let request={extension:chrome.runtime.id};
        console.log(request);
        this.dispatchCustomEvent("swHandshake", request,callback);
    },

    requestVerifyKey: function(account, message, key, callback) {
        var request = {
            type: "decode",
            username: account,
            message: message,
            method: key,
            extension:chrome.runtime.id,
            extensionName:chrome.runtime.getManifest().name
        };

        this.dispatchCustomEvent("swRequest", request, callback);
    },
    // Example comment_options: {"author":"stoodkev","permlink":"hi","max_accepted_payout":"100000.000 SBD","percent_steem_dollars":10000,"allow_votes":true,"allow_curation_rewards":true,"extensions":[[0,{"beneficiaries":[{"account":"yabapmatt","weight":1000},{"account":"steemplus-pay","weight":500}]}]]}
    requestPost: function(account, title, body, parent_perm, parent_account, json_metadata, permlink, comment_options, callback) {
        var request = {
            type: "post",
            username: account,
            title: title,
            body: body,
            parent_perm: parent_perm,
            parent_username: parent_account,
            json_metadata: json_metadata,
            permlink: permlink,
            comment_options: comment_options,
            extension:chrome.runtime.id,
            extensionName:chrome.runtime.getManifest().name
        };
        console.log(request);

        this.dispatchCustomEvent("swRequest", request, callback);
    },

    requestVote: function(account, permlink, author, weight, callback) {
        var request = {
            type: "vote",
            username: account,
            permlink: permlink,
            author: author,
            weight: weight,
            extension:chrome.runtime.id,
            extensionName:chrome.runtime.getManifest().name
        };

        this.dispatchCustomEvent("swRequest", request, callback);
    },

    requestCustomJson: function(account, id, key, json, display_msg, callback) {
        var request = {
            type: "custom",
            username: account,
            id: id, //can be "custom", "follow", "reblog" etc.
            method: key, // Posting key is used by default, active can be specified for id=custom .
            json: json, //content of your json
            display_msg: display_msg,
            extension:chrome.runtime.id,
            extensionName:chrome.runtime.getManifest().name
        };
        console.log(request);

        this.dispatchCustomEvent("swRequest", request, callback);
    },
    requestTransfer: function(account, to, amount, memo, currency, callback,enforce=false) {
        var request = {
            type: "transfer",
            username: account,
            to: to,
            amount: amount,
            memo: memo,
            enforce:enforce,
            currency: currency,
            extension:chrome.runtime.id,
            extensionName:chrome.runtime.getManifest().name
        };
        this.dispatchCustomEvent("swRequest", request, callback);
    },
    requestDelegation: function(username, delegatee, amount,unit, callback) {
        var request = {
            type: "delegation",
            username: username,
            delegatee: delegatee,
            amount: amount,
            unit:unit,
            extension:chrome.runtime.id,
            extensionName:chrome.runtime.getManifest().name
        };
        this.dispatchCustomEvent("swRequest", request, callback);
    },

    // Send the customEvent
    dispatchCustomEvent: function(name, data, callback) {
        this.requests[this.current_id] = callback;
        data = Object.assign({
            request_id: this.current_id
        }, data);
        document.dispatchEvent(new CustomEvent(name, {
            detail: data
        }));
        this.current_id++;
    }
}

chrome.runtime.onMessage.addListener(function(response, sender, sendResponse) {
	if (response&&response.keychain&& response.request_id) {
      console.log(response);
      if (steem_keychain.requests[response.request_id]) {
          steem_keychain.requests[response.request_id](response);
          delete steem_keychain.requests[response.request_id];
      }
  }
});
