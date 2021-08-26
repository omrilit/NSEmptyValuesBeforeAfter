/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.SCOA = TAF.SCOA || {};

TAF.SCOA.Adaptor = function() {
	this.toDataView = _ToDataView;
	this.toAccounts = _ToAccounts;
	
	function _ToDataView(raw_data) {
		var data_view = {account_types:{}, accounts:{}};
		
		if (raw_data.subsidiaries) {
		    data_view.subsidiaries = {};
		    
			for (var sub in raw_data.subsidiaries) {
				data_view.subsidiaries[sub] = {name:raw_data.subsidiaries[sub].getName()};
			}
			
			data_view.subsidiaries[raw_data.selected_subsidiary] ? 
			    data_view.subsidiaries[raw_data.selected_subsidiary].is_selected = true : 
		        data_view.subsidiaries[Object.keys(raw_data.subsidiaries)[0]].is_selected = true;
		}
		
		if (raw_data.account_types) {
			for (var type in raw_data.account_types) {
				data_view.account_types[type] = {name:raw_data.account_types[type].getName()};
			}
			
			if (data_view.account_types[raw_data.selected_account_type]) {
			    data_view.account_types[raw_data.selected_account_type].is_selected = true;
			} 
		}
		
		if (raw_data.accounts) {
			for (var account in raw_data.accounts) {
			    data_view.accounts[account] = {
			        account:account,
					account_name:raw_data.accounts[account].getAccountName(),
					scoa_id:raw_data.accounts[account].getSCOAId(),
					scoa_name:raw_data.accounts[account].getSCOAName(),
					scoa_number:raw_data.accounts[account].getSCOANumber()
				};
			}
		}
		
		data_view.mode = raw_data.mode;
		data_view.message = raw_data.message;
		
		return data_view;
	}
	
	function _ToAccounts(data_view) {
		var accounts = {};
		for (var id in data_view) {
			var account = new TAF.Account(id);
			account.setSCOAId(data_view[id].scoa_id);
			account.setSCOAName(data_view[id].scoa_name);
			account.setSCOANumber(data_view[id].scoa_number);
			account.setSubsidiary(data_view[id].subsidiary);
			accounts[id] = account;
		}
		return accounts;
	}
};