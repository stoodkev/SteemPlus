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
    if(tab.match(/feed/)) {
        var reblogged = document.getElementsByClassName("PostSummary__reblogged_by");
        var reblogged_by=Array();
        var user_rep=Array();
        for (var i = 0; i < reblogged.length; i++) {
            reblogged_by[i] = reblogged[i].lastChild.firstChild.innerHTML;
        }

        if(reputation)
            steem.api.getAccounts(reblogged_by, function(err, result) {
                //console.log(result);
                for (var i = 0; i < result.length; i++) {
                    user_rep[i] = steem.formatter.reputation(result[i].reputation);

                }
                ManageResteem();
            });
        else ManageResteem();

    }
    else if(tab.split(".com/")[1][0]==="@"&&!tab.split(".com/")[1].match(/\//)&&tab.split("@")[1]!==username&&first){

        first=false;
            setTimeout(function(){
                if(document.getElementsByClassName("UserProfile__buttons")[0].firstChild.firstChild.innerHTML==="Unfollow") {
                    var user=tab.split("@")[1];
                    if(resteem==="blacklist_radio") {
                        var add_blacklist = document.createElement("label");
                        add_blacklist.className += "button slim hollow secondary ";
                        if(!blacklist.includes(user)) {
                            add_blacklist.innerHTML = "Add To Resteem Blacklist";
                            add_blacklist.onclick=function (){blacklist += " " + user;
                                chrome.storage.local.set({
                                    blacklist: blacklist
                                });
                                location.reload();}
                        }
                        else
                        {
                            add_blacklist.innerHTML = "Remove from Resteem Blacklist";
                            add_blacklist.onclick=function (){
                                blacklist=blacklist .replace(user,'').replace(/  +/g, ' ');
                                chrome.storage.local.set({
                                    blacklist: blacklist
                                });
                                location.reload();}
                        }
                        document.getElementsByClassName("UserProfile__buttons")[0].firstChild.append(add_blacklist);
                    }
                    else if(resteem==="whitelist_radio"){
                        var add_whitelist = document.createElement("label");
                        add_whitelist.className += "button slim hollow secondary ";
                        if(!whitelist.includes(user)) {
                            add_whitelist.innerHTML = "Add To Resteem Whitelist";
                            add_whitelist.onclick=function (){whitelist += " " + user;
                                chrome.storage.local.set({
                                    whitelist: whitelist
                                });
                                location.reload();}
                        }
                        else
                        {
                            add_whitelist.innerHTML = "Remove from Resteem Whitelist";
                            add_whitelist.onclick=function (){
                                whitelist=whitelist .replace(user,'').replace(/  +/g, ' ');
                                chrome.storage.local.set({
                                    whitelist: whitelist
                                });
                                location.reload();}
                        }
                        document.getElementsByClassName("UserProfile__buttons")[0].firstChild.append(add_whitelist);
                    }
                }
                    }, 10000);
    }
    function ManageResteem(){

        switch(resteem)
        {
            //Show all except if reputation is specified
            case "show":
                if(reputation)
                {
                    for (var i = 0; i < reblogged.length; i++) {
                        if(user_rep[i]<rep)
                        reblogged[i].parentNode.style.display = 'none';
                    }
                }
                break;

            //Hide all
            case "hide":
                for (var i = 0; i < reblogged.length; i++) {
                    reblogged[i].parentNode.style.display = 'none';
                }
                break;

            //Show all except blacklist, also check rep
            case "blacklist_radio":
                for (var i = 0; i < reblogged.length; i++) {
                    if (blacklist.split(" ").includes(reblogged_by[i]))
                        reblogged[i].parentNode.style.display = 'none';
                    else if (reputation && user_rep[i] < rep)
                        reblogged[i].parentNode.style.display = 'none';
                    else {
                        if (reblogged[i].lastChild.nodeName === "SPAN") {
                            var add_blacklist = document.createElement("p");
                            add_blacklist.className += "AddBlackList";
                            add_blacklist.innerHTML = "Add To Resteem Blacklist";
                            add_blacklist.onclick = function (arg) {
                                return function () {

                                    blacklist += " " + reblogged_by[arg];
                                    chrome.storage.local.set({
                                        blacklist: blacklist
                                    });
                                    location.reload();

                                };
                            }(i)
                            reblogged[i].appendChild(add_blacklist);
                        }
                    }
                }
                break;

            //Show only from whitelist
            case "whitelist_radio":
                for (var i = 0; i < reblogged.length; i++) {
                    if(!whitelist.split(" ").includes(reblogged_by[i]))
                        reblogged[i].parentNode.style.display = 'none';
                }
                break;

        }
    }

}


// Apply preferences when the page changes height (new posts appear)
function onElementHeightChange(elm, callback){
    var lastHeight = elm.clientHeight, newHeight;
    (function run(){
        newHeight = elm.clientHeight;
        if( lastHeight != newHeight )
            callback();
        lastHeight = newHeight;

        if( elm.onElementHeightChangeTimer )
            clearTimeout(elm.onElementHeightChangeTimer);

        elm.onElementHeightChangeTimer = setTimeout(run, 200);
    })();
}


onElementHeightChange(document.body, function(){
    ResteemManager();
});
