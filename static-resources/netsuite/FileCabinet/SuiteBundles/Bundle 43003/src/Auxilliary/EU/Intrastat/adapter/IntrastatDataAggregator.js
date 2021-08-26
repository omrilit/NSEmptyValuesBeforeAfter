/**
 * Copyright © 2016, Oracle and/or its affiliates. All rights reserved.
 */

var Tax = Tax || {};
Tax.EU = Tax.EU || {};
Tax.EU.Intrastat = Tax.EU.Intrastat || {};

Tax.EU.Intrastat.IntrastatDataAggregator = function IntrastatDataAggregator() {
    Tax.Processor.call(this);
    this.Name = 'IntrastatDataAggregator';
    this.list = [];
    this.keyToListMap = {};
};

Tax.EU.Intrastat.IntrastatDataAggregator.prototype = Object.create(Tax.Processor.prototype);

Tax.EU.Intrastat.IntrastatDataAggregator.prototype.add = function add(obj) {
    if (!obj) {
        return;
    }
    
    try {
        var key = this.getConsolidationKey(obj);
        var listItem = this.list[this.keyToListMap[key]];

        if (listItem != undefined) {
            listItem.origValue += obj.origValue;
            listItem.origSupplementaryUnit += obj.origSupplementaryUnit;
            listItem.origNetMass += obj.origNetMass;
            
            this.setDisplayAmounts(listItem);
        } else {
            this.setDisplayAmounts(obj);
            obj.lineNumber = this.list.length + 1;
            
            this.list.push(obj);
            this.keyToListMap[key] = obj.lineNumber - 1;
        }
    } catch(e) {
        logException(e, 'Tax.EU.Intrastat.IntrastatDataAggregator.add');
    }
};

Tax.EU.Intrastat.IntrastatDataAggregator.prototype.get = function get() {
    return this.list;
};

Tax.EU.Intrastat.IntrastatDataAggregator.prototype.setDisplayAmounts = function setDisplayAmounts(obj) {
    obj.value = obj.origValue;
    obj.supplementaryUnit = Math.ceil(obj.origSupplementaryUnit);
    obj.netMass = Math.max(Math.ceil(obj.origNetMass), 1);
};

Tax.EU.Intrastat.IntrastatDataAggregator.prototype.getConsolidationKey = function getConsolidationKey(obj) {
    if (!obj) {
        var error = nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'An object is required.');
        logException(error, 'Tax.EU.Intrastat.IntrastatDataAggregator.getConsolidationKey');
        throw error;
    }
    
    return [
        obj.commodityCode,
        obj.natureOfTransaction,
        obj.deliveryTerm,
        obj.countryCode,
        obj.referenceNo,
        obj.entityVatNo
    ].join('-');
};

Tax.EU.Intrastat.IntrastatDataAggregator.prototype.process = function process(result, params) {
    Tax.Cache.MemoryCache.getInstance().save('dataAggregator', this);
};
