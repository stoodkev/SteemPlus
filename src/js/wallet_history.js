var token_wallet_history=null;

var totalVestsWalletHistory = null;
var totalSteemWalletHistory = null;

var accountWH = null;
var memoKeyWH = null;
var usernameWalletHistory = null;
var dataWalletHistory = null;
var retry=0;
var modalWH = null;

// Available filter types
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
    text: 'Claimed Rewards'
	},
	{
		type: 'hide_spam',
		text: 'Hide Spam'
	}
];


var filtersStateWH = {
	types: {'hide_spam':true},
	search: '',
	minAsset: {SP:0,STEEM:0,SBD:0}
};

function typeFilterHiddenWH(type) {
    return filtersStateWH.types[type] || false;
}

function setTypeFilterHiddenWH(type, value) {
  filtersStateWH.types[type] = value;
}

function searchValueWH() {
  return filtersStateWH.search || '';
}

function setSearchValueWH(val) {
  filtersStateWH.search = val || '';
}

function minAmountForAssetWH(asset) {
  return parseFloat(filtersStateWH.minAsset[asset]) || 0;
}

function setMinAmountForAssetWH(asset, val) {
  filtersStateWH.minAsset[asset] = parseFloat(val) || 0;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

  if(request.to=='wallet_history'){
		retry=0;
    if(request.order==='start'&&token_wallet_history==null)
    {
      token_wallet_history=request.token;
      totalVestsWalletHistory = request.data.totalVests;
  		totalSteemWalletHistory = request.data.totalSteem;
			accountWH = request.data.account;
			memoKeyWH = request.data.walletHistoryMemoKey;

      if($('.smi-transaction-table-filters').length===0)
      	startWalletHistory();
    }

    if(request.order==='click'&&token_wallet_history==request.token)
    {
      totalVestsWalletHistory = request.data.totalVests;
  		totalSteemWalletHistory = request.data.totalSteem;
  		accountWH = request.data.account;
			memoKeyWH = request.data.walletHistoryMemoKey;
			console.log("click");
      if($('.smi-transaction-table-filters').length===0)
      	startWalletHistory();
    }
  }
});

// Function used to start the wallet history
// Check if the page is ready and start. If not, wait and try again
function startWalletHistory()
{
	console.log("start wallet",$('.Trans').length);
	if($('.Trans').length > 0&&window.location.href.match(/transfers/))
	{

		$('.Trans').hide();
		usernameWalletHistory = window.SteemPlus.Utils.getPageAccountName();
		$.ajax({
      type: "GET",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", "efonwuhf7i2h4f72h3o8fho23fh7");
      },
      url: 'http://steemplus-api.herokuapp.com/api/get-wallet-content/'+usernameWalletHistory,
      success: function(result) {
      	dataWalletHistory = result;
      	if($('.smi-transaction-table-filters').length===0)
      		displayWalletHistory();
      },
      error: function(msg) {
        console.log(msg.responseJSON.error);
      }
    });
	}

	else
		setTimeout(function(){
			if(retry<=20){
			retry++;
			startWalletHistory();
		}
	}, 250);
}

//Function used to diplay the wallet when all the information is downloaded
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

		var tdMemo = null;
		if(itemWalletHistory.memo.startsWith('#') && usernameWalletHistory === accountWH.name)
		{
			if(memoKeyWH === '')
			{
				tdMemo = $('<td class="show-for-medium" style="max-width: 40rem; word-wrap: break-word;"><span class="Memo"><i>This is a private memo. Please click on \'Add Private Memo Key\' button above.</i></span></td>');
			}
			else
			{
				try
				{
					var textMemo = window.decodeMemo(memoKeyWH, itemWalletHistory.memo);
					tdMemo = $('<td class="show-for-medium" style="max-width: 40rem; word-wrap: break-word;"><span class="Memo"><i>'+ textMemo.slice(1, textMemo.length) +'</i></span></td>');
				}
				catch(err)
				{
					tdMemo = $('<td class="show-for-medium" style="max-width: 40rem; word-wrap: break-word;"><span class="Memo"><i>Invalid memo...</i></span></td>');
				}
			}

		}
		else
		{
			if(itemWalletHistory.memo.startsWith('#'))
				tdMemo = $('<td class="show-for-medium" style="max-width: 40rem; word-wrap: break-word;"><span class="Memo"></span></td>');
			else
				tdMemo = $('<td class="show-for-medium" style="max-width: 40rem; word-wrap: break-word;"><span class="Memo">'+ itemWalletHistory.memo +'</span></td>');
		}

		trWH.append(tdMemo);
		tbodyWH.append(trWH);

	});

	createWalletHistoryFiltersUI();
}

// Function used to create the wallet filter UI (buttons, inputs ...)
function createWalletHistoryFiltersUI()
{

	var filters = $('<div class="smi-transaction-table-filters">\
    <div class="smi-transaction-table-filters-type">' +
    createTypeFiltersUIWH() +
    '</div>\
    <div class="smi-transaction-table-filters-search">' +
    	createSearchUIWH() +
    '</div>\
    <div class="smi-transaction-table-filters-assets">\
		  <div class="">' +
		  	createMinAssetUIWH('SBD') +
		  '</div>\
		  <div class="">' +
		  	createMinAssetUIWH2('STEEM') +
		  '</div>\
		  <div class="">' +
		    createMinAssetUIWH2('SP') +
		  '</div>\
		</div>\
  </div>');

	if(usernameWalletHistory === accountWH.name)
	{
		$('table').parent().find('.secondary').after($('<div class="inputAddMemoKey" style="margin-bottom: 20px;">\
      <input type="submit" id="displayModalWH" value="Add private memo key">\
    </div>'));

    $('#displayModalWH').click(function(){
			modalWH = $('<div role="dialog" style="bottom: 0px; left: 0px; overflow-y: scroll; position: fixed; right: 0px; top: 0px;">\
      <div class="reveal-overlay fade in" style="display: block;"></div>\
        <div class="reveal fade in" role="document" tabindex="-1" style="display: block; min-height: 200px;">\
          <button class="close-button" type="button">\
            <span aria-hidden="true" class="">×</span>\
          </button>\
        </div>\
      </div>');
      $('body').append(modalWH);

	    modalWH.find('.close-button').on('click', function() {
	      modalWH.remove();
	    });
	    modalWH.find('.reveal-overlay').on('click', function() {
	      modalWH.remove();
	    });

			var addMemoKeyUIWH = $('<div id="modalContent">\
        <div id="modalTitle" class="row">\
          <h3 class="column">Add Private Memo Key</h3>\
        </div>\
        <div>\
          <div class="row">\
            <div class="column small-12">\
            	Your private memo key can and will be used only to decrypt your memos. You can find it in Wallet > Permissions > Memo > Show private key.<br> It will be stored locally and you can remove it at any time. In this case, you won\'t be able to see your private memos through SteemPlus anymore.\
            <br>\
            </div>\
          </div>\
          <br>\
          <div class="row">\
						<div class="divInputMemoKey">' +
			        (memoKeyWH==='' ?
			        	'<input type="password" id="addMemoKeyInput" name="memoKey" placeholder="Add your memo key here">'
			        :
			        	'<input type="password" id="addMemoKeyInput" name="memoKey" value="'+ memoKeyWH + '">' ) +
			        '<input type="submit" id="addMemoKeySubmit" value="'+ (memoKeyWH==='' ? 'Add' : 'Update') + '">\
			        '+ (memoKeyWH==='' ? '' : '<input type="submit" id="removeMemoKeyButton" value="Remove">') +' \
			      </div>\
          </div>\
        </div>\
      </div>');
      modalWH.find('.reveal').append(addMemoKeyUIWH);

      toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-bottom-center",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
      };
      var titleToastr = "SteemPlus - Memo key";

      modalWH.find('#removeMemoKeyButton').click(function(){
      	chrome.storage.local.remove(["wallet_history_memo_key"],function(){
				 	var error = chrome.runtime.lastError;
				    if (error) {
				    		toastr.error(error, titleToastr);
				        console.error(error);
				    }
				    else
				    {
				    	modalWH.remove();
				    	toastr.success('Your private memo key has been successfully removed. You won\'t be able to read your private memos anymore.', titleToastr);
				    	memoKeyWH='';
				    }
				})
      });

      modalWH.find('#addMemoKeySubmit').click(function(){

      	if(accountWH.memo_key===modalWH.find('#addMemoKeyInput')[0].value)
      	{
      		toastr.error('You are trying to use your public memo key! Please use the private memo key instead.', titleToastr);
      	}
      	else
      	{

					try
					{
						steem.auth.wifIsValid(modalWH.find('#addMemoKeyInput')[0].value, accountWH.memo_key);
      			chrome.storage.local.set({
			      	wallet_history_memo_key:modalWH.find('#addMemoKeyInput')[0].value
			    	});
			    	memoKeyWH=modalWH.find('#addMemoKeyInput')[0].value;
			    	toastr.success('Your private memo key has been successfully added. Please refresh the page to start reading your private memos.', titleToastr);
			    	modalWH.remove();
					}
					catch(err)
					{
      			toastr.error('This key is incorrect, please use your private memo key.', titleToastr);
					}
      	}
	    });
    });
	}

	$('table').before(filters);
	$(filters).find('#inputSearchWalletHistory').unbind('input').on('input',function(){
		setSearchValueWH($(filters).find('#inputSearchWalletHistory')[0].value);
		updateTableWH();
	});

	$(filters).find('.type-filter-button').unbind('click').on('click', function(){
		if($(this).parent().eq(0).hasClass('.input-type-filter-checked'))
		{
			console.log('has class');
			$(this).parent().eq(0).addClass('input-type-filter-checked');
			$(this).parent().eq(0).removeClass('input-type-filter-unchecked');
		}
		else
		{
			console.log('does not have class');
			$(this).parent().eq(0).removeClass('input-type-filter-checked');
			$(this).parent().eq(0).addClass('input-type-filter-unchecked');
		}
		setTypeFilterHiddenWH($(this)[0].value, $(this).prop('checked'));
		updateTableWH();
	});

	$(filters).find('.inputMinFilterWalletHistory').unbind('input').on('input',function(){
	  setMinAmountForAssetWH($(this).data('asset'), $(this)[0].value);
	  updateTableWH();
	});

	updateTableWH();
}

// Function used to create one filter button
// Use the map created at the beginning
function createTypeFiltersUIWH()
{
	return '<label><span>Filter by type: </span></label>' +
	typeFiltersListWH.map(function(f) {
	  return '<div class="smi-transaction-table-type-filter walletHistoryFilters">\
	    <label class="input-type-filter-checked">\
	      <input type="checkbox" value="' + f.type + '" class="type-filter-button" checked="true"><span' + (f.type==='spam' ? ' title="Hide 0.001 SBD/STEEM transactions" ' : '' ) + '>' + f.text + '</span>\
	    </label>\
	  </div>';
	}).join('');
}

// Function used to create the search bar
function createSearchUIWH() {
	return '<div class="smi-transaction-table-search-filter">\
	  <label>\
	    <span>Search:</span>\
	    <input id="inputSearchWalletHistory" type="text" value="">\
	  </label>\
	</div>';
}

// Function used to create the first asset filter.
// @parameter asset : name of the asset (SBD, STEEM, SP)
function createMinAssetUIWH(asset) {
  return '<div class="smi-transaction-table-asset-value-filter">\
    <label>\
      <span>Min amounts</span>\
      <input class="inputMinFilterWalletHistory" type="number" placeholder="'+ asset +'" value="" lang="en-150" step="0.001" min="0" data-asset="' + asset + '">\
    </label>\
  </div>';
}

// Function used to create other asset filter. For this one, there is no label
// @parameter asset : name of the asset (SBD, STEEM, SP)
function createMinAssetUIWH2(asset) {
  return '<div class="smi-transaction-table-asset-value-filter">\
    <label>\
      <input class="inputMinFilterWalletHistory" type="number" placeholder="'+ asset +'" value="" lang="en-150" step="0.001" min="0" data-asset="' + asset + '">\
    </label>\
  </div>';
}

// Function used to update the view by hiding all the rows which doesn't match with the filterState
function updateTableWH(){
	dataWalletHistory.forEach(function(row, index){

		// Search Bar filter
		if(!row.memo.includes(searchValueWH()) && !row.to_from.includes(searchValueWH()) && searchValueWH()!=='')
		{
			$('#item' + index).hide();
			return;
		}

		// Type filter
		var filterTypesWH = filtersStateWH.types;
		for(filterTypeWH in filterTypesWH){
			if(!filterTypesWH[filterTypeWH])
			{

				if(row.type === filterTypeWH){
					$('#item' + index).hide();
					return;
				}
			}
			// If hide spam activated, hide all the line with 0.001 value. Those one are considered as spam
			if(filterTypeWH==='hide_spam'&&filterTypesWH[filterTypeWH])
			{
				if(row.amount === 0.001 || row.reward_sbd === 0.001 || row.reward_steem === 0.001)
				{
					$('#item' + index).hide();
					return;
				}
			}
		}

		// Filter on values
		var valueLine = {};
		valueLine['SP'] = (row.reward_vests === 0 ? -1 : parseFloat(getSPFromVestingSharesWH(row.reward_vests)));

		if(row.type==='transfer_from'||row.type==='transfer_to')
		{
			if(row.amount_symbol==='SBD')
			{
				valueLine['SBD'] = row.amount;
				valueLine['STEEM'] = -1;
			}
			else
			{
				valueLine['STEEM'] = row.amount;
				valueLine['SBD'] = -1;
			}
		}
		else
		{
				valueLine['STEEM'] = (row.reward_steem === 0 ? -1 : row.reward_steem);
				valueLine['SBD'] = (row.reward_sbd === 0 ? -1 : row.reward_sbd);
		}
		var minAssets = filtersStateWH.minAsset;

		// Display the line if one of the value respect the filter
		if(valueLine['STEEM'] < minAmountForAssetWH('STEEM') && valueLine['SBD'] < minAmountForAssetWH('SBD') && valueLine['SP'] < minAmountForAssetWH('SP'))
		{
			$('#item' + index).hide();
			return;
		}

		$('#item' + index).show();
	});
}

// Display the SP from vesting shares.
function getSPFromVestingSharesWH(vests)
{
	return steem.formatter.vestToSteem(parseFloat(vests), totalVestsWalletHistory, totalSteemWalletHistory).toFixed(3);
}
