import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase.js';
import '../styles/NavigationMenu.css';

const NavigationMenu = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    console.log('Fetching user data for UID:', user.uid);
                    // Verificar se o usuário está na coleção 'clientes'
                    const clientDoc = await db.collection('clientes').doc(user.uid).get();
                    if (clientDoc.exists) {
                        setCurrentUser({
                            displayName: clientDoc.data().userName,
                            userType: 'Cliente'
                        });
                        console.log('User is a Cliente:', clientDoc.data().userName);
                        setLoading(false);
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
                        console.log('User is a Profissional:', professionalDoc.data().userName, professionalDoc.data().nomeBarbearia);
                        setLoading(false);
                        return;
                    }
                    console.error('Usuário não encontrado em nenhuma coleção.');
                    setLoading(false);
                } catch (error) {
                    console.error('Erro ao buscar dados do usuário:', error.message);
                    setLoading(false);
                }
            } else {
                console.log('Nenhum usuário autenticado.');
                setLoading(false);
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
            <div className="nav-left">
                {loading ? (
                    <span>Carregando...</span>
                ) : currentUser ? (
                    <span>
                        {currentUser.userType === 'Cliente' ? currentUser.displayName : currentUser.barbeariaNome}
                    </span>
                ) : (
                    <span>Usuário não encontrado</span>
                )}
                <nav>
                    <Link to="/homeProfissional">
                        <button className={`navigate-button ${location.pathname === '/homeProfissional' ? 'active' : ''}`}>Agendamentos</button>
                    </Link>
                    <Link to="/produtos">
                        <button className={`navigate-button ${location.pathname === '/produtos' ? 'active' : ''}`}>Produtos</button>
                    </Link>
                    <Link to="/funcionarios">
                        <button className={`navigate-button ${location.pathname === '/funcionarios' ? 'active' : ''}`}>Funcionários</button>
                    </Link>
                </nav>
            </div>
            <div className="nav-right">
                <button onClick={handleLogout} className="logout-button">Deslogar</button>
            </div>
        </div>
    );
}

export default NavigationMenu;
