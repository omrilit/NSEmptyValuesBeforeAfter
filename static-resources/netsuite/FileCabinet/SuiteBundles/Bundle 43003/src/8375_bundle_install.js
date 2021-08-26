/**
 * Copyright © 2014, 2018, Oracle and/or its affiliates. All rights reserved.
 */

function beforeInstall() {
    checkEnabledFeatures();
}

function beforeUpdate() {
    checkEnabledFeatures();
}

function checkEnabledFeatures() {
    if (nlapiGetContext().getFeature('TAX_OVERHAULING')) {
        throw nlapiCreateError('INSTALLATION_ERROR', 'You cannot install the International Tax Report SuiteApp if the SuiteTax feature is enabled in your NetSuite account. The International Tax Report SuiteApp is not compatible with the SuiteTax feature.');
    }
}

function afterInstall(toversion) {
    // schedule script for generating the transaction field cache
    nlapiScheduleScript("customscript_generate_field_cache", "customdeploy_generate_field_cache");
}

function afterUpdate(fromversion, toversion) {
	var params = {};
	params["custscript_maintenance_stage"] = "start";
	nlapiScheduleScript("customscript_tax_bundle_maintenance", "customdeploy_tax_bundle_maintenance", params);
	
	// schedule script for generating the transaction field cache
	nlapiScheduleScript("customscript_generate_field_cache", "customdeploy_generate_field_cache");
}
