# GenericDisplay

This directory contains a variety of generic display components that
are intended to be reused by higher-level components elsewhere.

## Components defined here

### Low-level components

These components are generally short wrappers around raw HTML
elements.  Their purposes is to provide default styling information
and a useful props interface.

`Alert`: wrap some content in a div with an appropriate Bootstrap
alert class

`Badge`: wrap some content in a span with an appropriate Bootstrap
badge class

`Card`: wrap some content in a Bootstrap card div and add a title

`CardFooter`: wrap some content in a Bootstrap card footer div within
a `Card`

`CardHeader`: wrap some content in a Bootstrap card header div within
a `Card`

`DefList`: given a list of terms and a co-indexed list of definitions,
generate an HTML definition list.

`Delimited`: given an array of data, pretty-print this data with
delimiters.

`EmptyTable`: given formatting information and a message to display,
generate an HTML table (with headers, etc.) containing the message as
its only row

`Heading`: generate an HTML section heading at an appropriate level

`List`: display an ordered or unordered list, depending on `ordered`
prop

`ListItem`: display a list item within a list

### Data container display components

These components are intended to provide a generic interface for
rendering data in a data container (see [DataContainer in the
germanet-common
library](https://github.com/Germanet-sfs/germanet-common/tree/master/components/DataContainer)),
which is just an array of data objects together with some props for
controlling state associated with them.

**Note**: For the moment, the DataContainer higher order component has
not been moved into this library, because it introduces a dependency
on react-redux; but this might change in the future. You can still use
these components without DataContainer by conforming to their props
interface. Most of the data container control props are optional until
you want to do things that require keeping track of container state
beyond the objects themselves, like selecting items or dynamically
sorting tables.

`DataList`: given an array of data objects and a component to render
individual items, generate an HTML list of that data

`DataSelect`: given an array of data objects and a component to render
individual options, generate an HTML select for the data

`DataTabbedPanes`: given an array of data objects and formatting
information, generate a tab pane view, with one tab per data object

`DataTable`: given an array of data objects and formatting information,
generate an HTML table to display that data

`DataTableHeaders`: given a field map and a list of fields, generate
an HTML table header

`DataTableRow`: given a data object and a list of fields, generate an
HTML table row containing its data.

### User interface controls

These components provide a high-level interface for rendering a group
of related functions in the user interface.

`TabbedPanes`: given an array of objects representing tabs and panes
and formatting information, generate a tab pane view


## Conventions

There are a few conventions to be aware of when using these components.

### Data flow

Data to be displayed is generally passed as either an object or an
array on the `data` prop. In a few exceptional cases (e.g. `Button`,
`ListItem`) it is also possible to pass the data as the component's
children, for convenience and flexibility.

### Styling

The components here by default use the class names from [Bootstrap CSS
(version 4.3)](https://getbootstrap.com/docs/4.3/layout/overview/).
The following convention allows callers to override and extend these
defaults:

   - the `className` prop, if provided, will *replace* the default
     Bootstrap class assumed by the library.  So pass `className` if
     you want to override e.g. `list-group` (the default CSS class for
     `List`) with `list-inline`.

   - the `extras` prop, if provided, will be *added* to the className.
     So pass `extras` if you need to add in things like spacing or
     display utilities without modifying the main style class.

These two props are combined via the `classNames` function from the
[classnames](https://www.npmjs.com/package/classnames) library, so any
valid argument for that function is a valid value for these props.
     
On some components, there are also corresponding props to pass as
`className` and `extras` to contained components or HTML elements. For
example, the `EmptyTable` component accepts `headClassName` and
`headExtras` props, which are used to style the thead element inside
the table.
   
