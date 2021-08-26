/**
 * Copyright © 2014, 2018, Oracle and/or its affiliates. All rights reserved.
 */

function DE_GDPDU_DTD_File(state, params, output, job) {
    var _Job = job;                            
    var _Output = output;
    var _Params = params;
    var _State = state;
    
    var _Outline = { 'Section': __DTDFile };
    var _FileName = 'gdpdu-01-08-2002.dtd';
    var _ContentFileName = 'crgrpt.de.gdpdu.dtdfile_content.txt';
    
    this.GetOutline = __GetOutline;
    
    
    function __GetOutline() { 
        return _Outline;
    }
    
    
    function __DTDFile() {
        this.On_Init = _OnInit;
        this.On_Body = _OnBody;
        this.On_CleanUp = _OnCleanUp;
        
        
        function _OnInit() {
            _Output.SetFileName(_GetFileName());
            
            if (_State[__DTDFile.Name] == undefined) {
                _State[__DTDFile.Name] = {
                    Index: -1,
                    InternalId: null
                };
            }
            
            _Output.SetPercent(10);
        }
        
        
        function _OnBody() {
            var content = _GetFileContent();
            
            _Output.Write(content);
            _Output.SetPercent(80);
        }
        
        
        function _OnCleanUp() {
            delete _State[__DTDFile.Name];
            _Output.SetPercent(100);
        }
        
        
        function _GetFileContent() {
            var file_content = '';
           
            var appFolderId = ManagedFile.GetAppFolderId();
			var app_folder_name = nlapiLookupField('folder', appFolderId, 'name');
			var app_folder_parent_name = nlapiLookupField('folder', appFolderId, 'parent', true);
			
            if (app_folder_name && app_folder_parent_name) {
				var contentFilePath = [
                    app_folder_parent_name,
                    app_folder_name,
                    'src/reports/de',
                    _GetContentFileName()
                ].join('/');
				
				nlapiLogExecution('DEBUG', 'Content File Path', contentFilePath);
                var file_object = nlapiLoadFile(contentFilePath);
                
                if (file_object) {
                    file_content = file_object.getValue();
                } else {
                    file_content = 'The file \'crgrpt.de.gdpdu.dtdfile_content.txt\' is missing.';
                }
            }
            
            return file_content;
        }


        function _GetFileName() { 
            return _FileName;
        }
        
        
        function _GetContentFileName() { 
            return _ContentFileName;
        }
    } __DTDFile.Name = '__DTDFile';
}

DE_GDPDU_DTD_File.IsCRGReport = true;
DE_GDPDU_DTD_File.ReportId = 'DE_GDPDU_DTD_FILE';
