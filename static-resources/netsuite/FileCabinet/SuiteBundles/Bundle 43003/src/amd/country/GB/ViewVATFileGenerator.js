/**
 * Copyright � 2018, 2019 Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([
    'N/error',
    'N/file',
    'N/encode',
    '../../lib/base/BaseProcess',
    '../../lib/FileManager',
    '../../lib/OnlineFilingTemplateManager',
    '../../lib/module/util',
    '../../lib/Constants'],
function(
    error,
    file,
    encode,
    BaseProcess,
    FileManager,
    OnlineFilingTemplateManager,
    filingUtil,
    Constants) {

	var ViewVATFileGenerator = function FileWriter() {
        BaseProcess.apply(this, arguments);
		this.name = 'ViewVATFileGenerator';
		this.fileManager = new FileManager();
		this.encode = encode;
		this.file = file;
		this.templateManager = new OnlineFilingTemplateManager();
		this.filingUtil = filingUtil;
	};

    util.extend(ViewVATFileGenerator.prototype, BaseProcess.prototype);

    ViewVATFileGenerator.prototype.process = function(context, processId, nextProcessId) {
        log.debug({ title: this.name, details: 'process' });
        if (!this.canHandle(context)) {
            return context;
        }
        var config = context.getConfigurations(processId);
        var data = context.getVariable(processId);
        var periodToDate = new Date(context.getVariable('formattedPeriodTo').replace(/-/g,'/'));
        var isBrexit = periodToDate >=  new Date(Constants.BREXIT_DATE); 
        var template = this.templateManager.getByName(isBrexit ? config.fileTemplateBrexit : config.fileTemplate);

        var encodedStr = this.encode.convert({
            string : this.filingUtil.render(template, data),
            inputEncoding : this.encode.Encoding.UTF_8,
            outputEncoding : this.encode.Encoding.BASE_64
        });
        var metaData = context.getVariable('metaData');
        var folderName = metaData && metaData.outputFolder || Constants.DEFAULT_DOWNLOAD_FOLDER;
        var folderId = this.getFolderId(folderName);
        var fileName = this.buildFileName(context.getVariable('vrn'), context.getVariable('formattedPeriodFrom'), context.getVariable('formattedPeriodTo'));
        var excelFile = this.file.create({
            name:  fileName,
            fileType: this.file.Type.EXCEL,
            contents: encodedStr,
            folder: folderId
        });
        var fileId = excelFile.save();
        var fileObj = this.fileManager.getFileById(fileId);

        context.setVariable('fileName', fileObj.name);
        context.setVariable('fileUrl', context.getVariable('baseURL') + fileObj.url);
        context.setVariable('fileFolder', folderName);
        return context;
	};

    ViewVATFileGenerator.prototype.buildFileName = function(vrn, periodFrom, periodTo) {
        var formattedPeriodFrom = periodFrom.replace(/-/g, '');
        var formattedPeriodTo = periodTo.replace(/-/g, '');
        return [vrn, formattedPeriodFrom, formattedPeriodTo].join('_') + '.xls';
    };

    ViewVATFileGenerator.prototype.getFolderId = function(folderName) {
        var folderId;
        var folder = this.fileManager.getFolderByName(folderName);
        if (!folder) {
            folderId = this.fileManager.createFolder(folderName);
        } else {
            folderId = folder.id;
        }
        return folderId;
    };

	return ViewVATFileGenerator;
});
