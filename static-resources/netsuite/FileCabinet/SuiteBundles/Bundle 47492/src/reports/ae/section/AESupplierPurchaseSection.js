/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.AE = TAF.AE || {};
TAF.AE.Section = TAF.AE.Section || {};

TAF.AE.Section.SupplierPurchaseSection = function _SupplierPurchaseSection(state, params, output, job) {
	TAF.AE.Section.FAFReportSection.apply(this, arguments);
	this.Name = 'SupplierPurchase';
};
TAF.AE.Section.SupplierPurchaseSection.prototype = Object.create(TAF.AE.Section.FAFReportSection.prototype);

TAF.AE.Section.SupplierPurchaseSection.prototype.On_Init = function _On_Init() {
    if (!this.state[this.Name]) {
        var taxCodeCache = TAF.DAO.TaxCodeDaoSingleton.getInstance({ countryCode: 'AE', hasSTCBundle: this.FAFReportState.HasSTCBundle }).taxCodeCache;
        var summary = new TAF.AE.Adapter.PurchaseSummary();

        summary.purchaseTotalAED = 0;
        summary.vatTotalAED = 0;
        summary.transactionCountTotal = 0;

        this.state[this.Name] = {
            Index : -1,
            Summary: summary,
            SummaryDaoParams: {
                periodIds : this.FAFReportState.PeriodIdList,
                subIds : this.FAFReportState.SubsidiaryIdList,
                bookId: this.FAFReportState.BookId,
                accountTypes: this.FAFReportState.PurchaseAcctTypes,
                exludedDeferredInputAndOutput: true
            },
            SummaryAdapterParams: {
                isMultibook : this.FAFReportState.IsMultiBook,                    
                isMulticurrency : this.FAFReportState.IsMultiCurrency,
                accounts: this.FAFReportState.Accounts,
                purchaseAccountTypes: this.FAFReportState.PurchaseAcctTypes,
                taxCodeCache: taxCodeCache
            }
        };
    }
};

TAF.AE.Section.SupplierPurchaseSection.prototype.On_Body = function _On_Body() {
    try {
        var globalIndex;
        var adapter = new TAF.AE.Adapter.PurchaseAdapter(this.state[this.Name].SummaryAdapterParams);
        var purchaseSummaryDao = new TAF.AE.DAO.PurchaseSummaryDao();
        purchaseSummaryDao.search(this.state[this.Name].SummaryDaoParams);

        do {
            globalIndex = this.state[this.Name].Index + 1;
            var list = purchaseSummaryDao.getList(globalIndex, globalIndex + this.FAFReportState.ENTRIES_PER_PAGE);
            if (!list) {
                break;
            }

            this.ProcessTransactionSummary(list, adapter);

            if (this.job.IsThresholdReached()) {
                return;
            }
        } while (list.length >= this.FAFReportState.ENTRIES_PER_PAGE);

        this.output.WriteLine(this.FAFReportState.Formatter.formatPurchaseHeader(this.state[this.Name].Summary));
    } catch (e) {
        nlapiLogExecution('ERROR', 'TAF.AE.Section.SupplierPurchaseSection.On_Body', e.toString());
        throw e;
    }
};

TAF.AE.Section.SupplierPurchaseSection.prototype.On_Footer = function _On_Footer() {
    this.output.WriteLine(this.FAFReportState.Formatter.formatPurchaseTotal(this.state[this.Name].Summary));
};

TAF.AE.Section.SupplierPurchaseSection.prototype.On_CleanUp = function _On_CleanUp() {
    delete this.state[this.Name];
};

TAF.AE.Section.SupplierPurchaseSection.prototype.ProcessTransactionSummary = function _ProcessTransactionSummary(list, adapter) {
    var iterator = new TAF.Lib.Iterator(list);

    while (iterator.hasNext()) {
        var line;
        var purchaseSummaryData;

        line = iterator.next();
        if (adapter.isValidPurchaseLine(line)) {
            purchaseSummaryData = adapter.convertSummary(line);
            this.state[this.Name].Summary.purchaseTotalAED += +((+purchaseSummaryData.purchaseValueAED || 0).toFixed(2));
            this.state[this.Name].Summary.vatTotalAED += +((+purchaseSummaryData.vatValueAED || 0).toFixed(2));

            if(this.state[this.Name].currentTranId != line.id) {
            	this.state[this.Name].Summary.transactionCountTotal++;
            }
            this.state[this.Name].currentTranId = line.id;
        }
        this.state[this.Name].Index++;

        if (this.job.IsThresholdReached()) {
            return;
        }
    }
};

TAF.AE.Section.SupplierPurchaseLinesSection = function _SupplierPurchaseLinesSection(state, params, output, job) {
	TAF.AE.Section.FAFReportSection.apply(this, arguments);
	this.Name = 'SupplierPurchaseLines';
};
TAF.AE.Section.SupplierPurchaseLinesSection.prototype = Object.create(TAF.AE.Section.FAFReportSection.prototype);

TAF.AE.Section.SupplierPurchaseLinesSection.prototype.On_Init = function _On_Init() {
    if (!this.state[this.Name]) {
        var taxCodeCache = TAF.DAO.TaxCodeDaoSingleton.getInstance({ countryCode: 'AE', hasSTCBundle: this.HasSTCBundle }).taxCodeCache;

        this.state[this.Name] = {
            Index : -1,
            AdapterState: {tranId : -1, lineNo : 0},
            taxCodeCache: taxCodeCache,
            AdapterParams: {
                isMultibook : this.FAFReportState.IsMultiBook,
                isMulticurrency : this.FAFReportState.IsMultiCurrency,
                currencyMap : this.FAFReportState.CurrencyISOCodesMAP,
                baseCurrency : this.FAFReportState.BaseCurrency,
                taxCodeCache: taxCodeCache
            },
            DaoParams: {
                periodIds : this.FAFReportState.PeriodIdList,
                subIds : this.FAFReportState.SubsidiaryIdList,
                bookId : this.FAFReportState.BookId,
                accountTypes: this.FAFReportState.PurchaseAcctTypes,
                exludedDeferredInputAndOutput: true,
                accountingContext: this.params.accountingContext || '@NONE@'
            },
            entityCountryMap: {}
        };
    }
};

TAF.AE.Section.SupplierPurchaseLinesSection.prototype.On_Body = function _On_Body() {
    try {
        var globalIndex;
        var adapter = new TAF.AE.Adapter.PurchaseAdapter(this.state[this.Name].AdapterParams, this.state[this.Name].AdapterState);
        var purchaseDao = new TAF.AE.DAO.PurchaseDao();
        purchaseDao.search(this.state[this.Name].DaoParams);
        
        do {
            globalIndex = this.state[this.Name].Index + 1;
            var list = purchaseDao.getList(globalIndex, globalIndex + this.FAFReportState.ENTRIES_PER_PAGE);
            if (!list) {
                break;
            }
            
            this.ProcessTransactionList(list, adapter);
            
            if (this.job.IsThresholdReached()) {
                return;
            }
        } while (list.length >= this.FAFReportState.ENTRIES_PER_PAGE);
    } catch (e) {
        nlapiLogExecution('ERROR', 'TAF.AE.Section.SupplierPurchaseLinesSection.On_Body', e.toString());
        throw e;
    }
    this.output.SetPercent(this.FAFReportState.PROGRESS_PERCENTAGE.PURCHASE);
};

TAF.AE.Section.SupplierPurchaseLinesSection.prototype.On_CleanUp = function _On_CleanUp() {
    delete this.state[this.Name];
};

TAF.AE.Section.SupplierPurchaseLinesSection.prototype.ProcessTransactionList = function _ProcessTransactionList(list, adapter) {
    var iterator = new TAF.Lib.Iterator(list);
    var line;
    var purchase;
    var vendorId;
    
    if(iterator.hasNext()) {
        while(iterator.hasNext()){
        	line = iterator.next();
        	vendorId = line.recordType == 'expensereport' ? line.employeeId : line.vendorLineId || line.vendorId;

            if (adapter.isValidPurchaseLine(line)) {
                purchase = adapter.convertPurchase(line);
                
                //Get supplier country if txn line emirate is blank
                if(!this.state[this.Name].entityCountryMap.hasOwnProperty(vendorId) && !line.aeEmirate) {
                	this.state[this.Name].entityCountryMap[vendorId] =  this.GetEntityCountry(vendorId);
                }
                purchase.supplierCountry = purchase.supplierCountry || this.state[this.Name].entityCountryMap[vendorId] || '';
                
                this.output.WriteLine(this.FAFReportState.Formatter.formatPurchaseBody(purchase));
                this.state[this.Name].AdapterState = adapter.state;
            }
            this.state[this.Name].Index++;
            
            if (this.job.IsThresholdReached()) {
                return;
            }
        }
    } else {
    	this.output.WriteLine('');
    }
};