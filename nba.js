
//This file works when called within a static HTML page

async function getTeams(){
    var docRef = db.collection("teams").doc("teamDocument");
    let teams = await docRef.get().then(function(doc) {
            if (doc.exists) {
                console.log("Document data:", doc.data().team);
                let teams = doc.data().team
                return teams
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
            
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
    console.log ("test", teams)
    return teams
  };
  
// Load in the right json object based on the player ID and calculate points

async function nbaFetch(playerID){
    let playerdashboardbygeneralsplits = await fetch('https://www.balldontlie.io/api/v1/stats?seasons[]=2018&per_page=150&player_ids[]=' + playerID + '&postseason=false', {
        mode: 'cors',
        method: "GET",
        headers: {     
        "accept-encoding": "Accepflate, sdch",
        "accept-language": "he-IL,he;q=0.8,en-US;q=0.6,en;q=0.4",
        "cache-control": "max-age=0",
        connection: "keep-alive",
        },
    })

    let nbaFileStruct = await playerdashboardbygeneralsplits.json()
    let game = nbaFileStruct.data
    let name = nbaFileStruct.data[3].player.first_name + " " + nbaFileStruct.data[3].player.last_name
// Loop through each game to grab each stat and push them into an array
    let assists = []
    let points = []
    let rebounds = []
    let tov = []
    let steals = []
    let blocks = []
      game.map(function(elem) {
        assists.push(elem.ast)
        points.push(elem.pts)
        rebounds.push(elem.reb)
        tov.push(elem.turnover)
        steals.push(elem.stl)
        blocks.push(elem.blk)
      });
// Reduce each array to its sum
    let sumPoints = points.reduce( (a, b) => { return a + b}, 0);
    let sumAssists = assists.reduce( (a, b) => { return a + b}, 0);
    let sumRebounds = rebounds.reduce( (a, b) => { return a + b}, 0);
    let sumSteals = steals.reduce( (a, b) => { return a + b}, 0);
    let sumBlocks = blocks.reduce( (a, b) => { return a + b}, 0);
    let sumTOV = tov.reduce( (a, b) => { return a + b}, 0);
// Add the results and the custom multipliers to get a total points for each player
    let total = sumPoints + sumAssists*1.5 + sumRebounds*1.5 + sumSteals*2 + sumBlocks*2 - sumTOV*2
    // console.log(total, sumPoints, sumRebounds, sumAssists, sumSteals, sumBlocks, sumTOV, name)
    return [total, "<br>" + name, "<br>" + total]
}

// Loop over each of the teams & player IDs and push to our Output array
const playerLoop = async function(teams) {
    console.log("firebase", teams)
    return await Promise.all(teams.map(function(team) {
        // Looping over the array of players should fill this array with results
        let output = []
        let playerScores = []
        let playerNames = []
        return Promise.all(team.players.map(async (playerID) => {
            let contents = await nbaFetch(playerID)
            output.push(contents[0])
            playerScores.push(contents[2])
            playerNames.push(contents[1])
            // Wait till all the iterations have completed and process the results
        })).then(function() {
            // Sort numerically and remove smallest number
            output.sort(function(a, b){return b-a});
            output.pop();
            // Calculate sum of remaining numbers
            let sum = output.reduce( (a, b) => { return a + b}, 0);
            let total = [team.name, sum, playerNames, playerScores]
            return total
        }, function(err) {
            // error occurred
            console.log('broken')
        });
    }));
}

//Return all the sums and then do something

async function main(){
    const teams = await getTeams();
    teams.join();
    let score = await playerLoop(teams);
    var location = document.getElementById("container");
    var html = "<ul id=" + "table" + ">";
    for (var i = 0; i < score.length; i++) {
        html += "<li class=" + "trigger>" +"<div>" + score[i][0] + "<span class=" + "score>" + score[i][1] + "</span>" + "</div>" + "<ul class=" + "players>" + "<li class=" + "col-2>" + score[i][2].join("") + "</li>" + "<li class=" + "col-2>" + score[i][3].join("") + "</li>" + "</ul>" + "</li>";
    }
    html += "</ul>";
    location.innerHTML = html;
    // document.getElementById("loader").classList.add("fade");
    document.getElementById("loader").remove();
  };

//Trigger the function
main()

