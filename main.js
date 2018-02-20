var xhttp = new XMLHttpRequest();
const steemit =(window.location.href.includes('steemit.com')||window.location.href.includes('mspsteem.com'));
const busy =window.location.href.includes('busy.org');
const utopian =window.location.href.includes('utopian.io');
console.log(steemit,busy,utopian);
var market =null,SBDperSteem=0;
const DEFAULT_FEED_SIZE=3;
var url=window.location.href;

steem.api.setOptions({ url: 'https://api.steemit.com' });

steem.api.getDynamicGlobalProperties( function(err,globalProp)
{

  var rewardBalance, recentClaims, steemPrice =null;
  steem.api.getRewardFund("post", function(e, t) {
    rewardBalance = parseFloat(t.reward_balance.replace(" STEEM", ""));
    recentClaims = t.recent_claims;

    steem.api.getCurrentMedianHistoryPrice(function(e1, t1) {
      steemPrice = parseFloat(t1.base.replace(" SBD", "")) / parseFloat(t1.quote.replace(" STEEM", ""));
    });
  });


  console.log(err,globalProp);
    const totalSteem = Number(globalProp.total_vesting_fund_steem.split(' ')[0]);
    const totalVests = Number(globalProp.total_vesting_shares.split(' ')[0]);
    updateSteemPrice();
  chrome.storage.local.get(['steemit_more_info','post_votes_list', 'oneup','weight','del','transfers','acc_v','ben','drop','badge','username', 'nb_posts','resteem','sort','tag','list_tags','voted_check', 'rep_feed', 'rep_feed_check', 'whitelist', 'blacklist','feedp','sessionToken','tokenExpire'], function (items) {
    const token=makeToken();
    var steemConnect=(items.sessionToken===undefined||items.tokenExpire===undefined)?{connect:false}:{connect:true,sessionToken:items.sessionToken,tokenExpire:items.tokenExpire};
    chrome.runtime.sendMessage({ token:token, to: 'steemConnect', order: 'start',data:{steemConnect:steemConnect,steemit:steemit,busy:busy,utopian:utopian}} );

    if(steemConnect.connect===true&&steemConnect.tokenExpire>Date.now()){
      initializeSteemConnect(steemConnect.sessionToken);
      sc2.me().then((me)=> {
        console.log(me);

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

        var whitelist=(items.whitelist !== undefined)?items.whitelist:"";
        var blacklist=(items.blacklist !== undefined)?items.blacklist:"";
        var rep_feed_check=(items.rep_feed_check!==undefined)?items.rep_feed_check:null;
        var rep_feed=(items.rep_feed!==undefined)?items.rep_feed:null;
        var sort=(items.sort!==undefined)?items.sort:null;
        var tag=(items.tag!==undefined)?items.tag:'show';
        var list_tags=(items.list_tags!==undefined)?items.list_tags:null;
        var voted_check=(items.vote_check!==undefined)?items.voted_check:false;
        var nb_posts=(items.nb_posts!==undefined&&items.nb_posts<10&&items.nb_posts!=='')?items.nb_posts:DEFAULT_FEED_SIZE;
				console.log(steemConnect);
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

        if (steemit_more_info) {
          if(steem&&post_votes_list)
            chrome.runtime.sendMessage({ token:token, to: 'post_votes_list', order: 'start',data:{rewardBalance:rewardBalance, recentClaims:recentClaims, steemPrice:steemPrice}});
        }
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
    scope: ['vote', 'comment','comment_options']
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
