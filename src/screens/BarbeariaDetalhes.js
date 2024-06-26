import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase.js';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/BarbeariaDetalhes.css';

const BarbeariaDetalhes = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [barbearia, setBarbearia] = useState(null);
    const [produtos, setProdutos] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [selectedProdutos, setSelectedProdutos] = useState([]);
    const [selectedFuncionario, setSelectedFuncionario] = useState('');
    const [agendamento, setAgendamento] = useState('');
    const [avaliacao, setAvaliacao] = useState('');
    const [estrelas, setEstrelas] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchBarbearia = async () => {
            const barbeariaDoc = await db.collection('profissionais').doc(id).get();
            if (barbeariaDoc.exists) {
                setBarbearia(barbeariaDoc.data());
            }
        };

        const fetchProdutos = async () => {
            const produtosCollection = await db.collection('produtos').where('barbeariaId', '==', id).get();
            setProdutos(produtosCollection.docs.map(doc => ({
                id: doc.id,
                data: doc.data()
            })));
        };

        const fetchFuncionarios = async () => {
            const funcionariosCollection = await db.collection('funcionarios').where('barbeariaId', '==', id).get();
            setFuncionarios(funcionariosCollection.docs.map(doc => ({
                id: doc.id,
                data: doc.data()
            })));
        };

        fetchBarbearia();
        fetchProdutos();
        fetchFuncionarios();
    }, [id]);

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
                barbeariaId: id,
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

    const handleSubmitAvaliacao = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (user) {
            await db.collection('avaliacoes').add({
                userId: user.uid,
                barbeariaId: id,
                avaliacao,
                estrelas,
                data: new Date()
            });

            setAvaliacao('');
            setEstrelas(0);
            alert('Avaliação enviada com sucesso!');
        }
    };

    return (
        <div className="barbearia-detalhes">
            {barbearia && (
                <>
                    <h1>{barbearia.userName}</h1>
                    <p>{barbearia.enderecoBarbearia}</p>

                    <h2>Produtos Disponíveis</h2>
                    <input
                        type="text"
                        placeholder="Pesquisar produtos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <ul style={{ listStyle: 'none', textAlign: 'start' }}>
                        {produtos
                            .filter(produto => 
                                produto.data.nome.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map(produto => (
                                <li key={produto.id}>
                                    <h3>{produto.data.nome}</h3>
                                    <p>Preço: {produto.data.preco}</p>
                                    <p>{produto.data.descricao}</p>
                                    {produto.data.imagemUrl && <img src={produto.data.imagemUrl} alt={produto.data.nome} style={{ width: '100px', height: '100px' }} />}
                                    <br />
                                    <button onClick={() => handleSelectProduto(produto)}>
                                        {selectedProdutos.includes(produto) ? 'Remover' : 'Adicionar'}
                                    </button>
                                </li>
                            ))}
                    </ul>

                    <h2>Marcar Corte</h2>
                    <form onSubmit={handleAgendamento}>
                        <input
                            type="datetime-local"
                            value={agendamento}
                            onChange={(e) => setAgendamento(e.target.value)}
                            required
                        />
                        <select value={selectedFuncionario} onChange={(e) => setSelectedFuncionario(e.target.value)} required>
                            <option value="">Selecione um funcionário</option>
                            {funcionarios.map(funcionario => (
                                <option key={funcionario.id} value={funcionario.id}>{funcionario.data.nome}</option>
                            ))}
                        </select>
                        <button type="submit">Marcar</button>
                    </form>
                    
                </>
            )}
        </div>
    );
};

export default BarbeariaDetalhes;