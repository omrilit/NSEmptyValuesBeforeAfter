/**
 * Copyright © 2016, 2017, Oracle and/or its affiliates. All rights reserved.
 */
define([
    '../const/fam_const_customlist'
], function (constList) {
    var module = {};
    
    module.countMonths = function (start, end) {
        var additional = 0;            
        
        // To prevent negative value
        if (end.getTime() < start.getTime()){
            return 0;
        }
        if (end.getDate() > start.getDate() - 1) {
            additional = 1; 
        }
        return 12 * (end.getFullYear() - start.getFullYear()) + 
                end.getMonth() - start.getMonth() + additional;
    };
    
    /**
     * Computes end date based on start date and lifetime
     * @param {Date} start - start date
     * @param {number} life - lifetime of the record
     * @param {number} period - depreciation period to use
     * @returns {Date}
    */
    module.computeEndDate = function (start, life, period) {
        var ret;
        
        if (life <= 0) { return start; }
        
        if (period == constList.DeprPeriod.Annually) {
            ret = new Date(start.getFullYear() + life, start.getMonth(), start.getDate() - 1);
        }
        else {
            ret = new Date(start.getFullYear(), start.getMonth() + life, start.getDate() - 1);
        }
        
        return ret;
    };
    
    module.Timer = function (start) {
        if (start)
            this.start();
    };
    
    module.Timer.prototype.startTime = 0;
    
    module.Timer.prototype.start = function () {
        this.startTime = new Date().getTime();
    };
    
    module.Timer.prototype.getElapsedTime = function () {
        return new Date().getTime() - this.startTime;
    };
    
    return module;
});
