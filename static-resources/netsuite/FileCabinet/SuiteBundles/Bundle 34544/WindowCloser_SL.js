/**
 * Copyright NetSuite, Inc. 2014 All rights reserved. 
 * The following code is a demo prototype. Due to time constraints of a demo,
 * the code may contain bugs, may not accurately reflect user requirements 
 * and may not be the best approach. Actual implementation should not reuse 
 * this code without due verification.
 * 
 * (Module description here. Whole header length should not exceed 
 * 100 characters in width. Use another line if needed.)
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Jan 2014     ieugenio
 * 
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @return {void} Any output is written via response object
 */
function windowClosetHtmlSuitelet(request, response) {
    var id = request.getParameter('custpage_');
    var html = [
        '<html>',
        '<body>',
        '<script>',
        'window.close();',
        '</script>',
        '</body></html>'
    ];
    response.write(html.join(''));
}
