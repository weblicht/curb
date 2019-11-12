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

import { conRelsQueries } from './actions';
import { selectConRels, selectHyponymsTree, selectHypernymsTree, selectHnymsTrees } from './selectors';
import { DataList, DataTable, ListItem } from '../GenericDisplay/component';
import { VerticalTreeGraph, VerticalDoubleTreeGraph } from '../Graphs/component';
import { dataContainerFor, treeContainerFor } from '../DataContainer/component';
import { connectWithApiQuery } from '../APIWrapper';

import React from 'react';

export const CON_REL_FIELD_MAP = [
    ['id', 'ConRel Id'],
    ['relType', 'Type'],
    ['fromOrthForms', 'From Orth Forms'],
    ['toOrthForms', 'To Orth Forms'],
    ['numHyponyms', 'Hyponyms'],
    ['canBeDeleted', 'Can be deleted'],
    ['fromSynsetId', 'From Synset'],
    ['toSynsetId', 'To Synset'],
];
export const CON_REL_ALL_FIELDS = CON_REL_FIELD_MAP.map( entry => entry[0] );

// props:
//   data :: DataObject, a conrel
// className and extras props, if given, will be passed on to ListItem
function ConRelAsListItem(props) {
    // TODO: is there a more sensible default to provide here?
    const relDisplay = props.data.relType.replace('_', ' ');
    return (
        <ListItem id={props.data.id}
                  className={props.className}
                  extras={props.extras}>
          {`Synset ${props.data.fromSynsetId} ${relDisplay} Synset ${props.data.toSynsetId}`}
        </ListItem>
    ); 
}


// props:
//   data :: [ DataObject ], the conrels
//   ordered :: Bool, whether the list should be ordered
//   displayItemAs (optional) :: Component to render a ConRel as a list item
//      Defaults to ConRelAsListItem
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
// Other props will also be passed on to DataList, including:
//   className, extras, itemClassName, itemExtras   
function ConRelsAsList(props) {
    return (
        <DataList {...props} displayItemAs={props.displayItemAs || ConRelAsListItem} />
    );
}

// props:
//   data :: [ DataObject ], the conrels
//   fieldMap (optional) :: [ [String, String] ], maps ConRel field names to their display names
//   displayFields (optional) :: [ String ], the field names to be displayed
//   sortFields (optional) :: [ String ], field names to display sort buttons for
//   sortWith (required for sortFields) :: callback that receives sort comparison function
//   displayItemAs (optional) :: Component to render a ConRel as a table row
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
// Other props will also be passed on to DataTable, including:
//   className, extras
//   headClassName, headExtras
//   bodyClassName, bodyExtras 
function ConRelsAsTable(props) {
    return (
        <DataTable {...props}
                   fieldMap={props.fieldMap || CON_REL_FIELD_MAP}
                   displayFields={props.displayFields || CON_REL_ALL_FIELDS} />
    );
}

// props:
//   queryParams :: { synsetId: ... }
var ConRelsContainer = dataContainerFor('ConRels', selectConRels);
ConRelsContainer = connectWithApiQuery(ConRelsContainer, conRelsQueries.queryActions);

var HyponymsTree = treeContainerFor('Hyponyms', selectHyponymsTree);
HyponymsTree = connectWithApiQuery(HyponymsTree, conRelsQueries.queryActions);

var HypernymsTree = treeContainerFor('Hypernyms', selectHypernymsTree);
HypernymsTree = connectWithApiQuery(HypernymsTree, conRelsQueries.queryActions);

var HnymsTree = treeContainerFor('HyperAndHyponyms', selectHnymsTrees);
HnymsTree = connectWithApiQuery(HnymsTree, conRelsQueries.queryActions);

// Not a component; rather, it uses props to make a click handler
// function, shared by the graph display components below
function makeNodeClickHandler(props) {
    return function expandOrCollapseNode(d) {
        const synset = d.data; // the original node, 
        const synsetId = synset.id;
        if (synset.selected) {
            props.unselect(synsetId);
        } else {
            props.select(synsetId);
            props.query({ synsetId });
        }
    };
}

// props:
//   nodeClickHandler (optional): d3 event handler function to handle
//     clicks on nodes in the graph. The function should accept a d3
//     'datum'; the original synset object for the clicked node is
//     available on the datum's .data property.  If not passed, a
//     default click handler is used which 'selects' clicked nodes.
//     Selected nodes have their related hyper- or hypo-nyms displayed
//     in the graph.
//     
// These props, if given, will be passed on to VerticalDoubleTreeGraph:
//   margin
//   width
//   height
//   nodes
//   links 
//   forceRedraw
function HnymsGraph(props){
    return (
        <VerticalDoubleTreeGraph upwardTree={props.data.children[0]}
                                 downwardTree={props.data.children[1]}
                                 margin={props.margin}
                                 width={props.width}
                                 height={props.height}
                                 nodes={props.nodes}
                                 links={props.links}
                                 forceRedraw={props.forceRedraw}
                                 nodeClickHandler={props.nodeClickHandler || makeNodeClickHandler(props)} />
    );
}

function HyponymsGraph(props){
    return (
        <VerticalTreeGraph tree={props.data}
                           flip={false}
                           margin={props.margin}
                           width={props.width}
                           height={props.height}
                           nodes={props.nodes}
                           links={props.links}
                           forceRedraw={props.forceRedraw}
                           nodeClickHandler={props.nodeClickHandler || makeNodeClickHandler(props)}/>
    );
}

function HypernymsGraph(props){
    return (
        <VerticalTreeGraph tree={props.data}
                           flip={true}
                           margin={props.margin}
                           width={props.width}
                           height={props.height}
                           nodes={props.nodes}
                           links={props.links}
                           forceRedraw={props.forceRedraw}
                           nodeClickHandler={props.nodeClickHandler || makeNodeClickHandler(props)}/>

    );
}

export { ConRelsContainer,
         ConRelsAsList,
         ConRelsAsTable,
         HyponymsTree,
         HypernymsTree,
         HnymsTree,
         HyponymsGraph,
         HypernymsGraph,
         HnymsGraph
       };

