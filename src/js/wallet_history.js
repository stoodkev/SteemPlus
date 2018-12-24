var token_wallet_history = null;

var totalVestsWalletHistory = null;
var totalSteemWalletHistory = null;

var accountWH = null;
var memoKeyWH = null;
var usernameWalletHistory = null;
var dataWalletHistory = null;
var retry = 0;
var modalWH = null;

const NB_BLOCK_PER_SECOND = 3;

// Available filter types
var typeFiltersListWH = [{
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
        type: 'power_up',
        text: 'Power Up'
    },
    {
        type: 'power_down',
        text: 'Power Down'
    },
    {
        type: 'hide_spam',
        text: 'Hide Spam'
    }
];


var filtersStateWH = {
    types: {
        'hide_spam': false,
        'transfer_to': true,
        'transfer_from': true,
        'power_up': true,
        'power_down': true,
        'claim': true
    },
    search: '',
    minAsset: {
        SP: 0,
        STEEM: 0,
        SBD: 0
    }
};

function typeFilterHiddenWH(type) {
    saveFilters();
    return filtersStateWH.types[type] || false;
}

function setTypeFilterHiddenWH(type, value) {
    saveFilters();
    filtersStateWH.types[type] = value;
}

function searchValueWH() {
    saveFilters();
    return filtersStateWH.search || '';
}

function setSearchValueWH(val) {
    saveFilters();
    filtersStateWH.search = val || '';
}

function minAmountForAssetWH(asset) {
    saveFilters();
    return parseFloat(filtersStateWH.minAsset[asset]) || 0;
}

function setMinAmountForAssetWH(asset, val) {
    saveFilters();
    filtersStateWH.minAsset[asset] = parseFloat(val) || 0;
}

function saveFilters() {
    chrome.storage.local.set({
        filters_state_wallet: filtersStateWH
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if (request.to == 'wallet_history') {
        retry = 0;
        if (request.order === 'start' && token_wallet_history == null) {
            token_wallet_history = request.token;
            totalVestsWalletHistory = request.data.totalVests;
            totalSteemWalletHistory = request.data.totalSteem;
            accountWH = request.data.account;
            memoKeyWH = request.data.walletHistoryMemoKey;

            if ($('.smi-transaction-table-filters').length === 0 && regexWalletSteemit.test(window.location.href))
                isSteemSQLSynchronized();
        }

        if (request.order === 'click' && token_wallet_history == request.token) {
            totalVestsWalletHistory = request.data.totalVests;
            totalSteemWalletHistory = request.data.totalSteem;
            accountWH = request.data.account;
            memoKeyWH = request.data.walletHistoryMemoKey;
            if ($('.smi-transaction-table-filters').length === 0 && regexWalletSteemit.test(window.location.href))
                isSteemSQLSynchronized();
        }
    }
});

function displayMessageSynchronisation(nbBlockDifference) {
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-full-width",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": 0,
        "extendedTimeOut": 0,
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut",
        "tapToDismiss": false
    };

    var nbMinutesDifference = ((nbBlockDifference * 3) / 60).toFixed(0);

    toastr.info('SteemSQL is out of synchronisation for more than ' + nbMinutesDifference + ' minutes (' + nbBlockDifference + ' blocks) </br>' +
        'You can decide to display Steemit wallet or Steemplus wallet. But some information might be missing</br></br>' +
        '<button class="btn btn-primary" id="steemit-wallet">Steemit Wallet</button> <button id="steemplus-wallet" class="btn btn-primary">Steemplus Wallet</button><input class="form-check-input" type="checkbox" value="" id="remember-checkbox"> Don\'t ask again', "Message from SteemPlus");

    $('#steemit-wallet').click(function() {
        chrome.storage.local.set({
            wallet_choice: "steemit-wallet",
            wallet_dont_ask: $('#remember-checkbox').eq(0).prop('checked'),
            wallet_date_remember: Date.now()
        });
        $(this).parent().parent().remove();
    });

    $('#steemplus-wallet').click(function() {
        chrome.storage.local.set({
            wallet_choice: "steemplus-wallet",
            wallet_dont_ask: $('#remember-checkbox').eq(0).prop('checked'),
            wallet_date_remember: Date.now()
        });
        $(this).parent().parent().remove();
        startWalletHistory();
    });
}

// Function used to start the wallet history
// Check if the page is ready and start. If not, wait and try again
function startWalletHistory() {
    chrome.storage.local.get(['filters_state_wallet'], function(items) {
        if (items.filters_state_wallet !== undefined) filtersStateWH = items.filters_state_wallet;
        if ($('.Trans').length > 0 && regexWalletSteemit.test(window.location.href)) {
            usernameWalletHistory = window.SteemPlus.Utils.getPageAccountName();
            window.SteemPlus.api.getWallet(window.SteemPlus.Utils.getPageAccountName()).then(function(result){
              dataWalletHistory = result;
              if ($('.smi-transaction-table-filters').length === 0)
                  displayWalletHistory();
            });
        } else {
            setTimeout(function() {
                if (retry <= 20) {
                    retry++;
                    startWalletHistory();
                }
            }, 1000);
        }
    });
}

//Function used to diplay the wallet when all the information is downloaded
function displayWalletHistory() {
    var tbodyWH = $('.Trans').parent();
    $('.Trans').hide();
    dataWalletHistory.forEach(function(itemWalletHistory, indexWH) {
        var trWH = $('<tr class="Trans-wallet-filter wh-type-' + itemWalletHistory.type + '" id="item' + indexWH + '"></tr>');
        var tdTimestampWH = $('<td><span title="' + new Date(itemWalletHistory.timestamp) + '">' + moment(new Date(itemWalletHistory.timestamp)).fromNow() + '</span></td>');
        trWH.append(tdTimestampWH);

        var textAmoutWH = '';
        if (itemWalletHistory.type === 'start_power_down')
        {
            var amountPowerDown = getSPFromVestingSharesWH(itemWalletHistory.reward_vests);
            textAmoutWH = 'Started power down of ' + amountPowerDown + ' SP';
        }
        else if (itemWalletHistory.type === 'stop_power_down')
        {
            textAmoutWH = 'Power down canceled';
        }
        else if (itemWalletHistory.type === 'power_up')
        {
            textAmoutWH = 'Powered up ' + itemWalletHistory.amount + ' ' + itemWalletHistory.amount_symbol;
        }
        else if (itemWalletHistory.type === 'claim')
        {
            var amountSP = getSPFromVestingSharesWH(itemWalletHistory.reward_vests);

            textAmoutWH = '';
            if (itemWalletHistory.reward_sbd > 0) textAmoutWH = itemWalletHistory.reward_sbd + ' SBD';
            if (amountSP > 0) textAmoutWH = textAmoutWH + (textAmoutWH === '' ? '' : ' and ') + amountSP + ' SP' + (itemWalletHistory.reward_steem > 0 ? ' and ' : '');
            if (itemWalletHistory.reward_steem > 0) textAmoutWH = textAmoutWH = textAmoutWH + itemWalletHistory.reward_steem + " STEEM";
            textAmoutWH = 'Claim Rewards : ' + textAmoutWH
        }
        else if (itemWalletHistory.type === 'transfer_to')
            textAmoutWH = itemWalletHistory.amount + ' ' + itemWalletHistory.amount_symbol + ' received from <a href="/@' + itemWalletHistory.to_from + '">@' + itemWalletHistory.to_from + '</a>';
        else if (itemWalletHistory.type === 'transfer_from')
            textAmoutWH = itemWalletHistory.amount + ' ' + itemWalletHistory.amount_symbol + ' sent to <a href="/@' + itemWalletHistory.to_from + '">@' + itemWalletHistory.to_from + '</a>';

        var tdAmountWH = $('<td class="TransferHistoryRow__text" style="max-width: 40rem;">' + textAmoutWH + '</td>');
        trWH.append(tdAmountWH);

        var tdMemo = null;
        if (itemWalletHistory.memo.startsWith('#') && usernameWalletHistory === accountWH.name) {
            if (memoKeyWH === '') {
                tdMemo = $('<td class="show-for-medium" style="max-width: 40rem; word-wrap: break-word;"><span class="Memo"><i>This is a private memo. Please click on \'Add Private Memo Key\' button above.</i></span></td>');
            } else {
                try {
                    var textMemo = window.decodeMemo(memoKeyWH, itemWalletHistory.memo);
                    tdMemo = $('<td class="show-for-medium" style="max-width: 40rem; word-wrap: break-word;"><span class="Memo"><i>' + escapeHtml(textMemo.slice(1, textMemo.length)) + '</i></span></td>');
                } catch (err) {
                    tdMemo = $('<td class="show-for-medium" style="max-width: 40rem; word-wrap: break-word;"><span class="Memo"><i>Invalid memo...</i></span></td>');
                }
            }

        } else {
            if (itemWalletHistory.memo.startsWith('#'))
                tdMemo = $('<td class="show-for-medium" style="max-width: 40rem; word-wrap: break-word;"><span class="Memo"></span></td>');
            else
                tdMemo = $('<td class="show-for-medium" style="max-width: 40rem; word-wrap: break-word;"><span class="Memo"><safescript>' + escapeHtml(itemWalletHistory.memo) + '</safescript></span></td>');
        }

        trWH.append(tdMemo);
        tbodyWH.append(trWH);

    });

    createWalletHistoryFiltersUI();
}

var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

function escapeHtml (string) {
  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
    return entityMap[s];
  });
}

// Function used to create the wallet filter UI (buttons, inputs ...)
function createWalletHistoryFiltersUI() {

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
    console.log(usernameWalletHistory,accountWH.name);

    if (usernameWalletHistory == accountWH.name) {
        $('table').parent().find('.secondary').after($('<div class="inputAddMemoKey" style="margin-bottom: 20px;">\
			<input type="submit" id="displayModalWH" value="Add private memo key">\
			</div>'));

        $('#displayModalWH').click(function() {
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
                (memoKeyWH === '' ?
                    '<input type="password" id="addMemoKeyInput" name="memoKey" placeholder="Add your memo key here">' :
                    '<input type="password" id="addMemoKeyInput" name="memoKey" value="' + memoKeyWH + '">') +
                '<input type="submit" id="addMemoKeySubmit" value="' + (memoKeyWH === '' ? 'Add' : 'Update') + '">\
				' + (memoKeyWH === '' ? '' : '<input type="submit" id="removeMemoKeyButton" value="Remove">') + ' \
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

            modalWH.find('#removeMemoKeyButton').click(function() {
                chrome.storage.local.remove(["wallet_history_memo_key"], function() {
                    var error = chrome.runtime.lastError;
                    if (error) {
                        toastr.error(error, titleToastr);
                        console.error(error);
                    } else {
                        modalWH.remove();
                        toastr.success('Your private memo key has been successfully removed. You won\'t be able to read your private memos anymore.', titleToastr);
                        memoKeyWH = '';
                    }
                })
            });

            modalWH.find('#addMemoKeySubmit').click(function() {

                if (accountWH.memo_key === modalWH.find('#addMemoKeyInput')[0].value) {
                    toastr.error('You are trying to use your public memo key! Please use the private memo key instead.', titleToastr);
                } else {

                    try {
                        steem.auth.wifIsValid(modalWH.find('#addMemoKeyInput')[0].value, accountWH.memo_key);
                        chrome.storage.local.set({
                            wallet_history_memo_key: modalWH.find('#addMemoKeyInput')[0].value
                        });
                        memoKeyWH = modalWH.find('#addMemoKeyInput')[0].value;
                        toastr.success('Your private memo key has been successfully added. Please refresh the page to start reading your private memos.', titleToastr);
                        modalWH.remove();
                    } catch (err) {
                        toastr.error('This key is incorrect, please use your private memo key.', titleToastr);
                    }
                }
            });
        });
    }
    $('table').each(function() {
        if (!$(this).parent().parent().parent().hasClass('SavingsWithdrawHistory')) {
            $(this).parent().addClass('new-wallet');
            $(this).before(filters);
        }

    });


    typeFiltersListWH.map(function(f)  {
        $('input[value="' + f.type + '"').eq(0).prop('checked', filtersStateWH.types[f.type]);
    });

    $(filters).find('#inputSearchWalletHistory').unbind('input').on('input', function() {
        setSearchValueWH($(filters).find('#inputSearchWalletHistory')[0].value);
        updateTableWH();
    });

    $(filters).find('.type-filter-button').unbind('click').on('click', function() {
        if ($(this).parent().eq(0).hasClass('.input-type-filter-checked')) {
            //console.log('has class');
            $(this).parent().eq(0).addClass('input-type-filter-checked');
            $(this).parent().eq(0).removeClass('input-type-filter-unchecked');
        } else {
            //console.log('does not have class');
            $(this).parent().eq(0).removeClass('input-type-filter-checked');
            $(this).parent().eq(0).addClass('input-type-filter-unchecked');
        }
        setTypeFilterHiddenWH($(this)[0].value, $(this).prop('checked'));
        updateTableWH();
    });

    $(filters).find('.inputMinFilterWalletHistory').unbind('input').on('input', function() {
        setMinAmountForAssetWH($(this).data('asset'), $(this)[0].value);
        updateTableWH();
    });

    updateTableWH();
}

// Function used to create one filter button
// Use the map created at the beginning
function createTypeFiltersUIWH() {
    return '<label><span>Filter by type: </span></label>' +
        typeFiltersListWH.map(function(f)  {
            return elem = '<div class="smi-transaction-table-type-filter walletHistoryFilters">\
		<label class="input-type-filter-' + (typeFilterHiddenWH(f.type) ? 'checked' : 'unchecked') + '">\
		<input type="checkbox" value="' + f.type + '" class="type-filter-button" checked="' + (typeFilterHiddenWH(f.type)) + '"><span' + (f.type === 'spam' ? ' title="Hide 0.001 SBD/STEEM transactions" ' : '') + '>' + f.text + '</span>\
		</label>\
		</div>';
        }).join('');
}

// Function used to create the search bar
function createSearchUIWH() {
    return '<div class="smi-transaction-table-search-filter">\
	<label>\
	<span>Search:</span>\
	<input id="inputSearchWalletHistory" type="text" value="' + searchValueWH() + '">\
	</label>\
	</div>';
}

// Function used to create the first asset filter.
// @parameter asset : name of the asset (SBD, STEEM, SP)
function createMinAssetUIWH(asset) {
    return '<div class="smi-transaction-table-asset-value-filter">\
	<label>\
	<span>Min amounts</span>\
	<input class="inputMinFilterWalletHistory" type="number" placeholder="' + asset + '" value="' + (minAmountForAssetWH(asset) === 0 ? '' : minAmountForAssetWH(asset)) + '" lang="en-150" step="0.001" min="0" data-asset="' + asset + '">\
	</label>\
	</div>';
}

// Function used to create other asset filter. For this one, there is no label
// @parameter asset : name of the asset (SBD, STEEM, SP)
function createMinAssetUIWH2(asset) {
    return '<div class="smi-transaction-table-asset-value-filter">\
	<label>\
	<input class="inputMinFilterWalletHistory" type="number" placeholder="' + asset + '" value="' + (minAmountForAssetWH(asset) === 0 ? '' : minAmountForAssetWH(asset)) + '" lang="en-150" step="0.001" min="0" data-asset="' + asset + '">\
	</label>\
	</div>';
}

// Function used to update the view by hiding all the rows which doesn't match with the filterState
function updateTableWH() {
    dataWalletHistory.forEach(function(row, index) {
        // Search Bar filter
        if (!row.memo.includes(searchValueWH()) && !row.to_from.includes(searchValueWH()) && searchValueWH() !== '') {
            $('#item' + index).hide();
            return;
        }

        // Type filter
        var filterTypesWH = filtersStateWH.types;
        for (filterTypeWH in filterTypesWH) {
            if (!filterTypesWH[filterTypeWH]) {

                if (row.type === filterTypeWH) {
                    $('#item' + index).hide();
                    return;
                }
            }
            // If hide spam activated, hide all the line with 0.001 value. Those one are considered as spam
            if (filterTypeWH === 'hide_spam' && filterTypesWH[filterTypeWH]) {
                if (row.amount === 0.001 || row.reward_sbd === 0.001 || row.reward_steem === 0.001) {
                    $('#item' + index).hide();
                    return;
                }
            }

            // If type is power_down (start or stop)
            if(filterTypeWH === 'power_down' && !filterTypesWH[filterTypeWH] && (row.type === 'start_power_down' || row.type === 'stop_power_down'))
            {
                $('#item' + index).hide();
                return;
            }
        }

        // Filter on values
        var valueLine = {};
        valueLine['SP'] = (row.reward_vests === 0 ? -1 : parseFloat(getSPFromVestingSharesWH(row.reward_vests)));

        if (row.type === 'transfer_from' || row.type === 'transfer_to' || row.type === 'power_up')
        {
            if (row.amount_symbol === 'SBD') {
                valueLine['SBD'] = row.amount;
                valueLine['STEEM'] = -1;
            } else {
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
        if(row.type === 'start_power_down')
        {
          /*  console.log(valueLine, row);
            console.log(row.type === "start_power_down", valueLine['STEEM'], minAmountForAssetWH('STEEM'), valueLine['SBD'], minAmountForAssetWH('SBD'), valueLine['SP'], minAmountForAssetWH('SP'));
            console.log(row.type !== "stop_power_down", valueLine['STEEM'] < minAmountForAssetWH('STEEM'), valueLine['SBD'] < minAmountForAssetWH('SBD'), valueLine['SP'] < minAmountForAssetWH('SP'));*/
        }
        if (row.type !== "stop_power_down" && valueLine['STEEM'] < minAmountForAssetWH('STEEM') && valueLine['SBD'] < minAmountForAssetWH('SBD') && valueLine['SP'] < minAmountForAssetWH('SP')) {
            $('#item' + index).hide();
            return;
        }
        $('#item' + index).show();
    });
}

// Display the SP from vesting shares.
function getSPFromVestingSharesWH(vests) {
    return steem.formatter.vestToSteem(parseFloat(vests), totalVestsWalletHistory, totalSteemWalletHistory).toFixed(3);
}

// Function used to determine if SteemSQL is synchronized
function isSteemSQLSynchronized() {
    Promise.all([steem.api.getDynamicGlobalPropertiesAsync(), window.SteemPlus.api.getLastBlockID()])
        .then(function(value) {
            var nbBlockDifference = parseInt(value[0].last_irreversible_block_num) - parseInt(value[1]);

            // 60 blocks difference means 3 minutes.
            if (nbBlockDifference < 60)
                startWalletHistory();
            else {
                chrome.storage.local.get(['wallet_choice', 'wallet_date_remember', 'wallet_dont_ask'], function(items) {
                    if (items.wallet_dont_ask !== undefined) {
                        if (!items.wallet_dont_ask) {
                            if (date_diff_indays(items.wallet_date_remember, Date.now()) >= 1) {
                                displayMessageSynchronisation(nbBlockDifference);
                            }
                            else
                                displayMessageSynchronisation(nbBlockDifference);
                        } else {
                            if (items.wallet_choice === 'steemplus-wallet')
                                startWalletHistory();
                        }
                    } else {
                        displayMessageSynchronisation(nbBlockDifference);
                    }
                });
            }
        });
}
