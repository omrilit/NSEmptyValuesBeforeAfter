/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.JobSchema = _exports.JobStatus = _exports.JobType = void 0;
  var JobType;
  _exports.JobType = JobType;

  (function (JobType) {
    JobType["MATCHING"] = "matching";
    JobType["UNMATCHING"] = "unmatching";
    JobType["RECALCULATION"] = "recalculation";
    JobType["REFERENCE_GROUP"] = "reference_group";
    JobType["REFERENCE_SINGLE"] = "reference_single";
    JobType["REFERENCE_UNMATCH"] = "reference_unmatch";
  })(JobType || (_exports.JobType = JobType = {}));

  var JobStatus;
  _exports.JobStatus = JobStatus;

  (function (JobStatus) {
    JobStatus["FAILED"] = "failed";
    JobStatus["PENDING"] = "pending";
    JobStatus["PROCESSING"] = "processing";
    JobStatus["SUCCEEDED"] = "succeeded";
  })(JobStatus || (_exports.JobStatus = JobStatus = {}));

  var JobSchema = {
    fields: {
      account: "custrecord_glm_job_account",
      created: "created",
      inputs: ["custrecord_glm_job_input", "custrecord_glm_job_input_1"],
      matchingDate: "custrecord_glm_job_matching_date",
      outputs: ["custrecord_glm_job_output", "custrecord_glm_job_output_1", "custrecord_glm_job_output_2", "custrecord_glm_job_output_3", "custrecord_glm_job_output_4"],
      status: "custrecord_glm_job_status",
      type: "custrecord_glm_job_type",
      user: "custrecord_glm_job_user",
      userRole: "custrecord_glm_job_user_role",
      stuck: "custrecord_glm_job_stuck"
    },
    type: "customrecord_glm_job"
  };
  _exports.JobSchema = JobSchema;
});