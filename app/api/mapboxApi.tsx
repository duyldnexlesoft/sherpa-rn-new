import {MAPBOX_ACCESS_TOKEN} from '@env';
const MAPBOX_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
import axios from 'axios';
import {omitBy} from 'lodash';

export const geocoding = (searchText: any, limit?: any, country?: any) => {
  const params = omitBy({limit, country, access_token: MAPBOX_ACCESS_TOKEN}, (value: any) => !value);
  return axios.get(`${MAPBOX_URL}/${searchText}.json`, {params});
};
