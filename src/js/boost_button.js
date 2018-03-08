
  var token_boost_button=null;
  var aut=null;

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if(request.to=='boost_button'){
      aut=request.data.user;
      if(request.order==='start'&&token_boost_button==null)
      {
        token_boost_button=request.token;

        // $('body').attrchange(function(attrName) {
        //   if(attrName === 'class'){
        //     if($('body').hasClass('with-post-overlay')) {
        //       addPostBoostButton();
        //     }
        //   }
        // });

        addPostBoostButton();
      }

      if(request.order==='click')
      {
        token_boost_button=request.token;

        // $('body').attrchange(function(attrName) {
        //   if(attrName === 'class'){
        //     if($('body').hasClass('with-post-overlay')) {
        //       addPostBoostButton();
        //     }
        //   }
        // });

        addPostBoostButton();
      }
    }
  });


  function createTransferUI(category, author, permlink) {
    var link = window.location.origin + '/' + category + '/@' + author + '/' + permlink;

    var modal = $('<div role="dialog" style="bottom: 0px; left: 0px; overflow-y: scroll; position: fixed; right: 0px; top: 0px;">\
      <div class="reveal-overlay fade in" style="display: block;"></div>\
      <div class="reveal fade in" role="document" tabindex="-1" style="display: block; min-height: 200px;">\
        <button class="close-button" type="button">\
          <span aria-hidden="true" class="">×</span>\
        </button>\
      </div>\
    </div>');

    var loading = $(window.SteemPlus.Utils.getLoadingHtml({
      center: true
    }));
    modal.find('.reveal').append(loading);

    modal.find('.close-button').on('click', function() {
      modal.remove();
    });
    modal.find('.reveal-overlay').on('click', function() {
      modal.remove();
    });

    var missingAsync = 4;
    var alreadyBoosted = false;
    var accountInfo = null;
    var globalInfo = null;
    var minnowboosterAccount = null;

    var asyncDone = function() {
      missingAsync--;
      if(missingAsync !== 0){
        return;
      }

      var min = parseFloat(globalInfo.min_upvote);
      var max = Math.min(
        parseFloat(globalInfo.daily_limit) - parseFloat(accountInfo.user_daily_usage),
        parseFloat(globalInfo.weekly_limit) - parseFloat(accountInfo.user_weekly_usage)
      );

      var multiplier = parseFloat(globalInfo.full_strength) * window.SteemPlus.Utils.getVotingPowerPerAccount(minnowboosterAccount) / 10000;

      var transferUI;

      var accountInfoUI = '<div class="column small-12">\
        <strong>About the author: <a href="/@' + author + '" target="_blank" rel="noopener">@' + author + '</a></strong><br>\
        <small>Daily Limit: ' + parseFloat(accountInfo.user_daily_usage).toFixed(2) + ' / ' + parseFloat(globalInfo.daily_limit).toFixed(2) + ' SBD</small> <br>\
      </div>';

      if(alreadyBoosted) {

        var amount = parseFloat(alreadyBoosted.upvote);

        transferUI = $('<div>\
          <div class="row">\
            <h3 class="column">Boost with <a href="/@minnowbooster" target="_blank" rel="noopener">@minnowbooster</a></h3>\
          </div>\
          <div>\
            <div class="row">\
              <div class="column small-12">\
              The boost functionality is provided by <a href="/@steem-plus" target="_blank" rel="noopener">@steem-plus</a>\
              with the support of the <a href="/@minnowbooster" target="_blank" rel="noopener">@minnowbooster</a> team.\
              We don\'t have access to your private key, and the payment is made through SteemConnect.\
              <br>\
              </div>\
            </div>\
            <br>\
            <div class="row">' + accountInfoUI + '</div>\
            <br>\
            <br>\
            <div class="row">\
              <div class="column small-12" style="color: red;">\
              This post already received a ~' + amount.toFixed(2) + '$ upvote from <a href="/@minnowbooster" target="_blank" rel="noopener">@minnowbooster</a> thanks to <a href="/@' + alreadyBoosted.from + '" target="_blank" rel="noopener">' + alreadyBoosted.from + '</a>.\
              <br>\
              </div>\
            </div>\
          </div>\
        </div>');

      }else if(!globalInfo.post_voting_enabled) {

        transferUI = $('<div>\
          <div class="row">\
            <h3 class="column">Boost with <a href="/@minnowbooster" target="_blank" rel="noopener">@minnowbooster</a></h3>\
          </div>\
          <div>\
            <div class="row">\
              <div class="column small-12">\
              The boost functionality is provided by <a href="/@steem-plus" target="_blank" rel="noopener">@steem-plus</a>\
              with the support of the <a href="/@minnowbooster" target="_blank" rel="noopener">@minnowbooster</a> team.\
              We don\'t have access to your private key, and the payment is made through SteemConnect.\
              <br>\
              </div>\
            </div>\
            <br>\
            <br>\
            <div class="row">\
              <div class="column small-12" style="color: red;">\
              This service is currently not available, try later.\
              <br>\
              </div>\
            </div>\
          </div>\
        </div>');

      }else if(min > max) {

        transferUI = $('<div>\
          <div class="row">\
            <h3 class="column">Boost with <a href="/@minnowbooster" target="_blank" rel="noopener">@minnowbooster</a></h3>\
          </div>\
          <div>\
            <div class="row">\
              <div class="column small-12">\
              The boost functionality is provided by <a href="/@steem-plus" target="_blank" rel="noopener">@steem-plus</a>\
              with the support of the <a href="/@minnowbooster" target="_blank" rel="noopener">@minnowbooster</a> team.\
              We don\'t have access to your private key, and the payment is made through SteemConnect.\
              <br>\
              </div>\
            </div>\
            <br>\
            <div class="row">' + accountInfoUI + '</div>\
            <br>\
            <br>\
            <div class="row">\
              <div class="column small-12" style="color: red;">\
              The author\'s daily or weekly limit has been reached. You can\'t boost this post.\
              <br>\
              </div>\
            </div>\
          </div>\
        </div>');

      }else{
        // can boost!

        transferUI = $('<div>\
          <div class="row">\
            <h3 class="column">Boost with <a href="/@minnowbooster" target="_blank" rel="noopener">@minnowbooster</a></h3>\
          </div>\
          <form lpformnum="4">\
            <div>\
              <div class="row">\
                <div class="column small-12">\
                The boost functionality is provided by <a href="/@steem-plus" target="_blank" rel="noopener">@steem-plus</a>\
                with the support of the <a href="/@minnowbooster" target="_blank" rel="noopener">@minnowbooster</a> team.\
                We don\'t have access to your private key, and the payment is made through SteemConnect.\
                <br>\
                </div>\
              </div>\
              <br>\
              <div class="row">' + accountInfoUI + '</div>\
              <br>\
              <br>\
            </div>\
            <div class="row">\
              <div class="column small-2" style="padding-top: 5px;">To</div>\
              <div class="column small-10">\
                <div class="input-group" style="margin-bottom: 1.25rem;">\
                  <span class="input-group-label">@</span>\
                  <input type="text" class="input-group-field" disabled="" value="minnowbooster" placeholder="Send to account" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" name="to" value="">\
                </div>\
                <p></p>\
              </div>\
            </div>\
            <div class="row">\
              <div class="column small-2" style="padding-top: 5px;">Amount</div>\
              <div class="column small-10">\
                <div class="input-group" style="margin-bottom: 5px;">\
                  <input type="text" placeholder="Amount" name="amount" value="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" autofocus="">\
                  <span class="input-group-label" style="padding-left: 0px; padding-right: 0px;">\
                    <select name="asset" placeholder="Asset" style="min-width: 5rem; height: inherit; background-color: transparent; border: none;">\
                      <option value="SBD" selected>SBD</option>\
                    </select>\
                  </span>\
                </div>\
                <div class="amount-error">\
                  <small>Min: ' + min.toFixed(3) + ' SBD - Max: ' + max.toFixed(3) + ' SBD</small>\
                </div>\
                <div class="amount-upvote">\
                </div>\
              </div>\
            </div>\
            <br>\
            <div class="row">\
              <div class="column small-2" style="padding-top: 5px;">Memo</div>\
              <div class="column small-10">\
                <input type="text" placeholder="Memo" name="memo" disabled="" value="" autocomplete="on" autocorrect="off" autocapitalize="off" spellcheck="false">\
              </div>\
            </div>\
            <br>\
            <br>\
            <div class="row">\
              <div class="column">\
                <span>\
                <button type="submit" disabled="" class="button">Submit</button>\
                </span>\
              </div>\
            </div>\
          </form>\
        </div>');

        transferUI.find('input[name="memo"]').val(link);
        transferUI.find('input[name="amount"]').val(min);

        var validate = function() {
          var amount = transferUI.find('input[name="amount"]').val();
          var error = true;
          amount = amount && parseFloat(amount);
          if(typeof amount === 'number' && min <= amount && max >= amount){
            error = false;
          }
          if(error){
            transferUI.find('.amount-error').css('color', 'red');
            transferUI.find('button[type="submit"]').attr('disabled', 'disabled');
            transferUI.find('.amount-upvote').html('');
          }else{
            transferUI.find('.amount-error').css('color', '#333');
            transferUI.find('button[type="submit"]').attr('disabled', null);
            var upvote = amount * multiplier;
            transferUI.find('.amount-upvote').html('<small>You will receive an upvote worth ~' + upvote.toFixed(2) + '$</small>');
          }
          return !error;
        };

        transferUI.find('input').on('input', function() {
          validate();
        });

        transferUI.find('form').on('submit', function(e) {
          e.preventDefault();
          if(!validate()){
            return;
          }
          var to = transferUI.find('input[name="to"]').val();
          var amount = transferUI.find('input[name="amount"]').val() + ' ' + transferUI.find('select[name="asset"]').val();
          var memo = transferUI.find('input[name="memo"]').val();
          var url = 'https://v2.steemconnect.com/sign/transfer?to=' + encodeURIComponent(to) + '&amount=' + encodeURIComponent(amount) + '&memo=' + encodeURIComponent(memo);

          var transferWindow = window.open();
          transferWindow.opener = null;
          transferWindow.location = url;
        });

        validate();

      }

      loading.remove();
      modal.find('.reveal').append(transferUI);

    };

    $('body').append(modal);

    $.ajax({
      type: "GET",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
      },
      url: 'https://www.minnowbooster.net/api/global',
      success: function(json) {
        globalInfo = json;
        Object.keys(json).forEach(function(key){
          globalInfo[key.replace('=', '')] = globalInfo[key];
        });
        asyncDone();
      },
      error: function(msg) {
        alert(msg.responseJSON.error);
      }
    });

    $.ajax({
      type: "GET",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
      },
      url: 'https://www.minnowbooster.net/users/' + author + '/json',
      success: function(json) {
        accountInfo = json;
        asyncDone();
      },
      error: function(msg) {
        alert(msg.responseJSON.error);
      }
    });

    $.ajax({
      type: "GET",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
      },
      url: 'https://www.minnowbooster.net/api/posts/' + author + '/' + permlink + '/' + author,
      success: function(json) {
        if(json.extract) {
          alreadyBoosted = {
            from: json.extract.sender && json.extract.sender.name || 'unknown',
            amount: json.extract.sbd,
            upvote: json.extract.value
          };
        }
        asyncDone();
      },
      error: function(msg) {
        alert(msg.responseJSON.error);
      }
    });

    window.SteemPlus.Utils.getAccounts(['minnowbooster'], function(err, result){
      if(result) {
        minnowboosterAccount = result[0];
        asyncDone()
      }
    });

  };



  function addPostBoostButton() {

    var promoteButton = $('.Promote__button');
    var boostButton = $('.smi-boost-button');

    if(promoteButton.length && !boostButton.length) {

      boostButton = $('<button class="smi-boost-button float-right button hollow tiny">Boost</button>');

      promoteButton.before(boostButton);
      promoteButton.addClass('smi-promote-button');

      boostButton.on('click', function() {
        var url = window.location.pathname;
        var match = url.match(/^\/([^\/]*)\/@([^\/]*)\/(.*)$/);
        var category = match[1];
        var author = match[2];
        var permlink = match[3];
        createTransferUI(category, author, permlink);
      });

    }

  };
