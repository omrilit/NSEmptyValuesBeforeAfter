/**
 * Copyright 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

function GL_Report(state, params, output, job) {
    this.outline = {
        'Section': mainSection,
        'SubSections': [
            { 'Section': glNumberSection },
            { 'Section': glLineSection }
        ]
    };    
    this.GetOutline = function() { return this.outline; };
    
    function mainSection() {
        return new Main_ReportSection(state, params, output, job);
    }
    
    function glNumberSection() {
        return new GLNumber_ReportSection(state, params, output, job);
    }
    
    function glLineSection() {
        return new GLData_ReportSection(state, params, output, job);
    }
}

var GL_PROGRESS = {
    START  : 10,
    GLNUM  : 20,
    BODY   : 30,
    END    : 100
};

//Report Section - Main
function Main_ReportSection(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.Name = 'Main';
}

Main_ReportSection.prototype = Object.create(TAF.IReportSection.prototype);

Main_ReportSection.prototype.On_Init = function _On_Init() {
    TAF.IReportSection.prototype.On_Init.call(this);
    
    this.resource = new ResourceMgr(this.params.job_params.CultureId);
    this.initializeState();
};

Main_ReportSection.prototype.initializeState = function _initializeState() {
    if (this.state.common) {
        return;
    }

    try {
        var context         = nlapiGetContext();
        var isMultiCurrency = context.getFeature('MULTICURRENCY');
        var isOneWorld      = context.getFeature('SUBSIDIARIES');
        var isMultiBook     = context.getFeature('MULTIBOOK');
        var subIds          = isOneWorld ? this.getSubsidiaryList(isMultiCurrency, isMultiBook) : '';
        var periodInfo      = this.getPeriodInfo();
        var progress        = this.getProgressIncrement(periodInfo.periodIds);
        var accounts        = this.getAccounts(subIds);
        var company         = this.getCompanyInfo(isOneWorld, isMultiBook);
        var currencyMap     = this.getCurrencyMap(isMultiCurrency);
        
        this.state.common = {
            isMultiCurrency   : isMultiCurrency,
            isOneWorld        : isOneWorld,
            isMultiBook       : isMultiBook,
            subIds            : subIds,
            periodMap         : periodInfo.periodMap,
            periodIds         : periodInfo.periodIds,
            glIndex           : 0,
            periodIndex       : 0,
            searchIndex       : 0,
            subTranId         : 0,
            lastId            : -1,
            progress          : GL_PROGRESS.BODY,
            progressIncrement : progress,
            accounts          : accounts,
            company           : company,
            currencyMap       : currencyMap
        };
        
        this.output.SetPercent(GL_PROGRESS.START);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Main_ReportSection.initializeState', ex.toString());
        throw ex;
    }
};

Main_ReportSection.prototype.getCurrencyMap = function _getCurrencyMap(isMultiCurrency) {
    try {
        var currencyMap = isMultiCurrency ? new TAF.DAO.CurrencyDao().currencyMap : {};
        return currencyMap;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Main_ReportSection.getPeriodInfo', ex.toString());
        throw nlapiCreateError('DAO_ERROR', 'Unable to retrieve currency records.');
    }    
};

Main_ReportSection.prototype.getAccountingBookCurrency = function() {
    var dao = new TAF.DAO.AccountingBookDao();
    dao.search({
        internalId: this.params.bookId,
        subsidiary: this.params.subsidiary,
    });
    var books = dao.getList();
    return books && (books.length > 0) ? books[0].currencyId : '';
}

Main_ReportSection.prototype.getCompanyInfo = function _getCompanyInfo(isOneWorld, isMultiBook) {
    try {
        var info = {
            name: '',
            bookCurrency: '',
            baseCurrency: '',
            currencyLocale: ''
        };
        if (isMultiBook) {
            info.bookCurrency = this.getAccountingBookCurrency();
        }
        if (isOneWorld) {
            var dao = new TAF.DAO.SubsidiaryDao();
            var subsidiaryInfo = dao.getSubsidiaryInfo({subsidiary: this.params.subsidiary});
            info.name = subsidiaryInfo.getName() || '';
            info.baseCurrency = subsidiaryInfo.getCurrency() || '';
            if (!info.baseCurrency) {
                var dao = new TAF.DAO.CompanyDao();
                var companyInfo = dao.getInfo();
                info.currencyLocale = companyInfo.currencyLocale;
            }
        } else {
            var dao = new TAF.DAO.CompanyDao();
            var companyInfo = dao.getInfo();
            info.name = companyInfo.companyName;
            info.baseCurrency = companyInfo.currency;
            info.currencyLocale = companyInfo.currencyLocale;
        }
        return info;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Main_ReportSection.getPeriodInfo', ex.toString());
        throw nlapiCreateError('DAO_ERROR', 'Unable to retrieve subsidiary or company information.');
    }    
};

Main_ReportSection.prototype.getAccounts = function _getAccounts(subIds) {    var accountingContext = this.params.accountingContext;
    var dao = new TAF.AccountDao();
    var params = subIds ? {subsidiary:['anyof', subIds]} : {};    params.accountingcontext = ['is',accountingContext];
    var accounts = dao.getList(params, false);
    return accounts;
};

Main_ReportSection.prototype.getProgressIncrement = function _getProgressIncrement(periodIds) {
    if (!periodIds || !periodIds.length) {
        return 0;
    }
    var elements = periodIds.length + 1;
    var progress = (GL_PROGRESS.END - GL_PROGRESS.BODY) / elements;
    return Math.floor(progress);
};

Main_ReportSection.prototype.getPeriodInfo = function _getPeriodInfo() {
    try {
        var periodDao = new TAF.DAO.AccountingPeriodDao();
        var periodList = periodDao.getCoveredPostingPeriods(this.params.periodFrom, this.params.periodTo);
        var periodInfo = {
            periodMap : {},
            periodIds : []
        };
        if (!periodList) {
            return periodInfo;
        }
        for (var i = 0; i < periodList.length; i++) {
            var period = periodList[i];
            periodInfo.periodMap[period.id] = period;
            periodInfo.periodIds.push(period.id);
        }
        return periodInfo;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Main_ReportSection.getPeriodInfo', ex.toString());
        throw ex;
    }
};

Main_ReportSection.prototype.getSubsidiaryList = function _getSubsidiaryList(isMultiCurrency, isMultiBook) {
    try {
        var subObj = SFC.Subsidiaries.Load(this.params.subsidiary);
        var childSubs = this.params.include_child_subs ? subObj.GetDescendants() : [];
        
        if (isMultiCurrency && !isMultiBook) {
            this.checkCurrencies(subObj, childSubs);
        }
        
        var subList = [this.params.subsidiary];
        for (var i = 0; i < childSubs.length; i++) {
            subList.push(childSubs[i].GetId());
        }
        
        return subList;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Main_ReportSection.getSubsidiaryList', ex.toString());
        throw ex;
    }
};

Main_ReportSection.prototype.checkCurrencies = function _checkCurrencies(subObj, childSubs) {
    var invalid = [];
    var currency = subObj.GetCurrencyCode();
    
    for (var i = 0; i < childSubs.length; i++) {
        var child = childSubs[i];
        if (currency != child.GetCurrencyCode()) {
            invalid.push(child.GetName());
        }
    }
    
    if (invalid.length > 0) {
        var errorString = this.resource.GetString('ERR_CURRENCY_CHECK', {'subsidiaries': invalid.join(', ')}); 
        throw nlapiCreateError('INVALID_CURRENCY', errorString, true);
    }
};

//Report Section - GL Number
function GLNumber_ReportSection(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    
    this.Name = 'GLNumber';
    this.GL_YEAR = 2018;
}

GLNumber_ReportSection.prototype = Object.create(TAF.IReportSection.prototype);

GLNumber_ReportSection.prototype.On_Init = function _On_Init() {
    TAF.IReportSection.prototype.On_Init.call(this);

    this.resource = new ResourceMgr(this.params.job_params.CultureId);
    
    var glParams = {
        requiredGLYear   : this.GL_YEAR,
        subsidiaryIdList : this.state.common.subIds, 
        startDate        : SFC.PostingPeriods.Load(this.params.periodFrom).GetStartDate(),
        bookId           : this.params.bookId
    };
    this.glDao = new TAF.DAO.GLNumberingDao(glParams);
    if (!this.glDao.isGLNumberingFeatureSupported()) {
        throw nlapiCreateError('GL_Feature_Is_Off', this.resource.GetString('ERR_FR_SAFT_GL_AUDIT_NUMBERING_IS_OFF'), true);
    }
    this.state.common.isGLSupported = this.glDao.isGLSupportedInPeriod;
};

GLNumber_ReportSection.prototype.On_Header = function _On_Header() {
    this.output.SetPercent(GL_PROGRESS.GLNUM);
};

GLNumber_ReportSection.prototype.On_Body = function _On_Body() {
    try {
        var state = this.state.common;
        
        for (var i = state.glIndex; i < state.periodIds.length; i++) {
            if (!this.glDao.isGLNumberingCompleted(state.periodIds[i])) {
                throw nlapiCreateError('GL_Has_Blank_GL_Numbers', this.resource.GetString('ERR_FR_SAFT_BLANK_GL_NO'), true);
            }
            
            state.glIndex = i;
            
            if (this.thresholdReached) {
                break;
            }
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'GLNumber_ReportSection.On_Body', ex.toString());
        throw ex;
    }
};

//Report Section - Report Body
function GLData_ReportSection(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.Name = 'GLData';
}

GLData_ReportSection.prototype = Object.create(TAF.IReportSection.prototype);

GLData_ReportSection.prototype.On_Init = function _On_Init() {
    TAF.IReportSection.prototype.On_Init.call(this);
    
    this.initializeFields();
    this.txnLineDao = new TAF.Generic.DAO.TxnLineDao(this.state.common.fields);
    this.adapter = new TAF.Generic.Adapter.GLAdapter(this.state.common);
    this.formatter = new TAF.Generic.Formatter.GeneralLedger(this.state.common.fields);
};

GLData_ReportSection.prototype.initializeFields = function _initializeFields() {
    if (this.state.common.fields) {
        return;
    }
    
    try {
        var fieldDao = new TAF.Generic.DAO.GLCustomFieldDAO();
        this.state.common.fields = fieldDao.find() || [];
    } catch (ex) {
        nlapiLogExecution('ERROR', 'GLData_ReportSection.initializeFields', ex.toString());
        throw ex;
    }
};

GLData_ReportSection.prototype.On_Header = function _On_Header() {
    var fieldHeaders = this.state.common.fields.map(function(f) { return f.label; }); 
    this.output.WriteLine(this.formatter.formatHeader(fieldHeaders));
};

GLData_ReportSection.prototype.On_Body = function _On_Body() {
    try {
        var state = this.state.common;
        var params = {
            subIds : state.subIds,
            bookId : state.isMultiBook ? this.params.bookId : null
        };
        
        for (var i = state.periodIndex; i < state.periodIds.length; i++) {
            this.output.SetPercent(state.progress);
            
            params.periodId = state.periodIds[i];
            this.txnLineDao.search(params);
            var searchIndex = this.process(this.txnLineDao, state.searchIndex, this.processTxnLine, params.periodId);

            if (state.periodIndex != i) {
                state.progress += state.progressIncrement;
            }
            state.periodIndex = i;
            state.searchIndex = searchIndex;
            state.subTranId = this.adapter.state.subTranId;
            
            if (this.thresholdReached) {
                break;
            }
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'GLData_ReportSection.On_Body', ex.toString());
        throw ex;
    }
};

GLData_ReportSection.prototype.processTxnLine = function _processTxnLine(line, periodId) {
    if (!line) {
        throw nlapiCreateError('MISSING_PARAMETER', 'line is a required parameter');
    }
    
    try {
        var convertedGlLine = this.adapter.getGlLine(line, periodId);
        if (!convertedGlLine) {
            return;
        }
        
        this.output.WriteLine(this.formatter.formatLine(convertedGlLine));
    } catch (ex) {
        nlapiLogExecution('ERROR', 'processTxnLine', ex.toString());
        throw ex;
    }
};

GLData_ReportSection.prototype.On_Footer = function _On_Footer() {
    this.output.SetPercent(GL_PROGRESS.END);
};

//CRG Reports
var Generic_GL_Report = function _Generic_GL_Report(state, params, output, job) {
    GL_Report.call(this, state, params, output, job);
};
Generic_GL_Report.prototype = Object.create(GL_Report.prototype);
Generic_GL_Report.IsCRGReport = true;
Generic_GL_Report.ReportId = 'GL_CSV';
