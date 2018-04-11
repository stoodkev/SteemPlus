var username=null;
var token_rank=null;

var medal_level_folders = ['3'];

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to==='rank'&&request.order==='start'&&token_rank==null){
      console.log('start rank');
      token_rank=request.token;
      displayBadges(request.badge);
    }
    else if(request.to==='rank'&&request.order==='click'&&token_rank==request.token){
      console.log('click rank');
      displayBadges(request.badge);
    }
});


function displayBadges(badge)
{
  if($('.UserProfile__banner ').length!==0)
  {
    getAccountData(getUsernameFromProfile()).then(function (result){
      if (result.length > 0)
      {
        const vesting_shares=parseFloat(result["0"].vesting_shares.split(' '));
        console.log(vesting_shares);
        const badge_serie=badge==undefined?2:(badge=='show'?2:badge);

        var rank = null;
        if(medal_level_folders.includes(badge_serie))
        {
          rank = getUserRankLevel(vesting_shares);
        }
        else
        {
          rank = getUserRank(vesting_shares);
        }
    
        const medal_url='src/img/medals/'+badge_serie+'/'+rank.toLowerCase()+'.png';
        var titleBadge = getUserRankLevel(vesting_shares); 
        var div= document.createElement('div');
        div.className="ranker";
        var img=document.createElement('img');
        img.src=chrome.extension.getURL(medal_url);
        img.title=getTitleString(titleBadge);
        div.appendChild(img);
        if($('.ranker').length!==0)
          $('.ranker').remove();
        if($('.wrapper ').length===0)
        {
          $('.UserProfile__banner ').first().children().first().wrapInner('<div class="wrapper"></div>');
          $('.wrapper ').first().children().first().insertBefore($('.wrapper'));
        }
        $('.UserProfile__banner ')[0].childNodes[0].prepend(div);
      }

    });
  }
  else
  {
    setTimeout(function(){
      console.log('waiting for banner');
      displayBadges(badge);
    }, 500);
  }
}

function getTitleString(titleBadge)
{
  var tmp = titleBadge.split('-');
  if(tmp[1]==='3') return tmp[0] + ' III';
  else if(tmp[1]==='2') return tmp[0] + ' II';
  else return tmp[0] + ' I';
   
}

function getUserRank(vests) {
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

function getUserRankLevel(vests)
{
  var rank = '';
  if( vests < 333333)
    rank = 'Plankton-3';
  else if( vests < 666666)
    rank = 'Plankton-2';
  else if(vests < 1000000)
    rank = 'Plankton-1';
  else if(vests < 4000000)
    rank = 'Minnow-3';
  else if(vests < 7000000)
    rank = 'Minnow-2';
  else if(vests < 10000000)
    rank = 'Minnow-1';
  else if(vests < 40000000)
    rank = 'Dolphin-3';
  else if(vests < 70000000)
    rank = 'Dolphin-2';
  else if(vests < 100000000)
    rank = 'Dolphin-1';
  else if(vests < 400000000)
    rank = 'Orca-3';
  else if(vests < 700000000)
    rank = 'Orca-2';
  else if(vests < 1000000000)
    rank = 'Orca-1';
  else if(vests < 400000000)
    rank = 'Whale-3';
  else if(vests < 800000000)
    rank = 'Whale-2';
  else
    rank = 'Whale-1';

  return rank;
}

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
