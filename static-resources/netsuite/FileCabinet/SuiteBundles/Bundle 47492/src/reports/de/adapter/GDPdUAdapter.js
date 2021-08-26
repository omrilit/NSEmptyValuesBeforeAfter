/**
 * Copyright © 2015, 2017, 2019, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.DE = TAF.DE || {};
TAF.DE.Adapter = TAF.DE.Adapter || {};

// START - GL Adapter
TAF.DE.Adapter.GeneralLedger = function _GeneralLedger() {
	return {
		accountNumber: '',
		accountDescription: '',
		transactionType: '',
		documentDate: '',
		documentNumber: '',
		description: '',
		debitAmount: 0,
		creditAmount: 0
	};
};

TAF.DE.Adapter.GLAdapter = function _GLAdapter(accounts) {
	this.accounts = accounts;
};

TAF.DE.Adapter.GLAdapter.prototype.getGeneralLedger = function _getGeneralLedger(glLine) {
	if (!glLine) {
		throw nlapiCreateError('DATA_ERROR', 'TAF.DE.Adapter.GeneralLedgerAdapter.getGeneralLedger: Parameter is invalid');
	}
	
	var generalLedger = null;
	
	if (glLine.posting === 'T') {
		generalLedger = new TAF.DE.Adapter.GeneralLedger();
		try {
			generalLedger.accountNumber = this.accounts[glLine.accountId].localizedNumber || this.accounts[glLine.accountId].accountNumber || glLine.accountId;
			generalLedger.accountDescription = this.getAccountDescription(this.accounts[glLine.accountId].accountDescription,
			        this.accounts[glLine.accountId].localizedNumber || this.accounts[glLine.accountId].accountNumber,
			        this.accounts[glLine.accountId].localizedName  || this.accounts[glLine.accountId].name);
			generalLedger.transactionType = glLine.type;
			generalLedger.documentDate = glLine.date;
			generalLedger.documentNumber = glLine.number || glLine.id;
			generalLedger.description = glLine.memo;
			generalLedger.debitAmount = glLine.debitAmount;
			generalLedger.creditAmount = glLine.creditAmount;
		} catch (ex) {
			nlapiLogExecution('ERROR', 'TAF.DE.Adapter.GeneralLedgerAdapter.getGeneralLedger', ex.toString());
			throw nlapiCreateError('DATA_ERROR', 'TAF.DE.Adapter.GeneralLedgerAdapter.getGeneralLedger');
		}
	}
	
	return generalLedger;
};

TAF.DE.Adapter.GLAdapter.prototype.getAccountDescription = function _getAccountDescription(accountDescription, accountNumber, accountName) {
	var description = accountDescription;
	
	if (!accountNumber)
		accountNumber = '';
	
	if (!accountName)
		accountName = '';
	
	if (!description) {
		if(accountNumber != ''){
			var re = accountNumber + ' ';
			description = accountName.replace(re, '');
		}
		else {
			description = accountName;
		}
	}
	
	return description;
};
// END - GL Adapter

// START - AP Adapter
TAF.DE.Adapter.AccountsPayable = function _AccountsPayable() {
	return {
		openingBalance: 0,
		type: '',
		internalId: '',
		entityId: '',
		companyName: '',
		tranDate: '',
		referenceNumber: '',
		memo: '',
		debitAmount: 0,
		creditAmount: 0
	};
};

TAF.DE.Adapter.APAdapter = function _APAdapter(openingBalance) {
	this.openingBalance = openingBalance;
};

TAF.DE.Adapter.APAdapter.prototype.addOpeningBalanceTotal = function _addOpeningBalanceTotal(periodOpeningBalance) {
	this.openingBalance += periodOpeningBalance;
};

TAF.DE.Adapter.APAdapter.prototype.getOpeningBalanceTotal = function _getOpeningBalanceTotal() {
	return this.openingBalance;
};

TAF.DE.Adapter.APAdapter.prototype.getAccountsPayable = function _getAccountsPayable(apLine) {
	if (!apLine) {
		throw nlapiCreateError('DATA_ERROR', 'TAF.DE.Adapter.APAdapter.getAccountsPayable: Parameter is invalid');
	}

	if (apLine.posting === 'F') {
		return;
	}

	var accountsPayable = new TAF.DE.Adapter.AccountsPayable();
	var params = {
		number: apLine.number,
		id: apLine.id,
		isExpenseReport: apLine.type == 'ExpRept' || apLine.type == 'Expense Report',
		vendorEntityId: apLine.vendorEntityId,
		vendorIsPerson: apLine.vendorIsPerson == 'T',
		vendorFirstName: apLine.vendorFirstName,
		vendorLastName: apLine.vendorLastName,
		vendorCompanyName: apLine.vendorCompanyName,
		employeeEntityId: apLine.employeeEntityId,
		employeeFirstName: apLine.employeeFirstName,
		employeeLastName: apLine.employeeLastName
	};
	
	try {
		accountsPayable.openingBalance = Math.abs(this.openingBalance);
		accountsPayable.type = apLine.type;
		accountsPayable.internalId = apLine.id;
		accountsPayable.entityId = this.getEntityId(params);
		accountsPayable.companyName = this.getCompanyName(params);
		accountsPayable.tranDate = apLine.date;
		accountsPayable.referenceNumber = this.getReferenceNumber(params);
		accountsPayable.memo = apLine.memo;
		accountsPayable.debitAmount = apLine.debitAmount;
		accountsPayable.creditAmount = apLine.creditAmount;
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.DE.Adapter.APAdapter.getAccountsPayable', ex.toString());
		throw nlapiCreateError('DATA_ERROR', 'TAF.DE.Adapter.APAdapter.getAccountsPayable');
	}
	
	return accountsPayable;
};

TAF.DE.Adapter.APAdapter.prototype.getEntityId = function _getEntityId(params) {
	return !params.isExpenseReport ? params.vendorEntityId : params.employeeEntityId;
};

TAF.DE.Adapter.APAdapter.prototype.getCompanyName = function _getCompanyName(params) {
	var companyName = '';
	
	if (!params.isExpenseReport) {
		if (params.vendorIsPerson) {
			companyName = params.vendorFirstName + ' ' + params.vendorLastName;
		}
		else {
			companyName = params.vendorCompanyName;
		}
	}
	else {
		companyName = params.employeeFirstName + ' ' + params.employeeLastName;
	}
	
	return companyName;
};

TAF.DE.Adapter.APAdapter.prototype.getReferenceNumber = function _getReferenceNumber(params) {
	return params.number == '' ? params.id : params.number;
};
// END - AP Adapter

// START - AR Adapter
TAF.DE.Adapter.AccountsReceivable = function _AccountsReceivable() {
	return {
		openingBalance: 0,
		type: '',
		internalId: '',
		entityId: '',
		companyName: '',
		tranDate: '',
		referenceNumber: '',
		memo: '',
		debitAmount: 0,
		creditAmount: 0
	};
};

TAF.DE.Adapter.ARAdapter = function _ARAdapter(openingBalance) {
	this.openingBalance = openingBalance;
};

TAF.DE.Adapter.ARAdapter.prototype.addOpeningBalanceTotal = function _addOpeningBalanceTotal(periodOpeningBalance) {
	this.openingBalance += periodOpeningBalance;
};

TAF.DE.Adapter.ARAdapter.prototype.getOpeningBalanceTotal = function _getOpeningBalanceTotal() {
	return this.openingBalance;
};

TAF.DE.Adapter.ARAdapter.prototype.getAccountsReceivable = function _getAccountsReceivable(arLine) {
	if (!arLine) {
		throw nlapiCreateError('DATA_ERROR', 'TAF.DE.Adapter.ARAdapter.getAccountsReceivable: Parameter is invalid');
	}
	
	var accountsReceivable = new TAF.DE.Adapter.AccountsReceivable();
	var params = {
		number: arLine.number,
		id: arLine.id,
		customerIsPerson: arLine.customerIsPerson == 'T',
		customerFirstName: arLine.customerFirstName,
		customerLastName: arLine.customerLastName,
		customerCompanyName: arLine.customerCompanyName
	};
	
	try {
		accountsReceivable.openingBalance = Math.abs(this.openingBalance);
		accountsReceivable.type = arLine.type;
		accountsReceivable.internalId = arLine.id;
		accountsReceivable.entityId = arLine.customerEntityId;
		accountsReceivable.companyName = this.getCompanyName(params);
		accountsReceivable.tranDate = arLine.date;
		accountsReceivable.referenceNumber = this.getReferenceNumber(params);
		accountsReceivable.memo = arLine.memo;
		accountsReceivable.debitAmount = arLine.debitAmount;
		accountsReceivable.creditAmount = arLine.creditAmount;
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.DE.Adapter.ARAdapter.getAccountsReceivable', ex.toString());
		throw nlapiCreateError('DATA_ERROR', 'TAF.DE.Adapter.ARAdapter.getAccountsReceivable');
	}
	
	return accountsReceivable;
};

TAF.DE.Adapter.ARAdapter.prototype.getCompanyName = function _getCompanyName(params) {
	var companyName = '';
	
	if (params.customerIsPerson) {
		companyName = params.customerFirstName + ' ' + params.customerLastName;
	}
	else {
		companyName = params.customerCompanyName;
	}
	
	return companyName;
};

TAF.DE.Adapter.ARAdapter.prototype.getReferenceNumber = function _getReferenceNumber(params) {
	return params.number == '' ? params.id : params.number;
};
// END - AR Adapter

// START - General Journal Adapter
TAF.DE.Adapter.GeneralJournal = function _GeneralJournal(id) {
	return {
		internalId: id,
		transactionType: '',
		date: '',
		postingPeriod: '',
		documentNumber: '',
		description: '',
		debitAccount: '',
		debitAmount: '',
		creditAccount: '',
		creditAmount: '',
		vatDebitAccount: '',
		vatDebitAmount: '',
		vatCreditAccount: '',
		vatCreditAmount: '',
		taxcode: '',
		currency: ''
	};
};

TAF.DE.Adapter.GeneralJournalAdapter = function _GeneralJournalAdapter(accounts, currencyCode) {
	this.accounts = accounts;
	this.currencyCode = currencyCode;
};

TAF.DE.Adapter.GeneralJournalAdapter.prototype.getGeneralJournal = function _getGeneralJournal(gjLine) {
	if (!gjLine) {
		throw nlapiCreateError('MISSING_PARAMETER', 'gjLine is required');
	}

	if (gjLine.posting === 'F') {
		return;
	}

	try {
		var isTaxLine = gjLine.taxline === 'T' ? true : false;
		var isDebit = (Number(gjLine.debitAmount) >= Number(gjLine.creditAmount)) ? true : false;
		var accountName = this.accounts[gjLine.accountId].localizedName || this.accounts[gjLine.accountId].name;
		var documentNumber = gjLine.number == '' ? gjLine.id : gjLine.number;
		var debitAccount = '';
		var creditAccount = '';

		if (isDebit) {
			debitAccount = accountName;
		} else {
			creditAccount = accountName;
		}

		var generalJournal = new TAF.DE.Adapter.GeneralJournal(gjLine.id);
		generalJournal.transactionType = gjLine.type;
		generalJournal.date = gjLine.date;
		generalJournal.postingPeriod = gjLine.period;
		generalJournal.documentNumber = documentNumber;
		generalJournal.description = gjLine.memo;

		if (isTaxLine) {
			generalJournal.vatDebitAccount = debitAccount;
			generalJournal.vatDebitAmount = gjLine.debitAmount;
			generalJournal.vatCreditAccount = creditAccount;
			generalJournal.vatCreditAmount = gjLine.creditAmount;
	        generalJournal.taxcode = gjLine.taxcode;
		} else {
			generalJournal.debitAccount = debitAccount;
			generalJournal.debitAmount = gjLine.debitAmount;
			generalJournal.creditAccount = creditAccount;
			generalJournal.creditAmount = gjLine.creditAmount;
		}
		
		generalJournal.currency = this.currencyCode || 'Euro';
		return generalJournal;
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.DE.Adapter.GeneralJournalAdapter.getGeneralJournal', ex.toString());
		throw nlapiCreateError('DATA_ERROR', 'TAF.DE.Adapter.GeneralJournalAdapter.getGeneralJournal');
	}
};
// END - General Journal Adapter

// START - Sums And Balances Adapter
TAF.DE.Adapter.SumsAndBalances = function _SumsAndBalances() {
    return {
        accountId: '',
        accountName: '',
        lastPostingDate: '',
        openingBalanceDebit: '',
        openingBalanceCredit: '',
        totalDebit: '',
        totalCredit: '',
        ytdDebit: '',
        ytdCredit: '',
        ytdBalanceDebit: '',
        ytdBalanceCredit: ''
    };
};

TAF.DE.Adapter.SumsAndBalancesAdapter = function _SumsAndBalancesAdapter() {
    this.indexMap = {
        lastPostingDate: 0,
        debitAmount: 1,
        creditAmount: 2,
        openingBalanceDebit: 3,
        openingBalanceCredit: 4
    };
};

TAF.DE.Adapter.SumsAndBalancesAdapter.prototype.getAccountSABMap = function _getAccountSABMap(daoLine, accountMap) {
    if (!daoLine) {
        throw nlapiCreateError('MISSING_PARAMETER', 'daoLine is required');
    }

    if (daoLine.posting === 'F') {
        return;
    }
    
    try {
        var debitAmountValue = daoLine.debitAmount == '' ? 0 : parseFloat(daoLine.debitAmount);
        var creditAmountValue = daoLine.creditAmount == '' ? 0 : parseFloat(daoLine.creditAmount);
        var sabMap = null;
    
        if (!accountMap) {
            sabMap = [ daoLine.lastPostingDate, debitAmountValue, creditAmountValue, 0, 0 ];
        } else {
            sabMap = accountMap;
            sabMap[this.indexMap.debitAmount] += debitAmountValue;
            sabMap[this.indexMap.creditAmount] += creditAmountValue;
            if (nlapiStringToDate(sabMap[this.indexMap.lastPostingDate]) < nlapiStringToDate(daoLine.lastPostingDate)) {
                sabMap[this.indexMap.lastPostingDate] = daoLine.lastPostingDate;
            }
        }
        
        return sabMap;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DE.Adapter.SumsAndBalancesAdapter.getAccountSABMap', ex.toString());
        throw nlapiCreateError('DATA_ERROR', 'TAF.DE.Adapter.SumsAndBalancesAdapter.getAccountSABMap');
    }
};

TAF.DE.Adapter.SumsAndBalancesAdapter.prototype.addOpeningBalances = function _addOpeningBalances(daoLine, accountMap) {
    if (!daoLine) {
        throw nlapiCreateError('MISSING_PARAMETER', 'daoLine is required');
    }

    if (daoLine.posting === 'F') {
        return;
    }
    
    try {
        var debitAmountValue = daoLine.debitAmount == '' ? 0 : parseFloat(daoLine.debitAmount);
        var creditAmountValue = daoLine.creditAmount == '' ? 0 : parseFloat(daoLine.creditAmount);
        var sabMap = null;
    
        if (!accountMap) {
        	sabMap = [ daoLine.lastPostingDate, 0, 0, 0, 0 ]; // create a new line in the Map since it does not exist yet
        } else {
            sabMap = accountMap;
            
            if (nlapiStringToDate(sabMap[this.indexMap.lastPostingDate]) < nlapiStringToDate(daoLine.lastPostingDate)) {
                sabMap[this.indexMap.lastPostingDate] = daoLine.lastPostingDate;
            }
        }
        
        sabMap[this.indexMap.openingBalanceDebit] += debitAmountValue;
        sabMap[this.indexMap.openingBalanceCredit] += creditAmountValue;
        return sabMap;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DE.Adapter.SumsAndBalancesAdapter.addOpeningBalances', ex.toString());
        throw nlapiCreateError('DATA_ERROR', 'TAF.DE.Adapter.SumsAndBalancesAdapter.addOpeningBalances');
    }
};

TAF.DE.Adapter.SumsAndBalancesAdapter.prototype.getSumsAndBalancesOfAccount = function _getSumsAndBalancesOfAccount(accountId, accountDetails, accountMap) {
    if (!accountId) {
        throw nlapiCreateError('MISSING_PARAMETER', 'accountId is required');
    }

    if (!accountDetails) {
        throw nlapiCreateError('MISSING_PARAMETER', 'accountDetails is required');
    }

    if (!accountMap) {
        throw nlapiCreateError('MISSING_PARAMETER', 'accountMap is required');
    }
    
    try {
        var sumsAndBalances = new TAF.DE.Adapter.SumsAndBalances();
        sumsAndBalances.accountNumber = this.getAccountNumber(accountDetails.localizedNumber || accountDetails.accountNumber, accountDetails.localizedName || accountDetails.name, accountId);
        sumsAndBalances.accountName = this.getAccountName(accountDetails.localizedNumber || accountDetails.accountNumber, accountDetails.localizedName || accountDetails.name);
        sumsAndBalances.lastPostingDate = accountMap[this.indexMap.lastPostingDate];
        sumsAndBalances.openingBalanceDebit = this.getOpeningBalanceDebit(accountMap);
        sumsAndBalances.openingBalanceCredit = this.getOpeningBalanceCredit(accountMap);
        sumsAndBalances.totalDebit = accountMap[this.indexMap.debitAmount];
        sumsAndBalances.totalCredit = accountMap[this.indexMap.creditAmount];
        sumsAndBalances.ytdDebit = this.getYtdDebit(sumsAndBalances.openingBalanceDebit, accountMap);
        sumsAndBalances.ytdCredit = this.getYtdCredit(sumsAndBalances.openingBalanceCredit, accountMap);
        sumsAndBalances.ytdBalanceDebit = this.getYtdBalanceDebit(sumsAndBalances.ytdDebit, sumsAndBalances.ytdCredit);
        sumsAndBalances.ytdBalanceCredit = this.getYtdBalanceCredit(sumsAndBalances.ytdDebit, sumsAndBalances.ytdCredit);
        return sumsAndBalances;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.DE.Adapter.SumsAndBalancesAdapter.getSumsAndBalancesOfAccount', ex.toString());
        throw nlapiCreateError('DATA_ERROR', 'TAF.DE.Adapter.SumsAndBalancesAdapter.getSumsAndBalancesOfAccount');
    }
};

TAF.DE.Adapter.SumsAndBalancesAdapter.prototype.getAccountNumber = function _getAccountNumber(accountNumber, accountName, accountId) {
    return accountNumber == '' || accountName.indexOf(accountNumber) == -1 ? accountId : accountNumber;
};

TAF.DE.Adapter.SumsAndBalancesAdapter.prototype.getAccountName = function _getAccountName(accountNumber, accountName) {
    return accountNumber ? accountName.replace(accountNumber + ' ', '') : accountName;
};

TAF.DE.Adapter.SumsAndBalancesAdapter.prototype.getOpeningBalanceDebit = function _getOpeningBalanceDebit(accountMap) {
    var debitValue = accountMap[this.indexMap.openingBalanceDebit];
    var creditValue = accountMap[this.indexMap.openingBalanceCredit];
    var amount = Math.abs(debitValue - creditValue);
    var isDebit = debitValue >= creditValue;
    return isDebit ? amount : 0;
};

TAF.DE.Adapter.SumsAndBalancesAdapter.prototype.getOpeningBalanceCredit = function _getOpeningBalanceCredit(accountMap) {
    var debitValue = accountMap[this.indexMap.openingBalanceDebit];
    var creditValue = accountMap[this.indexMap.openingBalanceCredit];
    var amount = Math.abs(debitValue - creditValue);
    var isDebit = debitValue >= creditValue;
    return isDebit ? 0 : amount;
};

TAF.DE.Adapter.SumsAndBalancesAdapter.prototype.getYtdDebit = function _getYtdDebit(openingBalanceDebit, accountMap) {
    return openingBalanceDebit + accountMap[this.indexMap.debitAmount];
};

TAF.DE.Adapter.SumsAndBalancesAdapter.prototype.getYtdCredit= function _getYtdCredit(openingBalanceCredit, accountMap) {
    return openingBalanceCredit + accountMap[this.indexMap.creditAmount];
};

TAF.DE.Adapter.SumsAndBalancesAdapter.prototype.getYtdBalanceDebit = function _getYtdBalanceDebit(ytdDebit, ytdCredit) {
    return ytdDebit >= ytdCredit ? Math.abs(ytdDebit - ytdCredit) : 0;
};

TAF.DE.Adapter.SumsAndBalancesAdapter.prototype.getYtdBalanceCredit = function _getYtdCredit(ytdDebit, ytdCredit) {
    return ytdDebit >= ytdCredit ? 0 : Math.abs(ytdDebit - ytdCredit);
};

TAF.DE.Adapter.SumsAndBalancesAdapter.prototype.sortAccountsByAccountNumber = function _sortAccountsByAccountNumber(accounts) {
    if (!accounts) {
        throw nlapiCreateError('MISSING_PARAMETER', 'accounts is required');
    }

    var list = [];

    for (var account in accounts) {
        list.push(accounts[account]);
    }
    list.sort(this.accountNumberSortFxn);
    
    var accountMap = list.reduce(function(map, account) {
        map[account.getAccountId()] = account;
        return map;
    }, {});

    return accountMap;
};

TAF.DE.Adapter.SumsAndBalancesAdapter.prototype.accountNumberSortFxn = function _accountNumberSortFxn(a, b) {
    var aAccountNumber = a.getAccountNumber();
    var aAccountName = a.getAccountName();
    var aValue = (aAccountNumber == '' || aAccountName.indexOf(aAccountNumber) == -1) ? a.getAccountId() + '' : aAccountNumber;
    var bAccountNumber = b.getAccountNumber();
    var bAccountName = b.getAccountName();
    var bValue = (bAccountNumber == '' || bAccountName.indexOf(bAccountNumber) == -1) ? b.getAccountId() + '' : bAccountNumber;

    if (aValue > bValue) {
        return 1;
    }
    if (aValue < bValue) {
        return -1;
    }
    return 0;
};
// END - Sums And Balances Adapter

TAF.DE.Adapter.AnnualVAT = function _AnnualVAT() {
	return {
		taxCode: '',
		description: '',
		total: 0
	};
};

TAF.DE.Adapter.AnnualVatAdapter = function _AnnualVatAdapter(taxcodesAmount) {
	this.taxcodesAmount = taxcodesAmount;
	this.netAmountTotal = new TAF.DE.Adapter.AnnualVAT();
	this.netAmountTotal.taxCode = '***';
	this.netAmountTotal.description = 'Net Amount';
};

TAF.DE.Adapter.AnnualVatAdapter.prototype.addTaxCodeAmount = function _addTaxCodeAmount(annualVATLine) {
	if (!annualVATLine) {
		throw nlapiCreateError('MISSING_PARAMETER', 'annualVATLine is required');
	}
	
	if (annualVATLine.posting === 'F') {
		return;
	}
	
	if (annualVATLine.taxLine === 'F' && annualVATLine.adjJournal !== 'T' ) {
		return;
	}
	
	try {
		var taxcodeid = annualVATLine.taxLine === 'T' ? annualVATLine.taxCodeId : annualVATLine.adjTaxCodeId;
		var amount = parseFloat(annualVATLine.creditAmount || 0) - parseFloat(annualVATLine.debitAmount || 0);
		
		if (!this.taxcodesAmount[taxcodeid]) {
			this.taxcodesAmount[taxcodeid] = {};
		}

		if (!this.taxcodesAmount[taxcodeid][annualVATLine.period]) {
			this.taxcodesAmount[taxcodeid][annualVATLine.period] = 0;
		}
		
		this.taxcodesAmount[taxcodeid][annualVATLine.period] += amount;
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.DE.Adapter.AnnualVatAdapter.addTaxCodeAmount', ex.toString());
		throw nlapiCreateError('DATA_ERROR', 'TAF.DE.Adapter.AnnualVatAdapter.addTaxCodeAmount');
	}
};

TAF.DE.Adapter.AnnualVatAdapter.prototype.getAnnualVat = function _getAnnualVat(params) {
	if (!params) {
		throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
	}
	
	if (!params.taxcodeObj) {
		throw nlapiCreateError('MISSING_PARAMETER', 'taxcodeObj is required');
	}
	
	if (!params.periodNames) {
		throw nlapiCreateError('MISSING_PARAMETER', 'periodNames is required');
	}
	
	if (!params.formattedPeriodNames) {
		throw nlapiCreateError('MISSING_PARAMETER', 'formattedPeriodNames is required');
	}
	
	if (!params.taxcodeAmount) {
		params.taxcodeAmount = {};
	}
	
	var annualVat = new TAF.DE.Adapter.AnnualVAT();
	var periodColumnName = '';
	var period = '';
	annualVat.taxCode = params.taxcodeObj.name;
	annualVat.description = params.taxcodeObj.description;
	
	for (var index=0; index < params.periodNames.length; index++) {
		period = params.periodNames[index];
		periodColumnName = params.formattedPeriodNames[index];
		annualVat[periodColumnName] = params.taxcodeAmount[period] || 0;
		annualVat.total += annualVat[periodColumnName];
		if (!this.netAmountTotal[periodColumnName]) {
			this.netAmountTotal[periodColumnName] = 0;
		}
		this.netAmountTotal[periodColumnName] += annualVat[periodColumnName];
	}
	
	this.netAmountTotal.total += annualVat.total;	
	return annualVat;
};

TAF.DE.Adapter.AnnualVatAdapter.prototype.getNetAmountTotal = function _getNetAmountTotal() {
	var stringColumns = ['taxCode', 'description'];
	for (var key in this.netAmountTotal) {
		if (stringColumns.indexOf(key) == -1) {
			this.netAmountTotal[key] = this.netAmountTotal[key] > 0 ? this.netAmountTotal[key] : 0;
		}
	}
	return this.netAmountTotal;
};

TAF.DE.Adapter.AnnualVatAdapter.prototype.getTaxCodesAmount = function _getTaxCodesAmount() {
	return this.taxcodesAmount;
};

TAF.DE.Adapter.Entity = function _Entity() {
    return {
        entityId: '', // Customer_ID or Vendor_ID
        accountDescription: '',
        companyName: '',
        streetAddress: '',
        postCode: '',
        location: '',
        country: '',
        vatRegistrationNumber: '',
        taxNumber: '',
    };
};

TAF.DE.Adapter.EntityAdapter = function _EntityAdapter() {
    this.NONE = '- None -';
};

TAF.DE.Adapter.EntityAdapter.prototype.getLine = function _getLine(rawLine) {
    if (!rawLine) {
        throw nlapiCreateError('MISSING_PARAMETER', 'rawLine is required');
    }

    var entityLine = new TAF.DE.Adapter.Entity();
    var companyName = rawLine.isIndividual === 'T' ?
            this.sanitizeString(rawLine.firstName) + ' ' + this.sanitizeString(rawLine.lastName) :
            this.sanitizeString(rawLine.companyName);
    var address2 = this.sanitizeString(rawLine.address2);

    entityLine.entityId = this.sanitizeString(rawLine.entityId);
    entityLine.accountDescription = 'Company Account: ' + companyName;
    entityLine.companyName = companyName;
    entityLine.streetAddress = this.sanitizeString(rawLine.address1) + (address2 ? ' ' + address2 : '');
    entityLine.postCode = this.sanitizeString(rawLine.zipCode);
    entityLine.location = this.sanitizeString(rawLine.city);
    entityLine.country = this.sanitizeString(rawLine.country);
    entityLine.vatRegistrationNumber = this.sanitizeString(rawLine.vatRegistrationNumber);
    entityLine.taxNumber = this.sanitizeString(rawLine.taxNumber);

    return entityLine;
};

TAF.DE.Adapter.EntityAdapter.prototype.isNone = function _isNone(val) {
    return !val || val === this.NONE;
};

TAF.DE.Adapter.EntityAdapter.prototype.sanitizeString = function _sanitizeString(text) {
    return (!text || text === this.NONE) ? '' : text;
};

