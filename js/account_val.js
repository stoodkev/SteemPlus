/**
 * Created by @stoodkev on 10/23/2017.
 */

var website='';
var created=false;
var load_check='',load_check2='';
var wallet_elt;
var timeout=1000;
var account;
var xhttp = new XMLHttpRequest();
var url="";

chrome.storage.local.get(['acc_v'], function (items) {
      if(items.acc_v==undefined||items.del=="show")
      {
        if(window.location.href.match('steemit.com')||window.location.href.match('mspsteem.com')) {
            website='steemit';
            load_check=/transfers/;
            load_check2=/transfers/;
            account=window.location.href.split('@')[1].split('/')[0];
            wallet_elt=$('.medium-4')[4];

        }
            else if(window.location.href.match('busy.org'))
        {
            website='busy';
            load_check=/wallet/;
            load_check2=/transfers/;
            wallet_elt=".UserWalletSummary__item ";
            account=(window.location.href.match(load_check))?$('.Topnav__user__username').html():window.location.href.split('@')[1].split('/')[0];

        }

        if(window.location.href.match(load_check)||window.location.href.match(load_check2))
            checkLoad();
        $(document).click(function(){

            setTimeout(function() {
              if(window.location.href!==url)
              {
                account=(website==='steemit')?window.location.href.split('@')[1].split('/')[0]:(window.location.href.match(load_check))?$('.Topnav__user__username').html():window.location.href.split('@')[1].split('/')[0];
                wallet_elt=(website==='steemit')?$('.medium-4')[4]:".UserWalletSummary__item ";
                created=false;
              }
                if ((window.location.href.match(load_check)||window.location.href.match(load_check2)) && !created) {
                    created = true;
                    checkLoad();
                }
                if (!window.location.href.match(load_check)&&!window.location.href.match(load_check2)) {
                    created = false;
                }
            },timeout);
        });

        function checkLoad(){
            console.log('checkload');
            if($(wallet_elt).length>0){
                createTitle();
            }
            else {
                setTimeout(checkLoad, 1000);
            }
        }

        function createTitle() {

          var real_val=document.createElement('span');
          var logo=document.createElement('img');
          logo.src=chrome.extension.getURL("/img/logo.png");
          logo.title='Real account value calculated by SteemPlus according to Bittrex price for STEEM and SBD';
          if(website==='steemit'&& $('.medium-4 .dropdown-arrow').length!==0)
            real_val.style.marginRight='1em';
          real_val.className='real_value';
          real_val.append(logo);
          xhttp.open("GET", "https://api.coinmarketcap.com/v1/ticker/steem/", false);
          xhttp.send();
          const STEEM=parseFloat(JSON.parse(xhttp.responseText)[0].price_usd);
          xhttp.open("GET", "https://api.cryptonator.com/api/ticker/sbd-usd", false);
          xhttp.send();
          const SBD=parseFloat(JSON.parse(xhttp.responseText).ticker.price);
          steem.api.getDynamicGlobalProperties( {
          }).then((res)=>
          {
              const totalSteem = res.total_vesting_fund_steem;
              const totalVests = res.total_vesting_shares;
              steem.api.getAccounts([account], function(err, result) {
                  console.log(err, result);
                  console.log(STEEM,SBD);
                  var value=0;
                  console.log(result[0].balance.split(' ')[0].split(' ')[0],result[0].savings_balance.split(' ')[0], steem.formatter.vestToSteem(result[0].vesting_shares, totalVests, totalSteem),result[0].savings_sbd_balance.split(' ')[0],result["0"].sbd_balance.split(' ')[0]);
                  value+=STEEM*(parseFloat(result[0].balance.split(' ')[0])+parseFloat(result[0].savings_balance.split(' ')[0])+steem.formatter.vestToSteem(result[0].vesting_shares, totalVests, totalSteem));
                  value+=SBD*(parseFloat(result[0].savings_sbd_balance.split(' ')[0])+parseFloat(result["0"].sbd_balance.split(' ')[0]));
                  value=Math.round(value*100)/100;
                  value=value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                  if(website==='steemit'){
                  real_val.append('$ '+value);
                  console.log(wallet_elt,real_val);
                  wallet_elt.append(real_val);
                  if($('.real_value').length>1)
                            $('.real_value')[0].remove();}
                  else $('.UserWalletSummary__value')[4].title='$ '+value+' according to SteemPlus calculation using Bittrex price for SBD and STEEM.';
                  url=window.location.href;
                });
          });

          }

        }

    });
