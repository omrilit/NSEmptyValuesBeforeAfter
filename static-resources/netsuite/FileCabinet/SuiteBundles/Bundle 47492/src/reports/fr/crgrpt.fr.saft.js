/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.Report = TAF.Report || {};

TAF.Report.FR_SAFT_Report = function FR_SAFT_Report(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);

    var isOneWorld = nlapiGetContext().getFeature('SUBSIDIARIES');
    
    var acctParams = isOneWorld ? {subsidiary: ['anyof', params.subsidiary]} : {};
    if(params.job_params && params.job_params.hasAccountingContext) {
        acctParams.accountingcontext = ['is', params.accountingContext];
    }
    
    var accountingBook = this.getAccountingBook();
    var isSCOAIncluded = !accountingBook || accountingBook.isPrimary;

    params.scoaAccounts = new TAF.AccountDao().getList(acctParams);
    params.multiBookAccounts = new TAF.AccountDao().getList(acctParams,isSCOAIncluded);

    var allowperiodendjournalentries = false;
    var createbscloseandopenjournals = false;
    var createbscloseandopenjournals = false;
    var includeBalanceSheetClosingPEJ = false;
    var includeBalanceSheetOpeningPEJ = false;
    var includeIncomeStatementClosingPEJ = false;
    
	if(isOneWorld)
	{
		if(params.subsidiary) {
			var subsidiarySetting = nlapiLoadRecord("subsidiarysettings", params.subsidiary);
			allowperiodendjournalentries = subsidiarySetting.getFieldValue('allowperiodendjournalentries');
			createbscloseandopenjournals = subsidiarySetting.getFieldValue('createbscloseandopenjournals');
			createincomesummaryjournals = subsidiarySetting.getFieldValue('createincomesummaryjournals');
		}

		var column = [
			new nlobjSearchColumn('custrecord_subsidiary'),
            new nlobjSearchColumn('custrecord_report_pref_name'),
            new nlobjSearchColumn('custrecord_report_pref_bs_closing'),
            new nlobjSearchColumn('custrecord_report_pref_bs_opening'),
            new nlobjSearchColumn('custrecord_report_pref_income_closing')
        ];
        if(params.subsidiary) {
            var filter = [new nlobjSearchFilter('custrecord_subsidiary', null, 'is', params.subsidiary)];
        }
		var searchResults = nlapiSearchRecord('customrecord_report_preferences_mapping', null, filter, column);
		var reportPreferencesMapping =  searchResults ? searchResults[0] : null;

		if(reportPreferencesMapping && (reportPreferencesMapping.getValue('custrecord_subsidiary') == params.subsidiary)) {
			if(allowperiodendjournalentries == 'T' && createbscloseandopenjournals == 'T') {
                if (reportPreferencesMapping.getValue('custrecord_report_pref_bs_closing') == 'T') {     

                    includeBalanceSheetClosingPEJ = true;
                }            
                if (reportPreferencesMapping.getValue('custrecord_report_pref_bs_opening') == 'T') {

                    includeBalanceSheetOpeningPEJ = true;
                }

            }
            if(allowperiodendjournalentries == 'T' && createincomesummaryjournals == 'T') {
                if (reportPreferencesMapping.getValue('custrecord_report_pref_income_closing') == 'T') {     

                    includeIncomeStatementClosingPEJ = true;
                }            
                
                
			}
            
		}
	}
    
    this.GetOutline = function() {
        if(includeBalanceSheetOpeningPEJ || includeIncomeStatementClosingPEJ) {
            var SubSections = [
                {'Section': TAF.Report.Section.FR_SAFT_Ledger.bind(this, state, params, output, job)}
            ] 

            if(includeBalanceSheetOpeningPEJ) {
                SubSections.unshift({'Section': TAF.Report.Section.FR_SAFT_PEJ_BalanceSheetClosing.bind(this, state, params, output, job)});
            }
    
            if(includeIncomeStatementClosingPEJ) {
                SubSections.push({'Section': TAF.Report.Section.FR_SAFT_PEJ_IncomeStatementClosing.bind(this, state, params, output, job)});
            }
            return {
                'Section': TAF.Report.Section.FR_SAFT_AuditFile.bind(this, state, params, output, job),
                'SubSections': SubSections
            };
        } else {
            var SubSections = [
                {'Section': TAF.Report.Section.FR_SAFT_OpeningBalance.bind(this, state, params, output, job)},
                {'Section': TAF.Report.Section.FR_SAFT_Ledger.bind(this, state, params, output, job)},
                {'Section': TAF.Report.Section.FR_SAFT_ClosingBalance.bind(this, state, params, output, job)}
            ]
            return {
                'Section': TAF.Report.Section.FR_SAFT_AuditFile.bind(this, state, params, output, job),
                'SubSections': SubSections
            };
        }
    };
};

TAF.Report.FR_SAFT_Report.prototype = Object.create(TAF.IReportSection.prototype);

var FR_SAFT_TXT_Report = function FR_SAFT_TXT_Report(state, params, output, job) {
    params.formatter = new TAF.FR.Formatter.SAFTFormatter(params);
    params.filename = ''; //set with actual values in setFileName
    TAF.Report.FR_SAFT_Report.call(this, state, params, output, job);
};
FR_SAFT_TXT_Report.prototype = Object.create(TAF.Report.FR_SAFT_Report.prototype);
FR_SAFT_TXT_Report.IsCRGReport = true;
FR_SAFT_TXT_Report.ReportId = 'FR_SAFT_TXT';
