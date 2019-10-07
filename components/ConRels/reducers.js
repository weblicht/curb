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

import { conRelsQueries } from './actions';

import SI from 'seamless-immutable';

const queryActionTypes = conRelsQueries.actionTypes;

export function conRels(state = SI({}), action) {
    switch (action.type) {
    case queryActionTypes.CON_RELS_RETURNED: {
        // the data format from the backend is presently a bit
        // confusing: there is a "synsetId" field which corresponds to
        // the *other* relatum (i.e., not the synset ID that was used
        // to make the request). Thus, we reshape it a bit here for
        // clarity.
        const originatingId = action.params.synsetId;
        const conRelsData = action.data;
        return SI.setIn(state, ["bySynsetId", originatingId],
                        conRelsData);
    }
    default:
        return state;
    }
}
