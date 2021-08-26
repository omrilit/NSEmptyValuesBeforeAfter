/**
 * © 2016 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
*/

define([], function () {
    /**
     * Constructor
     * @param {Object} context - user event context parameter
     * @param {Object} record - record for which this user event is for
    */
    var ueRecord = function (context, record) {
        this.oldRec = new record(context.oldRecord);
        this.newRec = new record(context.newRecord);
    };
    
    /**
     * Checks if the specific field is changed
     * @param {string} field - id of the field to check
     * @returns {Boolean}
    */
    ueRecord.prototype.isChanged = function (field) {
        var ret,
            newVal = this.newRec.getValue(field),
            oldVal = this.oldRec.getValue(field);
        
        if (this.newRec.getType(field) === 'date') {
            ret = !newVal !== !oldVal ||
                (newVal && oldVal && newVal.getTime() !== oldVal.getTime());
        }
        else {
            ret = newVal !== oldVal;
        }
        
        return ret;
    };
    
    /**
     * Retrieves the value of a field
     * @param {string} field - id of the field to retrieve
     * @returns {null|number|string|Boolean|Date|Array} value of the field
    */
    ueRecord.prototype.getValue = function (field) {
        var retValue = this.newRec.getValue(field);
        
        if (retValue === null) {
            retValue = this.oldRec.getValue(field)
        }
        
        return  retValue;
    };
    
    /**
     * Sets the value of a field
     * @param {string} field - id of the field to retrieve
     * @param {null|number|string|Boolean|Date|Array} value - value of the field
    */
    ueRecord.prototype.setValue = function (field, value) {
        this.newRec.setValue(field, value);
    };
    
    /**
     * Retrieves the label of a field
     * @param {string} field - id of the field to retrieve
     * @returns {string} label of the field
    */
    ueRecord.prototype.getLabel = function (field) {
        return  this.newRec.getLabel(field);
    };
    
    return ueRecord;
});