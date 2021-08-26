/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var CRG = CRG || new function _CRG(refs)
{
    //Dependencies
    //var ManagedFile = System.Components.Use("ManagedFile");


    this.Job = _CRGJob;
    this.Run = _Run;





    function _Run(crgJob)
    {
        var repDef = _GetCRGReportDefinition(crgJob);
        var mFile = new ManagedFile(crgJob.GetId());

        var isOldReport = crgJob.ReportId == "CHINA_CSV" || crgJob.ReportId == "IAF_PSV" || crgJob.ReportId == "IAF_XML";
        var engine = isOldReport ? new _Engine_1(crgJob, repDef, mFile) : new _Engine_2(crgJob, repDef, mFile);

        engine.Run();
    }





    function _GetCRGReports()
    {
        if (_GetCRGReports.Cache == null)
        {
            _GetCRGReports.Cache = (function()  //Scan global namespace
            {
                var crgReports = {};
                for (var x in this)  //"this" refers to global object in an annonymous function
                {
                    var type = typeof (this[x]);
                    if (this[x] != null &&
                        type != "boolean" && type != "string" && type != "number" &&  //not primitive type?
                        "IsCRGReport" in this[x] && this[x].IsCRGReport)
                    {
                        if (this[x].ReportId != null && this[x].ReportId != "")
                        {
                            crgReports[this[x].ReportId] = this[x];
                        }
                    }
                }

                return crgReports;
            } ());
        }

        return _GetCRGReports.Cache;
    }
    _GetCRGReports.Cache = null;





    function _GetCRGReportDefinition(crgJob)
    {
        var crgReports = _GetCRGReports();
        var repDef = crgReports[crgJob.ReportId];

        if (repDef == null)
        {
            var message = "CRG: Undefined report [" + crgJob.ReportId + "].";
            crgJob.SetPercentComplete(-1);
            crgJob.RaiseEvent(crgJob.OnError, [message]);
            throw new Error(message);
        }

        return repDef;
    }





    function _CRGOutput(mFile, crgJob)
    {
        this.Write = mFile.write;
        this.WriteLine = mFile.writeLine;
        this.SetEncoding = mFile.SetEncoding;

        this.WriteError = _WriteError;
        this.SetPercent = crgJob.SetPercentComplete;
        this.SetDataError = crgJob.SetErrorFlag;
        this.SetFileName = crgJob.SetFileName;


        function _WriteError(msg)
        {
            crgJob.SetErrorFlag(true);
            mFile.writeLine("Error: " + msg);
        }
    }





    function _ToStateObject(sState)
    {
        var INITIAL_STATE = {
            RunCount: 0,
            _CRG: { LastSectionCount: -1 }
        };

        return sState == null || sState == "" ? INITIAL_STATE : JSON.parse(sState);
    }










    function _Engine_1(crgJob, repDef, mFile)
    {
        var _Job = crgJob;
        var _SectionIndex = _Job.SectionIndex == null ? 0 : _Job.SectionIndex;
        var _State = _Job.State == null || _Job.State == "" ? null : JSON.parse(_Job.State);
        var _ReportDef = repDef;
        var _MFile = mFile;

        this.Run = _Run;





        function _Run()
        {
            try
            {
                _RunReportSection();
            }

            catch (e)
            {
                var message = e.getCode ? // work-around for: e instanceof nlobjError
                e.getCode() + ': ' + e.getDetails() :
                e.message + (e.stack ? "\n" + e.stack : ""); // non-standard Rhino Error property

                if (!_Job.IsCancelled())
                {
                    _Job.SetPercentComplete(-1);
                    _Job.RaiseEvent(_Job.OnError, [message]);
                }

                throw new Error(message);
            }
        }





        function _RunReportSection()
        {
            var sections = _ReportDef.generateSections(_Job.ReportParams, _MFile, _Job.SetPercentComplete, _Job.SetErrorFlag, _Job);

            for (_SectionIndex; _SectionIndex < sections.length; _SectionIndex++)
            {
                if (!_Job.IsCancelled())
                {
                    do
                    {
                        var generateFunc = sections[_SectionIndex];

                        _State = generateFunc(_State);  //Call Generate() of _ReportDef

                        if (_Job.IsThresholdReached())
                        {
                            _Job.RaiseEvent(_Job.OnRerun, [_SectionIndex, _State]);
                            _MFile.Save();
                            return;
                        }

                    } while (_State && !_Job.IsCancelled());
                }
            }

            if (!_Job.IsCancelled())
            {
                _MFile.Save();
                _Job.SetPercentComplete(100);
                _Job.RaiseEvent(_Job.OnSuccess);
            }
        }

    }  //_Engine_1






    function _Engine_2(crgJob, repDef, mFile)
    {
        var _Job = crgJob;
        var _State = _ToStateObject(_Job.State);
        var _ReportDef = repDef;
        var _MFile = mFile;
        var _Output = new _CRGOutput(mFile, crgJob);

        var _LastCount = _State._CRG.LastSectionCount;
        var _RunningCount = 0;

        this.Generate = _Generate;  //For unit testing
        this.Run = _Run;





        function _Run()
        {
            var report = new _ReportDef(_State, _Job.ReportParams, _Output, _Job);
            var errorMsg = null;

            try
            {
                _Generate(report.GetOutline());
            }
            catch (e)
            {
                errorMsg = e.getCode ?
                    e.getCode() + ": " + e.getDetails() :
                    e.message + (e.stack ? "\n" + e.stack : "");
            }


            _MFile.Save();


            if (_Job.IsCancelled())
            {
                _Job.SetPercentComplete(100);
                _Job.RaiseEvent(_Job.OnCancel);
            }
            else if (errorMsg != null)  //has error?
            {
                _Job.SetPercentComplete(-1);
                _Job.RaiseEvent(_Job.OnError, [errorMsg]);
            }
            else if (_Job.IsThresholdReached())
            {
                _State._CRG.LastSectionCount = _RunningCount;  //Record which section when threshold was reached.
                _State.RunCount++;
                _Job.RaiseEvent(_Job.OnRerun, [0, _State]);  //First param, sectionIndex is not used by Engine_2
            }
            else
            {
                _Job.SetPercentComplete(100);
                _Job.RaiseEvent(_Job.OnSuccess);
            }
        }





        function _Generate(node)
        {
            var section = null;
            var stack = [];

            node.SequenceId = _RunningCount;

            //Instantiate section only when it hasnt been previously generated so it wont trigger all constructors
            if (_RunningCount >= _LastCount)
            {
                section = new node.Section();
                _TriggerEvent(section.On_Init ? section.On_Init.bind(section) : null);  //Init
            }

            //Header
            if (_RunningCount > _LastCount)
            {
                _TriggerEvent(section.On_Header ? section.On_Header.bind(section) : null);
            }

            if (section != null)
            {
                _TriggerEvent(section.On_Body ? section.On_Body.bind(section) : null);  //Body
                if (_Job.IsCancelled() || _Job.IsThresholdReached())
                {
                    return;
                }
            }

            //SubSections - recurse through node tree
            if (node.SubSections != null)
            {
                for (var i = 0; i < node.SubSections.length; ++i)
                {
                    _Generate(node.SubSections[i]);
                    if (_Job.IsCancelled() || _Job.IsThresholdReached())
                    {
                        return;
                    }
                }
            }

            //To ensure execution of On_Footer and On_CleanUp of parent folders prior to a rescheduled execution
            if (_RunningCount > _LastCount &&
                section == null &&
                node.SubSections != null &&
                node.SequenceId < _LastCount)
            {
                section = new node.Section();
            }

            if (section != null)
            {
                _TriggerEvent(section.On_Footer ? section.On_Footer.bind(section) : null);  //Footer

                _TriggerEvent(section.On_CleanUp ? section.On_CleanUp.bind(section) : null);  //Cleanup

                delete section;
            }

            _RunningCount++;
        }





        function _TriggerEvent(event)  //Calls a node event (if exists)
        {
            if (event != null)
            {
                event();
            }
        }

    }  //_Engine_2





    function _CRGJob()
    {
        var _THIS = this;

        this.ReportId = null;
        this.SectionIndex = null;
        this.ReportParams = null;

        //Methods
        this.GetId = _GetJobId;
        this.IsCancelled = _IsCancelled;
        this.IsThresholdReached = _IsThresholdReached;
        this.SetPercentComplete = _SetPercentComplete;
        this.SetErrorFlag = _SetErrorFlag;
        this.SetFileName = _SetFileName;
        this.RaiseEvent = _RaiseEvent;

        //Delegated functions
        this.Get_JobId = null;
        this.Get_CancelFlag = null;
        this.Get_ThresholdFlag = null;
        this.Set_PercentComplete = null;
        this.Set_ErrorFlag = null;
        this.Set_FileName = null;

        //Events
        this.OnRerun = null;
        this.OnCancel = null;
        this.OnError = null;
        this.OnSuccess = null;





        function _GetJobId()
        {
            return _THIS.Get_JobId == null ? undefined : _THIS.Get_JobId();
        }






        function _RaiseEvent(event, args)
        {
            if (event != null)
            {
                event.apply(_THIS, args);
            }
        }





        function _IsCancelled()
        {
            if (_IsCancelled.IsTrue)
            {
                return true;
            }

            if (_THIS.GetCancelFlag == null)
            {
                return false;
            }

            _IsCancelled.IsTrue = _THIS.GetCancelFlag();

            return _IsCancelled.IsTrue;
        }
        _IsCancelled.IsTrue = false;  //False until true (and never false again)





        function _IsThresholdReached()
        {
            if (_IsThresholdReached.IsTrue === true)
            {
                return true;
            }

            if (_THIS.Get_ThresholdFlag == null)
            {
                return false;
            }

            _IsThresholdReached.IsTrue = _THIS.Get_ThresholdFlag();

            return _IsThresholdReached.IsTrue;
        }
        _IsThresholdReached.IsTrue = false;  //False until true (and never false again)





        function _SetPercentComplete(value)
        {
            return _THIS.Set_PercentComplete == null ? undefined : _THIS.Set_PercentComplete(value);
        }





        function _SetErrorFlag(value)
        {
            return _THIS.Set_ErrorFlag == null ? undefined : _THIS.Set_ErrorFlag(value);
        }





        function _SetFileName(value)
        {
            return _THIS.Set_FileName == null ? undefined : _THIS.Set_FileName(value);
        }

    }  //_CRGJob

} ();   //CRG
