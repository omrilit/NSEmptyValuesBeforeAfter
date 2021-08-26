/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }


TAF.AccountType = function _AccountType(id) {
    this.id = id;
    this.getId = function _GetId() { return this.id; };

    this.name = null;
    this.getName = function _GetName() { return this.name; };
    this.setName = function _SetName(value) { this.name = value; };
};
