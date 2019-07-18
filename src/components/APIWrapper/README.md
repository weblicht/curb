# APIWrapper

The code in this directory defines a higher-order component for
transparently interacting with the backend API for Germanet data.
This reduces a *lot* of boilerplate in the components that have to
manage data via the API.

There are three important functions defined here:

1) `connectWithApi`, analogous to Redux's `connect`, is a higher-order
    component that wraps a given component with the functions
    necessary to fetch data from the API
2) `makeApiActions` provides a simple and consistent way to define
    action types and action creators for making API calls
3) `makeSimpleApiReducer` extracts the logic of handling API responses
    in the simple case where all that's needed is to stick the data
    from the API response into the Redux store
    
