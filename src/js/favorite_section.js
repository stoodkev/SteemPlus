var token_favorite_section=null;

var feedPageRegex = /^.*@([a-z][a-z0-9.\-]+[a-z0-9])\/feed/;
var userPageRegex = /^.*@([a-z][a-z0-9.\-]+[a-z0-9])$/;
var userNameCurrentPage=null;

var isFavorite=false;
var favorite_list=null;
var indexFav=null;
var nameFav=null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.to==='favorite_section'&&request.order==='start'&&token_favorite_section==null)
  {
    token_favorite_section=request.token;

    chrome.storage.local.get(['favorite_list'], function(items){
      favorite_list = (items.favorite_list==undefined ? [] : items.favorite_list);
      // Display favorites
      

      if(window.location.href.match(feedPageRegex)!==null){
        if(favorite_list.length>0)
          startFavoriteSection();
      }
      
      // Display add to / remove from favorites
      if(window.location.href.match(userPageRegex)!==null){
        userNameCurrentPage = window.location.href.match(userPageRegex)[1];
        favorite_list.forEach(function(favorite, indexFavList)
        {
          if(favorite.username===userNameCurrentPage)
          {
            isFavorite=true;
            indexFav=indexFavList;
            nameFav=favorite.username;
            return;
          }
        });
        displayButtonAddRemoveFavorites();
      }

    });
  }
});

function startFavoriteSection()
{
  var div = document.createElement('div');
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
  

  favorite_list.forEach(function(favorite, indexFavList, fav_list)
  {
    console.log(favorite);
    steem.api.getDiscussionsByAuthorBeforeDate(favorite.username,null, new Date().toISOString().split('.')[0],1 , function(err, result) 
    {
      var liSideBarListItem = document.createElement('li');
      $(liSideBarListItem).addClass('c-sidebar__list-item');
      $(liSideBarListItem).addClass('favorite-item');
    
      var aSideBarLink = document.createElement('a');
      $(aSideBarLink).addClass('c-sidebar__link');
      $(aSideBarLink).click(function(){
        var win = window.open(favorite.page, '_blank');
        if (win) 
        {
          $(spanDeleteFavorite).find('div.new-indicator').remove();
          fav_list[indexFavList].url = result[0].url;
          chrome.storage.local.set({
            favorite_list:favorite_list
          });
          $(div).remove();
          startFavoriteSection();
        } 
        else
        {
          alert('Please allow popups for this website');
        }
      });



      var spanDeleteFavorite = document.createElement('span');
      $(spanDeleteFavorite).addClass('span-delete-favorite');
      $(spanDeleteFavorite).attr('name', favorite.username);
      $(spanDeleteFavorite).attr('title', "Remove from the followers");
      $(spanDeleteFavorite).append('  x');
      $(spanDeleteFavorite).click(function(){
        indexFav=indexFavList;
        nameFav=favorite.username;

        deleteFromFavorites();
        $(div).remove();
        startFavoriteSection();
      });

      if(result[0].url !== favorite.url)
      {
        var labelNew = $('<div class="new-indicator"><span>New</span></div>');
        $(aSideBarLink).append(labelNew);
      }

      $(aSideBarLink).after(spanDeleteFavorite);
      $(aSideBarLink).prepend(favorite.username);

      $(liSideBarListItem).append(aSideBarLink);
      $(liSideBarListItem).append(spanDeleteFavorite);

      $(ulSideBarList).append(liSideBarListItem);
    });
  });

  $(divSideBarContent).append(ulSideBarList);

  $(h3SideBarH3).append('My Favorites');
  $(divSideBarHeader).append(h3SideBarH3);
  $(divSideBarModule).append(divSideBarHeader);
  $(divSideBarModule).append(divSideBarContent);
  $(div).append(divSideBarModule);

  $('aside.c-sidebar--right').append(div);
}

function displayButtonAddRemoveFavorites()
{
  var star = document.createElement('div');
  $(star).addClass('favorite-star');
  (isFavorite ? $(star).addClass('is-favorite') : $(star).addClass('add-as-favorite'));
  $('.articles__header-col')[0].after(star);
  
  $('.favorite-star').click(function(){
    if(!isFavorite)
    {
      setTimeout(function(){
        $('.favorite-star').addClass('is-favorite');
        $('.favorite-star').removeClass('add-as-favorite');
        addToFavorites();
        isFavorite=true;
      }, 250);
    }
    else
    {
      setTimeout(function(){
        isFavorite=false;
        $('.favorite-star').removeClass('is-favorite');
        $('.favorite-star').addClass('add-as-favorite');
        deleteFromFavorites();
      }, 250);
      
    }

  });
}

function addToFavorites()
{
  steem.api.getDiscussionsByAuthorBeforeDate(userNameCurrentPage,null, new Date().toISOString().split('.')[0],1 , function(err, result) 
  {
    favorite_list.push({username:userNameCurrentPage, page:window.location.href, url:'https://steemit.com'+result[0].url});
    chrome.storage.local.set({
      favorite_list:favorite_list
    });
  }); 
}

function deleteFromFavorites()
{
  favorite_list.splice(indexFav, 1);
  chrome.storage.local.set({
    favorite_list:favorite_list
  });
}
