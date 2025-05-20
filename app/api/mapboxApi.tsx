/* eslint-disable import/no-unresolved */
import {MAPBOX_ACCESS_TOKEN} from '@env';
import axios from 'axios';
import { omitBy } from 'lodash';
const MAPBOX_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

export const geocoding = (searchText: any, limit?: any, country?: any) => {
  const params = omitBy({limit, country, access_token: MAPBOX_ACCESS_TOKEN}, (value: any) => !value);
  return axios.get(`${MAPBOX_URL}/${searchText}.json`, {params});
};
