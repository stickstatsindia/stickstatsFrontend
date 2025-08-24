// src/app/config/api.config.ts

export const environment = {
  port: '3000',
  baseUrl: 'http://localhost:3000',
  endpoints: {
    getTeams: '/api/teams',
    addTeam: '/api/tournament/:tournament_id/team',
    updateTeam: '/api/teams/update',
    deleteTeam: '/api/teams/delete',
    getTournaments: '/api/tournaments',
    addTournament: '/api/addtournaments',
    getTournamentById: '/api/tournaments/:tournament_id',
    addUser:"/api/users",
    getUserByPhone:'/api/users/phone/:phone',
  }
};
