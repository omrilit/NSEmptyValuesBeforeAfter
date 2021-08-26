/**
 * Copyright © 2014, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};

TAF.BundleInstall = new function(){

    this.beforeInstall = _beforeInstall;
    this.beforeUpdate = _beforeUpdate;
	this.afterInstall = _afterInstall;
	this.afterUpdate = _afterUpdate;
        
    function _beforeInstall() {
        checkEnabledFeatures();
    }
        
    function _beforeUpdate() {
        checkEnabledFeatures();
    }

	function _afterInstall() {
		renameRawFiles();
		deleteSCOADeployment();
	}
	
	function _afterUpdate() {
		//Calling Schedule script for migration PT-SAFT Account Grouping records.
		nlapiScheduleScript('customscript_migrate_pt_acct_grouping_ss', 'customdeploy_migrate_pt_acct_grouping_ss');
		deleteSCOADeployment();
	}
	
	function renameRawFiles() {
		try {
			var parent_folder = nlapiSearchRecord("file", null, new nlobjSearchFilter("name", null, "is", "0ff667bf-1663-447e-b23c-5282653a6bca"), new nlobjSearchColumn("folder"));
			
			if(parent_folder){
				var filters = [new nlobjSearchFilter("name", null, "is", "Raw Files"),
				               new nlobjSearchFilter("parent", null, "is", parent_folder[0].getValue("folder"))];
				var rs = nlapiSearchRecord("folder", null, filters , [new nlobjSearchColumn("name")]);
	
				if(rs){
					nlapiSubmitField("folder", rs[0].getId(), "name", "Raw Files ("+new Date().toString()+")");
				}
			}
		} catch (ex) {
			nlapiLogExecution('ERROR', 'TAF.BundleInstall.renameRawFiles', ex.toString());
		}
	}
	
	function deleteSCOADeployment() {
		try {
			var isOW = nlapiGetContext().getSetting('FEATURE', 'SUBSIDIARIES') == 'T';
			if (!isOW) {
				var sr = nlapiSearchRecord('scriptdeployment', null, [['scriptid', 'is', 'customdeploy_scoa_s']]);
				if (sr && sr.length > 0) {
					nlapiDeleteRecord('scriptdeployment', sr[0].getId());
				}
			}
		} catch (ex) {
			nlapiLogExecution('ERROR', 'TAF.BundleInstall.deleteSCOADeployment', ex.toString());
		}
	}

	function checkEnabledFeatures() {
        if (nlapiGetContext().getFeature('TAX_OVERHAULING')) {
            throw nlapiCreateError('INSTALLATION_ERROR', 'You cannot install the Tax Audit Files SuiteApp if the SuiteTax feature is enabled in your NetSuite account. The Tax Audit Files SuiteApp is not compatible with the SuiteTax feature.');
        }
	}
};

