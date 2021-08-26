/**
 * � 2015 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/

var FAM;
if (!FAM) { FAM = {}; }

FAM.CompoundAsset_CS = new function () {
    this.compCache;
    this.screenName = "";
    this.messages = {
            DUPLICATE_COMP      : 'client_duplicate_component',
            NO_COMPONENT        : 'client_no_component',
            ASSET_STATUS        : 'client_comp_status',
            FIELD_MISMATCH      : 'client_comp_field_mismatch',
            COMPONENT_OF        : 'client_component_of',
            CONFIRM_RESET_ALL   : 'client_confirm_reset_button',
            CONFIRM_RESET_COMP  : 'client_confirm_reset_comp'
    };
    
    this.sublistVal = [];
    this.originalCost = 0;
    this.currentCost = 0;
    
    this.mainlineFields = ['custpage_assetname',
                           'custpage_assettype',
                           'custpage_acctg_method',
                           'custpage_assetsub',
                           'custpage_asset_cost',
                           'custpage_current_cost'
                           ];
    
    this.pageInit = function () {
        this.screenName = "compoundasset";
        this.compCache = new FAM.FieldCache();
        this.messages = FAM.Util_CS.fetchMessageObj(this.messages, this.screenName);
    };
    
    this.saveRecord = function() {
        var alertMsg = '', retVal = true;
        
        // check no added components
        if (nlapiGetLineItemCount('custpage_components') === 0) {
            alertMsg = this.messages.NO_COMPONENT;
            retVal = false;
        }
            
        if (!retVal) {
            alert(alertMsg);
        }
        return retVal;
    };
    
    this.fieldChanged = function (type, name, lineNum) {
        if (type === "custpage_components" &&
                name === "custpage_components_id_name") {
            var assetId = nlapiGetCurrentLineItemValue(
                "custpage_components", "custpage_components_id_name");

            // Reset line item field values
            if (!assetId){
                nlapiSetCurrentLineItemValue("custpage_components",
                    "custpage_components_al", "", false);
                nlapiSetCurrentLineItemValue("custpage_components",
                    "custpage_components_orig_cost", "", false);
                nlapiSetCurrentLineItemValue("custpage_components",
                    "custpage_components_curr_cost", "", false);
                nlapiSetCurrentLineItemValue("custpage_components",
                    "custpage_components_qty", "", false);
                nlapiSetCurrentLineItemValue("custpage_components",
                    "custpage_components_status", "", false);
                return;
            }
            
            var assetFields = this.getCacheDetails(assetId);
            nlapiSetCurrentLineItemValue("custpage_components",
                "custpage_components_al", assetFields.custrecord_assetlifetime, false);
            nlapiSetCurrentLineItemValue("custpage_components",
                "custpage_components_orig_cost", assetFields.custrecord_assetcost, false);
            nlapiSetCurrentLineItemValue("custpage_components",
                "custpage_components_curr_cost", assetFields.custrecord_assetcurrentcost, false);
            nlapiSetCurrentLineItemValue("custpage_components",
                "custpage_components_qty", assetFields.custrecord_ncfar_quantity, false);
            nlapiSetCurrentLineItemValue("custpage_components",
                "custpage_components_status", assetFields.custrecord_assetstatus, false);
        }
    };
    
    this.validateField = function(type, name) {
        if((name=='custpage_assettype' || 
            name=='custpage_acctg_method' || 
            name=='custpage_assetsub') &&
            nlapiGetLineItemCount('custpage_components')>0){
            
            if(confirm(this.messages.CONFIRM_RESET_COMP)){
                this.removeAllComponents();
            }else{
                return false;
            }
        }
        return true;
    };
    
    this.validateLineItem = function(type) {
        if (type === "custpage_components") {
            var currIndex = nlapiGetCurrentLineItemIndex("custpage_components"),
                assetId = nlapiGetCurrentLineItemValue("custpage_components", "custpage_components_id_name"),
                ret;
            
            // Prevent missing argument error when user adds an empty line item
            if (!assetId){
                return false;
            }
            
            var assetFields = this.getCacheDetails(assetId);
            
            // check component_of field 
            if (assetFields.custrecord_componentof){
                alert(this.messages.COMPONENT_OF);
                return false;
            }
            // check asset status
            ret = +assetFields.custrecord_assetstatus;
            if (ret !== FAM.AssetStatus['New'] &&
                ret !== FAM.AssetStatus['Depreciating'] &&
                ret !== FAM.AssetStatus['Part Disposed']
                ) {
                  alert(this.messages.ASSET_STATUS);
                  return false;
            }
            // check for duplicates
            if (this.hasDuplicate(assetId, currIndex)) {               
                alert(this.messages.DUPLICATE_COMP);
                return false;
            }
            // check for mismatch
            ret = this.findMismatch(assetFields);
            if (ret.length > 0) {    
                var errMsg = FAM.Util_Shared.String.injectMessageParameter(
                        this.messages.FIELD_MISMATCH, [ret.join(',')]);
                alert(errMsg);
                return false;
            }
            
            // Compute Asset Cost and Current Cost
            if (!this.hasDuplicate(assetId)){
                // Subtract previous line item value
                // Do not subtract moved items due to insertion
                if (typeof(this.sublistVal[currIndex-1]) !== 'undefined'){ 
                    var prevAsset = this.getCacheDetails(this.sublistVal[currIndex-1]);
                    this.originalCost -= Number(prevAsset.custrecord_assetcost);
                    this.currentCost  -= Number(prevAsset.custrecord_assetcurrentcost);
                }

                this.originalCost += Number(assetFields.custrecord_assetcost);
                this.currentCost  += Number(assetFields.custrecord_assetcurrentcost);
                nlapiSetFieldValue('custpage_asset_cost', this.originalCost);
                nlapiSetFieldValue('custpage_current_cost', this.currentCost);

                this.sublistVal[currIndex-1] = assetId;
            }
            
            return true;
        }
    };
    
    this.validateDeleteItem = function(type) {
        if (type === "custpage_components") {
            var currIndex = nlapiGetCurrentLineItemIndex("custpage_components"),
                assetId = nlapiGetCurrentLineItemValue("custpage_components", "custpage_components_id_name");
            
            // Make sure user did not cancel insertion of line item
            if (typeof(this.sublistVal[currIndex-1]) !== 'undefined'){
                var assetFields = this.getCacheDetails(assetId);
                this.originalCost -= Number(assetFields.custrecord_assetcost);
                this.currentCost  -= Number(assetFields.custrecord_assetcurrentcost);
                nlapiSetFieldValue('custpage_asset_cost', this.originalCost);
                nlapiSetFieldValue('custpage_current_cost', this.currentCost);
            }

            this.sublistVal.splice(currIndex-1, 1);
            return true;
        }        
    };
    
    this.validateInsertItem = function(type){
        if (type === "custpage_components") {
            var currIndex = nlapiGetCurrentLineItemIndex("custpage_components");
            this.sublistVal.splice(currIndex-1, 0, undefined);
            return true;
        }
    };
    
    this.getCacheDetails = function(assetId) {
        return this.compCache.funcValCache("nlapiLookupField",
                "customrecord_ncfar_asset", assetId,
                   ["custrecord_assetlifetime",
                    "custrecord_assetcost",
                    "custrecord_assetcurrentcost",
                    "custrecord_ncfar_quantity",
                    "custrecord_assetstatus",
                    "custrecord_assetsubsidiary",
                    "custrecord_assettype",
                    "custrecord_assetaccmethod",
                    "custrecord_componentof"]);
    };
    
    this.hasDuplicate = function(assetName, currIndex){
        var hasDuplicate = false, errMsg = '', foundIndex = 
            nlapiFindLineItemValue("custpage_components", "custpage_components_id_name", assetName);

        if(foundIndex !== -1 && foundIndex != currIndex){
            hasDuplicate =  true;
        }
        
        return hasDuplicate;
    };
    
    this.findMismatch = function(assetFields){
        var arrMismatchFlds = [],
            pgSubsidiary = nlapiGetFieldValue('custpage_assetsub'),
            pgAssetType =  nlapiGetFieldValue('custpage_assettype'),
            pgAcctMethod = nlapiGetFieldValue('custpage_acctg_method');
        
        // check subsidiary
        if (nlapiGetContext().getFeature('SUBSIDIARIES') &&
            assetFields.custrecord_assetsubsidiary !== pgSubsidiary) {

            var pgSubLabel = nlapiGetField('custpage_assetsub').getLabel();
            arrMismatchFlds.push(pgSubLabel);
        }            
        // check asset type
        if (assetFields.custrecord_assettype !== pgAssetType) {
            var pgAstTypeLabel = nlapiGetField('custpage_assettype').getLabel();
            arrMismatchFlds.push(pgAstTypeLabel);
        }            
        // check accounting method
        if (assetFields.custrecord_assetaccmethod !== pgAcctMethod) {
            var pgAcctMethodLabel = nlapiGetField('custpage_acctg_method').getLabel();
            arrMismatchFlds.push(pgAcctMethodLabel);
        }
        
        return arrMismatchFlds;
    };

    this.resetFields = function(){
        if ((nlapiGetLineItemCount('custpage_components')>0 ||
            nlapiGetFieldValue('custpage_assetname') ||
            nlapiGetFieldValue('custpage_assettype') ||
            nlapiGetFieldValue('custpage_acctg_method') ||
            nlapiGetFieldValue('custpage_assetsub') ||
            nlapiGetFieldValue('custpage_asset_cost') ||
            nlapiGetFieldValue('custpage_current_cost')) &&
            confirm(this.messages.CONFIRM_RESET_ALL)){

            this.removeAllComponents();
            this.clearMainlineFields();
        }
             
        
    };
    
    this.removeAllComponents = function(){
        var itemCnt = nlapiGetLineItemCount('custpage_components');
        for(var i=1;i<=itemCnt;i++)
            nlapiRemoveLineItem('custpage_components',1);
    };
    
    this.clearMainlineFields = function(){
        for(var i = 0; i < this.mainlineFields.length; i++){
            nlapiSetFieldValue(this.mainlineFields[i], "", false);
        }
    };
};