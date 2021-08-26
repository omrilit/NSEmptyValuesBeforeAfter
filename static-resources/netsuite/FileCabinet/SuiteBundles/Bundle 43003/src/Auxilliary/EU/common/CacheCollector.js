/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};

VAT.EU.CacheCollector = function CacheCollector(cacheId, cacheMgr) {
    if (!cacheId) {
        throw nlapiCreateError('MISSING_REQ_PARAM', 'A cache ID is required.');
    }
    
    if (!cacheMgr) {
        throw nlapiCreateError('MISSING_REQ_PARAM', 'A cache manager is required.');
    }
    
    this.cacheId = cacheId;
    this.cacheMgr = cacheMgr;
};

VAT.EU.CacheCollector.prototype.getData = function getData() {
    var cache = this.cacheMgr.GetTaxCache(this.cacheId);
    return cache.detail;
};

VAT.EU.CacheCollector.prototype.transform = function transform(data) {
    return data;
};

VAT.EU.CacheCollector.prototype.format = function format(data) {
    return data;
};
