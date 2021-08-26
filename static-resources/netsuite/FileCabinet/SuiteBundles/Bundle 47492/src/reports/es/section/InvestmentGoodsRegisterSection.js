/**
 * Copyright © 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ES = TAF.ES || {};
TAF.ES.Section = TAF.ES.Section || {};

TAF.ES.Section.InvestmentGoodsRegisterSection = function _InvestmentGoodsRegisterSection(state, params, output, job) {
    TAF.ES.Section.SIIRegisterSection.apply(this, arguments);
    this.Name = 'InvestmentGoodsRegister';
};
TAF.ES.Section.InvestmentGoodsRegisterSection.prototype = Object.create(TAF.ES.Section.SIIRegisterSection.prototype);

TAF.ES.Section.InvestmentGoodsRegisterSection.prototype.On_Init = function _On_Init() {
    var listValueMap = new TAF.ES.DAO.ListValuesDAO().search({}).getMap();
    this.dao = new TAF.ES.DAO.InvestmentGoodsRegisterDAO();
    this.adapter = new TAF.ES.Adapter.InvestmentGoodsRegisterAdapter(listValueMap);
    this.formatter = this.params.formatter;
    this.resource = new ResourceMgr(this.params.job_params.CultureId);

    if (!this.state[this.Name]) {
        this.initState();
    } else if (this.state[this.Name].fileIndex) {
        this.state[this.Name].fileIndex++;
    }

    this.VALID_TAX_CODES = ['CG-ES', 'IG-ES', 'EIG-ES'];
};

TAF.ES.Section.InvestmentGoodsRegisterSection.prototype.On_Body = function _On_Body() {
    var list;
    var esNexus = new TAF.DAO.NexusDAO().getByCountryCode('ES');

    if (!esNexus) {
        // report is for ES Nexus ONLY
        return;
    }

    var searchIndex;
    this.params.startDate = SFC.PostingPeriods.Load(this.params.periodFrom).GetStartDate();

    this.dao.search({
        subsidiary: this.params.subsidiary,
        nexusId: esNexus.id || '',
        startDate: this.params.startDate,
        endDate: SFC.PostingPeriods.Load(this.params.periodFrom).GetEndDate(),
        bookId: this.params.bookId
    });

    this.output.SetPercent(TAF.SII.CONSTANTS.PROGRESS.REGISTER);

    do {
        searchIndex = this.state[this.Name] && this.state[this.Name].currentSearchIndex ? parseInt(this.state[this.Name].currentSearchIndex) || 0 : 0;
        list = this.dao.getList(searchIndex, searchIndex + this.pageSize);

        this.processList(list);

        if (this.job.IsThresholdReached()) {
            return;
        }

        if (this.isMaxTransactionReached() && (list.length > this.processedLineCount)) {
            this.reschedule();
            return;
        }

    } while(this.dao.hasMoreRows);
};

TAF.ES.Section.InvestmentGoodsRegisterSection.prototype.initState = function _initState(txnObject, searchIndex, txnCount, fileIndex) {
    this.state[this.Name] = {
        fileIndex: fileIndex || null,
        txnCount: txnCount || 0,
        currentSearchIndex: searchIndex || 0,
        currentTranId: txnObject ? txnObject.internalId : null,
        currentTransaction: txnObject || {}
    };
};

TAF.ES.Section.InvestmentGoodsRegisterSection.prototype.processList = function _processList(lines, callbackFxn1, callbackFxn2) {
    if (!lines) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.ES.Section.InvestmentGoodsRegisterSection.processList: lines is a required parameter');
    }

    var index;
    var length;
    var line;

    for (index = 0, length = lines.length; index < length; index++) {
        this.state[this.Name].currentSearchIndex++;
        line = lines[index];

        if (this.state[this.Name].currentTranId !== line.internalId) {
            if (this.isValidTransaction(this.state[this.Name].currentTransaction)) {
                this.processTransaction('getRegistroLRbienesInversion', this.state[this.Name].currentTransaction);
            }
            if (this.isMaxTransactionReached()) {
                this.state[this.Name].currentSearchIndex--;
                return;
            }
            this.state[this.Name].currentTranId = line.internalId;
            this.initState(this.adapter.createTxnObject(line, this.state.CompanyInformation),
                this.state[this.Name].currentSearchIndex, this.state[this.Name].txnCount,
                this.state[this.Name].fileIndex);
        }

        this.processLine(line);

        if (this.job.IsThresholdReached()) {
            return;
        }
    }

    // add the last txn to the file
    if (this.isValidTransaction(this.state[this.Name].currentTransaction)) {
        this.processTransaction('getRegistroLRbienesInversion', this.state[this.Name].currentTransaction);
    }
};

TAF.ES.Section.InvestmentGoodsRegisterSection.prototype.isValidTransaction = function _isValidTransaction(txnObject) {
    var result = false;

    if (txnObject && JSON.stringify(txnObject) !== '{}') {
        var hasLines = (txnObject.lines && txnObject.lines.length > 0);
        if (hasLines) {
            result = true;
        }
    }

    return result;
};

TAF.ES.Section.InvestmentGoodsRegisterSection.prototype.processLine = function _processLine(line) {
    if (!line) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.ES.Section.InvestmentGoodsRegisterSection.processLine: line is a required parameter');
    }

    var txnLineObject = this.adapter.createTxnLineObject(line);
    var listName = 'lines';
    var txnLine;

    if(this.VALID_TAX_CODES.indexOf(txnLineObject.taxCodeName) > -1) {
        txnLine = { itemName: txnLineObject.itemName };
        txnLine['serviceDate'] = txnLineObject.serviceDate;
        txnLine['annualProrate'] = txnLineObject.annualProrate;
        
        this.state[this.Name].currentTransaction[listName].push(txnLine);
    }
    
    this.processedLineCount++;
};

TAF.ES.Section.InvestmentGoodsRegisterSection.prototype.setFileName = function _setFileName() {
    var fileName = this.formatter.formatFileName(this.params.startDate, this.state[this.Name].fileIndex);
    this.output.SetFileName(fileName);
};