/**
 * � 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 * 
 */

define(["N/record"],
    famAdapterRecord);

function famAdapterRecord(record) {
    var module = {};
    
    module['create'] = function(options) {
        return record.create(options);
    };
    module['copy'] = function(famRecord, id, isDynamic, defValues) {
        var i, rec = new famRecord();
        
        rec.rec = record.copy({
            type : rec.type,
            id : id,
            isDynamic : isDynamic
        });
        
        if (defValues) {
            for (i in defValues) {
                rec.setValue(i, defValues[i]);
            }
        }
        
        return rec;
    };
    module['delete'] = function(options) {
        return record.delete(options);
    };
    module['getType'] = function(param) {
        return param ? record.Type[param] : record.Type;
    };
    module['load'] = function(options) {
        return record.load(options);
    };
    module['submitFields'] = function(options) {
        return record.submitFields(options);
    };
    return module;
}