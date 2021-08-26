/**
 * Copyright © 2016, 2017, Oracle and/or its affiliates. All rights reserved.
 */

if (!TAF) { var TAF = {}; }
TAF.Report = TAF.Report || {};
TAF.Report.Section = TAF.Report.Section || {};

TAF.Report.Section.FR_SAFT_PEJ_IncomeStatementClosing = function FR_SAFT_PEJ_IncomeStatementClosing(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.pageSize = 500;
    this.Name = 'FR_SAFT_PEJ_IncomeStatementClosing';
};

TAF.Report.Section.FR_SAFT_PEJ_IncomeStatementClosing.prototype = Object.create(TAF.IReportSection.prototype);

TAF.Report.Section.FR_SAFT_PEJ_IncomeStatementClosing.prototype.On_Init = function On_Init() {
    TAF.IReportSection.prototype.On_Init.call(this);
    this.isMultiCurrency = this.state.isMultiCurrency;
    this.isOneWorld = this.state.isOneWorld;
    this.isMultiBook = this.state.isMultiBook;
    this.resource = new ResourceMgr(this.params.job_params.CultureId);
    this.accountingBook = this.isMultiBook ? this.getAccountingBook() : null;
    this.subsidiary = this.state.isOneWorld ? SFC.Subsidiaries.Load(this.params.subsidiary) : null;
    
    this.sectionState = this.state[this.Name] || {};
    
    this.periodDao = new TAF.DAO.AccountingPeriodDao();    
    this.periodFrom = SFC.PostingPeriods.Load(this.params.periodFrom);
    this.periodTo = SFC.PostingPeriods.Load(this.params.periodTo);

    this.fyStartDate = this.getFYStartDate(this.periodFrom);
    this.fyEndDate = this.getFYEndDate(this.periodFrom);
    this.prevFYEndPeriod = this.getPrevFYEndPeriod(this.fyStartDate);
    this.includeSection = false;

    if((this.periodFrom.GetType() === 'year' && this.params.periodFrom == this.params.periodTo) || (this.fyStartDate == nlapiDateToString(this.periodFrom.GetStartDate()) && this.fyEndDate == nlapiDateToString(this.periodTo.GetEndDate()))) {
        this.includeSection = true;
    }

    if(this.prevFYEndPeriod == null) {
        this.includeSection = false;
    }
   
    if(this.includeSection) {
        this.pejIncomeStatementClosingAdapter = new TAF.FR.Adapter.PEJIncomeStatementClosingAdapter({
            currency: this.state.defaultCurrency,
            isSubAccountEnabled: this.state.isSubAccountEnabled,
            accountsMap: this.params.scoaAccounts,
            resource: this.resource,
            accountingBook: this.accountingBook,
            usesAccountingContext: this.params.accountingContext != '',
            usePostingDate: this.job.ReportParams.job_params.usePostingDate
        });

        this.formatter = this.params.formatter;
        if (!this.state.common) {
            this.setCommonState();
        }
            
        if (!this.state[this.Name]) {
            this.setReportState();
        } else {
            this.pejIncomeStatementClosingAdapter.lastInternalId = this.state[this.Name].pejIncomeStatementClosingAdapter.lastInternalId;
            this.pejIncomeStatementClosingAdapter.txnSequenceNo = this.state[this.Name].pejIncomeStatementClosingAdapter.txnSequenceNo;
            this.pejIncomeStatementClosingAdapter.isGLSupported = this.state[this.Name].pejIncomeStatementClosingAdapter.isGLSupported;
        }
    }
};

TAF.Report.Section.FR_SAFT_PEJ_IncomeStatementClosing.prototype.setCommonState = function() {
    this.subsidiaryChildren = this.subsidiary && this.params.include_child_subs ? this.subsidiary.GetDescendants() : null;
    
    var subsidiaryList = [];
    if (this.isOneWorld) {
        subsidiaryList.push(this.params.subsidiary);
    }

    for (var ichild = 0; ichild < (this.subsidiaryChildren && this.subsidiaryChildren.length); ichild++) {
        subsidiaryList.push(this.subsidiaryChildren[ichild].GetId());
    }

    this.state.common = {
        periodIds: this.prevFYEndPeriod,
        subIds: this.isOneWorld ? subsidiaryList : null
    };
};

TAF.Report.Section.FR_SAFT_PEJ_IncomeStatementClosing.prototype.setReportState = function() {
    this.state[this.Name] = {
        transactionDao: {
            searchIndex: 0
        },
        pejIncomeStatementClosingAdapter: {
            lastInternalId: this.pejIncomeStatementClosingAdapter.lastInternalId,
            txnSequenceNo: this.pejIncomeStatementClosingAdapter.txnSequenceNo,
            isGLSupported: null
        }
    };
};

TAF.Report.Section.FR_SAFT_PEJ_IncomeStatementClosing.prototype.On_Header = function() {};

TAF.Report.Section.FR_SAFT_PEJ_IncomeStatementClosing.prototype.On_Body = function On_Body() {
    if(this.includeSection) {
        try {
            if (this.state[this.Name].pejIncomeStatementClosingAdapter.isGLSupported === null) {
                this.state[this.Name].pejIncomeStatementClosingAdapter.isGLSupported = this.checkGLPrerequisites();
                this.pejIncomeStatementClosingAdapter.isGLSupported = this.state[this.Name].pejIncomeStatementClosingAdapter.isGLSupported;
            }
            
            this.processSAFT();
        } catch (ex) {
            nlapiLogExecution('ERROR', 'TAF.Report.Section.FR_SAFT_PEJ_IncomeStatementClosing.On_Body', ex.toString());
            throw ex;
        }
    }
};

TAF.Report.Section.FR_SAFT_PEJ_IncomeStatementClosing.prototype.checkGLPrerequisites = function() {
    try {
        var params = this.state.common;
        
        var glNumberingDAO = new TAF.FR.DAO.GLNumberingDao({
            subsidiaryIdList : this.isOneWorld ? params.subIds : null,
            startDate : SFC.PostingPeriods.Load(this.params.periodFrom).GetStartDate(),
            bookId: this.accountingBook ? this.accountingBook.id : null
        });
        
        if (!glNumberingDAO.validateGlNumberingFeature()) {
            throw nlapiCreateError('FR_Feature_Is_Off', this.resource.GetString('ERR_FR_SAFT_GL_AUDIT_NUMBERING_IS_OFF'), true);
        }

        if (!glNumberingDAO.validateGlNumbers(params.periodIds)) {
            nlapiLogExecution('DEBUG', 'blank gl check', JSON.stringify(params.periodIds));
            throw nlapiCreateError('FR_Has_Blank_GL_Numbers', this.resource.GetString('ERR_FR_SAFT_BLANK_GL_NO'), true);
        }          
        
        return glNumberingDAO.isGLSupportedInPeriod;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.Report.Section.FR_SAFT_PEJ_IncomeStatementClosing.On_Body checkGLPrerequisites', ex.toString());
        throw ex;
    }
};

TAF.Report.Section.FR_SAFT_PEJ_IncomeStatementClosing.prototype.processSAFT = function() {
    try {
        var saftDAO = new TAF.FR.DAO.PEJ_IncomeStatementClosingDao();
        var params = this.state.common;
        var saftState = this.state[this.Name];
        
        saftDAO.search({
            periodId: params.periodIds,
            subIds: this.isOneWorld ? params.subIds : [],
            bookId: (this.accountingBook) ? this.accountingBook.id : null
        });
        
        var index = this.process(saftDAO, saftState.transactionDao.searchIndex, this.processSAFTLine);
        saftState.transactionDao.searchIndex = index;

    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.Report.Section.FR_SAFT_PEJ_IncomeStatementClosing.On_Body processSAFT', ex.toString());
        throw ex;
    }
};

TAF.Report.Section.FR_SAFT_PEJ_IncomeStatementClosing.prototype.On_CleanUp = function() {
    TAF.IReportSection.prototype.On_CleanUp.call(this);
    delete this.state.common;
};

TAF.Report.Section.FR_SAFT_PEJ_IncomeStatementClosing.prototype.processSAFTLine = function(line) {
    if (!line) {
        throw nlapiCreateError('MISSING_PARAMETER', 'line is a required parameter');
    }
    try {
        var saftLine = this.pejIncomeStatementClosingAdapter.getSAFTLine(line);
        var convertedSAFTLine = null;
        if (saftLine) {
            convertedSAFTLine = saftLine.convertedRow;
            this.state[this.Name].pejIncomeStatementClosingAdapter.lastInternalId = saftLine.lastInternalId;
            this.state[this.Name].pejIncomeStatementClosingAdapter.txnSequenceNo = saftLine.txnSequenceNo;
        } else if (!convertedSAFTLine) {
            return;
        }
        this.output.WriteLine(this.formatter.formatSAFTLine(convertedSAFTLine));
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.Report.Section.FR_SAFT_PEJ_IncomeStatementClosing.processSAFTLine', ex.toString());
    }
};

TAF.Report.Section.FR_SAFT_PEJ_IncomeStatementClosing.prototype.getFYStartDate = function getFYStartDate(period) {
    var fyStartDate = '';
    
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
        
        if (SFC.Context.IsMultipleCalendar() && this.subsidiary) {
            filters.push(new nlobjSearchFilter('fiscalcalendar', null, 'is', this.subsidiary.GetFiscalCalendar()));
        }
        
        var fy = this.periodDao.searchRecords(filters, columns)[0];
        fyStartDate = (fy && fy.startDate) || 'none';
    }
    
    return fyStartDate;
};

TAF.Report.Section.FR_SAFT_PEJ_IncomeStatementClosing.prototype.getFYEndDate = function getFYEndDate(period) {
    var fyEndDate = '';
    
    if (period.GetType() === 'year') {
        fyEndDate = nlapiDateToString(period.GetEndDate());
    } else {
        var startDate = nlapiDateToString(period.GetStartDate());
        
        var columns = [new nlobjSearchColumn('startdate').setSort(true),
                       new nlobjSearchColumn('enddate')
        ];
        var filters = [
            new nlobjSearchFilter('startdate', null, 'onorbefore', startDate),
            new nlobjSearchFilter('isyear', null, 'is', 'T'),
            new nlobjSearchFilter('isinactive', null, 'is', 'F')
        ];
        
        if (SFC.Context.IsMultipleCalendar() && this.subsidiary) {
            filters.push(new nlobjSearchFilter('fiscalcalendar', null, 'is', this.subsidiary.GetFiscalCalendar()));
        }
        
        var fy = this.periodDao.searchRecords(filters, columns)[0];
        fyEndDate = (fy && fy.endDate) || 'none';
    }
    
    return fyEndDate;
};

TAF.Report.Section.FR_SAFT_PEJ_IncomeStatementClosing.prototype.getPrevFYEndPeriod = function getPrevFYEndPeriod(date) {
    var columns = [new nlobjSearchColumn('startdate').setSort(true)];
    var filters = [
        new nlobjSearchFilter('enddate', null, 'before', date),
        new nlobjSearchFilter('isyear', null, 'is', 'F'),
        new nlobjSearchFilter('isquarter', null, 'is', 'F'),
        new nlobjSearchFilter('isinactive', null, 'is', 'F')
    ];
    
    return this.periodDao.searchRecords(filters, columns)[0] ? this.periodDao.searchRecords(filters, columns)[0].id : null;
};
