import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import AdotarAnimal from "./pages/AdotarAnimal";
import Cadastro from "./pages/Cadastro";
import Ongs from "./pages/Ongs";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/adotar"
          element={<AdotarAnimal />}
        />

        <Route
          path="/cadastro"
          element={<Cadastro />}
        />

        <Route
          path="/ongs"
          element={<Ongs />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;