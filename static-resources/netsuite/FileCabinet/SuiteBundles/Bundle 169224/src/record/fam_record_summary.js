/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

define(['./fam_record'], function (baseRec) {
    /**
     * Constructor
     * @param {Object} nsRecord - record object from NS API
    */
    var procRec = function (nsRecord) {
        baseRec.apply(this, ['customrecord_bg_summaryrecord', {
            
            // Main
            assetType         : 'custrecord_summary_assettype',
            summaryValue      : 'custrecord_summary_value',
            posting_reference : 'custrecord_summary_histjournal',
            status            : 'custrecord_summary_status',
            groupInfo         : 'custrecord_summary_groupinfo',
            deprDate          : 'custrecord_summary_deprdate',
            deprAcc           : 'custrecord_summary_depracc',
            chargeAcc         : 'custrecord_summary_chargeacc',
            subsidiary        : 'custrecord_summary_subsidiary',
            department        : 'custrecord_summary_department',
            classid           : 'custrecord_summary_class',
            location          : 'custrecord_summary_location',
            currid            : 'custrecord_summary_currency',
            fixedrate         : 'custrecord_summary_fixedrate',
            histcount         : 'custrecord_summary_histcount',
            journalMemo       : 'custrecord_summary_journalmemo',
            acctBook          : 'custrecord_summary_accountingbook',
            project           : 'custrecord_summary_project'
            
        }, nsRecord]);
    };
    
    procRec.prototype = Object.create(baseRec.prototype);
    
    return procRec;
});