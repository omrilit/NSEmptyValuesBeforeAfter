//<%
/**
 * jsUnity Universal JavaScript Testing Framework v0.6
 * http://jsunity.com/
 *
 * Copyright (c) 2009 Ates Goral
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

var NL_sstestf;
if (!NL_sstestf) {
    NL_sstestf = {};
}

//%>

/**
 * A wrapper for NetSuite platform exceptions triggered by code under test
 *
 * Brought about by Issue 212021, where the platform throws an error on an
 * attempt to add properties to an nlobjError. This object will serve as a
 * container of additional properties to provide context to the platform
 * exception
 */
NL_sstestf.WrappedNSException = function WrappedNSException(name, cause) {
    this.name = name;
    this.cause = cause;
};

/**
 *
 * @returns {Object|null} normally the platform nlobjError wrapped
 */
NL_sstestf.WrappedNSException.prototype.getCause = function getCause() {
    return this.cause;
};

NL_sstestf.ConfigurableJsUnity = function ConfigurableJsUnity() {};
NL_sstestf.ConfigurableJsUnity.prototype.toString = function () {
    return 'ConfigurableJsUnity';
};
NL_sstestf.ConfigurableJsUnity.prototype.setConfiguration = function (v) {
    this.configuration = v;
};

NL_sstestf.AssertionFailureException =
        function AssertionFailureException(message, idSuffix)
        {
            this.name = 'Error' + idSuffix;
            this.message = message;
        };
NL_sstestf.AssertionFailureException.prototype.toString =
        function ()
        {
            return this.message;
        };

NL_sstestf.ConfigurableJsUnity.prototype.build = function () {
    return (function (customization) {
        function fmt(str) {
            var a = Array.prototype.slice.call(arguments, 1);
            return str.replace(/\?/g, function () { return a.shift(); });
        }

        function hash(v) {
            if (v instanceof Object) {
                var arr = [];

                for (var p in v) {
                    arr.push(p);
                    arr.push(hash(v[p]));
                }

                return arr.join("#");
            } else {
                return String(v);
            }
        }

        var defaultAssertions = {
            assertException: function (fn, message) {
                try {
                    fn instanceof Function && fn();
                } catch (e) {
                    return;
                }
                throw new NL_sstestf.AssertionFailureException(
                        fmt("?: (?) does not raise an exception or not a function",
                                message || "assertException", fn),
                        '_assertException');
            },

            assertTrue: function (actual, message) {
                if (!actual) {
                    throw new NL_sstestf.AssertionFailureException(
                            fmt("?: (?) does not evaluate to true",
                                    message || "assertTrue", actual),
                            '_assertTrue');
                }
            },

            assertFalse: function (actual, message) {
                if (actual) {
                    throw new NL_sstestf.AssertionFailureException(
                            fmt("?: (?) does not evaluate to false",
                                    message || "assertFalse", actual),
                            '_assertFalse');
                }
            },

            assertIdentical: function (expected, actual, message) {
                if (expected !== actual) {
                    var assertEx = new Error(
                            fmt("?: (?) is not identical to (?)",
                                    message || "assertIdentical", actual, expected));
                    assertEx.name += '_assertIdentical';
                    throw assertEx;

                }
            },

            assertNotIdentical: function (expected, actual, message) {
                if (expected === actual) {
                    var assertEx = new Error(
                            fmt("?: (?) is identical to (?)",
                                    message || "assertNotIdentical", actual, expected));
                    assertEx.name += '_assertNotIdentical';
                    throw assertEx;
                }
            },

            assertEqual: function (expected, actual, message) {
                if (hash(expected) != hash(actual)) {
                    var assertEx = new Error(
                            fmt("?: (?) is not equal to (?)",
                                    message || "assertEqual", actual, expected));
                    assertEx.name += '_assertEqual';
                    throw assertEx;
                }
            },

            assertNotEqual: function (expected, actual, message) {
                if (hash(expected) == hash(actual)) {
                    var assertEx = new Error(
                            fmt("?: (?) is equal to (?)",
                                    message || "assertNotEqual", actual, expected));
                    assertEx.name += '_assertNotEqual';
                    throw assertEx;
                }
            },

            assertMatch: function (re, actual, message) {
                if (!re.test(actual)) {
                    var assertEx = new Error(
                            fmt("?: (?) does not match (?)",
                                    message || "assertMatch", actual, re));
                    assertEx.name += '_assertMatch';
                    throw assertEx;
                }
            },

            assertNotMatch: function (re, actual, message) {
                if (re.test(actual)) {
                    var assertEx = new Error(
                            fmt("?: (?) matches (?)",
                                    message || "assertNotMatch", actual, re));
                    assertEx.name += '_assertNotMatch';
                    throw assertEx;
                }
            },

            assertTypeOf: function (typ, actual, message) {
                if (typeof actual !== typ) {
                    var assertEx = new Error(
                            fmt("?: (?) is not of type (?)",
                                    message || "assertTypeOf", actual, typ));
                    assertEx.name += '_assertTypeOf';
                    throw assertEx;
                }
            },

            assertNotTypeOf: function (typ, actual, message) {
                if (typeof actual === typ) {
                    var assertEx = new Error(
                            fmt("?: (?) is of type (?)",
                                    message || "assertNotTypeOf", actual, typ));
                    assertEx.name += '_assertNotTypeOf';
                    throw assertEx;
                }
            },

            assertInstanceOf: function (cls, actual, message) {
                if (!(actual instanceof cls)) {
                    var assertEx = new Error(
                            fmt("?: (?) is not an instance of (?)",
                                    message || "assertInstanceOf", actual, cls));
                    assertEx.name += '_assertInstanceOf';
                    throw assertEx;
                }
            },

            assertNotInstanceOf: function (cls, actual, message) {
                if (actual instanceof cls) {
                    var assertEx = new Error(
                            fmt("?: (?) is an instance of (?)",
                                    message || "assertNotInstanceOf", actual, cls));
                    assertEx.name += '_assertNotInstanceOf';
                    throw assertEx;
                }
            },

            assertNull: function (actual, message) {
                if (actual !== null) {
                    var assertEx = new Error(
                            fmt("?: (?) is not null",
                                    message || "assertNull", actual));
                    assertEx.name += '_assertNull';
                    throw assertEx;
                }
            },

            assertNotNull: function (actual, message) {
                if (actual === null) {
                    var assertEx = new Error(
                            fmt("?: (?) is null",
                                    message || "assertNotNull", actual));
                    assertEx.name += '_assertNotNull';
                    throw assertEx;
                }
            },

            assertUndefined: function (actual, message) {
                if (actual !== undefined) {
                    var assertEx = new Error(
                            fmt("?: (?) is not undefined",
                                    message || "assertUndefined", actual));
                    assertEx.name += '_assertUndefined';
                    throw assertEx;
                }
            },

            assertNotUndefined: function (actual, message) {
                if (actual === undefined) {
                    var assertEx = new Error(
                            fmt("?: (?) is undefined",
                                    message || "assertNotUndefined", actual));
                    assertEx.name += '_assertNotUndefined';
                    throw assertEx;
                }
            },

            assertNaN: function (actual, message) {
                if (!isNaN(actual)) {
                    var assertEx = new Error(
                            fmt("?: (?) is not NaN",
                                    message || "assertNaN", actual));
                    assertEx.name += '_assertNaN';
                    throw assertEx;
                }
            },

            assertNotNaN: function (actual, message) {
                if (isNaN(actual)) {
                    var assertEx = new Error(
                            fmt("?: (?) is NaN",
                                    message || "assertNotNaN", actual));
                    assertEx.name += '_assertNotNaN';
                    throw assertEx;
                }
            },

            fail: function (message) {
                var assertEx = new Error(
                        message || "fail");
                assertEx.name += '_fail';
                throw assertEx;
            }
        };

        function plural(cnt, unit) {
            return cnt + " " + unit + (cnt == 1 ? "" : "s");
        }

        function splitFunction(fn) {
            var tokens =
                    /^[\s\r\n]*function[\s\r\n]*([^\(\s\r\n]*?)[\s\r\n]*\([^\)\s\r\n]*\)[\s\r\n]*\{((?:[^}]*\}?)+)\}[\s\r\n]*$/
                            .exec(fn);

            if (!tokens) {
                throw "Invalid function.";
            }

            return {
                name: tokens[1].length ? tokens[1] : undefined,
                body: tokens[2]
            };
        }

        var probeOutside = function () {
            try {
                return eval(
                        [ "typeof ", " === \"function\" && ", "" ].join(arguments[0]));
            } catch (e) {
                return false;
            }
        };

        function parseSuiteString(str) {
            var obj = {};

            var probeInside = new Function(
                    splitFunction(probeOutside).body + str);

            var tokenRe = /(\w+)/g; // todo: wiser regex
            var tokens;

            while ((tokens = tokenRe.exec(str))) {
                var token = tokens[1];
                var fn;

                if (!obj[token]
                        && (fn = probeInside(token))
                        && fn != probeOutside(token)) {

                    obj[token] = fn;
                }
            }

            return parseSuiteObject(obj);
        }

        function parseSuiteFunction(fn) {
            var fnParts = splitFunction(fn);
            var suite = parseSuiteString(fnParts.body);

            suite.suiteName = fnParts.name;

            return suite;
        }

        function parseSuiteArray(tests) {
            var obj = {};

            for (var i = 0; i < tests.length; i++) {
                var item = tests[i];

                if (!obj[item]) {
                    switch (typeof item) {
                        case "function":
                            var fnParts = splitFunction(item);
                            obj[fnParts.name] = item;
                            break;
                        case "string":
                            var fn;

                            if (fn = probeOutside(item)) {
                                obj[item] = fn;
                            }
                    }
                }
            }

            return parseSuiteObject(obj);
        }

        function parseSuiteObject(obj) {
            var suite = new jsUnity.TestSuite(obj.suiteName, obj);

            for (var name in obj) {
                if (obj.hasOwnProperty(name)) {
                    var fn = obj[name];

                    if (typeof fn === "function") {
                        if (/^test/.test(name)) {
                            suite.tests.push({ name: name, fn: fn });
                        } else if (/^setUp$|^tearDown$/.test(name)) {
                            suite[name] = fn;
                        } else {
                            if (customization && (customization.includeFunctionsRegExes || []).some(
                                    function (re) {
                                        return re.test(name);
                                    }))
                            {
                                suite[name] = fn;
                            }
                        }
                    } else {
                        if (customization && (customization.includeFieldsRegExes || []).some(
                                function (re) {
                                    return re.test(name);
                                }))
                        {
                            suite[name] = obj[name];
                        }
                    }
                }
            }

            return suite;
        }

        return {
            TestSuite: function (suiteName, scope) {
                this.suiteName = suiteName;
                this.scope = scope;
                this.tests = [];
                this.setUp = undefined;
                this.tearDown = undefined;
            },

            TestResults: function () {
                this.suiteName = undefined;
                this.total = 0;
                this.passed = 0;
                this.failed = 0;
                this.duration = 0;
            },

            assertions: defaultAssertions,

            env: {
                defaultScope: this,

                getDate: function () {
                    return new Date();
                }
            },

            attachAssertions: function (scope) {
                scope = scope || this.env.defaultScope;

                for (var fn in jsUnity.assertions) {
                    scope[fn] = jsUnity.assertions[fn];
                }
            },

            log: function (msgBody, testsuite, testcase) {},

            error: function (msgBody, testsuite, testcase) {
                this.log("[ERROR] " + msgBody, testsuite, testcase);
            },

            compile: function (v) {
                if (v instanceof jsUnity.TestSuite) {
                    return v;
                } else if (v instanceof Function) {
                    return parseSuiteFunction(v);
                } else if (v instanceof Array) {
                    return parseSuiteArray(v);
                } else if (v instanceof Object) {
                    return parseSuiteObject(v);
                } else if (typeof v === "string") {
                    return parseSuiteString(v);
                } else {
                    throw "Argument must be a function, array, object, string or "
                            + "TestSuite instance.";
                }
            },

            run: function () {
                var suiteRunner;
                if (customization && customization.customSuiteRunner) {
                    suiteRunner = customization.customSuiteRunner;
                    suiteRunner.initJsUnityInstance(this);
                } else {
                    suiteRunner = this.getStockJsUnitySuiteRunner();
                }

                return suiteRunner.run.apply(
                        suiteRunner, Array.prototype.slice.call(arguments));
            },

            StockJsUnitySuiteRunner: function (jsUnityInstance) {
                this.initJsUnityInstance = function () {};
                this.run = function () {
                    var results = new jsUnityInstance.TestResults();

                    var suiteNames = [];
                    var start = jsUnityInstance.env.getDate();

                    for (var i = 0; i < arguments.length; i++) {
                        try {
                            var suite = jsUnityInstance.compile(arguments[i]);
                        } catch (e) {
                            this.error("Invalid test suite: " + e);
                            return false;
                        }

                        var cnt = suite.tests.length;

                        jsUnityInstance.log("Running "
                                + (suite.suiteName || "unnamed test suite"));
                        jsUnityInstance.log(plural(cnt, "test") + " found");

                        suiteNames.push(suite.suiteName);
                        results.total += cnt;

                        for (var j = 0; j < cnt; j++) {
                            var test = suite.tests[j];

                            try {
                                suite.setUp && suite.setUp();
                                test.fn.call(suite.scope);
                                suite.tearDown && suite.tearDown();

                                results.passed++;

                                jsUnityInstance.log("[PASSED] " + test.name);
                            } catch (e) {
                                suite.tearDown && suite.tearDown();

                                jsUnityInstance.log("[FAILED] " + test.name + ": " + e);
                            }
                        }
                    }

                    results.suiteName = suiteNames.join(",");
                    results.failed = results.total - results.passed;
                    results.duration = jsUnityInstance.env.getDate() - start;

                    jsUnityInstance.log(plural(results.passed, "test") + " passed");
                    jsUnityInstance.log(plural(results.failed, "test") + " failed");
                    jsUnityInstance.log(plural(results.duration, "millisecond") + " elapsed");

                    return results;
                };
            },

            getStockJsUnitySuiteRunner: function getStockJsUnitySuiteRunner() {
                return new this.StockJsUnitySuiteRunner(this);
            }

        };
    })(this.configuration);
};

NL_sstestf.JsUnityBuilder = function JsUnityBuilder() {};
NL_sstestf.JsUnityBuilder.prototype.getPlainJsUnityV0_6 = function getPlainJsUnityV0_6() {
    return this.createConfigurableJsUnity().build();
};

NL_sstestf.JsUnityBuilder.prototype.createConfigurableJsUnity =
        function createConfigurableJsUnity()
        {
            this.configurableJsUnity = new NL_sstestf.ConfigurableJsUnity();
            return this.configurableJsUnity;
        };

NL_sstestf.JsUnityBuilder.prototype.addAllowedFunctionNameRegExes =
        function (v)
        {
            this.allowedFunctionNameRegExes = v;
            return this;
        };

NL_sstestf.JsUnityBuilder.prototype.addAllowedFieldNameRegExes =
        function (v)
        {
            this.allowedFieldNameRegExes = v;
            return this;
        };

NL_sstestf.JsUnityBuilder.prototype.setCustomSuiteRunner =
        function (v)
        {
            this.customSuiteRunner = v;
            return this;
        };

NL_sstestf.JsUnityBuilder.prototype.createConfiguration =
        function ()
        {
            var configuration = {};
            configuration.includeFunctionsRegExes = this.allowedFunctionNameRegExes;
            configuration.includeFieldsRegExes = this.allowedFieldNameRegExes;
            configuration.customSuiteRunner = this.customSuiteRunner;

            return configuration;
        };

NL_sstestf.JsUnityBuilder.prototype.getResult = function getResult() {
    var cJsUnity;

    cJsUnity = this.createConfigurableJsUnity();
    cJsUnity.setConfiguration(this.createConfiguration());
    return cJsUnity.build();
};

NL_sstestf.MessageWithDurationField =
        function (preMsg, testCaseName, duration, postMsg)
        {
            this.preMsg = preMsg;
            this.testCaseName = testCaseName;
            this.duration = duration;
            this.postMsg = postMsg;
        };

NL_sstestf.MessageWithDurationField.prototype.toString =
        function toString()
        {
            var comps = [];

            comps.push(this.preMsg, ' ', this.testCaseName);
            this.postMsg && comps.push(': ', ['<pre>',this.postMsg,'</pre>'].join(''));

            return comps.join('');
        };

NL_sstestf.MessageWithDurationField.prototype.toStringWithDurationInMilliSeconds =
        function toStringWithDurationInMilliSeconds()
        {
            var comps = [];

            comps.push(this.preMsg, ' duration:', this.duration, 'ms');
            this.postMsg && comps.push(': ', ['<pre>',this.postMsg,'</pre>'].join(''));

            return comps.join('');
        };

/**
 *
 * @param {Object} nlJsUnity a container for the .log() and .TestResults() methods
 */
NL_sstestf.TestSuiteResultsWithDuration =
        function TestSuiteResultWithDuration(nlJsUnity)
        {
            this.nlJsUnity = nlJsUnity;
            this.cases = [];
            this.suiteName = null;
            this.total = 0;
            this.passed = 0;
            this.failed = 0;
            this.error = 0;
            this.setUpTestSuiteException = null;
            this.tearDownTestSuiteException = null;
            this.dataSetUpFunctionCount = 0;
            this.dataSetUpResults = [];
            this.dataTearDownResults = [];
            this.dataTearDownFunctionCount = 0;
        };
NL_sstestf.TestSuiteResultsWithDuration.prototype.setJsUnity =
        function setJsUnity(v)
        {
            this.nlJsUnity = v;
        };
NL_sstestf.TestSuiteResultsWithDuration.prototype.createJsUnityResults =
        function createJsUnityResults()
        {
            var results = new this.nlJsUnity.TestResults();

            results.suiteName = this.suiteName;
            results.total = this.total;
            results.passed = this.passed;
            results.failed = this.failed + this.error;
            results.duration = this.duration;
            // legacy TestsuiteRunner, LastRunSummaryReport fields
            results.starttime = this.starttime;
            results.setUpTestSuiteSuccessful = !this.setUpTestSuiteException;
            results.tearDownTestSuiteSuccessful = !this.tearDownTestSuiteException;

            return results;
        };
NL_sstestf.TestSuiteResultsWithDuration.prototype.setSuiteName =
        function setSuiteName(v)
        {
            this.suiteName = v;
        };
NL_sstestf.TestSuiteResultsWithDuration.prototype.getTimeStampAsInteger =
        function getTimeStampAsInteger()
        {
            return new Date().getTime();
        };
NL_sstestf.TestSuiteResultsWithDuration.prototype.markSuiteStart =
        function markSuiteStart()
        {
            this.start = this.getTimeStampAsInteger();
            this.starttime = NL_sstestf.dateToISO8601(new Date(this.start));
        };
NL_sstestf.TestSuiteResultsWithDuration.prototype.markSuiteEnd =
        function markSuiteEnd()
        {
            this.duration = this.getTimeStampAsInteger() - this.start;
        };

NL_sstestf.TestSuiteResultsWithDuration.prototype.markCaseStart =
        function markCaseStart(caseIndex, caseName)
        {
            this.cases[caseIndex] = {
                name: caseName,
                start: this.getTimeStampAsInteger()
            };
            ++this.total;
        };

NL_sstestf.TestSuiteResultsWithDuration.prototype.calcDuration =
        function calcDuration(caseResult)
        {
            caseResult.duration = this.getTimeStampAsInteger() - caseResult.start;
        };

NL_sstestf.TestSuiteResultsWithDuration.prototype.makeMessageWithDuration =
        function makeMessageWithDuration(preMsg, testCaseName, duration, postMsg)
        {
            return new NL_sstestf.MessageWithDurationField(preMsg, testCaseName, duration, postMsg);
        };

NL_sstestf.TestSuiteResultsWithDuration.prototype.addCasePassed =
        function addCasePassed(caseIndex)
        {
            var caseResult = this.cases[caseIndex];

            ++this.passed;
            this.calcDuration(caseResult);
            this.nlJsUnity.log(
                    this.makeMessageWithDuration(
                            '[PASSED]',
                            caseResult.name,
                            caseResult.duration),
                    this.suiteName, caseResult.name);
        };

NL_sstestf.TestSuiteResultsWithDuration.prototype.createExceptionFormatter =
        function createExceptionFormatter(e)
        {
            return new NL_sstestf.ExceptionDetailFormatter(e);
        };

NL_sstestf.TestSuiteResultsWithDuration.prototype.addCaseError =
        function addCaseError(caseIndex, exception)
        {
            var caseResult = this.cases[caseIndex],
                    e = exception;

            ++this.error;
            this.calcDuration(caseResult);
            this.nlJsUnity.log(
                    this.makeMessageWithDuration(
                            '[ERROR]',
                            caseResult.name,
                            caseResult.duration,
                            this.createExceptionFormatter(e).toFormattedString()),
                    this.suiteName,
                    caseResult.name);
        };

NL_sstestf.TestSuiteResultsWithDuration.prototype.addCaseFailed =
        function addCaseFailed(caseIndex, assertionFailureException)
        {
            var caseResult = this.cases[caseIndex],
                    e = assertionFailureException;

            ++this.failed;
            this.calcDuration(caseResult);
            this.nlJsUnity.log(
                    this.makeMessageWithDuration(
                            '[FAILED]',
                            caseResult.name,
                            caseResult.duration,
                            e && e.message),
                    this.suiteName,
                    caseResult.name);
        };

NL_sstestf.TestSuiteResultsWithDuration.prototype.getCaseResult =
        function getCaseResult(caseIndex)
        {
            var caseResult = this.cases[caseIndex];

            return caseResult;
        };


NL_sstestf.TestSuiteResultsWithDuration.prototype.addSetUpTestSuiteError =
        function setUpTestSuiteError(exception)
        {
            var e = exception;

            this.setUpTestSuiteException = e;
            ++this.total;
            ++this.error;
            this.nlJsUnity.log(
                    '[ERROR] setUpTestSuite in ' + this.suiteName +': ' +
                            this.createExceptionFormatter(e).toFormattedString(),
                    this.suiteName,
                    'setUpTestSuite');
        };

NL_sstestf.TestSuiteResultsWithDuration.prototype.addTearDownTestSuiteError =
        function tearDownTestSuiteError(exception)
        {
            var e = exception;

            this.tearDownTestSuiteException = e;
            ++this.total;
            ++this.error;
            this.nlJsUnity.log(
                    '[ERROR] tearDownTestSuite in '+ this.suiteName +
                            ': ' + this.createExceptionFormatter(e).toFormattedString(),
                    this.suiteName,
                    'tearDownTestSuite');
        };

NL_sstestf.TestSuiteResultsWithDuration.prototype.setDataSetUpFunctionCount =
        function setDataSetUpFunctionCount(v)
        {
            this.dataSetUpFunctionCount = v;
        };

NL_sstestf.TestSuiteResultsWithDuration.prototype.setDataSetUpResults =
        function setDataSetUpResults(v)
        {
            this.dataSetUpResults = v;
        };

NL_sstestf.TestSuiteResultsWithDuration.prototype.addDataSetUpResult =
        function addDataSetUpResult(v)
        {
            this.dataSetUpResults.push(v);
        };

NL_sstestf.TestSuiteResultsWithDuration.prototype.setDataTearDownFunctionCount =
        function setDataTearDownFunctionCount(v)
        {
            this.dataTearDownFunctionCount = v;
        };

NL_sstestf.TestSuiteResultsWithDuration.prototype.setDataTearDownResults =
        function setDataTearDownResults(v)
        {
            this.dataTearDownResults = v;
        };

NL_sstestf.TestSuiteResultsWithDuration.prototype.addDataTearDownResult =
        function addDataTearDownResult(v)
        {
            this.dataTearDownResults.push(v);
        };

NL_sstestf.FineGrainedUnitTestRunner = function FineGrainedUnitTestRunner(
        testSuiteResultsWithDuration, testCaseIsolator)
{
    this.jsUnityInstance = null;
    this.resultsWithDuration = testSuiteResultsWithDuration;
    this.testCaseIsolator = testCaseIsolator;
};
NL_sstestf.FineGrainedUnitTestRunner.JS_UNITY_INSTANCE_INVALID = 'ERROR_SSTF_JS_UNITY_INSTANCE_INVALID';

NL_sstestf.FineGrainedUnitTestRunner.prototype.initJsUnityInstance = function (v) {
    this.jsUnityInstance = v;
};

NL_sstestf.FineGrainedUnitTestRunner.plural = function plural(cnt, unit) {
    return cnt + " " + unit + (cnt == 1 ? "" : "s");
};

NL_sstestf.FineGrainedUnitTestRunner.prototype.compileTestSuite =
        function compileTestSuite(testSuite)
        {
            var suite;
            try {
                suite = this.jsUnityInstance.compile(testSuite);
            } catch (e) {
                throw e;
                // TODO: error handling - who catches this?
            }
            return suite;
        };

NL_sstestf.FineGrainedUnitTestRunner.prototype.callAllDataSetUpFunctionsIfExists =
        function callAllDataSetUpFunctionsIfExists(compiledSuite)
        {
            var i, il,
                    fn,
                    resultsWithDuration;

            resultsWithDuration = this.resultsWithDuration;
            il = (compiledSuite.dataSetUpFunctions && compiledSuite.dataSetUpFunctions.length) || 0;

            for (i = 0; i < il; i += 1) {
                fn = compiledSuite.dataSetUpFunctions[i];
                resultsWithDuration.addDataSetUpResult(fn.call(compiledSuite));
            }
        };

NL_sstestf.FineGrainedUnitTestRunner.prototype.callDataSetUpFunctionsSliceIfExists =
        function callDataSetUpFunctionsSliceIfExists(suite, dataSetUpTearDownContext)
        {
            var fn,
                    i,
                    resultsWithDuration;

            if (!suite.dataSetUpResults) {
                i = 0;
            } else {
                i = suite.dataSetUpResults.length;
            }
            if (!suite.dataSetUpFunctions)
                return ;
            if (suite.dataSetUpFunctions.length <= i) {
                return;
            }
            resultsWithDuration = this.resultsWithDuration;
            fn = suite.dataSetUpFunctions[i];
            if (!fn || typeof fn !== 'function') {
                throw Error('Invalid data setup function at index ' + i +
                        ' value:' + fn);
            }
            resultsWithDuration.addDataSetUpResult(fn.call(suite));
        };

NL_sstestf.FineGrainedUnitTestRunner.prototype.callDataTearDownFunctionsSliceIfExists =
        function callDataTearDownFunctionsSliceIfExists(suite, dataSetUpTearDownContext)
        {
            var fn,
                    i,
                    resultsWithDuration;

            if (!suite.dataTearDownResults) {
                i = 0;
            } else {
                i = suite.dataTearDownResults.length;
            }
            if (!suite.dataTearDownFunctions)
                return;
            if (suite.dataTearDownFunctions.length <= i)
                return;
            resultsWithDuration = this.resultsWithDuration;
            fn = suite.dataTearDownFunctions[i];
            if (!fn || typeof fn !== 'function') {
                throw Error('Invalid data teardown function at index ' + i +
                        ' value:' + fn);
            }
            resultsWithDuration.addDataTearDownResult(fn.call(suite));
        };

NL_sstestf.FineGrainedUnitTestRunner.prototype.run = function () {
    var jsUnityInstance = this.jsUnityInstance,
            error;

    if (!jsUnityInstance) {
        error = new Error("a valid jsUnityInstance should be provided");
        error.name = NL_sstestf.FineGrainedUnitTestRunner.JS_UNITY_INSTANCE_INVALID;
        throw error;
    }

    this.resultsWithDuration.markSuiteStart();

    if (arguments.length > 1) {
        throw Error("NLJsUnity run can handle only 1 test suite at a time");
    }
    //for (var i = 0; i < arguments.length; i++) {
    var suite = this.compileTestSuite(arguments[0]);
    this.resultsWithDuration.setSuiteName(suite.suiteName);
    this.logProloguePerTestSuite(suite);
    this.callSetUpTestSuiteIfExists(suite);
    if (!this.resultsWithDuration.setUpTestSuiteException) {
        this.callAllDataSetUpFunctionsIfExists(suite);
        this.runAllTestCases(suite);
        this.callTearDownTestSuiteIfExists(suite);
    }
    this.resultsWithDuration.markSuiteEnd();

    var results = this.resultsWithDuration.createJsUnityResults();
    this.logEpiloguePerTestSuite(results);

    return results;
};

NL_sstestf.FineGrainedUnitTestRunner.prototype.logProloguePerTestSuite =
        function logProloguePerTestSuite(compiledSuite)
        {
            var plural = NL_sstestf.FineGrainedUnitTestRunner.plural;

            this.jsUnityInstance.log("Running "
                    + (compiledSuite.suiteName || "unnamed test suite"));
            this.jsUnityInstance.log(plural(compiledSuite.tests.length, "test") + " found");
        };

NL_sstestf.FineGrainedUnitTestRunner.prototype.logEpiloguePerTestSuite =
        function logEpiloguePerTestSuite(testResults)
        {
            var jsUnityInstance = this.jsUnityInstance,
                    plural = NL_sstestf.FineGrainedUnitTestRunner.plural;

            jsUnityInstance.log(plural(testResults.passed, "test") + " passed");
            jsUnityInstance.log(plural(testResults.failed, "test") + " failed");
            jsUnityInstance.log(plural(testResults.duration, "millisecond") + " elapsed");
        };

NL_sstestf.FineGrainedUnitTestRunner.prototype.createTestCaseExceptionHandler =
        function createTestCaseExceptionHandler()
        {
            return new NL_sstestf.TestCaseExceptionHandler(this.resultsWithDuration);
        };

NL_sstestf.FineGrainedUnitTestRunner.prototype.getGlobalScope =
        function getGlobalScope()
        {
            return (function () { return this; }());
        };

NL_sstestf.FineGrainedUnitTestRunner.prototype.getSetUpTestSuiteExceptionHandler =
        function getSetUpTestSuiteExceptionHandler()
        {
            return new NL_sstestf.SetUpTestSuiteExceptionHandler(this.resultsWithDuration);
        };

NL_sstestf.FineGrainedUnitTestRunner.prototype.callSetUpTestSuiteIfExists =
        function callSetUpTestSuiteIfExists(suite)
        {
            try {
                suite.setUpTestSuite && suite.setUpTestSuite();
            } catch (e) {
                this.getSetUpTestSuiteExceptionHandler().handle(e);
            }
        };

NL_sstestf.FineGrainedUnitTestRunner.prototype.getTearDownTestSuiteExceptionHandler =
        function getTearDownTestSuiteExceptionHandler()
        {
            return new NL_sstestf.TearDownTestSuiteExceptionHandler(this.resultsWithDuration);
        };

NL_sstestf.FineGrainedUnitTestRunner.prototype.callTearDownTestSuiteIfExists =
        function callTearDownTestSuiteIfExists(suite)
        {
            try {
                suite.tearDownTestSuite && suite.tearDownTestSuite();
            } catch (e) {
                this.getTearDownTestSuiteExceptionHandler().handle(e);
            }
        };

NL_sstestf.FineGrainedUnitTestRunner.prototype.callAllDataTearDownFunctionsIfExists =
        function callAllDataTearDownFunctionsIfExists(compiledSuite)
        {
            var i, il,
                    fn,
                    resultsWithDuration;

            resultsWithDuration = this.resultsWithDuration;
            il = (compiledSuite.dataTearDownFunctions && compiledSuite.dataTearDownFunctions.length);

            for (i = 0; i < il; i += 1) {
                fn = compiledSuite.dataTearDownFunctions[i];
                resultsWithDuration.addDataTearDownResult(fn.call(compiledSuite));
            }
        };

/**
 *
 * @param suite
 */
NL_sstestf.FineGrainedUnitTestRunner.prototype.runAllTestCases =
        function runAllTestCases(suite)
        {
            var jl = suite.tests.length,
                    tcExceptionHandler,
                    wrappedException = null;

            tcExceptionHandler = this.createTestCaseExceptionHandler();

            for (var j = 0; j < jl; j++) {
                this.resultsWithDuration.markCaseStart(j, suite.tests[j].name);
                try {
                    try {
                        this.callSetUpIfExists(suite);
                    } catch (e) {
                        wrappedException = new NL_sstestf.WrappedNSException(
                                'setUpException', e);
                        wrappedException.errorSubMethod = 'setUp';
                        throw wrappedException;
                    }
                    try {
                        this.callTestCase(suite, j);
                    } catch (e) {
                        try {
                            this.callTearDownIfExists(suite);
                        } catch (tearDownEx) {
                            ;// discard nested tear down exception to avoid
                            // masking the original exception
                        }
                        throw e;
                    }
                    try {
                        this.callTearDownIfExists(suite);
                    } catch (e) {
                        wrappedException = new NL_sstestf.WrappedNSException(
                                'tearDownException', e);
                        wrappedException.errorSubMethod = 'tearDown';
                        throw wrappedException;
                    }
                    this.resultsWithDuration.addCasePassed(j);
                } catch (e) {
                    tcExceptionHandler.handle(e, j);
                } finally {
                    this.testCaseIsolator.resetNsApi(this.getGlobalScope());
                }
            }
        };

NL_sstestf.FineGrainedUnitTestRunner.prototype.indexOfTestCaseByName =
        function indexOfTestCaseByName(suite, testCaseName)
        {
            var i, il = suite.tests.length;

            for (i = 0; i < il; i += 1) {
                if (suite.tests[i].name === testCaseName) {
                    return i;
                }
            }
            return -1;
        };

/**
 * Borne out of the request to be able to run a single test case (in a test suite, in a project)
 *
 * (notice the duplication with NL_sstestf.FineGrainedUnitTestRunner.prototype.runAllTestCases)
 * @param suite  the jsUnity compiled test sutie object
 * @param {String} testCaseName the name of the test case to run
 */
NL_sstestf.FineGrainedUnitTestRunner.prototype.runOneTestCase =
        function runOneTestCase(suite, testCaseName)
        {
            var j = -1,
                    tcExceptionHandler,
                    wrappedException = null;

            tcExceptionHandler = this.createTestCaseExceptionHandler();

            j = this.indexOfTestCaseByName(suite, testCaseName);
            if (j < 0) {
                this.resultsWithDuration.markCaseStart(0, testCaseName);
                tcExceptionHandler.handle(
                        Error("FineGrainedUnitTestRunner runOneTestCase failed to find " +
                                "named test case:" + testCaseName),
                        0);
            } else {
                this.resultsWithDuration.markCaseStart(j, suite.tests[j].name);
                try {
                    try {
                        this.callSetUpIfExists(suite);
                    } catch (e) {
                        wrappedException = new NL_sstestf.WrappedNSException(
                                'setUpException', e);
                        wrappedException.errorSubMethod = 'setUp';
                        throw wrappedException;
                    }
                    try {
                        this.callTestCase(suite, j);
                    } catch (e) {
                        try {
                            this.callTearDownIfExists(suite);
                        } catch (tearDownEx) {
                            ;// discard nested tear down exception to avoid
                            // masking the original exception
                        }
                        throw e;
                    }
                    try {
                        this.callTearDownIfExists(suite);
                    } catch (e) {
                        wrappedException = new NL_sstestf.WrappedNSException(
                                'tearDownException', e);
                        wrappedException.errorSubMethod = 'tearDown';
                        throw wrappedException;
                    }
                    this.resultsWithDuration.addCasePassed(j);
                } catch (e) {
                    tcExceptionHandler.handle(e, j);
                } finally {
                    this.testCaseIsolator.resetNsApi(this.getGlobalScope());
                }
            }
        };

NL_sstestf.FineGrainedUnitTestRunner.prototype.callSetUpIfExists =
        function callSetUpIfExists(suite)
        {
            suite.setUp && suite.setUp();
        };

NL_sstestf.FineGrainedUnitTestRunner.prototype.callTestCase =
        function callTestCase(suite, indexOfTest)
        {
            var test;

            test = suite.tests[indexOfTest];
            test.fn.call(suite.scope);
        };

NL_sstestf.FineGrainedUnitTestRunner.prototype.callTearDownIfExists =
        function callTearDownIfExists(suite)
        {
            suite.tearDown && suite.tearDown();
        };

NL_sstestf.FineGrainedUnitTestRunner.prototype.resetNsApi =
        function resetNsApi()
        {
            this.testCaseIsolator.resetNsApi();
        };

NL_sstestf.TestCaseIsolator =
        function TestCaseIsolator(source)
        {
            this.source = source;
        };

NL_sstestf.TestCaseIsolator.prototype.setSource =
        function setSource(v)
        {
            this.source = v;
        };

NL_sstestf.TestCaseIsolator.prototype.resetNsApi =
        function resetNsApi(target)
        {
            for (var i in this.source) {
                if (this.source.hasOwnProperty(i)) {
                    target[i] = this.source[i];
                }
            }
        };


NL_sstestf.TestCaseExceptionHandler =
        function TestCaseExceptionHandler(testResultsWithDuration)
        {
            this.testResultsWithDuration = testResultsWithDuration;
            this.toString = function () {
                return 'TestCaseExceptionHandler';
            };
        };
NL_sstestf.TestCaseExceptionHandler.prototype.setSuiteName = function (v) {
    this.suiteName = v;
};

NL_sstestf.TestCaseExceptionHandler.prototype.handle = function handle(e, caseIndex) {
    if (e && e.name === 'SSS_USAGE_LIMIT_EXCEEDED') {
        throw e;
    } else if (e.name && (e.name.search(/Error_assert/) !== -1 ||
            e.name.search(/Error_fail/) !== -1)) {

        this.testResultsWithDuration.addCaseFailed(caseIndex, e);
    } else {
        this.testResultsWithDuration.addCaseError(caseIndex, e);
    }
};

NL_sstestf.SetUpTestSuiteExceptionHandler =
        function SetUpTestSuiteExceptionHandler(testResultsWithDuration)
        {
            this.testResultsWithDuration = testResultsWithDuration;
            this.toString = function () {
                return 'SetUpTestSuiteExceptionHandler';
            };
        };

NL_sstestf.SetUpTestSuiteExceptionHandler.prototype.handle = function handle(e) {
    if (e && e.name === 'SSS_USAGE_LIMIT_EXCEEDED') {
        throw e;
    } else {
        this.testResultsWithDuration.addSetUpTestSuiteError(e);
    }
};

NL_sstestf.TearDownTestSuiteExceptionHandler =
        function TearDownTestSuiteExceptionHandler(testResultsWithDuration)
        {
            this.testResultsWithDuration = testResultsWithDuration;
            this.toString = function () {
                return 'TearDownTestSuiteExceptionHandler';
            };
        };

NL_sstestf.TearDownTestSuiteExceptionHandler.prototype.handle = function handle(e) {
    if (e && e.name === 'SSS_USAGE_LIMIT_EXCEEDED') {
        throw e;
    } else {
        this.testResultsWithDuration.addTearDownTestSuiteError(e);
    }
};

NL_sstestf.ExceptionDetailFormatter = function ExceptionDetailFormatter(e) {
    this.exception = e;
};
NL_sstestf.ExceptionDetailFormatter.prototype.toFormattedString = function () {
    var comps = [],
            e = this.exception,
            wrapper = e,
            lineSeparator = '\n';

    if (typeof wrapper.getCause === 'function') {
        e = wrapper.getCause();
        if (!e) {
            e = wrapper;
        }
    }
    if (typeof e === 'string') {
        comps.push(e);
    }
    e.getCode && comps.push('code:' + e.getCode());
    if (!e.getCode) {
        e.name && comps.push('name:' + e.name);
    }
    // wrapper can have extra property (wrapper.errorSubMethod)
    wrapper.errorSubMethod && comps.push('errorSubMethod:' + wrapper.errorSubMethod);

    e.getDetails && comps.push('details:' + e.getDetails());
    if (!e.getDetails) {
        e.message && comps.push('message:' + e.message);
    }
    e.fileName && comps.push('fileName:' + e.fileName);
    e.lineNumber && comps.push('lineNumber:' + e.lineNumber);
    e.stack && comps.push('stack:' + e.stack);

    return comps.join(lineSeparator);
};

/**
 * @param {TestSuiteRunner} testSuiteRunner - the testSuiteRunner who called us
 * @param {jsUnity} unitTestRunner - A FineGrainedUnitTestRunner
 * @param {TestSuiteResultsWithDuration} resultsWithDuration - test result collector object
 * @param {jsUnityTestSuite} testSuite with DataSetUpTearDownContext
 * @param {DataSetUpTearDownContext || null} phaseContext - optional
 */
NL_sstestf.BasicTestSuite = function BasicTestSuite(
        testSuiteRunner,
        unitTestRunner,
        resultsWithDuration,
        testSuite,
        dataSetUpTearDownContext)
{
    this.testSuiteRunner = testSuiteRunner;
    this.unitTestRunner = unitTestRunner;
    this.resultsWithDuration = resultsWithDuration;
    this.testSuite = testSuite;
    this.dataSetUpTearDownContext = dataSetUpTearDownContext;

    this.runStart = null;
};
NL_sstestf.BasicTestSuite.prototype.run = function basicTestSuiteRun() {
    var utRunner = this.unitTestRunner,
            resultsWithDuration = this.resultsWithDuration,
            compiledSuite,
            testResults;

    compiledSuite = utRunner.compileTestSuite(this.testSuite);
    if (!resultsWithDuration.suiteName)
        resultsWithDuration.setSuiteName(compiledSuite.suiteName);

    compiledSuite.dataSetUpResults = [];
    compiledSuite.dataTearDownResults = [];
    resultsWithDuration.setDataSetUpResults(compiledSuite.dataSetUpResults);
    resultsWithDuration.setDataTearDownResults(compiledSuite.dataTearDownResults);

    resultsWithDuration.markSuiteStart();
    utRunner.logProloguePerTestSuite(compiledSuite);
    utRunner.callSetUpTestSuiteIfExists(compiledSuite);
    utRunner.callAllDataSetUpFunctionsIfExists(compiledSuite);
    utRunner.runAllTestCases(compiledSuite);
    utRunner.callTearDownTestSuiteIfExists(compiledSuite);
    utRunner.callAllDataTearDownFunctionsIfExists(compiledSuite);
    resultsWithDuration.markSuiteEnd();
    utRunner.logEpiloguePerTestSuite(this.resultsWithDuration.createJsUnityResults());
    //return testResults;
};

/**
 *
 * @param testSuiteRunner
 * @param unitTestRunner
 * @param resultsWithDuration
 * @param testSuite
 * @param testCaseName - the test case to run in the test suite
 */
NL_sstestf.SingleCaseTestSuite = function SingleCaseTestSuite(
        testSuiteRunner,
        unitTestRunner,
        resultsWithDuration,
        testSuite,
        testCaseName)
{
    this.testSuiteRunner = testSuiteRunner;
    this.unitTestRunner = unitTestRunner;
    this.resultsWithDuration = resultsWithDuration;
    this.testSuite = testSuite;
    this.testCaseName = testCaseName;
};

NL_sstestf.SingleCaseTestSuite.prototype.run = function run() {
    var utRunner = this.unitTestRunner,
            resultsWithDuration = this.resultsWithDuration,
            compiledSuite,
            testResults;

    compiledSuite = utRunner.compileTestSuite(this.testSuite);
    if (!resultsWithDuration.suiteName)
        resultsWithDuration.setSuiteName(compiledSuite.suiteName);
    compiledSuite.dataSetUpResults = [];
    compiledSuite.dataTearDownResults = [];
    resultsWithDuration.setDataSetUpResults(compiledSuite.dataSetUpResults);
    resultsWithDuration.setDataTearDownResults(compiledSuite.dataTearDownResults);

    resultsWithDuration.markSuiteStart();
    utRunner.logProloguePerTestSuite(compiledSuite);
    utRunner.callSetUpTestSuiteIfExists(compiledSuite);
    utRunner.callAllDataSetUpFunctionsIfExists(compiledSuite);

    utRunner.runOneTestCase(compiledSuite, this.testCaseName);

    utRunner.callTearDownTestSuiteIfExists(compiledSuite);
    utRunner.callAllDataTearDownFunctionsIfExists(compiledSuite);
    resultsWithDuration.markSuiteEnd();
    utRunner.logEpiloguePerTestSuite(this.resultsWithDuration.createJsUnityResults());

};

NL_sstestf.DataSetUpPhaseTestSuite = function DataSetUpPhaseTestSuite(
        testSuiteRunner,
        unitTestRunner,
        resultsWithDuration,
        testSuite,
        dataSetUpTearDownContext)
{
    this.testSuiteRunner = testSuiteRunner;
    this.unitTestRunner = unitTestRunner;
    this.resultsWithDuration = resultsWithDuration;
    this.testSuite = testSuite;
    this.dataSetUpTearDownContext = dataSetUpTearDownContext;

    this.runStart = null;
};

NL_sstestf.DataSetUpPhaseTestSuite.prototype.run = function dataSetUpPhaseRun() {
    var utRunner = this.unitTestRunner,
            resultsWithDuration = this.resultsWithDuration,
            compiledSuite,
            context = this.dataSetUpTearDownContext;

    compiledSuite = utRunner.compileTestSuite(this.testSuite);
    if (!resultsWithDuration.suiteName)
        resultsWithDuration.setSuiteName(compiledSuite.suiteName);
    compiledSuite.dataSetUpResults = context.getDataSetUpResults();
    resultsWithDuration.setDataSetUpResults(context.getDataSetUpResults());
    resultsWithDuration.markSuiteStart();

    utRunner.callSetUpTestSuiteIfExists(compiledSuite);
    utRunner.callDataSetUpFunctionsSliceIfExists(compiledSuite, this.dataSetUpTearDownContext);
    if (context.isDataSetUpComplete(compiledSuite)) {
        context.setStateToTestRunWithInitialTearDownPhase();
    }

    resultsWithDuration.markSuiteEnd();
};

NL_sstestf.TestRunPhaseTestSuite = function TestRunPhaseTestSuite(
        testSuiteRunner,
        unitTestRunner,
        resultsWithDuration,
        testSuite,
        dataSetUpTearDownContext)
{
    this.testSuiteRunner = testSuiteRunner;
    this.unitTestRunner = unitTestRunner;
    this.resultsWithDuration = resultsWithDuration;
    this.testSuite = testSuite;
    this.dataSetUpTearDownContext = dataSetUpTearDownContext;

    this.runStart = null;
};

NL_sstestf.TestRunPhaseTestSuite.prototype.run = function testRunPhaseRun() {
    var utRunner = this.unitTestRunner,
            resultsWithDuration = this.resultsWithDuration,
            compiledSuite,
            context = this.dataSetUpTearDownContext;

    compiledSuite = utRunner.compileTestSuite(this.testSuite);
    if (!resultsWithDuration.suiteName)
        resultsWithDuration.setSuiteName(compiledSuite.suiteName);
    compiledSuite.dataSetUpResults = context.getDataSetUpResults();
    resultsWithDuration.setDataSetUpResults(context.getDataSetUpResults());
    resultsWithDuration.setDataTearDownResults(context.getDataTearDownResults());
    resultsWithDuration.markSuiteStart();

    utRunner.callSetUpTestSuiteIfExists(compiledSuite);
    utRunner.runAllTestCases(compiledSuite);
    utRunner.callTearDownTestSuiteIfExists(compiledSuite);

    if (compiledSuite.dataTearDownFunctions &&
            compiledSuite.dataTearDownFunctions.length)
    {
        context.setStateToDataTearDownPhase();
    } else {
        context.setStateToTearDownComplete();
    }
    resultsWithDuration.markSuiteEnd();
    context.setInterimTestResults(resultsWithDuration.createJsUnityResults());
};

NL_sstestf.DataTearDownPhaseTestSuite = function DataTearDownPhaseTestSuite(
        testSuiteRunner,
        unitTestRunner,
        resultsWithDuration,
        testSuite,
        dataSetUpTearDownContext)
{
    this.testSuiteRunner = testSuiteRunner;
    this.unitTestRunner = unitTestRunner;
    this.resultsWithDuration = resultsWithDuration;
    this.testSuite = testSuite;
    this.dataSetUpTearDownContext = dataSetUpTearDownContext;

    this.runStart = null;
};

NL_sstestf.DataTearDownPhaseTestSuite.prototype.run = function dataTearDownPhaseRun() {
    var utRunner = this.unitTestRunner,
            resultsWithDuration = this.resultsWithDuration,
            compiledSuite,
            context = this.dataSetUpTearDownContext;

    compiledSuite = utRunner.compileTestSuite(this.testSuite);
    if (!resultsWithDuration.suiteName)
        resultsWithDuration.setSuiteName(compiledSuite.suiteName);
    compiledSuite.dataSetUpResults = context.getDataSetUpResults();
    compiledSuite.dataTearDownResults = context.getDataTearDownResults();
    resultsWithDuration.setDataSetUpResults(context.getDataSetUpResults());
    resultsWithDuration.setDataTearDownResults(context.getDataTearDownResults());
    resultsWithDuration.markSuiteStart();

    utRunner.callTearDownTestSuiteIfExists(compiledSuite);
    utRunner.callDataTearDownFunctionsSliceIfExists(compiledSuite, context);

    if (context.isDataTearDownComplete(compiledSuite)) {
        context.setStateToTearDownComplete();
    }
    resultsWithDuration.markSuiteEnd();
};

NL_sstestf.dateToISO8601 = function dateToISO8601(d) {
    var f = function (x) {
        if (x < 10) {
            return '0' + x;
        } else {
            return '' + x;
        }
    };
    return isFinite(d.valueOf()) ?
            d.getUTCFullYear() + "-" + f(d.getUTCMonth() + 1) + "-" + f(d.getUTCDate()) + "T" +
                    f(d.getUTCHours()) + ":" + f(d.getUTCMinutes()) + ":" + f(d.getUTCSeconds()) + 'Z':null;
};

NL_sstestf.TestSuiteRunner = function TestSuiteRunner(
        nsApiNamespace,
        testSuiteDependenciesLoaderFactory,
        extendedJsUnity,
        projectTestResultUpdater
        ) {
    this.nsApiNamespace = nsApiNamespace;
    this.testSuiteDependenciesLoaderFactory = testSuiteDependenciesLoaderFactory;
    this.extendedJsUnity = extendedJsUnity;
    this.projectTestResultUpdater = projectTestResultUpdater;

    this.evaldTestSuite = null;
    this.compiledSuite = null;
    this.resultsWithDuration = null;
    this.runnableSuite = null;

    this.testCaseName = null;
};

NL_sstestf.TestSuiteRunner.prototype.createExceptionFormatter = function (e) {
    return new NL_sstestf.ExceptionDetailFormatter(e);
};

NL_sstestf.TestSuiteRunner.prototype.compileTestSuite =
        function compileTestsuite(rawTestSuite, evaldTestSuite)
        {
            var testsuite,
                    errorMsg,
                    projectTestResultUpdater = this.projectTestResultUpdater,
                    nsApiNamespace = this.nsApiNamespace;

            try {
                testsuite = this.extendedJsUnity.compile(evaldTestSuite);
                if (typeof evaldTestSuite === "function") {
                    throw Error("NLJsUnity does not support the function test suite format," +
                            "use the object format instead. ");
                }
            } catch (e) {
                errorMsg =
                        ['jsUnity.compile failure on ', rawTestSuite.getName(), '\n',
                            'Exception thrown: ', this.createExceptionFormatter(e).toFormattedString(), '\n\n',
                            'The accepted format for test suites is of the following form:\n',
                            '({\n',
                            '\t suiteName:"My Test suite name",\n',
                            '\t testOneIsEqualToItself: function () {\n',
                            '\t\t jsUnity.assertions.assertEqual(1,1,"1 should be equal to itself");\n',
                            '\t}\n',
                            '})'
                        ].join('');
                projectTestResultUpdater.updateLastRunWithFailure(
                        projectTestResultUpdater.getProjectRecord(),
                        errorMsg
                );
                nsApiNamespace.nlapiLogExecution(
                        'ERROR',
                        'Error in compiling test suite',
                        errorMsg);
                throw e;
            }
            if (!testsuite instanceof jsUnity.TestSuite) {

                errorMsg = 'jsUnity.compile failed to create a testsuite ' + rawTestSuite.getName();
                projectTestResultUpdater.updateLastRunWithFailure(
                        projectTestResultUpdater.getProjectRecord(),
                        errorMsg
                );
                nsApiNamespace.nlapiLogExecution(
                        'ERROR',
                        'No test suite produced',
                        errorMsg);
                throw Error(errorMsg);
            }
            if (testsuite.tests.length === 0) {
                var errorMsg;

                errorMsg = '0 tests found in ' + rawTestSuite.getName();
                // ADD DETECTION OF ZERO TESTS FOUND
                projectTestResultUpdater.updateLastRunWithFailure(
                        projectTestResultUpdater.getProjectRecord(),
                        errorMsg
                );
                nsApiNamespace.nlapiLogExecution(
                        'ERROR',
                        'empty test suite produced',
                        errorMsg);
                throw Error(errorMsg);
            }

            return testsuite;
        };

NL_sstestf.TestSuiteRunner.prototype.createTestSuiteResultsWithDuration =
        function createTestSuiteResultsWithDuration(nlJsUnity)
        {
            return new NL_sstestf.TestSuiteResultsWithDuration(nlJsUnity);
        };

NL_sstestf.TestSuiteRunner.prototype.createUnitTestRunner =
        function createUnitTestRunner(nlJsUnity, testResultsWithDuration)
        {
            var utRunner = new NL_sstestf.FineGrainedUnitTestRunner(
                    testResultsWithDuration,
                    new NL_sstestf.TestCaseIsolator(this.nsApiNamespace));
            utRunner.initJsUnityInstance(nlJsUnity);
            return utRunner;
        };

NL_sstestf.TestSuiteRunner.prototype.createRunnableSuiteBuilder =
        function createRunnableSuiteBuilder(unitTestRunner, resultsWithDuration)
        {
            var b;

            b = new NL_sstestf.RunnableSuiteBuilder(this, unitTestRunner, resultsWithDuration);

            return b;
        };

NL_sstestf.TestSuiteRunner.prototype.createNonLibraryDependenciesLoader =
        function createNonLibraryDependenciesLoader(testSuiteDependenciesLoaderFactory)
        {
            return new NL_sstestf.NonLibraryDependenciesLoader(testSuiteDependenciesLoaderFactory);
        };

NL_sstestf.TestSuiteRunner.prototype.createDependencyEvalExceptionHandler =
        function createDependencyEvalExceptionHandler(
                projectTestResultUpdater,
                rawTestSuite,
                depFileNameAndIdList,
                indexOfLastEvaluatedDependency)
        {
            return new NL_sstestf.DependencyEvalExceptionHandler(
                    projectTestResultUpdater,
                    rawTestSuite,
                    depFileNameAndIdList,
                    indexOfLastEvaluatedDependency);
        };

NL_sstestf.TestSuiteRunner.prototype.setSingleTestCaseMode =
        function setSingleTestCaseMode(testCaseName)
        {
            this.testCaseName = testCaseName;
        }

NL_sstestf.TestSuiteRunner.prototype.runWithNonLibraryDependencies =
        function runWithNonLibraryDependencies(
                rawTestSuite,
                testSuiteExecutionMetadata,
                dataSetUpTearDownContext)
        {
            var jsUnity = this.extendedJsUnity;

            var sstf_local = {},
                    projectTestResultUpdater = this.projectTestResultUpdater;

            sstf_local.i = 0;
            sstf_local.il = 0;
            sstf_local.j = 0;
            sstf_local.jl = 0;

            if (rawTestSuite.getFileId() !=  testSuiteExecutionMetadata.currentTestsuiteId) {
                rawTestSuite.loadFromFileCabinet(testSuiteExecutionMetadata.currentTestsuiteId);
            }

            try {
                // the following line will throw an exception if the test suite has
                // syntax errors.
                this.evaldTestSuite = eval(rawTestSuite.getFileContent());
            } catch (e) {
                projectTestResultUpdater.updateLastRunWithFailure(
                        projectTestResultUpdater.getProjectRecord(),
                        'failed to evaluate the testsuite:' + rawTestSuite.getName() + '\n' +
                                this.createExceptionFormatter(e).toFormattedString()
                );
                throw e;
            }
            this.compiledSuite = this.compileTestSuite(rawTestSuite, this.evaldTestSuite);
            this.evaldTestSuite = null;

            this.runnerDepLoader = this.createNonLibraryDependenciesLoader(this.testSuiteDependenciesLoaderFactory);
            sstf_local.fileContentList = [];
            sstf_local.fileNameAndIdList = [];

            this.runnerDepLoader.addFileContentStorage(sstf_local.fileContentList).
                    addFileNameAndIdStorage(sstf_local.fileNameAndIdList);
            this.runnerDepLoader.readDependencies(
                    testSuiteExecutionMetadata.getCurrentDependencyFileIdList());

            sstf_local.il = sstf_local.fileContentList.length;
            try {
                for (sstf_local.i = 0; sstf_local.i < sstf_local.il; sstf_local.i += 1) {
                    // eval the non-library dependencies to the present scope
                    eval(sstf_local.fileContentList[sstf_local.i]);
                }
            } catch (e) {
                var handler = this.createDependencyEvalExceptionHandler(
                        projectTestResultUpdater,
                        rawTestSuite,
                        sstf_local.fileNameAndIdList,
                        sstf_local.i);
                handler.handle(e);
            }
            this.resultsWithDuration = this.createTestSuiteResultsWithDuration(this.extendedJsUnity);
            this.unitTestRunner = this.createUnitTestRunner(this.extendedJsUnity, this.resultsWithDuration);
            this.rSuiteBuilder = this.createRunnableSuiteBuilder(
                    this.unitTestRunner,
                    this.resultsWithDuration);
            this.rSuiteBuilder.setSingleTestCaseMode(this.testCaseName);
            this.runnableSuite = this.rSuiteBuilder.build(
                    this.compiledSuite,
                    dataSetUpTearDownContext);
            this.runnableSuite.run();

            return this.resultsWithDuration.createJsUnityResults();
        };

NL_sstestf.RunnableSuiteBuilder =
        function RunnableSuiteBuilder(
                testSuiteRunner,
                unitTestRunner,
                resultsWithDuration)
        {
            this.testSuiteRunner = testSuiteRunner;
            this.unitTestRunner = unitTestRunner;
            this.resultsWithDuration = resultsWithDuration;

            this.testCaseName = null;
        };

NL_sstestf.RunnableSuiteBuilder.prototype.setSingleTestCaseMode =
        function setSingleTestCaseMode(testCaseName)
        {
            this.testCaseName = testCaseName;
        };

NL_sstestf.RunnableSuiteBuilder.prototype.newSingleTestCaseTestSuite  =
        function newSingleTestCaseTestSuite(
                testSuiteRunner,
                unitTestRunner,
                resultsWithDuration,
                testSuite,
                testCaseName)
        {
            return new NL_sstestf.SingleCaseTestSuite(testSuiteRunner,
                    unitTestRunner,
                    resultsWithDuration,
                    testSuite,
                    testCaseName);
        };

NL_sstestf.RunnableSuiteBuilder.prototype.build =
        function build(compiledSuite, dataSetUpTearDownContext)
        {
            if (!dataSetUpTearDownContext) {
                if (this.testCaseName) {
                    return this.newSingleTestCaseTestSuite(
                            this.testSuiteRunner,
                            this.unitTestRunner,
                            this.resultsWithDuration,
                            compiledSuite,
                            this.testCaseName
                    );
                } else {
                    return this.newBasicTestSuite(compiledSuite);
                }
            } else {
                if (compiledSuite.dataSetUpFunctions &&
                        dataSetUpTearDownContext.isDataSetUpPhase() &&
                        !dataSetUpTearDownContext.isDataSetUpComplete(compiledSuite))
                {
                    return this.newDataSetUpPhaseTestSuite(
                            compiledSuite, dataSetUpTearDownContext);
                } else if (dataSetUpTearDownContext.isTestRunWithInitialTearDownPhase() ||
                        (!compiledSuite.dataSetUpFunctions &&
                                dataSetUpTearDownContext.isDataSetUpPhase()) ||
                        (compiledSuite.dataSetUpFunctions &&
                                dataSetUpTearDownContext.isDataSetUpPhase() &&
                                dataSetUpTearDownContext.isDataSetUpComplete(compiledSuite)))
                {
                    return this.newTestRunPhaseTestSuite(
                            compiledSuite, dataSetUpTearDownContext);
                } else if (dataSetUpTearDownContext.isDataTearDownPhase()) {
                    return this.newDataTearDownPhaseTestSuite(
                            compiledSuite, dataSetUpTearDownContext);
                } else {
                    throw Error("Test framework error: RunnableSuiteBuilder.build "+
                            'test suite already completed ' + dataSetUpTearDownContext.toJSON());
                }
            }

        };

NL_sstestf.RunnableSuiteBuilder.prototype.newBasicTestSuite =
        function newBasicTestSuite(compiledSuite)
        {
            return new NL_sstestf.BasicTestSuite(
                    this.testSuiteRunner,
                    this.unitTestRunner,
                    this.resultsWithDuration,
                    compiledSuite,
                    null);
        };

NL_sstestf.RunnableSuiteBuilder.prototype.newDataSetUpPhaseTestSuite =
        function newDataSetUpPhaseTestSuite(
                compiledSuite,
                dataSetUpTearDownContext)
        {
            return new NL_sstestf.DataSetUpPhaseTestSuite(
                    this.testSuiteRunner,
                    this.unitTestRunner,
                    this.resultsWithDuration,
                    compiledSuite,
                    dataSetUpTearDownContext);
        };

NL_sstestf.RunnableSuiteBuilder.prototype.newTestRunPhaseTestSuite =
        function newTestRunPhaseTestSuite(
                compiledSuite,
                dataSetUpTearDownContext)
        {
            return new NL_sstestf.TestRunPhaseTestSuite(
                    this.testSuiteRunner,
                    this.unitTestRunner,
                    this.resultsWithDuration,
                    compiledSuite,
                    dataSetUpTearDownContext);
        };

NL_sstestf.RunnableSuiteBuilder.prototype.newDataTearDownPhaseTestSuite =
        function newDataTearDownPhaseTestSuite(
                compiledSuite,
                dataSetUpTearDownContext)
        {
            return new NL_sstestf.DataTearDownPhaseTestSuite(
                    this.testSuiteRunner,
                    this.unitTestRunner,
                    this.resultsWithDuration,
                    compiledSuite,
                    dataSetUpTearDownContext);
        };

NL_sstestf.NonLibraryDependenciesLoader =
        function NonLibraryDependenciesLoader(testSuiteDependencyLoaderFactory)
        {
            this.testSuiteDependencyLoaderFactory = testSuiteDependencyLoaderFactory;
        };
NL_sstestf.NonLibraryDependenciesLoader.prototype.addFileContentStorage =
        function addFileContentStorage(listForStorage)
        {
            this.fileContentStore = listForStorage;
            return this;
        };

NL_sstestf.NonLibraryDependenciesLoader.prototype.addFileNameAndIdStorage =
        function addFileNameAndIdStorage(listForStorage)
        {
            this.fileNameAndIdStore = listForStorage;
            return this;
        };

NL_sstestf.NonLibraryDependenciesLoader.prototype.readDependencies =
        function readDependencies(dependencyFileIdList)
        {
            var depLoader,
                    factory = this.testSuiteDependencyLoaderFactory,
                    fileContentStore = this.fileContentStore,
                    fileNameAndIdStore = this.fileNameAndIdStore;

            depLoader = factory.create(
                    function visitEachFile(content, nameAndId) {
                        fileContentStore && fileContentStore.push(content);
                        fileNameAndIdStore && fileNameAndIdStore.push(nameAndId);
                    });
            if (dependencyFileIdList) {
                depLoader.loadDependencies(
                        dependencyFileIdList,
                        depLoader.loadFileSetFromIds);
            }
        };

NL_sstestf.DependencyEvalExceptionHandler =
        function DependencyEvalExceptionHandler(
                projectTestResultUpdater,
                rawTestSuite,
                depFileNameAndIdList,
                indexOfLastEvaluatedDependency)
        {
            this.projectTestResultUpdater = projectTestResultUpdater;
            this.rawTestSuite = rawTestSuite;
            this.depFileNameAndIdList = depFileNameAndIdList;
            this.indexOfLastEvaluatedDependency = indexOfLastEvaluatedDependency;
        };

NL_sstestf.DependencyEvalExceptionHandler.prototype.handle =
        function handle(e)
        {
            var lastEvaluatedDependencies,
                    i = this.indexOfLastEvaluatedDependency,
                    numberOfDepHistoryEntries = 2;

            lastEvaluatedDependencies = [];
            var jl = Math.min(
                    numberOfDepHistoryEntries,
                    this.depFileNameAndIdList.length,
                    i + 1);
            for (var j = 0; j < jl;j += 1, i -= 1) {
                lastEvaluatedDependencies.push(
                        'name:' + this.depFileNameAndIdList[i].name +
                                ' fileId:' + this.depFileNameAndIdList[i].id
                );
            }

            this.projectTestResultUpdater.updateLastRunWithFailure(
                    this.projectTestResultUpdater.getProjectRecord(),
                    ['failed to evaluate the dependencies of the testsuite:' +
                            this.rawTestSuite.getName(),
                        'Last evaluated dependencies:',
                        lastEvaluatedDependencies.join('\n'),
                        '\nException information:',
                        this.createExceptionFormatter(e).toFormattedString()
                    ].join('\n')
            );
            throw e;
        };

NL_sstestf.DependencyEvalExceptionHandler.prototype.createExceptionFormatter =
        function createExceptionFormatter(e)
        {
            return new NL_sstestf.ExceptionDetailFormatter(e);
        };

var jsUnity;
if (!NL_sstestf.runtime) {
    NL_sstestf.runtime = {
        toString: function () {
            return 'NL_sstestf.runtime';
        }
    };
    NL_sstestf.runtime.createJsUnityInstance = function createJsUnityInstance() {
        var testResultsWithDuration = new NL_sstestf.TestSuiteResultsWithDuration(null);
        var testCaseIsolator = new NL_sstestf.TestCaseIsolator();
        var fineGrainedUnitTestRunner = new NL_sstestf.FineGrainedUnitTestRunner(
                testResultsWithDuration,
                testCaseIsolator);

        jsUnityBuilder = new NL_sstestf.JsUnityBuilder();
        jsUnityBuilder.addAllowedFieldNameRegExes([/^dataSetUp/, /^dataTearDown/]);
        jsUnityBuilder.addAllowedFunctionNameRegExes([/^setUpTestSuite$|^tearDownTestSuite$/]);
        jsUnityBuilder.setCustomSuiteRunner(fineGrainedUnitTestRunner);


        jsUnity = jsUnityBuilder.getResult();
        testResultsWithDuration.setJsUnity(jsUnity);
        jsUnity.testCaseIsolator = testCaseIsolator;
        return jsUnity;
    };
}

