/**
 * Copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       03 Apr 2020     earepollo        Initial
 * 2.00       19 May 2020     jmarimla         Payment processing plugin
 * 3.00       21 May 2020     lemarcelo        Tax Calculation and Revenue Management plugin (advancedrevrec)
 * 4.00       09 Sep 2020     lemarcelo        Financial Institution Connectivity plug-in
 * 5.00       10 Sep 2020     earepollo        Email capture plugin
 * 6.00       21 Sep 2020     lemarcelo        Shipping Partners plug-in
 * 7.00       06 Oct 2020     earepollo        Promotions plugin
 */
/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope Public
 */

define(['./../../../apm/ns/lib/apm_ss_library_ss2', 'N/query', 'N/search'],
function(apmServLib2, query, search) {
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    var MSG_TITLE = 'APM_SSA_SL_NEWSCRIPTS';

    var PluginType = {
        "customgllines": {
            queryType : query.Type.CUSTOM_GL_PLUGIN,
            scriptType : 'CUSTOMGLLINES'
        },
        "emailcapture": {
            queryType : query.Type.EMAIL_CAPTURE_PLUGIN,
            scriptType : 'EMAILCAPTURE'
        },
        "ficonnectivity":  {
        queryType : query.Type.FI_CONNECTIVITY_PLUGIN,
            scriptType : 'FICONNECTIVITY'
        },
        "paymentgateway": {
            queryType : query.Type.PAYMENT_GATEWAY_PLUGIN,
            scriptType : 'PAYMENTGATEWAY'
        },
        "promotions": {
            queryType : query.Type.PROMOTIONS_PLUGIN,
            scriptType : 'PROMOTIONS'
        },
        "advancedrevrec":  {
            queryType : query.Type.ADVANCED_REV_REC_PLUGIN,
            scriptType : 'ADVANCEDREVREC'
        },
        "shippingpartners":  {
            queryType : query.Type.SHIPPING_PARTNERS_PLUGIN,
            scriptType : 'SHIPPINGPARTNERS'
        },
        "taxcalculation":  {
            queryType : query.Type.TAX_CALCULATION_PLUGIN,
            scriptType : 'TAXCALCULATION'
        }
     }

    function onRequest(context) {

        var request = context.request;
        var response = context.response;

        MSG_TITLE = 'onRequest variables';
        var isReplyInJSON = '';
        var jsonReturnData = {};
        var params = {};

        var scriptType = '';

        try {

            /*
             * Parameters Set-up
             */
            MSG_TITLE = 'onRequest param set-up';
            if (request) {
                isReplyInJSON = (apmServLib2.isValidObject(request.parameters['is_json']) && request.parameters['is_json'] == 'T') ? request.parameters['is_json'] : 'F';
                scriptType = apmServLib2.isValidObject(request.parameters['scriptType']) ? request.parameters['scriptType'] : '';
            }

            log.debug({
                title: 'onRequest parameters',
                details: request.parameters
            });

            params = {
                scriptType: scriptType
            };

            MSG_TITLE = 'onRequest main start';
            jsonReturnData = {
                success: true,
                message: 'newscripts data loaded',
                total : 0,
                data : [{ id: 0, name: ''}]
            };

            getData(jsonReturnData, params);

        } catch (ex) {
            var body_message = '';
            if (ex instanceof nlobjError) {
                body_message = 'System Error: ' + MSG_TITLE + ': ' + ex.getCode() + ': ' + ex.getDetails();
                log.error({
                    title: MSG_TITLE,
                    details: body_message
                });
            } else {
                body_message = 'Unexpected Error: ' + MSG_TITLE + ': ' + ex;
                log.error({
                    title: MSG_TITLE,
                    details: body_message
                });
            }
            jsonReturnData.success = false;
            jsonReturnData.message = body_message;
        }

        response.addHeader({
            name: 'Content-Type',
            value: 'application/json; charset=UTF-8',
        });
        response.write(JSON.stringify(jsonReturnData));
    }

    function getData(jsonReturnData, params) {
        var resultSet = new Array();

        MSG_TITLE = 'query create';
        var resultSet= {};
        var plugin = PluginType[params.scriptType];

        if (plugin.queryType != undefined){
            var script_query = query.create(
                    {
                        type: plugin.queryType,
                        columns: [
                            { fieldId: 'id' },
                            { fieldId: 'name' }
                        ],
                        filters: []
                    });

            var resultSet =  script_query.runPaged();

            if (resultSet && resultSet.count > 0) {
                for (var i = 0; i < resultSet.pageRanges.length; i++)  {
                    var page = resultSet.fetch(i);

                    for (var j = 0; j < page.pageRange.size; j++)  {
                        var id = page.data.results[j].values[0];
                        var name = page.data.results[j].values[1];

                        jsonReturnData.data.push({
                            id : id.toString(),
                            name : name
                        });
                    }
                }
            }
            jsonReturnData.total = resultSet.count;
        }
        else{
            var script_query = search.create({
                type    : 'script',
                columns : ['name', 'internalId'],
                filters : ['scripttype', 'is', plugin.scriptType]
            });

            var resultSet = apmServLib2.consolidateSearchResults(script_query);

            if (resultSet) {
                for (var i = 0; i < resultSet.length; i++) {
                    jsonReturnData.data.push({
                        id: resultSet[i].id.toString(),
                        name: resultSet[i].getValue('name')
                    });
                }
            }
            jsonReturnData.total = resultSet.count;
        }
    }


    return {
        onRequest: onRequest,
        getData: getData
    };

});