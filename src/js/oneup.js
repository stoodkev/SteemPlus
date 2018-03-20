var username=null;
var token_oneup=null;
var it=0;
var MAX_IT=15;
var MIN_REP=20;
// var MIN_REP=45;
var postButtons='div .Buttons';
var sToken=null;
var post_voted=[];
const POST_API="https://utopian-1up.herokuapp.com/parse/classes/Posts";
const VOTE_API="https://utopian-1up.herokuapp.com/parse/classes/Votes";
const APP_ID="efonwuhf7i2h4f72h3o8fho23fh7";
var isVoting,isProcessingClick=false;
var scrollBottomReached=false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to==='oneup'&&request.order==='start'&&token_oneup==null){
      token_oneup=request.token;
      sToken=request.data.sessionToken;
      username=request.data.account.name;
      if(isReputationEnough(request.data.account)){
        getVotes();
        checkOneUp();
      }

      $(window).scroll(function() {
        if($(window).scrollTop() + $(window).height() >= $('.Feed').height()) {
          if(isReputationEnough(request.data.account) && !scrollBottomReached){
            scrollBottomReached=true;
            setTimeout(function () {
              getVotes();
              checkOneUp();
              scrollBottomReached=false;
            }, 3000);

          }
        }
      });
    }
});

function isReputationEnough(account)
{
  return steem.formatter.reputation(account.reputation)>=MIN_REP;
}

function checkOneUp(){
  it++;
  if($(postButtons).length>=1){
    createOneUpButton();
  }
  else {
    if(it<MAX_IT)
      setTimeout(checkOneUp, 1000);
  }
}

function getVotes(){
  console.log('Get votes from @',username);
  $.ajax({
    type: "GET",
    beforeSend: function(xhttp) {
      xhttp.setRequestHeader("Content-type", "application/json");
      xhttp.setRequestHeader("X-Parse-Application-Id", "efonwuhf7i2h4f72h3o8fho23fh7");
    },
    url: VOTE_API+'?where={"from":"'+username+'"}',
    success: function(msg) {
      if(msg.results.length!==0){
        post_voted=msg.results.map(function(e){
          return e.url;
        });
        checkOneUp();
      }
      else checkOneUp();
    },
    error: function(msg) {
      alert(msg.responseJSON.error);
    }
  });
}

function createOneUpButton(){
  for(buttons of $(postButtons))
  {
    var link=$(buttons).find('.Buttons__link')[2].href.replace('#comments','');
    var classOneUp='oneup';
    if(!post_voted.includes(link))
      classOneUp+=' greyscale';
    if($(buttons).find('.oneup').length!==0){
      $('.oneup').remove();
      $('.oneup_nb').remove();
    }
    $(buttons).append('<div class="oneup" id="'+link+'"><span class="icon icon-1up"></span></div>');
    getVoteNumber(buttons,link);
  }

  $('.oneup').click(function(){
    if(!isVoting){
      var clickedButton=this;
      var url=this.id;
      isVoting=true;
      $.ajax({
        type: "POST",
        beforeSend: function(xhttp) {
          xhttp.setRequestHeader("Content-type", "application/json");
          xhttp.setRequestHeader("X-Parse-Application-Id", "efonwuhf7i2h4f72h3o8fho23fh7");
        },
        url: VOTE_API,
        data:JSON.stringify({"token":sToken,"url":url}),
        processData: false,
        success: function(msg) {
          post_voted.push(url);
          isVoting=false;
          if($(clickedButton).parent().find('.oneup_nb').length === 0)
          {
            $(clickedButton).after('<span class="Buttons__number oneup_nb">1</span>');
            $(clickedButton).find($('.icon')).addClass('has-oneup');
          }
          else
          {
            $(clickedButton).parent().find('.oneup_nb')[0].innerHTML = parseInt($(clickedButton).parent().find('.oneup_nb')[0].innerHTML) + 1;
            $(clickedButton).find($('.icon')).addClass('has-oneup');
          }
        },
        error: function(msg) {
          alert(msg.responseJSON.error);
          isVoting=false;
        }
      });
    }
  });
}

function getVoteNumber(buttons,link)
{
  $.ajax({
    type: "GET",
    beforeSend: function(xhttp) {
      xhttp.setRequestHeader("Content-type", "application/json");
      xhttp.setRequestHeader("X-Parse-Application-Id", APP_ID);
    },
    url: POST_API+'?where={"url":"'+link+'"}',
    success: function(msg) {
      console.log(msg);
      if(msg.results.length>0)
      {
        $(buttons).append('<span class="Buttons__number oneup_nb">'+msg.results["0"].from_length+'</span>');
        if(msg.results[0].from.includes(username))
        {
          $(buttons).find($('.icon')).addClass('has-oneup');
        }
        isProcessingClick=false;
      }
    },
    error: function(msg) {
      console.log(msg.responseJSON.error);
      isProcessingClick=false;
    }
  });
}
