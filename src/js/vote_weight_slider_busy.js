var token_vote_weight_slider_busy = null;
var aut = null;
var rewardBalance = null;
var recentClaims = null;
var steemPrice = null;
var votePowerReserveRate = null;
var account_vwsb = null;
var isFloatingFooterEnabled = null

var isPostPage = false;
var dollars = 0;

var retryCountVoteWeightSliderBusy = 0;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.to == 'vote_weight_slider_busy') {
        aut = request.data.user;
        if (request.order === 'start' && token_vote_weight_slider_busy == null) {
            token_vote_weight_slider_busy = request.token;
            rewardBalance = request.data.rewardBalance;
            recentClaims = request.data.recentClaims;
            steemPrice = request.data.steemPrice;
            votePowerReserveRate = request.data.votePowerReserveRate;
            account_vwsb = request.data.account;
            isFloatingFooterEnabled = request.data.isPostFloatingBottomBarEnabled;
            retryCountVoteWeightSliderBusy = 0;
            isPostPage = false;

            canstartVoteWeightSliderBusy();

        } else if (request.order === "click" && token_vote_weight_slider_busy == request.token) {
            retryCountVoteWeightSliderBusy = 0;
            rewardBalance = request.data.rewardBalance;
            recentClaims = request.data.recentClaims;
            steemPrice = request.data.steemPrice;
            votePowerReserveRate = request.data.votePowerReserveRate;
            account_vwsb = request.data.account;
            isFloatingFooterEnabled = request.data.isPostFloatingBottomBarEnabled;
            isPostPage = false;

            canstartVoteWeightSliderBusy();
        } else if (request.order === "notif" && token_vote_weight_slider_busy == request.token) {
            retryCountVoteWeightSliderBusy = 0;
            rewardBalance = request.data.rewardBalance;
            recentClaims = request.data.recentClaims;
            steemPrice = request.data.steemPrice;
            votePowerReserveRate = request.data.votePowerReserveRate;
            account_vwsb = request.data.account;
        }
    }
});

function canstartVoteWeightSliderBusy() {
    if (retryCountVoteWeightSliderBusy > 20) return;
    if (regexPostBusy.test(window.location.href)) {
        if (isFloatingFooterEnabled) {
            if ($('.smi-post-floating-footer').length > 0 && $('.Buttons__link:has(.icon-praise_fill)').length > 0) {
                isPostPage = true;
                startVoteWeightSliderBusy();
            } else
                setTimeout(function() {
                    retryCountVoteWeightSliderBusy++;
                    canstartVoteWeightSliderBusy();
                }, 1000);
        } else {
            if ($('.Buttons__link:has(.icon-praise_fill)').length > 0) {
                startVoteWeightSliderBusy();
            } else {
                setTimeout(function() {
                    retryCountVoteWeightSliderBusy++;
                    canstartVoteWeightSliderBusy();
                }, 1000);
            }
        }
    } else if (regexFeedBusy.test(window.location.href) || regexBusy.test(window.location.href) || regexBlogBusy.test(window.location.href)) {
        if ($('.Buttons__link:has(.icon-praise_fill)').length > 0) {
            startVoteWeightSliderBusy();
        } else {
            setTimeout(function() {
                retryCountVoteWeightSliderBusy++;
                canstartVoteWeightSliderBusy();
            }, 1000);
        }
    }
}

function startVoteWeightSliderBusy() {
    $('.Buttons__link:has(.icon-praise_fill)').each(function() {
        if (!$(this).hasClass('btnLikeUnlike')) {
            if (!$(this).hasClass('active')) {
                setupLikeButton($(this));
            } else {
                setupUnlikeButton($(this));
            }
        }
    });
}

function setupLikeButton(btnBusy) {
    if ($(btnBusy).parent().find('.btnLikeSP').length > 0)
        $(btnBusy).parent().find('.btnLikeSP').show();
    else {
        var buttonLikeBusySP = $('<a role="presentation" class="Buttons__link btnLikeSP btnLikeUnlike"><i class="iconfont icon-praise_fill"></i></a>');
        $(btnBusy).before(buttonLikeBusySP);
        buttonLikeBusySP.unbind('click').click(function() {
            createPopupVoteSlider($(this));
        });
    }
    if (!$(btnBusy).hasClass('btnLikeUnlike'))
        $(btnBusy).remove();
}

function setupUnlikeButton(btnBusy) {
    if ($(btnBusy).parent().find('.btnUnlikeSP').length > 0)
        $(btnBusy).parent().find('.btnUnlikeSP').show();
    else {
        var buttonUnlikeBusySP = $('<a role="presentation" class="active Buttons__link btnUnlikeSP btnLikeUnlike"><i class="iconfont icon-praise_fill"></i></a>');
        $(btnBusy).before(buttonUnlikeBusySP);
        buttonUnlikeBusySP.unbind('click').click(function() {
            unlikePost($(this));
        });
    }
    if (!$(btnBusy).hasClass('btnLikeUnlike'))
        $(btnBusy).remove();
}

async function createPopupVoteSlider(element) {
    var currentWeight = 100;
    dollars = 0;
    var popoverPosition = (isPostPage && isFloatingFooterEnabled ? 'top' : 'bottom');
    $(element).attr('data-toggle', 'popover');
    $(element).attr('data-content', '<div class="popup-slider-container"><div><span class="percentage-vote-slider-busy">100</span>% : <span class="value-vote-slider-busy">10</span>$</div><input id="vote-weight-slider-busy" data-slider-id="ex1Slider" type="text" data-slider-min="0" data-slider-max="100" data-slider-step="1" data-slider-value="100"/><button id="upvote-busy" class="btn upvote-slider-btn-busy">Upvote</button></div>');
    $(element).attr('data-placement', popoverPosition);
    $(element).attr('data-html', 'true');
    $(element).attr('data-trigger', 'click');
    $(element).popover('show');
    dollars = await window.SteemPlus.Utils.getVotingDollarsPerAccount(100, account_vwsb, rewardBalance, recentClaims, steemPrice, votePowerReserveRate, false);
    $(element).parent().find('.value-vote-slider-busy').html(dollars.toFixed(3));

    $(element).parent().find('#vote-weight-slider-busy').slider({
        tooltip: 'hide'
    });
    $(element).parent().find('#vote-weight-slider-busy').on('change', async function(slideEvt) {
        currentWeight = slideEvt.value.newValue;
        dollars = await window.SteemPlus.Utils.getVotingDollarsPerAccount(currentWeight, account_vwsb, rewardBalance, recentClaims, steemPrice, votePowerReserveRate, false);
        $(element).parent().find('.percentage-vote-slider-busy').html(currentWeight);
        $(element).parent().find('.value-vote-slider-busy').html(dollars.toFixed(3));
    });

    $(element).parent().find('.upvote-slider-btn-busy').on('click', function() {
        if (isPostPage) {
            var tmp = window.location.href.split('@')[1];
        } else {
            var tmp = $(element).parent().parent().parent().parent().parent().find('.Story__content__title').attr('href').split('@')[1];
        }
        var username = tmp.split('/')[0];
        var permlink = tmp.split('/')[1];
        api.vote(account_vwsb.name, username, permlink, currentWeight * 100, function(err, res) {
            if (err) console.log(err);
            if (res) console.log(res);
            if (res !== null) {
                $(element).hide();
                $('.popover').remove();
                setupUnlikeButton($(element));
                var oldCount = parseInt($(element).parent().find('.Buttons__reactions-count > span > span').html());
                $(element).parent().find('.Buttons__reactions-count > span > span').eq(0).html(oldCount + 1);
                var oldPayout = parseFloat($(element).parent().parent().find('.Payout > span > span > span').html());
                $(element).parent().parent().find('.Payout > span > span > span').html((oldPayout + dollars).toFixed(2));
            }
        });
    });
}

function unlikePost(btnBusy) {
    if (isPostPage) {
        var tmp = window.location.href.split('@')[1];
    } else {
        var tmp = $(btnBusy).parent().parent().parent().parent().parent().find('.Story__content__title').attr('href').split('@')[1];
    }
    var username = tmp.split('/')[0];
    var permlink = tmp.split('/')[1];
    api.vote(account_vwsb.name, username, permlink, 0, function(err, res) {
        if (err) console.log(err);
        if (res) console.log(res);
        if (res !== null) {
            $(btnBusy).hide();
            setupLikeButton($(btnBusy));
            var oldCount = parseInt($(btnBusy).parent().find('.Buttons__reactions-count > span > span').html());
            $(btnBusy).parent().find('.Buttons__reactions-count > span > span').eq(0).html(oldCount - 1);
            var oldPayout = parseFloat($(btnBusy).parent().parent().find('.Payout > span > span > span').html());
            $(btnBusy).parent().parent().find('.Payout > span > span > span').html((oldPayout - dollars).toFixed(2));
        }
    });
}
