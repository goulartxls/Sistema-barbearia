import React, { useEffect, useState } from 'react';
import { db, auth, storage } from '../firebase.js';
import { useNavigate } from 'react-router-dom';
import '../styles/HomeProfissional.css';

const HomeProfissional = () => {
    const [agendamentos, setAgendamentos] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [nomeProduto, setNomeProduto] = useState('');
    const [precoProduto, setPrecoProduto] = useState('');
    const [descricaoProduto, setDescricaoProduto] = useState('');
    const [imagemProduto, setImagemProduto] = useState(null);
    const [nomeFuncionario, setNomeFuncionario] = useState('');
    const [emailFuncionario, setEmailFuncionario] = useState('');
    const navigate = useNavigate();

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

        const fetchProdutos = async () => {
            const user = auth.currentUser;
            if (user) {
                const produtosCollection = await db.collection('produtos').where('barbeariaId', '==', user.uid).get();
                const produtosData = produtosCollection.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProdutos(produtosData);
            }
        };

        fetchAgendamentos();
        fetchProdutos();
    }, []);

    const handleAddProduto = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (user && imagemProduto) {
            const storageRef = storage.ref();
            const imageRef = storageRef.child(`produtos/${imagemProduto.name}`);
            await imageRef.put(imagemProduto);
            const imageUrl = await imageRef.getDownloadURL();

            const newProduto = {
                barbeariaId: user.uid,
                nome: nomeProduto,
                preco: precoProduto,
                descricao: descricaoProduto,
                imagemUrl: imageUrl
            };

            const docRef = await db.collection('produtos').add(newProduto);
            setProdutos([...produtos, { id: docRef.id, ...newProduto }]);
            setNomeProduto('');
            setPrecoProduto('');
            setDescricaoProduto('');
            setImagemProduto(null);
        }
    };

    const handleRemoveProduto = async (id) => {
        await db.collection('produtos').doc(id).delete();
        setProdutos(produtos.filter(produto => produto.id !== id));
    };

    const handleAddFuncionario = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (user) {
            const newFuncionario = {
                barbeariaId: user.uid,
                nome: nomeFuncionario,
                email: emailFuncionario
            };

            await db.collection('funcionarios').add(newFuncionario);
            setNomeFuncionario('');
            setEmailFuncionario('');
            alert('Funcionário adicionado com sucesso!');
        }
    };

    const handleGoToGrafico = () => {
        navigate('/GraficoBarbearia');
    };

    return (
        <div className="home-profissional">
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

            <h1>Adicionar Produto</h1>
            <form onSubmit={handleAddProduto} className="add-produto-form">
                <input
                    type="text"
                    placeholder="Nome do Produto"
                    value={nomeProduto}
                    onChange={(e) => setNomeProduto(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Preço do Produto"
                    value={precoProduto}
                    onChange={(e) => setPrecoProduto(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Descrição do Produto"
                    value={descricaoProduto}
                    onChange={(e) => setDescricaoProduto(e.target.value)}
                    required
                ></textarea>
                <input
                    type="file"
                    onChange={(e) => setImagemProduto(e.target.files[0])}
                    required
                />
                <button type="submit">Adicionar Produto</button>
            </form>

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

            <h1>Produtos</h1>
            <ul className="produtos-list">
                {produtos.length > 0 ? produtos.map((produto, index) => (
                    <li key={index} className="produto-item">
                        <h2>{produto.nome}</h2>
                        <p>Preço: {produto.preco}</p>
                        <p>{produto.descricao}</p>
                        {produto.imagemUrl && <img src={produto.imagemUrl} alt={produto.nome} />} <br />
                        <button onClick={() => handleRemoveProduto(produto.id)} className="remove-button">Remover</button>
                    </li>
                )) : <p>Nenhum produto encontrado</p>}
            </ul>

            <button onClick={handleGoToGrafico} className="go-to-grafico-button">Ver Gráficos</button>
        </div>
    );
}

export default HomeProfissional;
