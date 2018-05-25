var xhttp = new XMLHttpRequest();
const steemit =(window.location.href.includes('steemit.com')||window.location.href.includes('mspsteem.com'));
const busy =window.location.href.includes('busy.org');
const utopian =window.location.href.includes('utopian.io');
console.log('Starting SteemPlus',steemit,busy,utopian);
var market =null;
var SBDperSteem=0;
const DEFAULT_FEED_SIZE=3;
var urlOffline=window.location.href;
var urlOnline=window.location.href;
var user=null;

var offlineModeRetryCount=0;

steem.api.setOptions({ url: 'https://api.steemit.com' });
const token=makeToken();
logInfo('test');
logDebug('testDebug');
Promise.all([steem.api.getDynamicGlobalPropertiesAsync(), steem.api.getCurrentMedianHistoryPriceAsync(), steem.api.getRewardFundAsync("post")])
.then(function(values) {

  const votePowerReserveRate = values["0"].vote_power_reserve_rate;
  const totalSteem = Number(values["0"].total_vesting_fund_steem.split(' ')[0]);
  const totalVests = Number(values["0"].total_vesting_shares.split(' ')[0]);
  const rewardBalance = parseFloat(values["2"].reward_balance.replace(" STEEM", ""));
  const recentClaims = values["2"].recent_claims;
  const steemPrice = parseFloat(values["1"].base.replace(" SBD", "")) / parseFloat(values["1"].quote.replace(" STEEM", ""));
  updateSteemPrice();

  // Notifier vues
  chrome.storage.local.set({
    votePowerReserveRateLS:votePowerReserveRate
  });

  chrome.storage.local.set({
    totalSteemLS:totalSteem
  });

  chrome.storage.local.set({
    totalVestsLS:totalVests
  });

  chrome.storage.local.set({
    rewardBalanceLS:rewardBalance
  });

  chrome.storage.local.set({
    recentClaimsLS:recentClaims
  });

  chrome.storage.local.set({
    steemPriceLS:steemPrice
  });
  chrome.storage.local.get(['user_info_popover','followers_table','vote_weight_slider','mentions_tab','vote_tab','steemit_more_info','post_votes_list','acc_v','del', 'tokenExpire', 'sessionToken'], function (items) {

    var steemConnect=(items.sessionToken===undefined||items.tokenExpire===undefined)?{connect:false}:{connect:true,sessionToken:items.sessionToken,tokenExpire:items.tokenExpire};


    const delegation=(items.del==undefined||items.del=="show");
    const account_value=(items.acc_v==undefined||items.acc_v=="show");
    const steemit_more_info=(items.steemit_more_info == undefined || items.steemit_more_info=='show');
    const post_votes_list=(items.post_votes_list == undefined || items.post_votes_list=='show');
    const vote_tab=(items.vote_tab == undefined || items.vote_tab=='show');
    const mentions_tab=(items.mentions_tab == undefined || items.mentions_tab=='show');
    const vote_weight_slider=(items.vote_weight_slider == undefined || items.vote_weight_slider=='show');
    const followers_table=(items.followers_table == undefined || items.followers_table=='show');
    const user_info_popover=(items.user_info_popover == undefined || items.user_info_popover=='show');


    if(delegation&&(steemit||busy))
      chrome.runtime.sendMessage({ token:token, to: 'delegation', order: 'notif',data:{steemit:steemit,busy:busy,global:{totalSteem:totalSteem,totalVests:totalVests}}});
    if (steemit&&steemit_more_info) {
      if(post_votes_list)
        chrome.runtime.sendMessage({ token:token, to: 'post_votes_list', order: 'notif',data:{rewardBalance:rewardBalance, recentClaims:recentClaims, steemPrice:steemPrice}});
      if(vote_tab)
        chrome.runtime.sendMessage({ token:token, to: 'vote_tab', order: 'notif',data:{rewardBalance:rewardBalance, recentClaims:recentClaims, steemPrice:steemPrice}});
      if(mentions_tab)
        chrome.runtime.sendMessage({ token:token, to: 'mentions_tab', order: 'notif',data:{rewardBalance:rewardBalance, recentClaims:recentClaims, steemPrice:steemPrice}});
      if(vote_weight_slider)
        chrome.runtime.sendMessage({ token:token, to: 'vote_weight_slider', order: 'notif',data:{rewardBalance:rewardBalance, recentClaims:recentClaims, steemPrice:steemPrice, votePowerReserveRate:votePowerReserveRate}});
      if(followers_table&&steemConnect.connect)
        chrome.runtime.sendMessage({ token:token, to: 'followers_table', order: 'notif',data:{rewardBalance:rewardBalance, recentClaims:recentClaims, steemPrice:steemPrice, votePowerReserveRate:votePowerReserveRate, totalVestingFund:totalSteem, totalVestingShares:totalVests}});
      if(user_info_popover)
        chrome.runtime.sendMessage({ token:token, to: 'user_info_popover', order: 'notif',data:{rewardBalance:rewardBalance, recentClaims:recentClaims, steemPrice:steemPrice, votePowerReserveRate:votePowerReserveRate}});
    }
  });
});

chrome.storage.local.get(['author_popup_info','rewards_tab','wallet_history','wallet_history_memo_key','article_count','witnesses_tab','classification_user','board_reward','favorite_section','votePowerReserveRateLS','totalSteemLS','totalVestsLS','rewardBalanceLS','recentClaimsLS','steemPriceLS','post_floating_bottom_bar','post_floating_bottom_bar_size','last_post_url','smi_installed_remind_me', 'smi_installed_remind_me_time','md_editor_beautifier','blog_histogram','user_info_popover','gif_picker','boost_button','followers_table','vote_weight_slider','mentions_tab','search_bar','external_link_tab','vote_tab','steemit_more_info','post_votes_list', 'oneup','weight','del','transfers','acc_v','ben','drop','badge','username', 'nb_posts','resteem','sort','tag','list_tags','voted_check', 'rep_feed', 'rep_feed_check', 'classif','whitelist', 'blacklist','feedp','sessionToken','tokenExpire','market'], function (items) {
  var steemConnect=(items.sessionToken===undefined||items.tokenExpire===undefined)?{connect:false}:{connect:true,sessionToken:items.sessionToken,tokenExpire:items.tokenExpire};
  chrome.runtime.sendMessage({ token:token, to: 'steemConnect', order: 'start',data:{steemConnect:steemConnect,steemit:steemit,busy:busy,utopian:utopian}} );
  market=items.market==undefined?{SBDperSteem:0,priceSteem:0,priceSBD:0}:items.market;
  console.log('Connecting...');
  if(steemConnect.connect===true&&steemConnect.tokenExpire>Date.now()){
    initializeSteemConnect(steemConnect.sessionToken);
    sc2.me().then((me)=>
    {
      console.log(me);


      const votePowerReserveRateLS = (items.votePowerReserveRateLS==undefined ? 1 : items.votePowerReserveRateLS);
      const totalSteemLS = (items.totalSteemLS==undefined ? 1 : items.totalSteemLS);
      const totalVestsLS = (items.totalVestsLS==undefined ? 1 : items.totalVestsLS);
      const rewardBalanceLS = (items.rewardBalanceLS==undefined ? 1 : items.rewardBalanceLS);
      const recentClaimsLS = (items.recentClaimsLS==undefined ? 1 : items.recentClaimsLS);
      const steemPriceLS = (items.steemPriceLS==undefined ? 1 : items.steemPriceLS);

      console.log('Getting settings...');
      const account=me.account;
      user=me.name;
      const beneficiaries=(items.ben==undefined||items.ben=="show");
      const feedp=(items.feedp==undefined||items.feedp=="show");
      const resteem= (items.resteem !== undefined)?items.resteem:'show';
      const weight=(items.weight !== undefined && items.weight !== 0)?items.weight*100:10000;


      const oneup= (items.oneup !== undefined)?items.oneup:'show';

      const steemit_more_info=(items.steemit_more_info == undefined || items.steemit_more_info=='show');
      const followers_table=(items.followers_table == undefined || items.followers_table=='show');

      // Feed+ const
      var whitelist=(items.whitelist !== undefined)?items.whitelist:"";
      var blacklist=(items.blacklist !== undefined)?items.blacklist:"";
      var rep_feed_check=(items.rep_feed_check!==undefined)?items.rep_feed_check:null;
      var rep_feed=(items.rep_feed!==undefined)?items.rep_feed:null;
      var sort=(items.sort!==undefined)?items.sort:null;
      var tag=(items.tag!==undefined)?items.tag:'show';
      var list_tags=(items.list_tags!==undefined)?items.list_tags:null;
      var voted_check=(items.vote_check!==undefined)?items.voted_check:false;
      var nb_posts=(items.nb_posts!==undefined&&items.nb_posts<10&&items.nb_posts!=='')?items.nb_posts:DEFAULT_FEED_SIZE;
      var classif=(items.classif!==undefined)?items.classif:{bot: true, human: true, pending: true, spammer: true};


      console.log('Starting features online...',user);
      if(beneficiaries&&steemit)
        chrome.runtime.sendMessage({ token:token, to: 'ben', order: 'start',data:{user:user}});
      if(steemit&&feedp&&resteem==='whitelist_radio'||resteem==='blacklist_radio')
        chrome.runtime.sendMessage({ token:token, to: 'resteem', order: 'start',data:{steemit:steemit,busy:busy,resteem:{resteem:resteem,whitelist:whitelist,blacklist:blacklist}}});
      if(steemit&&feedp)
        chrome.runtime.sendMessage({ token:token, to: 'feedp', order: 'start',data:{steemit:steemit,busy:busy,feedp:{weight:weight,user:user,resteem:resteem,whitelist:whitelist,blacklist:blacklist,rep_feed:rep_feed,rep_feed_check:rep_feed_check,tag:tag,list_tags:list_tags,voted_check:voted_check,sort:sort,nb_posts:nb_posts, classif:classif}}});
      if(oneup&&utopian)
        chrome.runtime.sendMessage({ token:token, to: 'oneup', order: 'start',data:{sessionToken:steemConnect.sessionToken,account:account}});

      if (steemit&&steemit_more_info) {
        if(followers_table)
          chrome.runtime.sendMessage({ token:token, to: 'followers_table', order: 'start',data:{rewardBalance:rewardBalanceLS, recentClaims:recentClaimsLS, steemPrice:steemPriceLS, votePowerReserveRate:votePowerReserveRateLS, account:account, totalVestingFund:totalSteemLS, totalVestingShares:totalVestsLS}});
      }
      console.log('Online Features started...');
      $(document).click(function(){
        setTimeout(function(){
          if(urlOnline!==window.location.href)
          {
            if(beneficiaries&&steemit)
              chrome.runtime.sendMessage({ token:token, to: 'ben', order: 'click',data:{user:user}});
            if(steemit&&followers_table&&steemit_more_info)
              chrome.runtime.sendMessage({ token:token, to: 'followers_table', order: 'click', data:{user:user}});

            urlOnline=window.location.href;
          }
          if(oneup&&utopian)
            chrome.runtime.sendMessage({ token:token, to: 'oneup', order: 'click',data:{account:account}});
        },200);
      });
      console.log('Offline Features');
      initOfflineFeatures(true, items, user, account);
    }, function(err)
    {
      console.log('Cannot connect to steemConnect. Launching offline Features...');
      initOfflineFeatures(false, items, null, null);
    });
  }
  else
  {
    // No need to be connected to SteemConnect
    console.log('Offline Features');
    initOfflineFeatures(false, items, null, null);
  }
});

function initOfflineFeatures(isConnected, items, user, account)
{
  if(offlineModeRetryCount<30)
  {
    if(!isConnected)
    {
      if($('.Header__userpic > a').length > 0)
      {
        user = $('.Header__userpic > a')[0].title; //Get username in offline mode
        steem.api.getAccounts([user], function(err, result) {
          if(err) console.log(err);
          else
          {
            startOfflineFeatures(items, user, result[0]);
          }
        });
      }
      else
      {
        offlineModeRetryCount++;
        setTimeout(function(){
          initOfflineFeatures(isConnected, items, null, null);
        },1000);
      }
    }
    else
    {
      startOfflineFeatures(items, user, account);
    }
  }
}

function startOfflineFeatures(items, user, account)
{
  const votePowerReserveRateLS = (items.votePowerReserveRateLS==undefined ? 1 : items.votePowerReserveRateLS);
  const totalSteemLS = (items.totalSteemLS==undefined ? 1 : items.totalSteemLS);
  const totalVestsLS = (items.totalVestsLS==undefined ? 1 : items.totalVestsLS);
  const rewardBalanceLS = (items.rewardBalanceLS==undefined ? 1 : items.rewardBalanceLS);
  const recentClaimsLS = (items.recentClaimsLS==undefined ? 1 : items.recentClaimsLS);
  const steemPriceLS = (items.steemPriceLS==undefined ? 3.5 : items.steemPriceLS);

  console.log('Getting settings...');
  const delegation=(items.del==undefined||items.del=="show");
  const transfers=(items.transfers==undefined||items.transfers=="show");
  const account_value=(items.acc_v==undefined||items.acc_v=="show");
  const dropdown=(items.drop==undefined||items.drop=="show");
  const rank=(items.badge==undefined||items.badge=="1"||items.badge=="2"||items.badge=="3"||items.badge=="show");

  const steemit_more_info=(items.steemit_more_info == undefined || items.steemit_more_info=='show');
  const post_votes_list=(items.post_votes_list == undefined || items.post_votes_list=='show');
  const vote_tab=(items.vote_tab == undefined || items.vote_tab=='show');
  const external_link_tab=(items.external_link_tab == undefined || items.external_link_tab=='show');
  const search_bar=(items.search_bar == undefined || items.search_bar=='show');
  const mentions_tab=(items.mentions_tab == undefined || items.mentions_tab=='show');
  const vote_weight_slider=(items.vote_weight_slider == undefined || items.vote_weight_slider=='show');
  const boost_button=(items.boost_button == undefined || items.boost_button=='show');
  const gif_picker=(items.gif_picker == undefined || items.gif_picker=='show');
  const user_info_popover=(items.user_info_popover == undefined || items.user_info_popover=='show');
  const blog_histogram=(items.blog_histogram !== undefined && items.blog_histogram=='show'); //default hidden
  const md_editor_beautifier=(items.md_editor_beautifier == undefined || items.md_editor_beautifier=='show');
  const post_floating_bottom_bar=(items.post_floating_bottom_bar == undefined || items.post_floating_bottom_bar=='show');

  const favorite_section=(items.favorite_section == undefined || items.favorite_section=='show');
  const board_reward=(items.board_reward == undefined || items.board_reward=='show');
  const classification_user=(items.classification_user == undefined || items.classification_user=='show');
  const witnesses_tab=(items.witnesses_tab == undefined || items.witnesses_tab=='show');
  const article_count=(items.article_count == undefined || items.article_count=='show');
  const wallet_history=(items.wallet_history == undefined || items.wallet_history=='show');
  const wallet_history_memo_key=(items.wallet_history_memo_key== undefined ? '' : items.wallet_history_memo_key);
  const rewards_tab=(items.rewards_tab == undefined || items.rewards_tab=='show');
  const author_popup_info=(items.author_popup_info == undefined || items.author_popup_info=='show');
  const add_signature=(items.add_signature == undefined || items.add_signature=='show');


  const smi_installed_remind_me=(items.smi_installed_remind_me == undefined || items.smi_installed_remind_me);
  const smi_installed_remind_me_time=items.smi_installed_remind_me_time;
  const last_post_url=items.last_post_url;



  checkSMI(smi_installed_remind_me, smi_installed_remind_me_time);
  checkLastPost(last_post_url, account);

  console.log('Starting features...',user);
  if(delegation&&(steemit||busy))
    chrome.runtime.sendMessage({ token:token, to: 'delegation', order: 'start',data:{steemit:steemit,busy:busy,global:{totalSteem:totalSteemLS,totalVests:totalVestsLS},account:account} });
  if(transfers&&(steemit||busy))
    chrome.runtime.sendMessage({ token:token, to: 'transfers', order: 'start',data:{steemit:steemit,busy:busy,user:user,balance:{steem:account.balance.split(' ')[0],sbd:account.sbd_balance.split(' ')[0]}} });
  if(account_value&&(steemit||busy))
    chrome.runtime.sendMessage({ token:token, to: 'acc_v', order: 'start',data:{steemit:steemit,busy:busy,global:{totalSteem:totalSteemLS,totalVests:totalVestsLS},market:market}});
  if(rank&&steemit)
    chrome.runtime.sendMessage({ badge:items.badge,token:token, to: 'rank', order: 'start',data:{totalSteem:totalSteemLS,totalVests:totalVestsLS}});
  if(board_reward&&steemit)
    chrome.runtime.sendMessage({ token:token, to: 'board_reward', order: 'start',data:{}});
  if(favorite_section&&steemit)
    chrome.runtime.sendMessage({ token:token, to: 'favorite_section', order: 'start',data:{user:user}});
  if(classification_user&&steemit)
    chrome.runtime.sendMessage({ token:token, to: 'classification_user', order: 'start',data:{user:user}});
  if(witnesses_tab&&steemit)
      chrome.runtime.sendMessage({ token:token, to: 'witnesses_tab', order: 'start',data:{user:user, account:account,totalSteem:totalSteemLS,totalVests:totalVestsLS}});
  if(article_count&&steemit)
      chrome.runtime.sendMessage({ token:token, to: 'article_count', order: 'start',data:{}});
  if(wallet_history&&steemit)
      chrome.runtime.sendMessage({ token:token, to: 'wallet_history', order: 'start',data:{totalSteem:totalSteemLS,totalVests:totalVestsLS,walletHistoryMemoKey:wallet_history_memo_key,account:account}});
  if(rewards_tab&&steemit)
      chrome.runtime.sendMessage({ token:token, to: 'rewards_tab', order: 'start',data:{totalSteem:totalSteemLS,totalVests:totalVestsLS,base:steemPriceLS}});
  if(author_popup_info&&steemit)
      chrome.runtime.sendMessage({ token:token, to: 'author_popup_info', order: 'start',data:{user:user}});
  if(add_signature&&steemit)
      chrome.runtime.sendMessage({ token:token, to: 'add_signature', order: 'start',data:{user:user, steemit:steemit, busy:busy, utopian:utopian}});

  if (steemit&&steemit_more_info) {
    if(post_votes_list)
      chrome.runtime.sendMessage({ token:token, to: 'post_votes_list', order: 'start',data:{rewardBalance:rewardBalanceLS, recentClaims:recentClaimsLS, steemPrice:steemPriceLS}});
    if(vote_tab)
      chrome.runtime.sendMessage({ token:token, to: 'vote_tab', order: 'start',data:{rewardBalance:rewardBalanceLS, recentClaims:recentClaimsLS, steemPrice:steemPriceLS}});
    if(external_link_tab)
      chrome.runtime.sendMessage({ token:token, to: 'external_link_tab', order: 'start',data:{}});
    if(search_bar)
      chrome.runtime.sendMessage({ token:token, to: 'search_bar', order: 'start',data:{}});
    if(mentions_tab)
      chrome.runtime.sendMessage({ token:token, to: 'mentions_tab', order: 'start',data:{rewardBalance:rewardBalanceLS, recentClaims:recentClaimsLS, steemPrice:steemPriceLS}});
    if(vote_weight_slider)
      chrome.runtime.sendMessage({ token:token, to: 'vote_weight_slider', order: 'start',data:{rewardBalance:rewardBalanceLS, recentClaims:recentClaimsLS, steemPrice:steemPriceLS, votePowerReserveRate:votePowerReserveRateLS, account:account}});
    if(boost_button)
      chrome.runtime.sendMessage({ token:token, to: 'boost_button', order: 'start',data:{}});
    if(gif_picker)
      chrome.runtime.sendMessage({ token:token, to: 'gif_picker', order: 'start',data:{}});
    if(user_info_popover)
      chrome.runtime.sendMessage({ token:token, to: 'user_info_popover', order: 'start',data:{rewardBalance:rewardBalanceLS, recentClaims:recentClaimsLS, steemPrice:steemPriceLS, votePowerReserveRate:votePowerReserveRateLS}});
    if(blog_histogram)
      chrome.runtime.sendMessage({ token:token, to: 'blog_histogram', order: 'start',data:{rewardBalance: rewardBalanceLS, recentClaims:recentClaimsLS, steemPrice:steemPriceLS}});
    if(md_editor_beautifier)
      chrome.runtime.sendMessage({ token:token, to: 'md_editor_beautifier', order: 'start',data:{}});
    if(post_floating_bottom_bar)
      chrome.runtime.sendMessage({ token:token, to: 'post_floating_bottom_bar', order: 'start',data:{}});
  }


  console.log('Offline Features started...');
  $(document).click(function(){

    setTimeout(function(){
      if(urlOffline!==window.location.href)
      {
        if(urlOffline.match(/transfers/)&&window.location.href.includes('@'+user+'/transfers'))
          location.reload();
        if(delegation&&(steemit||busy))
          chrome.runtime.sendMessage({token:token, to: 'delegation', order: 'click',data:{steemit:steemit,busy:busy,global:{totalSteem:totalSteemLS,totalVests:totalVestsLS},account:account} });
        if(transfers&&(steemit||busy))
          chrome.runtime.sendMessage({token:token, to: 'transfers', order: 'click',data:{steemit:steemit,user:user,balance:{steem:account.balance.split(' ')[0],sbd:account.sbd_balance.split(' ')[0]}}} );
        if(account_value&&(steemit||busy))
          chrome.runtime.sendMessage({ token:token, to: 'acc_v', order: 'click',data:{steemit:steemit,busy:busy,global:{totalSteem:totalSteemLS,totalVests:totalVestsLS},market:market} });
        if(rank&&steemit)
          chrome.runtime.sendMessage({ badge:items.badge,token:token, to: 'rank', order: 'click',data:{totalSteem:totalSteemLS,totalVests:totalVestsLS}});
        if(steemit&&boost_button&&steemit_more_info)
          chrome.runtime.sendMessage({ token:token, to: 'boost_button', order: 'click', data:{user:user}});
        if(steemit&&md_editor_beautifier&&steemit_more_info)
          chrome.runtime.sendMessage({ token:token, to: 'md_editor_beautifier', order: 'click', data:{}});
        if(steemit&&user_info_popover&&steemit_more_info)
          chrome.runtime.sendMessage({ token:token, to: 'user_info_popover', order: 'click',data:{rewardBalance:rewardBalanceLS, recentClaims:recentClaimsLS, steemPrice:steemPriceLS, votePowerReserveRate:votePowerReserveRateLS}});
        if(steemit&&blog_histogram&&steemit_more_info)
          chrome.runtime.sendMessage({ token:token, to: 'blog_histogram', order: 'click',data:{}});
        if(post_floating_bottom_bar&&steemit&&steemit_more_info)
          chrome.runtime.sendMessage({ token:token, to: 'post_floating_bottom_bar', order: 'click',data:{}});
        if(external_link_tab&&steemit&&steemit_more_info)
          chrome.runtime.sendMessage({ token:token, to: 'external_link_tab', order: 'click',data:{}});
        if(mentions_tab&&steemit&&steemit_more_info)
          chrome.runtime.sendMessage({ token:token, to: 'mentions_tab', order: 'click',data:{rewardBalance:rewardBalanceLS, recentClaims:recentClaimsLS, steemPrice:steemPriceLS}});
        if(vote_weight_slider&&steemit&&steemit_more_info)
          chrome.runtime.sendMessage({ token:token, to: 'vote_weight_slider', order: 'click',data:{rewardBalance:rewardBalanceLS, recentClaims:recentClaimsLS, steemPrice:steemPriceLS, votePowerReserveRate:votePowerReserveRateLS, account:account}});
        if(favorite_section&&steemit)
          chrome.runtime.sendMessage({ token:token, to: 'favorite_section', order: 'click',data:{user:user}});
        if(post_votes_list&&steemit&&steemit_more_info)
          chrome.runtime.sendMessage({ token:token, to: 'post_votes_list', order: 'click',data:{rewardBalance:rewardBalanceLS, recentClaims:recentClaimsLS, steemPrice:steemPriceLS}});
        if(classification_user&&steemit)
          chrome.runtime.sendMessage({ token:token, to: 'classification_user', order: 'click',data:{user:user}});
        if(witnesses_tab&&steemit)
          chrome.runtime.sendMessage({ token:token, to: 'witnesses_tab', order: 'click',data:{user:user,account:account,totalSteem:totalSteemLS,totalVests:totalVestsLS}});
        if(article_count&&steemit)
          chrome.runtime.sendMessage({ token:token, to: 'article_count', order: 'click',data:{}});
        if(wallet_history&&steemit)
          chrome.runtime.sendMessage({ token:token, to: 'wallet_history', order: 'click',data:{totalSteem:totalSteemLS,totalVests:totalVestsLS,walletHistoryMemoKey:wallet_history_memo_key,account:account}});
        if(rewards_tab&&steemit)
          chrome.runtime.sendMessage({ token:token, to: 'rewards_tab', order: 'click',data:{totalSteem:totalSteemLS,totalVests:totalVestsLS,base:steemPriceLS}});
        if(gif_picker&&steemit&&steemit_more_info)
          chrome.runtime.sendMessage({ token:token, to: 'gif_picker', order: 'click',data:{}});
        if(author_popup_info&&steemit)
          chrome.runtime.sendMessage({ token:token, to: 'author_popup_info', order: 'click',data:{user:user}});
        if(add_signature&&steemit)
          chrome.runtime.sendMessage({ token:token, to: 'add_signature', order: 'click',data:{user:user, steemit:steemit, busy:busy, utopian:utopian}});
    

        if($('.favorite-star').length > 0){
          $('.favorite-star').remove();
        }

        if($('.error-mentions-label').length > 0){
          $('.error-mentions-label').remove();
        }

        urlOffline=window.location.href;
      }
      if(dropdown&&steemit)
        chrome.runtime.sendMessage({ token:token,to: 'drop', order: 'click',data:{market:market} });
    },200);
  });
}

function initializeSteemConnect(sessionToken){
  sc2.init({
    app: 'steem-plus',
    callbackURL: 'https://steemit.com/@stoodkev',
    accessToken: sessionToken,
    scope: ['vote', 'comment','comment_options','custom_json']
  });
}


function updateSteemPrice()
{
  getSteemPrice();
  setInterval(function() {
      getSteemPrice();
  }, 60 * 1000);
}

function getPriceSteemAsync()
{
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: "GET",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
      },
      url: 'https://bittrex.com/api/v1.1/public/getticker?market=BTC-STEEM',
      success: function(response) {
        resolve(response.result['Bid']);
      },
      error: function(msg) {
        resolve(msg);
      }
    });
  });
}

function getPriceSBDAsync()
{
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: "GET",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
      },
      url: 'https://bittrex.com/api/v1.1/public/getticker?market=BTC-SBD',
      success: function(response) {
        resolve(response.result['Bid']);
      },
      error: function(msg) {
        resolve(msg);
      }
    });
  });
}

function getBTCPriceAsync()
{
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: "GET",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
      },
      url: 'https://bittrex.com/api/v1.1/public/getticker?market=USDT-BTC',
      success: function(response) {
        resolve(response.result['Bid']);
      },
      error: function(msg) {
        resolve(msg);
      }
    });
  });
}

function getSteemPrice()
{
  Promise.all([getBTCPriceAsync(), getPriceSBDAsync(), getPriceSteemAsync()])
  .then(function(values){
    const btc_price = values[0];
    const priceSBD = values[1];
    const priceSteem = values[2];
    market={SBDperSteem:priceSteem/priceSBD,priceSteem:priceSteem*btc_price,priceSBD:priceSBD*btc_price};
    chrome.storage.local.set({
      market:market
    });
    chrome.runtime.sendMessage({ token:token, to: 'acc_v', order: 'notif',market:market});
    console.log(market);
  });
}

function makeToken() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

function checkSMI(smi_installed_remind_me, smi_installed_remind_me_time){

  if(!smi_installed_remind_me)
    return;

  if(smi_installed_remind_me_time==undefined || date_diff_indays(smi_installed_remind_me_time, Date.now()) >= 1)
    if($('body')[0].dataset.SteemitMoreInfoExtensionId !== null && $('body')[0].dataset.SteemitMoreInfoExtensionId !== undefined)
    {
        toastr.options = {
          "closeButton": false,
          "debug": false,
          "newestOnTop": false,
          "progressBar": false,
          "positionClass": "toast-top-full-width",
          "preventDuplicates": false,
          "onclick": null,
          "showDuration": "300",
          "hideDuration": "1000",
          "timeOut": 0,
          "extendedTimeOut": 0,
          "showEasing": "swing",
          "hideEasing": "linear",
          "showMethod": "fadeIn",
          "hideMethod": "fadeOut",
          "tapToDismiss": false
        };
        toastr.info('We detected that you also use Steemit More Info! </br> As of Version 2.5, SteemPlus has integrated and fixed all of the main Steemit More Info features. To avoid duplicate features, you can either uninstall Steemit More Info, or deactivate this feature SteemPlus (Click on the popup -> Settings -> Steemit More Info). </br>'+
                      'You can get more information about this release <a href="https://steemit.com/@steem-plus">here</a>.</br>'+
                      'Happy Steeming with SteemPlus!<br /><br /><button class="btn btn-primary" id="SMIRML">Remind Me Later</button> <button id="SMIGI" class="btn btn-primary">Got It</button>', "Message from SteemPlus");

        $('#SMIGI').click(function(){
          chrome.storage.local.set({
            smi_installed_remind_me:false
          });
          $(this).parent().parent().remove();
        });

        $('#SMIRML').click(function(){
          chrome.storage.local.set({
            smi_installed_remind_me:true,
            smi_installed_remind_me_time:Date.now()
          });
          $(this).parent().parent().remove();
        });
    }
}

function date_diff_indays(date1, date2) {
  dt1 = new Date(date1);
  dt2 = new Date(date2);
  return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
}

function checkLastPost(last_post_url, account)
{
  console.log('account', account);
  steem.api.getDiscussionsByAuthorBeforeDate('steem-plus',null, new Date().toISOString().split('.')[0],1 , function(err, result) {
    if(!result[0].url.includes('budget')&&!result[0].url.includes('Budget'))
    {
      if(last_post_url == undefined || last_post_url !== result[0].url)
      {
        toastr.options = {
          "closeButton": false,
          "debug": false,
          "newestOnTop": false,
          "progressBar": false,
          "positionClass": "toast-top-full-width",
          "preventDuplicates": false,
          "onclick": null,
          "showDuration": "300",
          "hideDuration": "1000",
          "timeOut": 0,
          "extendedTimeOut": 0,
          "showEasing": "swing",
          "hideEasing": "linear",
          "showMethod": "fadeIn",
          "hideMethod": "fadeOut",
          "tapToDismiss": false
        };

        var hasVotedWitness = account.witness_votes.includes("stoodkev");
        var hasChosenAsProxy = account.proxy === 'stoodkev';

        toastr.info('Thanks for using SteemPlus!<br />'+
                    'We just released a new post that you might be interested about:<br /><br /> ' + result[0].title +
                    '<br /><br />' +
                    ((hasVotedWitness||hasChosenAsProxy) ? '' : 'You love SteemPlus? Please consider voting @stoodkev as a witness, it only takes few seconds! Only need to click <a href="" id="vote_as_witness" style="text-decoration: underline;">here</a>.<br />\
                      You can also choose @stoodkev as your proxy by clicking <a href="" id="chose_as_proxy" style="text-decoration: underline;">here</a>.<br /><br />')+
                      '<button class="btn btn-primary" id="new_post_yes">Read</button> <button id="new_post_no" class="btn btn-primary">No, thanks</button>', "Steem Plus News");

        $('#new_post_yes').click(function(){
          chrome.storage.local.set({
            last_post_url:result[0].url
          });
          $(this).parent().parent().remove();
          var win=window.open("https://steemit.com"+result[0].url, '_blank');
          if (win) {
              //Browser has allowed it to be opened
              win.focus();
          } else {
              //Browser has blocked it
              alert('Please allow popups for this website');
          }
        });

        $('#new_post_no').click(function(){
          chrome.storage.local.set({
            last_post_url:result[0].url
          });
          $(this).parent().parent().remove();
        });

        $('#vote_as_witness').click(function(){
          var win = window.open('https://v2.steemconnect.com/sign/account-witness-vote?witness=stoodkev&approve=1', '_blank');
          if (win) {
              //Browser has allowed it to be opened
              win.focus();
          } else {
              //Browser has blocked it
              alert('Please allow popups for this website');
          }
        });

        $('#chose_as_proxy').click(function(){
          var win = window.open('https://v2.steemconnect.com/sign/account-witness-proxy?account=' + account.name + '&proxy=stoodkev', '_blank');
          if (win) {
              //Browser has allowed it to be opened
              win.focus();
          } else {
              //Browser has blocked it
              alert('Please allow popups for this website');
          }
        });
      }
    }
  });

}
