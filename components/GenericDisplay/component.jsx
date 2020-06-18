// Copyright 2020 Richard Lawrence
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

// GenericDisplay/component.jsx
// Definition of generic display components that are reused elsewhere

import { Select } from '../GenericForms/component';
import { comparisonOn, withNullAsString } from '../../helpers';
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
//   type (optional) :: String representing a (Bootstrap 4) alert class,
//      e.g. 'warning', 'danger' or 'success'; defaults to 'info'
//   text (optional) :: String, defaults to props.children
//   className (optional), defaults to 'alert' plus the alert class
//      determined by props.type
//   extras (optional), extras for alert div
export function Alert(props) {
    const type = props.type ? 'alert-' + props.type : 'alert-info';

    // type gets rolled into the className, so that props.className
    // can override *both* alert classes:
    const fullClassName = `alert ${type}`;
    
    return (
        <div className={withDefault(fullClassName, props)} role="alert">
          {props.text || props.children}
        </div>
    ); 
}

// props:
//   title (optional) :: String
//   level (required only if title given) :: Number, the level of the card heading 
//   children :: used as content for body of card
//   header (optional): content to put before the card body, e.g. a CardHeader
//   footer (optional): content to put after the card body, e.g. a CardFooter
//   extras
//   bodyExtras, extras for card body
//   Note: className does nothing here, since there is no reason to use this component *except* for the .card* classes it introduces
export function Card(props) {
    return (
        <div className={classNames('card', props.extras)}>
          {props.header}
          <div className={classNames('card-body', props.bodyExtras)}>
            {props.title && <Heading level={props.level} className='card-title' data={props.title}/>}
            {props.children}
          </div>
          {props.footer}
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
//   idFor :: DataObject -> identifier
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
              item => <ItemComponent data={item} idFor={props.idFor}
                                     key={typeof props.idFor  === 'function' ? props.idFor(item) : undefined}
                                     choose={props.choose} unchoose={props.unchoose}
                                     select={props.select} unselect={props.unselect}
                                     className={props.itemClassName} extras={props.itemExtras}/>
          )}
        </List>
    );

}

// props:
//   name :: String
//   label :: String
//   data :: [ DataObject ]
//   displayItemAs :: DataObject -> HTML option or option group,
//     a component to display a single data object as an option in the select.
//     NOTE: the value of the option *must* be equal to the data object's
//     unique identifier.
//   idFor :: DataObject -> identifier
//   choose (optional) :: String -> (anything), callback to choose an
//     item given its unique identifier. If given, this function will
//     be used to create an onChange handler for the underlying
//     <select>, such that the choose() callback will be called with
//     the item's identifier when the user chooses the corresponding
//     option in the select element.
//   Other props for Select, if given, will be passed on to Select
//     component.
//   Note: the underlying Select component is by default uncontrolled
//     and is given no defaultValue. If you wish to use a controlled
//     component you should pass the value prop explicitly.
export function DataSelect(props) {
    if (!(props.data && props.data.length)) return null;
    const ItemComponent = props.displayItemAs;

    function chooseItem(e) {
        // == to allow for numerical IDs that have been rendered as strings:
        const item = props.data.find(d => props.idFor(d) == e.target.value);
        const itemId = item ? props.idFor(item) : undefined;

        if (itemId && typeof props.choose === 'function') {
            props.choose(itemId);
        }
    }

    // Allow the user to provide onChange directly, but support the
    // DataContainer choose() function if given, which makes it easier
    // to create a controlled component:
    const onChange = props.onChange || (props.choose ? chooseItem : undefined);

    return (
        <Select name={props.name}
                id={props.id}
                onChange={onChange}
                disabled={props.disabled}
                defaultValue={props.defaultValue} value={props.value}
                className={props.className} extras={props.extras}
                label={props.label} labelClassName={props.labelClassName} labelExtras={props.labelExtras}
                feedback={props.feedback} feedbackClassName={props.feedbackClassName} feedbackExtras={props.feedbackExtras}
                asGroup={props.asGroup} groupClassName={props.groupClassName} groupExtras={props.groupExtras}>
          {props.data.map(d => <ItemComponent {...props} data={d} />)}
        </Select>
    );
}

// props:
//   data :: [ DataObject ]
//      Normally, these should be the objects in some data container.
//      Exactly one object should have .chosen == True.  If none does,
//      the first item will be chosen by default.
//   choose :: String -> (anything), callback to choose tab for an item given its ID
//      Normally this should be the .choose prop of a DataContainer
//   idFor :: DataObject -> identifier
//   buttonTextFor :: DataObject -> String
//      Maps a data object to the button text for its tab button
//   displayItemAs, component to display an item as tab pane content
//   className (optional, currently ignored)
//   extras (optional, currently ignored)
//   itemClassName (optional), passed to item formatting component as className
//   itemExtras (optional), passed to item formatting component as extras
//
//   TabbedPanes style props, if given, will be passed on to TabbedPanes component.
export function DataTabbedPanes(props) {
    if (!(props.data && props.data.length)) return null;

    const ItemRenderer = props.displayItemAs;

    const chosenSeen = props.data.some(d => d.chosen);
    const tabData = props.data.map(
        (item, idx) => ({
            id: props.idFor(item),
            chosen: chosenSeen ? item.chosen : idx == 0,
            buttonText: props.buttonTextFor(item),
            content: (<ItemRenderer data={item} className={props.itemClassName} extras={props.itemExtras}/>)
        })
    );

    return (
        <TabbedPanes data={tabData} 
                     choose={props.choose}
                     tabsClassName={props.tabsClassName}
                     tabsExtras={props.tabExtras}
                     buttonClassName={props.buttonClassName}
                     buttonExtras={props.buttonExtras}
                     paneClassName={props.paneClassName}
                     paneExtras={props.paneExtras}
                     panesContainerClassName={props.panesContainerClassName}
                     panesContainerExtras={props.panesContainerExtras}
        />
    );
}

// props:
//   fieldMap :: [ [String, String] ], array mapping data field names to display names
//   displayFields :: [ String ], array of data fields to be displayed
//     This should be a subset of the keys in fieldMap.
//   sortFields (optional) :: [ String ], array of data fields to
//     display sort buttons for. This should be a subset of
//     displayFields.  Requires the sortWith prop.
//   sortWith (required if sortFields is given) :: callback
//     This function will be called with the comparison function to use for sorting the
//     data in the order the user requests.
//   className (optional), class name for table header
//   extras (optional), extras for table header
export function DataTableHeaders(props) {
    const fieldMapObj = Object.fromEntries(props.fieldMap);

    function sortButtons(field) {
        if (!props.sortWith || !props.sortFields || !props.sortFields.includes(field)) return null;

        const ascending = e => props.sortWith(comparisonOn(field, false));
        const descending = e => props.sortWith(comparisonOn(field, true));
        return <span className="ml-2">
                 {<a onClick={ascending} className="ml-1">&#9650;</a>} 
                 {<a onClick={descending} className="ml-1">&#9660;</a>}
               </span>;
    }

    return (
        // no need for withDefault here because we don't need to set a
        // default class on table headers, but the user can pass
        // .thead-light, etc. if desired
        <thead className={classNames(props.className, props.extras)}>
          <tr>
            {props.displayFields.map(
                field => <th key={field} scope="col">
                           {fieldMapObj[field]}
                           {sortButtons(field)}
                         </th>
            )}
          </tr>
        </thead>
    );
}

// props:
//   displayFields :: [ String ] 
//   data :: DataObject, with at least all the properties listed in displayFields
//   idFor :: DataObject -> identifier
//   onClick (optional) :: Event handler function, to handle a click event on the whole table row
//   className (optional), defaults to 'table-active' if data object is .chosen or .selected 
//   extras (optional), extra classes for tr element
export function DataTableRow(props) {
    const active = props.data.chosen || props.data.selected;
    return (
        <tr key={props.idFor(props.data)}
            className={classNames({'table-active': active} || props.className,
                                  props.extras)}
            onClick={props.onClick}>
              {props.displayFields.map(
                  (field) => {
                      if (Array.isArray(props.data[field])) {
                          // attempt to nicely format fields containing an array of data, in
                          // case no one higher up the hierarchy handled this:
                          return <td>{props.data[field].filter(d => d !== null).join(', ')}</td>;
                      } else {
                          return <td>{ withNullAsString(props.data[field]) }</td>;
                      }
                  }
              )}
        </tr>
    );
}

// props:
//   data :: [ Object ], the data objects which will be formatted as the rows of the table
//   fieldMap :: [ [String, String] ], array mapping data field names to display names
//   displayFields (optional) :: [ String ], array of data fields to be displayed
//     This should be a subset of the keys in fieldMap. Defaults to displaying
//     all fields in fieldMap.
//   displayItemAs (optional) :: Object -> HTML table row,
//      a component to display a single data object as a table row.
//      Defaults to DataTableRow.
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
//   idFor :: DataObject -> identifier
//   sortFields (optional) :: [ String ], array of fields to add sort buttons for in header
//      Should be a subset of displayFields.
//   sortWith (required for sortFields) :: callback,
//      This function will be called with the comparison function to use for sorting the
//      data in the order the user requests.
//   className (optional), defaults to 'table'
//   extras (optional), extra classes for table element
//   headClassName (optional), className for thead element
//   headExtras (optional), extras for thead element
//   bodyClassName (optional), className for tbody element
//   bodyExtras (optional), extras for tbody element
export function DataTable(props) {
    if (!(props.data && props.data.length)) return null;

    const RowComponent = props.displayItemAs || DataTableRow;

    // display all fields in fieldMap by default:
    const displayFields = props.displayFields || props.fieldMap.map(field => field[0]);

    return (
        <table className={withDefault('table', props)}>
          <DataTableHeaders fieldMap={props.fieldMap}
                            displayFields={displayFields}
                            sortFields={props.sortFields}
                            sortWith={props.sortWith}
                            className={props.headClassName}
                            extras={props.headExtras}
          />
          <tbody className={classNames(props.bodyClassName, props.bodyExtras)}>
            {props.data.map(
                row => <RowComponent data={row} idFor={props.idFor}
                                     key={typeof props.idFor  === 'function' ? props.idFor(row) : undefined}
                                     choose={props.choose} unchoose={props.unchoose}
                                     select={props.select} unselect={props.unselect}
                                     sortWith={props.sortWith} reset={props.reset}
                                     displayFields={displayFields}/>
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
// All other props, if given, will be passed down to the produced <dl> element 
export function DefList(props) {
    if (!(props.terms && props.terms.length)) return null;

    const { terms, defs, className, extras, ...rest } = props;

    return (
        // no default class name needed for dl in Bootstrap
        <dl {...rest} className={classNames(className, extras)}>
          {terms.map(
              (term, idx) =>
                  <React.Fragment key={term}>
                    <dt>{term}</dt>
                    <dd>{defs[idx]}</dd>
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
//   message :: String, a message to be displayed in the table's only row
//   fieldMap :: [ [String, String] ], array mapping data field names to display names
//   displayFields :: [ String ], array of data fields to be displayed
//     This should be a subset of the keys in fieldMap.
//   className (optional), defaults to 'table'
//   extras (optional), extra classes for table element
//   headClassName (optional), className for thead element
//   headExtras (optional), extras for thead element
//   bodyClassName (optional), className for tbody element
//   bodyExtras (optional), extras for tbody element
export function EmptyTable(props) {
    return (
        <table className={ withDefault('table', props) }>
          <DataTableHeaders fieldMap={props.fieldMap} displayFields={props.displayFields}
                            className={props.headClassName} extras={props.headExtras} />
          <tbody className={classNames(props.bodyClassName, props.bodyExtras)}>
            <tr>
              <td colSpan={props.displayFields.length}>
                <p className="text-center">{props.message}</p>
              </td>
            </tr>
          </tbody>
        </table>
    );
}

// props:
//    level :: Number in 1...6
//    data (optional) :: String, content of heading; defaults to props.children
//    className
//    extras
// All other props, if given, will be passed down to the produced <h*> element 
export function Heading(props) {
    const { level, data, className, extras, ...rest } = props;

    const classnames = classNames(className, extras);
    const text = data || props.children;
    switch (level) {
    case 1:
        return <h1 {...rest} className={classnames}>{text}</h1>;
    case 2:
        return <h2 {...rest} className={classnames}>{text}</h2>;
    case 3:
        return <h3 {...rest} className={classnames}>{text}</h3>;
    case 4:
        return <h4 {...rest} className={classnames}>{text}</h4>;
    case 5:
        return <h5 {...rest} className={classnames}>{text}</h5>;
    case 6:
        return <h6 {...rest} className={classnames}>{text}</h6>;
    default:
        throw new InternalError(`Heading was rendered with nonsensical level=${level}`);
    }
}

// props:
//   ordered :: Bool
//   className (optional), defaults to 'list-group'
//   extras (optional), extra classes for list
// All other props, if given, will be passed down to the produced <ol> or <ul> element
export function List(props) {
    const { ordered, className, extras, ...rest } = props;
    const classes = classNames(className || 'list-group', extras);
    
    if (ordered) {
        return (<ol {...rest} className={classes}>{props.children}</ol>);
    } else {
        return (<ul {...rest} className={classes}>{props.children}</ul>);
    }
}

// props:
//   data (optional) :: Object, the contents of the list item;
//      defaults to props.children
//   className (optional), defaults to 'list-group-item'
//   extras (optional), extra classes for list item
// All other props, if given, will be passed down to the produced <li> element
export function ListItem(props) {
    const { data, className, extras, ...rest } = props;
    const classes = classNames(className || 'list-group-item', extras);

    return (
        <li {...rest} className={classes}>
          {props.data || props.children}
        </li>
    );
}

// props:
//    data :: [ Object ]
//       These objects represent the tabs to be displayed.
//       The objects should have the following fields:
//          id, an identifier for the tab and its associated pane
//          chosen :: Bool, whether the tab is chosen (i.e., open).
//            "active" will automatically be added to the tab button's classes 
//            if this property is true.
//          buttonText ::  String, the text for the tab button
//          buttonExtras, extra classes for the tab button.
//          content :: the rendered content to be placed in the tab pane
//          contentExtras, extra classes for the tab pane
//       It is the caller's responsibility to ensure that exactly one object
//       has .chosen === true.  No tab will be chosen by default.
//    choose, a callback to call with the data object's ID
//       when a tab button is clicked
//    tabsClassName (optional), className for nav container wrapping
//       the tab buttons. Defaults to 'nav nav-tabs'. See Bootstrap
//       documentation for other useful options:
//       https://getbootstrap.com/docs/4.0/components/navs/
//    tabsExtras (optional), extras for nav tabs container
//    buttonClassName (optional), className for tab buttons.
//       Defaults to "nav-item nav-link".
//    buttonExtras (optional), default extras for all tab buttons.
//       The .buttonExtras value of each individual tab object will be
//       *added* to this prop.
//    paneClassName (optional), className for each tab pane div
//    paneExtras (optional), extras for each tab pane div
//    panesContainerClassName (optional), className for container div that
//       wraps the divs for individual panes.  Defaults to "tab-content";
//       you probably should not change this.
//    panesContainerExtras (optional), extras for container div that
//       wraps the divs for individual panes.
export function TabbedPanes(props) {
    if (!(props.data && props.data.length)) return null;

    function activateTabFor(itemId) {
        return function(e) {
            e.preventDefault();
            props.choose(itemId);
        };
    }

    return (
        <>
          <nav className={classNames(props.tabsClassName || "nav nav-tabs",
                                     props.tabsExtras)}>
            {props.data.map(
                item => 
                    <a className={classNames(props.buttonClassName || "nav-item nav-link",
                                             { active: item.chosen },
                                             props.buttonExtras,
                                             item.buttonExtras
                                            )}
                       id={item.id + "-tab"}
                       key={item.id}
                       href={"#" + item.id}
                       role="tab"
                       aria-controls={item.id + '-pane'}
                       aria-selected={item.chosen}
                       onClick={activateTabFor(item.id)}>
                      {item.buttonText} 
                    </a>
                
            )}
          </nav>
          <div className={classNames(props.panesContainerClassName || "tab-content",
                                     props.panesContainerExtras)}>
            {props.data.map(
                item =>
                    <div className={classNames(props.paneClassName || "tab-pane",
                                               { active: item.chosen },
                                               props.paneExtras,
                                               item.contentExtras
                                              )}
                         id={item.id + '-pane'}
                         key={item.id}
                         data-id={item.id}
                         role="tabpanel"
                         aria-labelledby={item.id + "-tab"}>
                      {item.content}
                    </div> 
            )}
          </div>
        </>
    );
}

