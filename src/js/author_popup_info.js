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
				steem.api.getAccounts([userAuthorPopupInfo], function(err, result) {
					if(err) console.log(err);
					else
					{
						console.log(result);
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