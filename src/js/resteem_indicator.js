var token_resteem_indicator=null;

var retryCountResteemIndicator=0;

var nbElementPageAuthorRI=0;

// Listener on message coming from main.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.to==='resteem_indicator'&&request.order==='start'&&token_resteem_indicator==null)
  {
    token_resteem_indicator=request.token;
    retryCountResteemIndicator = 0;
    nbElementPageAuthorRI=0;
    startResteemIndicator();
  }
  else if(request.to==='resteem_indicator'&&request.order==='click'&&token_resteem_indicator==request.token)
  {
    myUsernameSignature = request.data.user;
    retryCountResteemIndicator = 0;
    nbElementPageAuthorRI=0;
    startResteemIndicator();
  }
});

// Function used to start resteem Indicator
// This function will check url and launch the good method to display information.
// Resteem indicator can be launch on post page or blogs, feeds, feed+ etc (everywhere there is a )
// No @parameters
function startResteemIndicator()
{
	if(retryCountResteemIndicator < 20)
	{
		if(regexPostSteemit.test(window.location.href))
		{
			var matches = window.location.href.match(regexPostSteemitParameters);
			var usernameResteemIndicator = matches[1];
			var permlinkResteemIndicator = matches[2];
			if($('.resteem-list').length===0)
				displayResteemIndicatorInPost(usernameResteemIndicator, permlinkResteemIndicator);
		}
	}
}	

// Function used to display resteem Indicator
// This function is used when user is on post page
// @parameter usernameResteemIndicator : author of the post
// @parameter permlinkResteemIndicator : permlink of the post
function displayResteemIndicatorInPost(usernameResteemIndicator, permlinkResteemIndicator)
{
	console.log('ici');
	$.ajax({
      type: "POST",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
      },
      url: 'https://steemplus-api.herokuapp.com/api/get-reblogs/',
      data: JSON.stringify({"data" : [{"author":usernameResteemIndicator, "permlink":permlinkResteemIndicator}]}),
      success: function(result) {
		$('.Reblog__button').before('<div class="DropdownMenu resteem-list">\
			<a class="resteem-list-link">\
				<span class="Icon dropdown-arrow" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g><polygon points="128,90 256,218 384,90"></polygon></g></svg></span></span>\
				<span class="count-resteem-label">'+ result.length +'\
			</a>\
			<ul class="VerticalMenu menu vertical VerticalMenu ul-resteem-list"></ul>\
		</div>');
		result.forEach(function(item){
			$('.ul-resteem-list').append('<li class="resteem-item"><a href="/@'+ item.account +'">+ '+ item.account +'</a></li>');
		});
		$('.resteem-list-link').click(function(){
			$('.resteem-list').toggleClass('show');
		});
      },
      error: function(msg) {
        console.log(msg);
      }
    });
}