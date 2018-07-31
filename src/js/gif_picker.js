

  var token_gif_picker=null;
  var aut=null;

  var SMI_GIPHY_API_KEY = 'KyibK7KTJAHvimb3XGqNXSNrhnHdwKv9';

  var giphy = {
    key: "?api_key=" + SMI_GIPHY_API_KEY,
    baseUrl: "https://api.giphy.com/v1/gifs",
    search: "/search",
    trending: "/trending",
    random: "/random"
  };

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.to=='gif_picker'){
      aut=request.data.user;
      if(request.order==='start'&&token_gif_picker==null)
      {
        token_gif_picker=request.token;

        startGifPicker();

      }
    }
    else if(request.order==='click'&&token_gif_picker==request.token)
    {
      startGifPicker();
    }
  });

  function startGifPicker()
  {
    if(regexCreatePostSteemit.test(window.location.href)||regexPostSteemit.test(window.location.href))
    {
      $('body').unbind('click').on('click', function(e) {
        var t = $(e.target);
        if(t.closest('.smi-gif-picker-container2').length){
          return;
        }
        if(t.closest('.smi-gif-picker-button-container').length){
          return;
        }
        closeGifPicker($('.ReplyEditor__body textarea')); // close all gif picker
      });

      $('.float-right.secondary').click(function(){
        $('.smi-gif-picker-button-container').remove();
      });

      $('.ReplyEditor__body textarea').each(function() {
        var textarea = $(this);
        setupGifPickerIfNeeded(textarea);
      });

      $('.Comment__footer__controls > a').click(function(){
        $('.ReplyEditor__body textarea').each(function() {
          var textarea = $(this);
          setupGifPickerIfNeeded(textarea);
        });
      });

      $('.PostFull__reply > a').click(function(){
        $('.ReplyEditor__body textarea').each(function() {
          var textarea = $(this);
          setupGifPickerIfNeeded(textarea);
        });
      });


    }
  }


  function addGifToTextArea(textarea, gif) {
    var t = textarea[0];
    var text = '![](' + gif + ')';
    if (document.selection) {
      // IE
      t.focus();
      var sel = document.selection.createRange();
      sel.text = text;
    } else if (t.selectionStart || t.selectionStart === 0) {
      // Others
      var startPos = t.selectionStart;
      var endPos = t.selectionEnd;
      t.value = t.value.substring(0, startPos) +
        text +
        t.value.substring(endPos, t.value.length);
      t.selectionStart = startPos + text.length;
      t.selectionEnd = startPos + text.length;
    } else {
      t.value += text;
    }

    var event = new Event('input', { bubbles: true });
    t.dispatchEvent(event);

    textarea.focus();
  };


  function createGifPicker(textarea) {
    var pickerContainer = $('<div class="smi-gif-picker-container">\
      <div class="smi-gif-picker-container2">\
        <button class="close-button" type="button"><span aria-hidden="true" class="">×</span></button>\
        <div class="gif-form row">\
          <div class="small-8 medium-9 large-10 columns">\
            <label>\
              <p>Search: <a class="button trending">Trending</a></p>\
              <input class="query" type="text" placeholder="Find a Giphy" name="q">\
            </label>\
          </div>\
          <div class="small-4 medium-3 large-2 columns">\
            <label>\
              <p>Rating:</p>\
              <select class="rating" name="rating">\
                <option value="" selected>all</option>\
                <option value="y">y</option>\
                <option value="g">g</option>\
                <option value="pg">pg</option>\
                <option value="pg-13">pg-13</option>\
                <option value="r">r</option>\
              </select>\
            </label>\
          </div>\
        </div>\
        <section class="res-container">\
          <p class="title"></p>\
          <div class="res-container-wrapper">\
            <section class="results justified-gallery"></section>\
          </div>\
        </section>\
      </div>\
    </div>');


    function ajaxQuery(ajax){

      $.ajax({
        type: ajax.method,
        beforeSend: function(xhttp) {
          xhttp.setRequestHeader("Content-type", "application/json");
          xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
        },
        url: ajax.url,
        success: function(data) {
          populateResults(data.data);
        },
        error: function(msg) {
          console.log(err);
        }
      });
    };

    function populateResults(data){
      var resultsEl = pickerContainer.find('.results');
      resultsEl.empty();

      for(var i in data){
        var img = data[i].images.downsized_still;
        var gif = data[i].images.downsized;
        var alt =  data[i].rating.toUpperCase() + ' - ' + data[i].slug.replace('-'+data[i].id,'').replace(/\-/g, ' ');

        // resultsEl.append('<a class="still"><img src="'+img.url+'" alt="'+ alt +'" data-state="still" data-still="'+ img.url +'" data-gif="'+ gif.url +'"></a>');
        resultsEl.append('<a class=""><img src="'+gif.url+'" alt="'+ alt +'"></a>');

      }
      resultsEl.justifiedGallery({
        rowHeight : 150,
        lastRow : 'nojustify',
        margins : 13,
        randomize: true,
        cssAnimation: true
      });
      // toggleGif();

      pickerContainer.find('.results a').click(function(e){
        e.preventDefault();
        e.stopPropagation();

        var that = $(this).children('img');
        var gif = that.attr('src');

        addGifToTextArea(textarea, gif);
        closeGifPicker(textarea);
      });
    };

    // function toggleGif(){
    //   pickerContainer.find('.results a').click(function(e){
    //     e.preventDefault();
    //     e.stopPropagation();

    //     var that = $(this).children('img');
    //     var state = that.attr('data-state');
    //     $(this).toggleClass('still');

    //     if ( state == 'still'){
    //         that.attr('src', that.data('gif'));
    //         that.attr('data-state', 'animate');
    //     }else{
    //         that.attr('src', that.data('still'));
    //         that.attr('data-state', 'still');
    //     }
    //   });
    // };


    var timeout;

    pickerContainer.find('.query').keyup(function(e){
      e.preventDefault();
      if(evt.keyCode != 13){
        if(timeout){
          clearTimeout(timeout);
          timeout = null;
        }

        timeout = setTimeout(function(){
          var params = pickerContainer.find('.gif-form input').serialize();
          if(pickerContainer.find('.rating').val()){
            params += '&' + pickerContainer.find('.rating').serialize();
          }

          var ajax = {
            url: giphy.baseUrl + giphy.search + giphy.key + '&' + params,
            method: "GET"
          };
          pickerContainer.find('.title').html('Results for: <span>'+pickerContainer.find('.query').val()+'</span>');
          ajaxQuery(ajax);
        }, 500);
      }
      else
        e.stopPropagation();
    });

    pickerContainer.find('.trending').click(function(e){
      e.preventDefault();

      if(timeout){
        clearTimeout(timeout);
        timeout = null;
      }

      var selection = "trending";

      var ajax = {
        url: giphy.baseUrl + giphy[selection] + giphy.key,
        method: "GET"
      }

      pickerContainer.find('.title').text(selection);
      ajaxQuery(ajax);
    });

    pickerContainer.find('.close-button').on('click', function() {
      closeGifPicker(textarea);
    });


    return pickerContainer;
  };

  function setupGifPickerIfNeeded(textarea) {

    if(textarea.hasClass('smi-gif-picker-textarea')){
      return;
    }

    textarea.addClass('smi-gif-picker-textarea');
    var pickerButtonContainer = $('<div class="smi-gif-picker-button-container">\
      <div class="button button_gif">GIF</div>\
    </div>');
    if($('.edit-signature-post').length > 0) textarea.parent().find('.edit-signature-post').after(pickerButtonContainer);
    else if($('.edit-signature-comment').length > 0) textarea.parent().find('.edit-signature-comment').after(pickerButtonContainer);
    else textarea.after(pickerButtonContainer);

    var button = pickerButtonContainer.find('.button');
    button.on('click', function() {
      toggleGifPicker(textarea);
    });

    var pickerContainer = createGifPicker(textarea);
    textarea.after(pickerContainer);
  };


  function toggleGifPicker(textarea) {
    if(textarea.parent().hasClass('smi-gif-picker-opened')){
      closeGifPicker(textarea);
    }else{
      openGifPicker(textarea);
    }
  };

  function openGifPicker(textarea) {
    $('.ReplyEditor__body textarea').each(function() {
      var other = $(this);
      if(!other.is(textarea)){
        closeGifPicker(other);
      }
    });
    textarea.parent().addClass('smi-gif-picker-opened');

    var container = textarea.closest('body, #post_overlay');
    var pickerContainer = textarea.parent().find('.smi-gif-picker-container2');
    var s = textarea.offset().top + textarea.height() - container.offset().top + container.scrollTop() + pickerContainer.height() - $(window).height() + 60;

    if(container.is('body')){
      container = $('html, body');
    }
    container.animate({
        scrollTop: s
    }, 400);
  };

  function closeGifPicker(textarea) {
    textarea.parent().removeClass('smi-gif-picker-opened');
  };
