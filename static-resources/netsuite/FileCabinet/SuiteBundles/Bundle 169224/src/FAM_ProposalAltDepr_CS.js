/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/

var FAM;
if (!FAM) { FAM = {}; }

FAM.ProposalAltDepr_CS = new function () {
    this.alertMessage = {};
    this.bookStatus = {};

    this.pageInit = function (type) {
        this.alertMessage = FetchMessageObj({
            ALERT_ALREADY_USED         : 'client_proposalaltdepr_selectbeingused',
            ALERT_ASSET_AL_WARNING     : 'client_altdepr_assetlifetimewarning',
            ALERT_ASSET_AL_ERROR       : 'client_altdepr_assetlifetimeerror',
            ALERT_IMPROPER_CONVENTION  : 'client_altmethod_improperconvention',
            ALERT_MULTIBOOK_DISABLED   : 'client_multibookdisabled',
            ALERT_PRIMARY_BOOK         : 'client_primarybook',
            ALERT_PENDING_BOOK         : 'client_pendingbook',
            ALERT_BOOK_SUBSIDIARY_MISMATCH : 'client_booksubsidiary_mismatch' });

        this.disableFields();
        //Cache the Accounting Book Status
        this.bookStatus = new FAM.FieldCache('accountingbook');
    };

    this.disableFields = function () {
        var disableFlag = nlapiGetFieldValue('custrecord_propaltdepr_override') === 'F';

        nlapiDisableField('custrecord_propaltdepr_deprmethod', disableFlag);
        nlapiDisableField('custrecord_propaltdepr_convention', disableFlag);
        nlapiDisableField('custrecord_propaltdepr_lifetime', disableFlag);
        nlapiDisableField('custrecord_propaltdepr_financialyear', disableFlag);
        nlapiDisableField('custrecord_propaltdepr_periodconvention', disableFlag);
    };

    this.postSourcing = function (type, name) {
        this.setDefaults();
        this.disableFields();
    };

    this.setDefaults = function () {
        if (!nlapiGetFieldValue('custrecord_propaltdepr_financialyear')){
            nlapiSetFieldValue('custrecord_propaltdepr_financialyear', 1);
        }

        if (!nlapiGetFieldValue('custrecord_propaltdepr_periodconvention')) {
            nlapiSetFieldValue('custrecord_propaltdepr_periodconvention', 1);
        }
    };

    this.saveRecord = function () {
        //check duplicate Alternate Method
        var hasDupAltMeth = FAM.Util_Shared.checkDupAltDep(
            'assetProposal',
            nlapiGetFieldValue('custrecord_propaltdepr_propid'),
            nlapiGetFieldValue('custrecord_propaltdepr_altmethod'),
            nlapiGetFieldValue('custrecord_propaltdepr_accountingbook'),
            nlapiGetFieldValue('custrecord_propaltdepr_isposting'),
            nlapiGetRecordId()
        );
        
        if(hasDupAltMeth){
            var printMessage = InjectMessageParameter(this.alertMessage.ALERT_ALREADY_USED, new Array(nlapiGetFieldText('custrecord_propaltdepr_altmethod')));
            alert(printMessage);
            return false;
        }

        //Check Alternate Depreciation Method AL against Asset Proposal AL
        var alternateLifeTime = +nlapiGetFieldValue('custrecord_propaltdepr_lifetime') || 0,
            searchFilter = [new nlobjSearchFilter('internalid', null, 'anyof',
                nlapiGetFieldValue('custrecord_propaltdepr_propid'))],
            searchColumn = [new nlobjSearchColumn('custrecord_propassetlifetime')],
            searchResults = nlapiSearchRecord('customrecord_ncfar_assetproposal', null,
                searchFilter, searchColumn);

        if (searchResults && searchResults.length > 0) {
            var assetTypeLifeTime = +searchResults[0].getValue('custrecord_propassetlifetime') || 0;

            if (+nlapiGetFieldValue('custrecord_propaltdepr_deprperiod') ===
                FAM.DeprPeriod.Annually) {

                //Convert lifetime to monthly units
                alternateLifeTime *= 12;
            }

            if (alternateLifeTime > assetTypeLifeTime) {
                if (FAM.SystemSetup.getSetting('isConstrainAssetLifetime') === 'F') {
                    //notify only as warning since user perference allows it
                    return confirm(this.alertMessage.ALERT_ASSET_AL_WARNING);
                } else {
                    //validation error
                    alert(this.alertMessage.ALERT_ASSET_AL_ERROR);
                    return false;
                }
            }
        }

        this.setDefaults();
        return true;
    };

    this.validateField = function (type, name, linenum) {
        //check convention against depreciation period
        if (name == 'custrecord_propaltdepr_deprmethod' ||
            name == 'custrecord_propaltdepr_convention') {
            if (!FAM.Util_CS.checkConvention(
                nlapiGetFieldValue('custrecord_propaltdepr_deprmethod'),
                nlapiGetFieldValue('custrecord_propaltdepr_convention'))) {

                alert(this.alertMessage.ALERT_IMPROPER_CONVENTION);
                return false;
            }
        }
        else if(name == 'custrecord_propaltdepr_accountingbook') {
            var aBookId = nlapiGetFieldValue('custrecord_propaltdepr_accountingbook');
            if(aBookId) {
                if(!FAM.Context.blnMultiBook) {
                    alert(this.alertMessage.ALERT_MULTIBOOK_DISABLED);
                    return false;
                }
                else if(this.bookStatus.fieldValue(aBookId,'isprimary') == 'T') {
                    alert(this.alertMessage.ALERT_PRIMARY_BOOK);
                    return false;
                }
                else if(this.bookStatus.fieldValue(aBookId,'status') != FAM.AccountingBookStatus.Active) {
                    alert(this.alertMessage.ALERT_PENDING_BOOK);
                    return false;
                } else {
                	/**
                	 * Issue 292179
                	 * Accounting Book Subsidiary vs. AltDep Subsidiary validation
                	 */
                    try{
                    	// Alt dep subsidiary
                    	var subId = nlapiGetFieldValue('custrecord_propaltdepr_subsidiary');
                        if(!FAM.Util_Shared.isValidSubsidiaryBookId(subId,aBookId)) {
                            // Subsidiaries did not match, alert user.
                            alert(this.alertMessage.ALERT_BOOK_SUBSIDIARY_MISMATCH);
                            return false;
	                	}
                    } 
                    catch(e){
                    	nlapiLogExecution('DEBUG','Get Accounting Book Subsidiary',
                    	        'Error while retrieving subsidiary field for accounting book#' + aBookId + '.<br>'+e.toString());
                    }
                }
            }
        }
        return true;
    };

    this.fieldChanged = function (type, name, linenum) {
        var assetTypeId, searchRes, searchFil, searchCol;

        // Enable/disable Posting checkbox if accounting book has / no value
        if (name === 'custrecord_propaltdepr_accountingbook') {
            nlapiDisableField('custrecord_propaltdepr_isposting', !nlapiGetFieldValue('custrecord_propaltdepr_accountingbook'));
        }
        
        // sourcing of values
        if ((name === 'custrecord_propaltdepr_accountingbook' ||
            name === 'custrecord_propaltdepr_altmethod') &&
            nlapiGetFieldValue('custrecord_propaltdepr_altmethod')) {

            assetTypeId = nlapiLookupField('customrecord_ncfar_assetproposal',
                nlapiGetFieldValue('custrecord_propaltdepr_propid'), 'custrecord_propassettype');

            searchFil = [
                new nlobjSearchFilter('custrecord_altdeprdef_assettype', null, 'is', assetTypeId),
                new nlobjSearchFilter('isinactive', null, 'is', 'F'),
                new nlobjSearchFilter('custrecord_altdeprdef_accountingbook', null, 'anyof',
                    nlapiGetFieldValue('custrecord_propaltdepr_accountingbook') || '@NONE@'),
                new nlobjSearchFilter('custrecord_altdeprdef_altmethod', null, 'is',
                    nlapiGetFieldValue('custrecord_propaltdepr_altmethod'))
            ];
            searchCol = [
                new nlobjSearchColumn('custrecord_altdeprdef_assetaccount'),
                new nlobjSearchColumn('custrecord_altdeprdef_depraccount'),
                new nlobjSearchColumn('custrecord_altdeprdef_chargeaccount'),
                new nlobjSearchColumn('custrecord_altdeprdef_writeoffaccount'),
                new nlobjSearchColumn('custrecord_altdeprdef_writedownaccount'),
                new nlobjSearchColumn('custrecord_altdeprdef_disposalaccount'),
                new nlobjSearchColumn('custrecord_altdeprdef_deprmethod'),
                new nlobjSearchColumn('custrecord_altdeprdef_convention'),
                new nlobjSearchColumn('custrecord_altdeprdef_lifetime'),
                new nlobjSearchColumn('custrecord_altdeprdef_financialyear'),
                new nlobjSearchColumn('custrecord_altdeprdef_periodconvention'),
                new nlobjSearchColumn('custrecord_altdeprdef_rv_perc'),
                new nlobjSearchColumn('custrecord_altdeprdef_depreciationperiod')
            ];

            if (FAM.Context.blnOneWorld) {
                searchFil.push(new nlobjSearchFilter('custrecord_altdeprdef_subsidiary', null,
                    'anyof', nlapiGetFieldValue('custrecord_propaltdepr_subsidiary')));
            }

            searchRes = nlapiSearchRecord('customrecord_ncfar_altdeprdef', null, searchFil,
                searchCol);

            if (searchRes) {
                nlapiSetFieldValue('custrecord_propaltdepr_assetaccount', searchRes[0].getValue(
                    'custrecord_altdeprdef_assetaccount'));
                nlapiSetFieldValue('custrecord_propaltdepr_depraccount', searchRes[0].getValue(
                    'custrecord_altdeprdef_depraccount'));
                nlapiSetFieldValue('custrecord_propaltdepr_chargeaccount', searchRes[0].getValue(
                    'custrecord_altdeprdef_chargeaccount'));
                nlapiSetFieldValue('custrecord_propaltdepr_writeoffaccount', searchRes[0].getValue(
                    'custrecord_altdeprdef_writeoffaccount'));
                nlapiSetFieldValue('custrecord_propaltdepr_writedownaccount', searchRes[0].getValue(
                    'custrecord_altdeprdef_writedownaccount'));
                nlapiSetFieldValue('custrecord_propaltdepr_disposalaccount', searchRes[0].getValue(
                    'custrecord_altdeprdef_disposalaccount'));
            }
            else {
                nlapiLogExecution('debug', 'FAM.ProposalAltDepr_CS.fieldChanged',
                    'No Default Values per Book defined with the selected Accounting Book Id: ' +
                    (nlapiGetFieldValue('custrecord_propaltdepr_accountingbook') || null) +
                    ' and Alternate Method Id: ' +
                    nlapiGetFieldValue('custrecord_propaltdepr_altmethod'));
            }
        }
    };
};