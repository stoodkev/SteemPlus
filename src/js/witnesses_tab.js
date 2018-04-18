var token_witnesses_tab=null;

var userPageRegex = /^.*@([a-z][a-z0-9.\-]+[a-z0-9])$/;
var myUsernameTabWitnesses=null;
var refreshPageWitnessInterval=null;

var witnessInfoLocal = null;
var witnessRankLocal = null;
var witnessVoteReceivedLocal=null;
var userAccountWitnessTab=null;

var totalVestsWitnessTab = null;
var totalSteemWitnessTab = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.to==='witnesses_tab'&&request.order==='start'&&token_witnesses_tab==null)
  {
    token_witnesses_tab=request.token;
    myUsernameTabWitnesses=request.data.user;
    userAccountWitnessTab=request.data.account;
    totalVestsWitnessTab = request.data.totalVests;
    totalSteemWitnessTab = request.data.totalSteem;
    if($('.UserProfile__tab_content_Witnesses').length===0)
      startWitnessesTab();
  }
  else if(request.to==='witnesses_tab'&&request.order==='click'&&token_witnesses_tab==request.token)
  {
    myUsernameTabWitnesses=request.data.user;
    userAccountWitnessTab=request.data.account;
    totalVestsWitnessTab = request.data.totalVests;
    totalSteemWitnessTab = request.data.totalSteem;
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
              <label for="witness-type-out" class="witness-type witness-out" >Votes cast</label>\
              <input type="radio" id="witness-in" name="witness-type" class="witness-type" value="2"/>\
              <label for="witness-type-in" class="witness-type witness-in" >Votes Received</label>\
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

     $('.witness-in').unbind('click').click(function(){
      if(!$('#witness-in').prop('checked'))
      {
        $('.witness-type').prop('checked', false);
        $('#witness-in').prop('checked', true);
        $('.WitnessTabLoading').show();
        $('.witness-content').empty();

        startTabIn(usernameTabWitnesses, isMyPageWitnesses);
      }
     });

    startMyWitnessTab(usernameTabWitnesses, witnessRankLocal);
    $('.switch-field').show();
  }
  else
  {
    $('.switch-field').remove();
    startTabOut(usernameTabWitnesses, isMyPageWitnesses, witnessRankLocal);
  }
  
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

      if(result[0].proxy.length > 0) // Using Proxy
      {
        $('.span-nb-witnesses').html((isMyPageWitnesses ? 'You are' : '@'+usernameTabWitnesses + ' is' ) + ' currently using <a href="/@'+ result[0].proxy + '#witnesses">@' + result[0].proxy + '</a> as a proxy');
      }
      else // No Proxy
      {
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
      }
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
    <div class="bootstrap-wrapper">\
      <div class="container">\
        <div class="row">\
          <div class="col-3">\
            <h5 class="rank-witness-h5">\
              <span class="rank-witness"></span>\
            </h5>\
          </div>\
        </div>\
      </div>\
      <div class="witness-information container"></div>\
    </div>');
  $('.witness-content').append(witnessesMyTab);

  if(witnessInfoLocal===null)
  {
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
  
  $('.rank-witness').parent().parent().after('<div class="col-9"><label class="button slim hollow primary removeAsWitnessLink witness-items" id="' + usernameTabWitnesses + '">Unvote</label><label class="button slim hollow primary addAsWitnessLink witness-items" id="' + usernameTabWitnesses + '">Vote</label></div>');

  if(userAccountWitnessTab.witness_votes.includes(usernameTabWitnesses))
  {
    $('.removeAsWitnessLink').show();
    $('.addAsWitnessLink').hide();
  }
  else
  {
    $('.addAsWitnessLink').show();
    $('.removeAsWitnessLink').hide();
  }

  $('.removeAsWitnessLink').unbind('click').click(function(){
    $('.addAsWitnessLink').show();
    $('.removeAsWitnessLink').hide();
    var win = window.open('https://v2.steemconnect.com/sign/account-witness-vote?witness=' + usernameTabWitnesses + '&approve=0', '_blank');
    if (win) {
        win.focus();
    } else {
        alert('Please allow popups for this website');
    }
  });

  $('.addAsWitnessLink').unbind('click').click(function(){
    $('.removeAsWitnessLink').show();
    $('.addAsWitnessLink').hide();
    var win = window.open('https://v2.steemconnect.com/sign/account-witness-vote?witness=' + usernameTabWitnesses + '&approve=1', '_blank');
    if (win) {
        win.focus();
    } else {
        alert('Please allow popups for this website');
    }
  });

  var rowMyWitness = $('<div class="row"></div>');

  $(rowMyWitness).append('<div class="col-3 witness-cells ' + classOddEven + '">Number of votes</div>');
  $(rowMyWitness).append('<div class="col-9 witness-cells ' + classOddEven + '"> ' + witnessInfoLocal.votes_count + ' </div>');
  classOddEven = ''; lineNumberWitness++; if(lineNumberWitness%2===0) classOddEven = 'evenLine';

  $(rowMyWitness).append('<div class="col-3 witness-cells ' + classOddEven + '">Votes Received</div>');
  $(rowMyWitness).append('<div class="col-9 witness-cells ' + classOddEven + '"> ' + getVestString(witnessInfoLocal.votes/1000) + ' </div>');
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

  $(rowMyWitness).append('<div class="col-3 witness-cells ' + classOddEven + '">Last week Reward</div>');
  $(rowMyWitness).append('<div class="col-9 witness-cells ' + classOddEven + '"> ' + steem.formatter.vestToSteem(witnessInfoLocal.lastWeekValue, totalVestsWitnessTab, totalSteemWitnessTab).toFixed(0) + ' SP</div>');
  classOddEven = ''; lineNumberWitness++; if(lineNumberWitness%2===0) classOddEven = 'evenLine';

  $(rowMyWitness).append('<div class="col-3 witness-cells ' + classOddEven + '">Last month Reward</div>');
  $(rowMyWitness).append('<div class="col-9 witness-cells ' + classOddEven + '"> ' + steem.formatter.vestToSteem(witnessInfoLocal.lastMonthValue, totalVestsWitnessTab, totalSteemWitnessTab).toFixed(0) + ' SP</div>');
  classOddEven = ''; lineNumberWitness++; if(lineNumberWitness%2===0) classOddEven = 'evenLine';

  $(rowMyWitness).append('<div class="col-3 witness-cells ' + classOddEven + '">Forever Reward</div>');
  $(rowMyWitness).append('<div class="col-9 witness-cells ' + classOddEven + '"> ' + steem.formatter.vestToSteem(witnessInfoLocal.foreverValue, totalVestsWitnessTab, totalSteemWitnessTab).toFixed(0) + ' SP</div>');
  classOddEven = ''; lineNumberWitness++; if(lineNumberWitness%2===0) classOddEven = 'evenLine';

  var accountCreationDate = new Date(witnessInfoLocal.created);
  $(rowMyWitness).append('<div class="col-3 witness-cells ' + classOddEven + '">Witness Creation Date</div>');
  $(rowMyWitness).append('<div class="col-9 witness-cells ' + classOddEven + '" title="' + accountCreationDate + '">' + moment(accountCreationDate).fromNow() + '</div>');
  classOddEven = ''; lineNumberWitness++; if(lineNumberWitness%2===0) classOddEven = 'evenLine';

  var priceFeedPublishedDate = new Date(witnessInfoLocal.last_sbd_exchange_update);
  $(rowMyWitness).append('<div class="col-3 witness-cells ' + classOddEven + '">Price Feed</div>');
  $(rowMyWitness).append('<div class="col-9 witness-cells ' + classOddEven + '" title="' + priceFeedPublishedDate + '">' + witnessInfoLocal.sbd_exchange_rate_base + ' $ published ' + moment(priceFeedPublishedDate).fromNow() + '</div>');
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
  if(parseInt(vests)/1000000000 > 1)
    return numberWithCommas((parseInt(vests)/1000000000).toFixed(3)) + ' GVests';
  else if(parseInt(vests)/1000000 > 1)
    return numberWithCommas((parseInt(vests)/1000000).toFixed(3)) + ' MVests';
  else if(parseInt(vests)/1000)
    return numberWithCommas((parseInt(vests)/1000).toFixed(3)) + ' kVests';
  else
    return numberWithCommas(vests) + ' Vests';
}

var numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function startTabIn(usernameTabWitnesses, isMyPageWitnesses)
{

  if(witnessVoteReceivedLocal===null)
  {
    $.ajax({
      type: "GET",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", "efonwuhf7i2h4f72h3o8fho23fh7");
      },
      url: 'http://steemplus-api.herokuapp.com/api/get-received-witness-votes/'+usernameTabWitnesses,
      success: function(result) {
        witnessVoteReceivedLocal = result;
        displayWitnessIn(usernameTabWitnesses, isMyPageWitnesses, witnessVoteReceivedLocal);

      },
      error: function(msg) {
        alert(msg.responseJSON.error);
      }
    });
  }
  else
  {
    displayWitnessIn(usernameTabWitnesses, isMyPageWitnesses, witnessVoteReceivedLocal);
  }
}

function displayWitnessIn(usernameTabWitnesses, isMyPageWitnesses, witnessVoteReceivedLocal)
{
  var witnessesInTab = $('\
    <table id="witness-received-votes-table" class="table table-striped table-bordered dataTable" style="width:100%">\
    <table');

  $('.witness-content').append(witnessesInTab);

 
  $('.LoadingIndicator').hide();

  function getValueFromTable(str){
    if(str.includes('kVests')) return parseInt(str.replace('kVests',''))*1000;
    else if(str.includes('GVests')) return parseInt(str.replace('GVests',''))*1000000000;
    else if(str.includes('MVests')) return parseInt(str.replace('MVests',''))*1000000;
    else return parseInt(str.replace('Vests',''));
  };

  jQuery.fn.dataTableExt.oSort["number-desc"] = function (x, y) {
    
    return getValueFromTable(x) - getValueFromTable(y);
  };
    
  jQuery.fn.dataTableExt.oSort["number-asc"] = function (x, y) {
      return jQuery.fn.dataTableExt.oSort["number-desc"](y, x);
  };

  jQuery.fn.dataTableExt.oSort["datetime-desc"] = function (x, y) {
    return new Date($(x).attr('name')) - new Date($(y).attr('name'));
  };
    
  jQuery.fn.dataTableExt.oSort["datetime-asc"] = function (x, y) {
      return jQuery.fn.dataTableExt.oSort["datetime-desc"](y, x);
  };

  console.log(witnessVoteReceivedLocal);
  $('#witness-received-votes-table').dataTable( {
    data: witnessVoteReceivedLocal,
    "order": [[ 0, "asc" ]],
    "bInfo": false,
    columns: [
      { title: "Voting time" },
      { title: "Name" },
      { title: "Total Vests" },
      { title: "Account Vests" },
      { title: "Proxied Vests" }
      
    ] ,
    columnDefs: [
    {
      "targets": 0,//index of column starting from 0
      "data": "timestamp", //this name should exist in your JSON response
      "render": function ( data, type, full, meta ) {
        return '<span title="' + new Date(data) + '" name="'+ data + '">' + moment(new Date(data)).fromNow() + '</span>';
      },
      "sType": "datetime"
    },
    {
      "targets": 1,//index of column starting from 0
      "data": "account", //this name should exist in your JSON response
      "render": function ( data, type, full, meta ) {
        return '<a class="witness-items" href="https://steemit.com/@' + data + '#witnesses" target="_blank">@' + data + '</a>';
      }
    },
    {
      "targets": 2,//index of column starting from 0
      "data": "totalVests", //this name should exist in your JSON response
      "render": function ( data, type, full, meta ) {
        return getVestString(data);
      },
      "sType": "number"
    },
    {
      "targets": 3,//index of column starting from 0
      "data": "accountVests", //this name should exist in your JSON response
      "render": function ( data, type, full, meta ) {
        return getVestString(data);
      },
      "sType": "number"
    },
    {
      "targets": 4,//index of column starting from 0
      "data": "proxiedVests", //this name should exist in your JSON response
      "render": function ( data, type, full, meta ) {
        return getVestString(data);
      },
      "sType": "number"
    }]
  });
}