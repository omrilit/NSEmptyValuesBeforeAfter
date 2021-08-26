/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var dao = dao || {};

dao.DunningEmployeeDAO = function DunningEmployeeDAO () {
  var Search = ns_wrapper.Search;

  // No need for basic DAO implementation
  var obj = {};

  /**
   * Retrieve the assigned dunning role given an employee's ID and one of his role IDs
   *
   * Returns a blank string if the selected role is not flagged as a dunning role
   *
   */
  obj.getDunningRole = function getDunningRole (employeeId, roleId) {
    var INTERNALID = 'internalid';
    var ROLE_RECORD = 'role';
    var DUNNING_ROLE_FLAG_FIELD = 'custrecord_dunning_role_flag';

    var search = new Search('employee');
    search.addFilter(INTERNALID, 'is', employeeId);
    search.addJoinFilter(INTERNALID, ROLE_RECORD, 'is', roleId);
    search.addJoinColumn(DUNNING_ROLE_FLAG_FIELD, ROLE_RECORD);

    var it = search.getIterator();

    var dunningRole = '';
    if (it.hasNext()) {
      var rs = it.next(); // expect 1 result only
      dunningRole = rs.getValue(DUNNING_ROLE_FLAG_FIELD, ROLE_RECORD);
    }

    return dunningRole;
  };

  // No need for basic DAO implementation
  return obj;
};
