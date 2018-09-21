var token_steemplus_point = null;

var userPageRegex = /^.*@([a-z][a-z0-9.\-]+[a-z0-9])$/;

var myUsernameSPP = null;
var retrySteemplusPoint = 0;

var isSteemit = null;
var isBusy = null;

var wayList = [
    {id: "0", title: "Boost a post with Minnowbooster using Steemplus",description:"Use the \'Boost\' Button on the bottom of the article to buy votes on MinnowBooster.", description_post: "@steem-plus/steemplus-2-19-updated-boost-button-collaboration-announcement-earn-more-with-steemplus-points", "url": "src/img/howtoearnspp/minnowbooster.png" , formula: "The amount of SBD sent to MinnowBooster (example : You get 1 SPP for 1 SBD or 1 SBD worth of Steem)"},
    {id: "1", title: "Boost a post with PostPromoter using Steemplus",description:"Use the \'Boost\' Button on the bottom of the article to buy votes on PostPromoter.", description_post: "@steem-plus/steemplus-2-19-updated-boost-button-collaboration-announcement-earn-more-with-steemplus-points", "url": "src/img/howtoearnspp/postpromoter.png", formula: "The amount of SBD sent to PostPromoter (example : You get 1 SPP for 1 SBD or 1 SBD worth of Steem)"},
    {id: "2", title: "Create a new post with Beneficiaries using Steemplus",description:"Use the \'Add Beneficiaries\' button on the post creation page. (Login to SteemConnect required).", description_post: "@steem-plus/steemplus-1-7-share-your-rewards-with-your-friends-beneficiaries-ideal-for-the-steemfest", "url": "src/img/howtoearnspp/beneficiaries.png", formula: "The amount @steemplus-pay will receive as a benefactor * 100 (example : if @steemplus-pay receives 5 SBD worth of SP, you will receive 500 SPP)"},
    {id: "3", title: "Create a post with Donation for Steemplus",description:"Use the \'Post and Support\' button on the post creation page. (Login to SteemConnect required).", description_post: "@steem-plus/steemplus-2-18-2-post-and-support", "url": "src/img/howtoearnspp/donation.png", formula: "The amount @steemplus-pay will receive as a benefactor * 100 (example : if @steemplus-pay receives 5 SBD worth of SP, you will receive 500 SPP)"},
    {id: "4", title: "Create a new DTube post using Steemplus",description:"Post to DTube by putting dtube followed by a space in the tag bar, then following the instructions in the DTube popup (Login to SteemConnect required).", description_post: "https://steemit.com/utopian-io/@steem-plus/steemplus-221-earn-more-by-posting-to-dtube-via-steemplus", "url": "src/img/howtoearnspp/dtube.png", formula: "The amount @steemplus-pay will receive as a benefactor * 100 (example : if @steemplus-pay receives 5 SBD worth of SP, you will receive 500 SPP)"},
    {id: "5", title: "Create a new Utopian post using Steemplus",description: "Post to Utopian by typing utopian-io followed by a space in the tag bar, then following the instructions in the Utopian popup (Login to SteemConnect required).", description_post: "@steem-plus/steemplus-220-utopian--steemplus-partnership--bigger-upvotes", "url": "src/img/howtoearnspp/utopian.png", formula: "The amount @steemplus-pay will receive as a benefactor * 100 (example : if @steemplus-pay receives 5 SBD worth of SP, you will receive 500 SPP)"}
]

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.to === 'steemplus_points' && request.order === 'start' && token_steemplus_point == null) {
        token_steemplus_point = request.token;
        myUsernameSPP = request.data.user;
        isSteemit = request.data.steemit;
        isBusy = request.data.busy;
        retrySteemplusPoint = 0;
        canStartSteemplusPoint();
    } else if (request.to === 'steemplus_points' && request.order === 'click' && token_steemplus_point == request.token) {
        myUsernameSPP = request.data.user;
        isSteemit = request.data.steemit;
        isBusy = request.data.busy;
        retrySteemplusPoint = 0;
        canStartSteemplusPoint();
    }
});

function canStartSteemplusPoint()
{
    if(retrySteemplusPoint >= 20) return;

    if(regexWalletSteemit.test(window.location.href))
    {
        if($('.Trans').length > 0)
          downloadDataSteemplusPoints(window.SteemPlus.Utils.getPageAccountName());
        else
            setTimeout(function(){
                retrySteemplusPoint++;
                canStartSteemplusPoint();
            })
    }
    else if(regexWalletBusy.test(window.location.href))
    {
        if($('.UserWalletSummary').length > 0)
        {
            if(window.location.href.includes('/wallet'))
                downloadDataSteemplusPoints(myUsernameSPP);
            else
                downloadDataSteemplusPoints(window.location.href.split('@')[1].split('/')[0]);
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
    $.ajax({
        type: "GET",
        beforeSend: function(xhttp) {
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
        },
        url: `https://steemplus-api.herokuapp.com/api/get-steemplus-points/${usernameSPP}`,
        success: function(response) {
            displaySteemplusPoints(response[0]);
        },
        error: function(msg) {
            resolve(msg);
        }
    });
}

function displaySteemplusPoints(userDetails)
{
    if(isSteemit)
    {
        let divSPP = $(`
            <div class="UserWallet__balance row zebra">
                <div class="column small-12 medium-8">
                    Steemplus Points
                    <div class="FormattedHTMLMessage secondary">
                        This is the amount of Steemplus Point you earned. Click the amount of steemplus points to see the detail.
                    </div>
                </div>
                <div class="column small-12 medium-4 nbPointsDiv">
                    <li class="DropdownMenu Wallet_dropdown dropdownSPPLink">
                        <a>
                            <span>${(userDetails !== undefined ? userDetails.nbPoints.toFixed(2) : 0)} SPP
                                <span class="Icon dropdown-arrow" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g><polygon points="128,90 256,218 384,90"></polygon></g></svg></span>
                            </span>
                        </a>
                        <ul class="VerticalMenu menu vertical VerticalMenu dropdownSPP">
                            <li class="howToEarn"><a>How to earn SPP?</a></li>
                            <li class="sppHistory"><a>Steemplus Point history</a></li>
                        </ul>
                    </li>
                </div>
            </div>
            `);
        if(myUsernameSPP !== window.SteemPlus.Utils.getPageAccountName())
            divSPP.find('.howToEarn').remove();

        $('.UserWallet__balance').eq($('UserWallet__balance ').length-1).before(divSPP);
        $('.dropdownSPPLink').click(function(){
            if($(this).hasClass('show'))
                $(this).removeClass('show');
            else
                $(this).addClass('show');
        });
        $('.howToEarn').click(function()
        {
            let modal = $(`<div role="dialog" style="bottom: 0px; left: 0px; overflow-y: scroll; position: fixed; right: 0px; top: 0px;">
              <div class="reveal-overlay fade in" style="display: block;"></div>
                <div class="reveal fade in" role="document" tabindex="-1" style="display: block; min-height: 200px;">
                    <button class="close-button" type="button">
                        <span aria-hidden="true" class="">×</span>
                    </button>
                    <div id="modalTitle" class="row">
                        <h3 class="column">How to earn Steemplus Points?</h3>
                    </div>
                    <ol>
                    </ol>
                    <div class="howToEarnSlider">
                        <ul>
                        </ul>
                    </div>
                </div>
            </div>`);

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

            var howToEarnSlider = modal.find('.howToEarnSlider').unslider({
                keys: true,
                arrows: false
            });

            modal.find('.indexHowToEarnItem > a').click(function()
            {
                howToEarnData = howToEarnSlider.data('unslider');
                howToEarnData.animate(parseInt(`${$(this).attr('name')}`), 'next');
            });


            modal.find('.close-button').on('click', function() {
                modal.remove();
            });
            modal.find('.reveal-overlay').on('click', function() {
                modal.remove();
            });
            $('body').append(modal);
        });
        $('.sppHistory').click(function()
        {
            let modal = $(`<div role="dialog" style="bottom: 0px; left: 0px; overflow-y: scroll; position: fixed; right: 0px; top: 0px;">
          <div class="reveal-overlay fade in" style="display: block;"></div>
            <div class="reveal fade in sppHistoryModal" role="document" tabindex="-1" style="display: block; min-height: 200px;">
                <button class="close-button" type="button">
                    <span aria-hidden="true" class="">×</span>
                </button>
                <div id="modalTitle" class="row">
                    <h3 class="column">History of Steemplus Point</h3>
                </div>
                <h4 class="column">Total Steemplus Point : ${(userDetails === undefined || userDetails.nbPoints === 0 ? 0 : userDetails.nbPoints.toFixed(2))} SPP</h4>
                <div class="sppHistoryDetail">
                </div>
            </div>
          </div>`);

            if(userDetails === undefined || userDetails.nbPoints === 0)
                modal.find('.sppHistoryDetail').append('<h4>No detail available</h4>');
            else
            {
                modal.find('.sppHistoryDetail').append(`<table class="sppHistoryTable">
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Number of point</th>
                        <th>Permlink</th>
                    </tr>
                </table>`);
                var ptsDetails = userDetails.pointsDetails;
                ptsDetails.sort(function(a, b) {return new Date(b.timestamp) - new Date(a.timestamp);});
                ptsDetails.forEach((pointsDetail) => {
                    modal.find('.sppHistoryTable').append(`
                    <tr>
                        <td><span title="${new Date(pointsDetail.timestamp)}"><span>${moment(new Date(pointsDetail.timestamp)).fromNow()}</span></span></td>
                        <td>${pointsDetail.typeTransaction.name}</td>
                        <td>${pointsDetail.nbPoints.toFixed(2)}</td>
                        <td><a href="@${pointsDetail.url}">${pointsDetail.title}</a></td>
                    </tr>`);
                });
            }

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
                    <span>Steemplus Points</span>
                </div>
                <div class="UserWalletSummary__value">
                    <span><span>${(userDetails !== undefined ? userDetails.nbPoints.toFixed(2) : 0)}</span> SPP</span>
                </div>
            </div>`);

        $('.icon-people_fill').parent().after(divSPP);


    }
}
