let sbIndex = 1;
let bbIndex= 0;
let pot = 0;
let playerArr = []
let started = false;
let bet = false;
let bettingRound = 1;
const tracker = document.getElementById("tracker");
const controls = document.getElementById("controls");

//add();
//add();

function startRound() {
  if(playerArr.length < 2) {
    alert("At least 2 players are required");
    return;
  }
  if(started){
    alert("Round has started already");
    return;
  }
  started = true;
  blindUpdate();
}

function startBets(){
  if(!started){
    alert("Round hasn't been started");
    return;
  } else if(bettingRound > 4){
    alert("The round is over, select a winner");
    return;
  }
  getBets();
  bet = true;
  resetBets();
  if(checkAllIn()){
    bettingRound = 4;
  } else {
    bettingRound++;
  }
  return;
}

function getWinner(){
  if(!started){
    alert("Round hasn't started");
    return;
  } else if (!bet){
    alert("There has been no bets");
    return;
  }
  let winnerName = prompt("Enter winners name");
  let winner = playerArr.find(player => player.username === winnerName);
  if(winner){
    winner.stack += pot;
    winner.element.querySelector(".stack").textContent = `${winner.stack}`;
    alert(`${winner.username} Wins The Pot!`);
    resetRound();
  } else {
    alert("Invalid Player");
  }
}

function add(){
  if(started){
    alert("Cannot add while table is in session");
    return;
  }

  const username = prompt("Enter player name");
  if(!username) return;

  const newDiv = document.createElement("div");
  newDiv.classList.add("player");
  newDiv.innerHTML = `${username}<br>Chip Stack: $<span class = "stack">1000</span><br><span class = "blindType"></span>`;

  tracker.insertBefore(newDiv, controls);
  playerArr.push({username: username, stack: 1000, bet: -1, element: newDiv});
}

function blindUpdate(){
  playerArr[bbIndex].element.classList.remove("blind");
  playerArr[sbIndex].element.classList.remove("smallBlind");
  bbIndex = (bbIndex + 1) % playerArr.length;
  sbIndex = (sbIndex + 1) % playerArr.length;

  playerArr[bbIndex].element.classList.add("blind");
  playerArr[bbIndex].element.querySelector(".blindType").textContent = "BB";
  playerArr[bbIndex].stack -= 10;
  playerArr[bbIndex].element.querySelector(".stack").textContent = `Chip Stack: $${playerArr[bbIndex].stack}`;

  playerArr[sbIndex].element.classList.add("smallBlind");
  playerArr[sbIndex].element.querySelector(".blindType").textContent = "SB";
  playerArr[sbIndex].stack -= 5;
  playerArr[sbIndex].element.querySelector(".stack").textContent = `Chip Stack: $${playerArr[sbIndex].stack}`;

  updatePot(15);
}

function getBets(){
  let i = sbIndex;
  let playerBet = -1;
  let currentBet = 0;
  let playerCall = 0;
  do{
    while(playerBet == -1){
      if(playerArr[i].bet != -1){
        playerCall = currentBet - playerArr[i].bet;
      } else{
        playerCall = currentBet;
      }
      let bet = prompt(`${playerArr[i].username} place your bets. \nCurrent Bet: $${playerCall} \nPrice To Call: $${playerCall}\nYour Stack: $${playerArr[i].stack}`);
      if(isValidBet(bet, i, currentBet)){
        playerBet = Number(bet);
        currentBet = playerBet;
        updatePot(playerBet);
        updatePlayerStack(i, playerBet);
      } else if(bet > playerArr[i].stack){
        alert(`${playerArr[i].username} does not have enough chips`);
      } else if(bet < currentBet){
        alert("Please match the current bet");
      } else {
        alert("Please enter a valid number");
      }
    }
    i = (i + 1) % playerArr.length
    playerBet = -1;
  } while(!betsEqual() && !betsAreChecks(i));
}

function updatePot(amount = 0){
  pot += amount;
  document.getElementById("pot").textContent = `Pot: $${pot}`;
}

function updatePlayerStack(index, amount){
  playerArr[index].stack -= amount;
  playerArr[index].element.querySelector(".stack").textContent = playerArr[index].stack;
  playerArr[index].bet += amount;
  if(playerArr[index].stack === 0 && playerArr[index].bet != -1){
    alert("ALL IN!");
  }
}

function isValidBet(bet, i, currentBet){
  if(parseInt(playerArr[i].bet) == -1){
    return (!isNaN(bet) && bet.trim !== "" && bet <= playerArr[i].stack && bet >= currentBet);
  }
  return (!isNaN(bet) && bet.trim !== "" && bet <= playerArr[i].stack && bet >= currentBet + (parseInt(playerArr[i].bet) - currentBet));
}

function betsEqual(){
  const initialBet = playerArr[sbIndex].bet;
  for(let i = 1; i < playerArr.length; i++){
    if(playerArr[i].bet != initialBet || initialBet == -1){
      return false;
    }
  }
  return true;
}

function betsAreChecks(index){
  for(let i = 1; i < playerArr.length; i++){
    if(playerArr[i].bet != -1 || index != sbIndex){
      return false;
    }
  }
  return true;
}

function resetRound(){
  resetBets();
  pot = 0;
  document.getElementById("pot").textContent = `Pot: $${0}`;
  bettingRound = 1;
  started = false;
  bet = false;
}

function resetBets(){
  for(let i = 0; i < playerArr.length; i++){
    playerArr[i].bet = -1;
  }
}

function checkAllIn(){
  for(let i = 0; i < playerArr.length; i++){
    if(playerArr[i].stack != -1) return false;
    console.log(playerArr[i].stack);
  }
  return true;
}