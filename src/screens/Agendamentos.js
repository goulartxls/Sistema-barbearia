// src/components/Agendamentos.js
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase.js';
import '../styles/Agendamentos.css';

const Agendamentos = () => {
    const [agendamentos, setAgendamentos] = useState([]);

    useEffect(() => {
        const fetchAgendamentos = async () => {
            const user = auth.currentUser;
            if (user) {
                const agendamentosCollection = await db.collection('agendamentos').where('barbeariaId', '==', user.uid).get();
                const agendamentosData = agendamentosCollection.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const agendamentosWithProdutos = await Promise.all(agendamentosData.map(async agendamento => {
                    const produtos = agendamento.produtos || [];
                    const produtosData = await Promise.all(
                        produtos.map(async produtoId => {
                            const produtoDoc = await db.collection('produtos').doc(produtoId).get();
                            return produtoDoc.exists ? produtoDoc.data() : null;
                        })
                    );
                    const clienteDoc = await db.collection('clientes').doc(agendamento.userId).get();
                    const clienteNome = clienteDoc.exists ? clienteDoc.data().userName : "Nome não encontrado";
                    return { ...agendamento, produtosData: produtosData.filter(p => p !== null), clienteNome };
                }));

                setAgendamentos(agendamentosWithProdutos);
            }
        };

        fetchAgendamentos();
    }, []);

    return (
        <div className="agendamentos-container">
            <h1>Agendamentos Marcados</h1>
            <ul className="agendamentos-list">
                {agendamentos.length > 0 ? agendamentos.map((agendamento, index) => (
                    <li key={index} className="agendamento-item">
                        <p><strong>Data e Hora:</strong> {agendamento.agendamento}</p>
                        <p><strong>Cliente:</strong> {agendamento.clienteNome}</p>
                        <h3>Produtos Selecionados:</h3>
                        <ul className="produtos-list">
                            {agendamento.produtosData.map((produto, idx) => (
                                <li key={idx} className="produto-item">
                                    <p><strong>Nome:</strong> {produto.nome}</p>
                                    <p><strong>Preço:</strong> {produto.preco}</p>
                                    <p><strong>Descrição:</strong> {produto.descricao}</p>
                                    {produto.imagemUrl && <img src={produto.imagemUrl} alt={produto.nome} />}
                                </li>
                            ))}
                        </ul>
                    </li>
                )) : <p>Nenhum agendamento encontrado</p>}
            </ul>
        </div>
    );
} 

export default Agendamentos;