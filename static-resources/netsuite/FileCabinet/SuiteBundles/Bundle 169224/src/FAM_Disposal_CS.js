/**
 * � 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/

var FAM;
if (!FAM) { FAM = {}; }

FAM.Disposal_CS = new function () {
    this.messages = {};
    this.acctParam = [];
    this.resultCache = {};
    this.acctErrCache = {};
    this.currSymbol = {};
    this.isMultiLocInvt;
    this.isPrefLocMandatory;
    this.compCache;
    this.addDesc;
    this.bulkErrMsg;
    this.bulkErrSummary;
    this.errMsgLimit = 5;
    /**
     * pageInit event type of client scripts
     *
     * @param {String} type - the mode in which the record is being accessed.
    **/
    this.pageInit = function (type) {
        this.compCache = new FAM.FieldCache();
        this.addDesc = false;
        
        this.isMultiLocInvt = FAM.Context.blnMultiLocInvt;
        this.isPrefLocMandatory = FAM.Context.blnLocMandatory;
        
        this.messages = FAM.Util_CS.fetchMessageObj({
            ALERT_PLEASEENTER               : "client_enter_value",
            ALERT_ALREADYDISPOSED_COMP      : "client_disposal_alreadydisposed_comp",
            ALERT_SUBSIDIARYMATCH           : "client_subsidiary_match",
            ALERT_SUBSIDIARYMATCH2          : "client_subsidiary_match_2",
            ALERT_BGPEXISTS                 : "client_disposal_bgpexists",
            ALERT_ACCTNOTEXIST              : "client_disposal_acctnotexist",
            ALERT_NOCHANGE_DISPTYPE         : "client_disposal_nochange_disptype",
            ALERT_ACCTNOTEXIST_COMP         : "client_disposal_acctnotexist_comp",
            ALERT_EARLIERTHANLDD            : "client_disposal_dateearlierthanldd",
            ALERT_SALEAMTPOSITIVE           : "client_disposal_saleamountgreater",
            ALERT_DISPQTYGREATER            : "client_disposal_cannotbegreater",
            ALERT_ZEROVAL                   : "client_greater_than_zerovalue",
            ALERT_NOASSETTODISPOSE          : "client_error_no_asset_to_dispose",
            ALERT_ALREADYADDED_COMP         : "custpage_duplicate_dispentry_comp",
            ALERT_INVALIDITEM               : "client_disposal_invalid_item",
            CONFIRM_CHANGE_TYPE             : "client_confirm_change_type",
            CONFIRM_ADD_COMPOUND            : "client_confirm_add_compound",
            CONFIRM_REMOVE_COMP_INVALID_SUB : "client_confirm_remove_componentsinvalidsub",
            INVALID_COMPONENTS_OTHER        : "custpage_invalid_components_excess"});
        
        this.currSymbol = FAM.SystemSetup.getSetting('nonDecimalCurrencySymbols');
        
        this.disableFields();
        
        this.assetFields = ['name',
                            'altname',
                            'custrecord_is_compound',
                            'custrecord_componentof.name',
                            'custrecord_assetsubsidiary',
                            'custrecord_assetstatus',
                            'custrecord_assetcurrentcost',
                            'custrecord_assetdeprtodate',
                            'custrecord_assetbookvalue',
                            'custrecord_assetlastdeprdate',
                            'custrecord_ncfar_quantity',
                            'custrecord_assetcurrency',
                            'custrecord_assetlocation',
                            'custrecord_assetwriteoffacc',
                            'custrecord_assetdisposalacc',
                            'custrecord_assetmainacc',
                            'custrecord_assetdepracc',
                            'custrecord_assetwriteoffacc.isinactive',
                            'custrecord_assetdisposalacc.isinactive',
                            'custrecord_assetmainacc.isinactive',
                            'custrecord_assetdepracc.isinactive',
                            'custrecord_assetvals',
                            'custrecord_assetvals.custrecord_slavebookvalue',
                            'custrecord_assetvals.custrecord_slavelastdeprdate'];
        
        this.taxFields = ['custrecord_altdepr_accountingbook',
                          'custrecord_altdepraltmethod',
                          'custrecord_altdeprmethod',
                          'custrecord_altdepr_originalcost',
                          'custrecord_altdepr_currentcost',
                          'custrecord_altdeprrv',
                          'custrecord_altdeprlifetime',
                          'custrecord_altdeprnbv',
                          'custrecord_altdeprcd',
                          'custrecord_altdeprcurrentage',
                          'custrecord_altdeprld',
                          'custrecord_altdeprlastdeprdate',
                          'custrecord_altdepr_depreciationperiod',
                          'custrecord_altdeprstatus',
                          'custrecord_altdepr_writeoffaccount',
                          'custrecord_altdepr_disposalaccount',
                          'custrecord_altdepr_assetaccount',
                          'custrecord_altdepr_depraccount',
                          'custrecord_altdepr_writeoffaccount.isinactive',
                          'custrecord_altdepr_disposalaccount.isinactive',
                          'custrecord_altdepr_assetaccount.isinactive',
                          'custrecord_altdepr_depraccount.isinactive'];
    };

    /**
     * field changed event of client scripts
     *
     * @param {String} type - Sublist internal id
     * @param {String} name - Field internal id
     * @param {Number} linenum - Optional line item number, starts from 1
    **/
    this.fieldChanged = function (type, name, linenum) {
        if (name == "custpage_disposaltype") {
            var disposalType = Number(nlapiGetFieldValue(name));
            this.disableFields(disposalType);
        }
        else if (type == "custpage_disposallist") {
            var assetId = nlapiGetCurrentLineItemValue(
                "custpage_disposallist", "custpage_disposal_id_name");
            
            if (name == "custpage_disposal_id_name") {
                if (assetId){
                    var assetFields = this.getAssetCacheDetails(assetId);
                    if(assetFields.custrecord_is_compound!=="T"){
                        var lastDeprDateAsset, nbv;
                        if (assetFields.custrecord_assetvals){
                            lastDeprDateAsset = assetFields['custrecord_assetvals.custrecord_slavelastdeprdate'];
                            nbv = assetFields['custrecord_assetvals.custrecord_slavebookvalue'];
                        }
                        else{
                            lastDeprDateAsset = assetFields['custrecord_assetlastdeprdate'];
                            nbv = assetFields['custrecord_assetbookvalue'];
                        }
                        var lastDeprDate = this.getLatestDeprDate(assetId, nlapiStringToDate(lastDeprDateAsset));
                        nlapiSetCurrentLineItemValue("custpage_disposallist",
                            "custpage_compound_asset", assetFields["custrecord_componentof.name"], false);
                        nlapiSetCurrentLineItemValue("custpage_disposallist",
                            "custpage_disposal_curr_cost", assetFields.custrecord_assetcurrentcost, false);
                        nlapiSetCurrentLineItemValue("custpage_disposallist",
                            "custpage_disposal_curr_nbv", nbv, false);
                        nlapiSetCurrentLineItemValue("custpage_disposallist",
                            "custpage_disposal_lastdeprdate", nlapiDateToString(lastDeprDate), false);
                        nlapiSetCurrentLineItemValue("custpage_disposallist",
                            "custpage_disposal_origqty", assetFields.custrecord_ncfar_quantity, false);
                        nlapiSetCurrentLineItemValue("custpage_disposallist",
                            "custpage_disposal_qty", assetFields.custrecord_ncfar_quantity, false);
                        nlapiSetCurrentLineItemValue("custpage_disposallist",
                            "custpage_disposal_salesamt", "", false);
                        nlapiSetCurrentLineItemValue("custpage_disposallist",
                            "custpage_disposal_loc", assetFields.custrecord_assetlocation, false);
                        nlapiSetCurrentLineItemValue("custpage_disposallist",
                                "custpage_disposal_status", assetFields.custrecord_assetstatus, false);
                    }
                    else{
                        nlapiCancelLineItem("custpage_disposallist");
                        var retVal = confirm(this.messages.CONFIRM_ADD_COMPOUND);
                        if(retVal){
                            this.addDescendants(assetId);
                        }
                        
                    }
                }
                // Reset line item field values
                else {
                    nlapiSetCurrentLineItemValue("custpage_disposallist",
                        "custpage_compound_asset", "", false);
                    nlapiSetCurrentLineItemValue("custpage_disposallist",
                        "custpage_disposal_curr_cost", "", false);
                    nlapiSetCurrentLineItemValue("custpage_disposallist",
                        "custpage_disposal_curr_nbv", "", false);
                    nlapiSetCurrentLineItemValue("custpage_disposallist",
                        "custpage_disposal_lastdeprdate", "", false);
                    nlapiSetCurrentLineItemValue("custpage_disposallist",
                        "custpage_disposal_origqty", "", false);
                    nlapiSetCurrentLineItemValue("custpage_disposallist",
                        "custpage_disposal_qty", "", false);
                    nlapiSetCurrentLineItemValue("custpage_disposallist",
                        "custpage_disposal_salesamt", "", false);
                    nlapiSetCurrentLineItemValue("custpage_disposallist",
                        "custpage_disposal_loc", "", false);
                    nlapiSetCurrentLineItemValue("custpage_disposallist",
                        "custpage_disposal_status", "", false);
                }
            }
            else if (name == "custpage_disposal_salesamt") {
                if (assetId){
                    var salesAmt = nlapiGetCurrentLineItemValue(
                        "custpage_disposallist", "custpage_disposal_salesamt");
                    var assetSubId = this.getAssetCacheDetails(assetId)["custrecord_assetsubsidiary"];
                    var currencyId = FAM.Util_Shared.getApplicableCurrency(assetSubId);
                    var currencySym = this.getCurrencyCacheDetails(currencyId)["symbol"];
                    
                    var roundedAmt = FAM.Util_Shared.Math.roundByCurrency(
                        salesAmt, currencySym, this.currSymbol);
                    
                    nlapiSetCurrentLineItemValue("custpage_disposallist",
                        "custpage_disposal_salesamt", roundedAmt, false);
                }
            }
        };
    };

    /**
     * save Record event type of client scripts
    **/
    this.saveRecord = function() {
        var dispListLength = nlapiGetLineItemCount("custpage_disposallist"),    
            dispType = Number(nlapiGetFieldValue("custpage_disposaltype")),
            errParam = [], errAssets;
        
        // Do not allow to dispose if there are no assets to dispose... of course.
        if (dispListLength === 0) {
            alert(this.messages.ALERT_NOASSETTODISPOSE);
            return false;
        };
        
        //check if no duplicate bgp for all records
        
        errAssets = this.checkDuplicateBGP();
        if(errAssets.length>0){
            var msg = FAM.Util_Shared.String.injectMessageParameter(
                            this.messages.ALERT_BGPEXISTS, 
                            ["\n    " + (errAssets.slice(0, this.errMsgLimit)).join("\n    ")]);
            if(errAssets.length > this.errMsgLimit){
                msg += "\n\n    " + FAM.Util_Shared.String.injectMessageParameter(
                                        this.messages.INVALID_COMPONENTS_OTHER, 
                                        [errAssets.length-this.errMsgLimit]);
            }
            alert(msg)
            return false;
        }
        
        // Specific Disposal Type = Sale validations
        if (dispType === FAM.DisposalType["Sale"]) {
            if(!nlapiGetFieldValue("custpage_disposalitem")) {
                errParam.push(nlapiGetField("custpage_disposalitem").getLabel());
            }
            if(!nlapiGetFieldValue("custpage_customer")) {
                errParam.push(nlapiGetField("custpage_customer").getLabel());
            }
            
            for (var i = 1; i<=dispListLength; i++) {
                var salesAmt = Number(nlapiGetLineItemValue(
                    "custpage_disposallist", "custpage_disposal_salesamt", i));
                
                if (salesAmt <= 0) {
                    errParam.push(nlapiGetLineItemField(
                        "custpage_disposallist", "custpage_disposal_salesamt").getLabel());
                    
                    break;
                }
            };
            
        };

        if(errParam.length) {
                     alert(FAM.Util_Shared.String.injectMessageParameter(
                this.messages.ALERT_PLEASEENTER, [errParam.join(", ")]));
            return false;
        };

        return true;
    };
    
    /**
     * validateField event type of client scripts
    **/
    this.validateField = function (type, name, linenum) {
        var retVal = true;
        var dispListLength = nlapiGetLineItemCount("custpage_disposallist");
        
        if (name === "custpage_disposaltype") {
            var locMandatory = this.isLocationMandatory(dispType),
                locLabel = nlapiGetLineItemField(
                    "custpage_disposallist", "custpage_disposal_loc").getLabel(),
                loc, assetId, assetName,
                invalidTotal = 0, includedTotal = 0, errMsg = "",
                dispType = +nlapiGetFieldValue(name),
                dispListCurrIndex = nlapiGetCurrentLineItemIndex("custpage_disposallist"),
                clearData = false, logged;
            
            
            this.bulkErrSummary = {};
            for (var i = 1; i<=dispListLength; i++) {
                assetId = nlapiGetLineItemValue(
                    "custpage_disposallist", "custpage_disposal_id_name", i);
                assetName = this.resultCache[assetId].name;
                this.bulkErrMsg = "";
                logged = false;
                
                //validate location
                if (locMandatory) {
                    loc = nlapiGetLineItemValue(
                            "custpage_disposallist", "custpage_disposal_loc", i);
                    
                    if (!loc) {
                        this.bulkErrMsg = FAM.Util_Shared.String.injectMessageParameter(
                                                this.messages.ALERT_PLEASEENTER, [locLabel]);
                        logged = true;
                    }
                }
                
                //validate accounts
                if (!logged && !this.hasValidAccounts(assetId, dispType)){
                    this.bulkErrMsg = this.messages.ALERT_NOCHANGE_DISPTYPE +
                                      '\n\n' + 
                                      this.messages.ALERT_ACCTNOTEXIST_COMP;
                    this.acctParam = [];
                }
                
                if(this.bulkErrMsg != ""){
                    if(includedTotal <= this.errMsgLimit){
                        if (!this.bulkErrSummary.hasOwnProperty(this.bulkErrMsg)){
                            this.bulkErrSummary[this.bulkErrMsg] = [assetName];
                        }
                        else{
                            this.bulkErrSummary[this.bulkErrMsg].push(assetName);
                        }
                        includedTotal++;
                    }
                    invalidTotal++;
                }
            };
            
            if(invalidTotal>0){
                for(var err in this.bulkErrSummary){
                    errMsg += err + "\n    " + this.bulkErrSummary[err].join("\n    ") + "\n\n"; 
                }
                if(invalidTotal>this.errMsgLimit){
                    errMsg += FAM.Util_Shared.String.injectMessageParameter(
                            this.messages.INVALID_COMPONENTS_OTHER, [invalidTotal-this.errMsgLimit]);
                }
                alert(errMsg);
                retVal = false;
            }
            
            
            if (retVal && (dispType === FAM.DisposalType["Write Off"]) &&
                   (dispListLength > 0 ||
                    dispListCurrIndex > 0)) {
                
                clearData = (nlapiGetFieldValue("custpage_conslineitemsoninv") === "T" ||
                            nlapiGetFieldValue("custpage_customer") !== "" ||
                            nlapiGetFieldValue("custpage_taxcode")  !== ""||
                            nlapiGetFieldValue("custpage_disposalitem") !== "");
                
                
                for(var i = 1;!clearData && i <= dispListLength; i++){
                    if(nlapiGetLineItemValue("custpage_disposallist", "custpage_disposal_salesamt", i)){
                        clearData = true;
                    }
                }
                
                
                if(!clearData){
                    if(nlapiGetCurrentLineItemValue("custpage_disposallist","custpage_disposal_salesamt")){
                        clearData = true;
                    }
                }
                
                    
                if(clearData){
                    var fieldLabels = [
                                       nlapiGetField("custpage_conslineitemsoninv").getLabel(),
                                       nlapiGetField("custpage_customer").getLabel(),
                                       nlapiGetField("custpage_taxcode").getLabel(),
                                       nlapiGetField("custpage_disposalitem").getLabel(),
                                       nlapiGetLineItemField("custpage_disposallist", "custpage_disposal_salesamt")
                                           .getLabel() ];
                    
                    
                    retVal = confirm(FAM.Util_Shared.String.injectMessageParameter(
                        this.messages.CONFIRM_CHANGE_TYPE, [fieldLabels.join(", ")]));
                }
                else{
                    retVal = true;
                }
                
                if (retVal) { // Clear all Sale related fields
                    nlapiSetFieldValue("custpage_conslineitemsoninv", "F", false);
                    nlapiSetFieldValue("custpage_customer", "", false);
                    nlapiSetFieldValue("custpage_taxcode", "", false);
                    nlapiSetFieldValue("custpage_disposalitem", "", false);
                    
                    for (var i = 1; i<=dispListLength; i++) {
                        nlapiSetLineItemValue(
                            "custpage_disposallist", "custpage_disposal_salesamt", i, "");
                    };
                    
                    // Double check on currentLineItem
                    nlapiCancelLineItem("custpage_disposallist");
                }
            }
        }
        else if (name === "custpage_customer" && FAM.Context.blnOneWorld) {
            var custId = Number(nlapiGetFieldValue(name));
            custId = custId > 0 ? custId : 0;
            var custSub = this.getCustCacheDetails(custId)["subsidiary"];
            var salesTaxId = Number(nlapiGetFieldValue("custpage_taxcode"));
            
            // Validate selected customer against selected sales tax code
            if (salesTaxId && custId) {
                if (!this.isSalesTaxCustSubValid(custSub, salesTaxId)){
                    var salesTaxLabel = nlapiGetField("custpage_taxcode").getLabel();
                    var custLabel = nlapiGetField(name).getLabel();
                    alert(FAM.Util_Shared.String.injectMessageParameter(
                        this.messages.ALERT_SUBSIDIARYMATCH2, [salesTaxLabel, custLabel]));
                    retVal = false;
                }
            }
            
            // Check validity of assets in sublist when compared to the selected customer field
            if (retVal && custId && dispListLength) {
                var invalidIdxList = [];
                
                for (var i = 1; i<=dispListLength; i++) {
                    var assetId = nlapiGetLineItemValue(
                        "custpage_disposallist", "custpage_disposal_id_name", i);
                    var assetSub = this.getAssetCacheDetails(assetId)["custrecord_assetsubsidiary"];
                    
                    if (assetSub != custSub) {
                        invalidIdxList.push(i);
                    };
                };
                
                if (invalidIdxList.length > 0) {
                    var invalidAssetNamesList = [];
                    invalidIdxList.map(function(i) {
                        invalidAssetNamesList.push(nlapiGetLineItemText(
                            "custpage_disposallist", "custpage_disposal_id_name", i));
                    });
                    
                    retVal = confirm(FAM.Util_Shared.String.injectMessageParameter(
                        this.messages.CONFIRM_REMOVE_COMP_INVALID_SUB,
                        [nlapiGetField(name).getLabel(),
                         invalidAssetNamesList.join("\n")]));
                        
                    if (retVal) {
                        for (var i = invalidIdxList.length-1; i>=0; i--) {
                            var idx = invalidIdxList[i];
                            nlapiRemoveLineItem("custpage_disposallist", idx);
                        }
                    }
                }
            }
        }
        else if (name === "custpage_taxcode" && FAM.Context.blnOneWorld
                    && nlapiGetFieldValue(name) && nlapiGetFieldValue("custpage_customer")) {
            var dispType = Number(nlapiGetFieldValue("custpage_disposaltype"));
            
            var custId = Number(nlapiGetFieldValue("custpage_customer"));
            var custSub = this.getCustCacheDetails(custId)["subsidiary"];
            var salesTaxId = Number(nlapiGetFieldValue(name));
            
            if (dispType === FAM.DisposalType["Sale"] &&
                !this.isSalesTaxCustSubValid(custSub, salesTaxId)) {
                var salesTaxLabel = nlapiGetField(name).getLabel();
                var custLabel = nlapiGetField("custpage_customer").getLabel();
                alert(FAM.Util_Shared.String.injectMessageParameter(
                    this.messages.ALERT_SUBSIDIARYMATCH2, [salesTaxLabel, custLabel]));
                retVal = false;
            };
        }
        else if (name === "custpage_disposaldate" && nlapiGetFieldValue(name)) {
            var dispDate = this.getTimeFromDateField(name);
            
            for (var i = 1; i<=dispListLength; i++) {
                
                // Get latest lastdeprdate
                var assetId = nlapiGetLineItemValue(
                    "custpage_disposallist", "custpage_disposal_id_name", i);
                var lastDeprDate = this.getLatestDeprDate(assetId);
                
                if (lastDeprDate && !this.validateDisposalDate(dispDate, lastDeprDate)) {
                    alert(FAM.Util_Shared.String.injectMessageParameter(
                        this.messages.ALERT_EARLIERTHANLDD,
                        [nlapiDateToString(new Date(dispDate)),
                         nlapiDateToString(lastDeprDate)]));
                    retVal = false;
                    break;
                }
            }
        }
        else if (name === 'custpage_disposalitem') {
            var dispItem = nlapiGetFieldValue(name);
            retVal = dispItem ? this.validateItem(nlapiGetFieldValue(name)) : true;
            if (!retVal) {
                alert(this.messages.ALERT_INVALIDITEM);
            }
        }
        
        return retVal;
    };
    
    this.validateItem = function (itemId) {
        var subType = this.compCache.funcValCache('nlapiLookupField', 'noninventoryitem', itemId,
            'subtype');
        
        return subType ? 
                subType.indexOf('Resale') !== -1 || subType.indexOf('Sale') !== -1 :
                false; // Handling of non-noninventoryitems being shown see 442899
    }
    
    this.validateLineItem = function(type) {
        if (type === "custpage_disposallist") {
            this.bulkErrMsg = "";
            var returnVal = true, msg = "";
            
            var assetId = nlapiGetCurrentLineItemValue(
                "custpage_disposallist", "custpage_disposal_id_name");
            var custId = nlapiGetFieldValue("custpage_customer");
            
            // Prevent missing argument error when user adds an empty line item
            if (!assetId){
                returnVal = false;
            }
            
            // Proceed with validations
            else {
                this.updateTaxMethodCache(assetId);
                var dispType = Number(nlapiGetFieldValue("custpage_disposaltype"));
                
                // Get latest lastdeprdate
                var assetId = nlapiGetCurrentLineItemValue(
                    "custpage_disposallist", "custpage_disposal_id_name"),
                    lastDeprDate = this.getLatestDeprDate(assetId),
                    dispDate = this.getTimeFromDateField("custpage_disposaldate"),
                    saleAmt = nlapiGetCurrentLineItemValue(
                    "custpage_disposallist", "custpage_disposal_salesamt"),
                    origQty = Number(nlapiGetCurrentLineItemValue(
                    "custpage_disposallist", "custpage_disposal_origqty")),
                    dispQty = Number(nlapiGetCurrentLineItemValue(
                    "custpage_disposallist", "custpage_disposal_qty")),
                    loc = nlapiGetCurrentLineItemValue(
                    "custpage_disposallist", "custpage_disposal_loc"),
                    assetSub = this.getAssetCacheDetails(assetId)["custrecord_assetsubsidiary"],
                    custSub = this.getCustCacheDetails(custId)["subsidiary"],
                    assetName = this.getAssetCacheDetails(assetId)["name"];

                if(this.hasDuplicateEntry(assetId)){
                    if(this.addDesc){
                        msg = this.messages.ALERT_ALREADYADDED_COMP;
                    } else {
                        msg = this.messages.ALERT_ALREADYADDED_COMP +
                                '\n    ' + assetName;
                    }
                    returnVal = false;
                }
                else if (!this.validateAssetStatus(assetId)) {
                    if(this.addDesc){
                        msg = this.messages.ALERT_ALREADYDISPOSED_COMP;
                    } else {
                        msg = this.messages.ALERT_ALREADYDISPOSED_COMP +
                                '\n    ' + assetName;
                    }
                    
                    returnVal = false;
                }
                else if (!this.hasValidAccounts(assetId, dispType) && this.acctParam.length) {
                    if(this.addDesc){
                        msg = this.messages.ALERT_ACCTNOTEXIST_COMP;
                        this.acctParam = [];
                    } else {
                        msg = FAM.Util_Shared.String.injectMessageParameter(
                                this.messages.ALERT_ACCTNOTEXIST, 
                                ["\n    "+this.acctParam.join("\n    ")]);
                        this.acctParam = [];
                    }
                    returnVal = false;
                }
                else if (dispDate && !this.validateDisposalDate(dispDate, lastDeprDate)) {
                    msg = FAM.Util_Shared.String.injectMessageParameter(
                        this.messages.ALERT_EARLIERTHANLDD,
                        [nlapiDateToString(new Date(dispDate)),
                         nlapiDateToString(lastDeprDate)]);
                    returnVal = false;
                }
                else if (!this.validateSalesAmount(saleAmt)) {
                    if(!this.addDesc){
                        msg = this.messages.ALERT_SALEAMTPOSITIVE;
                        returnVal = false;
                    }
                }
                else if (!this.validatePositiveQty(dispQty)) {
                    var dispQtyLabel = nlapiGetLineItemField(
                        "custpage_disposallist", "custpage_disposal_qty").getLabel();
                    msg = FAM.Util_Shared.String.injectMessageParameter(
                        this.messages.ALERT_ZEROVAL, [dispQtyLabel]);
                    returnVal = false;
                }
                else if (!this.validateNotExceedingQty(origQty, dispQty)) {
                    msg = this.messages.ALERT_DISPQTYGREATER;
                    returnVal = false;
                }
                else if (this.isLocationMandatory(dispType) && !loc) {
                    if(!this.addDesc){
                        var locLabel = nlapiGetLineItemField(
                                "custpage_disposallist", "custpage_disposal_loc").getLabel();
                        msg = FAM.Util_Shared.String.injectMessageParameter(
                            this.messages.ALERT_PLEASEENTER, [locLabel]);
                        returnVal = false;
                    }
                }
                else if (FAM.Context.blnOneWorld && assetSub && custSub &&
                         dispType === FAM.DisposalType["Sale"] &&
                         (assetSub != custSub)) {
                    var custLabel = nlapiGetField("custpage_customer").getLabel();
                    msg = FAM.Util_Shared.String.injectMessageParameter(
                        this.messages.ALERT_SUBSIDIARYMATCH, [custLabel]);
                    returnVal = false;
                }
                else if (FAM.Context.blnOneWorld && assetSub && loc &&
                         (!FAM.compareCDLSubsidiary("location", loc, assetSub))) {
                    var locLabel = nlapiGetLineItemField(
                        "custpage_disposallist", "custpage_disposal_loc").getLabel();
                    msg = FAM.Util_Shared.String.injectMessageParameter(
                        this.messages.ALERT_SUBSIDIARYMATCH, [locLabel]);
                    returnVal = false;
                }
            }
            
            if(!FAM.Util_Shared.isNullUndefinedOrEmpty(msg)){
                if(this.addDesc){
                    this.bulkErrMsg = msg;
                } else {
                    alert(msg);
                }
                
            }
            return returnVal;
        }
        
    };
    
    this.validateAssetStatus = function(assetId) {
        var assetFields = this.getAssetCacheDetails(assetId);
        if (Number(assetFields.custrecord_assetstatus) === FAM.AssetStatus.Disposed){
            return false;
        };
        
        return true;
    };
    
    this.validateDisposalDate = function(dd, ldd){
        return (new Date(dd) >= new Date(ldd));
    };
    
    this.validateSalesAmount = function(saleAmt){
        var disposalType = Number(nlapiGetFieldValue("custpage_disposaltype"));
        if (!disposalType || disposalType === FAM.DisposalType["Write Off"]) {
            return true;
        }
        return (saleAmt > 0);
    };
    
    this.validatePositiveQty = function(dispQty){
        return (dispQty > 0);
    };
    
    this.validateNotExceedingQty = function(origQty, dispQty){
        return (dispQty <= origQty);
    };

    /**
     * Disable Screen field
     *
     * @param {boolean} disable - True: disables field and also clears field content, false: enables field
     * @returns {Void}
     */
    this.disableFields = function (type) {
        if (!type || type === FAM.DisposalType["Write Off"]) {
            nlapiDisableField("custpage_conslineitemsoninv", true);
            nlapiDisableField("custpage_customer", true);
            nlapiDisableField("custpage_taxcode", true);
            nlapiDisableField("custpage_disposalitem", true);
            nlapiDisableField("custpage_disposal_salesamt", true);
            nlapiDisableLineItemField("custpage_disposallist", "custpage_disposal_salesamt", true);
        }
        else {
            nlapiDisableField("custpage_conslineitemsoninv", false);
            nlapiDisableField("custpage_customer", false);
            nlapiDisableField("custpage_taxcode", false);
            nlapiDisableField("custpage_disposalitem", false);
            nlapiDisableField("custpage_disposal_salesamt", false);
            nlapiDisableLineItemField("custpage_disposallist", "custpage_disposal_salesamt", false);
        }
    };
    
    /**
     * Checks if there is a BG - Process Instance record where Process Name: "Asset Disposal",
     * Process Status: 'Queued' or 'In Progress' with state values containing the asset ID.
     *
     * Parameters:
     *     assetId {number} - internal id of the asset
     * Returns:
     *     boolean
    **/
    this.checkDuplicateBGP = function () {
        var allKeys = [], assetsBeingProcessed = []
            dispListLength = nlapiGetLineItemCount("custpage_disposallist"),
            fSearch = new FAM.Search(new FAM.BGProcess());
        
        fSearch.addFilter("isinactive", null, "is", "F");
        fSearch.addFilter("func_name", null, "is", "customscript_fam_mr_disposal");
        fSearch.addFilter("status", null, "anyof", [FAM.BGProcessStatus.InProgress,
                                                    FAM.BGProcessStatus.Queued]);
        
        fSearch.addColumn("state");
        
        fSearch.run();
        var res = fSearch.results || [];

        if (res.length > 0) {
            for(var i = 0; i<res.length; i++) {
                var stateValues = res[i].getValue("custrecord_far_proins_procstate");
                var stateValuesObj = {};
                try {
                    stateValuesObj = JSON.parse(stateValues);
                }
                catch (e) {
                    nlapiLogExecution("ERROR", "Error parsing state values.", e.toString());
                }
                allKeys = allKeys.concat(Object.keys(stateValuesObj));
            }
        }
        
        for (var i = 1; i<=dispListLength; i++) {
            var assetId = nlapiGetLineItemValue(
                "custpage_disposallist", "custpage_disposal_id_name", i);
            
            if (allKeys.indexOf(assetId.toString()) !== -1) {
                assetsBeingProcessed.push(this.resultCache[assetId].name);
            }
        };
        
        return assetsBeingProcessed;
    };
    
    /**
     * Checks if Asset and Tax Methods in that Asset has the required journal accounts set.
     *
     * Parameters:
     *      assetId {number} - internal id of the asset
     * Returns:
     *      boolean
     **/
    this.hasValidAccounts = function (assetId, dispType) {
        // Check if asset id is in cache
        if(this.acctErrCache.hasOwnProperty(assetId + '_' + dispType)){
            this.acctParam = this.acctErrCache[assetId + '_' + dispType].errParam;
            return false;
        }

        // Check asset accounts
        var assetCacheDetails = this.getAssetCacheDetails(assetId),
            objAcctVal = {};
        
        objAcctVal.assetAcct = assetCacheDetails["custrecord_assetmainacc"] &&
                                       assetCacheDetails["custrecord_assetmainacc.isinactive"] == 'F';
        objAcctVal.deprAcct  = assetCacheDetails["custrecord_assetdepracc"] &&
                                    assetCacheDetails["custrecord_assetdepracc.isinactive"] == 'F';
        objAcctVal.wOffAcct  = assetCacheDetails["custrecord_assetwriteoffacc"] &&
                                    assetCacheDetails["custrecord_assetwriteoffacc.isinactive"] == 'F';
        objAcctVal.dispAcct  = assetCacheDetails["custrecord_assetdisposalacc"] &&
                                    assetCacheDetails["custrecord_assetdisposalacc.isinactive"] == 'F';
        objAcctVal.nbv          = +assetCacheDetails["custrecord_assetbookvalue"] != 0;
        objAcctVal.cummDepr  = +assetCacheDetails["custrecord_assetdeprtodate"] != 0;
        
        if ((!objAcctVal.assetAcct) ||
            (!objAcctVal.deprAcct && objAcctVal.cummDepr) ||
            (dispType != FAM.DisposalType["Write Off"] && !objAcctVal.dispAcct && objAcctVal.nbv) ||
            (dispType != FAM.DisposalType["Sale"] && !objAcctVal.wOffAcct && objAcctVal.nbv)) {

            var assetName = [assetCacheDetails["name"], " ", assetCacheDetails["altname"]].join("");
            this.acctParam.push(assetName);
            this.acctErrCache[assetId + '_' + dispType] = {errParam: this.acctParam}; //cache the results
        }
        

        // Check tax accounts
        var taxMethodsIdList = [];
        if (this.resultCache[assetId] && this.resultCache[assetId]["altMethods"]) {
            taxMethodsIdList = Object.keys(this.resultCache[assetId]["altMethods"]);
        }
        
        for (var i = 0 ; i<taxMethodsIdList.length; i++) {
            var altMethodId = taxMethodsIdList[i];
            var altMethod = this.resultCache[assetId]["altMethods"][altMethodId];
            objAcctVal = {};
            
            if(!altMethod["custrecord_altdepr_accountingbook"]){ continue; }
            
            objAcctVal.assetAcct = altMethod["custrecord_altdepr_assetaccount"] &&
                                        altMethod["custrecord_altdepr_assetaccount.isinactive"] == 'F';
            objAcctVal.deprAcct  = altMethod["custrecord_altdepr_depraccount"] &&
                                        altMethod["custrecord_altdepr_depraccount.isinactive"] == 'F';
            objAcctVal.wOffAcct  = altMethod["custrecord_altdepr_writeoffaccount"] &&
                                        altMethod["custrecord_altdepr_writeoffaccount.isinactive"] == 'F';
            objAcctVal.dispAcct  = altMethod["custrecord_altdepr_disposalaccount"] &&
                                        altMethod["custrecord_altdepr_disposalaccount.isinactive"] == 'F';
            objAcctVal.nbv          = +altMethod["custrecord_altdeprnbv"] != 0;
            objAcctVal.cummDepr  = +altMethod["custrecord_altdeprcd"] != 0;
            
            if ((!objAcctVal.assetAcct) ||
                (!objAcctVal.deprAcct && objAcctVal.cummDepr) ||
                (dispType != FAM.DisposalType["Write Off"] && !objAcctVal.dispAcct && objAcctVal.nbv) ||
                (dispType != FAM.DisposalType["Sale"] && !objAcctVal.wOffAcct && objAcctVal.nbv)) {
                
                var msgParam = altMethod["custrecord_altdepr_accountingbook"] + 
                " (" + altMethod["custrecord_altdepraltmethod"] + 
                ": " + altMethod["custrecord_altdeprmethod"] + ")";
                this.acctParam.push(msgParam);
                this.acctErrCache[assetId + '_' + dispType] = {errParam: this.acctParam}; //cache the results
                
            }
        };
        
        if(this.acctParam.length) {
            return false;
        };
        
        return true;
    };
    
    this.hasDuplicateEntry = function(assetId) {
        var dispListLength = nlapiGetLineItemCount("custpage_disposallist"),
            currIdx = nlapiGetCurrentLineItemIndex("custpage_disposallist");
        for(var i = 1; i <= dispListLength; i++){
            if(i==currIdx) { continue; }
            
            var lnAssetId = nlapiGetLineItemValue("custpage_disposallist", "custpage_disposal_id_name", i);
            
            if(assetId === lnAssetId){ return true;}
        }
        return false;
    };

    /**
     * Sets the location field to be mandatory based on the following conditions: 
     * - Disposal Type == Sale | Location is required if either:
     *      - MLI = T || Make Locations Mandatory = T
     * - Disposal Type == Write-off | Location is required if:
     *      -Make Locations Mandatory = T
     * 
     * @returns boolean
     */
    this.isLocationMandatory = function(disposalType) {
        return this.isPrefLocMandatory || (disposalType == FAM.DisposalType["Sale"] && this.isMultiLocInvt); 
    };
    
    this.getAssetCacheDetails = function(assetId) {
        if(!assetId){
            return {};
        }
        if(!this.resultCache[assetId]){
            this.resultCache[assetId] = this.compCache.funcValCache("nlapiLookupField",
                    "customrecord_ncfar_asset", assetId,
                    this.assetFields);
        }
        else{
            return this.resultCache[assetId];
        }
        
        return this.resultCache[assetId];
    };
    
    this.getCurrencyCacheDetails = function(currId) {
        return currId ? this.compCache.funcValCache("nlapiLookupField",
                "currency", currId,
                  ["symbol"])
              : {}; // Return blank object instead to prevent null/undefined related error
    };
    
    this.getCustCacheDetails = function(custId) {
        return custId && FAM.Context.blnOneWorld? this.compCache.funcValCache("nlapiLookupField",
                "customer", custId,
                   ["subsidiary"])
                : {}; // Return blank object instead to prevent null/undefined related error
    };
    
    this.isSalesTaxCustSubValid = function(custSubId, salesTaxCodeId) {
        return FAM.Context.blnOneWorld ? 
            this.compCache.funcValCache("FAM.Util_Shared.isValidSubsidiaryRecCombination",
                custSubId, "salestaxitem", salesTaxCodeId) : true;
    };
    
    this.getTimeFromDateField = function(arg1, arg2, arg3) {
        var time;
        
        // arg1 = field ID
        if (arguments.length == 1) {
            var fieldValue = nlapiGetFieldValue(arg1);
            if (fieldValue) {
                time = nlapiStringToDate(fieldValue).getTime();
            };
        }
        
        // arg1 = sublist ID | arg2 = field ID
        else if (arguments.length == 2) {
            var fieldValue = nlapiGetCurrentLineItemValue(arg1, arg2);
            time = nlapiStringToDate(fieldValue).getTime();
        }
        
        // arg1 = sublist ID | arg2 = field ID | arg3 = line item number
        else if (arguments.length == 3) {
            var fieldValue = nlapiGetLineItemValue(arg1, arg2, arg3);
            time = nlapiStringToDate(fieldValue).getTime();
        };
        
        return time;
    };
    
    /**
     * Retrieves tax methods for the given asset
     *
     * Parameters:
     *     assetId {number} - internal id of the asset
     * Returns:
     *     {nlobjSearchResult[]} - search results
    **/
    this.searchTaxMethods = function (assetId) {
        var fSearch = new FAM.Search(new FAM.AltDeprMethod_Record());

        fSearch.addFilter("isinactive", null, "is", "F");
        fSearch.addFilter("parent_asset", null, "is", assetId);

        for(var i = 0; i < this.taxFields.length; i++){
            
            var col = this.taxFields[i].split(".");
            if(col.length>1){
                fSearch.addColumn(col[1], col[0]);
            }else{
                fSearch.addColumn(col[0]);
            }
        }
        
        fSearch.run();
        return fSearch.results;
    };

    this.updateTaxMethodCache = function(assetId) {
        if (!this.resultCache[assetId]["altMethods"]) {
            var fSearch = this.searchTaxMethods(assetId) || [];
            
            if (fSearch.length > 0) {
                var assetMap = this.resultCache[assetId];
                assetMap = assetMap || {};
                assetMap["altMethods"] = assetMap["altMethods"] || {}; 

                for(var i = 0; i < fSearch.length; i++) {
                    var altMethodId = fSearch[i].getId();
                    assetMap["altMethods"][altMethodId] = assetMap["altMethods"][altMethodId] || {};
                    
                    var altMethodMap = assetMap["altMethods"][altMethodId];

                    altMethodMap["custrecord_altdepr_accountingbook"]
                        = fSearch[i].getText("custrecord_altdepr_accountingbook");
                    altMethodMap["custrecord_altdepraltmethod"]
                        = fSearch[i].getText("custrecord_altdepraltmethod");
                    altMethodMap["custrecord_altdeprmethod"]
                        = fSearch[i].getText("custrecord_altdeprmethod");
                    altMethodMap["custrecord_altdeprlastdeprdate"]
                        = fSearch[i].getValue("custrecord_altdeprlastdeprdate");
                    altMethodMap["custrecord_altdepr_writeoffaccount"]
                        = fSearch[i].getValue("custrecord_altdepr_writeoffaccount");
                    altMethodMap["custrecord_altdepr_writeoffaccount.isinactive"]
                        = fSearch[i].getValue("isinactive", "custrecord_altdepr_writeoffaccount");
                    altMethodMap["custrecord_altdepr_disposalaccount"]
                        = fSearch[i].getValue("custrecord_altdepr_disposalaccount");
                    altMethodMap["custrecord_altdepr_disposalaccount.isinactive"]
                        = fSearch[i].getValue("isinactive", "custrecord_altdepr_disposalaccount");
                    altMethodMap["custrecord_altdepr_assetaccount"]
                        = fSearch[i].getValue("custrecord_altdepr_assetaccount");
                    altMethodMap["custrecord_altdepr_assetaccount.isinactive"]
                        = fSearch[i].getValue("isinactive", "custrecord_altdepr_assetaccount");
                    altMethodMap["custrecord_altdepr_depraccount"]
                        = fSearch[i].getValue("custrecord_altdepr_depraccount");
                    altMethodMap["custrecord_altdepr_depraccount.isinactive"]
                        = fSearch[i].getValue("isinactive", "custrecord_altdepr_depraccount");
                    
                    this.resultCache[assetId] = assetMap;
                    this.resultCache[assetId]["altMethods"][altMethodId] = altMethodMap;
                };
            };
        }
    };
    
    this.addDescendants = function(assetId){
        var compAssets, errMsg='', 
            invalidTotal = 0, includedTotal = 0,
            taxTextColumns = ["custrecord_altdepr_accountingbook",
                              "custrecord_altdepraltmethod",
                              "custrecord_altdeprmethod"];
        
        this.bulkErrSummary = {};
        this.addDesc = true;
        
        compAssets = this.compCache.funcValCache("FAM.Util_Shared.getDescendants",
                        [assetId],this.assetFields,null,true,
                        {taxFields: this.taxFields, taxFilters: null, textCol: taxTextColumns});
        for(var assetId in compAssets){
            if(!this.resultCache[assetId]){
                this.resultCache[assetId] = compAssets[assetId];
            }
            var objAsset = compAssets[assetId];
            var lastDeprDate, nbv;
            if (objAsset.custrecord_assetvals){
                lastDeprDate = objAsset['custrecord_assetvals.custrecord_slavelastdeprdate'];
                nbv = objAsset['custrecord_assetvals.custrecord_slavebookvalue'];
            }
            else{
                lastDeprDate = objAsset['custrecord_assetlastdeprdate'];
                nbv = objAsset['custrecord_assetbookvalue'];
            }
            nlapiSelectNewLineItem("custpage_disposallist");
            nlapiSetCurrentLineItemValue("custpage_disposallist",
                "custpage_disposal_id_name", assetId, false);
            nlapiSetCurrentLineItemValue("custpage_disposallist",
                "custpage_compound_asset", objAsset["custrecord_componentof.name"], false);
            nlapiSetCurrentLineItemValue("custpage_disposallist",
                "custpage_disposal_curr_cost", objAsset.custrecord_assetcurrentcost, false);
            nlapiSetCurrentLineItemValue("custpage_disposallist",
                "custpage_disposal_curr_nbv", nbv, false);
            nlapiSetCurrentLineItemValue("custpage_disposallist",
                "custpage_disposal_lastdeprdate", lastDeprDate, false);
            nlapiSetCurrentLineItemValue("custpage_disposallist",
                "custpage_disposal_origqty", objAsset.custrecord_ncfar_quantity, false);
            nlapiSetCurrentLineItemValue("custpage_disposallist",
                "custpage_disposal_qty", objAsset.custrecord_ncfar_quantity, false);
            nlapiSetCurrentLineItemValue("custpage_disposallist",
                "custpage_disposal_salesamt", "", false);
            nlapiSetCurrentLineItemValue("custpage_disposallist",
                "custpage_disposal_loc", objAsset.custrecord_assetlocation, false);
            nlapiSetCurrentLineItemValue("custpage_disposallist",
                "custpage_disposal_status", objAsset.custrecord_assetstatus, false);
            nlapiCommitLineItem("custpage_disposallist");
            
            if(this.bulkErrMsg!==""){
                if(includedTotal < this.errMsgLimit){
                    if (!this.bulkErrSummary.hasOwnProperty(this.bulkErrMsg)){
                        this.bulkErrSummary[this.bulkErrMsg] = [objAsset.name];
                    }
                    else{
                        this.bulkErrSummary[this.bulkErrMsg].push(objAsset.name);
                    }
                    includedTotal++;
                }
                nlapiCancelLineItem("custpage_disposallist");
                invalidTotal++;
            }
        }
        
        if(invalidTotal>0){
            for(var err in this.bulkErrSummary){
                errMsg += err + "\n    " + this.bulkErrSummary[err].join("\n    ") + "\n\n"; 
            }
            if(invalidTotal>this.errMsgLimit){
                errMsg += FAM.Util_Shared.String.injectMessageParameter(
                        this.messages.INVALID_COMPONENTS_OTHER, [invalidTotal-this.errMsgLimit]);
            }
            alert(errMsg);
        }
        nlapiSelectNewLineItem("custpage_disposallist");
        nlapiCancelLineItem("custpage_disposallist");
        this.addDesc = false;
    };
    
    this.getLatestDeprDate = function(assetId, lastDeprDateAsset){
        this.updateTaxMethodCache(assetId);
        var lastDeprDate, lastDeprDateTax = new Date(0);
        lastDeprDateAsset = lastDeprDateAsset || new Date(0);
        
        if(!this.resultCache[assetId].hasOwnProperty("latestLastDeprDate")){
            if (this.resultCache[assetId]["altMethods"]){
                var altMethodMap = this.resultCache[assetId]["altMethods"];
                for (var i in altMethodMap){
                    var altDeprLDD = nlapiStringToDate(altMethodMap[i]['custrecord_altdeprlastdeprdate']) || new Date(0);
                    lastDeprDateTax = lastDeprDateTax > altDeprLDD ? 
                            lastDeprDateTax : altDeprLDD;
                }
            }
            if (!lastDeprDateAsset){
                lastDeprDateAsset = nlapiStringToDate(this.resultCache[assetId]["custrecord_assetlastdeprdate"]) || new Date(0);
            }
            // Get later lastdeprdate from tax and asset
            lastDeprDate = lastDeprDateAsset > lastDeprDateTax ? 
                    lastDeprDateAsset : lastDeprDateTax;
            this.resultCache[assetId]["latestLastDeprDate"] = lastDeprDate;
        }
        else{
            lastDeprDate = this.resultCache[assetId]["latestLastDeprDate"];
        }
            
        return lastDeprDate;
    };
    
    this.goToBulkDisposal = function(url){
        var dispTypes = encodeURIComponent(nlapiGetFieldValue('custpage_disposaltype_options'));
        redirectPage(url + '&dt=' + dispTypes);
    };
};