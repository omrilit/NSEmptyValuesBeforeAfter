/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.AE = TAF.AE || {};
TAF.AE.Section = TAF.AE.Section || {};

TAF.AE.Section.CustomerSupplySection = function _CustomerSupplySection(state, params, output, job) {
	TAF.AE.Section.FAFReportSection.apply(this, arguments);
	this.Name = 'CustomerSupply';
};
TAF.AE.Section.CustomerSupplySection.prototype = Object.create(TAF.AE.Section.FAFReportSection.prototype);

TAF.AE.Section.CustomerSupplySection.prototype.On_Init = function _On_Init() {
    if (!this.state[this.Name]) {
        var taxCodeCache = TAF.DAO.TaxCodeDaoSingleton.getInstance({ countryCode: 'AE', hasSTCBundle: this.FAFReportState.HasSTCBundle }).taxCodeCache;
        var convertedSummary = new TAF.AE.Adapter.CustomerSupplySummary();

        convertedSummary.supplyTotalAED = 0;
        convertedSummary.vatTotalAED = 0;
        convertedSummary.transactionCountTotal = 0;
        
        this.state[this.Name] = {
            Index: -1,
            Summary: convertedSummary,
            SummaryDaoParams: {
                periodIds : this.FAFReportState.PeriodIdList,
                subIds : this.FAFReportState.SubsidiaryIdList,
                bookId: this.FAFReportState.BookId,
                salesAccountTypes: this.FAFReportState.SalesAcctTypes,
                purchaseAccountTypes: this.FAFReportState.PurchaseAcctTypes,
                exludedDeferredInputAndOutput: true
            },
            SummaryAdapterParams: {
                isMultibook : this.FAFReportState.IsMultiBook,                    
                isMulticurrency : this.FAFReportState.IsMultiCurrency,
                accounts: this.FAFReportState.Accounts,
                salesAccountTypes: this.FAFReportState.SalesAcctTypes,
                purchaseAccountTypes: this.FAFReportState.PurchaseAcctTypes,
                taxCodeCache: taxCodeCache
            }
        };
    }
};

TAF.AE.Section.CustomerSupplySection.prototype.On_Body = function _On_Body() {
    try {
        var globalIndex;
        var adapter = new TAF.AE.Adapter.CustomerSupplyAdapter(this.state[this.Name].SummaryAdapterParams);
        var customerSupplySummaryDao = new TAF.AE.DAO.CustomerSupplySummaryDao();
        customerSupplySummaryDao.search(this.state[this.Name].SummaryDaoParams);

        do {
            globalIndex = this.state[this.Name].Index + 1;
            var list = customerSupplySummaryDao.getList(globalIndex, globalIndex + this.FAFReportState.ENTRIES_PER_PAGE);
            if (!list) {
                break;
            }

            this.ProcessTransactionSummary(list, adapter);

            if (this.job.IsThresholdReached()) {
                return;
            }
        } while (list.length >= this.FAFReportState.ENTRIES_PER_PAGE);

        this.output.WriteLine(this.FAFReportState.Formatter.formatSupplyHeader(this.state[this.Name].Summary));
    } catch (e) {
        nlapiLogExecution('ERROR', 'TAF.AE.Section.CustomerSupplySection.On_Body', e.toString());
        throw e;
    }
};

TAF.AE.Section.CustomerSupplySection.prototype.On_Footer = function _On_Footer() {
    this.output.WriteLine(this.FAFReportState.Formatter.formatSupplyTotal(this.state[this.Name].Summary));
};

TAF.AE.Section.CustomerSupplySection.prototype.On_CleanUp = function _On_CleanUp() {
    delete this.state[this.Name];
};

TAF.AE.Section.CustomerSupplySection.prototype.ProcessTransactionSummary = function _ProcessTransactionSummary(list, adapter) {
    var iterator = new TAF.Lib.Iterator(list);
    var line;
    var suppSummaryData;

    while (iterator.hasNext()) {

        line = iterator.next();
        if (adapter.isValidCustomerSupplyLine(line)) {
            suppSummaryData = adapter.convertSummary(line);
            this.state[this.Name].Summary.supplyTotalAED += +((+suppSummaryData.supplyValueAED || 0).toFixed(2));
            this.state[this.Name].Summary.vatTotalAED += +((+suppSummaryData.vatValueAED || 0).toFixed(2));

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

TAF.AE.Section.CustomerSupplyLinesSection = function _CustomerSupplyLinesSection(state, params, output, job) {
	TAF.AE.Section.FAFReportSection.apply(this, arguments);
	this.Name = 'CustomerSupplyLines';
};
TAF.AE.Section.CustomerSupplyLinesSection.prototype = Object.create(TAF.AE.Section.FAFReportSection.prototype);

TAF.AE.Section.CustomerSupplyLinesSection.prototype.On_Init = function _On_Init() {
    if (!this.state[this.Name]) {
        var taxCodeCache = TAF.DAO.TaxCodeDaoSingleton.getInstance({ countryCode: 'AE', hasSTCBundle: this.HasSTCBundle }).taxCodeCache;

        this.state[this.Name] = {
            Index : -1,
            AdapterState : {tranId : -1, lineNo : 0},
            AdapterParams: {
                isMultibook : this.FAFReportState.IsMultiBook,                    
                isMulticurrency : this.FAFReportState.IsMultiCurrency,
                currencyMap : this.FAFReportState.CurrencyISOCodesMAP,
                baseCurrency : this.FAFReportState.BaseCurrency,
                accounts: this.FAFReportState.Accounts,
                salesAccountTypes: this.FAFReportState.SalesAcctTypes,
                purchaseAccountTypes: this.FAFReportState.PurchaseAcctTypes,
                taxCodeCache: taxCodeCache
            },
            DaoParams: {
                periodIds : this.FAFReportState.PeriodIdList,
                subIds : this.FAFReportState.SubsidiaryIdList,
                bookId : this.FAFReportState.BookId,
                salesAccountTypes: this.FAFReportState.SalesAcctTypes,
                purchaseAccountTypes: this.FAFReportState.PurchaseAcctTypes,
                exludedDeferredInputAndOutput: true,
                accountingContext: this.params.accountingContext || '@NONE@'
            },
            entityCountryMap: {}
        };
    }
};

TAF.AE.Section.CustomerSupplyLinesSection.prototype.On_Body = function _On_Body() {
    try {
        var globalIndex;
        var customerSupplyDao = new TAF.AE.DAO.CustomerSupplyDao();
        var adapter = new TAF.AE.Adapter.CustomerSupplyAdapter(this.state[this.Name].AdapterParams, this.state[this.Name].AdapterState);
        customerSupplyDao.search(this.state[this.Name].DaoParams);                

        do {
            globalIndex = this.state[this.Name].Index + 1;
            var list = customerSupplyDao.getList(globalIndex, globalIndex + this.FAFReportState.ENTRIES_PER_PAGE);
            if (!list) {
                break;
            }
            
            this.ProcessTransactionList(list, adapter);
            
            if (this.job.IsThresholdReached()) {
                return;
            }                
        } while (list.length >= this.FAFReportState.ENTRIES_PER_PAGE);                
    } catch (e) {
        nlapiLogExecution('ERROR', 'TAF.AE.Section.CustomerSupplyLinesSection.On_Body', e.toString());
        throw e;
    }
    this.output.SetPercent(this.FAFReportState.PROGRESS_PERCENTAGE.SUPPLY);
};

TAF.AE.Section.CustomerSupplyLinesSection.prototype.On_CleanUp = function _On_CleanUp() {
    delete this.state[this.Name];
};

TAF.AE.Section.CustomerSupplyLinesSection.prototype.ProcessTransactionList = function _ProcessTransactionList(list, adapter) {
    var iterator = new TAF.Lib.Iterator(list);
    var line;
    var sales;
    var customerId;

    if(iterator.hasNext()) {
        while(iterator.hasNext()){
            line = iterator.next();
            customerId = line.customerId;

            if (adapter.isValidCustomerSupplyLine(line)) {
                sales = adapter.convertCustomerSupply(line);

                //Get customer country if txn line emirate is blank
                if(!this.state[this.Name].entityCountryMap.hasOwnProperty(customerId) && !line.customerEmirate) {
                	this.state[this.Name].entityCountryMap[customerId] = this.GetEntityCountry(customerId);
                }
                sales.customerCountry = sales.customerCountry || this.state[this.Name].entityCountryMap[customerId] || '';

                this.output.WriteLine(this.FAFReportState.Formatter.formatSupplyBody(sales));
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