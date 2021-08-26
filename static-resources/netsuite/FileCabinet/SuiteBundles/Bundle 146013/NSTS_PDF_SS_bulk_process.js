/**
* Copyright (c) 1998-2016 NetSuite, Inc.
* 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
* All Rights Reserved.
*
* This software is the confidential and proprietary information of
* NetSuite, Inc. ("Confidential Information"). You shall not
* disclose such Confidential Information and shall use it only in
* accordance with the terms of the license agreement you entered into
* with NetSuite.
* 
* use for implementing CK Editor on the text area custrecord_nsts_tex_body and custrecord_nsts_tex_header
* 
* Version   Date            Author      Remarks
* 1.00                      APAC Team   initial version
* 2.00      1 Feb 2016      dgeronimo
*/



var RESPONSE = '';
var BULK_EMAIL = false;
var error = false;
var errorMsg = '';
var fileErrorDetails = '';
var stDate = new Date();
/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
var slLogTitle = "NSTS_PDF_SS_BULK_PROCESS";

function bulkProcScheduled(type) {
    slLogTitle = 'BULKPROCSCHEDULED';    
    var transIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_nsts_tex_trans_ids');
    var recType = nlapiGetContext().getSetting('SCRIPT', 'custscript_nsts_tex_rec_type');
    
    var stUrl = nlapiResolveURL('SUITELET', 'customscript_template_generate_pdf', 'customdeploy_template_generate_pdf');
    Function.audit(slLogTitle,'START: ' + transIds + ' rec: '+recType + " stUrl:" + stUrl);
    
    var params = [];
    
    params['param_transaction_id'] = transIds;
    params['param_transaction_record_type'] = recType;
    Template_GeneratePDF(transIds, recType);
    Function.audit(slLogTitle, 'END');
}

/**
 * Template_GeneratePDF(request, response) as entry to the all scripts
 * 
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function Template_GeneratePDF(scriptParamTransactionId, paramRecordType)
{   
    slLogTitle = 'TEMPLATE_GENERATEPDF';    
    try{
        var scriptParamHTMLTemplateId = '';
        scriptParamHTMLTemplateId =  Function.getDefaultHTMLTemplate(paramRecordType, null);
        Function.audit(slLogTitle, scriptParamTransactionId + ':' + scriptParamHTMLTemplateId);
        
        createDefaultPageNEW(scriptParamTransactionId, scriptParamHTMLTemplateId,  paramRecordType);
    }catch(error){
        error = true;
        errorMsg = error.toString();
        sendEmail(null, null,null,scriptParamTransactionId,null);
        Function.errorLog(slLogTitle,  "ERROR:" + errorMsg);
    }
}


/**
 * Default action page,generate PDF(s)
 */
function createDefaultPageNEW( transactionId, htmlTemplateId, paramRecordType)
{
    
    stLogTitle = 'CREATEDEFAULTPAGENEW';
    Function.audit(stLogTitle, "START");
    var arRequestData = [];
    var attachment = new Library.XMLToPDF();
    var bShowXml = true;
    var emailSubject = null;
    var emailTemplate = null;
    
    transactionId = isEmpty(transactionId)? '' : transactionId;
    
    try
    {
        // we need to know the return type and send it to the generatePDF method because we do not always need the xml headers that are used for pdf
        // we need to get that from the same place we got the htmlTemplateId
        var objTemplate = attachment.getTemplatingDetails(htmlTemplateId, paramRecordType, null);
        emailSubject = objTemplate.emailSubject;
        emailTemplate = objTemplate.emailTemplate;
        var recordType = objTemplate.recordtype;
        var targetDir = objTemplate.defaultdirectory;
        var strDefaultFileName = objTemplate.defaultfilename;
        strDefaultFileName = ((!isNullOrEmpty(strDefaultFileName)) ? recordType + '_' + strDefaultFileName : recordType);

        var arRequestParameters = [];
    
        arRequestData['param_transaction_id'] = transactionId;
        arRequestData['param_transaction_record_type'] = paramRecordType;
        
        var strTemplate = attachment.getOutput(objTemplate, transactionId, arRequestData, null);
        var objAtt = attachment.getObject(strTemplate, null, objTemplate.outputtype, null);
        
        var objContent = objAtt;
        objContent.setName(strDefaultFileName + Date() + ".pdf");
        
        if(objTemplate.returntype == RETURN_FILE){
            if (!isFolderExist(targetDir)){
                targetDir = getBulkEmailFolder();
            }
            
            var recFile = objContent;
            recFile.setFolder(targetDir);
 
            
            var intFileID = nlapiSubmitFile(recFile);
            
            if (intFileID){
                var f = nlapiLoadFile(intFileID);
                Function.audit(stLogTitle, "sendEmail file intFileID: " + intFileID + " filename: " + f.getName());
            }                           
            var tranIds = transactionId.split(',');
            var counter = 0;
            var length = tranIds.length;
            
            isUsageLimitExceeded();
            for(var i=0;i<length;i++){
                if(!Function.isUndefinedNullOrEmpty(tranIds[i])){
                    isUsageLimitExceeded();
                    nlapiAttachRecord('file', intFileID, paramRecordType, tranIds[i], null);                                    
                }
            }
        }
        
        

        sendEmail(emailSubject, emailTemplate,intFileID,transactionId,objContent);
    }catch (ex){
        error = true;
        errorMsg = ex.toString();
        Function.errorLog(stLogTitle, "ERROR: " + errorMsg);
        sendEmail(emailSubject, "ERROR in generating PDF: " + ex,0,0,null);
    }

}

//send email to user
function sendEmail(emailSubject, emailTemplate,fileId,transIds,objContent){
    
    isUsageLimitExceeded();
    var footer = null;
    var user = nlapiGetContext().getUser();
    var url  = null;
    if(isEmpty(emailSubject)){
        emailSubject = 'PDF Generator Bulk Print Result: '+(stDate).toString();
    }

    if(isEmpty(emailTemplate)){
        emailTemplate = 'Thank you for using the <b>PDF BULK PRINTING</b>!';
    }

    try{
        Function.audit('SENDEMAIL', "templateSubject:" + emailSubject + " emailTemplate:" + emailTemplate);
        var templateSubject = _.template(_.unescape(emailSubject));
        emailSubject = templateSubject({date: new Date()});

        var templateBody = _.template(_.unescape(emailTemplate));
        emailTemplate = templateBody({date: new Date()});
                
    }catch(e){
        Function.audit('SENDEMAIL ERROR', e);
    }
    
    nlapiSendEmail(user, user, emailSubject, emailTemplate,null,null,null,objContent);

}

/*Get Bulk Email Folder */
function getBulkEmailFolder(){
    stLogTitle = 'GETBULKEMAILFOLDER';
    try{
        var stBulkEmailDir = null;
        var col = [new nlobjSearchColumn('internalid')];
        var arrFilters = new Array();
        arrFilters.push(new nlobjSearchFilter('name', null, 'is', 'NSTSTransaction Export - BULK PRINT FILES'));
        var rec= nlapiSearchRecord('folder', null, arrFilters, col);
        if(rec){
            if(rec.length > 0){
                if (rec[0].getValue('internalid')){
                    stBulkEmailDir = rec[0].getValue('internalid');
                }
            }
        }
        //create bulk email dir if not existing
        if(!stBulkEmailDir){
            var folder = nlapiCreateRecord('folder');
            folder.setFieldValue('name','NSTSTransaction Export - BULK PRINT FILES');
            var parentFolderId = nlapiSubmitRecord(folder,true);
            if(parentFolderId)
                stBulkEmailDir = parentFolderId;
        }
        return stBulkEmailDir;
    }catch(error){
        Function.errorLog(stLogTitle, 'ERROR: ' + error.toString());
        return null;
    }
}

function formatDate(d){
      if(typeof d === 'number') d = new Date(d);
      if(!(d instanceof Date)) return d;
      function pad(n){return n<10 ? '0'+n.toString() : n.toString()}
      
      var str =  (pad(d.getMonth()+1)).toString() + pad(d.getDate()).toString() +  (d.getFullYear()).toString() + '_'+pad(d.getHours()).toString() + pad(d.getMinutes()).toString() + pad(d.getSeconds()).toString();
      return str;
}