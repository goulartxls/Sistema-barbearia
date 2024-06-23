import React from 'react';

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginCadastroUsuario from './screens/LoginCadastroUsuario.js';
import LoginProfissional from './screens/LoginProfissional';
import HomeCliente from './screens/HomeCliente.js';
import HomeProfissional from './screens/HomeProfissional.js';
import BarbeariaDetalhes from './screens/BarbeariaDetalhes.js';
import GraficoBarbearia from './screens/GraficoBarbearia.js'

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

      </Routes>
    </Router>
  )
}

export default App;