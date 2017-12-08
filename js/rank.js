chrome.storage.local.get(['badge'], function (items) {
  console.log(items.badge);
  displayBadges(items);
  $(document).click(function(){

    setTimeout(function(){
      displayBadges(items);
},2000);
});
});

function displayBadges(items)
{
  if($('.UserProfile__banner ').length!==0&&(items.badge==undefined||items.badge=="show"))
  {

      const username=getUsernameFromProfile();
      getAccountData(username).then(function (result){
        const vesting_shares=parseFloat(result["0"].vesting_shares.split(' '));
        const rank=getUserRank(vesting_shares);
        const medal_url='img/medals/'+rank.toLowerCase()+'.png';
        console.log(medal_url);
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
