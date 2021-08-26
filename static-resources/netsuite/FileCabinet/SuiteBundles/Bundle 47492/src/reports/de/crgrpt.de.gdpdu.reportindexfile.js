/**
 * Copyright © 2014, 2018, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Nov 2013     jluzano
 *
 */
function DE_GDPDU_RI_Report(state, params, output, job) {
    
    var SuiteScript = function() { return this; } ();
    var _IS_ONEWORLD = SFC.Context.GetContext().getSetting('FEATURE', 'SUBSIDIARIES') === 'T';
    var _IS_MULTICURRENCY = SFC.Context.GetContext().getSetting('FEATURE', 'MULTICURRENCY') === 'T';
    
    var _Outline = { 'Section': __ReportIndexFile };
    var _Job = job;                         
    var _Output = output;
    var _Params = params;
    var _State = state;
    var _Company = SFC.Context.GetCompanyInfo();
    var _Subsidiary = _IS_ONEWORLD ? SFC.Subsidiaries.Load(_Params.subsidiary) : null;
    var _ResMgr = new ResourceMgr(_Params.job_params.CultureId);
    var _ReportObj = this;
    this.GetOutline = function() { return _Outline; };
    
    function __ReportIndexFile() {
        
        this.On_Init = _OnInit;
        this.On_Body = _OnBody;
        this.On_CleanUp = _OnCleanUp;
        // for Unit Testing only
        this.___inspect = function(expr) { return eval('(' + expr + ')'); };
        
        var _NodeName = __ReportIndexFile.Name;
        var DEFAULTXMLDECLARATION = '<?xml version="1.0" encoding="UTF-8"?>';
        var NEWXMLDECLARATION = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE DataSet SYSTEM "gdpdu-01-08-2002.dtd">';
        var MEDIANAME = 'Disk 1';
        var RANGEFROM = '2';
        var VERSION = '1.0';
        var TAGNAMES = {
                version: 'Version',
                variablecolumn: 'VariableColumn',
                name: 'Name',
                format: 'Format',
                accuracy: 'Accuracy',
                datasupplier: 'DataSupplier',
                location: 'Location',
                comment: 'Comment',
                media: 'Media',
                table: 'Table',
                url: 'URL',
                description: 'Description',
                decimalsymbol: 'DecimalSymbol',
                digitgroupingsymbol: 'DigitGroupingSymbol',
                range: 'Range',
                from: 'From',
                variablelength: 'VariableLength',
                columndelimiter: 'ColumnDelimiter',
                foreignKey: 'ForeignKey',
                references: 'References'
        };
        
        
        function _OnInit() {
            
            _ValidateCurrencies();
            _Output.SetFileName(_GetFileName());
            if(_State[_NodeName] == undefined) {
                
                _State[_NodeName] = {
                    Index: -1,
                    InternalId: null
                };
            }
            _Output.SetPercent(10);
        }
        
        
        function _OnBody() {

            var w3cDocument = TAF.XML.Parser.fromString({text: '<DataSet/>'}); 
            var dataSetElement = w3cDocument.getDocumentElement();
            var versionElement = _CreateElement(TAGNAMES.version, VERSION, w3cDocument);
            var dataSupplierElement = _CreateDataSupplierElement(w3cDocument);
            var mediaElement = _CreateMediaElement(w3cDocument);
            
            dataSetElement.appendChild(versionElement);
            dataSetElement.appendChild(dataSupplierElement);
            dataSetElement.appendChild(mediaElement);
            
            _Output.WriteLine((TAF.XML.Parser.toString({document: w3cDocument})).replace(DEFAULTXMLDECLARATION, NEWXMLDECLARATION));
            _Output.SetPercent(95);
        }
        
        
        function _OnCleanUp() {
            
            delete _State[_NodeName];
            _Output.SetPercent(100);
        }
        
        
        function _CreateColumnElement(columnObj, documentObj) {
            
            var variableColumnElement = _CreateElement(TAGNAMES.variablecolumn, null, documentObj);
            variableColumnElement.appendChild(_CreateElement(TAGNAMES.name, columnObj.name, documentObj));
            
            if(columnObj.desc){
                variableColumnElement.appendChild(_CreateElement(TAGNAMES.description, columnObj.desc, documentObj));
            }
            
	    var typeElement = _CreateElement(columnObj.type, null, documentObj);
            
            if (columnObj.format != null) {
                typeElement.appendChild(_CreateElement(TAGNAMES.format, columnObj.format, documentObj));
            }
            
            if (columnObj.accuracy != null && columnObj.accuracy > 0) { 
                typeElement.appendChild(_CreateElement(TAGNAMES.accuracy, columnObj.accuracy, documentObj));
            }
            
            variableColumnElement.appendChild(typeElement);
            
            return variableColumnElement;
        }
        
        
        function _CreateDataSupplierElement(documentObj) {
            
            var companyName = '';
            var companyAddress = '';
            
            if (_IS_ONEWORLD) {
                companyName = _Subsidiary.GetLegalName() == '' ? _Subsidiary.GetName() : _Subsidiary.GetLegalName();
                companyAddress = _Subsidiary.GetAddress1() + ', ' + _Subsidiary.GetState() + ', ' + _Subsidiary.GetCountryName();
            } else {
                companyName = _Company.getFieldValue('legalname') == '' ? _Company.getFieldValue('companyname') : _Company.getFieldValue('legalname');
                companyAddress = _Company.getFieldValue('address1') + ', ' + _Company.getFieldValue('state') + ', ' + _Company.getFieldText('country');
            }
            
            var dataSupplierElement = _CreateElement(TAGNAMES.datasupplier, null, documentObj);
            dataSupplierElement.appendChild(_CreateElement(TAGNAMES.name, companyName, documentObj));
            dataSupplierElement.appendChild(_CreateElement(TAGNAMES.location, companyAddress, documentObj));
            dataSupplierElement.appendChild(_CreateElement(TAGNAMES.comment, companyName, documentObj));
            
            return dataSupplierElement;
        }
        
        
        function _CreateElement(name, value, documentObj) {
            
            if (name == undefined || name == null) {
                return null;
            }
            
            var element = documentObj.createElement(name);
            
            if (value != undefined && value != null) {
                element.appendChild(documentObj.createTextNode(value));
            }
            
            return element;
        }
        
        
        function _CreateMediaElement(documentObj) {
            
            var reports = _GetReports();
            var mediaElement = _CreateElement(TAGNAMES.media, null, documentObj);
            mediaElement.appendChild(_CreateElement(TAGNAMES.name, MEDIANAME, documentObj));
            
            for (var i=0; i<reports.length; i++ ) { 
                mediaElement.appendChild(_CreateReportElement(reports[i], documentObj));
            }
            
            return mediaElement;
        }
        
        
        function _CreateReportElement(reportObj, documentObj) {
            
            var columns = reportObj.columns;
            
            var reportElement = _CreateElement(TAGNAMES.table, null, documentObj);
            reportElement.appendChild(_CreateElement(TAGNAMES.url, reportObj.url, documentObj));
            reportElement.appendChild(_CreateElement(TAGNAMES.name, reportObj.name, documentObj));
            reportElement.appendChild(_CreateElement(TAGNAMES.description, reportObj.description, documentObj));
            reportElement.appendChild(_CreateElement(TAGNAMES.decimalsymbol, reportObj.decimalsymbol, documentObj));
            reportElement.appendChild(_CreateElement(TAGNAMES.digitgroupingsymbol, reportObj.digitgroupingsymbol, documentObj));
            
            var rangeElement = _CreateElement(TAGNAMES.range, null, documentObj);
            rangeElement.appendChild(_CreateElement(TAGNAMES.from, RANGEFROM, documentObj));
            reportElement.appendChild(rangeElement);
            
            var variableLengthElement =  _CreateElement(TAGNAMES.variablelength, null, documentObj);
            variableLengthElement.appendChild(_CreateElement(TAGNAMES.columndelimiter, reportObj.columndelimiter, documentObj));
            
            for (var i=0; i<columns.length; i++ ) { 
                variableLengthElement.appendChild(_CreateColumnElement(columns[i], documentObj));
            }
            
            if(reportObj.fkeyname){
                var foreignKeyElement = _CreateElement(TAGNAMES.foreignKey, null, documentObj);
                foreignKeyElement.appendChild(_CreateElement(TAGNAMES.name, reportObj.fkeyname, documentObj));
                foreignKeyElement.appendChild(_CreateElement(TAGNAMES.references, reportObj.reference, documentObj));
                variableLengthElement.appendChild(foreignKeyElement);
            }
            
            reportElement.appendChild(variableLengthElement);
            
            return reportElement;
        }
        
        
        function _GetFileName() {

            var filename = 'index.xml';
            return filename;
        }
        
        
        function _GetReports() {
            
            var reports = [];
            reports.push(new DE_GDPDU_CI_Report(_State, _Params, _Output, _Job).GetReportIndex());
            reports.push(new DE_GDPDU_AV_TXT_Report(_State, _Params, _Output, _Job).GetReportIndex());
            reports.push(new DE_GDPDU_COA_Report(_State, _Params, _Output, _Job).GetReportIndex());
            reports.push(new DE_GDPDU_GJ_TXT_Report(_State, _Params, _Output, _Job).GetReportIndex());
            reports.push(new DE_GDPDU_AR_TXT_Report(_State, _Params, _Output, _Job).GetReportIndex());
            reports.push(new DE_GDPDU_AP_TXT_Report(_State, _Params, _Output, _Job).GetReportIndex());
            reports.push(new DE_GDPDU_GL_TXT_Report(_State, _Params, _Output, _Job).GetReportIndex());
            reports.push(new DE_GDPDU_SAB_TXT_Report(_State, _Params, _Output, _Job).GetReportIndex());
            reports.push(new DE_GODB_RMD_TXT_Report(_State, _Params, _Output, _Job).GetReportIndex());
            reports.push(new DE_GODB_PMD_TXT_Report(_State, _Params, _Output, _Job).GetReportIndex());
            
            return reports;
        }
        
        
        function _ValidateCurrencies() {
            
            if (_IS_MULTICURRENCY && _IS_ONEWORLD && _Params.include_child_subs) {
                
                // Check if all subsidiaries use the same currency
                var invalidCurrencySubs = [];
                var descendants = _Subsidiary.GetDescendants();
                var currencyCode = _Subsidiary.GetCurrencyCode();
                for ( var i = 0; i < descendants.length; ++i) {
                    if (currencyCode != descendants[i].GetCurrencyCode()) {
                        invalidCurrencySubs.push(descendants[i].GetName());
                    }
                }
                
                if (invalidCurrencySubs.length > 0) {
                    
                    throw SuiteScript.nlapiCreateError('DE_AUDIT_Currency_Check', _ResMgr.GetString('ERR_CURRENCY_CHECK', {'subsidiaries': invalidCurrencySubs.join(', ')}), true);
                }
            }
        }
        
    } __ReportIndexFile.Name = 'ReportIndexFile';
}

DE_GDPDU_RI_Report.IsCRGReport = true;
DE_GDPDU_RI_Report.ReportId = 'DE_GDPDU_RI_XML';
