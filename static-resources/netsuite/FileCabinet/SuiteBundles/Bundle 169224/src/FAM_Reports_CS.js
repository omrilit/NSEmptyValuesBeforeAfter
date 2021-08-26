/**
 * � 2015 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/

var FAM;
if (!FAM) { FAM = {}; }

FAM.Reports_CS = new function () {   
	
	this.pageInit = function(type) {	
		this.alertMessage = FAM.Util_CS.fetchMessageObj({
			ADVANCED_PRINTING_DISABLED : 'custpage_advprinting_disabled',
		    });
	};
    /**
     * The recordType (internal id) corresponds to the "Applied To" record in your script deployment
     * @appliedtorecord recordType
     *
     * @param {String} type Sublist internal id
     * @param {String} name Field internal id
     * @param {Number} linenum Optional line item number, starts from 1
     * @returns {Void}
     */
    this.fieldChanged = function (type, name, linenum) {
        switch (name){
            case 'custpage_reporttype':
                var repType = +nlapiGetFieldValue('custpage_reporttype');
                nlapiGetField('custpage_showcomponents').setDisplayType('hidden');
                
                switch(repType){
                    case FAM.ReportType['Asset Register']:
                        nlapiGetField('custpage_showcomponents').setDisplayType('normal');
                    case FAM.ReportType['Asset Summary']:
                    case FAM.ReportType['DepMonthly']:
                        nlapiGetField('custpage_saveresults').setDisplayType('hidden');
                        nlapiGetField('custpage_saveascsv').setDisplayType('hidden');
                        break;
                    case FAM.ReportType['DepSchedule NBV']:
                    case FAM.ReportType['DepSchedule PD']:
                    default:
                        nlapiGetField('custpage_saveresults').setDisplayType('normal');
                        nlapiGetField('custpage_saveascsv').setDisplayType('normal');
                }
                
                this.toggleDepMonthly(repType === FAM.ReportType['DepMonthly']);
            break;
        }
    };
    
    this.saveRecord = function() {
    	var retVal = true;
    	var repType = +nlapiGetFieldValue('custpage_reporttype');

        switch(repType){
        	case FAM.ReportType['DepSchedule NBV']:
	        case FAM.ReportType['DepSchedule PD']:
	        	var blnCSV = nlapiGetFieldValue('custpage_saveascsv') === 'T';
	        	if(blnCSV)
	        		break;
	        case FAM.ReportType['Asset Register']:
	        case FAM.ReportType['Asset Summary']:
	        	if(!FAM.Context.blnAdvPrinting){
	        		alert(this.alertMessage.ADVANCED_PRINTING_DISABLED);
	        		retVal = false;
	        	}
	            break;
	        default: //do nothing
	            break;
        }
        
        return retVal;
        
	};
    
    this.toggleDepMonthly = function(depMonthlyFlag) {
        if (depMonthlyFlag) {
            var currDate = new Date();
            var startDate = new Date(currDate.getFullYear(), currDate.getMonth(), 1, 0, 0, 0);
            var endDate = new Date(currDate.getFullYear(), currDate.getMonth() + 1, 0);
            nlapiSetFieldValue('custpage_filterstartdate', nlapiDateToString(startDate, 'DATE'));
            nlapiSetFieldValue('custpage_filterenddate', nlapiDateToString(endDate, 'DATE'));
            nlapiSetFieldValue('custpage_filtermsselect', 'all_assets');
            nlapiSetFieldValue('custpage_filtersmethod', 0);
            if (nlapiGetField('custpage_filteracctngbook')) {
                nlapiSetFieldValue('custpage_filteracctngbook', FAM.Util_Shared.getPrimaryBookId());
            }
        }
        else {
            nlapiSetFieldValue('custpage_filterstartdate', '');
            nlapiSetFieldValue('custpage_filterenddate', '');
            if (nlapiGetField('custpage_filteracctngbook')) {
                nlapiSetFieldValue('custpage_filteracctngbook', '');
            }
        }
        nlapiDisableField('custpage_filtermsselect', depMonthlyFlag);
        nlapiDisableField('custpage_filtersmethod', depMonthlyFlag);
        if (nlapiGetField('custpage_filteracctngbook')) {
            nlapiDisableField('custpage_filteracctngbook', depMonthlyFlag);
        }
    };
};
