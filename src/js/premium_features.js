let token_premium_features = null;

const features = [
  {
    "name": "Remove Ads",
    "description": "This feature allows you to remove ads on the page",
    "price": "10 SPP/month"
  },
  {
    "name": "Cancel beneficiaries",
    "description": "This feature allows you to cancel the 5% beneficiaries if you use the beneficiaries feature.",
    "price": "10 SPP/month"
  },
  {
    "name": "Statistics",
    "description": "Add a pixel to get statistics about post view",
    "price": "10 SPP/month"
  }
]

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.to === 'premium_features' && request.order === 'start' && token_premium_features == null) {
        token_premium_features = request.token;
        startPremiumFeatures()
    } 
    else if (request.to === 'premium_features' && request.order === 'click' && token_premium_features == request.token) {
      startPremiumFeatures()
    }
});

function startPremiumFeatures() {
    if (regexBlogSteemit.test(window.location.href)) {
      window.SteemPlus.Tabs.createTab({
        id: 'my_account_premium',
        title: 'My Account',
        enabled: true,
        createTab: createTabMyAccountPremium,
        newDropdown: true,
        nameDropdown: "premium_features",
        labelDropdown: "Premium Features"
      });

      window.SteemPlus.Tabs.createTab({
        id: 'feature_list',
        title: 'Feature List',
        enabled: true,
        createTab: createTabPremiumFeatureList,
        newDropdown: true,
        nameDropdown: "premium_features",
        labelDropdown: "Premium Features"
      });

      if (window.location.href.includes('#my_account_premium'))
          window.SteemPlus.Tabs.showTab('my_account_premium');
      else if (window.location.href.includes('#feature_list'))
          window.SteemPlus.Tabs.showTab('feature_list');
    }

}

function createTabMyAccountPremium(myAccountPremium) {
    myAccountPremium.html('\
    <div class="feed-layout container">\
      <div class="row">\
        <div class="UserProfile__tab_content UserProfile__tab_content_smi UserProfile__tab_content_PremiumFeatures column layout-list">\
          <article class="articles">\
            <div class="premiumFeaturesTab">\
              <h1 class="articles__h1" style="margin-bottom:20px">\
                My Account\
              </h1>\
              <hr class="articles__hr"/>\
                <div class="LoadingIndicator loading-account circle">\
                  <div></div>\
                </div>\
              </center>\
              <div class="my-account-premium-content"></div>\
              <br>\
            </div>\
          </article>\
        </div>\
      </div>\
    </div>');

    $('.my-account-premium-content').append(`
        <div class="feature row">
          <div class="column small-12 medium-8 description-feature">
            My SPP
            <div class="FormattedHTMLMessage secondary">
              SPP allow you to receive a share of @steem-plus vote and are redeemable for premium features.
            </div>
          </div>
          <div class="column small-12 medium-4 payment-feature">
            <p>${10} SPP</p>
          </div>
        </div>`
      );

    $('.loading-account').hide();

}

function createTabPremiumFeatureList(premiumFeatureList) {
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

    features.forEach((feature, index) => {
      $('.premium-feature-list-content').append(`
        <div class="feature row ${index % 2 === 0 ? 'feature-even' : ''}">
          <div class="column small-12 medium-8 description-feature">
            ${feature.name}
            <div class="FormattedHTMLMessage secondary">
              ${feature.description}
            </div>
          </div>
          <div class="column small-12 medium-4 payment-feature">
            <p>${feature.price}</p>
            <button class="button-steemit-subscribe">Subscribe</button>
          </div>
        </div>`
      );
    });

    $('.loading-feature-list').hide();

}