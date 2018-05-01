var token_rewards_tab=null;
var totalVestsRewardsTab=null
var totalSteemRewardsTab=null;
var downloadingDataRewardTab=false;

var rewardsListLocal=null;

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
	          <div class="row">\
	          	<div class="columns small-10 medium-12 medium-expand">\
	          		<ul class="WalletSubMenu menu RewardsTabSubMenu">\
	          			<li><a name="pending" class="subtypeItem active">Pending</a></li>\
	          			<li><a name="paid" class="subtypeItem">Paid</a></li>\
	          		</ul>\
	          	</div>\
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

	rewardsTab.find('.rewards-type').on('change', function() {
    // Change display
    var typeReward = (rewardsTab.find('.rewards-type:checked')[0].value);
    displayRewards(rewardsTab, typeReward,'pending',window.SteemPlus.Utils.getPageAccountName());
  });

  rewardsTab.find('.RewardsTabSubMenu > ul > li > a').click(function(){
		var typeReward = (rewardsTab.find('.rewards-type:checked')[0].value);
		var subTypeReward = $(this).attr('name');
		console.log($(this));
		$('.subtypeItem').removeClass('active');
		$(this).addClass('active');
		displayRewards(rewardsTab, typeReward,'pending',window.SteemPlus.Utils.getPageAccountName());
  });
  // Display mentions in post
  displayRewards(rewardsTab,'author', 'pending', window.SteemPlus.Utils.getPageAccountName());
}

// Display rewards depending on type and sub type
// @parameter reward : jquery object, tab
// @parameter type : represent the selected element (Author, Curation or Benefactor)
// @parameter subtype : represent the subcategory of the selected element (pending or paid)
// @parameter usernamePageReward : selected user
function displayRewards(rewardsTab, type, subtype, usernamePageReward)
{
	if(rewardsListLocal===null&&!downloadingDataRewardTab)
	{
		// No data and not downloading
		$.ajax({
      type: "GET",
      beforeSend: function(xhttp) {
        downloadingDataRewardTab=true;
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
      //  console.log(xhttp);
      },

        // url: 'http://steemplus-api.herokuapp.com/api/get-mentions/'+ usernamePageMentions,
        url: 'https://api.myjson.com/bins/uyr5z',
      success: function(result) {
        rewardsListLocal = result;
        createRowsRewardsTab(rewardsTab, type, subtype);
        downloadingDataRewardTab = false;
      },
      error: function(msg) {
        downloadingDataRewardTab = false;
        if($('.error-mentions-label').length===0){
          var errorLabel = document.createElement('h2');
          $(errorLabel).addClass('articles__h1');
          $(errorLabel).addClass('error-mentions-label');
          $(errorLabel).append('Looks like we are having trouble retrieving information from steemSQL. Please try again later.');
          $('.MentionsTabLoading').hide();
          $('.articles').prepend(errorLabel);
        }
      }
    });
	}
	else
	{
		if(rewardsListLocal!==null)
		{
			// Use local data
			createRowsRewardsTab(rewardsTab, type, subtype)
		}
		else
		{
			setTimeout(function(){
        displayRewards(rewardsTab, type, subtype, usernamePageReward);
      },250);
		}
	}
}

function createRowsRewardsTab(rewardsTab, type, subtype)
{
	console.log(rewardsListLocal);
	$('.Rewards').show();
  $('.RewardsTabLoading').hide();
}