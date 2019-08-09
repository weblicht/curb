// GenericDisplay/component.jsx
// Definition of generic display components that are reused elsewhere

import { withNullAsString } from '../../helpers';
import { InternalError } from '../../errors';

import React from 'react';
import classNames from 'classnames';

// helper for constructing className prop.  The convention is:
// props.className, if given, *replaces* the default class name;
// props.extras, if given, are *added* to the class name.
// See the README for motivation and examples for this convention.
function withDefault(dfault, props) {
    return classNames(props.className || dfault, props.extras);
}

// props:
//   id :: String
//   text (optional) :: String to use as button text; defaults to props.children
//   onClick :: Event handler function
//   type (optional) :: String, defaults to 'button'
//   className (optional), defaults to 'btn'
//   extras (optional), extra classes for button input
export function Button(props) {
    return (
          <button type={props.type || 'button'}
                  name={props.id}
                  className={withDefault('btn', props)}
                  onClick={props.onClick}>
            {props.text || props.children}
          </button>
    );
}

// props:
//   id :: String
//   onChange :: Event handler function
//   checked :: Bool
//   label :: String
//   className (optional), defaults to 'form-check-input'
//   extras (optional), extra classes for checkbox input
//   labelClassName (optional), defaults to 'form-check-label'
//   labelExtras (optional), extra classes for label 
export function Checkbox(props) {
    return (
        <React.Fragment>
          <input type='checkbox'
                 name={props.id}
                 className={withDefault('form-check-input', props)}
                 onChange={props.onChange}
                 checked={props.checked}
          />
          <label className={
              withDefault('form-check-label', {
                  className: props.labelClassName,
                  extras: props.labelExtras
              })}
                 htmlFor={props.id}>
            {props.label}
          </label>
        </React.Fragment>
    );
}
 
// props:
//   id :: String
//   label :: String
//   onChange :: Event handler function
//   value (optional) :: String
//   placeholder (optional) :: String
//   autoFocus (optional) :: Bool
//   className (optional), defaults to 'form-control'
//   extras (optional), extra classes for text input
//   labelClassName (optional),  defaults to 'sr-only'
//   labelExtras (optional), extra classes for label 
export function TextInput(props) {
    return (
        <React.Fragment>
          <label className={
              withDefault('sr-only', {
                  className: props.labelClassName,
                  extras: props.labelExtras
              })}
                 htmlFor={props.id}>
            {props.label}
          </label>
          <input type='text'
                 name={props.id}
                 className={withDefault('form-control', props)}
                 onChange={props.onChange}
                 value={props.value || ''}
                 placeholder={props.placeholder || ''}
                 autoFocus={props.autoFocus || false}
          />
        </React.Fragment>
    );
}

// props:
//   title (optional) :: String
//   level (required only if title given) :: Number, the level of the card heading 
//   children :: used as content for body of card
//   extras
//   bodyExtras, extras for card body
//   Note: className does nothing here, since there is no reason to use this component *except* for the .card* classes it introduces
export function Card(props) {
    return (
        <div className={classNames('card', props.extras)}>
          <div className={classNames('card-body', props.bodyExtras)}>
            {props.title && <Heading level={props.level} className='card-title' data={props.title}/>}
            {props.children}
          </div>
        </div>
    );
}

// props:
//   children :: used as content for footer of card
//   extras
//   Note: className does nothing here, since there is no reason to use this component *except* for the .card* classes it introduces
export function CardFooter(props) {
    return (
        <div className={classNames('card-footer', props.extras)}>
            {props.children}
        </div>
    );
}

// props:
//   children :: used as content for header of card
//   extras
//   Note: className does nothing here, since there is no reason to use this component *except* for the .card* classes it introduces
export function CardHeader(props) {
    return (
        <div className={classNames('card-header', props.extras)}>
            {props.children}
        </div>
    );
}

// props:
//   data :: [ Object ]
//   displayItemAs (optional) :: Object -> HTML list item,
//     a component to display a single object as an item in the list;
//     defaults to ListItem
//     All data container control props (.choose, .select, etc.) will also
//     be passed on to this component if they are given.
//   ordered (optional) :: Bool
//   className (optional)
//   extras (optional)
//   itemClassName (optional), passed to item formatting component as className
//   itemExtras (optional), passed to item formatting component as extras
//   
export function DataList(props) {
    if (!(props.data && props.data.length)) return null;

    const ItemComponent = props.displayItemAs || ListItem;
    return (
        <List ordered={props.ordered} className={props.className} extras={props.extras}>
          {props.data.map(
              item => <ItemComponent data={item}
                                     idFor={props.idFor}
                                     choose={props.choose} unchoose={props.unchoose}
                                     select={props.select} unselect={props.unselect}
                                     className={props.itemClassName} extras={props.itemExtras}/>
          )}
        </List>
    );

}

// props:
//   id :: String
//   label :: String
//   data :: [ Object ]
//   choose, callback to choose an item given its unique identifier
//       Normally this should be the .choose prop of a DataContainer
//   displayItemAs :: Object -> HTML option or option group,
//     a component to display a single data object as an option in the select
//     Note: The option's value attribute should be an identifier to pass to choose
//   disabledOption (optional) :: String,
//     a message to use as an initial, disabled option in the select
//   className (optional), defaults to 'form-control' 
//   extras (optional)
//   itemClassName (optional), passed to item formatting component as className
//   itemExtras (optional), passed to item formatting component as extras
//   labelClassName (optional),  defaults to 'sr-only'
//   labelExtras (optional), extra classes for label 
export function DataSelect(props) {
    if (!(props.data && props.data.length)) return null;
    // TODO: is there any way to provide a sensible default, or must
    // the user always pass a custom component to render the options?
    const ItemComponent = props.displayItemAs;

    function chooseItem(e) {
        const itemId = e.target.value;
        props.choose(itemId);
    }
 
    return (
        <React.Fragment>
          <label className={classNames('sr-only' || props.labelClassName, props.labelExtras)}
                 htmlFor={props.id}>
            {props.label}
          </label>
          <select name={props.id}
                  className={withDefault('form-control', props)}
                  onChange={chooseItem}>
            {props.disabledOption && <option value="none" disabled={true}>{props.disabledOption}</option>}
            {props.data.map(
                item => <ItemComponent data={item} className={props.itemClassName} extras={props.itemExtras} />
            )}
          </select>
        </React.Fragment>
    );

}

// props:
//    data :: [ Object ]
//       Normally, these should be the objects in some data container.
//       Exactly one object should have .chosen == True.  The first item
//       will be chosen by default.
//    itemToTabId :: Object -> String, a function mapping data objects to unique identifiers
//    itemToTabText :: Object -> String, a function mapping data objects to tab button text
//    choose, callback to choose tab for an item given its (tab) Id
//       Normally this should be the .choose prop of a DataContainer
//    displayItemAs, component to display an item as tab pane content
//
export function DataTabbedPanes(props) {
    if (!(props.data && props.data.length)) return null;

    const ItemRenderer = props.displayItemAs;

    var chosenSeen = false;
    const dataWithTabs = props.data.map(
        item => {
            chosenSeen = chosenSeen || item.chosen;
            const tabId = props.itemToTabId(item);
            const tabRef = "#" + tabId;
            const tabName = tabId + "-tab";
            return { tabId, tabRef, tabName, ...item };
        });

    function activateTab(e) {
        e.preventDefault();
        const tabId = e.target.getAttribute('data-id');
        props.choose(tabId);
    }

    return (
        <>
          <List ordered={false} className="nav nav-tabs">
            {dataWithTabs.map(
                (item, idx) => 
                    <ListItem key={item.id} className="nav-item">
                      <a className={classNames("nav-link", { active: chosenSeen ? item.chosen : idx === 0 })}
                         data-id={item.tabId}
                         href={item.tabRef}
                         role="tab"
                         aria-controls={item.tabId}
                         aria-selected={item.selected}
                         onClick={activateTab}
                      >
                        {props.itemToTabText(item)} 
                      </a>
                    </ListItem>
                
            )}
          </List>
          <div className="tab-content">
            {dataWithTabs.map(
                (item, idx) =>
                    (<div className={classNames("tab-pane", { active: chosenSeen ? item.chosen : idx === 0 })}
                          data-id={item.tabId}
                          role="tabpanel"
                          aria-labelledby={item.tabName}>
                       <ItemRenderer data={item} />
                     </div>) 
            )}
          </div>
        </>
    );
}

// props:
//   fieldMap :: [ [String, String] ], array mapping data field names to display names
//   displayFields :: [ String ], array of data fields to be displayed
//     This should be a subset of the keys in fieldMap.
//   className (optional)
//   extras (optional
export function DataTableHeaders(props) {
    const fieldMapObj = Object.fromEntries(props.fieldMap);
    return (
        // no need for withDefault here because we don't need to set a
        // default class on table headers, but the user can pass
        // .thead-light, etc. if desired
        <thead className={classNames(props.className, props.extras)}>
          <tr>
            {props.displayFields.map(
                field => <th key={field} scope="col">{fieldMapObj[field]}</th>
            )}
          </tr>
        </thead>
    );
}

// props:
//   displayFields :: [ String ] 
//   data :: DataObject, with at least all the properties listed in displayFields
//   idFor :: DataObject -> identifier
//   className (optional), defaults to 'table-active' if data object is .chosen or .selected 
//   extras (optional), extra classes for tr element
export function DataTableRow(props) {
    const active = props.data.chosen || props.data.selected;
    return (
        <tr key={props.idFor(props.data)}
            className={classNames({'table-active': active} || props.className,
                                  props.extras)}>
              {props.displayFields.map(
                  (field) => <td>{ withNullAsString(props.data[field]) }</td>
              )}
        </tr>
    );
}

// props:
//   data :: [ Object ], the data objects which will be formattted as the rows of the table
//   fieldMap :: [ [String, String] ], array mapping data field names to display names
//   displayFields :: [ String ], array of data fields to be displayed
//     This should be a subset of the keys in fieldMap.
//   displayItemAs (optional) :: Object -> HTML table row,
//      a component to display a single data object as a table row.
//      Defaults to DataTableRow.
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
//   className (optional), defaults to 'table'
//   extras (optional), extra classes for table element
//   headClassName (optional), className for thead element
//   headExtras (optional), extras for thead element
//   bodyClassName (optional), className for tbody element
//   bodyExtras (optional), extras for tbody element
export function DataTable(props) {
    if (!(props.data && props.data.length)) return null;

    const RowComponent = props.displayItemAs || DataTableRow;

    return (
        <table className={withDefault('table', props)}>
          <DataTableHeaders fieldMap={props.fieldMap}
                            displayFields={props.displayFields}
                            className={props.headClassName}
                            extras={props.headExtras}
          />
          <tbody className={classNames(props.bodyClassName, props.bodyExtras)}>
            {props.data.map(
                row => <RowComponent data={row} idFor={props.idFor}
                                     choose={props.choose} unchoose={props.unchoose}
                                     select={props.select} unselect={props.unselect}
                                     displayFields={props.displayFields}/>
            )}
          </tbody>
        </table>
    );
}

// props:
//   terms :: [ String ]
//   defs :: [ String ]
//     Note: terms and defs should be co-indexed
//   className (optional)
//   extras (optional), extra classes for dl element
export function DefList(props) {
    if (!(props.terms && props.terms.length)) return null;

    return (
        // no default class name needed for dl in Bootstrap
        <dl className={classNames(props.className, props.extras)}>
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
//   data :: [ Object ]
//   delimiter (optional) :: String
//     prepended to all but the first element; defaults to ', '
//   displayItemAs (optional) :: data object -> Element
//     defaults to withNullAsString helper
export function Delimited(props) {
    if (!(props.data && props.data.length)) return null;

    const delim = props.delimiter || ', ';
    const formatter = props.displayItemAs || withNullAsString;
    // Note: we're relying here on the fact that React does some magic
    // behind the scenes to convert this array, which looks like 
    // [ [String, Element], ... ], into a flat array of elements.  This
    // works in React 16 but I haven't been able to find any official
    // documentation, so it may break.  See
    // https://stackoverflow.com/questions/23618744/rendering-comma-separated-list-of-links/40276830#40276830
    return props.data.map(
            (el, idx) => [(idx > 0 ? delim : ''), formatter(el)]
    );
}

// props:
//    level :: Number in 1...6
//    data (optional) :: String, content of heading; defaults to props.children
//    className
//    extras
export function Heading(props) {
    const classnames = classNames(props.className, props.extras);
    const text = props.data || props.children;
    switch (props.level) {
    case 1:
        return <h1 className={classnames}>{text}</h1>;
    case 2:
        return <h2 className={classnames}>{text}</h2>;
    case 3:
        return <h3 className={classnames}>{text}</h3>;
    case 4:
        return <h4 className={classnames}>{text}</h4>;
    case 5:
        return <h5 className={classnames}>{text}</h5>;
    case 6:
        return <h6 className={classnames}>{text}</h6>;
    default:
        throw new InternalError(`Heading was rendered with nonsensical level=${props.level}`);
    }
}

// props:
//   ordered :: Bool
//   className (optional), defaults to 'list-group'
//   extras (optional), extra classes for list
export function List(props) {
    const classes = withDefault('list-group', props);
    if (props.ordered) {
        return (<ol className={classes}>{props.children}</ol>);
    } else {
        return (<ul className={classes}>{props.children}</ul>);
    }
}

// props:
//   id :: a key for the list item
//   idFor (optional) :: typeof data -> id,
//      a function to compute the .id from .data if .id is not given  
//   data (optional) :: Object, the contents of the list item;
//      defaults to props.children
//   className (optional), defaults to 'list-group-item'
//   extras (optional), extra classes for list item
export function ListItem(props) {
    const key = props.id || (props.idFor && props.idFor(props.data));
    return (
        <li key={key} className={withDefault('list-group-item', props)}>
          {props.data || props.children}
        </li>
    );
}

