/**
 * Performance Testing Logger
 * 
 * Version  Date            Author          Remarks
 * 1.00     02/10/2014      pmiller         Initial version
 * 2.00     02/12/2014      pmiller         Corrected QA bundle ID
 */
Ext4.define('PSA.PTM.PerfTestLogger', {
    extend : 'Ext4.Component',
    allowedIds : new Array(46438, 46439),
    initComponent : function(args) {
        this.callParent(args);
        this.isProduction = Ext4.Array.indexOf(this.allowedIds, nsBundleId) == -1;
    },
    start : function(event, details) {
        if (this.isProduction) return;
        this.startTime = new Date().getTime();
        this.event = event;
        this.details = details;
        this.runTime = 0;
    },
    stop : function() {
        if (this.isProduction) return;
        this.runTime = new Date().getTime() - this.startTime;
        console.info('=====================================');
        console.info(this.event.toUpperCase() + ' : ' + this.runTime + 'ms');
        for ( var detail in this.details) {
            console.info('\t' + detail + ': ' + this.details[detail]);
        }
    }
});
var perfTestLogger = Ext4.create('PSA.PTM.PerfTestLogger');
perfTestLogger.start('First Load');
