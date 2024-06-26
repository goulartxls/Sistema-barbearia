import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebase.js';
import '../styles/Produtos.css';
import NavigationMenu from './NavigationMenu.js';

const Produtos = () => {
    const [produtos, setProdutos] = useState([]);
    const [filteredProdutos, setFilteredProdutos] = useState([]);
    const [nomeProduto, setNomeProduto] = useState('');
    const [precoProduto, setPrecoProduto] = useState('');
    const [descricaoProduto, setDescricaoProduto] = useState('');
    const [imagemProduto, setImagemProduto] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchProdutos = async () => {
            const user = auth.currentUser;
            if (user) {
                const produtosCollection = await db.collection('produtos').where('barbeariaId', '==', user.uid).get();
                const produtosData = produtosCollection.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProdutos(produtosData);
                setFilteredProdutos(produtosData);
            }
        };

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
            const updatedProdutos = [...produtos, { id: docRef.id, ...newProduto }];
            setProdutos(updatedProdutos);
            setFilteredProdutos(updatedProdutos);
            setNomeProduto('');
            setPrecoProduto('');
            setDescricaoProduto('');
            setImagemProduto(null);
        }
    };

    const handleRemoveProduto = async (id) => {
        await db.collection('produtos').doc(id).delete();
        const updatedProdutos = produtos.filter(produto => produto.id !== id);
        setProdutos(updatedProdutos);
        setFilteredProdutos(updatedProdutos);
    };

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        const filtered = produtos.filter(produto =>
            produto.nome.toLowerCase().includes(query) ||
            produto.descricao.toLowerCase().includes(query)
        );
        setFilteredProdutos(filtered);
    };

    return (
        <div className="produtos-container">
            <NavigationMenu />
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

            <h1>Produtos</h1>
            <input
                type="text"
                placeholder="Pesquisar produtos..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
            />
            <ul className="produtos-list">
                {filteredProdutos.length > 0 ? filteredProdutos.map((produto, index) => (
                    <li key={index} className="produto-item">
                        <h2>{produto.nome}</h2>
                        <p>Preço: {produto.preco}</p>
                        <p>{produto.descricao}</p>
                        {produto.imagemUrl && <img src={produto.imagemUrl} alt={produto.nome} />} <br />
                        <button onClick={() => handleRemoveProduto(produto.id)} className="remove-button">Remover</button>
                    </li>
                )) : <p>Nenhum produto encontrado</p>}
            </ul>
        </div>
    );
}

export default Produtos;