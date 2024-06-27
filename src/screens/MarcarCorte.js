import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase.js';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/MarcarCorte.css';

const MarcarCorte = () => {
    const [userName, setUserName] = useState('');
    const [barbearias, setBarbearias] = useState([]);
    const [selectedBarbearia, setSelectedBarbearia] = useState('');
    const [funcionarios, setFuncionarios] = useState([]);
    const [selectedFuncionario, setSelectedFuncionario] = useState('');
    const [agendamento, setAgendamento] = useState('');
    const [produtos, setProdutos] = useState([]);
    const [selectedProdutos, setSelectedProdutos] = useState([]);
    const navigate = useNavigate();
    const { id } = useParams();

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

        const fetchBarbearias = async () => {
            const barbeariasCollection = await db.collection('profissionais').get();
            setBarbearias(barbeariasCollection.docs.map(doc => ({
                id: doc.id,
                data: doc.data()
            })));
        };

        fetchUserName();
        fetchBarbearias();
    }, []);

    useEffect(() => {
        if (selectedBarbearia) {
            const fetchFuncionarios = async () => {
                const funcionariosCollection = await db.collection('funcionarios').where('barbeariaId', '==', selectedBarbearia).get();
                setFuncionarios(funcionariosCollection.docs.map(doc => ({
                    id: doc.id,
                    data: doc.data()
                })));
            };

            const fetchProdutos = async () => {
                const produtosCollection = await db.collection('produtos').where('barbeariaId', '==', selectedBarbearia).get();
                setProdutos(produtosCollection.docs.map(doc => ({
                    id: doc.id,
                    data: doc.data()
                })));
            };

            fetchFuncionarios();
            fetchProdutos();
        }
    }, [selectedBarbearia]);

    const handleAgendamento = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (user) {
            const today = new Date().toISOString().slice(0, 10); // Obtém a data atual (YYYY-MM-DD)
            const cortesPorDiaRef = db.collection('cortesPorDia').doc(today);

            // Atualiza o contador de cortes para o dia atual
            await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(cortesPorDiaRef);
                const newCount = (doc.exists ? doc.data().count : 0) + 1;
                transaction.set(cortesPorDiaRef, { count: newCount });
            });

            await db.collection('agendamentos').add({
                userId: user.uid,
                barbeariaId: selectedBarbearia,
                funcionarioId: selectedFuncionario,
                agendamento,
                produtos: selectedProdutos.map(produto => produto.id)
            });

            navigate('/homeCliente');
        }
    };

    const handleSelectProduto = (produto) => {
        setSelectedProdutos(prev => {
            if (prev.includes(produto)) {
                return prev.filter(p => p !== produto);
            } else {
                return [...prev, produto];
            }
        });
    };

    const handleLogout = () => {
        auth.signOut().then(() => {
            navigate('/');
        }).catch((error) => {
            console.error('Erro ao fazer logout: ', error);
        });
    };

    return (
        <div className="home-cliente">
            <h2>Marcar Corte</h2>
            <form onSubmit={handleAgendamento}>
                <select value={selectedBarbearia} onChange={(e) => setSelectedBarbearia(e.target.value)} required>
                    <option value="">Selecione uma barbearia</option>
                    {barbearias.map(barbearia => (
                        <option key={barbearia.id} value={barbearia.id}>{barbearia.data.userName}</option>
                    ))}
                </select>
                {selectedBarbearia && (
                    <>
                        <select value={selectedFuncionario} onChange={(e) => setSelectedFuncionario(e.target.value)} required>
                            <option value="">Selecione um funcionário</option>
                            {funcionarios.map(funcionario => (
                                <option key={funcionario.id} value={funcionario.id}>{funcionario.data.nome}</option>
                            ))}
                        </select>
                        <input
                            type="datetime-local"
                            value={agendamento}
                            onChange={(e) => setAgendamento(e.target.value)}
                            required
                        />
                        <h3>Produtos Disponíveis</h3>
                        <ul className="produtos-list">
                            {produtos.map(produto => (
                                <li key={produto.id}>
                                    <p><strong>Nome:</strong> {produto.data.nome}</p>
                                    <p><strong>Preço:</strong> {produto.data.preco}</p>
                                    <button type="button" onClick={() => handleSelectProduto(produto)}>
                                        {selectedProdutos.includes(produto) ? 'Remover' : 'Adicionar'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button type="submit">Marcar</button>
                    </>
                )}
            </form>
        </div>
    );
};

export default MarcarCorte;