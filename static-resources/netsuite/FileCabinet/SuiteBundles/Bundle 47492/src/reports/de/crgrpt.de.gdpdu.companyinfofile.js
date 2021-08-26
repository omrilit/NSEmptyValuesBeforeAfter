/**
 * Copyright © 2014, 2018, Oracle and/or its affiliates. All rights reserved.
 */

function DE_GDPDU_CI_Report(state, params, output, job) {    
    
    var SuiteScript = function() { return this; } ();
    var _AUDIT_FILE_VERSION = 'gdpdu-01-08-2002';
    var _NCONTEXT = SFC.Context.GetContext();
    var _IS_ONEWORLD = SFC.Context.GetContext().getSetting('FEATURE', 'SUBSIDIARIES') === 'T';
    var _IS_MULTICURRENCY = _NCONTEXT.getFeature('MULTICURRENCY');
    var _IS_MULTIBOOK = _NCONTEXT.getFeature('MULTIBOOK');
    var _IS_FOREIGNCURRENCY = _NCONTEXT.getFeature('FOREIGNCURRENCYMANAGEMENT');
    
    var _Outline = { 'Section': __CompanyInfoFile };
    var _Job = job;                            
    var _Output = output;
    var _Params = params;
    var _State = state;    
    var _ReportObj = this;
    var _Subsidiary = _IS_ONEWORLD ? SFC.Subsidiaries.Load(_Params.subsidiary) : null;
    var _Company = SFC.Context.GetCompanyInfo();
    var _Accounting = SuiteScript.nlapiLoadConfiguration('accountingpreferences');
    var _TaxAccountingBasis = 'Invoice Basis';
    var _Period = { Start: SFC.PostingPeriods.Load(_Params.periodFrom),
                    End: SFC.PostingPeriods.Load(_Params.periodTo)};
    var FILENAME = 'company.txt';
    var DESCRIPTION = 'Firmeninformationen';
    var COLUMNS = {
            AUDIT_FILE_VERSION: {columnName: 'Audit_File_Version', columnDesc: 'Audit Dateiversion'},
            COMPANY_ID: {columnName: 'Company_ID', columnDesc: 'Unternehmens-ID'},
            COMPANY_NAME: {columnName: 'Company_Name', columnDesc: 'Firmenname'},
            STREET: {columnName: 'Street', columnDesc: 'Straße'},
            POSTAL_CODE: {columnName: 'Postal_Code', columnDesc: 'Postleitzahl'},
            REGION: {columnName: 'Region', columnDesc: 'Region'},
            COUNTRY: {columnName: 'Country', columnDesc: 'Land'},
            FINANCIAL_YEAR: {columnName: 'Financial_Year', columnDesc: 'Geschäftsjahr'},
            CURRENCY: {columnName: 'Currency', columnDesc: 'Währung'},
            TELEPHONE: {columnName: 'Telephone', columnDesc: 'Telefonnummer'},
            FAX: {columnName: 'Fax', columnDesc: 'Fax'},
            ACCOUNTING_BASIS: {columnName: 'Accounting_Basis', columnDesc: 'Rechnungslegung der Grundlage'}
    };
    this.GetOutline = __GetOutline;
    this.GetReportIndex = __GetReportIndex;
    
    
    function __GetReportIndex() {
        
        var columns = [];
        columns.push(new SFC.Utilities.ReportColumn(COLUMNS.AUDIT_FILE_VERSION, SFC.Utilities.Constants.ALPHANUMERIC));
        columns.push(new SFC.Utilities.ReportColumn(COLUMNS.COMPANY_ID, SFC.Utilities.Constants.ALPHANUMERIC));
        columns.push(new SFC.Utilities.ReportColumn(COLUMNS.COMPANY_NAME, SFC.Utilities.Constants.ALPHANUMERIC));
        columns.push(new SFC.Utilities.ReportColumn(COLUMNS.STREET, SFC.Utilities.Constants.ALPHANUMERIC));
        columns.push(new SFC.Utilities.ReportColumn(COLUMNS.POSTAL_CODE, SFC.Utilities.Constants.ALPHANUMERIC));
        columns.push(new SFC.Utilities.ReportColumn(COLUMNS.REGION, SFC.Utilities.Constants.ALPHANUMERIC));
        columns.push(new SFC.Utilities.ReportColumn(COLUMNS.COUNTRY, SFC.Utilities.Constants.ALPHANUMERIC));
        columns.push(new SFC.Utilities.ReportColumn(COLUMNS.FINANCIAL_YEAR, SFC.Utilities.Constants.ALPHANUMERIC));
        columns.push(new SFC.Utilities.ReportColumn(COLUMNS.CURRENCY, SFC.Utilities.Constants.ALPHANUMERIC));
        columns.push(new SFC.Utilities.ReportColumn(COLUMNS.TELEPHONE, SFC.Utilities.Constants.ALPHANUMERIC));
        columns.push(new SFC.Utilities.ReportColumn(COLUMNS.FAX, SFC.Utilities.Constants.ALPHANUMERIC));
        columns.push(new SFC.Utilities.ReportColumn(COLUMNS.ACCOUNTING_BASIS, SFC.Utilities.Constants.ALPHANUMERIC));
        
        var reportIndex = {};
        reportIndex.url = FILENAME;
        reportIndex.name = FILENAME;
        reportIndex.description = DESCRIPTION;
        reportIndex.decimalsymbol = SFC.Utilities.Constants.DECIMALSYMBOL;
        reportIndex.digitgroupingsymbol = SFC.Utilities.Constants.DIGITGROUPINGSYMBOL;
        reportIndex.columndelimiter = SFC.Utilities.Constants.COLUMNDELIMITER;
        reportIndex.columns = columns;
        
        return reportIndex;
    }
    
    
    function __GetOutline() { 
        
        return _Outline;
    };


    function __CompanyInfoFile() {
        
        this.On_Init = _OnInit;
        this.On_Header = _OnHeader;
        this.On_Body = _OnBody;
        this.On_CleanUp = _OnCleanUp;
        // for Unit Testing only
        this.___inspect = function(expr) { return eval('(' + expr + ')'); };
        var formatter = new TAF.DE.GDPDU.Formatter();
        
        function _OnInit() {
            
            _ValidateCurrencies();
            _Output.SetFileName(_GetFileName());
            
            if(_State[__CompanyInfoFile.Name] == undefined) {
                
                _State[__CompanyInfoFile.Name] = {
                    Index: -1
                };
            }
            
            _Output.SetPercent(10);            
        }
        
        
        function _OnHeader() {
            
            var headers = [COLUMNS.AUDIT_FILE_VERSION.columnName,
                           COLUMNS.COMPANY_ID.columnName,
                           COLUMNS.COMPANY_NAME.columnName,
                           COLUMNS.STREET.columnName,
                           COLUMNS.POSTAL_CODE.columnName,
                           COLUMNS.REGION.columnName,
                           COLUMNS.COUNTRY.columnName,
                           COLUMNS.FINANCIAL_YEAR.columnName,
                           COLUMNS.CURRENCY.columnName,
                           COLUMNS.TELEPHONE.columnName,
                           COLUMNS.FAX.columnName,
                           COLUMNS.ACCOUNTING_BASIS.columnName];
            
            _Output.WriteLine(headers.join('\t'));
            _Output.SetPercent(15);            
        }
        
        
        function _OnBody() {
            
            var globalIndex = null;
            
            do {
                
                globalIndex = _State[__CompanyInfoFile.Name].Index + 1;
                var sr =  _GetCompanyInfo();
                
                if (sr == null) {
                    return;
                }
                
                for (var i = 0; i < sr.length; ++i) {
                    var row = [];
                    row.push(sr[i].auditfileversion);
                    row.push(formatter.cleanString(sr[i].companyid));
                    row.push(formatter.cleanString(sr[i].companyname));
                    row.push(formatter.cleanString(sr[i].street));
                    row.push(formatter.cleanString(sr[i].postalcode));
                    row.push(formatter.cleanString(sr[i].region));
                    row.push(formatter.cleanString(sr[i].country));
                    row.push(sr[i].financialyear);
                    row.push(sr[i].currency);
                    row.push(formatter.cleanString(sr[i].telephone));
                    row.push(formatter.cleanString(sr[i].fax));
                    row.push(formatter.cleanString(sr[i].accountingbasis));
                    _Output.WriteLine(row.join('\t'));
                    
                    _State[__CompanyInfoFile.Name].Index = globalIndex + i;
                    
                    if(_Job.IsThresholdReached()) {
                        return;
                    }
                }
            } while(sr.length >= 1000);
            
            _Output.SetPercent(95);
        }
        
        
        function _OnCleanUp() {
            
            delete _State[__CompanyInfoFile.Name];
            _Output.SetPercent(100);
        }


        function _GetFileName() {

            var filename = FILENAME;
            return filename;
        }


        function _GetCompanyInfo() {
            
            var companyInfo = null;
            if(_IS_ONEWORLD) {
                
                companyInfo = {'auditfileversion' : _AUDIT_FILE_VERSION
                                , 'companyid' : _Subsidiary.GetVRN()
                                , 'companyname' : _Subsidiary.GetLegalName() == '' ? _Subsidiary.GetName() : _Subsidiary.GetLegalName()
                                    , 'street' : _Subsidiary.GetAddress1()
                                    , 'postalcode' : _Subsidiary.GetPostalCode()
                                    , 'region' : _Subsidiary.GetState()
                                    , 'country' : _Subsidiary.GetCountryName()
                                    , 'financialyear' : _GetFY(_Period.Start)
                                    , 'currency' : _IS_MULTIBOOK && _IS_FOREIGNCURRENCY ? _GetBookCurrency() : _Subsidiary.GetCurrencyCode()
                                    , 'telephone' : _Subsidiary.GetPhoneNumber()
                                    , 'fax' : _Subsidiary.GetFaxNumber()
                                    , 'accountingbasis' : _TaxAccountingBasis};
            } else {
                
                companyInfo = {'auditfileversion' : _AUDIT_FILE_VERSION
                                , 'companyid' : _Company.getFieldValue('taxid') == '' ? _Company.getFieldValue('employerid') : _Company.getFieldValue('taxid')
                                , 'companyname' : _Company.getFieldValue('legalname') == '' ? _Company.getFieldValue('companyname') : _Company.getFieldValue('legalname')
                                , 'street' : _Company.getFieldValue('address1')
                                , 'postalcode' : _Company.getFieldValue('zip')
                                , 'region' : _Company.getFieldValue('state')
                                , 'country' : _Company.getFieldText('country')
                                , 'financialyear' : _GetFY(_Period.Start)
                                , 'currency' : _IS_MULTICURRENCY ? _Company.getFieldText('basecurrency') : 'Euro'
                                , 'telephone' : _Company.getFieldValue('phone')
                                , 'fax' : _Company.getFieldValue('fax')
                                , 'accountingbasis' : _TaxAccountingBasis};
            }
            
            var companyInfoArray = [companyInfo];
            
            return companyInfoArray;
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
                    var _ResMgr = new ResourceMgr(_Params.job_params.CultureId);
                    throw SuiteScript.nlapiCreateError('DE_AUDIT_Currency_Check', _ResMgr.GetString('ERR_CURRENCY_CHECK', {'subsidiaries': invalidCurrencySubs.join(', ')}), true);
                }
            }
        }
        
        function _GetFY(period) {
            // Traverses up to the parent FY of the period 
            if (period.GetType() != 'year') {                
                return _GetFY(period.GetParent());
            }
            return period.GetName(); 
        }
        
        function _GetBookCurrency() {
            var book = new TAF.DAO.AccountingBookDao().search({
                internalId: _Params.bookId,
                subsidiary: _Params.subsidiary
            }).getList()[0];
            
            return book.currencyName;
        }
    
    } __CompanyInfoFile.Name = '__CompanyInfoFile';
}

DE_GDPDU_CI_Report.IsCRGReport = true;
DE_GDPDU_CI_Report.ReportId = 'DE_GDPDU_CI_TXT';
