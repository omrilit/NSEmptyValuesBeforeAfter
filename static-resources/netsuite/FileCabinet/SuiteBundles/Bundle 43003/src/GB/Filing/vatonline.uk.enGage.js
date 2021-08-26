/**
 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.
 */
XML.ignoreComments = true;
XML.ignoreProcessingInstructions = true;
XML.ignoreWhitespace = true;
XML.prettyPrinting = false;
//http://www.hmrc.gov.uk/ebu/vat-ec-techpack.htm
var VAT_ONLINE_SUBMIT_REQ_XML_GB = 'VAT_ONLINE_SUBMIT_REQ_XML_GB';
var VAT_ONLINE_SUBMIT_REQ_PAYLOAD_XML_GB = 'VAT_ONLINE_SUBMIT_REQ_PAYLOAD_XML_GB';
var VAT_ONLINE_POLL_REQ_XML_GB = 'VAT_ONLINE_POLL_REQ_XML_GB';
var VAT_ONLINE_DELETE_REQ_XML_GB = 'VAT_ONLINE_DELETE_REQ_XML_GB';
var VAT_ONLINE_DATA_REQ_XML_GB = 'VAT_ONLINE_DATA_REQ_XML_GB';

var XMLParser = VAT.XML.Parser;

var enGage;
if (!enGage) enGage = new(function() {
	var _IsTestMode = false;
	this.SetTestMode = function(isTestMode) {
		_IsTestMode = isTestMode;
	};
	
	this.IsTestMode = function() {
		return _IsTestMode;
	};
	
	var _LastRequest = null;
	this.GetLastRequest = function() {
		return _LastRequest;
	};
	var _LastResponse = null;
	this.GetLastResponse = function() {
		return _LastResponse;
	};

	function ApplyTemplate(sTemplate, data) {
		var sContent = sTemplate;
		for (var i in data) {
			var re = new RegExp("\\{" + i + "\\}", "g");
			sContent = sContent.replace(re, data[i]);
		}
		return sContent;
	}

	this.SendRequest = function(gateway, sRequest) {
		var postData = '<?xml version="1.0"?>\n' + sRequest;
		var oResponse = null;
		_LastRequest = postData;
		try {
			oResponse = nlapiRequestURL(gateway, postData);
		} catch (e) //If unable to connect to gateway, return false
		{
			nlapiLogExecution("DEBUG", "SendRequest-Failed", "Unable to send request to gateway: " + gateway);
			return false;
		}
		_LastResponse = oResponse.getBody();
		nlapiLogExecution("DEBUG", "SendRequest-Response", _LastResponse);
		return true;
	};

	this.VAT100 = new(function() {
		var _ClassName = "HMRC-VAT-DEC";
		function GetGateway() {
			if (_IsTestMode) {
				return "https://test-transaction-engine.tax.service.gov.uk/"; //Document Submission Protocol Test Service
			} else {
				return "https://transaction-engine.tax.service.gov.uk/"; //Live Service URL
			}
		}
		this.SubmissionRequestData = function() {
			this.MESSAGE_CLASS = _ClassName;
			this.SENDER_ID = "";
			this.AUTHENTICATION_VALUE = "";
			this.VRN = "";
			this.VENDOR_ID = "";
			this.CHANNEL_PRODUCT = "";
			this.CHANNEL_VERSION = "";
			this.PERIOD_ID = "";
			this.PERIOD_START = "";
			this.PERIOD_END = "";
			this.SENDER_TYPE = "Company";
			this.IR_MARK = "";
			this.BOX1 = "";
			this.BOX2 = "";
			this.BOX3 = "";
			this.BOX4 = "";
			this.BOX5 = "";
			this.BOX6 = "";
			this.BOX7 = "";
			this.BOX8 = "";
			this.BOX9 = "";
			this.GATEWAY_TEST = "0";
		};
		
		// Return true if no error encountered
		this.Submit = function(submissionRequestData) {
			submissionRequestData.MESSAGE_CLASS = _ClassName;
			submissionRequestData.GATEWAY_TEST = _IsTestMode ? "1" : "0";

			var sPayload = VAT.RenderHandlebarsTemplate(enGage.SUBMISSION_REQUEST_PAYLOAD.short, submissionRequestData);
			submissionRequestData.IR_MARK = this.GetIRMark(sPayload);
			
			var sRequest = VAT.RenderHandlebarsTemplate(enGage.SUBMISSION_REQUEST_TEMPLATE.short, submissionRequestData);
			var gateway = GetGateway() + "submission";
			return enGage.SendRequest(gateway, sRequest);
		};
		
		this.Poll = function(sCorrelationId) {
			var pollRequestData = {};
			pollRequestData.MESSAGE_CLASS = _ClassName;
			pollRequestData.CORRELATION_ID = sCorrelationId;
			var sRequest = VAT.RenderHandlebarsTemplate(enGage.POLL_REQUEST_TEMPLATE.short, pollRequestData);
			var gateway = GetGateway() + "poll";
			return enGage.SendRequest(gateway, sRequest);
		};
		
		this.Delete = function(sCorrelationId) {
			var deleteRequestData = {};
			deleteRequestData.MESSAGE_CLASS = _ClassName;
			deleteRequestData.CORRELATION_ID = sCorrelationId;
			var sRequest = VAT.RenderHandlebarsTemplate(enGage.DELETE_REQUEST_TEMPLATE.short, deleteRequestData);
			var gateway = GetGateway() + "submission";
			return enGage.SendRequest(gateway, sRequest);
		};
		
		this.QueryData = function(submissionRequestData) {
			submissionRequestData.MESSAGE_CLASS = _ClassName;
			var sRequest = VAT.RenderHandlebarsTemplate(enGage.DATA_REQUEST_TEMPLATE.short, submissionRequestData);
			var gateway = GetGateway() + "submission";
			return enGage.SendRequest(gateway, sRequest);
		};
		
		this.GetIRMark = function(sPayload) {
			//Test data
			//var xmlMsg = '<Body xmlns="http://www.govtalk.gov.uk/CM/envelope"><vat:IRenvelope xmlns:vat="http://www.govtalk.gov.uk/taxation/vat/vatdeclaration/2"><vat:IRheader><vat:Keys><vat:Key Type="VATRegNo">999900001</vat:Key></vat:Keys><vat:PeriodID>2009-04</vat:PeriodID><vat:Sender>Individual</vat:Sender></vat:IRheader><vat:VATDeclarationRequest><vat:VATDueOnOutputs>1.50</vat:VATDueOnOutputs><vat:VATDueOnECAcquisitions>0.50</vat:VATDueOnECAcquisitions><vat:TotalVAT>2.00</vat:TotalVAT><vat:VATReclaimedOnInputs>2.00</vat:VATReclaimedOnInputs><vat:NetVAT>0.00</vat:NetVAT><vat:NetSalesAndOutputs>20</vat:NetSalesAndOutputs><vat:NetPurchasesAndInputs>10</vat:NetPurchasesAndInputs><vat:NetECSupplies>10</vat:NetECSupplies><vat:NetECAcquisitions>5</vat:NetECAcquisitions></vat:VATDeclarationRequest></vat:IRenvelope></Body>';
			//IRMark should be 66Y5UdQveihazXhrWHQrZRIkJjA=
			return b64_sha1(sPayload);
		};
	})(); //VAT100
})(); //enGage

enGage.SUBMISSION_REQUEST_TEMPLATE = getTaxTemplate(VAT_ONLINE_SUBMIT_REQ_XML_GB);

// VERY IMPORTANT!
// <Body> is exactly like in the SUBMISSION_REQUEST_TEMPLATE except for two things:
// 1. <Body> should be namespaced "http://www.govtalk.gov.uk/CM/envelope"
// 2. absence of <IRMark>
enGage.SUBMISSION_REQUEST_PAYLOAD = getTaxTemplate(VAT_ONLINE_SUBMIT_REQ_PAYLOAD_XML_GB);

enGage.POLL_REQUEST_TEMPLATE = getTaxTemplate(VAT_ONLINE_POLL_REQ_XML_GB);

enGage.DELETE_REQUEST_TEMPLATE = getTaxTemplate(VAT_ONLINE_DELETE_REQ_XML_GB);

enGage.DATA_REQUEST_TEMPLATE = getTaxTemplate(VAT_ONLINE_DATA_REQ_XML_GB);