/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dao = dao || {};

/**
 * @constructor
 * @extends suite_l10n.dao.BasicDAO<dunning.model.DunningCustomer>
 */
dao.DunningCustomerDAO = function () {
  suite_l10n.dao.BasicDAO.call(this, 'customer');
  suite_l10n.dao.BasicDAO.prototype.setFieldMap.call(this, {
    id: 'internalid',
    entityid: 'entityid',
    subsidiary: 'subsidiary',
    companyName: 'companyName',
    firstName: 'firstName',
    lastName: 'lastName',
    isPerson: 'isperson',
    language: 'language',
    sendByEmail: 'custentity_3805_dunning_letters_toemail',
    sendByPrint: 'custentity_3805_dunning_letters_toprint',
    isDunningPaused: 'custentity_3805_dunning_paused',
    lastSentDate: 'custentity_3805_last_dunning_letter_sent',
    dunningProcedureId: 'custentity_3805_dunning_procedure',
    dunningLevelId: 'custentity_3805_dunning_level',
    dunningManager: 'custentity_3805_dunning_manager',
    email: 'email',
    excludeCompanyEmail: 'custentity_3805_exclude_comp_email'
  });
  suite_l10n.dao.BasicDAO.prototype.setModelClass.call(this, dunning.model.DunningCustomer);
};

dao.DunningCustomerDAO.prototype = Object.create(suite_l10n.dao.BasicDAO.prototype);
dao.DunningCustomerDAO.prototype.constructor = dao.DunningCustomerDAO;

dao.DunningCustomerDAO.prototype.updateRecord = function (model) {
  return suite_l10n.dao.BasicDAO.prototype.update.call(this, model);
};

/**
 * Retrieves selected data of contacts
 * @param {number[]} contactIds Array of contact ids
 * @returns {Array.<{internalid:number,name:string,email:string}>} contacts search result
 */
dao.DunningCustomerDAO.prototype.loadContacts = function (contactIds) {
  if (contactIds.length === 0) {
    return [];
  }

  var search = new ns_wrapper.Search('contact');
  search.addColumn('entityid');
  search.addColumn('email');
  search.addFilter('internalid', 'anyof', contactIds);

  return search.map(function (result) {
    return {
      internalid: result.getId(),
      name: result.getValue('entityid'),
      email: result.getValue('email')
    };
  });
};

/**
 * @returns {Array.<dunning.model.DunningCustomer>}
 */
dao.DunningCustomerDAO.prototype.getCustomersWithDunningProcedures = function () {
  return this.retrieveWithFilters([
    ns_wrapper.search.createSearchFilter('custentity_3805_dunning_procedure', null, 'noneof', '@NONE@')
  ]);
};

/**
 * @param {nlobjSearchResult} contactSearchResult
 * @param {number} dunningManager
 * @returns {dunning.view.ViewDunningContact}
 */
dao.DunningCustomerDAO.prototype.getDunningContact = function (contactSearchResult, dunningManager) {
  var contact = new dunning.view.ViewDunningContact();
  contact.id = contactSearchResult.getId();
  contact.email = contactSearchResult.getValue('email');
  contact.dunningManager = dunningManager;
  contact.source = [contactSearchResult];
  return contact;
};

/**
 * @param {dunning.model.DunningCustomer} model
 * @returns {Array}
 */
dao.DunningCustomerDAO.prototype.getDunningRecipients = function (model) {
  var record = new ns_wrapper.Record(this._recordType, model.id);
  var lines = record.getLineItems('recmachcustrecord_3805_dunning_recipient_cust');

  return lines.map(function (line) {
    return line.custrecord_3805_dunning_recipient_cont;
  });
};

/**
 * Retrieve a list of contact records associated with the given customer
 * @param {dunning.model.DunningCustomer} model
 * @returns {Array.<dunning.view.ViewDunningContact>}
 */
dao.DunningCustomerDAO.prototype.getDunnableContacts = function (model) {
  var ids = this.getDunningRecipients(model);

  if (ids.length === 0) {
    return [];
  }

  var search = new ns_wrapper.Search('contact');
  search.addFilter('internalid', 'anyof', ids);
  search.addColumn('email');

  return search.map(function (result) {
    return this.getDunningContact(result, model.dunningManager);
  }.bind(this));
};
