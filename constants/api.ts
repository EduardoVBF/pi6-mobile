import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://frotinix.eastus2.cloudapp.azure.com/',
  baseURL: 'https://frotinix.duckdns.org/',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
