
  var token_mention_tab=null;
  var aut=null;
  var rewardBalance=null;
  var recentClaims=null;
  var steemPrice=null;
  var mentionTabStarted=false;

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to=='mentions_tab'){
      aut=request.data.user;
      if(request.order==='start'&&token_mention_tab==null)
      {
        token_mention_tab=request.token;
        rewardBalance=request.data.rewardBalance;
        recentClaims=request.data.recentClaims;
        steemPrice=request.data.steemPrice;

        createTab();

        mentionTabStarted=true;
      }
      else if(request.order==='click'&&token_mention_tab==request.token)
      {
        createTab();
      }
      else if(request.order==='notif'&&token_mention_tab==request.token)
      {
        rewardBalance=request.data.rewardBalance;
        recentClaims=request.data.recentClaims;
        steemPrice=request.data.steemPrice;

        if(mentionTabStarted)
          createTab();
      }
    }
  });

  function createTab()
  {
    window.SteemPlus.Tabs.createTab({
      id: 'mentions',
      title: 'Mentions',
      enabled: true,
      createTab: createMentionsTab
    });
  }

  function createMentionsTab(mentionsTab) {
    mentionsTab.html('<div class="row">\
       <div class="UserProfile__tab_content UserProfile__tab_content_smi UserProfile__tab_content_MentionsTab column layout-list">\
          <article class="articles">\
          <div class="MentionsTab" style="display: none;">\
            <h1 class="articles__h1" style="margin-bottom:20px">\
              Mentions\
              <div class="thanks-furion">\
                Thanks <a href="/@furion" class="smi-navigate">@furion</a> for the SteemData API\
              </div>\
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
            <div id="posts_list" class="PostsList" style="margin-top: 30px;">\
              <ul class="PostsList__summaries hfeed" itemscope="" itemtype="http://schema.org/blogPosts">\
              </ul>\
            </div>\
          </div>\
          <center class="MentionsTabLoading">\
             <div class="LoadingIndicator circle">\
                <div></div>\
             </div>\
          </center>\
          <center class="MentionsTabLoadMore" style="display: none;">\
             <button>\
              Load more... \
            </button>\
          </center>\
          </article>\
       </div>\
    </div>');

    mentionsTab.find('.MentionsTabLoadMore button').on('click', function(){
      getPostsAndComments(mentionsTab, window.SteemPlus.Utils.getPageAccountName());
    });
    mentionsTab.find('.mentions-type').on('change', function() {
      getPostsAndComments(mentionsTab, window.SteemPlus.Utils.getPageAccountName(), true);
    });

    getPostsAndComments(mentionsTab, window.SteemPlus.Utils.getPageAccountName());
  };


  function _getPostsAndComments(whats, name, info, cb) {
    info = info || {
      buffer: {},
      from: {},
      index: {},
      posts: [],
      hasMore: true
    };
    info.postsFrom = info.posts.length;

    var merge = function() {
      var keys = Object.keys(info.buffer);
      var checkIndexes = function() {
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          if((info.index[key] || 0) < info.buffer[key].length){
            return true;
          }
        }
        return false;
      };
      var checkFrom = function() {
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          if(info.from[key] !== -1){
            return true;
          }
        }
        return false;
      };
      var added = 0;
      while(added < 50 && checkIndexes()) {
        var max = null;
        var maxKey;
        keys.forEach(function(key) {
          var index = (info.index[key] || 0);
          var post = info.buffer[key][index] || null;
          if(post){
            if(!max){
              max = post;
              maxKey = key;
            }else{
              var d1 = moment(max.created);
              var d2 = moment(post.created);
              if(d1 < d2){
                max = post;
                maxKey = key;
              }
            }
          }
        });
        info.index[maxKey] = (info.index[maxKey] || 0) + 1;
        info.posts.push(max);
        added++;
      }
      info.hasMore = (checkIndexes() || checkFrom());
    };

    var done = 0;
    var successCb = function(what, data){
      console.log(what + ' => ' + data);
      done++;
      if(data){
        var buffer = info.buffer[what] || [];
        buffer = buffer.concat(data._items);
        info.buffer[what] = buffer;

        if(data._links.next){
          info.from[what] = (info.from[what] || 0) + 1;
        }else{
          info.from[what] = -1;
        }
      }
      if(done === whats.length){
        merge();
        cb(info);
      }
    };

    whats.forEach(function(what) {
      var from = info.from[what] || 0;
      if(from === -1){
        successCb(what, null);
      }else{
        var index = info.index[what] || 0;
        var buffer = info.buffer[what] || [];

        if(buffer.length >= index + 50){
          successCb(what, null);
        }else{

          $.ajax({
            type: "GET",
            beforeSend: function(xhttp) {
              xhttp.setRequestHeader("Content-type", "application/json");
              xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
            },
            url: 'https://query.steemdata.com/' + what + '?where={"$text":{"$search":"\\"@' + name + '\\""}}&sort=-created&page=' + (from+1),
            success: function(msg) {
              console.log(msg);
              successCb(what, msg);
            },
            error: function(msg) {
              console.log(msg);
              var errorLabel = document.createElement('h2');
              $(errorLabel).addClass('articles__h1');
              $(errorLabel).addClass('error-mentions-label');
              $(errorLabel).append('Looks like we are having trouble retrieving information from steemData. Please try again later.');
              $('.MentionsTabLoading').hide();
              $('.articles').prepend(errorLabel);
            }
          });
        }
      }
    });
  };


  function openPost(url) {
    var postWindow = window.open();
    postWindow.opener = null;
    postWindow.location = url;
  };


  function getPostsAndComments(mentionsTab, name, reset) {
    var v = mentionsTab.find('.mentions-type:checked').val();
    var whats;
    if(v == 0){
      whats = ['Posts'];
    } else if(v == 1) {
      whats = ['Comments'];
    } else {
      whats = ['Posts', 'Comments'];
    }

    var loadMore = mentionsTab.find('.MentionsTabLoadMore');
    var info1;
    if(reset){
      loadMore.data('posts-download-info', null);
      mentionsTab.find('.PostsList__summaries').html('');
    }else{
      info1 = loadMore.data('posts-download-info');
    }
    loadMore.hide();
    mentionsTab.find('.MentionsTabLoading').show();

    _getPostsAndComments(whats, name, info1, function(info2){
      loadMore.data('posts-download-info', info2);
      var posts = info2.posts;
      var postsFrom = info2.postsFrom;
      var hasMore = info2.hasMore;

      var postsList = mentionsTab.find('.PostsList__summaries');
      if(postsList.length){
        for (var i = postsFrom; i < posts.length; i++) {
          var post = posts[i]
          var el = window.SteemPlus.Utils.createPostSummary(post, {
            openPost: openPost
          }, rewardBalance, recentClaims, steemPrice);
          postsList.append(el);
        }

        mentionsTab.find('.MentionsTabLoading').hide();
        mentionsTab.find('.MentionsTab').show();
        if(hasMore){
          loadMore.show();
        }
      }
    });

  };
