/**
 * Copyright © 2017, 2017, Oracle and/or its affiliates. All rights reserved..
 * 
 */
define(['../../adapter/taf_adapter_record'], utilCustomRec);

function utilCustomRec(record){
    var fieldMap = {
            report          : 'custrecord_4599_report',
            subsidiary      : 'custrecord_4599_subsidiary',
            includeChild    : 'custrecord_4599_include_child_subs',
            periodFrom      : 'custrecord_4599_period_from',
            periodTo        : 'custrecord_4599_period_to',
            percentComplete : 'custrecord_4599_percent_complete',
            user            : 'custrecord_4599_user',
            filename        : 'custrecord_4599_filename',
            deleted         : 'custrecord_4599_deleted',
            dataError       : 'custrecord_4599_data_error',
            params          : 'custrecord_4599_params',
            batchNo         : 'custrecord_4599_batch_no',
            bookId          : 'custrecord_4599_book_id',
            accountingContext : 'custrecord_4599_accountingcontext',
            useNewEngine    : 'custrecord_4599_new_engine'
        };
    
    var module = {};
    
    module.getCustRecData = function(jobId){
        var recCustRec = record.load({
                                        type : 'customrecord_4599',
                                        id : jobId
                                    });
            var objJobRec = {
                                parentTask  : jobId,
                                report      : recCustRec.getValue({fieldId : 'custrecord_4599_report'}),
                                subsidiary  : recCustRec.getValue({fieldId : 'custrecord_4599_subsidiary'}),
                                periodFrom  : recCustRec.getValue({fieldId : 'custrecord_4599_period_from'}),
                                periodTo    : recCustRec.getValue({fieldId : 'custrecord_4599_period_to'}),
                                params      : JSON.parse(recCustRec.getValue({fieldId : 'custrecord_4599_params'})),
                                bookId      : recCustRec.getValue({fieldId : 'custrecord_4599_book_id'})
                            };
        
        return objJobRec;
    };
    
    module.updateJobRecord = function (jobId, fieldValues) {
        var rec4599Job = record.load({type : 'customrecord_4599',
                                        id : jobId,
                                        isDynamic: true
                                      });
        
        for(var fld in fieldValues){
            rec4599Job.setValue({fieldId: fieldMap[fld], value: fieldValues[fld]});
        }
        rec4599Job.save();
    };
    
    return module;
};
