/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

function PT_SAFT_Report_v2(state, params, output, job)
{
    var VAT_PT = VAT.PT;
    
    
    var PORTUGAL_COMPLIANCE_BUNDLE = "9c72dbe1-160f-4259-9884-1b1364947ef2";
    var UNKNOWN = "Desconhecido";
    var _NCONTEXT = SFC.Context.GetContext();
    var _NS_EDITION = SFC.Context.GetNetSuiteEdition();
    var _IS_PT_INSTALLED = SFC.Registry.IsInstalled(PORTUGAL_COMPLIANCE_BUNDLE);
    var _IS_ONEWORLD = SFC.Context.IsOneWorld();
    var _IS_MULTIBOOK = _NCONTEXT.getFeature('MULTIBOOK');
    var _IS_FOREIGNCURRENCYMANAGEMENT = _NCONTEXT.getFeature('FOREIGNCURRENCYMANAGEMENT');
    var _ACCOUNTING_PREFERENCES = nlapiLoadConfiguration('accountingpreferences');
    var _HAS_ACCOUNTING_NUMBERS = _ACCOUNTING_PREFERENCES.getFieldValue('ACCOUNTNUMBERS') == 'T';
    var _HAS_SERIALIZEDINVENTORY = _NCONTEXT.getFeature('SERIALIZEDINVENTORY');
    var _USES_ACCOUNTING_CONTEXT = params.accountingContext != '';
    var _IS_MULTISUB_CUSTOMER_ENABLED = _IS_ONEWORLD ? (_NCONTEXT.getSetting('FEATURE', 'multisubsidiarycustomer') == 'T') : false;
    var _CATEGORY_CODE = {
            ACCOUNT_GROUPING: 'PT_ACCOUNT_GROUPING',
            TAXONOMY_S: 'PT_TAXONOMY_CODE_S',
            TAXONOMY_M: 'PT_TAXONOMY_CODE_M'
    };
    
    var _Outline = {"Section": __AuditFile, "SubSections": [
        {"Section": __Header},
        {"Section": __MasterFiles, "SubSections": [
            {"Section": __GeneralLedger},
            {"Section": __Customers},
            {"Section": __Suppliers},
            {"Section": __Products},
            {"Section": __ShippingItems},
            {"Section": __TaxTable}
        ]},
        {"Section": __GeneralLedgerEntries},
        {"Section": __SourceDocuments, "SubSections": [
            {"Section": __SalesInvoices},
            {"Section": __MovementOfGoods},
            {"Section": __WorkingDocuments},
            {"Section": __Payments}
        ]}
    ]};
    
    
    var _State = state;
    var _Params = params;
    var _Output = output;
    var _Job = job;
    var _Period = { Start: null, End: null };
    var _CoveredPeriods = null;
    var _PeriodIds = null;
    var _Subsidiary = null;
    var _BookId = null;
    var _CommonFiltersCache = { Subsidiary: null, Period: null };
    var _IsUOMSupportedCache = undefined;
    var _IsBarcodingSupportedCache = undefined;
    var _JournalId = _NCONTEXT.getCompany();
    var _PT_TaxCode_Defs = null;  //lazy load
    var _XML = TAF.XML;
    var _SAFT = new __SAFT();
    var _ResMgr = new ResourceMgr(_Params.job_params.CultureId);
    var _TaxonomyReference = null;


    this.GetOutline = function _GetOutline() { return _Outline; };
    var _TaxAccountingBasis = this.taxAccountingBasis || 'I';
    
    
    
    
    
    (function _constructor()
    {
        _Output.SetEncoding("windows-1252");
        
        _Subsidiary = _IS_ONEWORLD ? new TAF.DAO.SubsidiaryDao().getList({internalid: ['is', _Params.subsidiary]})[_Params.subsidiary] : null;
        _Period.Start = SFC.PostingPeriods.Load(_Params.periodFrom);
        _Period.End = SFC.PostingPeriods.Load(_Params.periodTo);
        _CoveredPeriods = new TAF.DAO.AccountingPeriodDao().getCoveredPostingPeriods(_Period.Start.GetId(), _Period.End.GetId(), _Subsidiary ? _Subsidiary.getFiscalCalendar() : null);
        _PeriodIds = _CoveredPeriods.map(function(a) { return a.id; });

        if (_IS_MULTIBOOK) {
            var accountingBook = new TAF.DAO.AccountingBookDao().search({
                subsidiary: _Params.subsidiary,
                internalId: _Params.bookId
            }).getList()[0] || null;
            
            _BookId = accountingBook && !accountingBook.isPrimary ? _Params.bookId : null;
        }
    } ());
    
    
    
    
    
    function __AuditFile()
    {
        this.On_Init = _OnInit;
        this.On_Header = _OnHeader;
        this.On_Footer = _OnFooter;
        
        
        
        
        
        function _OnInit()
        {
            if (_NCONTEXT.getFeature('MULTIPLECALENDARS')) {
                _ValidateAccountingPeriods(_Params.periodTo, _Subsidiary.getFiscalCalendar());
            }
        }
        
        
        
        
        
        function _OnHeader()
        {
            _Output.WriteLine('<?xml version="1.0" encoding="Windows-1252"?>');
            _Output.WriteLine('<AuditFile xmlns="urn:OECD:StandardAuditFile-Tax:PT_1.04_01" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:OECD:StandardAuditFile-Tax:PT_1.04_01 SAF-T.xsd">');
        }





        function _OnFooter()
        {
            _Output.WriteLine("</AuditFile>");
            _Output.SetPercent(100);
        }
        
    }
    __AuditFile.Name = "AuditFile";
    this.AuditFile = __AuditFile;















    function __Header()
    {
        var _PRODUCT_VERSION = _NCONTEXT.getVersion();
        var _AUDIT_FILE_VERSION = "1.04_01";
	var _TAX_ENTITY;
         switch(_TaxAccountingBasis) {
  	case 'F':
        case 'C':
        case 'S':
        case 'P1':
    	   _TAX_ENTITY='Global';
    		break;
  	case 'P2':
        case 'I' :
  	default  :
           _TAX_ENTITY='Sede';
	}
        var _CustomPortugal = null;
        var _TaxonomyReferenceMap = null;
        
        this.On_Init = _OnInit;
        this.On_Body = _OnBody;
        this.Get_OneWorldCompanyId=_GetOneWorldCompanyId;




        function _OnInit()
        {
            _CustomPortugal = _GetCustomPortugal();
            _TaxonomyReferenceMap = _GetTaxonomyReferenceMap();
        }
        
        
        
        

        function _OnBody()
        {
            if(_IS_ONEWORLD)
            {
                _OneWorldHeader();
            }
            else
            {
                _SingleHeader();
            }
        }

        
        
        
        
        function _OneWorldHeader()
        {
            var SUBSIDIARY = SFC.Subsidiaries.Load(_Params.subsidiary);
            var companyId = (_CustomPortugal.CRO ? _CustomPortugal.CRO + " " : "") + (_CustomPortugal.CRN == null || _CustomPortugal.CRN == ""? SUBSIDIARY.GetVRN(): _CustomPortugal.CRN);
            var region = SUBSIDIARY.GetState();
            var currencyId = '';
            _TaxonomyReference = _TaxonomyReferenceMap[SUBSIDIARY.GetTaxonomyReference()];
            
            if (_IS_MULTIBOOK && _IS_FOREIGNCURRENCYMANAGEMENT) {
                currencyId = new TAF.DAO.AccountingBookDao().search({
                    internalId: _Params.bookId,
                    subsidiary: _Params.subsidiary
                }).getList()[0].currencyId;
            } else {
                currencyId = SUBSIDIARY.GetCurrencyId();
            }
            
            var currencyCode = (new TAF.DAO.CurrencyDao().getCurrencyMap()[currencyId] || {}).symbol;
   	    var _TaxRegistrationNumber=_GetOneWorldCompanyId(SUBSIDIARY);
          	if(_TaxRegistrationNumber!=null){
           	 _TaxRegistrationNumber = _TaxRegistrationNumber.replace(/[^A-Za-z0-9]/g, "");//Filtering special characters from _TaxRegistrationNumber
          	}
          
            	if(_TaxRegistrationNumber!=null && _TaxRegistrationNumber.substring(0, 2).toUpperCase() == 'PT'){//Checking "PT" if preceeded in _TaxRegistrationNumber
              	 _TaxRegistrationNumber = _TaxRegistrationNumber.substring(2);   //Removing "PT" preceeded in _TaxRegistrationNumber
            	}
            
            var xml = [
            '<Header>',
            '<AuditFileVersion>', _AUDIT_FILE_VERSION, '</AuditFileVersion>',
            '<CompanyID>', companyId, '</CompanyID>',
            '<TaxRegistrationNumber>', _TaxRegistrationNumber, '</TaxRegistrationNumber>',
            '<TaxAccountingBasis>', _TaxAccountingBasis, '</TaxAccountingBasis>',
            '<CompanyName>', _SAFT.STRING(SUBSIDIARY.GetLegalName(), 100), '</CompanyName>',
            '<CompanyAddress>',
                '<AddressDetail>' ,_SAFT.STRING(SUBSIDIARY.GetAddress1(), 210, UNKNOWN), '</AddressDetail>',
                '<City>', _SAFT.STRING(SUBSIDIARY.GetCity(), 50, UNKNOWN), '</City>',
                '<PostalCode>', _SAFT.STRING(SUBSIDIARY.GetPostalCode(), 20), '</PostalCode>',
                '<Region>', region==null || region==""? UNKNOWN: region, '</Region>',
                '<Country>', SUBSIDIARY.GetCountryCode(), '</Country>',
            '</CompanyAddress>',
            '<FiscalYear>', _Period.End.GetEndDate().toString("yyyy"), '</FiscalYear>',
            '<StartDate>', _SAFT.DATE(_Period.Start.GetStartDate()), '</StartDate>',
            '<EndDate>', _SAFT.DATE(_Period.End.GetEndDate()), '</EndDate>',
            '<CurrencyCode>', currencyCode || 'EUR', '</CurrencyCode>',
            '<DateCreated>', _SAFT.DATE(new Date()), '</DateCreated>',
            '<TaxEntity>', _SAFT.STRING(_TAX_ENTITY, 20), '</TaxEntity>',
            '<ProductCompanyTaxID>94-3310471</ProductCompanyTaxID>',
            '<SoftwareCertificateNumber>1691</SoftwareCertificateNumber>',
            '<ProductID>NetSuite OneWorld/NetSuite Inc</ProductID>',
            '<ProductVersion>', _PRODUCT_VERSION, '</ProductVersion>',
            '<Telephone>', _SAFT.STRING(SUBSIDIARY.GetPhoneNumber(), 30, UNKNOWN), '</Telephone>',
            '<Fax>', _SAFT.STRING(SUBSIDIARY.GetFaxNumber(), 20, UNKNOWN), '</Fax>',
            '<Email>', _SAFT.STRING(SUBSIDIARY.GetEmail(), 254, UNKNOWN), '</Email>',
            '<Website>', _SAFT.STRING(SUBSIDIARY.GetWebsite(), 60, UNKNOWN), '</Website>',
            '</Header>'].join('');
            
            _Output.Write(xml);
        }
        
        
        
        
        
        function _SingleHeader()
        {
            var COMPANY = SFC.Context.GetCompanyInfo();
            var taxId = "";
            var n = ["taxnumber", "taxid", "employerid"];
            for(var i = 0; i < n.length; ++i)
            {
                var tmp = COMPANY.getFieldValue(n[i]);
                if(tmp != null && tmp != "")
                {
                    taxId = tmp;
                    break;
                }
            }
            var _TaxRegistrationNumber = taxId;
            if(_TaxRegistrationNumber != null){
              _TaxRegistrationNumber = _TaxRegistrationNumber.replace(/[^A-Za-z0-9]/g, "");//Filtering special characters from _TaxRegistrationNumber
            }
        
              if(_TaxRegistrationNumber != null && _TaxRegistrationNumber.substring(0, 2).toUpperCase() == 'PT'){//Checking "PT" if preceeded in _TaxRegistrationNumber
                 _TaxRegistrationNumber = _TaxRegistrationNumber.substring(2);   //Removing "PT" preceeded in _TaxRegistrationNumber
              }
            
            _TaxonomyReference = _TaxonomyReferenceMap[COMPANY.getFieldValue("custrecord_pt_sub_taxonomy_reference")];
            
            var companyId = (_CustomPortugal.CRO ? _CustomPortugal.CRO + " " : "") + (_CustomPortugal.CRN == null || _CustomPortugal.CRN == ""? taxId: _CustomPortugal.CRN);
            var region = COMPANY.getFieldValue("state");
            
            var xml = [ 
                '<Header>',
                '<AuditFileVersion>', _AUDIT_FILE_VERSION, '</AuditFileVersion>',
                '<CompanyID>', companyId, '</CompanyID>',
                '<TaxRegistrationNumber>', _TaxRegistrationNumber, '</TaxRegistrationNumber>',
                '<TaxAccountingBasis>', _TaxAccountingBasis, '</TaxAccountingBasis>',
                '<CompanyName>', _SAFT.STRING(COMPANY.getFieldValue("legalname"), 100), '</CompanyName>',
                '<CompanyAddress>',
                    '<AddressDetail>', _SAFT.STRING(COMPANY.getFieldValue("addresstext"), 210, UNKNOWN), '</AddressDetail>',
                    '<City>', _SAFT.STRING(COMPANY.getFieldValue("city"), 50, UNKNOWN), '</City>',
                    '<PostalCode>', _SAFT.STRING(COMPANY.getFieldValue("zip"), 20), '</PostalCode>',
                    '<Region>', region==null || region==""? UNKNOWN: region, '</Region>',
                    '<Country>', COMPANY.getFieldValue("country"), '</Country>',
                '</CompanyAddress>',
                '<FiscalYear>', _Period.End.GetEndDate().toString("yyyy"), '</FiscalYear>',
                '<StartDate>', _SAFT.DATE(_Period.Start.GetStartDate()), '</StartDate>',
                '<EndDate>', _SAFT.DATE(_Period.End.GetEndDate()), '</EndDate>',
                '<CurrencyCode>EUR</CurrencyCode>',
                '<DateCreated>', _SAFT.DATE(new Date()), '</DateCreated>',
                '<TaxEntity>', _SAFT.STRING(_TAX_ENTITY, 20), '</TaxEntity>',
                '<ProductCompanyTaxID>94-3310471</ProductCompanyTaxID>',
                '<SoftwareCertificateNumber>1690</SoftwareCertificateNumber>',
                '<ProductID>NetSuite International/NetSuite Inc</ProductID>',
                '<ProductVersion>', _PRODUCT_VERSION, '</ProductVersion>',
                '<Telephone>', _SAFT.STRING(COMPANY.getFieldValue("phone"), 30, UNKNOWN), '</Telephone>',
                '<Fax>', _SAFT.STRING(COMPANY.getFieldValue("fax"), 20, UNKNOWN), '</Fax>',
                '<Email>', _SAFT.STRING(COMPANY.getFieldValue("email"), 254, UNKNOWN), '</Email>',
                '<Website>', _SAFT.STRING(COMPANY.getFieldValue("url"), 60, UNKNOWN), '</Website>',
                '</Header>'].join('');
            
            
            _Output.Write(xml);
        }
        
        
        
        
        
        function _GetOneWorldCompanyId(SUBSIDIARY)
        {
            if(_NS_EDITION == "AU")
            {
                return SUBSIDIARY.GetFieldValue("state1taxnumber");
            }
                
            if(_NS_EDITION == "CA" || _NS_EDITION == "UK" || _NS_EDITION == "XX")
            {
                return SUBSIDIARY.GetFieldValue("federalidnumber");
            }
                
            if(_NS_EDITION == "US")
            {
                var cid = SUBSIDIARY.GetFieldValue("federalidnumber");
                
                return cid == null || cid == ""? SUBSIDIARY.GetFieldValue("ssnortin"): cid;
            }
            
            return "";
        }
        
        
        
        
        
        function _GetCustomPortugal()
        {
            var customPT = {CRO: "", CRN: ""};
            
            var filters = [
                new nlobjSearchFilter("isinactive", null, "is", "F"),
                new nlobjSearchFilter("custrecord_compliance_pt_name", null, "is", "CommercialRegistryOffice")
            ];
            
            var columns = [
                new nlobjSearchColumn("custrecord_compliance_pt_value")
            ];
            
            try
            {
                var sr = nlapiSearchRecord("customrecord_portugal", null, filters, columns);
                if(sr != null)
                {
                    customPT.CRO = sr[0].getValue("custrecord_compliance_pt_value");
                }
            }
            catch(e)
            { }
            
            
            
            filters = [
                new nlobjSearchFilter("isinactive", null, "is", "F"),
                new nlobjSearchFilter("custrecord_compliance_pt_name", null, "is", "CommercialRegistrationNumber")
            ];
            
            columns = [
                new nlobjSearchColumn("custrecord_compliance_pt_value")
            ];
            
            try
            {
                
                var sr = nlapiSearchRecord("customrecord_portugal", null, filters, columns);
                if(sr != null)
                {
                    customPT.CRN = sr[0].getValue("custrecord_compliance_pt_value");
                }
            }
            catch(e)
            { }
                
            return customPT;
        }
        
        
        
        
        
        function _GetTaxonomyReferenceMap()
        {
            if(_TaxonomyReferenceMap) {
                return _TaxonomyReferenceMap;
            }
            
            var taxonomyReferenceMap = {};
            var sr = nlapiSearchRecord("customrecord_pt_taxonomy_reference", null, null, new nlobjSearchColumn("custrecord_pt_taxonomy_ref_value"));
            
            for(var i = 0; sr && i < sr.length; i++) {
                taxonomyReferenceMap[sr[i].id] = sr[i].getValue("custrecord_pt_taxonomy_ref_value");
            }
            
            return taxonomyReferenceMap;
        }
        
    }
    __Header.Name = "Header";
    this.Header = __Header;














    function __MasterFiles()
    {
        this.On_Header = _OnHeader;
        this.On_Footer = _OnFooter;
        
        
        
        
        
        function _OnHeader()
        {
            _Output.WriteLine("<MasterFiles>");
        }





        function _OnFooter()
        {
            _Output.WriteLine("</MasterFiles>");
        }
        
    }
    __MasterFiles.Name = "MasterFiles";
    this.MasterFiles = __MasterFiles;















    function __GeneralLedger() {
        var _TrialBalance =  {};
        var _Accounts = null;
        var _GroupingCategoryMap = null;
        var _TaxonomyCodeMap = null;
        var _Adapter = null;
        var _filters = {};
        
        this.On_Init = _OnInit;
        this.On_Body = _OnBody;
        this.On_CleanUp = _OnCleanUp;
		this.Get_GroupingCode=_GetGroupingCode;
        this.Get_CategoryMap=_GetCategoryMap;
       
        function _OnInit() {            
            if(_State[__GeneralLedger.Name] == undefined) {
                _State[__GeneralLedger.Name] = { 
					Index: 0,
					TaxonomyReference: _TaxonomyReference
				};
            } else {
				_TaxonomyReference = _State[__GeneralLedger.Name].TaxonomyReference;
			  }
            _filters = {
                type: ['noneof', ['NonPosting']]
            };
            
            if (_IS_ONEWORLD) {
                _filters['subsidiary'] = ['is', _Params.subsidiary];
                _filters['accountingcontext'] = ['is', _Params.accountingContext];
            }
			
            var transaction_params = {
                periodIds: _PeriodIds,
                bookId : _Params.bookId
            }
            _Accounts = new TAF.DAO.AccountDao().getList(_filters, !_BookId, transaction_params);
            _GroupingCategoryMap = _GetCategoryMap(_CATEGORY_CODE.ACCOUNT_GROUPING);
            _Adapter = new TAF.PT.Adapter.GeneralLedgerAdapter();
            
            switch(_TaxonomyReference) {
                case 'M':
                    _TaxonomyCodeMap = _GetCategoryMap(_CATEGORY_CODE.TAXONOMY_M);
                    break;
                case 'N':
                case 'S':
                    _TaxonomyCodeMap = _GetCategoryMap(_CATEGORY_CODE.TAXONOMY_S);
                    break;
                default:
            }
            
            new TAF.DAO.EnhancedTrialBalanceDAO().getList({
                periodFrom: _Params.periodFrom,
                periodTo: _Params.periodTo,
                subsidiary: _Params.subsidiary,
                group: _Params.include_child_subs,
                bookId: _Params.bookId
            }).forEach(function(a) {
                this[a.internalId] = a;
            }, _TrialBalance);
        }

        /*Funtion Name : _GetGroupingCode
          Returns 	   :  Grounping Code (AcconutID of the parent record)
         */
 	    function _GetGroupingCode(parentAccount) {   

                var  groupingCode = '';
                    if(_USES_ACCOUNTING_CONTEXT) {
                        groupingCode = parentAccount.getLocalizedNumber() || parentAccount.getAccountNumber();
                    } 
                    else {
                        groupingCode = parentAccount.getSCOANumber() || parentAccount.getAccountNumber();
                    }
          
                return groupingCode;          
        }

        function _OnBody() {
            var index = _State[__GeneralLedger.Name].Index;
            var accountIds = Object.keys(_Accounts);
            var account = null;
            var accountId = null;
            var balances = null;
            var accountName = null;
            var accountNumber = null;
	        if(_State[__GeneralLedger.Name].Index == 0){
				_Output.WriteLine('<GeneralLedgerAccounts>');
				if(_TaxonomyReference){
					_Output.WriteLine('<TaxonomyReference>' + _SAFT.STRING(_TaxonomyReference, 1) + '</TaxonomyReference>');
				}
			}
            
            for (var i = index; i < accountIds.length; i++) {
                var  isGroupingCodeTagRequired = false;
                var groupingCode = ''; 
                var accountRecord = null;
                accountId = accountIds[i];
                account = _Accounts[accountId];
                balances = _Adapter.getBalances(_TrialBalance[accountId] || {});
                
                if(_USES_ACCOUNTING_CONTEXT){
                    accountName = account.getLocalizedName() || account.getAccountName();
                    accountNumber = account.getLocalizedNumber() || account.getAccountNumber();
                } else {
                    accountName = account.getSCOAName() || account.getAccountName();
                    accountNumber = account.getSCOANumber() || account.getAccountNumber();
                }
                
                var groupingCategory = _SAFT.STRING((_GroupingCategoryMap[account.getAccountId()] && _GroupingCategoryMap[account.getAccountId()].value_text) || '');
                var taxonomyCode = '';
                                
                if(_TaxonomyReference && groupingCategory === 'GM') {
                    taxonomyCode = _TaxonomyReference === 'O' ? 1 : _SAFT.STRING((_TaxonomyCodeMap[accountId] && _TaxonomyCodeMap[accountId].value_text) || '');
                }

	    	    if(groupingCategory==='GA'||groupingCategory==='AA'||groupingCategory==='GM'||groupingCategory==='AM') {
                    isGroupingCodeTagRequired = true;
                    if(_GroupingCategoryMap[account.getAccountId()].grouping_code) {
                        groupingCode = _GroupingCategoryMap[account.getAccountId()].grouping_code;
                    } else {
                    try {
                        accountRecord = nlapiLoadRecord('account', accountId);
                    } catch (ex) {
                        nlapiLogExecution('ERROR', 'TAF.PT.SAFT_V2.nlapiLoadRecord_Failed', ex.toString());
                    }

                    if(!accountRecord) {
                        continue;
                    }
               
                    var hasParent = accountRecord.getFieldValue('hasparent');
                  
                    if(hasParent=='T'){
                        var  parentAccountId = accountRecord.getFieldValue('parent');
                        var  parentAccount = _Accounts[parentAccountId];

                        if(parentAccount == null || parentAccount == 'undefined') {
                            groupingCode = accountNumber;
                        } else {
                            groupingCode = _GetGroupingCode(parentAccount);
                        }                             
                    } 
                    else{
                        groupingCode=accountNumber;
                    }                  
                    }  
                  }
                
                _Output.WriteLine([
                    '<Account>',
                        '<AccountID>', _SAFT.STRING(accountNumber, 30, ''), '</AccountID>',
                        '<AccountDescription>', _SAFT.STRING(accountName, 100), '</AccountDescription>',
                        '<OpeningDebitBalance>', _SAFT.AMOUNT(balances.openingDebit), '</OpeningDebitBalance>',
                        '<OpeningCreditBalance>', _SAFT.AMOUNT(balances.openingCredit), '</OpeningCreditBalance>',
                        '<ClosingDebitBalance>', _SAFT.AMOUNT(balances.closingDebit), '</ClosingDebitBalance>',
                        '<ClosingCreditBalance>', _SAFT.AMOUNT(balances.closingCredit), '</ClosingCreditBalance>',
                        '<GroupingCategory>', groupingCategory, '</GroupingCategory>',
                        isGroupingCodeTagRequired ?('<GroupingCode>' + groupingCode + '</GroupingCode>'):'',
                        taxonomyCode ? ('<TaxonomyCode>' + taxonomyCode + '</TaxonomyCode>') : '',
                    '</Account>'].join(''));
                
                _State[__GeneralLedger.Name].Index++;
                
                if (_Job.IsThresholdReached()) {
                    return;
                }
            }
            
            _Output.WriteLine('</GeneralLedgerAccounts>');
        }
        
        function _OnCleanUp() {
            delete _State[__GeneralLedger.Name];
        }
        
        function _GetCategoryMap(category_code) {
            var mapping = {};
            var mapping_category = new TAF.DAO.MappingCategoryDao().getByCode(category_code);
            mapping = new TAF.DAO.MappingDao().getList({'custrecord_mapper_keyvalue_category': ['anyof', mapping_category.id]}, _filters);                      
            return mapping;
        }
    }
    __GeneralLedger.Name = "GeneralLedger";
    this.GeneralLedger = __GeneralLedger;
    
    
    
    










    function __Customers()
    {
        var _ResultSet =  null;
        
        this.On_Init = _OnInit;
        this.On_Body = _OnBody;
        this.On_CleanUp = _OnCleanUp;
        var joinRec = _IS_MULTISUB_CUSTOMER_ENABLED ? 'customer' : null;
        
        
        
        
        
        function _OnInit()
        {
            if(_State[__Customers.Name] == undefined)
            {
                _State[__Customers.Name] = { Index: -1 };
            }

            _ResultSet = _GetSearch().runSearch();
        }
        
        
        
        
        
        function _OnBody()
        {
            var globalIndex = null;
            var periodIds = _PeriodIds;
            do
            {
                globalIndex = _State[__Customers.Name].Index + 1;
                var sr = _ResultSet.getResults(globalIndex, globalIndex + 1000);
                if(sr == null)
                {
                    return;
                }
                    
                for(var i = 0; i < sr.length; ++i)
                {
                    var filters = [
                        new nlobjSearchFilter("internalid", joinRec, "is", sr[i].getValue("internalid", joinRec)),
                        new nlobjSearchFilter('posting', null, 'is', 'T'),
                        new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', periodIds)
                    ];
                    var transactionSearch = nlapiCreateSearch('transaction', filters, null);
                    var resultSet = transactionSearch.runSearch().getResults(0, 100);
                    if(resultSet.length > 0){
                        _ForEachCustomer(sr[i]);
                    }
                    _State[__Customers.Name].Index = globalIndex + i;
                    
                    if(_Job.IsThresholdReached())
                    {
                        return;
                    }
                }
                
            } while(sr.length >= 1000);
        }
        
        
        
        
        
        function _OnCleanUp()
        {
            delete _State[__Customers.Name];
        }
        
        
        
        
        
        function _GetSearch()
        {
            var filters = [
                new nlobjSearchFilter("stage", joinRec, "is", "CUSTOMER")
            ];
            
            var searchRec = _IS_MULTISUB_CUSTOMER_ENABLED ? 'customersubsidiaryrelationship' : 'customer';
            
            if(_IS_ONEWORLD)
            {
                filters.push(_GetSubsidiarySearchFilter());
            }
            
            var columns = [
                new nlobjSearchColumn("internalid", joinRec),
                new nlobjSearchColumn("entitynumber", joinRec),
                new nlobjSearchColumn("entityid", joinRec),
                new nlobjSearchColumn("stage", joinRec),
                new nlobjSearchColumn("accountnumber", joinRec),
                new nlobjSearchColumn("billaddress", joinRec),
                new nlobjSearchColumn("billcity", joinRec),
                new nlobjSearchColumn("billzipcode", joinRec),
                new nlobjSearchColumn("billstate", joinRec),
                new nlobjSearchColumn("billcountry", joinRec),
                new nlobjSearchColumn("receivablesaccount", joinRec),
                new nlobjSearchColumn("companyname", joinRec)
				];
            
            if(_NS_EDITION != "CA")  //not Canada?
            {
                columns.push(new nlobjSearchColumn("vatregnumber", joinRec))
            }

            return nlapiCreateSearch(searchRec, filters, columns);
        }
        
        
        
        
        
        function _ForEachCustomer(row)
        {
            var vatRegNumber = row.getValue("vatregnumber", joinRec);
            if(_NS_EDITION == "CA")
            {
                var custRec = nlapiLoadRecord("customer", row.getValue("internalid", joinRec));
                vatRegNumber = custRec.getFieldValue("vatregnumber");
            }
            
            vatRegNumber = vatRegNumber == null? "": vatRegNumber.replace(/[^\d.]/g, "");
            var region = row.getValue("billstate", joinRec);
            var accountNo = _GetCustomer_AR_AccountNumber(row);
            
            var xml = [
            '<Customer>',
                '<CustomerID>', row.getValue("internalid", joinRec), '</CustomerID>',
                '<AccountID>', _SAFT.STRING(accountNo, 30, UNKNOWN), '</AccountID>',
                '<CustomerTaxID>', _SAFT.STRING(vatRegNumber, 30, UNKNOWN), '</CustomerTaxID>',
                '<CompanyName>', _SAFT.STRING(row.getValue("companyname", joinRec), 100), '</CompanyName>',
                '<BillingAddress>',
                    '<AddressDetail>', _SAFT.STRING(row.getValue("billaddress", joinRec), 210, UNKNOWN), '</AddressDetail>',
                    '<City>', _SAFT.STRING(row.getValue("billcity", joinRec), 50, UNKNOWN), '</City>',
                    '<PostalCode>', _SAFT.STRING(row.getValue("billzipcode", joinRec), 20, UNKNOWN), '</PostalCode>',
                    '<Region>', region==null || region==""? UNKNOWN: region, '</Region>',
                    '<Country>', _SAFT.STRING(row.getValue("billcountry", joinRec), 2, UNKNOWN), '</Country>',
                '</BillingAddress>',
                '<SelfBillingIndicator>0</SelfBillingIndicator>',
            '</Customer>'].join('');
            
            _Output.WriteLine(xml);
        }
        
        
        
        
        
        function _GetCustomer_AR_AccountNumber(row)
        {
            var accountId = row.getValue("receivablesaccount", joinRec);
            //2013.06.26 - Core defect "receivablesaccount" returns account name instead of account id.
            //nlapiLogExecution("DEBUG", "accountId", "[" + accountId + "]");
            
            //if(accountId == null || accountId == "")  //null?
            //{
            //    accountId = _GetSystem_AR_AccountId();
            //    if(accountId == null || accountId == "")  //Still null?
            //    {
            //        return null;
            //    }
            //}
            //return nlapiLookupField("account", accountId, "number");
            
            var filters = [ new nlobjSearchFilter("name", null, "is", accountId) ];
            var columns = [];
            
            if (_HAS_ACCOUNTING_NUMBERS) {
                columns.push(new nlobjSearchColumn("number"));
            }
            
            var sr = nlapiSearchRecord("account", null, filters, columns);
            
            if( sr != null && _HAS_ACCOUNTING_NUMBERS) {
                return sr[0].getValue("number");
            }
            
            var systemAccountId = _GetSystem_AR_AccountId();
            if(systemAccountId == null || systemAccountId == "")  //Still null?
            {
                return null;
            }
            
            if (_HAS_ACCOUNTING_NUMBERS) {
                return nlapiLookupField("account", systemAccountId, "number");
            }
            
            return null;
        }
        
        
        
        
        
        function _GetSystem_AR_AccountId()
        {
            if(_GetSystem_AR_AccountId.Cache === undefined)  //Notice the exact equality ===
            {
                _GetSystem_AR_AccountId.Cache = null;  //null is not (exact) equal to undefined
                
                var systemAccountId = _NCONTEXT.getPreference("araccount");
                if(systemAccountId != null && systemAccountId != "")
                {
                     _GetSystem_AR_AccountId.Cache = systemAccountId;
                }
            }
            
            return _GetSystem_AR_AccountId.Cache;
        }
        _GetSystem_AR_AccountId.Cache = undefined;
        
    }
    __Customers.Name = "Customers";
    this.Customers = __Customers;














    function __Suppliers()
    {
        var _ResultSet =  null;
        
        this.On_Init = _OnInit;
        this.On_Body = _OnBody;
        this.On_CleanUp = _OnCleanUp;

    var joinRec = _IS_ONEWORLD ? 'vendor' : null;



        function _OnInit()
        {
            if(_State[__Suppliers.Name] == undefined)
            {
                _State[__Suppliers.Name] = { Index: -1 };
            }

            _ResultSet = _GetSearch().runSearch();
        }
        
        
        
        
        
        function _OnBody()
        {
            var globalIndex = null;
            var periodIds = _PeriodIds;
            do
            {
                globalIndex = _State[__Suppliers.Name].Index + 1;
                var sr = _ResultSet.getResults(globalIndex, globalIndex + 1000);
                if(sr == null)
                {
                    return;
                }
                
                for(var i = 0; i < sr.length; ++i)
                {
                    var filters = [
                        new nlobjSearchFilter("internalid", joinRec, "is", sr[i].getValue("internalid", joinRec)),
                        new nlobjSearchFilter('posting', null, 'is', 'T'),
                        new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', periodIds)

                    ];
                    var transactionSearch = nlapiCreateSearch('transaction', filters, null);
                    var resultSet = transactionSearch.runSearch().getResults(0, 100);

                    if(resultSet.length > 0){
                        _ForEachSupplier(sr[i]);
                    }
                    
                    _State[__Suppliers.Name].Index = globalIndex + i;
                    
                    if(_Job.IsThresholdReached())
                    {
                        return;
                    }
                }
            } while(sr.length >= 1000);
        }
        
        
        
        
        
        function _OnCleanUp()
        {
            delete _State[__Suppliers.Name];
        }
        
        
        
        
        
        function _GetSearch()
        {
            var filters = [];
            
            
            var searchRec = _IS_ONEWORLD ? 'vendorsubsidiaryrelationship' : 'vendor';
            
            if(_IS_ONEWORLD)
            {
            
                filters.push(_GetSubsidiarySearchFilter());
            }
            
            var columns = [
                new nlobjSearchColumn("internalid", joinRec),
                new nlobjSearchColumn("entitynumber", joinRec),
                new nlobjSearchColumn("entityid", joinRec),
                new nlobjSearchColumn("billaddress", joinRec),
                new nlobjSearchColumn("billcity", joinRec),
                new nlobjSearchColumn("billzipcode", joinRec),
                new nlobjSearchColumn("billstate", joinRec),
                new nlobjSearchColumn("billcountry", joinRec),
                new nlobjSearchColumn("companyname", joinRec),
                new nlobjSearchColumn("accountnumber", joinRec),
                new nlobjSearchColumn("vatregnumber", joinRec),
                new nlobjSearchColumn("expenseaccount", joinRec)
            ];
            
            if(_NS_EDITION == "CA")
            {
                columns.push(new nlobjSearchColumn("taxidnum", joinRec));
            }
            
            if(_IS_ONEWORLD)
            {
                columns.push(new nlobjSearchColumn("subsidiary"));
            }
            
            return nlapiCreateSearch(searchRec, filters, columns);
        }
        
        
        
        
        
        function _ForEachSupplier(row)
        {
            var vendorTaxId = _GetVendorTaxId(row);
            vendorTaxId = vendorTaxId == null? "": vendorTaxId.replace(/[^\d.]/g, "");
            var region = row.getValue("billstate", joinRec);
            region = region==null || region==""? UNKNOWN: region;
            var accountNumber = _GetVendorAccountNumber(row);
            
            var xml = [
            '<Supplier>',
                '<SupplierID>', _SAFT.STRING(row.getValue("internalid", joinRec), 30), '</SupplierID>',
                '<AccountID>', _SAFT.STRING(accountNumber, 30, UNKNOWN), '</AccountID>',
                '<SupplierTaxID>', _SAFT.STRING(vendorTaxId, 30, UNKNOWN), '</SupplierTaxID>',
                '<CompanyName>', _SAFT.STRING(row.getValue("entityid", joinRec), 100, UNKNOWN), '</CompanyName>',
                '<BillingAddress>',
                    '<AddressDetail>', _SAFT.STRING(row.getValue("billaddress", joinRec), 210, UNKNOWN), '</AddressDetail>',
                    '<City>', _SAFT.STRING(row.getValue("billcity", joinRec), 50, UNKNOWN), '</City>',
                    '<PostalCode>', _SAFT.STRING(row.getValue("billzipcode", joinRec), 20, UNKNOWN), '</PostalCode>',
                    '<Region>', _SAFT.STRING(region, 50, UNKNOWN), '</Region>',
                    '<Country>', _SAFT.STRING(_GetVendorCountry(row), 25, UNKNOWN), '</Country>',
                '</BillingAddress>',
                '<SelfBillingIndicator>0</SelfBillingIndicator>',
            '</Supplier>'].join('');
            
            _Output.WriteLine(xml);
        }
        
        
        
        
        
        function _GetVendorCountry(row)
        {
            var countryCode = row.getValue("billcountry", joinRec);
            if (countryCode == null || countryCode == "")
            {
                if(_IS_ONEWORLD)
                {
                    var subId = row.getValue("subsidiary");
                    var objSub = SFC.Subsidiaries.Load(subId);
                    countryCode = objSub.GetCountryCode();
                }
                else
                {
                    //Single instance will not install Mexico bundle unless it is Mexican
                    countryCode = "PT";  //Portugal by default
                }
            }
            
            return countryCode;
        }
        
        
        
        
        
        function _GetVendorTaxId(row)
        {
            if(_NS_EDITION == "CA")
            {
                if(_IS_ONEWORLD)
                {
                    var subs = SFC.Subsidiaries.LoadAll();
                    var subId = row.getValue("subsidiary");
                    var subCountry = subs[subId].GetCountryCode();

                    if(subCountry != "CA")
                    {
                        return row.getValue("vatregnumber", joinRec);
                    }
                }

                return row.getValue("taxidnum", joinRec);
            }

            return row.getValue("vatregnumber", joinRec);
        }
        
        
        
        
        
        function _GetVendorAccountNumber(row)
        {
            var accountId = row.getValue("expenseaccount", joinRec);
            if(accountId == null || accountId == "")  //null?
            {
                accountId = _GetSystemExpenseAccountId();
            }
            
            if(accountId == null || accountId == "")  //Still null?
            {
                return null;
            }
            
            if (_HAS_ACCOUNTING_NUMBERS) {
                return nlapiLookupField("account", accountId, "number");
            }
            
            return null;
        }
        
        
        
        
        
        function _GetSystemExpenseAccountId()
        {
            if(_GetSystemExpenseAccountId.Cache === undefined)  //Notice the exact equality ===
            {
                _GetSystemExpenseAccountId.Cache = null;  //null is not (exact) equal to undefined
                
                var systemAccountId = _NCONTEXT.getPreference("expenseaccount");
                if(systemAccountId != null && systemAccountId != "")
                {
                     _GetSystemExpenseAccountId.Cache = systemAccountId;
                }
            }
            
            return _GetSystemExpenseAccountId.Cache;
        }
        _GetSystemExpenseAccountId.Cache = undefined;
        
    }  // __Suppliers
    __Suppliers.Name = "Suppliers";
    this.Suppliers = __Suppliers;














    function __Products()
    {
        var _ResultSet =  null;
        
        this.On_Init = _OnInit;
        this.On_Body = _OnBody;
        this.On_CleanUp = _OnCleanUp;
        
        
        
        
        
        function _OnInit()
        {
            if(_State[__Products.Name] == undefined)
            {
                _State[__Products.Name] = { Index: -1 };
            }

            _ResultSet = _GetSearch().runSearch();
        }
        
        
        
        
        
        function _OnBody()
        {
            var globalIndex = null;
            do
            {
                globalIndex = _State[__Products.Name].Index + 1;
                var sr = _ResultSet.getResults(globalIndex, globalIndex + 1000);
                if(sr == null)
                {
                    return;
                }
                
                for(var i = 0; i < sr.length; ++i)
                {
                    _ForEachProduct(sr[i]);
                    
                    _State[__Products.Name].Index = globalIndex + i;
                    
                    if(_Job.IsThresholdReached())
                    {
                        return;
                    }
                }
            } while(sr.length >= 1000);
        }
        
        
        
        
        
        function _OnCleanUp()
        {
            delete _State[__Products.Name];
        }
        
        
        
        
        
        function _GetSearch()
        {
            var filters = [];
            
            if(_IS_ONEWORLD)
            {
                filters.push(_GetSubsidiarySearchFilter());
            }
            
            var columns = [
                new nlobjSearchColumn("internalid", null, "group"),
                new nlobjSearchColumn("itemid", null, "group"),
                new nlobjSearchColumn("displayname", null, "group"),
                new nlobjSearchColumn("type", null, "group"),
                new nlobjSearchColumn("custitem_commodity_code", null, "group"),
                new nlobjSearchColumn("custitem_un_number", null, "group")
            ];
            
            if(_IsBarcodingSupported())
            {
                columns.push(new nlobjSearchColumn("upccode", null, "group"));
            }

            return nlapiCreateSearch("item", filters, columns);
        }
        
        
        
        
        
        function _ForEachProduct(row)
        {
            var productType = _GetProductType(row.getValue("type", null, "group"));
            var upcCode = _IsBarcodingSupported()? row.getValue("upccode", null, "group"): null;
            var productCode = row.getValue("internalid", null, "group") + " - " + row.getValue("itemid", null, "group");
            var productNumberCode = (upcCode == null || upcCode == "" || upcCode == '- None -') ? productCode : upcCode;
            var productDescription = row.getValue("displayname", null, "group") == '- None -' ? '' : row.getValue("displayname", null, "group");
            var commodityCode = row.getValue("custitem_commodity_code", null, "group") == '- None -' ? '' : row.getValue("custitem_commodity_code", null, "group");
            var unNumber = row.getValue("custitem_un_number", null, "group") == '- None -' ? '' : row.getValue("custitem_un_number", null, "group");
            
            var cnCodeTag = commodityCode ? '<CNCode>' + _SAFT.STRING(commodityCode,8) + '</CNCode>' : '' ;
            var unNumberTag = unNumber ? '<UNNumber>' + _SAFT.STRING(unNumber,4) + '</UNNumber>' : '' ;
            var customsTag = [
                '<CustomsDetails>',
                    cnCodeTag,
                    unNumberTag,
                '</CustomsDetails>'].join('');
            
            var xml = [
            '<Product>',
                '<ProductType>', productType, '</ProductType>',
                '<ProductCode>', _SAFT.STRING(productCode, 60), '</ProductCode>',
                '<ProductDescription>', _SAFT.STRING(productDescription, 200, UNKNOWN), '</ProductDescription>',
                '<ProductNumberCode>', _SAFT.STRING(productNumberCode, 60), '</ProductNumberCode>',
                cnCodeTag || unNumberTag ? customsTag : '',
            '</Product>'].join('');
            
            _Output.WriteLine(xml);
        }
        
        
        
        
        
        function _GetProductType(nsType)
        {
            var sType = nsType.toLowerCase();
            var TYPES = {
                "service": "S",
                "invtpart": "P", 
                "noninvtpart": "P",
                "assembly": "P",
                "group": "P",
                "kit": "P"
            };
            
            return TYPES[sType] === undefined? "O": TYPES[sType];  //subtotal, payment, othcharge, markup, discount, description
        }
    }
    __Products.Name = "Products";
    this.Products = __Products;
    


    
    
    
    
    function __ShippingItems() {
        var _ResultSet =  null;
        
        this.On_Init = _OnInit;
        this.On_Body = _OnBody;
        this.On_CleanUp = _OnCleanUp;
        
        
        
        
        
        function _OnInit() {
            if(_State[__ShippingItems.Name] == undefined) {
                _State[__ShippingItems.Name] = { Index: -1 };
            }

            _ResultSet = _GetSearch().runSearch();
        }
        
        
        
        
        
        function _OnBody() {
            var globalIndex = null;
            
            do {
                globalIndex = _State[__ShippingItems.Name].Index + 1;
                var sr = _ResultSet.getResults(globalIndex, globalIndex + 1000);
                
                if(sr == null) {
                    return;
                }
                
                for (var i = 0; i < sr.length; ++i) {
                    _ForEachItem(sr[i]);
                    
                    _State[__ShippingItems.Name].Index = globalIndex + i;
                    
                    if(_Job.IsThresholdReached()) {
                        return;
                    }
                }
            } while(sr.length >= 1000);
        }
        
        
        
        
        
        function _OnCleanUp() {
            delete _State[__ShippingItems.Name];
        }
        
        
        
        
        
        function _GetSearch() {
            var filters = [
                new nlobjSearchFilter('type', 'item', 'is', 'ShipItem'),
                new nlobjSearchFilter("type", null, "anyof", ["CustInvc", "CustCred", "CashSale", "CashRfnd"]),
                new nlobjSearchFilter("accounttype", null, "anyof", ["Income", "OthIncome"]),
                _GetPeriodSearchFilter()
            ];
            
            if(_IS_ONEWORLD) {
                filters.push(_GetSubsidiarySearchFilter());
            }
            
            var columns = [
                new nlobjSearchColumn('internalid', 'item', 'group').setSort(),
                new nlobjSearchColumn('itemid', 'item', 'group'),
                new nlobjSearchColumn('displayname', 'item', 'group'),
                new nlobjSearchColumn('custitem_commodity_code', 'item', 'group'),
                new nlobjSearchColumn('custitem_un_number', 'item', 'group')
            ];
            
            return nlapiCreateSearch("transaction", filters, columns);
        }
        
        
        
        
        
        function _ForEachItem(row) {
            var productType = 'O';
            var productCode = row.getValue('internalid', 'item', 'group') + ' - ' + row.getValue('itemid', 'item', 'group');
            var productNumberCode = productCode;
            var productDescription = row.getValue('displayname', 'item', 'group');
            var commodityCode = row.getValue('custitem_commodity_code', null, 'group') == '- None -' ? '' : row.getValue('custitem_commodity_code', null, 'group');
            var unNumber = row.getValue('custitem_un_number', null, 'group') == '- None -' ? '' : row.getValue('custitem_un_number', null, 'group');
            
            var cnCodeTag = commodityCode ? '<CNCode>' + _SAFT.STRING(commodityCode,8) + '</CNCode>' : '' ;
            var unNumberTag = unNumber ? '<UNNumber>' + _SAFT.STRING(unNumber,4) + '</UNNumber>' : '' ;
            var customsTag = [
                '<CustomsDetails>',
                    cnCodeTag,
                    unNumberTag,
                '</CustomsDetails>'].join('');
            
            var xml = [ 
            '<Product>',
                '<ProductType>', productType, '</ProductType>',
                '<ProductCode>', _SAFT.STRING(productCode, 60), '</ProductCode>',
                '<ProductDescription>', _SAFT.STRING(productDescription, 200, UNKNOWN), '</ProductDescription>',
                '<ProductNumberCode>', _SAFT.STRING(productNumberCode, 60), '</ProductNumberCode>',
                cnCodeTag || unNumberTag ? customsTag : '',
            '</Product>'].join('');
            
            _Output.WriteLine(xml);
        }
    }
    __ShippingItems.Name = "ShippingItems";
    this.ShippingItems = __ShippingItems;










    function __TaxTable()
    {
        this.On_Init = _OnInit;
        this.On_Header = _OnHeader;
        this.On_Body = _OnBody;
        this.On_Footer = _OnFooter;
        this.On_CleanUp = _OnCleanUp;
        
        
        
        
        
        function _OnInit()
        {
            if(_State[__TaxTable.Name] == undefined)
            {
                _State[__TaxTable.Name] = { Index: 0, TaxCodes: {} };
            }
        }
        
        
        
        

        function _OnHeader()
        {
            _Output.WriteLine("<TaxTable>");
        }





        function _OnBody()
        {
            var nlTaxCodeIds = _RetrieveTaxCodeIds("PT");
            if(nlTaxCodeIds == null)
            {
                return;
            }
            
            var ptTaxCodes = {};
            
            for(var i = _State[__TaxTable.Name].Index; i < nlTaxCodeIds.length; ++i)
            {
                var taxCodeObj = SFC.TaxCodes.Load(nlTaxCodeIds[i].getId());
                var saftTaxCode = _GetSAFTTaxCode(taxCodeObj);

                //Map tax codes into SAFT recognised tax codes - NOR, RED, INT, ISE and OUT
                if(_State[__TaxTable.Name].TaxCodes[saftTaxCode] == undefined)
                {
                    _State[__TaxTable.Name].TaxCodes[saftTaxCode] = {
                        Description: taxCodeObj.GetName(),
                        Percentage: taxCodeObj.GetRate()
                    }
                }
                else
                {
                    _State[__TaxTable.Name].TaxCodes[saftTaxCode].Description += (", " + taxCodeObj.GetName());
                }
                
                _State[__TaxTable.Name].Index = i;
                
                if(_Job.IsThresholdReached())
                {
                    return;
                }
            }

            
            for(var j in _State[__TaxTable.Name].TaxCodes)
            {
                var xmlTaxCode = [ 
                '<TaxTableEntry>',
                    '<TaxType>IVA</TaxType>',
                    '<TaxCountryRegion>PT</TaxCountryRegion>',
                    '<TaxCode>', j, '</TaxCode>',
                    '<Description>', _State[__TaxTable.Name].TaxCodes[j].Description, '</Description>',
                    '<TaxPercentage>', _State[__TaxTable.Name].TaxCodes[j].Percentage.toFixed(2), '</TaxPercentage>',
                '</TaxTableEntry>'].join('');
                
                _Output.WriteLine(xmlTaxCode);
            }
        }





        function _OnFooter()
        {
            _Output.WriteLine("</TaxTable>");
        }
        
        
        
        
        
        function _OnCleanUp()
        {
            delete _State[__TaxTable.Name];
        }
        
        
        
        
        
        function _RetrieveTaxCodeIds(countryCode)
        {
            if(!SFC.Context.IsAdvancedTax() && countryCode != SFC.Context.Company.GetCountryCode())
            {
                return null;
            }
            
            var filters = [
                new nlobjSearchFilter("isinactive", null, "is", "F")  //Exclude inactive
            ];
            
            if(SFC.Context.IsAdvancedTax())
            {
                filters.push(new nlobjSearchFilter("country", null, "is", countryCode));
            }
                
            return nlapiSearchRecord("salestaxitem", null, filters, null);
        }
        
    }
    __TaxTable.Name = "TaxTable";
    this.TaxTable = __TaxTable;















    function __GeneralLedgerEntries() {
        var _FirstFiscalMonth = 0;
        var _LineDao = null;
        var _Adapter = null;
        var _Formatter = null;
        
        this.On_Init = _OnInit;
        this.On_Header = _OnHeader;
        this.On_Body = _OnBody;
        this.On_Footer = _OnFooter;
        this.On_CleanUp = _OnCleanUp;
        
        function _OnInit() {
            if(_State[__GeneralLedgerEntries.Name] == undefined) {
                _State[__GeneralLedgerEntries.Name] = {
                    Index: 0,
                    LineIndex: -1,
                    IsComplete: true,
                    IsInitiated : false
                };
            }
            
            //Init first fiscal month (0=january)
            var months = { JAN:0, FEB:1, MAR:2, APR:3, MAY:4, JUN:5, JUL:6, AUG:7, SEP:8, OCT:9, NOV:10, DEC:11 };
            var sFM = SFC.Context.GetCompanyInfo().getFieldValue('fiscalmonth');
            _FirstFiscalMonth = months[sFM];
            var filter = _IS_ONEWORLD ? {subsidiary: ['is', _Params.subsidiary]} : {};
            filter.accountingcontext = ['is', _Params.accountingContext];
            
            _LineDao = new TAF.PT.DAO.GeneralLedgerEntryLinesDAO({context: _NCONTEXT, isPTInstalled: _IS_PT_INSTALLED});
            _Formatter = new TAF.PT.Formatter.SAFT.GeneralLedgerEntriesFormatter();
            _Adapter = new TAF.PT.Adapter.GeneralLedgerEntriesAdapter({
                fiscalMonth: _FirstFiscalMonth,
                periods: arrayToHashMap(_CoveredPeriods, 'id'),
                accounts: new TAF.AccountDao().getList(filter, !_BookId),
                context: _NCONTEXT,
                usesAccountingContext: _USES_ACCOUNTING_CONTEXT
            });
        }
        
        function _OnHeader() {
            var summary = new TAF.PT.DAO.GeneralLedgerEntriesSummaryDAO({context: _NCONTEXT}).search({
                subsidiary: _Params.subsidiary,
                period: _PeriodIds,
                bookId: _BookId
            }).getList()[0];
            
            _Output.WriteLine(_Formatter.formatSummary(_Adapter.getSummary(summary)));
        }
        
        function _OnBody() {
            var globalIndex = null;
            var dao = new TAF.PT.DAO.GeneralLedgerEntriesDAO({context: _NCONTEXT}).search({
                subsidiary: _Params.subsidiary,
                period: _PeriodIds,
                bookId: _Params.bookId // pass the bookId even if primary to exclude book-specific JEs
            });
            
            do {
               if(_State[__GeneralLedgerEntries.Name].IsInitiated == false){
                   _State[__GeneralLedgerEntries.Name].IsInitiated = true;
                   globalIndex = 0;
               }
              else{
                   globalIndex = _State[__GeneralLedgerEntries.Name].IsComplete ? _State[__GeneralLedgerEntries.Name].Index + 1 : _State[__GeneralLedgerEntries.Name].Index;
              }
              var transactions = dao.getList(globalIndex);
    
                for (var i = 0; i < transactions.length; ++i) {
                    _ForEachEntry(transactions[i].id);
                    if (_State[__GeneralLedgerEntries.Name].IsComplete){
                        _State[__GeneralLedgerEntries.Name].Index++;
                    }
                    if (_Job.IsThresholdReached()) {
                        return;
                    }
                }
            } while (dao.hasMoreRows);
        }
        
        function _OnFooter() {
            _Output.WriteLine(_Formatter.formatFooter());
        }
        
        function _OnCleanUp() {
            delete _State[__GeneralLedgerEntries.Name];
        }
        
        function _ForEachEntry(id) {
            var sr = null;
            var row = null;
            
            _LineDao.search({
                internalId: id,
                bookId: _BookId
            });
            
            do {
                sr = _LineDao.getList(_State[__GeneralLedgerEntries.Name].LineIndex + 1);
                
                for (var i = 0; i < sr.length; ++i) {
                    row = sr[i];
                    if(row.stage == "JOB")
                    {
                        var projRec =  nlapiLoadRecord("job",row.customerId);
                      	var parent =  projRec.getFieldValue('parent');
                        if(parent) {
                           row.customerId = parent;
                        }						
                    }                 
                    if (_State[__GeneralLedgerEntries.Name].IsComplete) {
                        _State[__GeneralLedgerEntries.Name].IsComplete = false;
                        var transactionHeader = _Adapter.getTransactionHeader(row);
                        _Output.WriteLine(_Formatter.formatTransactionHeader(transactionHeader));
                        
                        if (transactionHeader.entityId) {
                        	_Output.WriteLine(_Formatter.formatTransactionHeaderEntityTag(transactionHeader));
                        }
                        
                        _Output.WriteLine(_Formatter.formatJournalLineHeader());
                    }
                    
                    _Output.WriteLine(_Formatter.formatTransactionLine(_Adapter.getTransactionLine(row)));
                    _State[__GeneralLedgerEntries.Name].LineIndex += 1;
                    
                    if (_Job.IsThresholdReached()) {
                        return;
                    }
                }
            } while (_LineDao.hasMoreRows)
            
            if (!_State[__GeneralLedgerEntries.Name].IsComplete) {
                _Output.WriteLine(_Formatter.formatJournalLineFooter());
                _Output.WriteLine(_Formatter.formatTransactionFooter());
                _State[__GeneralLedgerEntries.Name].LineIndex = -1;
                _State[__GeneralLedgerEntries.Name].IsComplete = true;
            }
        }
        
        function arrayToHashMap(array, key) {
            var hashMap = {};
            
            for (var i = 0; i < array.length; i++) {
                hashMap[array[i][key]] = array[i];
            }
            
            return hashMap;
        }
    }
    __GeneralLedgerEntries.Name = "GeneralLedgerEntries";
    this.GeneralLedgerEntries = __GeneralLedgerEntries;














    function __SourceDocuments()
    {
        this.On_Header = _OnHeader;
        this.On_Footer = _OnFooter;
        
        
        
        
        
        function _OnHeader()
        {
            _Output.WriteLine("<SourceDocuments>");
        }





        function _OnFooter()
        {
            _Output.WriteLine("</SourceDocuments>");
        }

    }
    __SourceDocuments.Name = "SourceDocuments";
    this.SourceDocuments = __SourceDocuments;














    function __SalesInvoices() {
        this.On_Init = _OnInit;
        this.On_Header = _OnHeader;
        this.On_Body = _OnBody;
        this.On_Footer = _OnFooter;
        this.On_CleanUp = _OnCleanUp;
        
        var _Dao = null;
        var _Adapter = null;
        var _Formatter = null;
        var _TAX_EXEMPT_OTHERS_CODE = "M99";
        var _TaxExemptionReasonOthers = _GetTaxExemptionReasonOthers();
        
        function _OnInit() {
            if (_State[__SalesInvoices.Name] == undefined) {
                _State[__SalesInvoices.Name] = {
                    Index: -1,
                    TranId: null
                };
            }

            _Dao = _IS_PT_INSTALLED ? new TAF.PT.DAO.SalesInvoicesWithPtDAO({context: _NCONTEXT}) : new TAF.PT.DAO.SalesInvoicesDAO({context: _NCONTEXT});
            _Adapter = new TAF.PT.Adapter.SalesInvoicesAdapter({context: _NCONTEXT});
            _Formatter = new TAF.PT.Formatter.SAFT.SalesInvoicesFormatter();
        }
        
        function _OnHeader() {
            var summary = new TAF.PT.DAO.SalesInvoicesSummaryDAO({context: _NCONTEXT}).search({
                subsidiary: _Params.subsidiary,
                period: _PeriodIds,
                bookId: _BookId
            }).getList()[0];
            
            _Output.WriteLine(_Formatter.formatSummary(_Adapter.getSummary(summary)));
        }
        
        function _OnBody() {
            var globalIndex = null;
            var dao = _Dao.search({
                subsidiary: _Params.subsidiary,
                period: _PeriodIds,
                bookId: _BookId
            });
            
            do {
                globalIndex = _State[__SalesInvoices.Name].Index + 1;
                var sr = dao.getList(globalIndex);
                
                for (var i = 0; i < sr.length; ++i) {
                    _ForEachSalesInvoice(sr[i]);
                    
                    _State[__SalesInvoices.Name].Index = globalIndex + i;
                    
                    if (_State[__SalesInvoices.Name].TranId != sr[i].internalId) {
                        _State[__SalesInvoices.Name].TranGrossAmount = Math.abs(sr[i].transactionTotal);
                        _State[__SalesInvoices.Name].TranTaxAmount = Math.abs(sr[i].taxTotal);
                    }
                    
                    _State[__SalesInvoices.Name].TranId = sr[i].internalId;
                    
                    if (_Job.IsThresholdReached()) {
                        return;
                    }
                }
            } while(dao.hasMoreRows);
        }
        
        function _OnFooter() {
            if (_State[__SalesInvoices.Name].TranId != null) {
                _CloseInvoiceElement();
            }
            
            _Output.WriteLine(_Formatter.formatFooter());
        }
        
        function _OnCleanUp() {
            delete _State[__SalesInvoices.Name];
        }
        
        function _GetPTTransactionId(row) {
            return _IS_PT_INSTALLED ? row.ptTranId : '';
        }
        
        function _GetPTSignature(row) {
            return _IS_PT_INSTALLED ? (row.ptTranSignature ?  row.ptTranSignature : 0) : 0;
        }
        
        function _GetPTEntryDate(row) {
            return _IS_PT_INSTALLED ? row.ptTranEntryDate : '';
        }
        
        function _ForEachSalesInvoice(row) {
            if (_State[__SalesInvoices.Name].TranId != row.internalId) {
                if (_State[__SalesInvoices.Name].TranId != null) {
                    _CloseInvoiceElement();
                }
                
                var invoiceStatus = (row.transactionTotal == 0) ? 'A' : 'N';
                
                var invoicedeets = [
                '<Invoice>',
                    '<InvoiceNo>', _SAFT.STRING(_GetPTTransactionId(row), 60), '</InvoiceNo>',
                    '<ATCUD>0</ATCUD>',
                    '<DocumentStatus>',
                        '<InvoiceStatus>', invoiceStatus, '</InvoiceStatus>',
                        '<InvoiceStatusDate>', _GetPTEntryDate(row), '</InvoiceStatusDate>',
                        '<SourceID>', _SAFT.STRING(row.createdBy, 30), '</SourceID>',
                        '<SourceBilling>P</SourceBilling>',
                    '</DocumentStatus>',
                    '<Hash>', _GetPTSignature(row), '</Hash>',
                    '<HashControl>2</HashControl>',
                    '<InvoiceDate>', _SAFT.DATE(nlapiStringToDate(row.tranDate)), '</InvoiceDate>',
                    '<InvoiceType>', _GetSAFTInvoiceType(row.type), '</InvoiceType>',
                    '<SpecialRegimes>',
                        '<SelfBillingIndicator>0</SelfBillingIndicator>',
                        '<CashVATSchemeIndicator>0</CashVATSchemeIndicator>',
                        '<ThirdPartiesBillingIndicator>0</ThirdPartiesBillingIndicator>',
                    '</SpecialRegimes>',
                    '<SourceID>', _SAFT.STRING(row.createdBy, 30), '</SourceID>',
                    '<SystemEntryDate>', _GetPTEntryDate(row), '</SystemEntryDate>',
                    '<TransactionID>', _DeriveTransactionID(row), '</TransactionID>',
                    '<CustomerID>', _SAFT.STRING(row.customerId, 30), '</CustomerID>'].join('');
                
                _Output.WriteLine(invoicedeets);
            }
            
            var quantity = row.quantity;
            if(quantity == null || quantity <= 0)
            {
                quantity = 1;
            }
            
            var xml = [ 
            '<Line>',
                '<LineNumber>', row.lineId, '</LineNumber>',
                '<ProductCode>', _SAFT.STRING(row.itemInternalId + " - " + row.itemName, 60), '</ProductCode>',
                '<ProductDescription>', _SAFT.STRING(row.displayName, 200, UNKNOWN), '</ProductDescription>',
                '<Quantity>', quantity, '</Quantity>',
                '<UnitOfMeasure>', _SAFT.STRING(_GetUnitOfMeasure(row), 20), '</UnitOfMeasure>',
                '<UnitPrice>', _SAFT.ACTUALAMOUNT(Math.abs(row.rate)), '</UnitPrice>',
//                '<TaxBase>', _SAFT.AMOUNT(Math.abs(row.netAmount)), '</TaxBase>', -- excluded pending clarification
                '<TaxPointDate>', _SAFT.DATE(nlapiStringToDate(row.tranDate)), '</TaxPointDate>'];
                
            xml.push('<Description>', _SAFT.STRING(row.memo, 200, UNKNOWN), '</Description>');
            
            if(row.itemSerialNumbers) {
                var serialNumberTag = ['<ProductSerialNumber>'];
                var serialNumbers = row.itemSerialNumbers.split('\n');
                
                for(var i = 0; i < serialNumbers.length; i++){
                    serialNumberTag.push('<SerialNumber>' + _SAFT.STRING(serialNumbers[i], 100) + '</SerialNumber>');
                }
                
                serialNumberTag.push('</ProductSerialNumber>');
                xml.push(serialNumberTag.join(''));
            }
            
            var is_cr_dr_present = false;
            
            var dr = row.debit;
            if(dr != null && dr > 0)
            {
                xml.push('<DebitAmount>',_SAFT.AMOUNT(dr),'</DebitAmount>');
                is_cr_dr_present = true;
            }
            
            var cr = row.credit;
            if(cr != null && cr > 0)
            {
                xml.push('<CreditAmount>',_SAFT.AMOUNT(cr),'</CreditAmount>');
                is_cr_dr_present = true;
            }
            
            if (!is_cr_dr_present) {
                xml.push('<CreditAmount>',_SAFT.AMOUNT(0),'</CreditAmount>');
            }

            var taxCodeValue = row.taxCode;
            if(taxCodeValue == null || taxCodeValue == "")
            {
                xml.push('<Tax>',
                    '<TaxType>IVA</TaxType>',
                    '<TaxCountryRegion>PT</TaxCountryRegion>',
                    '<TaxCode>OUT</TaxCode>',
                    '<TaxPercentage>0</TaxPercentage>',
                '</Tax>');

                xml.push('<TaxExemptionReason>' + _TaxExemptionReasonOthers + '</TaxExemptionReason>');
                xml.push('<TaxExemptionCode>' + _TAX_EXEMPT_OTHERS_CODE + '</TaxExemptionCode>');
            }
            else
            {
                var taxCodeObj = SFC.TaxCodes.Load(row.taxCode);
                
                xml.push('<Tax>',
                    '<TaxType>IVA</TaxType>',
                    '<TaxCountryRegion>PT</TaxCountryRegion>',
                    '<TaxCode>', _GetSAFTTaxCode(taxCodeObj), '</TaxCode>',
                    '<TaxPercentage>',taxCodeObj.GetRate(), '</TaxPercentage>',
                '</Tax>');

                var exemptionReason = taxCodeObj.GetExemptionReason();
                if(taxCodeObj.GetRate() <= 0 && taxCodeObj.GetExemptionReason())
                {
                    xml.push('<TaxExemptionReason>' + exemptionReason.substring(6) + '</TaxExemptionReason>');
                    xml.push('<TaxExemptionCode>' + exemptionReason.substring(0,3) + '</TaxExemptionCode>');
                } else if(taxCodeObj.GetRate() <= 0) {
                    xml.push('<TaxExemptionReason>' + _TaxExemptionReasonOthers + '</TaxExemptionReason>');
                    xml.push('<TaxExemptionCode>' + _TAX_EXEMPT_OTHERS_CODE + '</TaxExemptionCode>');
                }
            }
            
            xml.push('</Line>');
            _Output.WriteLine(xml.join(''));
        }
        
        function _GetUnitOfMeasure(row) {
            var DEFAULT_UNIT = "unit";
            
            if (_IsUOMSupported()) {
                var ut = row.unit;
                return ut == null || ut == ""? DEFAULT_UNIT: ut;
            }
            
            return DEFAULT_UNIT;
        }
        
        function _CloseInvoiceElement() {
            var state = _State[__SalesInvoices.Name];
            
            var xml = [
            '<DocumentTotals>',
                '<TaxPayable>', _SAFT.AMOUNT(state.TranTaxAmount), '</TaxPayable>',
                '<NetTotal>', _SAFT.AMOUNT((state.TranGrossAmount) - (state.TranTaxAmount)), '</NetTotal>',
                '<GrossTotal>', _SAFT.AMOUNT(state.TranGrossAmount), '</GrossTotal>',
            '</DocumentTotals>'].join('');
            
            _Output.WriteLine(xml);
            _Output.WriteLine('</Invoice>');
        }
        
        function _GetTaxExemptionReasonOthers() {
            if(_TaxExemptionReasonOthers) {
                return _TaxExemptionReasonOthers;
            }
            
            var column = new nlobjSearchColumn("name");
            
            var sr = nlapiSearchRecord("customlist_tax_exemption_code", null, null, column);
            sr = sr.sort();
            var exemptionReason = "";
            
            if(sr) {
                var str = sr[sr.length-1].getValue("name");
                exemptionReason = str.substring(6);
            }
            
            return exemptionReason;
        }
    }
    __SalesInvoices.Name = "SalesInvoices";
    this.SalesInvoices = __SalesInvoices;
    
    
    
    
    function __MovementOfGoods() {
        this.On_Init = _OnInit;
        this.On_Header = _OnHeader;
        this.On_Body = _OnBody;
        this.On_Footer = _OnFooter;
        this.On_CleanUp = _OnCleanUp;
        
        function _OnInit() {
            if(_State[__MovementOfGoods.Name] == undefined)
            {
                _State[__MovementOfGoods.Name] = {
                    Index: -1,
                    TranId: null,
                    DocumentTotals: {
                        TaxPayable: 0,
                        NetTotal: 0,
                        GrossTotal: 0
                    }
                };
            }
        }
        
        
        function _OnHeader() {
            var txnParams = {
                subIds: _Params.subsidiary,
                periodIds: _PeriodIds
            };

            var summaryInformation = new TAF.PT.DAO.ItemFulfillmentSummaryDao().getSummary(txnParams);          
            var movementOfGoodsAdapter = new TAF.PT.MovementOfGoodsAdapter();
            var stockMovementLine = movementOfGoodsAdapter.getStockMovementLine({summaryInfo: summaryInformation, ptDefaultValue: UNKNOWN});                                
            var movementOfGoodsFormatter = new TAF.PT.MovementOfGoodsFormatter(_SAFT);
            
            _Output.WriteLine("<MovementOfGoods>");
            _Output.WriteLine(movementOfGoodsFormatter.formatSummary(stockMovementLine));
        }
        
        
        function _OnBody() {
            var itemFulfillmentLineDao = new TAF.PT.DAO.ItemFulfillmentLineDao({context: _NCONTEXT});
            itemFulfillmentLineDao.search({
                subsidiary: _Params.subsidiary,
                period: _PeriodIds,
                bookId: _BookId
            });
            
            try {
                var globalIndex = -1;
                var movementOfGoodsAdapter = new TAF.PT.MovementOfGoodsAdapter({context: _NCONTEXT});
                var movementOfGoodsFormatter = new TAF.PT.MovementOfGoodsFormatter(_SAFT);
                
                do {
                    globalIndex = ++_State[__MovementOfGoods.Name].Index;
                    var itemFulfillmentList = itemFulfillmentLineDao.getList(globalIndex);
                    _ProcessTransactionList(itemFulfillmentList, movementOfGoodsAdapter, movementOfGoodsFormatter);
                    
                    if (_Job.IsThresholdReached()) {
                        return;
                    }                
                } while (itemFulfillmentLineDao.hasMoreRows);
            } catch(e) {
                nlapiLogExecution('ERROR', 'PT_SAFT_Report Error', e.message);
                throw e;
            }
        }
        
        
        function _OnFooter() {

            if(_State[__MovementOfGoods.Name].TranId != null) {
            
                var adapter = new TAF.PT.MovementOfGoodsAdapter();
                _CloseStockMovement({adapter: adapter});
            }
            _Output.WriteLine("</MovementOfGoods>");
        }
        
        
        function _OnCleanUp() {
            
            delete _State[__MovementOfGoods.Name];
        }
        
        
        function _ProcessTransactionList(pItemFulfillmentList, pMovementOfGoodsAdapter, pMovementOfGoodsFormatter) {
            var params = {
                adapter: pMovementOfGoodsAdapter,
                formatter: pMovementOfGoodsFormatter
            };
            
            var iterator = new TAF.Lib.Iterator(pItemFulfillmentList);
            while (iterator.hasNext()){
                var itemFulfillmentLine = iterator.next();
                _ProcessItemFulfillmentLine(itemFulfillmentLine, params);
                _State[__MovementOfGoods.Name].Index++;
                _State[__MovementOfGoods.Name].TranId = itemFulfillmentLine.id;
                
                if (_Job.IsThresholdReached()) {
                    return;
                }    
            }
            
        }
        
        
        function _ProcessItemFulfillmentLine(itemFulfillmentLine, params) {
            var addressDao = new TAF.PT.DAO.AddressDao();
            var certificationDao = new TAF.PT.DAO.CertificationDao();
            var adapterParams = {
                itemFulfillmentLineDao: itemFulfillmentLine,
                addressDao: addressDao,
                certificationDao: certificationDao,
                ptDefaultValue: UNKNOWN,
                subId: _IS_ONEWORLD ? _Params.subsidiary : ''
            };
            
            if (_State[__MovementOfGoods.Name].TranId != itemFulfillmentLine.id) {
                if (_State[__MovementOfGoods.Name].TranId != null) {
                    _CloseStockMovement(params);
                }

                var adapterResult = params.adapter.getStockMovementLine(adapterParams);
                _Output.WriteLine(params.formatter.formatHeader(adapterResult));
            } 

            adapterParams.documentTotals = _State[__MovementOfGoods.Name].DocumentTotals;
            
            var adapterResult = params.adapter.getStockMovementLine(adapterParams);
            _Output.WriteLine(params.formatter.formatLine(adapterResult));
            _State[__MovementOfGoods.Name].DocumentTotals = params.adapter.state;
        }
        
        
        function _CloseStockMovement(params) {
            var adapter = params.adapter;
            var adapterResult = adapter.getStockMovementLine({documentTotals: _State[__MovementOfGoods.Name].DocumentTotals, ptDefaultValue: UNKNOWN});
            var formatter = new TAF.PT.MovementOfGoodsFormatter(_SAFT);
            _Output.WriteLine(formatter.formatFooter(adapterResult));
            
            adapter.state = {
                    TaxPayable: 0,
                    NetTotal: 0,
                    GrossTotal: 0
            }
            
            _State[__MovementOfGoods.Name].DocumentTotals = adapter.state;
        }
    }
    __MovementOfGoods.Name = 'MovementOfGoods';
    this.MovementOfGoods = __MovementOfGoods;
    
    
    
    function __WorkingDocuments() {
        this.On_Init = _OnInit;
        this.On_Header = _OnHeader;
        this.On_Body = _OnBody;
        this.On_Footer = _OnFooter;
        this.On_CleanUp = _OnCleanUp;
        
        var adapter = null;
        var formatter = null;
        
        
        function _OnInit() {
            if(!_State[__WorkingDocuments.Name]) {
                _State[__WorkingDocuments.Name] = {
                    Index: -1,
                    TranId: null,
                    AdapterState: {id: -1, taxPayable: 0, netTotal: 0, grossTotal: 0}
                };
            }
            
            adapter = new TAF.PT.WorkingDocuments.NodeAdapter(_State[__WorkingDocuments.Name].AdapterState);
            formatter = new TAF.PT.WorkingDocuments.XmlFormatter(_SAFT);
        }
        
        
        function _OnHeader() {
            var dao = new TAF.PT.DAO.SalesOrderSummaryDao({context: _NCONTEXT});
            var tranCount = dao.search({
                subsidiary: _Params.subsidiary,
                startDate: _Period.Start.GetStartDate(),
                endDate: _Period.Start.GetEndDate(),
                bookId: _BookId
            }).getList()[0].tranCount;
            
            var tranTotals = dao.search({
                subsidiary: _Params.subsidiary,
                startDate: _Period.Start.GetStartDate(),
                endDate: _Period.Start.GetEndDate(),
                bookId: _BookId,
                status: true
            }).getList()[0];
            
            var summary = adapter.getSummary({
                tranCount: tranCount,
                debitTotal: tranTotals.debitTotal,
                creditTotal: tranTotals.creditTotal
            });
            
            _Output.WriteLine('<WorkingDocuments>');
            _Output.WriteLine(formatter.formatSummary(summary));
        }
        
        
        function _OnBody() {
            try {
                var globalIndex = -1;
                
                var dao = new TAF.PT.DAO.SalesOrderDao({context: _NCONTEXT, isPTInstalled: _IS_PT_INSTALLED}).search({
                    subsidiary: _Params.subsidiary,
                    startDate: _Period.Start.GetStartDate(),
                    endDate: _Period.Start.GetEndDate(),
                    bookId: _BookId
                });
                
                do {
                    globalIndex = ++_State[__WorkingDocuments.Name].Index;
                    var list = dao.getList(globalIndex);
                    if (!list) {
                        return;
                    }

                    _ProcessTransactionList({list: list});

                    if (_Job.IsThresholdReached()) {
                        return;
                    }
                } while (dao.hasMoreRows);
                
            } catch(e) {
                nlapiLogExecution('ERROR', 'PT_SAFT_Report Error', e.message);
                throw e;
            }
        }
        
        
        function _OnFooter() {
            if(_State[__WorkingDocuments.Name].TranId != null) {
                var documentTotals = adapter.getWorkDocument();
                _CloseWorkDocument({documentTotals: documentTotals});
            }
            _Output.WriteLine('</WorkingDocuments>');
        }
        
        
        function _OnCleanUp() {
            delete _State[__WorkingDocuments.Name];
        }
        
        
        function _ProcessTransactionList(params) {
            var iterator = new TAF.Lib.Iterator(params.list);
            while(iterator.hasNext()){
                var line = iterator.next();
                _ProcessTransactionLine(line);
                _State[__WorkingDocuments.Name].Index++;
                _State[__WorkingDocuments.Name].TranId = line.id;
                
                if (_Job.IsThresholdReached()) {
                    return;
                }
            }
        }
        
        
        function _ProcessTransactionLine(line) {
            var workDocument = null;
            if (_State[__WorkingDocuments.Name].TranId != line.id) { //new transaction
                if(_State[__WorkingDocuments.Name].TranId) { //!first transaction
                    var documentTotals = adapter.getWorkDocument();
                    _CloseWorkDocument({documentTotals: documentTotals});
                }

                //write header of new transaction
                workDocument = adapter.getWorkDocument(line);
                _Output.WriteLine(formatter.formatHeader(workDocument));
            }
            
            //write line item of same transaction
            workDocument = workDocument || adapter.getWorkDocument(line);
            var lineXml = formatter.formatLine(workDocument);
            _Output.WriteLine(lineXml);
            _State[__WorkingDocuments.Name].AdapterState = adapter.state;
        }
        
        
        function _CloseWorkDocument(params) {
            var footerXml = formatter.formatFooter(params.documentTotals);
            _Output.WriteLine(footerXml);
            _State[__WorkingDocuments.Name].AdapterState = adapter.state;
        }
    }
    __WorkingDocuments.Name = 'WorkingDocuments';
    this.WorkingDocuments = __WorkingDocuments;
    
    
    
    function __Payments() {
        if (_ACCOUNTING_PREFERENCES.getFieldValue('CASHBASIS') !== 'T') {
            return;
        }

        this.On_Init = _OnInit;
        this.On_Header = _OnHeader;
        this.On_Body = _OnBody;
        this.On_Footer = _OnFooter;
        this.On_CleanUp = _OnCleanUp;
        var ENTRIES_PER_PAGE = 1000;
        
        
        function _OnInit() {
            if(!_State[__Payments.Name]) {
                _State[__Payments.Name] = {
                    Index: -1,
                    TranId: null,
                    AdapterState: {
                        id: -1,
                        lineNo: 0,
                        taxPayable: 0,
                        netTotal: 0,
                        grossTotal: 0
                    }
                };
            }
        }
        
        
        function _OnHeader() {
            var summaryRaw = new TAF.PT.DAO.PaymentSummaryDao({context: _NCONTEXT}).search({
                subsidiary: _Params.subsidiary,
                period: _PeriodIds,
                bookId: _BookId
            }).getList()[0];
            
            var summary = new TAF.PT.Payments.NodeAdapter().getSummary(summaryRaw);
            var summaryXml = new TAF.PT.Payments.XmlFormatter(_SAFT).formatSummary(summary);
            _Output.WriteLine('<Payments>');
            _Output.WriteLine(summaryXml);
        }
        
        
        function _OnBody() {
            try {
                var globalIndex = -1;
                
                var dao = new TAF.PT.DAO.PaymentDao({context: _NCONTEXT, isPTInstalled: _IS_PT_INSTALLED}).search({
                    subsidiary: _Params.subsidiary,
                    period: _PeriodIds,
                    bookId: _BookId
                });
                
                var ptDao = new TAF.PT.DAO.CertificationDao({hasPTCompliance: _IS_PT_INSTALLED});
                var adapter = new TAF.PT.Payments.NodeAdapter(_State[__Payments.Name].AdapterState);
                var formatter = new TAF.PT.Payments.XmlFormatter(_SAFT);
                
                do {
                    globalIndex = ++_State[__Payments.Name].Index;
                    var list = dao.getList(globalIndex);
                    if (!list) {
                        return;
                    }

                    _ProcessPaymentsList({
                        list: list,
                        adapter: adapter,
                        formatter: formatter,
                        ptDao: ptDao
                    });
                    
                    if (_Job.IsThresholdReached()) {
                        return;
                    }
                } while (dao.hasMoreRows);
            } catch(e) {
                nlapiLogExecution('ERROR', 'PT_SAFT_Report Error', e.message);
                throw e;
            }
        }
        
        
        function _OnFooter() {
            if (_State[__Payments.Name].TranId != null) {
                _ClosePaymentNode({
                    adapter: new TAF.PT.Payments.NodeAdapter(_State[__Payments.Name].AdapterState),
                    formatter: new TAF.PT.Payments.XmlFormatter(_SAFT)
                });
            }
            
            _Output.WriteLine('</Payments>');
        }
        
        
        function _OnCleanUp() {
            delete _State[__Payments.Name];
        }
        
        
        function _ProcessPaymentsList(params) {
            var iterator = new TAF.Lib.Iterator(params.list);
            
            while (iterator.hasNext()){
                var line = iterator.next();
                _ProcessPaymentLine(line, params)
                _State[__Payments.Name].Index++;
                _State[__Payments.Name].TranId = line.id;
                
                if (_Job.IsThresholdReached()) {
                    return;
                }
            }
        }
        
        
        function _ProcessPaymentLine(line, params) {
            var invoice = params.ptDao.getById(line.invoiceId);
            var payment = null;
            
            if (_State[__Payments.Name].TranId != line.id) { //new transaction
                if (_State[__Payments.Name].TranId) { //if not the very first transaction in the list
                    //close the Payment node of the previous transaction
                    _ClosePaymentNode({
                        documentTotals: params.adapter.getPaymentTotals(),
                        adapter: params.adapter,
                        formatter: params.formatter
                    });
                }
                
                //write a new Payment node for the new transaction
                payment = params.adapter.getPayment(line, invoice);
                var headerXml = params.formatter.formatHeader(payment);
                _Output.WriteLine(headerXml);
            }
            
            //write line item of the same transaction
            payment = payment || params.adapter.getPayment(line, invoice);
            _WriteLineNode(payment, params.formatter);
            
            _State[__Payments.Name].AdapterState = params.adapter.state;
        }
        
        
        function _WriteLineNode(data, formatter) {
            var lineXml = formatter.formatLine(data);
            
            if (lineXml) {
                _Output.WriteLine(lineXml);
            }
        }
        
        
        function _ClosePaymentNode(params) {
            var documentTotals = params.documentTotals || params.adapter.getPaymentTotals();
            var footerXml = params.formatter.formatFooter(documentTotals);
            _Output.WriteLine(footerXml);
            _State[__Payments.Name].AdapterState = params.adapter.state;
        }
    }
    __Payments.Name = 'Payments';
    this.Payments = __Payments;
    
    
    
    
    //Private functions
    
    function _IsDebitAccount(accountType)
    {
        var type = accountType.toLowerCase();
        
        return type == "bank" ||
               type == "other current asset" ||
               type == "accounts receivable" ||
               type == "fixed asset" ||
               type == "other asset" ||
               type == "cost of goods sold" ||
               type == "expense" ||
               type == "other expense" ||
               type == "unbilled receivable";
    }
    
    
    
    
//    function _GetSubsidiaryList(params) {
//        if (_CommonFiltersCache.Subsidiary == null) {
//            _CommonFiltersCache.Subsidiary = [params.subsidiary];
//            
//            if (params.include_child_subs) {
//                var children = new TAF.SubsidiaryDao().getList({parent: ['is', params.subsidiary]});
//                _CommonFiltersCache.Subsidiary = _CommonFiltersCache.Subsidiary.concat(Object.keys(children));
//            }
//        }
//        
//        return _CommonFiltersCache.Subsidiary;
//    }
    
    
    function _GetSubsidiarySearchFilter()
    {
        if(_CommonFiltersCache.Subsidiary == null)
        {
            var subIds = [_Params.subsidiary];
            if(_Params.include_child_subs)
            {
                var subObj = SFC.Subsidiaries.Load(_Params.subsidiary);
                var descendants = subObj.GetDescendants();
                
                for(var i = 0; i < descendants.length; ++i)
                {
                    subIds.push(descendants[i].GetId());
                }
            }
            
            _CommonFiltersCache.Subsidiary = _IS_ONEWORLD? new nlobjSearchFilter("subsidiary", null, "anyof", subIds): null;
        }
            
        return _CommonFiltersCache.Subsidiary;
    }
    
    
    
    
    
    function _GetPeriodSearchFilter()
    {
        if(_CommonFiltersCache.Period == null)
        {
            var periodIds = SFC.PostingPeriods.GetCoveredPeriodIds(_Period.Start.GetId(), _Period.End.GetId());
            
            _CommonFiltersCache.Period = new nlobjSearchFilter("postingperiod", null, "anyof", periodIds);
        }
        
        return _CommonFiltersCache.Period;
    }
    
    
    
    
    
    function _IsUOMSupported()
    {
        if(_IsUOMSupportedCache == undefined)
        {
            _IsUOMSupportedCache = true;
            
            try
            {
                nlapiSearchRecord("unitstype");
            }
            catch(e)
            {
                _IsUOMSupportedCache = false;
            }
        }
        
        return _IsUOMSupportedCache;
    }
    
    
    
    
    
    function _IsBarcodingSupported()
    {
        if(_IsBarcodingSupportedCache == undefined)
        {
            _IsBarcodingSupportedCache = true;
            
            try
            {
                nlapiSearchRecord("item", null, null, [new nlobjSearchColumn("upccode")]);
            }
            catch(e)
            {
                _IsBarcodingSupportedCache = false;
            }
        }
        
        return _IsBarcodingSupportedCache;
    }
    
    
    
    
    
    function _DeriveTransactionID(row)
    {
    	//Post condition: row must include a "trandate" column
    	
        var tid = "";
        	tid += _SAFT.DATE(nlapiStringToDate(row.tranDate));
        	tid += " ";
        	tid += _JournalId;
        	tid += " ";
        	tid += row.internalId;
    	
        return tid;
    }
    
    
    
    
    
    function _GetStableHash(mod, s)
    {
        var hash = 0;
        
        for(var i = 0; i < s.length; ++i)
        {
            hash += s.charCodeAt(i);
            hash += hash << 10;
            hash ^= hash >> 6;
        }
        
        hash += hash << 3;
        hash ^= hash << 10;
        hash += hash << 15;

        return Math.abs(hash) % mod;
    }
    
    
    
    
    
    function _GetTaxCodesDefinitions()
    {
        if(_PT_TaxCode_Defs == null)
        {
            _PT_TaxCode_Defs = new SFC.TaxCodes.Definitions(VAT_PT);
        }
        
        return _PT_TaxCode_Defs;
    }
    
    
    
    
    
    function _GetSAFTTaxCode(taxCodeObj)
    {
        var type = _GetTaxCodesDefinitions().GetTypeOf(taxCodeObj);
        
        var TYPES = {
            //normal
            S: "NOR",
            ST: "NOR",
            
            //reduced tax rate
            R: "RED",
            
            //intermediate tax rate
            R2: "INT",  
            
            //exempted (zero rate)
            Z: "ISE",
            E: "ISE",
            ER: "ISE",
            EZ: "ISE",
            ESSP: "ISE",
            ESSS: "ISE",
            O: "ISE",
            OS: "ISE",
            
            //others
            "default": "OUT"
        };
        
        return TYPES[type] === undefined? TYPES["default"]: TYPES[type];
    }
    
    
    
    
    
    function _GetSAFTInvoiceType(type)
    {
        var _TYPES = {
            CustInvc: "FT",
            CustCred: "NC",
            CashRfnd: "NC",
            CashSale: "VD"
        };
        
        return _TYPES[type] === undefined? "": _TYPES[type];
    }
    
    
    
    
    
    function _ValidateAccountingPeriods(periodTo, fiscalCalendar) {
        if (!periodTo) {
            throw nlapiCreateError('MISSING_PARAMETER', 'periodTo is a required parameter');
        }
        if (!fiscalCalendar) {
            throw nlapiCreateError('MISSING_PARAMETER', 'fiscalCalendar is a required parameter');
        }

        var validPeriods = new TAF.DAO.AccountingPeriodDao().getPostingPeriodsOnOrBeforePeriod(periodTo, fiscalCalendar, true);
        var coveredPeriods = new TAF.DAO.AccountingPeriodDao().getPostingPeriodsOnOrBeforePeriod(periodTo, null, true);
        var validPeriodIds = !validPeriods ? [] : validPeriods.map(function(period) {
            return period.id;
        });

        if (validPeriodIds.length > 0) {
            for (var i = 0; i < coveredPeriods.length; i++) {
                if (validPeriodIds.indexOf(coveredPeriods[i].id) == -1) {
                    var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
                    var baseUrl = _NCONTEXT.getSetting('SCRIPT', 'custscript_4599_main_s_url');
                    var baseUrlMatch = baseUrl ? baseUrl.match(re) : null;
                    var helpUrl = (baseUrlMatch) ? baseUrlMatch[0].toString() + _ResMgr.GetString('ERR_UNASSIGNED_PERIODS_URL') : '';

                    throw nlapiCreateError('Unassigned_Period', _ResMgr.GetString('ERR_UNASSIGNED_PERIODS', { 'usingFiscalCalendarHelpUrl': helpUrl }), true);
                }
            }
        }
    }
    
    
    
    
    
    
    
    
    
    function __SAFT()
    {
        this.DATE = _DATE;
        this.DATETIME = _DATETIME;
        this.AMOUNT = _AMOUNT;
        this.ACTUALAMOUNT = _ACTUALAMOUNT;
        this.STRING = _STRING;
        
        
        
        
        
        function _DATE(value)
        {
            return value == null? "": value.toString("yyyy-MM-dd");
        }
        
        
        
        
        
        function _DATETIME(value)
        {
            return value == null? "": value.toString("yyyy-MM-ddTHH:mm:ss");
        }
        
        
        
        
        
        function _ACTUALAMOUNT(value)
        {
            if(value == null)
            {
                return "0.00";
            }
            
            var f = parseFloat(value.toString());
            
            return isNaN(f)? "0.00": f;
        }
        
        
        
        
        
        function _AMOUNT(value)
        {
            if(value == null)
            {
                return "0.00";
            }
            
            var f = parseFloat(value.toString());
            
            return isNaN(f)? "0.00": f.toFixed(2);
        }
        
        
        
        
        
        function _STRING(value, length, defaultValue)
        {
            if(value == null || value == "")
            {
                return defaultValue === undefined? "": defaultValue;
            }
            
            var s = value.toString().replace(/\n/g, ", ").replace(//g, '');

            return length == null? _XML.escape({xmlText: s}) : _XML.escape({xmlText: s.substr(0, length)});
        }
    }
}  //PT_SAFT_Report

PT_SAFT_Report_v2.IsCRGReport = true;
PT_SAFT_Report_v2.ReportId = "SAFT_PT_XML_V2";