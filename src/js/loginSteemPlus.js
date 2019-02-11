var uri_login, classbutton;
var token_log = null;

var isSteemit = null;
var isBusy = null;
var isUtopian = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.to === 'steemConnect' && request.order === 'start' && token_log == null) {
        isSteemit = request.data.steemit;
        isBusy = request.data.busy;
        isUtopian = request.data.utopian;
        token_log = request.token;
        if (isSteemit) {
            uri_login = 'https://steemit.com/@steem-plus';
            classbutton = 'loginIcon';
        } else if (isBusy) {
            uri_login = 'https://busy.org/@steem-plus';
            classbutton = 'loginIconBusy';
        } else if (isUtopian) {
            uri_login = 'https://utopian.io/@steem-plus';
            classbutton = 'loginIconBusy';
        }

        if (window.location.href.includes('?access_token=')) {
            console.log('create');
            var url = new URL(window.location.href);
            chrome.storage.local.set({
                    tokenExpire: Date.now() + 7 * 24 * 3600 * 1000,
                    sessionToken: url.searchParams.get("access_token")
                },
                function() {
                    window.location.replace(url.searchParams.get("state"));
                });
        } else {
            var loginURL = "https://steemconnect.com/oauth2/authorize?client_id=steem-plus-app&redirect_uri=" + uri_login + "&scope=vote,comment,custom_json,comment_options&state=";
            loginURL += window.location.href;
            let loginIconContent = '<span class="loginIcon">\
            <img id="loginButton"/>\
            <ul class="dropdown-content">\
              <li class="title">Login to SteemPlus</li>\
              <li id="loginSC"><a>Via SteemConnect</a></li>';
            if(hasSKC)
              loginIconContent+='<li id="loginKC">Via Keychain</li>';

            loginIconContent+='</ul></span>';
            var loginIcon=$(loginIconContent);
        }
        if (request.data.steemConnect.connect === false || request.data.steemConnect.tokenExpire < Date.now()) {
            $(loginIcon).find("#loginButton")
                .attr('src', chrome.extension.getURL("src/img/unlogged.png"))
                .attr('title', 'Login to SteemPlus?');
            $("#loginSC a").attr('href', loginURL);
            if (request.data.steemConnect.connect === true)
                chrome.storage.local.remove(['sessionToken', 'tokenExpire'], function() {
                    window.location.replace(window.location.href);
                });
        } else {
            $(loginIcon).children().first().attr('src', chrome.extension.getURL("src/img/logged.png"))
                .attr('title', 'Log out of SteemPlus?');
            $(loginIcon).click(function() {
                api.revokeToken(function(err, res) {
                    console.log(err, res);
                    chrome.storage.local.remove(['sessionToken', 'tokenExpire'], function() {
                        window.location.replace(window.location.href);
                    });
                });
            });
        }
        showButton(loginIcon);
        $(".loginIcon").unbind("click").click(function(){
          if($(".dropdown-content").css("visibility")=="hidden")
            $(".dropdown-content").css("visibility","visible");
          else
            $(".dropdown-content").css("visibility","hidden");
        });
        $("#loginKC").click(function(){
          console.log(account);
          const posting=account.posting.key_auths[0][0];
          console.log(window.encodeMemo("12345",posting,"verifyKey"));
          steem_keychain.requestVerifyKey(account.name,window.encodeMemo("12345",posting,"verifyKey"),"posting",function(result){
            console.log("posting", result);
          });
        });
    }
});

function showButton(loginIcon) {
    console.log('try to show', $('.Header__userpic').length !== 0);
    if (isSteemit) {
        if ($('.Header__userpic').length !== 0)
            $('.Header__usermenu').before(loginIcon);
        else
            setTimeout(function() {
                showButton(loginIcon);
            }, 500);
    } else if (isBusy) {
        if ($('.Topnav__menu-container').length !== 0)
            $('.Topnav__menu-container').append(loginIcon);
        else
            setTimeout(function() {
                showButton(loginIcon);
            }, 500);
    } else if (isUtopian) {
        if ($('.Topnav__version').length !== 0)
            $('.Topnav__version').eq(0).after(loginIcon);
        else
            setTimeout(function() {
                showButton(loginIcon);
            }, 500);
    }
}
