import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from '../firebase.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import '../styles/LoginCadastroUsuario.css';

const LoginProfissional = () => {
    const [containerLogar, setContainerLogar] = useState(true);
    const navigate = useNavigate();

    const criarConta = (e) => {
        e.preventDefault();

        let email = document.getElementById("email-cadastro").value;
        let password = document.getElementById("password-cadastro").value;
        let confirmPassword = document.getElementById("confirm-password-cadastro").value;
        let userName = document.getElementById("userName-cadastro").value;
        let enderecoBarbearia = document.getElementById("endereco-barbearia").value;

        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem!");
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then((authUser) => {
                toast.success("Conta criada com Sucesso!");
                authUser.user.updateProfile({
                    displayName: userName
                }).then(() => {
                    db.collection('profissionais').doc(authUser.user.uid).set({
                        userName: userName,
                        email: email,
                        enderecoBarbearia: enderecoBarbearia
                    });
                    navigate('/homeProfissional');
                });
            }).catch((error) => toast.error('Erro ao criar uma conta: ' + error.message));
    }

    const logar = (e) => {
        e.preventDefault();

        let email = document.getElementById("email-login").value;
        let password = document.getElementById("password-login").value;

        auth.signInWithEmailAndPassword(email, password)
            .then(async (authUser) => {
                const userUid = authUser.user.uid;

                // Verificar se o usuário está na coleção 'profissionais'
                const userDoc = await db.collection('profissionais').doc(userUid).get();
                if (userDoc.exists) {
                    toast.success('Logado com Sucesso!');
                    navigate('/homeProfissional');
                } else {
                    // Se não estiver na coleção 'profissionais', verificar na coleção 'clientes'
                    const clientDoc = await db.collection('clientes').doc(userUid).get();
                    if (clientDoc.exists) {
                        toast.error('Essa conta é de cliente');
                        auth.signOut();
                    } else {
                        toast.error('Conta não encontrada');
                        auth.signOut();
                    }
                }
            }).catch((error) => toast.error('Erro ao logar: ' + error.message));
    }

    return (
        <div className="App">
            <div className="main">
                {containerLogar ?
                    <div className="main-container-login">
                        <h2 style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Sistema Barbearia - Profissional
                        </h2>
                        <input type="email" placeholder="User@gmail.com" id="email-login" />
                        <input type="password" id="password-login" placeholder="Senha" />
                        <button onClick={logar}>Iniciar Sessão</button>
                        <p>Não tem uma Conta? <span onClick={() => setContainerLogar(!containerLogar)}>Registrar-se</span></p>
                    </div>
                    :
                    <div className="main-container-registro">
                        <h2 style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Sistema Barbearia - Profissional
                        </h2>
                        <input type="email" placeholder="User@gmail.com" id="email-cadastro" />
                        <input type="password" id="password-cadastro" placeholder="Senha" />
                        <input type="password" id="confirm-password-cadastro" placeholder="Confirmar Senha" />
                        <input type="text" id="userName-cadastro" placeholder="Nome de sua barbearia" />
                        <input type="text" id="endereco-barbearia" placeholder="Endereço de sua barbearia" />
                        <button onClick={criarConta}>Registrar-se</button>
                        <p>Já tem uma Conta? <span onClick={() => setContainerLogar(!containerLogar)}>Logar-se</span></p>
                    </div>
                }
            </div>
            <ToastContainer />
        </div>
    )
}

export default LoginProfissional;
