/**
 * Copyright © 2014, 2018, Oracle and/or its affiliates. All rights reserved.
 */

function MX_SAT_TrialBalance_Report(state, params, output, job) {
    params.isOneWorld = SFC.Context.IsOneWorld();
    params.period = SFC.PostingPeriods.Load(params.periodFrom);

    this.outline = {
       "Section": trialBalance
	};
	this.GetOutline = function() { return this.outline; };
	
	function trialBalance() {
		return new MX_SAT_TrialBalance_Section(state, params, output, job);
	}
}

//Report Sections
function MX_SAT_TrialBalance_Section(state, params, output, job) {
    TAF.MX.SAT.ReportSection.apply(this, arguments);
    this.Name         = 'TrialBalance';
    this.SAVED_REPORT = 'TAF Trial Balance';
    this.PROGRESS_PERCENTAGE = {
        HEADER:  10,
        BODY:    95,
        FOOTER:  100
    };

    this.adapter = new TAF.MX.Adapter.TrialBalanceAdapter();
}

MX_SAT_TrialBalance_Section.prototype = Object.create(TAF.MX.SAT.ReportSection.prototype);

MX_SAT_TrialBalance_Section.prototype.On_Init = function() {
    this.state[this.Name] = this.state[this.Name] || {currentIndex: -1, rollUpIndex: -1, treeIndex: -1};
    this.subsidiary = this.params.isOneWorld ? new TAF.DAO.SubsidiaryDao().getSubsidiaryInfo(this.params) : null;
    var accountingBook = this.getAccountingBook();
    var isSCOAIncluded = !accountingBook || accountingBook.isPrimary;
    this.usesAccountingContext = this.params.accountingContext != '';
    var accountParams = this.getAccountParams();

    var MEXICO_LOCALIZATION_BUNDLE = 'cd476cab-e846-474e-9f11-e213e69c420b';
    this.hasMXLocalization = SFC.Registry.IsInstalled(MEXICO_LOCALIZATION_BUNDLE);

    if (nlapiGetContext().getFeature('MULTIPLECALENDARS')) {
        this.validateAccountingPeriods(this.params.periodFrom, this.subsidiary.getFiscalCalendar());
    }
    
    this.accounts = new TAF.DAO.AccountDao().getList(accountParams, isSCOAIncluded);
    
    if(this.hasMXLocalization) {
    	this.mappings = new TAF.DAO.MappingDao().mxGetMappings('MX_ACCOUNT_GROUPING');
    } else {
    	this.mappings = this.getAccountGroupMappings(accountParams);
    }
    this.trialBalance = {};
    
    
    if(this.state[this.Name].accountValues){
        this.trialBalance = this.state[this.Name].accountValues
    }
    else{
        new TAF.DAO.EnhancedTrialBalanceDAO().getList({
            periodFrom: this.params.periodFrom,
            periodTo: this.params.periodFrom,
            subsidiary: this.params.subsidiary,
            group: this.params.include_child_subs,
            bookId: this.params.bookId
        }).forEach(function(a) {
            this.trialBalance[a.internalId] = a;
        }, this);
    }
};

MX_SAT_TrialBalance_Section.prototype.On_Header = function() {
    var rawData = {
        isOneWorld  : this.params.isOneWorld,
        period      : this.params.period
    };
    
    if (this.params.isOneWorld) {
        rawData.subsidiary = this.subsidiary;
    } else {
        rawData.company = new TAF.DAO.CompanyDao().getInfo();
    }
    
    headerData = this.adapter.getHeaderData(rawData);
    this.output.WriteLine(this.formatter.formatHeader());
    this.output.WriteLine(this.formatter.formatBalanceHeader(headerData));
    
    this.output.SetFileName(this.formatter.formatTrialBalanceFilename(headerData));
    this.output.SetPercent(this.PROGRESS_PERCENTAGE.HEADER);
};


MX_SAT_TrialBalance_Section.prototype.On_Body = function() {
    var accountIds = this.adapter.getSortedAccountIds(this.accounts);
    var index = this.state[this.Name].currentIndex + 1;
    var treeIndex = this.state[this.Name].treeIndex + 1;
    var rollUpIndex = this.state[this.Name].rollUpIndex + 1;
    var line = {};
    var accountId = -1;
    

    this.getAccountTree(accountIds, treeIndex);
    if (this.job.IsThresholdReached()) {
        return;
    }
    
    this.getAccountTotals(accountIds, rollUpIndex);
    if (this.job.IsThresholdReached()) {
        return;
    }
    
    for (var i = index; i < accountIds.length; i++) {
        accountId = accountIds[i];
        line = this.adapter.getLineData({
            account: this.accounts[accountId],
            balance: this.trialBalance[accountId] || {},
            group: this.mappings[accountId],
            usesAccountingContext: this.usesAccountingContext
        });
        
        if (line) {
            this.output.WriteLine(this.formatter.formatBalanceBody(line));
        }
        
        this.state[this.Name].currentIndex = i;
        
        if (this.job.IsThresholdReached()) {
            return;
        }
    }
    
    this.output.SetPercent(this.PROGRESS_PERCENTAGE.BODY);
};

MX_SAT_TrialBalance_Section.prototype.On_Footer = function() {
    this.output.WriteLine(this.formatter.formatBalanceFooter());
    this.output.SetPercent(this.PROGRESS_PERCENTAGE.FOOTER);
};

MX_SAT_TrialBalance_Section.prototype.getAccountTree = function(accountIds, treeIndex){
    for(var i = treeIndex; i< accountIds.length; i++){
        var parent = nlapiLoadRecord('account', accountIds[i]).getFieldValue('parent');
        if(parent && this.trialBalance[parent]){
            this.trialBalance[parent]['children'] = this.trialBalance[parent]['children']||[];
            this.trialBalance[parent]['children'].push(accountIds[i]);
        }
        
        if (this.job.IsThresholdReached()) {
            nlapiLogExecution('AUDIT', 'Forced Rescheduling', 'Execution Limit Threshold reached while building account tree')
            this.state[this.Name].treeIndex = i;
            this.state[this.Name].accounts = this.trialBalance;
            return;
        }
    }
    
    this.state[this.Name].treeIndex = i;
};    

MX_SAT_TrialBalance_Section.prototype.getAccountTotals = function(accountIds, rollUpIndex){
    var indexLimit = 1000, totalIndex = 0;

    for(var i = rollUpIndex; i< accountIds.length; i++){
        var parent = accountIds[i];
        if(this.trialBalance[parent] && this.trialBalance[parent].children){
            var childValueTotals = this.rollUpAccountValues(parent);

            this.trialBalance[parent].lastDebit = +this.trialBalance[parent].lastDebit + childValueTotals.lastDebit;
            this.trialBalance[parent].lastCredit = +this.trialBalance[parent].lastCredit + childValueTotals.lastCredit;
            this.trialBalance[parent].currentDebit = +this.trialBalance[parent].currentDebit + childValueTotals.currentDebit;
            this.trialBalance[parent].currentCredit = +this.trialBalance[parent].currentCredit + childValueTotals.currentCredit;
            this.trialBalance[parent].closingDebit = +this.trialBalance[parent].closingDebit + childValueTotals.closingDebit;
            this.trialBalance[parent].closingCredit = +this.trialBalance[parent].closingCredit + childValueTotals.closingCredit;
            totalIndex++;
        }
        
        if(totalIndex > indexLimit){
            nlapiLogExecution('AUDIT', 'Forced Rescheduling', 'Execution Limit Threshold reached while rolling up account totals')
            this.job.IsThresholdReached.IsTrue = true; //force reschedule to avoid reaching limits;
            this.state[this.Name].rollUpIndex = i;
            this.state[this.Name].accountValues = this.trialBalance;
            
            return;
        }
    };
};

MX_SAT_TrialBalance_Section.prototype.rollUpAccountValues = function(parentId){
    var childValueTotals = {lastDebit : 0, lastCredit : 0, currentDebit : 0, currentCredit : 0, closingDebit  : 0, closingCredit : 0};
    
    this.trialBalance[parentId].children.forEach(function(childAcct) {
        var grandChildValueTotals = {lastDebit : 0, lastCredit : 0, currentDebit : 0, currentCredit : 0, closingDebit  : 0, closingCredit : 0}; 
        if(this.trialBalance[childAcct].children){
            grandChildValueTotals = this.rollUpAccountValues(childAcct, true);
        }
        
        childValueTotals.lastDebit += +this.trialBalance[childAcct].lastDebit + grandChildValueTotals.lastDebit;
        childValueTotals.lastCredit += +this.trialBalance[childAcct].lastCredit + grandChildValueTotals.lastCredit;
        childValueTotals.currentDebit += +this.trialBalance[childAcct].currentDebit + grandChildValueTotals.currentDebit;
        childValueTotals.currentCredit += +this.trialBalance[childAcct].currentCredit + grandChildValueTotals.currentCredit;
        childValueTotals.closingDebit += +this.trialBalance[childAcct].closingDebit + grandChildValueTotals.closingDebit;
        childValueTotals.closingCredit += +this.trialBalance[childAcct].closingCredit + grandChildValueTotals.closingCredit;
        
    }, this);
    
    return childValueTotals;
};

//CRG Reports
var MX_SAT_TrialBalance_XML_Report = function _MX_SAT_TrialBalance_XML_Report(state, params, output, job) {
	params.formatter = new TAF.MX.Formatter.XML();
	MX_SAT_TrialBalance_Report.call(this, state, params, output, job);
};
MX_SAT_TrialBalance_XML_Report.prototype = Object.create(MX_SAT_TrialBalance_Report.prototype);
MX_SAT_TrialBalance_XML_Report.IsCRGReport = true;
MX_SAT_TrialBalance_XML_Report.ReportId = 'TRIAL_BALANCE_MX_XML';
