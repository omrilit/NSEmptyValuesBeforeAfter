/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

Ext4.define('PRM.Util.PerfLogs', {
    singleton : true,
    isProduction : true,
    eventMap : {},
    reportMap : {},

    start : function(event) {
        var time = Date.now();

        if (this.isProduction) {
            return;
        }

        if (!this.eventMap.hasOwnProperty(event)) {
            this.eventMap[event] = {};
        }

        this.eventMap[event].start = time;
    },

    stop : function(event) {
        var time = Date.now();

        if (this.isProduction) {
            return;
        }

        if (this.eventMap.hasOwnProperty(event)) {
            var eventObj = this.eventMap[event];

            eventObj.end = time;
            eventObj.duration = ((eventObj.end - eventObj.start) / 1000).toFixed(2);

            console.log('[' + event + '] ' + eventObj.duration + ' seconds.');

            if (!this.reportMap.hasOwnProperty(event)) {
                this.reportMap[event] = [];
            }

            this.reportMap[event].push({
                start : eventObj.start,
                end : eventObj.end,
                duration : eventObj.duration
            });
            
            delete this.eventMap[event];
        }
    }

});