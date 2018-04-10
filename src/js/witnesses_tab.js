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
              <div class="input-group inputAddNewWitness" style="margin-bottom: 5px;">\
                <input id="addWitnessName" type="text" placeholder="Witness\' name" name="witnessName" value="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" autofocus="">\
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
    var newWitnessName = $('#addWitnessName')[0].value;
    steem.api.getAccounts([newWitnessName], function(err, result) {
      
      toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-bottom-center",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
      };
      var titleToastr = "SteemPlus - Vote for witness";

      if(err) 
      {
        console.log(err);
        toastr.error('Unknown error, Please try again later', titleToastr);
      }
      else
      {
        if(result.length > 0)
        {
          var win = window.open('https://v2.steemconnect.com/sign/account-witness-vote?witness=' + newWitnessName + '&approve=1', '_blank');
          if (win) {
              win.focus();
          } else {
              alert('Please allow popups for this website');
          }
        }
        else
        {
          toastr.error('Unknown user. Please check the username.', titleToastr);
        }
      }
    });
  });

  addListWitness(usernameTabWitnesses, isMyPageWitnesses);
}

function addListWitness(usernameTabWitnesses, isMyPageWitnesses)
{
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
      listWitnesses.forEach(function(witnessItem, index){
        var classOddEven = '';
        if(index%2===0) classOddEven = 'evenLine';

        $(rowWitness).append('<div class="col-4 witness-cells ' + classOddEven + '"><h5 class="witness-items"><a href="https://www.steemit.com/@' + witnessItem + '">@' + witnessItem + '</a></h5></div>');
        $(rowWitness).append($('<div class="col-4 ' + classOddEven + '"></div>'));
        if(isMyPageWitnesses)
        {
          var divButtonRemoveWitness = $('<div class="col-4 witness-cells ' + classOddEven + '"></div>');
          var buttonRemoveWitness = $('<label class="button slim hollow primary removeWitnessesLink witness-items" id="' + witnessItem + '">Remove from my witnesses</label>');
          
          $(buttonRemoveWitness).click(function(){
            var win = window.open('https://v2.steemconnect.com/sign/account-witness-vote?witness=' + this.id + '&approve=0', '_blank');
            if (win) {
                win.focus();
            } else {
                alert('Please allow popups for this website');
            }
          });

          $(divButtonRemoveWitness).append(buttonRemoveWitness);
          $(rowWitness).append(divButtonRemoveWitness);
          $(rowWitness).append(witnessSeparator); 
        }
        else
        {
          $(rowWitness).append($('<div class="col-4 witness-cells ' + classOddEven + '"></div>'));
          $(rowWitness).append(witnessSeparator);
        }
        
      });
      $('.witnesses-names-list').append(rowWitness);
    }
  });
}