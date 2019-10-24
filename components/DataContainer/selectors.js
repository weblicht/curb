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

import { dataContainerDefaultState } from './reducers';

// We want to allow data containers that don't have their own unique
// .containerId, because they may be instantiated by other components
// which may not be in a position to choose an ID for them.  But the
// choose/select actions and associated state depend on a container
// ID, so we only return functional versions of these props if a
// container ID was supplied.  We always return
// dataContainerDefaultState, instead of undefined, to ensure that we
// can always read props like selectedItemIds downstream, even if
// there is no state for this component in the store.
export function selectContainerState(globalState, ownProps) {
    try {
        return globalState.dataContainers.byId[ownProps.containerId] || dataContainerDefaultState;
    } catch (e) {
        return dataContainerDefaultState;
    }
}

// convenience accessor for the chosenItemId in a given container 
export function selectChosenIdIn(globalState, containerId) {
    try {
        return globalState.dataContainers.byId[containerId].chosenItemId;
    } catch (e) {
        return undefined;
    } 
}
