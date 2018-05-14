var token_author_popup_info=null;
var retryCountAuthorPopupInfo=0;


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to==='author_popup_info'&&request.order==='start'&&token_author_popup_info==null)
    {
      	token_author_popup_info=request.token;
      	retryCountAuthorPopupInfo=0;
        startAuthorPopupInfo();
    }
    else if(request.to==='author_popup_info'&&request.order==='click'&&token_author_popup_info==request.token)
    {
    	retryCountAuthorPopupInfo=0;
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
			});
		}

	}
}