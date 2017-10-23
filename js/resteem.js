var resteem="show";
var whitelist="";
var blacklist="";
var reputation=false;
var rep="";
var first=true;
var username="";
var website,spliter=null;


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
    if(window.location.href.match('steemit.com')) {
        website='steemit';
    spliter='.com/';}
        else if(window.location.href.match('busy.org')) {
        website='busy';
    spliter='.org/';}

    tab = window.location.href;
    if (tab.split(spliter)[1][0] === "@" && !tab.split(spliter)[1].match(/\//) && tab.split("@")[1] !== username && first) {

        first = false;
        setTimeout(function () {
            if ((website==='steemit'&&document.getElementsByClassName("UserProfile__buttons")[0].firstChild.firstChild.innerHTML === "Unfollow")||(website==='busy'&&$('.my-5')[0].innerHTML.match("Followed"))) {
                var user = tab.split("@")[1];
                if (resteem === "blacklist_radio") {
                    var add_blacklist;
                    if(website==='busy') {
                        add_blacklist=document.createElement('span');
                        add_blacklist.innerHTML='<a class="btn btn-sm btn-outline-success" style="margin-left:0.5em;">Blacklist</a>';
                    }
                    else if(website==='steemit'){
                        add_blacklist = document.createElement("label");
                        add_blacklist.className += "button slim hollow secondary ";

                    }
                    if (!blacklist.includes(user)) {
                        if(website==='steemit')
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
                        if(website==='steemit')
                            add_blacklist.innerHTML = "Remove from Blacklist";
                        else
                            add_blacklist.firstChild.className='btn btn-sm btn-success';
                        add_blacklist.onclick = function () {
                            blacklist = blacklist.replace(user, '').replace(/  +/g, ' ');
                            chrome.storage.local.set({
                                blacklist: blacklist
                            });
                            location.reload();
                        }
                    }
                    if(website==='steemit')
                    document.getElementsByClassName("UserProfile__buttons")[0].firstChild.append(add_blacklist);
                    else document.getElementsByClassName("my-5")[0].append(add_blacklist);
                }
                else if (resteem === "whitelist_radio") {
                    var add_whitelist;
                    if(website==='busy') {
                        add_whitelist=document.createElement('span');
                        add_whitelist.innerHTML='<a class="btn btn-sm btn-outline-success" style="margin-left:0.5em;">Whitelist</a>';
                    }
                    else if(website==='steemit'){
                        add_whitelist = document.createElement("label");
                        add_whitelist.className += "button slim hollow secondary ";

                    }
                    if (!whitelist.includes(user)) {
                        if(website==='steemit'){
                            add_whitelist.innerHTML = "Add To Whitelist";}
                        add_whitelist.onclick = function () {
                            whitelist += " " + user;
                            chrome.storage.local.set({
                                whitelist: whitelist
                            });
                            location.reload();
                        }
                    }
                    else {
                        if(website==='steemit')
                          add_whitelist.innerHTML = "Remove from Whitelist";
                        else
                            add_whitelist.firstChild.className='btn btn-sm btn-success';

                        add_whitelist.onclick = function () {
                            whitelist = whitelist.replace(user, '').replace(/  +/g, ' ');
                            chrome.storage.local.set({
                                whitelist: whitelist
                            });
                            location.reload();
                        }
                    }
                    if(website==='steemit')
                        document.getElementsByClassName("UserProfile__buttons")[0].firstChild.append(add_whitelist);
                    else document.getElementsByClassName("my-5")[0].append(add_whitelist);                }
            }
        }, 10000);
    }
}

