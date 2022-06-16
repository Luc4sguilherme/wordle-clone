import "./style.css";

import api from "./services/api";
import { keys } from "./component/keys";

type Guess = {
  color: string;
  letter: string;
};

class WordleGame {
  wordle: string | undefined;
  wordLength: number;
  currentRow: number;
  currentTile: number;
  isGameOver: boolean;
  guessRows: string[][];
  tileDisplay: HTMLElement | null;
  keyboard: HTMLElement | null;
  messageDisplay: HTMLElement | null;

  constructor() {
    this.wordle = undefined;
    this.wordLength = 0;
    this.currentRow = 0;
    this.currentTile = 0;
    this.isGameOver = false;
    this.guessRows = [];

    this.tileDisplay = document.querySelector(".tile-container");
    this.keyboard = document.querySelector(".key-container");
    this.messageDisplay = document.querySelector(".message-container");
  }

  async init() {
    await this.getWordle();
    this.createKeys();
    this.createRows();
  }

  async getWordle() {
    const { data } = await api.get("/word");

    this.wordle = data;
    this.wordLength = this.wordle?.length ?? 0;
  }

  createKeys() {
    keys.forEach((key) => {
      const buttonElement = document.createElement("button");

      buttonElement.textContent = key;
      buttonElement.setAttribute("id", key);
      buttonElement.addEventListener("click", () => this.handleClick(key));

      this.keyboard?.append(buttonElement);
    });
  }

  createRows() {
    this.guessRows = Array(6).fill(Array(this.wordLength).fill(""));
    this.guessRows.forEach((guessRow, guessRowIndex) => {
      const rowElement = document.createElement("div");

      rowElement.setAttribute("id", `guessRow-${guessRowIndex}`);

      guessRow.forEach((_, guessIndex) => {
        const tileElement = document.createElement("div");

        tileElement.setAttribute("id", `guessRow-${guessRowIndex}-tile-${guessIndex}`);
        tileElement.classList.add("tile");

        rowElement.append(tileElement);
      });

      this.tileDisplay?.append(rowElement);
    });
  }

  addLetter(letter: string) {
    const tile = document.getElementById(`guessRow-${this.currentRow}-tile-${this.currentTile}`);

    if (tile) {
      tile.textContent = letter;
      tile.setAttribute("data", letter);
    }

    this.guessRows[this.currentRow][this.currentTile] = letter;

    this.currentTile++;
  }

  deleteLetter() {
    if (this.currentTile > 0) {
      this.currentTile--;

      const tile = document.getElementById(`guessRow-${this.currentRow}-tile-${this.currentTile}`);

      if (tile) {
        tile.textContent = "";
        tile.setAttribute("data", "");
      }

      this.guessRows[this.currentRow][this.currentTile] = "";
    }
  }

  flipTile() {
    const rowTiles = document.querySelector(`#guessRow-${this.currentRow}`)?.children;
    const guess: Guess[] = [];

    let checkWordle = this.wordle;

    if (rowTiles) {
      for (let i = 0; i < rowTiles.length; i++) {
        const tile = rowTiles[i];

        guess.push({ letter: tile.getAttribute("data") ?? "", color: "grey-overlay" });

        setTimeout(() => {
          tile.classList.add("flip");
          tile.classList.add(guess[i].color);
          this.addColorToKey(guess[i].letter, guess[i].color);
        }, 500 * i);
      }

      guess.forEach((guess, index) => {
        if (checkWordle) {
          if (guess.letter == this.wordle?.[index]) {
            guess.color = "green-overlay";
            checkWordle = checkWordle.replace(guess.letter, "");
          }

          if (checkWordle.includes(guess.letter)) {
            guess.color = "yellow-overlay";
            checkWordle = checkWordle.replace(guess.letter, "");
          }
        }
      });
    }
  }

  checkRow() {
    const guess = this.guessRows[this.currentRow].join("");

    if (this.currentTile > this.wordLength - 1) {
      this.flipTile();

      if (this.wordle == guess) {
        this.isGameOver = true;
        this.showMessage("Magnificent!");
        return;
      } else if (this.currentRow >= 5) {
        this.isGameOver = true;
        this.showMessage("Game Over");
        return;
      } else if (this.currentRow < 5) {
        this.currentRow++;
        this.currentTile = 0;
      }
    }
  }

  handleClick(key: string) {
    if (!this.isGameOver) {
      if (key === "✖") {
        this.deleteLetter();
        return;
      }

      if (key === "ENTER") {
        this.checkRow();
        return;
      }

      if (this.currentTile < this.wordLength && this.currentRow < 6) {
        this.addLetter(key);
      }
    }
  }

  showMessage(message: string) {
    const messageElement = document.createElement("p");

    messageElement.textContent = message;
    this.messageDisplay?.append(messageElement);

    setTimeout(() => this.messageDisplay?.removeChild(messageElement), 2000);
  }

  addColorToKey(keyLetter: string, color: string) {
    const key = document.getElementById(keyLetter);

    key?.classList.add(color);
  }
}

const wordleGame = new WordleGame();

wordleGame.init();
