/**
 * Copyright 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Section = TAF.ES.Section || {};

TAF.ES.Section.SIIRegisterSection = function _SIIRegisterSection(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.Name = 'SIIRegisterSection';
    this.TXN_COUNT_LIMIT = 10000;
    this.processedLineCount = 0;
};
TAF.ES.Section.SIIRegisterSection.prototype = Object.create(TAF.IReportSection.prototype);

TAF.ES.Section.SIIRegisterSection.prototype.On_Body = function _On_Body() {
    var list;
    var esNexus = new TAF.DAO.NexusDAO().getByCountryCode('ES');

    if (!esNexus) {
        // report is for ES Nexus ONLY
        return;
    }

    var searchIndex;

    this.dao.search({
        subsidiary: this.params.subsidiary,
        nexusId: esNexus.id || '',
        startDate: new Date(parseInt(this.params.periodFrom)),
        endDate: new Date(parseInt(this.params.periodTo)),
        bookId: this.params.bookId,
        registrationStatus: this.params.registrationStatus
    });

    this.output.SetPercent(TAF.SII.CONSTANTS.PROGRESS.REGISTER);

    do {
        searchIndex = this.state[this.Name] && this.state[this.Name].currentSearchIndex ? parseInt(this.state[this.Name].currentSearchIndex) || 0 : 0;
        list = this.dao.getList(searchIndex, searchIndex + this.pageSize);

        this.processList(list, null, null, this.dao.hasMoreRows); 	// added parameter "hasMoreRows" to processList  for the Issue 611359 Tax Audit Files: Spain Issued Invoices > Invoice is Being Duplicated in XML File.


        if (this.job.IsThresholdReached()) {
            return;
        }

        if (this.isMaxTransactionReached() && (list.length > this.processedLineCount)) {
            this.reschedule();
            return;
        }

    } while(this.dao.hasMoreRows);
};

TAF.ES.Section.SIIRegisterSection.prototype.On_Footer = function _onCleanUp() {
    this.setFileName();
};

TAF.ES.Section.SIIRegisterSection.prototype.On_CleanUp = function _onCleanUp() {
    delete this.state.CompanyInformation;
    delete this.state[this.Name];
};

TAF.ES.Section.SIIRegisterSection.prototype.reschedule = function _reschedule() {
    if (!this.state[this.Name].fileIndex) {
        this.state[this.Name].fileIndex = 1;
    }
    this.state[this.Name].txnCount = 0;

    new TAF.ES.Rescheduler().run(this.params, this.state);
};

TAF.ES.Section.SIIRegisterSection.prototype.processList = function _processList(list) {
    throw nlapiCreateError('UNSUPPORTED_OPERATION', this.Name + '.processList: processList must be implemented');
};

TAF.ES.Section.SIIRegisterSection.prototype.processTransaction = function _processTransaction(formatterCallback, txnObject, companyInfo) {
    if (!txnObject) {
        throw nlapiCreateError('MISSING_PARAMETER', this.Name + '.processTransaction: txnObject is a required parameter');
    }
    if (!formatterCallback) {
        throw nlapiCreateError('MISSING_PARAMETER', this.Name + '.processTransaction: formatterCallback is a required parameter');
    }

    this.output.WriteLine(this.formatter[formatterCallback](txnObject, companyInfo));
    this.state[this.Name].txnCount++;
    this.state[this.Name].currentTransaction = null;
    this.state[this.Name].currentTranId = null;
};

TAF.ES.Section.SIIRegisterSection.prototype.isMaxTransactionReached = function _isMaxTransactionReached() {
    return this.state[this.Name].txnCount === this.TXN_COUNT_LIMIT;
};

TAF.ES.Section.SIIRegisterSection.prototype.setFileName = function _setFileName() {
    var startDate = new Date(parseInt(this.params.periodFrom));
    var endDate = new Date(parseInt(this.params.periodTo));
    var fileName = this.formatter.formatFileName(startDate, endDate, this.state[this.Name].fileIndex);
    this.output.SetFileName(fileName);
};

TAF.ES.Section.SIIRegisterSection.prototype.checkMacroData = function _checkMacroData() {
    this.state[this.Name].currentTransaction.isMacroData = TAF.SII.CONSTANTS.TRANSACTION.FLAG_NO;
    if (Math.abs(this.state[this.Name].currentTransaction.total) >= TAF.SII.CONSTANTS.MACRODATA_THRESHOLD) {
        this.state[this.Name].currentTransaction.isMacroData = TAF.SII.CONSTANTS.TRANSACTION.FLAG_YES;
    }
};
