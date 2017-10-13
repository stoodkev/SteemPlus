var resteem="show";
var whitelist="";
var blacklist="";
var reputation=false;
var rep="";
var first=true;
var username="";


// Get parameters from local storage
chrome.storage.local.get(['username', 'resteem', 'reputation', 'rep', 'whitelist', 'blacklist'], function (items) {
    if (items.username !== undefined)
        username = items.username;
    if (items.resteem !== undefined)
                resteem = items.resteem;
    if (items.whitelist !== undefined)
        whitelist = items.whitelist;
    if (items.blacklist !== undefined)
        blacklist = items.blacklist;
    if (items.reputation !== undefined)
        reputation = items.reputation;
    if (items.rep !== undefined)
        rep = items.rep;
    //console.log(resteem,whitelist,blacklist,reputation,rep);
    ResteemManager();
});



// Handle resteems according to user preferences
function ResteemManager() {
    tab = window.location.href;
    if (tab.split(".com/")[1][0] === "@" && !tab.split(".com/")[1].match(/\//) && tab.split("@")[1] !== username && first) {

        first = false;
        setTimeout(function () {
            if (document.getElementsByClassName("UserProfile__buttons")[0].firstChild.firstChild.innerHTML === "Unfollow") {
                var user = tab.split("@")[1];
                if (resteem === "blacklist_radio") {
                    var add_blacklist = document.createElement("label");
                    add_blacklist.className += "button slim hollow secondary ";
                    if (!blacklist.includes(user)) {
                        add_blacklist.innerHTML = "Add To Blacklist";
                        add_blacklist.onclick = function () {
                            blacklist += " " + user;
                            chrome.storage.local.set({
                                blacklist: blacklist
                            });
                            location.reload();
                        }
                    }
                    else {
                        add_blacklist.innerHTML = "Remove from Blacklist";
                        add_blacklist.onclick = function () {
                            blacklist = blacklist.replace(user, '').replace(/  +/g, ' ');
                            chrome.storage.local.set({
                                blacklist: blacklist
                            });
                            location.reload();
                        }
                    }
                    document.getElementsByClassName("UserProfile__buttons")[0].firstChild.append(add_blacklist);
                }
                else if (resteem === "whitelist_radio") {
                    var add_whitelist = document.createElement("label");
                    add_whitelist.className += "button slim hollow secondary ";
                    if (!whitelist.includes(user)) {
                        add_whitelist.innerHTML = "Add To Whitelist";
                        add_whitelist.onclick = function () {
                            whitelist += " " + user;
                            chrome.storage.local.set({
                                whitelist: whitelist
                            });
                            location.reload();
                        }
                    }
                    else {
                        add_whitelist.innerHTML = "Remove from Whitelist";
                        add_whitelist.onclick = function () {
                            whitelist = whitelist.replace(user, '').replace(/  +/g, ' ');
                            chrome.storage.local.set({
                                whitelist: whitelist
                            });
                            location.reload();
                        }
                    }
                    document.getElementsByClassName("UserProfile__buttons")[0].firstChild.append(add_whitelist);
                }
            }
        }, 10000);
    }
}

