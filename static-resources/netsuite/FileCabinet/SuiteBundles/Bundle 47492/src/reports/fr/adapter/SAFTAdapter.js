/**
 * Copyright 2015, 2017, 2018, 2019, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.FR = TAF.FR || {};
TAF.FR.Adapter = TAF.FR.Adapter || {};

// START - SAFT Adapter
TAF.FR.Adapter.SAFT = function _SAFT() {
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

TAF.FR.Adapter.SAFTAdapter = function _SAFTAdapter(params) {
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

TAF.FR.Adapter.SAFTAdapter.prototype.getSAFTLine = function _getSAFTLine(txnObj) {
	if(!txnObj) {
		throw nlapiCreateError('MISSING_ARGUMENT',
				'TAF.FR.Adapter.SAFTAdapter.getSAFTLine: Parameter txnObj is null.');
	}
	
	var line = null;

	if (txnObj.posting === 'T' && txnObj.accountName.length > 0 && 
		(txnObj.credit != 0 || txnObj.debit != 0)) {		
		try {
			var row = new TAF.FR.Adapter.SAFT();
		    var tranDate = nlapiStringToDate(txnObj.date);
		    var glNumDate = (this.usePostingDate || !txnObj.glNumDate) ? tranDate : nlapiStringToDate(txnObj.glNumDate);
		    var account = this.getAccountInfo(txnObj);
		    var foreign = this.getForeignValues(txnObj);

		    row.journalCode = txnObj.typeCode;
		    row.journalLib = txnObj.type;
		    row.ecritureNum = this.getEcritureNum(txnObj).toString();
		    row.ecritureDate = glNumDate;
		    row.compteNum = account.number;
		    row.compteLib = account.name;
		    row.pieceRef = this.getPieceRef(txnObj);
		    row.pieceDate = this.getDate(txnObj);
		    row.ecritureLib = this.getEcritureLib(txnObj);
		    row.debit = txnObj.debit;
		    row.credit = txnObj.credit;
		    row.validDate = nlapiStringToDate(txnObj.glNumDate);
		    row.montantDevise = foreign.amount;
		    row.iDevise = foreign.currency;
		    row.compAuxNum = this.getEntityId(txnObj);
		    row.compAuxLib = this.getEntityName(txnObj);	 
		    row.establishmentCode = txnObj.establishmentCode ? txnObj.establishmentCode : '';
		    
		    line = {};
		    line.convertedRow = row;
		    line.lastInternalId = this.lastInternalId;
		    line.txnSequenceNo = this.txnSequenceNo;
		} catch (ex) {
			nlapiLogExecution('ERROR', 'TAF.FR.Adapter.SAFTAdapter.getSAFTLine', ex.toString());
			throw nlapiCreateError('DATA_ERROR', 'TAF.FR.Adapter.SAFTAdapter.getSAFTLine');
		}
	}

	return line;
};

TAF.FR.Adapter.SAFTAdapter.prototype.getTxnSequenceNo = function _getTxnSequenceNo(id) {
	if(!id) {
		throw nlapiCreateError('MISSING_ARGUMENT', 
				'TAF.FR.Adapter.SAFTAdapter.getTxnSequenceNo: parameter id is null.');
	}
	
	if (id == this.lastInternalId) {
        return this.txnSequenceNo;
    }
    
    this.lastInternalId = id;
    return ++this.txnSequenceNo;
};

TAF.FR.Adapter.SAFTAdapter.prototype.getDate = function _getDate(txnObj) {
	if(!txnObj) {
		throw nlapiCreateError('MISSING_ARGUMENT', 
				'TAF.FR.Adapter.SAFTAdapter.getDate: parameter txnObj is null.');
	}
		
    return nlapiStringToDate(txnObj.documentDate || txnObj.date);
};

TAF.FR.Adapter.SAFTAdapter.prototype.getAccountInfo = function _getAccountInfo(txnObj) {
	if(!txnObj) {
		throw nlapiCreateError('MISSING_ARGUMENT', 
				'TAF.FR.Adapter.SAFTAdapter.getAccountInfo: parameter txnObj is null.');
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

TAF.FR.Adapter.SAFTAdapter.prototype.getEcritureNum = function _getEcritureNum(txnObj) {
	if(!txnObj) {
		throw nlapiCreateError('MISSING_ARGUMENT', 
				'TAF.FR.Adapter.SAFTAdapter.getEcritureNum: parameter txnObj is null.');
	}
	
    return this.isGLSupported ? txnObj.glNumber : this.getTxnSequenceNo(txnObj.internalId);
};

TAF.FR.Adapter.SAFTAdapter.prototype.getPieceRef = function _getPieceRef(txnObj) {
	if(!txnObj) {
		throw nlapiCreateError('MISSING_ARGUMENT', 
				'TAF.FR.Adapter.SAFTAdapter.getPieceRef: parameter txnObj is null.');
	}
	
    return txnObj.tranId || txnObj.transactionNumber || txnObj.internalId;
};

TAF.FR.Adapter.SAFTAdapter.prototype.getEcritureLib = function _getEcritureLib(txnObj) {
	if(!txnObj) {
		throw nlapiCreateError('MISSING_ARGUMENT', 
				'TAF.FR.Adapter.SAFTAdapter.getEcritureLib: parameter txnObj is null.');
	}
	
    var account = this.getAccountInfo(txnObj);
    
    var memoText = txnObj.memo || txnObj.memoMain;
    memoText = memoText.replace(/\|/g, ' ');
    
    return memoText || (account.number + ' ' + account.name);
};

TAF.FR.Adapter.SAFTAdapter.prototype.getForeignValues = function _getForeignValues(txnObj) {
	if(!txnObj) {
		throw nlapiCreateError('MISSING_ARGUMENT', 
				'TAF.FR.Adapter.SAFTAdapter.getForeignValues: parameter txnObj is null.');
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

TAF.FR.Adapter.SAFTAdapter.prototype.getEntityId = function _getEntityId(txnObj) {
	if(!txnObj) {
		throw nlapiCreateError('MISSING_ARGUMENT', 
				'TAF.FR.Adapter.SAFTAdapter.getEntityId: parameter txnObj is null.');
	}

    return this.isSubAccountEnabled ? txnObj.entityId || txnObj.customerId || txnObj.vendorId || '' : '';
};

TAF.FR.Adapter.SAFTAdapter.prototype.getEntityName = function _getEntityName(txnObj) {
	if(!txnObj) {
		throw nlapiCreateError('MISSING_ARGUMENT', 
				'TAF.FR.Adapter.SAFTAdapter.getEntityName: parameter txnObj is null.');
	}

	var entityName = this.getCustomerName(txnObj) || this.getVendorName(txnObj) || this.getEmployeeName(txnObj) || txnObj.entityName || '';
    return this.isSubAccountEnabled ? entityName : '';
};

TAF.FR.Adapter.SAFTAdapter.prototype.getCustomerName = function _getCustomerName(txnObj) {
    if(!txnObj) {
        throw nlapiCreateError('MISSING_ARGUMENT', 
                'TAF.FR.Adapter.SAFTAdapter.getCustomerName: parameter txnObj is null.');
    }

    var customerName = (txnObj.customerFirstName || txnObj.customerLastName) ? txnObj.customerFirstName + ' ' + txnObj.customerLastName : '';
    return customerName || txnObj.customerCompanyName;
};

TAF.FR.Adapter.SAFTAdapter.prototype.getVendorName = function _getVendorName(txnObj) {
    if(!txnObj) {
        throw nlapiCreateError('MISSING_ARGUMENT', 
                'TAF.FR.Adapter.SAFTAdapter.getVendorName: parameter txnObj is null.');
    }

    var companyName = txnObj.vendorCompanyName || txnObj.vendorLineCompanyName;
    var firstName = txnObj.vendorFirstName || txnObj.vendorLineFirstName;
    var lastName = txnObj.vendorLastName || txnObj.vendorLineLastName;
    var vendorName = (firstName || lastName) ? firstName + ' ' + lastName : '';
    return vendorName || companyName;
};

TAF.FR.Adapter.SAFTAdapter.prototype.getEmployeeName = function _getEmployeeName(txnObj) {
    if(!txnObj) {
        throw nlapiCreateError('MISSING_ARGUMENT', 
                'TAF.FR.Adapter.SAFTAdapter.getEmployeeName: parameter txnObj is null.');
    }

    return (txnObj.employeeFirstName || txnObj.employeeLastName) ? txnObj.employeeFirstName + ' ' + txnObj.employeeLastName : '';
};

// END - SAFT Adapter