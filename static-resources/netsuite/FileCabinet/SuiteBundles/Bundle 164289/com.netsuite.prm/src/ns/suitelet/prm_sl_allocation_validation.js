/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var psa_prm;
if (!psa_prm) psa_prm = {};

psa_prm.AllocValidationSl = new function AllocValidationSl() {
    
    this.init = function() {
        this.context = nlapiGetContext();
        this.lib = psa_prm.serverlibrary;
        this.approvalEnabled = this.context.getPreference('CUSTOMAPPROVALRSRCALLOC') == 'T';
        this.allocation = {
            id               : request.getParameter('id'),
            resource         : request.getParameter('resource'),
            project          : request.getParameter('project'),
            projectTask      : request.getParameter('projectTask'),
            startDate        : request.getParameter('startDate'),
            endDate          : request.getParameter('endDate'),

            frequency        : request.getParameter('frequency'),
            period           : request.getParameter('period'),
            dayOfWeek        : request.getParameter('dayOfWeek'),
            dayOfWeekMask    : request.getParameter('dayOfWeekMask'),
            dayOfWeekInMonth : request.getParameter('dayOfWeekInMonth'),
            seriesStartDate  : request.getParameter('seriesStartDate'),
            seriesEndDate    : request.getParameter('seriesEndDate')
        };
    };
    
    this.suiteletEntry = function(request, response){
        this.init();
        
        nlapiLogExecution('DEBUG', 'allocation', JSON.stringify(this.allocation));
        nlapiLogExecution('DEBUG', 'noUpdates', this.noUpdates);
        
        try {
            response.write(JSON.stringify({
                isValid : this.isValid()
            }));
        } catch(ex) {
            var errorCode    = ex.name || ex.getCode(),
                errorMessage = ex.message || ex.getDetails();

            nlapiLogExecution('ERROR', errorCode, errorMessage);
            
            response.write(JSON.stringify({
                isSaved : false,
                message : errorCode + ' : '  + errorMessage
            }));
        }
        
        nlapiLogExecution('DEBUG', 'remaining usage points', this.context.getRemainingUsage());
    };
    
    this.getAllocations = function() {
        var search = new this.lib.Search('resourceallocation', 'customsearch_prm_allocation_data');

        if (this.allocation.id) {
            search.addFilter(new nlobjSearchFilter('internalid', null, 'noneof', this.allocation.id));
        }
        
        search.addFilter(new nlobjSearchFilter('resource', null, 'anyof', this.allocation.resource));
        search.addFilter(new nlobjSearchFilter('project', null, 'anyof', this.allocation.project));
        if (this.allocation.projectTask) {
            search.addFilter(new nlobjSearchFilter('projecttask', null, 'anyof', this.allocation.projectTask));
        }
        
        return search.getAllResults();
    };
    
    this.isValid = function() {
        var s = Date.now();
        var allocations = this.getAllocations();
        
        if (this.hasOverlaps(allocations)) {
            return 'hasOverlaps';
        }
        
        if (this.hasNoWorkHours()) {
            return 'hasNoWorkHours';
        }
        
        nlapiLogExecution('DEBUG', 'runtime: ' + (Date.now() - s) + 'ms');
        
        return 'isValid';
    };
    
    this.hasOverlaps = function(allocations) {
        var dayMilli = 86400,
            recurrs  = [ this.allocation ];
        
        if (this.allocation.frequency && this.allocation.frequency != 'NONE') {
            this.createAllocationRecurrences(this.allocation, recurrs);
        }
        
        for (i in allocations) {
            if (this.hasOverlappingRecurrences(recurrs, allocations[i])) {
                return true;
            }
        }
        
        return false;
    };
    
    this.isOverlappingDateRanges = function(aStart, aEnd, bStart, bEnd) {
        return !((aStart <= bStart && aEnd <= bStart) || (aStart >= bEnd && aEnd >= bEnd));
    };
    
    this.hasOverlappingRecurrences = function(recurrs, allocation) {
        var allocObj = {
            startDate        : allocation.getValue('startDate'),
            endDate          : allocation.getValue('endDate'),
            frequency        : allocation.getValue('frequency'),
            period           : allocation.getValue('period'),
            dayOfWeek        : allocation.getValue('dow'),
            dayOfWeekMask    : allocation.getValue('dowmask'),
            dayOfWeekInMonth : allocation.getValue('dowim'),
            seriesStartDate  : allocation.getValue('seriesstartdate'),
            seriesEndDate    : allocation.getValue('endbydate')
        };
        
        var recurrences = [ allocObj ];
        
        this.createAllocationRecurrences(allocObj, recurrences);
        
        for (j in recurrs) {
            var aStart = new Date(recurrs[j].startDate).getTime(),
                aEnd   = new Date(recurrs[j].endDate).getTime() + 86400;
            
            for (i in recurrences) {
                var bStart = new Date(recurrences[i].startDate).getTime(),
                    bEnd   = new Date(recurrences[i].endDate).getTime() + 86400;
                
                if (this.isOverlappingDateRanges(aStart, aEnd, bStart, bEnd)) {
                    return true;
                }
            }
        }
        
        return false;
    };
    
    this.createAllocationRecurrences = function(alloc, recurrs) {
        var frequency        = alloc.frequency,
            period           = alloc.period,
            dayOfWeek        = alloc.dayOfWeek || '',
            dayOfWeekMask    = alloc.dayOfWeekMask || '',
            dayOfWeekInMonth = alloc.dayOfWeekInMonth || '',
            seriesStart      = new Date(alloc.seriesStartDate),
            seriesEnd        = new Date(alloc.seriesEndDate),
            allocStart       = new Date(alloc.startDate),
            allocEnd         = new Date(alloc.endDate),
            allocDuration    = (allocEnd - allocStart) / 86400000,
            idIterator       = 0;
        
        switch (alloc.frequency) {
            case 'DAY':
                var baseAllocStart = seriesStart.getTime() > allocStart.getTime() ? seriesStart : allocStart;
                if (seriesStart.getTime() == allocStart.getTime()) {
                    baseAllocStart = nlapiAddDays(baseAllocStart, period);
                } 
                while (baseAllocStart.getTime() <= seriesEnd.getTime()) {
                    if (baseAllocStart.getTime() == allocStart.getTime()) {
                        baseAllocStart = nlapiAddDays(baseAllocStart, 1 * period);
                        continue;
                    }
                    var trueEndDate = nlapiAddDays(baseAllocStart, allocDuration);
                    var r = this.createRecurrenceObject(alloc, baseAllocStart, trueEndDate);
                    recurrs.push(r);
                    baseAllocStart = nlapiAddDays(baseAllocStart, period);
                }
                break;
            case 'WEEK':
                var baseAllocStart = seriesStart.getTime() > allocStart.getTime() ? seriesStart : allocStart,
                    currWeekSun    = nlapiAddDays(baseAllocStart, -(1 * baseAllocStart.getDay())),
                    seriesEndSun   = nlapiAddDays(seriesEnd, -(seriesEnd.getDay())),
                    recurrFlags    = dayOfWeekMask.split('');
                
                do {
                    for (day in recurrFlags) {
                        var dayOfWeek = nlapiAddDays(currWeekSun, day);
                        
                        if (dayOfWeek.getTime() < baseAllocStart.getTime()) continue;
                        if (dayOfWeek.getTime() == allocStart.getTime()) continue;
                        if (dayOfWeek.getTime() > seriesEnd.getTime()) break;
                        
                        if (recurrFlags[day] == 'T') {
                            var trueEndDate = nlapiAddDays(dayOfWeek, allocDuration);
                            var r = this.createRecurrenceObject(alloc, dayOfWeek, trueEndDate);
                            recurrs.push(r);
                        }
                    }
                    currWeekSun = nlapiAddDays(currWeekSun, 7 * period);
                    
                } while (currWeekSun.getTime() <= seriesEndSun.getTime());
                break;
            case 'MONTH':
                var baseAllocStart = seriesStart.getTime() > allocStart.getTime() ? seriesStart : allocStart,
                    currMonth      = baseAllocStart == allocStart ? nlapiAddMonths(baseAllocStart, period) : baseAllocStart,
                    startDay       = baseAllocStart.getDate();
                
                if (dayOfWeekInMonth == -1) {
                    dayOfWeekInMonth = 5;
                }
                
                while (currMonth.getTime() <= seriesEnd.getTime()) {
                    if (dayOfWeek && dayOfWeekInMonth) {
                        var firstDayOfMonth = new Date(currMonth.getFullYear(), currMonth.getMonth(), 1),
                            firstDay        = (7 - (firstDayOfMonth.getDay() - (dayOfWeek - 1))) % 7 + 1;
                        
                        startDay = firstDay + (dayOfWeekInMonth - 1) * 7;
                        if (startDay > nlapiAddDays(nlapiAddMonths(firstDayOfMonth, 1), -1).getDate()) { // adjustment for "last" (can be either 4th or 5th)
                            startDay -= 7;
                        }
                    }
                    
                    var startDate   = new Date([currMonth.getMonth() + 1, startDay, currMonth.getFullYear()].join('/')),
                        endDate     = nlapiAddDays(startDate, allocDuration),
                        recurrAlloc = this.createRecurrenceObject(alloc, startDate, endDate);
                    
                    recurrs.push(recurrAlloc);
                    
                    currMonth = nlapiAddMonths(currMonth, period);
                }
                break;
            case 'YEAR':
                var baseAllocStart = new Date(seriesStart.getTime() > allocStart.getTime() ? seriesStart : allocStart);
                if (dayOfWeek != '' && dayOfWeekInMonth != '') {
                    var month = seriesStart.getMonth(),
                        currentMonth = baseAllocStart.getMonth(),
                        nthDayMap = [];
                    baseAllocStart.setDate(1);
                    while (baseAllocStart.getTime() <= seriesEnd.getTime()) {
                        if (month == baseAllocStart.getMonth() && dayOfWeek == baseAllocStart.getDay() + 1) {
                            var nthDayArray = nthDayMap[baseAllocStart.getFullYear()] || [];
                            nthDayArray.push(baseAllocStart);
                            nthDayMap[baseAllocStart.getFullYear()] = nthDayArray;
                        }
                        if (currentMonth != baseAllocStart.getMonth()) {
                            baseAllocStart = nlapiAddDays(baseAllocStart, -period);
                            baseAllocStart.setDate(1);
                            baseAllocStart = this.lib.addYearToDate(baseAllocStart, period);
                            currentMonth = baseAllocStart.getMonth();
                        } else {
                            baseAllocStart = nlapiAddDays(baseAllocStart, period);
                        }
                    }
                    var r = {};
                    for (var yearKey in nthDayMap) {
                        var yearMap = nthDayMap[yearKey];
                        var dowim = dayOfWeekInMonth;
                        if (dayOfWeekInMonth == 5 || dayOfWeekInMonth == -1) {
                            dowim = yearMap.length;
                        }
                        var recurrenceStartDate = yearMap[dowim - 1];
                        if (recurrenceStartDate.getTime() > allocStart.getTime()) {
                            var trueEndDate = nlapiAddDays(recurrenceStartDate, allocDuration);
                            r = this.createRecurrenceObject(alloc, recurrenceStartDate, trueEndDate);
                            recurrs.push(r);
                        }
                    }
                } else {
                    while (baseAllocStart.getTime() <= seriesEnd.getTime()) {
                        if (baseAllocStart.getTime() == allocStart.getTime()) {
                            baseAllocStart = nlapiAddDays(baseAllocStart, period);
                            continue;
                        }
                        var trueEndDate = nlapiAddDays(baseAllocStart, allocDuration);
                        var r = {};
                        if (baseAllocStart.getMonth() == seriesStart.getMonth() && baseAllocStart.getDate() == seriesStart.getDate()) {
                            r = this.createRecurrenceObject(alloc, baseAllocStart, trueEndDate);
                            recurrs.push(r);
                        }
                        baseAllocStart = nlapiAddDays(baseAllocStart, period);
                    }
                }
                break;
            default:
                nlapiLogExecution('DEBUG', 'Invalid frequency: ' + frequency);
                break;
        }
    };
    
    this.createRecurrenceObject = function(alloc, startDate, endDate) {
        var clone = JSON.parse(JSON.stringify(alloc))
        
        clone.startDate = nlapiDateToString(startDate);
        clone.endDate = nlapiDateToString(endDate);
       
        return clone;
    };
    
    this.getWorkCalendarId = function() {
        return this.lib.getResourceWorkCalendarId(this.allocation.resource);
    };
    
    this.getWorkCalendar = function() {
        return this.lib.getWorkCalendars(new nlobjSearchFilter('internalid', null, 'is', this.getWorkCalendarId()))[this.getWorkCalendarId()];
    };
    
    this.getWorkHours = function() {
        return this.lib.getWorkHoursInDateRange(this.getWorkCalendar(), new Date(this.allocation.startDate), new Date(this.allocation.endDate));
    };
    
    this.hasNoWorkHours = function() {
        return this.getWorkHours() == 0;
    };
};