/**
 * Copyright © 2016, 2017, Oracle and/or its affiliates. All rights reserved.
 */

if (!TAF) { var TAF = {}; }
TAF.Report = TAF.Report || {};
TAF.Report.Section = TAF.Report.Section || {};

TAF.Report.Section.FR_SAFT_OpeningBalance = function FR_SAFT_OpeningBalance(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.Name = 'FR_SAFT_OpeningBalance';
    this.includeSection = !!this.state.includeOpeningBalances;
};

TAF.Report.Section.FR_SAFT_OpeningBalance.prototype = Object.create(TAF.IReportSection.prototype);

TAF.Report.Section.FR_SAFT_OpeningBalance.prototype.On_Init = function On_Init() {
    this.sectionState = this.state[this.Name] || {};
    
    this.subsidiary = this.state.isOneWorld ? SFC.Subsidiaries.Load(this.params.subsidiary) : null;
    
    this.periodDao = new TAF.DAO.AccountingPeriodDao();
    
    this.periodFrom = SFC.PostingPeriods.Load(this.params.periodFrom);
    this.fyStartDate = this.sectionState.fyStartDate || this.getFYStartDate(this.periodFrom);
    
    this.includeSection = this.sectionState.includeSection || this.isIncludeOpeningBalanceSection(this.periodFrom, this.fyStartDate);
    this.state.includeOpeningBalances = this.includeSection;
    
    if (this.includeSection) {
        this.adapter = new TAF.Report.Adapter.AccountBalanceAdapter({
            accountsMap: this.params.multiBookAccounts,
            sequence: this.sectionState.sequence,
            date: this.fyStartDate,
            resource: {
                type: 'AN',
                description: 'ANOUVEAUX',
                longDescription: 'JOURNAL DES \xC0-NOUVEAUX',
                pieceRef: 'OBL'
            },
            usesAccountingContext: this.params.accountingContext != '',
            companyLegalName: this.getLegalName() || ''
        });
    }
};

TAF.Report.Section.FR_SAFT_OpeningBalance.prototype.On_Header = function() {
    if (this.includeSection) {
        this.output.WriteLine(this.formatter.formatSAFTHeader());
    }
};

TAF.Report.Section.FR_SAFT_OpeningBalance.prototype.On_Body = function On_Body() {
    if (this.includeSection) {
        var reportParams = {
            subsidiary: this.params.subsidiary,
            periodFrom: this.getFYStartPeriod(this.fyStartDate),
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
                    date: this.adapter.fyStartDate,
                    sequence: this.adapter.sequence,
                    index: index
                };
                
                this.thresholdReached = true;
                return;
            }
        }
    }
};

TAF.Report.Section.FR_SAFT_OpeningBalance.prototype.getFYStartDate = function getFYStartDate(period) {
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

TAF.Report.Section.FR_SAFT_OpeningBalance.prototype.getFYStartPeriod = function getFYStartPeriod(date) {
    var columns = [new nlobjSearchColumn('startdate').setSort(true)];
    var filters = [
        new nlobjSearchFilter('startdate', null, 'on', date),
        new nlobjSearchFilter('isyear', null, 'is', 'F'),
        new nlobjSearchFilter('isquarter', null, 'is', 'F'),
        new nlobjSearchFilter('isinactive', null, 'is', 'F')
    ];
    
    return this.periodDao.searchRecords(filters, columns)[0].id;
};

TAF.Report.Section.FR_SAFT_OpeningBalance.prototype.isIncludeOpeningBalanceSection = function isIncludeOpeningBalanceSection(period, startDate) {
	var configParams = {
        report : 'FR_SAFT_TXT',
        key : 'IncludeOpeningBalance'
    };
    
	var isOpeningBalIncluded = new TAF.DAO.ConfigDao().getConfigValue(configParams);
	isOpeningBalIncluded = isOpeningBalIncluded === 'T' || isOpeningBalIncluded === '';

    return (nlapiDateToString(period.GetStartDate()) == startDate) && isOpeningBalIncluded;
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