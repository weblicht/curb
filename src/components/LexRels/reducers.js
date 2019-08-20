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
                id: lr.lexRelId,
                originatingLexUnitId: originatingId,
                relatedLexUnitId: lr.lexUnitId,
            }).without('lexRelId', 'lexUnitId')
        );
        return SI.setIn(state, ["byLexUnitId", originatingId],
                        lexRelsData);
    }
    default:
        return state;
    }
}
