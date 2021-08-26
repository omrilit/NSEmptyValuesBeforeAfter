/**
 * © 2015 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
**/

var FAM;
if (!FAM) { FAM = {}; }

//convention
var CONV_NONE = '1';
var CONV_HALF_YEAR = '2';
var CONV_MID_QUARTER = '3';
var CONV_MID_MONTH = '4';

/* Depreciation Period */
var DEPR_PERIOD_MONTHLY = '1';
var DEPR_PERIOD_ANNUALLY = '2';

var FAM_Util =  new function() {

    /*
    This function will be ported to Util_Shared. Please use the Util_Shared version instead
    */
    /* parseInt - utility function to parse a string to an integer,
     * with default value for null/empty string
     *
     * Parameters:
     *         stringValue            - the string value to be parsed
     *         defaultValue        - the numeric (integer) value to use as a default
     * Returns:
     *         default or parsed value
     */
    this.parseInt = function(stringValue, defaultValue) {
        var retVal = parseInt(stringValue, 10);
        return  isNaN(retVal) ? defaultValue : retVal;
    };

    /* round - utility function to round the supplied numeric value to 2 decimal places
     *
     * Parameter:
     *         value                - the numeric value to be rounded
     * Returns:
     *         value rounded to 2 decimal places
     */
    this.round = function(value) {
        return Math.round(value * 100.00) / 100.00;
    };

    /* [rong][3/10/2014]: unnecessary function? simply check value of system setup
     * Get preference setting if constrain alternate method asset lifetime is enabled
     *
     * Parameters none
     *
     * Return Value
     *         true if constrain alternate method asset enabled otherwise false
     */
    this.isAllowGreaterAl = function() {
        var allowGreaterAl = false;
        var sysConstrainAl = FAM.SystemSetup.getSetting('isConstrainAssetLifetime');

        if (sysConstrainAl == 'F') {
            allowGreaterAl = true;
        }
        return allowGreaterAl;
    };

    /**
    * Fetch record ID from given
    */
    this.getIdFromName = function(recordtype,fldName,fldValue) {
        var SF = new nlobjSearchFilter(fldName,null,'is',fldValue,null);
        var SC = new nlobjSearchColumn(fldName);
        var SR = nlapiSearchRecord(recordtype,null,SF,SC);
        if( (SR == null) || (SR.length == 0) )
        {
            return null;
        }
        return SR[0].getId();
    };

    /*
    This function will be ported to Util_Shared. Please use the Util_Shared version instead
    */
    /* roundByCurrency - utility function to round the supplied numeric value to 2 or 0 decimal places, based upon currency info
     *
     * Parameters:
     *         N            - the numeric value to be rounded
     *        Curr        - the symbol of the currency being rounded
     *        IntCurr        - list of currency symbols for 0 dp
     * Returns:
     *         value rounded to appropriate decimal places
     */
    this.roundByCurrency = function(N,Curr,IntCurr) {
        if( (Curr != '') && (IntCurr != '') && (IntCurr.indexOf(Curr) != -1) )
            return Math.round(N);
        else
            return Math.round(N*100.00) / 100.00;
    };

    /*
     * Fetch translated messages from suitelet and stores them to an array
     *
     * messageId -> List of message id to retrieve
     */
    this.fetchMessageList = function(messageId) {
        var returnArray = {};
        var DELIMITER = '$$';
        //Setup parameters
        var joinedMsge = messageId.join(DELIMITER);

        var SLparams = new Array();
        SLparams['custpage_messageid'] = joinedMsge;
        SLparams['custpage_delimiter'] = DELIMITER;

        //Request for String translation for messages
        var languageURL = nlapiResolveURL('SUITELET','customscript_fam_language_resource','customdeploy_language_resource_deploy',false);
        var languageResp = nlapiRequestURL( languageURL, SLparams); // params now passed as custom headers

        //Store chain messages to array
        var l_msgtext = languageResp.getBody();
        var arrMessage = l_msgtext.split(DELIMITER);
        for(var ctr=0;ctr< messageId.length; ctr++){
            returnArray[messageId[ctr]] = arrMessage[ctr];
        }
        return returnArray;
    };

    /*
    This function will be ported to Util_Shared. Please use the Util_Shared version instead
    */
    /**
     * Replace message with blank value from parameter.
     * Blank value is difined by (number) - pattern, i.e. (0) will be replace with
     * first element in param, (1) from 2nd and so forth
     *
     *  strVar -> The message
     *  param -> param values to be replaced on the message
     */
    this.injectMessageParameter = function(strVar, param){
        var returnValue = strVar;

        // search pattern to find string to replace
        var paramPattern = /[(]\d[)]/g;


        //Return index of number inserted on string, also contains other non-numeric values
        var paramList = returnValue.match(paramPattern);

        //Replace the original string
        for(i in paramList){
            if (!isNaN(i) && param[i] != null){
                returnValue = returnValue.replace(paramList[i],param[i]);
            }
        }
        return returnValue;
    };


    /**
     *
     * @param rAsset hashdata containing currId and subsId
     * @returns currData: hashdata containing currId and currName. attributes have null values by default
     */
    this.getCurrencyData = function(rAsset){
        var currData = {}, currId = null;
        currData.currId = null;
        currData.currName = null;

        // Check if multicurrency is enabled, if not currency checking is not needed
        if (FAM.Context.blnMultiCurrency) {
            currId = rAsset.currId;
            if (currId != null && currId > 0) {
                //currency already entered by user
                currData.currId = currId;
            } else {
                //handling if currency is left blank by user
                if (FAM.Context.blnOneWorld){
                    // ~One World Account~
                    //set default subsidiary if blank
                    var subsidiaryId = rAsset.subsId;
                    if (!subsidiaryId) {
                        subsidiaryId = nlapiGetContext().getSubsidiary();
                    }

                    var rSub = nlapiLoadRecord('subsidiary', subsidiaryId);
                    if (rSub != null) {
                        curr = rSub.getFieldValue('currency');
                        if(isNaN(curr)){
                            //currency is in name, Marisa version (get currency Id)
                            currId = this.getIdFromName('currency', 'name',
                                    curr);
                            currData.currId = currId;
                            currData.currName = curr;
                        } else {
                            //currency is in Id format, Drake version (get currency name)
                            currData.currId = curr;
                        }
                    }
                } else {
                    // ~Single Instance Account~
                    //Hardcode the currency to 1, since company information is not accessible when user role is not an admin
                    //currId = nlapiLoadConfiguration('companyinformation').getFieldValue('basecurrency');
                    currData.currId = 1;
                }
            }

            if(currData.currId != null && currData.currName == null) {
                // set the currency name
                var srchFilter = new nlobjSearchFilter('internalid', null,
                        'anyof', currData.currId, null);
                var srchColumn = new nlobjSearchColumn('name');
                var srchResult = nlapiSearchRecord('currency', null,
                        srchFilter, srchColumn);

                if (srchResult !== null) {
                    currData.currName = srchResult[0].getValue('name');
                }
            }
        }

        return currData;
    };

    /**
     * TO BE REMOVED, use CS library, UE scripts can still use CS library
     *  for use in client scripts
     * @ check for value of convention against depreciation period.
    **/
    this.checkConvention = function(deprMethodId, convention) {
        if(!deprMethodId) { // no values loaded yet
            return true;
        }

        if(convention != CONV_NONE && convention != null && convention != '') { // none is accepted default value, null is also allowed
            var l_DMPeriod = nlapiLookupField('customrecord_ncfar_deprmethod', deprMethodId, 'custrecord_deprmethoddeprperiod');

            // 1 = monthly, 2 = Annually
            if(((l_DMPeriod == DEPR_PERIOD_ANNUALLY) && ((convention != CONV_HALF_YEAR) && (convention != CONV_MID_QUARTER))) || ((l_DMPeriod == DEPR_PERIOD_MONTHLY) && (convention != CONV_MID_MONTH))) {
                return false;
            }
        }

        return true;
    };

    /**
     * Fetch Get parameters found in HTML Url (for client scripts)
     *
     * @return {String} Parameter Value
     **/
    this.getURLParameter = function(name){
        return decodeURIComponent(
            (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1])||null
    };

    /**
     * utility function to return a formatted number string
     *
     * Parameters
     *     num {number} [required] - the number to be formatted
     *     grpSeparator {string} [optional] - the number group separator, e.g. ',' for 15,000
     *     decPlaceSym {string} [optional] - the decimal place symbol, e.g. '.' for 123.45
     *     numDecPlace {number} [optional] - the number of decimal places to display
     *     negativeSym {string|string[]} [optional] - the sign to display for negative numbers, this
     *         can be a two-element array to display before and after, e.g. '(' and ')'
     *     currencySym {string} [optional] - the currency symbol to display, will always lead the
     *         number with no space, so use '$ ' for '$ 100'
     *
     * Returns
     *     {string} - the formatted representation of the number
    **/
    this.formatNum = function (num, grpSeparator, decPlaceSym, numDecPlace, negativeSym,
        currencySym) {

        decPlaceSym = decPlaceSym || '.';
        numDecPlace = numDecPlace || 0;

        var tmpStr, pointPos, decPoint = '.', pow = Math.pow(10, numDecPlace);

        try {
            tmpStr = Math.abs(Math.round(num * pow) / pow).toString();

            if (numDecPlace > 0) {
                pointPos = tmpStr.indexOf(decPoint);

                if (pointPos === -1) {
                    tmpStr += decPoint;
                    pointPos = tmpStr.indexOf(decPoint);
                }

                while (tmpStr.length <= pointPos + numDecPlace) {
                    tmpStr += '0';
                }

                if (decPoint !== decPlaceSym) {
                    tmpStr = tmpStr.substr(0, pointPos) + decPlaceSym + tmpStr.substr(pointPos + 1);
                }
            }
            else {
                pointPos = tmpStr.length;
            }

            if (grpSeparator)  {
                while (pointPos > 3) {
                    tmpStr = tmpStr.substr(0, pointPos - 3) + grpSeparator +
                        tmpStr.substr(pointPos - 3);
                    pointPos -= 3;
                }
            }

            if (num < 0) {
                if (negativeSym instanceof Array) {
                    tmpStr = negativeSym[0] + tmpStr + negativeSym[1];
                }
                else {
                    tmpStr = negativeSym + tmpStr;
                }
            }

            if (currencySym) {
                tmpStr = currencySym + tmpStr;
            }

            return tmpStr;
        }
        catch (e) {
            return 'NaN';
        }
    };

    /**
     * utility function to return a currency formatted number string
     *
     * Parameters
     *     num {number} [required] - the number to be formatted
     *     symbol {string} [optional] - the currency symbol to display, will always lead the
     *         number with no space, so use '$ ' for '$ 100'
     *
     * Returns
     *     {string} - the currency formatted representation of the number
    **/
    this.formatCurrency = function (num, symbol) {
        return this.formatNum(num, ',', '.', 2, ['(', ')'], symbol);
    };

    this.getYearAndMonth = function(periodDate){
        if (!(periodDate instanceof Date)) return null;
        var monthStr = (periodDate.getMonth()+1).toString();
        return periodDate.getFullYear().toString() + '/00'.substr(0,3-monthStr.length) + monthStr;
    };
    
    this.sendEmail = function (author, recipient, subject, body, cc, bcc, records, attachments) {
        author = (author == -4)?-5:author;
        nlapiSendEmail(author, recipient, subject, body, cc, bcc, records,attachments);
    };

    /*
    This function will be ported to Util_Shared. Please use the Util_Shared version instead
    */
    //Compute for AL base on date difference
    this.computeAl = function(sDate, eDate) {
        var startDate = (sDate instanceof Date) ? sDate : nlapiStringToDate(sDate),
            endDate   = (eDate instanceof Date) ? eDate : nlapiStringToDate(eDate);

        var al = (endDate.getMonth() - startDate.getMonth()) +
                ((endDate.getFullYear() - startDate.getFullYear()) * 12);
        if((startDate.getDate() - endDate.getDate() > 1)
                && al > 0){
            // subtract al since enddate did not reach a full 30 date difference
            al--;
        }
        else if(startDate.getDate() == 1 &&
                (endDate.getDate() == ncGetEndOfMonth(endDate).getDate())){
            // additional al if the date coverage covers an entire month
            al++;
        }

        return (al >= 0) ? al : 0;
    };

    /*
    This function will be ported to Util_Shared. Please use the Util_Shared version instead
    */
    //Compute End Date by add StartDate with lifetime
    this.computeEndDate = function(sDate, al) {
        var startDate     = (sDate instanceof Date) ? sDate : nlapiStringToDate(sDate),
            endDate     = new Date(startDate.getTime() - 86400000); // 24h x 60m x 60s x 1000ms = 86400000
            endDate     = nlapiAddMonths(endDate, al);

            if(endDate < startDate) {
                endDate = startDate;
            } else if(startDate.getDate() == 1) {
                endDate = ncGetEndOfMonth(endDate);
            }

        return endDate;
    };

    /**
     * Builds an error string from an exception
     *
     * Parameter:
     *     e {exception} - exception encountered
     * Returns:
     *     {string} - html-formatted error message which includes the stack trace
    **/
    this.printStackTrace = function (e) {
        var message = '';

        if (typeof e.getStackTrace === 'function') {
            message = e.toString() + '<br />' + e.getStackTrace().join('<br />');
        }
        else if (e.stack) {
            message = e.toString() + e.stack.replace(/(^|\s)at(\s|$)/g, '<br />at ');
        }
        else {
            message = e.toString();
        }

        if (typeof e.getId === 'function') {
            message += '<br />Reference Id: ' + e.getId();
        }

        return message;
    };

    /** Load file and return url
     *
     * @param filename to search
     * @return {String} Url of file
     */
    this.getFileUrl = function (filename) {
        var retUrl = null;
        var fileId = this.getFileId(filename);
        if(fileId) {
            retUrl = nlapiLoadFile(fileId).getURL();
        } else {
            nlapiLogExecution('AUDIT', 'getFileUrl', 'Failed to fetch file: ' + filename);
        }

        return retUrl;
    };

    /** Search file id (from file cabinet)
     *
     * @param filename to search
     * @return {String} record id of file
     */
    this.getFileId = function (filename){
        var result = nlapiSearchRecord('file', null,
            new nlobjSearchFilter('name', null, 'is', filename),
            new nlobjSearchColumn('internalid'));

        return result == null? null: result[0].getValue('internalid');
    };

    /**
     * Retrieves the name of the Depreciation Method
     *
     * Parameters:
     *     {number} - internal id of the Depreciation Method to check; 0 for Accounting Methods
     * Returns:
     *     {string} - name of the Depreciation Method
    **/
    this.getDeprMethodName = function (id) {
        var ret;

        if (+id) {
            ret = nlapiLookupField('customrecord_ncfar_altmethods', id, 'name');
        }
        else {
            ret = FAM.resourceManager.GetString('custpage_constant_accountingmethod');
        }

        return ret;
    };

    /**
     * Retrieves the text to display of the user selection regarding leased assets
     *
     * Parameters:
     *     {string} - user selected value
     * Returns:
     *     {string} - text to display
    **/
    this.getAssetSelection = function (value) {
        var AssetSelection = '';

        if (value === 'all_assets') {
            AssetSelection = FAM.resourceManager.GetString('custpage_constant_allassets');
        }
        else if (value === 'except_leased') {
            AssetSelection = FAM.resourceManager.GetString('custpage_constant_exceptleased');
        }
        else if (value === 'leased_only') {
            AssetSelection = FAM.resourceManager.GetString('custpage_constant_onlyaassets');
        }

        return AssetSelection;
    };

    /**
     * Retrieves the Proposal Values per Book for the given proposal id
     *
     * Parameters:
     *     assetId {number} - internal id of the asset type
     * Returns:
     *     {FAM.Search} - search results
    **/
    this.getProposalValuesPerBook = function (propId) {
        var fSearch = new FAM.Search(new FAM.ProposalValuesBook_Record());

        fSearch.addFilter('proposal', null, 'is', propId);

        fSearch.addColumn('deprAcc');
        fSearch.addColumn('assetAcc');
        fSearch.addColumn('chargeAcc');
        fSearch.addColumn('writeOffAcc');
        fSearch.addColumn('writeDownAcc');
        fSearch.addColumn('dispAcc');
        fSearch.addColumn('bookId');
        fSearch.addColumn('altMethod');
        fSearch.addColumn('deprMethod');
        fSearch.addColumn('convention');
        fSearch.addColumn('lifetime');
        fSearch.addColumn('fiscalYear');
        fSearch.addColumn('periodCon');
        fSearch.addColumn('deprPeriod');
        fSearch.addColumn('subsidiary');
        fSearch.addColumn('rvPercent');
        fSearch.addColumn('isPosting');

        fSearch.run();
        return fSearch;
    };

    /**
     * Retrieves the Default Values per Book for the given asset type
     *
     * Parameters:
     *     assetTypeId {number} - internal id of the asset type
     *     subsidiaryId {number} - internal id of the subsidiary or 0 for SI accounts
     * Returns:
     *     {FAM.Search} - search results
    **/
    this.getDefaultValuesPerBook = function (assetTypeId, subsidiaryId) {
        var noneResults, fSearch = new FAM.Search(new FAM.DefaultValuesBook_Record());

        fSearch.addFilter('assetType', null, 'is', assetTypeId);

        if (FAM.Context.blnOneWorld && subsidiaryId) {
            fSearch.addFilter('subsidiary', null, 'anyof', subsidiaryId);

            if (+FAM.Context.getVersion() >= 2014.2 && FAM.Context.blnMultiBook) {
                fSearch.addFilter('bookId', null, 'is', '@NONE@');
            }
        }

        fSearch.addColumn('altMethod');
        fSearch.addColumn('deprMethod');
        fSearch.addColumn('convention');
        fSearch.addColumn('lifetime');
        fSearch.addColumn('fiscalYear');
        fSearch.addColumn('periodCon');
        fSearch.addColumn('deprPeriod');
        fSearch.addColumn('subsidiary');
        fSearch.addColumn('bookId');
        fSearch.addColumn('isPosting');
        fSearch.addColumn('assetAcc');
        fSearch.addColumn('deprAcc');
        fSearch.addColumn('chargeAcc');
        fSearch.addColumn('writeOffAcc');
        fSearch.addColumn('writeDownAcc');
        fSearch.addColumn('dispAcc');
        fSearch.addColumn('rvPercent');

        fSearch.run();

        // simply because there's no documented "OR" API
        if (FAM.Context.blnOneWorld && subsidiaryId && +FAM.Context.getVersion() >= 2014.2 &&
            FAM.Context.blnMultiBook) {
                
            noneResults = fSearch.results;

            // remove previous filter: bookId is @NONE@
            fSearch.filters.pop();

            fSearch.addFilter('bookId', null, 'noneof', '@NONE@');
            fSearch.addFilter('subsidiary', 'bookId', 'anyof', subsidiaryId);

            fSearch.run();

            if (fSearch.results && noneResults) {
                nlapiLogExecution('debug', 'FAM_Util.getDefaultValuesPerBook', 'no results for ' +
                    + 'both compatible subsidiary search and no accounting book search');
                fSearch.results = fSearch.results.concat(noneResults);
            }
            else if (noneResults) {
                nlapiLogExecution('debug', 'FAM_Util.getDefaultValuesPerBook',
                    'no results for compatible subsidiary search');
                fSearch.results = noneResults
            }
        }

        return fSearch;
    };

    /**
     * Retrieves the Default Values per Book fields via caching
     *
     * Parameters:
     *     param {hashmap} -listing ff value:
     *       assetTypeId {number} - internal id of the asset type to search
     *       subsidiaryId {number} - internal id of the subsidiary to search (optional)
     *       bookId {number} - internal id of the accounting book to search
     *       altMethod {number} - internal id of the alternate method to search
     *       deprMethod {number} - internal id of the depreciation method to search
     *       field {string} - field id of default values per book to read
     * Returns:
     *     {fieldvalue} - Field Value as indiciated in 'field' parameter; null of not found
    **/
    this.cacheDefaultValuesPerBook = function (param) {
        if(!this.defBook) { this.defBook = []};

        var retValue     = null,
            assetTypeId  = param.assetTypeId,
            subsidiaryId = param.subsidiaryId,
            bookId       = param.bookId,
            altMethod    = param.altMethod,
            deprMethod   = param.deprMethod
            field        = param.field,
            hashId       = (bookId || 'taxmethod') + '-' + altMethod + '-' + deprMethod;

        if(!this.defBook[assetTypeId]) {
            this.defBook[assetTypeId] = {};
            var defaultValues = this.getDefaultValuesPerBook(assetTypeId,subsidiaryId),
                totalRec = (defaultValues.results) ? defaultValues.results.length : 0;

            //Cache all default values
            for (var i = 0; i < totalRec; i++) {
                hashKey = (defaultValues.getValue(i,'bookId') || 'taxmethod') + '-' +
                           defaultValues.getValue(i,'altMethod') + '-' +
                           defaultValues.getValue(i,'deprMethod');
                this.defBook[assetTypeId][hashKey] = defaultValues.getValue(i, field);
            }
        }
        if(this.defBook[assetTypeId] && this.defBook[assetTypeId][hashId]) {
            retValue = this.defBook[assetTypeId][hashId];
        }

        return retValue;
    };

    /**
     * Parses CSV Strings and converts to JavaScript Readable Objects
     *
     * Parameters:
     *     strData {string} - CSV String to be parsed
     *     config {Object} - configurations below
     *         delimiter {string} - delimiter used on the CSV String
     *         header {boolean} - denotes that the first row of data will be the field names
     * Returns:
     *     {Object} - parsed object with details below
     *         data {Array|Object} - parsed data, if header: true, is an Object, otherwise an Array
     *             __parsed_extra {Array} - extra fields parsed if header: true
     *         meta {Object} - container for CSV String Information
     *             fields {Array} - fields parsed when header: true
    **/
    this.parseCSV = function (strData, config) {
        var foundValue, fieldIndex = 0, data = [], meta = {}, arrMatches = null,
            delimiter = config && config.delimiter || ',',
            header = config && config.header,
            objPattern = new RegExp((
                // Delimiters.
                "(\\" + delimiter + "|\\r?\\n|\\r|^)" +
                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                // Standard fields.
                "([^\"\\" + delimiter + "\\r\\n]*))"
            ), "gi");

        if (header) { meta.fields = []; }
        else { data.push([]); }

        while (arrMatches = objPattern.exec(strData)) {
            if (arrMatches[1].length > 0 && arrMatches[1] !== delimiter) {
                if (header) {
                    fieldIndex = 0;
                    data.push({});
                }
                else { data.push([]); }
            }

            if (arrMatches[2]) {
                foundValue = arrMatches[2].replace(new RegExp( "\"\"", "g" ), "\"");
            }
            else { foundValue = arrMatches[3]; }

            if (data.length === 0) {
                meta.fields.push(foundValue);
            }
            else if (header) {
                if (fieldIndex > meta.fields.length - 1) {
                    if (!data[data.length - 1].__parsed_extra) {
                        data[data.length - 1].__parsed_extra = [];
                    }
                    data[data.length - 1].__parsed_extra.push(foundValue);
                }
                else {
                    data[data.length - 1][meta.fields[fieldIndex]] = foundValue;
                    fieldIndex++;
                }
            }
            else {
                data[data.length - 1].push(foundValue);
            }
        }

        return { data : data, meta : meta };
    };

    /**
     * Creates the form to be displayed on the UI
     *
     * Parameters:
     *     {Object} param
     *        title        - title of the screen
     *        clientScript - internal id for client script to be attached
     *        pageFields   - Object file containing screen field to be created
     *        pageButtons  - Object file containing buttons to be created
     * Returns:
     *     {nlobjForm} - form object
    **/
    this.createForm = function(param) {
        var i, j, k, l, formObj, fieldObj = null,
            form = nlapiCreateForm(param.title, param.hideNavbar || null);
        
        if (param.clientScript) {
            form.setScript(param.clientScript);
        }

        //Add declared page tabs/groups
        for (var f in param.pageTabs){
            if(param.pageTabs[f].type == 'group'){
                var objFieldGroup = form.addFieldGroup(param.pageTabs[f].id, param.pageTabs[f].label);                
                if (null != param.pageTabs[f].showBorders){                    
                    objFieldGroup.setShowBorder(param.pageTabs[f].showBorders);
                }
            }
            else if(param.pageTabs[f].type == 'tab'){
                form.addTab(param.pageTabs[f].id, param.pageTabs[f].label);
            }
            else {
                form.addSubTab(param.pageTabs[f].id, param.pageTabs[f].label);
            }
        }

        //Add declared page fields
        for (var f in param.pageFields){
            if(f === 'action' || f.indexOf('test') == 0) {
                continue; //Special condition for bypassing
            }            
            fieldObj = form.addField(param.pageFields[f].id, param.pageFields[f].type, param.pageFields[f].label || null,
                            param.pageFields[f].sourceOrRadio || null, param.pageFields[f].tab || null);
            if(param.pageFields[f].displayType) {
                fieldObj.setDisplayType(param.pageFields[f].displayType);
            }
            if(param.pageFields[f].layoutType && param.pageFields[f].breakType) {
                fieldObj.setLayoutType(param.pageFields[f].layoutType, param.pageFields[f].breakType);
            }
            else if(param.pageFields[f].breakType) {
                fieldObj.setBreakType(param.pageFields[f].breakType);
            }
            if(param.pageFields[f].padding) {
                fieldObj.setPadding(param.pageFields[f].padding);
            }
            if(param.pageFields[f].alias) {
                fieldObj.setAlias(param.pageFields[f].alias);
            }
            if(param.pageFields[f].width){
                if(param.pageFields[f].height){
                    fieldObj.setDisplaySize(param.pageFields[f].width, param.pageFields[f].height);
                }
                else {
                    fieldObj.setDisplaySize(param.pageFields[f].width);
                }
            }
            if(param.pageFields[f].helpText) {
                fieldObj.setHelpText(param.pageFields[f].helpText, param.pageFields[f].inline || false);
            }
            if(param.pageFields[f].linkText) {
                fieldObj.setLinkText(param.pageFields[f].linkText);
            }
            if(param.pageFields[f].mandatory) {
                fieldObj.setMandatory(param.pageFields[f].mandatory);
            }
            if(param.pageFields[f].maxLength) {
                fieldObj.setMaxLength(param.pageFields[f].maxLength);
            }
            if(param.pageFields[f].option && param.pageFields[f].option.length) {
                var options = param.pageFields[f].option;
                for(var i =0; i < options.length; i++) {
                    fieldObj.addSelectOption(options[i].value,options[i].text, options[i].selected || false);
                }
            }
            if(param.pageFields[f].defaultValue) {
                fieldObj.setDefaultValue(param.pageFields[f].defaultValue);
            }
        }

        for (var f in param.pageButtons){
            if(param.pageButtons[f].id === 'submit') {
                form.addSubmitButton(param.pageButtons[f].label);
            }
            else {
                form.addButton(param.pageButtons[f].id,param.pageButtons[f].label, param.pageButtons[f].script || null);
            }
        }

        /*
         * Add declared page sublists
         * Only add and set APIs are supported; uses apply function to pass parameters
        */
        param.SubList = [].concat(param.SubList);
        for (i = 0; i < param.SubList.length; i++) {
            formObj = null;
            for (j in param.SubList[i]) {
                if (j === 'construct') {
                    formObj = form.addSubList.apply(form, param.SubList[i][j]);
                }
                else if (typeof formObj['add' + j] === 'function') {
                    for (k = 0; k < param.SubList[i][j].length; k++) {
                        fieldObj = null;
                        for (l in param.SubList[i][j][k]) {
                            if (l === 'construct') {
                                fieldObj = formObj['add' + j].apply(formObj, param.SubList[i][j][k][l]);
                            }
                            else if (typeof fieldObj['set' + l] === 'function') {
                                fieldObj['set' + l].apply(fieldObj, [].concat(param.SubList[i][j][k][l]));
                            }
                            else {
                                nlapiLogExecution('audit', 'Form Builder',
                                    'Unsupported Parameter: SubList > ' + i + ' > ' + j + ' > ' +
                                    k + ' > ' + l);
                            }
                        }
                    }
                }
                else if (typeof formObj['set' + j] === 'function') {
                    formObj['set' + j].apply(formObj, [].concat(param.SubList[i][j]));
                }
                else {
                    nlapiLogExecution('audit', 'Form Builder', 'Unsupported Parameter: ' +
                        'SubList > ' + i + ' > ' + j);
                }
            }
        }
        
        return form;
    };
    
    this.hasExceededLimit = function() {
        return FAM.Context.getRemainingUsage() < this.execLimit ||
        this.perfTimer.getElapsedTime() > this.timeLimit;
    };
    
    /**
    * Creates Journal Entry or Custom Transaction Journal Entry
    * 
    * Parameters:
    *
    *
    * Returns: 
    *   {int} : journal entry record id    
    *
    */
    this.createJournalEntry = function (obj) {
        var allowCustomTrans = FAM.SystemSetup.getSetting("allowCustomTransaction") === 'T';
        var journalId;
        
        //NOTE: obj.type is the transaction type id
        journalRec = obj.type || "journalentry";

        var JE                 = nlapiCreateRecord(journalRec),
            journalId, tempCId = '', tempDId = '', tempLId = '';
    
        if (obj.postingperiod) {
            JE.setFieldValue("postingperiod", obj.postingperiod);
        }
        
        if( FAM.Context.blnOneWorld && obj.subId != null)
            JE.setFieldValue('subsidiary',obj.subId);
        
        if(obj.trnDate instanceof Date) {
            JE.setFieldValue('trandate',nlapiDateToString(obj.trnDate));
        }    
        else {
            JE.setFieldValue('trandate',obj.trnDate);   // assuming it is a valid string
        }
            
    
        if( (obj.currId != '') && (obj.currId != null) && FAM.Context.blnMultiCurrency){
            JE.setFieldValue('currency',obj.currId.toString());
            JE.setFieldValue('exchangerate', obj.exchangeRate || '1');
        }
    
        if (typeof(obj.classId) === 'string') {
            tempCId = obj.classId=='unset'?'':obj.classId;
            JE.setFieldValue('class', tempCId);
        }
        if (typeof(obj.deptId) === 'string') {
            tempDId = obj.deptId=='unset'?'':obj.deptId;
            JE.setFieldValue('department', tempDId);
        }
        if (typeof(obj.locId) === 'string') {
            tempLId = obj.locId=='unset'?'':obj.locId;
            JE.setFieldValue('location', tempLId);
        }
        
        JE.setFieldValue('bookje', 'T');
        JE.setFieldValue('accountingbook', obj.bookId || 1);
        JE.setFieldValue('generatetranidonsave', 'T');
        
        if (obj.isReversal) {
            JE.setFieldValue("custbody_fam_jrn_is_reversal", obj.isReversal);
        }
        
        if (obj.reversalNo) {
            JE.setFieldValue("custbody_fam_jrn_reversal_no", obj.reversalNo);
        }
                
        if (obj.reversalDate) {
            JE.setFieldValue("custbody_fam_jrn_reversal_date", obj.reversalDate);
        }
        
        // Check Journal Permission
        if (obj.permit != null) { //if null, default behavior is journal approved
            var reqApproval = nlapiLoadConfiguration("accountingpreferences").getFieldValue("JOURNALAPPROVALS");
            var fieldName = allowCustomTrans ? "transtatus" : "approved";
            var approvedValue = allowCustomTrans ? FAM.CustomTransactionStatus["Approved"] : "T";
            var pendingValue = allowCustomTrans ? FAM.CustomTransactionStatus["Pending Approval"] : "F";
            
            if (obj.alwaysApproved || reqApproval === 'F' || +obj.permit > FAM.Permissions.Create) {
                JE.setFieldValue(fieldName, approvedValue);
            }
            else {
                JE.setFieldValue(fieldName, pendingValue);
            }
        }
        
        // validate accounts
        for(var n=0; n<obj.accts.length; ++n){
            if( obj.accts[n] == null ){
                throw nlapiCreateError('NCFAR_JOURNALERROR', FAM.resourceManager.GetString('custpage_accounts_missing'), true);
            }
        }
        // line counter
        for(var i=0, j=1; i<obj.accts.length; ++i){
            if(obj.debitAmts[i] || obj.creditAmts[i]){   //continue only if one of either debit or credit is greater than zero
                JE.insertLineItem('line',j);
                JE.setLineItemValue('line','account',j,obj.accts[i].toString());
                if( obj.currId != null )
                {
                    JE.setLineItemValue('line','account_cur',j,obj.currId.toString());
                    JE.setLineItemValue('line','account_cur_isbase',j,'T');
                    JE.setLineItemValue('line','account_cur_fx',j,'F');
                }
                if(obj.debitAmts[i] != 0)
                {
                    JE.setLineItemValue('line','debit',j,obj.debitAmts[i].toString());
                    JE.setLineItemValue('line','origdebit',j,obj.debitAmts[i].toString());
                }
                if(obj.creditAmts[i] != 0)
                {
                    JE.setLineItemValue('line','credit',j,obj.creditAmts[i].toString());
                    JE.setLineItemValue('line','origcredit',j,obj.creditAmts[i].toString());
                }
                if (obj.entities[i] != null) {
                    JE.setLineItemValue('line','entity',j,obj.entities[i]);
                }
                JE.setLineItemValue('line','memo',j,obj.ref[i].toString());
    
                // need to allow Class, Department and Location to be single value (same for all rows) or per row, i.e. string or array
                if (obj.classId) {
                    if (typeof(obj.classId) === 'string') {
                        tempCId = obj.classId=='unset'?'':obj.classId;
                    }
                    else if (obj.classId[i]) {
                        tempCId = obj.classId[i]=='unset'?'':obj.classId[i];
                    }
                    JE.setLineItemValue('line', 'class', j, tempCId);
                }
    
                if (obj.deptId) {
                    if (typeof(obj.deptId) === 'string') {
                        tempDId = obj.deptId=='unset'?'':obj.deptId;
                    }
                    else if (obj.deptId[i]) {
                        tempDId = obj.deptId[i]=='unset'?'':obj.deptId[i];
                    }
                    JE.setLineItemValue('line', 'department', j, tempDId);
                }
    
                if (obj.locId) {
                    if (typeof(obj.locId) === 'string') {
                        tempLId = obj.locId=='unset'?'':obj.locId;
                    }
                    else if (obj.locId[i]) {
                        tempLId = obj.locId[i]=='unset'?'':obj.locId[i];
                    }
                    JE.setLineItemValue('line', 'location', j, tempLId);
                }
                ++j;
            }
        }
    
        journalId = nlapiSubmitRecord(JE,true, true);
        return journalId;
    };
    
    /**
     * Searches for files and returns file ids
     * @param {String} fileName - name of file
     * @param {String} folder - folder location (optional)
     * @returns {Array} - nlobjSearchResults
     * 
    **/
    this.searchFiles = function (fileName, folder, fileType) {
        var filters = [new nlobjSearchFilter('name', null, 'contains', fileName)];
        if (folder) { filters.push(new nlobjSearchFilter('folder', null, 'is', folder)); }
        if (fileType) { filters.push(new nlobjSearchFilter("filetype", null, "anyof", [fileType])); }
        var columns = [new nlobjSearchColumn('name').setSort(),
            new nlobjSearchColumn('internalid')];
        return nlapiSearchRecord('file', null, filters, columns);
    };
    
    /**
     * Loads file contents
     * @param {String} fileName - name of file
     * @param {String} folder - folder location (optional)
     * @returns {String} - content of file
     * 
    **/
    this.loadFileContents = function (fileName, folder) {
        var results = this.searchFiles(fileName, folder) || [], content = "";
        for (var i = 0; i < results.length; i++){
            if (!this.checkTailString(fileName, results[i].getValue('name'))) continue;
            var file = nlapiLoadFile(results[i].getId());
            if (file){
                content += file.getValue();
            }
            else{
                nlapiLogExecution('ERROR', 'Error Loading File', 'ID='+results[i].getId());
            }
        }
        return content;
    };
    
    /**
     * Deletes files
     * @param {String} fileName - name of file
     * @param {String} folder - folder location (optional)
     * @returns {Array} - file ids deleted
     * 
    **/
    this.deleteFiles = function (fileName, folder) {
        var results = this.searchFiles(fileName, folder) || [], ids = [];
        for (var i = 0; i < results.length; i++){
            if (!this.checkTailString(fileName, results[i].getValue('name'))) continue;
            ids.push(nlapiDeleteFile(results[i].getId()));
        }
        return ids;
    };
    
    /**
     * Checks if tail of filename contain '_###.'
    **/
    this.checkTailString = function (str, fileName) {
        var regex = new RegExp(str + '(_\\d{3})?\\.');
        
        return regex.test(fileName);
    };
    
    /**
     * Saves file to report folder. 
     * If the contents exceeds the file size limit setting, multiple files will be saved.
     *
     * @param {String} contents - The Contents of the file to be written
     * @param {String} fileName - The base File Name
     * @param {String} fileExt - File Extension
     * @param {String} fileType - For a list of supported file types, see Supported File Types in the NetSuite Help Center
     * @param {String} fileDesc - File Description
     * 
    **/
    this.saveFileContents = function(contents, fileName, fileExt, fileType, fileDesc){
        var fileSizeLimit = FAM.SystemSetup.getSetting("reportFileSizeLimit");
        var reportFolder = FAM.SystemSetup.getSetting("reportFolder");
        var fileEncoding = 'UTF-8';
        
        // Check content size in bytes
        var encodedContents = encodeURIComponent(contents);
        var multibyte_match = encodedContents.match(/%[89ABab]/g);
        var bytecount = contents.length + (multibyte_match ? multibyte_match.length : 0);
        
        if (bytecount > fileSizeLimit){
            var start = 0;
            var end = fileSizeLimit;
            var fileCount = 1;
            
            while(bytecount > start){
                var blnSaveFile = false;
                var contentPortion = '';
                try {  
                    var encodedContentPortion = unescape(encodedContents).substring(start,end);
                    contentPortion = decodeURIComponent(escape(encodedContentPortion));
    
                    // if decode error did not occur (due to multi-byte char truncation)
                    start = end;
                    end = (bytecount > end+fileSizeLimit) ? end+fileSizeLimit : bytecount;
                    blnSaveFile = true;
                }
                catch(e){
                    end--;
                }
                if (blnSaveFile){
                    var strFileCount = fileCount<100 ? ('00'+fileCount).slice(-3) : fileCount;
                    var fileNameToSave = [fileName, '_', strFileCount, fileExt].join("");
                    var fileObj = nlapiCreateFile(fileNameToSave, fileType, contentPortion);
                    fileObj.setDescription(fileDesc);
                    fileObj.setEncoding(fileEncoding);
                    fileObj.setFolder(reportFolder);
                    
                    nlapiSubmitFile(fileObj);
                    fileCount++;
                }
            }
        }
        else {
            var fileNameToSave = [fileName, fileExt].join("");
            var fileObj = nlapiCreateFile(fileNameToSave, fileType, contents);
            
            fileObj.setDescription(fileDesc);
            fileObj.setEncoding(fileEncoding);
            fileObj.setFolder(reportFolder);
            
            nlapiSubmitFile(fileObj);
        }
        return 'T';
    }
    
    this.JSONFileName = 'FAM_JSONReport';
    
    /**
     * Deletes existing FAM - Reports JSON files then,
     * saves JSON file for the current report being generated
     *
     * @param {String} json - JSON contents to be saved
     * @param {String} description
     * @param {String} queue - queue id 
     * 
    **/
    this.saveJSONReportContents = function(json, description, queue) {
        var fileName = this.JSONFileName;
        if (queue) {
            fileName += '_' + queue;
        }
        
        var reportFolder = FAM.SystemSetup.getSetting("reportFolder");
        var fileExt = '.txt';
        if (!description){
            description = 'JSON file for Report Creation';
        }        
        this.deleteFiles(fileName, reportFolder);
        
        return this.saveFileContents(json, fileName, fileExt, 'PLAINTEXT', description);
    }
    
    /**
     * Retrieves JSON file contents
     *
     * @param {String} queue - queue id 
     * @returns {Object} jsonContent - JSON Content
     * 
    **/
    this.loadJSONFileContents = function (queue) {
        var ret = {}, fileName = this.JSONFileName;
        
        if (queue) {
            fileName += '_' + queue;
        }
        
        var reportFolder = FAM.SystemSetup.getSetting("reportFolder");
        var content = this.loadFileContents(fileName, reportFolder);
        
        if (content){
            ret = JSON.parse(content);
        }
        return ret;
    };
};

/**
 * UE_FieldRecords
 * Container for an Array of UE_FieldObject
 *
 * @param field - Custom field record Id
 * @param type - Execution Mode
 * @returns array of field object
 */
FAM.UE_FieldRecords = function(fields,type){
    var arrFields     = {},
        fieldId     = null;

    for (var ctr = 0; ctr<fields.length; ctr++) {
        //remove prefixes
        fieldId = fields[ctr].replace('custrecord_','').replace('custpage_','');
        arrFields[fieldId] = new FAM.UE_FieldObject(fields[ctr],type);
    }

    return arrFields;
};

/**
 * UE_FiledObject
 * Class used Exclusively for field checking on User Event
 * Used to handle behavior inconsistencies with nlapiGetNewRecord()
 *
 * @param field - Custom field record Id
 * @param type - execution mode, call getcontext if undefined
 * @returns UE_FiledObject
 */
FAM.UE_FieldObject = function (field, type) {
    var oldRecord = nlapiGetOldRecord(),
        newRecord = nlapiGetNewRecord();

    this.type       = type;
    this.field      = field;
    this.oldValue   = oldRecord && oldRecord.getFieldValue(this.field);
    this.newValue   = newRecord && newRecord.getFieldValue(this.field);
    this.currValue  = this.newValue || this.oldValue || null;
    this.currNumericValue  = (isNumber(this.newValue)) ? this.newValue :
                             (isNumber(this.oldValue)) ? this.oldValue :
                             null;

    //Check from UI input if user has entered a new value against existing/old value from record field
    this.isChanged  = function () {
        var retVal = false,
            oValue = ((this.oldValue && this.oldValue.length > 0) || (isNumber(this.oldValue))) ? this.oldValue : null,
            nValue = ((this.newValue && this.newValue.length > 0) || (isNumber(this.newValue))) ? this.newValue : null;

        //Create, Edit and Xedit behaves seperately when fetching new record
        if( ((this.type == 'create' || this.type == 'xedit') && nValue != null) ||
            (this.type == 'edit'  && oValue != nValue)){
            retVal = true;
        }
        return retVal;
    };

    //Check parameter with the existing/old value from record field
    this.compareChanged = function (compValue) {
        var retVal = false;
        if((this.type == 'create' && compValue != null) ||
            this.oldValue != compValue) {
            retVal = true;
        }
        return retVal;
    };
};

/**
 * Determine is an object is numeric
 * @param num
 * @returns true: numeric false: not numeric
 */
function isNumber(num) {
    return parseFloat(num) == num;
}

/* ncFAR_GetRelativeMonth - accepts a date and a start month number and returns the relative month of 'year'
*
*    Parameters
*        DateValue    - the date value to compare against the start month
*        StartMonth    - January = 1, February = 2, etc.
*
*    Return Value
*        Relative Month Number, 0 = first, 1 = second, etc. so in-line with zero-based month number for javascript
*/
function ncFAR_GetRelativeMonth(DateValue, StartMonth) {
    // easy answer if StartMonth == 1 (January)
    if (StartMonth == 1)
        return DateValue.getMonth();

    // e.g. March with start of October = 2+1 +12 -10 = 15 -10 = 5 (Period 6 of year)
    // October with start of March = 9+1 +12 -3 = 22 -3 = 19... %12 = 7 (Period 8 of year)
    return (DateValue.getMonth()+1 + 12 - StartMonth) % 12;
}

/* ncGetAgeInMonths - utility function to return the different in months between two dates, regardless of day within each month
 *
 * Parameters:
 *         startDate        - the first date
 *         currentDate        - the second date
 * Returns:
 *         number of months difference between the two dates (01/06/2007 to 31/07/2007 = 1, 30/06/2007 to 01/07/2007 = 1)
 */
function ncGetAgeInMonths(startDate,currentDate) {
    var currentAgeM = (currentDate.getFullYear() - startDate.getFullYear())*12 + (currentDate.getMonth() - startDate.getMonth());

    return currentAgeM;
}

/*
This function will be ported to Util_Shared. Please use the Util_Shared version instead
*/
/* ncGetEndOfMonth - will return a new date object set to the last day of the same month as the source date
 * Parameters:
 *        sourceDate     - Date (actual date object)
 * Returns:
 *      new date object set to the last day of the same month as the source date
 */
function ncGetEndOfMonth(sourceDate) {
    var returnDate = new Date(sourceDate);
    returnDate.setDate(1);
    returnDate = nlapiAddMonths(returnDate,1);
    returnDate = new Date(returnDate - 86400000); // 24 hrs x 60 mins x 60 secs x 1000 millisecs = 86400000

    return returnDate;
}

/* ncRoundCurr - utility function to round the supplied numeric value to 2 or 0 decimal places, based upon currency info
 *
 * Parameters:
 *         N            - the numeric value to be rounded
 *        Curr        - the symbol of the currency being rounded
 *        IntCurr        - list of currency symbols for 0 dp
 * Returns:
 *         value rounded to appropriate decimal places
 */
function ncRoundCurr(N,Curr,IntCurr) {
    if( (Curr != null) && (Curr != '') && (IntCurr != null) && (IntCurr != '') && (IntCurr.indexOf(Curr) != -1) )
        return Math.round(N);
    else
        return Math.round(N * 100) / 100;
}

/* ncParseFloatNV - utility function to parse a string to a float, with default value for null/empty string
 *
 * Parameters:
 *         S            - the string value to be parsed
 *         F            - the numeric (float) value to use as a default
 * Returns:
 *         default or parsed value (which may still be NaN)
 */
function ncParseFloatNV(S,F) {
    if( (S==null) || (S.length==0) )
        return F;

    return parseFloat(S);
}

//Method object to handle caching and print of nlapiLogs
var printLogObj = function(type, title, msg){
    var titleArr = [],
        logArr = [],
        logObj = {},
        printPushedMsg = false;
    logObj.type = (type) ? type : 'debug';          //TYPE OF LOG: DEBUG,AUDIT,ERROR
    logObj.title = (title) ? title : 'init logger'; //TITLE or METHOD of current process
    logObj.msg = (msg) ? msg : '';                  //MESSAGEto be displayed
    logArr.push(logObj);

    this.setType = function(type) {
        if(type) logObj.type = type;
    };

    this.setTitle = function(title) {
        if(title) logObj.title = title;
    };

    //Queue a method one level deeper
    this.startMethod = function(title,msg) {
        if(!title) return;
        //backup the last method title
        titleArr.push(logObj.title);

        //override the title
        logObj.title = title;
        msg = (msg) ? msg : 'start method';
        this.pushMsg(msg);
    };

    //Return a method by one level
    this.endMethod = function(msg){
        //return the last title
        var prevTitle = titleArr.pop();
        if (prevTitle) {
            msg = (msg) ? msg : 'end method';
            this.pushMsg(msg);
            //return previous title
            logObj.title = prevTitle;
        }
    };

    //true: pushMsg method will print its contents in addition to queueing its contents
    //false: pushMsg will not print the contents
    this.setPrintPushedMsg = function(toPrint) {
        printPushedMsg = (toPrint === true) ? true : false;
    };

    //Stores a log message
    this.pushMsg = function(msg, type){
        if(printPushedMsg){
            this.logExecution(msg, type);
        }
        var tObj = {};
        tObj.type = logObj.type;
        tObj.title = (type) ? type : logObj.title;
        tObj.msg = msg;
        logArr.push(tObj);
    };

    //Print a log message
    this.logExecution = function(msg, type){
        if(!printPushedMsg){
            this.pushMsg(msg, type);
        }
        nlapiLogExecution((type) ? type : logObj.type, logObj.title, msg);
    };

    this.clearMsg = function() {
        logArr = [];
    };

    //Prints the entire content of store logs
    this.printLog = function(){
        var eContent = null;
        for (var eCtr = 0; eCtr < logArr.length; eCtr++) {
            eContent = logArr[eCtr];
            nlapiLogExecution (eContent.type, 'printLogObj: ' + eContent.title, eContent.msg);
        }
    };

    this.printCallerMethod = function() {
        this.logExecution('Parent Caller: ' + this.getCallerMethod() || 'No Caller');
    };

    this.getCallerMethod = function() {
        var ret = null;
        if(titleArr.length >= 1) {
            ret = titleArr[titleArr.length - 1];
        }
        return ret;
    };

    this.printStoredTitles = function() {
        this.logExecution(titleArr.join(' > '));
    };
};
