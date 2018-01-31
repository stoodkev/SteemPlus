var username=null;
var token_oneup=null;
var it=0;
var MAX_IT=15;
var MIN_REP=45;
var postButtons='div .Buttons';
var sToken=null;
var post_voted=[];

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to==='oneup'&&request.order==='start'&&token_oneup==null){
      token_oneup=request.token;
      sToken=request.data.sessionToken;
      console.log('Start 1up');
      if(isReputationEnough(request.data.account))
        getVotes();
    }
    if(request.to==='oneup'&&request.order==='click'&&token_oneup==request.token){
      it=0;
      if(isReputationEnough(request.data.account))
        setTimeout(function(){checkOneUp();},2000);
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
    console.log('Wait');
    if(it<MAX_IT)
      setTimeout(checkOneUp, 1000);
  }
}

function getVotes(){
  $.ajax({
    type: "GET",
    beforeSend: function(xhttp) {
      xhttp.setRequestHeader("Content-type", "application/json");
      xhttp.setRequestHeader("X-Parse-Application-Id", "efonwuhf7i2h4f72h3o8fho23fh7");
    },
    url: "https://utopian-1up.herokuapp.com/parse/classes/Votes"+'?where={"from":"stoodkev"}',
    success: function(msg) {
      console.log(msg);
      if(msg.results.length!==0){
        post_voted=msg.results.map(function(e){
          return e.url;
        });
        console.log(post_voted);
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
    if($(buttons).find('.oneup').length!==0)
      $('.oneup').remove();
    $(buttons).append('<img id="'+link+'" class="'+classOneUp+'" src="'+chrome.extension.getURL("src/img/oneup.svg")+'"/>');
  }

  $('.oneup').click(function(){
    var url=this.id;
    $.ajax({
      type: "POST",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", "efonwuhf7i2h4f72h3o8fho23fh7");
      },
      url: "https://utopian-1up.herokuapp.com/parse/classes/Votes",
      data:JSON.stringify({"token":sToken,"url":url}),
      processData: false,
      success: function(msg) {
        post_voted.push(url);
      },
      error: function(msg) {
        alert(msg.responseJSON.error);
      }
    });
  });
}
