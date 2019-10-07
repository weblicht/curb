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

import { lexRelsQueries } from './actions';

import SI from 'seamless-immutable';

const queryActionTypes = lexRelsQueries.actionTypes;

export function lexRels(state = SI({}), action) {
    switch (action.type) {
    case queryActionTypes.LEX_RELS_RETURNED: {
        const originatingId = action.params.lexUnitId;
        const lexRelsData = action.data;
        return SI.setIn(state, ["byLexUnitId", originatingId],
                        lexRelsData);
    }
    default:
        return state;
    }
}
