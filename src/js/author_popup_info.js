var token_author_popup_info=null;
var retryCountAuthorPopupInfo=0;
var myUsernameAuthorPopupInfo=null;

var isSteemit=null;
var isBusy=null;

// Listener on message to start the function
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to==='author_popup_info'&&request.order==='start'&&token_author_popup_info==null)
    {
      	token_author_popup_info=request.token;
      	retryCountAuthorPopupInfo=0;
      	myUsernameAuthorPopupInfo=request.data.user;
      	isSteemit=request.data.steemit;
      	isBusy=request.data.busy;
        startAuthorPopupInfo();
    }
    else if(request.to==='author_popup_info'&&request.order==='click'&&token_author_popup_info==request.token)
    {
    	retryCountAuthorPopupInfo=0;
    	myUsernameAuthorPopupInfo=request.data.user;
    	isSteemit=request.data.steemit;
      	isBusy=request.data.busy;
      	startAuthorPopupInfo();
    }
});

// Function used to start AuthorPopupInfo
// No parameters
function startAuthorPopupInfo()
{
	// Check url of the page. Need to be on a post to start the function
	if(isSteemit&&regexPostSteemit.test(window.location.href)&&retryCountAuthorPopupInfo<20)
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
			$('.ptc').click(function(){
				openAuthorPopupInfo($(this));
			});
		}

	}
	else if(isBusy&&regexPostBusy.test(window.location.href)&&!window.location.href.includes('transfers')&&retryCountAuthorPopupInfo<20)
	{
		if($('span.username').length===0)
		{
			retryCountAuthorPopupInfo++;
			setTimeout(startAuthorPopupInfo, 1000);
		}
		else
		{
			// Start feature
			$('.StoryFull').find('span.username').parent().before('<i class="iconfont icon-mine author-popup-busy"></i>');
			$('.Comments').find('span.username').parent().before('<i class="iconfont icon-mine author-popup-busy"></i>');
			$('.author-popup-busy').click(function(){
				$('.author-popup-busy').popover('hide');
				openAuthorPopupInfo($(this));
			});

			// When comment section appears add icon
			$('.Comments').on('DOMNodeInserted', function(evt){
				var target = $(evt.target);
				// Only if the new node is a comment
				if(target.hasClass('Comment')&&target.find('.author-popup-busy').length===0)
				{
					target.find('span.username').parent().before('<i class="iconfont icon-mine author-popup-busy"></i>');
				}
				target.find('.author-popup-busy').unbind('click').click(function(){
					$('.author-popup-busy').popover('hide');
					openAuthorPopupInfo($(this));
				});
			});
		}
	}
}


function openAuthorPopupInfo(element)
{
	var userAuthorPopupInfo = null;
	if(isSteemit)
	{
		userAuthorPopupInfo = element[0].pathname.replace('/@', '');
		$('.Author__dropdown').append('<hr><div class="author-popup-message"></div>');
	} 
	else if(isBusy)
	{
		userAuthorPopupInfo = $(element).parent().find('.username')[0].innerHTML;
		$(element).attr('data-toggle','popover');
	    $(element).attr('data-content', '<div class="author-popup-message"></div>');
	    $(element).attr('data-placement','right');
	    $(element).attr('title','User Information');
	    $(element).attr('data-html','true');
	    $(element).popover('show');

		$('body').on('click', function(e) {
          var t = $(e.target);
          if(t.closest('.popover').length === 0 && t.hasClass('author-popup-busy')) {
            return;
          }
          $(element).popover('hide');
        });
	}

	// Get followers from steemSQL
	$.ajax({
	  type: "GET",
	  beforeSend: function(xhttp) {
	    xhttp.setRequestHeader("Content-type", "application/json");
	    xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
	  },
	  // URL of steemplus-api
	  url: 'https://steemplus-api.herokuapp.com/api/get-followers-followee/'+myUsernameAuthorPopupInfo,
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
					if(res!=='')
					{
						$('.author-popup-message').append('<span class="author-popup-witness">Didn\'t vote for you as a witness</span><br>');
					}
				});
			}
		}
	});
}