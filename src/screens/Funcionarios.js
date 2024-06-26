// src/components/Funcionarios.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase.js';
import '../styles/Funcionarios.css';
import NavigationMenu from './NavigationMenu.js';

const Funcionarios = () => {
    const [funcionarios, setFuncionarios] = useState([]);
    const [filteredFuncionarios, setFilteredFuncionarios] = useState([]);
    const [nomeFuncionario, setNomeFuncionario] = useState('');
    const [emailFuncionario, setEmailFuncionario] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchFuncionarios = async () => {
            const user = auth.currentUser;
            if (user) {
                const funcionariosCollection = await db.collection('funcionarios').where('barbeariaId', '==', user.uid).get();
                const funcionariosData = funcionariosCollection.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setFuncionarios(funcionariosData);
                setFilteredFuncionarios(funcionariosData);
            }
        };

        fetchFuncionarios();
    }, []);

    const handleAddFuncionario = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (user) {
            const newFuncionario = {
                barbeariaId: user.uid,
                nome: nomeFuncionario,
                email: emailFuncionario
            };

            const docRef = await db.collection('funcionarios').add(newFuncionario);
            const newFuncionarios = [...funcionarios, { id: docRef.id, ...newFuncionario }];
            setFuncionarios(newFuncionarios);
            setFilteredFuncionarios(newFuncionarios);
            setNomeFuncionario('');
            setEmailFuncionario('');
        }
    };

    const handleRemoveFuncionario = async (id) => {
        await db.collection('funcionarios').doc(id).delete();
        const updatedFuncionarios = funcionarios.filter(funcionario => funcionario.id !== id);
        setFuncionarios(updatedFuncionarios);
        setFilteredFuncionarios(updatedFuncionarios);
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        setFilteredFuncionarios(funcionarios.filter(funcionario => funcionario.nome.toLowerCase().includes(term)));
    };

    return (
        <div className="funcionarios-container">
            <NavigationMenu />
            <h1>Adicionar Funcionário</h1>
            <form onSubmit={handleAddFuncionario} className="add-funcionario-form">
                <input
                    type="text"
                    placeholder="Nome do Funcionário"
                    value={nomeFuncionario}
                    onChange={(e) => setNomeFuncionario(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email do Funcionário"
                    value={emailFuncionario}
                    onChange={(e) => setEmailFuncionario(e.target.value)}
                    required
                />
                <button type="submit">Adicionar Funcionário</button>
            </form>

            <h1>Funcionários</h1>
            <input
                type="text"
                placeholder="Pesquisar Funcionários"
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
            />
            <ul className="funcionarios-list">
                {filteredFuncionarios.length > 0 ? filteredFuncionarios.map((funcionario, index) => (
                    <li key={index} className="funcionario-item">
                        <h2>{funcionario.nome}</h2>
                        <p>Email: {funcionario.email}</p>
                        <button onClick={() => handleRemoveFuncionario(funcionario.id)} className="remove-button">Remover</button>
                    </li>
                )) : <p>Nenhum funcionário encontrado</p>}
            </ul>
        </div>
    );
}

export default Funcionarios;