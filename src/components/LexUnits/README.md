# LexUnit

This directory defines components and state management for dealing
with lexical units.

## Components defined here

`LexUnitsContainer`: holds an array of lex units and is responsible
for rendering them in an appropriate fashion (e.g., as a table or a
list).  Connected with the API via the APIWrapper HOC.

`LexUnitDetail`: holds a single lex unit object and is responsible for
rendering it in an appropriate fashing (e.g., as a table row or list
item).

There are also a variety of components that these two components use
to provide default rendering for lex unit data.
