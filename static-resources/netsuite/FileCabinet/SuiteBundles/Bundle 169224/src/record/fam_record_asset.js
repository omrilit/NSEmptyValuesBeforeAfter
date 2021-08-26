/**
 * � 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
*/

define(['./fam_record'], function (baseRec) {
    /**
     * Constructor
     * @param {Object} nsRecord - record object from NS API
    */
    var assetRec = function (nsRecord) {
        baseRec.apply(this, ['customrecord_ncfar_asset', {
            // Main
            internalid              : 'internalid',
            name                    : 'name',
            isinactive              : 'isinactive',
            altname                 : 'altname',
            description             : 'custrecord_assetdescr',
            serialNo                : 'custrecord_assetserialno',
            alternateNo             : 'custrecord_assetalternateno',
            parentId                : 'custrecord_assetparent',
            project                 : 'custrecord_assetproject',
            assetType               : 'custrecord_assettype',
            oc                      : 'custrecord_assetcost',
            cc                      : 'custrecord_assetcurrentcost',
            rv                      : 'custrecord_assetresidualvalue',
            rvPercent               : 'custrecord_assetresidualperc',
            deprMethod              : 'custrecord_assetaccmethod',
            al                      : 'custrecord_assetlifetime',
            deprPeriod              : 'custrecord_assetdeprperiod',
            lifetimeUsage           : 'custrecord_assetlifeunits',
            nbv                     : 'custrecord_assetbookvalue',
            cumulativeDepr          : 'custrecord_assetdeprtodate',
            status                  : 'custrecord_assetstatus',
            customerLocation        : 'custrecord_asset_customer',
            componentOf             : 'custrecord_componentof',
            isCompound              : 'custrecord_is_compound',
            assetVals               : 'custrecord_assetvals',
            assetValsHelp           : 'custrecord_assetvals_help',
            
            // General
            department              : 'custrecord_assetdepartment',
            location                : 'custrecord_assetlocation',
            classfld                : 'custrecord_assetclass',
            subsidiary              : 'custrecord_assetsubsidiary',
            currency                : 'custrecord_assetcurrency',
            custodian               : 'custrecord_assetcaretaker',
            physicalLocation        : 'custrecord_assetphysicallocn',
            includeInReports        : 'custrecord_assetinclreports',
            purchaseDate            : 'custrecord_assetpurchasedate',
            deprStartDate           : 'custrecord_assetdeprstartdate',
            deprEndDate             : 'custrecord_assetdeprenddate',
            lastDeprPeriod          : 'custrecord_assetcurrentage',
            lastDeprDate            : 'custrecord_assetlastdeprdate',
            lastDeprAmount          : 'custrecord_assetlastdepramt',
            targetDeprDate          : 'custrecord_assettargetdeprdate',
            deprActive              : 'custrecord_assetdepractive',
            isAcquisition           : 'custrecord_assetacqstatus', // deprecated
            deprRrules              : 'custrecord_assetdeprrules',
            revisionRules           : 'custrecord_assetrevisionrules',
            manufacturer            : 'custrecord_assetmanufacturer',
            manufactureDate         : 'custrecord_assetmanufacturedate',
            supplier                : 'custrecord_assetsupplier',
            purchaseOrderId         : 'custrecord_assetpurchaseorder',
            parentTransaction       : 'custrecord_assetsourcetrn',
            priorNbv                : 'custrecord_assetpriornbv',
            fiscalYearStart         : 'custrecord_assetfinancialyear',
            annualEntry             : 'custrecord_assetannualentry',
            fixedRate               : 'custrecord_assetfixedexrate',
            
            // Accounts
            assetAccount            : 'custrecord_assetmainacc',
            deprAccount             : 'custrecord_assetdepracc',
            deprChargeAccount       : 'custrecord_assetdeprchargeacc',
            writeOffAccount         : 'custrecord_assetwriteoffacc',
            writeDownAccount        : 'custrecord_assetwritedownacc',
            disposalAccount         : 'custrecord_assetdisposalacc',
            
            // Lease
            isLeased                : 'custrecord_assetisleased',
            leaseCompany            : 'custrecord_assetleasecoy',
            leaseContractNo         : 'custrecord_assetleasecontract',
            leaseStartDate          : 'custrecord_assetleasestartdate',
            leaseEndDate            : 'custrecord_assetleaseenddate',
            financeLease            : 'custrecord_assetleasehp',
            initLeaseCost           : 'custrecord_assetleaseinitialcost',
            rentalAmount            : 'custrecord_assetleaserentalamt',
            rentalFrequency         : 'custrecord_assetrentalfrequency',
            firstPaymentDueDate     : 'custrecord_assetleasefirstduedate',
            lastPaymentDueDate      : 'custrecord_assetleaselastduedate',
            balloonPaymentAmount    : 'custrecord_assetleaseballoonamt',
            interestRate            : 'custrecord_assetleaseinterestrate',
            
            // Insurance
            insuranceCompany        : 'custrecord_assetinsurancecoy',
            insurancePolicyNo       : 'custrecord_assetinsurancepolicyno',
            insuranceValue          : 'custrecord_assetinsurancevalue',
            policyStartDate         : 'custrecord_assetinsurancestartdate',
            policyEndDate           : 'custrecord_assetinsuranceenddate',
            paymentFrequency        : 'custrecord_assetinsurancepaymentfreq',
            paymentAmount           : 'custrecord_assetinsurancepaymentamt',
            
            // Maintenance
            maintenanceCompany      : 'custrecord_assetmaintcoy',
            maintenanceContract     : 'custrecord_assetmaintcontract',
            inspectionRequired      : 'custrecord_assetmaintneedsinsp',
            inspectionInterval      : 'custrecord_assetmaintinspinterval',
            lastInspectionDate      : 'custrecord_assetmaintlastdate',
            nextInspectionDate      : 'custrecord_assetmaintnextdate',
            warranty                : 'custrecord_assetmaintwarranty',
            warrantyPeriod          : 'custrecord_assetmaintwarrantyperiod',
            warrantyStartDate       : 'custrecord_assetmaintwarrantystart',
            warrantyEndDate         : 'custrecord_assetmaintwarrantyend',
            repairMaintCat          : 'custrecord_assetrepairmaintcategory',
            repairMaintSubCatA      : 'custrecord_assetrepairmaintsubcategory',
            repairMaintSubCatB      : 'custrecord_assetrepairmaintsubcategoryb',
            quantity                : 'custrecord_ncfar_quantity',
            quantityDisposed        : 'custrecord_ncfar_quantitydisposed',
            
            // Tax Methods
            storeDeprHist           : 'custrecord_storedeprhist',
            
            // Asset Sale/Disposal
            disposalItem            : 'custrecord_assetdisposalitem',
            disposalDate            : 'custrecord_assetdisposaldate',
            disposalType            : 'custrecord_assetdisposaltype',
            customer                : 'custrecord_assetsalecustomer',
            salesAmount             : 'custrecord_assetsaleamount',
            salesInvoice            : 'custrecord_assetsalesinvoice',
            
            // Hidden
            createdFrom             : 'custrecord_assetcreatedfrom',
            proposalId              : 'custrecord_asset_propid'
        }, nsRecord]);
    };
    
    assetRec.prototype = Object.create(baseRec.prototype);
    
    return assetRec;
});
