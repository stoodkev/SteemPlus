document.getElementById('vote').addEventListener("click", Upvote);


var username;
var wif;
var weight;
var vpow;
var width=0;
var badge,ben,feedp,del;

var menus=document.getElementsByClassName("menu");
var content=document.getElementsByClassName("content");
var back=document.getElementsByClassName("back_menu");
// Get local parameters stored using Chrome Storage API
chrome.storage.local.get(['username','wif','weight','resteem','blacklist','whitelist','reputation','rep','badge','del','ben','feedp'], function (items) {
    username=items.username;
    wif=items.wif;
    weight=items.weight;
    badge=items.badge==undefined?'show':items.badge;
    feedp=items.feedp==undefined?'show':items.feedp;
    ben=items.ben==undefined?'show':items.ben;
    del=items.del==undefined?'show':items.del;
    //console.log(items.resteem);
    if(weight!==undefined)
        {
            document.getElementById('weight').value=weight;
            document.getElementById("myRange").value=weight;
           }
           if(username!==undefined)
               document.getElementById('username').value=username;
    if(wif!==undefined)
    document.getElementById('wif').value=wif;
    $('input[name=badges][value='+badge+']').prop('checked',true);
    $('input[name=feedp][value='+feedp+']').prop('checked',true);
    $('input[name=del][value='+del+']').prop('checked',true);
    $('input[name=ben][value='+ben+']').prop('checked',true);



   getAccounts();
});

//Handles menu navigation
Array.from(menus).forEach(function(element, i, arr) {
    element.addEventListener('click', function(){
        content[i].style.display='block';
        Array.from(menus).forEach(function(element, i, arr) {element.style.display="none";});
        document.getElementById("logo").style.display="none";
    });
});

Array.from(back).forEach(function(element, i, arr) {
    element.addEventListener('click', function(){
        content[i].style.display='none';
        Array.from(menus).forEach(function(element, i, arr) {element.style.display="block";});

        document.getElementById("logo").style.display="block";
    });
});

//Handles user inputs (username/voting weight/WIF)
document.getElementById("myRange").oninput = function() {
    document.getElementById("weight").value = this.value;
}

document.getElementById("weight").onblur = function() {
    document.getElementById("myRange").value = parseInt(this.value);
    chrome.storage.local.set({
        weight:document.getElementById('weight').value
    });
}
$("#username").blur(function(){chrome.storage.local.set({
    username: document.getElementById('username').value
});});
$("#wif").blur(function(){chrome.storage.local.set({
    wif:document.getElementById('wif').value
});});
$("#myRange").blur(function(){chrome.storage.local.set({
    weight:document.getElementById('weight').value
});});
$("")

$(document).on("change","input[name=badges]",function(){
    chrome.storage.local.set({
        badge:$("input[name=badges]:checked").val()
    });
});
$(document).on("change","input[name=ben]",function(){
    chrome.storage.local.set({
        ben:$("input[name=ben]:checked").val()
    });
});
$(document).on("change","input[name=feedp]",function(){
    chrome.storage.local.set({
        feedp:$("input[name=feedp]:checked").val()
    });
});
$(document).on("change","input[name=del]",function(){
    chrome.storage.local.set({
        del:$("input[name=del]:checked").val()
    });
});




function getAccounts(){
    steem.api.getAccounts([document.getElementById('username').value], function(err, response){
        if(response[0]!=null&&response[0]!=undefined&&document.getElementById('wif').value!='')
        {getVotingPower(response)}});
}

// Save all parameters locally before upvote
function SaveParameters(){
  if(document.getElementById('weight').value<=0||document.getElementById('weight').value>100||document.getElementById('weight').value=='')
  {
    alert('The voting power has to be between 0 and 100%');
  }
  else
  {
      steem.api.getAccounts([document.getElementById('username').value], function(err, response){
          if(response[0]!=null&&response[0]!=undefined&&document.getElementById('wif').value!='')
          {
              chrome.storage.local.set({
                  username: document.getElementById('username').value,
                  weight:document.getElementById('weight').value,
                  wif:document.getElementById('wif').value
              });
              username=document.getElementById('username').value;
              wif=document.getElementById('wif').value;
              weight=document.getElementById('weight').value;
              getVotingPower(response);

          }
          else alert('Check your username and private wif!');

      });
  }
}

// Calculates and show voting power
function getVotingPower(response) {
    var secondsago = (new Date - new Date(response[0].last_vote_time + "Z")) / 1000;
    vpow = response[0].voting_power + (10000 * secondsago / 432000);
    vpow = Math.min(vpow / 100, 100).toFixed(2);

    if (width === 0) {
        var id = setInterval(function frame() {
            if (width >= vpow) {
                clearInterval(id);
                document.getElementById('bar').style.width = vpow + '%';
                document.getElementById('bar').innerHTML = vpow + '% VP';
            } else {
                width++;
                document.getElementById('bar').style.width = width + '%';
                document.getElementById('bar').innerHTML = width + '%';
            }
        }, 20);
    }

    else {
        document.getElementById('bar').style.width = vpow + '%';
        document.getElementById('bar').innerHTML = vpow + '% VP';
    }
}


// Upvote current url according to parameters
function Upvote(){
    SaveParameters();
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
       tab=tabs[0].url;
    if(tab.split('@')[tab.split('@').length-1].split('/')[0]!==''&&tab.split('@')[tab.split('@').length-1].split('/')[1]!=='' )
        steem.broadcast.vote(
            document.getElementById('wif').value,
            document.getElementById('username').value, // Voter
            tab.split('@')[tab.split('@').length-1].split('/')[0], // Author
            tab.split('@')[tab.split('@').length-1].split('/')[1], // Permlink
            document.getElementById('weight').value*100, // Weight (10000 = 100%)
            function(err, result) {
                console.log(err,result);
                if(err!==undefined&&err!==null&&err.cause!==undefined&&err.cause.toString().includes('Voting weight is too small, please accumulate more voting power or steem power.'))
                    alert('Voting weight is too small, please accumulate more voting power or steem power.');
                else if(err!==null&&err.name!==null)
                    alert('Check your WIF');
                else {
                    chrome.tabs.getSelected(null, function (tab) {
                        var code = 'window.location.reload();';
                        chrome.tabs.executeScript(tab.id, {code: code});
                    });
                }

            }
        );
    else alert('The current URL does not correspond to a post. Click to "... ago" on the post summary to change the url.')
    });

}
