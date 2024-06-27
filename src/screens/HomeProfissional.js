// src/pages/HomeProfissional.js
import React from 'react';
import Agendamentos from './Agendamentos';
import { useNavigate } from 'react-router-dom';
import '../styles/HomeProfissional.css';
import NavigationMenu from './NavigationMenu';

const HomeProfissional = () => {
    
    const navigate = useNavigate();

    const handleGoToProdutos = () => {
        navigate('/produtos');
    };

    const handleGoToFuncionarios = () => {
        navigate('/funcionarios');
    };
    return (
        <div className="home-profissional">
            <NavigationMenu />
            <Agendamentos />
        </div>
    );
}

export default HomeProfissional;