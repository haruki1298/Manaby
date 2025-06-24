import { BrowserRouter, Routes, Route } from "react-router-dom";
import NoteDetail from "./pages/NoteDetail";
import { Home } from "./pages/Home";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Layout from "./Layout";
import { useCurrentUserStore } from "./modules/auth/current-user.state";
import { useEffect, useState } from "react";
import { authRepository } from "./modules/auth/auath.repository";


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

  if(isLoading) return <div />;

  return (
    <BrowserRouter>
      <div className="h-full">
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route index element={<Home />}/>
            <Route path="/notes/:id" element={<NoteDetail />}/>
          </Route>
          <Route path="/signin" element={<Signin />}/>
          <Route path="/signup" element={<Signup />}/>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App
