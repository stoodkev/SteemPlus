document.getElementById('vote').addEventListener("click", Upvote);
var weight;
var vpow;
var width=0;
var badge,ben,feedp,del,drop,acc_v,transfers;
var me,acc;
var menus=document.getElementsByClassName("menu");
var content=document.getElementsByClassName("content");
var back=document.getElementsByClassName("back_menu");

$('#shortcuts').hide();
// Get local parameters stored using Chrome Storage API
chrome.storage.local.get(['sessionToken','tokenExpire','weight','resteem','blacklist','whitelist','reputation','rep','badge','del','ben','feedp','drop','acc_v','transfers'], function (items) {
    var steemConnect=(items.sessionToken===undefined||items.tokenExpire===undefined||items.tokenExpire<Date.now())?{connect:false}:{connect:true,sessionToken:items.sessionToken,tokenExpire:items.tokenExpire};

    if(steemConnect.connect===true)
    {
      sc2.init({
        app: 'steem-plus',
        callbackURL: 'https://steemit.com/@stoodkev',
        accessToken: steemConnect.sessionToken,
        scope: ['vote', 'comment','comment_options']
      });
      sc2.me().then((mee)=> {

        $('#shortcuts').show();

        me=mee.name;
        acc=mee.account;
        console.log(me,acc,mee);
      $('#connected').css('display','block');
      $('#disconnected').css('display','none');
      $('#before_connect').css('display','none');
      $('.id_user').html('@'+me);
      $('.id_user').attr('href','https://steemit.com/@'+me);
      $('.id_user').attr('target','_blank');
      $('.rep_user').html(' ('+
        steem.formatter.reputation(acc.reputation)+
        ')');
      getVotingPower();
      });
    }
    else {
      $('#disconnected').css('display','block');
        $('#connected').css('display','none');
        $('#before_connect').css('display','none');
    }
    weight=items.weight;
    badge=items.badge==undefined?'2':items.badge;
    feedp=items.feedp==undefined?'show':items.feedp;
    ben=items.ben==undefined?'show':items.ben;
    del=items.del==undefined?'show':items.del;
    transfers=items.transfers==undefined?'show':items.transfers;
    acc_v=items.acc_v==undefined?'show':items.acc_v;
    drop=items.drop==undefined?'show':items.drop;
    //console.log(items.resteem);
    if(weight!==undefined)
    {
        document.getElementById('weight').value=weight;
        document.getElementById("myRange").value=weight;
    }

    $('input[name=badges][value='+badge+']').prop('checked',true);
    $('input[name=feedp][value='+feedp+']').prop('checked',true);
    $('input[name=del][value='+del+']').prop('checked',true);
    $('input[name=ben][value='+ben+']').prop('checked',true);
    $('input[name=drop][value='+drop+']').prop('checked',true);
    $('input[name=acc_v][value='+acc_v+']').prop('checked',true);
    $('input[name=transfers][value='+transfers+']').prop('checked',true);

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

document.getElementById("myRange").oninput = function() {
    document.getElementById("weight").value = this.value;
}

document.getElementById("weight").onblur = function() {
    document.getElementById("myRange").value = parseInt(this.value);
    chrome.storage.local.set({
        weight:document.getElementById('weight').value
    });
}


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
$(document).on("change","input[name=acc_v]",function(){
    chrome.storage.local.set({
        acc_v:$("input[name=acc_v]:checked").val()
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
$(document).on("change","input[name=transfers]",function(){
    chrome.storage.local.set({
        transfers:$("input[name=transfers]:checked").val()
    });
});

$(document).on("change","input[name=drop]",function(){
    chrome.storage.local.set({
        drop:$("input[name=drop]:checked").val()
    });
});

// Save all parameters locally before upvote
function SaveParameters(){
  if(document.getElementById('weight').value<0||document.getElementById('weight').value>100||document.getElementById('weight').value=='')
  {
    alert('The voting weight has to be between 0 and 100%');
  }
  else
  {
      chrome.storage.local.set({
          weight:document.getElementById('weight').value
      });
      weight=document.getElementById('weight').value;
      getVotingPower();
  }
}

// Calculates and show voting power
function getVotingPower() {
    var secondsago = (new Date - new Date(acc.last_vote_time + "Z")) / 1000;
    vpow = acc.voting_power + (10000 * secondsago / 432000);
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

$('#shortcuts img').click(function(){
  var command=this.id;
  chrome.runtime.sendMessage({command: command},
        function (response) {});
});

// Upvote current url according to parameters
function Upvote(){
    SaveParameters();
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
       tab=tabs[0].url;
    if(tab.split('@')[tab.split('@').length-1].split('/')[0]!==''&&tab.split('@')[tab.split('@').length-1].split('/')[1]!=='' )
        sc2.vote(
            me, // Voter
            tab.split('@')[tab.split('@').length-1].split('/')[0], // Author
            tab.split('@')[tab.split('@').length-1].split('/')[1], // Permlink
            document.getElementById('weight').value*100, // Weight (10000 = 100%)
            function(err, result) {
                console.log(err,result);
                if(err!==undefined&&err!==null&&err.cause!==undefined&&err.cause.toString().includes('Voting weight is too small, please accumulate more voting power or steem power.'))
                    alert('Voting weight is too small, please accumulate more voting power or steem power.');
                else {
                        var code = 'window.location.reload();';
                        chrome.tabs.executeScript(tab.id, {code: code});
                }

            }
        );
    else alert('The current URL does not correspond to a post. Click to "... ago" on the post summary to change the url.')
    });

}
