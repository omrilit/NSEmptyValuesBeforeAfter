/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var psa_prm;
if (!psa_prm) psa_prm = {};

psa_prm.DataExporter = new function DataExporter() {
    this.params = {};
    this.headers = [];
    this.content = [];
//    this.returnData = { content : this.content };
    this.context; 
    this.lib;
    this.stringLiterals;

    this.init =  function init(request) {
        this.context = nlapiGetContext();
        this.lib = psa_prm.serverlibrary;
        this.stringLiterals = this.lib.getStringLiterals();
        
        this.title = this.stringLiterals['MAIN.FORM.TITLE'];
        this.setupParams(request);
        this.setupEncoder();
        this.setupHeaders();
        this.setupContent();
        
        nlapiLogExecution('DEBUG', 'init end', this.context.getRemainingUsage());
    };

    this.setupEncoder = function setupEncoder() {
        this.encoder = this['encode' + this.params.exportFormat.split('-')[0]];
    };
    
    this.encodePDF = function encodePDF(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    };
    
    this.decode = function decode(str) {
        return String(str)
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
    },
    
    this.encodeCSV = function encodeCSV(str) {
        var newStr = String(str);
        if (newStr.match(/,/)) {
            return '"' + newStr.replace(/"/g, '""') + '"';
        }
        return newStr;
    };
    
    this.encodeXLS = function encodeXLS(str) {
        return str;
    };
    
    this.setupParams = function setupParams(request){
        // check that all required parameters are present
        var exportParams = request.getParameter('exportParams');
        var params = exportParams.split('~');
        this.params = {
            exportFormat : params[0],
            projectsPerPage : params[1],
            currentPage : params[2]
        };
        nlapiLogExecution('DEBUG', 'params', JSON.stringify(this.params));
    };
    
    this.suiteletEntry = function(request, response) {
        var startTime = new Date().getTime();
        this.init(request);
        switch ((this.params.exportFormat).toUpperCase()){
            case 'PDF':
                this.exportPDF(response);
                break;
            case 'PDF-TEXT':
                this.exportPDFAsText(response);
                break;
            case 'CSV':
                this.exportCSV(response);
                break;
            case 'CSV-TEXT':
                this.exportCSVAsText(response);
                break;
            case 'XLS':
                this.exportXLS(response);
                break;   
            case 'XLS-TEXT':
                this.exportXLSAsText(response);
                break;                
            default:
                nlapiLogExecution('ERROR', 'params.exportFormat', 'ERROR: Invalid export format -- ' + this.params.exportFormat);
                throw nlapiCreateError('PRM_INVALID_PARAMETER', 'ERROR: Invalid export format -- ' + this.params.exportFormat, true);
        }
        nlapiLogExecution('DEBUG', 'Governance end', this.context.getRemainingUsage());
        nlapiLogExecution('DEBUG', 'suiteletEntry', (new Date().getTime() - startTime) + 'ms');
    };
    
    this.setupHeaders = function setupHeaders(){
        this.headers = [
            this.stringLiterals['FIELD.CUSTOMER_PROJECT'],
            this.stringLiterals['FIELD.RESOURCE'],
            
            this.stringLiterals['FIELD.START_DATE'],
            this.stringLiterals['FIELD.END_DATE'],
            
            this.stringLiterals['FIELD.PERCENTAGE'],
            this.stringLiterals['FIELD.HOURS'],
            
            this.stringLiterals['FIELD.HOURS_ASSIGNED'],
            this.stringLiterals['FIELD.HOURS_WORKED']
        ];
    };
    
    this.setupContent = function setupContent() {
        var projectResults = this.getProjects(),
            allocations = this.getProjectAllocations(),
            assignments = this.getProjectAssignments();
    
        var endIndex = this.params.currentPage * this.params.projectsPerPage;
        var startIndex = endIndex - this.params.projectsPerPage;
        
        var results = projectResults.getResults(startIndex, endIndex),
            length = results.length;
        
        for (var i = 0; i < length; i++) {
            var result = results[i],
                projectId = result.getValue('internalid'),
                startArr = [
                    this.encoder(result.getValue('formulatext'))
                ];
            
            if (allocations.hasOwnProperty(projectId)) {
                for ( var resourceId in allocations[projectId]) {
                    for (var l = 0; l < allocations[projectId][resourceId].length; l++) {
                        this.content.push(startArr.concat(allocations[projectId][resourceId][l]));
                    }
                }
            }
            if (assignments.hasOwnProperty(projectId)) {
                for ( var resourceId in assignments[projectId]) {
                    for (var l = 0; l < assignments[projectId][resourceId].length; l ++) {
                        this.content.push(startArr.concat(assignments[projectId][resourceId][l]));
                    }
                }
            }
        }
        
        nlapiLogExecution('DEBUG', 'getProjectAllocations', this.context.getRemainingUsage());
        nlapiLogExecution('DEBUG', 'setupContent', JSON.stringify(this.content));
    },
    
    this.getProjects = function getProjects() {
        var search = nlapiLoadSearch(null, 'customsearch_prm_project_data');
        return search.runSearch();
    };
    
    this.getProjectAllocations = function getProjectAllocations () {
        var search = nlapiLoadSearch(null, 'customsearch_prm_export_allocation_list'),
            allocationResults =  search.runSearch(),
            allocationObj = {};
        
        /*
         * iterate through Allocations
         */
        var limit       = 1000,
            allocStart  = 0,
            allocEnd    = allocStart + limit,
            allocLength = limit;
        
        while (allocLength == limit) {
            var allocs = allocationResults.getResults(allocStart, allocEnd),
                allocLength = allocs.length;
            
            for (var j = 0; j < allocLength; j++) {
                var id = allocs[j].getValue('internalid', 'job'),
                    resourceId = allocs[j].getValue('resource');
                
                if (!allocationObj[id]) {
                    allocationObj[id] = {};
                }
                if (!allocationObj[id][resourceId]) {
                    allocationObj[id][resourceId] = [];
                }
                
                var row = [
                    this.encoder(allocs[j].getText('resource')),
                    this.encoder(allocs[j].getValue('startdate')),
                    this.encoder(allocs[j].getValue('enddate')),
                    this.encoder(allocs[j].getValue('percentoftime')),
                    this.encoder(allocs[j].getValue('numberhours')),
                    '-',
                    '-'
                ];
                allocationObj[id][resourceId].push(row);
            }
            
            allocStart = allocEnd;
            allocEnd = allocStart + limit;
        };
        
        
        nlapiLogExecution('DEBUG', 'getProjectAllocations', JSON.stringify(allocationObj));
        nlapiLogExecution('DEBUG', 'getProjectAllocations', this.context.getRemainingUsage());
        
        return allocationObj;
    };
    
    this.getProjectAssignments = function getProjectAssignments() {
        var search = nlapiLoadSearch(null, 'customsearch_prm_export_assignment_list'),
            assignmentResults =  search.runSearch(),
            assignmentObj = {};
        
        /*
         * iterate through Assignments
         */
        var limit        = 1000,
            assignStart  = 0,
            assignEnd    = assignStart + limit,
            assignLength = limit;
        
        while (assignLength == limit) {
            var assignments = assignmentResults.getResults(assignStart, assignEnd),
                assignLength = assignments.length;
            
            for (var k = 0; k < assignLength; k++) {
                var id = assignments[k].getValue('internalid', 'job'),
                    resourceId = assignments[k].getValue('resource', 'projectTaskAssignment');
                
                if (!assignmentObj[id]) {
                    assignmentObj[id] = {};
                }
                if (!assignmentObj[id][resourceId]) {
                    assignmentObj[id][resourceId] = [];
                }
                
                var row = [
                    this.encoder(assignments[k].getText('resource', 'projectTaskAssignment')),
                    this.encoder(assignments[k].getValue('startdate', 'projectTaskAssignment')),
                    this.encoder(assignments[k].getValue('enddate', 'projectTaskAssignment')),
                    '-',
                    '-',
                    this.encoder(assignments[k].getValue('estimatedwork', 'projectTaskAssignment')),
                    this.encoder(assignments[k].getValue('actualwork', 'projectTaskAssignment'))
                ];
                
                assignmentObj[id][resourceId].push(row);
            }
            
            assignStart = assignEnd;
            assignEnd = assignStart + limit;
        };
        
        nlapiLogExecution('DEBUG', 'getProjectAssignments', JSON.stringify(assignmentObj));        
        nlapiLogExecution('DEBUG', 'getProjectAssignments', this.context.getRemainingUsage());
        
        return assignmentObj;
    };
    
    /*
     * build xml content
     */
    this.buildPDF = function buildPDF() {
        var xml = new Array();
        xml.push('<?xml version="1.0"?>');
        xml.push('<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">');
        xml.push('<pdf>');
            xml.push('<head>');
                xml.push('<style>');
                    xml.push('td {');
                        //xml.push('font-family: ' + nlapiGetContext().getPreference('font') + ';');
                        xml.push('font-size: 10px;')
                        xml.push('text-align: center;')
                    xml.push('}')
                xml.push('</style>');
            xml.push('</head>');
            xml.push('<body>');
                xml.push('<table width="100%">');
                    xml.push('<tr><td colspan="'+this.headers.length+'">' + this.stringLiterals['MAIN.FORM.TITLE'] + '</td></tr>');
                    xml.push('<tr>');
                        xml.push('<td colspan="4">&nbsp;</td>');
                        xml.push('<td colspan="2">' + this.stringLiterals['TEXT.RESOURCE_ALLOCATION'] + '</td>');
                        xml.push('<td colspan="2">' + this.stringLiterals['TEXT.TASK_ASSIGNMENT'] + '</td>');
                    xml.push('</tr>');
                    xml.push('<tr>');
                    for (var i = 0, ii = this.headers.length; i < ii; i++){
                        xml.push('<td>' + this.headers[i] + '</td>');
                    }
                    xml.push('</tr>');
                    for (var i = 0, ii = this.content.length; i < ii; i++){
                        xml.push('<tr>');
                        for (var j = 0, jj = this.content[i].length; j < jj; j++){
                            xml.push('<td><![CDATA[' + this.decode(this.content[i][j]) + ']]></td>');
                        }
                        xml.push('</tr>');
                    }
                xml.push('</table>');
            xml.push('</body>');
        xml.push('</pdf>');
        
        return xml.join('');
    };
    
    this.exportPDFAsText = function exportPDFAsText(response) {
        response.write(this.buildPDF());
    };
    
    this.exportPDF = function exportPDF(response) {
        /*
         * create pdf file
         */
        var file = nlapiXMLToPDF(this.buildPDF()),
            size = file.getSize() / 1024 / 1024; // bytes -> kb -> mb 
        
        nlapiLogExecution('DEBUG', 'file', size);
        nlapiLogExecution('DEBUG', 'exportPDF', this.context.getRemainingUsage());
        
        response.setContentType('PDF');
        response.write(file.getValue());
    };
    
    this.buildCSV = function buildCSV() {
        var csv = [];
        
        // set delimeters for CSV format
        var colDelim = ",";
        var rowDelim = "\r\n";

        // headers
        csv.push(this.headers.join(colDelim));
        
        // content
        for (var i = 0, ii = this.content.length; i < ii; i++) {
            csv.push(rowDelim);
            
            var arr = this.content[i].map(function (ii) {
                return this.decode(ii);
            }, this);
            
            csv.push(arr.join(colDelim));
        }
        return csv.join('');
    };
    
    this.exportCSVAsText = function exportCSVText(response){
        response.write(this.buildCSV());
    };
    
    this.exportCSV = function exportCSV(response){
        // return csv file
        response.setContentType('CSV', 'file.csv');
        response.write(this.buildCSV());
    };

    this.buildXLS = function buildXLS() {
        // use Microsoft Office XML format, based on output of native NS List (Export - Microsoft ® Excel)
        var xls = [];
        
        xls.push('<?xml version="1.0" encoding="utf-8"?>');
        xls.push('<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"');
        xls.push(' xmlns:o="urn:schemas-microsoft-com:office:office"');
        xls.push(' xmlns:x="urn:schemas-microsoft-com:office:excel"');
        xls.push(' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"');
        xls.push(' xmlns:html="http://www.w3.org/TR/REC-html40">');
        
        // title            
        xls.push('<Worksheet ss:Name="' + this.title + '">');
        
        xls.push('<Table>');
        
        // headers
        xls.push('<Row>');
        xls.push('<Cell ss:Index="5" ss:MergeAcross="1"><Data ss:Type="String">' + this.stringLiterals['TEXT.RESOURCE_ALLOCATION'] + '</Data></Cell>');
        xls.push('<Cell ss:Index="7" ss:MergeAcross="1"><Data ss:Type="String">' + this.stringLiterals['TEXT.TASK_ASSIGNMENT'] + '</Data></Cell>');
        xls.push('</Row>');
        
        xls.push('<Row>');
        for (var i = 0, ii = this.headers.length; i < ii; i++){
            xls.push('<Cell><Data ss:Type="String">' + this.headers[i] + '</Data></Cell>');
        }
        xls.push('</Row>');
        
        // content
        for (var i = 0, ii = this.content.length; i < ii; i++){
            xls.push('<Row>');
            for (var j = 0, jj = this.content[i].length; j < jj; j++){
                xls.push('<Cell><Data ss:Type="String">' + this.content[i][j] + '</Data></Cell>');
            }
            xls.push('</Row>');
        }
        
        xls.push('</Table>');
        xls.push('</Worksheet>');
        xls.push('</Workbook>');
        
        return xls.join('');
    };
    
    this.exportXLSAsText = function exportXLSText(response) {
        response.write(this.buildXLS());
    };
    
    this.exportXLS = function exportXLS(response){
        // return xls file
        response.setContentType('PLAINTEXT', 'file.xls');// PLAINTEXT content type was used since there is no API to convert to EXCEL format at this time
        response.write(this.buildXLS());
    };
};