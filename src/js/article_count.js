var token_article_count=null;

var retryCountArticleCount=0;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to=='article_count'){
    	retryCountArticleCount=0;
      if(request.order==='start'&&token_article_count==null)
      {
        token_article_count=request.token;
		startArticleCount();
      }
      else if(request.order==='click'&&token_article_count==request.token)
      {
		startArticleCount();
      }
    }
  });

function startArticleCount()
{
	// If url matches blog url then start the feature
	if(regexBlogSteemit.test(window.location.href)&&retryCountArticleCount<20)
	{
		if($('.UserProfile__stats').length===0)
		{
			retryCountArticleCount++;
			timeoutArticleCount = setTimeout(function(){
				startArticleCount();
			},1000);
		}
			
		else
			displayArticleCount();
	}
}

function displayArticleCount()
{
	getPosts(window.SteemPlus.Utils.getPageAccountName());
}

async function getPosts(usernameArticleCount){
	
	var entry_id = null;
	var articleCount = 0;
	var nbNew = null;

	var tryCount = 0;

	while(entry_id !== -1)
	{
		const result = await steem.api.getBlogEntriesAsync(usernameArticleCount, entry_id, 100);
		if(result[result.length-1]!==undefined)
		{
			nbNew = result.length;
			result.forEach(function(article){
				if(article.author === usernameArticleCount)
					articleCount++;
			});
			entry_id = result[result.length-1].entry_id-1;
		}
		else
			entry_id = -1;
		
	}
	
	$('.UserProfile__stats > span')[1].remove();
	var span = $('<span><a href="/@' + usernameArticleCount + '">' + articleCount + ' post' + (articleCount > 1 ? 's' : '') + ' </a></span>');
	$('.UserProfile__stats > span')[0].after(span[0]);

}

