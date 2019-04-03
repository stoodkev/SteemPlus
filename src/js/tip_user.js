var token_tip_user = null;
var retryUserTip = 0;
var myUsernameTip = null;

var isSteemit = null;
var isBusy = null;

// Listener for messages coming from main.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if (request.to === 'tip_user' && request.order === 'start' && token_tip_user == null) {
        retryUserTip = 0;
        token_tip_user = request.token;
        myUsernameTip = request.data.user;
        isSteemit = request.data.steemit;
        isBusy = request.data.busy;
        startTipUser();
    } else if (request.to === 'tip_user' && request.order === 'click' && token_tip_user === request.token) {
        retryUserTip = 0;
        myUsernameTip = request.data.user;
        isSteemit = request.data.steemit;
        isBusy = request.data.busy;
        startTipUser();
    }
});

// Function used to check url and start feature
// No parameters
function startTipUser() {
    if (isSteemit) {
        // Check url of the page. Need to be on a post to start the function
        if (regexPostSteemit.test(window.location.href) && retryUserTip < 20) {
            if ($('.ptc').length === 0) {
                // Looking for the right html element. If can't find it retry later. Maximum 20 seconds
                retryUserTip++;
                setTimeout(startTipUser, 1000);
            } else {
                // Start feature
                $('.ptc').click(function(e) {
                    createTipButton($(this), $(this).eq(0).prop('href').split('/@')[1]);
                });
            }
        }
    } else if (isBusy) {
        // Check url of the page. Need to be on a post to start the function
        if (regexPostBusy.test(window.location.href) && !window.location.href.includes('/transfers') && retryUserTip < 20) {
            if ($('.StoryFull__header__text__date').length === 0) {
                // Looking for the right html element. If can't find it retry later. Maximum 20 seconds
                retryUserTip++;
                setTimeout(startTipUser, 1000);
            } else {
                // Start feature
                var userAuthorPopupInfoTip = $('.StoryFull__header__text__date ').parent().find('span.username')[0].innerHTML;
                createTipButton($('.StoryFull__header__text__date '), userAuthorPopupInfoTip);

                $('.Comment__date').each(function() {
                    var userAuthorPopupInfoTip = $(this).parent().find('span.username')[0].innerHTML;
                    createTipButton($(this), userAuthorPopupInfoTip);
                });

                // When comment section appears add icon
                $('.Comments').on('DOMNodeInserted', function(evt) {
                    var target = $(evt.target);
                    // Only if the new node is a comment

                    if (target.hasClass('Comment')) {
                        target.find('.Comment__date').each(function() {
                            var userAuthorPopupInfoTip = $(this).parent().find('span.username')[0].innerHTML;
                            createTipButton($(this), userAuthorPopupInfoTip);
                        });
                    }
                });
            }
        }
    }

}


// Function used to create the tip button
function createTipButton(element, username) {
    if (username === myUsernameTip) return;
    // Create div
    var tipDiv = $('<div class="input-group div-hidden div-tip" style="margin-bottom: 5px;" id="' + username + '">\
      <input type="button" value="0.5$" name="0.5" class="btn btn-primary btn-sm tip-button">\
      <input type="button" value="1$" name="1" class="btn btn-primary btn-sm tip-button">\
      <input type="button" value="2$" name="2" class="btn btn-primary btn-sm tip-button">\
      <input type="button" value="5$" name="5" class="btn btn-primary btn-sm tip-button">\
      <input type="button" value="10$" name="10" class="btn btn-primary btn-sm tip-button">\
      <input class="input-value-tip ' + (isBusy ? 'input-busy' : '') + '" id="value-tip" type="text" placeholder="..." name="tip" value="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" autofocus="">\
      <input type="button" value="$" name="other" class="btn btn-primary btn-sm tip-button">\
    </div>');
    if (isSteemit) {
        $('.Author__bio').before(tipDiv);
        $(tipDiv).hide();
        $('label.button.slim.hollow.secondary').parent().append('<label id="hide-show-tip-btn" class="button slim hollow secondary " title="Send a tip">Tip</label>');

        // Click listener on tip button
        $('#hide-show-tip-btn').click(function() {
            if ($(tipDiv).hasClass('div-hidden')) {
                $(tipDiv).addClass('div-shown');
                $(tipDiv).removeClass('div-hidden');
                $(tipDiv).show('slow');
            } else {
                $(tipDiv).addClass('div-hidden');
                $(tipDiv).removeClass('div-shown');
                $(tipDiv).hide('slow');
            }
        });
    } else if (isBusy)
    {
        if (element.hasClass('Comment__date')) {
            $(element).after(tipDiv);
        } else
            $(element).parent().parent().after(tipDiv);

        $(tipDiv).hide();
        if ($(element).parent().find("#hide-show-tip-btn").length == 0)
            $(element).before('<label id="hide-show-tip-btn" class="Topic tip-btn-busy" title="Send a tip">Tip</label>');
        // Click listener on tip button
        $('.tip-btn-busy').unbind('click').click(function() {
            if ($(this).parent().hasClass('StoryFull__header__text')) {
                if ($(this).parent().parent().parent().find('.div-tip').hasClass('div-hidden')) {
                    $(this).parent().parent().parent().find('.div-tip').eq(0).addClass('div-shown');
                    $(this).parent().parent().parent().find('.div-tip').eq(0).removeClass('div-hidden');
                    $(this).parent().parent().parent().find('.div-tip').eq(0).show('slow');
                } else {
                    $(this).parent().parent().parent().find('.div-tip').eq(0).addClass('div-hidden');
                    $(this).parent().parent().parent().find('.div-tip').eq(0).removeClass('div-shown');
                    $(this).parent().parent().parent().find('.div-tip').eq(0).hide('slow');
                }
            } else {
                if ($(this).parent().find('.div-tip').eq(0).hasClass('div-hidden')) {
                    $(this).parent().find('.div-tip').eq(0).addClass('div-shown');
                    $(this).parent().find('.div-tip').eq(0).removeClass('div-hidden');
                    $(this).parent().find('.div-tip').eq(0).show('slow');
                } else {
                    $(this).parent().find('.div-tip').eq(0).addClass('div-hidden');
                    $(this).parent().find('.div-tip').eq(0).removeClass('div-shown');
                    $(this).parent().find('.div-tip').eq(0).hide('slow');
                }
            }
        });
    }


    // Listener on tip buttons
    $('.tip-button').unbind('click').click(function() {
        sendTip($(this), $(this).parent().attr('id'));
    });
}

function sendTip(element, username) {
    var amountTip = 0;
    if (element.attr('name') === 'other') {
        if (element.parent().find('.input-value-tip')[0].value === '') {
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
        } else
            amountTip = element.parent().find('.input-value-tip')[0].value;
    } else
        amountTip = element.attr('name');


    var memoTip = 'Tip sent from ' + myUsernameTip + ' to ' + username + ' using steem-plus tipping system! (https://steemit.com/@steem-plus)';
    if(!connect.connect||connect.method=="sc2"){ //Use SteemConnect
      var urlTip = 'https://v2.steemconnect.com/sign/transfer?from=' + myUsernameTip + '&to=' + username + '&amount=' + amountTip + '%20SBD&memo=' + memoTip;
      var win = window.open(urlTip, '_blank');
      if (win) {
          //Browser has allowed it to be opened
          win.focus();
      } else {
          //Browser has blocked it
          alert('Please allow popups for this website');
      }
    }else{ // Implement keychain transfer
      steem_keychain.requestTransfer(connect.user,username,parseFloat(amountTip.split(" ")[0]).toFixed(3),memoTip,"SBD",function(result){
        if(result.success)
          alert("Tip sent succesfully");
      });
    }
}
