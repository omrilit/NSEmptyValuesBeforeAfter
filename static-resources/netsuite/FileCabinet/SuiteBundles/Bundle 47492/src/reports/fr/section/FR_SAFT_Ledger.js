/**
 * Copyright � 2015, 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */

if (!TAF) { var TAF = {}; }
TAF.Report = TAF.Report || {};
TAF.Report.Section = TAF.Report.Section || {};

TAF.Report.Section.FR_SAFT_Ledger = function FR_SAFT_Ledger(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.pageSize = 500;
    this.Name = 'FR_SAFT_Ledger';
};

TAF.Report.Section.FR_SAFT_Ledger.prototype = Object.create(TAF.IReportSection.prototype);

TAF.Report.Section.FR_SAFT_Ledger.prototype.On_Init = function() {
    TAF.IReportSection.prototype.On_Init.call(this);

    this.isMultiCurrency = this.state.isMultiCurrency;
    this.isOneWorld = this.state.isOneWorld;
    this.isMultiBook = this.state.isMultiBook;
    this.subsidiary = this.isOneWorld ? SFC.Subsidiaries.Load(this.params.subsidiary) : null;
    this.resource = new ResourceMgr(this.params.job_params.CultureId);
    this.accountingBook = this.isMultiBook ? this.getAccountingBook() : null;
    this.saftAdapter = new TAF.FR.Adapter.SAFTAdapter({
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
        this.saftAdapter.lastInternalId = this.state[this.Name].saftAdapter.lastInternalId;
        this.saftAdapter.txnSequenceNo = this.state[this.Name].saftAdapter.txnSequenceNo;
        this.saftAdapter.isGLSupported = this.state[this.Name].saftAdapter.isGLSupported;
    }
};

TAF.Report.Section.FR_SAFT_Ledger.prototype.setCommonState = function() {
    this.subsidiaryChildren = this.subsidiary && this.params.include_child_subs ? this.subsidiary.GetDescendants() : null;
    
    var subsidiaryList = [];
    if (this.isOneWorld) {
        subsidiaryList.push(this.params.subsidiary);
    }

    for (var ichild = 0; ichild < (this.subsidiaryChildren && this.subsidiaryChildren.length); ichild++) {
        subsidiaryList.push(this.subsidiaryChildren[ichild].GetId());
    }

    this.state.common = {
        periodIds: new TAF.DAO.AccountingPeriodDao().getCoveredPostingPeriods(this.params.periodFrom, this.params.periodTo, this.subsidiary && this.subsidiary.GetFiscalCalendar()),
        subIds: this.isOneWorld ? subsidiaryList : null
    };
};

TAF.Report.Section.FR_SAFT_Ledger.prototype.setReportState = function() {
    this.state[this.Name] = {
        glNumberingDao: {
            periodIndex: 0
        },
        transactionDao: {
            periodIndex: 0,
            searchIndex: 0
        },
        saftAdapter: {
            lastInternalId: this.saftAdapter.lastInternalId,
            txnSequenceNo: this.saftAdapter.txnSequenceNo,
            isGLSupported: null
        }
    };
};

TAF.Report.Section.FR_SAFT_Ledger.prototype.On_Header = function() {
    if (!this.state.includeOpeningBalances) {
        this.output.WriteLine(this.formatter.formatSAFTHeader());
    }
};

TAF.Report.Section.FR_SAFT_Ledger.prototype.On_Body = function() {
    try {
        if (this.state[this.Name].saftAdapter.isGLSupported === null) {
            this.state[this.Name].saftAdapter.isGLSupported = this.checkGLPrerequisites();
            this.saftAdapter.isGLSupported = this.state[this.Name].saftAdapter.isGLSupported;
        }
        
        this.processSAFT();
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.Report.Section.FR_SAFT_Ledger.On_Body', ex.toString());
        throw ex;
    }
};

TAF.Report.Section.FR_SAFT_Ledger.prototype.checkGLPrerequisites = function() {
    try {
        var params = this.state.common;
        var saftState = this.state[this.Name];
        
        var glNumberingDAO = new TAF.FR.DAO.GLNumberingDao({
            subsidiaryIdList : this.isOneWorld ? params.subIds : null,
            startDate : SFC.PostingPeriods.Load(this.params.periodFrom).GetStartDate(),
            bookId: this.accountingBook ? this.accountingBook.id : null
        });
        
        if (!glNumberingDAO.validateGlNumberingFeature()) {
            throw nlapiCreateError('FR_Feature_Is_Off', this.resource.GetString('ERR_FR_SAFT_GL_AUDIT_NUMBERING_IS_OFF'), true);
        }
        
        for (var iperiod = saftState.glNumberingDao.periodIndex; iperiod < (params.periodIds && params.periodIds.length); iperiod++) {
            if (!glNumberingDAO.validateGlNumbers(params.periodIds[iperiod].id)) {
                nlapiLogExecution('DEBUG', 'blank gl check', JSON.stringify(params.periodIds[iperiod].id));
                throw nlapiCreateError('FR_Has_Blank_GL_Numbers', this.resource.GetString('ERR_FR_SAFT_BLANK_GL_NO'), true);
            }
            
            saftState.glNumberingDao.periodIndex = iperiod;
            
            if (this.job.IsThresholdReached()) {
                break;
            }
        }
        
        return glNumberingDAO.isGLSupportedInPeriod;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.Report.Section.FR_SAFT_Ledger.On_Body checkGLPrerequisites', ex.toString());
        throw ex;
    }
};

TAF.Report.Section.FR_SAFT_Ledger.prototype.processSAFT = function() {
    try {
        var saftDAO = new TAF.FR.DAO.SAFTDao();
        var params = this.state.common;
        var saftState = this.state[this.Name];
        
        for (var iperiod = saftState.transactionDao.periodIndex; iperiod < (params.periodIds && params.periodIds.length); iperiod++) {
            saftDAO.search({
                periodId: params.periodIds[iperiod].id,
                subIds: this.isOneWorld ? params.subIds : [],
                bookId: (this.accountingBook) ? this.accountingBook.id : null
            });
            
            var index = this.process(saftDAO, saftState.transactionDao.searchIndex, this.processSAFTLine);
            saftState.transactionDao.periodIndex = iperiod;
            saftState.transactionDao.searchIndex = index;
            if (this.thresholdReached) {
                break;
            }
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.Report.Section.FR_SAFT_Ledger.On_Body processSAFT', ex.toString());
        throw ex;
    }
};

TAF.Report.Section.FR_SAFT_Ledger.prototype.On_CleanUp = function() {
    TAF.IReportSection.prototype.On_CleanUp.call(this);
    delete this.state.common;
};

TAF.Report.Section.FR_SAFT_Ledger.prototype.processSAFTLine = function(line) {
    if (!line) {
        throw nlapiCreateError('MISSING_PARAMETER', 'line is a required parameter');
    }
    try {
        var saftLine = this.saftAdapter.getSAFTLine(line);
        var convertedSAFTLine = null;
        if (saftLine) {
            convertedSAFTLine = saftLine.convertedRow;
            this.state[this.Name].saftAdapter.lastInternalId = saftLine.lastInternalId;
            this.state[this.Name].saftAdapter.txnSequenceNo = saftLine.txnSequenceNo;
        } else if (!convertedSAFTLine) {
            return;
        }
        this.output.WriteLine(this.formatter.formatSAFTLine(convertedSAFTLine));
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.Report.Section.FR_SAFT_Ledger.processSAFTLine', ex.toString());
    }
};