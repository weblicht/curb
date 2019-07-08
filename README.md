This is a library of components, designed to be used in different
projects that interface with the Germanet code

# Code structure

The components in this library are designed to be reused from a
consuming application.  They are (somewhat) independent from each
other, and impose minimal assumptions on the environment where they
are used.

For that reason, the code here is organized per-component.  Each
component has its own directory in `src/components`, and each
component directory contains the following files:
  - README.md: documentation specific to the component 
  - component.jsx: defines the component
  - actions.js: defines Redux actions emitted by, or related to
    handling, the component
  - reducers.js: defines Redux reducers that manage the component's
    state 
  - selectors.js: defines selector functions for the part of the Redux
    store that corresponds to the component's state
  
In addition, there are several other files that contain code shared
across the library:
  - helpers.js: utility functions that help keep
  - validation.js: validation functions for user input

# Prerequisites

When you use these components from another project, that project
should have the following NPM packages installed:
  - axios
  - react
  - react-dom
  - redux
  - react-redux
  - seamless-immutable
  
These are listed as *peer dependencies* in the package.json file.
This means that this package relies on them, but does not bundle them
itself.  This is because consuming applications (for instance, any
project based on the
[reactprojecttemplate](https://weblicht.sfs.uni-tuebingen.de/gitlab/clarind/misc/reactprojecttemplate)
repository) are likely to depend on these packages already.

# Use

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

For now, only local development is possible, but once this package is
stable it should be published to NPM. 

