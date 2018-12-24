/**
 * Created by quent on 10/27/2017.
 */

var created_benef = false;
var beneficiaries;
const STEEM_PLUS_FEED = 5;
var autb = null;
var token_benef = null;
var isSteemit = null;
var isBusy = null;
var isSelectRewardDropdownEnabled = null;
let isPremiumBeneficiaries = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.to == 'ben') {
        autb = request.data.user;
        isSteemit = request.data.steemit;
        isBusy = request.data.busy;

        if (request.order === 'start' && token_benef == null) {
            token_benef = request.token;
            isSelectRewardDropdownEnabled = request.data.select_reward_dropdown_enabled;
            isPremiumBeneficiaries = request.data.isPremium;
            startBeneficiaries();
        }
        if (request.order === 'click' && token_benef == request.token) {
            isSelectRewardDropdownEnabled = request.data.select_reward_dropdown_enabled;
            isPremiumBeneficiaries = request.data.isPremium;
            onClickB();
        }
    }
});

// Function used to check URL
function startBeneficiaries() {
    // Needs to be on post page
    if (regexCreatePostSteemit.test(window.location.href) || regexCreatePostBusy.test(window.location.href))
        addBeneficiariesButton();
}

// Function used to check URL when message onclick is triggered
function onClickB() {
    if ((regexCreatePostSteemit.test(window.location.href) || regexCreatePostBusy.test(window.location.href)) && !created_benef) {
        addBeneficiariesButton();
    }
    if (!(regexCreatePostSteemit.test(window.location.href) && regexCreatePostBusy.test(window.location.href))) {
        created_benef = false;
    }
}


// Function used to create beneficiaries button
function addBeneficiariesButton() {

    // If used website is Steemit
    if (isSteemit) {
        // Create add beneficaries button
        var benef_div = document.createElement('div');
        benef_div.style.width = '100%';
        benef_div.style.marginBottom = '2em;';
        var benef_button = document.createElement('button');
        benef_button.innerHTML = 'Add beneficiaries';
        benef_button.type = 'button';
        benef_button.className = 'button-steemit benef';

        benef_div.appendChild(benef_button);
        $('.vframe__section--shrink')[$('.vframe__section--shrink').length - 1].after(benef_div);

        // On click listener for add beneficiaries
        $('.benef').click(function() {

            // the process will be different if the select reward feature is enabled.

            // If that feature is enabled, hide existing post button
            if (isSelectRewardDropdownEnabled) {
                $('.btn-post-steemit').hide();
            }

            $('.benefDonation').hide();
            // Add new beneficiaries line
            $('.benef').parent().after('<li class="beneficiaries"><div class="benef_elt"><span class="sign" >@</span><input type="text" placeholder="username"></div><div class="benef_elt" style="width: 15%;"><input style="width: 75%;" type="number" placeholder="10"><span class="sign" >%</span></div><a  class="close"></a> </li>');

            // Remove message...
            $('.message-beneficiaries').remove();
            // ... and create a new one
            if(!isPremiumBeneficiaries) $('.benef').parent().after('<p class="message-beneficiaries">By using the beneficiaries feature, you accept that @steem-plus will be set as a 5% beneficiary.</p>');
            else $('.benef').parent().after('<p class="message-beneficiaries">You subscribe to the beneficiaries premium feature. You won\'t be charged 5%.</p>');
            // If one line 'new beneficiaries' exist
            if ($('.close').length === 1) {
                // ... create new post button
                var buttonPost = $('.vframe__section--shrink button')[2];
                $(buttonPost).hide();
                if (isSelectRewardDropdownEnabled) {
                    if ($('.postbutton').length === 0) {
                        $('.clean-button-steemit').before('<button class="postbutton">Post</button>');
                        $('.postbutton').click(function() {
                            if (isEverythingFilled()) postBeneficiaries();
                        });
                    } else {
                        $('.postbutton').show();
                    }
                } else {
                    if ($('.post').length === 0) {
                        $('.beneficiaries').after('<li class="post"><div class="inline_button"><input type="button" class="UserWallet__buysp button postbutton" value="Post"/></div></li>');
                        $('.postbutton').click(function() {
                            if (isEverythingFilled()) postBeneficiaries();
                        });
                    } else {
                        $('h5,.post').show();
                    }
                }
            }

            // if there is no select reward dropdown, create it
            if ($('.benef-steemit-percentage').length === 0) {
                $('.benef').parent().before('<div class="div-benef-steemit-percentage"><label>Reward</label><select class="benef-steemit-percentage ant-form-item-control has-success">\
                          <option name="percentage" value="10000">50% SBD and 50% SP</option>\
                          <option name="percentage" value="0">100% Steem Power</option>\
                          <option name="percentage" value="-1">Decline Payout</option>\
                        </select></div>');
            } else {
                $('.div-benef-steemit-percentage').show();
            }
            setCloseListener();
        });
        created_benef = true;
    }
    // if busy
    else if (isBusy && $('.benef').length === 0) {
        // Create beneficiaries button
        var benef_div = document.createElement('div');
        benef_div.style.width = '100%';
        benef_div.style.marginBottom = '2em;';
        var benef_button = document.createElement('input');
        benef_button.value = 'Add beneficiaries';
        benef_button.type = 'button';
        benef_button.className = 'Action benef Action--primary benef-busy';

        // add beneficiaries 'add' button
        benef_div.appendChild(benef_button);
        $('.Editor__bottom').after(benef_div);
        // On click on add button
        $('.benef').click(function() {

            $('.benefDonation-busy').hide();
            // If select reward dropdown not existing...
            if ($('.benef-busy-percentage').length === 0) {
                $('.ant-form-item-control').each(function() {
                    if ($(this).children().find('.ant-select-selection-selected-value').length > 0) {
                        // ... create it
                        $(this).after('<select class="benef-busy-percentage ant-form-item-control has-success">\
                              <option name="percentage" value="10000">50% SBD and 50% SP</option>\
                              <option name="percentage" value="0">100% Steem Power</option>\
                              <option name="percentage" value="-1">Decline Payout</option>\
                            </select>');
                        $(this).hide();
                    }

                });
            }

            $('.benef').parent().after('<li class="beneficiaries"><div class="benef_elt benef_elt_busy"><span class="sign" >@</span><input type="text" placeholder="username"></div><div class="benef_elt benef_elt_busy" style="width: 15%;"><input style="width: 75%;" type="number" placeholder="10"><span class="sign" >%</span></div><a  class="close"></a> </li>');

            $('.message-beneficiaries').remove()
            if(!isPremiumBeneficiaries) $('.benef').parent().after('<p class="message-beneficiaries">By using the beneficiaries feature, you accept that @steem-plus will be set as a 5% beneficiary.</p>');
            else $('.benef').parent().after('<p class="message-beneficiaries">You subscribe to the beneficiaries premium feature. You won\'t be charged 5%.</p>');

            if ($('.close').length === 1) {
                var buttonPost = $('.Editor__bottom__submit')[0];
                $(buttonPost).hide();
                if ($('.post').length === 0) {
                    $('.beneficiaries').after('<li class="post"><div><input type="button" class="Action postbutton-busy Action--primary" value="Post"/></div></li>');
                    $('.postbutton-busy').click(function() {
                        if (isEverythingFilled()) postBeneficiaries();
                    });
                } else
                    $('h5,.post').show();
            }
            setCloseListener();
        });
        created_benef = true;
    }

}

// Set listener on every close button
// Close button are used to delete a benefactor line
function setCloseListener() {
    $('.close').each(function(i) {
        $(this).off("click");
        $(this).on("click", function() {
            // Remove the line
            $('.beneficiaries')[i].remove();
            // If user delete the last line
            if ($('.close').length === 0) {
                // if is steemit
                if (isSteemit) {
                    // show all buttons (other post button)
                    $('.vframe__section--shrink button').show();
                    if (isSelectRewardDropdownEnabled)
                        $('.postbutton').hide();
                    else {
                        $('h5,.post').hide();
                        $('.div-benef-steemit-percentage').hide();
                    }
                    $('.benefDonation').show();
                    // remove beneficiaries message
                    $('.message-beneficiaries').remove();
                } else if (isBusy) {
                    // if is busy
                    // display initial elements and hide or remove beneficiaries elements
                    $('.Editor__bottom__submit').show();
                    $('.benefDonation-busy').show();
                    $('h5,.post').hide();
                    $('.message-beneficiaries').remove();
                    $('.ant-form-item-control').each(function() {
                        if ($(this).children().find('.ant-select-selection-selected-value').length > 0)
                            $(this).show();
                        $('.benef-busy-percentage').remove();
                    });
                }
            }
            setCloseListener();
        });
    });
}


// Function used to verify that the for form is complete
function isEverythingFilled() {
    var total_percent = 0;
    var hasEmpty = 0;
    var hasWrongPercent = 0;
    beneficiaries = [];

    if (isSteemit) {
        if ($('.vframe__section--shrink button').is(":disabled")) {
            alert("Please enter a title, body and tags to your post!");
            return false;
        }
    } else if (isBusy) {
        console.log($('.Editor__title').eq(0).val() === '', $('.ant-select-selection__choice__content').length === 0, $('textarea#body').eq(0).innerHTML === '')
        if ($('.Editor__title').eq(0).val() === '' || $('.ant-select-selection__choice__content').length === 0 || $('textarea#body').eq(0).innerHTML === '') {
            alert("Please enter a title, body and tags to your post!");
            return false;
        }
    }

    $('.beneficiaries').each(function(i, e) {
        hasEmpty += $(e).find('input').eq(0).val() === '' ? 1 : 0;
        hasEmpty += $(e).find('input').eq(1).val() === '' ? 1 : 0;
        hasWrongPercent += ($(e).find('input').eq(1).val() <= 0 || isNaN($(e).find('input').eq(1).val()) || $(e).find('input').eq(1).val() > 100) ? 1 : 0;
        total_percent += parseInt($(e).find('input').eq(1).val());
        beneficiaries.push({
            account: $(e).find('input').eq(0).val(),
            weight: 100 * parseInt($(e).find('input').eq(1).val())
        });
    });

    if (hasEmpty !== 0) {
        alert("Please enter the name and percentage for each beneficiary!");
        return false;
    }
    if (hasWrongPercent !== 0) {
        alert("Percentage should be greater than 0 and smaller or equal to 100! (Including 5% SteemPlus fee)");
        return false;
    }
    if (total_percent > 95) {
        alert("Total beneficiary rewards must be smaller or equal to 95%!");
        return false;
    }
    return true;
}

// Function used to submit the new post
async function postBeneficiaries() {
    var author = autb;
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
        sbd_percent = $('.benef-steemit-percentage').eq(0).val();
    } else if (isBusy) {
        $('.ant-select-selection__choice').each(function() {
            tags.push($(this).attr('title'));
        });
        title = $('.Editor__title').eq(0).val();
        permlink = title.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');
        body = $('textarea.ant-input').eq(0).val();
        sbd_percent = $('.benef-busy-percentage').eq(0).val();
    }

    if (isPremiumBeneficiaries)
        console.log('no fee');
    else
        beneficiaries.push({
            account: 'steemplus-pay',
            weight: 100 * STEEM_PLUS_FEED
        });
    if (beneficiaries.length > 6) {
        alert("You have set up too many beneficiaries (max number=5, 6 for premium users)");
    }

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
                    beneficiaries: beneficiaries
                }]
            ]
        }]
    ];

    api.broadcast(
        operations,
        function(e, r) {
            if (e) {
                console.log(e);
                if (e.error !== undefined) {
                    // If there is an error, we check usernames to make sure all of them are correct
                    var usernamesBenef = [];
                    beneficiaries.forEach(function(item) {
                        usernamesBenef.push(item.account);
                    });

                    // Trying to retrieve account with given usernames
                    steem.api.getAccounts(usernamesBenef, function(err, result) {
                        var errorUsernames = [];
                        usernamesBenef.forEach(function(item) {
                            // Account not in result are not correct.
                            if (result.find(function(e) {
                                    return e.name === item
                                }) === undefined)
                                errorUsernames.push(item);
                        });
                        // Display an error message for those accounts
                        if (errorUsernames.length > 0) alert('The following usernames are not correct : ' + errorUsernames.join(', '));
                        // If all the accounts name are correct then display error message. Problem might come from steemConnect.
                        else
                            alert('The request was not succesfull. Please make sure that you logged in to SteemPlus via SteemConnect, that all the beneficiaries accounts are correct and than you didn\'t post within the last 5 minutes. If the problem persists please contact @stoodkev on Discord. Error description:' + e.error_description);
                    });
                }
            } else {
                if (isSteemit)
                    window.location.replace('https://steemit.com');
                if (isBusy)
                    window.location.replace('https://busy.org');
            }
        });
}
