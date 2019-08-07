# GenericDisplay

This directory contains a variety of low-level generic display components that
are intended to be reused by higher-level components.

## Components defined here

`Button`: display a button

`Card`: wrap some content in a Bootstrap card div and add a title

`Checkbox`: display a checkbox and corresponding label

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

`DefList`: given a list of terms and a co-indexed list of definitions,
generate an HTML definition list.

`Delimited`: given an array of data, pretty-print this data with
delimiters.

`Heading`: generate an HTML section heading at an appropriate level

`List`: display an ordered or unordered list, depending on `ordered`
prop

`ListItem`: display a list item within a list

`makeDisplayableContainer`: a higher-order component that abstracts
the logic of various other container components (LexUnitsContainer,
SynsetsContainer, etc.).

`TextInput`: display a text input with a corresponding label

## Conventions

There are a few conventions to be aware of when using these components.

1. There is a distinction between lower-level and higher-level generic
   components.

   - Lower-level generic components are short wrappers around raw HTML
     elements (e.g. `Button`), and generally have a similar name to the
     element they wrap, but provide default styling information and a
     useful props interface.

   - Higher-level generic components are intended to provide a generic
     interface for rendering datasets (e.g. `DataTable`), and
     generally have names starting with 'Data'.

1. Data.  As elsewhere in this library, data to be displayed is
   generally passed as either an object or an array on the `data`
   prop.  In a few exceptional cases (`Button`, `ListItem`) it is also
   possible to pass the data as the component's children, for
   convenience and flexibility.

1. Styling.  The components here by default use the class names from
   [Bootstrap CSS (version 4.3)](https://getbootstrap.com/docs/4.3/layout/overview/).
   The following convention allows callers to override and extend
   these defaults:

   - the `className` prop, if provided, will *replace* the default
     Bootstrap class assumed by the library.  So pass `className` if
     you want to override e.g. `.list-group` (the default class for
     `List`) with `.list-inline`.

   - the `extras` prop, if provided, will be *added* to the className.
     So pass `extras` if you need to add in things like spacing or
     display utilities without modifying the main style class.

   These two props are combined via the `classNames` function from
   the [classnames](https://www.npmjs.com/package/classnames) library,
   so any valid argument for that function is a valid value for these
   props.
     
   On some components, there are also corresponding props to pass as
   `className` and `extras` to associated or contained components,
   such as for the label on a `Checkbox`.
   
