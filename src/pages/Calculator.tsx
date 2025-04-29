
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [history, setHistory] = useState<string[]>([]);
  const [memory, setMemory] = useState<number | null>(null);
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [calculationType, setCalculationType] = useState<"standard" | "scientific" | "converter">("standard");
  const [unitFrom, setUnitFrom] = useState<string>("cm");
  const [unitTo, setUnitTo] = useState<string>("inch");
  const [conversionValue, setConversionValue] = useState<string>("0");
  const [conversionResult, setConversionResult] = useState<string>("0");

  useEffect(() => {
    // Handle keyboard input
    const handleKeyDown = (e: KeyboardEvent) => {
      if (calculationType !== "standard") return;
      
      const key = e.key;
      
      if (/[0-9]/.test(key)) {
        inputDigit(key);
      } else if (key === ".") {
        inputDecimal();
      } else if (["+", "-", "*", "/"].includes(key)) {
        performOperation(key);
      } else if (key === "Enter" || key === "=") {
        performOperation("=");
      } else if (key === "Escape" || key === "c" || key === "C") {
        clearDisplay();
      } else if (key === "Backspace") {
        handleBackspace();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [display, operator, firstOperand, waitingForSecondOperand, calculationType]);

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

  const handleBackspace = () => {
    if (display.length === 1 || display === "Error") {
      setDisplay("0");
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (nextOperator === "%" && firstOperand === null) {
      setDisplay(String(inputValue / 100));
      return;
    }

    if (nextOperator === "±") {
      setDisplay(String(-parseFloat(display)));
      return;
    }

    if (nextOperator === "√") {
      try {
        const result = Math.sqrt(inputValue);
        if (isNaN(result) || !isFinite(result)) {
          setDisplay("Error");
        } else {
          setDisplay(String(result));
          addToHistory(`√${inputValue} = ${result}`);
        }
      } catch (e) {
        setDisplay("Error");
      }
      return;
    }

    if (nextOperator === "x²") {
      const result = inputValue * inputValue;
      setDisplay(String(result));
      addToHistory(`${inputValue}² = ${result}`);
      return;
    }

    if (nextOperator === "1/x") {
      if (inputValue === 0) {
        setDisplay("Error");
      } else {
        const result = 1 / inputValue;
        setDisplay(String(result));
        addToHistory(`1/${inputValue} = ${result}`);
      }
      return;
    }

    if (operator && !waitingForSecondOperand) {
      const result = calculate(firstOperand!, inputValue, operator);
      setDisplay(String(result));
      setFirstOperand(result);
      
      // Add to history
      addToHistory(`${firstOperand} ${operator} ${inputValue} = ${result}`);
    } else {
      setFirstOperand(inputValue);
    }

    if (nextOperator === "=") {
      setOperator(null);
    } else {
      setOperator(nextOperator);
      setWaitingForSecondOperand(true);
    }
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
        if (secondOperand === 0) {
          setDisplay("Error");
          return 0;
        }
        return firstOperand / secondOperand;
      default:
        return secondOperand;
    }
  };

  const addToHistory = (calculation: string) => {
    setHistory(prev => [...prev.slice(-9), calculation]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const handleMemoryClear = () => {
    setMemory(null);
  };

  const handleMemoryRecall = () => {
    if (memory !== null) {
      setDisplay(String(memory));
    }
  };

  const handleMemoryAdd = () => {
    setMemory((prev) => (prev || 0) + parseFloat(display));
  };

  const handleMemorySubtract = () => {
    setMemory((prev) => (prev || 0) - parseFloat(display));
  };

  const handleUnitConversion = () => {
    const value = parseFloat(conversionValue);
    let result = 0;

    // Length conversions
    const lengthConversions: Record<string, Record<string, number>> = {
      "cm": { "inch": 0.3937, "m": 0.01, "km": 0.00001, "ft": 0.0328084 },
      "inch": { "cm": 2.54, "m": 0.0254, "km": 0.0000254, "ft": 0.0833333 },
      "m": { "cm": 100, "inch": 39.3701, "km": 0.001, "ft": 3.28084 },
      "km": { "cm": 100000, "inch": 39370.1, "m": 1000, "ft": 3280.84 },
      "ft": { "cm": 30.48, "inch": 12, "m": 0.3048, "km": 0.0003048 }
    };

    // Weight conversions
    const weightConversions: Record<string, Record<string, number>> = {
      "kg": { "lb": 2.20462, "g": 1000, "oz": 35.274 },
      "lb": { "kg": 0.453592, "g": 453.592, "oz": 16 },
      "g": { "kg": 0.001, "lb": 0.00220462, "oz": 0.035274 },
      "oz": { "kg": 0.0283495, "lb": 0.0625, "g": 28.3495 }
    };

    // Temperature conversions
    if (unitFrom === "c" && unitTo === "f") {
      result = (value * 9/5) + 32;
    } else if (unitFrom === "f" && unitTo === "c") {
      result = (value - 32) * 5/9;
    } else if (unitFrom === "c" && unitTo === "k") {
      result = value + 273.15;
    } else if (unitFrom === "k" && unitTo === "c") {
      result = value - 273.15;
    } else if (unitFrom === "f" && unitTo === "k") {
      result = (value - 32) * 5/9 + 273.15;
    } else if (unitFrom === "k" && unitTo === "f") {
      result = (value - 273.15) * 9/5 + 32;
    } 
    // Length and weight conversions
    else if (lengthConversions[unitFrom]?.[unitTo]) {
      result = value * lengthConversions[unitFrom][unitTo];
    } else if (weightConversions[unitFrom]?.[unitTo]) {
      result = value * weightConversions[unitFrom][unitTo];
    } else {
      setConversionResult("Conversion not supported");
      return;
    }

    setConversionResult(result.toString());
  };

  const renderStandardCalculator = () => (
    <div className="glass-card w-full rounded-xl overflow-hidden">
      <div className="p-4 bg-cutelist-dark/80 border-b border-cutelist-primary/20 mb-2">
        <div className="text-right text-3xl font-mono p-2 h-14 flex items-center justify-end">
          {display}
        </div>
      </div>
      <div className="px-2 pt-2 pb-2">
        <div className="grid grid-cols-4 gap-1 mb-2">
          <Button 
            onClick={handleMemoryClear} 
            className="bg-cutelist-dark/70 hover:bg-cutelist-dark text-white"
          >
            MC
          </Button>
          <Button 
            onClick={handleMemoryRecall} 
            className="bg-cutelist-dark/70 hover:bg-cutelist-dark text-white"
          >
            MR
          </Button>
          <Button 
            onClick={handleMemoryAdd} 
            className="bg-cutelist-dark/70 hover:bg-cutelist-dark text-white"
          >
            M+
          </Button>
          <Button 
            onClick={handleMemorySubtract} 
            className="bg-cutelist-dark/70 hover:bg-cutelist-dark text-white"
          >
            M-
          </Button>
        </div>
      </div>
      <div className="px-2 pb-3">
        <div className="grid grid-cols-4 gap-1 mb-1">
          <Button 
            onClick={() => clearDisplay()} 
            className="bg-red-500/70 hover:bg-red-500 text-white font-bold"
          >
            C
          </Button>
          <Button 
            onClick={handleBackspace} 
            className="bg-cutelist-dark/70 hover:bg-cutelist-dark text-white"
          >
            ⌫
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
        </div>
        
        <div className="grid grid-cols-4 gap-1 mb-1">
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
        </div>
        
        <div className="grid grid-cols-4 gap-1 mb-1">
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
        </div>
        
        <div className="grid grid-cols-4 gap-1 mb-1">
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
        </div>
        
        <div className="grid grid-cols-4 gap-1">
          <Button 
            onClick={() => performOperation("±")} 
            className="bg-cutelist-dark/50 hover:bg-cutelist-dark/70 text-white"
          >
            ±
          </Button>
          <Button 
            onClick={() => inputDigit("0")} 
            className="bg-cutelist-dark/50 hover:bg-cutelist-dark/70 text-white"
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
  );

  const renderScientificCalculator = () => (
    <div className="glass-card w-full rounded-xl overflow-hidden">
      <div className="p-4 bg-cutelist-dark/80 border-b border-cutelist-primary/20">
        <div className="text-right text-3xl font-mono p-2 h-14 flex items-center justify-end">
          {display}
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1 p-3">
        <Button 
          onClick={() => clearDisplay()} 
          className="bg-red-500/70 hover:bg-red-500 text-white font-bold"
        >
          C
        </Button>
        <Button 
          onClick={handleBackspace} 
          className="bg-cutelist-dark/70 hover:bg-cutelist-dark text-white"
        >
          ⌫
        </Button>
        <Button 
          onClick={() => performOperation("%")} 
          className="bg-cutelist-dark/70 hover:bg-cutelist-dark text-white"
        >
          %
        </Button>
        <Button 
          onClick={() => performOperation("√")} 
          className="bg-cutelist-dark/70 hover:bg-cutelist-dark text-white"
        >
          √
        </Button>
        <Button 
          onClick={() => performOperation("/")} 
          className="bg-cutelist-primary/70 hover:bg-cutelist-primary text-white"
        >
          ÷
        </Button>
        
        <Button 
          onClick={handleMemoryClear} 
          className="bg-cutelist-dark/70 hover:bg-cutelist-dark text-white text-sm"
        >
          MC
        </Button>
        <Button 
          onClick={() => inputDigit("7")} 
          className="bg-cutelist-dark/50 hover:bg-cutelist-dark/70 text-white"
        >
          7
        </Button>
        <Button 
          onClick={() => inputDigit("8")} 
          className="bg-cutelist-dark/50 hover:bg-cutelist-dark/70 text-white"
        >
          8
        </Button>
        <Button 
          onClick={() => inputDigit("9")} 
          className="bg-cutelist-dark/50 hover:bg-cutelist-dark/70 text-white"
        >
          9
        </Button>
        <Button 
          onClick={() => performOperation("*")} 
          className="bg-cutelist-primary/70 hover:bg-cutelist-primary text-white"
        >
          ×
        </Button>
        
        <Button 
          onClick={handleMemoryRecall} 
          className="bg-cutelist-dark/70 hover:bg-cutelist-dark text-white text-sm"
        >
          MR
        </Button>
        <Button 
          onClick={() => inputDigit("4")} 
          className="bg-cutelist-dark/50 hover:bg-cutelist-dark/70 text-white"
        >
          4
        </Button>
        <Button 
          onClick={() => inputDigit("5")} 
          className="bg-cutelist-dark/50 hover:bg-cutelist-dark/70 text-white"
        >
          5
        </Button>
        <Button 
          onClick={() => inputDigit("6")} 
          className="bg-cutelist-dark/50 hover:bg-cutelist-dark/70 text-white"
        >
          6
        </Button>
        <Button 
          onClick={() => performOperation("-")} 
          className="bg-cutelist-primary/70 hover:bg-cutelist-primary text-white"
        >
          -
        </Button>
        
        <Button 
          onClick={handleMemoryAdd} 
          className="bg-cutelist-dark/70 hover:bg-cutelist-dark text-white text-sm"
        >
          M+
        </Button>
        <Button 
          onClick={() => inputDigit("1")} 
          className="bg-cutelist-dark/50 hover:bg-cutelist-dark/70 text-white"
        >
          1
        </Button>
        <Button 
          onClick={() => inputDigit("2")} 
          className="bg-cutelist-dark/50 hover:bg-cutelist-dark/70 text-white"
        >
          2
        </Button>
        <Button 
          onClick={() => inputDigit("3")} 
          className="bg-cutelist-dark/50 hover:bg-cutelist-dark/70 text-white"
        >
          3
        </Button>
        <Button 
          onClick={() => performOperation("+")} 
          className="bg-cutelist-primary/70 hover:bg-cutelist-primary text-white"
        >
          +
        </Button>
        
        <Button 
          onClick={handleMemorySubtract} 
          className="bg-cutelist-dark/70 hover:bg-cutelist-dark text-white text-sm"
        >
          M-
        </Button>
        <Button 
          onClick={() => performOperation("±")} 
          className="bg-cutelist-dark/50 hover:bg-cutelist-dark/70 text-white"
        >
          ±
        </Button>
        <Button 
          onClick={() => inputDigit("0")} 
          className="bg-cutelist-dark/50 hover:bg-cutelist-dark/70 text-white"
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
        
        <Button 
          onClick={() => performOperation("x²")} 
          className="bg-cutelist-dark/70 hover:bg-cutelist-dark text-white"
        >
          x²
        </Button>
        <Button 
          onClick={() => performOperation("1/x")} 
          className="bg-cutelist-dark/70 hover:bg-cutelist-dark text-white"
        >
          1/x
        </Button>
        <Button 
          onClick={() => {}} 
          className="bg-cutelist-dark/70 hover:bg-cutelist-dark text-white"
          disabled
        >
          π
        </Button>
        <Button 
          onClick={() => {}} 
          className="bg-cutelist-dark/70 hover:bg-cutelist-dark text-white"
          disabled
        >
          e
        </Button>
        <Button 
          onClick={clearHistory} 
          className="bg-cutelist-dark/70 hover:bg-cutelist-dark text-white"
        >
          CL
        </Button>
      </div>
    </div>
  );

  const renderUnitConverter = () => {
    const unitCategories = [
      { label: "Length", units: ["cm", "m", "km", "inch", "ft"] },
      { label: "Weight", units: ["kg", "g", "lb", "oz"] },
      { label: "Temperature", units: ["c", "f", "k"] },
    ];

    return (
      <div className="glass-card w-full rounded-xl overflow-hidden p-4">
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Value</label>
            <Input 
              type="number" 
              value={conversionValue} 
              onChange={e => setConversionValue(e.target.value)}
              className="bg-cutelist-dark/50"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">From</label>
              <select 
                value={unitFrom} 
                onChange={e => setUnitFrom(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-cutelist-dark/50 px-3 py-2 text-sm"
              >
                {unitCategories.map((category) => (
                  <optgroup key={category.label} label={category.label}>
                    {category.units.map(unit => (
                      <option key={unit} value={unit}>{unit.toUpperCase()}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">To</label>
              <select 
                value={unitTo} 
                onChange={e => setUnitTo(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-cutelist-dark/50 px-3 py-2 text-sm"
              >
                {unitCategories.map((category) => (
                  <optgroup key={category.label} label={category.label}>
                    {category.units.map(unit => (
                      <option key={unit} value={unit}>{unit.toUpperCase()}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
          
          <Button onClick={handleUnitConversion} className="w-full">
            Convert
          </Button>
          
          <div className="mt-2 p-4 border border-cutelist-primary/30 rounded-md bg-cutelist-primary/10">
            <p className="text-sm mb-1">Result:</p>
            <p className="text-2xl font-mono">
              {conversionResult} {unitTo.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-cutelist-dark">
        <Header />
        <main className="flex-1 container flex flex-col items-center py-12">
          <div className="w-full max-w-2xl px-4">
            <div className="flex flex-col items-center">
              <h1 className="text-4xl font-bold text-center mb-2 text-gradient">Calculator</h1>
              <p className="text-center text-gray-400 mb-8">A powerful and cute calculator</p>
              
              <div className="w-full mb-6">
                <Tabs 
                  defaultValue="standard" 
                  className="w-full"
                  onValueChange={(value) => setCalculationType(value as any)}
                >
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="standard">Standard</TabsTrigger>
                    <TabsTrigger value="scientific">Scientific</TabsTrigger>
                    <TabsTrigger value="converter">Unit Converter</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="standard" className="w-full">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        {renderStandardCalculator()}
                      </div>
                      <div>
                        <Card className="h-full">
                          <CardHeader>
                            <CardTitle className="text-lg">History</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {history.length === 0 ? (
                              <p className="text-gray-500 text-sm">No calculations yet</p>
                            ) : (
                              <div className="space-y-2">
                                {history.map((item, index) => (
                                  <div key={index} className="text-sm font-mono border-b border-border/20 pb-1">
                                    {item}
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="scientific" className="w-full">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        {renderScientificCalculator()}
                      </div>
                      <div>
                        <Card className="h-full">
                          <CardHeader>
                            <CardTitle className="text-lg">History</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {history.length === 0 ? (
                              <p className="text-gray-500 text-sm">No calculations yet</p>
                            ) : (
                              <div className="space-y-2">
                                {history.map((item, index) => (
                                  <div key={index} className="text-sm font-mono border-b border-border/20 pb-1">
                                    {item}
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="converter" className="w-full">
                    {renderUnitConverter()}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Calculator;
