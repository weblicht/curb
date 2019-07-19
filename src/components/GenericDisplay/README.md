# GenericDisplay

This directory contains a variety of low-level generic display components that
are intended to be reused by higher-level components.

## Components defined here

`DataTable`: given an array of data and formatting information,
generate an HTML table to display that data

`DataTableRow`: given a data object and a list of fields, generate an
HTML table row containing its data.

`DataTableHeaders`: given a field map and a list of fields, generate
an HTML table header

`DefList`: given a list of terms and a co-indexed list of definitions,
generate an HTML definition list.

`DelimitedArray`: given an array of data, pretty-print this data with
delimiters as an HTML span.
