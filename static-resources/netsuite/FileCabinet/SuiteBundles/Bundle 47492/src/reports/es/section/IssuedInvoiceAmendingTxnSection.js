/**
 * Copyright © 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Section = TAF.ES.Section || {};

TAF.ES.Section.IssuedInvoiceAmendingTxnSection = function _IssuedInvoiceAmendingTxnSection(state, params, output, job) {
    TAF.ES.Section.IssuedInvoiceRegisterSection.apply(this, arguments);
    this.Name = 'IssuedInvoiceAmendingTxn';
};
TAF.ES.Section.IssuedInvoiceAmendingTxnSection.prototype = Object.create(TAF.ES.Section.IssuedInvoiceRegisterSection.prototype);

TAF.ES.Section.IssuedInvoiceAmendingTxnSection.prototype.On_Init = function _On_Init() {
    var listValueMap = new TAF.ES.DAO.ListValuesDAO().search({}).getMap();
    this.dao = new TAF.ES.DAO.IssuedInvoiceAmendingTxnDAO();
    this.adapter = new TAF.ES.Adapter.IssuedInvoiceAmendingTxnAdapter(listValueMap);
    this.formatter = this.params.formatter;
    this.resource = new ResourceMgr(this.params.job_params.CultureId);
    this.origInvoiceDAO = new TAF.ES.DAO.IssuedInvoiceDAO();

    if (!this.state[this.Name]) {
        this.initState();
    } else if (this.state[this.Name].fileIndex) {
        this.state[this.Name].fileIndex++;
    }

    this.VALID_RATES = [0, 4, 10, 21];
    this.SURCHARGE_RATES = [5.2, 1.4, 0.5, 1.75];
};

TAF.ES.Section.IssuedInvoiceAmendingTxnSection.prototype.processList = function _processList(lines) {
    if (!lines) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.ES.Section.IssuedInvoiceAmendingTxnSection.processList: lines is a required parameter');
    }

    var index;
    var length;
    var line;
    var origTxn;

    for (index = 0, length = lines.length; index < length; index++) {
        this.state[this.Name].currentSearchIndex++;
        line = lines[index];

        if (this.state[this.Name].currentTranId !== line.internalId) {
            origTxn = this.getOriginalTxn(line.origTranId);
            if (!origTxn && line.type == "creditmemo") {
                if (line.origTransType == 'returnauthorization') {
                    var origTranId = line.origTranId;
                    var srchFilter = [new nlobjSearchFilter('internalid', null, 'is', origTranId)];
                    var columns = [new nlobjSearchColumn('createdfrom'),
                        new nlobjSearchColumn('recordtype','createdfrom')
                    ];
                    var rs = nlapiSearchRecord('transaction', null, srchFilter, columns);
                    var origTranType = rs[0].getValue('recordtype', 'createdfrom');
                    origTranId = rs[0].getValue('createdfrom');
                    origTxn = this.getOriginalTxn(origTranId);
                    if (!origTxn && origTranType == 'salesorder') {
                        srchFilter = [new nlobjSearchFilter('createdfrom', null, 'is', origTranId),
                            new nlobjSearchFilter('recordtype', null, 'is', 'invoice')
                        ];
                        rs = nlapiSearchRecord('transaction', null, srchFilter, columns);
                        if (rs) {
                            origTranId = rs[0].getId();
                            origTxn = this.getOriginalTxn(origTranId);
                        }
                    }
                  
                }
            }			
            if (!origTxn) {
                // Skip the transaction.
                // It is assumed that the originating bill is not a valid Issued Invoice (e.g.: an intra-community transaction)
                continue;
            }
            if (this.isValidTransaction(this.state[this.Name].currentTransaction)) {
                this.checkMacroData();
                this.processTransaction('getRegistroLRfacturasEmitidas', this.state[this.Name].currentTransaction);
            }
            if (this.isMaxTransactionReached()) {
                return;
            }
            this.state[this.Name].currentTranId = line.internalId;
            line.correctedInvoiceType = TAF.SII.CONSTANTS.TRANSACTION.CORRECTED_INVOICE_TYPE_DIFFERENCE;

            this.initState(this.adapter.createTxnObject(line, origTxn, this.state.CompanyInformation, this.resource),
                this.state[this.Name].currentSearchIndex, this.state[this.Name].txnCount,
                this.state[this.Name].fileIndex);
        }

        line.exemptionDetails = origTxn.exemptionDetails;
        this.processLine(line);

        if (this.job.IsThresholdReached()) {
            return;
        }
    }

    // add the last txn to the file
    if (this.isValidTransaction(this.state[this.Name].currentTransaction)) {
        this.checkMacroData();
        this.processTransaction('getRegistroLRfacturasEmitidas', this.state[this.Name].currentTransaction);
    }
};

TAF.ES.Section.IssuedInvoiceAmendingTxnSection.prototype.isValidTransaction = function _isValidTransaction(txnObject) {
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

TAF.ES.Section.IssuedInvoiceAmendingTxnSection.prototype.getOriginalTxn = function _getOriginalTxn(origTranId) {
    if (!origTranId) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.ES.Section.IssuedInvoiceAmendingTxnSection.getOriginalTxn: origTranId is a required parameter');
    }

    var params = { internalid: origTranId };
    params.registrationStatus = [ '@NONE@' ];
    params.registrationStatus.push(TAF.SII.CONSTANTS.TRANSACTION.STATUS.REGISTERED);
    params.registrationStatus.push(TAF.SII.CONSTANTS.TRANSACTION.STATUS.REGISTERED_WITH_ERRORS);
    params.registrationStatus.push(TAF.SII.CONSTANTS.TRANSACTION.STATUS.REJECTED);
    this.origInvoiceDAO.search(params);
    var results = this.origInvoiceDAO.getList();

    return results && results.length > 0 ? results[0] : null;
};
