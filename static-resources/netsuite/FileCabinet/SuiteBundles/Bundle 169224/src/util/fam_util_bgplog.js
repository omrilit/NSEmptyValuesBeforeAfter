/**
 * © 2016 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or
 * otherwise make available this code.
 *
 */

define(['../adapter/fam_adapter_record'],
function (record){
    return {
        truncMsg : function truncMsg(msg) {
            var MAX_LENGTH = 300;
            if (msg.length > MAX_LENGTH) {
                var truncMsg = [msg.substring(0, MAX_LENGTH-3), '...'].join('');
                return truncMsg;
            };
            
            return msg;
        },
        
        /**
         * @param {integer} bgpId - Internal ID of the BGP of the process log.
         * @param {fam_const_customlist.BGLogMessageType} logType - Type of the process log.
         * @param {String} relRec- Related record e.g. Asset ID: 1200
         * @param {String} msg - Log message. Limit: 300 characters
         */
        create : function create(bgpId, logType, relRec, msg) {
            msg = this.truncMsg(msg);
            var procLogRec = record.create({ type : 'customrecord_bg_proclog' });
            procLogRec.setValue({ 
                fieldId : 'custrecord_far_prolog_procinstance',
                value : bgpId 
            });
            procLogRec.setValue({ 
                fieldId : 'custrecord_far_prolog_type', 
                value : logType 
            });
            procLogRec.setValue({ 
                fieldId : 'custrecord_far_prolog_recordname',
                value : relRec 
            }); 
            procLogRec.setValue({ 
                fieldId : 'custrecord_far_prolog_msg',
                value : msg 
            });
            procLogRec.save();
        }
    };
});