import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase.js';
import { useNavigate } from 'react-router-dom';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [step, setStep] = useState(1);
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

    const handleSelectBarbearia = (barbeariaId) => {
        setSelectedBarbearia(barbeariaId);
        setStep(2); // Avançar para a etapa de selecionar funcionário e horário
    };

    const handleSelectFuncionario = (funcionarioId) => {
        setSelectedFuncionario(funcionarioId);
    };

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

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h2>Escolher Barbearia</h2>
                        <ul>
                            {barbearias.map(barbearia => (
                                <li key={barbearia.id}>
                                    <button onClick={() => handleSelectBarbearia(barbearia.id)}>
                                        {barbearia.data.userName}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h2>Marcar Corte</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            setStep(3);
                        }}>
                            <select value={selectedFuncionario} onChange={(e) => handleSelectFuncionario(e.target.value)} required>
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
                            <button type="submit">Próximo</button>
                        </form>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <button onClick={handleAgendamento}>Finalizar Pedido</button>
                        <h2>Escolha Produtos Para Levar Junto!</h2>
                        <input 
                            type="text" 
                            placeholder="Pesquisar produtos..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                        <ul className="produtos-list">
                            {produtos
                                .filter(produto => 
                                    produto.data.nome.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map(produto => (
                                    <li key={produto.id}>
                                        <p><strong>Nome:</strong> {produto.data.nome}</p>
                                        <p><strong>Preço:</strong> {produto.data.preco}</p>
                                        {produto.data.imagemUrl && <img src={produto.data.imagemUrl} alt={produto.data.nome} />}
                                        <button type="button" onClick={() => handleSelectProduto(produto)}>
                                            {selectedProdutos.includes(produto) ? 'Remover' : 'Adicionar'}
                                        </button>
                                    </li>
                            ))}
                        </ul>
                        
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="home-cliente">
            {renderStep()}
        </div>
    );
};

export default MarcarCorte;
