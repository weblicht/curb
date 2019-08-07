# DataContainer

A data container manages and displays a set of data objects.  This
means it handles:

  - pulling data objects out of the Redux store into an array
  - keeping track of various state concerning those objects, e.g.,
    whether they have been selected by the user in the UI
  - rendering the data objects in some way that makes sense for them,
    e.g. as a table or form control

## Component

props:
  - id
  - data
  - displayAs

## Conventions

There are two senses in which one object in a set can be 'selected':
  
  1. it might be part of a subset of those objects selected from among
     the total set. This is here known as *selecting* one or more
     objects, which can also be *unselected* (think: checkboxes).
  2. it might be selected to the exclusion of any other object in the
     set. This is here known as *choosing* an object (think: radio
     buttons).
     
