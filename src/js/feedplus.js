const LIMIT_PER_CALL = 100;
var feed = false;
var feed_url, user_fp, feedplus_url = null;
var list_posts = [];
var list_authors = [];
var filtered_list = [];
var ad, terminate = false;
var feedplus, a, img, menu_list, app_content, menu_feedplus, post_div, reblog, ad_post = null;
var first_display = true;
var show_posts = 0;
var html_posts = [];
var token_fp = null;
var style_view = 'list';
const noImageAvailable = "src/img/no-image-available-hi.png";


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.to === 'feedp' && request.order === 'start' && token_fp == null) {
        token_fp = request.token;
        FeedPlus(request.data.steemit, request.data.busy, request.data.feedp);
    }
});

function FeedPlus(isSteemit, isBusy, feedp) {
    if (isSteemit) {
        app_content = $('.App__content').eq(0);;
        menu_feedplus = ".PostsIndex__topics ";
        post_div = '.PostsIndex__left';
        reblog = ".PostSummary__reblogged_by";
        ad_post = "li:first-child .entry-title a";
        feed_url = $(".Header__logotype")[0].href;
        feedplus_url = "#plus";
        user_fp = feedp.user;
        menu_list = $('.nav__block-list')[0];
        feedplus = document.createElement('li');
        feedplus.className = "nav__block-list-item";
        feedplus.id = 'FeedPlus';
        a = document.createElement('a');
        a.innerHTML = 'Feed';
        img = document.createElement('img');
        img.id = 'img_plus';
        img.src = chrome.extension.getURL("src/img/logo.png");
        a.appendChild(img);
        feedplus.appendChild(a);
        SetFeedPlus(isSteemit, isBusy, feedp);
        if (window.location.href.match(/#plus/) && !terminate) {
            StartFeedPlus(isSteemit, isBusy, feedp);
        }
    } else if (isBusy) {
        menu_feedplus = ".rightContainer ";
        reblog = '.busy_resteem';
        ad_post = '.title_busy';
        check();

        function check() {
            if ($('.Sidenav').length > 0) {
                createBusyFeedPlusButton();
            } else {
                setTimeout(check, 1000);
            }
        }

        function createBusyFeedPlusButton() {
            console.log('createBusyFeedPlusButton');
            feed_url = $('.Topnav__item-user a')[0].href + '/feed';
            console.log(feed_url);
            app_content = $('.content').eq(0);
            post_div = app_content;
            feedplus_url = feed_url + "#plus";
            user_fp = feed_url.split('@')[1].split('/')[0];
            menu_list = $('.Topnav__menu-container__menu')[0];
            feedplus = document.createElement('li');
            feedplus.className = "";
            feedplus.id = 'FeedPlus';
            a = document.createElement('a');
            span = document.createElement('span');
            span.innerHTML = " Feed +";
            img = document.createElement('img');
            img.src = chrome.extension.getURL("src/img/logo.png");
            img.style.height = '24px';
            img.style.width = '24px';
            a.appendChild(img);
            a.appendChild(span);
            feedplus.appendChild(a);
            $('.Sidenav').append(feedplus);
            SetFeedPlus(isSteemit, isBusy, feedp);
            if (window.location.href.match(/#plus/) && !terminate) {
                StartFeedPlus(isSteemit, isBusy, feedp);
            }
        }
    } else {
        terminate = true;
    }

    function SetFeedPlus(isSteemit, isBusy, feedp) {
        if (isSteemit)
            menu_list.appendChild(feedplus);
        feedplus.onclick = function() {
            if (isSteemit) {
                window.history.pushState("", "", feedplus_url);
                $('.nav__block-list-item--active').removeClass('nav__block-list-item--active');
                $('#FeedPlus').addClass('nav__block-list-item--active');
                feedplus.class += "nav__block-list-item--active";
                StartFeedPlus(isSteemit, isBusy, feedp);
            } else if (isBusy) {
                window.location.href += '#plus';
                StartFeedPlus(isSteemit, isBusy, feedp);
            }
        };
    }

    $(document).click(function() {
        if (!window.location.href.match(/#plus/) && feed) {
            location.reload();
        }
    });

    function StartFeedPlus(isSteemit, isBusy, feedp) {


        feed = true;
        var feed_calls = 0;
        list_posts = [];
        list_authors = [];
        $('.HorizontalMenu  li').removeClass('active');
        $('#FeedPlus').addClass('active');

        GetFeed('', '', isSteemit, isBusy, feedp);
        app_content.html('<div class="loader"></div><div id="loading_status"><p></p></div>');

        function GetFeed(author, perm) {
            steem.api.getDiscussionsByFeed({
                limit: LIMIT_PER_CALL,
                tag: user_fp,
                start_author: author,
                start_permlink: perm
            }, function(err, result) {

                if (err) console.log(err);
                feed_calls = feed_calls + 1;

                result.forEach(function(elt, i, array) {
                    if (feed_calls == 1 || (feed_calls != 1 && i != 0)) {
                        list_authors.push(Authors(elt.author, steem.formatter.reputation(elt.author_reputation)));
                        var voted = false,
                            checked = false;
                        //if(elt.author=='utopian-io')
                        //elt.active_votes.forEach(function(e){if(e.voter===user_fp&&e.weight!==0&&!checked){voted=true;checked=true;}});
                        elt.active_votes.forEach(function(e) {
                            if (e.voter === user_fp) voted = true;
                        });

                        var urlImage = null;
                        urlImage = JSON.parse(elt.json_metadata).hasOwnProperty("image") ? JSON.parse(elt.json_metadata).image["0"] : '';
                        if (urlImage === '') urlImage = JSON.parse(elt.json_metadata).hasOwnProperty("thumbnail") ? JSON.parse(elt.json_metadata).thumbnail : '';
                        list_posts.push(Posts(window.SteemPlus.Sanitize.postBodyShort(elt.body), elt.title, elt.hasOwnProperty("first_reblogged_by") ? elt.first_reblogged_by : '', elt.created, elt.pending_payout_value, 0, elt.net_votes, elt.author, JSON.parse(elt.json_metadata).hasOwnProperty("tags") ? JSON.parse(elt.json_metadata).tags : [elt.category], urlImage, elt.url, voted));
                        $('#loading_status').html('Fetching posts <br><br>' + ((feed_calls - 1) * 100 + i + 1) + ' / ' + feedp.nb_posts * 100);
                    }
                });
                if (feed_calls < feedp.nb_posts) GetFeed(result[result.length - 1].author, result[result.length - 1].permlink, isSteemit, isBusy, feedp);
                else {
                    Filter(isSteemit, isBusy, feedp);
                }
            })
        }
    }


    function Filter(isSteemit, isBusy, feedp) {
        show_posts = 0;

        if (feedp.tag === "list" && feedp.list_tags !== "" && feedp.list_tags != null) {

            var tags = feedp.list_tags.split(' ');

            filtered_list = list_posts.filter(function(elt) {
                var r = false;
                tags.forEach(function(e, i, a) {
                    if (elt.tags.includes(e)) {
                        r = true;
                    }
                });
                return r;
            });

        } else
            filtered_list = list_posts;


        if (feedp.rep_feed_check === true && feedp.rep_feed !== "") {
            filtered_list = filtered_list.filter(function(elt) {
                return list_authors.find(function(e) {
                    return e.username === elt.username
                }).reputation >= feedp.rep_feed;
            });
        }

        if (feedp.voted_check) {
            filtered_list = filtered_list.filter(function(elt) {
                return !elt.voted

            });
        }

        if (feedp.resteem !== "show")
            filtered_list = filtered_list.filter(function(elt) {
                switch (feedp.resteem) {

                    //Hide all
                    case "hide":
                        return elt.resteem === "";
                        break;
                        //Show all except blacklist, also addBeneficiariesButton rep
                    case "blacklist_radio":

                        return (elt.resteem === '' || !feedp.blacklist.split(' ').includes(elt.resteem));
                        break;
                        //Show only from whitelist
                    case "whitelist_radio":
                        return (elt.resteem === '' || feedp.whitelist.split(' ').includes(elt.resteem));
                        break;
                }
            });

        //Download information for Steem Sincerity

        // Create user list
        var usernameList = [];
        filtered_list.forEach(function(item) {
            if (!usernameList.includes(item.username))
                usernameList.push(item.username);
        });

        if (usernameList.length > 0) {
            // Allowed classifications
            var classifList = [];
            if (feedp.classif.human) classifList.push('Human');
            if (feedp.classif.bot) classifList.push('Bot');
            if (feedp.classif.spammer) classifList.push('Spammer');
            if (feedp.classif.pending) classifList.push('Pending');

            var filteredUsernames = [];
            for (var i = 0; i <= usernameList.length / 100; i++) {
                // Download data
                var tmp = getDataFromAPIClassif(usernameList, i, classifList);
                filteredUsernames = filteredUsernames.concat(tmp);
            }
            // Filter posts depending on classification
            filtered_list = filtered_list.filter(function(elt) {
                return filteredUsernames.includes(elt.username);
            });
        }

        // Sort data
        Sort(isSteemit, isBusy, feedp);

    }

    function Sort(isSteemit, isBusy, feedp) {
        filtered_list = filtered_list.sort(function(a, b) {
            switch (feedp.sort) {
                case "recent":
                    return Date.parse(b.date) - Date.parse(a.date);
                case "old":
                    return Date.parse(a.date) - Date.parse(b.date);
                case "payout":
                    return b.payout.split(' ')[0] - a.payout.split(' ')[0];
                case "votes":
                    return b.votes - a.votes;
            }
        });
        var tmp = [];
        tmp.push(list_posts.find(function(e) {
            return (e.username === 'stoodkev')
        }));
        if (tmp.length !== 0 && tmp[0] !== undefined) {
            filtered_list.forEach(function(elt, i, a) {
                if (elt.url === tmp[0].url)
                    a.splice(i, 1);
            });
            if (tmp[0].voted === false) {
                filtered_list = [tmp[0]].concat(filtered_list);
                ad = true;
            }
            Display(isSteemit, isBusy, feedp);
        } else {
            steem.api.getDiscussionsByAuthorBeforeDate('stoodkev', null, new Date().toISOString().split('.')[0], 1, function(err, result) {
                if (result[0] !== undefined) {
                    tmp = [];
                    var elt = result[0];
                    list_authors.push(Authors(elt.author, steem.formatter.reputation(elt.author_reputation)));
                    var voted = false;
                    //HERE
                    console.log(elt);
                    //elt.active_votes.forEach(function(e){if(e.voter===user_fp&&e.weight!==0&&!checked){voted=true;checked=true;}});
                    elt.active_votes.forEach(function(e) {
                        if (e.voter === user_fp) voted = true;
                    });
                    tmp.push(Posts(elt.body, elt.title, elt.hasOwnProperty("first_reblogged_by") ? elt.first_reblogged_by : '', elt.created, elt.pending_payout_value, 0, elt.net_votes, elt.author, JSON.parse(elt.json_metadata).hasOwnProperty("tags") ? JSON.parse(elt.json_metadata).tags : [elt.category], JSON.parse(elt.json_metadata).hasOwnProperty("image") ? JSON.parse(elt.json_metadata).image["0"] : '', elt.url, voted));
                    if (elt.pending_payout_value !== '0.000 SBD' && voted === false) {
                        filtered_list = tmp.concat(filtered_list);
                        ad = true;
                    }
                }

                Display(isSteemit, isBusy, feedp);
            });
        }
    }

    function Display(isSteemit, isBusy, feedp) {

        document.title = 'Feed+';

        if (first_display) {
            if (isSteemit)
                $(".App__content").html('<div class="PostsIndex row"><div class="PostsIndex__left column small-collapse"><div id="posts_list" class="PostsList"><ul class="PostsList__summaries hfeed" itemscope="" itemtype="http://schema.org/blogPosts" > </ul></div></div><div class="PostsIndex__topics column shrink "></div></div>');
            else if (isBusy) {
                console.log($('.content'));

                $(".content").html('<div class="feedplus-busy">\
              <div class="bootstrap-wrapper">\
                  <div class="container container-feedplus-busy">\
                    <div class="row">\
                      <div class="post-div-busy col-8"></div>\
                      <div class="menu-feedplus-busy col-3" style="position:fixed; top:5em; right:6em;"></div>\
                    </div>\
                  </div>\
              </div>\
            </div>');
                post_div = $('.post-div-busy');
                menu_feedplus = $('.menu-feedplus-busy ')
            }

            var more = chrome.extension.getURL("src/img/more.png");
			var logoGrayscale = chrome.extension.getURL("/src/img/grayscale_logo.png");
            var gridfeedimg = chrome.extension.getURL('src/img/view-grid.png');
            var listfeedimg = chrome.extension.getURL('src/img/view-list.png');
            var bigfeedimg = chrome.extension.getURL('src/img/view-big.png');

            if (isSteemit)
                var filters = '<ul class="Topics"><div class="feedstyle"><span id="listfeed" class="iconfeedstyle active"><img src="' + listfeedimg + '"></span> <span id="gridfeed" class="iconfeedstyle"><img src="' + gridfeedimg + '"></span> <span id="bigfeed" class="iconfeedstyle"><img src="' + bigfeedimg + '"></span></div><li class="Topics__title title-feedstyle">View:</li><hr><li  class="Topics__title" >Sort By</li><hr><div class="select_box"><select id="sort" >' +
                    '<option value="recent">Recent</option>' +
                    '<option value="old">Old</option>' +
                    '<option value="payout">Payout</option>' +
                    '<option value="votes">Votes</option>' +
                    '</select></div><li class="Topics__title" style="margin-top: 1.5em;">Filters</li><hr>' +
                    '<div class="filters"><div class="category_filter" id="tag_block"><img src="' + more + '"/> Tags </div></div><div class="filter_content">' +
                    '<input type="radio" name="tag" value="show" id="all_tag"><label for="all_tag">Show all tags</label> <br>' +
                    '<input type="radio" name="tag" value="list" id="show_tag"><label for="show_tag">Show only</label><textarea rows="4" id="list_tags" placeholder="steem life" style="width: 100%"></textarea><br>' +
                    '</div><hr>' +
                    '<div class="filters"><div class="category_filter" id="classification_block"><img src="' + more + '"/> Classification </div></div><div class="filter_content">' +
                    '<input type="checkbox" name="classif" value="human" id="show_human_classif"><label for="human_classif" class="human_classif">Human</label> <br>' +
                    '<input type="checkbox" name="classif" value="bot" id="show_bot_classif"><label for="bot_classif" class="bot_classif">Bot</label><br>' +
                    '<input type="checkbox" name="classif" value="spammer" id="show_spammer_classif"><label for="spammer_classif" class="spammer_classif">Spammer</label><br>' +
                    '<input type="checkbox" name="classif" value="pending" id="show_pending_classif"><label for="pending_classif" class="pending_classif">Pending</label><br>' +
                    '</div><hr>' +
                    '<div class="filters"><div class="category_filter" id="resteem_block"><img src="' + more + '"/> Resteems </div><div class="filter_content"> <input type="radio" name="resteem" value="show" id="show"><label for="show">Show all</label> <br>' +
                    '<input type="radio" name="resteem" value="hide" id="hide"><label for="hide">Hide all</label> <br>' +
                    '<input type="radio" name="resteem" value="blacklist_radio" id="blacklist_radio"><label for="blacklist_radio"> Blacklist</label><textarea rows="4" id="blacklist" style="width: 100%"></textarea><br>' +
                    '<input type="radio" name="resteem"  value="whitelist_radio" id="whitelist_radio"><label for="whitelist_radio"> Whitelist</label><textarea rows="4" id="whitelist" style="width: 100%"></textarea><br><br>' +
                    // '<div style="display: inline-block"><input type="checkbox" id="reputation"><label for="reputation" > Reputation <</label></div>  <input type="text" id="rep" style="width: 50px;"></div>'+
                    '</div><hr>' +
                    '<div class="filters"><div class="category_filter" id="other_block"><img src="' + more + '"/> Others </div><div class="filter_content"><input type="checkbox" id="rep_feed_check" ><label for="rep_feed_check">Reputation: </label> <input type="number" id="rep_feed"><br>' +
                    '<input type="checkbox" id="voted_check" ><label for="voted_check">Hide upvoted </label></div></div>' +
                    '<li class="Topics__title" style="list-style-type: none; margin-top: 1.5em;">Parameters</li><hr><div class="parameters">Posts: <input id="nb_posts" type="number" style=" margin-left:0.5em;display:inline-block; text-align: right;width:3em;">00</div>' +
                    '<button class="button" id="validate_settings">Apply</button><div class="loader_2"><div></div></div></ul>';
            else if (isBusy)
                var filters = '<div class="busy-filters-container"><div class="busy-filters-header"><img src="' + logoGrayscale + '"><span>Feed+</span></div><div class="busy-filter-list"><ul class="Topics"><li class="Topics__title title-busy">Sort By</li><hr class="busy-rule"><div class="select_box select-busy-fd"><select class="input-settings-fp" id="sort" >' +
                    '<option value="recent">Recent</option>' +
                    '<option value="old">Old</option>' +
                    '<option value="payout">Payout</option>' +
                    '<option value="votes">Votes</option>' +
                    //'<option value="comments">Comments</option>'+
                    //'<option value="cheerleader">Cheerleader</option>'+
                    //'<option value="idol">Idol</option>'+
                    '</select>\
                    </div>\
                    <li class="Topics__title title-busy" style="margin-top: 0.5em;">Filters</li><hr class="busy-rule">' +
                    '<div class="filters filters-busy"><div class="category_filter" id="tag_block"><img src="' + more + '"/> Tags </div></div><div class="filter_content">' +
                    '<input type="radio" name="tag" value="show" id="all_tag"><label for="all_tag">Show all tags</label> <br>' +
                    '<input type="radio" name="tag" value="list" id="show_tag"><label for="show_tag">Show only</label><textarea rows="4" class="busy-list-tags" id="list_tags" placeholder="steem life" style="width: 100%"></textarea><br>' +
                    '</div><hr class="busy-rule">' +
                    '<div class="filters filters-busy"><div class="category_filter" id="classification_block"><img src="' + more + '"/> Classification </div></div><div class="filter_content">' +
                    '<input type="checkbox" name="classif" value="human" id="show_human_classif"><label for="human_classif" class="human_classif">Human</label> <br>' +
                    '<input type="checkbox" name="classif" value="bot" id="show_bot_classif"><label for="bot_classif" class="bot_classif">Bot</label><br>' +
                    '<input type="checkbox" name="classif" value="spammer" id="show_spammer_classif"><label for="spammer_classif" class="spammer_classif">Spammer</label><br>' +
                    '<input type="checkbox" name="classif" value="pending" id="show_pending_classif"><label for="pending_classif" class="pending_classif">Pending</label><br>' +
                    '</div><hr class="busy-rule">' +
                    '<div class="filters filters-busy"><div class="category_filter" id="resteem_block"><img src="' + more + '"/> Resteems </div></div><div class="filter_content"> <input type="radio" name="resteem" value="show" id="show"><label for="show">Show all</label> <br>' +
                    '<input type="radio" name="resteem" value="hide" id="hide"><label for="hide">Hide all</label> <br>' +
                    '<input type="radio" name="resteem" value="blacklist_radio" id="blacklist_radio"><label for="blacklist_radio"> Blacklist</label><textarea rows="4" id="blacklist" style="width: 100%"></textarea><br>' +
                    '<input type="radio" name="resteem"  value="whitelist_radio" id="whitelist_radio"><label for="whitelist_radio"> Whitelist</label><textarea rows="4" id="whitelist" style="width: 100%"></textarea><br>' +
                    '</div><hr class="busy-rule">' +
                    '<div class="filters filters-busy"><div class="category_filter" id="other_block"><img src="' + more + '"/> Others </div><div class="filter_content"><input type="checkbox" id="rep_feed_check" ><label for="rep_feed_check">Reputation: </label> <input type="number" class="input-settings-fp" id="rep_feed"><br>' +
                    '<input type="checkbox" id="voted_check" ><label for="voted_check">Hide upvoted </label></div></div>' +
                    '<li class="Topics__title title-busy" style="list-style-type: none; margin-bottom: 0.5rem; margin-top: 0.5em;">Parameters</li><hr class="busy-rule"><div class="parameters">Posts: <input id="nb_posts" class="input-settings-fp" type="number" style=" margin-left:0.5em;display:inline-block; text-align: right;width:3em;">00</div>' +
                    '<button class="Action Action--primary validate-fd-busy" id="validate_settings">Apply</button><div class="loader_2"><div></div></div></ul></div></div>';

            $(menu_feedplus).html(filters);
            $('.feedstyle').hide();
            $('.loader_2').hide();
        }

        var posts = '';

        var offset = new Date().getTimezoneOffset();
        filtered_list.forEach(function(elt, i, a) {
            var bd = elt.body.replace(/<[^>]*>?/g, '');
            bd = bd.replace(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi, '');
            bd = bd.replace(/!?\[[^\]]*\]\([^\)]*\)/g, '');
            bd = bd.replace(/\*+/g, '');
            bd = bd.replace(/\#+/g, '');
            var upvoted = 'no_upvoted';
            if (isBusy) 
            {
                var imgUrlFeedPlus = null;
                console.log(elt);
                if (elt.img !== undefined && elt.img.includes('imgur')) {
                    imgUrlFeedPlus = 'https://steemitimages.com/0x0/' + elt.img;
                } else if (elt.img !== undefined && (elt.img.includes('https') || elt.img.includes('http'))) {
                    imgUrlFeedPlus = elt.img;
                } else if (elt.img === '') {
                    imgUrlFeedPlus = chrome.extension.getURL(noImageAvailable);
                } else {
                    imgUrlFeedPlus = 'https://steemitimages.com/256x512/' + elt.img;
                }

                var active = "";
                if (elt.voted) active = "active";
                posts += '<div class="Story story_busy">';
                if (elt.resteem !== '')
                    posts += '<div class="Story__reblog"><i class="iconfont icon-share1"></i><span><a target="_blank" href="/@' + elt.resteem + '">' + elt.resteem + '</a><!-- react-text: 1904 --> reblogged<!-- /react-text --></span></div>';
                posts += '<div class="Story__content"><div class="Story__header"><a target="_blank" href="/@' + elt.username + '"><img class="Avatar" alt="' + elt.username + '" src="https://img.busy.org/@' + elt.username + '" style="min-width: 40px; width: 40px; height: 40px;"></a><div class="Story__header__text"><a target="_blank" href="/@' + elt.username + '"><h4><!-- react-text: 1913 -->@' + elt.username + '<!-- /react-text --><div data-show="true" class="ant-tag"><span class="ant-tag-text">53</span><!-- react-text: 1916 --><!-- /react-text --></div></h4></a><span class="Story__date"><span>' + timeago().format(Date.parse(elt.date) - offset * 60 * 1000) + '</span></span></div><div class="Story__topics"><a target="_blank" class="Topic" href="/trending/' + elt.tags[0] +
                    '"><!-- react-text: 1921 -->' + elt.tags[0] + '<!-- /react-text --></a></div></div><div class="Story__content"><a target="_blank" class="Story__content__title" href="' + elt.url + '"><h2>' + elt.title + '</h2></a><a target="_blank" class="Story__content__preview" href="' + elt.url + '"><div><div class="Story__content__img-container"><img alt="post" src="' + imgUrlFeedPlus + '"></div><div class="Story__content__body">' +
                    bd.substring(0, 138) + '...</div></div></a></div><div class="Story__footer"><div class="StoryFooter"><div class="StoryFooter__actions"><span class="Payout"><span class=""><span><!-- react-text: 1936 -->$<!-- /react-text --><span>' + elt.payout.split(' ')[0] + '</span></span></span></span><div class="Buttons"><a target="_blank" role="presentation" class="Buttons__link ' + active + '"><i class="iconfont icon-praise_fill "></i></a><span class="Buttons__number Buttons__reactions-count" role="presentation"><span><span>' + elt.votes + '</span><span></span></span></span></span></div></div></div></div></div></div>'
            } else if (isSteemit) {
                var imgUrlFeedPlus = null;

                if (elt.img !== undefined && elt.img.includes('imgur')) {
                    imgUrlFeedPlus = 'https://steemitimages.com/0x0/' + elt.img;
                } else if (elt.img !== undefined && (elt.img.includes('https') || elt.img.includes('http'))) {
                    imgUrlFeedPlus = elt.img;
                } else if (elt.img === '') {
                    imgUrlFeedPlus = chrome.extension.getURL(noImageAvailable);
                } else {
                    imgUrlFeedPlus = 'https://steemitimages.com/256x512/' + elt.img;
                }
                if (elt.voted) {
                    upvoted = "Voting__button--upvoted";
                }

                posts += '<li style="list-style-type: none;"><article class="PostSummary hentry with-image " itemscope="" itemtype="http://schema.org/blogPost"></div>';
                if (elt.resteem !== '') posts += '<div class="PostSummary__reblogged_by"><span class="Icon reblog" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path d="M448,192l-128,96v-64H128v128h248c4.4,0,8,3.6,8,8v48c0,4.4-3.6,8-8,8H72c-4.4,0-8-3.6-8-8V168c0-4.4,3.6-8,8-8h248V96 L448,192z"></path></svg></span><!-- react-text: 363 --> <!-- /react-text --><!-- react-text: 364 -->Resteemed by<!-- /react-text --><!-- react-text: 365 --> <!-- /react-text --><span class="UserNames"><a target="_blank" href="/@' + elt.resteem + '">' + elt.resteem + '</a></span></div>';
                posts += '<div class="PostSummary__header show-for-small-only"><h3 class="entry-title"><a target="_blank" href="' +
                    elt.url + '"><!-- react-text: 187 -->' + elt.title + '<!-- /react-text --></a></h3></div><div class="PostSummary__time_author_category_small show-for-small-only">' +
                    '<span class="vcard"><a class="" target="_blank" href="' + elt.url + '"><span title="' + elt.date.replace('T', ' ') + '" class="updated"><span>' + timeago().format(Date.parse(elt.date) - offset * 60 * 1000) + '</span></span></a>' +
                    '<!-- react-text: 193 --> <!-- /react-text --><!-- react-text: 194 -->by<!-- /react-text --><!-- react-text: 195 --> <!-- /react-text --><span class="author" itemprop="author" itemscope="" itemtype="http://schema.org/Person"><strong>' +
                    '<a target="_blank" href="/@' + elt.username + '">' + elt.username + '</a></strong><!-- react-text: 199 --> <!-- /react-text --><span class="Reputation" title="Reputation">' + list_authors.find(function(e) {
                        return e.username === elt.username
                    }).reputation + '</span></span><!-- react-text: 201 --> <!-- /react-text --><!-- react-text: 202 -->in<!-- /react-text --><!-- react-text: 203 --> <!-- /react-text --><strong><a target="_blank" href="/trending/' +
                    elt.tags[0] + '">' + elt.tags[0] + '</a></strong></span></div><span class="PostSummary__image" style="background-image: url(\'' + imgUrlFeedPlus + '\');"></span><div class="PostSummary__content"><div class="PostSummary__header show-for-medium"><h3 class="entry-title">' +
                    '<a target="_blank" href="' + elt.url + '"><!-- react-text: 211 -->' + elt.title + '<!-- /react-text --></a></h3></div><div class="PostSummary__body entry-content"><a target="_blank" href="' + elt.url + '">' + bd.substring(0, 120) + '</a></div><div class="PostSummary__footer">' +
                    '<span class="Votin"><span class="Voting__inner"><span id="' + i + '"class="Voting__button Voting__button-up ' + upvoted + '"><span class="Icon chevron-up-circle" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg enable-background="new 0 0 33 33" version="1.1" viewBox="0 0 33 33" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Chevron_Up_Circle"><circle cx="16" cy="16" r="15" stroke="#121313" fill="none"></circle><path d="M16.699,11.293c-0.384-0.38-1.044-0.381-1.429,0l-6.999,6.899c-0.394,0.391-0.394,1.024,0,1.414 c0.395,0.391,1.034,0.391,1.429,0l6.285-6.195l6.285,6.196c0.394,0.391,1.034,0.391,1.429,0c0.394-0.391,0.394-1.024,0-1.414 L16.699,11.293z" fill="#121313"></path></g></svg></span></span><div class="DropdownMenu"><a href="#"><span style="opacity: 1;"><span class="prefix">$</span>' + elt.payout.split(' ')[0] + '</span><span class="Icon dropdown-arrow" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g><polygon points="128,90 256,218 384,90"></polygon></g></svg></span></span></a><ul class="VerticalMenu menu vertical VerticalMenu"><li>' +
                    '<span><!-- react-text: 231 -->Pending Payout ' + elt.payout.split(' ')[0] + '<!-- /react-text --></span></li><li><span><span title="' + elt.date.replace('T', ' ') + '"><span>' + timeago().format(Date.parse(elt.date) - offset * 60 * 1000) + '</span></span></span></li><li><span></span></li></ul></div></span></span><span class="VotesAndComments"><span class="VotesAndComments__votes" title="' +
                    elt.votes + ' votes"><span class="Icon chevron-up-circle Icon_1x" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg enable-background="new 0 0 33 33" version="1.1" viewBox="0 0 33 33" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Chevron_Up_Circle"><circle cx="16" cy="16" r="15" stroke="#121313" fill="none"></circle><path d="M16.699,11.293c-0.384-0.38-1.044-0.381-1.429,0l-6.999,6.899c-0.394,0.391-0.394,1.024,0,1.414 c0.395,0.391,1.034,0.391,1.429,0l6.285-6.195l6.285,6.196c0.394,0.391,1.034,0.391,1.429,0c0.394-0.391,0.394-1.024,0-1.414 L16.699,11.293z" fill="#121313"></path></g></svg></span><!-- react-text: 242 --><!-- /react-text --><!-- react-text: 243 -->' +
                    elt.votes + '<!-- /react-text --></span>' +
                    //<span class="VotesAndComments__comments"><a title="137 responses. Click to respond." href="/smt/@ned/answers-steemit-development-and-icos-w-smts-video#comments"><span class="Icon chatboxes" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" xml:space="preserve"><g><path d="M294.1,365.5c-2.6-1.8-7.2-4.5-17.5-4.5H160.5c-34.7,0-64.5-26.1-64.5-59.2V201h-1.8C67.9,201,48,221.5,48,246.5v128.9 c0,25,21.4,40.6,47.7,40.6H112v48l53.1-45c1.9-1.4,5.3-3,13.2-3h89.8c23,0,47.4-11.4,51.9-32L294.1,365.5z"></path><path d="M401,48H183.7C149,48,128,74.8,128,107.8v69.7V276c0,33.1,28,60,62.7,60h101.1c10.4,0,15,2.3,17.5,4.2L384,400v-64h17 c34.8,0,63-26.9,63-59.9V107.8C464,74.8,435.8,48,401,48z"></path></g></svg></span><!-- react-text: 247 -->&nbsp;<!-- /react-text --><!-- react-text: 248 -->137<!-- /react-text --></a></span></span>+
                    '<span class="PostSummary__time_author_category">' +
                    //'<span class="Reblog__button Reblog__button-inactive"><a href="#" title="Resteem"><span class="Icon reblog" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path d="M448,192l-128,96v-64H128v128h248c4.4,0,8,3.6,8,8v48c0,4.4-3.6,8-8,8H72c-4.4,0-8-3.6-8-8V168c0-4.4,3.6-8,8-8h248V96 L448,192z"></path></svg></span></a></span>' +
                    '<span class="show-for-medium"><span class="vcard"><a target="_blank" href="' + elt.url + '"><span title="' + elt.date.replace('T', ' ') + '" class="updated"><span>' + timeago().format(Date.parse(elt.date) - offset * 60 * 1000) + '</span></span></a><!-- react-text: 258 --> <!-- /react-text --><!-- react-text: 259 -->by<!-- /react-text -->' +
                    '<!-- react-text: 260 --> <!-- /react-text --><span class="author" itemprop="author" itemscope="" itemtype="http://schema.org/Person"><strong><a target="_blank" href="/@' + elt.username + '">' + elt.username + '</a></strong><!-- react-text: 264 --> <!-- /react-text --><span class="Reputation" title="Reputation"> ( ' + list_authors.find(function(e) {
                        return e.username === elt.username
                    }).reputation + ' ) </span></span><!-- react-text: 266 --> <!-- /react-text --><!-- react-text: 267 -->in<!-- /react-text --><!-- react-text: 268 --> <!-- /react-text --><strong><a target="_blank" href="/trending/' + elt.tags[0] + '">' + elt.tags[0] + '</a></strong></span></span></span></div></div></article></li>';
                //if(i%20) {html_posts.push(posts);posts='';}
            }
        });

        $(post_div).html(posts);
        $('.Voting__button').click(function() {
            var elt = filtered_list[this.id];
            var that = this;
            if (elt.voted) {
                sc2.vote(feedp.user, elt.username, elt.url.split('/').slice(-1)[0], 0, function(err, res) {
                    if (err) console.log(err);
                    if (res) console.log(res);

                    if (res !== null) {
                        $(that).removeClass('Voting__button--upvoted');

                        filtered_list[that.id].voted = false;
                    }
                });
            } else {
                {
                    sc2.vote(feedp.user, elt.username, elt.url.split('/').slice(-1)[0], feedp.weight, function(err, res) {
                        if (err) console.log(err);
                        if (res) console.log(res);
                        if (res !== null) {
                            $(that).addClass('Voting__button--upvoted');
                            console.log('should add class', $(this));
                            filtered_list[that.id].voted = true;
                        }

                    });
                }
            }

        });

        if (feedp.resteem === "blacklist_radio") {
            for (var i = 0; i < $(reblog).length; i++) {
                var add_blacklist = document.createElement("p");
                add_blacklist.className += "AddBlackList";
                add_blacklist.innerHTML = "Add To Resteem Blacklist";
                add_blacklist.onclick = function(arg) {
                    return function() {
                        if (isSteemit) {
                            if (!feedp.blacklist.includes($(reblog)[arg].childNodes[$(reblog)[arg].childNodes.length - 2].firstChild.innerHTML))
                                feedp.blacklist += " " + $(reblog)[arg].childNodes[$(reblog)[arg].childNodes.length - 2].firstChild.innerHTML;
                        } else {
                            feedp.blacklist += " " + $(reblog)[arg].firstChild.innerHTML;
                        }
                        chrome.storage.local.set({
                            blacklist: feedp.blacklist
                        });
                        Filter(isSteemit, isBusy, feedp);

                    };
                }(i);
                $(reblog)[i].append(add_blacklist);
            }


        }

        if (ad) {
            ad = false;
            $(ad_post).css('color', ' #4ba2f2');
            $(ad_post).css('margin-bottom', ' 4em');
            $(ad_post).html($(ad_post).html() + ' - Sponsored');
        }


        first_display = false;
        DisableMenu(false);
        LoadParameters(isSteemit, isBusy, feedp);
        SetListeners(isSteemit, isBusy, feedp);
        HandleTagListsVisibility();
        HandleListsVisibility();
        HandleRepDisabled();
        changeStyle(style_view);
    }

    function LoadParameters(isSteemit, isBusy, feedp) {
        if (feedp.resteem !== null)
            $('input[name=resteem][value=' + feedp.resteem + ']').prop('checked', true);
        if (feedp.blacklist !== null)
            $('#blacklist').val(feedp.blacklist);
        if (feedp.whitelist !== null)
            $('#whitelist').val(feedp.whitelist);
        if (feedp.rep_feed_check !== null)
            $('#rep_feed_check').prop('checked', feedp.rep_feed_check);
        if (feedp.rep_feed !== null)
            $('#rep_feed').val(feedp.rep_feed);
        if (feedp.tag !== null)
            $('input[name=tag][value=' + feedp.tag + ']').prop('checked', true);
        if (feedp.list_tags !== null)
            $('#list_tags').val(feedp.list_tags);
        if (feedp.sort !== null)
            $('#sort option[value=' + feedp.sort + ']').prop('selected', true);
        $('#nb_posts').val(feedp.nb_posts);
        if (feedp.voted_check !== null)
            $('#voted_check').prop('checked', feedp.voted_check);


        if (Object.keys(feedp.classif).length > 0) {
            if (feedp.classif.human !== null)
                $('#show_human_classif').prop('checked', feedp.classif.human);
            if (feedp.classif.bot !== null)
                $('#show_bot_classif').prop('checked', feedp.classif.bot);
            if (feedp.classif.spammer !== null)
                $('#show_spammer_classif').prop('checked', feedp.classif.spammer);
            if (feedp.classif.pending !== null)
                $('#show_pending_classif').prop('checked', feedp.classif.pending);
        } else {
            $('#show_human_classif').prop('checked', feedp.classif.human);
            $('#show_bot_classif').prop('checked', feedp.classif.bot);
            $('#show_spammer_classif').prop('checked', feedp.classif.spammer);
            $('#show_pending_classif').prop('checked', feedp.classif.pending);
        }
    }

    function DisableMenu(isDisabled) {
        // $(".PostsIndex__topics input,textarea,select").prop("disabled",isDisabled);
        if (isDisabled)
            $('.loader_2').show();
        else
            $('.loader_2').hide();

    }

    function SetListeners(isSteemit, isBusy, feedp) {
        $(".category_filter").each(function(i) {
            $(this).unbind('click').on("click", function() {
                if ($(".filter_content")[i].style.display === "none" || $(".filter_content")[i].style.display === "") {
                    $(".filter_content").hide();
                    $(".filter_content")[i].style.display = "block";
                } else {
                    $(".filter_content")[i].style.display = "none";
                }
            });
        });


        //Sort by
        $("#sort").unbind('change').change(function() {
            feedp.sort = $("#sort option:selected").val();
            chrome.storage.local.set({
                sort: feedp.sort
            });

            DisableMenu(true);
            Sort(isSteemit, isBusy, feedp);
        });

        //Tags
        $("input[name=tag]").unbind('change');
        $(document).on("change", "input[name=tag]", function() {
            feedp.tag = $("input[name=tag]:checked").val();
            chrome.storage.local.set({
                tag: feedp.tag
            });
            HandleTagListsVisibility();


        });


        $("#list_tags").unbind('blur').blur(function() {
            feedp.list_tags = document.getElementById('list_tags').value;
            chrome.storage.local.set({
                list_tags: feedp.list_tags
            });

        });

        //Handles Resteem Parameters

        $("input[name=resteem]").unbind('change');
        $(document).on("change", "input[name=resteem]", function() {
            feedp.resteem = $("input[name=resteem]:checked").val();
            chrome.storage.local.set({
                resteem: feedp.resteem
            });
            HandleListsVisibility();

        });
        $("#blacklist").unbind('blur').blur(function() {
            feedp.blacklist = document.getElementById('blacklist').value;
            chrome.storage.local.set({
                blacklist: feedp.blacklist
            });
        });
        $("#whitelist").unbind('blur').blur(function() {
            feedp.whitelist = document.getElementById('whitelist').value;
            chrome.storage.local.set({
                whitelist: feedp.whitelist
            });
        });


        // Others
        //Reputation
        $("#rep_feed").unbind('blur').blur(function() {
            feedp.rep_feed = document.getElementById('rep_feed').value;
            chrome.storage.local.set({
                rep_feed: feedp.rep_feed
            });
        });
        $("#rep_feed_check").unbind('click').click(function() {
            feedp.rep_feed_check = document.getElementById('rep_feed_check').checked;
            chrome.storage.local.set({
                rep_feed_check: feedp.rep_feed_check
            });
            HandleRepDisabled();
        });

        //Upvoted

        $("#voted_check").unbind('click').click(function() {
            feedp.voted_check = document.getElementById('voted_check').checked;
            chrome.storage.local.set({
                voted_check: feedp.voted_check
            });
        });

        $("#nb_posts").unbind('blur').blur(function() {
            feedp.nb_posts = document.getElementById('nb_posts').value;
            if (feedp.nb_posts !== '')
                chrome.storage.local.set({
                    nb_posts: feedp.nb_posts
                });
        });

        $("#validate_settings").unbind('click').click(function() {
            DisableMenu(true);
            Filter(isSteemit, isBusy, feedp);
        });

        $('#listfeed').unbind('click').click(function() {
            changeStyle('list');
        }); // click on list button



        $('#gridfeed').unbind('click').click(function() {
            changeStyle('grid');
        }); // click on grid button

        $('#bigfeed').unbind('click').click(function() {
            changeStyle('big');
        }); // click on big button

        $('input[name=classif]').unbind('click').click(function() {
            feedp.classif.human = $('#show_human_classif')[0].checked;
            feedp.classif.bot = $('#show_bot_classif')[0].checked;
            feedp.classif.spammer = $('#show_spammer_classif')[0].checked;
            feedp.classif.pending = $('#show_pending_classif')[0].checked;
            chrome.storage.local.set({
                classif: feedp.classif
            });
        });

    }

    function HandleTagListsVisibility() {
        if ($("input[name=tag]:checked").val() == "list")
            $("#list_tags").show();
        else $("#list_tags").hide();
    }


    function HandleListsVisibility() {
        if ($("input[name=resteem]:checked").val() == "blacklist_radio")
            $("#blacklist").show();
        else $("#blacklist").hide();

        if ($("input[name=resteem]:checked").val() == "whitelist_radio")
            $("#whitelist").show();
        else
            $("#whitelist").hide();

    }

    function HandleRepDisabled() {
        if (document.getElementById('rep_feed_check').checked === false) $("#rep_feed").prop('disabled', true);
        else $("#rep_feed").prop('disabled', false);
    }


    function Authors(username, rep) {
        var author = {
            "username": username,
            "reputation": rep
        };

        return author;
    }

    function Posts(body, title, resteem, date, payout, comments, votes, username, tags, img, url, voted) {
        var post = {
            "body": body,
            "title": title,
            "resteem": resteem,
            "payout": payout,
            "date": date,
            "comments": comments,
            "votes": votes,
            "username": username,
            "tags": tags,
            "img": img,
            "url": url,
            "voted": voted
        };
        return post;
    }

    function changeStyle(style) {
        style_view = style;
        $('.feedstyle span').removeClass('active');
        if (style == 'list') {
            $('.PostsIndex__left li').removeClass('grid-view');
            $('.PostsIndex__left li').removeClass('big-view');
            $('#listfeed').addClass('active');
        } else if (style == 'grid') {
            $('.PostsIndex__left li').addClass('grid-view');
            $('.PostsIndex__left li').removeClass('big-view');
            $('#gridfeed').addClass('active');
        } else if (style == 'big') {
            $('.PostsIndex__left li').removeClass('grid-view');
            $('.PostsIndex__left li').addClass('big-view');
            $('#bigfeed').addClass('active');
        }
    }
}

// Function used to download data from Steem Sicerity
// @parameter arrayUsernames : username list used to create url
// @parameter i : index used to create url
// @parameter classifList : list of allowed classification used to create allowed user list
function getDataFromAPIClassif(arrayUsernames, i, classifList) {
    var tmp = [];
    var url = 'https://multi.tube/s/api/accounts-info/' + arrayUsernames.slice(0 + i * 100, 100 + i * 100).join(',');
    $.ajax({
        type: "GET",
        async: false,
        beforeSend: function(xhttp) {
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
        },
        url: url,
        success: function(result) {
            Object.keys(result.data).map(function(objectKey, index) {
                var userScoreList = [];
                userScoreList.push({
                    name: 'Human',
                    value: (parseFloat(result.data[objectKey].classification_human_score) * 100).toFixed(2)
                });
                userScoreList.push({
                    name: 'Bot',
                    value: (parseFloat(result.data[objectKey].classification_bot_score) * 100).toFixed(2)
                });
                userScoreList.push({
                    name: 'Spammer',
                    value: (parseFloat(result.data[objectKey].classification_spammer_score) * 100).toFixed(2)
                });

                userScoreList.sort(function(a, b) {
                    return b.value - a.value;
                });

                if (userScoreList[0].name === 'Human' && classifList.includes('Human'))
                    tmp.push(objectKey);
                else if (userScoreList[0].name === 'Bot' && userScoreList[0].value > 80 && classifList.includes('Bot'))
                    tmp.push(objectKey);
                else if (userScoreList[0].name === 'Spammer' && userScoreList[0].value > 80 && classifList.includes('Spammer'))
                    tmp.push(objectKey);
                else if ((userScoreList[0].name === 'Spammer' || userScoreList[0].name === 'Bot') && userScoreList[0].value < 80 && classifList.includes('Pending'))
                    tmp.push(objectKey);
            });
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log("Status: " + textStatus + "      Error: " + errorThrown);
        }
    });
    return tmp;
}
