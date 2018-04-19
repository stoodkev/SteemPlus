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

	steem.api.getDiscussionsByAuthorBeforeDate(usernameNumberArticleComment,null, new Date().toISOString().split('.')[0],10000 , function(err, result) {
		if(err) console.log(err)
		else 
		{
			console.log(result);
		// $('.UserProfile__stats > span > a')[1].innerHTML = result.numberPost + ' Posts';
  //       $('.UserProfile__stats > span > a')[1].after($('<span>' + result.numberComments + ' Comments</span>'); 
		}
	});
}