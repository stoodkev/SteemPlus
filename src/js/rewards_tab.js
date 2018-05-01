var token_rewards_tab=null;
var totalVestsRewardsTab=null
var totalSteemRewardsTab=null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

  if(request.to=='rewards_tab'){
    if(request.order==='start'&&token_rewards_tab==null)
    {
      token_rewards_tab=request.token;
      totalVestsRewardsTab = request.data.totalVests;
  		totalSteemRewardsTab = request.data.totalSteem;
			startTabReward();
    }

    if(request.order==='click'&&token_rewards_tab==request.token)
    {
      totalVestsRewardsTab = request.data.totalVests;
  		totalSteemRewardsTab = request.data.totalSteem;
    	startTabReward();
    }
  }
});

function startTabReward()
{
	if($('.UserProfile__top-nav').length === 0)
		setTimeout(function(){
			startTabReward();
		}, 250);
	else
	{
		console.log($('.UserProfile__top-nav > div > div > ul > li'));
		$('.UserProfile__top-nav > div > div > ul > li').eq(3).hide();
		window.SteemPlus.Tabs.createTab({
	    id: 'rewards',
	    title: 'Rewards',
	    enabled: true,
	    createTab: createRewardsTab
	  });
	  if(window.location.href.includes('#rewards'))
	  window.SteemPlus.Tabs.showTab('rewards');
	}
}

function createRewardsTab(rewardsTab)
{
	rewardsTab.html('<div class="row">\
     <div class="UserProfile__tab_content UserProfile__tab_content_smi UserProfile__tab_content_RewardsTab column layout-list">\
        <article class="articles">\
	        <div class="Rewards" style="display: none;">\
	          <h1 class="articles__h1" style="margin-bottom:20px">\
	            Rewards\
	          </h1>\
	          <hr class="articles__hr"/>\
	          <div class="switch-field" style="margin-bottom: -4px;">\
	            <input type="radio" id="rewards-type-posts" name="rewards-type" class="rewards-type" value="author" checked/>\
	            <label for="rewards-type-posts" class="rewards-type" >Author</label>\
	            <input type="radio" id="rewards-type-comments" name="rewards-type" class="rewards-type" value="curation" />\
	            <label for="rewards-type-comments" class="rewards-type">Curation</label>\
	            <input type="radio" id="rewards-type-both" name="rewards-type" class="rewards-type" value="benefactor" />\
	            <label for="rewards-type-both" class="rewards-type">Benefactor</label>\
	          </div>\
	        </div>\
	        <center class="RewardsTabLoading">\
	           <div class="LoadingIndicator circle">\
	              <div></div>\
	           </div>\
	        </center>\
	        <center class="RewardsTabLoadMore" style="display: none;">\
	           <button>\
	            Load more... \
	          </button>\
	        </center>\
        </article>\
     </div>\
  </div>');



  $('.Rewards').show();
  $('.RewardsTabLoading').hide();
}

