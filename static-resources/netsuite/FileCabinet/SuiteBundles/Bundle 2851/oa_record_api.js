/**
 * Triggers passed action, process it and return result.
 * Main POST restlet function.
 *
 * @param {Object} datain       Object containing all records data to process.
 *                                                      Example:
 *                                                              {"action":"addRecord",
 *                                                               "data"  :[
 *                                                                      {
 *                                                                              "-type"    :"purchaserequisition",
 *                                                                              "-values"  :{"entity":4, "subsidiary":1},
 *                                                                              "-sublists":{"item":[{"quantity":12, "item":54}]}
 *                                                                      }
 *                                                                ]
 *                                                              }
 * @return {Object}             Object with results of requested action.
 *                                                      Example:
 *                                                              {"result":1, // "data" doesn't exist if "result" == 0,"error" param instead "data" with error info
 *                                                               "data"  :"[
 *                                                                      {"result":0, // "error" doesn't exists if "result" == 1, "data" param instead "error"
 *                                                                   "action":"addRecord",
 *                                                                       "error" :{"type":"system","code":"INVALID_FLD_VALUE","message":"NS message"}}
 *                                                               ]
 *                                                              }
 */
function runAction(datain) {
    var result;

    // Process appropriate action
    switch (datain.action) {
        case "getRecord":

            // Identify timezone just once at the beginning to be able to adjust it to OA tz
            var tz = nlapiGetContext().getSetting('PREFERENCE', 'TIMEZONE');

            // Get result
            result = actionList(datain.action, datain.data, tz);
            break;
        case "addRecord":
        case "updateRecord":
        case "upsertRecord":
        case "deleteRecord":
            result = actionList(datain.action, datain.data);
            break;
        default:
            result = {
                result: 0,
                error: "Invalid record api action (" + datain.action + ")."
            };
    }

    // Add action info
    result.action = datain.action;

    return result;
}

/*
 * Process action for each record data in list and return results.
 *
 * @param {String}      action  Required action to process. Supports: "(get|add|update|upsert|delete)Record"
 * @param {Array}       list    Required array of record's data to process.
 * @param {tz}          tz      User's timezone. Optional. Now used only for getAction.
 *
 * @return {Object}             Object containing boolean "result" and processed "data" record array.
 */
function actionList(action, list, tz) {
    var i, result = [];
    for (i = 0; i < list.length; i++) {
        result[i] = eval(action)(list[i], tz);
    }

    return {
        'result': 1,
        'data': JSON.stringify(result)
    };
}

/*
 * Get record API.
 *
 * @param {Object} datain       Record data definition to get.
 *                                                      Properties:
 *                                                              "-type"              : Record type (ie. 'purchaserequisition')
 *                                                              "-recordInternalId"  : Internal record Id (ie. 10)
 *                                                              "-fields"            : Array of fields to return. Returns all if not specified. (ie. ['name','memo','custbody_1'])
 *                                                              "-sublists"          : Array of sublists to return (ie. ['expense','item'])
 * @param {String} tz           User's timezone.
 *
 * @return {Object}             Object containing boolean "result" and requested record "data" or "error" description.
 */
function getRecord(datain, tz) {
    var i, line_number, record_line, fields, sublists_fields, sublists_length, field_value, field_obj, field_date_obj, record;
    var record_data = {},
        response = {},
        sublists = datain["-sublists"];

    try {

        // Load record
        record = nlapiLoadRecord(datain["-type"], datain["-recordInternalId"]);

        // Get required fields or all if not specified
        fields = datain["-fields"].length > 0 ? datain["-fields"] : record.getAllFields();
        for (i = 0; i < fields.length; i++) {
            record_data[fields[i]] = getFormattedFieldValue(record, fields[i], tz);
        };

        // Get required sublists or none if required
        sublists_length = sublists.length;
        if (sublists_length > 0) {
            record_data['sublists'] = {};
            for (i = 0; i < sublists_length; i++) {
                record_data['sublists'][sublists[i]] = getRecordSublist(record, sublists[i], tz);
            }
        }

        response = {
            'result': 1,
            'data': record_data
        }
    } catch (e) {
        response = errorMessageFrom(e);
    }

    return response;
}

/*
 * Add record API.
 *
 * @param {Object} datain       Record data definition to add.
 *                                                      Properties:
 *                                                              "-type"                         : Record type (ie. 'purchaserequisition')
 *                                                              "-values"                       : Object of values as keys with it's data as value to add. (ie. {'name':'A','memo':'B'})
 *                                                              "-sublists"                     : Object of sublists as keys with it's data in array to add (ie. {'item':['item_id':'1', 'name':'A'],['item_id':2,'name':'B']})
 *
 * @return {Object}             Object containing boolean "result" and requested record "data" (containing just "id") or "error" description.
 */
function addRecord(datain) {
    var record, key, field_type, response, sublist_key;
    var sublists = datain["-sublists"],
        values = datain["-values"];

    try {
        // Create record
        record = nlapiCreateRecord(datain["-type"]);

        // Set record values
        for (key in values) {
            setFormattedFieldValue(record, key, values[key]);
        };

        // Set sublist data if required
        for (sublist_key in sublists) {
            setRecordSublist(record, sublist_key, sublists[sublist_key]);
        }

        // Submit record
        response = {
            'result': 1,
            'data': {
                'id': nlapiSubmitRecord(record, true)
            }
        };
    } catch (e) {
        response = errorMessageFrom(e);
    }
    return response;
}

/*
 * Delete record API.
 *
 * @param {Object} datain       Record data definition to delete.
 *                                                      Properties:
 *                                                              "-type"                  : Record type (ie. 'purchaserequisition')
 *                                                              "-recordInternalId"      : Internal record ID to delete
 *
 * @return {Object}             Object containing boolean "result" and requested record "data" (containing just "id") or "error" description.
 */
function deleteRecord(datain) {
    var response;

    try {
        response = {
            'result': 1,
            'data': {
                'id': nlapiDeleteRecord(datain["-type"], datain["-recordInternalId"])
            }
        };
    } catch (e) {
        response = errorMessageFrom(e);
    }
    return response;
}

/*
 * Update record API. Passed sublists everytime replace ALL related sublists as it's made by our SOAP WS.
 *
 * @param {Object} datain       Record data definition to update.
 *                                                      Properties:
 *                                                              "-type"                         : Record type (ie. 'purchaserequisition')
 *                                                              "-values"                       : Object of values as keys with it's data as value to update. (ie. {'name':'A','memo':'B'})
 *                                                              "-sublists"                     : Object of sublists as keys with it's data in array to update (ie. {'item':['item_id':'1', 'name':'A'],['item_id':2,'name':'B']})
 *
 * @return {Object}             Object containing boolean "result" and requested record "data" (containing just "id") or "error" description.
 */
function updateRecord(datain) {
    var i, record, response, sublist_key;
    var sublists = datain["-sublists"],
        values = datain["-values"];

    try {

        // Load record
        record = nlapiLoadRecord(datain["-type"], datain["-recordInternalId"]);

        // Update required fields
        for (key in values) {
            setFormattedFieldValue(record, key, values[key]);
        };

        // Set sublist data if required
        for (sublist_key in sublists) {
            setRecordSublist(record, sublist_key, sublists[sublist_key]);
        }

        response = {
            'result': 1,
            'data': {
                'id': nlapiSubmitRecord(record, true)
            }
        };

    } catch (e) {
        response = errorMessageFrom(e);
    }

    return response;
}

/*
 * Upsert record API. (Add or Update)
 * Tries to search record by "-recordExternalId". Adds new record if search didn't find any record with this external ID otherwise updates existing record.
 *
 * @param {Object} datain       Record data definition to add or update (see addRecord and updateRecord doc for available properties).
 *                                                      Additional properties:
 *                                                              "-recordExternalId"     : Record external ID (ie. 10)
 *
 * @return {Object}             Object containing boolean "result" and requested record "data" (containing just "id") or "error" description.
 */
function upsertRecord(datain) {
    var records = nlapiSearchRecord(datain["-type"], null, new nlobjSearchFilter('externalid', null, 'is', datain["-recordExternalId"]), null);

    // Populate external ID
    datain["-values"]["externalid"] = datain["-recordExternalId"];

    if (records != null && records.length === 1) {

        // Update
        datain["-recordInternalId"] = records[0].getId();
        return updateRecord(datain);
    } else {

        // Add
        return addRecord(datain);
    }
}

/*
 * Creates valid response message from passed exception.
 *
 * @param {Exception} e         Catched exception
 *
 * @return {Object}             Object with error description.
 */
function errorMessageFrom(e) {
    var response = {
        'result': 0,
        'data': undefined,
        'error': {
            'type': 'unexpected',
            'code': '',
            'message': e.toString()
        }
    };
    if (e instanceof nlobjError) {
        response['error']['type'] = 'system';
        response['error']['code'] = e.getCode();
        response['error']['message'] = e.getDetails();
    }
    return response;
}

/*
 * Get record sublist containing all line items.
 *
 * @param {nlobjRecord} record  SuiteScript record
 * @param {String}      sublist Sublist identifier
 * @param {String}      tz      User's timezone
 *
 * @return {Array}              Array with objects containing all line items data
 */
function getRecordSublist(record, sublist, tz) {
    var line_number, result = [],
        sublists_fields = record.getAllLineItemFields(sublist),
        lines_count = record.getLineItemCount(sublist);

    for (line_number = 0; line_number < lines_count; line_number++) {
        record_line = {};
        for (j = 0; j < sublists_fields.length; j++) {
            record_line[sublists_fields[j]] = getFormattedFieldValue(record, sublists_fields[j], tz, line_number + 1, sublist);
        };
        result.push(record_line);
    }
    return result;
}

/*
 * Set record sublist. Everytime replace current sublist data with passed sublist_data.
 *
 * @param {nlobjRecord} record          SuiteScript record
 * @param {String}      sublist         Sublist identifier
 * @param {Array}       sublist_data    Array of objects containing sublist's data to set
 *
 * @return {Array}                      Array with objects containing all line items data
 */
function setRecordSublist(record, sublist, sublist_data) {
    var i, j, count = record.getLineItemCount(sublist);

    // Remove all sublist items (the same workflow is implemented in our SOAP WS) if it's not a new record
    for (i = 0; i < count; i++) {
        record.removeLineItem(sublist, 1);
    }

    // Add all new sublist items
    for (j = 0; j < sublist_data.length; j++) {
        record.selectNewLineItem(sublist);
        for (var item_key in sublist_data[j]) {
            setFormattedFieldValue(record, item_key, sublist_data[j][item_key], sublist);
        }
        record.commitLineItem(sublist);
    }
}

/*
 * Returns field type.
 *
 * @param {nlobjRecord} record          SuiteScript record
 * @param {String}      field_name      Field identifier
 * @param {String}      sublist         Sublist identifier if it's sublist field (optional)
 *
 * @return {String}                     Field type (ie. 'checkbox')
 */
function get_field_type(record, field_name, sublist) {
    var field_obj = (sublist ? record.getLineItemField(sublist, field_name, 1) : record.getField(field_name));
    return field_obj && field_obj.getType();
}

/*
 * Formats NS field value to OA format.
 *
 * @param {nlobjRecord} record          SuiteScript record
 * @param {String}      field_name      Field identifier
 * @param {String}      tz              User's timezone
 * @param {Number}      line_number     Sublist line number (optional)
 * @param {String}      sublist         Sublist identifier (optional)
 *
 * @return {String}                     OA formatted field value
 */
function getFormattedFieldValue(record, field_name, tz, line_number, sublist) {
    var field_date_obj, field_date_value, field_value, field_type = get_field_type(record, field_name, sublist);

    // Date/Datetime fields needs to be transformed to unified ISO format
    if (field_type && field_type.indexOf('date') > -1) {
        field_value = oa_datetime_format((
                line_number > 0 ? record.getLineItemDateTimeValue(sublist, field_name, line_number, tz) :
                record.getDateTimeValue(field_name, tz)),
            field_type
        );
    } else {
        field_value = (
            line_number > 0 ? record.getLineItemValue(sublist, field_name, line_number) :
            record.getFieldValue(field_name)
        );

        // Transform NS boolean to OA boolean
        if (field_type && field_type.indexOf('checkbox') > -1) {
            field_value = ([1, '1', 'true', 'TRUE', 'T'].indexOf(field_value) > -1 ? '1' : '');
        }
    }
    return field_value;
}

/*
 * Formats OA field value to NS format and set it on passed record.
 *
 * @param {nlobjRecord} record          SuiteScript record
 * @param {String}      field_name      Field identifier
 * @param {String}      sublist         Sublist identifier (optional). Sets current line item.
 *
 * @return {void}
 */
function setFormattedFieldValue(record, field_name, value, sublist) {
    var field_type = get_field_type(record, field_name, sublist);

    if (value !== undefined && field_type && field_type.indexOf('date') > -1) {
        value = ns_datetime_format(value, field_type);
    } else if (field_type && field_type.indexOf('checkbox') > -1) {

        // Transform OA boolean to NS boolean
        value = ([1, '1', 'true', 'TRUE', 'T'].indexOf(value) > -1 ? 'T' : 'F');
    }

    if (sublist !== undefined) {
        record.setCurrentLineItemValue(sublist, field_name, value);
    } else {
        record.setFieldValue(field_name, value);
    }
}

/*
 * Converts passed NS date/datetime string to OA mysql date/datetime string.
 *
 * @param {String}      ns_date_field_value     NS date/datetime field value formatted according to user's preferences
 * @param {String}      type                    Field type. ("date" or "datetime")
 *
 * @return {String}                             OA mysql date/datetime string
 */
function oa_datetime_format(ns_date_field_value, type) {
    var result, date = nlapiStringToDate(ns_date_field_value, type);
    if (date) {
        result = date.getFullYear() + '-' +
            ('00' + (date.getMonth() + 1)).slice(-2) + '-' +
            ('00' + date.getDate()).slice(-2);

        if (date.getHours() > 0 || date.getMinutes() > 0 || date.getSeconds()) {
            result += ' ' + ('00' + date.getHours()).slice(-2) + ':' +
                ('00' + date.getMinutes()).slice(-2) + ':' +
                ('00' + date.getSeconds()).slice(-2);
        }
        return result;
    } else {
        return ns_date_field_value;
    }
}

/*
 * Convert passed OA mysql date/datetime string to NS date/datetime string.
 *
 * @param {String}      oa_date_field_value     OA mysql date/datetime string
 * @param {String}      type                    Field type. ("date" or "datetime")
 *
 * @return {String}                             NS date/datetime string
 */
function ns_datetime_format(oa_date_field_value, type) {
    return nlapiDateToString(new Date(Date.parse(oa_date_field_value.replace(/-/g, '/'))), type);
}
