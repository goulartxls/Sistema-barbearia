import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginCadastroUsuario from './screens/LoginCadastroUsuario';
import LoginProfissional from './screens/LoginProfissional';
import HomeCliente from './screens/HomeCliente';
import HomeProfissional from './screens/HomeProfissional';
import BarbeariaDetalhes from './screens/BarbeariaDetalhes';
import GraficoBarbearia from './screens/GraficoBarbearia';
import Produtos from './screens/Produtos';
import Funcionarios from './screens/Funcionarios';

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
        <Route path="/funcionarios" element={<Funcionarios />} />
      </Routes>
    </Router>
  );
}

export default App;