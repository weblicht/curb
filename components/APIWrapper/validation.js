// Copyright 2020 Richard Lawrence
//
// This file is part of germanet-common.
//
// germanet-common is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// germanet-common is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with germanet-common.  If not, see <https://www.gnu.org/licenses/>.

// validation.js
// Utilities for dealing with API response validation

import { ExternalError } from '../../errors';

export class APIError extends ExternalError {
    // nothing to add here for now; we just need the class for
    // instanceof comparisons
}; 

// A default validation function. This encodes the expectations for
// data returned by API queries up through germanet-common 1.2.5: data
// should always be an array of objects. Thus it is the default
// validator in actions.js.
// 
// params:
//   data: the data attribute of the object returned from the API
//     (i.e., response.data.data, where response is an Axios response object).
export function isArrayOfObjects(data) {
    return isArrayOf(isObject, data);
}

export function isArrayOf(itemPredicate, data) {
    if (!Array.isArray(data)) {
        throw new APIError("Data is not an array")
    }

    try {
        const validatedData = data.map(itemPredicate);
        return validatedData;
    } catch (e) {
        if (e instanceof APIError) {
            throw new APIError(`Item in array is invalid: ${e.message}`);
        } else {
            throw e;
        }
    }
}

// Note: for historical reasons, null passes this test! Don't use this
// validator if you care that your object is non-null.
export function isObject(data) {
    if (typeof data !== "object") {
        throw new APIError("Data is not an object");
    }

    return data;
}
