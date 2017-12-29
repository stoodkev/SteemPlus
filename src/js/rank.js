var username=null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to==='rank'&&request.order==='start')
      displayBadges();
    if(request.to==='rank'&&request.order==='click'){
      console.log('cl');
      setTimeout(function(){
        displayBadges();
      },2000);
    }
});


function displayBadges()
{
  console.log('display');
  if($('.UserProfile__banner ').length!==0)
  {
      getAccountData(getUsernameFromProfile()).then(function (result){
        const vesting_shares=parseFloat(result["0"].vesting_shares.split(' '));
        const rank=getUserRank(vesting_shares);
        const medal_url='src/img/medals/'+rank.toLowerCase()+'.png';
        var div= document.createElement('div');
        div.className="ranker";
        var img=document.createElement('img');
        img.src=chrome.extension.getURL(medal_url);
        img.title=rank;
        div.appendChild(img);
        if($('.ranker').length!==0)
          $('.ranker').remove();
        if($('.wrapper ').length===0)
        {
          $('.UserProfile__banner ').first().children().first().wrapInner('<div class="wrapper"></div>');
          $('.wrapper ').first().children().first().insertBefore($('.wrapper'));
        }
        $('.UserProfile__banner ')[0].childNodes[0].prepend(div);
});
}
}

function getUserRank (vests) {
    var rank = 'Plankton';
    if (vests >= 1000000000) {
        rank = 'Whale';
    } else if (vests >= 100000000) {
        rank = 'Orca';
    } else if (vests >= 10000000) {
        rank = 'Dolphin';
    } else if (vests >= 1000000) {
        rank = 'Minnow';
    }
    return rank;
};

function getUsernameFromProfile()
{
    return window.location.href.split('@')[1].split('/')[0];
}

function getAccountData(username)
{
   return new Promise (function(resolve,reject){
     steem.api.getAccounts([username], function(err, response){
    resolve(response);
   });
  });
}
