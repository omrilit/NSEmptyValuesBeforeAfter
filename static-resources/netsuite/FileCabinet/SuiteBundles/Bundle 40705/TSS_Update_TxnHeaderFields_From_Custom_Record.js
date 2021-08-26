/**
 * Copyright (c) 1998-2013 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 */

/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 May 2014     dgeronimo
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */



var CUSTREC_TYPE_ID = nlapiGetContext().getSetting('SCRIPT', 'custscript_cust_rec_type'); //---> customrecord_collection_notes
var TRAN_REC_TYPE = nlapiGetContext().getSetting('SCRIPT', 'custscript_tran_rec_type'); //---> invoice
var DEBUG = true
function afterSubmit_updateCustRecFeildsonStdRec(type)
{
    var stLoggerTitle = 'UE afterSubmit_updateCollectionNotes';
    log('DEBUG', stLoggerTitle, '*************************************STARTED************************************');

    try
{
        if (type != 'create' && type != 'delete' && type != 'edit' && type != 'xedit')
        {
            return;
        }

        var filterFieldMapping = [];
        filterFieldMapping.push(new nlobjSearchFilter('custrecord_is_primary_key', null, 'is', 'T'));
        filterFieldMapping.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
        filterFieldMapping.push(new nlobjSearchFilter('custrecord_from_record_type', null, 'is', CUSTREC_TYPE_ID));
        filterFieldMapping.push(new nlobjSearchFilter('custrecord_to_record_type', null, 'is', TRAN_REC_TYPE));

        var columnsMap = [];
        columnsMap.push(new nlobjSearchColumn('custrecord_from_field_id'));

        var objKeyRes = nlapiSearchRecord('customrecord_field_mapping_record', null, filterFieldMapping, columnsMap);

        if (!objKeyRes)
        {
            log('DEBUG', 'No link or join', 'There is no link or join between records ' + CUSTREC_TYPE_ID + ' and ' + TRAN_REC_TYPE);
            return;
        }

        var stCustRecFldId = objKeyRes[0].getValue('custrecord_from_field_id'); //---> custrecord_cn_invoice_link
        var recCustRecord = (type != 'delete') ? nlapiLoadRecord(CUSTREC_TYPE_ID, nlapiGetRecordId()) : nlapiGetNewRecord();
        var stTranId = recCustRecord.getFieldValue(stCustRecFldId); //transaction internal id

        if (!stTranId)
        {
            return;
        }

        //check if the matching field value on the customrecord is equal to the matching field value on the transaction
        //if yes, then proceed with the update, if not then return
        if (type == 'edit' || type == 'xedit')
        {
            //it checks if there is a condition record on the field mapping record in order to continue executing the script
            var arrMatchFld = getMatchingFlagForUpdate(); //----> ['custrecord_to_field_id','custrecord_from_field_id']

            if (arrMatchFld)
{
                var stMatchTranFldVal = nlapiLookupField(TRAN_REC_TYPE, stTranId, arrMatchFld[0]);
                var stMatchCustFldVal = recCustRecord.getFieldValue(arrMatchFld[1]);

                log('DEBUG', stLoggerTitle, 'EDIT MODE id=' + stTranId + ' TRAN_REC_TYPE=' + TRAN_REC_TYPE + ' stMatchCustFldVal=' + arrMatchFld[0] + ' stMatchCustFldVal=' + arrMatchFld[1]);
                log('DEBUG', stLoggerTitle, 'EDIT MODE id=' + stTranId + ' TRAN_REC_TYPE=' + TRAN_REC_TYPE + ' stMatchCustFldVal=' + stMatchTranFldVal + ' stMatchCustFldVal=' + stMatchCustFldVal);

                if (stMatchTranFldVal != stMatchCustFldVal && !isEmpty(stMatchTranFldVal) && !isEmpty(stMatchCustFldVal))
                {
                    return;
                }
            }
        }

        var arrForUpdate = genericFieldMapping(type, recCustRecord);

        if (!arrForUpdate)
        {
            log('DEBUG', 'No Field Mapping Exists', 'No Field Mapping Exists for this record type: ' + CUSTREC_TYPE_ID);
            return;
        }

        var arrFields = arrForUpdate[0];
        var arrValues = arrForUpdate[1];


        if (type == 'delete')
        {
            log('DEBUG', stLoggerTitle, 'Delete Entry');
            //search the prior collection note
            var custField = getCusFieldMapping();
            var filters = new Array();
            filters.push(new nlobjSearchFilter(custField.PrimaryKeyField, null, 'anyof', stTranId));
            filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
            var columns = new Array();

            
            //for (var fld in custField.fields)
            //{
            //    var stColumn = custField.fields[fld];
            //    log('DEBUG', stLoggerTitle, 'Create Search Column : ' + stColumn);
            //    if (custField.fields[fld] == custField.PrimaryKeyField)
            //    {
            //        columns.push(new nlobjSearchColumn(stColumn).setSort(true));
            //    } else
            //    {
            //        columns.push(new nlobjSearchColumn(stColumn)); //.setSort(true));
            //    }
            //}
            columns.push(new nlobjSearchColumn('internalid').setSort(true));
            var results = null;

            try
            {
                results = nlapiSearchRecord(CUSTREC_TYPE_ID, null, filters, columns);
            } catch (error)
            {
                if (error.getDetails != undefined)
                {
                    log('ERROR', 'PROCESS ERROR', error.getCode() + ': ' + error.getDetails());
                    //throw error;
                }
                else
                {
                    log('ERROR', 'Unexpected Error', error.toString());
                    throw nlapiCreateError('99999', error.toString());
                }
            }
            if (results)
{
                //if search  prior collection note has a result get the 1st record 
                log('DEBUG', stLoggerTitle, 'custField.PrimaryKeyField=' + CUSTREC_TYPE_ID);
                log('DEBUG', stLoggerTitle, 'CUSTREC_TYPE_ID=' + CUSTREC_TYPE_ID);
                var i = 0;
                //stTranId = results[i].getValue(custField.PrimaryKeyField);
                var stCnId = results[i].getId();
                recCustRecord = nlapiLoadRecord(CUSTREC_TYPE_ID, stCnId);
                stTranId = recCustRecord.getValue(custField.PrimaryKeyField);

                log('DEBUG', stLoggerTitle, 'DELETE : Searching prior collection(cn) note has a data,Set invoice cn to prior cn \nResults=' + results.length + ',Prior collection nate id=' + stCnId);

                var arrForUpdate = genericFieldMapping('edit', recCustRecord);//use edit to Populate existing values
                arrFields = arrForUpdate[0];
                arrValues = arrForUpdate[1];
                nlapiSubmitField(TRAN_REC_TYPE, stTranId, arrFields, arrValues);

            }
            else
{
                log('DEBUG', stLoggerTitle, 'DELETE : No prior collection(cn) note,Set invoice cn to empty');
                //this will Populate the arrValues as empty string array bec type is = 'delete'
                var arrForUpdate = genericFieldMapping(type, recCustRecord);
                arrFields = arrForUpdate[0];
                arrValues = arrForUpdate[1];
                nlapiSubmitField(TRAN_REC_TYPE, stTranId, arrFields, arrValues);
            }
            nlapiSubmitField(TRAN_REC_TYPE, stTranId, arrFields, arrValues);
            nlapiSetRedirectURL('RECORD', TRAN_REC_TYPE, stTranId);

        } else
        {
            //Submit record if save edit or xedit
            nlapiSubmitField(TRAN_REC_TYPE, stTranId, arrFields, arrValues);
        }

    }
    catch (error)
    {
        if (error.getDetails != undefined)
        {
            log('ERROR', 'PROCESS ERROR', error.getCode() + ': ' + error.getDetails());
            throw error;
        }
        else
        {
            log('ERROR', 'Unexpected Error', error.toString());
            throw nlapiCreateError('99999', error.toString());
        }
    }

    log('DEBUG', stLoggerTitle, '*************************************FINISHED************************************');
}


function getMatchingFlagForUpdate()
{
    var filterFieldMapping = [];
    filterFieldMapping.push(new nlobjSearchFilter('custrecord_is_condition_field', null, 'is', 'T'));
    filterFieldMapping.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
    filterFieldMapping.push(new nlobjSearchFilter('custrecord_from_record_type', null, 'is', CUSTREC_TYPE_ID));
    filterFieldMapping.push(new nlobjSearchFilter('custrecord_to_record_type', null, 'is', TRAN_REC_TYPE));

    var columnsMap = [];
    columnsMap.push(new nlobjSearchColumn('custrecord_to_field_id'));
    columnsMap.push(new nlobjSearchColumn('custrecord_from_field_id'));

    var objKeyRes = nlapiSearchRecord('customrecord_field_mapping_record', null, filterFieldMapping, columnsMap);

    if (!objKeyRes)
    {
        return null;
    }

    return [objKeyRes[0].getValue('custrecord_to_field_id'), objKeyRes[0].getValue('custrecord_from_field_id')]
}



function genericFieldMapping(type, refRecord)
{
    var stLoggerTitle = 'genericFieldMapping';
    log('DEBUG', stLoggerTitle, 'Entry type:' + type);

    var arrFields = [];
    var arrValues = [];

    var filterFieldMapping = [];
    filterFieldMapping.push(new nlobjSearchFilter('custrecord_from_record_type', null, 'is', CUSTREC_TYPE_ID));
    filterFieldMapping.push(new nlobjSearchFilter('custrecord_to_record_type', null, 'is', TRAN_REC_TYPE));
    filterFieldMapping.push(new nlobjSearchFilter('isinactive', null, 'is', 'F')),
    filterFieldMapping.push(new nlobjSearchFilter('custrecord_is_primary_key', null, 'is', 'F'));

    var columnsMap = [];
    columnsMap.push(new nlobjSearchColumn("custrecord_from_field_id"));
    columnsMap.push(new nlobjSearchColumn("custrecord_to_field_id"));

    var objFldMapRes = nlapiSearchRecord('customrecord_field_mapping_record', null, filterFieldMapping, columnsMap);

    nlapiLogExecution('DEBUG', stLoggerTitle, 'TRAN_REC_TYPE = ' + TRAN_REC_TYPE);

    if (!objFldMapRes)
{
        return null;
    }

    for (var i = 0; objFldMapRes && i < objFldMapRes.length; i++) // =0; i < objFldMapRes.length; i++
    {
        var stFldCustRec = objFldMapRes[i].getValue('custrecord_from_field_id');  //---> custrecord_cn_activity_date
        var stFldTran = objFldMapRes[i].getValue('custrecord_to_field_id'); //----> custbody_collections_activity_date        	
        var stFldValue = (type != 'delete') ? refRecord.getFieldValue(stFldCustRec) : '';
        stFldValue = (stFldValue) ? stFldValue : '';

        arrFields.push(stFldTran);
        arrValues.push(stFldValue);
    }

    log('DEBUG', stLoggerTitle, 'Exit');
    return [arrFields, arrValues];
}


function getCusFieldMapping()
{
    var stLoggerTitle = 'genericFieldMapping';
    log('DEBUG', stLoggerTitle, 'ENTRY');

    var arrFields = [];
    var PrimaryKeyField = '';

    log('DEBUG', stLoggerTitle, 'CUSTREC_TYPE_ID : ' + CUSTREC_TYPE_ID);
    log('DEBUG', stLoggerTitle, 'TRAN_REC_TYPE : ' + TRAN_REC_TYPE);

    var filterFieldMapping = [];
    filterFieldMapping.push(new nlobjSearchFilter('custrecord_from_record_type', null, 'is', CUSTREC_TYPE_ID));
    filterFieldMapping.push(new nlobjSearchFilter('custrecord_to_record_type', null, 'is', TRAN_REC_TYPE));
    filterFieldMapping.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
    //filterFieldMapping.push(new nlobjSearchFilter('custrecord_is_primary_key', null, 'is','F'));

    var columnsMap = [];
    columnsMap.push(new nlobjSearchColumn("custrecord_from_field_id"));
    columnsMap.push(new nlobjSearchColumn("custrecord_to_field_id"));
    columnsMap.push(new nlobjSearchColumn("custrecord_is_primary_key"));

    var objFldMapRes = nlapiSearchRecord('customrecord_field_mapping_record', null, filterFieldMapping, columnsMap);

    if (!objFldMapRes)
    {
        return null;
    }


    for (var i = 0; objFldMapRes && i < objFldMapRes.length; i++)
    {

        var stFldCustRec = objFldMapRes[i].getValue('custrecord_from_field_id'); // ---> // custrecord_cn_activity_date
        var bIsTranPrimaryKey = objFldMapRes[i].getValue('custrecord_is_primary_key');
        stFldCustRec = (stFldCustRec == 'id') ? 'internalid' : stFldCustRec;
        arrFields.push(stFldCustRec);
        nlapiLogExecution('DEBUG', '', "column=" + stFldCustRec);
        if (bIsTranPrimaryKey == 'T')
        {
            PrimaryKeyField = stFldCustRec;
            nlapiLogExecution('DEBUG', '', "PrimaryKeyField=" + PrimaryKeyField);
        }
    }

    return ({
        fields: arrFields,
        PrimaryKeyField: PrimaryKeyField
    });

    log('DEBUG', stLoggerTitle, 'Exit');
}


function isEmpty(value)
{
    if (value == null || value == undefined || value == '')
    {
        return true;
    }

    return false;
}

function log(logType, title, details)
{
    if (DEBUG)
    {
        nlapiLogExecution(logType, title, details);
    }
}