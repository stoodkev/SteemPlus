let token_premium_features = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.to === 'premium_features' && request.order === 'start' && token_premium_features == null) {
      console.log('ici');
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
            id: 'premium_features',
            title: 'Premium Features',
            enabled: true,
            createTab: createTabPremiumFeature,
            newDropdown: true,
            nameDropdown: "premium_features",
            labelDropdown: "Premium Features"
        });
        if (window.location.href.includes('#premium_features'))
            window.SteemPlus.Tabs.showTab('premium_features');
    }

}

function createTabPremiumFeature(premiumFeatures) {
    premiumFeatures.html('\
    <div class="feed-layout container">\
      <div class="row">\
        <div class="UserProfile__tab_content UserProfile__tab_content_smi UserProfile__tab_content_PremiumFeatures column layout-list">\
          <article class="articles">\
            <div class="premiumFeaturesTab">\
              <h1 class="articles__h1" style="margin-bottom:20px">\
                Witnesses\
              </h1>\
              <hr class="articles__hr"/>\
                <div class="LoadingIndicator circle">\
                  <div></div>\
                </div>\
              </center>\
              <div class="premium-feature-content"></div>\
              <br>\
            </div>\
          </article>\
        </div>\
      </div>\
    </div>');

}