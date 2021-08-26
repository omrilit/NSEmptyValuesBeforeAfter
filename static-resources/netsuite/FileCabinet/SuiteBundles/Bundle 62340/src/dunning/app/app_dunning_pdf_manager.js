/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author mjaurigue
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningPDFManager = function () {
  this.folderManager = new dunning.app.DunningFolderManager();
  this.pdfGenerator = new dunning.app.DunningLetterPDFGenerator();
  this.ctx = ns_wrapper.context();
};

dunning.app.DunningPDFManager.prototype.getTimezoneOffset = function (tz) {
  var offsets = {
    'Etc/GMT+12': -720,
    'Pacific/Samoa': -660,
    'Pacific/Honolulu': -600,
    'America/Anchorage': -540,
    'America/Los_Angeles': -480,
    'America/Tijuana': -480,
    'America/Denver': -420,
    'America/Phoenix': -420,
    'America/Chihuahua': -420,
    'America/Chicago': -360,
    'America/Regina': -360,
    'America/Guatemala': -360,
    'America/Mexico_City': -360,
    'America/New_York': -300,
    'US/East-Indiana': -300,
    'America/Bogota': -300,
    'America/Caracas': -270,
    'America/Halifax': -240,
    'America/La_Paz': -240,
    'America/Manaus': -240,
    'America/Santiago': -240,
    'America/St_Johns': -210,
    'America/Sao_Paulo': -180,
    'America/Buenos_Aires': -180,
    'Etc/GMT+3': -180,
    'America/Godthab': -180,
    'America/Montevideo': -180,
    'America/Noronha': -120,
    'Etc/GMT+1': -60,
    'Atlantic/Azores': -60,
    'Europe/London': 0,
    'GMT': 0,
    'Atlantic/Reykjavik': 0,
    'Europe/Warsaw': 60,
    'Europe/Paris': 60,
    'Etc/GMT-1': 60,
    'Europe/Amsterdam': 60,
    'Europe/Budapest': 60,
    'Africa/Cairo': 120,
    'Europe/Istanbul': 120,
    'Asia/Jerusalem': 120,
    'Asia/Amman': 120,
    'Asia/Beirut': 120,
    'Africa/Johannesburg': 120,
    'Europe/Kiev': 120,
    'Europe/Minsk': 120,
    'Africa/Windhoek': 120,
    'Asia/Riyadh': 180,
    'Europe/Moscow': 180,
    'Asia/Baghdad': 180,
    'Africa/Nairobi': 180,
    'Asia/Tehran': 210,
    'Asia/Muscat': 240,
    'Asia/Baku': 240,
    'Asia/Yerevan': 240,
    'Etc/GMT-3': 240,
    'Asia/Kabul': 270,
    'Asia/Karachi': 300,
    'Asia/Yekaterinburg': 300,
    'Asia/Tashkent': 300,
    'Asia/Calcutta': 330,
    'Asia/Katmandu': 345,
    'Asia/Almaty': 360,
    'Asia/Dacca': 360,
    'Asia/Rangoon': 390,
    'Asia/Bangkok': 420,
    'Asia/Krasnoyarsk': 420,
    'Asia/Hong_Kong': 480,
    'Asia/Kuala_Lumpur': 480,
    'Asia/Taipei': 480,
    'Australia/Perth': 480,
    'Asia/Irkutsk': 480,
    'Asia/Manila': 480,
    'Asia/Seoul': 540,
    'Asia/Tokyo': 540,
    'Asia/Yakutsk': 540,
    'Australia/Darwin': 570,
    'Australia/Adelaide': 570,
    'Australia/Sydney': 600,
    'Australia/Brisbane': 600,
    'Australia/Hobart': 600,
    'Pacific/Guam': 600,
    'Asia/Vladivostok': 600,
    'Asia/Magadan': 660,
    'Pacific/Kwajalein': 720,
    'Pacific/Auckland': 720,
    'Pacific/Tongatapu': 780
  };

  return offsets[tz];
};

dunning.app.DunningPDFManager.prototype.generateDunningLetterPDF = function (content, folderId, fileName) {
  return this.pdfGenerator.generateDunningLetterPDF(content, folderId, fileName);
};

dunning.app.DunningPDFManager.prototype.generateAttachmentPDFs = function (evaluationResultView, folderId, custName) {
  return this.pdfGenerator.generateAttachmentPDFs(evaluationResultView, folderId, custName);
};

dunning.app.DunningPDFManager.prototype.attachFiles = function (fileIds, evaluationResultView) {
  var entityId = evaluationResultView.entity;
  var forCustomer = evaluationResultView.assignedToCustomer;

  var recordType = 'contact';
  if (forCustomer == 'T') recordType = 'customer';

  for (var fileIndex = 0; fileIndex < fileIds.length; fileIndex++) {
    ns_wrapper.api.record.attachRecord('file', fileIds[fileIndex], recordType, entityId);
  }
};

dunning.app.DunningPDFManager.prototype.loadEvaluationStatus = function () {
  return new suite_l10n.variable.LocalizationVariableList('dunning_eval_result_status');
};

dunning.app.DunningPDFManager.prototype.updateStatus = function (success, id) {
  var dunningEvalResultStatus = this.loadEvaluationStatus();
  var status = dunningEvalResultStatus.getIdByValue(success ? 'printed' : 'failed');

  ns_wrapper.api.field.submitField(dunning.view.DUNNING_EVAL_RESULT_CUSTOM_RECORD, id,
    dunning.view.DUNNING_EVAL_RESULT_STATUS, status);
};

dunning.app.DunningPDFManager.prototype.getUserTimezoneOffset = function () {
  var timezone = nlapiLoadConfiguration('companyinformation').getFieldValue('timezone');

  // the following function hard-codes the time shift between timezones - that is ugly and doesn't reflect the daylight
  // saving time currently there just isn't any better way of doing this since no suitable API is available
  return this.getTimezoneOffset(timezone);
};

dunning.app.DunningPDFManager.prototype.prepareDunningFolder = function (jobId) {
  // does dunning home folder exist? If not, create it
  var homeFolderId = this.folderManager.getDunningLetterHomeFolderId();
  if (!homeFolderId) {
    homeFolderId = this.folderManager.createDunningLetterHomeFolder();
  }

  // we want to set the timestamp according to user setting, not the server time
  var dat = new Date();
  var ms = dat.getTime();

  var tzOffset = this.getUserTimezoneOffset();

  // first apply the difference between the server and GMT, then between user timezone and GMT
  if (tzOffset !== undefined) {
    ms += dat.getTimezoneOffset() * 60 * 1000;
    ms += tzOffset * 60 * 1000;
  }

  // format the date string
  var datArr = new Date(ms).toString().split(' ');
  var jobFolderName = jobId + '_' + datArr[1] + datArr[2] + '_' + datArr[3];

  // does a folder for the current job exist in the home folder? If not, create it
  var jobFolderId = this.folderManager.getPDFLetterSubfolderId(homeFolderId, jobFolderName);
  if (!jobFolderId) {
    jobFolderId = this.folderManager.createPDFLetterSubfolder(homeFolderId, jobFolderName);
  }

  return [jobFolderName, jobFolderId];
};

dunning.app.DunningPDFManager.prototype.generatePDFFiles = function (derId, folderId, folderName) {
  var successful = true;
  var dunningEvaluationResultDAO = new dao.DunningEvaluationResultDAO();
  var derModel = dunningEvaluationResultDAO.retrieve(derId);
  var converter = new dunning.app.DunningEvaluationResultConverter();
  var evaluationResultView = converter.castToView(derModel);
  var message = evaluationResultView.message;
  var resultMsg = '';

  try {
    var custRecord = nlapiLoadRecord('customer', evaluationResultView.customer);
    var custName = custRecord.getFieldValue('entityid').substring(0, 8);
    var letterFileName = evaluationResultView.id + '_DL_' + custName + '.pdf';

    // Creates PDF files
    var pdfIds = this.generateAttachmentPDFs(evaluationResultView, folderId, custName);
    var pdfLetterId = this.generateDunningLetterPDF(message, folderId, letterFileName);

    pdfIds.push(pdfLetterId);

    // Attach files to customer record
    this.attachFiles(pdfIds, evaluationResultView);
  } catch (e) {
    successful = false;
    resultMsg = 'A problem occurred during dunning letter PDF file creation probably due to malformed XML template.';
    nlapiLogExecution('ERROR', 'DUNNING_LETTER_PDF_FILE_CREATION_ERROR', resultMsg + ' Details: ' + JSON.stringify(e));
  }

  // Update DER status
  this.updateStatus(successful, derId);

  return this.createResult(folderName, successful, resultMsg, pdfIds);
};

dunning.app.DunningPDFManager.prototype.createResult = function (folderName, successful, resultMessage, pdfIds) {
  var result = new suite_l10n.process.ProcessResult();

  var path = [this.folderManager.getHomeFolderName(), folderName].join('/');
  // if(!successful) path = null;
  result.success = successful;
  result.setData('path', path);
  result.setData('notes', resultMessage);
  result.setData('pdfIds', pdfIds);

  return result;
};

dunning.app.DunningPDFManager.prototype.getNotificationMessage = function (pdfResultPaths, translator) {
  var msg = '<p>' + translator.getString('dq.pdfemail.tableHead') + '</p>' +
    '<b>' + translator.getString('dq.pdfemail.tableLabel1') + '</b></br>' +
    '<table border=\'1\' cellpadding=\'5\' cellspacing=\'0\'>' +
    '<tr style=\'background-color: #99CCFF;\'>' +
    '<td>' + translator.getString('dq.pdfemail.tableLabel2') + '</td>' +
    '<td>' + translator.getString('dq.pdfemail.tableLabel3') + '</td>' +
    '<td>' + translator.getString('dq.pdfemail.tableLabel4') + '</td>' +
    '</tr>';

  for (var i = 0; i < pdfResultPaths.length; i++) {
    if (pdfResultPaths[i]) {
      var resultPath = pdfResultPaths[i];
      var status = 'Failed';
      if (resultPath.success) status = 'Successful';

      msg += '<tr>' +
        '<td>' + resultPath.getData('path') + '</td>' +
        '<td>' + status + '</td>' +
        '<td>' + resultPath.getData('notes') + '</td>' +
        '</tr>';
    }
  }
  msg += '</table>';

  return msg;
};

dunning.app.DunningPDFManager.prototype.notifyUser = function (pdfResultPaths, user, pdfIds, folderId) {
  var translator = new ns_wrapper.Translator(this.ctx.getUserLanguage());
  var EMAIL_NOTIFICATION_SUBJECT = translator.getString('dq.pdfemail.subject');
  var currentUser = this.ctx.getUser();
  var emailDefinition = new suite_l10n.view.EmailDefinition();
  var notificationMessage = this.getNotificationMessage(pdfResultPaths, translator);

  emailDefinition.sender = user;
  emailDefinition.recipients = currentUser;
  emailDefinition.subject = EMAIL_NOTIFICATION_SUBJECT;
  emailDefinition.body = notificationMessage;
  emailDefinition.attachments = [];
  emailDefinition.body += '</br>' + translator.getString('dq.pdfemail.link') +
    ' <a href=\'https://system.netsuite.com/app/common/media/mediaitemfolders.nl?folder=' + folderId + '\'>link</a>';

  var totalAttachedSize = 0;
  const MAX_ATTACH_SIZE = 5368709120; // 5 MB

  for (var i = 0; i < pdfIds.length; i++) {
    var filePtr = nlapiLoadFile(pdfIds[i]);
    totalAttachedSize += filePtr.getSize();

    if (totalAttachedSize > MAX_ATTACH_SIZE) {
      // inform that attachments are too big, empty the attachments
      emailDefinition.body += '<br>' + translator.getString('dq.pdfemail.exceedLimit');
      emailDefinition.attachments = [];
      break;
    } else {
      // attach the file to the email
      emailDefinition.attachments.push(filePtr);
    }
  }

  var mail = new suite_l10n.communication.Mail(emailDefinition);
  mail.send();

  return emailDefinition;
};
