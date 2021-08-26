/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

if (!TAF) { var TAF = {}; }


TAF.Account = function _Account(id) {
	this.name = '';
	this.accountNumber = '';
	this.subsidiary = '';
	this.accountType = '';
	this.accountDescription = '';
	this.bankNumber = '';
	this.localizedName = '';
	this.localizedNumber = '';
	
    var is_one_world = true;
    this.isOneWorld = function _IsOneWorld(value) { is_one_world = value; };
    
    var account_id = id;
    this.getAccountId = function _GetAccountId() { return account_id; };
    
    var scoa_id = "";
    this.setSCOAId = function _SetSCOAId(value) { scoa_id = value; };
    this.getSCOAId = function _GetSCOAId() { return scoa_id; };
    
    var scoa_name = "";
    this.setSCOAName = function _SetSCOAName(value) { scoa_name = value; };
    this.getSCOAName = function _GetSCOAName() { return is_one_world ? scoa_name : this.name; };
    
    var scoa_number = "";
    this.setSCOANumber = function _SetSCOANumber(value) { scoa_number = value; };
    this.getSCOANumber = function _GetSCOANumber() { return is_one_world ? scoa_number : this.accountNumber; };
    
    this.setAccountName = function _SetAccountName(value) { this.name = value; };
    this.getAccountName = function _GetAccountName() { return this.name; };
    
    this.setAccountNumber = function _SetAccountNumber(value) { this.accountNumber = value; };
    this.getAccountNumber = function _GetAccountNumber(value) { return this.accountNumber; };
    
    this.setSubsidiary = function _SetSubsidiary(value) { this.subsidiary = value; };
    this.getSubsidiary = function _GetSubsidiary() { return this.subsidiary; };
    
    this.setType = function _SetType(value){ this.accountType = value; };
    this.getType = function _GetType() { return this.accountType; };
    
    this.setDescription = function _SetDescription(value) { this.accountDescription = value; };
    this.getDescription = function _GetDescription() { return this.accountDescription; };

    this.setBankNumber = function _SetBankNumber(value) { this.bankNumber = value; };
    this.getBankNumber = function _GetBankNumber() { return this.bankNumber; };

    this.setLocalizedName = function _SetLocalizedName(value) { this.localizedName = value; };
    this.getLocalizedName = function _GetLocalizedName() { return this.localizedName; };
    
    this.setLocalizedNumber = function _SetLocalizedNumber(value) { this.localizedNumber = value; };
    this.getLocalizedNumber = function _GetLocalizedNumber() { return this.localizedNumber; };
};
