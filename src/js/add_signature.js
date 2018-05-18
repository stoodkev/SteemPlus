var token_add_signature = null;

var retryCountAddSignature = 0;

var isSteemit = null;
var isBusy = null;
var isUtopian = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.to==='add_signature'&&request.order==='start'&&token_add_signature==null)
  {
    token_add_signature=request.token;
    isSteemit = request.data.steemit;
    isBusy = request.data.busy;
    isUtopian = request.data.utopian;
    retryCountAddSignature = 0;
    startAddSignature();
  }
  else if(request.to==='add_signature'&&request.order==='click'&&token_add_signature==request.token)
  {
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
    console.log(isSteemit);
    // If page is settings pages, start create signature
    if(regexSettingsSteemit.test(window.location.href))
    {
      console.log('settings page');
      if($('.Settings').length > 0)
      {
        console.log('loaded');
        displayCreateSignature();
      }
    }
    // If not create check if it's create post page or post page
    else if(regexPostSteemit.test(window.location.href)||regexCreatePostSteemit.test(window.location.href))
    {
      $('.ReplyEditor__body textarea').each(function() {
        setupAddSignature($(this));
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
  var divSignature = $('<div class="signature-panel">\
    <div class="bootstrap-wrapper">\
      <h4>Create Signature</h4>\
        <div class="container container-signature-md">\
          <div class="row">\
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
            <textarea class="col-6 signature-editor" data-bar=".editor-bar" data-preview=".editor-preview"/>\
            <div class="markdownlive-preview editor-preview col-6 signature-preview"></div>\
            <input id="saveSignature" class="button" value="Save signature" style="margin-top: 1em;">\
          </div>\
        </div>\
    </div>\
  </div>');

  $('.Settings').append(divSignature);

  $('textarea').markdownlive();

  $('#saveSignature').click(function(){
    var userSignature = $('.editor-preview')[0].innerHTML;
    console.log(userSignature);
    chrome.storage.local.set({
      user_signature:userSignature
    });
  })

}

function setupAddSignature()
{

}

