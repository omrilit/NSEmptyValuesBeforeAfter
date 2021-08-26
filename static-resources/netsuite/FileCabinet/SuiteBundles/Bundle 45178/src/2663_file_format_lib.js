/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @author alaurito
 */

/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2012/03/08  217041         GPM Beta - 1.19.2       Support selective update for payment file
 *                                                    formats
 * 2012/03/14  217524         GPM Beta - 1.20.1       Add SA Standard Bank AP format
 * 2012/07/03  217328         1.20.1       			  Add CA CPA-005 format
 * 2012/07/05  223301  		  1.20.1       			  Add Equens - Clieop (ING Bank) format
 * 			   225752
 * 2012/07/17  225904         1.22.3       			  Add Raiffeisen Domestic Transfer format
 * 2012/08/01  225006         1.22.3       			  Add BACS - Bank of Scotland format
 * 2012/08/01  225007         1.22.3       			  Add BACS - Albany ALBACS-IP format
 * 2012/09/07  230558		  1.22.3       			  Add SEPA Credit Transfer (Austria) format
 * 2013/01/04  238105		  2.00.5				  Add ABBL VIR 2000 format	
 * 2013/02/13  240170 		  2.00.7				  Add support for SEPA Credit Transfer (Netherlands)
 * 2013/02/15  243362 		  2.00.8				  Add support for SEPA version pain 001.001.002
 * 2012/03/01  244881 		  2.00.10	  			  Add support for ANZ EFT
 * 2013/03/27  242897		  2.00.3				  Add support for BACS - Bank of Ireland
 * 2013/04/24  235777		  2.00.2				  Add support for ACH-PPD
 * 2013/05/12  235362		  2.00.15				  Add support for BACSTEL-IP (EFT)
 * 2013/05/14  239906 		  2.00.12	 			  Added support for SVB - CDA (Positive Pay)
 * 2013/05/20  244071		  2.00.10				  Add support for CNAB 240	
 * 2013/07/23  254155         2.00.17				  Added support for SEPA Credit Transfer (ABN AMRO) 
 * 2013/07/23  235778 		  2.00.2			      Add support for BACS DD
 * 2013/08/01  242348 	      2.00.8				  Add support for Westpac-Deskbank EFT format
 * 2013/08/05  240583 	      1.01.2012.11.29.1		  Add support for SEPA Credit Transfer (Germany) format
 * 2013/08/22  219495 		  1.22.1.2012.05.10.1	  Add support for J.P. Morgan Freeform GMT
 * 2013/08/26  235194		  2.00.3				  Add support for PNC ActivePay
 * 2013/09/23  255091		  2.00.18				  Add support for SEPA Direct Debit (Germany)
 * 2013/10/17  266518		  3.00	  				  Add support for ABA (DD)
 * 2013/12/12  256853 		  3.00.00     			  Add support for SEPA Credit Transfer (CBI)
 * 2013/12/12  256855 		  3.00.00     			  Add support for SEPA Direct Debit (CBI)
 * 2013/12/17  263344	      3.01.1.2013.12.24.1     Add support for SEPA Credit Transfer (Luxembourg)
 * 2013/12/18  261618 		  3.01.1     			  Add support for SEPA Credit Transfer (Bank of Ireland)
 * 2013/12/23  240676 		  3.01.1     			  Add support for SEPA Credit Transfer (Belgium)
 * 2013/12/26  240671 		  3.01.5     			  Add support for SEPA Credit Transfer (France)
 * 2014/03/14  236313 		       			          Add support for ABO format
 * 2014/03/18  244069 		  3.01.1.2014.03.18.3     Add support for DTAZV format
 * 2014/03/20  254510 		  3.01.1.2014.03.25.3     Add support for JP Morgan GIRO format
 * 2014/03/21  229156 		       			          Add support for HSBC ISO 20022 (Singapore) format
 * 2014/09/12  304869 		  4.00.3     			  Add support for SEPA Credit Transfer (HSBC)
 * 2014/09/23  309759 		  4.00.3     			  Add support for Barclays MT103
 * 2014/10/13  312765 		       			          Add support for HSBC ISO 20022 (Hong Kong) format
 */


var _2663;

if (!_2663) 
    _2663 = {};

_2663.PaymentFileTypes = {
    'EFT' : '1',
    'DD' : '2',
    'Positive Pay' : '3'
};

_2663.NativeFormats = [
    { 
        name: 'ABA', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'ABA', 
        type: _2663.PaymentFileTypes['DD'] 
    },
    { 
        name: 'ABBL VIR 2000', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'ABO', 
        type: _2663.PaymentFileTypes['EFT']
    },    
    { 
        name: 'ACH - CCD/PPD', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'ACH - CTX (Free Text)', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'ACH - PPD', 
        type: _2663.PaymentFileTypes['DD'] 
    },
    { 
        name: 'AEB - Norma 34', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'ANZ', 
        type: _2663.PaymentFileTypes['EFT']
    },
    { 
        name: 'ASB', 
        type: _2663.PaymentFileTypes['EFT']
    },
    { 
        name: 'BACS', 
        type: [_2663.PaymentFileTypes['EFT'],  _2663.PaymentFileTypes['DD']]
    },
    { 
        name: 'BACS - Bank of Ireland', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'BACS - Bank of Scotland', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'BACS - Albany ALBACS-IP', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'BACSTEL-IP', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'BNZ', 
        type: _2663.PaymentFileTypes['EFT']
    },
    { 
        name: 'BoA/ML', 
        type: _2663.PaymentFileTypes['Positive Pay'] 
    },
    { 
        name: 'Barclays MT103', 
        type: _2663.PaymentFileTypes['EFT']
    },
    { 
        name: 'CPA-005', 
        type: _2663.PaymentFileTypes['EFT']
    },
    { 
        name: 'CBI Collections', 
        type: _2663.PaymentFileTypes['DD'] 
    },
    { 
        name: 'CBI Payments', 
        type: _2663.PaymentFileTypes['EFT']
    },
    { 
        name: 'CFONB', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'CIRI-FBF', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'CNAB 240', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'DBS - IDEAL', 
        type: [_2663.PaymentFileTypes['EFT'], _2663.PaymentFileTypes['DD']] 
    },
    { 
        name: 'DTAUS', 
        type: [_2663.PaymentFileTypes['EFT'], _2663.PaymentFileTypes['DD']] 
    },
    { 
        name: 'DTAZV', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'Equens - Clieop', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'Equens - Clieop (ING Bank)', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    {
    	name: 'HSBC ISO 20022 (Singapore)', 
    	type: _2663.PaymentFileTypes['EFT'] 
    },
	{ 		  
        name: 'HSBC ISO 20022 (Hong Kong)', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    {
    	name: 'Interbank GIRO (JP Morgan)', 
    	type: _2663.PaymentFileTypes['EFT'] 
    },
    {
    	name: 'J.P. Morgan Freeform GMT', 
    	type: _2663.PaymentFileTypes['EFT'] 
    },
    {
    	name: 'PNC ActivePay', 
    	type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'Raiffeisen Domestic Transfer', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'RBC', 
        type: ['Positive Pay'] 
    },
    { 
        name: 'SEPA Credit Transfer (Austria)', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
	{ 
        name: 'SEPA Credit Transfer (Belgium)', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'SEPA Credit Transfer (France)', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'SEPA (Austria) Pain.001.001.02',
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'SEPA Credit Transfer (ABN AMRO)', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'SEPA Credit Transfer (Germany)', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'SEPA Credit Transfer (Luxembourg)', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'SEPA Credit Transfer (Netherlands)', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'SEPA Direct Debit (Germany)', 
        type: _2663.PaymentFileTypes['DD'] 
    },    
    { 
        name: 'SEPA Credit Transfer (CBI)', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'SEPA Direct Debit (CBI)', 
        type: _2663.PaymentFileTypes['DD'] 
    },
    { 
        name: 'SEPA Credit Transfer (Bank of Ireland)', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'SEPA Credit Transfer (HSBC)', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'Standard Bank', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'SVB - CDA', 
        type: _2663.PaymentFileTypes['Positive Pay'] 
    },
    { 
        name: 'UoB - BIB-IBG', 
        type: [_2663.PaymentFileTypes['EFT'], _2663.PaymentFileTypes['DD']] 
    },
    { 
        name: 'Westpac - Deskbank', 
        type: _2663.PaymentFileTypes['EFT'] 
    },
    { 
        name: 'Zengin', 
        type: _2663.PaymentFileTypes['EFT'] 
    }
];

_2663.FormatUpdater = function() {
    /**
     * Initializes EP formats as native formats and customer formats as non-native formats
     * -- called during bundle installation afterUpdate 
     * 
     * @returns
     */
    function initializeFileFormats() {
        var nativeFormatIds = initializeNativeFormats();
        var nonNativeFormatIdCount = initializeNonNativeFormats(nativeFormatIds);
        return nativeFormatIds.length + nonNativeFormatIdCount;
    }
    
    /**
     * Initialize native formats
     * 
     * @returns {Array}
     */
    function initializeNativeFormats() {
        var nativeFormatIds = [];
        
        // initialize native formats
        for (var i = 0; i < _2663.NativeFormats.length; i++) {
            if (governanceReached()) {
                nlapiLogExecution('error', '[ep] Format Updater:initializeNativeFormats', 'Governance reached at file format: ' + _2663.NativeFormats[i].name);
                break;
            }
            // search for each record to ensure that the file format name corresponds to the type
            var filters = [];
            var columns = [];
            filters.push(new nlobjSearchFilter('name', null, 'is', _2663.NativeFormats[i].name));
            filters.push(new nlobjSearchFilter('custrecord_2663_payment_file_type', null, 'anyof', _2663.NativeFormats[i].type));
            columns.push(new nlobjSearchColumn('name'));
            columns.push(new nlobjSearchColumn('custrecord_2663_payment_file_type'));
            var searchRes = nlapiSearchRecord('customrecord_2663_payment_file_format', null, filters, columns);
            if (searchRes) {
                for (var j = 0; j < searchRes.length; j++) {
                    nlapiSubmitField('customrecord_2663_payment_file_format', searchRes[j].getId(), 'custrecord_2663_native_format', 'T');
                    nativeFormatIds.push(searchRes[j].getId());
                    nlapiLogExecution('debug', '[ep] Format Updater:initializeNativeFormats', 'Updated - name: ' + searchRes[j].getValue('name') + ', type: ' + searchRes[j].getText('custrecord_2663_payment_file_type'));
                }
            }
        }
        nlapiLogExecution('debug', '[ep] Format Updater:initializeNativeFormats', 'Number of native formats updated: ' + nativeFormatIds.length);
        
        return nativeFormatIds;
    }
    
    /**
     * Search for formats that were made by the customer and set the native format flag to F
     * 
     * @param nativeFormatIds
     * @returns {Number}
     */
    function initializeNonNativeFormats(nativeFormatIds) {
        // search for each record to ensure that the file format name corresponds to the type
        var filters = [];
        var columns = [];
        filters.push(new nlobjSearchFilter('internalid', null, 'noneof', nativeFormatIds));
        columns.push(new nlobjSearchColumn('name'));
        columns.push(new nlobjSearchColumn('custrecord_2663_payment_file_type'));
        var searchRes = nlapiSearchRecord('customrecord_2663_payment_file_format', null, filters, columns);
        var nonNativeFormatCount = 0;
        if (searchRes) {
            for (var j = 0; j < searchRes.length; j++) {
                if (governanceReached()) {
                    nlapiLogExecution('error', '[ep] Format Updater:initializeNonNativeFormats', 'Governance reached at file format: ' + searchRes[j].getValue('name') + ',type:' + searchRes[j].getText('custrecord_2663_payment_file_type'));
                    break;
                }
                nlapiSubmitField('customrecord_2663_payment_file_format', searchRes[j].getId(), 'custrecord_2663_native_format', 'F');
                nlapiLogExecution('debug', '[ep] Format Updater:initializeNonNativeFormats', 'Updated - name: ' + searchRes[j].getValue('name') + ', type: ' + searchRes[j].getText('custrecord_2663_payment_file_type'));
                nonNativeFormatCount++;
            }
        }
        nlapiLogExecution('debug', '[ep] Format Updater:initializeNonNativeFormats', 'Number of non-native formats updated: ' + nonNativeFormatCount);
        return nonNativeFormatCount;
    }
    
    /**
     * Stores the inactive format list in a temporary file
     * 
     * @param fromversion
     * @returns
     */
    function storeInactiveFormats(fromversion) {
        var inactiveFormats = getInactiveFormats();
        nlapiLogExecution('debug', '[ep] Format Updater:storeInactiveFormats', 'Inactive formats list: ' + inactiveFormats.join());
        var tempFileId;
        try {
            var fileObj = nlapiCreateFile('ep-inactive-formats-' + fromversion + '.txt', 'PLAINTEXT', inactiveFormats.join());
            fileObj.setFolder('-16');
            fileObj.setDescription('Inactive Format Temp File');
            tempFileId = nlapiSubmitFile(fileObj);    
        }
        catch(ex) {
            nlapiLogExecution('error', '[ep] Format Updater:storeInactiveFormats', 'Error in creating temporary file for inactive formats.');
        }
        
        return tempFileId;
    }
    
    /**
     * Resets the inactive formats based on the list in temporary file
     * 
     * @param fromversion
     * @returns Number
     */
    function resetInactiveFormats(fromversion) {
        var filePath = 'SuiteBundles/ep-inactive-formats-' + fromversion + '.txt';
        nlapiLogExecution('debug', '[ep] Format Updater:resetInactiveFormats', 'Inactive format temp file path: ' + filePath);
        var updatedInactiveFormatCount = 0;
        try {
            var fileObj = nlapiLoadFile(filePath);
            if (fileObj) {
                var inactiveFormatStr = fileObj.getValue();
                if (inactiveFormatStr) {
                    var inactiveFormats = inactiveFormatStr.split(',');
                    updatedInactiveFormatCount = updateInactiveFormats(inactiveFormats);
                }
                var tempFileId = nlapiDeleteFile(fileObj.getId());
                nlapiLogExecution('debug', '[ep] Format Updater:resetInactiveFormats', 'Deleted temp file - id: ' + tempFileId);
            }
            else {
                nlapiLogExecution('debug', '[ep] Format Updater:resetInactiveFormats', 'There are no inactive formats.');
            }
        }
        catch(ex) {
            nlapiLogExecution('error', '[ep] Format Updater:resetInactiveFormats', 'Error in loading temporary file for inactive formats.');
        }
        
        return updatedInactiveFormatCount;
    }
    
    /**
     * Returns an array of inactive formats
     * 
     * @returns {Array}
     */
    function getInactiveFormats() {
        var inactiveFormats = [];
        
        // search for inactive formats
        var filters = [];
        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'T'));
        var searchRes = nlapiSearchRecord('customrecord_2663_payment_file_format', null, filters);
        if (searchRes) {
            for (var j = 0; j < searchRes.length; j++) {
                inactiveFormats.push(searchRes[j].getId());
            }
        }
        nlapiLogExecution('debug', '[ep] Format Updater:getInactiveFormats', 'Number of inactive formats: ' + inactiveFormats.length);
        
        return inactiveFormats;
    }
    
    /**
     * Updates the formats as inactive and returns the number of updated records
     * 
     * @param inactiveFormats
     * @returns Number
     */
    function updateInactiveFormats(inactiveFormats) {
        var updatedInactiveFormats = [];
        
        if (inactiveFormats) {
            // search for formats with the ids in the list
            var filters = [];
            var columns = [];
            filters.push(new nlobjSearchFilter('internalid', null, 'anyof', inactiveFormats));
            columns.push(new nlobjSearchColumn('name'));
            columns.push(new nlobjSearchColumn('custrecord_2663_payment_file_type'));
            var searchRes = nlapiSearchRecord('customrecord_2663_payment_file_format', null, filters, columns);
            if (searchRes) {
                for (var j = 0; j < searchRes.length; j++) {
                    if (governanceReached()) {
                        nlapiLogExecution('error', '[ep] Format Updater:updateInactiveFormats', 'Governance reached at file format: ' + searchRes[j].getValue('name') + ',type:' + searchRes[j].getText('custrecord_2663_payment_file_type'));
                        break;
                    }
                    nlapiSubmitField('customrecord_2663_payment_file_format', searchRes[j].getId(), 'isinactive', 'T');
                    nlapiLogExecution('debug', '[ep] Format Updater:updateInactiveFormats', 'Updated - name: ' + searchRes[j].getValue('name') + ', type: ' + searchRes[j].getText('custrecord_2663_payment_file_type'));
                    updatedInactiveFormats.push(searchRes[j].getId());
                }
            }
            nlapiLogExecution('debug', '[ep] Format Updater:updateInactiveFormats', 'Number of updated inactive formats: ' + updatedInactiveFormats.length);
        }
        
        return updatedInactiveFormats.length;
    }
    
    /**
     * Redirects the page to a copy of the existing native format
     * 
     * @param fileFormatId
     */
    function createNewFromExistingFormat(fileFormatId) {
        if (fileFormatId) {
            var existingFormat = null;
            try {
                existingFormat = nlapiLoadRecord('customrecord_2663_payment_file_format', fileFormatId);
            }
            catch(ex) {
                nlapiLogExecution('error', '[ep] Format Updater:createNewFromExistingFormat', 'Error in loading payment file format - id: ' + fileFormatId);
            }
            
            if (existingFormat && existingFormat.getFieldValue('custrecord_2663_native_format') == 'T') {
                nlapiLogExecution('debug', '[ep] Format Updater:createNewFromExistingFormat', 'Load page for copy of format: ' + existingFormat.getFieldValue('name'));
                var params = {};
                params['custparam_id'] = fileFormatId;
                nlapiSetRedirectURL('RECORD', 'customrecord_2663_payment_file_format', null, true, params);
            }
        }
    }
    
    /**
     * Gets the existing format record based on given file format id
     * 
     * @param fileFormatId
     * @returns
     */
    function getExistingFormatRecord(fileFormatId) {
        var existingFormat = null;
        if (fileFormatId) {
            try {
                existingFormat = nlapiLoadRecord('customrecord_2663_payment_file_format', fileFormatId);
            }
            catch(ex) {
                nlapiLogExecution('error', '[ep] Format Updater:getExistingFormatRecord', 'Error in loading payment file format - id: ' + fileFormatId);
            }
        }
        return existingFormat;
    }
    
    this.InitializeFileFormats = initializeFileFormats;
    this.StoreInactiveFormats = storeInactiveFormats;
    this.ResetInactiveFormats = resetInactiveFormats;
    this.CreateNewFromExistingFormat = createNewFromExistingFormat;
    this.GetExistingFormatRecord = getExistingFormatRecord;
};

_2663.FormatValidator = function() {
    /**
     * Check if format with the same name already exists
     * 
     * @param fileFormatName
     * @param fileFormatType
     * @param fileFormatId
     * @returns {Boolean}
     */
    function isExistingFormat(fileFormatName, fileFormatType, fileFormatId) {
        var result = false;
        if (fileFormatName && fileFormatType) {
            // search for each record to ensure that the file format name corresponds to the type
            var filters = [];
            filters.push(new nlobjSearchFilter('name', null, 'is', fileFormatName));
            filters.push(new nlobjSearchFilter('custrecord_2663_payment_file_type', null, 'anyof', fileFormatType));
            if (fileFormatId) {
                filters.push(new nlobjSearchFilter('internalid', null, 'noneof', fileFormatId));
            }
            var searchRes = nlapiSearchRecord('customrecord_2663_payment_file_format', null, filters);
            if (searchRes) {
                result = true;
            }
        }
        nlapiLogExecution('debug', '[ep] Format Validator:isExistingFormat', 'result: ' + result);
        return result;
    }
    
    this.IsExistingFormat = isExistingFormat;
};