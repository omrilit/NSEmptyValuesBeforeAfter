/**
 * � 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var FAM;
if (!FAM) { FAM = {}; }

FAM.AssetTransfer_CS = new function () {
    this.alertMessage = {};
    this.isAssetCompound = false;
    this.compoundDescendants = {};
    
    /**
     * pageInit event type of client scripts
    **/
    this.pageInit = function (type) {
        this.alertMessage = FAM.Util_CS.fetchMessageObj({
            ALERT_SUBSIDIARYBOOKID : 'client_assettransfer_subsidiarybookid',
            ALERT_SUBSIDIARYMETHOD : 'client_assettransfer_subsidiarymethod',
            ALERT_EMPTYSUBATFIELD : 'client_assettransfer_emptysubat',
            ALERT_NOCHANGE : 'client_assettransfer_nochange',
            ALERT_NOTRANSFERACCT : 'client_assettransfer_notransferacct',
            ALERT_SUBDEPT : 'client_assettransfer_subdept_notmatch',
            ALERT_SUBLOC : 'client_assettransfer_subloc_notmatch',
            ALERT_SUBCLASS : 'client_assettransfer_subclass_notmatch',
            ALERT_AT_ASSETACCT : 'client_assettransfer_atassetacct',
            ALERT_ASSETACCT_INACTIVE : 'client_assettransfer_atassetacct_inactive',
            ALERT_AT_DEPRACCT : 'client_assettransfer_atdepracct',
            ALERT_DEPRACCT_INACTIVE : 'client_assettransfer_atdepracct_inactive',
            ALERT_AT_CDL_MAND : 'client_assettransfer_cdl_mandatory',
            ALERT_COMPONENTSELECTED : 'client_assettransfer_componentselected',
            ALERT_TRNDATENOTONORAFTERLASTDEPRDATE : 'client_assettransfer_trandatenotonorafterlastdeprdate',
            ALERT_SETUPMISS : 'custpage_setupmissing',
            ALERT_SETTINGMISS : 'custpage_settingmissing',
            ALERT_DATEERROR : 'custpage_assettransfer_futuredateerror'
        });
        
        if (!nlapiGetFieldValue('custpage_assetid')) {
            this.disableFields(true);
        };
        
        var componentOf = nlapiGetFieldValue('custpage_componentof');
        if (componentOf) {
            this.disableFields(false, true);
            alert(this.alertMessage.ALERT_COMPONENTSELECTED);
        }

        // TODO Should check if an active Bulk Asset Transfer FPR exists
    };

    /**
     * saveRecord event type of client scripts
    **/
    this.saveRecord = function () {
        var assetId = nlapiGetFieldValue('custpage_assetid'),
            excludeCompound = true, obj = {}, oldVal = {}, newVal = {};
        
        transferDate = nlapiGetFieldValue('custpage_transferdate'),
        newVal.type = nlapiGetFieldValue('custpage_newassettype'),
        newVal.dept = nlapiGetFieldValue('custpage_newdepartment'),
        newVal.cls = nlapiGetFieldValue('custpage_newclass'),
        newVal.loc = nlapiGetFieldValue('custpage_newlocation'),
        newVal.sub = nlapiGetFieldValue('custpage_newsubsidiary');
        oldVal.type = nlapiGetFieldValue('custpage_assettype');
        oldVal.dept = nlapiGetFieldValue('custpage_assetdepartment'),
        oldVal.cls = nlapiGetFieldValue('custpage_assetclass'),
        oldVal.loc = nlapiGetFieldValue('custpage_assetlocation'),
        oldVal.sub = nlapiGetFieldValue('custpage_assetsubsidiary');
        
        if (!this.isDateAllowed(transferDate)) {
            alert(this.alertMessage.ALERT_DATEERROR);
            return false;
        }
        
        //Asset Type must not be null
        if (!newVal.type) {
            alert(this.alertMessage.ALERT_EMPTYSUBATFIELD);
            return false;
        }
        
        // Check if all values are the same as the original
        if (!this.changedField('custpage_newsubsidiary') &&
            !this.changedField('custpage_newassettype') &&
            !this.changedField('custpage_newclass') &&
            !this.changedField('custpage_newdepartment') &&
            !this.changedField('custpage_newlocation')) {
            
            alert(this.alertMessage.ALERT_NOCHANGE);
            return false;
        }        

        /**
         * TODO
         * Check if Asset Transfer FPR for this asset already exists
         * Check if Bulk Asset Transfer FPR for this asset already exists
         */
        
        // Check Asset Type Asset Account and Depreciation Account
        if (oldVal.type !== newVal.type) {
            var assetTypeAccounts = nlapiLookupField('customrecord_ncfar_assettype', newVal.type,
                ['custrecord_assettypeassetacc', 'custrecord_assettypedepracc',
                 'custrecord_assettypeassetacc.isinactive', 'custrecord_assettypedepracc.isinactive']);
            
            if (!assetTypeAccounts.custrecord_assettypeassetacc) {
                alert(this.alertMessage.ALERT_AT_ASSETACCT);
                return false;
            }
            
            if (assetTypeAccounts['custrecord_assettypeassetacc.isinactive'] === 'T') {
                alert(this.alertMessage.ALERT_ASSETACCT_INACTIVE);
                return false;
            }
            
            if (!assetTypeAccounts.custrecord_assettypedepracc) {
                alert(this.alertMessage.ALERT_AT_DEPRACCT);
                return false;
            }
            
            if (assetTypeAccounts['custrecord_assettypedepracc.isinactive'] === 'T') {
                alert(this.alertMessage.ALERT_DEPRACCT_INACTIVE);
                return false;
            }
        }
        
        if (!this.validateFields(assetId, oldVal, newVal, this.isAssetCompound)) {
            return false;
        }
        
        // Check compound assets
        if (this.isAssetCompound) {
            if (!this.validateComponents(oldVal, newVal)) {
                return false;
            }
        }
        
        return true;
    };
    
    this.validateComponents = function (oldVal, newVal) {
        var cmpVal = {}, name = '';
        for (key in this.compoundDescendants) {
            var cmpKey = this.compoundDescendants[key];
            // Only validate components
            if (cmpKey['custrecord_is_compound'] !== 'T') {
                cmpVal.type = cmpKey['custrecord_assettype'];
                cmpVal.dept = cmpKey['custrecord_assetdepartment'];
                cmpVal.cls = cmpKey['custrecord_assetclass'];
                cmpVal.loc = cmpKey['custrecord_assetlocation'];
                cmpVal.sub = cmpKey['custrecord_assetsubsidiary'];
                cmpVal.name = cmpKey['name'] +' '+ cmpKey['altname'];
                
                if (!this.validateFields(key, oldVal, newVal, !this.isAssetCompound, cmpVal)) {
                    return false;
                }
            }
        }
        return true;
    };
    
    this.addComponentName = function (cmpName, msg) {
        return cmpName ? cmpName +': '+ msg : msg;
    };
    
    this.validateFields = function (assetId, oldVal, newVal, checkCompound, cmpVal) {
        var bookIds,
            cmpName = cmpVal ? cmpVal.name : '';
            isDeptMandatory = FAM.Context.getPreference('deptmandatory') === 'T',
            isClassMandatory = FAM.Context.getPreference('classmandatory') === 'T',
            isLocMandatory = FAM.Context.getPreference('locmandatory') === 'T';
        
        if (FAM.Context.blnOneWorld) {
            //Subsidiary must not be null
            if (!newVal.sub) {
                alert(this.addComponentName(cmpName, this.alertMessage.ALERT_EMPTYSUBATFIELD));
                return false;
            }
            
            //Check C/D/L + Subsidiary Combination Validation
            //if component asset
            if (cmpVal) {
                if ((!cmpVal.dept && isDeptMandatory)||
                    (!cmpVal.cls && isClassMandatory)||
                    (!cmpVal.loc && isLocMandatory)){
                    
                    alert(this.addComponentName(cmpName, this.alertMessage.ALERT_AT_CDL_MAND));
                    return false;
                }
                
                var sub = (oldVal.sub !== newVal.sub) ? newVal.sub : cmpVal.sub,
                    dept = (newVal.dept && oldVal.dept !== newVal.dept) ? newVal.dept : cmpVal.dept,
                    cls = (newVal.cls && oldVal.cls !== newVal.cls) ? newVal.cls : cmpVal.cls,
                    loc = (newVal.loc && oldVal.loc !== newVal.loc) ? newVal.loc : cmpVal.loc;

                if (dept && !FAM.compareCDLSubsidiary('department', dept, sub)) {
                    alert(this.addComponentName(cmpName, this.alertMessage.ALERT_SUBDEPT));
                    return false;
                }
                
                if (cls && !FAM.compareCDLSubsidiary('classification', cls, sub)) {
                    alert(this.addComponentName(cmpName, this.alertMessage.ALERT_SUBCLASS));
                    return false;
                }
                
                if (loc && !FAM.compareCDLSubsidiary('location', loc, sub)) {
                    alert(this.addComponentName(cmpName, this.alertMessage.ALERT_SUBLOC));
                    return false;
                }
            }
            else {
                //if compound asset
                if (checkCompound) {
                    if ((oldVal.dept !== newVal.dept) && !newVal.dept && isDeptMandatory) {
                        alert(this.alertMessage.ALERT_AT_CDL_MAND);
                        return false;
                    }
                    
                    if ((oldVal.cls !== newVal.cls) && !newVal.cls && isClassMandatory) {
                        alert(this.alertMessage.ALERT_AT_CDL_MAND);
                        return false;
                    }
                    
                    if ((oldVal.loc !== newVal.loc) && !newVal.loc && isLocMandatory) {
                        alert(this.alertMessage.ALERT_AT_CDL_MAND);
                        return false;
                    }
                }
                //if simple asset
                else {
                    if ((!newVal.dept && isDeptMandatory)||
                       (!newVal.cls && isClassMandatory)||
                       (!newVal.loc && isLocMandatory)){
                        alert(this.alertMessage.ALERT_AT_CDL_MAND);
                        return false;
                    }
                }
                
                if ((oldVal.sub !== newVal.sub || newVal.dept !== oldVal.dept) && newVal.dept &&
                    !FAM.compareCDLSubsidiary('department', newVal.dept, newVal.sub)) {
                    
                    alert(this.alertMessage.ALERT_SUBDEPT);
                    return false;
                }
                
                if ((oldVal.sub !== newVal.sub || newVal.cls !== oldVal.cls) && newVal.cls &&
                    !FAM.compareCDLSubsidiary('classification', newVal.cls, newVal.sub)) {
                      
                    alert(this.alertMessage.ALERT_SUBCLASS);
                    return false;
                }
                
                if ((oldVal.sub !== newVal.sub || newVal.loc !== oldVal.loc) && newVal.loc &&
                    !FAM.compareCDLSubsidiary('location', newVal.loc, newVal.sub)) {
                       
                    alert(this.alertMessage.ALERT_SUBLOC);
                    return false;
                }
            }
            
            if (oldVal.sub !== newVal.sub) {
                //Check if Transfer Account exists
                if (!FAM.Util_Shared.getTransferAccounts(oldVal.sub, newVal.sub)) {
                    alert(this.alertMessage.ALERT_NOTRANSFERACCT);
                    return false;
                }
                
                //Check Subsidiary + Accounting Books combination
                bookIds = FAM.Util_Shared.getTaxMethodBookIds(assetId);
                if (!FAM.Util_Shared.isValidSubsidiaryBooks(newVal.sub, bookIds)) {
                    alert(this.addComponentName(cmpName, this.alertMessage.ALERT_SUBSIDIARYBOOKID));
                    return false;
                }
                
                //Check Subsidiary + Alternate Methods combination
                if (!FAM.Util_Shared.compatibleSubAndMethods(assetId, newVal.sub)) {
                    alert(this.addComponentName(cmpName, this.alertMessage.ALERT_SUBSIDIARYMETHOD));
                    return false;
                }
            }
        }
        return true;
    };
    
    /**
     * fieldChanged event type of client scripts
    **/
    this.fieldChanged = function (type, value) {
        var fld, disableSCDL, disableAT, dispField, progress, fldCount, pBreakdown, assetId, assetRec, slaveField, slaveRec;
        
        if (value == 'custpage_assetid') {
			assetId = nlapiGetFieldValue('custpage_assetid');
            setWindowChanged(window, false);
            var assetTransferSuUrl = [nlapiResolveURL(
                    'SUITELET',
                    'customscript_fam_assettransfer_su',
                    'customdeploy_fam_assettransfer_su',
                    null,
                    'GET'),
                    '&custpage_p_assetid=' + assetId].join('');
            window.location.href = assetTransferSuUrl;
            
        }
        else if (value == 'custpage_newsubsidiary' ||
                 value == 'custpage_newclass' ||
                 value == 'custpage_newdepartment' ||
                 value == 'custpage_newslocation') {
                   
            disableAT = this.changedField('custpage_newsubsidiary') ||
                        this.changedField('custpage_newclass') ||
                        this.changedField('custpage_newdepartment') ||
                        this.changedField('custpage_newlocation');
            
            nlapiDisableField('custpage_newassettype', disableAT);
        }
        else if (value == 'custpage_newassettype') {
            disableSCDL = this.changedField('custpage_newassettype');
            this.disableSCDLFields(disableSCDL);
        }
    };

    this.validateField = function(type, name, lineNum) {
        if (name === 'custpage_transferdate') {
            var transDate = nlapiGetFieldValue(name);
            var lastDeprDate = nlapiGetFieldValue('custpage_assetlastdepr');
            
            if (transDate &&
                (nlapiStringToDate(lastDeprDate) > nlapiStringToDate(transDate))) {
                alert(this.alertMessage.ALERT_TRNDATENOTONORAFTERLASTDEPRDATE);
                return false;
            }
        }
        
        return true;
    };
    
    this.disableFields = function (disable, isComponent) {
        if(isComponent){
            nlapiDisableField('custpage_newassettype', true);
            nlapiDisableField('custpage_newsubsidiary', true);
        }else{
            nlapiDisableField('custpage_newassettype', disable);
            nlapiDisableField('custpage_newsubsidiary', disable);
        }
        
        nlapiDisableField('custpage_newclass', disable);
        nlapiDisableField('custpage_newdepartment', disable);
        nlapiDisableField('custpage_newlocation', disable);
    };

    this.disableSCDLFields = function (disable) {
        nlapiDisableField('custpage_newsubsidiary', disable);
        nlapiDisableField('custpage_newclass', disable);
        nlapiDisableField('custpage_newdepartment', disable);
        nlapiDisableField('custpage_newlocation', disable);
    };
    
    /**
     * If SCDL are all empty, enable the Asset Type dropdown field.
     * Otherwise, disable the Asset Type dropdown.
     *
     * Parameters:
     *     none
     * Returns:
     *     null
    **/
    this.toggleAssetTypeField = function () {
        var newSubsidiary = nlapiGetFieldValue('custpage_newsubsidiary'),
            newClass = nlapiGetFieldValue('custpage_newclass'),
            newDepartment = nlapiGetFieldValue('custpage_newdepartment'),
            newLocation = nlapiGetFieldValue('custpage_newlocation'),
            disableFlag = newSubsidiary || newClass || newDepartment || newLocation ? true : false;
            
        nlapiDisableField('custpage_newassettype', disableFlag);
    };
    
    this.changedField = function (fld) {
        var fieldMap = {'custpage_newassettype'     : 'custpage_assettype',
                        'custpage_newsubsidiary'    : 'custpage_assetsubsidiary',
                        'custpage_newclass'         : 'custpage_assetclass',
                        'custpage_newdepartment'    : 'custpage_assetdepartment',
                        'custpage_newlocation'      : 'custpage_assetlocation'};
        return nlapiGetFieldValue(fld) != nlapiGetFieldValue(fieldMap[fld]);
    };
    
    this.isDateAllowed = function (inputDate) {
        var allowFuture, testDate, blnDateAllowed = true;

        try {
            allowFuture = FAM.SystemSetup.getSetting('isAllowFutureDepreciate');
            if (allowFuture === 'F') {
                // get last day of current month
                // 1 day = 24 hours x 60 mins x 60 secs x 1000 millisecs = 86400000 millisecs
                testDate = new Date();
                testDate.setDate(1);
                testDate = nlapiAddMonths(testDate, 1);
                testDate.setTime(testDate.getTime() - 86400000);
                inputDate = typeof inputDate === 'string' ?
                    nlapiStringToDate(inputDate) : inputDate;
                if (inputDate > testDate) {
                    blnDateAllowed = false;
                }
            } else if (allowFuture === null) {
                alert(this.alertMessage.ALERT_SETUPMISS);
                blnDateAllowed = false;
            }
        } catch (ex) {
            alert(this.alertMessage.ALERT_SETTINGMISS);
            blnDateAllowed = false;
        }
        return blnDateAllowed;
    };
};