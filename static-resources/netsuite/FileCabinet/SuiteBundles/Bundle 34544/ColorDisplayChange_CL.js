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
 * 1.00       02 Jan 2014     ieugenio
 * 
 */

    var FLD_DT_TILE_COLOR               = 'custrecord_ie_tile_bg';
    var FLD_DT_TILE_COLOR_ACTUAL        = 'custrecord_ie_tile_color_actual';
    var FLD_DT_FONT_COLOR               = 'custrecord_ie_font_color';
    var FLD_DT_FONT_COLOR_ACTUAL        = 'custrecord_ie_font_color_actual';
    
/**
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @return {void}
 */
function renderColorFieldChanged(type, name, linenum) {
    if(name == FLD_DT_TILE_COLOR) { // updates actual color field
        var sHexValue = nlapiGetFieldValue(FLD_DT_TILE_COLOR);
        nlapiSetFieldValue(FLD_DT_TILE_COLOR_ACTUAL,'<span style="width:30px;border:solid 1px black;background-color:#'+sHexValue+';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>');
    } else if (name == FLD_DT_FONT_COLOR) { // updates actual color field
        var sHexValue = nlapiGetFieldValue(FLD_DT_FONT_COLOR);
        nlapiSetFieldValue(FLD_DT_FONT_COLOR_ACTUAL,'<span style="width:30px;border:solid 1px black;background-color:#'+sHexValue+';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>');
    } 
}



