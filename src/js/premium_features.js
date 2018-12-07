let token_premium_features = null;
let activePremiumFeaturesSubscriptionsUser = null;
const accountName = 'lecaillon';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.to === 'premium_features' && request.order === 'start' && token_premium_features == null) {
        token_premium_features = request.token;
        activePremiumFeaturesSubscriptionsUser = request.data.activePremiumFeaturesSubscriptions;
        startPremiumFeatures()
    } 
    else if (request.to === 'premium_features' && request.order === 'click' && token_premium_features == request.token) {
      activePremiumFeaturesSubscriptionsUser = request.data.activePremiumFeaturesSubscriptions;
      startPremiumFeatures()
    }
});

function startPremiumFeatures() {
    if (regexBlogSteemit.test(window.location.href)) {
      window.SteemPlus.Tabs.createTab({
        id: 'feature_list',
        title: 'Feature List',
        enabled: true,
        createTab: createTabPremiumFeatureList,
        newDropdown: true,
        nameDropdown: "premium_features",
        labelDropdown: "Premium Features"
      });

      if (window.location.href.includes('#feature_list'))
        window.SteemPlus.Tabs.showTab('feature_list');
    }

}

function createTabPremiumFeatureList(premiumFeatureList) {
  let totalAmountSubscription = 0;
  activePremiumFeaturesSubscriptionsUser.map(function(sub){
    totalAmountSubscription += sub.premiumFeature.price;
  });
  premiumFeatureList.html('\
  <div class="feed-layout container">\
    <div class="row">\
      <div class="UserProfile__tab_content UserProfile__tab_content_smi UserProfile__tab_content_PremiumFeatures column layout-list">\
        <article class="articles">\
          <div class="premiumFeaturesTab">\
            <h1 class="articles__h1" style="margin-bottom:20px">\
              Feature List\
            </h1>\
            <hr class="articles__hr"/>\
              <h2 class="articles__h1" style="margin-bottom:20px">\
                Total Spent per month : <span class="total-per-month">'+ totalAmountSubscription +'</span> SPP\
              </h2>\
              <div class="LoadingIndicator loading-feature-list circle">\
                <div></div>\
              </div>\
            </center>\
            <div class="premium-feature-list-content"></div>\
            <br>\
          </div>\
        </article>\
      </div>\
    </div>\
  </div>');

  $.ajax({
    type: "GET",
    beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
    },
    url: 'https://api.steemplus.app/premium-feature-list',
    success: function(features) {
        features.forEach((feature, index) => {
            const isActive = findFeature(feature.name) !== undefined;
            const activeFeature = findFeature(feature.name);
            $('.premium-feature-list-content').append(`
              <div class="feature row ${index % 2 === 0 ? 'feature-even' : ''}">
                <div class="column small-12 medium-8 description-feature">
                  ${feature.name}
                  <div class="FormattedHTMLMessage secondary">
                    ${feature.description}
                  </div>
                  ${getCancelMessage(activeFeature)}
                  ${getSubscriptionPanel(isActive, activeFeature)}
                </div>
                <div class="column small-12 medium-4 payment-feature">
                  <p>${feature.price} SPP/month</p>
                  ${!isActive || activeFeature.isCanceled ? `<button class="button-steemit-subscribe" name="${feature.name}">Subscribe</button>` : `<button class="button-steemit-unsubscribe" name="${feature.name}">Unsubscribe</button>`}
              </div>`
            );
        });
      $('.loading-feature-list').hide();

      $('.button-steemit-subscribe').click(event => {
        subscribeFeature(event.target.name);
      });

      $('.button-steemit-unsubscribe').click(event => {
        unsubscribeFeature(event.target.name);
      });
    },
    error: function(msg) {
        $('.premium-feature-list-content').append(`<h4>Seems that Steemplus-API is having trouble. Please try again later. Sorry for the inconvenience.</h4>
          <h4>SteemPlus Team</h4>`);
    }
  });
}

function getCancelMessage(feature){
  if(feature !== undefined && feature.isCanceled)
    return `<div class="FormattedHTMLMessage secondary cancel-message">
              Your subscription will be canceled on ${moment(new Date(feature.lastPayment)).add(1, 'month')}. If you want to still use it, subscribe again (you won't be charged again). 
            </div>`
  else return '';
}

function getSubscriptionPanel(isActive, feature){
  if(isActive)
    return `<div class="FormattedHTMLMessage secondary" title="${new Date(feature.subscriptionDate)}">
              You subscribe to ${feature.premiumFeature.name} ${moment(new Date(feature.subscriptionDate)).fromNow()}.
            </div>
            <div class="FormattedHTMLMessage secondary" title="${new Date(feature.lastPayment)}">
              Your last payment was on ${moment(new Date(feature.lastPayment)).fromNow()}.
            </div>`;
  else return '';
}

function findFeature(name) {
  return activePremiumFeaturesSubscriptionsUser.find(function(sub) {
    return name === sub.premiumFeature.name;
  })
}

function subscribeFeature(nameFeature){
  const memo = `Premium Feature : Redeem SPP for [${nameFeature}] id:${generateRequestID(12)}`;
  sendTransfer(memo);
}

function unsubscribeFeature(nameFeature){
  const memo = `Premium Feature : Cancel subscription for [${nameFeature}] id:${generateRequestID(12)}`;
  sendTransfer(memo);  
}

function sendTransfer(memo){
  const url = 'https://steemconnect.com/sign/transfer?to=' + encodeURIComponent(accountName) + '&amount=0.001%20SBD&memo=' + encodeURIComponent(memo);
  var win = window.open(url, '_blank');
  if (win) {
      //Browser has allowed it to be opened
      win.focus();
  } else {
      //Browser has blocked it
      alert('Please allow popups for this website');
  }
}

function generateRequestID(length){
  let requestID = "";
    var possible = "0123456789";

    for (let i = 0; i < length; i++)
        requestID += possible.charAt(Math.floor(Math.random() * possible.length));
    return requestID;
}