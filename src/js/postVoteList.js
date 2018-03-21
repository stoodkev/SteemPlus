/**
 * Created by quent on 02/09/2018..
 */

 var created_post_vote_list=false;
 var token_post_vote_list=null;
 var aut=null;
 var rewardBalance=null;
 var recentClaims=null;
 var steemPrice=null;
 var postVoteListStarted=false;
 chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.to=='post_votes_list'){
    aut=request.data.user;
    if(request.order==='start'&&token_post_vote_list==null)
    {
      console.log("Start notified");
      postVoteListStarted=true;
      token_post_vote_list=request.token;
      rewardBalance=request.data.rewardBalance;
 	    recentClaims=request.data.recentClaims;
 	    steemPrice=request.data.steemPrice;
      startPostVoteList();
      postVoteListStarted=true;
    }
    else if(request.order==='notif'&&token_post_vote_list==request.token)
    {
      console.log("Update notified");

      rewardBalance=request.data.rewardBalance;
      recentClaims=request.data.recentClaims;
      steemPrice=request.data.steemPrice;
      
      if(postVoteListStarted)
        startPostVoteList();
    }
  }
});

function startPostVoteList(){
	// ajouter regex url post
  //if(window.location.href.match(/submit/))
	$('body').on('click', 'div.Voting__voters_list > a', function(){
		var votersButton = $(this);
		setTimeout(function() {
		  if(votersButton.parent().hasClass('show')){
		    var ul = votersButton.parent().find('ul.VerticalMenu');
		    addPostVoteList(ul);
		  }
		}, 1);
	});
}

function addPostVoteList(votersList)
{
    //var votersList = e.state;
    if(!votersList.hasClass('smi-voting-info-shown')){
      var author;
      var permlink;

      var hentry = votersList.closest('.hentry');
      var hrefA = hentry.length && hentry.find('.PostFull__responses a');
      if(hrefA.length){
        var url = hrefA.attr('href');
        var match = url.match(/\/[^\/]*\/@([^\/]*)\/(.*)$/);
        author = match[1];
        permlink = match[2];
      }else if(hentry.is('article') || votersList.closest('.smi-post-footer-wrapper-2').length){
        var url = window.location.pathname;
        var match = url.match(/\/[^\/]*\/@([^\/]*)\/(.*)$/);
        author = match[1];
        permlink = match[2];
      }else{
        var id = hentry.attr('id');
        var match = id.match(/\#@([^\/]*)\/(.*)$/);
        author = match[1];
        permlink = match[2];
      }
      if(!author || !permlink){
        return;
      }

      votersList.addClass('smi-voting-info-shown');
      var moreButtonLi;
      var voteElsByVoter = {};

      // prevent page scroll if mouse is no top of the list
      votersList.bind('mousewheel DOMMouseScroll', function (e) {
        var delta = e.wheelDelta || (e.originalEvent && e.originalEvent.wheelDelta) || -e.detail,
            bottomOverflow = this.scrollTop + $(this).outerHeight() - this.scrollHeight >= 0,
            topOverflow = this.scrollTop <= 0;

        if ((delta < 0 && bottomOverflow) || (delta > 0 && topOverflow)) {
            e.preventDefault();
        }
      });

      votersList.children().each(function(){
        var li = $(this);
        if(!li.has('a').length){
          moreButtonLi = li;
          return;
        }
        var voteWeigth = $('<span class="vote-weight"></span>');
        var voteDollar = $('<span class="vote-dollar"></span>');
        li.append(voteWeigth);
        li.append(voteDollar);

        var href = li.find('a').attr('href');
        // li.attr("class", "vote-info");
        var voter = href.substring(2);

        voteElsByVoter[voter] = voteElsByVoter[voter] || [];
        voteElsByVoter[voter].push(li);


      });
      console.log(voteElsByVoter);

      getSteemContent(author, permlink, function(err, result){
        if(!result){
          	return;
        }
        var newElCount = 0;
        var active_votes = _.sortBy(result.active_votes, function(v){
          return -Math.abs(parseInt(v.rshares));
        });
        _.each(active_votes, function(vote) {
          var voter = vote.voter;
          var voteDollar = vote.voteDollar;
          var votePercent = Math.round(vote.percent / 100);
          if(typeof voteDollar !== 'undefined'){
            var voteEls = voteElsByVoter[voter] || [];
            if(!voteEls.length){
              var newEl = $('<li>' +
                '<a class="smi-navigate" href="/@' + voter + '">' +
                (votePercent >= 0 ? '+' : '-') + ' ' + voter +
                '</a>' +
                '<span class="vote-weight"></span>' +
                '<span class="vote-dollar"></span>' +
                '</li>');
              votersList.append(newEl);
              newElCount++;
              voteEls.push(newEl);
            }
            //else
            _.each(voteEls, function(voteEl) {
              voteEl.find('.vote-weight').text(votePercent + '%');
              voteEl.find('.vote-dollar').text('≈ ' + voteDollar.toFixed(2) + '$');
            });
          }
        });
        if(newElCount && moreButtonLi){
          moreButtonLi.remove();
        }
      });

    }
}

function getSteemContent(Author, permlink, cb)
{
	steem.api.getContent(Author, permlink, function(err, result){
      if(result){
        if(result.last_payout === '1970-01-01T00:00:00'){
          //not paid out yet!
          _.each(result.active_votes, function(vote) {
            var voter = vote.voter;
            var rshares = vote.rshares;
            var voteValue = rshares * rewardBalance / recentClaims * steemPrice;
            if(typeof voteValue !== 'undefined') {
              vote.voteDollar = voteValue;
            }
          });
        }else{
          //already paid out
          var totalShares = 0;
          _.each(result.active_votes, function(vote) {
            var rshares = vote.rshares;
            totalShares += parseInt(rshares, 10);
          });
          var totalDollars = parseFloat(result.total_payout_value.replace(" SBD", "")) + parseFloat(result.curator_payout_value.replace(" SBD", ""));
          if(totalDollars <= 0){
            totalDollars = 0;
            totalShares = 1;
          }
          _.each(result.active_votes, function(vote) {
            var voter = vote.voter;
            var rshares = vote.rshares;
            var voteValue = totalDollars * rshares / totalShares;
            vote.voteDollar = voteValue;
          });
        }
      }
      cb(err, result);
    });
}
