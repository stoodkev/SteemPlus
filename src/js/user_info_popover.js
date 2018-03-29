var token_user_info_popover=null;
var rewardBalanceUIP=null;
var recentClaimsUIP=null;
var steemPriceUIP=null;
var votePowerReserveRateUIP=null;
var userNameRegEx = /^.*@([a-z][a-z0-9.\-]+[a-z0-9])\/*/;
var userInfoPopoverStarted=false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to==='user_info_popover') console.log(request);
    if(request.to==='user_info_popover'&&request.order==='start'&&token_user_info_popover==null)
    {
      	token_user_info_popover=request.token;
		    rewardBalanceUIP=request.data.rewardBalance;
		    recentClaimsUIP=request.data.recentClaims;
		    steemPriceUIP=request.data.steemPrice;
		    votePowerReserveRateUIP=request.data.votePowerReserveRate;
        checkUserForInfoPopover();
        userInfoPopoverStarted=true;
    }
    else if(request.to==='user_info_popover'&&request.order==='click'&&token_user_info_popover==request.token)
    {
        rewardBalanceUIP=request.data.rewardBalance;
        recentClaimsUIP=request.data.recentClaims;
        steemPriceUIP=request.data.steemPrice;
        votePowerReserveRateUIP=request.data.votePowerReserveRate;

      	checkUserForInfoPopover();
    }
    else if(request.to==='user_info_popover'&&request.order==='notif'&&token_user_info_popover==request.token)
    {
        rewardBalanceUIP=request.data.rewardBalance;
        recentClaimsUIP=request.data.recentClaims;
        steemPriceUIP=request.data.steemPrice;
        votePowerReserveRateUIP=request.data.votePowerReserveRate;

        if(userInfoPopoverStarted)
          checkUserForInfoPopover();
    }


});

function checkUserForInfoPopover()
{
  setTimeout(function(){

      if(window.location.href.match(userNameRegEx)!==null){
        var userName = window.location.href.match(userNameRegEx)[1];
        checkDisplayPopoverUserInfo(userName);
      }
    },100);
}

function checkDisplayPopoverUserInfo(userName)
{
  if($('.UserProfile__banner').length!==0)
    displayPopoverUserInfo(userName);
  else
    setTimeout(function() {
      checkDisplayPopoverUserInfo(userName);
    },1000);
}


function displayPopoverUserInfo(userName){
	window.SteemPlus.Utils.getAccounts([userName], function(err, result){
		if(!$('.UserProfile__banner').hasClass('smi-profile-banner-1'))
		  $('.UserProfile__banner').addClass('smi-profile-banner-1');
		Promise.all([window.SteemPlus.Utils.getVotingPowerPerAccount(result[0]), window.SteemPlus.Utils.getVotingDollarsPerAccount(100, result[0], rewardBalanceUIP, recentClaimsUIP, steemPriceUIP, votePowerReserveRateUIP)])
		.then(function(values) {
      $("#popover").remove();
 			var pop=document.createElement('a');
		    pop.style.cursor='pointer';
		    pop.id='popover';
			var img=document.createElement('img');
			img.src=chrome.extension.getURL("src/img/info.png");
			pop.append(img);

      if(window.location.href.match(userNameRegEx)[1]==userName){
        $('.UserProfile__rep').parent().after(pop);
  			var reputation = window.SteemPlus.Utils.getReputation(result[0].reputation, 2);
  			$('.UserProfile__rep').text('(' + reputation + ')');

  			var title='<h5>User Information</h5>';
  			var votingPower = values[0]/100;
  			var votingDollars = parseFloat(values[1]);
  			var fullInString = null;
  			var remainingPowerToGet = 100.0 - votingPower;
  			// 1% every 72minutes
  			var minutesNeeded = remainingPowerToGet * 72;
  			if (minutesNeeded === 0)
  			{
  				fullInString = "Already full!";
  			}
  			else
  			{
  				var fullInDays = parseInt(minutesNeeded/1440);
  				var fullInHours = parseInt((minutesNeeded - fullInDays*1440)/60);
  				var fullInMinutes = parseInt((minutesNeeded - fullInDays*1440 - fullInHours*60));

  				fullInString =  (fullInDays===0 ? '' : fullInDays + (fullInDays>1 ? ' days ' : 'day ')) +
  				 				(fullInHours===0 ? '' : fullInHours + (fullInHours>1 ? ' hours ' : 'hour ')) +
  				 				(fullInMinutes===0 ? '' : fullInMinutes + (fullInMinutes>1 ? ' minutes ' : 'minute'));
  			}





  		$('#popover').attr('data-toggle','popover');
  	    $('#popover').attr('data-content','<h5>Voting Power:  <span class="value_of">' + votingPower + '%</span>'
  	      +'</h5><hr/><h5>Voting Value:  <span class="value_of">' + votingDollars.toFixed(2) + '$</span>'
  	      +'</h5><hr/><h5>Full in:  <span class="value_of">' + fullInString + '</span>'
  	      +'</h5>');
  	    $('#popover').attr('data-placement','right');
  	    $('#popover').attr('title',title);
  	    $('#popover').attr('data-html','true');
  	    $('#popover').attr('data-trigger','hover');
  	    //$('[data-toggle="popover"]').popover();

        $('#popover').hover(function(){
          $('#popover').popover('show');
        }, function(){
          $('#popover').popover('hide');
        });
      }
  	});

  });
}
