/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

function PH_CDJ_Report(state, params, output, job)
{
	var _NCONTEXT = SFC.Context.GetContext();
	var _IS_ONEWORLD = SFC.Context.GetContext().getSetting("FEATURE", "SUBSIDIARIES") === "T";
	var _IS_MULTICURRENCY = _NCONTEXT.getFeature('MULTICURRENCY');
	
	var _Outline = { 'Section': __AuditFile };
	var _Job = job;
	var _Output = output;
	var _Params = params;
	var _State = state;
	var _ReportObj = this;
	var _Subsidiary = null;
    var _Period = null;
    this.GetOutline = function() { return _Outline; };
	
	
    function __AuditFile()
    {
        this.On_Init = _OnInit;
        this.On_Header = _OnHeader;
        this.On_Body = _OnBody;
        this.On_CleanUp = _OnCleanUp;
        
        var _NodeName = __AuditFile.Name;
        
        var _PeriodDao = new TAF.DAO.AccountingPeriodDao();
        _Subsidiary = _IS_ONEWORLD ? SFC.Subsidiaries.Load(_Params.subsidiary) : null;
        _Period = {
            Start: _PeriodDao.getPeriodById(_Params.periodFrom),
            End: _PeriodDao.getPeriodById(_Params.periodTo)
        };
        
        var _SearchParams = _GetSearchParams();
        var _TransactionDao = null;
        
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
                    transactionIndex: -1,
                    lineIndex: -1,
                    isTransactionComplete: true
                };
            }
            
            _TransactionDao = new TAF.PH.DAO.CashDisbursementsDAO().search(_SearchParams);
        }
    	
    	
        function _OnHeader()
        {
        	_Output.WriteLine('Cash Disbursements Journal\n');
        	
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
            var globalIndex = _State[_NodeName].isTransactionComplete ? (_State[_NodeName].transactionIndex + 1) : _State[_NodeName].transactionIndex;
            _State[_NodeName].transactionIndex = globalIndex;
            
            do {
                var sr = _TransactionDao.getList(globalIndex);
                
                for (var i = 0; i < sr.length; i++) {
                    _ForEachEntry(sr[i].id);
                    _State[_NodeName].transactionIndex++;
                    
                    if (_Job.IsThresholdReached()) {
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
            if (_IS_MULTICURRENCY && _IS_ONEWORLD)
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
                            throw nlapiCreateError('PHAUDIT_Currency_Check', 'Unable to generate report on subsidiaries that do not use the same currency.', true);
                        }
                    }
                }
            }
        }
        
        
        function _GetFileName()
        {
            var from = _Period.Start.name;
            var to = _Period.End.name;
            var reportName = 'CashDisbursementsJournal';
            var jobId = _Job.GetId();
            var fileNameExtension = 'csv';
            
            var filename = (from !== to) ? [from, '-', to, '_', reportName, '_', jobId, '.', fileNameExtension]
                                         : [from, '_', reportName, '_', jobId, '.', fileNameExtension];
            
            return filename.join('');
        }
        
        
        function _GetSearchParams()
        {
            var params = {};
            params.periodIds = _PeriodDao.getCoveredPostingPeriods(_Period.Start.id, _Period.End.id).map(function(a) {
                return a.id;
            });
            nlapiLogExecution('debug', '', JSON.stringify(params.periodIds));
            if (_IS_ONEWORLD) {
                var subsidiaryList = [];
                subsidiaryList.push(_Params.subsidiary);
                
                if (_Params.include_child_subs) {
                    var children = _Subsidiary.GetDescendants();
                    
                    for (var i = 0; i < children.length; i++) {
                        subsidiaryList.push(children[i].GetId());
                    }
                }
                
                params.subsidiary = subsidiaryList;
            }
            
            return params;
        }
        
        
        function _ForEachEntry(id) {
            var sr = new TAF.PH.DAO.CashDisbursementLineDAO().search({
                bookId: _Params.bookId,
                internalId: id,
                accountingcontext: _Params.accountingContext,
            });
            _State[_NodeName].lineIndex++;
            
            do {
                var list = sr.getList(_State[_NodeName].lineIndex);
                
                for (var i = 0; i < list.length; i++) {
                    //Get accounting context
                    list[i].localizedName = _Accounts[list[i].accountId].localizedName;
                    
                    _Output.WriteLine(convertRow(list[i]));
                    _State[_NodeName].lineIndex++;
                    
                    if (_Job.IsThresholdReached()) {
                        _State[_NodeName].isTransactionComplete = false;
                        return;
                    }
                }
            } while (sr.length >= 1000);
            
            _State[_NodeName].isTransactionComplete = true;
            _State[_NodeName].lineIndex = -1;
        }
        
        
        function convertRow(row) {
            var line = [];
            var accountName = row.localizedName || row.account;
            
            line.push(row.tranDate);
            line.push(row.tranId);
            line.push('\"' + row.memo + '\"');
            line.push(row.type);
            line.push('\"' + accountName + '\"');
            line.push(nlapiFormatCurrency(row.debit));
            line.push(nlapiFormatCurrency(row.credit));
            
            return line.join(',');
        }
    }; __AuditFile.Name = 'AuditFile';
	
}  //PH_CDJ_Report

PH_CDJ_Report.IsCRGReport = true;
PH_CDJ_Report.ReportId = 'PH_CDJ_CSV';
