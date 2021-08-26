/**

 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.

 */



var Tax = Tax || {};

Tax = Tax || {};

Tax.DAO = Tax.DAO || {};



Tax.DAO.ReportDAO = function ReportDAO() {

	Tax.DAO.BaseDAO.call(this);

	this.Name = 'ReportDAO';

	this.reportName = '';

	this.reportId = '';

	this.reportSettings = null;

};



Tax.DAO.ReportDAO.prototype = Object.create(Tax.DAO.BaseDAO.prototype);



Tax.DAO.ReportDAO.prototype.prepareSearch = function prepareSearch(params) {

	if (!this.reportName) {

		throw nlapiCreateError('MISSING_REPORT_NAME', 'Please provide the name of the Saved Report.');

	}



	if (!params.periodfrom || !params.periodto) {

		throw nlapiCreateError('MISSING_REQ_PARAM', 'Please provide the reporting period range.');

	}



	this.reportSettings = new nlobjReportSettings(params.periodfrom.toString(), params.periodto.toString());

	this.reportId = this.getReportId();



	if (!this.reportId) {

		throw nlapiCreateError('INVALID_SAVED_REPORT', 'The provided Saved Report does not exist.');

	}



	if (params.subsidiary) {

		this.reportSettings.setSubsidiary(params.group ? (-params.subsidiary).toString() : params.subsidiary.toString());

	}



	if (params.bookid) {

		this.reportSettings.setAccountingBookId(params.bookid.toString());

	}



	if (params.nexusId) {
		this.reportSettings.setTaxCashBasisMode(params.isCashBasisReporting);
	}
};



Tax.DAO.ReportDAO.prototype.search = function search() {

	try {

	   return nlapiRunReport(this.reportId, this.reportSettings);

	} catch(e) {

		throw e;

	}

};



Tax.DAO.ReportDAO.prototype.processList = function processList(pivotReport) {

	return this.rowToObject(pivotReport);

};



Tax.DAO.ReportDAO.prototype.rowToObject = function rowToObject(pivotReport) {

	try {

		var rows = this.getPivotRows(pivotReport).getChildren();

		var columns = this.getColumnMetadata(pivotReport);



		for (var i = 0; rows && i < rows.length; i++) {

			this.extractRows(rows[i], columns);

		}

	} catch(e) {

		throw e;

	}

	return this.list;

};



Tax.DAO.ReportDAO.prototype.extractRows = function extractRows(node, columns) {

    var rowObject = new this.ListObject();

    for (col in columns) {

        rowObject[col] = this.getValue(node.getValue(columns[col])).toString();

    }

    this.list.push(rowObject);

};



Tax.DAO.ReportDAO.prototype.getReportId = function getReportId() {

	var reportId = '';

	var sr = nlapiSearchGlobal(this.reportName);



	for (var i = 0; sr && i < sr.length; i++) {

		if (sr[i].getValue('name').toLowerCase().trim() == this.reportName.toLowerCase().trim()) {

			reportId = sr[i].getId().replace(/REPO_/, '');

			break;

		}

	}



	return reportId;

};



Tax.DAO.ReportDAO.prototype.getPivotRows = function getPivotRows(pivotReport) {

	return pivotReport.getRowHierarchy();

};



Tax.DAO.ReportDAO.prototype.getColumns = function getColumns(pivotReport) {

	return pivotReport.getColumnHierarchy().getVisibleChildren();

};



Tax.DAO.ReportDAO.prototype.getValue = function getValue(value) {

    if (value === null || value === undefined) {

        return '';

    }



    return value;

};



Tax.DAO.ReportDAO.prototype.process = function process(result, params) {

	var cache = this.getCache(this.Name);

	if (cache) {

		return {dao: cache};

	}

	var list = [];

	if(params.taxperiodlist){

		var periodList = (params.taxperiodlist).split(',');

		for(var i=0; i < periodList.length; i++){

			var temp = Object.create(params);

			temp.periodfrom = periodList[i];

			temp.periodto = periodList[i];

			list = this.getList(temp);

		}

	}

	else

	{

		list = this.getList(params);

	}



	this.cache(this.Name, list);

	return {dao: list};

};

