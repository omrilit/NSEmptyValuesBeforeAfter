/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
*/

define(['./fam_record'], function (baseRec) {
    /**
     * Constructor
     * @param {Object} nsRecord - record object from NS API
    */
    var deprSchedReportRec = function (nsRecord) {
        baseRec.apply(this, ['customrecord_fam_deprschedreport', {
            startDate : 'custrecord_fam_deprschedreport_startdate',
            endDate : 'custrecord_fam_deprschedreport_enddate',
            assetInc : 'custrecord_fam_deprschedreport_assetsinc',
            deprMet : 'custrecord_fam_deprschedreport_altmet',
            repType : 'custrecord_fam_deprschedreport_reptype'
        }, nsRecord]);
    };
    
    deprSchedReportRec.prototype = Object.create(baseRec.prototype);
    
    return deprSchedReportRec;
});
