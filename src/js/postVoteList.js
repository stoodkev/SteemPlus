/**
 * Created by quent on 02/09/2018..
 */

var created_post_vote_list = false;
var token_post_vote_list = null;
var aut = null;
var rewardBalancePostVoteList = null;
var recentClaimsPostVoteList = null;
var steemPricePostVoteList = null;
var postVoteListStarted = false;
let total_value;
// Listener on message to start the function
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.to == "post_votes_list") {
    aut = request.data.user;
    if (request.order === "start" && token_post_vote_list == null) {
      postVoteListStarted = true;
      token_post_vote_list = request.token;
      rewardBalancePostVoteList = request.data.rewardBalance;
      recentClaimsPostVoteList = request.data.recentClaims;
      steemPricePostVoteList = request.data.steemPrice;
      startPostVoteList();
      postVoteListStarted = true;
    } else if (
      request.order === "click" &&
      token_post_vote_list == request.token
    ) {
      rewardBalancePostVoteList = request.data.rewardBalance;
      recentClaimsPostVoteList = request.data.recentClaims;
      steemPricePostVoteList = request.data.steemPrice;

      startPostVoteList();
    } else if (
      request.order === "notif" &&
      token_post_vote_list == request.token
    ) {
      // Notification of new steem price
      rewardBalancePostVoteList = request.data.rewardBalance;
      recentClaimsPostVoteList = request.data.recentClaims;
      steemPricePostVoteList = request.data.steemPrice;

      if (postVoteListStarted) startPostVoteList();
    }
  }
});

// Function used to start the feature
// No parameters
function startPostVoteList() {
  // Check URL. Here we need a post
  if (regexPostSteemit.test(window.location.href)) {
    // Bind every html element to a click
    $("div.Voting__voters_list").click(function() {
      console.log("open list vote");
      total_value = parseFloat(
        $(this)
          .prev(".Voting__inner")
          .find(".integer")
          .html() +
          $(this)
            .prev(".Voting__inner")
            .find(".decimal")
            .html()
      );
      var votersButton = $(this);
      setTimeout(function() {
        if (votersButton.hasClass("show")) {
          var ul = votersButton
            .parent()
            .find(".Voting__voters_list > ul.VerticalMenu");
          addPostVoteList(ul);
        }
      }, 100);
    });
  }
}

// Function used to add the new post vote list
// @parameter votersList : list of all the people who has voted for the selected comment (comment could be a post or a real comment)
function addPostVoteList(votersList) {
  //var votersList = e.state;
  if (!votersList.hasClass("smi-voting-info-shown")) {
    var author;
    var permlink;

    var hentry = votersList.closest(".hentry");
    var hrefA = hentry.length && hentry.find(".PostFull__responses a");
    if (hrefA.length) {
      var url = hrefA.attr("href");
      var match = url.match(/\/[^\/]*\/@([^\/]*)\/(.*)$/);
      author = match[1];
      permlink = match[2];
    } else if (
      hentry.is("article") ||
      votersList.closest(".smi-post-footer-wrapper-2").length
    ) {
      var url = window.location.pathname;
      var match = url.match(/\/[^\/]*\/@([^\/]*)\/(.*)$/);
      author = match[1];
      permlink = match[2];
    } else {
      var id = hentry.attr("id");
      var match = id.match(/\#@([^\/]*)\/(.*)$/);
      author = match[1];
      permlink = match[2];
    }
    if (!author || !permlink) {
      return;
    }

    votersList.addClass("smi-voting-info-shown");
    var moreButtonLi;
    var voteElsByVoter = {};

    // prevent page scroll if mouse is no top of the list
    votersList.bind("mousewheel DOMMouseScroll", function(e) {
      var delta =
          e.wheelDelta ||
          (e.originalEvent && e.originalEvent.wheelDelta) ||
          -e.detail,
        bottomOverflow =
          this.scrollTop + $(this).outerHeight() - this.scrollHeight >= 0,
        topOverflow = this.scrollTop <= 0;

      if ((delta < 0 && bottomOverflow) || (delta > 0 && topOverflow)) {
        e.preventDefault();
      }
    });

    votersList.children().each(function() {
      var li = $(this);
      if (!li.has("a").length) {
        moreButtonLi = li;
        return;
      }
      var voteWeigth = $('<span class="vote-weight"></span>');
      var voteDollar = $('<span class="vote-dollar"></span>');
      li.append(voteWeigth);
      li.append(voteDollar);

      var href = li.find("a").attr("href");
      // li.attr("class", "vote-info");
      var voter = href.substring(2);

      voteElsByVoter[voter] = voteElsByVoter[voter] || [];
      voteElsByVoter[voter].push(li);
    });
    getSteemContent(author, permlink, function(err, result) {
      if (!result) {
        return;
      }
      var newElCount = 0;
      var active_votes = _.sortBy(result.active_votes, function(v) {
        return -Math.abs(parseInt(v.rshares));
      });
      console.log("a", result, active_votes);
      _.each(active_votes, function(vote) {
        var voter = vote.voter;
        var voteDollar = vote.voteDollar;
        var votePercent = Math.round(vote.percent / 100);
        if (typeof voteDollar !== "undefined") {
          var voteEls = voteElsByVoter[voter] || [];
          if (!voteEls.length) {
            var newEl = $(
              "<li>" +
                '<a class="smi-navigate" href="/@' +
                voter +
                '">' +
                (votePercent >= 0 ? "+" : "-") +
                " " +
                voter +
                "</a>" +
                '<span class="vote-weight"></span>' +
                '<span class="vote-dollar"></span>' +
                "</li>"
            );
            votersList.append(newEl);
            newElCount++;
            voteEls.push(newEl);
          }
          //else
          _.each(voteEls, function(voteEl) {
            voteEl.find(".vote-weight").text(votePercent + "%");
            voteEl
              .find(".vote-dollar")
              .text("≈ " + voteDollar.toFixed(2) + "$");
          });
        }
      });
      if (newElCount && moreButtonLi) {
        moreButtonLi.remove();
      }
    });
  }
}

// Function used to calculate every value
// @parameter Author : author of the comment or post
// @parameter permlink : permlink of the comment or post
// @parameter cb : callback
function getSteemContent(Author, permlink, cb) {
  steem.api.getContent(Author, permlink, function(err, result) {
    if (result) {
      if (result.last_payout === "1970-01-01T00:00:00") {
        //not paid out yet!
        const total_rshares = result.active_votes.reduce(
          (acc, e) => acc + parseInt(e.rshares),
          0
        );
        _.each(result.active_votes, function(vote) {
          var voter = vote.voter;
          var rshares = vote.rshares;
          var voteValue = (total_value / total_rshares) * rshares;
          //((rshares * rewardBalancePostVoteList) / recentClaimsPostVoteList) *
          //steemPricePostVoteList;
          if (typeof voteValue !== "undefined") {
            vote.voteDollar = voteValue;
          }
        });
      } else {
        //already paid out
        var totalShares = 0;
        _.each(result.active_votes, function(vote) {
          var rshares = vote.rshares;
          totalShares += parseInt(rshares, 10);
        });
        var totalDollars =
          parseFloat(result.total_payout_value.replace(" SBD", "")) +
          parseFloat(result.curator_payout_value.replace(" SBD", ""));
        if (totalDollars <= 0) {
          totalDollars = 0;
          totalShares = 1;
        }
        _.each(result.active_votes, function(vote) {
          var voter = vote.voter;
          var rshares = vote.rshares;
          var voteValue = (totalDollars * rshares) / totalShares;
          vote.voteDollar = voteValue;
        });
      }
    }
    cb(err, result);
  });
}
