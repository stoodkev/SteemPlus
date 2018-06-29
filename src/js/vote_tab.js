
  var token_vote_tab=null;
  var aut=null;
  var rewardBalanceVoteTab=null;
  var recentClaimsVoteTab=null;
  var steemPriceVoteTab=null;
  var voteTabStarted=false;

  var isSteemit=null;
  var isBusy=null;

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to=='vote_tab'){
      aut=request.data.user;
      if(request.order==='start'&&token_vote_tab==null)
      {
        token_vote_tab=request.token;
        rewardBalanceVoteTab=request.data.rewardBalance;
        recentClaimsVoteTab=request.data.recentClaims;
        steemPriceVoteTab=request.data.steemPrice;
        startVotesTab();
        voteTabStarted=true;
      }
      else if(request.order==='click'&&token_vote_tab==request.token)
      {
        rewardBalanceVoteTab=request.data.rewardBalance;
        recentClaimsVoteTab=request.data.recentClaims;
        steemPriceVoteTab=request.data.steemPrice;
        startVotesTab();
      }
      else if(request.order==='notif'&&token_vote_tab==request.token)
      {
        rewardBalanceVoteTab=request.data.rewardBalance;
        recentClaimsVoteTab=request.data.recentClaims;
        steemPriceVoteTab=request.data.steemPrice;
        
        if(voteTabStarted)
        {
          startVotesTab();
        }
      }
    }
  });

  function startVotesTab(){
    if(regexBlogSteemit.test(window.location.href))
    {
      window.SteemPlus.Tabs.createTab({
        id: 'votes',
        title: 'Votes',
        enabled: true,
        createTab: createVotesTab
      });
      if(window.location.href.includes('#votes'))
        window.SteemPlus.Tabs.showTab('votes');
    }
    else if(regexBlogBusy.test(window.location.href))
    {
      window.SteemPlus.Tabs.createTab({
        id: 'votes',
        title: 'Votes',
        enabled: true,
        createTab: createVotesTab
      });
      if(window.location.href.includes('#votes'))
        window.SteemPlus.Tabs.showTab('votes');
    }
    
  }


  function createVotesTab(votesTab) {
    votesTab.html('<div class="row"><div class="feed-layout container">\
       <div class="UserProfile__tab_content UserProfile__tab_content_smi layout-list UserProfile__tab_content_VotesTab column">\
          <article class="articles">\
          <div class="VotesTab" style="display: none;">\
             <div class="row">\
                <div class="column small-12">\
                  <h1 class="articles__h1" style="margin-bottom:20px">\
                    Votes History\
                  </h1>\
                    <hr class="articles__hr">\
                  <div class="switch-field" style="margin-bottom: -4px; ">\
                    <input type="radio" id="votes-history-type-incoming" name="votes-history-type" class="votes-history-type" value="0" checked/>\
                    <label for="votes-history-type-incoming" class="votes-history-type">Incoming</label>\
                    <input type="radio" id="votes-history-type-outgoing" name="votes-history-type" class="votes-history-type" value="1" />\
                    <label for="votes-history-type-outgoing" class="votes-history-type">Outgoing</label>\
                    <input type="radio" id="votes-history-type-both" name="votes-history-type" class="votes-history-type" value="2" />\
                    <label for="votes-history-type-both" class="votes-history-type">Both</label>\
                  </div>\
                  <div class="votes-container show-incoming" style="margin-top:30px">\
                  </div>\
                </div>\
             </div>\
          </div>\
          <center class="VotesTabLoading">\
             <div class="LoadingIndicator circle">\
                <div></div>\
             </div>\
          </center>\
          <center class="VotesTabLoadMore" style="display: none;">\
             <button>\
              Load more... \
            </button>\
          </center>\
          <article/>\
       </div>\
    </div></div>');

    votesTab.find('.VotesTabLoadMore button').on('click', function(){
      var loadMore = $(this).parent();
      loadMore.hide();
      votesTab.find('.VotesTabLoading').show();
      var from = parseInt(loadMore.data('from'), 10);
      getVotes(votesTab, window.SteemPlus.Utils.getPageAccountName(), from);
    });

    votesTab.find('.votes-history-type').on('change', function(e) {
      if(isBusy)
      {
        votesTab.find('.votes-history-type:checked').prop('checked', false);
        $(this).prop('checked', true);
      }
      var v = $(e.target).val();
      var container = votesTab.find('.votes-container');
      if(v == 1){
        container.removeClass('show-incoming');
        container.addClass('show-outgoing');
      }else if(v == 2){
        container.addClass('show-incoming');
        container.addClass('show-outgoing');
      }else{
        container.addClass('show-incoming');
        container.removeClass('show-outgoing');
      }
    });

    getVotes(votesTab, window.SteemPlus.Utils.getPageAccountName());
  };


  function createVoteEl(tx) {
    var voter = tx.op[1].voter;
    var author = tx.op[1].author;
    var permlink = tx.op[1].permlink;
    var weight = Math.round(tx.op[1].weight / 100);
    var timestamp = tx.timestamp + 'Z';
    var date = new Date(timestamp);
    var mdate = moment(date);
    var timeagoTitle = mdate.format();
    var timeago = mdate.fromNow();

    var verb = weight >= 0 ? 'upvoted' : 'downvoted';
    var voteType = '';

    var pageAccountName = window.SteemPlus.Utils.getPageAccountName();
    if(author === pageAccountName && voter !== pageAccountName){
      voteType = 'vote-incoming';
    }else if(author !== pageAccountName && voter === pageAccountName) {
      voteType = 'vote-outgoing';
    }

    var el = $('<div class="vote ' + voteType + '">\
      <a class="smi-navigate" href="/@' + voter + '">\
        <img class="Userpic" src="https://img.busy.org/@' + voter + '?s=48" alt="' + voter + '">\
      </a>\
      <div class="vote-info">\
        <span class="action">\
          <a class="account" class="smi-navigate" href="/@' + voter + '">' + voter + '</a>\
          ' + verb + ' \
          <a class="smi-vote-permlink" target="_blank" href="/@' + author + '/' + permlink + '" title="@' + author + '/' + permlink + '">@' + author + '/' + permlink + '</a>\
        </span>\
        <span class="timeago" title="' + timeagoTitle + '">' + timeago + '</span>\
        <span class="vote-weight" data-weight="' + tx.op[1].weight + '">\
          Weight: ' + weight + '%\
          <span class="vote-dollar"></span>\
        </span>\
      </div>\
    </div>');

    return el;
  };

  function getVotes(votesTab, name, fromOrNull) {
    window.SteemPlus.Utils.getUserHistory(name, fromOrNull, function(err, result){
      if(!result){
        return; //TODO: error
      }
      var uniqueCommentTargets = {};
      for (var i = result.length - 1; i >= 0; i--) {
        var tx = result[i][1];
        if(tx && tx.op && tx.op[0] === 'vote'){
          var voter = tx.op[1].voter;
          var author = tx.op[1].author;
          var permlink = tx.op[1].permlink;
          var uniqueId = author + '__' + permlink;
          uniqueCommentTargets[uniqueId] = uniqueCommentTargets[uniqueId] || {
            author: author,
            permlink: permlink,
            voteEls: {}
          };
          var voteEl = createVoteEl(tx);
          uniqueCommentTargets[uniqueId].voteEls[voter] = uniqueCommentTargets[uniqueId].voteEls[voter] || [];
          uniqueCommentTargets[uniqueId].voteEls[voter].push(voteEl);
          votesTab.find('.votes-container').append(voteEl);
        }
      }
      votesTab.find('.VotesTabLoading').hide();
      votesTab.find('.VotesTab').show();
      if(result[0][0] > 0){
        var from = result[0][0] - 1;
        var loadMore = votesTab.find('.VotesTabLoadMore');
        loadMore.data('from', from);
        loadMore.show();
      }
      _.each(uniqueCommentTargets, function(target){
        window.SteemPlus.Utils.getContent(target.author, target.permlink, rewardBalanceVoteTab, recentClaimsVoteTab, steemPriceVoteTab, function(err, result){
          if(!result){
            return;
          }
          _.each(result.active_votes, function(vote) {
            var voter = vote.voter;
            var weight = vote.percent;
            var voteDollar = vote.voteDollar;
            if(typeof voteDollar !== 'undefined'){
              var voteEls = target.voteEls[voter];
              _.each(voteEls, function(voteEl) {
                var thisWeight = voteEl.find('.vote-weight').data('weight');
                if(thisWeight == 0){
                  vd = 0;
                }else{
                  vd = voteDollar * thisWeight / weight;
                }
                voteEl.find('.vote-dollar').text(' ≈ ' + vd.toFixed(2) + '$');
              });
            }
          });
        });
      });
    });
  };
