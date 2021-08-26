/**
 * @copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports", "../../vendor/tslib", "../common/expectations", "../common/fn", "./expectations", "./types"], function (_exports, _tslib, _expectations, _fn, _expectations2, _types) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.JobRepository = void 0;

  function sliceAsString(value, size) {
    return value.length > size ? (0, _tslib.__spreadArrays)([value.substring(0, size)], sliceAsString(value.substring(size), size)) : [value];
  }

  function setMultipleFields(record, fields, data) {
    if (data) {
      var result_1 = sliceAsString(data, 99900);
      fields.forEach(function (fieldId, index) {
        record.setValue({
          fieldId: fieldId,
          value: (0, _fn.stringOrDefault)(result_1[index])
        });
      });
    }
  }

  function isChecked(value) {
    return value === true || value === "T";
  }

  var JobRepository =
  /** @class */
  function () {
    function JobRepository(record, runtime, runQuery, inProgressLimit) {
      this.record = record;
      this.runtime = runtime;
      this.runQuery = runQuery;
      this.inProgressLimit = inProgressLimit;
    }

    JobRepository.prototype.fixStuckJobs = function () {
      var _this = this;

      var results = this.runQuery("\n            SELECT\n            id id,\n            " + _types.JobSchema.fields.status + " status,\n            " + _types.JobSchema.fields.stuck + " stuckagain\n            FROM " + _types.JobSchema.type + "\n            WHERE " + _types.JobSchema.fields.status + " = '" + _types.JobStatus.PROCESSING + "'\n            AND (SYS_EXTRACT_UTC(SYSTIMESTAMP) - (" + this.inProgressLimit() + "/60)/24) > SYS_EXTRACT_UTC(lastmodified)\n        ");
      results.forEach(function (o) {
        var id = (0, _expectations.expectInternalId)(o[0]);
        isChecked(o[2]) ? _this.finishWithFailure(id, "Stuck inProgress") : _this.setPending(id, true);
      });
    };

    JobRepository.prototype.create = function (job) {
      var record = this.record.create({
        type: _types.JobSchema.type
      });
      record.setValue({
        fieldId: _types.JobSchema.fields.type,
        value: job.type
      });
      record.setValue({
        fieldId: _types.JobSchema.fields.status,
        value: job.status
      });
      setMultipleFields(record, _types.JobSchema.fields.inputs, job.input);

      if (job.account) {
        record.setValue({
          fieldId: _types.JobSchema.fields.account,
          value: job.account
        });
      }

      if (!(0, _fn.isInternalEntity)(job.user)) {
        record.setValue({
          fieldId: _types.JobSchema.fields.user,
          value: job.user
        });
      }

      setMultipleFields(record, _types.JobSchema.fields.outputs, job.output);

      if (job.matchingDate) {
        record.setValue({
          fieldId: _types.JobSchema.fields.matchingDate,
          value: job.matchingDate
        });
      }

      record.setValue({
        fieldId: _types.JobSchema.fields.userRole,
        value: this.runtime.getCurrentUser().role
      });
      return this.load(String(record.save()));
    };

    JobRepository.prototype.setProcessing = function (jobId) {
      var _a;

      this.record.submitFields({
        id: jobId,
        type: _types.JobSchema.type,
        values: (_a = {}, _a[_types.JobSchema.fields.status] = _types.JobStatus.PROCESSING, _a)
      });
    };

    JobRepository.prototype.setPending = function (jobId, isStuck) {
      var _a;

      if (isStuck === void 0) {
        isStuck = false;
      }

      this.record.submitFields({
        id: jobId,
        type: _types.JobSchema.type,
        values: (_a = {}, _a[_types.JobSchema.fields.status] = _types.JobStatus.PENDING, _a[_types.JobSchema.fields.stuck] = isStuck, _a)
      });
    };

    JobRepository.prototype.finishWithSuccess = function (jobId, history) {
      var record = this.record.load({
        id: jobId,
        type: _types.JobSchema.type
      });
      setMultipleFields(record, _types.JobSchema.fields.outputs, JSON.stringify(history));
      record.setValue({
        fieldId: _types.JobSchema.fields.status,
        value: _types.JobStatus.SUCCEEDED
      });
      record.save();
    };

    JobRepository.prototype.finishWithFailure = function (jobId, errors) {
      var record = this.record.load({
        id: jobId,
        type: _types.JobSchema.type
      });
      setMultipleFields(record, _types.JobSchema.fields.outputs, errors);
      record.setValue({
        fieldId: _types.JobSchema.fields.status,
        value: _types.JobStatus.FAILED
      });
      record.save();
    };

    JobRepository.prototype.load = function (id) {
      var record = this.record.load({
        id: id,
        type: _types.JobSchema.type
      });

      var getValue = function getValue(fieldId) {
        return record.getValue({
          fieldId: fieldId
        });
      };

      return {
        account: (0, _expectations.expectOptionalInternalId)(getValue(_types.JobSchema.fields.account)),
        id: id,
        input: _types.JobSchema.fields.inputs.map(getValue).join(""),
        matchingDate: (0, _fn.parseDate)(String(getValue(_types.JobSchema.fields.matchingDate))),
        output: (0, _fn.stringOrDefault)(_types.JobSchema.fields.outputs.map(getValue).join("")),
        status: (0, _expectations2.expectJobStatus)(getValue(_types.JobSchema.fields.status)),
        type: (0, _expectations2.expectJobType)(getValue(_types.JobSchema.fields.type)),
        user: (0, _expectations.expectOptionalInternalId)(getValue(_types.JobSchema.fields.user)) || "-5"
      };
    };

    JobRepository.prototype.findUpcomingJob = function () {
      var results = this.runQuery("\n            SELECT MIN(id), COUNT(*)\n            FROM " + _types.JobSchema.type + "\n            WHERE " + _types.JobSchema.fields.status + " = '" + _types.JobStatus.PENDING + "'\n        ");
      return results.length === 0 || results[0][1] === 0 ? [] : [this.load((0, _expectations.expectInternalId)(results[0][0]))];
    };

    return JobRepository;
  }();

  _exports.JobRepository = JobRepository;
});