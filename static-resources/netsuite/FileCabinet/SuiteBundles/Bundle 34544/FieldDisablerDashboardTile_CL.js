/**
 * Copyright NetSuite, Inc. 2014 All rights reserved. 
 * The following code is a demo prototype. Due to time constraints of a demo,
 * the code may contain bugs, may not accurately reflect user requirements 
 * and may not be the best approach. Actual implementation should not reuse 
 * this code without due verification.
 * 
 * (Module description here. Whole header length should not exceed 
 * 100 characters in width. Use another line if needed.)
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Jan 2014     ieugenio
 * 
 */

    var REC_DASHBOARD_TILE              = 'customrecord_ie_dashboard_tiles';
    var FLD_DT_NAME                     = 'name';
    var FLD_DT_SAVED_SEARCH             = 'custrecord_ie_saved_search';
    var FLD_DT_ICON                     = 'custrecord_ie_icon';
    var FLD_DT_TILE_COLOR               = 'custrecord_ie_tile_bg';
    var FLD_DT_TILE_COLOR_ACTUAL        = 'custrecord_ie_tile_color_actual';
    var FLD_DT_FONT_COLOR               = 'custrecord_ie_font_color';
    var FLD_DT_FONT_COLOR_ACTUAL        = 'custrecord_ie_font_color_actual';
    var FLD_DT_THRESHOLD                = 'custrecord_ie_treshold';
    var FLD_DT_SEARCH_TYPE              = 'custrecord_ie_search_type';
    var FLD_DT_TILE_TYPE                = 'custrecord_ie_tile_type';
    var FLD_DT_PREFIX                   = 'custrecord_ie_prefix';
    var FLD_DT_SUFFIX                   = 'custrecord_ie_suffix';
    var FLD_DT_BLINK_WHEN               = 'custrecord_ie_blink_when';
    var FLD_DT_THRESHOLD                = 'custrecord_ie_treshold';
    var FLD_DT_ENABLE_ALERTS            = 'custrecord_ie_show_alert_btn';
    var FLD_DT_ALERTS_LABEL             = 'custrecord_ie_alert_button_label';
    var FLD_DT_EMAILS_LIST              = 'custrecord_ie_emails_list';
    var FLD_DT_MESSAGE                  = 'custrecord_ie_message';
    var FLD_DT_DRILLDOWN                = 'custrecord_ie_drilldown_link';
    var FLD_DT_DISPLAY_SIGN_FLAG        = 'custrecord_ie_sign_flag';
    var FLD_DT_VALUE_FROM_FIELD         = 'custrecord_ie_field_based_value';
    var FLD_DT_ROLES                    = 'custrecord_ie_dt_roles';
    var FLD_DT_COMPARE                  = 'custrecord_ie_compare';
    var FLD_DT_COMPARE_SEARCH           = 'custrecord_ie_compare_search';
    var FLD_DT_COMPARE_FIELD            = 'custrecord_ie_compare_field';
    var FLD_DT_COMPARE_TYPE             = 'custrecord_ie_compare_type';
    
    var OPTION_TT_REMINDER              = '1';
    var OPTION_TT_SCORECARD             = '2';
    var OPTION_TT_FIELD_BASED           = '3';

/**
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @return {void}
 */
function configureDashTileFormFieldChanged(type, name, linenum) {
    if (name == FLD_DT_TILE_TYPE) {
        prepareDashboardTileForm();
    }
}

/**
 * 
 * @param type
 */
function configureDashTileFormPageInit(type) {
    if (type == 'edit' || type == 'copy') {
        prepareDashboardTileForm();
    }
}

/**
 * 
 */
function prepareDashboardTileForm() {
    var idTileType = nlapiGetFieldValue(FLD_DT_TILE_TYPE);
    switch(idTileType) {
        case OPTION_TT_REMINDER:
            nlapiDisableField(FLD_DT_SAVED_SEARCH, false);
            nlapiDisableField(FLD_DT_VALUE_FROM_FIELD, true);
            
            // disable comparison fields
            nlapiDisableField(FLD_DT_COMPARE, true);
            nlapiDisableField(FLD_DT_COMPARE_SEARCH, true);
            nlapiDisableField(FLD_DT_COMPARE_FIELD, true);
            nlapiDisableField(FLD_DT_COMPARE_TYPE, true);
            break;
        case OPTION_TT_SCORECARD:
            nlapiDisableField(FLD_DT_SAVED_SEARCH, false);
            nlapiDisableField(FLD_DT_VALUE_FROM_FIELD, true);
            
            // enable comparison fields
            nlapiDisableField(FLD_DT_COMPARE, false);
            nlapiDisableField(FLD_DT_COMPARE_SEARCH, false);
            nlapiDisableField(FLD_DT_COMPARE_FIELD, false);
            nlapiDisableField(FLD_DT_COMPARE_TYPE, false);
            break;
        case OPTION_TT_FIELD_BASED:
            nlapiDisableField(FLD_DT_SAVED_SEARCH, true);
            nlapiDisableField(FLD_DT_VALUE_FROM_FIELD, false);
            
            // disable comparison fields
            nlapiDisableField(FLD_DT_COMPARE, true);
            nlapiDisableField(FLD_DT_COMPARE_SEARCH, true);
            nlapiDisableField(FLD_DT_COMPARE_FIELD, true);
            nlapiDisableField(FLD_DT_COMPARE_TYPE, true);
            break;
        default:
            break;
    }
}