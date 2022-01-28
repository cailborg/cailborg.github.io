const fs = require('fs');
const nba = require('nba-api-client');
nba.leaguePlayerGeneralStats({
    "College": "",
    "Conference": "",
    "Country": "",
    "DateFrom": "",
    "DateTo": "",
    "Division": "",
    "DraftPick": "",
    "DraftYear": "",
    "GameScope": "",
    "GameSegment": "",
    "Height": "",
    "LastNGames": "0",
    "LeagueID": "00",
    "Location": "",
    "MeasureType": "Base",
    "Month": "0",
    "OpponentTeamID": "0",
    "Outcome": "",
    "PaceAdjust": "N",
    "Period": "0",
    "PerMode": "Totals",
    "PlayerExperience": "",
    "PlayerPosition": "",
    "PlusMinus": "N",
    "PORound": "0",
    "Rank": "N",
    "Season": "2021-22",
    "SeasonSegment": "",
    "SeasonType": "Regular+Season",
    "ShotClockRange": "",
    "StarterBench": "",
    "TeamID": "0",
    "TwoWay": "0",
    "VsConference": "",
    "VsDivision": "",
    "Weight": ""
}).then(function(data){
	// console.log(data)
    fs.writeFileSync('stats.nba.json', JSON.stringify(data));
})

// nba-api-client needs to have its headers updated. see: https://github.com/swar/nba_api/issues/124#issuecomment-579002922 //