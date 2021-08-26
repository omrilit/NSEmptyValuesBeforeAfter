/**
 * @copyright © 2020, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 *
 * @description
 * This file is used on production environment only and it replaces @suiteapi/errors.
 */

define(["N/error"], function (nError) {
    function createError(message, name) {
        return nError.create({
            message: message,
            name: name || "GLM_ERROR",
        });
    }

    function createTypeError(message) {
        return createError(message, "GLM_TYPE_ERROR");
    }

    function createPermissionError() {
        return createError("You do not have a permission", "GLM_ERROR_PERMISSION");
    }

    return {
        createError: createError,
        createPermissionError: createPermissionError,
        createTypeError: createTypeError
    };
});
