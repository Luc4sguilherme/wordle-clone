import { useCallback, useEffect, useState } from 'react';

import keys from './keys';
import { getWordle } from './service/api';

type Guess = {
  color: string;
  letter: string;
};

function App() {
  const [currentRow, setCurrentRow] = useState(0);
  const [currentTile, setCurrentTile] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [wordle, setWordle] = useState<string>('');
  const [wordLength, setWordLength] = useState(0);
  const [guessRows, setGuessRows] = useState<string[][]>([]);
  const [message, setMessage] = useState('');
  const [colorKey, setColorKey] = useState<{
    [key: string]: string;
  }>({});

  const updateGuessRows = useCallback(
    (rows: string[][], newValue: string) => {
      return rows.map((row, index) => {
        if (currentRow === index) {
          return row.map((tile, tileIndex) => {
            if (currentTile === tileIndex) {
              return newValue;
            }

            return tile;
          });
        }

        return row;
      });
    },
    [guessRows, currentRow, currentTile],
  );

  const addLetter = useCallback(
    (key: string) => {
      setGuessRows(prev => updateGuessRows(prev, key));
      setCurrentTile(prev => prev + 1);
    },
    [guessRows, currentRow, currentTile],
  );

  const deleteLetter = useCallback(() => {
    if (currentTile > 0) {
      setCurrentTile(prev => prev - 1);
      setGuessRows(prev => updateGuessRows(prev, ''));
    }
  }, [guessRows, currentRow, currentTile]);

  const showMessage = useCallback((msg: string) => {
    setMessage(msg);

    setTimeout(() => setMessage(''), 4000);
  }, []);

  const addColorToKey = useCallback((keyLetter: string, color: string) => {
    setColorKey(prev => ({
      ...prev,
      [keyLetter]: color,
    }));
  }, []);

  const flipTile = useCallback(() => {
    const rowTiles = document.querySelector(
      `#guessRow-${currentRow}`,
    )?.childNodes;
    const guesses: Guess[] = [];

    let checkWordle = wordle;

    rowTiles?.forEach(tile => {
      guesses.push({
        letter: tile.textContent as string,
        color: 'grey-overlay',
      });
    });

    guesses.forEach((guess, index) => {
      if (guess.letter === wordle[index]) {
        guess.color = 'green-overlay';
        checkWordle = checkWordle.replace(guess.letter, '');
      }

      if (checkWordle.includes(guess.letter)) {
        guess.color = 'yellow-overlay';
        checkWordle = checkWordle.replace(guess.letter, '');
      }
    });

    rowTiles?.forEach((tile, index) => {
      setTimeout(() => {
        tile.classList.add('flip');
        tile.classList.add(guesses[index].color);
        addColorToKey(guesses[index].letter, guesses[index].color);
      }, 500 * index);
    });
  }, [wordle, currentRow]);

  const checkRow = useCallback(() => {
    const guess = guessRows[currentRow].join('');

    if (currentTile > wordLength - 1) {
      flipTile();

      if (wordle === guess) {
        setIsGameOver(true);
        showMessage('Magnificent!');
      } else if (currentRow >= 5) {
        setIsGameOver(true);
        showMessage('Game Over');
      } else if (currentRow < 5) {
        setCurrentRow(prev => prev + 1);
        setCurrentTile(0);
      }
    }
  }, [guessRows, currentRow, currentTile, wordle, wordLength]);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();

      const target = event.currentTarget;
      const key = target.id;

      if (!isGameOver) {
        if (key === '✖') {
          deleteLetter();
          return;
        }

        if (key === 'ENTER') {
          checkRow();
          return;
        }

        if (currentTile < wordLength && currentRow < 6) {
          addLetter(key);
        }
      }
    },
    [isGameOver, currentTile, currentRow, wordLength],
  );

  useEffect(() => {
    (async () => {
      const word = await getWordle();

      setWordle(word);
      setWordLength(word.length);
      setGuessRows(Array(6).fill(Array(word.length).fill('')));
    })();
  }, []);

  return (
    <div className="game-container">
      <div className="title-container">
        <h1>Wordle</h1>
      </div>

      <div className="message-container">{message && <p>{message}</p>}</div>
      <div className="tile-container">
        {guessRows.map((guessRow, guessRowIndex) => {
          return (
            <div key={guessRowIndex} id={`guessRow-${guessRowIndex}`}>
              {guessRow.map((guess, guessIndex) => (
                <div
                  key={guessIndex}
                  id={`guessRow-${guessRowIndex}-tile-${guessIndex}`}
                  className="tile"
                >
                  {guess}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div className="key-container">
        {keys.map((key, index) => (
          <button
            type="button"
            key={index}
            id={key}
            className={colorKey[key] ?? ''}
            onClick={event => handleClick(event)}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
