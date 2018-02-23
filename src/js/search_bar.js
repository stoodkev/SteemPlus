

  var token_search_bar=null;
  var aut=null;

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
        replaceHeaderSearch();

        $('body').on('click', function(e) {
          var t = $(e.target);
          if(t.closest('.smi-search-container').length) {
            return;
          }
          $('.smi-search-container').removeClass('smi-search-open');
        });
        $('.show-for-large').find('form').remove();
        $('.show-for-large').toggleClass('show-for-large');
        $('.hide-for-large').remove();
      }
    }
  });


  function setupIframe(iframeWindow, doc){
    var html = doc.find('html');
    if(html.hasClass('smi-search-iframe-style')){
      return;
    }
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

  var openSearch = _.debounce(_openSearch, 100);


  function createSearchUI() {
    var container = $('<div class="smi-search-container">\
      <div class="smi-input-container">\
        <input type="text" class="smi-input" placeholder="Search...">\
        <div class="smi-search-result-container">\
          <iframe src="/static/search.html"></iframe>\
        </div>\
      </div>\
      <a href="" class="smi-search-button">\
        <span class="Icon search" style="display: inline-block; width: 1.12rem; height: 1.12rem;">\
          <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" xml:space="preserve"><path d="M344.5,298c15-23.6,23.8-51.6,23.8-81.7c0-84.1-68.1-152.3-152.1-152.3C132.1,64,64,132.2,64,216.3 c0,84.1,68.1,152.3,152.1,152.3c30.5,0,58.9-9,82.7-24.4l6.9-4.8L414.3,448l33.7-34.3L339.5,305.1L344.5,298z M301.4,131.2 c22.7,22.7,35.2,52.9,35.2,85c0,32.1-12.5,62.3-35.2,85c-22.7,22.7-52.9,35.2-85,35.2c-32.1,0-62.3-12.5-85-35.2 c-22.7-22.7-35.2-52.9-35.2-85c0-32.1,12.5-62.3,35.2-85c22.7-22.7,52.9-35.2,85-35.2C248.5,96,278.7,108.5,301.4,131.2z"></path></svg>\
        </span>\
      </a>\
    </div>');

    var button = container.find('.smi-search-button');
    var input = container.find('.smi-input');

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
    var searchEl = $('.Header__search'); 
    
    if(!searchEl.length){
      setTimeout(function() {
        replaceHeaderSearch();
      }, 100);
      return;
    }

    if($('html').hasClass('smi-header-search')) {
      return;
    }

    var ui = createSearchUI();

    $('html').addClass('smi-header-search')
    searchEl.append(ui);

    openSearch(ui); //initialize

  };
