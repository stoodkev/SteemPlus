var created_a=false;
var load_check_a='',load_check2_a='';
var wallet_elt_a;
var timeout_a=1000;
var account_v;
var STEEM_A,SBD_A;
var token_a=null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to==='acc_v'&&request.order==='start'&&token_a==null)
    {
      token_a=request.token;
      startAccountValue(request.data.steemit,request.data.busy,request.data.global,request.data.market);
    }
    if(request.to==='acc_v'&&request.order==='click'&&token_a===request.token)
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
      if(window.location.href!=='')
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
    real_val.href="#";
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
      console.log(err,result);
      const STEEM_BALANCE=STEEM_A*parseFloat(result[0].balance.split(' ')[0]);
      const STEEM_SAVINGS=STEEM_A*+parseFloat(result[0].savings_balance.split(' ')[0]);
      const STEEM_POWER=STEEM_A*steem.formatter.vestToSteem(result[0].vesting_shares, globalP.totalVests, globalP.totalSteem);
      const STEEM= STEEM_BALANCE+STEEM_SAVINGS+STEEM_POWER;
      const SBD_BALANCE=SBD_A*parseFloat(result["0"].sbd_balance.split(' ')[0]);
      const SBD_SAVINGS=SBD_A*parseFloat(result[0].savings_sbd_balance.split(' ')[0]);
      const SBD=SBD_BALANCE+SBD_SAVINGS;
      const TOTAL_VALUE=SBD+STEEM;
      value=postProcess(TOTAL_VALUE);

      if(isSteemit){
        var pop=document.createElement('a');
        pop.innerHTML=value;
        pop.style.cursor='pointer';
        real_val.append(pop);
        wallet_elt_a.append(real_val);

      $('.real_value a').attr('data-toggle','popover');
      $('.real_value a').attr('data-content','<h5>STEEM: '+postProcess(STEEM)+'</h5><hr/> Balance: '+postProcess(STEEM_BALANCE)+'<br/> SP: '+postProcess(STEEM_POWER)+'<br/> Savings: '+postProcess(STEEM_SAVINGS)+'<br/><br/> <h5>SBD: '+postProcess(SBD)+'</h5><hr/> Balance: '+postProcess(SBD_BALANCE)+'<br/> Savings: '+postProcess(SBD_SAVINGS));
      $('.real_value a').attr('data-placement','bottom');
      $('.real_value a').attr('title','<h5>Details</h5>');
      $('.real_value a').attr('data-html','true');
      $('.real_value a').click(function(){
      $('[data-toggle="popover"]').popover();});
      if($('.real_value').length>1)
        $('.real_value')[0].remove();}
      else $('.UserWalletSummary__value')[4].title='$ '+value+' according to SteemPlus calculation using Bittrex price for SBD and STEEM.';
        url=window.location.href;

  });
}

function postProcess(value)
{
  value=Math.round(value*100)/100;
  value=value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return '$' +value;
}
