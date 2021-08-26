/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 * 
*/

define(['./fam_record'], function (baseRec) {
    /**
     * Constructor
     * @param {Object} nsRecord - record object from NS API
    */
    var proposalAltDeprRec = function (nsRecord) {
        baseRec.apply(this, ['customrecord_ncfar_altdepr_proposal', {            
            /*************************************
             * PATTERN KEYS FROM ASSET RECORD!!! *
            *************************************/             
            // Main
            proposal            : 'custrecord_propaltdepr_propid',
            book                : 'custrecord_propaltdepr_accountingbook',
            altMethod           : 'custrecord_propaltdepr_altmethod',
            deprMethod          : 'custrecord_propaltdepr_deprmethod',
            override            : 'custrecord_propaltdepr_override',
            rvPercent           : 'custrecord_propaltdepr_residperc',
            
            // General
            convention          : 'custrecord_propaltdepr_convention',
            al                  : 'custrecord_propaltdepr_lifetime',
            financialYearStart  : 'custrecord_propaltdepr_financialyear',
            periodConvention    : 'custrecord_propaltdepr_periodconvention',
            deprPeriod          : 'custrecord_propaltdepr_deprperiod',
            subsidiary          : 'custrecord_propaltdepr_subsidiary',
            
            // Accounts
            assetAccount        : "custrecord_propaltdepr_assetaccount",
            deprAccount         : "custrecord_propaltdepr_depraccount",
            deprChargeAccount   : "custrecord_propaltdepr_chargeaccount",
            writeOffAccount     : "custrecord_propaltdepr_writeoffaccount",
            writeDownAccount    : "custrecord_propaltdepr_writedownaccount",
            disposalAccount     : " custrecord_propaltdepr_disposalaccount",
        }, nsRecord]);
    };
    
    proposalAltDeprRec.prototype = Object.create(baseRec.prototype);
    
    return proposalAltDeprRec;
});