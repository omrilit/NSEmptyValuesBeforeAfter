/**
 * Copyright 2016 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.Generic = TAF.Generic || {};
TAF.Generic.DAO = TAF.Generic.DAO || {};

TAF.Generic.DAO.FieldInfo = function _FieldInfo(id){
    return {
        id              : id,
        customFieldId   : '',
        label           : '',
        listId          : ''
    };
};

TAF.Generic.DAO.GLCustomFieldDAO = function _GLCustomFieldDAO() {
    TAF.DAO.ParentDao.call(this);
    
    this.recordType = 'customrecord_4599_custom_field';
    this.id = 'customsearch_taf_gl_customfields';
};
TAF.Generic.DAO.GLCustomFieldDAO.prototype = Object.create(TAF.DAO.ParentDao.prototype);

TAF.Generic.DAO.GLCustomFieldDAO.prototype.convertRowToObject = function _convertRowToObject(row) {
    if(!row) {
        throw  nlapiCreateError('MISSING_PARAMETER', 'row is required');
    }
    
    try {
        var line = new TAF.Generic.DAO.FieldInfo(row.getId() || '');
        line.customFieldId  = row.getValue('custrecord_4599_custom_field_id') || '';
        line.label          = row.getValue('custrecord_4599_custom_field_label') || '';
        line.listId         = row.getValue('custrecord_4599_custom_list_id') || '';
        
        return line;
    } catch (ex) {
        this.logException(ex, 'convertRowToObject');
        throw nlapiCreateError('DAO_ERROR', 'Unable to get column values');
    }
};

