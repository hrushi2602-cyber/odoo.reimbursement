import axios from 'axios';

// Create an Axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// We can add interceptors here if needed for auth tokens in the future.
// Right now, the backend uses user_id in the payload for identification.

export default api;
