/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.AE = TAF.AE || {};
TAF.AE.Adapter = TAF.AE.Adapter || {};

TAF.AE.Adapter.AETransactionAdapter = function _AETransactionAdapter(params, state) {
    var STC_BUNDLE = '9b168872-32ec-4d8e-b73e-38193fedc4d3';
    this.hasSTCBundle = SFC.Registry.IsInstalled(STC_BUNDLE);

	this.DEFAULT = {
		ISO_CURRENCY : 'XXX',
		DATE : '31-12-9999'
	};

	this.isMultibook = params.isMultibook;
	this.isMulticurrency = params.isMulticurrency;
	this.baseCurrency = params.baseCurrency;
	this.currencyMap = params.currencyMap;
	this.taxCodeCache = params.taxCodeCache;
	this.taxCodeMapping = {
		'ZS-GCC' : 'IG',
		'Z': 'ZR',
		'X': 'EX',
		'S': 'SR',
		'RC': 'RC',
		'RCP': 'RC',
		'IMZ': 'RC',
		'IMS': 'RC',
		'IMG': 'SR',
		'EX': 'ZR'
	}

    if (VAT && VAT.AE) {
        this.taxCodeDef = new SFC.TaxCodes.Definitions(VAT.AE);
    }

	if (state) {
		this.state = state;
	} else {
		this.state = {
			tranId : -1,
			lineNo: 0
		};
	}
};

TAF.AE.Adapter.AETransactionAdapter.prototype.getVATNo = function _getVATNo(vatNo) {
    if (!vatNo) {
        return '';
    }

    vatNo = vatNo.replace(/[^0-9]/g, '');
    return vatNo;
};

TAF.AE.Adapter.AETransactionAdapter.prototype.setTaxDetails = function _setTaxDetails(line, searchObj) {
    var taxCode = this.taxCodeCache[searchObj.taxItemId];

    if (!taxCode) {
        return;
    }

    line.taxCode = this.taxCodeMapping[this.taxCodeDef.GetTypeOf(taxCode)] || '';
    if (taxCode.IsReverseCharge && taxCode.Parent && taxCode.IsPostNotional) {
        var parentTaxCode = this.taxCodeCache[taxCode.Parent];
        line.taxRate = parentTaxCode && parentTaxCode.Rate;
        line.isReverseCharge = true;
    } else {
        line.taxRate = taxCode.Rate;
    }
};

TAF.AE.Adapter.AETransactionAdapter.prototype.setLineNo = function _setLineNo(line, searchObj) {
    if (this.state.tranId == searchObj.id) {
        line.lineNo = ++this.state.lineNo;
    } else {
        this.state.tranId = searchObj.id;
        this.state.lineNo = 1;
        line.lineNo = this.state.lineNo;
    }
};

TAF.AE.Adapter.AETransactionAdapter.prototype.setAmounts = function _setAmounts(line, searchObj) {
    var taxRate = (parseFloat(line.taxRate) || 0) / 100;
    this.setAEDValues(line, searchObj, taxRate);
    this.setFCYValues(line, searchObj, taxRate);
};

TAF.AE.Adapter.AETransactionAdapter.prototype.convertSummary = function _convertSummary(searchObj) {
    if(!searchObj) {
        throw nlapiCreateError('MISSING_PARAMETER', 'searchObj is required');
    }
    var summary = {};

    this.setTaxDetails(summary, searchObj);
    var taxRate = (parseFloat(summary.taxRate) || 0) / 100;
    this.setAEDValues(summary, searchObj, taxRate);

    return summary;
};

TAF.AE.Adapter.AETransactionAdapter.prototype.getSign = function _getSign(number) {
    if(isNaN(number) || number === null || number === '') {
        throw nlapiCreateError('INVALID_PARAMETER', 'input parameter must be a number');
    }
    
    if(number == 0) {
    	return 0;
    }
    
    return number > 0 ? 1 : -1;
};