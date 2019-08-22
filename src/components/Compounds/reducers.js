import { compoundsQueries } from './actions';
import { makeSimpleApiReducer } from '../APIWrapper';

import SI from 'seamless-immutable';

const queryActionTypes = compoundsQueries.actionTypes;

// converts a 'notSplitted' data field code to a more workable Boolean
function isCompound(code) {
    switch (code) {
    case 1:
        return false; // i.e., lexunit is not a compound; do not split
    case 2:
        return true; // i.e., lexunit is a compound; it splits
    default: 
        return undefined; // 0, i.e., record has not been worked on yet
    }
}

export function compounds(state = SI({}), action) {
    switch (action.type) {
    case queryActionTypes.COMPOUNDS_RETURNED: {
        const originatingId = action.params.lexUnitId;
        const compoundsData = action.data.map(
            c => SI(c).merge({
                // we use the corresponding lexunit ID as an
                // identifier, because there is a 1:1 relationship
                // between compound records and lexunit records.
                // (The backend does not return the compounds table id.) 
                id: originatingId, 
                lexUnitId: originatingId,
                splits: isCompound(c.notSplitted)
            }).without('compoundLexUnitId', 'notSplitted')
        );
        return SI.setIn(state, ["byLexUnitId", originatingId],
                        compoundsData);
    }
    default:
        return state;
    }
}
