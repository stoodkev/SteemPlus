

  var token_vote_weight_slider=null;
  var aut=null;
  var rewardBalance=null;
  var recentClaims=null;
  var steemPrice=null;
  var votePowerReserveRate=null;
  var account=null;

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to=='vote_weight_slider'){
      console.log('Starting vote_weight_slider...');
      aut=request.data.user;
      if(request.order==='start'&&token_vote_weight_slider==null)
      {
        token_vote_weight_slider=request.token;
        rewardBalance=request.data.rewardBalance;
        recentClaims=request.data.recentClaims;
        steemPrice=request.data.steemPrice;
        votePowerReserveRate=request.data.votePowerReserveRate;
        account=request.data.account;


		window.addEventListener('voting-weight-change', tryUpdateVotingSlider, false);

		
		$('.Voting__button-up').click(function(){
			tryUpdateVotingSlider();
		});
		
		console.log('vote_weight_slider ready!');
      }
    }
  });


 function updateVotingSlider(weightDisplay) {

    weightDisplay.css('margin-top', '-10px');
    var weightDollars = weightDisplay.parent().find('.voting_weight_dollars');
    if(weightDollars.length === 0){
      var weightDollars = $('<div class="voting_weight_dollars"></div>');
      weightDollars.html( window.SteemPlus.Utils.getLoadingHtml({
        text: true,
        backgroundColor: '#8a8a8a'
      }) );
      weightDisplay.after(weightDollars);
    }

    var dollars = window.SteemPlus.Utils.getVotingDollarsPerAccount(parseInt(weightDisplay.text().replace(/ /,''), 10),account, rewardBalance, recentClaims, steemPrice, votePowerReserveRate);
    if(typeof dollars === 'undefined'){
      setTimeout(function() {
        tryUpdateVotingSlider();
      }, 100);
    }else{
      weightDollars.text(dollars.toFixed(2) + '$');
    }

    var votingEl = weightDisplay.closest('.Voting');
    var flagInfo = votingEl.find('.Voting__about-flag');
    if(flagInfo.length) {
        
      var pendingPayout;
      var isComment = false;
      var reactEl = votingEl.closest('.PostSummary, .Comment, .PostFull');
      if(reactEl.is('.Comment')){
        isComment = true;
        reactEl = reactEl.find('.FormattedAsset');
        pendingPayout = parseFloat(reactEl.text().replace('$',''));
      }else if(reactEl.is('.PostFull')){
        reactEl = reactEl.find('.FormattedAsset');
        if(!reactEl.length){
          reactEl = $('.smi-post-footer-wrapper-2 .FormattedAsset');
        }
        pendingPayout = parseFloat(reactEl.text().replace('$',''));        
      }else{
        var reactObj = window.SteemPlus.Utils.findReact(reactEl[0]);
        pendingPayout = parseFloat(reactObj.props.pending_payout.replace(' SBD', ''));
      }

      voteTotal = flagInfo.find('.smi-vote-total');
      if(!voteTotal.length){
        voteTotal = $('<p class="smi-vote-total"></p>');
        flagInfo.prepend(voteTotal);
        var html = 'After your downvote the total reward for <br> this ' + (isComment ? 'comment' : 'post') + ' will be: <span class="after-downvote-total-dollar">' + window.SteemMoreInfo.Utils.getLoadingHtml({
          text: true,
          backgroundColor: '#8a8a8a'
        }) + '</span>';
        voteTotal.html(html);
      }
      var voteTotalDollars = voteTotal.find('.after-downvote-total-dollar');

      if(typeof dollars !== 'undefined'){
        var v = pendingPayout + dollars;
        voteTotalDollars.text(v.toFixed(2) + '$');
      }


    }

  };

  function tryUpdateVotingSlider() {
    var weightDisplay = $('span.Voting__button .weight-display');
    if(weightDisplay.length){
      updateVotingSlider(weightDisplay);
    }
  }
  

