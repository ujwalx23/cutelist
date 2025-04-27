
import { Header } from "@/components/Header";
import { TaskContainer } from "@/components/TaskContainer";
import { ThemeProvider } from "@/components/ThemeProvider";

const Index = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-cutelist-dark">
        <Header />
        <main className="flex-1 container flex flex-col items-center justify-center py-12">
          <div className="w-full max-w-4xl px-4">
            <div className="flex flex-col items-center">
              <h1 className="text-4xl font-bold text-center mb-2 text-gradient">Welcome to CuteList</h1>
              <p className="text-center text-gray-400 mb-8">Manage your tasks in the cutest way possible</p>
              <TaskContainer />
            </div>
          </div>
        </main>
        <footer className="py-6 text-center text-gray-500 text-sm">
          <p>CuteList © 2025 - Your adorable task manager</p>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default Index;
