/**
 * Copyright 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.Generic = TAF.Generic || {};
TAF.Generic.DAO = TAF.Generic.DAO || {};

TAF.Generic.DAO.TxnLine = function _TxnLine(id){
    return {
        id              : id,
        lineId          : '',
        tranId          : '',
        tranDate        : '',
        debitAmount     : '',
        creditAmount    : '',
        netAmount       : '',
        account         : '',
        entity          : '',
        customerTaxNo   : '',
        vendorTaxNo     : '',
        memo            : '',
        memoMain        : '',
        type            : '',
        typeText        : '',
        createdBy       : '',
        glNumber        : '',
        currency        : '',
        fxAmount        : '',
        exchangeRate    : '',
        classes         : '',
        department      : '',
        location        : ''
    };
};

TAF.Generic.DAO.TxnLineDao = function _TxnLineDao(fields) {
    TAF.DAO.SearchDAO.call(this);
    
    this.recordType = 'transaction';
    this.savedSearchId = 'customsearch_taf_gldata';
    this.fields = fields;
};
TAF.Generic.DAO.TxnLineDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.Generic.DAO.TxnLineDao.prototype.createSearchFilters = function _createSearchFilters(params) {
    if(!params || !params.periodId) {
        throw nlapiCreateError('MISSING_PARAMETER', 'params is required');
    }
    
    this.filters = [];

    this.filters.push(new nlobjSearchFilter('postingperiod', null, 'is', params.periodId));

    if (this.isOneWorld) {
        this.filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', params.subIds));
    }
    
    if (this.isMultiBook) {
        this.filters.push(new nlobjSearchFilter('accountingbook', this.multiBookJoinColumn, 'is', params.bookId));
    }
    
    return this.filters;
};

TAF.Generic.DAO.TxnLineDao.prototype.createSearchColumns = function _createSearchColumns() {
    this.columns = [];
    
    this.columns.push(new nlobjSearchColumn('account', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('debitamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('creditamount', this.multiBookJoinColumn));
    this.columns.push(new nlobjSearchColumn('netamount'));
    
    if (this.glAuditNumbering) {
        this.columns.push(new nlobjSearchColumn('glnumber'));
    }
    
    if (this.multicurrency) {
        this.columns.push(new nlobjSearchColumn('currency'));
        this.columns.push(new nlobjSearchColumn('fxamount'));
        this.columns.push(new nlobjSearchColumn('exchangerate'));
    }
    
    if (this.classes) {
        this.columns.push(new nlobjSearchColumn('class'));
    }
    
    if (this.department) {
        this.columns.push(new nlobjSearchColumn('department'));
    }
    
    if (this.locations) {
        this.columns.push(new nlobjSearchColumn('location'));
    }
    
    for (var i = 0; i < this.fields.length; i++) {
        this.columns.push(new nlobjSearchColumn(this.fields[i].customFieldId));
    }
    
    return this.columns;
};

TAF.Generic.DAO.TxnLineDao.prototype.rowToObject = function _rowToObject(row) {
    if(!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }
    
    try {
        var line = new TAF.Generic.DAO.TxnLine();
        line.id = row.getId() || '';
        line.isPosting      = (row.getValue('posting') == 'T');
        line.lineId         = row.getValue('line') || '';
        line.tranId         = row.getValue('tranid') || '';
        line.tranDate       = row.getValue('trandate') || '';
        line.debitAmount    = row.getValue('debitamount', this.multiBookJoinColumn) || '';
        line.creditAmount   = row.getValue('creditamount', this.multiBookJoinColumn) || '';
        line.netAmount      = row.getValue('netamount') || '';
        line.account        = row.getValue('account', this.multiBookJoinColumn) || '';
        line.entity         = row.getText('entity') || '';
        line.customerTaxNo  = row.getValue('vatregnumber', 'customer') || '';
        line.vendorTaxNo    = row.getValue('vatregnumber', 'vendor') || '';
        line.memo           = row.getValue('memo') || '';
        line.memoMain       = row.getValue('memomain') || '';
        line.type           = row.getValue('type') || '';
        line.typeText       = row.getText('type') || '';
        line.createdBy      = row.getText('createdby') || '';

        if (this.glAuditNumbering) {
            line.glNumber   = row.getValue('glnumber') || '';
        }
        
        if (this.multicurrency) {
            line.currency   = row.getValue('currency') || '';
            line.fxAmount   = row.getValue('fxamount') || '';
            line.exchangeRate = row.getValue('exchangerate') || '';
        }
        
        if (this.classes) {
            line.classes    = row.getText('class') || '';
        }
        
        if (this.department) {
            line.department = row.getText('department') || '';
        }
        
        if (this.locations) {
            line.location   = row.getText('location') || '';
        }

        for (var i = 0; i < this.fields.length; i++) {
            var field       = this.fields[i].customFieldId;
            if (this.fields[i].listId) {
                line[field] = row.getText(field) || '';
            } else {
                line[field] = row.getValue(field) || '';
            }
        }
    
        return line;
    } catch (ex) {
        this.logException(ex, 'convertRowToObject');
        throw nlapiCreateError('DAO_ERROR', 'Unable to get column values');
    }
};

