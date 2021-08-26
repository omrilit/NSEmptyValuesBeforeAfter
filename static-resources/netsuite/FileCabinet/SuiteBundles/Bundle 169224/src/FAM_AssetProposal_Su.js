/**
 * © 2017 NetSuite Inc.  
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var FAM;
if (!FAM) { FAM = {}; }

FAM.AssetProposal_Su = new function () {
    this.reqParams = {};
    this.defPropPerPage = 50;

    this.run = function (request, response) {
        var bgpMsg = '';
        this.getParameters(request);

        if (request.getMethod() === 'POST') {
        	var precompute = FAM.SystemSetup.getSetting('precompute') === 'T';
        	var btnPressed = this.reqParams.buttonPressed;
            if (btnPressed === 'Propose' || btnPressed === 'Generate') {

                bgpMsg = precompute ? 
                			this.callProcessPM(btnPressed) : 
            				this.callProcessBGP(btnPressed);
            }
            else {
                if (this.reqParams.buttonPressed === 'Reject') {
                    this.rejectProposals(request);
                }
                // redirect to same page with same parameters
                nlapiSetRedirectURL(
                    'SUITELET',
                    FAM.Context.getScriptId(),
                    FAM.Context.getDeploymentId(),
                    null,
                    {
                        // need to repass screen parameters
                        custpage_filtermsassettype : [].concat(request.getParameterValues(
                            'custpage_filtermsassettype') || []),
                        custpage_filtermssubsid : [].concat(request.getParameterValues(
                            'custpage_filtermssubsid') || [])
                    }
                );
                return;
            }
            
            if (!bgpMsg){
                nlapiSetRedirectURL('suitelet', 'customscript_fam_processstatus_su', 'customdeploy_fam_processstatus_su');
                return;
            }
        }

        response.writePage(this.createForm(bgpMsg));
    };

    /**
     * Retrieves parameters from the request object
     *
     * Parameters:
     *     request {nlobjRequest} - request object from suitelet function
     * Returns:
     *     void
    **/
    this.getParameters = function (request) {
        this.reqParams.buttonPressed = request.getParameter('custpage_ncactionid');
        this.reqParams.assetTypes = [].concat(request.getParameterValues(
            'custpage_filtermsassettype') || []);
        this.reqParams.subsidiaries = [];
        this.reqParams.propList = [];
        
        if(this.reqParams.buttonPressed === 'Generate'){
        	
        	for (var i = 1; i <= request.getLineItemCount('proposals'); i++) {
                if (request.getLineItemValue('proposals', 'marked', i) === 'T') {
                    this.reqParams.propList.push(
                    		request.getLineItemValue('proposals', 'id', i));
                }
            }
        }
        
        
        if (FAM.Context.blnOneWorld) {
            this.reqParams.subsidiaries = [].concat(request.getParameterValues(
                'custpage_filtermssubsid') || []);
            this.reqParams.includeChild = request.getParameter('custpage_filtercbincchild');

            if (this.reqParams.subsidiaries.length && this.reqParams.includeChild === 'T') {
                this.reqParams.subsidiaries = FAM.includeSubsidiaryChildren(
                    this.reqParams.subsidiaries);
            }
        }

        this.reqParams.pageNum = +request.getParameter('custpage_proppage') || 1;
        this.reqParams.propPerPage = +request.getParameter('custpage_rowperpage') *
            this.defPropPerPage || this.defPropPerPage;
    };

    /**
     * Searches and proposes new assets and triggering a schedule script if limit is reached
     *
     * Parameters:
     *     none
     * Returns:
     *     void
    **/
    this.callProcessBGP = function (procName) {
        var procInsRec = new FAM.BGProcess(),
        	objBGP = {}, bgpMsg = '';
        
        try{
        	if(procName === 'Propose'){
            	objBGP = {
                    status : FAM.BGProcessStatus.InProgress,
                    activity_type : FAM.BGPActivityType.Direct,
                    func_name : 'ncFAR_NewPropBG',
                    proc_name : 'Asset Proposal',
                    user : FAM.Context.userId,
                    rec_count : 0,
                    message : '',
                    state_defn : 'ATarray,ATypes,Subsids,AutoGen',
                    state : this.reqParams.assetTypes.join(':') + ',' +
                        this.reqParams.assetTypes.join(':') + ',' + this.reqParams.subsidiaries.join(':') +
                        ',F'
                }
            }
            else if(procName === 'Generate'){
            	if(this.reqParams.propList.length === 0){
            		throw FAM.resourceManager.GetString('custpage_nopropselected', 'assetproposal');
            	}
            	objBGP = {
                    status : FAM.BGProcessStatus.InProgress,
                    activity_type : FAM.BGPActivityType.Direct,
                    func_name : 'ncFAR_GenerateAssetsFromPropList',
                    proc_name : 'Asset Generation',
                    user : FAM.Context.userId,
                    rec_count : 0,
                    message : '',
                    state_defn : 'PropList',
                    state : this.reqParams.propList.join(':')
                }
            }
            
            procInsRec.createRecord(objBGP);
            procInsRec.submitRecord();

            if(procName === 'Generate'){
            	this.updateProposalsToPending();
            }
            
            this.scheduleScript(objBGP.func_name);
        }
        catch (ex){
            if (ex.message) {
                try {
                    var errObj = JSON.parse(ex.message);
                    bgpMsg = errObj.message;
                }
                catch(ex1) {
                    bgpMsg = 'Cannot parse exception';
                }
            }
            else {
                bgpMsg = ex.toString();
            }
            nlapiLogExecution('ERROR', bgpMsg);
	    }
	    
        return bgpMsg;
    };

    /**
     *  creates and invokes a FAM Process Record
     *  Parameters:
     *      none
     *  Returns:
     *      {integer} - record id of the FAM Process Record created
     */
    this.callProcessPM = function (procName) {
        var bgpMsg = '';
        var sortFunction = function(a, b) {return a - b;};
        try{
        	if(procName === 'Propose'){
            	processId = FAM.Util_Shared.callProcessManager({
                    procId: 'proposal',
                    params: {subs: this.reqParams.subsidiaries.sort(sortFunction),
                             assetTypes: this.reqParams.assetTypes.sort(sortFunction),
                             autoGen: 'F'}
                });
            }
            else if(procName === 'Generate'){
            	this.updateProposalsToPending();
            	processId = FAM.Util_Shared.callProcessManager({
                    procId: 'assetGeneration',
                    params: {proplist: this.reqParams.propList.join(':')}
                });
            	
            }
        }
        catch (ex){
	        var errObj = JSON.parse(ex.message);
	        nlapiLogExecution('ERROR',errObj.name,errObj.message);
	        bgpMsg = errObj.message;
	    }
	    
        return bgpMsg;
    };
    
    this.updateProposalsToPending = function () {
    	var propIds = this.reqParams.propList;
    	for (i = 0; i <propIds.length; i++) {
            nlapiSubmitField('customrecord_ncfar_assetproposal',
            				 propIds[i],
                             'custrecord_propstatus',
                             FAM.ProposalStatus.Pending);
        }
    };
    
    /**
     * Searches for new Asset Proposals
     *
     * Parameters:
     *     blnCount {boolean} - flag to determine if results should be counted or not
     *     start {number} - The index number of the first result to return, inclusive
     *     end {number} - The index number of the last result to return, exclusive
     * Returns:
     *     {FAM.Search} - search results
    **/
    this.searchNewProposals = function (blnCount, start, end) {
        var fSearch = new FAM.Search(new FAM.AssetProposal_Record());

        fSearch.addFilter('status', null, 'is', FAM.ProposalStatus.New);

        if (this.reqParams.assetTypes.length > 0) {
            fSearch.addFilter('asset_type', null, 'anyof', this.reqParams.assetTypes);
        }
        if (this.reqParams.subsidiaries.length > 0) {
            fSearch.addFilter('subsidiary', null, 'anyof', this.reqParams.subsidiaries);
        }

        if (blnCount) {
            fSearch.addColumn('internalid', null, 'count');
        }
        else {
            fSearch.addColumn('subsidiary', null, null, 'SORT_ASC');
            fSearch.addColumn('asset_type', null, null, 'SORT_ASC');
            fSearch.addColumn('transaction');
            fSearch.addColumn('description');
            fSearch.addColumn('quantity');
            fSearch.addColumn('depr_method');
            fSearch.addColumn('initial_cost');
            fSearch.addColumn('rv');
            fSearch.addColumn('lifetime');
            // add fields from setup
             for(var i = 0; i < this.additionalSublistFieldsFromSetup.length; i++) {
                fSearch.addColumn(this.additionalSublistFieldsFromSetup[i]);
            }
        }
        
        fSearch.run(start, end);
        return fSearch;
    };

    /**
     * Triggers Old BGP Scheduled Script
     *
     * Parameters:
     *     funcName {string} - function to process
     * Returns:
     *     void
    **/
    this.scheduleScript = function (funcName) {
        var bgpURL, bgpResponse;

        bgpURL = nlapiResolveURL('SUITELET', 'customscript_ncfar_bgp_starter_sl',
            'customdeploy_ncfar_bgp_starter_deploy', true);
        bgpResponse = nlapiRequestURL(bgpURL, null, { custscript_bgp_processfunction : funcName });

        if (bgpResponse.getBody() == null) {
            nlapiLogExecution('error', 'FAM.AssetProposal_Su.scheduleScript',
                'Unexpected error while scheduling script');
        }
        else {
            nlapiLogExecution('debug', 'FAM.AssetProposal_Su.scheduleScript',
                'Scheduled Sript triggered.');
        }
    };

    /**
     * Rejects each marked asset proposal
     *
     * Parameters:
     *     request {nlobjRequest} - request object from suitelet function
     * Returns:
     *     void
    **/
    this.rejectProposals = function (request) {
        var i, propRec = new FAM.AssetProposal_Record();

        for(i = 1; i <= request.getLineItemCount('proposals'); i++) {
            if (request.getLineItemValue('proposals', 'marked', i) === 'T') {
                propRec.recordId = request.getLineItemValue('proposals', 'id', i);
                propRec.submitField({ status : FAM.ProposalStatus.Rejected });
            }
        }
    };

    /**
     * Creates the form to be displayed on the UI
     *
     * Parameters:
     *     none
     * Returns:
     *     {nlobjForm} - form object
    **/
    this.createForm = function (bgpmsg) {
        var i, j, searchProps, currentPageStart = 1, propCount, pageId, pageLabel, fldAction,
            fldAssetType, fldSubsidiary, fldIncludeChild, fldBGPMsg,
            fldPage, fldPropPerPage, subListProp,
            tabProposal = 'custpage_resulttab',
            screenName = 'assetproposal',
            form = nlapiCreateForm(FAM.resourceManager.GetString('custrecord_assetproposal_title',
                screenName));

        form.setScript('customscript_fam_proposal_su_cs');

        fldAction = form.addField('custpage_ncactionid', 'text', 'Action Id');
        fldAction.setDisplayType('hidden');
        fldAction.setDefaultValue('');

        fldAssetType = form.addField('custpage_filtermsassettype', 'multiselect',
            FAM.resourceManager.GetString('custpage_filtermsassettype', screenName),
            (new FAM.AssetType_Record()).getRecordTypeId());
        fldAssetType.setHelpText(FAM.resourceManager.GetString('assetrecord_assettypehelp'));
        if (this.reqParams.assetTypes.length > 0) {
            fldAssetType.setDefaultValue(this.reqParams.assetTypes);
        }

        if (FAM.Context.blnOneWorld) {
            fldSubsidiary = form.addField('custpage_filtermssubsid', 'multiselect',
                FAM.resourceManager.GetString('custpage_filtermssubsid', screenName), 'subsidiary');
            fldSubsidiary.setMandatory(true);
            fldSubsidiary.setHelpText(FAM.resourceManager.GetString('assetrecord_subshelp'));
            if (this.reqParams.subsidiaries.length > 0) {
                fldSubsidiary.setDefaultValue(this.reqParams.subsidiaries);
            }

            fldIncludeChild = form.addField('custpage_filtercbincchild', 'checkbox',
                FAM.resourceManager.GetString('custpage_filtercbincchild', screenName));
            fldIncludeChild.setDefaultValue(this.reqParams.includeChild);
            fldIncludeChild.setHelpText(FAM.resourceManager.GetString(
                'assetrecord_includechildhelp'));
        }

        fldBGPMsg = form.addField('custpage_bgpmsg', 'text', 'bgpmsg').setDisplayType('hidden').setDefaultValue(bgpmsg);

        this.generateProposalFieldMapping();
        this.additionalSublistFieldsFromSetup = this.getSublistFieldsFromSetup();

        form.addSubTab(tabProposal, FAM.resourceManager.GetString('proposals', screenName));

        searchProps = this.searchNewProposals(true);
        propCount = +searchProps.getValue(0, 'internalid', null, 'count');
        fldPage = form.addField('custpage_proppage', 'select',
            FAM.resourceManager.GetString('custpage_selectpage', screenName), null, tabProposal);
        if (propCount === 0) {
            fldPage.addSelectOption(1, '1 to 1 of 1', true);
        }
        else {
            while (currentPageStart <= propCount) {
                pageId = Math.ceil(currentPageStart / this.reqParams.propPerPage);
                pageLabel = currentPageStart + ' to ';
                if (currentPageStart + this.reqParams.propPerPage - 1 < propCount) {
                    pageLabel += (currentPageStart + this.reqParams.propPerPage - 1);
                }
                else {
                    pageLabel += propCount;
                }
                pageLabel += ' of ' + propCount;
                fldPage.addSelectOption(pageId, pageLabel, (this.reqParams.pageNum == pageId));
                currentPageStart += this.reqParams.propPerPage;
            }
        }

        fldPropPerPage = form.addField('custpage_rowperpage', 'select',
            FAM.resourceManager.GetString('custpage_rowperpage', screenName), null, tabProposal);
        for (i = 1; i < 5; i++) {
            fldPropPerPage.addSelectOption(i, i * this.defPropPerPage,
                (this.reqParams.propPerPage / this.defPropPerPage == i));
        }

        // generate sublist
        subListProp = this.addSublist(form, tabProposal, screenName);
        subListProp.addMarkAllButtons();
        subListProp.addButton('custpage_customize', 'Customize', 'proposal_customizeSublist();');

        form.addSubmitButton(FAM.resourceManager.GetString('custrecord_assetproposal_refreshbutton',
            screenName));
        form.addButton('Propose', FAM.resourceManager.GetString(
            'custrecord_assetproposal_proposebutton', screenName),
            "main_form.custpage_ncactionid.value='Propose';if (main_form.onsubmit()){main_form.submit();}");
        form.addButton('Generate', FAM.resourceManager.GetString(
            'custrecord_assetproposal_generatebutton', screenName), 'proposal_getCondition(\'Generate\')');

        if (FAM.SystemSetup.getSetting('isRestrictRejectProposal') === 'F' ||
            FAM.Context.blnAdmin) {

            form.addButton('Reject', FAM.resourceManager.GetString(
                'custrecord_assetproposal_rejectbutton', screenName), 'proposal_getCondition(\'Reject\')');
        }

        return form;
    };

    this.addSublist = function addSublist(form, tab, screenName) {

        this.flagDefaultFields();

        // create component and define columns
        var subListProp = form.addSubList('proposals', 'list',
            FAM.resourceManager.GetString('proposals', screenName), tab);

        // Select
        subListProp.addField('marked', 'checkbox', FAM.resourceManager.GetString('marked',
            screenName));

        // ID
        subListProp.addField('id', 'text', FAM.resourceManager.GetString('propid', screenName)).setDisplayType('inline');

        // Edit
        subListProp.addField('editurl', 'url', FAM.resourceManager.GetString('editurl', screenName),
            true).setLinkText(FAM.resourceManager.GetString('editurl', screenName));

        // Transaction
        subListProp.addField('custrecord_propsourceid', 'text',
            this.proposalFieldMapping['custrecord_propsourceid'].label,
            'transaction').setDisplayType('inline');

        // Asset Type
        if(this.displayDefaultFields.assetType) {
            subListProp.addField('custrecord_propassettype', 'text', 
                this.proposalFieldMapping['custrecord_propassettype'].label,
                (new FAM.AssetType_Record()).getRecordTypeId()).setDisplayType('inline');
        }

        // Description
        if(this.displayDefaultFields.description) {
            subListProp.addField('custrecord_propassetdescr', 'textarea', 
                this.proposalFieldMapping['custrecord_propassetdescr'].label).setDisplayType('inline');
        }

        // Quantity
        subListProp.addField('custrecord_propquantity', 'integer', 
            this.proposalFieldMapping['custrecord_propquantity'].label).setDisplayType('inline');

        // Process
        subListProp.addField('custrecord_propproc', 'text',
            FAM.resourceManager.GetString('custrecord_propproc', screenName))

        // Depreciation Method
        if(this.displayDefaultFields.depreciationMethod) {
            subListProp.addField('custrecord_propaccmethod', 'text',
                this.proposalFieldMapping['custrecord_propaccmethod'].label,
                (new FAM.DeprMethod_Record()).getRecordTypeId()).setDisplayType('inline');
        }
        
        // Initial Cost
        if(this.displayDefaultFields.initialCost) {
            subListProp.addField('custrecord_propassetcost', 'currency',
                this.proposalFieldMapping['custrecord_propassetcost'].label).setDisplayType('inline');
        }

        // Residual Value
        if(this.displayDefaultFields.residualValue) {
            subListProp.addField('custrecord_propresidvalue', 'currency', 
                this.proposalFieldMapping['custrecord_propresidvalue'].label).setDisplayType('inline');
        }

        // Lifetime
        if(this.displayDefaultFields.lifetime) {
            subListProp.addField('custrecord_propassetlifetime', 'integer',
                this.proposalFieldMapping['custrecord_propassetlifetime'].label).setDisplayType('inline');
        }

        // Subsidiary
        if (FAM.Context.blnOneWorld && this.displayDefaultFields.subsidiary) {
            subListProp.addField('custrecord_propsubsid', 'text', 
                this.proposalFieldMapping['custrecord_propsubsidiary'].label,
                'subsidiary').setDisplayType('inline');
        }

        // Hidden Fields
        subListProp.addField('custrecord_propstatushidden', 'text', 'status').setDisplayType('hidden');

        // add fields from setup
        this.addFieldsFromSetup(subListProp);

        // populate sublist
        var splitUrl = nlapiResolveURL('SUITELET',
            'customscript_fam_su_proposalsplit',
            'customdeploy_fam_su_proposalsplit') + '&propid=$PROPID$',
        splitText = FAM.resourceManager.GetString('custrecord_propsplit', screenName),
        anchorText = '<a class="dottedlink" href='+splitUrl+'>'+splitText+'</a>';

        searchProps = this.searchNewProposals(false, (this.reqParams.pageNum - 1) *
            this.reqParams.propPerPage, this.reqParams.pageNum * this.reqParams.propPerPage);
        if (searchProps.results) {
            for (j = 0; j < searchProps.results.length; j++) {
                subListProp.setLineItemValue('marked', j + 1, 'F');
                subListProp.setLineItemValue('id', j + 1, searchProps.getId(j));
                subListProp.setLineItemValue('editurl', j + 1, nlapiResolveURL('record',
                    (new FAM.AssetProposal_Record()).getRecordTypeId(), searchProps.getId(j), 'edit'));
                subListProp.setLineItemValue('custrecord_propsourceid', j + 1,
                    searchProps.getText(j, 'transaction'));

                if(this.displayDefaultFields.assetType) {
                    subListProp.setLineItemValue('custrecord_propassettype', j + 1,
                        searchProps.getText(j, 'asset_type'));
                }

                if(this.displayDefaultFields.description) {
                    subListProp.setLineItemValue('custrecord_propassetdescr', j + 1,
                        searchProps.getValue(j, 'description'));
                }

                subListProp.setLineItemValue('custrecord_propquantity', j + 1,
                    searchProps.getValue(j, 'quantity'));

                subListProp.setLineItemValue('custrecord_propproc', j + 1,
                    searchProps.getValue(j, 'quantity')>1?
                        anchorText.replace('$PROPID$',searchProps.getId(j)):null);

                if(this.displayDefaultFields.depreciationMethod) {
                    subListProp.setLineItemValue('custrecord_propaccmethod', j + 1,
                        searchProps.getText(j, 'depr_method'));
                }

                if(this.displayDefaultFields.initialCost) {
                    subListProp.setLineItemValue('custrecord_propassetcost', j + 1,
                        searchProps.getValue(j, 'initial_cost'));
                }

                if(this.displayDefaultFields.residualValue) {
                    subListProp.setLineItemValue('custrecord_propresidvalue', j + 1,
                            searchProps.getValue(j, 'rv'));
                }

                if(this.displayDefaultFields.lifetime) {
                    subListProp.setLineItemValue('custrecord_propassetlifetime', j + 1,
                            searchProps.getValue(j, 'lifetime'));
                }

                if (FAM.Context.blnOneWorld && this.displayDefaultFields.subsidiary) {
                    subListProp.setLineItemValue('custrecord_propsubsid', j + 1,
                        searchProps.getText(j, 'subsidiary'));
                }
                subListProp.setLineItemValue('custrecord_propstatushidden', j + 1,
                    searchProps.getValue(j, 'status'));

                // set fields from setup
                for(var i = 0; i < this.additionalSublistFieldsFromSetup.length; i++) {
                    var fldId = this.additionalSublistFieldsFromSetup[i];
                    var value = '';

                    switch(this.proposalFieldMapping[fldId].type) {
                        case 'select':
                            value = searchProps.getText(j, fldId);
                            break;
                        case 'checkbox':
                            value = searchProps.getValue(j, fldId) == 'T' ? 'Yes' : 'No';
                            break;
                        default:
                            value = searchProps.getValue(j, fldId);
                    }

                    subListProp.setLineItemValue(fldId, j + 1, value);
                }
            }
        }

        return subListProp;
    };

    this.addFieldsFromSetup = function addFieldsFromSetup(subListProp) {

        for(var i = 0; i < this.additionalSublistFieldsFromSetup.length; i++) {
            var fldId = this.additionalSublistFieldsFromSetup[i];
            if(this.proposalFieldMapping[fldId]) {
                subListProp.addField(fldId, 'text', this.proposalFieldMapping[fldId].label);
            }
        }
    };

    this.generateProposalFieldMapping = function generateProposalFieldMapping() {

        var assetRec = nlapiCreateRecord('customrecord_ncfar_assetproposal');
        var allFields = assetRec.getAllFields();

        for(var i = 0; i < allFields.length; i++) {
            var id = allFields[i];
            var fld = assetRec.getField(id);

            // some fields are null so ignore them
            if(fld) {
                var id = fld.getName();
                var label = fld.getLabel();

                // ignore labels that are empty AND blacklisted IDs
                if(label && this.blacklistedFields.indexOf(id) == -1) {
                    this.proposalFieldMapping[id] = {
                        label: label,
                        type: fld.getType()
                    }
                }
            }
        }
    };

    // TODO: similar with FAM.AssetProposalCustomize_Su. can be moved into a common function
    this.getSublistFieldsFromSetup = function getSublistFieldsFromSetup() {

        var fieldArr = [],
            pref = nlapiSearchRecord('customrecord_ncfar_systemsetup', null, null,
                new nlobjSearchColumn('custrecord_setup_prop_sublist_flds')) || [];
                
        if (pref.length > 0) {
            var fieldIdStr = pref[0].getValue('custrecord_setup_prop_sublist_flds'),
                setupRecId = pref[0].getId();

            // if fieldIdStr is either empty string or an empty array, create the default fields
            if(fieldIdStr) {
                try {
                    fieldArr = JSON.parse(fieldIdStr);

                    // remove fields that are invalid
                    var validFieldsOnly = [];
                    for(var i = 0; i < fieldArr.length; i++) {
                        var iter = fieldArr[i];
                        if(this.proposalFieldMapping[iter]) validFieldsOnly.push(iter);
                    }

                    fieldArr = validFieldsOnly;
                } catch(e) {
                    // create default fields
                    fieldArr = this.createDefaultFields(setupRecId);
                }

                if (fieldArr.length == 0) {
                    nlapiLogExecution('debug', 'getSublistFieldsFromSetup', 'no fields selected');
                }
            } else {
                // create default fields
                fieldArr = this.createDefaultFields(setupRecId);
            }
        } else {
            nlapiLogExecution('error', 'getSublistFieldsFromSetup', 'no setup record');
        }

        return fieldArr;
    };

    this.flagDefaultFields = function flagDefaultFields() {

        var nonDefaultFields = [];

        for(var i = 0; i < this.additionalSublistFieldsFromSetup.length; i++) {
            var iter = this.additionalSublistFieldsFromSetup[i];

            switch(iter) {
                case 'custrecord_propassettype':
                    this.displayDefaultFields.assetType = true;
                    break;
                case 'custrecord_propassetdescr':
                    this.displayDefaultFields.description = true;
                    break;
                case 'custrecord_propaccmethod':
                    this.displayDefaultFields.depreciationMethod = true;
                    break;
                case 'custrecord_propassetcost':
                    this.displayDefaultFields.initialCost = true;
                    break;
                case 'custrecord_propresidvalue':
                    this.displayDefaultFields.residualValue = true;
                    break;
                case 'custrecord_propassetlifetime':
                    this.displayDefaultFields.lifetime = true;
                    break;
                case 'custrecord_propsubsidiary':
                    this.displayDefaultFields.subsidiary = true;
                    break;
                default:
                    nonDefaultFields.push(iter);
            }
        }

        this.additionalSublistFieldsFromSetup = nonDefaultFields;
    };

    // TODO: similar with FAM.AssetProposalCustomize_Su. can be moved into a common function
    this.createDefaultFields = function createDefaultFields(recId) {

        nlapiSubmitField('customrecord_ncfar_systemsetup', recId,
            'custrecord_setup_prop_sublist_flds',
            JSON.stringify(this.defaultSublistFields));

        return this.defaultSublistFields;
    };

    this.blacklistedFields = [
        'customform',
        'scriptid',
        '_eml_nkey_',
        'id',
        'externalid',
        'isinactive',
        'owner'
    ];

    this.proposalFieldMapping = {};
    this.additionalSublistFieldsFromSetup = [];
    this.displayDefaultFields = {
        assetType: false,
        description: false,
        depreciationMethod: false,
        initialCost: false,
        residualValue: false,
        lifetime: false,
        subsidiary: false
    };

    // TODO: similar with FAM.AssetProposalCustomize_Su. can be moved into a common function
    // refer to this list to preserve order of default fields
    this.defaultSublistFields = [
        'custrecord_propassettype',
        'custrecord_propassetdescr',
        'custrecord_propaccmethod',
        'custrecord_propassetcost',
        'custrecord_propresidvalue',
        'custrecord_propassetlifetime',
        'custrecord_propsubsidiary'
    ];
};