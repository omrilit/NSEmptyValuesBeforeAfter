/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Aug 2014     isalen
 *
 */
if (!VAT) { VAT = {}; }


VAT.TransactionFieldCache = function TransactionFieldCache(tranType) {
    this.tranType = tranType;
};


VAT.TransactionFieldCache.transactionSublistMap = {
    'vendorbill': ['item', 'expense'],
    'check': ['item', 'expense'],
    'vendorcredit': ['item', 'expense'],
    'journalentry': ['line'],
    'expensereport': ['expense']
};


VAT.TransactionFieldCache.defaultFields = {
    'vendorbill_item': ['item', 'quantity', 'amount', 'taxcode', 'tax1amt', 'grossamt', 'custcol_nondeductible_account', 'customer', 'class', 'location', 'department'],
    'vendorbill_expense': ['category', 'account', 'amount', 'taxcode', 'tax1amt', 'grossamt', 'custcol_nondeductible_account', 'customer', 'class', 'location', 'department'],
    'check_item': ['item', 'quantity', 'amount', 'taxcode', 'tax1amt', 'grossamt', 'custcol_nondeductible_account', 'customer', 'class', 'location', 'department'],
    'check_expense': ['category', 'account', 'amount', 'taxcode', 'tax1amt', 'grossamt', 'custcol_nondeductible_account', 'customer', 'class', 'location', 'department'],
    'vendorcredit_item': ['item', 'quantity', 'amount', 'taxcode', 'tax1amt', 'grossamt', 'custcol_nondeductible_account', 'customer', 'class', 'location', 'department'],
    'vendorcredit_expense': ['category', 'account', 'amount', 'taxcode', 'tax1amt', 'grossamt', 'custcol_nondeductible_account', 'customer', 'class', 'location', 'department'],
    'journalentry_line': ['account', 'debit', 'credit', 'taxcode', 'tax1amt', 'grossamt', 'custcol_nondeductible_account', 'entity', 'class', 'location', 'department'],
    'expensereport_expense': ['receipt', 'expensedate', 'category', 'currency', 'account', 'amount', 'taxcode', 'tax1amt', 'grossamt', 'custcol_nondeductible_account', 'customer', 'class', 'location', 'department']
};


VAT.TransactionFieldCache.prototype.getFieldCache = function getFieldCache() {
    var cache = {};
    var rec = nlapiCreateRecord(this.tranType);
    var tranType = rec.getRecordType();
    var sublists = VAT.TransactionFieldCache.transactionSublistMap[tranType];
    
    for (var i = 0; i < sublists.length; i++) {
        cache[sublists[i]] = this.getSublistFields(rec, sublists[i]);
    }
    
    return JSON.stringify(cache);
};


VAT.TransactionFieldCache.prototype.getSublistFields = function getSublistFields(record, sublist) {
    var fields = VAT.TransactionFieldCache.defaultFields[this.tranType + '_' + sublist].slice();
    var allFields = record.getAllLineItemFields(sublist);
    
    for (var i = 0; i < allFields.length; i++) {
        if (allFields[i].indexOf('custcol') > -1 && allFields[i] != 'custcol_nondeductible_account') {
            fields.push(allFields[i]);
        }
    }
    
    return fields;
};
