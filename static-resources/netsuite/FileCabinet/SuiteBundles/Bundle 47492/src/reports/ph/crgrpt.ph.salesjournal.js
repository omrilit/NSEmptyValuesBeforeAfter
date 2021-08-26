/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

function PH_SJ_Report(state, params, output, job)
{
    var _NCONTEXT = SFC.Context.GetContext();
    var _IS_ONEWORLD = _NCONTEXT.getSetting("FEATURE", "SUBSIDIARIES") === "T";
    var _IS_MULTICURRENCY = _NCONTEXT.getFeature('MULTICURRENCY');
    var _IS_PROJECTS_ENABLED = _NCONTEXT.getFeature('JOBS');
    var _IS_MULTIBOOK = _NCONTEXT.getFeature('MULTIBOOK');

    var _Outline = { "Section": __AuditFile };
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

        var _ACCOUNTING_BOOK = _GetAccountingBook();
        var _MULTIBOOK_JOIN = (_ACCOUNTING_BOOK && !_ACCOUNTING_BOOK.isPrimary) ? 'accountingtransaction' : null;
        var _BOOK_ID = (_IS_MULTIBOOK && _ACCOUNTING_BOOK && !_ACCOUNTING_BOOK.isPrimary) ? _ACCOUNTING_BOOK.id : null;
        var _ResultSet = null;
        var _NodeName = __AuditFile.Name;
        var _RowData = {
            "trandate": "",
            "vatregnumber": "",
            "name": "",
            "address": "",
            "memo": "",
            "type": "",
            "tranid": "",
            "amount": "",
            "discount": "",
            "netsales": "",
            "vatamount": "",
            "grosssales": ""
        };


        function _OnInit()
        {
            _ValidateInput();
            _Output.SetFileName(_GetFileName());


            if(_State[_NodeName] == undefined)
            {
                _State[_NodeName] = {
                    Index: -1,
                    TranId: null,
                    InternalId: null
                };
            }

            var salesJournalDao = new TAF.PH.DAO.SalesJournalDao();
            var params = {
                periodIds: SFC.PostingPeriods.GetCoveredPeriodIds(_Period.Start.GetId(), _Period.End.GetId()),
                subIds: _GetSubIds(),
                bookId: _BOOK_ID
            };

            _ResultSet = salesJournalDao.search(params);
            _Output.SetPercent(10);
        }


        function _OnHeader()
        {
        	_Output.WriteLine('Sales Journal\n');
        	
        	var curCompanyInfo = _getCompanyInfo();
        	var companyInfoHeaderText = _createCompanyInfoHeader(curCompanyInfo);
        	_Output.WriteLine(companyInfoHeaderText);
        	
            var headers = ['Date', 'Customer TIN', 'Customer Name', 'Address', 'Description', 'Transaction Type',
                           'Reference/Doc No/Invoice No', 'Amount', 'Discount', 'Net Sales', 'VAT Amount', 'Gross Sales'];
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
                    _ForEachEntry(sr[i]);

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
                            throw nlapiCreateError("PHAUDIT_Currency_Check", "Unable to generate report on subsidiaries that do not use the same currency.", true);
                        }
                    }
                }
            }
        }


        function _GetFileName()
        {
            var from = _Period.Start.GetName();
            var to = _Period.End.GetName();
            var reportName = "SalesJournal";
            var jobId = _Job.GetId();
            var fileNameExtension = "csv";

            var filename = (from !== to) ? [from, "-", to, "_", reportName, "_", jobId, ".", fileNameExtension]
                                         : [from, "_", reportName, "_", jobId, ".", fileNameExtension];

            return filename.join("");
        }


        function _GetSubIds() {
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


        function _ForEachEntry(row)
        {
            var salesJournalDetailsDao = new TAF.PH.DAO.SalesJournalDetailsDao();
            salesJournalDetailsDao.search({
                internalId: row.internalId,
                bookId: _BOOK_ID
            });
            var sr = salesJournalDetailsDao.getList();
            var line;

            if (sr.length > 0) {
                line = _PopulateColumns(row, sr[0]);
                _Output.WriteLine(line.join(','));
            }
        }


        function _PopulateColumns(txn, line) {
            var data = [];
            var discountAmount = Math.abs(line.discount) || 0;
            var taxTotalAmount = Math.abs(line.taxTotal) || 0;
            var grossAmount = Math.abs(line.gross) || 0;
            discountAmount = line.discountCount == 1 ? 0 : discountAmount;
            var grossSales = (grossAmount + discountAmount) - taxTotalAmount;
            var netSales = grossSales - discountAmount;
            var address = txn.billAddress ? txn.billAddress.split('\n').join(' ') : '';
            var name = txn.isPerson == 'T' ? [txn.firstName, txn.lastName].join(' ') : txn.companyName;
            this.columns = [];
          
            data.push(line.date);
            data.push(txn.vatRegNumber);
            data.push('"' + (name || txn.entityId) + '"');
            data.push('"' + address + '"');
            data.push('"' + line.memoMain + '"');
            data.push(line.type);
            data.push(line.transactionId);
            data.push(nlapiFormatCurrency(grossAmount));
            if(line.discountCount != 1){
               data.push(nlapiFormatCurrency(discountAmount));
            }
            else
            {
              data.push('');
            }
            data.push(nlapiFormatCurrency(Math.abs(netSales)));
            data.push(nlapiFormatCurrency(taxTotalAmount));
            data.push(nlapiFormatCurrency(Math.abs(grossSales)));

            return data;
        }


        function _GetAccountingBook() {
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
    }; __AuditFile.Name = "AuditFile";

}  //PH_SJ_Report

PH_SJ_Report.IsCRGReport = true;
PH_SJ_Report.ReportId = "PH_SJ_CSV";
