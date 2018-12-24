let token_premium_features = null;
let activePremiumFeaturesSubscriptionsUser = null;
const accountName = 'steem-plus';

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


// Function used to verify if the feature has to start or not
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

// Function used to create the tab content
// @param : premiumFeatureList : HTML element representing the tab
function createTabPremiumFeatureList(premiumFeatureList) {

  // Calculate the total for all the subscriptions
  // This will help user to know how much they spend per month
  let totalAmountSubscription = 0;
  if(activePremiumFeaturesSubscriptionsUser)
    activePremiumFeaturesSubscriptionsUser.map(function(sub){
      totalAmountSubscription += sub.premiumFeature.price;
    });

  // Create tab content
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

  // API call to download the list of all the premium features
  $.ajax({
    type: "GET",
    beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
    },
    url: 'https://api.steemplus.app/premium-feature-list',
    success: function(features) {
        features.forEach((feature, index) => {

            // Check is a feature is active for user's account
            const isActive = findFeature(feature.name) !== undefined;
            const activeFeature = findFeature(feature.name);

            // Create line in tab.
            // If feature is active, add unsubscribe button,
            // If not create subscribe button
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

      // When page is ready, remove loading circle
      $('.loading-feature-list').hide();

      // Create event listener for subscribe buttons
      $('.button-steemit-subscribe').click(event => {
        subscribeFeature(event.target.name);
      });

      // Create event listener for unsubscribe buttons
      $('.button-steemit-unsubscribe').click(event => {
        unsubscribeFeature(event.target.name);
      });
    },
    error: function(msg) {
        // If error while downloading data, display error message
        $('.premium-feature-list-content').append(`<h4>Seems that Steemplus-API is having trouble. Please try again later. Sorry for the inconvenience.</h4>
          <h4>SteemPlus Team</h4>`);
    }
  });
}

// Function used to create cancel message
// @param feature : feature we need to get the message for
function getCancelMessage(feature){
  // If feature is not active, no cancel message
  if(feature !== undefined && feature.isCanceled)
    return `<div class="FormattedHTMLMessage secondary cancel-message">
              Your subscription will be canceled on ${moment(new Date(feature.lastPayment)).add(1, 'month')}. If you want to still use it, subscribe again (you won't be charged again).
            </div>`
  else return '';
}

// Function used to create the subscription panel for a given feature
// @param isActive : status of the given feature
// @param feature : given feature
function getSubscriptionPanel(isActive, feature){
  // Only If the feature is active create the panel
  if(isActive)
    return `<div class="FormattedHTMLMessage secondary" title="${new Date(feature.subscriptionDate)}">
              You subscribe to ${feature.premiumFeature.name} ${moment(new Date(feature.subscriptionDate)).fromNow()}.
            </div>
            <div class="FormattedHTMLMessage secondary" title="${new Date(feature.lastPayment)}">
              Your last payment was on ${moment(new Date(feature.lastPayment)).fromNow()}.
            </div>`;
  else return '';
}

// Function used to find a feature in the feature list
// @param name : name of the feature
function findFeature(name) {
  return (activePremiumFeaturesSubscriptionsUser&&activePremiumFeaturesSubscriptionsUser.find(function(sub) {
    return name === sub.premiumFeature.name;
  }));
}

// function used to subscribe to a feature
// @param nameFeature : name of the feature
function subscribeFeature(nameFeature){
  const memo = `Premium Feature : Redeem SPP for [${nameFeature}] id:${generateRequestID(12)}`;
  sendTransfer(memo);
}

// function used to unsubscribe to a feature
// @param nameFeature : name of the feature
function unsubscribeFeature(nameFeature){
  const memo = `Premium Feature : Cancel subscription for [${nameFeature}] id:${generateRequestID(12)}`;
  sendTransfer(memo);
}


// Function used to send the transfer to SteemPlus
// @param memo : memo discribing the purpose of the transfer
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

// Function used to generate a random requestID
function generateRequestID(length){
  let requestID = "";
    var possible = "0123456789";

    for (let i = 0; i < length; i++)
        requestID += possible.charAt(Math.floor(Math.random() * possible.length));
    return requestID;
}
