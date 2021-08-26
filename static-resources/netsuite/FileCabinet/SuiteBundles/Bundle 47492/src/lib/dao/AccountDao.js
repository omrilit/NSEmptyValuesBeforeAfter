/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }


TAF.AccountDao = function _AccountDao() {
    var object_cache = {};
    var account_id_cache = [];
    var context = nlapiGetContext();
    var is_one_world = context.getSetting('FEATURE', 'SUBSIDIARIES') === 'T';
    var has_account_numbering = nlapiLoadConfiguration('accountingpreferences').getFieldValue('ACCOUNTNUMBERS') == 'T';
    var MAX_RESULTS = 1000;
    var includeSCOA = true;
    var hasAccountingContext = parseFloat(context.version) >= 2017.1;
    var periodIds = null;
    var bookId = null;
    var _params = null;
	var MEXICO_LOCALIZATION_BUNDLE = "cd476cab-e846-474e-9f11-e213e69c420b";
    var hasMXLocalization = SFC.Registry.IsInstalled(MEXICO_LOCALIZATION_BUNDLE);
    var bankNumberField = (hasMXLocalization)? 'custrecord_mx_bank_account_number':'custrecord_acct_bank_account_number';
	
    
    this.getList = _GetList;
    this.update = _Update;
	this.havingTransaction = _HavingTransaction;//added as part of user story 342(including summary account in PT-SAFT GeneralLedgerAccounts)
    
    
    function _GetList(filters, pIncludeSCOA, params) {
    	if (typeof(pIncludeSCOA) != 'undefined') {
    		includeSCOA = pIncludeSCOA;
    	}
    	
        if (typeof(params) != 'undefined') {
            _params = params;
            if (typeof(params.periodIds) != 'undefined') {
                periodIds = params.periodIds;
            }
    
            if (typeof(params.bookId) != 'undefined') {
                bookId = params.bookId;
            } 
        }        
    	
        populateCache(filters);
        return object_cache;
    }
    
    
    function populateCache(filters) {
        getAccounts(filters);
        if (is_one_world && includeSCOA) { 
			getStatutoryCOA(filters); 
		}
    }
    
    
    function getAccounts(filters) {
    	try {
            var columns = [
                new nlobjSearchColumn('displayname'),
                new nlobjSearchColumn('type'),
                new nlobjSearchColumn('description'),
                new nlobjSearchColumn('isinactive'),
              	new nlobjSearchColumn('issummary'),
                new nlobjSearchColumn(bankNumberField)
            ];
            
            if (is_one_world) {
                columns.push(new nlobjSearchColumn('subsidiary'));
            }
            
            if (hasAccountingContext) {
                columns.push(new nlobjSearchColumn('localizeddisplayname'));

                if(has_account_numbering) {
                    columns.push(new nlobjSearchColumn('localizednumber').setSort());
                }
                
                if(filters.hasOwnProperty('accountingcontext')) {
                    filters.accountingcontext[1] = filters.accountingcontext[1] || '@NONE@'; 
                    
                    var language = context.getPreference('LANGUAGE');
                    var srchFilter = [ new nlobjSearchFilter('locale', null, 'is', language) ];
                    var rs = nlapiSearchRecord('account', null, srchFilter,null);
                    if(!rs) {
                        language = '@NONE@';
                    }
                    filters.locale = ['is',language];
                }
            } else if(!hasAccountingContext) {
                delete filters.accountingcontext;
            }

            if (has_account_numbering) {
                columns.push(new nlobjSearchColumn('number').setSort());
            }

            columns.push(new nlobjSearchColumn('internalid').setSort());
            
            var _filters = [];
            
            for (var key in filters) {
                _filters.push(new nlobjSearchFilter(key, null, filters[key][0], filters[key][1]));
            }
            
            var search = nlapiCreateSearch('account', _filters, columns);
            var resultSet = search.runSearch();
            var index = 0;
		 
            do {
                var accounts = resultSet.getResults(index, index + MAX_RESULTS);
                for (var i = 0; accounts && i < accounts.length; i++) {
                    account_id_cache.push(accounts[i].getId());					
                     if(_params != null && accounts[i].getValue('isinactive') == 'T' && accounts[i].getValue('issummary') == 'F') {
						var havingTransactions = _HavingTransaction(accounts[i].getId(), filters);
						if(havingTransactions) {
							object_cache[accounts[i].getId()] = convertRowToObject(accounts[i]);
						}
					} else {
                        object_cache[accounts[i].getId()] = convertRowToObject(accounts[i]);
                    }
                }
                index += MAX_RESULTS;
            } while (accounts && accounts.length >= MAX_RESULTS);
        } catch (ex) {
            nlapiLogExecution('ERROR', 'TAF.AccountDao.getAccounts', ex.toString());
        }
    }
    
    
    function getStatutoryCOA(filters) {
        try {
            var columns = [
                new nlobjSearchColumn('custrecord_scoa_account'),
                new nlobjSearchColumn('custrecord_scoa_subsidiary'),
                new nlobjSearchColumn('custrecord_scoa_number'),
                new nlobjSearchColumn('custrecord_scoa_name')
            ];
            
            var filter = [];
            if (account_id_cache.length > 0) {
                filter.push(new nlobjSearchFilter('custrecord_scoa_account', null, 'anyof', account_id_cache));
				if (filters.subsidiary) {
					filter.push(new nlobjSearchFilter('custrecord_scoa_subsidiary', null, 'is', filters.subsidiary));
                }
                var search = nlapiCreateSearch('customrecord_statutory_coa', filter, columns);
                var resultSet = search.runSearch();
                var index = 0;
                do {
                   var statutory_coa = resultSet.getResults(index, index + MAX_RESULTS);
                   for (var i = 0; statutory_coa && i < statutory_coa.length; i++) {
                        var account = object_cache[statutory_coa[i].getValue('custrecord_scoa_account')];
                        account.setSCOAId(statutory_coa[i].getId());
                        account.setSCOAName(statutory_coa[i].getValue('custrecord_scoa_name'));
                        account.setSCOANumber(statutory_coa[i].getValue('custrecord_scoa_number'));
                    }
                   index += MAX_RESULTS;
                } while (statutory_coa && statutory_coa.length >= MAX_RESULTS);
            }
        } catch (ex) {
            nlapiLogExecution('ERROR', 'TAF.AccountDao.getStatutoryCOA', ex.toString());
        }
    }
    
    
    function convertRowToObject(row) {
        var object = new TAF.Account(row.getId());
        
        object.isOneWorld(is_one_world);
        object.setAccountName(row.getValue('displayname'));
        object.setType(row.getValue('type'));
        object.setDescription(row.getValue('description'));
        object.setBankNumber(row.getValue(bankNumberField));
        if(hasAccountingContext) {
            object.setLocalizedName(row.getValue('localizeddisplayname').trim());
        }
        
        if (has_account_numbering) {
            object.setAccountNumber(row.getValue('number'));
            if(hasAccountingContext) {
                object.setLocalizedNumber(row.getValue('localizednumber'));
            }
        }
        
        if (is_one_world) {
            object.setSubsidiary(row.getValue('subsidiary'));
        }
        
        return object;
    }
    
    
    function _Update(accounts) {
        var message = {
            result: 'pass',
            details: 'SCOA_SAVE_CONFIRMATION_MESSAGE'
        };
        
        try {
            var record = {};
            var scoa_id = '';
            
            for (var account in accounts) {
                scoa_id = accounts[account].getSCOAId();
                if (scoa_id) {
                    record = nlapiLoadRecord('customrecord_statutory_coa', scoa_id);
                    
                    if (accounts[account].getSCOAName() || accounts[account].getSCOANumber()) {
                        record.setFieldValue('custrecord_scoa_name', accounts[account].getSCOAName());
                        record.setFieldValue('custrecord_scoa_number', accounts[account].getSCOANumber());
                        
                        nlapiSubmitRecord(record);
                    } else {
                        nlapiDeleteRecord('customrecord_statutory_coa', scoa_id);
                    }
                } else if (accounts[account].getSCOAName() || accounts[account].getSCOANumber()) {
                    record = nlapiCreateRecord('customrecord_statutory_coa');
                    
                    record.setFieldValue('custrecord_scoa_account', accounts[account].getAccountId());
                    record.setFieldValue('custrecord_scoa_subsidiary', accounts[account].getSubsidiary());
                    record.setFieldValue('custrecord_scoa_name', accounts[account].getSCOAName());
                    record.setFieldValue('custrecord_scoa_number', accounts[account].getSCOANumber());
                    
                    nlapiSubmitRecord(record);
                }
            }
            
            return message;
        } catch(e) {
            message = {
                result: 'fail',
                details: 'SCOA_SAVE_ERROR_MESSAGE'
            };
            
            var errorMsg = e.getCode ? e.getCode() + ': ' + e.getDetails() : 'Error: ' + (e.message ? e.message : e);
            
            return message;
        }
    }
	
  /*Funtion Name	: _HavingTransaction
		``Input			: This function take input as account id of the parent account.
          Returns		: This function returns true if account is having any transaction otherwise false.
         */
  function _HavingTransaction(accountNumber,filters) {	
        try {
            var column = [ 
                new nlobjSearchColumn('internalid')
            ];
            var acctnum = accountNumber;
            var filter = [
                new nlobjSearchFilter('account', null, 'anyof', acctnum),
                new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', periodIds)
            ];
            var multiBookJoinColumn = null;
            var isMultiBook = context.getFeature('MULTIBOOK');

            if (isMultiBook && bookId) {
                multiBookJoinColumn = 'accountingtransaction';
                filter.push(new nlobjSearchFilter('accountingbook', multiBookJoinColumn, 'is', bookId));
            }
            filter.push(new nlobjSearchFilter('posting', multiBookJoinColumn, 'is', 'T'));
                        
            if (is_one_world) {
                filter.push(new nlobjSearchFilter('subsidiary', null, filters['subsidiary'][0], filters['subsidiary'][1]));
            }
            var search_res = nlapiCreateSearch('transaction', filter, column);
            var result_Set = search_res.runSearch();
            var transactions = result_Set.getResults(0, 1);
            if(transactions != null && transactions.length > 0) {
                return true;
            } else {
                return false;
            }       
        } catch (ex) {
            nlapiLogExecution('ERROR', 'TAF.AccountDao._havingTransaction', ex.toString());
        }    
    }
};


TAF.DAO = TAF.DAO || {};
TAF.DAO.AccountDao = TAF.AccountDao;