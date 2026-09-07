import express from 'express';
import userRoutes from './routes/userRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import questionRoutes from './routes/questionRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API do Gerador de Provas funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

const api = express.Router();

api.get('/status', (req, res) => {
  res.status(200).json({ status: 'ok', version: '1.0.0' });
});

api.use('/users', userRoutes);
api.use('/subjects', subjectRoutes);
api.use('/questions', questionRoutes);

app.use(api);
app.use('/api/v1', api);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota ${req.method} ${req.originalUrl} não encontrada`,
  });
});

// Rede de segurança: qualquer erro não tratado explicitamente (ex: falha de
// conexão com o banco) cai aqui, é logado no servidor e nunca é exposto ao
// cliente com detalhes internos.
// Express só reconhece middleware de erro se a função tiver exatamente
// 4 parâmetros, mesmo sem usar 'next' — por isso a exceção de lint abaixo.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});