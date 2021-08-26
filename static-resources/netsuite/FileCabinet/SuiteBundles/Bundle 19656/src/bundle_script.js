function beforeInstallUpdate() {
	var context = nlapiGetContext();
	var version = context.getVersion();
	var major = parseInt(version.split('.')[0]);
	var requiredMajor = '2012';
	
	if ((major) && (major < requiredMajor)) {
	     throw new nlobjError('INSTALLATION_ERROR','This bundle requires at least version 2012.1');
	}
}
