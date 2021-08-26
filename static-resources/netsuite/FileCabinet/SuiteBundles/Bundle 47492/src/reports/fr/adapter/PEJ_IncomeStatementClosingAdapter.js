/**
 * Copyright 2015, 2017, 2018, 2019, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.FR = TAF.FR || {};
TAF.FR.Adapter = TAF.FR.Adapter || {};

// START - PEJ SAFT Adapter
TAF.FR.Adapter.PEJSAFT = function _PEJSAFT() {
	return {
		journalCode: '',
		journalLib: '',
		ecritureNum: '',
		ecritureDate: '',
		compteNum: '',
		compteLib: '',
		pieceRef: '',
		pieceDate: '',
		ecritureLib: '',
		debit: 0,
		credit: 0,
		validDate: '',
		montantDevise: '',
		iDevise:'',
        compAuxNum: '',
        compAuxLib: '',
        ecritureLet: '',
        dateLet: '',
        establishmentCode: ''
	};
};


// Initialization of PEJIncomeStatementClosing Adapter
TAF.FR.Adapter.PEJIncomeStatementClosingAdapter = function _PEJIncomeStatementClosingAdapter(params) {
	this.defaultCurrency = params.currency;
    this.isGLSupported = false;
    this.isSubAccountEnabled = params.isSubAccountEnabled;
    this.accountsMap = params.accountsMap;
    this.txnSequenceNo = 0;
    this.lastInternalId = -1;
    this.resource = params.resource;
    this.accountingBook = params.accountingBook;
    this.usesAccountingContext = params.usesAccountingContext;
    this.usePostingDate = params.usePostingDate;
};

//Getting SAFT Line
TAF.FR.Adapter.PEJIncomeStatementClosingAdapter.prototype.getSAFTLine = function _getSAFTLine(txnObj) {
	if(!txnObj) {
		throw nlapiCreateError('MISSING_ARGUMENT',
				'TAF.FR.Adapter.PEJIncomeStatementClosingAdapter.getSAFTLine: Parameter txnObj is null.');
	}
	
	var line = null;

	if (txnObj.posting === 'T' && txnObj.accountName.length > 0 && 
		(txnObj.credit != 0 || txnObj.debit != 0)) {		
		try {
			var row = new TAF.FR.Adapter.PEJSAFT();
		    var tranDate = nlapiStringToDate(txnObj.date);
		    var glNumDate = (this.usePostingDate || !txnObj.glNumDate) ? tranDate : nlapiStringToDate(txnObj.glNumDate);
		    var account = this.getAccountInfo(txnObj);
		    var foreign = this.getForeignValues(txnObj);

		    row.journalCode = txnObj.typeCode;
		    row.journalLib = txnObj.type;
		    row.ecritureNum = txnObj.glNumber;
		    row.ecritureDate = tranDate;
		    row.compteNum = account.number;
		    row.compteLib = account.name;
		    row.pieceRef = this.getPieceRef(txnObj);
		    row.pieceDate = this.getDate(txnObj);
		    row.ecritureLib = this.getEcritureLib(txnObj);
		    row.debit = txnObj.debit;
		    row.credit = txnObj.credit;
		    row.validDate = nlapiStringToDate(txnObj.glNumDate);
		    row.montantDevise = txnObj.amount;
		    row.iDevise = txnObj.currency || txnObj.subsidiaryCurrency;
		    
		    line = {};
		    line.convertedRow = row;
		    line.lastInternalId = this.lastInternalId;
		    line.txnSequenceNo = this.txnSequenceNo;
		} catch (ex) {
			nlapiLogExecution('ERROR', 'TAF.FR.Adapter.PEJIncomeStatementClosingAdapter.getSAFTLine', ex.toString());
			throw nlapiCreateError('DATA_ERROR', 'TAF.FR.Adapter.PEJIncomeStatementClosingAdapter.getSAFTLine');
		}
	}

	return line;
};

//Get date from Transaction
TAF.FR.Adapter.PEJIncomeStatementClosingAdapter.prototype.getDate = function _getDate(txnObj) {
	if(!txnObj) {
		throw nlapiCreateError('MISSING_ARGUMENT', 
				'TAF.FR.Adapter.PEJIncomeStatementClosingAdapter.getDate: parameter txnObj is null.');
	}
		
    return nlapiStringToDate(txnObj.documentDate || txnObj.date);
};

//Get account Info
TAF.FR.Adapter.PEJIncomeStatementClosingAdapter.prototype.getAccountInfo = function _getAccountInfo(txnObj) {
	if(!txnObj) {
		throw nlapiCreateError('MISSING_ARGUMENT', 
				'TAF.FR.Adapter.PEJIncomeStatementClosingAdapter.getAccountInfo: parameter txnObj is null.');
	}
	
    var scoa = this.accountsMap[txnObj.account];
    var account = {};
    
    if (this.usesAccountingContext) {
        account.number = scoa.getLocalizedNumber() || scoa.getAccountNumber();
        account.name = scoa.getLocalizedName() || scoa.getAccountName();
    } else if (this.accountingBook && !this.accountingBook.isPrimary) {
        account.number = scoa.getAccountNumber();
        account.name = scoa.getAccountName();
    } else {
        account.number = scoa.getSCOANumber() || scoa.getAccountNumber();
        account.name = scoa.getSCOAName() || scoa.getAccountName();
    }

    if (account.number && account.name.indexOf(account.number) === 0) {
        account.name = account.name.replace(account.number + ' ', ''); // only replace the first occurrence
    }
    
    return account;
};

TAF.FR.Adapter.PEJIncomeStatementClosingAdapter.prototype.getPieceRef = function _getPieceRef(txnObj) {
	if(!txnObj) {
		throw nlapiCreateError('MISSING_ARGUMENT', 
				'TAF.FR.Adapter.PEJIncomeStatementClosingAdapter.getPieceRef: parameter txnObj is null.');
	}
	
    return txnObj.tranId || txnObj.transactionNumber;
};

TAF.FR.Adapter.PEJIncomeStatementClosingAdapter.prototype.getEcritureLib = function _getEcritureLib(txnObj) {
	if(!txnObj) {
		throw nlapiCreateError('MISSING_ARGUMENT', 
				'TAF.FR.Adapter.PEJIncomeStatementClosingAdapter.getEcritureLib: parameter txnObj is null.');
	}
	
    var account = this.getAccountInfo(txnObj);
    
    var memoText = txnObj.memo || txnObj.memoMain;
    memoText = memoText.replace(/\|/g, ' ');
    
    return memoText || (account.number + ' ' + account.name);
};

TAF.FR.Adapter.PEJIncomeStatementClosingAdapter.prototype.getForeignValues = function _getForeignValues(txnObj) {
	if(!txnObj) {
		throw nlapiCreateError('MISSING_ARGUMENT', 
				'TAF.FR.Adapter.PEJIncomeStatementClosingAdapter.getForeignValues: parameter txnObj is null.');
	}
	
    var foreign = {
        amount : '',
        currency : ''
    };
    var fxAmount = Math.abs(txnObj.fxAmount);
    if (((txnObj.fxAmount) && (txnObj.fxAmount != 0)) &&
    	((txnObj.currency) && (txnObj.currency != this.defaultCurrency))) {
        foreign.amount = txnObj.debit != 0 ? fxAmount : -fxAmount;
        foreign.currency = txnObj.currency || this.defaultCurrency;
    }
    
    return foreign;
};

// END - PEJ SAFT Adapter