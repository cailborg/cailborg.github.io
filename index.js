var _ = require("lodash");
const { teams } = require("./teams");
var fs = require("fs");
const json = JSON.parse(fs.readFileSync("./data.json", "utf8"));
var stats = fs.statSync("./data.json", "utf8");
var mtime = JSON.stringify(stats.mtime);

var formatted = mtime.replace(/"/, "").replace("T", " ").replace(/\..+/, "");

// Store scores for each team here
const scores = [];

async function main() {
  // Loop over each team and check whether a player in data.json matches and assign to that team
  for (var team in teams) {
    let lineup = teams[team].player;
    let values = Object.values(lineup);
    let front = [];
    let back = [];
    let all = [];

    for (const val of values) {
      let match = Object.values(json).filter((x) => x.playerName === val)[0];
      let sum = match
        ? match.points * 1 +
          match.rebounds * 1.5 +
          match.assists * 1.5 +
          match.steals * 2 +
          match.blocks * 2 -
          match.turnovers * 2
        : 0;

      let name = match ? match.playerName : "Unknown Player";
      // console.log(team, match)
      // console.log( match ? match.playerName: "Player doesn't exist", sum)
      function courtFinder(position, playerName) {
        if (playerName === "Unknown Player") {
          return "BENCHED";
        } else if (playerName === "Jaylen Brown") {
          return "Front";
        } else if (playerName === "Joe Harris") {
          return "Back";
        } else if (playerName === "Kent Bazemore") {
          return "Back";
        } else if (playerName === "LeBron James") {
          return "Front";
        } else if (playerName === "Evan Fournier") {
          return "Back";
        } else if (playerName === "Dillon Brooks") {
          return "Front";
        } else if (playerName === "DeMar DeRozan") {
          return "Back";
        } else if (position === "SG" || position === "PG") {
          return "Back";
        } else {
          return "Front";
        }
      }
      let court = courtFinder(match ? match.position : "bench", name);
      // console.log(match ? name : "Player doesn't exist", court);

      // create the player array and push it into the team array

      let data = [name, match ? match.position : "unknown", court, sum];
      if (data[2] === "Front") {
        front.push(data);
      } else {
        back.push(data);
      }
      // Sort lineup by score
      all.push(data);
      
    }
    all.sort((a, b) => b[3] - a[3]);
      console.log(team, all);
      let sidepot = all.slice(5, 10);
      // console.log("sidepot", sidepot)
    //Sort the results by court position and score

    front.sort((a, b) => b[3] - a[3]);
    back.sort((a, b) => b[3] - a[3]);
    //  console.log(front, back);

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

    let sumSidepot = sidepot.reduce(
      (accumulator, currentValue) => accumulator + currentValue[3],
      0
    );
    // console.log(sumSidepot)

    let total = sumBack + sumFront;
    // console.log ("total score", total)
    // push results to the store
    scores.push([
      team,
      total,
      teamPlayersFront,
      teamPlayersBack,
      sixth,
      teamPlayersScoreFront,
      teamPlayersScoreBack,
      sumSidepot
    ]);
  }
  // Do something with scores
  let scoreMain = [...scores].sort((a, b) => b[1] - a[1]);
  // console.log("scores", scoreMain);

  // Sort sixth man leaderboard
  let scoreSix = [...scores].sort((a, b) => b[4][0][3] - a[4][0][3]);

  let scoreSidepot = [...scores].sort((a, b) => b[7] - a[7]);
  // console.log(scoreSidepot)
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
    let sideBoard = sideLeaderboard(scoreSidepot);

    return (
      "<!DOCTYPE html>" +
      "<html><head>" +
      header +
      "</head><body><div class=" +
      "main>" +
      "<img src=" +
      "assets/logo.svg" +
      " />" +
      "<span class=date>Last updated: " +
      formatted +
      " </span>" +
      body +
      "<h2>Sixth Man Leaderboard</h2>" +
      "<ul>" +
      sixthBoard +
      "</ul>" +
      "<h2>6-11 Leaderboard</h2>" +
      "<ul>" +
      sideBoard +
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

  function sideLeaderboard(scores) {
    var result = "";
    for (let value of scores) {
      result +=
        "<li>" +
        "<span>" +
        value[0] +
        "</span>" +
        "<span>" +
        value[7] +
        "</span>" +
        "</li>";
    }
    return result;
  }

  // Generate index.html
  var fileName = "index.html";
  var stream = fs.createWriteStream(fileName);

  stream.once("open", function (fd) {
    var html = buildHtml();

    stream.end(html);
    console.log("Build complete");
  });
}
main();
