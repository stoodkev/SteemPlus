/**
 * Created by quent on 10/27/2017.
 */

 var created_benef=false;
 var beneficiaries;
 const STEEM_PLUS_FEED=5;
 var autb=null;
 var token_benef=null;
 var communities=['minnowsupport',
 'utopian-io',
 'adsactly'
 ];
 chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.to=='ben'){
    autb=request.data.user;
    if(request.order==='start'&&token_benef==null)
    {
      token_benef=request.token;
      startBeneficiaries();
    }
    if(request.order==='click'&&token_benef==request.token)
      onClickB();
  }
});
 function startBeneficiaries(){
  if(regexCreatePostSteemit.test(window.location.href))
    addBeneficiariesButton();
}

function onClickB(){
  if(regexCreatePostSteemit.test(window.location.href)&&!created_benef){
    addBeneficiariesButton();
  }
  if(!regexCreatePostSteemit.test(window.location.href)){
    created_benef=false;
  }
}

function addBeneficiariesButton(){

  var benef_div = document.createElement('div');
  benef_div.style.width = '100%';
  benef_div.style.marginBottom = '2em;';
  var benef_button = document.createElement('input');
  benef_button.value = 'Add beneficiaries';
  benef_button.type='button';
  benef_button.className = 'UserWallet__buysp button benef';

  benef_div.appendChild(benef_button);
  $('.vframe__section--shrink')[$('.vframe__section--shrink').length-1].after(benef_div);
  $('.benef').click(function(){
    
    if($('.beneficiaries-warning-message').length === 0 ) $('.benef').after('<p class="beneficiaries-warning-message">By using the beneficiaries feature, you accept that @steem-plus will be set as a 5% beneficiary.</p>');
    
    $('.beneficiaries-warning-message').parent().after('<li class="beneficiaries"><div class="benef_elt"><span class="sign" >@</span><input type="text" placeholder="username"></div><div class="benef_elt" style="width: 15%;"><input style="width: 75%;" type="number" placeholder="10"><span class="sign" >%</span></div><a  class="close"></a> </li>');
    if($('.close').length===1) {
      var buttonPost = $('.vframe__section--shrink button')[2];
      $(buttonPost).hide();
      if($('.post').length===0) {
        $('.beneficiaries').after('<li class="post"><div class="inline_button"><input type="button" class="UserWallet__buysp button postbutton" value="Post"/></div></li>');
        $('.postbutton').click(function (){if(isEverythingFilled()) postBeneficiaries();});
      }
      else
       $('h5,.post').show();
   }

   setCloseListener();

 });
  created_benef=true;
}

function setCloseListener(){
  $('.close').each(function(i){
    $(this).off("click");
    $(this).on("click",function() {
      $('.beneficiaries')[i].remove();
      if($('.close').length===0) {
        $('.vframe__section--shrink button').show();
        $('h5,.post').hide();
      }
      setCloseListener();
    });
  });
}



function isEverythingFilled()
{
  beneficiaries=[];
  if($('.vframe__section--shrink button').is(":disabled"))
  {
    alert("Please enter a title, body and tags to your post!");
    return false;
  }

  var total_percent=0;
  var hasEmpty=0;
  var hasWrongPercent=0;
  $('.beneficiaries').each(function(i,e){
    hasEmpty+=$(e).find('input').eq(0).val()===''?1:0;
    hasEmpty+=$(e).find('input').eq(1).val()===''?1:0;
    hasWrongPercent+=($(e).find('input').eq(1).val()<=0||isNaN($(e).find('input').eq(1).val())||$(e).find('input').eq(1).val()>100)?1:0;
    total_percent+=parseInt($(e).find('input').eq(1).val());
    beneficiaries.push({
      account: $(e).find('input').eq(0).val(),
      weight: 100*parseInt($(e).find('input').eq(1).val())
    });
  });

  if(hasEmpty!==0)
  {
    alert("Please enter the name and percentage for each beneficiary!");
    return false;
  }
  if(hasWrongPercent!==0)
  {
    alert("Percentage should be greater than 0 and smaller or equal to 100! (Including 5% SteemPlus fee)");
    return false;
  }
  if(total_percent>95)
  {
    alert("Total beneficiary rewards must be smaller or equal to 95%!");
    return false;
  }
  return   true;
}

function postBeneficiaries()
{
  console.log(autb);
  var tags=$(' input[tabindex=3]').eq(0).val().split(' ');
  var author=autb;
  var title=$('.vframe input').eq(0).val();
  var permlink=$('.vframe input').eq(0).val().toLowerCase()
  .replace(/ /g,'-')
  .replace(/[^\w-]+/g,'');
  var body=$('.vframe textarea').eq(0).val();
  var sbd_percent=$(".vframe select").eq(1).find(':selected').index()==0?0:10000;
  if(communities.includes(autb))
    console.log('no fee');
  else
    beneficiaries.push({
      account: 'steem-plus',
      weight: 100*STEEM_PLUS_FEED
    });
  if(beneficiaries.length>6)
  {
    alert("You have set up too many beneficiaries (max number=5, 6 for registered communities)");
  }

  var operations = [
  ['comment',
  {
    parent_author: '',
    parent_permlink: tags[0],
    author: author,
    permlink: permlink,
    title: title,
    body: body,
    json_metadata : JSON.stringify({
      tags: tags,
      app: 'steem-plus-app'
    })
  }
  ],
  ['comment_options', {
    author: author,
    permlink: permlink,
    max_accepted_payout: '100000.000 SBD',
    percent_steem_dollars: sbd_percent,
    allow_votes: true,
    allow_curation_rewards: true,
    extensions: [
    [0, {
      beneficiaries: beneficiaries
    }]
    ]
  }]
  ];

  console.log(operations);

  sc2.broadcast(
    operations,
    function(e, r) 
    {
      if (e) 
      {
        console.log(e.error,r);
        if(e.error!==undefined)
        {
          // If there is an error, we check usernames to make sure all of them are correct
          var usernamesBenef = [];
          beneficiaries.forEach(function(item){
            usernamesBenef.push(item.account);
          });

          // Trying to retrieve account with given usernames
          steem.api.getAccounts(usernamesBenef, function(err, result) {
            var errorUsernames = [];
            usernamesBenef.forEach(function(item){
              // Account not in result are not correct.
              if(result.find(function(e){return e.name===item})===undefined)
                errorUsernames.push(item);
            });
            // Display an error message for those accounts
            if(errorUsernames.length > 0) alert('The following usernames are not correct : ' + errorUsernames.join(', '));
            // If all the accounts name are correct then display error message. Problem might come from steemConnect.
            else
              alert('The request was not succesfull. Please make sure that you logged in to SteemPlus via SteemConnect, that all the beneficiaries accounts are correct and than you didn\'t post within the last 5 minutes. If the problem persists please contact @stoodkev on Discord. Error code:'+e.error);
          });
        }
      } 
      else {
        window.location.replace('https://steemit.com');
      }
    });
}
