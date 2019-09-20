# ILIRecords

This directory defines a data container and various display components
for Interlingual Index records.

## Data object

An ILI record object contains the following fields:

  - `iliId`
  - `lexUnitId`
  - `relation`
  - `englishEquivalent`
  - `pwn20Id`
  - `pwn30Id`
  - `pwn20Synonyms`
  - `pwn20Paraphrase`
  - `source`

## Components defined here

### Container

`ILIRecordsContainer`: a data container for ILI Record objects.
These objects are queried from the API by lexical unit ID.
The required query parameters look like: `{ lexUnitId: someId }`.

### Display components

`ILIRecordsAsDefList`: renders a set of ILI records as a
definition list 

`ILIRecordsAsList`: renders a set of ILI records as a list 

`ILIRecordsAsTable`: renders a set of ILI records as a table 

These components accept, and pass on, [data container control
props](../DataContainer#user-content-selecting-and-choosing-data-objects) for choosing and selecting data.

### Example

```
import { components } from '@sfstuebingen/germanet-common';
const { ILIRecordsContainer, ILIRecordsAsDefList } = components;

<ILIRecordsContainer id='theILIRecords'
                     queryParams={{ lexUnitId: someLexUnit.id }}
                     displayAs={ILIRecordsAsDefList}/>
```
