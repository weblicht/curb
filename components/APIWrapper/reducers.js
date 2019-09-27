// Copyright 2019 Richard Lawrence
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

import { upperFirst } from '../../helpers';

import SI from 'seamless-immutable';


// Makes a reducer for the simple but common case where the reducer's
// job is just to stick some data returned by the API into the state.
//
// params:
//   queryActionTypes :: an action types object describing the API
//     actions this reducer should handle.  These should look like the
//     types returned by makeQueryActions, i.e., <PREFIX>_RETURNED, etc.
//   idParam :: String : the name of the property inside the action's
//     .params field whose value should be used to identify the request
//     and the returned objects.  This is normally something like the name
//     of an identifying property for a related object, e.g., "lexUnitId".
export function makeSimpleApiReducer(queryActionTypes, idParam) {

    return function reducer(state = SI({}), action) {
        if (action.type in queryActionTypes) {
            const requestPath = ['requests', 'for' + upperFirst(idParam), action.params[idParam]];
            const dataPath = ['by' + upperFirst(idParam), action.params[idParam]];
            
            if (action.type.endsWith('_REQUESTED')) {
                return state.setIn(requestPath, { fetching: true, params: action.params });
            }
            if (action.type.endsWith('_RETURNED')) {
            return state.setIn(requestPath, { fetching: false })
                        .setIn(dataPath, action.data);
            }
            if (action.type.endsWith('_ERROR')) {
            return state.setIn(requestPath,
                               { fetching: false, params: action.params, error: action.error });
            }
        } else {
            return state;
        }
    }
}



