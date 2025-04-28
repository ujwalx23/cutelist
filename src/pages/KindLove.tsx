
import { Header } from "@/components/Header";
import { QuotesList } from "@/components/quotes/QuotesList";
import { ThemeProvider } from "@/components/ThemeProvider";

const KindLove = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-cutelist-dark">
        <Header />
        <main className="flex-1 container flex flex-col items-center justify-center py-12">
          <div className="w-full max-w-4xl px-4">
            <div className="flex flex-col items-center">
              <h1 className="text-4xl font-bold text-center mb-2 text-gradient">KindLove Quotes</h1>
              <p className="text-center text-gray-400 mb-8">Share and discover inspirational quotes</p>
              <QuotesList />
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default KindLove;
