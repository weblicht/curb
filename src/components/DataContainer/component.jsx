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
//   idFromItem (optional) :: DataObject -> identifier for that object.
//      By default, this function works like: item => item.id
export function dataContainerFor(name, dataSelector, idFromItem) {

    const idFrom = idFromItem || function (item) {
        const id = item.id;
        if (id === undefined) {
            const msg = 'Data container default idFromItem function got item without a .id';
            throw new InternalError(msg);
        }
        return id;
    };


    // The component:
    function DataContainer(props) {
        const dataWithMetadata = props.data.map(
            item => ({ ...item,
                       chosen: props.chosenItemId === idFrom(item),
                       selected: props.selectItemIds ? props.selectedItemIds.includes(idFrom(item)) : false,
                     })
        );

        if (typeof props.displayAs === 'function') {
            // avoid passing container id to renderer so it doesn't get
            // propagated to other containers down the tree:
            const Renderer = props.displayAs;
            return (<Renderer {...props} id={undefined} data={dataWithMetadata} />);
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
         // TODO: allow passing data as a prop from a higher component?
         // TODO: dataSelector should be allowed to be given as a prop(??), to allow *instances* to have different data selection logic
         //   at present, the only need I have for this would be to select synsets from the search box or from the apidata tree.
         //   but maybe that could be solved if I simply do the right thing and load the search result data into the apidata tree.
         const data = dataSelector(globalState, ownProps);
         if (ownProps.id) {
             return {
                 data,
                 ...selectContainerState(globalState, ownProps)
             };
         } else {
             return { data };
         }
    };

    function mapDispatchToProps (dispatch, ownProps) {
       if (ownProps.id) {
            const actions = makeActionsForContainer(ownProps.id);
            return {
                choose: itemId => dispatch(actions.choose(itemId)),
                select: itemId => dispatch(actions.select(itemId)),
                unselect: itemId => dispatch(actions.unselect(itemId)), 
            };
        } else {
            return {};
        }
    }


    const Connected = connect(mapStateToProps, mapDispatchToProps)(DataContainer);
    Connected.displayName = (name || 'Unnamed') + 'Container';

    return Connected;
}

