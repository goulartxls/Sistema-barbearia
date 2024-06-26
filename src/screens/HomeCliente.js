import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase.js';
import { useNavigate } from 'react-router-dom';
import '../styles/HomeCliente.css';

const HomeCliente = () => {
    const [barbearias, setBarbearias] = useState([]);
    const [filteredBarbearias, setFilteredBarbearias] = useState([]);
    const [userName, setUserName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [cortesMarcados, setCortesMarcados] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBarbearias = async () => {
            const barbeariasCollection = await db.collection('profissionais').get();
            const barbeariasData = barbeariasCollection.docs.map(doc => ({
                id: doc.id,
                data: doc.data()
            }));
            setBarbearias(barbeariasData);
            setFilteredBarbearias(barbeariasData); // Initially show all barbearias
        };

        const fetchUserName = async () => {
            const user = auth.currentUser;
            if (user) {
                const userDoc = await db.collection('clientes').doc(user.uid).get();
                if (userDoc.exists) {
                    setUserName(userDoc.data().userName);
                }
            }
        };

        const fetchCortesMarcados = async () => {
            const user = auth.currentUser;
            if (user) {
                const agendamentosCollection = await db.collection('agendamentos').where('userId', '==', user.uid).get();
                const agendamentosData = agendamentosCollection.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const agendamentosWithDetails = await Promise.all(agendamentosData.map(async agendamento => {
                    const produtos = agendamento.produtos || [];
                    const produtosData = await Promise.all(
                        produtos.map(async produtoId => {
                            const produtoDoc = await db.collection('produtos').doc(produtoId).get();
                            return produtoDoc.exists ? produtoDoc.data() : null;
                        })
                    );
                    const funcionarioDoc = await db.collection('funcionarios').doc(agendamento.funcionarioId).get();
                    const funcionarioNome = funcionarioDoc.exists ? funcionarioDoc.data().nome : "Nome não encontrado";
                    const barbeariaDoc = await db.collection('profissionais').doc(agendamento.barbeariaId).get();
                    const barbeariaData = barbeariaDoc.exists ? barbeariaDoc.data() : { userName: "Barbearia não encontrada", enderecoBarbearia: "" };
                    return { 
                        ...agendamento, 
                        produtosData: produtosData.filter(p => p !== null), 
                        funcionarioNome, 
                        barbeariaNome: barbeariaData.userName, 
                        barbeariaEndereco: barbeariaData.enderecoBarbearia 
                    };
                }));

                setCortesMarcados(agendamentosWithDetails);
            }
        };

        fetchBarbearias();
        fetchUserName();
        fetchCortesMarcados();
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        setFilteredBarbearias(
            barbearias.filter(barbearia =>
                barbearia.data.userName.toLowerCase().includes(term) ||
                barbearia.data.enderecoBarbearia.toLowerCase().includes(term)
            )
        );
    };

    const handleClick = (id) => {
        navigate(`/barbearia/${id}`);
    }

    const handleLogout = () => {
        auth.signOut().then(() => {
            navigate('/');
        }).catch((error) => {
            console.error('Erro ao fazer logout: ', error);
        });
    }

    return (
        <div className="home-cliente">
            <h1>Bem-vindo(a), {userName}!</h1>
            <button onClick={handleLogout} className="logout-button">Logout</button>

            
            <h2>Barbearias Cadastradas</h2>
            <input 
                type="text" 
                placeholder="Pesquisar Barbearias..." 
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
            />

            <ul>
                {filteredBarbearias.map(barbearia => (
                    <li key={barbearia.id} onClick={() => handleClick(barbearia.id)}>
                        <h2>{barbearia.data.userName}</h2>
                        <p>{barbearia.data.enderecoBarbearia}</p>
                    </li>
                ))}
            </ul>

            <h2>Cortes Marcados</h2>
            <ul>
                {cortesMarcados.length > 0 ? cortesMarcados.map((corte, index) => (
                    <li key={index} className="corte-item">
                        <p><strong>Data e Hora:</strong> {new Date(corte.agendamento).toLocaleString()}</p>
                        <p><strong>Funcionário:</strong> {corte.funcionarioNome}</p>
                        <p><strong>Barbearia:</strong> {corte.barbeariaNome}</p>
                        <p><strong>Endereço:</strong> {corte.barbeariaEndereco}</p>
                        {corte.produtosData.length > 0 && (
                            <>
                                <h3>Produtos Selecionados:</h3>
                                <ul className="produtos-list">
                                    {corte.produtosData.map((produto, idx) => (
                                        <li key={idx} className="produto-item">
                                            <p><strong>Nome:</strong> {produto.nome}</p>
                                            <p><strong>Preço:</strong> {produto.preco}</p>
                                            <p><strong>Descrição:</strong> {produto.descricao}</p>
                                            {produto.imagemUrl && <img src={produto.imagemUrl} alt={produto.nome} />}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </li>
                )) : <p>Nenhum corte marcado encontrado</p>}
            </ul>
        </div>
    )
}

export default HomeCliente;