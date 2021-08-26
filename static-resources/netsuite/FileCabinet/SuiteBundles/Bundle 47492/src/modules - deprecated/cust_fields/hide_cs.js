/**
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
var TAF = TAF || {};
TAF.SG = TAF.SG || {};
TAF.CS = TAF.CS || {};
TAF.DAO = TAF.DAO || {};

TAF.SG.OnPageInit = function _OnPageInit() {
    new TAF.CS.Hide().SetFieldVisibility();
};

TAF.SG.OnFieldChanged = function _OnFieldChanged(nsType, nsName) {
    if (nsName == 'entity' || nsName == 'subsidiary') {
    	new TAF.CS.Hide().SetFieldVisibility();
    }
};

TAF.CS.Hide = function _Hide() {
	var context = nlapiGetContext();
	this.isUi = (context.getExecutionContext() == 'userinterface');
	this.isOneWorld = (context.getSetting('FEATURE', 'SUBSIDIARIES') == 'T');
	
	// 4599 Reused for MY
	// See PSG Engineering > Malaysia GST Audit File (GAF) - 7653 for reference
	this.IMPORT_PERMIT_NUM = "custbody_4599_sg_import_permit_num";
	this.IMPORT_DECLARATION_NUM = "custbody_my_import_declaration_num";
	this.DOC_DATE = "custbody_document_date";
	
	this.SUPPORTED_FIELDS_BY_COUNTRY = {
		"MY": [this.IMPORT_DECLARATION_NUM],
		"SG": [this.IMPORT_PERMIT_NUM, this.DOC_DATE],
        'FR': [this.DOC_DATE]
	};
		
	this.SUPPORTED_RECORDS_BY_FIELD = {};
	this.SUPPORTED_RECORDS_BY_FIELD[this.IMPORT_DECLARATION_NUM] = 
		['purchaseorder', 'vendorbill','vendorcredit',
 		'vendorreturnauthorization','check'];
	
	this.SUPPORTED_RECORDS_BY_FIELD[this.DOC_DATE] = 
		['invoice', 'vendorbill', 'vendorcredit', 
	     'cashsale', 'creditmemo', 'cashrefund'];
	
	this.SUBSIDIARY_CACHE = 'custpage_taf_subsidiarycache';
	
	// Restore Cache
	this.subCache = new TAF.ViewBag().GetValue(this.SUBSIDIARY_CACHE);
};

TAF.CS.Hide.prototype.SetFieldVisibility = function _SetFieldVisibility() {
    var country = this.GetCountry();
	if(!this.CanUpdateVisibility(country)) return;	

	nlapiSetFieldDisplay(this.IMPORT_PERMIT_NUM, this.IsFieldSupported(country, this.IMPORT_PERMIT_NUM));
	nlapiSetFieldDisplay(this.DOC_DATE, this.IsFieldSupported(country, this.DOC_DATE));
	nlapiSetFieldDisplay(this.IMPORT_DECLARATION_NUM, this.IsFieldSupported(country, this.IMPORT_DECLARATION_NUM));
};

TAF.CS.Hide.prototype.CanUpdateVisibility = function _CanUpdateVisibility(country){
	return (this.isOneWorld && this.isUi && country) ? true : false;
};

TAF.CS.Hide.prototype.GetCountry = function _GetCountry(){
	try{
		var subsidiaryCountry = this.isOneWorld ?  
			this.subCache[nlapiGetFieldValue('subsidiary')]: null;
		var nexusCountry = nlapiGetFieldValue('nexus_country');
		return subsidiaryCountry ? subsidiaryCountry :
			nexusCountry ? nexusCountry : "";	
	} catch(ex) {
		nlapiLogExecution('ERROR', 'TAF.UE.Hide.GetCountry', ex.toString());
		return '';
	}	
};

TAF.CS.Hide.prototype.IsFieldSupported = function _IsFieldSupported(country, field){
	return 	this.IsFieldSupportedByCountry(country, field) && 
			this.IsRecSupportedByField(field);
};

TAF.CS.Hide.prototype.IsRecSupportedByField = function _IsRecSupportedByField(field)
{
	var srbf = this.SUPPORTED_RECORDS_BY_FIELD ? this.SUPPORTED_RECORDS_BY_FIELD[field]: null;
	return (!srbf || (srbf && srbf instanceof Array && srbf.indexOf(nlapiGetRecordType()) !== -1)) ? true: false;
};

TAF.CS.Hide.prototype.IsFieldSupportedByCountry = function _IsRecSupportedByField(country, field)
{
	if (!this.SUPPORTED_FIELDS_BY_COUNTRY) return false;
	var sfbc = this.SUPPORTED_FIELDS_BY_COUNTRY[country];
	return (sfbc && sfbc instanceof Array && sfbc.indexOf(field) !== -1) ? true: false;
};
