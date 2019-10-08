// Copyright 2019 Richard Lawrence
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


