var token_article_count=null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to=='article_count'){
      if(request.order==='start'&&token_article_count==null)
      {
        article_count=request.token;
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
	if($('.UserProfile__stats').length===0)
		setTimeout(function(){
			startArticleCount();
		},200);
	else
		displayArticleCount();
}

function displayArticleCount()
{
	var usernameArticleCount = window.SteemPlus.Utils.getPageAccountName();
	getPosts(0, null, usernameArticleCount);	
}

function getPosts(articleCount, entry_id, usernameArticleCount){
	steem.api.getBlogEntries(usernameArticleCount, entry_id, 100, function(err, result)
	{
		if(err) console.log(err)
		else 
		{
			result.forEach(function(article){
				if(article.author === usernameArticleCount)
					articleCount++;
			});
			if(result.length === 100)
			{
				getPosts(articleCount, result[result.length-1].entry_id-1, usernameArticleCount);
			}
			else
			{
				$('.UserProfile__stats > span')[1].remove();
				var span = $('<span><a href="/@stoodkev">' + articleCount + ' articles </a></span>');
				$('.UserProfile__stats > span')[0].after(span[0]);
			}
		}
	});
}