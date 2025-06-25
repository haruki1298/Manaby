import { BrowserRouter, Routes, Route } from "react-router-dom";
import NoteDetail from "./pages/NoteDetail";
import { Home } from "./pages/Home";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Layout from "./Layout";
import { useCurrentUserStore } from "./modules/auth/current-user.state";
import { useEffect, useState } from "react";
import { authRepository } from "./modules/auth/auath.repository";
import PublicNote from "./pages/PublicNote";
import { SettingsProvider } from "./modules/settings/settings.state.tsx";


function App() {
  const [isLoading, setIsLoading] = useState(true);
  const currentUserstore = useCurrentUserStore();

  useEffect(() => {
    setSession();
  }, []);

  const setSession = async () =>{
    const currentUser = await authRepository.getCurrentUser();
    currentUserstore.set(currentUser);
    setIsLoading(false);
  };

  if(isLoading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-neutral-900">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-neutral-600 dark:text-neutral-400 font-medium">読み込み中...</p>
      </div>
    </div>
  );

  return (
    <SettingsProvider>
      <BrowserRouter>
        <div className="h-full">
          <Routes>
            <Route path='/' element={<Layout />}>
              <Route index element={<Home />}/>
              <Route path="/notes/:id" element={<NoteDetail />}/>
              <Route path="/public/:id" element={<PublicNote />}/>
            </Route>
            <Route path="/signin" element={<Signin />}/>
            <Route path="/signup" element={<Signup />}/>
          </Routes>
        </div>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App
