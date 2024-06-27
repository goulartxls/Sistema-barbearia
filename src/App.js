import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginCadastroUsuario from './screens/LoginCadastroUsuario';
import LoginProfissional from './screens/LoginProfissional';
import HomeCliente from './screens/HomeCliente';
import HomeProfissional from './screens/HomeProfissional';
import BarbeariaDetalhes from './screens/BarbeariaDetalhes';
import GraficoBarbearia from './screens/GraficoBarbearia';
import MarcarCorte from './screens/MarcarCorte';
import VerCortesMarcados from './screens/VerCortesMarcados.js';
import Produtos from './screens/Produtos';
import Funcionarios from './screens/Funcionarios';
import CortesPassados from './screens/CortesPassados.js';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginCadastroUsuario />} />
        <Route path="/loginProfissional" element={<LoginProfissional />} />
        <Route path="/homeCliente" element={<HomeCliente />} />
        <Route path="/barbearia/:id" element={<BarbeariaDetalhes />} />
        <Route path="/homeProfissional" element={<HomeProfissional />} />
        <Route path="/GraficoBarbearia" element={<GraficoBarbearia />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/marcar-corte" element={<MarcarCorte />} />
        <Route path="/cortesPassados" element={<CortesPassados />} />
        <Route path="/cortes-marcados" element={<VerCortesMarcados />} />
        <Route path="/funcionarios" element={<Funcionarios />} />
      </Routes>
    </Router>
  );
}

export default App;