if (!TAF) {
	var TAF = {};
}
TAF.DAO = TAF.DAO || {};

TAF.DAO.SetupConfigValue = function _SetupConfigValue(id) {
    this.id = id;
    this.key = '';
    this.value = '';
};

TAF.DAO.SetupConfigValueDao = function _SetupConfigValueDao(reportName, subId) {
	this.isOneWorld = nlapiGetContext().getFeature('SUBSIDIARIES');
	this.subId = subId;
	this.reportName = reportName;
	this.fieldValueMapping = this.getFieldValueMapping();
};

TAF.DAO.SetupConfigValueDao.prototype.getValueByKey = function getValueByKey(key) {
	if (!key) {
	    throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'TAF.DAO.SetupConfigValueDao.getValueByKey: key is required');
	}

	return this.fieldValueMapping[key] ? 
	    this.fieldValueMapping[key].value || null: 
	    null;
};

TAF.DAO.SetupConfigValueDao.prototype.getFieldValueMapping = function getFieldValueMapping() {
    var filters = [new nlobjSearchFilter('isinactive', null, 'is', 'F'), 
                   new nlobjSearchFilter('custrecord_taf_setupconfig_report', null, 'is', this.reportName)];
    var columns = [new nlobjSearchColumn('custrecord_taf_setupconfig_fieldkey'),
                   new nlobjSearchColumn('custrecord_taf_setupconfigvalue_value', 'custrecord_taf_setupconfigvalue_config')];
    
    if (this.isOneWorld) {
        filters.push(new nlobjSearchFilter('custrecord_taf_setupconfigvalue_sub', 'custrecord_taf_setupconfigvalue_config', 'is', this.subId));
    }

    var sr = nlapiSearchRecord('customrecord_taf_setupconfig', null, filters, columns);
    var mapping = {};
    
    for (var i = 0; sr && i < sr.length; ++i) {
    	var cfg = this.convertRowToObject(sr[i]);
    	mapping[cfg.key] = cfg;
    }
	
    return mapping;
};

TAF.DAO.SetupConfigValueDao.prototype.convertRowToObject = function _convertRowToObject(row){
    if(!row) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.DAO.SetupConfigValueDao.convertRowToObject: row is required. Kindly check your data');
    }
    var cfg = new TAF.DAO.SetupConfigValue(row.getId());
    cfg.key = row.getValue('custrecord_taf_setupconfig_fieldkey');
    cfg.value = row.getValue('custrecord_taf_setupconfigvalue_value', 'custrecord_taf_setupconfigvalue_config');
    return cfg;
};

TAF.DAO.SetupConfigField = function _SetupConfigField(id) {
    this.id = id;
    this.key = '';
    this.fieldtype = '';
    this.fieldtext = '';
};

TAF.DAO.SetupConfigFieldDao = function _SetupConfigFieldDao(reportName){
    this.reportName = reportName;
};

TAF.DAO.SetupConfigFieldDao.prototype.getFields = function getFields() {
    var filters = [new nlobjSearchFilter('isinactive', null, 'is', 'F'), 
                   new nlobjSearchFilter('custrecord_taf_setupconfig_report', null, 'is', this.reportName)];
    
    var columns = [new nlobjSearchColumn('custrecord_taf_setupconfig_fieldkey'),
                   new nlobjSearchColumn('custrecord_taf_setupconfig_fieldtype')];
    
    var sr = nlapiSearchRecord('customrecord_taf_setupconfig', null, filters, columns);
    var fields = {};
    for(var i = 0 ; sr && i < sr.length; ++i ){
    	var cfg =  this.convertRowToObject(sr[i]);
    	fields[cfg.key] = cfg;
    }
    return fields;
};

TAF.DAO.SetupConfigFieldDao.prototype.convertRowToObject = function _convertRowToObject(row) {
    if(!row) {
        throw nlapiCreateError('MISSING_PARAMETER', 'TAF.DAO.SetupConfigFieldDao.convertRowToObject: row is required. Kindly check your data');
    }
    var cfg = new TAF.DAO.SetupConfigField(row.getId());
    cfg.key = row.getValue('custrecord_taf_setupconfig_fieldkey');
    cfg.fieldtype = row.getValue('custrecord_taf_setupconfig_fieldtype');
    cfg.fieldtext = row.getText('custrecord_taf_setupconfig_fieldtype');
    return cfg;
};

