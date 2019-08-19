import { InternalError } from '../../errors'; 

import React from 'react';
import { connect } from 'react-redux';  

// Higher-order component to transparently connect a component to both the
// backend API and the redux store
//
// params:
//   fetchActions: an object containing API action creators for fetching, e.g. as
//     returned by makeApiActions.
// 
// ConnectedSomeComponent = connectWithApi(SomeComponent, fetchActions);
export function connectWithApi(Component, fetchActions) {
    // TODO: again, there's room to expand here to other REST methods
    // In that case we want not just fetchActions, but a whole API actions object

    class APIWrapper extends React.Component {

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
    
    function mapDispatchToProps(dispatch, ownProps) {
        return {
            // for now, user must supply fetchParams 
            fetchData: () => dispatch(fetchActions.doFetch(ownProps.fetchParams)),
        };
    };

    const Connected = connect(undefined, mapDispatchToProps)(APIWrapper);
    Connected.displayName = (Component.displayName || Component.name || 'Component') + 'WithApi';

    return Connected;
}

// Higher-order component to transparently load a component's data prop via
// an API query.
//
// params:
//   Component: the component to be connected with the API
//   queryActions: an object containing API action creators for querying, e.g. as
//     returned by makeQueryActions.
//   propsToParams (optional) :: props -> Object, a function that maps the
//     component's props to an object representing query parameters for the API query
//     If this function is not given, instances of this component should instead
//     directly define the query parameters object as the value of their
//     queryParams prop.
// 
export function connectWithApiQuery(Component, queryActions, propsToParams) {

    const makeParams = propsToParams || function (props) {
        if (props.queryParams === undefined) {
            throw new InternalError('withApiQuery was given neither '
                                    + 'a propsToParams function nor a queryParams prop');
        }
        return props.queryParams;
    };

    class APIQueryWrapper extends React.Component {

        constructor(props) {
            super(props);
        }
        
        componentDidMount() {
            if (this.props.data === undefined) {
                this.props.queryData();
            }
        }

        render() {
            return (
                <Component data={this.props.data} {...this.props}/>
            );
        }
    };
    
    function mapDispatchToProps(dispatch, ownProps) {
        const params = makeParams(ownProps);
        return {
            queryData: () => dispatch(queryActions.doQuery(params)),
        };
    };

    const Connected = connect(undefined, mapDispatchToProps)(APIQueryWrapper);
    Connected.displayName = (Component.displayName || Component.name || 'Component') + 'WithApiQuery';

    return Connected;
}


