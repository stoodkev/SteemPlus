var token_author_popup_info=null;
var retryCountAuthorPopupInfo=0;
var myUsernameAuthorPopupInfo=null;


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


function startAuthorPopupInfo()
{
	if(regexPostSteemit.test(window.location.href)&&retryCountAuthorPopupInfo<20)
	{
		if($('.ptc').length===0)
		{
			retryCountAuthorPopupInfo++;
			setTimeout(startAuthorPopupInfo, 1000);
		}
		else
		{
			$('.ptc').unbind('click').click(function(){
				var userAuthorPopupInfo = $(this)[0].pathname.replace('/@', '');
				$('.Author__dropdown').prepend('<div class="author-popup-message"></div>');
				
				$.ajax({
			      type: "GET",
			      beforeSend: function(xhttp) {
			        xhttp.setRequestHeader("Content-type", "application/json");
			        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
			      },
			      url: 'http://steemplus-api.herokuapp.com/api/get-followers-followee/'+myUsernameAuthorPopupInfo,
			      success: function(response) {
			        var isFollowing = response.find(function(elem){
						return elem.following===userAuthorPopupInfo;
			        });
			        if(isFollowing!==undefined)
			        	$('.author-popup-message').append('<span class="author-popup-witness">Following you</span><br>');
			      },
			      error: function(msg) {
			        console.log(msg);
			      }
			    });

				steem.api.getAccounts([userAuthorPopupInfo], function(err, result) {
					if(err) console.log(err);
					else
					{
						if(result[0].proxy===myUsernameAuthorPopupInfo)
						{
							$('.author-popup-message').append('<span class="author-popup-proxy">Choose you as proxy</span><br>');
						}
						else if(result[0].witness_votes.includes(myUsernameAuthorPopupInfo))
						{
							$('.author-popup-message').append('<span class="author-popup-witness">Voted for you as a witness</span><br>');
						}
					}
				});
			});
		}

	}
}