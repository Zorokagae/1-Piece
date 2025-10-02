import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const pathogenAPI = {
  identify: (sequence, location) => 
    api.post('/pathogen/identify', { sequence, location })
};

export const riskAPI = {
  calculate: (pathogenName, location, staffCount, timeOfDay) =>
    api.post('/risk/calculate', {
      pathogen_name: pathogenName,
      location,
      staff_count: staffCount,
      time_of_day: timeOfDay
    })
};

export const alertAPI = {
  trigger: (riskScore, location, pathogenName) =>
    api.post('/alert/trigger', {
      risk_score: riskScore,
      location,
      pathogen_name: pathogenName
    })
};

export const dashboardAPI = {
  getData: () => api.get('/dashboard/data')
};

export default api;