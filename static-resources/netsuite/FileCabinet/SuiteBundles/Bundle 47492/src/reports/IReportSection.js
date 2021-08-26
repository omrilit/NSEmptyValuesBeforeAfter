var TAF = TAF || {};

TAF.IReportSection = function(state, params, output, job) {
	this.Name = '';
	this.params = params;
	this.state = state || {};
	this.output = output;
	this.job = job;
	this.pageSize = 1000;
	this.thresholdReached = false;
	
	if (this.params) {
		this.formatter = params.formatter;
		this.filename = params.filename;
	}
};

TAF.IReportSection.prototype.On_Init = function _onInit() {
	if (this.filename) {
		this.output.SetFileName(this.filename);
	}
};

TAF.IReportSection.prototype.On_Header = function _onHeader() {

};

TAF.IReportSection.prototype.On_Body = function _onBody() {

};

TAF.IReportSection.prototype.On_Footer = function _onFooter() {

};

TAF.IReportSection.prototype.On_CleanUp = function _onCleanUp() {
	delete this.state[this.Name];
};

TAF.IReportSection.prototype.process = function _process(dao, startIndex, callback, callbackParams) {
	if (!dao) {
		throw nlapiCreateError('MISSING_PARAMETER', 'dao is a required parameter');
	}

	if (!callback) {
		throw nlapiCreateError('MISSING_PARAMETER', 'callback is a required parameter');
	}
	
	if (typeof callback !== 'function') {
		throw nlapiCreateError('INVALID_PARAMETER', 'callback should be a function');
	}

	if (startIndex === null && startIndex === undefined && startIndex === NaN) {
		throw nlapiCreateError('INVALID_PARAMETER', 'startIndex should be a number');
	}

	var list = [];
	var index = startIndex;

	try {
		do {
			list = dao.getList(index, index + this.pageSize);
			var iterator = new TAF.Lib.Iterator(list);
			
			while(iterator.hasNext()) {
				callback.call(this, iterator.next(), callbackParams);
			}
			index += this.pageSize;

			if (this.job.IsThresholdReached()) {
				this.thresholdReached = true;
				return index;
			}
		} while (list.length >= this.pageSize);

		return 0;
	} catch (ex) {
		nlapiLogExecution('ERROR', 'ReportSection.process', ex.toString());
		throw ex;
	}
};

TAF.IReportSection.prototype.processTxtFiles = 
	function _processTxtFiles(dao, callback) {
		if (!dao) {
			throw nlapiCreateError('MISSING_PARAMETER', 'dao is a required parameter');
		}

		if (!callback) {
			throw nlapiCreateError('MISSING_PARAMETER', 'callback is a required parameter');
		}
		
		if (typeof callback !== 'function') {
			throw nlapiCreateError('INVALID_PARAMETER', 'callback should be a function');
		}
		do{
			var fileIndex = this.state[this.Name].fileIndex;
			var rowFileIndex = this.state[this.Name].rowFileIndex;
			var prevIndex;
			
			list = dao.getList(rowFileIndex, rowFileIndex + this.ENTRIES_PER_PAGE, fileIndex);
			prevIndex = this.state[this.Name].index;
			
			// process the rows
			var iterator = new TAF.Lib.Iterator(list);			
		    while(iterator.hasNext()){
		    	var line = iterator.next();
		    	
		    	callback.call(this, line);
		    	
		    	this.state[this.Name].index++;
		        this.state[this.Name].adapterState = this.adapter.state;
		        
		        if (this.job.IsThresholdReached()) {
					this.thresholdReached = true;
					break;
				}
		    }
			
		    if(this.state[this.Name].fileIndex != dao.getCurrentIndex().file
		    		&& list.length == this.state[this.Name].index - prevIndex){
				this.state[this.Name].fileIndex = dao.getCurrentIndex().file;	
				this.state[this.Name].rowFileIndex = 0;
			}
			else{
				this.state[this.Name].rowFileIndex += this.state[this.Name].index - prevIndex;
			}
		    
		    if (this.job.IsThresholdReached()) {
	            break;
	        }
		}while (dao.hasMoreRows || dao.hasMoreFiles);
};

TAF.IReportSection.prototype.getAccountingBook = function _getAccountingBook() {
    var context = this.context || nlapiGetContext();
    if (!context.getFeature('MULTIBOOK')) {
        return;
    }
    
    if (!this.params || !this.params.subsidiary) {
        throw nlapiCreateError('MISSING_PARAMETER', 'subsidiary is a required parameter');
    }
    
    if (!this.params || !this.params.bookId) {
        throw nlapiCreateError('MISSING_PARAMETER', 'bookId is a required parameter');
    }

    try {
        var dao = new TAF.DAO.AccountingBookDao();
        dao.search({
            subsidiary: this.params.subsidiary,
            internalId: this.params.bookId
        });
        
        var list = dao.getList();

        return list.length > 0 ? list[0] : null;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'TAF.IReportSection.getAccountingBook', ex.toString());
        throw nlapiCreateError('ACCOUNTING_BOOK_SEARCH_ERROR', 'Error in retrieving accounting book');
    }
};

TAF.IReportSection.prototype.validateAccountingPeriods = function _validateAccountingPeriods(periodTo, fiscalCalendar) {
    if (!periodTo) {
        throw nlapiCreateError('MISSING_PARAMETER', 'periodTo is a required parameter');
    }
    if (!fiscalCalendar) {
        throw nlapiCreateError('MISSING_PARAMETER', 'fiscalCalendar is a required parameter');
    }

    var context = this.context || nlapiGetContext();
    var resource = this.resource || new ResourceMgr(this.params.job_params.CultureId);
    var validPeriods = new TAF.DAO.AccountingPeriodDao().getPostingPeriodsOnOrBeforePeriod(periodTo, fiscalCalendar, true);
    var coveredPeriods = new TAF.DAO.AccountingPeriodDao().getPostingPeriodsOnOrBeforePeriod(periodTo, null, true);
    var validPeriodIds = !validPeriods ? [] : validPeriods.map(function(period) {
        return period.id;
    });

    if (validPeriodIds.length > 0) {
        for (var i = 0; i < coveredPeriods.length; i++) {
            if (validPeriodIds.indexOf(coveredPeriods[i].id) == -1) {
                var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
                var baseUrl = context.getSetting('SCRIPT', 'custscript_4599_main_s_url');
                var baseUrlMatch = baseUrl ? baseUrl.match(re) : null;
                var helpUrl = (baseUrlMatch) ? baseUrlMatch[0].toString() + resource.GetString('ERR_UNASSIGNED_PERIODS_URL') : '';

                throw nlapiCreateError('Unassigned_Period', resource.GetString('ERR_UNASSIGNED_PERIODS', { 'usingFiscalCalendarHelpUrl': helpUrl }), true);
            }
        }
    }
};
