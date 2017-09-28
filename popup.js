document.getElementById('vote').addEventListener("click", onVote);

var username;
var wif;
var weight;
var vpow;
var width=0;
chrome.storage.local.get(['username','wif','weight','hide_resteem'], function (items) {
    username=items.username;
    wif=items.wif;
    weight=items.weight;
    //console.log(items.hide_resteem);
    if(weight!==undefined)
        {

            document.getElementById('weight').value=weight;
            document.getElementById("myRange").value=weight;
           }
           if(username!==undefined)
               document.getElementById('username').value=username;
    if(wif!==undefined)
    document.getElementById('wif').value=wif;
           if(items.hide_resteem!==undefined)
               document.getElementById('hide_resteem').checked=items.hide_resteem;
    else
               document.getElementById('hide_resteem').checked=false;

   getAccounts();
});

document.getElementById("myRange").oninput = function() {

    document.getElementById("weight").value = this.value;

}

document.getElementById("weight").onblur = function() {

    document.getElementById("myRange").value = parseInt(this.value);
    chrome.storage.local.set({
        weight:document.getElementById('weight').value
    });
}

document.getElementById("hide_resteem").onclick = function() {
    chrome.storage.local.set({
        hide_resteem:document.getElementById('hide_resteem').checked
    });
}


function getAccounts(){
    steem.api.getAccounts([document.getElementById('username').value], function(err, response){
        if(response[0]!=null&&response[0]!=undefined&&document.getElementById('wif').value!='')
        {getVotingPower(response)}});
}

function onSave(){
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
function getVotingPower(response) {
    var secondsago = (new Date - new Date(response[0].last_vote_time + "Z")) / 1000;
    vpow = response[0].voting_power + (10000 * secondsago / 432000);
    vpow = Math.min(vpow / 100, 100).toFixed(2);
   // console.log(vpow);

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

$("#username").blur(function(){chrome.storage.local.set({
    username: document.getElementById('username').value
});});
$("#wif").blur(function(){chrome.storage.local.set({
    wif:document.getElementById('wif').value
});});
$("#myRange").blur(function(){chrome.storage.local.set({
    weight:document.getElementById('weight').value
});});

function onVote(){
    onSave();
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
       tab=tabs[0].url;

        steem.broadcast.vote(
            document.getElementById('wif').value,
            document.getElementById('username').value, // Voter
            tab.split('@')[tab.split('@').length-1].split('/')[0], // Author
            tab.split('@')[tab.split('@').length-1].split('/')[1], // Permlink
            document.getElementById('weight').value*100, // Weight (10000 = 100%)
            function(err, result) {
              //  console.log(err,result);
                if(err!==undefined&&err!==null&&err.cause!==undefined&&err.cause.toString().includes('Voting weight is too small, please accumulate more voting power or steem power.'))
                    alert('Voting weight is too small, please accumulate more voting power or steem power.');
                else if(err!==null&&err.name!==null)
                    alert('Check your WIF');
                else {
                    //alert('Upvoted! Reload the page to see the upvote!');
                    chrome.tabs.getSelected(null, function (tab) {
                        var code = 'window.location.reload();';
                        chrome.tabs.executeScript(tab.id, {code: code});
                    });
                }

            }
        );
    });

}

