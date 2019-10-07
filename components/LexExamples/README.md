# LexExamples

This directory defines a data container and various display components
for examples for lexical units.

## Data object

An example object contains the following fields:

  - `id` :: String
  - `text` :: String
  - `frameType` :: String

## Components defined here

### Container

`ExamplesContainer`: a data container for example objects.
These objects are queried from the API by lexical unit ID.
The required query parameters look like: `{ lexUnitId: someId }`.

### Display components

`ExamplesAsDefList`: renders a set of examples as a
definition list 

`ExamplesAsList`: renders a set of examples as a list 

`ExamplesAsTable`: renders a set of examples as a table 

These components accept, and pass on, [data container control
props](../DataContainer#user-content-selecting-and-choosing-data-objects) for choosing and selecting data.

### Example

```
import { ExamplesContainer, ExamplesAsDefList } from '@sfstuebingen/germanet-common/components';

<ExamplesContainer id='theExamples'
                   queryParams={{ lexUnitId: someLexUnit.id }}
                   displayAs={ExamplesAsDefList}/>
```
