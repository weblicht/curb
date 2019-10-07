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
        // the data format from the backend is presently a bit
        // confusing: there is a "lexUnitId" field which corresponds to
        // the *other* relatum (i.e., not the ID that was used
        // to make the request). Thus, we reshape it a bit here for
        // clarity.
        const originatingId = action.params.lexUnitId;
        const lexRelsData = action.data.map(
            lr => SI(lr).merge({
                originatingLexUnitId: originatingId,
                relatedLexUnitId: lr.lexUnitId,
            }).without('lexUnitId')
        );
        return SI.setIn(state, ["byLexUnitId", originatingId],
                        lexRelsData);
    }
    default:
        return state;
    }
}
