const urlRoot = "/api"; // window.location.origin;

// For now, we define only a subset of the endpoints which are already
// available in gernedit.
export const apiPath = {
    conRels: `${urlRoot}/conrels`,
    examples: `${urlRoot}/examples`,
    iliRecords: `${urlRoot}/ili_recs`,
    lexUnits: `${urlRoot}/lexunits`,
    lexRels: `${urlRoot}/lexrels`,
    synsets: `${urlRoot}/synsets`,
    wiktDefs: `${urlRoot}/wikt_defs`, 
};

