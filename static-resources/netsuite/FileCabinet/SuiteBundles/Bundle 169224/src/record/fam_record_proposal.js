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
    var proposalRec = function (nsRecord) {
        baseRec.apply(this, ['customrecord_ncfar_assetproposal', {            
            /*************************************
             * PATTERN KEYS FROM ASSET RECORD!!! *
            *************************************/ 
            // Main
            assetType           : 'custrecord_propassettype',
            status              : 'custrecord_propstatus',
            asset               : 'custrecord_propasset',
            source              : 'custrecord_propsourceid',
            sourceLine          : 'custrecord_propsourceline',
            parentId            : 'custrecord_propparent',
            description         : 'custrecord_propassetdescr',
            deprMethod          : 'custrecord_propaccmethod',
            oc                  : 'custrecord_propassetcost',
            rvPercent           : 'custrecord_propresidperc',
            rv                  : 'custrecord_propresidvalue',
            al                  : 'custrecord_propassetlifetime',
            lifeTimeUsage       : 'custrecord_propassetlifeunits',
            createdFrom         : 'custrecord_propcreatedfrom',
            
            // General
            department          : 'custrecord_propdepartment',
            classfld            : 'custrecord_propclass',
            location            : 'custrecord_proplocation',
            subsidiary          : 'custrecord_propsubsidiary',
            currency            : 'custrecord_propcurrencyname',
            currencyId          : 'custrecord_propcurrencyid',
            fixedRate           : 'custrecord_propfixedexrate',
            deprActive          : 'custrecord_propdepractive',
            includeInReports    : 'custrecord_propinclreports',
            deprPeriod          : 'custrecord_propdeprperiod',
            deprRules           : 'custrecord_propdeprrules',
            revisionRules       : 'custrecord_proprevisionrules',
            custodian           : 'custrecord_propcaretaker',
            purchaseOrder       : 'custrecord_proppurchaseorder',
            purchaseDate        : 'custrecord_proppurchasedate',
            deprStartDate       : 'custrecord_propdeprstartdate',
            supplier            : 'custrecord_propsupplier',
            disposalItem        : 'custrecord_propdisposalitem',
            inspectionRequired  : 'custrecord_propneedsinsp',
            inspectionInterval  : 'custrecord_propinspinterval',
            warranty            : 'custrecord_propwarranty',
            warrantyPeriod      : 'custrecord_propwarrantyperiod',
            quantity            : 'custrecord_propquantity',
            financialYearStart  : 'custrecord_propfinancialyear',
            
            // Accounts
            assetAccount        : "custrecord_propmainacc",
            deprAccount         : "custrecord_propdepracc",
            deprChargeAccount   : "custrecord_propdeprchargeacc",
            writeOffAccount     : "custrecord_propwriteoffacc",
            writeDownAccount    : "custrecord_propwritedownacc",
            disposalAccount     : " custrecord_propdisposalacc",
            
            // Custom
            project             : "custrecord_assetproject",
            employee            : 'custrecord_propemployee',
            
            // Other Methods
            storeHist           : 'custrecord_propstorehist'
        }, nsRecord]);
    };
    
    proposalRec.prototype = Object.create(baseRec.prototype);
    
    return proposalRec;
});