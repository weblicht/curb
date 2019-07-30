// GenericDisplay/component.jsx
// Definition of generic display components that are reused elsewhere

import { withNullAsString } from '../../helpers';
import { InternalError } from '../../errors';

import React from 'react';


// props:
//   data :: [ Object ]
//   displayItemAs :: Object -> HTML list item,
//     a component to display a single data object as an item in the list
//   ordered (optional) :: Bool
//   className (optional) :: String
export function DataList(props) {
    // TODO: is there any way to provide a sensible default, or must
    // the user always pass a custom component to render the list items?
    const ItemComponent = props.displayItemAs;
    
    return (
        <List ordered={props.ordered} className={props.className}>
          {props.data.map(
              item =>
                  <ItemComponent {...props} data={item}/>
          )}
        </List>
    );

}

// props:
//   data :: [ Object ]
//   displayItemAs :: Object -> HTML list item,
//     a component to display a single data object as an option in the select
//   disabledOption (optional) :: String,
//     a message to use as an initial, disabled option in the select
//   ordered (optional) :: Bool
//   className (optional) :: String
export function DataSelect(props) {
    // TODO: this component might belong somewhere else. It's not
    // purely a display component; it has to be hooked up to actions
    // for selecting the various options.

    // TODO: is there any way to provide a sensible default, or must
    // the user always pass a custom component to render the options?
    const ItemComponent = props.displayItemAs;
 
    return (
        <select className={props.className}>
          {props.disabledOption && <option value="none" disabled={true}>{props.disabledOption}</option>}
          {props.data.map(
              item => <ItemComponent {...props} data={item} />
          )}
        </select>
    );

}

// props:
//   fieldMap :: [ [String, String] ], array mapping data field names to display names
//   displayFields :: [ String ], array of data fields to be displayed
//     This should be a subset of the keys in fieldMap.
export function DataTableHeaders(props) {
    const fieldMapObj = Object.fromEntries(props.fieldMap);
    return (
        <thead>
          <tr>
            {props.displayFields.map(
                field => <th key={field} scope="col">{fieldMapObj[field]}</th>
            )}
          </tr>
        </thead>
    );
}

// props:
//   className :: String
//   displayFields :: [ String ] 
//   data :: Object, with at least the following properties:
//     .id :: an identifier
//     all the properties listed in displayFields
export function DataTableRow(props) {
    return (
        <tr key={props.data.id} id={props.data.id} className={props.className}>
              {props.displayFields.map(
                  (field) => <td>{ withNullAsString(props.data[field]) }</td>
              )}
        </tr>
    );
}

// props:
//   className :: String
//   fieldMap :: [ [String, String] ], array mapping data field names to display names
//   displayFields :: [ String ], array of data fields to be displayed
//     This should be a subset of the keys in fieldMap.
//   data :: [ Object ], the data objects which will be formattted as the rows of the table
//   displayRowAs (optional) :: Object -> HTML table row,
//      a component to display a single data object as a table row.
//      Defaults to DataTableRow.
export function DataTable(props) {
    const RowComponent = props.displayRowAs || DataTableRow;

    return (
        <table className={props.className}>
          <DataTableHeaders fieldMap={props.fieldMap} displayFields={props.displayFields}/>
          <tbody>
            {props.data.map(
                row => <RowComponent data={row} displayFields={props.displayFields}/>
            )}
          </tbody>
        </table>
    );
}

// props:
//   className :: String  (CSS class for dl)
//   terms :: [ String ]
//   defs :: [ String ]
// terms and defs should be co-indexed
export function DefList(props) {
    return (
        <dl className={props.className}>
                {props.terms.map(
                    (term, idx) =>
                        <React.Fragment key={term}>
                          <dt>{term}</dt>
                          <dd>{props.defs[idx]}</dd>
                        </React.Fragment>
                )}
        </dl>
    );
}


// props:
//   className :: String
//   data :: [ Object ]
//   delimiter (optional) :: String
//     prepended to all but the first element; defaults to ', '
//   displayItemAs (optional) :: data object -> String
//     defaults to withNullAsString helper
export function DelimitedArray(props) {
    const delim = props.delimiter || ', ';
    const formatter = props.displayItemAs || withNullAsString;
    const formattedItems = props.data.map(
        (el, idx) => (idx > 0 ? delim : '') + formatter(el)
    );

    return (
        <span className={props.className}>
          {"".concat(...formattedItems)}
        </span>
    );
}

// props:
//   ordered :: Bool
//   className (optional) :: String
export function List(props) {
    if (props.ordered) {
        return (<ol className={props.className}>{props.children}</ol>);
    } else {
        return (<ul className={props.className}>{props.children}</ul>);
    }
}


// HOC that abstracts the logic for data container components.   
// params:
//    name :: String, a name for the container type 
export function makeDisplayableContainer(name) {
    return function (props) {
        if (typeof props.displayAs === 'function') {
            const Renderer = props.displayAs;
            return (<Renderer {...props} />);
        } else {
            throw new InternalError(`${name} was rendered with an incorrect displayAs prop`);
        }
    };
}

