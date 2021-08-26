/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @author mcadano
 * 
 * includes 2663_lib.js
 *
 */

/**
 * Revision History:
 *
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2014/04/25  287872		  3.00.0.2013.10.03.6	  Initial version
 */

var _2663;

if (!_2663)
    _2663 = {};

_2663.PaymentFileTemplate = function PaymentFileTemplate() {
	var recordType = 'customrecord_2663_payment_file_format';
	var record = null;
	var thisObj = this;
	
	function getRecordType() {
		return recordType;
	}
	
	function getId() {
		return record.getId();
	}
	
	function create() {
		record = nlapiCreateRecord(recordType);
	}
	
	function load(id) {
		record = nlapiLoadRecord(recordType, id);
	}
	
	function submit() {
		return nlapiSubmitRecord(record);
	}
	
	function deleteRecord(id) {
		nlapiDeleteRecord(recordType, id);
	}
	
	function submitField(id, fldName, val) {
		nlapiSubmitField(recordType, id, fldName, val);
	}
	
	function getBankReferenceFields(asObj) {
		var strBankRefFields = record.getFieldValue('custrecord_2663_ref_fields');
		if (asObj) {
			return thisObj.convertReferenceFieldXMLtoObject(strBankRefFields);
		}
		return strBankRefFields;
	}
	
	function getEntityReferenceFields(asObj) {
		var strEntityRefFields = record.getFieldValue('custrecord_2663_entity_ref_fields');
		if (asObj) {
			return thisObj.convertReferenceFieldXMLtoObject(strEntityRefFields);
		}
		return strEntityRefFields;
	}
	
	function convertReferenceFieldXMLtoObject(xmlStr){
		var xmlUtil = new _2663.XmlUtil();
		var objReferenceFields = {};
		
		if (xmlStr) {
	        var objRefFieldsXml = xmlUtil.LoadXmlObject(xmlStr);
	        var nodeRoot = nlapiSelectNode(objRefFieldsXml, 'refFields');
	        var nodeRefFields = nlapiSelectNodes(nodeRoot, 'refField');
	        
	        // place fields in associative array with id as index and label as value
	        if (nodeRefFields) {
	            for (var i = 0; i < nodeRefFields.length; i++) {
	                var refFieldId = xmlUtil.GetAttributeValue(nodeRefFields[i], 'id');
	                var refFieldLabel = xmlUtil.GetAttributeValue(nodeRefFields[i], 'label');
	                var refFieldMandatory = xmlUtil.GetAttributeValue(nodeRefFields[i], 'mandatory');
	                var refFieldDisplayType = xmlUtil.GetAttributeValue(nodeRefFields[i], 'displaytype');
	                var refFieldHelpText = xmlUtil.GetAttributeValue(nodeRefFields[i], 'helptext');
	                
	                var fieldObj = {};
	                fieldObj.label = refFieldLabel;
	                if (refFieldMandatory && refFieldMandatory != 'null') {
	                    if (refFieldMandatory == 'true') {
	                        fieldObj.mandatory = true;
	                    }
	                    else if (refFieldMandatory == 'false') {
	                        fieldObj.mandatory = false;
	                    }
	                }
					if (refFieldDisplayType && refFieldDisplayType != 'null') {
						fieldObj.displaytype = refFieldDisplayType;
					}
					if (refFieldHelpText && refFieldHelpText != 'null') {
						fieldObj.helptext = refFieldHelpText;
					}
					
	                objReferenceFields[refFieldId] = fieldObj;
	            }
	        }
	    }
	   
		return objReferenceFields;
	}
	
	this.create = create;
	this.load = load;
	this.submit = submit;
	this.deleteRecord = deleteRecord;
	this.submitField = submitField;
	this.getId = getId;
	this.getRecordType = getRecordType;
	this.getBankReferenceFields = getBankReferenceFields;
	this.getEntityReferenceFields = getEntityReferenceFields;
	this.convertReferenceFieldXMLtoObject = convertReferenceFieldXMLtoObject;
};