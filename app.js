/* bogenspiele.mehlhase.info */
/* (c) Sascha Mehlhase - kontakt@mehlhase.info */

// Registering Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// class to describe and keep match data
class bowGame {
  constructor(rules, title, players) {
    this.rules = rules;
    this.id = (new Date()).getTime() * 1000 + Math.floor((Math.random() * 900) + 100);
    this.title = title;
    this.start = (new Date()).toUTCString();
    this.end = null;
    this.arrowsPerFrame = 1;
    this.players = players;
    this.arrows = [];
  }

  addArrow(arrowInfo) {
    this.arrows[Object.keys(this.arrows).length] = arrowInfo;
  }

  delArrow(arrowInfo) {
    this.arrows.pop();
  }
}
// match-data object
let theMatch = null;

window.addEventListener('resize', function(event) {
  let WoverH = 4000 / 4500;
  let border = 20;
  let maxW = Math.min(window.visualViewport.width, window.visualViewport.height * WoverH) - border;
  let maxH = Math.min(window.visualViewport.height, window.visualViewport.width / WoverH) - border;
  // var maxW = Math.min(window.innerWidth, window.innerHeight * WoverH) * 0.95;
  // var maxH = Math.min(window.innerHeight, window.innerWidth / WoverH) * 0.95;
  let shiftX = Math.max(0, (window.visualViewport.width - maxW - border) / 2);
  var boardframe = document.getElementById("boardframe");
  boardframe.style.width = maxW + "px";
  boardframe.style.height = maxH + "px";
  boardframe.style.marginTop = -(maxH / 2) + "px";
  boardframe.style.marginLeft = -(maxW / 2) + shiftX + "px";
  var boardcanvas = document.getElementById("boardcanvas");
  boardcanvas.style.width = maxW + "px";
  boardcanvas.style.height = maxH + "px";
}, true);

window.onload = function() {
  window.dispatchEvent(new Event('resize'));

  document.getElementById("boardcanvas").addEventListener('click', function() {
    drawBoard();
  }, false);

  // set up canvas
  let canvas = document.getElementById("boardcanvas");
  let ctx = canvas.getContext("2d");
  ctx.translate(2000, 2000);

  // function to draw the full board wedges, bull eye and buttons
  function drawBoard(input = "") {
    ctx.save();
      ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width / 2, canvas.height / 2);
      ctx.miterLimit = 4;
      ctx.font = "35px";
      ctx.strokeStyle = "rgba(0, 0, 0, 0)";
      ctx.lineWidth = 0.5;
      ctx.scale(1, 1);
      ctx.save();

        ctx.save();
          if (input == "miss") ctx.fillStyle="rgba(255, 0, 0, 1)";
          else ctx.fillStyle="rgba(222, 222, 222, 1)";
          ctx.beginPath();
          ctx.arc(0, 0, 2000, 0, 2 * Math.PI, true);
          ctx.arc(0, 0, 1950, 0, 2 * Math.PI, false);
//          if (event != null && isInPath(event)) boardHit("miss");
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        ctx.restore();
      ctx.restore();
    ctx.restore();
  }

  // draw plain board to start with
  drawBoard();

  document.getElementById("menusign").addEventListener('click', function() {
    var menu = document.getElementById("menu");
    if (menu.style.width == "50px") {
      menu.style.width = null;
      menu.style.height = null;
    } else {
      menu.style.width = "50px";
      menu.style.height = "50px";
      menu.style.minWidth = "50px";
      menu.style.minHeight = "50px";
    }
  }, false);
  document.getElementById("menu").style.display = "block";

  // setting up text-to-speech feature
  function loadVoices() {
    window.speechSynthesis.getVoices();
    // console.log(window.speechSynthesis.getVoices());
  }
  loadVoices();
  window.speechSynthesis.onvoiceschanged = function(e) {loadVoices();};

  // function to speak out a given text
  function speak(text, callback) {
    let u = new SpeechSynthesisUtterance();
    // u.text = '<?xml version="1.0"?>\r\n<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">' + text + '</speak>';
    u.text = text;
    // u.lang = 'en-US';
    u.lang = 'de-DE';
    u.voice = window.speechSynthesis.getVoices().filter(function(voice) { return voice.name == 'Anna'; })[0];
    u.onend = function () {
      if (callback) {
        callback();
      }
    };
    u.onerror = function (e) {
      if (callback) {
        callback(e);
      }
    };
    window.speechSynthesis.speak(u);
    console.log(text);
  }

  document.getElementById("startmatch").addEventListener('click', function() {
    createNewMatch();
  });

  function createNewMatch() {
    let playernames = document.getElementById("players").value.trim().split(/\r|\r\n|\n/);   
    let points = document.getElementById("points").value;

    let players = [];
    playernames.forEach(function(item) {
      players.push({"name": item.trim(), "startpoints": points});
    });

    var rules = document.getElementById("rules");
    var rulestext= rules.options[rules.selectedIndex].text;
    speak("Neues Spiel mit " + players.length + " Spieler*innen mit je " + points + " Punkten. " + rulestext);
    theMatch = new bowGame(rules.value, rulestext, players);
    // launch game manager
    gameManager(theMatch);
  }

  function boardHit(input) {
    if (isNaN(input)) {
      input = parseInt(this.innerHTML.replace("&nbsp;", ""));
      if (isNaN(input)) input = "XXX";
    }
    let arrowInfo = {"input": input};
    gameManager(theMatch, arrowInfo);
  }

  function gameManager(theMatch, addArrow = {}, outdiv = "monitordiv") {
    // check if match is set up
    if (!theMatch) return;

    // add new arrow, if set
    if (Object.keys(addArrow).length > 0) {
      if (addArrow.input < 0) {
        // delete last arrow for undo button
        theMatch.arrows.pop();
      } else {
        // add arrow if match has not ended yet
        if (!theMatch.end) theMatch.arrows[Object.keys(theMatch.arrows).length] = addArrow;
      }
    }
    // apply rules and check whether match has finished
    if (!theMatch.end || (Object.keys(addDart).length > 0 && addDart.input < 0)) {
      if (["TS9", "TS16", "TS10", "TS5"].includes(theMatch.rules)) {
        gameRulesTS(theMatch, outdiv);
      }
    }
    // console.log(theMatch);
  }

  // rules for Tortenschießen
  function gameRulesTS(theMatch, outdiv) {
    let numAreas = parseInt(theMatch.rules.replace("TS", ""));
    let numButtons = numAreas + 2;
    let radius = 4000 / numButtons / 2;

    // draw buttons
    ctx.save();
      ctx.fillStyle="rgba(222, 222, 222, 1)";
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI, true);
      // if (event != null && isInPath(event)) boardHit("miss");
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    ctx.restore();

    let areas = [];

    let currPlayer = 0;
    let rankCount = theMatch.players.length;

    // how many dart left for current player in frame
    let arrowsLeftInFame = theMatch.arrowsPerFrame;

    // add some details to players
    for (let p in theMatch.players) {
      theMatch.players[p]["arrows"] = [];
      theMatch.players[p]["done"] = false;
      theMatch.players[p]["rank"] = "";
      theMatch.players[p]["points"] = theMatch.players[p]["startpoints"];
      theMatch.players[p]["targets"] = [];
    }

    let statistics = {};
    statistics["areastats"] = {};
    for (let i = 0; i < numAreas; ++i) {
      statistics["areastats"][i + 1] = 0;
    }
    statistics["areastats"]["XXX"] = 0;
    statistics["players"] = [];
    for (let p1 in theMatch.players) {
      statistics["players"][p1] = {};
      statistics["players"][p1]["areastats"] = JSON.parse(JSON.stringify(statistics["areastats"]));
    }

    // loop on arrows
    for (let a in theMatch.arrows) {
      // reduce the number of dart in
      --arrowsLeftInFame;

      // add dart to player's darts list
      theMatch.players[currPlayer]["arrows"][Object.keys(theMatch.players[currPlayer]["arrows"]).length] = theMatch.arrows[a];

      // add some stats
      statistics["areastats"][theMatch.arrows[a].input] += 1;
      statistics["players"][currPlayer]["areastats"][theMatch.arrows[a].input] += 1;

      let targetPlayer = currPlayer;
      if (isNaN(theMatch.arrows[a].input)) {
        theMatch.players[currPlayer]["points"] -= 2;
      } else {
        var steps = theMatch.arrows[a].input;
        while (steps > 0) {
          ++targetPlayer;
          if (targetPlayer >= Object.keys(theMatch.players).length) targetPlayer = 0;
          if (theMatch.players[targetPlayer]["done"]) continue;
          --steps;
        }
        theMatch.players[targetPlayer]["points"] -= theMatch.arrows[a].input;
      }

      currPlayer = targetPlayer;
      arrowsLeftInFame = theMatch.arrowsPerFrame;

      for (let p2 in theMatch.players) {
        if (theMatch.players[p2]["points"] <= 0 && !theMatch.players[p2]["done"]) {
          theMatch.players[p2]["points"] = 0;
          theMatch.players[p2]["done"] = true;
          theMatch.players[p2]["rank"] = rankCount;
          --rankCount;
        }
      }

      // check whether match is fully over (all but one play finished)
      let numDone = 0;
      for (let p2 in theMatch.players) {
        if (theMatch.players[p2]["done"]) ++numDone;
      }
      if (numDone + 1 >= Object.keys(theMatch.players).length) {
        theMatch.end = (new Date()).toUTCString();
        speak("Das Spiel ist vorbei!");
        currPlayer = -1;
        for (let p2 in theMatch.players) {
          if (!theMatch.players[p2]["done"]) {
            theMatch.players[p2]["done"] = true;
            theMatch.players[p2]["rank"] = rankCount;
            --rankCount;
          }
        }
      } else {
        theMatch.end = null;
      }

    }

    if (!theMatch.end) {
      var step = 1;
      targetPlayer = currPlayer;
      while (step <= numAreas) {
        ++targetPlayer;
        if (targetPlayer >= Object.keys(theMatch.players).length) targetPlayer = 0;
        if (theMatch.players[targetPlayer]["done"]) continue;
        theMatch.players[targetPlayer]["targets"].push(step);
        ++step;
      }      
    }

    let outstring = "<h2>" + theMatch.title + "</h2>\n";
    outstring += "<table>\n";
    outstring += "<thead>\n";
    outstring += "<tr>\n";
    outstring += "<th></th>\n";
    outstring += "<th></th>\n";
    outstring += "<th>Ziele</th>\n";
    outstring += "<th>Punkte</th>\n";
    outstring += "<th>Pfeile</th>\n";
    outstring += "<th>Platz</th>\n";
    outstring += "</tr>\n";
    outstring += "</thead>\n";
    outstring += "<tbody>\n";
    for (let p in theMatch.players) {
      outstring += "<tr " + (theMatch.players[p]["rank"] == "1" ? " style=\"background-color: #efe;\"" : "") + ">\n";
      if (p == currPlayer) {
        outstring += "<th>";
        for (let n = 0; n < theMatch.arrowsPerFrame; ++n) {
          if (theMatch.arrowsPerFrame - arrowsLeftInFame > n) outstring += "=";
          else outstring += "&gt;";
        }
        outstring += "</th>\n";
      } else outstring += "<th></th>\n";
      outstring += "<th>" + theMatch.players[p]["name"] + "</th>\n";
      outstring += "<td>" + theMatch.players[p]["targets"].join(", ") + "</td>\n";
      outstring += "<th>" + theMatch.players[p]["points"] + "</th>\n";
      outstring += "<td>" + Object.keys(theMatch.players[p]["arrows"]).length + "</td>\n";
      outstring += "<td>" + theMatch.players[p]["rank"] + "</td>\n";
      outstring += "</tr>\n";
    }
    outstring += "<tr>\n";
    if (theMatch.arrows[Object.keys(theMatch.arrows).length - 1]) {
      outstring += "<td colspan=\"6\">Letzter Pfeil: " + theMatch.arrows[Object.keys(theMatch.arrows).length - 1]["input"] + "</td>\n";
    } else {
      outstring += "<td colspan=\"6\">Das Spiel hat noch nicht begonnen.</td>\n";
    }
    outstring += "</tr>\n";
    outstring += "</tbody>\n";
    outstring += "</table>\n";

    outstring += "<hr />\n";

    outstring += "<div id=\"monitorstats\">\n";
    outstring += "<h3>Statistik</h3>\n";
    outstring += "<table>\n";
    outstring += "<tbody>\n";
    outstring += "<tr>\n";
    outstring += "<td></td>\n";
    for (let a in statistics["areastats"]) {
      outstring += "<th class=\"boardHit\">" + (a < 10 ? "&nbsp;" : "") + a + "</th>\n";
    }
    outstring += "</tr>\n";
    outstring += "<tr>\n";
    outstring += "<th>Alle</th>\n";
    for (let a in statistics["areastats"]) {
      outstring += "<td>" + (a < 10 ? "&nbsp;" : "") + (statistics["areastats"][a] > 0 ? statistics["areastats"][a] : "&nbsp;") + "</td>\n";
    }
    outstring += "</tr>\n";
    for (let p in theMatch.players) {
      outstring += "<tr>\n";
      outstring += "<th>" + theMatch.players[p]["name"] + "</th>\n";
      for (let a in statistics["players"][p]["areastats"]) {
        outstring += "<td>" + (a < 10 ? "&nbsp;" : "") + (statistics["players"][p]["areastats"][a] > 0 ? statistics["players"][p]["areastats"][a] : "&nbsp;") + "</td>\n";
      }
      outstring += "</tr>\n";
    }
    outstring += "</tbody>\n";
    outstring += "</table>\n";
    outstring += "<p class=\"boardHit\">-1</p>";
    document.getElementById(outdiv).innerHTML = outstring;

    // add actions to stats numbers
    var elements = document.getElementsByClassName("boardHit");
    for (var i = 0; i < elements.length; ++i) {
      elements[i].addEventListener('click', boardHit, false);
    }
  }

};

