const field = document.querySelector('.gameField')
const btn = document.getElementById('startGame')
const reset = document.getElementById('reset')
const container = document.querySelector('.container')
const size = 9
const boxSize = 3

// Add click listener to the document to check if the click wasn't in table or tipBox then don't respond
document.addEventListener('mousedown', (e) => {
  const getClick = e.target.parentElement
  if (getClick === field || getClick === document.querySelector('.tipBox')) return
  e.preventDefault();
  closeTip()
})

//Show spinner when calculating
btn.addEventListener('mousedown', () => {
  btn.innerHTML = `<img src='./832.svg' alt='img'>`
})

btn.addEventListener('click', startGame)
reset.addEventListener('click', resetGame)

// Creating cells and add them to the field dynamically
function createField() {
  for (let i = 0; i < 81; i++) {
    field.innerHTML += `<input id=${i}
      type="text"
      autocomplete="off"
      maxlength="1"
      onmouseover="drawGrid(event)"
      onmouseout="drawGrid(event)"
      onclick="showTipsField(event)"
      onkeydown="validateInput(event)"
      style='
      border-top:${i < 9 ? "1px solid black" : null};
      border-right:${(i + 1) % 3 === 0 ? "1px solid black" : null}; 
      border-bottom:${i >= 18 && i <= 26 || i >= 45 && i <= 53 || i >= 72 && i <= 80 ? "1px solid black" : null};
      border-left:${i % 9 === 0 ? "1px solid black" : null};'
      ${i === 0 && 'autofocus'} 
      '>`
  }
}

//Creatig tipBox with numbers
function showTipsField(e) {
  document.querySelector('.tipBox') && container.removeChild(document.querySelector('.tipBox'))
  const calculator = document.createElement('div')
  calculator.classList.add('tipBox')
  calculator.style.top = e.y + 'px';
  calculator.style.left = e.x + 'px'
  for (let i = 1; i < 10; i++) {
    calculator.innerHTML += `<p class='numbers' onclick='getNumberTip(event, ${e.target.id})'>${i}</p>`
  }
  container.appendChild(calculator)
}

function closeTip() {
  document.querySelector('.tipBox') && document.querySelector('.tipBox').classList.add('closeTip')
}

// Getting Number from tipBox and sending to current input
function getNumberTip(e, curInput) {
  closeTip()
  const elem = field.querySelectorAll('input')[curInput]
  elem.value = +e.target.textContent
  elem.classList.add('yellow')
}

//Validating input from keyboard
function validateInput(evt) {
  let theEvent = evt || window.event;
  let key = theEvent.keyCode || theEvent.which;
  if (key !== 46 && key < 49 || key > 57 && key < 97 || key > 105) {
    theEvent.returnValue = false;
    if (theEvent.preventDefault) theEvent.preventDefault();
  } else {
    closeTip()
    if (key === 46) {
      evt.target.classList.remove('yellow')
      evt.target.value = ''
      return
    }
    evt.target.value ? evt.target.value = '' : null
    evt.target.classList.add('yellow')
  }
}

function startGame() {
  btn.setAttribute('disabled', true);
  const arr = field.querySelectorAll('input')
  const board = [];
  for (let i = 0; i <= arr.length - 1; i += 9) {
    board.push([])
    for (let j = i; j < i + 9; j++) {
      arr[j].readOnly = true
      arr[j].removeAttribute('onkeydown')
      if (!arr[j].value) {
        board[board.length - 1].push(0)
      } else {
        board[board.length - 1].push(+arr[j].value)
        arr[j].style.border = '1px solid black'
      }
    }
  }
  let result = sudoku(board)
  const display = getBoard()
  displayResult(result, display)
}


function getBoard() {
  const arr = field.querySelectorAll('input')
  const display = [];
  for (let i = 0; i <= arr.length - 1; i += 9) {
    display.push([])
    for (let j = i; j < i + 9; j++) {
      display[display.length - 1].push(arr[j])
    }
  }
  return display;
}


function displayResult(result, inp) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      inp[i][j].value = result[i][j]
      inp[i][j].removeAttribute('onclick')
      inp[i][j].removeAttribute('onkeydown')
      inp[i][j].setAttribute('readonly', true)
    }
  }
  btn.classList.add('display-none')
  btn.innerHTML = 'Start!'
  btn.removeAttribute('disabled')
  reset.classList.remove('display-none')
}

function resetGame() {
  field.innerHTML = ''
  createField()
  reset.classList.add('display-none')
  btn.classList.remove('display-none')
}
createField()


function drawGrid(e) {
  const inputs = getBoard()
  const curPos = (board) => {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === e.target) {
          return [r, c];
        }
      }
    }
    return null;
  }
  const [r, c] = curPos(inputs);
  //Check rows
  for (let i = 0; i < size; i++) {
    inputs[i][c].classList.toggle('hovRowandCols');
  }

  //Check cols
  for (let i = 0; i < size; i++) {
    inputs[r][i].classList.toggle('hovRowandCols');
  }

  // Check box
  const boxRow = Math.floor(r / boxSize) * boxSize;
  const boxCol = Math.floor(c / boxSize) * boxSize;

  for (let i = boxRow; i < boxRow + boxSize; i++) {
    for (let j = boxCol; j < boxCol + boxSize; j++) {
      inputs[i][j].classList.toggle('hovBoxes');
    }
  }
}


////////////////Algorythm ////////////////////////

function sudoku(board) {
  const findEmpty = (board) => {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === 0) {
          return [r, c];
        }
      }
    }
    return null;
  }

  const validate = (num, pos, board) => {
    const [r, c] = pos;

    //Check rows
    for (let i = 0; i < size; i++) {
      if (board[i][c] === num && i !== r) {
        return false;
      }
    }

    //Check cols
    for (let i = 0; i < size; i++) {
      if (board[r][i] === num && i !== c) {
        return false;
      }
    }


    //Check box
    const boxRow = Math.floor(r / boxSize) * boxSize;
    const boxCol = Math.floor(c / boxSize) * boxSize;

    for (let i = boxRow; i < boxRow + boxSize; i++) {
      for (let j = boxCol; j < boxCol + boxSize; j++) {
        if (board[i][j] === num && i !== r && j !== c) {
          return false;
        }
      }
    }

    return true;
  }

  const solve = () => {
    const currPos = findEmpty(board);

    if (currPos === null) {
      return true;
    }
    // console.log('------------------------------');
    for (let i = 1; i < size + 1; i++) {
      const currNum = i;
      const isValid = validate(currNum, currPos, board);
      // console.log('currPos ', currPos, 'currNum ', currNum, 'isValid ', isValid);
      if (isValid) {
        const [x, y] = currPos;
        board[x][y] = currNum;

        if (solve()) {
          return true;
        }

        board[x][y] = 0;
      }
    }

    return false;
  }

  solve();
  return board;
};



