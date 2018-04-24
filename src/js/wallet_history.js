var token_wallet_history=null;

var totalVestsWalletHistory = null;
var totalSteemWalletHistory = null;

var dataWalletHistory = null;

var typeFiltersListWH = [
	{
    type: 'transfer_to',
    text: 'Received'
	},
	{
    type: 'transfer_from',
    text: 'Sent'
	},
	{
    type: 'claim',
    text: 'Claim Rewards'
	}
];

var filtersStateWH = {
	types: {},
	search: '',
	minAsset: {}
};

function typeFilterHiddenWH(type) {
    return filtersStateWH.types[type] || false;
}

function setTypeFilterHiddenWH(type, value) {
  filtersStateWH.types[type] = value;
  console.log(filtersStateWH);
}

function searchValueWH() {
  return filtersStateWH.search || '';
}

function setSearchValueWH(val) {
  filtersStateWH.search = val || '';
}

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
      //url: 'https://api.myjson.com/bins/ognmb',
      url: 'http://steemplus-api.herokuapp.com/api/get-wallet-content/'+usernameWalletHistory,
      success: function(result) {
      	dataWalletHistory = result;
      	displayWalletHistory();
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

function displayWalletHistory()
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
			var amountSP = getSPFromVestingSharesWH(itemWalletHistory.reward_vests);

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

	createWalletHistoryFiltersUI();
}

function createWalletHistoryFiltersUI()
{
	var filters = $('<div class="smi-transaction-table-filters">\
      <div class="smi-transaction-table-filters-type">' +
      createTypeFiltersUIWH() +
      '</div>\
      <div class="smi-transaction-table-filters-search">' +
      	createSearchUIWH() +
      '</div>\
    </div>');

	$('table').before(filters);
	$(filters).find('#inputSearchWalletHistory').unbind('input').on('input',function(){
		setSearchValueWH($(filters).find('#inputSearchWalletHistory')[0].value);
		updateTableWH();
	});

	$(filters).find('.type-filter-button').unbind('click').on('click', function(){
		setTypeFilterHiddenWH($(this)[0].value, $(this).prop('checked'));
		updateTableWH();
	});
}

function createTypeFiltersUIWH() 
{
	return '<label><span>Filter by type: </span></label>' + 
	typeFiltersListWH.map(function(f) {
	  return '<div class="smi-transaction-table-type-filter">\
	    <label>\
	      <input type="checkbox" value="' + f.type + '" class="type-filter-button" checked><span>' + f.text + '</span>\
	    </label>\
	  </div>';
	}).join('');
}


function createSearchUIWH() {
	return '<div class="smi-transaction-table-search-filter">\
	  <label>\
	    <span>Search:</span>\
	    <input id="inputSearchWalletHistory" type="text" value="">\
	  </label>\
	</div>';
}

function updateTableWH(){

	dataWalletHistory.forEach(function(row, index){
		console.log(row);
		if(!row.memo.includes(searchValueWH()) && !row.to_from.includes(searchValueWH()) && searchValueWH()!=='')
		{
			$('#item' + index).hide();
			return;
		}
		var filterTypesWH = filtersStateWH.types;
		for(filterTypeWH in filterTypesWH){
			if(!filterTypesWH[filterTypeWH])
			{
				if(row.type === filterTypeWH){
					$('#item' + index).hide();
					return;
				}
			}
		}
		
		$('#item' + index).show();
	});
}

function getSPFromVestingSharesWH(vests)
{
	return steem.formatter.vestToSteem(parseFloat(vests), totalVestsWalletHistory, totalSteemWalletHistory).toFixed(3);
}