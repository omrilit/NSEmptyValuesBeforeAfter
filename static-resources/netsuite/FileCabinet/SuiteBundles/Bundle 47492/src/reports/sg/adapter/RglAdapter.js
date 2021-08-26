/**
 * Copyright 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.SG = TAF.SG || {};
TAF.SG.Adapter = TAF.SG.Adapter || {};

TAF.SG.Adapter.RglLine = function _RglLine(id) {
    return {
        customerName : '',
        customerUEN : '',
        invoiceDate : '',
        invoiceNo : '',
        lineNo : '',
        productDescription : '',
        supplyValueSGD : '',
        gstValueSGD : '0',
        taxCode : 'ES33',
        country : '',
        fcyCode : 'XXX',
        supplyFCY : 0,
        gstFCY : 0
    };
};

TAF.SG.Adapter.RglAdapter = function _RglAdapter(state) {
    this.DEFAULT = {
        ISO_CURRENCY : 'XXX',
        DATE : '12/31/9999'
    };
    
    if (state) {
        this.state = state;
    }

    this.key = '';
    this.lineNo = 0;
};

TAF.SG.Adapter.RglAdapter.prototype.getRglLine = function _getRglLine(searchObj) {
    try {
        if (!searchObj || !searchObj.entity || !searchObj.date) {
            return null;
        }
        
        var rgl = new TAF.SG.Adapter.RglLine();
        
        rgl.customerName = this.getCustomerName(searchObj);
        rgl.customerUEN = searchObj.entityUen;
        rgl.invoiceDate = this.getDate(searchObj.date);
        rgl.invoiceNo = searchObj.sourceTranNo;
        rgl.supplyValueSGD = searchObj.rglAmount;
        rgl.productDescription = this.state.rglAccountName;
        
        var key = this.getKey(rgl);
        rgl.lineNo = this.getLineNo(key);
        
        return rgl;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'RglAdapter.getOpeningBalance', ex.toString());
        throw nlapiCreateError('DATA_ERROR', 'Invalid search object');
    }
};

TAF.SG.Adapter.RglAdapter.prototype.getCustomerName = function _getCustomerName(searchObj) {
    if (!searchObj.entity || !searchObj.entityId) {
        return searchObj.entity || '';
    }
    
    var name = searchObj.entity;
    var id = searchObj.entityId + ' ';
    return name.replace(id, '');
};

TAF.SG.Adapter.RglAdapter.prototype.getDate = function _getDate(sourceDate) {
    if (!sourceDate) {
        return this.DEFAULT.DATE;
    }
    
    // Saved report date has different format
    return nlapiDateToString(Date.parse(sourceDate)) || this.DEFAULT.DATE;
};

TAF.SG.Adapter.RglAdapter.prototype.getKey = function _getKey(rgl) {
    if (!rgl) {
        return '';
    }
    
    var key = [rgl.invoiceNo, rgl.invoiceDate, rgl.customerName];
    return key.join('-');
};

TAF.SG.Adapter.RglAdapter.prototype.getLineNo = function _getLineNo(key) {
    if (this.key == key) {
        this.lineNo++;
    } else {
        this.key = key;
        this.lineNo = 1;
    }
    return this.lineNo;
};

