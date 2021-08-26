/**
 * � 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
*/

define(['./fam_record'], function (baseRec) {
    /**
     * Constructor
     * @param {Object} nsRecord - record object from NS API
    */
    var altDeprRec = function (nsRecord) {
        baseRec.apply(this, ['customrecord_ncfar_altdepreciation', {
            
            /*************************************
             * PATTERN KEYS FROM ASSET RECORD!!! *
            *************************************/
            
            // Main
            al              : 'custrecord_altdeprlifetime',
            nbv             : 'custrecord_altdeprnbv',
            cumulativeDepr  : 'custrecord_altdeprcd',
            assetVals       : 'custrecord_altdepr_assetvals',
            assetValsHelp   : 'custrecord_altdepr_assetvals_help',
            
            // General
            deprPeriod      : 'custrecord_altdepr_depreciationperiod',
            deprStartDate   : 'custrecord_altdeprstartdeprdate',
            deprEndDate     : 'custrecord_altdepr_deprenddate',
            lastDeprPeriod  : 'custrecord_altdeprcurrentage',
            lastDeprDate    : 'custrecord_altdeprlastdeprdate',
            lastDeprAmount  : 'custrecord_altdeprld',
            priorNbv        : 'custrecord_altdeprpriornbv'
        }, nsRecord]);
    };
    
    altDeprRec.prototype = Object.create(baseRec.prototype);
    
    return altDeprRec;
});