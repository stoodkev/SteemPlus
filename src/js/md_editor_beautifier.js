var token_md_editor_beautifier=null;
var markdownSource=null;
var preview=null;
var needRecreate = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to==='md_editor_beautifier'&&request.order==='start'&&token_md_editor_beautifier==null&&window.location.href.includes('submit'))
    {
      token_md_editor_beautifier=request.token;
      needRecreate = $('textarea').textLength === 0;

      setupPreview();
      $('.float-right.secondary').click(function(){
        setupPreview();
      });

      $('textarea').bind('input propertychange', function(event){
        if(needRecreate)
        {
          setupPreview();
          needRecreate = false;
          return;
        }

        if(event.currentTarget.value.length === 0){
          // preview = $('.Preview');
          preview.remove();
          needRecreate = true;
        }
      });
    }
    if(request.to==='md_editor_beautifier'&&request.order==='click'&&window.location.href.includes('submit'))
    {
      token_md_editor_beautifier=request.token;
      needRecreate = $('textarea').textLength === 0;

      setupPreview();
      $('.float-right.secondary').click(function(){
        setupPreview();
      });

      $('textarea').bind('input propertychange', function(event){
        if(needRecreate)
        {
          setupPreview();
          needRecreate = false;
          return;
        }

        if(event.currentTarget.value.length === 0){
          // preview = $('.Preview');
          preview.remove();
          needRecreate = true;
        }
      });
    }
});


function setupPreview(){
  console.log('test');
  if($('.RichTextEditor__root___33zoV').length > 0)
  {
    // Using markdown editor so put editor in the middle
    $('.myrow').addClass('column');
    $('.myrow').addClass('RichTextEditor__root___33zoV');
    $('.column.small-12').removeClass('myrow');
  }
  else
  {
    $('.MarkdownViewer').bind('DOMSubtreeModified', function(event) {
      $('.MarkdownViewer > div')[1].innerHTML = $('.MarkdownViewer > div')[0].outerHTML;
    });

    if($('.Preview').length === 0)
    {
        setTimeout(function(){
          setupPreview();
        }, 200);
        return;
    }

    // Put editor next to preview
    markdownSource=$('.Preview');
    preview = markdownSource.clone();
    markdownSource.hide();

    if($('.myrow').length > 0)
    {
      preview.appendTo($('.myrow'));
    }
    else
    {
      preview.appendTo($('.column'));
      $('.column').removeClass('small-12');
      $('.column').addClass('row');
      $('.column').addClass('myrow');
      $('.column').removeClass('column');

      $('.ReplyEditor').removeClass('row');
    }
  }

  




}

