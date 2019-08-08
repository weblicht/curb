import { makeApiActions } from '../APIWrapper';
import { apiPath } from '../../constants';
import { updateDataFrom } from '../DataContainer/actions';

import axios from 'axios';

const lexUnitsEndpoints = { get: apiPath.displaylexunits }
export const lexUnitsActions = makeApiActions('LEX_UNITS', lexUnitsEndpoints);



