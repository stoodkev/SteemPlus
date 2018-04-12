
var token_boost_button=null;
var aut=null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

  if(request.to=='boost_button'){
    aut=request.data.user;
    if(request.order==='start'&&token_boost_button==null)
    {
      token_boost_button=request.token;
      addPostBoostButton();
    }

    if(request.order==='click')
    {
      token_boost_button=request.token;
      addPostBoostButton();
    }
  }
});

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
      console.log('createTransferUI(' + category + ',' + author + ',' + permlink + ');');
      //createTransferUI(category, author, permlink);
    });
  }
};
