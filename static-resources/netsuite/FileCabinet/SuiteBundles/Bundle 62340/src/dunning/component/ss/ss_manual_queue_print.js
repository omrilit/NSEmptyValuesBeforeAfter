/**
 * © 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code. 
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Aug 2015         ldimayuga
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */

if (!dunning) {
    var dunning = {};
}

dunning.component = dunning.component || {};
dunning.component.ss = dunning.component.ss || {};

dunning.component.ss.ManualPrint = function ManualPrint() {
	var DER_ID_LIST = "custscript_3805_der_print_list";
	var TRANS_COUNT_LIMIT = "custscript_3805_print_count_limit";

	var DEFAULT_PRINT_THRESHOLD = 500;
	var DEFAULT_USAGE_THRESHOLD = 1000;
    var retrieveThreshold = false;

	var Context = new ns_wrapper.Context();
    var ScheduleAPI = new ns_wrapper.Scheduler();

    
	this.generateFile = function generateFile() {
		var paramDERValue= Context.getSetting("SCRIPT", DER_ID_LIST);
		var derIds = []; 
		
		try {
			derIds = paramDERValue ? JSON.parse(paramDERValue) : [];		
		} catch (e) {
			nlapiLogExecution("ERROR", "JSON.parse() error", e);
		}
		
		var dunningPDFManager = new dunning.app.DunningPDFManager();
		var pdfResultPaths = [];

		for (var i = 0; i < derIds.length; i++) {
			checkGovernance(i);
			var derId = derIds[i];
			var path = dunningPDFManager.generatePDFFiles(derId);
			pdfResultPaths.push(path);
		}
		
		dunningPDFManager.notifyUser(pdfResultPaths, -5);

	};
	
	function checkGovernance(i) {
        var threshold = getScheduleThreshold();

		if (((i > 0) && (i % threshold === 0)) || (Context.getRemainingUsage() <= DEFAULT_USAGE_THRESHOLD)) {
			ScheduleAPI.yieldScript();
		}
	}
	
	function getScheduleThreshold() {
		var scheduleThreshold = DEFAULT_PRINT_THRESHOLD;
		if (!retrieveThreshold) {
			scheduleThreshold = Context.getSetting("SCRIPT", TRANS_COUNT_LIMIT) || DEFAULT_PRINT_THRESHOLD ;
			retrieveThreshold = true;
		}
		return scheduleThreshold;
	}
};

function generate() {
	var manual = new dunning.component.ss.ManualPrint();
	manual.generateFile();
};

