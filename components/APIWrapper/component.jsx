// Copyright 2020 Richard Lawrence
//
// This file is part of germanet-common.
//
// germanet-common is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// germanet-common is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with germanet-common.  If not, see <https://www.gnu.org/licenses/>.

import { InternalError } from '../../errors'; 

import React from 'react';
import { connect } from 'react-redux';  

// Higher-order component to transparently load a component's data prop via
// an API query.
//
// params:
//   Component: the component to be connected with the API
//   queryActions: an object containing API action creators for querying, e.g. as
//     returned by makeQueryActions.
//   propsToParams (optional) :: props -> Object, a function that maps the
//     component's props to an object representing query parameters for the API query
//     The function should return undefined if no query should be made based on the
//     component's props.
//     If this function is not given, instances of this component should instead
//     directly define the query parameters object as the value of their
//     queryParams prop.
// 
export function connectWithApiQuery(Component, queryActions, propsToParams) {

    const makeParams = propsToParams || function (props) {
        return props.queryParams;
    };

    class APIQueryWrapper extends React.Component {

        constructor(props) {
            super(props);
        }
        
        componentDidMount() {
            const params = makeParams(this.props);
            if (params !== undefined) {
                this.props.query(params);
            }
            // TODO: otherwise, message like this?
            // console.info(`${componentName} was mounted without enough information to make an API query.`);
        }

        componentDidUpdate(prevProps) {
            const prevParams = makeParams(prevProps);
            const newParams = makeParams(this.props);
            if (!isEqualParams(prevParams, newParams) && newParams !== undefined) {
                this.props.query(newParams);
            }
        }

        render() {
            return (
                <Component {...this.props}/>
            );
        }
    };
    
    function mapDispatchToProps(dispatch, ownProps) {
        return {
            query: params => dispatch(queryActions.doQuery(params))
        };
    };

    const componentName = (Component.displayName || Component.name || 'Component') + 'WithApiQuery';
    const Connected = connect(undefined, mapDispatchToProps)(APIQueryWrapper);
    Connected.displayName = componentName ;

    return Connected;
}


// helper to compare two params objects. We assume here that params
// are of the sort that can be passed to axios and understood by our
// backend. That means, in particular, that the params objects do not
// contain nested objects and their internal values are comparable
// with ===.  
function isEqualParams(p1, p2) {
    if (typeof p1 !== typeof p2) return false;
    if (p1 === p2) return true; 

    // prevent type errors below when one value is null (but the other
    // isn't, given the test above)
    if (p1 === null || p2 === null) return false;
    
    const p1Keys = Object.keys(p1).sort();
    const p2Keys = Object.keys(p2).sort();
    if (p1Keys.length !== p2Keys.length) return false;

    var i, k1, k2;
    for (i = 0; i < p1Keys.length; i++) {
        if ((k1 = p1Keys[i]) !== (k2 = p2Keys[i])) return false;
        if (p1[k1] !== p2[k2]) return false; 
    } 
    return true;
}
