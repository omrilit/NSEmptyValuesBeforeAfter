/**
 * Copyright � 2017, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.Supplementary = Tax.Supplementary || {};
Tax.Supplementary.VCS = Tax.Supplementary.VCS || {};
Tax.Supplementary.VCS.SK = Tax.Supplementary.VCS.SK || {};
Tax.Supplementary.VCS.SK.DAO = Tax.Supplementary.VCS.SK.DAO || {};
Tax.Supplementary.VCS.SK.Adapter = Tax.Supplementary.VCS.SK.Adapter || {};
Tax.Supplementary.VCS.SK.Formatter = Tax.Supplementary.VCS.SK.Formatter || {};

/*****************
 * GENERIC STUFF *
 *****************/
var base = Tax.Supplementary.VCS.SK;
var dao = base.DAO;
var adapter = base.Adapter;
var formatter = base.Formatter;

base.context = nlapiGetContext();
base.isUnitsOfMeasureEnabled = base.context.getFeature('unitsofmeasure');
base.isNewVersion = Number(base.context.version) > 2017.1;

base.getNotionalRate = function getNotionalRate(line) {
    if (!line) {
        return;
    }
    if (!line.notionalRate) {
        return line.notionalRate;
    }

    // > 2017.1: notional rate is in percent
    // <= 2017.1: notional rate is in decimal
    var rate;

    if (base.isNewVersion) {
        rate = (line.notionalRate / 100) || 0;
    } else {
        rate = Number(line.notionalRate) || 0;
    }

    return rate;
};

base.SKFileManager = function SKFileManager() {
    Tax.FileManager.call(this);
    this.Name = 'SKFileManager';
};

base.SKFileManager.prototype = Object.create(Tax.FileManager.prototype);

base.SKFileManager.prototype.process = function process(result, params) {
    var fileProperties = params.meta.file[params.format];
    fileProperties.format = params.format;
    fileProperties.filename = [params.filename, new Date().toString('ddMMyyyy_Hmmss')].join('_');
    fileProperties.folder = params.meta.folder;

    var fileId = this.createFile(fileProperties, result.rendered);
    var file = this.getFileById(fileId);
    result.fileUrl = params.url ? [params.url, file.getURL()].join('') : file.getURL();
    result.filename = file.getName();
    return result;
};

/***********************
 * COMPANY INFORMATION *
 ***********************/
dao.CompanyInformationDAO = function CompanyInformationDAO() {
    Tax.DAO.BaseDAO.call(this);
    this.Name = 'VCS_SK_CompanyInformationDAO';
};

dao.CompanyInformationDAO.prototype = Object.create(Tax.DAO.BaseDAO.prototype);

dao.CompanyInformationDAO.prototype.getList = function getList(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A search parameter object is required.');
    }

    var company = null;

    if (params.subsidiary) {
        company = new Tax.DAO.SubsidiaryDAO().getList({
            id: params.subsidiary,
            bookId: params.bookid
        });
    } else {
        company = new Tax.DAO.CompanyInformationDAO().getList();
    }

    return company;
};

adapter.CompanyInformationAdapter = function CompanyInformationAdapter(errorHandler) {
    Tax.Adapter.BaseAdapter.call(this);
    this.errorHandler = errorHandler;
    this.Name = 'CompanyInformationAdapter';
    this.daos = ['VCS_SK_CompanyInformationDAO'];
};

adapter.CompanyInformationAdapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

adapter.CompanyInformationAdapter.prototype.transform = function transform(params) {
    var rawData = this.rawdata[0] || {};
    var result = {};

    var startPeriod = new SFC.System.TaxPeriod(params.periodfrom);
    var startMonth = startPeriod.GetStartDate().getMonth() + 1;

    result[this.Name] = [{
        vatno: rawData.vrn ? rawData.vrn.replace(/[^A-Za-z0-9]/g, '').replace(/^SK/i, '') : '',
        periodmonth: startPeriod.GetType() == 'month' ? startMonth.toString().length == 2 ? startMonth.toString() : '0' + startMonth : '',
        periodquarter: startPeriod.GetType() != 'month' ? '' + (Math.ceil(startMonth / 3)) : '',
        periodyear: startPeriod.GetStartDate().getFullYear().toString() || '',
        companyname: rawData.legalName || rawData.nameNoHierarchy || '',
        addressstreet: rawData.address1 || '',
        addressnumber: rawData.address2 || '',
        addresspostcode: rawData.zip || '',
        addresscity: rawData.city || '',
        addressstate: rawData.countryCode || '',
        addresstelephone: rawData.telephone || '',
        addressemail: rawData.email || '',
        printmsg: this.getFooterText(true),
        excelmsg: this.getFooterText(false)
    }];

    return result;
};

adapter.CompanyInformationAdapter.prototype.getFooterText = function getFooterText(isPDF) {
    return [
        isPDF ? 'Printed by' : 'Exported by',
        base.context.getName(),
        '(' + base.context.getUser() + ')',
        'on',
        new Date().toString('MMMM d, yyyy')
    ].join(' ');
};

/******************************************
 * ISSUED INVOICES - A.1 and A.2 (Common) *
 ******************************************/

dao.CustomerInvoiceDAO = function CustomerInvoiceDAO() {
    Tax.DAO.ReportDAO.call(this);
    this.Name = 'VCS_SK_CustomerInvoiceDAO';
    this.reportName = 'VCS SK - Sales Summary by Tax Code and Txn';
};

dao.CustomerInvoiceDAO.prototype = Object.create(Tax.DAO.ReportDAO.prototype);

dao.CustomerInvoiceDAO.prototype.ListObject = function ListObject() {
    return {
        taxCode: '',
        entityTaxNumber: '',
        documentNumber: '',
        transactionNumber: '',
        date: '',
        netAmount: '',
        taxAmount: '',
        taxRate: '',
        commodityCode: '',
        typeOfGoods: '',
        quantity: '',
        unitOfMeasure: '',
        itemId: '',
        entityDICNumber: '',
        entityICONumber: ''
    };
};

dao.CustomerInvoiceDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    var column = this.ListObject();
    try {
        var pivotReportColumns = this.getColumns(pivotReport);
        column.taxCode = pivotReportColumns[0];
        column.entityTaxNumber = pivotReportColumns[1];
        column.documentNumber = pivotReportColumns[2];
        column.transactionNumber = pivotReportColumns[3];
        column.date = pivotReportColumns[4];
        column.netAmount = pivotReportColumns[5];
        column.taxAmount = pivotReportColumns[6];
        column.taxRate = pivotReportColumns[7];
        column.commodityCode = pivotReportColumns[8];
        column.typeOfGoods = pivotReportColumns[9];
        column.quantity = pivotReportColumns[10];
        column.unitOfMeasure = pivotReportColumns[11];
        column.itemId = pivotReportColumns[12];
        column.entityDICNumber = pivotReportColumns[13];
        column.entityICONumber = pivotReportColumns[14];
    } catch (ex) {
        logException(ex, 'CustomerInvoiceDAO.getColumnMetadata');
        throw ex;
    }
    return column;
};

adapter.SectionAAdapter = function SectionAAdapter() {
    Tax.Adapter.BaseAdapter.call(this);
    this.Name = 'SectionAAdapter';
};

adapter.SectionAAdapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

adapter.SectionAAdapter.prototype.transform = function transform(params) {
    try {
        var data = [];
        var line = null;

        for (var i = 0; i < this.rawdata.length; i++) {
            line = this.rawdata[i];
            line.index = i;

            if (this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes)) {
                var transformed = this.getLineData(line);
                if (transformed) {
                    data.push(transformed);
                }
            }
        }

        nlapiLogExecution('DEBUG', this.Name || 'SectionAAdapter', JSON.stringify(data));

        var result = {};
        result[this.Name] = data;
        return result;
    } catch (ex) {
        logException(ex, 'SectionAAdapter.transform');
        throw ex;
    }
};

adapter.SectionAAdapter.prototype.getLineData = function getLineData(line) {
    return line;
};




/********************************
 * ITEMS - A.2 and C.1 (Common) *
 *******************************/

dao.ItemDAO = function ItemDAO() {
    Tax.DAO.RecordDAO.call(this);
    this.Name = 'ItemDAO';
    this.recordType = 'item';
};

dao.ItemDAO.prototype = Object.create(Tax.DAO.RecordDAO.prototype);

// TODO: Remove DAO processing in Model method/class
dao.ItemDAO.prototype.ListObject = function ListObject(row) {
    if (!row) {
        throw nlapiCreateError('INVALID_PARAMETER', 'Invalid ItemDAO params');
    }

    var listObject = {
        id: row.getValue('internalid'),
        unitsTypeId: row.getValue('unitstype')
    };
    return listObject;
};

dao.ItemDAO.prototype.prepareSearch = function prepareSearch(params) {
    try{
        if (!params || !params.itemIdList) {
            throw nlapiCreateError('INVALID_PARAMETER', 'Invalid ItemDAO params');
        }

        this.columns.push(new nlobjSearchColumn('internalid'));
        this.columns.push(new nlobjSearchColumn('unitstype'));

        if (params.itemIdList) {
            this.filters.push(new nlobjSearchFilter('internalid', null, 'anyof', params.itemIdList));
        }
    } catch (ex) {
        logException(ex, 'ItemDAO.prepareSearch');
        throw ex;
    }
};

dao.ItemDAO.prototype.process = function(result, params) {
    try{
        var combinedResult = {};
        combinedResult.savedReport = result.dao;

        if (base.isUnitsOfMeasureEnabled) {
            var itemIdList = [];

            for (var i = 0; i < result.dao.length; i++) {
                var line = result.dao[i];

                if (itemIdList.indexOf(line.itemId) == -1) {
                    itemIdList.push(line.itemId);
                }
            }

            combinedResult.items = itemIdList.length > 0 ? this.getList({ itemIdList: itemIdList }) : [];
        }

        var newResult = {
            dao: combinedResult
        };

        return newResult;
    } catch (ex) {
        logException(ex, 'ItemDAO.process');
        throw ex;
    }
};

dao.UnitsTypeDAO = function UnitsTypeDAO() {
    Tax.DAO.RecordDAO.call(this);
    this.Name = 'UnitsTypeDAO';
    this.recordType = 'unitstype';
};

dao.UnitsTypeDAO.prototype = Object.create(Tax.DAO.RecordDAO.prototype);

//TODO: Remove DAO processing in Model method/class
dao.UnitsTypeDAO.prototype.ListObject = function ListObject(row) {
    var listObject = {
        id: row.getValue('internalid'),
        name: row.getValue('name'),
        unitName: row.getValue('unitname'),
        isBaseUnit: row.getValue('baseunit'),
        abbreviation: row.getValue('abbreviation'),
        pluralAbbreviation: row.getValue('pluralabbreviation'),
        conversionRate: row.getValue('conversionrate')
    };
    return listObject;
};

dao.UnitsTypeDAO.prototype.prepareSearch = function prepareSearch(params) {
    if (!params || !params.unitsTypeIdList) {
        throw nlapiCreateError('INVALID_PARAMETER', 'Invalid UnitsTypeDAO params');
    }

    this.columns.push(new nlobjSearchColumn('internalid'));
    this.columns.push(new nlobjSearchColumn('name'));
    this.columns.push(new nlobjSearchColumn('unitname'));
    this.columns.push(new nlobjSearchColumn('baseunit'));
    this.columns.push(new nlobjSearchColumn('abbreviation'));
    this.columns.push(new nlobjSearchColumn('pluralabbreviation'));
    this.columns.push(new nlobjSearchColumn('conversionrate'));

    if (params.unitsTypeIdList) {
        this.filters.push(new nlobjSearchFilter('internalid', null, 'anyof', params.unitsTypeIdList));
    }
};

dao.UnitsTypeDAO.prototype.process = function(result, params) {
    var combinedResult = result.dao;

    if (base.isUnitsOfMeasureEnabled) {
        var unitsTypeIdList = [];

        for (var i = 0; i < result.dao.items.length; i++) {
            var item = result.dao.items[i];
            if (item.unitsTypeId && unitsTypeIdList.indexOf(item.unitsTypeId) == -1) {
                unitsTypeIdList.push(item.unitsTypeId);
            }
        }

        combinedResult.unitsTypes = unitsTypeIdList.length > 0 ? this.getList({ unitsTypeIdList: unitsTypeIdList }) : [];
    }

    var newResult = {
        dao: combinedResult
    };

    return newResult;
};

adapter.CONSTANTS = {
    ALLOWED_UOM: ['kg', 't', 'm', 'ks']
};

adapter.ItemSectionAdapter = function ItemSectionAdapter(errorHandler) {
    adapter.SectionAAdapter.call(this);
};

adapter.ItemSectionAdapter.prototype = Object.create(adapter.SectionAAdapter.prototype);

adapter.ItemSectionAdapter.prototype.getLineData = function getLineData(line) {
    // Override
};

adapter.ItemSectionAdapter.prototype.getUnitOfMeasure = function getUnitOfMeasure(uom) {
    if (uom && adapter.CONSTANTS.ALLOWED_UOM.indexOf(uom.toLowerCase()) > -1) {
        return uom;
    }

    return '';
};

adapter.ItemSectionAdapter.prototype.getCode = function getCode(param) {
    if(!param) {
        return '';
    }

    var matches = param.match(/([A-Z]*) - .*/);
    return matches[1];
};

adapter.ItemSectionAdapter.prototype.process = function process(result, params) {
    if(!result || !result.dao) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'result.dao is required');
    }
    var dao = result.dao;

    this.rawdata = dao.savedReport;
    this.itemUnitsTypeMap = base.isUnitsOfMeasureEnabled ? this.createItemUnitsTypeMap(dao.items) : {};
    this.unitsTypeUnitMap = base.isUnitsOfMeasureEnabled ? this.createUnitsTypeUnitMap(dao.unitsTypes): {};

    return {
        dao: this.rawdata,
        adapter: this.transform(params)
    };
};

adapter.ItemSectionAdapter.prototype.createItemUnitsTypeMap = function createItemUnitsTypeMap(items) {
    if(!items) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'items is required');
    }
    var itemUnitsTypeMap = {};

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        itemUnitsTypeMap[item.id] = item.unitsTypeId;
    }

    return itemUnitsTypeMap;
};

adapter.ItemSectionAdapter.prototype.createUnitsTypeUnitMap = function createUnitsTypeUnitMap(unitsTypes) {
    if(!unitsTypes) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'unitsTypes is required');
    }
    try {
        var unitsTypeUnitMap = {};

        for (var i = 0; i < unitsTypes.length; i++) {
            var unit = unitsTypes[i];

            if (!unitsTypeUnitMap[unit.id]) {
                unitsTypeUnitMap[unit.id] = [];
            }

            unitsTypeUnitMap[unit.id].push({
                isBaseUnit: unit.isBaseUnit,
                abbreviation: unit.abbreviation,
                pluralAbbreviation: unit.pluralAbbreviation,
                conversionRate: unit.conversionRate
            });
        }

        return unitsTypeUnitMap;
    } catch (ex) {
        logException(ex, 'ItemSectionAdapter.createUnitsTypeUnitMap');
        throw ex;
    }
};

adapter.ItemSectionAdapter.prototype.convertQuantity = function convertQuantity(itemId, quantity, unitOfMeasure) {
    try {
        var convertedQuantity = Math.abs(quantity);

        if (!unitOfMeasure || !quantity) {
            return convertedQuantity;
        }

        var unitTypeId = this.itemUnitsTypeMap[itemId];

        if (unitTypeId == undefined) {
            return convertedQuantity;
        }

        var unit = this.unitsTypeUnitMap[unitTypeId];

        if (unit == undefined) {
            return convertedQuantity;
        }

        for (var i = 0; i < unit.length; i++) {
            var uom = unit[i];
            if (uom.abbreviation == unitOfMeasure || uom.pluralAbbreviation == unitOfMeasure) {
                convertedQuantity = convertedQuantity / uom.conversionRate;
            }
        }

        return convertedQuantity;
    } catch (ex) {
        logException(ex, 'ItemSectionAdapter.convertQuantity');
        throw ex;
    }
};

/*************************
 * ISSUED INVOICES - A.1 *
 *************************/
adapter.SectionA1Adapter = function SectionA1Adapter(errorHandler) {
    adapter.SectionAAdapter.call(this);
    this.errorHandler = errorHandler;
    this.taxCodes = ['S', 'R'];
    this.taxCodeLookup = VAT.TaxCodeLookup.getInstance('SK', VAT.SK.TaxCodeDefinition());
    this.Name = 'SectionA1Adapter';
    this.daos = ['VCS_SK_CustomerInvoiceDAO'];
};

adapter.SectionA1Adapter.prototype = Object.create(adapter.SectionAAdapter.prototype);

adapter.SectionA1Adapter.prototype.getLineData = function getLineData(line) {
    if (!line) {
        throw nlapiCreateError('INVALID_PARAMETER', 'Invalid SectionA1 line data');
    }

    var data = {};
    data.line = line.index ? line.index++ : 0;
    data.entityTaxNumber = line.entityTaxNumber || '';
    data.transactionId = line.documentNumber || line.transactionNumber || '';
    data.transactionDate = line.date || '';
    data.netAmount = parseFloat(line.netAmount) || 0;
    data.taxAmount = parseFloat(line.taxAmount) || 0;
    data.taxRate = line.taxRate || '';
    data.correctionCode = '';
    return data;
};

adapter.SectionA1Adapter.prototype.transform = function transform(params) {
    try {
        var data = [];
        var keyToDataMap = {};
        var line = null;

        for (var i = 0; i < this.rawdata.length; i++) {
            line = this.rawdata[i];
            line.index = i;

            if ((line.entityTaxNumber || line.entityDICNumber || line.entityICONumber) && this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes)) {
                var lineData = this.getLineData(line);
                if (lineData) {
                    var lineKey = [lineData.transactionId, lineData.taxRate].join('-');
                    if (keyToDataMap[lineKey] != undefined) {
                        data[keyToDataMap[lineKey]].netAmount += lineData.netAmount;
                        data[keyToDataMap[lineKey]].taxAmount += lineData.taxAmount;
                    } else {
                        data.push(lineData);
                        keyToDataMap[lineKey] = data.length - 1;
                    }
                }
            }
        }

        var result = {};
        result[this.Name] = data;
        return result;
    } catch (ex) {
        logException(ex, 'SectionA1Adapter.transform');
        throw ex;
    }
};

/*************************
 * ISSUED INVOICES - A.2 *
 *************************/
adapter.SectionA2Adapter = function SectionA2Adapter(errorHandler) {
    adapter.ItemSectionAdapter.call(this);
    this.errorHandler = errorHandler;
    this.Name = 'SectionA2Adapter';
    this.taxCodes = ['RC'];
    this.taxCodeLookup = VAT.TaxCodeLookup.getInstance('SK', VAT.SK.TaxCodeDefinition());
};

adapter.SectionA2Adapter.prototype = Object.create(adapter.ItemSectionAdapter.prototype);

adapter.SectionA2Adapter.prototype.getLineData = function getLineData(line) {
    if (!line) {
        throw nlapiCreateError('INVALID_PARAMETER', 'Invalid SectionA2Adapter line data');
    }

    try {
        var data = {};
        data.line = line.index++;
        data.entityTaxNumber = line.entityTaxNumber || '';
        data.transactionId = line.documentNumber || line.transactionNumber || '';
        data.transactionDate = line.date || '';
        data.netAmount = line.netAmount || '';
        data.commodityCode = line.commodityCode || '';
        data.typeOfGoods = this.getCode(line.typeOfGoods || '');
        data.quantity = this.convertQuantity(line.itemId, line.quantity, line.unitOfMeasure);
        data.measureUnit = this.getUnitOfMeasure(line.unitOfMeasure || '');
        data.correctionCode = '';
        return data;
    } catch (ex) {
        logException(ex, 'SectionA2Adapter.getLineData');
        throw ex;
    }
};

/******************************
 * RECEIVED INVOICES (Common) *
 ******************************/
dao.SupplierInvoiceDAO = function SupplierInvoiceDAO() {
    Tax.DAO.ReportDAO.call(this);
    this.Name = 'VCS_SK_SupplierInvoiceDAO';
    this.reportName = 'VCS SK - VAT Purchases by Transaction';
};

dao.SupplierInvoiceDAO.prototype = Object.create(Tax.DAO.ReportDAO.prototype);

dao.SupplierInvoiceDAO.prototype.ListObject = function ListObject() {
    return {
        tranId: '',
        vatNo: '',
        transactionType: '',
        transactionNumber: '',
        documentNumber: '',
        transactionDate: '',
        taxCode: '',
        taxRate: '',
        notionalRate: '',
        netAmount: '',
        taxAmount: '',
        notionalAmount: '',
        cashRegister: ''
    };
};

dao.SupplierInvoiceDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    var column = {};

    try {
        var pivotReportColumns = this.getColumns(pivotReport);
        column.tranId = pivotReportColumns[0];
        column.vatNo = pivotReportColumns[1];
        column.transactionType = pivotReportColumns[2];
        column.transactionNumber = pivotReportColumns[3];
        column.documentNumber = pivotReportColumns[4];
        column.transactionDate = pivotReportColumns[5];
        column.taxCode = pivotReportColumns[6];
        column.taxRate = pivotReportColumns[7];
        column.notionalRate = pivotReportColumns[8];
        column.netAmount = pivotReportColumns[9];
        column.taxAmount = pivotReportColumns[10],
        column.notionalAmount = pivotReportColumns[11],
        column.cashRegister = pivotReportColumns[12];
    } catch (ex) {
        logException(ex, 'SupplierInvoiceDAO.getColumnMetadata');
        throw ex;
    }

    return column;
};

/***************************
 * RECEIVED INVOICES - B.1 *
 ***************************/
adapter.SectionB1Adapter = function SectionB1Adapter(errorHandler) {
    Tax.Adapter.BaseAdapter.call(this);
    this.errorHandler = errorHandler;
    this.Name = 'SectionB1Adapter';
    this.daos = ['VCS_SK_SupplierInvoiceDAO'];
    this.taxCodes = ['RC', 'ER', 'ES', 'ESSP', 'IS', 'ESND', 'ERND', 'ESSPND', 'ISND'];
    this.nonDeductibleTaxCodes = ['ESND', 'ERND', 'ESSPND', 'ISND'];
    this.taxCodeLookup = VAT.TaxCodeLookup.getInstance('SK', VAT.SK.TaxCodeDefinition());
};

adapter.SectionB1Adapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

adapter.SectionB1Adapter.prototype.getLineData = function _getLineData(line) {
    if (!line) {
        throw nlapiCreateError('INVALID_PARAMETER', 'Invalid SectionB1 line data');
    }

    var data = {};

    data.tranId = line.tranId;
    data.entityTaxNumber = line.vatNo;
    data.transactionId = line.documentNumber || line.transactionNumber || '';
    data.transactionDate = line.transactionDate;
    data.netAmount = parseFloat(line.netAmount) || 0;
    data.taxAmount = this.getTaxAmount(line);
    data.taxCode = line.taxCode;
    data.taxRate = this.getTaxRate(line);
    data.isCashRegister = line.cashRegister === 'T';
    data.correctionCode = '';
    data.amountOfVATDeduction = this.getDeductibleTaxAmount(line);

    return data;
};

adapter.SectionB1Adapter.prototype.transform = function _transform(params) {
    var result = {};
    var data = [];
    var keyToDataMap = {};
    var line = null;
    var lineKey = '';

    try {
        for (var i = 0; i < this.rawdata.length; i++) {
            line = this.getLineData(this.rawdata[i]);

            if (this.isValidLine(line)) {
                lineKey = [line.tranId, line.taxRate].join('-');

                if (keyToDataMap[lineKey] != undefined) {
                    data[keyToDataMap[lineKey]].netAmount += line.netAmount;
                    data[keyToDataMap[lineKey]].taxAmount += line.taxAmount;
                    data[keyToDataMap[lineKey]].amountOfVATDeduction += line.amountOfVATDeduction;
                } else {
                    data.push(line);
                    keyToDataMap[lineKey] = data.length - 1;
                }
            }
        }

        result[this.Name] = data;
        return result;
    } catch(e) {
        logException(e, 'SectionB1Adapter.transform');
        throw e;
    }
};

adapter.SectionB1Adapter.prototype.getTaxAmount = function getTaxAmount(line) {
    return parseFloat(line.notionalAmount) || 0;
};

adapter.SectionB1Adapter.prototype.getTaxRate = function getTaxRate(line) {
    return (base.getNotionalRate(line) * 100) || 0;
};

adapter.SectionB1Adapter.prototype.isValidLine = function isValidLine(line) {
    return this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes);
};

adapter.SectionB1Adapter.prototype.getDeductibleTaxAmount = function getDeductibleTaxAmount(line) {
    return this.taxCodeLookup.anyOf(line.taxCode, this.nonDeductibleTaxCodes) ? 0 : (parseFloat(line.notionalAmount) || 0);
};


/******************************************
 * RECEIVED INVOICES - B.2 *
 *****************************************/
dao.NonDeductibleSupplierInvoiceDAO = function NonDeductibleTaxSuppDAO() {
    Tax.DAO.NonDeductibleTaxDetailDAO.call(this);
    this.Name = 'VCS_SK_NonDeductibleSupplierInvoiceDAO';
    this.fields = {
        tranId: {name: 'internalid', summary: 'GROUP'},
        memo: {name:'memo', summary:'GROUP'},
        debitAmount: {},
        creditAmount: {},
        taxAmount: {},
        taxCode: {},
        taxRate: {},
        id: {name: 'internalid', summary: 'GROUP'},
        vatNo: {name:'vatregnumber', join:'vendor', summary:'GROUP'},
        documentNumber: {name:'tranid', summary:'GROUP'},
        transactionNumber: {name:'transactionnumber', summary:'GROUP'}
    };
    this.taxCodeLookup = VAT.TaxCodeLookup.getInstance('SK', VAT.SK.TaxCodeDefinition());
    this.taxcodeNames = getNDTaxcodeNames();

    function getNDTaxcodeNames() {
        var taxcodeNames = {};
        var filters = [new nlobjSearchFilter('country', null, 'anyof', 'SK'),
                       new nlobjSearchFilter('custrecord_4110_non_deductible', null, 'is', 'T', null, 1, 0, true),
                       new nlobjSearchFilter('custrecord_4110_nondeductible_parent', null, 'noneof', '@NONE@', null, 0, 1)];
        var sr = nlapiSearchRecord('salestaxitem', null, filters, new nlobjSearchColumn('itemid'));

        for (var isr = 0; sr && isr < sr.length; isr++) {
            taxcodeNames[sr[isr].getId()] = sr[isr].getValue('itemid');
        }
        return taxcodeNames;
    }
};
dao.NonDeductibleSupplierInvoiceDAO.prototype = Object.create(Tax.DAO.NonDeductibleTaxDetailDAO.prototype);

dao.NonDeductibleSupplierInvoiceDAO.prototype.rowToObject = function rowToObject(row) {
    var rowObject = new this.ListObject();
    for (var f in this.fields) {
        var column = this.fields[f];
        rowObject[f] = row.getValue(column.name, column.join ? column.join : null, column.summary);
    }
    var rawVatNo = rowObject.vatNo;
    var taxcodeId = getTaxCodeIdFromMemo(rowObject.memo);
    rowObject.taxCode = this.taxcodeNames[taxcodeId];
    rowObject.taxAmount = rowObject.debitAmount ? -Math.abs(rowObject.amount) : Math.abs(rowObject.amount);
    rowObject.taxRate = this.taxCodeLookup.getPairDeductDetails(rowObject.taxCode, 'SK') ? this.taxCodeLookup.getPairDeductDetails(rowObject.taxCode, 'SK').rate : '';
    rowObject.netAmount = 0;
    rowObject.vatNo = rawVatNo == '- None -' ? '' : rawVatNo;
    return rowObject;

    function getTaxCodeIdFromMemo(memo) {
        var strToSplit = '|Tax Code:';
        var splitStr = memo ? memo.split(strToSplit) : [];
        var taxcodeId = splitStr.length > 0 ? splitStr[1] : '';
        return taxcodeId;
    }
};

adapter.SectionB2KeyToDataMap = {};
adapter.SectionB2Adapter = function SectionB2Adapter(errorHandler) {
    adapter.SectionB1Adapter.call(this);
    this.Name = 'SectionB2Adapter';
    this.taxCodes = ['S', 'R', 'Deduct_S', 'Deduct_R'];
};

adapter.SectionB2Adapter.prototype = Object.create(adapter.SectionB1Adapter.prototype);

adapter.SectionB2Adapter.prototype.getTaxAmount = function getTaxAmount(line) {
    return parseFloat(line.taxAmount) || 0;
};

adapter.SectionB2Adapter.prototype.getTaxRate = function getTaxRate(line) {
    return line.taxRate || 0;
};

adapter.SectionB2Adapter.prototype.isValidLine = function isValidLine(line) {
    if (line) {
        var vatNo = (line.entityTaxNumber || '').toUpperCase().trim();
        return vatNo.indexOf('SK') == 0 && !line.isCashRegister && this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes);
    }
    return false;
};

adapter.SectionB2Adapter.prototype.getDeductibleTaxAmount = function getDeductibleTaxAmount(line) {
    return parseFloat(line.taxAmount) || 0;
};

adapter.SectionB2Adapter.prototype.transform = function transform(params) {
    var result = {};
    var data = [];
    var keyToDataMap = Tax.Supplementary.VCS.SK.Adapter.SectionB2KeyToDataMap;
    var line = null;
    var lineKey = '';

    try {
        for (var i = 0; i < this.rawdata.length; i++) {
            line = this.getLineData(this.rawdata[i]);

            if (this.isValidLine(line)) {
                lineKey = [line.tranId, line.taxRate].join('-');

                if (keyToDataMap[lineKey] != undefined) {
                    data[keyToDataMap[lineKey]].netAmount += line.netAmount;
                    data[keyToDataMap[lineKey]].taxAmount += line.taxAmount;
                    data[keyToDataMap[lineKey]].amountOfVATDeduction += line.amountOfVATDeduction;
                } else {
                    data.push(line);
                    keyToDataMap[lineKey] = data.length - 1;
                }
            }
        }

        result[this.Name] = data;
        return result;
    } catch(e) {
        logException(e, 'SectionB2Adapter.transform');
        throw e;
    }
};

adapter.SectionB2NDAdapter = function SectionB2NDAdapter(errorHandler) {
    adapter.SectionB2Adapter.call(this);
    this.Name = 'SectionB2Adapter';
    this.taxCodes = ['NonDeduct_S', 'NonDeduct_R'];
    this.daos = ['VCS_SK_NonDeductibleSupplierInvoiceDAO'];
};
adapter.SectionB2NDAdapter.prototype = Object.create(Tax.Supplementary.VCS.SK.Adapter.SectionB2Adapter.prototype);

adapter.SectionB2NDAdapter.prototype.isValidLine = function isValidLine(line) {
    return this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes);
};

adapter.SectionB2NDAdapter.prototype.transform = function(params) {
    if (!this.rawdata) {
        //insert error handling here
    }
    try {
        var result = {};
        var keyToDataMap = Tax.Supplementary.VCS.SK.Adapter.SectionB2KeyToDataMap;
        var resultFromSectionB2Adapter = params.result.adapter[this.Name];
        var line = null;
        var lineKey = '';

        for (var i = 0; i < this.rawdata.length; i++) {
            line = this.rawdata[i];
            if (this.isValidLine(line)) {
                lineKey = [line.tranId, line.taxRate].join('-');
                if (keyToDataMap[lineKey] != undefined) {
                    resultFromSectionB2Adapter[keyToDataMap[lineKey]].amountOfVATDeduction += parseFloat(line.taxAmount) || 0;
                }
            }
        }

        result[this.Name] = resultFromSectionB2Adapter;
        return result;
    } catch (ex) {
        logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionB2NDAdapter.transform');
        throw ex;
    }
};

/******************************************
 * RECEIVED INVOICES - B.3 *
 *****************************************/
dao.SupplierCashRegisterDAO = function SupplierCashRegisterDAO() {
    Tax.DAO.ReportDAO.call(this);
    this.Name = 'VCS_SK_SupplierCashRegisterDAO';
    this.reportName = 'VCS SK - VAT Cash Register Purchases';
};

dao.SupplierCashRegisterDAO.prototype = Object.create(Tax.DAO.ReportDAO.prototype);

dao.SupplierCashRegisterDAO.prototype.ListObject = function ListObject() {
    return {
        tranId: '',
        entityVatNo: '',
        entityLineVatNo: '',
        taxCode: '',
        netAmount: '',
        taxAmount: '',
        notionalAmount: '',
        transactionType: '',
        cashRegister: ''
    };
};

dao.SupplierCashRegisterDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    var column = {};

    try {
        var pivotReportColumns = this.getColumns(pivotReport);
        column.tranId = pivotReportColumns[0];
        column.entityVatNo = pivotReportColumns[1];
        column.entityLineVatNo = pivotReportColumns[2];
        column.taxCode = pivotReportColumns[3];
        column.netAmount = pivotReportColumns[4];
        column.taxAmount = pivotReportColumns[5],
        column.notionalAmount = pivotReportColumns[6],
        column.transactionType = pivotReportColumns[7];
        column.cashRegister = pivotReportColumns[8];
    } catch (ex) {
        logException(ex, 'SupplierCashRegisterDAO.getColumnMetadata');
        throw ex;
    }

    return column;
};

adapter.SectionB3Adapter = function SectionB3Adapter(errorHandler) {
    Tax.Adapter.BaseAdapter.call(this);
    this.Name = 'SectionB3Adapter';
    this.daos = ['VCS_SK_SupplierCashRegisterDAO'];
    this.taxCodes = ['S', 'R'];
    this.taxCodeLookup = VAT.TaxCodeLookup.getInstance('SK', VAT.SK.TaxCodeDefinition());
};

adapter.SectionB3Adapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

adapter.SectionB3Adapter.prototype.getLineData = function _getLineData(line) {
    if (!line) {
        throw nlapiCreateError('INVALID_PARAMETER', 'Invalid SectionB3 line data');
    }

    var data = {};

    data.tranId = line.tranId || '';
    data.entityTaxNumber = this.getVATNumber(line);
    data.taxCode = line.taxCode;
    data.netAmount = parseFloat(line.netAmount) || 0;
    data.taxAmount = parseFloat(line.taxAmount || line.notionalAmount) || 0;
    data.transactionType = line.transactionType;
    data.isCashRegister = line.cashRegister === 'T';
    data.amountOfVATDeduction = parseFloat(line.taxAmount || line.notionalAmount) || 0;

    return data;
};

adapter.SectionB3Adapter.prototype.getVATNumber = function _getVATNumber(line) {
    var vatNo = '';

    if (line) {
        if (line.transactionType !== 'EXPREPT') {
            vatNo = line.entityVatNo || line.entityLineVatNo || '';
        }
    }

    return vatNo;
};

adapter.SectionB3Adapter.prototype.isValidVendorBill = function _isValidVendorBill(line) {
    return line && line.transactionType == 'BILL' && line.isCashRegister
        && this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes);
};

adapter.SectionB3Adapter.prototype.isValidTransaction = function _isValidTransaction(line) {
    // Expense Report, Journal, and Check
    return line && line.transactionType !== 'BILL' && this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes);
};

adapter.SectionB3Adapter.prototype.isValidLine = function _isValidLine(line) {
    return this.isValidVendorBill(line) || this.isValidTransaction(line);
};

adapter.SectionB3Adapter.prototype.compile = function _compile(params) {
    var data = {
        netAmount: 0,
        taxAmount: 0,
        correctionCode: ''
    };

    try {
        for (var i = 0; i < this.rawdata.length; i++) {
            line = this.getLineData(this.rawdata[i]);

            if (this.isValidLine(line)) {
                data.netAmount += line.netAmount;
                data.taxAmount += line.taxAmount;
            }
        }

        return data;
    } catch(e) {
        logException(e, 'SectionB3Adapter.compile');
        throw e;
    }
};

adapter.SectionB3Adapter.prototype.summarize = function _summarize(data) {
    var summary = [];

    if (data) {
        summary = (data.netAmount > 0 || data.taxAmount > 0) ? [data] : [];
    }

    return summary;
};

adapter.SectionB3Adapter.prototype.transform = function _transform(params) {
    var result = {};
    var transactions = this.compile(params);
    result[this.Name] = this.summarize(transactions);
    return result;
};

/******************************************
 * RECEIVED INVOICES - B.3.1 *
 *****************************************/
adapter.SectionB3_1KeyToDataMap = {};
adapter.SectionB3_1Adapter = function SectionB3_1Adapter(errorHandler) {
    adapter.SectionB3Adapter.call(this);
    this.Name = 'SectionB3_1Adapter';
    this.TAX_THRESHOLD = 3000;
    this.taxCodes = ['S', 'R', 'Deduct_S', 'Deduct_R', 'NonDeduct_S', 'NonDeduct_R'];
};
adapter.SectionB3_1Adapter.prototype = Object.create(adapter.SectionB3Adapter.prototype);

adapter.SectionB3_1Adapter.prototype.transform = function _transform(params) {
    var transactions = [];
    var keyToDataMap = Tax.Supplementary.VCS.SK.Adapter.SectionB3_1KeyToDataMap;
    var line = null;
    var result = {};
    var lineKey = '';

    try {
        for (var i = 0; i < this.rawdata.length; i++) {
            line = this.getLineData(this.rawdata[i]);
            if (this.isValidLine(line)) {
                var isNonDeductible = this.taxCodeLookup.taxCodes[line.taxCode].IsNonDeductible;
                lineKey = [line.tranId, line.entityTaxNumber].join('-');
                if (keyToDataMap[lineKey] != undefined) {
                    transactions[keyToDataMap[lineKey]].netAmount += line.netAmount;
                    transactions[keyToDataMap[lineKey]].taxAmount += line.taxAmount;
                    if (!isNonDeductible) {
                        transactions[keyToDataMap[lineKey]].amountOfVATDeduction += line.amountOfVATDeduction;
                    }

                } else {
                    transactions.push({
                        entityTaxNumber: line.entityTaxNumber,
                        netAmount: line.netAmount,
                        taxAmount: line.taxAmount,
                        correctionCode: '',
                        amountOfVATDeduction: isNonDeductible ? 0 : line.amountOfVATDeduction
                    });

                    keyToDataMap[lineKey] = transactions.length - 1;
                }
            }
        }

        result[this.Name] = transactions;
        return result;
    } catch(e) {
        logException(e, this.Name + '.transform');
        throw e;
    }
};

adapter.SectionB3_1NDAdapter = function SectionB3_1NDAdapter(errorHandler) {
    adapter.SectionB3_1Adapter.call(this);
    this.Name = 'SectionB3_1Adapter';
    this.taxCodes = ['NonDeduct_S', 'NonDeduct_R'];
    this.daos = ['VCS_SK_NonDeductibleSupplierInvoiceDAO'];
};
adapter.SectionB3_1NDAdapter.prototype = Object.create(Tax.Supplementary.VCS.SK.Adapter.SectionB3_1Adapter.prototype);

adapter.SectionB3_1NDAdapter.prototype.isValidLine = function isValidLine(line) {
    return this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes);
};

adapter.SectionB3_1NDAdapter.prototype.transform = function _transform(params) {
    var result = {};
    var transactions = this.compile(params);
    result[this.Name] = this.summarize(transactions);
    return result;
};

adapter.SectionB3_1NDAdapter.prototype.compile = function(params) {
    if (!this.rawdata) {
        //insert error handling here
    }
    try {
        var keyToDataMap = Tax.Supplementary.VCS.SK.Adapter.SectionB3_1KeyToDataMap;
        var resultFromSectionB3_1Adapter = params.result.adapter[this.Name];
        var line = null;
        var lineKey = '';

        for (var i = 0; i < this.rawdata.length; i++) {
            line = this.rawdata[i];

            if (this.isValidLine(line)) {
                lineKey = [line.tranId, line.vatNo].join('-');
                if (keyToDataMap[lineKey] != undefined) {
                    resultFromSectionB3_1Adapter[keyToDataMap[lineKey]].amountOfVATDeduction += parseFloat(line.taxAmount) || 0;
                }
            }
        }

        return resultFromSectionB3_1Adapter;
    } catch (ex) {
        logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionB3_1NDAdapter.compile');
        throw ex;
    }
};

adapter.SectionB3_1NDAdapter.prototype.summarize = function _summarize(transactions) {
    var transaction = null;
    var summary = {
        netAmount: 0,
        taxAmount: 0,
        correctionCode: '',
        amountOfVATDeduction: 0
    };

    try {
        for (var i = 0; i < transactions.length; i++) {
            transaction = transactions[i];

            if (transaction.amountOfVATDeduction < this.TAX_THRESHOLD) {
                summary.netAmount += transaction.netAmount;
                summary.taxAmount += transaction.taxAmount;
                summary.amountOfVATDeduction += transaction.amountOfVATDeduction;
            }
        }

        return (summary.netAmount > 0 || summary.taxAmount > 0) ? [summary] : [];
    } catch (e) {
        logException(e, 'Tax.Supplementary.VCS.CZ.Adapter.SectionB3_1NDAdapter.summarize');
        throw e;
    }
};

/******************************************
 * RECEIVED INVOICES - B.3.2 *
 *****************************************/
adapter.SectionB3_2KeyToDataMap = {};
adapter.SectionB3_2Adapter = function SectionB3_2Adapter(errorHandler) {
    adapter.SectionB3_1Adapter.call(this);
    this.Name = 'SectionB3_2Adapter';
    this.taxCodes = ['S', 'R', 'Deduct_S', 'Deduct_R', 'NonDeduct_S', 'NonDeduct_R'];
};

adapter.SectionB3_2Adapter.prototype = Object.create(adapter.SectionB3_1Adapter.prototype);

adapter.SectionB3_2Adapter.prototype.transform = function _transform(params) {
    var transactions = [];
    var keyToDataMap = Tax.Supplementary.VCS.SK.Adapter.SectionB3_2KeyToDataMap;
    var line = null;
    var result = {};
    var lineKey = '';

    try {
        for (var i = 0; i < this.rawdata.length; i++) {
            line = this.getLineData(this.rawdata[i]);
            if (this.isValidLine(line)) {
                var isNonDeductible = this.taxCodeLookup.taxCodes[line.taxCode].IsNonDeductible;
                lineKey = [line.tranId, line.entityTaxNumber].join('-');
                if (keyToDataMap[lineKey] != undefined) {
                    transactions[keyToDataMap[lineKey]].netAmount += line.netAmount;
                    transactions[keyToDataMap[lineKey]].taxAmount += line.taxAmount;
                    if (!isNonDeductible) {
                        transactions[keyToDataMap[lineKey]].amountOfVATDeduction += line.amountOfVATDeduction;
                    }

                } else {
                    transactions.push({
                        entityTaxNumber: line.entityTaxNumber,
                        netAmount: line.netAmount,
                        taxAmount: line.taxAmount,
                        correctionCode: '',
                        amountOfVATDeduction: isNonDeductible ? 0 : line.amountOfVATDeduction
                    });

                    keyToDataMap[lineKey] = transactions.length - 1;
                }
            }
        }

        result[this.Name] = transactions;
        return result;
    } catch(e) {
        logException(e, this.Name + '.transform');
        throw e;
    }
};

adapter.SectionB3_2NDAdapter = function SectionB3_2NDAdapter(errorHandler) {
    adapter.SectionB3_2Adapter.call(this);
    this.Name = 'SectionB3_2Adapter';
    this.taxCodes = ['NonDeduct_S', 'NonDeduct_R'];
    this.daos = ['VCS_SK_NonDeductibleSupplierInvoiceDAO'];
};
adapter.SectionB3_2NDAdapter.prototype = Object.create(Tax.Supplementary.VCS.SK.Adapter.SectionB3_2Adapter.prototype);

adapter.SectionB3_2NDAdapter.prototype.isValidLine = function isValidLine(line) {
    return this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes);
};

adapter.SectionB3_2NDAdapter.prototype.transform = function _transform(params) {
    var result = {};
    var transactions = this.compile(params);
    var filteredResult = this.filterResult(transactions);
    result[this.Name] = this.mergeTxnByVendor(filteredResult);
    return result;
};

adapter.SectionB3_2NDAdapter.prototype.compile = function _compile(params) {
    if (!this.rawdata) {
        //insert error handling here
    }
    try {
        var keyToDataMap = Tax.Supplementary.VCS.SK.Adapter.SectionB3_2KeyToDataMap;
        var resultFromSectionB3_2Adapter = params.result.adapter[this.Name];
        var line = null;
        var lineKey = '';

        for (var i = 0; i < this.rawdata.length; i++) {
            line = this.rawdata[i];
            if (this.isValidLine(line)) {
                lineKey = [line.tranId, line.vatNo].join('-');
                if (keyToDataMap[lineKey] != undefined) {
                    resultFromSectionB3_2Adapter[keyToDataMap[lineKey]].amountOfVATDeduction += parseFloat(line.taxAmount) || 0;
                }
            }
        }

        return resultFromSectionB3_2Adapter;
    } catch (ex) {
        logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionB3_2NDAdapter.compile');
        throw ex;
    }
};

adapter.SectionB3_2NDAdapter.prototype.filterResult = function _filterResult(transactions) {
    var row = null;
    var filteredResult = [];

    try {
        for (var i = 0; i < transactions.length; i++) {
            row = transactions[i];
            if (row.amountOfVATDeduction >= this.TAX_THRESHOLD) {
                filteredResult.push(row);
            }
        }

        return filteredResult;
    } catch (e) {
        logException(e, 'Tax.Supplementary.VCS.CZ.Adapter.SectionB3_2NDAdapter.filterResult');
        throw e;
    }
};

adapter.SectionB3_2NDAdapter.prototype.mergeTxnByVendor = function _mergeTxnByVendor(transactions) {
    var row = null;
    var mergedResult = [];
    var keyToDataMap = {};

    try {
        for (var i = 0; i < transactions.length; i++) {
            row = transactions[i];
            var lineKey = row.entityTaxNumber;

            if (keyToDataMap[lineKey] != undefined) {
                mergedResult[keyToDataMap[lineKey]].netAmount += row.netAmount;
                mergedResult[keyToDataMap[lineKey]].taxAmount += row.taxAmount;
                mergedResult[keyToDataMap[lineKey]].amountOfVATDeduction += row.amountOfVATDeduction;
            } else {
                mergedResult.push({
                    entityTaxNumber: row.entityTaxNumber,
                    netAmount: row.netAmount,
                    taxAmount: row.taxAmount,
                    correctionCode: '',
                    amountOfVATDeduction: row.amountOfVATDeduction
                });

                keyToDataMap[lineKey] = mergedResult.length - 1;
            }
        }

        return mergedResult;
    } catch (e) {
        logException(e, 'Tax.Supplementary.VCS.CZ.Adapter.SectionB3_2NDAdapter.mergedResult');
        throw e;
    }
};

/*****************************
 * CORRECTIVE INVOICES - C.1 *
 *****************************/
dao.CustomerCreditsDAO = function CustomerCreditsDAO() {
    Tax.DAO.ReportDAO.call(this);
    this.Name = 'VCS_SK_CustomerCreditsDAO';
    this.reportName = 'VCS SK - Sales Returns by Txn, Item, Tax Code';
};

dao.CustomerCreditsDAO.prototype = Object.create(Tax.DAO.ReportDAO.prototype);

dao.CustomerCreditsDAO.prototype.ListObject = function ListObject(id) {
    return {
        id: id,
        vatNo: '',
        type: '',
        transactionNumber: '',
        documentNumber: '',
        date: '',
        item: '',
        commodityCode: '',
        typeOfGood: '',
        quantity: '',
        unit: '',
        taxCode: '',
        taxRate: '',
        notionalRate: '',
        netAmount: '',
        taxAmount: '',
        notionalAmount: '',
        entityDICNumber: '',
        entityICONumber: ''
    };
};

dao.CustomerCreditsDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    var column = {};
    try {
        var pivotReportColumns = this.getColumns(pivotReport);
        column.id = pivotReportColumns[0];
        column.vatNo = pivotReportColumns[1];
        column.type = pivotReportColumns[2];
        column.transactionNumber = pivotReportColumns[3];
        column.documentNumber = pivotReportColumns[4];
        column.date = pivotReportColumns[5];
        column.itemId = pivotReportColumns[6];
        column.commodityCode = pivotReportColumns[7];
        column.typeOfGood = pivotReportColumns[8];
        column.quantity = pivotReportColumns[9];
        column.unit = pivotReportColumns[10];
        column.taxCode = pivotReportColumns[11];
        column.taxRate = pivotReportColumns[12];
        column.notionalRate = pivotReportColumns[13];
        column.netAmount = pivotReportColumns[14];
        column.taxAmount = pivotReportColumns[15];
        column.notionalAmount = pivotReportColumns[16];
        column.entityDICNumber = pivotReportColumns[17];
        column.entityICONumber = pivotReportColumns[18];
    } catch (ex) {
        logException(ex, 'CustomerCreditsDAO.getColumnMetadata');
        throw ex;
    }
    return column;
};

dao.CustomerCreditApplicationsDAO = function CustomerCreditApplicationsDAO() {
    Tax.DAO.SearchDAO.call(this);
    this.Name = 'VCS_SK_CustomerCreditApplicationsDAO';
    this.searchId = 'customsearch_vcs_sk_credit_applications';
    this.searchType = 'transaction';
    this.filters = [];
};

dao.CustomerCreditApplicationsDAO.prototype = Object.create(Tax.DAO.SearchDAO.prototype);

dao.CustomerCreditApplicationsDAO.prototype.prepareSearch = function prepareSearch(params) {
    if (!this.searchId) {
        throw nlapiCreateError('MISSING_SEARCH_ID', 'Please provide the ID of the saved search.');
    }

    if (!this.searchType) {
        throw nlapiCreateError('MISSING_SEARCH_TYPE', 'Please provide the saved search type.');
    }

    if (params && params.internalId) {
        this.filters.push(new nlobjSearchFilter('internalid', null, 'anyof', params.internalId));
    }
};

dao.CustomerCreditApplicationsDAO.prototype.ListObject = function ListObject() {
    return {
        id: '',
        appliedToTransaction: '',
        appliedAmount: ''
    };
};

dao.CustomerCreditApplicationsDAO.prototype.rowToObject = function rowToObject(row) {
    var obj = new this.ListObject();
    obj.id = row.getValue('internalid');
    obj.appliedToTransaction = row.getValue('appliedtotransaction');
    obj.appliedAmount = row.getValue('appliedtolinkamount');

    return obj;
};

//TODO
dao.CustomerCreditApplicationsDAO.prototype.process = function(result, params) {
    try{
        var combinedResult = {};
        combinedResult.savedReport = result.dao;

        var internalId = [];

        for (var i = 0; result.dao && i < result.dao.length; i++) {
            var line = result.dao[i];

            if (internalId.indexOf(line.id) == -1) {
                internalId.push(line.id);
            }
        }

        combinedResult.creditApplications = internalId.length > 0 ? this.getList({ internalId: internalId }) : [];

        var newResult = {
            dao: combinedResult
        };

        return newResult;
    } catch (ex) {
        logException(ex, 'CustomerCreditApplicationsDAO.process');
        throw ex;
    }
};

dao.CorrectedTransactionDetailsDAO = function CorrectedTransactionDetailsDAO() {
    dao.CustomerCreditApplicationsDAO.call(this);
    this.Name = 'VCS_SK_CorrectedTransactionDetailsDAO';
    this.searchId = 'customsearch_vcs_sk_corrected_txn_detail';
    this.filters = [];
    this.columns = [];
};

dao.CorrectedTransactionDetailsDAO.prototype = Object.create(dao.CustomerCreditApplicationsDAO.prototype);

dao.CorrectedTransactionDetailsDAO.prototype.prepareSearch = function prepareSearch(params) {
    if (!this.searchId) {
        throw nlapiCreateError('MISSING_SEARCH_ID', 'Please provide the ID of the saved search.');
    }

    if (!this.searchType) {
        throw nlapiCreateError('MISSING_SEARCH_TYPE', 'Please provide the saved search type.');
    }

    if (params && params.internalId) {
        this.filters.push(new nlobjSearchFilter('internalid', null, 'anyof', params.internalId));
    }

    if (base.isUnitsOfMeasureEnabled) {
        this.columns.push(new nlobjSearchColumn('unit', null, 'group'));
    }
};

dao.CorrectedTransactionDetailsDAO.prototype.ListObject = function ListObject() {
    return {
        id: '',
        item: '',
        quantity: '',
        unit: '',
        taxCode: '',
        totalAmount: '',
        netAmount: '',
        taxAmount: '',
        transactionNumber: '',
        documentNumber: '',
        origInvoiceRefNo: ''
    };
};

dao.CorrectedTransactionDetailsDAO.prototype.rowToObject = function rowToObject(row) {
    var obj = new this.ListObject();
    obj.id = row.getValue('internalid', null, 'group');
    obj.item = row.getValue('item', null, 'group');
    obj.quantity = row.getValue('quantity', null, 'sum');
    obj.taxCode = row.getValue('taxcode', null, 'group');
    obj.totalAmount = row.getValue('total', null, 'max');
    obj.netAmount = row.getValue('netamount', null, 'sum');
    obj.taxAmount = row.getValue('taxamount', null, 'sum');
    obj.transactionNumber = row.getValue('transactionnumber', null, 'group');
    obj.documentNumber = row.getValue('tranid', null, 'group');
    obj.origInvoiceRefNo = row.getValue('custbody_refno_originvoice', null, 'group');

    if (base.isUnitsOfMeasureEnabled) {
        obj.unit = row.getValue('unit', null, 'group');
    }

    return obj;
};

// TODO
dao.CorrectedTransactionDetailsDAO.prototype.process = function(result, params) {
    var combinedResult = {};
    combinedResult.savedReport = result.dao;
    var internalId = [];

    for (var i = 0; result.dao && i < result.dao.length; i++) {
        var line = result.dao[i];

        if (internalId.indexOf(line.id) == -1) {
            internalId.push(line.id);
        }
    }
    combinedResult.correctedTransactionDetails = internalId.length > 0 ? this.getList({ internalId: internalId }) : [];

    var newResult = {
        dao: combinedResult
    };
    return newResult;
};

dao.SectionC1ItemDAO = function ItemDAO() {
    dao.ItemDAO.call(this);
    this.Name = 'SectionC1ItemDAO';
    this.recordType = 'item';
};

dao.SectionC1ItemDAO.prototype = Object.create(dao.ItemDAO.prototype);

dao.SectionC1ItemDAO.prototype.process = function(result, params) {
    try{
        var combinedResult = {};
        combinedResult.savedReport = result.dao;

        if (base.isUnitsOfMeasureEnabled) {
            var txnIdList = this.constructIdList(result);
            combinedResult.items = txnIdList.length > 0 ? this.getList({ itemIdList: txnIdList }) : [];
        }

        var newResult = {
            dao: combinedResult
        };

        return newResult;
    } catch (ex) {
        logException(ex, 'SectionC1ItemDAO.process');
        throw ex;
    }
};

dao.SectionC1ItemDAO.prototype.constructIdList = function(result) {
    if(!result || !result.dao || !result.dao.savedReport) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'result.dao is required');
    }

    try {
        var creditMemoList = result.dao.savedReport;
        var invoiceList = result.dao.correctedTransactionDetails;

        var itemList = this.getItemsFromList(creditMemoList, 'itemId');
        itemList = itemList.concat(this.getItemsFromList(invoiceList, 'item'));
        itemList = this.getUniqueList(itemList);

        return itemList;
    } catch (ex) {
        logException(ex, 'SectionC1ItemDAO.constructIdList');
        throw ex;
    }
};

dao.SectionC1ItemDAO.prototype.getItemsFromList = function(txnList, itemProperty) {
    if(!txnList || !itemProperty) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'Transaction list is required');
    }

    try {
        var items = [];
        for (var i = 0; i < txnList.length; i++) {
            var item = txnList[i][itemProperty];
            if (item) {
                items.push(item);
            }
        }
        return items;
    } catch (ex) {
        logException(ex, 'SectionC1ItemDAO.getItemsFromList');
        throw ex;
    }
};

dao.SectionC1ItemDAO.prototype.getUniqueList = function(idList) {
    if(!idList) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'List is required');
    }

    try {
        var uniqueList =
            idList.slice().sort(function (a,b) { return a > b; }).reduce(function(a,b) {
            if (a.slice(-1)[0] !== b) {
                a.push(b);
            }
            return a;
        }, []);
        return uniqueList;
    } catch (ex) {
        logException(ex, 'SectionC1ItemDAO.getUniqueList');
        throw ex;
    }
};

adapter.SectionC1Adapter = function SectionC1Adapter(errorHandler) {
    adapter.ItemSectionAdapter.call(this);
    this.errorHandler = errorHandler;
    this.Name = 'SectionC1Adapter';
    this.daos = ['VCS_SK_CustomerCreditsDAO'];
    this.taxCodes = ['S', 'R'];
    this.taxCodeLookup = VAT.TaxCodeLookup.getInstance('SK', VAT.SK.TaxCodeDefinition());
};

adapter.SectionC1Adapter.prototype = Object.create(adapter.ItemSectionAdapter.prototype);

adapter.SectionC1Adapter.prototype.process = function process(result, params) {
    if(!result || !result.dao || !result.dao.savedReport) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'result.dao is required');
    }
    var dao = result.dao;

    this.rawdata = dao.savedReport.savedReport;
    this.itemUnitsTypeMap = base.isUnitsOfMeasureEnabled ? this.createItemUnitsTypeMap(dao.items) : {};
    this.unitsTypeUnitMap = base.isUnitsOfMeasureEnabled ? this.createUnitsTypeUnitMap(dao.unitsTypes): {};
    this.creditApplicationsMap = this.createCreditApplicationsMap(dao.savedReport.creditApplications, dao.savedReport.correctedTransactionDetails);

    return {
        dao: this.rawdata,
        adapter: this.transform(params)
    };
};

adapter.SectionC1Adapter.prototype.createCreditApplicationsMap = function createCreditApplicationsMap(appliedList, transactionDetailsList) {
   if(!transactionDetailsList) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'transactionDetailsList is required');
    }

    try {
        var creditMap = {};
        var applied = {};
        var transactionDetails = {};
        var taxCodeName = '';
        var itemId = '';
        var key = '';

      for (var j = 0; j < transactionDetailsList.length; j++) {
            transactionDetails = transactionDetailsList[j];
            var id = transactionDetails.id;
            creditMap[id] = {};
            creditMap[id].transactionNumber = transactionDetails.transactionNumber;
            creditMap[id].documentNumber = transactionDetails.documentNumber == '- None -' ? '' : transactionDetails.documentNumber;
            creditMap[id].origInvoiceRefNo = transactionDetails.origInvoiceRefNo;
            taxCodeName = this.getTaxCodeNameById(transactionDetails.taxCode);
            itemId = transactionDetails.item;

            creditMap[id][[itemId, taxCodeName].join('-')] = {
                netAmount: parseFloat(transactionDetails.netAmount) || 0,
                taxAmount: Math.abs(transactionDetails.taxAmount),
                transactionNumber: transactionDetails.transactionNumber,
                documentNumber: transactionDetails.documentNumber == '- None -' ? '' : transactionDetails.documentNumber,
                origInvoiceRefNo: transactionDetails.origInvoiceRefNo,
                quantity: transactionDetails.quantity || 0,
                itemId: itemId,
                unit: transactionDetails.unit || ''
            };
        }
        return creditMap;
    } catch (ex) {
        logException(ex, 'SectionC1Adapter.createCreditApplicationsMap');
        throw ex;
    }
};

adapter.SectionC1Adapter.prototype.getTaxCodeNameById = function getTaxCodeNameById(taxCodeId) {
    var taxCodeMap = this.taxCodeLookup.taxCodesMap;

    for (var name in taxCodeMap) {
        if (taxCodeMap[name] == taxCodeId) {
            return name;
        }
    }
};

adapter.SectionC1Adapter.prototype.getLineData = function getLineData(line) {
    if (!line) {
        throw nlapiCreateError('INVALID_PARAMETER', 'Invalid SectionC1Adapter line data');
    }

    try {
        if (!line.vatNo && !line.entityDICNumber && !line.entityICONumber) {
            return null;
        }

        var invoice = this.getInvoiceLine(line);
        if (!invoice) {
            return null;
        }

        var notionalRate = base.getNotionalRate(line);
        var unit = line.unit || invoice.unit || '';
        var taxRate = parseFloat(line.taxRate);
        line.computedTaxAmount = parseFloat(line.taxAmount) || parseFloat(line.notionalAmount) || 0;
        line.computedQuantity = this.convertQuantity(line.itemId, line.quantity, unit) || 0;

        invoice.computedTaxAmount = taxRate ? invoice.taxAmount : (invoice.netAmount * notionalRate);
        invoice.computedQuantity = this.convertQuantity(invoice.itemId, invoice.quantity, unit) || 0;

        var data = {};
        data.line = line.index++;
        data.entityTaxNumber = line.vatNo || '';
        data.transactionId = line.documentNumber || line.transactionNumber || '';
        data.invoiceTransactionId = invoice.origInvoiceRefNo || '';
        data.netAmount = parseFloat(line.netAmount);
        data.taxAmount = line.computedTaxAmount;
        data.taxRate = taxRate || (notionalRate * 100) || '';
        data.commodityCode = line.commodityCode || '';
        data.typeOfGoods = this.getCode(line.typeOfGood || '');
        data.quantity = line.computedQuantity;
        data.measureUnit = this.getUnitOfMeasure(unit);
        data.correctionCode = '';

        var unit = line.unit || '';
        var taxRate = parseFloat(line.taxRate);
        line.computedTaxAmount = parseFloat(line.taxAmount) || parseFloat(line.notionalAmount) || 0;
        line.computedQuantity = this.convertQuantity(line.itemId, line.quantity, unit) || 0;

        return data;
    } catch (ex) {
        logException(ex, 'SectionC1Adapter.getLineData');
        throw ex;
    }
};

adapter.SectionC1Adapter.prototype.getInvoiceLine = function getInvoiceLine(creditLine) {
    if (!creditLine || !creditLine.taxCode) {
        throw nlapiCreateError('INVALID_PARAMETER', 'Invalid SectionC1Adapter credit memo');
    }
    if (!this.creditApplicationsMap) {
        throw nlapiCreateError('INVALID_PARAMETER', 'Credit Map is invalid');
    }

    try {
        var invoice = this.creditApplicationsMap[creditLine.id];
        return invoice || null;
    } catch (ex) {
        logException(ex, 'SectionC1Adapter.getInvoiceLine');
        throw ex;
    }
};

/*****************************
 * CORRECTIVE INVOICES - C.2 *
 *****************************/
dao.VendorCreditDAO = function VendorCreditDAO() {
    Tax.DAO.ReportDAO.call(this);
    this.Name = 'VCS_SK_VendorCreditsDAO';
    this.reportName = 'VCS SK - Purchase Returns by Txn, Tax Code';
};

dao.VendorCreditDAO.prototype = Object.create(Tax.DAO.ReportDAO.prototype);

dao.VendorCreditDAO.prototype.ListObject = function ListObject(id) {
    return {
        id: id,
        vatNo: '',
        transactionNumber: '',
        documentNumber: '',
        date: '',
        taxCode: '',
        taxRate: '',
        notionalRate: '',
        netAmount: '',
        taxAmount: '',
        notionalAmount: ''
    };
};

dao.VendorCreditDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    var column = {};
    try {
        var pivotReportColumns = this.getColumns(pivotReport);
        column.id = pivotReportColumns[0];
        column.vatNo = pivotReportColumns[1];
        column.transactionNumber = pivotReportColumns[2];
        column.documentNumber = pivotReportColumns[3];
        column.date = pivotReportColumns[4];
        column.taxCode = pivotReportColumns[5];
        column.taxRate = pivotReportColumns[6];
        column.notionalRate = pivotReportColumns[7];
        column.netAmount = pivotReportColumns[8];
        column.taxAmount = pivotReportColumns[9];
        column.notionalAmount = pivotReportColumns[10];
    } catch (ex) {
        logException(ex, 'VendorCreditDAO.getColumnMetadata');
        throw ex;
    }
    return column;
};

adapter.SectionC2KeyToDataMap = {};
adapter.SectionC2CreditApplicationsMap = {};
adapter.SectionC2Adapter = function SectionC2Adapter(errorHandler) {
    adapter.ItemSectionAdapter.call(this);
    this.errorHandler = errorHandler;
    this.Name = 'SectionC2Adapter';
    this.daos = [];
    this.taxCodes = ['S', 'R', 'RC', 'ES', 'ER', 'ESSP', 'IS', 'Deduct_S', 'Deduct_R', 'ESND', 'ERND', 'ESSPND', 'ISND'];
    this.nonDeductibleTaxCodes = ['ESND', 'ERND', 'ESSPND', 'ISND'];
    this.taxCodesWithRequiredVATNo = ['S', 'R', 'Deduct_S', 'Deduct_R'];
    this.taxCodeLookup = VAT.TaxCodeLookup.getInstance('SK', VAT.SK.TaxCodeDefinition());
};

adapter.SectionC2Adapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

adapter.SectionC2Adapter.prototype.process = function process(result, params) {
    if(!result || !result.dao) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'result.dao is required');
    }
    var dao = result.dao;
    this.rawdata = dao.savedReport;
    this.creditApplicationsMap = this.createCreditApplicationsMap(dao.creditApplications, dao.correctedTransactionDetails);
    Tax.Supplementary.VCS.SK.Adapter.SectionC2CreditApplicationsMap = this.creditApplicationsMap;

    return {
        dao: this.rawdata,
        adapter: this.transform(params)
    };
};

adapter.SectionC2Adapter.prototype.getTaxCodeNameById = function getTaxCodeNameById(taxCodeId) {
    var taxCodeMap = this.taxCodeLookup.taxCodesMap;

    for (var name in taxCodeMap) {
        if (taxCodeMap[name] == taxCodeId) {
            return name;
        }
    }
};

adapter.SectionC2Adapter.prototype.createCreditApplicationsMap = function createCreditApplicationsMap(appliedList, transactionDetailsList) {
    if(!transactionDetailsList) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'SectionC2Adapter - transactionDetailsList is required');
    }
    // Assumption in creating the map is there is only 1:1 association between bill credit and bill payment

   try {
        var creditMap = {};
        var applied = {};
        var transactionDetails = {};
        var taxCodeName = '';

        for (var j = 0; j < transactionDetailsList.length; j++) {
            transactionDetails = transactionDetailsList[j];
            var id = transactionDetails.id;
            creditMap[id] = {};

            taxCodeName = this.getTaxCodeNameById(transactionDetails.taxCode);
            if (!creditMap[id].transactionNumber && !creditMap[id].documentNumber) {
                creditMap[id].transactionNumber = transactionDetails.transactionNumber;
                creditMap[id].documentNumber = transactionDetails.documentNumber == '- None -' ? '' : transactionDetails.documentNumber;
                creditMap[id].origInvoiceRefNo = transactionDetails.origInvoiceRefNo;
            }
            if (!creditMap[id][taxCodeName]) {
                creditMap[id][taxCodeName] = {
                    netAmount: parseFloat(transactionDetails.netAmount) || 0,
                    taxAmount: Math.abs(transactionDetails.taxAmount)
                };
            } else {
                creditMap[id][taxCodeName].netAmount += parseFloat(transactionDetails.netAmount) || 0;
                creditMap[id][taxCodeName].taxAmount += Math.abs(transactionDetails.taxAmount);
            }
        }
        return creditMap;
    } catch (ex) {
        logException(ex, 'SectionC2Adapter.createCreditApplicationsMap');
        throw ex;
    }
};

adapter.SectionC2Adapter.prototype.getLineData = function getLineData(line) {
    if (!line) {
        throw nlapiCreateError('INVALID_PARAMETER', 'Invalid SectionC2Adapter line data');
    }

    try {

        if (!this.isValidVATNo(line)) {
            return null;
        }

        var bill = this.getBillLine(line);
        if (!bill) {
            return null;
        }

        var taxRate = parseFloat(line.taxRate) || '';
        var taxAmount = parseFloat(line.taxAmount);
        var notionalAmount = parseFloat(line.notionalAmount);
        var lineNetAmount = parseFloat(line.netAmount) || 0;
        var lineTaxAmount = Math.abs(taxAmount || notionalAmount) || 0;
        var lineAmountOfVATDeduction = this.taxCodeLookup.anyOf(line.taxCode, this.nonDeductibleTaxCodes) ? 0 : lineTaxAmount; 
        var data = {};
        data.entityTaxNumber = line.vatNo || '';
        data.transactionId = line.documentNumber || line.transactionNumber || '';
        data.billTransactionId = bill.origInvoiceRefNo || '';

        if (bill.netAmount != undefined && bill.taxAmount != undefined) {
            data.netAmount = -lineNetAmount;
            data.taxAmount = -lineTaxAmount;
            data.taxRate = taxRate || base.getNotionalRate(line) * 100 || '';
            data.amountOfVATDeduction = -lineAmountOfVATDeduction;
        } else {
            data.netAmount = '';
            data.taxAmount = '';
            data.taxRate = '';
            data.amountOfVATDeduction = '';
        }
        data.taxCodeType = this.taxCodeLookup.getTaxCodeType(line.taxCode);
        data.correctionCode = '';

        return data;
    } catch (ex) {
        logException(ex, 'SectionC2Adapter.getLineData');
        throw ex;
    }
};

adapter.SectionC2Adapter.prototype.isValidVATNo = function isValidVATNo(line) {
    if (this.taxCodeLookup.anyOf(line.taxCode, this.taxCodesWithRequiredVATNo)) {
        if (!line.vatNo) {
            return false;
        }
        return (line.vatNo.substring(0, 2) === 'SK');
    }

    return true;
};

adapter.SectionC2Adapter.prototype.transform = function transform(params) {
    try {
        var data = [];
        var line = null;
        var lineKey = '';
        var keyToDataMap = Tax.Supplementary.VCS.SK.Adapter.SectionC2KeyToDataMap;
        var transformed = {};

        for (var i = 0; i < this.rawdata.length; i++) {
            line = this.rawdata[i];

            if (this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes)) {
                transformed = this.getLineData(line);
                if (transformed == null) {
                    continue;
                }

                lineKey = [transformed.entityTaxNumber, transformed.transactionId, transformed.billTransactionId, transformed.taxRate].join('-');
                if (keyToDataMap[lineKey] != undefined) {
                    data[keyToDataMap[lineKey]].netAmount += parseFloat(transformed.netAmount);
                    data[keyToDataMap[lineKey]].taxAmount += parseFloat(transformed.taxAmount);
                    data[keyToDataMap[lineKey]].amountOfVATDeduction += parseFloat(transformed.amountOfVATDeduction);
                } else {
                    data.push(transformed);
                    keyToDataMap[lineKey] = data.length - 1;
                }
            }
        }

        var result = {};
        result[this.Name] = data;
        return result;
    } catch (ex) {
        logException(ex, 'SectionC2Adapter.transform');
        throw ex;
    }
};

adapter.SectionC2Adapter.prototype.getBillLine = function getBillLine(creditLine) {
    if (!creditLine || !creditLine.taxCode) {
        throw nlapiCreateError('INVALID_PARAMETER', 'Invalid SectionC2Adapter credit memo');
    }
    if (!this.creditApplicationsMap) {
        throw nlapiCreateError('INVALID_PARAMETER', 'Credit Map is invalid');
    }

    try {
        var bill = this.creditApplicationsMap[creditLine.id];
        var billData = {};

        if (bill) {
            billData.transactionNumber = bill.transactionNumber;
            billData.documentNumber = bill.documentNumber;
            billData.origInvoiceRefNo = bill.origInvoiceRefNo;

            if (bill[creditLine.taxCode]) {
                billData.netAmount = bill[creditLine.taxCode].netAmount;
                billData.taxAmount = bill[creditLine.taxCode].taxAmount;
            } else {
                billData.netAmount = creditLine.netAmount;
                billData.taxAmount = creditLine.taxAmount;
            }

            return billData;

        }
        return null;
    } catch (ex) {
        logException(ex, 'SectionC2Adapter.getBillLine');
        throw ex;
    }
};

adapter.SectionC2NDAdapter = function SectionC2NDAdapter(errorHandler) {
    adapter.SectionC2Adapter.call(this);
    this.Name = 'SectionC2Adapter';
    this.taxCodes = ['NonDeduct_S', 'NonDeduct_R'];
    this.daos = ['VCS_SK_NonDeductibleSupplierInvoiceDAO'];
};
adapter.SectionC2NDAdapter.prototype = Object.create(Tax.Supplementary.VCS.SK.Adapter.SectionC2Adapter.prototype);

adapter.SectionC2NDAdapter.prototype.isValidLine = function isValidLine(line) {
    return this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes);
};

adapter.SectionC2NDAdapter.prototype.process = function process(result, params) {
    try {
        this.creditApplicationsMap = Tax.Supplementary.VCS.SK.Adapter.SectionC2CreditApplicationsMap;
        for (var idao = 0; this.daos && idao < this.daos.length; idao++) {
            var data = Tax.Cache.MemoryCache.getInstance().load(this.daos[idao]);
            if (data) {
                this.rawdata = this.rawdata.concat(data);
            }
        }
    } catch (ex) {
        logException(ex, 'Tax.Adapter.SectionC2NDAdapter.process');
    }
    return {adapter: this.transform(params)};
};

adapter.SectionC2NDAdapter.prototype.transform = function(params) {
    if (!this.rawdata) {
        //insert error handling here
    }
    try {
        var result = {};
        var keyToDataMap = Tax.Supplementary.VCS.SK.Adapter.SectionC2KeyToDataMap;
        var resultFromSectionC2Adapter = params.result.adapter[this.Name];
        var line = null;
        var lineKey = '';
        var transformed = {};

        for (var i = 0; i < this.rawdata.length; i++) {
            line = this.rawdata[i];

            if (this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes)) {
                line.taxRate = this.taxCodeLookup.getPairDeductDetails(line.taxCode, 'SK').rate;
                line.taxCode = this.taxCodeLookup.getPairDeductDetails(line.taxCode, 'SK').name;

                transformed = this.getLineData(line);
                if (transformed == null) {
                    continue;
                }

                if (line.documentNumber == '- None -') {
                    transformed.transactionId = line.transactionNumber;
                }

                lineKey = [transformed.entityTaxNumber, transformed.transactionId, transformed.billTransactionId, transformed.taxRate].join('-');
                if (keyToDataMap[lineKey] != undefined) {
                    resultFromSectionC2Adapter[keyToDataMap[lineKey]].amountOfVATDeduction -= parseFloat(transformed.amountOfVATDeduction) || 0;
                }
            }
        }

        result[this.Name] = resultFromSectionC2Adapter;
        return result;
    } catch (ex) {
        logException(ex, 'Tax.Supplementary.VCS.CZ.Adapter.SectionC2NDAdapter.transform');
        throw ex;
    }
};

/******************************************
 * OTHER VAT DOCUMENT *
 *****************************************/
dao.CustomerJournalSummaryDAO = function CustomerJournalSummaryDAO() {
    Tax.DAO.ReportDAO.call(this);
    this.Name = 'VCS_SK_CustomerJournalDAO';
    this.reportName = 'VCS SK - Sales Summary by Tax Code [JRN]';
};

dao.CustomerJournalSummaryDAO.prototype = Object.create(Tax.DAO.ReportDAO.prototype);

dao.CustomerJournalSummaryDAO.prototype.ListObject = function ListObject() {
    return {
        taxCode: '',
        netAmount: '',
        taxAmount: '',
        grossAmount: '',
        cashRegister: ''
    };
};

dao.CustomerJournalSummaryDAO.prototype.getColumnMetadata = function getColumnMetadata(pivotReport) {
    var column = {};
    try {
        var pivotReportColumns = this.getColumns(pivotReport);
        column.taxCode = pivotReportColumns[0];
        column.netAmount = pivotReportColumns[1];
        column.taxAmount = pivotReportColumns[2];
        column.grossAmount = pivotReportColumns[3];
        column.cashRegister = pivotReportColumns[4];
    } catch (ex) {
        logException(ex, 'CustomerJournalSummaryDAO.getColumnMetadata');
        throw ex;
    }
    return column;
};

adapter.SectionD1Adapter = function SectionD1Adapter(errorHandler) {
    Tax.Adapter.BaseAdapter.call(this);
    this.Name = 'SectionD1Adapter';
    this.daos = ['VCS_SK_CustomerJournalDAO'];
    this.taxCodes = ['S', 'R'];
    this.salesTaxCodes1 = ['S'];
    this.salesTaxCodes2 = ['R'];
    this.taxCodeLookup = VAT.TaxCodeLookup.getInstance('SK', VAT.SK.TaxCodeDefinition());
};

adapter.SectionD1Adapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

adapter.SectionD1Adapter.prototype.compile = function compile(data) {
    if (!data) {
        throw nlapiCreateError('INVALID_PARAMETER', 'SectionD1Adapter data is invalid');
    }

    try {
        var result = {
            totalAmount: 0,
            'netAmountS-SK': 0,
            'taxAmountS-SK': 0,
            'netAmountR-SK': 0,
            'taxAmountR-SK': 0,
        };

        for (var i = 0; i < data.length; i++) {
            line = data[i];
            if (!this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes) || line.cashRegister !== 'T') {
                continue;
            }
            var netAmount = parseFloat(line.netAmount) || 0;
            var taxAmount = parseFloat(line.taxAmount) || 0;
            result.totalAmount += parseFloat(line.grossAmount) || 0;

            if (this.taxCodeLookup.anyOf(line.taxCode, this.salesTaxCodes1)) {
                result['netAmountS-SK'] += netAmount;
                result['taxAmountS-SK'] += taxAmount;
            } else if (this.taxCodeLookup.anyOf(line.taxCode, this.salesTaxCodes2)) {
                result['netAmountR-SK'] += netAmount;
                result['taxAmountR-SK'] += taxAmount;
            }
        }
        return result;
    } catch (e) {
        logException(e, 'SectionD1Adapter.compile');
        throw e;
    }
};

adapter.SectionD1Adapter.prototype.transform = function transform(params) {
    var result = {};
    var compiledData = this.compile(this.rawdata);
    var hasData = false;

    for (var data in compiledData) {
        if (compiledData[data]) {
            hasData = true;
            break;
        }
    }

    result[this.Name] = hasData ? [compiledData] : [];
    return result;
};

dao.SalesAdjustmentDAO = function SalesAdjustmentDAO() {
    Tax.DAO.SaleAdjustmentDetailsDAO.call(this);
    this.Name = 'VCS_SK_SalesAdjustmentDAO';
};

dao.SalesAdjustmentDAO.prototype = Object.create(Tax.DAO.SaleAdjustmentDetailsDAO.prototype);

dao.SalesAdjustmentDAO.prototype.ListObject = function(id) {
    return {
        id: id,
        taxCode: '',
        netAmount: 0,
        taxAmount: 0,
        grossAmount: 0,
    };
};

dao.SalesAdjustmentDAO.prototype.rowToObject = function rowToObject(row) {
    var id = row.getValue('internalid', null, 'group');
    var line = new this.ListObject(id);
    line.taxCode = row.getText("custcol_adjustment_tax_code", null, "group");
    line.taxAmount = row.getValue(this.amountColumn, this.amountJoinColumn, "sum");
    line.grossAmount = line.taxAmount;
    line.cashRegister = 'F';
    return line;
};

adapter.SectionD2Adapter = function SectionD2Adapter(errorHandler) {
    Tax.Adapter.BaseAdapter.call(this);
    this.Name = 'SectionD2Adapter';
    this.daos = ['VCS_SK_CustomerInvoiceDAO', 'VCS_SK_CustomerCreditsDAO', 'VCS_SK_CustomerJournalDAO', 'VCS_SK_SalesAdjustmentDAO'];
    this.taxCodes = ['S', 'R'];
    this.salesTaxCodes1 = ['S'];
    this.salesTaxCodes2 = ['R'];
    this.taxCodeLookup = VAT.TaxCodeLookup.getInstance('SK', VAT.SK.TaxCodeDefinition());
};

adapter.SectionD2Adapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

adapter.SectionD2Adapter.prototype.compile = function compile(data) {
    if (!data) {
        throw nlapiCreateError('INVALID_PARAMETER', 'SectionD2Adapter data is invalid');
    }

    try {
        var result = {};
        result['netAmountS-SK'] = 0;
        result['taxAmountS-SK'] = 0;
        result['netAmountR-SK'] = 0;
        result['taxAmountR-SK'] = 0;
        for (var i = 0; i < data.length; i++) {
            line = data[i];
            if (!this.taxCodeLookup.anyOf(line.taxCode, this.taxCodes) || line.cashRegister === 'T' || line.entityTaxNumber || line.vatNo || line.entityDICNumber || line.entityICONumber) {
                continue;
            }
            var netAmount = parseFloat(line.netAmount) || 0;
            var taxAmount = parseFloat(line.taxAmount) || 0;
            if (this.taxCodeLookup.anyOf(line.taxCode, this.salesTaxCodes1)) {
                result['netAmountS-SK'] += netAmount;
                result['taxAmountS-SK'] += taxAmount;
            } else if (this.taxCodeLookup.anyOf(line.taxCode, this.salesTaxCodes2)) {
                result['netAmountR-SK'] += netAmount;
                result['taxAmountR-SK'] += taxAmount;
            }
        }
        result.correctionCode = '';

        return result;
    } catch (e) {
        logException(e, 'SectionD2Adapter.compile');
        throw e;
    }
};

adapter.SectionD2Adapter.prototype.transform = function transform(params) {
    var result = {};
    var compiledData = this.compile(this.rawdata);
    var hasData = false;

    for (var data in compiledData) {
        if (compiledData[data]) {
            hasData = true;
            break;
        }
    }

    result[this.Name] = hasData ? [compiledData] : [];
    return result;
};