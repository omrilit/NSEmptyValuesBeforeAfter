/**
 * Copyright © 2014, 2019, Oracle and/or its affiliates. All rights reserved.
 */

//Contains Feature Libraries, Non-Framework
if (!VAT) VAT = {};

VAT.SystemNote = function(request, response) {
	this.createSystemNote = createSystemNote;
	var exportlength = 100000;
	var STATUS = {
			SUBMITTED: 'SUBMITTED'
	};
	function getValidPeriods(periodList) {
		var validPeriodList = [];
		
		var filter = new nlobjSearchFilter('internalid', null, 'anyof', periodList);
		var column = [new nlobjSearchColumn('isposting'),
					  new nlobjSearchColumn('isyear'),
					  new nlobjSearchColumn('isquarter')];
		var sr = nlapiSearchRecord('taxperiod', null, filter, column);
		
		for (var isr = 0; isr < (sr ? sr.length : 0); isr++) { 
			if (sr[isr].getValue('isposting') == 'T' && (sr[isr].getValue('isyear') == 'T' || sr[isr].getValue('isquarter') == 'T')) { //not in custrecord_submitted_period
				continue;
			}
			
			var currentId = sr[isr].getId();
			if (validPeriodList.indexOf(currentId) == -1) {
				validPeriodList.push(currentId);
			}
		}
		return validPeriodList;
	}
	function createSystemNote (params) {
		//subsidiaryid, fromperiodid, toperiodid, isconsolidated, filename, reportObj, content, spanning, onlineformcontent, salecacheid, purchasecacheid, pdfformcontent
		nlapiLogExecution('Debug', 'createSystemNote: Params', JSON.stringify(params));
		try {
			var isflagged = params.isflagged == 'T';
			var sublist = 'recmachcustrecord_vatonline_submitted_period';
			var cachelist = 'recmachcustrecord_tax_cache';
			var taxperiodlist = params.taxperiodlist.split(',');
			var validPeriodList = getValidPeriods(taxperiodlist);
			
			var rec = nlapiCreateRecord('customrecord_vatonline_submittedperiod');
			if (_App.IsOneWorld) {
				rec.setFieldValue('custrecord_vatonline_subsidiary', params.subsidiaryid);
			}
			if (_App.IsMultibook) {
				rec.setFieldValue('custrecord_vatonline_accounting_book', params.bookid);
			}
			rec.setFieldValue('custrecord_vatonline_status', params.status);
			rec.setFieldValue('custrecord_is_export_file', params.isexportfile == 'T' ? 'T' : 'F');
			rec.setFieldValue('custrecord_nexus', params.countrycode);
			rec.setFieldValue('custrecord_vatonline_submit_user', params.userid ? params.userid : nlapiGetUser());
			rec.setFieldValue('custrecord_vatonline_submit_date', params.submitdate ? params.submitdate : nlapiDateToString(new Date()));
			rec.setFieldValues('custrecord_submitted_period', validPeriodList);
			rec.setFieldValue('custrecord_submitted_type', params.vatreportingtype ? params.vatreportingtype : '');
			
			var properties = {'filename': params.filename, 'consolidated': params.isconsolidated, 'periodfrom': params.startperiod,
				'periodto': params.endperiod, 'symbol': params.symbol, 'precision': params.precision, 'thousand': params.thousand,
				'decimal': params.decimal, 'negative': params.negative, 'company': params.company,
				'vatno': params.vatno, 'fromperiodid': params.fromperiodid, 'toperiodid': params.toperiodid, 'reportingperiod': params.reportingperiod,
				'spanning': params.spanning == true};
			
			if (params.hasOwnProperty('hascrlf')) { properties.hascrlf = params.hascrlf; }
			
			rec.setFieldValue('custrecord_properties', JSON.stringify(properties));
			
			var content = params.content;
			
			if (params.hasOwnProperty('hascrlf') && params.hascrlf == true) {
				content = content.replace(/\n/gi, '{{crlf}}');
			}
			
			if (params.spanning) {
				properties.spanning = true;
				
				for(var irow = 0; irow < Math.ceil(content.length/exportlength); irow++) {
					rec.selectNewLineItem(sublist);
					rec.setCurrentLineItemValue(sublist,'custrecord_submitted_content', 
							content.substring(irow*exportlength, (irow*exportlength) + exportlength));
					rec.commitLineItem(sublist);
				}
				
			} else {
				properties.spanning = false;
				rec.setFieldValue('custrecord_vatonline_request', content);
			}
			
			if (params.countrycode == 'GB' & params.isexportfile != 'T') {
				rec.setFieldValue('custrecord_vatonline_request', params.requestmessage);
				rec.setFieldValue('custrecord_vatonline_tax_period', params.taxperiodid);
				rec.setFieldValue('custrecord_vatonline_response', params.responsereply);
				rec.setFieldValue('custrecord_vatonline_folder_name', params.folder);
				rec.setFieldValue('custrecord_vatonline_pdf_link', params.url);
				rec.setFieldValue('custrecord_vatonline_istestmode', params.istestmode);
				rec.setFieldValue('custrecord_vatonline_signature', params.signature);
			}

			if (isflagged && params.status != 'FAILED') {
				rec.setFieldValue('custrecord_pdf_form', params.pdfformcontent);
				rec.setFieldValue('custrecord_online_form', params.onlineformcontent);
				
				if (params.salecacheid) {
					var salesrec = nlapiLoadRecord('customrecord_tax_cache', params.salecacheid);
					var purchaserec = nlapiLoadRecord('customrecord_tax_cache', params.purchasecacheid);
					var purchaselinecount = purchaserec.getLineItemCount(cachelist);
					var salelinecount = salesrec.getLineItemCount(cachelist);
					
					var linecount = rec.getLineItemCount(sublist);
					var cachecount = salelinecount > purchaselinecount?salelinecount:purchaselinecount;
					
					for(var idetail = 1; idetail <= cachecount; idetail++) {
						var salecontent = salesrec.getLineItemValue(cachelist, 'custrecord_detail', idetail);
						var purchasecontent = purchaserec.getLineItemValue(cachelist, 'custrecord_detail', idetail);

						if (linecount == 0 || idetail > linecount) {
							rec.selectNewLineItem(sublist);
						} else {
							rec.selectLineItem(sublist, idetail);
						}
						
						rec.setCurrentLineItemValue(sublist, 'custrecord_purch_detail', purchasecontent);
						rec.setCurrentLineItemValue(sublist, 'custrecord_sales_details', salecontent);
						rec.commitLineItem(sublist);
					}
				}
			}
			
			return nlapiSubmitRecord(rec);
		} catch (ex) {logException(ex, 'VAT.SystemNote.createSystemNote');}
	}
	
	function listtomap(list) {
		var map = {};

		if (list) {
			for(var ilist = 0; ilist < list.length; ilist++) {
				var objlist = list[ilist];
				var value = objlist.value;
				var lang1 = objlist.lang1;
				var lang2 = objlist.lang2;
				var desc = objlist.description;
				if (!map[value]) {
					map[value] = {};
				} 
				
				map[value][lang1] = desc;
				map[value][lang2] = desc;
			}
		}
		
		return map;
	}
	
	this.GetSystemNoteMetaData = GetSystemNoteMetaData;
	function GetSystemNoteMetaData (sysnoteid) {//properties etc.
		var sysnoteobj = {};
		try {
			nlapiLogExecution('Debug', 'GetSystemNoteMetaData', sysnoteid);
			var rec = nlapiLoadRecord('customrecord_vatonline_submittedperiod', sysnoteid);
			var properties = rec.getFieldValue('custrecord_properties');
			var nexus = rec.getFieldValue('custrecord_nexus');
			
			sysnoteobj.nexus = nexus;
			if (properties) {
				sysnoteobj.properties = JSON.parse(properties);
			}
		} catch (ex) {logException(ex, 'VAT.Export.GetSystemNote');}
		
		return sysnoteobj;
	}
	
	function getTaxPeriodMap() {
		var periodmap = {};
		try {
			var limit = 1000;
			var column = [new nlobjSearchColumn('periodname')];
			var search = nlapiCreateSearch('taxperiod', null, column);
			var set = search.runSearch();

			var startindex = 0;
			var endindex = parseInt(limit) + parseInt(startindex);
			
			while (true) {
				var rs = set.getResults(startindex, endindex);
				if (rs && rs.length > 0) {
					for(var irs in rs) {
						periodmap[rs[irs].getId()] = rs[irs].getValue('periodname');
					}
					startindex = endindex;
					endindex = endindex + limit;
				} else {
					break;
				}
			}
		} catch (ex) {logException(ex, 'getTaxPeriodMap');}
		
		return periodmap;
	}
	
	this.GetSystemNote = GetSystemNote;
	function GetSystemNote(params) {
		nlapiLogExecution('Debug', 'GetSystemNote', JSON.stringify(params));
		_Report = VAT.GetReportByClassName(params.report);
		_formatter = VAT.Report.FormatterSingleton.getInstance(params.subid, params.countrycode, params.languagecode);
		
		try {
			var limit = params.limit?params.limit:parseInt(nlapiGetContext().getPreference('LISTSEGMENTSIZE'));
			var startindex = params.start?params.start:0;
			
			var rowtemplate = getTaxTemplate('SYS_NOTE').short;
			var rows = [];
			
			var filter = [new nlobjSearchFilter('isinactive', null, 'is', 'F')];
			
			if (params.countrycode == 'GB') {
				filter.push(new nlobjSearchFilter('custrecord_vatonline_tax_period', null, 'isnotempty'));
			} else {
				filter.push(new nlobjSearchFilter('custrecord_nexus', null, 'is', params.countrycode));
			}
			
			if (_App.IsOneWorld) {
				filter.push(new nlobjSearchFilter('custrecord_vatonline_subsidiary', null, 'is', params.subid));
			}
			
			var countcolumn = [new nlobjSearchColumn('internalid', null, 'count')];
			var countrec = nlapiSearchRecord('customrecord_vatonline_submittedperiod', null, filter, countcolumn);	
			var count = countrec[0].getValue('internalid', null, 'count');

			var column = [
							new nlobjSearchColumn('custrecord_vatonline_submit_user'), 
							new nlobjSearchColumn('custrecord_vatonline_submit_date'),
							new nlobjSearchColumn('custrecord_vatonline_status'),
							new nlobjSearchColumn('custrecord_properties'),
							new nlobjSearchColumn('custrecord_online_form'),
							new nlobjSearchColumn('custrecord_submitted_type')
						];
			if (_App.IsMultibook) {
				column.push(new nlobjSearchColumn('custrecord_vatonline_accounting_book'));
			}
			
			var search = nlapiCreateSearch('customrecord_vatonline_submittedperiod', filter, column);
			var set = search.runSearch();

			var endindex = parseInt(limit) + parseInt(startindex); 
			nlapiLogExecution('Debug', 'System Note:Page', JSON.stringify({limit: limit, startindex:startindex, endindex: endindex}));
			
			var taxperiodmap = getTaxPeriodMap();
			var rs = set.getResults(parseInt(startindex), endindex);
			for(var irow in rs) {
				var internalid = rs[irow].getId(); 
				var name = rs[irow].getText('custrecord_vatonline_submit_user');
				var date = _formatter.formatDate(rs[irow].getValue('custrecord_vatonline_submit_date'), _formatter.shortdate);
				var status = rs[irow].getValue('custrecord_vatonline_status');
				var property = rs[irow].getValue('custrecord_properties');
				var submittedtype = rs[irow].getValue('custrecord_submitted_type');
				var hasactionlink = rs[irow].getValue('custrecord_online_form') ? 'T' : 'F';
				
				var objProperty = property ? JSON.parse(property) : '';
				var filename = '';
				var periodfrom = '';
				var periodto = '';
				var type = '';
				
				if (objProperty) {
					filename = objProperty.filename;
					
					if (objProperty.fromperiodid) {
						periodfrom = taxperiodmap[Number(objProperty.fromperiodid)];
						periodto = taxperiodmap[Number(objProperty.toperiodid)]; 
					} else {
						periodfrom = objProperty.periodfrom;
						periodto = objProperty.periodto;
					}
					
					if (submittedtype) {
						var config = new VAT.Configuration();
						var template = getTaxTemplate(_Report.metadata.template.online);
						var schema = config.getSchema(template.schema);

						nlapiLogExecution('Debug', 'System Note:Schema', JSON.stringify(schema));
						var typemap = {};
						if (_Report.CountryCode == 'CZ') {
							typemap = listtomap(schema['taxreturncode'].lov);
						} else {
							typemap = listtomap(schema['vatreportingtype'].lov);
						}
						type = typemap[submittedtype][_Report.LanguageCode];
					}
				}
				
				var rowdata = {internalid: internalid, user: this.encodeHTML(name), date: date, status:status, file:filename, periodfrom:periodfrom, periodto:periodto, hasactionlink:hasactionlink, type: type};
				if (_App.IsMultibook) {
					rowdata['accountingbook'] = rs[irow].getText('custrecord_vatonline_accounting_book') || '';
				}
				rows.push(_App.RenderTemplate(rowtemplate, rowdata));
			}

			var xml = ['<?xml version="1.0" encoding="UTF-8"?>'];
			xml.push('<SysNote>');
			xml.push('<Total>' + count + '</Total>');
			xml.push(rows.join(''));
			xml.push('</SysNote>');
			response.setContentType('XMLDOC', 'sysnote.xml', 'attachment');
			response.write(xml.join(''));
		} catch (ex) {logException(ex, 'VAT.Export.GetSystemNote');}
	}
	
	this.GetSystemNoteMTD = GetSystemNoteMTD;
	function GetSystemNoteMTD(params) {
		nlapiLogExecution('Debug', 'GetSystemNoteMTD', JSON.stringify(params));
		_Report = VAT.GetReportByClassName(params.report);
		_formatter = VAT.Report.FormatterSingleton.getInstance(params.subid, params.countrycode, params.languagecode);
		
		try {
			var limit = params.limit || parseInt(nlapiGetContext().getPreference('LISTSEGMENTSIZE'));
			var startindex = params.start || 0;
			var rowtemplate = getTaxTemplate('SYS_NOTE').short;
			var rows = [];
			var filter = [new nlobjSearchFilter('isinactive', null, 'is', 'F'),
			              new nlobjSearchFilter('custrecord_online_filing_action', null, 'isnot', 'submit_csv')];
			
			if (_App.IsOneWorld) {
				filter.push(new nlobjSearchFilter('custrecord_online_filing_subsidiary', null, 'is', params.subid));
			}
			
			var countcolumn = [new nlobjSearchColumn('internalid', null, 'count')];
			var countrec = nlapiSearchRecord('customrecord_online_filing', null, filter, countcolumn);	
			var count = countrec[0].getValue('internalid', null, 'count');
			var column = [
				new nlobjSearchColumn('custrecord_online_filing_user'), 
				new nlobjSearchColumn('created'),
				new nlobjSearchColumn('custrecord_online_filing_status'),
				new nlobjSearchColumn('custrecord_online_filing_covered_periods'),
				new nlobjSearchColumn('custrecord_online_filing_action')
			];
			if (_App.IsMultibook) {
				column.push(new nlobjSearchColumn('custrecord_online_filing_acct_book'));
			}
			
			var search = nlapiCreateSearch('customrecord_online_filing', filter, column);
			var set = search.runSearch();
			var endindex = parseInt(limit) + parseInt(startindex); 
			nlapiLogExecution('Debug', 'MTD System Note:Page', JSON.stringify({limit: limit, startindex:startindex, endindex: endindex}));
			
			var taxperiodmap = getTaxPeriodMap();
			var rs = set.getResults(parseInt(startindex), endindex);
			for(var irow in rs) {
				var internalid = rs[irow].getId(); 
				var name = rs[irow].getText('custrecord_online_filing_user');
				var date = _formatter.formatDate(rs[irow].getValue('created'), _formatter.shortdate);
				var status = rs[irow].getValue('custrecord_online_filing_status');
				var hasactionlink = status == STATUS.SUBMITTED ? 'T' : 'F';
				var coveredPeriodStr = rs[irow].getValue('custrecord_online_filing_covered_periods');
				var coveredperiodArr = coveredPeriodStr ? coveredPeriodStr.split(',') : [];
				var periodfrom = taxperiodmap[Math.min.apply(null, coveredperiodArr)];
				var periodto = taxperiodmap[Math.max.apply(null, coveredperiodArr)];
				var mtdtype = rs[irow].getValue('custrecord_online_filing_action');
				var rowdata = {
				    internalid: internalid,
				    user: this.encodeHTML(name),
				    date: date,
				    status: status,
				    periodfrom: periodfrom,
				    periodto: periodto,
				    hasactionlink: hasactionlink,
				    ismtd: 'T',
				    mtdtype: mtdtype.toUpperCase()
				};
				if (_App.IsMultibook) {
					rowdata['accountingbook'] = rs[irow].getText('custrecord_online_filing_acct_book') || '';
				}
				rows.push(_App.RenderTemplate(rowtemplate, rowdata));
			}

			var xml = ['<?xml version="1.0" encoding="UTF-8"?>'];
			xml.push('<SysNote>');
			xml.push('<Total>' + count + '</Total>');
			xml.push(rows.join(''));
			xml.push('</SysNote>');
			response.setContentType('XMLDOC', 'sysnote.xml', 'attachment');
			response.write(xml.join(''));
		} catch (ex) {
		    logException(ex, 'VAT.Export.GetSystemNoteMTD');
		}
	}

	this.encodeHTML = function encodeHTML(htmlString) {
		return htmlString
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
	};
};

VAT.Preview = function(request, response) {
	this.Run = Run;
	function Run(params) {
		try {
			nlapiLogExecution('Debug', 'VAT.Preview', JSON.stringify(params));
			var rec = nlapiLoadRecord('customrecord_vatonline_submittedperiod', params.recordid);
			var property = rec.getFieldValue('custrecord_properties');
			var objproperty = JSON.parse(property);

			if(!objproperty.precision) {
				objproperty.symbol = '';
				objproperty.precision = 2;
				objproperty.thousand = ',';
				objproperty.decimal = '.';
				objproperty.negative = '%s -%v';
			}
			
			var template = getTaxTemplate('PREVIEW');
			var data = {previewcontent: rec.getFieldValue('custrecord_online_form'),
						salecacheid: rec.getFieldValue('custrecord_sales_cacheid'),
						purchasecacheid: rec.getFieldValue('custrecord_purchase_cacheid')};
			data.library = _App.GetLibraryFile(VAT.LIB.FORMAT).getValue();
			data.sysnoteid = params.recordid;
			
			for(var iprop in objproperty) {
				data[iprop] = objproperty [iprop];
			}
			
			for(var iparams in params) {
				data[iparams] = params[iparams];
			}
			
			data.bookid = rec.getFieldValue('custrecord_vatonline_accounting_book');
			var onlineform = _App.RenderTemplate(template.short, data);
			
			var form = nlapiCreateForm('', true);
			var htmPrintButton = _App.ButtoniseExtJs('btnprint', 'Print', 'OnPrint()', true);
			_App.CreateField(form, 'btnprint', 'inlinehtml', '', false, htmPrintButton, 'normal', 'outsideabove');
			
			var htmCloseButton = _App.ButtoniseExtJs('btnclose', 'Close', 'OnClose()', true);
			_App.CreateField(form, 'btnclose', 'inlinehtml', '', false, htmCloseButton, 'normal', 'outsideabove');
			
			var div = ['<div id="divvat" name="divvat" style="border: 1px dotted #000000; width: 100%; height: 100%">', onlineform, '</div>'];
			
			_App.CreateField(form, 'onlineform', 'inlinehtml', '', false, div.join(''), 'normal', 'normal');
			response.writePage(form);
		} catch (ex) {logException(ex, 'VAT.Preview.Run');}
	}
	
	this.Print = Print;
	function Print(params) {
		try {
			nlapiLogExecution('Debug', 'VAT.PrintPreview', JSON.stringify(params));
			var rec = nlapiLoadRecord('customrecord_vatonline_submittedperiod', params.recordid);
			var pdfcontent = rec.getFieldValue('custrecord_pdf_form');
			var properties = rec.getFieldValue('custrecord_properties');
			var filename = 'file.pdf';
			if (properties) {
				var metadata = JSON.parse(properties);
				filename = metadata.filename;
				filename = filename.substring(0, filename.indexOf('.')) + '.pdf';
			}
			
			var pdffile = nlapiXMLToPDF('<?xml version="1.0"?>\n<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">\n' + pdfcontent);
			response.setContentType('PDF', filename);
			response.write(pdffile.getValue());
		} catch (ex) {logException(ex, 'VAT.Preview.Print');}
	}
};

VAT.OnlineFiling = function(request, response) {
	
	var displayhidden = _App.Context.getLogLevel() == 'DEBUG' ? 'inline' : 'hidden';
	
	var _Context = nlapiGetContext();
	var _IsOneWorld = _Context.getSetting('FEATURE', 'SUBSIDIARIES') == 'T';
	var _SubId;
	var _FromPeriodId;
	var _ToPeriodId;
	var _IsConsolidated;
	var _Report;
	
	this.GetReport = function(params){
	    if (params.report) {
	        return VAT.GetReportByClassName(params.report);
	    } else if (params.eslreport) {
	        return new VAT.EU.ESL.ReportManager().getReport(params.eslreport);
	    } else if (params.countryform) {
	        return new Tax.EU.Intrastat.ReportManager().getSetupWindowReport(params.countryform);
	    }
	    
	    throw nlapiCreateError('REPORT_NOT_DEFINED', 'Unable to get the report.');
	};
	
	this.Run = function(params){
		nlapiLogExecution('DEBUG', 'VAT.OnlineFiling.Run: params', JSON.stringify(params));
		_SubId = params.subid;
		_FromPeriodId = params.periodfrom;
		_ToPeriodId = params.periodto;
		if (_IsOneWorld) {
			var hasCon = params.isconsolidated != null && params.isconsolidated != '';
			_IsConsolidated = hasCon ? params.isconsolidated == 'T' : false;
		}
		_Report = this.GetReport(params);

		if (params.onlinefiling == 'load') {
			this.Load(params);
		} else if (params.onlinefiling == 'save'){
			this.Save(params);
		}
	};
	
	this.Load = function(params) {
		nlapiLogExecution('DEBUG', 'VAT.OnlineFiling.Load: params', JSON.stringify(params));
		var reportName = _Report ? _Report.Name : '';
		var reporttemplate = _Report.GetOnlineFilingTemplate();
		var data = {};
		var defaultdata = {};
		var configuration;
		
		if (_IsOneWorld) {
			var subsidiary = SFC.System.Subsidiary(_SubId, false);
			defaultdata.vatno = subsidiary.VRN;
			defaultdata.legalname = subsidiary.LegalName;
			defaultdata.city = subsidiary.City;
			defaultdata.zipcode = subsidiary.LegalName;
			defaultdata.telephone = subsidiary.Telephone;
			defaultdata.email = subsidiary.Email;
			defaultdata.country = subsidiary.Country;

			configuration = new Tax.Returns.Configuration(_Report.CountryCode, _SubId);
		} else {
			var parent = nlapiLoadConfiguration('companyinformation');
			defaultdata.vatno = parent.getFieldValue('employerid');
			defaultdata.legalname = parent.getFieldValue('legalname');
			defaultdata.city = parent.getFieldValue('city');
			defaultdata.zipcode = parent.getFieldValue('zip');
			defaultdata.telephone = parent.getFieldValue('phone');
			defaultdata.email = parent.getFieldValue('email');
			defaultdata.country = parent.getFieldText('country');
			
			configuration = new Tax.Returns.Configuration(_Report.CountryCode);
		}
		
		if (configuration) {
			var config = new VAT.Configuration();
			var template = getTaxTemplate(_Report.metadata.template.online);
			var schema = config.getSchema(template.schema);
			
			for(var ifield in schema) {
				var objschema = schema[ifield];
				var value = configuration.GetValue(objschema.altcode);
				if (!value) {value = objschema.value;};

				if(objschema.type == 'Multiple Select') {
					var options = Tax.SELECT[_Report.CountryCode][ifield];
					for(var i = 0; i < options.length; i++) {
						var isSelected = value.indexOf(options[i]) > -1;
						data[ifield+i] = isSelected ? 'selected' : '';
					}
				} else {
					data[ifield] = value;
				}
			}
		}
		
		for(var iattr in defaultdata) {
			data[iattr] = data[iattr]?data[iattr]:defaultdata[iattr];
		}
		
		var content = _Report.isHandleBars ? _App.RenderHandlebarsTemplate(reporttemplate, data) : _App.RenderTemplate(reporttemplate, data);
		
		var form = nlapiCreateForm('Tax Reports (International) - ' + reportName, true);
		form.setScript('customscript_vat_onlinefiling_cs');
		
		for(var ibutton = 1; ibutton<=2; ibutton++) {
			var htmSaveButton = _App.ButtoniseExtJs('btnsave' + ibutton, 'Save', 'OnSave()', true);
			_App.CreateField(form, 'btnsave' + ibutton, 'inlinehtml', '', false, htmSaveButton, 'normal', ibutton == 1 ? 'outsideabove' : 'outsidebelow', 'startcol');
			
			var htmCancelButton = _App.ButtoniseExtJs('btncancel' + ibutton, 'Cancel', 'OnCancel()', true);
			_App.CreateField(form, 'btncancel' + ibutton, 'inlinehtml', '', false, htmCancelButton, 'normal', ibutton == 1 ? 'outsideabove' : 'outsidebelow');
		}
		
		_App.CreateField(form, 'formid', 'text', 'Form ID', false, _Report.metadata.template.online, displayhidden, 'outsidebelow', 'startrow');
		_App.CreateField(form, 'metadata', 'longtext', 'Current Values', false, JSON.stringify(data), displayhidden, 'outsidebelow', 'startrow');
		
		var field = _App.CreateField(form, 'onlinetemplate', 'inlinehtml', '', false, content, 'normal', 'normal');
		field.setDisplaySize(800);

		response.writePage(form);
	};
	
	this.Save = function(params) {
		nlapiLogExecution('DEBUG', 'VAT.OnlineFiling.Save: params', JSON.stringify(params));
		var config = new VAT.Configuration();
		var template = getTaxTemplate(_Report.metadata.template.online);
		var schema = config.getSchema(template.schema);
		
		var configuration;
		if (_IsOneWorld) {
			configuration = new Tax.Returns.Configuration(_Report.CountryCode, _SubId);
		} else {
			configuration = new Tax.Returns.Configuration(_Report.CountryCode);
		}

		nlapiLogExecution('Debug', 'saveOnlineFiling: schema', JSON.stringify(schema));
		for(var ifield in schema) {
			var objschema = schema[ifield];
			var paramvalue = params[ifield];

			var field = objschema.altcode;
			var id = configuration.GetId(field);
			var propvalue = objschema.value;
			paramvalue = paramvalue?paramvalue:propvalue;
			nlapiLogExecution('Debug', 'saveOnlineFiling: ID:' + ifield, id + ':' + propvalue);
			
			if (id) {
				nlapiSubmitField('customrecord_tax_return_setup_item', id, 'custrecord_vat_cfg_value', unescape(paramvalue));
				nlapiSubmitField('customrecord_tax_return_setup_item', id, 'custrecord_vat_cfg_newtaxfiling', 'T');
			} else {
				createRecord(field, unescape(paramvalue));
			}
		}
		response.write(true);
	};
	
	function createRecord(field, value) {
		var rec = nlapiCreateRecord('customrecord_tax_return_setup_item');
		if (_IsOneWorld) {
			rec.setFieldValue('custrecord_vat_cfg_subsidiary', _SubId);
		}
		rec.setFieldValue('custrecord_vat_cfg_country', _Report.CountryCode);
		rec.setFieldValue('custrecord_vat_cfg_name', field);
		rec.setFieldValue('custrecord_vat_cfg_value', value);
		rec.setFieldValue('custrecord_vat_cfg_newtaxfiling', 'T');
		nlapiSubmitRecord(rec);
	}
};

VAT.AdjustmentJournal = function(request, response) {
	var isAdvancedTaxes = nlapiGetContext().getFeature('advtaxengine');
	var isOW = nlapiGetContext().getSetting('FEATURE', 'SUBSIDIARIES') == 'T';
	var isDepartment = nlapiGetContext().getSetting('FEATURE', 'DEPARTMENTS') == 'T';
	var isLocation = nlapiGetContext().getSetting('FEATURE', 'LOCATIONS') == 'T';
	var isClass = nlapiGetContext().getSetting('FEATURE', 'CLASSES') == 'T';
	var isMultiCurrency = nlapiGetContext().getFeature('multicurrency');
	
	var config = nlapiLoadConfiguration('accountingpreferences');
	var isDepartmentMandatory = config.getFieldValue('deptmandatory') == 'T';
	var isLocationMandatory = config.getFieldValue('locmandatory') == 'T';
	var isClassMandatory = config.getFieldValue('classmandatory') == 'T';

	var requesttype = request.getParameter('requesttype');
	var query = request.getParameter('query');
	var reportindex = request.getParameter('reportindex');
	var periodfromid = request.getParameter('periodfrom');
	var periodtoid = request.getParameter('periodto');
	var subsidiaryid = request.getParameter('subid') === 'null' ? null : request.getParameter('subid');
	var isconsolidated = request.getParameter('isconsolidated') == 'true';
	var bookid = request.getParameter('bookid') === 'null' ? null : request.getParameter('bookid');
	var currentfield = request.getParameter('field');
	var taxcodeid = request.getParameter('taxcodeid');
	var displayhidden = _App.Context.getLogLevel() == 'DEBUG' ? 'inline' : 'hidden';
	
	var colcount = 10;
	var columns = [
		{title: 'Field', id: 'field'}, {title: 'Tax Code', id: 'taxcodeid'}, {title: 'Tax Account', id: 'taxaccountid'}, {title: 'Amount', id: 'amount'},
		{title: 'Adjustment', id: 'adjustmentamount'}, {title: 'Action', id: 'action'}, {title: 'Account', id: 'accountid'}, {title: 'New Value', id: 'newvalue'},
		{title: 'Memo', id: 'memo'}, {title: 'Name', id: 'name'}
	];
	
	if (isDepartment) {
		columns.push({title: isDepartmentMandatory ? 'Department*' : 'Department', id: 'departmentid'});
		colcount++;
	}
	if (isClass) {
		columns.push({title: isClassMandatory ? 'Class*' : 'Class', id: 'classid'});
		colcount++;
	}
	if (isLocation) {
		columns.push({title: isLocationMandatory ? 'Location*' : 'Location', id: 'locationid'});
		colcount++;
	}
	
	this.Run = run;
	function run(params) {
		nlapiLogExecution('Debug', 'All Params', JSON.stringify(params));
		
		//translate to _App.params.xxx
		nlapiLogExecution('Debug', 'Params',
			JSON.stringify({field: currentfield, requesttype:requesttype, query:query, reportindex:reportindex, periodfromid:periodfromid, 
			periodtoid:periodtoid, subsidiaryid:subsidiaryid, isconsolidated:isconsolidated, taxcodeid:taxcodeid})
		);
		if (requesttype == 'save') {
			var journalines = retrieveJournalLines(request);
			var journalid = createJournalEntry(journalines);
			response.write(JSON.stringify({result: journalid}));
		} else if (requesttype == 'taxaccount') {
			var listtaxaccount = getTaxControlAccount(taxcodeid, currentfield);
			response.write(JSON.stringify({root: listtaxaccount}));
		} else if (requesttype == 'department') {
			var listaccount = getDepartmentList(query, subsidiaryid);
			response.write(JSON.stringify({root: listaccount}));
		} else if (requesttype == 'class') {
			var listclass = getClassList(query, subsidiaryid);
			response.write(JSON.stringify({root: listclass}));
		} else if (requesttype == 'location') {
			var listlocation = getLocationList(query, subsidiaryid);
			response.write(JSON.stringify({root: listlocation}));
		} else if (requesttype == 'account') {
			var listaccount = getAccountList(query, subsidiaryid);
			response.write(JSON.stringify({root: listaccount}));
		} else if (requesttype == 'taxcode') {
			var listtaxcode = getTaxCodeList(currentfield);
			response.write(JSON.stringify({root: listtaxcode}));
		} else if (requesttype == 'customer') {
			var listcustomer = getCustomerList(query, subsidiaryid);
			response.write(JSON.stringify({root: listcustomer}));
		} else if (requesttype == 'vendor') {
			var listvendor = getVendorList(query, subsidiaryid);
			response.write(JSON.stringify({root: listvendor}));
		} else {
			var form = createAdjustmentForm();
			response.writePage(form);
		}
	}
	
	function getPostingPeriod(postingdate) {
		var period = '';
		try {
			var filters = [new nlobjSearchFilter('closed', null, 'is', 'F'),
				new nlobjSearchFilter('isquarter', null, 'is', 'F'),
				new nlobjSearchFilter('isyear', null, 'is', 'F'),
				new nlobjSearchFilter('enddate', null, 'onorafter', nlapiDateToString(postingdate))
			];
			
			var enddatecol = new nlobjSearchColumn('enddate');
			var columns = [new nlobjSearchColumn('periodname'), enddatecol];
			enddatecol.setSort();
			
			var rs = nlapiSearchRecord('accountingperiod', null, filters, columns);

			if (rs) {
				period = rs[0].getValue('periodname');
			}
		} catch (ex) {logException(ex, 'getPostingPeriod');}
		
		return period;
	}
	
	function createAdjustmentForm() {
		var form = nlapiCreateForm('Adjustment', true);
		
		var listfield = form.addField('custpage_list', 'inlinehtml', 'List');
		var template = getTaxTemplate('VAT_ADJUSTMENT');
		_App.CreateField(form, 'custpage_script', 'inlinehtml', '', false, '<script language=\'javascript\'>' + _App.GetLibraryFile('tax_commons_lib_cs.js').getValue() + 'Ext.onReady(function(){setFieldHelp();});</script>', 'normal', 'outsideabove');
		
		for(var ibutton = 1; ibutton<=2; ibutton++) {
			var htmSaveButton = _App.ButtoniseExtJs('btnsave' + ibutton, 'Save', 'OnSave()', true);
			_App.CreateField(form, 'btnsave' + ibutton, 'inlinehtml', '', false, htmSaveButton, 'normal', ibutton == 1 ? 'outsideabove' : 'outsidebelow', 'startcol');
			
			var htmCancelButton = _App.ButtoniseExtJs('btncancel' + ibutton, 'Cancel', 'OnCancel()', true);
			_App.CreateField(form, 'btncancel' + ibutton, 'inlinehtml', '', false, htmCancelButton, 'normal', ibutton == 1 ? 'outsideabove' : 'outsidebelow');
		}
		
		var endperiod = new SFC.System.TaxPeriod(periodtoid);
		var helplink = ['<a href=\'#\' onclick=\'window.open(', '"/app/help/helpcenter.nl?topic=DOC_VATReturnAdjustment"', ')\'>Click here to view the Help topic</a>'];
		_App.CreateField(form, 'help_link', 'inlinehtml', '', false, helplink.join(''), 'normal', 'outsideabove', 'startrow');
		
		_App.CreateField(form, 'link_trandate', 'inlinehtml', '', false, '<a style=\'font-size: 14px\' class=\'tooltip\' id=\'trandate\'>Date</a>&nbsp;&nbsp;&nbsp;', 'normal', 'outsideabove', 'startrow');
		_App.CreateField(form, 'trandate', 'inlinehtml', '', false, '<span style=\'font-size: 14px\'>' + nlapiDateToString(endperiod.GetEndDate()) + '</span>', 'inline', 'outsideabove');
		_App.CreateField(form, 'link_accountingperiod', 'inlinehtml', '', false, '<a style=\'font-size: 14px\' class=\'tooltip\' id=\'value_accountingperiod\'>Accounting Period</a>&nbsp;&nbsp;&nbsp;', 'normal', 'outsideabove', 'startrow');
		_App.CreateField(form, 'value_accountingperiod', 'inlinehtml', '', false, '<span style=\'font-size: 14px\'>' + getPostingPeriod(endperiod.GetEndDate()) + '</span>', 'inline', 'outsideabove');
		
		var precision = 2; 
		var rec = null;
		allowDecimal = 'true';
		if (isMultiCurrency) {
			if (isOW){
				rec = nlapiCreateRecord('journalentry', {subsidiary: subsidiaryid});
			} else {
				rec = nlapiCreateRecord('journalentry');
			}
			precision = rec.getFieldValue('currencyprecision');
			
			if (precision === 0) {
				allowDecimal = 'false';
			}
			_App.CreateField(form, 'currency', 'text', 'Currency', false, rec.getFieldText('currency'), displayhidden == 'normal' ? 'inline' : displayhidden, 'outsideabove', 'startrow');
			_App.CreateField(form, 'currencyprecision', 'text', 'Currency Precision', false, precision, displayhidden == 'normal' ? 'inline' : displayhidden, 'outsideabove', 'startrow');
		}
		_App.CreateField(form, 'formid', 'text', 'Form Id', false, 'VAT_ADJUSTMENT', displayhidden, 'outsideabove', 'startrow');
		
		var reportclass = VAT.GetReportByClassName(reportindex);
		var currentdata = reportclass.GetData({
			periodFrom: periodfromid,
			periodTo: periodtoid,
			subId: subsidiaryid,
			isConsolidated: isconsolidated,
			bookId: bookid
		});
		
		var metadata = reportclass.GetAdjustmentMetaData({
			periodFrom: periodfromid,
			periodTo: periodtoid,
			subId: subsidiaryid,
			isConsolidated: isconsolidated,
			bookId: bookid
		});
		
		var taxmap = metadata.TaxMap;
		var field = ['id', 'field', 'amount'];
		var fielddata = [];
		
		var rowcount = 0;
		var addOtherFieldColumns = false;
		
		for(var imap in taxmap) {
			var obj = taxmap[imap];
			var taxlist = obj.taxcodelist;
			
			var taxcodelist = [];
			for(var icode = 0; icode < taxlist.length; icode++) {
				var taxcode = taxlist[icode].taxcode;
				taxcodelist.push(taxcode);
			}
			var rowdata = [obj.id, obj.label, currentdata[obj.id]];
			
			if(obj.otherfields){
		        for(var fld = 0; fld < obj.otherfields.length; fld++){
		            if(!addOtherFieldColumns){
			            columns.push({title: obj.otherfields[fld].title, id: obj.otherfields[fld].id});
			            field.push(obj.otherfields[fld].id);
			            colcount++;
		            }
		            rowdata.push(obj.otherfields[fld].value[0]);
		        }
		        addOtherFieldColumns = true;
			}
			fielddata.push(rowdata);
			rowcount++;
		}
		
		nlapiLogExecution('Debug', 'Field', JSON.stringify(field));
		nlapiLogExecution('Debug', 'Field Data', JSON.stringify(fielddata));
		
		var adjustmentform = _App.RenderTemplate(template.short, {field:JSON.stringify(field), data: JSON.stringify(fielddata), precision: precision, allowDecimal: allowDecimal,  
			isclass: isClass, isdepartment: isDepartment, islocation: isLocation, isclassmandatory: isClassMandatory, isdeptmandatory: isDepartmentMandatory, islocmandatory: isLocationMandatory, 
			colcount: colcount, rowcount: rowcount, columndef: JSON.stringify(columns)});
		listfield.setDefaultValue(adjustmentform);
		
		return form;
	}
	
	this.getTaxCodeList = getTaxCodeList();
	function getTaxCodeList(field) {
		var list = [];
		try {
			var reportclass = VAT.GetReportByClassName(reportindex);
			if (!reportclass || !field) {
				return list;
			}
			
			var adjustmentmeta = reportclass.GetAdjustmentMetaData({periodFrom: periodfromid, periodTo:periodtoid, subId:subsidiaryid, isConsolidated:isconsolidated});
			var taxdef = adjustmentmeta.TaxDefinition;
			var taxmap = adjustmentmeta.TaxMap;
			nlapiLogExecution('Debug', 'Tax Map:  ' + field , JSON.stringify(taxmap[field]));

			var taxcodelist = taxmap[field].taxcodelist;
			var taxverifier = [];
			for(var ifx = 0; ifx < taxcodelist.length; ifx++) {
				var def =  taxcodelist[ifx];
				var fxdef = taxdef[def.taxcode]; 
				if (fxdef) {
					taxverifier.push (fxdef);
				}
			}
			var reader = new VAT.DataReader(new VAT.TaxcodeDefinitions(reportclass.CountryCode, taxdef), periodfromid, periodtoid, subsidiaryid, isconsolidated);
			var filters = [new nlobjSearchFilter('isinactive', null, 'is', 'F')];
			if (isAdvancedTaxes) {
				filters.push(new nlobjSearchFilter('country', null, 'is', reportclass.CountryCode));
			}
			var columns = [new nlobjSearchColumn('name')];
			var rs = nlapiSearchRecord('salestaxitem', null, filters, columns);
			
			for(var irs in rs) {
				var taxcodeid = rs[irs].getId();
				var taxcode = reader.LoadTaxcodeById(taxcodeid);
				
				for (var iverify = 0; iverify < taxverifier.length; iverify++) {
					if (taxverifier[iverify](taxcode) && taxcode.Rate > 0) {
						list.push({id: taxcodeid, name: rs[irs].getValue('name')});
					}
				}
			}
		} catch (ex) {logException(ex, 'getTaxCodeList');}
		
		nlapiLogExecution('Audit', 'getTaxCodeList', JSON.stringify(list));
		return list;
	}
	
	this.getTaxControlAccount = getTaxControlAccount;
	function getTaxControlAccount(taxcodeid, field) {
		var list = [];
		try {
			var reportclass = VAT.GetReportByClassName(reportindex);
			var adjustmentmeta = reportclass.GetAdjustmentMetaData({periodFrom: periodfromid, periodTo:periodtoid, subId:subsidiaryid, isConsolidated:isconsolidated});
			var taxdef = adjustmentmeta.TaxDefinition;
			var taxmap = adjustmentmeta.TaxMap;
			var taxcodelist = taxmap[field].taxcodelist;
			var taxtypedef = new VAT.TaxcodeDefinitions(reportclass.CountryCode, taxdef);
			var reader = new VAT.DataReader(taxtypedef, periodfromid, periodtoid, subsidiaryid, isconsolidated);
			var taxtype = taxtypedef.GetTypeOf(reader.LoadTaxcodeById(taxcodeid));
			
			nlapiLogExecution('Debug', 'getTaxControlAccount: taxcodelist', JSON.stringify(taxcodelist));
			var available = 'NONE';
			for(var ilist = 0; ilist < taxcodelist.length; ilist++) {
				var taxcodedef = taxcodelist[ilist];
				if (taxcodedef.taxcode == taxtype) {
					available = taxcodedef.available;
					break;
				} 
			}
			
			var rec = nlapiLoadRecord('salestaxitem', taxcodeid);
			var recavailable = rec.getFieldValue('available'); //what to do?
			
			if (available == 'BOTH') {
				list.push({id: rec.getFieldValue('purchaseaccount'), name: rec.getFieldValue('acct1'), type: 'PURCHASE'});
				list.push({id: rec.getFieldValue('saleaccount'), name: rec.getFieldValue('acct2'), type: 'SALE'});
			} else if (available == 'SALE') {
				list.push({id: rec.getFieldValue('saleaccount'), name: rec.getFieldValue('acct2'), type: 'SALE'});
			} else if (available == 'PURCHASE') {
				list.push({id: rec.getFieldValue('purchaseaccount'), name: rec.getFieldValue('acct1'), type: 'PURCHASE'});
			}
		} catch (ex) {logException(ex, 'getTaxControlAccount');}
		
		nlapiLogExecution('Audit', 'getTaxControlAccount', JSON.stringify(list));
		return list;
	}
	
	this.getAccountList = getAccountList;
	function getAccountList(startswith, subsidiaryid) {
		var list = [];
		try {
			var filters = [new nlobjSearchFilter('isinactive', null, 'is', 'F')];
			if (startswith) {
				filters.push(new nlobjSearchFilter('name', null, 'startswith', startswith));
			}
			
			if (isOW && subsidiaryid) {
				filters.push(new nlobjSearchFilter('subsidiary', null, 'is', subsidiaryid));
			}
			var columns = [new nlobjSearchColumn('name')];
			var rs = nlapiSearchRecord('account', null, filters, columns);
			
			for(var irs in rs) {
				list.push({id: rs[irs].getId(), name: rs[irs].getValue('name')
				});
			}
		} catch (ex) {logException(ex, 'getAccountList');}
		
		nlapiLogExecution('Audit', 'getAccountList', JSON.stringify(list));
		return list;
	}
	
	this.getDepartmentList = getDepartmentList;
	function getDepartmentList(startswith, subsidiaryid) {
		var list = [];
		try {
			nlapiLogExecution('Debug', 'getDepartmentList', JSON.stringify({startswith: startswith, subsidiaryid: subsidiaryid}));
			var filters = [new nlobjSearchFilter('isinactive', null, 'is', 'F')];
			if (startswith) {
				filters.push(new nlobjSearchFilter('name', null, 'startswith', startswith));
			}
			
			if (isOW && subsidiaryid) {
				filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', subsidiaryid));
			}
			
			var columns = [new nlobjSearchColumn('name')];
			var rs = nlapiSearchRecord('department', null, filters, columns);
			
			for(var irs in rs) {
				list.push({id: rs[irs].getId(), name: rs[irs].getValue('name')});
			}
		} catch (ex) {logException(ex, 'getDepartmentList');}
		
		nlapiLogExecution('Audit', 'getDepartmentList', JSON.stringify(list));
		return list;
	}
	
	this.getLocationList = getLocationList;
	function getLocationList(startswith, subsidiaryid) {
		var list = [];
		try {
			nlapiLogExecution('Debug', 'getLocationList', JSON.stringify({startswith: startswith, subsidiaryid: subsidiaryid}));
			var filters = [new nlobjSearchFilter('isinactive', null, 'is', 'F')];
			if (startswith) {
				filters.push(new nlobjSearchFilter('name', null, 'startswith', startswith));
			}
			
			if (isOW && subsidiaryid) {
				filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', subsidiaryid));
			}
			
			var columns = [new nlobjSearchColumn('name')];
			var rs = nlapiSearchRecord('location', null, filters, columns);
			
			for(var irs in rs) {
				list.push({id: rs[irs].getId(), name: rs[irs].getValue('name')});
			}
		} catch (ex) {logException(ex, 'getLocationList');}
		
		nlapiLogExecution('Audit', 'getLocationList', JSON.stringify(list));
		return list;
	}
	
	this.getClassList = getClassList ;
	function getClassList (startswith, subsidiaryid) {
		var list = [];
		try {
			nlapiLogExecution('Debug', 'getClassList ', JSON.stringify({startswith: startswith, subsidiaryid: subsidiaryid}));
			var filters = [new nlobjSearchFilter('isinactive', null, 'is', 'F')];
			if (startswith) {
				filters.push(new nlobjSearchFilter('name', null, 'startswith', startswith));
			}
			
			if (isOW && subsidiaryid) {
				filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', subsidiaryid));
			}
			
			var columns = [new nlobjSearchColumn('name')];
			var rs = nlapiSearchRecord('classification', null, filters, columns);
			
			for(var irs in rs) {
				list.push({id: rs[irs].getId(), name: rs[irs].getValue('name')});
			}
		} catch (ex) {logException(ex, 'getClassList');}
		
		nlapiLogExecution('Audit', 'getClassList', JSON.stringify(list));
		return list;
	}
	
	this.getCustomerList = getCustomerList;
	function getCustomerList(startswith, subsidiaryid) {
		var list = [];
		try {
			var filters = [new nlobjSearchFilter('isinactive', null, 'is', 'F')];
			if (startswith) {
				filters.push(new nlobjSearchFilter('entityid', null, 'startswith', startswith));
			}
			
			if (isOW && subsidiaryid) {
				if (isMultiCurrency) {
					var subfilter = [new nlobjSearchFilter('internalid', null, 'is', subsidiaryid)];
					var subcolumn = [new nlobjSearchColumn('currency')];
					var subrs = nlapiSearchRecord('subsidiary', null, subfilter , subcolumn);
					var currencyid = subrs[0].getValue('currency');
					filters.push(new nlobjSearchFilter('currency', null, 'is', currencyid));
				}
				filters.push(new nlobjSearchFilter('subsidiary', null, 'is', subsidiaryid));
			}
			var columns = [new nlobjSearchColumn('entityid')];
			var rs = nlapiSearchRecord('customer', null, filters, columns);
			
			for(var irs in rs) {
				list.push({id: rs[irs].getId(), name: rs[irs].getValue('entityid')});
			}
		} catch (ex) {logException(ex, 'getCustomerList');}
		
		nlapiLogExecution('Audit', 'getCustomerList', JSON.stringify(list));
		return list;
	}
	
	this.getVendorList = getVendorList;
	function getVendorList(startswith, subsidiaryid) {
		var list = [];
		try {
			var filters = [new nlobjSearchFilter('isinactive', null, 'is', 'F')];
			if (startswith) {
				filters.push(new nlobjSearchFilter('entityid', null, 'startswith', startswith));
			}
			
			if (isOW && subsidiaryid) {
				if (isMultiCurrency) {
					var subfilter = [new nlobjSearchFilter('internalid', null, 'is', subsidiaryid)];
					var subcolumn = [new nlobjSearchColumn('currency')];
					var subrs = nlapiSearchRecord('subsidiary', null, subfilter , subcolumn);
					var currencyid = subrs[0].getValue('currency');
					filters.push(new nlobjSearchFilter('currency', null, 'is', currencyid));
				}

				filters.push(new nlobjSearchFilter('subsidiary', null, 'is', subsidiaryid));
			}
			var columns = [new nlobjSearchColumn('entityid')];
			var rs = nlapiSearchRecord('vendor', null, filters, columns);
			
			for(var irs in rs) {
				list.push({id: rs[irs].getId(), name: rs[irs].getValue('entityid')});
			}
		} catch (ex) {logException(ex, 'getVendorList');}
		
		nlapiLogExecution('Audit', 'getVendorList', JSON.stringify(list));
		return list;
	}

	function retrieveJournalLines(request) {
		var journallines = [];
		try {
			var reportclass = VAT.GetReportByClassName(reportindex);
			var adjustmentmeta = reportclass.GetAdjustmentMetaData({periodFrom: periodfromid, periodTo:periodtoid, subId:subsidiaryid, isConsolidated:isconsolidated});
			
			var taxmap = adjustmentmeta.TaxMap;
			for(var imap in taxmap) {
				var line = {
					field: imap,
					taxcodeid: request.getParameter(columns[1].id + '_' + imap),
					taxaccountid: request.getParameter(columns[2].id + '_' + imap),
					accountid: request.getParameter(columns[6].id + '_' + imap),
					amount: request.getParameter(columns[4].id + '_' + imap),
					action: request.getParameter(columns[5].id + '_' + imap),
					memo: request.getParameter(columns[8].id + '_' + imap),
					entityid: request.getParameter(columns[9].id + '_' + imap),
					type: request.getParameter('type_' + columns[2].id + '_' + imap)
				};
				
				if(taxmap[imap].otherfields){
				    line.otherfields = [];
				    for(var fld=0; fld<taxmap[imap].otherfields.length; fld++){
				        line.otherfields.push({id: taxmap[imap].otherfields[fld].id,
				                               value: taxmap[imap].otherfields[fld].value[0]});
				    }
				}
				
				if (isDepartment) {
					line.departmentid = request.getParameter(columns[10].id + '_' + imap);
				}
				if (isClass) {
					line.classid = request.getParameter(columns[isDepartment ? 11 : 10].id + '_' + imap);
				}
				if (isLocation) {
					line.locationid = request.getParameter(columns[colcount - 1].id + '_' + imap);
				}
				journallines.push(line);
			}
		} catch (ex) {logException(ex, 'retrieveJournalLines');}
		return journallines;
	}
	
	this.createJournalEntry = createJournalEntry;
	function createJournalEntry(journallines) {
		var journalid = -1;
		try {
			var rec = {};
			nlapiLogExecution('Debug', 'createJournalEntry: Params', JSON.stringify(journallines));
			if (isOW) {
				rec = nlapiCreateRecord('journalentry', {subsidiary: subsidiaryid});
			} else {
				rec = nlapiCreateRecord('journalentry');
			}
			
			var endperiod = new SFC.System.TaxPeriod(periodtoid);
			rec.setFieldValue('trandate', nlapiDateToString(endperiod.GetEndDate()));
			rec.setFieldValue('custbody_adjustment_journal', 'T');
			
			var isvalid = false;
			for(var iline = 0; iline < journallines.length; iline++) {
				var objline = journallines[iline];
				
				if (!objline.amount || !objline.taxaccountid || !objline.accountid || !objline.taxcodeid) {
					continue;
				} else {
					isvalid = true;
				}

				rec.selectNewLineItem('line');
				rec.setCurrentLineItemValue('line', 'custcol_adjustment_field', objline.field);
				rec.setCurrentLineItemValue('line', 'account', objline.taxaccountid);
				rec.setCurrentLineItemValue('line', 'custcol_adjustment_tax_code', objline.taxcodeid);
					
				if (objline.type == 'SALE') {
					rec.setCurrentLineItemValue('line', (objline.action == 'add' ? 'credit' : 'debit'), objline.amount);
					rec.setCurrentLineItemValue('line', (objline.action == 'add' ? 'origcredit' : 'origdebit'), objline.amount);
				} else if (objline.type == 'PURCHASE') {
					rec.setCurrentLineItemValue('line', (objline.action == 'add' ? 'debit' : 'credit'), objline.amount);
					rec.setCurrentLineItemValue('line', (objline.action == 'add' ? 'origdebit' : 'origcredit'), objline.amount);
				}
				rec.setCurrentLineItemValue('line', 'memo', objline.memo);
				
				if (objline.entityid) {
					rec.setCurrentLineItemValue('line', 'entity', objline.entityid);
				}
					
				if (isLocation && objline.locationid) {
					rec.setCurrentLineItemValue('line', 'location', objline.locationid);
				}
					
				if (isDepartment && objline.departmentid) {
					rec.setCurrentLineItemValue('line', 'department', objline.departmentid);
				}
				
				if (isClass && objline.classid) {
					rec.setCurrentLineItemValue('line', 'class', objline.classid);
				}
				if(objline.otherfields){
                    for(var i = 0; i < objline.otherfields.length; i ++){
                        rec.setCurrentLineItemText('line', 'custcol_' + objline.otherfields[i].id, objline.otherfields[i].value);
                    }
                }
				rec.commitLineItem('line');
					
				rec.selectNewLineItem('line');
				rec.setCurrentLineItemValue('line', 'account', objline.accountid);
				
				if (objline.type == 'SALE') {
					rec.setCurrentLineItemValue('line', (objline.action == 'add' ? 'debit' : 'credit'), objline.amount);
					rec.setCurrentLineItemValue('line', (objline.action == 'add' ? 'origdebit' : 'origcredit'), objline.amount);
				} else if (objline.type == 'PURCHASE') {
					rec.setCurrentLineItemValue('line', (objline.action == 'add' ? 'credit' : 'debit'), objline.amount);
					rec.setCurrentLineItemValue('line', (objline.action == 'add' ? 'origcredit' : 'origdebit'), objline.amount);
				}
				rec.setCurrentLineItemValue('line', 'memo', objline.memo);
				
				if (objline.entityid) {
					rec.setCurrentLineItemValue('line', 'entity', objline.entityid);
				}
				
				if (isLocation && objline.locationid) {
					rec.setCurrentLineItemValue('line', 'location', objline.locationid);
				}
				
				if (isDepartment && objline.departmentid) {
					rec.setCurrentLineItemValue('line', 'department', objline.departmentid);
				}
				
				if (isClass && objline.classid) {
					rec.setCurrentLineItemValue('line', 'class', objline.classid);
				}
				
				if(objline.otherfields){
				    for(var i = 0; i < objline.otherfields.length; i ++){
				        rec.setCurrentLineItemText('line', 'custcol_' + objline.otherfields[i].id, objline.otherfields[i].value);
				    }
				}

				rec.commitLineItem('line');

				//set all column field to not mandatory.
				var count = rec.getLineItemCount('line');
				var columnfields = rec.getAllLineItemFields('line');
				for(var irow = 0; irow < count; irow++) {
				  for(var ifield = 0; ifield < columnfields.length; ifield++) {
						var field = rec.getLineItemField('line', columnfields[ifield], irow + 1);
					  if (field) field.setMandatory(false);
				  }
				}
			}
			if (isvalid) {
				journalid = nlapiSubmitRecord(rec, false, true);	
			}
		} catch (ex) {logException(ex, 'createJournalEntry');}
		
		return journalid;
	}
};
