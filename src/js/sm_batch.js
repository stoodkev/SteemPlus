let tokenSmBatch=null;
let batchIsStarted=false;
let batch=[];
let userSM = null;

// Receive message from main to start the feature
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.to === 'sm_batch' && request.order === 'start' && tokenSmBatch == null) {
		tokenSmBatch = request.token;
		waitForMarketPurchase();
		if(!batchIsStarted&window.location.href.includes("&tab=market"))
			 waitForUI();
  }
});

function waitForMarketPurchase(){
   $(document).click(function(){
		// change to new url based UI
     if(!batchIsStarted&window.location.href.includes("&tab=market"))
        waitForUI();
     else if(($("#details_card").length==0||$("#details_card").css("display")!="block")&&batchIsStarted)
        batchIsStarted=false;
   });
}

// Wait until SM is done loading
function waitForUI(){
	console.log("wait");
	setTimeout(function(){
		if($(".card-img").length!=0)
			startBatchPurchase();
		else {
			waitForUI();
		}
  },250);
}

function startBatchPurchase(){
	console.log("start batch purchase");
	if($("#batch_buy").length>0) return;
  batch=[];
  batchIsStarted=true;
		// Add Buttons and filters to the DOM
    const batchButton = document.createElement("button");
    batchButton.className="new-button";
    batchButton.id="batch_buy";
    batchButton.innerHTML="Buy with SteemPlus";
    batchButton.title="Get free SteemPlus Points while buying Steem Monsters cards for the same price.";
    $(".buttons").append(batchButton);

    $(".buttons").append($("<span id='total'></span>"));
		$(".filter-form .vertical-center").append("<div class='select-sm'><select >\
		<option selected='true' disabled='disabled'>Filters</option>    \
		<option value='All'>All</option>\
		<option value='None'>None</option>\
		<option value='Cheapest'>X First cards</option>\
		<option value='Upto'>Up to X$</option>\
		</select>\
		<input type='number' id='input_sm'/></div>");

		// Different filtering choices
		$(".select-sm select").change(function(){
				batch=[];
				$("#input_sm").val("");
				switch($(".select-sm select option:selected").val()){
					case "None":
					for (card of $(".checked")){
						$(card).click();
					}
					$("#input_sm").hide();
						break;
					case "All":
						for (card of $(".checked")){
							$(card).click();
						}
						let i=0;
						for (card of $(".card-checkbox:not(.checked):not(:hidden)")){
							if(i==45) return;
							$(card).click();
							i++;
						}
							$("#input_sm").hide();
						break;
					case "Cheapest":
						$("#input_sm").show();
						break;
					case "Upto":
						$("#input_sm").show();
						break;
				}
		});

		// Number of cards or max price inputed
		$("#input_sm").on('input',function(){
			batch=[];
			// clear selected cards
			for (card of $(".checked")){
				$(card).click();
			}
			if($("#input_sm").val()==""){
				return;
			}
			if($(".select-sm select option:selected").val()=="Cheapest"){
				// select x first cards
				const nbCards=Math.min(parseInt($("#input_sm").val()),$(".card-checkbox:not(:hidden)").length);
					for(let i=0;i<nbCards;i++){
						$(".card-checkbox:not(:hidden)").eq(i).click();
					}
			} else if($(".select-sm select option:selected").val()=="Upto"){
				// select all the cards until reaching the preset price
				let totalUpTo=0;
				for (let it of $(".card-checkbox:not(:hidden)")){
					if(totalUpTo+parseFloat($(it).attr("price"))<=parseFloat($("#input_sm").val())){
						totalUpTo+=parseFloat($(it).attr("price"));
						$(it).click();
					}
					else return;
				}
			}
		});

		// Batch Buy button via SteemPlus
		$("#batch_buy").click(function(){
			if($(".checked").length==0)
				alert("Please choose some cards first");
				total_price=0;
				// Store list of cards to be purchased
			for(card of $(".checked")){
				batch.push({market_id:$(card).attr("market_id"),price:$(card).attr("price")});
				total_price+=parseFloat($(card).attr("price"));
			}
				sendTransfer(total_price);
		});
}

// Send transfer to steemmonsters
async function sendTransfer(total_price){
	const username=$(".username").html();
	// Creating memo
	let memo="sm_market_purchase:";
	for (let tx of batch){
		memo+=tx.market_id+",";
	}
	memo=memo.slice(0,memo.length-1);
	memo+=":"+username;
	memo+=":steemplus-pay";
		// Getting rate
	const total_rate=await getPrice(total_price);
	const steemconnect_sign="https://steemconnect.com/sign/transfer?from="+username+"&to=steemmonsters&amount="+total_rate+"%20"+$("#payment_currency option:selected").val()+"&memo="+memo;
	if(hasSKC){
		// request payment via Keychain
		console.log(username, "steemmonsters", total_rate, memo, $("#payment_currency option:selected").val());
		steem_keychain.requestTransfer(username, "steemmonsters", total_rate, memo, $("#payment_currency option:selected").val(), function(result){
			if(!result.success)
					window.open(steemconnect_sign);
		},true);
	}
	else // Request payment via Steemconnect
		window.open(steemconnect_sign);
}

// Calculate the price in STEEM or SBD from the $ price on SM
async function getPrice(total_sm){
	const market= await window.SteemPlus.SteemMonsters.getMarketSettings();
	const rate = ($("#payment_currency option:selected").val()=="STEEM"?market.steem_price:market.sbd_price);
	total_rate=(total_sm/rate).toFixed(3);
	 return total_rate;
}
