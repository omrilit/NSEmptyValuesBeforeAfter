/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};

VAT.Message = function(e) {
    return {
        code: '',
        details: '',
        stackTrace: '',
        params: null,
        rawMessage: '',
        isResolved: true
    };
};

VAT.MessageManager = function MessageManager(language) {
    this.language = language;
    this.messages = loadMessages(language);
    
    function loadMessages(language) {
        var messages = {};
        var columns = [new nlobjSearchColumn('name'), new nlobjSearchColumn('custrecord_message_templates')];
        var rs = nlapiSearchRecord('customrecord_itr_message', null, null, columns);
        var code = '';
        var message = '';
        
        for (var i = 0; rs && i < rs.length; i++) {
            code = rs[i].getValue('name');
            message = JSON.parse(rs[i].getValue('custrecord_message_templates'));
            messages[code] = message[language];
        }
        
        return messages;
    }
};

VAT.MessageManager.create = function create(code, params) {
    var message = new VAT.Message();
    message.code = code;
    message.params = params;
    return message;
};

/**
 * Resolves any message thrown by the system.
 * 
 * @param {VAT.Message|nlobjError|Error|Object} message.
 * @returns {VAT.Message}
 */
VAT.MessageManager.resolve = function resolve(message) {
    var _message = null;
    
    if (message.isResolved) {
        _message = error;
    } else {
        _message = new VAT.Message();
        _message.code = message.getCode ? message.getCode() : message.name;
        _message.details = message.getDetails ? message.getDetails() : message.message;
        _message.stackTrace = message.getStackTrace ? message.getStackTrace().join('\n') : '';
        _message.rawMessage = message;
    }
    
    return _message;
};

/**
 * @param {String} level - Log level ('DEBUG', 'AUDIT', 'ERROR', or 'SYSTEM').
 * @param {String} context - The context where the message originated, e.g. class and function name.
 * @param {VAT.Error|nlobjError|Error|Object} message
 */
VAT.MessageManager.log = function log(message, level, context) {
    var _message = message.isResolved ? message : VAT.MessageManager.resolve(message);
    var title = context;
    var details = [
        'CODE: ' + _message.code,
        'DETAILS: ' + (_message.details || 'none') ,
        'PARAMETERS: ' + (_message.params ? JSON.stringify(_message.params) : 'none'),
        'STACK TRACE: ' + (_message.stackTrace || 'none')
    ].join(', ');
    
    nlapiLogExecution(level, title, details);
};

/**
 * @param {String} level - Either 'DEBUG', 'AUDIT', 'ERROR', or 'SYSTEM'.
 * @param {String} context - The context where the message originated, e.g. class and function name.
 * @param {VAT.Error|nlobjError|Error|Object} message
 */
VAT.MessageManager.propagate = function propagate(message, level, context) {
    var _message = message.isResolved ? message : VAT.MessageManager.resolve(message);
    VAT.MessageManager.log(level, context, _message);
    throw _message;
};

VAT.MessageManager.render = function render(message, messages) {
    var _message = message.isResolved ? message : VAT.MessageManager.resolve(message);
    message = messages[_message.code] || messages.DEFAULT;
    
    for (var p in _message.params) {
        var pattern = new RegExp('{' + p + '}', 'g');
        message = message.replace(pattern, _message.params[p]);
    }
    
    return {
        code: _message.code,
        message: message
    };
};

$M = VAT.MessageManager;
