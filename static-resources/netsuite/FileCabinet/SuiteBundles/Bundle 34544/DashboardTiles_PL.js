/**
 * Copyright NetSuite, Inc. 2013 All rights reserved. 
 * The following code is a demo prototype. Due to time constraints of a demo,
 * the code may contain bugs, may not accurately reflect user requirements 
 * and may not be the best approach. Actual implementation should not reuse 
 * this code without due verification.
 * 
 * (Module description here. Whole header length should not exceed 
 * 100 characters in width. Use another line if needed.)
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Dec 2013     ieugenio
 * 1.01       13 Jun 2014     rmorrissey       Added variable blink delay support
 * 1.02       08 Aug 2014     fteves               Added variable font sizes support
 */
    
    var REC_DASHBOARD_TILE              = 'customrecord_ie_dashboard_tiles';
    var FLD_DT_NAME                     = 'name';
    var FLD_DT_SAVED_SEARCH             = 'custrecord_ie_saved_search';
    var FLD_DT_ICON                     = 'custrecord_ie_icon';
    var FLD_DT_TILE_COLOR               = 'custrecord_ie_tile_bg';
    var FLD_DT_FONT_COLOR               = 'custrecord_ie_font_color';
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
    var FLD_DT_AUTO_RUN_SCRIPT          = 'custrecord_ie_auto_run_script';
    var FLD_DT_SCRIPT_ID                = 'custrecord_ie_script_id';
    var FLD_DT_DEPLOY_ID                = 'custrecord_ie_deploy_id';
    
    var PARAM_TILE_CONTAINER_ID         = 'custscript_ie_div_id';
    var PARAM_AUTO_REFRESH              = 'custscript_ie_auto_refresh';
    var PARAM_PORTLET_IDENTIFIER        = 'custscript_ie_portlet_identifier';
    var PARAM_REFRESH_INTERVAL          = 'custscript_ie_refresh_interval';
    var PARAM_BLINK_DELAY = 'custscript_ie_blink_delay';

    //Start - Kiko 
    var PARAM_NUMBER_FONT_SIZE = 'custscript_ie_number_font_size';
    var PARAM_DETAIL_LINE_FONT_SIZE = 'custscript_ie_detail_line_font_size';
    //End - Kiko 
    
    var OPTION_TT_REMINDER              = '1';
    var OPTION_TT_SCORECARD             = '2';
    var OPTION_TT_FIELD_BASED           = '3';
    
    var OPTION_CP_GREATER_THAN          = '1';
    var OPTION_CP_LESS_THAN             = '2';
    var OPTION_CP_GREATER_THAN_OR_EQUAL = '3';
    var OPTION_CP_LESS_THAN_OR_EQUAL    = '4';
    
    var OPTION_CT_VARIANCE              = '1';
    var OPTION_CT_RATIO                 = '2';
    var OPTION_CT_DIFFERENCE            = '3';
    
/**
 * @param {nlobjPortlet} portlet Current portlet object
 * @param {Number} column Column position index: 1 = left, 2 = middle, 3 = right
 * @return {void}
 */
function dashboardTilesPortlet(portlet, column) {
    var oContext = nlapiGetContext();
    var sTilesContainer = oContext.getSetting('SCRIPT', PARAM_TILE_CONTAINER_ID);
    var bAutoRefresh = oContext.getSetting('SCRIPT', PARAM_AUTO_REFRESH);
    var sPortletId = oContext.getSetting('SCRIPT', PARAM_PORTLET_IDENTIFIER);
    var sRefreshInterval = oContext.getSetting('SCRIPT', PARAM_REFRESH_INTERVAL);
    
    portlet.setTitle('Business Alerts');
    //portlet.setScript('setInterval(function() { window.parent.refreshPortlet("servercontentneg'+sPortletId+'","SCRIPTPORTLET-'+sPortletId+'", false, "-29",null,null, null); }, '+sRefreshInterval+');');
    
    var aDashTiles  = getAllDashboardTiles();
    var sHtml       = renderAllTiles(aDashTiles);
    var sScript = [];
    sScript.push('<script type="text/javascript">');
    if (bAutoRefresh=='T') {
        sScript.push('setInterval(function() { window.parent.refreshPortlet("servercontentneg'+sPortletId+'","SCRIPTPORTLET-'+sPortletId+'", false, "-29",null,null, null); }, '+sRefreshInterval+');');
    }
    
    // sScript.push('parent.document.getElementById("'+sTilesContainer+'").innerHTML = "' + sHtml + '";');
    sScript.push('</script>');
    
    portlet.setHtml(sScript.join('') + sHtml);
//    portlet.setHtml(sScript.join(''));
}

/**
 * 
 */
function getAllDashboardTiles() {
    var idRole = nlapiGetRole();
    
    var aTiles = [], aFilters = [], aColumns = [], oResult = {};
    aFilters[0] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
    aFilters[1] = new nlobjSearchFilter(FLD_DT_ROLES, null, 'anyof', [idRole]);
    
    aColumns[0] = new nlobjSearchColumn(FLD_DT_NAME);
    aColumns[1] = new nlobjSearchColumn(FLD_DT_SAVED_SEARCH);
    aColumns[2] = new nlobjSearchColumn(FLD_DT_THRESHOLD);
    aColumns[3] = new nlobjSearchColumn(FLD_DT_TILE_COLOR);
    aColumns[4] = new nlobjSearchColumn(FLD_DT_FONT_COLOR);
    aColumns[5] = new nlobjSearchColumn(FLD_DT_SEARCH_TYPE);
    aColumns[6] = new nlobjSearchColumn(FLD_DT_TILE_TYPE);
    aColumns[7] = new nlobjSearchColumn(FLD_DT_PREFIX);
    aColumns[8] = new nlobjSearchColumn(FLD_DT_SUFFIX);
    aColumns[9] = new nlobjSearchColumn(FLD_DT_DRILLDOWN);
    aColumns[10] = new nlobjSearchColumn(FLD_DT_ICON);
    aColumns[11] = new nlobjSearchColumn(FLD_DT_ENABLE_ALERTS);
    aColumns[12] = new nlobjSearchColumn(FLD_DT_DISPLAY_SIGN_FLAG);
    aColumns[13] = new nlobjSearchColumn(FLD_DT_VALUE_FROM_FIELD);
    aColumns[14] = new nlobjSearchColumn(FLD_DT_BLINK_WHEN);
    aColumns[15] = new nlobjSearchColumn(FLD_DT_COMPARE);
    aColumns[16] = new nlobjSearchColumn(FLD_DT_COMPARE_SEARCH);
    aColumns[17] = new nlobjSearchColumn(FLD_DT_COMPARE_FIELD);
    aColumns[18] = new nlobjSearchColumn(FLD_DT_COMPARE_TYPE);
    aColumns[19] = new nlobjSearchColumn(FLD_DT_AUTO_RUN_SCRIPT);
    aColumns[20] = new nlobjSearchColumn(FLD_DT_SCRIPT_ID);
    aColumns[21] = new nlobjSearchColumn(FLD_DT_DEPLOY_ID);
    
    var aResults = nlapiSearchRecord(REC_DASHBOARD_TILE, null, aFilters, aColumns);
    if (aResults) {
        var idBlinkWhen     = '';
        var idCompareSearch = '';
        var idCompareType   = '';
        var sDeployId       = '';
        var idSavedSearch   = '';
        var idTile          = '';
        var nTileType       = '';
        var sCompareField   = '';
        var sDetailLine     = '';
        var sDrillDown      = '';
        var sFieldValue     = '';
        var sIcon           = '';
        var sName           = '';
        var sPrefix         = '';
        var sScriptId       = '';
        var sSign           = '';
        var sSuffix         = '';
        var sSearchType     = '';
        var sThreshold      = '';
        var sTileColor      = '';
        var sFontColor      = '';
        var bAutoRunScript  = false;
        var bCompare        = false;
        var bSign           = false;
        var bAlerts         = false;
        var bIsBlinking     = false;
        
        for (var i=0;i<aResults.length;i++) {
            oResult         = aResults[i];
            
            idTile          = oResult.getId();
            sName           = oResult.getValue(aColumns[0]);
            idSavedSearch   = oResult.getValue(aColumns[1]);
            sThreshold      = oResult.getValue(aColumns[2]);
            sTileColor      = oResult.getValue(aColumns[3]);
            sFontColor      = oResult.getValue(aColumns[4]);
            sSearchType     = oResult.getValue(aColumns[5]);
            nTileType       = oResult.getValue(aColumns[6]);
            sPrefix         = oResult.getValue(aColumns[7]);
            sSuffix         = oResult.getValue(aColumns[8]);
            sDrillDown      = oResult.getValue(aColumns[9]);
            sIcon           = oResult.getValue(aColumns[10]);
            bAlerts         = oResult.getValue(aColumns[11]);
            bSign           = oResult.getValue(aColumns[12]);
            sFieldValue     = oResult.getValue(aColumns[13]);
            idBlinkWhen     = oResult.getValue(aColumns[14]);
            bCompare        = oResult.getValue(aColumns[15]);
            idCompareSearch = oResult.getValue(aColumns[16]);
            sCompareField   = oResult.getValue(aColumns[17]);
            idCompareType   = oResult.getValue(aColumns[18]);
            bAutoRunScript  = oResult.getValue(aColumns[19]);
            sScriptId       = oResult.getValue(aColumns[20]);
            sDeployId       = oResult.getValue(aColumns[21]);
            sDetailLine     = '';
            
            var aResultSet = [], aSearchColumns = [], sValue = '';
            
            // get value based on tile type
            var recSavedSearch = {}, recSavedSearchCompare = {}, oResult = {}, oCompareResult = {};
            var aCompareResultSet = {}, aResultSet = {};
            if (nTileType==OPTION_TT_REMINDER) {
                if (sSearchType) { 
                    recSavedSearch = nlapiLoadSearch(null, idSavedSearch);
                    recSavedSearch.setColumns([new nlobjSearchColumn('internalid', null, 'count')]);
                    
                    aResultSet = recSavedSearch.runSearch();
                    oResult = aResultSet.getResults(0, 1)[0];
                    
                    aSearchColumns = oResult.getAllColumns();
                    sValue = oResult.getValue(aSearchColumns[0]);
                }
            } else if (nTileType==OPTION_TT_SCORECARD) {
                // to do: complex mechanics
                if (sSearchType) {
                    recSavedSearch          = nlapiLoadSearch(null, idSavedSearch);
                    var aOriginalColumns    = recSavedSearch.getColumns();
                    var aNewColumns         = buildValueColumn(aOriginalColumns);
                    recSavedSearch.setColumns(aNewColumns);
                    
                    aResultSet      = recSavedSearch.runSearch();
                    var sDataValue  = '0.0';
                    oResult         = aResultSet.getResults(0, 1)[0];
                    if (oResult) {
                        var sDataTemp = oResult.getValue(aNewColumns[0]);
                        if (sDataTemp) {
                            sDataValue = sDataTemp;
                        }
                    }
                    
                    if (bCompare == 'T') {
                        recSavedSearchCompare   = nlapiLoadSearch(sSearchType, idCompareSearch);
                        var aOriginalColumns    = recSavedSearchCompare.getColumns();
                        var aNewColumns         = buildValueColumn(aOriginalColumns);
                        recSavedSearchCompare.setColumns(aNewColumns);
                        
                        aCompareResultSet       = recSavedSearchCompare.runSearch();
                        oCompareResult          = aCompareResultSet.getResults(0, 1)[0];
                        var sDataCompare        = oCompareResult.getValue(aNewColumns[0]);
                        
//                        nlapiLogExecution('DEBUG', 'sDataCompare', sDataCompare);
//                        nlapiLogExecution('DEBUG', 'sDataValue', sDataValue);
                        sValue = parseFloat(sDataValue) - parseFloat(sDataCompare);
                        
                        sDetailLine = 'Current: ' + numberWithCommas(sDataValue) + '<br/>Previous: ' + numberWithCommas(sDataCompare);
                        
                        switch (idCompareType) {
                            case OPTION_CT_VARIANCE:
                                sValue = Math.round((parseFloat(sDataValue) - parseFloat(sDataCompare)) / parseFloat(sDataValue) * 100)/100;
                                break;
                            case OPTION_CT_RATIO:
                                sValue = parseFloat(sDataValue)/parseFloat(sDataCompare);
                                break;
                            case OPTION_CT_DIFFERENCE:
                                sValue = parseFloat(sDataValue) - parseFloat(sDataCompare);
                                break;
                            default:
                                break;
                        }
                        
                    } else {
                        sDetailLine = '';
                        sValue = sDataValue;
                    }
                }
            } else if (nTileType==OPTION_TT_FIELD_BASED) {
                sValue = sFieldValue;
            } else {
                // this script shouldn't run bec tile type is mandatory
                recSavedSearch = nlapiLoadSearch(sSearchType, idSavedSearch);
                recSavedSearch.setColumns([new nlobjSearchColumn('internalid', null, 'count')]);
                
                aResultSet = recSavedSearch.runSearch();
                oResult = aResultSet.getResults(0, 1)[0];
                
                aSearchColumns = oResult.getAllColumns();
                sValue = oResult.getValue(aSearchColumns[0]);
            }
            
            bIsBlinking = shouldIconBlink(sValue, sThreshold, idBlinkWhen);
            sSign = getValueSign(sValue, bSign);
            sValue = formatProperly(sValue);
            autoRunScript(bAutoRunScript, sScriptId, sDeployId, idTile);
            
            aTiles.push(
                {
                    id: idTile,
                    name: sName,
                    search: idSavedSearch,
                    threshold: sThreshold,
                    tilecolor: sTileColor,
                    fontcolor: sFontColor,
                    value: sValue,
                    type: nTileType,
                    searchtype: sSearchType,
                    prefix: sPrefix,
                    suffix: sSuffix,
                    drilldown: sDrillDown,
                    icon: sIcon,
                    alertson: bAlerts,
                    sign: sSign,
                    isblinking : bIsBlinking,
                    detail : sDetailLine
                }
            );
        }
    }
    return aTiles;
}

/**
 * Find the first currency column of the search, then creates new search column
 * as the sum of that currency column.
 * @param aOriginalColumns
 * @returns {Array}
 */
function buildValueColumn(aOriginalColumns) {
    var aColumns = [];
    for (var i=0;i<aOriginalColumns.length;i++) {
        var oColumn = aOriginalColumns[i];
        var sName = oColumn.getName();
        var sType = oColumn.getType();
        var sJoin = oColumn.getJoin();
        var sFunction = oColumn.getFunction();
        var sFormula = oColumn.getFormula();
        var sSort = oColumn.getSort();
        
        nlapiLogExecution('DEBUG', 'sName', sName);
        nlapiLogExecution('DEBUG', 'sType', sType);
        
        if (sType == 'currency' || sType == 'integer' || sType == 'float' || sType == 'decimal') {
            var oNewCol = new nlobjSearchColumn(sName, sJoin, 'sum');
            oNewCol.setFormula(sFormula);
            oNewCol.setSort(sSort);
            
            aColumns.push(oNewCol);
            return aColumns;
        }
    }
    return aColumns;
}

/**
 * 
 * @param aTiles
 * @returns {Array}
 */
function renderAllTiles(aTiles) {
    var aHtml = [];
    aHtml.push(renderStylesheet(aTiles));
    aHtml.push(renderData(aTiles));
    return aHtml.join('');
}

/**
 * 
 * @param aTiles
 * @returns
 */
function renderStylesheet(aTiles) {
    var sBlinkDelay = nlapiGetContext().getSetting('SCRIPT', PARAM_BLINK_DELAY);
    sBlinkDelay = (sBlinkDelay && sBlinkDelay.length > 0) ? sBlinkDelay : 1;

    //Start - Kiko
    var sNumberFontSize =  nlapiGetContext().getSetting('SCRIPT', PARAM_NUMBER_FONT_SIZE);
    sNumberFontSize = (sNumberFontSize && sNumberFontSize .length > 0) ? sNumberFontSize : 16;
    //End - Kiko

    var aStyle = [ 
           '<style>',
        '@-webkit-keyframes blink {',
            '0% {',
                'opacity: 1;',
            '}',
            '50% {',
                'opacity: 0;',
            '}',
            '100% {',
                'opacity: 1;',
            '}',
        '}',
        '@-moz-keyframes blink {',
            '0% {',
                'opacity: 1;',
            '}',
            '50% {',
                'opacity: 0;',
            '}',
            '100% {',
                'opacity: 1;',
            '}',
        '}',
        '@-o-keyframes blink {',
            '0% {',
                'opacity: 1;',
            '}',
            '50% {',
                'opacity: 0;',
            '}',
            '100% {',
                'opacity: 1;',
            '}',
        '}',
        '.blinker {',
            'animation: blink ' + sBlinkDelay + 's;',
            '-webkit-animation: blink ' + sBlinkDelay + 's;',
            '-webkit-animation-iteration-count: infinite;',
            '-moz-animation: blink ' + sBlinkDelay + 's;',
            '-moz-animation-iteration-count: infinite;',
            '-o-animation: blink ' + sBlinkDelay + 's;',
            '-o-animation-iteration-count: infinite;',
        '}',
        '.detailline {',
            'font-size: 12px;',
        '}',
        '.tiles_container {',
            'margin: 0px -5px 0px 0px;',
        '}',
        '.text_wrapper {',
            'position: absolute;',
            'top: 0px;',
            'right: 5px;',
            'height: 100px;',
        '}',
    ];
    aStyle.push('h1 {');
    //Start - Kiko
    //aStyle.push('font-size: 16pt;');
    aStyle.push('font-size:' + sNumberFontSize + 'pt;');
    //End - Kiko
    aStyle.push('font-family: Open Sans,Helvetica,sans-serif;');
    aStyle.push('}');
    for (var i=0;i<aTiles.length;i++) {
        aStyle.push(buildTileStyle(aTiles[i]));
    }
    aStyle.push('</style>');
    return aStyle.join(''); 
}

/**
 * 
 * @param oTile
 * @returns
 */
function buildTileStyle(oTile) {
    //Start - Kiko
    var sDetailLineFontSize =  nlapiGetContext().getSetting('SCRIPT', PARAM_DETAIL_LINE_FONT_SIZE);
    sDetailLineFontSize = (sDetailLineFontSize && sDetailLineFontSize .length > 0) ? sDetailLineFontSize : 10;
    //End - Kiko

    var aStyle = [
        '#sdg_tile_' + oTile.id+ '{',
            'vertical-align: middle;',
            'text-align: right;',
            'background: #' + oTile.tilecolor+ ';',
            'color: #' + oTile.fontcolor+ ';',
            'width: calc(25% - 10px);',
            'height: 100px;',
            'border-radius: 5px;',
            'float: left;',
            'margin: 5px 5px 5px 0px;',
            'min-width:200px;',
            'padding: 5px 5px 5px 0px;',
            'position: relative;',
        '}',
        '.dt_links {',
            'color: #' + oTile.fontcolor+ ' !important;',
            'text-decoration: none;',
            //Start - Kiko
            'font-size:' + sDetailLineFontSize + 'pt;',
            //End - Kiko
        '}',
        //Start - Kiko
        '.dt_links_edit {',
            'color: #' + oTile.fontcolor+ ' !important;',
            'text-decoration: none;',
        '}',
        //End - Kiko
        '#sdg_tile_' + oTile.id+ ' .bottom_box {',
            'color: #' + oTile.fontcolor+ ';',
            'text-decoration: none;',
            'font-size: 8px;',
            'position: absolute;',
            'bottom: 2px;',
            'right: 0px;',
        '}',
        '.bottom_box a{',
            'color: #' + oTile.fontcolor+ ';',
            'text-decoration: none;',
        '}'
    ];
    return aStyle.join(''); 
}

/**
 * 
 * @param aTiles
 * @returns
 */
function renderData(aTiles) {
    var aData = [];
    aData.push("<div class='tiles_container'>");
    for (var i=0;i<aTiles.length;i++) {
        aData.push(buildTileData(aTiles[i]));
    }
    aData.push("</div>");
    aData.push("<p style=\'clear:both;\'></p>");
    return aData.join('');
}

/**
 * 
 * @param oTile
 */
function buildTileData(oTile) {
    var sTileUrl = nlapiResolveURL('RECORD', REC_DASHBOARD_TILE, oTile.id, 'EDIT');
    sTileUrl += '&custpage_origin=tile';
    
    var aHtml = [
        "<div id='sdg_tile_"+oTile.id+"'>",
    ];
    
    if (oTile.icon) {
        var oIcon = nlapiLoadFile(oTile.icon);
        var sUrl = oIcon.getURL();
        
        // to do: comparison based on selected "blink when"
        if (oTile.isblinking == true) {
            aHtml.push("<img class='blinker' style='float:left;' src='"+sUrl+"' height='100px' width='100px'>");
        } else {
            aHtml.push("<img style='float:left;' src='"+sUrl+"' height='100px' width='100px'>");
        }
    }
    
    aHtml.push("<span class='text_wrapper'>");
    aHtml.push("<h1>" + oTile.prefix + '' +oTile.sign + '' + oTile.value + '' + oTile.suffix + "</h1>");
    if (oTile.detail) {
        aHtml.push("<p class='detailline'>" + oTile.detail + "</p>");
    }
    if (oTile.drilldown) {
        aHtml.push("<p><a class='dt_links' href='"+ oTile.drilldown +"' target='_blank'>"+oTile.name+"</a></p>");
    } else {
        aHtml.push("<p class='dt_links'>" + oTile.name + "</p>");
    }
    aHtml.push("<div class='bottom_box'><a class='dt_links_edit' href='"+sTileUrl+"' target='_blank'>EDIT</a></div>");
    aHtml.push("</span>");
    aHtml.push("</div>");
    
    return aHtml.join('');
}

/**
 * 
 * @param sValue
 * @param sThreshold
 * @param idBlinkWhen
 * @returns {Boolean}
 */
function shouldIconBlink(sValue, sThreshold, idBlinkWhen) {
    var bIsBlinking = false;
    var sExpression = '', sOperator = '';
    if (!isNaN(sValue)) {
        if (idBlinkWhen && sThreshold) {
            sOperator = getOperator(idBlinkWhen);
            sExpression = sValue+sOperator+sThreshold;
            bIsBlinking = eval(sExpression);
        }
    }
    return Boolean(bIsBlinking);
}

/**
 * 
 * @param idBlinkWhen
 * @returns {String}
 */
function getOperator(idBlinkWhen) {
//    nlapiLogExecution('DEBUG', 'getOperator', 'idBlinkWhen='+idBlinkWhen);
    switch (idBlinkWhen) {
        case OPTION_CP_GREATER_THAN:
            return '>';
        case OPTION_CP_LESS_THAN:
            return '<';
        case OPTION_CP_GREATER_THAN_OR_EQUAL:
            return '>=';
        case OPTION_CP_LESS_THAN_OR_EQUAL:
            return '<='; 
        default: 
            return '>';
    }
}

/**
 * 
 * @param x
 * @returns
 */
function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
    return x;
}

/**
 * 
 * @param sValue
 * @param bSign
 * @returns {String}
 */
function getValueSign(sValue, bSign) {
    if (bSign == 'T') {
        if (parseFloat(sValue) > 0) {
            return '+';
        }
    }
    return '';
}

/**
 * 
 * @param sValue
 */
function formatProperly(sValue) {
    if (!isNaN(sValue)) {
        sValue = Math.round(parseFloat(sValue)*100)/100;
        sValue = sValue.toFixed(2);
        sValue = numberWithCommas(sValue);
    }
    return sValue;
}

/**
 * 
 * @param bAutoRunScript
 * @param sScriptId
 * @param sDeployId
 */
function autoRunScript(bAutoRunScript, sScriptId, sDeployId, idTile) {
    if (bAutoRunScript == 'T') {
        var aParams = [];
        aParams['custscript_ie_dashboard_tile'] = idTile;
        if (sScriptId && sDeployId) {
            var sScriptStatus = nlapiScheduleScript(sScriptId, sDeployId, aParams);
            nlapiLogExecution('DEBUG', 'sScriptStatus', sScriptId+'='+sScriptStatus);
        }
    }
}