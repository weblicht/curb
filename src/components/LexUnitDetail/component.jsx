import { lexUnitsActions, wiktDefsActions, iliActions, examplesActions } from './actions';
import { selectLexUnits, selectWiktDefs, selectIliDefs, selectExamples } from './selectors';
import { connectWithApi } from '../../helpers';

import React from 'react';
import { connect } from 'react-redux';


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
    }

    asSimpleLi() {
        return (<li key={this.props.data.id}>{this.props.data.orthForm}</li>);
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

    render () {
        switch (this.props.displayAs) {
        case 'simpleLi': {
            return this.asSimpleLi();
        }
        case 'detailedLi': {
            return this.asDetailedLi();
        }
        default:    
            return null;
        }
    }
}
// TODO: there is actually a hole in the API here. We can't at present
// request lex unit details by ID.  So we need to pass data= directly
// from a parent, e.g., LexUnitsContainer, and can't wrap
// LexUnitDetail with connectWithApi().

// props:
//   fetchParams :: { synsetId: ... }
//   displayAs :: | | | Component
class LexUnitsContainer extends React.Component {
    constructor(props) {
        super(props);
        this.asList = this.asList.bind(this);
    }

    asList(liDisplay) {
        return (
            <ul>
              {this.props.data.map(
                  lu =>
                      <LexUnitDetail data={lu} displayAs={liDisplay}/>
              )}
            </ul>
        );
                                 
    }

    render() {
        switch (this.props.displayAs) {
        case 'simpleList':
            return this.asList('simpleLi');
        case 'detailedList':
            return this.asList('detailedLi');
        default:
            console.log(typeof this.props.displayAs);
            return null;
        }
    }

}
LexUnitsContainer = connectWithApi(selectLexUnits,
                                   lexUnitsActions.fetchActions
                                   )(LexUnitsContainer);

export { LexUnitsContainer }
