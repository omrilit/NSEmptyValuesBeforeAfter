/**
 * @copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 */

/* istanbul ignore file */
/* tslint:disable */
if (typeof publicClientScript === "undefined") {
    var publicClientScript;
}
    NS.jQuery("body").on("select", "#accttype_fs", function () {
        if (publicClientScript) {
            publicClientScript.validateField({
                column: null,
                currentRecord: publicClientScript.getCurrentRecord(),
                fieldId: "accttype",
                line: null,
                sublistid: null,
            });
        }
        return true;
    });
/* tslint:enable */
