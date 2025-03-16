
export const playerData = [
  {
    id: 1,
    name: "MS Dhoni",
    iplTeam: "CSK",
    role: "Wicket-keeper",
    basePrice: 10,
    soldPrice: 25.5,
    teamId: 1,
    isSold: true,
    points: 35
  },
  {
    id: 2,
    name: "Virat Kohli",
    iplTeam: "RCB",
    role: "Batsman",
    basePrice: 15,
    soldPrice: 30.0,
    teamId: 2,
    isSold: true,
    points: 48
  },
  {
    id: 3,
    name: "Rohit Sharma",
    iplTeam: "MI",
    role: "Batsman",
    basePrice: 15,
    soldPrice: 28.5,
    teamId: 3,
    isSold: true,
    points: 42
  },
  {
    id: 4,
    name: "Jasprit Bumrah",
    iplTeam: "MI",
    role: "Bowler",
    basePrice: 12,
    soldPrice: 22.0,
    teamId: 4,
    isSold: true,
    points: 38
  },
  {
    id: 5,
    name: "Ravindra Jadeja",
    iplTeam: "CSK",
    role: "All-rounder",
    basePrice: 10,
    soldPrice: 20.5,
    teamId: 1,
    isSold: true,
    points: 45
  },
  {
    id: 6,
    name: "KL Rahul",
    iplTeam: "LSG",
    role: "Batsman",
    basePrice: 12,
    soldPrice: 24.0,
    teamId: 8,
    isSold: true,
    points: 32
  },
  {
    id: 7,
    name: "Rashid Khan",
    iplTeam: "GT",
    role: "Bowler",
    basePrice: 11,
    soldPrice: 22.5,
    teamId: 5,
    isSold: true,
    points: 40
  },
  {
    id: 8,
    name: "Jos Buttler",
    iplTeam: "RR",
    role: "Wicket-keeper",
    basePrice: 10,
    soldPrice: 21.0,
    teamId: 6,
    isSold: true,
    points: 36
  },
  {
    id: 9,
    name: "Rishabh Pant",
    iplTeam: "DC",
    role: "Wicket-keeper",
    basePrice: 11,
    soldPrice: 23.5,
    teamId: 7,
    isSold: true,
    points: 30
  },
  {
    id: 10,
    name: "Hardik Pandya",
    iplTeam: "GT",
    role: "All-rounder",
    basePrice: 11,
    soldPrice: 22.0,
    teamId: 3,
    isSold: true,
    points: 37
  },
  {
    id: 11,
    name: "Yuzvendra Chahal",
    iplTeam: "RR",
    role: "Bowler",
    basePrice: 8,
    soldPrice: 18.5,
    teamId: 6,
    isSold: true,
    points: 33
  },
  {
    id: 12,
    name: "Shikhar Dhawan",
    iplTeam: "PBKS",
    role: "Batsman",
    basePrice: 8,
    soldPrice: 0,
    teamId: null,
    isSold: false,
    points: 0
  },
  {
    id: 13,
    name: "Bhuvneshwar Kumar",
    iplTeam: "SRH",
    role: "Bowler",
    basePrice: 7,
    soldPrice: 0,
    teamId: null,
    isSold: false,
    points: 0
  },
  {
    id: 14,
    name: "Faf du Plessis",
    iplTeam: "RCB",
    role: "Batsman",
    basePrice: 7,
    soldPrice: 0,
    teamId: null,
    isSold: false,
    points: 0
  },
  {
    id: 15,
    name: "Kane Williamson",
    iplTeam: "GT",
    role: "Batsman",
    basePrice: 6,
    soldPrice: 0,
    teamId: null,
    isSold: false,
    points: 0
  }
];

export const matchData = [
  {
    id: 1,
    matchNumber: 1,
    team1: "CSK",
    team2: "MI",
    matchDate: "2023-09-01T14:00:00Z",
    venue: "Wankhede Stadium",
    isCompleted: true
  },
  {
    id: 2,
    matchNumber: 2,
    team1: "RCB",
    team2: "SRH",
    matchDate: "2023-09-03T14:00:00Z",
    venue: "Chinnaswamy Stadium",
    isCompleted: true
  },
  {
    id: 3,
    matchNumber: 3,
    team1: "RR",
    team2: "PBKS",
    matchDate: "2023-09-05T14:00:00Z",
    venue: "Sawai Mansingh Stadium",
    isCompleted: true
  },
  {
    id: 4,
    matchNumber: 4,
    team1: "KKR",
    team2: "DC",
    matchDate: "2023-09-07T14:00:00Z",
    venue: "Eden Gardens",
    isCompleted: false
  },
  {
    id: 5,
    matchNumber: 5,
    team1: "GT",
    team2: "LSG",
    matchDate: "2023-09-09T14:00:00Z",
    venue: "Narendra Modi Stadium",
    isCompleted: false
  },
  {
    id: 6,
    matchNumber: 6,
    team1: "MI",
    team2: "RCB",
    matchDate: "2023-09-11T14:00:00Z",
    venue: "Wankhede Stadium",
    isCompleted: false
  },
  {
    id: 7,
    matchNumber: 7,
    team1: "CSK",
    team2: "KKR",
    matchDate: "2023-09-13T14:00:00Z",
    venue: "MA Chidambaram Stadium",
    isCompleted: false
  },
  {
    id: 8,
    matchNumber: 8,
    team1: "SRH",
    team2: "RR",
    matchDate: "2023-09-15T14:00:00Z",
    venue: "Rajiv Gandhi Stadium",
    isCompleted: false
  }
];

export const playerScoreData = [
  {
    id: 1,
    playerId: 1,
    matchId: 1,
    points: 12.5
  },
  {
    id: 2,
    playerId: 5,
    matchId: 1,
    points: 15.0
  },
  {
    id: 3,
    playerId: 3,
    matchId: 1,
    points: 8.5
  },
  {
    id: 4,
    playerId: 10,
    matchId: 1,
    points: 10.0
  },
  {
    id: 5,
    playerId: 2,
    matchId: 2,
    points: 18.5
  },
  {
    id: 6,
    playerId: 14,
    matchId: 2,
    points: 14.0
  },
  {
    id: 7,
    playerId: 7,
    matchId: 2,
    points: 9.5
  },
  {
    id: 8,
    playerId: 8,
    matchId: 3,
    points: 16.0
  },
  {
    id: 9,
    playerId: 11,
    matchId: 3,
    points: 13.5
  },
  {
    id: 10,
    playerId: 6,
    matchId: 3,
    points: 11.0
  }
];
