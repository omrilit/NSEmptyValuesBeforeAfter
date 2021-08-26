/**
 * Copyright © 2016, 2018, 2019 Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.DAO = TAF.DAO || {};

TAF.DAO.TaxCodeDaoSingleton = (function() { //singleton
	var _instance = null;
	return {
		getInstance : function(params) {
			if (!_instance) {
				_instance = new TAF.DAO.TaxCodeDao(params);
			}
			return _instance;
		}
	};
})();

TAF.DAO.TaxCode = function _TaxCode(id) {
	return {
		Id: id,
		Name: '',
		CountryCode: '',
		Rate: '',
		Parent: '',
		IsForSales: '',
		IsForPurchase: '',
		IsExempt: '',
		IsService: '',
		IsEC: '',
		IsForExport: '',
		IsExcluded: '',
		IsReverseCharge: '',
		NotionalRate: '',
		IsImport: '',
		IsGovernment: '',
		IsCapitalGoods: '',
		IsNoTaxInvoice: '',
		IsPurchaserIssued: '',
		IsDuplicateInvoice: '',
		IsTriplicateInvoice: '',
		IsOTherTaxEvidence: '',
		IsCashRegister: '',
		IsReduced: '',
		IsSuperReduced: '',
		IsSurcharge: '',
		IsNonOperation: '',
		IsNoTaxCredit: '',
		IsElectronic: '',
		IsSpecialTerritory: '',
		IsUnknownTaxCredit: '',
		IsSuspended: '',
		IsNonTaxable: '',
		IsPartialCredit: '',
		IsCustomsDuty: '',
		IsPaid: '',
		IsOutsideCustoms: '',
		IsNonResident: '',
		IsNonRecoverable: '',
		IsReverseChargeAlt: '',
		IsNonDeductibleRef: '',
		IsNonDeductible: '',
		IsCategoryType: '',
		IsPostNotional: '',
		IsDeemedSupply: '',
		DeferredOn: '',
		IsGCCState: '',
		IsDigitalServices: ''
	};
};

TAF.DAO.TaxCodeDao = function _TaxCodeDao(params) {
	TAF.DAO.SearchDAO.call(this);
	this.recordType = 'salestaxitem';
	this.fields = {
		itemid: 'itemid',
		country: 'country',
		rate: 'rate',
		available: 'availableon',
		exempt: 'exempt',
		service: 'appliestoservice',
		eccode: 'iseccode',
		export: 'isexport',
		exclude: 'isexcludetaxreports',
		reverseCharge: 'isreversecharge',
		parent: 'parent',
		import: 'custrecord_4110_import',
		government: 'custrecord_4110_government',
		capitalGoods: 'custrecord_4110_capital_goods',
		noTaxInvoice: 'custrecord_4110_no_tax_invoice',
		purchaserIssued: 'custrecord_4110_purchaser_issued',
		duplicate: 'custrecord_4110_duplicate',
		triplicate: 'custrecord_4110_triplicate',
		otherTaxEvidence: 'custrecord_4110_other_tax_evidence',
		cashRegister: 'custrecord_4110_cash_register',
		reducedRate: 'custrecord_4110_reduced_rate',
		superReduced: 'custrecord_4110_super_reduced',
		surcharge: 'custrecord_4110_surcharge',
		nonOperation: 'custrecord_4110_non_operation',
		noTaxCredit: 'custrecord_4110_no_tax_credit',
		electronic: 'custrecord_4110_electronic',
		specialTerritory: 'custrecord_4110_special_territory',
		unknownTaxCredit: 'custrecord_4110_unknown_tax_credit',
		suspended: 'custrecord_4110_suspended',
		nonTaxable: 'custrecord_4110_non_taxable',
		partialCredit: 'custrecord_4110_partial_credit',
		duty: 'custrecord_4110_duty',
		paid: 'custrecord_4110_paid',
		outsideCustoms: 'custrecord_4110_outside_customs',
		nonResident: 'custrecord_4110_non_resident',
		nonRecoverable: 'custrecord_4110_non_recoverable',
		reverseChargeAlt: 'custrecord_4110_reverse_charge_alt',
		nonDeductible: 'custrecord_4110_non_deductible',
		nonDeductibleParent: 'custrecord_4110_nondeductible_parent',
		category: 'custrecord_4110_category',
		// parentAlt: 'custrecord_4110_parent_alt'
		deemedSupply: 'custrecord_deemed_supply',
		deferredOn: 'custrecord_deferred_on',
		gccState: 'custrecord_gcc_state',
		digitalServices: 'custrecord_for_digital_services'
	};
    
    this.hasSTCBundle = params.hasSTCBundle;
    if(this.hasSTCBundle) {
        this.fields.postNotional = 'custrecord_post_notional_tax_amount';
    }

    this.isAdvancedTaxes = this.context.getFeature('advtaxengine');
	this.taxCodeCache = this.searchTaxCodesByCountryCode(params.countryCode);
};
TAF.DAO.TaxCodeDao.prototype = Object.create(TAF.DAO.SearchDAO.prototype);

TAF.DAO.TaxCodeDao.prototype.createSearchFilters = function _createSearchFilters(params) {
	if (this.isAdvancedTaxes && params && params.countryCode) {
		this.filters.push(new nlobjSearchFilter("country", null, "is", params.countryCode));
	}
};

TAF.DAO.TaxCodeDao.prototype.rowToObject = function _rowToObject(row) {
	try {
		var obj = new TAF.DAO.TaxCode(row.getId());
		var rate = row.getValue('rate');
		var available = row.getValue('availableon');

		obj.Name = row.getValue('itemid');
		obj.CountryCode = row.getValue('country');
		obj.Rate = rate ? parseFloat(rate) : 0;
		obj.Parent = row.getValue('parent');
		obj.IsForSales = available == "BOTH" || available == "SALE";
		obj.IsForPurchase = available == "BOTH" || available == "PURCHASE";
		obj.IsExempt = row.getValue('exempt') == "T";
		obj.IsService = row.getValue('appliestoservice') == "T";
		obj.IsEC = row.getValue('iseccode') == "T";
		obj.IsForExport = row.getValue('isexport') == "T";
		obj.IsExcluded = row.getValue('isexcludetaxreports') == "T";
		obj.IsReverseCharge = row.getValue('isreversecharge') == "T";
//		obj.NotionalRate = _TaxCodeRates[row.getValue('parent')];
		obj.IsImport = row.getValue('custrecord_4110_import') == "T";
		obj.IsGovernment = row.getValue('custrecord_4110_government') == "T";
		obj.IsCapitalGoods = row.getValue('custrecord_4110_capital_goods') == "T";
		obj.IsNoTaxInvoice = row.getValue('custrecord_4110_no_tax_invoice') == "T";
		obj.IsPurchaserIssued = row.getValue('custrecord_4110_purchaser_issued') == "T";
		obj.IsDuplicateInvoice = row.getValue('custrecord_4110_duplicate') == "T";
		obj.IsTriplicateInvoice = row.getValue('custrecord_4110_triplicate') == "T";
		obj.IsOTherTaxEvidence = row.getValue('custrecord_4110_other_tax_evidence') == "T";
		obj.IsCashRegister = row.getValue('custrecord_4110_cash_register') == "T";
		obj.IsReduced = row.getValue('custrecord_4110_reduced_rate') == "T";
		obj.IsSuperReduced = row.getValue('custrecord_4110_super_reduced') == "T";
		obj.IsSurcharge = row.getValue('custrecord_4110_surcharge') == "T";

		obj.IsNonOperation = row.getValue('custrecord_4110_non_operation') == "T";
		obj.IsNoTaxCredit = row.getValue('custrecord_4110_no_tax_credit') == "T";
		obj.IsElectronic = row.getValue('custrecord_4110_electronic') == "T";
		obj.IsSpecialTerritory = row.getValue('custrecord_4110_special_territory') == "T";
		obj.IsUnknownTaxCredit = row.getValue('custrecord_4110_unknown_tax_credit') == "T";
		obj.IsSuspended = row.getValue('custrecord_4110_suspended') == "T";
		obj.IsNonTaxable = row.getValue('custrecord_4110_non_taxable') == "T";
		obj.IsPartialCredit = row.getValue('custrecord_4110_partial_credit') == "T";
		obj.IsCustomsDuty = row.getValue('custrecord_4110_duty') == "T";
		obj.IsPaid = row.getValue('custrecord_4110_paid') == "T";
		obj.IsOutsideCustoms = row.getValue('custrecord_4110_outside_customs') == "T";
		obj.IsNonResident = row.getValue('custrecord_4110_non_resident') == "T";
		obj.IsNonRecoverable = row.getValue('custrecord_4110_non_recoverable') == "T";

		obj.IsReverseChargeAlt = row.getValue('custrecord_4110_reverse_charge_alt') == "T";
		obj.IsNonDeductible = row.getValue('custrecord_4110_non_deductible') == "T";
		obj.IsNonDeductibleRef = row.getValue('custrecord_4110_nondeductible_parent') ? true : false;
		obj.Category = row.getValue('custrecord_4110_category');
		obj.IsPostNotional = row.getValue('custrecord_post_notional_tax_amount') == "T";
		obj.IsDeemedSupply = row.getValue('custrecord_deemed_supply') == "T";
        obj.DeferredOn = row.getValue('custrecord_deferred_on');
		obj.IsGCCState = row.getValue('custrecord_gcc_state') == "T";
		obj.IsDigitalServices = row.getValue('custrecord_for_digital_services') == "T";

		obj.IsCategoryType = function getSelectedCategory(val, isNull) {
			var selcategory = this.Category;

			if (!selcategory && isNull) {
				return true;
			} else {
				return selcategory == val;
			}
		};

		// if (obj.IsReverseChargeAlt && !obj.NotionalRate) {
		// 	var tempNotionalRate = _TaxCodeRates[this.rawdata.parent_alt];
		// 	obj.NotionalRate = tempNotionalRate ? tempNotionalRate : 0;
		// }

		return obj;
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.DAO.TaxCodeDao.rowToObject', ex.toString());
		throw ex;
	}
};


TAF.DAO.TaxCodeDao.prototype.searchTaxCodesByCountryCode = function _searchTaxCodesByCountryCode(countryCode) {
	try {
		if (!countryCode) {
			throw nlapiCreateError('INVALID_SEARCH', 'Unable to extract report data');
		}

		var taxCodesByCountryCode = this.search({countryCode: countryCode}).getMap();
		return taxCodesByCountryCode;
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.DAO.TaxCodeDao.searchTaxCodesByCountryCode', ex.toString());
		throw ex;
	}

};

TAF.DAO.TaxCodeDao.prototype.searchById = function _searchById(internalId) {
	try {
		if (!internalId) {
			throw nlapiCreateError('INVALID_SEARCH', 'Unable to extract report data');
		}

		var taxCodeRecord = null;
		taxCodeRecord = this.taxCodeCache[internalId];
		return taxCodeRecord;
	} catch (ex) {
		nlapiLogExecution('ERROR', 'TAF.DAO.TaxCodeDao.searchById', ex.toString());
		throw ex;
	}
};