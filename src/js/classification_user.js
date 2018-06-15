var token_classification_user=null;

var userPageRegex = /^.*@([a-z][a-z0-9.\-]+[a-z0-9])$/;

var myUsernameCU=null;
var scrollBottomReachedCU = false;
var nbElementPageAuthor=0;

// retry count. If this count reach 20, feature stop
var retryCountClassificationUser=0;
// retry count for scroll event
var retryCountScrollUpdate=0;

var isSteemit = null;
var isBusy = null;

var heightBusyScrollPage = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.to==='classification_user'&&request.order==='start'&&token_classification_user==null)
  {
    token_classification_user=request.token;
    myUsernameCU = request.data.user;
    isSteemit=request.data.steemit;
    isBusy=request.data.busy;
    nbElementPageAuthor=0;
    retryCountClassificationUser=0;
    $('.has-classification').removeClass('has-classification');
    canStartClassificationUser();

  }
  else if(request.to==='classification_user'&&request.order==='click'&&token_classification_user==request.token)
  {
    myUsernameCU = request.data.user;
    isSteemit=request.data.steemit;
    isBusy=request.data.busy;
    nbElementPageAuthor=0;
    retryCountClassificationUser=0;
    $('.has-classification').removeClass('has-classification');
    canStartClassificationUser();
  }
});

// Function used to start the classification user feature
// This function will check depending on the url if the feature needs to be started
// Feature available on Busy and Steemit
// This function will start again until the needed element is not loaded
function canStartClassificationUser()
{
  if( (regexClassificationUserBlogSteemit.test(window.location.href)
    ||regexFeedPlusSteemit.test(window.location.href)
    ||regexFeedSteemit.test(window.location.href)
    ||regexPostSteemit.test(window.location.href))
    &&retryCountClassificationUser<20)
  {
    if($('.Post').length > 0)
    {
      // Case article
      if(document.readyState == 'complete'&&$('.Comment__body').length>(parseFloat($('.PostFull__responses > a')[0].innerText) / 2))
      {
        startClassificationUser();
      }
      else
      {
        setTimeout(function(){
          canStartClassificationUser();
        }, 1000);
      }
    }
    else
    {
      // Case feed, blog
      if(nbElementPageAuthor===$('.author').length)
      {
        setTimeout(function(){
          retryCountClassificationUser++;
          canStartClassificationUser();
        }, 1000);
      }
      else
      {
        startClassificationUser();
      }
    }
  }
  else if(regexBusy.test(window.location.href)||regexFeedBusy.test(window.location.href))
  {
    if(nbElementPageAuthor===$('.Story__header__flex > a > h4 > .username').length)
    {
      setTimeout(function(){
        retryCountClassificationUser++;
        canStartClassificationUser();
      }, 1000);
    }
    else
    {
      startClassificationUser();
    }
  }
  else if(regexFeedPlusBusy.test(window.location.href))
  {
    if(nbElementPageAuthor===$('.Story__header__text > a').length)
    {
      setTimeout(function(){
        retryCountClassificationUser++;
        canStartClassificationUser();
      }, 1000);
    }
    else
    {
      startClassificationUser();
    }
  }
  else if(regexPostBusy.test(window.location.href)&&!window.location.href.includes('/transfers'))
  {
    if(nbElementPageAuthor===$('.Comment__text').length)
    {
      setTimeout(function(){
        retryCountClassificationUser++;
        canStartClassificationUser();
      }, 1000);
    }
    else
    {
      startClassificationUser();
    }
  }
}

// Function used to start the classification
// This function will get all the usernames on the page and then call the Steem Sincerity api
function startClassificationUser(){

  var elementUserListCU = null;
  var elementUserListCU2 = null;

  // Get elements. The css class we need to get depends on the current page
  if(isBusy)
  {
    // If post page
    if(isBusy&&regexPostBusy.test(window.location.href)&&!window.location.href.includes('/transfers'))
    {
      elementUserListCU = $('.StoryFull__header__text > a');
      elementUserListCU2 = $('.Comment__text > a');
    }
    // If page is feed+ for busy
    else if(regexFeedPlusBusy.test(window.location.href))
    {
      elementUserListCU = $('.Story__header__text > a');
    }
    else
    {
      // Other pages for busy
      elementUserListCU = $('.Story__header__flex > a');
      elementUserListCU2 = $('.User__links a.User__name');
    }
  }
  else if(isSteemit)
  {
    // Steemit only has one kind of class
    elementUserListCU = $('.ptc');
    elementUserListCU2 = $('.author > strong > a');
  }
  
  var userListCU = [];
  // Get username and elements (html objects)
  if(elementUserListCU!==null)
    elementUserListCU.each(function(indexItem, item){
      if(!$(item).hasClass('has-classification'))
      {
        if(isSteemit)
          var usernameCurrentItem = item.href.replace(/^https:\/\/steemit.com\/@/gi, "");
        else if(isBusy)
          var usernameCurrentItem = item.href.replace(/^https:\/\/busy.org\/@/gi, "");

        if(userListCU.find(function(e){return e.username===usernameCurrentItem})===undefined)
          userListCU.push({username:usernameCurrentItem, arrayElement:[item], userScoreList:[]});
        else{
          userListCU.find(function(e){return e.username===usernameCurrentItem}).arrayElement.push(item);
        }
      }
    });
  if(elementUserListCU2!==null)
    elementUserListCU2.each(function(indexItem, item){
      if(!$(item).hasClass('has-classification'))
      {
        if(isSteemit)
          var usernameCurrentItem = item.href.replace(/^https:\/\/steemit.com\/@/gi, "");
        else if(isBusy)
          var usernameCurrentItem = item.href.replace(/^https:\/\/busy.org\/@/gi, "");

        if(userListCU.find(function(e){return e.username===usernameCurrentItem})===undefined)
          userListCU.push({username:usernameCurrentItem, arrayElement:[item], userScoreList:[]});
        else{
          userListCU.find(function(e){return e.username===usernameCurrentItem}).arrayElement.push(item);
        }
      }
    });

  // Only get data if there is entries
  if(userListCU.length>0)
  {
    var arrayUsernames = userListCU.map(function(e){return e.username;});

    getDataFromAPICU(userListCU, arrayUsernames, 0, arrayUsernames.length/100)

    // show all the classification sections
    $('.classification-section').show();
    
    // Update reference values
    if(isSteemit) 
    {
      nbElementPageAuthor = $('.author').length;
      nbElementComment = $('.Comment__body').length;
    }
    else if(isBusy)
    {
      heightBusyScrollPage = $('.redux-infinite-scroll').height();
      nbElementPageAuthor = $('.Story__header__flex > a').length;
    } 
  }

  // On scroll listener
  // We need this listener on the list when new posts are display when user reach the end of the page
  $(window).unbind('scroll').scroll(function() {
    // Need two different cases
    // Steemit
    if(isSteemit&&$(window).scrollTop() + $(window).height() >= $('.articles').height()) {
      if(!scrollBottomReachedCU){
        scrollBottomReachedCU=true;
        onScrollUpdateCU();
      }
    }
    // Busy
    else if(isBusy && heightBusyScrollPage !== $('.redux-infinite-scroll').height()) {
      if(!scrollBottomReachedCU){
        scrollBottomReachedCU=true;
        onScrollUpdateCU();
      }
    }
  });

  // Feed+ listener
  $('#validate_settings').on('click', function(){
    setTimeout(startClassificationUser, 1000);
  });
}

// Function used to get the data from the API.
// @parameter userListCU : all the user. This list will be use to create the buttons later
// @parameter arrayUsernames : list of all the names without duplicates. Use to send the request
// @parameter i : current index
// @paramter max : maximum index
function getDataFromAPICU(userListCU, arrayUsernames, i, max)
{
  // This request need to have all the parameters in the url. You can only pass 100 usernames at a time
  var url = 'https://multi.tube/s/api/accounts-info/' + arrayUsernames.slice(0+i*100, 100+i*100).join(',');
  // We use a timeout because SteemSincerity doesn't allow too many request. One query every 2 seconds
  setTimeout(function(){
    $.ajax({
      type: "GET",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
      },
      url: url,
      success: function(result) {
        
        // For each line of the result set we created a hashmap with username and the score for each category
        Object.keys(result.data).map(function(objectKey, index) {
          var userScoreList = [];
          userScoreList.push({name:'Human', cssClass:'human-item', value:(parseFloat(result.data[objectKey].classification_human_score)*100).toFixed(2)});
          userScoreList.push({name:'Bot',cssClass:'bot-item', value:(parseFloat(result.data[objectKey].classification_bot_score)*100).toFixed(2)});
          userScoreList.push({name:'Spammer',cssClass:'spammer-item', value:(parseFloat(result.data[objectKey].classification_spammer_score)*100).toFixed(2)});

          // Sorting user score list. Highest value first
          userScoreList.sort(function (a, b) {
            return b.value - a.value;
          });
          userListCU.find(function(e){return e.username===objectKey}).userScoreList = userScoreList.slice();

        });

        // If index is not the maximum, call the function again
        if(i+1 < max)
          getDataFromAPICU(userListCU, arrayUsernames, i+1, max);
        else
          addButtonsCU(userListCU); // If not start adding buttons
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.log("Status: " + textStatus + "      Error: " + errorThrown);
      }
    });
  },2000);
}

// Function used to created all the buttons
// @parameter userListCU : list of all the users, there scores and the graphical element linked to it.
function addButtonsCU(userListCU)
{
  userListCU.forEach(function(userListItem){
    userListItem.arrayElement.forEach(function(elementListItem){
      $(elementListItem).addClass('has-classification');
      if(userListItem.userScoreList.length!==0)
        createClassificationLabel(elementListItem, userListItem.userScoreList, userListItem.username);
    });
  });
}

// Function used to get the permlink of a post
// The way to get the permlink depend on which element it is.
// @parameter element : select graphical element (post)
// RETURN permlink
function getPermlink(element)
{
  var permlinkParam = null;
  if(isSteemit)
  {
    if($(element).hasClass('ptc'))
    {
      // Post
      permlinkParam = $(element).parent().parent().parent().parent().parent().find('.PlainLink').attr('href');
    }
    else if(window.location.href.includes('#plus'))
    {
      // Feed +
      permlinkParam = $(element).parent().parent().parent().find('a').attr('href');
    }
    else if(window.location.href.includes('#mentions'))
    {
      // Mention tab
      permlinkParam = $(element).parent().parent().parent().find('a').attr('href');
    }
    else
    {
      // Blog
      permlinkParam = $(element).parent().parent().parent().parent().find('.timestamp__link').attr('href');
    }

    if(permlinkParam===undefined||permlinkParam===null||permlinkParam==='')
      permlinkParam = window.location.href.replace('https://steemit.com', '');
  }
  else if(isBusy)
  {
    // Welcome page busy
    if(regexBusy.test(window.location.href))
      permlinkParam = $(element).parent().parent().parent().parent().find('.Story__content > a').eq(0).attr('href');
    else
      permlinkParam = 'https://busy.org'; //If there is no permlink found, get busy adress
  }
  return permlinkParam;
}

// Function used to create classification label. This is the label which is displayed on the page
// @parameter element : graphical element linked to an element
// @parameter userScoreList : scores returned by Steem Sincerity API
// @parameter usernameCU : username for the give element
function createClassificationLabel(element, userScoreList, usernameCU)
{
  // Get the permlink for this element
  var permlinkParam = getPermlink(element);

  // If unknow item present, delete it
  $(element).parent().parent().parent().parent().find('.unknown-item').remove();
  
  // Create classification section
  var classificationSection;

  // We decided to add threshold. For bots and Spammers percentage need to be 80 to be considered as a spammer or a bot
  // If not we classified them as pending
  // if user maximum score is not spammer or bot, display informations
  if((userScoreList[0].name==="Bot"||userScoreList[0].name==="Spammer")&&userScoreList[0].value<80)
    classificationSection = $('<span class="unknown-item classification-section">Pending</span>');
  else
    classificationSection = $('<span class="' + userScoreList[0].cssClass + ' classification-section">' + userScoreList[0].name + '</span>');
  

  // Creation of the popover
  $(classificationSection).attr('data-toggle','popover');
  $(classificationSection).attr('data-content','<div '+ (isBusy ? 'class="busy-container"' : '""') + '><span name="' + usernameCU + '" class="' + userScoreList[0].cssClass + ' feedback-button">' + userScoreList[0].name + '</span> <span class="value_of popover_classification_value">' + userScoreList[0].value + '%</span><hr/>\
      <span name="' + usernameCU + '" class="' + userScoreList[1].cssClass + ' feedback-button">' + userScoreList[1].name + '</span><span class="value_of popover_classification_value">' + userScoreList[1].value + '%</span><hr/>\
      <span name="' + usernameCU + '" class="' + userScoreList[2].cssClass + ' feedback-button">' + userScoreList[2].name + '</span><span class="value_of popover_classification_value">' + userScoreList[2].value + '%</span></div>');
  $(classificationSection).attr('data-placement','right');
  $(classificationSection).attr('title', 'Classification');
  $(classificationSection).attr('data-html','true');
  $(classificationSection).attr('animation','false');


  // Trigger the click on the label to open the popover
  $(classificationSection).click(function(){
    if($(this).hasClass('popover-cu-open'))
    {

      $('.popover').remove();
      $('.classification-section').removeClass('popover-cu-open');
    }
    else
    {
      $('.classification-section').removeClass('popover-cu-open');
      $('.popover').remove();
      $(this).popover('show');
      $(this).addClass('popover-cu-open');
      // Trigger the click on one of the feedback buttons
      // A click will send a request to Steem Sincerity API (see function sendRequestAPICU)
      $('.feedback-button').unbind('click').click(function()
      {
        if($(classificationSection).hasClass('human-item'))
        {
          sendRequestAPICU('content_creator', usernameCU, permlinkParam);
        }
        else if($(classificationSection).hasClass('bot-item'))
        {
          sendRequestAPICU('bot', usernameCU, permlinkParam);
        }
        else
        {
          sendRequestAPICU('spammer', usernameCU, permlinkParam);
        }
      });
    }
  });

  // Add the label to the page depends if user is using steemit or busy (components are differents)
  if(isSteemit)
  {
    $(element).parent().parent().parent().parent().find('.classification-section').remove();
    $(element).parent().parent().parent().after(classificationSection);

    if($('.PostFull__footer .classification-section').length > 0)
      $('.PostFull__footer .classification-section')[0].innerHTML = $('.PostFull__footer .classification-section')[0].innerHTML.substring(0,1);
  }
  else if(isBusy&&$(element).parent().find('.classification-section').length===0)
  {
    $(element).after(classificationSection);
    $('.User__links .classification-section').each(function(){
      $(this)[0].innerHTML = $(this)[0].innerHTML.substring(0,1);
    });
  }
}

// function initClassificationLabel(element, usernameCU)
// {

//   var permlinkParam = getPermlink(element);
  
//   var classificationSection = $('<span class="unknown-item classification-section">Unknown</span>');

//   $(classificationSection).attr('data-toggle','popover');
//   $(classificationSection).attr('data-content','<span name="' + usernameCU + '" class="human-item feedback-button">Human</span> <span class="value_of popover_classification_value">0%</span><hr/>\
//       <span name="' + usernameCU + '" class="bot-item feedback-button">Bot</span> <span class="value_of popover_classification_value">0%</span><hr/>\
//       <span name="' + usernameCU + '" class="spammer-item feedback-button">Spammer</span> <span class="value_of popover_classification_value">0%</span>');
//   $(classificationSection).attr('data-placement','right');
//   $(classificationSection).attr('title', 'Classification');
//   $(classificationSection).attr('data-html','true');
//   $(classificationSection).attr('animation','false');


//   $(classificationSection).click(function(){
//     if($(this).hasClass('popover-cu-open'))
//     {

//       $('.popover').remove();
//       $('.classification-section').removeClass('popover-cu-open');
//     }
//     else
//     {
//       $('.classification-section').removeClass('popover-cu-open');
//       $('.popover').remove();
//       $(this).popover('show');
//       $(this).addClass('popover-cu-open');
//       $('.feedback-button').unbind('click').click(function()
//       {
//         if($(classificationSection).hasClass('human-item'))
//         {
//           sendRequestAPICU('content_creator', usernameCU, permlinkParam);
//         }
//         else if($(classificationSection).hasClass('bot-item'))
//         {
//           sendRequestAPICU('bot', usernameCU, permlinkParam);
//         }
//         else
//         {
//           sendRequestAPICU('spammer', usernameCU, permlinkParam);
//         }
//       });
//     }
//   });
//   $(element).parent().parent().parent().after(classificationSection);
// }


// Function used to send a request to the api
// This request is used to give a feed back to the SteemSincerity API
// @parameter classificationParam  : chosen 'classification' by user (bot, human or spam)
// @parameter usernameParam : name of the chosen user
// @parameter permlink : permlink from where the button has been clicked on
function sendRequestAPICU(classificationParam, usernameParam, permlinkParam)
{

  // Send an AJAX request to SteemSincerity and wait for the result
  $.ajax({
    type: "POST",
    beforeSend: function(xhttp) {
      xhttp.setRequestHeader("Content-type", "application/json");
      xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
    },
    dataType: "json",
    url: 'https://multi.tube/s/api/classification-report/post',
    data: JSON.stringify({"classified_account": usernameParam, "classification": classificationParam, "reporting_account": myUsernameCU, "permlink":permlinkParam}),
    success: function(result) {
      // if request succeed 

      // Init toastr (popup)
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
      };
      var titleToastr = "Steemit Sincerity";
      
      // Need to check the status of the result. Request can succeed (No http error but wrong status)
      if(result.status==='ok')
      {
        // display succes message and hide popup classification
        toastr.success(result.messages.join(' '), titleToastr);
        $('.classification-section').popover('hide');
        $('.classification-section').removeClass('popover-cu-open');
      }
      else
      {
        // display error message
        toastr.error(result.messages.join(' ') + '<br>' + result.error, titleToastr);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      // Request failed : problem with the request
      console.log("Status: " + textStatus + "      Error: " + errorThrown);
    }
  });
}

// Function called when onScroll event is triggered
// This function will wait until the new components (posts) are displayed on the screen and then launch the action
function onScrollUpdateCU()
{
  // Trying for maximum 20 seconds
  if(retryCountScrollUpdate > 20)
  {
    // Reset scroll retry count to be able to try again later and return
    retryCountScrollUpdate = 0;
    return;
  } 

  // Initializing component 
  if(isSteemit) var elementTempLength = $('.author').length;
  else if(isBusy) var elementTempLength = $('.Story').length;

  // If number of element still the same as before onScroll is triggered it mean component are not ready
  if(elementTempLength===nbElementPageAuthor)
  {
    // try again later and add 1 to the count
    setTimeout(function() {
      retryCountScrollUpdate++;
      onScrollUpdateCU();
    }, 1000);
  }
  else
  {
    // Components ready for update
    // Reset retry count and start classification for new users
    retryCountScrollUpdate=0;
    startClassificationUser();
    scrollBottomReachedCU=false;
  }
}
