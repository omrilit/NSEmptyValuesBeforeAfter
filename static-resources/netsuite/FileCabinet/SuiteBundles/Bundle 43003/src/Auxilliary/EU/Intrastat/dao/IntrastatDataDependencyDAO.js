/**
 * Copyright © 2016, 2018 Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};

Tax.EU.Intrastat.IntrastatDataDependencyDAO = function IntrastatDataDependencyDAO() {
    Tax.DAO.BaseDAO.call(this);
    this.Name = 'IntrastatDataDependencyDAO';
};

Tax.EU.Intrastat.IntrastatDataDependencyDAO.prototype = Object.create(Tax.DAO.BaseDAO.prototype);

Tax.EU.Intrastat.IntrastatDataDependencyDAO.prototype.process = function process(result, params) {
    try {
        var euNexus = getEUNexuses()[params.countrycode] || {};
        this.countryId = euNexus.id;
        this.nexus = euNexus.nexuscode;
        this.countrycode = params.countrycode;

        this.transactionTypeMaps = this.createTransactionTypeMaps();
        var taxCodeMap = this.createTaxCodeMap();
        var notcMap = this.createNotcMap();
        
        this.cache('taxCodeMap', taxCodeMap);
        this.cache('notcMap', notcMap);
        this.cache('tranTypesByName', this.transactionTypeMaps.byName);
        
        return {
            dao: {
                taxCodeMap: taxCodeMap,
                notcMap: notcMap,
                tranTypesByName: this.transactionTypeMaps.byName
            }
        };
    } catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.IntrastatDataDependencyDAO.process');
        throw ex;
    }
};

Tax.EU.Intrastat.IntrastatDataDependencyDAO.prototype.createTransactionTypeMaps = function createTransactionTypeMaps() {
    var types = new Tax.DAO.TaxReportMapperDAO().getList({mapType: 'TXN'});
    
    return {
        byName: this.convertToMap(types, 'name'),
        byAlternateCode: this.convertToMap(types, 'alternateCode')
    };
};

Tax.EU.Intrastat.IntrastatDataDependencyDAO.prototype.createTaxCodeMap = function createTaxCodeMap() {
    var dao = new Tax.DAO.TaxCodeSearchDAO();
    var list = dao.getList({country: this.nexus});
    
    if(list.length <= 0){
    	var altdao = new Tax.DAO.TaxCodeSearchDAO();
    	list = altdao.getList({country: this.countrycode});
    }
    
    return this.convertToMap(list, 'itemId');
};

Tax.EU.Intrastat.IntrastatDataDependencyDAO.prototype.createNotcMap = function createNotcMap() {
    try {
        var map = {};
        var transactionTypeMap = this.transactionTypeMaps.byAlternateCode;
        var notcDefaults = new Tax.DAO.NatureOfTransactionDefaultDAO().getList({isInactive: 'F', country: this.countryId});
        
        var tranTypeArr = [];
        for (var i = 0; i < notcDefaults.length; i++) {
            tranTypeArr = (notcDefaults[i].transactionType_text || '').split(',');
            
            for (var j = 0; j < tranTypeArr.length; j++) {
                if (tranTypeArr[j]) {
                    map[transactionTypeMap[tranTypeArr[j]] ? transactionTypeMap[tranTypeArr[j]].name : 'INV'] = notcDefaults[i].notcCode;
                }
            }
        }
        
        return map;
    } catch (ex) {
        logException(ex, 'Tax.EU.Intrastat.IntrastatDataDependencyDAO.createNotcMap');
        throw ex;
    }    
};

Tax.EU.Intrastat.IntrastatDataDependencyDAO.prototype.convertToMap = function convertToMap(array, key) {
    var map = {};
    array = array || [];
    
    try {
        if (!key) {
            throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'A key string is required.');
        }
        
        for (var i = 0; i < array.length; i++) {
            map[array[i][key]] = array[i];
        }
    } catch(ex) {
        logException(ex, 'Tax.EU.Intrastat.IntrastatDataDependencyDAO.convertToMap');
        throw ex;
    }
    
    return map;
};

