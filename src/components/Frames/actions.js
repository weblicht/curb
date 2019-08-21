import { makeQueryActions } from '../APIWrapper';
import { apiPath } from '../../constants';

export const framesQueries = makeQueryActions('FRAMES', apiPath.frames);

