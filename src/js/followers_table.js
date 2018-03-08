


  var token_followers_table=null;
  var aut=null;
  var rewardBalance=null;
  var recentClaims=null;
  var steemPrice=null;
  var votePowerReserveRate=null;
  var totalVestingFund=null;
  var totalVestingShares=null;
  var myaccount=null;

  var currentPage=null;

  var followerPageRegexp = /\/@([a-z0-9\-\.]*)\/(followers|followed)$/;

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to=='followers_table'){
      aut=request.data.user;
      if(request.order==='start'&&token_followers_table==null)
      {
        token_followers_table=request.token;
        rewardBalance=request.data.rewardBalance;
        recentClaims=request.data.recentClaims;
        steemPrice=request.data.steemPrice;
        votePowerReserveRate=request.data.votePowerReserveRate;
        myaccount=request.data.account;
        totalVestingFund=request.data.totalVestingFund;
        totalVestingShares=request.data.totalVestingShares;


        checkForFollowerPage();

      }
      if(request.order==='click')
      {
        var match = (window.location.pathname || '').match(followerPageRegexp);
        if(match && match[2] !== currentPage) {
           checkForFollowerPage();
        }
      }
    }
  });

  function getFollowingList(username, lastFollowing, followingList, userList)
  {

      sendGetFollowingRequest(username, lastFollowing).then(function(result){
        lastFollowing = result[result.length-1].following;

        if(result.length < 100){
          if(followingList.length > 0){
            result.shift();
          }
          result.forEach(function(element){
            followingList.push(element);
          });
          checkFollowersTable(followingList, username, false, userList);
          return;
        }
        if(followingList.length > 0)
          result.shift();

        result.forEach(function(element){
          followingList.push(element);
        });
        getFollowingList(username, lastFollowing, followingList, userList);

      });
  }

  function getFollowersList(username, lastFollower, followersList, userList)
  {
      sendGetFollowersRequest(username, lastFollower).then(function(result){
        lastFollower = result[result.length-1].follower;
        if(result.length < 1000){
          if(followersList.length > 0){
            result.shift();
          }
          result.forEach(function(element){
            followersList.push(element);
          });
          checkFollowersTable(followersList, username, true, userList);
          return;
        }
        if(followersList.length > 0)
          result.shift();

        result.forEach(function(element){
          followersList.push(element);
        });
        getFollowersList(username, lastFollower, followersList, userList);

      });
  }


  function sendGetFollowingRequest(username, lastFollowing)
  {
    return new Promise (function(resolve,reject){
      steem.api.getFollowing(username, lastFollowing, 'blog', 100, function(err, response){
        console.log(err);
        resolve(response);
      });
    });
  }

  function sendGetFollowersRequest(username, lastFollower)
  {
    return new Promise (function(resolve,reject){
      steem.api.getFollowers(username, lastFollower, 'blog', 1000, function(err, response){
        resolve(response);
      });
    });
  }

  function sendGetFollowCount(username)
  {
    return new Promise (function(resolve,reject){
      steem.api.getFollowCount(username, function(err, response){
        // console.log(err);
        resolve(response);
      });
    });
  }

  function getFollowersAccounts(names, callback) {
    var chunks = _.chunk(names, 100);

    _.each(chunks, function(chunk, index) {
      // console.log('getting accounts at ' + index);
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

  var createFollowersTable = function(username, isFollowers, userList) {
    var container = $('<div class="smi-followers-table-container">\
      <h3>' + (isFollowers ? 'Followers' : 'Followed') + '</h3>' +
      (createAlertApi() || '') +
      '<div class="smi-followers-table-wrapper">\
        <table class="table table-striped table-bordered dataTable no-footer dtff" role="grid">\
          <thead>\
            <tr role="row">\
              <th aria-label="Username: activate to sort column descending">Username</th>\
              <th aria-label="Reputation: activate to sort column ascending">Reputation</th>\
              <th aria-label="STEEM Power: activate to sort column ascending">STEEM Power</th>\
              <th aria-label="Upvote Worth: activate to sort column ascending">Upvote Worth</th>\
              <th aria-label="Actions: activate to sort column ascending">Actions</th>\
              <!-- <th aria-label="' + (isFollowers ? 'Follower': 'Following') + ' Since: activate to sort column ascending">' + (isFollowers ? 'Follower': 'Following') + ' Since</th> -->\
            </tr>\
          </thead>\
          <tbody class="smi-followers-table-body"></tbody>\
        </table>\
      </div>\
    </div>');

    var followersNames = getName(userList, isFollowers);

    var tableIdForDataTableStorage = 'DataTables_' + (isFollowers ? 'Follower': 'Following') + '_Table';

    var table = container.find('table.dataTable');
    var dataTable = table.DataTable({
      columns: [{
        // username
        data: 'name',
        render: function ( data, type, row, meta ) {
          return type === 'display' ?
            '<a target="_blank" href="/@' + data + '"> <img class="Userpic" src="https://img.busy.org/@' + data + '?s=32" alt="' + data + '">' + data + '</a>' :
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
      },{
        // username
        row:['name','isFollowers','accountName', 'pageName'],

        render: function ( data, type, row, meta ) {
          if (type === 'display' && row.accountName === row.pageName && !row.isFollowers)
            return '<label class="button slim hollow primary unfollowLink" id="' + row.name + '">Unfollow</label>';
          else if(type === 'display' && row.accountName === row.pageName && row.isFollowers && !row.followedHim)
            return '<label class="button slim hollow primary followLink" id="' + row.name + '">Follow</label>';
          else if(type === 'display' && row.accountName === row.pageName && row.isFollowers && row.followedHim)
            return '<label class="button slim hollow primary unfollowLink" id="' + row.name + '">Unfollow</label>';
          else
            return '';
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
        reputation: null,
        isFollowers: isFollowers,
        accountName: myaccount.name,
        pageName: username
      };
      dataTable.row.add(data);
    });


    if(myaccount.name!==username)
    {
      console.log('ici');
      dataTable.column(4).visible(false);
    }
    dataTable.rows().invalidate().draw();


    getFollowersAccounts(followersNames, function(err2, followers, index) {
      if(err2){
        return;
      }

      getFollowingListName(username, 0, [], function(err, myFollowersList){

        followers.forEach(function(follower) {
          follower.loaded = true;
          follower.isFollowers = isFollowers;
          follower.accountName = myaccount.name;
          follower.pageName = username;

          if(isFollowers)
          {
            var myFollowersNames = getName(myFollowersList, false);
            follower.followedHim = myFollowersNames.includes(follower.name);
          }

          dataTable
            .row( '#' + follower.name )
            .data( follower );
        });


        dataTable.rows().invalidate().draw();
        defineOnclick();
        function defineOnclick(){
          $('.unfollowLink').prop('onclick',null).off('click');
          $('.followLink').prop('onclick',null).off('click');
        $('.unfollowLink').click(function(event){
          var btn = $(this);
          sc2.unfollow(myaccount.name, btn[0].id, function (err, res) {
            if(err===null)
            {
              console.log('Unfollowed!!',btn);
              btn.addClass("followLink");
              btn.removeClass("unfollowLink");
              btn.html('Follow');
              defineOnclick();
            }
          });
        });

        $('.followLink').click(function(event){
          var btn = $(this);
          sc2.follow(myaccount.name, btn[0].id, function (err, res) {
            if(err===null)
            {
              console.log('Followed!!',btn);
              btn.removeClass("followLink");
              btn.addClass("unfollowLink");
              btn.html('Unfollow');
              defineOnclick();
            }
          });
        });
      }
      });
    });




    return container;
  };



  function checkFollowersTable(followList, name, isFollowers, userList) {
    if(!userList.length){
      return false;
    }

    var result = createFollowersTable(name, isFollowers, followList);
    userList.prepend(result);
    userList.addClass('smi-followers-table-added');
    userList.children('.row').css('display', 'none');
    return true;
  };



  function checkForFollowerPage() {

    var match = (window.location.pathname || '').match(followerPageRegexp);
    if(match) {
      var name = match[1];
      var isFollowers = match[2] === 'followers';
      currentPage = match[2];
      var userList = $('.UserList');
      console.log(userList);
      if(isFollowers)
      {
        getFollowersList(name, 0, [], userList);
      }
      else
      {
        getFollowingList(name, 0, [], userList);
      }

    }
  };

  function getName(list, isFollowers)
  {
    var names = [];
    list.forEach(function(element){
      if(isFollowers)
        names.push(element.follower);
      else
        names.push(element.following);
    });
    return names;
  };


function getFollowingListName(username, lastFollowing, followingList, callback)
{

  sendGetFollowingRequest(username, lastFollowing).then(function(result){
    lastFollowing = result[result.length-1].following;

    if(result.length < 100){
      if(followingList.length > 0){
        result.shift();
      }
      result.forEach(function(element){
        followingList.push(element);
      });
      callback(null, followingList);
      return;
    }
    if(followingList.length > 0)
      result.shift();

    result.forEach(function(element){
      followingList.push(element);
    });
    getFollowingListName(username, lastFollowing, followingList, callback);

  });
}
