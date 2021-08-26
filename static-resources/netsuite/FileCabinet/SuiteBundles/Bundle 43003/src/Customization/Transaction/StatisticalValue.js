/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};

VAT.StatisticalValue = function StatisticalValue(record) {
    this.record = record;
};


VAT.StatisticalValue.prototype.calculate =  function calculate() {
    var exchangeRate = this.getExchangeRate();
    var statisticalValue = '';
    
    for (var i = 1; i <= this.record.getLineItemCount('item'); i++) {
		if(this.record.getLineItemValue('item', 'quantity', i)){
			statisticalValue = this.getRawStatisticalValue(i);
			this.setStatisticalValue(i, this.convertToBaseCurrency(statisticalValue, exchangeRate));
		}
    }
};


VAT.StatisticalValue.prototype.getExchangeRate =  function getExchangeRate() {
    var isMultiCurrency = nlapiGetContext().getFeature('MULTICURRENCY');
    return isMultiCurrency ? parseFloat(this.record.getFieldValue('exchangerate')) : 1;
};


VAT.StatisticalValue.prototype.getRawStatisticalValue =  function getRawStatisticalValue(index) {
    return parseFloat(this.record.getLineItemValue('item', 'custcol_statistical_value', index)) || 0;
};


VAT.StatisticalValue.prototype.setStatisticalValue = function setStatisticalValue(index, value) {
    this.record.setLineItemValue('item', 'custcol_statistical_value_base_curr', index, value);
};


VAT.StatisticalValue.prototype.convertToBaseCurrency =  function convertToBaseCurrency(value, exchangeRate) {
    return value * exchangeRate;
};
