var token_dtube_post = null;

var retryCountDtubePost = 0;
var myUsernameDtubePost = null;
var isDTubePost = false;
var droppedFiledDTubePost = null;
var droppedSnapDTubePost = null;

var isUploadedVideo = false;
var isUploadedSnap = false;

var snaphashDTube = null;
var spritehashDTube = null;
var encodedVideosDTube = null;
var videohashDTube = null;
var overlayHashDTube = null;

var articleDTube = null;

var bodySteemit = null;
var headerSteemit = null;
var footerSteemit = null;

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

// Function used to check if the feature can be started.
function canStartDTubePost()
{
  // check if the page load is the post creation page.
  if(regexCreatePostSteemit.test(window.location.href)&&retryCountDtubePost < 20)
  {
    // Check if needed element is loaded and start the feature
    if($("input[name='category']").length > 0)
      startDtubePost();
    else
    {
      //If not wait one second
      setTimeout(function()
      {
        retryCountDtubePost++;
        canStartDTubePost();
      },1000);
    }
  }
}

// Function used to start the feature
function startDtubePost()
{
  // Add input listener on tags input
  $("input[name='category']").bind('input propertychange', function(event){
    checkInputDTube();
  });
  
  // check the content of the input
  // We need to check first because steemit keep draft and tags can be present when page is loaded
  setTimeout(function(){
    checkInputDTube();
    $("input[name=category]").attr('title', 'Information : Add \'dtube\' tag in first position to post on DTube');
  },2000);
}

// Function used to check the tag input
function checkInputDTube()
{
  // Check if 'dtube ' is present
  if($("input[name='category']").val().match(/^dtube /)&&!isDTubePost){
    // open the modal and add the button for dtube
    if($("#post-dtube").length===0){
      $(".post-clear-div").after("<button class='button-steemit' id='post-dtube'>Post with DTube</button><button class='button-steemit' id='cancel-dtube'>Cancel DTube</button>");
      $(".benef").hide();
      $(".post-clear-div").hide();
      $("#cancel-dtube").click(function(){
        cancelDTube();
      });
    }

    // Add listener on click post button
    $("#post-dtube").unbind('click').click(function(){
      if(!isUploadedSnap || !isUploadedVideo)
      {
        var errorMessageDTubePost = null;
        if(!isUploadedSnap) errorMessageDTubePost = "No snapshot found. Please upload a snapshot and try again";
        else if(!isUploadedVideo) errorMessageDTubePost = "No video found. Please upload a video and try again";
        
        // if not display error toast
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
          return;
        }
      }
      // build the article to be posted
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
        // Share a part of the rewards between steemplus and dtube
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
        
        articleDTube.info.title = title;
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
            else 
            {
              // if article is posted, empty the form
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
          }
        );
      }
    });
    // Open modal
    openDTubeDialog();
  }
  else if(isDTubePost&&!$("input[name='category']").val().match(/^dtube /))
  {
    // if dtube is not present but was activated, cancel it
    cancelDTube();
  }
}

// Function used to create the dtube modal
// Will help user to upload videos
function openDTubeDialog()
{
  isDTubePost = true;
  if($('#reopen-dtube').length === 0)
  {
    // Add post and reopen modal buttons
    $('#post-dtube').after($("<button class='button-steemit' id='reopen-dtube'> Open DTube Modal</div>"));
    // Listener on click on reopen modal
    $('#reopen-dtube').click(function(){
      // Show the modal and replace the title and description in the modal by the one on steemit form
      $('#dtube-modal').show();
      $('input[name=video-title-dtube]').eq(0).val($('.ReplyEditor__title').eq(0).val());

      var textareaContent = $('textarea[name=body]').eq(0).val();
      textareaContent = textareaContent.replace(headerSteemit, "");
      textareaContent = textareaContent.replace(footerSteemit, "");

      $('textarea[name=video-description-dtube]').eq(0).val(textareaContent);
    });
  }

  // Modal creation
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

  // Replace the title and description in the modal by the one on steemit form
  modalDTube.find('input[name=video-title-dtube]').eq(0).val($('.ReplyEditor__title').eq(0).val());
  modalDTube.find('textarea[name=video-description-dtube]').eq(0).val($('textarea[name=body]').eq(0).val());
  
  // Hide all the progress bars
  modalDTube.find('.progress-div-video').hide();
  modalDTube.find('.progress-div-snap').hide();
  // Hide buttons
  modalDTube.find('#uploadDTtube').hide();

  // Display modal
  $('body').append(modalDTube);

  toggleAddToPostEnableStatus(false);

  // Listener on close modal button
  $('.close-button').click(function(){
    // We don't cancel dtube post if video or snapshot have been uploaded already
    if(isUploadedVideo || isUploadedSnap)
    {
      $('#dtube-modal').hide();
    }
    else
      cancelDTube();
  });

  // Listener on upload video button
  $('#uploadDTtube').click(function(){
    isUploadedVideo=false;
    toggleAddToPostEnableStatus(false);
    // Create new formData
    var dataDTubePost = new FormData();
    // Add the file to the form data
    dataDTubePost.append(droppedFiledDTubePost.name , droppedFiledDTubePost);

    var credentials = true;
    $('.progress-div-video').show();
    // Launch ajax request to dtube upload system
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
          if (evt.lengthComputable) {
            // On progress, update progress bar
            updateProgressBar($('.upload-progress'), `${(evt.loaded / evt.total * 100).toFixed(2)}%`);
          }
        }, false);
        return xhr;
      },
      success: function (result) {
        // In case of success get the progress of data processing
        if (typeof result === 'string')
          result = JSON.parse(result);
        $('.uploadLabel').text('Upload Finished');
        getProgressByToken(result.token);
      },
      error: function (error) {
        console.log('Error', error);
      }
    });
  });

  // Listener on video drop file
  $('.drop-area-dtube-video').on('drop', function(event)
  {
    $('#uploadDTtube').show();
    droppedFiledDTubePost = event.originalEvent.dataTransfer.files[0];
    $('.drop-area-dtube-msg-video').text(droppedFiledDTubePost.name);
    $('#uploadDTtube').show();
  });

  // Listener on snapshot drop file
  // We decided to launch automatically the upload of the snapshot because it's a small image
  $('.drop-area-dtube-snap').on('drop', function(event)
  {
    isUploadedSnap=false;
    toggleAddToPostEnableStatus(false);
    droppedSnapDTubePost = event.originalEvent.dataTransfer.files[0];
    $('.drop-area-dtube-msg-snap').text(droppedSnapDTubePost.name);

    var dataSnapDTubePost = new FormData();
    dataSnapDTubePost.append(droppedSnapDTubePost.name , droppedSnapDTubePost);

    // Launch request to dtube snapshot upload system
    $.ajax({
      url: 'https://snap1.d.tube/uploadImage',
      type: "POST",
      data: dataSnapDTubePost,
      xhr: function () {
        var xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener("progress", function (evt) {
          if (evt.lengthComputable) {
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
        $('.progress-div-snap').show();
        getProgressSnapByToken(result.token);
      },
      error: function (error) {
      }
    });
  });

  // Listener on add to post button
  $('#addToPost').click(function(){
    // Check if both video and snapshot have been uploaded
    var errorMessageDTubePost = null;
    if(snaphashDTube === null) errorMessageDTubePost = "No snapshot found. Please upload a snapshot and try again";
    else if(videohashDTube === null || spritehashDTube === null) errorMessageDTubePost = "No video found. Please upload a video and try again";
    
    // if not display error toast
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
      // if both have been created, prepare json_metadata
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
      
      // add hashs for differents qualities
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
      // Create steemit new body
      headerSteemit = '<center>';
      headerSteemit += '<a href=\'https://d.tube/#!/v/' + myUsernameDtubePost + '/' + articleDTube.info.permlink + '\'>';
      headerSteemit += '<img src=\'https://ipfs.io/ipfs/' + overlayHashDTube + '\'></a></center><hr>\n\n';
      bodySteemit = articleDTube.content.description
      footerSteemit = '\n\n<hr>';
      footerSteemit += '<a href=\'https://d.tube/#!/v/' + myUsernameDtubePost + '/' + articleDTube.info.permlink + '\'> ▶️ DTube</a><br />';
      footerSteemit += '<a href=\'https://ipfs.io/ipfs/' + videohashDTube + '\'> ▶️ IPFS</a>';
      
      $('.ReplyEditor__title').eq(0).val($('input[name=video-title-dtube]').eq(0).val());
      var text = headerSteemit.concat(bodySteemit);
      text = text.concat(footerSteemit);
      $('.ReplyEditor__body textarea')[0].value = text;
      var event = new Event('input', {
        bubbles: true
      });
      $('.ReplyEditor__body textarea')[0].dispatchEvent(event);
      $('.ReplyEditor__title').eq(0).val($('input[name=video-title-dtube]').eq(0).val());
      $('.ReplyEditor__title')[0].dispatchEvent(event);
      event = new Event('keyup', {
        bubbles: true
      });
      $('.ReplyEditor__body textarea')[0].dispatchEvent(event);
      $('.ReplyEditor__title')[0].dispatchEvent(event);
      $('.ReplyEditor__body textarea').focus();

      // hide the modal
      $('#dtube-modal').hide();
    }
  });
  
}

// This function is used to track to progress of data processing
// @parameter token : token used to identify an image processing
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
      var ipfsAddSpriteProgressValue, spriteCreationProgressValue, ipfsAddSourceVideoProgressValue;
      // Update all the progress bars
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

      // if treatment is finished get ready for posting on the blockchain
      if(response.finished)
      {
        // saving hashs
        spritehashDTube = response.sprite.ipfsAddSprite.hash;
        encodedVideosDTube = response.encodedVideos;
        videohashDTube = response.ipfsAddSourceVideo.hash;
        $('#uploadDTtube').hide();
        isUploadedVideo=true;

        if(isUploadedSnap)
          toggleAddToPostEnableStatus(true);
      }
      else
      {
        // if not try again
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

// Function used to track snapshot treatment progress
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
      $('.uploadSnapshotLabel').text('Processing...');
      // Update progressbar
      if(response.ipfsAddSource.progress !== "100.00%" || response.ipfsAddOverlay.progress !== "100.00%")
        setTimeout(function(){
          getProgressSnapByToken(token);
        },1000);
      else
      {
        // If treatment is finish
        updateProgressBar($('.uploadSnapshot-progress'), "100.00%");
        // save hash
        snaphashDTube = response.ipfsAddSource.hash;
        overlayHashDTube = response.ipfsAddOverlay.hash;
        isUploadedSnap = true;
        $('.uploadSnapshotLabel').text('Finished');

        if(isUploadedVideo)
          toggleAddToPostEnableStatus(true);
      }
    },
    error: function(msg) {
      resolve(msg);
    }
  });
}

// Function used to update progress bar
// @parameter progressbar : targeted progressbar
// @parameter value : value of the progress
function updateProgressBar(progressbar, value)
{
  progressbar.css("width", value);
  progressbar.text(value);
}

// Function used to cancel the dtube post
function cancelDTube()
{
  // Remove dtube elements and show initials one
  $('input[name=category]')[0].value = $('input[name=category]')[0].value.replace("dtube ", "");
  $(".benef").show();
  $(".post-clear-div").show();
  $("#post-dtube").remove();
  $("#cancel-dtube").remove();
  $("#reopen-dtube").remove();
  $("#dtube-modal").remove();

  // Init all variables
  isDTubePost = false;
  droppedFiledDTubePost = null;
  droppedSnapDTubePost = null;
  snaphashDTube = null;
  spritehashDTube = null;
  videohashDTube = null;
  encodedVideos = null;
  overlayHashDTube = null;
  articleDTube = null;
  isUploadedVideo = false;
  isUploadedSnap = false;
  bodySteemit = null;
  headerSteemit = null;
  footerSteemit = null;
}

// Function used to generate a permlink
// @parameter length
function createPermlink(length)
{
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  // Depending on the length, pick x caracters in 'possible'
  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function toggleAddToPostEnableStatus(enabled)
{
  console.log("toggleAddToPostEnableStatus", enabled, $('#addToPost').eq(0));
  if(enabled)
  {
    $('#addToPost').eq(0).prop('disabled', false);
    $('#addToPost').eq(0).removeClass('button-steemit-disabled');
  }
  else
  {
    $('#addToPost').eq(0).prop('disabled', true);
    $('#addToPost').eq(0).addClass('button-steemit-disabled');
  }
  
}


