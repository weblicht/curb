// Copyright 2020 Richard Lawrence
//
// This file is part of curb.
//
// curb is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// curb is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with curb.  If not, see <https://www.gnu.org/licenses/>.

// validation.js
// Utilities for dealing with user-input validation

class ValidationErrors {
    constructor(formErrors = [], fieldErrors = {}) {
        // formErrors and fieldErrors represent two kinds of
        // validation errors.

        // formErrors should be a list of strings indicating problems
        // that are not specific to any one field:
        this.formErrors = formErrors;
        
        // fieldErrors should be an object mapping field names to
        // errors which are specific to that field:
        this.fieldErrors = fieldErrors; 
    }

    addFieldError(fieldName, errorMsg) {
        this.fieldErrors[fieldName] = errorMsg;
    }

    addFormError(errorMsg) {
        this.formErrors.push(errorMsg);
    }

    isEmpty() {
        return (this.formErrors.length === 0 &&
                Object.keys(this.fieldErrors).length === 0)
    }
}

export { ValidationErrors };
