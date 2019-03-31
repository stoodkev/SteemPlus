let tokenSmBatch=null;
let batchIsStarted=false;
let batch=[];
let total_sm=null;
let total_rate=null;
let userSM = null;

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
     else if($("#card_details_dialog").eq(0).css("display")!="block"&&batchIsStarted)
        batchIsStarted=false;
   });
}

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
    const batchButton = document.createElement("button");
    batchButton.className="new-button disabled";
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

    $(".card-checkbox").change(function(){
      if ($(this).is(':checked')){
        batch.push({market_id:$(this).attr("market_id"),price:$(this).attr("price"),uid:$(this).attr("uid")});
      }
      else{
        batch = batch.filter(function(item)
        {
            return item.uid!=$(this).attr("uid");
        });
      }
      total_sm=numberWithCommas(
        batch.reduce(function(accumulator,value){
          return accumulator+parseFloat(value.price);
        },0).toFixed(3)
      );
      const items=batch.length;
			marketSettings= window.SteemPlus.SteemMonsters.getMarketSettings();
      if(items>0){
        $("#batch_buy").removeClass("disabled");
      }
      else{
        $("#batch_buy").addClass("disabled");
      }
			getPrice();
    });

		$("#ddlCurrency") .change(function(){
				getPrice();
		});

		$(".left_sm select").change(function(){
				batch=[];
				$("#input_sm").val("");
				switch($(".left_sm select option:selected").val()){
					case "None":
						$(".card-checbox:checked").prop('checked', false).trigger("change");
							$("#input_sm").hide();
						break;
					case "All":
						$(".card-checbox:checked").prop('checked', false).trigger("change");
						$(".card-checbox:not(:checked):not(:hidden)").prop('checked', true).trigger("change");
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

		$("#input_sm").on('input',function(){
			batch=[];
			$(".batchItem:checked").prop('checked', false).trigger("change");
			if($("#input_sm").val()==""){
				return;
			}
			if($(".left_sm select option:selected").val()=="Cheapest"){
					for(let i=0;i<Math.min($("#input_sm").val(),$(".batchItem:not(:hidden)").length);i++){
						$(".batchItem:not(:hidden)").eq(i).prop('checked', true).trigger("change");
					}
			} else if($(".left_sm select option:selected").val()=="Upto"){
				let totalUpTo=0;
				for (let it of $(".batchItem:not(:hidden)")){
					const parent = $(it).parent().parent();
					if(totalUpTo+parseFloat($(parent).attr("price"))<=parseFloat($("#input_sm").val())){
						totalUpTo+=parseFloat($(parent).attr("price"));
						$(it).prop('checked', true).trigger("change");
					}
					else return;
				}
			}
		});

		$("#batch_buy").click(function(){
				sendTransfer();
		});
}

async function sendTransfer(){
	const username=$(".username").html();
	let memo="sm_market_purchase:";
	for (let tx of batch){
		memo+=tx.market_id+",";
	}
	memo=memo.slice(0,memo.length-1);
	memo+=":"+username;
	memo+=":steemplus-pay";

	const steemconnect_sign="https://steemconnect.com/sign/transfer?from="+username+"&to=steemmonsters&amount="+total_rate+"%20"+$("#ddlCurrency option:selected").val()+"&memo="+memo;
	if(hasSKC){
		steem_keychain.requestTransfer(username, "steemmonsters", total_rate, memo, $("#ddlCurrency option:selected").val(), function(result){
			if(!result.success)
					window.open(steemconnect_sign);
		},true);
	}
	else
		window.open(steemconnect_sign);

}

function checkMemoSize(batch){
	if(batch.length>45){
			$("#batch_buy").attr("disabled",true);
			$("#total").html("Please buy 45 or fewer at a time.");
	}
}

const numberWithCommas = (x) => {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function getPrice(){
	const market= await marketSettings;
	const rate = ($("#ddlCurrency option:selected").val()=="STEEM"?market.steem_price:market.sbd_price);
	 total_rate=(parseFloat(total_sm.replace(",",""))/rate).toFixed(3);
	 console.log(total_rate);
	checkMemoSize(batch);
}
