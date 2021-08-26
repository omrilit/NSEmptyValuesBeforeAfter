var Tax = Tax || {};

Tax.FileManager = function FileManager() {
	Tax.Processor.call(this);
	this.Name = 'FileManager';
};
Tax.FileManager.prototype = Object.create(Tax.Processor.prototype);

Tax.FileManager.prototype.createFile = function(fileProperties, data) {
	if (!fileProperties) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'fileProperties is required');
	}

	if (!fileProperties.filename) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'fileProperties.filename is required');
	}

	if (!fileProperties.extension) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'fileProperties.extension is required');
	}

	if (!fileProperties.type) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'fileProperties.type is required');
	}

	if (!fileProperties.folder) {
		throw nlapiCreateError('MISSING_REQD_ARGUMENT', 'fileProperties.folder is required');
	}

	var file = null;
	var fileId = -1;
	try {
		if (fileProperties.format === 'PDF') {
			var pdf = nlapiXMLToPDF(data);
			data = pdf.getValue();
		}

		var filename = [];
		filename.push(fileProperties.filename);
		filename.push(fileProperties.extension);
		file = nlapiCreateFile(filename.join('.'), fileProperties.type, data);

		if (file) {
			var folderName = fileProperties.folder.split('/').splice(1);
			var folderId = this.getFolderIdByName(folderName) || this.createRootFolder(fileProperties.folder);
			file.setFolder(folderId);
			fileId = nlapiSubmitFile(file);
		}
	} catch (ex) {
		logException(ex, 'Tax.FileManager.createFile');
		throw ex;
	}
	return fileId;
};

Tax.FileManager.prototype.getFileById = function getFileById(fileId) {
	var file = nlapiLoadFile(fileId);
	return file;
};

Tax.FileManager.prototype.getFolderIdByName = function getFolderIdByName(folderName, folderParentName) {
	var folderId = null;
	var filters = [];
	
	filters.push(new nlobjSearchFilter('name', null, 'is', folderName));
	
	if (folderParentName) {
		filters.push(new nlobjSearchFilter('parent', null, 'is', folderParentName));
	} else {
		filters.push(new nlobjSearchFilter('parent', null, 'is', '@NONE@'));
	}
	
	var sr = nlapiSearchRecord('folder', null, filters);
	if (sr && sr.length > 0) {
		folderId = sr[0].getId();
	}
	return folderId;
};

Tax.FileManager.prototype.createRootFolder = function createRootFolder(rootFolder) {
	var folders = rootFolder.split('/');
	var parentFolder = '';
	var folder = '';
	for (var ifolder = 0; folders && ifolder < folders.length; ifolder++) {
		if (!folders[ifolder]) {
			continue;
		}
		folder = this.getFolderIdByName(folders[ifolder], parentFolder);
		if (folder) {
			parentFolder = folder;
			continue;
		}
		parentFolder = this.createFolder(parentFolder, folders[ifolder]);
	}
	return parentFolder;
};

Tax.FileManager.prototype.createFolder = function createFolder(parent, name) {
	var folder = nlapiCreateRecord('folder');
	folder.setFieldValue('name', name);
	if (parent) {
		folder.setFieldValue('parent', parent);
	}
	return nlapiSubmitRecord(folder);
};

Tax.FileManager.prototype.process = function process(result, params) {
	var fileProperties = params.meta.file[params.format];
	fileProperties.format = params.format;
	fileProperties.filename = params.filename;
	fileProperties.folder = params.meta.folder;

	var fileId = this.createFile(fileProperties, result.rendered);
	var file = this.getFileById(fileId);
	result.fileUrl = file.getURL();
	result.filename = file.getName();
	return result;
};

