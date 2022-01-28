var _ = require("lodash");
const { teams } = require("./newTeams");
var fs = require("fs");
const json = JSON.parse(
  fs.readFileSync("./stats.nba.json", "utf8")
).LeagueDashPlayerStats;
var stats = fs.statSync("./stats.nba.json", "utf8");
var mtime = JSON.stringify(stats.mtime);

var formatted = mtime.replace(/"/, "").replace("T", " ").replace(/\..+/, "");

// Store scores for each team here
const scores = [];

// If player doesn't exist, use blank template
const blank = {
  PLAYER_ID: 0,
  PLAYER_NAME: "Benched Player",
  REB: 0,
  AST: 0,
  TOV: 0,
  STL: 0,
  BLK: 0,
  PTS: 0,
};

async function main() {
  // Loop over each team and check whether a player in stats.nba.json matches and assign to that team
  for (var team in teams) {
    let front = [];
    let back = [];
    let values = Object.values(teams[team]);

    for (const val of values) {
      var match = _.filter(json, function (x) {
        return x.PLAYER_NAME === val.name;
      });
      let filtered = match[0] ?? blank;
      // console.log(team, filtered.PLAYER_NAME)
      let sum =
        filtered.PTS * 1 +
        filtered.REB * 1.5 +
        filtered.AST * 1.5 +
        filtered.STL * 2 +
        filtered.BLK * 2 -
        filtered.TOV * 2;

      if (val.court === "back") {
        back.push([filtered.PLAYER_NAME, sum]);
      } else {
        front.push([filtered.PLAYER_NAME, sum]);
      }
    }
    front.sort((a, b) => b[1] - a[1]);
    back.sort((a, b) => b[1] - a[1]);
    console.log(front, back)

    // Determine 6th man

    let fourthFront = front.slice(3, 4);
    let thirdBack = back.slice(2, 3);

    function sixthMan(back, front) {
      if (back[0][1] > front[0][1]) {
        return back;
      } else {
        return front;
      }
    }
    let sixth = sixthMan(thirdBack, fourthFront);

    //Calculate sidepot

    let remainingBack = back.slice(2)
    let remainingFront = front.slice(3)

    let sumRemainingFront = remainingFront.reduce(
      (accumulator, currentValue) => accumulator + currentValue[1],
      0
    );
    let sumRemainingBack = remainingBack.reduce(
      (accumulator, currentValue) => accumulator + currentValue[1],
      0
    );

    let sumSidepot = sumRemainingBack + sumRemainingFront


    // Slice off the top 3 front court and top 2 back court players
    let slicedFront = front.slice(0, 3);
    let slicedBack = back.slice(0, 2);

    // console.log(slicedFront, slicedBack);

    // Add up the scores
    let sumFront = slicedFront.reduce(
      (accumulator, currentValue) => accumulator + currentValue[1],
      0
    );
    let sumBack = slicedBack.reduce(
      (accumulator, currentValue) => accumulator + currentValue[1],
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
      (accumulator, currentValue) => accumulator.concat(currentValue[1]),
      []
    );
    var teamPlayersScoreFront = slicedFront.reduce(
      (accumulator, currentValue) => accumulator.concat(currentValue[1]),
      []
    );
    let total = sumBack + sumFront;

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
    // console.log(scores)
  }
  // Do something with scores
  let scoreMain = [...scores].sort((a, b) => b[1] - a[1]);

  // Sort sixth man leaderboard
  let scoreSix = [...scores].sort((a, b) => b[4][0][1] - a[4][0][1]);

  let scoreSidepot = [...scores].sort((a, b) => b[7] - a[7]);

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
        "</span>" +
        "</span>" +
        "<span>" +
        value[4][0][1] +
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
