var uri_login,classbutton;
var token_log=null;
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if(request.to==='steemConnect'&&request.order==='start'&&token_log==null)
      {
        token_log=request.token;
        if(request.data.steemit)
        {
          uri_login='https://steemit.com/@steem-plus';
          classbutton='loginIcon';
        }
        else if (request.data.busy){
          uri_login='https://busy.org/@steem-plus';
          classbutton='loginIconBusy';
        }
        else if (request.data.utopian){
          uri_login='https://utopian.io/@steem-plus';
          classbutton='loginIconBusy';
        }

        if(window.location.href.includes('?access_token='))
        {
          console.log('create');
          var url = new URL(window.location.href);
          chrome.storage.local.set({
              tokenExpire: Date.now()+7*24*3600*1000,
              sessionToken:url.searchParams.get("access_token")
          },
          function(){
            window.location.replace(url.searchParams.get("state"));
          });
        }
        else {
          var loginURL="https://v2.steemconnect.com/oauth2/authorize?client_id=steem-plus-app&redirect_uri="+uri_login+"&scope=vote,comment,custom_json,comment_options&state=";
          loginURL+=window.location.href;
          var loginIcon=$('<a></a>').append($('<img/>').attr('class',classbutton));
        }
        if(request.data.steemConnect.connect===false||request.data.steemConnect.tokenExpire<Date.now()){
          $(loginIcon).children().first().attr('src',chrome.extension.getURL("src/img/unlogged.png"))
          .attr('title','Login to SteemPlus?');
          $(loginIcon).attr('href',loginURL);
          if(request.data.steemConnect.connect===true)
            chrome.storage.local.remove(['sessionToken','tokenExpire'],function(){
              window.location.replace(window.location.href);
            });
        }
        else {
          $(loginIcon).children().first().attr('src',chrome.extension.getURL("src/img/logged.png"))
          .attr('title','Log out of SteemPlus?');
          $(loginIcon).click(function(){
            sc2.revokeToken(function (err, res) {
              console.log(err, res);
              chrome.storage.local.remove(['sessionToken','tokenExpire'],function(){
                window.location.replace(window.location.href);
              });
            });
          });
        }
      if(request.data.steemit)
        $('.Header__top').children().first().children().eq(1).children().first().prepend(loginIcon);
      else if(request.data.busy)
        $('.Topnav__version').after(loginIcon);
      else if(request.data.utopian)
        $('.Topnav__version').eq(0).after(loginIcon);
    }
  });
