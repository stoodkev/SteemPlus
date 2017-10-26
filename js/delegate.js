/**
 * Created by @stoodkev on 10/23/2017.
 */

var website='';
var created=false;

if(window.location.href.match('steemit.com')) {
    website='steemit';
    if($('span[title="STEEM POWER delegated to this account"]').length===1)
        checkLoad();
    $(document).click(function(){
        if(window.location.href.match(/transfers/)&&!created){created=true;checkLoad();
        }
        if(!window.location.href.match(/transfers/)){created=false;
        }
    });

}
    else if(window.location.href.match('steemit.com'))
{website='busy';}


function checkLoad(){
    if($('span[title="STEEM POWER delegated to this account"]').length===1&&$(".FoundationDropdownMenu__label").length>1){
        createButton();
    }
    else {
        setTimeout(checkLoad, 1000); // checkLoad again in a second
    }
}

function createButton() {
    if($('.delegate').length===0) {
        var delegate_div = document.createElement('div');
        delegate_div.style.width = '100%';
        delegate_div.style.textAlign = 'right';
        var delegate_button = document.createElement('button');
        delegate_button.innerHTML = 'Delegate';
        delegate_button.className = 'UserWallet__buysp button hollow delegate';
        delegate_button.style.display = 'block';
        delegate_button.style.float = 'right';
        delegate_div.appendChild(delegate_button);

        $('span[title="STEEM POWER delegated to this account"]').after(delegate_div);
        function getMaxSP(){return (parseFloat($(".FoundationDropdownMenu__label")[1].innerHTML.split('-->')[1].split(' ')[0])-5.001).toFixed(3);}

        $('.delegate').click(function(){
            var div=document.createElement('div');
            div.id='overlay_delegate';
            div.innerHTML='<div data-reactroot="" role="dialog" style="bottom: 0px; left: 0px; overflow-y: scroll; position: fixed; right: 0px; top: 0px;"><div class="reveal-overlay fade in" style="display: block;"></div><div class="reveal fade in" role="document" tabindex="-1" style="display: block;"><button class="close-button" type="button"><span aria-hidden="true" class="">×</span></button><div><div class="row"><h3 class="column">Delegate</h3>'+
                '</div><form ><div><div class="row"><div class="column small-12">Delegate SP to another Steemit account.</div></div><br></div><div class="row"><div class="column small-2" style="padding-top: 5px;">From</div><div class="column small-10"><div class="input-group" style="margin-bottom: 1.25rem;"><span class="input-group-label">@</span>'+
                '<input type="text" class="input-group-field bold"  placeholder="Your account"value="" style="background-image: url(&quot;data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP6zwAAAgcBApocMXEAAAAASUVORK5CYII=&quot;);"></div></div></div><div class="row"><div class="column small-2" style="padding-top: 5px;">'+
                'To</div><div class="column small-10"><div class="input-group" style="margin-bottom: 1.25rem;"><span class="input-group-label">@</span><input type="text" class="input-group-field" placeholder="Send to account" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" name="to" value=""></div><p></p></div></div><div class="row"><div class="column small-2" style="padding-top: 5px;">'+
                'Amount</div><div class="column small-10"><div class="input-group" style="margin-bottom: 5px;"><input type="text" placeholder="Amount" name="amount" value="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"><span class="input-group-label" style="padding-left: 0px; padding-right: 0px;">'+
                '<span  style="min-width: 5rem; height: inherit; background-color: transparent; border: none;">SP</span></span></div><div style="margin-bottom: 0.6rem;"><a id="max_sp" style="border-bottom: 1px dotted rgb(160, 159, 159); cursor: pointer;">'+
                'Max: '+getMaxSP()+' SP</a></div></div></div><div class="row"><div class="column"><span><input type="button"   disabled="" class="UserWallet__buysp button hollow delegate" id="bd" value="Submit"/></span></div></div></form></div></div></div>';
            $('body').append(div);
            $('.close-button').click(function(){console.log('close');$('#overlay_delegate').remove();});
            $('#max_sp').click(function(){$('input[name=amount]').val(getMaxSP()+'');});
            $('form input').blur(function () {
                if(parseFloat($('input[name=amount]').val())>=0&&parseFloat($('input[name=amount]').val())<=getMaxSP()&&$('input[placeholder="Your account"]').val()!==''&&$('input[placeholder="Send to account"]').val()!=='')
                {$('#bd').prop("disabled",false); }
                else
                {$('#bd').prop("disabled",true); }
            });

            $('#bd').click(function () {

                steem.api.getDynamicGlobalProperties( {


                }).then((result)=>
                {
                    const totalSteem = Number(result.total_vesting_fund_steem.split(' ')[0]);
                    const totalVests = Number(result.total_vesting_shares.split(' ')[0]);
                    const delegated_SP = $('input[name=amount]').val();

                    var delegated_vest = delegated_SP * totalVests / totalSteem;
                    delegated_vest=delegated_vest.toFixed(6);
                    var url = 'https://v2.steemconnect.com/sign/delegateVestingShares?delegator=' + $('input[placeholder="Your account"]').val() + '&delegatee=' + $('input[placeholder="Send to account"]').val() + '&vesting_shares='+delegated_vest+'%20VESTS';
                    window.open(url, '_blank');
                })
            });


        });
    }
}

/*steem.api.getDynamicGlobalProperties(function(err, result) {
    console.log(err, result);
    const totalSteem = Number(result.total_vesting_fund_steem.split(' ')[0]);
    const totalVests = Number(result.total_vesting_shares.split(' ')[0]);
    const delegated_SP=0;

    var delegated_vest=delegated_SP*totalVests/totalSteem;
    console.log(delegated_vest);

    steem.broadcast.delegateVestingShares('5KXDiof5YVgkRc8xt8phUgSuzivrzAVYLhuwCAsDppurHMVf9PR', 'steem-plus', 'stoodkev', delegated_vest.toFixed(6).toString()+' VESTS', function(err, result) {
        console.log(err, result);
    });
});
*/