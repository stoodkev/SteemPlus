var token_article_count=null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to=='article_count'){
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
	if($('.UserProfile__stats').length===0)
		setTimeout(function(){
			startArticleCount();
		},200);
	else
		displayArticleCount();
}

function displayArticleCount()
{
	getPosts(window.SteemPlus.Utils.getPageAccountName());
}

function getPosts(usernameArticleCount){
	
	var entry_id = null;
	var articleCount = 0;
	var nbNew = null;

	var tryCount = 0;

	console.log('here', nbNew!==0);
	while(nbNew !== 0&&tryCount<20)
	{
		tryCount++;
		Promise.resolve(steem.api.getBlogEntriesAsync(usernameArticleCount, entry_id, 100)).then(function(result){
			console.log(result);
			console.log(entry_id);
			nbNew = result.length;
			result.forEach(function(article){
				if(article.author === usernameArticleCount)
					articleCount++;
			});
			entry_id = result[result.length-1].entry_id-1;
		})
		.catch(function(err){
			console.log(err);
		});
	}
	
	$('.UserProfile__stats > span')[1].remove();
	var span = $('<span><a href="/@' + usernameArticleCount + '">' + articleCount + ' post' + (articleCount > 1 ? 's' : '') + ' </a></span>');
	$('.UserProfile__stats > span')[0].after(span[0]);

	// steem.api.getBlogEntries(usernameArticleCount, entry_id, 100, function(err, result)
	// {
	// 	if(err) console.log(err)
	// 	else
	// 	{
	// 		result.forEach(function(article){
	// 			if(article.author === usernameArticleCount)
	// 				articleCount++;
	// 		});
	// 		if(result.length === 100)
	// 		{
	// 			getPosts(articleCount, result[result.length-1].entry_id-1, usernameArticleCount);
	// 		}
	// 		else
	// 		{
	// 			$('.UserProfile__stats > span')[1].remove();
	// 			var span = $('<span><a href="/@' + usernameArticleCount + '">' + articleCount + ' post' + (articleCount > 1 ? 's' : '') + ' </a></span>');
	// 			$('.UserProfile__stats > span')[0].after(span[0]);
	// 		}
	// 	}
	// });
}
