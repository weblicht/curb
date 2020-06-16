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

// Synsets/component.jsx
// Definitions of synset data container and display components 

import { selectSynsets } from './selectors';
import { dataContainerFor } from '../DataContainer/component';
import { DataTable,
         DataTableRow,
         Delimited,
         DataList,
         DataSelect,
         ListItem } from '../GenericDisplay/component';
import { withNullAsString } from '../../helpers';

import React from 'react';
import { connect } from 'react-redux';

// Constants:

// Maps all data fields in Synset objects to their display names.
export const SYNSET_FIELD_MAP = [
    ['id', 'Synset Id'],
    ['wordCategory', 'Word Category'],
    ['wordClass', 'Word Class'],
    ['orthForms', 'All Orth Forms'],
    ['paraphrase', 'Paraphrase'],
    ['wiktionaryParaphrases', 'Wiktionary Paraphrases'],
    ['comment', 'Comment']
];
export const SYNSET_ALL_FIELDS = SYNSET_FIELD_MAP.map(entry => entry[0]);

// Display components for individual synsets:

// props:
//    data :: DataObject, a synset
// className and extras props, if given, will be passed on to ListItem
function SynsetAsListItem(props) {
    return (
        // TODO: is this a reasonable default?
        <ListItem key={props.data.id}
                  className={props.className}
                  extras={props.extras}>
          <Delimited data={props.data.orthForms} />
        </ListItem>
    );
}

// props:
//    data :: DataObject, a synset
function SynsetAsOption(props) {
    return (
        // TODO: what's the best data to display to disambiguate between synsets with the same orthforms?
        <option key={props.data.id} value={props.data.id}>
          {props.data.wordClass}: {props.data.orthForms.join(', ')} 
        </option>
    );
}

// props:
//    data :: DataObject, a synset
//    displayFields :: [ String ], a list of data fields to render
// Other props accepted by DataTableRow are also passed on to it.
// TODO: it *may* eventually be worth adding an additional generic
// abstraction for data tables that allows specifying a
// function/component for formatting the data in individual table
// cells, but for now, synsets are the only data type that needs
// special treatment at the level of individual cells, and that need
// will hopefully go away soon; so I'm just providing a custom row
// component for now
function SynsetAsTableRow(props) {
    const displayFields = props.displayFields;
    const displayData = Object.fromEntries(
        displayFields.map(
            function (field) {
                switch (field) {
                case 'wordCategory': {
                    return [field, props.data.wordCategory];
                }
                case 'wordClass': {
                    return [field, props.data.wordClass];
                }
                case 'orthForms': {
                    return [field, props.data.orthForms.filter(o => o !== null).join(', ')];
                }
                case 'wiktionaryParaphrases': {
                    return [field, props.data.wiktionaryParaphrases.filter(o => o !== null).join('; ')];
                }
                default:
                    return [field, withNullAsString(props.data[field])];
                }
            }).concat([
                // also pass on data container metadata as-is so that
                // DataTableRow can highlight selected rows:
                ['chosen', props.data.chosen],
                ['selected', props.data.selected]
            ]));

    return (
        <DataTableRow {...props} data={displayData} displayFields={displayFields}  />
    );
}

// Display components for an array of synset objects:

// props:
//   data :: [ DataObject ], the synsets
//   ordered (optional) :: Bool, whether the list should be ordered or unordered
//   displayItemAs (optional) :: Component to render a synset as a list item
//      Defaults to SynsetAsListItem
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
// Other props will also be passed on to DataList, including:
//   className, extras, itemClassName, itemExtras   
function SynsetsAsList(props) {
    return (
        <DataList {...props} displayItemAs={props.displayItemAs || SynsetAsListItem} />
    );
}

// props:
//   id :: String, a name for the select element
//   data :: [ DataObject ], the synsets
//   choose :: Synset ID -> Action
//      Normally this should be the .choose prop of the data container being
//      displayed as a select element 
//      Note: other data container props are *not* passed on, since they don't
//      make sense in the context of a unique-choice <select> element
//   displayItemAs (optional) :: Component to render a synset as an option
//      Defaults to SynsetAsOption
// Other props will also be passed on to DataSelect
function SynsetsAsSelect(props) {
    return (
        <DataSelect {...props}
                    disabledOption="Select a synset"
                    displayItemAs={props.displayItemAs || SynsetAsOption}/> 
    );
}


// props:
//   data :: [ DataObject ], the synsets
//   fieldMap (optional) :: [ [String, String] ], maps synset field names to their display names
//   displayFields (optional) :: [ String ], the field names to be displayed
//   displayItemAs (optional) :: Component to render a synset as a table row
//      Defaults to SynsetAsTableRow.
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
// Other props will also be passed on to DataTable, including:
//   className, extras
//   headClassName, headExtras
//   bodyClassName, bodyExtras 
function SynsetsAsTable(props) {
    return (
        <DataTable {...props}
                   fieldMap={props.fieldMap || SYNSET_FIELD_MAP}
                   displayFields={props.displayFields || SYNSET_ALL_FIELDS}
                   displayItemAs={props.displayItemAs || SynsetAsTableRow} />
    );
}
    

const SynsetsContainer = dataContainerFor('Synsets', selectSynsets);



export { SynsetsContainer,
         SynsetsAsList,
         SynsetsAsSelect,
         SynsetsAsTable,
         SynsetAsTableRow
       };

