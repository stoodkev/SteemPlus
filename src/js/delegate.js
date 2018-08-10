var token_del = null;
var delegationStarted = false;
var wallet_elt_d = null;
var usernamePageDelegation = null;
var created = false;
var load_check = '';
var load_check2 = '';
var wallet_elt_d;
var classButton;
var timeoutD = 2000;
var myAccountDelegation = null;
var totalOutgoingDelegation = -1;
var totalIncomingDelegation = -1;
var myTotalOutgoingDelegation = -1;

var retryCountDelegate = 0;


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.to === 'delegation' && request.order === 'start' && token_del == null) {
        token_del = request.token;
        myAccountDelegation = request.data.account;
        retryCountDelegate = 0;
        startDelegation(request.data.steemit, request.data.busy, request.data.global);
        delegationStarted = true;
    } else if (request.to === 'delegation' && request.order === 'click' && token_del === request.token) {
        myAccountDelegation = request.data.account;
        retryCountDelegate = 0;
        startDelegation(request.data.steemit, request.data.busy, request.data.global);
    } else if (request.to === 'delegation' && request.order === 'notif' && token_del == request.token) {
        retryCountDelegate = 0;
        if (!$('.delegate'))
            startDelegation(request.data.steemit, request.data.busy, request.data.global);
    }
});

// startDelegation checks if delegation can start or not
// @parameter isSteemit : boolean, true if used website is steemit
// @parameter isBusy : boolean, true if used website is busy
// @parameter globalP : contains total steem and total vests
function startDelegation(isSteemit, isBusy, globalP) {
    if (regexWalletBusy.test(window.location.href) || regexWalletSteemit.test(window.location.href)) {
        if (isSteemit) {
            wallet_elt_d = ".FoundationDropdownMenu__label";
            classButton = "'UserWallet__buysp button hollow delegate";

            usernamePageDelegation = window.SteemPlus.Utils.getPageAccountName();
            getDelegationInformation(isSteemit, isBusy, globalP);
            createButtonDelegation(isSteemit, isBusy, globalP);
            getMyTotalOutgoingDelegation(globalP);

        } else if (isBusy) {
            load_check = /wallet/;
            load_check2 = /transfers/;
            wallet_elt_d = ".UserWalletSummary__item ";
            classButton = "Action ant-btn-lg Action--primary delegate";

            if (window.location.href.match(load_check)) {
                usernamePageDelegation = myAccountDelegation.name;
                getDelegationInformation(isSteemit, isBusy, globalP);
                createButtonDelegation(isSteemit, isBusy, globalP);
                getMyTotalOutgoingDelegation(globalP);
            } else if (window.location.href.match(load_check2)) // Not my wallet
            {
                usernamePageDelegation = window.location.href.match(/https:\/\/busy.org\/@(.*)\/.*/)[1];
                getDelegationInformation(isSteemit, isBusy, globalP);
                createButtonDelegation(isSteemit, isBusy, globalP);
                getMyTotalOutgoingDelegation(globalP);
            }
        }
    }
}

function getMyTotalOutgoingDelegation(globalP) {
    var tmp = 0;
    steem.api.getVestingDelegations(myAccountDelegation.name, null, 10, function(err, myOutgoingDelegations) {
        for (myOutgoingDelegation of myOutgoingDelegations) {
            var valueDelegation = Math.round(parseFloat(steem.formatter.vestToSteem(myOutgoingDelegation.vesting_shares, globalP.totalVests, globalP.totalSteem)) * 100) / 100;
            if (valueDelegation > 0)
                tmp += valueDelegation;
        }
        myTotalOutgoingDelegation = tmp;
    });
}


// createButtonDelegation creates delegation button and delegation modal.
// @parameter isSteemit : boolean, true if used website is steemit
// @parameter isBusy : boolean, true if used website is busy
// @parameter globalP : contains total steem and total vests
function createButtonDelegation(isSteemit, busy, globalP) {
    if (totalOutgoingDelegation === -1 && myTotalOutgoingDelegation === -1 && (regexWalletBusy.test(window.location.href) || regexWalletSteemit.test(window.location.href)) && retryCountDelegate < 20) {
        setTimeout(function() {
            createButtonDelegation(isSteemit, busy, globalP)
        }, 500);
    } else {
        if ($('.delegate').length === 0) {

            //if ($('.transfer_to').length !== 0) $('.transfer_to').remove();
            var delegate_div = document.createElement('div');
            delegate_div.style.width = '100%';
            delegate_div.style.textAlign = 'right';
            var delegate_button = document.createElement('button');
            delegate_button.innerHTML = 'Delegate';
            delegate_button.className = classButton;
            delegate_button.id = 'delegateButton';
            delegate_button.style.marginTop = '15px';
            delegate_button.style.display = 'block';
            delegate_button.style.float = 'right';

            if (busy) delegate_button.style.marginTop = '10px';
            delegate_div.appendChild(delegate_button);

            if (isSteemit) {
                if (usernamePageDelegation === myAccountDelegation.name) {
                    $('.UserWallet__balance ')[1].childNodes[1].append(delegate_div);
                } else {
                    if ($('.vests-added').length > 0)
                        $('.UserWallet__balance ')[1].childNodes[1].append(delegate_div);
                    else
                        setTimeout(function() {
                            createButtonDelegation(isSteemit, busy, globalP);
                        }, 250);
                }
                $('.delegate').parent().css('float', 'right');
                $('.delegate').parent().parent().addClass('delegationDiv');
            } else if (busy) {
                $('.CryptoTrendingCharts').parent().prepend(delegate_div);
                $('.delegate').css('margin-bottom', '10px');
                $('.delegate').css('width', '100%');
            }

            // Function used to get the maximum SP user can delegate
            function getMaxSP() {
                var myVests = parseFloat(steem.formatter.vestToSteem(myAccountDelegation.vesting_shares.replace(' VESTS', ''), globalP.totalVests, globalP.totalSteem) * 100) / 100;
                var maxSP = myVests - myTotalOutgoingDelegation - 5.000;
                return (maxSP > 0 ? maxSP.toFixed(3) : 0);
            }



            $('.delegate').click(function() {
                var div = document.createElement('div');
                div.id = 'overlay_delegate';
                var inner = "";
                if (isSteemit) {
                    inner = '<div data-reactroot="" role="dialog" style="bottom: 0px; left: 0px; overflow-y: scroll; position: fixed; right: 0px; top: 0px;"><div class="reveal-overlay fade in" style="display: block;"></div><div class="reveal fade in" role="document" tabindex="-1" style="display: block;"><button class="close-button" type="button"><span aria-hidden="true" class="">×</span></button><div><div class="row"><h3 class="column">Delegate</h3>' +
                        '</div><form ><div><div class="row"><div class="column small-12">Delegate SP to another Steemit account.</div></div><br></div><div class="row"><div class="column small-2" style="padding-top: 5px;">From</div><div class="column small-10"><div class="input-group" style="margin-bottom: 1.25rem;"><span class="input-group-label">@</span>' +
                        '<input type="text" class="input-group-field bold"  placeholder="Your account"value=' + myAccountDelegation.name + ' style="background-image: url(&quot;data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP6zwAAAgcBApocMXEAAAAASUVORK5CYII=&quot;);" disabled></div></div></div><div class="row"><div class="column small-2" style="padding-top: 5px;">' +
                        'To</div><div class="column small-10"><div class="input-group" style="margin-bottom: 1.25rem;"><span class="input-group-label">@</span><input type="text" class="input-group-field" placeholder="Send to account" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" name="to" value="' + (myAccountDelegation.name === usernamePageDelegation ? '' : usernamePageDelegation) + '" ' + (myAccountDelegation.name === usernamePageDelegation ? '' : 'disabled') + '></div><p></p></div></div><div class="row"><div class="column small-2" style="padding-top: 5px;">' +
                        'Amount</div><div class="column small-10"><div class="input-group" style="margin-bottom: 5px;"><input type="text" placeholder="Amount" name="amount" value="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"><span class="input-group-label" style="padding-left: 0px; padding-right: 0px;">' +
                        '<span  style="min-width: 5rem; height: inherit; background-color: transparent; border: none;">SP</span></span></div><div style="margin-bottom: 0.6rem;"><a id="max_sp" style="border-bottom: 1px dotted rgb(160, 159, 159); cursor: pointer;">' +
                        'Max*: ' + (getMaxSP() > 0 ? getMaxSP() : 0) + ' SP</a><p>* Maximum delegation available if no SP is currently delegated.</p></div></div></div><div class="row"><div class="column"><span><input type="button"   disabled="" class="UserWallet__buysp2 delegate" id="bd" value="Submit"/></span></div></div></form></div></div></div>';
                    div.innerHTML = inner;
                } else if (busy) {
                    inner = '<div><div><div class="ant-modal-mask"></div><div tabindex="-1" class="ant-modal-wrap " role="dialog" aria-labelledby="rcDialogTitle0"><div role="document" class="ant-modal" style="width: 520px; transform-origin: 620.8px 9px 0px;"><div class="ant-modal-content"><button aria-label="Close" class="ant-modal-close"><span class="ant-modal-close-x close-button"></span></button>' +
                        '<div class="ant-modal-header"><div class="ant-modal-title" id="rcDialogTitle0">Delegate SP to another account</div></div><div class="ant-modal-body"><form class="ant-form ant-form-horizontal ant-form-hide-required-mark Transfer container"><div class="ant-row ant-form-item"><div class="ant-form-item-label"><label for="from" class="ant-form-item-required" title=""><span>From</span></label></div><div class="ant-form-item-control-wrapper"><div class="ant-form-item-control "><input type="text" placeholder="Your account" value="' + myAccountDelegation.name + '" id="from" data-__meta="[object Object]" class="ant-input ant-input-lg" disabled></div></div>' +
                        '<div class="ant-form-item-label"><label for="to" class="ant-form-item-required" title=""><span>To</span></label></div><div class="ant-form-item-control-wrapper"><div class="ant-form-item-control "><input type="text" placeholder="Send to account" value="' + (myAccountDelegation.name === usernamePageDelegation ? '' : usernamePageDelegation) + '" id="to" data-__meta="[object Object]" class="ant-input ant-input-lg" ' + (myAccountDelegation.name === usernamePageDelegation ? '' : 'disabled') + '></div></div></div>' +
                        '<div class="ant-row ant-form-item"><div class="ant-form-item-label"><label for="amount" class="ant-form-item-required" title=""><span>Amount</span></label></div><div class="ant-form-item-control-wrapper"><div class="ant-form-item-control "><span class="ant-input-group-wrapper" style="width: 100%;"><span class="ant-input-wrapper ant-input-group"><input type="text" placeholder="How much do you want to send" value="" id="amount" data-__meta="[object Object]" name="amount" class="ant-input ant-input-lg"><span class="ant-input-group-addon"><div class="ant-radio-group"><label class="ant-radio-button-wrapper"><span class="ant-radio-button"><input type="radio" class="ant-radio-button-input" value="on"><span class="ant-radio-button-inner"></span></span><span>SP</span></label></div></span></span></span>' +
                        '<span id="max_sp">Max*: <span role="presentation" class="balance">' + getMaxSP() + '</span>.<br/>* Maximum delegation available if no SP is currently delegated.' +
                        '</span></div></div></div><div class="ant-row ant-form-item"><div class="column"><span><input type="button"   disabled="" class="UserWallet__buysp2 busy_btn delegate" id="bd" value="Submit"/></span></div></div></form>';
                    div.innerHTML = inner;

                }
                $('body').append(div);
                $('.close-button').click(function() {
                    $('#overlay_delegate').remove();
                });
                $('#max_sp').click(function() {
                    $('input[name=amount]').val(getMaxSP() + '');
                });
                $('form input').blur(function() {
                    if (parseFloat($('input[name=amount]').val()) >= 0 && parseFloat($('input[name=amount]').val()) <= getMaxSP() && $('input[placeholder="Your account"]').val() !== '' && $('input[placeholder="Send to account"]').val() !== '') {
                        $('#bd').prop("disabled", false);
                    } else {
                        $('#bd').prop("disabled", true);
                    }
                });
                $('#bd').click(function() {
                    const delegated_SP = $('input[name=amount]').val();
                    var delegated_vest = delegated_SP * globalP.totalVests / globalP.totalSteem;
                    delegated_vest = delegated_vest.toFixed(6);
                    var url = 'https://v2.steemconnect.com/sign/delegateVestingShares?delegator=' + $('input[placeholder="Your account"]').val() + '&delegatee=' + $('input[placeholder="Send to account"]').val() + '&vesting_shares=' + delegated_vest + '%20VESTS';
                    window.open(url, '_blank');
                });

                $('body').append(div);
            });
        }
    }
}

// getDelegationInformation get all the delegation information : incoming and outgoing
// @parameter isSteemit : boolean, true if used website is steemit
// @parameter isBusy : boolean, true if used website is busy
// @parameter globalP : contains total steem and total vests
// @parameter account : account of user 
function getDelegationInformation(isSteemit, isBusy, globalP, account) {
    // get outgoing delegation from the blockchain using steemjs
    steem.api.getVestingDelegations(usernamePageDelegation, null, 10, function(err, outgoingDelegations) {

        // get incoming delegation from steemSQL
        $.ajax({
            type: "GET",
            beforeSend: function(xhttp) {
                xhttp.setRequestHeader("Content-type", "application/json");
                xhttp.setRequestHeader("X-Parse-Application-Id", "efonwuhf7i2h4f72h3o8fho23fh7");
            },
            url: 'https://steemplus-api.herokuapp.com/api/get-incoming-delegations/' + usernamePageDelegation,
            success: function(incomingDelegations) {
                createPopoverDelegation(isSteemit, isBusy, incomingDelegations, outgoingDelegations, globalP);
            },
            error: function(msg) {
                console.log(msg);
            }
        });
    });

}




// createPopoverDelegation creates popover displaying delegations
// @parameter isSteemit : boolean, true if used website is steemit
// @parameter isBusy : boolean, true if used website is busy
// @parameter incomingDelegations : list of all incoming delegations
// @parameter outgoingDelegations : list of all outgoing delegations
// @parameter globalP : contains total steem and total vests
// @parameter account : account of user 
function createPopoverDelegation(isSteemit, isBusy, incomingDelegations, outgoingDelegations, globalP, account) {
    var divDelegation = $('<div class="delegation column"></div>');
    if (incomingDelegations.length > 0) {
        $(divDelegation).append('<h5 class="incoming-delegation">Incoming - </h5><div id="list_delegators"></div>');
        totalIncomingDelegation = 0;
        incomingDelegations.forEach(function(item) {
            var valueDelegation = Math.round(parseFloat(steem.formatter.vestToSteem(item.vesting_shares, globalP.totalVests, globalP.totalSteem)) * 100) / 100;
            if (valueDelegation > 0) {
                $(divDelegation).find('#list_delegators').append('<span style="float:left; margin-bottom:3px;" title="' + new Date(item.delegation_date) + '">' + valueDelegation + ' SP delegated by @' + item.delegator + '</span><br>');
                totalIncomingDelegation += valueDelegation;
            }
        });
        $(divDelegation).find('#list_delegators').append('<br>');
        $(divDelegation).find('.incoming-delegation').append(totalIncomingDelegation.toFixed(3) + ' SP');
    } else {
        totalIncomingDelegation = 0;
    }
    if (outgoingDelegations.length > 0) {
        var inner = '';
        totalOutgoingDelegation = 0;
        $(divDelegation).append('<h5 class="outgoing-delegation">Outgoing - </h5><div id="list_delegee"></div>');
        for (outgoingDelegation of outgoingDelegations) {
            var valueDelegation = Math.round(parseFloat(steem.formatter.vestToSteem(outgoingDelegation.vesting_shares, globalP.totalVests, globalP.totalSteem)) * 100) / 100;
            if (valueDelegation > 0) {
                if (myAccountDelegation.name === usernamePageDelegation)
                    $(divDelegation).find('#list_delegee').append('<span style="float:left; margin-bottom:3px;" class="' + (isBusy ? 'span-busy' : 'span-steemit') + '">' + valueDelegation + ' SP delegated to @' + outgoingDelegation.delegatee + '<a target="_blank" href="https://v2.steemconnect.com/sign/delegateVestingShares?delegator=' + myAccountDelegation.name + '&delegatee=' + outgoingDelegation.delegatee + '&vesting_shares=' + 0 + '%20VESTS"><button class="stop_del ' + (isBusy ? 'stop_del_busy' : '') + '" type="button"><span aria-hidden="true" style="color:red ; margin-right:2em;" class="">×</span></button></a></span>');
                else
                    $(divDelegation).find('#list_delegee').append('<span style="float:left; margin-bottom:3px;" class="' + (isBusy ? 'span-busy' : 'span-steemit') + '">' + valueDelegation + ' SP delegated to @' + outgoingDelegation.delegatee + '</span>');
                totalOutgoingDelegation += valueDelegation;
            }
        }
        $(divDelegation).find('.outgoing-delegation').append(totalOutgoingDelegation.toFixed(3) + ' SP');
    } else {
        totalOutgoingDelegation = 0;
    }

    // If total incoming delegation > 0 or total outgoing delegation > 0 so display popover
    // Else don't display popover
    if (totalIncomingDelegation > 0 || totalOutgoingDelegation > 0) {
        if (isSteemit) {
            if ($('.delegate').length > 0) {
                if (myAccountDelegation.name === usernamePageDelegation) {
                    $('.delegate').parent().parent().find('div > span').eq(0).attr('id', 'popoverDelegation');
                } else {
                    $('.delegate').parent().parent().find('div').eq(1).attr('id', 'popoverDelegation');
                }
                $('#popoverDelegation').css('float', 'right');
            } else {
                setTimeout(function() {
                    createPopoverDelegation(isSteemit, isBusy, incomingDelegations, outgoingDelegations, globalP, account);
                }, 250);
            }
        } else if (isBusy) {
            $('.UserWalletSummary__value > span').eq(1).find('span').eq(1).attr('id', 'popoverDelegation');
        }

        $('#popoverDelegation').attr('data-toggle', 'popover');
        $('#popoverDelegation').attr('data-content', divDelegation[0].outerHTML);
        $('#popoverDelegation').attr('data-placement', 'bottom');
        $('#popoverDelegation').attr('title', '<span class="delegation-pop-title">Delegations</span>');
        $('#popoverDelegation').attr('data-html', 'true');
        $('[data-toggle="popover"]').popover();

        $('#popoverDelegation').click(function() {
            setTimeout(function() {
                $('#popoverDelegation').popover('show');
            }, 200);

        });

        $('body').on('click', function(e) {
            if ($(e.target).data('toggle') === undefined && $(e.target).parents('.popover.in').length === 0)
                $('#popoverDelegation').popover('hide');
        });
    }

}