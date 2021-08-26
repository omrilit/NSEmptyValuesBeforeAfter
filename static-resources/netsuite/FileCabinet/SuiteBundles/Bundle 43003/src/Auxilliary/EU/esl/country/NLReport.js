/**
 * Copyright © 2015, 2019, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.ESL = VAT.EU.ESL || {};
VAT.EU.ESL.NL = VAT.EU.ESL.NL || {};

VAT.EU.ESL.NL.DataFormatter = function _NLDataFormatter() {
    VAT.EU.BaseDataFormatter.call(this);
};

VAT.EU.ESL.NL.DataFormatter.prototype = Object.create(VAT.EU.BaseDataFormatter.prototype);

VAT.EU.ESL.NL.DataFormatter.prototype.formatData = function _formatData() {
    try {
        this.setColumnProperty('align');
        this.setDecimalPlaces(0, 'amount');
    } catch (e) {
        logException(e, 'VAT.EU.ESL.NL.DataFormatter.formatData');
        throw e;
    }
};

VAT.EU.ESL.NL.Report = function _NLReport(baseDetails, countryDetails) {
    if (!baseDetails) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'baseDetails is required');
    }
    
    if (!countryDetails) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'countryDetails is required');
    }
    
    VAT.EU.ESL.BaseReport.call(this);
    
    try {
        this.initializeBaseDetails(baseDetails);
        this.supplementCountryDetails(countryDetails);
    } catch (e) {
        logException(e, 'VAT.EU.ESL.NL.Report');
        throw e;
    }
};

VAT.EU.ESL.NL.Report.prototype = Object.create(VAT.EU.ESL.BaseReport.prototype);

VAT.EU.ESL.NL.DataAdapter = function _NLDataAdapter() {
    VAT.EU.ESL.Adapter.SalesReportAdapter.call(this);
};
VAT.EU.ESL.NL.DataAdapter.prototype = Object.create(VAT.EU.ESL.Adapter.SalesReportAdapter.prototype);

VAT.EU.ESL.NL.DataAdapter.prototype.traverseAndConsolidate = function _traverseAndConsolidate(rawTreeKey) {
    if (!rawTreeKey) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'rawTreeKey is required');
    }
    
    var processedTree = {};
    
    try {
        var rawTree = this.data[rawTreeKey];    
        
        for (var iTree = 0; rawTree && iTree < rawTree.length; iTree++) {
            var rawTreeObject = rawTree[iTree];
            var customer = this.cleanString(rawTreeObject['customer']);
            var vatNumber = this.cleanString(rawTreeObject['vatNo']);
            var billingCountryCode = rawTreeObject['billingCountry'];
            var shippingCountryCode = rawTreeObject['shippingCountry'];
            var taxCodeName = rawTreeObject['taxCode'];
            var netAmount = parseFloat(rawTreeObject['netAmount']);
            var projectVatNumber = rawTreeObject['projectVatNo'];
            var isEuTriangulation = rawTreeObject['euTriangulation'] == 'T';
            var countryCode = String(shippingCountryCode ? shippingCountryCode : (billingCountryCode ? billingCountryCode : 'null'));
            var taxCodeObject = this.taxCache.findByName(taxCodeName);
            
            if (!vatNumber || vatNumber == 'null') {
                vatNumber = projectVatNumber;
            }
            
            if (this.params.nexus && !taxCodeObject) {
                continue;
            }
            
            var isDefaultCountry = false;
            var re = new RegExp("[^0-9A-Za-z]", "g");
            var formattedVatNumber = vatNumber.replace(re, '');
            var prefix = formattedVatNumber.substring(0,2);
            
            if (prefix && isNaN(parseInt(prefix.charAt(0))) && isNaN(parseInt(prefix.charAt(1)))) { //first 2 characters are letters
                isDefaultCountry = (prefix == countryCode);
            }
            
            if (!processedTree[customer]) {
                processedTree[customer] = {
                    country: {},
                    vatno: '',
                    entityname: customer,
                    defaultcountry: ''
                };
            }
            
            var currentCustomerTree = processedTree[customer];
            currentCustomerTree.vatno = vatNumber;
            
            if (!currentCustomerTree.defaultcountry && isDefaultCountry) {
                currentCustomerTree.defaultcountry = countryCode;
            }
            
            var currentCountry = currentCustomerTree.country[countryCode];
            
            if (!currentCountry) {
                currentCustomerTree.country[countryCode] = {
                    shipcountrycode: shippingCountryCode,
                    billcountrycode: billingCountryCode,
                    servicesamount: 0, 
                    goodsamount: 0,
                    trianglegoodsamount: 0
                };
                currentCountry = currentCustomerTree.country[countryCode];
            }
            
            if (isEuTriangulation) {
            	currentCountry.trianglegoodsamount += netAmount;
            } else if (taxCodeObject.isservice) {            	
            	currentCountry.servicesamount += netAmount;
            } else {            	
            	currentCountry.goodsamount += netAmount;
            }
        };
        
        this.processedTrees.push(processedTree);
    } catch (e) {
        logException(e, 'VAT.EU.ESL.NL.DataAdapter.traverseAndConsolidate');
        throw e;
    }
};
