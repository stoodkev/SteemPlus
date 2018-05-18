var token_author_popup_info=null;
var retryCountAuthorPopupInfo=0;
var myUsernameAuthorPopupInfo=null;


// Listener on message to start the function
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to==='author_popup_info'&&request.order==='start'&&token_author_popup_info==null)
    {
      	token_author_popup_info=request.token;
      	retryCountAuthorPopupInfo=0;
      	myUsernameAuthorPopupInfo=request.data.user;
        startAuthorPopupInfo();
    }
    else if(request.to==='author_popup_info'&&request.order==='click'&&token_author_popup_info==request.token)
    {
    	retryCountAuthorPopupInfo=0;
    	myUsernameAuthorPopupInfo=request.data.user;
      	startAuthorPopupInfo();
    }
});

// Function used to start AuthorPopupInfo
// No parameters
function startAuthorPopupInfo()
{
	// Check url of the page. Need to be on a post to start the function
	if(regexPostSteemit.test(window.location.href)&&retryCountAuthorPopupInfo<20)
	{
		if($('.ptc').length===0)
		{
			// Looking for the right html element. If can't find it retry later. Maximum 20 seconds
			retryCountAuthorPopupInfo++;
			setTimeout(startAuthorPopupInfo, 1000);
		}
		else
		{
			// Start feature
			$('.ptc').unbind('click').click(function(){
				var userAuthorPopupInfo = $(this)[0].pathname.replace('/@', '');
				$('.Author__dropdown').append('<hr><div class="author-popup-message"></div>');

				// Get followers from steemSQL
				$.ajax({
			      type: "GET",
			      beforeSend: function(xhttp) {
			        xhttp.setRequestHeader("Content-type", "application/json");
			        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
			      },
			      // URL of steemplus-api
			      url: 'http://steemplus-api.herokuapp.com/api/get-followers-followee/'+myUsernameAuthorPopupInfo,
			      success: function(response) {

			        var isFollowing = response.find(function(elem){
						return elem.follower===userAuthorPopupInfo;
			        });

			        // if author is following you
			        if(isFollowing!==undefined)
			        {
			        	$('.author-popup-message').append('<span class="author-popup-witness">Following you</span><br>');
			        }
			        // If not
			        else
			        {
			        	$('.author-popup-message').append('<span class="author-popup-witness">Not following you</span><br>');
			        }
			      },
			      error: function(msg) {
			        console.log(msg);
			      }
			    });

				// Get author account
				steem.api.getAccounts([userAuthorPopupInfo], function(err, result) {
					if(err) console.log(err);
					else
					{
						// If author using you as a proxy
						if(result[0].proxy===myUsernameAuthorPopupInfo)
						{
							$('.author-popup-message').append('<span class="author-popup-proxy">Choose you as proxy</span><br>');
						}
						// Else if he has voted for you as a witness
						else if(result[0].witness_votes.includes(myUsernameAuthorPopupInfo))
						{
							$('.author-popup-message').append('<span class="author-popup-witness">Voted for you as a witness</span><br>');
						}
						else
						{
							// Else check is user is a witness
							steem.api.getWitnessByAccount(myUsernameAuthorPopupInfo, function(err, res){
								// if he is display a message saying that author didn't voted for him
								console.log(res);
								if(res!=='')
								{
									$('.author-popup-message').append('<span class="author-popup-witness">Didn\'t vote for you as a witness</span><br>');
								}
							});
						}
					}
				});
			});
		}

	}
}
