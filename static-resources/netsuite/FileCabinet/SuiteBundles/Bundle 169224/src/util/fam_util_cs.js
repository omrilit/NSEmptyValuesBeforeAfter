/**
 * © 2015 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or
 * otherwise make available this code.
 * @NScriptName FAM CS Utility
 * @NScriptId _fam_util_cs 
 * @NApiVersion 2.x
*/
define(['../adapter/fam_adapter_https',
        '../adapter/fam_adapter_url'],
    function (https, url){
    
        return{
            fetchMessageObj : function(msgIds, screenName){
                var id, suParams, response, messages, DELIMITER = '$$', ret = {}, messageId = [];

                for (id in msgIds) {
                    messageId.push(msgIds[id]);
                }

                suParams = {
                    'custpage_messageid' : messageId.join(DELIMITER),
                    'custpage_delimiter' : DELIMITER
                };

                if (screenName) {
                    suParams.custpage_pageid = screenName;
                }

                //Request for String translation for messages
                response = https.request({
                                method  : https.getMethod().POST,
                                url     : url.resolveScript({
                                            scriptId    : 'customscript_fam_language_resource',
                                            deploymentId: 'customdeploy_language_resource_deploy',
                                            returnExternalUrl : false}),
                                body    : suParams        
                           });
                //Store chain messages to array
                messages = response.body.split(DELIMITER);
                messages.reverse();

                for (id in msgIds) {
                    ret[id] = messages.pop();
                }

                return ret;
            },
            
            injectMessageParameter : function(strVar, param){
                var returnValue = strVar;
                var paramPattern = /[(]\d[)]/g;

                var paramList = returnValue.match(paramPattern);
                
                for(i in paramList){
                    if (!isNaN(i) && param[i] != null){
                        returnValue = returnValue.replace(paramList[i],param[i]);
                    }
                }
                return returnValue;
            }
    };
});
