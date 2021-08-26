/**
 * Copyright © 2015, 2017, 2018, 2019 Oracle and/or its affiliates. All rights reserved.
 */
var TAF = TAF || {};

function DE_GDPDU_GL_Report(state, params, output, job) {
	this.outline = {
		"Section": GeneralLedger
	};

	this.GetOutline = function() {
		return this.outline;
	};

	this.GetReportIndex = function getReportIndex() {
		return getIndex();
	};

	function getIndex() {
		var formatterColumns = params.formatter.TEMPLATE.COLUMNS;
		var columns = [];
		for (var i = 0; i < formatterColumns.length; i++) {
			var column = formatterColumns[i];
			columns.push(new SFC.Utilities.ReportColumn(column, column.constantType, column.constantDescriptor));
		}

		var reportIndex = {};
		reportIndex.url = params.filename;
		reportIndex.name = params.filename;
		reportIndex.description = 'Hauptbuch';
		reportIndex.decimalsymbol = SFC.Utilities.Constants.DECIMALSYMBOL;
		reportIndex.digitgroupingsymbol = SFC.Utilities.Constants.DIGITGROUPINGSYMBOL;
		reportIndex.columndelimiter = SFC.Utilities.Constants.COLUMNDELIMITER;
		reportIndex.columns = columns;
		return reportIndex;
	}

	function GeneralLedger() {
		return new DE_GDPDU_GL_ReportSection(state, params, output, job);
	}
}

function DE_GDPDU_GL_ReportSection(state, params, output, job) {
	this.ENTRIES_PER_PAGE = 1000;
	TAF.IReportSection.apply(this, arguments);
	this.Name = 'GeneralLedger';
    this.pageSize = 500;
    }

DE_GDPDU_GL_ReportSection.prototype = Object.create(TAF.IReportSection.prototype);
DE_GDPDU_GL_ReportSection.prototype.On_Init = function() {
	TAF.IReportSection.prototype.On_Init.call(this);

	this.context = nlapiGetContext();
	this.isMultiCurrency = this.context.getFeature('MULTICURRENCY');
	this.isOneWorld = this.context.getFeature('SUBSIDIARIES');
	this.isMultiBook = this.context.getFeature('MULTIBOOK');
    this.resource = new ResourceMgr(this.params.job_params.CultureId);

    this.subsidiary = this.isOneWorld ? SFC.Subsidiaries.Load(this.params.subsidiary) : null;
	this.subsidiaryChildren = this.subsidiary && this.params.include_child_subs ? this.subsidiary.GetDescendants() : null;

	if (!this.state.common) {
		this.setCommonState();
	}

	if (!this.state[this.Name]) {
		this.setReportState();
	}
	        
	this.validateCurrencies();

	this.glLineDao = new TAF.DE.DAO.GeneralLedgerLineDao();
    var acctParams = this.isOneWorld ? {subsidiary: ['anyof', this.state.common.subIds]} : {};
    acctParams.accountingcontext = ['is',this.params.accountingContext];
	this.accounts = new TAF.AccountDao().getList(acctParams, false);
	this.adapter = new TAF.DE.Adapter.GLAdapter(this.accounts);
};

DE_GDPDU_GL_ReportSection.prototype.setCommonState = function() {
	var subsidiaryList = [];
	if (this.isOneWorld) {
		subsidiaryList.push(this.params.subsidiary);
	}

	for (var ichild = 0; ichild < (this.subsidiaryChildren && this.subsidiaryChildren.length); ichild++) {
		subsidiaryList.push(this.subsidiaryChildren[ichild].GetId());
	}

	this.state.common = {
		periodIds: new TAF.DAO.AccountingPeriodDao().getCoveredPostingPeriods(this.params.periodFrom, this.params.periodTo),
		subIds: this.isOneWorld ? subsidiaryList : null
	};
};

DE_GDPDU_GL_ReportSection.prototype.setReportState = function() {
	this.state[this.Name] = {
		index : 0,
		fileIndex : 0,
        rowFileIndex : 0,
		periodIndex: 0,
		searchIndex: 0
	};
};

DE_GDPDU_GL_ReportSection.prototype.validateCurrencies = function() {
	if (!this.isMultiCurrency || !this.subsidiaryChildren) {
		return;
	}
	var invalidCurrencySubs = [];
	var currencyCode = this.subsidiary.GetCurrencyCode();

	for (var ichild = 0; ichild < this.subsidiaryChildren.length; ++ichild) {
		if (currencyCode != this.subsidiaryChildren[ichild].GetCurrencyCode()) {
			invalidCurrencySubs.push(this.subsidiaryChildren[ichild].GetName());
		}
	}

	if (invalidCurrencySubs.length > 0) {
		throw nlapiCreateError('DE_AUDIT_Currency_Check', this.resource.GetString('ERR_CURRENCY_CHECK', {'subsidiaries': invalidCurrencySubs.join(', ')}), true);
	}
};

DE_GDPDU_GL_ReportSection.prototype.On_Header = function() {
	this.output.WriteLine(this.formatter.formatGLHeader());
};

DE_GDPDU_GL_ReportSection.prototype.On_Body = function() {
	try {
		var params = this.state.common;
		var glState = this.state[this.Name];
		
		if(this.params.useSS2Engine){
			try{
				var csvDaoParams = {jobId : this.job.GetId() };
				var dao = new TAF.DE.DAO.GeneralLedgerCsvDao(csvDaoParams);
				
				this.processTxtFiles(dao, this.processGLLine);				
			}catch (ex) {
				nlapiLogExecution('ERROR', 'DE_GDPDU_GL_ReportSection.processInternalIdsPerPeriod.SS2', ex.toString());
				throw ex;
			}
		}
		else
		{			
			for (var iperiod = glState.periodIndex; iperiod < (params.periodIds && params.periodIds.length); iperiod++) {
				this.glLineDao.search({
					periodIds: params.periodIds[iperiod].id,
					subIds: this.isOneWorld ? params.subIds : [],
					bookId: this.params.bookId
				});
				var index = this.process(this.glLineDao, glState.searchIndex, this.processGLLine);	
				glState.periodIndex = iperiod;
				glState.searchIndex = index;
				if (this.thresholdReached) {
					break;
				}
			}
		}
	} catch (ex) {
		nlapiLogExecution('ERROR', 'DE_GDPDU_GL_ReportSection.processInternalIdsPerPeriod', ex.toString());
		throw ex;
	}
};

DE_GDPDU_GL_ReportSection.prototype.On_CleanUp = function() {
	TAF.IReportSection.prototype.On_CleanUp.call(this);
	delete this.state.common;
};

DE_GDPDU_GL_ReportSection.prototype.processGLLine = function(line) {
	if (!line) {
		throw nlapiCreateError('MISSING_PARAMETER', 'line is a required parameter');
	}
	try {
		var convertedGlLine = this.adapter.getGeneralLedger(line);
		if (!convertedGlLine) {
			return;
		}		
		this.output.WriteLine(this.formatter.formatGLLine(convertedGlLine));
	} catch (ex) {
		nlapiLogExecution('ERROR', 'DE_GDPDU_GL_ReportSection.processGLLine', ex.toString());
	}
};

var DE_GDPDU_GL_TXT_Report = function DE_GDPDU_GL_TXT_Report(state, params, output, job) {
	params.formatter = new TAF.DE.Formatter.GLFormatter();
	params.filename = 'genledger.txt';
	DE_GDPDU_GL_Report.call(this, state, params, output, job);
};
DE_GDPDU_GL_TXT_Report.prototype = Object.create(DE_GDPDU_GL_Report.prototype);
DE_GDPDU_GL_TXT_Report.IsCRGReport = true;
DE_GDPDU_GL_TXT_Report.ReportId = 'DE_GDPDU_GL_TXT';