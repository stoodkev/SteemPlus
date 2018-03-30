var token_classification_user=null;

var userPageRegex = /^.*@([a-z][a-z0-9.\-]+[a-z0-9])$/;

var myUsernameCU=null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.to==='classification_user'&&request.order==='start'&&token_classification_user==null)
  {
    token_classification_user=request.token;
    startClassificationUser();

  }
  else if(request.to==='classification_user'&&request.order==='click'&&token_classification_user==request.token)
  {
    startClassificationUser();
  }
});

function startClassificationUser(){
  var elementUserListCU = $('.ptc');
  var userListCU = [];
  if(elementUserListCU.length>0)
  {
    elementUserListCU.each(function(indexItem, item){
      var usernameCurrentItem = item.href.replace(/^https:\/\/steemit.com\/@/gi, "");
      if(userListCU.find(function(e){return e.username===usernameCurrentItem})===undefined)
        userListCU.push({username:usernameCurrentItem, arrayElement:[item]});
      else{
        userListCU.find(function(e){return e.username===usernameCurrentItem}).arrayElement.push(item);
      }
    });


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
                  
                  createClassificationLabel(elementListItem, userScoreList);
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

function createClassificationLabel(element, userScoreList)
{
  var classificationSection = $('<span class="' + userScoreList[0].cssClass + ' classification-section">' + userScoreList[0].name + '</span>');

  $(classificationSection).attr('data-toggle','popover');
  $(classificationSection).attr('data-content','<span class="' + userScoreList[0].cssClass + ' classification-section feedback-button">' + userScoreList[0].name + '</span> <span class="value_of">' + userScoreList[0].value + '%</span><hr/>\
      <span class="' + userScoreList[1].cssClass + ' classification-section feedback-button">' + userScoreList[1].name + '</span><span class="value_of">' + userScoreList[1].value + '%</span><hr/>\
      <span class="' + userScoreList[2].cssClass + ' classification-section feedback-button">' + userScoreList[2].name + '</span><span class="value_of">' + userScoreList[2].value + '%</span>');
  $(classificationSection).attr('data-placement','right');
  $(classificationSection).attr('title', 'Classification');
  $(classificationSection).attr('data-html','true');
  $(classificationSection).attr('animation','false');


  $(classificationSection).click(function(){
    $('.classification-section').popover('hide');
    $(classificationSection).popover('show');
  });

  $('.feedback-button').click(function(){
    console.log(this);
    if($(this).hasClass('human-item'))
    {

      alert('Clicked on human-item');
    }
    else if($(this).hasClass('bot-item'))
    {
      alert('Clicked on bot-item');
    }
    else
    {
      alert('Clicked on spammer-item');
    }
    $('.classification-section').popover('hide');
  });


  $(element).parent().parent().parent().after(classificationSection); 
}
