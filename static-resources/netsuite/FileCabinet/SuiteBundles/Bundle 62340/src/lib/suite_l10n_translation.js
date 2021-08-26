/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var suite_l10n = suite_l10n || {};
suite_l10n.message = suite_l10n.message || {};

suite_l10n.message.Translation = function Translation (locale) {
  var translation = {
    'dsa.response.none_found': 'No dunning procedures available.',
    'form.dunning_template.title': 'Dunning Template',
    'field.template.name': 'Name',
    'field.template.description': 'Description',
    'field.template.attachStatement': 'Attach Statement',
    'field.template.overdue_invoices_stmt': 'Only Overdue Invoices on the Statement',
    'field.template.inactive': 'Inactive',
    'field.template.attach_invoice_copy': 'Attach Copies of Invoices',
    'field.template.only_overdue_invoices': 'Only Overdue Invoices',
    'field.template.subject': 'Subject',
    'selection.template.savedsearch': 'Saved Search',
    'selection.template.searchcolumn': 'Search Column',
    'label.template.lettertext': 'Letter Text',
    'dba.form.title': 'Dunning Bulk Assignment',
    'dba.form.source': 'Applies To',
    'dba.form.procedure': 'Dunning Procedure',
    'dba.form.source.help': 'Applies To',
    'dba.form.procedure.help': 'Dunning Procedure',
    'dba.form.dunning_manager': 'Dunning Manager',
    'dba.form.dunning_manager.help': 'Dunning Manager',
    'dba.tab.invoice': 'Invoices',
    'dba.sublist.invoice': 'Invoices',
    'dba.tab.customer': 'Customers',
    'dba.sublist.customer': 'Customers',
    'dba.sublist.common.id': 'ID',
    'dba.sublist.common.customer': 'Customer',
    'dba.sublist.invoice.invoice': 'Invoice',
    'dba.sublist.invoice.amount': 'Amount',
    'dba.sublist.invoice.currency': 'Currency',
    'dba.sublist.invoice.duedate': 'Due Date',
    'dba.sublist.invoice.days_overdue': 'Days Overdue',
    'dba.sublist.customer.subsidiary': 'Subsidiary',
    'dba.sublist.common.assign_dunning': 'Assign',
    'dba.sublist.common.dunning_procedure': 'Dunning Procedure',
    'dba.sublist.common.dunning_level': 'Dunning Level',
    'dba.sublist.common.last_letter_sent': 'Last Letter Send Date',
    'dba.sublist.common.dunning_sending_type': 'Sending Type',
    'dba.sublist.common.page_next': '>',
    'dba.sublist.common.page_previous': '<',
    'dba.sublist.common.page_option': '{startIndex} - {endIndex} of {totalEntryCount}',
    'dba.sublist.common.page_field': '',
    'dba.form.restriction': 'Selection Criteria',
    'dba.form.selection': 'Dunning Procedure Selection',
    'dba.form.restriction.subsidiary': 'Subsidiaries',
    'dba.form.restriction.location': 'Locations',
    'dba.form.restriction.dept': 'Departments',
    'dba.form.restriction.class': 'Classes',
    'dba.form.restriction.search': 'Saved Search',
    'dba.form.action.assign': 'Assign',
    'dba.form.action.assign_customer': 'Assign to Customers',
    'dba.form.action.assign_invoice': 'Assign to Invoices',
    'dba.form.action.cancel': 'Cancel',
    'dba.form.notification.highnumberofrecord': 'This request might take a few seconds to complete. Please wait until you are redirected to the Dunning Procedure page.',
    'dqf.form.action.send': 'Send',
    'dqf.form.action.print': 'Print',
    'dqf.form.action.remove': 'Remove',
    'dqf.form.send.title': 'Dunning Email Sending Queue',
    'dqf.form.print.title': 'Dunning PDF Printing Queue',
    'dqf.filter.fieldGroup': 'Filters',
    'dqf.filter.inlineHelp': 'Use the filters to make the search more specific or to narrow down the results to be displayed.',
    'dqf.filter.applyFiltersButton': 'Search',
    'dqf.filter.customer': 'Customer',
    'dqf.filter.customer.help': '',
    'dqf.filter.recipient': 'Recipient',
    'dqf.filter.recipient.help': '',
    'dqf.filter.procedure': 'Dunning Procedure',
    'dqf.filter.procedure.help': '',
    'dqf.filter.dpLevel': 'Dunning Level',
    'dqf.filter.dpLevel.help': '',
    'dqf.filter.appliesTo': 'Applies To',
    'dqf.filter.appliesTo.help': '',
    'dqf.filter.allowPrint': 'Allow Print',
    'dqf.filter.allowPrint.help': '',
    'dqf.filter.allowEmail': 'Allow Email',
    'dqf.filter.allowEmail.help': '',
    'dqf.filter.lastLtrSentStart': 'Last Letter Sent Start Date',
    'dqf.filter.lastLtrSentStart.help': '',
    'dqf.filter.lastLtrSentEnd': 'Last Letter Sent End Date',
    'dqf.filter.lastLtrSentEnd.help': '',
    'dqf.filter.evalDateStart': 'Evaluation Start Date',
    'dqf.filter.evalDateStart.help': '',
    'dqf.filter.evalDateEnd': 'Evaluation End Date',
    'dqf.filter.evalDateEnd.help': '',
    'dqf.filter.boolean.yes': 'Yes',
    'dqf.filter.boolean.no': 'No',
    'dqf.sublist.send.title': 'Dunning Email Sending Queue',
    'dqf.sublist.print.title': 'Dunning PDF Printing Queue',
    'dqf.sublist.common.customer': 'Customer',
    'dqf.sublist.common.mark': 'Mark',
    'dqf.sublist.common.view': 'View',
    'dqf.sublist.common.id': 'ID',
    'dqf.sublist.dp.applies_to': 'Applies To',
    'dqf.sublist.common.dunning_procedure': 'Dunning Procedure',
    'dqf.sublist.common.dunning_level': 'Level',
    'dqf.sublist.record.last_letter_sent': 'Last Letter Sent',
    'dqf.sublist.record.dunning_allow_email': 'Allow Email',
    'dqf.sublist.record.dunning_allow_print': 'Allow Print',
    'dqf.sublist.record.pause_dunning': 'Pause Dunning',
    'dqf.sublist.common.evaluation_date': 'Evaluation Date',
    'dqf.sublist.common.related_entity': 'Recipient',
    'dbu.form.title': 'Bulk Update Customer Records for Dunning',
    'dbu.form.update_button': 'Update',
    'dbu.form.field.subsidiary': 'Subsidiary',
    'dbu.form.flh.subsidiary': 'Select the subsidiary for which you want to do a bulk update of the dunning fields on customer records. Updates will be applied to all customer records that belong to the selected subsidiary.',
    'dbu.form.field.allow_email': 'Allow Letters to be Emailed',
    'dbu.form.flh.allow_email': 'Select a value to be applied to this field on the customer records after performing the bulk update:\nUnchanged – The current value of the field will not be changed. \nChecked – The box will be checked on customer records after the bulk update. \nNot checked – The box will be clear after the bulk update.',
    'dbu.form.field.allow_print': 'Allow Letters to be Printed',
    'dbu.form.flh.allow_print': 'Select a value to be applied to this field on the customer records after performing the bulk update:\nUnchanged – The current value of the field will not be changed. \nChecked – The box will be checked on customer records after the bulk update. \nNot checked – The box will be clear after the bulk update.',
    'dbu.form.field.dont_send_cust_email': 'Do not Send Letters to Customer Email',
    'dbu.form.flh.dont_send_cust_email': 'Select a value to be applied to this field on the customer records after performing the bulk update:\nUnchanged – The current value of the field will not be changed. \nChecked – The box will be checked on customer records after the bulk update. \nNot checked – The box will be clear after the bulk update.',
    'dbu.form.primary_field_group': 'Criteria',
    'dbu.form.bulk_update_field_group': 'Bulk Update Fields',
    'dbu.form.options.unchanged': '- Unchanged -',
    'dbu.form.options.checked': 'Checked',
    'dbu.form.options.not_checked': 'Not checked',
    'dbu.validation.no_selection': 'There are no fields to be updated because - Unchanged - is selected for all the fields. A bulk update can be performed if a change in at least one field is specified (Checked or Not checked).',
    'dbu.validation.no_sending_media': 'Customer records cannot be saved if both the Allow Letters to be Emailed box and the Allow Letters to be Printed box are not checked. Select Checked in one or both of the following fields:\n- Allow Letters to be Emailed\n- Allow Letters to be Printed',
    'dbu.validation.verify_submit_ow': 'All customer records with dunning procedures will be updated for the selected subsidiary {SUBSIDIARY}. You will receive an email message when the process is completed. Are you sure you want to proceed with the bulk update? If you click OK, the bulk update process will start, and it cannot be reversed.',
    'dbu.validation.verify_submit_si': 'All customer records with dunning procedures will be updated. You will receive an email message when the process is completed. Are you sure you want to proceed with the bulk update? If you click OK, the bulk update process will start, and it cannot be reversed.',
    'dbu.form.reminderinlinehelp': 'NetSuite recommends that you use the bulk update feature outside of your normal business hours. This is to ensure that other users in your company are not updating customer records during the bulk update process.',
    'dbu.validation.validate_concurrency_ow': 'A bulk update of customer records for dunning was initiated by {USER} for the subsidiary, {SUBSIDIARY}. The bulk update must be completed before you can perform another bulk update of customers for the same subsidiary.',
    'dbu.validation.validate_concurrency_si': 'The system can run only one bulk update at a time. A bulk update initiated by {USER} is currently running.',
    'dbu.customer.message.complete_subject': 'Bulk Update of Customer Records for Dunning',
    'dbu.customer.message.complete_body_ow': [
      'Greetings from NetSuite.<br />',
      'The bulk update of customer records for dunning is completed for the subsidiary, {SUBSIDIARY}.',
      'Allow Letters to be Emailed = {ALLOW_EMAIL}',
      'Allow Letters to be Printed = {ALLOW_PRINT}',
      'Do not send letters to customer email = {DONT_SEND_TO_CUST}<br />',
      'Number of customer records updated: {PROCESSED_RECORDS} of {RECORD_COUNT}.{ERROR_STEPS}',
      'This is a system generated email.<br />',
      'Thank you,',
      'NetSuite'
    ].join('<br />'),
    'dbu.customer.message.complete_body_si': [
      'Greetings from NetSuite.<br />',
      'The bulk update of customer records for dunning is completed.',
      'Allow Letters to be Emailed = {ALLOW_EMAIL}',
      'Allow Letters to be Printed = {ALLOW_PRINT}',
      'Do not send letters to customer email = {DONT_SEND_TO_CUST}<br />',
      'Number of customer records updated: {PROCESSED_RECORDS} of {RECORD_COUNT}.{ERROR_STEPS}',
      'This is a system generated email.<br />',
      'Thank you,',
      'NetSuite'
    ].join('<br />'),
    'dbu.customer.message.error_file_header': 'Customer ID,Error',
    'dbu.customer.message.error_filename': 'Failed Updates.csv',
    'dbu.customer.message.error_steps': '<br />Please download the attached file to see the list of records that were not updated. You can update these records manually.',
    'dc.validateCustomer.noDPMatched': 'No dunning procedure found that matched the customer record.',
    'dc.validateCustomer.recipientNoEmail': 'The following dunning letter recipients do not have an email address on their contact records: {CONTACTNAMES}.',
    'dc.validateCustomer.customerNoEmail': 'The record cannot be saved. The Allow Letters To Be Emailed box is checked, but there is no email address or dunning recipient to send letters to. To save this record the following conditions must be true:\n- The Dunning Recipients subtab has at least one contact with an email address.\n- The Email field on the customer record has an email address.\n\nNote: The customer\'s email address is required only if the Do Not Send Letters to Customer Email box is not checked.',
    'dc.validateCustomer.noEmailAtAll': 'There is no email address on the customer record, and there is no dunning letter recipient specified for this customer. Enter an email address on the customer record, or select on the Dunning subtab at least one dunning letter recipient that has an email address.',
    'dc.validateCustomer.recipientListEmpty': 'The record cannot be saved. The Allow Letters To Be Emailed box is checked, but there is no dunning recipient to send letters to. To save this record, the Dunning Recipients subtab must have at least one contact with an email address. \n\nNote: The customer\'s email address is required only if the Do Not Send Letters to Customer Email box is not checked.',
    'dc.validateCustomer.dpMatched': 'The customer record matches the \'{DP}\' dunning procedure. Do you want to change the dunning procedure?',
    'dc.validateCustomer.dpAllReadyAssigned': 'The dunning procedure found is the same with the already assigned dunning procedure in the record.',
    'dc.validateDP.managerRequired': 'A dunning manager is required.',
    'dc.validateDP.sendingModeRequired': 'At least one of the following boxes must be checked:\n- Allow Letters to be Emailed\n- Allow Letters to be Printed',
    'dl.validateDL.dlCountExceeded': 'You have exceeded the maximum amount of dunning levels possible.',
    'dl.validateDL.lowerDaysOverDue': 'The number of days overdue must be lower than {DAYS}.',
    'dl.validateDL.higherDaysOverdue': 'The number of days overdue must be higher than {DAYS}.',
    'dl.validateDL.daysOverdueExist': 'The number of days overdue {DAYS} is already in another line.',
    'dl.validateDL.lastRecordDeletion': 'You may only delete the last record in the list.',
    'dl.validateDL.daysBetSending': 'Days between sending letters must be greater than or equal to {DAYS}',
    'dl.validateDL.minOutsBalGEZero': 'Minimal Outstanding Amount must be at least zero (0).',
    'dl.validateDL.daysOverdueLessPrevious': 'Days overdue in Dunning Level {LEVEL} ({LEVEL_OVERDUE} days) must be less than that of the Dunning Level {PREVLEVEL} ({PREVLEVEL_OVERDUE} days).',
    'dl.validateDL.dlRequired': 'At least one dunning level is required.',
    'dp.validateDP.editNotAllowed': 'You are not allowed to edit dunning procedure type.',
    'dp.information.possibleMultipleSending': 'Disabling the Minimum Dunning Interval field will allow your account to send multiple dunning letters to a single customer in a day. Are you sure you want to disable it?',
    'dba.pagination.failedPrevPage': 'Failed to go to previous page.',
    'dq.validation.str_send': 'send',
    'dq.validation.str_remove': 'remove',
    'dq.validation.str_print': 'print',
    'dq.validation.chooseAction': 'Please choose a letter to ',
    'dq.validation.removalConfirmation': 'Are you sure you want to remove the selected records from the queue?',
    'dq.pt.dunningQueueTitle': 'Dunning Queue',
    'dq.pt.source': 'Source Type',
    'dq.pt.dunningProcedure': 'Dunning Procedure',
    'dq.pt.dunningLevel': 'Dunning Level',
    'dq.pt.lastLetterSent': 'Last letter sent',
    'dq.pt.emailingAllowed': 'Emailing allowed',
    'dq.pt.printingAllowed': 'Printing allowed',
    'dq.pt.send': 'Send',
    'dq.pt.remove': 'Remove',
    'dq.pt.print': 'Print',
    'dq.pt.customer': 'Customer',
    'dt.validator.invalidDefault': 'There must be one default template selected for each of the dunning template types. Review the Email and PDF subtabs and select a default Template.',
    'dt.validator.duplicateLanguage': 'This language is already used for this template type.',
    'dt.validator.noTemplateDocs': 'To save this record, there must be at least one email template document and one PDF template document.',
    'dt.validator.subject': 'Failed Dunning Template Document Validation',
    'dt.validator.body': 'The following template documents are invalid:',
    'dt.validator.defaultDeletion': 'You are trying to delete a template that is currently set as the default. To delete this template, you must first choose a different template as your default template.',
    'dt.validator.xmlEmailDeprecated': 'You cannot add, edit, or remove XML email template lines. The use of XML-based dunning email templates is being phased out. If you add email templates to the Dunning Email Template subtab, saving this record will delete all lines on the Dunning XML Email Template subtab.',
    'dt.validator.deleteAllXMLLines': 'Saving this record will delete all lines on the Dunning XML Email Template subtab. ',
    'dt.validator.noEMailDocs': 'There must be at least one email template to save this record.',
    'dt.validator.noPDFDocs': 'There must be at least one PDF template to save this record.',
    'dt.validator.multipleDefault': 'Are you sure you want to use this template as the default?',
    'dlr.validateDLR.noAmount': 'The Dunning Level Rule should have at least one Dunning Level Rule Amount.',
    'dlr.validateDLR.noDefaultAmount': 'The Dunning Level Rule should have at least one Dunning Level Rule Amount set as the Default amount.',
    'dlr.validateDLR.duplicateCurrency': 'Currency must be unique.',
    'dlr.validateDLR.invalidAmount': 'Amount must be greater than or equal to 0.',
    'dlr.validateDLR.changeDefaultCurrency': 'Are you sure you want to use this line\'s currency and amount as the default? (This will change the current default amount and currency)',
    'dlr.validateDLR.negativeDaysOverdue': 'The Days Overdue field contains a negative number. This will send a letter to the customer before payment is due.',
    'dlr.validateDLR.daysOverdueChanged': 'Changing the value of Days Overdue in a dunning level rule may change the sequence or order of dunning levels, which in turn may trigger the sending of inappropriate dunning letters.\n\nIt is recommended that you check the order of dunning levels on every dunning procedure ({DP_LIST}) where the dunning level that you want to change is in use.',
    'dlr.validateDLR.cannotAddCurrency': 'The currency cannot be added because the Multiple Currencies feature is not enabled.',
    'der.flh.dunningProcedure': 'This field indicates the dunning procedure assigned to the invoice or customer.',
    'der.flh.dunningLevel': 'This field indicates the current dunning level after evaluation.',
    'der.flh.relatedEntity': 'This field is linked to the entity or the contact record of the dunning recipient.',
    'der.flh.messageContent': 'This field contains the content of the dunning letter.',
    'der.flh.invoiceList': 'This field lists the invoices associated with the dunning letter. ',
    'der.flh.emailRecipient': 'This field shows the email addresses of the dunning letter recipients.',
    'der.flh.subject': 'This field shows the subject line of the dunning letter.',
    'der.flh.dunningManager': 'This field shows the dunning manager assigned to the customer, and is linked to the dunning manager\'s employee record.',
    'der.flh.dunningTemplate': 'This field is linked to the dunning template record.',
    'der.flh.customer': 'This field is linked to the customer record.',
    'der.flh.status': 'This field indicates whether the email was sent successfully or not. The status can be one of the following:\n\n• Sent - The email was sent successfully.\n• Failed - The system failed to send the email because of missing information. An example is when there is no email address for the customer or contact.\n• Queued - The dunning letter is still in the dunning queue , and has not yet been processed.\n• Removed - The dunning manager removed this record from the dunning queue.',
    'dlr.flh.daysOverdue': 'Enter the number of days past the payment due date when a dunning letter must be sent. To send a letter before the due date, enter a negative number.',
    'ds.flh.description': 'Enter a description for this record.',
    'dp.flh.dunningProcedure': 'Enter a name for this dunning procedure.',
    'dp.flh.description': 'Enter a description for this dunning procedure.',
    'dp.flh.appliesTo': 'Select whether this dunning procedure will be assigned to customers or invoices. If you select Customer, you must also either check or clear the Allow Override box. ',
    'dp.flh.sendingSchedule': 'Select whether to send dunning letters automatically or manually.',
    'dp.flh.minimumDunningInterval': 'Select the minimum number of days between sending two consecutive letters for the same customer. This applies to both manual and automatic sending.',
    'dp.flh.subsidiary': 'Select the subsidiaries to which this dunning procedure applies.',
    'dp.flh.savedSearchCustomer': 'Select the customer saved search to which this procedure applies.',
    'dp.flh.allowOverride': 'If you check this box, an invoice-level dunning procedure can override this procedure. An invoice-level dunning procedure will be used if an invoice meets the criteria for that procedure, regardless of whether a customer-level dunning procedure has already been assigned.',
    'dp.flh.department': 'Select the departments to which this procedure applies. ',
    'dp.flh.class': 'Select the classes to which this procedure applies.',
    'dp.flh.location': 'Select the locations to which this procedure applies.',
    'dp.flh.savedSearchInvoice': 'Select the invoice saved search to which this procedure applies.',
    'dp.flh.assignAutomatically': 'Check this box to enable the system to automatically assign this dunning procedure to customers or invoices based on the selection criteria.',
    'dt.flh.name': 'Enter a name for this dunning template.',
    'dt.flh.description': 'Enter a description for this dunning template.',
    'dt.flh.attachStatement': 'Check this box to attach customer statements to dunning letters that use this template. ',
    'dt.flh.attachInvoiceCopy': 'Check this box to attach invoices to dunning letters that use this template.',
    'dt.flh.overdueInvoiceOnly': 'Check this box if you want to attach overdue invoices only.',
    'dt.flh.openTransactionOnly': 'Check this box if you want to include only open transactions on the customer statements.',
    'dt.flh.inactive': 'Check this box to inactivate the template. Templates that are inactive do not show in lists, and cannot be used for sending dunning letters.',
    'dc.flh.lastLetterSent': 'The date when the last dunning letter was sent.',
    'dc.flh.dunningLevel': 'This field shows the current dunning level as of the last dunning evaluation.',
    'dc.flh.dunningManager': 'Select the person responsible for this customerÆs dunning and whose name should appear as the sender of the dunning letter.',
    'dc.flh.dunningProcedure': 'This field shows the dunning procedure assigned to the customer. If you click Assign Automatically, the system assigns the appropriate procedure based on the dunning selection criteria. Select a different value from the dropdown list to change the dunning procedure assigned to the customer. The dropdown list shows only the dunning procedures that are applicable to this customer, based on the selection criteria defined on the dunning procedure records. ',
    'dc.flh.allowPrint': 'Check this box if you want dunning letters to be printed.',
    'dc.flh.pauseReason': 'Select a reason to indicate why the dunning was paused.',
    'dc.flh.pauseReasonDetail': 'Select a detail to indicate why the dunning was paused.',
    'dc.flh.pauseDunning': 'Check this box to temporarily stop the dunning process.',
    'dc.flh.dunningRecepients': 'Select additional dunning recipients',
    'dc.flh.allowEmail': 'Check this box if you want dunning letters to be emailed.',
    'di.flh.lastLetterSent': 'The date when the last dunning letter was sent.',
    'di.flh.dunningLevel': 'This field shows the current dunning level as of the last dunning evaluation.',
    'di.flh.dunningManager': 'Select the person responsible for this invoices dunning and whose name should appear as the sender of the dunning letter.',
    'di.flh.dunningProcedure': 'This field shows the dunning procedure assigned to the invoice. If you click Assign Automatically, the system assigns the appropriate procedure based on the dunning selection criteria. Select a different value from the dropdown list to change the dunning procedure assigned to the invoice. The dropdown list shows only the dunning procedures that are applicable to this invoice, based on the selection criteria defined on the dunning procedure records. ',
    'di.flh.allowPrint': 'Check this box if you want dunning letters to be printed.',
    'di.flh.pauseReason': 'Select a reason to indicate why the dunning was paused.',
    'di.flh.pauseReasonDetail': 'Select a reason detail to indicate why the dunning was paused.',
    'di.flh.pauseDunning': 'Check this box to temporarily stop the dunning process.',
    'dp.validate.unpause': 'Clearing the Pause Dunning box will immediately trigger the dunning evaluation workflow. NetSuite may send a dunning letter to this customer depending on the dunning evaluation result. Are you sure you want to resume dunning?',
    'dc.validateSubsidiary.existingConfigSubsidiary': 'A dunning configuration record for this subsidiary already exists.',
    'l10n.address.invalidPOBox': 'Please enter a valid PO Box number.',
    'l10n.address.invalidZipCode': 'Please enter a valid Zip Code.',
    'l10n.address.invalidRuralRoute': 'Please enter a valid Rural Route value.',
    'l10n.accessForDDandAccountant': 'Only the Administrator, Dunning Director and Accountant roles can create and modify this type of record.',
    'l10n.deleteAccessForDDandAccountant': 'Only the Administrator, Dunning Director and Accountant roles can delete this type of record.',
    'l10n.accessForAdministrator': 'Only the Administrator role can create and modify this type of record.',
    'l10n.deleteAccessForAdministrator': 'Only the Administrator role can delete this type of record.',
    'l10n.noPagePrivilege': 'You do not have privileges to view this page.',
    'dq.pdfemail.folderName': 'Dunning letters in PDF for printing',
    'dq.pdfemail.subject': 'The generated PDF dunning letters are available for printing in the File Cabinet.',
    'dq.pdfemail.link': 'Click the link to view the folder of the PDF letters:',
    'dq.pdfemail.tableHead': 'The following table provides details of the folders where the PDF files are stored.',
    'dq.pdfemail.exceedLimit': 'The generated files couldn\'t be attached due to exceedance of the attachment limit.',
    'dq.pdfemail.tableLabel1': 'Folders',
    'dq.pdfemail.tableLabel2': 'Path',
    'dq.pdfemail.tableLabel3': 'Status',
    'dq.pdfemail.tableLabel4': 'Notes'
  };

  if (locale) {
    switch (locale) {
      case 'cs_CZ':
      case 'cs-CZ':
        translation['dsa.response.none_found'] = 'K dispozici nejsou žádné procedury upomínky.';
        translation['form.dunning_template.title'] = 'Šablona upomínky';
        translation['field.template.name'] = 'Jméno';
        translation['field.template.description'] = 'Popis';
        translation['field.template.attachStatement'] = 'Připojit výpis';
        translation['field.template.overdue_invoices_stmt'] = 'Pouze faktury po splatnosti na výpisu';
        translation['field.template.inactive'] = 'Neaktivní';
        translation['field.template.attach_invoice_copy'] = 'Připojit kopie faktur';
        translation['field.template.only_overdue_invoices'] = 'Pouze faktury po splatnosti';
        translation['field.template.subject'] = 'Předmět';
        translation['selection.template.savedsearch'] = 'Uložené vyhledávání';
        translation['selection.template.searchcolumn'] = 'Sloupec vyhledávání';
        translation['label.template.lettertext'] = 'Text dopisu';
        translation['dba.form.title'] = 'Hromadné přiřazení upomínky';
        translation['dba.form.source'] = 'Platí pro';
        translation['dba.form.procedure'] = 'Procedura upomínek';
        translation['dba.form.source.help'] = 'Platí pro';
        translation['dba.form.procedure.help'] = 'Procedura upomínek';
        translation['dba.form.dunning_manager'] = 'Správce upomínek';
        translation['dba.form.dunning_manager.help'] = 'Správce upomínek';
        translation['dba.tab.invoice'] = 'Faktury';
        translation['dba.sublist.invoice'] = 'Faktury';
        translation['dba.tab.customer'] = 'Zákazníci';
        translation['dba.sublist.customer'] = 'Zákazníci';
        translation['dba.sublist.common.id'] = 'ID';
        translation['dba.sublist.common.customer'] = 'Zákazník';
        translation['dba.sublist.invoice.invoice'] = 'Faktura';
        translation['dba.sublist.invoice.amount'] = 'Částka';
        translation['dba.sublist.invoice.currency'] = 'Měna';
        translation['dba.sublist.invoice.duedate'] = 'Datum splatnosti';
        translation['dba.sublist.invoice.days_overdue'] = 'Dny po splatnosti';
        translation['dba.sublist.customer.subsidiary'] = 'Pobočka';
        translation['dba.sublist.common.assign_dunning'] = 'Přiřadit';
        translation['dba.sublist.common.dunning_procedure'] = 'Procedura upomínky';
        translation['dba.sublist.common.dunning_level'] = 'Úroveň upomínky';
        translation['dba.sublist.common.last_letter_sent'] = 'Datum odeslání posledního dopisu';
        translation['dba.sublist.common.dunning_sending_type'] = 'Typ odeslání';
        translation['dba.sublist.common.page_next'] = '>';
        translation['dba.sublist.common.page_previous'] = '<';
        translation['dba.sublist.common.page_option'] = '{startIndex}– {endIndex} z {totalEntryCount}';
        translation['dba.form.restriction'] = 'Kritéria výběru';
        translation['dba.form.selection'] = 'Výběr procedury upomínky';
        translation['dba.form.restriction.subsidiary'] = 'Pobočky';
        translation['dba.form.restriction.location'] = 'Umístění';
        translation['dba.form.restriction.dept'] = 'Oddělení';
        translation['dba.form.restriction.class'] = 'Třídy';
        translation['dba.form.restriction.search'] = 'Uložené vyhledávání';
        translation['dba.form.action.assign'] = 'Přiřadit';
        translation['dba.form.action.assign_customer'] = 'Přiřadit zákazníkům';
        translation['dba.form.action.assign_invoice'] = 'Přiřadit fakturám';
        translation['dba.form.action.cancel'] = 'Storno';
        translation['dba.form.notification.highnumberofrecord'] = 'Provedení tohoto požadavku může několik sekund trvat. Počkejte na přesměrování na stránku Procedura upomínky.';
        translation['dqf.form.action.send'] = 'Odeslat';
        translation['dqf.form.action.print'] = 'Tisk';
        translation['dqf.form.action.remove'] = 'Odebrat';
        translation['dqf.form.send.title'] = 'Fronta odesílání e-mailů s upomínkami';
        translation['dqf.form.print.title'] = 'Fronta tisku upomínek ve formátu PDF';
        translation['dqf.filter.fieldGroup'] = 'Filtry';
        translation['dqf.filter.inlineHelp'] = 'Pomocí filtrů můžete vyhledávání upřesnit nebo zúžit výsledky, které chcete zobrazit.';
        translation['dqf.filter.applyFiltersButton'] = 'Hledat';
        translation['dqf.filter.customer'] = 'Zákazník';
        translation['dqf.filter.recipient'] = 'Příjemce';
        translation['dqf.filter.procedure'] = 'Procedura upomínky';
        translation['dqf.filter.dpLevel'] = 'Úroveň upomínky';
        translation['dqf.filter.appliesTo'] = 'Platí pro';
        translation['dqf.filter.allowPrint'] = 'Povolit tisk';
        translation['dqf.filter.allowEmail'] = 'Povolit e-mail';
        translation['dqf.filter.lastLtrSentStart'] = 'Počáteční datum odeslání posledního dopisu';
        translation['dqf.filter.lastLtrSentEnd'] = 'Koncové datum odeslání posledního dopisu';
        translation['dqf.filter.evalDateStart'] = 'Datum zahájení posouzení';
        translation['dqf.filter.evalDateEnd'] = 'Datum ukončení posouzení';
        translation['dqf.filter.boolean.yes'] = 'Ano';
        translation['dqf.filter.boolean.no'] = 'Ne';
        translation['dqf.sublist.send.title'] = 'Fronta odesílání e-mailů s upomínkami';
        translation['dqf.sublist.print.title'] = 'Fronta tisku upomínek ve formátu PDF';
        translation['dqf.sublist.common.customer'] = 'Zákazník';
        translation['dqf.sublist.common.mark'] = 'Označit';
        translation['dqf.sublist.common.view'] = 'Zobrazit';
        translation['dqf.sublist.common.id'] = 'ID';
        translation['dqf.sublist.dp.applies_to'] = 'Platí pro';
        translation['dqf.sublist.common.dunning_procedure'] = 'Procedura upomínky';
        translation['dqf.sublist.common.dunning_level'] = 'Úroveň';
        translation['dqf.sublist.record.last_letter_sent'] = 'Poslední odeslaný dopis';
        translation['dqf.sublist.record.dunning_allow_email'] = 'Povolit e-mail';
        translation['dqf.sublist.record.dunning_allow_print'] = 'Povolit tisk';
        translation['dqf.sublist.record.pause_dunning'] = 'Pozastavit upomínku';
        translation['dqf.sublist.common.evaluation_date'] = 'Datum posouzení';
        translation['dqf.sublist.common.related_entity'] = 'Příjemce';
        translation['dbu.form.title'] = 'Hromadná aktualizace záznamů zákazníka pro upomínku';
        translation['dbu.form.update_button'] = 'Aktualizovat';
        translation['dbu.form.field.subsidiary'] = 'Pobočka';
        translation['dbu.form.flh.subsidiary'] = 'Vyberte pobočku, pro kterou chcete provést hromadnou aktualizaci polí upomínky v záznamech zákazníka. Aktualizace budou použity na všechny záznamy zákazníka, které náležejí k vybrané pobočce.';
        translation['dbu.form.field.allow_email'] = 'Povolit odeslání dopisů e-mailem';
        translation['dbu.form.flh.allow_email'] = 'Vyberte hodnotu, která se použije na toto pole v záznamech zákazníka po provedení hromadné aktualizace:\nNezměněno – Aktuální hodnota pole se nezmění. \nZaškrtnuto – Políčko bude zaškrtnuto v záznamech zákazníka po hromadné aktualizaci. \nNezaškrtnuto – Políčko zůstane po hromadné aktualizaci nezaškrtnuto.';
        translation['dbu.form.field.allow_print'] = 'Povolit tisk dopisů';
        translation['dbu.form.flh.allow_print'] = 'Vyberte hodnotu, která se použije na toto pole v záznamech zákazníka po provedení hromadné aktualizace:\nNezměněno – Aktuální hodnota pole se nezmění. \nZaškrtnuto – Políčko bude zaškrtnuto v záznamech zákazníka po hromadné aktualizaci. \nNezaškrtnuto – Políčko zůstane po hromadné aktualizaci nezaškrtnuto.';
        translation['dbu.form.field.dont_send_cust_email'] = 'Neodesílat dopisy na e-mail zákazníka';
        translation['dbu.form.flh.dont_send_cust_email'] = 'Vyberte hodnotu, která se použije na toto pole v záznamech zákazníka po provedení hromadné aktualizace:\nNezměněno – Aktuální hodnota pole se nezmění. \nZaškrtnuto – Políčko bude zaškrtnuto v záznamech zákazníka po hromadné aktualizaci. \nNezaškrtnuto – Políčko zůstane po hromadné aktualizaci nezaškrtnuto.';
        translation['dbu.form.primary_field_group'] = 'Kritéria';
        translation['dbu.form.bulk_update_field_group'] = 'Pole hromadné aktualizace';
        translation['dbu.form.options.unchanged'] = '- Nezměněno-';
        translation['dbu.form.options.checked'] = 'Zaškrtnuto';
        translation['dbu.form.options.not_checked'] = 'Nezaškrtnuto';
        translation['dbu.validation.no_selection'] = 'K aktualizaci nejsou určena žádná pole, protože pro všechna pole je vybrána hodnota Nezměněno. Hromadnou aktualizaci lze provést, pokud je určena změna alespoň jednoho pole (Zaškrtnuto nebo Nezaškrtnuto).';
        translation['dbu.validation.no_sending_media'] = 'Záznamy zákazníka nelze uložit, pokud nejsou zaškrtnuta políčka Povolit odeslání dopisů e-mailem a Povolit tisk dopisů. Vyberte možnost Zaškrtnuto v jednom nebo obou z následujících polí:\n- Povolit odeslání dopisů e-mailem\n- Povolit tisk dopisů';
        translation['dbu.validation.verify_submit_ow'] = 'Všechny záznamy zákazníka s procedurami upomínky budou pro vybranou pobočku aktualizovány {SUBSIDIARY}. Po dokončení procesu obdržíte e-mailovou zprávu. Opravdu chcete pokračovat v hromadné aktualizaci? Pokud kliknete na tlačítko OK, spustíte proces hromadné aktualizace, který nelze vrátit.';
        translation['dbu.validation.verify_submit_si'] = 'Všechny záznamy zákazníka s procedurami upomínky budou aktualizovány. Po dokončení procesu obdržíte e-mailovou zprávu. Opravdu chcete pokračovat v hromadné aktualizaci? Pokud kliknete na tlačítko OK, spustíte proces hromadné aktualizace, který nelze vrátit.';
        translation['dbu.form.reminderinlinehelp'] = 'Společnost NetSuite doporučuje funkci hromadné aktualizace použít mimo běžnou pracovní dobu. Cílem je zajistit, aby ostatní uživatelé ve vaší společnosti během procesu hromadné aktualizace neaktualizovali záznamy zákazníka.';
        translation['dbu.validation.validate_concurrency_ow'] = 'Hromadná aktualizace záznamů zákazníka pro upomínku byla zahájena uživatelem  {USER} pro pobočku {SUBSIDIARY}. Hromadnou aktualizaci je nutné dokončit dříve, než bude možné provést jinou hromadnou aktualizaci zákazníků pro stejnou pobočku.';
        translation['dbu.validation.validate_concurrency_si'] = 'Systém může spustit vždy pouze jednu hromadnou aktualizaci. Momentálně běží hromadná aktualizace zahájená uživatelem  {USER}.';
        translation['dbu.customer.message.complete_subject'] = 'Hromadná aktualizace záznamů zákazníka pro upomínku';
        translation['dbu.customer.message.complete_body_ow'] = [
          'Zdraví vás společnost NetSuite.<br />',
          'Hromadná aktualizace záznamů zákazníka pro upomínku pro pobočku  {SUBSIDIARY} je dokončena.',
          'Povolit odeslání dopisů e-mailem = {ALLOW_EMAIL}',
          'Povolit tisk dopisů = {ALLOW_PRINT}',
          'Neodesílat dopisy na e-mail zákazníka = {DONT_SEND_TO_CUST}<br />',
          'Počet aktualizovaných záznamů zákazníka: {PROCESSED_RECORDS} z {RECORD_COUNT}.{ERROR_STEPS}',
          'Toto je systémem generovaný e-mail.<br />',
          'Děkujeme,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.complete_body_si'] = [
          'Zdraví vás společnost NetSuite.<br />',
          'Hromadná aktualizace záznamů zákazníka pro upomínku je dokončena.',
          'Povolit odeslání dopisů e-mailem = {ALLOW_EMAIL}',
          'Povolit tisk dopisů = {ALLOW_PRINT}',
          'Neodesílat dopisy na e-mail zákazníka = {DONT_SEND_TO_CUST}<br />',
          'Počet aktualizovaných záznamů zákazníka: {PROCESSED_RECORDS} z {RECORD_COUNT}.{ERROR_STEPS}',
          'Toto je systémem generovaný e-mail.<br />',
          'Děkujeme,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.error_file_header'] = 'Customer ID,Error';
        translation['dbu.customer.message.error_filename'] = 'Failed Updates.csv';
        translation['dbu.customer.message.error_steps'] = '<br />Stáhněte si přiložený soubor a zobrazte si seznam záznamů, které nebyly aktualizovány. Tyto záznamy můžete aktualizovat ručně.';
        translation['dc.validateCustomer.noDPMatched'] = 'Nebyla nalezena žádná procedura upomínky, která odpovídá záznamu zákazníka.';
        translation['dc.validateCustomer.recipientNoEmail'] = 'Následující příjemci dopisu s upomínkou nemají v záznamech kontaktu e-mailovou adresu: {CONTACTNAMES}.';
        translation['dc.validateCustomer.customerNoEmail'] = 'Záznam nelze uložit. Políčko Povolit odeslání dopisů e-mailem je zaškrtnuto, ale neexistuje e-mailová adresa nebo příjemce upomínky, kterému by byly dopisy odeslány. Chcete-li tento záznam uložit, musí být splněny následující podmínky:\n- Dílčí karta Příjemci upomínky má alespoň jeden kontakt s e-mailovou adresou.\n- Pole E-mail v záznamu zákazníka má e-mailovou adresu.\n\nPoznámka: E-mailová adresa zákazníka je vyžadována, pouze pokud políčko Neodesílat dopisy na e-mail zákazníka není zaškrtnuto.';
        translation['dc.validateCustomer.noEmailAtAll'] = 'V záznamu zákazníka není žádná e-mailová adresa a pro tohoto zákazníka není určen žádný příjemce dopisu s upomínkou. Zadejte do záznamu zákazníka e-mailovou adresu nebo na dílčí kartě Upomínka vyberte alespoň jednoho příjemce dopisu s upomínkou, který má e-mailovou adresu.';
        translation['dc.validateCustomer.recipientListEmpty'] = 'Záznam nelze uložit. Políčko Povolit odeslání dopisů e-mailem je zaškrtnuto, ale neexistuje příjemce upomínky, kterému by byly dopisy odeslány. Chcete-li tento záznam uložit, musí mít dílčí karta Příjemci upomínky alespoň jeden kontakt s e-mailovou adresou. \n\nPoznámka: E-mailová adresa zákazníka je vyžadována, pouze pokud políčko Neodesílat dopisy na e-mail zákazníka není zaškrtnuto.';
        translation['dc.validateCustomer.dpMatched'] = 'Záznam zákazníka odpovídá proceduře upomínky \'{DP}\'. Chcete proceduru upomínky změnit?';
        translation['dc.validateCustomer.dpAllReadyAssigned'] = 'Nalezená procedura upomínky je stejná jako již přiřazená procedura upomínky v záznamu.';
        translation['dc.validateDP.managerRequired'] = 'Je vyžadován správce upomínky.';
        translation['dc.validateDP.sendingModeRequired'] = 'Je nutné zaškrtnout alespoň jedno z následujících polí:\n- Povolit odeslání dopisů e-mailem\n- Povolit tisk dopisů';
        translation['dl.validateDL.dlCountExceeded'] = 'Překročili jste maximální povolený počet úrovní upomínky.';
        translation['dl.validateDL.lowerDaysOverDue'] = 'Počet dní po splatnosti musí být nižší než {DAYS}.';
        translation['dl.validateDL.higherDaysOverdue'] = 'Počet dní po splatnosti musí být vyšší než {DAYS}.';
        translation['dl.validateDL.daysOverdueExist'] = 'Počet dní po splatnosti {DAYS} je již na jiném řádku.';
        translation['dl.validateDL.lastRecordDeletion'] = 'Vymazat můžete pouze poslední záznam v seznamu.';
        translation['dl.validateDL.daysBetSending'] = 'Počet dní mezi odesláním dopisů musí být větší nebo roven {DAYS}';
        translation['dl.validateDL.minOutsBalGEZero'] = 'Minimální nesplacená částka musí být alespoň nula (0).';
        translation['dl.validateDL.daysOverdueLessPrevious'] = 'Počet dní po splatnosti v úrovni upomínky {LEVEL} ({LEVEL_OVERDUE} dní) musí být menší než pro úroveň upomínky {PREVLEVEL} ({PREVLEVEL_OVERDUE} dní).';
        translation['dl.validateDL.dlRequired'] = 'Je požadována alespoň jedna úroveň upomínky.';
        translation['dp.validateDP.editNotAllowed'] = 'K úpravě typu procedury upomínky nemáte oprávnění.';
        translation['dp.information.possibleMultipleSending'] = 'Pokud zakážete pole Minimální interval upomínky, ze svého účtu budete moct odeslat více dopisů s upomínkou jednomu zákazníkovi denně. Opravdu je chcete zakázat?';
        translation['dba.pagination.failedPrevPage'] = 'Přechod na předchozí stránku se nezdařil.';
        translation['dq.validation.str_send'] = 'odeslat';
        translation['dq.validation.str_remove'] = 'odebrat';
        translation['dq.validation.str_print'] = 'tisk';
        translation['dq.validation.chooseAction'] = 'Zvolte dopis pro ';
        translation['dq.validation.removalConfirmation'] = 'Opravdu chcete odebrat vybrané záznamy z fronty?';
        translation['dq.pt.dunningQueueTitle'] = 'Fronta upomínek';
        translation['dq.pt.source'] = 'Typ zdroje';
        translation['dq.pt.dunningProcedure'] = 'Procedura upomínek';
        translation['dq.pt.dunningLevel'] = 'Úroveň upomínky';
        translation['dq.pt.lastLetterSent'] = 'Poslední odeslaný dopis';
        translation['dq.pt.emailingAllowed'] = 'Odesílání e-mailů povoleno';
        translation['dq.pt.printingAllowed'] = 'Tisk povolen';
        translation['dq.pt.send'] = 'Odeslat';
        translation['dq.pt.remove'] = 'Odebrat';
        translation['dq.pt.print'] = 'Tisk';
        translation['dq.pt.customer'] = 'Zákazník';
        translation['dt.validator.invalidDefault'] = 'Pro každý typ šablony upomínky musí být vybrána jedna výchozí šablona. Prostudujte si dílčí karty E-mail a PDF a vyberte výchozí šablonu.';
        translation['dt.validator.duplicateLanguage'] = 'Tento jazyk se pro tento typ šablony již používá.';
        translation['dt.validator.noTemplateDocs'] = 'Chcete-li tento záznam uložit, musí být k dispozici alespoň jeden dokument šablony e-mailu a jeden dokument šablony PDF.';
        translation['dt.validator.subject'] = 'Ověření dokumentu šablony upomínky se nezdařilo';
        translation['dt.validator.body'] = 'Následující dokumenty šablony jsou neplatné:';
        translation['dt.validator.defaultDeletion'] = 'Pokoušíte se vymazat šablonu, která je aktuálně nastavena jako výchozí. Chcete-li tuto šablonu odstranit, je nejprve nutné jako výchozí zvolit jinou šablonu.';
        translation['dt.validator.xmlEmailDeprecated'] = 'Řádky šablony e-mailu ve formátu XML nemůžete přidávat, upravovat ani mazat. Používání šablon e-mailů s upomínkami na základě XML je postupně ukončováno. Pokud na dílčí kartě šablony e-mailu s upomínkou přidáte šablony e-mailu, uložením tohoto záznamu se vymažou všechny řádky na dílčí kartě šablony e-mailu XML upomínky.';
        translation['dt.validator.deleteAllXMLLines'] = 'Pokud tento záznam uložíte, všechny řádky na dílčí kartě šablony e-mailu XML upomínky budou vymazány. ';
        translation['dt.validator.noEMailDocs'] = 'Chcete-li tento záznam uložit, musí být k dispozici alespoň jedna šablona e-mailu.';
        translation['dt.validator.noPDFDocs'] = 'Chcete-li tento záznam uložit, musí být k dispozici alespoň jedna šablona PDF.';
        translation['dt.validator.multipleDefault'] = 'Opravdu chcete tuto šablonu použít jako výchozí?';
        translation['dlr.validateDLR.noAmount'] = 'Pravidlo úrovně upomínky by mělo mít alespoň jednu částku pravidla úrovně upomínky.';
        translation['dlr.validateDLR.noDefaultAmount'] = 'Pravidlo úrovně upomínky by mělo mít alespoň jednu částku pravidla úrovně upomínky nastavenu jako výchozí částku.';
        translation['dlr.validateDLR.duplicateCurrency'] = 'Měna musí být jedinečná.';
        translation['dlr.validateDLR.invalidAmount'] = 'Částka musí být větší nebo rovna 0.';
        translation['dlr.validateDLR.changeDefaultCurrency'] = 'Opravdu chcete měnu a částku tohoto řádku použít jako výchozí? (Změní se aktuální výchozí částka a měna)';
        translation['dlr.validateDLR.negativeDaysOverdue'] = 'Pole Dny po splatnosti obsahuje záporné číslo. Zákazníkovi se odešle dopis před datem splatnosti.';
        translation['dlr.validateDLR.daysOverdueChanged'] = 'Změnou hodnoty v poli Dny po splatnosti v pravidle úrovně upomínky můžete změnit pořadí úrovní upomínky, což může aktivovat odeslání nesprávných dopisů s upomínkami.\n\n U každé procedury upomínky ({DP_LIST}), kde se používá úroveň upomínky, kterou chcete změnit, doporučujeme zkontrolovat pořadí úrovní upomínky. ';
        translation['dlr.validateDLR.cannotAddCurrency'] = 'Měnu nelze přidat, protože funkce Více měn není povolena.';
        translation['der.flh.dunningProcedure'] = 'Toto pole uvádí proceduru upomínky přiřazenou faktuře nebo zákazníkovi.';
        translation['der.flh.dunningLevel'] = 'Toto pole uvádí aktuální úroveň upomínky po posouzení.';
        translation['der.flh.relatedEntity'] = 'Toto pole je spojeno se záznamem entity nebo kontaktu příjemce upomínky.';
        translation['der.flh.messageContent'] = 'Toto pole obsahuje obsah dopisu s upomínkou.';
        translation['der.flh.invoiceList'] = 'Toto pole uvádí faktury spojené s dopisem s upomínkou. ';
        translation['der.flh.emailRecipient'] = 'Toto pole uvádí e-mailové adresy příjemců dopisu s upomínkou.';
        translation['der.flh.subject'] = 'Toto pole uvádí řádek předmětu dopisu s upomínkou.';
        translation['der.flh.dunningManager'] = 'Toto pole uvádí správce upomínky přiřazeného k zákazníkovi a je propojeno se zaměstnaneckým záznamem správce upomínky.';
        translation['der.flh.dunningTemplate'] = 'Toto pole je spojeno se záznamem šablony upomínky.';
        translation['der.flh.customer'] = 'Toto pole je spojeno se záznamem zákazníka.';
        translation['der.flh.status'] = 'Toto pole udává, zda byl e-mail úspěšně odeslán, či nikoliv. Status může mít jednu z následujících hodnot:\n\n• Odesláno - E-mail byl úspěšně odeslán.\n• Neúspěšné - Systému se nepodařilo e-mail odeslat z důvodu chybějících informací. Například chybí e-mailová adresa zákazníka nebo kontaktu.\n• Zařazeno do fronty - Dopis s upomínkou je stále ve frontě upomínek a zatím nebyl zpracován.\n• Odebráno - Správce upomínky tento záznam odebral z fronty upomínek.';
        translation['dlr.flh.daysOverdue'] = 'Zadejte počet dní po datu splatnosti, kdy je nutné dopis s upomínkou odeslat. Chcete-li odeslat dopis před datem splatnosti, zadejte záporné číslo.';
        translation['ds.flh.description'] = 'Zadejte popis pro tento záznam.';
        translation['dp.flh.dunningProcedure'] = 'Zadejte název pro tuto proceduru upomínky.';
        translation['dp.flh.description'] = 'Zadejte popis pro tuto proceduru upomínky.';
        translation['dp.flh.appliesTo'] = 'Vyberte, zda bude tato procedura upomínky přiřazena zákazníkům, nebo fakturám. Pokud vyberete možnost Zákazník, musíte zaškrtnout, nebo zrušit zaškrtnutí políčka Povolit přepis.';
        translation['dp.flh.sendingSchedule'] = 'Vyberte, zda mají být dopisy s upomínkou odeslány automaticky, nebo ručně.';
        translation['dp.flh.minimumDunningInterval'] = 'Vyberte minimální počet dní mezi odesláním dvou po sobě následujících dopisů pro stejného zákazníka. To platí pro ruční i automatické odesílání.';
        translation['dp.flh.subsidiary'] = 'Vyberte pobočky, kterých se procedura upomínky týká.';
        translation['dp.flh.savedSearchCustomer'] = 'Vyberte uložená vyhledávání zákazníka, kterých se tato procedura týká.';
        translation['dp.flh.allowOverride'] = 'Pokud toto políčko zaškrtnete, může tuto proceduru přepsat procedura upomínky na úrovni faktury. Procedura upomínky na úrovni faktury bude použita, pokud faktura splňuje kritéria pro danou proceduru, bez ohledu na to, zda již byla přiřazena procedura upomínky na úrovni zákazníka.';
        translation['dp.flh.department'] = 'Vyberte oddělení, kterých se tato procedura týká.';
        translation['dp.flh.class'] = 'Vyberte třídy, kterých se tato procedura týká.';
        translation['dp.flh.location'] = 'Vyberte umístění, kterých se tato procedura týká.';
        translation['dp.flh.savedSearchInvoice'] = 'Vyberte uložené vyhledávání faktury, kterého se tato procedura týká.';
        translation['dp.flh.assignAutomatically'] = 'Pokud toto políčko zaškrtnete, systém automaticky přiřadí tuto proceduru upomínky zákazníkům nebo fakturám na základě kritérií výběru.';
        translation['dt.flh.name'] = 'Zadejte název pro tuto šablonu upomínky.';
        translation['dt.flh.description'] = 'Zadejte popis pro tuto šablonu upomínky.';
        translation['dt.flh.attachStatement'] = 'Zaškrtnutím tohoto políčka přiložíte k dopisům s upomínkami, které používají tuto šablonu, výpisy zákazníka.';
        translation['dt.flh.attachInvoiceCopy'] = 'Zaškrtnutím tohoto políčka přiložíte k dopisům s upomínkami, které používají tuto šablonu, faktury.';
        translation['dt.flh.overdueInvoiceOnly'] = 'Toto políčko zaškrtněte, pokud chcete přiložit pouze faktury po splatnosti.';
        translation['dt.flh.openTransactionOnly'] = 'Toto políčko zaškrtněte, pokud chcete do výpisů zákazníka zahrnout pouze otevřené transakce.';
        translation['dt.flh.inactive'] = 'Zaškrtnutím tohoto políčka deaktivujete šablonu. Šablony, které jsou neaktivní, se v seznamech nezobrazují a nelze je použít k odesílání dopisů s upomínkami.';
        translation['dc.flh.lastLetterSent'] = 'Datum odeslání posledního dopisu s upomínkou.';
        translation['dc.flh.dunningLevel'] = 'Toto pole uvádí aktuální úroveň upomínky k poslednímu posouzení upomínky.';
        translation['dc.flh.dunningManager'] = 'Vyberte osobu odpovědnou za upomínku tohoto zákazníka, jejíž jméno by mělo být uvedeno jako odesilatel dopisu s upomínkou.';
        translation['dc.flh.dunningProcedure'] = 'Toto pole uvádí proceduru upomínky přiřazenou zákazníkovi. Pokud kliknete na možnost Přiřadit automaticky, systém přiřadí příslušnou proceduru na základě kritérií výběru upomínky. Výběrem odlišné hodnoty z rozevíracího seznamu změníte proceduru upomínky přiřazenou zákazníkovi. Rozevírací seznam udává pouze procedury upomínek, které se vztahují na tohoto zákazníka, na základě kritérií výběru definovaných v záznamech procedury upomínky. ';
        translation['dc.flh.allowPrint'] = 'Toto políčko zaškrtněte, pokud chcete dopisy s upomínkou tisknout.';
        translation['dc.flh.pauseReason'] = 'Vyberte důvod, proč byla upomínka pozastavena';
        translation['dc.flh.pauseReasonDetail'] = 'Vyberte podrobnosti, proč byla upomínka pozastavena.';
        translation['dc.flh.pauseDunning'] = 'Toto políčko zaškrtněte, pokud chcete zastavit proces upomínky.';
        translation['dc.flh.dunningRecepients'] = 'Vyberte další příjemce upomínky';
        translation['dc.flh.allowEmail'] = 'Toto políčko zaškrtněte, pokud chcete dopisy s upomínkou zasílat e-mailem.';
        translation['di.flh.lastLetterSent'] = 'Datum odeslání posledního e-mailu s upomínkou.';
        translation['di.flh.dunningLevel'] = 'Toto pole uvádí aktuální úroveň upomínky k poslednímu posouzení upomínky.';
        translation['di.flh.dunningManager'] = 'Vyberte osobu odpovědnou za upomínku této faktury, jejíž jméno by mělo být uvedeno jako odesilatel dopisu s upomínkou.';
        translation['di.flh.dunningProcedure'] = 'Toto pole uvádí proceduru upomínky přiřazenou faktuře. Pokud kliknete na možnost Přiřadit automaticky, systém přiřadí příslušnou proceduru na základě kritérií výběru upomínky. Výběrem odlišné hodnoty z rozevíracího seznamu změníte proceduru upomínky přiřazenou zákazníkovi. Rozevírací seznam udává pouze procedury upomínek, které se vztahují na tuto fakturu, na základě kritérií výběru definovaných v záznamech procedury upomínky. ';
        translation['di.flh.allowPrint'] = 'Toto políčko zaškrtněte, pokud chcete dopisy s upomínkou tisknout.';
        translation['di.flh.pauseReason'] = 'Vyberte důvod, proč byla upomínka pozastavena';
        translation['di.flh.pauseReasonDetail'] = 'Vyberte podrobný důvod, proč byla upomínka pozastavena.';
        translation['di.flh.pauseDunning'] = 'Toto políčko zaškrtněte, pokud chcete zastavit proces upomínky.';
        translation['dp.validate.unpause'] = 'Zrušením zaškrtnutí políčka Pozastavit upomínku okamžitě spustíte postup posouzení upomínky. Společnost NetSuite může tomuto zákazníkovi odeslat dopis s upomínkou v závislosti na výsledku posouzení upomínky. Opravdu chcete upomínku obnovit?';
        translation['dc.validateSubsidiary.existingConfigSubsidiary'] = 'Záznam konfigurace upomínky již pro tuto pobočku existuje.';
        translation['l10n.address.invalidPOBox'] = 'Zadejte platné číslo PO Boxu.';
        translation['l10n.address.invalidZipCode'] = 'Zadejte platné PSČ.';
        translation['l10n.address.invalidRuralRoute'] = 'Zadejte platnou hodnotu trasy doručování ve venkovských oblastech.';
        translation['l10n.accessForDDandAccountant'] = 'Tento typ záznamu může vytvořit a upravit pouze role Administrátor, Ředitel upomínky nebo Účetní.';
        translation['l10n.deleteAccessForDDandAccountant'] = 'Tento typ záznamu může odstranit pouze role Administrátor, Ředitel upomínky nebo Účetní.';
        translation['l10n.accessForAdministrator'] = 'Tento typ záznamu může vytvořit a upravit pouze role Administrátor.';
        translation['l10n.deleteAccessForAdministrator'] = 'Tento typ záznamu může odstranit pouze role Administrátor.';
        translation['l10n.noPagePrivilege'] = 'Nemáte oprávnění k zobrazení této stránky.';
        translation['dq.pdfemail.folderName'] = 'Dopisy s upomínkou v PDF k tisku';
        translation['dq.pdfemail.subject'] = 'Vygenerované dopisy s upomínkou v PDF jsou k dispozici pro tisk v úložišti souborů.';
        translation['dq.pdfemail.link'] = 'Kliknutím na odkaz zobrazíte složku s dopisy ve formátu PDF:';
        translation['dq.pdfemail.tableHead'] = 'Následující tabulka obsahuje detailní informace o složkách, ve kterých jsou uloženy soubory ve formátu PDF.';
        translation['dq.pdfemail.exceedLimit'] = 'Vygenerované soubory se nepodařilo přiložit, protože byl překročen limit přílohy.';
        translation['dq.pdfemail.tableLabel1'] = 'Složky';
        translation['dq.pdfemail.tableLabel2'] = 'Cesta';
        translation['dq.pdfemail.tableLabel3'] = 'Stav';
        translation['dq.pdfemail.tableLabel4'] = 'Poznámky';

        break;

      case 'da_DK':
      case 'da-DK':
        translation['dsa.response.none_found'] = 'Der er ingen tilgængelige rykkerprocedurer.';
        translation['form.dunning_template.title'] = 'Rykkerskabelon';
        translation['field.template.name'] = 'Navn';
        translation['field.template.description'] = 'Beskrivelse';
        translation['field.template.attachStatement'] = 'Vedhæft opgørelse';
        translation['field.template.overdue_invoices_stmt'] = 'Kun forfaldne fakturaer på opgørelsen';
        translation['field.template.inactive'] = 'Inaktiv';
        translation['field.template.attach_invoice_copy'] = 'Vedhæft kopier af fakturaer';
        translation['field.template.only_overdue_invoices'] = 'Kun forfaldne fakturaer';
        translation['field.template.subject'] = 'Emne';
        translation['selection.template.savedsearch'] = 'Gemt søgning';
        translation['selection.template.searchcolumn'] = 'Søg kolonne';
        translation['label.template.lettertext'] = 'Brevtekst';
        translation['dba.form.title'] = 'Rykkermassetildeling';
        translation['dba.form.source'] = 'Anvendes for';
        translation['dba.form.procedure'] = 'Rykkerprocedure';
        translation['dba.form.source.help'] = 'Anvendes for';
        translation['dba.form.procedure.help'] = 'Rykkerprocedure';
        translation['dba.form.dunning_manager'] = 'Rykkerprogram';
        translation['dba.form.dunning_manager.help'] = 'Rykkerprogram';
        translation['dba.tab.invoice'] = 'Fakturaer';
        translation['dba.sublist.invoice'] = 'Fakturaer';
        translation['dba.tab.customer'] = 'Kunder';
        translation['dba.sublist.customer'] = 'Kunder';
        translation['dba.sublist.common.id'] = 'ID';
        translation['dba.sublist.common.customer'] = 'Kunde';
        translation['dba.sublist.invoice.invoice'] = 'Faktura';
        translation['dba.sublist.invoice.amount'] = 'Beløb';
        translation['dba.sublist.invoice.currency'] = 'Valuta';
        translation['dba.sublist.invoice.duedate'] = 'Forfaldsdato';
        translation['dba.sublist.invoice.days_overdue'] = 'Dage forfalden';
        translation['dba.sublist.customer.subsidiary'] = 'Underordnet';
        translation['dba.sublist.common.assign_dunning'] = 'Tilknyt';
        translation['dba.sublist.common.dunning_procedure'] = 'Rykkerprocedure';
        translation['dba.sublist.common.dunning_level'] = 'Rykkerniveau';
        translation['dba.sublist.common.last_letter_sent'] = 'Sidste brev sendt den';
        translation['dba.sublist.common.dunning_sending_type'] = 'Forsendelsestype';
        translation['dba.sublist.common.page_next'] = '>';
        translation['dba.sublist.common.page_previous'] = '<';
        translation['dba.sublist.common.page_option'] = '{startIndex} - {endIndex} af {totalEntryCount}';
        translation['dba.form.restriction'] = 'Valgkriterier';
        translation['dba.form.selection'] = 'Valg af rykkerprocedure';
        translation['dba.form.restriction.subsidiary'] = 'Datterselskaber';
        translation['dba.form.restriction.location'] = 'Lokationer';
        translation['dba.form.restriction.dept'] = 'Afdelinger';
        translation['dba.form.restriction.class'] = 'Klasser';
        translation['dba.form.restriction.search'] = 'Gemt søgning';
        translation['dba.form.action.assign'] = 'Tilknyt';
        translation['dba.form.action.assign_customer'] = 'Tilknyt til kunder';
        translation['dba.form.action.assign_invoice'] = 'Tilknyt til fakturaer';
        translation['dba.form.action.cancel'] = 'Annullér';
        translation['dba.form.notification.highnumberofrecord'] = 'Det kan tage et par sekunder at færdiggøre denne forespørgsel. Vent, til siden Rykkerprocedure vises.';
        translation['dqf.form.action.send'] = 'Send';
        translation['dqf.form.action.print'] = 'Udskriv';
        translation['dqf.form.action.remove'] = 'Fjern';
        translation['dqf.form.send.title'] = 'Sendekø for e-mail-rykkere';
        translation['dqf.form.print.title'] = 'Udskriftskø for pdf-rykkere';
        translation['dqf.filter.fieldGroup'] = 'Filtre';
        translation['dqf.filter.inlineHelp'] = 'Brug filtrene til at gøre søgningen mere specifik eller til at indsnævre de resultater, der vises.';
        translation['dqf.filter.applyFiltersButton'] = 'Søg';
        translation['dqf.filter.customer'] = 'Kunde';
        translation['dqf.filter.recipient'] = 'Modtager';
        translation['dqf.filter.procedure'] = 'Rykkerprocedure';
        translation['dqf.filter.dpLevel'] = 'Rykkerniveau';
        translation['dqf.filter.appliesTo'] = 'Anvendes for';
        translation['dqf.filter.allowPrint'] = 'Tillad print';
        translation['dqf.filter.allowEmail'] = 'Tillad e-mail';
        translation['dqf.filter.lastLtrSentStart'] = 'Startdato for sidste brev sendt';
        translation['dqf.filter.lastLtrSentEnd'] = 'Slutdato for sidste brev sendt';
        translation['dqf.filter.evalDateStart'] = 'Startdato for evaluering';
        translation['dqf.filter.evalDateEnd'] = 'Slutdato for evaluering';
        translation['dqf.filter.boolean.yes'] = 'Ja';
        translation['dqf.filter.boolean.no'] = 'Nej';
        translation['dqf.sublist.send.title'] = 'Sendekø for e-mail-rykkere';
        translation['dqf.sublist.print.title'] = 'Udskriftskø for pdf-rykkere';
        translation['dqf.sublist.common.customer'] = 'Kunde';
        translation['dqf.sublist.common.mark'] = 'Marker';
        translation['dqf.sublist.common.view'] = 'Vis';
        translation['dqf.sublist.common.id'] = 'ID';
        translation['dqf.sublist.dp.applies_to'] = 'Anvendes for';
        translation['dqf.sublist.common.dunning_procedure'] = 'Rykkerprocedure';
        translation['dqf.sublist.common.dunning_level'] = 'Niveau';
        translation['dqf.sublist.record.last_letter_sent'] = 'Sidste brev sendt';
        translation['dqf.sublist.record.dunning_allow_email'] = 'Tillad e-mail';
        translation['dqf.sublist.record.dunning_allow_print'] = 'Tillad print';
        translation['dqf.sublist.record.pause_dunning'] = 'Stop rykker midlertidigt';
        translation['dqf.sublist.common.evaluation_date'] = 'Evalueringsdato';
        translation['dqf.sublist.common.related_entity'] = 'Modtager';
        translation['dbu.form.title'] = 'Masseopdatering af kundeposter til rykkerprocedure';
        translation['dbu.form.update_button'] = 'Opdater';
        translation['dbu.form.field.subsidiary'] = 'Underordnet';
        translation['dbu.form.flh.subsidiary'] = 'Vælg det datterselskab, for hvilket du vil køre en masseopdatering af kundeposternes rykkerfelter. Alle kundeposter, der tilhører det valgte datterselskab, vil blive opdateret.';
        translation['dbu.form.field.allow_email'] = 'Tillad at breve sendes som e-mail';
        translation['dbu.form.flh.allow_email'] = 'Vælg den værdi, der skal gælde for dette felt i kundeposterne efter masseopdateringen:\nUændret – den aktuelle værdi i feltet forbliver uændret. \nMarkeret – feltet vil være afkrydset for kundeposterne efter masseopdateringen. \nIkke markeret - feltet vil ikke være markeret efter masseopdateringen.';
        translation['dbu.form.field.allow_print'] = 'Tillad at breve printes';
        translation['dbu.form.flh.allow_print'] = 'Vælg den værdi, der skal gælde for dette felt i kundeposterne efter masseopdateringen:\nUændret – den aktuelle værdi i feltet forbliver uændret. \nMarkeret – feltet vil være afkrydset for kundeposterne efter masseopdateringen. \nIkke markeret - feltet vil ikke være markeret efter masseopdateringen.';
        translation['dbu.form.field.dont_send_cust_email'] = 'Send ikke breve til kundes e-mail';
        translation['dbu.form.flh.dont_send_cust_email'] = 'Vælg den værdi, der skal gælde for dette felt i kundeposterne efter masseopdateringen:\nUændret – den aktuelle værdi i feltet forbliver uændret. \nMarkeret – feltet vil være afkrydset for kundeposterne efter masseopdateringen. \nIkke markeret - feltet vil ikke være markeret efter masseopdateringen.';
        translation['dbu.form.primary_field_group'] = 'Kriterium';
        translation['dbu.form.bulk_update_field_group'] = 'Masseopdateringsfelter';
        translation['dbu.form.options.unchanged'] = '- Uændret -';
        translation['dbu.form.options.checked'] = 'Markeret';
        translation['dbu.form.options.not_checked'] = 'Ikke markeret';
        translation['dbu.validation.no_selection'] = 'Ingen felter skal opdateres, da der er valgt Uændret for alle felterne. Der kan køres en masseopdatering, hvis der er angivet en ændring i mindst ét af felterne (Markeret eller Ikke markeret).';
        translation['dbu.validation.no_sending_media'] = 'Kundeposter kan ikke gemmes, hvis felterne Tillad at breve sendes som e-mail og Tillad at breve printes begge er umarkeret. Vælg Markeret i et eller begge af følgende felter:\n- Tillad at breve sendes som e-mail\n Tillad at breve printes';
        translation['dbu.validation.verify_submit_ow'] = 'Alle kundeposter med rykkerprocedurer vil blive opdateret for det valgte datterselskab {SUBSIDIARY}. Du får besked via e-mail, når processen er færdig. Vil du fortsætte masseopdateringen? Hvis du klikker på OK, startes masseopdateringen, og den vil ikke kunne fortrydes.';
        translation['dbu.validation.verify_submit_si'] = 'Alle kundeposter med rykkerprocedurer vil blive opdateret. Du får besked via e-mail, når processen er færdig. Vil du fortsætte masseopdateringen? Hvis du klikker på OK, startes masseopdateringen, og den vil ikke kunne fortrydes.';
        translation['dbu.form.reminderinlinehelp'] = 'Det anbefales, at du kører masseopdateringer uden for den normale arbejdstid. Herved undgår du, at andre brugere i virksomheden opdaterer kundeposter under opdateringsprocessen.';
        translation['dbu.validation.validate_concurrency_ow'] = 'En masseopdatering af kundeposter til rykkerprocedure er blevet startet af {USER} for datterselskabet  {SUBSIDIARY}. Masseopdateringen skal være færdig, før du kan udføre en anden masseopdatering af kunder for det samme datterselskab.';
        translation['dbu.validation.validate_concurrency_si'] = 'Systemet kan kun køre én masseopdatering ad gangen. Der kører i øjeblikket en masseopdatering, der er startet af {USER}.';
        translation['dbu.customer.message.complete_subject'] = 'Masseopdatering af kundeposter til rykkerprocedure';
        translation['dbu.customer.message.complete_body_ow'] = [
          'En hilsen fra NetSuite.<br />',
          'Masseopdateringen af kundeposter til rykkerprocedure er færdig for datterselskabet,  {SUBSIDIARY}.',
          'Tillad at breve sendes som e-mail = {ALLOW_EMAIL}',
          'Tillad at breve printes = {ALLOW_PRINT}',
          'Send ikke breve til kundes e-mail = {DONT_SEND_TO_CUST}<br />',
          'Antal opdaterede kundeposter: {PROCESSED_RECORDS} af {RECORD_COUNT}.{ERROR_STEPS}',
          'Dette er en automatisk genereret e-mail.<br />',
          'Tak',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.complete_body_si'] = [
          'En hilsen fra NetSuite.<br />',
          'Masseopdateringen af kundeposter til rykkerprocedure er færdig.',
          'Tillad at breve sendes som e-mail = {ALLOW_EMAIL}',
          'Tillad at breve printes = {ALLOW_PRINT}',
          'Send ikke breve til kundes e-mail = {DONT_SEND_TO_CUST}<br />',
          'Antal opdaterede kundeposter: {PROCESSED_RECORDS} af {RECORD_COUNT}.{ERROR_STEPS}',
          'Dette er en automatisk genereret e-mail.<br />',
          'Tak',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.error_file_header'] = 'Kunde-ID, fejl';
        translation['dbu.customer.message.error_filename'] = 'Failed Updates.csv';
        translation['dbu.customer.message.error_steps'] = '<br />Hent den vedhæftede fil for at se en liste over poster, der ikke blev opdateret. Du kan opdatere disse poster manuelt.';
        translation['dc.validateCustomer.noDPMatched'] = 'Der er ikke fundet nogen procedure, der matcher kundeposten.';
        translation['dc.validateCustomer.recipientNoEmail'] = 'Der er ikke nogen e-mail-adresse i kontaktoplysningerne for følgende modtagere af rykkerskrivelse: {CONTACTNAMES}.';
        translation['dc.validateCustomer.customerNoEmail'] = 'Posten kan ikke gemmes. Feltet Tillad at breve sendes som e-mail er markeret, men der er ingen e-mail-adresse eller rykkermodtager. Følgende betingelser skal være overholdt, for at du kan gemme denne post:\n- Underfanen Rykkermodtagere skal have mindst én e-mail-adresse.\n- Feltet E-mail for kundeposten skal have en e-mail-adresse.\n\nBemærk: Kundens e-mail-adresse er kun nødvendig, hvis feltet Send ikke breve til kundes e-mail ikke er markeret.';
        translation['dc.validateCustomer.noEmailAtAll'] = 'Der er ingen e-mail-adresse i kundeposten, og der er ikke angivet nogen brevmodtager for denne kunde. Indtast en e-mail-adresse for kundeposten, eller vælg mindst én rykkerskrivelsesmodtager med en e-mail-adresse på underfanen Rykker.';
        translation['dc.validateCustomer.recipientListEmpty'] = 'Posten kan ikke gemmes. Feltet Tillad at breve sendes som e-mail er markeret, men der er ingen rykkermodtager at sende breve til. Hvis denne post skal gemmes, skal der være mindst én kontaktperson med en e-mail-adresse på underfanen Rykkermodtager. \n\nBemærk: Kundens e-mail-adresse er kun nødvendig, hvis feltet Send ikke breve til kundes e-mail ikke er markeret.';
        translation['dc.validateCustomer.dpMatched'] = 'Kundeposten matcher \'{DP}\' rykkerproceduren. Vil du ændre rykkerproceduren?';
        translation['dc.validateCustomer.dpAllReadyAssigned'] = 'Den fundne rykkerprocedure er den samme som den, der allerede findes i posten.';
        translation['dc.validateDP.managerRequired'] = 'Rykkerleder kræves.';
        translation['dc.validateDP.sendingModeRequired'] = 'Mindst et af følgende felter skal markeres:\n- Tillad at breve sendes som e-mail\n- Tillad at breve printes';
        translation['dl.validateDL.dlCountExceeded'] = 'Du har overskredet det maksimale antal rykkerniveauer.';
        translation['dl.validateDL.lowerDaysOverDue'] = 'Antallet af dage forfalden skal være mindre end {DAYS}.';
        translation['dl.validateDL.higherDaysOverdue'] = 'Antallet af dage forfalden skal være højere end {DAYS}.';
        translation['dl.validateDL.daysOverdueExist'] = 'Antallet af dage forfalden {DAYS} findes allerede på en anden linje.';
        translation['dl.validateDL.lastRecordDeletion'] = 'Du kan kun slette den sidste post på listen.';
        translation['dl.validateDL.daysBetSending'] = 'Antal dage mellem afsendelse af breve skal være større end eller lig med {DAYS}';
        translation['dl.validateDL.minOutsBalGEZero'] = 'Mindste udestående beløb skal mindst være nul (0).';
        translation['dl.validateDL.daysOverdueLessPrevious'] = 'Dage forfalden på rykkerniveau {LEVEL} ({LEVEL_OVERDUE} dage) skal være mindre end rykkerniveauet {PREVLEVEL} ({PREVLEVEL_OVERDUE} dage).';
        translation['dl.validateDL.dlRequired'] = 'Der kræves mindst ét rykkerniveau.';
        translation['dp.validateDP.editNotAllowed'] = 'Du kan ikke redigere rykkerproceduretypen.';
        translation['dp.information.possibleMultipleSending'] = 'Hvis feltet Mindste rykkerinterval deaktiveres, vil kontoen kunne sende flere rykkerskrivelser til en enkelt kunde på en dag. Er du sikker på, at du vil deaktivere feltet?';
        translation['dba.pagination.failedPrevPage'] = 'Kunne ikke gå til forrige side.';
        translation['dq.validation.str_send'] = 'send';
        translation['dq.validation.str_remove'] = 'fjern';
        translation['dq.validation.str_print'] = 'print';
        translation['dq.validation.chooseAction'] = 'Vælg et brev til ';
        translation['dq.validation.removalConfirmation'] = 'Er du sikker på, at du vil fjerne de valgte poster fra køen?';
        translation['dq.pt.dunningQueueTitle'] = 'Rykkerkø';
        translation['dq.pt.source'] = 'Kildetype';
        translation['dq.pt.dunningProcedure'] = 'Rykkerprocedure';
        translation['dq.pt.dunningLevel'] = 'Rykkerniveau';
        translation['dq.pt.lastLetterSent'] = 'Sidste brev sendt';
        translation['dq.pt.emailingAllowed'] = 'E-mail tilladt';
        translation['dq.pt.printingAllowed'] = 'Print tilladt';
        translation['dq.pt.send'] = 'Send';
        translation['dq.pt.remove'] = 'Fjern';
        translation['dq.pt.print'] = 'Udskriv';
        translation['dq.pt.customer'] = 'Kunde';
        translation['dt.validator.invalidDefault'] = 'Der skal være valgt én standardskabelon for hver af rykkerskabelontyperne. Tjek underfanerne E-mail og PDF, og vælg en standardskabelon.';
        translation['dt.validator.duplicateLanguage'] = 'Dette sprog bruges allerede for denne skabelontype.';
        translation['dt.validator.noTemplateDocs'] = 'Der skal være mindst ét e-mail-skabelondokument og ét pdf-skabelondokument, før du kan gemme denne post.';
        translation['dt.validator.subject'] = 'Validering af rykkerskabelondokument mislykkedes';
        translation['dt.validator.body'] = 'Følgende skabelondokumenter er ugyldige:';
        translation['dt.validator.defaultDeletion'] = 'Du prøver at slette en skabelon, der i øjeblikket benyttes som standardskabelon. Hvis du vil slette denne skabelon, skal du først vælge en anden skabelon som standardskabelon.';
        translation['dt.validator.xmlEmailDeprecated'] = 'Du kan ikke tilføje, redigere eller fjerne XML e-mail-skabelonlinjer. Brugen af XML-baserede e-mail-skabeloner udfases. Hvis du tilføjer e-mail-skabeloner på underfanen Rykkerskabelon e-mail, slettes alle linjer på underfanen Rykkerskabelon XML e-mail, når du gemmer denne post.';
        translation['dt.validator.deleteAllXMLLines'] = 'Når du gemmer denne post. slettes alle linjer på underfanen Rykkerskabelon XML e-mail. ';
        translation['dt.validator.noEMailDocs'] = 'Der skal være mindst én e-mail-skabelon, før denne post kan gemmes.';
        translation['dt.validator.noPDFDocs'] = 'Der skal være mindst én pdf-skabelon, før denne post kan gemmes.';
        translation['dt.validator.multipleDefault'] = 'Er du sikker på, du vil bruge denne skabelon som standardskabelon?';
        translation['dlr.validateDLR.noAmount'] = 'Rykkerniveaureglen skal have mindst ét rykkerniveauregel beløb.';
        translation['dlr.validateDLR.noDefaultAmount'] = 'Rykkerniveaureglen skal have mindst ét rykkerniveauregel beløb sat som standardbeløb.';
        translation['dlr.validateDLR.duplicateCurrency'] = 'Valuta skal være unik.';
        translation['dlr.validateDLR.invalidAmount'] = 'Beløb skal være større end eller lig med 0.';
        translation['dlr.validateDLR.changeDefaultCurrency'] = 'Er du sikker på, at du vil bruge denne linjes valuta og beløb som standard? (Dette vil ændre det aktuelle standardbeløb og den aktuelle standardvaluta)';
        translation['dlr.validateDLR.negativeDaysOverdue'] = 'Feltet Dage forfalden indeholder et negativt tal. Det vil medføre, at der sendes et brev til kunden, før betalingen er forfalden.';
        translation['dlr.validateDLR.daysOverdueChanged'] = 'En ændring af de forfaldne dage i et rykker-niveau kan ændre sekvensen eller rykker-niveauernes rækkefølge, hvilket på sigt kan udløse afsendelsen af upassende rykkerbreve.\n\n Det anbefales at du tjekker rykker-niveauernes rækkefølge på hver rykkerprocedure ({DP_LIST}), hvor det rykker-niveau, du vil ændre, er i brug.';
        translation['dlr.validateDLR.cannotAddCurrency'] = 'Valutaen kan ikke tilføjes, da funktionen Flere valutaer ikke er aktiveret.';
        translation['der.flh.dunningProcedure'] = 'Dette felt angiver hvilken rykkerprocedure, der er knyttet til fakturaen eller kunden.';
        translation['der.flh.dunningLevel'] = 'Dette felt angiver det aktuelle rykkerniveau efter evaluering.';
        translation['der.flh.relatedEntity'] = 'Dette felt er sammenkædet med rykkermodtagerens entitet eller kontaktpost.';
        translation['der.flh.messageContent'] = 'Dette felt viser rykkerskrivelsens indhold.';
        translation['der.flh.invoiceList'] = 'Dette felt viser, hvilke fakturaer der er knyttet til rykkerskrivelsen. ';
        translation['der.flh.emailRecipient'] = 'Dette felt viser e-mail-adresserne for modtagerne af rykkerskrivelsen.';
        translation['der.flh.subject'] = 'Dette felt viser rykkerskrivelsens emnelinje.';
        translation['der.flh.dunningManager'] = 'Dette felt viser hvilken rykkerleder, der er knyttet til kunden, og er sammenkædet med rykkerlederens medarbejderpost.';
        translation['der.flh.dunningTemplate'] = 'Dette felt er sammenkædet med rykkerskabelonposten.';
        translation['der.flh.customer'] = 'Dette felt er sammenkædet med kundeposten.';
        translation['der.flh.status'] = 'Dette felt angiver, om e-mail\'en blev sendt eller ej. Status kan være én af følgende:\n\n• Sendt - E-mail\'en blev sendt.\n• Fejlede - E-mail\'en blev ikke sendt pga. manglende oplysninger. Det kan f.eks. være manglende e-mail-adresse for kunden eller kontaktpersonen.\n• Sat i kø - Rykkerskrivelsen ligger stadig i rykkerkøen og er endnu ikke behandlet.\n• Fjernet - Lederen af rykkerfunktionen har fjernet denne post fra rykkerkøen.';
        translation['dlr.flh.daysOverdue'] = 'Indtast, hvor mange dage efter betalingsforfaldsdatoen der skal sendes en rykkerskrivelse. Indtast et negativt tal, hvis der skal sendes en skrivelse før forfaldsdatoen.';
        translation['ds.flh.description'] = 'Indtast en beskrivelse for denne post.';
        translation['dp.flh.dunningProcedure'] = 'Indtast et navn for denne rykkerprocedure.';
        translation['dp.flh.description'] = 'Indtast en beskrivelse for denne rykkerprocedure.';
        translation['dp.flh.appliesTo'] = 'Vælg, om denne rykkerprocedure skal tilknyttes kunder eller fakturaer. Hvis du vælger Kunde, skal du endvidere markere eller fjerne markeringen af feltet Tillad tilsidesættelse. ';
        translation['dp.flh.sendingSchedule'] = 'Vælg, om rykkerskrivelser skal sendes automatisk eller manuelt.';
        translation['dp.flh.minimumDunningInterval'] = 'Vælg det mindste antal dage mellem afsendelse af to på hinanden følgende breve til den samme kunde. Dette gælder for såvel manuel som automatisk afsendelse.';
        translation['dp.flh.subsidiary'] = 'Vælg de underordnede, som denne rykkerprocedure gælder for.';
        translation['dp.flh.savedSearchCustomer'] = 'Vælg den gemte kundesøgning, som denne procedure gælder for.';
        translation['dp.flh.allowOverride'] = 'Hvis du markerer dette felt, vil en rykkerprocedure på fakturaniveau kunne tilsidesætte denne procedure. Der benyttes en rykkerprocedure på fakturaniveau, hvis en faktura opfylder kriterierne for den pågældende procedure, uanset om der allerede er tilknyttet en rykkerprocedure på kundeniveau.';
        translation['dp.flh.department'] = 'Vælg de afdelinger, som denne procedure gælder for. ';
        translation['dp.flh.class'] = 'Vælg de klasser, som denne procedure gælder for.';
        translation['dp.flh.location'] = 'Vælg de lokationer, som denne procedure gælder for.';
        translation['dp.flh.savedSearchInvoice'] = 'Vælg den gemte fakturasøgning, som denne procedure gælder for.';
        translation['dp.flh.assignAutomatically'] = 'Marker dette afkrydsningsfelt for at aktivere automatisk tilknytning af denne rykkerprocedure til kunder eller fakturaer baseret på valgkriterierne.';
        translation['dt.flh.name'] = 'Indtast et navn for denne rykkerskabelon.';
        translation['dt.flh.description'] = 'Indtast en beskrivelse for denne rykkerskabelon.';
        translation['dt.flh.attachStatement'] = 'Marker dette afkrydsningsfelt for at knytte kundeopgørelser til rykkerskrivelser, der bruger denne skabelon. ';
        translation['dt.flh.attachInvoiceCopy'] = 'Marker dette afkrydsningsfelt for at vedhæfte fakturaer til rykkerskrivelser, der bruger denne skabelon.';
        translation['dt.flh.overdueInvoiceOnly'] = 'Marker dette afkrydsningsfelt, hvis du kun vil vedhæfte forfaldne fakturaer.';
        translation['dt.flh.openTransactionOnly'] = 'Marker dette afkrydsningsfelt, hvis du kun vil inkludere åbne transaktioner i kundeopgørelser.';
        translation['dt.flh.inactive'] = 'Marker dette felt, hvis du vil deaktivere skabelonen. Skabeloner, der er inaktive, vises ikke på listerne og kan ikke bruges til at sende rykkerskrivelser.';
        translation['dc.flh.allowEmail'] = 'Marker dette afkrydsningsfelt, hvis rykkerskrivelser skal sendes via e-mail.';
        translation['dc.flh.lastLetterSent'] = 'Den dato, hvor den sidste rykkerskrivelse blev sendt.';
        translation['dc.flh.dunningLevel'] = 'Dette felt viser det aktuelle rykkerniveau ved den seneste rykkerevaluering.';
        translation['dc.flh.dunningManager'] = 'Vælg den person, der er ansvarlig for denne kundes rykkersag, og hvis navn skal stå som afsender på rykkerskrivelsen.';
        translation['dc.flh.dunningProcedure'] = 'Dette felt angiver, hvilken rykkerprocedure der er knyttet til kunden. Hvis du klikker på Tildel automatisk, tildeler systemet den relevante procedure på basis af rykkervalgkriterierne. Vælg en anden værdi på rullelisten for at ændre den rykkerprocedure, der er tilknyttet kunden. Rullelisten viser kun de rykkerprocedurer, der gælder for denne kunde, baseret på de valgkriterier, der er defineret i rykkerprocedureposterne. ';
        translation['dc.flh.allowPrint'] = 'Marker dette afkrydsningsfelt, hvis rykkerskrivelser skal printes.';
        translation['dc.flh.pauseReason'] = 'Vælg en årsag for at angive, hvorfor rykkerproceduren blev midlertidigt standset.';
        translation['dc.flh.pauseReasonDetail'] = 'Vælg oplysning for at angive, hvorfor rykkerproceduren blev midlertidigt standset.';
        translation['dc.flh.pauseDunning'] = 'Marker dette afkrydsningsfelt for at stoppe rykkerprocessen midlertidigt.';
        translation['dc.flh.dunningRecepients'] = 'Vælg yderligere rykkermodtagere';
        translation['dc.flh.allowEmail'] = 'Marker dette afkrydsningsfelt, hvis rykkerskrivelser skal sendes via e-mail.';
        translation['di.flh.lastLetterSent'] = 'Den dato, hvor den sidste rykkerskrivelse blev sendt.';
        translation['di.flh.dunningLevel'] = 'Dette felt viser det aktuelle rykkerniveau ved den seneste rykkerevaluering.';
        translation['di.flh.dunningManager'] = 'Vælg den person, der er ansvarlig for denne fakturas rykkersag, og hvis navn skal stå som afsender på rykkerskrivelsen.';
        translation['di.flh.dunningProcedure'] = 'Dette felt angiver, hvilken rykkerprocedure der er knyttet til fakturaen. Hvis du klikker på Tildel automatisk, tildeler systemet den relevante procedure på basis af rykkervalgkriterierne. Vælg en anden værdi på rullelisten for at ændre den rykkerprocedure, der er tilknyttet fakturaen. Rullelisten viser kun de rykkerprocedurer, der gælder for denne faktura, baseret på de valgkriterier, der er defineret i rykkerprocedureposterne. ';
        translation['di.flh.allowPrint'] = 'Marker dette afkrydsningsfelt, hvis rykkerskrivelser skal printes.';
        translation['di.flh.pauseReason'] = 'Vælg en årsag for at angive, hvorfor rykkerproceduren blev midlertidigt standset.';
        translation['di.flh.pauseReasonDetail'] = 'Vælg en årsagsdetalje for at angive, hvorfor rykkerproceduren blev midlertidigt standset.';
        translation['di.flh.pauseDunning'] = 'Marker dette afkrydsningsfelt for at stoppe rykkerprocessen midlertidigt.';
        translation['dp.validate.unpause'] = 'Hvis feltet Stop rykker midlertidigt ryddes, startes rykkerevalueringsprocessen. Afhængigt af resultatet af denne evaluering kan NetSuite automatisk sende en rykkerskrivelse til denne kunde. Er du sikker på, du vil genoptage rykkerprocessen?';
        translation['dc.validateSubsidiary.existingConfigSubsidiary'] = 'Der findes allerede en rykkerkonfigurationspost for dette datterselskab.';
        translation['l10n.address.invalidPOBox'] = 'Indtast en gyldig værdi i feltet Postboks.';
        translation['l10n.address.invalidZipCode'] = 'Indtast et gyldigt postnummer.';
        translation['l10n.address.invalidRuralRoute'] = 'Indtast en gyldig værdi for Rute.';
        translation['l10n.accessForDDandAccountant'] = 'Det er kun rollerne Administrator, Rykkerregister og Bogholder, der kan oprette og ændre denne type poster.';
        translation['l10n.deleteAccessForDDandAccountant'] = 'Det er kun rollerne Administrator, Rykkerregister og Bogholder, der kan slette denne type poster.';
        translation['l10n.accessForAdministrator'] = 'Det er kun rollen Administrator, der kan oprette og ændre denne type poster.';
        translation['l10n.deleteAccessForAdministrator'] = 'Det er kun rollen Administrator, der kan slette denne type poster.';
        translation['l10n.noPagePrivilege'] = 'Du har ikke tilladelse til at se denne side.';
        translation['dq.pdfemail.folderName'] = 'Rykkerbreve i PDF-format til udskrivning';
        translation['dq.pdfemail.subject'] = 'De genererede PDF-rykkerbreve er tilgængelige til udskrivning fra filarkivet.';
        translation['dq.pdfemail.link'] = 'Tryk på linket for at se folderen med PDF-breve:';
        translation['dq.pdfemail.tableHead'] = 'Den følgende tabel viser detaljer om de foldere, der indeholder PDF-filerne.';
        translation['dq.pdfemail.exceedLimit'] = 'De genererede filer kunne ikke vedhæftes, da de fylder mere end tilladt.';
        translation['dq.pdfemail.tableLabel1'] = 'Mapper';
        translation['dq.pdfemail.tableLabel2'] = 'Sti';
        translation['dq.pdfemail.tableLabel3'] = 'Status';
        translation['dq.pdfemail.tableLabel4'] = 'Noter';

        break;

      case 'de_DE':
      case 'de-DE':
        translation['dsa.response.none_found'] = 'Keine Mahnverfahren verfügbar.';
        translation['form.dunning_template.title'] = 'Mahnvorlage';
        translation['field.template.name'] = 'Name';
        translation['field.template.description'] = 'Beschreibung';
        translation['field.template.attachStatement'] = 'Kontoauszug anhängen';
        translation['field.template.overdue_invoices_stmt'] = 'Nur überfällige Rechnungen auf dem Kontoauszug';
        translation['field.template.inactive'] = 'Nicht aktiv';
        translation['field.template.attach_invoice_copy'] = 'Kopien von Rechnungen anhängen';
        translation['field.template.only_overdue_invoices'] = 'Nur überfällige Rechnungen';
        translation['field.template.subject'] = 'Betreff';
        translation['selection.template.savedsearch'] = 'Gespeichertes Suchmuster';
        translation['selection.template.searchcolumn'] = 'Spalte durchsuchen';
        translation['label.template.lettertext'] = 'Brieftext';
        translation['dba.form.title'] = 'Mahnung Massenzuordnung';
        translation['dba.form.source'] = 'Findet Anwendung auf';
        translation['dba.form.procedure'] = 'Mahnverfahren';
        translation['dba.form.source.help'] = 'Findet Anwendung auf';
        translation['dba.form.procedure.help'] = 'Mahnverfahren';
        translation['dba.form.dunning_manager'] = 'Mahnungsmanager';
        translation['dba.form.dunning_manager.help'] = 'Mahnungsmanager';
        translation['dba.tab.invoice'] = 'Rechnungen';
        translation['dba.sublist.invoice'] = 'Rechnungen';
        translation['dba.tab.customer'] = 'Kunden';
        translation['dba.sublist.customer'] = 'Kunden';
        translation['dba.sublist.common.id'] = 'Identifizierungscode';
        translation['dba.sublist.common.customer'] = 'Kunde';
        translation['dba.sublist.invoice.invoice'] = 'Rechnung';
        translation['dba.sublist.invoice.amount'] = 'Betrag';
        translation['dba.sublist.invoice.currency'] = 'Währung';
        translation['dba.sublist.invoice.duedate'] = 'Fälligkeitsdatum';
        translation['dba.sublist.invoice.days_overdue'] = 'Tage überfällig';
        translation['dba.sublist.customer.subsidiary'] = 'Niederlassung';
        translation['dba.sublist.common.assign_dunning'] = 'Zuweisen';
        translation['dba.sublist.common.dunning_procedure'] = 'Mahnverfahren';
        translation['dba.sublist.common.dunning_level'] = 'Mahnstufe';
        translation['dba.sublist.common.last_letter_sent'] = 'Versanddatum des letzten Briefs';
        translation['dba.sublist.common.dunning_sending_type'] = 'Versandart';
        translation['dba.sublist.common.page_next'] = '>';
        translation['dba.sublist.common.page_previous'] = '<';
        translation['dba.sublist.common.page_option'] = '{startIndex} - {endIndex} von {totalEntryCount}';
        translation['dba.form.restriction'] = 'Auswahlkriterien';
        translation['dba.form.selection'] = 'Auswahl Mahnverfahren';
        translation['dba.form.restriction.subsidiary'] = 'Niederlassungen';
        translation['dba.form.restriction.location'] = 'Standorte';
        translation['dba.form.restriction.dept'] = 'Abteilungen';
        translation['dba.form.restriction.class'] = 'Klassen';
        translation['dba.form.restriction.search'] = 'Gespeichertes Suchmuster';
        translation['dba.form.action.assign'] = 'Zuweisen';
        translation['dba.form.action.assign_customer'] = 'An Kunden zuweisen';
        translation['dba.form.action.assign_invoice'] = 'An Rechnungen zuweisen';
        translation['dba.form.action.cancel'] = 'Abbrechen';
        translation['dba.form.notification.highnumberofrecord'] = 'Diese Anfrage kann einige Sekunden in Anspruch nehmen. Bitte warten Sie, bis Sie zur Seite „Mahnverfahren“ weitergeleitet werden.';
        translation['dqf.form.action.send'] = 'Senden';
        translation['dqf.form.action.print'] = 'Printmedien';
        translation['dqf.form.action.remove'] = 'Entfernen';
        translation['dqf.form.send.title'] = 'Warteschlange E-Mail-Mahnung';
        translation['dqf.form.print.title'] = 'PDF-Druckliste Mahnung';
        translation['dqf.filter.fieldGroup'] = 'Filter';
        translation['dqf.filter.inlineHelp'] = 'Verwenden Sie die Filter, um die Suche zu spezifizieren und die angezeigten Ergebnisse einzugrenzen.';
        translation['dqf.filter.applyFiltersButton'] = 'Suchmuster';
        translation['dqf.filter.customer'] = 'Kunde';
        translation['dqf.filter.recipient'] = 'Empfänger';
        translation['dqf.filter.procedure'] = 'Mahnverfahren';
        translation['dqf.filter.dpLevel'] = 'Mahnstufe';
        translation['dqf.filter.appliesTo'] = 'Findet Anwendung auf';
        translation['dqf.filter.allowPrint'] = 'Drucken zulassen';
        translation['dqf.filter.allowEmail'] = 'E-Mail zulassen';
        translation['dqf.filter.lastLtrSentStart'] = 'Startdatum des Versands des letzten Briefs';
        translation['dqf.filter.lastLtrSentEnd'] = 'Beendigungsdatum des Versands des letzten Briefs';
        translation['dqf.filter.evalDateStart'] = 'Startdatum der Bewertung';
        translation['dqf.filter.evalDateEnd'] = 'Beendigungsdatum der Bewertung';
        translation['dqf.filter.boolean.yes'] = 'Ja';
        translation['dqf.filter.boolean.no'] = 'Nein';
        translation['dqf.sublist.send.title'] = 'Warteschlange E-Mail-Mahnung';
        translation['dqf.sublist.print.title'] = 'PDF-Druckliste Mahnung';
        translation['dqf.sublist.common.customer'] = 'Kunde';
        translation['dqf.sublist.common.mark'] = 'Kennzeichnen';
        translation['dqf.sublist.common.view'] = 'Anzeigen';
        translation['dqf.sublist.common.id'] = 'Identifizierungscode';
        translation['dqf.sublist.dp.applies_to'] = 'Findet Anwendung auf';
        translation['dqf.sublist.common.dunning_procedure'] = 'Mahnverfahren';
        translation['dqf.sublist.common.dunning_level'] = 'Ebene';
        translation['dqf.sublist.record.last_letter_sent'] = 'Letzter versendeter Brief';
        translation['dqf.sublist.record.dunning_allow_email'] = 'E-Mail zulassen';
        translation['dqf.sublist.record.dunning_allow_print'] = 'Drucken zulassen';
        translation['dqf.sublist.record.pause_dunning'] = 'Mahnung anhalten';
        translation['dqf.sublist.common.evaluation_date'] = 'Bewertungsdatum';
        translation['dqf.sublist.common.related_entity'] = 'Empfänger';
        translation['dbu.form.title'] = 'Mengenaktualisierung von Kundensätzen für Mahnung';
        translation['dbu.form.update_button'] = 'Aktualisieren';
        translation['dbu.form.field.subsidiary'] = 'Niederlassung';
        translation['dbu.form.flh.subsidiary'] = 'Wählen Sie die Niederlassung aus, für die Sie eine Mengenaktualisierung der Mahnungsdatenfelder auf Kundendatensätzen durchführen möchten. Updates werden auf alle Kundendatensätze angewendet, die zu der ausgewählten Niederlassung gehören.';
        translation['dbu.form.field.allow_email'] = 'Senden von Briefen per E-Mail zulassen';
        translation['dbu.form.flh.allow_email'] = 'Wählen Sie einen Wert aus, der auf dieses Datenfeld auf den Kundendatensätzen angewendet werden soll, nachdem die Mengenaktualisierung durchgeführt wurde:\nUnverändert – Der aktuelle Wert des Datenfelds wird nicht geändert. \nAktiviert – Das Kästchen wird auf Kundendatensätzen nach der Mengenaktualisierung aktiviert. \nNicht aktiviert – Das Kästchen wird nach der Mengenaktualisierung nicht aktiviert.';
        translation['dbu.form.field.allow_print'] = 'Drucken von Briefen zulassen';
        translation['dbu.form.flh.allow_print'] = 'Wählen Sie einen Wert aus, der auf dieses Datenfeld auf den Kundendatensätzen angewendet werden soll, nachdem die Mengenaktualisierung durchgeführt wurde:\nUnverändert – Der aktuelle Wert des Datenfelds wird nicht geändert. \nAktiviert – Das Kästchen wird auf Kundendatensätzen nach der Mengenaktualisierung aktiviert. \nNicht aktiviert – Das Kästchen wird nach der Mengenaktualisierung nicht aktiviert.';
        translation['dbu.form.field.dont_send_cust_email'] = 'Keine Briefe an Kunden-E-Mail-Adressen senden';
        translation['dbu.form.flh.dont_send_cust_email'] = 'Wählen Sie einen Wert aus, der auf dieses Datenfeld auf den Kundendatensätzen angewendet werden soll, nachdem die Mengenaktualisierung durchgeführt wurde:\nUnverändert – Der aktuelle Wert des Datenfelds wird nicht geändert. \nAktiviert – Das Kästchen wird auf Kundendatensätzen nach der Mengenaktualisierung aktiviert. \nNicht aktiviert – Das Kästchen wird nach der Mengenaktualisierung nicht aktiviert.';
        translation['dbu.form.primary_field_group'] = 'Kriterium';
        translation['dbu.form.bulk_update_field_group'] = 'Massenaktualisierung von Feldern';
        translation['dbu.form.options.unchanged'] = '- Unverändert -';
        translation['dbu.form.options.checked'] = 'Aktiviert';
        translation['dbu.form.options.not_checked'] = 'Nicht aktiviert';
        translation['dbu.validation.no_selection'] = 'Es werden keine Datenfelder aktualisiert, da - Unverändert - für alle Datenfelder ausgewählt ist. Eine Mengenaktualisierung kann durchgeführt werden, wenn eine Änderung in mindestens einem Datenfeld angegeben wurde (Aktiviert oder Nicht aktiviert).';
        translation['dbu.validation.no_sending_media'] = 'Kundendatensätze können nicht gespeichert werden, wenn sowohl das Kästchen „Senden von Briefen per E-Mail zulassen“ als auch das Kästchen „Drucken von Briefen zulassen“ nicht aktiviert ist. Aktiviert ausgewählt in einem oder beiden der folgenden Datenfelder:\n- Senden von Briefen per E-Mail zulassen\n- Drucken von Briefen zulassen';
        translation['dbu.validation.verify_submit_ow'] = 'Alle Kundendatensätze mit Mahnverfahren werden für die ausgewählte Niederlassung aktualisiert {SUBSIDIARY}. Sie erhalten eine E-Mail-Nachricht, wenn der Vorgang abgeschlossen ist. Sind Sie sicher, dass Sie mit der Mengenaktualisierung fortfahren möchten? Wenn Sie auf OK klicken, beginnt die Mengenaktualisierung und kann nicht rückgängig gemacht werden.';
        translation['dbu.validation.verify_submit_si'] = 'Alle Kundendatensätze mit Mahnverfahren werden aktualisiert. Sie erhalten eine E-Mail-Nachricht, wenn der Vorgang abgeschlossen ist. Sind Sie sicher, dass Sie mit der Mengenaktualisierung fortfahren möchten? Wenn Sie auf OK klicken, beginnt die Mengenaktualisierung und kann nicht rückgängig gemacht werden.';
        translation['dbu.form.reminderinlinehelp'] = 'NetSuite empfiehlt, dass Sie die Mengenaktualisierungsfunktion außerhalb der normalen Geschäftszeiten verwenden. Dadurch wird gewährleistet, dass andere Benutzer in Ihrem Unternehmen während der Mengenaktualisierung keine Kundendatensätze aktualisieren.';
        translation['dbu.validation.validate_concurrency_ow'] = 'Eine Mengenaktualisierung von Kundendatensätze für Mahnungen wurde von  {USER} für die Niederlassung  {SUBSIDIARY} initialisiert. Die Mengenaktualisierung muss abgeschlossen sein, bevor Sie eine weitere Mengenaktualisierung von Kunden für dieselbe Niederlassung durchführen können.';
        translation['dbu.validation.validate_concurrency_si'] = 'Das System kann zu einer Zeit nur eine Mengenaktualisierung durchführen. Es wird zurzeit eine von  {USER} initialisierte Mengenaktualisierung durchgeführt.';
        translation['dbu.customer.message.complete_subject'] = 'Mengenaktualisierung von Kundendatensätzen für Mahnung';
        translation['dbu.customer.message.complete_body_ow'] = [
          'Hallo von NetSuite.<br />',
          'Die Mengenaktualisierung von Kundendatensätzen für Mahnung ist abgeschlossen für die Niederlassung  {SUBSIDIARY}.',
          'Senden von Briefen per E-Mail zulassen = {ALLOW_EMAIL}',
          'Drucken von Briefen zulassen = {ALLOW_PRINT}',
          'Briefe nicht an Kunden-E-Mail-Adressen senden = {DONT_SEND_TO_CUST}<br />',
          'Anzahl aktualisierter Kundendatensätze: {PROCESSED_RECORDS} von  {RECORD_COUNT}.{ERROR_STEPS}',
          'Dies ist eine systemgenerierte E-Mail.<br />',
          'Vielen Dank,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.complete_body_si'] = [
          'Hallo von NetSuite.<br />',
          'Die Mengenaktualisierung von Kundendatensätzen für Mahnung ist abgeschlossen.',
          'Senden von Briefen per E-Mail zulassen = {ALLOW_EMAIL}',
          'Drucken von Briefen zulassen = {ALLOW_PRINT}',
          'Briefe nicht an Kunden-E-Mail-Adressen senden = {DONT_SEND_TO_CUST}<br />',
          'Anzahl aktualisierter Kundendatensätze: {PROCESSED_RECORDS} von  {RECORD_COUNT}.{ERROR_STEPS}',
          'Dies ist eine systemgenerierte E-Mail.<br />',
          'Vielen Dank,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.error_file_header'] = 'Kunden-ID,Fehler';
        translation['dbu.customer.message.error_filename'] = 'Failed Updates.csv';
        translation['dbu.customer.message.error_steps'] = '<br />Bitte laden Sie die angehängte Datei herunter, um eine Liste nicht aktualisierter Datensätze zu sehen. Sie können diese Datensätze manuell aktualisieren.';
        translation['dc.validateCustomer.noDPMatched'] = 'Es wurde kein Mahnverfahren gefunden, das mit dem Kundendatensatz übereinstimmt.';
        translation['dc.validateCustomer.recipientNoEmail'] = 'Die folgenden Empfänger von Mahnbriefen haben keine E-Mail-Adressen auf ihren Kontaktdatensätzen: {CONTACTNAMES}.';
        translation['dc.validateCustomer.customerNoEmail'] = 'Der Datensatz kann nicht gespeichert werden. Das Kästchen „Senden von Briefen per E-Mail zulassen“ ist aktiviert, doch es liegen keine E-Mail-Adresse und kein Mahnungsempfänger vor, an die der Brief gesendet werden kann. Um diesen Datensatz speichern zu können, müssen die folgenden Bedingungen erfüllt sein:\n- Der untergeordnete Tab „Mahnungsempfänger“ muss mindestens einen Kontakt mit einer E-Mail-Adresse enthalten.\n- Das E-Mail-Datenfeld auf dem Kundendatensatz enthält eine E-Mail-Adresse.\n\nHinweis: Die E-Mail-Adresse des Kunden ist nur erforderlich, wenn das Kästchen „Briefe nicht an Kunden-E-Mail-Adressen senden“ nicht aktiviert ist.';
        translation['dc.validateCustomer.noEmailAtAll'] = 'Der Kundendatensatz enthält keine E-Mail-Adresse und für diesen Kunden ist kein Mahnungsempfänger angegeben. Geben Sie eine E-Mail-Adresse auf dem Kundendatensatz ein oder wählen Sie auf dem untergeordneten Tab „Mahnung“ mindestens einen Mahnbriefempfänger aus, für den eine E-Mail-Adresse vorliegt.';
        translation['dc.validateCustomer.recipientListEmpty'] = 'Der Datensatz kann nicht gespeichert werden. Das Kästchen „Senden von Briefen per E-Mail zulassen“ ist aktiviert, doch es liegt kein Mahnungsempfänger vor, an den der Brief gesendet werden kann. Um diesen Datensatz zu speichern, muss der untergeordnete Tab „Mahnungsempfänger“ mindestens einen Kontakt mit einer E-Mail-Adresse enthalten. \n\nHinweis: Die E-Mail-Adresse des Kunden ist nur erforderlich, wenn das Kästchen „Briefe nicht an Kunden-E-Mail-Adressen senden“ nicht aktiviert ist.';
        translation['dc.validateCustomer.dpMatched'] = 'Der Kundendatensatz stimmt mit dem Mahnverfahren von {DP} überein. Möchten Sie das Mahnverfahren ändern?';
        translation['dc.validateCustomer.dpAllReadyAssigned'] = 'Das gefundene Mahnverfahren ist das gleiche wie bei dem bereits zugeteilten Mahnverfahren in dem Datensatz.';
        translation['dc.validateDP.managerRequired'] = 'Ein Mahnungsmanager ist erforderlich.';
        translation['dc.validateDP.sendingModeRequired'] = 'Mindestens eines der folgenden Kästchen muss aktiviert werden:\n- Senden von Briefen per E-Mail zulassen\n- Drucken von Briefen zulassen';
        translation['dl.validateDL.dlCountExceeded'] = 'Sie haben die maximal zulässige Anzahl möglicher Mahnstufen überschritten.';
        translation['dl.validateDL.lowerDaysOverDue'] = 'Die Anzahl der überfälligen Tage muss niedriger sein als {DAYS}.';
        translation['dl.validateDL.higherDaysOverdue'] = 'Die Anzahl der überfälligen Tage muss höher sein als {DAYS}.';
        translation['dl.validateDL.daysOverdueExist'] = 'Die Anzahl der überfälligen Tage {DAYS} befindet sich bereits in einer anderen Zeile.';
        translation['dl.validateDL.lastRecordDeletion'] = 'Sie können nur den letzten Datensatz in der Liste löschen.';
        translation['dl.validateDL.daysBetSending'] = 'Die Anzahl der Tage zwischen dem Versenden von Briefen muss gleich oder größer sein als  {DAYS}';
        translation['dl.validateDL.minOutsBalGEZero'] = 'Der minimale ausstehende Betrag muss mindestens (0) sein.';
        translation['dl.validateDL.daysOverdueLessPrevious'] = 'Anzahl überfälliger Tage in Mahnstufe {LEVEL} ({LEVEL_OVERDUE} Tage) muss weniger sein als diejenige der Mahnstufe {PREVLEVEL} ({PREVLEVEL_OVERDUE} Tage).';
        translation['dl.validateDL.dlRequired'] = 'Mindestens eine Mahnstufe ist erforderlich.';
        translation['dp.validateDP.editNotAllowed'] = 'Es ist Ihnen nicht gestattet, die Art des Mahnverfahrens zu bearbeiten.';
        translation['dp.information.possibleMultipleSending'] = 'Durch Deaktivierung des Datenfelds „Mindestmahnintervall“ können mit Ihrem Konto an einem Tag mehrere Mahnbriefe an einen Kunden versendet werden. Sind Sie sicher, dass Sie es deaktivieren möchten?';
        translation['dba.pagination.failedPrevPage'] = 'Auf vorherige Seite konnte nicht zugegriffen werden.';
        translation['dq.validation.str_send'] = 'Senden';
        translation['dq.validation.str_remove'] = 'Entfernen';
        translation['dq.validation.str_print'] = 'Drucken';
        translation['dq.validation.chooseAction'] = 'Bitte wählen Sie einen Brief aus ';
        translation['dq.validation.removalConfirmation'] = 'Möchten Sie die ausgewählten Datensätze wirklich aus der Warteschlange entfernen?';
        translation['dq.pt.dunningQueueTitle'] = 'Mahnungswarteschlange';
        translation['dq.pt.source'] = 'Quellenart';
        translation['dq.pt.dunningProcedure'] = 'Mahnverfahren';
        translation['dq.pt.dunningLevel'] = 'Mahnstufe';
        translation['dq.pt.lastLetterSent'] = 'Letzter versendeter Brief';
        translation['dq.pt.emailingAllowed'] = 'Per E-Mail versenden zulässig';
        translation['dq.pt.printingAllowed'] = 'Drucken zulässig';
        translation['dq.pt.send'] = 'Senden';
        translation['dq.pt.remove'] = 'Entfernen';
        translation['dq.pt.print'] = 'Printmedien';
        translation['dq.pt.customer'] = 'Kunde';
        translation['dt.validator.invalidDefault'] = 'Es muss mindestens eine Standardvorlage für jede der Mahnvorlagenarten ausgewählt sein. Überprüfen Sie die untergeordneten Tabs „E-Mail“ und „PDF“ und wählen Sie eine Standardvorlage aus.';
        translation['dt.validator.duplicateLanguage'] = 'Diese Sprache wird bereits für dieses Vorlagenart verwendet.';
        translation['dt.validator.noTemplateDocs'] = 'Um diesen Datensatz speichern zu können, muss mindestens eine E-Mail-Vorlage und ein PDF-Vorlagendokument vorhanden sein.';
        translation['dt.validator.subject'] = 'Validierung des Mahnvorlagendokument fehlgeschlagen';
        translation['dt.validator.body'] = 'Die folgenden Vorlagendokumente sind ungültig:';
        translation['dt.validator.defaultDeletion'] = 'Sie versuchen eine Vorlage zu löschen, die zurzeit als Standardvorlage festgelegt ist. Um diese Vorlage zu löschen, müssen Sie zuerst eine andere Vorlage als Ihre Standardvorlage festlegen.';
        translation['dt.validator.xmlEmailDeprecated'] = 'Sie können keine Zeilen von XML-E-Mail-Vorlagen hinzufügen, bearbeiten oder entfernen. Die Verwendung von XML-basierten Vorlagen läuft aus. Wenn Sie E-Mail-Vorlagen zum untergeordneten Tab „E-Mail-Vorlage“ hinzufügen, werden bei der Speicherung dieses Datensatzes alle Zeilen auf dem untergeordneten Tab „Mahnvorlage XML-E-Mail“ gelöscht.';
        translation['dt.validator.deleteAllXMLLines'] = 'Das Speichern dieses Datensatzes löscht alle Zeilen auf dem untergeordneten Tab „Mahnvorlage XML-E-Mail“. ';
        translation['dt.validator.noEMailDocs'] = 'Es muss mindestens eine E-Mail-Vorlage vorhanden sein, um diesen Datensatz speichern zu können.';
        translation['dt.validator.noPDFDocs'] = 'Es muss mindestens eine PDF-Vorlage vorhanden sein, um diesen Datensatz speichern zu können.';
        translation['dt.validator.multipleDefault'] = 'Sind Sie sicher, dass Sie diese Vorlage als Standardvorlage verwenden möchten?';
        translation['dlr.validateDLR.noAmount'] = 'Die Regel der Mahnstufe muss mindesten einen Betrag für die Regel der Mahnstufe aufweisen.';
        translation['dlr.validateDLR.noDefaultAmount'] = 'Die Regel der Mahnstufe muss mindesten einen Betrag für die Regel der Mahnstufe als Standardbetrag aufweisen.';
        translation['dlr.validateDLR.duplicateCurrency'] = 'Währung muss einzigartig sein.';
        translation['dlr.validateDLR.invalidAmount'] = 'Der Betrag muss größer oder gleich 0 sein.';
        translation['dlr.validateDLR.changeDefaultCurrency'] = 'Möchten Sie wirklich die Währung und den Betrag dieser Zeile als Standard festlegen? (Dadurch ändern sich der aktuelle Standardbetrag und die Standardwährung.)';
        translation['dlr.validateDLR.negativeDaysOverdue'] = 'Das Datenfeld „Tage überfällig“ enthält eine negative Zahl. Dadurch wird ein Brief an den Kunden gesendet, bevor die Zahlung fällig wird.';
        translation['dlr.validateDLR.daysOverdueChanged'] = 'Wenn in einer Mahnregel der Wert von „Tage überfällig“ einer Mahnstufe geändert wird, kann sich die Sequenz oder Reihenfolge der Mahnstufen ändern, was wiederum zum Versand falscher Mahnschreiben führen kann.\n\n Sie sollten die Reihenfolge der Mahnstufen bei jedem Mahnverfahren ({DP_LIST}) überprüfen, bei dem die Mahnstufe verwendet wird, die Sie ändern möchten.';
        translation['dlr.validateDLR.cannotAddCurrency'] = 'Die Währung kann nicht hinzugefügt werden, da das Merkmal „Mehrfachwährungen“ nicht aktiviert ist.';
        translation['der.flh.dunningProcedure'] = 'Dieses Datenfeld gibt das Mahnverfahren an, das einer Rechnung oder einem Kunden zugewiesen ist.';
        translation['der.flh.dunningLevel'] = 'Dieses Datenfeld gibt die aktuelle Mahnstufe nach der Bewertung an.';
        translation['der.flh.relatedEntity'] = 'Dieses Datenfeld ist mit dem Einheit- oder Kontaktdatensatz des Mahnungsempfängers verknüpft.';
        translation['der.flh.messageContent'] = 'Dieses Datenfeld enthält den Inhalt des Mahnbriefs.';
        translation['der.flh.invoiceList'] = 'Dieses Datenfeld zeigt die Rechnungen an, die mit diesem Mahnbrief verknüpft sind.';
        translation['der.flh.emailRecipient'] = 'Dieses Datenfeld zeigt die E-Mail-Adresse des Empfängers des Mahnbriefs an.';
        translation['der.flh.subject'] = 'Das Datenfeld zeigt die Betreffzeile des Mahnbriefs an.';
        translation['der.flh.dunningManager'] = 'Dieses Datenfeld zeigt den Mahnungsmanager an, der dem Kunden zugewiesen wurde, und ist mit dem Angestelltendatensatz des Mahnungsmanagers verknüpft.';
        translation['der.flh.dunningTemplate'] = 'Dieses Datenfeld ist mit dem Datensatz der Mahnvorlage verknüpft.';
        translation['der.flh.customer'] = 'Dieses Datenfeld ist mit dem Kundendatensatz verknüpft.';
        translation['der.flh.status'] = 'Dieses Datenfeld gibt an, ob Ihre E-Mail erfolgreich versendet wurde oder nicht. Der Status kann einer der folgenden sein:\n\nGesendet – Die E-Mail wurde erfolgreich versendet.\nFehlgeschlagen – Das System konnte die E-Mail aufgrund von fehlenden Informationen nicht versenden. Ein Beispiel wäre eine fehlende E-Mail-Adresse für den Kunden oder den Kontakt.\n• In Warteschlange – Der Mahnbrief befindet sich noch in der Warteschlange und wurde noch nicht verarbeitet.\n• Entfernt – der Mahnungsmanager hat diesen Datensatz aus der Mahnungswarteschlange entfernt.';
        translation['dlr.flh.daysOverdue'] = 'Geben Sie die Anzahl der Tage nach dem Fälligkeitsdatum an, nach denen ein Mahnbrief gesendet werden soll. Um einen Brief vor dem Fälligkeitsdatum zu senden, geben Sie eine negative Zahl ein.';
        translation['ds.flh.description'] = 'Geben Sie eine Beschreibung für diesen Datensatz ein.';
        translation['dp.flh.dunningProcedure'] = 'Geben Sie einen Namen für dieses Mahnverfahren ein.';
        translation['dp.flh.description'] = 'Geben Sie eine Beschreibung für dieses Mahnverfahren ein.';
        translation['dp.flh.appliesTo'] = 'Wählen Sie aus, ob dieses Mahnverfahren Kunden oder Rechnungen zugewiesen wird. Wenn Sie Kunden auswählen, müssen Sie das Kästchen „Überschreibung zulassen“ entweder aktivieren oder deaktivieren.';
        translation['dp.flh.sendingSchedule'] = 'Wählen Sie aus, ob Mahnbriefe automatisch oder manuell versendet werden sollen.';
        translation['dp.flh.minimumDunningInterval'] = 'Wählen Sie das Mindestanzahl an Tagen, die zwischen dem Versenden von zwei aufeinander folgenden Briefen für denselben Kunden liegen müssen. Dies findet sowohl auf manuelles als auch automatisches Versenden Anwendung.';
        translation['dp.flh.subsidiary'] = 'Wählen Sie die Niederlassungen aus, auf die dieses Mahnverfahren Anwendung findet.';
        translation['dp.flh.savedSearchCustomer'] = 'Wählen Sie das gespeicherte Kundensuchmuster aus, auf das dieses Verfahren Anwendung findet.';
        translation['dp.flh.allowOverride'] = 'Wenn Sie dieses Kästchen aktivieren, kann eine Mahnungsstufe auf Rechnungsebene dieses Mahnverfahren aufheben. Ein Mahnverfahren auf Rechnungsebene wird verwendet, wenn eine Rechnung die Kriterien für dieses Verfahren unabhängig davon erfüllt, ob bereits ein Mahnverfahren auf Kundenebene zugewiesen wurde.';
        translation['dp.flh.department'] = 'Wählen Sie die Abteilungen aus, auf die dieses Verfahren Anwendung findet.';
        translation['dp.flh.class'] = 'Wählen Sie die Klassen aus, auf die dieses Verfahren Anwendung findet.';
        translation['dp.flh.location'] = 'Wählen Sie die Standorte aus, auf die dieses Verfahren Anwendung findet.';
        translation['dp.flh.savedSearchInvoice'] = 'Wählen Sie das gespeicherte Rechnungssuchmuster aus, auf das dieses Verfahren Anwendung findet.';
        translation['dp.flh.assignAutomatically'] = 'Aktivieren Sie dieses Kästchen, um zu ermöglichen, dass das System dieses Mahnverfahren basierend auf den Auswahlkriterien automatisch Kunden oder Rechnungen zuweist.';
        translation['dt.flh.name'] = 'Geben Sie einen Namen für diese Mahnvorlage ein.';
        translation['dt.flh.description'] = 'Geben Sie eine Beschreibung für diese Mahnvorlage ein.';
        translation['dt.flh.attachStatement'] = 'Aktivieren Sie dieses Kästchen, um Kontoauszüge des Kunden an Mahnbriefe anzuhängen, die diese Vorlage verwenden.';
        translation['dt.flh.attachInvoiceCopy'] = 'Aktivieren Sie dieses Kästchen, um Rechnungen an Mahnbriefe anzuhängen, die diese Vorlage verwenden.';
        translation['dt.flh.overdueInvoiceOnly'] = 'Aktivieren Sie dieses Kästchen, wenn Sie nur überfällige Rechnungen anhängen möchten.';
        translation['dt.flh.openTransactionOnly'] = 'Aktivieren Sie dieses Kästchen, wenn Sie nur offene Transaktionen auf den Kontoauszügen des Kunden berücksichtigen möchten.';
        translation['dt.flh.inactive'] = 'Aktivieren Sie dieses Kästchen, um die Vorlage zu deaktivieren. Deaktivierte Vorlagen werden nicht in Listen angezeigt und können nicht für den Versand von Mahnbriefen verwenden werden.';
        translation['dc.flh.allowEmail'] = 'Aktivieren Sie dieses Kästchen, wenn Sie das Versenden von Mahnbriefen per E-Mail zulassen möchten.';
        translation['dc.flh.lastLetterSent'] = 'Das Datum, an dem der letzte Mahnbrief versendet wurde.';
        translation['dc.flh.dunningLevel'] = 'Dieses Datenfeld zeigt die aktuelle Mahnstufe seit der letzten Mahnbewertung an.';
        translation['dc.flh.dunningManager'] = 'Wählen Sie die verantwortliche Person für die Mahnung dieses Kunden aus und wählen Sie, welcher Name als Absender auf dem Mahnbrief erscheinen soll.';
        translation['dc.flh.dunningProcedure'] = 'Dieses Datenfeld zeigt das Mahnverfahren an, das einem Kunden zugewiesen ist. Wenn Sie auf „Automatisch zuweisen“ klicken, weist das System das angemessene Verfahren basierend auf den Auswahlkriterien für die Mahnung zu. Wählen Sie einen anderen Wert aus der Ausklappliste aus, um das Mahnverfahren zu ändern, das dem Kunden zugewiesen ist. Die Ausklappliste zeigt nur die Mahnverfahren an, die für den Kunden basierend auf den Auswahlkriterien anwendbar sind, die auf den Mahnungsverfahren-Datensätzen definiert sind.';
        translation['dc.flh.allowPrint'] = 'Aktivieren Sie dieses Kästchen, wenn Sie das Drucken von Mahnbriefen zulassen möchten.';
        translation['dc.flh.pauseReason'] = 'Wählen Sie einen Status aus, um anzugeben, warum die Mahnung angehalten wurde.';
        translation['dc.flh.pauseReasonDetail'] = 'Wählen Sie ein Detail aus, um anzugeben, warum die Mahnung angehalten wurde.';
        translation['dc.flh.pauseDunning'] = 'Aktivieren Sie dieses Kästchen, um das Mahnverfahren vorübergehend anzuhalten.';
        translation['dc.flh.dunningRecepients'] = 'Wählen Sie zusätzliche Mahnungsempfänger aus.';
        translation['dc.flh.allowEmail'] = 'Aktivieren Sie dieses Kästchen, wenn Sie das Versenden von Mahnbriefen per E-Mail zulassen möchten.';
        translation['di.flh.lastLetterSent'] = 'Das Datum, an dem der letzte Mahnbrief versendet wurde.';
        translation['di.flh.dunningLevel'] = 'Dieses Datenfeld zeigt die aktuelle Mahnstufe seit der letzten Mahnbewertung an.';
        translation['di.flh.dunningManager'] = 'Wählen Sie die verantwortliche Person für die Mahnung für diesen Kunden aus und wählen Sie, welcher Name als Absender auf dem Mahnbrief erscheinen soll.';
        translation['di.flh.dunningProcedure'] = 'Dieses Datenfeld zeigt das Mahnverfahren, das einer Rechnung oder einem Kunden zugewiesen ist. Wenn Sie auf „Automatisch zuweisen“ klicken, weist das System das angemessene Verfahren basierend auf den Auswahlkriterien für die Mahnung zu. Wählen Sie einen anderen Wert aus der Ausklappliste aus, um das Mahnverfahren zu ändern, das der Rechnung zugewiesen ist. Die Ausklappliste zeigt nur die Mahnverfahren an, die für diese Rechnung basierend auf den Auswahlkriterien anwendbar sind, die auf den Mahnungsverfahren-Datensätzen definiert sind.';
        translation['di.flh.allowPrint'] = 'Aktivieren Sie dieses Kästchen, wenn Sie das Drucken von Mahnbriefen zulassen möchten.';
        translation['di.flh.pauseReason'] = 'Wählen Sie einen Status aus, um anzugeben, warum die Mahnung angehalten wurde.';
        translation['di.flh.pauseReasonDetail'] = 'Wählen Sie einen Grund aus, um anzugeben, warum die Mahnung angehalten wurde.';
        translation['di.flh.pauseDunning'] = 'Aktivieren Sie dieses Kästchen, um das Mahnverfahren vorübergehend anzuhalten.';
        translation['dp.validate.unpause'] = 'Die Deaktivierung des Kästchens „Mahnung anhalten“ löst unmittelbar den Workflow Mahnungsbewertung aus. NetSuite sendet unter Umständen einen Mahnbrief an diesen Kunden basierend auf dem Mahnungsbewertungsergebnis. Sind Sie sicher, dass Sie mit der Mahnung fortfahren möchten?';
        translation['dc.validateSubsidiary.existingConfigSubsidiary'] = 'Ein Mahnungskonfigurationsdatensatz existiert bereits für diese Niederlassung.';
        translation['l10n.address.invalidPOBox'] = 'Bitte geben Sie eine gültige Postfachnummer ein.';
        translation['l10n.address.invalidZipCode'] = 'Bitte geben Sie eine gültige Postleitzahl ein.';
        translation['l10n.address.invalidRuralRoute'] = 'Bitte geben Sie eine gültigen Landstraßenwert ein.';
        translation['l10n.accessForDDandAccountant'] = 'Nur die Rollen Administrator, Mahnungsleiter und Buchhalter können diese Art von Datensatz erstellen und modifizieren.';
        translation['l10n.deleteAccessForDDandAccountant'] = 'Nur die Rollen Administrator, Mahnungsleiter und Buchhalter können diese Art von Datensatz löschen.';
        translation['l10n.accessForAdministrator'] = 'Nur die Rolle Administrator kann diese Art von Datensatz erstellen und modifizieren.';
        translation['l10n.deleteAccessForAdministrator'] = 'Nur die Rolle Administrator kann diese Art von Datensatz löschen.';
        translation['l10n.noPagePrivilege'] = 'Sie haben keine Berechtigung, diese Seite anzusehen.';
        translation['dq.pdfemail.folderName'] = 'Mahnungen als PDF zum Drucken';
        translation['dq.pdfemail.subject'] = 'Die erzeugten PDF-Mahnungen stehen im Archiv zum Drucken zur Verfügung.';
        translation['dq.pdfemail.link'] = 'Klicken Sie auf den Link, um den Ordner mit den PDF-Briefen anzuzeigen:';
        translation['dq.pdfemail.tableHead'] = 'Die folgende Tabelle enthält Details zu den Ordnern, in denen die PDF-Dateien gespeichert sind.';
        translation['dq.pdfemail.exceedLimit'] = 'Die erzeugten Dateien konnten nicht angehängt werden, weil das Anlagenlimit überschritten wurde.';
        translation['dq.pdfemail.tableLabel1'] = 'Ordner';
        translation['dq.pdfemail.tableLabel2'] = 'Pfad';
        translation['dq.pdfemail.tableLabel3'] = 'Status';
        translation['dq.pdfemail.tableLabel4'] = 'Anmerkungen';

        break;

      case 'es_AR':
      case 'es-AR':
        translation['dsa.response.none_found'] = 'No hay procedimientos de reclamos disponibles.';
        translation['form.dunning_template.title'] = 'Plantilla de reclamos';
        translation['field.template.name'] = 'Nombre';
        translation['field.template.description'] = 'Descripción';
        translation['field.template.attachStatement'] = 'Adjuntar estado de cuenta';
        translation['field.template.overdue_invoices_stmt'] = 'Solo facturas atrasadas en el estado de cuenta';
        translation['field.template.inactive'] = 'Inactivo';
        translation['field.template.attach_invoice_copy'] = 'Adjuntar copias de facturas';
        translation['field.template.only_overdue_invoices'] = 'Solo facturas atrasadas';
        translation['field.template.subject'] = 'Asunto';
        translation['selection.template.savedsearch'] = 'Búsqueda guardada';
        translation['selection.template.searchcolumn'] = 'Columna de búsqueda';
        translation['label.template.lettertext'] = 'Texto de la carta';
        translation['dba.form.title'] = 'Asignación de reclamos en cantidad';
        translation['dba.form.source'] = 'Se aplica a';
        translation['dba.form.procedure'] = 'Procedimiento de reclamo';
        translation['dba.form.source.help'] = 'Se aplica a';
        translation['dba.form.procedure.help'] = 'Procedimiento de reclamo';
        translation['dba.form.dunning_manager'] = 'Gerente de reclamos';
        translation['dba.form.dunning_manager.help'] = 'Gerente de reclamos';
        translation['dba.tab.invoice'] = 'Facturas';
        translation['dba.sublist.invoice'] = 'Facturas';
        translation['dba.tab.customer'] = 'Clientes';
        translation['dba.sublist.customer'] = 'Clientes';
        translation['dba.sublist.common.id'] = 'ID';
        translation['dba.sublist.common.customer'] = 'Cliente';
        translation['dba.sublist.invoice.invoice'] = 'Factura';
        translation['dba.sublist.invoice.amount'] = 'Importe';
        translation['dba.sublist.invoice.currency'] = 'Moneda';
        translation['dba.sublist.invoice.duedate'] = 'Fecha de vencimiento';
        translation['dba.sublist.invoice.days_overdue'] = 'Días de retraso';
        translation['dba.sublist.customer.subsidiary'] = 'Subsidiaria';
        translation['dba.sublist.common.assign_dunning'] = 'Asignar';
        translation['dba.sublist.common.dunning_procedure'] = 'Procedimiento de reclamo';
        translation['dba.sublist.common.dunning_level'] = 'Nivel de reclamo';
        translation['dba.sublist.common.last_letter_sent'] = 'Fecha de envío de la última carta';
        translation['dba.sublist.common.dunning_sending_type'] = 'Tipo de envío';
        translation['dba.sublist.common.page_next'] = '>';
        translation['dba.sublist.common.page_previous'] = '<';
        translation['dba.sublist.common.page_option'] = '{startIndex} - {endIndex} de {totalEntryCount}';
        translation['dba.form.restriction'] = 'Criterios de selección';
        translation['dba.form.selection'] = 'Selección de procedimientos de reclamo';
        translation['dba.form.restriction.subsidiary'] = 'Subsidiarias';
        translation['dba.form.restriction.location'] = 'Ubicaciones';
        translation['dba.form.restriction.dept'] = 'Departamentos';
        translation['dba.form.restriction.class'] = 'Clases';
        translation['dba.form.restriction.search'] = 'Búsqueda guardada';
        translation['dba.form.action.assign'] = 'Asignar';
        translation['dba.form.action.assign_customer'] = 'Asignar a clientes';
        translation['dba.form.action.assign_invoice'] = 'Asignar a facturas';
        translation['dba.form.action.cancel'] = 'Cancelar';
        translation['dba.form.notification.highnumberofrecord'] = 'Esta solicitud puede tardar unos segundos en completar. Espere y será redirigido a la página de Procedimiento de reclamos.';
        translation['dqf.form.action.send'] = 'Enviar';
        translation['dqf.form.action.print'] = 'Imprimir';
        translation['dqf.form.action.remove'] = 'Eliminar';
        translation['dqf.form.send.title'] = 'Cola de envío de correos electrónicos de reclamo';
        translation['dqf.form.print.title'] = 'Cola de impresión de reclamos en PDF';
        translation['dqf.filter.fieldGroup'] = 'Filtros';
        translation['dqf.filter.inlineHelp'] = 'Use los filtros para ser más específico en su búsqueda o para restringir los resultados que se muestran.';
        translation['dqf.filter.applyFiltersButton'] = 'Buscar';
        translation['dqf.filter.customer'] = 'Cliente';
        translation['dqf.filter.recipient'] = 'Destinatario';
        translation['dqf.filter.procedure'] = 'Procedimiento de reclamo';
        translation['dqf.filter.dpLevel'] = 'Nivel de reclamo';
        translation['dqf.filter.appliesTo'] = 'Se aplica a';
        translation['dqf.filter.allowPrint'] = 'Permitir impresión';
        translation['dqf.filter.allowEmail'] = 'Permitir correo electrónico';
        translation['dqf.filter.lastLtrSentStart'] = 'Fecha de inicio de última carta enviada';
        translation['dqf.filter.lastLtrSentEnd'] = 'Fecha de finalización de última carta enviada';
        translation['dqf.filter.evalDateStart'] = 'Fecha de inicio de evaluación';
        translation['dqf.filter.evalDateEnd'] = 'Fecha de finalización de evaluación';
        translation['dqf.filter.boolean.yes'] = 'Sí';
        translation['dqf.filter.boolean.no'] = 'No';
        translation['dqf.sublist.send.title'] = 'Cola de envío de correos electrónicos de reclamo';
        translation['dqf.sublist.print.title'] = 'Cola de impresión de reclamos en PDF';
        translation['dqf.sublist.common.customer'] = 'Cliente';
        translation['dqf.sublist.common.mark'] = 'Marcar';
        translation['dqf.sublist.common.view'] = 'Ver';
        translation['dqf.sublist.common.id'] = 'ID';
        translation['dqf.sublist.dp.applies_to'] = 'Se aplica a';
        translation['dqf.sublist.common.dunning_procedure'] = 'Procedimiento de reclamo';
        translation['dqf.sublist.common.dunning_level'] = 'Nivel';
        translation['dqf.sublist.record.last_letter_sent'] = 'Última carta enviada';
        translation['dqf.sublist.record.dunning_allow_email'] = 'Permitir correo electrónico';
        translation['dqf.sublist.record.dunning_allow_print'] = 'Permitir impresión';
        translation['dqf.sublist.record.pause_dunning'] = 'Detener reclamo';
        translation['dqf.sublist.common.evaluation_date'] = 'Fecha de evaluación';
        translation['dqf.sublist.common.related_entity'] = 'Destinatario';
        translation['dbu.form.title'] = 'Registros de clientes de actualización masiva para reclamos';
        translation['dbu.form.update_button'] = 'Actualizar';
        translation['dbu.form.field.subsidiary'] = 'Subsidiaria';
        translation['dbu.form.flh.subsidiary'] = 'Seleccione la subsidiaria para el cual quiere realizar una actualización masiva de los campos de reclamos en los registros de clientes. Las actualizaciones se aplicarán a todos los registros de clientes que pertenezcan a la subsidiaria seleccionada.';
        translation['dbu.form.field.allow_email'] = 'Permitir que se envíen las cartas por correo electrónico';
        translation['dbu.form.flh.allow_email'] = 'Seleccione un valor para que se aplique a este campo en los registros de clientes luego de realizar la actualización masiva:\nSin modificaciones: el valor actual del campo no cambiará. \nMarcada: La casilla se marcará en los registros de clientes luego de la actualización masiva. \nDesmarcada: La casilla quedará sin marcar luego de la actualización.';
        translation['dbu.form.field.allow_print'] = 'Permitir que se impriman las cartas';
        translation['dbu.form.flh.allow_print'] = 'Seleccione un valor para que se aplique a este campo en los registros de clientes luego de realizar la actualización masiva:\nSin modificaciones: el valor actual del campo no cambiará. \nMarcada: La casilla se marcará en los registros de clientes luego de la actualización masiva. \nDesmarcada: La casilla quedará sin marcar luego de la actualización.';
        translation['dbu.form.field.dont_send_cust_email'] = 'No enviar cartas al correo electrónico de los clientes';
        translation['dbu.form.flh.dont_send_cust_email'] = 'Seleccione un valor para que se aplique a este campo en los registros de clientes luego de realizar la actualización masiva:\nSin modificaciones: el valor actual del campo no cambiará. \nMarcada: La casilla se marcará en los registros de clientes luego de la actualización masiva. \nDesmarcada: La casilla quedará sin marcar luego de la actualización.';
        translation['dbu.form.primary_field_group'] = 'Criterios';
        translation['dbu.form.bulk_update_field_group'] = 'Actualización masiva de campos';
        translation['dbu.form.options.unchanged'] = '- Sin cambiar -';
        translation['dbu.form.options.checked'] = 'Marcado';
        translation['dbu.form.options.not_checked'] = 'Sin verificar';
        translation['dbu.validation.no_selection'] = 'No hay campos para actualizar porque se seleccionó - Sin cambiar - para todos los campos. Se puede realizar una actualización masiva si se especifica un cambio en un segmento como mínimo (Marcado o Desmarcado).';
        translation['dbu.validation.no_sending_media'] = 'Los registros de los clientes no se pueden guardar si las casillas Permitir el envío de cartas por correo electrónico y Permitir la impresión de cartas están desmarcadas. Seleccione Marcado en uno o ambos de los siguientes campos: \n- Permitir el envío de cartas por correo electrónico\n- Permitir la impresión de cartas';
        translation['dbu.validation.verify_submit_ow'] = 'Todos los registros de clientes con procedimientos de reclamos se actualizarán para la subsidiaria seleccionada {SUBSIDIARY}. Recibe un mensaje por correo electrónico cuando el proceso finaliza. ¿Está seguro de que desea continuar con la actualización masiva? Si hace clic en Aceptar, comenzará el proceso de actualización masiva y no podrá volver atrás.';
        translation['dbu.validation.verify_submit_si'] = 'Se actualizarán todos los registros con procedimientos de reclamo. Recibe un mensaje por correo electrónico cuando el proceso finaliza. ¿Está seguro de que desea continuar con la actualización masiva? Si hace clic en Aceptar, comenzará el proceso de actualización masiva y no podrá volver atrás.';
        translation['dbu.form.reminderinlinehelp'] = 'NetSuite recomienda utilizar la función de actualización masiva fuera del horario de trabajo normal. Esto asegura que no haya otros usuarios de la compañía actualizando los registros de clientes durante el proceso de actualización masiva.';
        translation['dbu.validation.validate_concurrency_ow'] = 'El usuario {USER} inició un proceso de actualización masiva de registros de clientes con reclamos para la subsidiaria, {SUBSIDIARY}. La actualización masiva se debe completar antes de poder realizar otra actualización masiva de clientes para la misma subsidiaria.';
        translation['dbu.validation.validate_concurrency_si'] = 'El sistema solo puede ejecutar una actualización masiva a la vez. Se está ejecutando una actualización masiva iniciada por {USER}.';
        translation['dbu.customer.message.complete_subject'] = 'Actualización masiva de registros de clientes para reclamos';
        translation['dbu.customer.message.complete_body_ow'] = [
          'Saludos de NetSuite.<br />',
          'La actualización masiva de los registros de clientes con reclamos se completó para la subsidiaria, {SUBSIDIARY}.',
          'Permitir que se envíen las cartas por correo electrónico = {ALLOW_EMAIL}',
          'Permitir que se impriman las cartas = {ALLOW_PRINT}',
          'No enviar cartas al correo electrónico de los clientes = {DONT_SEND_TO_CUST}<br />',
          'Se actualizó el número de registros de clientes: {PROCESSED_RECORDS} de {RECORD_COUNT}.{ERROR_STEPS}',
          'Este correo electrónico fue originado por el sistema.<br />',
          'Gracias,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.complete_body_si'] = [
          'Saludos de NetSuite.<br />',
          'La actualización masiva de los registros de clientes con reclamos se completó.',
          'Permitir que se envíen las cartas por correo electrónico = {ALLOW_EMAIL}',
          'Permitir que se impriman las cartas = {ALLOW_PRINT}',
          'No enviar cartas al correo electrónico de los clientes = {DONT_SEND_TO_CUST}<br />',
          'Se actualizó el número de registros de clientes: {PROCESSED_RECORDS} de {RECORD_COUNT}.{ERROR_STEPS}',
          'Este correo electrónico fue originado por el sistema.<br />',
          'Gracias,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.error_file_header'] = 'ID de cliente,Error';
        translation['dbu.customer.message.error_filename'] = 'Actualizaciones fallidas.csv';
        translation['dbu.customer.message.error_steps'] = '<br />Descargue el archivo adjunto para ver la lista de registros que no se actualizó. Puede actualizar estos registros en forma manual.';
        translation['dc.validateCustomer.noDPMatched'] = 'No se encontraron procedimientos de reclamo que coincidan con el registro del cliente.';
        translation['dc.validateCustomer.recipientNoEmail'] = 'Los siguientes destinatarios de cartas de reclamo no poseen una dirección de correo electrónico en sus registros de contacto: {CONTACTNAMES}.';
        translation['dc.validateCustomer.customerNoEmail'] = 'No se puede guardar el registro. La casilla Permitir el envío de cartas por correo electrónico está marcada, pero no hay una dirección de correo electrónico o un destinatario del reclamo a quién enviar las cartas. Para guardar este registro se deben cumplir las siguientes condiciones:\n- La subficha Destinatarios de reclamos tiene al menos un contacto con dirección de correo electrónico.\n- El campo Correo electrónico del registro del cliente tiene una dirección de correo electrónico.\n\nNota: La dirección de correo electrónico del cliente es necesaria solo si la casilla No enviar cartas al cliente por correo electrónico no está marcada.';
        translation['dc.validateCustomer.noEmailAtAll'] = 'No hay direcciones de correo electrónico en el registro del cliente, y no hay ningún destinatario de la carta de reclamo especificado para este cliente. Escriba una dirección de correo electrónico en el registro del cliente o, en la subficha Reclamo, seleccione como mínimo un destinatario de la carta de reclamo que posea una dirección de correo electrónico.';
        translation['dc.validateCustomer.recipientListEmpty'] = 'No se puede guardar el registro. La casilla Permitir el envío de cartas por correo electrónico está marcada, pero no hay un destinatario del reclamo a quién enviar las cartas. Para guardar este registro, la ficha Destinatarios de reclamos debe tener al menos un contacto con dirección de correo electrónico. \n\nNota: La dirección de correo electrónico del cliente es necesaria solo si la casilla No enviar cartas al cliente por correo electrónico no está marcada.';
        translation['dc.validateCustomer.dpMatched'] = 'El registro de clientes coincide con el procedimiento de reclamo \'{DP}\'. ¿Desea modificar el procedimiento de reclamo? ';
        translation['dc.validateCustomer.dpAllReadyAssigned'] = 'El procedimiento de reclamo encontrado es el mismo que el procedimiento de reclamo que ya se asignó en el registro.';
        translation['dc.validateDP.managerRequired'] = 'Se requiere un gerente de reclamos.';
        translation['dc.validateDP.sendingModeRequired'] = 'Se debe marcar cómo mínimo una de las siguientes casillas:\n- Permitir que se envíen las cartas por correo electrónico\n- Permitir que se impriman las cartas';
        translation['dl.validateDL.dlCountExceeded'] = 'Superó la cantidad máxima de niveles de reclamo posibles.';
        translation['dl.validateDL.lowerDaysOverDue'] = 'La cantidad de días de retraso debe ser inferior a {DAYS}.';
        translation['dl.validateDL.higherDaysOverdue'] = 'La cantidad de días de retraso debe ser superior a {DAYS}.';
        translation['dl.validateDL.daysOverdueExist'] = 'La cantidad de días de retraso {DAYS} ya se encuentra en otra línea.';
        translation['dl.validateDL.lastRecordDeletion'] = 'Solo puede eliminar el último registro de la lista.';
        translation['dl.validateDL.daysBetSending'] = 'Los días entre el envío de cartas deben ser mayores o iguales a {DAYS}';
        translation['dl.validateDL.minOutsBalGEZero'] = 'El importe pendiente mínimo debe ser al menos cero (0).';
        translation['dl.validateDL.daysOverdueLessPrevious'] = 'Los días de retraso en el Nivel de Reclamo {LEVEL} ({LEVEL_OVERDUE} días) deben ser inferiores al Nivel de Reclamo {PREVLEVEL} ({PREVLEVEL_OVERDUE} días).';
        translation['dl.validateDL.dlRequired'] = 'Se requiere como mínimo un nivel de reclamo.';
        translation['dp.validateDP.editNotAllowed'] = 'No está autorizado a editar un tipo de procedimiento de reclamo.';
        translation['dp.information.possibleMultipleSending'] = 'Deshabilitar el campo Intervalo mínimo de reclamo permitirá que su cuenta envíe varias cartas de reclamo a un cliente durante un día. ¿Desea realmente deshabilitarlo?';
        translation['dba.pagination.failedPrevPage'] = 'No se pudo ir a la página anterior.';
        translation['dq.validation.str_send'] = 'enviar';
        translation['dq.validation.str_remove'] = 'eliminar';
        translation['dq.validation.str_print'] = 'imprimir';
        translation['dq.validation.chooseAction'] = 'Elija una carta para ';
        translation['dq.validation.removalConfirmation'] = '¿Está seguro de que desea eliminar los registros seleccionados de la cola?';
        translation['dq.pt.dunningQueueTitle'] = 'Reclamos en cola';
        translation['dq.pt.source'] = 'Tipo de origen';
        translation['dq.pt.dunningProcedure'] = 'Procedimiento de reclamo';
        translation['dq.pt.dunningLevel'] = 'Nivel de reclamo';
        translation['dq.pt.lastLetterSent'] = 'Última carta enviada';
        translation['dq.pt.emailingAllowed'] = 'Se permite el envío de correos electrónicos';
        translation['dq.pt.printingAllowed'] = 'Se permite imprimir';
        translation['dq.pt.send'] = 'Enviar';
        translation['dq.pt.remove'] = 'Eliminar';
        translation['dq.pt.print'] = 'Imprimir';
        translation['dq.pt.customer'] = 'Cliente';
        translation['dt.validator.invalidDefault'] = 'Debe haber una plantilla predeterminada seleccionada para cada uno de los tipos de plantilla de reclamo. Controle las subfichas Correo electrónico y PDF y seleccione una Plantilla predeterminada.';
        translation['dt.validator.duplicateLanguage'] = 'Este idioma ya está en uso para este tipo de plantilla.';
        translation['dt.validator.noTemplateDocs'] = 'Para guardar este registro, debe haber al menos un documento de plantilla de correo electrónico y un documento de plantilla de PDF.';
        translation['dt.validator.subject'] = 'Error en la validación del documento de plantilla de reclamo';
        translation['dt.validator.body'] = 'Los siguientes documentos de plantilla no son válidos:';
        translation['dt.validator.defaultDeletion'] = 'Está intentado eliminar una plantilla que se encuentra seleccionada como predeterminada. Para eliminar esta plantilla primero debe seleccionar una plantilla distinta como plantilla predeterminada.';
        translation['dt.validator.xmlEmailDeprecated'] = 'No puede añadir, editar ni eliminar líneas de plantilla de correo electrónico XML. El uso de plantillas de correo electrónico de reclamo basadas en XML se está dejando de lado en forma gradual. Si agrega plantillas de correo electrónico a la subficha Plantilla de correo electrónico de reclamo y guarda este registro, se borrarán todas las líneas de la subficha Plantilla de correo electrónico de reclamo XML.';
        translation['dt.validator.deleteAllXMLLines'] = 'Guardar este registro hará que se borren todas las líneas de la subficha Plantilla de correo electrónico de reclamo XML. ';
        translation['dt.validator.noEMailDocs'] = 'Debe haber al menos una plantilla de correo electrónico para poder guardar este registro.';
        translation['dt.validator.noPDFDocs'] = 'Debe haber al menos una plantilla de PDF para poder guardar este registro.';
        translation['dt.validator.multipleDefault'] = '¿Está seguro de que desea usar esta plantilla como predeterminada?';
        translation['dlr.validateDLR.noAmount'] = 'La Regla de nivel de reclamo debe tener como mínimo una Cantidad de reglas de nivel de reclamo.';
        translation['dlr.validateDLR.noDefaultAmount'] = 'La Regla de nivel de reclamo debe tener como mínimo una Cantidad de reglas de nivel de reclamo definida como la cantidad Predeterminada.';
        translation['dlr.validateDLR.duplicateCurrency'] = 'La moneda debe ser única.';
        translation['dlr.validateDLR.invalidAmount'] = 'La cantidad debe ser mayor o igual a 0.';
        translation['dlr.validateDLR.changeDefaultCurrency'] = '¿Está seguro de que desea usar esta moneda y cantidad de línea como el valor predeterminado? (Esto modificará el importe y la moneda predeterminados actuales)';
        translation['dlr.validateDLR.negativeDaysOverdue'] = 'El campo Días de retraso contiene un número negativo. Esto enviará una carta al cliente antes de que venza el pago.';
        translation['dlr.validateDLR.daysOverdueChanged'] = 'Cambiar el valor de Días Vencidos en una regla de nivel de requerimiento de pago puede cambiar la secuencia u orden de los niveles de requerimiento de pago, que a su vez puede activar el envío de cartas de requerimiento de pago inapropiadas.\n\n Se recomienda que compruebe el orden de niveles de requerimiento de pago en cada procedimiento de requerimiento ({DP_LIST}) donde el nivel de requerimiento que desea cambiar está en uso.';
        translation['dlr.validateDLR.cannotAddCurrency'] = 'La moneda no se puede agregar porque la función Monedas múltiples no está habilitada.';
        translation['der.flh.dunningProcedure'] = 'Este campo indica el procedimiento de reclamo asignado a la factura o al cliente.';
        translation['der.flh.dunningLevel'] = 'Este campo indica el nivel de reclamo actual después de la evaluación.';
        translation['der.flh.relatedEntity'] = 'Este campo está vinculado con la entidad o el registro de contacto del destinatario de reclamo.';
        translation['der.flh.messageContent'] = 'Este campo contiene el contenido de la carta de reclamo.';
        translation['der.flh.invoiceList'] = 'Este campo enumera las facturas asociadas con la carta de reclamo. ';
        translation['der.flh.emailRecipient'] = 'Este campo muestra las direcciones de correo electrónico de los destinatarios de la carta de reclamo.';
        translation['der.flh.subject'] = 'Este campo muestra la línea de asunto de la carta de reclamo.';
        translation['der.flh.dunningManager'] = 'Este campo muestra al gerente de reclamos asignado al cliente y se vincula con el registro de empleados del gerente de reclamos.';
        translation['der.flh.dunningTemplate'] = 'Este campo se vincula con el registro de plantillas de reclamos.';
        translation['der.flh.customer'] = 'Este campo se vincula con el registro de clientes.';
        translation['der.flh.status'] = 'Este campo indica si el correo electrónico se envió o no correctamente. El estado puede ser uno de los siguientes:\n\n• Enviado: el correo electrónico se envió correctamente.\n• Error: el sistema no puedo enviar el correo electrónico por falta de información. Un ejemplo es cuando no hay una dirección de correo electrónico para el cliente o el contacto.\n• En cola: la carta de reclamo aún se encuentra en la cola de reclamos y no se ha procesado.\n• Eliminado: el gerente de reclamos eliminó este registro de la cola de reclamos.';
        translation['dlr.flh.daysOverdue'] = 'Escriba la cantidad de días transcurridos a partir de la fecha de vencimiento de pago en la que se debe enviar una carta de reclamo. Para enviar una carta antes de la fecha de vencimiento, escriba un número negativo.';
        translation['ds.flh.description'] = 'Escriba una descripción para este registro.';
        translation['dp.flh.dunningProcedure'] = 'Escriba un nombre para este procedimiento de reclamo.';
        translation['dp.flh.description'] = 'Escriba una descripción para este procedimiento de reclamo.';
        translation['dp.flh.appliesTo'] = 'Seleccione si este procedimiento de reclamo se asignará a clientes o facturas. Si selecciona Cliente, también debe activar o desactivar la casilla Permitir anulación. ';
        translation['dp.flh.sendingSchedule'] = 'Seleccione si el envío de las cartas de reclamo será automático o manual.';
        translation['dp.flh.minimumDunningInterval'] = 'Seleccione la cantidad mínima de días que deben transcurrir entre el envío de dos cartas consecutivas al mismo cliente. Esto se aplica tanto a envíos manuales como automáticos.';
        translation['dp.flh.subsidiary'] = 'Seleccione las subsidiarias a las que se aplica este procedimiento de reclamo.';
        translation['dp.flh.savedSearchCustomer'] = 'Seleccione la búsqueda guardada de clientes a la que se aplica este procedimiento.';
        translation['dp.flh.allowOverride'] = 'Si marca esta casilla, un procedimiento de reclamo a nivel de factura puede anular este procedimiento. Un procedimiento de reclamo a nivel de factura se utilizará si una factura cumple con los criterios para ese procedimiento, independientemente de que se haya asignado un procedimiento de reclamo a nivel de cliente.';
        translation['dp.flh.department'] = 'Seleccione los departamentos a los que se aplica este procedimiento.  ';
        translation['dp.flh.class'] = 'Seleccione las clases a las que se aplica este procedimiento.';
        translation['dp.flh.location'] = 'Seleccione las ubicaciones a las que se aplica este procedimiento.';
        translation['dp.flh.savedSearchInvoice'] = 'Seleccione la búsqueda guardada de facturas a la que se aplica este procedimiento.';
        translation['dp.flh.assignAutomatically'] = 'Marque esta casilla para permitir que el sistema asigne automáticamente este procedimiento de reclamo a clientes o facturas en función de los criterios de selección.';
        translation['dt.flh.name'] = 'Escriba un nombre para esta plantilla de reclamo.';
        translation['dt.flh.description'] = 'Escriba una descripción para esta plantilla de reclamo.';
        translation['dt.flh.attachStatement'] = 'Marque esta casilla para adjuntar estados de cuenta de clientes a cartas de reclamo que usen esta plantilla. ';
        translation['dt.flh.attachInvoiceCopy'] = 'Marque esta casilla para adjuntar facturas a cartas de reclamo que usen esta plantilla.';
        translation['dt.flh.overdueInvoiceOnly'] = 'Marque esta casilla si desea adjuntar solo facturas atrasadas.';
        translation['dt.flh.openTransactionOnly'] = 'Marque esta casilla si desea incluir solo las transacciones abiertas en los estados de cuenta de clientes.';
        translation['dt.flh.inactive'] = 'Marque esta casilla para desactivar la plantilla. Las plantillas desactivadas no aparecen en las listas y no pueden utilizarse para enviar cartas de reclamo.';
        translation['dc.flh.allowEmail'] = 'Marque esta casilla si desea enviar las cartas de reclamo por correo electrónico.';
        translation['dc.flh.lastLetterSent'] = 'La fecha de envío de la última carta de reclamo.';
        translation['dc.flh.dunningLevel'] = 'Este campo muestra el nivel de reclamo actual desde la última evaluación de reclamos.';
        translation['dc.flh.dunningManager'] = 'Seleccione a la persona responsable para el reclamo del cliente y el nombre de quien debe aparecer como remitente de la carta de reclamo.';
        translation['dc.flh.dunningProcedure'] = 'Este campo muestra el procedimiento de reclamo asignado al cliente. Si hace clic en Asignar automáticamente, el sistema asigna el procedimiento apropiado en función de los criterios de selección de reclamo. Seleccione un valor diferente de la lista desplegable para modificar el procedimiento de reclamo asignado al cliente. La lista desplegable muestra solo los procedimientos de reclamo que se aplican a este cliente según los criterios de selección definidos en los registros de procedimientos de reclamo. ';
        translation['dc.flh.allowPrint'] = 'Marque esta casilla si desea imprimir las cartas de reclamo.';
        translation['dc.flh.pauseReason'] = 'Seleccione un motivo para indicar por qué se detuvo el reclamo.';
        translation['dc.flh.pauseReasonDetail'] = 'Seleccione un detalle para indicar por qué se detuvo el reclamo.';
        translation['dc.flh.pauseDunning'] = 'Marque esta casilla para detener temporalmente el proceso de reclamo.';
        translation['dc.flh.dunningRecepients'] = 'Seleccione destinatarios de reclamo adicionales.';
        translation['dc.flh.allowEmail'] = 'Marque esta casilla si desea enviar las cartas de reclamo por correo electrónico.';
        translation['di.flh.lastLetterSent'] = 'La fecha de envío de la última carta de reclamo.';
        translation['di.flh.dunningLevel'] = 'Este campo muestra el nivel de reclamo actual desde la última evaluación de reclamos.';
        translation['di.flh.dunningManager'] = 'Seleccione a la persona responsable para el reclamo de la factura y el nombre de quien debe aparecer como remitente de la carta de reclamo.';
        translation['di.flh.dunningProcedure'] = 'Este campo muestra el procedimiento de reclamo asignado a la factura. Si hace clic en Asignar automáticamente, el sistema asigna el procedimiento apropiado en función de los criterios de selección de reclamo. Seleccione un valor diferente de la lista desplegable para modificar el procedimiento de reclamo asignado a la factura. La lista desplegable muestra solo los procedimientos de reclamo que se aplican a esta factura según los criterios de selección definidos en los registros de procedimientos de reclamo. ';
        translation['di.flh.allowPrint'] = 'Marque esta casilla si desea imprimir las cartas de reclamo.';
        translation['di.flh.pauseReason'] = 'Seleccione un motivo para indicar por qué se detuvo el reclamo.';
        translation['di.flh.pauseReasonDetail'] = 'Seleccione un detalle del motivo para indicar por qué se detuvo el reclamo.';
        translation['di.flh.pauseDunning'] = 'Marque esta casilla para detener temporalmente el proceso de reclamo.';
        translation['dp.validate.unpause'] = 'La desactivación de la casilla Detener reclamo automáticamente desencadena el flujo de trabajo de evaluación de reclamos. NetSuite puede enviar una carta de reclamo al cliente según el resultado de la evaluación de reclamos. ¿Está seguro de que desea reanudar el reclamo?';
        translation['dc.validateSubsidiary.existingConfigSubsidiary'] = 'Ya existe un registro de configuración de reclamos para esta subsidiaria.';
        translation['l10n.address.invalidPOBox'] = 'Introduzca un número de apartado postal válido.';
        translation['l10n.address.invalidZipCode'] = 'Introduzca un código postal válido.';
        translation['l10n.address.invalidRuralRoute'] = 'Introduzca un valor de ruta rural válido.';
        translation['l10n.accessForDDandAccountant'] = 'Solo los roles Administrador, Director de reclamos y Contador pueden crear y modificar este tipo de registros.';
        translation['l10n.deleteAccessForDDandAccountant'] = 'Solo los roles Administrador, Director de reclamos y Contador pueden eliminar este tipo de registros.';
        translation['l10n.accessForAdministrator'] = 'Solo el rol Administrador puede crear y modificar este tipo de registros.';
        translation['l10n.deleteAccessForAdministrator'] = 'Solo el rol Administrador puede eliminar este tipo de registros.';
        translation['l10n.noPagePrivilege'] = 'No tiene privilegios para ver esta página.';
        translation['dq.pdfemail.folderName'] = 'Cartas de cobranza en PDF para impresión';
        translation['dq.pdfemail.subject'] = 'Las cartas de cobranza generadas en PDF están disponibles para impresión en el gabinete de archivos.';
        translation['dq.pdfemail.link'] = 'Haga clic en el vínculo para ver la carpeta de las cartas en PDF:';
        translation['dq.pdfemail.tableHead'] = 'La siguiente tabla ofrece detalles de las carpetas donde los archivos PDF se almacenan.';
        translation['dq.pdfemail.exceedLimit'] = 'Los archivos generados no se pudieron adjuntar debido a que se excedió el límite de adjuntos.';
        translation['dq.pdfemail.tableLabel1'] = 'Carpetas';
        translation['dq.pdfemail.tableLabel2'] = 'Ruta';
        translation['dq.pdfemail.tableLabel3'] = 'Estado';
        translation['dq.pdfemail.tableLabel4'] = 'Notas';

        break;

      case 'es_ES':
      case 'es-ES':
        translation['dsa.response.none_found'] = 'No hay procedimientos de reclamos disponibles.';
        translation['form.dunning_template.title'] = 'Plantilla de reclamos';
        translation['field.template.name'] = 'Nombre';
        translation['field.template.description'] = 'Descripción';
        translation['field.template.attachStatement'] = 'Adjuntar estado de cuenta';
        translation['field.template.overdue_invoices_stmt'] = 'Solo facturas atrasadas en el estado de cuenta';
        translation['field.template.inactive'] = 'Inactivo';
        translation['field.template.attach_invoice_copy'] = 'Adjuntar copias de facturas';
        translation['field.template.only_overdue_invoices'] = 'Solo facturas atrasadas';
        translation['field.template.subject'] = 'Asunto';
        translation['selection.template.savedsearch'] = 'Búsqueda guardada';
        translation['selection.template.searchcolumn'] = 'Columna de búsqueda';
        translation['label.template.lettertext'] = 'Texto de la carta';
        translation['dba.form.title'] = 'Asignación de reclamos en cantidad';
        translation['dba.form.source'] = 'Se aplica a';
        translation['dba.form.procedure'] = 'Procedimiento de reclamo';
        translation['dba.form.source.help'] = 'Se aplica a';
        translation['dba.form.procedure.help'] = 'Procedimiento de reclamo';
        translation['dba.form.dunning_manager'] = 'Gerente de reclamos';
        translation['dba.form.dunning_manager.help'] = 'Gerente de reclamos';
        translation['dba.tab.invoice'] = 'Facturas';
        translation['dba.sublist.invoice'] = 'Facturas';
        translation['dba.tab.customer'] = 'Clientes';
        translation['dba.sublist.customer'] = 'Clientes';
        translation['dba.sublist.common.id'] = 'ID';
        translation['dba.sublist.common.customer'] = 'Cliente';
        translation['dba.sublist.invoice.invoice'] = 'Factura';
        translation['dba.sublist.invoice.amount'] = 'Importe';
        translation['dba.sublist.invoice.currency'] = 'Moneda';
        translation['dba.sublist.invoice.duedate'] = 'Fecha de vencimiento';
        translation['dba.sublist.invoice.days_overdue'] = 'Días de retraso';
        translation['dba.sublist.customer.subsidiary'] = 'Subsidiaria';
        translation['dba.sublist.common.assign_dunning'] = 'Asignar';
        translation['dba.sublist.common.dunning_procedure'] = 'Procedimiento de reclamo';
        translation['dba.sublist.common.dunning_level'] = 'Nivel de reclamo';
        translation['dba.sublist.common.last_letter_sent'] = 'Fecha de envío de la última carta';
        translation['dba.sublist.common.dunning_sending_type'] = 'Tipo de envío';
        translation['dba.sublist.common.page_next'] = '>';
        translation['dba.sublist.common.page_previous'] = '<';
        translation['dba.sublist.common.page_option'] = '{startIndex} - {endIndex} de {totalEntryCount}';
        translation['dba.form.restriction'] = 'Criterios de selección';
        translation['dba.form.selection'] = 'Selección de procedimientos de reclamo';
        translation['dba.form.restriction.subsidiary'] = 'Subsidiarias';
        translation['dba.form.restriction.location'] = 'Ubicaciones';
        translation['dba.form.restriction.dept'] = 'Departamentos';
        translation['dba.form.restriction.class'] = 'Clases';
        translation['dba.form.restriction.search'] = 'Búsqueda guardada';
        translation['dba.form.action.assign'] = 'Asignar';
        translation['dba.form.action.assign_customer'] = 'Asignar a clientes';
        translation['dba.form.action.assign_invoice'] = 'Asignar a facturas';
        translation['dba.form.action.cancel'] = 'Cancelar';
        translation['dba.form.notification.highnumberofrecord'] = 'Esta solicitud puede tardar unos segundos en completar. Espere y será redirigido a la página de Procedimiento de reclamos.';
        translation['dqf.form.action.send'] = 'Enviar';
        translation['dqf.form.action.print'] = 'Imprimir';
        translation['dqf.form.action.remove'] = 'Eliminar';
        translation['dqf.form.send.title'] = 'Cola de envío de correos electrónicos de reclamo';
        translation['dqf.form.print.title'] = 'Cola de impresión de reclamos en PDF';
        translation['dqf.filter.fieldGroup'] = 'Filtros';
        translation['dqf.filter.inlineHelp'] = 'Use los filtros para ser más específico en su búsqueda o para restringir los resultados que se muestran.';
        translation['dqf.filter.applyFiltersButton'] = 'Buscar';
        translation['dqf.filter.customer'] = 'Cliente';
        translation['dqf.filter.recipient'] = 'Destinatario';
        translation['dqf.filter.procedure'] = 'Procedimiento de reclamo';
        translation['dqf.filter.dpLevel'] = 'Nivel de reclamo';
        translation['dqf.filter.appliesTo'] = 'Se aplica a';
        translation['dqf.filter.allowPrint'] = 'Permitir impresión';
        translation['dqf.filter.allowEmail'] = 'Permitir correo electrónico';
        translation['dqf.filter.lastLtrSentStart'] = 'Fecha de inicio de última carta enviada';
        translation['dqf.filter.lastLtrSentEnd'] = 'Fecha de finalización de última carta enviada';
        translation['dqf.filter.evalDateStart'] = 'Fecha de inicio de evaluación';
        translation['dqf.filter.evalDateEnd'] = 'Fecha de finalización de evaluación';
        translation['dqf.filter.boolean.yes'] = 'Sí';
        translation['dqf.filter.boolean.no'] = 'No';
        translation['dqf.sublist.send.title'] = 'Cola de envío de correos electrónicos de reclamo';
        translation['dqf.sublist.print.title'] = 'Cola de impresión de reclamos en PDF';
        translation['dqf.sublist.common.customer'] = 'Cliente';
        translation['dqf.sublist.common.mark'] = 'Marcar';
        translation['dqf.sublist.common.view'] = 'Ver';
        translation['dqf.sublist.common.id'] = 'ID';
        translation['dqf.sublist.dp.applies_to'] = 'Se aplica a';
        translation['dqf.sublist.common.dunning_procedure'] = 'Procedimiento de reclamo';
        translation['dqf.sublist.common.dunning_level'] = 'Nivel';
        translation['dqf.sublist.record.last_letter_sent'] = 'Última carta enviada';
        translation['dqf.sublist.record.dunning_allow_email'] = 'Permitir correo electrónico';
        translation['dqf.sublist.record.dunning_allow_print'] = 'Permitir impresión';
        translation['dqf.sublist.record.pause_dunning'] = 'Detener reclamo';
        translation['dqf.sublist.common.evaluation_date'] = 'Fecha de evaluación';
        translation['dqf.sublist.common.related_entity'] = 'Destinatario';
        translation['dbu.form.title'] = 'Registros de clientes de actualización masiva para reclamos';
        translation['dbu.form.update_button'] = 'Actualizar';
        translation['dbu.form.field.subsidiary'] = 'Subsidiaria';
        translation['dbu.form.flh.subsidiary'] = 'Seleccione la subsidiaria para el cual quiere realizar una actualización masiva de los campos de reclamos en los registros de clientes. Las actualizaciones se aplicarán a todos los registros de clientes que pertenezcan a la subsidiaria seleccionada.';
        translation['dbu.form.field.allow_email'] = 'Permitir que se envíen las cartas por correo electrónico';
        translation['dbu.form.flh.allow_email'] = 'Seleccione un valor para que se aplique a este campo en los registros de clientes luego de realizar la actualización masiva:\nSin modificaciones: el valor actual del campo no cambiará. \nMarcada: La casilla se marcará en los registros de clientes luego de la actualización masiva. \nDesmarcada: La casilla quedará sin marcar luego de la actualización.';
        translation['dbu.form.field.allow_print'] = 'Permitir que se impriman las cartas';
        translation['dbu.form.flh.allow_print'] = 'Seleccione un valor para que se aplique a este campo en los registros de clientes luego de realizar la actualización masiva:\nSin modificaciones: el valor actual del campo no cambiará. \nMarcada: La casilla se marcará en los registros de clientes luego de la actualización masiva. \nDesmarcada: La casilla quedará sin marcar luego de la actualización.';
        translation['dbu.form.field.dont_send_cust_email'] = 'No enviar cartas al correo electrónico de los clientes';
        translation['dbu.form.flh.dont_send_cust_email'] = 'Seleccione un valor para que se aplique a este campo en los registros de clientes luego de realizar la actualización masiva:\nSin modificaciones: el valor actual del campo no cambiará. \nMarcada: La casilla se marcará en los registros de clientes luego de la actualización masiva. \nDesmarcada: La casilla quedará sin marcar luego de la actualización.';
        translation['dbu.form.primary_field_group'] = 'Criterios';
        translation['dbu.form.bulk_update_field_group'] = 'Actualización masiva de campos';
        translation['dbu.form.options.unchanged'] = '- Sin cambiar -';
        translation['dbu.form.options.checked'] = 'Marcado';
        translation['dbu.form.options.not_checked'] = 'Sin verificar';
        translation['dbu.validation.no_selection'] = 'No hay campos para actualizar porque se seleccionó - Sin cambiar - para todos los campos. Se puede realizar una actualización masiva si se especifica un cambio en un segmento como mínimo (Marcado o Desmarcado).';
        translation['dbu.validation.no_sending_media'] = 'Los registros de los clientes no se pueden guardar si las casillas Permitir el envío de cartas por correo electrónico y Permitir la impresión de cartas están desmarcadas. Seleccione Marcado en uno o ambos de los siguientes campos: \n- Permitir el envío de cartas por correo electrónico\n- Permitir la impresión de cartas';
        translation['dbu.validation.verify_submit_ow'] = 'Todos los registros de clientes con procedimientos de reclamos se actualizarán para la subsidiaria seleccionada {SUBSIDIARY}. Recibe un mensaje por correo electrónico cuando el proceso finaliza. ¿Está seguro de que desea continuar con la actualización masiva? Si hace clic en Aceptar, comenzará el proceso de actualización masiva y no podrá volver atrás.';
        translation['dbu.validation.verify_submit_si'] = 'Se actualizarán todos los registros con procedimientos de reclamo. Recibe un mensaje por correo electrónico cuando el proceso finaliza. ¿Está seguro de que desea continuar con la actualización masiva? Si hace clic en Aceptar, comenzará el proceso de actualización masiva y no podrá volver atrás.';
        translation['dbu.form.reminderinlinehelp'] = 'NetSuite recomienda utilizar la función de actualización masiva fuera del horario de trabajo normal. Esto asegura que no haya otros usuarios de la compañía actualizando los registros de clientes durante el proceso de actualización masiva.';
        translation['dbu.validation.validate_concurrency_ow'] = 'El usuario {USER} inició un proceso de actualización masiva de registros de clientes con reclamos para la subsidiaria, {SUBSIDIARY}. La actualización masiva se debe completar antes de poder realizar otra actualización masiva de clientes para la misma subsidiaria.';
        translation['dbu.validation.validate_concurrency_si'] = 'El sistema solo puede ejecutar una actualización masiva a la vez. Se está ejecutando una actualización masiva iniciada por {USER}.';
        translation['dbu.customer.message.complete_subject'] = 'Actualización masiva de registros de clientes para reclamos';
        translation['dbu.customer.message.complete_body_ow'] = [
          'Saludos de NetSuite.<br />',
          'La actualización masiva de los registros de clientes con reclamos se completó para la subsidiaria, {SUBSIDIARY}.',
          'Permitir que se envíen las cartas por correo electrónico = {ALLOW_EMAIL}',
          'Permitir que se impriman las cartas = {ALLOW_PRINT}',
          'No enviar cartas al correo electrónico de los clientes = {DONT_SEND_TO_CUST}<br />',
          'Se actualizó el número de registros de clientes: {PROCESSED_RECORDS} de {RECORD_COUNT}.{ERROR_STEPS}',
          'Este correo electrónico fue originado por el sistema.<br />',
          'Gracias,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.complete_body_si'] = [
          'Saludos de NetSuite.<br />',
          'La actualización masiva de los registros de clientes con reclamos se completó.',
          'Permitir que se envíen las cartas por correo electrónico = {ALLOW_EMAIL}',
          'Permitir que se impriman las cartas = {ALLOW_PRINT}',
          'No enviar cartas al correo electrónico de los clientes = {DONT_SEND_TO_CUST}<br />',
          'Se actualizó el número de registros de clientes: {PROCESSED_RECORDS} de {RECORD_COUNT}.{ERROR_STEPS}',
          'Este correo electrónico fue originado por el sistema.<br />',
          'Gracias,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.error_file_header'] = 'ID de cliente,Error';
        translation['dbu.customer.message.error_filename'] = 'Actualizaciones fallidas.csv';
        translation['dbu.customer.message.error_steps'] = '<br />Descargue el archivo adjunto para ver la lista de registros que no se actualizó. Puede actualizar estos registros en forma manual.';
        translation['dc.validateCustomer.noDPMatched'] = 'No se encontraron procedimientos de reclamo que coincidan con el registro del cliente.';
        translation['dc.validateCustomer.recipientNoEmail'] = 'Los siguientes destinatarios de cartas de reclamo no poseen una dirección de correo electrónico en sus registros de contacto: {CONTACTNAMES}.';
        translation['dc.validateCustomer.customerNoEmail'] = 'No se puede guardar el registro. La casilla Permitir el envío de cartas por correo electrónico está marcada, pero no hay una dirección de correo electrónico o un destinatario del reclamo a quién enviar las cartas. Para guardar este registro se deben cumplir las siguientes condiciones:\n- La subficha Destinatarios de reclamos tiene al menos un contacto con dirección de correo electrónico.\n- El campo Correo electrónico del registro del cliente tiene una dirección de correo electrónico.\n\nNota: La dirección de correo electrónico del cliente es necesaria solo si la casilla No enviar cartas al cliente por correo electrónico no está marcada.';
        translation['dc.validateCustomer.noEmailAtAll'] = 'No hay direcciones de correo electrónico en el registro del cliente, y no hay ningún destinatario de la carta de reclamo especificado para este cliente. Escriba una dirección de correo electrónico en el registro del cliente o, en la subficha Reclamo, seleccione como mínimo un destinatario de la carta de reclamo que posea una dirección de correo electrónico.';
        translation['dc.validateCustomer.recipientListEmpty'] = 'No se puede guardar el registro. La casilla Permitir el envío de cartas por correo electrónico está marcada, pero no hay un destinatario del reclamo a quién enviar las cartas. Para guardar este registro, la ficha Destinatarios de reclamos debe tener al menos un contacto con dirección de correo electrónico. \n\nNota: La dirección de correo electrónico del cliente es necesaria solo si la casilla No enviar cartas al cliente por correo electrónico no está marcada.';
        translation['dc.validateCustomer.dpMatched'] = 'El registro de clientes coincide con el procedimiento de reclamo \'{DP}\'. ¿Desea modificar el procedimiento de reclamo? ';
        translation['dc.validateCustomer.dpAllReadyAssigned'] = 'El procedimiento de reclamo encontrado es el mismo que el procedimiento de reclamo que ya se asignó en el registro.';
        translation['dc.validateDP.managerRequired'] = 'Se requiere un gerente de reclamos.';
        translation['dc.validateDP.sendingModeRequired'] = 'Se debe marcar cómo mínimo una de las siguientes casillas:\n- Permitir que se envíen las cartas por correo electrónico\n- Permitir que se impriman las cartas';
        translation['dl.validateDL.dlCountExceeded'] = 'Superó la cantidad máxima de niveles de reclamo posibles.';
        translation['dl.validateDL.lowerDaysOverDue'] = 'La cantidad de días de retraso debe ser inferior a {DAYS}.';
        translation['dl.validateDL.higherDaysOverdue'] = 'La cantidad de días de retraso debe ser superior a {DAYS}.';
        translation['dl.validateDL.daysOverdueExist'] = 'La cantidad de días de retraso {DAYS} ya se encuentra en otra línea.';
        translation['dl.validateDL.lastRecordDeletion'] = 'Solo puede eliminar el último registro de la lista.';
        translation['dl.validateDL.daysBetSending'] = 'Los días entre el envío de cartas deben ser mayores o iguales a {DAYS}';
        translation['dl.validateDL.minOutsBalGEZero'] = 'El importe pendiente mínimo debe ser al menos cero (0).';
        translation['dl.validateDL.daysOverdueLessPrevious'] = 'Los días de retraso en el Nivel de Reclamo {LEVEL} ({LEVEL_OVERDUE} días) deben ser inferiores al Nivel de Reclamo {PREVLEVEL} ({PREVLEVEL_OVERDUE} días).';
        translation['dl.validateDL.dlRequired'] = 'Se requiere como mínimo un nivel de reclamo.';
        translation['dp.validateDP.editNotAllowed'] = 'No está autorizado a editar un tipo de procedimiento de reclamo.';
        translation['dp.information.possibleMultipleSending'] = 'Deshabilitar el campo Intervalo mínimo de reclamo permitirá que su cuenta envíe varias cartas de reclamo a un cliente durante un día. ¿Desea realmente deshabilitarlo?';
        translation['dba.pagination.failedPrevPage'] = 'No se pudo ir a la página anterior.';
        translation['dq.validation.str_send'] = 'enviar';
        translation['dq.validation.str_remove'] = 'eliminar';
        translation['dq.validation.str_print'] = 'imprimir';
        translation['dq.validation.chooseAction'] = 'Elija una carta para ';
        translation['dq.validation.removalConfirmation'] = '¿Está seguro de que desea eliminar los registros seleccionados de la cola?';
        translation['dq.pt.dunningQueueTitle'] = 'Reclamos en cola';
        translation['dq.pt.source'] = 'Tipo de origen';
        translation['dq.pt.dunningProcedure'] = 'Procedimiento de reclamo';
        translation['dq.pt.dunningLevel'] = 'Nivel de reclamo';
        translation['dq.pt.lastLetterSent'] = 'Última carta enviada';
        translation['dq.pt.emailingAllowed'] = 'Se permite el envío de correos electrónicos';
        translation['dq.pt.printingAllowed'] = 'Se permite imprimir';
        translation['dq.pt.send'] = 'Enviar';
        translation['dq.pt.remove'] = 'Eliminar';
        translation['dq.pt.print'] = 'Imprimir';
        translation['dq.pt.customer'] = 'Cliente';
        translation['dt.validator.invalidDefault'] = 'Debe haber una plantilla predeterminada seleccionada para cada uno de los tipos de plantilla de reclamo. Controle las subfichas Correo electrónico y PDF y seleccione una Plantilla predeterminada.';
        translation['dt.validator.duplicateLanguage'] = 'Este idioma ya está en uso para este tipo de plantilla.';
        translation['dt.validator.noTemplateDocs'] = 'Para guardar este registro, debe haber al menos un documento de plantilla de correo electrónico y un documento de plantilla de PDF.';
        translation['dt.validator.subject'] = 'Error en la validación del documento de plantilla de reclamo';
        translation['dt.validator.body'] = 'Los siguientes documentos de plantilla no son válidos:';
        translation['dt.validator.defaultDeletion'] = 'Está intentado eliminar una plantilla que se encuentra seleccionada como predeterminada. Para eliminar esta plantilla primero debe seleccionar una plantilla distinta como plantilla predeterminada.';
        translation['dt.validator.xmlEmailDeprecated'] = 'No puede añadir, editar ni eliminar líneas de plantilla de correo electrónico XML. El uso de plantillas de correo electrónico de reclamo basadas en XML se está dejando de lado en forma gradual. Si agrega plantillas de correo electrónico a la subficha Plantilla de correo electrónico de reclamo y guarda este registro, se borrarán todas las líneas de la subficha Plantilla de correo electrónico de reclamo XML.';
        translation['dt.validator.deleteAllXMLLines'] = 'Guardar este registro hará que se borren todas las líneas de la subficha Plantilla de correo electrónico de reclamo XML. ';
        translation['dt.validator.noEMailDocs'] = 'Debe haber al menos una plantilla de correo electrónico para poder guardar este registro.';
        translation['dt.validator.noPDFDocs'] = 'Debe haber al menos una plantilla de PDF para poder guardar este registro.';
        translation['dt.validator.multipleDefault'] = '¿Está seguro de que desea usar esta plantilla como predeterminada?';
        translation['dlr.validateDLR.noAmount'] = 'La Regla de nivel de reclamo debe tener como mínimo una Cantidad de reglas de nivel de reclamo.';
        translation['dlr.validateDLR.noDefaultAmount'] = 'La Regla de nivel de reclamo debe tener como mínimo una Cantidad de reglas de nivel de reclamo definida como la cantidad Predeterminada.';
        translation['dlr.validateDLR.duplicateCurrency'] = 'La moneda debe ser única.';
        translation['dlr.validateDLR.invalidAmount'] = 'La cantidad debe ser mayor o igual a 0.';
        translation['dlr.validateDLR.changeDefaultCurrency'] = '¿Está seguro de que desea usar esta moneda y cantidad de línea como el valor predeterminado? (Esto modificará el importe y la moneda predeterminados actuales)';
        translation['dlr.validateDLR.negativeDaysOverdue'] = 'El campo Días de retraso contiene un número negativo. Esto enviará una carta al cliente antes de que venza el pago.';
        translation['dlr.validateDLR.daysOverdueChanged'] = 'Cambiar el valor de Días Vencidos en una regla de nivel de requerimiento de pago puede cambiar la secuencia u orden de los niveles de requerimiento de pago, que a su vez puede activar el envío de cartas de requerimiento de pago inapropiadas.\n\n Se recomienda que compruebe el orden de niveles de requerimiento de pago en cada procedimiento de requerimiento ({DP_LIST}) donde el nivel de requerimiento que desea cambiar está en uso.';
        translation['dlr.validateDLR.cannotAddCurrency'] = 'La moneda no se puede agregar porque la función Monedas múltiples no está habilitada.';
        translation['der.flh.dunningProcedure'] = 'Este campo indica el procedimiento de reclamo asignado a la factura o al cliente.';
        translation['der.flh.dunningLevel'] = 'Este campo indica el nivel de reclamo actual después de la evaluación.';
        translation['der.flh.relatedEntity'] = 'Este campo está vinculado con la entidad o el registro de contacto del destinatario de reclamo.';
        translation['der.flh.messageContent'] = 'Este campo contiene el contenido de la carta de reclamo.';
        translation['der.flh.invoiceList'] = 'Este campo enumera las facturas asociadas con la carta de reclamo. ';
        translation['der.flh.emailRecipient'] = 'Este campo muestra las direcciones de correo electrónico de los destinatarios de la carta de reclamo.';
        translation['der.flh.subject'] = 'Este campo muestra la línea de asunto de la carta de reclamo.';
        translation['der.flh.dunningManager'] = 'Este campo muestra al gerente de reclamos asignado al cliente y se vincula con el registro de empleados del gerente de reclamos.';
        translation['der.flh.dunningTemplate'] = 'Este campo se vincula con el registro de plantillas de reclamos.';
        translation['der.flh.customer'] = 'Este campo se vincula con el registro de clientes.';
        translation['der.flh.status'] = 'Este campo indica si el correo electrónico se envió o no correctamente. El estado puede ser uno de los siguientes:\n\n• Enviado: el correo electrónico se envió correctamente.\n• Error: el sistema no puedo enviar el correo electrónico por falta de información. Un ejemplo es cuando no hay una dirección de correo electrónico para el cliente o el contacto.\n• En cola: la carta de reclamo aún se encuentra en la cola de reclamos y no se ha procesado.\n• Eliminado: el gerente de reclamos eliminó este registro de la cola de reclamos.';
        translation['dlr.flh.daysOverdue'] = 'Escriba la cantidad de días transcurridos a partir de la fecha de vencimiento de pago en la que se debe enviar una carta de reclamo. Para enviar una carta antes de la fecha de vencimiento, escriba un número negativo.';
        translation['ds.flh.description'] = 'Escriba una descripción para este registro.';
        translation['dp.flh.dunningProcedure'] = 'Escriba un nombre para este procedimiento de reclamo.';
        translation['dp.flh.description'] = 'Escriba una descripción para este procedimiento de reclamo.';
        translation['dp.flh.appliesTo'] = 'Seleccione si este procedimiento de reclamo se asignará a clientes o facturas. Si selecciona Cliente, también debe activar o desactivar la casilla Permitir anulación. ';
        translation['dp.flh.sendingSchedule'] = 'Seleccione si el envío de las cartas de reclamo será automático o manual.';
        translation['dp.flh.minimumDunningInterval'] = 'Seleccione la cantidad mínima de días que deben transcurrir entre el envío de dos cartas consecutivas al mismo cliente. Esto se aplica tanto a envíos manuales como automáticos.';
        translation['dp.flh.subsidiary'] = 'Seleccione las subsidiarias a las que se aplica este procedimiento de reclamo.';
        translation['dp.flh.savedSearchCustomer'] = 'Seleccione la búsqueda guardada de clientes a la que se aplica este procedimiento.';
        translation['dp.flh.allowOverride'] = 'Si marca esta casilla, un procedimiento de reclamo a nivel de factura puede anular este procedimiento. Un procedimiento de reclamo a nivel de factura se utilizará si una factura cumple con los criterios para ese procedimiento, independientemente de que se haya asignado un procedimiento de reclamo a nivel de cliente.';
        translation['dp.flh.department'] = 'Seleccione los departamentos a los que se aplica este procedimiento.  ';
        translation['dp.flh.class'] = 'Seleccione las clases a las que se aplica este procedimiento.';
        translation['dp.flh.location'] = 'Seleccione las ubicaciones a las que se aplica este procedimiento.';
        translation['dp.flh.savedSearchInvoice'] = 'Seleccione la búsqueda guardada de facturas a la que se aplica este procedimiento.';
        translation['dp.flh.assignAutomatically'] = 'Marque esta casilla para permitir que el sistema asigne automáticamente este procedimiento de reclamo a clientes o facturas en función de los criterios de selección.';
        translation['dt.flh.name'] = 'Escriba un nombre para esta plantilla de reclamo.';
        translation['dt.flh.description'] = 'Escriba una descripción para esta plantilla de reclamo.';
        translation['dt.flh.attachStatement'] = 'Marque esta casilla para adjuntar estados de cuenta de clientes a cartas de reclamo que usen esta plantilla. ';
        translation['dt.flh.attachInvoiceCopy'] = 'Marque esta casilla para adjuntar facturas a cartas de reclamo que usen esta plantilla.';
        translation['dt.flh.overdueInvoiceOnly'] = 'Marque esta casilla si desea adjuntar solo facturas atrasadas.';
        translation['dt.flh.openTransactionOnly'] = 'Marque esta casilla si desea incluir solo las transacciones abiertas en los estados de cuenta de clientes.';
        translation['dt.flh.inactive'] = 'Marque esta casilla para desactivar la plantilla. Las plantillas desactivadas no aparecen en las listas y no pueden utilizarse para enviar cartas de reclamo.';
        translation['dc.flh.allowEmail'] = 'Marque esta casilla si desea enviar las cartas de reclamo por correo electrónico.';
        translation['dc.flh.lastLetterSent'] = 'La fecha de envío de la última carta de reclamo.';
        translation['dc.flh.dunningLevel'] = 'Este campo muestra el nivel de reclamo actual desde la última evaluación de reclamos.';
        translation['dc.flh.dunningManager'] = 'Seleccione a la persona responsable para el reclamo del cliente y el nombre de quien debe aparecer como remitente de la carta de reclamo.';
        translation['dc.flh.dunningProcedure'] = 'Este campo muestra el procedimiento de reclamo asignado al cliente. Si hace clic en Asignar automáticamente, el sistema asigna el procedimiento apropiado en función de los criterios de selección de reclamo. Seleccione un valor diferente de la lista desplegable para modificar el procedimiento de reclamo asignado al cliente. La lista desplegable muestra solo los procedimientos de reclamo que se aplican a este cliente según los criterios de selección definidos en los registros de procedimientos de reclamo. ';
        translation['dc.flh.allowPrint'] = 'Marque esta casilla si desea imprimir las cartas de reclamo.';
        translation['dc.flh.pauseReason'] = 'Seleccione un motivo para indicar por qué se detuvo el reclamo.';
        translation['dc.flh.pauseReasonDetail'] = 'Seleccione un detalle para indicar por qué se detuvo el reclamo.';
        translation['dc.flh.pauseDunning'] = 'Marque esta casilla para detener temporalmente el proceso de reclamo.';
        translation['dc.flh.dunningRecepients'] = 'Seleccione destinatarios de reclamo adicionales.';
        translation['dc.flh.allowEmail'] = 'Marque esta casilla si desea enviar las cartas de reclamo por correo electrónico.';
        translation['di.flh.lastLetterSent'] = 'La fecha de envío de la última carta de reclamo.';
        translation['di.flh.dunningLevel'] = 'Este campo muestra el nivel de reclamo actual desde la última evaluación de reclamos.';
        translation['di.flh.dunningManager'] = 'Seleccione a la persona responsable para el reclamo de la factura y el nombre de quien debe aparecer como remitente de la carta de reclamo.';
        translation['di.flh.dunningProcedure'] = 'Este campo muestra el procedimiento de reclamo asignado a la factura. Si hace clic en Asignar automáticamente, el sistema asigna el procedimiento apropiado en función de los criterios de selección de reclamo. Seleccione un valor diferente de la lista desplegable para modificar el procedimiento de reclamo asignado a la factura. La lista desplegable muestra solo los procedimientos de reclamo que se aplican a esta factura según los criterios de selección definidos en los registros de procedimientos de reclamo. ';
        translation['di.flh.allowPrint'] = 'Marque esta casilla si desea imprimir las cartas de reclamo.';
        translation['di.flh.pauseReason'] = 'Seleccione un motivo para indicar por qué se detuvo el reclamo.';
        translation['di.flh.pauseReasonDetail'] = 'Seleccione un detalle del motivo para indicar por qué se detuvo el reclamo.';
        translation['di.flh.pauseDunning'] = 'Marque esta casilla para detener temporalmente el proceso de reclamo.';
        translation['dp.validate.unpause'] = 'La desactivación de la casilla Detener reclamo automáticamente desencadena el flujo de trabajo de evaluación de reclamos. NetSuite puede enviar una carta de reclamo al cliente según el resultado de la evaluación de reclamos. ¿Está seguro de que desea reanudar el reclamo?';
        translation['dc.validateSubsidiary.existingConfigSubsidiary'] = 'Ya existe un registro de configuración de reclamos para esta subsidiaria.';
        translation['l10n.address.invalidPOBox'] = 'Introduzca un número de apartado postal válido.';
        translation['l10n.address.invalidZipCode'] = 'Introduzca un código postal válido.';
        translation['l10n.address.invalidRuralRoute'] = 'Introduzca un valor de ruta rural válido.';
        translation['l10n.accessForDDandAccountant'] = 'Solo los roles Administrador, Director de reclamos y Contador pueden crear y modificar este tipo de registros.';
        translation['l10n.deleteAccessForDDandAccountant'] = 'Solo los roles Administrador, Director de reclamos y Contador pueden eliminar este tipo de registros.';
        translation['l10n.accessForAdministrator'] = 'Solo el rol Administrador puede crear y modificar este tipo de registros.';
        translation['l10n.deleteAccessForAdministrator'] = 'Solo el rol Administrador puede eliminar este tipo de registros.';
        translation['l10n.noPagePrivilege'] = 'No tiene privilegios para ver esta página.';
        translation['dq.pdfemail.folderName'] = 'Cartas de cobranza en PDF para impresión';
        translation['dq.pdfemail.subject'] = 'Las cartas de cobranza generadas en PDF están disponibles para impresión en el gabinete de archivos.';
        translation['dq.pdfemail.link'] = 'Haga clic en el vínculo para ver la carpeta de las cartas en PDF:';
        translation['dq.pdfemail.tableHead'] = 'La siguiente tabla ofrece detalles de las carpetas donde los archivos PDF se almacenan.';
        translation['dq.pdfemail.exceedLimit'] = 'Los archivos generados no se pudieron adjuntar debido a que se excedió el límite de adjuntos.';
        translation['dq.pdfemail.tableLabel1'] = 'Carpetas';
        translation['dq.pdfemail.tableLabel2'] = 'Ruta';
        translation['dq.pdfemail.tableLabel3'] = 'Estado';
        translation['dq.pdfemail.tableLabel4'] = 'Notas';

        break;

      case 'fr_CA':
      case 'fr-CA':
        translation['dsa.response.none_found'] = 'Aucune procédure de relance disponible.';
        translation['form.dunning_template.title'] = 'Modèle de relance';
        translation['field.template.name'] = 'Nom';
        translation['field.template.description'] = 'Description';
        translation['field.template.attachStatement'] = 'Joindre le relevé';
        translation['field.template.overdue_invoices_stmt'] = 'Uniquement les factures en souffrance sur l\'état';
        translation['field.template.inactive'] = 'Inactif';
        translation['field.template.attach_invoice_copy'] = 'Joindre des copies des factures';
        translation['field.template.only_overdue_invoices'] = 'Uniquement les factures en souffrance';
        translation['field.template.subject'] = 'Objet';
        translation['selection.template.savedsearch'] = 'Recherche enregistrée';
        translation['selection.template.searchcolumn'] = 'Colonne de recherche';
        translation['label.template.lettertext'] = 'Texte des lettres';
        translation['dba.form.title'] = 'Attribution en masse de relances';
        translation['dba.form.source'] = 'S\'applique à';
        translation['dba.form.procedure'] = 'Procédure de relance';
        translation['dba.form.source.help'] = 'S\'applique à';
        translation['dba.form.procedure.help'] = 'Procédure de relance';
        translation['dba.form.dunning_manager'] = 'Responsable des relances';
        translation['dba.form.dunning_manager.help'] = 'Responsable des relances';
        translation['dba.tab.invoice'] = 'Factures';
        translation['dba.sublist.invoice'] = 'Factures';
        translation['dba.tab.customer'] = 'Clients';
        translation['dba.sublist.customer'] = 'Clients';
        translation['dba.sublist.common.id'] = 'Numéro d\'identification (ID)';
        translation['dba.sublist.common.customer'] = 'Client';
        translation['dba.sublist.invoice.invoice'] = 'Facture';
        translation['dba.sublist.invoice.amount'] = 'Montant';
        translation['dba.sublist.invoice.currency'] = 'Devise';
        translation['dba.sublist.invoice.duedate'] = 'Date d\'échéance';
        translation['dba.sublist.invoice.days_overdue'] = 'Jours de retard';
        translation['dba.sublist.customer.subsidiary'] = 'Filiale';
        translation['dba.sublist.common.assign_dunning'] = 'Attribuer';
        translation['dba.sublist.common.dunning_procedure'] = 'Procédure de relance';
        translation['dba.sublist.common.dunning_level'] = 'Niveau de relance';
        translation['dba.sublist.common.last_letter_sent'] = 'Date d\'envoi de la dernière lettre';
        translation['dba.sublist.common.dunning_sending_type'] = 'Type d\'envoi';
        translation['dba.sublist.common.page_next'] = '>';
        translation['dba.sublist.common.page_previous'] = '<';
        translation['dba.sublist.common.page_option'] = '{startIndex} - {endIndex} sur {totalEntryCount}';
        translation['dba.form.restriction'] = 'Critères de sélection';
        translation['dba.form.selection'] = 'Sélection de la procédure de relance';
        translation['dba.form.restriction.subsidiary'] = 'Filiales';
        translation['dba.form.restriction.location'] = 'Lieux';
        translation['dba.form.restriction.dept'] = 'Départements';
        translation['dba.form.restriction.class'] = 'Classes';
        translation['dba.form.restriction.search'] = 'Recherche enregistrée';
        translation['dba.form.action.assign'] = 'Attribuer';
        translation['dba.form.action.assign_customer'] = 'Attribuer aux clients';
        translation['dba.form.action.assign_invoice'] = 'Attribuer aux factures';
        translation['dba.form.action.cancel'] = 'Annuler';
        translation['dba.form.notification.highnumberofrecord'] = 'Le traitement de cette demande pourra prendre quelques secondes. Veuillez patienter jusqu\'à ce que vous soyez redirigé vers la page de procédure de relance.';
        translation['dqf.form.action.send'] = 'Envoyer';
        translation['dqf.form.action.print'] = 'Imprimer';
        translation['dqf.form.action.remove'] = 'Supprimer';
        translation['dqf.form.send.title'] = 'File d\'attente d\'envoi des e-mails de relance';
        translation['dqf.form.print.title'] = 'File d\'attente à l\'impression des PDF de relance';
        translation['dqf.filter.fieldGroup'] = 'Filtres';
        translation['dqf.filter.inlineHelp'] = 'Utilisez les filtres pour effectuer des recherches plus spécifiques ou pour restreindre les résultats à afficher.';
        translation['dqf.filter.applyFiltersButton'] = 'Recherche';
        translation['dqf.filter.customer'] = 'Client';
        translation['dqf.filter.recipient'] = 'Destinataire';
        translation['dqf.filter.procedure'] = 'Procédure de relance';
        translation['dqf.filter.dpLevel'] = 'Niveau de relance';
        translation['dqf.filter.appliesTo'] = 'S\'applique à';
        translation['dqf.filter.allowPrint'] = 'Autoriser l\'impression';
        translation['dqf.filter.allowEmail'] = 'Autoriser l\'e-mail';
        translation['dqf.filter.lastLtrSentStart'] = 'Date de début de la dernière lettre envoyée';
        translation['dqf.filter.lastLtrSentEnd'] = 'Date de fin de la dernière lettre envoyée';
        translation['dqf.filter.evalDateStart'] = 'Date de début de l\'évaluation';
        translation['dqf.filter.evalDateEnd'] = 'Date de fin d\'évaluation';
        translation['dqf.filter.boolean.yes'] = 'Oui';
        translation['dqf.filter.boolean.no'] = 'Non';
        translation['dqf.sublist.send.title'] = 'File d\'attente d\'envoi des e-mails de relance';
        translation['dqf.sublist.print.title'] = 'File d\'attente à l\'impression des PDF de relance';
        translation['dqf.sublist.common.customer'] = 'Client';
        translation['dqf.sublist.common.mark'] = 'Cocher';
        translation['dqf.sublist.common.view'] = 'Afficher';
        translation['dqf.sublist.common.id'] = 'Numéro d\'identification (ID)';
        translation['dqf.sublist.dp.applies_to'] = 'S\'applique à';
        translation['dqf.sublist.common.dunning_procedure'] = 'Procédure de relance';
        translation['dqf.sublist.common.dunning_level'] = 'Niveau';
        translation['dqf.sublist.record.last_letter_sent'] = 'Dernière lettre envoyée';
        translation['dqf.sublist.record.dunning_allow_email'] = 'Autoriser l\'e-mail';
        translation['dqf.sublist.record.dunning_allow_print'] = 'Autoriser l\'impression';
        translation['dqf.sublist.record.pause_dunning'] = 'Mettre la relance en pause';
        translation['dqf.sublist.common.evaluation_date'] = 'Date d\'évaluation';
        translation['dqf.sublist.common.related_entity'] = 'Destinataire';
        translation['dbu.form.title'] = 'Mise à jour en masse de la relance sur les dossiers de clients';
        translation['dbu.form.update_button'] = 'Mettre à jour';
        translation['dbu.form.field.subsidiary'] = 'Filiale';
        translation['dbu.form.flh.subsidiary'] = 'Sélectionnez la filiale pour laquelle vous souhaitez réaliser une mise à jour en masse des champs de relance sur les dossiers de clients. Les mises à jour seront appliquées à l\'ensemble des dossiers de clients qui appartiennent à la filiale sélectionnée.';
        translation['dbu.form.field.allow_email'] = 'Autoriser l\'envoi de lettres par e-mail';
        translation['dbu.form.flh.allow_email'] = 'Sélectionnez une valeur à appliquer dans ce champ des dossiers de clients une fois la mise à jour en masse réalisée :\nNon modifié : la valeur actuelle du champ ne sera pas modifiée. \nCoché : la case sera cochée sur tous les dossiers des clients après la mise à jour en masse. \nNon coché : la case ne sera pas cochée après la mise à jour en masse.';
        translation['dbu.form.field.allow_print'] = 'Autoriser l\'impression de lettres';
        translation['dbu.form.flh.allow_print'] = 'Sélectionnez une valeur à appliquer dans ce champ des dossiers de clients une fois la mise à jour en masse réalisée :\nNon modifié : la valeur actuelle du champ ne sera pas modifiée. \nCoché : la case sera cochée sur tous les dossiers des clients après la mise à jour en masse. \nNon coché : la case ne sera pas cochée après la mise à jour en masse.';
        translation['dbu.form.field.dont_send_cust_email'] = 'Ne pas envoyer de lettre à l\'adresse électronique du client';
        translation['dbu.form.flh.dont_send_cust_email'] = 'Sélectionnez une valeur à appliquer dans ce champ des dossiers de clients une fois la mise à jour en masse réalisée :\nNon modifié : la valeur actuelle du champ ne sera pas modifiée. \nCoché : la case sera cochée sur tous les dossiers des clients après la mise à jour en masse. \nNon coché : la case ne sera pas cochée après la mise à jour en masse.';
        translation['dbu.form.primary_field_group'] = 'Critères';
        translation['dbu.form.bulk_update_field_group'] = 'Mise à jour en masse des champs';
        translation['dbu.form.options.unchanged'] = '- Non modifié -';
        translation['dbu.form.options.checked'] = 'Coché';
        translation['dbu.form.options.not_checked'] = 'Non coché';
        translation['dbu.validation.no_selection'] = 'Il n\'existe aucun champ à mettre à jour car "Non modifié" est sélectionné pour tous les champs. Une mise à jour en masse peut uniquement être réalisée si une modification est spécifiée dans au moins l\'un des champs (Coché ou Non coché).';
        translation['dbu.validation.no_sending_media'] = 'Il n\'est pas possible d\'enregistrer les dossiers de clients si aucune des deux cases "Autoriser l\'envoi de lettres par e-mail" et "Autoriser l\'impression de lettres" n\'est cochée. Sélectionnez Coché dans l\'une des cases suivantes au moins :\n- Autoriser l\'envoi de lettres par e-mail\n- Autoriser l\'impression de lettres';
        translation['dbu.validation.verify_submit_ow'] = 'Tous les dossiers de clients associés à une procédure de relance et appartenant à la filiale sélectionnée seront mis à jour. {SUBSIDIARY} Vous recevrez un courriel lorsque le processus est terminé. Êtes-vous sûr de vouloir procéder à la mise à jour en masse ? Si vous cliquez sur OK, le processus de mise à jour en masse sera lancé et ne pourra pas être annulé.';
        translation['dbu.validation.verify_submit_si'] = 'Tous les dossiers de clients associés à une procédure de relance seront mis à jour. Vous recevrez un courriel lorsque le processus est terminé. Êtes-vous sûr de vouloir procéder à la mise à jour en masse ? Si vous cliquez sur OK, le processus de mise à jour en masse sera lancé et ne pourra pas être annulé.';
        translation['dbu.form.reminderinlinehelp'] = 'NetSuite vous recommande d\'utiliser la fonction de mise à jour en masse en dehors des vos heures de bureau habituelles pour vous assurer que les autres utilisateurs de votre entreprise ne travaillent pas sur les dossiers des clients pendant le processus de mise à jour en masse.';
        translation['dbu.validation.validate_concurrency_ow'] = 'Une mise en jour a été lancée par  {USER} pour les données de relance des dossiers de clients associés à cette filiale, {SUBSIDIARY}. Ce processus de mise à jour en masse doit être terminé avant que vous puissiez réaliser une autre mise à jour en masse des clients de cette même filiale.';
        translation['dbu.validation.validate_concurrency_si'] = 'Le système peut seulement exécuter une mise à jour en masse à la fois. Une mise à jour en masse lancée par  {USER}est en cours d\'exécution.';
        translation['dbu.customer.message.complete_subject'] = 'Mise à jour en masse de la relance sur les dossiers de clients';
        translation['dbu.customer.message.complete_body_ow'] = [
          'Salutations de NetSuite.<br />',
          'La mise à jour en masse de la relance sur les dossiers de clients de cette filiale est terminée. {SUBSIDIARY}',
          'Autoriser l\'envoi de lettres par e-mail = {ALLOW_EMAIL}',
          'Autoriser l\'impression de lettres = {ALLOW_PRINT}',
          'Ne pas envoyer de lettre à l\'adresse électronique du client = {DONT_SEND_TO_CUST}<br />',
          'Nombre de dossiers de clients mis à jour : {PROCESSED_RECORDS} sur {RECORD_COUNT}.{ERROR_STEPS}',
          'Ce message a été généré par le système.<br />',
          'Merci,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.complete_body_si'] = [
          'Salutations de NetSuite.<br />',
          'La mise à jour en masse de la relance sur les dossiers des clients est terminée.',
          'Autoriser l\'envoi de lettres par e-mail = {ALLOW_EMAIL}',
          'Autoriser l\'impression de lettres = {ALLOW_PRINT}',
          'Ne pas envoyer de lettre à l\'adresse électronique du client = {DONT_SEND_TO_CUST}<br />',
          'Nombre de dossiers de clients mis à jour : {PROCESSED_RECORDS} sur {RECORD_COUNT}.{ERROR_STEPS}',
          'Ce message a été généré par le système.<br />',
          'Merci,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.error_file_header'] = 'Erreur du numéro d\'identification du client';
        translation['dbu.customer.message.error_filename'] = 'Failed Updates.csv';
        translation['dbu.customer.message.error_steps'] = '<br />Veuillez télécharger le fichier ci-joint pour consulter la liste des dossiers qui n\'ont pas été mis à jour. Vous pouvez mettre à jour ces dossiers manuellement.';
        translation['dc.validateCustomer.noDPMatched'] = 'Aucune procédure de relance correspondant au dossier du client n\'a été trouvée.';
        translation['dc.validateCustomer.recipientNoEmail'] = 'Les destinataires de lettres de relance suivants n\'ont pas d\'adresse électronique dans leur dossier de contact : {CONTACTNAMES}.';
        translation['dc.validateCustomer.customerNoEmail'] = 'Il n\'est pas possible d\'enregistrer le dossier. La case "Autoriser l\'envoi de lettres par e-mail" est cochée mais il n\'y a aucune adresse électronique ou aucun destinataire de relance à qui envoyer les lettres. Pour enregistrer ce dossier, l\'une des conditions suivantes doit être vraie :\n- Au moins un contact avec une adresse électronique est indiqué dans le sous-onglet Destinataire de relance.\n- Une adresse électronique est indiquée dans le champ E-mail du dossier du client.\n\nNote : L\'adresse électronique du client est uniquement requise si la case "Ne pas envoyer de lettre à l\'adresse électronique du client" n\'est pas cochée.';
        translation['dc.validateCustomer.noEmailAtAll'] = 'Aucune adresse électronique n\'est indiquée sur le dossier du client, de même qu\'aucun destinataire de lettre de relance n\'est indiqué pour ce client. Ajoutez une adresse électronique sur le dossier du client ou, dans le sous-onglet Relance, sélectionnez au moins un destinataire de lettre de relance ayant une adresse électronique.';
        translation['dc.validateCustomer.recipientListEmpty'] = 'Il n\'est pas possible d\'enregistrer le dossier. La case "Autoriser l\'envoi de lettres par e-mail" est cochée mais il n\'y a aucun destinataire de relance à qui envoyer les lettres. Pour enregistrer ce dossier, vous devez indiquer au moins un contact avec une adresse électronique dans le sous-onglet Destinataires de relance. \n\nRemarque : L\'adresse électronique du client est uniquement requise si la case "Ne pas envoyer de lettre à l\'adresse électronique du client" n\'est pas cochée.';
        translation['dc.validateCustomer.dpMatched'] = 'Le dossier du client est associé à la procédure de relance "{DP}". Souhaitez-vous modifier cette procédure de relance ?';
        translation['dc.validateCustomer.dpAllReadyAssigned'] = 'La procédure de relance trouvée est identique à celle déjà attribuée dans le dossier.';
        translation['dc.validateDP.managerRequired'] = 'Un responsable des relances est requis.';
        translation['dc.validateDP.sendingModeRequired'] = 'Au moins une des cases suivantes doit être cochée :\n- Autoriser l\'envoi de lettres par e-mail\n- Autoriser l\'impression de lettres';
        translation['dl.validateDL.dlCountExceeded'] = 'Vous avez dépassé le montant maximum de niveaux de relance possible.';
        translation['dl.validateDL.lowerDaysOverDue'] = 'Le nombre de jours de retard doit être inférieur à {DAYS}.';
        translation['dl.validateDL.higherDaysOverdue'] = 'Le nombre de jours de retard doit être supérieur à {DAYS}.';
        translation['dl.validateDL.daysOverdueExist'] = 'Le nombre de jours de retard  {DAYS} figure déjà dans une autre ligne.';
        translation['dl.validateDL.lastRecordDeletion'] = 'Vous pouvez uniquement supprimer le dernier dossier de la liste.';
        translation['dl.validateDL.daysBetSending'] = 'Le nombre de jours entre l\'envoi des lettres doit être supérieur ou égal à {DAYS}';
        translation['dl.validateDL.minOutsBalGEZero'] = 'Le montant en souffrance minimum doit être au moins zéro (0).';
        translation['dl.validateDL.daysOverdueLessPrevious'] = 'Le nombre de jours de retard dans le Niveau de relance {LEVEL} ({LEVEL_OVERDUE} jours) doit être inférieur au nombre de jours de retard du Niveau de relance {PREVLEVEL} ({PREVLEVEL_OVERDUE} jours).';
        translation['dl.validateDL.dlRequired'] = 'Au moins un niveau de relance est requis.';
        translation['dp.validateDP.editNotAllowed'] = 'Vous n\'êtes pas autorisé à modifier ce type de procédure de relance.';
        translation['dp.information.possibleMultipleSending'] = 'Si vous désactivez le champ "Intervalle minimum de relance", votre compte pourra envoyer plusieurs lettres de relance au même client dans la même journée. Êtes-vous sûr de vouloir le désactiver ?';
        translation['dba.pagination.failedPrevPage'] = 'Impossible de revenir à la page précédente.';
        translation['dq.validation.str_send'] = 'envoyer';
        translation['dq.validation.str_remove'] = 'supprimer';
        translation['dq.validation.str_print'] = 'imprimer';
        translation['dq.validation.chooseAction'] = 'Veuillez choisir une lettre pour ';
        translation['dq.validation.removalConfirmation'] = 'Êtes-vous sûr de vouloir supprimer les dossiers sélectionnés de la file d\'attente ?';
        translation['dq.pt.dunningQueueTitle'] = 'File d\'attente des relances';
        translation['dq.pt.source'] = 'Type de source';
        translation['dq.pt.dunningProcedure'] = 'Procédure de relance';
        translation['dq.pt.dunningLevel'] = 'Niveau de relance';
        translation['dq.pt.lastLetterSent'] = 'Dernière lettre envoyée';
        translation['dq.pt.emailingAllowed'] = 'Envoi par e-mail autorisé';
        translation['dq.pt.printingAllowed'] = 'Impression autorisée';
        translation['dq.pt.send'] = 'Envoyer';
        translation['dq.pt.remove'] = 'Supprimer';
        translation['dq.pt.print'] = 'Imprimer';
        translation['dq.pt.customer'] = 'Client';
        translation['dt.validator.invalidDefault'] = 'Un modèle par défaut doit être sélectionné pour chacun des types de modèle de relance. Vérifiez les sous-onglets E-mail et PDF et sélectionnez un modèle par défaut.';
        translation['dt.validator.duplicateLanguage'] = 'Cette langue est déjà utilisée pour ce type de modèle.';
        translation['dt.validator.noTemplateDocs'] = 'Pour enregistrer ce dossier, au moins un document modèle d\'e-mail et un document de modèle PDF sont obligatoires.';
        translation['dt.validator.subject'] = 'Échec de la validation du document modèle de relance';
        translation['dt.validator.body'] = 'Les documents modèles suivants sont non valides :';
        translation['dt.validator.defaultDeletion'] = 'Vous tentez de supprimer un modèle qui est actuellement le modèle par défaut. Pour supprimer ce modèle, vous devez d\'abord sélectionner un modèle par défaut différent.';
        translation['dt.validator.xmlEmailDeprecated'] = 'Vous ne pouvez pas ajouter, modifier ou supprimer de lignes sur un modèle d\'e-mail XML. L\'utilisation de modèles d\'e-mail de relance basés sur XML sera progressivement éliminée. Si vous ajoutez des modèles d\'e-mail au sous-onglet Modèle d\'e-mail de relance, lorsque vous enregistrez ce dossier, toutes les lignes du sous-onglet Modèle d\'e-mail XML de relance seront supprimées.';
        translation['dt.validator.deleteAllXMLLines'] = 'Si vous enregistrez ce dossier, toutes les lignes de l\'onglet Modèle d\'e-mail XML de relance seront supprimées.';
        translation['dt.validator.noEMailDocs'] = 'Au moins un modèle d\'e-mail doit être présent pour enregistrer ce dossier.';
        translation['dt.validator.noPDFDocs'] = 'Au moins un modèle PDF doit être présent pour enregistrer ce dossier.';
        translation['dt.validator.multipleDefault'] = 'Êtes-vous sûr de utiliser ce modèle en tant que modèle par défaut ?';
        translation['dlr.validateDLR.noAmount'] = 'La règle du niveau de relance doit comporter au moins un montant de la règle du niveau de relance.';
        translation['dlr.validateDLR.noDefaultAmount'] = 'La règle du niveau de relance doit comporter au moins un montant de la règle du niveau de relance défini comme montant par défaut.';
        translation['dlr.validateDLR.duplicateCurrency'] = 'La devise doit être unique.';
        translation['dlr.validateDLR.invalidAmount'] = 'Le montant doit être supérieur ou égal à 0.';
        translation['dlr.validateDLR.changeDefaultCurrency'] = 'Êtes-vous sûr de vouloir utiliser par défaut la devise et le montant de cette ligne ? (La devise et le montant par défaut actuels seront alors modifiés.)';
        translation['dlr.validateDLR.negativeDaysOverdue'] = 'Un nombre négatif a été saisi dans le champ Jours de retard. Cela signifie qu\'une lettre sera envoyée au client avant la date d\'échéance du paiement.';
        translation['dlr.validateDLR.daysOverdueChanged'] = 'Modifier la valeur des Jours de retard d\'une règle des niveaux de relance peut changer la séquence ou l\'ordre des niveaux de relance qui à leur tour peuvent déclencher l\'envoi d\'une lettre d\'avertissement inappropriée.\n\n Il est recommandé de vérifier l\'ordre des niveaux de relance pour chaque procédure ({DP_LIST}) où le niveau de relance que vous voulez modifier est en cours d\'utilisation.';
        translation['dlr.validateDLR.cannotAddCurrency'] = 'Il n\'est pas possible d\'ajouter la devise car la fonction Multidevises n\'est pas activée.';
        translation['der.flh.dunningProcedure'] = 'Ce champ indique la procédure de relance attribuée à la facture ou au client.';
        translation['der.flh.dunningLevel'] = 'Ce champ indique le niveau de relance actuel après l\'évaluation.';
        translation['der.flh.relatedEntity'] = 'Ce champ est lié à l\'entité ou au dossier de contact du destinataire de la relance.';
        translation['der.flh.messageContent'] = 'Ce champ contient le contenu de la lettre de relance.';
        translation['der.flh.invoiceList'] = 'Ce champ répertorie les factures associées à la lettre de relance. ';
        translation['der.flh.emailRecipient'] = 'Ce champ affiche les adresses électroniques des destinataires de la lettre de relance.';
        translation['der.flh.subject'] = 'Ce champ affiche la ligne d\'objet de la lettre de relance.';
        translation['der.flh.dunningManager'] = 'Ce champ affiche le responsable des relances attribué au client. Il est lié au dossier d\'employé du responsable des relances.';
        translation['der.flh.dunningTemplate'] = 'Ce champ est lié au dossier du modèle de relance.';
        translation['der.flh.customer'] = 'Ce champ est lié au dossier client.';
        translation['der.flh.status'] = 'Ce champ indique si votre courrier électronique a été envoyé avec succès ou non. Le statut peut être l\'un des suivants :\n\n• Envoyé : le message a été envoyé avec succès.\n• Échec : le système n\'a pas pu envoyer votre message en raison d\'un manque d\'information. Par exemple, aucune adresse électronique n\'a été saisie pour le client ou le contact.\n• En file d\'attente : la lettre de relance se trouve toujours dans la file d\'attente des relances et n\'a pas encore été traitée.\n• Supprimé : le responsable des relances a supprimé ce dossier de la file d\'attente des relances.';
        translation['dlr.flh.daysOverdue'] = 'Saisissez le nombre de jours au bout duquel une lettre de relance doit être envoyée une fois la date d\'échéance de paiement passée. Si vous souhaitez envoyer une lettre de relance avant la date d\'échéance, saisissez une valeur négative.';
        translation['ds.flh.description'] = 'Saisissez une description pour ce dossier.';
        translation['dp.flh.dunningProcedure'] = 'Saisissez un nom pour cette procédure de relance.';
        translation['dp.flh.description'] = 'Saisissez une description pour cette procédure de relance.';
        translation['dp.flh.appliesTo'] = 'Indiquez si cette procédure de relance sera attribuée à des clients ou à des factures. Si vous choisissez Client, vous devez également cochez ou décocher la case "Autoriser les remplacements".';
        translation['dp.flh.sendingSchedule'] = 'Sélectionnez si les lettres de relance seront envoyées automatiquement ou manuellement.';
        translation['dp.flh.minimumDunningInterval'] = 'Sélectionnez le nombre de jours minimum séparant l\'envoi de deux lettres consécutives au même client. Cet intervalle s\'applique aux envois automatiques et manuels.';
        translation['dp.flh.subsidiary'] = 'Sélectionnez les filiales auxquelles cette procédure de relance s\'applique.';
        translation['dp.flh.savedSearchCustomer'] = 'Sélectionnez la recherche enregistrée de client à laquelle cette procédure s\'applique.';
        translation['dp.flh.allowOverride'] = 'Si vous cochez cette case, une procédure de relance au niveau des factures pourra remplacer cette procédure. Une procédure de relance au niveau des factures sera utilisée lorsqu\'une facture répond aux critères de ladite procédure, même si une procédure de relance a déjà été attribuée au niveau des clients.';
        translation['dp.flh.department'] = 'Sélectionnez les départements auxquels cette procédure s\'applique. ';
        translation['dp.flh.class'] = 'Sélectionnez les classes auxquelles cette procédure s\'applique.';
        translation['dp.flh.location'] = 'Sélectionnez les lieux auxquels cette procédure s\'applique.';
        translation['dp.flh.savedSearchInvoice'] = 'Sélectionnez la recherche enregistrée de factures à laquelle cette procédure s\'applique.';
        translation['dp.flh.assignAutomatically'] = 'Cochez cette case pour permettre au système d\'attribuer automatiquement cette procédure de relance aux clients ou aux factures en fonction des critères de sélection.';
        translation['dt.flh.name'] = 'Saisissez un nom pour ce modèle de relance.';
        translation['dt.flh.description'] = 'Saisissez une description pour ce modèle de relance.';
        translation['dt.flh.attachStatement'] = 'Cochez cette case pour joindre des relevés clients aux lettres de relance qui utilisent ce modèle. ';
        translation['dt.flh.attachInvoiceCopy'] = 'Cochez cette case pour joindre des factures aux lettres de relance qui utilisent ce modèle.';
        translation['dt.flh.overdueInvoiceOnly'] = 'Cochez cette case si vous souhaitez joindre uniquement les factures en souffrance.';
        translation['dt.flh.openTransactionOnly'] = 'Cochez cette case si vous souhaitez inclure uniquement les transactions en cours sur les relevés du client.';
        translation['dt.flh.inactive'] = 'Cochez cette case pour désactiver le modèle. Les modèles inactifs n\'apparaissent pas dans les listes et ne peuvent pas être utilisés pour l\'envoi de lettres de relance.';
        translation['dc.flh.allowEmail'] = 'Cochez cette case si vous voulez que les lettres de relance soient envoyées par e-mail.';
        translation['dc.flh.lastLetterSent'] = 'La date à laquelle la dernière lettre de relance a été envoyée.';
        translation['dc.flh.dunningLevel'] = 'Ce champ indique le niveau de relance actuel tel que déterminé par la dernière évaluation de relance.';
        translation['dc.flh.dunningManager'] = 'Sélectionnez la personne responsable des relances de ce client et le nom qui apparaîtra en tant qu\'expéditeur de la lettre de relance.';
        translation['dc.flh.dunningProcedure'] = 'Ce champ indique la procédure de relance attribuée au client. Si vous cliquez sur "Attribuer automatiquement", le système attribue la procédure adéquate en fonction des critères de sélection de la relance. Sélectionnez une valeur différente dans la liste déroulante pour modifier la procédure de relance attribuée au client. La liste déroulante affiche uniquement les procédures applicables à ce client, en fonction des critères de sélection définis dans les dossiers de procédures de relance.';
        translation['dc.flh.allowPrint'] = 'Cochez cette case si vous voulez que les lettres de relance soient imprimées.';
        translation['dc.flh.pauseReason'] = 'Sélectionnez une raison expliquant pourquoi la relance a été mise en pause.';
        translation['dc.flh.pauseReasonDetail'] = 'Sélectionnez un détail expliquant la raison pour laquelle la relance a été mise en pause.';
        translation['dc.flh.pauseDunning'] = 'Cochez cette case pour interrompre provisoirement le processus de relance.';
        translation['dc.flh.dunningRecepients'] = 'Sélectionnez des destinataires supplémentaires de la relance';
        translation['dc.flh.allowEmail'] = 'Cochez cette case si vous voulez que les lettres de relance soient envoyées par e-mail.';
        translation['di.flh.lastLetterSent'] = 'La date à laquelle la dernière lettre de relance a été envoyée.';
        translation['di.flh.dunningLevel'] = 'Ce champ indique le niveau de relance actuel tel que déterminé par la dernière évaluation de relance.';
        translation['di.flh.dunningManager'] = 'Sélectionnez la personne responsable des relances de cette facture et le nom qui apparaîtra en tant qu\'expéditeur de la lettre de relance.';
        translation['di.flh.dunningProcedure'] = 'Ce champ indique la procédure de relance attribuée à la facture. Si vous cliquez sur "Attribuer automatiquement", le système attribue la procédure adéquate en fonction des critères de sélection de la relance. Sélectionnez une valeur différente dans la liste déroulante pour modifier la procédure de relance attribuée à la facture. La liste déroulante affiche uniquement les procédures applicables à cette facture, en fonction des critères de sélection définis dans les dossiers de procédures de relance.';
        translation['di.flh.allowPrint'] = 'Cochez cette case si vous voulez que les lettres de relance soient imprimées.';
        translation['di.flh.pauseReason'] = 'Sélectionnez une raison expliquant pourquoi la relance a été mise en pause.';
        translation['di.flh.pauseReasonDetail'] = 'Sélectionnez un détail expliquant la raison pour laquelle la relance a été mise en pause.';
        translation['di.flh.pauseDunning'] = 'Cochez cette case pour interrompre provisoirement le processus de relance.';
        translation['dp.validate.unpause'] = 'Si vous décochez la case "Mettre la relance en pause", le flux de production d\'évaluation de la relance sera immédiatement déclenché. NetSuite pourra envoyer une lettre de relance à ce client en fonction du résultat de l\'évaluation de la relance. Êtes-vous sûr de vouloir reprendre la relance ?';
        translation['dc.validateSubsidiary.existingConfigSubsidiary'] = 'Un dossier de configuration de relance existe déjà dans la base de données pour cette filiale.';
        translation['l10n.address.invalidPOBox'] = 'Veuillez saisir un numéro de boîte postale valide.';
        translation['l10n.address.invalidZipCode'] = 'Veuillez saisir un code postal valide.';
        translation['l10n.address.invalidRuralRoute'] = 'Veuillez saisir une valeur de route rurale valide.';
        translation['l10n.accessForDDandAccountant'] = 'Seuls les rôles d\'administrateur, de directeur des relances et de comptable peuvent créer et modifier ce type de dossier.';
        translation['l10n.deleteAccessForDDandAccountant'] = 'Seuls les rôles d\'administrateur, de directeur des relances et de comptable peuvent supprimer ce type de dossier.';
        translation['l10n.accessForAdministrator'] = 'Seul le rôle d\'administrateur peut créer et modifier ce type de dossier.';
        translation['l10n.deleteAccessForAdministrator'] = 'Seul le rôle d\'administrateur peut supprimer ce type de dossier.';
        translation['l10n.noPagePrivilege'] = 'Vous n\'avez pas la permission d\'afficher cette page.';
        translation['dq.pdfemail.folderName'] = 'Lettres de relance au format PDF à imprimer';
        translation['dq.pdfemail.subject'] = 'Les lettres de relance générées au format PDF sont prêtes pour impression dans le classeur de rangement.';
        translation['dq.pdfemail.link'] = 'Cliquez sur le lien pour afficher le dossier contenant les lettres au format PDF:';
        translation['dq.pdfemail.tableHead'] = 'Le tableau suivant fournit des détails sur les dossiers contenant les fichiers au format PDF.';
        translation['dq.pdfemail.exceedLimit'] = 'Les fichiers générés n’ont pas pu être joints, car leur taille dépasse la limite des pièces jointes.';
        translation['dq.pdfemail.tableLabel1'] = 'Dossiers';
        translation['dq.pdfemail.tableLabel2'] = 'Chemin d’accès';
        translation['dq.pdfemail.tableLabel3'] = 'Statut';
        translation['dq.pdfemail.tableLabel4'] = 'Remarques';


        break;

      case 'fr_FR':
      case 'fr-FR':
        translation['dsa.response.none_found'] = 'Aucune procédure de relance disponible.';
        translation['form.dunning_template.title'] = 'Modèle de relance';
        translation['field.template.name'] = 'Nom';
        translation['field.template.description'] = 'Description';
        translation['field.template.attachStatement'] = 'Joindre le relevé';
        translation['field.template.overdue_invoices_stmt'] = 'Uniquement les factures en souffrance sur l\'état';
        translation['field.template.inactive'] = 'Inactif';
        translation['field.template.attach_invoice_copy'] = 'Joindre des copies des factures';
        translation['field.template.only_overdue_invoices'] = 'Uniquement les factures en souffrance';
        translation['field.template.subject'] = 'Objet';
        translation['selection.template.savedsearch'] = 'Recherche enregistrée';
        translation['selection.template.searchcolumn'] = 'Colonne de recherche';
        translation['label.template.lettertext'] = 'Texte des lettres';
        translation['dba.form.title'] = 'Attribution en masse de relances';
        translation['dba.form.source'] = 'S\'applique à';
        translation['dba.form.procedure'] = 'Procédure de relance';
        translation['dba.form.source.help'] = 'S\'applique à';
        translation['dba.form.procedure.help'] = 'Procédure de relance';
        translation['dba.form.dunning_manager'] = 'Responsable des relances';
        translation['dba.form.dunning_manager.help'] = 'Responsable des relances';
        translation['dba.tab.invoice'] = 'Factures';
        translation['dba.sublist.invoice'] = 'Factures';
        translation['dba.tab.customer'] = 'Clients';
        translation['dba.sublist.customer'] = 'Clients';
        translation['dba.sublist.common.id'] = 'Numéro d\'identification (ID)';
        translation['dba.sublist.common.customer'] = 'Client';
        translation['dba.sublist.invoice.invoice'] = 'Facture';
        translation['dba.sublist.invoice.amount'] = 'Montant';
        translation['dba.sublist.invoice.currency'] = 'Devise';
        translation['dba.sublist.invoice.duedate'] = 'Date d\'échéance';
        translation['dba.sublist.invoice.days_overdue'] = 'Jours de retard';
        translation['dba.sublist.customer.subsidiary'] = 'Filiale';
        translation['dba.sublist.common.assign_dunning'] = 'Attribuer';
        translation['dba.sublist.common.dunning_procedure'] = 'Procédure de relance';
        translation['dba.sublist.common.dunning_level'] = 'Niveau de relance';
        translation['dba.sublist.common.last_letter_sent'] = 'Date d\'envoi de la dernière lettre';
        translation['dba.sublist.common.dunning_sending_type'] = 'Type d\'envoi';
        translation['dba.sublist.common.page_next'] = '>';
        translation['dba.sublist.common.page_previous'] = '<';
        translation['dba.sublist.common.page_option'] = '{startIndex} - {endIndex} sur {totalEntryCount}';
        translation['dba.form.restriction'] = 'Critères de sélection';
        translation['dba.form.selection'] = 'Sélection de la procédure de relance';
        translation['dba.form.restriction.subsidiary'] = 'Filiales';
        translation['dba.form.restriction.location'] = 'Lieux';
        translation['dba.form.restriction.dept'] = 'Départements';
        translation['dba.form.restriction.class'] = 'Classes';
        translation['dba.form.restriction.search'] = 'Recherche enregistrée';
        translation['dba.form.action.assign'] = 'Attribuer';
        translation['dba.form.action.assign_customer'] = 'Attribuer aux clients';
        translation['dba.form.action.assign_invoice'] = 'Attribuer aux factures';
        translation['dba.form.action.cancel'] = 'Annuler';
        translation['dba.form.notification.highnumberofrecord'] = 'Le traitement de cette demande pourra prendre quelques secondes. Veuillez patienter jusqu\'à ce que vous soyez redirigé vers la page de procédure de relance.';
        translation['dqf.form.action.send'] = 'Envoyer';
        translation['dqf.form.action.print'] = 'Imprimer';
        translation['dqf.form.action.remove'] = 'Supprimer';
        translation['dqf.form.send.title'] = 'File d\'attente d\'envoi des e-mails de relance';
        translation['dqf.form.print.title'] = 'File d\'attente à l\'impression des PDF de relance';
        translation['dqf.filter.fieldGroup'] = 'Filtres';
        translation['dqf.filter.inlineHelp'] = 'Utilisez les filtres pour effectuer des recherches plus spécifiques ou pour restreindre les résultats à afficher.';
        translation['dqf.filter.applyFiltersButton'] = 'Recherche';
        translation['dqf.filter.customer'] = 'Client';
        translation['dqf.filter.recipient'] = 'Destinataire';
        translation['dqf.filter.procedure'] = 'Procédure de relance';
        translation['dqf.filter.dpLevel'] = 'Niveau de relance';
        translation['dqf.filter.appliesTo'] = 'S\'applique à';
        translation['dqf.filter.allowPrint'] = 'Autoriser l\'impression';
        translation['dqf.filter.allowEmail'] = 'Autoriser l\'e-mail';
        translation['dqf.filter.lastLtrSentStart'] = 'Date de début de la dernière lettre envoyée';
        translation['dqf.filter.lastLtrSentEnd'] = 'Date de fin de la dernière lettre envoyée';
        translation['dqf.filter.evalDateStart'] = 'Date de début de l\'évaluation';
        translation['dqf.filter.evalDateEnd'] = 'Date de fin d\'évaluation';
        translation['dqf.filter.boolean.yes'] = 'Oui';
        translation['dqf.filter.boolean.no'] = 'Non';
        translation['dqf.sublist.send.title'] = 'File d\'attente d\'envoi des e-mails de relance';
        translation['dqf.sublist.print.title'] = 'File d\'attente à l\'impression des PDF de relance';
        translation['dqf.sublist.common.customer'] = 'Client';
        translation['dqf.sublist.common.mark'] = 'Cocher';
        translation['dqf.sublist.common.view'] = 'Afficher';
        translation['dqf.sublist.common.id'] = 'Numéro d\'identification (ID)';
        translation['dqf.sublist.dp.applies_to'] = 'S\'applique à';
        translation['dqf.sublist.common.dunning_procedure'] = 'Procédure de relance';
        translation['dqf.sublist.common.dunning_level'] = 'Niveau';
        translation['dqf.sublist.record.last_letter_sent'] = 'Dernière lettre envoyée';
        translation['dqf.sublist.record.dunning_allow_email'] = 'Autoriser l\'e-mail';
        translation['dqf.sublist.record.dunning_allow_print'] = 'Autoriser l\'impression';
        translation['dqf.sublist.record.pause_dunning'] = 'Mettre la relance en pause';
        translation['dqf.sublist.common.evaluation_date'] = 'Date d\'évaluation';
        translation['dqf.sublist.common.related_entity'] = 'Destinataire';
        translation['dbu.form.title'] = 'Mise à jour en masse de la relance sur les dossiers de clients';
        translation['dbu.form.update_button'] = 'Mettre à jour';
        translation['dbu.form.field.subsidiary'] = 'Filiale';
        translation['dbu.form.flh.subsidiary'] = 'Sélectionnez la filiale pour laquelle vous souhaitez réaliser une mise à jour en masse des champs de relance sur les dossiers de clients. Les mises à jour seront appliquées à l\'ensemble des dossiers de clients qui appartiennent à la filiale sélectionnée.';
        translation['dbu.form.field.allow_email'] = 'Autoriser l\'envoi de lettres par e-mail';
        translation['dbu.form.flh.allow_email'] = 'Sélectionnez une valeur à appliquer dans ce champ des dossiers de clients une fois la mise à jour en masse réalisée :\nNon modifié : la valeur actuelle du champ ne sera pas modifiée. \nCoché : la case sera cochée sur tous les dossiers des clients après la mise à jour en masse. \nNon coché : la case ne sera pas cochée après la mise à jour en masse.';
        translation['dbu.form.field.allow_print'] = 'Autoriser l\'impression de lettres';
        translation['dbu.form.flh.allow_print'] = 'Sélectionnez une valeur à appliquer dans ce champ des dossiers de clients une fois la mise à jour en masse réalisée :\nNon modifié : la valeur actuelle du champ ne sera pas modifiée. \nCoché : la case sera cochée sur tous les dossiers des clients après la mise à jour en masse. \nNon coché : la case ne sera pas cochée après la mise à jour en masse.';
        translation['dbu.form.field.dont_send_cust_email'] = 'Ne pas envoyer de lettre à l\'adresse électronique du client';
        translation['dbu.form.flh.dont_send_cust_email'] = 'Sélectionnez une valeur à appliquer dans ce champ des dossiers de clients une fois la mise à jour en masse réalisée :\nNon modifié : la valeur actuelle du champ ne sera pas modifiée. \nCoché : la case sera cochée sur tous les dossiers des clients après la mise à jour en masse. \nNon coché : la case ne sera pas cochée après la mise à jour en masse.';
        translation['dbu.form.primary_field_group'] = 'Critères';
        translation['dbu.form.bulk_update_field_group'] = 'Mise à jour en masse des champs';
        translation['dbu.form.options.unchanged'] = '- Non modifié -';
        translation['dbu.form.options.checked'] = 'Coché';
        translation['dbu.form.options.not_checked'] = 'Non coché';
        translation['dbu.validation.no_selection'] = 'Il n\'existe aucun champ à mettre à jour car "Non modifié" est sélectionné pour tous les champs. Une mise à jour en masse peut uniquement être réalisée si une modification est spécifiée dans au moins l\'un des champs (Coché ou Non coché).';
        translation['dbu.validation.no_sending_media'] = 'Il n\'est pas possible d\'enregistrer les dossiers de clients si aucune des deux cases "Autoriser l\'envoi de lettres par e-mail" et "Autoriser l\'impression de lettres" n\'est cochée. Sélectionnez Coché dans l\'une des cases suivantes au moins :\n- Autoriser l\'envoi de lettres par e-mail\n- Autoriser l\'impression de lettres';
        translation['dbu.validation.verify_submit_ow'] = 'Tous les dossiers de clients associés à une procédure de relance et appartenant à la filiale sélectionnée seront mis à jour. {SUBSIDIARY} Vous recevrez un courriel lorsque le processus est terminé. Êtes-vous sûr de vouloir procéder à la mise à jour en masse ? Si vous cliquez sur OK, le processus de mise à jour en masse sera lancé et ne pourra pas être annulé.';
        translation['dbu.validation.verify_submit_si'] = 'Tous les dossiers de clients associés à une procédure de relance seront mis à jour. Vous recevrez un courriel lorsque le processus est terminé. Êtes-vous sûr de vouloir procéder à la mise à jour en masse ? Si vous cliquez sur OK, le processus de mise à jour en masse sera lancé et ne pourra pas être annulé.';
        translation['dbu.form.reminderinlinehelp'] = 'NetSuite vous recommande d\'utiliser la fonction de mise à jour en masse en dehors des vos heures de bureau habituelles pour vous assurer que les autres utilisateurs de votre entreprise ne travaillent pas sur les dossiers des clients pendant le processus de mise à jour en masse.';
        translation['dbu.validation.validate_concurrency_ow'] = 'Une mise en jour a été lancée par  {USER} pour les données de relance des dossiers de clients associés à cette filiale, {SUBSIDIARY}. Ce processus de mise à jour en masse doit être terminé avant que vous puissiez réaliser une autre mise à jour en masse des clients de cette même filiale.';
        translation['dbu.validation.validate_concurrency_si'] = 'Le système peut seulement exécuter une mise à jour en masse à la fois. Une mise à jour en masse lancée par  {USER}est en cours d\'exécution.';
        translation['dbu.customer.message.complete_subject'] = 'Mise à jour en masse de la relance sur les dossiers de clients';
        translation['dbu.customer.message.complete_body_ow'] = [
          'Salutations de NetSuite.<br />',
          'La mise à jour en masse de la relance sur les dossiers de clients de cette filiale est terminée. {SUBSIDIARY}',
          'Autoriser l\'envoi de lettres par e-mail = {ALLOW_EMAIL}',
          'Autoriser l\'impression de lettres = {ALLOW_PRINT}',
          'Ne pas envoyer de lettre à l\'adresse électronique du client = {DONT_SEND_TO_CUST}<br />',
          'Nombre de dossiers de clients mis à jour : {PROCESSED_RECORDS} sur {RECORD_COUNT}.{ERROR_STEPS}',
          'Ce message a été généré par le système.<br />',
          'Merci,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.complete_body_si'] = [
          'Salutations de NetSuite.<br />',
          'La mise à jour en masse de la relance sur les dossiers des clients est terminée.',
          'Autoriser l\'envoi de lettres par e-mail = {ALLOW_EMAIL}',
          'Autoriser l\'impression de lettres = {ALLOW_PRINT}',
          'Ne pas envoyer de lettre à l\'adresse électronique du client = {DONT_SEND_TO_CUST}<br />',
          'Nombre de dossiers de clients mis à jour : {PROCESSED_RECORDS} sur {RECORD_COUNT}.{ERROR_STEPS}',
          'Ce message a été généré par le système.<br />',
          'Merci,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.error_file_header'] = 'Erreur du numéro d\'identification du client';
        translation['dbu.customer.message.error_filename'] = 'Failed Updates.csv';
        translation['dbu.customer.message.error_steps'] = '<br />Veuillez télécharger le fichier ci-joint pour consulter la liste des dossiers qui n\'ont pas été mis à jour. Vous pouvez mettre à jour ces dossiers manuellement.';
        translation['dc.validateCustomer.noDPMatched'] = 'Aucune procédure de relance correspondant au dossier du client n\'a été trouvée.';
        translation['dc.validateCustomer.recipientNoEmail'] = 'Les destinataires de lettres de relance suivants n\'ont pas d\'adresse électronique dans leur dossier de contact : {CONTACTNAMES}.';
        translation['dc.validateCustomer.customerNoEmail'] = 'Il n\'est pas possible d\'enregistrer le dossier. La case "Autoriser l\'envoi de lettres par e-mail" est cochée mais il n\'y a aucune adresse électronique ou aucun destinataire de relance à qui envoyer les lettres. Pour enregistrer ce dossier, l\'une des conditions suivantes doit être vraie :\n- Au moins un contact avec une adresse électronique est indiqué dans le sous-onglet Destinataire de relance.\n- Une adresse électronique est indiquée dans le champ E-mail du dossier du client.\n\nNote : L\'adresse électronique du client est uniquement requise si la case "Ne pas envoyer de lettre à l\'adresse électronique du client" n\'est pas cochée.';
        translation['dc.validateCustomer.noEmailAtAll'] = 'Aucune adresse électronique n\'est indiquée sur le dossier du client, de même qu\'aucun destinataire de lettre de relance n\'est indiqué pour ce client. Ajoutez une adresse électronique sur le dossier du client ou, dans le sous-onglet Relance, sélectionnez au moins un destinataire de lettre de relance ayant une adresse électronique.';
        translation['dc.validateCustomer.recipientListEmpty'] = 'Il n\'est pas possible d\'enregistrer le dossier. La case "Autoriser l\'envoi de lettres par e-mail" est cochée mais il n\'y a aucun destinataire de relance à qui envoyer les lettres. Pour enregistrer ce dossier, vous devez indiquer au moins un contact avec une adresse électronique dans le sous-onglet Destinataires de relance. \n\nRemarque : L\'adresse électronique du client est uniquement requise si la case "Ne pas envoyer de lettre à l\'adresse électronique du client" n\'est pas cochée.';
        translation['dc.validateCustomer.dpMatched'] = 'Le dossier du client est associé à la procédure de relance "{DP}". Souhaitez-vous modifier cette procédure de relance ?';
        translation['dc.validateCustomer.dpAllReadyAssigned'] = 'La procédure de relance trouvée est identique à celle déjà attribuée dans le dossier.';
        translation['dc.validateDP.managerRequired'] = 'Un responsable des relances est requis.';
        translation['dc.validateDP.sendingModeRequired'] = 'Au moins une des cases suivantes doit être cochée :\n- Autoriser l\'envoi de lettres par e-mail\n- Autoriser l\'impression de lettres';
        translation['dl.validateDL.dlCountExceeded'] = 'Vous avez dépassé le montant maximum de niveaux de relance possible.';
        translation['dl.validateDL.lowerDaysOverDue'] = 'Le nombre de jours de retard doit être inférieur à {DAYS}.';
        translation['dl.validateDL.higherDaysOverdue'] = 'Le nombre de jours de retard doit être supérieur à {DAYS}.';
        translation['dl.validateDL.daysOverdueExist'] = 'Le nombre de jours de retard  {DAYS} figure déjà dans une autre ligne.';
        translation['dl.validateDL.lastRecordDeletion'] = 'Vous pouvez uniquement supprimer le dernier dossier de la liste.';
        translation['dl.validateDL.daysBetSending'] = 'Le nombre de jours entre l\'envoi des lettres doit être supérieur ou égal à {DAYS}';
        translation['dl.validateDL.minOutsBalGEZero'] = 'Le montant en souffrance minimum doit être au moins zéro (0).';
        translation['dl.validateDL.daysOverdueLessPrevious'] = 'Le nombre de jours de retard dans le Niveau de relance {LEVEL} ({LEVEL_OVERDUE} jours) doit être inférieur au nombre de jours de retard du Niveau de relance {PREVLEVEL} ({PREVLEVEL_OVERDUE} jours).';
        translation['dl.validateDL.dlRequired'] = 'Au moins un niveau de relance est requis.';
        translation['dp.validateDP.editNotAllowed'] = 'Vous n\'êtes pas autorisé à modifier ce type de procédure de relance.';
        translation['dp.information.possibleMultipleSending'] = 'Si vous désactivez le champ "Intervalle minimum de relance", votre compte pourra envoyer plusieurs lettres de relance au même client dans la même journée. Êtes-vous sûr de vouloir le désactiver ?';
        translation['dba.pagination.failedPrevPage'] = 'Impossible de revenir à la page précédente.';
        translation['dq.validation.str_send'] = 'envoyer';
        translation['dq.validation.str_remove'] = 'supprimer';
        translation['dq.validation.str_print'] = 'imprimer';
        translation['dq.validation.chooseAction'] = 'Veuillez choisir une lettre pour ';
        translation['dq.validation.removalConfirmation'] = 'Êtes-vous sûr de vouloir supprimer les dossiers sélectionnés de la file d\'attente ?';
        translation['dq.pt.dunningQueueTitle'] = 'File d\'attente des relances';
        translation['dq.pt.source'] = 'Type de source';
        translation['dq.pt.dunningProcedure'] = 'Procédure de relance';
        translation['dq.pt.dunningLevel'] = 'Niveau de relance';
        translation['dq.pt.lastLetterSent'] = 'Dernière lettre envoyée';
        translation['dq.pt.emailingAllowed'] = 'Envoi par e-mail autorisé';
        translation['dq.pt.printingAllowed'] = 'Impression autorisée';
        translation['dq.pt.send'] = 'Envoyer';
        translation['dq.pt.remove'] = 'Supprimer';
        translation['dq.pt.print'] = 'Imprimer';
        translation['dq.pt.customer'] = 'Client';
        translation['dt.validator.invalidDefault'] = 'Un modèle par défaut doit être sélectionné pour chacun des types de modèle de relance. Vérifiez les sous-onglets E-mail et PDF et sélectionnez un modèle par défaut.';
        translation['dt.validator.duplicateLanguage'] = 'Cette langue est déjà utilisée pour ce type de modèle.';
        translation['dt.validator.noTemplateDocs'] = 'Pour enregistrer ce dossier, au moins un document modèle d\'e-mail et un document de modèle PDF sont obligatoires.';
        translation['dt.validator.subject'] = 'Échec de la validation du document modèle de relance';
        translation['dt.validator.body'] = 'Les documents modèles suivants sont non valides :';
        translation['dt.validator.defaultDeletion'] = 'Vous tentez de supprimer un modèle qui est actuellement le modèle par défaut. Pour supprimer ce modèle, vous devez d\'abord sélectionner un modèle par défaut différent.';
        translation['dt.validator.xmlEmailDeprecated'] = 'Vous ne pouvez pas ajouter, modifier ou supprimer de lignes sur un modèle d\'e-mail XML. L\'utilisation de modèles d\'e-mail de relance basés sur XML sera progressivement éliminée. Si vous ajoutez des modèles d\'e-mail au sous-onglet Modèle d\'e-mail de relance, lorsque vous enregistrez ce dossier, toutes les lignes du sous-onglet Modèle d\'e-mail XML de relance seront supprimées.';
        translation['dt.validator.deleteAllXMLLines'] = 'Si vous enregistrez ce dossier, toutes les lignes de l\'onglet Modèle d\'e-mail XML de relance seront supprimées.';
        translation['dt.validator.noEMailDocs'] = 'Au moins un modèle d\'e-mail doit être présent pour enregistrer ce dossier.';
        translation['dt.validator.noPDFDocs'] = 'Au moins un modèle PDF doit être présent pour enregistrer ce dossier.';
        translation['dt.validator.multipleDefault'] = 'Êtes-vous sûr de utiliser ce modèle en tant que modèle par défaut ?';
        translation['dlr.validateDLR.noAmount'] = 'La règle du niveau de relance doit comporter au moins un montant de la règle du niveau de relance.';
        translation['dlr.validateDLR.noDefaultAmount'] = 'La règle du niveau de relance doit comporter au moins un montant de la règle du niveau de relance défini comme montant par défaut.';
        translation['dlr.validateDLR.duplicateCurrency'] = 'La devise doit être unique.';
        translation['dlr.validateDLR.invalidAmount'] = 'Le montant doit être supérieur ou égal à 0.';
        translation['dlr.validateDLR.changeDefaultCurrency'] = 'Êtes-vous sûr de vouloir utiliser par défaut la devise et le montant de cette ligne ? (La devise et le montant par défaut actuels seront alors modifiés.)';
        translation['dlr.validateDLR.negativeDaysOverdue'] = 'Un nombre négatif a été saisi dans le champ Jours de retard. Cela signifie qu\'une lettre sera envoyée au client avant la date d\'échéance du paiement.';
        translation['dlr.validateDLR.daysOverdueChanged'] = 'La modification de la valeur de Jours de retard dans une règle de niveau de relance peut entraîner la modification de la séquence ou de l\'ordre des niveaux de relance, ce qui peut par la suite engendrer l\'envoi de lettres de relance incorrectes.\n\n Il est recommandé de vérifier l\'ordre des niveaux de relance dans chaque procédure de relance ({DP_LIST}) où le niveau de relance que vous souhaitez modifier est utilisé.';
        translation['dlr.validateDLR.cannotAddCurrency'] = 'Il n\'est pas possible d\'ajouter la devise car la fonction Multidevises n\'est pas activée.';
        translation['der.flh.dunningProcedure'] = 'Ce champ indique la procédure de relance attribuée à la facture ou au client.';
        translation['der.flh.dunningLevel'] = 'Ce champ indique le niveau de relance actuel après l\'évaluation.';
        translation['der.flh.relatedEntity'] = 'Ce champ est lié à l\'entité ou au dossier de contact du destinataire de la relance.';
        translation['der.flh.messageContent'] = 'Ce champ contient le contenu de la lettre de relance.';
        translation['der.flh.invoiceList'] = 'Ce champ répertorie les factures associées à la lettre de relance. ';
        translation['der.flh.emailRecipient'] = 'Ce champ affiche les adresses électroniques des destinataires de la lettre de relance.';
        translation['der.flh.subject'] = 'Ce champ affiche la ligne d\'objet de la lettre de relance.';
        translation['der.flh.dunningManager'] = 'Ce champ affiche le responsable des relances attribué au client. Il est lié au dossier d\'employé du responsable des relances.';
        translation['der.flh.dunningTemplate'] = 'Ce champ est lié au dossier du modèle de relance.';
        translation['der.flh.customer'] = 'Ce champ est lié au dossier client.';
        translation['der.flh.status'] = 'Ce champ indique si votre courrier électronique a été envoyé avec succès ou non. Le statut peut être l\'un des suivants :\n\n• Envoyé : le message a été envoyé avec succès.\n• Échec : le système n\'a pas pu envoyer votre message en raison d\'un manque d\'information. Par exemple, aucune adresse électronique n\'a été saisie pour le client ou le contact.\n• En file d\'attente : la lettre de relance se trouve toujours dans la file d\'attente des relances et n\'a pas encore été traitée.\n• Supprimé : le responsable des relances a supprimé ce dossier de la file d\'attente des relances.';
        translation['dlr.flh.daysOverdue'] = 'Saisissez le nombre de jours au bout duquel une lettre de relance doit être envoyée une fois la date d\'échéance de paiement passée. Si vous souhaitez envoyer une lettre de relance avant la date d\'échéance, saisissez une valeur négative.';
        translation['ds.flh.description'] = 'Saisissez une description pour ce dossier.';
        translation['dp.flh.dunningProcedure'] = 'Saisissez un nom pour cette procédure de relance.';
        translation['dp.flh.description'] = 'Saisissez une description pour cette procédure de relance.';
        translation['dp.flh.appliesTo'] = 'Indiquez si cette procédure de relance sera attribuée à des clients ou à des factures. Si vous choisissez Client, vous devez également cochez ou décocher la case "Autoriser les remplacements".';
        translation['dp.flh.sendingSchedule'] = 'Sélectionnez si les lettres de relance seront envoyées automatiquement ou manuellement.';
        translation['dp.flh.minimumDunningInterval'] = 'Sélectionnez le nombre de jours minimum séparant l\'envoi de deux lettres consécutives au même client. Cet intervalle s\'applique aux envois automatiques et manuels.';
        translation['dp.flh.subsidiary'] = 'Sélectionnez les filiales auxquelles cette procédure de relance s\'applique.';
        translation['dp.flh.savedSearchCustomer'] = 'Sélectionnez la recherche enregistrée de client à laquelle cette procédure s\'applique.';
        translation['dp.flh.allowOverride'] = 'Si vous cochez cette case, une procédure de relance au niveau des factures pourra remplacer cette procédure. Une procédure de relance au niveau des factures sera utilisée lorsqu\'une facture répond aux critères de ladite procédure, même si une procédure de relance a déjà été attribuée au niveau des clients.';
        translation['dp.flh.department'] = 'Sélectionnez les départements auxquels cette procédure s\'applique. ';
        translation['dp.flh.class'] = 'Sélectionnez les classes auxquelles cette procédure s\'applique.';
        translation['dp.flh.location'] = 'Sélectionnez les lieux auxquels cette procédure s\'applique.';
        translation['dp.flh.savedSearchInvoice'] = 'Sélectionnez la recherche enregistrée de factures à laquelle cette procédure s\'applique.';
        translation['dp.flh.assignAutomatically'] = 'Cochez cette case pour permettre au système d\'attribuer automatiquement cette procédure de relance aux clients ou aux factures en fonction des critères de sélection.';
        translation['dt.flh.name'] = 'Saisissez un nom pour ce modèle de relance.';
        translation['dt.flh.description'] = 'Saisissez une description pour ce modèle de relance.';
        translation['dt.flh.attachStatement'] = 'Cochez cette case pour joindre des relevés clients aux lettres de relance qui utilisent ce modèle. ';
        translation['dt.flh.attachInvoiceCopy'] = 'Cochez cette case pour joindre des factures aux lettres de relance qui utilisent ce modèle.';
        translation['dt.flh.overdueInvoiceOnly'] = 'Cochez cette case si vous souhaitez joindre uniquement les factures en souffrance.';
        translation['dt.flh.openTransactionOnly'] = 'Cochez cette case si vous souhaitez inclure uniquement les transactions en cours sur les relevés du client.';
        translation['dt.flh.inactive'] = 'Cochez cette case pour désactiver le modèle. Les modèles inactifs n\'apparaissent pas dans les listes et ne peuvent pas être utilisés pour l\'envoi de lettres de relance.';
        translation['dc.flh.allowEmail'] = 'Cochez cette case si vous voulez que les lettres de relance soient envoyées par e-mail.';
        translation['dc.flh.lastLetterSent'] = 'La date à laquelle la dernière lettre de relance a été envoyée.';
        translation['dc.flh.dunningLevel'] = 'Ce champ indique le niveau de relance actuel tel que déterminé par la dernière évaluation de relance.';
        translation['dc.flh.dunningManager'] = 'Sélectionnez la personne responsable des relances de ce client et le nom qui apparaîtra en tant qu\'expéditeur de la lettre de relance.';
        translation['dc.flh.dunningProcedure'] = 'Ce champ indique la procédure de relance attribuée au client. Si vous cliquez sur "Attribuer automatiquement", le système attribue la procédure adéquate en fonction des critères de sélection de la relance. Sélectionnez une valeur différente dans la liste déroulante pour modifier la procédure de relance attribuée au client. La liste déroulante affiche uniquement les procédures applicables à ce client, en fonction des critères de sélection définis dans les dossiers de procédures de relance.';
        translation['dc.flh.allowPrint'] = 'Cochez cette case si vous voulez que les lettres de relance soient imprimées.';
        translation['dc.flh.pauseReason'] = 'Sélectionnez une raison expliquant pourquoi la relance a été mise en pause.';
        translation['dc.flh.pauseReasonDetail'] = 'Sélectionnez un détail expliquant la raison pour laquelle la relance a été mise en pause.';
        translation['dc.flh.pauseDunning'] = 'Cochez cette case pour interrompre provisoirement le processus de relance.';
        translation['dc.flh.dunningRecepients'] = 'Sélectionnez des destinataires supplémentaires de la relance';
        translation['dc.flh.allowEmail'] = 'Cochez cette case si vous voulez que les lettres de relance soient envoyées par e-mail.';
        translation['di.flh.lastLetterSent'] = 'La date à laquelle la dernière lettre de relance a été envoyée.';
        translation['di.flh.dunningLevel'] = 'Ce champ indique le niveau de relance actuel tel que déterminé par la dernière évaluation de relance.';
        translation['di.flh.dunningManager'] = 'Sélectionnez la personne responsable des relances de cette facture et le nom qui apparaîtra en tant qu\'expéditeur de la lettre de relance.';
        translation['di.flh.dunningProcedure'] = 'Ce champ indique la procédure de relance attribuée à la facture. Si vous cliquez sur "Attribuer automatiquement", le système attribue la procédure adéquate en fonction des critères de sélection de la relance. Sélectionnez une valeur différente dans la liste déroulante pour modifier la procédure de relance attribuée à la facture. La liste déroulante affiche uniquement les procédures applicables à cette facture, en fonction des critères de sélection définis dans les dossiers de procédures de relance.';
        translation['di.flh.allowPrint'] = 'Cochez cette case si vous voulez que les lettres de relance soient imprimées.';
        translation['di.flh.pauseReason'] = 'Sélectionnez une raison expliquant pourquoi la relance a été mise en pause.';
        translation['di.flh.pauseReasonDetail'] = 'Sélectionnez un détail expliquant la raison pour laquelle la relance a été mise en pause.';
        translation['di.flh.pauseDunning'] = 'Cochez cette case pour interrompre provisoirement le processus de relance.';
        translation['dp.validate.unpause'] = 'Si vous décochez la case "Mettre la relance en pause", le flux de production d\'évaluation de la relance sera immédiatement déclenché. NetSuite pourra envoyer une lettre de relance à ce client en fonction du résultat de l\'évaluation de la relance. Êtes-vous sûr de vouloir reprendre la relance ?';
        translation['dc.validateSubsidiary.existingConfigSubsidiary'] = 'Un dossier de configuration de relance existe déjà dans la base de données pour cette filiale.';
        translation['l10n.address.invalidPOBox'] = 'Veuillez saisir un numéro de boîte postale valide.';
        translation['l10n.address.invalidZipCode'] = 'Veuillez saisir un code postal valide.';
        translation['l10n.address.invalidRuralRoute'] = 'Veuillez saisir une valeur de route rurale valide.';
        translation['l10n.accessForDDandAccountant'] = 'Seuls les rôles d\'administrateur, de directeur des relances et de comptable peuvent créer et modifier ce type de dossier.';
        translation['l10n.deleteAccessForDDandAccountant'] = 'Seuls les rôles d\'administrateur, de directeur des relances et de comptable peuvent supprimer ce type de dossier.';
        translation['l10n.accessForAdministrator'] = 'Seul le rôle d\'administrateur peut créer et modifier ce type de dossier.';
        translation['l10n.deleteAccessForAdministrator'] = 'Seul le rôle d\'administrateur peut supprimer ce type de dossier.';
        translation['l10n.noPagePrivilege'] = 'Vous n\'avez pas la permission d\'afficher cette page.';
        translation['dq.pdfemail.folderName'] = 'Lettres de relance au format PDF à imprimer';
        translation['dq.pdfemail.subject'] = 'Les lettres de relance générées au format PDF sont prêtes pour impression dans le classeur de rangement.';
        translation['dq.pdfemail.link'] = 'Cliquez sur le lien pour afficher le dossier contenant les lettres au format PDF:';
        translation['dq.pdfemail.tableHead'] = 'Le tableau suivant fournit des détails sur les dossiers contenant les fichiers au format PDF.';
        translation['dq.pdfemail.exceedLimit'] = 'Les fichiers générés n’ont pas pu être joints, car leur taille dépasse la limite des pièces jointes.';
        translation['dq.pdfemail.tableLabel1'] = 'Dossiers';
        translation['dq.pdfemail.tableLabel2'] = 'Chemin d’accès';
        translation['dq.pdfemail.tableLabel3'] = 'Statut';
        translation['dq.pdfemail.tableLabel4'] = 'Remarques';

        break;

      case 'it_IT':
      case 'it-IT':
        translation['dsa.response.none_found'] = 'Nessuna procedura di sollecito disponibile.';
        translation['form.dunning_template.title'] = 'Modello di sollecito';
        translation['field.template.name'] = 'Nome';
        translation['field.template.description'] = 'Descrizione';
        translation['field.template.attachStatement'] = 'Allega rendiconto';
        translation['field.template.overdue_invoices_stmt'] = 'Solo fatture scadute sul rendiconto';
        translation['field.template.inactive'] = 'Non attivo';
        translation['field.template.attach_invoice_copy'] = 'Allega copie delle fatture';
        translation['field.template.only_overdue_invoices'] = 'Solo fatture scadute';
        translation['field.template.subject'] = 'Oggetto';
        translation['selection.template.savedsearch'] = 'Ricerca salvata';
        translation['selection.template.searchcolumn'] = 'Ricerca colonna';
        translation['label.template.lettertext'] = 'Testo lettera';
        translation['dba.form.title'] = 'Assegnazione in blocco solleciti';
        translation['dba.form.source'] = 'Applica a';
        translation['dba.form.procedure'] = 'Procedura di sollecito';
        translation['dba.form.source.help'] = 'Applica a';
        translation['dba.form.procedure.help'] = 'Procedura di sollecito';
        translation['dba.form.dunning_manager'] = 'Manager sollecito';
        translation['dba.form.dunning_manager.help'] = 'Manager sollecito';
        translation['dba.tab.invoice'] = 'Fatture';
        translation['dba.sublist.invoice'] = 'Fatture';
        translation['dba.tab.customer'] = 'Clienti';
        translation['dba.sublist.customer'] = 'Clienti';
        translation['dba.sublist.common.id'] = 'ID';
        translation['dba.sublist.common.customer'] = 'Cliente';
        translation['dba.sublist.invoice.invoice'] = 'Fattura';
        translation['dba.sublist.invoice.amount'] = 'Importo';
        translation['dba.sublist.invoice.currency'] = 'Valuta';
        translation['dba.sublist.invoice.duedate'] = 'Data di scadenza';
        translation['dba.sublist.invoice.days_overdue'] = 'Scaduto da giorni';
        translation['dba.sublist.customer.subsidiary'] = 'Filiale';
        translation['dba.sublist.common.assign_dunning'] = 'Assegna';
        translation['dba.sublist.common.dunning_procedure'] = 'Procedura di sollecito';
        translation['dba.sublist.common.dunning_level'] = 'Livello di sollecito';
        translation['dba.sublist.common.last_letter_sent'] = 'Data invio ultima lettera';
        translation['dba.sublist.common.dunning_sending_type'] = 'Invio tipo';
        translation['dba.sublist.common.page_next'] = '>';
        translation['dba.sublist.common.page_previous'] = '<';
        translation['dba.sublist.common.page_option'] = '{startIndex} - {endIndex} su {totalEntryCount}';
        translation['dba.form.restriction'] = 'Criteri di selezione';
        translation['dba.form.selection'] = 'Selezione procedura di sollecito';
        translation['dba.form.restriction.subsidiary'] = 'Filiali';
        translation['dba.form.restriction.location'] = 'Posizioni';
        translation['dba.form.restriction.dept'] = 'Reparti';
        translation['dba.form.restriction.class'] = 'Classi';
        translation['dba.form.restriction.search'] = 'Ricerca salvata';
        translation['dba.form.action.assign'] = 'Assegna';
        translation['dba.form.action.assign_customer'] = 'Assegna a Clienti';
        translation['dba.form.action.assign_invoice'] = 'Assegna a Fatture';
        translation['dba.form.action.cancel'] = 'Annulla';
        translation['dba.form.notification.highnumberofrecord'] = 'Per il completamento di questa richiesta possono essere necessari alcuni secondi. Attendere il reindirizzamento alla pagina di procedura di sollecito.';
        translation['dqf.form.action.send'] = 'Invia';
        translation['dqf.form.action.print'] = 'Stampa';
        translation['dqf.form.action.remove'] = 'Rimuovi';
        translation['dqf.form.send.title'] = 'Coda invio e-mail di sollecito';
        translation['dqf.form.print.title'] = 'Coda stampa PDF solleciti';
        translation['dqf.filter.fieldGroup'] = 'Filtri';
        translation['dqf.filter.inlineHelp'] = 'Utilizzare i filtri per rendere la ricerca più specifica o restringere i risultati visualizzati.';
        translation['dqf.filter.applyFiltersButton'] = 'Ricerca';
        translation['dqf.filter.customer'] = 'Cliente';
        translation['dqf.filter.recipient'] = 'Destinatario';
        translation['dqf.filter.procedure'] = 'Procedura di sollecito';
        translation['dqf.filter.dpLevel'] = 'Livello di sollecito';
        translation['dqf.filter.appliesTo'] = 'Applica a';
        translation['dqf.filter.allowPrint'] = 'Autorizza stampa';
        translation['dqf.filter.allowEmail'] = 'Autorizza e-mail';
        translation['dqf.filter.lastLtrSentStart'] = 'Data inizio ultima lettera inviata';
        translation['dqf.filter.lastLtrSentEnd'] = 'Data termine ultima lettera inviata';
        translation['dqf.filter.evalDateStart'] = 'Data inizio valutazione';
        translation['dqf.filter.evalDateEnd'] = 'Data termine valutazione';
        translation['dqf.filter.boolean.yes'] = 'SÌ';
        translation['dqf.filter.boolean.no'] = 'No';
        translation['dqf.sublist.send.title'] = 'Coda invio e-mail di sollecito';
        translation['dqf.sublist.print.title'] = 'Coda stampa PDF solleciti';
        translation['dqf.sublist.common.customer'] = 'Cliente';
        translation['dqf.sublist.common.mark'] = 'Segna';
        translation['dqf.sublist.common.view'] = 'Visualizzazione';
        translation['dqf.sublist.common.id'] = 'ID';
        translation['dqf.sublist.dp.applies_to'] = 'Applica a';
        translation['dqf.sublist.common.dunning_procedure'] = 'Procedura di sollecito';
        translation['dqf.sublist.common.dunning_level'] = 'Livello';
        translation['dqf.sublist.record.last_letter_sent'] = 'Ultima lettera inviata';
        translation['dqf.sublist.record.dunning_allow_email'] = 'Autorizza e-mail';
        translation['dqf.sublist.record.dunning_allow_print'] = 'Autorizza stampa';
        translation['dqf.sublist.record.pause_dunning'] = 'Pausa sollecito';
        translation['dqf.sublist.common.evaluation_date'] = 'Data valutazione';
        translation['dqf.sublist.common.related_entity'] = 'Destinatario';
        translation['dbu.form.title'] = 'Aggiornamento in blocco su record del cliente per sollecito';
        translation['dbu.form.update_button'] = 'Aggiorna';
        translation['dbu.form.field.subsidiary'] = 'Filiale';
        translation['dbu.form.flh.subsidiary'] = 'Seleziona la filiale per cui vuoi eseguire un aggiornamento in blocco dei campi di sollecito ai record del cliente. Gli aggiornamenti saranno applicati a tutti i record del cliente che appartengono alla scheda secondaria selezionata.';
        translation['dbu.form.field.allow_email'] = 'Autorizza lettere da inviare via e-mail';
        translation['dbu.form.flh.allow_email'] = 'Selezionare un valore da applicare a questo campo nei record cliente dopo aver eseguito l\'aggiornamento di massa:\nInvariato – Il valore attuale del campo non sarà modificato. \nSpuntato – La casella sarà spuntata sui record del cliente dopo l\'aggiornamento di massa. \nNon spuntato - La casella sarà vuota dopo l\'aggiornamento di massa.';
        translation['dbu.form.field.allow_print'] = 'Autorizza lettere da stampare';
        translation['dbu.form.flh.allow_print'] = 'Selezionare un valore da applicare a questo campo nei record cliente dopo aver eseguito l\'aggiornamento di massa:\nInvariato – Il valore attuale del campo non sarà modificato. \nSpuntato – La casella sarà spuntata sui record del cliente dopo l\'aggiornamento di massa. \nNon spuntato - La casella sarà vuota dopo l\'aggiornamento di massa.';
        translation['dbu.form.field.dont_send_cust_email'] = 'Non inviare lettere all\'e-mail del cliente';
        translation['dbu.form.flh.dont_send_cust_email'] = 'Selezionare un valore da applicare a questo campo nei record cliente dopo aver eseguito l\'aggiornamento di massa:\nInvariato – Il valore attuale del campo non sarà modificato. \nSpuntato – La casella sarà spuntata sui record del cliente dopo l\'aggiornamento di massa. \nNon spuntato - La casella sarà vuota dopo l\'aggiornamento di massa.';
        translation['dbu.form.primary_field_group'] = 'Criteri';
        translation['dbu.form.bulk_update_field_group'] = 'Campi aggiornamento di massa';
        translation['dbu.form.options.unchanged'] = '- Invariato - ';
        translation['dbu.form.options.checked'] = 'Spuntato';
        translation['dbu.form.options.not_checked'] = 'Non spuntato';
        translation['dbu.validation.no_selection'] = 'Non ci sono campi da aggiornare perché - Invariato - è selezionato per tutti i campi. Un aggiornamento di massa può essere eseguito se viene specificato un cambiamento in almeno un campo (Spuntato o Non spuntato).';
        translation['dbu.validation.no_sending_media'] = 'I record dei clienti non possono essere salvati se la casella Autorizza lettere da inviare via e-mail e la casella Autorizza lettere da stampare non sono spuntate. Seleziona Spuntata almeno per una delle seguenti caselle:\n- Autorizza l\'invio tramite e-mail di lettere\n- Autorizza la stampa delle lettere';
        translation['dbu.validation.verify_submit_ow'] = 'Tutte le registrazioni clienti con procedure di sollecito saranno aggiornate per la filiale selezionata. {SUBSIDIARY} Si riceverà un messaggio e-mail di notifica del completamento del processo. Continuare con l\'aggiornamento in massa? Se si fa clic su OK, il processo di elaborazione di massa inizierà e l\'azione non potrà essere annullata.';
        translation['dbu.validation.verify_submit_si'] = 'Tutte le registrazioni clienti con procedure di sollecito saranno aggiornate. Si riceverà un messaggio e-mail di notifica del completamento del processo. Continuare con l\'aggiornamento in massa? Se si fa clic su OK, il processo di elaborazione di massa inizierà e l\'azione non potrà essere annullata.';
        translation['dbu.form.reminderinlinehelp'] = 'NetSuite consiglia di utilizzare la funzione aggiornamento di massa al di fuori delle normali ore di lavoro. Ciò è per assicurare che gli altri utenti dell\'azienda non stiano aggiornando record di clienti durante la procedura di aggiornamento di massa.';
        translation['dbu.validation.validate_concurrency_ow'] = 'L\'aggiornamento in blocco sui record del cliente per sollecito è stato avviato da {USER} per la filiale, {SUBSIDIARY}. L\'aggiornamento di massa deve essere completato prima di eseguire un altro aggiornamento di massa dei clienti per la stessa filiale.';
        translation['dbu.validation.validate_concurrency_si'] = 'Il sistema può eseguire solo un aggiornamento di massa per volta. L\'aggiornamento di massa iniziato da  {USER} è attualmente avviato.';
        translation['dbu.customer.message.complete_subject'] = 'Aggiornamento in blocco sui record del cliente per sollecito';
        translation['dbu.customer.message.complete_body_ow'] = [
          'Saluti da NetSuite!<br />',
          'Aggiornamento in blocco su record del cliente per sollecito completato per la filiale. {SUBSIDIARY}',
          'Autorizza lettere da inviare via e-mail = {ALLOW_EMAIL}',
          'Autorizza lettere da stampare = {ALLOW_PRINT}',
          'Non inviare lettere all\'e-mail del cliente = {DONT_SEND_TO_CUST}<br />',
          'Numero di registrazioni clienti aggiornate: {PROCESSED_RECORDS} su {RECORD_COUNT}.{ERROR_STEPS}',
          'Questa è una e-mail generata dal sistema<br />',
          'Grazie,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.complete_body_si'] = [
          'Saluti da NetSuite!<br />',
          'Aggiornamento in blocco su record del cliente per sollecito completato.',
          'Autorizza lettere da inviare via e-mail = {ALLOW_EMAIL}',
          'Autorizza lettere da stampare = {ALLOW_PRINT}',
          'Non inviare lettere all\'e-mail del cliente = {DONT_SEND_TO_CUST}<br />',
          'Numero di registrazioni clienti aggiornate: {PROCESSED_RECORDS} su {RECORD_COUNT}.{ERROR_STEPS}',
          'Questa è una e-mail generata dal sistema<br />',
          'Grazie,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.error_file_header'] = 'ID cliente,Errore';
        translation['dbu.customer.message.error_filename'] = 'Aggiornamenti falliti.csv';
        translation['dbu.customer.message.error_steps'] = '<br />Scaricare il file allegato per visualizzare l\'elenco di record che non sono stati aggiornati. È possibile aggiornare questi record manualmente.';
        translation['dc.validateCustomer.noDPMatched'] = 'Nessuna procedura di sollecito trovata corrispondente al record del cliente.';
        translation['dc.validateCustomer.recipientNoEmail'] = 'I seguenti destinatari della lettera di sollecito non hanno un indirizzo e-mail nei dati di contatto: {CONTACTNAMES}';
        translation['dc.validateCustomer.customerNoEmail'] = 'La registrazione non può essere salvata. La casella Autorizza lettere da inviare via e-mail è spuntata, ma non è presente alcun indirizzo e-mail o destinatario di sollecito a cui inviare lettere. Per salvare questo record, devono essere soddisfatte le seguenti condizioni:\n- La scheda secondaria Destinatari sollecito dispone almeno di un contatto con un indirizzo e-mail.\n- Il campo E-mail del record del cliente contiene un indirizzo e-mail.\n\nNota: L\'indirizzo e-mail del cliente è necessario solo se la casella Non inviare lettere all\'e-mail del cliente non è spuntata.';
        translation['dc.validateCustomer.noEmailAtAll'] = 'Non ci sono indirizzi e-mail nel record del cliente e non c\'è un destinatario di lettere di sollecito specificato per questo cliente. Inserire un indirizzo e-mail sul record del cliente o selezionare nella scheda secondaria Sollecito almeno un destinatario della lettera di sollecito che abbia un indirizzo e-mail.';
        translation['dc.validateCustomer.recipientListEmpty'] = 'La registrazione non può essere salvata. La casella Autorizza lettere da inviare via e-mail è spuntata, ma non c\'è un destinatario di sollecito a cui inviare lettere. Per salvare questa registrazione, la scheda secondaria Destinatari deve avere almeno un contatto con un indirizzo e-mail. \n\nNota: L\'indirizzo e-mail del cliente è necessario solo se la casella Non inviare lettere all\'e-mail del cliente non è spuntata.';
        translation['dc.validateCustomer.dpMatched'] = 'La registrazione del cliente corrisponde alla "{DP}" procedura di sollecito. Modificare la procedura di sollecito?';
        translation['dc.validateCustomer.dpAllReadyAssigned'] = 'La procedura di sollecito trovata è uguale alla procedura di sollecito già assegnata nel record.';
        translation['dc.validateDP.managerRequired'] = 'È richiesto un manager di sollecito.';
        translation['dc.validateDP.sendingModeRequired'] = 'Almeno una delle seguenti caselle deve essere spuntata:\n- Autorizza l\'invio tramite e-mail di lettere\n- Autorizza la stampa delle lettere';
        translation['dl.validateDL.dlCountExceeded'] = 'Hai superato l\'importo massimo di livelli di sollecito possibili.';
        translation['dl.validateDL.lowerDaysOverDue'] = 'Il numero di giorni di scaduto deve essere inferiore a  {DAYS}.';
        translation['dl.validateDL.higherDaysOverdue'] = 'Il numero di giorni di scaduto deve essere superiore a  {DAYS}.';
        translation['dl.validateDL.daysOverdueExist'] = 'Il numero di giorni di scaduto  {DAYS} è già in un\'altra linea.';
        translation['dl.validateDL.lastRecordDeletion'] = 'Puoi cancellare solo l\'ultimo record dell\'elenco.';
        translation['dl.validateDL.daysBetSending'] = 'I giorni tra l\'invio delle lettere devono essere maggiori o uguali a {DAYS}';
        translation['dl.validateDL.minOutsBalGEZero'] = 'L\'importo minimo in sospeso deve essere almeno (0).';
        translation['dl.validateDL.daysOverdueLessPrevious'] = 'I giorni di scaduto nel livello di sollecito  {LEVEL}({LEVEL_OVERDUE} giorni) devono essere inferiori a quelli nel livello di sollecito  {PREVLEVEL}({PREVLEVEL_OVERDUE}giorni).';
        translation['dl.validateDL.dlRequired'] = 'È necessario almeno un livello di sollecito.';
        translation['dp.validateDP.editNotAllowed'] = 'Non ti è consentito modificare il tipo di procedura di sollecito.';
        translation['dp.information.possibleMultipleSending'] = 'Disattivando il campo di intervallo minimo di sollecito, il tuo account potrà inviare più lettere di sollecito a un singolo cliente in un giorno. Disattivarlo?';
        translation['dba.pagination.failedPrevPage'] = 'Impossibile andare alla pagina precedente.';
        translation['dq.validation.str_send'] = 'invia';
        translation['dq.validation.str_remove'] = 'rimuovi';
        translation['dq.validation.str_print'] = 'stampa';
        translation['dq.validation.chooseAction'] = 'Scegliere una lettera per';
        translation['dq.validation.removalConfirmation'] = 'Rimuovere i record selezionati dalla coda?';
        translation['dq.pt.dunningQueueTitle'] = 'Coda sollecito';
        translation['dq.pt.source'] = 'Tipologia sorgente';
        translation['dq.pt.dunningProcedure'] = 'Procedura di sollecito';
        translation['dq.pt.dunningLevel'] = 'Livello di sollecito';
        translation['dq.pt.lastLetterSent'] = 'Ultima lettera inviata';
        translation['dq.pt.emailingAllowed'] = 'Invio e-mail consentito';
        translation['dq.pt.printingAllowed'] = 'Stampa consentita';
        translation['dq.pt.send'] = 'Invia';
        translation['dq.pt.remove'] = 'Rimuovi';
        translation['dq.pt.print'] = 'Stampa';
        translation['dq.pt.customer'] = 'Cliente';
        translation['dt.validator.invalidDefault'] = 'Deve essere selezionato almeno un modello predefinito per ogni tipo di modello di sollecito. Riesaminare le schede secondarie E-mail e PDF e selezionare un modello predefinito.';
        translation['dt.validator.duplicateLanguage'] = 'Questa lingua è già in uso per questo tipo di modello.';
        translation['dt.validator.noTemplateDocs'] = 'Per salvare questo record, deve esserci almeno un documento di modello e-mail e un documento di modello PDF.';
        translation['dt.validator.subject'] = 'Errore durante la convalida del documento modello di sollecito';
        translation['dt.validator.body'] = 'I seguenti documenti modelli non sono validi:';
        translation['dt.validator.defaultDeletion'] = 'Si sta tentando di eliminare un modello attualmente impostato come predefinito. Per eliminare questo modello, è necessario prima scegliere un modello diverso come modello predefinito.';
        translation['dt.validator.xmlEmailDeprecated'] = 'Non è possibile aggiungere, modificare o eliminare righe dal modello di e-mail XML. L\'uso dei modelli di e-mail di sollecito basati su XML è in fase di eliminazione. Se vengono aggiunti modelli e-mail alla scheda secondaria modello e-mail di sollecito, il salvataggio di questo record cancella tutte le righe nella scheda secondaria modello e-mail XML di sollecito.';
        translation['dt.validator.deleteAllXMLLines'] = 'Salvando questa registrazione si cancelleranno tutte le righe nella scheda secondaria Modello e-mail XML di sollecito. ';
        translation['dt.validator.noEMailDocs'] = 'Ci deve essere almeno un modello di e-mail per salvare questa registrazione.';
        translation['dt.validator.noPDFDocs'] = 'Ci deve essere almeno un modello PDF per salvare questa registrazione.';
        translation['dt.validator.multipleDefault'] = 'Utilizzare questo modello come predefinito?';
        translation['dlr.validateDLR.noAmount'] = 'La Regola di livello di sollecito dovrebbe avere almeno un importo regola di livello di sollecito.';
        translation['dlr.validateDLR.noDefaultAmount'] = 'La Regola di livello di sollecito dovrebbe avere almeno un importo regola di livello di sollecito impostata come importo predefinito.';
        translation['dlr.validateDLR.duplicateCurrency'] = 'La valuta deve essere unica.';
        translation['dlr.validateDLR.invalidAmount'] = 'L\'importo deve essere maggiore di o uguale a 0.';
        translation['dlr.validateDLR.changeDefaultCurrency'] = 'Si vuole usare questa valuta e importo della linea come predefinito? (Ciò modificherà l\'importo e la valuta predefiniti attuali)';
        translation['dlr.validateDLR.negativeDaysOverdue'] = 'Il campo Scaduto da giorni contiene un formato numerico negativo Ciò invia una lettera al cliente prima della scadenza del pagamento.';
        translation['dlr.validateDLR.daysOverdueChanged'] = 'Se si modifica il valore del campo “Scaduto da giorni” di una regola del livello di sollecito, è possibile che la sequenza o l\'ordine dei livelli di sollecito venga modificato. Di conseguenza, potrebbe attivarsi l\'invio di lettere di sollecito non legittime.\n\n Si raccomanda di verificare l\'ordine dei livelli di sollecito di tutte le procedure di sollecito ({DP_LIST}) in cui viene utilizzato il livello di sollecito che si desidera modificare. ';
        translation['dlr.validateDLR.cannotAddCurrency'] = 'La valuta non può essere aggiunta perché la funzione Valute Multiple non è attivata.';
        translation['der.flh.dunningProcedure'] = 'Questo campo indica la procedura di sollecito assegnata alla fattura o al cliente.';
        translation['der.flh.dunningLevel'] = 'Questo campo indica il livello di sollecito attuale dopo la valutazione.';
        translation['der.flh.relatedEntity'] = 'Questo campo è collegato all\'entità o al record del contatto del destinatario del sollecito.';
        translation['der.flh.messageContent'] = 'Questo campo contiene il contenuto della lettera di sollecito.';
        translation['der.flh.invoiceList'] = 'Questo campo elenca le fatture associate alla lettera di sollecito.';
        translation['der.flh.emailRecipient'] = 'Questo campo indica gli indirizzi e-mail dei destinatari della lettera di sollecito.';
        translation['der.flh.subject'] = 'Questo campo mostra l\'oggetto della lettera di sollecito.';
        translation['der.flh.dunningManager'] = 'Questo campo mostra il manager sollecito assegnato al cliente ed è collegato al record del dipendente del manager del sollecito.';
        translation['der.flh.dunningTemplate'] = 'Questo campo è collegato al record del modello di sollecito.';
        translation['der.flh.customer'] = 'Questo campo è collegato al record del cliente.';
        translation['der.flh.status'] = 'Il campo indica se l\'e-mail è stata inviata con successo o no. Lo stato può essere uno dei seguenti:\n\n• Inviato - L\'e-mail è stata inviata con successo. \n• Fallito - Il sistema non è riuscito a inviare l\'e-mail a causa di un\'informazione mancante. Un esempio si verifica quando non è presente un indirizzo e-mail per il cliente o per il contatto.\n• In coda- La lettera di sollecito è ancora nella coda di sollecito e non è stata ancora elaborata.\n• Rimosso - Il manager di sollecito ha rimosso questa registrazione dalla coda di sollecito.';
        translation['dlr.flh.daysOverdue'] = 'Inserire il numero di giorni trascorsi dalla data di scadenza del pagamento quando è necessario inviare una lettera di sollecito. Per inviare una lettera di promemoria prima della data di scadenza, inserire un numero negativo.';
        translation['ds.flh.description'] = 'Inserire una descrizione per questo record.';
        translation['dp.flh.dunningProcedure'] = 'Inserisci un nome per questa procedura di sollecito.';
        translation['dp.flh.description'] = 'Inserisci una descrizione per questa procedura di sollecito.';
        translation['dp.flh.appliesTo'] = 'Seleziona se questa procedura di sollecito sarà assegnata al cliente o alle fatture. Se si seleziona Cliente, devi anche spuntare o eliminare la casella Consenti modifica.';
        translation['dp.flh.sendingSchedule'] = 'Seleziona se inviare lettere di sollecito automaticamente o manualmente.';
        translation['dp.flh.minimumDunningInterval'] = 'Seleziona il numero minimo di giorni di sollecito per l\'invio di due lettere consecutive allo stesso cliente. Ciò si applica sia all\'invio manuale sia a quello automatico. Ciò si applica all\'invio sia manuale sia automatico.';
        translation['dp.flh.subsidiary'] = 'Seleziona le filiali a cui si applica questa procedura di sollecito.';
        translation['dp.flh.savedSearchCustomer'] = 'Seleziona la ricerca salvata cliente a cui si applica questa procedura.';
        translation['dp.flh.allowOverride'] = 'Se si spunta questa casella, una procedura di sollecito a livello di fattura può sovrascrivere questa procedura. Una procedura di sollecito a livello di fattura sarà utilizzata se una fattura soddisfa i criteri per quella procedura indipendentemente dal fatto che una procedura di sollecito a livello cliente sia stata già assegnata.';
        translation['dp.flh.department'] = 'Seleziona i reparti a cui si applica questa procedura.';
        translation['dp.flh.class'] = 'Seleziona le classi a cui si applica questa procedura.';
        translation['dp.flh.location'] = 'Seleziona le posizioni a cui si applica questa procedura.';
        translation['dp.flh.savedSearchInvoice'] = 'Seleziona la ricerca salvata fattura a cui si applica questa procedura.';
        translation['dp.flh.assignAutomatically'] = 'Spunta questa casella per attivare l\'assegnazione automatica da parte del sistema di questa procedura di sollecito ai clienti o alle fatture in base ai criteri di selezione.';
        translation['dt.flh.name'] = 'Inserisci un nome per questo modello di sollecito.';
        translation['dt.flh.description'] = 'Inserisci una descrizione per questo modello di sollecito.';
        translation['dt.flh.attachStatement'] = 'Spunta questa casella per allegare rendiconti cliente alle lettere di sollecito che utilizzano questo modello.';
        translation['dt.flh.attachInvoiceCopy'] = 'Spunta questa casella per allegare fatture alle lettere di sollecito che utilizzano questo modello.';
        translation['dt.flh.overdueInvoiceOnly'] = 'Spunta questa casella se desideri allegare solo fatture scadute.';
        translation['dt.flh.openTransactionOnly'] = 'Spunta questa casella se desideri includere solo transazioni aperte sui rendiconti del cliente.';
        translation['dt.flh.inactive'] = 'Spuntare questa casella se si desidera disattivare il modello. I modelli che sono inattivi non vengono mostrati negli elenchi e non possono essere usati per inviare lettere di sollecito.';
        translation['dc.flh.allowEmail'] = 'Spunta questa casella se desideri che le lettere di sollecito vengano inviate via e-mail.';
        translation['dc.flh.lastLetterSent'] = 'Data in cui è stata inviata l\'ultima lettera di sollecito.';
        translation['dc.flh.dunningLevel'] = 'Questo campo mostra il livello di sollecito corrente al momento della valutazione dell\'ultimo sollecito.';
        translation['dc.flh.dunningManager'] = 'Seleziona la persona responsabile per il sollecito di questo cliente Æs e il cui nome deve apparire come mittente della lettera di sollecito.';
        translation['dc.flh.dunningProcedure'] = 'Questo campo mostra la procedura di sollecito assegnata al cliente. Se fai clic su Assegna automaticamente, il sistema assegna la procedura appropriata in base ai criteri di selezione del sollecito. Selezionare un valore diverso dall\'elenco a discesa per modificare la procedura di sollecito assegnata al cliente. L\'elenco a discesa mostra solo le procedure di sollecito applicabili a questo cliente in base ai criteri di selezione definiti nei record di procedura di sollecito.';
        translation['dc.flh.allowPrint'] = 'Spunta questa casella se desideri che le lettere di sollecito vengano stampate.';
        translation['dc.flh.pauseReason'] = 'Seleziona un motivo per indicare la ragione per la quale il sollecito è stato sospeso.';
        translation['dc.flh.pauseReasonDetail'] = 'Seleziona un dettaglio per indicare la ragione per la quale il sollecito è stato sospeso.';
        translation['dc.flh.pauseDunning'] = 'Spunta questa casella per bloccare temporaneamente la procedura di sollecito.';
        translation['dc.flh.dunningRecepients'] = 'Seleziona ulteriori destinatari del sollecito';
        translation['dc.flh.allowEmail'] = 'Spunta questa casella se desideri che le lettere di sollecito vengano inviate via e-mail.';
        translation['di.flh.lastLetterSent'] = 'Data in cui è stata inviata l\'ultima lettera di sollecito.';
        translation['di.flh.dunningLevel'] = 'Questo campo mostra il livello di sollecito corrente al momento della valutazione dell\'ultimo sollecito.';
        translation['di.flh.dunningManager'] = 'Seleziona la persona responsabile per il sollecito di questa fattura e il cui nome deve apparire come mittente della lettera di sollecito.';
        translation['di.flh.dunningProcedure'] = 'Questo campo mostra la procedura di sollecito assegnata alla fattura. Se fai clic su Assegna automaticamente, il sistema assegna la procedura appropriata in base ai criteri di selezione del sollecito. Selezionare un valore diverso dall\'elenco a discesa per modificare la procedura di sollecito assegnata alla fattura. L\'elenco a discesa mostra solo le procedure di sollecito applicabili a questa fattura, in base ai criteri di selezione definiti nei record di procedura di sollecito.';
        translation['di.flh.allowPrint'] = 'Spunta questa casella se desideri che le lettere di sollecito vengano stampate.';
        translation['di.flh.pauseReason'] = 'Seleziona un motivo per indicare la ragione per la quale il sollecito è stato sospeso.';
        translation['di.flh.pauseReasonDetail'] = 'Seleziona un motivo per indicare la ragione per la quale il sollecito è stato sospeso.';
        translation['di.flh.pauseDunning'] = 'Spunta questa casella per bloccare temporaneamente la procedura di sollecito.';
        translation['dp.validate.unpause'] = 'Deselezionando la casella Pausa sollecito si attiverà immediatamente un flusso di lavoro di valutazione dei solleciti. NetSuite può inviare una lettera di sollecito al cliente in base al risultato della valutazione sollecito. Riprendere il sollecito?';
        translation['dc.validateSubsidiary.existingConfigSubsidiary'] = 'Una registrazione di configurazione di sollecito per questa filiale esiste già.';
        translation['l10n.address.invalidPOBox'] = 'Inserire un numero di casella postale valida.';
        translation['l10n.address.invalidZipCode'] = 'Inserire un CAP valido.';
        translation['l10n.address.invalidRuralRoute'] = 'Inserire un valore valido per Strada rurale.';
        translation['l10n.accessForDDandAccountant'] = 'Solo i ruoli di Amministratore, Direttore sollecito e Contabile possono creare e modificare questo tipo di record';
        translation['l10n.deleteAccessForDDandAccountant'] = 'Solo i ruoli di Amministratore, Direttore di sollecito e Contabile possono eliminare questo tipo di record.';
        translation['l10n.accessForAdministrator'] = 'Solo l\'Amministratore può creare e modificare questo tipo di record.';
        translation['l10n.deleteAccessForAdministrator'] = 'Solo l\'Amministratore può eliminare questo tipo di registrazione.';
        translation['l10n.noPagePrivilege'] = 'Non si dispone delle autorizzazioni per la visualizzazione di questa pagina';
        translation['dq.pdfemail.folderName'] = 'Lettere di sollecito in formato PDF da stampare';
        translation['dq.pdfemail.subject'] = 'Le lettere di sollecito in formato PDF generate sono disponibili per la stampa nell\'archivio.';
        translation['dq.pdfemail.link'] = 'Fare clic sul collegamento per visualizzare la cartella delle lettere PDF:';
        translation['dq.pdfemail.tableHead'] = 'La tabella seguente mostra i dettagli delle cartelle in cui sono archiviati i file PDF.';
        translation['dq.pdfemail.exceedLimit'] = 'Impossibile allegare i file generati poiché è stato superato il limite di allegati.';
        translation['dq.pdfemail.tableLabel1'] = 'Cartelle';
        translation['dq.pdfemail.tableLabel2'] = 'Percorso';
        translation['dq.pdfemail.tableLabel3'] = 'Stato';
        translation['dq.pdfemail.tableLabel4'] = 'Note';

        break;

      case 'ja_JP':
      case 'ja-JP':
        translation['dsa.response.none_found'] = '督促手続はありません。';
        translation['form.dunning_template.title'] = '督促テンプレート';
        translation['field.template.name'] = '名前';
        translation['field.template.description'] = '説明';
        translation['field.template.attachStatement'] = '計算書を添付';
        translation['field.template.overdue_invoices_stmt'] = '期限超過の請求書のみを計算書に記載';
        translation['field.template.inactive'] = '無効';
        translation['field.template.attach_invoice_copy'] = '請求書のコピーを添付';
        translation['field.template.only_overdue_invoices'] = '期限超過の請求書のみ';
        translation['field.template.subject'] = '件名';
        translation['selection.template.savedsearch'] = '保存検索';
        translation['selection.template.searchcolumn'] = '検索列';
        translation['label.template.lettertext'] = '督促状本文';
        translation['dba.form.title'] = '督促の一括割当';
        translation['dba.form.source'] = '次に適用';
        translation['dba.form.procedure'] = '督促手続';
        translation['dba.form.source.help'] = '次に適用';
        translation['dba.form.procedure.help'] = '督促手続';
        translation['dba.form.dunning_manager'] = '督促マネージャ';
        translation['dba.form.dunning_manager.help'] = '督促マネージャ';
        translation['dba.tab.invoice'] = '請求書';
        translation['dba.sublist.invoice'] = '請求書';
        translation['dba.tab.customer'] = '顧客';
        translation['dba.sublist.customer'] = '顧客';
        translation['dba.sublist.common.id'] = 'ID';
        translation['dba.sublist.common.customer'] = '顧客';
        translation['dba.sublist.invoice.invoice'] = '請求書';
        translation['dba.sublist.invoice.amount'] = '金額';
        translation['dba.sublist.invoice.currency'] = '通貨';
        translation['dba.sublist.invoice.duedate'] = '期日';
        translation['dba.sublist.invoice.days_overdue'] = '超過日数';
        translation['dba.sublist.customer.subsidiary'] = '連結';
        translation['dba.sublist.common.assign_dunning'] = '割当';
        translation['dba.sublist.common.dunning_procedure'] = '督促手続';
        translation['dba.sublist.common.dunning_level'] = '督促レベル';
        translation['dba.sublist.common.last_letter_sent'] = '前回の督促状送信日';
        translation['dba.sublist.common.dunning_sending_type'] = '送付のタイプ';
        translation['dba.sublist.common.page_next'] = '>';
        translation['dba.sublist.common.page_previous'] = '<';
        translation['dba.sublist.common.page_option'] = '{startIndex} - {endIndex} / {totalEntryCount}';
        translation['dba.form.restriction'] = '選択条件';
        translation['dba.form.selection'] = '督促手続の選択';
        translation['dba.form.restriction.subsidiary'] = '連結';
        translation['dba.form.restriction.location'] = '場所';
        translation['dba.form.restriction.dept'] = '部門';
        translation['dba.form.restriction.class'] = 'クラス';
        translation['dba.form.restriction.search'] = '保存検索';
        translation['dba.form.action.assign'] = '割当';
        translation['dba.form.action.assign_customer'] = '顧客への割当';
        translation['dba.form.action.assign_invoice'] = '請求書への割当';
        translation['dba.form.action.cancel'] = 'キャンセル';
        translation['dba.form.notification.highnumberofrecord'] = 'このリクエストは完了に数秒かかる場合があります。「督促手続」ページにリダイレクトされるまでお待ちください。';
        translation['dqf.form.action.send'] = '送信';
        translation['dqf.form.action.print'] = '印刷';
        translation['dqf.form.action.remove'] = '削除';
        translation['dqf.form.send.title'] = '督促メール送信キュー';
        translation['dqf.form.print.title'] = '督促PDF印刷キュー';
        translation['dqf.filter.fieldGroup'] = 'フィルタ';
        translation['dqf.filter.inlineHelp'] = 'フィルタを使用すると検索をより特定的にし、あるいは表示される結果を絞り込むことができます。';
        translation['dqf.filter.applyFiltersButton'] = '検索';
        translation['dqf.filter.customer'] = '顧客';
        translation['dqf.filter.recipient'] = '受信者';
        translation['dqf.filter.procedure'] = '督促手続';
        translation['dqf.filter.dpLevel'] = '督促レベル';
        translation['dqf.filter.appliesTo'] = '次に適用';
        translation['dqf.filter.allowPrint'] = '印刷を許可';
        translation['dqf.filter.allowEmail'] = '電子メールを許可';
        translation['dqf.filter.lastLtrSentStart'] = '前回の督促状送信開始日';
        translation['dqf.filter.lastLtrSentEnd'] = '前回の督促状送信終了日';
        translation['dqf.filter.evalDateStart'] = '評価開始日';
        translation['dqf.filter.evalDateEnd'] = '評価終了日';
        translation['dqf.filter.boolean.yes'] = 'はい';
        translation['dqf.filter.boolean.no'] = 'いいえ';
        translation['dqf.sublist.send.title'] = '督促メール送信キュー';
        translation['dqf.sublist.print.title'] = '督促PDF印刷キュー';
        translation['dqf.sublist.common.customer'] = '顧客';
        translation['dqf.sublist.common.mark'] = 'マーク';
        translation['dqf.sublist.common.view'] = '表示';
        translation['dqf.sublist.common.id'] = 'ID';
        translation['dqf.sublist.dp.applies_to'] = '次に適用';
        translation['dqf.sublist.common.dunning_procedure'] = '督促手続';
        translation['dqf.sublist.common.dunning_level'] = 'レベル';
        translation['dqf.sublist.record.last_letter_sent'] = '前回送信した督促状';
        translation['dqf.sublist.record.dunning_allow_email'] = '電子メールを許可';
        translation['dqf.sublist.record.dunning_allow_print'] = '印刷を許可';
        translation['dqf.sublist.record.pause_dunning'] = '督促を一時停止';
        translation['dqf.sublist.common.evaluation_date'] = '評価日';
        translation['dqf.sublist.common.related_entity'] = '受信者';
        translation['dbu.form.title'] = '督促用顧客レコードの一括更新';
        translation['dbu.form.update_button'] = '更新';
        translation['dbu.form.field.subsidiary'] = '連結';
        translation['dbu.form.flh.subsidiary'] = '顧客レコードで督促フィールドの一括更新を実行する対象の連結子会社を選択します。更新は、選択した連結子会社に属するすべての顧客レコードに適用されます。';
        translation['dbu.form.field.allow_email'] = '督促状のメール送信を許可';
        translation['dbu.form.flh.allow_email'] = '一括更新の実行後に顧客レコードで対象フィールドに適用する値を選択します。\n未変更 – フィールドの現在の値は変更されません。 \nチェックマーク – 一括更新後に顧客レコードでボックスにチェックマークが入ります。 \nチェックマークを外す – 一括更新後にボックスのチェックマークが外れます。';
        translation['dbu.form.field.allow_print'] = '督促状の印刷を許可';
        translation['dbu.form.flh.allow_print'] = '一括更新の実行後に顧客レコードで対象フィールドに適用する値を選択します。\n未変更 – フィールドの現在の値は変更されません。 \nチェックマーク – 一括更新後に顧客レコードでボックスにチェックマークが入ります。 \nチェックマークを外す – 一括更新後にボックスのチェックマークが外れます。';
        translation['dbu.form.field.dont_send_cust_email'] = '顧客電子メールに督促状を送信しない';
        translation['dbu.form.flh.dont_send_cust_email'] = '一括更新の実行後に顧客レコードで対象フィールドに適用する値を選択します。\n未変更 – フィールドの現在の値は変更されません。 \nチェックマーク – 一括更新後に顧客レコードでボックスにチェックマークが入ります。 \nチェックマークを外す – 一括更新後にボックスのチェックマークが外れます。';
        translation['dbu.form.primary_field_group'] = '条件';
        translation['dbu.form.bulk_update_field_group'] = '一括更新フィールド';
        translation['dbu.form.options.unchanged'] = '- 未変更 -';
        translation['dbu.form.options.checked'] = 'チェックマーク';
        translation['dbu.form.options.not_checked'] = 'チェックマークを外す';
        translation['dbu.validation.no_selection'] = 'すべてのフィールドに「- 未変更 -」が選択されているため、更新できるフィールドがありません。1つ以上のフィールドで変更が指定されている場合（「チェックマークを入れる」または「チェックマークを外す」）、一括更新を実行できます。';
        translation['dbu.validation.no_sending_media'] = '「督促状のメール送信を許可」ボックスおよび「督促状の印刷を許可」ボックスの両方にチェックマークが入っていない場合、顧客レコードは保存できません。以下のフィールドのいずれかまたは両方で「チェックマークを入れる」を選択します。\n- 督促状のメール送信を許可\n- 督促状の印刷を許可';
        translation['dbu.validation.verify_submit_ow'] = '選択した連結子会社の督促手続を伴うすべての顧客レコードが更新されます {SUBSIDIARY}。この処理が完了すると、電子メールメッセージが届きます。一括更新を続行しますか？「OK」をクリックすると、一括更新処理が始まって元に戻せません。';
        translation['dbu.validation.verify_submit_si'] = '督促手続を伴うすべての顧客レコードが更新されます。この処理が完了すると、電子メールメッセージが届きます。一括更新を続行しますか？「OK」をクリックすると、一括更新処理が始まって元に戻せません。';
        translation['dbu.form.reminderinlinehelp'] = 'NetSuiteでは、一括更新機能は貴社の通常の営業時間外に使用することをお勧めします。これは、貴社の他のユーザが一括更新処理中に顧客レコードを更新中ではないことを確認するためです。';
        translation['dbu.validation.validate_concurrency_ow'] = '督促用顧客レコードの一括更新は、連結子会社（ {SUBSIDIARY}）の {USER}によって開始されました。同じ連結子会社の顧客の別の一括更新を実行する前に、一括更新を完了しておく必要があります。';
        translation['dbu.validation.validate_concurrency_si'] = 'システムが一度に実行できる一括更新は1回のみです。 {USER}によって開始された一括更新が現在実行中です。';
        translation['dbu.customer.message.complete_subject'] = '督促用顧客レコードの一括更新';
        translation['dbu.customer.message.complete_body_ow'] = [
          'NetSuiteからお知らせいたします。<br />',
          '連結子会社（ {SUBSIDIARY}）の督促用顧客レコードの一括更新が完了しました。',
          '督促状のメール送信を許可 = {ALLOW_EMAIL}',
          '督促状の印刷を許可 = {ALLOW_PRINT}',
          '顧客電子メールに督促状を送信しない = {DONT_SEND_TO_CUST}<br />',
          '更新済み顧客レコードの数： {PROCESSED_RECORDS} / {RECORD_COUNT}。{ERROR_STEPS}',
          'このメールはシステムにより自動生成されたものです。<br />',
          'よろしくお願いいたします。',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.complete_body_si'] = [
          'NetSuiteからお知らせいたします。<br />',
          '督促用顧客レコードの一括更新が完了しました。',
          '督促状のメール送信を許可 = {ALLOW_EMAIL}',
          '督促状の印刷を許可 = {ALLOW_PRINT}',
          '顧客電子メールに督促状を送信しない = {DONT_SEND_TO_CUST}<br />',
          '更新済み顧客レコードの数： {PROCESSED_RECORDS} / {RECORD_COUNT}。{ERROR_STEPS}',
          'このメールはシステムにより自動生成されたものです。<br />',
          'よろしくお願いいたします。',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.error_file_header'] = 'Customer ID,Error';
        translation['dbu.customer.message.error_filename'] = 'Failed Updates.csv';
        translation['dbu.customer.message.error_steps'] = '<br />更新されなかったレコードのリストを確認するには、添付ファイルをダウンロードしてください。対象レコードは手動で更新できます。';
        translation['dc.validateCustomer.noDPMatched'] = '顧客レコードに一致する督促手続が見つかりませんでした。';
        translation['dc.validateCustomer.recipientNoEmail'] = '次の督促状受信者には、連絡先レコードにメールアドレスがありません： {CONTACTNAMES}。';
        translation['dc.validateCustomer.customerNoEmail'] = 'レコードを保存できません。「督促状のメール送信を許可」ボックスにチェックマークが入っていますが、督促状の送信対象のメールアドレスも督促状受信者もありません。対象レコードを保存するには、以下の条件を満たす必要があります。\n- 「督促状受信者」サブタブに、メールアドレスを持つ督促状受信者が1人以上いる。\n- 顧客レコードの「電子メール」フィールドにメールアドレスがある。\n\n注：顧客のメールアドレスは、「顧客電子メールに督促状を送信しない」ボックスにチェックマークが入っていない場合にのみ必要です。';
        translation['dc.validateCustomer.noEmailAtAll'] = 'この顧客には顧客レコードにメールアドレスがなく、また督促状の受信者が指定されていません。顧客レコードにメールアドレスを入力するか、メールアドレスを持つ督促状受信者を少なくとも1人、「督促」サブタブで選択してください。';
        translation['dc.validateCustomer.recipientListEmpty'] = 'レコードを保存できません。「督促状のメール送信を許可」ボックスにチェックマークが入っていますが、督促状の送信対象の督促状受信者がいません。対象レコードを保存するには、「督促状受信者」サブタブに、メールアドレスを持つ督促状受信者が1人以上いる必要があります。 \n\n注：顧客のメールアドレスは、「顧客電子メールに督促状を送信しない」ボックスにチェックマークが入っていない場合にのみ必要です。';
        translation['dc.validateCustomer.dpMatched'] = '顧客レコードが「{DP}」督促手続と一致しました。督促手続を変更しますか？';
        translation['dc.validateCustomer.dpAllReadyAssigned'] = '検出された督促手続は、レコードですでに割り当てられた督促手続と同じです。';
        translation['dc.validateDP.managerRequired'] = '督促マネージャは必須です。';
        translation['dc.validateDP.sendingModeRequired'] = '次のいずれかのボックスに少なくとも1つチェックマークを入れてください：\n-督促状のメール送信を許可\n-督促状の印刷を許可';
        translation['dl.validateDL.dlCountExceeded'] = '可能な督促レベルの最大金額を超過しました。';
        translation['dl.validateDL.lowerDaysOverDue'] = '超過日数は {DAYS}日より短くなければなりません。';
        translation['dl.validateDL.higherDaysOverdue'] = '超過日数は {DAYS}日より長くなければなりません。';
        translation['dl.validateDL.daysOverdueExist'] = '超過日数 {DAYS}は、すでに別のラインに記載されています。';
        translation['dl.validateDL.lastRecordDeletion'] = '削除できるのは、リストにある最後のレコードのみです。';
        translation['dl.validateDL.daysBetSending'] = '督促状を送信する間隔の日数は、必ず {DAYS}日以上にしてください。';
        translation['dl.validateDL.minOutsBalGEZero'] = '最小未処理金額は、少なくともゼロ（0）にする必要があります。';
        translation['dl.validateDL.daysOverdueLessPrevious'] = '督促レベル {LEVEL}の超過日数（{LEVEL_OVERDUE}日）は、督促レベル {PREVLEVEL}の超過日数（{PREVLEVEL_OVERDUE}日）より短かくなければなりません。';
        translation['dl.validateDL.dlRequired'] = '1以上の督促レベルが必要です。';
        translation['dp.validateDP.editNotAllowed'] = '督促手続タイプの編集は許可されていません。';
        translation['dp.information.possibleMultipleSending'] = '「最小督促間隔」フィールドを無効にすると、貴社のアカウントで1日に1人の顧客に対して複数の督促状を送信できます。無効にしますか？';
        translation['dba.pagination.failedPrevPage'] = '前ページに移動できませんでした。';
        translation['dq.validation.str_send'] = '送信';
        translation['dq.validation.str_remove'] = '削除';
        translation['dq.validation.str_print'] = '印刷';
        translation['dq.validation.chooseAction'] = '次の処理を行う督促状を選択してください：';
        translation['dq.validation.removalConfirmation'] = '選択したレコードをキューから削除しますか？';
        translation['dq.pt.dunningQueueTitle'] = '督促キュー';
        translation['dq.pt.source'] = 'ソースタイプ';
        translation['dq.pt.dunningProcedure'] = '督促手続';
        translation['dq.pt.dunningLevel'] = '督促レベル';
        translation['dq.pt.lastLetterSent'] = '前回送信した督促状';
        translation['dq.pt.emailingAllowed'] = '電子メール送信許可済み';
        translation['dq.pt.printingAllowed'] = '印刷許可済み';
        translation['dq.pt.send'] = '送信';
        translation['dq.pt.remove'] = '削除';
        translation['dq.pt.print'] = '印刷';
        translation['dq.pt.customer'] = '顧客';
        translation['dt.validator.invalidDefault'] = '各督促テンプレートタイプに1つのデフォルトテンプレートを選択する必要があります。「電子メール」サブタブと「PDF」サブタブを確認し、デフォルトテンプレートを選択してください。';
        translation['dt.validator.duplicateLanguage'] = 'このテンプレートタイプには、この言語がすでに使用されています。';
        translation['dt.validator.noTemplateDocs'] = '対象レコードを保存するには、電子メールテンプレートドキュメントとPDFテンプレートドキュメントがそれぞれ1つ以上必要です。';
        translation['dt.validator.subject'] = '督促テンプレートドキュメントの認証に失敗しました';
        translation['dt.validator.body'] = '次のテンプレートドキュメントは無効です。';
        translation['dt.validator.defaultDeletion'] = '現在デフォルトに設定されているテンプレートを削除しようとしています。このテンプレートを削除するには、デフォルトのテンプレートとして別のテンプレートをまず選択する必要があります。';
        translation['dt.validator.xmlEmailDeprecated'] = 'XML電子メールテンプレートラインは追加、編集、または削除できません。XMLベースの督促メールテンプレートは使用できなくなっています。電子メールテンプレートを「督促メールテンプレート」サブタブに追加する場合、対象レコードを保存すると「督促XMLメールテンプレート」のすべてのラインが削除されます。';
        translation['dt.validator.deleteAllXMLLines'] = '対象レコードを保存すると、「督促XML電子メールテンプレート」サブタブのすべてのラインは削除されます。';
        translation['dt.validator.noEMailDocs'] = '対象レコードを保存するには、電子メールテンプレートが1つ以上必要です。';
        translation['dt.validator.noPDFDocs'] = '対象レコードを保存するには、PDFテンプレートが1つ以上必要です。';
        translation['dt.validator.multipleDefault'] = 'このテンプレートをデフォルトとして使用しますか？';
        translation['dlr.validateDLR.noAmount'] = '督促レベルのルールには、1つ以上の督促レベルのルール金額を設定する必要があります。';
        translation['dlr.validateDLR.noDefaultAmount'] = '督促レベルのルールには、1つ以上の督促レベルのルール金額をデフォルト金額として設定する必要があります。';
        translation['dlr.validateDLR.duplicateCurrency'] = '通貨は一意でなければなりません。';
        translation['dlr.validateDLR.invalidAmount'] = '金額は0以上にする必要があります。';
        translation['dlr.validateDLR.changeDefaultCurrency'] = 'このラインの通貨と金額をデフォルトとして使用しますか？（これによって、現在のデフォルト金額と通貨は変更されます）';
        translation['dlr.validateDLR.negativeDaysOverdue'] = '「超過日数」フィールドに負数が含まれています。そのため、支払期日前に督促状が顧客に送信されます。';
        translation['dlr.validateDLR.daysOverdueChanged'] = '督促レベルのルールで「超過日数」の値を変更すると、督促レベルのシーケンスまたは順序が変更され、不適切な督促状が送信される可能性があります。\n\n 変更する督促レベルが使用されているすべての督促手続き（{DP_LIST}）で督促レベルの順序を確認することをお勧めします。';
        translation['dlr.validateDLR.cannotAddCurrency'] = '複数通貨機能が有効になっていないため、通貨を追加できません。';
        translation['der.flh.dunningProcedure'] = 'このフィールドには、顧客の請求書に割り当てられた督促手続が表示されます。';
        translation['der.flh.dunningLevel'] = 'このフィールドには、評価後の最新の督促レベルが表示されます。';
        translation['der.flh.relatedEntity'] = 'このフィールドは、エンティティまたは督促受信者の連絡先レコードにリンクされます。';
        translation['der.flh.messageContent'] = 'このフィールドには、督促状の内容が表示されます。';
        translation['der.flh.invoiceList'] = 'このフィールドには、督促状に関連付けられた請求書がリストで表示されます。';
        translation['der.flh.emailRecipient'] = 'このフィールドには、督促状受信者のメールアドレスが表示されます。';
        translation['der.flh.subject'] = 'このフィールドには、督促状の件名が表示されます。';
        translation['der.flh.dunningManager'] = 'このフィールドには、顧客に割り当てられた督促マネージャが表示され、督促マネージャの従業員レコードにリンクされます。';
        translation['der.flh.dunningTemplate'] = 'このフィールドは督促テンプレートレコードにリンクされます。';
        translation['der.flh.customer'] = 'このフィールドはカスタムレコードにリンクされます。';
        translation['der.flh.status'] = 'このフィールドでは、メールが正常に送信されたかどうかが示されます。ステータスは、以下のいずれかとなります。 \n\n• 送信済 - メールは正常に送信されました。 \n• 失敗 - 情報不足のため、メールを送信できませんでした。たとえば、顧客または連絡先のメールアドレスがない場合などです。 \n• キュー内 - 督促状は督促キューに入ったままで、まだ処理されていません。 \n• 削除済 - 督促マネージャが対象レコードを督促キューから削除しました。';
        translation['dlr.flh.daysOverdue'] = '督促状を送信する必要がある支払期日を過ぎた日数を入力します。期日前に督促状を送信するには、負数を入力します。';
        translation['ds.flh.description'] = 'このレコードの説明を入力します。';
        translation['dp.flh.dunningProcedure'] = 'この督促手続の名前を入力します。';
        translation['dp.flh.description'] = 'この手続の説明を入力します。';
        translation['dp.flh.appliesTo'] = 'この督促手続を顧客または請求書に割り当てるかどうかを選択します。「顧客」を選択する場合、「上書きを許可」ボックスにチェックマークを入れるか外す必要もあります。';
        translation['dp.flh.sendingSchedule'] = '督促状の送信を自動で行うか手動で行うかを選択します。';
        translation['dp.flh.minimumDunningInterval'] = '同じ顧客に2回連続督促状を送信する場合の最小間隔日数を選択します。これは手動送信と自動送信の両方に適用されます。';
        translation['dp.flh.subsidiary'] = 'この督促手続の適用先となる連結子会社を選択します。';
        translation['dp.flh.savedSearchCustomer'] = 'この手続の適用先となる顧客の保存検索を選択します。';
        translation['dp.flh.allowOverride'] = 'このボックスにチェックマークを入れると、請求書レベルの督促手続によりこの手続が上書きされる場合があります。請求書レベルの督促手続は、顧客レベルの督促手続がすでに割り当てられているかどうかとは無関係に、請求書が手続の条件を満たすと使用されます。';
        translation['dp.flh.department'] = 'この手続が適用される部門を選択します。';
        translation['dp.flh.class'] = 'この手続の適用先となるクラスを選択します。';
        translation['dp.flh.location'] = 'この手続の適用先となる場所を選択します。';
        translation['dp.flh.savedSearchInvoice'] = 'この手続の適用先となる請求書の保存検索を選択します。';
        translation['dp.flh.assignAutomatically'] = 'このボックスにチェックマークを入れると、選択条件に基づいてこの督促手続が顧客または請求書に自動的に割り当てられます。';
        translation['dt.flh.name'] = 'この督促テンプレートの名前を入力します。';
        translation['dt.flh.description'] = 'この督促テンプレートの説明を入力します。';
        translation['dt.flh.attachStatement'] = 'このボックスにチェックマークを入れると、このテンプレートを使用する督促状に顧客計算書を添付します。';
        translation['dt.flh.attachInvoiceCopy'] = 'このボックスにチェックマークを入れると、このテンプレートを使用する督促状に請求書を添付します。';
        translation['dt.flh.overdueInvoiceOnly'] = '期限超過の請求書のみを添付するには、このボックスにチェックマークを入れます。';
        translation['dt.flh.openTransactionOnly'] = '顧客計算書に未処理のトランザクションのみを含める場合は、このボックスにチェックマークを入れます。';
        translation['dt.flh.inactive'] = 'このボックスにチェックマークを入れると、テンプレートは無効になります。無効なレストはリストに表示されず、督促状の送信に使用できません。';
        translation['dc.flh.allowEmail'] = '督促状をメール送信するには、このボックスにチェックマークを入れます。';
        translation['dc.flh.lastLetterSent'] = '督促状を前回送信した日付。';
        translation['dc.flh.dunningLevel'] = 'このフィールドには、前回の督促評価時点での最新の督促レベルが表示されます。';
        translation['dc.flh.dunningManager'] = 'この顧客の督促の担当者を選択します。担当者名は、督促状の送信元として表示されます。';
        translation['dc.flh.dunningProcedure'] = 'このフィールドには、顧客に割り当てられた督促手続が表示されます。「自動割当」をクリックすると、督促選択条件に基づいて適切な手続が自動的に割り当てられます。顧客に割り当てられた督促手続を変更するには、ドロップダウンリストから別の値を選択します。ドロップダウンリストに表示されるのは、督促手続レコードで定義された選択条件に基づき、この顧客に適用される督促手続のみです。';
        translation['dc.flh.allowPrint'] = '督促状を印刷するには、このボックスにチェックマークを入れます。';
        translation['dc.flh.pauseReason'] = '督促を一時停止した理由を選択します。';
        translation['dc.flh.pauseReasonDetail'] = 'なぜ督促を一時停止したかを示す詳細を選択します。';
        translation['dc.flh.pauseDunning'] = '督促処理を一時停止するには、このボックスにチェックマークを入れます。';
        translation['dc.flh.dunningRecepients'] = '追加の督促状受信者を選択します。';
        translation['dc.flh.allowEmail'] = '督促状をメール送信するには、このボックスにチェックマークを入れます。';
        translation['di.flh.lastLetterSent'] = '督促状を前回送信した日付。';
        translation['di.flh.dunningLevel'] = 'このフィールドには、前回の督促評価時点での最新の督促レベルが表示されます。';
        translation['di.flh.dunningManager'] = 'この請求書の督促の担当者を選択します。担当者名は、督促状の送信元として表示されます。';
        translation['di.flh.dunningProcedure'] = 'このフィールドには、請求書に割り当てられた督促手続が表示されます。「自動割当」をクリックすると、督促選択条件に基づいて適切な手続が自動的に割り当てられます。請求書に割り当てられた督促手続を変更するには、ドロップダウンリストから別の値を選択します。ドロップダウンリストに表示されるのは、督促手続レコードで定義された選択条件に基づき、この請求書に適用される督促手続のみです。';
        translation['di.flh.allowPrint'] = '督促状を印刷するには、このボックスにチェックマークを入れます。';
        translation['di.flh.pauseReason'] = '督促を一時停止した理由を選択します。';
        translation['di.flh.pauseReasonDetail'] = 'なぜ督促を一時停止したかを示す理由の詳細を選択します。';
        translation['di.flh.pauseDunning'] = '督促処理を一時停止するには、このボックスにチェックマークを入れます。';
        translation['dp.validate.unpause'] = '督促を一時停止」ボックスをクリアすると、直ちに督促評価ワークフローがトリガーされます。督促評価の結果によっては、NetSuiteからこの顧客に督促状が送信されることがあります。督促を再開しますか？';
        translation['dc.validateSubsidiary.existingConfigSubsidiary'] = 'この連結子会社の督促設定レコードはすでに存在します。';
        translation['l10n.address.invalidPOBox'] = '有効な発注書ボックス番号を入力してください。';
        translation['l10n.address.invalidZipCode'] = '有効な郵便番号を入力してください。';
        translation['l10n.address.invalidRuralRoute'] = '有効な地方配送路の値を入力してください。';
        translation['l10n.accessForDDandAccountant'] = 'この種類のレコードを作成および変更できるのは、管理者、督促ディレクターおよび会計担当者ロールのみです。';
        translation['l10n.deleteAccessForDDandAccountant'] = 'この種類のレコードを削除できるのは、管理者、督促ディレクターおよび会計担当者ロールのみです。';
        translation['l10n.accessForAdministrator'] = 'この種類のレコードを作成および変更できるのは、管理者ロールのみです。';
        translation['l10n.deleteAccessForAdministrator'] = 'この種類のレコードを削除できるのは、管理者ロールのみです。';
        translation['l10n.noPagePrivilege'] = 'このページを表示する権限がありません。';
        translation['dq.pdfemail.folderName'] = '印刷用PDF督促レター';
        translation['dq.pdfemail.subject'] = '印刷用に生成されたPDFの督促レターは、ファイルキャビネットにあります。';
        translation['dq.pdfemail.link'] = 'PDFレターのフォルダを表示するには、リンクをクリックしてください：';
        translation['dq.pdfemail.tableHead'] = '次の表には、PDFファイルが保存されているフォルダの詳細が示されています。';
        translation['dq.pdfemail.exceedLimit'] = '生成されたファイルを添付できませんでした。添付ファイルの制限を超えています。';
        translation['dq.pdfemail.tableLabel1'] = 'フォルダ';
        translation['dq.pdfemail.tableLabel2'] = 'パス';
        translation['dq.pdfemail.tableLabel3'] = 'ステータス';
        translation['dq.pdfemail.tableLabel4'] = '注意';

        break;

      case 'ko_KR':
      case 'ko-KR':
        translation['dsa.response.none_found'] = '사용 가능한 독촉 절차 없음.';
        translation['form.dunning_template.title'] = '독촉 템플릿';
        translation['field.template.name'] = '이름';
        translation['field.template.description'] = '설명';
        translation['field.template.attachStatement'] = '명세서 첨부';
        translation['field.template.overdue_invoices_stmt'] = '명세서에 연체 송장만';
        translation['field.template.inactive'] = '비활성';
        translation['field.template.attach_invoice_copy'] = '송장 사본 첨부';
        translation['field.template.only_overdue_invoices'] = '연체 송장만';
        translation['field.template.subject'] = '제목';
        translation['selection.template.savedsearch'] = '저장된 검색';
        translation['selection.template.searchcolumn'] = '열 검색';
        translation['label.template.lettertext'] = '편지 텍스트';
        translation['dba.form.title'] = '독촉 벌크 할당';
        translation['dba.form.source'] = '적용 대상';
        translation['dba.form.procedure'] = '독촉 절차';
        translation['dba.form.source.help'] = '적용 대상';
        translation['dba.form.procedure.help'] = '독촉 절차';
        translation['dba.form.dunning_manager'] = '독촉 관리자';
        translation['dba.form.dunning_manager.help'] = '독촉 관리자';
        translation['dba.tab.invoice'] = '송장';
        translation['dba.sublist.invoice'] = '송장';
        translation['dba.tab.customer'] = '고객';
        translation['dba.sublist.customer'] = '고객';
        translation['dba.sublist.common.id'] = 'ID';
        translation['dba.sublist.common.customer'] = '고객';
        translation['dba.sublist.invoice.invoice'] = '송장';
        translation['dba.sublist.invoice.amount'] = '금액';
        translation['dba.sublist.invoice.currency'] = '통화';
        translation['dba.sublist.invoice.duedate'] = '만기 날짜';
        translation['dba.sublist.invoice.days_overdue'] = '연체 기간(일)';
        translation['dba.sublist.customer.subsidiary'] = '자회사';
        translation['dba.sublist.common.assign_dunning'] = '할당';
        translation['dba.sublist.common.dunning_procedure'] = '독촉 절차';
        translation['dba.sublist.common.dunning_level'] = '독촉 수준';
        translation['dba.sublist.common.last_letter_sent'] = '직전 편지 발송 날짜';
        translation['dba.sublist.common.dunning_sending_type'] = '발송 유형';
        translation['dba.sublist.common.page_next'] = '>';
        translation['dba.sublist.common.page_previous'] = '<';
        translation['dba.sublist.common.page_option'] = '{startIndex} - {endIndex} /  {totalEntryCount}';
        translation['dba.form.restriction'] = '선택 기준';
        translation['dba.form.selection'] = '독촉 절차 선택';
        translation['dba.form.restriction.subsidiary'] = '자회사';
        translation['dba.form.restriction.location'] = '위치';
        translation['dba.form.restriction.dept'] = '부서';
        translation['dba.form.restriction.class'] = '클래스';
        translation['dba.form.restriction.search'] = '저장된 검색';
        translation['dba.form.action.assign'] = '할당';
        translation['dba.form.action.assign_customer'] = '고객에 할당';
        translation['dba.form.action.assign_invoice'] = '송장에 할당';
        translation['dba.form.action.cancel'] = '취소';
        translation['dba.form.notification.highnumberofrecord'] = '이 요청은 몇 초 후 완료될 수 있습니다. 독촉 절차 페이지로 전환될 때까지 기다려 주십시오.';
        translation['dqf.form.action.send'] = '발송';
        translation['dqf.form.action.print'] = '인쇄';
        translation['dqf.form.action.remove'] = '제거';
        translation['dqf.form.send.title'] = '독촉 이메일 전송 대기열';
        translation['dqf.form.print.title'] = '독촉 PDF 인쇄 대기열';
        translation['dqf.filter.fieldGroup'] = '필터';
        translation['dqf.filter.inlineHelp'] = '필터를 이용해서 더 자세하게 검색하거나 화면에 표시되는 결과의 범위를 좁히십시오.';
        translation['dqf.filter.applyFiltersButton'] = '검색';
        translation['dqf.filter.customer'] = '고객';
        translation['dqf.filter.recipient'] = '수취인';
        translation['dqf.filter.procedure'] = '독촉 절차';
        translation['dqf.filter.dpLevel'] = '독촉 수준';
        translation['dqf.filter.appliesTo'] = '적용 대상';
        translation['dqf.filter.allowPrint'] = '인쇄 허용';
        translation['dqf.filter.allowEmail'] = '이메일 허용';
        translation['dqf.filter.lastLtrSentStart'] = '직전 독촉장 발송 시작 날짜';
        translation['dqf.filter.lastLtrSentEnd'] = '직전 독촉장 발송 종료 날짜';
        translation['dqf.filter.evalDateStart'] = '평가 시작 날짜';
        translation['dqf.filter.evalDateEnd'] = '평가 종료 날짜';
        translation['dqf.filter.boolean.yes'] = '예';
        translation['dqf.filter.boolean.no'] = '아니요';
        translation['dqf.sublist.send.title'] = '독촉 이메일 전송 대기열';
        translation['dqf.sublist.print.title'] = '독촉 PDF 인쇄 대기열';
        translation['dqf.sublist.common.customer'] = '고객';
        translation['dqf.sublist.common.mark'] = '표시';
        translation['dqf.sublist.common.view'] = '보기';
        translation['dqf.sublist.common.id'] = 'ID';
        translation['dqf.sublist.dp.applies_to'] = '적용 대상';
        translation['dqf.sublist.common.dunning_procedure'] = '독촉 절차';
        translation['dqf.sublist.common.dunning_level'] = '수준';
        translation['dqf.sublist.record.last_letter_sent'] = '직전 서신 발송';
        translation['dqf.sublist.record.dunning_allow_email'] = '이메일 허용';
        translation['dqf.sublist.record.dunning_allow_print'] = '인쇄 허용';
        translation['dqf.sublist.record.pause_dunning'] = '독촉 일시 중지';
        translation['dqf.sublist.common.evaluation_date'] = '평가 날짜';
        translation['dqf.sublist.common.related_entity'] = '수취인';
        translation['dbu.form.title'] = '독촉하기 위해 고객 레코드 대량 업데이트';
        translation['dbu.form.update_button'] = '업데이트';
        translation['dbu.form.field.subsidiary'] = '자회사';
        translation['dbu.form.flh.subsidiary'] = '고객 레코드의 독촉 필드를 대량으로 업데이트할 자회사를 선택하십시오. 선택한 자회사에 포함된 모든 고객 레코드가 업데이트됩니다.';
        translation['dbu.form.field.allow_email'] = '독촉장 이메일 전송 허용';
        translation['dbu.form.flh.allow_email'] = '대랑 업데이트 후 고객 레코드의 이 필드에 적용할 값을 선택합니다.\n변경되지 않음 - 이 필드의 현재 값은 변경되지 않습니다. \n체크 표시됨 – 이 상자는 대량 업데이트 후 고객 레코드에서 체크 표시됩니다. \n체크 표시되지 않음 – 이 상자는 대량 업데이트 후 체크 표시가 지워집니다.';
        translation['dbu.form.field.allow_print'] = '독촉장 인쇄 허용';
        translation['dbu.form.flh.allow_print'] = '대랑 업데이트 후 고객 레코드의 이 필드에 적용할 값을 선택합니다.\n변경되지 않음 - 이 필드의 현재 값은 변경되지 않습니다. \n체크 표시됨 – 이 상자는 대량 업데이트 후 고객 레코드에서 체크 표시됩니다. \n체크 표시되지 않음 – 이 상자는 대량 업데이트 후 체크 표시되지 않습니다.';
        translation['dbu.form.field.dont_send_cust_email'] = '독촉장을 고객 이메일로 발송하지 않음';
        translation['dbu.form.flh.dont_send_cust_email'] = '대랑 업데이트 후 고객 레코드의 이 필드에 적용할 값을 선택합니다.\n변경되지 않음 - 이 필드의 현재 값은 변경되지 않습니다. \n체크 표시됨 – 이 상자는 대량 업데이트 후 고객 레코드에서 체크 표시됩니다. \n체크 표시되지 않음 – 이 상자는 대량 업데이트 후 체크 표시되지 않습니다.';
        translation['dbu.form.primary_field_group'] = '기준';
        translation['dbu.form.bulk_update_field_group'] = '필드 대량 업데이트';
        translation['dbu.form.options.unchanged'] = '- 변경되지 않음 -';
        translation['dbu.form.options.checked'] = '체크 표시됨';
        translation['dbu.form.options.not_checked'] = '체크 표시되지 않음';
        translation['dbu.validation.no_selection'] = ' "변경되지 않음"이 모든 필드에 대해 선택되어 있으므로 업데이트할 필드는 없습니다. 최소 한 필드 이상에서 변경이 지정되어 있는 경우(체크 표시됨 또는 체크 표시되지 않음) 대량 업데이트를 수행할 수 있습니다.';
        translation['dbu.validation.no_sending_media'] = ' 독촉장 이메일 전송 허용 상자 및 독촉장 인쇄 허용 상자를모두 체크 표시하지 않은 경우 고객 레코드는 저장할 수 없습니다. 다음 필드 중 하나 또는 둘 다에 체크인을 선택합니다.\n- 독촉장 이메일 전송 허용\n- 독촉장 인쇄 허용';
        translation['dbu.validation.verify_submit_ow'] = '독촉 절차가 있는 모든 고객 레코드가 선택한 자회사에 대해 업데이트됩니다 {SUBSIDIARY}. 이 처리가 완료되면 이메일 메시지가 사용자에게 전송됩니다. 대량 업데이트를 진행하시겠습니까? 확인을 클릭하면 대량 업데이트가 시작되며, 취소는 불가능합니다.';
        translation['dbu.validation.verify_submit_si'] = '독촉 절차가 있는 모든 고객 레코드가 업데이트됩니다. 이 처리가 완료되면 이메일 메시지가 사용자에게 전송됩니다. 대량 업데이트를 진행하시겠습니까? 확인을 클릭하면 대량 업데이트가 시작되며, 취소는 불가능합니다.';
        translation['dbu.form.reminderinlinehelp'] = 'NetSuite에서는 업무 시간 이외에 대량 업데이트를 사용할 것을 권장합니다. 이는 회사 내 다른 사용자가 대량 업데이트 과정 중 고객 레코드를 업데이트하지 않도록 만들기 위해서입니다.';
        translation['dbu.validation.validate_concurrency_ow'] = '독촉하기 위한 고객 레코드의 대량 업데이트를 자회사  {SUBSIDIARY}의  {USER}이(가) 시작했습니다. 이 대량 업데이트가 완료되어야 같은 자회사의 고객에 대해 다른 대량 업데이트를 수행할 수 있습니다.';
        translation['dbu.validation.validate_concurrency_si'] = '시스템에서는 한 번에 하나의 대량 업데이트만 실행할 수 있습니다.  {USER}이(가) 시작한 대량 업데이트가 현재 실행 중입니다.';
        translation['dbu.customer.message.complete_subject'] = '독촉하기 위해 고객 레코드 대량 업데이트';
        translation['dbu.customer.message.complete_body_ow'] = [
          'NetSuite에서 알려드립니다!<br />',
          '독촉하기 위해 고객 레코드 대량 업데이트가 자회사, {SUBSIDIARY}에 대해 완료되었습니다.',
          '독촉장 이메일 전송 허용 = {ALLOW_EMAIL}',
          '독촉장 인쇄 허용 = {ALLOW_PRINT}',
          '독촉장을 고객 이메일로 발송하지 않음 = {DONT_SEND_TO_CUST}<br />',
          '고객 레코드 수 업데이트됨: {PROCESSED_RECORDS} / {RECORD_COUNT}.{ERROR_STEPS}',
          '시스템에서 생성한 이메일입니다.<br />',
          '감사합니다,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.complete_body_si'] = [
          'NetSuite에서 알려드립니다!<br />',
          '독촉하기 위한 고객 레코드 대량 업데이트가 완료되었습니다.',
          '독촉장 이메일 전송 허용 = {ALLOW_EMAIL}',
          '독촉장 인쇄 허용 = {ALLOW_PRINT}',
          '독촉장을 고객 이메일로 발송하지 않음 = {DONT_SEND_TO_CUST}<br />',
          '고객 레코드 수 업데이트됨: {PROCESSED_RECORDS} / {RECORD_COUNT}.{ERROR_STEPS}',
          '시스템에서 생성한 이메일입니다.<br />',
          '감사합니다,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.error_file_header'] = '사용자 ID, 오류 ';
        translation['dbu.customer.message.error_filename'] = 'Failed Updates.csv';
        translation['dbu.customer.message.error_steps'] = '<br />업데이트하지 못한 레코드 목록을 보려면 이 첨부 파일을 다운로드하십시오. 해당 레코드는 수동으로 업데이트할 수 있습니다.';
        translation['dc.validateCustomer.noDPMatched'] = '해당 고객 레코드와 일치하는 독촉 절차가 없습니다.';
        translation['dc.validateCustomer.recipientNoEmail'] = '다음 독촉장 수취인은 연락처 레코드에 이메일 주소가 없습니다. {CONTACTNAMES}';
        translation['dc.validateCustomer.customerNoEmail'] = '레코드를 저장할 수 없습니다. 독촉장 이메일 전송 허용 상자가 체크 표시되어 있지만 독촉장을 전송할 이메일 주소 또는 독촉장 수취인이 없습니다. 이 레코드는 다음과 같은 경우에만 저장할 수 있습니다.\n- 독촉장 수취인 하위 탭에 이메일 주소가 있는 한 명 이상의 연락처가 있는 경우. \n- 고객 레코드의 이메일 필드에 이메일 주소가 있는 경우. \n\n참고: 고객의 이메일 주소는 독촉장을 고객 이메일로 발송하지 않음 상자가 체크 표시되지 않은 경우에만 필요합니다.';
        translation['dc.validateCustomer.noEmailAtAll'] = '고객 레코드에 이메일 주소가 없으며 이 고객에 대해 독촉장 수취인이 지정되어 있지 않습니다. 고객 레코드에 이메일 주소를 입력하거나 독촉 하위 탭에서 이메일 주소가 있는 최소 한 명의 독촉장 수취인을 선택합니다.';
        translation['dc.validateCustomer.recipientListEmpty'] = '레코드를 저장할 수 없습니다. 독촉장 이메일 전송 허용 상자가 체크 표시되어 있지만 독촉장을 전송할 독촉장 수취인이 없습니다. 이 레코드를 저장하려면 독촉장 수취인 하위 탭에 이메일 주소가 있는 한 명 이상의 연락처가 있어야 합니다. \n\n참고: 고객의 이메일 주소는 독촉장을 고객 이메일로 발송하지 않음 상자가 체크 표시되지 않은 경우에만 필요합니다.';
        translation['dc.validateCustomer.dpMatched'] = '해당 고객 레코드가 \'{DP}\' 독촉 절차와 일치합니다. 독촉 절차를 변경하시겠습니까?';
        translation['dc.validateCustomer.dpAllReadyAssigned'] = '발견된 독촉 절차가 레코드에 이미 할당된 독촉 절차와 같습니다.';
        translation['dc.validateDP.managerRequired'] = '독촉 관리자는 필수입니다.';
        translation['dc.validateDP.sendingModeRequired'] = '다음 상자 중 적어도 1개에 체크 표시해야 합니다:\n- 독촉장 이메일 발송 허용\n- 독촉장 인쇄 허용';
        translation['dl.validateDL.dlCountExceeded'] = '가능한 독촉 수준의 최대치를 초과했습니다.';
        translation['dl.validateDL.lowerDaysOverDue'] = '연체 일수는  {DAYS}일 미만이어야 합니다.';
        translation['dl.validateDL.higherDaysOverdue'] = '연체 일수는  {DAYS}일 이상이어야 합니다.';
        translation['dl.validateDL.daysOverdueExist'] = '연체 일수  {DAYS}일이 다른 라인에 존재합니다.';
        translation['dl.validateDL.lastRecordDeletion'] = '목록에서 직전 레코드만 삭제할 수 있습니다.';
        translation['dl.validateDL.daysBetSending'] = '서신 발송 간격 일수는  {DAYS}일과 같거나 커야 합니다';
        translation['dl.validateDL.minOutsBalGEZero'] = '최소 미결 금액은 영(0) 이상이어야 합니다.';
        translation['dl.validateDL.daysOverdueLessPrevious'] = '독촉 수준의 연체 일수 {LEVEL}({LEVEL_OVERDUE}일)는 독촉 수준 {PREVLEVEL}의 연체 일수({PREVLEVEL_OVERDUE}일)보다 적어야 합니다.';
        translation['dl.validateDL.dlRequired'] = '최소 1개의 독촉 수준은 필수입니다.';
        translation['dp.validateDP.editNotAllowed'] = '독촉 절차 유형을 편집할 권한이 없습니다.';
        translation['dp.information.possibleMultipleSending'] = '최소 독촉 간격 필드를 비활성화하면 사용자의 계정으로 다중 독촉장을 하루에 한명의 고객에게 전송할 수 있습니다. 비활성화하시겠습니까?';
        translation['dba.pagination.failedPrevPage'] = '이전 페이지로 이동하는 데 실패했습니다.';
        translation['dq.validation.str_send'] = '발송';
        translation['dq.validation.str_remove'] = '제거';
        translation['dq.validation.str_print'] = '인쇄';
        translation['dq.validation.chooseAction'] = '서신 수신자를 선택하십시오';
        translation['dq.validation.removalConfirmation'] = '선택한 레코드를 대기열에서 정말 제거하시겠습니까?';
        translation['dq.pt.dunningQueueTitle'] = '독촉 대기열';
        translation['dq.pt.source'] = '소스 유형';
        translation['dq.pt.dunningProcedure'] = '독촉 절차';
        translation['dq.pt.dunningLevel'] = '독촉 수준';
        translation['dq.pt.lastLetterSent'] = '직전 서신 발송';
        translation['dq.pt.emailingAllowed'] = '이메일 전송 허용됨';
        translation['dq.pt.printingAllowed'] = '인쇄 허용됨';
        translation['dq.pt.send'] = '발송';
        translation['dq.pt.remove'] = '제거';
        translation['dq.pt.print'] = '인쇄';
        translation['dq.pt.customer'] = '고객';
        translation['dt.validator.invalidDefault'] = '독촉 템플릿 유형별로 기본 템플릿을 하나 선택해야 합니다. 이메일 및 PDF 하위 탭을 확인한 후 기본 템플릿을 선택합니다.';
        translation['dt.validator.duplicateLanguage'] = '이 언어는 이 템플릿 유형에 이미 사용되고 있습니다.';
        translation['dt.validator.noTemplateDocs'] = '이 레코드를 저장하려면 하나 이상의 이메일 템플릿 문서와나 이상의 PDF 템플릿 문서가 있어야 합니다.';
        translation['dt.validator.subject'] = '실패한 독촉 템플릿 문서 검증';
        translation['dt.validator.body'] = '다음과 같은 템플릿 문서는 유효하지 않습니다.';
        translation['dt.validator.defaultDeletion'] = '현재 기본 템플릿으로 설정되어 있는 템플릿을 삭제하려고 합니다. 이 템플릿을 삭제하려면, 먼저 다른 템플릿을 기본 템플릿으로 선택해야 합니다.';
        translation['dt.validator.xmlEmailDeprecated'] = 'XML 이메일 템플릿 라인을 추가, 편집 또는 삭제할 수 없습니다. XML-기반 독촉 이메일 템플릿을 단계적으로 사용하지 않고 있습니다. 이메일 템플릿을 독촉 이메일 템플릿 하위 탭에 추가하는 경우 이 레코드를 저장하면 독촉 XML 이메일 템플릿 하위 탭의 모든 라인이 삭제됩니다.';
        translation['dt.validator.deleteAllXMLLines'] = '이 레코드를 삭제하면 독촉 XML 이메일 템플릿 하위 탭의 모든 라인이 삭제됩니다. ';
        translation['dt.validator.noEMailDocs'] = '이 레코드를 저장하려면 최소 하나의 이메일 템플릿이 있어야 합니다.';
        translation['dt.validator.noPDFDocs'] = '이 레코드를 저장하려면 최소 하나의 PDF 템플릿이 있어야 합니다.';
        translation['dt.validator.multipleDefault'] = '이 템플릿을 기본으로 사용하시겠습니까?';
        translation['dlr.validateDLR.noAmount'] = '독촉 수준 규칙에는 최소 1개의 독촉 수준 규칙 금액이 있어야 합니다.';
        translation['dlr.validateDLR.noDefaultAmount'] = '독촉 수준 규칙에는 최소 1개의 독촉 수준 규칙 금액이 기본 금액으로 설정되어 있어야 합니다.';
        translation['dlr.validateDLR.duplicateCurrency'] = '통화는 고유해야 합니다.';
        translation['dlr.validateDLR.invalidAmount'] = '금액은 0 이상이어야 합니다.';
        translation['dlr.validateDLR.changeDefaultCurrency'] = '이 라인의 통화와 금액을 기본값으로 사용하겠습니까? (이 경우 현재 기본 금액 및 통화가 변경됩니다)';
        translation['dlr.validateDLR.negativeDaysOverdue'] = '연체 기간(일) 필드에 음수가 있습니다. 이렇게 되면 지급 만료일 전 고객에게 독촉장이 발송됩니다.';
        translation['dlr.validateDLR.daysOverdueChanged'] = '채귀 수준 규칙에서 연체 기간의 값을 변경하면 채귀 수준의 시퀀스나 순서가 바뀔 수 있으며 이에 따라 부적절한 채귀 문자의 전송이 트리거될 수 있습니다. 변경하려는 채귀 수준이 사용되고 있는 경우 모든 채귀 절차({DP_LIST})에서 채귀 수준의 순서를 확인하는 것이 좋습니다.';
        translation['dlr.validateDLR.cannotAddCurrency'] = '다중 통화 기능이 활성화되어 있지 않으므로 해당 통화를 추가할 수 없습니다.';
        translation['der.flh.dunningProcedure'] = '이 필드에는 송장 또는 고객에게 할당된 독촉 절차가 표시됩니다.';
        translation['der.flh.dunningLevel'] = '이 필드에는 평가 후 현재 독촉 수준이 표시됩니다.';
        translation['der.flh.relatedEntity'] = '이 필드는 독촉장 수취인의 실체 또는 연락 기록에 링크됩니다.';
        translation['der.flh.messageContent'] = '이 필드에는 독촉장 내용이 포함됩니다.';
        translation['der.flh.invoiceList'] = '이 필드에는 독촉장과 관련된 송장 목록이 나열됩니다.';
        translation['der.flh.emailRecipient'] = '이 필드에는 독촉장 수취인의 이메일 주소가 표시됩니다.';
        translation['der.flh.subject'] = '이 필드에는 독촉장의 제목란이 표시됩니다.';
        translation['der.flh.dunningManager'] = '이 필드는 고객에게 할당된 독촉 관리자를 표시하며, 독촉 관리자의 직원 레코드에 링크됩니다.';
        translation['der.flh.dunningTemplate'] = '이 필드는 독촉 템플릿 레코드에 링크됩니다.';
        translation['der.flh.customer'] = '이 필드는 고객 레코드에 링크됩니다.';
        translation['der.flh.status'] = '이 필드는 이메일 전송 여부를 나타냅니다. 전송 상태는 다음과 같습니다. \n\n• 발송 - 이메일을 보냈습니다.\n• 실패 - 정보가 누락되어 이메일을 발송하지 못했습니다. 예를 들어 고객 또는 연락처의 이메일 주소가 없으면 이메일을 발송할 수 없습니다.\n• 대기됨 - 독촉장이 아직 독촉 대기열에 있으며 처리되지 않았습니다.\n• 삭제됨 - 독촉 관리자가 독촉 대기열에서 이 레코드를 제거했습니다.';
        translation['dlr.flh.daysOverdue'] = '납기일 이후 독촉장을 보내기 전까지의 기간(일)을 입력하십시오. 만기 날짜 이전 알림장을 보내려면 음수를 입력하십시오.';
        translation['ds.flh.description'] = '이 레코드에 대한 설명을 입력하십시오.';
        translation['dp.flh.dunningProcedure'] = '이 독촉 절차의 이름을 입력하십시오.';
        translation['dp.flh.description'] = '이 독촉 절차에 대한 설명을 입력하십시오.';
        translation['dp.flh.appliesTo'] = '이 독촉 절차를 고객 또는 송장에 할당할 것인지 여부를 선택합니다. 고객을 선택하면 재정의 허용 상자의 선택 여부도 결정해야 합니다.';
        translation['dp.flh.sendingSchedule'] = '독촉장 자동 발송 또는 수동 발송 여부를 선택합니다.';
        translation['dp.flh.minimumDunningInterval'] = '동일한 고객에게 두 개의 독촉장을 연속으로 전송할 때 그 최소 간격 일수를 선택하십시오. 이 규칙은 수동 및 자동 전송에 모두 적용됩니다.';
        translation['dp.flh.subsidiary'] = '이 독촉 절차를 적용할 자회사를 선택합니다.';
        translation['dp.flh.savedSearchCustomer'] = '이 절차를 적용할 고객 저장 검색을 선택하십시오.';
        translation['dp.flh.allowOverride'] = '이 상자를 체크 표시하면 송장 수준 독촉 절차가 이 절차 대신 사용됩니다. 송장 수준 독촉 절차는 송장이 해당 절차의 기준에 맞는 경우 고객 수준 독촉 절차가 이미 할당되어 있어도 이를 무시하고 사용됩니다.';
        translation['dp.flh.department'] = '이 절차를 적용할 부서를 선택하십시오.';
        translation['dp.flh.class'] = '이 절차를 적용할 클래스를 선택하십시오.';
        translation['dp.flh.location'] = '이 절차를 적용할 위치를 선택하십시오.';
        translation['dp.flh.savedSearchInvoice'] = '이 절차를 적용할 송장 저장 검색을 선택하십시오.';
        translation['dp.flh.assignAutomatically'] = '시스템이 선택 기준에 따라 이 독촉 절차를 고객 또는 송장에 자동으로 할당하도록 하려면 이 상자에 체크 표시하십시오.';
        translation['dt.flh.name'] = '이 독촉 템플릿의 이름을 입력하십시오.';
        translation['dt.flh.description'] = '이 독촉 템플릿에 대한 설명을 입력하십시오.';
        translation['dt.flh.attachStatement'] = '이 상자에 체크 표시하면 이 템플릿을 사용하는 독촉장에 고객 명세서가 첨부됩니다.';
        translation['dt.flh.attachInvoiceCopy'] = '이 상자에 체크 표시하면 이 템플릿을 사용하는 독촉장에 송장이 첨부됩니다.';
        translation['dt.flh.overdueInvoiceOnly'] = '연체 송장만 첨부하려면 이 상자에 체크 표시합니다.';
        translation['dt.flh.openTransactionOnly'] = '고객 명세서에 미결 거래만 포함하려면 이 상자에 체크 표시합니다.';
        translation['dt.flh.inactive'] = '레코드 구독을 비활성화하려면 이 상자에 체크 표시하십시오. 비활성화된 템플릿은 목록에 표시되지 않으며, 독촉장 전송에 사용할 수 없습니다.';
        translation['dc.flh.allowEmail'] = '독촉장을 이메일로 전송하려면 이 상자에 체크하십시오.';
        translation['dc.flh.lastLetterSent'] = '직전 독촉장 발송 날짜.';
        translation['dc.flh.dunningLevel'] = '이 필드는 직전 독촉 평가 당시의 독촉 수준을 표시합니다.';
        translation['dc.flh.dunningManager'] = '이 고객의 독촉 담당자와 독촉장 발송자로 표시할 이름을 선택하십시오.';
        translation['dc.flh.dunningProcedure'] = '이 필드에는 고객에게 할당된 독촉 절차가 표시됩니다. 자동 할당을 클릭하면 독촉 선택 기준에 따라 해당 절차가 할당됩니다. 고객에게 할당된 독촉 절차를 변경하려면 드롭다운 목록에서 다른 값을 선택합니다. 이 드롭다운 목록에는 독촉 절차 레코드에 정의된 선택 기준에 따라 이 고객에게 알맞은 독촉 절차만 표시됩니다.';
        translation['dc.flh.allowPrint'] = '독촉장을 인쇄하려면 이 상자에 체크하십시오.';
        translation['dc.flh.pauseReason'] = '독촉 절차 일시 중지 사유를 선택하여 표시하십시오.';
        translation['dc.flh.pauseReasonDetail'] = '상세정보를 선택해서 독촉 절차 일시 중지 사유를 표시하십시오.';
        translation['dc.flh.pauseDunning'] = '독촉 절차를 일시 중지하려면 이 상자에 체크 표시하십시오.';
        translation['dc.flh.dunningRecepients'] = '추가할 독촉장 수취인을 선택하십시오.';
        translation['dc.flh.allowEmail'] = '독촉장을 이메일로 전송하려면 이 상자에 체크하십시오.';
        translation['di.flh.lastLetterSent'] = '직전 독촉장 발송 날짜.';
        translation['di.flh.dunningLevel'] = '이 필드는 직전 독촉 평가 당시의 독촉 수준을 표시합니다.';
        translation['di.flh.dunningManager'] = '이 송장의 독촉 담당자와 독촉장 발송자로 표시할 이름을 선택하십시오.';
        translation['di.flh.dunningProcedure'] = '이 필드에는 송장 또는 고객에게 할당된 독촉 절차가 표시됩니다. 자동 할당을 클릭하면 독촉 선택 기준에 따라 해당 절차가 할당됩니다. 송장에 할당된 독촉 절차를 변경하려면 드롭다운 목록에서 다른 값을 선택합니다. 이 드롭다운 목록에는 독촉 절차 레코드에 정의된 선택 기준에 따라 이 송장에 알맞은 독촉 절차만 표시됩니다.';
        translation['di.flh.allowPrint'] = '독촉장을 인쇄하려면 이 상자에 체크하십시오.';
        translation['di.flh.pauseReason'] = '독촉 절차 일시 중지 사유를 선택하여 표시하십시오.';
        translation['di.flh.pauseReasonDetail'] = '독촉 절차 일시 중지 상세 사유를 선택하여 표시하십시오.';
        translation['di.flh.pauseDunning'] = '독촉 절차를 일시 중지하려면 이 상자에 체크 표시하십시오.';
        translation['dp.validate.unpause'] = '독촉 일시 중지 상자의 체크 표시를 지우면 독촉 평가 워크플로우가 즉시 시작됩니다. NetSuite에서 독촉 평가 결과에 따라 이 고객에게 독촉장을 보낼 수 있습니다. 독촉을 다시 시작하시겠습니까?';
        translation['dc.validateSubsidiary.existingConfigSubsidiary'] = '이 자회사에 대한 독촉 구성 레코드가 이미 있습니다.';
        translation['l10n.address.invalidPOBox'] = '유효한 사서함 번호를 입력하십시오.';
        translation['l10n.address.invalidZipCode'] = '유효한 우편번호를 입력하십시오.';
        translation['l10n.address.invalidRuralRoute'] = '유효한 지역 배달 주소(Rural Route)를 입력하십시오.';
        translation['l10n.accessForDDandAccountant'] = '관리자, 독촉 책임자 및 회계사 역할이 있어야 이런 유형의 레코드를 만들고 바꿀 수 있습니다.';
        translation['l10n.deleteAccessForDDandAccountant'] = '관리자, 독촉 책임자 및 회계사 역할이 있어야 이런 유형의 레코드를 삭제할 수 있습니다.';
        translation['l10n.accessForAdministrator'] = '관리자 역할이 있어야 이런 유형의 레코드를 만들고 바꿀 수 있습니다.';
        translation['l10n.deleteAccessForAdministrator'] = '관리자 역할이 있어야 이런 유형의 레코드를 삭제할 수 있습니다.';
        translation['l10n.noPagePrivilege'] = '이 페이지를 볼 수 있는 권한이 없습니다.';
        translation['dq.pdfemail.folderName'] = '인쇄용 PDF 형식의 독촉장';
        translation['dq.pdfemail.subject'] = '생성된 PDF 독촉장은 파일 캐비닛에서 인쇄할 수 있습니다.';
        translation['dq.pdfemail.link'] = 'PDF 편지 폴더를 보려면 다음 링크를 클릭하십시오.';
        translation['dq.pdfemail.tableHead'] = '다음 표는 PDF 파일이 저장된 폴더의 세부 사항을 보여 줍니다.';
        translation['dq.pdfemail.exceedLimit'] = '첨부 제한 초과로 생성된 파일을 첨부할 수 없습니다.';
        translation['dq.pdfemail.tableLabel1'] = '폴더';
        translation['dq.pdfemail.tableLabel2'] = '경로';
        translation['dq.pdfemail.tableLabel3'] = '상태';
        translation['dq.pdfemail.tableLabel4'] = '참고';

        break;

      case 'nl_NL':
      case 'nl-NL':
        translation['dsa.response.none_found'] = 'Geen aanmaningsprocedures beschikbaar.';
        translation['form.dunning_template.title'] = 'Sjabloon Aanmaning';
        translation['field.template.name'] = 'Naam';
        translation['field.template.description'] = 'Beschrijving';
        translation['field.template.attachStatement'] = 'Overzicht bijvoegen';
        translation['field.template.overdue_invoices_stmt'] = 'Alleen achterstallige facturen op het overzicht';
        translation['field.template.inactive'] = 'Niet actief';
        translation['field.template.attach_invoice_copy'] = 'Kopieën van facturen bijvoegen';
        translation['field.template.only_overdue_invoices'] = 'Alleen achterstallige facturen';
        translation['field.template.subject'] = 'Onderwerp';
        translation['selection.template.savedsearch'] = 'Opgeslagen zoekopdracht';
        translation['selection.template.searchcolumn'] = 'Kolom doorzoeken';
        translation['label.template.lettertext'] = 'Brieftekst';
        translation['dba.form.title'] = 'Toewijzing massa-aanmaning';
        translation['dba.form.source'] = 'Van toepassing op';
        translation['dba.form.procedure'] = 'Aanmaningsprocedure';
        translation['dba.form.source.help'] = 'Van toepassing op';
        translation['dba.form.procedure.help'] = 'Aanmaningsprocedure';
        translation['dba.form.dunning_manager'] = 'Aanmaningsmanager';
        translation['dba.form.dunning_manager.help'] = 'Aanmaningsmanager';
        translation['dba.tab.invoice'] = 'Facturen';
        translation['dba.sublist.invoice'] = 'Facturen';
        translation['dba.tab.customer'] = 'Klanten';
        translation['dba.sublist.customer'] = 'Klanten';
        translation['dba.sublist.common.id'] = 'ID';
        translation['dba.sublist.common.customer'] = 'Klant';
        translation['dba.sublist.invoice.invoice'] = 'Factuur';
        translation['dba.sublist.invoice.amount'] = 'Bedrag';
        translation['dba.sublist.invoice.currency'] = 'Valuta';
        translation['dba.sublist.invoice.duedate'] = 'Einddatum';
        translation['dba.sublist.invoice.days_overdue'] = 'Dagen achterstallig';
        translation['dba.sublist.customer.subsidiary'] = 'Dochteronderneming';
        translation['dba.sublist.common.assign_dunning'] = 'Toewijzen';
        translation['dba.sublist.common.dunning_procedure'] = 'Aanmaningsprocedure';
        translation['dba.sublist.common.dunning_level'] = 'Aanmaningsniveau';
        translation['dba.sublist.common.last_letter_sent'] = 'Laatste brief verzonden op';
        translation['dba.sublist.common.dunning_sending_type'] = 'Type verzending';
        translation['dba.sublist.common.page_next'] = '>';
        translation['dba.sublist.common.page_previous'] = '<';
        translation['dba.sublist.common.page_option'] = '{startIndex} - {endIndex} van {totalEntryCount}';
        translation['dba.form.restriction'] = 'Selectiecriteria';
        translation['dba.form.selection'] = 'Selectie aanmaningsprocedure';
        translation['dba.form.restriction.subsidiary'] = 'Dochterondernemingen';
        translation['dba.form.restriction.location'] = 'Locaties';
        translation['dba.form.restriction.dept'] = 'Afdelingen';
        translation['dba.form.restriction.class'] = 'Klasses';
        translation['dba.form.restriction.search'] = 'Opgeslagen zoekopdracht';
        translation['dba.form.action.assign'] = 'Toewijzen';
        translation['dba.form.action.assign_customer'] = 'Toewijzen aan klanten';
        translation['dba.form.action.assign_invoice'] = 'Toewijzen aan facturen';
        translation['dba.form.action.cancel'] = 'Annuleren';
        translation['dba.form.notification.highnumberofrecord'] = 'Dit verzoek kan een aantal seconden in beslag nemen. Een ogenblik geduld, u wordt doorverwezen naar de pagina Aanmaningsprocedure.';
        translation['dqf.form.action.send'] = 'Verzenden';
        translation['dqf.form.action.print'] = 'Afdrukken';
        translation['dqf.form.action.remove'] = 'Verwijderen';
        translation['dqf.form.send.title'] = 'Verzendwachtrij aanmaningsmail';
        translation['dqf.form.print.title'] = 'Aanmanings-PDF printqueue';
        translation['dqf.filter.fieldGroup'] = 'Filters';
        translation['dqf.filter.inlineHelp'] = 'Gebruik de filters om de zoekopdracht specifieker te maken of om de weergegeven resultaten te beperken.';
        translation['dqf.filter.applyFiltersButton'] = 'Zoeken';
        translation['dqf.filter.customer'] = 'Klant';
        translation['dqf.filter.recipient'] = 'Ontvanger';
        translation['dqf.filter.procedure'] = 'Aanmaningsprocedure';
        translation['dqf.filter.dpLevel'] = 'Aanmaningsniveau';
        translation['dqf.filter.appliesTo'] = 'Van toepassing op';
        translation['dqf.filter.allowPrint'] = 'Afdrukken toestaan';
        translation['dqf.filter.allowEmail'] = 'E-mail toestaan';
        translation['dqf.filter.lastLtrSentStart'] = 'Laatste brief verzonden op (startdatum)';
        translation['dqf.filter.lastLtrSentEnd'] = 'Laatste brief verzonden op (einddatum)';
        translation['dqf.filter.evalDateStart'] = 'Evaluatie startdatum';
        translation['dqf.filter.evalDateEnd'] = 'Evaluatie einddatum';
        translation['dqf.filter.boolean.yes'] = 'Ja';
        translation['dqf.filter.boolean.no'] = 'Nee';
        translation['dqf.sublist.send.title'] = 'Verzendwachtrij aanmaningsmail';
        translation['dqf.sublist.print.title'] = 'Aanmanings-PDF printqueue';
        translation['dqf.sublist.common.customer'] = 'Klant';
        translation['dqf.sublist.common.mark'] = 'Markeren';
        translation['dqf.sublist.common.view'] = 'Weergeven';
        translation['dqf.sublist.common.id'] = 'ID';
        translation['dqf.sublist.dp.applies_to'] = 'Van toepassing op';
        translation['dqf.sublist.common.dunning_procedure'] = 'Aanmaningsprocedure';
        translation['dqf.sublist.common.dunning_level'] = 'Niveau';
        translation['dqf.sublist.record.last_letter_sent'] = 'Vorige verstuurde brief';
        translation['dqf.sublist.record.dunning_allow_email'] = 'E-mail toestaan';
        translation['dqf.sublist.record.dunning_allow_print'] = 'Afdrukken toestaan';
        translation['dqf.sublist.record.pause_dunning'] = 'Aanmanen pauzeren';
        translation['dqf.sublist.common.evaluation_date'] = 'Evaluatiedatum';
        translation['dqf.sublist.common.related_entity'] = 'Ontvanger';
        translation['dbu.form.title'] = 'Bulkupdate van klantrecords voor aanmaning';
        translation['dbu.form.update_button'] = 'Bijwerken';
        translation['dbu.form.field.subsidiary'] = 'Dochteronderneming';
        translation['dbu.form.flh.subsidiary'] = 'Selecteer de dochteronderneming waarvan u de aanmaningvelden op klantrecord in bulk wilt bijwerken. De updates worden toegepast op alle klantcontactrecords die tot de geselecteerde dochteronderneming horen.';
        translation['dbu.form.field.allow_email'] = 'Brieven versturen per e-mail toestaan';
        translation['dbu.form.flh.allow_email'] = 'Selecteer een op dit veld toe te passen waarde op de klantrecords nadat het bulkverwerkingsproces is uitgevoerd:\nOngewijzigd –De huidige waarde van het veld zal niet wijzigen. \nAangevinkt – Het vakje zal aangevinkt worden op klantrecords na het bulkverwerkingsproces. \nNiet aangevinkt – Het vakje zal leeg zijn na het bulkverwerkingsproces.';
        translation['dbu.form.field.allow_print'] = 'Brieven afdrukken toestaan';
        translation['dbu.form.flh.allow_print'] = 'Selecteer een op dit veld toe te passen waarde op de klantrecords nadat het bulkverwerkingsproces is uitgevoerd:\nOngewijzigd –De huidige waarde van het veld zal niet wijzigen. \nAangevinkt – Het vakje zal aangevinkt worden op klantrecords na het bulkverwerkingsproces. \nNiet aangevinkt – Het vakje zal leeg zijn na het bulkverwerkingsproces.';
        translation['dbu.form.field.dont_send_cust_email'] = 'Verzend geen brieven naar het e-mailadres van de klant.';
        translation['dbu.form.flh.dont_send_cust_email'] = 'Selecteer een op dit veld toe te passen waarde op de klantrecords nadat het bulkverwerkingsproces is uitgevoerd:\nOngewijzigd –De huidige waarde van het veld zal niet wijzigen. \nAangevinkt – Het vakje zal aangevinkt worden op klantrecords na het bulkverwerkingsproces. \nNiet aangevinkt – Het vakje zal leeg zijn na het bulkverwerkingsproces.';
        translation['dbu.form.primary_field_group'] = 'Criteria';
        translation['dbu.form.bulk_update_field_group'] = 'Bulk bijwerken velden';
        translation['dbu.form.options.unchanged'] = '- Ongewijzigd -';
        translation['dbu.form.options.checked'] = 'Geselecteerd';
        translation['dbu.form.options.not_checked'] = 'Niet geselecteerd';
        translation['dbu.validation.no_selection'] = 'Er zijn geen bij te werken velden omdat - Ongewijzigd - aangevinkt is voor alle velden. Een bulkverwerkingsproces kan worden uitgevoerd als een wijziging in ten minste één veld is aangeduid (Aangevinkt of Niet aangevinkt).';
        translation['dbu.validation.no_sending_media'] = 'Klantrecords kunnen niet opgeslagen worden als zowel het vakje Brieven versturen per e-mail toestaan en het vakje Brieven afdrukken toestaan niet zijn aangevinkt. Selecteer Geselecteerd in een of beide van de volgende velden:\n- Brieven verzenden via e-mail toestaan\n- Brieven afdrukken toestaan';
        translation['dbu.validation.verify_submit_ow'] = 'Alle klantrecords met aanmaningsprocedures worden bijgewerkt voor de geselecteerde dochteronderneming {SUBSIDIARY}. U ontvangt een e-mailbericht met de mededeling dat het proces is voltooid. Weet u zeker dat u door wilt gaan met het bulkverwerkingsproces? Als u op OK klikt, gaat het bulkverwerkingproces van start en is niet omkeerbaar!';
        translation['dbu.validation.verify_submit_si'] = 'Alle klantrecords met aanmaningsrocedures worden bijgewerkt. U ontvangt een e-mailbericht met de mededeling dat het proces is voltooid. Weet u zeker dat u door wilt gaan met het bulkverwerkingsproces? Als u op OK klikt, gaat het bulkverwerkingproces van start en is niet omkeerbaar!';
        translation['dbu.form.reminderinlinehelp'] = 'NetSuite raadt aan om de functie bulkverwerkingsproces uit te voeren na uw normale bedrijfsuren. Dit is om te verzekeren dat andere gebruikers in uw bedrijf geen klantrecord aan het bijwerken zijn tijdens het bulkverwerkingsproces';
        translation['dbu.validation.validate_concurrency_ow'] = 'Bulk bijwerken klantrecords voor aanmaning werd gestart door {USER} voor de dochteronderneming, {SUBSIDIARY}. Het bulkverwerkingsproces moet uitgevoerd worden voordat u een ander bulkverwerkingsproces van klanten kunt uitvoeren voor dezelfde dochteronderneming.';
        translation['dbu.validation.validate_concurrency_si'] = 'Het systeem kan niet meer dan een bulkverwerkingsproces per keer uitvoeren. Een bulkverwerkingsproces gestart door {USER} loopt momenteel.';
        translation['dbu.customer.message.complete_subject'] = 'Bulkverwerkingsproces van klantrecord voor aanmaning';
        translation['dbu.customer.message.complete_body_ow'] = [
          'Met vriendelijke groeten van NetSuite.<br />',
          ' Het bulkverwerkingsproces van klantrecords voor aanmaning is voltooid voor de dochteronderneming, {SUBSIDIARY}.',
          'Brieven versturen per e-mail toestaan = {ALLOW_EMAIL}',
          'Brieven afdrukken toestaan = {ALLOW_PRINT}',
          'Verzend geen brieven naar het e-mailadres van de klant. = {DONT_SEND_TO_CUST}<br />',
          'Aantal bijgewerkte klantrecords: {PROCESSED_RECORDS} van {RECORD_COUNT}{ERROR_STEPS}',
          'Dit is een door het systeem gegenereerde e-mail.<br />',
          'Hartelijk dank,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.complete_body_si'] = [
          'Met vriendelijke groeten van NetSuite.<br />',
          ' De bulkverwerking van klantrecords voor aanmaning is voltooid.',
          'Brieven versturen per e-mail toestaan = {ALLOW_EMAIL}',
          'Brieven afdrukken toestaan = {ALLOW_PRINT}',
          'Verzend geen brieven naar het e-mailadres van de klant. = {DONT_SEND_TO_CUST}<br />',
          'Aantal bijgewerkte klantrecords  {PROCESSED_RECORDS} van {RECORD_COUNT}{ERROR_STEPS}',
          'Dit is een door het systeem gegenereerde e-mail.<br />',
          'Hartelijk dank,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.error_file_header'] = 'Klant-ID, Fout';
        translation['dbu.customer.message.error_filename'] = 'Failed updates.csv';
        translation['dbu.customer.message.error_steps'] = '<br />Download het bijgevoegde bestand om de niet-bijgewerkte lijst van gegevens te bekijken. U kunt deze records manueel bijwerken.';
        translation['dc.validateCustomer.noDPMatched'] = 'Er is geen aanmaningsprocedure gevonden die overeenkomt met het klantrecord.';
        translation['dc.validateCustomer.recipientNoEmail'] = 'Van de volgende ontvangers van de aanmaningsbrief is in de records van de contactpersonen geen e-mailadres bekend.  {CONTACTNAMES}';
        translation['dc.validateCustomer.customerNoEmail'] = ' Het record is niet opgeslagen. Het vakje Brieven versturen per e-mail toestaan is aangevinkt, maar er is geen e-mailadres van ontvangers om de brieven naar te verzenden. Om dit record op te slaan moeten de volgende voorwaarden kloppen:\n- De subtab Aanmaningsontvanger heeft ten minste één contact met een e-mailadres.\n- Het veld e-mailadres op de klantrecord bevat een e-mailadres.\n\nNota: Het e-mailadres is vereist als alleen het vakje Verzend geen brieven naar het e-mailadres van de klant niet is aangevinkt. ';
        translation['dc.validateCustomer.noEmailAtAll'] = 'Er is geen e-mailadres op het klantrecord, en er is geen aanmaningsontvanger aangeduid voor deze klant. Voer een e-mailadres op het klantrecord in, of selecteer op de subtab Aanmaning ten minste één aanmaningsbriefontvanger met een e-mailadres.';
        translation['dc.validateCustomer.recipientListEmpty'] = ' Het record is niet opgeslagen. Het vakje Brieven versturen per e-mail toestaan is aangevinkt, maar is geen adres van de aanmaningontvanger om de brieven naar te verzenden. Om dit record op slaan, moet de subtab Aanmaningsontvanger ten minste één contact met een e-mailadres bevatten. \n\nNota: Het e-mailadres is vereist als alleen het vakje Verzend geen brieven naar het e-mailadres van de klant niet is aangevinkt. ';
        translation['dc.validateCustomer.dpMatched'] = 'Het klantrecord stemt overeen met de aanmaningsprocedure \'{DP}\'. Wilt u de aanmaningsprocedure wijzigen?';
        translation['dc.validateCustomer.dpAllReadyAssigned'] = 'De gevonden aanmaningsprocedure is dezelfde als de reeds toegewezen aanmaningsprocedure in het record.';
        translation['dc.validateDP.managerRequired'] = 'Vermelden van de aanmaningsmanager is verplicht.';
        translation['dc.validateDP.sendingModeRequired'] = 'In minstens een van de genoemde hokjes moet een vinkje staan:\n- Brieven verzenden via e-mail toestaan\n- Brieven afdrukken toestaan';
        translation['dl.validateDL.dlCountExceeded'] = 'U hebt het maximale aantal mogelijke aanmaningsniveaus overschreden.';
        translation['dl.validateDL.lowerDaysOverDue'] = 'Het aantal dagen achterstallig moet kleiner zijn dan {DAYS}.';
        translation['dl.validateDL.higherDaysOverdue'] = 'Het aantal dagen achterstallig moet groter zijn dan {DAYS}.';
        translation['dl.validateDL.daysOverdueExist'] = 'Het aantal dagen achterstallig {DAYS} staat al in een andere regel.';
        translation['dl.validateDL.lastRecordDeletion'] = 'U mag alleen het laatste record in de lijst verwijderen.';
        translation['dl.validateDL.daysBetSending'] = 'Het aantal dagen tussen versturen van de brieven moet groter dan of gelijk zijn aan {DAYS}';
        translation['dl.validateDL.minOutsBalGEZero'] = 'Het minimaal openstaande bedrag moet ten minste nul (0) zijn.';
        translation['dl.validateDL.daysOverdueLessPrevious'] = 'Het aantal dagen achterstallig in aanmaningsniveau {LEVEL} ({LEVEL_OVERDUE} dagen) moet kleiner zijn dan het aantal dagen van het aanmaningsniveau  {PREVLEVEL} ({PREVLEVEL_OVERDUE}dagen).';
        translation['dl.validateDL.dlRequired'] = 'Er is minstens één aanmaningsniveau vereist.';
        translation['dp.validateDP.editNotAllowed'] = 'U bent niet bevoegd om dit type aanmaningsprocedure te bewerken.';
        translation['dp.information.possibleMultipleSending'] = 'Het veld Minimum aanmaningsinterval uitschakelen stelt u in staat om meerdere aanmaningsbrieven naar een klant te verzenden per dag. Weet u zeker dat u wilt afsluiten?';
        translation['dba.pagination.failedPrevPage'] = 'Teruggaan naar de vorige pagina is mislukt.';
        translation['dq.validation.str_send'] = 'verzenden';
        translation['dq.validation.str_remove'] = 'verwijderen';
        translation['dq.validation.str_print'] = 'afdrukken';
        translation['dq.validation.chooseAction'] = 'Selecteer een brief om te ';
        translation['dq.validation.removalConfirmation'] = 'Weet u zeker dat u de geselecteerde records uit de wachtrij wilt verwijderen?';
        translation['dq.pt.dunningQueueTitle'] = 'Wachtrij aanmaning';
        translation['dq.pt.source'] = 'Bronsoort';
        translation['dq.pt.dunningProcedure'] = 'Aanmaningsprocedure';
        translation['dq.pt.dunningLevel'] = 'Aanmaningsniveau';
        translation['dq.pt.lastLetterSent'] = 'Vorige verstuurde brief';
        translation['dq.pt.emailingAllowed'] = 'E-mailen toegestaan';
        translation['dq.pt.printingAllowed'] = 'Afdrukken toegestaan';
        translation['dq.pt.send'] = 'Verzenden';
        translation['dq.pt.remove'] = 'Verwijderen';
        translation['dq.pt.print'] = 'Afdrukken';
        translation['dq.pt.customer'] = 'Klant';
        translation['dt.validator.invalidDefault'] = 'Er dient ten minste een standaard sjabloon geselecteerd te zijn voor elk van de sjabloon aanmaning types. Neem de subtabs E-mail en PDF opnieuw door en selecteer een standaard sjabloon.';
        translation['dt.validator.duplicateLanguage'] = 'Deze taal wordt al gebruikt voor dit type record.';
        translation['dt.validator.noTemplateDocs'] = 'Om dit record op te slaan, moet er minstens één e-mailsjabloondocument en een PDF-sjabloondocument bestaan.';
        translation['dt.validator.subject'] = 'Validatie sjabloondocument Aanmaning is mislukt';
        translation['dt.validator.body'] = 'De vermelde sjabloondocumenten zijn ongeldig:';
        translation['dt.validator.defaultDeletion'] = 'U probeert een sjabloon te verwijderen dat staat ingesteld als standaard. Om dit sjabloon te verwijderen, moet u eerst een andere sjabloon als uw standaardsjabloon kiezen.';
        translation['dt.validator.xmlEmailDeprecated'] = 'U kunt XML e-mailsjabloonregels niet toevoegen, bewerken of verwijderen. Er wordt steeds minder gebruikgemaakt van op XML gebaseerde sjablonen voor e-mailaanmaningen. Als u een e-mailsjabloon toevoegt aan de subtab Sjabloon E-mailaanmaning, worden alle regels verwijderd op de subtab Sjabloon Op XML gebaseerde e-mailaanmaning.';
        translation['dt.validator.deleteAllXMLLines'] = 'Als u dit record opslaat, worden alle regels op de subtab XML Sjabloon E-mailaanmaning verwijderd. ';
        translation['dt.validator.noEMailDocs'] = 'Er moet minstens één sjabloondocument bestaan om dit record op te slaan.';
        translation['dt.validator.noPDFDocs'] = 'Er moet minstens één PDF-sjabloon bestaan om dit record op te slaan.';
        translation['dt.validator.multipleDefault'] = 'Weet u zeker dat u dit sjabloon wilt gebruiken als standaard?';
        translation['dlr.validateDLR.noAmount'] = 'In de regel voor het aanmaningsniveau moet minstens één bedrag van de regel voor het aanmaningsniveau zijn vermeld.';
        translation['dlr.validateDLR.noDefaultAmount'] = 'In de regel voor het aanmaningsniveau moet minstens één bedrag van de regel voor het aanmaningsniveau als standaardbedrag zijn vermeld.';
        translation['dlr.validateDLR.duplicateCurrency'] = 'De valuta moet uniek zijn.';
        translation['dlr.validateDLR.invalidAmount'] = 'Het bedrag moet groter zijn dan of gelijk zijn aan 0.';
        translation['dlr.validateDLR.changeDefaultCurrency'] = 'Weet u zeker dat u het huidige bedrag in de regel als het standaardbedrag wilt gebruiken? (Hierdoor worden het huidige standaardbedrag en de valuta gewijzigd)';
        translation['dlr.validateDLR.negativeDaysOverdue'] = 'Het veld Dagen achterstallig bevat een negatief getal. Hierdoor wordt een brief verzonden naar de klant voor de betaling achterstallig is.';
        translation['dlr.validateDLR.daysOverdueChanged'] = 'Bij het wijzigen van de waarde voor Dagen achterstallig in een aanmaningsniveauregel kan de volgorde van aanmaningsregels worden gewijzigd, wat tot het verzenden van onjuiste aanmaningsbrieven kan leiden.\n\n Het wordt daarom aangeraden dat u de volgorde van de aanmaningsniveauregels voor elke aanmaningsprocedure controleert ({DP_LIST}) waarvoor het aanmaningsniveau dat u wilt wijzigen in gebruik is.';
        translation['dlr.validateDLR.cannotAddCurrency'] = 'De valutu kan niet worden toegevoegd omdat de functie Meerdere valuta niet ingeschakeld is.';
        translation['der.flh.dunningProcedure'] = 'In dit veld wordt de, aan de factuur of aan de klant, toegewezen aanmaningsprocedure vermeld.';
        translation['der.flh.dunningLevel'] = 'In dit veld wordt het huidige aanmaningsniveau na evaluatie vermeld.';
        translation['der.flh.relatedEntity'] = 'Dit veld is gekoppeld aan de entiteit, of aan het record van de contactpersoon, van de ontvanger van de aanmaning.';
        translation['der.flh.messageContent'] = 'In dit veld staat de inhoud van de aanmaningsbrief.';
        translation['der.flh.invoiceList'] = 'In dit veld staat een overzicht van de bijbehorende facturen van de aanmaningsbrief.';
        translation['der.flh.emailRecipient'] = 'In dit veld staan de e-mailadressen van de ontvangers van de aanmaningsbrieven.';
        translation['der.flh.subject'] = 'In dit veld staat het onderwerpregel van de aanmaningsbrief.';
        translation['der.flh.dunningManager'] = 'In dit veld staat de aan de klant toegewezen aanmaningsmanager. Het veld is gekoppeld aan het medewerkersrecord van de aanmaningsmanager.';
        translation['der.flh.dunningTemplate'] = 'Dit veld is gekoppeld aan het record van het aanmaningssjabloon.';
        translation['der.flh.customer'] = 'Dit veld is gekoppeld aan het klantrecord.';
        translation['der.flh.status'] = 'Dit veld geeft aan of de e-mail al dan niet verzonden werd. De status kan een van de volgende zijn:\n\n• Verzonden - De e-mail werd verzonden.\n• Mislukt - Het systeem kon de e-mail niet verzenden omwille van ontbrekende informatie. Een voorbeeld hiervan is geen e-mailadres voor de klant of contact.\n• In de wachtrij - De aanmaningsbrief staat nog steeds in de wachtrij, en werd nog niet verwerkt.\n• Verwijderd - De aanmaningsmanager heeft dit record uit de wachtrij verwijderd.';
        translation['dlr.flh.daysOverdue'] = 'Voer het aantal dagen na de Einddatum betaling in wanneer een aanmaningsbrief verzonden moet worden. Om een brief te sturen voor de einddatum, voer een negatief nummer in.';
        translation['ds.flh.description'] = 'Voer een beschrijving in voor dit record.';
        translation['dp.flh.dunningProcedure'] = 'Voer een naam voor deze aanmaningsprocedure in.';
        translation['dp.flh.description'] = 'Voer een beschrijving van deze aanmaningsprocedure in.';
        translation['dp.flh.appliesTo'] = 'Selecteer of deze aanmaningsprocedure zal worden toegewezen aan klanten of facturen. Als u Klant selecteert, moet het vakje Overschrijven toestaan aanvinken of leeg maken.';
        translation['dp.flh.sendingSchedule'] = 'Selecteer of aanmaningsbrieven automatisch of handmatig moeten worden verzonden.';
        translation['dp.flh.minimumDunningInterval'] = 'Selecteer het minimum aanmaningsintervallen tussen het versturen van twee achtereenvolgende aanmaningsbrieven aan dezelfde klant. Dit is van toepassing op zowel handmatige als automatische verzending.';
        translation['dp.flh.subsidiary'] = 'Selecteer de dochterondernemingen op welke deze aanmaningsprocedure van toepassing is.';
        translation['dp.flh.savedSearchCustomer'] = 'Selecteer de opgeslagen zoekopdracht van de klant op wie deze procedure van toepassing is.';
        translation['dp.flh.allowOverride'] = 'Als u dit vakje aanvinkt, kan een aanmaningsprocedure op factuurniveau deze procedure overschrijven. Een factuuraanmaningsprocedure zal worden gebruikt als een factuur overeenstemt met de criteria voor die procedure, ongeacht of een aanmaningsprocedure op klantniveau al werd toegewezen.';
        translation['dp.flh.department'] = 'Selecteer de afdelingen op welke deze procedure van toepassing is.';
        translation['dp.flh.class'] = 'Selecteer de klassen op welke deze procedure van toepassing is.';
        translation['dp.flh.location'] = 'Selecteer de locaties op welke deze procedure van toepassing is.';
        translation['dp.flh.savedSearchInvoice'] = 'Selecteer de opgeslagen zoekopdracht van de factuur op welke deze procedure van toepassing is.';
        translation['dp.flh.assignAutomatically'] = 'Vink dit vakje aan om automatische toewijzing van het aanmaningsproces door het systeem, op basis van de selectiecriteria, aan klanten of facturen, in te schakelen.';
        translation['dt.flh.name'] = 'Voer een naam voor dit aanmaningssjabloon in.';
        translation['dt.flh.description'] = 'Voer een beschrijving voor dit aanmaningssjabloon in.';
        translation['dt.flh.attachStatement'] = 'Vink dit vakje aan om klantoverzichten toe te voegen aan brieven die dit sjabloon gebruiken.';
        translation['dt.flh.attachInvoiceCopy'] = 'Vink dit vakje aan om facturen toe te voegen aan aanmaningsbrieven die dit sjabloon gebruiken.';
        translation['dt.flh.overdueInvoiceOnly'] = 'Vink dit vakje aan wanneer u alleen achterstallige facturen wilt bijvoegen.';
        translation['dt.flh.openTransactionOnly'] = 'Vink dit vakje aan wanneer u alleen open transacties op het klantenoverzicht wilt vermelden.';
        translation['dt.flh.inactive'] = 'Vink dit vakje aan om het sjabloon te deactiveren. Sjablonen die niet actief zijn worden niet weergegeven in lijsten en kunnen niet worden gebruikt om aanmaningsbrieven te versturen.';
        translation['dc.flh.allowEmail'] = 'Vink dit vakje aan als u aanmaningsbrieven per e-mail wilt versturen.';
        translation['dc.flh.lastLetterSent'] = 'De verzenddatum van de vorige verstuurde aanmaningsbrief.';
        translation['dc.flh.dunningLevel'] = 'In dit veld is het huidige aanmaningsniveau van de laatste aanmaningsevaluatie weergegeven.';
        translation['dc.flh.dunningManager'] = 'Selecteer de persoon die verantwoordelijk is voor het aanmanen van deze klant en wiens naam moet worden afgedrukt als afzender van de aanmaningsbrief.';
        translation['dc.flh.dunningProcedure'] = ' Dit veld toont de aan de klant toe te wijzen aanmaningsprocedure. Als u klikt op Automatisch toewijzen, zal het systeem de passende procedure toewijzen op basis van de aanmaningsselectiescriteria. Selecteer een andere waarde uit de vervolgkeuzelijst om de aan de klant toegewezen aanmaningsprocedure te wijzigen. De vervolgkeuzelijst toont alleen de aanmaningsprocedures die van toepassing zijn op deze klant op basis van de op de aanmaningsrecords gedefinieerde selectiecriteria.';
        translation['dc.flh.allowPrint'] = 'Vink dit vakje aan als u aanmaningsbrieven wilt afdrukken.';
        translation['dc.flh.pauseReason'] = 'Selecteer een reden die aangeeft waarom het aanmanen is gepauzeerd.';
        translation['dc.flh.pauseReasonDetail'] = 'Selecteer een bijzonderheid die aangeeft waarom het aanmanen is gepauzeerd.';
        translation['dc.flh.pauseDunning'] = 'Vink dit vakje aan om het aanmaningsproces tijdelijk te stoppen.';
        translation['dc.flh.dunningRecepients'] = 'Selecteer nog meer ontvangers van aanmaningsbrieven';
        translation['dc.flh.allowEmail'] = 'Vink dit vakje aan als u aanmaningsbrieven per e-mail wilt versturen.';
        translation['di.flh.lastLetterSent'] = 'De verzenddatum van de vorige verstuurde aanmaningsbrief.';
        translation['di.flh.dunningLevel'] = 'In dit veld is het huidige aanmaningsniveau van de laatste aanmaningsevaluatie weergegeven.';
        translation['di.flh.dunningManager'] = 'Selecteer de persoon die verantwoordelijk is voor het aanmanen van deze facturen en wiens naam moet worden afgedrukt als afzender van de aanmaningsbrief.';
        translation['di.flh.dunningProcedure'] = 'In dit veld wordt de aan de factuur toegewezen aanmaningsprocedure getoond. Als u klikt op Automatisch toewijzen, zal het systeem de passende procedure toewijzen op basis van de aanmaningsselectiescriteria. Selecteer een andere waarde uit de vervolgkeuzelijst om de aan de factuur toegewezen aanmaningsprocedure te wijzigen. De vervolgkeuzelijst toont alleen de aanmaningsprocedures die van toepassing zijn op deze factuur op basis van de op de aanmaningsrecords gedefinieerde selectiecriteria.';
        translation['di.flh.allowPrint'] = 'Vink dit vakje aan als u aanmaningsbrieven wilt afdrukken.';
        translation['di.flh.pauseReason'] = 'Selecteer een reden die aangeeft waarom het aanmanen is gepauzeerd.';
        translation['di.flh.pauseReasonDetail'] = 'Selecteer een bijzonderheid die aangeeft waarom het aanmanen is gepauzeerd.';
        translation['di.flh.pauseDunning'] = 'Vink dit vakje aan om het aanmaningsproces tijdelijk te stoppen.';
        translation['dp.validate.unpause'] = 'Door het vakje Aanmanen pauzeren leeg te maken, zal de aanmaningsevaluatie workflow onmiddellijk starten. NetSuite kan een aanmaningsbrief verzenden naar deze klant afhankelijk van het aanmaningsevaluatieresultaat. Weet u zeker dat u de aanmaning wilt hervatten?';
        translation['dc.validateSubsidiary.existingConfigSubsidiary'] = 'Een aanmaningsconfiguratierecord bestaat al voor deze dochteronderneming.';
        translation['l10n.address.invalidPOBox'] = 'Voor een geldigpostbus nummer in dit veld in.';
        translation['l10n.address.invalidZipCode'] = 'Voer een geldige postcode in.';
        translation['l10n.address.invalidRuralRoute'] = 'Voer een geldige landelijke routewaarde in.';
        translation['l10n.accessForDDandAccountant'] = 'Alleen de rollenbeheerder, aanmaningsdirecteur en accountant kunnen dit recordtype creëren en wijzigen.';
        translation['l10n.deleteAccessForDDandAccountant'] = 'Alleen de rollerbeheerder, aanmaningsdirecteur en accountant kunnen dit recordtype creëren en verwijderen.';
        translation['l10n.accessForAdministrator'] = 'Alleen de beheerdersrol kan dit recordtype creëren en wijzigen.';
        translation['l10n.deleteAccessForAdministrator'] = 'Alleen de beheerdersrol kan dit recordtype creëren en verwijderen.';
        translation['l10n.noPagePrivilege'] = 'U bent niet gemachtigd om deze pagina te zien';
        translation['dq.pdfemail.folderName'] = 'Aanmaningsbrieven in PDF-indeling om af te drukken';
        translation['dq.pdfemail.subject'] = 'De gegenereerde aanmaningsbrieven in PDF-indeling zijn beschikbaar om te worden afgedrukt in het bestandssysteem.';
        translation['dq.pdfemail.link'] = 'Klik op de link om de map met brieven in PDF-indeling weer te geven:';
        translation['dq.pdfemail.tableHead'] = 'In de volgende tabel ziet u informatie over de mappen waarin de PDF-bestanden zijn opgeslagen.';
        translation['dq.pdfemail.exceedLimit'] = 'De gegenereerde bestanden kunnen niet worden bijgevoegd omdat de limiet voor bijlagen wordt overschreden.';
        translation['dq.pdfemail.tableLabel1'] = 'Mappen';
        translation['dq.pdfemail.tableLabel2'] = 'Pad';
        translation['dq.pdfemail.tableLabel3'] = 'Status';
        translation['dq.pdfemail.tableLabel4'] = 'Opmerkingen';

        break;

      case 'pt_BR':
      case 'pt-BR':
        translation['dsa.response.none_found'] = 'Nenhum procedimento de cobrança disponível.';
        translation['form.dunning_template.title'] = 'Modelo de cobrança';
        translation['field.template.name'] = 'Nome';
        translation['field.template.description'] = 'Descrição';
        translation['field.template.attachStatement'] = 'Anexar extrato';
        translation['field.template.overdue_invoices_stmt'] = 'Somente faturas vencidas no extrato';
        translation['field.template.inactive'] = 'Inativo';
        translation['field.template.attach_invoice_copy'] = 'Anexar cópias de faturas';
        translation['field.template.only_overdue_invoices'] = 'Somente faturas vencidas';
        translation['field.template.subject'] = 'Assunto';
        translation['selection.template.savedsearch'] = 'Busca salva';
        translation['selection.template.searchcolumn'] = 'Coluna de busca';
        translation['label.template.lettertext'] = 'Texto da carta';
        translation['dba.form.title'] = 'Atribuição de cobrança em lote';
        translation['dba.form.source'] = 'Aplica-se a';
        translation['dba.form.procedure'] = 'Procedimento de cobrança';
        translation['dba.form.source.help'] = 'Aplica-se a';
        translation['dba.form.procedure.help'] = 'Procedimento de cobrança';
        translation['dba.form.dunning_manager'] = 'Gerente de cobrança';
        translation['dba.form.dunning_manager.help'] = 'Gerente de cobrança';
        translation['dba.tab.invoice'] = 'Faturas';
        translation['dba.sublist.invoice'] = 'Faturas';
        translation['dba.tab.customer'] = 'Clientes';
        translation['dba.sublist.customer'] = 'Clientes';
        translation['dba.sublist.common.id'] = 'ID';
        translation['dba.sublist.common.customer'] = 'Cliente';
        translation['dba.sublist.invoice.invoice'] = 'Fatura';
        translation['dba.sublist.invoice.amount'] = 'Valor';
        translation['dba.sublist.invoice.currency'] = 'Moeda';
        translation['dba.sublist.invoice.duedate'] = 'Data de vencimento';
        translation['dba.sublist.invoice.days_overdue'] = 'Dias após o vencimento';
        translation['dba.sublist.customer.subsidiary'] = 'Subsidiária';
        translation['dba.sublist.common.assign_dunning'] = 'Atribuir';
        translation['dba.sublist.common.dunning_procedure'] = 'Procedimento de cobrança';
        translation['dba.sublist.common.dunning_level'] = 'Nível de cobrança';
        translation['dba.sublist.common.last_letter_sent'] = 'Data de envio da última carta';
        translation['dba.sublist.common.dunning_sending_type'] = 'Tipo de envio';
        translation['dba.sublist.common.page_next'] = '>';
        translation['dba.sublist.common.page_previous'] = '<';
        translation['dba.sublist.common.page_option'] = '{startIndex} - {endIndex} de {totalEntryCount}';
        translation['dba.form.restriction'] = 'Critérios de seleção';
        translation['dba.form.selection'] = 'Seleção do procedimento de cobrança';
        translation['dba.form.restriction.subsidiary'] = 'Subsidiárias';
        translation['dba.form.restriction.location'] = 'Localidades';
        translation['dba.form.restriction.dept'] = 'Departamentos';
        translation['dba.form.restriction.class'] = 'Centros de custo';
        translation['dba.form.restriction.search'] = 'Busca salva';
        translation['dba.form.action.assign'] = 'Atribuir';
        translation['dba.form.action.assign_customer'] = 'Atribuir a clientes';
        translation['dba.form.action.assign_invoice'] = 'Atribuir a faturas';
        translation['dba.form.action.cancel'] = 'Cancelar';
        translation['dba.form.notification.highnumberofrecord'] = 'Esta solicitação pode levar alguns segundos para ser concluída. Por favor, aguarde até ser redirecionado para a página de Procedimento de cobrança.';
        translation['dqf.form.action.send'] = 'Enviar';
        translation['dqf.form.action.print'] = 'Imprimir';
        translation['dqf.form.action.remove'] = 'Remover';
        translation['dqf.form.send.title'] = 'Fila de envios de e-mail de cobrança';
        translation['dqf.form.print.title'] = 'Fila de impressão de PDF de cobrança';
        translation['dqf.filter.fieldGroup'] = 'Filtros';
        translation['dqf.filter.inlineHelp'] = 'Use os filtros para tornar a pesquisa mais específica ou para limitar os resultados a serem exibidos.';
        translation['dqf.filter.applyFiltersButton'] = 'Buscar';
        translation['dqf.filter.customer'] = 'Cliente';
        translation['dqf.filter.recipient'] = 'Destinatário';
        translation['dqf.filter.procedure'] = 'Procedimento de cobrança';
        translation['dqf.filter.dpLevel'] = 'Nível de cobrança';
        translation['dqf.filter.appliesTo'] = 'Aplica-se a';
        translation['dqf.filter.allowPrint'] = 'Permitir impressão';
        translation['dqf.filter.allowEmail'] = 'Permitir envio por e-mail';
        translation['dqf.filter.lastLtrSentStart'] = 'Data de início de envio da última carta';
        translation['dqf.filter.lastLtrSentEnd'] = 'Data final de envio da última carta';
        translation['dqf.filter.evalDateStart'] = 'Data de início da avaliação';
        translation['dqf.filter.evalDateEnd'] = 'Data de término da avaliação';
        translation['dqf.filter.boolean.yes'] = 'Sim';
        translation['dqf.filter.boolean.no'] = 'Não';
        translation['dqf.sublist.send.title'] = 'Fila de envios de e-mail de cobrança';
        translation['dqf.sublist.print.title'] = 'Fila de impressão de PDF de cobrança';
        translation['dqf.sublist.common.customer'] = 'Cliente';
        translation['dqf.sublist.common.mark'] = 'Marcar';
        translation['dqf.sublist.common.view'] = 'Visualizar';
        translation['dqf.sublist.common.id'] = 'ID';
        translation['dqf.sublist.dp.applies_to'] = 'Aplica-se a';
        translation['dqf.sublist.common.dunning_procedure'] = 'Procedimento de cobrança';
        translation['dqf.sublist.common.dunning_level'] = 'Nível';
        translation['dqf.sublist.record.last_letter_sent'] = 'Última carta enviada';
        translation['dqf.sublist.record.dunning_allow_email'] = 'Permitir envio por e-mail';
        translation['dqf.sublist.record.dunning_allow_print'] = 'Permitir impressão';
        translation['dqf.sublist.record.pause_dunning'] = 'Pausar a cobrança';
        translation['dqf.sublist.common.evaluation_date'] = 'Data de avaliação';
        translation['dqf.sublist.common.related_entity'] = 'Destinatário';
        translation['dbu.form.title'] = 'Atualização em massa de registros de clientes para cobrança';
        translation['dbu.form.update_button'] = 'Atualizar';
        translation['dbu.form.field.subsidiary'] = 'Subsidiária';
        translation['dbu.form.flh.subsidiary'] = 'Selecione a subsidiária para a qual você deseja fazer a atualização em massa dos campos de cobrança nos registros de cliente. As atualizações serão aplicadas a todos os registros de cliente que pertençam à subsidiária selecionada.';
        translation['dbu.form.field.allow_email'] = 'Permitir que as cartas sejam enviadas por e-mail';
        translation['dbu.form.flh.allow_email'] = 'Selecione um valor a ser aplicado neste campo dos registros de cliente após executar a atualização em massa:\nNão alterado: o valor atual do campo não será alterado. \nMarcado: a caixa estará marcada nos registros de cliente após a atualização em massa. \nNão marcado: a caixa estará desmarcada após a atualização em massa.';
        translation['dbu.form.field.allow_print'] = 'Permitir que as cartas sejam impressas';
        translation['dbu.form.flh.allow_print'] = 'Selecione um valor a ser aplicado neste campo dos registros de cliente após executar a atualização em massa:\nNão alterado: o valor atual do campo não será alterado. \nMarcado: a caixa estará marcada nos registros de cliente após a atualização em massa. \nNão marcado: a caixa estará desmarcada após a atualização em massa.';
        translation['dbu.form.field.dont_send_cust_email'] = 'Não enviar cartas para o e-mail do cliente';
        translation['dbu.form.flh.dont_send_cust_email'] = 'Selecione um valor a ser aplicado neste campo dos registros de cliente após executar a atualização em massa:\nNão alterado: o valor atual do campo não será alterado. \nMarcado: a caixa estará marcada nos registros de cliente após a atualização em massa. \nNão marcado: a caixa estará desmarcada após a atualização em massa.';
        translation['dbu.form.primary_field_group'] = 'Critérios';
        translation['dbu.form.bulk_update_field_group'] = 'Campos de atualização em massa';
        translation['dbu.form.options.unchanged'] = '- Não alterado -';
        translation['dbu.form.options.checked'] = 'Marcado';
        translation['dbu.form.options.not_checked'] = 'Não marcado';
        translation['dbu.validation.no_selection'] = 'Não há campos para atualizar porque \'Não alterado\' está selecionado para todos os campos. Uma atualização em massa pode ser executada se pelo menos a alteração de um campo for especificada (marcado ou não marcado).';
        translation['dbu.validation.no_sending_media'] = 'Os registros de cliente não podem ser salvos se ambas as caixas \'Permitir que as cartas sejam enviadas por e-mail\' e \'Permitir que as cartas sejam impressas\' não estejam marcadas. Selecione Marcado em um ou ambos os campos seguintes:\n- Permitir que as cartas sejam enviadas por e-mail\n-Permitir que as cartas sejam impressas';
        translation['dbu.validation.verify_submit_ow'] = 'Todos os registros de cliente com procedimentos de cobrança serão atualizados para a subsidiária selecionada {SUBSIDIARY}. Você receberá uma mensagem de e-mail quando o processo estiver concluído. Tem certeza de que deseja prosseguir com a atualização em massa? Se você clicar em OK, o processo de atualização em massa será iniciado e não poderá ser desfeito.';
        translation['dbu.validation.verify_submit_si'] = 'Todos os registros de cliente com procedimentos de cobrança serão atualizados. Você receberá uma mensagem de e-mail quando o processo estiver concluído. Tem certeza de que deseja prosseguir com a atualização em massa? Se você clicar em OK, o processo de atualização em massa será iniciado e não poderá ser desfeito.';
        translation['dbu.form.reminderinlinehelp'] = 'O NetSuite recomenda que você utilize o recurso de atualização em massa fora do seu horário de funcionamento normal. Isso é para garantir que outros usuários em sua empresa não estejam atualizando os registros de cliente durante o processo de atualização em massa.';
        translation['dbu.validation.validate_concurrency_ow'] = 'Foi iniciada a atualização em massa dos registros de cliente para cobrança por {USER} para a subsidiária, {SUBSIDIARY}. A atualização em massa deve ser concluída antes que você possa executar outra atualização em massa de clientes para a mesma subsidiária.';
        translation['dbu.validation.validate_concurrency_si'] = 'O sistema pode executar somente uma atualização em massa por vez. Uma atualização em massa iniciada por {USER} está em execução.';
        translation['dbu.customer.message.complete_subject'] = 'Atualização em massa de registros de clientes para cobrança';
        translation['dbu.customer.message.complete_body_ow'] = [
          'Saudações do NetSuite.<br />',
          'A atualização em massa dos registros de cliente para cobrança foi concluído para a subsidiária, {SUBSIDIARY}.',
          'Permitir que as cartas sejam enviadas por e-mail = {ALLOW_EMAIL}',
          'Permitir que as cartas sejam impressas = {ALLOW_PRINT}',
          'Não enviar cartas para o e-mail do cliente = {DONT_SEND_TO_CUST}<br />',
          'Número de registros de cliente atualizados: {PROCESSED_RECORDS} de {RECORD_COUNT}.{ERROR_STEPS}',
          'Este é um e-mail gerado pelo sistema.<br />',
          'Obrigado,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.complete_body_si'] = [
          'Saudações do NetSuite.<br />',
          'A atualização em massa dos registros de cliente para cobrança foi concluído.',
          'Permitir que as cartas sejam enviadas por e-mail = {ALLOW_EMAIL}',
          'Permitir que as cartas sejam impressas = {ALLOW_PRINT}',
          'Não enviar cartas para o e-mail do cliente = {DONT_SEND_TO_CUST}<br />',
          'Número de registros de cliente atualizados: {PROCESSED_RECORDS} de {RECORD_COUNT}.{ERROR_STEPS}',
          'Este é um e-mail gerado pelo sistema.<br />',
          'Obrigado,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.error_file_header'] = 'ID do cliente, erro';
        translation['dbu.customer.message.error_filename'] = 'Failed Updates.csv';
        translation['dbu.customer.message.error_steps'] = '<br />Faça o download do arquivo em anexo para visualizar a lista de registros que não foram atualizados. Você pode atualizar esses registros manualmente.';
        translation['dc.validateCustomer.noDPMatched'] = 'Não foi encontrado nenhum procedimento de cobrança que corresponda ao registro do cliente.';
        translation['dc.validateCustomer.recipientNoEmail'] = 'Os seguintes destinatários de carta de cobrança não têm um endereço de e-mail em seus registros de contatos: {CONTACTNAMES}.';
        translation['dc.validateCustomer.customerNoEmail'] = 'O registro não pode ser salvo. A caixa Permitir que as cartas sejam enviadas por e-mail está marcada, mas não há endereço de e-mail ou destinatário de cobrança para o envio das cartas. Para salvar o registro as seguintes condições devem ser verdadeiras:\n- A sub-aba Destinatários de cobrança tem pelo menos um contato com endereço de e-mail.\n- O campo E-mail no registro do cliente possui um endereço de e-mail.\n\nObservação: O endereço de e-mail do cliente somente é obrigatório se a caixa Não enviar cartas para o e-mail do cliente estiver desmarcada.';
        translation['dc.validateCustomer.noEmailAtAll'] = 'Não há endereço de e-mail no registro do cliente e não há nenhum destinatário de carta de cobrança especificado para este cliente. Insira um endereço de e-mail no registro do cliente ou selecione pelo menos um destinatário da carta de cobrança que tenha um endereço de e-mail na sub-aba Cobrança.';
        translation['dc.validateCustomer.recipientListEmpty'] = 'O registro não pode ser salvo. A caixa Permitir que as cartas sejam enviadas por e-mail está marcada, mas não há destinatário de cobrança para o envio das cartas. Para salvar esse registro, a sub-aba Destinatários de cobrança deve ter pelo menos um contato com endereço de e-mail. \n\nObservação: O endereço de e-mail do cliente somente é obrigatório se a caixa Não enviar cartas para o e-mail do cliente estiver desmarcada.';
        translation['dc.validateCustomer.dpMatched'] = 'O registro do cliente corresponde ao procedimento de cobrança \'{DP}\'. Deseja alterar o procedimento de cobrança?';
        translation['dc.validateCustomer.dpAllReadyAssigned'] = 'O procedimento de cobrança encontrado é o mesmo já atribuído ao registro.';
        translation['dc.validateDP.managerRequired'] = 'É obrigatório um gerente de cobrança.';
        translation['dc.validateDP.sendingModeRequired'] = 'Pelo menos uma das caixas a seguir deve ser marcada:\n- Permitir que as cartas sejam enviadas por e-mail\n- Permitir que as cartas sejam impressas';
        translation['dl.validateDL.dlCountExceeded'] = 'Você ultrapassou o número máximo de níveis de cobrança possível.';
        translation['dl.validateDL.lowerDaysOverDue'] = 'O número de dias após o vencimento deve ser inferior a {DAYS}.';
        translation['dl.validateDL.higherDaysOverdue'] = 'O número de dias após o vencimento deve ser superior a {DAYS}.';
        translation['dl.validateDL.daysOverdueExist'] = 'O número de dias após o vencimento {DAYS} já está em outra linha.';
        translation['dl.validateDL.lastRecordDeletion'] = 'Somente o último registro da lista pode ser excluído.';
        translation['dl.validateDL.daysBetSending'] = 'Os dias entre as cartas enviadas deve ser maior ou igual a {DAYS}';
        translation['dl.validateDL.minOutsBalGEZero'] = 'O valor pendente mínimo deve ser de pelo menos zero (0).';
        translation['dl.validateDL.daysOverdueLessPrevious'] = 'Os dias após o vencimento no nível de cobrança {LEVEL} ({LEVEL_OVERDUE} dias) deve ser inferior ao do nível de cobrança {PREVLEVEL} ({PREVLEVEL_OVERDUE} dias).';
        translation['dl.validateDL.dlRequired'] = 'Pelo menos um nível de cobrança é exigido.';
        translation['dp.validateDP.editNotAllowed'] = 'Você não tem permissão para editar o tipo de procedimento de cobrança.';
        translation['dp.information.possibleMultipleSending'] = 'Desabilitar o campo Intervalo mínimo de cobrança permitirá que sua conta envie várias cartas de cobrança para um único cliente em um dia. Tem certeza de que deseja desabilitá-lo?';
        translation['dba.pagination.failedPrevPage'] = 'Falha ao ir para a página anterior.';
        translation['dq.validation.str_send'] = 'enviar';
        translation['dq.validation.str_remove'] = 'remover';
        translation['dq.validation.str_print'] = 'imprimir';
        translation['dq.validation.chooseAction'] = 'Escolha uma carta para ';
        translation['dq.validation.removalConfirmation'] = 'Tem certeza de que deseja excluir os registros selecionados da fila?';
        translation['dq.pt.dunningQueueTitle'] = 'Fila de cobrança';
        translation['dq.pt.source'] = 'Tipo de fonte';
        translation['dq.pt.dunningProcedure'] = 'Procedimento de cobrança';
        translation['dq.pt.dunningLevel'] = 'Nível de cobrança';
        translation['dq.pt.lastLetterSent'] = 'Última carta enviada';
        translation['dq.pt.emailingAllowed'] = 'Permitido o envio de e-mail';
        translation['dq.pt.printingAllowed'] = 'Permitida a impressão';
        translation['dq.pt.send'] = 'Enviar';
        translation['dq.pt.remove'] = 'Remover';
        translation['dq.pt.print'] = 'Imprimir';
        translation['dq.pt.customer'] = 'Cliente';
        translation['dt.validator.invalidDefault'] = 'Deve existir um modelo padrão selecionado para cada um dos tipos de modelo de cobrança. Revise as sub-abas E-mail e PDF e selecione um modelo padrão.';
        translation['dt.validator.duplicateLanguage'] = 'Este idioma já é utilizado por este tipo de modelo.';
        translation['dt.validator.noTemplateDocs'] = 'Para salvar este registro, deve existir pelo menos um documento de modelo de e-mail e um documento de modelo de PDF.';
        translation['dt.validator.subject'] = 'Falha na validação do documento do modelo de cobrança';
        translation['dt.validator.body'] = 'Os documentos de modelo a seguir são inválidos:';
        translation['dt.validator.defaultDeletion'] = 'Você está tentando excluir um modelo que atualmente está definido como padrão. Para excluir este modelo, você deve primeiro escolher um modelo diferente como seu modelo padrão.';
        translation['dt.validator.xmlEmailDeprecated'] = 'Você não pode adicionar, editar ou remover linhas de modelo de e-mail XML. O uso de modelos de e-mail de cobrança baseados em XML está sendo removido. Se você adicionar modelos de e-mail na sub-aba Modelo de e-mail de cobrança, salvar esse registro excluirá todas as linhas na sub-aba Modelo de e-mail de cobrança XML.';
        translation['dt.validator.deleteAllXMLLines'] = 'Salvar esse registro excluirá todas as linhas na sub-aba Modelo de e-mail de cobrança XML. ';
        translation['dt.validator.noEMailDocs'] = 'Deve existir pelo menos um modelo de e-mail para salvar este registro.';
        translation['dt.validator.noPDFDocs'] = 'Deve existir pelo menos um modelo de PDF para salvar este registro.';
        translation['dt.validator.multipleDefault'] = 'Tem certeza de que deseja utilizar este modelo como o padrão?';
        translation['dlr.validateDLR.noAmount'] = 'A regra de nível de cobrança deve ter pelo menos um valor de regra de nível de cobrança.';
        translation['dlr.validateDLR.noDefaultAmount'] = 'A regra de nível de cobrança deve ter pelo menos um valor de regra de nível de cobrança definido como o valor padrão.';
        translation['dlr.validateDLR.duplicateCurrency'] = 'A moeda deve ser exclusiva.';
        translation['dlr.validateDLR.invalidAmount'] = 'O valor deve ser maior que ou igual a 0 (zero).';
        translation['dlr.validateDLR.changeDefaultCurrency'] = 'Tem certeza de que deseja utilizar a moeda e o valor desta linha como padrão? (Isso alterará o padrão atual de valor e moeda)';
        translation['dlr.validateDLR.negativeDaysOverdue'] = 'O campo Dias após o vencimento contém um número negativo. Isso enviar uma carta para o cliente antes que o pagamento seja devido.';
        translation['dlr.validateDLR.daysOverdueChanged'] = 'Mudar o valor de Dias em débito em uma regra de nível de cobrança pode alterar a ordem dos níveis, o que, por sua vez, pode acionar o envio de cartas de cobrança inadequadas.\n\n É recomendável verificar a ordem dos níveis de cobrança em cada procedimento ({DP_LIST}) no qual o nível que você deseja mudar está em uso.';
        translation['dlr.validateDLR.cannotAddCurrency'] = 'A moeda não pode ser adicionada porque o recurso Moedas múltiplas não está habilitado.';
        translation['der.flh.dunningProcedure'] = 'Este campo indica o procedimento de cobrança atribuído à fatura ou ao cliente.';
        translation['der.flh.dunningLevel'] = 'Este campo indica o nível de cobrança atual, após a avaliação.';
        translation['der.flh.relatedEntity'] = 'Este campo está vinculado ao registro da entidade ou do contato do destinatário da cobrança.';
        translation['der.flh.messageContent'] = 'Este campo contém o conteúdo da carta de cobrança.';
        translation['der.flh.invoiceList'] = 'Este campo lista as faturas associadas à carta de cobrança. ';
        translation['der.flh.emailRecipient'] = 'Este campo exibe os endereços de e-mail dos destinatários da carta de cobrança.';
        translation['der.flh.subject'] = 'Este campo exibe a linha de assunto da carta de cobrança.';
        translation['der.flh.dunningManager'] = 'Este campo exibe o gerente de cobrança atribuído ao cliente e está vinculado ao registro de funcionário do gerente de cobrança.';
        translation['der.flh.dunningTemplate'] = 'Este campo está vinculado ao registro do modelo de cobrança.';
        translation['der.flh.customer'] = 'Este campo está vinculado ao registro do cliente.';
        translation['der.flh.status'] = 'Este campo indica se o e-mail foi enviado com sucesso ou não. O status pode ser um dos seguintes:\n\n• Enviado: o e-mail foi enviado com sucesso.\n• Falhou: o sistema falhou ao enviar o e-mail devido à ausência de informações. Um exemplo disso é quando não há endereço de e-mail para o cliente ou o contato.\n• Na fila: a carta de cobrança ainda está na fila de cobrança e ainda não foi processada.\n• Removido: o gerente de cobrança removeu este registro da fila de cobrança.';
        translation['dlr.flh.daysOverdue'] = 'Insira o número de dias após a data de vencimento do pagamento quando uma carta de cobrança deve ser enviada. Para enviar uma carta antes da data de vencimento, informe um número negativo.';
        translation['ds.flh.description'] = 'Insira uma descrição para este registro.';
        translation['dp.flh.dunningProcedure'] = 'Insira um nome para este procedimento de cobrança.';
        translation['dp.flh.description'] = 'Insira uma descrição para este procedimento de cobrança.';
        translation['dp.flh.appliesTo'] = 'Selecione se este procedimento de cobrança será atribuído a clientes ou faturas. Se você selecionar Cliente, é necessário marcar ou desmarcar a caixa Permitir edição manual. ';
        translation['dp.flh.sendingSchedule'] = 'Selecione se as cartas de cobrança serão enviadas de forma automática ou manual.';
        translation['dp.flh.minimumDunningInterval'] = 'Selecione o número de dias mínimo para enviar duas cartas consecutivas ao mesmo cliente. Isso se aplica aos envios automático e manual.';
        translation['dp.flh.subsidiary'] = 'Selecione as subsidiárias às quais este procedimento de cobrança se aplica.';
        translation['dp.flh.savedSearchCustomer'] = 'Selecione a busca salva de cliente à qual este procedimento se aplica.';
        translation['dp.flh.allowOverride'] = 'Se você marcar esta caixa, um procedimento de cobrança ao nível de faturas pode sobrescrever esse procedimento. Um procedimento de cobrança ao nível de fatura será usado se uma fatura atender aos critérios para este procedimento, independentemente do procedimento de cobrança ao nível do cliente já ter sido atribuído.';
        translation['dp.flh.department'] = 'Selecione o departamento ao qual este procedimento se aplica. ';
        translation['dp.flh.class'] = 'Selecione os centros de custo aos quais esse procedimento se aplica.';
        translation['dp.flh.location'] = 'Selecione as localidades às quais esse procedimento se aplica.';
        translation['dp.flh.savedSearchInvoice'] = 'Selecione a busca salva de fatura à qual este procedimento se aplica.';
        translation['dp.flh.assignAutomatically'] = 'Marque esta caixa para fazer com que o sistema atribua automaticamente este procedimento de cobrança a clientes ou faturas de acordo com os critérios de seleção.';
        translation['dt.flh.name'] = 'Insira um nome para este modelo de cobrança.';
        translation['dt.flh.description'] = 'Insira uma descrição para este modelo de cobrança.';
        translation['dt.flh.attachStatement'] = 'Marque esta caixa se desejar anexar extratos de cliente às cartas de cobrança que usam este modelo. ';
        translation['dt.flh.attachInvoiceCopy'] = 'Marque esta caixa para anexar faturas às cartas de cobrança que usam este modelo.';
        translation['dt.flh.overdueInvoiceOnly'] = 'Marque esta caixa se desejar anexar somente faturas vencidas.';
        translation['dt.flh.openTransactionOnly'] = 'Marque esta caixa se desejar incluir apenas as transações em aberto nos extratos do cliente.';
        translation['dt.flh.inactive'] = 'Marque esta caixa para desativar o modelo. Modelos inativos não são exibidos em listas e não podem ser utilizados para o envio de cartas de cobrança.';
        translation['dc.flh.allowEmail'] = 'Marque esta caixa se deseja que as cartas de cobrança sejam enviadas por e-mail.';
        translation['dc.flh.lastLetterSent'] = 'Data em que a última carta de cobrança foi enviada.';
        translation['dc.flh.dunningLevel'] = 'Este campo mostra o nível de cobrança atual a partir da avaliação da última cobrança.';
        translation['dc.flh.dunningManager'] = 'Selecione a pessoa responsável pela cobrança deste cliente, cujo nome deve aparecer como o remetente da carta de cobrança.';
        translation['dc.flh.dunningProcedure'] = 'Este campo mostra o procedimento de cobrança atribuído ao cliente. Se você clicar em \'Atribuir automaticamente\', o sistema atribui o procedimento apropriado com base nos critérios de seleção de cobrança. Selecione outro valor na lista suspensa para alterar o procedimento de cobrança atribuído ao cliente. A lista suspensa mostra apenas os procedimentos de cobrança que são aplicáveis a este cliente, com base nos critérios de seleção definidos nos registros de procedimentos de cobrança. ';
        translation['dc.flh.allowPrint'] = 'Marque esta caixa se deseja que as cartas de cobrança sejam impressas.';
        translation['dc.flh.pauseReason'] = 'Selecione um motivo para indicar por que a cobrança foi pausada.';
        translation['dc.flh.pauseReasonDetail'] = 'Selecione um detalhe para indicar por que a cobrança foi pausada.';
        translation['dc.flh.pauseDunning'] = 'Marque esta caixa para interromper temporariamente o processo de cobrança.';
        translation['dc.flh.dunningRecepients'] = 'Selecione destinatários adicionais para a cobrança';
        translation['dc.flh.allowEmail'] = 'Marque esta caixa se deseja que as cartas de cobrança sejam enviadas por e-mail.';
        translation['di.flh.lastLetterSent'] = 'Data em que a última carta de cobrança foi enviada.';
        translation['di.flh.dunningLevel'] = 'Este campo mostra o nível de cobrança atual a partir da avaliação da última cobrança.';
        translation['di.flh.dunningManager'] = 'Selecione a pessoa responsável por essa cobrança de faturas, cujo nome deve aparecer como o remetente da carta de cobrança.';
        translation['di.flh.dunningProcedure'] = 'Este campo mostra o procedimento de cobrança atribuído à fatura. Se você clicar em \'Atribuir automaticamente\', o sistema atribui o procedimento apropriado com base nos critérios de seleção de cobrança. Selecione outro valor na lista suspensa para alterar o procedimento de cobrança atribuído à fatura. A lista suspensa mostra apenas os procedimentos de cobrança que são aplicáveis a esta fatura, com base nos critérios de seleção definidos nos registros de procedimentos de cobrança. ';
        translation['di.flh.allowPrint'] = 'Marque esta caixa se deseja que as cartas de cobrança sejam impressas.';
        translation['di.flh.pauseReason'] = 'Selecione um motivo para indicar por que a cobrança foi pausada.';
        translation['di.flh.pauseReasonDetail'] = 'Selecione um detalhe de motivo para indicar por que a cobrança foi pausada.';
        translation['di.flh.pauseDunning'] = 'Marque esta caixa para interromper temporariamente o processo de cobrança.';
        translation['dp.validate.unpause'] = 'Desmarcar a caixa Pausar cobrança irá acionar imediatamente o fluxo de trabalho de avaliação de cobrança. O NetSuite pode enviar uma carta de cobrança para este cliente, dependendo do resultado da avaliação de cobrança. Tem certeza de que deseja retomar a cobrança?';
        translation['dc.validateSubsidiary.existingConfigSubsidiary'] = 'Já existe um registro de configuração de cobrança para esta subsidiária.';
        translation['l10n.address.invalidPOBox'] = 'Informe um número válido de caixa postal.';
        translation['l10n.address.invalidZipCode'] = 'Informe um CEP válido.';
        translation['l10n.address.invalidRuralRoute'] = 'Informe um valor de Rota rural válido.';
        translation['l10n.accessForDDandAccountant'] = 'Somente as funções administrador, diretor de cobrança e contador podem criar e modificar este tipo de registro.';
        translation['l10n.deleteAccessForDDandAccountant'] = 'Somente as funções administrador, diretor de cobrança e contador podem excluir este tipo de registro.';
        translation['l10n.accessForAdministrator'] = 'Somente a função administrador pode criar e modificar este tipo de registro.';
        translation['l10n.deleteAccessForAdministrator'] = 'Somente a função administrador pode excluir este tipo de registro.';
        translation['l10n.noPagePrivilege'] = 'Você não tem privilégios para visualizar esta página.';
        translation['dq.pdfemail.folderName'] = 'Cartas de cobrança em PDF para impressão';
        translation['dq.pdfemail.subject'] = 'As cartas de cobrança geradas em PDF estão disponíveis para impressão no Arquivo.';
        translation['dq.pdfemail.link'] = 'Clique no link para visualizar a pasta das cartas em PDF:';
        translation['dq.pdfemail.tableHead'] = 'A tabela a seguir fornece detalhes das pastas onde os arquivos PDF estão armazenados.';
        translation['dq.pdfemail.exceedLimit'] = 'Não foi possível anexar os arquivos gerados por excederem o limite de anexos.';
        translation['dq.pdfemail.tableLabel1'] = 'Pastas';
        translation['dq.pdfemail.tableLabel2'] = 'Caminho';
        translation['dq.pdfemail.tableLabel3'] = 'Status';
        translation['dq.pdfemail.tableLabel4'] = 'Notas';

        break;

      case 'ru_RU':
      case 'ru-RU':
        translation['dsa.response.none_found'] = 'Нет доступных процедур напоминания.';
        translation['form.dunning_template.title'] = 'Шаблон напоминания';
        translation['field.template.name'] = 'Название';
        translation['field.template.description'] = 'Описание';
        translation['field.template.attachStatement'] = 'Прикрепить выписку';
        translation['field.template.overdue_invoices_stmt'] = 'Только просроченные исходящие счета в выписке';
        translation['field.template.inactive'] = 'Неактивно';
        translation['field.template.attach_invoice_copy'] = 'Прикрепить копии исходящих счетов';
        translation['field.template.only_overdue_invoices'] = 'Только просроченные исходящие счета';
        translation['field.template.subject'] = 'Тема';
        translation['selection.template.savedsearch'] = 'Сохраненный поиск';
        translation['selection.template.searchcolumn'] = 'Столбец поиска';
        translation['label.template.lettertext'] = 'Текст письма';
        translation['dba.form.title'] = 'Массовое назначение напоминания';
        translation['dba.form.source'] = 'Применено к';
        translation['dba.form.procedure'] = 'Процедура напоминания';
        translation['dba.form.source.help'] = 'Применено к';
        translation['dba.form.procedure.help'] = 'Процедура напоминания';
        translation['dba.form.dunning_manager'] = 'Менеджер напоминаний';
        translation['dba.form.dunning_manager.help'] = 'Менеджер напоминаний';
        translation['dba.tab.invoice'] = 'Исходящие счета';
        translation['dba.sublist.invoice'] = 'Исходящие счета';
        translation['dba.tab.customer'] = 'Клиенты';
        translation['dba.sublist.customer'] = 'Клиенты';
        translation['dba.sublist.common.id'] = 'Идентификатор';
        translation['dba.sublist.common.customer'] = 'Клиент';
        translation['dba.sublist.invoice.invoice'] = 'Исх. счет';
        translation['dba.sublist.invoice.amount'] = 'Сумма';
        translation['dba.sublist.invoice.currency'] = 'Валюта';
        translation['dba.sublist.invoice.duedate'] = 'Срок';
        translation['dba.sublist.invoice.days_overdue'] = 'Количество дней просрочки';
        translation['dba.sublist.customer.subsidiary'] = 'Дочерняя компания';
        translation['dba.sublist.common.assign_dunning'] = 'Назначить';
        translation['dba.sublist.common.dunning_procedure'] = 'Процедура напоминания';
        translation['dba.sublist.common.dunning_level'] = 'Уровень напоминания';
        translation['dba.sublist.common.last_letter_sent'] = 'Дата отправки последнего письма';
        translation['dba.sublist.common.dunning_sending_type'] = 'Тип отправки';
        translation['dba.sublist.common.page_next'] = '>';
        translation['dba.sublist.common.page_previous'] = '<';
        translation['dba.sublist.common.page_option'] = '{startIndex} - {endIndex} из {totalEntryCount}';
        translation['dba.form.restriction'] = 'Критерии выбора';
        translation['dba.form.selection'] = 'Выбор процедуры напоминания';
        translation['dba.form.restriction.subsidiary'] = 'Дочерние организации';
        translation['dba.form.restriction.location'] = 'Местоположения';
        translation['dba.form.restriction.dept'] = 'Отделы';
        translation['dba.form.restriction.class'] = 'Классы';
        translation['dba.form.restriction.search'] = 'Сохраненный поиск';
        translation['dba.form.action.assign'] = 'Назначить';
        translation['dba.form.action.assign_customer'] = 'Назначить клиентам';
        translation['dba.form.action.assign_invoice'] = 'Назначить исходящим счетам';
        translation['dba.form.action.cancel'] = 'Отмена';
        translation['dba.form.notification.highnumberofrecord'] = 'Для выполнения этого запроса может потребоваться несколько секунд. Дождитесь переадресации на страницу «Процедура напоминания».';
        translation['dqf.form.action.send'] = 'Отправить';
        translation['dqf.form.action.print'] = 'Печать';
        translation['dqf.form.action.remove'] = 'Удалить';
        translation['dqf.form.send.title'] = 'Очередь отправки эл. сообщений с напоминаниями';
        translation['dqf.form.print.title'] = 'Очередь на печать напоминаний в формате PDF';
        translation['dqf.filter.fieldGroup'] = 'Фильтры';
        translation['dqf.filter.inlineHelp'] = 'Используйте фильтры для более конкретного поиска или сужения количества результатов для отображения.';
        translation['dqf.filter.applyFiltersButton'] = 'Поиск';
        translation['dqf.filter.customer'] = 'Клиент';
        translation['dqf.filter.recipient'] = 'Адресат';
        translation['dqf.filter.procedure'] = 'Процедура напоминания';
        translation['dqf.filter.dpLevel'] = 'Уровень напоминания';
        translation['dqf.filter.appliesTo'] = 'Применено к';
        translation['dqf.filter.allowPrint'] = 'Разрешить печать';
        translation['dqf.filter.allowEmail'] = 'Разрешить эл. почту';
        translation['dqf.filter.lastLtrSentStart'] = 'Дата начала отправки последнего письма';
        translation['dqf.filter.lastLtrSentEnd'] = 'Дата окончания отправки последнего письма';
        translation['dqf.filter.evalDateStart'] = 'Дата начала оценки';
        translation['dqf.filter.evalDateEnd'] = 'Дата окончания оценки';
        translation['dqf.filter.boolean.yes'] = 'Да';
        translation['dqf.filter.boolean.no'] = 'Нет';
        translation['dqf.sublist.send.title'] = 'Очередь отправки эл. сообщений с напоминаниями';
        translation['dqf.sublist.print.title'] = 'Очередь на печать напоминаний в формате PDF';
        translation['dqf.sublist.common.customer'] = 'Клиент';
        translation['dqf.sublist.common.mark'] = 'Отметка';
        translation['dqf.sublist.common.view'] = 'Просмотр';
        translation['dqf.sublist.common.id'] = 'Идентификатор';
        translation['dqf.sublist.dp.applies_to'] = 'Применено к';
        translation['dqf.sublist.common.dunning_procedure'] = 'Процедура напоминания';
        translation['dqf.sublist.common.dunning_level'] = 'Уровень';
        translation['dqf.sublist.record.last_letter_sent'] = 'Последнее отправленное письмо';
        translation['dqf.sublist.record.dunning_allow_email'] = 'Разрешить эл. почту';
        translation['dqf.sublist.record.dunning_allow_print'] = 'Разрешить печать';
        translation['dqf.sublist.record.pause_dunning'] = 'Приостановить напоминания';
        translation['dqf.sublist.common.evaluation_date'] = 'Дата оценки';
        translation['dqf.sublist.common.related_entity'] = 'Адресат';
        translation['dbu.form.title'] = 'Массовое обновление записей клиентов для напоминаний';
        translation['dbu.form.update_button'] = 'Обновление';
        translation['dbu.form.field.subsidiary'] = 'Дочерняя компания';
        translation['dbu.form.flh.subsidiary'] = 'Выберите дочернюю компанию, для которой необходимо выполнить массовое обновление полей напоминаний в записях клиента. Обновления будут применены ко всем записям клиента, относящимся к выбранной дочерней компании.';
        translation['dbu.form.field.allow_email'] = 'Разрешить отправление писем по эл. почте';
        translation['dbu.form.flh.allow_email'] = 'Выберите значение, которое будет применено в данном поле пользовательских записей после выполнения массового обновления:\nНе изменено – Текущее значение поля останется без изменения. \nОтмечено – Поле будет отмечено в пользовательских записях после массового обновления. \nНе отмечено – Поле будет пустым после массового обновления.';
        translation['dbu.form.field.allow_print'] = 'Разрешить распечатку писем';
        translation['dbu.form.flh.allow_print'] = 'Выберите значение, которое будет применено в данном поле пользовательских записей после выполнения массового обновления:\nНе изменено – Текущее значение поля останется без изменения. \nОтмечено – Поле будет отмечено в пользовательских записях после массового обновления. \nНе отмечено – Поле будет пустым после массового обновления.';
        translation['dbu.form.field.dont_send_cust_email'] = 'Не отправлять письма на адрес эл. почты клиента';
        translation['dbu.form.flh.dont_send_cust_email'] = 'Выберите значение, которое будет применено в данном поле пользовательских записей после выполнения массового обновления:\nНе изменено – Текущее значение поля останется без изменения. \nОтмечено – Поле будет отмечено в пользовательских записях после массового обновления. \nНе отмечено – Поле будет пустым после массового обновления.';
        translation['dbu.form.primary_field_group'] = 'Критерии';
        translation['dbu.form.bulk_update_field_group'] = 'Поля массового обновления';
        translation['dbu.form.options.unchanged'] = '- Не изменено -';
        translation['dbu.form.options.checked'] = 'Отмечено';
        translation['dbu.form.options.not_checked'] = 'Не отмечено';
        translation['dbu.validation.no_selection'] = 'Нет полей для обновления, потому что для всех полей выбрано значение «Не изменено». Массовое обновление можно выполнить, если указано изменение по крайней мере в одном поле («Отмечено» или «Не отмечено»).';
        translation['dbu.validation.no_sending_media'] = 'Пользовательские записи нельзя сохранить, если не отмечены оба поля, «Разрешить отправление писем по эл. почте» и «Разрешить распечатку писем». Выберите «Отмечено» в одном или обоих полях: \n- Разрешить отправку писем по эл. почте \n- Разрешить распечатку писем';
        translation['dbu.validation.verify_submit_ow'] = 'Все записи клиентов с процедурами напоминания будут обновлены для выбранной дочерней компании {SUBSIDIARY}. Вы получите электронное сообщение с уведомлением о завершении процесса. Продолжить массовое обновление? Если вы нажмете ОК, начнется процесс массового обновления, который нельзя отменить.';
        translation['dbu.validation.verify_submit_si'] = 'Все записи клиентов с процедурами напоминания будут обновлены. Вы получите электронное сообщение с уведомлением о завершении процесса. Продолжить массовое обновление? Если вы нажмете ОК, начнется процесс массового обновления, который нельзя отменить.';
        translation['dbu.form.reminderinlinehelp'] = 'NetSuite рекомендует использовать функцию массового обновления в нерабочие часы. Таким образом другие пользователи в вашей компании не будут обновлять пользовательские записи во время процесса массового обновления.';
        translation['dbu.validation.validate_concurrency_ow'] = 'Массовое обновление записей клиентов для напоминаний было запущено {USER} для дочерней компании, {SUBSIDIARY}. Массовое обновление должно завершиться, прежде чем вы сможете выполнить другое массовое обновление клиентов для той же дочерней компании.';
        translation['dbu.validation.validate_concurrency_si'] = 'Система может выполнять только одно массовое обновление за один раз. В настоящее время выполняется массовое обновление, запущенное  {USER}.';
        translation['dbu.customer.message.complete_subject'] = 'Массовое обновление записей клиентов для напоминаний';
        translation['dbu.customer.message.complete_body_ow'] = [
          'Вас приветствует NetSuite.<br />',
          'Массовое обновление записей клиентов для напоминаний для дочерней компании {SUBSIDIARY} завершено.',
          'Разрешить отправление писем по эл. почте = {ALLOW_EMAIL}',
          'Разрешить распечатку писем = {ALLOW_PRINT}',
          'Не отправлять письма на адрес эл. почты клиента = {DONT_SEND_TO_CUST}<br />',
          'Количество обновленных записей клиента: {PROCESSED_RECORDS} из {RECORD_COUNT}.{ERROR_STEPS}',
          'Это эл. сообщение сгенерировано системой.<br />',
          'Спасибо,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.complete_body_si'] = [
          'Вас приветствует NetSuite.<br />',
          'Массовое обновление записей клиентов для напоминаний завершено.',
          'Разрешить отправление писем по эл. почте = {ALLOW_EMAIL}',
          'Разрешить распечатку писем = {ALLOW_PRINT}',
          'Не отправлять письма на адрес эл. почты клиента = {DONT_SEND_TO_CUST}<br />',
          'Количество обновленных записей клиента: {PROCESSED_RECORDS} из {RECORD_COUNT}.{ERROR_STEPS}',
          'Это эл. сообщение сгенерировано системой.<br />',
          'Спасибо,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.error_file_header'] = 'Идентификатор клиента, Ошибка';
        translation['dbu.customer.message.error_filename'] = 'Сбой при обновлении.csv';
        translation['dbu.customer.message.error_steps'] = '<br />Загрузите приложенный файл для просмотра списка записей, которые не были обновлены. Вы можете обновить эти записи вручную.';
        translation['dc.validateCustomer.noDPMatched'] = 'Не найдена процедура напоминания, соответствующая пользовательской записи.';
        translation['dc.validateCustomer.recipientNoEmail'] = 'У следующих получателей письма с напоминанием в контактных записях нет адреса эл. почты: {CONTACTNAMES}.';
        translation['dc.validateCustomer.customerNoEmail'] = 'Запись невозможно сохранить. Поле «Разрешить отправление писем по эл. почте» отмечено, но не указан адрес эл. почты или получатель напоминания, которому требуется отправить письмо. Чтобы сохранить эту запись, должны выполняться следующие условия:\n- На вложенной вкладке «Получатели напоминаний» должно быть указано по крайней мере одно контактное лицо с адресом эл. почты.\n- В поле «Эл. почта» в записи клиента должен быть указан адрес эл. почты.\n\nПримечание: Адрес эл. почты клиента требуется только в том случае, если отмечено поле «Не отправлять письма на адрес эл. почты клиента».';
        translation['dc.validateCustomer.noEmailAtAll'] = 'В записи клиента не указан адрес эл. почты и для данного клиента не указано ни одного получателя напоминаний. Введите адрес эл. почты в записи клиента или выберите на вложенной вкладке «Напоминания» по крайней мере одного получателя письма с напоминанием с адресом эл. почты.';
        translation['dc.validateCustomer.recipientListEmpty'] = 'Запись невозможно сохранить. Поле «Разрешить отправление писем по эл. почте» отмечено, но нет получателя напоминания, которому требуется отправить письмо. Чтобы сохранить эту запись, на вложенной вкладке «Получатели напоминаний», должно быть указано по крайней мере одно контактное лицо с адресом эл. почты. \n\nПримечание: Адрес эл. почты клиента требуется только в том случае, если отмечено поле «Не отправлять письма на адрес эл. почты клиента».';
        translation['dc.validateCustomer.dpMatched'] = 'Пользовательская запись соответствует процедуре напоминания \'{DP}\'. Изменить процедуру напоминания?';
        translation['dc.validateCustomer.dpAllReadyAssigned'] = 'Найденная процедура напоминания является той же самой, уже назначенной процедурой напоминания в записи.';
        translation['dc.validateDP.managerRequired'] = 'Требуется менеджер напоминаний.';
        translation['dc.validateDP.sendingModeRequired'] = 'Необходимо отметить по крайней мере одно из полей: \n- Разрешить отправку писем по эл. почте \n- Разрешить распечатку писем';
        translation['dl.validateDL.dlCountExceeded'] = 'Вы превысили максимально допустимое количество уровней напоминания.';
        translation['dl.validateDL.lowerDaysOverDue'] = 'Количество дней просрочки должно быть меньше чем {DAYS}.';
        translation['dl.validateDL.higherDaysOverdue'] = 'Количество дней просрочки должно быть больше чем {DAYS}.';
        translation['dl.validateDL.daysOverdueExist'] = 'Количество дней просрочки {DAYS} уже указано в другой строке.';
        translation['dl.validateDL.lastRecordDeletion'] = 'Вы можете удалить только последнюю запись в списке.';
        translation['dl.validateDL.daysBetSending'] = 'Количество дней между отправкой писем должно быть больше или равно {DAYS}';
        translation['dl.validateDL.minOutsBalGEZero'] = 'Минимальная неуплаченная сумма должна быть по меньшей мере нулем (0).';
        translation['dl.validateDL.daysOverdueLessPrevious'] = 'Количество дней просрочки в уровне напоминаний {LEVEL} ({LEVEL_OVERDUE} дней) должно быть меньше, чем в уровне напоминаний {PREVLEVEL} ({PREVLEVEL_OVERDUE} дн.).';
        translation['dl.validateDL.dlRequired'] = 'Требуется по крайней мере один уровень напоминаний.';
        translation['dp.validateDP.editNotAllowed'] = 'Вы не можете редактировать тип процедуры напоминания.';
        translation['dp.information.possibleMultipleSending'] = 'Отключение поля «Минимальный интервал напоминаний» позволит вашей учетной записи отправлять несколько писем с напоминаниями одному клиенту в течение дня. Отключить его?';
        translation['dba.pagination.failedPrevPage'] = 'Ошибка при возвращении на предыдущую страницу.';
        translation['dq.validation.str_send'] = 'отправить';
        translation['dq.validation.str_remove'] = 'удалить';
        translation['dq.validation.str_print'] = 'печать';
        translation['dq.validation.chooseAction'] = 'Выберите письмо для';
        translation['dq.validation.removalConfirmation'] = 'Удалить выбранные записи из очереди?';
        translation['dq.pt.dunningQueueTitle'] = 'Очередь напоминаний';
        translation['dq.pt.source'] = 'Исходный тип';
        translation['dq.pt.dunningProcedure'] = 'Процедура напоминания';
        translation['dq.pt.dunningLevel'] = 'Уровень напоминания';
        translation['dq.pt.lastLetterSent'] = 'Последнее отправленное письмо';
        translation['dq.pt.emailingAllowed'] = 'Разрешена отправка по эл. почте';
        translation['dq.pt.printingAllowed'] = 'Разрешена печать';
        translation['dq.pt.send'] = 'Отправить';
        translation['dq.pt.remove'] = 'Удалить';
        translation['dq.pt.print'] = 'Печать';
        translation['dq.pt.customer'] = 'Клиент';
        translation['dt.validator.invalidDefault'] = 'Необходимо выбрать один шаблон по умолчанию для каждого типа шаблона напоминания. Просмотрите вложенные вкладки эл. почты и PDF и выберите шаблон по умолчанию.';
        translation['dt.validator.duplicateLanguage'] = 'Этот язык уже используется для этого типа шаблона.';
        translation['dt.validator.noTemplateDocs'] = 'Для сохранения этой записи требуется по крайней мере один документ шаблона эл. почты и один документ шаблона PDF.';
        translation['dt.validator.subject'] = 'Ошибка проверки документа шаблона уведомления';
        translation['dt.validator.body'] = 'Следующие документы шаблона являются недействительными:';
        translation['dt.validator.defaultDeletion'] = 'Вы пытаетесь удалить шаблон, который в настоящее время установлен как шаблон по умолчанию. Чтобы удалить этот шаблон, следует сначала выбрать другой шаблон в качестве шаблона по умолчанию.';
        translation['dt.validator.xmlEmailDeprecated'] = 'Нельзя добавлять, исправлять или удалять строки шаблона эл. сообщения на языке XML. Использование шаблонов эл. сообщений с напоминаниями постепенно прекращается. Если вы добавите шаблоны эл. сообщений во вложенную вкладку «Шаблон эл. сообщения с напоминанием», сохранение этой записи приведет к удалению всех строк во вложенной вкладке «Шаблон эл. сообщения с напоминанием на языке XML».';
        translation['dt.validator.deleteAllXMLLines'] = 'Сохранение этой записи удалит все строки на вложенной вкладке «Шаблон эл. сообщения с напоминанием на языке XML». ';
        translation['dt.validator.noEMailDocs'] = 'Требуется по крайней мере один шаблон эл. сообщения для сохранения этой записи.';
        translation['dt.validator.noPDFDocs'] = 'Требуется по крайней мере один шаблон PDF для сохранения этой записи.';
        translation['dt.validator.multipleDefault'] = 'Использовать этот шаблон по умолчанию?';
        translation['dlr.validateDLR.noAmount'] = 'В правиле для уровня напоминания должна быть по крайней мере одна сумма правила для уровня напоминания';
        translation['dlr.validateDLR.noDefaultAmount'] = 'В правиле для уровня напоминания должна быть по крайней мере одна сумма правила для уровня напоминания, установленная в качестве суммы по умолчанию.';
        translation['dlr.validateDLR.duplicateCurrency'] = 'Валюта должна быть уникальной.';
        translation['dlr.validateDLR.invalidAmount'] = 'Сумма должна быть больше или равна 0.';
        translation['dlr.validateDLR.changeDefaultCurrency'] = 'Использовать валюту и сумму этой строки как значение по умолчанию? (Это изменит текущую сумму и валюту по умолчанию)';
        translation['dlr.validateDLR.negativeDaysOverdue'] = 'Поле «Количество дней просрочки» содержит отрицательное число. Это отправит письмо клиенту до срока платежа.';
        translation['dlr.validateDLR.daysOverdueChanged'] = 'Изменение значения «Дни просрочки» в правиле уровня напоминания может привести к изменению последовательности или порядка уровней напоминания, что, в свою очередь, может привести к ошибочной отправке писем с напоминаниями.\n\n Рекомендуется проверять порядок уровней напоминания для каждой процедуры напоминания ({DP_LIST}), где используется уровень напоминания, который вы хотите изменить.';
        translation['dlr.validateDLR.cannotAddCurrency'] = 'Невозможно добавить валюту, потому что не включена функция «Множество валют».';
        translation['der.flh.dunningProcedure'] = 'В этом поле указано, назначена ли процедура напоминания исходящим счетам или клиентам.';
        translation['der.flh.dunningLevel'] = 'В этом поле указан текущий уровень напоминания после оценки.';
        translation['der.flh.relatedEntity'] = 'Это поле связано с объектом или записью контакта получателя напоминаний.';
        translation['der.flh.messageContent'] = 'Это поле содержит контент письма с напоминанием.';
        translation['der.flh.invoiceList'] = 'В этом поле перечислены исходящие счета, связанные с письмом с напоминанием. ';
        translation['der.flh.emailRecipient'] = 'В этом поле отображены адреса эл. почты получателей писем с напоминаниями.';
        translation['der.flh.subject'] = 'В этом поле отображена строка темы письма с напоминанием.';
        translation['der.flh.dunningManager'] = 'В этом поле указан менеджер напоминаний, назначенный клиенту, и оно связано с записью сотрудника менеджера напоминаний.';
        translation['der.flh.dunningTemplate'] = 'Это поле связано с записью шаблона напоминаний.';
        translation['der.flh.customer'] = 'Это поле связано с пользовательской записью.';
        translation['der.flh.status'] = 'Это поле указывает, что ваше электронное письмо отправлено успешно или нет. Статус может принимать одно из следующих значений:\n\n•Отправлено - Эл. сообщение было отправлено успешно.\n•Неудачно - Система не смогла оправить эл. сообщение, потому что отсутствует необходимая информация. Например, отсутствует адрес эл. почты для клиента или контактного лица.\n• В очереди - Письмо с напоминанием находится в очереди напоминаний и еще не было обработано.\n• Удалено - Менеджер напоминаний удалил эту запись из очереди напоминаний.';
        translation['dlr.flh.daysOverdue'] = 'Введите количество дней после срока последнего платежа, когда требуется отправить письмо с напоминанием. Чтобы отправить письмо с напоминанием до даты выполнения, введите отрицательное число.';
        translation['ds.flh.description'] = 'Введите описание данной записи.';
        translation['dp.flh.dunningProcedure'] = 'Введите имя для этой процедуры напоминания.';
        translation['dp.flh.description'] = 'Введите описание этой процедуры напоминания.';
        translation['dp.flh.appliesTo'] = 'Выберите, назначить эту процедуру напоминания клиентам или исх. счетам. Если вы выберите «Клиент», необходимо также отметить или снять отметку поля «Разрешить переопределение». ';
        translation['dp.flh.sendingSchedule'] = 'Выберите, отправлять ли письма с напоминанием автоматически или вручную.';
        translation['dp.flh.minimumDunningInterval'] = 'Выберите минимальное количество дней между отправкой двух последовательных писем одному и тому же клиенту. Оно применяется как к отправке вручную, так и к автоматической отправке.';
        translation['dp.flh.subsidiary'] = 'Выберите дочерние организации, к которым применяется данная процедура напоминания.';
        translation['dp.flh.savedSearchCustomer'] = 'Выберите сохраненный поиск клиентов, к которым применяется процедура.';
        translation['dp.flh.allowOverride'] = 'Если вы поставите флажок, процедура напоминания на уровне исх. счета может изменять данную процедуру. Процедура напоминания на уровне исх. счета будет использоваться, если исходящий счет соответствует критериям для данной процедуры, вне зависимости от того, была ли назначена процедура напоминания на уровне клиента.';
        translation['dp.flh.department'] = 'Выберите подразделения, к которым применяется процедура.';
        translation['dp.flh.class'] = 'Выберите классы, к которым применяется процедура.';
        translation['dp.flh.location'] = 'Выберите местоположения, к которым применяется процедура.';
        translation['dp.flh.savedSearchInvoice'] = 'Выберите сохраненный поиск исх.счетов, к которым применяется процедура.';
        translation['dp.flh.assignAutomatically'] = 'Поставьте флажок, чтобы разрешить системе автоматически назначать эту процедуру напоминания клиентам или исходящим счетам на основании критериев выбора.';
        translation['dt.flh.name'] = 'Введите имя для этого шаблона напоминания.';
        translation['dt.flh.description'] = 'Введите описание этого шаблона напоминания.';
        translation['dt.flh.attachStatement'] = 'Поставьте флажок, чтобы прикреплять выписки по клиенту к письмам с напоминаниями, которые используют этот шаблон.';
        translation['dt.flh.attachInvoiceCopy'] = 'Поставьте флажок, чтобы прикреплять исходящие счета к письмам с напоминаниями, которые используют этот шаблон.';
        translation['dt.flh.overdueInvoiceOnly'] = 'Поставьте флажок, если хотите прикреплять только просроченные исходящие счета.';
        translation['dt.flh.openTransactionOnly'] = 'Поставьте флажок, если хотите включать только открытые Операции в выписки по клиенту.';
        translation['dt.flh.inactive'] = 'Поставьте флажок, чтобы отключить шаблон. Неактивные шаблоны не отображаются в списках, и их нельзя использовать для отправки писем с напоминаниями.';
        translation['dc.flh.allowEmail'] = 'Отметьте это поле, если хотите отправлять письма с напоминанием по эл. почте.';
        translation['dc.flh.lastLetterSent'] = 'Дата отправки последнего письма с напоминанием.';
        translation['dc.flh.dunningLevel'] = 'Это поле показывает текущий уровень напоминания по состоянию на последнюю оценку напоминаний.';
        translation['dc.flh.dunningManager'] = 'Выберите сотрудника, ответственного за напоминания для данного клиента, чье имя будет появляться в качестве отправителя писем с напоминаниями.';
        translation['dc.flh.dunningProcedure'] = 'В этом поле показана процедура напоминания, назначенная клиенту. Если вы нажали «Назначить автоматически», система назначает соответствующую процедуру на основании критериев выбора напоминаний. Выберите другое значение из раскрывающегося списка, чтобы изменить процедуру напоминания, назначенную клиенту. В раскрывающемся списке отображены только процедуры напоминания, которые применимы к данному клиенту, на основании критериев выбора напоминаний, определенных в записях процедуры напоминания.';
        translation['dc.flh.allowPrint'] = 'Отметьте это поле, если хотите распечатать письма с напоминанием.';
        translation['dc.flh.pauseReason'] = 'Выберите причину приостановки напоминаний.';
        translation['dc.flh.pauseReasonDetail'] = 'Выберите подробную информацию, указывающую на причину приостановки напоминаний.';
        translation['dc.flh.pauseDunning'] = 'Отметьте это поле для временной приостановки процесса напоминаний.';
        translation['dc.flh.dunningRecepients'] = 'Выберите дополнительных получателей напоминаний';
        translation['dc.flh.allowEmail'] = 'Отметьте это поле, если хотите отправлять письма с напоминанием по эл. почте.';
        translation['di.flh.lastLetterSent'] = 'Дата отправки последнего письма с напоминанием.';
        translation['di.flh.dunningLevel'] = 'Это поле показывает текущий уровень напоминания по состоянию на последнюю оценку напоминаний.';
        translation['di.flh.dunningManager'] = 'Выберите сотрудника, ответственного за напоминания для данного исх. счета, чье имя будет появляться в качестве отправителя писем с напоминаниями.';
        translation['di.flh.dunningProcedure'] = 'В этом поле показана процедура напоминания, назначенная исх. счету. Если вы нажали «Назначить автоматически», система назначает соответствующую процедуру на основании критериев выбора напоминаний. Выберите другое значение из раскрывающегося списка, чтобы изменить процедуру напоминания, назначенную исх. счету. В раскрывающемся списке отображены только процедуры напоминания, которые применимы к данному исх. счету, на основании критериев выбора напоминаний, определенных в записях процедуры напоминания.';
        translation['di.flh.allowPrint'] = 'Отметьте это поле, если хотите распечатать письма с напоминанием.';
        translation['di.flh.pauseReason'] = 'Выберите причину приостановки напоминаний.';
        translation['di.flh.pauseReasonDetail'] = 'Выберите подробное описание причины приостановки напоминаний.';
        translation['di.flh.pauseDunning'] = 'Отметьте это поле для временной приостановки процесса напоминаний.';
        translation['dp.validate.unpause'] = 'Если вы очистите поле « Приостановить напоминания», это немедленно запустит рабочий процесс оценки напоминаний. NetSuite может отправить письмо с напоминанием этому клиенту, в зависимости от результатов оценки напоминаний. Возобновить напоминания?';
        translation['dc.validateSubsidiary.existingConfigSubsidiary'] = 'Для этой дочерней компании уже существует запись конфигурации напоминания.';
        translation['l10n.address.invalidPOBox'] = 'Введите действительный номер п/я.';
        translation['l10n.address.invalidZipCode'] = 'Введите действительный индекс.';
        translation['l10n.address.invalidRuralRoute'] = 'Введите действительное значение для зоны доставки почты в сельскую местность.';
        translation['l10n.accessForDDandAccountant'] = 'Только роли администратора, руководителя напоминаний и бухгалтера могут создавать и изменять этот тип записи.';
        translation['l10n.deleteAccessForDDandAccountant'] = 'Только роли администратора, руководителя напоминаний и бухгалтера могут удалять этот тип записи.';
        translation['l10n.accessForAdministrator'] = 'Только роль администратора может создавать и изменять этот тип записи.';
        translation['l10n.deleteAccessForAdministrator'] = 'Только роль администратора может удалять этот тип записи.';
        translation['l10n.noPagePrivilege'] = 'У вас нет полномочий на просмотр этой страницы.';
        translation['dq.pdfemail.folderName'] = 'Письма с напоминанием для печати в PDF';
        translation['dq.pdfemail.subject'] = 'Созданные письма с напоминанием в формате PDF доступны для печати в хранилище файлов.';
        translation['dq.pdfemail.link'] = 'Щелкните ссылку, чтобы просмотреть папку с письмами PDF:';
        translation['dq.pdfemail.tableHead'] = 'В следующей таблице указаны сведения о папках, где хранятся файлы PDF.';
        translation['dq.pdfemail.exceedLimit'] = 'Созданные файлы нельзя использовать как вложение из-за ограничений, связанных с вложениями.';
        translation['dq.pdfemail.tableLabel1'] = 'Папки';
        translation['dq.pdfemail.tableLabel2'] = 'Путь';
        translation['dq.pdfemail.tableLabel3'] = 'Статус';
        translation['dq.pdfemail.tableLabel4'] = 'Заметки';

        break;

      case 'sv_SE':
      case 'sv-SE':
        translation['dsa.response.none_found'] = 'Inga kravprocedurer finns tillgängliga.';
        translation['form.dunning_template.title'] = 'Kravmall';
        translation['field.template.name'] = 'Namn';
        translation['field.template.description'] = 'Beskrivning';
        translation['field.template.attachStatement'] = 'Bifoga kontoutdrag';
        translation['field.template.overdue_invoices_stmt'] = 'Endast förfallna fakturor på kontoutdraget';
        translation['field.template.inactive'] = 'Inaktiv';
        translation['field.template.attach_invoice_copy'] = 'Bifoga fakturakopior';
        translation['field.template.only_overdue_invoices'] = 'Endast förfallna fakturor';
        translation['field.template.subject'] = 'Ämne';
        translation['selection.template.savedsearch'] = 'Sparad sökning';
        translation['selection.template.searchcolumn'] = 'Sökkolumn';
        translation['label.template.lettertext'] = 'Brevtext';
        translation['dba.form.title'] = 'Masstilldelning av krav';
        translation['dba.form.source'] = 'Gäller för';
        translation['dba.form.procedure'] = 'Kravprocedur';
        translation['dba.form.source.help'] = 'Gäller för';
        translation['dba.form.procedure.help'] = 'Kravprocedur';
        translation['dba.form.dunning_manager'] = 'Krav - Chef';
        translation['dba.form.dunning_manager.help'] = 'Krav - Chef';
        translation['dba.tab.invoice'] = 'Fakturor';
        translation['dba.sublist.invoice'] = 'Fakturor';
        translation['dba.tab.customer'] = 'Kunder';
        translation['dba.sublist.customer'] = 'Kunder';
        translation['dba.sublist.common.id'] = 'ID';
        translation['dba.sublist.common.customer'] = 'Kund';
        translation['dba.sublist.invoice.invoice'] = 'Faktura';
        translation['dba.sublist.invoice.amount'] = 'Belopp';
        translation['dba.sublist.invoice.currency'] = 'Valuta';
        translation['dba.sublist.invoice.duedate'] = 'Förfallodatum';
        translation['dba.sublist.invoice.days_overdue'] = 'Dagar sedan förfallodagen';
        translation['dba.sublist.customer.subsidiary'] = 'Dotterbolag';
        translation['dba.sublist.common.assign_dunning'] = 'Tilldela';
        translation['dba.sublist.common.dunning_procedure'] = 'Kravprocedur';
        translation['dba.sublist.common.dunning_level'] = 'Kravnivå';
        translation['dba.sublist.common.last_letter_sent'] = 'Datum för senast skickade brev';
        translation['dba.sublist.common.dunning_sending_type'] = 'Försändelsetyp';
        translation['dba.sublist.common.page_next'] = '>';
        translation['dba.sublist.common.page_previous'] = '<';
        translation['dba.sublist.common.page_option'] = '{startIndex} - {endIndex} av {totalEntryCount}';
        translation['dba.form.restriction'] = 'Urvalskriterier';
        translation['dba.form.selection'] = 'Val av kravprocedur';
        translation['dba.form.restriction.subsidiary'] = 'Dotterbolag';
        translation['dba.form.restriction.location'] = 'Platser';
        translation['dba.form.restriction.dept'] = 'Avdelningar';
        translation['dba.form.restriction.class'] = 'Klasser';
        translation['dba.form.restriction.search'] = 'Sparad sökning';
        translation['dba.form.action.assign'] = 'Tilldela';
        translation['dba.form.action.assign_customer'] = 'Tilldela till kunder';
        translation['dba.form.action.assign_invoice'] = 'Tilldela till fakturor';
        translation['dba.form.action.cancel'] = 'Avbryt';
        translation['dba.form.notification.highnumberofrecord'] = 'Den här begäran kan ta några sekunder att slutföra. Vänta tills du dirigeras om till sidan Kravprocedur.';
        translation['dqf.form.action.send'] = 'Skicka';
        translation['dqf.form.action.print'] = 'Skriv ut';
        translation['dqf.form.action.remove'] = 'Ta bort';
        translation['dqf.form.send.title'] = 'Krav - Sändkö för e-post';
        translation['dqf.form.print.title'] = 'Krav - Utskriftskö för PDF';
        translation['dqf.filter.fieldGroup'] = 'Filter';
        translation['dqf.filter.inlineHelp'] = 'Du kan använda filter för att förfina sökningen eller för att minska antal resultat som visas.';
        translation['dqf.filter.applyFiltersButton'] = 'Sök';
        translation['dqf.filter.customer'] = 'Kund';
        translation['dqf.filter.recipient'] = 'Mottagare';
        translation['dqf.filter.procedure'] = 'Kravprocedur';
        translation['dqf.filter.dpLevel'] = 'Kravnivå';
        translation['dqf.filter.appliesTo'] = 'Gäller för';
        translation['dqf.filter.allowPrint'] = 'Tillåt utskrift';
        translation['dqf.filter.allowEmail'] = 'Tillåt e-post';
        translation['dqf.filter.lastLtrSentStart'] = 'Startdatum för senast skickade brev';
        translation['dqf.filter.lastLtrSentEnd'] = 'Slutdatum för senast skickade brev';
        translation['dqf.filter.evalDateStart'] = 'Startdatum för utvärdering';
        translation['dqf.filter.evalDateEnd'] = 'Slutdatum för utvärdering';
        translation['dqf.filter.boolean.yes'] = 'Ja';
        translation['dqf.filter.boolean.no'] = 'Nej';
        translation['dqf.sublist.send.title'] = 'Krav - Sändkö för e-post';
        translation['dqf.sublist.print.title'] = 'Krav - Utskriftskö för PDF';
        translation['dqf.sublist.common.customer'] = 'Kund';
        translation['dqf.sublist.common.mark'] = 'Markera';
        translation['dqf.sublist.common.view'] = 'Vy';
        translation['dqf.sublist.common.id'] = 'ID';
        translation['dqf.sublist.dp.applies_to'] = 'Gäller för';
        translation['dqf.sublist.common.dunning_procedure'] = 'Kravprocedur';
        translation['dqf.sublist.common.dunning_level'] = 'Nivå';
        translation['dqf.sublist.record.last_letter_sent'] = 'Senaste brev skickades';
        translation['dqf.sublist.record.dunning_allow_email'] = 'Tillåt e-post';
        translation['dqf.sublist.record.dunning_allow_print'] = 'Tillåt utskrift';
        translation['dqf.sublist.record.pause_dunning'] = 'Pausa krav';
        translation['dqf.sublist.common.evaluation_date'] = 'Utvärderingsdatum';
        translation['dqf.sublist.common.related_entity'] = 'Mottagare';
        translation['dbu.form.title'] = 'Massuppdatera kunduppgifterna för krav';
        translation['dbu.form.update_button'] = 'Uppdatering';
        translation['dbu.form.field.subsidiary'] = 'Dotterbolag';
        translation['dbu.form.flh.subsidiary'] = 'Välj det dotterbolag för vilket du vill utföra en massuppdatering av kravfälten i kunduppgifterna. Uppdateringarna kommer att tillämpas på alla kunduppgifter som tillhör det valda dotterbolaget.';
        translation['dbu.form.field.allow_email'] = 'Tillåt att brev skickas med e-post';
        translation['dbu.form.flh.allow_email'] = 'Välj ett värde som ska tillämpas på det här fältet i kunduppgifterna efter att massuppdateringen har körts:\nOförändrad – Fältets nuvarande värde kommer inte att ändras. \nMarkerad – Kryssrutan kommer att vara markerat i kunduppgifterna efter massuppdateringen. \nAvmarkerad - Kryssrutan kommer att vara avmarkerat efter massuppdateringen.';
        translation['dbu.form.field.allow_print'] = 'Tillåt att brev skrivs ut';
        translation['dbu.form.flh.allow_print'] = 'Välj ett värde som ska tillämpas på det här fältet i kunduppgifterna efter att massuppdateringen har körts:\nOförändrad – Fältets nuvarande värde kommer inte att ändras. \nMarkerad – Kryssrutan kommer att vara markerat i kunduppgifterna efter massuppdateringen. \nAvmarkerad - Kryssrutan kommer att vara avmarkerat efter massuppdateringen.';
        translation['dbu.form.field.dont_send_cust_email'] = 'Skicka inte kravbrev till kunden via e-post';
        translation['dbu.form.flh.dont_send_cust_email'] = 'Välj ett värde som ska tillämpas på det här fältet i kunduppgifterna efter att massuppdateringen har körts:\nOförändrad – Fältets nuvarande värde kommer inte att ändras. \nMarkerad – Kryssrutan kommer att vara markerat i kunduppgifterna efter massuppdateringen. \nAvmarkerad - Kryssrutan kommer att vara avmarkerat efter massuppdateringen.';
        translation['dbu.form.primary_field_group'] = 'Kriterier';
        translation['dbu.form.bulk_update_field_group'] = 'Fält att massuppdatera';
        translation['dbu.form.options.unchanged'] = '- Oförändrad -';
        translation['dbu.form.options.checked'] = 'Markerad';
        translation['dbu.form.options.not_checked'] = 'Avmarkerad';
        translation['dbu.validation.no_selection'] = 'Det finns inga fält att uppdatera eftersom - Oförändrad - har valts för alla fält. Du kan köra en massuppdatering om en ändring av minst ett fält har angetts (Markerad eller Avmarkerad).';
        translation['dbu.validation.no_sending_media'] = 'Kunduppgifterna kan inte sparas om båda kryssrutorna Tillåt att brev skickas med e-post och Tillåt att brev skrivs ut är avmarkerade. Välj Markerad för minst ett av följande fält:\n- Tillåt att kravbrev skickas via e-post\n- Tillåt att brev skrivs ut';
        translation['dbu.validation.verify_submit_ow'] = 'Alla kunduppgifter med kravprocedurer kommer att uppdateras för det valda dotterbolaget {SUBSIDIARY}. Du kommer att få ett e-postmeddelande när massuppdateringen har slutförts. Vill du fortsätta med massuppdateringen? Om du klickar på OK påbörjas massbearbetningen. Den här åtgärden kan inte återföras.';
        translation['dbu.validation.verify_submit_si'] = 'Alla kunduppgifter med kravprocedurer kommer att uppdateras. Du kommer att få ett e-postmeddelande när massuppdateringen har slutförts. Vill du fortsätta med massuppdateringen? Om du klickar på OK påbörjas massbearbetningen. Den här åtgärden kan inte återföras.';
        translation['dbu.form.reminderinlinehelp'] = 'NetSuite rekommenderar att du inte kör massuppdateringsfunktionen under normal arbetstid. Detta för att förhindra att andra användare i ditt företag inte håller på att uppdatera kunduppgifterna samtidigt som massuppdateringen körs.';
        translation['dbu.validation.validate_concurrency_ow'] = 'En massuppdatering av kunduppgifter för krav för dotterbolaget  {SUBSIDIARY} har initierats av  {USER}. Massuppdateringen måste slutföras innan du kan köra en annan massuppdatering av kunder för samma dotterbolag.';
        translation['dbu.validation.validate_concurrency_si'] = 'Systemet klarar endast att köra en massuppdatering åt gången. En massuppdatering som initierats av  {USER} körs för tillfället.';
        translation['dbu.customer.message.complete_subject'] = 'Massuppdatering av kunduppgifter för krav';
        translation['dbu.customer.message.complete_body_ow'] = [
          'Hälsningar från NetSuite!<br />',
          'Massuppdateringen av kunduppgifter för krav för dotterbolaget  {SUBSIDIARY} har slutförts.',
          'Tillåt att brev skickas med e-post = {ALLOW_EMAIL}',
          'Tillåt att brev skrivs ut = {ALLOW_PRINT}',
          'Skicka inte kravbrev till kunden via e-post = {DONT_SEND_TO_CUST}<br />',
          'Antal uppdaterade kunduppgifter:  {PROCESSED_RECORDS} av  {RECORD_COUNT}.{ERROR_STEPS}',
          'Detta är ett systemgenererat e-postmeddelande.<br />',
          'Tack!',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.complete_body_si'] = [
          'Hälsningar från NetSuite!<br />',
          'Massuppdateringen av kunduppgifter för krav har slutförts.',
          'Tillåt att brev skickas med e-post = {ALLOW_EMAIL}',
          'Tillåt att brev skrivs ut = {ALLOW_PRINT}',
          'Skicka inte kravbrev till kunden via e-post = {DONT_SEND_TO_CUST}<br />',
          'Antal uppdaterade kunduppgifter:  {PROCESSED_RECORDS} av  {RECORD_COUNT}.{ERROR_STEPS}',
          'Detta är ett systemgenererat e-postmeddelande.<br />',
          'Tack!',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.error_file_header'] = 'Kund-ID,Fel';
        translation['dbu.customer.message.error_filename'] = 'Failed Updates.csv';
        translation['dbu.customer.message.error_steps'] = '<br />Ladda ned den bifogade filen för att granska en lista över poster som inte kunde uppdateras. Du kan uppdatera de här posterna manuellt.';
        translation['dc.validateCustomer.noDPMatched'] = 'Kunde inte hitta någon kravprocedur som matchar kunduppgifterna.';
        translation['dc.validateCustomer.recipientNoEmail'] = 'Följande mottagare av kravbrev har ingen e-postadress i sina kontaktuppgifter:  {CONTACTNAMES}.';
        translation['dc.validateCustomer.customerNoEmail'] = 'Posten kan inte sparas. Kryssrutan Tillåt att brev skickas med e-post är markerad men inga e-postadresser eller kravmottagare att skicka kravbrev till har angetts. Följande villkor måste ha värdet SANT innan du kan spara posten:\n- Fliken Kravmottagare innehåller minst en e-postadress till en kontaktperson.\n- Fältet E-postadress i kunduppgifterna innehåller en e-postadress.\n\nObs! Kundens e-postadress är obligatoriskt endast om kryssrutan Skicka inte kravbrev till kunden via e-post inte är markerad.';
        translation['dc.validateCustomer.noEmailAtAll'] = 'Ingen e-postadress har angetts i kunduppgifterna och ingen mottagare för kravbrev har angetts för den här kunden. Ange en e-postadress i kunduppgifterna eller markera minst en kravbrevsmottagare som har en angiven e-postadress på fliken Krav.';
        translation['dc.validateCustomer.recipientListEmpty'] = 'Posten kan inte sparas. Kryssrutan Tillåt att brev skickas med e-post är markerad men ingen kravmottagare att skicka kravbrev till har angetts. Fliken Kravmottagare måste innehålla minst en kontaktperson med en angiven e-postadress innan du kan spara den här posten. \n\nObs! Kundens e-postadress är obligatoriskt endast om kryssrutan Skicka inte kravbrev till kunden via e-post inte är markerad.';
        translation['dc.validateCustomer.dpMatched'] = 'Kunduppgifterna matchar kravproceduren "{DP}". Vill du ändra kravproceduren?';
        translation['dc.validateCustomer.dpAllReadyAssigned'] = 'Den kravprocedur som hittades är samma som den redan tilldelade kravproceduren i posten.';
        translation['dc.validateDP.managerRequired'] = 'En kravansvarig krävs.';
        translation['dc.validateDP.sendingModeRequired'] = 'Minst en av följande kryssrutor måste markeras:\n- Tillåt att kravbrev skickas via e-post\n- Tillåt att brev skrivs ut';
        translation['dl.validateDL.dlCountExceeded'] = 'Du har överskridit det högsta tillåtna antalet kravnivåer.';
        translation['dl.validateDL.lowerDaysOverDue'] = 'Antal dagar sedan förfallodagen måste vara mindre än  {DAYS}.';
        translation['dl.validateDL.higherDaysOverdue'] = 'Antal dagar sedan förfallodagen måste vara mer än  {DAYS}.';
        translation['dl.validateDL.daysOverdueExist'] = 'Antal dagar sedan förfallodagen {DAYS} står redan på en annan rad.';
        translation['dl.validateDL.lastRecordDeletion'] = 'Du kan endast ta bort den sista posten i listan.';
        translation['dl.validateDL.daysBetSending'] = 'Dagar mellan utskick av brev måste vara mer än eller lika med  {DAYS}';
        translation['dl.validateDL.minOutsBalGEZero'] = 'Lägsta utestående belopp måste vara minst noll (0).';
        translation['dl.validateDL.daysOverdueLessPrevious'] = 'Dagar sedan förfallodagen för kravnivån  {LEVEL}({LEVEL_OVERDUE} dagar) måste vara mindre än kravnivån  {PREVLEVEL} ({PREVLEVEL_OVERDUE}dagar).';
        translation['dl.validateDL.dlRequired'] = 'Minst en kravnivå krävs.';
        translation['dp.validateDP.editNotAllowed'] = 'Du får inte redigera kravprocedurtypen.';
        translation['dp.information.possibleMultipleSending'] = 'Om du inaktiverar fältet Minsta kravintervall blir det möjligt att skicka flera kravbrev till samma kund under en och samma dag. Vill du inaktivera den?';
        translation['dba.pagination.failedPrevPage'] = 'Kunde inte gå till föregående sida.';
        translation['dq.validation.str_send'] = 'skicka';
        translation['dq.validation.str_remove'] = 'ta bort';
        translation['dq.validation.str_print'] = 'skriv ut';
        translation['dq.validation.chooseAction'] = 'Välj ett brev att ';
        translation['dq.validation.removalConfirmation'] = 'Vill du ta bort de valda posterna från kön?';
        translation['dq.pt.dunningQueueTitle'] = 'Kravkö';
        translation['dq.pt.source'] = 'Källtyp';
        translation['dq.pt.dunningProcedure'] = 'Kravprocedur';
        translation['dq.pt.dunningLevel'] = 'Kravnivå';
        translation['dq.pt.lastLetterSent'] = 'Senaste brev skickades';
        translation['dq.pt.emailingAllowed'] = 'E-post tillåtet';
        translation['dq.pt.printingAllowed'] = 'Utskrift tillåtet';
        translation['dq.pt.send'] = 'Skicka';
        translation['dq.pt.remove'] = 'Ta bort';
        translation['dq.pt.print'] = 'Skriv ut';
        translation['dq.pt.customer'] = 'Kund';
        translation['dt.validator.invalidDefault'] = 'Minst en standardmall måste ha valts för varje typ av kravmall. Granska flikarna E-post och PDF och välj en standardmall.';
        translation['dt.validator.duplicateLanguage'] = 'Det här språket används redan för den här malltypen.';
        translation['dt.validator.noTemplateDocs'] = 'Det måste finnas minst ett e-postmalldokument och minst ett PDF-dokument om du vill spara den här posten.';
        translation['dt.validator.subject'] = 'Misslyckad validering av kravmallsdokument';
        translation['dt.validator.body'] = 'Följande malldokument är ogiltiga:';
        translation['dt.validator.defaultDeletion'] = 'Du försöker ta bort en mall som för närvarande har angetts som standardmall. Om du vill ta bort den här mallen måste du först ange en annan mall som standardmall.';
        translation['dt.validator.xmlEmailDeprecated'] = 'Du kan inte lägga till, redigera eller ta bort rader i XML-baserade e-postmallar. Användningen av XML-baserade e-postmallar för krav håller på att fasas ut. Om du lägger till e-postmallar på fliken Krav - E-postmall kommer den här posten att ta bort samtliga rader på fliken Krav - E-postmall i XML-format när den sparas.';
        translation['dt.validator.deleteAllXMLLines'] = 'Om du sparar den här posten kommer alla rader på fliken Krav - E-postmall i XML-format att raderas. ';
        translation['dt.validator.noEMailDocs'] = 'Den här posten måste innehålla minst en e-postmall om du vill spara den.';
        translation['dt.validator.noPDFDocs'] = 'Den här posten måste innehålla minst en PDF-mall om du vill spara den.';
        translation['dt.validator.multipleDefault'] = 'Vill du ta använda den här mallen som standardmall?';
        translation['dlr.validateDLR.noAmount'] = 'Kravnivåregeln bör ha minst ett kravnivåsregelbelopp.';
        translation['dlr.validateDLR.noDefaultAmount'] = 'Kravnivåregeln bör ha minst ett kravnivåsregelbelopp angivet som standardbeloppet.';
        translation['dlr.validateDLR.duplicateCurrency'] = 'Valutan måste vara unik.';
        translation['dlr.validateDLR.invalidAmount'] = 'Beloppet måste vara större än eller lika med 0.';
        translation['dlr.validateDLR.changeDefaultCurrency'] = 'Vill du använda den här radens valuta och belopp som standardvärdet? (Nuvarande standardbelopp och standardvaluta kommer då att ändras)';
        translation['dlr.validateDLR.negativeDaysOverdue'] = 'Fältet Dagar sedan förfallodagen innehåller ett negativt tal. Detta gör att ett brev skickas till kunden innan betalningen förfaller.';
        translation['dlr.validateDLR.daysOverdueChanged'] = 'Om du ändrar värdet på Förseningsdagar i en kravnivåregel kan det ändra ordningsföljden eller ordningen på kravnivåer, vilket i sin tur kan leda till att ej lämpliga kravbrev skickas.\n\n Du rekommenderas kontrollera ordningen på kravnivåer för varje kravförfarandet ({DP_LIST}) där kravnivån som du vill ändra används.';
        translation['dlr.validateDLR.cannotAddCurrency'] = 'Du kan inte lägga till valutan eftersom funktionen Flera valutor har inte aktiverats.';
        translation['der.flh.dunningProcedure'] = 'Det här fältet anger vilken kravprocedur som fakturan eller kunden tilldelats.';
        translation['der.flh.dunningLevel'] = 'Det här fältet visar nuvarande kravnivå efter utvärdering.';
        translation['der.flh.relatedEntity'] = 'Det här fältet är länkat till kravmottagarens entitet eller kontaktperson.';
        translation['der.flh.messageContent'] = 'Det här fältet visar kravbrevets innehåll.';
        translation['der.flh.invoiceList'] = 'I det här fältet visas en lista över de fakturor som är kopplade till kravbrevet.';
        translation['der.flh.emailRecipient'] = 'I det här fältet visas kravbrevsmottagarnas e-postadresser.';
        translation['der.flh.subject'] = 'I det här fältet visas kravbrevets ämnesrad.';
        translation['der.flh.dunningManager'] = 'I det här fältet visas namnet på kundens tilldelade kravansvarige och fältet är länkat till den kravansvariges personaluppgifter.';
        translation['der.flh.dunningTemplate'] = 'Det här fältet är länkat till kravmallsposten.';
        translation['der.flh.customer'] = 'Det här fältet är länkat till kunduppgifterna.';
        translation['der.flh.status'] = 'Det här fältet visar om e-postmeddelandet har kunnat skickas eller inte. Det kan ha något av följande statusvärden:\n\n• Skickat - E-postmeddelandet har skickats utan fel.\n• Misslyckat - Systemet kunde inte skicka e-postmeddelandet eftersom information saknas. Till exempel kan det saknas en e-postadress till kunden eller kontaktpersonen.\n• I kö - Kravbrevet väntar fortfarande i kravbrevskön och har inte bearbetats än.\n• Borttaget - Den kravansvarige har tagit bort den här posten från kravkön.';
        translation['dlr.flh.daysOverdue'] = 'Ange efter hur många dagar efter förfallodatumet som ett kravbrev ska skickas ut. Om du vill skicka et brev innan förfallodatumet kan du ange ett negativt tal.';
        translation['ds.flh.description'] = 'Ange en beskrivning för den här posten.';
        translation['dp.flh.dunningProcedure'] = 'Ange ett namn för den här kravproceduren.';
        translation['dp.flh.description'] = 'Ange en beskrivning för den här kravproceduren.';
        translation['dp.flh.appliesTo'] = 'Ange om den här kravproceduren kommer att tilldelas till kunder eller fakturor. Om du väljer Kund måste du även antingen markera eller avmarkera kryssrutan Tillåt åsidosättande.';
        translation['dp.flh.sendingSchedule'] = 'Välj huruvida kravbreven ska skickas automatiskt eller manuellt.';
        translation['dp.flh.minimumDunningInterval'] = 'Välj minsta antal dagar mellan utskick av två på varandra följande brev till samma kund. Detta gäller såväl manuellt som automatiskt utskick.';
        translation['dp.flh.subsidiary'] = 'Välj vilka dotterbolag den här kravproceduren ska gälla för.';
        translation['dp.flh.savedSearchCustomer'] = 'Välj den sparade kundsökning som den här proceduren ska gälla för.';
        translation['dp.flh.allowOverride'] = 'Om du markerar den här kryssrutan kan en kravprocedur på fakturanivå åsidosätta den här proceduren. En kravprocedur på fakturanivå kommer att användas om en faktura uppfyller kriterierna för den proceduren, oavsett om en kravprocedur på kundnivå redan har tilldelats.';
        translation['dp.flh.department'] = 'Välja vilka avdelningar den här proceduren ska gälla för.';
        translation['dp.flh.class'] = 'Välja vilka klasser den här proceduren ska gälla för.';
        translation['dp.flh.location'] = 'Välja vilka platser den här proceduren ska gälla för.';
        translation['dp.flh.savedSearchInvoice'] = 'Välj vilken sparad fakturasökning den här proceduren ska gälla för.';
        translation['dp.flh.assignAutomatically'] = 'Markera den här kryssrutan om du vill att systemet automatiskt ska tilldela denna kravprocedur till kunder eller fakturor baserat på urvalskriterierna.';
        translation['dt.flh.name'] = 'Ange ett namn för den här kravmallen.';
        translation['dt.flh.description'] = 'Ange en beskrivning för den här kravmallen.';
        translation['dt.flh.attachStatement'] = 'Markera den här kryssrutan om du vill bifoga kundutdrag till kravbrev som använder den här mallen.';
        translation['dt.flh.attachInvoiceCopy'] = 'Markera den här kryssrutan om du vill bifoga fakturor till kravbrev som använder den här mallen.';
        translation['dt.flh.overdueInvoiceOnly'] = 'Markera den här kryssrutan om du endast vill bifoga förfallna fakturor.';
        translation['dt.flh.openTransactionOnly'] = 'Markera den här kryssrutan om du endast vill inkludera öppna transaktioner på kundutdraget.';
        translation['dt.flh.inactive'] = 'Markera den här kryssrutan om du vill inaktivera mallen. Inaktiverade mallar visas inte i listor och kan inte användas för att skicka kravbrev.';
        translation['dc.flh.allowEmail'] = 'Markera den här kryssrutan om du vill skicka kravbrev via e-post.';
        translation['dc.flh.lastLetterSent'] = 'Datumet då senaste kravbrevet skickades.';
        translation['dc.flh.dunningLevel'] = 'Det här fältet visar nuvarande kravnivå utifrån den senaste kravutvärderingen.';
        translation['dc.flh.dunningManager'] = 'Välj den person som ansvarar för krav på den här kunden och som ska stå som avsändare på kravbrev.';
        translation['dc.flh.dunningProcedure'] = 'Det här fältet visar vilken kravprocedur som kunden tilldelats. Om du klickar på Tilldela automatiskt kommer systemet att tilldela en lämplig kravprocedur baserat på urvalskriterierna för krav. Välj ett annat värde i listrutan om du vill ändra vilken kravprocedur som kunden ska tilldelas. I listrutan visas endast de kravprocedurer som är giltiga för kunden, baserat på de urvalskriterier som definierats för kravproceduren.';
        translation['dc.flh.allowPrint'] = 'Markera den här kryssrutan om du vill skriva ut kravbrev.';
        translation['dc.flh.pauseReason'] = 'Välj en anledning för att ange varför kravproceduren pausades.';
        translation['dc.flh.pauseReasonDetail'] = 'Välj en detalj för att ange varför kravproceduren pausades.';
        translation['dc.flh.pauseDunning'] = 'Markera den här kryssrutan om du vill stoppa kravprocessen.';
        translation['dc.flh.dunningRecepients'] = 'Välj ytterligare kravmottagare';
        translation['dc.flh.allowEmail'] = 'Markera den här kryssrutan om du vill skicka kravbrev via e-post.';
        translation['di.flh.lastLetterSent'] = 'Datumet då senaste kravbrevet skickades.';
        translation['di.flh.dunningLevel'] = 'Det här fältet visar nuvarande kravnivå utifrån den senaste kravutvärderingen.';
        translation['di.flh.dunningManager'] = 'Välj den person som ansvarar för krav på den här fakturan och som ska stå som avsändare på kravbrevet.';
        translation['di.flh.dunningProcedure'] = 'Det här fältet anger vilken kravprocedur som fakturan eller kunden tilldelats. Om du klickar på Tilldela automatiskt kommer systemet att tilldela en lämplig kravprocedur baserat på urvalskriterierna för krav. Välj ett annat värde i listrutan om du vill ändra vilken kravprocedur som fakturan ska tilldelas. I listrutan visas endast de kravprocedurer som är giltiga för fakturan, baserat på de urvalskriterier som definierats för kravproceduren.';
        translation['di.flh.allowPrint'] = 'Markera den här kryssrutan om du vill skriva ut kravbrev.';
        translation['di.flh.pauseReason'] = 'Välj en anledning för att ange varför kravproceduren pausades.';
        translation['di.flh.pauseReasonDetail'] = 'Välj en mer detaljerad anledning för att ange varför kravproceduren pausades.';
        translation['di.flh.pauseDunning'] = 'Markera den här kryssrutan om du vill stoppa kravprocessen.';
        translation['dp.validate.unpause'] = 'När du avmarkerar kryssrutan Pausa krav utlöses arbetsflödet för kravutvärdering. NetSuite kan skicka ett kravbrev till den här kunden beroende på resultatet av kravutvärderingen. Vill du återuppta krav?';
        translation['dc.validateSubsidiary.existingConfigSubsidiary'] = 'Det finns redan en kravkonfigurationspost för det här dotterbolaget.';
        translation['l10n.address.invalidPOBox'] = 'Ange ett giltigt boxnummer.';
        translation['l10n.address.invalidZipCode'] = 'Ange ett giltigt postnummer.';
        translation['l10n.address.invalidRuralRoute'] = 'Ange ett värde för Landsväg.';
        translation['l10n.accessForDDandAccountant'] = 'Endast en person med någon av rollerna Administratör, Krav - Direktör eller Revisor kan skapa och ändra den här posttypen.';
        translation['l10n.deleteAccessForDDandAccountant'] = 'Endast en person med någon av rollerna Administratör, Krav - Direktör eller Revisor kan ta bort den här posttypen.';
        translation['l10n.accessForAdministrator'] = 'Endast en person med rollen Administratör kan skapa och ändra den här posttypen.';
        translation['l10n.deleteAccessForAdministrator'] = 'Endast en person med rollen Administratör kan ta bort den här posttypen.';
        translation['l10n.noPagePrivilege'] = 'Du har inte behörighet att visa den här sidan.';
        translation['dq.pdfemail.folderName'] = 'Kravbrev som PDF för att skriva ut';
        translation['dq.pdfemail.subject'] = 'De genererade PDF-kravbreven är tillgängliga för utskrift i arkivskåpet.';
        translation['dq.pdfemail.link'] = 'Klicka på länken för att visa mappen med PDF-kravbreven:';
        translation['dq.pdfemail.tableHead'] = 'Följande tabell ger information om de mappar där PDF-filerna är lagrade.';
        translation['dq.pdfemail.exceedLimit'] = 'De genererade filerna kunde inte bifogas på grund av att gränsen för bifogor har överskridits.';
        translation['dq.pdfemail.tableLabel1'] = 'Mappar';
        translation['dq.pdfemail.tableLabel2'] = 'Sökväg';
        translation['dq.pdfemail.tableLabel3'] = 'Status';
        translation['dq.pdfemail.tableLabel4'] = 'Anteckningar';

        break;

      case 'th_TH':
      case 'th-TH':
        translation['dsa.response.none_found'] = 'ไม่มีขั้นตอนการแจ้งหนี้อยู่';
        translation['form.dunning_template.title'] = 'เท็มเพลตการแจ้งหนี้';
        translation['field.template.name'] = 'ชื่อ';
        translation['field.template.description'] = 'คำอธิบาย';
        translation['field.template.attachStatement'] = 'แนบรายงานการเงิน';
        translation['field.template.overdue_invoices_stmt'] = 'ใบแจ้งหนี้ที่เกินกำหนดเท่านั้นที่อยู่ในรายงานการเงิน';
        translation['field.template.inactive'] = 'ไม่ได้ใช้งาน';
        translation['field.template.attach_invoice_copy'] = 'แนบสำเนาใบแจ้งหนี้';
        translation['field.template.only_overdue_invoices'] = 'ใบแจ้งหนี้ที่เกินกำหนดเท่านั้น';
        translation['field.template.subject'] = 'หัวข้อ';
        translation['selection.template.savedsearch'] = 'การค้นหาที่บันทึกไว้';
        translation['selection.template.searchcolumn'] = 'คอลัมน์ค้นหา';
        translation['label.template.lettertext'] = 'ข้อความจดหมาย';
        translation['dba.form.title'] = 'การกำหนดการแจ้งหนี้จำนวนมาก';
        translation['dba.form.source'] = 'ใช้กับ';
        translation['dba.form.procedure'] = 'ขั้นตอนการแจ้งหนี้';
        translation['dba.form.source.help'] = 'ใช้กับ';
        translation['dba.form.procedure.help'] = 'ขั้นตอนการแจ้งหนี้';
        translation['dba.form.dunning_manager'] = 'ผู้จัดการการแจ้งหนี้';
        translation['dba.form.dunning_manager.help'] = 'ผู้จัดการการแจ้งหนี้';
        translation['dba.tab.invoice'] = 'ใบแจ้งหนี้';
        translation['dba.sublist.invoice'] = 'ใบแจ้งหนี้';
        translation['dba.tab.customer'] = 'ลูกค้า';
        translation['dba.sublist.customer'] = 'ลูกค้า';
        translation['dba.sublist.common.id'] = 'ID';
        translation['dba.sublist.common.customer'] = 'ลูกค้า';
        translation['dba.sublist.invoice.invoice'] = 'ใบแจ้งหนี้';
        translation['dba.sublist.invoice.amount'] = 'จำนวน';
        translation['dba.sublist.invoice.currency'] = 'สกุลเงิน';
        translation['dba.sublist.invoice.duedate'] = 'วันครบกำหนด';
        translation['dba.sublist.invoice.days_overdue'] = 'จำนวนวันที่เลยกำหนดเวลา';
        translation['dba.sublist.customer.subsidiary'] = 'บริษัทในเครือ';
        translation['dba.sublist.common.assign_dunning'] = 'มอบหมาย';
        translation['dba.sublist.common.dunning_procedure'] = 'ขั้นตอนการแจ้งหนี้';
        translation['dba.sublist.common.dunning_level'] = 'ระดับการแจ้งหนี้';
        translation['dba.sublist.common.last_letter_sent'] = 'วันที่ส่งจดหมายครั้งที่แล้ว';
        translation['dba.sublist.common.dunning_sending_type'] = 'ประเภทการส่ง';
        translation['dba.sublist.common.page_next'] = '>';
        translation['dba.sublist.common.page_previous'] = '<';
        translation['dba.sublist.common.page_option'] = '{startIndex} - {endIndex} จาก {totalEntryCount}';
        translation['dba.form.restriction'] = 'เกณฑ์การเลือก';
        translation['dba.form.selection'] = 'การเลือกขั้นตอนการแจ้งหนี้';
        translation['dba.form.restriction.subsidiary'] = 'บริษัทในเครือ';
        translation['dba.form.restriction.location'] = 'สถานที่ตั้ง';
        translation['dba.form.restriction.dept'] = 'แผนก';
        translation['dba.form.restriction.class'] = 'คลาส';
        translation['dba.form.restriction.search'] = 'การค้นหาที่บันทึกไว้';
        translation['dba.form.action.assign'] = 'มอบหมาย';
        translation['dba.form.action.assign_customer'] = 'กำหนดให้ลูกค้า';
        translation['dba.form.action.assign_invoice'] = 'กำหนดให้ใบแจ้งหนี้';
        translation['dba.form.action.cancel'] = 'ยกเลิก';
        translation['dba.form.notification.highnumberofrecord'] = 'คำขอนี้อาจใช้เวลาหลายวินาทีในการทำให้เสร็จสิ้น โปรดรอจนกระทั่งคุณถูกนำทางไปที่หน้าขั้นตอนการแจ้งหนี้';
        translation['dqf.form.action.send'] = 'ส่ง';
        translation['dqf.form.action.print'] = 'พิมพ์';
        translation['dqf.form.action.remove'] = 'ลบ';
        translation['dqf.form.send.title'] = 'คิวการส่งอีเมลการแจ้งหนี้';
        translation['dqf.form.print.title'] = 'คิวการพิมพ์ PDF การแจ้งหนี้';
        translation['dqf.filter.fieldGroup'] = 'ฟิลเตอร์';
        translation['dqf.filter.inlineHelp'] = 'ใช้ฟิลเตอร์เพื่อทำให้การค้นหาชี้เฉพาะยิ่งขึ้น หรือเพื่อจำกัดผลลัพธ์ที่จะแสดง';
        translation['dqf.filter.applyFiltersButton'] = 'ค้นหา';
        translation['dqf.filter.customer'] = 'ลูกค้า';
        translation['dqf.filter.recipient'] = 'ผู้รับ';
        translation['dqf.filter.procedure'] = 'ขั้นตอนการแจ้งหนี้';
        translation['dqf.filter.dpLevel'] = 'ระดับการแจ้งหนี้';
        translation['dqf.filter.appliesTo'] = 'ใช้กับ';
        translation['dqf.filter.allowPrint'] = 'อนุญาตการพิมพ์';
        translation['dqf.filter.allowEmail'] = 'อนุญาตอีเมล';
        translation['dqf.filter.lastLtrSentStart'] = 'วันที่เริ่มส่งจดหมายครั้งที่แล้ว';
        translation['dqf.filter.lastLtrSentEnd'] = 'วันที่สิ้นสุดการส่งจดหมายครั้งที่แล้ว';
        translation['dqf.filter.evalDateStart'] = 'วันที่เริ่มการประเมิน';
        translation['dqf.filter.evalDateEnd'] = 'วันที่สิ้นสุดการประเมิน';
        translation['dqf.filter.boolean.yes'] = 'ใช่';
        translation['dqf.filter.boolean.no'] = 'ไม่มี';
        translation['dqf.sublist.send.title'] = 'คิวการส่งอีเมลการแจ้งหนี้';
        translation['dqf.sublist.print.title'] = 'คิวการพิมพ์ PDF การแจ้งหนี้';
        translation['dqf.sublist.common.customer'] = 'ลูกค้า';
        translation['dqf.sublist.common.mark'] = 'ทำเครื่องหมาย';
        translation['dqf.sublist.common.view'] = 'มุมมอง';
        translation['dqf.sublist.common.id'] = 'ID';
        translation['dqf.sublist.dp.applies_to'] = 'ใช้กับ';
        translation['dqf.sublist.common.dunning_procedure'] = 'ขั้นตอนการแจ้งหนี้';
        translation['dqf.sublist.common.dunning_level'] = 'ระดับ';
        translation['dqf.sublist.record.last_letter_sent'] = 'จดหมายที่ส่งครั้งล่าสุด';
        translation['dqf.sublist.record.dunning_allow_email'] = 'อนุญาตอีเมล';
        translation['dqf.sublist.record.dunning_allow_print'] = 'อนุญาตการพิมพ์';
        translation['dqf.sublist.record.pause_dunning'] = 'หยุดการแจ้งหนี้ชั่วคราว';
        translation['dqf.sublist.common.evaluation_date'] = 'วันที่ประเมิน';
        translation['dqf.sublist.common.related_entity'] = 'ผู้รับ';
        translation['dbu.form.title'] = 'การอัพเดตเร็กคอร์ดลูกค้าปริมาณมากสำหรับการแจ้งหนี้';
        translation['dbu.form.update_button'] = 'อัพเดต';
        translation['dbu.form.field.subsidiary'] = 'บริษัทในเครือ';
        translation['dbu.form.flh.subsidiary'] = 'เลือกบริษัทในเครือที่คุณต้องการทำการอัพเดตจำนวนมากสำหรับฟิลด์การแจ้งหนี้บนเร็กคอร์ดลูกค้า อัพเดตจะถูกนำไปใช้กับเร็กคอร์ดลูกค้าทั้งหมดที่เป็นของบริษัทในเครือที่เลือก';
        translation['dbu.form.field.allow_email'] = 'อนุญาตให้อีเมลจดหมาย';
        translation['dbu.form.flh.allow_email'] = 'เลือกค่าที่จะนำไปใช้กับฟิลด์นี้บนเร็กคอร์ดลูกค้าหลังจากทำการอัพเดตจำนวนมาก:\nไม่เปลี่ยนแปลง – ค่าปัจจุบันของฟิลด์จะไม่เปลี่ยนแปลง \nทำเครื่องหมายแล้ว – กล่องจะถูกทำเครื่องหมายบนเร็กคอร์ดลูกค้าหลังจากการอัพเดตจำนวนมาก \nไม่ได้ทำเครื่องหมาย - กล่องจะถูกล้างหลังจากอัพเดตจำนวนมาก';
        translation['dbu.form.field.allow_print'] = 'อนุญาตให้พิมพ์จดหมาย';
        translation['dbu.form.flh.allow_print'] = 'เลือกค่าที่จะนำไปใช้กับฟิลด์นี้บนเร็กคอร์ดลูกค้าหลังจากทำการอัพเดตจำนวนมาก:\nไม่เปลี่ยนแปลง – ค่าปัจจุบันของฟิลด์จะไม่เปลี่ยนแปลง \nทำเครื่องหมายแล้ว – กล่องจะถูกทำเครื่องหมายบนเร็กคอร์ดลูกค้าหลังจากการอัพเดตจำนวนมาก \nไม่ได้ทำเครื่องหมาย - กล่องจะถูกล้างหลังจากอัพเดตจำนวนมาก';
        translation['dbu.form.field.dont_send_cust_email'] = 'อย่าส่งจดหมายถึงอีเมลลูกค้า';
        translation['dbu.form.flh.dont_send_cust_email'] = 'เลือกค่าที่จะนำไปใช้กับฟิลด์นี้บนเร็กคอร์ดลูกค้าหลังจากทำการอัพเดตจำนวนมาก:\nไม่เปลี่ยนแปลง – ค่าปัจจุบันของฟิลด์จะไม่เปลี่ยนแปลง \nทำเครื่องหมายแล้ว – กล่องจะถูกทำเครื่องหมายบนเร็กคอร์ดลูกค้าหลังจากการอัพเดตจำนวนมาก \nไม่ทำเครื่องหมาย - กล่องจะถูกล้างหลังจากอัพเดตจำนวนมาก';
        translation['dbu.form.primary_field_group'] = 'เกณฑ์';
        translation['dbu.form.bulk_update_field_group'] = 'ฟิลด์อัพเดตจำนวนมาก';
        translation['dbu.form.options.unchanged'] = '- ไม่เปลี่ยนแปลง -';
        translation['dbu.form.options.checked'] = 'ทำเครื่องหมายแล้ว';
        translation['dbu.form.options.not_checked'] = 'ไม่ได้ทำเครื่องหมาย';
        translation['dbu.validation.no_selection'] = 'ไม่มีฟิลด์ที่จะอัพเดตเนื่องจากได้เลือก - ไม่เปลี่ยนแปลง - สำหรับฟิลด์ทั้งหมด สามารถทำการอัพเดตจำนวนมากได้ ถ้าระบุการเปลี่ยนแปลงในฟิลด์อย่างน้อยหนึ่งฟิลด์ (ทำเครื่องหมายแล้ว หรือไม่ได้ทำเครื่องหมาย)';
        translation['dbu.validation.no_sending_media'] = 'ไม่สามารถบันทึกเร็กคอร์ดลูกค้าได้ ถ้าไม่ได้ทำเครื่องหมายในกล่องอนุญาตให้อีเมลจดหมาย และกล่องอนุญาตให้พิมพ์จดหมาย เลือกทำอย่างน้อยหนึ่งเครื่องหมายในฟิลด์ต่อไปนี้\n- อนุญาตให้อีเมลจดหมาย\n- อนุญาตให้พิมพ์จดหมาย';
        translation['dbu.validation.verify_submit_ow'] = 'เร็กคอร์ดลูกค้าที่มีขั้นตอนการแจ้งหนี้ทั้งหมดจะถูกอัพเดตสำหรับบริษัทในเครือที่เลือก {SUBSIDIARY} คุณจะได้รับข้อความอีเมลแจ้ง เมื่อขั้นตอนเสร็จเรียบร้อยแล้ว คุณแน่ใจว่าต้องการดำเนินการอัพเดตจำนวนมากหรือไม่ ถ้าคุณคลิก ตกลง ขั้นตอนการอัพเดตจำนวนมากจะเริ่มขึ้น และไม่สามารถย้อนกลับได้';
        translation['dbu.validation.verify_submit_si'] = 'เร็กคอร์ดลูกค้าที่มีขั้นตอนการแจ้งหนี้ทั้งหมดจะถูกอัพเดต คุณจะได้รับข้อความอีเมลแจ้ง เมื่อขั้นตอนเสร็จเรียบร้อยแล้ว คุณแน่ใจว่าต้องการดำเนินการอัพเดตจำนวนมากหรือไม่ ถ้าคุณคลิก ตกลง ขั้นตอนการอัพเดตจำนวนมากจะเริ่มขึ้น และไม่สามารถย้อนกลับได้';
        translation['dbu.form.reminderinlinehelp'] = 'NetSuite แนะนำให้คุณใช้คุณลักษณะการอัพเดตจำนวนมากนอกเวลาทำการของคุณ ทั้งนี้เพื่อให้แน่ใจว่าผู้ใช้รายอื่นในบริษัทของคุณจะไม่อัพเดตเร็กคอร์ดลูกค้าระหว่างขั้นตอนการอัพเดตจำนวนมาก';
        translation['dbu.validation.validate_concurrency_ow'] = 'การอัพเดตเร็กคอร์ดลูกค้าจนวนมากสำหรับการแจ้งหนี้ถูกเตรียมใช้งานโดย {USER} สำหรับบริษัทในเครือ  {SUBSIDIARY} การอัพเดตจำนวนมากจะต้องเสร็จสิ้นก่อน คุณจึงจะสามารถทำการอัพเดตจำนวนมากสำหรับลูกค้าในบริษัทในเครือเดียวกันได้';
        translation['dbu.validation.validate_concurrency_si'] = 'ระบบสามารถเรียกใช้การอัพเดตจำนวนมากได้ครั้งละหนึ่งรายการเท่านั้น ขณะนี้การอัพเดตจำนวนมากที่เตรียมใช้งานโดย {USER} กำลังทำงาน';
        translation['dbu.customer.message.complete_subject'] = 'การอัพเดตเร็กคอร์ดลูกค้าจำนวนมากสำหรับการแจ้งหนี้';
        translation['dbu.customer.message.complete_body_ow'] = [
          'คำทักทายจาก NetSuite<br />',
          'การอัพเดตเร็กคอร์ดลูกค้าจำนวนมากสำหรับการแจ้งหนี้เสร็จสิ้นแล้วสำหรับบริษัทในเครือ  {SUBSIDIARY} ',
          'อนุญาตให้อีเมลจดหมาย = {ALLOW_EMAIL}',
          'อนุญาตให้พิมพ์จดหมาย = {ALLOW_PRINT}',
          'อย่าส่งจดหมายถึงอีเมลลูกค้า = {DONT_SEND_TO_CUST}<br />',
          'จำนวนเร็กคอร์ดลูกค้าที่อัพเดตแล้ว: {PROCESSED_RECORDS} จาก {RECORD_COUNT}{ERROR_STEPS}',
          'นี่คืออีเมลที่ระบบสร้างขึ้น<br />',
          'ขอบคุณ',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.complete_body_si'] = [
          'คำทักทายจาก NetSuite<br />',
          'การอัพเดตเร็กคอร์ดลูกค้าจำนวนมากสำหรับการแจ้งหนี้เสร็จสิ้นแล้ว',
          'อนุญาตให้อีเมลจดหมาย = {ALLOW_EMAIL}',
          'อนุญาตให้พิมพ์จดหมาย = {ALLOW_PRINT}',
          'อย่าส่งจดหมายถึงอีเมลลูกค้า = {DONT_SEND_TO_CUST}<br />',
          'จำนวนเร็กคอร์ดลูกค้าที่อัพเดตแล้ว: {PROCESSED_RECORDS} จาก {RECORD_COUNT}{ERROR_STEPS}',
          'นี่คืออีเมลที่ระบบสร้างขึ้น<br />',
          'ขอบคุณ',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.error_file_header'] = 'ID ลูกค้า, ข้อผิดพลาด';
        translation['dbu.customer.message.error_filename'] = 'Failed Updates.csv';
        translation['dbu.customer.message.error_steps'] = '<br />โปรดดาวน์โหลดไฟล์ที่แนบเพื่อดูรายการเร็กคอร์ดที่ไม่ได้อัพเดต คุณสามารถอัพเดตเร็กคอร์ดเหล่านั้นได้ด้วยตนเอง';
        translation['dc.validateCustomer.noDPMatched'] = 'ไม่พบขั้นตอนการแจ้งหนี้ที่ตรงกับเร็กคอร์ดลูกค้า';
        translation['dc.validateCustomer.recipientNoEmail'] = 'ผู้รับจดหมายแจ้งหนี้ต่อไปนี้ไม่มีที่อยู่อีเมลในเร็กคอร์ดผู้ติดต่อของตน: {CONTACTNAMES} ';
        translation['dc.validateCustomer.customerNoEmail'] = 'ไม่สามารถบันทึกเร็กคอร์ดได้ มีการทำเครื่องหมายที่กล่องอนุญาตให้อีเมลจดหมาย แต่ไม่มีที่อยู่อีเมลของผู้รับที่จะส่งจดหมายไปถึง ในการบันทึกเร็กคอร์ดนี้ เงื่อนไขต่อไปนี้จะต้องเป็นจริง:\n- แท็บย่อยผู้รับการแจ้งหนี้จะต้องมีผู้ติดต่ออย่างน้อยหนึ่งรายที่มีที่อยู่อีเมล\n- ฟิลด์อีเมลบนเร็กคอร์ดลูกค้ามีที่อยู่อีเมล\n\nหมายเหตุ: จำเป็นต้องมีที่อยู่อีเมลของลูกค้าเมื่อไม่ได้ทำเครื่องหมายในกล่องอย่าส่งจดหมายถึงอีเมลลูกค้า เท่านั้น';
        translation['dc.validateCustomer.noEmailAtAll'] = 'ไม่มีที่อยู่อีเมลของผู้รับบนเร็กคอร์ดลูกค้า และไม่ได้กำหนดผู้รับการแจ้งหนี้สำหรับลูกค้ารายนี้ด้วย ป้อนที่อยู่อีเมลบนเร็กคอร์ดลูกค้า หรือเลือกผู้รับจดหมายแจ้งหนี้บนแท็บย่อยการแจ้งหนี้อย่างน้อยหนึ่งคนที่มีที่อยู่อีเมล';
        translation['dc.validateCustomer.recipientListEmpty'] = 'ไม่สามารถบันทึกเร็กคอร์ดได้ มีการทำเครื่องหมายที่กล่องอนุญาตให้อีเมลจดหมาย แต่ไม่มีผู้รับที่จะส่งจดหมายไปถึง ในการบันทึกเร็กคอร์ดนี้ แท็บย่อยผู้รับการแจ้งหนี้จะต้องมีผู้ติดต่ออย่างน้อยหนึ่งรายที่มีที่อยู่อีเมล \n\nหมายเหตุ: จำเป็นต้องมีที่อยู่อีเมลของลูกค้าเมื่อไม่ได้ทำเครื่องหมายในกล่องอย่าส่งจดหมายถึงอีเมลลูกค้า เท่านั้น';
        translation['dc.validateCustomer.dpMatched'] = 'ไม่พบเร็กคอร์ดลูกค้าที่ตรงกับขั้นตอนการแจ้งหนี้ \'{DP}\' คุณต้องการเปลี่ยนขั้นตอนการแจ้งหนี้หรือไม่';
        translation['dc.validateCustomer.dpAllReadyAssigned'] = 'ขั้นตอนการแจ้งหนี้ที่พบเหมือนกันกับขั้นตอนการแจ้งหนี้ที่มอบหมายแล้วในเร็กคอร์ด';
        translation['dc.validateDP.managerRequired'] = 'จำเป็นต้องมีผู้จัดการการแจ้งหนี้';
        translation['dc.validateDP.sendingModeRequired'] = 'อย่างน้อยจะต้องทำเครื่องหมายในหนึ่งในกล่องเหล่านี้\n- อนุญาตให้อีเมลจดหมาย\n- อนุญาตให้พิมพ์จดหมาย';
        translation['dl.validateDL.dlCountExceeded'] = 'คุณมีระดับการแจ้งหนี้เกินจำนวนสูงสุดที่เป็นไปได้แล้ว';
        translation['dl.validateDL.lowerDaysOverDue'] = 'จำนวนวันที่เกินกำหนดจะต้องน้อยกว่า {DAYS} ';
        translation['dl.validateDL.higherDaysOverdue'] = 'จำนวนวันที่เกินกำหนดจะต้องมากกว่า {DAYS} ';
        translation['dl.validateDL.daysOverdueExist'] = 'จำนวนวันที่เกินกำหนด  {DAYS} มีอยู่ในลำดับรายการอื่นแล้ว';
        translation['dl.validateDL.lastRecordDeletion'] = 'คุณสามารถลบเร็กคอร์ดสุดท้ายในรายการได้เท่านั้น';
        translation['dl.validateDL.daysBetSending'] = 'จำนวนวันระหว่างการส่งจดหมายจะต้องมากกว่าหรือเท่ากับ  {DAYS}';
        translation['dl.validateDL.minOutsBalGEZero'] = 'จำนวนเงินคงค้างยอดต่ำสุด อย่างน้อยที่สุดจะต้องเป็นศูนย์ (0)';
        translation['dl.validateDL.daysOverdueLessPrevious'] = 'จำนวนวันที่เกินกำหนดในระดับการแจ้งหนี้ {LEVEL} ({LEVEL_OVERDUE} วัน) จะต้องน้อยกว่าที่อยู่ในระดับการแจ้งหนี้ {PREVLEVEL} ({PREVLEVEL_OVERDUE} วัน)';
        translation['dl.validateDL.dlRequired'] = 'จำเป็นต้องมีระดับการแจ้งหนี้อย่างน้อยหนึ่งระดับ';
        translation['dp.validateDP.editNotAllowed'] = 'คุณไม่ได้รับอนุญาตให้แก้ไขประเภทขั้นตอนการแจ้งหนี้';
        translation['dp.information.possibleMultipleSending'] = 'การปิดใช้งานฟิลด์ช่วงระยะเวลาการแจ้งหนี้ต่ำสุดจะอนุญาตให้บัญชีของคุณส่งจดหมายแจ้งหนี้หลายฉบับถึงลูกค้าเจ้าเดิมได้ในหนึ่งวัน คุณแน่ใจหรือไม่ว่าต้องการปิดใช้งาน';
        translation['dba.pagination.failedPrevPage'] = 'ไม่สามารถไปที่หน้าก่อนหน้า';
        translation['dq.validation.str_send'] = 'ส่ง';
        translation['dq.validation.str_remove'] = 'ลบ';
        translation['dq.validation.str_print'] = 'พิมพ์';
        translation['dq.validation.chooseAction'] = 'โปรดเลือกจดหมายที่จะ';
        translation['dq.validation.removalConfirmation'] = 'คุณแน่ใจหรือไม่ว่าต้องการลบเร็กคอร์ดที่เลือกออกจากคิว';
        translation['dq.pt.dunningQueueTitle'] = 'คิวการแจ้งหนี้';
        translation['dq.pt.source'] = 'ประเภทแหล่งที่มา';
        translation['dq.pt.dunningProcedure'] = 'ขั้นตอนการแจ้งหนี้';
        translation['dq.pt.dunningLevel'] = 'ระดับการแจ้งหนี้';
        translation['dq.pt.lastLetterSent'] = 'จดหมายฉบับสุดท้ายที่ส่ง';
        translation['dq.pt.emailingAllowed'] = 'อนุญาตการส่งอีเมลแล้ว';
        translation['dq.pt.printingAllowed'] = 'อนุญาตการพิมพ์แล้ว';
        translation['dq.pt.send'] = 'ส่ง';
        translation['dq.pt.remove'] = 'ลบ';
        translation['dq.pt.print'] = 'พิมพ์';
        translation['dq.pt.customer'] = 'ลูกค้า';
        translation['dt.validator.invalidDefault'] = 'จะต้องเลือกเท็มเพลตค่าดีฟอลต์สำหรับแต่ละประเภทเท็มเพลตการแจ้งหนี้ ตรวจสอบแท็บย่อยอีเมลและ PDF และเลือกเท็มเพลตค่าดีฟอลต์';
        translation['dt.validator.duplicateLanguage'] = 'ภาษานี้ถูกใช้สำหรับประเภทเท็มเพลตนี้แล้ว';
        translation['dt.validator.noTemplateDocs'] = 'ในการบันทึกเร็กคอร์ดนี้ จะตองมีเอกสารเท็มเพลตอีเมลหนึ่งอันและเอกสารเท็มเพลต PDF หนึ่งอัน';
        translation['dt.validator.subject'] = 'การตรวจสอบเท็มเพลตเอกสารการแจ้งหนี้ล้มเหลว';
        translation['dt.validator.body'] = 'เอกสารเท็มเพลตต่อไปนี้ไม่ถูกต้อง:';
        translation['dt.validator.defaultDeletion'] = 'คุณกำลังพยายามลบเท็มเพลตที่ถูกตั้งเป็นค่าดีฟอลต์ ในการลบเท็มเพลตนี้ ก่อนอื่น คุณจะต้องเลือกเท็มเพลตอื่นเป็นเท็มเพลตค่าดีฟอลต์เสียก่อน';
        translation['dt.validator.xmlEmailDeprecated'] = 'คุณไม่สามารถเพิ่ม แก้ไข หรือลบลำดับรายการเท็มเพลตอีเมล XML กำลังยุติเท็มเพลตอีเมลการแจ้งหนี้ตาม XML ถ้าคุณเพิ่มแท็บย่อยเท็มเพลตอีเมลการแจ้งหนี้ การบันทึกเร็กคอร์ดนี้จะลบลำดับรายการทั้งหมดบนแท็บย่อยเท็มเพลตอีเมล XML การแจ้งหนี้';
        translation['dt.validator.deleteAllXMLLines'] = 'การบันทึกเร็กคอร์ดนี้จะลบลำดับรายการทั้งหมดบนแท็บย่อยเท็มเพลตอีเมลแจ้งหนี้ XML';
        translation['dt.validator.noEMailDocs'] = 'จะต้องมีอย่างน้อยหนึ่งเท็มเพลตอีเมลเพื่อบันทึกเร็กคอร์ดนี้';
        translation['dt.validator.noPDFDocs'] = 'จะต้องมีอย่างน้อยหนึ่งเท็มเพลต PDF เพื่อบันทึกเร็กคอร์ดนี้';
        translation['dt.validator.multipleDefault'] = 'คุณแน่ใจหรือไม่ว่าต้องการใช้เท็มเพลตนี้เป็นค่าดีฟอลต์';
        translation['dlr.validateDLR.noAmount'] = 'กฎระดับการแจ้งหนี้ควรจะมีจำนวนของกฎระดับการแจ้งหนี้อย่างน้อยหนึ่งจำนวน';
        translation['dlr.validateDLR.noDefaultAmount'] = 'กฎระดับการแจ้งหนี้ควรจะมีจำนวนของกฎระดับการแจ้งหนี้อย่างน้อยหนึ่งจำนวนซึ่งกำหนดเป็นจำนวนค่าดีฟอลต์';
        translation['dlr.validateDLR.duplicateCurrency'] = 'สกุลเงินจะต้องไม่ซ้ำกัน';
        translation['dlr.validateDLR.invalidAmount'] = 'จำนวนจะต้องมากกว่าหรือเท่ากับ 0';
        translation['dlr.validateDLR.changeDefaultCurrency'] = 'คุณแน่ใจหรือไม่ว่าต้องการใช้สกุลเงินและจำนวนเงินของลำดับรายการเป็นค่าดีฟอลต์ (นี่จะเปลี่ยนจำนวนเงินและสกุลเงินที่เป็นค่าดีฟอลต์)';
        translation['dlr.validateDLR.negativeDaysOverdue'] = 'ฟิลด์จำนวนวันที่เลยกำหนดเวลามีจำนวนที่เป็นลบ นี่จะส่งจดหมายถึงลูกค้าก่อนที่จะครบกำหนดชำระเงิน';
        translation['dlr.validateDLR.daysOverdueChanged'] = 'การเปลี่ยนค่าของวันที่เกินกำหนดชำระเงินในกฎระดับการเร่งรัดหนี้อาจเปลี่ยนแปลงการเรียงลำดับ หรือลำดับของระดับการเร่งรัดหนี้ ซึ่งอาจส่งผลให้ทำการส่งจดหมายเร่งรัดหนี้ที่ไม่เหมาะสม ดังนั้นเราขอแนะนำให้คุณตรวจสอบลำดับของระดับการเร่งรัดหนี้บนทุกๆ ขั้นตอนการเร่งรัดหนี้ ({DP_LIST}) หากระดับการเร่งรัดหนี้ที่คุณต้องการเปลี่ยนอยู่ระหว่างใช้งาน';
        translation['dlr.validateDLR.cannotAddCurrency'] = 'ไม่สามารถเพิ่มสกุลเงิน เนื่องจากไม่ได้เปิดใช้งานคุณลักษณะหลายสกุลเงิน';
        translation['der.flh.dunningProcedure'] = 'ฟิลด์นี้ระบุขั้นตอนการแจ้งหนี้ที่กำหนดให้ใบแจ้งหนี้หรือลูกค้า';
        translation['der.flh.dunningLevel'] = 'ฟิลด์นี้ระบุระดับการแจ้งหนี้หลังจากการประเมิน';
        translation['der.flh.relatedEntity'] = 'ฟิลด์นี้ถูกเชื่อมโยงกับเอนทิตีหรือเร็กคอร์ดผู้ติดต่อของผู้รับการแจ้งหนี้แล้ว';
        translation['der.flh.messageContent'] = 'ฟิลด์นี้ประกอบด้วยเนื้อหาของจดหมายแจ้งหนี้';
        translation['der.flh.invoiceList'] = 'ฟิลด์นี้แสดงรายการใบแจ้งหนี้ที่เกี่ยวข้องกับจดหมายแจ้งหนี้';
        translation['der.flh.emailRecipient'] = 'ฟิลด์นี้แสดงที่อยู่อีเมลของผู้รับจดหมายแจ้งหนี้';
        translation['der.flh.subject'] = 'ฟิลด์นี้แสดงบรรทัดหัวข้อของจดหมายแจ้งหนี้';
        translation['der.flh.dunningManager'] = 'ฟิลด์นี้แสดงผู้จัดการการแจ้งหนี้ที่กำหนดให้ลูกค้า และถูกเชื่อมโยงกับเร็กคอร์ดพนักงานของผู้จัดการการแจ้งหนี้ด้วย';
        translation['der.flh.dunningTemplate'] = 'ฟิลด์นี้ถูกเชื่อมโยงกับเร็กคอร์ดเท็มเพลตการแจ้งหนี้แล้ว';
        translation['der.flh.customer'] = 'ฟิลด์นี้ถูกเชื่อมโยงกับเร็กคอร์ดลูกค้าแล้ว';
        translation['der.flh.status'] = 'ฟิลด์นี้ระบุว่าส่งอีเมลสำเร็จหรือไม่ สถานะจะเป็นหนึ่งในต่อไปนี้:\n\n• ส่งแล้ว - ส่งอีเมลสำเร็จ\n• ล้มเหลว - ระบบไม่สามารถส่งอีเมลได้เนื่องจากข้อมูลไม่ครบ ตัวอย่างคือ เมื่อไม่มีที่อยู่่อีเมลสำหรับลูกค้าหรือผู้ติดต่อ\n• อยู่ในคิวแล้ว - จดหมายแจ้งหนี้ยังคงอยู่ในคิวการแจ้งหนี้ และยังไม่ได้ถูกประมวลผล\n• ถูกลบแล้ว - ผู้จัดการการแจ้งหนี้ลบเร็กคอร์ดนี้จากคิวการแจ้งหนี้แล้ว';
        translation['dlr.flh.daysOverdue'] = 'ใส่จำนวนวันที่เลยวันครบกำหนดชำระเงิน เมื่อจำเป็นต้องส่งจดหมายแจ้งหนี้ ในการส่งจดหมายก่อนถึงวันครบกำหนด ให้ป้อนตัวเลขเป็นจำนวนลบ';
        translation['ds.flh.description'] = 'ใส่คำอธิบายสำหรับเร็กคอร์ดนี้';
        translation['dp.flh.dunningProcedure'] = 'ใส่ชื่อสำหรับขั้นตอนการแจ้งหนี้นี้';
        translation['dp.flh.description'] = 'ใส่ข้อมูลคำอธิบายสำหรับขั้นตอนการแจ้งหนี้นี้';
        translation['dp.flh.appliesTo'] = 'ทำการเลือกว่าจะกำหนดขั้นตอนการแจ้งหนี้นี้ให้ลูกค้าหรือใบแจ้งหนี้ ถ้าคุณเลือก ลูกค้า คุณจะต้องทำเครื่องหมายหรือยกเลิกการทำเครื่องหมายในกล่อง อนุญาตให้มีการแทนที่';
        translation['dp.flh.sendingSchedule'] = 'เลือกว่าจะส่งจดหมายการแจ้งหนี้โดยอัตโนมัติหรือด้วยตนเอง';
        translation['dp.flh.minimumDunningInterval'] = 'เลือกจำนวนวันระหว่างการส่งจดหมายสองฉบับต่อเนื่องกันถึงลูกค้ารายเดียวกัน วิธีการนี้นำไปใช้กับทั้งการส่งด้วยตนเองและการส่งอัตโนมัติ';
        translation['dp.flh.subsidiary'] = 'เลือกบริษัทสาขาที่จะนำขั้นตอนการแจ้งหนี้นี้ไปใช้';
        translation['dp.flh.savedSearchCustomer'] = 'เลือกการค้นหาลูกค้าที่บันทึกไว้ที่จะนำขั้นตอนนี้ไปใช้';
        translation['dp.flh.allowOverride'] = 'ถ้าคุณทำเครื่องหมายในกล่องนี้ ขั้นตอนการแจ้งหนี้ตามระดับของใบแจ้งหนี้จะสามารถแทนที่ขั้นตอนนี้ได้ ขั้นตอนการแจ้งหนี้ตามระดับของใบแจ้งหนี้จะถูกใช้ ถ้าใบแจ้งหนี้ตรงกับเกณฑ์สำหรับขั้นตอนนั้น โดยไม่คำนึงว่าจะได้กำหนดขั้นตอนการแจ้งหนี้ตามระดับของลูกค้าแล้วหรือไม่';
        translation['dp.flh.department'] = 'เลือกแผนกที่จะนำขั้นตอนนี้ไปใช้';
        translation['dp.flh.class'] = 'เลือกคลาสที่จะนำขั้นตอนนี้ไปใช้';
        translation['dp.flh.location'] = 'เลือกสถานที่ตั้งที่จะนำขั้นตอนนี้ไปใช้';
        translation['dp.flh.savedSearchInvoice'] = 'เลือกการค้นหาใบแจ้งหนี้ที่บันทึกไว้ที่จะนำขั้นตอนนี้ไปใช้';
        translation['dp.flh.assignAutomatically'] = 'ทำเครื่องหมายในกล่องนี้เพื่อให้ระบบกำหนดขั้นตอนการแจ้งหนี้โดยอัตโนมัติให้แก่ลูกค้าหรือใบแจ้งหนี้ ตามเกณฑ์การเลือก';
        translation['dt.flh.name'] = 'ใส่ชื่อสำหรับเท็มเพลตการแจ้งหนี้นี้';
        translation['dt.flh.description'] = 'ใส่ข้อมูลคำอธิบายสำหรับเท็มเพลตการแจ้งหนี้นี้';
        translation['dt.flh.attachStatement'] = 'ทำเครื่องหมายในกล่องทำเครื่องหมายนี้เพื่อแนบรายงานการเงินลูกค้ากับจดหมายการแจ้งหนี้ที่ใช้เท็มเพลตนี้';
        translation['dt.flh.attachInvoiceCopy'] = 'ทำเครื่องหมายในกล่องทำเครื่องหมายนี้เพื่อแนบใบแจ้งหนี้กับจดหมายการแจ้งหนี้ที่ใช้เท็มเพลตนี้';
        translation['dt.flh.overdueInvoiceOnly'] = 'ทำเครื่องหมายในกล่องทำเครื่องหมายนี้ถ้าคุณต้องการแนบใบแจ้งหนี้ที่เกินกำหนดเท่านั้น';
        translation['dt.flh.openTransactionOnly'] = 'ทำเครื่องหมายในกล่องทำเครื่องหมายนี้ถ้าคุณต้องการใช้ธุรกรรมที่เปิดเท่านั้นบนรายงานการเงินลูกค้า';
        translation['dt.flh.inactive'] = 'ทำเครื่องหมายในกล่องนี้เพื่อปิดใช้งานเท็มเพลต เท็มเพลตที่ไม่ได้ใช้งานจะไม่ปรากฏในรายการ และไม่สามารถใช้ในการส่งจดหมายแจ้งหนี้ได้';
        translation['dc.flh.allowEmail'] = 'ทำเครื่องหมายในกล่องนี้ถ้าคุณต้องการให้อีเมลจดหมายแจ้งหนี้';
        translation['dc.flh.lastLetterSent'] = 'วันที่ส่งจดหมายแจ้งหนี้ครั้งล่าสุด';
        translation['dc.flh.dunningLevel'] = 'ฟิลด์นี้แสดงระดับการแจ้งหนี้ปัจจุบันตั้งแต่การประเมินการแจ้งหนี้ครั้งล่าสุด';
        translation['dc.flh.dunningManager'] = 'เลือกบุคคลที่รับผิดชอบของการแจ้งหนี้สำหรับลูกค้ารายนี้ และชื่อของผู้ที่ควรปรากฏเป็นผู้ส่งในจดหมายแจ้งหนี้';
        translation['dc.flh.dunningProcedure'] = 'ฟิลด์นี้แสดงขั้นตอนการแจ้งหนี้ที่กำหนดให้ลูกค้า ถ้าคุณคลิก กำหนดอัตโนมัติ ระบบจะกำหนดขั้นตอนที่เหมาะสมโดยยึดตามเกณฑ์การเลือกการแจ้งหนี้ เลือกค่าต่าง ๆ จากรายการแบบดึงลงเพื่อเปลี่ยนขั้นตอนการแจ้งหนี้ที่กำหนดให้ลูกค้า รายการแบบดึงลงจะแสดงเฉพาะขั้นตอนการแจ้งหนี้ที่ใช้กับลูกค้ารายนี้ได้ตามเกณฑ์การเลือกที่กำหนดบนเร็กคอร์ดขั้นตอนการแจ้งหนี้เท่านั้น';
        translation['dc.flh.allowPrint'] = 'ทำเครื่องหมายในกล่องนี้ถ้าคุณต้องการให้พิมพ์จดหมายแจ้งหนี้';
        translation['dc.flh.pauseReason'] = 'เลือกเหตุผลสำหรับระบุว่าทำไมจึงหยุดการแจ้งหนี้ชั่วคราว';
        translation['dc.flh.pauseReasonDetail'] = 'เลือกรายละเอียดสำหรับระบุว่าทำไมจึงหยุดการแจ้งหนี้ชั่วคราว';
        translation['dc.flh.pauseDunning'] = 'ทำเครื่องหมายในกล่องนี้เพื่อหยุดขั้นตอนการแจ้งหนี้ชั่วคราว';
        translation['dc.flh.dunningRecepients'] = 'เลือกผู้รับการแจ้งหนี้เพิ่มเติม';
        translation['dc.flh.allowEmail'] = 'ทำเครื่องหมายในกล่องนี้ถ้าคุณต้องการให้อีเมลจดหมายแจ้งหนี้';
        translation['di.flh.lastLetterSent'] = 'วันที่ส่งจดหมายแจ้งหนี้ครั้งล่าสุด';
        translation['di.flh.dunningLevel'] = 'ฟิลด์นี้แสดงระดับการแจ้งหนี้ปัจจุบันตั้งแต่การประเมินการแจ้งหนี้ครั้งล่าสุด';
        translation['di.flh.dunningManager'] = 'เลือกบุคคลที่รับผิดชอบการแจ้งหนี้สำหรับใบแจ้งหนี้ใบนี้ และชื่อของผู้ที่ควรปรากฏเป็นผู้ส่งในจดหมายแจ้งหนี้';
        translation['di.flh.dunningProcedure'] = 'ฟิลด์นี้แสดงขั้นตอนการแจ้งหนี้ที่กำหนดให้ใบแจ้งหนี้หรือลูกค้า ถ้าคุณคลิก กำหนดอัตโนมัติ ระบบจะกำหนดขั้นตอนที่เหมาะสมโดยยึดตามเกณฑ์การเลือกการแจ้งหนี้ เลือกค่าต่าง ๆ จากรายการแบบดึงลงเพื่อเปลี่ยนขั้นตอนการแจ้งหนี้ที่กำหนดให้ใบแจ้งหนี้ รายการแบบดึงลงจะแสดงเฉพาะขั้นตอนการแจ้งหนี้ที่ใช้กับใบแจ้งหนี้ใบนี้ได้ตามเกณฑ์การเลือกที่กำหนดบนเร็กคอร์ดขั้นตอนการแจ้งหนี้เท่านั้น';
        translation['di.flh.allowPrint'] = 'ทำเครื่องหมายในกล่องนี้ถ้าคุณต้องการให้พิมพ์จดหมายแจ้งหนี้';
        translation['di.flh.pauseReason'] = 'เลือกเหตุผลสำหรับระบุว่าทำไมจึงหยุดการแจ้งหนี้ชั่วคราว';
        translation['di.flh.pauseReasonDetail'] = 'เลือกรายละเอียดเหตุผลสำหรับระบุว่าทำไมจึงหยุดการแจ้งหนี้ชั่วคราว';
        translation['di.flh.pauseDunning'] = 'ทำเครื่องหมายในกล่องนี้เพื่อหยุดขั้นตอนการแจ้งหนี้ชั่วคราว';
        translation['dp.validate.unpause'] = 'การล้างกล่องหยุดการแจ้งหนี้ชั่วคราวจะทริกเกอร์เวิร์กโฟลว์การประเมินการแจ้งหนี้ทันที NetSuite อาจส่งจดหมายแจ้งหนี้ถึงลูกค้ารายนี้ โดยขึ้นอยู่กับผลลัพธ์การประเมินการแจ้งหนี้ คุณแน่ใจหรือไม่ว่าต้องการเริ่มการแจ้งหนี้อีกครั้ง';
        translation['dc.validateSubsidiary.existingConfigSubsidiary'] = 'มีเร็กคอร์ดการกำหนดค่าการแจ้งหนี้สำหรับบริษัทในเครือนี้อยู่แล้ว';
        translation['l10n.address.invalidPOBox'] = 'โปรดใส่หมายเลขตู้ไปรษณีย์ที่ถูกต้อง';
        translation['l10n.address.invalidZipCode'] = 'โปรดใส่รหัสไปรษณีย์ที่ถูกต้อง';
        translation['l10n.address.invalidRuralRoute'] = 'โปรดใส่เลขเส้นทางหลวงชนบทที่ถูกต้อง';
        translation['l10n.accessForDDandAccountant'] = 'มีเพียง Role ผู้ดูแลระบบ ผู้อำนวยการแจ้งหนี้ และนักบัญชีเท่านั้นที่สามารถสร้างและแก้ไขเร็กคอร์ดประเภทนี้ได้';
        translation['l10n.deleteAccessForDDandAccountant'] = 'มีเพียง Role ผู้ดูแลระบบ ผู้อำนวยการแจ้งหนี้ และนักบัญชีเท่านั้นที่สามารถลบเร็กคอร์ดประเภทนี้ได้';
        translation['l10n.accessForAdministrator'] = 'มีเพียง Role ผู้ดูแลระบบเท่านั้นที่สามารถสร้างและแก้ไขเร็กคอร์ดประเภทนี้ได้';
        translation['l10n.deleteAccessForAdministrator'] = 'มีเพียง Role ผู้ดูแลระบบเท่านั้นที่สามารถลบเร็กคอร์ดประเภทนี้ได้';
        translation['l10n.noPagePrivilege'] = 'คุณไม่มีสิทธิพิเศษในการดูหน้านี้';
        translation['dq.pdfemail.folderName'] = 'จดหมายแจ้งหนี้ในรูปแบบ PDF ที่จะทำการพิมพ์';
        translation['dq.pdfemail.subject'] = 'จดหมายในรูปแบบ PDF ที่สร้างไว้พร้อมสำหรับการพิมพ์ในตู้ไฟล์แล้ว';
        translation['dq.pdfemail.link'] = 'คลิกลิงก์เพื่อดูโฟลเดอร์ของจดหมายในรูปแบบ PDF';
        translation['dq.pdfemail.tableHead'] = 'ตารางต่อไปนี้แสดงรายละเอียดของโฟลเดอร์ที่จัดเก็บไฟล์ PDF';
        translation['dq.pdfemail.exceedLimit'] = 'ไม่สามารถแนบไฟล์ที่สร้างไว้ได้เนื่องจากเกินขีดจำกัดการแนบไฟล์';
        translation['dq.pdfemail.tableLabel1'] = 'โฟลเดอร์';
        translation['dq.pdfemail.tableLabel2'] = 'เส้นทาง';
        translation['dq.pdfemail.tableLabel3'] = 'สถานะ';
        translation['dq.pdfemail.tableLabel4'] = 'หมายเหตุ';

        break;

      case 'tr_TR':
      case 'tr-TR':
        translation['dsa.response.none_found'] = 'Kullanılabilir dunning yordamı yok.';
        translation['form.dunning_template.title'] = 'Dunning Şablonu';
        translation['field.template.name'] = 'Ad';
        translation['field.template.description'] = 'Açıklama';
        translation['field.template.attachStatement'] = 'Bildirim Ekle';
        translation['field.template.overdue_invoices_stmt'] = 'Yalnızca Bildirimde Bulunan Geciken Faturalar';
        translation['field.template.inactive'] = 'Etkin Değil';
        translation['field.template.attach_invoice_copy'] = 'Faturaların Kopyalarını Ekle';
        translation['field.template.only_overdue_invoices'] = 'Yalnızca Geciken Faturalar';
        translation['field.template.subject'] = 'Konu';
        translation['selection.template.savedsearch'] = 'Kayıtlı Arama';
        translation['selection.template.searchcolumn'] = 'Arama Sütunu';
        translation['label.template.lettertext'] = 'Mektup Metni';
        translation['dba.form.title'] = 'Dunning Toplu Ataması';
        translation['dba.form.source'] = 'Şunun için Uygulanır:';
        translation['dba.form.procedure'] = 'Dunning Yordamı';
        translation['dba.form.source.help'] = 'Şunun için Uygulanır:';
        translation['dba.form.procedure.help'] = 'Dunning Yordamı';
        translation['dba.form.dunning_manager'] = 'Dunning Yöneticisi';
        translation['dba.form.dunning_manager.help'] = 'Dunning Yöneticisi';
        translation['dba.tab.invoice'] = 'Faturalar';
        translation['dba.sublist.invoice'] = 'Faturalar';
        translation['dba.tab.customer'] = 'Müşteriler';
        translation['dba.sublist.customer'] = 'Müşteriler';
        translation['dba.sublist.common.id'] = 'Kimlik';
        translation['dba.sublist.common.customer'] = 'Müşteri';
        translation['dba.sublist.invoice.invoice'] = 'Fatura';
        translation['dba.sublist.invoice.amount'] = 'Tutar';
        translation['dba.sublist.invoice.currency'] = 'Para Birimi';
        translation['dba.sublist.invoice.duedate'] = 'Vade Tarihi';
        translation['dba.sublist.invoice.days_overdue'] = 'Vade Aşımı Gün Sayısı';
        translation['dba.sublist.customer.subsidiary'] = 'Bağlı Kuruluş';
        translation['dba.sublist.common.assign_dunning'] = 'Ata';
        translation['dba.sublist.common.dunning_procedure'] = 'Dunning Yordamı';
        translation['dba.sublist.common.dunning_level'] = 'Dunning Seviyesi';
        translation['dba.sublist.common.last_letter_sent'] = 'Son Mektup Gönderme Tarihi';
        translation['dba.sublist.common.dunning_sending_type'] = 'Gönderme Türü';
        translation['dba.sublist.common.page_next'] = '>';
        translation['dba.sublist.common.page_previous'] = '<';
        translation['dba.sublist.common.page_option'] = '{startIndex} - {endIndex} /  {totalEntryCount}';
        translation['dba.form.restriction'] = 'Seçim Ölçütü';
        translation['dba.form.selection'] = 'Dunning Yordamı Seçimi';
        translation['dba.form.restriction.subsidiary'] = 'Bağlı Kuruluşlar';
        translation['dba.form.restriction.location'] = 'Konumlar';
        translation['dba.form.restriction.dept'] = 'Departmanlar';
        translation['dba.form.restriction.class'] = 'Sınıflar';
        translation['dba.form.restriction.search'] = 'Kayıtlı Arama';
        translation['dba.form.action.assign'] = 'Ata';
        translation['dba.form.action.assign_customer'] = 'Müşterilere Ata';
        translation['dba.form.action.assign_invoice'] = 'Faturalara Ata';
        translation['dba.form.action.cancel'] = 'İptal';
        translation['dba.form.notification.highnumberofrecord'] = 'Bu isteğin tamamlanması birkaç saniye sürebilir. Dunning Yordamı sayfasına yönlendirilene kadar lütfen bekleyin.';
        translation['dqf.form.action.send'] = 'Gönder';
        translation['dqf.form.action.print'] = 'Yazdır';
        translation['dqf.form.action.remove'] = 'Kaldır';
        translation['dqf.form.send.title'] = 'Dunning E-posta Gönderme Kuyruğu';
        translation['dqf.form.print.title'] = 'Dunning PDF Yazdırma Kuyruğu';
        translation['dqf.filter.fieldGroup'] = 'Filtreler';
        translation['dqf.filter.inlineHelp'] = 'Aramanın daha belirli olması veya görüntülenecek sonuçları daraltmak için filtreleri kullanın.';
        translation['dqf.filter.applyFiltersButton'] = 'Ara';
        translation['dqf.filter.customer'] = 'Müşteri';
        translation['dqf.filter.recipient'] = 'Alıcı';
        translation['dqf.filter.procedure'] = 'Dunning Yordamı';
        translation['dqf.filter.dpLevel'] = 'Dunning Seviyesi';
        translation['dqf.filter.appliesTo'] = 'Şunun için Uygulanır:';
        translation['dqf.filter.allowPrint'] = 'Yazdırmaya İzin Ver';
        translation['dqf.filter.allowEmail'] = 'E-postaya İzin Ver';
        translation['dqf.filter.lastLtrSentStart'] = 'En Son Mektup Gönderme Başlangıç Tarihi';
        translation['dqf.filter.lastLtrSentEnd'] = 'En Son Mektup Gönderme Bitiş Tarihi';
        translation['dqf.filter.evalDateStart'] = 'Değerlendirme Başlangıç Tarihi';
        translation['dqf.filter.evalDateEnd'] = 'Değerlendirme Bitiş Tarihi';
        translation['dqf.filter.boolean.yes'] = 'Evet';
        translation['dqf.filter.boolean.no'] = 'Hayır';
        translation['dqf.sublist.send.title'] = 'Dunning E-posta Gönderme Kuyruğu';
        translation['dqf.sublist.print.title'] = 'Dunning PDF Yazdırma Kuyruğu';
        translation['dqf.sublist.common.customer'] = 'Müşteri';
        translation['dqf.sublist.common.mark'] = 'İşaretle';
        translation['dqf.sublist.common.view'] = 'Görüntüle';
        translation['dqf.sublist.common.id'] = 'Kimlik';
        translation['dqf.sublist.dp.applies_to'] = 'Şunun için Uygulanır:';
        translation['dqf.sublist.common.dunning_procedure'] = 'Dunning Yordamı';
        translation['dqf.sublist.common.dunning_level'] = 'Seviye';
        translation['dqf.sublist.record.last_letter_sent'] = 'En Son Gönderilen Mektup';
        translation['dqf.sublist.record.dunning_allow_email'] = 'E-postaya İzin Ver';
        translation['dqf.sublist.record.dunning_allow_print'] = 'Yazdırmaya İzin Ver';
        translation['dqf.sublist.record.pause_dunning'] = 'Dunning‘i Duraklat';
        translation['dqf.sublist.common.evaluation_date'] = 'Değerlendirme Tarihi';
        translation['dqf.sublist.common.related_entity'] = 'Alıcı';
        translation['dbu.form.title'] = 'Dunning Müşteri Kayıtları için Toplu Güncelleme';
        translation['dbu.form.update_button'] = 'Güncelle';
        translation['dbu.form.field.subsidiary'] = 'Bağlı Kuruluş';
        translation['dbu.form.flh.subsidiary'] = 'Müşteri kayıtlarındaki dunning alanlarında toplu güncelleme yapmak istediğiniz bağlı kuruluşu seçin. Güncellemeler, seçili bağlı kuruluşa ait müşteri kayıtlarının tümüne uygulanır.';
        translation['dbu.form.field.allow_email'] = 'Mektupların E-posta ile Gönderilmesine İzin Ver';
        translation['dbu.form.flh.allow_email'] = 'Toplu güncelleme gerçekleştirildikten sonra müşteri kayıtlarında yer alan bu alana uygulanacak değeri seçin:\nDeğiştirilmedi – Alanın geçerli değeri değiştirilmez. \nİşaretli – Kutu, toplu güncellemeden sonra müşteri kayıtlarında işaretlenir. \nİşaretli değil – Kutu, güncellemeden sonra temizlenir.';
        translation['dbu.form.field.allow_print'] = 'Mektupların Yazdırılmasına İzin Ver';
        translation['dbu.form.flh.allow_print'] = 'Toplu güncelleme gerçekleştirildikten sonra müşteri kayıtlarında yer alan bu alana uygulanacak değeri seçin:\nDeğiştirilmedi – Alanın geçerli değeri değiştirilmez. \nİşaretli – Kutu, toplu güncellemeden sonra müşteri kayıtlarında işaretlenir. \nİşaretli değil – Kutu, güncellemeden sonra temizlenir.';
        translation['dbu.form.field.dont_send_cust_email'] = 'Müşteri E-postasına Mektup Gönderme';
        translation['dbu.form.flh.dont_send_cust_email'] = 'Toplu güncelleme gerçekleştirildikten sonra müşteri kayıtlarında yer alan bu alana uygulanacak değeri seçin:\nDeğiştirilmedi – Alanın geçerli değeri değiştirilmez. \nİşaretli – Kutu, toplu güncellemeden sonra müşteri kayıtlarında işaretlenir. \nİşaretli değil – Kutu, güncellemeden sonra temizlenir.';
        translation['dbu.form.primary_field_group'] = 'Ölçüt';
        translation['dbu.form.bulk_update_field_group'] = 'Alanları Toplu Güncelle';
        translation['dbu.form.options.unchanged'] = '- Değiştirilmedi -';
        translation['dbu.form.options.checked'] = 'İşaretlendi';
        translation['dbu.form.options.not_checked'] = 'İşaretlenmedi';
        translation['dbu.validation.no_selection'] = 'Tüm alanlar için - Değiştirilmedi - seçeneği belirlendiğinden güncelleştirilecek alan yok. En az bir alanda bir değişiklik belirtildiğinde toplu güncelleme gerçekleştirilemez.';
        translation['dbu.validation.no_sending_media'] = 'Hem Mektupların E-posta ile Gönderilmesine İzin Ver kutusu hem de Mektupların Yazdırılmasına İzin Ver kutusu işaretli değilse müşteri kayıtları kaydedilemez. Şu alanların birinde veya her ikisinde İşaretli seçeneğini belirleyin:\n- Mektupların E-posta ile Gönderilmesine İzin Ver \n- Mektupların Yazdırılmasına İzin Ver';
        translation['dbu.validation.verify_submit_ow'] = 'Dunning yordamlarını içeren tüm müşteri kayıtları seçili bağlı kuruluş {SUBSIDIARY} için güncellenir. İşlem tamamlandığında bir e-posta mesajı alacaksınız. Toplu güncellemeye devam etmek istediğinizden emin misiniz? Tamam‘a tıkladığınızda toplu güncelleme işlemi başlatılır, bu işlem geri alınamaz.';
        translation['dbu.validation.verify_submit_si'] = 'Dunning yordamlarını içeren tüm müşteri kayıtları güncellenir. İşlem tamamlandığında bir e-posta mesajı alacaksınız. Toplu güncellemeye devam etmek istediğinizden emin misiniz? Tamam‘a tıkladığınızda toplu güncelleme işlemi başlatılır, bu işlem geri alınamaz.';
        translation['dbu.form.reminderinlinehelp'] = 'NetSuite, toplu güncelleme özelliğini çalışma saatleriniz dışında kullanmanızı önerir. Bunun amacı, toplu güncelleme işlemi sırasında şirketinizdeki diğer kullanıcıların müşteri kayıtlarını güncellemediğinden emin olmaktır.';
        translation['dbu.validation.validate_concurrency_ow'] = ' {USER} kullanıcısı tarafından  {SUBSIDIARY} bağlı kuruluşu için dunning müşteri kayıtlarını toplu güncelleme işlemi başlatıldı. Aynı bağlı kuruluş müşterilerine yönelik başka bir toplu güncelleme gerçekleştirebilmeniz için toplu güncellemenin tamamlanması gerekiyor.';
        translation['dbu.validation.validate_concurrency_si'] = 'Sistem aynı anda yalnızca bir toplu güncelleme çalıştırabilir. Şu anda {USER} kullanıcısı tarafından başlatılan bir toplu güncelleme çalıştırılıyor.';
        translation['dbu.customer.message.complete_subject'] = 'Dunning Müşteri Kayıtları için Toplu Güncelleme';
        translation['dbu.customer.message.complete_body_ow'] = [
          'NetSuite‘ten selamlar.<br />',
          ' {SUBSIDIARY} bağlı kuruluşu için dunning müşteri kayıtlarının toplu güncellemesi tamamlandı.',
          'Mektupların E-posta ile Gönderilmesine İzin Ver = {ALLOW_EMAIL}',
          'Mektupların Yazdırılmasına İzin Ver = {ALLOW_PRINT}',
          'Müşteri e-postasına mektup gönderme = {DONT_SEND_TO_CUST}<br />',
          'Güncelleştirilen müşteri kaydı sayısı: {PROCESSED_RECORDS} /  {RECORD_COUNT}.{ERROR_STEPS}',
          'Bu sistem tarafından oluşturulmuş bir e-postadır.<br />',
          'Teşekkür ederiz,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.complete_body_si'] = [
          'NetSuite‘ten selamlar.<br />',
          'Dunning için müşteri kayıtlarının toplu güncellemesi tamamlandı.',
          'Mektupların E-posta ile Gönderilmesine İzin Ver = {ALLOW_EMAIL}',
          'Mektupların Yazdırılmasına İzin Ver = {ALLOW_PRINT}',
          'Müşteri e-postasına mektup gönderme = {DONT_SEND_TO_CUST}<br />',
          'Güncelleştirilen müşteri kaydı sayısı: {PROCESSED_RECORDS} /  {RECORD_COUNT}.{ERROR_STEPS}',
          'Bu sistem tarafından oluşturulmuş bir e-postadır.<br />',
          'Teşekkür ederiz,',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.error_file_header'] = 'Müşteri Kimliği, Hata';
        translation['dbu.customer.message.error_filename'] = 'Failed Updates.csv';
        translation['dbu.customer.message.error_steps'] = '<br />Güncellenmeyen kayıtların listesini görüntülemek için ekteki dosyaya başvurun. Bu kayıtları manüel olarak güncelleyebilirsiniz.';
        translation['dc.validateCustomer.noDPMatched'] = 'Müşteri kaydıyla eşleşen dunning yordamı bulunamadı.';
        translation['dc.validateCustomer.recipientNoEmail'] = 'Şu dunning mektubu alıcılarının kişi kayıtlarında bir e-posta adresi yok: {CONTACTNAMES}.';
        translation['dc.validateCustomer.customerNoEmail'] = 'Kayıt kaydedilemez. Mektupların E-posta ile Gönderilmesine İzin Ver kutusu işaretli, ancak mektupların gönderileceği e-posta adresi veya dunning alıcısı yok. Bu kaydı kaydedebilmeniz için şu koşulların gerçekleşmesi gerekir:\n- Dunning Alıcıları alt sekmesinde e-posta adresine sahip olan bir kişi bulunmalıdır.\n- Müşteri kaydındaki E-posta alanında bir e-posta adresi olmalıdır.\n\nNot: Müşterinin e-posta adresi yalnızca Müşteri E-postasına Mektup Gönderme kutusu işaretli değilse gerekir.';
        translation['dc.validateCustomer.noEmailAtAll'] = 'Müşteri kaydında e-posta adresi yok, bu müşteri için bir dunning mektubu alıcısı belirtilmemiş. Müşteri kaydına bir e-posta adresi girin veya Dunning alt sekmesinde e-posta adresine sahip olan en az bir dunning mektubu alıcısı seçin.';
        translation['dc.validateCustomer.recipientListEmpty'] = 'Kayıt kaydedilemez. Mektupların E-posta ile Gönderilmesine İzin Ver kutusu işaretli, ancak mektupların gönderileceği dunning alıcısı yok. Bu kaydı kaydedebilmeniz için Dunning Alıcıları alt sekmesinde e-posta adresi olan en az bir kişi bulunmalıdır. \n\nNot: Müşterinin e-posta adresi yalnızca Müşteri E-postasına Mektup Gönderme kutusu işaretli değilse gerekir.';
        translation['dc.validateCustomer.dpMatched'] = 'Müşteri kaydı, \'{DP}\' dunning yordamıyla eşleşiyor. Dunning yordamını değiştirmek istiyor musunuz?';
        translation['dc.validateCustomer.dpAllReadyAssigned'] = 'Bulunan dunning yordamı, kayda atanmış dunning yordamıyla aynı.';
        translation['dc.validateDP.managerRequired'] = 'Dunning yöneticisi gerekiyor.';
        translation['dc.validateDP.sendingModeRequired'] = 'Şu kutulardan en az birinin işaretli olması gerekiyor:\n- Mektupların E-posta ile Gönderilmesine İzin Ver\n- Mektupların Yazdırılmasına İzin Ver';
        translation['dl.validateDL.dlCountExceeded'] = 'İzin verilen en fazla dunning seviyesi miktarını aştınız.';
        translation['dl.validateDL.lowerDaysOverDue'] = 'Vade aşımı gün sayısı  {DAYS} günden az olmalıdır.';
        translation['dl.validateDL.higherDaysOverdue'] = 'Vade aşımı gün sayısı  {DAYS} günden fazla olmalıdır.';
        translation['dl.validateDL.daysOverdueExist'] = ' {DAYS} vade aşımı gün sayısı başka bir satırda zaten var.';
        translation['dl.validateDL.lastRecordDeletion'] = 'Yalnızca listedeki son kaydı silebilirsiniz.';
        translation['dl.validateDL.daysBetSending'] = 'Gönderilen mektuplar arasındaki gün sayısı {DAYS} günden büyük veya buna eşit olmalıdır.';
        translation['dl.validateDL.minOutsBalGEZero'] = 'Ödenmeyen En Düşük Tutar en azından sıfır (0) olmalıdır.';
        translation['dl.validateDL.daysOverdueLessPrevious'] = 'Dunning Seviyesi {LEVEL} ({LEVEL_OVERDUE} gün) vade aşımı gün sayısı Dunning Seviyesi {PREVLEVEL} ({PREVLEVEL_OVERDUE} gün) vade aşımı gün sayısından daha az olmalıdır.';
        translation['dl.validateDL.dlRequired'] = 'En az bir dunning seviyesi gerekiyor.';
        translation['dp.validateDP.editNotAllowed'] = 'Dunning yordamı türünü düzenlemek için izniniz yok.';
        translation['dp.information.possibleMultipleSending'] = 'En Küçük Dunning Aralığı alanını devre dışı bırakmak hesabınızın tek bir müşteriye bir günde birden çok dunning mektubu göndermesine izin verir. Bunu devre dışı bırakmak istediğinize emin misiniz?';
        translation['dba.pagination.failedPrevPage'] = 'Önceki sayfaya gidilemedi.';
        translation['dq.validation.str_send'] = 'gönder';
        translation['dq.validation.str_remove'] = 'kaldır';
        translation['dq.validation.str_print'] = 'yazdır';
        translation['dq.validation.chooseAction'] = 'Lütfen şunun için bir mektup seçin: ';
        translation['dq.validation.removalConfirmation'] = 'Seçilen kayıtları kuyruktan kaldırmak istediğinizden emin misiniz?';
        translation['dq.pt.dunningQueueTitle'] = 'Dunning Kuyruğu';
        translation['dq.pt.source'] = 'Kaynak Türü';
        translation['dq.pt.dunningProcedure'] = 'Dunning Yordamı';
        translation['dq.pt.dunningLevel'] = 'Dunning Seviyesi';
        translation['dq.pt.lastLetterSent'] = 'En son gönderilen mektup';
        translation['dq.pt.emailingAllowed'] = 'E-posta ile göndermeye izin verildi';
        translation['dq.pt.printingAllowed'] = 'Yazdırmaya izin verildi';
        translation['dq.pt.send'] = 'Gönder';
        translation['dq.pt.remove'] = 'Kaldır';
        translation['dq.pt.print'] = 'Yazdır';
        translation['dq.pt.customer'] = 'Müşteri';
        translation['dt.validator.invalidDefault'] = 'Her dunning şablonu türü için varsayılan bir şablon seçilmesi gerekir. E-posta ve PDF alt sekmelerini inceleyin ve varsayılan bir Şablon seçin.';
        translation['dt.validator.duplicateLanguage'] = 'Bu dil zaten bu şablon türü için kullanılıyor.';
        translation['dt.validator.noTemplateDocs'] = 'Bu kaydı kaydetmek için en az bir e-posta şablon belgesi ve bir PDF şablon belgesi olması gerekir.';
        translation['dt.validator.subject'] = 'Dunning Şablon Belgesi Doğrulanamadı';
        translation['dt.validator.body'] = 'Aşağıdaki şablon belgeler geçersiz:';
        translation['dt.validator.defaultDeletion'] = 'Şu anda varsayılan olarak ayarlanmış bir şablonu silmeye çalışıyorsunuz. Bu şablonu silmek için önce başka bir şablonu varsayılan şablon olarak seçmeniz gerekiyor.';
        translation['dt.validator.xmlEmailDeprecated'] = 'XML e-posta şablon satırı ekleyemez, düzenleyemez veya kaldıramazsınız. XML tabanlı dunning e-posta şablonları aşamalı olarak kullanımdan kaldırılıyor. Dunning E-posta Şablonu alt sekmesine e-posta şablonu eklediğinizde bu kaydı kaydetmek, Dunning E-posta Şablonu alt sekmesindeki tüm satırları siler.';
        translation['dt.validator.deleteAllXMLLines'] = 'Bu kaydın kaydedilmesi, Dunning XML E-posta Şablonu alt sekmesindeki tüm satırları siler.';
        translation['dt.validator.noEMailDocs'] = 'Bu kaydı kaydetmek için en az bir e-posta şablonu olmalıdır.';
        translation['dt.validator.noPDFDocs'] = 'Bu kaydı kaydetmek için en az bir PDF şablonu olmalıdır.';
        translation['dt.validator.multipleDefault'] = 'Bu şablonu varsayılan olarak kullanmak istediğinizden emin misiniz?';
        translation['dlr.validateDLR.noAmount'] = 'Dunning Seviye Kuralı en az bir Dunning Seviye Kuralı Tutarına sahip olmalıdır.';
        translation['dlr.validateDLR.noDefaultAmount'] = 'Dunning Seviye Kuralı, Varsayılan tutar olarak ayarlanmış en az bir Dunning Seviye Kuralı Tutarına sahip olmalıdır.';
        translation['dlr.validateDLR.duplicateCurrency'] = 'Para birimi benzersiz olmalıdır.';
        translation['dlr.validateDLR.invalidAmount'] = 'Tutar sıfıra eşit veya sıfırdan büyük olmalıdır.';
        translation['dlr.validateDLR.changeDefaultCurrency'] = 'Bu satırdaki para birimini ve tutarı varsayılan olarak kullanmak istediğinizden emin misiniz? (Bu işlem geçerli varsayılan tutarı ve para birimini değiştirir.)';
        translation['dlr.validateDLR.negativeDaysOverdue'] = 'Vade Aşımı Gün Sayısı alanı negatif bir sayı içeriyor. Bu durumda müşteriye ödeme tarihinden önce bir mektup gönderilir.';
        translation['dlr.validateDLR.daysOverdueChanged'] = 'Hatırlatma seviyesindeki bir kurala ait Vade Aşımı Gün Sayısı değerini değiştirmek, hatırlatma mektuplarının sırasını veya düzenini değiştirebilir. Bu da, hatırlatma mektuplarının uygun olmayan düzende gönderilmesini tetikleyebilir.\n\n Her hatırlatma prosedürüne ({DP_LIST}) ait hatırlatma seviyelerinin sırasını kontrol etmeniz önerilir. Değiştirmek istediğiniz hatırlatma seviyesi, bu prosedürlerde kullanım halindedir. ';
        translation['dlr.validateDLR.cannotAddCurrency'] = 'Çoklu Para Birimleri özelliği etkinleştirilmediğinden para birimi eklenemiyor.';
        translation['der.flh.dunningProcedure'] = 'Bu alan fatura veya müşteri için atanmış dunning yordamını gösterir.';
        translation['der.flh.dunningLevel'] = 'Bu alan değerlendirmeden sonraki geçerli dunning seviyesini gösterir.';
        translation['der.flh.relatedEntity'] = 'Bu alan bir varlığa veya dunning alıcısının kişi kaydına bağlıdır.';
        translation['der.flh.messageContent'] = 'Bu alanda dunning mektubunun içeriği yer alır.';
        translation['der.flh.invoiceList'] = 'Bu alanda dunning mektubuyla ilişkilendirilmiş faturalar listelenir.';
        translation['der.flh.emailRecipient'] = 'Bu alanda dunning mektubu alıcılarının e-posta adresleri görüntülenir.';
        translation['der.flh.subject'] = 'Bu alanda dunning mektubunun konu satırı görüntülenir.';
        translation['der.flh.dunningManager'] = 'Bu alanda müşteriye atanan dunning yöneticisi görüntülenir ve alan, dunning yöneticisinin çalışan kaydına bağlıdır.';
        translation['der.flh.dunningTemplate'] = 'Bu alan dunning şablon kaydına bağlıdır.';
        translation['der.flh.customer'] = 'Bu alan müşteri kaydına bağlıdır.';
        translation['der.flh.status'] = 'Bu alanda e-postanın başarıyla gönderilip gönderilmediği görüntülenir. Durum şunlardan biri olabilir:\n\n• Gönderildi - E-posta başarıyla gönderildi.\n• Başarısız - Eksik bilgi nedeniyle sistem e-postayı göndermedi. Örneğin müşterinin veya kişinin e-posta adresi olmadığında bu durumla karşılaşabilirsiniz.\n• Kuyruğa eklendi - Dunning mektubu hala dunning kuyruğunda ve henüz işlenmedi.\n• Kaldırıldı - Dunning yöneticisi bu kaydı dunning kuyruğundan kaldırdı.';
        translation['dlr.flh.daysOverdue'] = 'Dunning mektubu gönderilmeden önce vade tarihinden sonra geçmesi gereken gün sayısını girin. Vade tarihinden önce mektup göndermek için negatif bir sayı girin.';
        translation['ds.flh.description'] = 'Bu kayıt için bir açıklama girin.';
        translation['dp.flh.dunningProcedure'] = 'Bu dunning yordamı için bir ad girin.';
        translation['dp.flh.description'] = 'Bu dunning yordamı için bir açıklama girin.';
        translation['dp.flh.appliesTo'] = 'Bu dunning yordamının müşterilere mi yoksa faturalara mı atanacağını seçin. Müşteri seçeneğini belirlediğinizde aynı zamanda Geçersiz Kılmaya İzin Ver kutusunu işaretlemeniz veya temizlemeniz gerekir. ';
        translation['dp.flh.sendingSchedule'] = 'Dunning mektuplarının otomatik olarak mı yoksa manüel olarak mı gönderileceğini seçin.';
        translation['dp.flh.minimumDunningInterval'] = 'Aynı müşteri için art arda gönderilecek iki mektup arasında geçmesi gereken en az gün sayısını belirleyin. Bu hem manüel olarak hem de otomatik gönderme için geçerlidir.';
        translation['dp.flh.subsidiary'] = 'Bu yordamın uygulandığı bağlı kuruluşları seçin.';
        translation['dp.flh.savedSearchCustomer'] = 'Bu yordamın uygulandığı kayıtlı müşteri aramasını seçin.';
        translation['dp.flh.allowOverride'] = 'Bu kutuyu işaretlediğinizde fatura seviyesi dunning yordamı, bu yordamı geçersiz kılabilir. Fatura, bu yordama ilişkin ölçütü karşıladığında müşteri seviyesi dunning yordamı atanmasından bağımsız olarak kullanılır.';
        translation['dp.flh.department'] = 'Bu yordamın uygulandığı departmanları seçin.';
        translation['dp.flh.class'] = 'Bu yordamın uygulandığı sınıfları seçin.';
        translation['dp.flh.location'] = 'Bu yordamın uygulandığı konumları seçin.';
        translation['dp.flh.savedSearchInvoice'] = 'Bu yordamın uygulandığı kayıtlı fatura aramasını seçin.';
        translation['dp.flh.assignAutomatically'] = 'Sistemin seçim ölçütüne göre bu dunning yordamını müşterilere veya faturalara otomatik olarak ataması için bu kutuyu işaretleyin.';
        translation['dt.flh.name'] = 'Bu dunning şablonu için bir ad girin.';
        translation['dt.flh.description'] = 'Bu dunning şablonu için bir açıklama girin.';
        translation['dt.flh.attachStatement'] = 'Bu şablonu kullanan dunning mektuplarına müşteri bildirimleri eklemek için bu kutuyu işaretleyin.';
        translation['dt.flh.attachInvoiceCopy'] = 'Faturaları, bu şablonu kullanan dunning mektuplarına eklemek için bu kutuyu işaretleyin.';
        translation['dt.flh.overdueInvoiceOnly'] = 'Yalnızca geciken faturaları eklemek istiyorsanız bu kutuyu işaretleyin.';
        translation['dt.flh.openTransactionOnly'] = 'Yalnızca müşteri bildirimlerindeki açık işlemleri eklemek istiyorsanız bu kutuyu işaretleyin.';
        translation['dt.flh.inactive'] = 'Şablonu devre dışı bırakmak için bu kutuyu işaretleyin. Devre dışı olan şablonlar listelerde görüntülenmez ve dunning mektuplarını göndermek için kullanılamaz.';
        translation['dc.flh.allowEmail'] = 'Dunning mektuplarının e-posta ile gönderilmesini istiyorsanız bu kutuyu seçin.';
        translation['dc.flh.lastLetterSent'] = 'Son dunning mektubunun gönderildiği tarih.';
        translation['dc.flh.dunningLevel'] = 'Bu alanda son dunning değerlendirmesinden sonraki geçerli dunning seviyesi görüntülenir.';
        translation['dc.flh.dunningManager'] = 'Bu müşterinin dunning‘inden sorumlu kişiyi ve dunning mektubunu gönderen olarak kimin görüntüleneceğini belirleyin.';
        translation['dc.flh.dunningProcedure'] = 'Bu alanda müşteriye atanmış dunning yordamı görüntülenir. Otomatik Olarak Ata‘ya tıkladığınızda sistem dunning seçim ölçütüne bağlı olarak uygun yordamını atar. Müşteriye atanmış dunning yordamını değiştirmek için açılan listeden farklı bir değer seçin. Açılan listede yalnızca dunning yordam kayıtlarında tanımlanan seçim ölçütüne bağlı olarak bu müşteriye uygulanabilen yordamlar görüntülenir.';
        translation['dc.flh.allowPrint'] = 'Dunning mektuplarının yazdırılmasını istiyorsanız bu kutuyu seçin.';
        translation['dc.flh.pauseReason'] = 'Dunning‘in duraklatılma nedenini seçin.';
        translation['dc.flh.pauseReasonDetail'] = 'Dunning‘in duraklatılma nedenine ilişkin ayrıntıları seçin.';
        translation['dc.flh.pauseDunning'] = 'Dunning işlemini geçici olarak durdurmak istiyorsanız bu kutuyu işaretleyin.';
        translation['dc.flh.dunningRecepients'] = 'Ek dunning alıcılarını seçin';
        translation['dc.flh.allowEmail'] = 'Dunning mektuplarının e-posta ile gönderilmesini istiyorsanız bu kutuyu seçin.';
        translation['di.flh.lastLetterSent'] = 'Son dunning mektubunun gönderildiği tarih.';
        translation['di.flh.dunningLevel'] = 'Bu alanda son dunning değerlendirmesinden sonraki geçerli dunning seviyesi görüntülenir.';
        translation['di.flh.dunningManager'] = 'Fatura dunning‘inden sorumlu kişiyi ve dunning mektubunu gönderen olarak kimin adının görüntüleneceğini belirleyin.';
        translation['di.flh.dunningProcedure'] = 'Bu alanda faturaya atanmış dunning yordamı görüntülenir. Otomatik Olarak Ata‘ya tıkladığınızda sistem dunning seçim ölçütüne bağlı olarak uygun yordamını atar. Faturaya atanmış dunning yordamını değiştirmek için açılan listeden farklı bir değer seçin. Açılan listede yalnızca dunning yordam kayıtlarında tanımlanan seçim ölçütüne bağlı olarak bu faturaya uygulanabilen yordamlar görüntülenir.';
        translation['di.flh.allowPrint'] = 'Dunning mektuplarının yazdırılmasını istiyorsanız bu kutuyu seçin.';
        translation['di.flh.pauseReason'] = 'Dunning‘in duraklatılma nedenini seçin.';
        translation['di.flh.pauseReasonDetail'] = 'Dunning‘in duraklatılma nedenine ilişkin ayrıntı seçin.';
        translation['di.flh.pauseDunning'] = 'Dunning işlemini geçici olarak durdurmak istiyorsanız bu kutuyu işaretleyin.';
        translation['dp.validate.unpause'] = 'Dunning›i Duraklat kutusunu temizlemek dunning değerlendirme iş akışını tetikler. NetSuite, dunning değerlendirme sonucuna bağlı olarak bu müşteriye dunning mektubu gönderebilir. Dunning işlemine devam etmek istediğinizden emin misiniz?';
        translation['dc.validateSubsidiary.existingConfigSubsidiary'] = 'Bu bağlı kuruluş için bir dunning yapılandırması zaten var.';
        translation['l10n.address.invalidPOBox'] = 'Lütfen geçerli bir Posta Kutusu numarası girin.';
        translation['l10n.address.invalidZipCode'] = 'Lütfen geçerli bir Posta Kodu girin.';
        translation['l10n.address.invalidRuralRoute'] = 'Lütfen geçerli bir Adres Rotası değeri girin.';
        translation['l10n.accessForDDandAccountant'] = 'Bu tür kayıtlar yalnızca Yönetici, Dunning İdarecisi ve Muhasebeci rolleri tarafından oluşturulabilir ve değiştirilebilir.';
        translation['l10n.deleteAccessForDDandAccountant'] = 'Bu tür kayıtlar yalnızca Yönetici, Dunning İdarecisi ve Muhasebeci rolleri tarafından silinebilir.';
        translation['l10n.accessForAdministrator'] = 'Bu tür kayıtlar yalnızca Yönetici rolü tarafından oluşturulabilir ve değiştirilebilir.';
        translation['l10n.deleteAccessForAdministrator'] = 'Bu tür kayıtlar yalnızca Yönetici rolü tarafından silinebilir.';
        translation['l10n.noPagePrivilege'] = 'Bu sayfayı görüntüleme ayrıcalığınız yok';
        translation['dq.pdfemail.folderName'] = 'PDF biçiminde yazdırılacak hatırlatma mektupları';
        translation['dq.pdfemail.subject'] = 'PDF biçiminde oluşturulan hatırlatma mektupları, Dosya Dolabı\'nda yazdırılmaya hazır.';
        translation['dq.pdfemail.link'] = 'PDF biçimindeki mektupların bulunduğu klasörü görüntülemek için şu bağlantıya tıklayın:';
        translation['dq.pdfemail.tableHead'] = 'Aşağıdaki tabloda, PDF dosyalarının depolandığı klasörlere ait ayrıntılar bulunur.';
        translation['dq.pdfemail.exceedLimit'] = 'ไOluşturulan dosyalar, ek sınırının aşılması nedeniyle eklenemedi.';
        translation['dq.pdfemail.tableLabel1'] = 'Klasörler';
        translation['dq.pdfemail.tableLabel2'] = 'Yol';
        translation['dq.pdfemail.tableLabel3'] = 'Durum';
        translation['dq.pdfemail.tableLabel4'] = 'Notlar';

        break;

      case 'zh_CN':
      case 'zh-CN':
        translation['dsa.response.none_found'] = '无可用的催款程序。';
        translation['form.dunning_template.title'] = '催款模板';
        translation['field.template.name'] = '名称';
        translation['field.template.description'] = '说明';
        translation['field.template.attachStatement'] = '附加对账单';
        translation['field.template.overdue_invoices_stmt'] = '仅在对账单上显示逾期发票';
        translation['field.template.inactive'] = '非活动';
        translation['field.template.attach_invoice_copy'] = '附加发票副本';
        translation['field.template.only_overdue_invoices'] = '仅逾期发票';
        translation['field.template.subject'] = '主题';
        translation['selection.template.savedsearch'] = '已保存的搜索';
        translation['selection.template.searchcolumn'] = '搜索栏';
        translation['label.template.lettertext'] = '信件文本';
        translation['dba.form.title'] = '催款批量分配';
        translation['dba.form.source'] = '应用于';
        translation['dba.form.procedure'] = '催款程序';
        translation['dba.form.source.help'] = '应用于';
        translation['dba.form.procedure.help'] = '催款程序';
        translation['dba.form.dunning_manager'] = '催款经理';
        translation['dba.form.dunning_manager.help'] = '催款经理';
        translation['dba.tab.invoice'] = '发票';
        translation['dba.sublist.invoice'] = '发票';
        translation['dba.tab.customer'] = '客户';
        translation['dba.sublist.customer'] = '客户';
        translation['dba.sublist.common.id'] = 'ID';
        translation['dba.sublist.common.customer'] = '客户';
        translation['dba.sublist.invoice.invoice'] = '发票';
        translation['dba.sublist.invoice.amount'] = '金额';
        translation['dba.sublist.invoice.currency'] = '货币';
        translation['dba.sublist.invoice.duedate'] = '到期日期';
        translation['dba.sublist.invoice.days_overdue'] = '逾期天数';
        translation['dba.sublist.customer.subsidiary'] = '子公司';
        translation['dba.sublist.common.assign_dunning'] = '分配';
        translation['dba.sublist.common.dunning_procedure'] = '催款程序';
        translation['dba.sublist.common.dunning_level'] = '催款级别';
        translation['dba.sublist.common.last_letter_sent'] = '上封信件发送日期';
        translation['dba.sublist.common.dunning_sending_type'] = '发送类型';
        translation['dba.sublist.common.page_next'] = '>';
        translation['dba.sublist.common.page_previous'] = '<';
        translation['dba.sublist.common.page_option'] = '{startIndex} - {endIndex} / {totalEntryCount}';
        translation['dba.form.restriction'] = '选择条件';
        translation['dba.form.selection'] = '催款程序选择';
        translation['dba.form.restriction.subsidiary'] = '子公司';
        translation['dba.form.restriction.location'] = '地点';
        translation['dba.form.restriction.dept'] = '部门';
        translation['dba.form.restriction.class'] = '类别';
        translation['dba.form.restriction.search'] = '已保存的搜索';
        translation['dba.form.action.assign'] = '分配';
        translation['dba.form.action.assign_customer'] = '分配至客户';
        translation['dba.form.action.assign_invoice'] = '分配至发票';
        translation['dba.form.action.cancel'] = '取消';
        translation['dba.form.notification.highnumberofrecord'] = '此请求可能需要数秒钟来完成。请耐心等待，稍后您将会重定向至“催款程序”页面。';
        translation['dqf.form.action.send'] = '发送';
        translation['dqf.form.action.print'] = '打印';
        translation['dqf.form.action.remove'] = '删除';
        translation['dqf.form.send.title'] = '催款电子邮件发送队列';
        translation['dqf.form.print.title'] = '催款 PDF 打印队列';
        translation['dqf.filter.fieldGroup'] = '过滤器';
        translation['dqf.filter.inlineHelp'] = '过滤器可用来为搜索指定更为具体的条件，或减少要显示的结果。';
        translation['dqf.filter.applyFiltersButton'] = '搜索';
        translation['dqf.filter.customer'] = '客户';
        translation['dqf.filter.recipient'] = '收件人';
        translation['dqf.filter.procedure'] = '催款程序';
        translation['dqf.filter.dpLevel'] = '催款级别';
        translation['dqf.filter.appliesTo'] = '应用于';
        translation['dqf.filter.allowPrint'] = '允许打印';
        translation['dqf.filter.allowEmail'] = '允许发送电子邮件';
        translation['dqf.filter.lastLtrSentStart'] = '上封信件发送开始时期';
        translation['dqf.filter.lastLtrSentEnd'] = '上封信件发送结束日期';
        translation['dqf.filter.evalDateStart'] = '评估开始日期';
        translation['dqf.filter.evalDateEnd'] = '评估结束日期';
        translation['dqf.filter.boolean.yes'] = '是';
        translation['dqf.filter.boolean.no'] = '否';
        translation['dqf.sublist.send.title'] = '催款电子邮件发送队列';
        translation['dqf.sublist.print.title'] = '催款 PDF 打印队列';
        translation['dqf.sublist.common.customer'] = '客户';
        translation['dqf.sublist.common.mark'] = '标记';
        translation['dqf.sublist.common.view'] = '查看';
        translation['dqf.sublist.common.id'] = 'ID';
        translation['dqf.sublist.dp.applies_to'] = '应用于';
        translation['dqf.sublist.common.dunning_procedure'] = '催款程序';
        translation['dqf.sublist.common.dunning_level'] = '级别';
        translation['dqf.sublist.record.last_letter_sent'] = '上封信件发送时间';
        translation['dqf.sublist.record.dunning_allow_email'] = '允许发送电子邮件';
        translation['dqf.sublist.record.dunning_allow_print'] = '允许打印';
        translation['dqf.sublist.record.pause_dunning'] = '暂停催款';
        translation['dqf.sublist.common.evaluation_date'] = '评估日期';
        translation['dqf.sublist.common.related_entity'] = '收件人';
        translation['dbu.form.title'] = '批量更新催款用客户记录';
        translation['dbu.form.update_button'] = '更新';
        translation['dbu.form.field.subsidiary'] = '子公司';
        translation['dbu.form.flh.subsidiary'] = '选择您想要对客户记录中催款字段进行批量更新的子公司。更新将应用到属于所选子公司的所有客户记录。';
        translation['dbu.form.field.allow_email'] = '允许通过电子邮件发送信件';
        translation['dbu.form.flh.allow_email'] = '选择完成批量更新后要应用于客户记录中这一字段的值：\n不改变 – 该字段的当前值不发生改变。\n已选中 – 在批量更新后，客户记录中的这个框将会被选中。\n未选中 – 批量更新后，该框将被取消选中。';
        translation['dbu.form.field.allow_print'] = '允许打印信件';
        translation['dbu.form.flh.allow_print'] = '选择完成批量更新后要应用于客户记录中这一字段的值：\n不改变 – 该字段的当前值不发生改变。\n已选中 – 在批量更新后，客户记录中的这个框将会被选中。\n未选中 – 批量更新后，该框将被取消选中。';
        translation['dbu.form.field.dont_send_cust_email'] = '不要向客户电子邮件地址发送信件';
        translation['dbu.form.flh.dont_send_cust_email'] = '选择完成批量更新后要应用于客户记录中这一字段的值：\n不改变 – 该字段的当前值不发生改变。\n已选中 – 在批量更新后，客户记录中的这个框将会被选中。\n未选中 – 批量更新后，此框将被取消选中。';
        translation['dbu.form.primary_field_group'] = '条件';
        translation['dbu.form.bulk_update_field_group'] = '批量更新字段';
        translation['dbu.form.options.unchanged'] = '- 不改变 -';
        translation['dbu.form.options.checked'] = '已选中';
        translation['dbu.form.options.not_checked'] = '未选中';
        translation['dbu.validation.no_selection'] = '没有需要更新的字段，因为所有字段都选择了“不改变”。如果为至少一个字段指定了改变（“已选中”或“未选中”），则可以进行批量更新。';
        translation['dbu.validation.no_sending_media'] = '如果“允许通过电子邮件发送信件”和“允许打印信件”两个框都未选中，则无法保存客户记录。请在下列字段之一中或两个都选择“已选中”：\n- 允许通过电子邮件发送信件\n- 允许打印信件';
        translation['dbu.validation.verify_submit_ow'] = '所选子公司内所有具有催款程序的客户记录都会更新 {SUBSIDIARY}。该过程完成后，您会收到一封电子邮件。是否确定要继续进行批量更新？如果单击“确定”，批量更新过程便会开始，并且无法撤销。';
        translation['dbu.validation.verify_submit_si'] = '所有具有催款程序的客户记录都会更新。该过程完成后，您会收到一封电子邮件。是否确定要继续进行批量更新？如果单击“确定”，批量更新过程便会开始，并且无法撤销。';
        translation['dbu.form.reminderinlinehelp'] = 'NetSuite 建议您在正常工作时间之外使用批量更新功能。这可以确保您公司内的其他用户不会在批量更新过程中对客户记录进行更新。';
        translation['dbu.validation.validate_concurrency_ow'] = ' {USER} 为子公司“ {SUBSIDIARY}”启动了催款用客户记录的批量更新。您必须先等待该批量更新完成，然后才能再次对同一子公司的客户进行批量更新。';
        translation['dbu.validation.validate_concurrency_si'] = '系统一次只能进行一个批量更新。 {USER} 启动的批量更新目前正在运行。';
        translation['dbu.customer.message.complete_subject'] = '催款用客户记录的批量更新';
        translation['dbu.customer.message.complete_body_ow'] = [
          '来自 NetSuite 的问候。<br />',
          '为子公司“ {SUBSIDIARY}”进行的催款用客户记录批量更新现已完成。',
          '允许通过电子邮件发送信件 = {ALLOW_EMAIL}',
          '允许打印信件 = {ALLOW_PRINT}',
          '不要向客户电子邮件地址发送信件 = {DONT_SEND_TO_CUST}<br />',
          '已更新的客户记录数量： {PROCESSED_RECORDS} 条，共  {RECORD_COUNT} 条。{ERROR_STEPS}',
          '这是系统生成的电子邮件。<br />',
          '谢谢！',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.complete_body_si'] = [
          '来自 NetSuite 的问候。<br />',
          '催款用客户记录的批量更新现已完成。',
          '允许通过电子邮件发送信件 = {ALLOW_EMAIL}',
          '允许打印信件 = {ALLOW_PRINT}',
          '不要向客户电子邮件地址发送信件 = {DONT_SEND_TO_CUST}<br />',
          '已更新的客户记录数量： {PROCESSED_RECORDS} 条，共  {RECORD_COUNT} 条。{ERROR_STEPS}',
          '这是系统生成的电子邮件。<br />',
          '谢谢！',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.error_file_header'] = '客户 ID，错误';
        translation['dbu.customer.message.error_filename'] = 'Failed Updates.csv';
        translation['dbu.customer.message.error_steps'] = '<br />请下载随附的文件，以查看未更新的记录列表。您可以手动更新这些记录。';
        translation['dc.validateCustomer.noDPMatched'] = '未找到与客户记录匹配的催款程序。';
        translation['dc.validateCustomer.recipientNoEmail'] = '下列催款信收件人在联系记录中没有电子邮件地址： {CONTACTNAMES}。';
        translation['dc.validateCustomer.customerNoEmail'] = '该记录无法保存。虽然已选中“允许通过电子邮件发送信件”框，但没有电子邮件地址或催款收件人可供发送信件。要保存该记录，必须满足下列条件：\n-“催款收件人”子选项卡中含有至少一个有电子邮件地址的联系人。\n- 客户记录的“电子邮件地址”字段有电子邮件地址。\n\n注意：仅在未选中“不要向客户电子邮件地址发送信件”的情况下，才需要填写客户的电子邮件地址。';
        translation['dc.validateCustomer.noEmailAtAll'] = '客户记录中没有电子邮件地址，并且未为该客户指定催款信收件人。请在客户记录上输入电子邮件地址，或在“催款”子选项卡中选择至少一位具有电子邮件地址的催款信收件人。';
        translation['dc.validateCustomer.recipientListEmpty'] = '该记录无法保存。虽然已选中“允许通过电子邮件发送信件”框，但没有催款收件人可供发送信件。要保存该记录，“催款收件人”子选项卡中必须含有至少一个有电子邮件地址的联系人。\n\n注意：仅在未选中“不要向客户电子邮件地址发送信件”的情况下，才需要填写客户的电子邮件地址。';
        translation['dc.validateCustomer.dpMatched'] = '该客户记录与“{DP}”催款程序匹配。是否要更改催款程序？';
        translation['dc.validateCustomer.dpAllReadyAssigned'] = '找到的催款程序与记录中已分配的催款程序相同。';
        translation['dc.validateDP.managerRequired'] = '需要填写催款经理。';
        translation['dc.validateDP.sendingModeRequired'] = '必须至少选中下列复选框之一：\n- 允许通过电子邮件发送信件\n- 允许打印信件';
        translation['dl.validateDL.dlCountExceeded'] = '您已超出允许的最大催款级别。';
        translation['dl.validateDL.lowerDaysOverDue'] = '逾期天数必须小于 {DAYS}。';
        translation['dl.validateDL.higherDaysOverdue'] = '逾期天数必须大于 {DAYS}。';
        translation['dl.validateDL.daysOverdueExist'] = '逾期天数 {DAYS}已存在于另一行中。';
        translation['dl.validateDL.lastRecordDeletion'] = '您只能删除列表中的最后一条记录。';
        translation['dl.validateDL.daysBetSending'] = '发信间隔天数必须大于或等于 {DAYS}';
        translation['dl.validateDL.minOutsBalGEZero'] = '最小未付金额必须至少为零 (0)。';
        translation['dl.validateDL.daysOverdueLessPrevious'] = '催款级别  {LEVEL} 的逾期天数（{LEVEL_OVERDUE} 天）必须小于催缴级别  {PREVLEVEL} 的天数（{PREVLEVEL_OVERDUE} 天）。';
        translation['dl.validateDL.dlRequired'] = '必须指定至少一个催款级别。';
        translation['dp.validateDP.editNotAllowed'] = '您无法编辑催款程序类型。';
        translation['dp.information.possibleMultipleSending'] = '禁用“最短催款间隔”字段将允许您的帐户在一天内向同一位客户发送多封催款信。是否确定要禁用？';
        translation['dba.pagination.failedPrevPage'] = '无法前往上一页。';
        translation['dq.validation.str_send'] = '发送';
        translation['dq.validation.str_remove'] = '删除';
        translation['dq.validation.str_print'] = '打印';
        translation['dq.validation.chooseAction'] = '请选择一封信来';
        translation['dq.validation.removalConfirmation'] = '是否确定要将所选记录从队列中删除？';
        translation['dq.pt.dunningQueueTitle'] = '催款队列';
        translation['dq.pt.source'] = '来源类型';
        translation['dq.pt.dunningProcedure'] = '催款程序';
        translation['dq.pt.dunningLevel'] = '催款级别';
        translation['dq.pt.lastLetterSent'] = '上封信件发送时间';
        translation['dq.pt.emailingAllowed'] = '允许发送电子邮件';
        translation['dq.pt.printingAllowed'] = '允许打印';
        translation['dq.pt.send'] = '发送';
        translation['dq.pt.remove'] = '删除';
        translation['dq.pt.print'] = '打印';
        translation['dq.pt.customer'] = '客户';
        translation['dt.validator.invalidDefault'] = '必须为每个催款模板类型选择一个默认模板。请检查“电子邮件”和“PDF”子选项卡，并选择一个默认模板。';
        translation['dt.validator.duplicateLanguage'] = '此语言已用于此模板类型。';
        translation['dt.validator.noTemplateDocs'] = '要保存此记录，必须有至少一个电子邮件模板文档和一个 PDF 模板文档。';
        translation['dt.validator.subject'] = '未通过催款模板文档验证';
        translation['dt.validator.body'] = '下列模板文档无效：';
        translation['dt.validator.defaultDeletion'] = '您正在尝试删除当前设为默认的模板。要删除此模板，您必须先选择其他模板作为您的默认模板。';
        translation['dt.validator.xmlEmailDeprecated'] = '您无法添加、编辑或删除 XML 模板行。现已逐渐停用基于 XML 的催款电子邮件模板。如果您在“催款电子邮件模板”子选项卡中添加了电子邮件模板，保存此记录会删除“催款 XML 电子邮件模板”子选项卡中的所有行。';
        translation['dt.validator.deleteAllXMLLines'] = '保存此记录会删除“催款 XML 电子邮件模板”子选项卡中的所有行。';
        translation['dt.validator.noEMailDocs'] = '必须有至少一个电子邮件模板，才能保存此记录。';
        translation['dt.validator.noPDFDocs'] = '必须有至少一个 PDF 模板，才能保存此记录。';
        translation['dt.validator.multipleDefault'] = '是否确定要将此模板设为默认？';
        translation['dlr.validateDLR.noAmount'] = '催款级别规则应具有至少一个催款级别规则金额。';
        translation['dlr.validateDLR.noDefaultAmount'] = '催款级别规则应具有至少一个设为默认金额的催款级别规则金额。';
        translation['dlr.validateDLR.duplicateCurrency'] = '货币必须唯一。';
        translation['dlr.validateDLR.invalidAmount'] = '金额必须大于或等于 0。';
        translation['dlr.validateDLR.changeDefaultCurrency'] = '是否确定要将此行的货币和金额设为默认值？（这会更改当前的默认金额和货币）';
        translation['dlr.validateDLR.negativeDaysOverdue'] = '”逾期天数“字段中包含负值。这会在付款到期前向客户发送信件。';
        translation['dlr.validateDLR.daysOverdueChanged'] = '更改催款级别规则中的“预期”值可能更改催款级别的序列或顺序，这继而可能触发发送不恰当的催款函。\n\n 建议您在每个使用您要更改的催款级别的催款程序（{DP_LIST}）中检查催款级别的顺序。';
        translation['dlr.validateDLR.cannotAddCurrency'] = '无法添加该货币，因为未启用“多货币”功能。';
        translation['der.flh.dunningProcedure'] = '此字段指示已分配给发票或客户的催款程序。';
        translation['der.flh.dunningLevel'] = '此字段指示评估后当前的催款级别。';
        translation['der.flh.relatedEntity'] = '此字段与催款收件人的实体或联系记录相关联。';
        translation['der.flh.messageContent'] = '此字段包含催款信的内容。';
        translation['der.flh.invoiceList'] = '此字段列出与该催款信相关联的发票。';
        translation['der.flh.emailRecipient'] = '此字段显示催款信收件人的电子邮件地址。';
        translation['der.flh.subject'] = '此字段显示催款信的主题行。';
        translation['der.flh.dunningManager'] = '此字段显示已分配至该客户的催款经理，并且与催款经理的雇员记录相关联。';
        translation['der.flh.dunningTemplate'] = '此字段与催款模板记录相关联。';
        translation['der.flh.customer'] = '此字段与客户记录相关联。';
        translation['der.flh.status'] = '此字段指示电子邮件是否已发送成功。可能的状态如下：\n\n• 已发送 – 电子邮件已成功发送。\n• 已失败- 由于缺少信息，系统无法发送电子邮件。例如，没有客户或联系人的电子邮件地址时。\n• 已排队 – 催款信仍在催款队列中，尚未进行处理。\n• 已删除 - 催款经理已将此记录从催款队列中删除。';
        translation['dlr.flh.daysOverdue'] = '输入超过付款到期日后发送催款信之前的等待天数。要在到期日之前发送信件，请输入负数。';
        translation['ds.flh.description'] = '输入此记录的说明。';
        translation['dp.flh.dunningProcedure'] = '输入此催款程序的名称。';
        translation['dp.flh.description'] = '输入此催款程序的说明。';
        translation['dp.flh.appliesTo'] = '选择此催款程序是分配给客户还是发票。如果您选择“客户”，则您还必须选中或取消选中“允许覆盖”复选框。';
        translation['dp.flh.sendingSchedule'] = '选择是要自动发送催款信还是手动发送。';
        translation['dp.flh.minimumDunningInterval'] = '选择向同一位客户连续发送两封信件之间的最小间隔天数。这同时适用于手动发送和自动发送。';
        translation['dp.flh.subsidiary'] = '选择此催款程序适用的子公司。';
        translation['dp.flh.savedSearchCustomer'] = '选择此程序适用的已保存客户搜索。';
        translation['dp.flh.allowOverride'] = '如果您选中此框，则发票级别的催款程序可以覆盖此程序。如果某张发票符合该程序的相关条件，则无论是否分配了客户级别的催款程序，都会优先使用发票级别的催款程序。';
        translation['dp.flh.department'] = '选择此程序适用的部门。';
        translation['dp.flh.class'] = '选择此程序适用的类别。';
        translation['dp.flh.location'] = '选择此程序适用的地点。';
        translation['dp.flh.savedSearchInvoice'] = '选择此程序适用的已保存发票搜索。';
        translation['dp.flh.assignAutomatically'] = '选中此框可以让系统根据选择条件将催款程序自动分配给客户或发票。';
        translation['dt.flh.name'] = '输入此催款模板的名称。';
        translation['dt.flh.description'] = '输入此催款模板的说明。';
        translation['dt.flh.attachStatement'] = '选中此框可以将客户对账单附加至使用此模板的催款信中。';
        translation['dt.flh.attachInvoiceCopy'] = '选中此框可以将发票附加至使用此模板的催款信。';
        translation['dt.flh.overdueInvoiceOnly'] = '如果您只想附加逾期发票，请选中此框。';
        translation['dt.flh.openTransactionOnly'] = '如果您只想在客户对账单中包含未完成的交易，请选中此框。';
        translation['dt.flh.inactive'] = '选中此框可以将模板设为不活动。设为不活动的模板不会显示在列表中，也无法用于发送催款信。';
        translation['dc.flh.allowEmail'] = '如果您希望通过电子邮件发送催款信，请选中此框。';
        translation['dc.flh.lastLetterSent'] = '上封催款信的发送日期。';
        translation['dc.flh.dunningLevel'] = '此字段显示截至上次催款评估时当前的催款级别。';
        translation['dc.flh.dunningManager'] = '选择负责此客户催款且名字将显示为催款信发件人的人员。';
        translation['dc.flh.dunningProcedure'] = '此字段显示分配给该客户的催款程序。如果您单击“自动分配”，则系统会根据催款选择条件分配合适的程序。从下拉列表中选择不同的值可以更改分配给客户的催款程序。下拉列表中只会显示适用于此客户的催款程序（根据催款程序记录中规定的选择条件确定）。';
        translation['dc.flh.allowPrint'] = '如果您希望打印催款信，请选中此框。';
        translation['dc.flh.pauseReason'] = '选择表明催款暂停的原因。';
        translation['dc.flh.pauseReasonDetail'] = '选择表明催款暂停原因的详细信息。';
        translation['dc.flh.pauseDunning'] = '选中此框可以暂时停止催款程序。';
        translation['dc.flh.dunningRecepients'] = '选择其他催款收件人';
        translation['dc.flh.allowEmail'] = '如果您希望通过电子邮件发送催款信，请选中此框。';
        translation['di.flh.lastLetterSent'] = '上封催款信的发送日期。';
        translation['di.flh.dunningLevel'] = '此字段显示截至上次催款评估时当前的催款级别。';
        translation['di.flh.dunningManager'] = '选择负责此发票催款且其名字将显示为催缴信发件人的人员。';
        translation['di.flh.dunningProcedure'] = '此字段显示已分配至当前发票或客户的催款程序。如果您单击“自动分配”，则系统会根据催款选择条件分配合适的程序。从下拉列表中选择不同的值可以更改分配给客户的催款程序。下拉列表中只会显示适用于此客户的催款程序（根据催款程序记录中规定的选择条件确定）。';
        translation['di.flh.allowPrint'] = '如果您希望打印催款信，请选中此框。';
        translation['di.flh.pauseReason'] = '选择表明催款暂停的原因。';
        translation['di.flh.pauseReasonDetail'] = '选择表明催款暂停原因的详细信息。';
        translation['di.flh.pauseDunning'] = '选中此框可以暂时停止催款过程。';
        translation['dp.validate.unpause'] = '取消选中“暂停催缴”复选框将立刻触发催款评估流程。根据催款评估结果，NetSuite 可能会向此客户发送催款信。是否确定要继续催款？';
        translation['dc.validateSubsidiary.existingConfigSubsidiary'] = '该子公司的催款配置记录已存在。';
        translation['l10n.address.invalidPOBox'] = '请输入有效的邮政信箱号码。';
        translation['l10n.address.invalidZipCode'] = '请输入有效的邮政编码。';
        translation['l10n.address.invalidRuralRoute'] = '请输入有效的乡邮投递路线值。';
        translation['l10n.accessForDDandAccountant'] = '只有“管理员”、“催款主管”和“会计”角色能够创建或修改此类型的记录。';
        translation['l10n.deleteAccessForDDandAccountant'] = '只有“管理员”、“催款主管”和“会计”角色能够删除此类型的记录。';
        translation['l10n.accessForAdministrator'] = '只有“管理员”角色能够创建和修改此类型的角色。';
        translation['l10n.deleteAccessForAdministrator'] = '只有“管理员”角色能够删除此类型的记录。';
        translation['l10n.noPagePrivilege'] = '您没有权限查看此页面。';
        translation['dq.pdfemail.folderName'] = '用于打印的 PDF 催款信';
        translation['dq.pdfemail.subject'] = '生成的 PDF 催款信在文件柜中可用于打印。';
        translation['dq.pdfemail.link'] = '单击链接查看 PDF 信件的文件夹：';
        translation['dq.pdfemail.tableHead'] = '下表提供了存储 PDF 文件的文件夹的详细信息。';
        translation['dq.pdfemail.exceedLimit'] = '由于超出了附件限制，无法附加生成的文件。';
        translation['dq.pdfemail.tableLabel1'] = '文件夹';
        translation['dq.pdfemail.tableLabel2'] = '路径';
        translation['dq.pdfemail.tableLabel3'] = '状态';
        translation['dq.pdfemail.tableLabel4'] = '备注';

        break;

      case 'zh_TW':
      case 'zh-TW':
        translation['dsa.response.none_found'] = '沒有可用的催款程序。';
        translation['form.dunning_template.title'] = '催款範本';
        translation['field.template.name'] = '名稱';
        translation['field.template.description'] = '說明';
        translation['field.template.attachStatement'] = '附加報表';
        translation['field.template.overdue_invoices_stmt'] = '僅報表上的逾期發票';
        translation['field.template.inactive'] = '非現用';
        translation['field.template.attach_invoice_copy'] = '附加發票副本';
        translation['field.template.only_overdue_invoices'] = '僅逾期發票';
        translation['field.template.subject'] = '主題';
        translation['selection.template.savedsearch'] = '已儲存的搜尋';
        translation['selection.template.searchcolumn'] = '搜尋欄';
        translation['label.template.lettertext'] = '信件文字';
        translation['dba.form.title'] = '催款大量指派';
        translation['dba.form.source'] = '套用到';
        translation['dba.form.procedure'] = '催款程序';
        translation['dba.form.source.help'] = '套用到';
        translation['dba.form.procedure.help'] = '催款程序';
        translation['dba.form.dunning_manager'] = '催款經理';
        translation['dba.form.dunning_manager.help'] = '催款經理';
        translation['dba.tab.invoice'] = '發票';
        translation['dba.sublist.invoice'] = '發票';
        translation['dba.tab.customer'] = '顧客';
        translation['dba.sublist.customer'] = '顧客';
        translation['dba.sublist.common.id'] = 'ID';
        translation['dba.sublist.common.customer'] = '顧客';
        translation['dba.sublist.invoice.invoice'] = '發票';
        translation['dba.sublist.invoice.amount'] = '金額';
        translation['dba.sublist.invoice.currency'] = '貨幣';
        translation['dba.sublist.invoice.duedate'] = '到期日期';
        translation['dba.sublist.invoice.days_overdue'] = '逾期天數';
        translation['dba.sublist.customer.subsidiary'] = '子公司';
        translation['dba.sublist.common.assign_dunning'] = '指派';
        translation['dba.sublist.common.dunning_procedure'] = '催款程序';
        translation['dba.sublist.common.dunning_level'] = '催款層級';
        translation['dba.sublist.common.last_letter_sent'] = '最後信件傳送日期';
        translation['dba.sublist.common.dunning_sending_type'] = '發送類型';
        translation['dba.sublist.common.page_next'] = '>';
        translation['dba.sublist.common.page_previous'] = '<';
        translation['dba.sublist.common.page_option'] = '{startIndex} - {endIndex} 的 {totalEntryCount}';
        translation['dba.form.restriction'] = '選擇的條件';
        translation['dba.form.selection'] = '催款程序選擇';
        translation['dba.form.restriction.subsidiary'] = '子公司';
        translation['dba.form.restriction.location'] = '地點';
        translation['dba.form.restriction.dept'] = '部門';
        translation['dba.form.restriction.class'] = '類別';
        translation['dba.form.restriction.search'] = '已儲存的搜尋';
        translation['dba.form.action.assign'] = '指派';
        translation['dba.form.action.assign_customer'] = '指派至顧客';
        translation['dba.form.action.assign_invoice'] = '指派至發票';
        translation['dba.form.action.cancel'] = '取消';
        translation['dba.form.notification.highnumberofrecord'] = '可能需數秒完成此要求。請等候重新導引您前往「催款程序」頁。';
        translation['dqf.form.action.send'] = '傳送';
        translation['dqf.form.action.print'] = '列印';
        translation['dqf.form.action.remove'] = '移除';
        translation['dqf.form.send.title'] = '催款電子郵件傳送佇列';
        translation['dqf.form.print.title'] = '催款 PDF 列印佇列';
        translation['dqf.filter.fieldGroup'] = '過濾器';
        translation['dqf.filter.inlineHelp'] = '使用篩選條件，進行更具體的搜尋或縮小顯示的結果範圍。';
        translation['dqf.filter.applyFiltersButton'] = '搜尋';
        translation['dqf.filter.customer'] = '顧客';
        translation['dqf.filter.recipient'] = '收件者';
        translation['dqf.filter.procedure'] = '催款程序';
        translation['dqf.filter.dpLevel'] = '催款層級';
        translation['dqf.filter.appliesTo'] = '套用到';
        translation['dqf.filter.allowPrint'] = '允許列印';
        translation['dqf.filter.allowEmail'] = '允許電子郵件';
        translation['dqf.filter.lastLtrSentStart'] = '最後信件傳送的開始日期';
        translation['dqf.filter.lastLtrSentEnd'] = '最後信件傳送的結束日期';
        translation['dqf.filter.evalDateStart'] = '評估開始日期';
        translation['dqf.filter.evalDateEnd'] = '評估結束日期';
        translation['dqf.filter.boolean.yes'] = '是';
        translation['dqf.filter.boolean.no'] = '否';
        translation['dqf.sublist.send.title'] = '催款電子郵件傳送佇列';
        translation['dqf.sublist.print.title'] = '催款 PDF 列印佇列';
        translation['dqf.sublist.common.customer'] = '顧客';
        translation['dqf.sublist.common.mark'] = '標記';
        translation['dqf.sublist.common.view'] = '檢視';
        translation['dqf.sublist.common.id'] = 'ID';
        translation['dqf.sublist.dp.applies_to'] = '套用到';
        translation['dqf.sublist.common.dunning_procedure'] = '催款程序';
        translation['dqf.sublist.common.dunning_level'] = '層級';
        translation['dqf.sublist.record.last_letter_sent'] = '已傳送最後一封信件';
        translation['dqf.sublist.record.dunning_allow_email'] = '允許電子郵件';
        translation['dqf.sublist.record.dunning_allow_print'] = '允許列印';
        translation['dqf.sublist.record.pause_dunning'] = '暫停催款';
        translation['dqf.sublist.common.evaluation_date'] = '評估日期';
        translation['dqf.sublist.common.related_entity'] = '收件者';
        translation['dbu.form.title'] = '大量更新顧客催款記錄';
        translation['dbu.form.update_button'] = '更新';
        translation['dbu.form.field.subsidiary'] = '子公司';
        translation['dbu.form.flh.subsidiary'] = '選擇您想針對顧客記錄進行大量更新的催款欄位。將套用更新至屬於所選子公司的所有顧客記錄。';
        translation['dbu.form.field.allow_email'] = '允許用電子郵件傳送信件';
        translation['dbu.form.flh.allow_email'] = '選擇執行大量更新後套用至此顧客記錄欄位內的值：\n未變更 – 將不變更目前的欄位值。 \n已勾選 – 大量更新後將勾選顧客記錄中的方格。 \n未勾選 – 大量更新後將清除方格。';
        translation['dbu.form.field.allow_print'] = '允許列印信件';
        translation['dbu.form.flh.allow_print'] = '選擇執行大量更新後套用至此顧客記錄欄位內的值：\n未變更 – 將不變更目前的欄位值。 \n已勾選 – 大量更新後將勾選顧客記錄中的方格。 \n未勾選 – 大量更新後將清除方格。';
        translation['dbu.form.field.dont_send_cust_email'] = '不要將信件傳送至顧客電子郵件';
        translation['dbu.form.flh.dont_send_cust_email'] = '選擇執行大量更新後套用至此顧客記錄欄位內的值：\n未變更 – 將不變更目前的欄位值。 \n已勾選 – 大量更新後將勾選顧客記錄中的方格。 \n未勾選 – 大量更新後將清除方格。';
        translation['dbu.form.primary_field_group'] = '準則';
        translation['dbu.form.bulk_update_field_group'] = '大量更新欄位';
        translation['dbu.form.options.unchanged'] = '- 未變更 -';
        translation['dbu.form.options.checked'] = '已檢查';
        translation['dbu.form.options.not_checked'] = '未勾選';
        translation['dbu.validation.no_selection'] = '沒有要更新的欄位，因為所有欄位都已選擇 - 未變更。只需至少指定一個要變更的欄位，就可執行大量更新（勾選或未勾選）。';
        translation['dbu.validation.no_sending_media'] = '若同時勾選「允許用電子郵件傳送信件」和「允許列印信件」方格，則無法儲存顧客記錄。在以下一個或兩個欄位中選擇「已勾選」：\n- 允許以電子郵件傳送信件\n- 允許列印信件';
        translation['dbu.validation.verify_submit_ow'] = '將更新所選子公司的所有顧客記錄之催款程序 {SUBSIDIARY}。您將在流程完成後收到電子郵件訊息。確定要進行大量更新嗎？點選「確定」，將開始大量更新流程，且流程無法回復。';
        translation['dbu.validation.verify_submit_si'] = '將更新所有顧客記錄的催款程序。您將在流程完成後收到電子郵件訊息。確定要進行大量更新嗎？點選「確定」，將開始大量更新流程，且流程無法回復。';
        translation['dbu.form.reminderinlinehelp'] = 'NetSuite 建議您在非正常辦公時間內使用大量更新功能。此舉可確保貴公司的其他使用者未在大量更新流程期間更新顧客記錄。';
        translation['dbu.validation.validate_concurrency_ow'] = '大量更新顧客催款記錄是由  {USER} 為子公司  {SUBSIDIARY} 開始進行。必須完成大量更新，才能為相同的子公司執行另一次的顧客大量更新。';
        translation['dbu.validation.validate_concurrency_si'] = '系統一次只能執行一項大量更新。大量更新目前是由  {USER} 執行。';
        translation['dbu.customer.message.complete_subject'] = '大量更新顧客催款記錄';
        translation['dbu.customer.message.complete_body_ow'] = [
          'NetSuite 向您問好。<br />',
          '已完成子公司的大量更新顧客催款記錄 {SUBSIDIARY}。',
          '允許用電子郵件傳送信件 = {ALLOW_EMAIL}',
          '允許列印信件 = {ALLOW_PRINT}',
          '不要將信件傳送至顧客電子郵件 = {DONT_SEND_TO_CUST}<br />',
          '已更新的顧客記錄數量： {PROCESSED_RECORDS}，共  {RECORD_COUNT} 個。{ERROR_STEPS}',
          '這是一封系統建立的電子郵件。<br />',
          '謝謝您，',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.complete_body_si'] = [
          'NetSuite 向您問好。<br />',
          '已完成大量更新顧客催款記錄。',
          '允許用電子郵件傳送信件 = {ALLOW_EMAIL}',
          '允許列印信件 = {ALLOW_PRINT}',
          '不要將信件傳送至顧客電子郵件 = {DONT_SEND_TO_CUST}<br />',
          '已更新的顧客記錄數量： {PROCESSED_RECORDS}，共  {RECORD_COUNT} 個。{ERROR_STEPS}',
          '這是一封系統建立的電子郵件。<br />',
          '謝謝您，',
          'NetSuite'
        ].join('<br />');
        translation['dbu.customer.message.error_file_header'] = '顧客 ID，錯誤';
        translation['dbu.customer.message.error_filename'] = 'Failed Updates.csv';
        translation['dbu.customer.message.error_steps'] = '<br />請下載附件檔案，檢視未更新的記錄清單。您可以手動更新這些記錄。';
        translation['dc.validateCustomer.noDPMatched'] = '找不到和顧客記錄相符的催款程序。';
        translation['dc.validateCustomer.recipientNoEmail'] = '下列催款信收件人在其聯絡記錄上沒有電子郵件地址： {CONTACTNAMES}';
        translation['dc.validateCustomer.customerNoEmail'] = '無法儲存記錄。已勾選「允許用電子郵件傳送信件」，但卻沒有要傳送信件的電子郵件地址或催款收件人。在下列情況下方可儲存此記錄：\n-「催款收件人」子標籤必須內含一位附電子郵件地址的聯絡人。 \n-顧客記錄中的「電子郵件」欄位必須要有一個電子郵件地址。 \n\n備註：若未勾選「不要將信件傳送至顧客電子郵件」，則必須提供顧客的電子郵件地址。';
        translation['dc.validateCustomer.noEmailAtAll'] = '顧客記錄上沒有電子郵件地址，而且此顧客也沒有指定的催款信收件人。請在「顧客記錄」上輸入電子郵件地址，或在「催款」子標籤上最少選擇一個有電子郵件地址的催款信收件人。';
        translation['dc.validateCustomer.recipientListEmpty'] = '無法儲存記錄。已勾選「允許用電子郵件傳送信件」，但卻沒有要傳送信件的催款收件人。欲儲存此記錄，「催款收件人」子標籤必須內含一位附電子郵件地址的聯絡人。 \n\n備註：若未勾選「不要將信件傳送至顧客電子郵件」，則必須提供顧客的電子郵件地址。';
        translation['dc.validateCustomer.dpMatched'] = '顧客記錄符合 \'{DP}\' 催款程序。想要變更催款程序嗎？';
        translation['dc.validateCustomer.dpAllReadyAssigned'] = '找到的催款程序和記錄中已指派的催款程序相同。';
        translation['dc.validateDP.managerRequired'] = '要求催款經理。';
        translation['dc.validateDP.sendingModeRequired'] = '在下列方格中，必須勾選最少一個：\n- 允許以電子郵件傳送信件\n- 允許列印信件';
        translation['dl.validateDL.dlCountExceeded'] = '您已超出可能的最高催款層級金額。';
        translation['dl.validateDL.lowerDaysOverDue'] = '逾期天數必須小於  {DAYS} 天。';
        translation['dl.validateDL.higherDaysOverdue'] = '逾期天數必須大於  {DAYS} 天。';
        translation['dl.validateDL.daysOverdueExist'] = '逾期天數  {DAYS} 天已在另一行上。';
        translation['dl.validateDL.lastRecordDeletion'] = '您只能刪除清單中的最後一筆記錄。';
        translation['dl.validateDL.daysBetSending'] = '傳送信件的間隔天數必須大於或等於  {DAYS} 天';
        translation['dl.validateDL.minOutsBalGEZero'] = '最低未付金額必須大約或等於零 (0)。';
        translation['dl.validateDL.daysOverdueLessPrevious'] = '催款層級的逾期天數  {LEVEL}（{LEVEL_OVERDUE} 天）必須小於催款層級內的逾期天數  {PREVLEVEL}（{PREVLEVEL_OVERDUE} 天）。';
        translation['dl.validateDL.dlRequired'] = '需要輸入至少一個催款層級。';
        translation['dp.validateDP.editNotAllowed'] = '不允許您編輯催款程序類型。';
        translation['dp.information.possibleMultipleSending'] = '停用「最短催款間隔」欄位將允許您的帳戶一天內傳送多封催款信至一位顧客。確定要停用它嗎？';
        translation['dba.pagination.failedPrevPage'] = '返回上一頁失敗。';
        translation['dq.validation.str_send'] = '傳送';
        translation['dq.validation.str_remove'] = '移除';
        translation['dq.validation.str_print'] = '列印';
        translation['dq.validation.chooseAction'] = '請選擇一封信進行';
        translation['dq.validation.removalConfirmation'] = '確定要從佇列中移除所選的記錄嗎？';
        translation['dq.pt.dunningQueueTitle'] = '催款佇列';
        translation['dq.pt.source'] = '來源類型';
        translation['dq.pt.dunningProcedure'] = '催款程序';
        translation['dq.pt.dunningLevel'] = '催款層級';
        translation['dq.pt.lastLetterSent'] = '已傳送最後一封信件';
        translation['dq.pt.emailingAllowed'] = '允許傳送電子郵件';
        translation['dq.pt.printingAllowed'] = '允許列印';
        translation['dq.pt.send'] = '傳送';
        translation['dq.pt.remove'] = '移除';
        translation['dq.pt.print'] = '列印';
        translation['dq.pt.customer'] = '顧客';
        translation['dt.validator.invalidDefault'] = '必須為每種催款範本類型選擇一個預設範本。檢閱電子郵件和 PDF 子標籤，並選擇一個預設範本。';
        translation['dt.validator.duplicateLanguage'] = '此範本類型已使用此語言。';
        translation['dt.validator.noTemplateDocs'] = '欲儲存此記錄，必須最少有一份電子郵件範本文件，以及一份 PDF 範本文件。';
        translation['dt.validator.subject'] = '催款範本文件核對失敗';
        translation['dt.validator.body'] = '下列範本文件無效：';
        translation['dt.validator.defaultDeletion'] = '您正在嘗試刪除目前未設定為預設的範本。欲刪除此範本，必須先選擇其他範本作為您的預設範本。';
        translation['dt.validator.xmlEmailDeprecated'] = '您不能新增、編輯或移除 XML 電子郵件範本行。正逐步淘汰以 XML 為基礎的催款信之使用。若您新增電子郵件範本至「催款電子郵件範本」子標籤，儲存此記錄將刪除所有在「催款 XML 電子郵件範本」子標籤中的行。';
        translation['dt.validator.deleteAllXMLLines'] = '儲存此記錄將刪除所有在「催款 XML 電子郵件範本」子標籤中的行。';
        translation['dt.validator.noEMailDocs'] = '欲儲存此記錄，最少必須要有一種電子郵件範本。';
        translation['dt.validator.noPDFDocs'] = '欲儲存此記錄，最少必須要有一種 PDF 範本。';
        translation['dt.validator.multipleDefault'] = '確定要用此範本作為預設範本嗎？';
        translation['dlr.validateDLR.noAmount'] = '催款層級規則應最少有一個催款層級規則金額。';
        translation['dlr.validateDLR.noDefaultAmount'] = '催款層級規則應最少將一個催款層級規則金額設定為預設金額。';
        translation['dlr.validateDLR.duplicateCurrency'] = '貨幣必須是唯一的。';
        translation['dlr.validateDLR.invalidAmount'] = '金額必須大於或等於 0。';
        translation['dlr.validateDLR.changeDefaultCurrency'] = '確定要將此行的貨幣和金額設定為預設值嗎？（這將變更目前的預設金額和貨幣）';
        translation['dlr.validateDLR.negativeDaysOverdue'] = '「逾期天數」欄位內含一個負數。這將在付款逾期前傳送信件至顧客。';
        translation['dlr.validateDLR.daysOverdueChanged'] = '在催款層級規則變更「逾期天數」的值可能會改變催款層級的程序或排列，進而有可能觸發傳送不正確的催款信。因此若您想要變更正在使用的催款層級，建議您檢查每個催款步驟中之催款層級的排列。';
        translation['dlr.validateDLR.cannotAddCurrency'] = '不得新增貨幣，因為未啟用「多種貨幣」功能。';
        translation['der.flh.dunningProcedure'] = '此欄位說明指派至發票或顧客的催款程序。';
        translation['der.flh.dunningLevel'] = '此欄位說明評估後的目前催款等級。';
        translation['der.flh.relatedEntity'] = '此欄位連結至催款收件人的實體或聯絡記錄。';
        translation['der.flh.messageContent'] = '此欄位內含催款信的內容。';
        translation['der.flh.invoiceList'] = '此欄位列示和催款信相關的發票。';
        translation['der.flh.emailRecipient'] = '此欄位顯示催款信收件人的電子郵件地址。';
        translation['der.flh.subject'] = '此欄位顯示催款信的主題行。';
        translation['der.flh.dunningManager'] = '此欄位顯示指派至顧客的催款經理，且已連結至催款經理的員工記錄。';
        translation['der.flh.dunningTemplate'] = '此欄位已連結至催款範本記錄。';
        translation['der.flh.customer'] = '此欄位已連結至顧客記錄。';
        translation['der.flh.status'] = '此欄位說明是否已成功傳送電子郵件。可能是其中一種下列狀態：\n\n•已傳送 - 已成功傳送電子郵件。\n•失敗 - 系統傳送電子郵件失敗，因為遺漏資訊。例如：沒有顧客或聯絡人的電子郵件地址。\n• 已佇列 - 催款信仍處於催款佇列，且尚未處理。\n• 已移除 - 催款經理從此催款佇列中移除此記錄。';
        translation['dlr.flh.daysOverdue'] = '必須傳送催款信時，請輸入逾期付款的天數。欲在逾期日前傳送提醒信，請輸入一個負數。';
        translation['ds.flh.description'] = '輸入此記錄的說明。';
        translation['dp.flh.dunningProcedure'] = '輸入此催款程序的名稱。';
        translation['dp.flh.description'] = '輸入此催款程序的說明。';
        translation['dp.flh.appliesTo'] = '選擇將指派此催款程序至顧客或發票。若您選擇「顧客」，您必須同時勾選或清除「允許覆蓋」方格。';
        translation['dp.flh.sendingSchedule'] = '選擇是否要自動或手動傳送催款信。';
        translation['dp.flh.minimumDunningInterval'] = '選擇連續傳送兩封信至相同顧客的最少天數間隔。此間隔適用於手動和自動傳送。';
        translation['dp.flh.subsidiary'] = '選擇套用此催款程序的子公司。';
        translation['dp.flh.savedSearchCustomer'] = '選擇套用此程序的顧客已儲存搜尋。';
        translation['dp.flh.allowOverride'] = '若您勾選此方格，發票層級的催款程序可覆寫此程序。若發票符合該程序的條件，則無論是否已指派顧客層級的催款，都將使用發票等級的催款程序。';
        translation['dp.flh.department'] = '選擇套用此程序的部門。';
        translation['dp.flh.class'] = '選擇套用此程序的類別。';
        translation['dp.flh.location'] = '選擇套用此程序的地點。';
        translation['dp.flh.savedSearchInvoice'] = '選擇套用此程序的發票已儲存搜尋。';
        translation['dp.flh.assignAutomatically'] = '勾選此方格，即啟動系統根據選擇條件，自動指派此催款程序至客戶或發票。';
        translation['dt.flh.name'] = '輸入此催款範本的名稱。';
        translation['dt.flh.description'] = '輸入此催款範本的說明。';
        translation['dt.flh.attachStatement'] = '勾選此方格，將顧客明細附加至使用此範本的催款信。';
        translation['dt.flh.attachInvoiceCopy'] = '勾選此方格，將發票附加至使用此範本的催款信。';
        translation['dt.flh.overdueInvoiceOnly'] = '若您只想將附加逾期發票，則勾選此方格。';
        translation['dt.flh.openTransactionOnly'] = '若您只想將未完成交易包含於顧客報表內，則勾選此方格。';
        translation['dt.flh.inactive'] = '勾選此方格，停用範本。清單不會顯示未啟動的範本，且不能用它來傳送催款信。';
        translation['dc.flh.allowEmail'] = '若您想要用電子郵件傳送信件，則勾選此方格。';
        translation['dc.flh.lastLetterSent'] = '傳送最後一封催款信的日期。';
        translation['dc.flh.dunningLevel'] = '此欄位顯示最後一次催款評估以來的現有催款層級。';
        translation['dc.flh.dunningManager'] = '選擇負責處理此顧客催款的人，以及應該顯示為催款信寄件人的姓名。';
        translation['dc.flh.dunningProcedure'] = '此欄位顯示指派至顧客的催款程序。若點選「自動指派」，系統將根據催款選擇條件，指派適當的程序。從下拉式清單中選擇不同的值，變更指派至顧客的催款程序。下拉式清單會根據催款程序記錄定義的選擇條件，僅顯示適用於此顧客的催款程序。';
        translation['dc.flh.allowPrint'] = '若您想要列印信件，則勾選此方格。';
        translation['dc.flh.pauseReason'] = '選擇一個理由，說明暫停催款的原因。';
        translation['dc.flh.pauseReasonDetail'] = '選擇一個詳細內容，說明暫停催款的原因。';
        translation['dc.flh.pauseDunning'] = '勾選此方格，暫時停止催款流程。';
        translation['dc.flh.dunningRecepients'] = '選擇更多的催款收件人';
        translation['dc.flh.allowEmail'] = '若您想要用電子郵件傳送信件，則勾選此方格。';
        translation['di.flh.lastLetterSent'] = '傳送最後一封催款信的日期。';
        translation['di.flh.dunningLevel'] = '此欄位顯示最後一次催款評估以來的現有催款層級。';
        translation['di.flh.dunningManager'] = '選擇負責處理此發票催款的人，其姓名應該顯示為催款信寄件人。';
        translation['di.flh.dunningProcedure'] = '此欄位顯示指派至發票的催款程序。若點選「自動指派」，系統將根據催款選擇條件，指派適當的程序。從下拉式清單中選擇不同的值，變更指派至發票的催款程序。下拉式清單會根據催款程序記錄定義的選擇條件，僅顯示適用於此發票的催款程序。';
        translation['di.flh.allowPrint'] = '若您想要列印信件，則勾選此方格。';
        translation['di.flh.pauseReason'] = '選擇一個理由，說明暫停催款的原因。';
        translation['di.flh.pauseReasonDetail'] = '選擇一個理由詳情，說明暫停催款的原因。';
        translation['di.flh.pauseDunning'] = '勾選此方格，暫時停止催款流程。';
        translation['dp.validate.unpause'] = '清除「暫停催款」方格將立即觸發催款評估工作流程。NetSuite 可能會視催款評估結果，傳送催款信至此顧客。確定要恢復催款嗎？';
        translation['dc.validateSubsidiary.existingConfigSubsidiary'] = '已存在此子公司的催款設定記錄。';
        translation['l10n.address.invalidPOBox'] = '請輸入有效的郵政信箱號碼。';
        translation['l10n.address.invalidZipCode'] = '請輸入有效的郵遞區號。';
        translation['l10n.address.invalidRuralRoute'] = '請輸入有效的郊區路線值。';
        translation['l10n.accessForDDandAccountant'] = '只有管理員、催款總監和會計角色才可建立和修改此記錄類型。';
        translation['l10n.deleteAccessForDDandAccountant'] = '只有管理員、催款總監和會計角色才可刪除此記錄類型。';
        translation['l10n.accessForAdministrator'] = '只有管理員角色才可建立和修改此記錄類型。';
        translation['l10n.deleteAccessForAdministrator'] = '只有管理員角色才可刪除此記錄類型。';
        translation['l10n.noPagePrivilege'] = '您沒有檢視此頁面的權限。';
        translation['dq.pdfemail.folderName'] = '用於列印的 PDF 催款信件';
        translation['dq.pdfemail.subject'] = '所產生的 PDF 催款信件於「文件櫃」中可供列印。';
        translation['dq.pdfemail.link'] = '按一下連結檢視 PDF 信件的資料夾：';
        translation['dq.pdfemail.tableHead'] = '下列表格提供儲存 PDF 檔案資料夾的詳細資料。';
        translation['dq.pdfemail.exceedLimit'] = '因為已超過附件限制，所產生的檔案無法附加。';
        translation['dq.pdfemail.tableLabel1'] = '資料夾';
        translation['dq.pdfemail.tableLabel2'] = '路徑';
        translation['dq.pdfemail.tableLabel3'] = '狀態';
        translation['dq.pdfemail.tableLabel4'] = '備註';

        break;
    }
  }

  return translation;
};
