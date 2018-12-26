var token_steemplus_point = null;

var userPageRegex = /^.*@([a-z][a-z0-9.\-]+[a-z0-9])$/;

var myUsernameSPP = null;
var myAccountSPP = null;
var usernameSPP = null;
var retrySteemplusPoint = 0;

var sbdPerSteem = null;
var totalVestsSPP = null;
var totalSteemSPP = null;

var isSteemit = null;
var isBusy = null;
var isDelegatingToSteemPlus = false;
var delegatingToSteemPlus = 0;

// List of all the different ways to earn SPP
var wayList = [
    {id: "0", title: "Boost a post with Minnowbooster using SteemPlus",description:"Use the \'Boost\' Button on the bottom of the article to buy votes on MinnowBooster.", description_post: "@steem-plus/steemplus-2-19-updated-boost-button-collaboration-announcement-earn-more-with-steemplus-points", "url": "src/img/howtoearnspp/minnowbooster.png" , formula: "The amount of SBD sent to MinnowBooster (example : You get 1 SPP for 1 SBD or 1 SBD worth of Steem)"},
    {id: "1", title: "Boost a post with PostPromoter using SteemPlus",description:"Use the \'Boost\' Button on the bottom of the article to buy votes on PostPromoter.", description_post: "@steem-plus/steemplus-2-19-updated-boost-button-collaboration-announcement-earn-more-with-steemplus-points", "url": "src/img/howtoearnspp/postpromoter.png", formula: "The amount of SBD sent to PostPromoter (example : You get 1 SPP for 1 SBD or 1 SBD worth of Steem)"},
    {id: "2", title: "Create a new post with Beneficiaries using SteemPlus",description:"Use the \'Add Beneficiaries\' button on the post creation page. (Login to SteemConnect required).", description_post: "@steem-plus/steemplus-1-7-share-your-rewards-with-your-friends-beneficiaries-ideal-for-the-steemfest", "url": "src/img/howtoearnspp/beneficiaries.png", formula: "The amount @steemplus-pay will receive as a benefactor * 100 (example : if @steemplus-pay receives 5 SBD worth of SP, you will receive 500 SPP)"},
    {id: "3", title: "Create a post with Donation for SteemPlus",description:"Use the \'Post and Support\' button on the post creation page. (Login to SteemConnect required).", description_post: "@steem-plus/steemplus-2-18-2-post-and-support", "url": "src/img/howtoearnspp/donation.png", formula: "The amount @steemplus-pay will receive as a benefactor * 100 (example : if @steemplus-pay receives 5 SBD worth of SP, you will receive 500 SPP)"},
    {id: "4", title: "Create a new DTube post using SteemPlus",description:"Post to DTube by putting dtube followed by a space in the tag bar, then following the instructions in the DTube popup (Login to SteemConnect required).", description_post: "@steem-plus/steemplus-221-earn-more-by-posting-to-dtube-via-steemplus", "url": "src/img/howtoearnspp/dtube.png", formula: "The amount @steemplus-pay will receive as a benefactor * 100 (example : if @steemplus-pay receives 5 SBD worth of SP, you will receive 500 SPP)"},
    {id: "5", title: "Create a new Utopian post using SteemPlus",description: "Post to Utopian by typing utopian-io followed by a space in the tag bar, then following the instructions in the Utopian popup (Login to SteemConnect required).", description_post: "@steem-plus/steemplus-220-utopian--steemplus-partnership--bigger-upvotes", "url": "src/img/howtoearnspp/utopian.png", formula: "The amount @steemplus-pay will receive as a benefactor * 100 (example : if @steemplus-pay receives 5 SBD worth of SP, you will receive 500 SPP)"},
    {id: "6", title: "Buy Steem Monsters packs using SteemPlus",description: "Earn SteemPlus Points (SPP) for each SteemMonsters pack you buy from SteemPlus. <br> If you don\'t have an account on SteemMonsters yet, follow <a href='https://steemmonsters.com/?ref=steemplus-pay' target='_blank'>this link</a> to do so, you will automatically get SPP for all your future purchases.", description_post: "@steem-plus/steemplus-31--buy-your-steem-monsters-packs-from-steemplus-and-earn-steemplus-points-spp", "url": "src/img/howtoearnspp/steemmonsters.png", formula: "You will get 10 times more SPP than the SPP you spend (spend 20 SBD buying cards, earn 200 SPP)"},
    {id: "7", title: "Buy SteemPlus Points / Support via Fundition",description: "Send STEEM or SBD to @steemplus-pay or via our Fundition project.", description_post: "@steem-plus/steemplus-32--buy-spp", "url": "src/img/howtoearnspp/buySpp.png", formula: "Send 1 SBD get 100 SPP."},
    {id: "8", title: "Delegate Steem Power to @steem-plus",description: "Delegate Steem Power to @steem-plus and get weekly SPP payouts (first payout one week after the first delegation)", description_post: "@steem-plus/steemplus-33--delegate-to-steem-plus-to-earn-spp", "url": "src/img/howtoearnspp/delegation.png", formula: "Get 1 SPP per week per SBD worth of Steem Power (SPP per week = AmountSP * STEEMPrice/SBDPrice )"},
    {id: "9", title: "Reblog @steem-plus posts",description: "Reblog @steem-plus recent posts (less than 7 days old) to receive SPP.", description_post: "@steem-plus/steemplus-34--get-some-spp-for-sharing-steemplus-updates-with-your-followers", "url": "src/img/howtoearnspp/resteem.jpg", formula: "Get 5 SPP per new post resteemed."},
    {id: "10", title: "Buy from Steem Monster Market",description: "Go to steemmonsters.com, navigate to their market and perform a batch buy using SteemPlus.", description_post: "@steem-plus/steemplus-35--buy-cards-by-batch-on-steem-monsters-and-earn-spp", "url": "src/img/howtoearnspp/batch.png", formula: "Get 5 SPP for every 1 SBD spent."},
    {id: "11", title: "Use SteemHunt via SteemPlus",description: "From a product page, open SteemPlus popup and click on SteemHunt icon, it will prefill the name and url of the product and you will earn SPP!", description_post: "@steem-plus/", "url": "src/img/howtoearnspp/steemhunt.png", formula: "Get 2 SPP for every STEEM or SP at your post payout."}
]

// Listener on messages coming from main
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.to === 'steemplus_points' && request.order === 'start' && token_steemplus_point == null) {
        // On start
        token_steemplus_point = request.token;
        myUsernameSPP = request.data.account.name;
        myAccountSPP = request.data.account;
        isSteemit = request.data.steemit;
        isBusy = request.data.busy;
        sbdPerSteem = request.data.market.SBDperSteem;
        totalVestsSPP = request.data.global.totalVests;
        totalSteemSPP = request.data.global.totalSteem;
        retrySteemplusPoint = 0;
        canStartSteemplusPoint();
    } else if (request.to === 'steemplus_points' && request.order === 'click' && token_steemplus_point == request.token) {
        // On click
        myUsernameSPP = request.data.account.name;
        myAccountSPP = request.data.account;
        isSteemit = request.data.steemit;
        isBusy = request.data.busy;
        sbdPerSteem = request.data.market.SBDperSteem;
        totalVestsSPP = request.data.global.totalVests;
        totalSteemSPP = request.data.global.totalSteem;
        retrySteemplusPoint = 0;
        canStartSteemplusPoint();
    }
});


// Function used to check if Steemplus Points can start or not
function canStartSteemplusPoint()
{
    // Check retry limit
    if(retrySteemplusPoint >= 20) return;

    // Check if current page is wallet
    if(regexWalletSteemit.test(window.location.href))
    {
        if($('.Trans').length > 0){
            // If page ready start downloading data
            downloadDataSteemplusPoints(window.SteemPlus.Utils.getPageAccountName());
        }
        else {
            // If not restart
            setTimeout(function(){
                retrySteemplusPoint++;
                canStartSteemplusPoint();
            },100);
        }
    }
    else if(regexWalletBusy.test(window.location.href))
    {
        if($('.UserWalletSummary').length > 0)
        {
            if(window.location.href.includes('/wallet'))
                downloadDataSteemplusPoints(myUsernameSPP);
            else {
                usernameSPP = window.location.href.split('@')[1].split('/')[0];
                downloadDataSteemplusPoints(usernameSPP);
            }
        }
        else
            setTimeout(function(){
                retrySteemplusPoint++;
                canStartSteemplusPoint();
            });
    }
    else
        console.log('no url');
}

function downloadDataSteemplusPoints(usernameSPP)
{
  window.SteemPlus.api.getSPP(usernameSPP).then(function(response){
    console.log(response);
    displaySteemplusPoints(response[0]);
  });
}

// Function used to display the number of SPP a user owns
// @parameter userDetails: Details of the user's account concerning SPP
function displaySteemplusPoints(userDetails)
{
    // If user using Steemit
    if(isSteemit)
    {
        // Create new div
        let divSPP = $(`
            <div class="UserWallet__balance row zebra">
                <div class="column small-12 medium-8">
                    SteemPlus Points
                    <div class="FormattedHTMLMessage secondary">
                        SPP allow you to receive a share of @steem-plus vote and are redeemable for premium features.
                    </div>
                </div>
                <div class="column small-12 medium-4 nbPointsDiv">
                    <li class="DropdownMenu Wallet_dropdown dropdownSPPLink">
                        <a>
                            <span>${(userDetails !== undefined ? window.SteemPlus.Utils.numberWithCommas(userDetails.nbPoints.toFixed(2)) : 0)} SPP
                                <span class="Icon dropdown-arrow" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g><polygon points="128,90 256,218 384,90"></polygon></g></svg></span>
                            </span>
                        </a>
                        <ul class="VerticalMenu menu vertical VerticalMenu dropdownSPP">
                            <li class="howToEarn"><a>How to earn SPP ?</a></li>
                            <li class="sppHistory"><a>SteemPlus Points History</a></li>
                            <li class="buySPP"><a>Buy SteemPlus Points</a></li>
                            <li class="sppDelegation"><a>Delegate to @steem-plus</a></li>
                        </ul>
                    </li>
                </div>
            </div>
        `);
        // If user not on his wallet, delete buy SPP, how to earn and delegation items
        // User has to be on his wallet to use those
        if(myUsernameSPP !== window.SteemPlus.Utils.getPageAccountName()){
            divSPP.find('.buySPP').remove();
            divSPP.find('.howToEarn').remove();
            divSPP.find('.sppDelegation').remove();
        }

        // Add SPP to wallet
        $('.UserWallet__balance').eq($('UserWallet__balance ').length-1).before(divSPP);

        // On click listener to dropdown menu
        $('.dropdownSPPLink').click(function(){
            if($(this).hasClass('show'))
                $(this).removeClass('show');
            else
                $(this).addClass('show');
        });
        // If click on Delegation item
        $('.sppDelegation').click(async function(){
            // click is async function because we want to use await
            // Calculate the maximum amout user can delegate
            let maxAmountAvailableDelegationSPP = await getMaxSPForSPP();

            // Create Delegation modal
            let modal = $(`<div role="dialog" style="bottom: 0px; left: 0px; overflow-y: scroll; position: fixed; right: 0px; top: 0px;">
                <div class="reveal-overlay fade in" style="display: block;"></div>
                <div class="reveal fade in" role="document" tabindex="-1" style="display: block; min-height: 200px;">
                    <button class="close-button" type="button">
                        <span aria-hidden="true" class="">×</span>
                    </button>
                    <div id="modalTitle" class="row">
                        <h3 class="column">Delegate Steem Power to @steem-plus</h3>
                    </div>
                    <div class="row">
                        <label class="disclaimerDelegateSpp">Delegate Steem Power to @steem-plus and and get weekly SPP payouts.</label>
                    </div>
                    <div class="row">
                        <label class="alreadyDelegating disclaimerDelegateSpp">Currently delegated : ${delegatingToSteemPlus} SP <br>To delegate more, please enter the total number of SP to be delegated (ie : if you are delegating 100 SP and wish to delegate 100 SP more, enter 200 SP)</label>
                    </div>

                    <div class="row">
                        <div class="column small-2" style="padding-top: 5px;">To</div>
                        <div class="column small-10">
                            <div class="input-group" style="margin-bottom: 1.25rem;">
                                <span class="input-group-label label_buy_spp">@</span>
                                <input id="delegatedUser" type="text" name="delegatedUser" value="steem-plus" disabled>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="column small-2" style="padding-top: 5px;">From</div>
                        <div class="column small-10">
                            <div class="input-group" style="margin-bottom: 1.25rem;">
                                <span class="input-group-label label_buy_spp">@</span>
                                <input id="delegatingUser" type="text" name="delegatingUser" value="${myUsernameSPP}" disabled>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="column small-2" style="padding-top: 5px;">Amount</div>
                        <div class="column small-10">
                            <div class="input-group" style="margin-bottom: 5px;">
                                <input id="amountDelegationSPP" type="number" placeholder="Amount" name="amountDelegationSPP" value="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" autofocus="" min="0" max="${maxAmountAvailableDelegationSPP}" step="1">
                                <span class="input-group-label label_buy_spp" style="padding-left: 0px; padding-right: 0px;">
                                    <select name="asset" placeholder="Asset" style="min-width: 5rem; height: inherit; background-color: transparent; border: none;" disabled>
                                        <option value="SPP" selected="">SP</option>
                                    </select>
                                </span>
                            </div>
                            <div class="amountDelegationSpan" style="color: rgb(51, 51, 51);">
                                <small>Max Available: <a id="maxAvailableLink"><span class="maxAmountAvailableDelegationSPP"></span> SP</a></small>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="column small-10">
                            <div class="input-group" style="margin-bottom: 1.25rem;">
                                <button class="button-steemit" id="delegationSPPButton">Delegate</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`);

            if(!isDelegatingToSteemPlus) modal.find('.alreadyDelegating').remove();

            // On click on max available link, put the maximum available delegation in amount input
            modal.find('#maxAvailableLink').click(function(){
                modal.find('#amountDelegationSPP').val(maxAmountAvailableDelegationSPP);
            });

            // Set maximum delegation link value
            modal.find('.maxAmountAvailableDelegationSPP').text(maxAmountAvailableDelegationSPP);

            // Listener on delegate button
            modal.find('#delegationSPPButton').on('click', function(){
                // Retrieve delegation value
                const amountDelegation = modal.find('#amountDelegationSPP').val();

                // If value greater than maximum, notify user
                if(amountDelegation > maxAmountAvailableDelegationSPP){
                    alert(`The amount you want to delegate is too high. The maximum you can delegate is ${maxAmountAvailableDelegationSPP} SP`);
                    return;
                }

                // Calculate number of vests
                var delegatedVestsSPP = amountDelegation * totalVestsSPP / totalSteemSPP;
                delegatedVestsSPP=delegatedVestsSPP.toFixed(6);
                // Create delegation steemconnect link
                var urlDelegationSPP = 'https://steemconnect.com/sign/delegateVestingShares?delegator=' + myUsernameSPP + '&delegatee=steem-plus&vesting_shares='+delegatedVestsSPP+'%20VESTS';
                window.open(urlDelegationSPP, '_blank');
            });

            // Close modal listeners
            modal.find('.close-button').on('click', function() {
                modal.remove();
            });
            modal.find('.reveal-overlay').on('click', function() {
                modal.remove();
            });
            $('body').append(modal);
        });

        // On click on buy SPP item
        $('.buySPP').click(function(){
            // Create modal
            let modal = $(`<div role="dialog" style="bottom: 0px; left: 0px; overflow-y: scroll; position: fixed; right: 0px; top: 0px;">
                <div class="reveal-overlay fade in" style="display: block;"></div>
                <div class="reveal fade in" role="document" tabindex="-1" style="display: block; min-height: 200px;">
                    <button class="close-button" type="button">
                        <span aria-hidden="true" class="">×</span>
                    </button>
                    <div id="modalTitle" class="row">
                        <h3 class="column">Buy SteemPlus Points</h3>
                    </div>
                    <div class="row">
                        <label class="disclaimerBuySpp">Your new SteemPlus Points can take up to 10 minutes to appear in your balance.</label>
                    </div>

                    <div class="row">
                        <div class="column small-2" style="padding-top: 5px;">To</div>
                        <div class="column small-10">
                            <div class="input-group" style="margin-bottom: 1.25rem;">
                                <span class="input-group-label label_buy_spp">@</span>
                                <select id="selectReceiverSPP" style="min-width: 5rem; height: inherit; background-color: transparent;" autofocus="" disabled>
                                    <option value="steemplus-pay" selected="">steemplus-pay</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <br>
                    <div class="row">
                        <div class="column small-2" style="padding-top: 5px;">Send</div>
                        <div class="column small-10">
                            <div class="input-group" style="margin-bottom: 5px;">
                                <input id="sent_amount" type="number" placeholder="Amount" name="sent_amount" value="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" autofocus="" min="0" step="0.001">
                                <span class="input-group-label label_buy_spp" style="padding-left: 0px; padding-right: 0px;">
                                    <select id="sent_currency" name="sent_currency" placeholder="Asset" style="min-width: 5rem; height: inherit; background-color: transparent; border: none;">
                                        <option value="SBD" selected="">SBD</option>
                                        <option value="STEEM">STEEM</option>
                                    </select>
                                </span>
                            </div>
                            <div class="amount-error" style="color: rgb(51, 51, 51);">
                                <small>Min: 0.010 SBD</small>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="column small-2" style="padding-top: 5px;">Receive</div>
                        <div class="column small-10">
                            <div class="input-group" style="margin-bottom: 5px;">
                                <input id="receive_amount" type="number" placeholder="Amount" name="receive_amount" value="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" autofocus="" min="1" step="1">
                                <span class="input-group-label label_buy_spp" style="padding-left: 0px; padding-right: 0px;">
                                    <select name="asset" placeholder="Asset" style="min-width: 5rem; height: inherit; background-color: transparent; border: none;" disabled>
                                        <option value="SPP" selected="">SPP</option>
                                    </select>
                                </span>
                            </div>
                            <div class="amount-error" style="color: rgb(51, 51, 51);">
                                <small>Min: 1 SPP</small>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="column small-10">
                            <div class="input-group" style="margin-bottom: 1.25rem;">
                                <button class="button-steemit" id="buySPPButton">Buy SPP</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`);

            // On click on Buy SPP button
            modal.find('#buySPPButton').on('click', function(){
                // Retrieve values
                let amountReceived = modal.find('#receive_amount').val();
                let amountSent = modal.find('#sent_amount').val();
                let sentCurrency = modal.find('#sent_currency').val();
                let selectReceiverSPP = modal.find('#selectReceiverSPP').val();

                // We set the minimum to 1, So if amount receive < 1, set notify user, set the value to 1
                if(amountReceived < 1){
                    alert(`You can't buy less than 1 SPP`);
                    modal.find('#receive_amount').val(1);
                    refreshSentInput();
                    return;
                }

                // If value amount received is correct then create memo and steem connect url
                var memoBuySPP = `buySPP : Bought ${amountReceived} SPP for ${amountSent} ${sentCurrency}`;
                var urlBuySPP = 'https://steemconnect.com/sign/transfer?from=' + myUsernameSPP + '&to=' + selectReceiverSPP + '&amount=' + amountSent + '%20' + sentCurrency + '&memo=' + memoBuySPP;
                var win = window.open(urlBuySPP, '_blank');
                if (win) {
                    //Browser has allowed it to be opened
                    win.focus();
                } else {
                    //Browser has blocked it
                    alert('Please allow popups for this website');
                }
            });

            // Listener on input.
            // Those 3 input are refresh everytime there is an input
            modal.find('#receive_amount').on('input', function(){
                sentIsLastInput = false;
                refreshSentInput(modal);
            });
            modal.find('#sent_amount').on('input', function(){
                sentIsLastInput = true;
                refreshReceivedInput(modal);
            });
            modal.find('#sent_currency').on('input', function(){
                if(sentIsLastInput)
                    refreshReceivedInput(modal);
                else
                    refreshSentInput(modal);
            });

            // Close modal listeners
            modal.find('.close-button').on('click', function() {
                modal.remove();
            });
            modal.find('.reveal-overlay').on('click', function() {
                modal.remove();
            });
            $('body').append(modal);
        });
        // On click on How to earn SPP item
        $('.howToEarn').click(function()
        {
            // Create modal
            let modal = $(`<div role="dialog" style="bottom: 0px; left: 0px; overflow-y: scroll; position: fixed; right: 0px; top: 0px;">
              <div class="reveal-overlay fade in" style="display: block;"></div>
                <div class="reveal fade in" role="document" tabindex="-1" style="display: block; min-height: 200px;">
                    <button class="close-button" type="button">
                        <span aria-hidden="true" class="">×</span>
                    </button>
                    <div id="modalTitle" class="row">
                        <h3 class="column">How to earn SteemPlus Points?</h3>
                    </div>
                    <ol>
                    </ol>
                    <div class="howToEarnSlider">
                        <ul>
                        </ul>
                    </div>
                </div>
            </div>`);

            // For each item of the way list, create a slider
            wayList.forEach((way) => {
                modal.find('.howToEarnSlider > ul').append(`<li>
                    <div class="slide-text">
                        <p class="caption-how-to-earn">${way.title}</p>
                        <p>
                            <label class="title-how-to-earn">How to get it ?</label>
                            <p>${way.description}</p>
                            <a href="/${way.description_post}" target="_blank"><label class="description-how-to-earn description-link">Read this post for more information.</label></a><br>
                            <label class="title-how-to-earn">How much ?</label>
                            <label class="description-how-to-earn">${way.formula}</label>
                        </p>
                    </div>
                    <img src="${chrome.extension.getURL(way.url)}" alt="${way.title}">
                </li>`);
                modal.find('ol').append(`<li class="indexHowToEarnItem"><a name="${way.id}">${way.title}</a></li>`);
            });

            // Configure the slider
            // No arrow, navigation with keyboard activated
            var howToEarnSlider = modal.find('.howToEarnSlider').unslider({
                keys: true,
                arrows: false
            });

            // Click on each link make the correct slider appears
            modal.find('.indexHowToEarnItem > a').click(function()
            {
                howToEarnData = howToEarnSlider.data('unslider');
                howToEarnData.animate(parseInt(`${$(this).attr('name')}`), 'next');
            });

            // Close modal listeners
            modal.find('.close-button').on('click', function() {
                modal.remove();
            });
            modal.find('.reveal-overlay').on('click', function() {
                modal.remove();
            });
            $('body').append(modal);
        });
        // Click on SPP history item
        $('.sppHistory').click(function()
        {
            // Create history modal
            let modal = $(`<div role="dialog" style="bottom: 0px; left: 0px; overflow-y: scroll; position: fixed; right: 0px; top: 0px;">
          <div class="reveal-overlay fade in" style="display: block;"></div>
            <div class="reveal fade in sppHistoryModal" role="document" tabindex="-1" style="display: block; min-height: 200px;">
                <button class="close-button" type="button">
                    <span aria-hidden="true" class="">×</span>
                </button>
                <div id="modalTitle" class="row">
                    <h3 class="column">SteemPlus Points History</h3>
                </div>
                <p>SPP earned from posts will be collected after payout.<br>SPP earned from transactions might take up to 20 minutes to be collected.</p>
                <h4 class="column">Total SteemPlus Points : ${(userDetails === undefined || userDetails.nbPoints === 0 ? 0 : window.SteemPlus.Utils.numberWithCommas(userDetails.nbPoints.toFixed(2)))} SPP</h4>
                <div class="sppHistoryDetail">
                </div>
            </div>
          </div>`);

            // If user has no detail or no points, display error message
            if(userDetails === undefined || userDetails.nbPoints === 0)
                modal.find('.sppHistoryDetail').append('<h4>No detail available</h4>');
            else
            {
                // If not create a table for history
                modal.find('.sppHistoryDetail').append(`<table class="sppHistoryTable">
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Number of points</th>
                        <th>Permlink</th>
                    </tr>
                </table>`);
                // Retrieve details
                var ptsDetails = userDetails.pointsDetails;
                ptsDetails.sort(function(a, b) {return new Date(b.timestamp) - new Date(a.timestamp);});
                ptsDetails.forEach((pointsDetail) => {
                    // For each detail, create a row in the table
                    modal.find('.sppHistoryTable').append(`
                    <tr>
                        <td><span title="${new Date(pointsDetail.timestamp)}"><span>${moment(new Date(pointsDetail.timestamp)).fromNow()}</span></span></td>
                        <td>${pointsDetail.typeTransaction.name}</td>
                        <td>${window.SteemPlus.Utils.numberWithCommas(pointsDetail.nbPoints.toFixed(2))}</td>
                        ${(pointsDetail.url === undefined ? `<td><a target="_blank" href="${pointsDetail.permlink}">${pointsDetail.permlink}</a></td>` : `<td><a target="_blank" href="${pointsDetail.url}">${pointsDetail.title}</a></td>`)}
                    </tr>`);
                });
            }

            // Close modal listeners
            modal.find('.close-button').on('click', function() {
                modal.remove();
            });
            modal.find('.reveal-overlay').on('click', function() {
                modal.remove();
            });
            $('body').append(modal);
        });
    }

    else if(isBusy)
    {
        let divSPP = $(`
            <div class="UserWalletSummary__item">
                <i class="iconfont icon-Dollar UserWalletSummary__icon"></i>
                <div class="UserWalletSummary__label">
                    <span>SteemPlus Points</span>
                </div>
                <div class="UserWalletSummary__value">
                    <span><span>${(userDetails !== undefined ? userDetails.nbPoints.toFixed(2) : 0)}</span> SPP</span>
                </div>
            </div>`);

        // $('.icon-people_fill').parent().after(divSPP);


    }
}

// Function used to refresh sent amount input
function refreshSentInput(modal)
{
    // If received amount updated then retrieve the value and convert it.
    let amountReceived = modal.find('#receive_amount').val();
    let sentCurrency = modal.find('#sent_currency').val();
    if(sentCurrency === 'SBD')
        modal.find('#sent_amount').val((amountReceived/100).toFixed(2));
    else
        modal.find('#sent_amount').val((amountReceived/100/sbdPerSteem).toFixed(2));
}

// Function used to refresh sent amount input
function refreshReceivedInput(modal)
{
    // If sent amount updated then retrieve the value and convert it.
    let sentAmount = modal.find('#sent_amount').val();
    let sentCurrency = modal.find('#sent_currency').val();
    if(sentCurrency === 'SBD')
        modal.find('#receive_amount').val((sentAmount*100).toFixed(2));
    else
        modal.find('#receive_amount').val((sentAmount*100*sbdPerSteem).toFixed(2));
}

// Function used to get the maximum SP user can delegate
async function getMaxSPForSPP(){
    let myOutgoingDelegations = await steem.api.getVestingDelegationsAsync(myAccountSPP.name, null, 10);
    let tmp = 0;
    for (myOutgoingDelegation of myOutgoingDelegations) {
      let valueDelegation = Math.round(parseFloat(steem.formatter.vestToSteem(myOutgoingDelegation.vesting_shares, totalVestsSPP, totalSteemSPP)) * 100) / 100;
      if(myOutgoingDelegation.delegatee === 'steem-plus') {
        isDelegatingToSteemPlus = true;
        delegatingToSteemPlus = valueDelegation;
      }
      else if(valueDelegation>0)
        tmp += valueDelegation;
    }
    let myTotalOutgoingDelegation = tmp;
    var myVests = parseFloat(steem.formatter.vestToSteem(myAccountSPP.vesting_shares.replace(' VESTS',''), totalVestsSPP, totalSteemSPP) * 100) / 100;
    var maxSP = myVests - myTotalOutgoingDelegation - 5.000;
    return (maxSP > 0 ? maxSP.toFixed(3) : 0);
}
