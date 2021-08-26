/**
 * � 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var alertMessage = {};
var ALERT_NOT_NEGATIVE = 'client_assetrecord_notnegative';
var ALERT_GREATER_ERROR = 'client_assetrecord_greatererror';
var ALERT_ASSET_REQUIRED = 'client_assetproposal_required';
var ALERT_LEAVE_PAGE = 'client_leavepage';

/*
 * jgutana
 */
//**** Client Script attached on Asset Proposal Record ****
var ALTDEPR_SUBLIST_ID = 'recmachcustrecord_propaltdepr_propid';

function proposal_pageInit(type){
	var messageIdParam = new Array(ALERT_NOT_NEGATIVE,ALERT_GREATER_ERROR);
	alertMessage = FAM_Util.fetchMessageList(messageIdParam);
}

function proposal_saveRecord() {

	//validation for asset costs
	var origcost = parseFloat(nlapiGetFieldValue('custrecord_propassetcost'));
	var residualvalue = parseFloat(nlapiGetFieldValue('custrecord_propresidvalue'));
	var acField = nlapiGetField('custrecord_propassetcost');
	var rvField = nlapiGetField('custrecord_propresidvalue');

	var errorMsg = null;
	if(origcost < 0){
		//Original cost cannot be zero
		errorMsg = FAM_Util.injectMessageParameter(alertMessage[ALERT_NOT_NEGATIVE],new Array(acField.getLabel()));
	} else if(residualvalue < 0){
		//Residual value cost cannot be negative
		errorMsg = FAM_Util.injectMessageParameter(alertMessage[ALERT_NOT_NEGATIVE],new Array(rvField.getLabel()));
	} else if (residualvalue> origcost) {
		//Residual value cannot be greater than original cost
		errorMsg = FAM_Util.injectMessageParameter(alertMessage[ALERT_GREATER_ERROR],new Array(rvField.getLabel(),acField.getLabel()));
	}

	//check if error exist
	if(errorMsg != null) {
		alert(errorMsg);
		return false;
	}

	//validation pass
    return true;
}

function proposal_fieldChanged(type, name, linenum)
{
	if (type == ALTDEPR_SUBLIST_ID) {
		if (name == 'custrecord_propaltdepr_altmethod') {
			if (nlapiGetCurrentLineItemValue(type, name))
				disableFields(type, name);
		}
	}
}

function proposal_lineInit(type)
{
	disableFields(type, 'custrecord_propaltdepr_altmethod');
}

function proposal_validateLine(type)
{
	if (type == ALTDEPR_SUBLIST_ID) {
		if (nlapiGetCurrentLineItemValue(type, 'custrecord_propaltdepr_financialyear') == '') {
			nlapiSetCurrentLineItemValue(type, 'custrecord_propaltdepr_financialyear', 1);
		}

		if (nlapiGetCurrentLineItemValue(type, 'custrecord_propaltdepr_periodconvention') == '') {
			nlapiSetCurrentLineItemValue(type, 'custrecord_propaltdepr_periodconvention', 1);
		}
	}
	return true;
}

function disableFields(sublist, name)
{
	if (!nlapiGetCurrentLineItemValue(sublist, name)) {
		return;
	}

	var bool = true;
	if (nlapiLookupField('customrecord_ncfar_altmethods', nlapiGetCurrentLineItemValue(sublist, name), 'custrecord_altmethodoverride') == 'T') {
		bool = false;
	}
	nlapiDisableLineItemField(sublist, 'custrecord_propaltdepr_deprmethod', bool);
	nlapiDisableLineItemField(sublist, 'custrecord_propaltdepr_convention', bool);
	nlapiDisableLineItemField(sublist, 'custrecord_propaltdepr_lifetime', bool);
	nlapiDisableLineItemField(sublist, 'custrecord_propaltdepr_financialyear', bool);
	nlapiDisableLineItemField(sublist, 'custrecord_propaltdepr_periodconvention', bool);
}

//**** Client Script attached on Asset Proposal Page/Suitelet ****
/**
 *
 * @returns {Boolean}
 */
var initValues      = {} ,
    inputChanged    = false,
    pageValue       = {};
function pageInit(){
    var messageIdParam = new Array(ALERT_LEAVE_PAGE,ALERT_ASSET_REQUIRED),
        bgpMsg;
    alertMessage = FAM_Util.fetchMessageList(messageIdParam);

    initValues['custpage_filtermsassettype']= nlapiGetFieldValue('custpage_filtermsassettype');
    initValues['custpage_filtermssubsid']   = nlapiGetFieldValue('custpage_filtermssubsid');
    initValues['custpage_filtercbincchild'] = nlapiGetFieldValue('custpage_filtercbincchild');
    pageValue['custpage_proppage']          = nlapiGetFieldValue('custpage_proppage');
    pageValue['custpage_rowperpage']        = nlapiGetFieldValue('custpage_rowperpage');

    bgpMsg = nlapiGetFieldValue('custpage_bgpmsg');
    if(bgpMsg){
        alert(bgpMsg);
    }
}

/**
 *
 * @returns {Boolean}
 */
function saveRecord(){
    //Check mandatory field
    if(nlapiGetFieldValue('custpage_filtermssubsid')){
        nlapiSetFieldValue('custpage_proppage',1,false);
    }

    return true;
}

/**
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @return {void}
 */
function clientFieldChanged(type, name, linenum){

    switch(name) {
        case 'custpage_filtermsassettype':
        case 'custpage_filtermssubsid':
        case 'custpage_filtercbincchild':
            inputChanged = checkFieldChanged();
            break;

        case 'custpage_proppage' :
        case 'custpage_rowperpage' :

            var changePage = true;
            if(proposalSelected()) {
                changePage = confirm(alertMessage[ALERT_LEAVE_PAGE]);
                if(!changePage){
                    //Restore initial value
                    nlapiSetFieldValue(name,pageValue[name],false);
                }
            }

            if(changePage) {
                setWindowChanged(window, false);

                var fieldId = ['custpage_proppage','custpage_rowperpage','custpage_filtermsassettype',
                               'custpage_filtermssubsid','custpage_filtercbincchild'],
                    urlTags = [];

                //Gather all screen inputs
                for(var ctr=0,fValue; ctr<fieldId.length; ctr++) {
                    if(fieldId[ctr] == 'custpage_proppage' && (inputChanged || name == 'custpage_rowperpage')) {
                        //Reset page select if rowperpage/search filters field was changed
                        fValue = '1';
                    }
                    else {
                        fValue = nlapiGetFieldValue(fieldId[ctr]);
                    }


                    if(fValue) {
                        urlTags.push(fieldId[ctr] + '=' + fValue);
                    }
                }
                //Refresh page with paging parameters attached
                var redirectUrl = nlapiResolveURL('suitelet', 'customscript_fam_assetproposal_su',
                        'customdeploy_fam_assetproposal_su'),
                    urlParam = urlTags.join('&');
                if(urlParam.length) {
                    redirectUrl += '&' + urlParam;
                }
                window.open(redirectUrl,'_self');
            }

            break;
    }
}

/**
 * Check if any of the field search parameters was changed
 * @returns true: one of the fields where changed false: none were changed
 */
function checkFieldChanged(){
    var retVal = false;
    for(fName in initValues) {
        if(initValues[fName] !== nlapiGetFieldValue(fName)) {
            retVal = true;
            break;
        }
    }
    return retVal;
}

/**
 * Check if any of the propsal list is selected
 * @returns true: atleast one proposal sublist is selected false: none are selected
 */
function proposalSelected(){
    var lineTotal = nlapiGetLineItemCount('proposals'),
        retVal    = false;
    for(var ctr=1; ctr<=lineTotal; ctr++) {
        if(nlapiGetLineItemValue('proposals','marked',ctr) == 'T') {
            retVal = true;
            break;
        }
    }
    return retVal;
}

function proposal_customizeSublist() {
    var redirectUrl = nlapiResolveURL('suitelet', 'customscript_fam_assetproposalcustmze_su', 'customdeploy_fam_assetproposalcustmze_su');
    window.open(redirectUrl, '_self');
}

function proposal_getCondition(actionId){	
	main_form.custpage_ncactionid.value = actionId;
	if (proposalSelected()) {
		if(main_form.onsubmit()){
			main_form.submit();
		}
	}else {
		alert(alertMessage[ALERT_ASSET_REQUIRED]);
	}
    
}