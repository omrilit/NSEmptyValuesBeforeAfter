/**
 * Copyright © 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.DE = TAF.DE || {};
TAF.DE.Formatter = TAF.DE.Formatter || {};

// START - GDPdU Formatter
TAF.DE.Formatter.GDPdUFormatter = function _GDPdUFormatter() {
	TAF.Formatter.ReportFormatter.call(this);
	
	this.fields = {};
	this.TEMPLATE = {};
	
	this.charMap = {
		quote: {regex: /"/g, replaceChar: ''},
		tab: {regex: /\t/g, replaceChar: ' '},
		feed: {regex: /\r\n|\n|\r/g, replaceChar: ' '},
		enq: {regex: //g, replaceChar: ''}
	};

	this.dateFormat = 'dd.MM.yyyy';
	
	this.columnDelimiter = '\t';
	
	this.lineTemplate = '';
};

TAF.DE.Formatter.GDPdUFormatter.prototype = Object.create(TAF.Formatter.ReportFormatter.prototype);

TAF.DE.Formatter.GDPdUFormatter.prototype.formatHeader = function _formatHeader(templateColumns) {
	var headers = [];

	for (var i = 0; i < templateColumns.length; i++) {
		headers.push(templateColumns[i].columnName);
	}
	
	return headers.join(this.columnDelimiter);
};

TAF.DE.Formatter.GDPdUFormatter.prototype.formatLine = function _formatLine(templateColumns) {
	var line = [];

	for (var i = 0; i < templateColumns.length; i++) {
		line.push(templateColumns[i].valueKey);
	}
	
	return line.join(this.columnDelimiter);
};
// END - GDPdU Formatter

// START - GL Formatter
TAF.DE.Formatter.GLFormatter = function _GLFormatter() {
	TAF.DE.Formatter.GDPdUFormatter.call(this);
	
	this.fields = {
		accountDescription: { type: TAF.Formatter.FieldTypes.TEXT },
		documentNumber: { type: TAF.Formatter.FieldTypes.TEXT },
		description: { type: TAF.Formatter.FieldTypes.TEXT },
		documentDate: { type: TAF.Formatter.FieldTypes.DATE },
		debitAmount: { 
			type: TAF.Formatter.FieldTypes.CURRENCY,
			thousandSign: '.',
			decimalSign: ','
		},
		creditAmount: { 
			type: TAF.Formatter.FieldTypes.CURRENCY,
			thousandSign: '.',
			decimalSign: ','
		}
	};
	
	this.TEMPLATE.COLUMNS = [];
	this.TEMPLATE.COLUMNS.push({columnName: 'Account_Number', columnDesc: 'Kontonummer', valueKey: '{accountNumber}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'Account_Description', columnDesc: 'Kontenbezeichnung', valueKey: '{accountDescription}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'Transaction_Type', columnDesc: 'Bewegungsart', valueKey: '{transactionType}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'Document_Date', columnDesc: 'Belegdatum', valueKey: '{documentDate}', constantType: SFC.Utilities.Constants.DATE, constantDescriptor: SFC.Utilities.Constants.DATEFORMAT});
	this.TEMPLATE.COLUMNS.push({columnName: 'Document_Number', columnDesc: 'Belegnummer', valueKey: '{documentNumber}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'Description', columnDesc: 'Buchungstext', valueKey: '{description}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'Debit_Amount', columnDesc: 'Sollbetrag', valueKey: '{debitAmount}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
	this.TEMPLATE.COLUMNS.push({columnName: 'Credit_Amount', columnDesc: 'Habenbetrag', valueKey: '{creditAmount}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
	
	if (!this.lineTemplate) {
		this.lineTemplate = this.formatLine(this.TEMPLATE.COLUMNS);
	}
};

TAF.DE.Formatter.GLFormatter.prototype = Object.create(TAF.DE.Formatter.GDPdUFormatter.prototype);

TAF.DE.Formatter.GLFormatter.prototype.formatGLHeader = function _formatGLHeader() {
	return this.formatHeader(this.TEMPLATE.COLUMNS);
};

TAF.DE.Formatter.GLFormatter.prototype.formatGLLine = function _formatGLLine(data) {
	return this.formatElement(data, this.lineTemplate);
};
// END - GL Formatter

// START - AP Formatter
TAF.DE.Formatter.APFormatter = function _APFormatter() {
	TAF.DE.Formatter.GDPdUFormatter.call(this);
	
	this.fields = {
		openingBalance: { 
			type: TAF.Formatter.FieldTypes.CURRENCY,
			thousandSign: '.',
			decimalSign: ','
		},
		companyName: { type: TAF.Formatter.FieldTypes.TEXT },
		tranDate: { type: TAF.Formatter.FieldTypes.DATE },
		referenceNumber: { type: TAF.Formatter.FieldTypes.TEXT },
		memo: { type: TAF.Formatter.FieldTypes.TEXT },
		debitAmount: { 
			type: TAF.Formatter.FieldTypes.CURRENCY,
			thousandSign: '.',
			decimalSign: ','
		},
		creditAmount: { 
			type: TAF.Formatter.FieldTypes.CURRENCY,
			thousandSign: '.',
			decimalSign: ','
		}
	};
	
	this.TEMPLATE = {};
	
	this.TEMPLATE.COLUMNS = [];
	this.TEMPLATE.COLUMNS.push({columnName: 'Opening_Balance', columnDesc: 'Eröffnungsbilanz', valueKey: '{openingBalance}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
	this.TEMPLATE.COLUMNS.push({columnName: 'Transaction_Type', columnDesc: 'Bewegungsart', valueKey: '{type}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'Internal_Trans_ID', columnDesc: 'Interne Transaktions-ID-Nr.', valueKey: '{internalId}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'Vendor_ID', columnDesc: 'Lieferanten-ID-Nr.', valueKey: '{entityId}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'Company_Name', columnDesc: 'Firmenname', valueKey: '{companyName}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'Document_Date', columnDesc: 'Belegdatum', valueKey: '{tranDate}', constantType: SFC.Utilities.Constants.DATE, constantDescriptor: SFC.Utilities.Constants.DATEFORMAT});
	this.TEMPLATE.COLUMNS.push({columnName: 'Reference_Number', columnDesc: 'Belegnummer', valueKey: '{referenceNumber}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'Description', columnDesc: 'Buchungstext', valueKey: '{memo}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'Debit_Amount', columnDesc: 'Sollbetrag', valueKey: '{debitAmount}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
	this.TEMPLATE.COLUMNS.push({columnName: 'Credit_Amount', columnDesc: 'Habenbetrag', valueKey: '{creditAmount}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
	
	if (!this.lineTemplate) {
		this.lineTemplate = this.formatLine(this.TEMPLATE.COLUMNS);
	}
};

TAF.DE.Formatter.APFormatter.prototype = Object.create(TAF.DE.Formatter.GDPdUFormatter.prototype);

TAF.DE.Formatter.APFormatter.prototype.formatAPHeader = function _formatAPHeader() {
	return this.formatHeader(this.TEMPLATE.COLUMNS);
};

TAF.DE.Formatter.APFormatter.prototype.formatAPLine = function _formatAPLine(data) {
	return this.formatElement(data, this.lineTemplate);
};
// END - AP Formatter

// START - AR Formatter
TAF.DE.Formatter.ARFormatter = function _ARFormatter() {
	TAF.DE.Formatter.GDPdUFormatter.call(this);
	
	this.fields = {
		openingBalance: { 
			type: TAF.Formatter.FieldTypes.CURRENCY,
			thousandSign: '.',
			decimalSign: ','
		},
		entityId: { type: TAF.Formatter.FieldTypes.TEXT },
		companyName: { type: TAF.Formatter.FieldTypes.TEXT },
		tranDate: { type: TAF.Formatter.FieldTypes.DATE },
		memo: { type: TAF.Formatter.FieldTypes.TEXT },
		debitAmount: { 
			type: TAF.Formatter.FieldTypes.CURRENCY,
			thousandSign: '.',
			decimalSign: ','
		},
		creditAmount: { 
			type: TAF.Formatter.FieldTypes.CURRENCY,
			thousandSign: '.',
			decimalSign: ','
		}
	};
	
	this.TEMPLATE = {};
	
	this.TEMPLATE.COLUMNS = [];
	this.TEMPLATE.COLUMNS.push({columnName: 'Opening_Balance', columnDesc: 'Eröffnungsbilanz', valueKey: '{openingBalance}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
	this.TEMPLATE.COLUMNS.push({columnName: 'Transaction_Type', columnDesc: 'Bewegungsart', valueKey: '{type}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'Internal_Trans_ID', columnDesc: 'Interne Transaktions-ID-Nr.', valueKey: '{internalId}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'Customer_ID', columnDesc: 'Kunden-ID', valueKey: '{entityId}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'Company_Name', columnDesc: 'Firmenname', valueKey: '{companyName}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'Document_Date', columnDesc: 'Belegdatum', valueKey: '{tranDate}', constantType: SFC.Utilities.Constants.DATE, constantDescriptor: SFC.Utilities.Constants.DATEFORMAT});
	this.TEMPLATE.COLUMNS.push({columnName: 'Reference_Number', columnDesc: 'Belegnummer', valueKey: '{referenceNumber}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'Description', columnDesc: 'Buchungstext', valueKey: '{memo}', constantType: SFC.Utilities.Constants.ALPHANUMERIC, constantDescriptor: null});
	this.TEMPLATE.COLUMNS.push({columnName: 'Debit_Amount', columnDesc: 'Sollbetrag', valueKey: '{debitAmount}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
	this.TEMPLATE.COLUMNS.push({columnName: 'Credit_Amount', columnDesc: 'Habenbetrag', valueKey: '{creditAmount}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
	
	if (!this.lineTemplate) {
		this.lineTemplate = this.formatLine(this.TEMPLATE.COLUMNS);
	}
};

TAF.DE.Formatter.ARFormatter.prototype = Object.create(TAF.DE.Formatter.GDPdUFormatter.prototype);

TAF.DE.Formatter.ARFormatter.prototype.formatARHeader = function _formatARHeader() {
	return this.formatHeader(this.TEMPLATE.COLUMNS);
};

TAF.DE.Formatter.ARFormatter.prototype.formatARLine = function _formatARLine(data) {
	return this.formatElement(data, this.lineTemplate);
};
// END - AR Formatter

TAF.DE.Formatter.GeneralJournalFormatter = function _GeneralJournalFormatter() {
	TAF.DE.Formatter.GDPdUFormatter.call(this);

	this.fields = {
		internalId: {type: TAF.Formatter.FieldTypes.TEXT},
		transactionType: {type: TAF.Formatter.FieldTypes.TEXT},
		date: {type: TAF.Formatter.FieldTypes.DATE},
		postingPeriod: {type: TAF.Formatter.FieldTypes.TEXT},
		documentNumber: {type: TAF.Formatter.FieldTypes.TEXT},
		description: {type: TAF.Formatter.FieldTypes.TEXT},
		debitAccount: {type: TAF.Formatter.FieldTypes.TEXT},
		debitAmount: {
			type: TAF.Formatter.FieldTypes.CURRENCY,
			thousandSign: '.',
			decimalSign: ','
		},
		creditAccount: {type: TAF.Formatter.FieldTypes.TEXT},
		creditAmount: {
			type: TAF.Formatter.FieldTypes.CURRENCY,
			thousandSign: '.',
			decimalSign: ','
		},
		vatDebitAccount: {type: TAF.Formatter.FieldTypes.TEXT},
		vatDebitAmount: {
			type: TAF.Formatter.FieldTypes.CURRENCY,
			thousandSign: '.',
			decimalSign: ','
		},
		vatCreditAccount: {type: TAF.Formatter.FieldTypes.TEXT},
		vatCreditAmount: {
			type: TAF.Formatter.FieldTypes.CURRENCY,
			thousandSign: '.',
			decimalSign: ','
		},
		taxcode: {type: TAF.Formatter.FieldTypes.TEXT},
		currency: {type: TAF.Formatter.FieldTypes.TEXT}
	};

	this.TEMPLATE = {};

	var columns = [];
	columns.push({columnName: 'Internal_ID', columnDesc: 'Interne ID-Nr.', valueKey: '{internalId}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
	columns.push({columnName: 'Transaction_Type', columnDesc: 'Bewegungsart', valueKey: '{transactionType}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
	columns.push({columnName: 'Date', columnDesc: 'Buchungsdatum', valueKey: '{date}', constantType: SFC.Utilities.Constants.DATE, constantDescriptor: SFC.Utilities.Constants.DATEFORMAT});
	columns.push({columnName: 'Posting_Period', columnDesc: 'Buchungsperiode', valueKey: '{postingPeriod}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
	columns.push({columnName: 'Document_Number', columnDesc: 'Belegnummer', valueKey: '{documentNumber}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
	columns.push({columnName: 'Description', columnDesc: 'Buchungstext', valueKey: '{description}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
	columns.push({columnName: 'Debit_Account', columnDesc: 'Sollkonto', valueKey: '{debitAccount}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
	columns.push({columnName: 'Debit_Amount', columnDesc: 'Sollbetrag', valueKey: '{debitAmount}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
	columns.push({columnName: 'Credit_Account', columnDesc: 'Habenkonto', valueKey: '{creditAccount}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
	columns.push({columnName: 'Credit_Amount', columnDesc: 'Habenbetrag', valueKey: '{creditAmount}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
	columns.push({columnName: 'VAT_Debit_Account', columnDesc: 'Soll-Kontonummer', valueKey: '{vatDebitAccount}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
	columns.push({columnName: 'VAT_Debit_Amount', columnDesc: 'Sollbetrag', valueKey: '{vatDebitAmount}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
	columns.push({columnName: 'VAT_Credit_Account', columnDesc: 'Haben-Kontonummer', valueKey: '{vatCreditAccount}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
	columns.push({columnName: 'VAT_Credit_Amount', columnDesc: 'Habenbetrag', valueKey: '{vatCreditAmount}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
	columns.push({columnName: 'Tax_Code', columnDesc: 'Steuerschlüssel', valueKey: '{taxcode}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
	columns.push({columnName: 'Currency', columnDesc: 'Währung', valueKey: '{currency}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
	this.TEMPLATE.COLUMNS = columns;

	if (!this.lineTemplate) {
		this.lineTemplate = this.formatLine(this.TEMPLATE.COLUMNS);
	}
};
TAF.DE.Formatter.GeneralJournalFormatter.prototype = Object.create(TAF.DE.Formatter.GDPdUFormatter.prototype);

TAF.DE.Formatter.GeneralJournalFormatter.prototype.formatGJHeader = function _formatGJHeader() {
	return this.formatHeader(this.TEMPLATE.COLUMNS);
};

TAF.DE.Formatter.GeneralJournalFormatter.prototype.formatGJLine = function _formatGJLine(data) {
	return this.formatElement(data, this.lineTemplate);
};

TAF.DE.Formatter.AnnualVatFormatter = function _AnnualVatFormatter() {
	TAF.DE.Formatter.GDPdUFormatter.call(this);

	this.fields = {
		taxCode: {type: TAF.Formatter.FieldTypes.TEXT},
		description: {type: TAF.Formatter.FieldTypes.TEXT},
		total: {
			type: TAF.Formatter.FieldTypes.CURRENCY,
			thousandSign: '.',
			decimalSign: ','
		}
	};

	this.TEMPLATE = {};

	var columns = [];
	columns.push({columnName: 'Tax_Code', columnDesc: 'Steuerschlüssel', valueKey: '{taxCode}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
	columns.push({columnName: 'Amount_Type', columnDesc: 'Betrag Art', valueKey: '{description}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
	columns.push({columnName: 'Total', columnDesc: 'Saldo', valueKey: '{total}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
	this.TEMPLATE.COLUMNS = columns;

	if (!this.lineTemplate) {
		this.lineTemplate = this.formatLine(this.TEMPLATE.COLUMNS);
	}
};
TAF.DE.Formatter.AnnualVatFormatter.prototype = Object.create(TAF.DE.Formatter.GDPdUFormatter.prototype);

TAF.DE.Formatter.AnnualVatFormatter.prototype.addPeriodFields = function _addPeriodFields(periods) {
	var columns = this.TEMPLATE.COLUMNS;
	for (var iperiod = 0; iperiod < periods.length; iperiod++) {
		var period = periods[iperiod];
		this.fields[period] = {
			type: TAF.Formatter.FieldTypes.CURRENCY,
			thousandSign: '.',
			decimalSign: ','
		};
		columns.push({
			columnName: period, 
			valueKey: '{'+period+'}', 
			constantType: SFC.Utilities.Constants.NUMERIC, 
			constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY
		});
	}
	this.lineTemplate = this.formatLine(this.TEMPLATE.COLUMNS);
};

TAF.DE.Formatter.AnnualVatFormatter.prototype.formatAVHeader = function _formatAVHeader() {
	return this.formatHeader(this.TEMPLATE.COLUMNS);
};

TAF.DE.Formatter.AnnualVatFormatter.prototype.formatAVLine = function _formatAVLine(data) {
	return this.formatElement(data, this.lineTemplate);
};

//START - Sums And Balances Formatter
TAF.DE.Formatter.SumsAndBalancesFormatter = function _SumsAndBalancesFormatter() {
  TAF.DE.Formatter.GDPdUFormatter.call(this);

  this.fields = {
      accountName: {type: TAF.Formatter.FieldTypes.TEXT},
      lastPostingDate: {type: TAF.Formatter.FieldTypes.DATE},
      openingBalanceDebit: {
          type: TAF.Formatter.FieldTypes.CURRENCY,
          thousandSign: '.',
          decimalSign: ','
      },
      openingBalanceCredit: {
          type: TAF.Formatter.FieldTypes.CURRENCY,
          thousandSign: '.',
          decimalSign: ','
      },
      totalDebit: {
          type: TAF.Formatter.FieldTypes.CURRENCY,
          thousandSign: '.',
          decimalSign: ','
      },
      totalCredit: {
          type: TAF.Formatter.FieldTypes.CURRENCY,
          thousandSign: '.',
          decimalSign: ','
      },
      ytdDebit: {
          type: TAF.Formatter.FieldTypes.CURRENCY,
          thousandSign: '.',
          decimalSign: ','
      },
      ytdCredit: {
          type: TAF.Formatter.FieldTypes.CURRENCY,
          thousandSign: '.',
          decimalSign: ','
      },
      ytdBalanceDebit: {
          type: TAF.Formatter.FieldTypes.CURRENCY,
          thousandSign: '.',
          decimalSign: ','
      },
      ytdBalanceCredit: {
          type: TAF.Formatter.FieldTypes.CURRENCY,
          thousandSign: '.',
          decimalSign: ','
      }
  };

  this.TEMPLATE = {};

  var columns = [];
  columns.push({columnName: 'Account_ID', columnDesc: 'Konto-ID-Nr.', valueKey: '{accountNumber}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
  columns.push({columnName: 'Account_Name', columnDesc: 'Kontoname', valueKey: '{accountName}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
  columns.push({columnName: 'Last_Posting_Date', columnDesc: 'Letztes Buchungsdatum', valueKey: '{lastPostingDate}', constantType: SFC.Utilities.Constants.DATE, constantDescriptor: SFC.Utilities.Constants.DATEFORMAT});
  columns.push({columnName: 'Opening_Balance_Debit', columnDesc: 'Eröffnungsbilanz Soll', valueKey: '{openingBalanceDebit}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
  columns.push({columnName: 'Opening_Balance_Credit', columnDesc: 'Eröffnungsbilanz Haben', valueKey: '{openingBalanceCredit}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
  columns.push({columnName: 'Total_Debit', columnDesc: 'Soll', valueKey: '{totalDebit}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
  columns.push({columnName: 'Total_Credit', columnDesc: 'Haben', valueKey: '{totalCredit}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
  columns.push({columnName: 'YTD_Debit', columnDesc: 'Aktuelles Jahr - Soll', valueKey: '{ytdDebit}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
  columns.push({columnName: 'YTD_Credit', columnDesc: 'Aktuelles Jahr - Haben', valueKey: '{ytdCredit}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
  columns.push({columnName: 'YTD_Balance_Debit', columnDesc: 'Sollsaldo des aktuellen Jahr', valueKey: '{ytdBalanceDebit}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
  columns.push({columnName: 'YTD_Balance_Credit', columnDesc: 'Habensaldo des aktuellen Jahr', valueKey: '{ytdBalanceCredit}', constantType: SFC.Utilities.Constants.NUMERIC, constantDescriptor: SFC.Utilities.Constants.NUMERICACCURACY});
  this.TEMPLATE.COLUMNS = columns;

  if (!this.lineTemplate) {
      this.lineTemplate = this.formatLine(this.TEMPLATE.COLUMNS);
  }
};
TAF.DE.Formatter.SumsAndBalancesFormatter.prototype = Object.create(TAF.DE.Formatter.GDPdUFormatter.prototype);

TAF.DE.Formatter.SumsAndBalancesFormatter.prototype.formatSABHeader = function _formatSABHeader() {
  return this.formatHeader(this.TEMPLATE.COLUMNS);
};

TAF.DE.Formatter.SumsAndBalancesFormatter.prototype.formatSABLine = function _formatSABLine(data) {
  return this.formatElement(data, this.lineTemplate);
};
//END - Sums And Balances Formatter

//START - Receivables Master Data Formatter
TAF.DE.Formatter.ReceivablesMasterDataFormatter = function _ReceivablesMasterDataFormatter() {
    TAF.DE.Formatter.GDPdUFormatter.call(this);
    
    this.fields = {
        entity: {type: TAF.Formatter.FieldTypes.TEXT},
        accountDescription: {type: TAF.Formatter.FieldTypes.TEXT},
        companyName: {type: TAF.Formatter.FieldTypes.TEXT},
        streetAddress: {type: TAF.Formatter.FieldTypes.TEXT},
        postCode: {type: TAF.Formatter.FieldTypes.TEXT},
        location: {type: TAF.Formatter.FieldTypes.TEXT},
        country: {type: TAF.Formatter.FieldTypes.TEXT},
        vatRegistrationNumber: {type: TAF.Formatter.FieldTypes.TEXT},
        taxNumber: {type: TAF.Formatter.FieldTypes.TEXT},
    };
    
    this.TEMPLATE = {};
    
    var columns = [];
    columns.push({columnName: 'Customer_ID', columnDesc: 'Kunden-ID', valueKey: '{entityId}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
    columns.push({columnName: 'Account_Description', columnDesc: 'Kontenbezeichnung', valueKey: '{accountDescription}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
    columns.push({columnName: 'Company_Name', columnDesc: 'Firmenname', valueKey: '{companyName}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
    columns.push({columnName: 'Street_Address', columnDesc: 'Adresse', valueKey: '{streetAddress}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
    columns.push({columnName: 'Postcode', columnDesc: 'Postleitzahl', valueKey: '{postCode}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
    columns.push({columnName: 'Location', columnDesc: 'Standort', valueKey: '{location}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
    columns.push({columnName: 'Country', columnDesc: 'Land', valueKey: '{country}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
    columns.push({columnName: 'VAT_Registration_Number', columnDesc: 'MwSt.-Steuernummer', valueKey: '{vatRegistrationNumber}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
    columns.push({columnName: 'Tax_Number', columnDesc: 'Steuernummer', valueKey: '{taxNumber}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
    this.TEMPLATE.COLUMNS = columns;
    
    if (!this.lineTemplate) {
        this.lineTemplate = this.formatLine(this.TEMPLATE.COLUMNS);
    }
};
TAF.DE.Formatter.ReceivablesMasterDataFormatter.prototype = Object.create(TAF.DE.Formatter.GDPdUFormatter.prototype);

TAF.DE.Formatter.ReceivablesMasterDataFormatter.prototype.formatRMDHeader = function _formatRMDHeader() {
    return this.formatHeader(this.TEMPLATE.COLUMNS);
};

TAF.DE.Formatter.ReceivablesMasterDataFormatter.prototype.formatRMDLine = function _formatRMDLine(data) {
    return this.formatElement(data, this.lineTemplate);
};
//END - Receivables Master Data Formatter

//START - Payables Master Data Formatter
TAF.DE.Formatter.PayablesMasterDataFormatter = function _PayablesMasterDataFormatter() {
    TAF.DE.Formatter.GDPdUFormatter.call(this);
    
    this.fields = {
        entity: {type: TAF.Formatter.FieldTypes.TEXT},
        accountDescription: {type: TAF.Formatter.FieldTypes.TEXT},
        companyName: {type: TAF.Formatter.FieldTypes.TEXT},
        streetAddress: {type: TAF.Formatter.FieldTypes.TEXT},
        postCode: {type: TAF.Formatter.FieldTypes.TEXT},
        location: {type: TAF.Formatter.FieldTypes.TEXT},
        country: {type: TAF.Formatter.FieldTypes.TEXT},
        vatRegistrationNumber: {type: TAF.Formatter.FieldTypes.TEXT},
        taxNumber: {type: TAF.Formatter.FieldTypes.TEXT},
    };
    
    this.TEMPLATE = {};
    
    var columns = [];
    columns.push({columnName: 'Vendor_ID', columnDesc: 'Lieferanten-ID-Nr.', valueKey: '{entityId}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
    columns.push({columnName: 'Account_Description', columnDesc: 'Kontenbezeichnung', valueKey: '{accountDescription}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
    columns.push({columnName: 'Company_Name', columnDesc: 'Firmenname', valueKey: '{companyName}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
    columns.push({columnName: 'Street_Address', columnDesc: 'Adresse', valueKey: '{streetAddress}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
    columns.push({columnName: 'Postcode', columnDesc: 'Postleitzahl', valueKey: '{postCode}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
    columns.push({columnName: 'Location', columnDesc: 'Standort', valueKey: '{location}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
    columns.push({columnName: 'Country', columnDesc: 'Land', valueKey: '{country}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
    columns.push({columnName: 'VAT_Registration_Number', columnDesc: 'MwSt.-Steuernummer', valueKey: '{vatRegistrationNumber}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
    columns.push({columnName: 'Tax_Number', columnDesc: 'Steuernummer', valueKey: '{taxNumber}', constantType: SFC.Utilities.Constants.ALPHANUMERIC});
    this.TEMPLATE.COLUMNS = columns;
    
    if (!this.lineTemplate) {
        this.lineTemplate = this.formatLine(this.TEMPLATE.COLUMNS);
    }
};
TAF.DE.Formatter.PayablesMasterDataFormatter.prototype = Object.create(TAF.DE.Formatter.GDPdUFormatter.prototype);

TAF.DE.Formatter.PayablesMasterDataFormatter.prototype.formatPMDHeader = function _formatPMDHeader() {
    return this.formatHeader(this.TEMPLATE.COLUMNS);
};

TAF.DE.Formatter.PayablesMasterDataFormatter.prototype.formatPMDLine = function _formatPMDLine(data) {
    return this.formatElement(data, this.lineTemplate);
};
//END - Payables Master Data Formatter