
import { useState } from "react";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";

const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay("0.");
      setWaitingForSecondOperand(false);
      return;
    }

    if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const clearDisplay = () => {
    setDisplay("0");
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = calculate(firstOperand, inputValue, operator);
      setDisplay(String(result));
      setFirstOperand(result);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const calculate = (firstOperand: number, secondOperand: number, operator: string): number => {
    switch (operator) {
      case "+":
        return firstOperand + secondOperand;
      case "-":
        return firstOperand - secondOperand;
      case "*":
        return firstOperand * secondOperand;
      case "/":
        return firstOperand / secondOperand;
      default:
        return secondOperand;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-cutelist-dark">
        <Header />
        <main className="flex-1 container flex flex-col items-center justify-center py-12">
          <div className="w-full max-w-md px-4">
            <div className="flex flex-col items-center">
              <h1 className="text-4xl font-bold text-center mb-2 text-gradient">Calculator</h1>
              <p className="text-center text-gray-400 mb-8">A simple and cute calculator</p>
              
              <div className="glass-card w-full rounded-xl overflow-hidden">
                <div className="p-4 bg-cutelist-dark/80 border-b border-cutelist-primary/20">
                  <div className="text-right text-3xl font-mono p-2 h-14 flex items-center justify-end">
                    {display}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1 p-2">
                  <Button 
                    onClick={() => clearDisplay()} 
                    className="bg-red-500/70 hover:bg-red-500 text-white font-bold"
                  >
                    C
                  </Button>
                  <Button 
                    onClick={() => setDisplay(display.charAt(0) === "-" ? display.slice(1) : "-" + display)} 
                    className="bg-cutelist-dark/70 hover:bg-cutelist-dark text-white"
                  >
                    +/-
                  </Button>
                  <Button 
                    onClick={() => performOperation("%")} 
                    className="bg-cutelist-dark/70 hover:bg-cutelist-dark text-white"
                  >
                    %
                  </Button>
                  <Button 
                    onClick={() => performOperation("/")} 
                    className="bg-cutelist-primary/70 hover:bg-cutelist-primary text-white"
                  >
                    ÷
                  </Button>
                  
                  {[7, 8, 9].map((num) => (
                    <Button 
                      key={num} 
                      onClick={() => inputDigit(num.toString())} 
                      className="bg-cutelist-dark/50 hover:bg-cutelist-dark/70 text-white"
                    >
                      {num}
                    </Button>
                  ))}
                  <Button 
                    onClick={() => performOperation("*")} 
                    className="bg-cutelist-primary/70 hover:bg-cutelist-primary text-white"
                  >
                    ×
                  </Button>
                  
                  {[4, 5, 6].map((num) => (
                    <Button 
                      key={num} 
                      onClick={() => inputDigit(num.toString())} 
                      className="bg-cutelist-dark/50 hover:bg-cutelist-dark/70 text-white"
                    >
                      {num}
                    </Button>
                  ))}
                  <Button 
                    onClick={() => performOperation("-")} 
                    className="bg-cutelist-primary/70 hover:bg-cutelist-primary text-white"
                  >
                    -
                  </Button>
                  
                  {[1, 2, 3].map((num) => (
                    <Button 
                      key={num} 
                      onClick={() => inputDigit(num.toString())} 
                      className="bg-cutelist-dark/50 hover:bg-cutelist-dark/70 text-white"
                    >
                      {num}
                    </Button>
                  ))}
                  <Button 
                    onClick={() => performOperation("+")} 
                    className="bg-cutelist-primary/70 hover:bg-cutelist-primary text-white"
                  >
                    +
                  </Button>
                  
                  <Button 
                    onClick={() => inputDigit("0")} 
                    className="col-span-2 bg-cutelist-dark/50 hover:bg-cutelist-dark/70 text-white"
                  >
                    0
                  </Button>
                  <Button 
                    onClick={() => inputDecimal()} 
                    className="bg-cutelist-dark/50 hover:bg-cutelist-dark/70 text-white"
                  >
                    .
                  </Button>
                  <Button 
                    onClick={() => performOperation("=")} 
                    className="bg-cutelist-accent/70 hover:bg-cutelist-accent text-white"
                  >
                    =
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Calculator;
