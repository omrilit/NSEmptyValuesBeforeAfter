/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax = Tax || {};
Tax.DAO = Tax.DAO || {};

Tax.DAO.SearchDAO = function SearchDAO() {
    Tax.DAO.BaseDAO.call(this);
    this.Name = 'SearchDAO';
    this.searchId = '';
    this.searchType = '';
    this.columns = null;
    this.filters = null;
    this.list = [];
    this.MAX_RESULTS_PER_PAGE = 1000;
};

Tax.DAO.SearchDAO.prototype = Object.create(Tax.DAO.BaseDAO.prototype);

Tax.DAO.SearchDAO.prototype.search = function search() {
    try {
        var search = this.searchId ? nlapiLoadSearch(this.searchType, this.searchId) : nlapiCreateSearch(this.searchType);
        
        if (this.filters) {
            search.addFilters(this.filters);
        }
        
        if (this.columns) {
            search.addColumns(this.columns);
        }
        
        return search.runSearch();
    } catch(e) {
        throw e;
    }
};

Tax.DAO.SearchDAO.prototype.processList = function processList(search) {
    var results = null;
    var index = 0;
    
    do {
        results = search.getResults(index, index + this.MAX_RESULTS_PER_PAGE);
        
        for (var i = 0; results && i < results.length; i++) {
            this.list.push(this.rowToObject(results[i]));
        }
        
        index += results.length;
    } while (results.length >= this.MAX_RESULTS_PER_PAGE);
};

Tax.DAO.SearchDAO.prototype.process = function process(result, params) {    
    var cache = this.getCache(this.Name);
    
    if (cache) {
        return {dao: cache};
    }
    
    var list = this.getList(params);
    
    this.cache(this.Name, list);
    return {dao: list};
};
