/**
 * Copyright � 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.NONDEDUCTIBLE_NEXUS = {
		'AT':{'id':'13','nexuscode':'AT'}, 'BE':{'id':'20','nexuscode':'BE'}, 'BG':{'id':'22','nexuscode':'BG'}, 
		'CH':{'id':'42','nexuscode':'CH'}, 'CL':{'id':'45','nexuscode':'CL'}, 'CO':{'id':'48','nexuscode':'CO'},
		'CZ':{'id':'56','nexuscode':'CZ'}, 'DE':{'id':'57','nexuscode':'DE'}, 'DK':{'id':'59','nexuscode':'DK'},
		'ES':{'id':'68','nexuscode':'ES'}, 'FI':{'id':'70','nexuscode':'FI'}, 'GB':{'id':'77','nexuscode':'GB'},
		'ID':{'id':'101','nexuscode':'ID'}, 'FR':{'id':'75','nexuscode':'FR'}, 'IE':{'id':'102','nexuscode':'IE'},
		'IT':{'id':'110','nexuscode':'IT'}, 'KR':{'id':'122','nexuscode':'KR'}, 'LU':{'id':'134','nexuscode':'LU'},
		'MY':{'id':'158','nexuscode':'MY'}, 'NL':{'id':'166','nexuscode':'NL'}, 'NO':{'id':'167','nexuscode':'NO'},
		'NZ':{'id':'171','nexuscode':'NZ'}, 'PE':{'id':'174','nexuscode':'PE'}, 'PH':{'id':'177','nexuscode':'PH'},
		'PL':{'id':'179','nexuscode':'PL'}, 'PT':{'id':'184','nexuscode':'PT'}, 'RO':{'id':'189','nexuscode':'RO'},
		'RS':{'id':'50','nexuscode':'RS'}, 'SE':{'id':'196','nexuscode':'SE'}, 'SK':{'id':'201','nexuscode':'SK'},
		'SG':{'id':'197','nexuscode':'SG'}, 'SI':{'id':'199','nexuscode':'SI'}, 'TH':{'id':'215','nexuscode':'TH'},
		'TR':{'id':'222','nexuscode':'TR'}, 'TW':{'id':'225','nexuscode':'TW'}, 'UY':{'id':'231','nexuscode':'UY'},
		'ZA':{'id':'244','nexuscode':'ZA'}, 'CY':{'id':'55','nexuscode':'CY'}, 'UA':{'id':'227','nexuscode':'UA'},
		'KE':{'id':'115','nexuscode':'KE'}, 'HU':{'id':'100','nexuscode':'HU'}, 'VN':{'id':'238','nexuscode':'VN'}
		};

VAT.NonDeductible = function () {
	var FIELDS = {
		transaction: 'custbody_nondeductible_ref_genjrnl',
		isprocessed: 'custbody_nondeductible_processed', 
		journal: 'custbody_nondeductible_ref_tran',
		account: 'custcol_nondeductible_account'
	};

	this.run = setNonDeductible;
	function setNonDeductible(form, nexus, trantype, mode) {
		try {
			if (mode == 'copy') {
			    resetNonDeductibleFieldValues(form);
			}

			if (!isITRNDSupported() && !isSTCNDSupported(trantype, nexus)) {
			    hideNonDeductibleColumn();
			}

			setNonDeductibleFieldsDisplay(form);
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution('ERROR', 'setNonDeductible', errorMsg);
		}
	}

	/**
	 * Display the field if it has a value (ITR Non-deductible was already processed).
	 * Otherwise, hide the field.
	 */
	function setNonDeductibleFieldsDisplay(form) {
	    var txnField = form.getField(FIELDS.transaction);
	    var isProcessedField = form.getField(FIELDS.isprocessed);
	    var journalField = form.getField(FIELDS.journal);

	    try {
	        if (txnField && !nlapiGetFieldValue(FIELDS.transaction)) {
	            txnField.setDisplayType('hidden');
	        }
	        if (isProcessedField && txnField && txnField.isHidden()) {
	            isProcessedField.setDisplayType('hidden');
	        }

	        if (journalField && !nlapiGetFieldValue(FIELDS.journal)) {
	            journalField.setDisplayType('hidden');
	        }
	    } catch (ex) {
            var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
            nlapiLogExecution('ERROR', 'setNonDeductibleFieldsDisplay', errorMsg);
	    }
	}

	function resetNonDeductibleFieldValues(form) {
        var txnField = form.getField(FIELDS.transaction);
        var isProcessedField = form.getField(FIELDS.isprocessed);
        var journalField = form.getField(FIELDS.journal);

        try {
            if (txnField) {
                txnField.setDefaultValue(null);
            }
            if (isProcessedField) {
                isProcessedField.setDefaultValue(null);
            }
            if (journalField) {
                journalField.setDefaultValue(null);
            }
        } catch (ex) {
            var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
            nlapiLogExecution('ERROR', 'setNonDeductibleFieldsDisplay', errorMsg);
        }
	}

	this.isITRNDSupported = isITRNDSupported;
	function isITRNDSupported() {
		try {
			var isitrND = false;
			var journalLink = nlapiGetFieldValue('custbody_nondeductible_ref_genjrnl');

			if (journalLink) {
				isitrND = true;
				return isitrND;
			}
			
			return isitrND;
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution('ERROR', 'isITRNDSupported', errorMsg);
		}
	}
	
	this.isSTCNDSupported = isSTCNDSupported;
	function isSTCNDSupported(trantype, nexus) {
		try {
			var isstcND = false;
			isstcND = isNexusNDSupported(trantype, nexus);
			return isstcND;
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution('ERROR', 'isSTCNDSupported', errorMsg);
		}
	}
	
	this.isNexusNDSupported = isNexusNDSupported;
	function isNexusNDSupported(trantype, nexus) {
		
		try {
			var supportednexus = VAT.NONDEDUCTIBLE_NEXUS;
			var isnexusND = false;
				
			if (supportednexus[nexus] && trantype != 'GENJRNL') {
				isnexusND = true;
			} else if (trantype == 'GENJRNL') { //check if there is nexus.
				var nexuses = getAllNexuses();
				for(var inexus = 0; inexus < nexuses.length; inexus++) { //only need 1 hit to be true.
					if (supportednexus[nexuses[inexus]]) {
						isnexusND = true;
						break;
					}
				}
			}
			
			return isnexusND;
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution('ERROR', 'isNexusNDSupported', errorMsg);
		}
	}

	this.hideNonDeductibleColumn = hideNonDeductibleColumn;
	function hideNonDeductibleColumn() {
		try {
		    var sublists = ['expense', 'item', 'line'];
            for (var i = 0; i < sublists.length; i++) {
                var expenseAccountColumn = nlapiGetSubList(sublists[i]) ? nlapiGetLineItemField(sublists[i], FIELDS.account, 1) : null;
                if (expenseAccountColumn) {
                    expenseAccountColumn.setDisplayType('hidden');
                }        
            }
		} catch(ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution('ERROR', 'hideNonDeductibleColumn', errorMsg);
		}
	}
};
