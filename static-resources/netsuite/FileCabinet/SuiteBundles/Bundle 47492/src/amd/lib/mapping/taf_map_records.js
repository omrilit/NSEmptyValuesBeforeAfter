/**
 * Copyright © 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 */

define([], recMap);

function recMap() {
    
    var module = {};
    
    module['customrecord_taf_report_task'] = {
            title : 'Report Task',
            childRecords : [{type : 'customrecord_taf_search_task',
                             parentField : 'custrecord_taf_st_parenttask'}]
    };
    
    module['customrecord_taf_search_task'] = {
            title : 'Sub Search Task',
            dependents : {'FILE' : 'custrecord_taf_st_fileid'}
    };
    
    return module;
};