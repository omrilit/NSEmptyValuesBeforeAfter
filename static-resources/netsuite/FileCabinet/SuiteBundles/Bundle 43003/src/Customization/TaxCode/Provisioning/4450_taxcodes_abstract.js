/**
 * Copyright © 2014, 2018, Oracle and/or its affiliates. All rights reserved.
 */

XMLData = function(filename, GUID, nexusCountry) {
	var XMLresource = getResource(filename, GUID);
	var rawdata = XMLresource.content;
	var xml = VAT.XML.Parser.fromString(rawdata);
	this.userlanguage = extractISOCode(nlapiGetContext().getPreference('LANGUAGE'));
	this.NexusCountry = nexusCountry;

	this.TaxCustomFields = this.getCustomTaxFields(xml);
	this.NexusFields = this.getNexusFields(xml);
	this.NexusTaxDefinitions = this.getNexusTaxDefinitions(xml);
	this.NexusTaxCodes = this.getNexusTaxCodes(xml);
	this.IsTaxProvision = this.isTaxProvision(xml);

	function extractISOCode(val) {
		try {
			if (!val) {
				return 'en';
			}
			var underscorePos = val.indexOf("_");
			if (underscorePos > -1) {
				return val.slice(0, underscorePos).toLowerCase();
			} else {
				return val.toLowerCase();
			}
		} catch (ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "VAT.Translation.extractISOCode", errorMsg);
			return 'en';
		}
	}

	function getResource(filename, GUID) {
		function getBaseUrl() {
			var url_temp = '';
			try {
				if (typeof request !== 'undefined' && request) {
					url_temp = request.getURL().split('/app')[0];
				}
			} catch (ex) {
				var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
				nlapiLogExecution("ERROR", "installBundleConfig: getBaseUrl", errorMsg);
			}

			return url_temp;
		}

		function getFile(fileId) {
			var fileUrl = '';
			var fileContent = '';

			try {
				if (fileId) {
					var fileObj = nlapiLoadFile(fileId);
					fileUrl = fileObj.getURL();
					fileContent = fileObj.getValue();
				}
			} catch (ex) {
				var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
				nlapiLogExecution("ERROR", "getResource", errorMsg);
			}
			return {url: fileUrl, content: fileContent};
		}

		function getFileId(fileName, folderid, isErrorWhenNotFound) {
			var file_temp = -1;
			try {
				filters = [
					new nlobjSearchFilter("name", null, "is", fileName),
					new nlobjSearchFilter("folder", null, "is", folderid)
				];

				var rs = nlapiSearchRecord("file", null, filters);

				if (rs == null) {
					if (isErrorWhenNotFound)
						throw nlapiCreateError("GetFileId", "File not found (" + fileName + ")");
					else
						return null;
				}

				file_temp = rs[0].getId();
			} catch (ex) {
				var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
				nlapiLogExecution("ERROR", "installBundleConfig: getFileId", errorMsg);
			}

			return file_temp;
		}

		function getAppFolderId(identifier) {
			var folder_temp = '';
			try {
				var filters = [new nlobjSearchFilter("name", null, "is", identifier)];
				var rs = nlapiSearchRecord("file", null, filters, [new nlobjSearchColumn("folder")]);
				folder_temp = rs[0].getValue("folder");
			} catch (ex) {
				var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
				nlapiLogExecution("ERROR", "installBundleConfig: getAppFolderId", errorMsg);
			}

			return folder_temp;
		}

		var _folderid = getAppFolderId(GUID);
		var _fileid = getFileId(filename, _folderid);
		var _file = getFile(_fileid);
		var _content = _file.content;
		var _fileurl = _file.url;

		return {
			url: getBaseUrl() + _fileurl,
			fileid: _fileid,
			folderid: _folderid,
			content: _content
		};
	}
};

XMLData.prototype.isTaxProvision = function _isTaxProvision(xml) {
	var isTaxProvision = false;
	try {
		var nexusNode = VAT.XML.XPath.selectNodesPerAttrValue(xml, '//Nexuses/Nexus', 'country', this.NexusCountry);
		
		if (nexusNode.length > 0) {
		    isTaxProvision = true;
		}
	} catch (ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "Tax Code Provisioning: taxProvisionAvailable", errorMsg);
	}
	
	return isTaxProvision;
};

XMLData.prototype.getCustomTaxFields = function _getCustomTaxFields(xml) {
	var taxFields = {};
	try {
		var language = this.userlanguage;
		var taxFieldNodes = VAT.XML.XPath.selectNodes(xml, '//TaxFields/TaxField');

		for (var inode = 0; inode < taxFieldNodes.length; inode++) {
			var taxFieldNode = taxFieldNodes[inode];
			if (!language) {
				language = VAT.XML.XPath.selectNode(taxFieldNode, 'HelpText').getAttribute('defaultlanguage');
			}

			var helpNode = VAT.XML.XPath.selectNodesPerAttrValue(taxFieldNode, 'HelpText/Help', 'language', language);
			var helpText = (helpNode && helpNode.length > 0) ? VAT.XML.XPath.selectNode(taxFieldNode, 'HelpText/Help[@language="en"]').textContent : '';
			taxFields[taxFieldNode.getAttribute('tag')] = {
				Id: taxFieldNode.getAttribute('id'),
				Type: taxFieldNode.getAttribute('type')
			};
			if (helpText) {
				taxFields[taxFieldNode.getAttribute('tag')].Help = helpText;
			}
		}
	} catch (ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "Tax Code Provisioning: getCustomTaxFields", errorMsg);
	}
	return taxFields;
};

XMLData.prototype.getNexusFields = function _getNexusFields(xml) {
	var nexus = {};
	var optionsList = {};
	var nexusNodes = VAT.XML.XPath.selectNodes(xml, '//Nexuses/Nexus[@country="' + this.NexusCountry + '"]/*');

	for (var inode = 0; inode < nexusNodes.length; inode++) {
		var nexusNode = nexusNodes[inode];
		var nodeName = nexusNode.nodeName;
		if (nodeName == 'Provision') {
			continue;
		}
		nexus[nodeName] = {
			display: nexusNode.getAttribute('display')
		};

		var lists = VAT.XML.XPath.selectNodes(nexusNode, 'Lists');
		var defaultLanguage = (lists && lists.length > 0) ? VAT.XML.XPath.selectNode(nexusNode, 'Lists').getAttribute('defaultlanguage') : '';
		var language = defaultLanguage || this.userlanguage;

		var options = VAT.XML.XPath.selectNodes(nexusNode, 'Lists/List[@language="' + language + '"]/Option');
		if (!options || options.length == 0) {
			continue;
		}

		for (var ioption = 0; ioption < options.length; ioption++) {
			var option = options[ioption];
			optionsList[option.getAttribute('id')] = option.textContent;
		}
		nexus[nodeName].list = optionsList;
	}
	return nexus;
};

XMLData.prototype.getNexusTaxDefinitions = function _getNexusTaxDefinitions(xml) {
	var taxDefs = {};
	var taxDefsNodes = VAT.XML.XPath.selectNodes(xml, '//Nexuses/Nexus[@country="' + this.NexusCountry + '"]/Provision/TaxDefinitions/*');

	for (var inode = 0; taxDefsNodes && inode < taxDefsNodes.length; inode++) {
		var taxDefsNode = taxDefsNodes[inode];
		taxDefs[inode] = {};
		taxDefs[inode].Id = taxDefsNode.getAttribute('Id');

		var attributes = VAT.XML.XPath.selectNodes(taxDefsNode, '@*');
		for (var iattr = 0; attributes && iattr < attributes.length; iattr++) {
			if (attributes[iattr].nodeName != 'Id') {
				taxDefs[inode][attributes[iattr].nodeName] = attributes[iattr].value;
			}
		};
	}
	return taxDefs;
};

XMLData.prototype.getNexusTaxCodes = function _getNexusTaxCodes(xml) {
	var taxCodes = {};
	var taxCodeNodes = VAT.XML.XPath.selectNodes(xml, '//Nexuses/Nexus[@country="' + this.NexusCountry + '"]/Provision/TaxCodes/*');

	for (var inode = 0; inode < taxCodeNodes.length; inode++) {
		var taxCodeNode = taxCodeNodes[inode];
		taxCodes[inode] = {};
		taxCodes[inode].XMLitemid = taxCodeNode.getAttribute('Id');
		taxCodes[inode].itemid = taxCodes[inode].XMLitemid;
		taxCodes[inode].rate = taxCodeNode.getAttribute('Rate');
		taxCodes[inode].definition = taxCodeNode.getAttribute('Definition');
		taxCodes[inode].nexusCountry = this.NexusCountry;
		taxCodes[inode].notionalRateAlt = taxCodeNode.getAttribute('NotionalRateAlt');
		taxCodes[inode].notionalRate = taxCodeNode.getAttribute('NotionalRate');
		taxCodes[inode].effectiveFrom = taxCodeNode.getAttribute('EffectiveFrom');

		var descriptionNode = VAT.XML.XPath.selectNode(taxCodeNode, 'Descriptions/Description[@language="' + this.userLanguage + '"]');
		var description = '';
		if (descriptionNode) {
			description = descriptionNode.textContent;
		} else {
			var defaultLanguage = VAT.XML.XPath.selectNode(taxCodeNode, 'Descriptions').getAttribute('defaultLanguage');
			description = VAT.XML.XPath.selectNode(taxCodeNode, 'Descriptions/Description[@language="' + defaultLanguage + '"]').textContent;
		}
		taxCodes[inode].description = description;
	}
	return taxCodes;
};

TaxCode = function() {
	this.createTaxCode = function(taxCodesXml, taxCode, taxCodeRecord) {
		return createTaxCode(taxCodesXml, taxCode, taxCodeRecord);
	};

	this.updateTaxCode = function(taxCodesXml, mappedtaxcode) {
		return updateTaxCode(taxCodesXml, mappedtaxcode);
	};

	this.createTaxCodeMapping = function(nexustaxcodeid, XMLitemid, nexusCountry) {
		return createTaxCodeMapping(nexustaxcodeid, XMLitemid, nexusCountry);
	};

	this.updateTaxCodeMapping = function(nexustaxcodeid, XMLitemid, nexusCountry) {
		return updateTaxCodeMapping(nexustaxcodeid, XMLitemid, nexusCountry);
	};

	function createTaxCode(taxCodesXml, taxCode, taxCodeRecord, type) {
		try {
			for (var property in taxCode) {
				if (property == "itemid" || property == "rate" || property == "description" || property == "XMLitemid" || property == "nexusCountry") { 
					if (!type || type == "update" && property != "itemid") {
						taxCodeRecord.setFieldValue(property, taxCode[property]);
					}
				} else if (property == "notionalRate" || property == "notionalRateAlt") {
					if (!taxCode[property]) {
						continue;
					}
					var filters = [new nlobjSearchFilter('itemid', null, 'is', taxCode[property])];
					var columns = [new nlobjSearchColumn('itemid'),
								   new nlobjSearchColumn('internalid')];
					
					var sr = nlapiSearchRecord('salestaxitem', null, filters, columns);
					if (sr && property == "notionalRate") {
						taxCodeRecord.setFieldValue("parent", sr[0].getId());
					} else if (sr && property == "notionalRateAlt") {
						taxCodeRecord.setFieldValue("custrecord_4110_parent_alt", sr[0].getId());
					}
				} else if (property == "effectiveFrom") {
				    var dateString = getDateString(taxCode[property]);
				    if (dateString) {
				        taxCodeRecord.setFieldValue('effectivefrom', dateString);
				    }
				} else {
					var nexusTaxDefs = taxCodesXml.NexusTaxDefinitions;
					for (var def in nexusTaxDefs) {
						if (nexusTaxDefs[def].Id != taxCode[property]) {
							continue;
						}

						var taxCustomFields = taxCodesXml.TaxCustomFields;
						for (var field in taxCustomFields) {
							if (field == "NotionalRate" || field == "NotionalRateAlt") {
								continue;
							}
							if (field == "Category" || field == "Available") {
								taxCodeRecord.setFieldValue(taxCustomFields[field].Id, nexusTaxDefs[def][field] || '');
							} else {
								taxCodeRecord.setFieldValue(taxCustomFields[field].Id, getBoolString(nexusTaxDefs[def][field]));
							}
						}
					}
				}
			}

			if (!taxCodeRecord.getFieldValue("available")) {
				taxCodeRecord.setFieldValue("available", "BOTH");
			}

			var salesTaxId = nlapiSubmitRecord(taxCodeRecord);
			nlapiLogExecution("AUDIT", "CreateTaxCode: Nexus - " + taxCode['nexusCountry'].toString(), "Item Id: " + taxCode['itemid'].toString() + ", Internal Id: " + salesTaxId);
		} catch (ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "createTaxCode: ERROR - " + taxCode['itemid'].toString(), errorMsg);
		}

	};

	function updateTaxCode(taxCodesXml, mappedtaxcode) {
		var objNexusTaxCodes = taxCodesXml.NexusTaxCodes;
		var internal_id = mappedtaxcode.getValue('custrecord_available_internal_id');
		var xml_item_id = mappedtaxcode.getValue('custrecord_xml_item_id');
		var recSTI = nlapiLoadRecord('salestaxitem', internal_id);

		for (var k in objNexusTaxCodes) {
			if (objNexusTaxCodes[k].itemid.toString() == xml_item_id) {
				createTaxCode(taxCodesXml, objNexusTaxCodes[k], recSTI, "update");

			}
		}
	};

	function getBoolString(val) {
		if (val == "true")
			return "T";
		else
			return "F";
	}

	function getDateString(val) {
        var stringDate = '';

        try {
            if (val) {
                var date = new Date(val);

                if (!isNaN(date.getTime())) {
                    stringDate = nlapiDateToString(date);
                }
            }
        } catch (ex) {
            var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
            nlapiLogExecution("ERROR", "getDateString: ERROR - Unable to convert '" + val + "' to Date", errorMsg);
        }

        return stringDate;
    }

	function createTaxCodeMapping(nexustaxcodeid, XMLitemid, nexusCountry) {
		var recSetup = nlapiCreateRecord('customrecord_tax_code_mapping');
		recSetup.setFieldValue('custrecord_available_internal_id', nexustaxcodeid);
		recSetup.setFieldValue('custrecord_xml_item_id', XMLitemid.toString());
		recSetup.setFieldValue('custrecord_tax_code_provxml_nexus', nexusCountry);
		nlapiSubmitRecord(recSetup);
	}

	function updateTaxCodeMapping(nexustaxcodeid, XMLitemid, nexusCountry) {
		var filters = [];
		filters[0] = new nlobjSearchFilter('custrecord_available_internal_id', null, 'is', nexustaxcodeid);
		filters[1] = new nlobjSearchFilter('custrecord_available_internal_id', null, 'isnot', XMLitemid);

		var columns = [];
		columns[0] = new nlobjSearchColumn('custrecord_xml_item_id');
		var sr = nlapiSearchRecord('customrecord_tax_code_mapping', null, filters, columns);

		if (sr != null) {
			var recSetup = nlapiLoadRecord('customrecord_tax_code_mapping', sr[0].getId());
			recSetup.setFieldValue('custrecord_xml_item_id', XMLitemid.toString());
			nlapiSubmitRecord(recSetup);
		}
	}
};