document.getElementById('vote').addEventListener("click", Upvote);
var weight;
var vpow;
var width=0;
var badge,ben,feedp,del,drop,acc_v,transfers,oneup;
var me,acc;
var menus=document.getElementsByClassName("menu");
var content=document.getElementsByClassName("content");
var back=document.getElementsByClassName("back_menu");

$('#shortcuts, .switch-text').hide();
// Get local parameters stored using Chrome Storage API
chrome.storage.local.get(['oneup','sessionToken','tokenExpire','weight','resteem','blacklist','whitelist','reputation','rep','badge','del','ben','feedp','drop','acc_v','transfers'], function (items) {
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

        $('#shortcuts, .switch-text').show();

        me=mee.name;
        acc=mee.account;
        console.log(me,acc,mee);
      $('#connected').css('display','block');
      $('#disconnected').css('display','none');
      $('#before_connect').css('display','none');
      $('.id_user').html('@'+me);
      $('.id_user').attr('href','https://steemit.com/@'+me);
      $('.id_user').attr('target','_blank');
      $('.rep_user').html(' '+
        steem.formatter.reputation(acc.reputation)+
        '');
      getVotingPower();
      });
    } else {
        if (items.onboarding == 'complete') {
            $('#onboarding').css('display', 'none');
            $('#disconnected').css('display', 'block');
            $('#connected').css('display', 'none');
            $('#before_connect').css('display', 'none');
        } else {
            $('#onboarding').css('display', 'block');
            $('#before_connect').css('display', 'none');
            $('#connected').css('display', 'none');
        }
    }
    weight=items.weight;
    badge=items.badge==undefined?'2':items.badge;
    feedp=items.feedp==undefined?'show':items.feedp;
    ben=items.ben==undefined?'show':items.ben;
    del=items.del==undefined?'show':items.del;
    oneup=items.oneup==undefined?'show':items.oneup;
    transfers=items.transfers==undefined?'show':items.transfers;
    acc_v=items.acc_v==undefined?'show':items.acc_v;
    drop=items.drop==undefined?'show':items.drop;
    //console.log(items.resteem);
    if(weight!==undefined)
    {
        document.getElementById('weight').value=weight;
        document.getElementById("myRange").value=weight;
    }

    $('option[name=badges][value='+badge+']').prop('selected',true);
    $('input[name=feedp]').prop('checked',feedp=='show');
    $('input[name=del]').prop('checked',del=='show');
    $('input[name=ben]').prop('checked',ben=='show');
    $('input[name=drop]').prop('checked',drop=='show');
    $('input[name=acc_v]').prop('checked',acc_v=='show');
    $('input[name=oneup]').prop('checked',oneup=='show');
    $('input[name=transfers]').prop('checked',transfers=='show');

    var x, i, j, selElmnt, a, b, c;
    /*look for any elements with the class "custom-select":*/
    x = document.getElementsByClassName("custom-select");
    for (i = 0; i < x.length; i++) {
      selElmnt = x[i].getElementsByTagName("select")[0];
      /*for each element, create a new DIV that will act as the selected item:*/
      a = document.createElement("DIV");
      a.setAttribute("class", "select-selected");
      a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
      x[i].appendChild(a);
      /*for each element, create a new DIV that will contain the option list:*/
      b = document.createElement("DIV");
      b.setAttribute("class", "select-items select-hide");
      for (j = 1; j < selElmnt.length; j++) {
        /*for each option in the original select element,
        create a new DIV that will act as an option item:*/
        c = document.createElement("DIV");
        c.innerHTML = selElmnt.options[j].innerHTML;
        c.addEventListener("click", function(e) {
            /*when an item is clicked, update the original select box,
            and the selected item:*/
            var i, s, h;
            s = this.parentNode.parentNode.getElementsByTagName("select")[0];
            this.parentNode.parentNode.getElementsByTagName("select")[0];


            h = this.parentNode.previousSibling;
            for (i = 0; i < s.length; i++) {
              if (s.options[i].innerHTML == this.innerHTML) {
                s.selectedIndex = i;
                h.innerHTML = this.innerHTML;
                break;
              }
            }
            chrome.storage.local.set({
                badge:s[s.selectedIndex].value
            });
            h.click();
        });
        b.appendChild(c);
      }
      x[i].appendChild(b);
      a.addEventListener("click", function(e) {
          /*when the select box is clicked, close any other select boxes,
          and open/close the current select box:*/
          e.stopPropagation();
          closeAllSelect(this);
          this.nextSibling.classList.toggle("select-hide");
          this.classList.toggle("select-arrow-active");
        });
    }
    function closeAllSelect(elmnt) {
      /*a function that will close all select boxes in the document,
      except the current select box:*/
      var x, y, i, arrNo = [];
      x = document.getElementsByClassName("select-items");
      y = document.getElementsByClassName("select-selected");
      for (i = 0; i < y.length; i++) {
        if (elmnt == y[i]) {
          arrNo.push(i)
        } else {
          y[i].classList.remove("select-arrow-active");
        }
      }
      for (i = 0; i < x.length; i++) {
        if (arrNo.indexOf(i)) {
          x[i].classList.add("select-hide");
        }
      }
    }
    /*if the user clicks anywhere outside the select box,
    then close all select boxes:*/
    document.addEventListener("click", closeAllSelect);

});

//Handles menu navigation
Array.from(menus).forEach(function(element, i, arr) {
    element.addEventListener('click', function(){
        content[i].style.display='block';
        Array.from(menus).forEach(function(element, i, arr) {element.style.display="none";});
        document.getElementById("logo").style.display="none";
        $('#powered').css('display','none');
    });
});

Array.from(back).forEach(function(element, i, arr) {
    element.addEventListener('click', function(){
        content[i].style.display='none';
        Array.from(menus).forEach(function(element, i, arr) {element.style.display="block";});
        $('#powered').css('display','block');

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


$(document).on("change","input[name=oneup]",function(){
    chrome.storage.local.set({
        oneup:$("input[name=oneup]").prop('checked')?'show':'hide'
    });
});
$(document).on("change","input[name=ben]",function(){
    chrome.storage.local.set({
        ben:$("input[name=ben]").prop('checked')?'show':'hide'
    });
});
$(document).on("change","input[name=acc_v]",function(){
    chrome.storage.local.set({
        acc_v:$("input[name=acc_v]").prop('checked')?'show':'hide'
    });
});
$(document).on("change","input[name=feedp]",function(){
    chrome.storage.local.set({
        feedp:$("input[name=feedp]").prop('checked')?'show':'hide'
    });
});
$(document).on("change","input[name=del]",function(){
    chrome.storage.local.set({
        del:$("input[name=del]").prop('checked')?'show':'hide'
    });
});
$(document).on("change","input[name=transfers]",function(){
    chrome.storage.local.set({
        transfers:$("input[name=transfers]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=drop]",function(){
    chrome.storage.local.set({
        drop:$("input[name=drop]").prop('checked')?'show':'hide'
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
                document.getElementById('vote-power-stat').innerHTML = vpow + '% VP';
            } else {
                width++;
                document.getElementById('bar').style.width = width + '%';
                document.getElementById('vote-power-stat').innerHTML = width + '%';
            }
        }, 20);
    }

    else {
        document.getElementById('bar').style.width = vpow + '%';
        document.getElementById('vote-power-stat').innerHTML = vpow + '% VP';
    }
}

$('#shortcuts img').click(function(){
  var command=this.id;
  chrome.runtime.sendMessage({command: command},
        function (response) {});
});


$('.menu').click(function () {
  $('#main-description').hide();
});

$('.back_menu').click(function () {
  $('#main-description, .info_user').show();
 });

$('#user-options').click(function () {  
    $('.info_user').hide();
    document.getElementById("logo").style.display = "none";
});

            //Oboarding Flow

            var onBoardingID = 0

            $('#onboard-forward').click(function () {

                onboard(onBoardingID++)

            });

            $('#onboard-restart').click(function () {
                onBoardingID = 0
                setOnboardingScreen('Welcome to Steem+', 'Steem+ lets you take control of your feed, minnows can choose their voting weight and upvote posts in one click on both Steemit and Busy and there\'s more, let\'s show you a few...', 'src/img/onboarding/welcome.png', '#dot-1')
                $('#onboard-restart').css('visibility', 'hidden');
            });

            function setOnboardingScreen(title, text, image, dot) {
                $('.onboard-title').html(title);
                $('.onboard-text').html(text);
                $(".onboard-image").attr("src", image);
                $("span").removeClass("progress-dot-active");
                $(dot).addClass('progress-dot-active');
                $('#onboard-restart').css('visibility', 'visible');
            }

            function onboard(onBoardingID) {
                console.log(onBoardingID);
                if (onBoardingID == 0) {
                    setOnboardingScreen('Feed+', 'Search for what you want, how you want with advanced search options on Steemit.com', 'src/img/onboarding/plus.png', '#dot-2')
                } else if (onBoardingID == 1) {
                    setOnboardingScreen('Add New Features', 'Enhance your Steem experience with features such 1UP, Transfer, Delegate, True Value & Many More.  ', 'src/img/onboarding/extras.png', '#dot-3')
                } else if (onBoardingID == 2) {
                    setOnboardingScreen('Share the love', 'Share your post rewards with the authors you love, every time you use beneficaries you help Steem+ by rewarding us with 5%', 'src/img/onboarding/share.png', '#dot-4')
                    onBoardingID == 3
                } else if (onBoardingID == 3) {
                    setOnboardingScreen('Switch easily', 'One click switching between Steemit, Busy.org, Steemit, Utopian.io and Steemd', 'src/img/onboarding/switch.png', '#dot-5')
                } else {
                    $('#onboarding').hide();
                    $('#disconnected').show();
                    chrome.storage.local.set({
                        onboarding: 'complete'
                    });
                };
            };

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
