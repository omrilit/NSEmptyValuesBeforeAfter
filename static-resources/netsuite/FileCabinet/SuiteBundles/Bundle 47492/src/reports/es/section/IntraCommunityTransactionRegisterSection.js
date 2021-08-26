/**
 * Copyright © 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Section = TAF.ES.Section || {};

TAF.ES.Section.IntraCommunityTransactionRegisterSection = function _IntraCommunityTransactionRegisterSection(state, params, output, job) {
    TAF.ES.Section.SIIRegisterSection.apply(this, arguments);
    this.Name = 'IntraCommunityTransaction';
};
TAF.ES.Section.IntraCommunityTransactionRegisterSection.prototype = Object.create(TAF.ES.Section.SIIRegisterSection.prototype);

TAF.ES.Section.IntraCommunityTransactionRegisterSection.prototype.On_Init = function _On_Init() {
    var listValueMap = new TAF.ES.DAO.ListValuesDAO().search({}).getMap();
    this.dao = new TAF.ES.DAO.IntraCommunityTransactionDAO();
    this.adapter = new TAF.ES.Adapter.IntraCommunityTransactionAdapter(listValueMap);
    this.formatter = this.params.formatter;

    if (!this.state.IntraCommunityTransaction) {
        this.initState();
    } else if (this.state.IntraCommunityTransaction.fileIndex) {
        this.state.IntraCommunityTransaction.fileIndex++;
    }

    this.SUPPORTED_TAX_CODES = ['ES', 'ER', 'EZ', 'ESSP', 'ESSS', 'EIG'];
    if (VAT && VAT.ES) {
        this.taxCodeDef = new SFC.TaxCodes.Definitions(VAT.ES);
    }
};

TAF.ES.Section.IntraCommunityTransactionRegisterSection.prototype.initState = function _initState(txnObject, searchIndex, txnCount, fileIndex) {
    this.state.IntraCommunityTransaction = {
        fileIndex: fileIndex || null,
        txnCount: txnCount || 0,
        currentTxnLineIndex: 0,
        currentSearchIndex: searchIndex || 0,
        currentTranId: txnObject ? txnObject.internalId : null,
    };
};

TAF.ES.Section.IntraCommunityTransactionRegisterSection.prototype.processList = function _processList(lines) {
    if (!lines) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.ES.Section.IntraCommunityTransactionRegisterSection.processList: lines is a required parameter');
    }

    var index;
    var length;
    var line;
    var companyInfo = this.state.CompanyInformation;

    // Saved search returns all transaction lines that uses the EC tax code.
    // This means that there will be multiple/duplicate lines per transaction, and duplicates (by transaction id) are skipped
    // since issuer and counterpart (entity only, no amounts) are the only needed data.
    for (index = 0, length = lines.length; index < length; index++) {
        this.state.IntraCommunityTransaction.currentSearchIndex++;
        line = lines[index];
        if (this.state.IntraCommunityTransaction.currentTranId !== line.internalId && this.isValidTaxCode(this.SUPPORTED_TAX_CODES, line.taxCode)) {
            this.processTransaction('getRegistroLRDetOperacionIntracomunitaria', this.adapter.createTxnObject(line, companyInfo));
            this.state.IntraCommunityTransaction.currentTranId = line.internalId;
            if (this.isMaxTransactionReached()) {
                return;
            }
        }
        this.processedLineCount++;

        if (this.job.IsThresholdReached()) {
            return;
        }
    }
};

TAF.ES.Section.IntraCommunityTransactionRegisterSection.prototype.isValidTaxCode = function _isValidTaxCode(supportedTaxCodes, taxCodeId) {
    if (!taxCodeId) {
        throw nlapiCreateError('MISSING_PARAMETER', this.Name + '.isValidTaxCode: taxCodeId is a required parameter');
    }
    if (!supportedTaxCodes) {
        throw nlapiCreateError('MISSING_PARAMETER', this.Name + '.isValidTaxCode: supportedTaxCodes is a required parameter');
    }
    if (!this.taxCodeDef) {
        throw nlapiCreateError('MISSING_PARAMETER', this.Name + '.isValidTaxCode: this.taxCodeDef is a required parameter');
    }

    var taxCode = SFC.TaxCodes.Load(taxCodeId);
    var type = this.taxCodeDef.GetTypeOf(taxCode);

    return supportedTaxCodes.indexOf(type) > -1;
};
