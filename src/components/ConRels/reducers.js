import { conRelsActions } from './actions';

import SI from 'seamless-immutable';

const conRelsActionTypes = conRelsActions.actionTypes;

export function conRels(state = SI({}), action) {
    switch (action.type) {
    case conRelsActionTypes.CON_RELS_RETURNED: {
        // the data format from the backend is presently a bit
        // confusing: there is a "synsetId" field which corresponds to
        // the *other* relatum (i.e., not the synset ID that was used
        // to make the request). Thus, we reshape it a bit here for
        // clarity.
        const originatingId = action.params.synsetId;
        const conRelsData = action.data.data.map(
            cr => SI(cr).merge({
                id: cr.conRelId,
                originatingSynsetId: originatingId,
                relatedSynsetId: cr.synsetId,
            }).without('conRelId', 'synsetId')
        );
        return SI.setIn(state, ["bySynsetId", originatingId],
                        conRelsData);
    }
    default:
        return state;
    }
}
