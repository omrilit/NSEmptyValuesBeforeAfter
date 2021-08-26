/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
function MX_SAT_Auxiliary_Report(state, params, output, job) {
    params.isOneWorld = SFC.Context.IsOneWorld();
    params.period = SFC.PostingPeriods.Load(params.periodFrom);

    this.outline = {
       "Section": auxiliary
    };
    this.GetOutline = function() { return this.outline; };
    
    function auxiliary() {
        return new MX_SAT_Auxiliary_Section(state, params, output, job);
    }
}

//Report Sections
function MX_SAT_Auxiliary_Section(state, params, output, job) {
    TAF.MX.SAT.ReportSection.apply(this, arguments);
    this.Name = 'Auxiliary';
}

MX_SAT_Auxiliary_Section.prototype = Object.create(TAF.MX.SAT.ReportSection.prototype);

MX_SAT_Auxiliary_Section.prototype.On_Init = function() {
	TAF.IReportSection.prototype.On_Init.call(this);
	this.context = nlapiGetContext();
	this.isMultiCurrency = this.context.getFeature('MULTICURRENCY');
	this.isOneWorld = this.context.getFeature('SUBSIDIARIES');
	this.isMultiBook = this.context.getFeature('MULTIBOOK');
    this.usesAccountingContext = this.params.accountingContext != '';
    
    var MEXICO_LOCALIZATION_BUNDLE = 'cd476cab-e846-474e-9f11-e213e69c420b';
    this.hasMXLocalization = SFC.Registry.IsInstalled(MEXICO_LOCALIZATION_BUNDLE);

    if (!this.state[this.Name]) {
        this.initializeStateObject();
    } else {
        this.adapter = new TAF.MX.Adapter.AuxiliaryAdapter(this.state[this.Name].companyInfo);
    }
    
    if (this.context.getFeature('MULTIPLECALENDARS')) {
        this.validateAccountingPeriods(this.params.periodFrom, this.state[this.Name].companyInfo.subsidiary.fiscalCalendar);
    }
    
    this.auxDao = new TAF.MX.DAO.AuxiliaryLineDao({context: this.context});
    this.auxDaoParams = {
        periodIds : this.state[this.Name].periodIds,
        subId : this.params.subsidiary,
        accountId : -1,
        glStatus : this.state[this.Name].glStatus,
        bookId: this.params.bookId
    };

    this.pejDao = new TAF.MX.DAO.PEJLineDao({context: this.context});
    this.pejDaoParams = {
        periodIds : this.state[this.Name].periodIds,
        subId : this.params.subsidiary,
        accountId : -1,
        glStatus : this.state[this.Name].glStatus,
        bookId: this.params.bookId
    };

    this.pejDao.search(this.auxDaoParams);                   
    this.pejList = this.pejDao.getList(0);

    this.pejAccounts = [];
    for(var i = 0; i < this.pejList.length; i++){
        this.pejAccounts.push(this.pejList[i].accountId);
    }
    
    var accountingBook = this.getAccountingBook();
    var isSCOAIncluded = !accountingBook || accountingBook.isPrimary;
    var accountParams = this.getAccountParams();
    this.accounts = new TAF.DAO.AccountDao().getList(accountParams, isSCOAIncluded);
    
    if(this.hasMXLocalization) {
    	this.mappings = new TAF.DAO.MappingDao().mxGetMappings('MX_ACCOUNT_GROUPING');
    } else {
    	this.mappings = this.getAccountGroupMappings(accountParams);
    }
    this.trialBalance = {};
    
    new TAF.DAO.EnhancedTrialBalanceDAO().getList({
        periodFrom: this.params.periodFrom,
        periodTo: this.params.periodFrom,
        subsidiary: this.params.subsidiary,
        group: this.params.include_child_subs,
        bookId: this.params.bookId
    }).forEach(function(a) {
        this.trialBalance[a.internalId] = a;
    }, this);
};

MX_SAT_Auxiliary_Section.prototype.initializeStateObject = function() {
    try {
        var periodDao = new TAF.DAO.AccountingPeriodDao();
        var periodIds = periodDao.getCoveredPeriodIds(this.params.periodFrom, this.params.periodFrom);
        var period = periodDao.getPeriodById(this.params.periodFrom);
        var glStatus = this.getGLStatus(periodIds, period.startDate);
        
        var companyInfo = {isOneWorld: this.params.isOneWorld};
        
        if (this.params.isOneWorld) {
            companyInfo.subsidiary = new TAF.DAO.SubsidiaryDao().getSubsidiaryById(this.params.subsidiary);
        } else {
            companyInfo.company = new TAF.DAO.CompanyDao().getInfo();
        }
        
        this.adapter = new TAF.MX.Adapter.AuxiliaryAdapter(companyInfo);
        
        this.state[this.Name] = {
            companyInfo      : companyInfo,
            periodIds        : periodIds,
            period           : period,
            glStatus         : glStatus,
            accountLineIndex : -1,
            txnLineIndex     : -1,
            isOpen           : false
        };
    } catch (ex) {
        nlapiLogExecution('ERROR', 'MX_SAT_Auxiliary_Section.initializeStateObject', ex.toString());
        throw ex;
    }
};

MX_SAT_Auxiliary_Section.prototype.On_Header = function() {
    try {
        var headerData = this.getHeaderConfig(this.state[this.Name].period, this.state[this.Name].companyInfo);
        this.output.WriteLine(this.formatter.formatHeader());
        
        switch (headerData.submissionType) {
            case 'AF':
                // Fall-through is expected
            case 'FC':
                this.output.WriteLine(this.formatter.formatAuxiliaryHeaderOrden(headerData));
                break;
            case 'DE':
                // Fall-through is expected
            case 'CO':
                this.output.WriteLine(this.formatter.formatAuxiliaryHeaderTramite(headerData));
                break;
            default:
                nlapiLogExecution('ERROR', 'MX_SAT_Auxiliary_Section', 'Invalid submission type ' + headerData.submissionType);
                throw nlapiCreateError('INVALID_DATA', 'TipoSolicitud is invalid. Verify that you have entered the correct value in your MX Setup Configuration.');
                break;
        }
        
        this.output.SetPercent(this.PROGRESS_PERCENTAGE.HEADER);
        this.output.SetFileName(this.formatter.formatAuxiliaryFilename(headerData));
    } catch (ex) {
        nlapiLogExecution('ERROR', 'MX_SAT_Auxiliary_Section.On_Header', ex.toString());
        throw ex;
    }
};

MX_SAT_Auxiliary_Section.prototype.On_Body = function() {
    var accountIds = this.adapter.getSortedAccountIds(this.accounts);
    var index = this.state[this.Name].isOpen ? this.state[this.Name].accountLineIndex : this.state[this.Name].accountLineIndex + 1;

    var allowperiodendjournalentries = false;
    var createbscloseandopenjournals = false;
    var createbscloseandopenjournals = false;
    var includeBalanceSheetClosingPEJ = false;
    var includeBalanceSheetOpeningPEJ = false;
    
	if(this.isOneWorld)
	{
		if(this.params.subsidiary) {
			var subsidiarySetting = nlapiLoadRecord("subsidiarysettings", this.params.subsidiary);
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
        if(this.params.subsidiary) {
            var filter = [new nlobjSearchFilter('custrecord_subsidiary', null, 'is', this.params.subsidiary)];
        }
		var searchResults = nlapiSearchRecord('customrecord_report_preferences_mapping', null, filter, column);
        var reportPreferencesMapping =  searchResults ? searchResults[0] : null;
        
        if(reportPreferencesMapping && (reportPreferencesMapping.getValue('custrecord_subsidiary') == this.params.subsidiary))
        {
            if(allowperiodendjournalentries == 'T' && createbscloseandopenjournals == 'T') {
                if (reportPreferencesMapping.getValue('custrecord_report_pref_bs_closing') == 'T') {     
                    includeBalanceSheetClosingPEJ = true;
                }            
                if (reportPreferencesMapping.getValue('custrecord_report_pref_bs_opening') == 'T') {
                    includeBalanceSheetOpeningPEJ = true;
                }
            }
        }
		
	}
    
    for (var i = index; i < accountIds.length; i++) {
        try {
            accountId = accountIds[i];
            
            line = this.adapter.getLineData({
                account: this.accounts[accountId],
                balance: this.trialBalance[accountId] || {},
                group: this.mappings[accountId],
                usesAccountingContext: this.usesAccountingContext
            });
            
            if (line) {
                var txnList = [];
                if (!this.state[this.Name].isOpen) {
                    this.auxDaoParams.accountId = line.id;
                    this.auxDao.search(this.auxDaoParams);
                   
                    txnList = this.auxDao.getList(index);
                    if(txnList.length > 0)
                    {
                        var pejIndex = this.pejAccounts.indexOf(accountId);
                        if(pejIndex != -1){
                            if(includeBalanceSheetClosingPEJ == true && this.pejList[pejIndex].isReversal == 'F'){
                                line.closingBalance = this.pejList[pejIndex].debitAmount;
                            }
                            if(includeBalanceSheetOpeningPEJ == true && this.pejList[pejIndex].isReversal == 'T' ){
                                line.openingBalance = this.pejList[pejIndex].creditAmount;
                            }
                        }
                        this.output.WriteLine(this.formatter.formatAuxiliaryAccountHeader(line));
                        this.state[this.Name].isOpen = true;
                    }
                    
                    if (this.job.IsThresholdReached()) {
                        this.state[this.Name].accountLineIndex = i;
                        return;
                    }
                }
                
                this.addGL(line);
                if(txnList.length > 0)
                {
                  this.output.WriteLine(this.formatter.formatAuxiliaryAccountFooter());
                }                
                this.state[this.Name].isOpen = false;
            }
        } catch(e) {
            if (e !== 'THRESHOLD_REACHED') {
                throw e;
            }
            
            return;
        }
    }
    
    this.output.SetPercent(this.PROGRESS_PERCENTAGE.BODY);
};

MX_SAT_Auxiliary_Section.prototype.addGL = function(accountLine) {
    this.auxDaoParams.accountId = accountLine.id;
    this.auxDao.search(this.auxDaoParams);
    var txnList = [];
    var auxLine = {};
    
    do {
        var index = this.state[this.Name].txnLineIndex + 1;
        txnList = this.auxDao.getList(index);
        
        for (var i = 0; i < txnList.length; i++) {
            auxLine = this.adapter.getTxnLineData(txnList[i]);
            this.output.WriteLine(this.formatter.formatAuxiliaryLine(auxLine));
            this.state[this.Name].txnLineIndex++;
            
            if (this.job.IsThresholdReached()) {
                throw 'THRESHOLD_REACHED';
            }
        }
    } while (this.auxDao.hasMoreRows);
    
    this.state[this.Name].txnLineIndex = -1;
};

MX_SAT_Auxiliary_Section.prototype.On_Footer = function() {
    this.output.WriteLine(this.formatter.formatAuxiliaryFooter());
    this.output.SetPercent(this.PROGRESS_PERCENTAGE.FOOTER);
};

//CRG Reports
var MX_SAT_Auxiliary_XML_Report = function _MX_SAT_Auxiliary_XML_Report(state, params, output, job) {
    params.formatter = new TAF.MX.Formatter.XML();
    MX_SAT_Auxiliary_Report.call(this, state, params, output, job);
};
MX_SAT_Auxiliary_XML_Report.prototype = Object.create(MX_SAT_Auxiliary_Report.prototype);
MX_SAT_Auxiliary_XML_Report.IsCRGReport = true;
MX_SAT_Auxiliary_XML_Report.ReportId = 'AUXILIARY_MX_XML';
