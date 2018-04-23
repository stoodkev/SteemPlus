var token_wallet_history=null;

var totalVestsWalletHistory = null;
var totalSteemWalletHistory = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if(request.to=='wallet_history'){
      if(request.order==='start'&&token_wallet_history==null)
      {
        token_wallet_history=request.token;
        totalVestsWalletHistory = request.data.totalVests;
    	totalSteemWalletHistory = request.data.totalSteem;
        startWalletHistory();
      }

      if(request.order==='click')
      {
        token_wallet_history=request.token;
        totalVestsWalletHistory = request.data.totalVests;
    	totalSteemWalletHistory = request.data.totalSteem;
        startWalletHistory();
      }
    }
  });


function startWalletHistory()
{
	if($('.Trans').length > 0)
	{
		var usernameWalletHistory = window.SteemPlus.Utils.getPageAccountName();
		$.ajax({
	      type: "GET",
	      beforeSend: function(xhttp) {
	        xhttp.setRequestHeader("Content-type", "application/json");
	        xhttp.setRequestHeader("X-Parse-Application-Id", "efonwuhf7i2h4f72h3o8fho23fh7");
	      },
	      url: 'https://api.myjson.com/bins/ymb77',
	      // url: 'http://steemplus-api.herokuapp.com/api/get-received-witness-votes/'+usernameTabWitnesses,
	      success: function(result) {
	      	console.log(result.rows);
	      	displayWalletHistory(result.rows);
	      },
	      error: function(msg) {
	        console.log(msg.responseJSON.error);
	      }
	    });
	}
		
	else
		setTimeout(function(){
			startWalletHistory();
		}, 250);
}

function displayWalletHistory(dataWalletHistory)
{
	var tbodyWH = $('.Trans').parent();
	$('.Trans').remove();
	dataWalletHistory.forEach(function(itemWalletHistory, indexWH){
		var trWH = $('<tr class="Trans wh-type-'+ itemWalletHistory.type + '" id="item' + indexWH + '"></tr>');
		var tdTimestampWH = $('<td><span title="' + new Date(itemWalletHistory.timestamp) + '">'+ moment(new Date(itemWalletHistory.timestamp)).fromNow() + '</span></td>');
		trWH.append(tdTimestampWH);

		var textAmoutWH = '';
		if(itemWalletHistory.type==='claim')
		{
			var amountSP = steem.formatter.vestToSteem(parseFloat(itemWalletHistory.reward_vests), totalVestsWalletHistory, totalSteemWalletHistory).toFixed(3);

			textAmoutWH = '';
			if(itemWalletHistory.reward_sbd > 0) textAmoutWH = itemWalletHistory.reward_sbd + ' SBD';
			if(amountSP > 0) textAmoutWH = textAmoutWH + (textAmoutWH==='' ? '' : ' and ') + amountSP + ' SP' + (itemWalletHistory.reward_steem>0 ? ' and ' : '');
			if(itemWalletHistory.reward_steem > 0) textAmoutWH = textAmoutWH = textAmoutWH + itemWalletHistory.reward_steem + " STEEM";
			textAmoutWH = 'Claim Rewards : ' + textAmoutWH
		}
		else if(itemWalletHistory.type==='transfer_to')
			textAmoutWH = itemWalletHistory.amount + ' ' + itemWalletHistory.amount_symbol + ' received from <a href="/@' + itemWalletHistory.to_from + '">@' + itemWalletHistory.to_from + '</a>';
		else if(itemWalletHistory.type==='transfer_from')
			textAmoutWH = itemWalletHistory.amount + ' ' + itemWalletHistory.amount_symbol + ' sent to <a href="/@' + itemWalletHistory.to_from + '">@' + itemWalletHistory.to_from + '</a>';

		var tdAmountWH = $('<td class="TransferHistoryRow__text" style="max-width: 40rem;">' + textAmoutWH + '</td>');
		trWH.append(tdAmountWH);

		var tdMemo = $('<td class="show-for-medium" style="max-width: 40rem; word-wrap: break-word;"><span class="Memo">'+ itemWalletHistory.memo +'</span></td>');
		trWH.append(tdMemo);
		tbodyWH.append(trWH);
		
	});
}

function createWalletHistoryFiltersUI()
{
	var filters = $('<div class="smi-transaction-table-filters">\
      <div class="smi-transaction-table-filters-type">' +
      createTypeFiltersUI() +
      '</div>\
      <div class="smi-transaction-table-filters-assets">\
        <div class="">' +
        createMinAssetUI('SBD') +
        '</div>\
        <div class="">' +
        createMinAssetUI('STEEM') +
        '</div>\
      </div>\
      <div class="smi-transaction-table-filters-search">' +
      createSearchUI() +
      '</div>\
    </div>');
}



function createTypeFiltersUI() 
{
	return '<label><span>Filter by type: </span></label>' + 
	typeFiltersList.map(function(f) {
	  return '<div class="smi-transaction-table-type-filter">\
	    <label>\
	      <input type="checkbox" value="' + f.type + '"' + (typeFilterHidden(f.type) ? '' : ' checked') + '><span>' + f.text + '</span>\
	    </label>\
	  </div>';
	}).join('');
}

function createMinAssetUI(asset) {
return '<div class="smi-transaction-table-asset-value-filter">\
  <label>\
    <span>Min amount: ' + asset + '</span>\
    <input type="number" value="' + minAmountForAsset(asset).toFixed(3) + '" lang="en-150" step="0.001" min="0" data-asset="' + asset + '">\
  </label>\
</div>';
}

function createSearchUI(asset) {
return '<div class="smi-transaction-table-search-filter">\
  <label>\
    <span>Search:</span>\
    <input type="text" value="' + searchValue() + '">\
  </label>\
</div>';
}