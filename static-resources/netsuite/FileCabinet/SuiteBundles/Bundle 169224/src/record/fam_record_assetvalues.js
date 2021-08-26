/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
*/

define(['./fam_record'], function (baseRec) {
    /**
     * Constructor
     * @param {Object} nsRecord - record object from NS API
    */
    var assetValuesRec = function (nsRecord) {
        baseRec.apply(this, ['customrecord_fam_assetvalues', {
            // Main
            internalid              : 'internalid',
            name                    : 'name',
            isinactive              : 'isinactive',
            asset                   : 'custrecord_slaveparentasset',
            lastForecastDate        : 'custrecord_slavelastforecastdate',
            forecastStatus          : 'custrecord_slaveforecaststatus',
            nbv                     : 'custrecord_slavebookvalue',
            lastDeprAmount          : 'custrecord_slavelastdepramt',
            lastDeprDate            : 'custrecord_slavelastdeprdate',
            lastDeprPeriod          : 'custrecord_slavecurrentage',
            priorNbv                : 'custrecord_slavepriornbv'
        }, nsRecord]);
    };
    
    assetValuesRec.prototype = Object.create(baseRec.prototype);
    
    return assetValuesRec;
});
