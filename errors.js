// Copyright 2019 Richard Lawrence
//
// This file is part of react-utils.
//
// react-utils is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// react-utils is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with react-utils.  If not, see <https://www.gnu.org/licenses/>.

// errors.js
// common error creation and handling

// represents an error in using an internal API: e.g., an action was
// emitted without a required field
export class InternalError {
    constructor(msg) {
        this.message = msg;
        console.error(msg);
    }
}

// represents an error stemming from an external source: e.g., the
// server returned data in an unexpected format
export class ExternalError {
    constructor(msg) {
        this.message = msg;
        console.error(msg);
    }
}
