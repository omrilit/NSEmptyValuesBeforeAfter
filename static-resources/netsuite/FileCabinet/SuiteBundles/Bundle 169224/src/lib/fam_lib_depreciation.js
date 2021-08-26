/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 */

define([
    '../adapter/fam_adapter_error',
    '../adapter/fam_adapter_format',
    '../adapter/fam_adapter_record',
    '../adapter/fam_adapter_search',
    '../const/fam_const_customlist',
    '../util/fam_util_accounting',
    '../util/fam_util_currency',
    '../util/fam_util_deprmethods',
    '../util/fam_util_envcfg',
    '../util/fam_util_log',
    '../util/fam_util_math',
    '../util/fam_util_subsidiary',
    '../util/fam_util_systemsetup',
    '../util/fam_util_translator'
], depreciate);

/**
 * Functions copied from AssetDepreciation.js to compute for depreciation values
 * 
 * @param error
 * @param formatter
 * @param search
 * @param fConst
 * @param fCurrency
 * @param fDeprMethods
 * @param fEnv
 * @param fLog
 * @param fMath
 * @param fSubsidiary
 * @param fSystemSetup
 * @param fTranslator
 * @returns {___anonymous689_804}
 */
function depreciate(error, formatter, record, search, fConst, utilAccntng, fCurrency, fDeprMethods, fEnv,
    fLog, fMath, fSubsidiary, fSystemSetup, fTranslator) {
        
    const FORMAT_TYPE = formatter.getType();
    var FAM_Depreciation = {
        followAcctPer : false,
        periodCache : {},
        periodError : {},
        periodInfo : null,
        deprPeriods : {}
    };
    
    /**
     * Depreciates a Record (asset or tax method) based on the date passed
     *
     * Parameters:
     *     recordObj {object} - record to be depreciated, with the following fields:
     *         assetId {number} - Asset Id
     *         taxId {number} - Tax Method Id
     *         origCost {number} - Original Cost
     *         currCost {number} - Current Cost
     *         resValue {number} - Residual Value
     *         lifetime {number} - record Lifetime
     *         periodCon {number} - Id of the Period Convention selected
     *         deprStart {string} - Depreciation Start Date
     *         annualMet {number} - Id of the Annual Method Entry selected
     *         fiscalYr {number} - Id of the Month Name selected
     *         lastPeriod {number} - Last Depreciation Period
     *         currNBV {number} - Current Net Book Value
     *         lastDepAmt {number} - Last Depreciation Amount
     *         priorNBV {number} - Prior Year Net Book Value
     *         lifeUsage {number} - Asset Lifetime Usage
     *         subsidiary {number} - Subsidiary
     *         currId {number} - Currency ID
     *         cumDepr {number} - Cumulative Depreciation
     *         assetType {number} - Asset Type
     *         quantity {number} - Quantity
     *         deprRule {number} - Depreciation Rule
     *         lastDate {string} - Last Depreciation Date
     *         deprMethod {number} - Depreciation Method
     *         convention {number} - Convention
     *         deprPeriod {number} - Depreciation Period
     *     deprEndDate {Date} - date up to which the record will be depreciated
     *     deprStartDate {Date} - date from which the record will be depreciated
     * Returns:
     *     {object} - contains the field values for depreciation of the record
    **/
    FAM_Depreciation.depreciateRecord = function (recordObj, deprEndDate, deprStartDate, periodLimit, grpMasterInfo) {
        fLog.startMethod('FAM_Depreciation.depreciateRecord');
        fLog.debug('depreciation info', 'recordObj: ' + JSON.stringify(recordObj) + ', deprEndDate: ' + deprEndDate + ', deprStartDate' + deprStartDate);
        this.followAcctPer = fSystemSetup.getSetting('isFollowAcctngPeriod');
        
        var ret = {}, nextDate, deprAmount, periods = 0;
        try {
            this.setDefaults(recordObj, grpMasterInfo);
            this.validateFields(recordObj);
            var prcn = fCurrency.getPrecision(recordObj.currId);
            recordObj.realLifetime = this.getActualLifetime(recordObj);
            
            if (!deprStartDate) {
                deprStartDate = recordObj.lastDate; // start from last depreciation date
            }
            
            while (this.isStillWithinDateRange(recordObj.lastDate, deprEndDate) &&
                recordObj.lastPeriod < recordObj.realLifetime &&
                (!periodLimit || periods < periodLimit)) {
                
                nextDate = this.getNextDeprDate(recordObj);
                if (deprEndDate && nextDate.getTime() > deprEndDate.getTime()) {
                    break;
                }
                
                var key = formatter.format({
                    value: nextDate,
                    type: FORMAT_TYPE.DATE
                });
                
                fLog.pushLog('depreciating for ' + key);
                deprAmount = this.computeNextDepreciation(recordObj, nextDate, prcn);
                var nbv = fMath.roundByPrecision(+(recordObj.currNBV - deprAmount), prcn);

                recordObj.lastPeriod++;
                recordObj.lastDate = nextDate;
                recordObj.lastDepAmt = deprAmount;
                recordObj.cumDepr = fMath.roundByPrecision(+(recordObj.cumDepr + deprAmount), prcn);
                recordObj.currNBV = fMath.roundByPrecision(+(recordObj.currNBV - deprAmount), prcn);
                
                if (this.getRelativeMonth(nextDate, recordObj.fiscalYr) === 11) {
                    recordObj.priorNBV = recordObj.currNBV;
                }
                
                // only write key if within range of given start and end dates 
                if (nextDate.getTime() > deprStartDate.getTime()) {
                    ret[key] = {
                        amount: deprAmount,
                        nbv: nbv,
                        pnbv: recordObj.priorNBV,
                        lastPeriod: recordObj.lastPeriod
                    };
                    periods++;
                }
            }
            
            if (recordObj.lastPeriod >= recordObj.realLifetime) {
                recordObj.forecastStatus = fConst.ForecastStatus.Completed;
            }
        }
        catch (e) {
            fLog.pushLog('Unhandled Exception: ' + JSON.stringify(e)/*FAM_Util.printStackTrace(e)*/, 'ERROR');
            fLog.flushLog();

            ret.error = e;
        }
        fLog.endMethod();
        return ret;
    };

    /**
     * Substitutes blank fields with default values
     *
     * Parameters:
     *     recObj {object} - record object to be depreciated
     * Returns:
     *     void
    **/
    FAM_Depreciation.setDefaults = function (recordObj, grpMasterInfo) {
        fLog.startMethod('FAM_Depreciation.setDefaults');
        
        var firstDeprMet;

        recordObj.assetId = +recordObj.assetId || 0;
        recordObj.taxId = +recordObj.taxId || 0;
        recordObj.altMethod = +recordObj.altMethod || 0;
        recordObj.origCost = +recordObj.origCost || 0;
        recordObj.currCost = +recordObj.currCost || recordObj.origCost;
        recordObj.resValue = +recordObj.resValue || 0;
        recordObj.lifetime = +recordObj.lifetime || 0;
        recordObj.periodCon = +recordObj.periodCon || fConst.PeriodConvention['12m of 30d'];
        recordObj.deprStart = formatter.parse({
            value: recordObj.deprStart,
            type: FORMAT_TYPE.DATE
        });
        recordObj.annualMet = +recordObj.annualMet || fConst.AnnualMethodEntry['Fiscal Year'];
        recordObj.lastPeriod = +recordObj.lastPeriod || 0;
        recordObj.currNBV = +recordObj.currNBV || 0;
        recordObj.lastDepAmt = +recordObj.lastDepAmt || 0;
        recordObj.priorNBV = +recordObj.priorNBV || recordObj.origCost;
        recordObj.currUsage = 0;
        recordObj.lifeUsage = +recordObj.lifeUsage || 0;
        recordObj.cumDepr = recordObj.currCost - recordObj.currNBV;
        recordObj.assetType = +recordObj.assetType || 0;
        recordObj.quantity = +recordObj.quantity || 0;
        recordObj.deprRule = +recordObj.deprRule || fConst.DepreciationRules.Acquisition;
        recordObj.lastDate = recordObj.lastDate || new Date(1980, 0, 1);
        recordObj.lastDate = formatter.parse({
            value: recordObj.lastDate,
            type: FORMAT_TYPE.DATE
        });
        recordObj.deprMethod = +recordObj.deprMethod || 0;
        recordObj.convention = +recordObj.convention || fConst.Conventions.None;
        recordObj.deprPeriod = +recordObj.deprPeriod || fConst.DeprPeriod.Monthly;
        recordObj.bookId = +recordObj.bookId || 0;
        
        if (recordObj.deprPeriod === fConst.DeprPeriod.Annually) {
            recordObj.deprEnd = new Date(recordObj.deprStart.getFullYear() + recordObj.lifetime,
                recordObj.deprStart.getMonth(), recordObj.deprStart.getDate() - 1);
        }
        else {
            recordObj.deprEnd = new Date(recordObj.deprStart.getFullYear(),
                recordObj.deprStart.getMonth() + recordObj.lifetime, recordObj.deprStart.getDate() - 1);
        }
        if (recordObj.annualMet === fConst.AnnualMethodEntry['Anniversary']) {
            recordObj.fiscalYr = recordObj.deprStart.getMonth() + 1;
        }
        else { // Fiscal Year and the default value           
            recordObj.fiscalYr = +recordObj.fiscalYr || fConst.MonthNames.January;
        }
        if (fEnv.isOneWorld()) {
            recordObj.subsidiary = +recordObj.subsidiary || 0;
        }
        else {
            recordObj.subsidiary = 0;
        }
        if (!recordObj.currId) {
            recordObj.currId = utilAccntng.getApplicableCurrency(recordObj.subsidiary, recordObj.bookId);
        }

        recordObj.fixedRate = 1;
        // check for DH variable in the depreciation formula
        firstDeprMet = fDeprMethods.getDeprMethod(recordObj.deprMethod, 1);
        recordObj.hasDH = firstDeprMet.formula.toUpperCase().indexOf('DH') !== -1;
                
        // group depreciation
        if (recordObj.isGrpDepr && recordObj.isGrpMaster) {
            if (grpMasterInfo[recordObj.subsidiary] &&
                grpMasterInfo[recordObj.subsidiary][recordObj.altMethod]) {

                recordObj.groupInfo = grpMasterInfo[recordObj.subsidiary][recordObj.altMethod];
            }
            else {
                throw 'No Data for Group Depreciation';
            }

            if (recordObj.currNBV === 0) {
                recordObj.currNBV = +recordObj.groupInfo.NB || 0;
            }
            if (recordObj.priorNBV === 0) {
                recordObj.priorNBV = +recordObj.groupInfo.PB || +recordObj.groupInfo.OC || 0;
            }

            recordObj.origCost = +recordObj.groupInfo.OC || 0;
            recordObj.currCost = +recordObj.groupInfo.CC || 0;
            recordObj.lifetime = +recordObj.groupInfo.AL;
        }
        fLog.endMethod();
    };
    
    /**
     * Validates record fields to prevent depreciation errors
     *
     * Parameters:
     *     recordObj {object} - record object to be depreciated
     * Returns:
     *     void
     * Throws:
     *     Invalid Data Errors
    **/
    FAM_Depreciation.validateFields = function (recordObj) {
        fLog.startMethod('FAM_Depreciation.validateFields');

        var arrNegative = [];

        if (!fSystemSetup.getSetting('isAllowNegativeCost')) {
            if (recordObj.origCost < 0) {
                arrNegative.push(fTranslator.getString('custpage_assetcost', 'assetsplit'));
            }
            if (recordObj.currCost < 0) {
                arrNegative.push(fTranslator.getString('custpage_assetcurrentcost', 'assetsplit'));
            }
            if (recordObj.resValue < 0) {
                arrNegative.push(fTranslator.getString('custpage_assetresidualvalue', 'assetsplit'));
            }

            if (arrNegative.length > 0) {
                throw error.create({
                    name: 'INVALID_DATA',
                    message: fTranslator.getString('client_assetrecord_notnegative', 'clientpage', [arrNegative.join(', ')])
                });
            }
        }
        
        //validate accounts if valid for rec subsidiary. 
        if (recordObj.subsidiary && !(recordObj.taxId && !recordObj.bookId)){//do not validate for tax methods without accounting books
            if (recordObj.chargeAcc && !fSubsidiary.compareCDLSubsidiary(
                                            'account', 
                                            recordObj.chargeAcc, 
                                            recordObj.subsidiary)){
                var assetId = recordObj.assetId + (recordObj.taxId?', Tax Method Id: ' + recordObj.taxId:'');
                throw error.create({
                    name: 'INVALID_DATA',
                    message: fTranslator.getString('custpage_invalid_acctsub_combo', null, ['Charge', assetId]) 
                });
            }
            
            if (recordObj.deprAcc && !fSubsidiary.compareCDLSubsidiary(
                                            'account', 
                                            recordObj.deprAcc, 
                                            recordObj.subsidiary)){
                var assetId = recordObj.assetId + (recordObj.taxId?', Tax Method Id: ' + recordObj.taxId:'');
                throw error.create({
                    name: 'INVALID_DATA',
                    message: fTranslator.getString('custpage_invalid_acctsub_combo', null, ['Depreciation', assetId]) 
                });
            }
        }
        
        fLog.endMethod();
    };
    
    /**
     * Acquires the actual lifetime of the given record
     *
     * Parameters:
     *     recordObj {object} - record object to be depreciated
     * Returns:
     *     {number} - actual lifetime of the record
    **/
    FAM_Depreciation.getActualLifetime = function (recordObj) {
        fLog.startMethod('FAM_Depreciation.getActualLifetime');

        var ret = recordObj.lifetime;

        if (ret === 0) {
            // do nothing
            // this condition is in place simply to stop any processing when condition is met
            // future conditions that will adjust the lifetime should provide another else-if block
        }
        else if (recordObj.hasDH) {
            if (recordObj.deprPeriod === fConst.DeprPeriod.Monthly && recordObj.deprStart.getDate() > 1) {
                ret++;
            }
            else if (recordObj.deprPeriod === fConst.DeprPeriod.Annually &&
                (recordObj.deprStart.getDate() > 1 ||
                recordObj.deprStart.getMonth() + 1 !== recordObj.fiscalYr)) {

                ret++;
            }
        }
        else if (recordObj.convention !== fConst.Conventions.None) {
            ret++;
        }
        else if (recordObj.deprPeriod === fConst.DeprPeriod.Monthly) {
            if (recordObj.deprRule === fConst.DepreciationRules['Pro-rata']) {
                var firstDayOfMonth = 1;
                if(this.followAcctPer) { //Override first day if 4-4-5
                    var currPeriodInfo = this.getInclusivePeriod(recordObj.deprStart);
                    firstDayOfMonth = currPeriodInfo.startDate.getDate();
                }
                if(recordObj.deprStart.getDate() !== firstDayOfMonth) {
                    ret++;
                }
            }
        }
        else if (recordObj.deprPeriod === fConst.DeprPeriod.Annually) {
            if (recordObj.deprRule === fConst.DepreciationRules.Acquisition &&
                recordObj.deprStart.getMonth() + 1 !== recordObj.fiscalYr) {

                ret++;
            }
            else if (recordObj.deprRule === fConst.DepreciationRules.Disposal &&
                recordObj.deprStart.getMonth() + 2 !== recordObj.fiscalYr) {

                ret++;
            }
            else if (recordObj.deprRule === fConst.DepreciationRules['Pro-rata'] &&
                (recordObj.deprStart.getDate() > 1 ||
                recordObj.deprStart.getMonth() + 1 !== recordObj.fiscalYr)) {

                ret++;
            }
            else if (recordObj.deprRule === fConst.DepreciationRules['Mid-month']) {
                if (recordObj.deprStart.getDate() < 16 &&
                    recordObj.deprStart.getMonth() + 1 !== recordObj.fiscalYr) {

                    ret++;
                }
                else if (recordObj.deprStart.getDate() > 15 &&
                    recordObj.deprStart.getMonth() + 2 !== recordObj.fiscalYr) {

                    ret++;
                }
            }
        }

        fLog.endMethod();
        return ret;
    };

    /**
     * Acquires the next depreciation date for the given record
     *
     * Parameters:
     *     recordObj {object} - record object to be depreciated
     * Returns:
     *     {Date} - date when the record will be depreciated next
    **/
    FAM_Depreciation.getNextDeprDate = function (recordObj) {
        fLog.startMethod('FAM_Depreciation.getNextDeprDate');

        var ret;
        if(!this.followAcctPer || recordObj.deprPeriod === fConst.DeprPeriod.Annually){
            if (recordObj.lastPeriod === 0) {
                ret = recordObj.deprStart;

                if (recordObj.deprPeriod === fConst.DeprPeriod.Annually) {
                    if (recordObj.convention === fConst.Conventions.None && !recordObj.hasDH &&
                        (recordObj.deprRule === fConst.DepreciationRules['Disposal'] ||
                        (recordObj.deprRule === fConst.DepreciationRules['Mid-month'] &&
                        recordObj.deprStart.getDate() > 15))) {

                        // depreciation will start on the next month
                        ret = new Date(ret.getFullYear(), ret.getMonth() + 2, 0);
                    }

                    // depreciation date will be the last day of the last month of the current fiscal year
                    if (ret.getMonth() + 1 >= recordObj.fiscalYr) {
                        ret = new Date(ret.getFullYear() + 1, recordObj.fiscalYr - 1, 0);
                    }
                    else {
                        ret = new Date(ret.getFullYear(), recordObj.fiscalYr - 1, 0);
                    }
                }
                else {
                    if (recordObj.convention === fConst.Conventions.None && !recordObj.hasDH &&
                        (recordObj.deprRule === fConst.DepreciationRules['Disposal'] ||
                        (recordObj.deprRule === fConst.DepreciationRules['Mid-month'] &&
                        recordObj.deprStart.getDate() > 15))) {

                        // next depreciation date will be the last day of the next month
                        ret = new Date(ret.getFullYear(), ret.getMonth() + 2, 0);
                    }
                    else {
                        // next depreciation date will be the last day of the month
                        ret = new Date(ret.getFullYear(), ret.getMonth() + 1, 0);
                    }
                }
            }
            else {
                ret = recordObj.lastDate;

                if (recordObj.deprPeriod === fConst.DeprPeriod.Annually) {
                    // next depreciation date will be the last day of the last month of the next fiscal year
                    ret = new Date(ret.getFullYear() + 1, ret.getMonth() + 1, 0);
                }
                else {
                    // next depreciation date will be the last day of the next month
                    ret = new Date(ret.getFullYear(), ret.getMonth() + 2, 0);
                }
            }
        }
        else{ //follow accounting period scheme - // TODO: fix when 4-4-5 will be supported
            var currPeriodInfo;
            if (recordObj.lastPeriod === 0) {
                ret = recordObj.deprStart;
                currPeriodInfo = this.getInclusivePeriod(ret);
                //check if deprStart is on 2nd half of period (startdate + 15 days)
                if (!recordObj.hasDH &&
                    (recordObj.deprRule === fConst.DepreciationRules['Disposal'] ||
                    (recordObj.deprRule === fConst.DepreciationRules['Mid-month'] &&
                         new Date(ret.getFullYear(),
                                  ret.getMonth(),
                                  ret.getDate()).getTime() >=
                         new Date(currPeriodInfo.startDate.getFullYear(),
                                  currPeriodInfo.startDate.getMonth(),
                                  currPeriodInfo.startDate.getDate()+15).getTime()))) {

                        //get next period info
                    currPeriodInfo = this.getInclusivePeriod(new Date(currPeriodInfo.endDate.getFullYear(),
                                                                      currPeriodInfo.endDate.getMonth(),
                                                                      currPeriodInfo.endDate.getDate() + 1));
                }
            }
            else {
                ret = recordObj.lastDate;
                //get next period info
                currPeriodInfo = this.getInclusivePeriod(new Date(ret.getFullYear(),
                                                                  ret.getMonth(),
                                                                  ret.getDate() + 1));
            }
            ret = currPeriodInfo.endDate;
        }


        fLog.endMethod();
        return ret;
    };
    
    /**
     * Retrieves the current usage of the asset
     *
     * Parameters:
     *     assetId {number} - Internal Id of the Asset to be depreciated
     *     startDate {Date} - start date of the period to check
     *     endDate {Date} - end date of the period to check
     * Returns:
     *     {number} - current usage of the asset for the given period
    **/
    FAM_Depreciation.getCurrentUsage = function (assetId, startDate, endDate) {
        fLog.startMethod('FAM_Depreciation.getCurrentUsage');
        var usageDateRange = [formatter.format({ value: startDate,
                                                 type: FORMAT_TYPE.DATE }), 
                              formatter.format({ value: endDate,
                                                 type: FORMAT_TYPE.DATE })];
        
        var ret = 0;
        var searchObj = search.create({
            type: 'customrecord_ncfar_assetusage',
            filters: [
                search.createFilter({ name: 'custrecord_usageassetid', operator: 'is', values: assetId }),
                search.createFilter({ name: 'custrecord_usagedate', operator: 'within', values: usageDateRange})
            ],
            columns: [
                search.createColumn({ name: 'custrecord_usageunits', summary: search.getSummary().SUM })
            ]
        });

        var searchRes = searchObj.run().getRange(0, 1);
        if (searchRes.length > 0) {
            ret = +searchRes[0].getValue({ name: 'custrecord_usageunits', summary: search.getSummary().SUM }) || 0;
        }

        fLog.endMethod();
        return ret;
    };

    /**
     * Calculates the next depreciation amount for the given record
     *
     * Parameters:
     *     recordObj {object} - record object to be depreciated
     *     nextDate {Date} - date when the record will be depreciated next
     * Returns:
     *     {number} - next depreciation amount
    **/
    FAM_Depreciation.computeNextDepreciation = function (recordObj, nextDate, prcn) {
        fLog.startMethod('FAM_Depreciation.computeNextDepreciation');
        
        var ret, checkSign, recordValues, prFactor = 1, startPeriod, endPeriod, cpFactor = 1,
            nextDeprMet = fDeprMethods.getDeprMethod(recordObj.deprMethod, recordObj.lastPeriod + 1),
            finPeriodCon = +nextDeprMet.final_convention ||
                fConst.FinalPeriodCon['Fully Depreciate'];

        if (recordObj.currNBV === recordObj.resValue) {
            ret = 0;
        }
        else if (recordObj.lastPeriod + 1 === recordObj.realLifetime &&
            finPeriodCon === fConst.FinalPeriodCon['Fully Depreciate']) {
            ret = recordObj.currNBV - recordObj.resValue;
        }
        else {
            //lastdate and startdate is equal if set to last day of the month
            if (recordObj.lastDate.getTime() >= recordObj.deprStart.getTime()) {
                startPeriod = new Date(recordObj.lastDate.getFullYear(), recordObj.lastDate.getMonth(),
                    recordObj.lastDate.getDate() + 1);
            }
            else {
                startPeriod = recordObj.deprStart;
            }
            endPeriod = new Date(Math.min(nextDate.getTime(), recordObj.deprEnd.getTime()));

            if (recordObj.lifeUsage > 0 &&
                nextDeprMet.formula.toUpperCase().indexOf('CU') !== -1) {

                recordObj.currUsage = this.getCurrentUsage(recordObj.assetId, startPeriod, endPeriod);
            }

            if (nextDeprMet.formula.toUpperCase().indexOf('DH') === -1 &&
                (recordObj.convention !== fConst.Conventions.None ||
                recordObj.deprRule === fConst.DepreciationRules['Pro-rata'])) {
                prFactor = this.getProRataFactor(recordObj);
                if (recordObj.lastPeriod > 0) {
                    cpFactor = prFactor;
                    if(recordObj.lastPeriod + 1 < recordObj.realLifetime) {
                        prFactor = 1;
                    }
                    else if (recordObj.lastPeriod + 1 === recordObj.realLifetime && prFactor !== 1) {
                        prFactor = 1 - prFactor; // last period so reverse
                    }
                }
            }

            // will be used to check depreciation amount against residual value
            checkSign = (recordObj.origCost / Math.abs(recordObj.origCost)) || 1;

            recordValues = {
                OC : recordObj.origCost,
                NB : recordObj.currNBV,
                RV : recordObj.resValue,
                AL : recordObj.lifetime,
                CP : recordObj.lastPeriod + cpFactor,
                TD : recordObj.origCost - recordObj.resValue,
                CU : recordObj.currUsage,
                LU : recordObj.lifeUsage,
                LD : recordObj.lastDepAmt,
                CC : recordObj.currCost,
                DH : this.getDaysHeld(startPeriod, endPeriod),
                PB : recordObj.priorNBV,
                DP : this.getDaysInPeriod(nextDate),
                FY : this.getDaysInFiscalYear(nextDate, recordObj.fiscalYr, true)
            };

            ret = fDeprMethods.executeFunction(+nextDeprMet.id, recordValues);
            ret *= prFactor;

            if (isNaN(ret)) {
                fLog.logExecution('Error Computing Depreciation Amount. Asset values: ' +
                    JSON.stringify(recordValues), 'error');
                throw error.create({
                    name: 'COMPUTATION_ERROR',
                    message: 'Error computing depreciation amount.',
                    notifyOff: true});
            }

            if ((recordObj.currNBV - ret) * checkSign < recordObj.resValue * checkSign) {
                ret = fMath.roundByPrecision(+(recordObj.currNBV - recordObj.resValue), prcn);
            }
        }
        
        ret = fMath.roundByPrecision(+ret, prcn);
        fLog.endMethod();
        return ret;
    };

    /**
     * Calculates the pro-rata factor for the specific period
     *
     * Parameters:
     *     recordObj {object} - record object to be depreciated
     * Returns:
     *     {number} - pro-rata factor
    **/
    FAM_Depreciation.getProRataFactor = function (recordObj) {
        fLog.startMethod('FAM_Depreciation.getProRataFactor');

        var ret = 1;
        if (recordObj.convention === fConst.Conventions['Half-Year'] ||
            recordObj.convention === fConst.Conventions['Mid-Month']) {

            ret = 0.5;
        }
        else if (recordObj.convention === fConst.Conventions['Mid-Quarter']) {
            switch (this.getRelativeMonth(recordObj.deprStart, recordObj.fiscalYr)) {
                case 0:
                case 1:
                case 2:
                    ret = 10.5;
                    break;
                case 3:
                case 4:
                case 5:
                    ret = 7.5;
                    break;
                case 6:
                case 7:
                case 8:
                    ret = 4.5;
                    break;
                case 9:
                case 10:
                case 11:
                    ret = 1.5;
                    break;
            }
            ret /= 12;
        }
        else if (recordObj.deprPeriod === fConst.DeprPeriod.Annually &&
            recordObj.deprRule === fConst.DepreciationRules['Pro-rata']) {

            if (recordObj.periodCon === fConst.PeriodConvention['Exact 365d']) {
                // get number of days in starting fiscal year
                ret = this.getDaysInFiscalYear(recordObj.deprStart, recordObj.fiscalYr);

                // get factor over the total number of days in the starting fiscal year
                ret /= this.getDaysInFiscalYear(recordObj.deprStart, recordObj.fiscalYr, true);
            }
            else {
                ret = 30 - (recordObj.deprStart.getDate() - 1); // get number of days in starting month
                if (ret < 1) {
                    ret = 1; // 31 is also considered as 1 day!
                }

                // add 30 per succeeding month
                ret += (12 - (this.getRelativeMonth(recordObj.deprStart, recordObj.fiscalYr) + 1)) * 30;

                ret /= 360; // get factor over a standard year with 12 months of 30 days each
            }
        }
        else if (recordObj.deprPeriod === fConst.DeprPeriod.Monthly &&
            recordObj.deprRule === fConst.DepreciationRules['Pro-rata']) {
            if (recordObj.periodCon === fConst.PeriodConvention['Exact 365d']) {
                // get number of days in starting month
                ret = this.getDaysInMonth(recordObj.deprStart);

                // get factor over the total number of days in the starting month
                ret /= this.getDaysInMonth(recordObj.deprStart, true);
            }
            else {
                var dateOfMonth = recordObj.deprStart.getDate();
                if (this.followAcctPer){
                    var msInDay        = 86400000,
                        currPeriodInfo = this.getInclusivePeriod(recordObj.deprStart);
                    //Adjust date part relative to current period info
                    dateOfMonth = ((recordObj.deprStart.getTime() - currPeriodInfo.startDate.getTime())/msInDay) + 1;
                }

                ret = 30 - (dateOfMonth - 1); // get number of days in starting period
                if (ret < 1) {
                    ret = 1; // 31 is also considered as 1 day!
                }
                ret /= 30; // get factor over a standard 30-day month
            }
        }


        fLog.endMethod();
        return ret;
    };
    
    /**
     * Computes the number of days in the given period
     *
     * Parameters:
     *     startDate {Date} - start date of the period to check
     *     endDate {Date} - end date of the period to check
     * Returns:
     *     {number} - days in period, inclusive
    **/
    FAM_Depreciation.getDaysHeld = function (startPeriod, endPeriod) {
        fLog.startMethod('FAM_Depreciation.getDaysHeld');

        var ret = ((endPeriod.getTime() - startPeriod.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        ret = Math.round(ret);

        fLog.endMethod();
        return ret;
    };
    
    /**
     * Determines the actual month based on fiscal year
     *
     * Parameters:
     *     date {Date} - date to check
     *     fiscalStart {number} - starting month (from 1-12) of the fiscal year
     * Returns:
     *     {number} - actual month (from 0-11) number based on fiscal year
    **/
    FAM_Depreciation.getRelativeMonth = function (date, fiscalStart) {
        fLog.startMethod('FAM_Depreciation.getRelativeMonth');

        var ret = fiscalStart === 1 ? date.getMonth() : (date.getMonth() + 1 - fiscalStart + 12) % 12;

        fLog.endMethod();
        return ret;
    };
    
    /**
     * Retrieves the number of days in the given fiscal year
     *
     * Parameters:
     *     checkDate {Date} - date value to check
     *     fiscalStart {number} - starting month (from 1-12) of the fiscal year
     *     isAll {boolean} - flag to determine if total number of days is expected
     * Returns:
     *     {number} - number of days in fiscal year
    **/
    FAM_Depreciation.getDaysInFiscalYear = function (checkDate, fiscalStart, isAll) {
        fLog.startMethod('FAM_Depreciation.getDaysInFiscalYear');

        var ret, startDate,
            relativeMonth = this.getRelativeMonth(checkDate, fiscalStart),
            endDate = new Date(checkDate.getFullYear(), checkDate.getMonth() - relativeMonth + 12, 0);

        if (isAll) {
            startDate = new Date(checkDate.getFullYear(), checkDate.getMonth() - relativeMonth, 1);
        }
        else {
            startDate = checkDate;
        }

        ret = this.getDaysHeld(startDate, endDate);

        fLog.endMethod();
        return ret;
    };
    
    /**
     * Retrieves the number of days in the given month
     *
     * Parameters:
     *     checkDate {Date} - date value to check
     *     isAll {boolean} - flag to determine if total number of days is expected
     * Returns:
     *     {number} - number of days in month
    **/
    FAM_Depreciation.getDaysInMonth = function (checkDate, isAll) {
        fLog.startMethod('FAM_Depreciation.getDaysInMonth');

        var ret, endDate = new Date(checkDate.getFullYear(), checkDate.getMonth() + 1, 0);

        if (isAll) {
            ret = endDate.getDate();
        }
        else {
            ret = endDate.getDate() - checkDate.getDate() + 1;
        }

        fLog.endMethod();
        return ret;
    };
    
    /**
     * Retrieves the accounting period a date belongs to
     *
     * Parameters:
     *      checkDate {Date} date value to check
     * Returns:
     *      periodInfo {object} period information containing all relevant properties
    **/
    FAM_Depreciation.getInclusivePeriod = function(checkDate){
        fLog.startMethod('FAM_Depreciation.getInclusivePeriod');
        var i = 0, ret, msg, checkAdjust = true;

        if (this.periodCache[checkDate.getTime()]) {
            ret = this.periodCache[checkDate.getTime()];
        }
        else if (this.periodError[checkDate.getTime()]) {
            throw this.periodError[checkDate.getTime()];
        }
        else {
            if (!this.periodInfo) {
                this.periodInfo = utilAccntng.getAccountingPeriodInfo();
            }
            do {
                if (checkAdjust && checkDate.getTime() < this.periodInfo[i].startDate.getTime()) {
                    msg = 'No accounting period found for ' + formatter.format({value: checkDate, type: FORMAT_TYPE.DATE});
                    this.periodError[checkDate.getTime()] = error.create({
                        name : 'NO_ACCOUNTING_PERIOD',
                        message : msg,
                        notifyOff : true
                    });
                    throw this.periodError[checkDate.getTime()];
                }

                if (checkDate.getTime() > this.periodInfo[i].endDate.getTime()) {
                    i++;
                }
                else if (checkAdjust && this.periodInfo[i].isAdjust) {
                    checkAdjust = false;
                    i++;
                }
                else {
                    ret = this.periodInfo[i];
                    this.periodCache[checkDate.getTime()] = this.periodInfo[i];
                }
            } while (i < this.periodInfo.length && !this.periodCache[checkDate.getTime()]);

            if (!this.periodCache[checkDate.getTime()]) { 
                msg = 'No open future accounting period for ' + formatter.format({value: checkDate, type: FORMAT_TYPE.DATE});
                this.periodError[checkDate.getTime()] = error.create({
                    name : 'NO_OPEN_FUTURE_ACCOUNTING_PERIOD',
                    message : msg,
                    notifyOff : true
                });
                throw this.periodError[checkDate.getTime()];
            }

        }
        fLog.endMethod();
        return ret;
    };
    
    /**
     * Retrieves the number of days in the given period
     *
     * Parameters:
     *     checkDate {Date} - date value to check
     * Returns:
     *     {number} - number of days in period
    **/
    FAM_Depreciation.getDaysInPeriod = function (checkDate) {
        fLog.startMethod('FAM_Depreciation.getDaysInPeriod');

        var ret, periodInfo;

        if (this.followAcctPer) {
            periodInfo = this.getInclusivePeriod(checkDate);
            ret = this.getDaysHeld(periodInfo.startDate, periodInfo.endDate);
        }
        else {
            ret = new Date(checkDate.getFullYear(), checkDate.getMonth() + 1, 0).getDate();
        }

        fLog.endMethod();
        return ret;
    };
    
    FAM_Depreciation.isStillWithinDateRange = function (lastDate, deprEndDate) {
        var ret = !deprEndDate || lastDate.getTime() < deprEndDate.getTime();
        return ret;
    }

    FAM_Depreciation.findMaster = function (altMethodId, subsidiaryId) {
        var returnValue = {};
        var searchObj = search.create({
            type: 'customrecord_ncfar_altdepreciation',
            filters: [
                search.createFilter({name: 'custrecord_altdepr_groupmaster', operator: 'is', values: 'T' }),
                search.createFilter({name: 'custrecord_altdepr_groupdepreciation', operator: 'is', values: 'T'}),
                search.createFilter({name: 'custrecord_altdepraltmethod', operator: 'is', values: altMethodId}),
                search.createFilter({name: 'isinactive', operator: 'is', values: 'F'})
            ],
            columns: [search.createColumn({name: 'custrecord_altdeprasset'})] 
        });

        if (subsidiaryId) {
            searchObj.filters.push(search.createFilter({name: 'custrecord_altdepr_subsidiary', operator: 'is', values: subsidiaryId}));
        }
        
        var searchRes = searchObj.run().getRange(0, 1);

        if (searchRes.length > 0) {
            returnValue = {
                altDeprId      : searchRes[0].id,
                altDeprAssetId : searchRes[0].getValue({name: 'custrecord_altdeprasset'})
            };
        }

        return returnValue;
    };

    FAM_Depreciation.updateMaster = function (groupMasterId, groupMasterRec) {        
        record.submitFields({
            type: 'customrecord_ncfar_altdepreciation',
            id: groupMasterId,
            values : {
                custrecord_altdepr_originalcost: groupMasterRec.OC,
                custrecord_altdepr_currentcost: groupMasterRec.CC,
                custrecord_altdeprlifetime: groupMasterRec.AL
            }
        });
    };

    FAM_Depreciation.getGroupInfo = function (arrFilters) {
        fLog.startMethod('FAM_Depreciation.getGroupInfo');
        var i, j, parentKey, altMethodId, groupMasterId, subsidiaryId,
            currentCost, bookValue, hashGroupMasters = {};

        var searchObj = search.create({
            type: 'customrecord_ncfar_altdepreciation',
            filters: [
                search.createFilter({name: 'custrecord_altdepr_groupmaster', operator: 'is', values: 'F' }),
                search.createFilter({name: 'custrecord_altdepr_groupdepreciation', operator: 'is', values: 'T'}),
                search.createFilter({name: 'isinactive', operator: 'is', values: 'F'}),
                search.createFilter({name: 'isinactive', join: 'custrecord_altdeprasset', operator: 'is', values: 'F'})
            ],
            columns: [
                search.createColumn({name: 'custrecord_altdepr_subsidiary', summary: search.getSummary().GROUP}),
                search.createColumn({name: 'custrecord_altdepraltmethod', summary: search.getSummary().GROUP}),
                search.createColumn({name: 'custrecord_altdepr_currentcost', summary: search.getSummary().SUM}),
                search.createColumn({name: 'custrecord_altdepr_originalcost', summary: search.getSummary().SUM}),
                search.createColumn({name: 'custrecord_altdeprrv', summary: search.getSummary().SUM}),
                search.createColumn({name: 'custrecord_slavebookvalue', join: 'custrecord_altdepr_assetvals', summary: search.getSummary().SUM}),
                search.createColumn({name: 'custrecord_slavepriornbv', join: 'custrecord_altdepr_assetvals', summary: search.getSummary().SUM}),
                search.createColumn({name: 'custrecord_slavelastdepramt', join: 'custrecord_altdepr_assetvals', summary: search.getSummary().SUM}),
                search.createColumn({name: 'custrecord_altdeprlifetime', summary: search.getSummary().MAX})
            ] 
        });
        
        if (arrFilters && arrFilters.length) {
            searchObj.filters.push(search.createFilter({name: 'custrecord_altdepr_subsidiary', operator: 'anyof', values: arrFilters}));

            for (j = 0; j < arrFilters.length; j++) {
                hashGroupMasters[arrFilters[j]] = {};
            }
        }

        var searchRes = searchObj.run().getRange(0, 1000);

        fLog.debug('Alternate Method Group Master Count', searchRes.length);
        
        if (searchRes.length > 0) {
            for (i = 0; i < searchRes.length; i++) {
                altMethodId  = +searchRes[i].getValue({name: 'custrecord_altdepraltmethod', summary: search.getSummary().GROUP});
                subsidiaryId = +searchRes[i].getValue({name: 'custrecord_altdepr_subsidiary', summary: search.getSummary().GROUP});                
                groupMasterId = FAM_Depreciation.findMaster(altMethodId, subsidiaryId);
                
                if (!fEnv.isOneWorld()) {
                    parentKey = 0;
                }
                else {
                    parentKey = subsidiaryId;
                }

                if (!hashGroupMasters[parentKey]) hashGroupMasters[parentKey] = {};

                currentCost = searchRes[i].getValue({name: 'custrecord_altdepr_currentcost', summary: search.getSummary().SUM}) || 0;
                bookValue = searchRes[i].getValue({name: 'custrecord_slavebookvalue', join: 'custrecord_altdepr_assetvals', summary: search.getSummary().SUM}) || 0;
                hashGroupMasters[parentKey][altMethodId] = {
                    CC : currentCost,
                    NB : bookValue,
                    CD : currentCost - bookValue,
                    OC : searchRes[i].getValue({name: 'custrecord_altdepr_originalcost', summary: search.getSummary().SUM}),
                    RV : searchRes[i].getValue({name: 'custrecord_altdeprrv', summary: search.getSummary().SUM}),
                    PB : searchRes[i].getValue({name: 'custrecord_slavepriornbv', join: 'custrecord_altdepr_assetvals', summary: search.getSummary().SUM}),
                    LD : searchRes[i].getValue({name: 'custrecord_slavelastdepramt', join: 'custrecord_altdepr_assetvals', summary: search.getSummary().SUM}),
                    AL : searchRes[i].getValue({name: 'custrecord_altdeprlifetime', summary: search.getSummary().MAX})
                };

                if (groupMasterId.altDeprId) {
                    FAM_Depreciation.updateMaster(groupMasterId.altDeprId, hashGroupMasters[parentKey][altMethodId]);
                }
            }
        }
        
        fLog.endMethod();
        
        return hashGroupMasters;
    };
    
    return FAM_Depreciation;
};
