/**
 * Created by quent on 10/27/2017.
 */

var created_benef_d = false;
var beneficiaries_d = [];
var autbd = null;
var token_benef_d = null;
var isSteemit = null;
var isBusy = null;
var isSelectRewardDropdownEnabled_d = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.to == 'ben_d') {
        autbd = request.data.user;
        isSteemit = request.data.steemit;
        isBusy = request.data.busy;

        if (request.order === 'start' && token_benef_d == null) {
            token_benef_d = request.token;
            isSelectRewardDropdownEnabled_d = request.data.select_reward_dropdown_enabled;
            startBeneficiaryDonation();
        }
        if (request.order === 'click' && token_benef_d == request.token) {
            isSelectRewardDropdownEnabled = request.data.select_reward_dropdown_enabled;
            onClickBd();
        }
    }
});

// Function used to check URL
function startBeneficiaryDonation() {
    // Needs to be on post page
    if (regexCreatePostSteemit.test(window.location.href) || regexCreatePostBusy.test(window.location.href))
        addBenefDonationButton();
}

// Function used to check URL when message onclick is triggered
function onClickBd() {
    if ((regexCreatePostSteemit.test(window.location.href) || regexCreatePostBusy.test(window.location.href)) && !created_benef_d) {
        addBenefDonationButton();
    }
    if (!(regexCreatePostSteemit.test(window.location.href) && regexCreatePostBusy.test(window.location.href))) {
        created_benef_d = false;
    }
}

function addBenefDonationButton() {
    // If used website is Steemit
    if (isSteemit) {
        // Create donation button
        var benef_div_d = document.createElement('div');
        benef_div_d.style.marginBottom = '2em;';
        benef_div_d.id = 'benefDonation-div';
        var benef_button_d = document.createElement('button');
        benef_button_d.innerHTML = 'Post & Support';
        benef_button_d.type = 'button';
        benef_button_d.title = 'Post and support SteemPlus with a 5% beneficiary reward';
        benef_button_d.className = 'button-steemit benefDonation';

        benef_div_d.appendChild(benef_button_d);
        if ($('.post-clear-div').length != 0)
            $('.clean-button-steemit').before(benef_div_d);
        else {
            $('.vframe__section--shrink')[$('.vframe__section--shrink').length - 1].before(benef_div_d);
            $('#benefDonation-div').css('margin-left', '0');
            $('#benefDonation-div').css('margin-bottom', '1em');
        }

        // On click listener for add beneficiaries
        $('.benefDonation').click(function() {
            postBeneficiaryDonation()
        });
    }
    // if busy
    else if (isBusy && $('.benefDonation').length === 0) {
        // Create beneficiaries button
        var benef_div_d = document.createElement('div');
        benef_div_d.id = 'busy_div_benefd';
        benef_div_d.style.marginBottom = '2em;';
        var benef_button_d = document.createElement('input');
        benef_button_d.value = 'Post & Support';
        benef_button_d.type = 'button';
        benef_button_d.title = 'Post and support SteemPlus with a 5% beneficiary reward';
        benef_button_d.className = 'Action benefDonation Action--primary benefDonation-busy';

        // add beneficiaries 'add' button
        benef_div_d.appendChild(benef_button_d);
        $('.Editor__bottom').after(benef_div_d);
        // On click on add button
        $('.benefDonation').click(function() {
            postBeneficiaryDonation();
        });
    }
    created_benef_d = true;
}

// Function used to submit the new post
async function postBeneficiaryDonation() {
    var author = autbd;
    var tags = [];
    var title = null;
    var permlink = null;
    var body = null;
    var sbd_percent = null;

    // Get all attributes for a post (title, permlink, tags...)
    if (isSteemit) {
        tags = $(' input[tabindex=3]').eq(0).val().split(' ');
        title = $('.vframe input').eq(0).val();
        permlink = await window.SteemPlus.Utils.createPermlink(author,title);
        body = $('.vframe textarea').eq(0).val();
        sbd_percent = isSelectRewardDropdownEnabled_d ? $('.benef-steemit-percentage').eq(0).val() : 10000;
    } else if (isBusy) {
        $('.ant-select-selection__choice').each(function() {
            tags.push($(this).attr('title'));
        });
        title = $('.Editor__title').eq(0).val();
        permlink = await window.SteemPlus.Utils.createPermlink(author,title);
        body = $('textarea.ant-input').eq(0).val();
        sbd_percent = (($(".ant-select-selection-selected-value span").html().includes('50')) ? 10000 : 0);
    }
    beneficiaries_d=[];
    beneficiaries_d.push({
        account: 'steemplus-pay',
        weight: 100 * 5
    });

    var maximumAcceptedPayout = '100000.000 SBD';
    if (parseInt(sbd_percent) === -1) {
        maximumAcceptedPayout = '0.000 SBD';
        sbd_percent = 10000;
    }

    var operations = [
        ['comment',
            {
                parent_author: '',
                parent_permlink: tags[0],
                author: author,
                permlink: permlink,
                title: title,
                body: body,
                json_metadata: JSON.stringify({
                    tags: tags,
                    app: 'steem-plus-app'
                })
            }
        ],
        ['comment_options', {
            author: author,
            permlink: permlink,
            max_accepted_payout: maximumAcceptedPayout,
            percent_steem_dollars: parseInt(sbd_percent),
            allow_votes: true,
            allow_curation_rewards: true,
            extensions: [
                [0, {
                    beneficiaries: beneficiaries_d
                }]
            ]
        }]
    ];

    console.log(operations);
    if(connect.method=="sc2"){
      api.broadcast(
          operations,
          function(e, r) {
              if (e) {
                  console.log(e);
                  if (e.error !== undefined) {
                      console.log(e,e.error,e.message,e.error_description);
                      alert('The request was not succesfull. Please make sure that you logged in to SteemPlus via SteemConnect, that all the beneficiaries accounts are correct and than you didn\'t post within the last 5 minutes. If the problem persists please contact @stoodkev on Discord. Error description:' + e.error_description);

                  }
              } else {
                  if (isSteemit)
                      window.location.replace('https://steemit.com');
                  if (isBusy)
                      window.location.replace('https://busy.org');
              }
          });
        }
        else{
          steem_keychain.requestBroadcast(connect.user, operations, "Posting", function(result){
      			console.log(result);
            if(result.success) {
                if (isSteemit)
                    window.location.replace('https://steemit.com');
                if (isBusy)
                    window.location.replace('https://busy.org');
            }  else
                  alert('The request was not succesfull. Please make sure that you logged in to SteemPlus via an account having Posting authority on Keychain, that all the beneficiaries accounts are correct and than you didn\'t post within the last 5 minutes. If the problem persists please contact @stoodkev on Discord.'+result.error.message);
      		});
        }
}
