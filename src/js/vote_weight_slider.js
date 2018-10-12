var token_vote_weight_slider = null;
var aut = null;
var rewardBalance = null;
var recentClaims = null;
var steemPrice = null;
var votePowerReserveRate = null;
var account_vws = null;

var voteWeightSliderStarted = false;

var retryCountVoteWeightSlider = 0;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.to == 'vote_weight_slider') {
        aut = request.data.user;
        if (request.order === 'start' && token_vote_weight_slider == null) {
            token_vote_weight_slider = request.token;

            rewardBalance = request.data.rewardBalance;
            recentClaims = request.data.recentClaims;
            steemPrice = request.data.steemPrice;
            votePowerReserveRate = request.data.votePowerReserveRate;
            account_vws = request.data.account;
            retryCountVoteWeightSlider = 0;
            startVoteWeightSlider();
            voteWeightSliderStarted = true;

        } else if (request.order === "click" && token_vote_weight_slider == request.token) {
            retryCountVoteWeightSlider = 0;
            rewardBalance = request.data.rewardBalance;
            recentClaims = request.data.recentClaims;
            steemPrice = request.data.steemPrice;
            votePowerReserveRate = request.data.votePowerReserveRate;
            account_vws = request.data.account;

            if (voteWeightSliderStarted)
                startVoteWeightSlider();
        } else if (request.order === "notif" && token_vote_weight_slider == request.token) {
            retryCountVoteWeightSlider = 0;
            rewardBalance = request.data.rewardBalance;
            recentClaims = request.data.recentClaims;
            steemPrice = request.data.steemPrice;
            votePowerReserveRate = request.data.votePowerReserveRate;
            account_vws = request.data.account;

            if (voteWeightSliderStarted)
                startVoteWeightSlider();
        }
    }
});

function startVoteWeightSlider() {
    if (regexVoteWeightSliderBlogSteemit.test(window.location.href) ||
        regexFeedPlusSteemit.test(window.location.href) ||
        regexFeedSteemit.test(window.location.href) ||
        regexPostSteemit.test(window.location.href)) {
        $('.Voting__button').click(function() {
            var weightDisplay = $(this).find('.weight-display');
            setTimeout(function() {
                tryUpdateVotingSlider(weightDisplay);
            }, 500);
        });

        $("body").on('DOMSubtreeModified', ".weight-display", function(e) {
            tryUpdateVotingSlider($(e.target));
        });
    }
}

async function updateVotingSlider(weightDisplay) {
    weightDisplay.css('margin-top', '-10px');
    var weightDollars = weightDisplay.parent().find('.voting_weight_dollars');
    if (weightDollars.length === 0) {
        var weightDollars = $('<div class="voting_weight_dollars"></div>');
        weightDollars.html(window.SteemPlus.Utils.getLoadingHtml({
            text: true,
            backgroundColor: '#8a8a8a'
        }));
        weightDisplay.after(weightDollars);
    }
    var dollars = await window.SteemPlus.Utils.getVotingDollarsPerAccount(parseInt(weightDisplay.eq(0).text().replace(/ /, ''), 10), account_vws, rewardBalance, recentClaims, steemPrice, votePowerReserveRate, false);

    if ((typeof dollars === 'undefined' || dollars === undefined) && retryCountVoteWeightSlider < 20) {
        retryCountVoteWeightSlider++;
        setTimeout(function() {
            tryUpdateVotingSlider();
        }, 1000);
    } else {
        weightDollars.text(dollars.toFixed(2) + '$');
    }

    var votingEl = weightDisplay.closest('.Voting');
    var flagInfo = votingEl.find('.Voting__about-flag');
    if (flagInfo.length) {

        var pendingPayout;
        var isComment = false;
        var reactEl = votingEl.closest('.PostSummary, .Comment, .PostFull');
        if (reactEl.is('.Comment')) {
            isComment = true;
            reactEl = reactEl.find('.FormattedAsset');
            pendingPayout = parseFloat(reactEl.text().replace('$', ''));
        } else if (reactEl.is('.PostFull')) {
            reactEl = reactEl.find('.FormattedAsset');
            if (!reactEl.length) {
                reactEl = $('.smi-post-footer-wrapper-2 .FormattedAsset');
            }
            pendingPayout = parseFloat(reactEl.text().replace('$', ''));
        } else {
            var reactObj = window.SteemPlus.Utils.findReact(reactEl[0]);
            pendingPayout = parseFloat(reactObj.props.pending_payout.replace(' SBD', ''));
        }

        voteTotal = flagInfo.find('.smi-vote-total');
        if (!voteTotal.length) {
            voteTotal = $('<p class="smi-vote-total"></p>');
            flagInfo.prepend(voteTotal);
            var html = 'After your downvote the total reward for <br> this ' + (isComment ? 'comment' : 'post') + ' will be: <span class="after-downvote-total-dollar">' + window.SteemPlus.Utils.getLoadingHtml({
                text: true,
                backgroundColor: '#8a8a8a'
            }) + '</span>';
            voteTotal.html(html);
        }
        var voteTotalDollars = voteTotal.find('.after-downvote-total-dollar');

        if (typeof dollars !== 'undefined') {
            var v = pendingPayout + dollars;
            voteTotalDollars.text(v.toFixed(2) + '$');
        }


    }

};

function tryUpdateVotingSlider(weightDisplay) {
    //var weightDisplay = $('span.Voting__button .weight-display');
    if (weightDisplay.length) {
        updateVotingSlider(weightDisplay);
    }
}
