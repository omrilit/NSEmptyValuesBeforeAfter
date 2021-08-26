/**
 * Copyright 2017 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

define(['./dao/taf_job'], function(JobDAO) {
    function TAFJobManager() {
        this.name = 'TAFJobManager';
        this.dao = new JobDAO();
    }
    
    TAFJobManager.prototype = {
        addJob: function addJob(params) {
            var job = this.convertToJob(params);
            return this.dao.create(job);
        },
        updateJob: function update(params) {
            var job = this.convertToJob(params);
            return this.dao.update(job);
        },
        getJob: function get(id) {
            var list = this.dao.getList({ internalId: id });
            return list && list.length > 0 ? list[0] : null;
        },
        convertToJob: function(params) {
            var job = {};

            if (params.data) {
                job.data = JSON.stringify(params.data);
            }
            if (params.status) {
                job.status = params.status;
            }

            return job;
        }
    };
    
    return TAFJobManager;
});
