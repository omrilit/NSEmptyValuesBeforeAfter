/**
 * Copyright 2019 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 * @NApiVersion 2.1
 * @NModuleScope Public
 */

define(
    [
        '../adapter/taf_adapter_record',
        '../adapter/taf_adapter_search',
        '../adapter/taf_adapter_log',
        'N/error'
    ],
	function (record, search, log, error) {
		function createSummaryRecord (currentScheduledTaskScriptName, currentScheduledTaskScriptId) {
            if (checkIfTaskAlreadyRun(currentScheduledTaskScriptId)) {return;}
            var PtMrTaskSummaryRec = record.create({
                type: 'customrecord_pt_mr_task_summary'
            });    
            PtMrTaskSummaryRec.setValue('name', currentScheduledTaskScriptName);
            PtMrTaskSummaryRec.setValue('custrecord_pt_script_id', currentScheduledTaskScriptId);
            PtMrTaskSummaryRec.setValue('custrecord_pt_did_the_task_finish', true);    
            PtMrTaskSummaryRec.save();
		}

		function checkIfTaskAlreadyRun (scriptId) {            
            var searchColumns = ['name','custrecord_pt_script_id','custrecord_pt_did_the_task_finish'];
            var searchFilters = [['custrecord_pt_script_id', 'is', scriptId]];  
            var searchResult = search.create({
                type: 'customrecord_pt_mr_task_summary',
                filters: searchFilters,
                columns: searchColumns
            });
            var scheduledTaskSummaryArr = searchResult.run().getRange(0, 1);
			if (!scheduledTaskSummaryArr[0]) {return false;}
			return scheduledTaskSummaryArr[0].getValue('custrecord_pt_did_the_task_finish');
		}
		return {
			createSummaryRecord: createSummaryRecord,
			checkIfTaskAlreadyRun: checkIfTaskAlreadyRun
		};
	}
);