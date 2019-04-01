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
     else if(($("#details_card").length==0||$("#details_card").css("display")!="block")&&batchIsStarted)
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
      if ($(this).hasClass('checked')){
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

		$("#input_sm").on('input',function(){
			batch=[];
			for (card of $(".checked")){
				$(card).click();
			}
			if($("#input_sm").val()==""){
				return;
			}
			if($(".select-sm select option:selected").val()=="Cheapest"){
				const nbCards=Math.min(parseInt($("#input_sm").val()),$(".card-checkbox:not(:hidden)").length);
					for(let i=0;i<nbCards;i++){
						$(".card-checkbox:not(:hidden)").eq(i).click();
					}
			} else if($(".select-sm select option:selected").val()=="Upto"){
				let totalUpTo=0;
				for (let it of $(".card-checkbox:not(:hidden):not(.checked)")){
					const parent = $(it).parent().parent();
					if(totalUpTo+parseFloat($(parent).attr("price"))<=parseFloat($("#input_sm").val())){
						totalUpTo+=parseFloat($(parent).attr("price"));
						$(it).click();
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
