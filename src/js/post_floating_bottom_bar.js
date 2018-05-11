

var token_post_floating_bottom_bar=null;
var style='large';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to==='post_floating_bottom_bar'&&request.order==='start'&&token_post_floating_bottom_bar==null)
    {
      token_post_floating_bottom_bar=request.token;
      $(window).on('resize', function() {
        update();
      });

      $(document).on('scroll', function() {
        update();
      });

      makePostBottomBarFloating();
    }

    if(request.to==='post_floating_bottom_bar'&&request.order==='click'&&token_post_floating_bottom_bar==request.token)
    {
      makePostBottomBarFloating();
    }


});


  function makePostBottomBarFloating() {

    if(regexPostSteemit.test(window.location.href))
    {
      var tags = $('.TagList__horizontal');
      var postFooter = $('.PostFull__footer');
      var promoteButton = $('.Promote__button');
      var boostButton = $('.smi-boost-button');

      if(tags.length && postFooter.length && promoteButton.length && boostButton.length) {

        if(tags.closest('.smi-post-footer-wrapper-2').length){
          return;
        }

        $('#post_overlay').on('scroll', function() {
          update();
        });

        var footer = $('<div class="smi-post-footer">\
          <div class="smi-post-footer-wrapper-1">\
            <div class="smi-post-footer-wrapper-2">\
            </div>\
          </div>\
        </div>');
        var footerWrapper = footer.find('.smi-post-footer-wrapper-2');

        tags.replaceWith(footer);
        footerWrapper.append(boostButton);
        footerWrapper.append(promoteButton);
        footerWrapper.append(tags);
        footerWrapper.append(postFooter);

        if(style === 'small'){
          footerWrapper.addClass('smi-post-footer-small');
        }

        update();

      }
      else
      {
        setTimeout(function(){
          makePostBottomBarFloating();
        },1000);
      }
    }
  };

  function update() {
    var footer = $('.smi-post-footer');
    var footerWrapper = $('.smi-post-footer-wrapper-2');
    if(footer.length && footerWrapper.length) {
      var h = footerWrapper.height();
      var py = footer.position().top + h;
      var oy = footer.offset().top + h;
      var by = $(document).scrollTop() + $(window).height();
      var isOverlay = $('#post_overlay').length > 0;

      footer.css('height', h + 'px');

      if(oy > by) {
        if(!footer.hasClass('smi-post-floating-footer')){
          footer.addClass('smi-post-floating-footer');
          if(isOverlay) {
            footerWrapper.addClass('smi-post-floating-footer-on-body').addClass('row');
            $('body').prepend(footerWrapper);
          }
        }
        if(isOverlay) {
          var ol = footer.offset().left;
          footerWrapper.css('left', ol + 'px');
        }
      }else{
        if(footer.hasClass('smi-post-floating-footer')){
          footer.removeClass('smi-post-floating-footer');
          if(isOverlay) {
            footerWrapper.removeClass('smi-post-floating-footer-on-body').removeClass('row');
            footer.find('.smi-post-footer-wrapper-1').prepend(footerWrapper);
          }
          if(isOverlay) {
            footerWrapper.css('left', 'auto');
          }
        }
      }
    }
  };
