var token_select_reward_dropdown = null;
var retryCountSelectRewardDropdown = 0;


var usernameRewardDropdown=null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if(request.to==='select_reward_dropdown'&&request.order==='start'&&token_select_reward_dropdown==null)
    {
      token_select_reward_dropdown = request.token;
      retryCountSelectRewardDropdown=0;
      usernameRewardDropdown = request.data.user;

      startRewardDropdown();
    }
    else if(request.to==='select_reward_dropdown'&&request.order==='click'&&token_select_reward_dropdown===request.token)
    {
      retryCountSelectRewardDropdown=0;
      usernameRewardDropdown = request.data.user;

      startRewardDropdown();
    }
});

function startRewardDropdown()
{
  if(regexCreatePostSteemit.test(window.location.href)&&retryCountSelectRewardDropdown<20)
  {
    if($('.vframe__section--shrink').length > 0)
      createDropdownList();
    else
    {
      retryCountSelectRewardDropdown++;
      setTimeout(startRewardDropdown, 1000);
    }
  }
}

function createDropdownList()
{
  var indexElement = $('.vframe__section--shrink').length-2;
  $('.vframe__section--shrink').eq(indexElement).before($('<div class="div-benef-steemit-percentage"><label>Reward</label><select class="benef-steemit-percentage ant-form-item-control has-success">\
                          <option name="percentage" value="10000">50% SBD and 50% SP</option>\
                          <option name="percentage" value="0">100% Steem Power</option>\
                          <option name="percentage" value="-1">Decline Payout</option>\
                        </select></div>'));

  var buttonPostSteemit = $('.vframe__section--shrink > button > span').eq(0).parent().parent();
  buttonPostSteemit.remove();

  var postClearDiv = $('<div class="vframe__section--shrink post-clear-div"><button class="UserWallet__buysp btn-post-steemit"><span>Post</span></button><button class="UserWallet__buysp hollow no-border clean-button-steemit">Clear</button></div>');
  $('.vframe__section--shrink').eq($('.vframe__section--shrink').length-1).parent().parent().after(postClearDiv);

  $('.clean-button-steemit').unbind('click').click(function(){
    $('.ReplyEditor__title').value = '';
    $('.vframe input').val('');
    $('.vframe textarea').eq(0).val(' ');
    $('.vframe textarea').eq(0).html(' ');
  });

  $('.btn-post-steemit').unbind('click').click(function(){
    var tags=[];
    var title=null;
    var permlink=null;
    var body=null;
    var sbd_percent=null;

    tags = $('input[tabindex=3]').eq(0).val().split(' ');
    permlink=$('.vframe input').eq(0).val().toLowerCase()
    .replace(/ /g,'-')
    .replace(/[^\w-]+/g,'');
    title=$('.vframe input').eq(0).val();
    body=$('.vframe textarea').eq(0).val();
    sbd_percent=$('.benef-steemit-percentage').eq(0).val();

    var maximumAcceptedPayout = '100000.000 SBD';
    if(parseInt(sbd_percent)===-1)
    {
      maximumAcceptedPayout = '0.000 SBD';
      sbd_percent = 10000;
    }

    var operations = [
      ['comment',
      {
        parent_author: '',
        parent_permlink: tags[0],
        author: usernameRewardDropdown,
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
        author: usernameRewardDropdown,
        permlink: permlink,
        max_accepted_payout: maximumAcceptedPayout,
        percent_steem_dollars: parseInt(sbd_percent),
        allow_votes: true,
        allow_curation_rewards: true
      }]
    ];
    sc2.broadcast(
    operations,
    function(e, r) 
    {
      if (e) 
      {
        console.log(e);
        if(e.error!==undefined)
          alert('The request was not succesfull. Please make sure that you logged in to SteemPlus via SteemConnect, that all the beneficiaries accounts are correct and than you didn\'t post within the last 5 minutes. If the problem persists please contact @stoodkev on Discord. Error code:'+e.error);
      } 
      else 
        window.location.replace('https://steemit.com/'+tags[0]+'/@'+usernameRewardDropdown+'/'+title);
    });
  });
}