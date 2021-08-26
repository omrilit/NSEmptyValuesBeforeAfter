var Tax = Tax || {};
Tax = Tax || {};
Tax.DAO = Tax.DAO || {};

Tax.DAO.TaxCodeRecordDao = function() {
	Tax.DAO.RecordDAO.call(this);
	this.recordType = 'salestaxitem';
	this.Name = 'TaxRecordDao';
	this.fields = {
		id: 'internalid',
		itemid: 'itemid',
		nexusCountry: 'nexuscountry',
		rate: 'rate',
		available: 'available',
		exempt: 'exempt',
		service: 'service',
		eccode: 'eccode',
		export: 'export',
		exclude: 'excludefromtaxreports',
		reverseCharge: 'reversecharge',
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
		parentAlt: 'custrecord_4110_parent_alt',
		postponedImportVAT: 'custrecord_postponed_import_vat',
		appliesToDigitalServices: 'custrecord_for_digital_services',
		isDirectCostServiceItem: 'custrecord_is_direct_cost_service'			
	};
};
Tax.DAO.TaxCodeRecordDao.prototype = Object.create(Tax.DAO.RecordDAO.prototype);

Tax.DAO.TaxCodeRecordDao.prototype.ListObject = function _listObject(id) {
	return {
		id: id,
		itemid: '',
		nexusCountry: '',
		rate: '',
		available: '',
		exempt: '',
		service: '',
		eccode: '',
		export: '',
		exclude: '',
		reverseCharge: '',
		parent: '',
		import: '',
		government: '',
		capitalGoods: '',
		noTaxInvoice: '',
		purchaserIssued: '',
		duplicate: '',
		triplicate: '',
		otherTaxEvidence: '',
		cashRegister: '',
		reducedRate: '',
		superReduced: '',
		surcharge: '',
		nonOperation: '',
		noTaxCredit: '',
		electronic: '',
		specialTerritory: '',
		unknownTaxCredit: '',
		suspended: '',
		nonTaxable: '',
		partialCredit: '',
		duty: '',
		paid: '',
		outsideCustoms: '',
		nonResident: '',
		nonRecoverable: '',
		reverseChargeAlt: '',
		nonDeductible: '',
		nonDeductibleParent: '',
		category: '',
		parentAlt: '',
		postponedImportVAT: '',
		appliesToDigitalServices: '',
		isDirectCostServiceItem: ''
	};
};

var Tax = Tax || {};
Tax.Adapter = Tax.Adapter || {};

Tax.Adapter.TaxCodeRecord = function TaxCodeRecord(id) {
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
		IsPostponedImportVAT: '',
		IsForDigitalServices: '',
		IsDirectCostServiceItem: ''
	};
};

Tax.Adapter.TaxCodeRecordAdapter = function TaxCodeRecordAdapter() {
	Tax.Adapter.BaseAdapter.call(this);
	this.Name = 'TaxCodeRecordAdapter';
};
Tax.Adapter.TaxCodeRecordAdapter.prototype = Object.create(Tax.Adapter.BaseAdapter.prototype);

Tax.Adapter.TaxCodeRecordAdapter.prototype.transform = function _transform(params) {
	if (!this.rawdata) {

	}
	try {
		var result = new Tax.Adapter.TaxCodeRecord(this.rawdata.id);
		result.Name = this.rawdata.itemid;
		result.CountryCode = this.rawdata.nexusCountry;
		result.Rate = this.rawdata.rate ? parseFloat(this.rawdata.rate) : 0;
		result.Parent = this.rawdata.parent;
		result.IsForSales = this.rawdata.available == "BOTH" || this.rawdata.available == "SALE";
		result.IsForPurchase = this.rawdata.available == "BOTH" || this.rawdata.available == "PURCHASE";
		result.IsExempt = this.rawdata.exempt == "T";
		result.IsService = this.rawdata.service == "T";
		result.IsEC = this.rawdata.eccode == "T";
		result.IsForExport = this.rawdata.export == "T";
		result.IsExcluded = this.rawdata.excludefromtaxreports == "T";
		result.IsReverseCharge = this.rawdata.reverseCharge == "T";
//		result.NotionalRate = _TaxCodeRates[this.rawdata.parent];

		result.IsImport = this.rawdata.import == "T";
		result.IsGovernment = this.rawdata.government == "T";
		result.IsCapitalGoods = this.rawdata.capitalGoods == "T";
		result.IsNoTaxInvoice = this.rawdata.noTaxInvoice == "T";
		result.IsPurchaserIssued = this.rawdata.purchaserIssued == "T";
		result.IsDuplicateInvoice = this.rawdata.duplicate == "T";
		result.IsTriplicateInvoice = this.rawdata.triplicate == "T";
		result.IsOTherTaxEvidence = this.rawdata.otherTaxEvidence == "T";
		result.IsCashRegister = this.rawdata.cashRegister == "T";
		result.IsReduced = this.rawdata.reducedRate == "T";
		result.IsSuperReduced = this.rawdata.superReduced == "T";
		result.IsSurcharge = this.rawdata.surcharge == "T";

		result.IsNonOperation = this.rawdata.nonOperation == "T";
		result.IsNoTaxCredit = this.rawdata.noTaxCredit == "T";
		result.IsElectronic = this.rawdata.electronic == "T";
		result.IsSpecialTerritory = this.rawdata.specialTerritory == "T";
		result.IsUnknownTaxCredit = this.rawdata.unknownTaxCredit == "T";
		result.IsSuspended = this.rawdata.suspended == "T";
		result.IsNonTaxable = this.rawdata.nonTaxable == "T";
		result.IsPartialCredit = this.rawdata.partialCredit == "T";
		result.IsCustomsDuty = this.rawdata.duty == "T";
		result.IsPaid = this.rawdata.paid == "T";
		result.IsOutsideCustoms = this.rawdata.outsideCustoms == "T";
		result.IsNonResident = this.rawdata.nonResident == "T";
		result.IsNonRecoverable = this.rawdata.nonRecoverable == "T";

		result.IsReverseChargeAlt = this.rawdata.reverseChargeAlt == "T";
		result.IsNonDeductibleRef = this.rawdata.nonDeductibleParent ? true : false;
		result.IsNonDeductible = this.rawdata.nonDeductible == "T";
		result.Category = this.rawdata.category;
		result.IsPostponedImportVAT = this.rawdata.postponedImportVAT == "T";
		result.IsForDigitalServices = this.rawdata.appliesToDigitalServices == "T";
		result.IsDirectCostServiceItem = this.rawdata.isDirectCostServiceItem == "T";

		result.IsCategoryType = function getSelectedCategory(val, isNull) {
			var selcategory = this.Category;

			if (!selcategory && isNull) {
				return true;
			} else {
				return selcategory == val;
			}
		};

		// if (result.IsReverseChargeAlt && !result.NotionalRate) {
		// 	var tempNotionalRate = _TaxCodeRates[this.rawdata.parent_alt];
		// 	result.NotionalRate = tempNotionalRate ? tempNotionalRate : 0;
		// }
		return result;
	} catch (ex) {
		throw ex;
	}
};