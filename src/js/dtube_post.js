var token_dtube_post = null;

var retryCountDtubePost = 0;
var myUsernameDtubePost = null;
var isDTubePost = false;
var droppedFiledDTubePost = null;
var droppedSnapDTubePost = null;

var snaphashDTube = null;
var spritehashDTube = null;
var encodedVideosDTube = null;
var videohashDTube = null;
var overlayHashDTube = null;

var articleDTube = null;

var bodySteemit = null;

// Listener to messages start, click
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.to === 'dtube_post' && request.order === 'start' && token_dtube_post == null) 
  {
    token_dtube_post = request.token;
    myUsernameDtubePost = request.data.user;
    retryCountDtubePost = 0;
    canStartDTubePost();
  } 
  else if (request.to === 'dtube_post' && request.order === 'click' && token_dtube_post == request.token) 
  {
    myUsernameDtubePost = request.data.user;
    retryCountDtubePost = 0;
    canStartDTubePost();
  }
});

function canStartDTubePost()
{
  if(regexCreatePostSteemit.test(window.location.href)&&retryCountDtubePost < 20)
  {
    if($("input[name='category']").length > 0)
      startDtubePost();
    else
    {
      setTimeout(function()
      {
        retryCountDtubePost++;
        canStartDTubePost();
      },1000);
    }
  }
}

function startDtubePost()
{
  $("input[name='category']").on('focus', function()
  {
    $("input[name='category']").bind('input propertychange', function(event){
      checkInputDTube();
    });
  });
  
  setTimeout(function(){
    checkInputDTube();
    $("input[name=category]").attr('title', 'Information : Add \'dtube\' tag to post on DTube');
  },2000);


}

function checkInputDTube()
{
  if($("input[name='category']").val().match(/^dtube /)&&!isDTubePost){
    if($("#post-dtube").length===0){
      console.log('ici');
      $(".post-clear-div").after("<button class='button-steemit' id='post-dtube'>Post with DTube</button><button class='button-steemit' id='cancel-dtube'>Cancel DTube</button>");
      $(".benef").hide();
      $(".post-clear-div").hide();
      $("#cancel-dtube").click(function(){
        cancelDTube();
      });
    }

    $("#post-dtube").unbind('click').click(function(){
      var tags = $(' input[tabindex=3]').eq(0).val().split(' ');
      var permlinkSteemit=articleDTube.info.permlink
      .replace(/[^\w-]+/g,'');
      var title=$('.vframe input').eq(0).val();
      var body=$('.vframe textarea').eq(0).val();
      var sbd_percent=$('.benef-steemit-percentage').eq(0).val();
      if(title=="")
        alert("Please enter a title!");
      else if(body=="")
        alert("Please write the body content of your post!");
      else{
        var beneficiaries_dtube=[];
        beneficiaries_dtube.push({
          account: 'steemplus-pay',
          weight: 100*1
        },{
          account: 'dtube.rewards',
          weight: 100*24
        });

        var maximumAcceptedPayout = '100000.000 SBD';
        if(parseInt(sbd_percent)===-1)
        {
          maximumAcceptedPayout = '0.000 SBD';
          sbd_percent = 10000;
        }

        if(articleDTube.info.title === "") articleDTube.info.title = title;

        articleDTube.content.tags = tags;

        var operationsDTube = [
        ['comment',
        {
          parent_author: '',
          parent_permlink: tags[0],
          author: myUsernameDtubePost,
          permlink: permlinkSteemit,
          title: title,
          body: body,
          json_metadata : JSON.stringify({
            video: articleDTube,
            tags: tags,
            app: 'steem-plus-app'
          })
        }
        ],
        ['comment_options', 
        {
          author: myUsernameDtubePost,
          permlink: permlinkSteemit,
          max_accepted_payout: maximumAcceptedPayout,
          percent_steem_dollars: parseInt(sbd_percent),
          allow_votes: true,
          allow_curation_rewards: true,
          extensions: [
          [0, {
            beneficiaries: beneficiaries_dtube
          }]
          ]
        }]
        ];
        console.log(operationsDTube);
        sc2.broadcast(
          operationsDTube,
          function(e, r)
          {
            if (e)
            {
              if(e.error!==undefined)
              {
                console.log(e,e.error);
                alert("Something went wrong, please try again later!");
              }
            }
            else {
              $('.vframe input').eq(0).val("");
              $('.vframe textarea').eq(0).val("");
              $(' input[tabindex=3]').eq(0).val("");
              var event = new Event('input', {
               bubbles: true
             });
              $('.vframe input')[0].dispatchEvent(event);
              $('.ReplyEditor__body textarea')[0].dispatchEvent(event);
              $(' input[tabindex=3]')[0].dispatchEvent(event);

              event = new Event('keyup', {
               bubbles: true
             });
              $('.vframe input')[0].dispatchEvent(event);
              $('.ReplyEditor__body textarea')[0].dispatchEvent(event);
              $(' input[tabindex=3]')[0].dispatchEvent(event);
              window.location.replace('https://steemit.com');
            }
          });
      }
    });
    openDTubeDialog();
  }
}

function openDTubeDialog()
{
  isDTubePost = true;
  if($('#reopen-dtube').length === 0)
  {
    $('#post-dtube').after($("<button class='button-steemit' id='reopen-dtube'> Open DTube Modal</div>"));
    $('#reopen-dtube').click(function(){
      $('#dtube-modal').show();
    });
  }
  var modalDTube = $(`
    <div id="dtube-modal" data-reactroot="" role="dialog" style="bottom: 0px; left: 0px; overflow-y: scroll; position: fixed; right: 0px; top: 0px;">
    <div class="reveal-overlay fade in" style="display: block;"></div><div class="reveal fade in" role="document" tabindex="-1" style="display: block;">
    <button class="close-button" type="button"><span aria-hidden="true" class="">×</span></button>
    <div>
    <div><h3>Post on Dtube</h3></div>
    <div id= "disclaimer_dtube">You are about to post using DTube. Upload your video using the following dropdown area.
    <br>If you change your mind and want to create a non-Dtube post, simply remove the <b>dtube</b> tag.
    </div>
    <label class="label-title dropAreaVideo">Video : </label>
    <div class="drop-area-dtube drop-area-dtube-video">
    <span class="drop-area-dtube-msg drop-area-dtube-msg-video">Drop a file here</span>
    </div>
    <button class="button-steemit" id="uploadDTtube">Upload</button>

    <div class="progress-div-video">
    <label class="label-title uploadTitle">Upload File : </label>
    <div class="progress-container">
    <div class="progressbar upload-progress" style="width:0%">0.00%</div>
    </div>
    <label class="label-progress uploadLabel">Uploading...</label>

    <label class="label-title ipfsAddSpriteTitle">IPFS Add Sprite : </label>
    <div class="progress-container">
    <div class="progressbar ipfsAddSprite-progress" style="width:0%">0.00%</div>
    </div>
    <label class="label-progress ipfsAddSpriteLabel"></label>

    <label class="label-title spriteCreationTitle">Sprite Creation : </label>
    <div class="progress-container">
    <div class="progressbar spriteCreation-progress" style="width:0%">0.00%</div>
    </div>
    <label class="label-progress spriteCreationLabel"></label>

    <label class="label-title ipfsAddSourceVideoTitle">IPFS Add Source Video : </label>
    <div class="progress-container">
    <div class="progressbar ipfsAddSourceVideo-progress" style="width:0%">0.00%</div>
    </div>
    <label class="label-progress ipfsAddSourceVideoLabel"></label>
    </div>

    <label class="label-title dropAreaSnap">Snapshot : </label>
    <div class="drop-area-dtube drop-area-dtube-snap">
    <span class="drop-area-dtube-msg drop-area-dtube-msg-snap">Drop a file here</span>
    </div>

    <div class="progress-div-snap">
    <label class="label-title uploadSnapshot">Upload Snapshot : </label>
    <div class="progress-container">
    <div class="progressbar uploadSnapshot-progress" style="width:0%">0.00%</div>
    </div>
    <label class="label-progress uploadSnapshotLabel"></label>
    </div>
    <div class="videoInformation">
    <label class="label-title">Video Title</label>
    <input type="text" name="video-title-dtube"/>
    <label class="label-title">Description</label>
    <textarea class="video-description-dtube" name="video-description-dtube"></textarea>
    </div>
    <button class="button-steemit" id="addToPost">Add to post</button>
    </div>
    </div>
    </div>`);
  modalDTube.find('.progress-div-video').hide();
  modalDTube.find('.progress-div-snap').hide();
  modalDTube.find('#addToPost').hide();
  modalDTube.find('#uploadDTtube').hide();
  $('body').append(modalDTube);

  $('.close-button').click(function(){
    console.log('hide');
    $('#dtube-modal').hide();
  });

  $('#uploadDTtube').click(function(){
    var dataDTubePost = new FormData();
    dataDTubePost.append(droppedFiledDTubePost.name , droppedFiledDTubePost);

    var credentials = true;
    $('.progress-div-video').show();
    $.ajax({
      cache: false,
      contentType: false,
      data: dataDTubePost,
      processData: false,
      type: "POST",
      url: 'https://cluster.d.tube/uploadVideo?videoEncodingFormats=240p,480p,720p,1080p&sprite=true',
      xhrFields: {
        withCredentials: credentials
      },
      xhr: function () {
        // listen for progress events on the upload
        var xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener("progress", function (evt) {
          console.log(evt);
          if (evt.lengthComputable) {
            updateProgressBar($('.upload-progress'), `${(evt.loaded / evt.total * 100).toFixed(2)}%`);
          }
        }, false);
        return xhr;
      },
      success: function (result) {
        console.log(result);
        if (typeof result === 'string')
          result = JSON.parse(result);
        console.log(result);
        $('.uploadLabel').text('Upload Finished');
        getProgressByToken(result.token);
      },
      error: function (error) {
        console.log('Error', error);
      }
    });
  });

  $('.drop-area-dtube-video').on('drop', function(event)
  {
    droppedFiledDTubePost = event.originalEvent.dataTransfer.files[0];
    $('.drop-area-dtube-msg-video').text(droppedFiledDTubePost.name);
    $('#uploadDTtube').show();
  });

  $('.drop-area-dtube-snap').on('drop', function(event)
  {
    droppedSnapDTubePost = event.originalEvent.dataTransfer.files[0];
    $('.drop-area-dtube-msg-snap').text(droppedSnapDTubePost.name);

    var dataSnapDTubePost = new FormData();
    dataSnapDTubePost.append(droppedSnapDTubePost.name , droppedSnapDTubePost);

    $.ajax({
      url: 'https://snap1.d.tube/uploadImage',
      type: "POST",
      data: dataSnapDTubePost,
      xhr: function () {
        var xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener("progress", function (evt) {
          if (evt.lengthComputable) {
            console.log(evt.loaded, evt.total);
          }
        }, false);
        return xhr;
      },
      cache: false,
      contentType: false,
      processData: false,
      success: function (result) {
        if (typeof result === 'string')
          result = JSON.parse(result)
        console.log(result);
        $('.progress-div-snap').show();
        getProgressSnapByToken(result.token);
      },
      error: function (error) {
      }
    });
  });
  
}


function getProgressByToken(token)
{
  $.ajax({
    type: "GET",
    beforeSend: function(xhttp) {
      xhttp.setRequestHeader("Content-type", "application/json");
      xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
    },
    url: 'https://cluster.d.tube/getProgressByToken/' + token,
    success: function(response) {
      console.log(response);
      var ipfsAddSpriteProgressValue, spriteCreationProgressValue, ipfsAddSourceVideoProgressValue;
      if(response.sprite.ipfsAddSprite.step === "Waiting")
      {
        ipfsAddSpriteProgressValue = 0.00;
        $('.ipfsAddSpriteLabel').text('Waiting... Position in queue : ' + response.sprite.ipfsAddSprite.positionInQueue);
      }
      else if(response.sprite.ipfsAddSprite.step === "Init")
      {
        ipfsAddSpriteProgressValue = 0.00;
        $('.ipfsAddSpriteLabel').text(response.sprite.ipfsAddSprite.progress);
      }
      else
      {
        ipfsAddSpriteProgressValue = (response.sprite.ipfsAddSprite.progress === null ? 0.00 : response.sprite.ipfsAddSprite.progress);
        updateProgressBar($('.ipfsAddSprite-progress'), ipfsAddSpriteProgressValue);
        if(ipfsAddSpriteProgressValue === "100.00%") $('.ipfsAddSpriteLabel').text('Finished');
        else $('.ipfsAddSpriteLabel').text('Processing...'); 
      }

      if(response.ipfsAddSourceVideo.step === "Waiting")
      {
        ipfsAddSourceVideoProgressValue = 0.00;
        $('.ipfsAddSourceVideoLabel').text('Waiting... Position in queue : ' + response.ipfsAddSourceVideo.positionInQueue);
      }
      else
      {
        ipfsAddSourceVideoProgressValue = (response.ipfsAddSourceVideo.progress === null ? 0.00 : response.ipfsAddSourceVideo.progress);
        updateProgressBar($('.ipfsAddSourceVideo-progress'), ipfsAddSourceVideoProgressValue);
        if(ipfsAddSourceVideoProgressValue === "100.00%") $('.ipfsAddSourceVideoLabel').text('Finished');
        else $('.ipfsAddSourceVideoLabel').text('Processing...'); 
      }

      if(response.sprite.spriteCreation.step === "Waiting")
      {
        spriteCreationProgressValue = 0.00;
        $('.spriteCreationLabel').text('Waiting... Position in queue : ' + response.sprite.spriteCreation.positionInQueue);
      }
      else
      {
        spriteCreationProgressValue = (response.sprite.spriteCreation.progress === null ? 0.00 : response.sprite.spriteCreation.progress);
        updateProgressBar($('.spriteCreation-progress'), spriteCreationProgressValue);
        if(spriteCreationProgressValue === "100.00%") $('.spriteCreationLabel').text('Finished');
        else $('.spriteCreationLabel').text('Processing...'); 
      }

      if(response.finished)
      {
        spritehashDTube = response.sprite.ipfsAddSprite.hash;
        encodedVideosDTube = response.encodedVideos;
        videohashDTube = response.ipfsAddSourceVideo.hash;
        prepareDtubePost();
      }
      else
      {
        setTimeout(function(){
          getProgressByToken(token);
        }, 2500);
      }
    },
    error: function(msg) {
      resolve(msg);
    }
  });
}

function getProgressSnapByToken(token)
{
  $.ajax({
    type: "GET",
    beforeSend: function(xhttp) {
      xhttp.setRequestHeader("Content-type", "application/json");
      xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
    },
    url: 'https://snap1.d.tube/getProgressByToken/' + token,
    success: function(response) {
      console.log(response);
      $('.uploadSnapshotLabel').text('Processing...');
      if(response.ipfsAddSource.progress !== "100.00%" || response.ipfsAddOverlay.progress !== "100.00%")
        setTimeout(function(){
          getProgressSnapByToken(token);
        },1000);
      else
      {
        updateProgressBar($('.uploadSnapshot-progress'), "100.00%");
        snaphashDTube = response.ipfsAddSource.hash;
        overlayHashDTube = response.ipfsAddOverlay.hash;
        $('.uploadSnapshotLabel').text('Finished');
      }
    },
    error: function(msg) {
      resolve(msg);
    }
  });
}

function updateProgressBar(progressbar, value)
{
  console.log(progressbar, value);
  progressbar.css("width", value);
  progressbar.text(value);
}

function prepareDtubePost()
{
  console.log('prepare Dtube post');
  $('#addToPost').show();
  $('#uploadDTtube').hide();

  $('#addToPost').click(function(){
    console.log('add to post');
    var errorMessageDTubePost = null;
    if(snaphashDTube === null) errorMessageDTubePost = "No snapshot found. Please upload a snapshot and try again";
    else if(videohashDTube === null || spritehashDTube === null) errorMessageDTubePost = "No video found. Please upload a video and try again";
    
    if(errorMessageDTubePost !== null)
    {
      toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-full-width",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": 0,
        "extendedTimeOut": 0,
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut",
        "tapToDismiss": true
      };
      toastr.error(errorMessageDTubePost, "Error");
    }
    else
    {
      console.log(droppedFiledDTubePost);
      articleDTube = {
        info: {
          title: $('input[name=video-title-dtube]')[0].value,
          snaphash: snaphashDTube,
          author: myUsernameDtubePost,
          permlink: createPermlink(8),
          duration: 20,
          filesize: droppedFiledDTubePost.size,
          spritehash: spritehashDTube
        },
        content: {
          videohash: videohashDTube,
          description: $('textarea[name=video-description-dtube]')[0].value,
          tags: []
        }
      }

      for (let i = 0; i < encodedVideosDTube.length; i++) {
        switch(encodedVideosDTube[i].ipfsAddEncodeVideo.encodeSize || encodedVideosDTube[i].encode.encodeSize) {
          case '240p':
            articleDTube.content.video240hash = encodedVideosDTube[i].ipfsAddEncodeVideo.hash;
            break;
          case '480p':
            articleDTube.content.video480hash = encodedVideosDTube[i].ipfsAddEncodeVideo.hash;
            break;
          case '720p':
            articleDTube.content.video720hash = encodedVideosDTube[i].ipfsAddEncodeVideo.hash;
            break;
          case '1080p':
            articleDTube.content.video1080hash = encodedVideosDTube[i].ipfsAddEncodeVideo.hash;
            break;
        }
      }
      console.log(articleDTube);
      bodySteemit = '<center>';
      bodySteemit += '<a href=\'https://d.tube/#!/v/' + myUsernameDtubePost + '/' + articleDTube.info.permlink + '\'>';
      bodySteemit += '<img src=\'https://ipfs.io/ipfs/' + overlayHashDTube + '\'></a></center><hr>\n\n';
      bodySteemit += articleDTube.content.description;
      bodySteemit += '\n\n<hr>';
      bodySteemit += '<a href=\'https://d.tube/#!/v/' + myUsernameDtubePost + '/' + articleDTube.info.permlink + '\'> ▶️ DTube</a><br />';
      bodySteemit += '<a href=\'https://ipfs.io/ipfs/' + videohashDTube + '\'> ▶️ IPFS</a>';
      
      $('.ReplyEditor__body textarea')[0].value = bodySteemit;
      var event = new Event('input', {
        bubbles: true
      });
      $('.ReplyEditor__body textarea')[0].dispatchEvent(event);
      event = new Event('keyup', {
          bubbles: true
      });
      $('.ReplyEditor__body textarea')[0].dispatchEvent(event);
      $('.ReplyEditor__body textarea').focus();

      $('#dtube-modal').hide();
    }
  });
}

function cancelDTube()
{
  $('input[name=category]')[0].value = "";
  $(".benef").show();
  $(".post-clear-div").show();
  $("#post-dtube").remove();
  $("#cancel-dtube").remove();
  $("#reopen-dtube").remove();
  $("#dtube-modal").remove();
  isDTubePost = false;
  droppedFiledDTubePost = null;
  droppedSnapDTubePost = null;
  snaphashDTube = null;
  spritehashDTube = null;
  videohashDTube = null;
  encodedVideos = null;
  overlayHashDTube = null;
  articleDTube = null;
}

function createPermlink(length)
{
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


