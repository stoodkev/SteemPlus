var token_witnesses_tab=null;

var userPageRegex = /^.*@([a-z][a-z0-9.\-]+[a-z0-9])$/;
var myUsernameTabWitnesses=null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.to==='witnesses_tab'&&request.order==='start'&&token_witnesses_tab==null)
  {
    token_witnesses_tab=request.token;
    myUsernameTabWitnesses=request.data.user;
    if($('.UserProfile__tab_content_Witnesses').length===0)
      startWitnessesTab();
  }
  else if(request.to==='witnesses_tab'&&request.order==='click'&&token_witnesses_tab==request.token)
  {
    myUsernameTabWitnesses=request.data.user;
    if($('.UserProfile__tab_content_Witnesses').length===0)
      startWitnessesTab();
  }
});

function startWitnessesTab()
{
  console.log('startWitnessesTab');
  window.SteemPlus.Tabs.createTab({
    id: 'witnesses',
    title: 'Witnesses',
    enabled: true,
    createTab: createTabWitnesses
  });
  if(window.location.href.includes('#witnesses'))
    window.SteemPlus.Tabs.showTab('witnesses');
}

function createTabWitnesses(witnessesTab)
{
  var usernameTabWitnesses = window.SteemPlus.Utils.getPageAccountName();
  var isMyPageWitnesses = usernameTabWitnesses===myUsernameTabWitnesses;
  witnessesTab.html('\
    <div class="row">\
      <div class="UserProfile__tab_content UserProfile__tab_content_smi UserProfile__tab_content_Witnesses column layout-list">\
        <article class="articles">\
          <div class="WitnessesTab">\
            <h1 class="articles__h1" style="margin-bottom:20px">\
              ' + (isMyPageWitnesses ? 'My Witnesses' : usernameTabWitnesses + '\'s Witnesses') + '\
            </h1>\
            <hr class="articles__hr"/>\
            <h5 style="margin-bottom:20px">\
              <span class="span-nb-witnesses"></span>\
            </h5>\
            <br>\
            <div class="bootstrap-wrapper">\
              <div class="witnesses-names-list container"></div>\
            </div>\
            <div id="addWitnessDiv">\
              <h1 class="articles__h1 addWitness" style="margin-bottom:20px; margin-top:20px;">\
                Add a new witness\
              </h1>\
              <div class="input-group" style="margin-bottom: 5px;">\
                <input type="text" placeholder="Witness\' name" name="witnessName" value="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" autofocus="">\
                <span class="input-group-label" style="padding-left: 0px; padding-right: 0px;">\
                  <button id="addWitnessButton" name="asset" placeholder="Asset">\
                    Add\
                  </button>\
                </span>\
              </div>\
            </div>\
          </div>\
        </article>\
      </div>\
  </div>');

  $('#addWitnessButton').click(function()
  {
    console.log(this.value);
    steem.api.getAccounts([this.value], function(err, result) {
      if(err) console.log(err);
      else
      {
        console.log('Add as witness ' + this.value);
      }
    });
  });

  steem.api.getAccounts([usernameTabWitnesses], function(err, result) {
    if(err) console.log(err);
    else
    {
      if(isMyPageWitnesses)
        $('#addWitnessDiv').show();
      else
        $('#addWitnessDiv').hide();

      $('.span-nb-witnesses').html('You have currently voted for ' + result[0].witness_votes.length + (result[0].witness_votes.length > 1 ? ' witnesses':' witness') + ' for a maximum of 30.');
      
      var witnessSeparator = $('<hr class="articles__hr"/>');
      var rowWitness = $('<div class="row"></div>');
      var listWitnesses = result[0].witness_votes;
      listWitnesses.sort(function(a, b){
        if(a < b) return -1;
        if(a > b) return 1;
        return 0;
      });
      listWitnesses.forEach(function(witnessItem){
        $(rowWitness).append('<div class="col-4 witness-cells"><h5 class="witness-items"><a href="https://www.steemit.com/@' + witnessItem + '">@' + witnessItem + '</a></h5></div>');
        $(rowWitness).append($('<div class="col-4"></div>'));
        if(isMyPageWitnesses)
        {
          var buttonRemoveWitness = $('<div class="col-4 witness-cells"><label class="button slim hollow primary removeWitnessesLink witness-items" id="' + witnessItem + '">Remove from my witnesses</label></div>');
          
          $(buttonRemoveWitness).click(function(){
            console.log('Unfollow' + this.id);
          });
          $(rowWitness).append(buttonRemoveWitness);
          $(rowWitness).append(witnessSeparator); 
        }
        else
        {
          $(rowWitness).append($('<div class="col-4 witness-cells"></div>'));
          $(rowWitness).append(witnessSeparator);
        }
        
      });
      $('.witnesses-names-list').append(rowWitness);
    }
  });
}