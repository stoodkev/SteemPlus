

var token_tip_user=null;
var retryUserTip=0;
var myUsernameTip=null;

// Listener for messages coming from main.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if(request.to==='tip_user'&&request.order==='start'&&token_tip_user==null)
    {
      retryUserTip = 0;
      token_tip_user=request.token;
      myUsernameTip=request.data.user;
      startTipUser();
    }
    else if(request.to==='tip_user'&&request.order==='click'&&token_tip_user===request.token){
      retryUserTip = 0;
      myUsernameTip=request.data.user;
      startTipUser();
    }
});

// Function used to check url and start feature
// No parameters
function startTipUser()
{
  // Check url of the page. Need to be on a post to start the function
  if(regexPostSteemit.test(window.location.href)&&retryUserTip<20)
  {
    if($('.ptc').length===0)
    {
      // Looking for the right html element. If can't find it retry later. Maximum 20 seconds
      retryUserTip++;
      setTimeout(startTipUser, 1000);
    }
    else
    {
      // Start feature
      $('.ptc').click(function(){
        var userAuthorPopupInfoTip = $(this)[0].pathname.replace('/@', '');
        
        // Create div 
        var tipDiv = $('<div class="input-group div-hidden div-tip" style="margin-bottom: 5px;">\
            <input type="button" value="0.5$" name="0.5" class="btn btn-primary btn-sm tip-button">\
            <input type="button" value="1$" name="1" class="btn btn-primary btn-sm tip-button">\
            <input type="button" value="2$" name="2" class="btn btn-primary btn-sm tip-button">\
            <input type="button" value="5$" name="5" class="btn btn-primary btn-sm tip-button">\
            <input type="button" value="10$" name="10" class="btn btn-primary btn-sm tip-button">\
            <input type="button" value="20$" name="20" class="btn btn-primary btn-sm tip-button">\
            <input class="input-value-tip" id="value-tip" type="text" placeholder="..." name="tip" value="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" autofocus="">\
            <input type="button" value="$" name="other" class="btn btn-primary btn-sm tip-button">\
          </div>');

        $('.Author__bio').before(tipDiv);
        $(tipDiv).hide();
        $('label.button.slim.hollow.secondary').parent().append('<label id="hide-show-tip-btn" class="button slim hollow secondary" title="Send a tip">Tip</label>')
        
        // Click listener on tip button
        $('#hide-show-tip-btn').click(function(){
          if($(tipDiv).hasClass('div-hidden'))
          {
            $(tipDiv).addClass('div-shown');
            $(tipDiv).removeClass('div-hidden');
            $(tipDiv).show('slow');
          }
          else
          {
            $(tipDiv).addClass('div-hidden');
            $(tipDiv).removeClass('div-shown');
            $(tipDiv).hide('slow');
          }
        });
        
        // Listener on tip buttons
        $('.tip-button').click(function(){
          console.log($(this));
          var amountTip=0;
          if($(this).attr('name')==='other')
          {
            if($('.input-value-tip')[0].value==='')
            {
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
              toastr.error('You need to add a value!', "Message from SteemPlus");
              return;
            }
            else
              amountTip = $('.input-value-tip')[0].value;
          }
          else
            amountTip = $(this).attr('name');


          var memoTip = 'Tip sent from ' + myUsernameTip + ' to ' + userAuthorPopupInfoTip + ' using <a target="_blank" href="https://steemit.com/@steem-plus">@steem-plus</a> tipping system!';
          var urlTip = 'https://v2.steemconnect.com/sign/transfer?from='+myUsernameTip+'&to='+userAuthorPopupInfoTip+'&amount='+amountTip+'%20SBD&memo='+ memoTip;
          var win = window.open(urlTip, '_blank');
          if (win) {
              //Browser has allowed it to be opened
              win.focus();
          } else {
              //Browser has blocked it
              alert('Please allow popups for this website');
          }          
        });
        
      });
    }
  }

}