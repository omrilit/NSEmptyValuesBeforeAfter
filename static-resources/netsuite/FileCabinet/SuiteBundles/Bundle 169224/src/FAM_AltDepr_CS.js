/**
 * � 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/

var FAM;
if (!FAM) { FAM = {}; }

FAM.AltDepr_CS = new function () {
    var alertList = {
            ALERT_ASSET_ALREADY_USED       : 'client_altdepr_assetalreadyused',
            ALERT_ASSET_AL_WARNING         : 'client_altdepr_assetlifetimewarning',
            ALERT_ASSET_AL_ERROR           : 'client_altdepr_assetlifetimeerror',
            ALERT_NO_METHOD_FOUND_ERROR    : 'client_altdepr_nomethodfound',
            ALERT_IMPROPER_CONVENTION      : 'client_altmethod_improperconvention',
            ALERT_SUBSIDIARY_MISMATCH      : 'client_altmethod_subsidiarymismatch',
            ALERT_FIELD_ADJUST             : 'client_assetrecord_fieldadjust',
            ALERT_DATE_ERROR               : 'client_assetrecord_dateerror',
            ALERT_MULTIBOOK_DISABLED       : 'client_multibookdisabled',
            ALERT_PRIMARY_BOOK             : 'client_primarybook',
            ALERT_PENDING_BOOK             : 'client_pendingbook',
            ALERT_BOOK_SUBSIDIARY_MISMATCH : 'client_booksubsidiary_mismatch',
            ALERT_CONFIRM_PRECOMP_EDIT     : 'client_assetrecord_confirmprecompedit' };
    
    this.fieldsAffPrecompute = [ 'custrecord_altdeprmethod',
                                 'custrecord_altdepr_originalcost',
                                 'custrecord_altdepr_currentcost',
                                 'custrecord_altdeprrv_perc',
                                 'custrecord_altdeprrv',
                                 'custrecord_altdeprlifetime',
                                 'custrecord_altdeprnbv',
                                 'custrecord_altdeprstartdeprdate',
                                 'custrecord_altdepr_deprenddate',
                                 'custrecord_altdeprlastdeprdate',
                                 'custrecord_altdeprld',
                                 'custrecord_altdeprcurrentage',
                                 'custrecord_altdepr_deprrules',
                                 'custrecord_altdepr_depraccount',
                                 'custrecord_altdepr_chargeaccount',
                                 'custrecord_altdepr_accountingbook',
                                 'custrecord_altdeprfinancialyear',
                                 'custrecord_altdeprconvention',
                                 'custrecord_altdeprperiodconvention' ];
    
    this.currSymbol = null;
    this.intCurrSymbol = [];
    this.initCost = null;
    this.bookStatus = null;
    this.type = '';
    
    this.isEditedForPrecompute = false;
    
    this.pageInit = function(type) {
        this.type = type;
        this.alertMessage = FetchMessageObj(alertList);
        //prepare data for fieldchange function
        var subId = nlapiGetFieldValue('custrecord_altdepr_subsidiary');
        var bookId = nlapiGetFieldValue('custrecord_altdepr_accountingbook');
        var currency = FAM.Util_Shared.getApplicableCurrency(subId, bookId);
        
        //Store initial values
        this.initCost = {
                book_value     : nlapiGetFieldValue('custrecord_altdeprnbv'),
                prior_year_nbv : nlapiGetFieldValue('custrecord_altdeprpriornbv'),
                original_cost  : nlapiGetFieldValue('custrecord_altdepr_originalcost'),
                current_cost   : nlapiGetFieldValue('custrecord_altdepr_currentcost'),
                subid          : subId,
                currid         : currency
            };
        this.currSymbol    = this.initCost.currid &&
                                    nlapiLookupField('currency', this.initCost.currid, 'symbol');
        this.intCurrSymbol = FAM.SystemSetup.getSetting('nonDecimalCurrencySymbols');


        // Disable Accounting book if already set
        if(type == 'edit') {
            if (nlapiGetFieldValue('custrecord_altdepr_accountingbook')) {
                nlapiDisableField('custrecord_altdepr_accountingbook', true);
            }
            
            var id = nlapiGetFieldValue('custrecord_altdepr_assetvals');
            if (id){
                var slaveValues = nlapiLookupField('customrecord_fam_assetvalues', id, ['custrecord_slavebookvalue',
                                                                                        'custrecord_slavepriornbv',
                                                                                        'custrecord_slavelastdepramt',
                                                                                        'custrecord_slavelastdeprdate',
                                                                                        'custrecord_slavecurrentage'], false);
                
                var currentCost = nlapiGetFieldValue('custrecord_altdepr_currentcost'),
                    cd =  (currentCost || 0) - (slaveValues['custrecord_slavebookvalue'] || 0);
                var prcn = FAM.Util_Shared.getPrecision(currency);
                
                nlapiSetFieldValue('custrecord_altdeprnbv',slaveValues['custrecord_slavebookvalue']);
                nlapiSetFieldValue('custrecord_altdeprpriornbv',slaveValues['custrecord_slavepriornbv']);
                nlapiSetFieldValue('custrecord_altdeprld',slaveValues['custrecord_slavelastdepramt']);
                nlapiSetFieldValue('custrecord_altdeprlastdeprdate',slaveValues['custrecord_slavelastdeprdate']);
                nlapiSetFieldValue('custrecord_altdeprcurrentage',slaveValues['custrecord_slavecurrentage']);
                nlapiSetFieldValue('custrecord_altdeprcd', FAM.Util_Shared.Math.roundByPrecision(cd, prcn));
                
                // To negate the effect of the clump of setFieldValue above
                this.isEditedForPrecompute = false;
            }
            
        }

        // Existence check for Alternate Method
        if(FAM.Context.blnOneWorld && !this.checkAltMethodExist()) {
            nlapiDisableField('custrecord_altdepraltmethod', true);
            alert(FAM.AltDepr_CS.alertMessage.ALERT_NO_METHOD_FOUND_ERROR);
            return;
        }

        // Disable fields based on status
        var selectedRoles = FAM.SystemSetup.getSetting('selectedUserRoles'),
            broleAllowed  = (selectedRoles.indexOf(FAM.Context.userRole) !== -1) || FAM.Context.blnAdmin;
        if(type == 'create' ||
                (FAM.SystemSetup.getSetting('isAllowValueEdit') === 'T') && broleAllowed){
            //Disable fields base from override flag
            this.disableFields();
        }
        else {
            //Disable fields base from allow value edit option
            this.disallowValueEdit();
        }

        //Cache the Accounting Book Status
        this.bookStatus = new FAM.FieldCache('accountingbook');
    };

    this.validateField = function(type, name) {
        //check convention against depreciation period

        if (name == 'custrecord_altdeprmethod' || name == 'custrecord_altdeprconvention') {
            if(!FAM.Util_CS.checkConvention(nlapiGetFieldValue('custrecord_altdeprmethod'),nlapiGetFieldValue('custrecord_altdeprconvention'))){
                alert(this.alertMessage.ALERT_IMPROPER_CONVENTION);
                return false;
            }
        }
        else if(name == 'custrecord_altdepraltmethod') {
            var altMethod  = nlapiGetFieldValue('custrecord_altdepraltmethod');

            if(altMethod!=-1) {
            if (altMethod && FAM.Context.blnOneWorld) {
                var altMethodSub = nlapiLookupField('customrecord_ncfar_altmethods', altMethod,
                        'custrecord_altmethodsubsidiary'),
                    assetSub    = nlapiGetFieldValue('custrecord_altdepr_subsidiary');
                if(altMethodSub.indexOf(assetSub) == -1) {
                    alert(this.alertMessage.ALERT_SUBSIDIARY_MISMATCH);
                    return false;
                    }
                }
            }
        }
        else if(name == 'custrecord_altdepr_deprenddate' || name == 'custrecord_altdeprstartdeprdate'){
            var sDate = nlapiGetFieldValue('custrecord_altdeprstartdeprdate'),
                eDate = nlapiGetFieldValue('custrecord_altdepr_deprenddate');
            if(sDate && eDate) {
                var startDate  = nlapiStringToDate(sDate),
                    endDate    = nlapiStringToDate(eDate);
                if(startDate > endDate) {
                    alert(this.alertMessage.ALERT_DATE_ERROR);
                    return false;
                }
            }

        }
        else if(name == 'custrecord_altdepr_accountingbook') {
            var aBookId = nlapiGetFieldValue('custrecord_altdepr_accountingbook');
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
                        var subId = nlapiGetFieldValue('custrecord_altdepr_subsidiary');
                        if(!FAM.Util_Shared.isValidSubsidiaryBookId(subId,aBookId)) {
                            // Subsidiaries did not match, alert user.
                            alert(FAM.AltDepr_CS.alertMessage.ALERT_BOOK_SUBSIDIARY_MISMATCH);
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

    this.saveRecord = function(type) {
        //check duplicate Alternate Method
        var hasDupAltMeth = FAM.Util_Shared.checkDupAltDep(
            'asset',
            nlapiGetFieldValue('custrecord_altdeprasset'),
            nlapiGetFieldValue('custrecord_altdepraltmethod'),
            nlapiGetFieldValue('custrecord_altdepr_accountingbook'),
            nlapiGetFieldValue('custrecord_altdepr_isposting'),
            nlapiGetRecordId()
        );
        
        if(hasDupAltMeth){
            var printMessage = InjectMessageParameter(this.alertMessage.ALERT_ASSET_ALREADY_USED, new Array(nlapiGetFieldText('custrecord_altdepraltmethod')));
            alert(printMessage);
            return false;
        }

        var searchFilter = [];
        searchFilter.push(new nlobjSearchFilter('internalid',null,'anyof',
                             nlapiGetFieldValue('custrecord_altdeprasset')));
        var searchColumn = [];
        searchColumn.push(new nlobjSearchColumn('custrecord_assetdeprperiod'));
        searchColumn.push(new nlobjSearchColumn('custrecord_assetlifetime'));
        searchColumn.push(new nlobjSearchColumn('custrecord_assetstatus'));
        var searchResults = nlapiSearchRecord('customrecord_ncfar_asset', null, searchFilter, searchColumn);

        if (searchResults != null && searchResults.length > 0) {

            //Check Alternate Method Asset Life against Asset Lifetime
            var accountingLifeTime = searchResults[0].getValue('custrecord_assetlifetime');
            accountingLifeTime = FAM.Util_Shared.Math.parseInt(accountingLifeTime, 10) || 0;
            var alternateLifeTime = nlapiGetFieldValue('custrecord_altdeprlifetime');
            alternateLifeTime = FAM.Util_Shared.Math.parseInt(alternateLifeTime, 10) || 0;

            if ((nlapiGetFieldValue('custrecord_altdepr_depreciationperiod') == DEPR_PERIOD_ANNUALLY) &&
                (searchResults[0].getValue('custrecord_assetdeprperiod') == DEPR_PERIOD_MONTHLY)) {
                //Convert AL to monthly units
                alternateLifeTime = alternateLifeTime * 12;
            }
            else if ((nlapiGetFieldValue('custrecord_altdepr_depreciationperiod') == DEPR_PERIOD_MONTHLY) &&
                (searchResults[0].getValue('custrecord_assetdeprperiod') == DEPR_PERIOD_ANNUALLY)) {
                //Convert AL to monthly units
                accountingLifeTime = accountingLifeTime * 12;
            }
            if (alternateLifeTime > accountingLifeTime) {
                if (FAM.SystemSetup.getSetting('isConstrainAssetLifetime') === 'F') {
                    //notify only as warning since user perference allows it
                    alert(this.alertMessage.ALERT_ASSET_AL_WARNING);
                } else {
                    //validation error
                    alert(this.alertMessage.ALERT_ASSET_AL_ERROR);
                    return false;
                }
            }
        }

        var precompConfirm = true;
        if ((FAM.SystemSetup.getSetting('precompute') === 'T') && this.isEditedForPrecompute) {
            precompConfirm = confirm(this.alertMessage.ALERT_CONFIRM_PRECOMP_EDIT);
        }
        
        return precompConfirm;
    };

    this.fieldChange = function (type, name) {
        if (this.type === 'edit') {
            this.setEditedPrecomputeFlag(name);
        }
        
        switch (name){
            case 'custrecord_altdepr_originalcost':
            case 'custrecord_altdeprrv':
                var origCost = parseFloat(nlapiGetFieldValue('custrecord_altdepr_originalcost')),
                    resVal = parseFloat(nlapiGetFieldValue('custrecord_altdeprrv')),
                    resValPerc;

                if(isNaN(resVal)||isNaN(origCost))
                    break;

                if(resVal == 0 && origCost == 0)
                    resValPerc = 0;
                else{
                    resValPerc = FAM.Util_Shared.Math.roundByCurrency((resVal * 100.00)/origCost, this.currSymbol, this.intCurrSymbol);
                }
                resValPerc = resValPerc.toString();

                nlapiSetFieldValue('custrecord_altdeprrv_perc',resValPerc, false); // disable fire field changed to avoid infinite loop
                break;
            case 'custrecord_altdeprrv_perc':
                var origCost = parseFloat(nlapiGetFieldValue('custrecord_altdepr_originalcost')),
                    resValPerc = parseFloat(nlapiGetFieldValue('custrecord_altdeprrv_perc')),
                    resVal;

                if(isNaN(resValPerc)||isNaN(origCost))
                    break;

                resVal = FAM.Util_Shared.Math.roundByCurrency((resValPerc * origCost)/100, this.currSymbol, this.intCurrSymbol);
                resVal = resVal.toString();

                nlapiSetFieldValue('custrecord_altdeprrv',resVal, false); // disable fire field changed to avoid infinite loop

                break;

            case 'custrecord_altdeprstartdeprdate':
            case 'custrecord_altdeprlifetime':
                var sDate = nlapiGetFieldValue('custrecord_altdeprstartdeprdate'),
                    al = nlapiGetFieldValue('custrecord_altdeprlifetime'),
                    period = nlapiGetFieldValue('custrecord_altdepr_depreciationperiod');

                if(sDate && FAM.Util_Shared.Math.parseInt(al) >= 0) {
                    var currEndDate   = nlapiStringToDate(nlapiGetFieldValue('custrecord_altdepr_deprenddate')),
                        endDate = FAM.Util_Shared.Date.computeEndDate(sDate, al, period);
                    if(currEndDate != endDate) {
                        //Change End Date
                        nlapiSetFieldValue('custrecord_altdepr_deprenddate',nlapiDateToString(endDate),false);
                        if(currEndDate) {
                            //alert adjustment if end date has value
                            var edField = nlapiGetField('custrecord_altdepr_deprenddate'),
                                changedField = nlapiGetField(name);
                            alert(FAM.Util_Shared.String.injectMessageParameter(this.alertMessage.ALERT_FIELD_ADJUST,
                                [edField.getLabel(), changedField.getLabel()]));
                        }
                    }
                }
                break;
            case 'custrecord_altdepr_deprenddate':
                var sDate = nlapiGetFieldValue('custrecord_altdeprstartdeprdate'),
                eDate   = nlapiGetFieldValue('custrecord_altdepr_deprenddate');
                if(sDate && eDate) {
                    var al        = FAM.Util_Shared.Date.computeAl(sDate, eDate, nlapiGetFieldValue('custrecord_altdepr_depreciationperiod'));
                        currAl    = nlapiGetFieldValue('custrecord_altdeprlifetime');
                    if(al != currAl) {
                          //Change Asset Life time
                        nlapiSetFieldValue('custrecord_altdeprlifetime',al,false);
                        if(currAl) {
                            //alert adjustment if asset lifetime has current value
                            var alField = nlapiGetField('custrecord_altdeprlifetime'),
                                changedField = nlapiGetField(name);
                            alert(FAM.Util_Shared.String.injectMessageParameter(this.alertMessage.ALERT_FIELD_ADJUST,
                                    [alField.getLabel(), changedField.getLabel()]));
                        }
                    }
                }
                break;
            case 'custrecord_altdepr_accountingbook':
                var bookId = nlapiGetFieldValue('custrecord_altdepr_accountingbook');

                nlapiDisableField('custrecord_altdepr_isposting', !bookId);
                if (!bookId)
                    nlapiSetFieldValue('custrecord_altdepr_isposting', 'F');
                
                var exRate = 1;
                if(bookId && FAM.Context.blnMultiCurrency) {
                    var bookData = this.bookStatus.exchangeRate(
                         this.initCost.currid,
                         this.initCost.subid,
                         bookId,
                         nlapiGetFieldValue('custrecord_altdeprstartdeprdate'));
                    exRate = bookData.exRate;
                    this.currSymbol = bookData.newCurr && nlapiLookupField('currency', bookData.newCurr, 'symbol');
                }

                var value = FAM.Util_Shared.Math.roundByCurrency(this.initCost.original_cost * exRate, this.currSymbol, this.intCurrSymbol);
                nlapiSetFieldValue('custrecord_altdepr_originalcost', value, false);
                value = FAM.Util_Shared.Math.roundByCurrency(this.initCost.current_cost * exRate, this.currSymbol, this.intCurrSymbol);
                nlapiSetFieldValue('custrecord_altdepr_currentcost', value, false );
                value = FAM.Util_Shared.Math.roundByCurrency(this.initCost.book_value * exRate, this.currSymbol, this.intCurrSymbol);
                nlapiSetFieldValue('custrecord_altdeprnbv', value, false);
                value = FAM.Util_Shared.Math.roundByCurrency(this.initCost.prior_year_nbv * exRate, this.currSymbol, this.intCurrSymbol);
                nlapiSetFieldValue('custrecord_altdeprpriornbv', value, false);

                var perc = parseFloat(nlapiGetFieldValue('custrecord_altdeprrv_perc')) || 0,
                    rv = FAM.Util_Shared.Math.roundByCurrency(this.initCost.original_cost * perc * exRate / 100.00, this.currSymbol, this.intCurrSymbol);
                nlapiSetFieldValue('custrecord_altdeprrv', rv, false);
                
                // Set default accounts
                this.setDefaultAccounts();
                
                break;
                
            case 'custrecord_altdepraltmethod':

                // Set default accounts
                this.setDefaultAccounts();
                break;
        }
    };

    this.postSourcing = function(type, name) {
        if (name == 'custrecord_altdepraltmethod') {
            this.disableFields();
        }
    };

    this.disallowValueEdit = function(){
        nlapiDisableField('custrecord_altdeprcd', true);
        nlapiDisableField('custrecord_altdeprld', true);
        nlapiDisableField('custrecord_altdeprnbv', true);
        nlapiDisableField('custrecord_altdeprfc', true);
        nlapiDisableField('custrecord_altdeprlastdeprdate', true);
        nlapiDisableField('custrecord_altdeprstatus', true);
        nlapiDisableField('custrecord_altdeprcurrentage', true);

        if (parseFloat(nlapiGetFieldValue('custrecord_altdeprcd')) > 0.00 ||
                nlapiGetFieldValue('custrecord_altdeprstatus') === FAM.TaxMethodStatus.Disposed) {
            nlapiDisableField('custrecord_altdepr_deprenddate', true);
            nlapiDisableField('custrecord_altdepraltmethod', true);
            nlapiDisableField('custrecord_altdeprmethod', true);
            nlapiDisableField('custrecord_altdeprconvention', true);
            nlapiDisableField('custrecord_altdeprlifetime', true);
            nlapiDisableField('custrecord_altdeprrv', true);
            nlapiDisableField('custrecord_altdeprrv_perc', true);
            nlapiDisableField('custrecord_altdeprfinancialyear', true);
            nlapiDisableField('custrecord_altdeprperiodconvention', true);
            nlapiDisableField('custrecord_altdepr_subsidiary', true);
            nlapiDisableField('custrecord_altdepr_depreciationperiod', true);
            nlapiDisableField('custrecord_altdepr_originalcost', true);
            nlapiDisableField('custrecord_altdepr_currentcost', true);
            nlapiDisableField('custrecord_altdeprannualentry', true);
            nlapiDisableField('custrecord_altdeprstartdeprdate', true);
            nlapiDisableField('custrecord_altdeprdef_accountingbook', true);
            nlapiDisableField('custrecord_altdepr_deprrules', true);
        }
    };

    this.disableFields = function() {
        var bool = true;
        if (nlapiGetFieldValue('custrecord_altdeproverride') == 'T') {
            bool = false;
        }
        nlapiDisableField('custrecord_altdeprmethod', bool);
        nlapiDisableField('custrecord_altdeprconvention', bool);
        nlapiDisableField('custrecord_altdeprlifetime', bool);
        nlapiDisableField('custrecord_altdeprfinancialyear', bool);
        nlapiDisableField('custrecord_altdeprperiodconvention', bool);

        if (nlapiGetFieldValue('custrecord_altdepr_groupdepreciation') == 'T') {
            nlapiDisableField('custrecord_altdepr_groupmaster', false);
        } else {
            nlapiSetFieldValue('custrecord_altdepr_groupmaster', 'F');
            nlapiDisableField('custrecord_altdepr_groupmaster', true);
        }
    };

    this.checkAltMethodExist = function() {
        var exist = false,
            subid = nlapiGetFieldValue('custrecord_altdepr_subsidiary');
        if (subid) {
            var filter = new nlobjSearchFilter('custrecord_altmethodsubsidiary', null, 'anyof', subid),
                altRec = nlapiSearchRecord('customrecord_ncfar_altmethods', null, filter );
            if (altRec) {
                exist = true;
            }
        }
        return exist;
    };
    
    this.setDefaultAccounts = function() {

        var assetId = nlapiGetFieldValue('custrecord_altdeprasset');
        var assetTypeId = nlapiLookupField('customrecord_ncfar_asset', assetId, 'custrecord_assettype');
        var depMethId = nlapiGetFieldValue('custrecord_altdepraltmethod');
        var bookId = nlapiGetFieldValue('custrecord_altdepr_accountingbook');
        var subId = nlapiGetFieldValue('custrecord_altdepr_subsidiary');
        
        var accounts = FAM.Util_Shared.getAssetTypeDefAltDeprAccounts(assetTypeId, depMethId, bookId, subId);
        
        if(accounts) {
            nlapiSetFieldValue('custrecord_altdepr_assetaccount', accounts.assetAcct);
            nlapiSetFieldValue('custrecord_altdepr_depraccount', accounts.deprAcct);
            nlapiSetFieldValue('custrecord_altdepr_chargeaccount', accounts.chargeAcct);
            nlapiSetFieldValue('custrecord_altdepr_writeoffaccount', accounts.writeoffAcct);
            nlapiSetFieldValue('custrecord_altdepr_writedownaccount', accounts.writedownAcct);
            nlapiSetFieldValue('custrecord_altdepr_disposalaccount', accounts.disposalAcct);
        } else {
            nlapiSetFieldValue('custrecord_altdepr_assetaccount', '');
            nlapiSetFieldValue('custrecord_altdepr_depraccount', '');
            nlapiSetFieldValue('custrecord_altdepr_chargeaccount', '');
            nlapiSetFieldValue('custrecord_altdepr_writeoffaccount', '');
            nlapiSetFieldValue('custrecord_altdepr_writedownaccount', '');
            nlapiSetFieldValue('custrecord_altdepr_disposalaccount', '');
        }
    };
    
    this.setEditedPrecomputeFlag = function(field) {
        if (this.fieldsAffPrecompute.indexOf(field) >= 0) {
            this.isEditedForPrecompute = true;
        }
    };
};
