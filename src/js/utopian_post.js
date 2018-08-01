var autU,token_utopian,isSelectRewardDropdown=null;
var category,repository,template=null;
var categories=['analysis','blog','bug-hunting','copywriting','development','documentation','graphics','ideas','social','translations','tutorials','video-tutorials'];
var replaceSecond=false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.to=='utopian'){
    autU=request.data.user;

    if(request.order==='start'&&token_utopian==null)
    {
      token_utopian=request.token;
      isSelectRewardDropdown=request.data.select_reward_dropdown_enabled;
      startUtopianPost();
    }
    if(request.order==='click'&&token_utopian==request.token)
    {
      isSelectRewardDropdown=request.data.select_reward_dropdown_enabled;
      startUtopianPost();
    }
  }
});

function startUtopianPost(){
    $("input[name='category']").on("input",function(e){
      console.log("change");
    if($("input[name='category']").val().match(/^utopian-io/)){
        openUtopianDialog();
      }
    });
}

function openUtopianDialog(){
  var div = document.createElement('div');
  div.id = 'overlay_utopian';
  var inner = "";
    inner = '<div data-reactroot="" role="dialog" style="bottom: 0px; left: 0px; overflow-y: scroll; position: fixed; right: 0px; top: 0px;"><div class="reveal-overlay fade in" style="display: block;"></div><div class="reveal fade in" role="document" tabindex="-1" style="display: block;"><button class="close-button" type="button"><span aria-hidden="true" class="">×</span></button><div>'+
    '<div class="row"><h3 class="column">Post to Utopian</h3></div>' +
    '<div>You are about to post a contribution on Utopian. Before you post, make sure to review the <a href="https://join.utopian.io/guidelines/">guidelines</a>.'+
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
    '<input type="checkbox" id="override_text" checked/><label for="override_text">Override post body with Utopian template</label>'+
    '<h4>Github Repository</h4>'+
    '<input id="repository"></input>'+
    '<button id="ok_utopian">OK</button>'+
    '</div></div></div>';
    div.innerHTML = inner;

  $('body').append(div);
  console.log($("input[name='category']").val().split(" ")[1]);
  if(categories.includes($("input[name='category']").val().split(" ")[1])){
    $("#select_contribution_type option[value="+$("input[name='category']").val().split(" ")[1]+"]").prop("selected",true);
    replaceSecond=true;
  }
  $('.close-button').click(function(){
    $('#overlay_utopian').remove();
  });

  $("#select_contribution_type").change(function(){
    setTemplate();
  });

  $("#override_text").change(function(){
    setTemplate();
  });

}

function setTemplate(){
  if($("textarea").val()==""||$("#override_text").prop("checked")){
    $.get( "https://raw.githubusercontent.com/utopian-io/editor-templates/master/"+  $("#select_contribution_type option:selected").val(), function( data ) {
      template=data;
      console.log("got template");
    });
  }
}
