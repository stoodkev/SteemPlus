/**
 * Created by @stoodkev on 10/23/2017.
 */

var createdt=false;
var load_checkt='';
var wallet_elt_t;
var classButtonT;
var timeoutT=2000;
var token_tr=null;
var indexT=0;
var currency='STEEM';
var max=0;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to==='transfers'&&request.order==='start'&&token_tr==null)
    {
      token_tr=request.token;
      startTransfer(request.data.steemit,request.data.busy,request.data.user,request.data.balance);
      max=request.data.balance.steem;
    }

    if(request.to==='transfers'&&request.order==='click'&&token_tr===request.token)
      onClickTr(request.data.steemit,request.data.busy,request.data.user,request.data.balance);
});


      function startTransfer(isSteemit,busy,account,balance)
      {
        if(isSteemit) {
            load_checkt=/transfers/;
            wallet_elt_t=".FoundationDropdownMenu__label";
            classButtonT="'UserWallet__buysp button hollow transfer_to";
        }

        if(window.location.href.match(load_checkt))
            checkLoadTr(isSteemit,busy,account,balance);

    }

        function onClickTr(isSteemit,busy,account,balance){
            setTimeout(function() {
                if (window.location.href.match(load_checkt) && !createdt) {
                    createdt = true;
                    checkLoadTr(isSteemit,busy,account,balance);
                }
                if (!window.location.href.match(load_checkt)) {
                    createdt = false;
                }
            },timeoutT);
        }

        function checkLoadTr(isSteemit,busy,account,balance){
          indexT++;

            if($(wallet_elt_t).length===0){
                createButtonT(isSteemit,busy,account,balance);
            }
            else {
              if(indexT<5)
                setTimeout(checkLoadTr, 2000);
            }
        }

        function createButtonT(isSteemit,busy,account,balance) {
            console.log('Create Transfer Button');
            if($('.transfer_to').length===0) {
                var transfer_to = document.createElement('div');
                transfer_to.style.textAlign = 'right';
                transfer_to.className = 'divTransfer';
                var transfer_button = document.createElement('button');
                transfer_button.innerHTML = 'Transfer to user';
                transfer_button.className = classButtonT;
                transfer_button.id = 'transferButton';
                transfer_button.style.marginTop='15px';
                transfer_button.style.display = 'block';
                transfer_button.style.float = 'right';
                transfer_to.appendChild(transfer_button);
                $('.UserWallet .small-10 h4')[0].after(transfer_to);
                const receiver=window.location.href.split('@')[1].split('/')[0];

                $('.transfer_to').click(function(){
                    var div = document.createElement('div');
                    div.id = 'overlay_transfer';
                    var inner="";
                        inner = '<div data-reactroot="" role="dialog" style="bottom: 0px; left: 0px; overflow-y: scroll; position: fixed; right: 0px; top: 0px;"><div class="reveal-overlay fade in" style="display: block;"></div><div class="reveal fade in" role="document" tabindex="-1" style="display: block;"><button class="close-button" type="button"><span aria-hidden="true" class="">×</span></button><div><div class="row"><h3 class="column">Transfer</h3>' +
                            '</div><form ><div><div class="row"><div class="column small-12">Transfer Steem or SBD from @'+account+' to @'+receiver+'.</div></div><br></div><div class="row"><div class="column small-2" style="padding-top: 5px;">' +
                            'Amount</div><div class="column small-10"><div class="input-group" style="margin-bottom: 5px;"><input type="text" placeholder="Amount" name="amount" value="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"><span class="input-group-label currency" style="padding-left: 0px; padding-right: 0px; border:#1A5099 1px solid; border-radius:5px; background:white;">' +
                            '<span  style="min-width: 5rem; height: inherit; background-color: transparent; border: none;">STEEM</span></span><span class=" input-group-label currency" style="padding-left: 0px; padding-right: 0px;" >' +
                            '<span  style="min-width: 5rem; height: inherit; background-color: transparent; border: none;" >SBD</span></span></div><div style="margin-bottom: 0.6rem;"><a id="max_b" style="border-bottom: 1px dotted rgb(160, 159, 159); cursor: pointer;">' +
                            'Balance: <span class="maxbalance">'+max+'</span> <span class="maxbalance_currency">STEEM</span></a></div></div></div><div class="row"><div class="column small-2" style="padding-top: 33px;">Memo</div><div class="column small-10"><small>This memo is public</small><input type="text" placeholder="Memo" name="memo" value="" autocomplete="on" autocorrect="off" autocapitalize="off" spellcheck="false"><div class="error"><!-- react-text: 45 -->&nbsp;<!-- /react-text --></div></div></div>';

                            inner +='<div class="row"><div class="column"><span><input type="button"   disabled="" class="UserWallet__buysp button hollow transfer_to" id="bd" value="Submit"/></span></div></div></form></div></div></div>';
                            div.innerHTML=inner;


                    $('body').append(div);
                    $('.currency').click(function(){
                        $(this).css('background','white');
                        $(this).css('border','#1A5099 1px solid');
                        $(this).css('border-radius','5px');
                        const index=$('.currency').index($(this));
                        currency=index==0?'STEEM':'SBD';
                        max=currency=='STEEM'?balance.steem:balance.sbd;
                        $('.maxbalance').html(max);
                        $('.maxbalance_currency').html(currency);

                        $('.currency').each(function(i,e,a){
                          if(index!==i)
                          {
                              $(e).css('background','#e6e6e6');
                              $(e).css('border','#cacaca 1px solid');
                              $(e).css('border-radius','0');
                          }
                        });
                    });
                    $('.close-button').click(function(){$('#overlay_transfer').remove();});
                    $('#max_b').click(function(){$('input[name=amount]').val(max); checkSubmit();});
                    $('form input').blur(function () {
                      checkSubmit();

                    });
                    function checkSubmit(){
                      if(parseFloat($('input[name=amount]').val())>=0&&parseFloat($('input[name=amount]').val())<=max)
                      {$('#bd').prop("disabled",false); }
                      else
                      {$('#bd').prop("disabled",true); }
                    }
                    $('#bd').click(function () {

                      var url = 'https://v2.steemconnect.com/sign/transfer?from='+account+'&to='+receiver+'&amount='+$('input[name=amount]').val()+'%20'+currency+'&memo='+$('input[name=memo]').val();
                      window.open(url, '_blank');
                    });
                });
            }
        }
