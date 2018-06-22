var token_add_signature = null;

var retryCountAddSignature = 0;

var isSteemit = null;
var isBusy = null;
var isUtopian = null;

var myUsernameSignature = null;


// Listener to messages start, click
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.to==='add_signature'&&request.order==='start'&&token_add_signature==null)
  {
    token_add_signature=request.token;
    myUsernameSignature = request.data.user;
    isSteemit = request.data.steemit;
    isBusy = request.data.busy;
    isUtopian = request.data.utopian;
    retryCountAddSignature = 0;
    startAddSignature();
  }
  else if(request.to==='add_signature'&&request.order==='click'&&token_add_signature==request.token)
  {
    myUsernameSignature = request.data.user;
    isSteemit = request.data.steemit;
    isBusy = request.data.busy;
    isUtopian = request.data.utopian;
    retryCountAddSignature = 0;
    startAddSignature();
  }
});


// Function used to start Add signature feature
function startAddSignature()
{
  if(isSteemit)
  {
    // If page is settings pages, start create signature
    if(regexSettingsSteemit.test(window.location.href)&&retryCountAddSignature<20)
    {
      if($('.Settings').length > 0)
      {
        if(window.location.href.match(regexSettingsSteemit)[1]===myUsernameSignature)
          displayCreateSignature();
      }
      else
      {
        retryCountAddSignature++;
        setTimeout(startAddSignature, 1000);
      }
    }
    // If not create check if it's create post page or post page
    else if(regexPostSteemit.test(window.location.href))
    {
      $('.ReplyEditor__body textarea').each(function() {
        var textarea = $(this);
        setupAddCommentSignature(textarea);
      });

      $('.Comment__footer__controls > a').click(function(){
        setTimeout(function(){
          $('.ReplyEditor__body textarea').each(function() {
            var textarea = $(this);
            setupAddCommentSignature(textarea);
          });
        },1000);  
      });

      $('.PostFull__reply > a').click(function(){
        setTimeout(function(){
          $('.ReplyEditor__body textarea').each(function() {
            var textarea = $(this);
            setupAddCommentSignature(textarea);
          });
        },1000);
      });
    } 
    else if(regexCreatePostSteemit.test(window.location.href))
    {
      $('.ReplyEditor__body textarea').each(function() {
        var textarea = $(this);
        setupAddPostSignature(textarea);
      });
    }
  }
  else if(isBusy)
  {
    if(regexCreatePostBusy.test(window.location.href))
    {
      if($('textarea.ant-input').length===0)
      {
        retryCountAddSignature++;
        setTimeout(startAddSignature, 1000);
      }
      else
      {
        setupAddPostSignature($('textarea.ant-input'));
      }
    }
    else if(regexSettingsBusySignature.test(window.location.href))
    {
      if(window.location.href.match(regexSettingsBusySignature)[1]===myUsernameSignature)
      {
        $('.content').children().remove();
        displayCreateSignature();
      }
    }
    else if(regexPostBusy.test(window.location.href))
    {
      
      setTimeout(function(){
        $('textarea.ant-input').each(function() {
          var textarea = $(this);
          setupAddCommentSignature(textarea);
        });
      },2000);
      

      $('a.CommentFooter__link').click(function(){
        setTimeout(function(){
          $('textarea.ant-input').each(function() {
            var textarea = $(this);
            setupAddCommentSignature(textarea);
          });
        },1000);  
      });
    }
  }
}

// Function used to display the panel to create the signature
// This panel contains a dropdown list to choose between post and comment and a MD Editor
function displayCreateSignature()
{
  // Get comment signature and post signature from local storage
  chrome.storage.local.get(['user_signature_comments', 'user_signature_posts'], function(item){
    var userSignatureComments = (item.user_signature_comments===undefined ? '' : item.user_signature_comments );
    var userSignaturePosts = (item.user_signature_posts===undefined ? '' : item.user_signature_posts );

    var classButtonSaveSignature = '';
    if(isBusy) classButtonSaveSignature = 'ant-btn Action--primary';
    else if(isSteemit) classButtonSaveSignature = 'button';


    var divSignature = $('<div class="signature-panel">\
      <div class="bootstrap-wrapper">\
          <div class="container container-signature-md">\
            <div class="row">\
              <h4>Signature</h4>\
              <select id="select-type-signature" class="col-12">\
                <option value="posts">Posts</option> \
                <option value="comments">Comments</option>\
              </select>\
              <br>\
              <div class="col-12 bar">\
                <ul class="markdownlive-bar editor-bar">\
                  <li title="Bold" data-before="**" data-after="**" data-placeholder="some text in bold">\
                    <i class="fa fa-bold"></i>\
                  </li>\
                  <li title="Italics" data-before="*" data-after="*" data-placeholder="some text in italic">\
                    <i class="fa fa-italic"></i>\
                  </li>\
                  <li title="Link" data-before="[ " data-after="](http:// &quot;Link title&quot;)" data-placeholder="link">\
                    <i class="fa fa-link"></i>\
                  </li>\
                  <li title="Image" data-before="![Alt text](" data-after=")" data-placeholder="http://">\
                    <i class="fa fa-picture-o"></i>\
                  </li>\
                  <li title="Unordered list" data-before="* " data-after="" data-extendselect="1">\
                    <i class="fa fa-list-ul"></i>\
                  </li>\
                  <li title="Ordered list" data-before="1. " data-after="" data-placeholder="Item 1&#13;2. Item 2&#13;3. Item 3&#13;" data-extendselect="1">\
                    <i class="fa fa-list-ol"></i>\
                  </li>\
                  <li title="Blocks" data-before="    " data-after="" data-placeholder="A block content" data-block="1" data-extendselect="1">\
                    <i class="fa fa-indent"></i>\
                  </li>\
                  <li title="Table" data-before="" data-placeholder="First Header  &#124;Second Header &#13;------------- &#124;------------- &#13;Content cell 1 &#124;Content cell 2 &#13;Content cell 3  &#124;Content cell 4 &#13;" data-after="" data-block="1">\
                    <i class="fa fa-table"></i>\
                  </li>\
                  <li title="Quote" data-before="> " data-after="" data-extendselect="1" data-block="1" data-placeholder="Quoted text">\
                    <i class="fa fa-quote-right"></i>\
                  </li>\
                  <li title="Horizontal rule" data-before="***" data-after="" data-extendselect="1" data-block="1">\
                    <i class="fa fa-ellipsis-h"></i>\
                  </li>\
                  <li title="Center" data-before="<center>" data-after="</center>" data-extendselect="1">\
                    <i class="fa fa-align-center"></i>\
                  </li>\
                </ul>\
              </div>\
              <textarea class="col-6 signature-editor" data-bar=".editor-bar" data-preview=".editor-preview">'+ userSignaturePosts + '</textarea>\
              <div class="markdownlive-preview editor-preview col-6 signature-preview"></div>\
              <input id="saveSignature" class="' + classButtonSaveSignature + '" value="Save Posts Signature" style="margin-top: 1em;">\
            </div>\
          </div>\
      </div>\
    </div>');
    
    // Add panel to setting page
    if(isSteemit)
      $('.Settings').append(divSignature);
    else if(isBusy)
    {
      document.title = 'Edit signature';
      $('.content').children().remove();
      $('.content').append(divSignature);

    }

    // Listener on change dropdown lists
    $('#select-type-signature').on('change', function(){
      if($(this)[0].value === 'posts')
      {
        $('#saveSignature')[0].value = 'Save Posts Signature';
        $('.signature-editor')[0].value = userSignaturePosts;
        $('textarea')[0].dispatchEvent(new Event('keyup'));
      }
      else if($(this)[0].value === 'comments')
      {
        $('#saveSignature')[0].value = 'Save Comments Signature';
        $('.signature-editor')[0].value = userSignatureComments;
        $('textarea')[0].dispatchEvent(new Event('keyup'));
      }
    });

    // Start markdown editor
    $('textarea').markdownlive();


    // Listener save button
    $('#saveSignature').click(function(){

      // Set config of toastr
      toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-bottom-center",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": 2000,
        "extendedTimeOut": 0,
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut",
        "tapToDismiss": false
      };


      // Save signature in local storage and display a toastr to inform users
      if($('#select-type-signature')[0].value === 'posts')
      {
        userSignaturePosts = $('.signature-editor')[0].value;
        toastr.success('Posts signature saved! <br> You can now use it in posts', "Message from SteemPlus");
        chrome.storage.local.set({
          user_signature_posts:userSignaturePosts.trim()
        });
      }
      else if($('#select-type-signature')[0].value === 'comments')
      {
        userSignatureComments = $('.signature-editor')[0].value;
        toastr.success('Comments signature saved! <br> You can now use it in comments', "Message from SteemPlus");
        chrome.storage.local.set({
          user_signature_comments:userSignatureComments.trim()
        });
      }
      
    });
  });
}

// Function used to setup the post signature's add button
// @parameter textarea : textarea linked to the add button
// A click on add will add the post signature to the post
function setupAddPostSignature(textarea)
{
  if($(textarea).parent().find('.edit-signature-post').length === 0)
  {
    // Get signature from local storage
    // We use local storage again and not parameter cause if user updated his signature in another tab, we still use the newest one
    chrome.storage.local.get(['user_signature_posts'], function(item){
      if(item.user_signature_posts!==undefined&&item.user_signature_posts!=='')
      {
        $(textarea).after('<a class="add-signature-post">Add Signature</a>');
        $('.add-signature-post').on('click', function(){
            $(textarea)[0].value = $(textarea).val() + '\n' + (item.user_signature_posts);
            
            // Fire event to refresh the preview
            // We need to fire this event cause $(textarea)[0].value = ... doesn't fire any event and the preview won't be refresh
            var event = new Event('input', { bubbles: true });
            $(textarea)[0].dispatchEvent(event);
            event = new Event('keyup', { bubbles: true });
            $(textarea)[0].dispatchEvent(event);
            $(textarea).focus();
        });
      }  
    });
    // Add edit button. Open page in another tab
    $(textarea).after('<a target="_blank" href="/@' + myUsernameSignature + '/settings" class="edit-signature-post">Edit Signature</a>');
  }
}

// Function used to setup the comment signature's add button
// @parameter textarea : textarea linked to the add button
// A click on add will add the comment signature to the comment
function setupAddCommentSignature(textarea)
{
  if($(textarea).parent().find('.edit-signature-comment').length === 0)
  {
    // Add edit button. Open page in another tab
    $(textarea).after('<a target="_blank" href="/@' + myUsernameSignature + '/settings" class="edit-signature-comment">Edit Signature</a>');
    
    // Get signature from local storage
    // We use local storage again and not parameter cause if user updated his signature in another tab, we still use the newest one
    chrome.storage.local.get(['user_signature_comments'], function(item){
      if(item.user_signature_comments!==undefined&&item.user_signature_comments!=='')
      {
        $(textarea).after('<a class="add-signature-comment">Add Signature</a>');
        $('.add-signature-comment').on('click', function(){
            $(textarea)[0].value = $(textarea).val() + '\n' + (item.user_signature_comments);
            
            // Fire event to refresh the preview
            // We need to fire this event cause $(textarea)[0].value = ... doesn't fire any event and the preview won't be refresh
            setTimeout(function(){
              var event = new Event('input', { bubbles: true });
              $(textarea)[0].dispatchEvent(event);
              $(textarea).focus();
            },1000);
        });
      }  
    });
  }
}

// Function use to update preview
// @parameter textarea : textarea linked to the preview which need a refresh
function updatePreview(textarea){
  var markdown_text = $(textarea).val(),
      markdown_html = Markdown(markdown_text),
      preview = $();

  if ($preview.length >0){
      $preview.html(markdown_html);    
  }
}



