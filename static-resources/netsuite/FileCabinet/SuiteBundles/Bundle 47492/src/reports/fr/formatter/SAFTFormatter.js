/**
 * Copyright © 2015, 2017, 2018, 2019 Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.FR = TAF.FR || {};
TAF.FR.Formatter = TAF.FR.Formatter || {};

// START - SAFT Formatter
TAF.FR.Formatter = function _SAFTFormatter() {
	TAF.Formatter.ReportFormatter.call(this);
	
	this.fields = {};
	this.TEMPLATE = {};
	this.columns = [];
    this.multiBookJoinColumn = null;
	this.charMap = {
		quote: {regex: /"/g, replaceChar: ''},
		tab: {regex: /\t/g, replaceChar: ' '},
		feed: {regex: /\r\n|\n|\r/g, replaceChar: ' '},
		enq: {regex: //g, replaceChar: ''}
	};

	this.dateFormat = 'yyyyMMdd';
	
	this.columnDelimiter = '|';
	
	this.lineTemplate = '';
    if (this.isMultiBook && this.params.bookId) {
        this.multiBookJoinColumn = 'accountingtransaction';
    }
    this.columns.push(new nlobjSearchColumn('custcol_establishment_code', this.multiBookJoinColumn));
	this.columns.push(new nlobjSearchColumn('custbody_establishment_code', this.multiBookJoinColumn));
};

TAF.FR.Formatter.prototype = Object.create(TAF.Formatter.ReportFormatter.prototype);

TAF.FR.Formatter.prototype.formatHeader = function _formatHeader(templateColumns) {
	var headers = [];
    for (var i = 0; i < templateColumns.length; i++) {
       if(templateColumns[i].columnName === 'CodeEtbt')
       {
          if (this.resultSet && this.resultSet.length > 0) 
          {
             headers.push(templateColumns[i].columnName);
          }
       }
       else
       {
           headers.push(templateColumns[i].columnName);
       }
	}
	return headers.join(this.columnDelimiter);
};

TAF.FR.Formatter.prototype.formatLine = function _formatLine(templateColumns) {
	var line = [];

	for (var i = 0; i < templateColumns.length; i++) {
		line.push(templateColumns[i].valueKey);
	}
	
	return line.join(this.columnDelimiter);
};
// END - SAFT Formatter

// START - GL Formatter
TAF.FR.Formatter.SAFTFormatter = function _SAFTFormatter(params) {
	TAF.FR.Formatter.call(this);
	this.FILE_EXTENSION = '.txt';
	this.FILE_NAME_CONNECTOR = 'FEC';
    this.isOneWorld = nlapiGetContext().getFeature('SUBSIDIARIES');
  
    var periodFrom = {};
    this.filters = [];
    var searchObject = nlapiLoadRecord('accountingperiod', params.periodFrom);
    periodFrom.id = searchObject.getId();
    periodFrom.name = searchObject.getFieldValue('periodname') || '';
    periodFrom.startDate = searchObject.getFieldValue('startdate')  || '';
    periodFrom.endDate = searchObject.getFieldValue('enddate') || ''; 
    
    var periodTo = {};
    this.filters = [];
    var searchObject = nlapiLoadRecord('accountingperiod', params.periodTo);
    periodTo.id = searchObject.getId();
    periodTo.name = searchObject.getFieldValue('periodname') || '';
    periodTo.startDate = searchObject.getFieldValue('startdate')  || '';
    periodTo.endDate = searchObject.getFieldValue('enddate') || ''; 

    this.filters.push(new nlobjSearchFilter('custcol_establishment_code', this.multiBookJoinColumn, 'isnotempty', null, null, 1, 0, true));
    this.filters.push(new nlobjSearchFilter('custbody_establishment_code', this.multiBookJoinColumn, 'isnotempty', null, null, 0, 1, false));
    if (periodFrom.startDate) {
        this.filters.push(new nlobjSearchFilter('trandate', null, 'onorafter', periodFrom.startDate));
    }
    if (periodTo.endDate) {
        this.filters.push(new nlobjSearchFilter('trandate', null, 'onorbefore', periodTo.endDate));
    }
    if (this.isOneWorld) {
        this.filters.push(new nlobjSearchFilter('subsidiary', this.multiBookJoinColumn, 'anyof', params.subsidiary));
    }
    var search = nlapiLoadSearch('transaction', 'customsearch_taf_fr_saft_transaction');
	search.addFilters(this.filters);
	search.addColumns(this.columns);
	this.searchResult = search.runSearch();
   	this.resultSet = this.searchResult.getResults(0, 999);
	
	this.fields = {
		journalCode: {type: TAF.Formatter.FieldTypes.TEXT},
        journalLib: {type: TAF.Formatter.FieldTypes.TEXT},
        ecritureNum: {type: TAF.Formatter.FieldTypes.TEXT},
        ecritureDate: {type: TAF.Formatter.FieldTypes.DATE},
        compteNum: {type: TAF.Formatter.FieldTypes.TEXT},
        compteLib: {type: TAF.Formatter.FieldTypes.TEXT},
        compAuxNum: {type: TAF.Formatter.FieldTypes.TEXT},
        compAuxLib: {type: TAF.Formatter.FieldTypes.TEXT},
        pieceRef: {type: TAF.Formatter.FieldTypes.TEXT},
        pieceDate: {type: TAF.Formatter.FieldTypes.DATE},
        ecritureLib: {type: TAF.Formatter.FieldTypes.TEXT},
        debit: {
        	type: TAF.Formatter.FieldTypes.CURRENCY,
            thousandSign: '',
			decimalSign: ','
        },
        credit: {
            type: TAF.Formatter.FieldTypes.CURRENCY,
            thousandSign: '',
			decimalSign: ','
        },
        ecritureLet: {type: TAF.Formatter.FieldTypes.TEXT},
        dateLet: {type: TAF.Formatter.FieldTypes.DATE},
        validDate: {type: TAF.Formatter.FieldTypes.DATE},
        montantDevise: {
        	type: TAF.Formatter.FieldTypes.SIGNED_CURRENCY,
            thousandSign: '',
			decimalSign: ','
        },
        iDevise: {type: TAF.Formatter.FieldTypes.TEXT},
        codeEstablissements: {type: TAF.Formatter.FieldTypes.TEXT} };
	
	this.TEMPLATE.COLUMNS = [];
	this.TEMPLATE.COLUMNS.push({columnName: 'JournalCode', valueKey: '{journalCode}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'JournalLib', valueKey: '{journalLib}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'EcritureNum', valueKey: '{ecritureNum}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'EcritureDate', valueKey: '{ecritureDate}', constantType: SFC.Utilities.Constants.DATE, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'CompteNum', valueKey: '{compteNum}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'CompteLib', valueKey: '{compteLib}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'CompAuxNum', valueKey: '{compAuxNum}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'CompAuxLib', valueKey: '{compAuxLib}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'PieceRef', valueKey: '{pieceRef}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'PieceDate', valueKey: '{pieceDate}', constantType: SFC.Utilities.Constants.DATE, constantDescriptor: SFC.Utilities.Constants.DATEFORMAT});
	this.TEMPLATE.COLUMNS.push({columnName: 'EcritureLib', valueKey: '{ecritureLib}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor:  null});
	this.TEMPLATE.COLUMNS.push({columnName: 'Debit', valueKey: '{debit}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
	this.TEMPLATE.COLUMNS.push({columnName: 'Credit', valueKey: '{credit}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
	this.TEMPLATE.COLUMNS.push({columnName: 'EcritureLet', valueKey: '{ecritureLet}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'DateLet', valueKey: '{dateLet}', constantType: SFC.Utilities.Constants.DATE, constantDescriptor: SFC.Utilities.Constants.DATEFORMAT});
	this.TEMPLATE.COLUMNS.push({columnName: 'ValidDate', valueKey: '{validDate}', constantType: SFC.Utilities.Constants.DATE, constantDescriptor: SFC.Utilities.Constants.DATEFORMAT});
	this.TEMPLATE.COLUMNS.push({columnName: 'Montantdevise', valueKey: '{montantDevise}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
	this.TEMPLATE.COLUMNS.push({columnName: 'Idevise', valueKey: '{iDevise}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
    if (this.resultSet && this.resultSet.length > 0){
        this.TEMPLATE.COLUMNS.push({columnName: 'CodeEtbt', valueKey: '{establishmentCode}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
    }
	if (!this.lineTemplate) {
		this.lineTemplate = this.formatLine(this.TEMPLATE.COLUMNS);
	}
};

TAF.FR.Formatter.SAFTFormatter.prototype = Object.create(TAF.FR.Formatter.prototype);

TAF.FR.Formatter.SAFTFormatter.prototype.formatSAFTHeader = function _formatHeader() {
	return this.formatHeader(this.TEMPLATE.COLUMNS);
};

TAF.FR.Formatter.SAFTFormatter.prototype.formatSAFTLine = function _formatSAFTLine(data) {
	return this.formatElement(data, this.lineTemplate);
};

TAF.FR.Formatter.SAFTFormatter.prototype.formatFileName = function _formatFileName(taxNumber, date) {
    var siren = taxNumber ? taxNumber.slice(-9) : '';
    var formattedDate = this.formatDate(date, this.dateFormat);
    return siren + this.FILE_NAME_CONNECTOR + formattedDate + this.FILE_EXTENSION;
};

TAF.FR.Formatter.SAFTFormatter.prototype.formatCurrency = function _formatCurrency(data, thousandSign, decimalSign) {
    if (!data || data == 0) {
        return '0,00';
    }
    else {
        return SFC.Utilities.FormatCurrency(Math.abs(data), thousandSign, decimalSign);
    }
};

TAF.FR.Formatter.SAFTFormatter.prototype.formatSignedCurrency = function _formatSignedCurrency(data, thousandSign, decimalSign) {
    if (!data || data == 0) {
        return '';
    }
    else {
        return SFC.Utilities.FormatCurrency(data, thousandSign, decimalSign);
    }
};
// END - GL Formatter