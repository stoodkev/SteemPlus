var token_resteem_indicator=null;

var retryCountResteemIndicator=0;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.to==='resteem_indicator'&&request.order==='start'&&token_resteem_indicator==null)
  {
    token_resteem_indicator=request.token;
    retryCountAddSignature = 0;
    startResteemIndicator();
  }
  else if(request.to==='resteem_indicator'&&request.order==='click'&&token_resteem_indicator==request.token)
  {
    myUsernameSignature = request.data.user;
    retryCountAddSignature = 0;
    startResteemIndicator();
  }
});

// Function used to start resteem Indicator
// This function will check url and launch the good method to display information.
// Resteem indicator can be launch on post page or blogs, feeds, feed+ etc (everywhere there is a )
// No @parameters
function startResteemIndicator()
{
	if(regexPostSteemit.test(window.location.href))
	{
		var matches = window.location.href.match(regexPostSteemitParameters);
		var usernameResteemIndicator = matches[1];
		var permlinkResteemIndicator = matches[2];
		if($('.resteem-list').length===0)
			displayResteemIndicatorInPost(usernameResteemIndicator, permlinkResteemIndicator);
	}
	else if(regexBlogSteemit.test(window.location.href)||regexFeedSteemit.test(window.location.href))
	{
		var paramsQuery = [];
		$('.articles__summary').each(function(){
			var usernameResteemIndicator = $(this).children().find('.entry-title > a').eq(0).attr('href').split('/')[2].replace('@', '');
			var permlinkResteemIndicator = $(this).children().find('.entry-title > a').eq(0).attr('href').split('/')[3];
			$(this).attr('name', usernameResteemIndicator + '_' + permlinkResteemIndicator);
			paramsQuery.push({'author':usernameResteemIndicator, 'permlink':permlinkResteemIndicator});
		});
		displayResteemIndicatorListPost($('.articles__summary'), '.PostSummary__time_author_category', paramsQuery);
	}
	else if(regexFeedPlusSteemit.test(window.location.href))
	{

	}
}

// Function used to display resteem Indicator
// This function is used when user is on post page
// @parameter usernameResteemIndicator : author of the post
// @parameter permlinkResteemIndicator : permlink of the post
function displayResteemIndicatorInPost(usernameResteemIndicator, permlinkResteemIndicator)
{
	$.ajax({
      type: "POST",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
      },
      url: 'https://steemplus-api.herokuapp.com/api/get-reblogs-per-post/',
      data: JSON.stringify({"data" : [{"author":usernameResteemIndicator, "permlink":permlinkResteemIndicator}]}),
      success: function(result) {
		$('.Reblog__button').before('<div class="DropdownMenu resteem-list">\
			<a class="resteem-list-link">\
				<span class="Icon dropdown-arrow" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g><polygon points="128,90 256,218 384,90"></polygon></g></svg></span></span>\
				<span>'+ result.length +'\
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

// Function used to display resteem indicator on list post pages (feed, feed+, blogs)
function displayResteemIndicatorListPost(listPosts, locationIndicator, paramsQuery)
{
	$.ajax({
      type: "POST",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
      },
      url: 'https://steemplus-api.herokuapp.com/api/get-reblogs-per-post/',
      data: JSON.stringify({"data" : paramsQuery}),
      success: function(result) {
		console.log(result);
		listPosts.each(function(){
			var elemList = $(this);
			if(elemList.find('.Reblog__button').length > 0)
			{
				var countResteem = 0;
				var listUserResteem = $('<ul class="VerticalMenu menu vertical VerticalMenu ul-resteem-list"></ul>');
				result.forEach(function(item){
					if(elemList.eq(0).attr('name')===item.author + '_' + item.permlink)
					{
						listUserResteem.append('<li class="resteem-item"><a href="/@'+ item.account +'">+ '+ item.account +'</a></li>');
						countResteem++;
					}
				});
				var divReblogs = $('<div class="DropdownMenu resteem-list">\
					<a class="resteem-list-link">\
						<span class="Icon dropdown-arrow" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g><polygon points="128,90 256,218 384,90"></polygon></g></svg></span></span>\
						<span>'+ countResteem +'\
					</a>\
				</div>');
				divReblogs.find('.resteem-list-link').after(listUserResteem);
				elemList.find('.Reblog__button').before(divReblogs);
			}
			else
			{
				
				var countResteem = 0;
				var listUserResteem = $('<ul class="VerticalMenu menu vertical VerticalMenu ul-resteem-list"></ul>');
				result.forEach(function(item){
					if(elemList.eq(0).attr('name')===item.author + '_' + item.permlink)
					{
						listUserResteem.append('<li class="resteem-item"><a href="/@'+ item.account +'">+ '+ item.account +'</a></li>');
						countResteem++;
					}
				});
				var divReblogs = $('<div class="DropdownMenu resteem-list">\
					<a class="resteem-list-link">\
						<span class="Icon dropdown-arrow" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g><polygon points="128,90 256,218 384,90"></polygon></g></svg></span></span>\
						<span>'+ countResteem +'\
					</a>\
				</div>\
				<span class="Reblog__button"><a><span class="Icon reblog" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path d="M448,192l-128,96v-64H128v128h248c4.4,0,8,3.6,8,8v48c0,4.4-3.6,8-8,8H72c-4.4,0-8-3.6-8-8V168c0-4.4,3.6-8,8-8h248V96 L448,192z"></path></svg></span></a></span>');
				divReblogs.find('.resteem-list-link').after(listUserResteem);
				elemList.find(locationIndicator).append(divReblogs);
			}
		});
		$('.resteem-list-link').click(function(){
			if($(this).parent().find('.resteem-list').hasClass('show'))
				$(this).parent().find('.resteem-list').removeClass('show');
			else
				$(this).parent().find('.resteem-list').addClass('show');
		});
      },
      error: function(msg) {
        console.log(msg);
      }
    });
}