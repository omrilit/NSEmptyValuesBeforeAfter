/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};

Tax.EU.Intrastat.IntrastatLine = function IntrastatLine() {
    return {
        lineNumber: -1,
        exclude: '',
        commodityCode: '',
        value: 0,
        deliveryTerm: '',
        natureOfTransaction: '',
        netMass: 0,
        supplementaryUnit: '',
        countryCode: '',
        referenceNo: '',
        entityName: '',
        entityVatNo: '',
        origValue: '',
        origSupplementaryUnit: '',
        origNetMass: '',
        tranType: '',
        entityType: '',
        entityNameUrl: '',
        referenceNoUrl: ''
    };
};

Tax.EU.Intrastat.IntrastatDataAdapter = function IntrastatDataAdapter() {
    Tax.Adapter.BaseAdapter.call(this);
    this.Name = 'IntrastatDataAdapter';
    this.POUNDS_TO_KILOS_FACTOR = 2.20462262185;
    this.aggregator = null;
    this.vatNoToEntityMap = {};
    this.notcMap = {};
    this.taxCodeMap = {};
    this.tranTypeMap = {};
};

Tax.EU.Intrastat.IntrastatDataAdapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

Tax.EU.Intrastat.IntrastatDataAdapter.prototype.process = function process(result, params) {
    if (!result) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A result object is required.');
    }
    
    var data = {adapter: []};
    
    try {
        this.aggregator = this.aggregator ? this.aggregator : Tax.Cache.MemoryCache.getInstance().load('dataAggregator');
        
        if (!this.aggregator) {
            throw nlapiCreateError('MISSING_REQUIRED_CLASS', 'A data aggregator is required.');
        }
        
        this.loadMaps();
        
        var raw = result.dao;
        for (var i = 0; i < raw.length; i++) {
            this.aggregator.add(this.convertToLine(raw[i]));
        }
        
        data.adapter = this.aggregator.get();
    } catch(e) {
        logException(e, 'Tax.EU.Intrastat.IntrastatDataAdapter.process');
    }
    
    return data;
};

Tax.EU.Intrastat.IntrastatDataAdapter.prototype.loadMaps = function loadMaps() {
    this.notcMap = Tax.Cache.MemoryCache.getInstance().load('notcMap');
    this.taxCodeMap = Tax.Cache.MemoryCache.getInstance().load('taxCodeMap');
    this.tranTypeMap = Tax.Cache.MemoryCache.getInstance().load('tranTypesByName');
};

Tax.EU.Intrastat.IntrastatDataAdapter.prototype.convertToLine = function convertToLine(row) {
    if (!row) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A row object is required.');
    }
    
    if (!this.taxCodeMap[row.taxCode] || this.taxCodeMap[row.taxCode].isService == 'T') {
        return null;
    }
    
    var line = new Tax.EU.Intrastat.IntrastatLine();
    
    try {
        line.exclude = false;
        line.entityVatNo = this.formatVatNo(row.vatNo || row.projectVatNo, row.shippingCountry);
        
        if (line.entityVatNo) {
            this.vatNoToEntityMap[line.entityVatNo] = this.vatNoToEntityMap[line.entityVatNo] || row.entity;
        }
        
        line.entityName = this.vatNoToEntityMap[line.entityVatNo] || row.entity;
        line.commodityCode = row.commodityCode;
        line.natureOfTransaction = row.notcCode || row.notc || this.notcMap[row.transactionType] || '';
        line.deliveryTerm = row.deliveryTerms;
        line.countryCode = row.shippingCountry;
        line.referenceNo = row.transactionNumber;
        line.tranType = (this.tranTypeMap[row.transactionType] && this.tranTypeMap[row.transactionType].internalId) || '';
        line.entityType = this.getEntityType(row.entityType);
        
        line.entityNameUrl = this.constructUrl(line.entityType, row.entityId);
        line.referenceNoUrl = this.constructUrl(line.tranType, row.transactionId); 
        
        line.origValue = Math.abs(row.netAmount);
        line.origSupplementaryUnit = Math.abs(row.quantity);
        line.origNetMass = ((parseFloat(row.weightLbs || 0) / this.POUNDS_TO_KILOS_FACTOR).toFixed(5)) * line.origSupplementaryUnit;
    } catch(e) {
        logException(e, 'Tax.EU.Intrastat.IntrastatDataAdapter.convertToLine');
        return null;
    }
    
    return line;
};

Tax.EU.Intrastat.IntrastatDataAdapter.prototype.getEntityType = function _getEntityType(type) {
    var recordId = '';
    switch(type) {
        case 'Vendor':
            recordId = 'vendor'; break;
        case 'Customer':
            recordId = 'customer'; break;
        default:
            break;
    }
    return recordId;
};

Tax.EU.Intrastat.IntrastatDataAdapter.prototype.constructUrl = function _constructUrl(record, id) {
    return nlapiResolveURL('RECORD', record, id);
};

Tax.EU.Intrastat.IntrastatDataAdapter.prototype.formatVatNo = function formatVatNo(vatNo, countryCode) {
    return (vatNo || '').replace(/[^A-Za-z0-9]/g, '').replace(new RegExp('^' + countryCode, 'i'), '');
};
