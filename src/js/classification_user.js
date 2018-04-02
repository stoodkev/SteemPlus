var token_classification_user=null;

var userPageRegex = /^.*@([a-z][a-z0-9.\-]+[a-z0-9])$/;

var myUsernameCU=null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.to==='classification_user'&&request.order==='start'&&token_classification_user==null)
  {
    token_classification_user=request.token;
    myUsernameCU = request.data.user;
    startClassificationUser();

  }
  else if(request.to==='classification_user'&&request.order==='click'&&token_classification_user==request.token)
  {
    myUsernameCU = request.data.user;
    startClassificationUser();
  }
});

function startClassificationUser(){
  var elementUserListCU = $('.ptc');
  var elementUserListCU2 = $('.author > strong > a');
  var userListCU = [];

  elementUserListCU.each(function(indexItem, item){
    var usernameCurrentItem = item.href.replace(/^https:\/\/steemit.com\/@/gi, "");
    initClassificationLabel(item, usernameCurrentItem);
    if(userListCU.find(function(e){return e.username===usernameCurrentItem})===undefined)
      userListCU.push({username:usernameCurrentItem, arrayElement:[item]});
    else{
      userListCU.find(function(e){return e.username===usernameCurrentItem}).arrayElement.push(item);
    }
  });

  elementUserListCU2.each(function(indexItem, item){
    var usernameCurrentItem = item.href.replace(/^https:\/\/steemit.com\/@/gi, "");
    initClassificationLabel(item, usernameCurrentItem);
    if(userListCU.find(function(e){return e.username===usernameCurrentItem})===undefined)
      userListCU.push({username:usernameCurrentItem, arrayElement:[item]});
    else{
      userListCU.find(function(e){return e.username===usernameCurrentItem}).arrayElement.push(item);
    }
  });

  if(userListCU.length>0)
  {
    var arrayUsernames = userListCU.map(function(e){return e.username;});

    for(var i = 0; i <= userListCU.length / 100; i++)
    {
      var url = 'https://multi.tube/s/api/accounts-info/' + arrayUsernames.slice(0+i*100, 100+i*100).join(',');
      setTimeout(function(){
        $.ajax({
          type: "GET",
          beforeSend: function(xhttp) {
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
          },
          url: url,
          success: function(result) {
            Object.keys(result.data).map(function(objectKey, index) {
              var value = result.data[objectKey];
              
              if(value!==undefined)
              {
                var userScoreList = [];
                userScoreList.push({name:'Human', cssClass:'human-item', value:(parseFloat(result.data[objectKey].classification_human_score)*100).toFixed(2)});
                userScoreList.push({name:'Bot',cssClass:'bot-item', value:(parseFloat(result.data[objectKey].classification_bot_score)*100).toFixed(2)});
                userScoreList.push({name:'Spammer',cssClass:'spammer-item', value:(parseFloat(result.data[objectKey].classification_spammer_score)*100).toFixed(2)});
                
                userScoreList.sort(function (a, b) {
                  return b.value - a.value;
                });          
      
                userListCU.find(function(e){return e.username===objectKey}).arrayElement.forEach(function(elementListItem){
                  
                  createClassificationLabel(elementListItem, userScoreList, objectKey);
                });
              }
              else
                markAsUnknownStatus(elementListItem)
            });
          },
          error: function(XMLHttpRequest, textStatus, errorThrown) { 
            console.log("Status: " + textStatus + "      Error: " + errorThrown); 
          }
        });
      },2000);
    }

    
  }
}

function createClassificationLabel(element, userScoreList, usernameCU)
{
  var permlinkParam = null;
  if($(element).hasClass('ptc'))
  {
    permlinkParam = $(element).parent().parent().parent().parent().parent().find('.PlainLink').attr('href');
  }
  else
  {
    permlinkParam = $(element).parent().parent().parent().parent().find('.timestamp__link').attr('href');
  }

  $(element).parent().parent().parent().parent().find('.unknown-item').remove();

  var classificationSection = $('<span class="' + userScoreList[0].cssClass + ' classification-section">' + userScoreList[0].name + '</span>');

  $(classificationSection).attr('data-toggle','popover');
  $(classificationSection).attr('data-content','<span name="' + usernameCU + '" class="' + userScoreList[0].cssClass + ' feedback-button">' + userScoreList[0].name + '</span> <span class="value_of popover_classification_value">' + userScoreList[0].value + '%</span><hr/>\
      <span name="' + usernameCU + '" class="' + userScoreList[1].cssClass + ' feedback-button">' + userScoreList[1].name + '</span><span class="value_of popover_classification_value">' + userScoreList[1].value + '%</span><hr/>\
      <span name="' + usernameCU + '" class="' + userScoreList[2].cssClass + ' feedback-button">' + userScoreList[2].name + '</span><span class="value_of popover_classification_value">' + userScoreList[2].value + '%</span>');
  $(classificationSection).attr('data-placement','right');
  $(classificationSection).attr('title', 'Classification');
  $(classificationSection).attr('data-html','true');
  $(classificationSection).attr('animation','false');


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

  $(element).parent().parent().parent().after(classificationSection); 
  
}

function initClassificationLabel(element, usernameCU)
{

  var permlinkParam = null;
  if($(element).hasClass('ptc'))
  {
    permlinkParam = $(element).parent().parent().parent().parent().parent().find('.PlainLink').attr('href');
  }
  else
  {
    permlinkParam = $(element).parent().parent().parent().parent().find('.timestamp__link').attr('href');
  }

  if(permlinkParam===undefined||permlinkParam===null)
    permlinkParam = window.location.href.replace('https://steemit.com', '');


  var classificationSection = $('<span class="unknown-item classification-section">Unknown</span>');

  $(classificationSection).attr('data-toggle','popover');
  $(classificationSection).attr('data-content','<span name="' + usernameCU + '" class="human-item feedback-button">Human</span> <span class="value_of popover_classification_value">0%</span><hr/>\
      <span name="' + usernameCU + '" class="bot-item feedback-button">Bot</span> <span class="value_of popover_classification_value">0%</span><hr/>\
      <span name="' + usernameCU + '" class="spammer-item feedback-button">Spammer</span> <span class="value_of popover_classification_value">0%</span>');
  $(classificationSection).attr('data-placement','right');
  $(classificationSection).attr('title', 'Classification');
  $(classificationSection).attr('data-html','true');
  $(classificationSection).attr('animation','false');


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

  $(element).parent().parent().parent().after(classificationSection); 
  
}

function sendRequestAPICU(classificationParam, usernameParam, permlinkParam)
{

  console.log(JSON.stringify({"classified_account": usernameParam, "classification": classificationParam, "reporting_account": myUsernameCU, "permlink":permlinkParam}));

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
      if(result.status==='ok')
      {
        toastr.success(result.messages.join(' '), titleToastr);
        $('.classification-section').popover('hide');
        $('.classification-section').removeClass('popover-cu-open');

      }
      else
      {
        toastr.error(result.messages.join(' ') + '<br>' + result.error, titleToastr);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) { 
      console.log("Status: " + textStatus + "      Error: " + errorThrown); 
    }
  });
}
