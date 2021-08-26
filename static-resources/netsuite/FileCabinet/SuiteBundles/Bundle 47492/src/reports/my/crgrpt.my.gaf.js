/**
 * Copyright © 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 */ 

var STATE_NAME = {
    FOOTER: 'Footer',
    COMMON: 'Common'
};

var ENTRIES_PER_PAGE = 1000;
var PROGRESS_PERCENTAGE = {
    COMPANY: 10,
    PURCHASE: 20,
    SUPPLY_NON_RGL: 35,
    SUPPLY_RGL: 45,
    SUPPLY: 50,
    LEDGER: 70,
    FOOTER: 90
};

function MY_GAF_Report(state, params, output, job) {
    var context = nlapiGetContext();
    params.isOneWorld = context.getFeature('SUBSIDIARIES');    var acctParams = params.isOneWorld ? {subsidiary: ['anyof', params.subsidiary]} : {};    if(params.job_params && params.job_params.hasAccountingContext) {        acctParams.accountingcontext = ['is', params.accountingContext];    }    params.accounts = new TAF.AccountDao().getList(acctParams, false);

    this.outline = {
        'Section': report,
        'SubSections': [
            {'Section': company},
            {'Section': purchase},
            {
                'Section': supply,
                'SubSections': [
                    {'Section': supplyLines},
                    {'Section': supplyRGL}
                ],
            },
            {'Section': ledger},
            {'Section': footer}
        ]
    };
    this.GetOutline = function() { return this.outline; };
    
    function report() {
        return new MY_GAF_ReportSection(state, params, output, job);
    }
    
    function company() {
        return new MY_GAF_CompanySection(state, params, output, job);
    }
    
    function purchase() {
        return new MY_GAF_PurchaseSection(state, params, output, job);
    }
    
    function supply() {
        return new MY_GAF_SupplySection(state, params, output, job);
    }
    
    function supplyLines() {
        return new MY_GAF_SupplyLinesSection(state, params, output, job);
    }
    
    function supplyRGL() {
        return new MY_GAF_SupplyRGLSection(state, params, output, job);
    }
    
    function ledger() {
        return new MY_GAF_GLSection(state, params, output, job);
    }
    
    function footer() {
        return new MY_GAF_FooterSection(state, params, output, job);
    }
}

//Report Section - Report Body
function MY_GAF_ReportSection(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.Name = 'Malaysia GAF';
}

MY_GAF_ReportSection.prototype = Object.create(TAF.IReportSection.prototype);

MY_GAF_ReportSection.prototype.On_Init = function() {
    if (!this.state[STATE_NAME.FOOTER]) {
        this.state[STATE_NAME.FOOTER] = {
            purchaseLines : 0,
            purchaseTotalAmount : 0,
            purchaseGstTotalAmount : 0,
            supplyLines : 0,
            supplyTotalAmount : 0,
            supplyGstTotalAmount : 0,
            ledgerLines : 0,
            ledgerDebit : 0,
            ledgerCredit : 0,
            ledgerBalance : 0
        };
    }
    
    var context = nlapiGetContext();
    this.isOneWorld = context.getFeature('SUBSIDIARIES');
    this.isMultiCurrency = context.getFeature('MULTICURRENCY');
    this.isMultiBook = context.getFeature('MULTIBOOK');
    var netsuiteVersion = context.getVersion();

    if (!this.state[STATE_NAME.COMMON]) {
        var periodIds = new TAF.DAO.AccountingPeriodDao().getCoveredPeriodIds(this.params.periodFrom, this.params.periodTo);
        var subIds = [this.params.subsidiary];
        var currencyMap = this.isMultiCurrency ? new TAF.DAO.CurrencyDao().currencyMap : {};
        var startPeriod = new TAF.DAO.AccountingPeriodDao().getPeriodById(this.params.periodFrom);
        var endPeriod = new TAF.DAO.AccountingPeriodDao().getPeriodById(this.params.periodTo);
        var companyObject = new TAF.DAO.CompanyDao().getInfo();
        var companyInfo = this.getCompanyInfo();
        var subsidiaryObject = {};
        if (this.isOneWorld) {
            subsidiaryObject = new TAF.DAO.SubsidiaryDao().getSubsidiaryById(this.params.subsidiary);
        }
        var taxAccountDao = new TAF.MY.DAO.TaxAccountDao();
        var purchaseAccounts = taxAccountDao.getList('purchase');
        var salesAccounts = taxAccountDao.getList('sale');
        var accountingBook = this.getAccountingBook();
        var bookId = (accountingBook && !accountingBook.isPrimary) ? accountingBook.id : '';
        
        if (context.getFeature('MULTIPLECALENDARS')) {
            this.validateAccountingPeriods(this.params.periodTo, subsidiaryObject.fiscalCalendar);
        }
        
        this.state[STATE_NAME.COMMON] = {
            isOneWorld: this.isOneWorld,
            isMultiCurrency: this.isMultiCurrency,
            periodFrom: this.params.periodFrom,
            periodTo: this.params.periodTo,
            periodIds: periodIds,
            subIds: subIds,
            companyCountry: companyInfo.country,
            companyCountryName: companyInfo.countryName,
            baseCurrency: companyInfo.baseCurrency,
            currencyMap: currencyMap,
            startPeriod: startPeriod,
            endPeriod: endPeriod,
            netsuiteVersion: netsuiteVersion,
            subsidiaryObject : subsidiaryObject,
            companyObject : companyObject,
            purchaseAccounts: purchaseAccounts,
            salesAccounts: salesAccounts,
            isMultiBook: this.isMultiBook,
            bookId: bookId,
            rglTaxCode: '',
        };

    }
};

MY_GAF_ReportSection.prototype.On_Header = function() {
    if (this.formatter.isXML) {
        this.output.WriteLine(this.formatter.formatReportHeader());
    }
};

MY_GAF_ReportSection.prototype.On_Body = function() {
};

MY_GAF_ReportSection.prototype.On_Footer = function() {
    if (this.formatter.isXML) {
        this.output.WriteLine(this.formatter.formatReportFooter());
    }
};

MY_GAF_ReportSection.prototype.getCompanyInfo = function _getCompanyInfo() {
    var dao = null;
    var info = {
        baseCurrency: '',
        country: '',
        countryName: ''
    };
    if (this.isOneWorld) {
        dao = new TAF.DAO.SubsidiaryDao();
        var subsidiaryInfo = dao.getSubsidiaryInfo({subsidiary: this.params.subsidiary, bookId: this.params.bookId});
        info.baseCurrency = subsidiaryInfo.getAccountingBookCurrency() || subsidiaryInfo.getCurrency() || '';
        info.country = subsidiaryInfo.getCountryCode();
        info.countryName = subsidiaryInfo.getCountry();
    } else {
        dao = new TAF.DAO.CompanyDao();
        var companyInfo = dao.getInfo();
        info.baseCurrency = companyInfo.currency;
        info.country = companyInfo.country;
    }
    return info;
};


//Report Section - Company
function MY_GAF_CompanySection(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.Name = 'Company';
}

MY_GAF_CompanySection.prototype = Object.create(TAF.IReportSection.prototype);

MY_GAF_CompanySection.prototype.On_Body = function() {
    var companyParams = {
        startPeriod : this.state[STATE_NAME.COMMON].startPeriod,
        endPeriod : this.state[STATE_NAME.COMMON].endPeriod,
        createdDate : this.params.dateCreated,
        netsuiteVersion : this.state[STATE_NAME.COMMON].netsuiteVersion,
        isOneWorld : this.state[STATE_NAME.COMMON].isOneWorld
    };
    
    if (companyParams.isOneWorld) {
        companyParams.subsidiary = this.state[STATE_NAME.COMMON].subsidiaryObject;
    } else {
        companyParams.company = this.state[STATE_NAME.COMMON].companyObject;
    }
    
    var companyLine = new TAF.MY.Adapter.CompanyAdapter().getCompany(companyParams);
    this.output.WriteLine(this.formatter.formatCompanyLine(companyLine));
};

MY_GAF_CompanySection.prototype.On_Footer = function() {
    this.output.SetPercent(PROGRESS_PERCENTAGE.COMPANY);
};


//Report Section - Purchase
function MY_GAF_PurchaseSection(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.Name = 'Purchase';
}

MY_GAF_PurchaseSection.prototype = Object.create(TAF.IReportSection.prototype);

MY_GAF_PurchaseSection.prototype.On_Init = function() {
    if (!this.state[this.Name]) {
        this.state[this.Name] = {
            index : 0,
            AdapterState : {tranId : -1, lineNo : 0}
        };
    }
};

MY_GAF_PurchaseSection.prototype.On_Header = function() {
    if (this.formatter.isXML) {
        this.output.WriteLine(this.formatter.formatPurchaseHeader());
    }
};

MY_GAF_PurchaseSection.prototype.On_Body = function() {
    try {
        var globalIndex = -1;
        var params = {
            totals: this.state[STATE_NAME.FOOTER],  
            isMultiCurrency: this.state[STATE_NAME.COMMON].isMultiCurrency,
            currencyMap: this.state[STATE_NAME.COMMON].currencyMap,
            baseCurrency: this.state[STATE_NAME.COMMON].baseCurrency,
            periodIdList: this.state[STATE_NAME.COMMON].periodIds,
            subsidiaryIdList: this.state[STATE_NAME.COMMON].subIds,
            isOneWorld: this.state[STATE_NAME.COMMON].isOneWorld,
            isMultiBook : this.state[STATE_NAME.COMMON].isMultiBook,
            bookId : this.state[STATE_NAME.COMMON].bookId
        };
        var adapter = new TAF.MY.Adapter.PurchaseAdapter(params, this.state[this.Name].AdapterState);
        var journalDao = new TAF.MY.DAO.JournalEntryDao();
        var dao = new TAF.MY.DAO.PurchaseDao();
        dao.search(params);

        do {
            globalIndex = this.state[this.Name].index;
            var list = dao.getList(globalIndex, globalIndex + ENTRIES_PER_PAGE);
            if (!list) {
                break;
            }
            
            this.processTransactionList(list, adapter, journalDao);
            
            if (this.job.IsThresholdReached()) {
                break;
            }
        } while (list.length >= ENTRIES_PER_PAGE);
        
        this.state[STATE_NAME.FOOTER] = adapter.totals;
        
    } catch (ex) {
        nlapiLogExecution('ERROR', 'MY_GAF_PurchaseSection', ex.toString());
        throw ex;
    }
    
};

MY_GAF_PurchaseSection.prototype.processTransactionList = function _processTransactionList(list, adapter, journalDao) {
    var iterator = new TAF.Lib.Iterator(list);
    
    while(iterator.hasNext()){
        var searchResultLine = iterator.next();
        if (this.isPurchaseTxn(journalDao, searchResultLine)) {
            var purchaseLine = adapter.getPurchase(searchResultLine);
            this.output.WriteLine(this.formatter.formatPurchaseLine(purchaseLine));
            this.state[this.Name].AdapterState = adapter.state;
        }
        
        this.state[this.Name].index++;
        if (this.job.IsThresholdReached()) {
            return;
        }            
    }
};

MY_GAF_PurchaseSection.prototype.isPurchaseTxn = function _isPurchaseTxn(journalDao, searchResultLine) {
    if (!searchResultLine) {
        return false;
    }
    
    if (searchResultLine.isJournal) {
        var journalObj = journalDao.getLine(searchResultLine.id, searchResultLine.lineSequenceNo, searchResultLine.internalRecordType);
        if (this.state[STATE_NAME.COMMON].purchaseAccounts.indexOf(journalObj.taxAccount) == -1) {
            return false;
        } 
    } 
    
    return true;
};

MY_GAF_PurchaseSection.prototype.On_Footer = function() {
    if (this.formatter.isXML) {
        this.output.WriteLine(this.formatter.formatPurchaseFooter());
    }
    this.output.SetPercent(PROGRESS_PERCENTAGE.PURCHASE);
};

MY_GAF_PurchaseSection.prototype.On_CleanUp = function() {
    delete this.state[this.Name];
};



//Report Section - Supply
function MY_GAF_SupplySection(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.Name = 'Supply';
}

MY_GAF_SupplySection.prototype = Object.create(TAF.IReportSection.prototype);

MY_GAF_SupplySection.prototype.On_Header = function() {
    if (this.formatter.isXML) {
        this.output.WriteLine(this.formatter.formatSupplyHeader());
    }
};

MY_GAF_SupplySection.prototype.On_Footer = function() {
    if (this.formatter.isXML) {
        this.output.WriteLine(this.formatter.formatSupplyFooter());
    }
    
    this.output.SetPercent(PROGRESS_PERCENTAGE.SUPPLY);
};



//Report Section - SupplyLines
function MY_GAF_SupplyLinesSection(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.Name = 'SupplyLines';
}

MY_GAF_SupplyLinesSection.prototype = Object.create(TAF.IReportSection.prototype);

MY_GAF_SupplyLinesSection.prototype.On_Init = function() {
    if (!this.state[this.Name]) {
        this.state[this.Name] = {
            index: 0,
            internalId: null,
            lineNumber: 0
        };
    }
    if(!this.state[this.Name].rglTaxCode){
        var tcDao = new TAF.MY.DAO.TaxCodeDao();
        var params = {bookId: this.state[STATE_NAME.COMMON].bookId};
        
        this.state[this.Name].rglTaxCode = tcDao.getRglTaxCode(params);
    }
};


MY_GAF_SupplyLinesSection.prototype.On_Body = function() {
    try {
        var globalIndex = -1;
        var adapter = new TAF.MY.Adapter.SupplyAdapter(this.state, this.Name);
        var journalDao = new TAF.MY.DAO.JournalEntryDao();
        var dao = new TAF.MY.DAO.SupplyLinesDao();
        dao.search({
            periodIds: this.state[STATE_NAME.COMMON].periodIds,
            subIds: this.state[STATE_NAME.COMMON].subIds,
            bookId: this.state[STATE_NAME.COMMON].bookId
        });
        
        do {
            globalIndex = this.state[this.Name].index;
            var list = dao.getList(globalIndex, globalIndex + ENTRIES_PER_PAGE);
            
            if (!list) {
                break;
            }
            
            this.processList(list, adapter, journalDao);
            
            if (this.job.IsThresholdReached()) {
                return;
            }                
        } while (list.length >= ENTRIES_PER_PAGE);                
    } catch (e) {
        nlapiLogExecution('ERROR', 'SupplyLinesSection', e.toString());
        throw e;
    }
};

MY_GAF_SupplyLinesSection.prototype.On_Footer = function() {
    this.output.SetPercent(PROGRESS_PERCENTAGE.SUPPLY_NON_RGL);
};

MY_GAF_SupplyLinesSection.prototype.processList = function _processList(list, adapter, journalDao) {
    var iterator = new TAF.Lib.Iterator(list);
    
    while(iterator.hasNext()){
        var line = iterator.next();
        if (this.isSalesTxn(journalDao, line)) {
            var supply = adapter.getSupply(line);
            this.output.WriteLine(this.formatter.formatSupplyLine(supply));
        }
        
        this.state[this.Name].index++;
        if (this.job.IsThresholdReached()) {
            return;
        }
    }
};

MY_GAF_SupplyLinesSection.prototype.isSalesTxn = function _isSalesTxn(journalDao, searchResultLine) {
    if (!searchResultLine) {
        return false;
    }
    
    if (searchResultLine.isJournal) {
        var journalObj = journalDao.getLine(searchResultLine.id, searchResultLine.lineSequenceNo,  searchResultLine.internalRecordType);
        if (this.state[STATE_NAME.COMMON].salesAccounts.indexOf(journalObj.taxAccount) == -1) {
            return false;
        } 
    } 
    
    return true;
};


//Report Section - SupplyRGL
function MY_GAF_SupplyRGLSection(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.Name = 'SupplyRGL';
}

MY_GAF_SupplyRGLSection.prototype = Object.create(TAF.IReportSection.prototype);

MY_GAF_SupplyRGLSection.prototype.On_Init = function() {
    if (!this.state[this.Name]) {
        this.state[this.Name] = {
            index: 0,
            internalId: null,
        };
    }
    
    if (this.state[STATE_NAME.COMMON].isMultiCurrency) {
        this.state[this.Name].rglAccount = this.getRglAccountName();
    }

    if(!this.state[this.Name].rglTaxCode){
        var tcDao = new TAF.MY.DAO.TaxCodeDao();
        var params = {bookId: this.state[STATE_NAME.COMMON].bookId};
        
        this.state[this.Name].rglTaxCode = tcDao.getRglTaxCode(params);
    }
};

MY_GAF_SupplyRGLSection.prototype.getRglAccountName = function _getRglAccountName() {
    var accountingBook = this.getAccountingBook();
    var isSCOA = !accountingBook || accountingBook.isPrimary;
    var params = {
        specialaccounttype: ['is', 'RealizedERV']
    };
    if (this.state[STATE_NAME.COMMON].isOneWorld) {
        params.subsidiary = ['is', this.state[STATE_NAME.COMMON].subIds[0]];
    }
    var accounts = new TAF.AccountDao().getList(params, isSCOA);
    var accountIds = accounts ? Object.keys(accounts) : [];
    var name =  accountIds.length > 0 ? accounts[accountIds[0]].getAccountName() : '';
    return name;
};

MY_GAF_SupplyRGLSection.prototype.On_Body = function() {
    if (!this.state[STATE_NAME.COMMON].isMultiCurrency) {
        return;
    }
    
    try {
        var adapter = new TAF.MY.Adapter.RglAdapter(this.state, this.Name);
        var rglParams = {
            subsidiary: this.state[STATE_NAME.COMMON].subIds[0],
            periodTo: this.state[STATE_NAME.COMMON].periodTo,
            periodFrom: this.state[STATE_NAME.COMMON].periodFrom,
            bookId: this.state[STATE_NAME.COMMON].bookId
        };
        var rglDao = new TAF.MY.DAO.GAFRglDAO();
        var list = rglDao.getList(rglParams);
        
        if (list) {
            this.processList(list, adapter);
        }
    } catch (e) {
        nlapiLogExecution('ERROR', 'SupplyRglSection', e.toString());
        throw e;
    }
};

MY_GAF_SupplyRGLSection.prototype.On_Footer = function() {
    this.output.SetPercent(PROGRESS_PERCENTAGE.SUPPLY_RGL);
};

MY_GAF_SupplyRGLSection.prototype.processList = function _processList(list, adapter) {
    var iterator = new TAF.Lib.Iterator(list);
    
    while(iterator.hasNext()){
        var line = iterator.next();
        var supply = adapter.getSupply(line);
        this.output.WriteLine(this.formatter.formatSupplyLine(supply));
        this.state[this.Name].index++;
        
        if (this.job.IsThresholdReached()) {
            return;
        }
    }
};



//Report Section - GL
function MY_GAF_GLSection(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.Name = 'Ledger';
    this.SAVED_REPORT = 'TAF Trial Balance';
}

MY_GAF_GLSection.prototype = Object.create(TAF.IReportSection.prototype);

MY_GAF_GLSection.prototype.On_Init = function() {
    if (!this.state[this.Name]) {
        this.state[this.Name] = {
            index : 0,
            balances : this.getOpeningBalances()
        };
    }
    
    this.totals = this.state[STATE_NAME.FOOTER];
};

MY_GAF_GLSection.prototype.getOpeningBalances = function() {
    var periodDao = new TAF.DAO.AccountingPeriodDao();
    var periodRange = periodDao.getPeriodRangeBeforePeriod(this.params.periodFrom);
    var balances = {};
    
    if (periodRange && periodRange.from && periodRange.from.id && periodRange.to && periodRange.to.id) {
        var dao = new TAF.DAO.TrialBalanceDao();
        var params = {
            periodFrom : periodRange.from.id,
            periodTo   : periodRange.to.id,
            reportName : this.SAVED_REPORT
        };
        if (this.params.isOneWorld) {
            params.subsidiary = this.params.subsidiary;
        }
        if (this.state[STATE_NAME.COMMON].isMultiBook && this.state[STATE_NAME.COMMON].bookId) {
            params.bookId = this.state[STATE_NAME.COMMON].bookId;
        }

        var balanceList = dao.getTrialBalance(params);
        balances = new TAF.MY.Adapter.TrialBalanceAdapter().getOpeningBalanceObject(balanceList);
    }
    
    return balances;
};

MY_GAF_GLSection.prototype.On_Header = function() {
    if (this.formatter.isXML) {
        this.output.WriteLine(this.formatter.formatGLHeader());
    }
};

MY_GAF_GLSection.prototype.On_Body = function() {
    try {
        var glDaoParams = {
            periodIds : this.state[STATE_NAME.COMMON].periodIds,
            subIds : this.params.subsidiary,
            bookId: this.state[STATE_NAME.COMMON].bookId
        };
        var dao = new TAF.MY.DAO.GeneralLedgerDao();
        var periodFrom = new TAF.DAO.AccountingPeriodDao().getPeriodById(this.params.periodFrom);
        var glAdapterParams = {
            totals : this.state[STATE_NAME.FOOTER],
            balances : this.state[this.Name].balances,
            startDate : periodFrom.startDate,
            accounts : this.params.accounts
        };

        dao.search(glDaoParams);
        var adapter = new TAF.MY.Adapter.GeneralLedgerAdapter(glAdapterParams);
        var globalIndex = -1;
        
        do {
            globalIndex = this.state[this.Name].index;
            var list = dao.getList(globalIndex, globalIndex + ENTRIES_PER_PAGE);
            if (!list) {
                break;
            }
            
            this.processGLTransactionList(list, adapter);

            if (this.job.IsThresholdReached()) {
                break;
            }
        } while (list.length >= ENTRIES_PER_PAGE);
        
        this.state[STATE_NAME.FOOTER] = adapter.totals;
        this.state[this.Name].balances = adapter.balances;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'MY_GAF_GLSection', ex.toString());
        throw ex;
    }
};

MY_GAF_GLSection.prototype.processGLTransactionList = function(list, adapter) {
    var iterator = new TAF.Lib.Iterator(list);
    
    while(iterator.hasNext()){
        var line = iterator.next();
        
        if (!adapter.balances[line.accountId]) {
            adapter.balances[line.accountId] = {
                amount : 0,
                isDisplayed : false
            };
        }
        
        if (!adapter.balances[line.accountId].isDisplayed) {
            var balanceLine = adapter.getOpeningBalanceLine(line);
            this.output.WriteLine(this.formatter.formatGLLine(balanceLine));
            adapter.balances[line.accountId].isDisplayed = true;
        }
        
        var glLine = adapter.getGeneralLedger(line);
        this.output.WriteLine(this.formatter.formatGLLine(glLine));
        this.state[this.Name].index++;
    }
};

MY_GAF_GLSection.prototype.On_Footer = function() {
    if (this.formatter.isXML) {
        this.output.WriteLine(this.formatter.formatGLFooter());
    }
    this.output.SetPercent(PROGRESS_PERCENTAGE.LEDGER);
};

MY_GAF_GLSection.prototype.On_CleanUp = function() {
    delete this.state[this.Name];
};

//Report Section - Footer
function MY_GAF_FooterSection(state, params, output, job) {
    TAF.IReportSection.apply(this, arguments);
    this.Name = 'FooterSection';
}

MY_GAF_FooterSection.prototype = Object.create(TAF.IReportSection.prototype);

MY_GAF_FooterSection.prototype.On_Header = function() {
    if (this.formatter.isXML) {
        this.output.WriteLine(this.formatter.formatFooterHeader());
    }
};

MY_GAF_FooterSection.prototype.On_Body = function() {
    this.output.WriteLine(this.formatter.formatFooterLine(this.state[STATE_NAME.FOOTER]));
};

MY_GAF_FooterSection.prototype.On_Footer = function() {
    if (this.formatter.isXML) {
        this.output.WriteLine(this.formatter.formatFooterFooter());
    }
    this.output.SetPercent(PROGRESS_PERCENTAGE.FOOTER);
};

//CRG Reports
var MY_GAF_XML_Report = function _MY_GAF_XML_Report(state, params, output, job) {
    params.formatter = new TAF.MY.Formatter.XML();
    MY_GAF_Report.call(this, state, params, output, job);
};
MY_GAF_XML_Report.prototype = Object.create(MY_GAF_Report.prototype);
MY_GAF_XML_Report.IsCRGReport = true;
MY_GAF_XML_Report.ReportId = 'MY_GAF_XML';

var MY_GAF_TXT_Report = function _MY_GAF_TXT_Report(state, params, output, job) {
    params.formatter = new TAF.MY.Formatter.TXT();
    MY_GAF_Report.call(this, state, params, output, job);
};
MY_GAF_TXT_Report.prototype = Object.create(MY_GAF_Report.prototype);
MY_GAF_TXT_Report.IsCRGReport = true;
MY_GAF_TXT_Report.ReportId = 'MY_GAF_TXT';
