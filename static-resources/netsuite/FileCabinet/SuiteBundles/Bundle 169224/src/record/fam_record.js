/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
*/

define([], function () {
    /**
     * Constructor
     * @param {string} type - record type id
     * @param {Object} fields - fields of the record
     * @param {Object} nsRecord - record object from NS API
    */
    var record = function (type, fields, nsRecord) {
        this.type = type || null;
        this.fields = fields || null;
        this.rec = nsRecord || null;
    };
    
    /**
     * Retrieves the record type id
     * @returns {string|null} record type id
    */
    record.prototype.getRecordTypeId = function () {
        return this.type;
    };
    
    /**
     * Retrieves all fields of the record
     * @returns {Object|null} record type id
    */
    record.prototype.getAllFields = function () {
        return this.fields;
    };

    /**
     * Retrieves the value of a field
     * @param {string} field - id of the field to retrieve
     * @returns {null|number|string|Boolean|Date|Array} value of the field
    */
    record.prototype.getValue = function (field) {
        var fieldId = this.fields[field] || field,
            value = this.rec && this.rec.getValue({ fieldId : fieldId }),
            type = this.getType(field);
        
        if (type === 'percent') {
            value /= 100;
        }
        
        return value;
    };
    
    /**
     * Sets the value of a field
     * @param {string} field - id of the field to retrieve
     * @param {null|number|string|Boolean|Date|Array} value - value of the field
    */
    record.prototype.setValue = function (field, value) {
        var fieldId = this.fields[field] || field;
        
        if (this.rec) {
            this.rec.setValue({ fieldId : fieldId, value : value });
        }
    };
    
    /**
     * Retrieves the label of a field
     * @param {string} field - id of the field to retrieve
     * @returns {string} label of the field
    */
    record.prototype.getLabel = function (field) {
        var fieldId = this.fields[field] || field,
            fieldObj = this.rec && this.rec.getField({ fieldId : fieldId });
        
        return fieldObj && fieldObj.label;
    };
    
    /**
     * Retrieves the type of a field
     * @param {string} field - id of the field to retrieve
     * @returns {string} type of the field
    */
    record.prototype.getType = function (field) {
        var fieldId = this.fields[field] || field,
            fieldObj = this.rec && this.rec.getField({ fieldId : fieldId });
        
        return fieldObj && fieldObj.type;
    };
    
    /**
     * Retrieves the id of the record
     * @returns {number}
    */
    record.prototype.getId = function () {
        return this.rec && this.rec.id;
    };
    
    /**
     * Saves the record in NS
     * @param {boolean} enableSourcing - sources dependent field information for empty fields
     * @param {boolean} ignoreMandatory - disables mandatory validations
     * @returns {number} internal id of the saved record
    */
    record.prototype.save = function (enableSourcing, ignoreMandatory) {
        return this.rec.save({
            enableSourcing : enableSourcing,
            ignoreMandatoryFields : ignoreMandatory
        });
    };
    
    return record;
    
});
