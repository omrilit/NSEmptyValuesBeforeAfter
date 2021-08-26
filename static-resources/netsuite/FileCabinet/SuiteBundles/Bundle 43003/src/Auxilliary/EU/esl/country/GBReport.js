/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.ESL = VAT.EU.ESL || {};
VAT.EU.ESL.GB = VAT.EU.ESL.GB || {};

VAT.EU.ESL.GB.Report = function _GBReport(baseDetails, countryDetails) {
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
		this.initializeSetupTaxFilingDetails();
	} catch (e) {
		logException(e, 'VAT.EU.ESL.GB.Report');
		throw e;
	}
};
VAT.EU.ESL.GB.Report.prototype = Object.create(VAT.EU.ESL.BaseReport.prototype);

VAT.EU.ESL.GB.Report.prototype.initializeSetupTaxFilingDetails = function() {
	this.Name = 'United Kingdom';
	this.CountryCode = 'GB';
};

VAT.EU.ESL.GB.DataFormatter = function _GBDataFormatter() {
	VAT.EU.BaseDataFormatter.call(this);
};
VAT.EU.ESL.GB.DataFormatter.prototype = Object.create(VAT.EU.BaseDataFormatter.prototype);

VAT.EU.ESL.GB.DataFormatter.prototype.formatData = function _formatData() {
	try {
		this.setColumnProperty('align');
		this.roundDown(0, 'amount');
	} catch (e) {
		logException(e, 'VAT.EU.ESL.GB.DataFormatter.formatData');
		throw e;
	}
};

VAT.EU.ESL.GB.DataFormatter.prototype.roundDown = function _roundDown(decimalPlaces, columnKey) {
    if (!decimalPlaces && (decimalPlaces != 0)) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'decimalPlaces is required');
    }
    
    if (!columnKey) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'columnKey is required');
    }
    
    try {
        for (var i = 0; this.data && (i < this.data.length); i++) {
            var reportRow = this.data[i][columnKey];
            reportRow.value = Math.floor(reportRow.value).toFixed(decimalPlaces);
        }
    } catch (e) {
        logException(e, 'VAT.EU.BaseDataFormatter.setDecimalPlaces');
        throw e;
    }
}

VAT.EU.ESL.GB.DataAdapter = function _DEDataAdapter() {
    VAT.EU.ESL.Adapter.SalesReportAdapter.call(this);
};
VAT.EU.ESL.GB.DataAdapter.prototype = Object.create(VAT.EU.ESL.Adapter.SalesReportAdapter.prototype);

VAT.EU.ESL.GB.DataAdapter.prototype.traverseAndConsolidate = function _traverseAndConsolidate(rawTreeKey) {
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
        logException(e, 'VAT.EU.ESL.GB.DataAdapter.traverseAndConsolidate');
        throw e;
    }
};

VAT.EU.ESL.GB.DataAdapter.prototype.createDataRows = function _createDataRows(currentNode, countryNode, countryCode, lineNumber) {
    if (!currentNode) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'currentNode is required');
    }
    
    if (!countryNode) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'countryNode is required');
    }
    
    if (!lineNumber && lineNumber != 0) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'lineNumber is required');
    }
    
    try {
        var params = {
            lineNumber: lineNumber,
            countryCode: countryCode,
            amount: 0,
            indicator: '',
            customerName: currentNode.entityname,
            vatNo: currentNode.vatno,
            tranNo: '',
            tranDate: '',
            tranType: '',
            nexus: this.params.nexus
        };
        
        if (countryNode.servicesamount) {
            params.indicator = this.params.indicatorMap.services;
            params.lineNumber++;
            params.amount = countryNode.servicesamount;
            this.output.push(this.createDataRow(params));
        }
        
        if (countryNode.goodsamount) {
            params.indicator = this.params.indicatorMap.goods;
            params.lineNumber++;
            params.amount = countryNode.goodsamount;
            this.output.push(this.createDataRow(params));
        }
        
        if (countryNode.trianglegoodsamount) {
            params.indicator = this.params.indicatorMap.triangulation;
            params.lineNumber++;
            params.amount = countryNode.trianglegoodsamount;
            this.output.push(this.createDataRow(params));
        }
        
        return params.lineNumber;
    } catch (e) {
        logException(e, 'VAT.EU.ESL.DE.DataAdapter.createDataRows');
        throw e;
    }
};

