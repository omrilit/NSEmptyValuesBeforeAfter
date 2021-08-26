/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.ESL = VAT.EU.ESL || {};
VAT.EU.ESL.Adapter = VAT.EU.ESL.Adapter || {};

VAT.EU.ESL.Adapter.SalesReportAdapter = function _SalesReportAdapter() {
    VAT.EU.BaseDataAdapter.call(this);
//    this.profiler.name = 'Performance: SalesReportAdapter';
    this.dataRowClass = VAT.EU.ESL.Adapter.ReportAdapterRow;
    
    this.processedTrees = [];
    this.output = [];
};

VAT.EU.ESL.Adapter.SalesReportAdapter.prototype = Object.create(VAT.EU.BaseDataAdapter.prototype);

VAT.EU.ESL.Adapter.SalesReportAdapter.prototype.transformData = function _transformData() {
    if (!this.params.nexus) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'params.nexus is required');
    }
    this.taxCache = new VAT.EU.TaxCodeCache(this.params.nexus);
    
    try {
        for (var rawTreeKey in this.data) {
            this.traverseAndConsolidate(rawTreeKey);
        }
        
        this.customerTree = this.processedTrees.reduce(this.appendTrees);
        this.convertTreeToRows();
        return this.output;
    } catch (e) {
        logException(e, 'VAT.EU.ESL.Adapter.SalesReportAdapter.transformData');
        throw e;
    }
    
};

VAT.EU.ESL.Adapter.SalesReportAdapter.prototype.traverseAndConsolidate = function _traverseAndConsolidate(rawTreeKey) {
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
                    returnservicesamount: 0,
                    goodsamount: 0,
                    returngoodsamount: 0,
                    trianglegoodsamount: 0,
                    returntrianglegoodsamount: 0,
                    triangulatedgoodsamount: 0,
                    returntriangulatedgoodsamount: 0
                };
                
                currentCountry = currentCustomerTree.country[countryCode];
            }
            
            if (isEuTriangulation) {
                if (netAmount > 0) {
                    currentCountry.trianglegoodsamount += netAmount;
                } else {
                    currentCountry.returntrianglegoodsamount += netAmount;
                }
            } else if (taxCodeObject.isservice) {
                if (netAmount > 0) {
                    currentCountry.servicesamount += netAmount;
                } else {
                    currentCountry.returnservicesamount += netAmount;
                }
            } else {
                if (netAmount > 0) {
                    currentCountry.goodsamount += netAmount;
                } else {
                    currentCountry.returngoodsamount += netAmount;
                }
            }
        };
        
        this.processedTrees.push(processedTree);
    } catch (e) {
        logException(e, 'VAT.EU.ESL.Adapter.SalesReportAdapter.traverseAndConsolidate');
        throw e;
    }
};

VAT.EU.ESL.Adapter.SalesReportAdapter.prototype.appendTrees = function _appendTrees(prevTree, nextTree) {
    if (!prevTree) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'prevTree is required');
    }
    
    if (!nextTree) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'nextTree is required');
    }
    
    try {
        for (var customer in nextTree) {
            if (prevTree[customer]) { // entity exists
                var customerNode = nextTree[customer];
                
                for ( var icountry in customerNode.country) {
                    var countryindex = (!icountry || icountry == "null") ? prevTree[customer].defaultcountry : icountry;
                    countryindex = countryindex || Object.keys(prevTree[customer].country)[0];
                    var countryNode = prevTree[customer].country[countryindex];
                    
                    if (countryNode) {
                        var customerCountryNode = customerNode.country[icountry];
                        countryNode.servicesamount += customerCountryNode.servicesamount;
                        countryNode.goodsamount += customerCountryNode.goodsamount;
                        countryNode.trianglegoodsamount += customerCountryNode.trianglegoodsamount;
                        countryNode.returnservicesamount += customerCountryNode.returnservicesamount;
                        countryNode.returngoodsamount += customerCountryNode.returngoodsamount;
                        countryNode.returntrianglegoodsamount += customerCountryNode.returntrianglegoodsamount;
                    } else {
                        prevTree[customer].country[countryindex] = customerNode.country[icountry];
                    }
                }
            } else {
                prevTree[customer] = nextTree[customer];
            }
        }
        
        return prevTree;
    } catch (e) {
        logException(e, 'VAT.EU.ESL.Adapter.SalesReportAdapter.appendTrees');
        throw e;
    }
};

VAT.EU.ESL.Adapter.SalesReportAdapter.prototype.convertTreeToRows = function _convertTreeToRows() {
    var lineNumber = 0;
    
    try {
        for ( var iCustTree in this.customerTree) {
            var currentNode = this.customerTree[iCustTree];
            
            if (currentNode) {
                for ( var iCountry in currentNode.country) {
                    var countryNode = currentNode.country[iCountry];
                    var countryCode = countryNode.shipcountrycode || countryNode.billcountrycode;
                    
                    lineNumber = this.createDataRows(currentNode, countryNode, countryCode, lineNumber);
                }
            }
        }
    } catch (e) {
        logException(e, 'VAT.EU.ESL.Adapter.SalesReportAdapter.convertTreeToRows');
        throw e;
    }
    
    nlapiLogExecution('Debug', 'ESL SalesReportAdapter convertTreeToRows: rowcount - ', this.output ? this.output.length : 0);
};

VAT.EU.ESL.Adapter.SalesReportAdapter.prototype.createDataRows = function _createDataRows(currentNode, countryNode, countryCode, lineNumber) {
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
        
        if (countryNode.returnservicesamount) {
            params.indicator = this.params.indicatorMap.services;
            params.lineNumber++;
            params.amount = countryNode.returnservicesamount;
            this.output.push(this.createDataRow(params));
        }
        
        if (countryNode.goodsamount) {
            params.indicator = this.params.indicatorMap.goods;
            params.lineNumber++;
            params.amount = countryNode.goodsamount;
            this.output.push(this.createDataRow(params));
        }
        
        if (countryNode.returngoodsamount) {
            params.indicator = this.params.indicatorMap.goods;
            params.lineNumber++;
            params.amount = countryNode.returngoodsamount;
            this.output.push(this.createDataRow(params));
        }
        
        if (countryNode.trianglegoodsamount) {
            params.indicator = this.params.indicatorMap.triangulation;
            params.lineNumber++;
            params.amount = countryNode.trianglegoodsamount;
            this.output.push(this.createDataRow(params));
        }
        
        if (countryNode.returntrianglegoodsamount) {
            params.indicator = this.params.indicatorMap.triangulation;
            params.lineNumber++;
            params.amount = countryNode.returntrianglegoodsamount;
            this.output.push(this.createDataRow(params));
        }
        
        return params.lineNumber;
    } catch (e) {
        logException(e, 'VAT.EU.ESL.Adapter.SalesReportAdapter.createDataRows');
        throw e;
    }
};

VAT.EU.ESL.Adapter.SalesReportAdapter.prototype.cleanString = function _cleanString(dataString) {
    if (!dataString) {
        return '';
    }
    
    for (var c in CONSTANTS.CHAR_MAP) {
        dataString = dataString.replace(c, CONSTANTS.CHAR_MAP[c]);
    }
    return dataString;
};
