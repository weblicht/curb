import { makeActionsForContainer } from './actions';
import { selectContainerState } from './selectors';
import { InternalError } from '../../errors';

import React from 'react';
import { connect } from 'react-redux';

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
                // We avoid passing container id to renderer so it doesn't get
                // propagated to other containers down the tree:
                <Renderer {...props} id={undefined} data={dataWithMetadata} />
            );
        } else {
            throw new InternalError('Data container was rendered with an incorrect displayAs prop');
        }
    }

    // we want to allow data containers that don't have their own
    // unique .id, because they may be instantiated by other
    // components which may not be in a position to choose an ID for
    // them.  But the choose/select actions and associated state
    // depend on a container ID, so we only add these props if a
    // container ID was supplied.
     function mapStateToProps(globalState, ownProps) {
         // TODO: allow passing data as a prop from a higher
         // component?  or allow selector to specified by the
         // instance, instead of in the component definition?  This
         // will be important if we ever need containers of the same
         // type whose data comes from different places
         const data = dataSelector(globalState, ownProps);
         if (ownProps.id) {
             return {
                 data,
                 idFor,
                 ...selectContainerState(globalState, ownProps)
             };
         } else {
             return { data, idFor };
         }
    };

    function mapDispatchToProps (dispatch, ownProps) {
       if (ownProps.id) {
            const actions = makeActionsForContainer(ownProps.id);
            return {
                choose: itemId => dispatch(actions.choose(itemId)),
                unchoose: itemId => dispatch(actions.unchoose(itemId)),
                select: itemId => dispatch(actions.select(itemId)),
                unselect: itemId => dispatch(actions.unselect(itemId)), 
            };
        } else {
            return {};
        }
    }

    DataContainer.displayName = (name || 'Unnamed') + 'Container';
    return connect(mapStateToProps, mapDispatchToProps)(DataContainer);
}
