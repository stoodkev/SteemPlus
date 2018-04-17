var token_witnesses_tab=null;

var userPageRegex = /^.*@([a-z][a-z0-9.\-]+[a-z0-9])$/;
var myUsernameTabWitnesses=null;
var refreshPageWitnessInterval=null;

var witnessInfoLocal = null;
var witnessRankLocal = null;

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
// ' + (isMyPageWitnesses ? 'My witnesses' : '@'+usernameTabWitnesses + '\'s witnesses') + '
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
              Witnesses\
            </h1>\
            <hr class="articles__hr"/>\
            <div class="switch-field capitalize-label" style="margin-bottom: -4px;">\
              <input type="radio" id="my-witness" name="witness-type" class="witness-type" value="0" disabled/>\
              <label for="witness-type-my" class="witness-type my-witness">Witness Information</label>\
              <input type="radio" id="witness-out" name="witness-type" class="witness-type" value="1"/>\
              <label for="witness-type-out" class="witness-type witness-out" >Votes casted</label>\
              <br>\
              <br>\
            </div>\
            <center class="WitnessTabLoading">\
              <div class="LoadingIndicator circle">\
                <div></div>\
              </div>\
            </center>\
            <div class="witness-content"></div>\
            <br>\
          </div>\
        </article>\
      </div>\
  </div>');

  $('.switch-field').hide();

  if(witnessRankLocal===null)
  {
    console.log("Launch request get-witness-rank");
    $.ajax({
      type: "GET",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", "efonwuhf7i2h4f72h3o8fho23fh7");
      },
      url: 'http://steemplus-api.herokuapp.com/api/get-witnesses-rank',
      success: function(result) {
        witnessRankLocal = result;
        managedTabWitness(usernameTabWitnesses, isMyPageWitnesses);

      },
      error: function(msg) {
        alert(msg.responseJSON.error);
      }
    });
  }
  else
  {
    console.log("Local get-witness-rank");
    managedTabWitness(usernameTabWitnesses, isMyPageWitnesses);
  }

}

function managedTabWitness(usernameTabWitnesses, isMyPageWitnesses)
{
  if(isWitness(usernameTabWitnesses, witnessRankLocal))
  {
    $('#my-witness').prop('checked', true);

    $('.my-witness').unbind('click').click(function(){
      if(!$('#my-witness').prop('checked'))
      {
        $('.witness-type').prop('checked', false);
        $('#my-witness').prop('checked', true);

        $('.WitnessTabLoading').show();
        $('.witness-content').empty();
        startMyWitnessTab(usernameTabWitnesses, witnessRankLocal);
      }
    });

    $('.witness-out').unbind('click').click(function(){

      if(!$('#witness-out').prop('checked'))
      {

        $('.witness-type').prop('checked', false);
        $('#witness-out').prop('checked', true);
        $('.WitnessTabLoading').show();
        $('.witness-content').empty();
        startTabOut(usernameTabWitnesses, isMyPageWitnesses, witnessRankLocal);
      }

    });

    startMyWitnessTab(usernameTabWitnesses, witnessRankLocal);
  }
  else
  {
    $('.switch-field').remove();
    startTabOut(usernameTabWitnesses, isMyPageWitnesses, witnessRankLocal);
  }
  $('.WitnessTabLoading').hide();
  $('.switch-field').show();
}

function addListWitness(usernameTabWitnesses, isMyPageWitnesses, rankingWitnesses)
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


      var listWitnesses = [];
      result[0].witness_votes.forEach(function(witnessItem) {
        var witnessRank = getWitnessRank(witnessItem, rankingWitnesses);
        witnessRank = (witnessRank===null ? Number.MAX_SAFE_INTEGER : witnessRank)
        listWitnesses.push({name:witnessItem, rank:parseInt(witnessRank)});
      });

      listWitnesses.sort(function(a, b) {
        return a.rank - b.rank;
      });

      listWitnesses.forEach(function(witnessItem, index){
        var classOddEven = '';
        if(index%2===0) classOddEven = 'evenLine';


        $(rowWitness).append($('<div ' + (witnessItem.rank===Number.MAX_SAFE_INTEGER ? 'title="This witness is inactive"' : '') + ' class="col-1 witness-cells ' + classOddEven + '">' + (witnessItem.rank===Number.MAX_SAFE_INTEGER ? '-' : "#" + witnessItem.rank ) + '</div>'));
        $(rowWitness).append('<div class="col-4 witness-cells ' + classOddEven + '"><a class="witness-items ' + (witnessItem.rank===Number.MAX_SAFE_INTEGER ? "witness-not-active" : '' ) + '" href="https://steemit.com/@' + witnessItem.name + '#witnesses" target="_blank">@' + witnessItem.name + '</a></div>');
        $(rowWitness).append($('<div class="col-3 witness-cells ' + classOddEven + '"></div>'));
        if(isMyPageWitnesses)
        {
          var divButtonRemoveWitness = $('<div class="col-4 witness-cells ' + classOddEven + '"></div>');
          var buttonRemoveWitness = $('<label class="button slim hollow primary removeWitnessesLink witness-items" id="' + witnessItem.name + '">Unvote</label>');

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
      $('.WitnessTabLoading').hide();
    }
  });
}

function isWitness(username, list)
{
  return list.find(function(e)
  {
    return e.name===username;
  })
}

function getWitnessRank(username, list)
{

  return list.find(function(e)
  {
    return e.name===username;
  }).rank;
}

function startTabOut(usernameTabWitnesses, isMyPageWitnesses, rankingWitnesses)
{
  var witnessesOutTab = $('\
    <h5 style="margin-bottom:20px">\
      <span class="span-nb-witnesses"></span>\
    </h5>\
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
    </div>');

  $('.witness-content').append(witnessesOutTab);

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

  addListWitness(usernameTabWitnesses, isMyPageWitnesses, rankingWitnesses);
}

function startMyWitnessTab(usernameTabWitnesses, witnessesRankingList)
{
  var witnessesMyTab = $('\
    <h5 style="margin-bottom:20px">\
      <span class="rank-witness"></span>\
    </h5>\
    <div class="bootstrap-wrapper">\
      <div class="witness-information container"></div>\
    </div>');
  $('.witness-content').append(witnessesMyTab);

  if(witnessInfoLocal===null)
  {
    console.log('Launch request get-witness');
    $.ajax({
      type: "GET",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", "efonwuhf7i2h4f72h3o8fho23fh7");
      },
      url: 'http://steemplus-api.herokuapp.com/api/get-witness/' + usernameTabWitnesses,
      success: function(result) {
        witnessInfoLocal = result;
        displayMyWitnessTab(usernameTabWitnesses, witnessesRankingList);
      },
      error: function(msg) {
        alert(msg.responseJSON.error);
      }
    });
  }
  else
  {
    console.log('Using local data get-witness');
    displayMyWitnessTab(usernameTabWitnesses, witnessesRankingList);
  }
}

function displayMyWitnessTab(usernameTabWitnesses, witnessesRankingList)
{

  var lineNumberWitness = 0;
  var classOddEven = '';
  if(lineNumberWitness%2===0) classOddEven = 'evenLine';

  var myWitnessRank = getWitnessRank(usernameTabWitnesses, witnessesRankingList);
  $('.rank-witness').append((myWitnessRank===null ? '@' + usernameTabWitnesses + ' is inactive' : "#" + myWitnessRank + ' - @' + usernameTabWitnesses));
  if(myWitnessRank===null) $('.rank-witness').css('color', 'red');

  var rowMyWitness = $('<div class="row"></div>');

  $(rowMyWitness).append('<div class="col-3 witness-cells ' + classOddEven + '">Voters</div>');
  $(rowMyWitness).append('<div class="col-9 witness-cells ' + classOddEven + '"> ' + witnessInfoLocal.votes_count + ' </div>');
  classOddEven = ''; lineNumberWitness++; if(lineNumberWitness%2===0) classOddEven = 'evenLine';

  $(rowMyWitness).append('<div class="col-3 witness-cells ' + classOddEven + '">Votes Received</div>');
  $(rowMyWitness).append('<div class="col-9 witness-cells ' + classOddEven + '"> ' + getVestString(witnessInfoLocal.votes) + ' </div>');
  classOddEven = ''; lineNumberWitness++; if(lineNumberWitness%2===0) classOddEven = 'evenLine';

  if(witnessInfoLocal.url!==null&&witnessInfoLocal.url!==undefined)
  {
    $(rowMyWitness).append('<div class="col-3 witness-cells ' + classOddEven + '">Witness Annoucement</div>');
    $(rowMyWitness).append('<div class="col-9 witness-cells ' + classOddEven + '"><a href="' + witnessInfoLocal.url + '">' + witnessInfoLocal.url + '</a></div>');
    classOddEven = ''; lineNumberWitness++; if(lineNumberWitness%2===0) classOddEven = 'evenLine';
  }

  if(witnessInfoLocal.timestamp!==null&&witnessInfoLocal.timestamp!==undefined)
  {
    var dateLastBlock = new Date(witnessInfoLocal.timestamp);
    $(rowMyWitness).append('<div class="col-3 witness-cells ' + classOddEven + '">Last block</div>');
    $(rowMyWitness).append('<div class="col-9 witness-cells ' + classOddEven + '" title="' + dateLastBlock + '"><a href="https://steemd.com/b/' + witnessInfoLocal.last_confirmed_block_num + '">#' + witnessInfoLocal.last_confirmed_block_num  + '</a> (' + moment(dateLastBlock).fromNow() + ') </div>');
  }
  else
  {
    $(rowMyWitness).append('<div class="col-3 witness-cells ' + classOddEven + '">Last block</div>');
    $(rowMyWitness).append('<div class="col-9 witness-cells ' + classOddEven + '">This user hasn\'t mine any block yet</div>');
  }
  classOddEven = ''; lineNumberWitness++; if(lineNumberWitness%2===0) classOddEven = 'evenLine';

  $(rowMyWitness).append('<div class="col-3 witness-cells ' + classOddEven + '">Blocks missed</div>');
  $(rowMyWitness).append('<div class="col-9 witness-cells ' + classOddEven + '">' + witnessInfoLocal.total_missed + '</div>');
  classOddEven = ''; lineNumberWitness++; if(lineNumberWitness%2===0) classOddEven = 'evenLine';

  var accountCreationDate = new Date(witnessInfoLocal.created);
  $(rowMyWitness).append('<div class="col-3 witness-cells ' + classOddEven + '">Witness Creation Date</div>');
  $(rowMyWitness).append('<div class="col-9 witness-cells ' + classOddEven + '" title="' + accountCreationDate + '">' + moment(accountCreationDate).fromNow() + '</div>');
  classOddEven = ''; lineNumberWitness++; if(lineNumberWitness%2===0) classOddEven = 'evenLine';

  var priceFeedPublishedDate = new Date(witnessInfoLocal.last_sbd_exchange_update);
  $(rowMyWitness).append('<div class="col-3 witness-cells ' + classOddEven + '">Price Feed</div>');
  $(rowMyWitness).append('<div class="col-9 witness-cells ' + classOddEven + '" title="' + priceFeedPublishedDate + '">' + witnessInfoLocal.sbd_exchange_rate_base + ' $ (' + moment(priceFeedPublishedDate).fromNow() + ')</div>');
  classOddEven = ''; lineNumberWitness++; if(lineNumberWitness%2===0) classOddEven = 'evenLine';

  $(rowMyWitness).append('<div class="col-3 witness-cells ' + classOddEven + '">APR</div>');
  $(rowMyWitness).append('<div class="col-9 witness-cells ' + classOddEven + '">' + (parseInt(witnessInfoLocal.sbd_interest_rate)/100).toFixed(2) + '%</div>');
  classOddEven = ''; lineNumberWitness++; if(lineNumberWitness%2===0) classOddEven = 'evenLine';

  $(rowMyWitness).append('<div class="col-3 witness-cells ' + classOddEven + '">Account Creation Fee</div>');
  $(rowMyWitness).append('<div class="col-9 witness-cells ' + classOddEven + '">' + witnessInfoLocal.account_creation_fee + ' ' + witnessInfoLocal.account_creation_fee_symbol + '</div>');
  classOddEven = ''; lineNumberWitness++; if(lineNumberWitness%2===0) classOddEven = 'evenLine';


  $('.witness-information').append(rowMyWitness);

  $('.WitnessTabLoading').hide();
}

function getVestString(vests)
{
  if(parseInt(vests)/1000000000000000 > 1)
    return numberWithCommas((parseInt(vests)/1000000000000000).toFixed(3)) + ' GVests';
  else if(parseInt(vests)/1000000000000 > 1)
    return numberWithCommas((parseInt(vests)/1000000000000).toFixed(3)) + ' MVests';
  else if(parseInt(vests)/1000000000)
    return numberWithCommas((parseInt(vests)/1000000000).toFixed(3)) + ' kVests';
  else
    return numberWithCommas(vests) + ' Vests';
}

var numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
