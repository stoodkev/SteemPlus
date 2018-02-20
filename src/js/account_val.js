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
            wallet_elt_a=$('.UserWalletSummary__value')[4];
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
    var title='<h5>Details</h5>';
    var real_val=document.createElement('span');
    var logo=document.createElement('img');
    logo.src=chrome.extension.getURL("src/img/logo.png");
    logo.id='logovalue';
    if(isSteemit)
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


        var pop=document.createElement('a');
        pop.style.cursor='pointer';
        pop.id='popop';

        if(isSteemit){
          pop.innerHTML=value;
          real_val.append(pop);
          wallet_elt_a.append(real_val);
      if($('.real_value').length>1)
        $('.real_value')[0].remove();}
      else {
        wallet_elt_a.prepend(pop);
        $('#popop').html(logo);
        title='<h5>Total <span class="value_of">'+value+'</class></h5>';

        url=window.location.href;}

    $('#popop').attr('data-toggle','popover');
    $('#popop').attr('data-content','<h5>STEEM:  <span class="value_of">'+postProcess(STEEM)+'</span>'
      +'</h5><hr/> Balance: <span class="value_of">'+postProcess(STEEM_BALANCE)+'</span>'
      +'<br/> SP: <span class="value_of">'+postProcess(STEEM_POWER)+'</span>'
      +'<br/> Savings: <span class="value_of">'+postProcess(STEEM_SAVINGS)+'</span>'
      +'<br/><br/> <h5>SBD: <span class="value_of">'+postProcess(SBD)+'</span>'
      +'</h5><hr/> Balance: <span class="value_of">'+postProcess(SBD_BALANCE)+'</span>'
      +'<br/> Savings: <span class="value_of">'+postProcess(SBD_SAVINGS)+'</span>');
    $('#popop').attr('data-placement','bottom');
    $('#popop').attr('title',title);
    $('#popop').attr('data-html','true');
    $('#popop').attr('data-trigger','hover');
    $('[data-toggle="popover"]').popover();

  });
}

function postProcess(value)
{
  value=Math.round(value*100)/100;
  value=value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return '$' +value;
}
