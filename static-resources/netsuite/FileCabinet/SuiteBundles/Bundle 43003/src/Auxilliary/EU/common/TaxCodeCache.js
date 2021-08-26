/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};

VAT.EU.TaxCodeCache = function TaxCodeCache(nexus) {
    this.cache = {};
    
    this.createTaxCode = function createTaxCode(id, name, rate, countrycode) {
        return {'id': id, 'name': name, 'rate': rate, 'countrycode': countrycode, 'isservice': false, 'isupdated': false};
    };
    
    this.updateTaxCode = function updateTaxCode(taxId) {
        var rec = nlapiLoadRecord('salestaxitem', taxId);
        var name = rec.getFieldValue('itemid');
        var taxcode = this.cache[name];
        
        if (taxcode && !taxcode.isupdated) {
            taxcode.isservice = rec.getFieldValue('service') == 'T';
            taxcode.isupdated = true;
        }
    };
    
    this.findByName = function _findByName(name) {
        if (this.cache[name] && !this.cache[name].isupdated) {
            this.updateTaxCode(this.cache[name].id);
        }
        
        return this.cache[name];
    };
    
    try {
        if (!CONSTANTS.EU_NEXUSES[nexus]) {
            return;
        }
        
        var columns = [new nlobjSearchColumn('itemid'), new nlobjSearchColumn('rate')];
        var filters = [];
        
        if (nlapiGetContext().getSetting('FEATURE', 'ADVTAXENGINE') == 'T') {
            filters.push(new nlobjSearchFilter('country', null, 'anyof', ['GR', 'EL'].indexOf(nexus) > -1 ? ['GR', 'EL'] : [CONSTANTS.EU_NEXUSES[nexus].nexuscode]));
        }
        
        var rs = nlapiSearchRecord('salestaxitem', null, filters, columns);
        
        for ( var i in rs) {
            var taxcursor = rs[i];
            var taxname = taxcursor.getValue('itemid');
            this.cache[taxname] = this.createTaxCode(taxcursor.getId(), taxcursor.getValue('itemid'), taxcursor.getValue('rate'), nexus);
        }
    } catch (ex) {
        var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
        nlapiLogExecution('ERROR', 'TaxCodeCache', errorMsg);
    }
};