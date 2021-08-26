/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.MY = TAF.MY || {};
TAF.MY.DAO = TAF.MY.DAO || {};

TAF.MY.DAO.TaxAccountDao = function TaxAccountDao() {};

TAF.MY.DAO.TaxAccountDao.prototype.getList = function getList(type) {
    if (!type) {
        throw nlapiCreateError('MISSING_REQ_PARAM', 'A Tax Account type is required.');
    }
    
    if (['sale', 'purchase'].indexOf(type.toLowerCase()) == -1) {
        throw nlapiCreateError('INVALID_TAX_ACCOUNT_TYPE', 'The Tax Account type must either be \'sale\' or \'purchase\'.');
    }
    
    var list = [];
    
    try {
        var column = [new nlobjSearchColumn(type.toLowerCase() + 'account', null, 'group')];
        var sr = nlapiSearchRecord('salestaxitem', null, null, column);
        
        for (var i = 0; sr && i < sr.length; i++) {
            list.push(sr[i].getValue(column[0]));
        }
    } catch(e) {
        nlapiLogExecution('ERROR', 'TAF.MY.DAO.TaxAccountDao.getList', e.toString());
        throw e;
    }
    
    return list
};
