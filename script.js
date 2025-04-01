let sbIndex = -1;
let bbIndex= -1;
let pot = 0;
let playerArr = [];
let handArr = [];
let started = false;
let bet = false;
let bettingRound = 1;
let sb = 5;
let bb = 10;
const tracker = document.getElementById("tracker");
const controls = document.getElementById("controls");

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
  if(checkAllIn() || checkAllFold()){
    bettingRound = 5;
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
    alert("Click on the winner");
}

function awardWinner(player){
    if(!player.fold){
      player.stack += pot;
      player.element.querySelector(".stack").textContent = `${player.stack}`;
      alert(`${player.username} Wins The Pot!`);
      resetRound();
      gotWinner = true;
    } else if(player.fold){
      alert("This user has already folded");
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

  const img = document.createElement("img");
  img.src = "default.png";
  img.alt = `${username}'s profile picture`;
  img.className = "profile-pic";

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "user"; 
  input.style.display = "none";

  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      img.src = event.target.result;
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  img.onclick = () => input.click();

  newDiv.innerHTML = `${username}<br>Chip Stack: $<span class = "stack">1000</span><span class = "blindType"></span><br>`;
  newDiv.appendChild(img);
  newDiv.appendChild(input);
  let playerObject = {username: username, stack: 1000, bet: 0, fold: false, allIn: false, element: newDiv};
  newDiv.addEventListener("click", () => {
    handleUserClick(playerObject);
  });

  tracker.insertBefore(newDiv, controls);
  playerArr.push(playerObject);
}

function blindUpdate(){
  if(bbIndex == -1 && sbIndex == -1){
    bbIndex = 1;
    sbIndex = 0
  } else {
    playerArr[bbIndex].element.classList.remove("blind");
    playerArr[sbIndex].element.classList.remove("smallBlind");
    bbIndex = (bbIndex + 1) % playerArr.length;
    sbIndex = (sbIndex + 1) % playerArr.length;
  }

  playerArr[bbIndex].element.classList.add("blind");
  playerArr[bbIndex].element.querySelector(".blindType").innerHTML = '<br><span class = "bbClass">BB</span>';
  playerArr[bbIndex].stack -= bb;
  playerArr[bbIndex].bet = bb;
  playerArr[bbIndex].element.querySelector(".stack").textContent = `${playerArr[bbIndex].stack}`;

  playerArr[sbIndex].element.classList.add("smallBlind");
  playerArr[sbIndex].element.querySelector(".blindType").innerHTML = '<br><span class = "sbClass">SB</span>';
  playerArr[sbIndex].stack -= sb;
  playerArr[sbIndex].bet = sb;
  playerArr[sbIndex].element.querySelector(".stack").textContent = `${playerArr[sbIndex].stack}`;

  updatePot(sb + bb);
}

function getBets(){
  let i = sbIndex;
  let playerBet = 0;
  let currentBet = 0;
  if(bettingRound == 1){
    currentBet = bb;
  }
  let playerCall = 0;
  let successfulBet = false;
  do{
    while(!successfulBet){
      if(!playerArr[i].fold && !playerArr[i].allIn){
        playerCall = currentBet - playerArr[i].bet;
        let bet = prompt(`${playerArr[i].username} place your bets. \nCurrent Bet: $${currentBet} \nPrice To Call: $${playerCall}\nYour Stack: $${playerArr[i].stack}`);
        if(bet > playerArr[i].stack){
          alert(`${playerArr[i].username} does not have enough chips`);
        } if(bet == -1){
          playerArr[i].fold = true;
          successfulBet = true;
        } else if(isValidBet(bet, i, currentBet)){
          playerBet = Number(bet);
          if(playerBet > currentBet){
            currentBet = playerBet;
          }
          successfulBet = true;
          updatePot(playerBet);
          updatePlayerStack(i, playerBet);
        } else if(playerBet < playerCall){
          alert("Please match the calling price");
        } else {
          alert("Please enter a valid number");
        }
      } else {
        successfulBet = true;
      }
    }
    i = (i + 1) % playerArr.length
    playerBet = 0;
    successfulBet = false;
  } while(!betsEqual(i));
}

function isValidBet(bet, i, currentBet){
  if(bet == playerArr[i].stack && bet <= (currentBet - parseInt(playerArr[i].bet))){
    return true;
  }
  if(bet == -1){
    playerArr[i].fold = true;
    return true;
  }
  return (!isNaN(bet) && bet.trim !== "" && bet <= playerArr[i].stack && bet >= (currentBet - parseInt(playerArr[i].bet)));
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
    playerArr[index].allIn = true;
  }
}

function betsEqual(index){
  const initialBet = playerArr[0].bet;
  if(checkAllIn()){
    return true;
  }
  if(checkAllFold()){
    return true;
  }
  for(let i = 1; i < playerArr.length; i++){
    if(!playerArr[i].fold){
      if(index != sbIndex && playerArr[i].bet == 0 || playerArr[i].bet != initialBet){
        return false;
      }
    }
  }
  return true;
}

function resetRound(){
  resetBets();
  resetFold();
  resetAllIn;
  pot = 0;
  document.getElementById("pot").textContent = `Pot: $${0}`;
  bettingRound = 1;
  started = false;
  bet = false;
}

function changeBlinds(){
  if(!started){
    sb = prompt("Please enter SB amount");
    bb = prompt("Please enter BB amount");
  } else {
    alert("Cant change blinds after round has started");
  }
  return;
}

function handleUserClick(username){
  if(bettingRound > 4){
    awardWinner(username);
  }
  return;
}

function resetBets(){
  for(let i = 0; i < playerArr.length; i++){
    playerArr[i].bet = 0;
  }
}

function resetFold(){
  for(let i = 0; i < playerArr.length; i++){
    playerArr[i].fold = false;
  }
}

function resetAllIn(){
  for(let i = 0; i < playerArr.length; i++){
    playerArr[i].allIn = false;
  }
}

function checkAllIn(){
  for(let i = 0; i < playerArr.length; i++){
    if(!playerArr[i].fold){
      if(!playerArr[i].allIn){
        return false;
      }
    }
  }
  return true;
}

function checkAllFold(){
  let notFold = 0;
  for(let i = 0; i < playerArr.length; i++){
    if(!playerArr[i].fold){
      notFold++;
    }
  }
  if(notFold > 1){
    return false;
  }
  return true;
}
