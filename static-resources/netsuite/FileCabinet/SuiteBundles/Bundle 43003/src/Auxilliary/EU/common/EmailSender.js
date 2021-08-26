/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};

VAT.EU.EmailSender = function _EmailSender() {
};

VAT.EU.EmailSender.prototype.sendEmail = function _sendEmail(emailObj) {

    if (!emailObj) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'emailObj is null or undefined');
    }

    if (!emailObj.sender) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'emailObj.sender is null or undefined');
    }

    if (!emailObj.recipient) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'emailObj.recipient is null or undefined');
    }

    if (!emailObj.subject) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'emailObj.subject is null or undefined');
    }

    try {
        nlapiSendEmail(emailObj.sender, emailObj.recipient, emailObj.subject, emailObj.body);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'VAT.EU.EmailSender.sendEmail', ex);
        throw ex;
    }

};
