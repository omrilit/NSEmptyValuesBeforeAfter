/**
 * � 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

function searchTransaction(transId) {
    var transRec = new FAM.Transaction(),
        fSearch  = new FAM.Search(transRec);

    fSearch.savedSearch = 'customsearch_ncfar_newassetsearch';

    fSearch.addFilter('internalid', null, 'is', transId);

    fSearch.addColumn('account');
    fSearch.addColumn('type');
    fSearch.addColumn('approvalstatus');
    fSearch.addColumn('status');

    if (FAM.Context.blnMultiCurrency) {
        fSearch.addColumn('currency');
        fSearch.addColumn('exchangerate');
    }
    if (FAM.Context.blnOneWorld) {
        fSearch.addColumn('subsidiary');
    }
    if (FAM.Context.blnDepartment) {
        fSearch.addColumn('department');
    }
    if (FAM.Context.blnClass) {
        fSearch.addColumn('class');
    }
    if (FAM.Context.blnLocation) {
        fSearch.addColumn('location');
    }

    fSearch.run();

    return fSearch.results;
}

function determineAssetType(accountId) {
    var assetTypeRec = new FAM.AssetType_Record(),
        fSearch      = new FAM.Search(assetTypeRec);

    fSearch.addFilter('asset_account', null, 'is', accountId);
    fSearch.addFilter('isinactive', null, 'is', 'F');

    fSearch.run();

    if (fSearch.results) {
        return assetTypeRec.loadRecord(fSearch.getId(0));
    }
    else {
        return null;
    }
}

function proposeAsset(transactionId, blnCreateAsset) {
    var i, transResult, assetTypeRec,
        blnError = false,
        errorMsg = 'Processing of some transactions failed. Please check the execution logs for ' +
            'more details.',
        transRec = new FAM.Transaction(),
        allowedTransactions = ['Build', 'VendBill', 'InvAdjst', 'InvTrnfr', 'ItemRcpt', 'Journal',
            'CardChrg', 'ExpRept'];

    if (!transactionId) {
        nlapiLogExecution('error', 'nsFamObject.proposeAsset', 'Transaction Id not defined.');
        return 'Transaction Id not defined.';
    }

    transResult = searchTransaction(transactionId);

    if (!transResult) {
        nlapiLogExecution('error', 'nsFamObject.proposeAsset', 'Transaction does not exists.');
        return 'Transaction does not exists. | Transaction Id: ' + transactionId;
    }

    for (i = 0; i < transResult.length; i++) {
        if (FAM.SystemSetup.getSetting('isPropApprovedOnly') === 'T' &&
            FAM.isTransactionApproved(transResult[i])) {

            nlapiLogExecution('error', 'nsFamObject.proposeAsset', 'Only approved transactions ' +
                'can be proposed as an asset. (Can be disabled in FAM - System Setup) | ' +
                'Transaction Id: ' + transResult[i].getId() + ' | Transaction Line: ' +
                transResult[i].getValue('line'));
            blnError = true;
            continue;
        }
        if (allowedTransactions.indexOf(transResult[i].getValue('type')) === -1) {
            nlapiLogExecution('error', 'nsFamObject.proposeAsset', 'Transaction Type not allowed ' +
                'to be proposed as an asset. | Transaction Id: ' + transResult[i].getId() +
                ' | Transaction Line: ' + transResult[i].getValue('line') + ' | Type: ' +
                transResult[i].getValue('type'));
            blnError = true;
            continue;
        }

        assetTypeRec = determineAssetType(transResult[i].getValue('account'));

        if (!assetTypeRec) {
            nlapiLogExecution('error', 'nsFamObject.proposeAsset', 'Could not determine asset ' +
                'type. | Transaction Id: ' + transResult[i].getId() + ' | Transaction Line: ' +
                transResult[i].getValue('line') + ' | Account Id: ' +
                transResult[i].getValue('account') + ' | Account Name: ' +
                transResult[i].getText('account'));
            blnError = true;
            continue;
        }

        nlapiLogExecution('debug', 'nsFamObject.proposeAsset', 'Creating proposal for ' +
            'Transaction Id: ' + transResult[i].getId() + ' | Transaction Line: ' +
            transResult[i].getValue('line') + ' | Auto Create Asset: ' + blnCreateAsset);

        // already proposed use-case cannot be handled due to function implementation o( >_< )o
        ncFAR_CreateProposal_ITER(assetTypeRec, transResult[i], null, null, blnCreateAsset);
    }

    return blnError ? errorMsg : null;
}

function createAssetFromProposal(proposalId) {
    var assetId, propRec = new FAM.AssetProposal_Record();

    // already created use-case cannot be handled due to function implementation o( >_< )o
    assetId = ncFAR_GenerateAsset(propRec.loadRecord(proposalId));

    if (assetId === -1) {
        nlapiLogExecution('error', 'nsFamObject.createAssetFromProposal', 'Error creating asset.');
        return 'Error creating asset.';
    }

    propRec.submitField({ status : propRec.getStatusId('Created'), asset_id : assetId });

    return null;
}

function assetProposal(trandata) {
    nlapiLogExecution('debug', 'Asset Proposal', 'Transaction Id: ' +
        trandata.sourceTransaction);

    var errorMsg = null;

    errorMsg = proposeAsset(trandata.sourceTransaction, false);

    if (errorMsg) {
        trandata.errorCode = 1;
        trandata.errorDetails = errorMsg;
    }
    else {
        trandata.errorCode = 0;
    }

    return trandata;
}

function assetCreation(trandata) {
    nlapiLogExecution('debug', 'Asset Creation', 'Creation Type: ' + trandata.creationType);

    var errorMsg = null;

    if (trandata.creationType === 'transaction') {
        nlapiLogExecution('debug', 'Asset Creation', 'Transaction Id: ' +
            trandata.sourceTransaction);

        errorMsg = proposeAsset(trandata.sourceTransaction, true);
    }
    else if (trandata.creationType === 'proposal') {
        nlapiLogExecution('debug', 'Asset Creation', 'Proposal Id: ' +
            trandata.proposalRecord);

        errorMsg = createAssetFromProposal(trandata.proposalRecord);
    }
    else {
        errorMsg = 'Creation Type not supported.';
    }

    if (errorMsg) {
        trandata.errorCode = 1;
        trandata.errorDetails = errorMsg;
    }
    else {
        trandata.errorCode = 0;
    }

    return trandata;
}

/**
 *
 * @param trandata
 *  assetId                 Required/Required(if no taxMethodId)    Internal Id of the Asset to be revaluated
 *  taxMethodId             Optional/Required(if no assetId)    Internal Id of the Tax Method to revalue (if not supplied, assetId is revalued
 *  writedownAmount         Optional    This amount is subtracted from the current net book value.
 *  residualValue           Optional    New residual value for the asset.
 *  adjustedLifetime        Optional    New lifetime for the asset.
 *  newDepreciationMethod   Optional    Internal Id of the new depreciation method for the asset.
 *  transactionReference    Optional    Reference to identify the journal entry for this transaction.
 *  transactionDate         Optional    Date for the journal entry for this transaction.
 * @returns trandata
 */

function assetRevaluation(trandata) {
    nlapiLogExecution('DEBUG', 'Asset Revaluation', 'Asset Id: ' + trandata.assetId
            + ' | Tax Method Id     : ' + trandata.taxMethodId
            + ' | Write-down Amount : ' + trandata.writedownAmount
            + ' | New Residual Value: ' + trandata.residualValue
            + ' | New Asset Lifetime: ' + trandata.adjustedLifetime
            + ' | New Depr Method   : ' + trandata.residualValue
            + ' | Transaction Date  : ' + trandata.newDepreciationMethod);

    var assetRevSS, revObj = {},
        scrName = 'assetrevaluation', fieldName, oldFieldName, ret={}, recData,
        wdAmt, newRV, newAL, newDepMeth, currPeriod, newPeriod;

    //perform necessary functions from CS PageInit
    FAM.Revaluation_CS.alertMessage = fetchMessageObj({
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
        ALERT_NOREVALDETAILS      : 'client_no_reval_det_supplied',
        LABEL_LASTDEPRPRD         : 'custpage_lastdeprperiod',
        LABEL_DEPMETHOD           : 'custpage_depmethodlbl'});
    FAM.Revaluation_CS.depMethodPeriods = FAM.Revaluation_CS.searchAllDepMethodPeriods();

    recData = getRevaluationDetails(trandata);

    if(recData.msg){
        trandata.errorCode = 1;
        trandata.errorDetails = recData.msg;
        return trandata;
    }

    //client side parameter validation
    if(trandata.writedownAmount !== undefined){
        wdAmt = +trandata.writedownAmount;
        newRV = (trandata.residualValue)? +trandata.residualValue:recData.resVal;
        fieldName = FAM.resourceManager.GetString('custpage_writedownamount', scrName);
        ret = FAM.Revaluation_CS.validateWriteDown(fieldName, wdAmt, recData.revRule, recData.currCost, recData.nbv, newRV);
        if(ret.msg){
            trandata.errorCode = 1;
            trandata.errorDetails = ret.msg;
            return trandata;
        }
        revObj.writeDown = trandata.writedownAmount;
    }

    if(trandata.residualValue !== undefined){
        newRV = +trandata.residualValue;
        wdAmt = (trandata.writedownAmount)? trandata.writedownAmount: 0;
        fieldName = FAM.resourceManager.GetString('custpage_newresidualvalue', scrName);
        oldFieldName = FAM.resourceManager.GetString('custpage_assetresidualvalue', scrName);
        ret = FAM.Revaluation_CS.validateNewResVal(fieldName, oldFieldName, newRV, wdAmt,
                recData.revRule, recData.currCost, recData.nbv, recData.resVal);
        if(ret.msg){
            trandata.errorCode = 1;
            trandata.errorDetails = ret.msg;
            return trandata;
        }
        revObj.rv = trandata.residualValue;
    }

    if(trandata.adjustedLifetime !== undefined){
        newAL = +trandata.adjustedLifetime;
        fieldName = FAM.resourceManager.GetString('custpage_newlifetime', scrName);
        oldFieldName = FAM.resourceManager.GetString('custpage_assetlifetime', scrName);
        ret.msg = FAM.Revaluation_CS.validateNewAL(newAL, fieldName, recData.lifetime, oldFieldName,
                    recData.lastDeprPrd, FAM.Revaluation_CS.alertMessage.LABEL_LASTDEPRPRD);
        if(ret.msg){
            trandata.errorCode = 1;
            trandata.errorDetails = ret.msg;
            return trandata;
        }
        revObj.life = trandata.adjustedLifetime;
    }

    if(trandata.newDepreciationMethod !== undefined){
        newDepMeth = +trandata.newDepreciationMethod;
        currPeriod = FAM.Revaluation_CS.getDepMethodPeriod(recData.depMeth);
        newPeriod = FAM.Revaluation_CS.getDepMethodPeriod(newDepMeth);
        fieldName = FAM.resourceManager.GetString('custpage_newdeprmethod', scrName);
        oldFieldName = FAM.resourceManager.GetString('custpage_assetaccmethod', scrName);

        ret.msg = FAM.Revaluation_CS.validateNewDepMethod(fieldName, oldFieldName, newDepMeth,
                    recData.depMeth, newPeriod, currPeriod);
        if(ret.msg){
            trandata.errorCode = 1;
            trandata.errorDetails = ret.msg;
            return trandata;
        }
        revObj.method = trandata.newDepreciationMethod;
    }

    //must have at least 1 field to revalue
    if(trandata.writedownAmount == undefined &&
       trandata.residualValue == undefined &&
       trandata.adjustedLifetime == undefined &&
       trandata.newDepreciationMethod == undefined){
        trandata.errorCode = 1;
        trandata.errorDetails = FAM.Revaluation_CS.alertMessage.ALERT_NOREVALDETAILS;
        return trandata;
    }

    //initialize revaluation SS
    if(trandata.taxMethodId !== undefined){
        revObj.tax = trandata.taxMethodId;
    }else if(trandata.assetId !== undefined){
        revObj.asset = trandata.assetId;
    }
    if(trandata.transactionReference !== undefined){
        revObj.Memo = trandata.transactionReference;
    }
    if(trandata.transactionDate !== undefined){
        revObj.Date = trandata.transactionDate;
    }

    assetRevSS = new FAM.Revaluation_SS({getFieldValue: function(){},
                                         getScriptParam: function(){},
                                         stateValues: revObj});
    assetRevSS.loadDeprMethodsFunctions();
    ret = assetRevSS.revalueRecord(revObj);
//  trandata.errorCode = 1;
//  ncFAR_ProcessRevaluation(trandata.assetId, assetRec.record, wdAmt,
//  newResidualValue, lifeTime, deprMethod,
//  trandata.transactionReference, trandata.transactionDate, blnUseDeprAccount);

//  trandata.errorCode = 0; /* Successful Transaction */

    return trandata;
}

function assetSplit(trandata) {
    nlapiLogExecution('DEBUG', 'Asset Split', 'Asset Id: ' + trandata.assetId);

    var arrParams = [], assetRecord = nlapiLoadRecord('customrecord_ncfar_asset', trandata.assetId),
        request = {
            getParameter : function (name) { return arrParams[name]; },
            setParameter : function (name, value) { arrParams[name] = value; },
            getMethod : function () { return 'POST'; }
        },
        response = {
            writePage : function (text) { trandata.errorDetails = text; },
            sendRedirect : function () { trandata.errorCode = 0; }
        };

    trandata.errorCode = 1;

    //set everything to request
    request.setParameter('splitquantity', trandata.splitQuantity);
    request.setParameter('custpage_assetid', trandata.assetId);
    request.setParameter('custpage_assetname', assetRecord.getFieldValue('altname'));
    request.setParameter('quantity', assetRecord.getFieldValue('custrecord_ncfar_quantity'));
    request.setParameter('custpage_assetcost', assetRecord.getFieldValue('custrecord_assetcost'));
    request.setParameter('custpage_assetcurrentcost', assetRecord.getFieldValue('custrecord_assetcurrentcost'));
    request.setParameter('custpage_assetresidualvalue', assetRecord.getFieldValue('custrecord_assetresidualvalue'));
    request.setParameter('custpage_assetbookvalue', assetRecord.getFieldValue('custrecord_assetbookvalue'));
    request.setParameter('custpage_assetdeprtodate', assetRecord.getFieldValue('custrecord_assetdeprtodate'));
    request.setParameter('custpage_assetlastdepramt', assetRecord.getFieldValue('custrecord_assetlastdepramt'));
    request.setParameter('custpage_assetdescr', assetRecord.getFieldValue('custrecord_assetdescr'));
    request.setParameter('custpage_assetserialno', assetRecord.getFieldValue('custrecord_assetserialno'));
    request.setParameter('custpage_assetalterateno', assetRecord.getFieldValue('custrecord_assetalternateno'));
    request.setParameter('custpage_assettype', assetRecord.getFieldValue('custrecord_assettype'));
    request.setParameter('custpage_assetaccmethod', assetRecord.getFieldValue('custrecord_assetaccmethod'));
    request.setParameter('custpage_assetlifetime', assetRecord.getFieldValue('custrecord_assetlifetime'));
    request.setParameter('custpage_assetcurrentage', assetRecord.getFieldValue('custrecord_assetcurrentage'));
    request.setParameter('custpage_assetdeprstartdate', assetRecord.getFieldValue('custrecord_assetdeprstartdate'));
    request.setParameter('custpage_assetlastdeprdate', assetRecord.getFieldValue('custrecord_assetlastdeprdate'));
    request.setParameter('custpage_assetdeprperiod', assetRecord.getFieldValue('custrecord_assetdeprperiod'));
    request.setParameter('custpage_assetrevisionrules', assetRecord.getFieldValue('custrecord_assetrevisionrules'));
    request.setParameter('custpage_assetstatus', assetRecord.getFieldValue('custrecord_assetstatus'));
    request.setParameter('custpage_ncactionid', 'Split');

    var Q = request.getParameter('quantity'),
        SQ = request.getParameter('splitquantity'),
        OC = request.getParameter('custpage_assetcost'),
        CC = request.getParameter('custpage_assetcurrentcost'),
        BV = request.getParameter('custpage_assetbookvalue'),
        LD = request.getParameter('custpage_assetlastdepramt'),
        RV = request.getParameter('custpage_assetresidualvalue'),
        scc = (ncParseIntNV(SQ, 0) / ncParseIntNV(Q, 1)) * ncParseFloatNV(request.getParameter('custpage_assetcurrentcost'), 0),
        SplitValues = [];

    if (!isStringEmpty(trandata.currentCost) && scc != trandata.currentCost) {
        SplitValues.OC = nlapiFormatCurrency(ncParseFloatNV(parseFloat(trandata.currentCost), 0) / ncParseFloatNV(CC, 1) * ncParseFloatNV(OC, 0));
        SplitValues.CC = nlapiFormatCurrency(ncParseFloatNV(parseFloat(trandata.currentCost), 0) / ncParseFloatNV(CC, 1) * ncParseFloatNV(CC, 0));
        SplitValues.BV = nlapiFormatCurrency(ncParseFloatNV(parseFloat(trandata.currentCost), 0) / ncParseFloatNV(CC, 1) * ncParseFloatNV(BV, 0));
        SplitValues.RV = nlapiFormatCurrency(ncParseFloatNV(parseFloat(trandata.currentCost), 0) / ncParseFloatNV(CC, 1) * ncParseFloatNV(RV, 0));
        SplitValues.LD = nlapiFormatCurrency(ncParseFloatNV(parseFloat(trandata.currentCost), 0) / ncParseFloatNV(CC, 1) * ncParseFloatNV(LD, 0));
    } else {
        SplitValues.OC = nlapiFormatCurrency(ncParseIntNV(SQ, 0) / ncParseIntNV(Q, 1) * ncParseFloatNV(OC, 0));
        SplitValues.CC = nlapiFormatCurrency(ncParseIntNV(SQ, 0) / ncParseIntNV(Q, 1) * ncParseFloatNV(CC, 0));
        SplitValues.BV = nlapiFormatCurrency(ncParseIntNV(SQ, 0) / ncParseIntNV(Q, 1) * ncParseFloatNV(BV, 0));
        SplitValues.RV = nlapiFormatCurrency(ncParseIntNV(SQ, 0) / ncParseIntNV(Q, 1) * ncParseFloatNV(RV, 0));
        SplitValues.LD = nlapiFormatCurrency(ncParseIntNV(SQ, 0) / ncParseIntNV(Q, 1) * ncParseFloatNV(LD, 0));
    }
    SplitValues.SQ = SQ;
    SplitValues.TD = nlapiFormatCurrency(((SplitValues.CC * 100) - (SplitValues.BV * 100)) / 100);

    request.setParameter('am_currentcost', trandata.currentCost != '' ? trandata.currentCost : SplitValues.CC);
    request.setParameter('am_originalcost', trandata.originalCost != '' ? trandata.originalCost : SplitValues.OC);
    request.setParameter('am_residualvalue', trandata.residualValue != '' ? trandata.residualValue : SplitValues.RV);
    request.setParameter('am_netbookvalue', trandata.netBookValue != '' ? trandata.netBookValue : SplitValues.BV);
    request.setParameter('am_deprtodate', trandata.deprToDate != '' ? trandata.deprToDate : SplitValues.TD);
    request.setParameter('am_lastdepramt', trandata.lastDeprAmt != '' ? trandata.lastDeprAmt : SplitValues.LD);
    request.setParameter('am_quantity', trandata.splitQuantity);

    if (parseInt(trandata.splitQuantity) < parseInt(Q)) {
        ncFAR_SplitSL(request, response);
    }
    else {
        trandata.errorDetails = 'Split quantity (' + trandata.splitQuantity  + ') is greater than available quantity (' + Q + ').';
    }

    return trandata;
}

/**
 *
 * @param trandata
 * assetId             Required            Internal Id of the Asset to be disposed of
 * disposalDate        Required            Posting date for disposal
 * disposalType        Required            Indicates the type of Asset Disposal. Could be one of the following:
 *                                         �   1 � for �Sale� disposal type
 *                                         �   2 � for �Write Off� disposal type
 *                                         *For scripting purposes, the custom list � FAM - Disposal Type (customlist_ncfar_disposaltype) can be used
 * quantityDisposed    Required            Number of units to dispose
 * saleItem            Required on Sale    The sale item that will appear on the invoice
 * customer            Required on Sale    The customer in which the asset is being sold to
 * salesAmount         Required on Sale    The price at which the asset will be sold
 * taxcode             Required on Sale    The tax code that applies to this sale
 * @returns trandata
 */

function assetDisposal(trandata) {
    nlapiLogExecution('DEBUG', 'Asset Disposal', JSON.stringify(trandata));
    trandata = validateDisposalData(trandata);

    if(!trandata.errorCode){
        trandata = callDisposalBGP(trandata);
    }
    return trandata;
}


function validateDisposalData(trandata) {
    var ret = {}, errParam = [], origAssetVals, lastDeprDate;

    FAM.Disposal_CS.isMultiLocInvt = FAM.Context.blnMultiLocInvt;
    FAM.Disposal_CS.isPrefLocMandatory = FAM.Context.blnLocMandatory;

    origAssetVals = nlapiLookupField('customrecord_ncfar_asset', trandata.assetId,
                                     ['custrecord_assetsubsidiary',
                                      'custrecord_assetstatus',
                                      'custrecord_assetlastdeprdate',
                                      'custrecord_ncfar_quantity',
                                      'custrecord_assetlocation']);

    //perform necessary functions from CS PageInit
    FAM.Disposal_CS.alertMessage = fetchMessageObj({
        ALERT_NOASSETID       : 'client_disposal_plugin_no_assetid',
        ALERT_INVALIDTYPE     : 'client_disposal_plugin_invalid_type',
        ALERT_PLEASEENTER     : 'client_enter_value',
        ALERT_ALREADYDISPOSED : 'client_disposal_alreadydisposed',
        ALERT_SUBSIDIARYMATCH : 'client_subsidiary_match',
        ALERT_BGPEXISTS       : 'client_disposal_bgpexists',
        ALERT_ACCTNOTEXIST    : 'client_disposal_acctnotexist',
        ALERT_EARLIERTHANLDD  : 'client_disposal_dateearlierthanldd',
        ALERT_SALEAMTPOSITIVE : 'client_disposal_saleamountgreater',
        ALERT_DISPQTYGREATER  : 'client_disposal_cannotbegreater',
        ALERT_ZEROVAL         : 'client_greater_than_zerovalue'});

    if (!trandata.assetId) {
        trandata.errorCode = 1;
        trandata.errorDetails = FAM.Disposal_CS.alertMessage.ALERT_NOASSETID;
        return trandata;
    }

    if(trandata.disposalType == '1'){
        if(!trandata.saleItem)
            errParam.push(FAM.resourceManager.GetString('custpage_disposalitem','assetdisposal'));
        if(!trandata.customer)
            errParam.push(FAM.resourceManager.GetString('custpage_customer','assetdisposal'));
        if(!trandata.salesAmount)
            errParam.push(FAM.resourceManager.GetString('custpage_salesamount','assetdisposal'));
        if(!origAssetVals.custrecord_assetlocation && FAM.Disposal_CS.isLocationMandatory(FAM.DisposalType['Sale']))
            errParam.push(FAM.resourceManager.GetString('custpage_filterslocation','assetdisposal'));
    }else if(trandata.disposalType == '2'){
        if(!origAssetVals.custrecord_assetlocation && FAM.Disposal_CS.isLocationMandatory(FAM.DisposalType['Write Off']))
            errParam.push(FAM.resourceManager.GetString('custpage_filterslocation','assetdisposal'));
    }else{
        trandata.errorCode = 1;
        trandata.errorDetails = FAM.Util_Shared.String.injectMessageParameter(FAM.Disposal_CS.alertMessage.ALERT_INVALIDTYPE,[trandata.assetId]);
        return trandata;
    }

    if(errParam.length) {
        trandata.errorCode = 1;
        trandata.errorDetails = FAM.Util_Shared.String.injectMessageParameter(FAM.Disposal_CS.alertMessage.ALERT_PLEASEENTER,
                [errParam.join(', ')]);
        return trandata;
    }
    var arrDuplicate = FAM.Disposal_CS.checkDuplicateBGP();
    if (arrDuplicate.length) {
        trandata.errorCode = 1;
        trandata.errorDetails = FAM.Disposal_CS.alertMessage.ALERT_BGPEXISTS;
        return trandata;
    }
    lastDeprDate = getLastDeprDate(trandata.assetId, origAssetVals.custrecord_assetlastdeprdate);
    var dd = nlapiStringToDate(trandata.disposalDate).getTime();
    var ldd = nlapiStringToDate(lastDeprDate).getTime();
    ret = FAM.Disposal_CS.validateDisposalDate(dd, ldd);
    if(!ret){
        trandata.errorCode = 1;
        trandata.errorDetails = FAM.Util_Shared.String.injectMessageParameter(FAM.Disposal_CS.alertMessage.ALERT_EARLIERTHANLDD,
                                    [nlapiDateToString(new Date(dd)), nlapiDateToString(new Date(ldd))]);;
        return trandata;
    }

    if(trandata.disposalType == '1'){
        ret = validateSalesAmount(trandata.salesAmount);
        if(ret.msg){
            trandata.errorCode = 1;
            trandata.errorDetails = ret.msg;
            return trandata;
        }
    }

    ret = validateDisposalQuantity(trandata.quantityDisposed,
                                       origAssetVals.custrecord_ncfar_quantity,
                                       FAM.resourceManager.GetString('custpage_assetquantdisposed','assetdisposal'));
    if(ret.msg){
        trandata.errorCode = 1;
        trandata.errorDetails = ret.msg;
        return trandata;
    }
    trandata.errorCode = 0;
    trandata.location = origAssetVals.custrecord_assetlocation;
    return trandata;
}

//Local copy of validation, new validation can be found on FAM_Disposal_CS.validateSalesAmount
function validateSalesAmount(saleAmt){
    var retVal = {};
    if(saleAmt <= 0){
        retVal.msg = FAM.Disposal_CS.alertMessage.ALERT_SALEAMTPOSITIVE;
    }

    return retVal;
};

//Local copy of validation, new validation can be found on FAM_Disposal_CS.validateLineItem
function validateDisposalQuantity(dispQty, assetQty, dispQtyLbl){
    var retVal = {};
    if(dispQty > assetQty){
        retVal.msg = FAM.Disposal_CS.alertMessage.ALERT_DISPQTYGREATER;
    }else if (dispQty <= 0){
        retVal.msg = FAM.Util_Shared.String.injectMessageParameter(FAM.Disposal_CS.alertMessage.ALERT_ZEROVAL, [dispQtyLbl]);
    }
    return retVal;
};

function callDisposalBGP(trandata) {
    var BGP = new FAM.BGProcess(),
        procToRun = "assetDisposal",
        processIdMap = {},
        userId = FAM.Context.userId,
        responseStr;

    var stateValues = {
        inv : 'F', //Default to false
        prmt : FAM.Context.getPermission("TRAN_JOURNALAPPRV") //get journal approval permission
    };
    stateValues[trandata['assetId']] = {
            'date': nlapiStringToDate(trandata['disposalDate']).getTime(),
            'type': parseInt(trandata['disposalType'], 10),
            'qty' : trandata['quantityDisposed'],
            'item': trandata['saleItem'],
            'cust': trandata['customer'],
            'amt' : trandata['salesAmount'],
            'tax' : trandata['taxcode'],
            'loc' : trandata['location']};

    // Create BGP for Asset Disposal
    var bgpParam = {
        status          : FAM.BGProcessStatus.Queued,
        func_name       : "customscript_fam_mr_disposal",
        proc_name       : "Asset Disposal",
        state           : JSON.stringify(stateValues)};
    if( userId!=-4){
        bgpParam.user = userId;
    }
    BGP.createRecord(bgpParam);
    processIdMap.assetDisposal = BGP.submitRecord();

    // Create BGP for Updating Compound Asset
    bgpParam = {
        status          : FAM.BGProcessStatus.Queued,
        func_name       : "customscript_fam_updatecompound_mr",
        proc_name       : "Update Compound Asset"};
    if( userId!=-4){
        bgpParam.user = userId;
    }
    BGP.createRecord(bgpParam);
    processIdMap.updateCompoundAsset = BGP.submitRecord();

    responseStr = BGP.invoke(processIdMap[procToRun]).getBody();

    if (responseStr == null) {
        responseStr = BGP.getFieldValue('message') + ': Unexpected error while scheduling script';
        BGP.submitField({
            status  : BGP.getStatusId('Failed'),
            message : responseStr});
        trandata.errorCode = 1;
        trandata.errorDetails = responseStr;
    }
    trandata.errorCode = 0;
    return trandata;
};

function fetchMessageObj(msgObj){
    var msgId, scrName = 'clientpage';
    for(var s in msgObj) {
        msgId = msgObj[s];
        msgObj[s] = FAM.resourceManager.GetString(msgId, scrName);
    }
    return msgObj;
}

function getRevaluationDetails(trandata){

    var recObj = {}, recData = {};
    if(trandata.taxMethodId !== undefined){
        recObj = new FAM.AltDeprMethod_Record();
        try{
            recObj.loadRecord(trandata.taxMethodId);
            recData.currCost     = recObj.getFieldValue('current_cost');
            recData.nbv          = recObj.getFieldValue('book_value');
            recData.resVal       = recObj.getFieldValue('residual_value');
            recData.lifetime     = recObj.getFieldValue('asset_life');
            recData.depMeth      = recObj.getFieldValue('depr_method');
            recData.revRule      = recObj.getFieldValue('revision_rules');
            recData.lastDeprPrd  = recObj.getFieldValue('last_depr_period');
            recData.lastDeprDate = recObj.getFieldValue('last_depr_date');
            recData.assetId      = recObj.getFieldValue('parent_asset');

            if(trandata.assetId && trandata.assetId!=recData.assetId){
                recData.msg = FAM.resourceManager.GetString('custpage_plugin_not_parent_asset', 'assetrevaluation');
            }
        }
        catch(e){
            recData.msg = e.toString();
        }
    }else if(trandata.assetId !== undefined){
        recObj = new FAM.Asset_Record();
        try{
            recObj.loadRecord(trandata.assetId);
            recData.currCost     = recObj.getFieldValue('current_cost');
            recData.nbv          = recObj.getFieldValue('book_value');
            recData.resVal       = recObj.getFieldValue('rv');
            recData.lifetime     = recObj.getFieldValue('lifetime');
            recData.depMeth      = recObj.getFieldValue('depr_method');
            recData.revRule      = recObj.getFieldValue('revision_rules');
            recData.lastDeprPrd  = recObj.getFieldValue('last_depr_period');
            recData.lastDeprDate = recObj.getFieldValue('last_depr_date');
        }
        catch(e){
            recData.msg = e.toString();
        }
    }else{
        recData.msg = FAM.resourceManager.GetString('custpage_no_tax_or_asset', 'assetrevaluation');
    }

    return recData;
}

function getLastDeprDate(assetId, assetLDD){
    var taxLDD, recLDD = assetLDD, fSearch = new FAM.Search(new FAM.AltDeprMethod_Record());

    fSearch.addFilter('isinactive', null, 'is', 'F');
    fSearch.addFilter('parent_asset', null, 'is', assetId);
    fSearch.addColumn('last_depr_date', null, 'max');

    fSearch.run();

    taxLDD = fSearch.getValue(0,'last_depr_date',null,'max');

    if(taxLDD && nlapiStringToDate(taxLDD).getTime()>nlapiStringToDate(recLDD).getTime()){
        recLDD = taxLDD;
    }

    return recLDD;
}
