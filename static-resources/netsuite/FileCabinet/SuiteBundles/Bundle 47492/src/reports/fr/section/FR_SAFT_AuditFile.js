/**
 * Copyright © 2016, 2018, Oracle and/or its affiliates. All rights reserved.
 */

if (!TAF) { var TAF = {}; }
TAF.Report = TAF.Report || {};
TAF.Report.Section = TAF.Report.Section || {};

TAF.Report.Section.FR_SAFT_AuditFile = function FR_SAFT_AuditFile(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.Name = 'FR_SAFT_AuditFile';
};

TAF.Report.Section.FR_SAFT_AuditFile.prototype = Object.create(TAF.IReportSection.prototype);

TAF.Report.Section.FR_SAFT_AuditFile.prototype.On_Init = function On_Init() {
    this.state.isMultiCurrency = SFC.Context.GetContext().getFeature('MULTICURRENCY');
    this.state.isOneWorld = SFC.Context.IsOneWorld();
    this.state.isMultiBook = SFC.Context.IsMultiBook();
    this.isForeignCurrency = SFC.Context.GetContext().getFeature('FOREIGNCURRENCYMANAGEMENT');

    if (SFC.Context.GetContext().getFeature('MULTIPLECALENDARS')) {
        var subsidiary = SFC.Subsidiaries.Load(this.params.subsidiary);
        this.validateAccountingPeriods(this.params.periodTo, subsidiary.GetFiscalCalendar());
    }

    this.state.isSubAccountEnabled = this.checkIsSubAccountEnabled();
    this.state.defaultCurrency = this.getDefaultCurrency();
    this.state.includeOpeningBalances = false;
    
    this.setFileName();
};

TAF.Report.Section.FR_SAFT_AuditFile.prototype.checkIsSubAccountEnabled = function checkIsSubAccountEnabled() {
    var configParams = {
        report : 'FR_SAFT_TXT',
        key : 'UseSubAccount'
    };
    
    if (this.state.isOneWorld) {
        configParams.subsidiary = this.params.subsidiary;
    }    
    
    return (new TAF.DAO.ConfigDao().getConfigValue(configParams) === 'T');
};

TAF.Report.Section.FR_SAFT_AuditFile.prototype.setFileName = function setFileName() {
    var dao = new TAF.FR.DAO.CompanyInfoDao(this.params.subsidiary);
    var taxNumber = dao.getTaxNumber();
    var accountingYearEndDate = this.getAccountingYearEndDate();
    this.output.SetFileName(this.formatter.formatFileName(taxNumber, accountingYearEndDate));
};

TAF.Report.Section.FR_SAFT_AuditFile.prototype.getAccountingYearEndDate = function getAccountingYearEndDate() {
    var result;

    try {
        var date = SFC.PostingPeriods.Load(this.params.periodTo).GetEndDate();
        var subsidiary = this.state.isOneWorld ? SFC.Subsidiaries.Load(this.params.subsidiary) : null;
        var daoParams = {
            parent: '@NONE@',
            date: date,
            fiscalCalendar: subsidiary ? subsidiary.GetFiscalCalendar() : null
        };
        var dao = new TAF.FR.DAO.AccountingPeriodDao();
        dao.search(daoParams);
        result = dao.getList();
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.Report.Section.FR_SAFT_AuditFile.getAccountingYearEndDate', ex.toString());
    }

    return result && result.length > 0 ? result[0].endDate : '';
};

TAF.Report.Section.FR_SAFT_AuditFile.prototype.getDefaultCurrency = function getDefaultCurrency() {
    var currency = 'Euro';

    if (this.isMultiBook && this.isForeignCurrency && this.params.bookId) {
        currency = this.getAccountingBookCurrency();
    } else if (this.state.isOneWorld) {
        var subsidiary = SFC.Subsidiaries.Load(this.params.subsidiary);
        currency = subsidiary.GetCurrencyCode();
    } else if (this.state.isMultiCurrency) {
        currency = SFC.Context.GetCompanyInfo().getFieldText('basecurrency');
    }

    return currency;
};

TAF.Report.Section.FR_SAFT_AuditFile.prototype.getAccountingBookCurrency = function getAccountingBookCurrency() {
    var subsidiaryInfo = new TAF.SubsidiaryDao().getSubsidiaryInfo({
        subsidiary: this.params.subsidiary,
        bookId: this.params.bookId
    });

    return subsidiaryInfo ? subsidiaryInfo.getAccountingBookCurrency() : null;
};

