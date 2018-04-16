var token_witnesses_tab=null;

var userPageRegex = /^.*@([a-z][a-z0-9.\-]+[a-z0-9])$/;
var myUsernameTabWitnesses=null;
var refreshPageWitnessInterval=null;

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
    title: 'Witness',
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
              ' + (isMyPageWitnesses ? 'My itnesses' : '@'+usernameTabWitnesses + '\'s witnesses') + '\
            </h1>\
            <hr class="articles__hr"/>\
            <div class="switch-field" style="margin-bottom: -4px;">\
              <input type="radio" id="mentions-type-posts" name="mentions-type" class="mentions-type" value="0" checked/>\
              <label for="mentions-type-posts" class="mentions-type" >Posts</label>\
              <input type="radio" id="mentions-type-comments" name="mentions-type" class="mentions-type" value="1" />\
              <label for="mentions-type-comments" class="mentions-type">Comments</label>\
              <input type="radio" id="mentions-type-both" name="mentions-type" class="mentions-type" value="2" />\
              <label for="mentions-type-both" class="mentions-type">Both</label>\
            </div>\
            <br>\
            <br>\
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
              <div class="inputAddNewWitness" style="margin-bottom: 5px;">\
                <input type="text" id="addWitnessName" name="witnessName" placeholder="Witness Name">\
                <input type="submit" id="addWitnessButton" value="Add">\
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

      $('.span-nb-witnesses').html((isMyPageWitnesses ? 'You have' : '@'+usernameTabWitnesses + ' has' ) + ' currently voted for ' + result[0].witness_votes.length + (result[0].witness_votes.length > 1 ? ' witnesses':' witness') + ' out of 30.');

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

        $(rowWitness).append('<div class="col-4 witness-cells ' + classOddEven + '"><a class="witness-items" href="https://steemdb.com/@' + witnessItem + '/witness" target="_blank">@' + witnessItem + '</a></div>');
        $(rowWitness).append($('<div class="col-4 witness-cells ' + classOddEven + '"></div>'));
        if(isMyPageWitnesses)
        {
          var divButtonRemoveWitness = $('<div class="col-4 witness-cells ' + classOddEven + '"></div>');
          var buttonRemoveWitness = $('<label class="button slim hollow primary removeWitnessesLink witness-items" id="' + witnessItem + '">Unvote</label>');

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
