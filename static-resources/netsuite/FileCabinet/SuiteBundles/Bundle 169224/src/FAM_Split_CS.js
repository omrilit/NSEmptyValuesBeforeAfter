/**
 * � 2015 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/

var FAM;
if (!FAM) { FAM = {}; }

FAM.Split_CS = new function () {
    this.messages = {
        ASSET_QTY_1                 : 'client_assetsplit_quantity1',
        INVALID_SPLIT_QTY             : 'client_assetsplit_invalidsplitquantity',
        GREATER_ERROR                : 'client_assetrecord_greatererror',        
        NBV_AND_NDD_NOT_EQUAL_CC                : 'client_assetsplit_equalerror_method',
        INVALID_ASSET_STATUS                    : 'client_assetsplit_invalid_status'
    };
    this.acctParam = [];
    this.resultCache = {};
    this.fieldPair = {
        custpage_newoc          : ['custpage_oldoc', 'custpage_assetcost'],
        custpage_newcc          : ['custpage_oldcc', 'custpage_assetcurrentcost'],
        custpage_newnbv         : ['custpage_oldnbv', 'custpage_assetbookvalue'],
        custpage_newdeprtodate  : ['custpage_olddeprtodate', 'custpage_assetdeprtodate'],
        custpage_newrv          : ['custpage_oldrv', 'custpage_assetresidualvalue'],
        custpage_newlastdepramt : ['custpage_oldlastdepramt', 'custpage_assetlastdepramt']
    };
    this.currSymbol = null;
    this.assSym = null;
    
    /**
     * pageInit event type of client scripts
     *
     * @param {String} type - the mode in which the record is being accessed.
    **/
    this.pageInit = function (type) {
        this.messages = FAM.Util_CS.fetchMessageObj(this.messages);
        this.currSymbol = FAM.SystemSetup.getSetting('nonDecimalCurrencySymbols');
        
        if (nlapiGetFieldValue('custpage_assetid')) {
            nlapiDisableField('custpage_splitquantity', false);
            this.assSym = nlapiGetFieldValue('custpage_currsym');
        }
    };

    /**
     * validateField event type of client scripts
    **/
    this.validateField = function (type, name, linenum) {
        var returnVal = true;
        return returnVal;
    };
    
    /**
     * field changed event of client scripts
     *
     * @param {String} type - Sublist internal id
     * @param {String} name - Field internal id
     * @param {Number} linenum - Optional line item number, starts from 1
    **/
    this.fieldChanged = function (type, name, linenum) {
        switch(name){
            case 'custpage_assetid' :
                var assetId = nlapiGetFieldValue('custpage_assetid');
                var assetQty = Number(nlapiLookupField("customrecord_ncfar_asset", assetId, "custrecord_ncfar_quantity"));
                var assetStatus = nlapiLookupField("customrecord_ncfar_asset", assetId, "custrecord_assetstatus");                
                
                if (FAM.AssetStatus['Disposed'] == assetStatus || FAM.AssetStatus['Fully Depreciated'] == assetStatus){                    
                    alert(this.messages.INVALID_ASSET_STATUS);
                }         
                else if (1 === assetQty){
                    alert(this.messages.ASSET_QTY_1);
                }
                else{
                    setWindowChanged(window, false);
                    var assetSplitSuUrl = [nlapiResolveURL(
                            'SUITELET',
                            'customscript_ncfar_split_sl',
                            'customdeploy_ncfar_split_sl',
                            null,
                            'GET'),
                            "&custpage_p_assetid=" + assetId].join("");
                    window.location.href = assetSplitSuUrl;
                }
                break;
            case 'custpage_splitquantity':
                var splitQty = Number(nlapiGetFieldValue('custpage_splitquantity'));
                var assetQty = Number(nlapiGetFieldValue('custpage_assetquantity'));
                
                var isSplitQtyValid = this.isSplitQtyValid(splitQty, assetQty);
                
                if(isSplitQtyValid) {                    
                    this.disableFields(false);
                    this.computeDefaultDetails();
                }else{
                    alert(this.messages.INVALID_SPLIT_QTY);
                    this.clearAssetValues();
                    this.disableFields(true);
                }
                break;
            case 'custpage_newoc':
            case 'custpage_newcc':
            case 'custpage_newnbv':
            case 'custpage_newdeprtodate':
            case 'custpage_newrv':
            case 'custpage_newlastdepramt':
                this.updateOldAssetValue(name);
                break;
        }

    };

    /**
     * save Record event type of client scripts
    **/
    this.saveRecord = function() {
        var returnVal = true;
        var alertMsg;
        var splitQty             = Number(nlapiGetFieldValue('custpage_splitquantity'));
        var assetQty            = Number(nlapiGetFieldValue('custpage_assetquantity'));
        var newNbv                 = Number(nlapiGetFieldValue('custpage_newnbv'));
        var oldNbv                 = Number(nlapiGetFieldValue('custpage_oldnbv'));
        var newCc                 = Number(nlapiGetFieldValue('custpage_newcc'));        
        var oldCc                 = Number(nlapiGetFieldValue('custpage_oldcc'));
        var newDeprToDate         = Number(nlapiGetFieldValue('custpage_newdeprtodate'));
        var oldDeprToDate         = Number(nlapiGetFieldValue('custpage_olddeprtodate'));
        var newRv                 = Number(nlapiGetFieldValue('custpage_newrv'));
        var oldRv                 = Number(nlapiGetFieldValue('custpage_oldrv'));
        var newLastDeprAmt         = Number(nlapiGetFieldValue('custpage_newlastdepramt'));
        var oldLastDeprAmt         = Number(nlapiGetFieldValue('custpage_oldlastdepramt'));
        
        
        // Split quantity
        if(!splitQty || !this.isSplitQtyValid(splitQty || 0, assetQty)) {
            alertMsg = this.messages.INVALID_SPLIT_QTY;
            returnVal = false;
        }
        
        // NBV should not be greater than CC for old and new assets.
        else if ((newNbv > newCc) ||
                (oldNbv > oldCc)) {
            var newNbvLbl = nlapiGetField('custpage_newnbv').getLabel();
            var newCcLbl = nlapiGetField('custpage_newcc').getLabel();
            alertMsg = FAM.Util_Shared.String.injectMessageParameter(
                    this.messages.GREATER_ERROR, [newNbvLbl, newCcLbl]);
            returnVal = false;
        }
        
        // Depreciation to date should not be greater than CC for old and new assets.
        else if ((newDeprToDate > newCc) ||
                (oldDeprToDate > oldCc)) {
            var newDeprToDateLbl = nlapiGetField('custpage_newdeprtodate').getLabel();
            var newCcLbl = nlapiGetField('custpage_newcc').getLabel();
            alertMsg = FAM.Util_Shared.String.injectMessageParameter(
                    this.messages.GREATER_ERROR, [newDeprToDateLbl, newCcLbl]);
            returnVal = false;
        }
        
        // Depreciation to date + NBV = CC.
        else if ((FAM.Util_Shared.Math.roundByCurrency(newDeprToDate + newNbv, this.assSym, this.currSymbol) != newCc) ||
                 (FAM.Util_Shared.Math.roundByCurrency(oldDeprToDate + oldNbv, this.assSym, this.currSymbol) != oldCc)) {
            alertMsg = this.messages.NBV_AND_NDD_NOT_EQUAL_CC;
            returnVal = false;
        }
        
        // RV > CC for old and new assets.
        else if ((newRv > newCc) || (oldRv > oldCc)) {
            var newRvLbl = nlapiGetField('custpage_newrv').getLabel();
            var newCcLbl = nlapiGetField('custpage_newcc').getLabel();
            alertMsg = FAM.Util_Shared.String.injectMessageParameter(
                    this.messages.GREATER_ERROR, [newRvLbl, newCcLbl]);
            returnVal = false;
        }
        
        // RV > NBV for old and new assets.
        else if ((newRv > newNbv) || (oldRv > oldNbv)) {
            var newRvLbl = nlapiGetField('custpage_newrv').getLabel();
            var newNbvLbl = nlapiGetField('custpage_newnbv').getLabel();
            alertMsg = FAM.Util_Shared.String.injectMessageParameter(
                    this.messages.GREATER_ERROR, [newRvLbl, newNbvLbl]);
            returnVal = false;
        }
        
        // Last depreciation amount > Depreciation to date for old and new Assets.
        else if ((newLastDeprAmt > newDeprToDate) ||
                (oldLastDeprAmt > oldDeprToDate)){
            var newLastDeprAmtLbl = nlapiGetField('custpage_newlastdepramt').getLabel();
            var newDeprToDateLbl = nlapiGetField('custpage_newdeprtodate').getLabel();
            alertMsg = FAM.Util_Shared.String.injectMessageParameter(
                    this.messages.GREATER_ERROR, [newLastDeprAmtLbl, newDeprToDateLbl]);
            returnVal = false;
        }
            
        if (!returnVal && alertMsg) {
            alert(alertMsg);
        }
        return returnVal;
    };
    
    /**
     * Disable Screen field
     *
     * @param {boolean} disable - True: disables field and also clears field content, false: enables field
     * @returns {Void}
     */
    this.disableFields = function (disable) {
        nlapiDisableField('custpage_newoc', disable);
        nlapiDisableField('custpage_newcc', disable);
        nlapiDisableField('custpage_newnbv', disable);
        nlapiDisableField('custpage_newdeprtodate', disable);
        nlapiDisableField('custpage_newrv', disable);
        nlapiDisableField('custpage_newlastdepramt', disable);
        
    };
    
    this.isSplitQtyValid = function(qty, assetQty) {
        var returnVal = true;
        if (qty <= 0 || qty >= assetQty) {
            returnVal = false;
        };
        
        return returnVal;
    };
    
    this.computeDefaultDetails = function() {
        var ratio = nlapiGetFieldValue('custpage_splitquantity')/nlapiGetFieldValue('custpage_assetquantity');
        
        //new asset details
        nlapiSetFieldValue('custpage_newqty', nlapiGetFieldValue('custpage_splitquantity'));
        nlapiSetFieldValue('custpage_newoc', 
            FAM.Util_Shared.Math.roundByCurrency(nlapiGetFieldValue('custpage_assetcost') * ratio, this.assSym, this.currSymbol));
        nlapiSetFieldValue('custpage_newcc', 
            FAM.Util_Shared.Math.roundByCurrency(nlapiGetFieldValue('custpage_assetcurrentcost') * ratio, this.assSym, this.currSymbol));
        nlapiSetFieldValue('custpage_newnbv', 
            FAM.Util_Shared.Math.roundByCurrency(nlapiGetFieldValue('custpage_assetbookvalue') * ratio, this.assSym, this.currSymbol));
        nlapiSetFieldValue('custpage_newdeprtodate', 
            FAM.Util_Shared.Math.roundByCurrency(nlapiGetFieldValue('custpage_assetdeprtodate') * ratio, this.assSym, this.currSymbol));
        nlapiSetFieldValue('custpage_newrv', 
            FAM.Util_Shared.Math.roundByCurrency(nlapiGetFieldValue('custpage_assetresidualvalue') * ratio, this.assSym, this.currSymbol));
        nlapiSetFieldValue('custpage_newlastdepramt', 
            FAM.Util_Shared.Math.roundByCurrency(nlapiGetFieldValue('custpage_assetlastdepramt') * ratio, this.assSym, this.currSymbol));
        nlapiSetFieldValue('custpage_oldqty', nlapiGetFieldValue('custpage_assetquantity') - nlapiGetFieldValue('custpage_newqty'));
    };
    this.updateOldAssetValue = function(field){
        nlapiSetFieldValue(this.fieldPair[field][0], 
                FAM.Util_Shared.Math.roundByCurrency(nlapiGetFieldValue(this.fieldPair[field][1]) - 
                                                     nlapiGetFieldValue(field), this.assSym, this.currSymbol));
    };
    
    this.clearAssetValues = function() {
        nlapiSetFieldValue('custpage_newqty', '');
        nlapiSetFieldValue('custpage_newoc', '');
        nlapiSetFieldValue('custpage_newcc', '');
        nlapiSetFieldValue('custpage_newnbv', '');
        nlapiSetFieldValue('custpage_newdeprtodate', '');
        nlapiSetFieldValue('custpage_newrv', '');
        nlapiSetFieldValue('custpage_newlastdepramt', '');
        nlapiSetFieldValue('custpage_oldqty', '');
        nlapiSetFieldValue('custpage_oldoc', '');
        nlapiSetFieldValue('custpage_oldcc', '');
        nlapiSetFieldValue('custpage_oldnbv', '');
        nlapiSetFieldValue('custpage_olddeprtodate', '');
        nlapiSetFieldValue('custpage_oldrv', '');
        nlapiSetFieldValue('custpage_oldlastdepramt', '');
    };
    
};
