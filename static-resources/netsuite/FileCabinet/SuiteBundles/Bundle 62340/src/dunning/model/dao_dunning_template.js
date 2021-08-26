/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */
var dao = dao || {};

dao.DunningTemplateDAO = function DunningTemplateDAO () {
  var recordId = 'customrecord_3805_dunning_template';
  var fields = {
    'id': 'internalid',
    'name': 'name',
    'description': 'custrecord_3805_template_desc',
    'attachStatement': 'custrecord_3805_template_statement',
    'attachCopiesOfInvoices': 'custrecord_3805_template_invoice',
    'onlyOpenInvoicesOnTheStatement': 'custrecord_3805_template_open_only_st',
    'onlyOverdueInvoices': 'custrecord_3805_template_overdue_only',
    'statementDate': 'custrecord_3805_statement_date',
    'statementStartDate': 'custrecord_3805_statement_start_date'
  };

  var documentFields = {
    'id': 'internalid',
    'name': 'name',
    'language': 'custrecord_3805_template_language',
    'subject': 'custrecord_3805_template_subject',
    'headerDocument': 'custrecord_3805_header_doc',
    'bodyDocument': 'custrecord_3805_body_doc',
    'footerDocument': 'custrecord_3805_footer_doc',
    'default': 'custrecord_3805_template_default',
    'dunningTemplateEmailParent': 'custrecord_3805_template_parent_email',
    'dunningTemplatePdfParent': 'custrecord_3805_template_parent_pdf'
  };

  var crmFields = {
    'id': 'internalid',
    'name': 'name',
    'language': 'custrecord_3805_dun_crm_email_temp_lang',
    'emailTemplate': 'custrecord_3805_dun_crm_email_temp_rec',
    'default': 'custrecord_3805_dun_crm_email_default',
    'dunningCRMTemplateEmailParent': 'custrecord_3805_dun_crm_email_temp_par'
  };

  var dunningTemplateEmailParentId = 'recmach' + documentFields.dunningTemplateEmailParent;
  var dunningCRMTemplateEmailParentId = 'recmach' + crmFields.dunningCRMTemplateEmailParent;
  var dunningTemplatePdfParentId = 'recmach' + documentFields.dunningTemplatePdfParent;

  this.create = function create (dunningTemplate) {
    var initObj = _createFieldNVPairs(dunningTemplate);
    var rec = new ns_wrapper.Record(recordId);
    var dunningTemplateRec = rec.createRecord(initObj);
    return castAsDunningTemplate(dunningTemplateRec);
  };

  this.retrieve = function retrieve (dunningTemplate) {
    var rec = new ns_wrapper.Record(recordId);
    var dunningTemplateRec = rec.loadRecord(dunningTemplate.id);
    return castAsDunningTemplate(dunningTemplateRec);
  };

  this.retrieveById = function retrieveById (dunningTemplateId) {
    var rec = new ns_wrapper.Record(recordId);
    var dunningTemplateRec = rec.loadRecord(dunningTemplateId);
    return castAsDunningTemplate(dunningTemplateRec);
  };

  this.retrieveDefaultEmailDocument = function retrieveDefaultEmailDocument (dunningTemplateId) {
    var template = this.retrieveById(dunningTemplateId);
    return template.getDefaultDunningTemplateDocumentEmail();
  };

  this.retrieveDefaultPDFDocument = function retrieveDefaultPDFDocument (dunningTemplateId) {
    var template = this.retrieveById(dunningTemplateId);
    return template.getDefaultDunningTemplateDocumentPdf();
  };

  // for language support
  this.retrieveEmailDocument = function retrieveEmailDocument (dunningTemplateId, languageId) {
    var template = this.retrieveById(dunningTemplateId);

    return template.getDunningTemplateDocumentEmail(languageId);
  };

  this.retrieveEmailCRMTemplate = function retrieveEmailCRMTemplate (dunningTemplateId, languageId) {
    var template = this.retrieveById(dunningTemplateId);

    return template.getDunningCRMTemplateEmail(languageId);
  };

  this.retrievePDFDocument = function retrievePDFDocument (dunningTemplateId, languageId) {
    var template = this.retrieveById(dunningTemplateId);

    return template.getDunningTemplateDocumentPdf(languageId);
  };

  this.retrieveAll = function retrieveAll () {
    var search = new ns_wrapper.Search(recordId);
    for (var i in fields) {
      search.addColumn(fields[i]);
    }

    return _retrieveElements(search.getIterator());
  };

  /**
   * @param {dunning.model.DunningTemplate} model
   * @returns {nlobjRecord}
   */
  this.update = function update (model) {
    var values = {};

    Object.keys(fields)
      .filter(function (field) {
        return field !== 'id';
      })
      .forEach(function (field) {
        values[fields[field]] = model[field];
      });

    var record = new ns_wrapper.Record(recordId, model.id);
    record.setRecordFieldMap(values);
    return record.saveRecord();
  };

  this.remove = function remove (dunningTemplate) {
    var record = new ns_wrapper.Record(recordId);
    return record.deleteRecord(dunningTemplate.id);
  };

  function _createFieldNVPairs (obj) {
    var initObj = [];
    for (var i in obj) {
      initObj.push({'id': [fields[i]], 'value': obj[i]});
    }

    return initObj;
  }

  function castAsDunningTemplate (obj, isSearchResult) {
    if (!obj) {
      return null;
    }

    var template = new dunning.model.DunningTemplate();

    for (var ifield in fields) {
      var fieldId = fields[ifield];
      template[ifield] = isSearchResult ? obj.getValue(fieldId) : obj.getFieldValue(fieldId);
    }

    if (!isSearchResult) {
      template.id = obj.getId();
    }

    // For getting the sublists. Move this to another method (not yet used on search results. I'm not sure yet how) -Teng
    if (!isSearchResult) {
      var lineItems = obj.getAllLineItems();
      var i, field, length;

      if (lineItems || lineItems.length > 0) {
        /* XML Email Templates */
        length = obj.getLineItemCount(dunningTemplateEmailParentId);
        for (i = 1; i <= length; i++) {
          var docTemplate = new dunning.model.DunningTemplateDocument();

          for (field in documentFields) {
            docTemplate[field] = obj.getLineItemValue(dunningTemplateEmailParentId, documentFields[field], i);
          }

          template.addTemplateDocumentEmail(docTemplate);
        }

        /* CRM Email Templates */
        length = obj.getLineItemCount(dunningCRMTemplateEmailParentId);
        for (i = 1; i <= length; i++) {
          var crmTemplate = new dunning.model.DunningCRMTemplate();

          for (field in crmFields) {
            crmTemplate[field] = obj.getLineItemValue(dunningCRMTemplateEmailParentId, crmFields[field], i);
          }

          template.addCRMTemplateEmail(crmTemplate);
        }

        /* XML PDF Templates */
        length = obj.getLineItemCount(dunningTemplatePdfParentId);
        for (i = 1; i <= length; i++) {
          var pdfTemplate = new dunning.model.DunningTemplateDocument();

          for (field in documentFields) {
            pdfTemplate[field] = obj.getLineItemValue(dunningTemplatePdfParentId, documentFields[field], i);
          }

          template.addTemplateDocumentPdf(pdfTemplate);
        }
      }
    }

    return template;
  }

  function _retrieveElements (iterator) {
    var elements = [];
    while (iterator.hasNext()) {
      elements.push(castAsDunningTemplate(iterator.next(), true));
    }

    return elements;
  }
};
