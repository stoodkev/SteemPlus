var xhttp = new XMLHttpRequest();
const steemit =(window.location.href.match('steemit.com')||window.location.href.match('mspsteem.com'));
const busy =window.location.href.match('busy.org');
var market =null,SBDperSteem=0;
const DEFAULT_FEED_SIZE=3;
var url=window.location.href;


steem.api.getDynamicGlobalProperties( {}).then((globalProp)=>
{
    const totalSteem = Number(globalProp.total_vesting_fund_steem.split(' ')[0]);
    const totalVests = Number(globalProp.total_vesting_shares.split(' ')[0]);
    updateSteemPrice();
  chrome.storage.local.get(['del','acc_v','ben','drop','badge','username', 'nb_posts','resteem','sort','tag','list_tags','voted_check', 'rep_feed', 'rep_feed_check', 'whitelist', 'blacklist','feedp','sessionToken','tokenExpire'], function (items) {
    const token=makeToken();
    var steemConnect=(items.sessionToken===undefined||items.tokenExpire===undefined)?{connect:false}:{connect:true,sessionToken:items.sessionToken,tokenExpire:items.tokenExpire};
    chrome.runtime.sendMessage({ token:token, to: 'steemConnect', order: 'start',data:{steemConnect:steemConnect,steemit:steemit,busy:busy}} );

    if(steemConnect.connect===true&&steemConnect.tokenExpire>Date.now()){
      initializeSteemConnect(steemConnect.sessionToken);
      sc2.me().then((me)=> {
        console.log(me);
        const account=me.account;
        const user=me.name;
        const delegation=(items.del==undefined||items.del=="show");
        const account_value=(items.acc_v==undefined||items.acc_v=="show");
        const beneficiaries=(items.ben==undefined||items.ben=="show");
        const dropdown=(items.drop==undefined||items.drop=="show");
        const rank=(items.badge==undefined||items.badge=="show");
        const feedp=(items.feedp==undefined||items.feedp=="show");
        const resteem= (items.resteem !== undefined)?items.resteem:'show';
        var whitelist=(items.whitelist !== undefined)?items.whitelist:"";
        var blacklist=(items.blacklist !== undefined)?items.blacklist:"";
        var rep_feed_check=(items.rep_feed_check!==undefined)?items.rep_feed_check:null;
        var rep_feed=(items.rep_feed!==undefined)?items.rep_feed:null;
        var sort=(items.sort!==undefined)?items.sort:null;
        var tag=(items.tag!==undefined)?items.tag:'show';
        var list_tags=(items.list_tags!==undefined)?items.list_tags:null;
        var voted_check=(items.voted_check!==undefined)?items.voted_check:false;
        var nb_posts=(items.nb_posts!==undefined&&items.nb_posts<10&&items.nb_posts!=='')?items.nb_posts:DEFAULT_FEED_SIZE;

        if(delegation)
          chrome.runtime.sendMessage({ token:token, to: 'delegation', order: 'start',data:{steemit:steemit,busy:busy,global:{totalSteem:totalSteem,totalVests:totalVests},user:user} });
        if(account_value)
          chrome.runtime.sendMessage({ token:token, to: 'acc_v', order: 'start',data:{steemit:steemit,busy:busy,global:{totalSteem:totalSteem,totalVests:totalVests},market:market}});
        if(beneficiaries&&steemit)
          chrome.runtime.sendMessage({ token:token, to: 'ben', order: 'start',data:{user:user}});
        if(rank&&steemit)
          chrome.runtime.sendMessage({ token:token, to: 'rank', order: 'start'});
        if(steemit&&feedp&&resteem==='whitelist_radio'||resteem==='blacklist_radio')
          chrome.runtime.sendMessage({ token:token, to: 'resteem', order: 'start',data:{steemit:steemit,busy:busy,resteem:{resteem:resteem,whitelist:whitelist,blacklist:blacklist}}});
        if(steemit&&feedp)
          chrome.runtime.sendMessage({ token:token, to: 'feedp', order: 'start',data:{steemit:steemit,busy:busy,feedp:{resteem:resteem,whitelist:whitelist,blacklist:blacklist,rep_feed:rep_feed,rep_feed_check:rep_feed_check,tag:tag,list_tags:list_tags,voted_check:voted_check,sort:sort,nb_posts:nb_posts}}});

          $(document).click(function(){
          setTimeout(function(){
            if(url!==window.location.href)
            {
              if(delegation)
                chrome.runtime.sendMessage({token:token, to: 'delegation', order: 'click',data:{steemit:steemit,busy:busy,global:{totalSteem:totalSteem,totalVests:totalVests},user:user} });
              if(account_value)
                chrome.runtime.sendMessage({ token:token, to: 'acc_v', order: 'click',data:{steemit:steemit,busy:busy,global:{totalSteem:totalSteem,totalVests:totalVests},market:market} });
              if(beneficiaries&&steemit)
                chrome.runtime.sendMessage({ token:token, to: 'ben', order: 'click',data:{user:user}});
              if(rank&&steemit)
                chrome.runtime.sendMessage({ token:token, to: 'rank', order: 'click'});

              url=window.location.href;
            }
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
  xhttp.open("GET", "https://api.coinmarketcap.com/v1/ticker/steem/", false);
  xhttp.send();
  const priceSteem=parseFloat(JSON.parse(xhttp.responseText)[0].price_usd);
  const changeSteem=parseFloat(JSON.parse(xhttp.responseText)[0].percent_change_1h);
  xhttp.open("GET", "https://api.cryptonator.com/api/ticker/sbd-usd", false);
  xhttp.send();
  const priceSBD=parseFloat(JSON.parse(xhttp.responseText).ticker.price);
  const changeSBD=JSON.parse(xhttp.responseText).ticker.change;
  market={SBDperSteem:SBDperSteem,priceSteem:priceSteem,changeSteem:changeSteem,priceSBD:priceSBD,changeSBD:changeSBD};
  steem.api.getCurrentMedianHistoryPrice(function(err, result) {
     SBDperSteem=Math.round(parseFloat(result.base)*100)/1000;
     market={SBDperSteem:SBDperSteem,priceSteem:priceSteem,changeSteem:changeSteem,priceSBD:priceSBD,changeSBD:changeSBD};

    });
}

function makeToken() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
