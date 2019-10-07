# LexUnits

This directory defines a data container and various display components
for lexical units.

## Data object

A lexical unit object contains the following fields:

  - `id` :: String
  - `synsetId` :: String
  - `orthForm` :: String
  - `orthVar` :: String
  - `oldOrthForm` :: String
  - `oldOrthVar` :: String
  - `source` :: String
  - `namedEntity` :: Bool
  - `artificial` :: Bool
  - `styleMarking` :: Bool
  - `comment` :: String

## Components defined here

### Container

`LexUnitsContainer`: a data container for lexical unit objects.
These objects are queried from the API by synset ID.
The required query parameters look like: `{ synsetId: someId }`.

### Display components

`LexUnitsAsList`: renders a set of lexical units as a list 

`LexUnitsAsSelect`: renders a set of lexical units as a select control

`LexUnitsAsTable`: renders a set of lexical units as a table 

These components accept, and pass on, [data container control
props](../DataContainer#user-content-selecting-and-choosing-data-objects) for choosing and selecting data.

### Example

```
import { LexUnitsContainer, LexUnitsAsTable } from '@sfstuebingen/germanet-common/components';

<LexUnitsContainer id='theLexUnits'
                   queryParams={{ synsetId: someSynset.id }}
                   displayAs={LexUnitsAsTable}/>
```
