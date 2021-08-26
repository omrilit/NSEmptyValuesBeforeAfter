/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 Aug 2014     ecariaga
 *
 */

if (!VAT) { var VAT = {}; }
VAT.DAO = VAT.DAO || {};


VAT.DAO.AccountingBookDAO = function _AccountingBookDAO() {
	this.getBySubsidiary = _GetBySubsidiary;
//    this.getById = _GetById;
    
    function _GetBySubsidiary(subid) {
        var columns = [new nlobjSearchColumn('name'),
                       new nlobjSearchColumn('status'),
                       new nlobjSearchColumn('isprimary'),
                       new nlobjSearchColumn('subsidiary')];
        
        var _filters = [new nlobjSearchFilter('subsidiary', null, 'is', subid)];
        
        var multibooks_sr = nlapiSearchRecord('accountingbook', null, _filters, columns);
        
        var books = {};
        for (var i = 0; multibooks_sr && i < multibooks_sr.length; i++) {
        	books[multibooks_sr[i].getId()] = objectify(multibooks_sr[i]);
        }

        return books;
    }
    
    function objectify(row) {
        var obj = new VAT.DAO.MultiBook(row.getId());
        obj.name = row.getValue('name');
        obj.status = row.getValue('status');
        obj.subsidiary = row.getValue('subsidiary');
        obj.isprimary = row.getValue('isprimary');
        
        return obj;
    }
};

VAT.DAO.MultiBook = function _MultiBook(id) {
    return {
        id: id,
        name: '',
        status: '',
        subsidiary: '',
        isprimary: ''
    };
};
