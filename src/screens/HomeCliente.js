
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase.js';
import { useNavigate } from 'react-router-dom';
import '../styles/HomeCliente.css';

const HomeCliente = () => {
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserName = async () => {
            const user = auth.currentUser;
            if (user) {
                const userDoc = await db.collection('clientes').doc(user.uid).get();
                if (userDoc.exists) {
                    setUserName(userDoc.data().userName);
                }
            }
        };

        fetchUserName();
    }, []);

    const handleLogout = () => {
        auth.signOut().then(() => {
            navigate('/');
        });
    };

    return (
        <div className="home-cliente">
            <div className="header">
                <span>Olá, {userName}</span>
                <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
            <div className="buttons">
                <button onClick={() => navigate('/marcar-corte')} className="menu-button">Marcar corte</button>
                <button onClick={() => navigate('/cortes-marcados')} className="menu-button">Ver cortes marcados</button>
                <button onClick={() => navigate('/cortesPassados')} className="menu-button">Ver cortes já feitos</button>
            </div>
        </div>
    );
};

export default HomeCliente;