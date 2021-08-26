/**
 * Copyright © 2014, 2020, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.AE = VAT.AE || {};


VAT.AE.BaseData = function(params) {
    this.CountryCode = 'AE';
    VAT.ReportData.call(this, params);
};
VAT.AE.BaseData.prototype = Object.create(VAT.ReportData.prototype);


VAT.AE.BaseData.prototype.ProcessReportData = function(data, headerData) {
    var ds = {};

    if (headerData.startperiod == headerData.endperiod) {
        ds.customperiod = headerData.startperiod;
    } else {
        ds.customperiod = headerData.startperiod + " - " + headerData.endperiod;
    }

    ds.ToPeriodId = this.periodTo;
    ds.FromPeriodId = this.periodFrom;
    ds.SubId = this.subId;
    ds.ReportIndex = this.className;

    for(var i in data) {
        if (data[i]  ||  data[i] === 0) {
            ds[i] = data[i];
        }
    }

    for(var j in headerData) {
        ds[j] = headerData[j];
    }

    return ds;
};

VAT.AE.BaseData.prototype.ProcessPrintData = function(ds) {
    
    for (var k in this.otherParams) {
        if (this.otherParams[k]) {
            ds[k] = this.otherParams[k];
        } else {
            ds[k] = ' ';
        }
    }

    var checked = 'true';
    var unchecked = 'false';

    ds.chkrefundY = unchecked;
    ds.chkrefundN = unchecked;
    ds.chkapplyY = unchecked;
    ds.chkapplyN = unchecked;
    
    ds["chkrefund" + (this.otherParams.chkrefund || 'N')] = checked;
    ds["chkapply" + (this.otherParams.chkapply || 'N')] = checked;

    ds.library = _App.GetLibraryFile(VAT.LIB.FORMAT).getValue();
    return ds;
};

VAT.AE.BaseData.prototype.ProcessExportData = function(ds) {

    for (var iparam in this.otherParams) {  //put the params in otherParams in the data array
        ds[iparam] = this.otherParams[iparam] && (this.otherParams[iparam].indexOf('box') < 0) ? this.otherParams[iparam] : '';
    }
    
    for (iparam in ds) {
        if (String(iparam).indexOf('box') > -1) {
            if (this.otherParams[iparam]) {
                ds[iparam] = ds[iparam] != this.otherParams[iparam] ? this.otherParams[iparam] : ds[iparam];
            }
            
            ds['export_' + iparam] = ds[iparam];
        }
    }

    ds["chkrefund"] = this.otherParams.chkrefund=='Y'?'Yes':'No';
    ds["chkapply"] = this.otherParams.chkapply=='Y'?'Yes':'No';

    ds.library = _App.GetLibraryFile(VAT.LIB.FORMAT).getValue();

    return ds;
};

VAT.AE.Report = VAT.AE.Report || {};

VAT.AE.EXPORT_TEMPLATE = 'VAT_XLS_AE_ENG';

VAT.AE.Report.Data = function(params) {
    this.emirateList = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'];
    this.ABU_DHABI = [this.emirateList[0]];
    this.DUBAI = [this.emirateList[1]];
    this.SHARJAH = [this.emirateList[2]];
    this.AJMAN = [this.emirateList[3]];
    this.UMM_AL_QUWAIN = [this.emirateList[4]];
    this.RAS_AL_KHAIMAH = [this.emirateList[5]];
    this.FUJAIRAH = [this.emirateList[6]];
    this.ALL = this.emirateList.concat(['- Unassigned -']);

    var _CountryCode = 'AE';

    this.TaxMap = {
            box1ataxamount: {id: 'box1ataxamount', label: 'Box 1a', taxcodelist: [{taxcode: 'S', available: 'SALE'}], otherfields: [{title: "Emirate", id: "emirate", value: this.ABU_DHABI}]},
            box1btaxamount: {id: 'box1btaxamount', label: 'Box 1b', taxcodelist: [{taxcode: 'S', available: 'SALE'}], otherfields: [{title: "Emirate", id: "emirate", value: this.DUBAI}]},
            box1ctaxamount: {id: 'box1ctaxamount', label: 'Box 1c', taxcodelist: [{taxcode: 'S', available: 'SALE'}], otherfields: [{title: "Emirate", id: "emirate", value: this.SHARJAH}]},
            box1dtaxamount: {id: 'box1dtaxamount', label: 'Box 1d', taxcodelist: [{taxcode: 'S', available: 'SALE'}], otherfields: [{title: "Emirate", id: "emirate", value: this.AJMAN}]},
            box1etaxamount: {id: 'box1etaxamount', label: 'Box 1e', taxcodelist: [{taxcode: 'S', available: 'SALE'}], otherfields: [{title: "Emirate", id: "emirate", value: this.UMM_AL_QUWAIN}]},
            box1ftaxamount: {id: 'box1ftaxamount', label: 'Box 1f', taxcodelist: [{taxcode: 'S', available: 'SALE'}], otherfields: [{title: "Emirate", id: "emirate", value: this.RAS_AL_KHAIMAH}]},
            box1gtaxamount: {id: 'box1gtaxamount', label: 'Box 1g', taxcodelist: [{taxcode: 'S', available: 'SALE'}], otherfields: [{title: "Emirate", id: "emirate", value: this.FUJAIRAH}]},
            box6taxamount : {id: 'box6taxamount', label: 'Box 6', taxcodelist: [{taxcode: 'IMG', available: 'PURCHASE'}]},
            box9taxamount : {id: 'box9taxamount', label: 'Box 9', taxcodelist: [{taxcode: 'S', available: 'PURCHASE'}]}
        };
    
    this.TaxDefinition = {
            S: function(taxcode) {
                return taxcode.CountryCode === _CountryCode && taxcode.Rate > 0 && !taxcode.IsForExport &&
                    !taxcode.IsExempt && !taxcode.IsImport && !taxcode.IsReverseCharge;
            },
            EX: function(taxcode) {
                return taxcode.CountryCode === _CountryCode && taxcode.Rate === 0 && taxcode.IsForExport &&
                    !taxcode.IsExempt && !taxcode.IsImport && !taxcode.IsReverseCharge;
            },
            X: function(taxcode) {
                return taxcode.CountryCode === _CountryCode && taxcode.Rate === 0 && taxcode.IsExempt &&
                    !taxcode.IsForExport && !taxcode.IsImport && !taxcode.IsReverseCharge;
            },
            IMG: function(taxcode) {
                return taxcode.CountryCode === _CountryCode && taxcode.Rate > 0 && taxcode.IsImport &&
                    !taxcode.IsForExport && !taxcode.IsExempt && !taxcode.IsReverseCharge && !taxcode.IsService;
            },
            IMZ: function(taxcode) {
                return taxcode.CountryCode === _CountryCode && taxcode.Rate === 0 && taxcode.IsImport &&
                    !taxcode.IsForExport && !taxcode.IsExempt && taxcode.IsReverseCharge && !taxcode.IsService;
            },
            IMS: function(taxcode) {
                return taxcode.CountryCode === _CountryCode && taxcode.Rate === 0 && taxcode.IsImport &&
                    !taxcode.IsForExport && !taxcode.IsExempt && taxcode.IsReverseCharge && taxcode.IsService;
            },
            RC: function(taxcode) {
                return taxcode.CountryCode === _CountryCode && taxcode.Rate === 0 && taxcode.IsReverseCharge &&
                    taxcode.IsForSales && !taxcode.IsForExport && !taxcode.IsExempt && !taxcode.IsImport;
            },
            RCP: function(taxcode) {
                return taxcode.CountryCode === _CountryCode && taxcode.Rate === 0 && taxcode.IsReverseCharge &&
                    taxcode.IsForPurchase && !taxcode.IsForExport && !taxcode.IsExempt && !taxcode.IsImport;
            },
        };
    
    VAT.AE.BaseData.call(this, params);
};
VAT.AE.Report.Data.prototype = Object.create(VAT.AE.BaseData.prototype);

VAT.AE.Report.Data.prototype.GetData = function() {
    var _DR = this.DataReader;
    var obj = {};
    var sales = _DR.GetSalesByEmirateSummary();
    var purchase = _DR.GetPurchaseByEmirateSummary();
    var salesadj = _DR.GetSalesAdjustmentSummary(this.TaxMap, false, this.emirateList);
    var purchaseadj = _DR.GetPurchaseAdjustmentSummary(this.TaxMap, false, this.emirateList);
    var taxDetails, adjDetails;
    var taxIMZIMSnet = 0;
    var taxIMZIMStax = 0;

    // SALES
    taxDetails = sales.Of('S').Sum(this.ABU_DHABI);
    adjDetails = salesadj.Of('box1ataxamount', 'S', false, this.ABU_DHABI);
    obj.box1anetamount = taxDetails.NetAmount;
    obj.box1ataxamount = taxDetails.TaxAmount + adjDetails.TaxAmount;
    obj.box1aadjustment = 0;

    taxDetails = sales.Of('S').Sum(this.DUBAI);
    adjDetails = salesadj.Of('box1btaxamount', 'S', false, this.DUBAI);
    obj.box1bnetamount = taxDetails.NetAmount;
    obj.box1btaxamount = taxDetails.TaxAmount + adjDetails.TaxAmount;
    obj.box1badjustment = 0;

    taxDetails = sales.Of('S').Sum(this.SHARJAH);
    adjDetails = salesadj.Of('box1ctaxamount', 'S', false, this.SHARJAH);
    obj.box1cnetamount = taxDetails.NetAmount;
    obj.box1ctaxamount = taxDetails.TaxAmount + adjDetails.TaxAmount;
    obj.box1cadjustment = 0;

    taxDetails = sales.Of('S').Sum(this.AJMAN);
    adjDetails = salesadj.Of('box1dtaxamount', 'S', false, this.AJMAN);
    obj.box1dnetamount = taxDetails.NetAmount;
    obj.box1dtaxamount = taxDetails.TaxAmount + adjDetails.TaxAmount;
    obj.box1dadjustment = 0;

    taxDetails = sales.Of('S').Sum(this.UMM_AL_QUWAIN);
    adjDetails = salesadj.Of('box1etaxamount', 'S', false, this.UMM_AL_QUWAIN);
    obj.box1enetamount = taxDetails.NetAmount;
    obj.box1etaxamount = taxDetails.TaxAmount + adjDetails.TaxAmount;
    obj.box1eadjustment = 0;

    taxDetails = sales.Of('S').Sum(this.RAS_AL_KHAIMAH);
    adjDetails = salesadj.Of('box1ftaxamount', 'S', false, this.RAS_AL_KHAIMAH);
    obj.box1fnetamount = taxDetails.NetAmount;
    obj.box1ftaxamount = taxDetails.TaxAmount + adjDetails.TaxAmount;
    obj.box1fadjustment = 0;

    taxDetails = sales.Of('S').Sum(this.FUJAIRAH);
    adjDetails = salesadj.Of('box1gtaxamount', 'S', false, this.FUJAIRAH);
    obj.box1gnetamount = taxDetails.NetAmount;
    obj.box1gtaxamount = taxDetails.TaxAmount + adjDetails.TaxAmount;
    obj.box1gadjustment = 0;

    obj.box2netamount = 0;
    obj.box2taxamount = 0;

    taxDetails = purchase.Of('RCP').Sum(this.ALL);
    obj.box3netamount = taxDetails.NetAmount;
    obj.box3taxamount = taxDetails.NotionalAmount;

    taxDetails = sales.Of('EX').Sum(this.ALL);
    obj.box4netamount = taxDetails.NetAmount;
    obj.box4taxamount = taxDetails.TaxAmount;

    taxDetails = sales.Of('X').Sum(this.ALL);
    obj.box5netamount = taxDetails.NetAmount;
    obj.box5taxamount = taxDetails.TaxAmount;

    taxDetails = purchase.Of('IMG').Sum(this.ALL);
    adjDetails = purchaseadj.Of('box6taxamount', 'IMG');
    obj.box6netamount = taxDetails.NetAmount;
    obj.box6taxamount = taxDetails.TaxAmount + adjDetails.TaxAmount;
    
    taxDetails = purchase.Of('IMZ').Sum(this.ALL);
    obj.box6netamount += taxDetails.NetAmount;
    obj.box6taxamount += taxDetails.NotionalAmount;
    taxIMZIMSnet =+ taxDetails.NetAmount;
    taxIMZIMStax =+ taxDetails.NotionalAmount;
    
    taxDetails = purchase.Of('IMS').Sum(this.ALL);
    obj.box6netamount += taxDetails.NetAmount;
    obj.box6taxamount += taxDetails.NotionalAmount;
    taxIMZIMSnet += taxDetails.NetAmount;
    taxIMZIMStax =+ taxDetails.NotionalAmount;

    obj.box7netamount = 0;
    obj.box7taxamount = 0;

    obj.box8netamount = obj.box1anetamount + obj.box1bnetamount + obj.box1cnetamount + obj.box1dnetamount +
            obj.box1enetamount + obj.box1fnetamount + obj.box1gnetamount + obj.box2netamount + obj.box3netamount +
            obj.box4netamount + obj.box5netamount + obj.box6netamount + obj.box7netamount;
    obj.box8taxamount = obj.box1ataxamount + obj.box1btaxamount + obj.box1ctaxamount + obj.box1dtaxamount +
            obj.box1etaxamount + obj.box1ftaxamount + obj.box1gtaxamount + obj.box2taxamount +
            obj.box3taxamount + obj.box6taxamount + obj.box7taxamount;
    obj.box8adjustment = obj.box1aadjustment + obj.box1badjustment + obj.box1cadjustment + obj.box1dadjustment +
            obj.box1eadjustment + obj.box1fadjustment + obj.box1gadjustment;

    // PURCHASE
    taxDetails = purchase.Of('S').Sum(this.ALL);
    adjDetails = purchaseadj.Of('box9taxamount', 'S');
    obj.box9netamount = taxDetails.NetAmount;
    obj.box9taxamount = taxDetails.TaxAmount + adjDetails.TaxAmount;
    obj.box9adjustment = 0;

    obj.box10netamount = obj.box3netamount + taxIMZIMSnet;
    obj.box10taxamount = obj.box3taxamount + taxIMZIMStax;

    obj.box11netamount = obj.box9netamount + obj.box10netamount;
    obj.box11taxamount = obj.box9taxamount + obj.box10taxamount;
    obj.box11adjustment = obj.box9adjustment;

    obj.box12 = obj.box8taxamount + obj.box8adjustment;
    obj.box13 = obj.box11taxamount + obj.box11adjustment;
    obj.box14 = obj.box12 - obj.box13;

    return obj;
};


VAT.AE.Report.Data.prototype.GetDrilldownData = function(boxNumber) {
    var _DR = this.DataReader;
    var data = [];

    switch (boxNumber) {
        case 'box1a': data = _DR.GetSalesDetails(['S'], null, null, null, null, this.ABU_DHABI); break;
        case 'box1b': data = _DR.GetSalesDetails(['S'], null, null, null, null, this.DUBAI); break;
        case 'box1c': data = _DR.GetSalesDetails(['S'], null, null, null, null, this.SHARJAH); break;
        case 'box1d': data = _DR.GetSalesDetails(['S'], null, null, null, null, this.AJMAN); break;
        case 'box1e': data = _DR.GetSalesDetails(['S'], null, null, null, null, this.UMM_AL_QUWAIN); break;
        case 'box1f': data = _DR.GetSalesDetails(['S'], null, null, null, null, this.RAS_AL_KHAIMAH); break;
        case 'box1g': data = _DR.GetSalesDetails(['S'], null, null, null, null, this.FUJAIRAH); break;
        case 'box3': data = _DR.GetPurchaseDetails(['RCP'], null, null, null, null); break;
        case 'box4': data = _DR.GetSalesDetails(['EX'], null, null, null, null); break;
        case 'box5': data = _DR.GetSalesDetails(['X'], null, null, null, null); break;
        case 'box6': data = _DR.GetPurchaseDetails(['IMG','IMZ','IMS'], null, null, null, null); break;
        case 'box9': data = _DR.GetPurchaseDetails(['S'], null, null, null, null); break;
        case 'box10': data = _DR.GetPurchaseDetails(['RCP','IMZ','IMS'], null, null, null, null); break;
    }

    return { ReportData: data };
};

VAT.AE.BaseReport = function() {
    VAT.Report.call(this);
    
    this.isNewFramework = true;
    this.ReportType = 'Report';
    this.CountryCode = 'AE';
    this.Actions = VAT.AE.ReportActions;
    this.HelpURL = '/app/help/helpcenter.nl?topic=DOC_UnitedArabEmiratesTaxTopics';
    this.HelpLabel = 'Click here for United Arab Emirates VAT Help Topics';
    this.isAdjustable = true;
    this.IsExportable = true;
    this.contextList = [new VAT.Export.Context('vat.ae.export.xls', 'EXCEL', VAT.ResMgr.GetString("BTNLBL_EXPORT_XLS"), 'OnGenerateXls("vat.ae.export.xls")', VAT.AE.EXPORT_TEMPLATE)];
};
VAT.AE.BaseReport.prototype = Object.create(VAT.Report.prototype);

VAT.AE.ENG = VAT.AE.ENG || {};
VAT.AE.ENG.Report = function() {
    VAT.AE.BaseReport.call(this);
    
    this.ClassName = 'VAT.AE.ENG.Report';
    this.LanguageCode = 'ENG';
    this.Name = 'United Arab Emirates';
    this.metadata = {template: {'pdf': 'VAT_PDF_AE_ENG', 'html': 'VAT_HTML_AE_ENG'}};
};
VAT.AE.ENG.Report.prototype = Object.create(VAT.Report.prototype);
