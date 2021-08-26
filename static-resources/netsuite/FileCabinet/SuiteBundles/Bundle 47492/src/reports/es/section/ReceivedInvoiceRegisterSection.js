/**
 * Copyright © 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Section = TAF.ES.Section || {};

TAF.ES.Section.ReceivedInvoiceRegisterSection = function _ReceivedInvoiceRegisterSection(state, params, output, job) {
    TAF.ES.Section.SIIRegisterSection.apply(this, arguments);
    this.Name = 'ReceivedInvoices';
};
TAF.ES.Section.ReceivedInvoiceRegisterSection.prototype = Object.create(TAF.ES.Section.SIIRegisterSection.prototype);

TAF.ES.Section.ReceivedInvoiceRegisterSection.prototype.On_Init = function _On_Init() {
    var listValueMap = new TAF.ES.DAO.ListValuesDAO().search({}).getMap();
    this.dao = new TAF.ES.DAO.ReceivedInvoiceDAO();
    this.adapter = new TAF.ES.Adapter.ReceivedInvoiceAdapter(listValueMap);
    this.formatter = this.params.formatter;
    this.resource = new ResourceMgr(this.params.job_params.CultureId);

    if (!this.state[this.Name]) {
        this.initState();
    } else if (this.state[this.Name].fileIndex) {
        this.state[this.Name].fileIndex++;
    }

    this.REAGYP_RATES = [12, 10.5];
    this.VALID_RATES = [0, 4, 10, 21];
    this.SURCHARGE_RATES = [5.2, 1.4, 0.5, 1.75];
};

TAF.ES.Section.ReceivedInvoiceRegisterSection.prototype.initState = function _initState(txnObject, searchIndex, txnCount, fileIndex) {
    this.state[this.Name] = {
        fileIndex: fileIndex || null,
        txnCount: txnCount || 0,
        currentTxnLineIndex: 0,
        currentSearchIndex: searchIndex || 0,
        currentTranId: txnObject ? txnObject.internalId : null,
        currentTransaction: txnObject || {},
        currentTxnLineKey: '',
        lineIndexMap: {}
    };
};

TAF.ES.Section.ReceivedInvoiceRegisterSection.prototype.processList = function _processList(lines) {
    if (!lines) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.ES.Section.ReceivedInvoiceRegisterSection.processList: lines is a required parameter');
    }

    var index;
    var length;
    var line;
    var hasRevChargeGLlines = this.hasRevChargeGLlines(lines);

    for (index = 0, length = lines.length; index < length; index++) {
        this.state.ReceivedInvoices.currentSearchIndex++;
        line = lines[index];
        line.hasRevChargeGLlines = hasRevChargeGLlines[line.internalId];

        if (this.state.ReceivedInvoices.currentTranId !== line.internalId) {
            if (this.isValidTransaction(this.state.ReceivedInvoices.currentTransaction)) {
                this.checkMacroData();
                this.processTransaction('getRegistroLRfacturasRecibidas', this.state.ReceivedInvoices.currentTransaction);
            }
            if (this.isMaxTransactionReached()) {
                return;
            }
            this.state.ReceivedInvoices.currentTranId = line.internalId;
            this.initState(this.adapter.createTxnObject(line, this.state.CompanyInformation, this.resource),
                this.state.ReceivedInvoices.currentSearchIndex, this.state.ReceivedInvoices.txnCount,
                this.state.ReceivedInvoices.fileIndex);
        }

        this.processLine(line);

        if (this.job.IsThresholdReached()) {
            return;
        }
    }

    // add the last txn to the file
    if (this.isValidTransaction(this.state.ReceivedInvoices.currentTransaction)) {
        this.checkMacroData();
        this.processTransaction('getRegistroLRfacturasRecibidas', this.state.ReceivedInvoices.currentTransaction);
    }
};

TAF.ES.Section.ReceivedInvoiceRegisterSection.prototype.isValidTransaction = function _isValidTransaction(txnObject) {
    var result = false;

    if (txnObject && JSON.stringify(txnObject) !== '{}') {
        result = (txnObject.lines && txnObject.lines.length > 0) || (txnObject.reverseChargeLines && txnObject.reverseChargeLines.length > 0);
    }

    return result;
};

TAF.ES.Section.ReceivedInvoiceRegisterSection.prototype.processLine = function _processLine(line) {
    if (!line) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.ES.Section.ReceivedInvoiceRegisterSection.processLine: line is a required parameter');
    }

    var txnLineObject = this.adapter.createTxnLineObject(line);
    var currentIndexMap;
    var currentTxnLineKey;
    var index;
    var txnLine;
    var taxObjectKeys;
    var lineName;

    currentIndexMap = this.state[this.Name].lineIndexMap;
    this.state[this.Name].currentTxnLineKey = txnLineObject.taxRate;
    currentTxnLineKey =  txnLineObject.isReverseCharge ? 'reverseCharge' + txnLineObject.taxRate : txnLineObject.taxRate;
    taxObjectKeys = this.getTaxObjectKeys(txnLineObject);
    lineName = txnLineObject.isReverseCharge ? 'reverseChargeLines' : 'lines';

    // Do not add line items with unsupported tax rates
    if (taxObjectKeys.taxRateName && taxObjectKeys.taxAmountName && !txnLineObject.isExcluded) {
        this.state[this.Name].currentTransaction.total += txnLineObject.isNonDeductible ? 0 : txnLineObject.signedAmount + txnLineObject.taxAmount;
        this.state[this.Name].currentTransaction.totalTax += txnLineObject.isNonDeductible ? txnLineObject.signedAmount : txnLineObject.taxAmount;

        // Add the line to the appropriate list
        if (currentIndexMap[currentTxnLineKey] === undefined) {
            txnLine = { signedAmount: 0 };
            txnLine[taxObjectKeys.taxRateName] = txnLineObject.taxRate;
            txnLine[taxObjectKeys.taxAmountName] = 0;
            currentIndexMap[currentTxnLineKey] = this.state[this.Name].currentTransaction[lineName].push(txnLine) - 1;
        }

        // Update the amounts of the current transaction line
        index = currentIndexMap[currentTxnLineKey];
        this.state[this.Name].currentTransaction[lineName][index].signedAmount += txnLineObject.isNonDeductible ? 0 : txnLineObject.signedAmount;
        this.state[this.Name].currentTransaction[lineName][index][taxObjectKeys.taxAmountName] += txnLineObject.taxAmount;
    }
    this.processedLineCount++;
};

TAF.ES.Section.ReceivedInvoiceRegisterSection.prototype.getTaxObjectKeys = function _getTaxObjectKeys(txnLineObject) {
    var taxObjectKeys = {};

    // Determine type of tax item line
    // Other tax rates not on REAGYP_RATES, SURCHARGE_RATES and VALID_RATES are ignored
    if (this.REAGYP_RATES.indexOf(txnLineObject.taxRate) > -1 &&
        this.state[this.Name].currentTransaction.specialSchemeCode === TAF.SII.CONSTANTS.TRANSACTION.SPCL_SCHEME_CODE_REAGYP) {
        taxObjectKeys.taxRateName = 'REAGYPTaxRate';
        taxObjectKeys.taxAmountName = 'REAGYPTaxAmount';
    } else if (this.SURCHARGE_RATES.indexOf(txnLineObject.taxRate) > -1) {
        taxObjectKeys.taxRateName = 'surchargeTaxRate';
        taxObjectKeys.taxAmountName = 'surchargeTaxAmount';
    } else if (this.VALID_RATES.indexOf(txnLineObject.taxRate) > -1) {
        taxObjectKeys.taxRateName = 'taxRate';
        taxObjectKeys.taxAmountName = 'taxAmount';
    }

    return taxObjectKeys;
};

TAF.ES.Section.ReceivedInvoiceRegisterSection.prototype.hasRevChargeGLlines = function _hasRevChargeGLlines(lines) {
    var hasRClines = {};
    var currId;
    
    for (var i = 0; i < lines.length; i++) {
        if(hasRClines[lines[i].internalId]) {
            continue;
        }
        
        if(lines[i].isCustomGL === 'T' && lines[i].memoLine.indexOf(TAF.SII.CONSTANTS.MEMO.REVERSE_CHARGE > -1) && currId != lines[i].internalId) {
            hasRClines[lines[i].internalId] = true;
        } else {
            hasRClines[lines[i].internalId] = false;
        }
    }

    return hasRClines;
};