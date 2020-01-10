# Frames

This directory defines a data container and various display components
for frames for lexical units.

## Data object

A frame object contains the following fields:

  - `id` :: String
  - `frameType` :: String

## Components defined here

### Container

`FramesContainer`: a data container for frame objects.
These objects are queried from the API by lexical unit ID.
The required query parameters look like: `{ lexUnitId: someId }`.

### Display components

`FramesAsList`: renders a set of frames as a list 

`FramesAsTable`: renders a set of frames as a table 

These components accept, and pass on, [data container control
props](../DataContainer#user-content-selecting-and-choosing-data-objects) for choosing and selecting data.

### Example

```
import { FramesContainer, FramesAsList } from '@sfstuebingen/germanet-common/components';

<FramesContainer containerId='theFrames'
                 queryParams={{ lexUnitId: someLexUnit.id }}
                 displayAs={FramesAsList}/>
```
