/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/

var FAM;
if (!FAM) { FAM = {}; }

FAM.Revaluation_CS = new function () {
    this.alertMessage = {};
    this.detData = {};
    this.inputFields = ['_wdamt', '_adjresval', '_adjlifetime', '_adjdepmeth'];
    this.depMethodPeriods = [];
    this.submitFlag = false; // locks up Process Revaluation button (need to Calculate first)
    this.currDataCache = {};
    this.subsidiary = '';

    /**
     * pageInit event type of client scripts
     **/
    this.pageInit = function (type) {
        this.alertMessage = FAM.Util_CS.fetchMessageObj({
            ALERT_ASSETDISPOSED       : 'client_asset_disposed',
            ALERT_GREATERTHAN         : 'client_assetrecord_greatererror',
            ALERT_LESSERTHAN          : 'client_lesserthan_error',
            ALERT_MATCHOLD            : 'client_match_current_error',
            ALERT_NOBOOKS             : 'client_select_book',
            ALERT_RVDIFFSIGN          : 'client_newrvdiffsign',
            ALERT_DEPMETHODPERIOD     : 'client_newdepmeth_diffperiod',
            ALERT_WDACCTNOTSET        : 'client_revaluation_wdacct_notset',
            ALERT_COMPUTEFIRST        : 'client_revaluation_needcompute',
            ALERT_BGPEXISTS           : 'client_revaluation_bgpexists',
            CONFIRM_TRANSDATE         : 'client_revaluation_transdate_warn',
            ALERT_ZEROVAL             : 'client_greater_than_zerovalue',
            ALERT_ZEROWD              : 'client_change_zerowd',
            LABEL_LASTDEPRPRD         : 'custpage_lastdeprperiod',
            LABEL_DEPMETHOD           : 'custpage_depmethodlbl',
            LABEL_RV                  : 'custpage_rvlbl',
            ALERT_COMP_WDACCTNOTSET   : 'client_revaluation_comp_wdacct_notset',
            ALERT_COMP_SOMEDISPOSED   : 'client_revaluation_comp_some_disposed',
            ALERT_COMP_ALLDISPOSED    : 'client_revaluation_comp_all_disposed',
            CONFIRM_UNSELECTED_BOOK   : 'client_revaluation_comp_unselected_book'});

        var assetStatus = nlapiGetFieldValue('custpage_assetstatus');
        if(assetStatus == FAM.AssetStatus.Disposed) {
            alert(this.alertMessage.ALERT_ASSETDISPOSED);
            this.disableFields(true);
        }

        this.detData = JSON.parse(nlapiGetFieldValue('custpage_all_detail_fields'));
        if(!FAM.Context.blnMultiBook){
            var msg='';
            for(var e in this.detData){
                this.toggleDisableRow(this.detData[e].prefix, false);
                this.detData[e].disabled = false;

                // If under single instance, no write-down account warning is shown immediately (as discussed)
                if (!this.detData[e].wrtDwnAcct){
                    msg +=  "\n" + this.detData[e].desc;
                }
            }
            // displays alert
            if (msg.length>0) {
                alert(FAM.Util_Shared.String.injectMessageParameter(this.alertMessage.ALERT_WDACCTNOTSET,
                [msg]));
            }
        }

        this.depMethodPeriods = this.searchAllDepMethodPeriods();
        
        var group, count, noWDAcct = [] ;
        group = 'custpage_components';
        count = nlapiGetLineItemCount(group);
        if(count == 0){
            alert(this.alertMessage.ALERT_COMP_ALLDISPOSED);
        }
        else{
            for (var i = 1; i <= count; i++) {
                if(!nlapiGetLineItemValue(group, 'custpage_component_wdacct', i)){
                    noWDAcct.push(nlapiGetLineItemValue(group, 'custpage_component_name', i));
                }
                if(nlapiGetLineItemValue(group, 'custpage_component_iscompound', i)=='T'){
                    this.disableCompoundComponentRow(group, i);
                }
            }
            
            if(noWDAcct.length > 0){
                alert(FAM.Util_Shared.String.injectMessageParameter(this.alertMessage.ALERT_COMP_WDACCTNOTSET,
                        ['\n' + noWDAcct.join('\n')]));
            }
            
            if(nlapiGetFieldValue('custpage_disposedcnt') > 0){
                alert(this.alertMessage.ALERT_COMP_SOMEDISPOSED);
            }
        }
        
        this.currDataCache = new FAM.FieldCache();
        var assetId = nlapiGetFieldValue('custpage_assetid');
        if (assetId){
            this.subsidiary = nlapiLookupField('customrecord_ncfar_asset', assetId, 'custrecord_assetsubsidiary');
            this.currDataCache['noDPCurr'] = FAM.SystemSetup.getSetting('nonDecimalCurrencySymbols');
        }
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
            case 'custpage_assetid' :
                setWindowChanged(window, false);
                nlapiSetFieldValue('custpage_submitaction', 'AssetChange');
                main_form.submit();
                break;
            case 'custpage_component_wdperc' :
            case 'custpage_taxcomponent_wdperc' :
                var prefix = name.substring(0, name.indexOf('wdperc')),
                    currCost = nlapiGetLineItemValue(type, prefix + 'cc', linenum),
                    wdPerc = nlapiGetLineItemValue(type, name, linenum),
                    bookId = nlapiGetLineItemValue(type, 'custpage_taxcomponent_book', linenum);
                if(wdPerc){
                    var wdamt = currCost * parseFloat(wdPerc) / 100;
                    this.setRoundedCurrValue(type, linenum, prefix + 'wd', wdamt, bookId);
                }
                else{
                    nlapiSetLineItemValue(type, prefix + 'wd', linenum, '');
                }
                break;
            case 'custpage_component_wd' :
            case 'custpage_taxcomponent_wd' :
            case 'custpage_component_rvadj' :
            case 'custpage_taxcomponent_rvadj' :
                var fldVal = nlapiGetLineItemValue(type, name, linenum),
                    bookId = nlapiGetLineItemValue(type, 'custpage_taxcomponent_book', linenum);
                if (fldVal){
                    this.setRoundedCurrValue(type, linenum, name, fldVal, bookId);
                }
                break;
            case 'custpage_component_aladj' :
            case 'custpage_taxcomponent_aladj' :
                var aladj = nlapiGetLineItemValue(type, name, linenum);
                if (aladj){
                    nlapiSetLineItemValue(type, name, linenum, parseInt(aladj));
                }
                break;
        }
    };
    
    this.setRoundedCurrValue = function (type, linenum, fld, value, bookId){
        var currSym,
            currency = this.currDataCache.getApplicableCurrency(this.subsidiary, bookId);
        if (currency){
            currSym  = this.currDataCache.funcValCache('nlapiLookupField', 'currency', currency, 'symbol');
        }
        
        value = FAM.Util_Shared.Math.roundByCurrency(value, currSym, this.currDataCache['noDPCurr']);        
        if (type){
            // Will not fire fieldChanged event
            nlapiSetLineItemValue(type, fld, linenum, value);
        }
        else{
            nlapiSetFieldValue(fld, value);
        }
    }

    /**
     * validateField event type of client scripts
    **/
    this.validateField = function (type, name, linenum) {
        var revRule, currRV, newRV, currCC, currNBV, wdPerc, wdAmt, newAL, currAL, currALLbl, lastDeprPrd,
            oldFieldName, fieldName, ret = {}, pattern;

        if (type) {
            fieldName = nlapiGetLineItemField(type, name, linenum).getLabel();
            pattern = '^custpage_(tax|)component_';
            if (this.isRowFieldLike(name, 'wdperc', pattern)) {
                wdPerc = nlapiGetCurrentLineItemValue(type, name);
                if(wdPerc == '0.0%'){
                    ret.msg =  FAM.Util_Shared.String.injectMessageParameter(this.alertMessage.ALERT_ZEROVAL,
                            [fieldName]);
                }
            }
            else if(this.isRowFieldLike(name, 'wd', pattern)) {
                wdAmt = nlapiGetCurrentLineItemValue(type, name);
                if(wdAmt){
                    wdAmt = +wdAmt;
                    newRV = nlapiGetCurrentLineItemValue(type, name.replace('wd', 'rvadj'));
                    revRule = +nlapiGetCurrentLineItemValue(type,name.replace('wd', 'rr'));
                    currCC = +nlapiGetCurrentLineItemValue(type,name.replace('wd', 'cc_hid'));
                    currNBV = +nlapiGetCurrentLineItemValue(type,name.replace('wd', 'nbv'));
                    ret = this.validateWriteDown(fieldName, +wdAmt, revRule, currCC, currNBV, newRV);
                }
            }
            else if(this.isRowFieldLike(name, 'rvadj', pattern)) {
                oldFieldName = this.alertMessage.LABEL_RV;
                newRV = nlapiGetCurrentLineItemValue(type, name);
                if(newRV){
                    newRV = +newRV;
                    revRule = +nlapiGetCurrentLineItemValue(type, name.replace('rvadj', 'rr'));
                    currCC = +nlapiGetCurrentLineItemValue(type, name.replace('rvadj', 'cc_hid'));
                    wdAmt = +nlapiGetCurrentLineItemValue(type, name.replace('rvadj', 'wd'));
                    currNBV = +nlapiGetCurrentLineItemValue(type, name.replace('rvadj', 'nbv'));
                    currRV = +nlapiGetCurrentLineItemValue(type, name.replace('rvadj', 'rv'));
                    ret = this.validateNewResVal(fieldName, oldFieldName, newRV, wdAmt, revRule, currCC,
                                    currNBV, currRV);
                }
            }
            else if(this.isRowFieldLike(name, 'aladj', pattern)) {
                newAL = nlapiGetCurrentLineItemValue(type, name);
                if(newAL){
                    newAL = +newAL;
                    currAL = +nlapiGetCurrentLineItemValue(type, name.replace('aladj', 'al_hid'));
                    currALLbl = nlapiGetLineItemField(type, name.replace('rvadj', 'al'), linenum).getLabel();
                    lastDeprPrd = +nlapiGetCurrentLineItemValue(type, name.replace('aladj', 'ldp'));
                    ret.msg = this.validateNewAL(newAL, fieldName, currAL, currALLbl, lastDeprPrd, this.alertMessage.LABEL_LASTDEPRPRD);
                }
            }
            
        }
        else {
            fieldName = nlapiGetField(name).getLabel();
            pattern = '^custpage_d_(asset|tax)_[0-9]+_';
            if (this.isRowFieldLike(name, 'wdamt', pattern)) {
                wdAmt = nlapiGetFieldValue(name);
                if (wdAmt) {
                    wdAmt = +wdAmt;
                    newRV = nlapiGetFieldValue(name.replace('wdamt', 'adjresval'));
                    newRV = (newRV) ? +newRV : +nlapiGetFieldValue(name.replace('wdamt', 'resval'));
                    revRule = +nlapiGetFieldValue(name.replace('wdamt', 'revrule'));
                    currCC = +nlapiGetFieldValue(name.replace('wdamt', 'currcost'));
                    currNBV = +nlapiGetFieldValue(name.replace('wdamt', 'nbv'));
                    ret = this.validateWriteDown(fieldName, +wdAmt, revRule, currCC, currNBV, newRV);
                }
            }
            else if (this.isRowFieldLike(name, 'adjresval', pattern)) {
                oldFieldName = nlapiGetField(name.replace('adjresval', 'resval')).getLabel();
                newRV = nlapiGetFieldValue(name);
                if (newRV) {
                    newRV = +newRV;
                    revRule = +nlapiGetFieldValue(name.replace('adjresval', 'revrule'));
                    currCC = +nlapiGetFieldValue(name.replace('adjresval', 'currcost'));
                    wdAmt = +nlapiGetFieldValue(name.replace('adjresval', 'wdamt'));
                    currNBV = +nlapiGetFieldValue(name.replace('adjresval', 'nbv'));
                    currRV = +nlapiGetFieldValue(name.replace('adjresval', 'resval'));
                    ret = this.validateNewResVal(fieldName, oldFieldName, newRV, wdAmt, revRule, currCC,
                                    currNBV, currRV);
                }
            }
            else if (this.isRowFieldLike(name, 'adjlifetime', pattern)) {
                newAL = nlapiGetFieldValue(name);
                if(newAL){
                    newAL = +newAL;
                    currAL = +nlapiGetFieldValue(name.replace('adjlifetime', 'lifetime'));
                    currALLbl = nlapiGetField(name.replace('adjlifetime', 'lifetime')).getLabel();
                    lastDeprPrd = +nlapiGetFieldValue(name.replace('adjlifetime', 'lastdeprprd'));
                    ret.msg = this.validateNewAL(newAL, fieldName, currAL, currALLbl, lastDeprPrd, this.alertMessage.LABEL_LASTDEPRPRD);
                }
            }
            else if (this.isRowFieldLike(name, 'adjdepmeth', pattern)) {
                var currDepMeth, currPeriod, newPeriod,
                newDepMeth = +nlapiGetFieldValue(name),
                newLabel = nlapiGetField(name).getLabel(),
                currLabel = this.alertMessage.LABEL_DEPMETHOD;

                if (newDepMeth) {
                    currDepMeth = +nlapiGetFieldValue(name.replace('_adjdepmeth', '_depmeth'));
                    currPeriod = this.getDepMethodPeriod(currDepMeth);
                    newPeriod = this.getDepMethodPeriod(newDepMeth);

                    ret.msg = this.validateNewDepMethod(newLabel, currLabel, newDepMeth, currDepMeth, newPeriod, currPeriod);
                }
            }
            else if (name === 'custpage_writedownperc' && nlapiGetFieldValue(name) === '0.0%') {
                //If Write Down % entered is 0%, pop-up error will display
                ret.msg =  FAM.Util_Shared.String.injectMessageParameter(this.alertMessage.ALERT_ZEROVAL,
                        [fieldName]);
            }
            
            // Check if Asset Transfer BGP instance for this asset already exists
            if (this.isAssetToBeRevalued(nlapiGetFieldValue('custpage_assetid'))) {
                alert(this.alertMessage.ALERT_BGPEXISTS);
                return false;
            }
        }
        
        

        if (ret.msg) {
            alert(ret.msg);
            if((ret.newVal !== undefined)) {
                //Corrects the value to avoid infinite loop when fields check against each other
                nlapiSetFieldValue(name, ret.newVal, false);
            }
            return false;
        };

        
        return true;
    };
    

    /**
     * save Record event type of client scripts
    **/
    this.saveRecord = function() {
        var dateWarnFlag = false; // for checking of revaluation date (if true, show warning)
    
        // Check if Compute button has yet been clicked
        if (!this.submitFlag) {
            alert(this.alertMessage.ALERT_COMPUTEFIRST);
            return false;
        }
        
        // Check revaluation date if valid
        var lstDepDate, transDate = nlapiStringToDate(nlapiGetFieldValue('custpage_revaluationdate'));
        if (!transDate){
            transDate = new Date();
        }
        for(var e in this.detData){
            lstDepDate = this.detData[e].lstDepDate;
            // check if field is enabled and if revaluation date < last depreciation date
            if ((!this.detData[e].disabled) && (lstDepDate && transDate < nlapiStringToDate(lstDepDate))) {
                dateWarnFlag = true;
            }
         }
        
        // Confirms with user that revaluation date is before last depreciation date
        if (dateWarnFlag && !confirm(this.alertMessage.CONFIRM_TRANSDATE)) {
            return false;
        }
        
        //confirm edit on unselected accounting book entries
        if (FAM.Context.blnMultiBook && 
            nlapiGetLineItemCount('custpage_components')>0 && 
            !this.checkUnselectedBookEdit()){
            return false;
        };
            
        return true;
    };

    /**
     * Validates Adj Residual Value
     *
     * Parameters:
     *     label {string} - UI label of the field
     *     oldLabel {string} - UI label of the old field
     *     newRV {number} - desired Residual Value
     *     wdAmt {number} - desired write-down amount
     *     revRule {number} - internal id of the Revision Rules
     *     currCC {number} - current Current Cost of the record
     *     currNBV {number} - current Net Book Value of the record
     *     currRV {number} - current Residual Value of the record
     * Returns:
     *     {hashmap} - msg: error message
     *                 newVal: new value to be reflected to field
    **/
    this.validateNewResVal = function (label, oldLabel, newRV, wdAmt, revRule, currCC, currNBV,
        currRV) {
        var retVal = {};
        if (newRV === currRV) {
            retVal.msg = FAM.Util_Shared.String.injectMessageParameter(this.alertMessage.ALERT_MATCHOLD,
                [label, oldLabel]);
        }
        else if (newRV !== 0 && currCC !== 0 && newRV > 0 !== currCC > 0) {
            retVal.msg = FAM.Util_Shared.String.injectMessageParameter(this.alertMessage.ALERT_RVDIFFSIGN,
                [label]);
            retVal.newVal = '';
        }
        else if (revRule === FAM.RevisionRules.RemainingLife &&
            Math.abs(newRV) > Math.abs(currNBV - wdAmt)) {
            retVal.msg = FAM.Util_Shared.String.injectMessageParameter(
                this.alertMessage.ALERT_GREATERTHAN, [label, currNBV - wdAmt]);
            retVal.newVal = '';
        }
        else if (revRule === FAM.RevisionRules.CurrentPeriod &&
            Math.abs(newRV) > Math.abs(currCC - wdAmt)) {
            retVal.msg = FAM.Util_Shared.String.injectMessageParameter(
                this.alertMessage.ALERT_GREATERTHAN, [label, currCC - wdAmt]);
            retVal.newVal = '';
        }

        return retVal;
    };

    /**
     * Validates Adj Life Time
     *
     * Parameters:
     *     newAL {number} - desired asset life time
     *     label {string} - UI label of the field
     *     currAL {number} - current Life Time of the record
     *     currALLbl {string} - UI label of current Life Time field
     *     lastDeprPrd {number} - current Last Depreciation Period of the record
     *     lastDeprPrdLbl {string} - UI label of current Last Depreciation Period field
     * Returns:
     *     {string} - error message; null if there were no errors
    **/
    this.validateNewAL = function(newAL, fieldName, currAL, currALLbl, lastDeprPrd, lastDeprPrdLbl){
        if(newAL){
            if(newAL < lastDeprPrd){
                return FAM.Util_Shared.String.injectMessageParameter(
                        this.alertMessage.ALERT_LESSERTHAN, [fieldName, lastDeprPrdLbl]) +
                        '\n(' + lastDeprPrdLbl + ': ' + lastDeprPrd + ')';
            }

            if(newAL == currAL){
                return FAM.Util_Shared.String.injectMessageParameter(
                        this.alertMessage.ALERT_MATCHOLD, [fieldName, currALLbl]);
            }
        }else{//AL is 0
            return FAM.Util_Shared.String.injectMessageParameter(this.alertMessage.ALERT_ZEROVAL,
                    [fieldName]);
        }
        return null;
    };

    /**
     * Validates Adj Depreciation Method
     *
     * Parameters:
     *     label {string} - UI label of the field, Adj Depreciation Method
     *     oldLabel {string} - UI label of the field, Depreciation Method
     *     newDepMeth {number} - internal Id of the selected Adj Depreciation Method
     *     currDepMeth {number} - internal Id of the current Depreciation Method
     *     newDepMethPeriod {number} - value of the Adj Depreciation Method's Depreciation Period
     *          (e.g. 1 or 2 for 'Monthly' or 'Annually')
     *     currDepMethPeriod {number} - value of the current Depreciation Method's Depreciation Period
     * Returns:
     *     {string} - error message; null if there were no errors
    **/
    this.validateNewDepMethod = function(label, oldLabel, newDepMeth, currDepMeth, newDepMethPeriod, currDepMethPeriod){

        if (currDepMeth && currDepMeth === newDepMeth) {
            return FAM.Util_Shared.String.injectMessageParameter(
                    this.alertMessage.ALERT_MATCHOLD, [label, oldLabel]);
        }

        if (currDepMethPeriod && currDepMethPeriod !== newDepMethPeriod) {
            return this.alertMessage.ALERT_DEPMETHODPERIOD;
        }

        return null;
    };

    /**
     * Validates Write Down Value
     *
     * Parameters:
     *     label {string} - UI label of the field
     *     wdAmt {number} - desired write-down amount
     *     revRule {number} - internal id of the Revision Rules
     *     currCC {number} - current Current Cost of the record
     *     currNBV {number} - current Net Book Value of the record
     *     newRV {number} - current Residual Value (or new if entered by user)
     * Returns:
     *     {hashmap} - msg: error message
     *                 newVal: new value to be reflected to field
    **/
    this.validateWriteDown = function(label, wdAmt, revRule, currCC, currNBV, newRV) {
        var retVal = {},
            cost = (revRule === FAM.RevisionRules.RemainingLife) ? currNBV : currCC;
        if(wdAmt === 0) {
            //If the amount entered is 0.00, pop-up error will display
            retVal.msg = this.alertMessage.ALERT_ZEROWD;
        }
        else if(Math.abs(wdAmt) > Math.abs(cost) && ((wdAmt * cost) >= 0)) {
            retVal.msg = FAM.Util_Shared.String.injectMessageParameter(this.alertMessage.ALERT_RVDIFFSIGN,
                [label]);
            retVal.newVal = '';
        }
        else if (Math.abs(newRV) > Math.abs(cost - wdAmt)) {
                retVal.msg = FAM.Util_Shared.String.injectMessageParameter(
                this.alertMessage.ALERT_GREATERTHAN, [label, cost - newRV]);
            retVal.newVal = '';
        }

        return retVal;
    };

    /** Disable Screen field
     *
     * @param {boolean} disable - True: disables field, false: enables field
     * @returns {Void}
     */
    this.disableFields = function (disable) {
        nlapiDisableField('custpage_accountingbook', disable);
        nlapiDisableField('custpage_writedownperc', disable);
        nlapiDisableField('custpage_revaluationdate', disable);
        nlapiDisableField('custpage_revaluationmemo', disable);
        nlapiDisableField('calculate', disable);
    };
    
    this.disableCompoundComponentRow = function (group, row){
        var fldToDisable = ['custpage_component_wdperc',
                            'custpage_component_wd',
                            'custpage_component_rvadj',
                            'custpage_component_aladj'
                            ];
        for(var i = 0; i < fldToDisable.length; i ++){
            nlapiDisableLineItemField(group, fldToDisable[i] + row, true);
        }
            
    };

    this.calculate = function(){
        var selBooks, wdPerc, currCost, msg='';
        for(var e in this.detData){
            if (FAM.Context.blnMultiBook){
                selBooks = nlapiGetFieldValues('custpage_accountingbook');
                if(!selBooks.length){
                    alert(this.alertMessage.ALERT_NOBOOKS);
                    return;
                }
                if(selBooks.indexOf(this.detData[e].bookId) > -1){
                    //check if write-down account exists - warning if none
                    if (!this.detData[e].wrtDwnAcct){
                        msg +=  "\n" + this.detData[e].desc;
                    }

                    if(this.detData[e].disabled){
                        this.toggleDisableRow(this.detData[e].prefix, false);
                        this.detData[e].disabled = false;
                    }

                    //set writedown percentage
                    wdPerc = nlapiGetFieldValue('custpage_writedownperc');
                    if(wdPerc){
                        currCost = nlapiGetFieldValue(this.detData[e].prefix + '_currcost');                        
                        var wdamt = currCost * parseFloat(wdPerc) / 100;
                        this.setRoundedCurrValue(null, null, 
                                this.detData[e].prefix + '_wdamt', wdamt, this.detData[e].bookId);
                    }
                    else{
                        nlapiSetFieldValue(this.detData[e].prefix + '_wdamt', '');
                    }

                }else{
                    this.toggleDisableRow(this.detData[e].prefix, true);
                    this.detData[e].disabled = true;
                }
            }else{
                //check if write-down account exists - warning if none
                if (!this.detData[e].wrtDwnAcct){
                    msg +=  "\n" + this.detData[e].desc;
                }
                wdPerc = nlapiGetFieldValue('custpage_writedownperc');
                if(wdPerc){
                    currCost = nlapiGetFieldValue(this.detData[e].prefix + '_currcost');                        
                    var wdamt = currCost * parseFloat(wdPerc) / 100;
                    this.setRoundedCurrValue(null, null, 
                            this.detData[e].prefix + '_wdamt', wdamt, this.detData[e].bookId);
                }
                else{
                    nlapiSetFieldValue(this.detData[e].prefix + '_wdamt', '');
                }
            }
        }
        
        msg += this.calculateSublists();
        
        // shows warning if there are no write down accounts set
        if (msg.length>0){
                alert(FAM.Util_Shared.String.injectMessageParameter(this.alertMessage.ALERT_WDACCTNOTSET,
                [msg]));

        }
        // frees up Process Revaluation button for submit
        this.submitFlag = true;
    };

    /**
     * Checks if there is a BG - Process Instance record where Process Name: 'Asset Revaluation',
     * Process Status: 'Queued' or 'In Progress' and the Asset Id (from Process State) is the Asset
     * Id on the form.
     *
     * Parameters:
     *     assetId {number} - internal id of the asset
     * Returns:
     *     boolean
    **/
    this.isAssetToBeRevalued = function (assetId) {
        if (!assetId) {
            return false;
        }

        var fil = [
            new nlobjSearchFilter('custrecord_far_proins_functionname', null, 'is', 'famAssetRevaluation'),
            new nlobjSearchFilter('custrecord_far_proins_recordid', null, 'equalto', assetId),
            new nlobjSearchFilter('custrecord_far_proins_procstatus', null, 'anyof',
                [FAM.BGProcessStatus.InProgress, FAM.BGProcessStatus.Queued]),
            new nlobjSearchFilter('isinactive', null, 'is', 'F')
        ];

        if (nlapiSearchRecord('customrecord_bg_procinstance', null, fil)) {
            return true;
        }

        return false;
    };

    this.toggleDisableRow = function(prefix, disable){
        var fldName;
        for(var i = 0; i<this.inputFields.length; i++){
            fldName = prefix + this.inputFields[i];
            nlapiDisableField(fldName, disable);
            if(disable){
                nlapiSetFieldValue(fldName, '');
            }
        }
    };

    /**
     * Searches all active dep methods and returns all the Depreciation Period values in a hashmap.
     *
     * Parameters:
     *     id {number} - Depreciaton Method internal id
     * Returns:
     *     {Object} - hash map with Key: 'id_<depmethod internal id> and Value: Depreciation Period ('1' or '2')
     */
    this.searchAllDepMethodPeriods = function () {
        var filter = new nlobjSearchFilter('isinactive', null, 'is', 'F'),
            column = new nlobjSearchColumn('custrecord_deprmethoddeprperiod'),
            res = nlapiSearchRecord('customrecord_ncfar_deprmethod', null, filter, column),
            depMethods = {};

        if (res) {
            for (var i = 0; i < res.length; i++) {
                depMethods['id_' + res[i].getId()] = +res[i].getValue('custrecord_deprmethoddeprperiod');
            }
        }

        return depMethods;
    };

    /**
     * Returns the Depreciation Period ('1' - Monthly, '2' - Annually) given the Dep Method ID.
     *
     * Parameters:
     *     id {number} - Depreciaton Method internal id
     * Returns:
     *     {number} - Depreciation Period. Returns null if the id is not found in the hash map.
     */
    this.getDepMethodPeriod = function (id) {
        var ret = +this.depMethodPeriods['id_' + id];
        if (ret) {
            return ret;
        }
        return null;
    };

    /**
     * Returns true if a certain row field is a <fieldName> field (Write Down, Adjusted Depreciation Method etc.).
     * Since rows are identified by the prefix custpage_d_<asset or tax>_<asset internal id>, this function
     * may be used in determining what kind of field triggered a change or is being validated.
     * Parameters:
     *     name {String} - field name (full) as captured by field changed or validate field functions
     *                     e.g. 'custpage_d_asset_100_wdamt'
     *     fieldName {String} - last part of the field name that is part of a row. The ff may be used:
     *                          'wdamt', 'adjresval', 'adjlifetime', 'adjdepmeth'
     * Returns:
     *     {boolean} - true if <fieldName> is the suffix of <name> (provided it matches the prefix pattern)
     */
    this.isRowFieldLike = function (name, fieldName, pattern) {
        var regex, ret = false;
        pattern += fieldName + '$';
        if (fieldName && name) {
            regex = new RegExp(pattern);
            ret = regex.test(name);
        }
        return ret;
    };
    
    this.calculateSublists = function () {
        var i, count, group, book,
            wdPerc = nlapiGetFieldValue('custpage_writedownperc'),
            selectedBooks = nlapiGetFieldValues('custpage_accountingbook') || [],
            primaryBookId = FAM.Util_Shared.getPrimaryBookId();
        
        if (wdPerc && 
               (!FAM.Context.blnMultiBook || 
                selectedBooks.indexOf(primaryBookId) !== -1)) {
            group = 'custpage_components';
            count = nlapiGetLineItemCount(group);
            for (i = 1; i <= count; i++) {
                if(nlapiGetLineItemValue(group, 'custpage_component_iscompound', i)==='T'){ continue; }
                
                nlapiSelectLineItem(group, i);
                nlapiSetCurrentLineItemValue(group, 'custpage_component_wdperc', wdPerc);
            }
        }
        if (wdPerc && FAM.Context.blnMultiBook && selectedBooks.length > 0) {
            group = 'custpage_taxcomponents';
            count = nlapiGetLineItemCount(group);
            for (i = 1; i <= count; i++) {
                book = nlapiGetLineItemValue(group, 'custpage_taxcomponent_book', i);
                if (selectedBooks.indexOf(book) === -1) { continue; }                
                if(nlapiGetLineItemValue(group, 'custpage_component_iscompound', i)==='T'){ continue; }
                
                nlapiSelectLineItem(group, i);
                nlapiSetCurrentLineItemValue(group, 'custpage_taxcomponent_wdperc', wdPerc);
            }
        }
        return '';
    };
    
    this.checkUnselectedBookEdit = function(){
        var selectedBooks = nlapiGetFieldValues('custpage_accountingbook') || [],
            primaryBookId = FAM.Util_Shared.getPrimaryBookId(),
            group, count, book, hasUnselected = false;
        //checkPrimary
        if(selectedBooks.indexOf(primaryBookId) === -1){
            group = 'custpage_components';
            count = nlapiGetLineItemCount(group);
            for(var i = 1; i <= count; i++){
                if(nlapiGetLineItemValue(group,'custpage_component_wdperc',i)||
                   nlapiGetLineItemValue(group,'custpage_component_wd',i)||
                   nlapiGetLineItemValue(group,'custpage_component_rvadj',i)||
                   nlapiGetLineItemValue(group,'custpage_component_aladj',i)){
                    hasUnselected = true;
                    break;
                }
            }
        }
        
        if(!hasUnselected){
            group = 'custpage_taxcomponents';
            count = nlapiGetLineItemCount(group);
            for(var i = 1; i <= count; i++){
                book = nlapiGetLineItemValue(group,'custpage_taxcomponent_book',i);
                if((book && selectedBooks.indexOf(book) === -1)&&
                    (nlapiGetLineItemValue(group,'custpage_taxcomponent_wdperc',i)||
                     nlapiGetLineItemValue(group,'custpage_taxcomponent_wd',i)||
                     nlapiGetLineItemValue(group,'custpage_taxcomponent_rvadj',i)||
                     nlapiGetLineItemValue(group,'custpage_taxcomponent_aladj',i)||
                     nlapiGetLineItemValue(group,'custpage_taxcomponent_deprmetadj',i))){
                     hasUnselected = true;
                     break;
                 }
            }
        }
        if(hasUnselected){
            return confirm(this.alertMessage.CONFIRM_UNSELECTED_BOOK);
        }
        return true;
    };
};
