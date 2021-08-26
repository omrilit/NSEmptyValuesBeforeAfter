/**
 * Copyright © 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Section = TAF.ES.Section || {};

TAF.ES.Section.ReceivedInvoiceAmendingTxnSection = function _ReceivedInvoiceAmendingTxnSection(state, params, output, job) {
    TAF.ES.Section.ReceivedInvoiceRegisterSection.apply(this, arguments);
    this.Name = 'ReceivedInvoiceAmendingTxn';
};
TAF.ES.Section.ReceivedInvoiceAmendingTxnSection.prototype = Object.create(TAF.ES.Section.ReceivedInvoiceRegisterSection.prototype);

TAF.ES.Section.ReceivedInvoiceAmendingTxnSection.prototype.On_Init = function _On_Init() {
    TAF.ES.Section.ReceivedInvoiceRegisterSection.prototype.On_Init.apply(this, arguments);
    var listValueMap = new TAF.ES.DAO.ListValuesDAO().search({}).getMap();
    this.dao = new TAF.ES.DAO.ReceivedInvoiceAmendingTxnDAO();
    this.origTxnDao = new TAF.ES.DAO.ReceivedInvoiceDAO();
    this.adapter = new TAF.ES.Adapter.ReceivedInvoiceAmendingTxnAdapter(listValueMap);
    this.resource = new ResourceMgr(this.params.job_params.CultureId);
};

TAF.ES.Section.ReceivedInvoiceAmendingTxnSection.prototype.processList = function _processList(lines) {
    if (!lines) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.ES.Section.ReceivedInvoiceAmendingTxnSection.processList: lines is a required parameter');
    }

    var index;
    var length;
    var line;
    var hasRevChargeGLlines = this.hasRevChargeGLlines(lines);
    var origTxn;
    var txnObject;

    for (index = 0, length = lines.length; index < length; index++) {
        this.state[this.Name].currentSearchIndex++;
        line = lines[index];
        line.hasRevChargeGLlines = hasRevChargeGLlines[line.internalId];

        if (this.state[this.Name].currentTranId !== line.internalId) {
            origTxn = this.getOriginalTxn(line.createdFrom || line.origBill);
            if (!origTxn && line.type == "vendorcredit") {                
                    var origTranId = line.createdFrom;
                    var srchFilter = [new nlobjSearchFilter('internalid', null, 'is', origTranId)];
                    var columns = [new nlobjSearchColumn('createdfrom'),
                        new nlobjSearchColumn('recordtype')
                    ];
                    rs = nlapiSearchRecord('transaction', null, srchFilter, columns);
                    origTranId = rs[0].getValue('createdfrom');
                    if (origTranId) {
                        origTxn = this.getOriginalTxn(origTranId);
                    }					
                }	
				
            if (!origTxn) {
                // Skip the transaction.
                // It is assumed that the originating bill is not a valid Received Invoice (e.g.: an intra-community transaction)
                continue;
            }
            if (this.isValidTransaction(this.state[this.Name].currentTransaction)) {
                this.checkMacroData();
                this.processTransaction('getRegistroLRfacturasRecibidas', this.state[this.Name].currentTransaction);
            }
            if (this.isMaxTransactionReached()) {
                return;
            }

            txnObject = this.adapter.createTxnObject(line, origTxn, this.state.CompanyInformation, this.resource);

            this.state[this.Name].currentTranId = line.internalId;
            this.initState(txnObject, this.state[this.Name].currentSearchIndex,
                this.state[this.Name].txnCount, this.state[this.Name].fileIndex);
        }

        this.processLine(line);

        if (this.job.IsThresholdReached()) {
            return;
        }
    }

    // add the last txn to the file
    if (this.isValidTransaction(this.state[this.Name].currentTransaction)) {
        this.checkMacroData();
        this.processTransaction('getRegistroLRfacturasRecibidas', this.state[this.Name].currentTransaction);
    }
};

TAF.ES.Section.ReceivedInvoiceAmendingTxnSection.prototype.getOriginalTxn = function _getOriginalTxn(origTranId) {
    if (!origTranId) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.ES.Section.ReceivedInvoiceAmendingTxnSection.getOriginalTxn: origTranId is a required parameter');
    }

    var params = { internalId: origTranId };
    var results;

    params.registrationStatus = ['@NONE@'];
    params.registrationStatus.push(TAF.SII.CONSTANTS.TRANSACTION.STATUS.REGISTERED);
    params.registrationStatus.push(TAF.SII.CONSTANTS.TRANSACTION.STATUS.REGISTERED_WITH_ERRORS);
    params.registrationStatus.push(TAF.SII.CONSTANTS.TRANSACTION.STATUS.REJECTED);
    this.origTxnDao.search(params);
    results = this.origTxnDao.getList();

    return results && results.length > 0 ? results[0] : null;
};
