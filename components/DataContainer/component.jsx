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

import { makeActionsForContainer } from './actions';
import { dataContainerDefaultState } from './reducers';
import { InternalError } from '../../errors';

import React from 'react';
import { connect } from 'react-redux';

const CONTAINER_TYPES = {
    // props.data is an array (or other iterable) of data objects:
    ROWS: 'rows', 
    // props.data is a tree object, with further tree nodes in the
    // .children property:
    TREE: 'tree'  
};

// params:
//   type :: String, from CONTAINER_TYPES
//   name :: String, a name to use for the returned component;
//     'Container' will be appended
//   dataSelector :: globalState -> ownProps -> [ DataObject ]
//     a selector function to pull data objects from the Redux store into this container
//     It should return *undefined* if and only if the data is not yet
//     in the store. (By contrast, if the data is present in the store
//     but *empty*, the selector should return some other
//     empty-but-trueish-value, such as [] or {}.)
//   idFromItem (optional) :: DataObject -> identifier for that object.
//      By default, this function works like: item => item.id
function containerFor(type, name, dataSelector, idFromItem) {

    // Helpers for combining data with metadata from container state:
    
    const idFor = idFromItem || function (item) {
        const id = item.id;
        if (id === undefined) {
            const msg = 'Data container default idFromItem function got item without a .id';
            throw new InternalError(msg);
        }
        return id;
    };

    function isSelected(item, props) {
        if (Array.isArray(props.selectedItemIds)) {
            return props.selectedItemIds.includes(idFor(item));
        }
        return false;
    }

    function addMetadataToRows(rows, props) {
        return rows.map(
            item => ({ ...item,
                       chosen: props.chosenItemId === idFor(item),
                       selected: isSelected(item, props),
                     })
        );
    }

    function addMetadataToTree(node, props) {
        if (!node.children || !node.children.length) {
            return {
                ...node,
                chosen: props.chosenItemId === idFor(node),
                selected: isSelected(node, props),
            };
        } else {
            return {
                ...node,
                chosen: props.chosenItemId === idFor(node),
                selected: isSelected(node, props),
                children: node.children.map(child => addMetadataToTree(child, props))
            };
        }
    }

    // The actual component:
    
    function DataContainer(props) {
        if (props.data === undefined) return null;
        
        var dataWithMetadata;
        switch (type) {
        case CONTAINER_TYPES.ROWS: {
            dataWithMetadata = addMetadataToRows(props.data, props);
            break;
        }
        case CONTAINER_TYPES.TREE: {
            dataWithMetadata = addMetadataToTree(props.data, props);
            break;
        }
        default:
            throw new InternalError(`Unknown data container type: ${type}`);
        }

        if (typeof props.displayAs === 'function') {
            const Renderer = props.displayAs;
            return (
                <Renderer {...props} data={dataWithMetadata} />
            );
        } else {
            throw new InternalError('Data container was rendered with an incorrect displayAs prop');
        }
    }
    DataContainer.displayName = (name || 'Unnamed') + 'Container';

    // Connect the container with state from Redux store:

    // we want to allow data containers that don't have their own
    // unique .containerId, because they may be instantiated by other
    // components which may not be in a position to choose an ID for
    // them.  But the choose/select actions and associated state
    // depend on a container ID, so we only add functional versions of
    // these props if a container ID was supplied.

    function selectContainerState(globalState, ownProps) {
        // we always return dataContainerDefaultState, instead of
        // undefined, to ensure that we can always read props like
        // selectedItemIds downstream, even if there is no state for
        // this component in the store:
        try {
            return globalState.dataContainers.byId[ownProps.containerId] || dataContainerDefaultState;
        } catch (e) {
            return dataContainerDefaultState;
        }
    }

    function mapStateToProps(globalState, ownProps) {
        // TODO: allow passing data as a prop from a higher
        // component?  or allow selector to specified by the
        // instance, instead of in the component definition?  This
        // will be important if we ever need containers of the same
        // type whose data comes from different places

        // give the dataSelector access to the containerState props,
        // like chosenItemId; this is necessary because additional
        // data might need to be loaded into the container depending
        // on the container state, especially in containers for trees.
        const containerState = selectContainerState(globalState, ownProps);
        const data = dataSelector(globalState, {...ownProps, ...containerState});

        return {
            data,
            idFor,
            ...containerState
        };
    };
    
    function mapDispatchToProps(dispatch, ownProps) {
        if (ownProps.containerId) {
            const actions = makeActionsForContainer(ownProps.containerId);
            return {
                choose: itemId => dispatch(actions.choose(itemId)),
                unchoose: itemId => dispatch(actions.unchoose(itemId)),
                select: itemId => dispatch(actions.select(itemId)),
                unselect: itemId => dispatch(actions.unselect(itemId)), 
                reset: () => dispatch(actions.reset())
            };
        } else {
            function warn(method) {
                return function (itemId) {
                    throw new InternalError(`.${method}() was called with itemId = ${itemId}`+
                                            ` on a container with no .containerId`);
                };
            }
            return {
                choose: warn('choose'),
                unchoose: warn('unchoose'),
                select: warn('select'),
                unselect: warn('unselect'),
                reset: function() {
                    throw new InternalError('.reset() was called on a container with no .containerId');
                }
            };
        }
    }

    DataContainer.displayName = (name || 'Unnamed') + 'Container';
    return connect(mapStateToProps, mapDispatchToProps)(DataContainer);
}

// Public interfaces for constructing data containers of different types:

export function dataContainerFor(name, dataSelector, idFromItem) {
    return containerFor(CONTAINER_TYPES.ROWS, name, dataSelector, idFromItem);
}

export function treeContainerFor(name, dataSelector, idFromItem) {
    return containerFor(CONTAINER_TYPES.TREE, name, dataSelector, idFromItem);
}

