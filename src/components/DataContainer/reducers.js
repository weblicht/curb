// DataContainer/reducers.js
// State management for DataContainer state 

import { actionTypes } from './actions';
import { makeByIdReducer } from '../../helpers';
import { InternalError } from '../../errors';

import SI from 'seamless-immutable';

const dataContainerPrivState = SI({
    chosenItemId: undefined,
    selectedItemIds: [],
});


// Manages a private state tree for a data container
function dataContainerPrivReducer(state = dataContainerPrivState, action) {
    switch (action.type) {

    case actionTypes.DATA_CONTAINER_CHOOSE: {
        return state.merge({
            chosenItemId: action.itemId
        });
    }

    case actionTypes.DATA_CONTAINER_UNCHOOSE: {
        return state.merge({
            chosenItemId: undefined
        });
    }

    case actionTypes.DATA_CONTAINER_SELECT: {
        const selectedId = action.itemId;

        if (state.selectedItemIds.includes(selectedId)) {
            return state; // don't select an item more than once
        } else {
            return state.merge({
                selectedItemIds: state.selectedItemIds.concat(selectedId)
            });
        }
    }

    case actionTypes.DATA_CONTAINER_UNSELECT: {
        const unselectedId = action.itemId;

        return state.merge({
            selectedItemIds: state.selectedItemIds.filter(itemId => itemId !== unselectedId)
        });
    }

    default:
        return state;
    }
}

const dataContainers = makeByIdReducer(dataContainerPrivReducer, actionTypes);

export { dataContainers };
