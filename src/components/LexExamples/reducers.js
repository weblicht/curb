import { examplesActions } from './actions';

import SI from 'seamless-immutable';

const examplesActionTypes = examplesActions.actionTypes;
export function lexExamples(state = SI({}), action) {
    switch (action.type) {
    case examplesActionTypes.LEX_EXAMPLES_RETURNED: {
        const lexUnitId = action.params.lexUnitId;
        // reshape the data to store the frame id in the examples so
        // we don't need a separate slice of the store for frames.
        // TODO: can the backend do this for us instead?
        const frameData = action.data.frames;
        const examplesData = action.data.examples.map(
            (e, idx) => SI(e).merge({ frameId: frameData[idx].frameId})
        );
        return SI.setIn(state, ["byLexUnitId", lexUnitId],
                        examplesData);
    }
    default:
        return state;
    }
}

