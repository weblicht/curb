import React from 'react';
import { connect } from 'react-redux';  

// Higher-order component to transparently connect a component to both the
// backend API and the redux store
//
// params:
//   fetchActions: an object containing API action creators for fetching, e.g. as
//     returned by makeApiActions.
// 
// Returns a function with which to wrap a component.  Thus, you can use it very much
// like redux's connect() function:
// ConnectedSomeComponent = connectWithApi(selector, fetchActions)(SomeComponent);
export function connectWithApi(fetchActions) {
    // TODO: again, there's room to expand here to other REST methods
    // In that case we want not just fetchActions, but a whole API actions object

    function wrap(Component) {
        // TODO: this can now probably be refactored to be a pure function component
        return class APIWrapper extends React.Component {

            constructor(props) {
                super(props);
            }

            // TODO: for some applications we will actually want to
            // reload the data before every render.  Moreover, that's
            // simpler.  
            componentDidMount() {
                if (this.props.data === undefined) {
                    this.props.fetchData();
                }
            }

            render() {
                return (
                    <Component data={this.props.data} {...this.props}/>
                );
            }
        };
    }
    
    function mapDispatchToProps(dispatch, ownProps) {
        return {
            // for now, user must supply fetchParams 
            fetchData: () => dispatch(fetchActions.doFetch(ownProps.fetchParams)),
        };
    };

    return function(Component) {
        const Connected = connect(undefined, mapDispatchToProps)(wrap(Component));
        Connected.displayName = (Component.displayName || Component.name || 'Component') + 'WithApi';

        return Connected;
    };
}

// Here's a draft version of connectWithApi that uses react's internal
// "Hooks" framework to manage the data as local state, instead of
// going through redux.  The big advantage here is a reduction in
// complexity.  From the user's point of view, we don't need to pass a
// selector or any of the redux functions, and we don't need to write
// our own reducers; /all/ the wrapper needs to know about is how to
// make the API request.  This makes things a lot clearer.  From the
// dev point of view, it's also nicer to write a higher-order
// component as a function than as a class.  The code here is much
// shorter and simpler.  OTOH, we lose the transparency and debugging
// capabilities of having all API actions go through redux, and if we
// stick with the useReducer hook, we are essentially adding a
// dependency on a *second* version of Redux.  For now, I will
// continue to use the version above; this is a possible future
// evolution:
import { useReducer, useEffect } from 'react';
function connectViaHook(fetchActions)
{
    // TODO: again, there's room to expand here to other REST methods
    // In that case we want not just fetchActions, but a whole API actions object
    function wrap(Component) {
        return function APIWrapper(props) {

            function apiReducer(state, action) {
                if (action.type.endsWith('_RETURNED')) {
                    // ugly hack until backend response objects are normalized:
                    const names = Object.getOwnPropertyNames(action.data);
                    const name = names.length === 1? names[0] : 'TOO_MANY_PROPERTIES_ON_RESPONSE';

                    return { data: action.data[name] };
                }
                else {
                    return state;
                }
            }

            const [state, dispatch] = useReducer(apiReducer, { data: undefined });
            
            // TODO: at present this results in an infinite loop of
            // making requests on every render, which triggers new
            // rendering, etc.  Need to figure out why, even when
            // request returns the same data, component re-renders.
            useEffect(() => {
                Promise.resolve(fetchActions.doFetch(props.fetchParams)(dispatch));
            });

            // don't render when we don't yet have data:
            console.log('inside the wrapper before return');
            if (state.data === undefined) {
                return null;
            } else {
                return (
                        <Component data={state.data} {...props}/>
                );
            }
        };
    }
    
    return function(Component) {
        const Connected = wrap(Component);
        Connected.displayName = (Component.displayName || Component.name || 'Component') + 'WithApi';

        return Connected;
    };
}

