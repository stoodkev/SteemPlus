

  //FILTERS:
  //Transfer
  //Power up/down
  //Rewards (+ interests)
  //Conversions

  //AMOUNT
  //Minimum amount SBD/STEEM

  //Search
  //textual filter 

  var oldTransferHistoryRowRender = null;
  var renderChanged = false;
  var walletRegexp = /^\/@([a-z0-9\-\.]*)\/(transfers|author-rewards|curation-rewards)([\/\#].*)?$/;
  var typeFiltersList = [{
    type: 'transfer',
    text: 'Transfers'
  },{
    type: 'power-up-down',
    text: 'Power up/down'
  },{
    type: 'reward',
    text: 'Rewards'
  },{
    type: 'conversion',
    text: 'Conversions'
  }];

  var filtersState = {
    types: {},
    search: '',
    minAsset: {}
  };


  var token_wallet_transfer_filter=null;
  var aut=null;
  
  
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if(request.to=='wallet_transfer_filter'){
      aut=request.data.user;
      if(request.order==='start'&&token_wallet_transfer_filter==null)
      {
        token_wallet_transfer_filter=request.token;
        setupFilters();
      }
    }
  });

  var updateRows = _.debounce(_updateRows, 100);;

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


  function shouldHideType(type) {
    if( type === 'transfer_to_vesting' ||
      /^transfer$|^transfer_to_savings$|^transfer_from_savings$/.test(type) ||
      type === 'cancel_transfer_from_savings') {
      
      return typeFilterHidden('transfer');

    } else if( type === 'withdraw_vesting' ) {
              
      return typeFilterHidden('power-up-down');

    } else if( type === 'curation_reward' ||
      type === 'author_reward' ||
      type === 'claim_reward_balance' ||
      type === 'comment_benefactor_reward' ||
      type === 'interest') {

      return typeFilterHidden('reward');

    } else if (type === 'fill_convert_request' || 
      type === 'fill_order') {

      return typeFilterHidden('conversion');

    }
  }

  function shouldShowSearchValue(text, hideIfSearchEmpty) {
    var search = searchValue();
    if(!search){
      if(hideIfSearchEmpty){
        return false;
      }
      return true;
    }
    if(!text || text.toLowerCase().indexOf(search.toLowerCase()) === -1){
      return false;
    }
    return true;
  }

  function shouldHideAmount(amount) {
    var s = amount.split(' ');
    var value = parseFloat(s[0]);
    var asset = s[1];

    var min = minAmountForAsset(asset);
    if(!min){
      return false;
    }
    return value < min;
  }



  function makeMemoHtml(text) {
    return window.SteemPlus.Sanitize.sanitizeMemo(text || '');
  }


  function newTransferHistoryRowRender() {
    var result = oldTransferHistoryRowRender.apply(this, arguments);
    if(!isWalletTransferFilterEnabled()){
      return result;
    }

    const {op, context, curation_reward, author_reward, benefactor_reward, powerdown_vests, reward_vests} = this.props;
    // context -> account perspective

    const type = op[1].op[0];
    const data = op[1].op[1];

    var hide = false;
    
    if(shouldHideType(type)){
      hide = true;      
    }
    else if( type === 'transfer_to_vesting' ) {

      hide = !(shouldShowSearchValue(data.from) || shouldShowSearchValue(data.to) || shouldShowSearchValue(data.memo)) 
        || shouldHideAmount(data.amount);
        
    } else if(/^transfer$|^transfer_to_savings$|^transfer_from_savings$/.test(type)) {
        
      hide = !(shouldShowSearchValue(data.from) || shouldShowSearchValue(data.to) || shouldShowSearchValue(data.memo)) 
        || shouldHideAmount(data.amount);

    } else if (type === 'cancel_transfer_from_savings') {

      hide = !shouldShowSearchValue(data.memo);

    } else if( type === 'withdraw_vesting' ) {

      hide = !shouldShowSearchValue(data.memo);

    } else if( type === 'curation_reward' ) {

      hide = !shouldShowSearchValue(data.memo) || shouldHideAmount(curation_reward + ' STEEM');

    } else if (type === 'author_reward') {

      hide = !shouldShowSearchValue(data.memo) || (shouldHideAmount(data.sbd_payout) && shouldHideAmount(data.steem_payout) && shouldHideAmount(author_reward + ' STEEM'));

    } else if (type === 'claim_reward_balance') {

      hide = !shouldShowSearchValue(data.memo) || (shouldHideAmount(data.reward_steem) && shouldHideAmount(data.reward_sbd) && shouldHideAmount(reward_vests + ' STEEM'));

    } else if (type === 'interest') {

      hide = !shouldShowSearchValue(data.memo) || shouldHideAmount(data.interest);

    } else if (type === 'fill_convert_request') {

      hide = !shouldShowSearchValue(data.memo) || (shouldHideAmount(data.amount_in) && shouldHideAmount(data.amount_out));

    } else if (type === 'fill_order') {

      hide = !shouldShowSearchValue(data.memo) || (shouldHideAmount(data.open_pays) && shouldHideAmount(data.current_pays));

    } else if (type === 'comment_benefactor_reward') {

      hide = !shouldShowSearchValue(data.memo) || (shouldHideAmount(data.steem_payout) && shouldHideAmount(benefactor_reward + ' STEEM'));

    }



    if(hide){
      result.props.className = 'Trans smi-transaction-filtered-out';
      result.type = 'tr2';
    }else{
      result.props.className = 'Trans smi-transaction-filtered-in';
      result.type = 'tr';
    }


    // add links in memo
    var memoTd = result.props.children[2];
    var textChildren = memoTd.props.children;
    var memo = textChildren.props.text;
    delete textChildren.props.text;
    textChildren.type = 'span';
    textChildren.props.dangerouslySetInnerHTML = {
      __html: makeMemoHtml(memo)
    };

    return result;
  }

  function setupTransferHistoryRowRender(txTr) {
    if(renderChanged){
      return;
    }

    if(!txTr.length) {
      return;
    }


    var transReact = window.SteemPlus.Utils.findReact(txTr[0]);
    oldTransferHistoryRowRender = transReact.__proto__.render;
    transReact.__proto__.render = newTransferHistoryRowRender;

    textr.each(function() {
      var r = window.SteemPlus.Utils.findReact(this);
      r.render = newTransferHistoryRowRender;
      r.forceUpdate();
    });

    renderChanged = true;

  }


  function _updateRows() {
    var txTr = $('.UserWallet table .Trans');
    txTr.each(function() {
      var r = window.SteemPlus.Utils.findReact(this);
      r.forceUpdate();
    });
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
        <span>Min amount: ' + asset + '</span>\
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
      </div>\
      <div class="smi-transaction-table-filters-search">' +
      createSearchWalletUI() +
      '</div>\
    </div>');

    filters.find('.smi-transaction-table-type-filter input').on('change', function() {
      var $this = $(this);
      var hidden = $this.prop("checked") ? false : true;
      setTypeFilterHidden($this.val(), hidden);
      updateRows()
    });
    filters.find('.smi-transaction-table-asset-value-filter input').on('input', function() {
      var $this = $(this);
      var asset = $this.data('asset');
      var value = $this.val();
      setMinAmountForAsset(asset, value);
      updateRows()
    });
    filters.find('.smi-transaction-table-search-filter input').on('input', function() {
      var $this = $(this);
      var value = $this.val();
      setSearchValue(value);
      updateRows()
    });

    table.before(filters);
  }


  function setupFilters() {

    // var tableRows = $('.UserWallet table .Trans');
    var tableRows = document.getElementsByClassName('Trans');
    console.log(tableRows); 
    if(!tableRows.length){
      if(walletRegexp.test(window.location.pathname)){
        setTimeout(function() {
          setupFilters();
        }, 100);
      }
      return;
    }

    setupTransferHistoryRowRender(tableRows);
    setupFiltersUI(tableRows.closest('table'));
  }

  
