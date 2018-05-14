var token_rewards_tab=null;
var totalVestsRewardsTab=null
var totalSteemRewardsTab=null;
var base=null;
var downloadingDataRewardTab=false;

var rewardsListLocal=null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	if(request.to=='rewards_tab'){
		if(request.order==='start'&&token_rewards_tab==null)
		{
			token_rewards_tab=request.token;
			totalVestsRewardsTab = request.data.totalVests;
			totalSteemRewardsTab = request.data.totalSteem;
			base=request.data.base;
			startTabReward();
		}

		if(request.order==='click'&&token_rewards_tab==request.token)
		{
			totalVestsRewardsTab = request.data.totalVests;
			totalSteemRewardsTab = request.data.totalSteem;
			base=request.data.base;
			startTabReward();
		}
	}
});

// Start Tab Reward if it can
function startTabReward()
{
	if(regexBlogSteemit.test(window.location.href))
	{
		// Wait for the nav bar to be ready
		if($('.UserProfile__top-nav').length === 0)
			setTimeout(function(){
				startTabReward();
			}, 250);
		else
		{
			// Create the new tab
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
						<h6 id="rewards-information-message"></h6>\
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
	// Display pending rewards for chosen type
	rewardsTab.find('.rewards-type').on('change', function() {
	    // Change display
	    var typeReward = (rewardsTab.find('.rewards-type:checked')[0].value);
	    var subtypeRewardDefault;
	    if(typeReward === 'author')
	    {
	    	$('.subtypeItem').eq(0).show();
	    	$('.subtypeItem').removeClass('active');
			$('.subtypeItem').eq(0).addClass('active');
			subtypeRewardDefault = 'pending';
	    }
	    else
	    {
			$('.subtypeItem').removeClass('active');
			$('.subtypeItem').eq(1).addClass('active');
			$('.subtypeItem').eq(0).hide();
			subtypeRewardDefault = 'paid';
	    }

	    displayRewards(rewardsTab, typeReward, subtypeRewardDefault, window.SteemPlus.Utils.getPageAccountName());
	});

	// Change subtype
	// Display chosen subtype for selected type
	rewardsTab.find('.subtypeItem').click(function(){
		var typeReward = (rewardsTab.find('.rewards-type:checked')[0].value);
		var subTypeReward = $(this).attr('name');
		$('.subtypeItem').removeClass('active');
		$(this).addClass('active');
		displayRewards(rewardsTab, typeReward ,subTypeReward, window.SteemPlus.Utils.getPageAccountName());
	});

  // Display mentions in post
  // Default : display author pending rewards
  displayRewards(rewardsTab,'author', 'pending', window.SteemPlus.Utils.getPageAccountName());
}


// Function used to download infomation about a post like title and url
// This function use async and await to be sure that data processing will be launch only if all data is downloaded
function initListReward(list, rewardsTab, type, subtype)
{
	rewardsListLocal = [];
	list.forEach(async function(item, index, list){
		await steem.api.getContentAsync(item.author, item.permlink).then(function(content) {
			item.url = content.url;
			item.title = (content.title==='' ? 'Re : ' : '') + content.root_title;
			rewardsListLocal.push(item);
			if(rewardsListLocal.length === list.length)
			{
				rewardsListLocal.sort(function(a,b){
			    	return new Date(b.timestamp) - new Date(a.timestamp);
				});
				createRowsRewardsTab(rewardsTab, type, subtype);
			}
		});
  	});
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
  		},

      url: 'http://steemplus-api.herokuapp.com/api/get-rewards/'+ usernamePageReward,
      success: function(result) {
      	downloadingDataRewardTab = false;
		initListReward(result, rewardsTab, type, subtype);
      },
      error: function(msg) {
      	downloadingDataRewardTab = false;
      	if($('.error-rewards-label').length===0){
      		var errorLabel = document.createElement('h2');
      		$(errorLabel).addClass('articles__h1');
      		$(errorLabel).addClass('error-rewards-label');
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
	var classOdd = 'rewards-odd';
	var hasDataToDisplay = false;

	var totalSBD=0;
	var totalSteem=0;
	var totalSP=0;

	rewardsListLocal.forEach(function(item){

		if(item.type===subtype + '_' + type)
		{
			hasDataToDisplay = true;
			var rewardText = [];
			if(item.type==='pending_author')
			{
				var beneficiariesList = JSON.parse(item.beneficiaries);
				var beneficiariesTotalWeight = 0;
				beneficiariesList.forEach(function(bene){
					beneficiariesTotalWeight += bene["weight"] / 10000;
				});

				var pendingAuthorSDB = parseFloat(item.pending_payout_value) * 0.75 * (1 - beneficiariesTotalWeight) * 0.5;
				var pendingAuthorSP = pendingAuthorSDB / base;

				rewardText.push(pendingAuthorSDB.toFixed(3) + ' SBD');
				rewardText.push(pendingAuthorSP.toFixed(3) + ' SP');

				totalSBD+=pendingAuthorSDB;
				totalSP+=pendingAuthorSP;
			}
			else if(item.reward===-1)
			{
				if(item.sbd_payout>0)
				{
					rewardText.push(item.sbd_payout.toFixed(3) + ' SBD');
					totalSBD+=item.sbd_payout;
				}
				if(item.vests_payout>0)
				{
					rewardText.push(steem.formatter.vestToSteem(parseFloat(item.vests_payout), totalVestsRewardsTab, totalSteemRewardsTab).toFixed(3) + ' SP');
					totalSP+=parseFloat(steem.formatter.vestToSteem(parseFloat(item.vests_payout), totalVestsRewardsTab, totalSteemRewardsTab));
				}
				if(item.steem_payout>0)
				{
					rewardText.push(item.steem_payout.toFixed(3) + ' STEEM');
					totalSteem+=parseFloat(item.steem_payout);
				}
			}
			else
			{
				rewardText.push(steem.formatter.vestToSteem(parseFloat(item.reward), totalVestsRewardsTab, totalSteemRewardsTab).toFixed(3) + ' SP');
				totalSP+=parseFloat(steem.formatter.vestToSteem(parseFloat(item.reward), totalVestsRewardsTab, totalSteemRewardsTab).toFixed(3));
			}
			$('.container-rewards').find('.row').append('<span class="col-2 ' + (indexDisplayReward%2===0 ? classOdd : '') + '" title="' + new Date(item.timestamp) + '">' + (subtype==='paid' ? 'Paid ' : '') + moment(new Date(item.timestamp)).fromNow() + '</span> <span class="col-3 ' + (indexDisplayReward%2===0 ? classOdd : '') + '">' + rewardText.join(', ') + '</span><span class="col-7 ' + (indexDisplayReward%2===0 ? classOdd : '') + '"><a target="_blank" href="'+ item.url + '">' + item.title + '</a></span>');
			indexDisplayReward++;
		}
	});

	// subtype and type doesn't match any information
	if(!hasDataToDisplay)
	{
		if($('.error-rewards-label').length===0){
	  		var errorLabel = document.createElement('h2');
	  		$(errorLabel).addClass('articles__h1');
	  		$(errorLabel).addClass('error-rewards-label');
	  		$(errorLabel).append('No information to display for ' + subtype + ' ' + type + ' rewards.');
	  		$('.RewardsTabLoading').hide();
	  		$('.container-rewards').find('.row').prepend(errorLabel);
	  	}
	}
	else
	{
		$('#rewards-information-message').eq(0).empty();
		if(subtype==='paid')
			$('#rewards-information-message').eq(0).append('List of all the ' + type + ' rewards paid within the last 7 days');
		else
			$('#rewards-information-message').eq(0).append('List of all the panding ' + type + ' rewards. They will be paid 7 days after creation. The pending payout is an estimation that may vary over time.');

		var totalPendingLabel = [];
		if(totalSBD>0)
		{
			totalPendingLabel.push(totalSBD.toFixed(3) + ' SBD');
		}
		if(totalSP>0)
		{
			totalPendingLabel.push(totalSP.toFixed(3) + ' SP');
		}
		if(totalSteem>0)
		{
			totalPendingLabel.push(totalSteem.toFixed(3) + ' STEEM');
		}
		if(totalPendingLabel.length > 0)
			$('.container-rewards').find('.row').prepend('<span class="col-2 total-pending-label">Total</span><span class="col-9 total-pending-label">' + totalPendingLabel.join(', ') + '</span>');
	}

	$('.Rewards').show();
	$('.RewardsTabLoading').hide();
}
