var token_number_article_comment=null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to=='number_article_comment'){
      if(request.order==='start'&&token_number_article_comment==null)
      {
        token_number_article_comment=request.token;
		startNumberArticleComment();
      }
      else if(request.order==='click'&&token_number_article_comment==request.token)
      {
		startNumberArticleComment();
      }
    }
  });

function startNumberArticleComment()
{
	if($('.UserProfile__stats').length===0)
		setTimeout(function(){
			startNumberArticleComment();
		},200);
	else
		displayNumberArticleComment();
}

function displayNumberArticleComment()
{
	var usernameNumberArticleComment = window.SteemPlus.Utils.getPageAccountName();
	getPosts(0, null, usernameNumberArticleComment);	
}

function getPosts(postCount, entry_id, usernameNumberArticleComment){
	steem.api.getBlogEntries(usernameNumberArticleComment, entry_id, 100, function(err, result)
	{
		if(err) console.log(err)
		else 
		{
			console.log(result)
			result.forEach(function(article){
				if(article.author === usernameNumberArticleComment)
				{
					console.log(article);
					postCount++;
				} 
			});
			if(result.length === 100)
			{
				getPosts(postCount, result[result.length-1].entry_id-1, usernameNumberArticleComment);
			}
			else
			{
				console.log(postCount);
				$('.UserProfile__stats > span')[1].remove();
				var span = $('<span><a href="/@stoodkev">' + postCount + ' articles </a></span>');
				$('.UserProfile__stats > span')[0].after('<span><a href="/@stoodkev">' + postCount + ' Articles </a></span>');
			}
		}
	});
}