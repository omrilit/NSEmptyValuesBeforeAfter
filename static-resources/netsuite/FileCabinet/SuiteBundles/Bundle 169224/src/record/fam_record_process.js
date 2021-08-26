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
        baseRec.apply(this, ['customrecord_fam_process', {
            
            // Main
            procId : 'custrecord_fam_procid',
            status : 'custrecord_fam_procstatus',
            params : 'custrecord_fam_procparams',
            currStage : 'custrecord_fam_proccurrstage',
            totStages : 'custrecord_fam_proctotstages',
            currStageStatus : 'custrecord_fam_proccurrstagestatus',
            postProcessData : 'custrecord_fam_procpostdata',
            stateValues : 'custrecord_fam_procstateval'
            
        }, nsRecord]);
        
        this.params = {};
    };
    procRec.prototype = Object.create(baseRec.prototype);
    
    return procRec;
});
