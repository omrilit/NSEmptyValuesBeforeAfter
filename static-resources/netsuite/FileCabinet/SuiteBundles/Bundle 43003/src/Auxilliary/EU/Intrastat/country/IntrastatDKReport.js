/**
 * Copyright © 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};
Tax.EU.Intrastat.DK = Tax.EU.Intrastat.DK || {};

//-------------------ReportDAO-------------------
Tax.EU.Intrastat.DK.ReportDAO = function IntrastatDKReportDAO() {
    Tax.DAO.ReportDAO.call(this);
    this.Name = 'DKReportDAO';
    this.reportName = '';
};

Tax.EU.Intrastat.DK.ReportDAO.prototype = Object.create(Tax.DAO.ReportDAO.prototype);

Tax.EU.Intrastat.DK.ReportDAO.prototype.ListObject = function ListObject() {
    return {
    	vatRegNo: '',
    	taxRegNo: '',
        commodityCode: '',
        shipCountry: '',
        notcCode : '',
        notc : '',
        weightLbs: '',
        netAmount: '',
        quantity: '',
        transactionType: ''
  };
};

Tax.EU.Intrastat.DK.ReportDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    try {
        var pivotReportColumns = this.getColumns(pivotReport);
        var line = new this.ListObject();
        line.vatRegNo = pivotReportColumns[0];
        line.taxRegNo = pivotReportColumns[1]; 
        line.commodityCode = pivotReportColumns[2];
        line.notcCode = pivotReportColumns[3];
        line.notc = pivotReportColumns[4];
        line.shipCountry = pivotReportColumns[5];
        line.transactionType = pivotReportColumns[7];
        line.taxCode = pivotReportColumns[8];
        line.netAmount = pivotReportColumns[9];
        line.quantity = pivotReportColumns[10];
        line.weightLbs = pivotReportColumns[11];
        
        return line;
    } catch (ex) {
        logException(ex, 'IntrastatDKReportDAO.getColumnMetadata');
        throw ex;
    }
};

//-------------------DAO-------------------
Tax.EU.Intrastat.DK.SalesReportDAO = function IntrastatDKSalesReportDAO() {
    Tax.EU.Intrastat.DK.ReportDAO.call(this);
    this.Name = 'DKSalesReportDAO';
    this.reportName = 'Intrastat DK Sales Report [11439]';
};

Tax.EU.Intrastat.DK.SalesReportDAO.prototype = Object.create(Tax.EU.Intrastat.DK.ReportDAO.prototype);

Tax.EU.Intrastat.DK.PurchaseReportDAO = function IntrastatDKPurchaseReportDAO() {
    Tax.EU.Intrastat.DK.ReportDAO.call(this);
    this.Name = 'DKPurchaseReportDAO';
    this.reportName = 'Intrastat DK Purchase Report [11439]';
};

Tax.EU.Intrastat.DK.PurchaseReportDAO.prototype = Object.create(Tax.EU.Intrastat.DK.ReportDAO.prototype);


//-------------------DataAdapter-------------------
Tax.EU.Intrastat.DK.IntrastatLine = function _IntrastatLine() {
    return {
        exclude: false,
        lineNumber: -1,
        commodityCode: '',
        memberState: '',
        countryOfOrigin: '',
        transactionCode: '',
        modeOfTransport: '',
        origNetMass: 0,
        origSupplementaryUnit: 0,
        origValue: 0,
        taxRegNo: '',
        transactionType: ''
    };
};

Tax.EU.Intrastat.DK.DataAdapter = function _DataAdapter() {
     Tax.EU.Intrastat.IntrastatDataAdapter.call(this);
      this.Name = 'DKDataAdapter';
};

Tax.EU.Intrastat.DK.DataAdapter.prototype = Object.create(Tax.EU.Intrastat.IntrastatDataAdapter.prototype);

Tax.EU.Intrastat.DK.DataAdapter.prototype.convertToLine = function convertToLine(row) {
    if (!row) {
        throw nlapiCreateError('INVALID_PARAMETER', 'A row object is required.');
    }

    if (!row.taxCode ||
        !this.taxCodeMap ||
        !this.taxCodeMap[row.taxCode] || 
        (this.taxCodeMap[row.taxCode].isService == 'T')) {
        return null;
    }
    
    try {
        var line = new Tax.EU.Intrastat.DK.IntrastatLine();
        var quantity = Math.abs(row.quantity);
        var netMass = ((parseFloat(row.weightLbs || 0) / this.POUNDS_TO_KILOS_FACTOR).toFixed(5)) * quantity;

        line.commodityCode = row.commodityCode || '';	//truncate to 8 characters
        line.commodityCode = line.commodityCode.substring(0,8);	
        line.memberState = row.shipCountry;
        line.transactionCode = row.notcCode || '';
        line.transactionCode = line.transactionCode.substring(0,2);
        line.origNetMass = netMass || 1;
        line.origSupplementaryUnit = Math.abs(quantity);
        line.origValue = Math.abs(Number(row.netAmount)) || 0;
        line.entityVatNo = row.taxRegNo || row.vatRegNo || '';
        line.transactionType = row.transactionType;
        
        return line;
    } catch(ex) {
        logException(ex, 'Tax.EU.Intrastat.DK.DataAdapter.convertToLine');
        return null;
    }
};

//-------------------DataAggregator----------------
Tax.EU.Intrastat.DK.IntrastatDataAggregator = function _IntrastatDataAggregator(aggregator) {
  Tax.EU.Intrastat.IntrastatDataAggregator.call(this);
  this.daoName = 'IntrastatDKDataAggregator';
  this.RETURN_TXNS = ['BILLCRED', 'CREDMEM', 'RETURN'];
};

Tax.EU.Intrastat.DK.IntrastatDataAggregator.prototype = Object.create(Tax.EU.Intrastat.IntrastatDataAggregator.prototype);

Tax.EU.Intrastat.DK.IntrastatDataAggregator.prototype.getConsolidationKey = function _getConsolidationKey(obj) {
    if (!obj) {
        var error = nlapiCreateError('MISSING_PARAMETER', 'obj argument is required.');
        logException(error, 'Tax.EU.Intrastat.DK.IntrastatDataAggregator.getConsolidationKey');
        throw error;
    }
    
    var key = [
               obj.commodityCode,
               obj.memberState,
               obj.transactionCode
           ];
    
   var tranType = obj.transactionType ? obj.transactionType.toUpperCase() : '';

   if (this.RETURN_TXNS.indexOf(tranType) > -1) {
       key.push('RETURN_TXN');
   }
       
   return key.join('-');
};

Tax.EU.Intrastat.DK.IntrastatDataAggregator.prototype.add = function _add(obj) {
	if (!obj) {
        return;
    }
	
    try {
        var key = this.getConsolidationKey(obj);
        
        var listItem = this.list[this.keyToListMap[key]];
        
        if (listItem != undefined) {
            listItem.origValue += obj.origValue;
            listItem.origSupplementaryUnit += obj.origSupplementaryUnit;
            listItem.origNetMass += obj.origNetMass;
            listItem.entityVatNo = '';
            this.setDisplayAmounts(listItem);
        } else {
            this.setDisplayAmounts(obj);
            obj.lineNumber = this.list.length + 1;
            
            this.list.push(obj);
            this.keyToListMap[key] = obj.lineNumber - 1;
        }
    } catch(e) {
        logException(e, 'Tax.EU.Intrastat.DK.IntrastatDataAggregator.add');
    }
};