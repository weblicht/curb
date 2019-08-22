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
            // Reshape the data from the backend for easier lookup
            // and display.
            c => SI({
                // We use the corresponding lexunit ID as an
                // identifier, because there is a 1:1 relationship
                // between compound records and lexunit records.  (The
                // backend does not return the record id in the
                // compounds table.)
                id: originatingId, 
                lexUnitId: originatingId,
                splits: isCompound(c.notSplitted),
                head: {
                    lemma: c.head,
                    id: c.idHead,
                    property: c.propertyHead
                },
                modifier1: {
                    lemma: c.mod1,
                    id: c.idMod1,
                    id2: c.id2Mod1,
                    id3: c.id3Mod1,
                    property: c.propertyMod1,
                    category: c.categoryMod1
                },
                modifier2: {
                    lemma: c.mod2,
                    id: c.idMod2,
                    id2: c.id2Mod2,
                    id3: c.id3Mod2,
                    property: c.propertyMod2,
                    category: c.categoryMod2
                }

            })
        );
        return SI.setIn(state, ["byLexUnitId", originatingId],
                        compoundsData);
    }
    default:
        return state;
    }
}
