var xhttp = new XMLHttpRequest();
const steemit =(window.location.href.includes('steemit.com')||window.location.href.includes('mspsteem.com'));
const busy =window.location.href.includes('busy.org');
const utopian =window.location.href.includes('utopian.io');
console.log('Starting SteemPlus',steemit,busy,utopian);
var market =null,SBDperSteem=0;
const DEFAULT_FEED_SIZE=3;
var url=window.location.href;

steem.api.setOptions({ url: 'https://api.steemit.com' });

Promise.all([steem.api.getDynamicGlobalPropertiesAsync(), steem.api.getCurrentMedianHistoryPriceAsync(), steem.api.getRewardFundAsync("post")])
.then(function(values) {
  const votePowerReserveRate = values["0"].vote_power_reserve_rate;
  const totalSteem = Number(values["0"].total_vesting_fund_steem.split(' ')[0]);
  const totalVests = Number(values["0"].total_vesting_shares.split(' ')[0]);
  const rewardBalance = parseFloat(values["2"].reward_balance.replace(" STEEM", ""));
  const recentClaims = values["2"].recent_claims;
  const steemPrice = parseFloat(values["1"].base.replace(" SBD", "")) / parseFloat(values["1"].quote.replace(" STEEM", ""));
  updateSteemPrice();

  chrome.storage.local.get(['last_post_url','smi_installed_remind_me', 'smi_installed_remind_me_time','md_editor_beautifier','blog_histogram','user_info_popover','gif_picker','boost_button','followers_table','vote_weight_slider','mentions_tab','search_bar','external_link_tab','vote_tab','steemit_more_info','post_votes_list', 'oneup','weight','del','transfers','acc_v','ben','drop','badge','username', 'nb_posts','resteem','sort','tag','list_tags','voted_check', 'rep_feed', 'rep_feed_check', 'whitelist', 'blacklist','feedp','sessionToken','tokenExpire'], function (items) {
    const token=makeToken();
    var steemConnect=(items.sessionToken===undefined||items.tokenExpire===undefined)?{connect:false}:{connect:true,sessionToken:items.sessionToken,tokenExpire:items.tokenExpire};
    chrome.runtime.sendMessage({ token:token, to: 'steemConnect', order: 'start',data:{steemConnect:steemConnect,steemit:steemit,busy:busy,utopian:utopian}} );

    console.log('Connecting...');
    if(steemConnect.connect===true&&steemConnect.tokenExpire>Date.now()){
      initializeSteemConnect(steemConnect.sessionToken);
      sc2.me().then((me)=> {
        console.log(me);

        console.log('Getting settings...');
        const account=me.account;
        const user=me.name;
        const delegation=(items.del==undefined||items.del=="show");
        const transfers=(items.transfers==undefined||items.transfers=="show");
        const account_value=(items.acc_v==undefined||items.acc_v=="show");
        const beneficiaries=(items.ben==undefined||items.ben=="show");
        const dropdown=(items.drop==undefined||items.drop=="show");
        const rank=(items.badge==undefined||items.badge=="1"||items.badge=="2"||items.badge=="show");
        const feedp=(items.feedp==undefined||items.feedp=="show");
        const resteem= (items.resteem !== undefined)?items.resteem:'show';
        const oneup= (items.oneup !== undefined)?items.oneup:'show';
        const weight=(items.weight !== undefined)?items.weight*100:10000;

        const steemit_more_info=(items.steemit_more_info == undefined || items.steemit_more_info=='show');
        const post_votes_list=(items.post_votes_list == undefined || items.post_votes_list=='show');
        const vote_tab=(items.vote_tab == undefined || items.vote_tab=='show');
        const external_link_tab=(items.external_link_tab == undefined || items.external_link_tab=='show');
        const search_bar=(items.search_bar == undefined || items.search_bar=='show');
        const mentions_tab=(items.mentions_tab == undefined || items.mentions_tab=='show');
        const vote_weight_slider=(items.vote_weight_slider == undefined || items.vote_weight_slider=='show');
        const followers_table=(items.followers_table == undefined || items.followers_table=='show');
        const boost_button=(items.boost_button == undefined || items.boost_button=='show');
        const gif_picker=(items.gif_picker == undefined || items.gif_picker=='show');
        const user_info_popover=(items.user_info_popover == undefined || items.user_info_popover=='show');
        const blog_histogram=(items.blog_histogram !== undefined || items.blog_histogram=='hide'); //default hidden
        const md_editor_beautifier=(items.md_editor_beautifier == undefined || items.md_editor_beautifier=='show');

        const smi_installed_remind_me=(items.smi_installed_remind_me == undefined || items.smi_installed_remind_me);
        const smi_installed_remind_me_time=items.smi_installed_remind_me_time;
        const last_post_url=items.last_post_url;


        var whitelist=(items.whitelist !== undefined)?items.whitelist:"";
        var blacklist=(items.blacklist !== undefined)?items.blacklist:"";
        var rep_feed_check=(items.rep_feed_check!==undefined)?items.rep_feed_check:null;
        var rep_feed=(items.rep_feed!==undefined)?items.rep_feed:null;
        var sort=(items.sort!==undefined)?items.sort:null;
        var tag=(items.tag!==undefined)?items.tag:'show';
        var list_tags=(items.list_tags!==undefined)?items.list_tags:null;
        var voted_check=(items.vote_check!==undefined)?items.voted_check:false;
        var nb_posts=(items.nb_posts!==undefined&&items.nb_posts<10&&items.nb_posts!=='')?items.nb_posts:DEFAULT_FEED_SIZE;


        checkSMI(smi_installed_remind_me, smi_installed_remind_me_time);
        checkLastPost(last_post_url, me);

        console.log('Starting features...',user);
        if(delegation&&(steemit||busy))
          chrome.runtime.sendMessage({ token:token, to: 'delegation', order: 'start',data:{steemit:steemit,busy:busy,global:{totalSteem:totalSteem,totalVests:totalVests},user:user} });
        if(transfers&&(steemit||busy))
          chrome.runtime.sendMessage({ token:token, to: 'transfers', order: 'start',data:{steemit:steemit,busy:busy,user:user,balance:{steem:account.balance.split(' ')[0],sbd:account.sbd_balance.split(' ')[0]}} });
        if(account_value&&(steemit||busy))
          chrome.runtime.sendMessage({ token:token, to: 'acc_v', order: 'start',data:{steemit:steemit,busy:busy,global:{totalSteem:totalSteem,totalVests:totalVests},market:market}});
        if(beneficiaries&&steemit)
          chrome.runtime.sendMessage({ token:token, to: 'ben', order: 'start',data:{user:user}});
        if(rank&&steemit)
          chrome.runtime.sendMessage({ badge:items.badge,token:token, to: 'rank', order: 'start'});
        if(steemit&&feedp&&resteem==='whitelist_radio'||resteem==='blacklist_radio')
          chrome.runtime.sendMessage({ token:token, to: 'resteem', order: 'start',data:{steemit:steemit,busy:busy,resteem:{resteem:resteem,whitelist:whitelist,blacklist:blacklist}}});
        if(steemit&&feedp)
          chrome.runtime.sendMessage({ token:token, to: 'feedp', order: 'start',data:{steemit:steemit,busy:busy,feedp:{weight:weight,user:user,resteem:resteem,whitelist:whitelist,blacklist:blacklist,rep_feed:rep_feed,rep_feed_check:rep_feed_check,tag:tag,list_tags:list_tags,voted_check:voted_check,sort:sort,nb_posts:nb_posts}}});
        if(oneup&&utopian)
          chrome.runtime.sendMessage({ token:token, to: 'oneup', order: 'start',data:{sessionToken:steemConnect.sessionToken,account:account}});

        if (steemit&&steemit_more_info) {
          if(post_votes_list)
            chrome.runtime.sendMessage({ token:token, to: 'post_votes_list', order: 'start',data:{rewardBalance:rewardBalance, recentClaims:recentClaims, steemPrice:steemPrice}});
          if(vote_tab)
            chrome.runtime.sendMessage({ token:token, to: 'vote_tab', order: 'start',data:{rewardBalance:rewardBalance, recentClaims:recentClaims, steemPrice:steemPrice}});
          if(external_link_tab)
            chrome.runtime.sendMessage({ token:token, to: 'external_link_tab', order: 'start',data:{}});
          if(search_bar)
            chrome.runtime.sendMessage({ token:token, to: 'search_bar', order: 'start',data:{}});
          if(mentions_tab)
            chrome.runtime.sendMessage({ token:token, to: 'mentions_tab', order: 'start',data:{rewardBalance:rewardBalance, recentClaims:recentClaims, steemPrice:steemPrice}});
          if(vote_weight_slider)
            chrome.runtime.sendMessage({ token:token, to: 'vote_weight_slider', order: 'start',data:{rewardBalance:rewardBalance, recentClaims:recentClaims, steemPrice:steemPrice, votePowerReserveRate:votePowerReserveRate, account:account}});
          if(followers_table)
            chrome.runtime.sendMessage({ token:token, to: 'followers_table', order: 'start',data:{rewardBalance:rewardBalance, recentClaims:recentClaims, steemPrice:steemPrice, votePowerReserveRate:votePowerReserveRate, account:account, totalVestingFund:totalSteem, totalVestingShares:totalVests}});
          if(boost_button)
            chrome.runtime.sendMessage({ token:token, to: 'boost_button', order: 'start',data:{}});
          if(gif_picker)
            chrome.runtime.sendMessage({ token:token, to: 'gif_picker', order: 'start',data:{}});
          if(user_info_popover)
            chrome.runtime.sendMessage({ token:token, to: 'user_info_popover', order: 'start',data:{rewardBalance:rewardBalance, recentClaims:recentClaims, steemPrice:steemPrice, votePowerReserveRate:votePowerReserveRate}});
          if(blog_histogram)
            chrome.runtime.sendMessage({ token:token, to: 'blog_histogram', order: 'start',data:{}});
          if(md_editor_beautifier)
            chrome.runtime.sendMessage({ token:token, to: 'md_editor_beautifier', order: 'start',data:{}});
        }

        console.log('Features started...');
        $(document).click(function(){
          setTimeout(function(){
            if(url!==window.location.href)
            {
              if(delegation&&(steemit||busy))
                chrome.runtime.sendMessage({token:token, to: 'delegation', order: 'click',data:{steemit:steemit,busy:busy,global:{totalSteem:totalSteem,totalVests:totalVests},user:user} });
              if(transfers&&(steemit||busy))
                chrome.runtime.sendMessage({token:token, to: 'transfers', order: 'click',data:{steemit:steemit,user:user,balance:{steem:account.balance.split(' ')[0],sbd:account.sbd_balance.split(' ')[0]}}} );
              if(account_value&&(steemit||busy))
                chrome.runtime.sendMessage({ token:token, to: 'acc_v', order: 'click',data:{steemit:steemit,busy:busy,global:{totalSteem:totalSteem,totalVests:totalVests},market:market} });
              if(beneficiaries&&steemit)
                chrome.runtime.sendMessage({ token:token, to: 'ben', order: 'click',data:{user:user}});
              if(rank&&steemit)
                chrome.runtime.sendMessage({ badge:items.badge,token:token, to: 'rank', order: 'click'});
              if(steemit&&followers_table)
                chrome.runtime.sendMessage({ token:token, to: 'followers_table', order: 'click', data:{user:user}});
              if(steemit&&boost_button)
                chrome.runtime.sendMessage({ token:token, to: 'boost_button', order: 'click', data:{user:user}});
              if(steemit&&md_editor_beautifier)
                chrome.runtime.sendMessage({ token:token, to: 'md_editor_beautifier', order: 'click', data:{}});
              if(steemit&&user_info_popover)
                chrome.runtime.sendMessage({ token:token, to: 'user_info_popover', order: 'click',data:{rewardBalance:rewardBalance, recentClaims:recentClaims, steemPrice:steemPrice, votePowerReserveRate:votePowerReserveRate}});
              if(steemit&&blog_histogram)
                chrome.runtime.sendMessage({ token:token, to: 'blog_histogram', order: 'click',data:{}});

              url=window.location.href;
            }
            if(oneup&&utopian)
              chrome.runtime.sendMessage({ token:token, to: 'oneup', order: 'click',data:{account:account}});
            if(dropdown&&steemit)
              chrome.runtime.sendMessage({ token:token,to: 'drop', order: 'click',data:{market:market} });
          },200);
        });
      });
    }
  });
});

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
}, 5*60 * 1000);

}

function getSteemPrice(){
  xhttp.open("GET", "https://bittrex.com/api/v1.1/public/getticker?market=USDT-BTC", false);
  xhttp.send();
  const btc_price=parseFloat(JSON.parse(xhttp.responseText).result.Bid);
  xhttp.open("GET", "https://bittrex.com/api/v1.1/public/getticker?market=BTC-STEEM", false);
  xhttp.send();
  const priceSteem=parseFloat(JSON.parse(xhttp.responseText).result.Bid);
  xhttp.open("GET", "https://bittrex.com/api/v1.1/public/getticker?market=BTC-SBD", false);
  xhttp.send();
  const priceSBD=parseFloat(JSON.parse(xhttp.responseText).result.Bid);
  market={SBDperSteem:priceSteem/priceSBD,priceSteem:priceSteem*btc_price,priceSBD:priceSBD*btc_price};
  console.log(market);
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

function checkLastPost(last_post_url, me)
{
  console.log(last_post_url);
  steem.api.getDiscussionsByAuthorBeforeDate('steem-plus',null, new Date().toISOString().split('.')[0],1 , function(err, result) {
    console.log(result[0]);
    console.log(me);
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
      toastr.info('Thanks for using SteemPlus!<br />'+
                  'We just released a new post that you might be interested about:<br /><br /> ' + result[0].title +
                  '<br /><br /><button class="btn btn-primary" id="new_post_yes">Read</button> <button id="new_post_no" class="btn btn-primary">No, thanks</button><br /><br />' +
                  (me.account.witness_votes.includes("stoodkev") ? '' : 'You love SteemPlus? Please consider voting @stoodkev as a witness, it only takes few seconds! <button class="btn btn-primary" id="vote_as_witness">Vote</button>'), "Steem Plus News");

      $('#new_post_yes').click(function(){
        chrome.storage.local.set({
          last_post_url:result[0].url
        });
        $(this).parent().parent().remove();
        window.location.replace("https://steemit.com"+result[0].url);
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
    }
  });

}
