


  var token_followers_table=null;
  var aut=null;
  var rewardBalance=null;
  var recentClaims=null;
  var steemPrice=null;
  var votePowerReserveRate=null;
  var totalVestingFund=null;
  var totalVestingShares=null;
  var account=null;

  var followerPageRegexp = /\/@([a-z0-9\-\.]*)\/(followers|followed)$/;

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to=='followers_table'){
      console.log('Starting followers table...');
      aut=request.data.user;
      if(request.order==='start'&&token_followers_table==null)
      {
        token_followers_table=request.token;
        rewardBalance=request.data.rewardBalance;
        recentClaims=request.data.recentClaims;
        steemPrice=request.data.steemPrice;
        votePowerReserveRate=request.data.votePowerReserveRate;
        account=request.data.account;
        totalVestingFund=request.data.totalVestingFund;
        totalVestingShares=request.data.totalVestingShares;


        $(window).on('changestate', function(e) {
          setTimeout(function() {
            checkForFollowerPage();
          }, 100);
        });

        checkForFollowerPage();

      }
      console.log('Followers table ready!');
    }
  });

  function getFollowersAccounts(names, callback) {
    var chunks = _.chunk(names, 100);

    _.each(chunks, function(chunk, index) {
      console.log('getting accounts at ' + index);
      window.SteemPlus.Utils.getAccounts(chunk, function(err, accounts){
        if(err){
          callback(err);
          return;
        }
        callback(null, accounts, index);
      });
    });
  };

  var createAlertApi = function(){

  }

  var createFollowersTable = function(name, isFollowers, userList) {
    var container = $('<div class="smi-followers-table-container">\
      <h3>' + (isFollowers ? 'Followers' : 'Followed') + '</h3>' +
      (createAlertApi() || '') +
      '<div class="smi-followers-table-wrapper">\
        <table class="table table-striped table-bordered dataTable no-footer" role="grid">\
          <thead>\
            <tr role="row">\
              <th aria-label="Username: activate to sort column descending">Username</th>\
              <th aria-label="Reputation: activate to sort column ascending">Reputation</th>\
              <th aria-label="STEEM Power: activate to sort column ascending">STEEM Power</th>\
              <th aria-label="Upvote Worth: activate to sort column ascending">Upvote Worth</th>\
              <!-- <th aria-label="' + (isFollowers ? 'Follower': 'Following') + ' Since: activate to sort column ascending">' + (isFollowers ? 'Follower': 'Following') + ' Since</th> -->\
            </tr>\
          </thead>\
          <tbody class="smi-followers-table-body"></tbody>\
        </table>\
      </div>\
    </div>');


    console.log(window.SteemPlus.Utils.findReact(userList[0]));

    var followersNames = window.SteemPlus.Utils.findReact(userList[0]).props.users.toArray().sort();

    var tableIdForDataTableStorage = 'DataTables_' + (isFollowers ? 'Follower': 'Following') + '_Table';

    var table = container.find('table.dataTable');
    var dataTable = table.DataTable({
      columns: [{
        // username
        data: 'name',
        render: function ( data, type, row, meta ) {
          return type === 'display' ?
            '<a class="smi-navigate" href="/@' + data + '"> <img class="Userpic" src="https://img.busy.org/@' + data + '?s=32" alt="' + data + '">' + data + '</a>' :
            data;
        }
      },{
        // reputation
        data: 'reputation',
        orderSequence: [ 'desc', 'asc' ],
        render: function ( data, type, row, meta ) {
          var account = row;
          if(!account.loaded){
            return 'Loading...';
          }
          return type === 'display' ?
            steem.formatter.reputation(data) :
            data;
        }
      },{
        // steem power
        orderSequence: [ 'desc', 'asc' ],
        render: function ( data, type, row, meta ) {
          var account = row;
          if(!account.loaded){
            return 'Loading...';
          }
          var sp = window.SteemPlus.Utils.getSteemPowerPerAccount(account, totalVestingFund, totalVestingShares);
          if(typeof sp !== 'number'){
            return 'Loading...';
          }
          return type === 'display' ?
            sp.toFixed(2) :
            sp;
        }
      },{
        // upvote worth
        type: 'currency',
        orderSequence: [ 'desc', 'asc' ],
        render: function ( data, type, row, meta ) {
          var account = row;
          if(!account.loaded){
            return 'Loading...';
          }
          var dollars = window.SteemPlus.Utils.getVotingDollarsPerAccount(100, account, rewardBalance, recentClaims, steemPrice, votePowerReserveRate);
          if(typeof dollars !== 'number'){
            return 'Loading...';
          }
          return type === 'display' ?
            '$ ' + dollars.toFixed(2) :
            dollars;
        }
      }],
      rowId: 'name',
      order: [[0, 'asc']],
      dom: 'lfrtip',//"frtip",
      responsive: true,
      deferRender: true,
      stateSave: true,
      stateSaveCallback: function(settings,data) {
        var d = {};
        if(data && data.length) {
          d.length = data.length;
        }
        d.start = 0;
        d.time = data.time;
        d.order = data.order;
        if(window.localStorage){
          window.localStorage.setItem( tableIdForDataTableStorage, JSON.stringify(d) );
        }
      },
      stateLoadCallback: function(settings) {
        var d;
        try{
          d = JSON.parse( window.localStorage.getItem( tableIdForDataTableStorage ) );
        }catch(err){
        }
        return d || {};
      }
    });

    followersNames.forEach(function(followerName) {
      var data = {
        name: followerName,
        reputation: null
      };
      dataTable.row.add(data);
    });

    dataTable.rows().invalidate().draw();


    getFollowersAccounts(followersNames, function(err2, followers, index) {
      if(err2){
        return;
      }
      console.log('Account ' + name + ' followers: ', followers);
      followers.forEach(function(follower) {
        follower.loaded = true;
        dataTable
          .row( '#' + follower.name )
          .data( follower );
      });
      dataTable.rows().invalidate().draw();
    });


    return container;
  };



  function checkFollowersTable(userList, name, isFollowers) {
    if(!userList.length){
      return false;
    }
    if(userList.hasClass('smi-followers-table-added')){
      console.log('followers table already added');
      return true;
    }

    userList.prepend(createFollowersTable(name, isFollowers, userList));
    userList.addClass('smi-followers-table-added');
    console.log('followers table added');
    return true;
  };



  function checkForFollowerPage() {

    var match = (window.location.pathname || '').match(followerPageRegexp);
    if(match) {
      var name = match[1];
      console.log(name);
      var isFollowers = match[2] === 'followers';
      var userList = $('.UserList');
      var added = checkFollowersTable(userList, name, isFollowers);
      console.log('added',added);
      if(added){
        userList.children('.row').css('display', 'none');
      }else{
        // histogram UI not added, try again later
        setTimeout(checkForFollowerPage, 100);
      }
    }
  };
