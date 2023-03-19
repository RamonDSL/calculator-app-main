// um + antes de algo vai tentar converter para number
const radioInputs = document.querySelectorAll('input[type="radio"')
const buttons = document.querySelectorAll('.button')
const result = document.querySelector('.result>p')

let operationPerformed = false

const tradeTheme = event => {
    document.documentElement.dataset.theme = event.target.value    
}

const getExpression = () => result.innerHTML

const clearScreen = () => {
    result.innerHTML = ""
}

const delLastValue = () => {
    const expression = getExpression()
    result.innerHTML = expression.slice(0, -1)
}

const addToScreen = event => {
    const expression = getExpression()
    const targetElement = event.target

    if (operationPerformed) {
        result.innerHTML = ""
        operationPerformed = false
    }

    const testValue = () => {        
        let canInsert = true
        
        const getKey = passedKey => (...keys) => keys.some(key => key === passedKey)
        const testKey = getKey(targetElement.dataset.keyValue)
    
        const firstElementIsMultOrDiv= () => {
            const multOrDivSignal = testKey('*','/')
            if (expression.length === 0 && multOrDivSignal) {
                canInsert = false
            }
        }

        const repeatedMultOrDivSign = () => {
            const multOrDivSignal = testKey('*','/')
            const lastNumOfExp = getKey(expression.slice(-1))
            const isDifFromANum = lastNumOfExp('*','/','+','-','.')

            if (multOrDivSignal && isDifFromANum) {
                canInsert = false
            }
        }

        const specialCharCanBeEntered = () => {
            const lastTwoChar = isNaN(expression[expression.length-2]) && isNaN(expression.slice(-1))
            const specialChar = testKey('*','-','+','/')

            if (lastTwoChar && specialChar) {
                canInsert = false
            }

        }

        const canInsertDot = () => {
            const lastDotFound = expression.lastIndexOf('.') 
            if (lastDotFound != -1) {
                const signals = ['*','/','+','-']
                const isADot = testKey('.')
                const thereIsASignBeforeTheDot = signals.some(signal => expression.lastIndexOf(signal) > lastDotFound)

                if (!thereIsASignBeforeTheDot && isADot) {
                    canInsert = false
                }
            }
        }

        firstElementIsMultOrDiv()
        repeatedMultOrDivSign()
        specialCharCanBeEntered()
        canInsertDot()

        if (canInsert) {
            return true
        } else {
            return false        
        }
    }

    if (!testValue()) {
        return
    }

    result.innerHTML += targetElement.dataset.keyValue
}

const calcResult = () => {
    let expression = getExpression()
    
    const validateExpression = () => {
        let thereAreOparenThanCparen

        const haveDotOrSignalSolo = /(?<![0-9])\.(?![0-9])/.test(expression)
        if (expression.match(/\(/g) !== null && expression.match(/\)/g) !== null) {
            thereAreOparenThanCparen = expression.match(/\(/g).length > expression.match(/\)/g).length
        }

        return haveDotOrSignalSolo || thereAreOparenThanCparen? true: false
    }

    const formatNum = num => num < 0? num: `+${num}`

    const performOpcWithHigherPrecedence = () => {
        const getMultAndDivOpc = /((?:[+-])?(?:\d+)?(?:\.\d+)?)[\*\/]((?:[+-])?(?:\d+)?(?:\.\d+)?)/g
        
        let operation;

        while ((operation = getMultAndDivOpc.exec(expression)) !== null) {
            if (operation[0].includes('*')) {
                const multResult = Number(operation[1]) * Number(operation[2])
                expression = expression.replace(operation[0], formatNum(multResult))
            } else {
                const divResult = Number(operation[1]) / Number(operation[2])
                expression = expression.replace(operation[0], formatNum(divResult))
            }
            
            getMultAndDivOpc.lastIndex = 0
        }
    }

    const performOpcWithLowerPrecedence = () => {
        const getSumAndSubOpc = /([+-]?(?:\d+\.\d+|\d+|\.\d+))([+-](?:\d+\.\d+|\d+|\.\d+))/g
        
        let operation;
        
        while ((operation = getSumAndSubOpc.exec(expression)) !== null) {            
            const sumResult = Number(operation[1]) + Number(operation[2])
            expression = expression.replace(operation[0], sumResult)
            
            
            getSumAndSubOpc.lastIndex = 0
        }        
    }

    if (!validateExpression()) {
        performOpcWithHigherPrecedence()
        performOpcWithLowerPrecedence()
        result.innerHTML = expression     
        operationPerformed = true 
    } else {
        result.innerHTML = "Erro"
    }    
      

    
    
}

for (const input of radioInputs) {
    input.addEventListener('change', tradeTheme)
}

for (const button of buttons) {
    switch (button.dataset.keyValue) {
        case "=":
            button.addEventListener('click', calcResult)            
            break;
        case "del":
            button.addEventListener('click', delLastValue)            
            break;
        case "reset":
            button.addEventListener('click', clearScreen)          
            break;    
        default:
            button.addEventListener('click', addToScreen)
            break;
    }
}