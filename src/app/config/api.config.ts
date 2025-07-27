// src/app/config/api.config.ts

export const environment = {
  port: '3000',
  baseUrl: 'http://localhost:3000',
  endpoints: {
    getTeams: '/api/teams',
    addTeam: '/api/teams/add',
    updateTeam: '/api/teams/update',
    deleteTeam: '/api/teams/delete',
    getTournaments: '/api/tournaments',
    addTournament: '/api/addtournaments',
    updateTournament: '/api/tournaments/update',
    deleteTournament: '/api/tournaments/delete'
  }
};
