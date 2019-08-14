import { lexRelsActions } from './actions';

import SI from 'seamless-immutable';

const lexRelsActionTypes = lexRelsActions.actionTypes;

export function lexRels(state = SI({}), action) {
    switch (action.type) {
    case lexRelsActionTypes.LEX_RELS_RETURNED: {
        // the data format from the backend is presently a bit
        // confusing: there is a "lexUnitId" field which corresponds to
        // the *other* relatum (i.e., not the ID that was used
        // to make the request). Thus, we reshape it a bit here for
        // clarity.
        const originatingId = action.params.lexUnitId;
        const lexRelsData = action.data.lexRels.map(
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
