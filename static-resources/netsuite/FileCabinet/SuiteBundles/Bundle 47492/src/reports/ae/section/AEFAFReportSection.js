/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.AE = TAF.AE || {};
TAF.AE.Section = TAF.AE.Section || {};

TAF.AE.Section.FAFReportSection = function _FAFReportSection(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.Name = 'FAFReport';
	this.FAFReportState = state['FAFReport'] || {};
};
TAF.AE.Section.FAFReportSection.prototype = Object.create(TAF.IReportSection.prototype);

TAF.AE.Section.FAFReportSection.prototype.On_Init = function _On_Init() {
    if (!this.state[this.Name]) {
        var currencyISOCodesMap = new TAF.DAO.CurrencyDao().getSymbolMap();
        this.state[this.Name] = {
            CurrencyISOCodesMAP : currencyISOCodesMap,
            glNumberingDao: {
                periodIndex: 0
            },
            TXN_COUNT_LIMIT: 10000,
            processedLineCount: 0,
            Context: SFC.Context.GetContext(),
            BookId: this.params.bookId,
            Period: { Start: SFC.PostingPeriods.Load(this.params.periodFrom),
                End: SFC.PostingPeriods.Load(this.params.periodTo) },
            CompanyInfo: new TAF.AE.DAO.CompanyInfoDao().getCompanyInfo(),
            IsGLSupported: false,
            HasAccountingContext: this.params.job_params && this.params.job_params.hasAccountingContext,
            HasSTCBundle: SFC.Registry.IsInstalled('9b168872-32ec-4d8e-b73e-38193fedc4d3'),
            SalesAcctTypes: [ '@NONE@', 'OthIncome', 'Income', 'DeferRevenue' ],
            PurchaseAcctTypes: [ 'OthCurrAsset', 'FixedAsset', 'OthAsset', 'COGS', 'Expense', 'OthExpense', 'DeferExpense' ],
            Formatter: this.params.formatter,
            PROGRESS_PERCENTAGE: {
            	SUB_TRANID: 20,
                COMPANY_INFO: 30,
                PURCHASE: 50,
                SUPPLY: 70,
                GL_DATA: 100 },
            ENTRIES_PER_PAGE: 1000,
        };
        this.FAFReportState = this.state[this.Name];

        this.FAFReportState.IsOneWorld = this.FAFReportState.Context.getSetting('FEATURE', 'SUBSIDIARIES') === 'T';
        this.FAFReportState.IsMultiCurrency = this.FAFReportState.Context.getFeature('MULTICURRENCY');
        this.FAFReportState.IsMultiBook = this.FAFReportState.Context.getFeature('MULTIBOOK');
        this.FAFReportState.Subsidiary = this.FAFReportState.IsOneWorld ? SFC.Subsidiaries.Load(this.params.subsidiary) : null;
        this.FAFReportState.SubsidiaryIdList = this.FAFReportState.IsOneWorld ? this.GetSubsidiaryIdList() : null;
        this.FAFReportState.Book = this.GetAccountingBook();
        this.FAFReportState.PeriodIdList = SFC.PostingPeriods.GetCoveredPeriodIds(this.FAFReportState.Period.Start.GetId(), this.FAFReportState.Period.End.GetId());
        this.FAFReportState.SubsidiaryInfo = this.FAFReportState.IsOneWorld ? new TAF.SubsidiaryDao().getSubsidiaryInfo(this.params) : null;
        this.FAFReportState.BaseCurrency = this.GetBaseCurrency();

        var acctParams = this.IsOneWorld ? {subsidiary: ['anyof', this.FAFReportState.Subsidiary]} : {};
        acctParams.accountingcontext = ['is',this.params.accountingContext];
        this.FAFReportState.Accounts = new TAF.AccountDao().getList(acctParams, false);
    }
    
    this.ValidateCurrencies();
    if (this.FAFReportState.Context.getFeature('MULTIPLECALENDARS')) {
    	this.ValidateAccountingPeriods(this.params.periodTo, this.FAFReportState.Subsidiary.GetFiscalCalendar());
    }
};

TAF.AE.Section.FAFReportSection.prototype.On_Footer = function _OnFooter() {
    this.SetFileName();
};

TAF.AE.Section.FAFReportSection.prototype.On_CleanUp = function _OnCleanUp() {
	delete this.FAFReportState;
};

TAF.AE.Section.FAFReportSection.prototype.GetSubsidiaryIdList = function _GetSubsidiaryIdList() {
    var subsidiaryIdList = [];
    subsidiaryIdList.push(this.params.subsidiary);
    
    if (this.params.include_child_subs) {
        var children = this.FAFReportState.Subsidiary.GetDescendants();
        for (var i = 0; i < children.length; i++) {
            subsidiaryIdList.push(children[i].GetId());
        }
    }
    return subsidiaryIdList;
};

TAF.AE.Section.FAFReportSection.prototype.GetAccountingBook = function _GetAccountingBook() {
    if (!this.FAFReportState.IsMultiBook) {
        return {};
    }
    
    var dao = new TAF.DAO.AccountingBookDao();
    dao.search({
        internalId: this.FAFReportState.BookId,
        subsidiary: this.FAFReportState.Subsidiary.GetId(),
    });
    var books = dao.getList();
    return books && (books.length > 0) ? books[0] : {};
};

TAF.AE.Section.FAFReportSection.prototype.GetBaseCurrency = function _GetBaseCurrency() {
    if (this.FAFReportState.IsMultiBook && !this.FAFReportState.Book.isPrimary && this.BookId) {
        return this.FAFReportState.Book.currencyId;
    } else if (!this.FAFReportState.IsMultiCurrency) {
        return '';
    } else if (this.FAFReportState.IsOneWorld) {
        return this.FAFReportState.Subsidiary.GetCurrencyId();
    } else {
        var dao = new TAF.AE.DAO.CompanyInfoDao();
        return dao.getBaseCurrency();
    }
};

TAF.AE.Section.FAFReportSection.prototype.ValidateCurrencies = function _ValidateCurrencies() {
    if (this.FAFReportState.IsMultiCurrency && this.FAFReportState.IsOneWorld && this.params.include_child_subs && !this.FAFReportState.IsMultiBook) {
        
        var descendants = this.FAFReportState.Subsidiary.GetDescendants();
        var currencyCode = this.FAFReportState.Subsidiary.GetCurrencyCode();
        var incorrectSubsidiaries = [];
        
        for ( var i = 0; i < descendants.length; ++i) {
            if (currencyCode != descendants[i].GetCurrencyCode()) {
                incorrectSubsidiaries.push(descendants[i].GetName());
            }
        }
        
        if (incorrectSubsidiaries.length > 0) {
            var resourceManager = new ResourceMgr(this.params.job_params.CultureId);
            var errorMessage = resourceManager.GetString('ERR_CURRENCY_CHECK', { subsidiaries: incorrectSubsidiaries.join(', ') });
            throw nlapiCreateError('AE_AUDIT_Currency_Check', errorMessage, true);
        }
    }
};

TAF.AE.Section.FAFReportSection.prototype.ValidateAccountingPeriods = function _ValidateAccountingPeriods(periodTo, fiscalCalendar) {
    if (!periodTo) {
        throw nlapiCreateError('MISSING_PARAMETER', 'periodTo is a required parameter');
    }
    if (!fiscalCalendar) {
        throw nlapiCreateError('MISSING_PARAMETER', 'fiscalCalendar is a required parameter');
    }

    var validPeriods = new TAF.DAO.AccountingPeriodDao().getPostingPeriodsOnOrBeforePeriod(periodTo, fiscalCalendar, true);
    var coveredPeriods = new TAF.DAO.AccountingPeriodDao().getPostingPeriodsOnOrBeforePeriod(periodTo, null, true);
    var validPeriodIds = !validPeriods ? [] : validPeriods.map(function(period) {
        return period.id;
    });

    if (validPeriodIds.length > 0) {
        for (var i = 0; i < coveredPeriods.length; i++) {
            if (validPeriodIds.indexOf(coveredPeriods[i].id) == -1) {
                var resourceManager = new ResourceMgr(this.params.job_params.CultureId);
                var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
                var baseUrl = _Context.getSetting('SCRIPT', 'custscript_4599_main_s_url');
                var baseUrlMatch = baseUrl ? baseUrl.match(re) : null;
                var helpUrl = (baseUrlMatch) ? baseUrlMatch[0].toString() + resourceManager.GetString('ERR_UNASSIGNED_PERIODS_URL') : '';

                throw nlapiCreateError('Unassigned_Period', resourceManager.GetString('ERR_UNASSIGNED_PERIODS', { 'usingFiscalCalendarHelpUrl': helpUrl }), true);
            }
        }
    }
};

TAF.AE.Section.FAFReportSection.prototype.SetFileName = function _SetFileName() {
    var fileName = this.FAFReportState.Formatter.formatFileName(this.FAFReportState.Period.Start.GetStartDate(), this.FAFReportState.Period.End.GetEndDate());
    this.output.SetFileName(fileName);
};

TAF.AE.Section.FAFReportSection.prototype.GetEntityCountry = function(entityId) {
    if (!entityId) {
    	throw nlapiCreateError('MISSING_PARAMETER', 'entityId is a required parameter');
	}

    var entityDao = new TAF.AE.DAO.EntityDAO();
    var entityCountry = entityDao.getCountryById(entityId);
    this.state[this.Name].entityCountryMap[entityId] = entityCountry;
    
    return entityCountry.billCountry || entityCountry.shipCountry || '';
};