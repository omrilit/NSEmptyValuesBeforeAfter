/**
 * Copyright © 2016, 2018, 2019 Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.MX = TAF.MX || {};
TAF.MX.DAO = TAF.MX.DAO || {};
TAF.MX.Adapter = TAF.MX.Adapter || {};

TAF.MX.DAO.ClearedVendorPaymentDAO = function ClearedVendorPaymentDAO() {
	TAF.DAO.SearchDAO.call(this);
	this.recordType = 'transaction';
};
TAF.MX.DAO.ClearedVendorPaymentDAO.prototype = Object.create(TAF.DAO.SearchDAO.prototype);
TAF.MX.DAO.ClearedVendorPaymentDAO.prototype.createSearchFilters = function _createSearchFilters(params) {
	if (!params) {
		throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
	}

	this.filters.push(new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', params.periodIds));
	this.filters.push(new nlobjSearchFilter('cleared', null, 'is', 'T'));	
	this.filters.push(new nlobjSearchFilter('type', null, 'anyof', ['VendPymt', 'Check'])); //Including Check in DIOT report

	if (this.isOneWorld) {
		this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subIds));
	}
};
TAF.MX.DAO.ClearedVendorPaymentDAO.prototype.createSearchColumns = function _createSearchColumns() {
	this.columns.push(new nlobjSearchColumn('internalid', null, 'group'));
};
TAF.MX.DAO.ClearedVendorPaymentDAO.prototype.rowToObject = function _rowToObject(row) {
	if (!row) {
		throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
	}
	return row.getValue('internalid', null, 'group');
};

TAF.MX.DAO.VendorPaymentLine = function VendorPaymentLine(id) {
	return {
		id: id,
		vatNo: '',
		isIndividual: '',
		firstName: '',
		middleName: '',
		lastName: '',
		companyName: '',
		billCountryCode: '',
		vendorId: '',
		entityId: '',
		mxRFC: '',
		subsidiary: '',
		isEmployee: '',
		type: '',
		paidTransactionId: '',
		paidAmount: 0,
		paidDiscount: 0,
		amount: 0
	};
};

TAF.MX.DAO.VendorPaymentDAO = function VendorPaymentDAO() {
	TAF.DAO.SearchDAO.call(this);

	this.recordType = 'transaction';
	this.savedSearchId = 'customsearch_mx_diot_vendorpayments';
	this.multiBookGroup = null;
};
TAF.MX.DAO.VendorPaymentDAO.prototype = Object.create(TAF.DAO.SearchDAO.prototype);
TAF.MX.DAO.VendorPaymentDAO.prototype.createSearchFilters = function _createSearchFilters(params) {
	if (!params) {
		throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
	}

	if (!params.internalIds || params.internalIds.length < 1) {
		throw nlapiCreateError('MISSING_PARAMETER', 'params.internalIds is required');
	}

	this.filters.push(new nlobjSearchFilter('internalid', null, 'anyof', params.internalIds));

	if (this.isMultiBook) {
		this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
	}
};
TAF.MX.DAO.VendorPaymentDAO.prototype.createSearchColumns = function _createSearchColumns(params) {
	if (this.isMultiBook) {
		this.columns.push(new nlobjSearchColumn('exchangerate', this.multiBookJoinColumn, this.multiBookGroup));
		this.columns.push(new nlobjSearchColumn('exchangerate', null, this.multiBookGroup));
	}

	if (params.hasMXCompliance || params.hasMXLocalization) {
		this.columns.push(new nlobjSearchColumn('custentity_mx_rfc', 'vendor', this.multiBookGroup));
		this.columns.push(new nlobjSearchColumn('custentity_mx_rfc', 'employee', this.multiBookGroup));
	}

	if (this.context.getVersion() === '2016.2') {
		this.columns.push(new nlobjSearchColumn('paidamountisdiscount'));
	}
};
TAF.MX.DAO.VendorPaymentDAO.prototype.rowToObject = function _rowToObject(row) {
	if (!row) {
		throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
	}

	var vendorPayment = new TAF.MX.DAO.VendorPaymentLine(row.getId());
	vendorPayment.vatNo = row.getValue('vatregnumber', 'vendor');
	vendorPayment.isIndividual = row.getValue('isperson', 'vendor') == 'T';
	vendorPayment.firstName = row.getValue('firstname', 'vendor');
	vendorPayment.middleName = row.getValue('middlename', 'vendor');
	vendorPayment.lastName = row.getValue('lastname', 'vendor');
	vendorPayment.companyName = row.getValue('companyname', 'vendor');
	vendorPayment.isEmployee = !!!row.getValue('internalid', 'vendor');

	var joinColumn = vendorPayment.isEmployee ? 'employee' : 'vendor';
	vendorPayment.billCountryCode = row.getValue('billcountrycode', joinColumn);
	vendorPayment.vendorId = row.getValue('internalid', joinColumn);
	vendorPayment.entityId = row.getValue('entityid', joinColumn);
	vendorPayment.mxRFC = vendorPayment.isEmployee ? '' : row.getValue('custentity_mx_rfc', joinColumn);
	vendorPayment.subsidiary = row.getValue('subsidiary', joinColumn);

	vendorPayment.paidTransactionId = row.getValue('paidtransaction');
	vendorPayment.paidAmount = row.getValue('paidamountisdiscount') === 'T' ? 0 : parseFloat(row.getValue('paidamount'));
	vendorPayment.paidDiscount = row.getValue('paidamountisdiscount') === 'T' ? parseFloat(row.getValue('paidamount')) : 0;
	
	vendorPayment.amount = row.getValue('amount');
	vendorPayment.type = row.getValue('type');

	if (this.isMultiBook) {
		var fxRate = parseFloat(row.getValue('exchangerate', null, this.multiBookGroup));
		var mbaFxRate = parseFloat(row.getValue('exchangerate', this.multiBookJoinColumn, this.multiBookGroup));

		vendorPayment.paidAmount = this.convertToMultiBook(vendorPayment.paidAmount, fxRate, mbaFxRate);
		vendorPayment.paidDiscount = this.convertToMultiBook(vendorPayment.paidDiscount, fxRate, mbaFxRate);
	}
	return vendorPayment;
};
TAF.MX.DAO.VendorPaymentDAO.prototype.convertToMultiBook = function convertToMultiBook(amountToConvert, fxRate, mbaFxRate) {
	return (amountToConvert / fxRate) * mbaFxRate;
};

TAF.MX.Adapter.VendorPaymentAdapter = function VendorPaymentAdapter() {
	this.fieldsToDelete = ['id', 'paidAmount', 'paidDiscount', 'paidTransactionId', 'amount'];
};
TAF.MX.Adapter.VendorPaymentAdapter.prototype.consolidateVendorPayments = function consolidateVendorPayments(vendorPaymentLines) {
	var consolidatedPayments = {};

	for (var line in vendorPaymentLines) {
		var payment = vendorPaymentLines[line];

		var vd = consolidatedPayments[payment.id] || payment;
		var paidId = payment.paidTransactionId;

		vd[paidId] = vd[paidId] || {paidAmount: 0, paidDiscount: 0};
		vd[paidId].paidAmount += parseFloat(payment.paidAmount);
		vd[paidId].paidDiscount += parseFloat(payment.paidDiscount);

		vd.paidTransactions = vd.paidTransactions || [];

		if (vd.paidTransactions.indexOf(paidId) < 0) {
			vd.paidTransactions.push(paidId);
		}
		consolidatedPayments[payment.id] = vd;
	}
	this.deleteLinesField(consolidatedPayments);
	return consolidatedPayments;
};
TAF.MX.Adapter.VendorPaymentAdapter.prototype.consolidateSingleVendorPayment = function consolidateSingleVendorPayment(vendorPaymentLines) {
	var consolidatedSingleVendorPayment = null;

	for (var line in vendorPaymentLines) {
		var payment = vendorPaymentLines[line];
		var paidId = payment.type == 'Check' ? payment.id : payment.paidTransactionId;

		consolidatedSingleVendorPayment = consolidatedSingleVendorPayment || payment;
		consolidatedSingleVendorPayment[paidId] = consolidatedSingleVendorPayment[paidId] || {paidAmount: 0, paidDiscount: 0};
		consolidatedSingleVendorPayment[paidId].paidAmount += parseFloat(payment.paidAmount || Math.abs(payment.amount));
		consolidatedSingleVendorPayment[paidId].paidDiscount += parseFloat(payment.paidDiscount);

		consolidatedSingleVendorPayment.paidTransactions = consolidatedSingleVendorPayment.paidTransactions || [];
		if (consolidatedSingleVendorPayment.paidTransactions.indexOf(paidId) < 0) {
			consolidatedSingleVendorPayment.paidTransactions.push(paidId);
		}
	}
	this.deleteLineField(consolidatedSingleVendorPayment);
	return consolidatedSingleVendorPayment;
};
TAF.MX.Adapter.VendorPaymentAdapter.prototype.deleteLinesField = function(lines) {
	for (var l in lines) {
		this.deleteLineField(lines[l]);
	}
};
TAF.MX.Adapter.VendorPaymentAdapter.prototype.deleteLineField = function(line) {
	for (var f = 0; f < this.fieldsToDelete.length; f++) {
		delete line[this.fieldsToDelete[f]];
	}
};

TAF.MX.DAO.PaidTransaction = function PaidTransaction() {
	return {
		id: '',
		type: '',
		operationType: '',
		taxCode: '',
		netAmount: 0,
		taxAmount: 0,
		totalAmount: 0
	};
};
TAF.MX.DAO.PaidTransactionDAO = function PaidTransactionDAO() {
	TAF.MX.DAO.VendorPaymentDAO.call(this);

	this.recordType = 'transaction';
	this.savedSearchId = 'customsearch_mx_diot_paidtransactions';
	this.multiBookGroup = 'max';
	this.hasMXLocalization = false;
	this.hasMXCompliance = false;
};
TAF.MX.DAO.PaidTransactionDAO.prototype = Object.create(TAF.MX.DAO.VendorPaymentDAO.prototype);

TAF.MX.DAO.PaidTransactionDAO.prototype.createSearchColumns = function(params) {
	this.hasMXLocalization = params.hasMXLocalization;
	this.hasMXCompliance = params.hasMXCompliance;

	if (this.isMultiBook) {
		this.columns.push(new nlobjSearchColumn('exchangerate', this.multiBookJoinColumn, this.multiBookGroup));
		this.columns.push(new nlobjSearchColumn('exchangerate', null, this.multiBookGroup));
	}

	if (params.hasMXCompliance) {
		this.columns.push(new nlobjSearchColumn('custbody_mx_operation_type', null, 'group'));
		this.columns.push(new nlobjSearchColumn('custcol_mx_vendor', null, 'group'));
	}

	if (params.hasMXLocalization) {
		this.columns.push(new nlobjSearchColumn('custbody_mx_operation_type', null, 'group'));
		this.columns.push(new nlobjSearchColumn('custcol_mx_operation_type', null, 'group'));
		this.columns.push(new nlobjSearchColumn('custcol_mx_vendor', null, 'group'));
	}
};
TAF.MX.DAO.PaidTransactionDAO.prototype.rowToObject = function _rowToObject(row) {
	if (!row) {
		throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
	}

	var paidTransaction = new TAF.MX.DAO.PaidTransaction();
	paidTransaction.id = row.getValue('internalid', null, 'group');
	paidTransaction.vendor = row.getValue('custcol_mx_vendor', null, 'group');
	paidTransaction.type = row.getValue('type', null, 'group');
	paidTransaction.operationType = row.getValue('custbody_mx_operation_type', null, 'group');
	if (this.hasMXLocalization) {
		paidTransaction.operationTypeLine = row.getValue('custcol_mx_operation_type', null, 'group');
	} else {
		paidTransaction.operationTypeLine = '';
	}
	paidTransaction.taxCode = row.getValue('taxcode', null, 'group');
	paidTransaction.taxAmount = parseFloat(row.getValue('taxamount', null, 'sum') || 0) * -1;
	paidTransaction.totalAmount = parseFloat(row.getValue('total', null, 'max') || 0);

	var debitAmount = parseFloat(row.getValue('debitamount', this.multiBookJoinColumn, 'sum') || 0);
	var creditAmount = parseFloat(row.getValue('creditamount', this.multiBookJoinColumn, 'sum') || 0);
	paidTransaction.netAmount = debitAmount - creditAmount;

	if (this.isMultiBook) {
		var fxRate = parseFloat(row.getValue('exchangerate', null, this.multiBookGroup));
		var mbaFxRate = parseFloat(row.getValue('exchangerate', this.multiBookJoinColumn, this.multiBookGroup));

		paidTransaction.taxAmount = this.convertToMultiBook(paidTransaction.taxAmount, fxRate, mbaFxRate);
		paidTransaction.totalAmount = this.convertToMultiBook(paidTransaction.totalAmount, fxRate, mbaFxRate);
	}
	return paidTransaction;
};

TAF.MX.Adapter.PaidTransactionAdapter = function PaidTransactionAdapter(taxCodeDefs, countryCode) {
	this.taxCodeDefs = taxCodeDefs;
	this.taxCodeDao = TAF.DAO.TaxCodeDaoSingleton.getInstance({countryCode: countryCode});
};
TAF.MX.Adapter.PaidTransactionAdapter.prototype.convertToPayment = function(paidTransactions, vendorPayment) {
	var payments = {};

	try {
		for (var p = 0; p < paidTransactions.length; p++) {
			var paid = paidTransactions[p];
			var operationType = paid.operationTypeLine || paid.operationType;
			var paidAmount = vendorPayment[paid.id].paidAmount;
			var ratio = paidAmount / Math.abs(paid.totalAmount);
			var vendorId = paid.vendor || vendorPayment.vendorId;
			var key = [vendorId, operationType].join('-');
			var payment = payments[key] || JSON.parse(JSON.stringify(vendorPayment));
			payment.vendorId = vendorId;
			payment.isBlankExpReptVendor = paid.vendor === '';
			payment.type = paid.type || vendorPayment.type;
			payment.paidDiscount = vendorPayment[paid.id].paidDiscount;

			if (paid.taxCode) {
				var taxCode = this.taxCodeDao.searchById(paid.taxCode);
				taxCode = taxCode || TAF.DAO.TaxGroupDaoSingleton.getInstance().searchById(paid.taxCode);

				if (taxCode.taxCodes) { //taxgroup
					for (var tc in taxCode.taxCodes) {
						var tax = taxCode.taxCodes[tc];
						var taxRate = tax.rate * (tax.basis / 100);
						var taxAmount = paid.netAmount * (taxRate / 100);

						var taxCodeType = this.taxCodeDefs.GetTypeOf(this.taxCodeDao.searchById(tc));
						setPaymentAmounts(taxCodeType, paid.netAmount, paid.taxAmount, ratio);
					}
				} else {
					var taxCodeType = this.taxCodeDefs.GetTypeOf(taxCode);
					setPaymentAmounts(taxCodeType, paid.netAmount, paid.taxAmount, ratio);
				}
				payments[key] = payment;
			}
		}
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.MX.Adapter.PaidTransactionAdapter.convertToPayment', ex.toString());
	}
	return payments;

	function setPaymentAmounts(taxCode, netAmount, taxAmount, ratio) {
		var net = taxCode + '_net';
		var tax = taxCode + '_tax';

		payment[net] = payment[net] || 0;
		payment[net] += netAmount * ratio;

		payment[tax] = payment[tax] || 0;
		payment[tax] += taxAmount * ratio;
	}
};

// To maintain the Vendor details
TAF.MX.DAO.Vendor = function Vendor() {
	return {
		firstName: '',
		middleName: '',
		lastName: '',
		entityId: '',
		billCountryCode: '',
		vatNo: '',
		isIndividual: '',
		companyName: '',
		mxRFC: ''
	};
};

TAF.MX.DAO.VendorDAO = function VendorDAO() {
	this.recordType = 'vendor';
	this.fields = ['firstname', 'middlename', 'lastname', 'entityid', 'billcountry', 'vatregnumber', 'isperson', 'companyname', 'custentity_mx_rfc'];
};

// Getting Vendor details by passing Id as a parameter
TAF.MX.DAO.VendorDAO.prototype.getVendorById = function _getVendorById(vendorId){
	var vendor = {};
	
	try {
		var rec = nlapiLookupField(this.recordType, vendorId, this.fields);
		vendor = this.convertToObject(rec);
	} catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.MX.DAO.VendorDAO.getVendorById', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'TAF.MX.DAO.VendorDAO.getVendorById');
	}
	return vendor;
};

TAF.MX.DAO.VendorDAO.prototype.convertToObject = function _convertToObject(row){
	var vendor = new TAF.MX.DAO.Vendor();

	try {
		vendor.firstName = row.firstname;
		vendor.middleName = row.middlename;
		vendor.lastName = row.lastname;
		vendor.entityId = row.entityid;
		vendor.billCountryCode = row.billcountry;
		vendor.vatNo = row.vatregnumber;
		vendor.isIndividual = row.isperson;
		vendor.companyName = row.companyname;
		vendor.mxRFC = row.custentity_mx_rfc;
	} catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.MX.DAO.VendorDAO.convertToObject', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'TAF.MX.DAO.VendorDAO.convertToObject');
	}

	return vendor;
};
