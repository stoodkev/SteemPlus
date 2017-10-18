
console.log("Start FeedPlus");
//steem.config.set('websocket','wss://steemd.steemitdev.com');
const DEFAULT_FEED_SIZE=3;
const LIMIT_PER_CALL=100;
var feed=false;
var feed_url=document.getElementsByClassName("Header__top-steemit")[0].firstChild.href;
var user=feed_url.split('@')[1].split('/')[0];
var feedplus_url=feed_url+"#plus";
var list_posts=[];
var list_authors=[];
var filtered_list=[];
var resteem,blacklist,whitelist,rep_feed_check,rep_feed,sort,tag,list_tags,voted_check,nb_posts=null;
var ad=false;



var feedplus=document.createElement('li');
feedplus.className="";
feedplus.id='FeedPlus';
var a=document.createElement('a');
a.innerHTML='feed';
var img=document.createElement('img');
img.id='img_plus';
img.src=chrome.extension.getURL("/img/logo.png");
a.appendChild(img);
feedplus.appendChild(a);
feedplus.onclick=function(){
    window.history.pushState("", "",feedplus_url);

    feedplus.class+="active";
    StartFeedPlus();
};
document.getElementsByClassName("HorizontalMenu")[0].appendChild(feedplus);
$(document).click(function(){if(!window.location.href.match(/#plus/)&&feed)location.reload();});
if(window.location.href.match(/#plus/)) StartFeedPlus();
function StartFeedPlus() {


        feed = true;
    var feed_calls = 0;
    list_posts=[];
    list_authors=[];
    $('.HorizontalMenu  li').removeClass('active');
    $('#FeedPlus').addClass('active');

    chrome.storage.local.get(['nb_posts'], function (items) {

        if(items.nb_posts!==undefined&&items.nb_posts<10&&items.nb_posts!=='')
            nb_posts=items.nb_posts;
        else
            nb_posts=DEFAULT_FEED_SIZE;
        GetFeed('', '');
        $(".App__content").html('<div class="loader"></div><div id="loading_status"><p></p></div>');

    });



    function GetFeed(author, perm) {
        steem.api.getDiscussionsByFeed({
            limit: LIMIT_PER_CALL,
            tag: user,
            start_author: author,
            start_permlink: perm
        }).then((result) => {feed_calls=feed_calls + 1;
        console.log(result);
        result.forEach(function (elt, i, array) {
            if (feed_calls == 1 || (feed_calls != 1 && i != 0)) {
                list_authors.push(Authors(elt.author, steem.formatter.reputation(elt.author_reputation)));
                var voted=false;
                elt.active_votes.forEach(function(e){if(e.voter===user)voted=true;});

                list_posts.push(Posts(elt.body, elt.title, elt.hasOwnProperty("first_reblogged_by") ? elt.first_reblogged_by : '', elt.created, elt.pending_payout_value, 0, elt.net_votes, elt.author, JSON.parse(elt.json_metadata).hasOwnProperty("tags") ? JSON.parse(elt.json_metadata).tags : [elt.category], JSON.parse(elt.json_metadata).hasOwnProperty("image") ? JSON.parse(elt.json_metadata).image["0"] : '',elt.url,voted));
                $('#loading_status').html('Fetching posts <br><br>'+((feed_calls-1)*100+i+1)+' / '+nb_posts*100);
            }
        });
        if (feed_calls < nb_posts) GetFeed(result[LIMIT_PER_CALL-1].author, result[LIMIT_PER_CALL-1].permlink);
        else {
            getParameters();
        }
    })
    }
}



function getParameters()
{
    chrome.storage.local.get(['resteem','blacklist','whitelist','rep_feed_check','rep_feed','sort','tag','list_tags','voted_check'], function (items) {
        if(items.resteem!==undefined)
            resteem=items.resteem;
        else
            resteem='show';
        if(items.whitelist!==undefined)
            whitelist=items.whitelist;
        if(items.blacklist!==undefined)
            blacklist=items.blacklist;
        if(items.rep_feed_check!==undefined)
            rep_feed_check=items.rep_feed_check;
        if(items.rep_feed!==undefined)
            rep_feed=items.rep_feed;
        if(items.sort!==undefined)
            sort=items.sort;
        if(items.tag!==undefined)
            tag=items.tag;
        else
            tag="show";
        if(items.list_tags!==undefined)
            list_tags=items.list_tags;
        if(items.voted_check!==undefined)
            voted_check=items.voted_check;
        else voted_check=false;

        Filter();
    });
}

 function Filter(){

         if (tag ==="list" && list_tags !== "" && list_tags!=null)
         {
             console.log(list_tags);
             var tags = list_tags.split(' ');

           filtered_list=  list_posts.filter(function (elt) {
                 var r=false;
                 tags.forEach(function (e, i, a) {
                     if (elt.tags.includes(e)) {
                         r=true;
                     }
                 });
                 return r;
             });

         }
         else
             filtered_list=list_posts;


        if (rep_feed_check===true && rep_feed !== "") {
             filtered_list = filtered_list.filter(function (elt) {
                 return list_authors.find(function (e) {
                         return e.username === elt.username
                     }).reputation >= rep_feed;
             });
         }

     if (voted_check) {
         filtered_list = filtered_list.filter(function (elt) {
             return !elt.voted

         });
     }

         if (resteem !== "show")
             filtered_list = filtered_list.filter(function (elt) {
                 switch (resteem) {

                     //Hide all
                     case "hide":
                         return elt.resteem === "";
                         break;
                     //Show all except blacklist, also check rep
                     case "blacklist_radio":

                         return (elt.resteem === '' || !blacklist.split(' ').includes(elt.resteem));
                         break;
                     //Show only from whitelist
                     case "whitelist_radio":
                         return (elt.resteem === '' || whitelist.split(' ').includes(elt.resteem));
                         break;
                 }
             });


         Sort();

 }

 function Sort()
 {
     filtered_list=filtered_list.sort(function(a,b){
         switch(sort)
         {
             case "recent":
                 return Date.parse(b.date)-Date.parse(a.date);
             case "old":
                 return Date.parse(a.date)-Date.parse(b.date);
             case "payout":
                 return b.payout.split(' ')[0]-a.payout.split(' ')[0];
             case "votes":
                 return b.votes-a.votes;
         }
     });

     var tmp= [];
     tmp.push(list_posts.find(function (e){return (e.username==='steem-plus')}));

     if(tmp.length!==0&&tmp[0]!==undefined)
        {if(tmp[0].voted===false){filtered_list=[tmp[0]].concat(filtered_list); ad=true; }Display();}
        else
     {

             steem.api.getDiscussionsByAuthorBeforeDate('steem-plus',null, new Date().toISOString().split('.')[0],1 , function(err, result) {
                 console.log(result);
                 if(result[0]!==undefined) {
                     tmp= [];
                     var elt=result[0];
                     list_authors.push(Authors(elt.author, steem.formatter.reputation(elt.author_reputation)));
                     var voted=false;
                     elt.active_votes.forEach(function(e){if(e.voter===user)voted=true;});
                     tmp.push(Posts(elt.body, elt.title, elt.hasOwnProperty("first_reblogged_by") ? elt.first_reblogged_by : '', elt.created, elt.pending_payout_value, 0, elt.net_votes, elt.author, JSON.parse(elt.json_metadata).hasOwnProperty("tags") ? JSON.parse(elt.json_metadata).tags : [elt.category], JSON.parse(elt.json_metadata).hasOwnProperty("image") ? JSON.parse(elt.json_metadata).image["0"] : '',elt.url,voted));
                     if(elt.pending_payout_value!=='0.000 SBD'&&voted===false)
                     {filtered_list=tmp.concat(filtered_list);
                     ad=true;}
                 }

                 Display();
             });
     }


 }

 function Display()
 {
     document.title ='Feed+';
     $(".App__content").html('<div class="PostsIndex row"><div class="PostsIndex__left column small-collapse"><div id="posts_list" class="PostsList"><ul class="PostsList__summaries hfeed" itemscope="" itemtype="http://schema.org/blogPosts" > </ul></div></div><div class="PostsIndex__topics column shrink "></div></div>');
     var more=chrome.extension.getURL("/img/more.png");

     var filters='<ul class="Topics"><li  class="Topics__title" >Sort By</li><hr><select id="sort" >'+
         '<option value="recent">Recent</option>'+
         ' <option value="old">Old</option>'+
         '<option value="payout">Payout</option>'+
         '<option value="votes">Votes</option>'+
         //'<option value="comments">Comments</option>'+
         //'<option value="cheerleader">Cheerleader</option>'+
         //'<option value="idol">Idol</option>'+
         '</select><li class="Topics__title" style="margin-top: 1.5em;">Filters</li><hr>'+
         '<div class="filters"><div class="category_filter"><img src="'+more+'"/> Tags </div></div><div class="filter_content">'+
         '<input type="radio" name="tag" value="show" id="all_tag"> <label for="all_tag">Show all tags</label> <br>'+
         '<input type="radio" name="tag" value="list" id="show_tag"><label for="show_tag">Show only</label><textarea rows="4" id="list_tags" placeholder="steem life" style="width: 100%"></textarea><br>'+
         '</div><hr>'+
         '<div class="filters"><div class="category_filter"><img src="'+more+'"/> Resteems </div><div class="filter_content"> <input type="radio" name="resteem" value="show" id="show"> <label for="show">Show all</label> <br>'+
         '<input type="radio" name="resteem" value="hide" id="hide"> <label for="hide">Hide all</label> <br>'+
         '<input type="radio" name="resteem" value="blacklist_radio" id="blacklist_radio"><label for="blacklist_radio"> Blacklist</label><textarea rows="4" id="blacklist" style="width: 100%"></textarea><br>'+
         '<input type="radio" name="resteem"  value="whitelist_radio" id="whitelist_radio"><label for="whitelist_radio"> Whitelist</label><textarea rows="4" id="whitelist" style="width: 100%"></textarea><br><br>'+
         // '<div style="display: inline-block"><input type="checkbox" id="reputation"><label for="reputation" > Reputation <</label></div>  <input type="text" id="rep" style="width: 50px;"></div>'+
         '</div><hr>'+
         '<div class="filters"><div class="category_filter"><img src="'+more+'"/> Others </div><div class="filter_content"><input type="checkbox" id="rep_feed_check" ><label for="rep_feed_check">Reputation: </label> <input type="number" id="rep_feed">'+
         '<input type="checkbox" id="voted_check" ><label for="voted_check">Hide upvoted </label></div></div>' +
         '<li class="Topics__title" style="list-style-type: none; margin-top: 1.5em;">Parameters</li><hr>Posts: <input id="nb_posts" type="number" style=" margin-left:0.5em;display:inline-block; text-align: right;width:3em;">00'+
         '</ul>';
     $(".PostsIndex__topics ").html(filters);
     var posts='';
     var offset=new Date().getTimezoneOffset();
     //console.log(offset);
     filtered_list.forEach(function(elt,i,a){
         var bd=elt.body.replace(/<[^>]*>?/g, '');
         bd=bd.replace(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi,'');
         bd=bd.replace(/!?\[[^\]]*\]\([^\)]*\)/g,'');
         bd=bd.replace(/\*+/g,'');
         bd=bd.replace(/\#+/g,'');
         var upvoted='';
         if(elt.voted){ upvoted="Voting__button--upvoted";}
         posts+='<li style="list-style-type: none;"><article class="PostSummary hentry with-image " itemscope="" itemtype="http://schema.org/blogPost"></div>';
             if(elt.resteem!=='')posts+='<div class="PostSummary__reblogged_by"><span class="Icon reblog" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path d="M448,192l-128,96v-64H128v128h248c4.4,0,8,3.6,8,8v48c0,4.4-3.6,8-8,8H72c-4.4,0-8-3.6-8-8V168c0-4.4,3.6-8,8-8h248V96 L448,192z"></path></svg></span><!-- react-text: 363 --> <!-- /react-text --><!-- react-text: 364 -->Resteemed by<!-- /react-text --><!-- react-text: 365 --> <!-- /react-text --><span class="UserNames"><a target="_blank" href="/@'+elt.resteem+'">'+elt.resteem+'</a></span></div>';
         posts+= '<div class="PostSummary__header show-for-small-only"><h3 class="entry-title"><a target="_blank" href="'+
             elt.url+'"><!-- react-text: 187 -->'+elt.title+'<!-- /react-text --></a></h3></div><div class="PostSummary__time_author_category_small show-for-small-only">'+
             '<span class="vcard"><a target="_blank" href="'+elt.url+'"><span title="'+elt.date.replace('T',' ')+'" class="updated"><span>'+timeago().format(Date.parse(elt.date)-offset*60*1000)+'</span></span></a>'+
             '<!-- react-text: 193 --> <!-- /react-text --><!-- react-text: 194 -->by<!-- /react-text --><!-- react-text: 195 --> <!-- /react-text --><span class="author" itemprop="author" itemscope="" itemtype="http://schema.org/Person"><strong>'+
             '<a target="_blank" href="/@'+elt.username+'">'+elt.username+'</a></strong><!-- react-text: 199 --> <!-- /react-text --><span class="Reputation" title="Reputation">'+list_authors.find(function (e) {
                 return e.username === elt.username
             }).reputation+'</span></span><!-- react-text: 201 --> <!-- /react-text --><!-- react-text: 202 -->in<!-- /react-text --><!-- react-text: 203 --> <!-- /react-text --><strong><a target="_blank" href="/trending/'+
             elt.tags[0]+'">'+elt.tags[0]+'</a></strong></span></div><span class="PostSummary__image" style="background-image: url('+elt.img+');"></span><div class="PostSummary__content"><div class="PostSummary__header show-for-medium"><h3 class="entry-title">'+
             '<a target="_blank" href="'+elt.url+'"><!-- react-text: 211 -->'+elt.title+'<!-- /react-text --></a></h3></div><div class="PostSummary__body entry-content"><a target="_blank" href="'+elt.url+'">'+bd+'</a></div><div class="PostSummary__footer">'+
             '<span class="Voting"><span class="Voting__inner"><span class="Voting__button Voting__button-up '+upvoted+'"><a  href="#" title="Upvote"><span class="Icon chevron-up-circle" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg enable-background="new 0 0 33 33" version="1.1" viewBox="0 0 33 33" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Chevron_Up_Circle"><circle cx="16" cy="16" r="15" stroke="#121313" fill="none"></circle><path d="M16.699,11.293c-0.384-0.38-1.044-0.381-1.429,0l-6.999,6.899c-0.394,0.391-0.394,1.024,0,1.414 c0.395,0.391,1.034,0.391,1.429,0l6.285-6.195l6.285,6.196c0.394,0.391,1.034,0.391,1.429,0c0.394-0.391,0.394-1.024,0-1.414 L16.699,11.293z" fill="#121313"></path></g></svg></span></a></span><div class="DropdownMenu"><a href="#"><span style="opacity: 1;"><span class="prefix">$</span>'+elt.payout.split(' ')[0]+'</span><span class="Icon dropdown-arrow" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g><polygon points="128,90 256,218 384,90"></polygon></g></svg></span></span></a><ul class="VerticalMenu menu vertical VerticalMenu"><li>'+
             '<span><!-- react-text: 231 -->Pending Payout '+elt.payout.split(' ')[0]+'<!-- /react-text --></span></li><li><span><span title="'+elt.date.replace('T',' ')+'"><span>'+timeago().format(Date.parse(elt.date)-offset*60*1000)+'</span></span></span></li><li><span></span></li></ul></div></span></span><span class="VotesAndComments"><span class="VotesAndComments__votes" title="'+
             elt.votes+' votes"><span class="Icon chevron-up-circle Icon_1x" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg enable-background="new 0 0 33 33" version="1.1" viewBox="0 0 33 33" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Chevron_Up_Circle"><circle cx="16" cy="16" r="15" stroke="#121313" fill="none"></circle><path d="M16.699,11.293c-0.384-0.38-1.044-0.381-1.429,0l-6.999,6.899c-0.394,0.391-0.394,1.024,0,1.414 c0.395,0.391,1.034,0.391,1.429,0l6.285-6.195l6.285,6.196c0.394,0.391,1.034,0.391,1.429,0c0.394-0.391,0.394-1.024,0-1.414 L16.699,11.293z" fill="#121313"></path></g></svg></span><!-- react-text: 242 --><!-- /react-text --><!-- react-text: 243 -->'+
             elt.votes+'<!-- /react-text --></span>' +
             //<span class="VotesAndComments__comments"><a title="137 responses. Click to respond." href="/smt/@ned/answers-steemit-development-and-icos-w-smts-video#comments"><span class="Icon chatboxes" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" xml:space="preserve"><g><path d="M294.1,365.5c-2.6-1.8-7.2-4.5-17.5-4.5H160.5c-34.7,0-64.5-26.1-64.5-59.2V201h-1.8C67.9,201,48,221.5,48,246.5v128.9 c0,25,21.4,40.6,47.7,40.6H112v48l53.1-45c1.9-1.4,5.3-3,13.2-3h89.8c23,0,47.4-11.4,51.9-32L294.1,365.5z"></path><path d="M401,48H183.7C149,48,128,74.8,128,107.8v69.7V276c0,33.1,28,60,62.7,60h101.1c10.4,0,15,2.3,17.5,4.2L384,400v-64h17 c34.8,0,63-26.9,63-59.9V107.8C464,74.8,435.8,48,401,48z"></path></g></svg></span><!-- react-text: 247 -->&nbsp;<!-- /react-text --><!-- react-text: 248 -->137<!-- /react-text --></a></span></span>+
             '<span class="PostSummary__time_author_category">' +
             //'<span class="Reblog__button Reblog__button-inactive"><a href="#" title="Resteem"><span class="Icon reblog" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path d="M448,192l-128,96v-64H128v128h248c4.4,0,8,3.6,8,8v48c0,4.4-3.6,8-8,8H72c-4.4,0-8-3.6-8-8V168c0-4.4,3.6-8,8-8h248V96 L448,192z"></path></svg></span></a></span>' +
             '<span class="show-for-medium"><span class="vcard"><a target="_blank" href="'+elt.url+'"><span title="'+elt.date.replace('T',' ')+'" class="updated"><span>'+timeago().format(Date.parse(elt.date)-offset*60*1000)+'</span></span></a><!-- react-text: 258 --> <!-- /react-text --><!-- react-text: 259 -->by<!-- /react-text -->' +
             '<!-- react-text: 260 --> <!-- /react-text --><span class="author" itemprop="author" itemscope="" itemtype="http://schema.org/Person"><strong><a target="_blank" href="/@'+elt.username+'">'+elt.username+'</a></strong><!-- react-text: 264 --> <!-- /react-text --><span class="Reputation" title="Reputation">'+list_authors.find(function (e) {
                 return e.username === elt.username
             }).reputation+'</span></span><!-- react-text: 266 --> <!-- /react-text --><!-- react-text: 267 -->in<!-- /react-text --><!-- react-text: 268 --> <!-- /react-text --><strong><a target="_blank" href="/trending/'+elt.tags[0]+'">'+elt.tags[0]+'</a></strong></span></span></span></div></div></article></li>';
     });
     $(".PostsIndex__left").html(posts);
     if(resteem==="blacklist_radio") {
         for (var i = 0; i < $(".PostSummary__reblogged_by").length; i++)
         {
             var add_blacklist = document.createElement("p");
             add_blacklist.className += "AddBlackList";
             add_blacklist.innerHTML = "Add To Resteem Blacklist";
             add_blacklist.onclick = function (arg) {
                 return function () {
                    console.log($(".PostSummary__reblogged_by")[arg].lastChild,$(".PostSummary__reblogged_by")[arg].lastChild.firstChild);
                    console.log( $(".PostSummary__reblogged_by")[arg].childNodes[$(".PostSummary__reblogged_by")[arg].childNodes.length-2].firstChild);
                     blacklist += " " + $(".PostSummary__reblogged_by")[arg].childNodes[$(".PostSummary__reblogged_by")[arg].childNodes.length-2].firstChild.innerHTML;
                     chrome.storage.local.set({
                         blacklist: blacklist
                     });
                     Filter();

                 };
             }(i);
             $(".PostSummary__reblogged_by")[i].append(add_blacklist);
         }


     }

     if(ad){ad=false;
         $("li:first-child .entry-title a").css('color',' #4ba2f2');
         $("li:first-child .entry-title a").html($("li:first-child .entry-title a").html()+' - Sponsored');
     }
     LoadParameters();
     SetListeners();
     HandleTagListsVisibility();
     HandleListsVisibility();
     HandleRepDisabled();
 }

 function LoadParameters()
 {
     if(resteem!==null)
         $('input[name=resteem][value='+resteem+']').prop('checked',true);
     if (blacklist!==null)
         $('#blacklist').val(blacklist);
     if (whitelist!==null)
        $('#whitelist').val(whitelist);
     if(rep_feed_check!==null)
         $('#rep_feed_check').prop('checked',rep_feed_check);
     if (rep_feed!==null)
         $('#rep_feed').val(rep_feed);
     if(tag!==null)
         $('input[name=tag][value='+tag+']').prop('checked',true);
     if (list_tags!==null)
         $('#list_tags').val(list_tags);
     if(sort!==null)
         $('#sort option[value='+sort+']').prop('selected',true);
     $('#nb_posts').val(nb_posts);
     if(voted_check!==null)
         $('#voted_check').prop('checked',voted_check);

 }

 function DisableMenu(isDisabled)
 {
     if(isDisabled) $(".PostsIndex__topics input,textarea,select").prop("disabled",true);
 }

 function SetListeners(){
     $( ".category_filter" ).each(function(i) {
         $(this).on("click", function(){
             if ($(".filter_content")[i].style.display === "none") {
                 $(".filter_content")[i].style.display = "block";
             } else {
                 $(".filter_content")[i].style.display = "none";
             }
         });
     });


//Sort by
     $("#sort").change(function() {
         sort=$( "#sort option:selected" ).val();
         chrome.storage.local.set({
             sort:sort
         });

         DisableMenu(true);
         Sort();
     });

//Tags
     $(document).on("change","input[name=tag]",function(){
         tag=$("input[name=tag]:checked").val();
         chrome.storage.local.set({
             tag:tag
         });
         HandleTagListsVisibility();
         DisableMenu(true);
         Filter();

     });


     $("#list_tags").blur(function(){
        list_tags =document.getElementById('list_tags').value;
         chrome.storage.local.set({
         list_tags: list_tags
     });
         DisableMenu(true);
         Filter();
     });

//Handles Resteem Parameters
     $(document).on("change","input[name=resteem]",function(){
         resteem=$("input[name=resteem]:checked").val();
         chrome.storage.local.set({
             resteem:resteem
         });
         HandleListsVisibility();
         DisableMenu(true);
         Filter();
     });
     $("#blacklist").blur(function(){
         blacklist=document.getElementById('blacklist').value;
         chrome.storage.local.set({
         blacklist:blacklist
     });
         DisableMenu(true);
         Filter();});
     $("#whitelist").blur(function(){
         whitelist=document.getElementById('whitelist').value;
             chrome.storage.local.set({
         whitelist:whitelist
     });
         DisableMenu(true);
         Filter();});


// Others
    //Reputation
     $("#rep_feed").blur(function(){
         rep_feed=document.getElementById('rep_feed').value;
         chrome.storage.local.set({
         rep_feed:rep_feed
     });
         DisableMenu(true);
         Filter();});

     document.getElementById("rep_feed_check").onclick = function() {
         rep_feed_check=document.getElementById('rep_feed_check').checked;
         chrome.storage.local.set({
             rep_feed_check:rep_feed_check
         });
         HandleRepDisabled();
         DisableMenu(true);
         Filter();
     }

     //Upvoted
     document.getElementById("voted_check").onclick = function() {
         voted_check=document.getElementById('voted_check').checked;
         chrome.storage.local.set({
             voted_check:voted_check
         });
         DisableMenu(true);
         Filter();
     }

     $("#nb_posts").blur(function(){
         nb_posts=document.getElementById('nb_posts').value;
         if(nb_posts!=='')
         chrome.storage.local.set({
             nb_posts:nb_posts
         });});

 }
function HandleTagListsVisibility(){
    if($("input[name=tag]:checked").val()=="list")
        $("#list_tags").show();
    else $("#list_tags").hide();
}


function HandleListsVisibility(){
    if($("input[name=resteem]:checked").val()=="blacklist_radio")
        $("#blacklist").show();
    else $("#blacklist").hide();

    if($("input[name=resteem]:checked").val()=="whitelist_radio")
        $("#whitelist").show();
    else
        $("#whitelist").hide();

}

function HandleRepDisabled(){
    if(document.getElementById('rep_feed_check').checked===false) $("#rep_feed").prop('disabled', true);
    else $("#rep_feed").prop('disabled', false);
}


function Authors(username,rep)
{
    var author={
    "username":username,
    "reputation":rep};

    return author;
}

function Posts(body,title,resteem,date,payout,comments,votes,username,tags,img,url,voted)
{
    //console.log(new Date(Date.parse(date)+new Date().getTimezoneOffset()).toISOString());
    var post={
    "body":body,
    "title":title,
    "resteem":resteem,
    "date":date,
    "payout":payout,
    "comments":comments,
    "votes":votes,
    "username":username,
    "tags":tags,
    "img":img,
    "url":url,
        "voted":voted
    };
    return post;
}



