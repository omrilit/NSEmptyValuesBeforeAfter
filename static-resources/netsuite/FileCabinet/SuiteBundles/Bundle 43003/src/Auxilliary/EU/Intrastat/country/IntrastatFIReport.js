/**
 * Copyright © 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};
Tax.EU.Intrastat.FI = Tax.EU.Intrastat.FI || {};

//-------------------ReportDAO-------------------
Tax.EU.Intrastat.FI.ReportDAO = function IntrastatFIReportDAO() {
    Tax.DAO.ReportDAO.call(this);
    this.Name = 'FIReportDAO';
    this.reportName = '';
};

Tax.EU.Intrastat.FI.ReportDAO.prototype = Object.create(Tax.DAO.ReportDAO.prototype);

Tax.EU.Intrastat.FI.ReportDAO.prototype.ListObject = function ListObject() {
    return {
        commodityCode: '',
        notcCode : '',
        modeOfTransport: '',
        weightLbs: '',
        netAmount: '',
        statisticalValue: '',
        quantity: '',
        taxCode: '',
        country: '',
        entityTaxNo: '',
        entityVatNo: ''
    };
};

Tax.EU.Intrastat.FI.ReportDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    try {
        var pivotReportColumns = this.getColumns(pivotReport);
        var line = new this.ListObject();
        line.commodityCode = pivotReportColumns[1];
        line.notcCode = pivotReportColumns[2];
        line.modeOfTransport = pivotReportColumns[3];
        line.weightLbs = pivotReportColumns[4];
        line.netAmount = pivotReportColumns[5];
        line.statisticalValue = pivotReportColumns[6];
        line.quantity = pivotReportColumns[7];
        line.taxCode = pivotReportColumns[8];
        line.country = pivotReportColumns[9];
        line.entityTaxNo = pivotReportColumns[10];
        line.entityVatNo = pivotReportColumns[11];
        return line;
    } catch (ex) {
        logException(ex, 'IntrastatFIReportDAO.getColumnMetadata');
        throw ex;
    }
};

//-------------------DAO-------------------
Tax.EU.Intrastat.FI.SalesReportDAO = function IntrastatFISalesReportDAO() {
    Tax.EU.Intrastat.FI.ReportDAO.call(this);
    this.Name = 'FISalesReportDAO';
    this.reportName = 'Intrastat FI Sales Report [11402]';
};

Tax.EU.Intrastat.FI.SalesReportDAO.prototype = Object.create(Tax.EU.Intrastat.FI.ReportDAO.prototype);

Tax.EU.Intrastat.FI.PurchaseReportDAO = function IntrastatFIPurchaseReportDAO() {
    Tax.EU.Intrastat.FI.ReportDAO.call(this);
    this.Name = 'FIPurchaseReportDAO';
    this.reportName = 'INTRASTAT FI PURCHASE REPORT [11402]';
};

Tax.EU.Intrastat.FI.PurchaseReportDAO.prototype = Object.create(Tax.EU.Intrastat.FI.ReportDAO.prototype);

//-------------------DataAggregator----------------
Tax.EU.Intrastat.FI.IntrastatDataAggregator = function _IntrastatDataAggregator(aggregator) {
  Tax.EU.Intrastat.IntrastatDataAggregator.call(this);
  this.daoName = 'IntrastatFIDataAggregator';
};
Tax.EU.Intrastat.FI.IntrastatDataAggregator.prototype = Object.create(Tax.EU.Intrastat.IntrastatDataAggregator.prototype);

Tax.EU.Intrastat.FI.IntrastatDataAggregator.prototype.add = function _add(obj) {
  if (!obj) {
      return;
  }
  
  try {
      obj.lineNumber = this.list.length + 1;
      this.list.push(obj);
  } catch(e) {
      logException(e, 'Tax.EU.Intrastat.FI.IntrastatDataAggregator.add');
  }
};

//-------------------DataAdapter-------------------
Tax.EU.Intrastat.FI.IntrastatLine = function _IntrastatLine() {
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
        statisticalValue: 0
    };
};

Tax.EU.Intrastat.FI.DataAdapter = function _DataAdapter() {
     Tax.EU.Intrastat.IntrastatDataAdapter.call(this);
      this.Name = 'FIDataAdapter';
};

Tax.EU.Intrastat.FI.DataAdapter.prototype = Object.create(Tax.EU.Intrastat.IntrastatDataAdapter.prototype);

Tax.EU.Intrastat.FI.DataAdapter.prototype.process = function process(result, params) {
    if (!params) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A params object is required.');
    }
    this.isSales = params.reportType === 'SALE';
    return Tax.EU.Intrastat.IntrastatDataAdapter.prototype.process.call(this, result, params);
};

Tax.EU.Intrastat.FI.DataAdapter.prototype.convertToLine = function convertToLine(row) {
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
        var line = new Tax.EU.Intrastat.FI.IntrastatLine();
        var quantity = Math.abs(row.quantity) || 0;
        var netMass = ((parseFloat(row.weightLbs || 0) / this.POUNDS_TO_KILOS_FACTOR).toFixed(5)) * quantity;
        var statisticalValue = Number(row.statisticalValue) || 0;

        line.commodityCode = row.commodityCode;
        line.transactionCode = row.notcCode.substring(0, 2);
        line.modeOfTransport = row.modeOfTransport;
        line.origNetMass = netMass;
        line.origSupplementaryUnit = quantity;
        line.origValue = Math.abs(row.netAmount) || 0;
        line.statisticalValue = Math.round(statisticalValue) === 0 ? line.origValue : statisticalValue; // if rounded value is equal to 0, set to orig value
        line.entityVatNo = row.entityVatNo || row.entityTaxNo;
        
        if (this.isSales) { // if dispatch
            line.memberState = row.country || '';
            line.countryOfOrigin = ''; // leave blank for dispatch
        } else { // if arrivals
            line.memberState = 'FI'; //default to FI for arrivals
            line.countryOfOrigin = row.country || '';
        }

        return line;
    } catch(ex) {
        logException(ex, 'Tax.EU.Intrastat.FI.DataAdapter.convertToLine');
        return null;
    }
};

//-----------------CSV Export Adapter-----------------
Tax.EU.Intrastat.FI.CSVExportAdapter = function _CSVExportAdapter() {
  Tax.EU.Intrastat.IntrastatDataAdapter.call(this);
  this.Name = 'CSVExportAdapter';
  this.isFirstLine = true;
};

Tax.EU.Intrastat.FI.CSVExportAdapter.prototype = Object.create(Tax.EU.Intrastat.ExportAdapter.prototype);

Tax.EU.Intrastat.FI.CSVExportAdapter.prototype.transform = function _transform(params) {
  if (!params) {
      throw nlapiCreateError('MISSING_PARAMETER', 'params argument is required');
  }

  this.reportType = params.reportType;
  this.period = params.fromperiod;

  return Tax.EU.Intrastat.ExportAdapter.prototype.transform.call(this, params);
};

Tax.EU.Intrastat.FI.CSVExportAdapter.prototype.getLineData = function _getLineData(line) {
  if (!line) {
      throw nlapiCreateError('INVALID_PARAMETER', 'A line object is required.');
  }

  if (this.isFirstLine) {
      try {
          this.isFirstLine = false;
          var memoryCache = Tax.Cache.MemoryCache.getInstance();
          var data = memoryCache.load('CompanyInformationDAO');

          if (data && data.company && data.company.length > 0) {
              line.vatNo = data.company[0].vrn;
          } else {
              line.vatNo = '';
          }
          line.direction = this.reportType === 'SALE' ? '2' : '1';
          line.period = new SFC.System.TaxPeriod(this.period).GetStartDate().toString('yyyyMM');
      } catch (ex) {
          logException(ex, 'Tax.EU.Intrastat.FI.CSVExportAdapter.getLineData');
      }
  } else {
      line.vatNo = '';
      line.direction = '';
      line.period = '';
  }

  return line;
};

//-------------------CSV Formatter-------------------
Tax.EU.Intrastat.FI.CSVExportFormatter = function _CSVExportFormatter() {
  Tax.EU.Intrastat.IntrastatFormatter.call(this);
  this.Name = 'CSVExportFormatter';
};

Tax.EU.Intrastat.FI.CSVExportFormatter.prototype = Object.create(Tax.EU.Intrastat.IntrastatFormatter.prototype);

Tax.EU.Intrastat.FI.CSVExportFormatter.prototype.getColumnDefinition = function _getColumnDefinition(params) {
  if (!params || !params.meta || !params.meta.columns) {
      throw nlapiCreateError('MISSING_PARAMETER', 'params.meta.columns argument is required');
  }
  return params.meta.columns['CSVExportAdapter'];
};
