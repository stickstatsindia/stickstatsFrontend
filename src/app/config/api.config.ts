// src/app/config/api.config.ts
const runtimeBaseUrl =
  (typeof window !== 'undefined' && (window as any).__APP_CONFIG__?.baseUrl) ||
  'http://localhost:3000';
const normalizedBaseUrl = runtimeBaseUrl.replace(/\/+$/, '');

export const environment = {
  port: '3000',
  baseUrl: normalizedBaseUrl,
  socketUrl: normalizedBaseUrl,
  endpoints: {
    getTeams: '/api/teams',
    addTeam: '/api/tournament/:tournament_id/team',
    updateTeam: '/api/teams/:team_id',
    deleteTeam: '/api/teams/:team_id',
    getTournaments: '/api/tournaments',
    addTournament: '/api/addtournaments',
    getTournamentById: '/api/tournaments/:tournament_id',
    getTournamentPointsTable: '/api/tournament/:tournament_id/points-table',
    addUser:"/api/users",
    getUserByPhone:'/api/users/phone/:phone',
    getUserById: '/api/users/:user_id',
    getTeamsByTournamentId: '/api/:tournament_id/teams',
    addplayer: '/api/teams/:team_id/members',
    getPlayersByTeamId: '/api/team/:team_id/members',
    addPool: '/api/:tournament_id/pool',
    getPools: '/api/tournaments/:tournament_id/add-list',
    editTournament: '/api/tournaments/:tournament_id',
    getALlMatches: '/api/matches'
  }
};
