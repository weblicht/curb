# LexRels

This directory defines a data container and various display components
for lexical relations.

## Data object

A lexical relation object contains the following fields:

  - `id` :: String
  - `relType` :: String
  - `fromOrthForm` :: String
  - `toOrthForm` :: String
  - `fromLexUnitId` :: String
  - `toLexUnitId` :: String

**Note**: this is not exactly the shape of the data which is currently
returned by the backend; it is reshaped a little bit for clarity.  See
[reducers.js](./reducers.js) for the details.

## Components defined here

### Container

`LexRelsContainer`: a data container for lexical relation objects.
These objects are queried from the API by the (from) lexUnit ID.
The required query parameters look like: `{ lexUnitId: someId }`.

### Display components

`LexRelsAsList`: renders a set of lexical relations as a list 

`LexRelsAsTable`: renders a set of lexical relations as a table 

These components accept, and pass on, [data container control
props](../DataContainer#user-content-selecting-and-choosing-data-objects) for choosing and selecting data.

### Example

```
import { LexRelsContainer, LexRelsAsTable } from '@sfstuebingen/germanet-common/components';

<LexRelsContainer containerId='theLexRels'
                  queryParams={{ lexUnitId: someLexUnit.id }}
                  displayAs={LexRelsAsTable}/>
```
