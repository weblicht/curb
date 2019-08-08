# Germanet-common

This is a library which provides a variety of abstractions for
implementing the following pattern:

  1. Fetching data objects from a backend API into the Redux store
     (see [APIWrapper](./tree/master/src/components/APIWrapper))
  2. Selecting data objects from the store into a container (see [DataContainer](./tree/master/src/components/DataContainer))
  3. Rendering the data in a container into a UI (see [GenericDisplay](./tree/master/src/components/GenericDisplay))

It also implements this pattern for the different types of data
objects in the GermaNet API, namely

  - synsets (see [Synset](./tree/master/src/components/Synset))
  - conceptual relations (see [ConRel](./tree/master/src/components/ConRel))
  - lexical units (see [LexUnit](./tree/master/src/components/LexUnit))
  - examples for lexical items (see [LexExamples](./tree/master/src/components/LexExamples))
  - Interlingual Index records (see [ILIRecords](./tree/master/src/components/ILIRecords))
  - Wiktionary definitions (see [WiktionaryDefs](./tree/master/src/components/WiktionaryDefs))

Thus, applications using this library can focus on just providing the
code needed to render GermaNet data for their own specific use case,
without having to define all the boilerplate for fetching that data
and managing it.

## Prerequisites

When you use these components from another project, that project
should have the following NPM packages installed:
  - axios
  - react
  - react-dom
  - redux
  - react-redux
  - seamless-immutable
  
These are listed as *peer dependencies* in the
[package.json](./tree/master/) file.  This means that this package
relies on them, but does not bundle them itself.  This is because
consuming applications (for instance, any project based on the
[reactprojecttemplate](https://weblicht.sfs.uni-tuebingen.de/gitlab/clarind/misc/reactprojecttemplate)
repository) are likely to depend on these packages already.

## Use

**Note**: For now, only local development is possible, but once this
package is stable it should be published to NPM; these instructions
will then change.

Clone the project and build the library:
```
npm run build 
```
This should create a bundle at `dist/germanet-common.js`.

Then, to use this library from within another project:
```
cd some/other/repo/webui
npm install path/to/this/repo
```

To make the library useful, you will need to install several reducers
from this library into your root Redux reducer:
```
import { reducers } from 'germanet-common'

const { synsetSearchBoxes, dataContainers, apiData } = reducers; // e.g.

const rootReducer = {
   ...
   synsetSearchBoxes,
   dataContainers,
   apiData,
   ...
}
```

Then you can import the components and use them in your own code:
```
import { components } from 'germanet-common'

const { LexUnitsContainer, LexUnitsAsList } = components; // e.g.

...
<LexUnitsContainer data={someData} displayAs={LexUnitsAsList} />

```

## Code structure

The code is organized around the various functions in the general
pattern described above.  Each of these groupings consists of a React
component, or a set of related components, together with any functions
needed to manage their state via Redux.  Every grouping thus consists
of a directory under `src/components` with at least these files:

  - `README.md`: documentation specific to the component 
  - `component.jsx`: the definition of the component (or components)

If the component has local state managed by Redux, the following files
will also be present:

  - `actions.js`: Redux actions for the component(s)
  - `reducers.js`: Redux reducers for managing the component's state
  - `selectors.js`: Redux selectors which map the Redux state

 
In addition, there are several other files that contain code shared
across the library:
  - [errors.js](./tree/master/src/): assorted error classes and
    handling functions
  - [helpers.js](./tree/master/src/): assorted common utility
    functions
  - [validation.js](./tree/master/src/): validation functions for user
    input

