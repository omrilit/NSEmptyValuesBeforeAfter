/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningRoleAssessor = function DunningRoleAssessor (isCS) {
  var ADMINISTRATOR = 'administrator';
  var AR_CLERK = 'ar_clerk';
  var ACCOUNTANT = 'accountant';
  var DUNNING_DIRECTOR = 'customrole_3805_dunning_director';
  var DUNNING_MANAGER = 'customrole_3805_dunning_manager';

  var DUNNING_MANAGER_CUST = 'custentity_3805_dunning_manager';
  var DUNNING_MANAGER_INV = 'custbody_3805_dunning_manager';

  var FLAG_ADMIN = 'administrator';
  var FLAG_ASSIGNED_MANAGER = 'assigned_manager';
  var FLAG_DIRECTOR = 'director';
  var FLAG_MANAGER = 'manager';

  var CUST_ROLE_DD = 1;
  var CUST_ROLE_DM = 2;

  var DUNNING_ROLES_STATE_FLAGS;

  var ctx = ns_wrapper.context();

  var dunningVerifier = new dunning.app.DunningRoleVerifier(isCS);

  var obj = {
    isDunningManager: isDunningManager,
    isDunningDirector: isDunningDirector,
    retrieveDunningRole: retrieveDunningRole,
    getDunningVerifier: getDunningVerifier
  };

  function getRoleId () {
    return ctx.getRoleId();
  }

  function loadDunningRoleStateFlags () {
    if (!DUNNING_ROLES_STATE_FLAGS) {
      var ROLE_STATE_FLAGS = 'dunning_subtab_config_role';
      DUNNING_ROLES_STATE_FLAGS = new suite_l10n.variable.LocalizationVariableList(ROLE_STATE_FLAGS);
    }
  }

  function retrieveDunningRole () {
    loadDunningRoleStateFlags();

    var roleId = getRoleId();
    var role;

    switch (roleId) {
      case ADMINISTRATOR:
        role = DUNNING_ROLES_STATE_FLAGS.getIdByValue(FLAG_ADMIN);
        break;
      case DUNNING_DIRECTOR:
      case ACCOUNTANT:
        role = DUNNING_ROLES_STATE_FLAGS.getIdByValue(FLAG_DIRECTOR);
        break;
      case DUNNING_MANAGER:
      case AR_CLERK:
        role = checkAssignedManager();
        break;
    }

    // only do extra checking of role if it does not pass the conditions above in the switch
    if (!role) {
      var dunningRole = getDunningRoleFlag();

      if (dunningRole == CUST_ROLE_DD) {
        role = DUNNING_ROLES_STATE_FLAGS.getIdByValue(FLAG_DIRECTOR);
      } else if (dunningRole == CUST_ROLE_DM) {
        role = checkAssignedManager();
      }
    }

    return role || '';
  }

  function checkAssignedManager () {
    var managerField;
    var recType = ns_wrapper.api.record.getRecordType();
    var role;

    if (recType === 'customer') {
      managerField = DUNNING_MANAGER_CUST;
    } else {
      managerField = DUNNING_MANAGER_INV;
    }

    var dunningManagerId = ns_wrapper.api.field.getFieldValue(managerField);
    var currentUser = ctx.getUser();

    if (dunningManagerId == currentUser) {
      role = DUNNING_ROLES_STATE_FLAGS.getIdByValue(FLAG_ASSIGNED_MANAGER);
      return role || '';
    }
    role = DUNNING_ROLES_STATE_FLAGS.getIdByValue(FLAG_MANAGER);

    return role || '';
  }

  function isDunningDirector () {
    var roleId = getRoleId();
    var isDD = false;

    switch (roleId) {
      case ADMINISTRATOR:
      case DUNNING_DIRECTOR:
      case ACCOUNTANT:
        isDD = true;
        break;
      default:
        isDD = false;
        break;
    }

    if (getDunningRoleFlag() == CUST_ROLE_DD) {
      isDD = true;
    }

    return isDD;
  }

  function isDunningManager () {
    var roleId = getRoleId();
    var isDM = false;

    switch (roleId) {
      case DUNNING_MANAGER:
      case AR_CLERK:
        isDM = true;
        break;
      default:
        isDM = false;
        break;
    }

    if (getDunningRoleFlag() == CUST_ROLE_DM) {
      isDM = true;
    }

    return isDM;
  }

  function getDunningVerifier () {
    return dunningVerifier;
  }

  var dunningRole;

  function getDunningRoleFlag () {
    var userId = ctx.getUser();
    var currentRole = ctx.getRole();
    if (isCS && !dunningRole) {
      var suiteletURL = ns_wrapper.api.url.resolveUrl('SUITELET', 'customscript_3805_search_emp_dun_role_su', 'customdeploy_3805_search_emp_dun_role_su', true);
      var responseObj = ns_wrapper.api.url.requestUrlCs(suiteletURL, {
        'userId': userId,
        'currentRole': currentRole
      });
      dunningRole = responseObj.getBody();
    } else if (!dunningRole) {
      var employeeDao = new dao.DunningEmployeeDAO();
      dunningRole = employeeDao.getDunningRole(userId, currentRole);
    }

    return dunningRole;
  }

  return obj;
};
