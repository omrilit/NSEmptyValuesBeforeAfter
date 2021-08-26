/**
 * Copyright © 2016, 2017, Oracle and/or its affiliates. All rights reserved.
 */

if (!TAF) { var TAF = {}; }
TAF.Report = TAF.Report || {};
TAF.Report.Section = TAF.Report.Section || {};

TAF.Report.Section.FR_SAFT_ClosingBalance = function FR_SAFT_ClosingBalance(state, params, output, job) {
    TAF.Report.Section.FR_SAFT_OpeningBalance.apply(this, arguments);
    this.pageSize = 500;
    this.Name = 'FR_SAFT_ClosingBalance';
    this.includeSection = false;
};

TAF.Report.Section.FR_SAFT_ClosingBalance.prototype = Object.create(TAF.Report.Section.FR_SAFT_OpeningBalance.prototype);

TAF.Report.Section.FR_SAFT_ClosingBalance.prototype.On_Init = function On_Init() {
    this.sectionState = this.state[this.Name] || {};
    this.subsidiary = this.state.isOneWorld ? SFC.Subsidiaries.Load(this.params.subsidiary) : null;
    this.periodDao = new TAF.DAO.AccountingPeriodDao();
    
    this.periodTo = this.periodDao.getPeriodById(this.params.periodTo);
    this.fiscalYears = this.getFiscalYears(this.periodTo);
    this.includeSection = this.sectionState.includeSection || this.isIncludeClosingBalanceSection();
    
    if (this.includeSection) {
        this.adapter = new TAF.Report.Adapter.ClosingBalanceAdapter({
            accountsMap: this.params.multiBookAccounts,
            sequence: this.sectionState.sequence,
            date: this.fiscalYears.thisYear.endDate,
            resource: {
                type: 'DC',
                description: 'DE CLOTURE',
                longDescription: 'JOURNAL DE CLOTURE ANNUELLE',
                pieceRef: 'CBL'
            },
            usesAccountingContext: this.params.accountingContext != '',
            companyLegalName: this.getLegalName() || ''
        });
    }
};

TAF.Report.Section.FR_SAFT_ClosingBalance.prototype.On_Header = function On_Header() {};

TAF.Report.Section.FR_SAFT_ClosingBalance.prototype.On_Body = function On_Body() {
    if (this.includeSection) {
        var reportParams = {
            subsidiary: this.params.subsidiary,
            periodFrom: this.fiscalYears.nextYear.id,
            group: this.params.group,
            bookId: this.params.bookId
        };
        
        reportParams.periodTo = reportParams.periodFrom;
        
        var balances = new TAF.DAO.OpeningBalanceDAO().getList(reportParams);
        var line = {};
        var index = this.sectionState.index || 0;
        
        for (var i = index; i < balances.length; i++) {
            line = this.adapter.getBalanceLine(balances[i]);
            
            if (line) {
                this.output.WriteLine(this.formatter.formatSAFTLine(line));
            }
            
            index++;
            
            if (this.job.IsThresholdReached()) {
                this.state[this.Name] = {
                    includeSection: this.includeSection,
                    date: this.fiscalYears.thisYear.endDate,
                    sequence: this.adapter.sequence,
                    index: index
                }
                
                this.thresholdReached = true;
            }
        }
    }
};

TAF.Report.Section.FR_SAFT_ClosingBalance.prototype.getFiscalYears = function getFiscalYears(period) {
    var fiscalYears = {thisYear: {}, nextYear: {}};
    
    var columns = [new nlobjSearchColumn('enddate').setSort()];
    var filters = [
        new nlobjSearchFilter('enddate', null, 'onorafter', period.endDate),
        new nlobjSearchFilter('isyear', null, 'is', 'T'),
        new nlobjSearchFilter('isinactive', null, 'is', 'F')
    ];
    
    if (SFC.Context.IsMultipleCalendar() && this.subsidiary) {
        filters.push(new nlobjSearchFilter('fiscalcalendar', null, 'is', this.subsidiary.GetFiscalCalendar()));
    }
    
    var list = this.periodDao.searchRecords(filters, columns);
    fiscalYears.thisYear = list[0];
    fiscalYears.nextYear = list[1];
    
    return fiscalYears;
};

TAF.Report.Section.FR_SAFT_ClosingBalance.prototype.isIncludeClosingBalanceSection = function isIncludeClosingBalanceSection() {
	var configParams = {
        report : 'FR_SAFT_TXT',
        key : 'IncludeClosingBalance'
    };
    
	var isClosingBalIncluded = new TAF.DAO.ConfigDao().getConfigValue(configParams);
	isClosingBalIncluded = isClosingBalIncluded === 'T' || isClosingBalIncluded === '';
    
    return (this.fiscalYears.nextYear && this.periodTo.endDate == this.fiscalYears.thisYear.endDate) && isClosingBalIncluded;
};

TAF.Report.Section.FR_SAFT_OpeningBalance.prototype.getLegalName = function _getLegalName() {
	var subName = '';
	if (this.state.isOneWorld) {
		subName = this.subsidiary.GetFieldValue('legalname');
	} else {
		var companyInfo = new TAF.DAO.CompanyDao().getInfo();
		subName = companyInfo.legalName;
	}

	return subName;
};