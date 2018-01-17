/**
 * Created by @stoodkev on 10/23/2017.
 */

var created=false;
var load_check='',load_check2='';
var wallet_elt_d;
var classButton;
var timeoutD=2000;
var token_del=null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to==='delegation'&&request.order==='start'&&token_del==null)
    {
      token_del=request.token;
      startDelegation(request.data.steemit,request.data.busy,request.data.global,request.data.user);
    }

    if(request.to==='delegation'&&request.order==='click'&&token_del===request.token)
      onClickD(request.data.steemit,request.data.busy,request.data.global,request.data.user);
});


      function startDelegation(isSteemit,busy,globalP,account)
      {
        if(isSteemit) {
            load_check=/transfers/;
            load_check2=/transfers/;
            wallet_elt_d=".FoundationDropdownMenu__label";
            classButton="'UserWallet__buysp button hollow delegate";
        }
            else if(busy)
        {
            load_check=/wallet/;
            load_check2=/transfers/;
            wallet_elt_d=".UserWalletSummary__item ";
            classButton="Action ant-btn-lg Action--primary delegate";

        }

        if(window.location.href.match(load_check)||window.location.href.match(load_check2))
            checkLoadDel(isSteemit,busy,globalP,account);

    }

        function onClickD(isSteemit,busy,globalP,account){
            setTimeout(function() {
                if ((window.location.href.match(load_check)||window.location.href.match(load_check2)) && !created) {
                    created = true;
                    checkLoadDel(isSteemit,busy,globalP,account);
                }
                if (!window.location.href.match(load_check)&&!window.location.href.match(load_check2)) {
                    created = false;
                }
            },timeoutD);
        }
var ii=0;
        function checkLoadDel(isSteemit,busy,globalP,account){
          ii++;

            if($(wallet_elt_d).length>1){
                createButton(isSteemit,busy,globalP,account);
            }
            else {
              if(ii<5)
                setTimeout(checkLoadDel, 2000);
            }
        }

        function createButton(isSteemit,busy,globalP,account) {
            console.log('Create Delegation Button');
            if($('.delegate').length===0) {
              if($('.transfer_to').length!==0) $('.transfer_to').remove();
                var delegate_div = document.createElement('div');
                delegate_div.style.width = '100%';
                delegate_div.style.textAlign = 'right';
                var delegate_button = document.createElement('button');
                delegate_button.innerHTML = 'Delegate';
                delegate_button.className = classButton;
                delegate_button.id = 'delegateButton';
                delegate_button.style.marginTop='15px';
                delegate_button.style.display = 'block';
                delegate_button.style.float = 'right';
                if(busy)delegate_button.style.marginTop= '10px';
                  delegate_div.appendChild(delegate_button);
                if(isSteemit)
                    $('.UserWallet__balance ')[1].childNodes[1].append(delegate_div);
                else
                {$('.Action--primary ')[0].parentNode.appendChild(delegate_div);}

                function getMaxSP(){if(isSteemit)return (parseFloat($(".FoundationDropdownMenu__label")[1].innerHTML.split('-->')[1].split(' ')[0].replace(',',''))-5.001).toFixed(3);
                else return (parseFloat(($('.UserWalletSummary__value span')[3].innerHTML).replace(',',''))-5.001).toFixed(3);}

                $('.delegate').click(function(){
                    steem.api.getVestingDelegations(account, null, 10, function(err, result) {
                    var div = document.createElement('div');
                    div.id = 'overlay_delegate';
                    var inner="";
                    if(isSteemit) {
                        inner = '<div data-reactroot="" role="dialog" style="bottom: 0px; left: 0px; overflow-y: scroll; position: fixed; right: 0px; top: 0px;"><div class="reveal-overlay fade in" style="display: block;"></div><div class="reveal fade in" role="document" tabindex="-1" style="display: block;"><button class="close-button" type="button"><span aria-hidden="true" class="">×</span></button><div><div class="row"><h3 class="column">Delegate</h3>' +
                            '</div><form ><div><div class="row"><div class="column small-12">Delegate SP to another Steemit account.</div></div><br></div><div class="row"><div class="column small-2" style="padding-top: 5px;">From</div><div class="column small-10"><div class="input-group" style="margin-bottom: 1.25rem;"><span class="input-group-label">@</span>' +
                            '<input type="text" class="input-group-field bold"  placeholder="Your account"value='+account+' style="background-image: url(&quot;data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP6zwAAAgcBApocMXEAAAAASUVORK5CYII=&quot;);"></div></div></div><div class="row"><div class="column small-2" style="padding-top: 5px;">' +
                            'To</div><div class="column small-10"><div class="input-group" style="margin-bottom: 1.25rem;"><span class="input-group-label">@</span><input type="text" class="input-group-field" placeholder="Send to account" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" name="to" value=""></div><p></p></div></div><div class="row"><div class="column small-2" style="padding-top: 5px;">' +
                            'Amount</div><div class="column small-10"><div class="input-group" style="margin-bottom: 5px;"><input type="text" placeholder="Amount" name="amount" value="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"><span class="input-group-label" style="padding-left: 0px; padding-right: 0px;">' +
                            '<span  style="min-width: 5rem; height: inherit; background-color: transparent; border: none;">SP</span></span></div><div style="margin-bottom: 0.6rem;"><a id="max_sp" style="border-bottom: 1px dotted rgb(160, 159, 159); cursor: pointer;">' +
                            'Max*: ' + getMaxSP() + ' SP</a><p>* Maximum delegation available if no SP is currently delegated.</p></div></div></div><div class="delegations"><div class="row"><h3 class="column">Current delegations</h3></div><ul>';
                            for (resul of result){
                              inner +='<div class="row"><div class="column "><li>'+Math.round(steem.formatter.vestToSteem(resul.vesting_shares,globalP.totalVests ,globalP.totalSteem)*100)/100 +' SP delegated to @'+resul.delegatee+'<a href="https://v2.steemconnect.com/sign/delegateVestingShares?delegator=' + account + '&delegatee=' + resul.delegatee + '&vesting_shares='+0+'%20VESTS"><button class="stop_del" type="button"><span aria-hidden="true" style="color:red ; margin-right:1em;" class="">×</span></button></a></li></div></div>';
                            }
                            inner +='</ul></div><div class="row"><div class="column"><span><input type="button"   disabled="" class="UserWallet__buysp button hollow delegate" id="bd" value="Submit"/></span></div></div></form></div></div></div>';
                            div.innerHTML=inner;
                    }
                    else
                    {
                        inner='<div><div><div class="ant-modal-mask"></div><div tabindex="-1" class="ant-modal-wrap " role="dialog" aria-labelledby="rcDialogTitle0"><div role="document" class="ant-modal" style="width: 520px; transform-origin: 620.8px 9px 0px;"><div class="ant-modal-content"><button aria-label="Close" class="ant-modal-close"><span class="ant-modal-close-x close-button"></span></button>'+
                            '<div class="ant-modal-header"><div class="ant-modal-title" id="rcDialogTitle0">Delegate SP to another account</div></div><div class="ant-modal-body"><form class="ant-form ant-form-horizontal ant-form-hide-required-mark Transfer container"><div class="ant-row ant-form-item"><div class="ant-form-item-label"><label for="from" class="ant-form-item-required" title=""><span>From</span></label></div><div class="ant-form-item-control-wrapper"><div class="ant-form-item-control "><input type="text" placeholder="Your account" value="" id="from" data-__meta="[object Object]" class="ant-input ant-input-lg"></div></div>'+
                            '<div class="ant-form-item-label"><label for="to" class="ant-form-item-required" title=""><span>To</span></label></div><div class="ant-form-item-control-wrapper"><div class="ant-form-item-control "><input type="text" placeholder="Send to account" value="" id="to" data-__meta="[object Object]" class="ant-input ant-input-lg"></div></div></div>'+
                            '<div class="ant-row ant-form-item"><div class="ant-form-item-label"><label for="amount" class="ant-form-item-required" title=""><span>Amount</span></label></div><div class="ant-form-item-control-wrapper"><div class="ant-form-item-control "><span class="ant-input-group-wrapper" style="width: 100%;"><span class="ant-input-wrapper ant-input-group"><input type="text" placeholder="How much do you want to send" value="" id="amount" data-__meta="[object Object]" name="amount" class="ant-input ant-input-lg"><span class="ant-input-group-addon"><div class="ant-radio-group"><label class="ant-radio-button-wrapper"><span class="ant-radio-button"><input type="radio" class="ant-radio-button-input" value="on"><span class="ant-radio-button-inner"></span></span><span>SP</span></label></div></span></span></span>'+
                            '<span id="max_sp">Max*: <span role="presentation" class="balance">'+getMaxSP()+'</span>.<br/>* Maximum delegation available if no SP is currently delegated.'
                            +'</span></div></div></div></form><div class="del_busy" style="margin-bottom:1em;"><div class="ant-modal-header" style="padding:0;"><div class="ant-modal-title" id="rcDialogTitle0">Current delegations</div></div><ul>';
                            for (resul of result){
                              inner +='<li>'+Math.round(steem.formatter.vestToSteem(resul.vesting_shares,globalP.totalVests ,globalP.totalSteem)*100)/100 +' SP delegated to @'+resul.delegatee+'<a href="https://v2.steemconnect.com/sign/delegateVestingShares?delegator=' + account + '&delegatee=' + resul.delegatee + '&vesting_shares='+0+'%20VESTS"><button class="stop_del" type="button"><span aria-hidden="true" style="color:red ; " class="">×</span></button></a></li>';
                            }
                            inner+='</div><span>Click the button below to be redirected to SteemConnect to complete your transaction.</span></div><div class="ant-modal-footer"><button type="button" class="ant-btn ant-btn-lg close-button"><span>Cancel</span></button><input type="button" id="bd" style="margin-left: 1em;"disabled="" class="ant-btn ant-btn-primary ant-btn-lg delegate" value="Send"/></div></div><div tabindex="0" style="width: 0px; height: 0px; overflow: hidden;">sentinel</div></div></div></div></div>';
                            div.innerHTML=inner;
                    }

                    $('body').append(div);
                    $('.close-button').click(function(){$('#overlay_delegate').remove();});
                    $('#max_sp').click(function(){$('input[name=amount]').val(getMaxSP()+'');});
                    $('form input').blur(function () {
                        if(parseFloat($('input[name=amount]').val())>=0&&parseFloat($('input[name=amount]').val())<=getMaxSP()&&$('input[placeholder="Your account"]').val()!==''&&$('input[placeholder="Send to account"]').val()!=='')
                        {$('#bd').prop("disabled",false); }
                        else
                        {$('#bd').prop("disabled",true); }
                    });

                    $('#bd').click(function () {

                      const delegated_SP = $('input[name=amount]').val();
                      var delegated_vest = delegated_SP * globalP.totalVests / globalP.totalSteem;
                      delegated_vest=delegated_vest.toFixed(6);
                      var url = 'https://v2.steemconnect.com/sign/delegateVestingShares?delegator=' + $('input[placeholder="Your account"]').val() + '&delegatee=' + $('input[placeholder="Send to account"]').val() + '&vesting_shares='+delegated_vest+'%20VESTS';
                      window.open(url, '_blank');
                    });
                });
              });
            }
        }
