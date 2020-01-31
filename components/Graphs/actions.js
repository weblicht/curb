import { makeQueryActions } from '../APIWrapper/actions';
import { apiPath } from '../../constants';

export const hnymPathQueries = makeQueryActions('HNYM_PATH', apiPath.hnymPaths,
                                                // params transformer allows us to use makeByIdReducer:
                                                params => ({ id: `from${params.fromSynsetId}to${params.toSynsetId}` })
                                               ); 

