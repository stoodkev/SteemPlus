token_board_reward=null;

var retryCountBoardReward=0;

var badgesList = [
	{ name:"firstpost", title:"First Post", description:'Write your first post and you will get this award.'},
	{ name:"firstcomment", title:"First Comment", description:'Write your first comment on someone else post or comment and you will get this award.'},
	{ name:"firstvote", title:"First Upvote", description:'Upvote someone else post or comment and you will get this award.'},
	{ name:"firstpayout", title:"First Payout", description:'This award will be yours when you received your first payment for a post or a comment.'},
	{ name:"firstcommented", title:"First Reply", description:'You get this award when someone reply to one of your post or comment.'},
	{ name:"firstvoted", title:"First Upvoted", description:'You get this award when someone upvote one of your post or comment.'},
	{ name:"posts", title:"Posts", description:'This award rewards you for the post you have written. The more posts you write, the higher your level. If you award is unlocked, the number below indicates your posts level'},
	{ name:"comments", title:"Comments", description:'This award rewards you for the comments you made on others posts or comments.Engage conversations! The more comments you write, the higher your level. If you award is unlocked, the number below indicates your comments level'},
	{ name:"votes", title:"Upvotes", description:'This award show how upvotes you made on on posts and comments. The more posts or comments you upvote, the higher your level. If you award is unlocked, the number below indicates your upvotes level'},
	{ name:"payout", title:"Rewards", description:'This award show your payout performance after writing good posts. If you award is unlocked, the number below indicates your rewards level'},
	{ name:"commented", title:"Replies", description:'Generate conversations. Have people write comments on your post or own comments, and this award is for you. If you award is unlocked, the number below indicates your replies level'},
	{ name:"voted", title:"Upvoted", description:'Get your posts and comments upvoted and raise your level. If you award is unlocked, the number below indicates your level of appreciation'},
	{ name:"topvotedday", title:"Daily Top Upvoted", description:'Write the best post of the day and get it the most voted. If you succeed to be in pole position, this award will be yours. This award rewards posts only. It is a rare award, It is attributed only once per day for a single author. The number on the banner at the bottom of the award indicates the number of times you succeeded to achieve this objective.'},
	{ name:"topcommentedday", title:"Daily Top Commented", description:'Make sure that your post generates an interesting discussion and encourages interaction between the users of the voice. The more reactions on you post, the best. If you succeed to be in pole position, this award will be yours. This award rewards posts only. It is a rare award, It is attributed only once per day for a single author. The number on the banner at the bottom of the award indicates the number of times you succeeded to achieve this objective.'},
	{ name:"toppayoutday", title:"Daily Top Payout", description:'Write the best post of the day and get the biggest reward out of it. If you succeed to be in pole position, this award will be yours. This award rewards posts only. It is a rare award, It is attributed only once per day for a single author. The number on the banner at the bottom of the award indicates the number of times you succeeded to achieve this objective.'},
	{ name:"topvotedweek", title:"Weekly Top Upvoted", description:'Write the best post of the week and get it the most voted. If you succeed to be in pole position for the entire week, this award will be yours. This award rewards posts published between monday 00:00 and sunday at 24:00. It is a very rare award, It is attributed only once per week for a single author. The number on the banner at the bottom of the award indicates the number of times you succeeded to achieve this objective.'},
	{ name:"topcommentedweek", title:"Weekly Top Commented", description:'Make sure that your post generates an interesting discussion and encourages interaction between the users of the voice. The more reactions on you post, the best. If you succeed to be in pole position for the entire week, this award will be yours. This award rewards posts published between monday 00:00 and sunday at 24:00. It is a very rare award, It is attributed only once per week for a single author. The number on the banner at the bottom of the award indicates the number of times you succeeded to achieve this objective.'},
	{ name:"toppayoutweek", title:"Weekly Top Payout", description:'Write the best post of the day and get the biggest reward out of it. If you succeed to be in pole position for the entire week, this award will be yours. This award rewards posts published between monday 00:00 and sunday at 24:00. It is a very rare award, It is attributed only once per week for a single author. The number on the banner at the bottom of the award indicates the number of times you succeeded to achieve this objective.'},
	{ name:"post4day", title:"Daily Author", description:'Every time you write four posts in one day, you will receive this award. The number on the banner at the bottom of the award indicates the number of times you succeeded to achieve this objective. If you write less than 4 posts on the day, you will miss the award. If you write more than 4 posts, you will get the award as usual.'},
	{ name:"postallweek", title:"Weekly Author", description:'Every time you write a post on each day of the week, you will receive this award. The number on the banner at the bottom of the award indicates the number of times you succeeded to achieve this objective. A week begins on monday and ends on sunday. It is not a date to date week. If you miss one post on one day, you will miss the this weekly award and you will have to wait for the next monday to retry to catch this award.'},
	{ name:"postallmonth", title:"Monthly Author", description:'Every time you write a post for each day of the month, you will receive this award. The number on the banner at the bottom of the award indicates the number of times you succeeded to achieve this objective. A month begins the first of the month and ends the last day of the month (like on calendars). It is not a date to date month. If you miss one post on one day, you will miss the this monthly award and you will have to wait for the next month to retry to catch this award.'}
]

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	if(request.to==='board_reward')
	{
		retryCountBoardReward=0;
		if(request.order==='start'&&token_board_reward==null)
		{
			startBoardReward();
		}
	}

});

function startBoardReward()
{
	if(!$('.board-reward-tab').length > 0)
	{
		createBoardRewardTab();
	}
}

function createBoardRewardTab()
{
	if(regexBlogSteemit.test(window.location.href)&&retryCountBoardReward<5)
	{
		if($('.menu').length===0)
		{
			retryCountBoardReward++;
			setTimeout(function(){
				timeoutBoardReward = createBoardRewardTab();
			}, 1000);
		}
		else
		{
			window.SteemPlus.Tabs.createTab({
		      id: 'board-reward',
		      title: 'Awards',
		      enabled: true,
		      createTab: createBoardRewardPage
		    });
		    if(window.location.href.includes('#board-reward'))
				window.SteemPlus.Tabs.showTab('board-reward');
		}
	}
}

function createBoardRewardPage(boardRewardTab)
{
	boardRewardTab.html('<div class="row">\
       <div class="UserProfile__tab_content UserProfile__tab_content_smi UserProfile__tab_content_BoardRewardTab column layout-list">\
          <article class="articles">\
          <div class="BoardRewardTab" style="display: none;">\
            <h1 class="articles__h1" style="margin-bottom:20px">\
              Awards\
          		<div class="thanks-board-rewards">\
       	  			Thanks Project Designer: <a href="/@arcange" class="smi-navigate">@arcange</a> - Web Designer: <a href="/@techybear" class="smi-navigate">@techybear</a> - Graphic Designer: <a href="/@captaink" class="smi-navigate">@captaink</a>\
        		</div>\
            </h1>\
            <hr class="articles__hr"/>\
            <div class="row boardRewardPage"></div>\
          </div>\
          <center class="BoardRewardTabLoading">\
             <div class="LoadingIndicator circle">\
                <div></div>\
             </div>\
          </center>\
       </div>\
    </div>');


    var usernameBoardReward = window.SteemPlus.Utils.getPageAccountName();

  	$.ajax({
      type: "GET",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
      },
      url: 'http://steemitboard.com/get-awards-user.php?name=' + usernameBoardReward,
      success: function(result) {

      	var divBoostrapWrapper = document.createElement('div');
      	$(divBoostrapWrapper).addClass('bootstrap-wrapper');
      	var divContainer = document.createElement('div');
      	$(divContainer).addClass('container');
      	var divRow = document.createElement('div');
      	$(divRow).addClass('row');
		
		var gridClass = 'col-2 column reward-item';
      	badgesList.forEach(function(item){
      		
			var itemReward = $('<div id="pop_' + item.name + '" class="' + gridClass +'" title="' + item.description + '">\
	  				<img src="https://steemitboard.com/@' + usernameBoardReward + '/' + item.name + '.png"/>\
	  				<center class="reward-title">' + item.title + '</center>\
	  			</div>');
			
	  		$(itemReward).attr('data-toggle','popover');
	  	    $(itemReward).attr('data-content','<h5>' + item.description + '</h5>');
	  	    $(itemReward).attr('data-placement','right');
	  	    $(itemReward).attr('title',item.title);
	  	    $(itemReward).attr('data-html','true');
	  	    $(itemReward).attr('animation','false');


	  	    $(itemReward).click(function(){
	  	    	$('.reward-item').popover('hide');
	  	    	$(itemReward).popover('show');
	  	    });
	  	    

	  	    $(divRow).append(itemReward);
      	});

		var res = JSON.parse(result);
      	res.forEach(function(item){
			$(divRow).append($('<div class="' + gridClass +'" title="' + strip(item.description) + '">\
      				<img src="https://steemitboard.com/@' + usernameBoardReward + '/' + item.name + '.png"/>\
      				<center class="reward-title">' + item.title + '</center>\
      			</div>'));
      	});


      	$(divContainer).append(divRow);
      	$(divBoostrapWrapper).append(divContainer);
      	boardRewardTab.find('.articles__hr').after(divBoostrapWrapper);

      	boardRewardTab.find('.BoardRewardTabLoading').hide();
		$('.BoardRewardTab').show();

      },
      error: function(msg) {
        console.log(msg);
      }
    });
}

function strip(html)
{
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}


		
