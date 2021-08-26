/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.ESL = VAT.EU.ESL || {};
VAT.EU.ESL.View = VAT.EU.ESL.View || {};

VAT.EU.ESL.View.ExportView = function _ExportView() {
};

VAT.EU.ESL.View.ExportView.prototype.render = function _render(template, data) {
    try{
        var content = VAT.RenderHandlebarsTemplate(template, data);
        
        if (data.fileFormat.toLowerCase() == 'pdf') {
            content = nlapiXMLToPDF(content).getValue();
        }
        
        return content;
    } catch (ex) {
        logException(ex, 'ExportView.render');
        throw ex;
    }
};
