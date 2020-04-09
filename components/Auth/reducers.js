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

import { actionTypes } from './actions';

import SI from 'seamless-immutable';

const defaultAuthState = SI({
    authRequired: false
});

export function auth(state = defaultAuthState, action) {
    switch (action.type) {
    case actionTypes.API_AUTH_ERROR: {
        return state.merge({ authRequired: true });
    }
    case actionTypes.API_AUTH_OK: {
        return state.merge({ authRequired: false });
    }

    default:
        return state;
    }
}


       
 
