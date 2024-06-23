import React, { useEffect, useState } from 'react';
import { db } from '../firebase.js';
import { useNavigate } from 'react-router-dom';
import '../styles/HomeCliente.css';

const HomeCliente = () => {
    const [barbearias, setBarbearias] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBarbearias = async () => {
            const barbeariasCollection = await db.collection('profissionais').get();
            setBarbearias(barbeariasCollection.docs.map(doc => ({
                id: doc.id,
                data: doc.data()
            })));
        };

        fetchBarbearias();
    }, []);

    const handleClick = (id) => {
        navigate(`/barbearia/${id}`);
    }

    return (
        <div className="home-cliente">
            <h1>Barbearias Cadastradas</h1>
            <ul>
                {barbearias.map(barbearia => (
                    <li key={barbearia.id} onClick={() => handleClick(barbearia.id)}>
                        <h2>{barbearia.data.userName}</h2>
                        <p>{barbearia.data.enderecoBarbearia}</p>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default HomeCliente;
