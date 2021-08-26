/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.AE = TAF.AE || {};
TAF.AE.Section = TAF.AE.Section || {};

TAF.AE.Section.GeneralLedgerSection = function _GeneralLedgerSection(state, params, output, job) {
	TAF.AE.Section.FAFReportSection.apply(this, arguments);
	this.Name = 'GeneralLedger';
};
TAF.AE.Section.GeneralLedgerSection.prototype = Object.create(TAF.AE.Section.FAFReportSection.prototype);

TAF.AE.Section.GeneralLedgerSection.prototype.On_Init = function _On_Init() {
    if (!this.state[this.Name]) {
        this.state[this.Name] = {
            Index: -1,
            Summary: {},
            Balance: 0,
            AccountId: '',
            InternalID: -1,
            GLNumber: 0,
            IsGLSupported: this.FAFReportState.IsGLSupported,
            AccountNumber: '',
            tranIDlist: []
        };
        var glParams = {
            periodIds : this.FAFReportState.PeriodIdList,
            subIds : this.FAFReportState.SubsidiaryIdList,
            bookId: this.FAFReportState.BookId
        };
        var summary = new TAF.AE.DAO.GeneralLedgerSummaryDao().getSummary(glParams);
        var adapter = new TAF.AE.Adapter.GeneralLedgerAdapter();

        this.periodDao = new TAF.DAO.AccountingPeriodDao();
        this.state[this.Name].fyStartPeriod = this.getFYStartDate(this.FAFReportState.Period.Start);
        this.fyStartDate = this.state[this.Name].fyStartPeriod;

        this.state[this.Name].Summary = adapter.getSummary(summary, this.FAFReportState.CurrencyISOCodesMAP[this.FAFReportState.BaseCurrency]);
        this.state[this.Name].AccountMap = this.getAccountMap();
    }
};

TAF.AE.Section.GeneralLedgerSection.prototype.On_Header = function _On_Header() {
    this.output.WriteLine(this.FAFReportState.Formatter.formatGeneralLedgerHeader(this.state[this.Name].Summary));
};

TAF.AE.Section.GeneralLedgerSection.prototype.On_Body = function _On_Body() {
    try {
        var globalIndex;
        
        var glParams = {
            periodIds : this.FAFReportState.PeriodIdList,
            subIds : this.FAFReportState.SubsidiaryIdList,
            bookId: this.FAFReportState.BookId,
            startDate: this.FAFReportState.Period.Start.GetStartDate()
        };
        if (this.HasAccountingContext) {        
            glParams.accountingContext = this.params.accountingContext;     
        }
        var dao = new TAF.AE.DAO.GeneralLedgerDao();
        dao.search(glParams);

        var adapter = new TAF.AE.Adapter.GeneralLedgerAdapter(this.state[this.Name]);

        do {
            globalIndex = ++this.state[this.Name].Index;
            var list = dao.getList(globalIndex, globalIndex + this.FAFReportState.ENTRIES_PER_PAGE);
            if (!list) {
                return;
            }

            glParams.list = list;
            glParams.adapter = adapter;
            this.processGeneralLedgerList(glParams, adapter);

            if (this.job.IsThresholdReached()) {
                return;
            }
        } while (list.length >= this.FAFReportState.ENTRIES_PER_PAGE);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.AE.Section.GeneralLedgerSection.On_Body', ex.toString());
        throw ex;
    }
    this.output.SetPercent(this.FAFReportState.PROGRESS_PERCENTAGE.GL_DATA);
};

TAF.AE.Section.GeneralLedgerSection.prototype.On_Footer = function _On_Footer() {
    this.output.WriteLine(this.FAFReportState.Formatter.formatGeneralLedgerTotal(this.state[this.Name].Summary));
};

TAF.AE.Section.GeneralLedgerSection.prototype.On_CleanUp = function _On_CleanUp() {
	delete this.state[this.Name];
};

TAF.AE.Section.GeneralLedgerSection.prototype.getAccountMap = function _getAccountMap() {
    try {
        var reportParams = {
            subsidiary: this.params.subsidiary,
            periodFrom: this.getFYStartPeriod(this.fyStartDate),
            group: this.params.include_child_subs,
            bookId: this.params.bookId
        };
        reportParams.periodTo = reportParams.periodFrom;

        var balanceList = new TAF.DAO.OpeningBalanceDAO().getList(reportParams);
        var balances = {};
        balanceList.forEach(function(a) {this[a.internalId] = a;}, balances);
        var balanceMap = new TAF.AE.Adapter.GeneralLedgerAdapter().getBalanceMap(balances, this.FAFReportState.Accounts);
        return balanceMap;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.AE.Section.GeneralLedgerSection.getAccountMap', ex.toString());
        throw nlapiCreateError('SEARCH_ERROR', 'Unable to search for account balances');
    }
};

TAF.AE.Section.GeneralLedgerSection.prototype.getFYStartDate = function _getFYStartDate(period) {
    var fyStartDate;
    
    if (period.GetType() === 'year') {
        fyStartDate = nlapiDateToString(period.GetStartDate());
    } else {
        var startDate = nlapiDateToString(period.GetStartDate());
        var columns = [new nlobjSearchColumn('startdate').setSort(true)];
        var filters = [
            new nlobjSearchFilter('startdate', null, 'onorbefore', startDate),
            new nlobjSearchFilter('isyear', null, 'is', 'T'),
            new nlobjSearchFilter('isinactive', null, 'is', 'F')
        ];
        
        if (SFC.Context.IsMultipleCalendar() && this.FAFReportState.Subsidiary) {
            filters.push(new nlobjSearchFilter('fiscalcalendar', null, 'is', this.FAFReportState.Subsidiary.GetFiscalCalendar()));
        }
        
        var fy = this.periodDao.searchRecords(filters, columns)[0];
        fyStartDate = (fy && fy.startDate) || 'none';
    }
    
    return fyStartDate;
};

TAF.AE.Section.GeneralLedgerSection.prototype.getFYStartPeriod = function _getFYStartPeriod(date) {
    var columns = [new nlobjSearchColumn('startdate').setSort(true)];
    var filters = [
        new nlobjSearchFilter('startdate', null, 'on', date),
        new nlobjSearchFilter('isyear', null, 'is', 'F'),
        new nlobjSearchFilter('isquarter', null, 'is', 'F'),
        new nlobjSearchFilter('isinactive', null, 'is', 'F')
    ];
    
    return this.periodDao.searchRecords(filters, columns)[0].id;
};

TAF.AE.Section.GeneralLedgerSection.prototype.processGeneralLedgerList = function _processGeneralLedgerList(glParams, adapter) {
    var iterator = new TAF.Lib.Iterator(glParams.list);

    if(iterator.hasNext()){
        while (iterator.hasNext()){
            var line = iterator.next();
            this.processGeneralLedgerLine(line, glParams);

            if(this.state[this.Name].tranIDlist.indexOf(line.id) < 0) {
                this.state[this.Name].Summary.transactionCountTotal++;
                this.state[this.Name].tranIDlist.push(line.id);
            }
            
            this.state[this.Name].Index++;
            this.state[this.Name].InternalID = adapter.lastInternalId;
            this.state[this.Name].GLNumber = adapter.glNumber;

            if (this.job.IsThresholdReached()) {
                return;
            }
        }
    } else {
    	this.output.WriteLine('');
    }
};

TAF.AE.Section.GeneralLedgerSection.prototype.processGeneralLedgerLine = function _processGeneralLedgerLine(line, glParams) {
    var accountBalance = this.state[this.Name].AccountMap[line.accountId];
    var generalLedger;

    if (!this.state[this.Name].AccountId || this.state[this.Name].AccountId != line.accountId) {
        this.state[this.Name].AccountId = line.accountId;
        this.state[this.Name].Balance = accountBalance.balance;
        this.state[this.Name].AccountNumber = accountBalance.accountNumber;
    }
    line.accountName = this.FAFReportState.Accounts[line.accountId].name;
    line.accountNumber = this.FAFReportState.Accounts[line.accountId].number;
    line.localizedName = this.FAFReportState.Accounts[line.accountId].localizedName;
    line.localizedNumber = this.FAFReportState.Accounts[line.accountId].localizedNumber;
    generalLedger = glParams.adapter.getGeneralLedger(line);
    if(this.params.job_params && !this.params.job_params.hasAccountingContext) {
        generalLedger.accountID = this.state[this.Name].AccountNumber;
    }
    this.output.WriteLine(this.FAFReportState.Formatter.formatGeneralLedgerBody(generalLedger));
    this.state[this.Name].Balance = glParams.adapter.balance;
};