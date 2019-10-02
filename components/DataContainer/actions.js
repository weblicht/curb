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

// DataContainer/actions.js
// Action types and creators for DataContainer
import { actionTypesFromStrings } from '../../helpers';

export const actionTypes = actionTypesFromStrings([
    'DATA_CONTAINER_CHOOSE', // i.e., uniquely
    'DATA_CONTAINER_UNCHOOSE',
    'DATA_CONTAINER_SELECT', // i.e., possibly multiple selections
    'DATA_CONTAINER_UNSELECT',
    'DATA_CONTAINER_RESET'
])

// Action creators
export function choose(containerId, itemId) {
    return { type: actionTypes.DATA_CONTAINER_CHOOSE,
             id: containerId,
             itemId
           };
}
// an itemId is not really necessary for unchoosing, but we accept
// it for the sake of uniformity:
export function unchoose(containerId, itemId) {
    return { type: actionTypes.DATA_CONTAINER_UNCHOOSE,
             id: containerId,
             itemId
           };
}

export function select(containerId, itemId) {
    return { type: actionTypes.DATA_CONTAINER_SELECT,
             id: containerId,
             itemId
           };
}

export function unselect(containerId, itemId) {
    return { type: actionTypes.DATA_CONTAINER_UNSELECT,
             id: containerId,
             itemId
           };
}

export function reset(containerId) {
    return { type: actionTypes.DATA_CONTAINER_RESET,
             id: containerId
           };
}

// Wraps the above action creators for a given data container.
// params:
//   containerId, a unique identifier for the container
export function makeActionsForContainer(containerId) {

    return {
        choose: itemId => choose(containerId, itemId),
        unchoose: itemId => unchoose(containerId, itemId),
        select: itemId => select(containerId, itemId),
        unselect: itemId => unselect(containerId, itemId),
        reset: () => reset(containerId)
    }
}
