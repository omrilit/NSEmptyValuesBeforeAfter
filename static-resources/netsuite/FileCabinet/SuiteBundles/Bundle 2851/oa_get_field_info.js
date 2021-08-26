/**
 * Returns all record (sublist) fields with labels.
 *
 * @param {Object} datain       Object containing all required data.
 *                                                      Properties:
 *                                                              "-record_type" : Record type (ie. 'purchaserequisition')
 *                                                              "-sublist_type": Sublist identifier (ie. 'item') (optional)
 *
 * @return {Object}             Object containing all record (sublist) fields and their labels.
 *                                                      Example: {'action': 'get_field_info', 'result': 1, 'data': {'customer':'Client', ...}}
 */
function get_field_info(datain) {
    var i, record_type = datain["data"]["-record_type"],
        sublist_type = datain["data"]["-sublist_type"],
        result = {},
        field, record = nlapiCreateRecord(record_type);
    var all_fields = (sublist_type ? record.getAllLineItemFields(sublist_type) : record.getAllFields());
    for (i = 0; i < all_fields.length; i++) {
        field = (sublist_type ? record.getLineItemField(sublist_type, all_fields[i], 1) : record.getField(all_fields[i]));
        result[all_fields[i]] = (field ? field.getLabel() : '');
    }
    return {
        'action': 'get_field_info',
        'result': 1,
        'data': result
    };
};