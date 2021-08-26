/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};

VAT.EU.DataManager = function _DataManager(report, params) {
    if (!report) {
        throw nlapiCreateError('MISSING_REQ_PARAM', 'A report object is required.');
    }
    
    if (!params) {
        throw nlapiCreateError('MISSING_REQ_PARAM', 'A params object is required.');
    }
    
    var cacheMgr = new VAT.TaxCache();
    this.cacheId = params.cachename ? cacheMgr.GetTaxCacheIdByName(params.cachename)[0] || '' : '';
    this.dataHandler = this.cacheId ? new VAT.EU.CacheCollector(this.cacheId, cacheMgr) : new VAT.EU.DataCollector(report, params);
    this.params = params;
};

VAT.EU.DataManager.prototype.getPageData = function _getPageData() {
    var result = {data: [], total: 0};
    
    try {
        var limit = parseInt(this.params.limit) || 0;
        var start = parseInt(this.params.start) || 0;
        var viewData = this.getData() || [];
        var pageData = viewData.slice(start, start + limit);
        result = {
            data: pageData,
            total: viewData.length
        };    
    } catch(e) {
        logException(e, 'VAT.EU.DataManager.getPageData');
        throw e;
    }
    
    return result;
};

VAT.EU.DataManager.prototype.getAllData = function _getAllData() {
    var viewData = this.getData();
    return {
        data: viewData,
        total: viewData.length
    };
};

VAT.EU.DataManager.prototype.getData = function _getData() {
    try {
        var rawData = this.dataHandler.getData(this.params);
        var transformedData = this.dataHandler.transform(rawData);
        var viewData = this.dataHandler.format(transformedData);
        
        if (!this.cacheId) {
            new VAT.TaxCache().AddTaxCache(this.params.cachename, '', viewData, '');
        }
        
        return viewData;
    } catch (ex) {
        logException(ex, 'VAT.EU.DataManager.getData');
        throw ex;
    }   
};
