const { teams } = require("./teams");
var fs = require("fs");
const json = JSON.parse(fs.readFileSync("./data.json", "utf8"));

// Store scores for each team here
const scores = [];

async function main() {
  // Loop over each team and check whether a player in data.json matches and assign to that team
  for (var team in teams) {
    let result = teams[team];
    let values = Object.values(result);
    let front = [];
    let back = [];

    for (const val of values) {
      let match = Object.values(json).filter(x => x.playerName === val);

      //Add up the points
      let playerValues = { ...match[0] };
      let sum =
        playerValues.points * 1 +
        playerValues.rebounds * 1.5 +
        playerValues.assists * 1.5 +
        playerValues.steals * 2 +
        playerValues.blocks * 2 -
        playerValues.turnovers * 2;

      function isNumber(val) {
        if (isNaN(val) === true) {
          return 0;
        } else {
          return val;
        }
      }
      let number = isNumber(sum);

      // Determine whether player is back or front court

      function courtFinder(position, playerName) {
        if (playerName === "Jaylen Brown") {
          return "Front";
        } else if (playerName === "Justise Winslow") {
          return "Back";
        } else if (playerName === "DeMar DeRozan") {
          return "Back";
        } else if (position === "SG" || position === "PG") {
          return "Back";
        } else {
          return "Front";
        }
      }
      let courtPosition = courtFinder(
        playerValues.position,
        playerValues.playerName
      );

      // create the player array and push it into the team array

      let data = [
        playerValues.playerName,
        playerValues.position,
        courtPosition,
        number
      ];

      if (data[2] === "Front") {
        front.push(data);
      } else {
        back.push(data);
      }
    }

    //Sort the results by court position and score

    front.sort((a, b) => b[3] - a[3]);
    back.sort((a, b) => b[3] - a[3]);
    // console.log(front, back);

    // Determine 6th man

    let fourthFront = front.slice(3, 4);
    let thirdBack = back.slice(2, 3);

    function sixthMan(back, front) {
      if (back[0][3] > front[0][3]) {
        return back;
      } else {
        return front;
      }
    }
    let sixth = sixthMan(thirdBack, fourthFront);

    // console.log("sixth", sixth);

    // Slice off the top 3 front court and top 2 back court players
    let slicedFront = front.slice(0, 3);
    let slicedBack = back.slice(0, 2);
    // console.log("sliced", slicedBack);

    // Add up the scores
    let sumFront = slicedFront.reduce(
      (accumulator, currentValue) => accumulator + currentValue[3],
      0
    );
    let sumBack = slicedBack.reduce(
      (accumulator, currentValue) => accumulator + currentValue[3],
      0
    );

    var teamPlayersFront = slicedFront.reduce(
      (accumulator, currentValue) => accumulator.concat(currentValue[0]),
      []
    );

    var teamPlayersBack = slicedBack.reduce(
      (accumulator, currentValue) => accumulator.concat(currentValue[0]),
      []
    );
    var teamPlayersScoreBack = slicedBack.reduce(
      (accumulator, currentValue) => accumulator.concat(currentValue[3]),
      []
    );
    var teamPlayersScoreFront = slicedFront.reduce(
      (accumulator, currentValue) => accumulator.concat(currentValue[3]),
      []
    );
    // console.log("playerscore", teamPlayersScoreBack);
    // console.log("playerscore", teamPlayersScoreFront);

    let total = sumBack + sumFront;

    // push results to the store
    // console.log(teamPlayersFront, teamPlayersBack);
    scores.push([
      team,
      total,
      teamPlayersFront,
      teamPlayersBack,
      sixth,
      teamPlayersScoreFront,
      teamPlayersScoreBack
    ]);
  }

  // Do something with scores
  let scoreMain = [...scores].sort((a, b) => b[1] - a[1]);
  // console.log("scores", scoreMain);

  // Sort sixth man leaderboard
  let scoreSix = [...scores].sort((a, b) => b[4][0][3] - a[4][0][3]);

  // console.log("main", scoreMain);
  // console.log("six", scoreSix);

  // Create HTML

  function buildHtml() {
    var header =
      "<title>NBA Fantasy Draft</title>" +
      "<link rel=" +
      "stylesheet " +
      "href=" +
      "css/normalize.css />" +
      "<link rel=" +
      "stylesheet " +
      "href=" +
      "css/style.css />" +
      "<link href=" +
      "https://fonts.googleapis.com/css?family=Teko&display=swap " +
      "rel=" +
      "stylesheet></link>";
    let body = content(scoreMain);
    let sixthBoard = leaderboard(scoreSix);

    return (
      "<!DOCTYPE html>" +
      "<html><head>" +
      header +
      "</head><body><div class=" +
      "main>" +
      "<img src=" +
      "assets/logo.svg" +
      " />" +
      body +
      "<h2>Sixth Man Leaderboard</h2>" +
      "<ul>" +
      sixthBoard +
      "</ul></div></body></html>"
    );
  }

  function content(scores) {
    var result = "";
    for (let value of scores) {
      result +=
        "<div class=" +
        "card>" +
        "<div class=" +
        "card-heading>" +
        "<span>" +
        value[0] +
        "</span>" +
        "<h1>" +
        value[1] +
        "</h1>" +
        "</div>" +
        "<div class=" +
        "card-bottom>" +
        "<h3>Front Court</h3>" +
        "<span>" +
        value[2].join(", ") +
        "</span>" +
        "<div>" +
        "(" +
        value[5].join(", ") +
        ")" +
        "</div>" +
        "<h3>Back Court</h3>" +
        "<span>" +
        value[3].join(", ") +
        "</span>" +
        "<div>" +
        "(" +
        value[6].join(", ") +
        ")" +
        "</div>" +
        "</div>" +
        "</div>";
    }
    return result;
  }

  function leaderboard(scores) {
    var result = "";
    for (let value of scores) {
      // console.log("name", value[4][0]);
      result +=
        "<li>" +
        "<span>" +
        value[0] +
        "</span>" +
        "<span>" +
        value[4][0][0] +
        "<span>" +
        " (" +
        value[4][0][2] +
        ")" +
        "</span>" +
        "</span>" +
        "<span>" +
        value[4][0][3] +
        "</span>" +
        "</li>";
    }
    return result;
  }

  // Generate index.html
  var fileName = "index.html";
  var stream = fs.createWriteStream(fileName);

  stream.once("open", function(fd) {
    var html = buildHtml();

    stream.end(html);
    console.log("Build complete");
  });
}
main();
