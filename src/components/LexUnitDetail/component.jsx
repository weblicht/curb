import { lexUnitsActions, wiktDefsActions, iliActions, examplesActions } from './actions';
import { selectLexUnits, selectWiktDefs, selectIliDefs, selectExamples } from './selectors';
import { connectWithApi, withNullAsString } from '../../helpers';

import React from 'react';
import { connect } from 'react-redux';

// Maps all data fields in lex unit objects to their display names.
const lexUnitFieldMap = [
    ['id', 'Lex Unit Id'],
    ['synsetId', 'Synset Id'],
    ['orthForm', 'Orth Form'],
    ['orthVar', 'Orth Var'],
    ['oldOrthForm', 'Old Orth Form'],
    ['oldOrthVar', 'Old Orth Var'],
    ['source', 'Source'],
    ['namedEntity', 'Named Entity'],
    ['artificial', 'Artificial'],
    ['styleMarking', 'Style Marking'],
    ['comment', 'Comment']
];


// DefList
// TODO: this is a generic display component and should probably live in a different place
// props:
//   className :: String  (CSS class for dl)
//   terms :: [ String ]
//   defs :: [ String ]
// terms and defs should be co-indexed
function DefList(props) {
    return (
        <dl className={props.className}>
                {props.terms.map(
                    (term, idx) =>
                        <React.Fragment key={term}>
                          <dt>{term}</dt>
                          <dd>{props.defs[idx]}</dd>
                        </React.Fragment>
                )}
        </dl>
    );
}


// props:
//   lexUnit :: String
//   fetchParams :: { lexUnitId: ... }
// TODO: need at least table and dl variants of this

function WiktionaryDefs(props) {
    const terms = props.data.map( _ => props.lexUnit );
    const defs = props.data.map( d => d.wknParaphrase ); 
    return (
        <DefList className="wiktionary" terms={terms} defs={defs}/>
    );
}
WiktionaryDefs = connectWithApi(selectWiktDefs, wiktDefsActions.fetchActions)(WiktionaryDefs);
export { WiktionaryDefs };

// props:
//   fetchParams :: { lexUnitId: ... }
function ILIDefs(props) {
    const terms = props.data.map( d => d.relation.replace('_', ' '));
    const defs = props.data.map( d => d.pwn20Paraphrase );
    return ( <DefList className="ili" terms={terms} defs={defs} /> );
}
ILIDefs = connectWithApi(selectIliDefs, iliActions.fetchActions)(ILIDefs);
export { ILIDefs };


// props:
//   fetchParams :: { lexUnitId: ... }
function Examples(props) {
    const terms = props.data.map( d => d.frameType );
    const defs = props.data.map( d => d.text );
    return (
          <DefList className="examples" terms={terms} defs={defs}/>
    );
}
Examples = connectWithApi(selectExamples, examplesActions.fetchActions)(Examples);
export { Examples };


// props:
//   fetchParams :: { id: ... }
//   displayAs :: | | | Component
class LexUnitDetail extends React.Component {
    constructor(props) {
        super(props);
        this.asSimpleLi = this.asSimpleLi.bind(this);
        this.asDetailedLi = this.asDetailedLi.bind(this);
        this.asOption = this.asOption.bind(this);
        this.asTableRow = this.asTableRow.bind(this);
    }

    asSimpleLi() {
        return (
            <li key={this.props.data.id}>{withNullAsString(this.props.data.orthForm)}</li>
        );
    }

    asDetailedLi() {
        const luId = this.props.data.id;
        return (
            <li key={luId}>
              <Examples fetchParams={{lexUnitId: luId}}/>
              <WiktionaryDefs fetchParams={{lexUnitId: luId}}/>
              <ILIDefs fetchParams={{lexUnitId: luId}}/>
            </li>
        );
    }

    asOption() {
        return (
            <option key={this.props.data.id} value={this.props.data.id}>
              { withNullAsString(this.props.data.orthForm) } 
            </option>
        );
    }
    
    asTableRow() {
        return (
            <tr key={this.props.data.id} id={this.props.data.id} className="lexunit-detail">
              {this.props.displayFields.map(
                  (field) => <td>{ withNullAsString(this.props.data[field]) }</td>
              )}
            </tr>
        );
    }

    render () {
        if (typeof this.props.displayAs === 'function') {
            const Renderer = this.props.displayAs;
            return (<Renderer {...this.props} />);
        }

        switch (this.props.displayAs) {
        case 'simpleLi': {
            return this.asSimpleLi();
        }
        case 'detailedLi': {
            return this.asDetailedLi();
        }
        case 'tableRow': {
            return this.asTableRow();
        }
        case 'option': {
            return this.asOption();
        }
        default:    
            return null;
        }
    }
}
LexUnitDetail.defaultProps = {
    // names of data fields that should be displayed by default:
    displayFields: lexUnitFieldMap.map( entry => entry[0]),
};

// TODO: there is actually a hole in the API here. We can't at present
// request lex unit details by ID.  So we need to pass data= directly
// from a parent, e.g., LexUnitsContainer, and can't wrap
// LexUnitDetail with connectWithApi().

// props:
//   fetchParams :: { synsetId: ... }
//   displayAs :: | | | Component
//   unitsDisplayAs :: will be passed to LexUnitDetail as its displayAs prop
class LexUnitsContainer extends React.Component {
    constructor(props) {
        super(props);
        this.asList = this.asList.bind(this);
        this.asSelect = this.asSelect.bind(this);
        this.tableHeaders = this.tableHeaders.bind(this);
        this.asTable = this.asTable.bind(this);

    }

    asList(liDisplay) {
        return (
            <ul>
              {this.props.data.map(
                  lu =>
                      <LexUnitDetail data={lu}
                                     displayAs={this.props.unitsDisplayAs || liDisplay }/>
              )}
            </ul>
        );
                                 
    }

    asSelect() {
        return (
            <select className='lexunit-container'>
              {this.props.data.map(
                  lu => <LexUnitDetail data={lu}
                                       displayAs={this.props.unitsDisplayAs || 'option'}/>
              )}
            </select>
        );
    }

    tableHeaders() {
        const fieldMapObj = Object.fromEntries(this.props.fieldMap);
        return (
            <tr>
              {this.props.displayFields.map(
                  field => <th key={field} scope="col">{fieldMapObj[field]}</th>
              )}
            </tr>
        );
    }

    asTable() {
        return (
            <table className='lexunit-container'>
              <thead>{this.tableHeaders()}</thead>
              <tbody>
                {this.props.data.map(
                    lu => <LexUnitDetail data={lu}
                                         displayAs={this.props.unitsDisplayAs || 'tableRow'}
                                         displayFields={this.props.displayFields}
                          />
                )}
              </tbody>
            </table>
        );
    }

    render() {
        // allow a user-supplied component to render, if given:
        if (typeof this.props.displayAs === 'function') {
            const Renderer = this.props.displayAs;
            return (<Renderer {...this.props} />);
        }

        switch (this.props.displayAs) {
        case 'simpleList':
            return this.asList('simpleLi');
        case 'detailedList':
            return this.asList('detailedLi');
        case 'select':
            return this.asSelect();
        case 'table':
            return this.asTable();
        default:
            return null;
        }
    }

}
LexUnitsContainer.defaultProps = {
    fieldMap: lexUnitFieldMap,
    displayFields: lexUnitFieldMap.map( entry => entry[0] )
};
LexUnitsContainer = connectWithApi(selectLexUnits,
                                   lexUnitsActions.fetchActions
                                   )(LexUnitsContainer);


export { LexUnitsContainer }
