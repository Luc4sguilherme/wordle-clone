const tileDisplay = document.querySelector(".tile-container");
const keyboard = document.querySelector(".key-container");
const messageDisplay = document.querySelector(".message-container");

const getWordle = async () => {
  const response = await fetch("http://localhost:3333/word");
  const word = await response.json();

  return word;
};

async function main() {
  const wordle = await getWordle();
  const wordLength = wordle.length;

  const keys = [
    "Q",
    "W",
    "E",
    "R",
    "T",
    "Y",
    "U",
    "I",
    "O",
    "P",
    "A",
    "S",
    "D",
    "F",
    "G",
    "H",
    "J",
    "K",
    "L",
    "ENTER",
    "Z",
    "X",
    "C",
    "V",
    "B",
    "N",
    "M",
    "✖",
  ];

  const guessRows = Array(6).fill(Array(wordle.length).fill(""));

  guessRows.forEach((guessRow, guessRowIndex) => {
    const rowElement = document.createElement("div");

    rowElement.setAttribute("id", `guessRow-${guessRowIndex}`);

    guessRow.forEach((guess, guessIndex) => {
      const tileElement = document.createElement("div");

      tileElement.setAttribute("id", `guessRow-${guessRowIndex}-tile-${guessIndex}`);
      tileElement.classList.add("tile");

      rowElement.append(tileElement);
    });

    tileDisplay.append(rowElement);
  });

  let currentRow = 0;
  let currentTile = 0;
  let isGameOver = false;

  const addLetter = (letter) => {
    const tile = document.getElementById(`guessRow-${currentRow}-tile-${currentTile}`);

    tile.textContent = letter;
    tile.setAttribute("data", letter);

    guessRows[currentRow][currentTile] = letter;

    currentTile++;
  };

  const handleClick = (key) => {
    if (!isGameOver) {
      if (key === "✖") {
        deleteLetter();
        return;
      }

      if (key === "ENTER") {
        checkRow();
        return;
      }

      if (currentTile < wordLength && currentRow < 6) {
        addLetter(key);
      }
    }
  };

  keys.forEach((key) => {
    const buttonElement = document.createElement("button");

    buttonElement.textContent = key;
    buttonElement.setAttribute("id", key);
    buttonElement.addEventListener("click", () => handleClick(key));

    keyboard.append(buttonElement);
  });

  const deleteLetter = () => {
    if (currentTile > 0) {
      currentTile--;

      const tile = document.getElementById(`guessRow-${currentRow}-tile-${currentTile}`);

      tile.textContent = "";
      guessRows[currentRow][currentTile] = "";
      tile.setAttribute("data", "");
    }
  };

  const checkRow = () => {
    const guess = guessRows[currentRow].join("");

    if (currentTile > wordLength - 1) {
      flipTile();

      if (wordle == guess) {
        isGameOver = true;
        showMessage("Magnificent!");
        return;
      } else if (currentRow >= 5) {
        isGameOver = true;
        showMessage("Game Over");
        return;
      } else if (currentRow < 5) {
        currentRow++;
        currentTile = 0;
      }
    }
  };

  const showMessage = (message) => {
    const messageElement = document.createElement("p");

    messageElement.textContent = message;
    messageDisplay.append(messageElement);

    setTimeout(() => messageDisplay.removeChild(messageElement), 2000);
  };

  const addColorToKey = (keyLetter, color) => {
    const key = document.getElementById(keyLetter);

    key.classList.add(color);
  };

  const flipTile = () => {
    const rowTiles = document.querySelector(`#guessRow-${currentRow}`).childNodes;
    const guess = [];

    let checkWordle = wordle;

    rowTiles.forEach((tile) => {
      guess.push({ letter: tile.getAttribute("data"), color: "grey-overlay" });
    });

    guess.forEach((guess, index) => {
      if (guess.letter == wordle[index]) {
        guess.color = "green-overlay";
        checkWordle = checkWordle.replace(guess.letter, "");
      }

      if (checkWordle.includes(guess.letter)) {
        guess.color = "yellow-overlay";
        checkWordle = checkWordle.replace(guess.letter, ""); 
      }
    });

    rowTiles.forEach((tile, index) => {
      setTimeout(() => {
        tile.classList.add('flip')
        tile.classList.add(guess[index].color);
        addColorToKey(guess[index].letter, guess[index].color);
      }, 500 * index);
    });
  };
}

main();
