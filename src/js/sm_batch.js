let tokenSmBatch=null;
let batchIsStarted=false;
let batch=[];
let total_sm=null;
let total_rate=null;
let hasSKC=false;
let userSM = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.to === 'sm_batch' && request.order === 'start' && tokenSmBatch == null) {
		tokenSmBatch = request.token;
		waitForMarketPurchase();
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
		$(".market-header").next().after("<div class='market-header select-sm'><div class='left_sm'>Select <select style='font-size:20px'>\
		<option selected='true' disabled='disabled'>Filters</option>    \
		<option value='All'>All</option>\
		<option value='None'>None</option>\
		<option value='Cheapest'>X Cheapest cards</option>\
		<option value='Upto'>Up to X$</option>\
		</select></div><div  class='left_sm'>\
		<input type='number' id='input_sm'/></div></div>");

    $(".batchItem").change(async function(){
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
			marketSettings= window.SteemPlus.SteemMonsters.getMarketSettings();
      if(items>0){
        $("#batch_buy").attr("disabled",false);
        $("#total").html("Total : $"+total_sm);
      }
      else{
        $("#total").html("");
        $("#batch_buy").attr("disabled",true);
      }
      $("#batch_buy").html("Batch Buy ("+items+")");
			const market= await marketSettings;
			const rate = ($("#ddlCurrency option:selected").val()=="STEEM"?market.steem_price:market.sbd_price);
			 total_rate=(total_sm/rate).toFixed(3);
			$("#total").html("Total : $"+total_sm+"<br>("+total_rate+" "+$("#ddlCurrency option:selected").val()+")");
    });

		$(".left_sm select").change(function(){
				batch=[];
				$("#input_sm").val("");
				switch($(".left_sm select option:selected").val()){
					case "None":
						$(".batchItem:checked").prop('checked', false).trigger("change");
							$("#input_sm").hide();
						break;
					case "All":
						$(".batchItem:checked").prop('checked', false).trigger("change");
						$(".batchItem:not(:checked):not(:hidden)").prop('checked', true).trigger("change");
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
	window.open(steemconnect_sign);

}
