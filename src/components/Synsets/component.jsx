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
const SYNSET_FIELD_MAP = [
    ['id', 'Synset Id'],
    ['wordCategory', 'Word Category'],
    ['wordClass', 'Word Class'],
    ['orthForms', 'All Orth Forms'],
    ['paraphrase', 'Paraphrase'],
    ['wiktionaryParaphrases', 'Wiktionary Paraphrases'],
    ['comment', 'Comment']
];
const SYNSET_ALL_FIELDS = SYNSET_FIELD_MAP.map(entry => entry[0]);

// Display components for individual synsets:

// props:
//   data :: Object containing a .wordClass field 
function WordClass(props) {
    return (
        <span className="wordClass">{props.data.wordClass}</span>
    );
}

// props:
//   data :: Object containing a .wordCategory field 
function WordCategory(props) {
    return (
        <span className="wordCategory">{props.data.wordCategory}</span>
    );
}

// props:
//    data :: Object, a synset
function SynsetAsListItem(props) {
    return (
        // TODO: is this a reasonable default?
        <ListItem id={props.data.id} extras="synset-detail">
          <Delimited data={props.data.orthForms} />
        </ListItem>
    );
}

// props:
//    data :: Object, a synset
function SynsetAsOption(props) {
    return (
        // TODO: what's the best data to display to disambiguate between synsets with the same orthforms?
        <option key={props.data.id} value={props.data.id}>
          {props.data.wordClass.wordClass}: {props.data.orthForms.join(', ')} 
        </option>
    );
}

// props:
//    data :: Object, a synset
//    displayFields :: [ String ], a list of data fields to render
// TODO: it *may* eventually be worth adding an additional generic
// abstraction for data tables that allows specifying a
// function/component for formatting the data in individual table
// cells, but for now, synsets are the only data type that needs
// special treatment at the level of individual cells, so I'm just
// providing a custom row component instead of using DataTableRow
function SynsetAsTableRow(props) {
    const displayFields = props.displayFields || SYNSET_ALL_FIELDS;
    return (
        <tr key={props.data.id} id={props.data.id}>

        {displayFields.map(
            function (field) {
                switch (field) {
                case 'wordCategory': {
                    return <td>{props.data.wordCategory.wordCategory}</td>;
                }
                case 'wordClass': {
                    return <td>{props.data.wordClass.wordClass}</td>;
                }
                case 'orthForms': {
                    return <td><Delimited data={props.data.orthForms} /></td>;
                }
                case 'wiktionaryParaphrases': {
                    return <td><Delimited data={props.data[field]} delimiter='; '/></td>;
                }
                default:
                    return <td>{withNullAsString( props.data[field] )}</td>;
                }
            }
        )
        }
        </tr>
    );
}

// Display components for an array of synset objects:

// props:
//   data :: [ Object ], the synsets
//   ordered (optional) :: Bool, whether the list should be ordered or unordered
//   displayItemAs (optional) :: Component to render a synset as a list item
//      Defaults to SynsetAsListItem
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
function SynsetsAsList(props) {
    return (
        <DataList data={props.data}
                  ordered={props.ordered}
                  choose={props.choose} unchoose={props.unchoose}
                  select={props.select} unselect={props.unselect}
                  extras="synsets-container"
                  displayItemAs={props.displayItemAs || SynsetAsListItem}/>
    );
}

// props:
//   id :: String, a name for the select element
//   data :: [ Object ], the synsets
//   choose :: Synset ID -> Action
//      Normally this should be the .choose prop of the data container being
//      displayed as a select element 
//   displayItemAs (optional) :: Component to render a synset as an option
//      Defaults to SynsetAsOption
function SynsetsAsSelect(props) {
    return (
        <DataSelect data={props.data}
                    id={props.id}
                    choose={props.choose} 
                    extras="synsets-container"
                    disabledOption="Select a synset"
                    displayItemAs={props.displayItemAs || SynsetAsOption}/> 
    );
}


// props:
//   data :: [ Object ], the synsets
//   fieldMap (optional) :: [ [String, String] ], maps synset field names to their display names
//   displayFields (optional) :: [ String ], the field names to be displayed
//   displayItemAs (optional) :: Component to render a synset as a table row
//      Defaults to SynsetAsTableRow.
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
function SynsetsAsTable(props) {
    return (
        <DataTable data={props.data} idFor={props.idFor}
                   choose={props.choose} unchoose={props.unchoose}
                   select={props.select} unselect={props.unselect}
                   fieldMap={props.fieldMap || SYNSET_FIELD_MAP}
                   displayFields={props.displayFields || SYNSET_ALL_FIELDS}
                   displayItemAs={props.displayItemAs || SynsetAsTableRow}
                   extras="synsets-container"
        />
    );
}
    

const SynsetsContainer = dataContainerFor('Synsets', selectSynsets);



export { SynsetsContainer,
         SynsetsAsList,
         SynsetsAsSelect,
         SynsetsAsTable,
         WordClass,
         WordCategory
       };

