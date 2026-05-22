import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Loading from "./components/Loading";

// Route-level code splitting
const Home = lazy(() => import("./pages/Home"));
const AdotarAnimal = lazy(() => import("./pages/AdotarAnimal"));
const Cadastro = lazy(() => import("./pages/Cadastro"));
const Ongs = lazy(() => import("./pages/Ongs"));
const Registro = lazy(() => import("./pages/Registro"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/adotar" element={<AdotarAnimal />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/ongs" element={<Ongs />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
