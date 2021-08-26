/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

function PH_GL_Report(state, params, output, job)
{
	var _NCONTEXT = SFC.Context.GetContext();
	var _IS_ONEWORLD = _NCONTEXT.getSetting("FEATURE", "SUBSIDIARIES") === "T";
	var _IS_MULTICURRENCY = _NCONTEXT.getFeature('MULTICURRENCY');
	var _IS_MULTIBOOK = _NCONTEXT.getFeature('MULTIBOOK');

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


        var _ACCOUNTING_BOOK = getAccountingBook();
        var _MULTIBOOK_JOIN = (_ACCOUNTING_BOOK && !_ACCOUNTING_BOOK.isPrimary) ? 'accountingtransaction' : null;
        var _BOOK_ID = (_IS_MULTIBOOK && _ACCOUNTING_BOOK && !_ACCOUNTING_BOOK.isPrimary) ? _ACCOUNTING_BOOK.id : null;
        var _ResultSet = null;
        var _NodeName = __AuditFile.Name;
        
        var acctParams = _IS_ONEWORLD ? {subsidiary: ['anyof', _Subsidiary.GetId()]} : {};
        if(_Params.job_params && _Params.job_params.hasAccountingContext) {
            acctParams.accountingcontext = ['is', _Params.accountingContext];
        }
        var _Accounts = new TAF.AccountDao().getList(acctParams, false);


		function _OnInit()
        {
		    _ValidateInput();
		    _Output.SetFileName(_GetFileName());

		    if(_State[_NodeName] == undefined)
            {
                _State[_NodeName] = {
                    Index: -1,
                    InternalId: null,
                    LineIndex: -1
                };
            }

            var generalLedgerDao = new TAF.PH.DAO.GeneralLedgerDao();
            var params = {
                periodIds: SFC.PostingPeriods.GetCoveredPeriodIds(_Period.Start.GetId(), _Period.End.GetId()),
                subIds: _GetSubIds(),
                bookId: _BOOK_ID
            };
		    _ResultSet = generalLedgerDao.search(params);

		    _Output.SetPercent(10);
        }


        function _OnHeader()
        {
        	//report name
        	//company name, software name
        	//company address, run date
        	//TIN, user id
        	_Output.WriteLine('General Ledger\n');
        	
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
                var sr = _ResultSet.getList(globalIndex, globalIndex + 1000);
                
                if (sr == null)
                {
                    return;
                }

                for (var i = 0; i < sr.length; ++i)
                {
                    var id = sr[i].internalId;
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
                            throw nlapiCreateError('PHAUDIT_Currency_Check', 'Unable to generate report on subsidiaries that do not use the same currency.', true);
                        }
                    }
                }
            }
        }


        function _GetFileName()
        {
            var from = _Period.Start.GetName();
            var to = _Period.End.GetName();
            var reportName = 'GeneralLedger';
            var jobId = _Job.GetId();
            var fileNameExtension = 'csv';

            var filename = (from !== to) ? [from, '-', to, '_', reportName, '_', jobId, '.', fileNameExtension]
                                         : [from, '_', reportName, '_', jobId, '.', fileNameExtension];

            return filename.join('');
        }


        function _GetSubIds()
        {
            var subsidiaryList = [];

            if(_IS_ONEWORLD) {
                subsidiaryList.push(_Params.subsidiary);

                if (_Params.include_child_subs) {
                    var children = _Subsidiary.GetDescendants();

                    for (var i = 0; i < children.length; i++) {
                        subsidiaryList.push(children[i].GetId());
                    }
                }
            }

            return subsidiaryList;
        }


        function _ForEachEntry(id)
        {
            var generalLedgerDetailsDao = new TAF.PH.DAO.GeneralLedgerDetailsDao();
            generalLedgerDetailsDao.search({
                internalId: id,
                bookId: _BOOK_ID
            });
            var transactionLineIndex = 0;
            var sr = [];

            do {
                transactionLineIndex = _State[_NodeName].LineIndex + 1;
                sr = generalLedgerDetailsDao.getList(transactionLineIndex, transactionLineIndex + 1000);

                for (var i = 0; i < sr.length; ++i) {
                    //Get accounting context
                    if(sr[i].accountId){
                        sr[i].localizedName = _Accounts[sr[i].accountId].localizedName;
                    }
                        
                    var line = _PopulateColumns(sr[i]);

                    if (sr[i].account != '') {
                        _Output.WriteLine(line.join(','));
                    }

                    _State[_NodeName].LineIndex = transactionLineIndex + i;

                    if (_Job.IsThresholdReached()) {
                        return;
                    }
                }
            } while (sr.length >= 1000);

            _State[_NodeName].LineIndex = -1;
        }


        function _PopulateColumns(row) {
            var line = [];
            var accountName = row.localizedName || row.account;
            

            line.push(row.date);
            line.push(row.transactionNumber);
            line.push('\"' + row.memoMain + '\"');
            line.push(row.type);
            line.push('\"' + accountName + '\"');
            line.push(nlapiFormatCurrency(row.debitAmount));
            line.push(nlapiFormatCurrency(row.creditAmount));

            return line;
        }


        function getAccountingBook() {
            if (_IS_MULTIBOOK) {
                if (!_Params.bookId) {
                    throw nlapiCreateError('MISSING_PARAMETER', 'Please provide the bookId.');
                }

                var dao = new TAF.DAO.AccountingBookDao();
                dao.search({
                    subsidiary: _Params.subsidiary,
                    internalId: _Params.bookId
                });

                var list = dao.getList();
                return (list && list.length > 0) ? list[0] : null;
            }
        }

    }; __AuditFile.Name = 'AuditFile';

}  //PH_GL_Report

PH_GL_Report.IsCRGReport = true;
PH_GL_Report.ReportId = 'PH_GL_CSV';
