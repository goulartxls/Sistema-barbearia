import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase.js';
import '../styles/NavigationMenu.css';

const NavigationMenu = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    // Verificar se o usuário está na coleção 'clientes'
                    const clientDoc = await db.collection('clientes').doc(user.uid).get();
                    if (clientDoc.exists) {
                        setCurrentUser({
                            displayName: clientDoc.data().userName,
                            userType: 'Cliente'
                        });
                        return;
                    }

                    // Se não estiver na coleção 'clientes', verificar na coleção 'profissionais'
                    const professionalDoc = await db.collection('profissionais').doc(user.uid).get();
                    if (professionalDoc.exists) {
                        setCurrentUser({
                            displayName: professionalDoc.data().userName,
                            userType: 'Profissional',
                            barbeariaNome: professionalDoc.data().nomeBarbearia
                        });
                    }
                } catch (error) {
                    console.error('Erro ao buscar dados do usuário:', error.message);
                }
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/');
        } catch (error) {
            console.error('Erro ao fazer logout:', error.message);
        }
    };

    return (
        <div className="navigation-menu">
            {currentUser ? (
                <span>
                    {currentUser.userType === 'Cliente' ? currentUser.displayName : currentUser.barbeariaNome}
                </span>
            ) : (
                <span>Carregando...</span>
            )}

            <Link to="/homeProfissional">
                <button className={`navigate-button ${location.pathname === '/homeProfissional' ? 'active' : ''}`}>Agendamentos</button>
            </Link>
            <Link to="/produtos">
                <button className={`navigate-button ${location.pathname === '/produtos' ? 'active' : ''}`}>Produtos</button>
            </Link>
            <Link to="/funcionarios">
                <button className={`navigate-button ${location.pathname === '/funcionarios' ? 'active' : ''}`}>Funcionários</button>
            </Link>
            <Link to="/GraficoBarbearia">
                <button className={`navigate-button ${location.pathname === '/GraficoBarbearia' ? 'active' : ''}`}>Ver Gráficos</button>
            </Link>
            <button onClick={handleLogout} className="logout-button">Deslogar</button>
        </div>
    );
}

export default NavigationMenu;