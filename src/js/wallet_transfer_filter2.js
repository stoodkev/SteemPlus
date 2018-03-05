

  var walletRegexp = /^\/@([a-z0-9\-\.]*)\/(transfers|author-rewards|curation-rewards)([\/\#].*)?$/;
  var walletUserNameRegEx = /.*@(.*)\//;
  var typeFiltersList = [{
    type: 'transfer',
    text: 'Transfers'
  },{
    type: 'power-up-down',
    text: 'Power up/down'
  },{
    type: 'claim_reward_balance',
    text: 'Rewards'
  },{
    type: 'conversion',
    text: 'Conversions'
  }];

  var typesNames = ['claim_reward_balance','transfer_to_vesting','transfer','transfer_to_savings','transfer_from_savings', 'cancel_transfer_from_savings', 'withdraw_vesting', 'interest', 'fill_convert_request', 'fill_order', 'comment_benefactor_reward'];

  var filtersState = {
    types: {},
    search: '',
    minAsset: {}
  };




  var token_wallet_transfer_filter=null;
  var aut=null;
  var data=null;
  var walletUserName=null;
  var accountHistory={};
  var accountHistoryNumber=0;
  
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if(request.to=='wallet_transfer_filter'){
      aut=request.data.user;
      if(request.order==='start'&&token_wallet_transfer_filter==null)
      {
        token_wallet_transfer_filter=request.token;
        setupFilters();
        
				walletUserName = window.location.href.match(walletUserNameRegEx)[1];

				data = scrapData();
				getLastTransactionId(walletUserName);
      }
    }
  });

  function getLastTransactionId(walletUserName)
  {
  	return new Promise (function(resolve,reject){
	    steem.api.getAccountHistory(walletUserName, -1, 0, function(err, result) {
				if(err){
					console.log(err);
					return;
				}
					getAccountHistory(walletUserName, 10000, result[0][0]);
			});
	  });
  }

	function getAccountHistory(walletUserName, begin, lastTransactionId)
	{
    return new Promise (function(resolve,reject){
      steem.api.getAccountHistory(walletUserName, begin, 10000, function(err, result) {
				var nextBegin = begin + 10001; 
				console.log(nextBegin);
				if(err){
					console.log(err);
					return;
				}
				
				for(var i=result.length-1; i>=0; i--){
					if(typesNames.includes(result[i][1].op[0]))
					{
						if(accountHistory[result[i][0]]===null || accountHistory[result[i][0]]===undefined)
							accountHistoryNumber++;
						accountHistory[result[i][0]] = result[i][1];
						// accountHistory[result[i][0]] = result[i][1].op[0];
					}
				}
				if(result[result.length-1][0] === lastTransactionId)
				{
					console.log('lastTransactionId ' + lastTransactionId);
					console.log(accountHistory);
					console.log(accountHistoryNumber);
					return;
				}
				getAccountHistory(walletUserName, nextBegin, lastTransactionId);
			});
  	});
  }



  function setupFilters() {

    var tableRows = $('.UserWallet table .Trans');
    setupFiltersUI(tableRows.closest('table'));
  }

  function setupFiltersUI(table) {

    if(table.parent().find('.smi-transaction-table-filters').length){
      return;
    }

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
        <div class="">' +
        createMinAssetUI('STEEM POWER') +
        '</div>\
      </div>\
      <div class="smi-transaction-table-filters-search">' +
      createSearchWalletUI() +
      '</div>\
    </div>');

    filters.find('.smi-transaction-table-type-filter input').on('change', function() {
      var $this = $(this);
      var hidden = $this.prop("checked") ? false : true;
      setTypeFilterHidden($this.val(), hidden);
      updateTable();
    });
    filters.find('.smi-transaction-table-asset-value-filter input').on('input', function() {
      var $this = $(this);
      var asset = $this.data('asset');
      var value = $this.val();
      setMinAmountForAsset(asset, value);
      updateTable();
    });
    filters.find('.smi-transaction-table-search-filter input').on('input', function() {
      var $this = $(this);
      var value = $this.val();
      setSearchValue(value);
      updateTable();
    });

    table.before(filters);
  }


  function createTypeFiltersUI() {
    return '<label><span>Filter by type: </span></label>' + 
    typeFiltersList.map(function(f) {
      return '<div class="smi-transaction-table-type-filter">\
        <label>\
          <input id="' + f.type +'_filter" type="checkbox" value="' + f.type + '"' + (typeFilterHidden(f.type) ? '' : ' checked') + '><span>' + f.text + '</span>\
        </label>\
      </div>';
    }).join('');
  }

  function createMinAssetUI(asset) {
    return '<div class="smi-transaction-table-asset-value-filter">\
      <label>\
        <span>Min : ' + asset + '</span>\
        <input type="number" value="' + minAmountForAsset(asset).toFixed(3) + '" lang="en-150" step="0.001" min="0" data-asset="' + asset + '">\
      </label>\
    </div>';
  }

  function createSearchWalletUI(asset) {
    return '<div class="smi-transaction-table-search-filter">\
      <label>\
        <span>Search:</span>\
        <input  type="text" value="' + searchValue() + '">\
      </label>\
    </div>';
  }

  function typeFilterHidden(type) {
    return filtersState.types[type] || false;
  }

  function setTypeFilterHidden(type, value) {
    filtersState.types[type] = value;
  }

  function searchValue() {
    return filtersState.search || '';
  }

  function setSearchValue(val) {
    filtersState.search = val || '';
  }

  function minAmountForAsset(asset) {
    return filtersState.minAsset[asset] || 0;
  }

  function setMinAmountForAsset(asset, val) {
    filtersState.minAsset[asset] = val || 0;
  }


  function scrapData(){

  	
  	var tableRows = $('table').find('> tbody > tr');

  	var data = [];

  	for(var i=0; i<tableRows.length; i++){
  		var tableRow = tableRows[i];

  		console.log(tableRow);
  		tableRow.id = 'row'+i;
  		
  		var timeCell = tableRow.cells.item(0);
  		var infoCell = tableRow.cells.item(1);
  		var memoCell = tableRow.cells.item(2);

  		
  		// time scrapping

		var timeData = {
			title: timeCell.children.item(0).title,
			content: timeCell.children.item(0).textContent
		};

		// Info scrapping

		//console.log(infoCell);

		var username = null;
		var valueSBD = null;
		var valueSteem = null;
		var valueSteemPower = null;
		var infoContent = infoCell.innerText;

		if(infoCell.children.length > 0)
			username = infoCell.children.item(0).innerText;

		if(infoContent.includes('SBD'))
		{
			var sbdRegEx = /[.]*([0-9]*[.][0-9]*) SBD/i;
			valueSBD = parseFloat(infoContent.match(sbdRegEx)[1]);
		}
		if(infoContent.includes('STEEM POWER'))
		{
			var steemPowerRegEx = /[.]*([0-9]*[.][0-9]*) STEEM POWER/i;
			valueSteemPower = parseFloat(infoContent.match(steemPowerRegEx)[1]);
		}
		else if(infoContent.includes('STEEM'))
		{
			var steemRegEx = /[.]*([0-9]*[.][0-9]*) STEEM/i;
			valueSteem = parseFloat(infoContent.match(steemRegEx)[1]);
		}

		var infoData = {
			type: '',
			infoContent: infoContent,
			'SBD': valueSBD,
			'STEEM': valueSteem,
			'STEEM POWER': valueSteemPower,
			username: username

		};

		// Memo scrapping

		var memoData = {
			content: memoCell.children.item(0).textContent
		};

		data.push({id:'row'+i,timeData:timeData, infoData:infoData, memoData:memoData});

  	}
  	return data;
  }

  function updateTable(){

  	data.forEach(function(row){
		if(!row.memoData.content.includes(searchValue()) && row.infoData.infoContent.includes(searchValue()) && searchValue()!=='')
		{
			$('#' + row.id).hide();
			return;
		}
		var minAssets = filtersState.minAsset;
		for(var minAsset in minAssets){
			if(row.infoData[minAsset] < minAssets[minAsset]){
				$('#' + row.id).hide();
				return;
			}
		}
		
		var filterTypes = filtersState.types;
		for(filterType in filterTypes){
			if(filterTypes[filterType])
			{
				if(row.infoData['type'] !== filterType){
					$('#' + row.id).hide();
					return;
				}
			}
		}

		$('#' + row.id).show();
  	});
  }
