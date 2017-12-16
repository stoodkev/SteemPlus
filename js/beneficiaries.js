/**
 * Created by quent on 10/27/2017.
 */

var website='';
var created_benef=false;
var beneficiaries;
const STEEM_PLUS_FEED=5;

$(document).ready(function(){

  chrome.storage.local.get(['ben'], function (items) {
        if(items.ben==undefined||items.ben=="show")
        {
          if(window.location.href.match('steemit.com')||window.location.href.match('mspsteem.com')) {
              website='steemit';
              if(window.location.href.match(/submit/))
                  addBeneficiariesButton();
              $(document).click(function(){
                  if(window.location.href.match(/submit/)&&!created_benef){addBeneficiariesButton();
                  }
                  if(!window.location.href.match(/submit/)){created_benef=false;
                  }
              });

          }
          else if(window.location.href.match('steemit.com'))
          {
              website='busy';
          }
          }
          });

      });


function addBeneficiariesButton(){

    var benef_div = document.createElement('div');
    benef_div.style.width = '100%';
    benef_div.style.marginBottom = '2em;';
    var benef_button = document.createElement('input');
    benef_button.value = 'Add beneficiaries';
    benef_button.type='button';
    benef_button.className = 'UserWallet__buysp button hollow benef';

    benef_div.appendChild(benef_button);
    $('.vframe__section--shrink')[$('.vframe__section--shrink').length-1].after(benef_div);
    $('.benef').click(function(){

        $('.benef').parent().after('<li class="beneficiaries"><div class="benef_elt"><span class="sign" >@</span><input type="text" placeholder="username"></div><div class="benef_elt" style="width: 15%;"><input style="width: 75%;" type="number" placeholder="10"><span class="sign" >%</span></div><a  class="close"></a> </li>');
        if($('.close').length===1) {
            $('.vframe__section--shrink button').hide();
            if($('.post').length===0) {
                $('.beneficiaries').after('<h5 style="text-align: left;">Posted By</h5><li class="post"><div class="benef_elt"><span class="sign" >@</span><input type="text" placeholder="author"></div><div class="benef_elt" "><input  type="password" placeholder="Private Posting WIF*"></div><div class="inline_button"><input type="button" class="UserWallet__buysp button hollow postbutton" value="Post"/></div> <p>* Your WIF is stored locally for your safety. SteemConnect integration coming soon.</p></li>');
                $('.postbutton').click(function (){if(isEverythingFilled()) postBeneficiaries();});
                chrome.storage.local.get(['username','wif'], function (items) {
                    $('.post input').eq(0).val(items.username);
                    $('.post input').eq(1).val(items.wif);
                });

                }
                else
                 $('h5,.post').show();
        }

        setCloseListener();

    });
    created_benef=true;
}

function setCloseListener(){
    $('.close').each(function(i){
        $(this).off("click");
        $(this).on("click",function() {
            $('.beneficiaries')[i].remove();
            if($('.close').length===0) {
                $('.vframe__section--shrink button').show();
                $('h5,.post').hide();
            }
            setCloseListener();
        });
    });
}



function isEverythingFilled()
{
    beneficiaries=[];
    if($('.vframe__section--shrink button').is(":disabled"))
    {
        alert("Please enter a title, body and tags to your post!");
        return false;
    }

    var total_percent=0;
    var hasEmpty=0;
    var hasWrongPercent=0;
    $('.beneficiaries').each(function(i,e){
        hasEmpty+=$(e).find('input').eq(0).val()===''?1:0;
        hasEmpty+=$(e).find('input').eq(1).val()===''?1:0;
        hasWrongPercent+=($(e).find('input').eq(1).val()<=0||isNaN($(e).find('input').eq(1).val())||$(e).find('input').eq(1).val()>100)?1:0;
        total_percent+=parseInt($(e).find('input').eq(1).val());
        beneficiaries.push({
            account: $(e).find('input').eq(0).val(),
            weight: 100*parseInt($(e).find('input').eq(1).val())
        });
    });

    if(hasEmpty!==0)
    {
        alert("Please enter the name and percentage for each beneficiary!");
        return false;
    }
    if(hasWrongPercent!==0)
    {
        alert("Percentage should be greater than 0 and smaller are equal to 100!");
        return false;
    }
    if(total_percent>95)
    {
        alert("Total beneficiary rewards must be smaller are equal to 95%!");
        return false;
    }
    if($('.post input').eq(0).val()===''||$('.post input').eq(1).val()==='')
    {
        alert("Please enter your username and private posting key!");
        return false;
    }
    return   true;
}

function postBeneficiaries()
{

    var tags=$(' input[tabindex=3]').eq(0).val().split(' ');
    var author=$('.post input').eq(0).val();
    var wif=$('.post input').eq(1).val();
    var title=$('.vframe input').eq(0).val();
    var permlink=$('.vframe input').eq(0).val().toLowerCase()
        .replace(/ /g,'-')
        .replace(/[^\w-]+/g,'');
    var body=$('.vframe textarea').eq(0).val();
    var sbdpercent=$(".vframe select option:selected").index()===0?0:10000;

    console.log($(".vframe select option:selected").index()===0?0:10000);
    console.log(tags);
    beneficiaries.push({
        account: 'steem-plus',
        weight: 100*STEEM_PLUS_FEED
    });

    var operations = [
        ['comment',
            {
                parent_author: '',
                parent_permlink: tags[0],
                author: author,
                permlink: permlink,
                title: title,
                body: body,
                json_metadata : JSON.stringify({
                    tags: tags,
                    app: 'steemplus'
                })
            }
        ],
        ['comment_options', {
            author: author,
            permlink: permlink,
            max_accepted_payout: '100000.000 SBD',
            percent_steem_dollars: sbdpercent,
            allow_votes: true,
            allow_curation_rewards: true,
            extensions: [
                [0, {
                    beneficiaries: beneficiaries
                }]
            ]
        }]
    ];

    steem.broadcast.send(
        { operations: operations, extensions: [] },
        { posting: wif },
        function(e, r) {
            if (e) {
                console.log(e.message);
                if(e.message.includes('must exist.')) alert('Error. One of the beneficiaries doesn\'t exist.');
                else if(e.message.includes('You may only post once')) alert('Error. You can post only every 5 minutes.');
                else {
                    alert('Error. Please check your credentials. If the problem persists, please take a screenshot of the following and ask help on SteemPlus Discord:\n'+e.message);
                    console.log(e.message);
                }


            } else {
                chrome.storage.local.set({
                    username:$('.post input').eq(0).val(),
                    wif:$('.post input').eq(1).val()
                });

                window.location.replace('https://steemit.com');

            }

        });

}
