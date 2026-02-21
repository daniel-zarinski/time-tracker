import { Tabs, TabsList, TabsTrigger, TabsContent } from '@time-tracker/ui';

export function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-xl font-bold">Time Tracker</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Tabs defaultValue="home">
          <TabsList>
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          <TabsContent value="home">
            <p>Welcome to Time Tracker.</p>
          </TabsContent>
          <TabsContent value="about">
            <p>About Time Tracker.</p>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
