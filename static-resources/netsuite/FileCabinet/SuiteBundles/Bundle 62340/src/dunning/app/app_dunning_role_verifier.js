/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningRoleVerifier = function DunningRoleVerifier (isCS) {
  var ADMINISTRATOR = 'administrator';
  var AR_CLERK = 'ar_clerk';
  var ACCOUNTANT = 'accountant';
  var DUNNING_DIRECTOR = 'customrole_3805_dunning_director';
  var DUNNING_MANAGER = 'customrole_3805_dunning_manager';

  var CUST_ROLE_DD = 1;
  var CUST_ROLE_DM = 2;

  var ctx = ns_wrapper.context();

  var obj = {
    isRoleForDunning: isRoleForDunning
  };

  function getRoleId () {
    return ctx.getRoleId();
  }

  function getRole () {
    return ctx.getRole();
  }

  function getUser () {
    return ctx.getUser();
  }

  function isRoleForDunning () {
    var roleId = getRoleId();
    var userId = getUser();
    var role = getRole();
    return assessRole(roleId, userId, role);
  }

  function assessRole (roleId, userId, role) {
    var isDunningRole = false;
    switch (roleId) {
      case ADMINISTRATOR:
      case DUNNING_DIRECTOR:
      case DUNNING_MANAGER:
      case AR_CLERK:
      case ACCOUNTANT:
        isDunningRole = true;
        break;
      default:
        isDunningRole = false;
        break;
    }

    // only do extra checking of role if it does not pass the conditions above in the switch
    if (!isDunningRole) {
      var flag = getDunningRoleFlag(userId, role);
      if (flag == CUST_ROLE_DD || flag == CUST_ROLE_DM) {
        isDunningRole = true;
      }
    }

    return isDunningRole;
  }

  var dunningRole;

  function getDunningRoleFlag (userId, currentRole) {
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
