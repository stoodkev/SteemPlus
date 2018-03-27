(function () {


  var STEEMIT_100_PERCENT = 10000;
  var STEEMIT_VOTE_REGENERATION_SECONDS = (5*60*60*24); // 5 day

  var pageAccountNameRegexp = /^\/@([a-z0-9\-\.]*)([\/\#].*)?$/;
  var domCheckTimeout = 100;

  const noImageAvailable = "src/img/no-image-available-hi.png";

  var getPageAccountName = function() {
    var parseLocation = window.location.pathname.match(pageAccountNameRegexp);
    if(!parseLocation){
      return;
    }
    if(parseLocation[2] && parseLocation[2].startsWith('/feed')){
      return;
    }
    return parseLocation[1];
  };

  var getLoggedUserName = function() {
    var url = $('.Header__userpic a').attr('href');
    if(!url){
      return null;
    }
    return url.substring(2);
  };

  var getUserProfileBannerForAccountName = function(accountName, cb) {
    var name = getPageAccountName();
    if(name != accountName){
      return;
    }
    var banner = $('.UserProfile__banner');
    if(banner && banner.length){
      cb(banner);
    }else{
      setTimeout(function() {
        getUserProfileBannerForAccountName(accountName, cb);
      }, domCheckTimeout);
    }
  };


  var getUserTopMenusForAccountName = function(accountName, cb) {
    var name = getPageAccountName();
    if(name != accountName){
      return;
    }
    var menus = $('.UserProfile__top-menu ul.menu');
    if(menus && menus.length && menus.eq(0).find('li:eq(0) a').attr('href') === '/@' + accountName){
      cb(menus);
    }else{
      setTimeout(function() {
        getUserTopMenusForAccountName(accountName, cb);
      }, domCheckTimeout);
    }
  };


  var steemPrice;
  var rewardBalance;
  var recentClaims;
  var currentUserAccount;
  var votePowerReserveRate;
  var totalVestingFund;
  var totalVestingShares;
  function updateSteemVariables() {
    steem.api.getRewardFund("post", function(e, t) {
      rewardBalance = parseFloat(t.reward_balance.replace(" STEEM", ""));
      recentClaims = t.recent_claims;
    });
    steem.api.getCurrentMedianHistoryPrice(function(e, t) {
      steemPrice = parseFloat(t.base.replace(" SBD", "")) / parseFloat(t.quote.replace(" STEEM", ""));
    });
    steem.api.getDynamicGlobalProperties(function(e, t){
      votePowerReserveRate = t.vote_power_reserve_rate;
      totalVestingFund = parseFloat(t.total_vesting_fund_steem.replace(" STEEM", ""));
      totalVestingShares = parseFloat(t.total_vesting_shares.replace(" VESTS", ""));
    });

    var loggedUserName = getLoggedUserName();
    if(loggedUserName){
      var _loggedUserName = loggedUserName;
      steem.api.getAccounts([loggedUserName], function(err, result){
        if(getLoggedUserName() == _loggedUserName){
          currentUserAccount = result[0];
        }
      });
    }else{
      currentUserAccount = null;
    }
    setTimeout(updateSteemVariables, 180 * 1000)
  }
  //updateSteemVariables();

  var getVotingDollarsPerShares = function(rshares) {
    if(rewardBalance && recentClaims && steemPrice){
      var voteValue = rshares
        * rewardBalance / recentClaims
        * steemPrice;

      return voteValue;
    }
  };

  var getVotingDollarsPerShares = function(rshares, rewardBalance, recentClaims, steemPrice) {
    if(rewardBalance && recentClaims && steemPrice){
      var voteValue = rshares
        * rewardBalance / recentClaims
        * steemPrice;

      return voteValue;
    }
  };


  var getVotingPowerPerAccount = function(account) {
      var voting_power = account.voting_power;
      var last_vote_time = new Date((account.last_vote_time) + 'Z');
      var elapsed_seconds = (new Date() - last_vote_time) / 1000;
      var regenerated_power = Math.round((STEEMIT_100_PERCENT * elapsed_seconds) / STEEMIT_VOTE_REGENERATION_SECONDS);
      var current_power = Math.min(voting_power + regenerated_power, STEEMIT_100_PERCENT);
      return current_power;
  };

  var getEffectiveVestingSharesPerAccount = function(account) {
    var effective_vesting_shares = parseFloat(account.vesting_shares.replace(" VESTS", ""))
      + parseFloat(account.received_vesting_shares.replace(" VESTS", ""))
      - parseFloat(account.delegated_vesting_shares.replace(" VESTS", ""));
    return effective_vesting_shares;
  };

  var getSteemPowerPerAccount = function(account, totalVestingFund, totalVestingShares) {
    if(totalVestingFund && totalVestingShares){
      var vesting_shares = getEffectiveVestingSharesPerAccount(account);
      var sp = steem.formatter.vestToSteem(vesting_shares, totalVestingShares, totalVestingFund);
      return sp;
    }
  };


  var getVotingDollarsPerAccount = function(voteWeight, account, rewardBalance, recentClaims, steemPrice, votePowerReserveRate) {

    if(!account){
      account = currentUserAccount;
    }
    if(!account){
      return;
    }

    if(rewardBalance && recentClaims && steemPrice && votePowerReserveRate){
      var effective_vesting_shares = Math.round(getEffectiveVestingSharesPerAccount(account) * 1000000);
      var voting_power = account.voting_power;
      var weight = voteWeight * 100;
      var last_vote_time = new Date((account.last_vote_time) + 'Z');


      var elapsed_seconds = (new Date() - last_vote_time) / 1000;
      var regenerated_power = Math.round((STEEMIT_100_PERCENT * elapsed_seconds) / STEEMIT_VOTE_REGENERATION_SECONDS);
      var current_power = Math.min(voting_power + regenerated_power, STEEMIT_100_PERCENT);
      var max_vote_denom = votePowerReserveRate * STEEMIT_VOTE_REGENERATION_SECONDS / (60*60*24);
      var used_power = Math.round((current_power * weight) / STEEMIT_100_PERCENT);
      used_power =  Math.round((used_power + max_vote_denom - 1) / max_vote_denom);

      var rshares = Math.round((effective_vesting_shares * used_power) / (STEEMIT_100_PERCENT))


      var voteValue = rshares
        * rewardBalance / recentClaims
        * steemPrice;


      return voteValue;

    }
  };


  var getUserHistory = function(accountName, from, cb) {
    if(!accountName){
      return;
    }
    var from = from || -1; // the index of the last transaction / -1 for last transaction
    var maxVotes = 100;
    var to = from === -1 ? maxVotes : Math.min(maxVotes, from); // number of transactions to get other than the last one... 2 -> 3 transactions
    steem.api.getAccountHistory(accountName, from, to, function(err, result) {
      cb(err, result);
    });
  };

  var getActiveVotes = function(author, permlink, cb){
    steem.api.getActiveVotes(author, permlink, cb);
  };

  var getContent = function(author, permlink, rewardBalance, recentClaims, steemPrice, cb){
    steem.api.getContent(author, permlink, function(err, result){
      if(result){
        if(result.last_payout === '1970-01-01T00:00:00'){
          //not paid out yet!
          _.each(result.active_votes, function(vote) {
            var voter = vote.voter;
            var rshares = vote.rshares;
            var voteValue = window.SteemPlus.Utils.getVotingDollarsPerShares(rshares, rewardBalance, recentClaims, steemPrice);
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
  };


  var getBlog = function(name, start, length, cb){
    steem.api.getBlog(name, start, length, cb);
  };

  var getAccounts = function(names, cb){
    steem.api.getAccounts(names, cb);
  };

  var getAccountVotes = function(name, cb){
    steem.api.getAccountVotes(name, cb);
  }


  var getLoadingHtml = function(options) {
    var divClass = 'smi-spinner';
    var style = '';
    var bounceStyle = '';
    if(options && options.text){
      divClass += ' smi-spinner-text';
    }
    if(options && options.center){
      divClass += ' smi-spinner-center';
    }
    if(options && options.style){
      style = options.style;
    }
    if(options && options.backgroundColor){
      bounceStyle += 'background-color: ' + options.backgroundColor + ';';
    }
    return '<div class="' + divClass + '" style="' + style + '"><div class="smi-bounce1" style="' + bounceStyle + '"></div><div class="smi-bounce2" style="' + bounceStyle + '"></div><div class="smi-bounce3" style="' + bounceStyle + '"></div></div>';
  };


  var createPostSummary_remarkable = new Remarkable({ html: true, linkify: false })

  var createPostSummary = function(post, options, rewardBalance, recentClaims, steemPrice) {
    var author = post.author;
    var permlink = post.permlink;
    var category = post.category;
    var descr = window.SteemPlus.Sanitize.postBodyShort(post.body);
    var title = post.title;
    var url = `@${author}/${permlink}`;
    if(post.parent_author){ //comment
      title = title || ('RE: ' + post.root_title);
      url = `@${post.parent_author}/${post.parent_permlink}#` + url;
    }

    url = (category ? `/${category}/` : '/') + url;

    var imgUrl = null;
    var imgUrl2 = null;
    var displayedImageUrl = null;

    try{
      var json_metadata = (typeof post.json_metadata === 'object' ? post.json_metadata : JSON.parse(post.json_metadata));
      if(typeof json_metadata == 'string') {
          // At least one case where jsonMetadata was double-encoded: #895
          json_metadata = JSON.parse(json_metadata)
      }
      if(json_metadata && json_metadata.image && Array.isArray(json_metadata.image)){
        imgUrl = json_metadata.image[0] || null;
      }
    }catch(err){
    }

    // If nothing found in json metadata, parse body and check images/links
    if(!imgUrl) {
        var isHtml = /^<html>([\S\s]*)<\/html>$/.test(post.body)
        var htmlText = isHtml ? post.body : createPostSummary_remarkable.render(post.body.replace(/<!--([\s\S]+?)(-->|$)/g, '(html comment removed: $1)'))
        var rtags = HtmlReady(htmlText, {mutate: false})
        if(rtags.images == undefined || rtags.images === undefined )
        {
          var imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/g;
          var match = imgRegex.exec(post.body);

          if(match !== null)
          {
            imgUrl2 = match[1];
          }
          else
          {
            var mdRegex = /!\[.*\]\((.*)\)/g;
            match = mdRegex.exec(post.body);
            if(match!=null)
              imgUrl2 = match[1];
          }
        }
        else
          imgUrl2 = Array.from(rtags.images)[0];
    }

    var hasImage = true;
    if( (imgUrl === null || imgUrl === undefined ) && (imgUrl2 === null || imgUrl2 === undefined ) )
    {
      displayedImageUrl = chrome.extension.getURL(noImageAvailable);
      hasImage = false;
    }
    else
    {
      displayedImageUrl = ( imgUrl !== null && imgUrl !== undefined ) ? '\'https://steemitimages.com/256x512/' + encodeURI(imgUrl) + '\'' : '\'https://steemitimages.com/256x512/' + imgUrl2 + '\'';
    }


    var date = moment(post.created + 'Z');
    if(!date.isValid()){
      date = moment(post.created);
    }
    var dateString = date.format('DD/MM/YYYY hh:mm A');
    var dateString2 = date.fromNow();

    var votes = post.net_votes;
    var comments = post.children;

    var dollars;
    var dollarsAuthor;
    var dollarsCurators;

    var last_payout = post.last_payout;
    var cashout_time, payoutDateString, payoutDateString2;
    if(last_payout === '1970-01-01T00:00:00' || last_payout === 'Thu, 01 Jan 1970 00:00:00 GMT'){
      var cashout_time = moment(post.cashout_time + 'Z');
      if(!cashout_time.isValid()){
        cashout_time = moment(post.cashout_time);
      }

      payoutDateString = cashout_time.format('DD/MM/YYYY hh:mm A');
      payoutDateString2 = cashout_time.fromNow();

      // absRshare = parseFloat(post.abs_rshares);
      // var rshare = post.total_vote_weight < 0 ? -absRshare : absRshare;
      var rshare = parseFloat(post.net_rshares);

      var dollars = window.SteemPlus.Utils.getVotingDollarsPerShares(rshare, rewardBalance, recentClaims, steemPrice);
      if(typeof dollars === 'undefined'){
        dollars = '?.??';
      }else{
        dollars = '' + dollars.toFixed(2);
      }
    }else{
      var total_payout_value = typeof post.total_payout_value === 'object' ? post.total_payout_value.amount : parseFloat(post.total_payout_value.replace(' SBD', ''));
      var curator_payout_value = typeof post.curator_payout_value === 'object' ? post.curator_payout_value.amount : parseFloat(post.curator_payout_value.replace(' SBD', ''));
      dollarsAuthor = (total_payout_value==undefined ? parseInt(post.total_payout_value[0])/1000 : total_payout_value);
      dollarsCurators = (total_payout_value==undefined ? parseInt(post.curator_payout_value[0])/1000 : curator_payout_value);
      dollars = dollarsAuthor + dollarsCurators;
      dollars = '' + dollars.toFixed(2);
      dollarsCurators = '' + dollarsCurators.toFixed(2);
      dollarsAuthor = '' + dollarsAuthor.toFixed(2);
    }

    var dsplit = dollars.split('.');
    var dollarsInteger = dsplit[0];
    var dollarsDecimal = dsplit[1];

    var isRepost = options && options.accountName && options.accountName !== author;

    var vcard = '<span class="vcard">\
      <a href="' + url + '">\
        <span title="' + dateString + '" class="updated"><span>' + dateString2 + '</span></span>\
      </a>\
      by\
      <span class="author" itemprop="author" itemscope="" itemtype="http://schema.org/Person">\
        <strong>\
          <a href="/@' + author + '">' + author + '</a>\
        </strong>' +
        // don't know the reputation :(
        // '<span class="Reputation" title="Reputation">' + reputation + '</span>' +
      '</span>\
      in\
      <strong>\
        <a href="/trending/' + category + '">' + category + '</a>\
      </strong>\
    </span>';

    var el = $('<li>\
      <article class="PostSummary hentry' + (hasImage ? ' with-image' : '') + '" itemscope="" itemtype="http://schema.org/blogPost">' +
        (isRepost ? '<div class="PostSummary__reblogged_by">\
          <span class="Icon reblog" style="display: inline-block; width: 1.12rem; height: 1.12rem;">\
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path d="M448,192l-128,96v-64H128v128h248c4.4,0,8,3.6,8,8v48c0,4.4-3.6,8-8,8H72c-4.4,0-8-3.6-8-8V168c0-4.4,3.6-8,8-8h248V96 L448,192z"></path></svg>\
          </span>\
          Resteemed\
        </div>' : '') +
        '<div class="PostSummary__header show-for-small-only">\
          <h3 class="entry-title">\
            <a href="' + url + '">' + title + '</a>\
          </h3>\
        </div>\
        <div class="PostSummary__time_author_category_small show-for-small-only">\
          ' + vcard + '\
        </div>' +
        '<span name="imgUrl" class="PostSummary__image" style="background-image: url(' + displayedImageUrl + ');"></span>' +
        '<div class="PostSummary__content">\
          <div class="PostSummary__header show-for-medium">\
            <h3 class="entry-title">\
              <a href="' + url + '">' + title + '</a>\
            </h3>\
          </div>\
          <div class="PostSummary__body entry-content">\
            <a href="' + url + '">' + descr + '</a>\
          </div>\
          <div class="PostSummary__footer">\
            <span class="Voting">\
              <span class="Voting__inner">' +
                // can't vote.. so can't put a voting button here :(
                // '<span class="Voting__button Voting__button-up Voting__button--upvoted">\
                //   <a href="#" title="Remove Vote">\
                //     <span class="Icon chevron-up-circle" style="display: inline-block; width: 1.12rem; height: 1.12rem;">\
                //       <svg enable-background="new 0 0 33 33" version="1.1" viewBox="0 0 33 33" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Chevron_Up_Circle"><circle cx="16" cy="16" r="15" stroke="#121313" fill="none"></circle><path d="M16.699,11.293c-0.384-0.38-1.044-0.381-1.429,0l-6.999,6.899c-0.394,0.391-0.394,1.024,0,1.414 c0.395,0.391,1.034,0.391,1.429,0l6.285-6.195l6.285,6.196c0.394,0.391,1.034,0.391,1.429,0c0.394-0.391,0.394-1.024,0-1.414 L16.699,11.293z" fill="#121313"></path></g></svg>\
                //     </span>\
                //   </a>\
                // </span>' +
                '<div class="DropdownMenu">\
                  <a href="#">\
                    <span>\
                      <span class="FormattedAsset ">\
                        <span class="prefix">$</span><span class="integer">' + dollarsInteger + '</span><span class="decimal">.' + dollarsDecimal + '</span>\
                      </span>\
                      <span class="Icon dropdown-arrow" style="display: inline-block; width: 1.12rem; height: 1.12rem;">\
                        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g><polygon points="128,90 256,218 384,90"></polygon></g></svg>\
                      </span>\
                    </span>\
                  </a>' +
                  (cashout_time ?
                    '<ul class="VerticalMenu menu vertical VerticalMenu">\
                      <li>\
                        <span>\
                          Potential Payout $' + dollars + '\
                        </span>\
                      </li>\
                      <li>\
                        <span>\
                          <span title="' + payoutDateString + '">\
                            <span>' + payoutDateString2 + '</span>\
                          </span>\
                        </span>\
                      </li>\
                    </ul>'
                  :
                    '<ul class="VerticalMenu menu vertical VerticalMenu">\
                      <li>\
                        <span>\
                          Past Payouts $' + dollars + '\
                        </span>\
                      </li>\
                      <li>\
                        <span>\
                          - Author: $' + dollarsAuthor + '\
                        </span>\
                      </li>\
                      <li>\
                        <span>\
                          - Curators: $' + dollarsCurators + '\
                        </span>\
                      </li>\
                    </ul>'
                  ) +
                '</div>\
              </span>\
            </span>\
            <span class="VotesAndComments">\
              <span class="VotesAndComments__votes" title="' + votes + (votes === 1 ? ' vote' : ' votes') + '">\
                <span class="Icon chevron-up-circle Icon_1x" style="display: inline-block; width: 1.12rem; height: 1.12rem;">\
                  <svg enable-background="new 0 0 33 33" version="1.1" viewBox="0 0 33 33" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Chevron_Up_Circle"><circle cx="16" cy="16" r="15" stroke="#121313" fill="none"></circle><path d="M16.699,11.293c-0.384-0.38-1.044-0.381-1.429,0l-6.999,6.899c-0.394,0.391-0.394,1.024,0,1.414 c0.395,0.391,1.034,0.391,1.429,0l6.285-6.195l6.285,6.196c0.394,0.391,1.034,0.391,1.429,0c0.394-0.391,0.394-1.024,0-1.414 L16.699,11.293z" fill="#121313"></path></g></svg>\
                </span>\
                &nbsp;' + votes + '\
              </span>\
              <span class="VotesAndComments__comments">\
                <a title="' + comments + (comments === 1 ? ' response' : ' responses') + '. Click to respond." href="' + url + '#comments">\
                  <span class="Icon chatboxes" style="display: inline-block; width: 1.12rem; height: 1.12rem;">\
                    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" xml:space="preserve"><g><path d="M294.1,365.5c-2.6-1.8-7.2-4.5-17.5-4.5H160.5c-34.7,0-64.5-26.1-64.5-59.2V201h-1.8C67.9,201,48,221.5,48,246.5v128.9 c0,25,21.4,40.6,47.7,40.6H112v48l53.1-45c1.9-1.4,5.3-3,13.2-3h89.8c23,0,47.4-11.4,51.9-32L294.1,365.5z"></path><path d="M401,48H183.7C149,48,128,74.8,128,107.8v69.7V276c0,33.1,28,60,62.7,60h101.1c10.4,0,15,2.3,17.5,4.2L384,400v-64h17 c34.8,0,63-26.9,63-59.9V107.8C464,74.8,435.8,48,401,48z"></path></g></svg>\
                  </span>\
                  &nbsp;' + comments + '\
                </a>\
              </span>\
            </span>\
            <span class="PostSummary__time_author_category">' +
              (isRepost ? '<span class="Reblog__button Reblog__button-active">\
                <a href="#" title="Resteem">\
                  <span class="Icon reblog" style="display: inline-block; width: 1.12rem; height: 1.12rem;">\
                    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path d="M448,192l-128,96v-64H128v128h248c4.4,0,8,3.6,8,8v48c0,4.4-3.6,8-8,8H72c-4.4,0-8-3.6-8-8V168c0-4.4,3.6-8,8-8h248V96 L448,192z"></path></svg>\
                  </span>\
                </a>\
              </span>' : '') +
              '<span class="show-for-medium">\
                ' + vcard + '\
              </span>\
            </span>\
          </div>\
        </div>\
      </article>\
    </li>');

    var openPost = (options && options.openPost) || function(url) {
      var PostList = window.SteemPlus.Utils.findReact($('#posts_list')[0]);
      PostList.onPostClick(author + '/' + permlink, url);
    };

    el.find('a').on('click', function(e){
      if(e.ctrlKey || e.metaKey) {
        return;
      }
      e.preventDefault();
      var t = $(e.currentTarget);
      var href = t.attr('href');
      if(href === '#'){
        return;
      }
      openPost(href);
    });
    el.find('.PostSummary__image').on('click', function(e){
      e.preventDefault();
      openPost(url);
    });

    return el;
  };



  var navigate = function(url) {
    //hack to use react to navigate
    var a = $('.smi-hack-navigate-a');
    if(!a.length){
      a = $('<a class="smi-hack-navigate-a" style="display: none;">');
      $('.submit-story a').append(a);
    }
    a.attr('href', url);
    var event = document.createEvent("HTMLEvents");
    event.initEvent("click", true, true);
    var target = a[0];
    target.dispatchEvent(event);
  };

  $('body').on('click', 'a.smi-navigate', function(e) {
    if(e.ctrlKey || e.metaKey) {
      return;
    }
    e.preventDefault();
    navigate($(e.currentTarget).attr('href'));
  });


  var findReact = function(dom) {
    for (var key in dom) {
        if (key.startsWith("__reactInternalInstance$")) {
            var compInternals = dom[key]._currentElement;
            var compWrapper = compInternals._owner;
            var comp = compWrapper._instance;
            return comp;
        }
    }
    return null;
  };


  var Settings = [];
  var settingsObj;
  try {
    var settingsObj = JSON.parse(window.localStorage && window.localStorage.SteemMoreInfoSettings);
  }catch(err){
  }
  settingsObj = settingsObj || {};

  var addSettings = function(s) {
    Settings.push(s);
  };

  var getSettingsValue = function(key) {
    var value = settingsObj[key];
    if(!value){
      Settings.forEach(function(s) {
        s.settings.forEach(function(s2){
          if(s2.key === key){
            value = s2.defaultValue;
          }
        });
      });
    }
    return value;
  };

  var setSettingsValue = function(key, v) {
    settingsObj[key] = v;
    if(window.localStorage){
      window.localStorage.SteemMoreInfoSettings = JSON.stringify(settingsObj);
    }
  };

  var getReputation = function(reputation, round) {
    reputation = parseInt(reputation);
    let rep = String(reputation);
    const neg = rep.charAt(0) === "-";
    rep = neg ? rep.substring(1) : rep;
    const str = rep;
    const leadingDigits = parseInt(str.substring(0, 4));
    const log = Math.log(leadingDigits) / Math.log(10);
    const n = str.length - 1;
    let out = n + (log - parseInt(log));
    if (isNaN(out)) out = 0;
    out = Math.max(out - 9, 0);
    out = (neg ? -1 : 1) * out;
    out = out * 9 + 25;
    return out.toFixed(round);
  };



  var Utils = {
    getPageAccountName: getPageAccountName,
    getLoggedUserName: getLoggedUserName,
    getUserProfileBannerForAccountName: getUserProfileBannerForAccountName,
    getUserTopMenusForAccountName: getUserTopMenusForAccountName,
    getRewardBalance: function(){
      return rewardBalance;
    },
    getRecentClaims: function(){
      return recentClaims;
    },
    getSteemPrice: function(){
      return steemPrice;
    },
    getVotingPowerPerAccount: getVotingPowerPerAccount,
    getVotingDollarsPerAccount: getVotingDollarsPerAccount,
    getVotingDollarsPerShares: getVotingDollarsPerShares,
    getEffectiveVestingSharesPerAccount: getEffectiveVestingSharesPerAccount,
    getSteemPowerPerAccount: getSteemPowerPerAccount,
    getUserHistory: getUserHistory,
    getActiveVotes: getActiveVotes,
    getContent: getContent,
    getBlog: getBlog,
    getAccounts: getAccounts,
    getAccountVotes: getAccountVotes,
    getLoadingHtml: getLoadingHtml,
    createPostSummary: createPostSummary,
    navigate: navigate,
    findReact: findReact,
    addSettings: addSettings,
    getSettingsValue: getSettingsValue,
    setSettingsValue: setSettingsValue,
    getReputation: getReputation
  };


  window.SteemPlus = window.SteemPlus || {};
  window.SteemPlus.Settings = Settings;
  window.SteemPlus.Utils = Utils;

})();
