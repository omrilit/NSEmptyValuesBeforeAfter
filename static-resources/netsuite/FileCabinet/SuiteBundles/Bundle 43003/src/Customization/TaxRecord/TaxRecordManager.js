/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */

if (!VAT) { var VAT = {}; }
VAT.TaxRecord = VAT.TaxRecord || {};

VAT.TaxRecord.STATUS = {
	NEVER: 'never',
	PENDING: 'pending',
	FAILED: 'failed',
	DONE: 'done'
};

VAT.TaxRecord.TaxRecordManagerStatus = function _TaxRecordManagerStatus() {
	return {
		status: VAT.TaxRecord.STATUS.PENDING,
		nexus: '',
		error: ''
	};
};

VAT.TaxRecord.TaxRecordManager = function _TaxRecordManager(params) {
	this.taxCodeExtractor = params.taxCodeExtractor;
	this.taxRecordAdaptor = params.taxRecordAdaptor;
};

VAT.TaxRecord.TaxRecordManager.prototype.provisionTaxRecords = function _provisionTaxRecords(nexusObj) {
	var mgrStatus = new VAT.TaxRecord.TaxRecordManagerStatus();
	mgrStatus.nexus = nexusObj.country;

	try {
		var taxRecords = this.taxCodeExtractor.getTaxRecords(nexusObj);
		taxRecords = this.taxRecordAdaptor.adapt(taxRecords);
		taxRecords = this.createTaxRecords(taxRecords);
		mgrStatus.status = VAT.TaxRecord.STATUS.DONE;
	} catch (ex) {
		logException(ex, 'VAT.TaxRecord.TaxRecordManager.provisionTaxRecords');
		mgrStatus.status = VAT.TaxRecord.STATUS.FAILED;
		mgrStatus.error = ex.toString();
	}

	return mgrStatus;
};

VAT.TaxRecord.TaxRecordManager.prototype.createTaxRecords = function _createTaxRecords(taxRecords) {
	new VAT.TaxRecord.TaxControlAccountProcessor().process(taxRecords);
	new VAT.TaxRecord.TaxTypeProcessor().process(taxRecords);
	new VAT.TaxRecord.TaxCodeProcessor().process(taxRecords);
};