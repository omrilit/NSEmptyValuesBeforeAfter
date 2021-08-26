/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 */
var VAT = VAT || {};
VAT.OnlineFiling = VAT.OnlineFiling || {};

VAT.OnlineFiling.Preview = function(request, response) {
    this.name = 'VAT.OnlineFiling.Preview';
    this.request = request;
    this.response = response;
    this.ONLINE_FILING_RECORD_ID = 'customrecord_online_filing';
};

VAT.OnlineFiling.Preview.prototype.getPeriodName = function(periodFrom, periodTo) {
    if (periodFrom === periodTo) {
        var record = nlapiLoadRecord('taxperiod', periodFrom);
        return record.getFieldValue('periodname');
    } else {
        var fromRec = nlapiLoadRecord('taxperiod', periodFrom);
        var toRec = nlapiLoadRecord('taxperiod', periodTo);
        return [fromRec.getFieldValue('periodname'), toRec.getFieldValue('periodname')].join(' - ');
    }
};

VAT.OnlineFiling.Preview.prototype.getFormattedPeriod = function(periodFrom, periodTo, format) {
    var startDate;
    var endDate;
    var periodFormat = format || 'yyyyMMdd';

    if (periodFrom === periodTo) {
        var rec = nlapiLoadRecord('taxperiod', periodFrom);
        startDate = nlapiStringToDate(rec.getFieldValue('startdate'));
        endDate = nlapiStringToDate(rec.getFieldValue('enddate'));
    } else {
        var fromRec = nlapiLoadRecord('taxperiod', periodFrom);
        var toRec = nlapiLoadRecord('taxperiod', periodTo);
        startDate = nlapiStringToDate(fromRec.getFieldValue('startdate'));
        endDate = nlapiStringToDate(toRec.getFieldValue('enddate'));
    }
    var from = new Date(startDate.getTime()).toString(periodFormat);
    var to = new Date(endDate.getTime()).toString(periodFormat);
    return from + '_' + to;
};

VAT.OnlineFiling.Preview.prototype.getOnlineFiling = function(internalId) {
    var dao = new Tax.DAO.OnlineFilingDAO();
    var list = dao.getList({ id: internalId });
    var onlineFiling = list && list[0] ? list[0]: null;
    var data = {};
    if (onlineFiling) {
        var coveredPeriods = onlineFiling.coveredPeriods ? onlineFiling.coveredPeriods.split(',') : [];
        data.periodFrom = coveredPeriods && coveredPeriods[0];
        data.periodTo = coveredPeriods && coveredPeriods[coveredPeriods.length - 1];
        data.nexus = onlineFiling.nexus;
        data.subsidiary = onlineFiling.subsidiary;
        data.bookid = onlineFiling.accoutingBook;
        data.vatno = onlineFiling.vrn;
        data.filingstatus = onlineFiling.status;
        data.data = onlineFiling.data;
    }
    return data;
};

VAT.OnlineFiling.Preview.prototype.getPreviewData = function(params) {
    var data = this.getOnlineFiling(params.recordid);
    data.recordid = params.recordid;
    data.sysnoteid = params.recordid;
    data.onlinefilingid = params.recordid;
    data.salecacheid = params.salecacheid;
    data.purchasecacheid = params.purchasecacheid;
    data.reportingperiod = this.getPeriodName(data.periodFrom, data.periodTo);
    // TODO load these from Online Filing Configuration
    data.symbol = '';
    data.precision = 2;
    data.thousand = ',';
    data.decimal = '.';
    data.negative = '-%v';
    data.library = _App.GetLibraryFile(VAT.LIB.FORMAT).getValue();
    return data;
};

VAT.OnlineFiling.Preview.prototype.printPreview = function(params) {
    var data = this.getPreviewData(params);
    var reportIndex = this.getReportIndex(data.periodTo, data.nexus) || params.reportindex;
    var reportObj = VAT.ReportRegister[data.nexus][reportIndex];
    var adapter = new VAT.OnlineFiling[data.nexus].Adapter();
    var formData = adapter.transform(data, data.data);
    var templateContent = reportObj.GetPrintTemplate(params.periodfrom, params.periodto);
    var pdfForm = _App.RenderTemplate(templateContent, formData);
    var formatterPeriod = this.getFormattedPeriod(data.periodFrom, data.periodTo);
    var fileName = data.vatno + '_' + formatterPeriod + '.pdf';
    var pdfFile = nlapiXMLToPDF('<?xml version="1.0"?>\n<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">\n' + pdfForm);
    this.response.setContentType('PDF', fileName);
    this.response.write(pdfFile.getValue());
};

VAT.OnlineFiling.Preview.prototype.formPreview = function(params) {
    var data = this.getPreviewData(params);
    var reportIndex = this.getReportIndex(data.periodTo, data.nexus) || params.reportindex;
    var reportObj = VAT.ReportRegister[data.nexus][reportIndex];
    var onlineContent = reportObj.GetReportTemplate(data.periodFrom, data.periodTo);
    data.previewcontent = _App.RenderTemplate(onlineContent, data);
    var adapter = new VAT.OnlineFiling[data.nexus].Adapter();
    var formData = adapter.transform(data, data.data);
    var template = getTaxTemplate('ONLINE_FILING_PREVIEW');
    var onlineForm = _App.RenderTemplate(template.short, formData);
    var form = nlapiCreateForm('', true);
    var htmPrintButton = _App.ButtoniseExtJs('btnprint', 'Print', 'OnPrint()', true);
    var htmCloseButton = _App.ButtoniseExtJs('btnclose', 'Close', 'OnClose()', true);
    var div = ['<div id="divvat" name="divvat" style="border: 1px dotted #000000; width: 100%; height: 100%">', onlineForm, '</div>'].join('');

    _App.CreateField(form, 'btnprint', 'inlinehtml', '', false, htmPrintButton, 'normal', 'outsideabove');
    _App.CreateField(form, 'btnclose', 'inlinehtml', '', false, htmCloseButton, 'normal', 'outsideabove');
    _App.CreateField(form, 'onlineform', 'inlinehtml', '', false, div, 'normal', 'normal');

    this.response.writePage(form);
};

VAT.OnlineFiling.Preview.prototype.getReportIndex = function(periodTo, nexus) {
    var vatForm = new Tax.DAO.TaxReportMapperDetailsDAO().getActiveForms({
        type: 'VAT',
        countryCode: nexus,
        periodTo: new SFC.System.TaxPeriod(periodTo).GetEndDate()
    });
    
    return vatForm && vatForm[0].name || '';
}
