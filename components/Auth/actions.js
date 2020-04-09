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

import { actionTypesFromStrings } from '../../helpers';
import { isAuthRequired } from './selectors';
import axios from 'axios';

export const actionTypes = actionTypesFromStrings([
    'API_AUTH_ERROR',
    'API_AUTH_OK'
]);

export function authError() {
    return { type: actionTypes.API_AUTH_ERROR };
}

export function authOK() {
    return { type: actionTypes.API_AUTH_OK };
}

export const gcAxiosInstance = axios.create();

// Setup function for axios instance; should be run at application init,
// with a reference to the application's store.
export function configureApiAuth(store) {

    // If we get an HTTP 401 from the API, we record this in the state
    // so that useful UI can be shown:
    function detectUnauthorized(error) {
        if (error.response && error.response.status === 401) {
            store.dispatch(authError());
        }

        return Promise.reject(error);
    }

    // If we later get an HTTP 200 from the API, we assume the user
    // has reauthenticated/reauthorized, so we clear the associated state:
    function detectAuthorized(response) {
        const wasUnauthorized = isAuthRequired(store.getState());
        if (wasUnauthorized && response.status === 200) {
            store.dispatch(authOK());
        }

        return response;
    }

    gcAxiosInstance.interceptors.response.use(
        detectAuthorized,
        detectUnauthorized
    );
}
