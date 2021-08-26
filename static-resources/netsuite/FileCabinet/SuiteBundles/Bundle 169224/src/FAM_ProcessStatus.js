/**
 * © 2015 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/

var FAM;
if (!FAM) { FAM = {}; }

FAM.ProcessStatus = function () {
    this.titleRegistry = {
        famAssetValueDepreciation : 'custpage_depracctmethods',
        famTaxValueDepreciation : 'custpage_deprtaxmethods',
        famJournalWriting : 'custpage_writingdepr_amounts',
        customscript_fam_mr_disposal : 'custpage_procstatus_dispose',
        famAssetRevaluation : 'custpage_procstatus_reval',
        famAssetSplit : 'custpage_procstatus_split',
        ncFAR_AssetCreationBG : 'custpage_procstatus_create',
        ncFAR_NewPropBG : 'custpage_procstatus_prop',
        famDeprScheduleReport : 'custpage_rep_gen_depr_sched',
        famDeprSchedReportCSV : 'custpage_rep_gen_depr_sched',
        famAssetRegisterReport : 'custpage_rep_gen_asset_register',
        famAssetSummaryReport : 'custpage_rep_gen_asset_summary',
        prevProcess : 'custpage_prevprocess',
        ncFAR_GenerateAssetsFromPropList : 'custpage_procstatus_gen',
        customscript_fam_createcompound_mr : 'custpage_build_comp_asset',
        customscript_fam_updatecompound_mr : 'custpage_update_comp_asset',
        customscript_fam_mr_proposalsplit : 'custpage_proposal_split'
    };
    this.msgRegistry = {
        famAssetValueDepreciation : 'custpage_depracctmethods_count',
        famTaxValueDepreciation : 'custpage_deprtaxmethods_count',
        famJournalWriting : 'custpage_deprhistory_count',
        customscript_fam_mr_disposal : 'custpage_procstatus_dispose_count',
        famAssetRevaluation : 'custpage_procstatus_reval_count',
        famAssetSplit : 'custpage_procstatus_split_count',
        ncFAR_AssetCreationBG : 'custpage_procstatus_create_count',
        ncFAR_NewPropBG : 'custpage_procstatus_prop_count',
        famDeprScheduleReport : 'custpage_report_generation_count',
        famDeprSchedReportCSV : 'custpage_report_generation_count',
        famAssetRegisterReport : 'custpage_report_generation_count',
        famAssetSummaryReport : 'custpage_report_generation_count',
        viewReportAs : 'custpage_view_report_as', 
        noprocess : 'custpage_nocurrent',
        ncFAR_GenerateAssetsFromPropList : 'custpage_procstatus_gen_count',
        viewPropPage : 'custpage_view_proppage',
        customscript_fam_createcompound_mr : 'custpage_build_comp_asset_count',
        customscript_fam_updatecompound_mr : 'custpage_update_comp_asset_count',
        customscript_fam_mr_proposalsplit : 'custpage_proposal_split_count'
    };
    
    // messages to be shown in screen; need to generate this beforehand (in CS and in Suitelet)
    this.title = {};
    this.statusMsg = {};
};

FAM.ProcessStatus.prototype.maxDisplay = 5; // max processes shown given only done entries exist

/**
 * Search the latest process instances
 *
 * Parameters:
 *     {int} results - number of results to be displayed (optional)
 * Returns:
 *     {Array of Object} - Process Id, process name and status
**/
FAM.ProcessStatus.prototype.searchProcessInstance = function (resultCount) {
    var results,
        fSearch = new FAM.Search(new FAM.BGProcess()),
        processObj = [],
        res = resultCount || this.maxDisplay;

    fSearch.addFilter('isinactive', null, 'is', 'F');
    fSearch.addFilter('status', null, 'anyof', [FAM.BGProcessStatus.Queued,
        FAM.BGProcessStatus.InProgress, FAM.BGProcessStatus.Reverting]);
    
    fSearch.addColumn('internalid', null, null, 'SORT_ASC');
    fSearch.addColumn('func_name');
    fSearch.addColumn('status');
    fSearch.addColumn('rec_count');
    fSearch.addColumn('rec_total');
    fSearch.addColumn('rec_failed');
    fSearch.addColumn('state');
    fSearch.addColumn('state_defn');
    
    results = fSearch.run() || [];
    
    res -= results.length;
    if (res > 0) {
        fSearch.columns[0] = new nlobjSearchColumn('internalid').setSort(true);
        fSearch.filters[1] = new nlobjSearchFilter('custrecord_far_proins_procstatus', null,
            'noneof', [FAM.BGProcessStatus.Queued, FAM.BGProcessStatus.InProgress,
            FAM.BGProcessStatus.Reverting]);
        
        fSearch.results = results.concat(fSearch.run(0, res) || []);
    }
    
    for(var i = 0; i < fSearch.results.length; i++) {
        processObj.push({
            id : +fSearch.getId(i),
            funcname : fSearch.getValue(i, 'func_name'),
            status : +fSearch.getValue(i, 'status'),
            statusname : fSearch.getText(i, 'status'),
            rec_count : +fSearch.getValue(i, 'rec_count'),
            rec_total : +fSearch.getValue(i, 'rec_total'),
            rec_failed : +fSearch.getValue(i, 'rec_failed'),
            state : fSearch.getValue(i, 'state'),
            state_defn : fSearch.getValue(i, 'state_defn')
        });
    }
    return processObj;
};
    
/**
 * Outputs html for the transaction status screen
 *
 * Parameters:
 *     {Object} pObj - List of processes
 * Returns:
 *     {Object} - Html formatted list of processes: current and previous processes
 *          - currId - current process id: the progress bar update targets this id
 *          - currHtml - current processes, displayed in html format
 *          - prevMsg - previous processes header message
 *          - prevHtml - previous processes, displayed in html format
**/
FAM.ProcessStatus.prototype.listProcess = function (pObj) {
    var i, status, statusname, func_name, rec_count, url, state, repViewURL,
        currHtml = ['<dl>'], prevHtml = ['<dl>'],
        outObj = { currId : 0, currHtml : '', prevMsg : '', prevHtml : '' },
        propURL = nlapiResolveURL('suitelet', 'customscript_fam_assetproposal_su',
            'customdeploy_fam_assetproposal_su');
    
    var currObjList = [];
    var prevObjList = [];
    
    for (i = 0; i < pObj.length; i++) { 
        status = pObj[i].status;
        statusname = pObj[i].statusname;
        func_name = pObj[i].funcname;
        rec_count = pObj[i].rec_count;
        
        url = nlapiResolveURL('record', 'customrecord_bg_procinstance', pObj[i].id, 'view');
        
        procDetails = this.title[func_name];
        statCount = rec_count + ' ' + this.statusMsg[func_name]
            
        if (status === FAM.BGProcessStatus.Queued
            || status === FAM.BGProcessStatus.InProgress
            || status === FAM.BGProcessStatus.Reverting) {
            
            if (status === FAM.BGProcessStatus.InProgress 
                || status === FAM.BGProcessStatus.Reverting) {
                
                procDetails = '<b>' + procDetails + '</b>';
                statCount = '<b>' + statCount + '</b>';
            }
            if (outObj.currId === 0) { outObj.currId = pObj[i].id; }
            
            currHtml.push('<dt>' + procDetails + ' (<a href="' + url + '" target="_blank' +'">');
            currHtml.push(statusname +'</a>)</dt><dd>' + statCount + '</dd><br />');
            
            currObjList.push(pObj[i]);
        }
        else {
            state = this.parseStateValues(pObj[i].state, pObj[i].state_defn);
            
            prevHtml.push('<dt>' + procDetails + ' (<a href="' + url + '" target="_blank' +'">');
            prevHtml.push(statusname +'</a>)</dt><dd>' + statCount);
            
            if (state.xml || state.csv) {
                repViewURL = nlapiResolveURL('suitelet', 'customscript_fam_pdfreport_su',
                    'customdeploy_fam_pdfreport_su');
                
                var reportViewLink = this.createReportViewLink(repViewURL, pObj[i].id, state);
                prevHtml.push(reportViewLink);
            }
            else if (status === FAM.BGProcessStatus.Completed
                || status === FAM.BGProcessStatus.CompletedError) {
                    
                if (func_name === 'ncFAR_NewPropBG') {
                    prevHtml.push(' (<a href="' + propURL + '" target="_blank' +'">');
                    prevHtml.push(this.statusMsg['viewPropPage'] + '</a>)');
                }
            }
            
            prevHtml.push('</dd><br />');
            prevObjList.push(pObj[i]);
        }
    }
    
    if (currHtml.join('') === '<dl>') {
        currHtml.push('<dt><dd>' + this.statusMsg['noprocess'] + '</dd></dt>');
    }

    if (prevObjList.length > 0) {
        outObj['prevMsg'] = this.title['prevProcess'];
    }
    
    currHtml.push('</dl>');
    outObj['currHtml'] = currHtml.join('');
    prevHtml.push('</dl>');
    outObj['prevHtml'] = prevHtml.join('');
    
    outObj["currObjList"] = currObjList;
    outObj["prevObjList"] = prevObjList;
    
    var percent = 0;
    if (currObjList.length > 0) {
        var firstObj = currObjList[0];
        var firstObjStatus = firstObj.status;

        if (firstObjStatus === FAM.BGProcessStatus.Completed 
                    || firstObjStatus === FAM.BGProcessStatus.CompletedError 
                    || firstObjStatus === FAM.BGProcessStatus.Failed) {
            percent = 1;
        }
        else if (firstObjStatus === FAM.BGProcessStatus.Queued) {
            percent = 0;
        }
        else {
            percent = this.getPercentage(firstObj.id);
        }
    }
    else {
    	percent = 1;
    }
    outObj["percent"] = percent;
    
    return outObj;
};

FAM.ProcessStatus.prototype.createReportViewLink = function(url, bgpId, state) {
    var fileTypes = [];
    if (state.xml) { fileTypes.push("XML"); fileTypes.push("PDF"); };
    if (state.csv) { fileTypes.push("CSV"); };
    
    var reportViewLinkArr = [];
    
    if (fileTypes.length>0) {
        reportViewLinkArr.push(' (');
        reportViewLinkArr.push(this.statusMsg['viewReportAs']);
        reportViewLinkArr.push(' ');
        
        for (var i = 0; i<fileTypes.length; i++) {
            var fileType = fileTypes[i];
            var fileParam = ['&', fileType.toLowerCase(), '=BGP', bgpId].join('')
            var fileLink = ['<a href="', url, fileParam, '" target="_blank', '">', fileType, '</a>'];
            if (i > 0) { fileLink = ["/"].concat(fileLink) };
            reportViewLinkArr.push(fileLink.join(''))
        }
        
        reportViewLinkArr.push(')');
    };
    
    return reportViewLinkArr.join('');
}
    
/**
 * Gets list of BGP record counts, computed percent & status
 *
 * Parameters:
 *     {int} pId - current background process Id 
 * Returns:
 *     {Object} - computed percent (records processed/ records total) and status
**/
FAM.ProcessStatus.prototype.getPercentage = function(pId) {
    var bgpObj = nlapiLookupField('customrecord_bg_procinstance', pId,
                                    ['custrecord_far_proins_reccount',
                                     'custrecord_fam_proins_recfailed',
                                     'custrecord_fam_proins_rectotal']);
    var recProc = (+bgpObj.custrecord_far_proins_reccount),
        recCnt = (+recProc) + (+bgpObj.custrecord_fam_proins_recfailed),
        recTotal = (+bgpObj.custrecord_fam_proins_rectotal);
        percent = recCnt / recTotal;
        percent = (isNaN(percent) || percent === Infinity) ? 0 : percent;
    return percent || 0
};
    
/**
 * Transforms state values into JSON format.
 *
 *Parameters:
 *   {string} values - string values of the state values
 *   {string} defn - string values of the state definitions, can be null
 * Returns:
 *   {JSON} - JSON object representation of state values
 */
FAM.ProcessStatus.prototype.parseStateValues = function(values, defn) {
    var stateValues = {};
    
    try {
        stateValues = JSON.parse(values);
        if (typeof this.stateValues !== 'object') {
            throw 'should be object';
        }
    }
    catch (e) {
        names  = defn && defn.split(',');
        values = values && values.split(',');

        if (names) {
            for (i = 0; i < names.length; i++) {
                stateValues[names[i]] = (typeof values[i] == 'undefined') ? null : values[i];
            }
        }
    }
    
    return stateValues;
};
