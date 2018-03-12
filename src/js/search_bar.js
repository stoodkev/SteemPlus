
  var token_search_bar=null;
  var aut=null;
  var svg=null;

  var iframeStyle = `
    body, html { height: 100vh; overflow-y: auto; -webkit-overflow-scrolling: touch; }
    .top-bar.header { display:none; }
    div.search-content { margin-top: -25px; }
    form.gsc-search-box { display:none; }
    .gsc-control-cse.gsc-control-cse-en { padding: 0px; }
    .gsc-adBlock { display: none; }
    table.gsc-above-wrapper-area-container { margin-bottom: 0px; }
    .gsc-option-menu { top: 0px !important; }
  `;

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to=='search_bar'){
      aut=request.data.user;
      if(request.order==='start'&&token_search_bar==null)
      {
        token_search_bar=request.token;
        svg=$('.search-input__icon');
        replaceHeaderSearch();

        $('body').on('click', function(e) {
          var t = $(e.target);
          if(t.closest('.smi-search-container').length) {
            return;
          }
          $('.smi-search-container').removeClass('smi-search-open');
        });

        $('.Header__search--desktop').children()[0].remove();
        $('.Header__search').remove();
      }
    }
  });

  var openSearch=_.debounce(_openSearch, 100);

  function setupIframe(iframeWindow, doc){
    var html = doc.find('html');
    // if(html.hasClass('smi-search-iframe-style')){
    //   return;
    // }
    html.addClass('smi-search-iframe-style');

    html.append('<style>' + iframeStyle + '</style>');

    html.on('click', 'a', function(e) {
      var a = $(e.currentTarget);
      if(a.parent().is('.gs-spelling')){
        return;
      }
      e.preventDefault();
      var ctorig = a.data('ctorig');
      var url = a.attr('href');
      if(ctorig && ctorig.startsWith('https://steemit.com/')) {
        window.SteemPlus.Utils.navigate(ctorig);
      }else{
        var openWindow = window.open();
        openWindow.opener = null;
        openWindow.location = url;
      }
    });

  };


  function _openSearch(container, search) {
    var iframe = container.find('.smi-search-result-container iframe');
    var iframeWindow = iframe[0] && iframe[0].contentWindow;
    var iframeDoc = iframeWindow && iframeWindow.document;
    if(iframeDoc){
      if(iframeDoc.readyState == 'complete') {

        var doc = $(iframeDoc);
        setupIframe(iframeWindow, doc);

        if(search){
          var input = doc.find('input.gsc-input');
          var submit = doc.find('.gsc-search-button input'); 
          if(input.length && submit.length){
            input.val(search);
            submit.click();
          }
        }

      }else{
        $( iframeDoc ).ready(function() {

          var doc = $(iframeDoc);
          setupIframe(iframeWindow, doc);

        });
      }
    }
  };



  function createSearchUI() {
    var container = $('<div class="smi-search-container">\
      <div class="smi-input-container">\
        <input type="text" class="smi-input" placeholder="Search...">\
        <div class="smi-search-result-container">\
          <iframe src="/static/search.html"></iframe>\
        </div>\
      </div>\
      <a href="" class="smi-search-button">\
      </a>\
    </div>');

    var button = container.find('.smi-search-button');
    var input = container.find('.smi-input');

    svg.appendTo(button);

    button.on('click', function(e){
      e.preventDefault();
      container.toggleClass('smi-search-open');
      if(container.hasClass('smi-search-open')){
        input.focus();
      }
    });

    input.on('input', function() {
      openSearch(container, input.val());
    });

        // prevent page scroll if mouse is no top of the list
    if(!$('html').hasClass('smi-mobile')){
      var s = { insideIframe: false };

      container.find('iframe').mouseenter(function() {
          s.insideIframe = true;
          s.scrollX = window.scrollX;
          s.scrollY = window.scrollY;
      }).mouseleave(function() {
          s.insideIframe = false;
      });

      $(document).scroll(function() {
        if (s.insideIframe){
          window.scrollTo(s.scrollX, s.scrollY);
        }
      });
    }

    return container;
  };

  function replaceHeaderSearch() {
    var searchEl = $('.Header__search--desktop'); 
    if(!searchEl.length){
      setTimeout(function() {
        replaceHeaderSearch();
      }, 100);
      return;
    }

    if($('html').hasClass('smi-header-search')) {
      console.log('here');
      return;
    }

    var ui = createSearchUI();

    $('html').addClass('smi-header-search')
    searchEl.append(ui);

    openSearch(ui); //initialize

  };
