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
                    sessionToken: url.searchParams.get("access_token"),
                    loginMethod: "sc2"
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
              <li id="loginSC"><a href="'+loginURL+'">Via SteemConnect</a></li>';
            if(hasSKC)
              loginIconContent+='<li id="loginKC">Via Keychain</li>';

            loginIconContent+='</ul></span>';
            var loginIcon=$(loginIconContent);
        }
        if (!request.data.connect.connect || request.data.connect.tokenExpire < Date.now()) {
            $(loginIcon).find("#loginButton")
                .attr('src', chrome.extension.getURL("src/img/unlogged.png"))
                .attr('title', 'Login to SteemPlus?');
            $("#loginSC a").attr('href', loginURL);
            if (request.data.connect.connect)
                chrome.storage.local.remove(['sessionToken', 'tokenExpire', 'loginMethod'], function() {
                    location.reload();
                });
        } else {
            if(request.data.connect.method=="sc2")
              showLogout(loginIcon,request.data.connect);
            else if(request.data.connect.method=="keychain"){
              console.log(request.data.connect.user,user);
              if(request.data.connect.user!=user)
                chrome.storage.local.remove(['loginPub', 'loginUser', 'loginMethod'], function() {
                    location.reload();
                })
              else
                verifyKeychainLogin(request.data.connect.user,request.data.connect.public).then(function(success){
                  if(success)
                    showLogout(loginIcon,request.data.connect);
                  else
                    chrome.storage.local.remove(['loginPub', 'loginUser', 'loginMethod'], function() {
                        location.reload();
                    });
                });
            }
        }
        showButton(loginIcon);
        if (!request.data.connect.connect || request.data.connect.tokenExpire < Date.now()) {
          $(".loginIcon").unbind("click").click(function(){
            if($(".dropdown-content").css("visibility")=="hidden")
              $(".dropdown-content").css("visibility","visible");
            else
              $(".dropdown-content").css("visibility","hidden");
          });
        }

        $("#loginKC").click(function(){
          var elementUsername = null;
          if (steemit) elementUsername = '.Header__userpic > span';
          else if (busy) elementUsername = '.Topnav__user';
          if ($(elementUsername).length > 0) {
              if (steemit) user = $(elementUsername)[0].title; //Get username in offline mode
              else if (busy) user = $(elementUsername)[0].href.replace('https://busy.org/@', ''); //Get username in offline mode
              steem.api.getAccounts([user], function(err, result) {
                  if (err) console.log(err);
                  else {
                    const accountLSC=result[0];
                    const posting=accountLSC.posting.key_auths[0][0];
                    steem_keychain.requestVerifyKey(accountLSC.name,window.encodeMemo("5JC7DdhqzsKvRTNPRffDzbJ8pyr6tNqqPs4H97AQToqs9UrEzHy",posting,"#verifyKey"),"Posting",function(result){
                      if(result.result=="#verifyKey")
                      chrome.storage.local.set({
                              loginMethod: "keychain",
                              loginUser: accountLSC.name,
                              loginPub:posting
                          },
                          function() {
                              location.reload();
                          });
                    });
                  }
              });
            }
          });
    }
});

function verifyKeychainLogin(user,publicKey){
  return new Promise(function(fulfill,reject){
        steem_keychain.requestVerifyKey(user,window.encodeMemo("5JC7DdhqzsKvRTNPRffDzbJ8pyr6tNqqPs4H97AQToqs9UrEzHy",publicKey,"#verifyKey"),"Posting",function(result){
          fulfill(result.result=="#verifyKey");
        });
  });
}

function showLogout(loginIcon,connect){
  $(loginIcon).children().first().attr('src', chrome.extension.getURL("src/img/logged.png"))
      .attr('title', 'Log out of SteemPlus?');
  $(loginIcon).click(function() {
      if(connect.method=="sc2")
        api.revokeToken(function(err, res) {
            console.log(err, res);
            chrome.storage.local.remove(['sessionToken', 'tokenExpire','loginMethod'], function() {
              console.log("remove");
                location.reload();
            });
        });
      else
        chrome.storage.local.remove(['loginUser', 'loginPub','loginMethod'], function() {
        console.log("remove");
            location.reload();
        });
  });
}

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
