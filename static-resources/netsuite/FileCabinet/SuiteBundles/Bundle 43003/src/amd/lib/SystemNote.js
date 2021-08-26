/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 */
define([
	'N/search',
    './module/util',
    './OnlineFilingTemplateManager',
    './Constants'
],
function(
	search,
	filingUtil,
    OnlineFilingTemplateManager,
    Constants
) {

    var SystemNote = function(response) {
        this.name = 'SystemNoteMTD';
        this.filingUtil = filingUtil;
        this.response = response;
        this.search = search;
		this.templateManager = new OnlineFilingTemplateManager();
		
		this.encodeHTML = function encodeHTML(htmlString) {
			return htmlString
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
		};
    };

    SystemNote.prototype.get = function(params) {
    	try {
        	var limit = params.limit || parseInt(params.pagesize);
    		var startindex = params.start || 0;
    		var rowtemplate = this.templateManager.getByName('HMRC.MTD.CSV.SubmissionHistory');
    		var rows = [];
    		var filter = [
    			['isinactive', 'is', 'F'],
    			'and',
    			['custrecord_online_filing_action', 'is', Constants.ACTION.SUBMIT_CSV]
			];
    		
    		if (params.isOneWorld) {
    			filter.push('and')
    			filter.push(['custrecord_online_filing_subsidiary', 'is', params.subid]);
    		}
    		
    		var countcolumn = [{
    			name: 'internalid',
    			summary: 'count'
    		}];
    		
    		var countrec = this.search.create({
    			type: 'customrecord_online_filing',
    			filters: filter,
    			columns: countcolumn
    		}).run().getRange({ start: 0, end: 1 });

    		var count = countrec[0].getValue({
    			name: 'internalid',
    			summary: 'count'
    		});
    		
    		var column = ['custrecord_online_filing_user',
    					  'created',
    					  'custrecord_online_filing_status',
    					  'custrecord_online_filing_covered_periods',
    					  'custrecord_online_filing_action'];
    		
    		var searchObj = this.search.create({
    			type: 'customrecord_online_filing',
    			filters: filter,
    			columns: column
    		});
    		var set = searchObj.run();
    		var endindex = parseInt(limit) + parseInt(startindex); 
    		
    		var rs = set.getRange({
				start: parseInt(startindex),
				end: endindex
			});

    		var taxperiodmap = this.getTaxPeriodMap();
    		for(var irow in rs) {
				var internalid = rs[irow].id; 
				var name = rs[irow].getText('custrecord_online_filing_user');
				var date = this.filingUtil.formatDateToMTDDate(new Date(rs[irow].getValue('created')), 'shortdate');
				var status = rs[irow].getValue('custrecord_online_filing_status');
				var coveredPeriodStr = rs[irow].getValue('custrecord_online_filing_covered_periods');
				var coveredperiodArr = coveredPeriodStr ? coveredPeriodStr.split(',') : [];
				var periodfrom = taxperiodmap[Math.min.apply(null, coveredperiodArr)];
				var periodto = taxperiodmap[Math.max.apply(null, coveredperiodArr)];
				var rowdata = {
				    internalid: internalid,
				    user: this.encodeHTML(name),
				    date: date,
				    status: status,
				    periodfrom: periodfrom,
				    periodto: periodto,
				};

	        	rows.push(this.filingUtil.render(rowtemplate, rowdata));
			}
			
			var xml = ['<?xml version="1.0" encoding="UTF-8"?>'];
			xml.push('<SysNote>');
			xml.push('<Total>' + count + '</Total>');
			xml.push(rows.join(''));
			xml.push('</SysNote>');
			this.response.setHeader({
				name: 'Content-Type',
				value: 'text/xml'
			});
			this.response.write(xml.join(''));
    	} catch (ex) {
            var name = ex.name || ex.code || 'ERROR';
            var message = ex.message || 'An error occurred';
            log.error({ title: 'SystemNote.get', details: name + ' - ' + message });
		}
		
    };
    
    SystemNote.prototype.getTaxPeriodMap = function() {
		var periodmap = {};
		try {
			var limit = 1000;
			var column = ['periodname'];
			var searchObj = this.search.create({
				type: search.Type.TAX_PERIOD,
				columns: column
			});
			var set = searchObj.run();

			var startindex = 0;
			var endindex = parseInt(limit) + parseInt(startindex);

			while (true) {
				var rs = set.getRange({
					start: startindex,
					end: endindex
				});
				if (rs && rs.length > 0) {
					for(var irs in rs) {
						periodmap[rs[irs].id] = rs[irs].getValue('periodname');
					}
					startindex = endindex;
					endindex = endindex + limit;
				} else {
					break;
				}
			}
		} catch (ex) {
            var name = ex.name || ex.code || 'ERROR';
            var message = ex.message || 'An error occurred';
            log.error({ title: 'SystemNote.getTaxPeriodMap', details: name + ' - ' + message });
		}
		
		return periodmap;
	}

    return SystemNote;
});
