/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.PT = TAF.PT || {};
TAF.PT.DAO = TAF.PT.DAO || {};


TAF.PT.DAO.Certification = function _Certification(id) {
	return {
        id: id,
        tranId : '',
        signature : '',
        systemEntryDate : ''
    };
};


TAF.PT.DAO.CertificationDao = function _CertificationDao() {
    // public methods
    this.getById = _GetById;
    
    // private variables
    var _CertificationCache = {}; // key = Internal ID
    var PORTUGAL_COMPLIANCE_BUNDLE = "9c72dbe1-160f-4259-9884-1b1364947ef2";
    var _hasPTCompliance = SFC.Registry.IsInstalled(PORTUGAL_COMPLIANCE_BUNDLE);

    function _GetById(id) {
        if (!id || !_hasPTCompliance) {
        	return new TAF.PT.DAO.Certification();
        }
        
        if (!_CertificationCache[id]) {
            searchTransaction(id);
        }
        
        return _CertificationCache[id] || new TAF.PT.DAO.Certification(id);
    }

    function searchTransaction(id) {
        var filter = [
            new nlobjSearchFilter('internalid', null, 'anyof', id),
            new nlobjSearchFilter('mainline', null, 'is', 'T')
        ];
        
        var column = [new nlobjSearchColumn('custrecord_pt_tran_id', 'CUSTRECORD_PT_TRAN_REC'),
            new nlobjSearchColumn('custrecord_pt_tran_signature', 'CUSTRECORD_PT_TRAN_REC'),
            new nlobjSearchColumn('custrecord_pt_tran_entrydate', 'CUSTRECORD_PT_TRAN_REC')
        ];
        
        var result = nlapiSearchRecord('transaction', null, filter, column);
        
        if (result) { 
            _CertificationCache[result[0].getId()] = convertToCertificationObject(result[0]);
        }
    }
    
    
    function convertToCertificationObject(row) {
        var cert = new TAF.PT.DAO.Certification(row.getId());
        cert.tranId = row.getValue('custrecord_pt_tran_id', 'CUSTRECORD_PT_TRAN_REC');
        cert.signature = row.getValue('custrecord_pt_tran_signature', 'CUSTRECORD_PT_TRAN_REC');
        cert.systemEntryDate = row.getValue('custrecord_pt_tran_entrydate', 'CUSTRECORD_PT_TRAN_REC');
        
        return cert;
    }
};
