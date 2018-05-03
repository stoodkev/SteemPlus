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

// Start Tab Reward if it can
function startTabReward()
{
	// Wait for the nav bar to be ready
	if($('.UserProfile__top-nav').length === 0)
		setTimeout(function(){
			startTabReward();
		}, 250);
	else
	{
		// Create the new tab
		console.log($('.UserProfile__top-nav > div > div > ul > li'));
		$('.UserProfile__top-nav > div > div > ul > li').eq(3).hide();
		window.SteemPlus.Tabs.createTab({
			id: 'rewards',
			title: 'Rewards',
			enabled: true,
			createTab: createRewardsTab
		});

		// Display the tab if #rewards in url
		if(window.location.href.includes('#rewards'))
			window.SteemPlus.Tabs.showTab('rewards');
	}
}


// Function used to create the tab content
// @parameter rewardTab : graphical element tab
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
						<div class="columns small-10 medium-12 medium-expand" style="padding:0px;">\
							<ul class="WalletSubMenu menu RewardsTabSubMenu">\
								<li><a name="pending" class="subtypeItem active">Pending</a></li>\
								<li><a name="paid" class="subtypeItem">Paid</a></li>\
							</ul>\
						</div>\
					</div>\
					<div class="bootstrap-wrapper">\
	          <div class="container container-rewards">\
	          	<div class="row"></div>\
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

	// On change type
	rewardsTab.find('.rewards-type').on('change', function() {
    // Change display
    var typeReward = (rewardsTab.find('.rewards-type:checked')[0].value);
    displayRewards(rewardsTab, typeReward,'pending',window.SteemPlus.Utils.getPageAccountName());
	});

	// Change subtype
	rewardsTab.find('.subtypeItem').click(function(){
		var typeReward = (rewardsTab.find('.rewards-type:checked')[0].value);
		var subTypeReward = $(this).attr('name');
		$('.subtypeItem').removeClass('active');
		$(this).addClass('active');
		displayRewards(rewardsTab, typeReward ,subTypeReward, window.SteemPlus.Utils.getPageAccountName());
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
      url: 'https://api.myjson.com/bins/142hsa',
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
      		$('.RewardsTabLoading').hide();
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

// Create all the row depending on type and subtype
// @parameter rewardTab : tab's graphical element
// @parameter type : type displayed (Author, Curation, Benefactor)
// @parameter subtype : subtype displayed (Pending or Paid)
function createRowsRewardsTab(rewardsTab, type, subtype)
{
	$('.Rewards').hide();
	$('.RewardsTabLoading').show();
	$('.container-rewards').find('.row').empty();
	var indexDisplayReward = 0;
	var style = 'background-color:#eeeeee;';
	rewardsListLocal.forEach(function(item){
		if(item.type===subtype + '_' + type)
		{
			var rewardText = [];
			if(item.reward===-1)
			{
				if(item.sbd_payout>0) rewardText.push(item.sbd_payout.toFixed(3) + ' SBD');
				if(item.vests_payout>0) rewardText.push(steem.formatter.vestToSteem(parseFloat(item.vests_payout), totalVestsRewardsTab, totalSteemRewardsTab).toFixed(3) + ' SP');
				if(item.steem_payout>0) rewardText.push(item.steem_payout.toFixed(3) + ' STEEM');
			}
			else
			{
				rewardText.push(steem.formatter.vestToSteem(parseFloat(item.reward), totalVestsRewardsTab, totalSteemRewardsTab).toFixed(3) + ' SP');
			}
			$('.container-rewards').find('.row').append('<span style="' + (indexDisplayReward%2===0 ? style : '') + '" class="col-2" title="' + new Date(item.timestamp) + '">' + moment(new Date(item.timestamp)).fromNow() + '</span> <span style="' + (indexDisplayReward%2===0 ? style : '') + '" class="col-4">' + rewardText.join(', ') + '</span><span style="' + (indexDisplayReward%2===0 ? style : '') + '" class="col-6">' + item.permlink + '</span>');
			indexDisplayReward++;
		}
	});

	$('.Rewards').show();
	$('.RewardsTabLoading').hide();
}