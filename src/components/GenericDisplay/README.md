# GenericDisplay

This directory contains a variety of low-level generic display components that
are intended to be reused by higher-level components.

## Components defined here

`DataList`: given an array of data objects and a component to render
individual items, generate an HTML list of that data

`DataSelect`: given an array of data objects and a component to render
individual options, generate an HTML select for the data

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

`List`: display an ordered or unordered list, depending on `ordered`
prop

`makeDisplayableContainer`: a higher-order component that abstracts
the logic of various other container components (LexUnitsContainer,
SynsetsContainer, etc.).
