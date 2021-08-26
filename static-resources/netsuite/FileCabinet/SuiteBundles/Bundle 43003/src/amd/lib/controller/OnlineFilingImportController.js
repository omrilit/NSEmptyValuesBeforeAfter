/**
 * Copyright (c) 2018, 2019, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([
    'N/https',
    'N/cache',
    'N/config',
    'N/encode',
    'N/file',
    'N/record',
    'N/redirect',
    'N/runtime',
    '../base/BaseController',
    '../dao/SchemaDAO',
    '../dao/TaxPeriodDAO',
    '../dao/VATOnlineConfigurationDAO',
    '../OnlineFilingManager',
    '../OnlineFilingTemplateManager',
    '../FormBuilder',
    '../module/environmentChecker',
    '../module/util',
    '../Constants',
    '../module/error',
    '../module/translator_engine',
    'require'	
],
function(
    https,
    cache,
    config,
    encode,
    file,
    record,
    redirect,
    runtime,
    BaseController,
    SchemaDAO,
    TaxPeriodDAO,
    VATOnlineConfigurationDAO,
    OnlineFilingManager,
    OnlineFilingTemplateManager,
    FormBuilder,
    envCheck,
    filingUtil,
    Constants,
    error,
    uTranslator,
    require
) {

    var OnlineFilingImportController = function(request, response) {
        BaseController.call(this);
        this.name = 'OnlineFilingImportController';
        this.importFileFieldId = 'custpage_online_filing_import_file';
        this.formBuilder = new FormBuilder();
        this.config = config;
        this.request = request;
        this.response = response;
        this.envCheck = envCheck;
        this.https = https;
        this.encode = encode;
        this.file = file;
        this.record = record;
        this.redirect = redirect;
        this.onlineFilingManager = new OnlineFilingManager();
		this.templateManager = new OnlineFilingTemplateManager();
		this.filingUtil = filingUtil;
		this.schemaDAO = new SchemaDAO();
		this.taxPeriodDAO = new TaxPeriodDAO();
		this.taxPeriodMap = this.getTaxPeriodMapping();
		this.vatOnlineConfigDAO = new VATOnlineConfigurationDAO();
		this.subId = runtime.getCurrentUser().subsidiary;
        this.cache = cache.getCache({
            name: Constants.CACHE_ID,
            scope: cache.Scope.PRIVATE
        });
    }

    util.extend(OnlineFilingImportController.prototype, BaseController.prototype);

    OnlineFilingImportController.prototype.execute = function() {
        try {
            var templateParams = this.getTemplateParameters();
        	var template = this.templateManager.getByName('HMRC.MTD.CSV.Filing');
        	var renderedTemplate = this.filingUtil.render(template, templateParams);

    		var divStyle = 'display:inline-block; overflow:hidden;';
    		var div = ["<div id='divvat' name='divvat' style='"+divStyle+"'>"];
    		div.push(renderedTemplate);
    		div.push("</div>");
            this.envCheck.validateEnvironment();
            this.formBuilder.init({
                title: uTranslator.getString('FORM_TITLE_UK_MTD_SUBMIT_VIA_CSV'),
                clientScriptModulePath: '../component/cs/online_filing_import_cs',
                fields: [
                    { id: 'custpage_reptemp', label: " ", value: div.join(""),
                    	type: this.ui.FieldType.INLINEHTML, layoutType: this.ui.FieldLayoutType.OUTSIDEBELOW,
                    	breakType: this.ui.FieldBreakType.STARTROW }
                ]
            });
            var messageCache = JSON.parse(this.cache.get({ key: 'MESSAGE_CACHE' }));
            if(messageCache) {
                switch (messageCache.status) {
                    case Constants.Status.SUCCESS: this.formBuilder.addSuccessMessage(messageCache.message); break;
                    default: this.formBuilder.addErrorMessage(messageCache.message); break;
                }
                this.cache.remove({ key: 'MESSAGE_CACHE' });
            }
        } catch (ex) {
            var name = ex.name || ex.code || 'ERROR';
            var message = ex.message || 'An error occurred';
            log.error({ title: this.name + '.execute', details: name + ' - ' + message });
            this.formBuilder.addErrorMessage(message);
        }

        return this.formBuilder.form;
    };
    
    OnlineFilingImportController.prototype.loadImportClasses = function(nexus) {
        try {
            var onlineFilingConfiguration = this.onlineFilingManager.getConfiguration({ nexus: nexus });
            var importClass = onlineFilingConfiguration.config.import;
            var parser;
            var validator;
            var adapter;
            require([importClass.parser, importClass.validator, importClass.adapter], function(Parser, Validator, Adapter) {
                parser = new Parser();
                validator = new Validator();
                adapter = new Adapter();
            });
            this.parser = parser;
            this.validator = validator;
            this.adapter = adapter;
        } catch (ex) {
            log.error({
                title: this.name + '.loadImportClasses',
                details: ex.message
            });
            error.throw(
                { code: 'IMPORT_CLASS_ERROR', message: 'Unable to create Import classes' },
                this.name + '.loadImportClasses'
            );
        }
    };
    
    OnlineFilingImportController.prototype.getTaxPeriodMapping = function() {
        var taxPeriodMap = {};
        var year = {};
        var quarter = {};
        var month = {};
        
        var rs = this.taxPeriodDAO.getList();
        for(var i in rs) {
            var row = rs[i];
            taxPeriodMap[row.id] = row.name;
            if(row.isYear) {
                year[row.id] = row.name;
            } else if(row.isQuarter) {
                quarter[row.parent] = quarter[row.parent] || {};
                quarter[row.parent][row.id] = row.name;
            } else {
                month[row.parent] = month[row.parent] || {};
                month[row.parent][row.id] = row.name
            }
        }
        
        taxPeriodMap = {
            year: year,
            quarter: quarter,
            month: month
        }
        
        return taxPeriodMap;
    };;
    
    OnlineFilingImportController.prototype.getTemplateParameters = function() {
        var params = {};
        this.setupConfig = this.getConfig(this.subId);
        this.fromPeriodOptions = this.buildOptions(this.taxPeriodMap, 'year', this.setupConfig[Constants.CONFIG.SUBMIT_CSV.PERIOD_FROM]);
        this.toPeriodOptions = this.buildOptions(this.taxPeriodMap, 'year', this.setupConfig[Constants.CONFIG.SUBMIT_CSV.PERIOD_TO]);
        var periodType = this.setupConfig[Constants.CONFIG.SUBMIT_CSV.PERIOD_TYPE] || '';
        params = {
            vrnmtdcsv: this.setupConfig[Constants.CONFIG.SUBMIT_CSV.VRN] || '',
            fromPeriodOptions: this.fromPeriodOptions.join(''),
            toPeriodOptions: this.toPeriodOptions.join(''),
            quarterly: periodType == 'QUARTERLY' ? 'selected' : '',
            monthly: periodType == 'MONTHLY' ? 'selected' : '',
            isEdit: this.request.parameters.mode == 'edit' ? '' : 'disabled' 
        }

        return params;
    };
    
    OnlineFilingImportController.prototype.getConfig = function(subId) {
        if(!subId) {
            error.throw(
                { code: 'MISSING_PARAMETER', message: 'subId is a required parameter' },
                this.name + '.getConfig'
            );
        }
        
        var config = {};
        var rs = this.vatOnlineConfigDAO.getList({ subsidiary: subId });
        for(var i in rs) {
            var row = rs[i];
            config[row.configName] = row.value || ''
        }
        
        return config;
    };
    
    OnlineFilingImportController.prototype.saveConfig = function(params) {
        try {
            params.subsidiary = this.subId
            var config;
            for(var key in Constants.CONFIG.SUBMIT_CSV) {
                params.configName = Constants.CONFIG.SUBMIT_CSV[key]
                var rs = this.vatOnlineConfigDAO.getList(params);
                config = rs && rs.length > 0 ? rs[0] : {};

                if (config.id) {
                    this.record.submitFields({
                        type: 'customrecord_tax_return_setup_item',
                        id: config.id,
                        values: {
                            'custrecord_vat_cfg_value': unescape(params[params.configName.toLowerCase()])
                        }
                    });
                } else {
                    this.createRecord(params.configName, unescape(params[params.configName.toLowerCase()]));
                }
            }
            
            var msgObj = {
                status: Constants.Status.SUCCESS,
                message: Constants.MESSAGE.IMPORT.SETUP_SAVED
            }
            
            this.cache.put({
                key: 'MESSAGE_CACHE',
                value:  msgObj
            });
        } catch (ex) {
            log.error({
                title: this.name + '.saveConfig',
                details: ex.message
            });
            error.throw(
                { code: 'SAVE_CONFIG_ERROR', message: 'Unable to save mtd config' },
                this.name + '.saveConfig'
            );
        }
    };

    OnlineFilingImportController.prototype.submitCSV = function() {
    	try{
	        this.loadImportClasses('GB');
	        var fileContent = this.parser.readFile(this.request.parameters);
	        var parsedContent = this.parser.parse(fileContent);
	        var templateParams = this.getTemplateParameters();
	        this.validator.validate({
	            data: parsedContent,
	            expectedValues: {
	                VRN: templateParams.vrnmtdcsv
	            }
	        });
	        var transformParams = {
	        		fileData: parsedContent
	        };
	        var data = this.adapter.transform(transformParams);
            var responseData = {
                'periodFrom': this.setupConfig[Constants.CONFIG.SUBMIT_CSV.PERIOD_FROM],
				'periodTo': this.setupConfig[Constants.CONFIG.SUBMIT_CSV.PERIOD_TO],
				'nexus': 'GB',
                'subsidiary': this.subId,
                'vrn': templateParams.vrnmtdcsv,
                'action': Constants.ACTION.SUBMIT_CSV
            };
            
            responseData.data = data;
	        this.response.write(JSON.stringify(responseData));
	    } catch (ex) {	        
	        var msgObj = {
	                status: Constants.Status.ERROR,
	                message: ex.message
	            }
	            this.cache.put({
	                key: 'MESSAGE_CACHE',
	                value:  msgObj
	            });
	        
	        this.response.write(Constants.Status.ERROR);
	    }
    };
    
    OnlineFilingImportController.prototype.createRecord = function(field, value) {
        var rec = this.record.create({ type: 'customrecord_tax_return_setup_item' });
        rec.setValue({ fieldId: 'custrecord_vat_cfg_subsidiary', value: this.subId });
        rec.setValue({ fieldId: 'custrecord_vat_cfg_country', value: 'GB' });
        rec.setValue({ fieldId: 'custrecord_vat_cfg_name', value: field });
        rec.setValue({ fieldId: 'custrecord_vat_cfg_value', value: value });
        rec.save();
    };
    
    OnlineFilingImportController.prototype.getFieldHelp = function(params) {
        var result = {
                title: 'Field Help',
                text: 'This is a custom field'
        };
        var isExposed = this.config.load({ type: this.config.Type.USER_PREFERENCES }).getValue('EXPOSEIDS');
        try {
            var rs = this.schemaDAO.getList(params);
            var setupField = rs && rs.length > 0 ? rs[0] : {};
            result.text = setupField.help || result.text;
            
            if (isExposed) {
                result.text +="<br/><br/><div align='right'>Field ID: " + params.id + "</div>";
            }
        } catch(ex) {
            var name = ex.name || ex.code || 'ERROR';
            var message = ex.message || 'An error occurred';
            log.error({ title: this.name + '.getFieldHelp', details: name + ' - ' + message });
        }

        this.response.write(JSON.stringify(result));
    };
    
    OnlineFilingImportController.prototype.buildOptions = function(taxPeriodMap, periodType, value, options, parent, padding) {
        options = options || ['<option value=""></option>'];
        var period = parent ? taxPeriodMap[periodType][parent] : taxPeriodMap[periodType];
        padding = padding || '';
        var isSelected;
        for(var key in period) {
            isSelected = key == value? 'selected' : '';
            options.push('<option value="' + key + '" ' + isSelected + '>' + padding + period[key] + '</option>');
            switch(periodType) {
                case 'year':
                    this.buildOptions(taxPeriodMap, 'quarter', value, options, key, '&nbsp;&nbsp;&nbsp;');
                    break;
                case 'quarter':
                    this.buildOptions(taxPeriodMap, 'month', value, options, key, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
                    break;
            }
        }

        return options;
    };

    return OnlineFilingImportController;
});
