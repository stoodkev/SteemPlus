document.getElementById('vote').addEventListener("click", Upvote);
var weight;
var vpow;
var width=0;
var badge,ben,feedp,del,drop,acc_v,transfers,oneup,post_votes_list;
var me,acc;
var menus=document.getElementsByClassName("menu");
var content=document.getElementsByClassName("content");
var back=document.getElementsByClassName("back_menu");
var isConnectedToSteemConnect=null;

$('#shortcuts, .switch-text').hide();
// Get local parameters stored using Chrome Storage API
chrome.storage.local.get(['tip_user','resteem_indicator','add_signature','author_popup_info','rewards_tab','wallet_history','article_count','witnesses_tab','classification_user','board_reward','favorite_section','post_floating_bottom_bar','md_editor_beautifier','blog_histogram','user_info_popover','gif_picker','boost_button','followers_table','vote_weight_slider','mentions_tab','search_bar','external_link_tab','vote_tab','steemit_more_info','post_votes_list','onboarding','oneup','sessionToken','tokenExpire','weight','resteem','blacklist','whitelist','reputation','rep','badge','del','ben','feedp','drop','acc_v','transfers'], function (items) {
    var steemConnect=(items.sessionToken===undefined||items.tokenExpire===undefined||items.tokenExpire<Date.now())?{connect:false}:{connect:true,sessionToken:items.sessionToken,tokenExpire:items.tokenExpire};
    isConnectedToSteemConnect = steemConnect.connect;
    // Connected
    if(steemConnect.connect===true)
    {
      sc2.init({
        app: 'steem-plus',
        callbackURL: 'https://steemit.com/@stoodkev',
        accessToken: steemConnect.sessionToken,
        scope: ['vote', 'comment','comment_options, custom_json']
      });
      sc2.me().then((mee)=> {


        me=mee.name;
        acc=mee.account;
        console.log(me,acc,mee);
      if (items.onboarding == 'complete') {
        $('#connected').css('display','block');
        $('#onboarding').css('display', 'none');
        $('#loginButton').css('display','none');
        $('#before_connect').css('display','none');
        $('#shortcuts, .switch-text').show();
        $('.need-online > label > input').prop('disabled', false);
        $('.need-online').removeAttr('title');
        $('.need-online').removeClass('not-allowed');
        $('.info_user_connected').css('display', 'block');
      }
      else {
        $('#onboarding').css('display', 'block');
        $('#before_connect').css('display', 'none');
        $('#connected').css('display', 'none');
        $('#loginButton').css('display', 'none');
        
      }
      $('.id_user').html('@'+me);
      $('.id_user').attr('href','https://steemit.com/@'+me);
      $('.id_user').attr('target','_blank');
      $('.rep_user').html(' '+
        steem.formatter.reputation(acc.reputation)+
        '');
      getVotingPower();
      });
    } 
    // Not connected
    else {
        if (items.onboarding == 'complete') {
            $('#onboarding').css('display', 'none');
            $('#loginButton').css('display', 'block');
            $('#connected').css('display', 'block');
            $('#before_connect').css('display', 'none');
            $('.info_user_connected').css('display', 'none');
            $('#vote-menu').css('display', 'none');
            $('#shortcuts, .switch-text').show();
            $('.need-online > label > input').prop('disabled', true);
            $('.need-online').attr('title', "This feature is not available in offline. Please login to SteemConnect to use it.");
            $('.need-online').prop('checked', false);
        } else {
            $('#onboarding').css('display', 'block');
            $('#before_connect').css('display', 'none');
            $('#connected').css('display', 'none');
            $('#loginButton').css('display', 'none');
            $('.info_user_connected').css('display', 'none');
            $('#vote-menu').css('display', 'none');
        }
    }

    weight=items.weight==undefined?100:items.weight;
    badge=items.badge==undefined?'2':items.badge;
    feedp=items.feedp==undefined?'show':items.feedp;
    ben=items.ben==undefined?'show':items.ben;
    del=items.del==undefined?'show':items.del;
    oneup=items.oneup==undefined?'show':items.oneup;
    transfers=items.transfers==undefined?'show':items.transfers;
    acc_v=items.acc_v==undefined?'show':items.acc_v;
    drop=items.drop==undefined?'show':items.drop;
    board_reward=items.board_reward==undefined?'show':items.board_reward;
    favorite_section=items.favorite_section==undefined?'show':items.favorite_section;
    classification_user=items.classification_user==undefined?'show':items.classification_user;
    witnesses_tab=items.witnesses_tab==undefined?'show':items.witnesses_tab;
    article_count=items.article_count==undefined?'show':items.article_count;
    wallet_history=items.wallet_history==undefined?'show':items.wallet_history;
    rewards_tab=items.rewards_tab==undefined?'show':items.rewards_tab;
    author_popup_info=items.author_popup_info==undefined?'show':items.author_popup_info;
    add_signature=items.add_signature==undefined?'show':items.add_signature;
    resteem_indicator=items.resteem_indicator==undefined?'show':items.resteem_indicator;
    tip_user=items.tip_user==undefined?'show':items.tip_user;

    // Steemit more info
    steemit_more_info=items.steemit_more_info==undefined?'show':items.steemit_more_info;
    post_votes_list=items.post_votes_list==undefined?'show':items.post_votes_list;
    vote_tab=items.vote_tab==undefined?'show':items.vote_tab;
    external_link_tab=items.external_link_tab==undefined?'show':items.external_link_tab;
    search_bar=items.search_bar==undefined?'show':items.search_bar;
    mentions_tab=items.mentions_tab==undefined?'show':items.mentions_tab;
    vote_weight_slider=items.vote_weight_slider==undefined?'show':items.vote_weight_slider;
    followers_table=items.followers_table==undefined?'show':items.followers_table;
    boost_button=items.boost_button==undefined?'show':items.boost_button;
    gif_picker=items.gif_picker==undefined?'show':items.gif_picker;
    user_info_popover=items.user_info_popover==undefined?'show':items.user_info_popover;
    blog_histogram=items.blog_histogram==undefined?'hide':items.blog_histogram; //default hidden
    md_editor_beautifier=items.md_editor_beautifier==undefined?'show':items.md_editor_beautifier;
    post_floating_bottom_bar=items.post_floating_bottom_bar==undefined?'show':items.post_floating_bottom_bar;

    //console.log(items.resteem);
    if(weight!==undefined)
    {
        document.getElementById('weight').value=weight;
        document.getElementById("myRange").value=weight;
    }

    if(steemConnect.connect)
    {
        $('input[name=ben]').prop('checked',ben=='show');
        $('input[name=oneup]').prop('checked',oneup=='show');
        $('input[name=feedp]').prop('checked',feedp=='show');
    }
    
    

    $('option[name=badges][value='+badge+']').prop('selected',true);
    $('input[name=del]').prop('checked',del=='show');
    $('input[name=drop]').prop('checked',drop=='show');
    $('input[name=acc_v]').prop('checked',acc_v=='show');
    $('input[name=transfers]').prop('checked',transfers=='show');
    $('input[name=board_reward]').prop('checked',board_reward=='show');
    $('input[name=favorite_section]').prop('checked',favorite_section=='show');
    $('input[name=classification_user]').prop('checked',classification_user=='show');
    $('input[name=witnesses_tab]').prop('checked',witnesses_tab=='show');
    $('input[name=article_count]').prop('checked',article_count=='show');
    $('input[name=wallet_history]').prop('checked',wallet_history=='show');
    $('input[name=rewards_tab]').prop('checked',rewards_tab=='show');
    $('input[name=author_popup_info]').prop('checked',author_popup_info=='show');
    $('input[name=add_signature]').prop('checked',add_signature=='show');
    $('input[name=resteem_indicator]').prop('checked',resteem_indicator=='show');
    $('input[name=tip_user]').prop('checked',tip_user=='show');

    // Steemit more info
    $('input[name=steemit_more_info]').prop('checked',steemit_more_info=='show');
    $('input[name=post_votes_list]').prop('checked',post_votes_list=='show');
    $('input[name=vote_tab]').prop('checked',vote_tab=='show');
    $('input[name=external_link_tab]').prop('checked',external_link_tab=='show');
    $('input[name=search_bar]').prop('checked',search_bar=='show');
    $('input[name=mentions_tab]').prop('checked',mentions_tab=='show');
    $('input[name=vote_weight_slider]').prop('checked',vote_weight_slider=='show');
    if(steemConnect.connect) $('input[name=followers_table]').prop('checked',followers_table=='show');
    $('input[name=boost_button]').prop('checked',boost_button=='show');
    $('input[name=gif_picker]').prop('checked',gif_picker=='show');
    $('input[name=user_info_popover]').prop('checked',user_info_popover=='show');
    $('input[name=blog_histogram]').prop('checked',blog_histogram=='show');
    $('input[name=md_editor_beautifier]').prop('checked',md_editor_beautifier=='show');
    $('input[name=post_floating_bottom_bar]').prop('checked',post_floating_bottom_bar=='show');

    // if steemit more info is not checked, hide all SMI options
    if(steemit_more_info=='hide')
    {
      $(".sp_option_list").each(function(){
          $(this).hide();
      });
    }

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

$(document).on("change","input[name=post_votes_list]",function(){

    chrome.storage.local.set({
        post_votes_list:$("input[name=post_votes_list]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=vote_tab]",function(){

    chrome.storage.local.set({
        vote_tab:$("input[name=vote_tab]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=external_link_tab]",function(){

    chrome.storage.local.set({
        external_link_tab:$("input[name=external_link_tab]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=search_bar]",function(){

    chrome.storage.local.set({
        search_bar:$("input[name=search_bar]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=mentions_tab]",function(){

    chrome.storage.local.set({
        mentions_tab:$("input[name=mentions_tab]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=vote_weight_slider]",function(){

    chrome.storage.local.set({
        vote_weight_slider:$("input[name=vote_weight_slider]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=followers_table]",function(){

    chrome.storage.local.set({
        followers_table:$("input[name=followers_table]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=boost_button]",function(){

    chrome.storage.local.set({
        boost_button:$("input[name=boost_button]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=gif_picker]",function(){

    chrome.storage.local.set({
        gif_picker:$("input[name=gif_picker]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=user_info_popover]",function(){

    chrome.storage.local.set({
        user_info_popover:$("input[name=user_info_popover]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=blog_histogram]",function(){

    chrome.storage.local.set({
        blog_histogram:$("input[name=blog_histogram]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=md_editor_beautifier]",function(){

    chrome.storage.local.set({
        md_editor_beautifier:$("input[name=md_editor_beautifier]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=post_floating_bottom_bar]",function(){
    chrome.storage.local.set({
        post_floating_bottom_bar:$("input[name=post_floating_bottom_bar]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=favorite_section]",function(){
    chrome.storage.local.set({
        favorite_section:$("input[name=favorite_section]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=board_reward]",function(){
    chrome.storage.local.set({
        board_reward:$("input[name=board_reward]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=classification_user]",function(){
    chrome.storage.local.set({
        classification_user:$("input[name=classification_user]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=witnesses_tab]",function(){
    chrome.storage.local.set({
        witnesses_tab:$("input[name=witnesses_tab]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=article_count]",function(){
    chrome.storage.local.set({
        article_count:$("input[name=article_count]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=wallet_history]",function(){
    chrome.storage.local.set({
        wallet_history:$("input[name=wallet_history]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=rewards_tab]",function(){
    chrome.storage.local.set({
        rewards_tab:$("input[name=rewards_tab]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=author_popup_info]",function(){
    chrome.storage.local.set({
        author_popup_info:$("input[name=author_popup_info]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=add_signature]",function(){
    chrome.storage.local.set({
        add_signature:$("input[name=add_signature]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=resteem_indicator]",function(){
    chrome.storage.local.set({
        resteem_indicator:$("input[name=resteem_indicator]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=tip_user]",function(){
    chrome.storage.local.set({
        tip_user:$("input[name=tip_user]").prop('checked')?'show':'hide'
    });
});

$(document).on("change","input[name=steemit_more_info]",function(){

    chrome.storage.local.set({
        steemit_more_info:$("input[name=steemit_more_info]").prop('checked')?'show':'hide'
    });

    if(!$("input[name=steemit_more_info]").prop('checked'))
    {
      $(".sp_option_list").each(function(){
          $(this).hide();
      });
    }
    else
    {
      $(".sp_option_list").each(function(){
          $(this).show();
      });
    }
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
        }, 10);
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
  $('#loginButton').hide();
});

$('.back_menu').click(function () {
  $('#main-description, .info_user').show();
  
  if(!isConnectedToSteemConnect){
    $('#loginButton').show();
    $('#more_menu').hide();
    $('#vote-menu').css('display', 'none');
  }
  else
  {
    $('#loginButton').hide();
    $('#more_menu').show();
    $('#vote-menu').css('display', 'block');
  }

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
                setOnboardingScreen('Welcome to SteemPlus', 'SteemPlus lets you take control of your feed, choose your voting weight as minnow and much much more, let\'s take a tour of the features', 'src/img/onboarding/welcome.png', '#dot-1')
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
                if (onBoardingID == 0) {
                    setOnboardingScreen('Feed+', 'Search for the content that fits you, using advanced filters and sorting options.', 'src/img/onboarding/plus.png', '#dot-2')
                } else if (onBoardingID == 1) {
                    setOnboardingScreen('Add New Features', 'Enhance your Steem experience with new features such as Utopian-1UP (curation trail for Utopian), Direct Transfer, Delegation, True Account Value, STEEM/SBD price & much more.  ', 'src/img/onboarding/extras.png', '#dot-3')
                } else if (onBoardingID == 2) {
                    setOnboardingScreen('Share the love', 'Share your post rewards with the authors you love. Beneficiaries receive automatically a share of your post (specified by yourself) in Steem Power.', 'src/img/onboarding/share.png', '#dot-4')
                    onBoardingID == 3
                } else if (onBoardingID == 3) {
                    setOnboardingScreen('Switch easily', 'One click switch between Steemit, Busy.org, Steemit, Utopian.io and Steemd', 'src/img/onboarding/switch.png', '#dot-5')
                }
                else if (onBoardingID == 4) {
                  setOnboardingScreen('Witness', 'You like this extension and want to support its development?<br/> Vote for his creator @stoodkev as a <a target="_blank" href="https://v2.steemconnect.com/sign/account-witness-vote?witness=stoodkev&amp;approve=1"> witness</a>!', 'src/img/onboarding/welcome.png', '#dot-6')
              } else {
                    if(isConnectedToSteemConnect)
                    {
                        $('#connected').css('display','block');
                        $('#onboarding').css('display', 'none');
                        $('#loginButton').css('display','none');
                        $('#before_connect').css('display','none');
                        $('#shortcuts, .switch-text').show();
                        $('.need-online > label > input').prop('disabled', false);
                        $('.need-online').removeAttr('title');
                        $('.need-online').removeClass('not-allowed');
                        $('.info_user_connected').css('display', 'block');
                    }
                    else
                    {
                        $('#onboarding').css('display', 'none');
                        $('#loginButton').css('display', 'block');
                        $('#connected').css('display', 'block');
                        $('#before_connect').css('display', 'none');
                        $('.info_user_connected').css('display', 'none');
                        $('#vote-menu').css('display', 'none');
                        $('#shortcuts, .switch-text').show();
                        $('.need-online > label > input').prop('disabled', true);
                        $('.need-online').attr('title', "This feature is not available in offline. Please login to SteemConnect to use it.");
                        $('.need-online').prop('checked', false);
                    }
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
