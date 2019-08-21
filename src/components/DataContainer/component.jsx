import { makeActionsForContainer } from './actions';
import { InternalError } from '../../errors';

import React from 'react';
import { connect } from 'react-redux';

// This is a module-global counter used to provide unique IDs to data
// containers, so that users don't have to provide these ids directly.
// These IDs are necessary to keep track of internal container state
// in Redux (e.g., which item is chosen, and which items are
// selected).  It would theoretically be better to keep this bit of
// state in the Redux store, but that would add quite a bit more
// complexity to this already-complex component definition.  Do not
// touch!
var _NEXT_CONTAINER_ID = 1;
function nextContainerId() {
    return _NEXT_CONTAINER_ID++;
}

// params:
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
export function dataContainerFor(name, dataSelector, idFromItem) {

    const idFor = idFromItem || function (item) {
        const id = item.id;
        if (id === undefined) {
            const msg = 'Data container default idFromItem function got item without a .id';
            throw new InternalError(msg);
        }
        return id;
    };

    // The component:
    function DataContainer(props) {
        if (props.data === undefined) return null;
        
        const dataWithMetadata = props.data.map(
            item => ({ ...item,
                       chosen: props.chosenItemId === idFor(item),
                       selected: props.selectedItemIds ? props.selectedItemIds.includes(idFor(item)) : false,
                     })
        );

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

    function selectContainerState(globalState, ownProps) {
        try {
            return globalState.dataContainers.byId[ownProps.containerId];
        } catch (e) {
            return undefined;
        }
    }

    function mapStateToProps(globalState, ownProps) {
        // TODO: allow passing data as a prop from a higher
        // component?  or allow selector to specified by the
        // instance, instead of in the component definition?  This
        // will be important if we ever need containers of the same
        // type whose data comes from different places
        const data = dataSelector(globalState, ownProps);
        return {
            data,
            idFor,
            ...selectContainerState(globalState, ownProps)
        };
    };
    
    function mapDispatchToProps(dispatch, ownProps) {
        const actions = makeActionsForContainer(ownProps.containerId);
        return {
            choose: itemId => dispatch(actions.choose(itemId)),
            unchoose: itemId => dispatch(actions.unchoose(itemId)),
            select: itemId => dispatch(actions.select(itemId)),
            unselect: itemId => dispatch(actions.unselect(itemId)), 
        };
    }

    const ConnectedContainer = connect(mapStateToProps, mapDispatchToProps)(DataContainer);

    // You may be wondering why this much indirection is necessary.
    // Explanation: we need to generate the container ID at the time
    // we *instantiate* a data container. But we also need to make
    // that ID available to selectContainerState, mapStateToProps, and
    // mapDispatchToProps, above.  Because of the way react-redux
    // calls these functions, the only way to do this is to define yet
    // another HOC that passes the container ID down as a prop to the
    // ConnectedContainer instance.
    function DataContainerIdGenerator(props) {
        const containerId = DataContainer.displayName + nextContainerId().toString();
        return (<ConnectedContainer {...props} containerId={containerId} />);
    };
    return DataContainerIdGenerator;
}
