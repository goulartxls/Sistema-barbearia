import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase.js';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/VerCortesMarcados.css';

const VerCortesMarcados = () => {
    const [cortes, setCortes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCortes = async () => {
            const user = auth.currentUser;
            if (user) {
                const agendamentosCollection = await db.collection('agendamentos')
                    .where('userId', '==', user.uid)
                    .get();
                const agendamentosData = agendamentosCollection.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const today = new Date();
                const agendamentosFuturos = agendamentosData.filter(agendamento => new Date(agendamento.agendamento) > today);

                const agendamentosWithDetails = await Promise.all(agendamentosFuturos.map(async agendamento => {
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

                setCortes(agendamentosWithDetails);
            }
        };

        fetchCortes();
    }, []);

    const cancelarCorte = async (corteId) => {
        try {
            await db.collection('agendamentos').doc(corteId).delete();
            setCortes(cortes.filter(corte => corte.id !== corteId));
        } catch (error) {
            console.error("Erro ao cancelar o corte:", error);
        }
    };

    return (
        <div className="meus-cortes-container">
            <div className="header">
                <h1>Meus Cortes Marcados</h1>
                <Link to="/homeCliente" className="link-voltar">Voltar para Home</Link>
            </div>
            <ul className="cortes-list">
                {cortes.length > 0 ? cortes.map((corte, index) => (
                    <li key={index} className="corte-item">
                        <p><strong>Data e Hora:</strong> {corte.agendamento}</p>
                        <p><strong>Barbearia:</strong> {corte.barbeariaNome}</p>
                        <p><strong>Endereço:</strong> {corte.barbeariaEndereco}</p>
                        <p><strong>Funcionário:</strong> {corte.funcionarioNome}</p>
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
                        <button onClick={() => cancelarCorte(corte.id)} className="cancelar-corte-button">Cancelar Corte</button>
                    </li>
                )) : <p>Nenhum corte marcado encontrado</p>}
            </ul>
        </div>
    );
}

export default VerCortesMarcados;
