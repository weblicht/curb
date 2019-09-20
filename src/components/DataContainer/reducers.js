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

export { dataContainerPrivState as dataContainerDefaultState };


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
