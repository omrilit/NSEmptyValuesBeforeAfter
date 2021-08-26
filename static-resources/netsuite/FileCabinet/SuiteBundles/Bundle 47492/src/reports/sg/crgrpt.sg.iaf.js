/**
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var SG_IAF_Report = function _SG_IAF_Report(state, params, output, job) {
    
    var _Job = job;
    var _Output = output;
    var _Params = params;
    var _State = state;
    var _Outline = {
        "Section": _IafReport,
        "SubSections": [
            {"Section": _GLNumberReport},
            {"Section": _CompanyInfoReport}, 
            {"Section": _PurchaseReport,
                "SubSections": [ {"Section": _PurchaseLines} ]
            },
            {"Section": _SupplyReport, 
                "SubSections": [
                    {"Section": _SupplyLines},
                    {"Section": _RGLSection}
                ]
            },
            {"Section": _GLDataReport}
        ]
    };
    
    var _Context = SFC.Context.GetContext();
    var _IsOneWorld = _Context.getSetting('FEATURE', 'SUBSIDIARIES') === 'T';
    var _IsMultiCurrency = _Context.getFeature('MULTICURRENCY');
    var _IsMultiBook = _Context.getFeature('MULTIBOOK');
    var _BookId = params.bookId;
    var _Subsidiary = _IsOneWorld ? SFC.Subsidiaries.Load(_Params.subsidiary) : null;
    var _Book = _GetAccountingBook();
    var _SubsidiaryIdList = _IsOneWorld ? _GetSubsidiaryIdList() : null;
    var _Period = { Start: SFC.PostingPeriods.Load(_Params.periodFrom),
                    End: SFC.PostingPeriods.Load(_Params.periodTo)};
    var _PeriodIdList = SFC.PostingPeriods.GetCoveredPeriodIds(_Period.Start.GetId(), _Period.End.GetId());
    var _BaseCurrency = _GetBaseCurrency();
    var _CompanyInfo = new TAF.SG.DAO.CompanyInfoDao().getCompanyInfo();
    var _SubsidiaryInfo = _IsOneWorld ? new TAF.SubsidiaryDao().getSubsidiaryInfo(_Params) : null;
    var _IsGLSupported = false;    var _HasAccountingContext = _Params.job_params && _Params.job_params.hasAccountingContext;
    var _HasSTCBundle = SFC.Registry.IsInstalled('9b168872-32ec-4d8e-b73e-38193fedc4d3');    var _SalesAcctTypes = [ '@NONE@', 'OthIncome', 'Income', 'DeferRevenue' ];
    var _PurchaseAcctTypes = [ 'OthCurrAsset', 'FixedAsset', 'OthAsset', 'COGS', 'Expense', 'OthExpense', 'DeferExpense' ];

    var acctParams = _IsOneWorld ? {subsidiary: ['anyof', _Subsidiary.GetId()]} : {};
    acctParams.accountingcontext = ['is',_Params.accountingContext];
    var _Accounts = new TAF.AccountDao().getList(acctParams, false);
    
    var _Formatter = null; 
    this.SetFormatter = function(formatter) {
        _Formatter = formatter;
    };
    
    this.GetOutline = function() {
        return _Outline;
    };
    
    // Constants
    var PROGRESS_PERCENTAGE = {
        SUB_TRANID: 20,
        COMPANY_INFO: 30,
        PURCHASE: 50,
        SUPPLY: 70,
        GL_DATA: 100
    };
    var ENTRIES_PER_PAGE = 1000;
        
    function _GetSubsidiaryIdList() {
        var subsidiaryIdList = [];
        subsidiaryIdList.push(_Params.subsidiary);
        
        if (_Params.include_child_subs) {
            var children = _Subsidiary.GetDescendants();
            for (var i = 0; i < children.length; i++) {
                subsidiaryIdList.push(children[i].GetId());
            }
        }
        return subsidiaryIdList;
    }
    
    function _GetAccountingBook() {
        if (!_IsMultiBook) {
            return {};
        }
        
        var dao = new TAF.DAO.AccountingBookDao();
        dao.search({
            internalId: _BookId,
            subsidiary: _Subsidiary.GetId(),
        });
        var books = dao.getList();
        return books && (books.length > 0) ? books[0] : {};
    };
    
    function _GetBaseCurrency() {
        if (_IsMultiBook && !_Book.isPrimary && _BookId) {
            return _Book.currencyId;
        } else if (!_IsMultiCurrency) {
            return '';
        } else if (_IsOneWorld) {
            return _Subsidiary.GetCurrencyId();
        } else {
            var dao = new TAF.SG.DAO.CompanyInfoDao();
            return dao.getBaseCurrency();
        }
    }

    function _IafReport() {

        this.On_Init = _OnInit;
        this.On_Header = _OnHeader;
        this.On_Footer = _OnFooter;
        this.On_CleanUp = _OnCleanUp;

        function _OnInit() {
            
            _ValidateCurrencies();
            if (_Context.getFeature('MULTIPLECALENDARS')) {
                _ValidateAccountingPeriods(_Params.periodTo, _Subsidiary.GetFiscalCalendar());
            }
            if (!_State[_IafReport.Name]) {
                
                var currencyISOCodesMap = new TAF.DAO.CurrencyDao().getSymbolMap();
                _State[_IafReport.Name] = {
                        CurrencyISOCodesMAP : currencyISOCodesMap
                };
            }
        }
        
        function _OnHeader() {
            
            _Output.WriteLine(_Formatter.formatSGIAFHeader());          
        }
        
        function _OnFooter() {
            
            _Output.WriteLine(_Formatter.formatSGIAFFooter());
        }
        
        function _OnCleanUp() {
            
            delete _State[_IafReport.Name];
        }
        
        
        function _ValidateCurrencies() {
            
            if (_IsMultiCurrency && _IsOneWorld && _Params.include_child_subs && !_IsMultiBook) {
                
                var descendants = _Subsidiary.GetDescendants();
                var currencyCode = _Subsidiary.GetCurrencyCode();
                var incorrectSubsidiaries = [];
                
                for ( var i = 0; i < descendants.length; ++i) {
                    if (currencyCode != descendants[i].GetCurrencyCode()) {
                        incorrectSubsidiaries.push(descendants[i].GetName());
                    }
                }
                
                if (incorrectSubsidiaries.length > 0) {
                    var resourceManager = new ResourceMgr(_Params.job_params.CultureId);
                    var errorMessage = resourceManager.GetString('ERR_CURRENCY_CHECK', { subsidiaries: incorrectSubsidiaries.join(', ') });
                    throw nlapiCreateError('SG_AUDIT_Currency_Check', errorMessage, true);
                }
            }
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
                        var resourceManager = new ResourceMgr(_Params.job_params.CultureId);
                        var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
                        var baseUrl = _Context.getSetting('SCRIPT', 'custscript_4599_main_s_url');
                        var baseUrlMatch = baseUrl ? baseUrl.match(re) : null;
                        var helpUrl = (baseUrlMatch) ? baseUrlMatch[0].toString() + resourceManager.GetString('ERR_UNASSIGNED_PERIODS_URL') : '';

                        throw nlapiCreateError('Unassigned_Period', resourceManager.GetString('ERR_UNASSIGNED_PERIODS', { 'usingFiscalCalendarHelpUrl': helpUrl }), true);
                    }
                }
            }
        }
    }
    _IafReport.Name = 'IafReport';
    
    
    function _CompanyInfoReport() {
        this.On_Init = _OnInit;
        this.On_Header = _OnHeader;
        this.On_Body = _OnBody;
        this.On_Footer = _OnFooter;
        this.On_CleanUp = _OnCleanUp;

        function _OnInit() {
            if (!_State[_CompanyInfoReport.Name]) {
                _State[_CompanyInfoReport.Name] = {
                };
            }
        }

        function _OnHeader() {
            
            _Output.WriteLine(_Formatter.formatCompanyInfoHeader());
        }

        function _OnBody() {
            try {
                
                var adapterParams = {
                        companyInfo : _CompanyInfo,
                        subsidiaryInfo : _IsOneWorld ? _SubsidiaryInfo : {},
                        periodFrom : _Period.Start.GetStartDate(),
                        periodTo : _Period.End.GetEndDate(),
                        dateCreated : nlapiStringToDate(_Params.dateCreated)
                };

                var companyInfoLine = new TAF.SG.Adapter.CompanyInfoAdapter().getCompanyInfoLine(adapterParams);
                
                _Output.WriteLine(_Formatter.formatCompanyInfoBody(companyInfoLine));
            } catch (e) {
                nlapiLogExecution('ERROR', '_CompanyInfoReport.On_Body()', e.toString());
                throw e;
            }
            _Output.SetPercent(PROGRESS_PERCENTAGE.COMPANY_INFO);
        }

        function _OnFooter() {
            
            _Output.WriteLine(_Formatter.formatCompanyInfoFooter());
        }
        
        function _OnCleanUp() {
            delete _State[_CompanyInfoReport.Name];
        }
    }
    _CompanyInfoReport.Name = 'CompanyInfo';
    
    function _PurchaseReport() {
        this.On_Init = _OnInit;
        this.On_Body = _OnBody;
        this.On_Footer = _OnFooter;
        this.On_CleanUp = _OnCleanUp;

        function _OnInit() {
            if (!_State[_PurchaseReport.Name]) {
                var taxCodeCache = TAF.DAO.TaxCodeDaoSingleton.getInstance({ countryCode: 'SG', hasSTCBundle: _HasSTCBundle }).taxCodeCache;
                var summary = new TAF.SG.Adapter.PurchaseSummary();

                summary.purchaseTotalSGD = 0;
                summary.gstTotalSGD = 0;
                summary.transactionCountTotal = 0;

                _State[_PurchaseReport.Name] = {
                    Index : -1,
                    Summary: summary,
                    SummaryDaoParams: {
                        periodIds : _PeriodIdList,
                        subIds : _SubsidiaryIdList,
                        bookId: _BookId,
                        accountTypes: _PurchaseAcctTypes,
                        exludedDeferredInputAndOutput: true
                    },
                    SummaryAdapterParams: {
                        isMultibook : _IsMultiBook,                    
                        isMulticurrency : _IsMultiCurrency,
                        accounts: _Accounts,
                        purchaseAccountTypes: _PurchaseAcctTypes,
                        taxCodeCache: taxCodeCache
                    }
                };
            }
        }

        function _OnBody() {
            try {
                var globalIndex;
                var adapter = new TAF.SG.Adapter.PurchaseAdapter(_State[_PurchaseReport.Name].SummaryAdapterParams);
                var purchaseSummaryDao = new TAF.SG.DAO.PurchaseSummaryDao();
                purchaseSummaryDao.search(_State[_PurchaseReport.Name].SummaryDaoParams);

                do {
                    globalIndex = _State[_PurchaseReport.Name].Index + 1;
                    var list = purchaseSummaryDao.getList(globalIndex, globalIndex + ENTRIES_PER_PAGE);
                    if (!list) {
                        break;
                    }

                    _ProcessTransactionSummary(list, adapter);

                    if (_Job.IsThresholdReached()) {
                        return;
                    }
                } while (list.length >= ENTRIES_PER_PAGE);

                _Output.WriteLine(_Formatter.formatPurchaseHeader(_State[_PurchaseReport.Name].Summary));
            } catch (e) {
                nlapiLogExecution('ERROR', '_PurchaseReport', e.toString());
                throw e;
            }
        }

        function _ProcessTransactionSummary(list, adapter) {
            var iterator = new TAF.Lib.Iterator(list);

            while (iterator.hasNext()) {
                var line;
                var purchaseSummaryData;

                line = iterator.next();
                if (adapter.isValidPurchaseLine(line)) {
                    purchaseSummaryData = adapter.convertPurchaseSummaryData(line);
                    _State[_PurchaseReport.Name].Summary.purchaseTotalSGD += +((+purchaseSummaryData.purchaseValueSGD || 0).toFixed(2));
                    _State[_PurchaseReport.Name].Summary.gstTotalSGD += +((+purchaseSummaryData.gstValueSGD || 0).toFixed(2));
                    _State[_PurchaseReport.Name].Summary.transactionCountTotal++;
                }
                _State[_PurchaseReport.Name].Index++;

                if (_Job.IsThresholdReached()) {
                    return;
                }
            }
        }

        function _OnFooter() {
            _Output.WriteLine(_Formatter.formatPurchaseFooter(_State[_PurchaseReport.Name].Summary));
        }

        function _OnCleanUp() {
            delete _State[_PurchaseReport.Name];
        }
     }
    _PurchaseReport.Name = '_PurchaseReport';

    function _PurchaseLines() {
        this.On_Init = _OnInit;
        this.On_Body = _OnBody;
        this.On_CleanUp = _OnCleanUp;

        function _OnInit() {
            if (!_State[_PurchaseLines.Name]) {

                var taxCodeCache = TAF.DAO.TaxCodeDaoSingleton.getInstance({ countryCode: 'SG', hasSTCBundle: _HasSTCBundle }).taxCodeCache;

                _State[_PurchaseLines.Name] = {
                    Index : -1,
                    AdapterState: {tranId : -1, lineNo : 0},
                    taxCodeCache: taxCodeCache,
                    AdapterParams: {
                        isMultibook : _IsMultiBook,
                        isMulticurrency : _IsMultiCurrency,
                        currencyMap : _State[_IafReport.Name].CurrencyISOCodesMAP,
                        baseCurrency : _BaseCurrency,
                        taxCodeCache: taxCodeCache
                    },
                    DaoParams: {
                        periodIds : _PeriodIdList,
                        subIds : _SubsidiaryIdList,
                        bookId : _BookId,
                        accountTypes: _PurchaseAcctTypes,
                        exludedDeferredInputAndOutput: true
                    }
                };
            }
        }

        function _OnBody() {
            try {
                var globalIndex;
                var adapter = new TAF.SG.Adapter.PurchaseAdapter(_State[_PurchaseLines.Name].AdapterParams, _State[_PurchaseLines.Name].AdapterState);
                var purchaseDao = new TAF.SG.DAO.PurchaseDao();
                purchaseDao.search(_State[_PurchaseLines.Name].DaoParams);
                
                do {
                    globalIndex = _State[_PurchaseLines.Name].Index + 1;
                    var list = purchaseDao.getList(globalIndex, globalIndex + ENTRIES_PER_PAGE);
                    if (!list) {
                        break;
                    }
                    
                    _ProcessTransactionList(list, adapter);
                    
                    if (_Job.IsThresholdReached()) {
                        return;
                    }
                } while (list.length >= ENTRIES_PER_PAGE);
            } catch (e) {
                nlapiLogExecution('ERROR', '_PurchaseReport', e.toString());
                throw e;
            }
            _Output.SetPercent(PROGRESS_PERCENTAGE.PURCHASE);
        }
        
        function _ProcessTransactionList(list, adapter) {
            var iterator = new TAF.Lib.Iterator(list);
            
            while(iterator.hasNext()){
                var line = iterator.next();
                var purchase;

                if (adapter.isValidPurchaseLine(line)) {
                    purchase = adapter.convertPurchase(line);
                    _Output.WriteLine(_Formatter.formatPurchaseBody(purchase));
                    _State[_PurchaseLines.Name].AdapterState = adapter.state;
                }
                _State[_PurchaseLines.Name].Index++;
                
                if (_Job.IsThresholdReached()) {
                    return;
                }
            }
        }

        function _OnCleanUp() {
            delete _State[_PurchaseLines.Name];
        }
     }
    _PurchaseLines.Name = '_PurchaseLines';
    
    function _SupplyReport() {

        this.On_Init = _OnInit;
        this.On_Body = _OnBody;
        this.On_Footer = _OnFooter;
        this.On_CleanUp = _OnCleanUp;

        function _OnInit() {
            if (!_State[_SupplyReport.Name]) {
                var taxCodeCache = TAF.DAO.TaxCodeDaoSingleton.getInstance({ countryCode: 'SG', hasSTCBundle: _HasSTCBundle }).taxCodeCache;
                var rglData = _GetRGLData();
                var convertedSummary = new TAF.SG.Adapter.SupplyAdapter({}).convertRglDataSummary(rglData.totals);
                
                _State[_SupplyReport.Name] = {
                    Index: -1,
                    Summary: convertedSummary,
                    SummaryDaoParams: {
                        periodIds : _PeriodIdList,
                        subIds : _SubsidiaryIdList,
                        bookId: _BookId,
                        salesAccountTypes: _SalesAcctTypes,
                        purchaseAccountTypes: _PurchaseAcctTypes,
                        exludedDeferredInputAndOutput: true
                    },
                    SummaryAdapterParams: {
                        isMultibook : _IsMultiBook,                    
                        isMulticurrency : _IsMultiCurrency,
                        accounts: _Accounts,
                        salesAccountTypes: _SalesAcctTypes,
                        purchaseAccountTypes: _PurchaseAcctTypes,
                        taxCodeCache: taxCodeCache
                    },
                    RGLLines: rglData.lines
                };
            }
        }
        
        function _GetRGLData() {
            var rglParams = {
                subsidiary: _Params.subsidiary,
                periodTo: _Params.periodTo,
                periodFrom: _Params.periodFrom,
                bookId: _Params.bookId
            };
            var rglDao = new TAF.SG.DAO.IAFRglDAO();
            var rglTotals = rglDao.getSummary(rglParams);
            var rglLines = rglDao.getList(rglParams); // Note: Unable to add count of RGL lines to saved report, so save the lines in the state instead
            rglTotals.count = rglLines ? rglLines.length-1 : 0; // Note: Summary line is included

            return {
                totals: rglTotals,
                lines: rglLines
            };
        }

        function _OnBody() {
            try {
                var globalIndex;
                var adapter = new TAF.SG.Adapter.SupplyAdapter(_State[_SupplyReport.Name].SummaryAdapterParams);
                var suppDataSummaryDao = new TAF.SG.DAO.SuppDataSummaryDao();
                suppDataSummaryDao.search(_State[_SupplyReport.Name].SummaryDaoParams);

                do {
                    globalIndex = _State[_SupplyReport.Name].Index + 1;
                    var list = suppDataSummaryDao.getList(globalIndex, globalIndex + ENTRIES_PER_PAGE);
                    if (!list) {
                        break;
                    }

                    _ProcessTransactionSummary(list, adapter);

                    if (_Job.IsThresholdReached()) {
                        return;
                    }
                } while (list.length >= ENTRIES_PER_PAGE);

                _Output.WriteLine(_Formatter.formatSupplyHeader(_State[_SupplyReport.Name].Summary));
            } catch (e) {
                nlapiLogExecution('ERROR', '_SupplyReport', e.toString());
                throw e;
            }
        }
        
        function _ProcessTransactionSummary(list, adapter) {
            var iterator = new TAF.Lib.Iterator(list);
            var line;
            var suppSummaryData;

            while (iterator.hasNext()) {

                line = iterator.next();
                if (adapter.isValidSupplyLine(line)) {
                    suppSummaryData = adapter.convertSuppSummaryData(line);
                    _State[_SupplyReport.Name].Summary.supplyTotalSGD += +((+suppSummaryData.supplyValueSGD || 0).toFixed(2));
                    _State[_SupplyReport.Name].Summary.gstTotalSGD += +((+suppSummaryData.gstValueSGD || 0).toFixed(2));
                    _State[_SupplyReport.Name].Summary.transactionCountTotal++;
                }
                _State[_SupplyReport.Name].Index++;

                if (_Job.IsThresholdReached()) {
                    return;
                }
            }
        }

        function _OnFooter() {
            _Output.WriteLine(_Formatter.formatSupplyFooter(_State[_SupplyReport.Name].Summary));
        }

        function _OnCleanUp() {
            delete _State[_SupplyReport.Name];
        }
    }
    _SupplyReport.Name = 'Supply';

    function _SupplyLines() {
        
        this.On_Init = _OnInit;
        this.On_Body = _OnBody;
        this.On_CleanUp = _OnCleanUp;
        
        function _OnInit() {
            if (!_State[_SupplyLines.Name]) {
                var taxCodeCache = TAF.DAO.TaxCodeDaoSingleton.getInstance({ countryCode: 'SG', hasSTCBundle: _HasSTCBundle }).taxCodeCache;

                _State[_SupplyLines.Name] = {
                    Index : -1,
                    AdapterState : {tranId : -1, lineNo : 0},
                    AdapterParams: {
                        isMultibook : _IsMultiBook,                    
                        isMulticurrency : _IsMultiCurrency,
                        currencyMap : _State[_IafReport.Name].CurrencyISOCodesMAP,
                        baseCurrency : _BaseCurrency,
                        companyCountry : _IsOneWorld ? _SubsidiaryInfo.getCountry() : _CompanyInfo.country,
                        isRgl: false,
                        accounts: _Accounts,
                        salesAccountTypes: _SalesAcctTypes,
                        purchaseAccountTypes: _PurchaseAcctTypes,
                        taxCodeCache: taxCodeCache
                    },
                    DaoParams: {
                        periodIds : _PeriodIdList,
                        subIds : _SubsidiaryIdList,
                        bookId : _BookId,
                        salesAccountTypes: _SalesAcctTypes,
                        purchaseAccountTypes: _PurchaseAcctTypes,
                        exludedDeferredInputAndOutput: true
                    }
                };
            }
        }
        
        function _OnBody() {
            try {
                var globalIndex;
                var supplyDao = new TAF.SG.DAO.SuppDataDao();
                var adapter = new TAF.SG.Adapter.SupplyAdapter(_State[_SupplyLines.Name].AdapterParams, _State[_SupplyLines.Name].AdapterState);
                supplyDao.search(_State[_SupplyLines.Name].DaoParams);                

                do {
                    globalIndex = _State[_SupplyLines.Name].Index + 1;
                    var list = supplyDao.getList(globalIndex, globalIndex + ENTRIES_PER_PAGE);
                    if (!list) {
                        break;
                    }
                    
                    _ProcessTransactionList(list, adapter);
                    
                    if (_Job.IsThresholdReached()) {
                        return;
                    }                
                } while (list.length >= ENTRIES_PER_PAGE);                
            } catch (e) {
                nlapiLogExecution('ERROR', '_SupplyLines', e.toString());
                throw e;
            }
            _Output.SetPercent(PROGRESS_PERCENTAGE.SUPPLY);
        }

        function _ProcessTransactionList(list, adapter) {
            var iterator = new TAF.Lib.Iterator(list);
            var line;
            var sales;

            while(iterator.hasNext()){
                line = iterator.next();

                if (adapter.isValidSupplyLine(line)) {
                    sales = adapter.convertSuppData(line);
                    _Output.WriteLine(_Formatter.formatSupplyBody(sales));
                    _State[_SupplyLines.Name].AdapterState = adapter.state;
                }
                _State[_SupplyLines.Name].Index++;

                if (_Job.IsThresholdReached()) {
                    return;
                }
            }
        }

        function _OnCleanUp() {
            delete _State[_SupplyLines.Name];
        }
    }
    _SupplyLines.Name = 'SupplyLines';
    
    // GL Data Section
    function _GLDataReport(state, params, output, job) {
        TAF.IReportSection.apply(this, arguments);
    }
    _GLDataReport.prototype = Object.create(TAF.IReportSection.prototype);
    _GLDataReport.Name = 'GLData';
    
    _GLDataReport.prototype.On_Init = function On_Init() {
        if (!_State[_GLDataReport.Name]) {
            _State[_GLDataReport.Name] = {
                Index: -1,
                Summary: {},
                Balance: 0,
                AccountId: '',
                InternalID: -1,
                GLNumber: 0,
                IsGLSupported: _IsGLSupported,
                AccountNumber: ''
            };
            var glParams = {
                periodIds : _PeriodIdList,
                subIds : _SubsidiaryIdList,
                bookId: _BookId
            };
            var summary = new TAF.SG.DAO.GeneralLedgerSummaryDao().getSummary(glParams);
            var adapter = new TAF.SG.Adapter.GeneralLedgerAdapter();

            this.periodDao = new TAF.DAO.AccountingPeriodDao();
            _State[_GLDataReport.Name].fyStartPeriod = this.getFYStartDate(_Period.Start);
            this.fyStartDate = _State[_GLDataReport.Name].fyStartPeriod;

            _State[_GLDataReport.Name].Summary = adapter.getSummary(summary, _State[_IafReport.Name].CurrencyISOCodesMAP[_BaseCurrency]);
            _State[_GLDataReport.Name].AccountMap = this.getAccountMap();
        }
    };

    _GLDataReport.prototype.getAccountMap = function _getAccountMap() {
        try {
            var reportParams = {
                subsidiary: _Params.subsidiary,
                periodFrom: this.getFYStartPeriod(this.fyStartDate),
                group: _Params.include_child_subs,
                bookId: _Params.bookId
            };
            reportParams.periodTo = reportParams.periodFrom;

            var balanceList = new TAF.DAO.OpeningBalanceDAO().getList(reportParams);
            var balances = {};
            balanceList.forEach(function(a) {this[a.internalId] = a;}, balances);
            var balanceMap = new TAF.SG.Adapter.GeneralLedgerAdapter().getBalanceMap(balances, _Accounts);
            return balanceMap;
        } catch (ex) {
            nlapiLogExecution('ERROR', '_GLDataReport.getAccountMap', ex.toString());
            throw nlapiCreateError('SEARCH_ERROR', 'Unable to search for account balances');
        }
    };

    _GLDataReport.prototype.getFYStartDate = function getFYStartDate(period) {
        var fyStartDate;
        
        if (period.GetType() === 'year') {
            fyStartDate = nlapiDateToString(period.GetStartDate());
        } else {
            var startDate = nlapiDateToString(period.GetStartDate());
            var columns = [new nlobjSearchColumn('startdate').setSort(true)];
            var filters = [
                new nlobjSearchFilter('startdate', null, 'onorbefore', startDate),
                new nlobjSearchFilter('isyear', null, 'is', 'T'),
                new nlobjSearchFilter('isinactive', null, 'is', 'F')
            ];
            
            if (SFC.Context.IsMultipleCalendar() && _Subsidiary) {
                filters.push(new nlobjSearchFilter('fiscalcalendar', null, 'is', _Subsidiary.GetFiscalCalendar()));
            }
            
            var fy = this.periodDao.searchRecords(filters, columns)[0];
            fyStartDate = (fy && fy.startDate) || 'none';
        }
        
        return fyStartDate;
    };

    _GLDataReport.prototype.getFYStartPeriod = function getFYStartPeriod(date) {
        var columns = [new nlobjSearchColumn('startdate').setSort(true)];
        var filters = [
            new nlobjSearchFilter('startdate', null, 'on', date),
            new nlobjSearchFilter('isyear', null, 'is', 'F'),
            new nlobjSearchFilter('isquarter', null, 'is', 'F'),
            new nlobjSearchFilter('isinactive', null, 'is', 'F')
        ];
        
        return this.periodDao.searchRecords(filters, columns)[0].id;
    };
    
    _GLDataReport.prototype.On_Header = function On_Header() {
        _Output.WriteLine(_Formatter.formatGeneralLedgerHeader(_State[_GLDataReport.Name].Summary));
    };
    
    _GLDataReport.prototype.On_Body = function On_Body() {
        try {
            var globalIndex;
            
            var glParams = {
                periodIds : _PeriodIdList,
                subIds : _SubsidiaryIdList,
                bookId: _BookId,
                startDate: _Period.Start.GetStartDate()
            };            if (_HasAccountingContext) {                        glParams.accountingContext = _Params.accountingContext;                 }
            var dao = new TAF.SG.DAO.GeneralLedgerDao();
            dao.search(glParams);

            var adapter = new TAF.SG.Adapter.GeneralLedgerAdapter(_State[_GLDataReport.Name]);

            do {
                globalIndex = ++_State[_GLDataReport.Name].Index;
                var list = dao.getList(globalIndex, globalIndex + ENTRIES_PER_PAGE);
                if (!list) {
                    return;
                }

                glParams.list = list;
                glParams.adapter = adapter;
                this.processGeneralLedgerList(glParams, adapter);

                if (_Job.IsThresholdReached()) {
                    return;
                }
            } while (list.length >= ENTRIES_PER_PAGE);
        } catch (ex) {
            nlapiLogExecution('ERROR', '_GLDataReport.On_Body', ex.toString());
            throw ex;
        }
        _Output.SetPercent(PROGRESS_PERCENTAGE.GL_DATA);
    };
    
    _GLDataReport.prototype.On_Footer = function On_Footer() {
        _Output.WriteLine(_Formatter.formatGeneralLedgerFooter(_State[_GLDataReport.Name].Summary));
    };

    _GLDataReport.prototype.On_CleanUp = function On_CleanUp() {
        delete _State[_GLDataReport.Name];
    };
    
    _GLDataReport.prototype.processGeneralLedgerList = function _processGeneralLedgerList(glParams, adapter) {
        var iterator = new TAF.Lib.Iterator(glParams.list);

        while (iterator.hasNext()){
            var line = iterator.next();
            this.processGeneralLedgerLine(line, glParams);
            _State[_GLDataReport.Name].Index++;
            _State[_GLDataReport.Name].InternalID = adapter.lastInternalId;
            _State[_GLDataReport.Name].GLNumber = adapter.glNumber;

            if (_Job.IsThresholdReached()) {
                return;
            }
        }
    };
    
    _GLDataReport.prototype.processGeneralLedgerLine = function _processGeneralLedgerLine(line, glParams) {
        var accountBalance = _State[_GLDataReport.Name].AccountMap[line.accountId];
        var generalLedger;

        if (!_State[_GLDataReport.Name].AccountId || _State[_GLDataReport.Name].AccountId != line.accountId) {
            // Set the balance for new accounts
            _State[_GLDataReport.Name].AccountId = line.accountId;
            _State[_GLDataReport.Name].Balance = accountBalance.balance;
            _State[_GLDataReport.Name].AccountNumber = accountBalance.accountNumber;

            //Write opening balance
            generalLedger = glParams.adapter.getOpeningBalance(accountBalance, glParams);
            _Output.WriteLine(_Formatter.formatGeneralLedgerBody(generalLedger));
        }
        //Get Global/Item account mapping contexts        line.accountName = _Accounts[line.accountId].name;        line.accountNumber = _Accounts[line.accountId].number;        line.localizedName = _Accounts[line.accountId].localizedName;        line.localizedNumber = _Accounts[line.accountId].localizedNumber;
        //Write GL line
        generalLedger = glParams.adapter.getGeneralLedger(line);        if(_Params.job_params && !_Params.job_params.hasAccountingContext) {            generalLedger.accountID = _State[_GLDataReport.Name].AccountNumber;        }
        _Output.WriteLine(_Formatter.formatGeneralLedgerBody(generalLedger));
        _State[_GLDataReport.Name].Balance = glParams.adapter.balance;
    };
    
    // SG_GLNumber_ReportSection
    function _GLNumberReport(state, params, output, job) {
        TAF.GLNumberSection.apply(this, arguments);
        this.GL_YEAR = 2017;
        this.GL_PROGRESS = 20;
    }
    _GLNumberReport.prototype = Object.create(TAF.GLNumberSection.prototype);
    _GLNumberReport.Name = 'GLNumber';

    _GLNumberReport.prototype.getPeriodIds = function _getPeriodIds() {
        return _PeriodIdList;
    };

    _GLNumberReport.prototype.getGLParams = function _getGLParams() {
        var glParams = {
            requiredGLYear   : this.GL_YEAR,
            subsidiaryIdList : _SubsidiaryIdList, 
            startDate        : _Period.Start.GetStartDate(),
            bookId           : _BookId
        };
        return glParams;
    };
    
    _GLNumberReport.prototype.getLocale = function _getLocale() {
        return _Params.job_params.CultureId;
    };
    
    _GLNumberReport.prototype.On_Header = function _On_Header() {
        _Output.SetPercent(this.GL_PROGRESS);
    };
    
    _GLNumberReport.prototype.setGLSupported = function _setGLSupported(isGLSupportedInPeriod) {
        _IsGLSupported = isGLSupportedInPeriod;
    };
    
    
    // RGL Section
    function _RGLSection(state, params, output, job) {
        TAF.IReportSection.apply(this, arguments);
    }
    _RGLSection.prototype = Object.create(TAF.IReportSection.prototype);
    _RGLSection.Name = 'RGLSection';
    
    _RGLSection.prototype.On_Init = function On_Init() {
        if (!_IsMultiCurrency) {
            return;
        }

        if (!_State[_RGLSection.Name]) {
            _State[_RGLSection.Name] = {
                rglAccount : this.getRglAccountName()
            };
        }
    };
    
    _RGLSection.prototype.getRglAccountName = function _getRglAccountName() {
        var params = {
            specialaccounttype: ['is', 'RealizedERV']
        };
        var accounts = new TAF.AccountDao().getList(params, false);
        var rglAccount = '';
        for (var key in accounts) {
            rglAccount = accounts[key].getAccountName() || '';
            break;
        }
        return rglAccount;
    };
    
    _RGLSection.prototype.On_Body = function _On_Body() {
        if (!_IsMultiCurrency) {
            return;
        }
        
        var adapterParams = {
            currency : this.getBaseCurrencySymbol(),
            rglAccountName : _State[_RGLSection.Name].rglAccount
        };
        var adapter = new TAF.SG.Adapter.RglAdapter(adapterParams);
        var rglLines = _State[_SupplyReport.Name].RGLLines;
        
        for (var i = 0; i < rglLines.length; i++) {
            var rglLine = adapter.getRglLine(rglLines[i]);
            if (rglLine) {
                _Output.WriteLine(_Formatter.formatSupplyBody(rglLine));
            }
        }
    };
    
    _RGLSection.prototype.getBaseCurrencySymbol = function _getBaseCurrencySymbol() {
        return _State[_IafReport.Name].CurrencyISOCodesMAP[_BaseCurrency];
    };
    
    _RGLSection.prototype._OnCleanUp = function _OnCleanUp() {
        delete _State[_RGLSection.Name];
    };

};


var SG_IAF_XML_Report = function _SG_IAF_XML_Report(state, params, output, job) {
    SG_IAF_Report.call(this, state, params, output, job);
    this.SetFormatter(new TAF.SG.Formatter.XML());
};
SG_IAF_XML_Report.prototype = Object.create(SG_IAF_Report.prototype);
SG_IAF_XML_Report.IsCRGReport = true;
SG_IAF_XML_Report.ReportId = 'IAF_SG_XML';

var SG_IAF_PSV_Report = function _SG_IAF_PSV_Report(state, params, output, job) {
    SG_IAF_Report.call(this, state, params, output, job);
    this.SetFormatter(new TAF.SG.Formatter.PSV());
};
SG_IAF_PSV_Report.prototype = Object.create(SG_IAF_Report.prototype);
SG_IAF_PSV_Report.IsCRGReport = true;
SG_IAF_PSV_Report.ReportId = 'IAF_SG_PSV';
