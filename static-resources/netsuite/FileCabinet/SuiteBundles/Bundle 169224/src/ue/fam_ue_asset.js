/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NScriptType usereventscript
 * @NAPIVersion 2.x
 */

define(['../adapter/fam_adapter_error',
        '../adapter/fam_adapter_format',
        '../adapter/fam_adapter_record',
        '../adapter/fam_adapter_runtime',
        '../adapter/fam_adapter_search',
        '../adapter/fam_adapter_ui_serverWidget',
        '../adapter/fam_adapter_url',
        '../const/fam_const_customlist',
        '../record/fam_record_asset',
        '../util/fam_util_assetvalues',
        '../util/fam_util_dhr',
        '../util/fam_util_envcfg',
        '../util/fam_util_forecast',
        '../util/fam_util_form',
        '../util/fam_util_math',
        '../util/fam_util_systemsetup',
        '../util/fam_util_translator',
        ],
    assetUE);

function assetUE(error, formatter, record, runtime, search, ui, url,
        customList, famAsset, utilAssetVals, utilDhr, utilEnvCfg, utilForecast, utilForm, utilMath, utilSetup, utilTranslator) {
    var module = {};
    var editableCompoundFields = ['name',
                                  'altname',
                                  'description',
                                  'serialNo',
                                  'alternateNo',
                                  'manufacturer',
                                  'manufactureDate',
                                  'supplier'];
    var assetSlaveFields = ['nbv',
                            'priorNbv',
                            'lastDeprDate',
                            'lastDeprAmount',
                            'lastDeprPeriod'];
    
    module.beforeLoad = function(context) {
        var fAssetRec = new famAsset();
        var fAssetRecFields = fAssetRec.getAllFields();
        var fAssetRecFieldKeys = Object.keys(fAssetRecFields);
        
        var ctxAssetRec = context.newRecord;
        var fieldsToSetDisplayType = {
            'disabled' : [],
            'inline' : [],
            'hidden' : []
        };
        
        // Create list of fields to set to inline
        var isCompound = ctxAssetRec.getValue('custrecord_is_compound');
        if (isCompound && context.type == context.UserEventType.EDIT) {
            var uneditableCompoundFields = fAssetRecFieldKeys.filter(function(key) {
                return ((editableCompoundFields.indexOf(key) === -1) && (key !== 'internalid'));
            });
            
            fieldsToSetDisplayType.inline = 
                fieldsToSetDisplayType.inline.concat(uneditableCompoundFields);
        }
        if (utilSetup.getSetting('precompute')){
            fieldsToSetDisplayType.inline.push('cumulativeDepr');
        }
        
        // copy record in UI
        if (context.type === context.UserEventType.COPY) {
            ctxAssetRec.setValue('custrecord_assetvals', '');
        }
        
        var assetValuesId = ctxAssetRec.getValue('custrecord_assetvals');
        if (assetValuesId) {
            if (context.type === context.UserEventType.VIEW ||
               (context.type === context.UserEventType.EDIT &&
                   (!utilSetup.getSetting('isAllowValueEdit') || !utilSetup.isRoleAllowed()))) {
                fieldsToSetDisplayType.hidden = 
                    fieldsToSetDisplayType.hidden.concat(assetSlaveFields);
                // Cumulative Depreciation is not an asset value field
                // but it also needs to be computed based on the asset value record
                fieldsToSetDisplayType.hidden.push('cumulativeDepr');
                
                this.showAssetValues(context.form, assetValuesId, ctxAssetRec.getValue('custrecord_assetcurrentcost'));
            }
        }
        else {
            fieldsToSetDisplayType.hidden.push('assetVals');
            fieldsToSetDisplayType.hidden.push('assetValsHelp');
        }
        
        // Set display type of fields 
        for (f in fieldsToSetDisplayType) {
            var fieldList = fieldsToSetDisplayType[f];
            for (var i = 0; i<fieldList.length; i++) {
                var fieldAlias = fieldList[i];
                var fieldToSetDisplayType = context.form.getField({
                    id: fAssetRecFields[fieldAlias]
                });
                this.updateFieldDisplayTypes(fieldToSetDisplayType, f);
            }
        }
        this.showHistoryTab(context, isCompound);
    };
    
    module.beforeSubmit = function(context){
        var newRec = context.newRecord;
        var oldRec = context.oldRecord;
        
        // New asset and Component Of has value OR asset edit and Component Of has changed
        if ((context.type == context.UserEventType.CREATE &&
            newRec.getValue("custrecord_componentof")) ||
            (context.type == context.UserEventType.EDIT &&
            oldRec.getValue("custrecord_componentof") != 
                newRec.getValue("custrecord_componentof"))) {
            
            var oldCmptOf = oldRec ? oldRec.getValue("custrecord_componentof") : null;
            
            // If Component Of is blank, then this is not a component at all. No need to validate.
            if (newRec.getValue("custrecord_componentof")) {
                this.validateComponent(newRec, oldCmptOf);
            };
        }
        
        if (context.type == context.UserEventType.CREATE &&
            newRec.getValue({ fieldId : 'custrecord_assetcreatedfrom' }) === 'split') {
            newRec.setValue({ fieldId : 'custrecord_assetvals', value : '' });
        }
    };
    
    module.afterSubmit = function(context){
        var newRec = context.newRecord,
            oldRec = context.oldRecord;
            isPrecomputeActive = utilSetup.getSetting('precompute');
        
        if (context.type == context.UserEventType.CREATE) {
            if (isPrecomputeActive){
                var assetValuesId = utilAssetVals.createInitAssetValuesFromRecord(newRec);
                log.debug('Asset Values created', 'ID: ' + assetValuesId);
                var result = record.submitFields({
                    type: 'customrecord_ncfar_asset',
                    id: newRec.id,
                    values: { custrecord_assetvals: assetValuesId }
                });
                
                // Check if newly created asset has parent set
                var parentId = newRec.getValue('custrecord_assetparent');
                this.processParentChange(parentId, newRec.id)
            }
            utilDhr.processAcquisitionHistoryFromRecord(newRec);
        }
        else if ((context.type == context.UserEventType.EDIT ||
                  context.type == context.UserEventType.XEDIT) &&
                  utilSetup.getSetting('isAllowValueEdit') && utilSetup.isRoleAllowed()) {
            utilDhr.processAcquisitionHistoryFromRecord(newRec, oldRec);
            if (isPrecomputeActive && !newRec.getValue('custrecord_is_compound')){
                utilForecast.processForecast(newRec, oldRec);
                if(newRec.getValue('custrecord_componentof')){
                    this.processComponentChange(oldRec, newRec);
                }
            }
        }
    };
    
    module.showAssetValues = function(form, assetValuesId, currentCost) {
        var assetValues = utilAssetVals.getFieldValues(assetValuesId, true);
        
        utilForm.insertNewField({
            form: form,
            name: 'assetlastdepramt',
            type: 'Currency',
            label: utilTranslator.getString('custpage_lastdepramt'),
            defaultValue: assetValues.custrecord_slavelastdepramt,
            helpText: utilTranslator.getString('custpage_lastdepramt_help')
        });
        utilForm.insertNewField({
            form: form,
            name: 'assetlastdeprdate',
            type: 'Date',
            label: utilTranslator.getString('custpage_lastdeprdate'),
            defaultValue: assetValues.custrecord_slavelastdeprdate,
            helpText: utilTranslator.getString('custpage_lastdeprdate_help')
        });
        utilForm.insertNewField({
            form: form,
            name: 'assetcurrentage',
            type: 'Integer',
            label: utilTranslator.getString('custpage_lastdeprperiod'),
            defaultValue: assetValues.custrecord_slavecurrentage,
            helpText: utilTranslator.getString('custpage_lastdeprperiod_help')
        });
        utilForm.insertNewField({
            form: form,
            name: 'assetbookvalue',
            type: 'Currency',
            label: utilTranslator.getString('custpage_nbv'),
            defaultValue: assetValues.custrecord_slavebookvalue,
            helpText: utilTranslator.getString('custpage_nbv_help')
        });
        utilForm.insertNewField({
            form: form,
            name: 'assetpriornbv',
            type: 'Currency',
            label: utilTranslator.getString('custpage_priornbv'),
            defaultValue: assetValues.custrecord_slavepriornbv,
            helpText: utilTranslator.getString('custpage_priornbv_help')
        });
        utilForm.insertNewField({
            form: form,
            name: 'assetdeprtodate',
            type: 'Currency',
            label: utilTranslator.getString('custpage_cumulativedepr'),
            defaultValue: utilMath.roundToDec(
                (currentCost || 0) - (assetValues.custrecord_slavebookvalue || 0)),
            helpText: utilTranslator.getString('custpage_cumulativedepr_help')
        });
    };
    
    module.showHistoryTab = function(context, isCompound) {
        if ((context.type == context.UserEventType.EDIT) || 
            (context.type == context.UserEventType.VIEW)) {
            
            if (!isCompound) {
                var isMultiBook = runtime.isFeatureInEffect({feature :"MULTIBOOK"});
                var record = context.newRecord;
                var form = context.form;
                var params = {custpage_assetid: record.id};
                var startDate = '';
                var endDate = '';
                var purchaseDate = '';
                
                if (record.getValue('custrecord_assetdeprstartdate')) {
                    startDate = formatter.stringToDate(record.getValue('custrecord_assetdeprstartdate'));
                }
                if (record.getValue('custrecord_assetdeprenddate')) {
                    endDate = formatter.stringToDate(record.getValue('custrecord_assetdeprenddate'));
                }
                if (record.getValue('custrecord_assetpurchasedate')) {
                    purchaseDate = formatter.stringToDate(record.getValue('custrecord_assetpurchasedate'));
                }
                    
                var accountingMethodValues = {
                    status: record.getText('custrecord_assetstatus'),
                    startDate: startDate,
                    endDate: endDate,
                    purchaseDate: purchaseDate};
                var screenName = 'depreciationhistory';
                
                form.addTab({
                    id: 'custpage_historytab', 
                    label: utilTranslator.getString('custpage_title', screenName), 
                    tab: null});
                
                form.addSubtab({
                    id: 'custpage_methodsubtab',
                    label: utilTranslator.getString('custpage_method', screenName),
                    tab: 'custpage_historytab'});
                
                var sublist = form.addSublist({
                    id: 'custpage_sublistid',
                    type: ui.getSublistType('LIST'),
                    label: utilTranslator.getString('custpage_method', screenName),
                    tab: 'custpage_methodsubtab'});
                                
                sublist.addField({
                    id: 'custpage_method',
                    type: ui.getFieldType('TEXT'),
                    label: utilTranslator.getString('custpage_method', screenName)});
                
                if (isMultiBook) {
                    sublist.addField({
                        id: 'custpage_bookname',
                        type: ui.getFieldType('TEXT'),
                        label: utilTranslator.getString('custpage_book', screenName)});
                }
                
                sublist.addField({
                    id: 'custpage_startdate',
                    type: ui.getFieldType('TEXT'),
                    label: utilTranslator.getString('custpage_startdate', screenName)});
                
                sublist.addField({
                    id: 'custpage_enddate',
                    type: ui.getFieldType('TEXT'),
                    label: utilTranslator.getString('custpage_enddate', screenName)});
                
                sublist.addField({
                    id: 'custpage_status',
                    type: ui.getFieldType('TEXT'),
                    label: utilTranslator.getString('custpage_status', screenName)});
                
                sublist.addField({
                    id: 'custpage_viewlink',
                    type: ui.getFieldType('TEXT'),
                    label: utilTranslator.getString('custpage_viewlink', screenName)});
                
                this.populateSublist(sublist, accountingMethodValues, params, isMultiBook);
            }
        }
    };
    
    module.searchMethods = function(assetId) {
        var searchRes = null;        
        var searchObj = search.load({id: 'customsearch_fam_altdepr'});
        
        searchObj.filters.push(search.createFilter({
            name: 'custrecord_altdeprasset',
            operator: 'anyof',
            values: assetId
        }));
        
        searchRes = searchObj.run().getRange(0, 1000);
        
        if (searchRes && searchRes.length > 0) {
            log.debug('history count: ' + searchRes.length);
        }
        
        return searchRes;
    };
          
    module.populateSublist = function(sublist, accountingMethodValues, params, isMultiBook) {
        var suiteletURL = '';
        var strLink = '<a target = \'_blank\' class = \'dottedlink\' href = suiteletURL>' + 
            utilTranslator.getString('custpage_viewlink', 'depreciationhistory') + '</a>';
        var scriptId = 'customscript_fam_showdeprhistory_su';
        var deploymentId = 'customdeploy_fam_showdeprhistory_su';
        var line = 0;
        
        //accounting method
        if (accountingMethodValues.purchaseDate || accountingMethodValues.startDate) {
            var bookName = 'Primary Accounting Book';
            var methodName = 'Accounting Method';
            
            if (isMultiBook) {
                sublist.setSublistValue({id: 'custpage_bookname', line: line, value: bookName});
            }
            suiteletURL = url.resolveScript({
                scriptId: scriptId,
                deploymentId: deploymentId,
                params : params
            });
            sublist.setSublistValue({id: 'custpage_method', line: line, value: methodName});
            sublist.setSublistValue({id: 'custpage_startdate', line: line, value: accountingMethodValues.startDate || ' '});            
            sublist.setSublistValue({id: 'custpage_enddate', line: line, value: accountingMethodValues.endDate || ' '});
            sublist.setSublistValue({id: 'custpage_status', line: line, value: accountingMethodValues.status || ' '});
            sublist.setSublistValue({id: 'custpage_viewlink', line: line, value: strLink.replace('suiteletURL', suiteletURL) || ' '});
            line++;
        }
        
        //alternate methods
        var arrMethod = this.searchMethods(params.custpage_assetid) || [];
        var startDate = '';
        var endDate = '';
        
        for (var i = 0; i < arrMethod.length; i++) {
            startDate = arrMethod[i].getValue('custrecord_altdeprstartdeprdate');
            endDate = arrMethod[i].getValue('custrecord_altdepr_deprenddate');
            
            if (accountingMethodValues.purchaseDate || startDate) {
                if (isMultiBook) {
                    sublist.setSublistValue({id: 'custpage_bookname', line: line, value: arrMethod[i].getText('custrecord_altdepr_accountingbook') || ' '});
                }
                params.custpage_altdeprid = arrMethod[i].id;
                suiteletURL = url.resolveScript({
                    scriptId: scriptId,
                    deploymentId: deploymentId,
                    params : params
                });
                sublist.setSublistValue({id: 'custpage_method', line: line, value: arrMethod[i].getText('custrecord_altdepraltmethod') || ' '});
                sublist.setSublistValue({id: 'custpage_startdate', line: line, value: startDate || ' '});            
                sublist.setSublistValue({id: 'custpage_enddate', line: line, value: endDate || ' '});
                sublist.setSublistValue({id: 'custpage_status', line: line, value: arrMethod[i].getText('custrecord_altdeprstatus') || ' '});
                sublist.setSublistValue({id: 'custpage_viewlink', line: line, value: strLink.replace('suiteletURL', suiteletURL) || ' '});
                line++;
            }
        }
    };
    
    module.updateFieldDisplayTypes = function(field, displayType) {
        try {
            field.updateDisplayType({displayType: displayType});
        }
        catch (e) {
            log.error("FIELD_DISPLAYTYPE_UPDATE_ERROR", e);
            return false;
        }
        
        return true;
    };
    
    //--- non script entry methods ---//
    module.validateComponent = function(cmptRec, oldCmptOf) {
        var cmptSub = cmptRec.getValue("custrecord_assetsubsidiary"),
            cmptType = cmptRec.getValue("custrecord_assettype"),
            cmptAccMethod = cmptRec.getValue("custrecord_assetaccmethod"),
            cmptStatus = cmptRec.getValue("custrecord_assetstatus"),
            cmptParent = cmptRec.getValue("custrecord_componentof");
        
        // Component cannot add itself as component. Because componentception.
        if (cmptRec.id === Number(cmptParent)) {
            var err = error.create({
                name: "INVALID_COMPONENT_SELF",
                message: utilTranslator.getString("custmsg_invalid_component_self", "compoundasset")
            });
            
            throw err;
        }
        
        else if (oldCmptOf) {
            var err = error.create({
                name: "ALREADY_PART_OF_COMPOUND",
                message: utilTranslator.getString("client_component_of", "compoundasset")
            });
            
            throw err;
        }
        
        if (!oldCmptOf) {
            // Load parent asset values e.g. sub, asset type, alt method, preferably thru lookupFields
            var prntFields = search.lookupFields({
                type : "customrecord_ncfar_asset",
                id : cmptParent,
                columns: ["custrecord_assetsubsidiary",
                          "custrecord_assettype",
                          "custrecord_assetaccmethod",
                          "custrecord_is_compound"]
            });
            
            var prntSub = utilEnvCfg.isOneWorld() ?
                    prntFields["custrecord_assetsubsidiary"][0]["value"] : null,
                prntType = prntFields["custrecord_assettype"][0]["value"],
                prntAccMethod = prntFields["custrecord_assetaccmethod"][0]["value"],
                prntIsCompound = prntFields["custrecord_is_compound"];
            
            if (!prntIsCompound) {
                var err = error.create({
                    name: "PARENT_NOT_COMPOUND",
                    message: utilTranslator.getString("custmsg_parent_not_compound", "compoundasset")
                });
                
                throw err;
            }
        
            // Compare values with parent then throw error. That's what this is for anyway.
            var componentFields = { sub : cmptSub, type : cmptType, accMethod : cmptAccMethod };
            var parentFields = { sub : prntSub, type : prntType, accMethod : prntAccMethod };
            var invalidMatches = this.findMismatches(componentFields, parentFields);
            if (invalidMatches.length > 0){
                var err = error.create({
                    name: "FIELD_MISMATCH",
                    message: errMsg = utilTranslator.getString(
                        "client_comp_field_mismatch", "compoundasset", [invalidMatches.join(', ')])
                });
                
                throw err;
            };
            
            // Check status of this asset then throw error
            if (!this.validateStatus(Number(cmptStatus))){
                var err = error.create({
                    name: "INVALID_STATUS",
                    message: utilTranslator.getString("client_comp_status", "compoundasset")
                });
                
                throw err;
            };
            
            // Check asset if it is not already in the same compound asset hierarchy e.g.
            // if A is parent of B, and B is parent of C, C should not be able to add A as its component
            if (!this.validateIfWithinHierarchy(Number(cmptRec.id), Number(cmptParent))) {
                var err = error.create({
                    name: "INVALID_COMPONENT_ROOT",
                    message: utilTranslator.getString("custmsg_invalid_component_root", "compoundasset")
                });
                
                throw err;
            }
        }
        
        return true;
    };
    
    module.processComponentChange = function(oldRec, newRec){
        var slaveId, avRec;
        if((oldRec.getValue('custrecord_assetcost')!=newRec.getValue('custrecord_assetcost')) ||
           (oldRec.getValue('custrecord_assetcurrentcost')!=newRec.getValue('custrecord_assetcurrentcost')) ||
           // Transfer triggers
           (oldRec.getValue('custrecord_assetsubsidiary')!=newRec.getValue('custrecord_assetsubsidiary')) ||
           (oldRec.getValue('custrecord_assetclass')!=newRec.getValue('custrecord_assetclass')) ||
           (oldRec.getValue('custrecord_assetdepartment')!=newRec.getValue('custrecord_assetdepartment')) ||
           (oldRec.getValue('custrecord_assetlocation')!=newRec.getValue('custrecord_assetlocation')) ||
           (oldRec.getValue('custrecord_assettype')!=newRec.getValue('custrecord_assettype'))) {
            
            //See Observation Dev-9 1/26/17
            slaveId = +newRec.getValue('custrecord_assetvals') || +oldRec.getValue('custrecord_assetvals');
            
            avRec = record.load({type: 'customrecord_fam_assetvalues', id: slaveId});
            avRec.setValue({fieldId: 'custrecord_slaveisupdated', value: true});
            avRec.save();
        }
        
    };
    
    module.findMismatches = function(componentFields, parentFields) {
        var invalidMatches = [];
        if (utilEnvCfg.isOneWorld() && (componentFields.sub !== parentFields.sub)) {
            invalidMatches.push(utilTranslator.getString("custpage_assetsub", "compoundasset"));
        };
        if (componentFields.type !== parentFields.type) {
            invalidMatches.push(utilTranslator.getString("custpage_assettype", "compoundasset"));
        };
        if (componentFields.accMethod !== parentFields.accMethod) {
            invalidMatches.push(utilTranslator.getString("custpage_acctg_method", "compoundasset"));
        };
        
        return invalidMatches;
    };
    
    module.validateStatus = function(status) {
        return (status === customList.AssetStatus['New'] ||
                status === customList.AssetStatus['Depreciating'] ||
                status === customList.AssetStatus['Part Disposed']);
    };
    
    module.validateIfWithinHierarchy = function(componentId, parentId) {
        // Will only search 4 times upwards and start from the parent compound.
        var SEARCH_LIMIT = 5;
        
        var isWithinHierarchy = false;
        var i = 0;
        while (!isWithinHierarchy && i < SEARCH_LIMIT-1) {
            var prntFields = search.lookupFields({
                type : "customrecord_ncfar_asset",
                id : Number(parentId),
                columns: ["custrecord_componentof"]
            });
            
            // Prepare data for next iteration
            parentId = prntFields["custrecord_componentof"][0] ? 
                Number(prntFields["custrecord_componentof"][0]["value"]) : null;
            
            if (parentId) {
                i++;
            }
            else {
                // Stop if there is no parent compound 
                break;
            }
            
            // But also check if this component is within the same compound asset hierarchy 
            if (parentId === componentId) {
                isWithinHierarchy = true;
                break;
            }
        }
        
        if ((i == SEARCH_LIMIT-1) && !isWithinHierarchy) {
            log.audit(
                "Compound asset hierarchy limit exceeded",
                ["Exceeded the hierarchy limit of ", SEARCH_LIMIT, ". ",
                 "Returning value as not a circular reference."].join(""));
        };
        
        return !isWithinHierarchy;
    };
    
    module.processParentChange = function(parentId, newRecId) {
        if (parentId) {
            var isParentAChild = utilForecast.isChild(parentId);
            
            // Do nothing if parent is already a child of another asset
            if (!isParentAChild) {
                // Do nothing if asset has siblins from parent
                var hasSiblings = (utilForecast.countChildAssets(parentId, newRecId) > 0);
                if (!hasSiblings) {
                    utilForecast.schedMassForecastReset([parentId]);
                }
            }
        }
    }

    return module;
};
