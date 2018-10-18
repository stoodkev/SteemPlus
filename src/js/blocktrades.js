var token_block = null;
var blockStarted = false;
var wallet_elt_bl = null;
var usernamePageBl = null;
var load_checkBl = '';
var load_checkBl2 = '';
var classButtonB;
var myAccountBl = null;
var retryCountBl = 0;


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.to === 'delegation' && request.order === 'start' && token_block == null) {
        token_block = request.token;
        myAccountBl = request.data.account;
        retryCountBl = 0;
        startBlock(request.data.steemit, request.data.busy, request.data.global);
        blockStarted = true;
    } else if (request.to === 'delegation' && request.order === 'click' && token_block === request.token) {
        myAccountBl = request.data.account;
        retryCountBl = 0;
        startBlock(request.data.steemit, request.data.busy, request.data.global);
    } else if (request.to === 'delegation' && request.order === 'notif' && token_block == request.token) {
        retryCountBl = 0;
        if (!$('.delegate'))
            startBlock(request.data.steemit, request.data.busy, request.data.global);
    }
});

// startBlock checks if delegation can start or not
// @parameter isSteemit : boolean, true if used website is steemit
// @parameter isBusy : boolean, true if used website is busy
// @parameter globalP : contains total steem and total vests
function startBlock(isSteemit, isBusy, globalP) {
    if (regexWalletBusy.test(window.location.href) || regexWalletSteemit.test(window.location.href) && window.location.href.includes(usernamePageBl)); {
        if (isSteemit) {
            wallet_elt_bl = ".FoundationDropdownMenu__label";
            classButtonB = "'UserWallet__buysp button hollow blocktrades";

            usernamePageBl = window.SteemPlus.Utils.getPageAccountName();
            createButtonBlocktrades(isSteemit, isBusy, globalP);
        } else if (isBusy) {
            load_checkBl = /wallet/;
            load_checkBl2 = /transfers/;
            wallet_elt_bl = ".UserWalletSummary__item ";
            classButtonB = "Action ant-btn-lg Action--primary blocktrades";

            if (window.location.href.match(load_checkBl)) {
                usernamePageBl = myAccountBl.name;
                createButtonBlocktrades(isSteemit, isBusy, globalP);
            } else if (window.location.href.match(load_checkBl2)) // Not my wallet
            {
                usernamePageBl = window.location.href.match(/https:\/\/busy.org\/@(.*)\/.*/)[1];
                createButtonBlocktrades(isSteemit, isBusy, globalP);
            }
        }
    }
}



// createButtonBlocktrades creates blocktrades button and modal.
// @parameter isSteemit : boolean, true if used website is steemit
// @parameter isBusy : boolean, true if used website is busy
// @parameter globalP : contains total steem and total vests
function createButtonBlocktrades(isSteemit, busy, globalP) {
    if ($('.blocktrades').length === 0) {

        //if ($('.transfer_to').length !== 0) $('.transfer_to').remove();
        var bl_div = document.createElement('div');
        bl_div.style.width = '100%';
        bl_div.style.textAlign = 'right';
        var bl_button = document.createElement('button');
        bl_button.innerHTML = 'Buy / Sell on Blocktrades';
        bl_button.className = classButtonB;
        bl_button.id = 'blocktradesButton';
        bl_button.style.marginTop = '15px';
        bl_button.style.display = 'block';
        bl_button.style.float = 'right';

        if (busy) bl_button.style.marginTop = '10px';
        bl_div.appendChild(bl_button);

        if (isSteemit && usernamePageBl === myAccountBl.name) {
            $('.UserWallet__buysp').clone().appendTo($('.UserWallet__buysp ').eq(0).parent());
            $('.UserWallet__buysp ').eq(1).addClass("blocktrades");
            $('.UserWallet__buysp ').eq(0).hide();

        } else if (busy) {
            $('.CryptoTrendingCharts').parent().prepend(bl_div);
            $('.blocktrades').css('margin-bottom', '10px');
            $('.blocktrades').css('width', '100%');
        }
        $('.blocktrades').unbind("click");
        $('.blocktrades').click(function() {
            var div = document.createElement('div');
            div.id = 'overlay_delegate';
            var inner = "";
            if (isSteemit) {
                inner = '<div data-reactroot="" height="600px" role="dialog" style="bottom: 0px; left: 0px; overflow-y: hidden; position: fixed; right: 0px; top: 0px;"><div class="reveal-overlay fade in" style="display: block;"></div><div class="reveal fade in" role="document" tabindex="-1" style="display: block;"><button class="close-button" type="button"><span aria-hidden="true" class="">×</span></button><div>' +
                    '<iframe class="blIframe" height="600px" width="100%" style="border: none; overflow-y: hidden;"></iframe></div><div><h1>Post</h1></div></div></div>';
                div.innerHTML = inner;
            } else if (busy) {
                inner = '<div><div><div class="ant-modal-mask"></div><div tabindex="-1" class="ant-modal-wrap " role="dialog" aria-labelledby="rcDialogTitle0"><div role="document" class="ant-modal" style="width: 520px; transform-origin: 620.8px 9px 0px;"><div class="ant-modal-content"><button aria-label="Close" class="ant-modal-close"><span class="ant-modal-close-x close-button"></span></button>' +
                    '<div class="ant-modal-header"><div class="ant-modal-title" id="rcDialogTitle0">Delegate SP to another account</div></div><div class="ant-modal-body"><form class="ant-form ant-form-horizontal ant-form-hide-required-mark Transfer container"><div class="ant-row ant-form-item"><div class="ant-form-item-label"><label for="from" class="ant-form-item-required" title=""><span>From</span></label></div><div class="ant-form-item-control-wrapper"><div class="ant-form-item-control "><input type="text" placeholder="Your account" value="' + myAccountBl.name + '" id="from" data-__meta="[object Object]" class="ant-input ant-input-lg" disabled></div></div>' +
                    '<div class="ant-form-item-label"><label for="to" class="ant-form-item-required" title=""><span>To</span></label></div><div class="ant-form-item-control-wrapper"><div class="ant-form-item-control "><input type="text" placeholder="Send to account" value="' + (myAccountBl.name === usernamePageBl ? '' : usernamePageBl) + '" id="to" data-__meta="[object Object]" class="ant-input ant-input-lg" ' + (myAccountBl.name === usernamePageBl ? '' : 'disabled') + '></div></div></div>' +
                    '<div class="ant-row ant-form-item"><div class="ant-form-item-label"><label for="amount" class="ant-form-item-required" title=""><span>Amount</span></label></div><div class="ant-form-item-control-wrapper"><div class="ant-form-item-control "><span class="ant-input-group-wrapper" style="width: 100%;"><span class="ant-input-wrapper ant-input-group"><input type="text" placeholder="How much do you want to send" value="" id="amount" data-__meta="[object Object]" name="amount" class="ant-input ant-input-lg"><span class="ant-input-group-addon"><div class="ant-radio-group"><label class="ant-radio-button-wrapper"><span class="ant-radio-button"><input type="radio" class="ant-radio-button-input" value="on"><span class="ant-radio-button-inner"></span></span><span>SP</span></label></div></span></span></span>' +
                    '<span id="max_sp">Max*: <span role="presentation" class="balance">' + getMaxSP() + '</span>.<br/>* Maximum delegation available if no SP is currently delegated.' +
                    '</span></div></div></div><div class="ant-row ant-form-item"><div class="column"><span><input type="button"   disabled="" class="UserWallet__buysp2 busy_btn delegate" id="bd" value="Submit"/></span></div></div></form>';
                div.innerHTML = inner;

            }
            $('body').append(div);
            $('.blIframe').attr("src", chrome.runtime.getURL("../src/frames/blocktradesFrame.html"));
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
                if (myAccountBl.name === usernamePageBl)
                    $(divDelegation).find('#list_delegee').append('<span style="float:left; margin-bottom:3px;" class="' + (isBusy ? 'span-busy' : 'span-steemit') + '">' + valueDelegation + ' SP delegated to @' + outgoingDelegation.delegatee + '<a target="_blank" href="https://v2.steemconnect.com/sign/delegateVestingShares?delegator=' + myAccountBl.name + '&delegatee=' + outgoingDelegation.delegatee + '&vesting_shares=' + 0 + '%20VESTS"><button class="stop_del ' + (isBusy ? 'stop_del_busy' : '') + '" type="button"><span aria-hidden="true" style="color:red ; margin-right:2em;" class="">×</span></button></a></span>');
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
                if (myAccountBl.name === usernamePageBl) {
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