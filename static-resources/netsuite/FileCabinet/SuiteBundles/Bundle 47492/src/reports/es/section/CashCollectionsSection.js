/**
 * Copyright � 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Section = TAF.ES.Section || {};

TAF.ES.Section.CashCollectionsSection = function _CashCollectionsSection(state, params, output, job) {
    TAF.ES.Section.SIIRegisterSection.apply(this, arguments);
    this.Name = 'CashCollections';
};
TAF.ES.Section.CashCollectionsSection.prototype = Object.create(TAF.ES.Section.SIIRegisterSection.prototype);

TAF.ES.Section.CashCollectionsSection.prototype.On_Init = function _On_Init() {
    var listValueMap = new TAF.ES.DAO.ListValuesDAO().search({}).getMap();
    this.dao = new TAF.ES.DAO.CashCollectionsDAO();
    this.adapter = new TAF.ES.Adapter.CashCollectionsAdapter(listValueMap);
    this.formatter = this.params.formatter;

    if (!this.state[this.Name]) {
        this.initState();
    } else if (this.state[this.Name].fileIndex) {
        this.state[this.Name].fileIndex++;
    }
};

TAF.ES.Section.CashCollectionsSection.prototype.initState = function _initState(txnObject, searchIndex, txnCount, fileIndex) {
    this.state[this.Name] = {
        fileIndex: fileIndex || null,
        txnCount: txnCount || 0,
        currentSearchIndex: searchIndex || 0,
        currentTransaction: txnObject || {}
    };
};

TAF.ES.Section.CashCollectionsSection.prototype.On_Body = function _On_Body() {
    var list;
    var esNexus = new TAF.DAO.NexusDAO().getByCountryCode('ES');

    if (!esNexus) {
        return;
    }

    var searchIndex;
    this.params.startDate = SFC.PostingPeriods.Load(this.params.periodFrom).GetStartDate();

    this.dao.search({
        subsidiary: this.params.subsidiary,
        nexusId: esNexus.id || '',
        startDate: this.params.startDate,
        endDate: SFC.PostingPeriods.Load(this.params.periodFrom).GetEndDate(),
        bookId: this.params.bookId,
        registrationStatus: this.params.registrationStatus,
        threshold: TAF.SII.CONSTANTS.CASH_COLLECTIONS_THRESHOLD
    });

    this.output.SetPercent(TAF.SII.CONSTANTS.PROGRESS.REGISTER);

    do {
        searchIndex = this.state[this.Name] && this.state[this.Name].currentSearchIndex ? parseInt(this.state[this.Name].currentSearchIndex) || 0 : 0;
        list = this.dao.getList(searchIndex, searchIndex + this.pageSize);

        this.processList(list);

        if (this.job.IsThresholdReached()) {
            return;
        }

        if (this.isMaxTransactionReached() && (list.length - this.TXN_COUNT_LIMIT > this.processedLineCount)) {
            this.reschedule();
            return;
        }

    } while(this.dao.hasMoreRows);
};

TAF.ES.Section.CashCollectionsSection.prototype.processList = function _processList(lines, callbackFxn1, callbackFxn2) {
    if (!lines) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.ES.Section.CashCollectionsSection.processList: lines is a required parameter');
    }

    var index;
    var length;
    var line;
    var companyInfo = this.state.CompanyInformation;

    for (index = 0, length = lines.length; index < length; index++) {
        this.state[this.Name].currentSearchIndex++;
        line = lines[index];

        if (this.isMaxTransactionReached()) {
            this.state[this.Name].currentSearchIndex--;
            return;
        }

        if (this.job.IsThresholdReached()) {
            return;
        }

        this.processTransaction('getRegistroLRcobrosMetalico', this.adapter.createTxnObject(line, companyInfo));
        
        this.initState(this.adapter.createTxnObject(line,companyInfo),
            this.state[this.Name].currentSearchIndex, this.state[this.Name].txnCount,
            this.state[this.Name].fileIndex);
    }
};

TAF.ES.Section.CashCollectionsSection.prototype.setFileName = function _setFileName() {
    var fileName = this.formatter.formatFileName(this.params.startDate, this.state[this.Name].fileIndex);
    this.output.SetFileName(fileName);
};