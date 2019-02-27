var autU,token_utopian_post,isSelectRewardDropdown=null;
var category,repository,template=null;
var categories=['analysis','blog','bug-hunting','copywriting','development','documentation','graphics','ideas','social','translations','tutorials','video-tutorials'];
var replaceSecond=false;
var isUtopianPost=false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.to=='utopian_post'){
    autU=request.data.user;
    if(request.order==='start'&&token_utopian_post==null)
    {
      token_utopian_post=request.token;
      autU=request.data.user;
      isSelectRewardDropdown=true;
      startUtopianPost();
    }
    if(request.order==='click'&&token_utopian_post==request.token)
    {
      isSelectRewardDropdown=true;
      autU=request.data.user;
      startUtopianPost();
    }
  }
});

function startUtopianPost(){
  if(window.location.href!="https://steemit.com/submit.html")
    return;
    category=null;
    repository=null;
    replaceSecond=false;
    if($("input[name='category']").val().match(/^utopian-io /)&&!isUtopianPost){
        openUtopianDialog();
      }
    $("input[name='category']").on("input",function(e){
    if($("input[name='category']").val().match(/^utopian-io /)&&!isUtopianPost){
        openUtopianDialog();
      }
    else if(isUtopianPost&&!$("input[name='category']").val().match(/^utopian-io /)){
      utopianPost(false);
    }
    else if(isUtopianPost&&$("input[name='category']").val().match(/^utopian-io /)&&!$("input[name='category']").val().includes(category)){
      utopianPost(false);
      openUtopianDialog();
    }
  });
}

function openUtopianDialog(){
  var div = document.createElement('div');
  div.id = 'overlay_utopian';
  var inner = "";
    inner = '<div data-reactroot="" role="dialog" style="bottom: 0px; left: 0px; overflow-y: scroll; position: fixed; right: 0px; top: 0px;"><div class="reveal-overlay fade in" style="display: block;"></div><div class="reveal fade in" role="document" tabindex="-1" style="display: block;"><button class="close-button" type="button"><span aria-hidden="true" class="">×</span></button><div>'+
    '<div><h3>Post to Utopian</h3></div>' +
    '<div id= "disclaimer_utopian">You are about to post a contribution on Utopian. Before you post, make sure to review the <a href="https://join.utopian.io/guidelines/">guidelines</a>.'+
    '<br>If you change your mind and want to create a non-Utopian post, simply remove the utopian-io tag.</div>'+
    '<h4>Contribution category:</h4>'+
    '<select id="select_contribution_type"><option value="" disabled selected>Select a category</option>'+
    '<option name="c_type" value="analysis">Analysis</option>'+
    '<option name="c_type" value="blog">Blog</option>'+
    '<option name="c_type" value="bug-hunting">Bug Hunting</option>'+
    '<option name="c_type" value="copywriting">Copywriting</option>'+
    '<option name="c_type" value="development">Development</option>'+
    '<option name="c_type" value="documentation">Documentation</option>'+
    '<option name="c_type" value="graphics">Graphics</option>'+
    '<option name="c_type" value="ideas">Ideas</option>'+
    '<option name="c_type" value="social">Social</option>'+
    '<option name="c_type" value="translations">Translations</option>'+
    '<option name="c_type" value="tutorials">Tutorials</option>'+
    '<option name="c_type" value="video-tutorials">Video Tutorials</option>'+
    '</select>'+
    '<input type="checkbox" id="override_text" /><label for="override_text">Override post body with Utopian template</label>'+
    '<h4>Github Repository</h4>'+
    '<input id="autocomplete-git"/>'+
    '<button class="button-steemit" id="ok_utopian">OK</button>'+
    '</div></div></div>';
    div.innerHTML = inner;

  $('body').append(div);
  setOkButton();
  var options = {

  url: function(phrase) {
    return "https://api.github.com/search/repositories";
  },
  listLocation: "items",
  list: {
      onClickEvent: function() {
        repository = $("#autocomplete-git").val();
        setOkButton();
      },
  },
  getValue: function(element) {
    return element.full_name;
  },
  ajaxSettings: {
    dataType: "json",
    method: "GET",
    data: {
      dataType: "json"
    }
  },

  preparePostData: function(data) {
    data.q = $("#autocomplete-git").val();
    return data;
  },

  requestDelay: 400
};

$("#autocomplete-git").easyAutocomplete(options);

  if(categories.includes($("input[name='category']").val().split(" ")[1])){
    $("#select_contribution_type option[value="+$("input[name='category']").val().split(" ")[1]+"]").prop("selected",true);
    setTemplate();
    setOkButton();
    replaceSecond=true;
  }
  $('.close-button').click(function(){
    $('#overlay_utopian').remove();
    $("input[name='category']").val("");
  });

  $("#select_contribution_type").change(function(){
    setTemplate();
    setOkButton();
  });

  $("#override_text").change(function(){
    if(!$("#override_text").prop("selected"))
      template=null;
    setTemplate();
  });

  $("#autocomplete-git").on("keyup",function(e){
    repository=null;
    setOkButton();
  });

  $("#ok_utopian").click(function(){
    category=$("#select_contribution_type option:selected").val();
    $('#overlay_utopian').remove();
    if(replaceSecond){
      var tags=$("input[name='category']").val().split(" ");
      $("input[name='category']").val(tags[0]+" "+category+" "+tags.slice(2).join(" "))
    }
    else{
      $("input[name='category']").val("utopian-io"+" "+category);
    }
    if(template!=null){
      if(template.match(/e\.g\. https\:\/\/github\.com\/utopian-io\/utopian\.io/))
      {
        $('.ReplyEditor__body textarea')[0].value="";
        $('.ReplyEditor__body textarea')[0].value =  $('.ReplyEditor__body textarea')[0].value+template.replace("e.g. https://github.com/utopian-io/utopian.io","https://github.com/"+repository);
      }
      else {
        $('.ReplyEditor__body textarea')[0].value="#### Repository: \nhttps://github.com/"+repository+"\n"+template;
      }
    }
    else{
      if(  $("textarea[name='body']")[0].value.match(/Repository[\:]?[\s]+https\:\/\/github.com\/[A-Za-z0-9\_\.\-]+\/([A-Za-z0-9\_\.\-]+)/))
      $('.ReplyEditor__body textarea')[0].value=$("textarea[name='body']").val().replace(/(Repository[\:]?[\s]+https\:\/\/github.com\/)([A-Za-z0-9\_\.\-]+\/[A-Za-z0-9\_\.\-]+)/,"$1"+repository);
      else
        $('.ReplyEditor__body textarea')[0].value="#### Repository: \nhttps://github.com/"+repository+"\n"+$("textarea[name='body']").val();
    }
    var event = new Event('input', {
        bubbles: true
    });
    $('.ReplyEditor__body textarea')[0].dispatchEvent(event);
    event = new Event('keyup', {
        bubbles: true
    });
    $('.ReplyEditor__body textarea')[0].dispatchEvent(event);
    $('.ReplyEditor__body textarea').focus();
    utopianPost(true);
    if($(".utopian-post-buttons").length==0){
      $(".div-benef-steemit-percentage").after("<div class='utopian-post-buttons'>\
      <div class='UserWallet__buysp hollow no-border' id='post-utopian'>Post with Utopian</div><div class='UserWallet__buysp hollow no-border' id='edit-utopian'>Edit</div><div class='UserWallet__buysp hollow no-border' id='cancel-utopian'>Cancel</div>\
      </div>");
    }

    $("#post-utopian").unbind('click').click(async function(){
      var tags = $(' input[tabindex=3]').eq(0).val().split(' ');
      var title=$('.vframe input').eq(0).val();
      var permlink = await window.SteemPlus.Utils.createPermlink(autU,title);
      var body=$('.vframe textarea').eq(0).val();
      var sbd_percent=$('.benef-steemit-percentage').eq(0).val();
      if(title=="")
        alert("Please enter a title!");
      else if(body=="")
        alert("Please write the body content of your post!");
      else{
        var beneficiaries_u=[];
        beneficiaries_u.push({
          account: 'steemplus-pay',
          weight: 100*1
        },{
          account: 'utopian.pay',
          weight: 100*5
        });

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
        author: autU,
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
        author: autU,
        permlink: permlink,
        max_accepted_payout: maximumAcceptedPayout,
        percent_steem_dollars: parseInt(sbd_percent),
        allow_votes: true,
        allow_curation_rewards: true,
        extensions: [
        [0, {
          beneficiaries: beneficiaries_u
        }]
        ]
      }]
      ];
      console.log(operations);
      if(connect.method=="sc2"){
      api.broadcast(
        operations,
        function(e, r)
        {
          if (e)
          {
            if(e.error!==undefined)
            {
              console.log(e,e.error);
              alert('The request was not succesfull. Please make sure that you logged in to SteemPlus via SteemConnect, that all the beneficiaries accounts are correct and than you didn\'t post within the last 5 minutes. If the problem persists please contact @stoodkev on Discord. Error description:' + e.error_description);
            }
          }
          else {
              cleanUtopian();
          }
        });
      }
      else steem_keychain.requestBroadcast(connect.user, operations, "Posting", function(result){
        if (!result.success)
        {
          if(result.error!==undefined)
          {
            console.log(result.error);
            alert('The request was not succesfull. Please make sure that you logged in to SteemPlus via SteemConnect, that all the beneficiaries accounts are correct and than you didn\'t post within the last 5 minutes. If the problem persists please contact @stoodkev on Discord. Error description:' + result.error);
          }
        }
        else {
            cleanUtopian();
        }
      });
      }
    });

function cleanUtopian(){
  $('.vframe input').eq(0).val("");
  $('.vframe textarea').eq(0).val("");
   $(' input[tabindex=3]').eq(0).val("");
   var event = new Event('input', {
       bubbles: true
   });
   $('.vframe input')[0].dispatchEvent(event);
   $('.ReplyEditor__body textarea')[0].dispatchEvent(event);
  $(' input[tabindex=3]')[0].dispatchEvent(event);

   event = new Event('keyup', {
       bubbles: true
   });
   $('.vframe input')[0].dispatchEvent(event);
   $('.ReplyEditor__body textarea')[0].dispatchEvent(event);
   $(' input[tabindex=3]')[0].dispatchEvent(event);
   window.location.replace('https://steemit.com');
}

    $("#edit-utopian").unbind('click').click(function(){
        openUtopianDialog();
    });

    $("#cancel-utopian").unbind('click').click(function(){
        $("input[name='category']").val("");
        utopianPost(false);
    });
  });
}

function setOkButton(){
    $("#ok_utopian").prop("disabled",repository==null||$("#select_contribution_type").prop('selectedIndex')==0);
}

function setTemplate(){
  if($("textarea").val()==""||$("#override_text").prop("checked")){
    $.get( "https://raw.githubusercontent.com/utopian-io/editor-templates/master/"+  $("#select_contribution_type option:selected").val(), function( data ) {
      template=data;
    });
  }
}

function utopianPost(bool){
  isUtopianPost=bool;
  $(".button-steemit").toggle(!bool);
  $(".clean-button-steemit").toggle(!bool);
  $(".btn-post-steemit").toggle(!bool);
  $(".utopian-post-buttons").toggle(bool);
}
