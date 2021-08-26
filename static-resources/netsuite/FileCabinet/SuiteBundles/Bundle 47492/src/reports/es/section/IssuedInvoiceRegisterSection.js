/**
 * Copyright © 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Section = TAF.ES.Section || {};

TAF.ES.Section.IssuedInvoiceRegisterSection = function _IssuedInvoiceRegisterSection(state, params, output, job) {
    TAF.ES.Section.SIIRegisterSection.apply(this, arguments);
    this.Name = 'IssuedInvoices';
};
TAF.ES.Section.IssuedInvoiceRegisterSection.prototype = Object.create(TAF.ES.Section.SIIRegisterSection.prototype);

TAF.ES.Section.IssuedInvoiceRegisterSection.prototype.On_Init = function _On_Init() {
    var listValueMap = new TAF.ES.DAO.ListValuesDAO().search({}).getMap();
    this.dao = new TAF.ES.DAO.IssuedInvoiceDAO();
    this.adapter = new TAF.ES.Adapter.IssuedInvoiceAdapter(listValueMap);
    this.formatter = this.params.formatter;
    this.resource = new ResourceMgr(this.params.job_params.CultureId);

    if (!this.state[this.Name]) {
        this.initState();
    } else if (this.state[this.Name].fileIndex) {
        this.state[this.Name].fileIndex++;
    }

    this.VALID_RATES = [0, 4, 10, 21];
    this.SURCHARGE_RATES = [5.2, 1.4, 0.5, 1.75];
};

TAF.ES.Section.IssuedInvoiceRegisterSection.prototype.initState = function _initState(txnObject, searchIndex, txnCount, fileIndex) {
    this.state[this.Name] = {
        fileIndex: fileIndex || null,
        txnCount: txnCount || 0,
        currentTxnLineIndex: 0,
        currentSearchIndex: searchIndex || 0,
        currentTranId: txnObject ? txnObject.internalId : null,
        currentTransaction: txnObject || {},
        currentTxnLineKey: '',
        linesExemptIndexMap: {},
        servicesLineIndexMap: {},
        servicesExemptIndexMap: {},
        goodsLineIndexMap: {},
        goodsExemptIndexMap: {}
    };
};

TAF.ES.Section.IssuedInvoiceRegisterSection.prototype.processList = function _processList(lines, callbackFxn1, callbackFxn2, hasMoreRows) {
	// added parameter "hasMoreRows" to processList  for the Issue 611359 Tax Audit Files: Spain Issued Invoices > Invoice is Being Duplicated in XML File.
    if (!lines) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.ES.Section.IssuedInvoiceRegisterSection.processList: lines is a required parameter');
    }

    var index;
    var length;
    var line;

    for (index = 0, length = lines.length; index < length; index++) {
        this.state[this.Name].currentSearchIndex++;
        line = lines[index];
        if (this.state[this.Name].currentTranId !== line.internalId) {
            if (this.isValidTransaction(this.state[this.Name].currentTransaction)) {
                this.checkMacroData();
                this.processTransaction('getRegistroLRfacturasEmitidas', this.state[this.Name].currentTransaction);
            }
            if (this.isMaxTransactionReached()) {
                return;
            }
            this.state[this.Name].currentTranId = line.internalId;
            this.initState(this.adapter.createTxnObject(line, this.state.CompanyInformation, this.resource),
                this.state[this.Name].currentSearchIndex, this.state[this.Name].txnCount,
                this.state[this.Name].fileIndex);
        }

        this.processLine(line);

        if (this.job.IsThresholdReached()) {
            return;
        }
    }

    // add the last txn to the file
    if (this.isValidTransaction(this.state[this.Name].currentTransaction) && !hasMoreRows) {
        this.checkMacroData();
        this.processTransaction('getRegistroLRfacturasEmitidas', this.state[this.Name].currentTransaction);
    }
};

TAF.ES.Section.IssuedInvoiceRegisterSection.prototype.isValidTransaction = function _isValidTransaction(txnObject) {
    var result = false;

    if (txnObject && JSON.stringify(txnObject) !== '{}') {
        var hasLines = (txnObject.lines && txnObject.lines.length > 0)
        	|| (txnObject.serviceLines && txnObject.serviceLines.length > 0)
        	|| (txnObject.exemptLines && txnObject.exemptLines.length > 0)
        	||  (txnObject.goodsExemptLines && txnObject.goodsExemptLines.length > 0)
        	||  (txnObject.servicesExemptLines && txnObject.servicesExemptLines.length > 0);
        var hasExemption = (txnObject.exemptLines && txnObject.exemptLines.length > 0)
        	|| (txnObject.goodsExemptLines && txnObject.goodsExemptLines.length > 0)
        	|| (txnObject.servicesExemptLines && txnObject.servicesExemptLines.length > 0);
        var isNotSubject = txnObject.servicesNotSubjectAmount != 0 || txnObject.notSubjectAmount != 0;
        if (hasLines || hasExemption || isNotSubject) {
            result = true;
        }
    }

    return result;
};

TAF.ES.Section.IssuedInvoiceRegisterSection.prototype.setExemptionClassification = function _setExemptionClassification(classification, listName) {
    var exemptionClassification = this.state[this.Name].currentTransaction[listName + 'ExemptionClassification'];

    listName = !listName ? 'lines' : listName;
    if (!exemptionClassification) {
        this.state[this.Name].currentTransaction[listName + 'ExemptionClassification'] = classification;
    } else if (exemptionClassification !== classification) {
        this.state[this.Name].currentTransaction[listName + 'ExemptionClassification'] = TAF.SII.CONSTANTS.TRANSACTION.EXEMPTION_MIXED;
    }
};

TAF.ES.Section.IssuedInvoiceRegisterSection.prototype.processLine = function _processLine(line) {
    if (!line) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.ES.Section.InvoiceRegisterSection.processLine: line is a required parameter');
    }

    if (line.exemptionLineDetails || line.exemptionDetails) {
        this.processExemptBreakDown(line);
    } else if (this.state[this.Name].currentTransaction.specialSchemeCode === TAF.SII.CONSTANTS.TRANSACTION.SPCL_SCHEME_CODE_IMPORT) {
        this.processNotSubjectBreakDown(line);
    } else  {
        this.processLineBreakDown(line);
    }
    this.processedLineCount++;
};

TAF.ES.Section.IssuedInvoiceRegisterSection.prototype.processNotSubjectBreakDown = function _processNotSubjectBreakDown(line) {
    if (!line) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.ES.Section.InvoiceRegisterSection.processNotSubjectBreakDown: line is a required parameter');
    }

    var txnLineObject = this.adapter.createTxnLineObject(line);

    // Consolidate line amounts depending on the invoice/item type
    if (this.state[this.Name].currentTransaction.isTransactionType && txnLineObject.isService) {
        this.state[this.Name].currentTransaction.servicesNotSubjectAmount += txnLineObject.signedAmount;
    } else {
        this.state[this.Name].currentTransaction.notSubjectAmount += txnLineObject.signedAmount;
    }
	
    this.state[this.Name].currentTransaction.total += txnLineObject.signedAmount;    

};

TAF.ES.Section.IssuedInvoiceRegisterSection.prototype.processExemptBreakDown = function _processExemptBreakDown(line) {
    if (!line) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.ES.Section.InvoiceRegisterSection.processExemptBreakDown: line is a required parameter');
    }

    var txnLineObject = this.adapter.createTxnLineObject(line);
    var currentIndexMap;
    var currentTxnLineKey;
    var index;
    var listName;
    var txnLine;
    this.state[this.Name].currentTxnLineKey = txnLineObject.exemptionDetails;
    
    // Consolidate line amounts depending on the invoice/item type
    if (!this.state[this.Name].currentTransaction.isTransactionType) {
        currentIndexMap = this.state[this.Name].linesExemptIndexMap;
        currentTxnLineKey = 'linesExempt' + this.state[this.Name].currentTxnLineKey;
        listName = 'exemptLines';
    } else if (this.state[this.Name].currentTransaction.isTransactionType && txnLineObject.isService) {
        currentIndexMap = this.state[this.Name].servicesExemptIndexMap;
        currentTxnLineKey = 'servicesExempt' + this.state[this.Name].currentTxnLineKey;
        listName = 'servicesExemptLines';
    } else {
    	currentIndexMap = this.state[this.Name].goodsExemptIndexMap;
        currentTxnLineKey = 'goodsExempt' + this.state[this.Name].currentTxnLineKey;
        listName = 'goodsExemptLines';
    }

	// Add the line to the appropriate list
    if (currentIndexMap[currentTxnLineKey] === undefined) {
    	txnLine = { signedAmount: 0 };
    	txnLine.exemptCode = txnLineObject.exemptionDetails;
        currentIndexMap[currentTxnLineKey] = this.state[this.Name].currentTransaction[listName].push(txnLine) - 1;
    }

    // Update the amounts of the current transaction line
    index = currentIndexMap[currentTxnLineKey];
    this.state[this.Name].currentTransaction[listName][index].signedAmount += txnLineObject.signedAmount;
    if (TAF.SII.CONSTANTS.TRANSACTION.SPCL_SCHEME_CODE_LIST.indexOf(this.state[this.Name].currentTransaction.specialSchemeCode) > -1)
    {
       this.state[this.Name].currentTransaction.total += txnLineObject.signedAmount;
    }
};

TAF.ES.Section.IssuedInvoiceRegisterSection.prototype.processLineBreakDown = function _processLineBreakDown(line) {
    if (!line) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.ES.Section.InvoiceRegisterSection.processLineBreakDown: line is a required parameter');
    }

    var txnLineObject = this.adapter.createTxnLineObject(line);
    var currentIndexMap;
    var currentTxnLineKey;
    var index;
    var listName;
    var taxRateName = null;
    var taxAmountName = null;
    var txnLine;

    // Consolidate lines depending on the invoice/item type
    if (this.state[this.Name].currentTransaction.isTransactionType && txnLineObject.isService) {
        currentIndexMap = this.state[this.Name].servicesLineIndexMap;
        listName = 'serviceLines';
        this.state[this.Name].currentTransaction.servicesTaxableAmount += txnLineObject.signedAmount;
    } else {
        currentIndexMap = this.state[this.Name].goodsLineIndexMap;
        listName = 'lines';
        this.state[this.Name].currentTransaction.taxableAmount += txnLineObject.signedAmount;
    }
    this.state[this.Name].currentTxnLineKey = txnLineObject.taxRate;
    currentTxnLineKey = txnLineObject.taxRate;

    // Determine type of tax item line
    // Other tax rates not on SURCHARGE_RATES and VALID_RATES are ignored
    if (this.SURCHARGE_RATES.indexOf(txnLineObject.taxRate) > -1) {
        taxRateName = 'surchargeTaxRate';
        taxAmountName = 'surchargeTaxAmount';
        this.setExemptionClassification(TAF.SII.CONSTANTS.TRANSACTION.EXEMPTION_ALL_SURCHARGE, listName);
    } else if (this.VALID_RATES.indexOf(txnLineObject.taxRate) > -1) {
        taxRateName = 'taxRate';
        taxAmountName = 'taxAmount';
        this.setExemptionClassification(TAF.SII.CONSTANTS.TRANSACTION.EXEMPTION_NO_SURCHARGE, listName);
    }

    // Do not add line items wth unsupported tax rates
    if (taxRateName && taxAmountName) {
        this.state[this.Name].currentTransaction.total += txnLineObject.signedAmount + txnLineObject.taxAmount;

        // Add the line to the appropriate list
        if (currentIndexMap[currentTxnLineKey] === undefined) {
            txnLine = { signedAmount: 0 };
            txnLine[taxRateName] = txnLineObject.taxRate;
            txnLine[taxAmountName] = 0;
            currentIndexMap[currentTxnLineKey] = this.state[this.Name].currentTransaction[listName].push(txnLine) - 1;
        }

        // Update the amounts of the current transaction line
        index = currentIndexMap[currentTxnLineKey];
        this.state[this.Name].currentTransaction[listName][index].signedAmount += txnLineObject.signedAmount;
        this.state[this.Name].currentTransaction[listName][index][taxAmountName] += txnLineObject.taxAmount;
    }
};