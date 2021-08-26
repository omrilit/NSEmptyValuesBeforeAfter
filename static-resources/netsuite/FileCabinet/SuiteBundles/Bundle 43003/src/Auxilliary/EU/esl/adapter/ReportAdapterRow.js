/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.ESL = VAT.EU.ESL || {};
VAT.EU.ESL.Adapter = VAT.EU.ESL.Adapter || {};

VAT.EU.ESL.Adapter.ReportAdapterRow = function _ReportAdapterRow() { /* Data Structure */
    this.lineNumber = {
        value: '',
        properties: {}
    };
    
    this.countryCode = {
        value: '',
        properties: {}
    };
    
    this.countryName = {
        value: '',
        properties: {}
    };
    
    this.customerName = {
        value: '',
        properties: {}
    };
    
    this.vatNumber= {
        value: '',
        properties: {}
    };
    
    this.amount = {
        value: '',
        properties: {}
    };
    
    this.indicator = {
        value: '',
        properties: {}
    };
    
    this.exclude = {
        value: '',
        properties: {}
    };
    
    this.transactionNumber = {
        value: '',
        properties: {}
    };
    
    this.transactionType = {
        value: '',
        properties: {}
    };
    
    this.transactionDate = {
        value: '',
        properties: {}
    };
    
    this.transactionCount = {
        value: '',
        properties: {}
    };
    
    this.cancel = {
        value: '',
        properties: {}
    };
    
    this.params = {
        nexus: ''
    };

    this.pageNumber = {
    	value: ''
    };
    
//    "countrycode": objVatEcSales.CountryCode,
//    "countryname": objVatEcSales.CountryName,
//    "customername": objVatEcSales.CustomerName,
//    "vatno": objVatEcSales.CustomerVATRegistrationNumber,
//    "amount": objVatEcSales.TotalValueOfSupplies,
//    "indicator": objVatEcSales.GoodsAndServices,
//    "exclude": objVatEcSales.Exclude,
//    "hidden": hidden, 
//    "hidden2": hidden2,
//    "tranno": objVatEcSales.TransactionNumber,
//    "trantype": objVatEcSales.TransactionType,
//    "trandate": objVatEcSales.TransactionDate,
//    "trancount": objVatEcSales.TransactionCount,
//    "cancel": objVatEcSales.cancel
};

VAT.EU.ESL.Adapter.ReportAdapterRow.prototype.injectRowData = function _injectRowData(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'params is required');
    }
    
    try {
        this.lineNumber.value = params.lineNumber;
        this.countryCode.value = params.countryCode;
        this.amount.value = params.amount;
        this.indicator.value = params.indicator;
        
        this.customerName.value = params.customerName;
        this.customerName.properties['url'] = "javascript:window.open(getCustomerUrl('" + params.customerName + "'));";
        
        this.vatNumber.value = params.vatNo;
        this.transactionDate.value = params.tranDate;
        this.transactionType.value = params.tranType;
        
        this.transactionNumber.value = params.tranNo;
        this.transactionNumber.properties['url'] = "javascript:window.open(getTransactionUrl('" + params.tranNo + "', '" + params.tranType + "'));";
        this.transactionNumber.properties['color'] = CONSTANTS.COLOR.BLACK;
        
        this.params.nexus = params.nexus;
        
        this.setVariableFields();
    } catch(e) {
        logException(e, 'VAT.EU.ESL.Adapter.ReportAdapterRow.injectRowData');
        throw e;
    }
};

VAT.EU.ESL.Adapter.ReportAdapterRow.prototype.setVariableFields = function _setVariableFields() {
    var vatno = '';
    var vatnocountrycode = '';
    
    try {
        if (this.vatNumber.value) {
            // trim the first 2 chars if country code
            var re = new RegExp("[^0-9A-Za-z]", "g");  
            var formattedvalue = this.vatNumber.value.replace(re, ""); //numbers and letters only
            var prefix = formattedvalue.substring(0, 2);
            
            if (prefix && isNaN(parseInt(prefix.charAt(0))) && isNaN(parseInt(prefix.charAt(1)))) { //First 2 chars are country codes
                vatno = formattedvalue.substring(2);
                vatnocountrycode = prefix;
            } else {
                vatno = formattedvalue;
            }
        }
        
        this.vatNumber.value = vatno;
        
        if (this.customerName.value == '- No Entity -') {
            this.exclude.value = true;
        } else if (this.params.nexus == this.countryCode.value) {
            this.exclude.value = true;
            this.customerName.properties['color'] = CONSTANTS.COLOR.RED;
        } else if (this.countryCode.value && this.countryCode.value != 'null' && !CONSTANTS.EU_NEXUSES[this.countryCode.value]) {
            this.exclude.value = true;
            this.customerName.properties['color'] = CONSTANTS.COLOR.BROWN;
        } else if (!this.countryCode.value || this.countryCode.value == 'null') {
            this.exclude.value = true;
            this.customerName.properties['color'] = CONSTANTS.COLOR.MEDIUMSLATEBLUE;
        } else if (!vatno || this.vatNumber.value == 'null') {
            this.exclude.value = true;
            this.customerName.properties['color'] = CONSTANTS.COLOR.MEDIUMSLATEBLUE;
        } else {
            this.exclude.value = false;
            this.customerName.properties['color'] = CONSTANTS.COLOR.BLACK;
        }
        
        if ((vatnocountrycode == this.countryCode.value) || (!this.countryCode.value || 
        		this.countryCode.value == 'null' || this.countryCode.value == 'MC' || 
        		vatnocountrycode == 'EL')) {
            var regexFormat = CONSTANTS.VAT_FORMAT_REGEX[(this.countryCode.value && this.countryCode.value != 'null') ? this.countryCode.value : vatnocountrycode];
            
            if (!regexFormat) {
                this.vatNumber.properties['color'] = CONSTANTS.COLOR.BLACK;
            } else {
                var regex = new RegExp(regexFormat, 'g');
                if (regex.test(vatno)) {
                    this.vatNumber.properties['color'] = CONSTANTS.COLOR.BLACK;
                } else {
                    this.vatNumber.properties['color'] = CONSTANTS.COLOR.MEDIUMSLATEBLUE;
                }
            }
        } else if (vatno && vatno != '&nbsp;') {
            this.vatNumber.properties['color'] = CONSTANTS.COLOR.MEDIUMSLATEBLUE;
        } else {
            this.vatNumber.properties['color'] = CONSTANTS.COLOR.BLACK;
        }
        
        this.countryCode.value = vatnocountrycode;
    } catch (e) {
        logException(e, 'VAT.EU.ESL.Adapter.ReportAdapterRow.setVariableFields');
        throw e;
    }
    
};