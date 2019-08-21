import { framesQueries } from './actions';
import { selectFrames } from './selectors';
import { DataList,
         DataSelect,
         DataTable,
         DefList,
         ListItem } from '../GenericDisplay/component';
import { dataContainerFor } from '../DataContainer/component';
import { connectWithApiQuery } from '../APIWrapper';

import React from 'react';

// Maps all data fields in Frame objects to their display names.
const FRAME_FIELD_MAP = [
    ['frameId', 'Frame Id'],
    ['frameType', 'Frame Type'],
];
const FRAME_ALL_FIELDS = FRAME_FIELD_MAP.map(entry => entry[0]);

// Display components for individual frames:

// props:
//   data :: DataObject, a frame 
function FrameAsListItem(props) {
    return (
        // TODO: is this a reasonable default?
        <ListItem id={props.data.frameId}
                  extras="frames-detail">
          {props.data.frameType}
        </ListItem>
    );
}

// Display components for an array of frame objects:

// props:
//   data :: [ DataObject ], the frames
//   ordered (optional) :: Bool, whether the list should be ordered or unordered
//   displayItemAs (optional) :: Component to render an frame as a list item
//      Defaults to FrameAsListItem
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
function FramesAsList(props) {
    return (
        <DataList data={props.data} idFor={props.idFor}
                  choose={props.choose} unchoose={props.unchoose}
                  select={props.select} unselect={props.unselect}
                  ordered={props.ordered}
                  extras="frames-container"
                  displayItemAs={props.displayItemAs || FrameAsListItem}/>
    );
}


// props:
//   data :: [ DataObject ], the frames 
//   fieldMap (optional) :: [ [String, String] ], maps frame field names to their display names
//   displayFields (optional) :: [ String ], the field names to be displayed
//   displayItemAs (optional) :: Component to render an frame as a table row
//      Defaults to DataTableRow.
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
function FramesAsTable(props) {
    return (
        <DataTable data={props.data} idFor={props.idFor}
                   choose={props.choose} unchoose={props.unchoose}
                   select={props.select} unselect={props.unselect}
                   fieldMap={props.fieldMap || FRAME_FIELD_MAP}
                   displayFields={props.displayFields || FRAME_ALL_FIELDS}
                   displayItemAs={props.displayItemAs}
                   extras="frames-container"
        />
    );
}
 
// props:
//   queryParams :: { lexUnitId: ... }
var FramesContainer = dataContainerFor('Frames', selectFrames, frame => frame.frameId);
FramesContainer = connectWithApiQuery(FramesContainer, framesQueries.queryActions);

export { FramesContainer,
         FramesAsList,
         FramesAsTable }; 

