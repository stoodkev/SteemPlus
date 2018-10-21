let tokenSmBatch=null;
let batchIsStarted=false;
let batch=[];
let total_sm=null;
let hasSKC=false;
let userSM = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.to === 'sm_batch' && request.order === 'start' && tokenSmBatch == null) {
		tokenSmBatch = request.token;
		waitForMarketPurchase();
		findPurchaseMethod();

  }
});

function waitForMarketPurchase(){
  console.log("start");
   $(document).click(function(){
     setTimeout(function(){
     if(!batchIsStarted&&$("#menu_item_market").hasClass("active")&&$("#card_details_dialog").eq(0).css("display")=="block")
        startBatchPurchase();
     else if($("#card_details_dialog").eq(0).css("display")!="block"&&batchIsStarted)
        batchIsStarted=false;
      },500);
   });
}

function startBatchPurchase(){
  batch=[];
  batchIsStarted=true;
    console.log("Starting Batch Purchase");
    for(const detail of $(".card-detail-container")){
      const check = document.createElement("input");    // Create with DOM
      check.type = "checkbox";
      check.className="batchItem";
      check.style.float="left";
      check.style.width="7%";
      $(detail).find('.card-detail-info').eq(0).prepend(check);
      $(detail).find('.card-detail-info').eq(0).find("div")[3].style.width="24%";
    }
    const batchButton = document.createElement("button");
    batchButton.className="btn btn-default payment-btn";
    batchButton.disabled="disabled";
    batchButton.id="batch_buy";
    batchButton.innerHTML="Batch Buy (0)";
    $("#buttons").append(batchButton);
    $("#buttons").append($("<span id='total'></span>"));

    $(".batchItem").change(function(){
      const parent = $(this).parent().parent();
      if ($(this).is(':checked')){
        batch.push({market_id:$(parent).attr("market_id"),price:$(parent).attr("price"),uid:$(parent).attr("uid")});
      }
      else{
        batch = batch.filter(function(item)
        {
            return item.uid!=$(parent).attr("uid");
        });
      }
      total_sm=window.SteemPlus.Utils.numberWithCommas(
        batch.reduce(function(accumulator,value){
          return accumulator+parseFloat(value.price);
        },0).toFixed(3)
      );
      const items=batch.length;
      console.log(batch,total_sm,items);
      if(items>0){
        $("#batch_buy").attr("disabled",false);
        $("#total").html("Total : $"+total_sm);
      }
      else{
        $("#total").html("");
        $("#batch_buy").attr("disabled",true);
      }
      $("#batch_buy").html("Batch Buy ("+items+")");
    });

		$("#batch_buy").click(function(){
				sendTransfer();
		});
}

async function sendTransfer(){
	let memo="sm_market_purchase:";
	for (let tx of batch){
		memo+=tx.market_id+",";
	}
	memo=memo.slice(0,memo.length-1);
	memo+=":steemplus";
	console.log(total_sm,memo);
	marketSettings=await window.SteemPlus.SteemMonsters.getMarketSettings();
	const rate = ($("#ddlCurrency option:selected").val()=="STEEM"?marketSettings.steem_price:marketSettings.sbd_price);
	const total=total_sm/rate;
	if(hasSKC)
		window.steemplus_keychain.requestTransfer(userSM, "steemmonsters", total, memo, $("#ddlCurrency option:selected").val(), function(response) {
				console.log('main js response - transfer');
				console.log(response);
		});
}

function findPurchaseMethod(){
	setTimeout(function(){
		userSM=$(".username").html();
		console.log("user",userSM);
		console.log(window);
		window.steemplus_keychain.requestHandshake(function(){
				console.log("a");
		});
	},1000);
}

function dispatchCustomEvent(name, data, callback) {
        let whatever = Object.assign({
            request_id: 1
        }, data);
        document.dispatchEvent(new CustomEvent(name, {
            detail: whatever
        }));
    }
