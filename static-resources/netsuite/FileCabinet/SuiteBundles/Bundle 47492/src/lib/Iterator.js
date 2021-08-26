/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }
TAF.Lib = TAF.Lib || {};

TAF.Lib.Iterator = function _Iterator(list) {
    this.list = list || {};
    this.keys = Object.keys(list);
    this.index = 0;
};


TAF.Lib.Iterator.prototype.next = function _Next() {
    return this.list[this.keys[this.index++]];
};


TAF.Lib.Iterator.prototype.hasNext = function _HasNext() {
    return this.index < this.keys.length;
};


TAF.Lib.Iterator.prototype.reset = function _Reset() {
    this.index = 0;
};


//TAF.Lib.Iterator.prototype.first = function _First() {
//    this.reset();
//    return this.next();
//};


//TAF.Lib.Iterator.prototype.each = function _Each(callback, callbackParams) {
//    for (var item = this.first(); this.hasNext(); item = this.next()) {
//        callback(item, callbackParams);
//    }
//};
