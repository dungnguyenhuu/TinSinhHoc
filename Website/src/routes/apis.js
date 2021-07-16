const baseAPI = 'http://localhost:5000/api';
const baseUserAPI = baseAPI + '/users';
const baseAPIKeyAPI = baseAPI + '/api-keys';
const baseAPICallAPI = baseAPI + '/api-calls';
const baseStatisticsAPI = baseAPI + '/statistics';
const baseTokensAPI = baseAPI + '/tokens';
const baseDemonstrationAPI = baseAPI + '/demonstrate';

export default {
  users: {
    register: baseUserAPI + '/register',
    login: baseUserAPI + '/login',
    profile: baseUserAPI,
    list: baseUserAPI,
    listAll: baseUserAPI + '/all',
    details: baseUserAPI,
    delete: baseUserAPI,
    changePassword: baseUserAPI + '/change-password',
  },
  apiKeys: {
    list: baseAPIKeyAPI,
    details: baseAPIKeyAPI,
    delete: baseAPIKeyAPI,
    detailsByUser: baseAPIKeyAPI + '/users',
    create: baseAPIKeyAPI,
    createForUser: baseAPIKeyAPI + '/create',
    update: baseAPIKeyAPI,
  },
  apiCalls: {
    list: baseAPICallAPI,
    details: baseAPICallAPI,
    delete: baseAPICallAPI,
    listByUser: baseAPICallAPI + '/users',
  },
  statistics: {
    general: baseStatisticsAPI,
    users: baseStatisticsAPI + '/users',
    apiKeys: baseStatisticsAPI + '/api-keys',
    apiCalls: baseStatisticsAPI + '/api-calls',
    apiCallsByUser: baseStatisticsAPI + '/api-calls/users',
  },
  tokens: {
    validate: baseTokensAPI + '/validate',
  },
  demonstrate: baseDemonstrationAPI,
};
