var token_favorite_section=null;

var userPageRegex = /^.*@([a-z][a-z0-9.\-]+[a-z0-9])$/;

var isFavorite=false;
var favorite_list=null;
var indexFav=null;
var nameFav=null;
var myUsername=null;

var isSteemit = null;
var isBusy = null;

var retryCountFavoriteSection = 0;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.to==='favorite_section'&&request.order==='start'&&token_favorite_section==null)
  {
    token_favorite_section=request.token;
    myUsername=request.data.user;
    isSteemit=request.data.steemit;
    isBusy=request.data.busy;
    retryCountFavoriteSection=0;
    checkFavoriteSection();
  }
  else if(request.to==='favorite_section'&&request.order==='click'&&token_favorite_section==request.token)
  {
    myUsername=request.data.user;
    isSteemit=request.data.steemit;
    isBusy=request.data.busy;
    retryCountFavoriteSection=0;
    checkFavoriteSection();
  }
});

// Function used to check the favorite feature
function checkFavoriteSection()
{
  if(isSteemit)
  {
    if(retryCountFavoriteSection<20&&!window.location.href.includes('#')&&(regexBlogSteemit.test(window.location.href)||regexFeedSteemit.test(window.location.href)||regexPostSteemit.test(window.location.href)))
    {
      startFavoriteSection();
    }
  }
  else if(isBusy)
  {
    if(retryCountFavoriteSection<20&&(regexFeedBusy.test(window.location.href)||regexBusy.test(window.location.href)))
    {
      if($('.InterestingPeople').length > 0)
        startFavoriteSection();
      else
      {
        retryCountFavoriteSection++;
        setTimeout(function(){
          checkFavoriteSection()
        }, 1000);
      }
    }
    else if(regexBlogBusy.test(window.location.href)||regexPostBusy.test(window.location.href))
    {
      startFavoriteSection();
    }

  }
}

function startFavoriteSection()
{
  chrome.storage.local.get(['favorite_list'], function(items){
    favorite_list = (items.favorite_list==undefined ? [] : items.favorite_list);
    console.log(favorite_list);
    // Display favorites
    favorite_list.forEach(function(favorite, indexFavList, fav_list)
    {
      steem.api.getDiscussionsByAuthorBeforeDate(favorite.username,null, new Date().toISOString().split('.')[0],1 , function(err, result)
      {
        if(isSteemit)
        {
          if(favorite.url !== "https://steemit.com"+(result[0] === undefined ? '' : result[0].url))
          {
            fav_list[indexFavList].url = "https://steemit.com"+(result[0] === undefined ? '' : result[0].url);
            fav_list[indexFavList].read = false;
          }

          if(window.location.href === fav_list[indexFavList].url || window.location.href === fav_list[indexFavList].page)
          {
            fav_list[indexFavList].read = true;
          }
        }
        else if(isBusy)
        {
          if(favorite.url !== "https://steemit.com"+(result[0] === undefined ? '' : result[0].url))
          {
            fav_list[indexFavList].url = "https://steemit.com"+(result[0] === undefined ? '' : result[0].url);
            fav_list[indexFavList].read = false;
          }
          console.log('https://busy.org/@' + fav_list[indexFavList].username + '/' + fav_list[indexFavList].url.split('/').slice(-1)[0]);
          if(window.location.href === ('https://busy.org/@' + fav_list[indexFavList].username + '/' + fav_list[indexFavList].url.split('/').slice(-1)[0]) || window.location.href === 'https://busy.org/@' + fav_list[indexFavList].username)
          {
            fav_list[indexFavList].read = true;
          }
        }
        chrome.storage.local.set({
          favorite_list:fav_list
        });
      });
    });

    if(isSteemit)
    {
      if($('.c-sidebar--right').length > 0){
        if(favorite_list.length>0)
          displayFavoriteSection();
      }
    }
    else if(isBusy)
    {
      if($('.InterestingPeople').length > 0){
        if(favorite_list.length > 0)
          displayFavoriteSection();
      }
    }
    
    // Display add to / remove from favorites
    if(window.location.href.match(userPageRegex)!==null){
      var userNameCurrentPage = window.location.href.match(userPageRegex)[1];
      if(userNameCurrentPage!==myUsername)
      {
        isFavorite=favoriteListContains(userNameCurrentPage);
        displayButtonAddRemoveFavorites(userNameCurrentPage);
      }
      else
      {
        if($('.favorite-star').length > 0){
          $('.favorite-star').remove();
        }
      }
    }
  });
}

function displayFavoriteSection()
{
  $('.favorite-section').remove();

  if(isSteemit)
  {
    var div = document.createElement('div');
    $(div).addClass('favorite-section');
    var divSideBarModule = document.createElement('div');
    $(divSideBarModule).addClass('c-sidebar__module');

    var divSideBarHeader = document.createElement('div');
    $(divSideBarHeader).addClass('c-sidebar__header');

    var h3SideBarH3 = document.createElement('h3');
    $(h3SideBarH3).addClass('c-sidebar__h3');

    var divSideBarContent = document.createElement('div');
    $(divSideBarContent).addClass('c-sidebar__content');

    var ulSideBarList = document.createElement('ul');
    $(ulSideBarList).addClass('c-sidebar__list');
  }
  else if(isBusy)
  {
    var div = $('<div class="favorite-section SidebarContentBlock">\
       <h4 class="SidebarContentBlock__title"><i class="iconfont icon-group SidebarContentBlock__icon"></i> <span>Favorites</span></h4>\
       <div class="SidebarContentBlock__content">\
       </div>\
    </div>');

    $('.InterestingPeople').eq(0).after(div);
  }


  favorite_list.forEach(function(favorite, indexFavList, fav_list)
  {
    if(isSteemit)
    {
      var liSideBarListItem = document.createElement('li');
      $(liSideBarListItem).addClass('c-sidebar__list-item');
      $(liSideBarListItem).addClass('favorite-item');

      var aSideBarLink = document.createElement('a');
      $(aSideBarLink).addClass('c-sidebar__link');
      $(aSideBarLink).click(function(){
        window.location.href = favorite.page;
      });

      var spanDeleteFavorite = document.createElement('span');
      $(spanDeleteFavorite).addClass('span-delete-favorite');
      $(spanDeleteFavorite).attr('name', favorite.username);
      $(spanDeleteFavorite).attr('title', "Remove from the followers");
      $(spanDeleteFavorite).append('  x');
      $(spanDeleteFavorite).click(function(){
        indexFav=indexFavList;
        nameFav=favorite.username;

        deleteFromFavorites(favorite.username);
        $(div).remove();
        startFavoriteSection();
      });


      if(!favorite.read)
      {
        var labelNew = $('<div class="new-indicator"><span>New Post</span></div>');
        $(aSideBarLink).append(labelNew);
      }

      $(aSideBarLink).after(spanDeleteFavorite);
      $(aSideBarLink).prepend(favorite.username);

      $(liSideBarListItem).append(aSideBarLink);
      $(liSideBarListItem).append(spanDeleteFavorite);

      $(ulSideBarList).append(liSideBarListItem);
    }
    else if(isBusy)
    {
      console.log(favorite);
      var userLinkElement = $('<div class="User">\
        <div class="User__top">\
          <div class="User__links">\
             <a href="/@' + favorite.username + '">\
             </a>\
             <a title="' + favorite.username + '" class="User__name" href="/@' + favorite.username + '">\
             <span class="username">' + favorite.username + '</span></a>\
          </div>\
          <div class="User__follow"><button class="Follow Follow--secondary removeBtn" title="Remove as favorite">X</button></div>\
        </div>\
        <div class="User__divider"></div>\
      </div>');

      $(userLinkElement).find('.removeBtn').click(function(){
        indexFav=indexFavList;
        nameFav=favorite.username;

        deleteFromFavorites(favorite.username);
        $(userLinkElement).remove();
        startFavoriteSection();
      });

      if(!favorite.read)
      {
        var labelNew = $('<div class="new-indicator"><span>New Post</span></div>');
        $(userLinkElement).find('.User__links').append(labelNew);
      }

      $('.favorite-section').find('.SidebarContentBlock__content').append(userLinkElement);
    }
  });

  if(isSteemit)
  {
    $(divSideBarContent).append(ulSideBarList);

    $(h3SideBarH3).append('My Favorites');
    $(divSideBarHeader).append(h3SideBarH3);
    $(divSideBarModule).append(divSideBarHeader);
    $(divSideBarModule).append(divSideBarContent);
    $(div).append(divSideBarModule);

    $('aside.c-sidebar--right').append(div);
  }
}

function displayButtonAddRemoveFavorites(userNameCurrentPage)
{
  if($('.articles__header-col').length===0)
  {
    if(retryCountFavoriteSection<20&&!window.location.href.includes('#')&&(regexBlogSteemit.test(window.location.href)||regexFeedSteemit.test(window.location.href)))
    {
      retryCountFavoriteSection++;
      setTimeout(function(){
        displayButtonAddRemoveFavorites(userNameCurrentPage);
      },1000);
    }
  }
  else
  {
    if($('.favorite-star').length > 0){
      $('.favorite-star').remove();
    }
    var star = document.createElement('div');
    $(star).addClass('favorite-star');
    $(star).attr('title', 'Add ' + userNameCurrentPage + ' to your favorites');
    (isFavorite ? $(star).addClass('is-favorite') : $(star).addClass('add-as-favorite'));
    $('.articles__header-col')[0].after(star);

    $('.favorite-star').click(function(){
      $('.favorite-star').prop('disabled', true);

      if(!isFavorite)
      {
        if(addToFavorites(userNameCurrentPage)){
          $('.favorite-star').addClass('is-favorite');
          $('.favorite-star').removeClass('add-as-favorite');
          isFavorite=true;
        }
      }
      else
      {
        isFavorite=false;
        $('.favorite-star').removeClass('is-favorite');
        $('.favorite-star').addClass('add-as-favorite');
        deleteFromFavorites(userNameCurrentPage);
      }
      $('.favorite-star').prop('disabled', false);
    });
  }
  
}

function addToFavorites(userNameCurrentPage)
{

  if(favorite_list.length<10)
  {
    var alreadyAdded = favoriteListContains(userNameCurrentPage, favorite_list);
    if(alreadyAdded)
    {
      return true;
    }
    else{
      steem.api.getDiscussionsByAuthorBeforeDate(userNameCurrentPage,null, new Date().toISOString().split('.')[0],1 , function(err, result)
      {
        favorite_list.push({username:userNameCurrentPage, page:window.location.href, url:(result[0] === undefined ? '' : 'https://steemit.com'+result[0].url), read:true});
        chrome.storage.local.set({
          favorite_list:favorite_list
        });
      });
      return true;
    }
  }
  else
  {
    toastr.options = {
      "closeButton": true,
      "debug": false,
      "newestOnTop": false,
      "progressBar": false,
      "positionClass": "toast-bottom-center",
      "preventDuplicates": false,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "5000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    }
    toastr.warning("You can't have more than 10 favorites. Please remove one before adding another one.", "SteemPlus");
    return false;
  }

}

function deleteFromFavorites(userNameCurrentPage)
{
  favorite_list.forEach(function(favorite, indexFavList)
  {
    if(favorite.username===userNameCurrentPage)
    {
      favorite_list.splice(indexFavList, 1);
      chrome.storage.local.set({
        favorite_list:favorite_list
      });
    }
  });
  if(isBusy && favorite_list.length===0) $('.favorite-section').remove();
}

function favoriteListContains(userName)
{
  return favorite_list.find(function(e){return e.username===userName;})!==undefined;

}
