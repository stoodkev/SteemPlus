var token_add_signature = null;

var retryCountAddSignature = 0;

var isSteemit = null;
var isBusy = null;
var isUtopian = null;

var myUsernameSignature = null;

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

      $('.Comment__footer__controls > a').bind('click', function(){
        console.log('Comment__footer__controls');
        $('.ReplyEditor__body textarea').each(function() {
          var textarea = $(this);
          console.log(textarea);
          setupAddCommentSignature(textarea);
        });
      });

      $('.PostFull__reply > a').bind('click', function(){
        console.log('PostFull__reply');
        $('.ReplyEditor__body textarea').each(function() {
          var textarea = $(this);
          console.log(textarea);
          setupAddCommentSignature(textarea);
        });
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

  }
  else if(isUtopian)
  {

  }
  
}

function displayCreateSignature()
{
  chrome.storage.local.get(['user_signature_comments', 'user_signature_posts'], function(item){
    var userSignatureComments = (item.user_signature_comments===undefined ? '' : item.user_signature_comments );
    var userSignaturePosts = (item.user_signature_posts===undefined ? '' : item.user_signature_posts );

    var divSignature = $('<div class="signature-panel">\
      <div class="bootstrap-wrapper">\
        <h4>Signature</h4>\
          <div class="container container-signature-md">\
            <div class="row">\
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
              <input id="saveSignature" class="button" value="Save Posts Signature" style="margin-top: 1em;">\
            </div>\
          </div>\
      </div>\
    </div>');

    $('.Settings').append(divSignature);

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

    $('textarea').markdownlive();

    $('#saveSignature').click(function(){

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

      if($('#select-type-signature')[0].value === 'posts')
      {
        userSignaturePosts = $('.signature-editor')[0].value;
        toastr.success('Posts signature saved! <br> You cannow use it in posts', "Message from SteemPlus");
        chrome.storage.local.set({
          user_signature_posts:userSignaturePosts
        });
      }
      else if($('#select-type-signature')[0].value === 'comments')
      {
        userSignatureComments = $('.signature-editor')[0].value;
        toastr.success('Comments signature saved! <br> You cannot use it in comments', "Message from SteemPlus");
        chrome.storage.local.set({
          user_signature_comments:userSignatureComments
        });
      }
      
    });
  });
}

function setupAddPostSignature(textarea)
{
  chrome.storage.local.get(['user_signature_posts'], function(item){
    if(item.user_signature_posts!==undefined&&item.user_signature_posts!=='')
    {
      $(textarea).after('<a class="add-signature-post">Add Posts Signature</a>');
      $('.add-signature-post').on('click', function(){
          $(textarea).val($(textarea).val() + '\n' + (item.user_signature_posts));
          $(textarea)[0].dispatchEvent(new Event('paste'));
          $(textarea)[0].dispatchEvent(new Event('keyup'));
          $(textarea)[0].dispatchEvent(new Event('keydown'));
          console.log($(textarea)[0]);
      });
    }  
    $(textarea).after('<a target="_blank" href="/@' + myUsernameSignature + '/settings" class="edit-signature-post">Edit Posts Signature</a>');
  });
}

function setupAddCommentSignature(textarea)
{
  if($(textarea).parent().find('.edit-signature-comment').length === 0)
  {
    chrome.storage.local.get(['user_signature_comments'], function(item){
      if(item.user_signature_comments!==undefined&&item.user_signature_comments!=='')
      {
        $(textarea).after('<a class="add-signature-comment">Add Comments Signature</a>');
        $('.add-signature-comment').on('click', function(){
            $(textarea).val($(textarea).val() + '\n' + (item.user_signature_comments));
            $(textarea)[0].dispatchEvent(new Event('keyup'));
            $(textarea)[0].dispatchEvent(new Event('keydown'));
        });
      }  
      $(textarea).after('<a target="_blank" href="/@' + myUsernameSignature + '/settings" class="edit-signature-comment">Edit Comments Signature</a>');
    });
  }
}


function updatePreview(textarea){

                var markdown_text = $(textarea).val(),
                    markdown_html = Markdown(markdown_text),
                    preview = $();

                if ($preview.length >0){
                    $preview.html(markdown_html);    
                }
            }



