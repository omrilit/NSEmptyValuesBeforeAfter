/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */
var Tax = Tax || {};

Tax.Supplementary = Tax.Supplementary || {};
Tax.Supplementary.VCS = Tax.Supplementary.VCS || {};
Tax.Supplementary.VCS.CZ = Tax.Supplementary.VCS.CZ || {};
Tax.Supplementary.VCS.CZ.Adapter = Tax.Supplementary.VCS.CZ.Adapter || {};
Tax.Supplementary.VCS.CZ.DAO = Tax.Supplementary.VCS.CZ.DAO || {};
Tax.Supplementary.VCS.CZ.FileManager = Tax.Supplementary.VCS.CZ.FileManager || {};

var base = Tax.Supplementary.VCS.CZ;
var dao = base.DAO;
var adapter = base.Adapter;

Tax.Supplementary.VCS.CZ.getCode = function _getCode(param) {
	if(!param) {
		return '';
	}

	var matches = param.match(/(\d*) - .*/);
	return matches[1];
};

Tax.Supplementary.VCS.CZ.VatOnlineConfigData = function() {
	return {
		city: '',
		code_prevyear:'',
		country: '',
		econ_activity: '',
		email: '',
		legalname: '',
		opr_lastname: '',
		opr_name: '',
		opr_relationship:'',
		payertype:'' ,
		regoffice: '',
		sectionc: '',
		sest_lastname: '',
		sest_name: '',
		sest_telephone: '',
		street: '',
		taxoffice: '',
		taxoffice_display: '',
		taxpayer_type: '',
		taxreturncode: '',
		telephone: '',
		vatno: '',
		vatreportingperiod: '', //1 monthly, 3 quarterly
		zast_birthdate: '',
		zast_code: '',
		zast_id: '',
		zast_lastname:'',
		zast_legalname: '',
		zast_name: '',
		zast_regnum: '',
		zast_type: '',
		zipcode: '',
		taxpayertype_legal: false,
		taxpayertype_natural: false,
		periodmonth: '',
		periodquarter: '',
		periodyear: '',
		periodfromstartdate: '',
		periodtoenddate: '',
		dateofsubmission: '',
		summons: '',
		summons_display: '',
		summonsrefno: '',
		correctivesubmission: '',
		zast_representativename: '',
		databox_id: ''
	};
};

dao.SalesByTaxCodeDAO = function SalesByTaxCodeDAO() {
	Tax.DAO.ReportDAO.call(this);
	this.Name = 'SalesByTaxCodeDAO';
	this.reportName = 'VAT Control - Sales by Tax Code';
};
dao.SalesByTaxCodeDAO.prototype = Object.create(Tax.DAO.ReportDAO.prototype);

dao.SalesByTaxCodeDAO.prototype.ListObject = function ListObject() {
	return {
		internalId: '',
		lines: []
	};
};

dao.SalesByTaxCodeDAO.prototype.LineObject = function LineObject() {
	return {
		taxCode: '',
		entityTaxNumber: '',
		transactionId: '',
		documentNumber: '',
		transactionDate: '',
		netAmount: '',
		taxAmount: '',
		codeOfSupply: '',
		regimeCodeOfSupply: '',
		totalGrossAmount: '',
		transactionType: '',
		dateOfTaxableSupply: ''
	};
};

dao.SalesByTaxCodeDAO.prototype.extractRows = function extractRows(node, columns) {
	var children = node.getChildren();
	var rowObject = new this.ListObject();
	rowObject.internalId = node.getValue();

	for (var i = 0; i < children.length; i++) {
		var lineObject = new this.LineObject();
		for (col in columns) {
			lineObject[col] = this.getValue(children[i].getValue(columns[col])).toString();
		}
		rowObject.lines.push(lineObject);
	}

	this.list.push(rowObject);
};

dao.SalesByTaxCodeDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
	var pivotReportColumns = this.getColumns(pivotReport);
	var meta = this.setBaseColumnMetadata(pivotReportColumns);
	return meta;
};

dao.SalesByTaxCodeDAO.prototype.setBaseColumnMetadata = function setBaseColumnMetadata(pivotReportColumns) {
	return {
		taxCode: pivotReportColumns[0],
		entityTaxNumber: pivotReportColumns[1],
		transactionId: pivotReportColumns[2],
		documentNumber: pivotReportColumns[3],
		transactionDate: pivotReportColumns[4],
		netAmount: pivotReportColumns[5],
		taxAmount: pivotReportColumns[6],
		codeOfSupply: pivotReportColumns[7],
		regimeCodeOfSupply: pivotReportColumns[8],
		totalGrossAmount: pivotReportColumns[9],
		transactionType: pivotReportColumns[10],
		dateOfTaxableSupply: pivotReportColumns[11],
	};
};

dao.SalesJournalByTaxCodeDAO = function SalesJournalByTaxCodeDAO() {
	Tax.Supplementary.VCS.CZ.DAO.SalesByTaxCodeDAO.call(this);
	this.Name = 'SalesJournalByTaxCodeDAO';
	this.reportName = 'VAT Control - Sales by Tax Code [JRN]';
};
dao.SalesJournalByTaxCodeDAO.prototype = Object.create(Tax.Supplementary.VCS.CZ.DAO.SalesByTaxCodeDAO.prototype);

dao.SalesJournalByTaxCodeDAO.prototype.extractRows = function extractRows(node, columns) {
	var children = node.getChildren();
	var rowObject = new this.ListObject();
	rowObject.internalId = node.getValue();

	var tranTotal = 0;
	for (var i = 0; i < children.length; i++) {
		var lineObject = new this.LineObject();
		for (col in columns) {
			lineObject[col] = this.getValue(children[i].getValue(columns[col])).toString();
		}
		tranTotal += parseFloat(lineObject['netAmount']) + parseFloat(lineObject['taxAmount']);
		rowObject.lines.push(lineObject);
	}

	rowObject.lines.forEach(function(line) {
		line['totalGrossAmount'] = tranTotal;
	});

	this.list.push(rowObject);
};

dao.SalesJournalByTaxCodeDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
	var pivotReportColumns = this.getColumns(pivotReport);
	var meta = this.setBaseColumnMetadata(pivotReportColumns);
	meta.documentNumberJournal = pivotReportColumns[12];
	return meta;
};

dao.PurchasesByTaxCodeDAO = function PurchasesByTaxCodeDAO() {
	Tax.DAO.ReportDAO.call(this);
	this.Name = 'PurchasesByTaxCodeDAO';
	this.reportName = 'VAT Control - Purchases by Tax Code';
};
dao.PurchasesByTaxCodeDAO.prototype = Object.create(Tax.DAO.ReportDAO.prototype);

dao.PurchasesByTaxCodeDAO.prototype.ListObject = function ListObject() {
	return {
		internalId: '',
		lines: []
	};
};

dao.PurchasesByTaxCodeDAO.prototype.LineObject = function LineObject() {
	return {
		taxCode: '',
		entityName: '',
		entityTaxNumber: '',
		transactionId: '',
		documentNumber: '',
		transactionDate: '',
		netAmount: '',
		taxAmount: '',
		notionalAmount:'',
		codeOfSupply: '',
		regimeCodeOfSupply: '',
		totalGrossAmount: '',
		transactionType: '',
		expenseCodeOfSupply: '',
		dateOfTaxableSupply: '',
		hasDeductible: ''
	};
};

dao.PurchasesByTaxCodeDAO.prototype.extractRows = function extractRows(node, columns) {
	try {
	var children = node.getChildren();
	var rowObject = new this.ListObject();
	rowObject.internalId = node.getValue();

	for (var i = 0; i < children.length; i++) {
		var lineObject = new this.LineObject();
		for (var col in columns) {
				lineObject[col] = this.getValue(children[i].getValue(columns[col])).toString();
		}
		rowObject.lines.push(lineObject);
	}

	this.list.push(rowObject);
	} catch (ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.DAO.PurchasesByTaxCodeDAO.extractRows');
		this.list = [];
	}
};

dao.PurchasesByTaxCodeDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
	var pivotReportColumns = this.getColumns(pivotReport);
	var meta = this.setBaseColumnMetadata(pivotReportColumns);
	meta.expenseCodeOfSupply = pivotReportColumns[13];
	meta.dateOfTaxableSupply = pivotReportColumns[14];
	meta.hasDeductible = pivotReportColumns[15];
	return meta;
};

dao.PurchasesByTaxCodeDAO.prototype.setBaseColumnMetadata = function setBaseColumnMetadata(pivotReportColumns) {
	return {
		taxCode: pivotReportColumns[0],
		entityName: pivotReportColumns[1],
		entityTaxNumber: pivotReportColumns[2],
		transactionId: pivotReportColumns[3],
		documentNumber: pivotReportColumns[4],
		transactionDate: pivotReportColumns[5],
		netAmount: pivotReportColumns[6],
		taxAmount: pivotReportColumns[7],
		notionalAmount: pivotReportColumns[8],
		codeOfSupply: pivotReportColumns[9],
		regimeCodeOfSupply: pivotReportColumns[10],
		totalGrossAmount: pivotReportColumns[11],
		transactionType: pivotReportColumns[12]
	};
};

dao.PurchasesJournalByTaxCodeDAO = function PurchasesJournalByTaxCodeDAO() {
	Tax.Supplementary.VCS.CZ.DAO.PurchasesByTaxCodeDAO.call(this);
	this.Name = 'PurchasesJournalByTaxCodeDAO';
	this.reportName = 'VAT Control - Purchases by Tax Code [JRN]';
};
dao.PurchasesJournalByTaxCodeDAO.prototype = Object.create(Tax.Supplementary.VCS.CZ.DAO.PurchasesByTaxCodeDAO.prototype);

dao.PurchasesJournalByTaxCodeDAO.prototype.extractRows = function extractRows(node, columns) {
	var children = node.getChildren();
	var rowObject = new this.ListObject();
	rowObject.internalId = node.getValue();

	var tranTotal = 0;
	for (var i = 0; i < children.length; i++) {
		var lineObject = new this.LineObject();
		for (col in columns) {
			lineObject[col] = this.getValue(children[i].getValue(columns[col])).toString();
		}
		tranTotal += parseFloat(lineObject['netAmount']) + parseFloat(lineObject['taxAmount']);
		rowObject.lines.push(lineObject);
	}

	rowObject.lines.forEach(function(line) {
		line['totalGrossAmount'] = tranTotal;
	});

	this.list.push(rowObject);
};

dao.PurchasesJournalByTaxCodeDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
	var pivotReportColumns = this.getColumns(pivotReport);
	var meta = this.setBaseColumnMetadata(pivotReportColumns);
	meta.dateOfTaxableSupply = pivotReportColumns[13];
	meta.documentNumberJournal = pivotReportColumns[14];
	return meta;
};

dao.NonDeductibleTaxSuppDAO = function NonDeductibleTaxSuppDAO() {
	Tax.DAO.NonDeductibleTaxDetailDAO.call(this);
	this.Name = 'NonDeductibleTaxSuppDAO';
	this.fields = {
		id: {name:'internalid', summary:'GROUP'},
		entityName: {name:'entity', summary:'GROUP'},
		entityTaxNumber: {name:'vatregnumber', summary:'GROUP'},
		documentNumber: {name:'transactionnumber', summary:'GROUP'},
		transactionId: {name:'tranid', summary:'GROUP'},
		transactionDate: {name: 'trandate', summary:'GROUP'},
		transactionType: {name: 'type', summary:'GROUP'},
		memo: {name:'memo', summary:'GROUP'},
		debitAmount: {},
		creditAmount: {},
		taxAmount: {},
		taxCode: {},
		hasDeductible: {}
	};
	this.taxcodeNames = getNDTaxcodeNames();

	function getNDTaxcodeNames() {
		var taxcodeNames = {};
		var filters = [new nlobjSearchFilter('country', null, 'anyof', 'CZ'),
					   new nlobjSearchFilter('custrecord_4110_non_deductible', null, 'is', 'T', null, 1, 0, true),
					   new nlobjSearchFilter('custrecord_4110_nondeductible_parent', null, 'noneof', '@NONE@', null, 0, 1)];
		var sr = nlapiSearchRecord('salestaxitem', null, filters, new nlobjSearchColumn('itemid'));

		for (var isr = 0; sr && isr < sr.length; isr++) {
			taxcodeNames[sr[isr].getId()] = sr[isr].getValue('itemid');
		}
		return taxcodeNames;
	}
};
dao.NonDeductibleTaxSuppDAO.prototype = Object.create(Tax.DAO.NonDeductibleTaxDetailDAO.prototype);

dao.NonDeductibleTaxSuppDAO.prototype.rowToObject = function rowToObject(row) {
	var rowObject = {internalId: row.getValue(this.fields.id.name, null, this.fields.id.summary), lines:[]};
	var line = new this.ListObject();

	for (var f in this.fields) {
		var column = this.fields[f];
		if (f === 'transactionType') {
			line[f] = row.getText(column.name, column.join ? column.join : null, column.summary);
		} else {
			line[f] = row.getValue(column.name, column.join ? column.join : null, column.summary);
		}
	}
	var taxcodeId = getTaxCodeIdFromMemo(line.memo);
	line.taxCode = this.taxcodeNames[taxcodeId];
	line.taxAmount = line.debitAmount ? -Math.abs(line.amount) : Math.abs(line.amount);
	line.hasDeductible = 'T';
	rowObject.lines.push(line);
	return rowObject;

	function getTaxCodeIdFromMemo(memo) {
		var strToSplit = '|Tax Code:';
		var splitStr = memo ? memo.split(strToSplit) : [];
		var taxcodeId = splitStr.length > 0 ? splitStr[1] : '';
		return taxcodeId;
	}
};

adapter.HeaderAdapter = function HeaderAdapter() {
	Tax.Adapter.BaseAdapter.call(this);
	this.Name = 'HeaderAdapter';
	this.daos = ['VATOnlineConfigDAO'];
};
adapter.HeaderAdapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

adapter.HeaderAdapter.prototype.transform = function _transform(params) {

	return this.getConfigData(params);
};

adapter.HeaderAdapter.prototype.getPrintMsg = function _getPrintMsg(dateToday) {
	var context = nlapiGetContext();

	var defaultMsg = [];
	defaultMsg.push("Printed by");
	defaultMsg.push(context.getName());
	defaultMsg.push("(" + context.getUser() + ")");
	defaultMsg.push("on");
	defaultMsg.push(dateToday);

	return defaultMsg.join(' ');
};

adapter.HeaderAdapter.prototype.getConfigData = function _getConfigData(params) {
	var vatConfig = {};
	var fiscalCalendar = nlapiGetContext().getFeature('SUBSIDIARIES') ? SFC.System.Subsidiary(params.subsidiary, false, params.bookid).FiscalCalendar : null;
	var MONTHLYFILING = '1';
	var QUARTERLYFILING = '3';
	var czConfig = new Tax.Supplementary.VCS.CZ.VatOnlineConfigData();

	for(var row in this.rawdata ) {
		if (this.rawdata[row]['name'] != 'Format') {
			vatConfig[this.rawdata[row]['name']] = this.rawdata[row]['value'];
		}
	}

	try {
		var periodFrom = new SFC.System.TaxPeriod(params.periodfrom);
		var periodTo = new SFC.System.TaxPeriod(params.periodto);
		var periodFromStartDate = periodFrom.GetStartDate();
		var periodToEndDate = periodTo.GetEndDate();
		var postingPeriodDescendants = periodTo.GetPostingDescendantPeriods(periodTo.GetRawStartDate(), periodTo.GetRawEndDate(), fiscalCalendar);
		var periodToId = postingPeriodDescendants.length > 0 ? postingPeriodDescendants[postingPeriodDescendants.length - 1] : periodTo.GetId();

		for (var key in vatConfig) {
			czConfig[key] = vatConfig[key];
		}

		if (czConfig.vatreportingperiod == QUARTERLYFILING) {
			var quarterPeriod = periodTo.GetParentPeriod(periodToId, fiscalCalendar, false);
			if (quarterPeriod) {
				periodToId = quarterPeriod.getValue('internalid');
			}
		}

		czConfig.taxpayertype_legal = czConfig.taxpayer_type == 'P' ? true : false;
		czConfig.taxpayertype_natural = czConfig.taxpayer_type == 'F' ? true : false;
		czConfig.dateofsubmission = new Date().toDateString();
		czConfig.periodfromstartdate = periodFromStartDate.toDateString();
		czConfig.periodtoenddate = periodToEndDate.toDateString();
		czConfig.periodmonth = czConfig.vatreportingperiod == MONTHLYFILING ? periodTo.GetFiscalYearPeriodIndex(periodToId, fiscalCalendar, false) : '';
		czConfig.periodquarter = czConfig.vatreportingperiod == QUARTERLYFILING ? periodTo.GetFiscalYearPeriodIndex(periodToId, fiscalCalendar, true) : '';
		czConfig.periodyear = periodToEndDate.getFullYear();
		czConfig.printmsg = this.getPrintMsg(czConfig.dateofsubmission);

		var taxReturnCode = czConfig.taxreturncode;
		czConfig.taxreturncode = taxReturnCode == 'D' ? 'N' : taxReturnCode;
		czConfig.vcstype_regular =taxReturnCode == 'B' ? 'X' : '';
		czConfig.vcstype_following = (taxReturnCode == 'D' || taxReturnCode == 'E') ? 'X' : '';
		czConfig.vcstype_corrective = (taxReturnCode == 'O' || taxReturnCode == 'E') ? 'X' : '';
		czConfig.zast_representativename = czConfig.zast_type == 'P' ? czConfig.zast_legalname : czConfig.zast_name + (czConfig.zast_name != '' ? ' ' + czConfig.zast_lastname : czConfig.zast_lastname);
	} catch(ex) {
		logException(ex,'Tax.Supplementary.VCS.CZ.Adapter.HeaderAdapter.getConfigData');
		throw ex;
	}

	var result = {};
	result[this.Name] = czConfig;
	return result;
};

adapter.SectionA1Row = function SectionA1Row() {
	return {
		'lineNumber': '',
		'entityTaxNumber': '',
		'transactionId': '',
		'transactionDate': '',
		'netAmount': '',
		'codeOfSupply': ''
	};
};

adapter.SectionA1Adapter = function SectionA1Adapter() {
	Tax.Adapter.BaseAdapter.call(this);
	this.Name = 'SectionA1Adapter';
	this.taxCodeLookup = VAT.TaxCodeLookup.getInstance('CZ', VAT.CZ.Report.TaxDefinition());
	this.taxCodes = ['RC', 'RCR', 'RCSR'];
	this.daos = ['SalesByTaxCodeDAO', 'SalesJournalByTaxCodeDAO', 'SaleAdjustmentDetailsDAO'];
};
adapter.SectionA1Adapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

adapter.SectionA1Adapter.prototype.transform = function _transform(params) {
	if (!this.rawdata) {
		//insert error handling here
	}
	try {
		var compiledData = this.compile(this.rawdata);
		var result = {};
		result[this.Name] = this.extract(compiledData);
		return result;
	} catch (ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionA1Adapter.transform');
		throw ex;
	}
};

adapter.SectionA1Adapter.prototype.compile = function _compile(data) {
	if (!data) {
		//insert error handling here
	}
	try {
		var result = [];
		for (var i = 0; i < data.length; i++) {
			var transactionData = data[i];
			var transactionLines = transactionData.lines;
			var transactionLine = transactionLines[0];
			var transactionResult = {};

			transactionResult.transactionType =  transactionLine.transactionType;
			transactionResult.entityTaxNumber = transactionLine.entityTaxNumber;
			transactionResult.transactionId = transactionLine.transactionId;
			transactionResult.documentNumber = transactionLine.documentNumber;
			transactionResult.documentNumberJournal =  transactionLine.documentNumberJournal;
			transactionResult.transactionDate = transactionLine.dateOfTaxableSupply || transactionLine.transactionDate;

			var codeOfSupplyResult = {};
			var validLineCount = 0;
			for (var j = 0; j < transactionLines.length; j++) {
				var line = transactionLines[j];
				if (!this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes)) {
					continue;
				}
				var amount = parseFloat(line.netAmount);
				if (!codeOfSupplyResult[line.codeOfSupply]) {
					codeOfSupplyResult[line.codeOfSupply] = amount;
				} else {
					codeOfSupplyResult[line.codeOfSupply] += amount;
				}
				++validLineCount;
			}
			if (validLineCount > 0) {
				transactionResult.codeOfSupply = codeOfSupplyResult;
				result.push(transactionResult);
			}
		}
		return result;
	} catch (ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionA1Adapter.compile');
		throw ex;
	}
};

adapter.SectionA1Adapter.prototype.extract = function _extract(data) {
	if (!data) {
		//insert error handling here
	}
	try {
		data.sort(function(a, b) { //date, tranid
			var diff = Date.parse(a.transactionDate) - Date.parse(b.transactionDate);
			if (diff != 0) {
				return diff;
			}
			var sortAKey = a.documentNumber || a.transactionId;
			var sortBKey = b.documentNumber || b.transactionId;
			return (sortAKey > sortBKey ) ? 1 : (sortAKey < sortBKey) ? -1 : 0;
		});

		var lineNumber = 0;
		var result = [];
		for (var i = 0; i < data.length; i++) {
			var transactionResult = data[i];
			var codeOfSupply = transactionResult.codeOfSupply;

			var cosKeys = Object.keys(codeOfSupply).sort(function (a,b) {return a-b;});
			for (var j = 0; j < cosKeys.length; j++) {
				var row = new Tax.Supplementary.VCS.CZ.Adapter.SectionA1Row();
				row.lineNumber = ++lineNumber;
				row.transactionId = transactionResult.documentNumber || transactionResult.transactionId;
				if (transactionResult.transactionType === 'GENJRNL' && transactionResult.documentNumberJournal) {
					row.transactionId = transactionResult.documentNumberJournal;
				}
				row.entityTaxNumber = transactionResult.entityTaxNumber;
				row.transactionDate = transactionResult.transactionDate;
				row.codeOfSupply = Tax.Supplementary.VCS.CZ.getCode(cosKeys[j]);
				row.netAmount = codeOfSupply[cosKeys[j]];
				result.push(row);
			}
		}
		return result;
	} catch (ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionA1Adapter.extract');
		throw ex;
	}
};

adapter.SectionA2Row = function SectionA2Row() {
	return {
		lineNumber: '',
		entityTaxNumber: '',
		transactionId: '',
		transactionDate: '',
		netAmount1: 0,
		taxAmount1: 0,
		netAmount2: 0,
		taxAmount2: 0,
		netAmount3: 0,
		taxAmount3: 0,
		countryCode: ''
	};
};

adapter.SectionA2Adapter = function SectionA2Adapter() {
	Tax.Adapter.BaseAdapter.call(this);
	this.Name = 'SectionA2Adapter';
	this.taxCodeLookup = VAT.TaxCodeLookup.getInstance('CZ', VAT.CZ.Report.TaxDefinition());
	this.purchasesTaxCodes = ['ES', 'ESSP', 'NV', 'ER', 'ESPR', 'IS', 'ISR', 'ISSR', 'RCOND', 'RCOND2', 'RCOND3'];
	this.salesTaxCodes = ['OT', 'OTR', 'OTSR'];
	this.salesTaxCodes1 = ['OT'];
	this.purchasesTaxCodes1 = ['ES', 'ESSP', 'NV', 'IS', 'RCOND'];
	this.salesTaxCodes2 = ['OTR'];
	this.purchasesTaxCodes2 = ['ER', 'ESPR', 'ISR', 'RCOND2'];
	this.salesTaxCodes3 = ['OTSR'];
	this.purchasesTaxCodes3 = ['ISSR', 'RCOND3'];
	this.daos = ['SalesByTaxCodeDAO', 'SalesJournalByTaxCodeDAO', 'SaleAdjustmentDetailsDAO', 'PurchasesByTaxCodeDAO', 'PurchasesJournalByTaxCodeDAO', 'PurchaseAdjustmentDetailsDAO'];
};
adapter.SectionA2Adapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

adapter.SectionA2Adapter.prototype.process = function _process(result, params) {
	if(!this.daos || this.daos.length < 1) {
		throw nlapiCreateError('MISSING_ARGUMENT', 'result.dao is required');
	}

	var daoType = {'SalesByTaxCodeDAO': 'sales',
				   'SalesJournalByTaxCodeDAO': 'sales',
				   'SaleAdjustmentDetailsDAO': 'sales',
				   'PurchasesByTaxCodeDAO': 'purchases',
				   'PurchasesJournalByTaxCodeDAO': 'purchases',
				   'PurchaseAdjustmentDetailsDAO': 'purchases'};

	var combinedResult = {
			'sales': [],
			'purchases': []
	};

	for (var i=0; i<this.daos.length; i++) {
		var daoName = this.daos[i];
		combinedResult[daoType[daoName]] = combinedResult[daoType[daoName]].concat(Tax.Cache.MemoryCache.getInstance().load(daoName));
	}

	this.rawdata = combinedResult;
	return {adapter:this.transform(params)};
};

adapter.SectionA2Adapter.prototype.transform = function _transform(params) {
	if (!this.rawdata) {
		//insert error handling here
	}
	try {
		var compiledData = this.compile(this.rawdata);
		var result = {};
		result[this.Name] = this.extract(compiledData);
		return result;
	} catch (ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionA2Adapter.transform');
		throw ex;
	}
};

adapter.SectionA2Adapter.prototype.compile = function _compile(data) {
	if (!data) {
		//insert error handling here
	}
	try {
		var result = [];
		for (var txnType in data) {
			result = result.concat(processTransaction.call(this, txnType, data[txnType]));
		}
		return result;
	} catch (ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionA2Adapter.compile');
		throw ex;
	}

	function processTransaction(txnType, data) {
		try {
			var result = [];
			var lineNumber = 0;
			for (var idata = 0; data && idata < data.length; idata++) {
				var transactionData = data[idata];
				var transactionLines = transactionData.lines;
				var transactionLine = transactionData.lines[0];
				var transactionResult = new Tax.Supplementary.VCS.CZ.Adapter.SectionA2Row();

				transactionResult.transactionType = transactionLine.transactionType;
				transactionResult.transactionId = transactionLine.transactionId;
				transactionResult.documentNumber = transactionLine.documentNumber;
				transactionResult.documentNumberJournal = transactionLine.documentNumberJournal;
				transactionResult.entityTaxNumber = transactionLine.entityTaxNumber;
				transactionResult.transactionDate = transactionLine.dateOfTaxableSupply || transactionLine.transactionDate;

				var validLineCount = 0;
				for (var line = 0; line < transactionLines.length; line++) {
					validLineCount += processLine.call(this, txnType == 'sales' ? true : false, transactionLines[line], transactionResult);
				}

				if(validLineCount > 0){
					result.push(transactionResult);
				}
			}
			return result;
		} catch (ex) {
			logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionA2Adapter.compile.processTransaction');
			throw ex;
		}
	}

	function processLine(isSales, line, result) {
		try {
			if (isSales && !this.taxCodeLookup.anyOf(line.taxCode, this.salesTaxCodes) ||
				!isSales && !this.taxCodeLookup.anyOf(line.taxCode, this.purchasesTaxCodes)) {
				return 0;
			}

			var netAmount = parseFloat(line.netAmount) || 0;
			var taxAmount = parseFloat(line.taxAmount) || parseFloat(line.notionalAmount) || 0;

			if (isSales && this.taxCodeLookup.anyOf(line.taxCode, this.salesTaxCodes1) ||
				!isSales && this.taxCodeLookup.anyOf(line.taxCode, this.purchasesTaxCodes1)) {
				result.netAmount1 += netAmount;
				result.taxAmount1 += taxAmount;
			} else if (isSales && this.taxCodeLookup.anyOf(line.taxCode, this.salesTaxCodes2) ||
				!isSales && this.taxCodeLookup.anyOf(line.taxCode, this.purchasesTaxCodes2)) {
				result.netAmount2 += netAmount;
				result.taxAmount2 += taxAmount;
			} else if (isSales && this.taxCodeLookup.anyOf(line.taxCode, this.salesTaxCodes3) ||
				!isSales && this.taxCodeLookup.anyOf(line.taxCode, this.purchasesTaxCodes3)) {
				result.netAmount3 += netAmount;
				result.taxAmount3 += taxAmount;
			}
			return 1;
		} catch (ex) {
			logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionA2Adapter.compile.processLine');
			throw ex;
		}
		return 0;
	}
};

adapter.SectionA2Adapter.prototype.extract = function _extract(data) {
	if (!data) {
		//insert error handling here
	}
	try {
		data.sort(function(a, b) { //date, tranid
			var diff = Date.parse(a.transactionDate) - Date.parse(b.transactionDate);
			if (diff != 0) {
				return diff;
			}
			var sortAKey = a.documentNumber || a.transactionId;
			var sortBKey = b.documentNumber || b.transactionId;
			return (sortAKey > sortBKey ) ? 1 : (sortAKey < sortBKey) ? -1 : 0;
		});

		var lineNumber = 0;
		var result = [];
		for (var idata = 0; data && idata < data.length; idata++) {
			var transaction = data[idata];

			var row = new Tax.Supplementary.VCS.CZ.Adapter.SectionA2Row();
			row.lineNumber = ++lineNumber;
			row.transactionId = transaction.documentNumber || transaction.transactionId;
			if (transaction.transactionType === 'GENJRNL' && transaction.documentNumberJournal) {
				row.transactionId = transaction.documentNumberJournal;
			}
			row.entityTaxNumber = transaction.entityTaxNumber || '';
			row.transactionDate = transaction.transactionDate || '';
			row.netAmount1 = transaction.netAmount1 || 0;
			row.taxAmount1 = transaction.taxAmount1 || 0;
			row.netAmount2 = transaction.netAmount2 || 0;
			row.taxAmount2 = transaction.taxAmount2 || 0;
			row.netAmount3 = transaction.netAmount3 || 0;
			row.taxAmount3 = transaction.taxAmount3 || 0;
			row.countryCode = row.entityTaxNumber;
			result.push(row);
		}
		return result;
	} catch (ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionA2Adapter.extract');
		throw ex;
	}
};

Tax.Supplementary.VCS.CZ.SectionA3Row = function() {
	return {
		lineNumber: '',
		entityTaxNumber: '',
		entityTaxName: '',
		transactionId: '',
		transactionDate: '',
		netAmount: '',
		countryCode: ''
	};
};

adapter.SectionA3Adapter = function SectionA3Adapter() {
	Tax.Adapter.BaseAdapter.call(this);
	this.Name = 'SectionA3Adapter';
	this.taxCodeLookup = VAT.TaxCodeLookup.getInstance('CZ', VAT.CZ.Report.TaxDefinition());
	this.daos = ['PurchasesByTaxCodeDAO', 'PurchasesJournalByTaxCodeDAO', 'PurchaseAdjustmentDetailsDAO'];
};
adapter.SectionA3Adapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

adapter.SectionA3Adapter.prototype.transform = function _transform(params) {
	try {
		var list = [];
		var index = 0;
		for(var tran in (this.rawdata)) {
			for(var i in this.rawdata[tran].lines) {
				var line = this.rawdata[tran].lines[i];
				if(this.taxCodeLookup.typeOf(line.taxCode, 'IG')) {
					var row = Tax.Supplementary.VCS.CZ.SectionA3Row();
					row.lineNumber = ++index;
					row.transactionId = line.documentNumber || line.transactionId;
					if (line.transactionType === 'GENJRNL' && line.documentNumberJournal) {
						row.transactionId = line.documentNumberJournal;
					}
					row.entityTaxNumber = line.entityTaxNumber || '';
					row.entityTaxName = line.entityName || '';
					row.transactionDate = line.dateOfTaxableSupply || line.transactionDate;
					row.netAmount = line.netAmount || '';
					row.countryCode = row.entityTaxNumber;
					list.push(row);
					break;
				}
			}
		}
		list.sort(function(a, b) { //date, tranid
			var diff = Date.parse(a.transactionDate) - Date.parse(b.transactionDate);
			if (diff != 0) {
				return diff;
			}
			return ( a.transactionId > b.transactionId ) ? 1 : ( a.transactionId < b.transactionId ) ? -1 : 0;
		});

		var result = {};
		result[this.Name] = list;
		return result;
	} catch (ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionA3Adapter.extract');
		throw ex;
	}
};

adapter.SectionA4Row = function SectionA4Row() {
	return {
		'lineNumber': '',
		'entityTaxNumber': '',
		'transactionId': '',
		'transactionDate': '',
		'netAmountS-CZ': 0,
		'taxAmountS-CZ': 0,
		'netAmountR-CZ': 0,
		'taxAmountR-CZ': 0,
		'netAmountSR-CZ': 0,
		'taxAmountSR-CZ': 0,
		'regimeCodeOfSupply': '',
		'vatAct': ''
	};
};

adapter.SectionA4Adapter = function SectionA4Adapter() {
	Tax.Adapter.BaseAdapter.call(this);
	this.Name = 'SectionA4Adapter';
	this.taxCodeLookup = VAT.TaxCodeLookup.getInstance('CZ', VAT.CZ.Report.TaxDefinition());
	this.taxCodes = ['S', 'R', 'SR'];
	this.daos = ['SalesByTaxCodeDAO', 'SalesJournalByTaxCodeDAO', 'SaleAdjustmentDetailsDAO'];
};
adapter.SectionA4Adapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

adapter.SectionA4Adapter.prototype.transform = function _transform(params) {
	if (!this.rawdata) {
		//insert error handling here
	}
	try {
		var result = {};
		result[this.Name] = this.compile(this.rawdata);
		return result;
	} catch (ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionA4Adapter.transform');
		throw ex;
	}
};

adapter.SectionA4Adapter.prototype.compile = function _compile(data) {
	if (!data) {
		//insert error handling here
	}
	try {
		var result = [];
		var lineCount = 0;
		for (var i = 0; i < data.length; i++) {
			var transactionData = data[i];
			var transactionLines = transactionData.lines;
			var transactionLine = transactionLines[0];
			if ((Math.abs(parseFloat(transactionLine.totalGrossAmount) || 0) <= 10000) || transactionLine.entityTaxNumber == '') {
				continue;
			}

			var transactionResult = new Tax.Supplementary.VCS.CZ.Adapter.SectionA4Row();
			transactionResult.transactionId = transactionLine.documentNumber || transactionLine.transactionId;
			if (transactionLine.transactionType === 'GENJRNL' && transactionLine.documentNumberJournal) {
				transactionResult.transactionId = transactionLine.documentNumberJournal;
			}
			transactionResult.entityTaxNumber = transactionLine.entityTaxNumber;
			transactionResult.transactionDate = transactionLine.dateOfTaxableSupply || transactionLine.transactionDate;
			transactionResult.regimeCodeOfSupply = Tax.Supplementary.VCS.CZ.getCode(transactionLines[0].regimeCodeOfSupply);
			transactionResult.vatAct = transactionLine.transactionType == 'CREDMEM' ? 'A' : 'N';

			var validLineCount = 0;
			for (var j = 0; j < transactionLines.length; j++) {
				var line = transactionLines[j];
				if (!this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes)) {
					continue;
				}
				var netAmount = parseFloat(line.netAmount) || 0;
				var taxAmount = parseFloat(line.taxAmount) || 0;
				var taxCodeKey = this.taxCodeLookup.getMatchedKey(line.taxCode, this.taxCodes) + '-CZ';
				var netKey = 'netAmount' + taxCodeKey;
				var taxKey = 'taxAmount' + taxCodeKey;

				if (!transactionResult[netKey]) {
					transactionResult[netKey] = netAmount;
					transactionResult[taxKey] = taxAmount;
				} else {
					transactionResult[netKey] += netAmount;
					transactionResult[taxKey] += taxAmount;
				}
				++validLineCount;
			}
			if(validLineCount > 0){
				transactionResult.lineNumber = ++lineCount;
				result.push(transactionResult);
			}
		}
		result.sort(function(a, b) { //date, tranid
			var diff = Date.parse(a.transactionDate) - Date.parse(b.transactionDate);
			if (diff != 0) {
				return diff;
			}
			return ( a.transactionId > b.transactionId ) ? 1 : ( a.transactionId < b.transactionId ) ? -1 : 0;
		});

		return result;
	} catch (ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionA4Adapter.compile');
		throw ex;
	}
};

adapter.SectionA5Row = function SectionA5Row() {
	return {
		'netAmountS-CZ': 0,
		'taxAmountS-CZ': 0,
		'netAmountR-CZ': 0,
		'taxAmountR-CZ': 0,
		'netAmountSR-CZ': 0,
		'taxAmountSR-CZ': 0
	};
};

adapter.SectionA5Adapter = function SectionA5Adapter() {
	Tax.Adapter.BaseAdapter.call(this);
	this.Name = 'SectionA5Adapter';
	this.taxCodeLookup = VAT.TaxCodeLookup.getInstance('CZ', VAT.CZ.Report.TaxDefinition());
	this.taxCodes = ['S', 'R', 'SR'];
	this.daos = ['SalesByTaxCodeDAO', 'SalesJournalByTaxCodeDAO', 'SaleAdjustmentDetailsDAO'];
};
adapter.SectionA5Adapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

adapter.SectionA5Adapter.prototype.transform = function _transform(params) {
	if (!this.rawdata) {
		//insert error handling here
	}
	try {
		var result = {};
		result[this.Name] = [this.extract(this.rawdata)];
		return result;
	} catch (ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionA5Adapter.transform');
		throw ex;
	}
};

adapter.SectionA5Adapter.prototype.extract = function _extract(data) {
	if (!data) {
		//insert error handling here
	}
	try {
		var result = new Tax.Supplementary.VCS.CZ.Adapter.SectionA5Row();
		for (var i = 0; i < data.length; i++) {
			var transactionData = data[i];
			var transactionLines = transactionData.lines;
			if ((Math.abs(parseFloat(transactionLines[0].totalGrossAmount) || 0) > 10000) && transactionLines[0].entityTaxNumber != '') {
				continue;
			}
			for (var j = 0; j < transactionLines.length; j++) {
				var line = transactionLines[j];
				if (!this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes)) {
					continue;
				}
				var netAmount = parseFloat(line.netAmount) || 0;
				var taxAmount = parseFloat(line.taxAmount) || 0;
				var taxCodeKey = this.taxCodeLookup.getMatchedKey(line.taxCode, this.taxCodes) + '-CZ';
				var netKey = 'netAmount' + taxCodeKey;
				var taxKey = 'taxAmount' + taxCodeKey;

				if (!result[netKey]) {
					result[netKey] = netAmount;
					result[taxKey] = taxAmount;
				} else {
					result[netKey] += netAmount;
					result[taxKey] += taxAmount;
				}
			}
		}
		return result;
	} catch (ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionA5Adapter.extract');
		throw ex;
	}
};

adapter.SectionB1Row = function SectionB1Row() {
	return {
		lineNumber: '',
		entityTaxNumber: '',
		transactionId: '',
		transactionDate: '',
		netAmount1: '',
		taxAmount1: '',
		netAmount2: '',
		taxAmount2: '',
		netAmount3: '',
		taxAmount3: '',
		codeOfSupply: ''
	};
};

adapter.SectionB1Adapter = function SectionB1Adapter() {
	Tax.Adapter.BaseAdapter.call(this);
	this.Name = 'SectionB1Adapter';
	this.taxCodeLookup = VAT.TaxCodeLookup.getInstance('CZ', VAT.CZ.Report.TaxDefinition());
	this.taxCodes = ['RC', 'RCR', 'RCSR'];
	this.purchasesTaxCodes1 = ['RC'];
	this.purchasesTaxCodes2 = ['RCR'];
	this.purchasesTaxCodes3 = ['RCSR'];
	this.daos = ['PurchasesByTaxCodeDAO', 'PurchasesJournalByTaxCodeDAO', 'PurchaseAdjustmentDetailsDAO'];
};
adapter.SectionB1Adapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

adapter.SectionB1Adapter.prototype.transform = function _transform(params) {
	if (!this.rawdata) {
		//insert error handling here
	}
	try {
		var result = {};
		var compiledData = this.compile(this.rawdata);
		result[this.Name] = this.extract(compiledData);
		return result;
	} catch (ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionB1Adapter.transform');
		throw ex;
	}
};

adapter.SectionB1Adapter.prototype.compile = function _compile(data) {
	if (!data) {
		//insert error handling here
	}
	try {
		var result = [];
		for (var i = 0; i < data.length; i++) {
			var transactionData = data[i];
			var transactionLines = transactionData.lines;
			var transactionLine = transactionLines[0];
			var transactionResult = {};

			transactionResult.transactionType = transactionLine.transactionType;
			transactionResult.entityTaxNumber = transactionLine.entityTaxNumber;
			transactionResult.transactionId = transactionLine.transactionId;
			transactionResult.documentNumber = transactionLine.documentNumber;
			transactionResult.documentNumberJournal = transactionLine.documentNumberJournal;
			transactionResult.transactionDate = transactionLine.dateOfTaxableSupply || transactionLine.transactionDate;
			var codeOfSupplyResult = {};
			var validLineCount = 0;
			for (var j = 0; j < transactionLines.length; j++) {
				var line = transactionLines[j];
				if (!this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes)) {
					continue;
				}

				var itemOrExpenseCodeOfSupply = line.codeOfSupply || line.expenseCodeOfSupply;

				if(!codeOfSupplyResult[itemOrExpenseCodeOfSupply]) {
					codeOfSupplyResult[itemOrExpenseCodeOfSupply] = {netAmount1:0, taxAmount1: 0, netAmount2 : 0, taxAmount2 : 0, netAmount3 : 0, taxAmount3: 0};
				}

				var netAmount = parseFloat(line.netAmount) || 0;
				var taxAmount = parseFloat(line.notionalAmount) || 0;

				if (this.taxCodeLookup.anyOf(line.taxCode, this.purchasesTaxCodes1)) {
					codeOfSupplyResult[itemOrExpenseCodeOfSupply].netAmount1 += netAmount;
					codeOfSupplyResult[itemOrExpenseCodeOfSupply].taxAmount1 += taxAmount;
				} else if (this.taxCodeLookup.anyOf(line.taxCode, this.purchasesTaxCodes2)) {
					codeOfSupplyResult[itemOrExpenseCodeOfSupply].netAmount2 += netAmount;
					codeOfSupplyResult[itemOrExpenseCodeOfSupply].taxAmount2 += taxAmount;
				} else if (this.taxCodeLookup.anyOf(line.taxCode, this.purchasesTaxCodes3)) {
					codeOfSupplyResult[itemOrExpenseCodeOfSupply].netAmount3 += netAmount;
					codeOfSupplyResult[itemOrExpenseCodeOfSupply].taxAmount3 += taxAmount;
				}

				++validLineCount;
			}
			if (validLineCount > 0) {
				transactionResult.codeOfSupply = codeOfSupplyResult;
				result.push(transactionResult);
			}
		}
		return result;
	} catch (ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionB1Adapter.compile');
		throw ex;
	}
};

adapter.SectionB1Adapter.prototype.extract = function _extract(data) {
	 if (!data) {
			//insert error handling here
	}
	try {

		data.sort(function(a,b) {
			var diff = Date.parse(a.transactionDate) - Date.parse(b.transactionDate);
			if (diff != 0) { return diff; }

			var sortAKey = a.documentNumber || a.transactionId;
			var sortBKey = b.documentNumber || b.transactionId;

			return (sortAKey > sortBKey ) ? 1 : (sortAKey < sortBKey) ? -1 : 0;
		});

		var lineNumber = 0;
		var result = [];
		for (var i = 0; i < data.length; i++) {
			var transactionResult = data[i];
			var codeOfSupply = transactionResult.codeOfSupply;

			var cosKeys = Object.keys(codeOfSupply).sort(function (a,b) {
				return Number(Tax.Supplementary.VCS.CZ.getCode(a))- Number(Tax.Supplementary.VCS.CZ.getCode(b));});

			for (var j = 0; j < cosKeys.length; j++) {
				var row = new Tax.Supplementary.VCS.CZ.Adapter.SectionB1Row();
				row.lineNumber = ++lineNumber;
				row.transactionId = transactionResult.documentNumber || transactionResult.transactionId;
				if (transactionResult.transactionType === 'GENJRNL' && transactionResult.documentNumberJournal) {
					row.transactionId = transactionResult.documentNumberJournal;
				}
				row.entityTaxNumber = transactionResult.entityTaxNumber;
				row.transactionDate = transactionResult.transactionDate;
				row.codeOfSupply = Tax.Supplementary.VCS.CZ.getCode(cosKeys[j]);
				row.netAmount1 = codeOfSupply[cosKeys[j]].netAmount1;
				row.taxAmount1 = codeOfSupply[cosKeys[j]].taxAmount1;
				row.netAmount2 = codeOfSupply[cosKeys[j]].netAmount2;
				row.taxAmount2 = codeOfSupply[cosKeys[j]].taxAmount2;
				row.netAmount3 = codeOfSupply[cosKeys[j]].netAmount3;
				row.taxAmount3 = codeOfSupply[cosKeys[j]].taxAmount3;
				result.push(row);
			}
		}

		return result;
	} catch (ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionB1Adapter.extract');
		throw ex;
	}
};

adapter.SectionB2Row = function SectionB2Row() {
	return {
		internalId: '',
		lineNumber: '',
		entityTaxNumber: '',
		transactionId: '',
		transactionDate: '',
		netAmount1: 0,
		taxAmount1: 0,
		netAmount2: 0,
		taxAmount2: 0,
		netAmount3: 0,
		taxAmount3: 0,
		deductionAdjustment: 'No',
		deductionAdjustmentXML: 'N',
		vatAct: 'N'
	};
};

adapter.SectionB2TranIdMap = {};
adapter.SectionB2Adapter = function SectionB2Adapter() {
	Tax.Adapter.BaseAdapter.call(this);
	this.Name = 'SectionB2Adapter';
	this.taxCodeLookup = VAT.TaxCodeLookup.getInstance('CZ', VAT.CZ.Report.TaxDefinition());
	this.taxCodes = ['S', 'R', 'SR', 'Deduct_S', 'Deduct_R', 'Deduct_SR'];
	this.purchasesTaxCodes1 = ['S', 'Deduct_S'];
	this.purchasesTaxCodes2 = ['R', 'Deduct_R'];
	this.purchasesTaxCodes3 = ['SR', 'Deduct_SR'];
	this.daos = ['PurchasesByTaxCodeDAO', 'PurchasesJournalByTaxCodeDAO', 'PurchaseAdjustmentDetailsDAO'];
};
adapter.SectionB2Adapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

adapter.SectionB2Adapter.prototype.transform = function _transform(params) {
	if (!this.rawdata) {
		//insert error handling here
	}
	try {
		var result = {};
		result[this.Name] = this.extract(this.rawdata);
		return result;
	} catch (ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionB2Adapter.transform');
		throw ex;
	}
};

adapter.SectionB2Adapter.prototype.extract = function _extract(data) {
	if (!data) {
		//insert error handling here
	}
	try {
		var result = [];
		var lineCount = 0;

		for (var idata = 0; data && idata < data.length; idata++) {
			var transactionData = data[idata];
			var transactionLines = transactionData.lines;
			var transactionLine = transactionData.lines[0];
			if ((Math.abs(parseFloat(transactionLine.totalGrossAmount) || 0) <= 10000) || transactionLine.entityTaxNumber === '') {
				continue;
			}

			var transactionResult = new Tax.Supplementary.VCS.CZ.Adapter.SectionB2Row();
			transactionResult.internalId = transactionData.internalId;
			transactionResult.transactionId = transactionLine.documentNumber || transactionLine.transactionId;
			transactionResult.entityTaxNumber = transactionLine.entityTaxNumber;
			transactionResult.transactionDate = transactionLine.dateOfTaxableSupply || transactionLine.transactionDate;
			if (transactionLine.transactionType == 'BILLCRED') {
				transactionResult.vatAct = 'A';
			}
			else if (transactionLine.transactionType === 'GENJRNL') {
				transactionResult.transactionId = transactionLine.documentNumberJournal || transactionResult.transactionId;
			}

			if (transactionLine.hasDeductible === 'T') {
				transactionResult.deductionAdjustment = 'Yes';
				transactionResult.deductionAdjustmentXML = 'A';
			}

			var validLineCount = 0;
			for (var j = 0; j < transactionLines.length; j++) {
				var line = transactionLines[j];
				if (!this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes)) {
					continue;
				}

				var netAmount = parseFloat(line.netAmount) || 0;
				var taxAmount = parseFloat(line.taxAmount) || 0;

				if (this.taxCodeLookup.anyOf(line.taxCode, this.purchasesTaxCodes1)) {
					transactionResult.netAmount1 += netAmount;
					transactionResult.taxAmount1 += taxAmount;
				} else if (this.taxCodeLookup.anyOf(line.taxCode, this.purchasesTaxCodes2)) {
					transactionResult.netAmount2 += netAmount;
					transactionResult.taxAmount2 += taxAmount;
				}  else if (this.taxCodeLookup.anyOf(line.taxCode, this.purchasesTaxCodes3)) {
					transactionResult.netAmount3 += netAmount;
					transactionResult.taxAmount3 += taxAmount;
				}
				++validLineCount;
			}
			if (validLineCount > 0) {
				transactionResult.lineNumber = ++lineCount;
				result.push(transactionResult);
			}
		}

		result.sort(function(a,b) {
			var diff = Date.parse(a.transactionDate) - Date.parse(b.transactionDate);
			if (diff !== 0) {
				return diff;
			}
			return (a.transactionId > b.transactionId) ? 1 : (a.transactionId < b.transactionId) ? -1 : 0;
		});

		var tranIdMap = Tax.Supplementary.VCS.CZ.Adapter.SectionB2TranIdMap;
		for (var iresult = 0; iresult < result.length; iresult++) {
			tranIdMap[result[iresult].internalId] = iresult;
		}
		return result;
	} catch (ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionB2Adapter.extract');
		throw ex;
	}
};

adapter.SectionB2NDAdapter = function SectionB2NDAdapter() {
	Tax.Supplementary.VCS.CZ.Adapter.SectionB2Adapter.call(this);
	this.taxCodeLookup = VAT.TaxCodeLookup.getInstance('CZ', VAT.CZ.Report.TaxDefinition());
	this.taxCodes = ['NonDeduct_S', 'NonDeduct_R', 'NonDeduct_SR'];
	this.purchasesTaxCodes1 = ['NonDeduct_S',];
	this.purchasesTaxCodes2 = ['NonDeduct_R'];
	this.purchasesTaxCodes3 = ['NonDeduct_SR'];
	this.daos = ['NonDeductibleTaxSuppDAO'];
};
adapter.SectionB2NDAdapter.prototype = Object.create(Tax.Supplementary.VCS.CZ.Adapter.SectionB2Adapter.prototype);
adapter.SectionB2NDAdapter.prototype.transform = function(params) {
	if (!this.rawdata) {
		//insert error handling here
	}
	try {
		var result = {};
		result[this.Name] = this.extract(this.rawdata, params.result);
		tranIdMap = {};
		return result;
	} catch (ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionB2NDAdapter.transform');
		throw ex;
	}
};
adapter.SectionB2NDAdapter.prototype.extract = function _extract(data, resultFromPrevious) {
	if (!data) {
		//insert error handling here
	}
	try {
		var result = resultFromPrevious.adapter[this.Name];
		for (var idata = 0; data && idata < data.length; idata++) {
			var transactionData = data[idata];
			var line = transactionData.lines[0];

			var index = Tax.Supplementary.VCS.CZ.Adapter.SectionB2TranIdMap[transactionData.internalId];
			var transactionResult = result[index];
			if (!transactionResult) {
				continue;
			}

			if (!this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes)) {
				continue;
			}

			transactionResult.deductionAdjustment = 'Yes';
			transactionResult.deductionAdjustmentXML = 'A';

			var netAmount = parseFloat(line.netAmount) || 0;
			var taxAmount = parseFloat(line.taxAmount) || 0;

			if (this.taxCodeLookup.anyOf(line.taxCode, this.purchasesTaxCodes1)) {
				transactionResult.netAmount1 += netAmount;
				transactionResult.taxAmount1 += taxAmount;
			} else if (this.taxCodeLookup.anyOf(line.taxCode, this.purchasesTaxCodes2)) {
				transactionResult.netAmount2 += netAmount;
				transactionResult.taxAmount2 += taxAmount;
			}  else if (this.taxCodeLookup.anyOf(line.taxCode, this.purchasesTaxCodes3)) {
				transactionResult.netAmount3 += netAmount;
				transactionResult.taxAmount3 += taxAmount;
			}
		}
		return result;
	} catch(ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionB2NDAdapter.extract');
	}
};

adapter.SectionB3Row = function SectionB3Row() {
	return {
		internalId: '',
		netAmount1: 0,
		taxAmount1: 0,
		netAmount2: 0,
		taxAmount2: 0,
		netAmount3: 0,
		taxAmount3: 0
	};
};

adapter.SectionB3AdapterTranIds = [];
adapter.SectionB3Adapter = function SectionB3Adapter() {
	Tax.Adapter.BaseAdapter.call(this);
	this.Name = 'SectionB3Adapter';
	this.taxCodeLookup = VAT.TaxCodeLookup.getInstance('CZ', VAT.CZ.Report.TaxDefinition());
	this.taxCodes = ['S', 'R', 'SR', 'Deduct_S', 'Deduct_R', 'Deduct_SR'];
	this.purchasesTaxCodes1 = ['S', 'Deduct_S'];
	this.purchasesTaxCodes2 = ['R', 'Deduct_R'];
	this.purchasesTaxCodes3 = ['SR', 'Deduct_SR'];
	this.daos = ['PurchasesByTaxCodeDAO', 'PurchasesJournalByTaxCodeDAO', 'PurchaseAdjustmentDetailsDAO'];
};
adapter.SectionB3Adapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

adapter.SectionB3Adapter.prototype.transform = function _transform(params) {
	if (!this.rawdata) {
		//insert error handling here
	}
	try {
		var result = {};
		result[this.Name] = [this.extract(this.rawdata)];
		return result;
	} catch (ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionB3Adapter.transform');
		throw ex;
	}
};

adapter.SectionB3Adapter.prototype.extract = function _extract(data) {
	if (!data) {
		//insert error handling here
	}
	try {
		var result = new Tax.Supplementary.VCS.CZ.Adapter.SectionB3Row();
		var sectionB3TranIds = Tax.Supplementary.VCS.CZ.Adapter.SectionB3AdapterTranIds;

		for (var i = 0; i < data.length; i++) {
			var transactionData = data[i];
			var transactionLines = transactionData.lines;
			if ((Math.abs(parseFloat(transactionLines[0].totalGrossAmount) || 0) > 10000) && transactionLines[0].entityTaxNumber !== '') {
				continue;
			}
			for (var j = 0; j < transactionLines.length; j++) {
				var line = transactionLines[j];
				if (!this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes)) {
					continue;
				}

				var netAmount = parseFloat(line.netAmount) || 0;
				var taxAmount = parseFloat(line.taxAmount) || 0;

				if (this.taxCodeLookup.anyOf(line.taxCode, this.purchasesTaxCodes1)) {
					result.netAmount1 += netAmount;
					result.taxAmount1 += taxAmount;
				} else if (this.taxCodeLookup.anyOf(line.taxCode, this.purchasesTaxCodes2)) {
					result.netAmount2 += netAmount;
					result.taxAmount2 += taxAmount;
				} else if (this.taxCodeLookup.anyOf(line.taxCode, this.purchasesTaxCodes3)) {
					result.netAmount3 += netAmount;
					result.taxAmount3 += taxAmount;
				}
			}
			sectionB3TranIds.push(transactionData.internalId.toString());
		}
		return result;
	} catch (ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionB3Adapter.extract');
		throw ex;
	}
};

adapter.SectionB3NDAdapter = function SectionB3NDAdapter() {
	Tax.Supplementary.VCS.CZ.Adapter.SectionB3Adapter.call(this);
	this.taxCodeLookup = VAT.TaxCodeLookup.getInstance('CZ', VAT.CZ.Report.TaxDefinition());
	this.taxCodes = ['NonDeduct_S', 'NonDeduct_R', 'NonDeduct_SR'];
	this.purchasesTaxCodes1 = ['NonDeduct_S',];
	this.purchasesTaxCodes2 = ['NonDeduct_R'];
	this.purchasesTaxCodes3 = ['NonDeduct_SR'];
	this.daos = ['NonDeductibleTaxSuppDAO'];
};
adapter.SectionB3NDAdapter.prototype = Object.create(Tax.Supplementary.VCS.CZ.Adapter.SectionB3Adapter.prototype);
adapter.SectionB3NDAdapter.prototype.transform = function(params) {
	if (!this.rawdata) {
		//insert error handling here
	}
	try {
		var result = {};
		result[this.Name] = this.extract(this.rawdata, params.result);
		return result;
	} catch (ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionB3NDAdapter.transform');
		throw ex;
	}
};
adapter.SectionB3NDAdapter.prototype.extract = function _extract(data, resultFromPrevious) {
	if (!data) {
		//insert error handling here
	}
	try {
		var result = resultFromPrevious.adapter[this.Name];
		var transactionResult = result[0];
		var sectionB3TranIds = Tax.Supplementary.VCS.CZ.Adapter.SectionB3AdapterTranIds;

		for (var idata = 0; data && idata < data.length; idata++) {
			var transactionData = data[idata];
			var line = transactionData.lines[0];

			if (sectionB3TranIds.indexOf(transactionData.internalId) < 0) {
				continue;
			}

			if (!this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes)) {
				continue;
			}

			var netAmount = parseFloat(line.netAmount) || 0;
			var taxAmount = parseFloat(line.taxAmount) || 0;

			if (this.taxCodeLookup.anyOf(line.taxCode, this.purchasesTaxCodes1)) {
				transactionResult.netAmount1 += netAmount;
				transactionResult.taxAmount1 += taxAmount;
			} else if (this.taxCodeLookup.anyOf(line.taxCode, this.purchasesTaxCodes2)) {
				transactionResult.netAmount2 += netAmount;
				transactionResult.taxAmount2 += taxAmount;
			} else if (this.taxCodeLookup.anyOf(line.taxCode, this.purchasesTaxCodes3)) {
				transactionResult.netAmount3 += netAmount;
				transactionResult.taxAmount3 += taxAmount;
			}
		}
		return result;
	} catch(ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionB3NDAdapter.extract');
	}
};

adapter.SectionCAdapter = function SectionCAdapter() {
	Tax.Adapter.BaseAdapter.call(this);
	this.Name = 'SectionCAdapter';
	this.filters = {SectionA1Adapter:['netAmount'],
					SectionA2Adapter:['netAmount1', 'netAmount2', 'netAmount3'],
					SectionA4Adapter:['netAmountS-CZ', 'netAmountR-CZ', 'netAmountSR-CZ'],
					SectionA5Adapter:['netAmountS-CZ', 'netAmountR-CZ', 'netAmountSR-CZ'],
					SectionB1Adapter:['netAmount1', 'netAmount2', 'netAmount3'],
					SectionB2Adapter:['netAmount1', 'netAmount2', 'netAmount3'],
					SectionB3Adapter:['netAmount1', 'netAmount2', 'netAmount3']};
};

adapter.SectionCAdapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

adapter.SectionCAdapter.prototype.transform = function _transform(params) {
	try{
		var totals = this.extract(Tax.Cache.MemoryCache.getInstance().load('Collector'), params);
		var result = {};
		result[this.Name] = [{
			vcsline1: totals['SectionA4Adapter']['netAmountS-CZ'] + totals['SectionA5Adapter']['netAmountS-CZ'],
			vcsline2: totals['SectionA4Adapter']['netAmountR-CZ'] + totals['SectionA5Adapter']['netAmountR-CZ'] +
						totals['SectionA4Adapter']['netAmountSR-CZ'] + totals['SectionA5Adapter']['netAmountSR-CZ'],
			vcsline3: totals['SectionB2Adapter']['netAmount1'] + totals['SectionB3Adapter']['netAmount1'],
			vcsline4: totals['SectionB2Adapter']['netAmount2'] + totals['SectionB3Adapter']['netAmount2'] +
						totals['SectionB2Adapter']['netAmount3'] + totals['SectionB3Adapter']['netAmount3'],
			vcsline5: totals['SectionA1Adapter']['netAmount'],
			vcsline6: totals['SectionB1Adapter']['netAmount1'],
			vcsline7: totals['SectionB1Adapter']['netAmount2'] + totals['SectionB1Adapter']['netAmount3'],
			vcsline8: totals['SectionA2Adapter']['netAmount1'] + totals['SectionA2Adapter']['netAmount2'] +
						totals['SectionA2Adapter']['netAmount3'],
		}];
		return result;
	} catch(ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionCAdapter.transform');
		throw ex;
	}
};

adapter.SectionCAdapter.prototype.extract = function _extract(cachedResult, params) {
	if(!cachedResult) {
		throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A cachedResult parameter object is required.');
	}
	try {
		var totals = {};
		var formatter = new VAT.Report.FormatterSingleton.getInstance(params.subsidiary, params.countryCode);
		cachedResult.forEach(function(result) {
			Object.keys(result).forEach(function(key) {
				if((this.filters).hasOwnProperty(key)){
					totals[key] = {};
					this.filters[key].forEach(function(filter) {
						totals[key][filter] = 0;
						totals[key][filter] = result[key].reduce(function(acc, line) {
							var amount = line[filter];
							return acc += parseFloat(formatter.unformat(amount));
						}, 0);
					});
				}
			}, this);
		}, this);

		return totals;
	} catch(ex) {
		logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionCAdapter.extract');
		throw ex;
	}
};

Tax.Supplementary.VCS.CZ.Formatter = function Formatter() {
	Tax.Processor.call(this);
	this.Name = 'Formatter';
};
Tax.Supplementary.VCS.CZ.Formatter.prototype = Object.create(Tax.Processor.prototype);

Tax.Supplementary.VCS.CZ.Formatter.prototype.process = function process(result, params) {
	var isXML = params.format == 'XML' ? true : false;
	var reportFormatter = new Tax.ReportFormatter(params); //source of metaData? already contains the formatting
	var formattedResult = {};
	var row = null;
	var formattedRow = null;
	var adapterName = null;
	var adapterValue = null;
	var format = null;
	var type = null;

	var adapterKeys = Object.keys(result.adapter); // result.adapter = {headerAdapter = {regOffice: <regOffice>}} // {table1Adapter = [{customerName: customer1}, {customerName: customer2}, {}]}
	if (adapterKeys.length > 0) {
		adapterName = adapterKeys[0];
		adapterValue = result.adapter[adapterName];

		if (Array.isArray(adapterValue)) {
			formattedResult[adapterName] = [];
			for (var i=0; i<adapterValue.length;i++) {
				row = adapterValue[i];
				formattedRow = {};
				for (var columnName in row) { //transfer to common function
					formattedRow[columnName] = row[columnName];
					if (row[columnName] != '' && params.meta.columns[adapterName][columnName]) {
						format = isXML ? params.meta.columns[adapterName][columnName].format : null;
						formattedRow[columnName] = reportFormatter.format(row[columnName], params.meta.columns[adapterName][columnName].type, format);
					}
				}
				formattedResult[adapterName].push(formattedRow);
			}
		} else {
			var formattedObject = {};
			for (var columnName in adapterValue) {
				formattedObject[columnName] = adapterValue[columnName];

				if (adapterValue[columnName] != '' && params.meta.columns[adapterName][columnName]) {
					format = isXML ? params.meta.columns[adapterName][columnName].format : null;
					formattedObject[columnName] = reportFormatter.format(adapterValue[columnName], params.meta.columns[adapterName][columnName].type, format);
				}
			}
			formattedResult[adapterName] = formattedObject;
		}
	}

	result.formatter = formattedResult;
	return result;
};

Tax.Supplementary.VCS.CZ.FileManager.CZFileManager = function CZFileManager() {
	Tax.FileManager.call(this);
	this.Name = 'CZFileManager';
};
Tax.Supplementary.VCS.CZ.FileManager.CZFileManager.prototype = Object.create(Tax.FileManager.prototype);

Tax.Supplementary.VCS.CZ.FileManager.CZFileManager.prototype.process = function process(result, params) {
	var companyName = nlapiGetContext().getFeature('SUBSIDIARIES') ? SFC.System.Subsidiary(params.subsidiary, false, params.bookid).NameNoHeirarchy :
		nlapiLoadConfiguration("companyinformation").getFieldValue("companyname");
	var fileProperties = params.meta.file[params.format];
	fileProperties.format = params.format;
	fileProperties.filename = [params.filename, companyName, new Date().toString('ddMMyyyy_Hmmss')].join('_');
	fileProperties.folder = params.meta.folder;
	var fileId = this.createFile(fileProperties, result.rendered);
	var file = this.getFileById(fileId);
	result.fileUrl = params.url ? [params.url, file.getURL()].join('') : file.getURL();
	result.filename = file.getName();
	return result;
};
