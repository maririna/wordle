import { InformationCircleIcon } from '@heroicons/react/outline'
import { useEffect, useState } from 'react'
import { Alert } from './components/alerts/Alert'
import { Grid } from './components/grid/Grid'
import { Keyboard } from './components/keyboard/Keyboard'
import { AboutModal } from './components/modals/AboutModal'
import { InfoModal } from './components/modals/InfoModal'
import { WinModal } from './components/modals/WinModal'
import { isWinningWord, isWordInWordList, solution } from './lib/words'
import { loadGameStateFromLocalStorage, saveGameStateToLocalStorage, } from './lib/localStorage'
import { convert, LETTERS_EN } from './lib/keyboard';

function App() {
    const [currentGuess, setCurrentGuess] = useState('')
    const [isGameWon, setIsGameWon] = useState(false)
    const [isWinModalOpen, setIsWinModalOpen] = useState(false)
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)
    const [isWordNotFoundAlertOpen, setIsWordNotFoundAlertOpen] = useState(false)
    const [isGameLost, setIsGameLost] = useState(false)
    const [shareComplete, setShareComplete] = useState(false)
    const [guesses, setGuesses] = useState<string[]>(() => {
        const loaded = loadGameStateFromLocalStorage()
        if (loaded?.solution !== solution) {
            return []
        }
        if (loaded.guesses.includes(solution)) {
            setIsGameWon(true)
        }
        return loaded.guesses
    })

    useEffect(() => {
        saveGameStateToLocalStorage({ guesses, solution })
    }, [guesses])

    useEffect(() => {
        if (isGameWon) {
            setIsWinModalOpen(true)
        }
    }, [isGameWon])

    const onChar = (value: string) => {
        let converted = value;
        if (LETTERS_EN.includes(value)) {
            converted = convert(value);
        }
        if (currentGuess.length < 5 && guesses.length < 6) {
            setCurrentGuess(`${currentGuess}${converted}`)
        }
    }

    const onDelete = () => {
        setCurrentGuess(currentGuess.slice(0, -1))
    }

    const onEnter = () => {
        if (!isWordInWordList(currentGuess)) {
            setIsWordNotFoundAlertOpen(true)
            return setTimeout(() => {
                setIsWordNotFoundAlertOpen(false)
            }, 2000)
        }

        const winningWord = isWinningWord(currentGuess)

        if (currentGuess.length === 5 && guesses.length < 6 && !isGameWon) {
            setGuesses([...guesses, currentGuess])
            setCurrentGuess('')

            if (winningWord) {
                return setIsGameWon(true)
            }

            if (guesses.length === 5) {
                setIsGameLost(true)
                return setTimeout(() => {
                    setIsGameLost(false)
                }, 2000)
            }
        }
    }

    return (
        <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
            <Alert message="Зборот не е пронајден во речникот на Зборле." isOpen={isWordNotFoundAlertOpen}/>
            <Alert
                message={`Изгубивте, бараниот збор е ${solution}`}
                isOpen={isGameLost}
            />
            <Alert
                message="Копирано во clipboard за споделулвање"
                isOpen={shareComplete}
                variant="success"
            />
            <div className="flex w-80 mx-auto items-center mb-2">
                <h1 className="text-4xl text-center text-slate-700 tracking-widest grow uppercase font-bold">Зборле</h1>
                <InformationCircleIcon
                    className="h-6 w-6 cursor-pointer"
                    onClick={() => setIsInfoModalOpen(true)}
                />
            </div>
            <Grid guesses={guesses} currentGuess={currentGuess}/>
            <Keyboard
                onChar={onChar}
                onDelete={onDelete}
                onEnter={onEnter}
                guesses={guesses}
            />
            <WinModal
                isOpen={isWinModalOpen}
                handleClose={() => setIsWinModalOpen(false)}
                guesses={guesses}
                handleShare={() => {
                    setIsWinModalOpen(false)
                    setShareComplete(true)
                    return setTimeout(() => {
                        setShareComplete(false)
                    }, 2000)
                }}
            />
            <InfoModal
                isOpen={isInfoModalOpen}
                handleClose={() => setIsInfoModalOpen(false)}
            />
            <AboutModal
                isOpen={isAboutModalOpen}
                handleClose={() => setIsAboutModalOpen(false)}
            />

            <button
                type="button"
                className="mx-auto mt-8 flex items-center px-4 py-1 border border-transparent text-xs font-medium rounded text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                onClick={() => setIsAboutModalOpen(true)}
            >
                За играта
            </button>
        </div>
    )
}

export default App
