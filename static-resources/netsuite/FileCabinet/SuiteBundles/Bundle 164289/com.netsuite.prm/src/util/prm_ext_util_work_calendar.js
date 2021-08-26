/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/*
 * Utility class for all computations related to the work calendar.
 */
Ext4.define('PRM.Util.WorkCalendar', {
    singleton : true,
    dayInMilliseconds : 86400000,
    days : [
        'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
    ],
    /*
     * Returns true if the specified date is a working day
     */
    isWorkDay : function(workCalendar, date) {
        if (workCalendar[this.days[date.getDay()]]) {
            var dateInMillis = date.getTime();
            for (var i = 0; i < workCalendar.nonWork.length; i++) {
                var nonWork = workCalendar.nonWork[i];
                if (dateInMillis == Ext4.Date.clearTime(new Date(nonWork.exceptiondate)).getTime()) return false;
            }
            return true;
        }
        return false;
    },
    /*
     * Looks for the immediate work day before a specified date.
     * Returns the date itself if it is already a work day.
     */
    getLatestWorkDayBefore : function(workCalendar, date) {
        if (!this.isWorkDay(workCalendar, date)) {
            return this.getLatestWorkDayBefore(workCalendar, new Date(date.getTime() - this.dayInMilliseconds));
        }
        return date;
    },
    /*
     * Looks for the immediate work day after a specified date.
     * Returns the date itself if it is already a work day.
     */
    getEarliestWorkDayAfter : function(workCalendar, date) {
        if (!this.isWorkDay(workCalendar, date)) {
            return this.getEarliestWorkDayAfter(workCalendar, new Date(date.getTime() + this.dayInMilliseconds));
        }
        return date;
    },
    /*
     * Returns the total number of working days for a given duration.
     */
    getWorkDays: function(workCalendar, startDate, endDate){
        // Computation here is inclusive of the end dates
        
        // Compute total days, total work weeks, and remaining days after the last work week
        var totalDays  = (Ext4.Date.getElapsed(startDate, endDate) / this.dayInMilliseconds) + 1;
        var workWeeks  = Math.floor(totalDays / 7);
        var remainDays = totalDays % 7;
        // Compute total working days for the full weeks
        var workDays = [];
        if(workCalendar.sunday)    workDays.push(0);
        if(workCalendar.monday)    workDays.push(1);
        if(workCalendar.tuesday)   workDays.push(2);
        if(workCalendar.wednesday) workDays.push(3);
        if(workCalendar.thursday)  workDays.push(4);
        if(workCalendar.friday)    workDays.push(5);
        if(workCalendar.saturday)  workDays.push(6);
        
        var weekWorkDays = workWeeks * workDays.length;
        // Compute total working days for remaining days after last full week
        var remainWorkDays    = 0;
        var startDateIndex    = Number(Ext4.Date.format(startDate, 'w'))

        for(var i = 0, j = startDateIndex; i < remainDays; i++ , j = ++j % 7) {
            if(workDays.indexOf(j) != -1) remainWorkDays++;
        }
        // Count excepted days, check each exception date if between (inclusive) of start and end dates
        var exceptions    = workCalendar.nonWork;
        var exceptDays    = 0;
        if (exceptions) {
            for(var i = 0; i < exceptions.length; i++) {
                var exception     = exceptions[i];
                if (exception.exceptiondate){
                    var date = new Date(exception.exceptiondate);
                    date = Ext4.Date.clearTime(date);
                    if(Ext4.Date.between(date, startDate, endDate)) exceptDays++;
                }                
            }
        }
        // Compute total work days within range, then distribute hours to derive percentage
        var totalWorkDays = weekWorkDays + remainWorkDays - exceptDays;
        
        return totalWorkDays;
    },
    /*
     * Returns the new hours allocated if an allocation is stretched / shortened, while maintaining the allocated percentage.
     */
    getAdjustedAllocation : function(workCalendar, allocation, startDate, endDate, newStartDate, newEndDate) {
        return (allocation / this.getWorkDays(workCalendar, new Date(startDate), new Date(endDate))) * this.getWorkDays(workCalendar, new Date(newStartDate), new Date(newEndDate));
    },
    getActualWorkDetails : function(workCalendar, timeBills) {
        var details = {
            actualHours : 0,
            nextWorkDay : null
        };
        var latestActualWork = 0;
        for (var i = 0; i < timeBills.length; i++) {
            var timeBill     = timeBills[i],
                duration     = timeBill.duration.split(':'),
                durationHour = Number(duration[0]),
                durationMins = Number(duration[1]) / 60,
                date         = new Date(timeBill.date).getTime();
            if (date > latestActualWork) latestActualWork = date;
            details.actualHours += (durationHour + durationMins);
        }
        details.nextWorkDay = this.getEarliestWorkDayAfter(workCalendar, new Date(latestActualWork + this.dayInMilliseconds));
        return details;
    }
});
