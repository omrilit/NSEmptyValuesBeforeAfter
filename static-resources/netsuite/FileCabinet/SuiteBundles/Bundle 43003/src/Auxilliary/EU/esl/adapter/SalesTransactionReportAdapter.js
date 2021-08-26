/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.ESL = VAT.EU.ESL || {};
VAT.EU.ESL.Adapter = VAT.EU.ESL.Adapter || {};

VAT.EU.ESL.Adapter.SalesTransactionReportAdapter = function _SalesReportAdapter() {
    VAT.EU.BaseDataAdapter.call(this);
//    this.profiler.name = 'Performance: SalesTransactionReportAdapter';
    this.dataRowClass = VAT.EU.ESL.Adapter.ReportAdapterRow;
    
    this.processedTrees = [];
    this.output = [];
};

VAT.EU.ESL.Adapter.SalesTransactionReportAdapter.prototype = Object.create(VAT.EU.BaseDataAdapter.prototype);

VAT.EU.ESL.Adapter.SalesTransactionReportAdapter.prototype.transformData = function _transformData() {
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
        logException(e, 'VAT.EU.ESL.Adapter.SalesTransactionReportAdapter.transformData');
        throw e;
    }
};

VAT.EU.ESL.Adapter.SalesTransactionReportAdapter.prototype.traverseAndConsolidate = function _traverseAndConsolidate(rawTreeKey) {
    if (!rawTreeKey) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'rawTreeKey is required');
    }
    var processedTree = {};
    
    try {
        var rawTree = this.data[rawTreeKey];
        for (var iTree = 0; rawTree && iTree < rawTree.length; iTree++) {
            var rawTreeObject = rawTree[iTree];var customer = rawTreeObject['customer'];
            var vatNumber = rawTreeObject['vatNo'];
            var billingCountryCode = rawTreeObject['billingCountry'];
            var shippingCountryCode = rawTreeObject['shippingCountry'];
            var taxCodeName = rawTreeObject['taxCode'];
            var netAmount = parseFloat(rawTreeObject['netAmount']);
            var projectVatNumber = rawTreeObject['projectVatNo'];
            var isEuTriangulation = rawTreeObject['euTriangulation'] == 'T';
            var transactionType = rawTreeObject['transactionType'];
            var transactionNumber = rawTreeObject['transactionNumber'];
            var tranDate = rawTreeObject['trandate'];
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
                    transaction: {},
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
            
            var tranKey = transactionType + transactionNumber;
            var currentTransaction = currentCustomerTree.transaction[tranKey];
            
            if (!currentTransaction) {
                currentCustomerTree.transaction[tranKey] = {
                    tranno: transactionNumber,
                    trandate: tranDate,
                    trantype: transactionType,
                    country: {}
                };
                
                currentTransaction = currentCustomerTree.transaction[tranKey];
            }
            
            var currentCountry = currentTransaction.country[countryCode];
            
            if (!currentCountry) {
                currentTransaction.country[countryCode] = {
                    shipcountrycode: shippingCountryCode,
                    billcountrycode: billingCountryCode,
                    servicesamount: 0,
                    returnservicesamount: 0,
                    goodsamount: 0,
                    returngoodsamount: 0,
                    trianglegoodsamount: 0,
                    returntrianglegoodsamount: 0
                };
                
                currentCountry = currentTransaction.country[countryCode];
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
        logException(e, 'VAT.EU.ESL.Adapter.SalesReportAdapter.traverseAndConsolidate');
        throw e;
    }
};

VAT.EU.ESL.Adapter.SalesTransactionReportAdapter.prototype.appendTrees = function _appendTrees(prevTree, nextTree) {
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
                
                for (var itransaction in customerNode.transaction) {
                    var trannode = customerNode.transaction[itransaction];
                    prevTree[customer].transaction[itransaction] = trannode;
                }
            } else {
                prevTree[customer] = nextTree[customer];
            }
        }
        return prevTree;
    } catch (e) {
        logException(e, 'VAT.EU.ESL.Adapter.SalesTransactionReportAdapter.appendTrees');
        throw e;
    }
};

VAT.EU.ESL.Adapter.SalesTransactionReportAdapter.prototype.convertTreeToRows = function _createReportRows() {
    var lineNumber = 0;
    
    try {
        for ( var iTree in this.customerTree) {
            var currentNode = this.customerTree[iTree];
            for ( var iTran in currentNode.transaction) {
                var tranNode = currentNode.transaction[iTran];
                for ( var iCountry in tranNode.country) {
                    var countryNode = tranNode.country[iCountry];
                    var countryCode = countryNode.shipcountrycode && countryNode.shipcountrycode != '' ? countryNode.shipcountrycode : countryNode.billcountrycode;
                    
                    lineNumber = this.createDataRows(currentNode, tranNode, countryNode, countryCode, lineNumber);
                }
            }
        }
    } catch (e) {
        logException(e, 'VAT.EU.ESL.Adapter.SalesTransactionReportAdapter.convertTreeToRows');
        throw e;
    }
    nlapiLogExecution('Debug', 'ESL SalesTransactionReportAdapter convertTreeToRows: rowcount - ', this.output ? this.output.length : 0);
};

VAT.EU.ESL.Adapter.SalesTransactionReportAdapter.prototype.createDataRows = function _createDataRows(currentNode, tranNode, countryNode, countryCode, lineNumber) {
    if (!currentNode) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'currentNode is required');
    }
    
    if (!tranNode) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'tranNode is required');
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
            tranNo: tranNode.tranno,
            tranDate: tranNode.trandate,
            tranType: tranNode.trantype,
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
        logException(e, 'VAT.EU.ESL.Adapter.SalesTransactionReportAdapter.createDataRows');
        throw e;
    }
    
};