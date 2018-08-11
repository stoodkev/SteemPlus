var first = true;
var spliter = null;
var token_resteem = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.to === 'resteem' && request.order === 'start' && token_resteem == null) {
        token_resteem = request.token;
        ResteemManager(request.data.steemit, request.data.busy, request.data.resteem);
    }
    if (request.to === 'resteem' && request.order === 'click' && token_resteem == request.token)
        ResteemManager(request.data.steemit, request.data.busy, request.data.resteem);
});



// Handle resteems according to user preferences
function ResteemManager(isSteemit, isBusy, resteem) {
    if (isSteemit)
        spliter = '.com/';
    else if (isBusy)
        spliter = '.org/';

    tab = window.location.href;
    if (tab.split(spliter)[1][0] === "@" && !tab.split(spliter)[1].match(/\//) && tab.split("@")[1] !== username && first) {

        first = false;
        setTimeout(function() {
            if (isSteemit && $.inArray(document.getElementsByClassName("UserProfile__buttons")[0].firstChild.firstChild.innerHTML, ["Unfollow", "Se désabonner", "Dejar de seguir", "Отписаться", "Non seguire&nbsp;più"]) > -1) {
                var user = tab.split("@")[1];
                if (resteem.resteem === "blacklist_radio") {
                    var add_blacklist;
                    if (isBusy) {
                        add_blacklist = document.createElement('span');
                        add_blacklist.innerHTML = '<a class="btn btn-sm btn-outline-success" style="margin-left:0.5em;">Blacklist</a>';
                    } else if (isSteemit) {
                        add_blacklist = document.createElement("label");
                        add_blacklist.className += "button slim hollow secondary ";

                    }
                    if (!resteem.blacklist.includes(user)) {
                        if (isSteemit)
                            add_blacklist.innerHTML = "Add To Blacklist";
                        add_blacklist.onclick = function() {
                            resteem.blacklist += " " + user;
                            chrome.storage.local.set({
                                blacklist: resteem.blacklist
                            });
                            location.reload();
                        }
                    } else {
                        if (isSteemit)
                            add_blacklist.innerHTML = "Remove from Blacklist";
                        else
                            add_blacklist.firstChild.className = 'btn btn-sm btn-success';
                        add_blacklist.onclick = function() {
                            resteem.blacklist = resteem.blacklist.replace(user, '').replace(/  +/g, ' ');
                            chrome.storage.local.set({
                                blacklist: resteem.blacklist
                            });
                            location.reload();
                        }
                    }
                    if (isSteemit)
                        document.getElementsByClassName("UserProfile__buttons")[0].firstChild.append(add_blacklist);
                    else document.getElementsByClassName("my-5")[0].append(add_blacklist);
                } else if (resteem.resteem === "whitelist_radio") {
                    var add_whitelist;
                    if (isBusy) {
                        add_whitelist = document.createElement('span');
                        add_whitelist.innerHTML = '<a class="btn btn-sm btn-outline-success" style="margin-left:0.5em;">Whitelist</a>';
                    } else if (isSteemit) {
                        add_whitelist = document.createElement("label");
                        add_whitelist.className += "button slim hollow secondary ";
                    }
                    if (!resteem.whitelist.includes(user)) {
                        if (isSteemit) {
                            add_whitelist.innerHTML = "Add To Whitelist";
                        }
                        add_whitelist.onclick = function() {
                            resteem.whitelist += " " + user;
                            chrome.storage.local.set({
                                whitelist: resteem.whitelist
                            });
                            location.reload();
                        }
                    } else {
                        if (isSteemit)
                            add_whitelist.innerHTML = "Remove from Whitelist";
                        else
                            add_whitelist.firstChild.className = 'btn btn-sm btn-success';

                        add_whitelist.onclick = function() {
                            resteem.whitelist = resteem.whitelist.replace(user, '').replace(/  +/g, ' ');
                            chrome.storage.local.set({
                                whitelist: resteem.whitelist
                            });
                            location.reload();
                        }
                    }
                    if (isSteemit)
                        document.getElementsByClassName("UserProfile__buttons")[0].firstChild.append(add_whitelist);
                    else document.getElementsByClassName("my-5")[0].append(add_whitelist);
                }
            }
        }, 10000);
    }
}