import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase.js';
import '../styles/GraficoBarbearia.css';

const GraficoBarbearia = () => {
    const [chartData, setChartData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCortesPorDia = async () => {
            const cortesPorDiaCollection = await db.collection('cortesPorDia').get();
            const data = cortesPorDiaCollection.docs.map(doc => ({
                date: doc.id,
                Cortes: doc.data().count
            }));
            // Ordenar os dados por data
            data.sort((a, b) => new Date(a.date) - new Date(b.date));
            // Pegar os últimos 7 dias
            setChartData(data.slice(-7));
        };

        fetchCortesPorDia();
    }, []);

    return (
        <div className="grafico-barbearia">
            <h1>Cortes Marcados nos Últimos 7 Dias</h1>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Cortes" fill="#82ca9d" />
                </BarChart>
            </ResponsiveContainer>
            <button className="back-button" onClick={() => navigate('/homeProfissional')}>Voltar</button>
        </div>
    );
};

export default GraficoBarbearia;
