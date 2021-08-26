/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

function PH_GJ_Report(state, params, output, job)
{

	var SuiteScript = function() { return this; } ();
	
	var _NCONTEXT = SFC.Context.GetContext();
    var _IS_ONEWORLD = SFC.Context.GetContext().getSetting("FEATURE", "SUBSIDIARIES") === "T";
    var _IS_MULTICURRENCY = _NCONTEXT.getFeature('MULTICURRENCY');
    var _IS_MULTIBOOK = _NCONTEXT.getFeature('MULTIBOOK');
    var _MULTIBOOK_JOIN = _IS_MULTIBOOK && params.bookId ? 'accountingtransaction' : null;
    
    var _Outline = { 'Section': __AuditFile };
    var _Job = job;
    var _Output = output;
    var _Params = params;
    var _State = state;
    var _ReportObj = this;
    var _Subsidiary = _IS_ONEWORLD ? SFC.Subsidiaries.Load(_Params.subsidiary) : null;
    var _Period = { 
    		Start: SFC.PostingPeriods.Load(_Params.periodFrom),
    		End: SFC.PostingPeriods.Load(_Params.periodTo)
    };
    this.GetOutline = function() { return _Outline; };
        
    
    function __AuditFile()
    {
        this.On_Init = _OnInit;
        this.On_Header = _OnHeader;
        this.On_Body = _OnBody;
        this.On_CleanUp = _OnCleanUp;
        
        // for Unit Testing only
        this.___inspect = function(expr) { return eval('(' + expr + ')'); };
        
        
        var _ResultSet = null;
        var _NodeName = __AuditFile.Name;
        var _SearchFilters = _GetSearchFilters();
        
        var acctParams = _IS_ONEWORLD ? {subsidiary: ['anyof', _Subsidiary.GetId()]} : {};
        acctParams.accountingcontext = ['is',_Params.accountingContext];
        var _Accounts = new TAF.AccountDao().getList(acctParams, false);
        
        
        function _OnInit()
        {
            _ValidateInput();
            _Output.SetFileName(_GetFileName());

            if (_State[_NodeName] == undefined)
            {
                _State[_NodeName] = {
                    Index: -1,
                    InternalId: null
                };
            }
            
            _ResultSet = _GetSearch().runSearch();
            _Output.SetPercent(10);
        }
        
        
        function _OnHeader()
        {
        	_Output.WriteLine('General Journal\n');
        	
        	var curCompanyInfo = _getCompanyInfo();
        	var companyInfoHeaderText = _createCompanyInfoHeader(curCompanyInfo);
        	_Output.WriteLine(companyInfoHeaderText);
        	
            var headers = ['Date', 'Reference', 'Description/Memo', 'Transaction Type', 'Account', 'Debit', 'Credit'];
            _Output.WriteLine(headers.join(','));
            _Output.SetPercent(15);
        }

        function _getCompanyInfo() {
        	var companyInfo = {};
        	
        	if (_IS_ONEWORLD) {
        		companyInfo.softwareName = 'NetSuite OneWorld';
        		companyInfo.companyName = _Subsidiary.GetLegalName() || _Subsidiary.GetName();
        		companyInfo.vatRegNo = _Subsidiary.GetVRN() || '';
        		companyInfo.address = _Subsidiary.GetAddress1() + ' ' + _Subsidiary.GetAddress2() + 
        			' '+ _Subsidiary.GetCity() + ' ' + _Subsidiary.GetPostalCode() + 
        			' ' + _Subsidiary.GetCountryName();
        	} else {
        		var COMPANY = SFC.Context.GetCompanyInfo();
        		companyInfo.softwareName = 'NetSuite Mid-market';
        		companyInfo.companyName = COMPANY.getFieldValue('legalname') || COMPANY.getFieldValue('companyname');
        		companyInfo.vatRegNo = COMPANY.getFieldValue('taxnumber') || COMPANY.getFieldValue('employerid') || '';
        		companyInfo.address = COMPANY.getFieldValue('address1') + ' ' + 
        			COMPANY.getFieldValue('address2') + ' ' + COMPANY.getFieldValue('city') + ' ' + 
        			COMPANY.getFieldValue('zip') + ' ' + COMPANY.getFieldValue('country');
        	}
        	
        	companyInfo.address = companyInfo.address.replace(/,/g, " ");
        	companyInfo.address = companyInfo.address.trim();
        	
        	companyInfo.softwareName = companyInfo.softwareName + ' ' + _NCONTEXT.getVersion();
        	companyInfo.runDate = new Date().toString('MM/dd/yyyyThh:mm');
        	companyInfo.runDate = companyInfo.runDate.replace(/[T]/g, " ");
        	
        	var userInternalId = _NCONTEXT.getUser();
        	companyInfo.userId = nlapiLookupField('employee', userInternalId, 'entityid');
        	
        	return companyInfo;
        } 
        
        function _createCompanyInfoHeader(companyInfoObj) {
        	var companyInfoHeader = '';
        	
        	companyInfoHeader = 'Company Name,' + companyInfoObj.companyName + ',';
        	companyInfoHeader = companyInfoHeader + 'Software Name,' + companyInfoObj.softwareName + '\n';
        	companyInfoHeader = companyInfoHeader + 'Company Address,' + companyInfoObj.address + ',';
        	companyInfoHeader = companyInfoHeader + 'Run Date,' + companyInfoObj.runDate + '\n';
        	companyInfoHeader = companyInfoHeader + 'TIN,' + companyInfoObj.vatRegNo + ',';
        	companyInfoHeader = companyInfoHeader + 'User ID,' + companyInfoObj.userId + '\n';
        	
        	return companyInfoHeader;
        }
        
        function _OnBody()
        {
            var globalIndex = null;
            
            do
            {
                globalIndex = _State[_NodeName].Index + 1;
                var sr = _ResultSet.getResults(globalIndex, globalIndex + 1000);
                
                if (sr == null)
                {
                    return;
                }
                
                for (var i = 0; i < sr.length; ++i)
                {
                    var id = sr[i].getValue('internalid', null, 'GROUP');
                    _ForEachEntry(id);
                    
                    _State[_NodeName].Index = globalIndex + i;
                    _State[_NodeName].InternalId = id;

                    if (_Job.IsThresholdReached())
                    {
                        return;
                    }
                }
            } while (sr.length >= 1000);
            
            _Output.SetPercent(95);
        }
        
        
        function _OnCleanUp()
        {
            delete _State[_NodeName];
            _Output.SetPercent(100);
        }
        
        
        function _ValidateInput()
        {
            if (_IS_MULTICURRENCY && _IS_ONEWORLD && !_IS_MULTIBOOK)
            {
                if (_Params.include_child_subs)
                {
                    //Check if all subs use the same currency
                    var descendants = _Subsidiary.GetDescendants();
                    var currencyCode = _Subsidiary.GetCurrencyCode();
                    for (var i = 0; i < descendants.length; ++i)
                    {
                        if (currencyCode != descendants[i].GetCurrencyCode())
                        {
                            throw SuiteScript.nlapiCreateError('PHAUDIT_Currency_Check', 'Unable to generate report on subsidiaries that do not use the same currency.', true);
                        }
                    }
                }
            }
        }
        
        
        function _GetFileName()
        {
            var from = _Period.Start.GetName();
            var to = _Period.End.GetName();
            var reportName = 'GeneralJournal';
            var jobId = _Job.GetId();
            var fileNameExtension = 'csv';
            
            var filename = (from !== to) ? [from, '-', to, '_', reportName, '_', jobId, '.', fileNameExtension]
                                         : [from, '_', reportName, '_', jobId, '.', fileNameExtension];
            
            return filename.join('');
        }
        
        
        function _GetSearchFilters()
        {
            var _transactionTypes = [
                'CustInvc',
                'CustCred',
                'VendBill',
                'VendCred',
                'VendCard',
                'CardChrg',
                'CardRfnd',
                'CustPymt',
                'CashSale',
                'CustDep',
                'VendPymt',
                'Check',
                'CashRfnd',
                'CustRfnd',
                'TaxPymt',
                'TaxLiab',
                'Paycheck'
            ];
            
            var filters = [
                new SuiteScript.nlobjSearchFilter('posting', null, 'is', 'T'),
                new SuiteScript.nlobjSearchFilter('type', null, 'noneof', _transactionTypes)
            ];

            var periodIds = SFC.PostingPeriods.GetCoveredPeriodIds(_Period.Start.GetId(), _Period.End.GetId());
            filters.push(new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', periodIds));
            
            if (_IS_ONEWORLD)
            {
                var subsidiaryList = [];
                subsidiaryList.push(_Params.subsidiary);
                
                if (_Params.include_child_subs) {
                    var children = _Subsidiary.GetDescendants();
                    
                    for (var i = 0; i < children.length; i++) {
                        subsidiaryList.push(children[i].GetId());
                    }
                }
                
                filters.push(new SuiteScript.nlobjSearchFilter('subsidiary', null, 'anyof', subsidiaryList));
            }
            
            if (_IS_MULTIBOOK && _Params.bookId) {
                filters.push(new SuiteScript.nlobjSearchFilter('accountingbook', _MULTIBOOK_JOIN, 'is', _Params.bookId));
            }
            
            return filters;
        }
        
        
        function _GetSearch()
        {
            var search = SuiteScript.nlapiLoadSearch('transaction', 'customsearch_ph_taf_transaction_search');
            
            search.addFilters(_SearchFilters);
            search.addColumns([
                new SuiteScript.nlobjSearchColumn('internalid', null, 'GROUP'),
                new SuiteScript.nlobjSearchColumn('tranid', null, 'GROUP').setSort()
            ]);
            
            return search;
        }
        
        
        function _SearchTransaction(id)
        {
            var columns = [
                new SuiteScript.nlobjSearchColumn('linesequencenumber').setSort(),
                new SuiteScript.nlobjSearchColumn('tranid'),
                new SuiteScript.nlobjSearchColumn('trandate'),
                new SuiteScript.nlobjSearchColumn('creditamount', _MULTIBOOK_JOIN),
                new SuiteScript.nlobjSearchColumn('debitamount', _MULTIBOOK_JOIN),
                new SuiteScript.nlobjSearchColumn('memomain'),
                new SuiteScript.nlobjSearchColumn('account', _MULTIBOOK_JOIN),
                new SuiteScript.nlobjSearchColumn('type'),
                new SuiteScript.nlobjSearchColumn('memo')
            ];
            
            var filters = [
                new SuiteScript.nlobjSearchFilter('internalid', null, 'is', parseInt(id, 10))
            ];
            
            if (_IS_MULTIBOOK && _Params.bookId) {
                filters.push(new SuiteScript.nlobjSearchFilter('accountingbook', _MULTIBOOK_JOIN, 'is', _Params.bookId));
            }
            
            return SuiteScript.nlapiSearchRecord('transaction', null, filters, columns);
        }
        
        
        function _ForEachEntry(id)
        {
            var sr = _SearchTransaction(id);
            
            var actual_lines = [];
            var is_voided = true;
            
            for (var i = 0; sr && i < sr.length; ++i) {
                var line = _PopulateColumns(sr[i]);
                
                if (sr[i].getValue('account', _MULTIBOOK_JOIN) != '') {
                    actual_lines.push(line);
                    
                    if (sr[i].getValue('debitamount', _MULTIBOOK_JOIN) != '' || sr[i].getValue('creditamount', _MULTIBOOK_JOIN) != '') {
                        _Output.WriteLine(line.join(','));
                        is_voided = false;
                    }
                }
            }
            
            if (is_voided) {
                for (var j = 0; j < actual_lines.length; ++j) {
                    _Output.WriteLine(actual_lines[j].join(','));
                }
            }
        }
        
        
        function _PopulateColumns(row) {
            //Get accounting context
            var accountId = row.getValue('account', _MULTIBOOK_JOIN);
            var localizedName;
            if (accountId != '') {
                localizedName = _Accounts[accountId].localizedName;
            }
            var accountName = localizedName ? localizedName : row.getText('account', _MULTIBOOK_JOIN).trim();
            
            var line = [];
            var memo = row.getValue('memomain') == '' ? row.getValue('memo') : row.getValue('memomain');
            
            line.push(row.getValue('trandate'));
            line.push(row.getValue('tranid'));
            line.push('\"' + memo + '\"');
            line.push(row.getText('type'));
            line.push('\"' + accountName + '\"');
            line.push(SuiteScript.nlapiFormatCurrency(row.getValue('debitamount', _MULTIBOOK_JOIN)));
            line.push(SuiteScript.nlapiFormatCurrency(row.getValue('creditamount', _MULTIBOOK_JOIN)));
            
            return line;
        }
    }; __AuditFile.Name = 'AuditFile';

}  //PH_GJ_Report

PH_GJ_Report.IsCRGReport = true;
PH_GJ_Report.ReportId = 'PH_GJ_CSV';
