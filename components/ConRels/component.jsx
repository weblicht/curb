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
    ['conRelType', 'Type'],
    ['allOrthForms', 'All Orth Forms'],
    ['numHyponyms', 'Hyponyms'],
    ['canBeDeleted', 'Can be deleted'],
    ['originatingSynsetId', 'From Synset'],
    ['relatedSynsetId', 'To Synset'],
];
export const CON_REL_ALL_FIELDS = CON_REL_FIELD_MAP.map( entry => entry[0] );

// props:
//   data :: DataObject, a conrel
// className and extras props, if given, will be passed on to ListItem
function ConRelAsListItem(props) {
    // TODO: is there a more sensible default to provide here?
    const relDisplay = props.data.conRelType.replace('_', ' ');
    return (
        <ListItem id={props.data.id}
                  className={props.className}
                  extras={props.extras}>
          {`Synset ${props.data.originatingSynsetId} ${relDisplay} Synset ${props.data.relatedSynsetId}`}
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
// These props, if given, will also be passed on to DataList:
//   className, extras, itemClassName, itemExtras   
function ConRelsAsList(props) {
    return (
        <DataList data={props.data}
                  ordered={props.ordered}
                  choose={props.choose} unchoose={props.unchoose}
                  select={props.select} unselect={props.unselect}
                  displayItemAs={props.displayItemAs || ConRelAsListItem}
                  className={props.className}
                  extras={props.extras}
                  itemClassName={props.itemClassName}
                  itemExtras={props.itemExtras}
        />
    );
}

// props:
//   data :: [ DataObject ], the conrels
//   fieldMap (optional) :: [ [String, String] ], maps ConRel field names to their display names
//   displayFields (optional) :: [ String ], the field names to be displayed
//   displayItemAs (optional) :: Component to render a ConRel as a table row
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
// These props, if given, will also be passed on to DataTable:
//   className, extras
//   headClassName, headExtras
//   bodyClassName, bodyExtras 
function ConRelsAsTable(props) {
    return (
        <DataTable data={props.data} idFor={props.idFor}
                   choose={props.choose} unchoose={props.unchoose}
                   select={props.select} unselect={props.unselect}
                   fieldMap={props.fieldMap || CON_REL_FIELD_MAP}
                   displayFields={props.displayFields || CON_REL_ALL_FIELDS}
                   displayItemAs={props.displayItemAs}
                   className={props.className} extras={props.extras}
                   headClassName={props.headClassName} headExtras={props.headExtras}
                   bodyClassName={props.bodyClassName} bodyExtras={props.bodyExtras} />
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

function HnymsGraph(props){
    return (
        <VerticalDoubleTreeGraph upwardTree={props.data.children[0]}
                                 downwardTree={props.data.children[1]}
                                 nodeClickHandler={makeNodeClickHandler(props)} />
    );
}

function HyponymsGraph(props){
    return (
        <VerticalTreeGraph tree={props.data}
                           flip={false}
                           nodeClickHandler={makeNodeClickHandler(props)}/>
    );
}

function HypernymsGraph(props){
    return (
        <VerticalTreeGraph tree={props.data}
                           flip={true}
                           nodeClickHandler={makeNodeClickHandler(props)}/>
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

