var token_steemplus_point = null;

var userPageRegex = /^.*@([a-z][a-z0-9.\-]+[a-z0-9])$/;

var myUsernameSPP = null;
var retrySteemplusPoint = 0;

var isSteemit = null;
var isBusy = null;

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
    console.log('canStartSteemplusPoint');
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
    console.log('downloadDataSteemplusPoints');
    $.ajax({
        type: "GET",
        beforeSend: function(xhttp) {
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
        },
        url: `https://steemplus-api.herokuapp.com/api/get-steemplus-points/${usernameSPP}`,
        success: function(response) {
            console.log(response[0]);
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
                            <span>${(userDetails !== undefined ? userDetails.nbPoints : 0)} SPP
                                <span class="Icon dropdown-arrow" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g><polygon points="128,90 256,218 384,90"></polygon></g></svg></span>
                            </span>
                        </a>
                        <ul class="VerticalMenu menu vertical VerticalMenu dropdownSPP">
                            <li class="howToEarn"><a>How to earn SPP</a></li>
                            <li class="sppHistory"><a>Steemplus Point history</a></li>
                        </ul>
                    </li>
                </div>
            </div>
            `);
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
                        <h3 class="column">How to earn Steemplus Point</h3>
                    </div>
                </div>
              </div>`);

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
                <h4 class="column">Total Steemplus Point : ${(userDetails === undefined || userDetails.nbPoints === 0 ? 0 : userDetails.nbPoints)} SPP</h4>
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
                
                userDetails.pointsDetails.forEach((pointsDetail) => {
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
                    <span><span>${(userDetails !== undefined ? userDetails.nbPoints : 0)}</span> SPP</span>
                </div>
            </div>`);

        $('.icon-people_fill').parent().after(divSPP);


    }
}