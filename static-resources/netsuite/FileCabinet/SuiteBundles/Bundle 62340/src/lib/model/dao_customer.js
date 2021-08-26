/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var suite_l10n = suite_l10n || {};
suite_l10n.dao = suite_l10n.dao || {};

/**
 * @constructor
 * @extends suite_l10n.dao.BasicDAO<suite_l10n.model.Customer>
 */
suite_l10n.dao.CustomerDAO = function () {
  suite_l10n.dao.BasicDAO.call(this, 'customer');
  suite_l10n.dao.BasicDAO.prototype.setFieldMap.call(this, {
    entityid: 'entityid',
    firstName: 'firstname',
    lastName: 'lastname',
    isPerson: 'isperson',
    subsidiary: 'subsidiary'
  });
  suite_l10n.dao.BasicDAO.prototype.setModelClass.call(this, suite_l10n.model.Customer);
};

suite_l10n.dao.CustomerDAO.prototype = Object.create(suite_l10n.dao.BasicDAO.prototype);
suite_l10n.dao.CustomerDAO.prototype.constructor = suite_l10n.dao.CustomerDAO;
