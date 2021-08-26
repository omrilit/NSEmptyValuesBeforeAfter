/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};

Tax.EU.Intrastat.IntrastatDataCache = function IntrastatDataCache() {
    Tax.Processor.call(this);
    this.Name = 'IntrastatDataCache';
    this.cacheMgr = new VAT.TaxCache();
};

Tax.EU.Intrastat.IntrastatDataCache.prototype = Object.create(Tax.Processor.prototype);

Tax.EU.Intrastat.IntrastatDataCache.prototype.store = function store(obj, cacheName) {
    if (!cacheName) {
        throw nlapiCreateError('MISSING_CACHE_NAME', 'The cache name is required.');
    }
    
    if (obj === undefined) {
        throw nlapiCreateError('OBJECT_IS_UNDEFINED', 'Please specify the object to be cached.');
    }
    
    this.cacheMgr.AddTaxCache(cacheName, '', obj, '');
};

Tax.EU.Intrastat.IntrastatDataCache.prototype.get = function get(cacheName) {
    var cacheId = cacheName ? this.cacheMgr.GetTaxCacheIdByName(cacheName)[0] : 0;
    return cacheId ? this.cacheMgr.GetTaxCache(cacheId).detail : [];
};

Tax.EU.Intrastat.IntrastatDataCache.prototype.getSegment = function getSegment(data, params) {
    var segment = data || [];
    
    if (params && (params.limit != undefined)) {
        var limit = parseInt(params.limit) || 0;
        var start = parseInt(params.start) || 0;
        segment = data.slice(start, start + limit);
    }
    
    return segment;
};

Tax.EU.Intrastat.IntrastatDataCache.prototype.process = function process(result, params) {
    if (!params || !params.cachename) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'The cache name is required.');
    }
    
    var data = result.adapter || [];
    
    switch (params.reloadcache) {
        case 'T':
            this.cacheMgr.CleanupCacheRecord(params.cachename);
            this.store(data, params.cachename);
            break;
        case 'F':
            data = this.get(params.cachename, params);
            break;
        default:
            break;
    }
    
    return {adapter: this.getSegment(data, params), total: data.length};
};
