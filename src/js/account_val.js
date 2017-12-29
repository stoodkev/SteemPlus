var created_a=false;
var load_check_a='',load_check2_a='';
var wallet_elt_a;
var timeout_a=1000;
var account_v;
var url_a="";
var STEEM_A,SBD_A;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to==='acc_v'&&request.order==='start')
      startAccountValue(request.data.steemit,request.data.busy,request.data.global,request.data.market);
    if(request.to==='acc_v'&&request.order==='click')
      onClickA(request.data.steemit,request.data.busy,request.data.global,request.data.market);
});

function startAccountValue(isSteemit,busy,globalP,market){
        if(isSteemit) {
            load_check_a=/transfers/;
            load_check2_a=/transfers/;
            account_v=window.location.href.split('@')[1].split('/')[0];
            wallet_elt_a=$('.medium-4')[4];
        }
            else if(busy)
        {
            load_check_a=/wallet/;
            load_check2_a=/transfers/;
            wallet_elt_a=".UserWalletSummary__item ";
            account_v=(window.location.href.match(load_check))?$('.Topnav__user__username').html():window.location.href.split('@')[1].split('/')[0];
        }

        if(window.location.href.match(load_check_a)||window.location.href.match(load_check2_a))
            checkLoad(isSteemit,busy,globalP,market);
    }

  function onClickA(isSteemit,busy,globalP,market){
    setTimeout(function() {
      if(window.location.href!==url_a)
      {
        account_v=isSteemit?window.location.href.split('@')[1].split('/')[0]:(window.location.href.match(load_check_a))?$('.Topnav__user__username').html():window.location.href.split('@')[1].split('/')[0];
        wallet_elt_a=isSteemit?$('.medium-4')[4]:".UserWalletSummary__item ";
        created_a=false;
      }
      if ((window.location.href.match(load_check_a)||window.location.href.match(load_check2_a)) && !created_a) {
        created_a = true;
        checkLoad(isSteemit,busy,globalP,market);
      }
      if (!window.location.href.match(load_check_a)&&!window.location.href.match(load_check2_a)) {
        created_a = false;
      }
    },timeout_a);
  }

  function checkLoad(isSteemit,busy,globalP,market){
    if($(wallet_elt_a).length>0){
      createTitle(isSteemit,busy,globalP,market);
    }
    else {
      setTimeout(checkLoad, 1000);
    }
  }

  function createTitle(isSteemit,busy,globalP,market) {
    var real_val=document.createElement('span');
    var logo=document.createElement('img');
    logo.src=chrome.extension.getURL("src/img/logo.png");
    logo.title='Real account value calculated by SteemPlus according to Bittrex price for STEEM and SBD';
    if(isSteemit&& $('.medium-4 .dropdown-arrow').length!==0)
      real_val.style.marginRight='1em';
    real_val.className='real_value';
    real_val.append(logo);
    STEEM_A=market.priceSteem;
    SBD_A=market.priceSBD;
    steem.api.getAccounts([account_v], function(err, result) {
      var value=0;
      value+=STEEM_A*(parseFloat(result[0].balance.split(' ')[0])+parseFloat(result[0].savings_balance.split(' ')[0])+steem.formatter.vestToSteem(result[0].vesting_shares, globalP.totalVests, globalP.totalSteem));
      value+=SBD_A*(parseFloat(result[0].savings_sbd_balance.split(' ')[0])+parseFloat(result["0"].sbd_balance.split(' ')[0]));
      value=Math.round(value*100)/100;
      value=value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      if(isSteemit){
        real_val.append('$ '+value);
      console.log(wallet_elt_a,real_val);
      wallet_elt_a.append(real_val);
      if($('.real_value').length>1)
        $('.real_value')[0].remove();}
      else $('.UserWalletSummary__value')[4].title='$ '+value+' according to SteemPlus calculation using Bittrex price for SBD and STEEM.';
        url=window.location.href;
  });
}
