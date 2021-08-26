/**
 * Copyright © 2016, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 */

var alertMessage = {};
var ALERT_RECORD_BEING_POOLED = 'client_assetrecord_recordbeingpooled';
var ALERT_ASSET_NOT_ALLOWED = 'client_assetrecord_assetnotallowed';
var ALERT_DEPR_NOT_ALLOWED = 'client_assetrecord_deprnotallowed';
var ALERT_SPECIFY_DEPRECIATION_RULES = 'client_assetrecord_specifydepreciationrules';
var ALERT_SPECIFY_SUBSIDIARY = 'client_assetrecord_specifysubsidiary';
var ALERT_NOT_NEGATIVE = 'client_assetrecord_notnegative';
var ALERT_GREATER_ERROR = 'client_assetrecord_greatererror';
var ALERT_DATE_ERROR = 'client_assetrecord_dateerror';
var ALERT_FIELD_ADJUST = 'client_assetrecord_fieldadjust';
var ALERT_ENDDATE_ADJUST = 'client_assetrecord_enddateadjust';
var ALERT_CONFIRM_SUBSIDIARY_CHANGE = 'client_assetrecord_confirmsubsidiarychange';
var ALERT_CONFIRM_PRECOMP_EDIT = 'client_assetrecord_confirmprecompedit';

var SUB_ID = '';

function AssetRecordPageInit(type){
    FAM.Asset_CS.type = type;
    
    var messageIdParam = [ALERT_RECORD_BEING_POOLED,
                          ALERT_ASSET_NOT_ALLOWED,
                          ALERT_DEPR_NOT_ALLOWED,
                          ALERT_SPECIFY_DEPRECIATION_RULES,
                          ALERT_SPECIFY_SUBSIDIARY,
                          ALERT_NOT_NEGATIVE,
                          ALERT_GREATER_ERROR,
                          ALERT_DATE_ERROR,
                          ALERT_FIELD_ADJUST,
                          ALERT_ENDDATE_ADJUST,
                          ALERT_CONFIRM_SUBSIDIARY_CHANGE,
                          ALERT_CONFIRM_PRECOMP_EDIT];
    alertMessage = FAM_Util.fetchMessageList(messageIdParam);

    var selectedRoles = FAM.SystemSetup.getSetting('selectedUserRoles');
    var bRoleAllowed = (selectedRoles.indexOf(FAM.Context.userRole) !== -1) || FAM.Context.blnAdmin;
    
    SUB_ID = nlapiGetFieldValue('custrecord_assetsubsidiary');
    if (type === 'copy') {
       
        //set up new asset copy
        initAssetCopy();
    }
    else if (type === 'edit' && (FAM.SystemSetup.getSetting('isAllowValueEdit') === 'T' && bRoleAllowed)){
        var id = nlapiGetFieldValue('custrecord_assetvals');
        if (id){
            var slaveValues = nlapiLookupField('customrecord_fam_assetvalues', id, ['custrecord_slavebookvalue',
                                                                                    'custrecord_slavepriornbv',
                                                                                    'custrecord_slavelastdepramt',
                                                                                    'custrecord_slavelastdeprdate',
                                                                                    'custrecord_slavecurrentage'], false);
            var currentCost = nlapiGetFieldValue('custrecord_assetcurrentcost'),
                cd =  (currentCost || 0) - (slaveValues['custrecord_slavebookvalue'] || 0);
            var currency = FAM.Util_Shared.getApplicableCurrency(SUB_ID),
                prcn = FAM.Util_Shared.getPrecision(currency);
            
            nlapiSetFieldValue('custrecord_assetbookvalue', slaveValues['custrecord_slavebookvalue']);
            nlapiSetFieldValue('custrecord_assetpriornbv',slaveValues['custrecord_slavepriornbv']);
            nlapiSetFieldValue('custrecord_assetlastdepramt',slaveValues['custrecord_slavelastdepramt']);
            nlapiSetFieldValue('custrecord_assetlastdeprdate',slaveValues['custrecord_slavelastdeprdate']);
            nlapiSetFieldValue('custrecord_assetcurrentage',slaveValues['custrecord_slavecurrentage']);
            nlapiSetFieldValue('custrecord_assetdeprtodate', nlapiFormatCurrency(FAM.Util_Shared.Math.roundByPrecision(cd, prcn)));
            
            // To negate the effect of the clump of setFieldValue above
            FAM.Asset_CS.isEditedForPrecompute = false;
        }
    }
    
    try {
        //allow editing is not limited to admins
        if((FAM.SystemSetup.getSetting('isAllowValueEdit') === 'T') && bRoleAllowed){
            var status = nlapiGetFieldValue('custrecord_assetstatus');
            if (ASSET_STATUS_NEW !== status){
                nlapiDisableField('custrecord_assetdeprperiod', true);
            }
            // Setup give full user rights on changing field values
            return;
        }

        nlapiDisableField('custrecord_assetbookvalue', true);
        nlapiDisableField('custrecord_assetdeprtodate', true);
        nlapiDisableField('custrecord_assetcurrentage', true);
        nlapiDisableField('custrecord_assetlastdepramt', true);
        nlapiDisableField('custrecord_assetlastdeprdate', true);
        nlapiDisableField('custrecord_assetstatus', true);
        nlapiDisableField('custrecord_assetdeprperiod', true);
        
        // Also disable the fake fields
        nlapiDisableField('custpage_assetlastdepramt', true);
        nlapiDisableField('custpage_assetlastdeprdate', true);
        nlapiDisableField('custpage_assetcurrentage', true);
        nlapiDisableField('custpage_assetbookvalue', true);
        nlapiDisableField('custpage_assetpriornbv', true);
        nlapiDisableField('custpage_assetdeprtodate', true);
        
        // if depreciation underway or disposed
        var cdValue = nlapiGetFieldValue(
            bRoleAllowed ? 'custrecord_assetdeprtodate' : 'custpage_assetdeprtodate') // Use the fake field if no permission.
        if (parseFloat(cdValue) > 0.00 ||
                nlapiGetFieldValue('custrecord_assetstatus') === ASSET_STATUS_DISPOSED) {
            // this is an active or historic asset so disable fields
            // which should not be changed through this screen
            // nlapiDisableField('custrecord_assettype',true); PJB,
            // 13/3/2008, Netsuite (internal use) NEED to change this
            nlapiDisableField('custrecord_assetaccmethod', true);
            nlapiDisableField('custrecord_assetresidualperc', true);
            nlapiDisableField('custrecord_assetresidualvalue', true);
            nlapiDisableField('custrecord_assetlifetime', true);
            nlapiDisableField('custrecord_assetlifeunits', true);
            nlapiDisableField('custrecord_assetcost', true);
            nlapiDisableField('custrecord_assetcurrentcost', true);
            nlapiDisableField('custrecord_assetpurchasedate', true);
            nlapiDisableField('custrecord_assetdeprstartdate', true);
            nlapiDisableField('custrecord_assetdeprenddate', true);
            nlapiDisableField('custrecord_assetdeprrules', true);
            nlapiDisableField('custrecord_ncfar_quantity', true);
            // the next two fields can still be set if currently empty,
            // but not changed once populated (on an active asset)
            if (nlapiGetFieldValue('custrecord_assetserialno').length > 0)
                nlapiDisableField('custrecord_assetserialno', true);
            if (nlapiGetFieldValue('custrecord_assetalternateno').length > 0)
                nlapiDisableField('custrecord_assetalternateno', true);
            
        }
        
    } catch (Ex) {
        // do nothing; if custrecord_assetdeprtodate cannot be read for
        // example (null on a new asset?) then no error,
        // just not a live asset so no need to disable any fields.
    }
}

function AssetValidateField(type,name,linenum)
{
    var recordId = nlapiGetRecordId() * 1;
    if (name == 'custrecord_assetsubsidiary' && SUB_ID != '' && SUB_ID != nlapiGetFieldValue('custrecord_assetsubsidiary') && recordId > 0) {
        //confirm change subsidiary
        if (!confirm(alertMessage[ALERT_CONFIRM_SUBSIDIARY_CHANGE]) && FAM.Context.blnOneWorld) {
            return false;
        }
        //Validation for Subsidiary
        var fltr = [
                    new nlobjSearchFilter('custrecord_altdeprasset', null, 'anyof', recordId),
                    new nlobjSearchFilter('custrecord_altdepr_groupdepreciation', null, 'is', 'T')
                    ];
        var res = nlapiSearchRecord('customrecord_ncfar_altdepreciation',null,fltr);
        if (res != null) {
            alert(alertMessage[ALERT_RECORD_BEING_POOLED]);
            return false;
        }
    }
    else if(name == 'custrecord_assetdeprstartdate' || name == 'custrecord_assetdeprenddate'){
        var sDate = nlapiGetFieldValue('custrecord_assetdeprstartdate'),
            eDate = nlapiGetFieldValue('custrecord_assetdeprenddate');
        if(sDate && eDate) {
            var startDate  = nlapiStringToDate(sDate),
                endDate    = nlapiStringToDate(eDate);
            if(startDate > endDate) {
                alert(alertMessage[ALERT_DATE_ERROR]);
                return false;
            }
        }
    } 
    
    return true;
}


function ValidateSaveRecord_Asset() {
    
    //validation for asset costs
    var origcost = parseFloat(nlapiGetFieldValue('custrecord_assetcost'));
    var currentcost = parseFloat(nlapiGetFieldValue('custrecord_assetcurrentcost'));
    var residualvalue = parseFloat(nlapiGetFieldValue('custrecord_assetresidualvalue'));
    var acField = nlapiGetField('custrecord_assetcost');
    var ccField = nlapiGetField('custrecord_assetcurrentcost');
    var rvField = nlapiGetField('custrecord_assetresidualvalue');
    var restrictNegative = true;
    if(origcost < 0 || currentcost < 0 || residualvalue < 0){
        var selectedRoles = FAM.SystemSetup.getSetting('selectedUserRoles');
        var bRoleAllowed = (selectedRoles.indexOf(FAM.Context.userRole) !== -1) || FAM.Context.blnAdmin;
        restrictNegative = !(FAM.SystemSetup.getSetting('isAllowNegativeCost') === 'T' && bRoleAllowed);
    }
    
    var errorMsg = null;
    if(origcost < 0 && restrictNegative){
        //Original cost cannot be zero
        errorMsg = FAM_Util.injectMessageParameter(alertMessage[ALERT_NOT_NEGATIVE],new Array(acField.getLabel()));
    } else if(currentcost < 0 && restrictNegative) {
        // Current cost cannot be negative
        errorMsg = FAM_Util.injectMessageParameter(alertMessage[ALERT_NOT_NEGATIVE], new Array(ccField.getLabel()));
    } else if(residualvalue < 0 && restrictNegative){
        //Residual value cost cannot be negative
        errorMsg = FAM_Util.injectMessageParameter(alertMessage[ALERT_NOT_NEGATIVE],new Array(rvField.getLabel()));
    } else if(Math.abs(residualvalue) > Math.abs(currentcost)) {
        //Residual value cannot be greater than current cost
        errorMsg = FAM_Util.injectMessageParameter(alertMessage[ALERT_GREATER_ERROR],new Array(rvField.getLabel(),ccField.getLabel()));
    } else if (Math.abs(residualvalue)> Math.abs(origcost)) {
        //Residual value cannot be greater than original cost
        errorMsg = FAM_Util.injectMessageParameter(alertMessage[ALERT_GREATER_ERROR],new Array(rvField.getLabel(),acField.getLabel()));
    } else {
        //Check asset depreciation rules may not be blank
        if( nlapiGetFieldValue('custrecord_assetdepractive') == '1' )
        {
            var deprRules = nlapiGetFieldValue('custrecord_assetdeprrules');
            if( (deprRules == null) || (deprRules == '') ) {
                errorMsg = alertMessage[ALERT_SPECIFY_DEPRECIATION_RULES];
            }
        }
    }

    //check if error exist
    if(errorMsg != null) {
        alert(errorMsg);
        return false;
    }
    
    //validation pass
    return true;
}


/* AssetOnChange - Event Script to for all field changes, used to recalculate or default dependent fields
 *
 * Asset Cost -> Net Book Value.  If Residual % defined, -> Residual Value
 * Residual % -> Residual Value.
 *
 * Parameters:
 *      fieldtype    - line item type (if a line field, otherwise null)
 *      fieldname    - name of the changed field
 */
function AssetOnChange(fieldtype,fieldname) {
    var ls_initialValue;
    var ls_residualPercent;
    var ls_residualValue;
    var l_residualValue;
    
    if (FAM.Asset_CS.type === 'edit') {
        FAM.Asset_CS.setEditedPrecomputeFlag(fieldname);
    }
    
    switch (fieldname)
    {
        case 'custrecord_assetcost':
            // retrieve field value
            ls_initialValue = parseFloat(nlapiGetFieldValue('custrecord_assetcost'));
            // set custrecord_assetbookvalue to field value
            nlapiSetFieldValue('custrecord_assetbookvalue',ls_initialValue);
            // residual value always overwrites the percentage
            ls_residualValue = parseFloat(nlapiGetFieldValue('custrecord_assetresidualvalue'));
            if(!isNaN(ls_residualValue)){ // zero is valid 
                AssetOnChange(fieldtype,'custrecord_assetresidualvalue');
            }
            else{
                AssetOnChange(fieldtype,'custrecord_assetresidualperc');
                // ^^ could just fall-through on the case, but clearer to recall the function
            }
            nlapiSetFieldValue('custrecord_assetpriornbv',ls_initialValue);
            break;
        case 'custrecord_assetresidualperc':
            // retrieve field value, convert to decimal
            ls_residualPercent = parseFloat(nlapiGetFieldValue('custrecord_assetresidualperc'));
            if(isNaN(ls_residualPercent)) {
                break;
            }
            // also retrieve 'custrecord_assetcost' and convert that
            ls_initialValue = parseFloat(nlapiGetFieldValue('custrecord_assetcost'));
            if(isNaN(ls_initialValue)) {
                break;
            }

            // calc: initialvalue * residualpercent and set (formatted string?) to custrecord_assetresidualvalue
            // check currency symbol and integer currencies
            var SubId = nlapiGetFieldValue('custrecord_assetsubsidiary');
            var CurrencyId = 1;
            if(SubId && FAM.Context.blnOneWorld){
                CurrencyId = nlapiLookupField('subsidiary',SubId,'currency', false);
            }
            var IntCurrSym = '';
            var CurrSym = '';
            if( FAM.Context.blnMultiCurrency && CurrencyId != '' )
            {
                var FARConfig = nlapiSearchRecord('customrecord_ncfar_systemsetup',null,null,new nlobjSearchColumn('custrecord_intcurrsymbols'));
                if( (FARConfig != null) && (FARConfig.length == 1) )
                    IntCurrSym = FARConfig[0].getValue('custrecord_intcurrsymbols');

                CurrSym = nlapiLookupField('currency',CurrencyId,'symbol');
            }
            //--

            l_residualValue = FAM_Util.roundByCurrency(ls_initialValue * ls_residualPercent / 100.00,CurrSym,IntCurrSym);
            ls_residualValue = l_residualValue.toString();
            if(!ValidateSaveRecord_Asset()){
            return;
            }
            nlapiSetFieldValue('custrecord_assetresidualvalue',ls_residualValue, false); // disable fire field changed to avoid infinite loop
            break;
        case 'custrecord_assetresidualvalue':
            // retrieve field value, convert to decimal
            l_residualValue = parseFloat(nlapiGetFieldValue('custrecord_assetresidualvalue'));
            if(isNaN(l_residualValue)) {
                break;
            }
            // also retrieve 'custrecord_assetcost' and convert that
            ls_initialValue = parseFloat(nlapiGetFieldValue('custrecord_assetcost'));
            if(isNaN(ls_initialValue)) {
                break;
            }
            
            // check currency symbol and integer currencies
            var SubId = nlapiGetFieldValue('custrecord_assetsubsidiary');
            var CurrencyId = 1;
            if(SubId && FAM.Context.blnOneWorld){
                CurrencyId = nlapiLookupField('subsidiary',SubId,'currency', false);
            }
            var IntCurrSym = '';
            var CurrSym = '';
            if(FAM.Context.blnMultiCurrency && CurrencyId != '' )
            {
                var FARConfig = nlapiSearchRecord('customrecord_ncfar_systemsetup',null,null,new nlobjSearchColumn('custrecord_intcurrsymbols'));
                if( (FARConfig != null) && (FARConfig.length == 1) )
                    IntCurrSym = FARConfig[0].getValue('custrecord_intcurrsymbols');
                CurrSym = nlapiLookupField('currency',CurrencyId,'symbol');
            }
            
            ls_residualPercent = FAM_Util.roundByCurrency((l_residualValue * 100.00)/ls_initialValue,CurrSym,IntCurrSym);
            if(l_residualValue == 0 && ls_initialValue == 0){
                ls_residualPercent = 0;
            }
            
            ls_residualPercent = ls_residualPercent.toString();
            
            if(!ValidateSaveRecord_Asset()){
            return;
            }
            nlapiSetFieldValue('custrecord_assetresidualperc',ls_residualPercent, false); // disable fire field changed to avoid infinite loop
            break;
        case 'custrecord_assetdeprenddate':
            var sDate = nlapiGetFieldValue('custrecord_assetdeprstartdate'),
                eDate = nlapiGetFieldValue('custrecord_assetdeprenddate'),
                msg = '', alField, edField;
            if(sDate && eDate) {
                var al = FAM_Util.computeAl(sDate, eDate),
                    currAl = nlapiGetFieldValue('custrecord_assetlifetime'),
                    period = nlapiGetFieldValue('custrecord_assetdeprperiod');
                nlapiSetFieldValue('custrecord_assetlifetime',al, false);
               //Change Asset Life time
                if(currAl && al != currAl) {
                    //alert adjustment if asset lifetime has current value
                    alField = nlapiGetField('custrecord_assetlifetime');
                    edField = nlapiGetField(fieldname);
                    msg += (FAM_Util.injectMessageParameter(alertMessage[ALERT_FIELD_ADJUST],
                            [alField.getLabel(), edField.getLabel()]));
                }
                
                //round down end date and alert if needed
                var currEndDate = nlapiStringToDate(eDate),
                endDate = FAM.Util_Shared.Date.computeEndDate(sDate, al, period);
                if(nlapiDateToString(currEndDate) != nlapiDateToString(endDate)) {
                    //Change End Date
                    nlapiSetFieldValue('custrecord_assetdeprenddate',nlapiDateToString(endDate),false);
                    //alert adjustment if end date was rounded down
                    edField = nlapiGetField('custrecord_assetdeprenddate'),
                    alField = nlapiGetField('custrecord_assetlifetime');
                    msg = msg+'\n'||'';
                    msg += (FAM_Util.injectMessageParameter(alertMessage[ALERT_ENDDATE_ADJUST],
                        [edField.getLabel(), alField.getLabel()]));
                }
                if(msg){
                    alert(msg);
                }
            }
            break;
        case 'custrecord_assetdeprstartdate':
        case 'custrecord_assetlifetime':
            var sDate = nlapiGetFieldValue('custrecord_assetdeprstartdate'),
                al    = nlapiGetFieldValue('custrecord_assetlifetime');
            
            if(sDate && FAM_Util.parseInt(al) >= 0) {
                var currEndDate = nlapiStringToDate(nlapiGetFieldValue('custrecord_assetdeprenddate')),
                    period = nlapiGetFieldValue('custrecord_assetdeprperiod'),
                    endDate = FAM.Util_Shared.Date.computeEndDate(sDate, al, period);
                if(currEndDate != endDate) {
                    //Change End Date
                    nlapiSetFieldValue('custrecord_assetdeprenddate',nlapiDateToString(endDate),false);
                    if(currEndDate) {
                        //alert adjustment if end date has value
                        var edField = nlapiGetField('custrecord_assetdeprenddate'),
                            changedField = nlapiGetField('custrecord_assetlifetime');
                        alert(FAM_Util.injectMessageParameter(alertMessage[ALERT_FIELD_ADJUST],
                            [edField.getLabel(), changedField.getLabel()]));
                    }
                }
            }
            
            break;
        case 'custrecord_assetstatus' :
            var status = nlapiGetFieldValue('custrecord_assetstatus');
            if (ASSET_STATUS_NEW !== status){
                nlapiDisableField('custrecord_assetdeprperiod', true);
            }
            else{
                nlapiDisableField('custrecord_assetdeprperiod');   
            }
            break;
        case 'custrecord_assetdeprperiod' :
            var sDate = nlapiGetFieldValue('custrecord_assetdeprstartdate'),
                al    = nlapiGetFieldValue('custrecord_assetlifetime');
            
            if(sDate && FAM_Util.parseInt(al) >= 0) {
                var currEndDate = nlapiStringToDate(nlapiGetFieldValue('custrecord_assetdeprenddate')),
                    period = nlapiGetFieldValue('custrecord_assetdeprperiod'),
                    endDate = FAM.Util_Shared.Date.computeEndDate(sDate, al, period);
                if(currEndDate != endDate) {
                    //Change End Date
                    nlapiSetFieldValue('custrecord_assetdeprenddate',nlapiDateToString(endDate),false);
                    if(currEndDate) {
                        //alert adjustment if end date has value
                        var edField = nlapiGetField('custrecord_assetdeprenddate'),
                            changedField = nlapiGetField('custrecord_assetlifetime');
                        alert(FAM_Util.injectMessageParameter(alertMessage[ALERT_FIELD_ADJUST],
                            [edField.getLabel(), changedField.getLabel()]));
                    }
                }
            }
            break;
        default:    // do nothing
            break;
    }
}

function initAssetCopy()
{
    
     nlapiSetFieldValue('custrecord_assetstatus', ASSET_STATUS_NEW);
      //source the value from the Asset Type's "Asset Type Depreciation Active" field
     var rAssetType = nlapiLoadRecord('customrecord_ncfar_assettype', nlapiGetFieldValue('custrecord_assettype'));
     var deprActive = rAssetType.getFieldValue('custrecord_assettypedepractive');
     nlapiSetFieldValue('custrecord_assetdepractive',parseInt(deprActive,10) );
     
     //clear Asset Sale/Disposal
     
     nlapiSetFieldValue('custrecord_assetdisposalitem','');
     nlapiSetFieldValue('custrecord_assetdisposaldate','');
     nlapiSetFieldValue('custrecord_assetdisposaltype','');
     nlapiSetFieldValue('custrecord_assetsalecustomer','');
     nlapiSetFieldValue('custrecord_assetsaleamount','');
     nlapiSetFieldValue('custrecord_assetsalesinvoice','');

    //Initialize quantity and quantity disposed
     //If Quantity = 0 (ie Disposed), set to default value of 1. Otherwise, copy the value from the original asset.
     var qtyCopied = nlapiGetFieldValue('custrecord_ncfar_quantity');
     if(qtyCopied == '0')
     {
        nlapiSetFieldValue('custrecord_ncfar_quantity', '1');
     }
     //Always set to blank (this is the default when creating New assets). 
     nlapiSetFieldValue('custrecord_ncfar_quantitydisposed', '');
     
}

var FAM;
if (!FAM) { FAM = {}; }
FAM.Asset_CS = new function () {
    this.type = '';
    this.isEditedForPrecompute = false;
    this.fieldsAffPrecompute = [ 'custrecord_assetparent',
                                 'custrecord_assetproject', 
                                 'custrecord_assetcost',
                                 'custrecord_assetcurrentcost',
                                 'custrecord_assetresidualperc',
                                 'custrecord_assetresidualvalue',
                                 'custrecord_assetaccmethod',
                                 'custrecord_assetdeprperiod',
                                 'custrecord_assetlifetime',
                                 'custrecord_assetlifeunits',
                                 'custrecord_assetbookvalue',
                                 'custrecord_assetdeprstartdate',
                                 'custrecord_assetdeprenddate',
                                 'custrecord_assetcurrentage',
                                 'custrecord_assetlastdepramt',
                                 'custrecord_assetdeprrules',
                                 'custrecord_assetdepracc',
                                 'custrecord_assetdeprchargeacc',
                                 'custrecord_assetfinancialyear',
                                 'custrecord_assetannualentry',
                                 'custrecord_assetrepairmaintsubcategory',
                                 ];
    
    this.setEditedPrecomputeFlag = function(field) {
        if (this.fieldsAffPrecompute.indexOf(field) >= 0) {
            this.isEditedForPrecompute = true;
        }
    };
    
    this.saveRecord = function() {
        var saveRecFuncRet = ValidateSaveRecord_Asset();
        
        if (saveRecFuncRet) {
            var precompConfirm = true;
            if ((FAM.SystemSetup.getSetting('precompute') === 'T') && this.isEditedForPrecompute) {
                precompConfirm = confirm(alertMessage[ALERT_CONFIRM_PRECOMP_EDIT]);
            }
            
            return precompConfirm;
        };
        
        return saveRecFuncRet;
    }
};