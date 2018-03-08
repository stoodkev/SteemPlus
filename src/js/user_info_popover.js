var token_user_info_popover=null;
var rewardBalance=null;
var recentClaims=null;
var steemPrice=null;
var votePowerReserveRate=null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to==='user_info_popover'&&request.order==='start'&&token_user_info_popover==null)
    {
      	if($('.UserProfile__banner').length === 0)
      		return;
		
      	token_user_info_popover=request.token;
		rewardBalance=request.data.rewardBalance;
		recentClaims=request.data.recentClaims;;
		steemPrice=request.data.steemPrice;;
		votePowerReserveRate=request.data.votePowerReserveRate;;
      	var userNameRegEx = /^.*@([a-z][a-z0-9\-]+[a-z0-9])\/*/;

  	  	var userName = window.location.href.match(userNameRegEx)[1];
      	displayPopover(userName);
    }
});


function displayPopover(userName){

	window.SteemPlus.Utils.getAccounts([userName], function(err, result){
		if($('.UserProfile__banner').hasClass('smi-profile-banner-1')){
		  return;
		}
		$('.UserProfile__banner').addClass('smi-profile-banner-1');
		Promise.all([window.SteemPlus.Utils.getVotingPowerPerAccount(result[0]), window.SteemPlus.Utils.getVotingDollarsPerAccount(100, result[0], rewardBalance, recentClaims, steemPrice, votePowerReserveRate)])
		.then(function(values) {
 			
			
 			var pop=document.createElement('a');
		    pop.style.cursor='pointer';
		    pop.id='popover';
			var img=document.createElement('img');
			img.src=chrome.extension.getURL("src/img/info.png");
			pop.append(img);
      
      
      $('.wrapper > h1').append(pop);

			var reputation = window.SteemPlus.Utils.getReputation(result[0].reputation, 2);
			$('.UserProfile__rep').text('(' + reputation + ')');
			
			var title='<h5>User Informations</h5>';
			var votingPower = values[0]/100;
			var votingDollars = values[1];

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

				fullInString =  (fullInDays===0 ? '' : fullInDays + ' days ') +
				 				(fullInHours===0 ? '' : fullInHours + ' hours ') +
				 				(fullInMinutes===0 ? '' : fullInMinutes + ' minutes');
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
	    $('[data-toggle="popover"]').popover();

		});

		

    


	});
}