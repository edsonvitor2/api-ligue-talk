const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 3205;
const statusWhats = '346,342,348,345,341,347,427';

// Configurações
const CONFIG = {
  TOKEN: 'd50f7a0e-2b04-47b7-8f8a-e9f5d8284b14',
  COMPANY_ID: '301',
  API_URL: 'https://sistema.liguetalk.com.br/index.php/API_control/sales_report_v1',
};

// Middleware para CORS (em desenvolvimento)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

function formatarParaReal(valorEmCentavos) {
  const valorEmReais = Number(valorEmCentavos) / 100;

  // Formata para o padrão brasileiro, depois remove "R$" e troca vírgula por ponto
  return valorEmReais
    .toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    .replace(',', '.')
    .replace(/\s?R\$\s?/, '');
}

function extrairData(dataString) {
  if (!dataString || typeof dataString !== 'string') {
    return null;
  }

  // Remove o offset de fuso horário se existir
  const dataSemOffset = dataString.replace(/(\d{2}:\d{2}:\d{2})-\d{2}/, '$1');
  
  const data = new Date(dataSemOffset);
  
  if (isNaN(data.getTime())) {
    return null;
  }

  // Retorna no formato que o Looker Studio reconhece como Date
  return new Date(
    Date.UTC(
      data.getFullYear(),
      data.getMonth(),
      data.getDate()
    )
  ).toISOString().split('T')[0];
}

app.get('/relatorio-vendas-maio', async (req, res) => {
    try {
        // Validação das datas
        const startDate = req.query.start_date ? validateDate(req.query.start_date) : '2025-05-01';
        const endDate = req.query.end_date ? validateDate(req.query.end_date) : '2025-05-31';
        
        // Verifica se a data final é maior que a inicial
        if (new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({
                success: false,
                message: 'Data final não pode ser anterior à data inicial'
            });
        }

        const params = new URLSearchParams({
            company_id: CONFIG.COMPANY_ID,
            status: '261,265,266',
            start_date: startDate,
            end_date: endDate
        });

        const response = await fetch(`${CONFIG.API_URL}?${params.toString()}`, {
            method: 'GET',
            headers: {
                'X-LTK-VND': CONFIG.TOKEN,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status} - ${await response.text()}`);
        }

        const data = await response.json();
        let vendas = data.data || []; // Garante array mesmo se data for undefined

        let produtos = vendas.map(e => ({
            produto: e.vnp_nome || 'Não informado',
            vendedor: e.usr_nome || 'Não informado',
            status: e.vns_nome || 'SEM STATUS',
            total_Vendas_geradas: 1,
            total_Vendas_Habilitadas: e.vns_nome === 'HABILITADO' ? 1 : 0,
            data_cadastro: extrairData(e.vnd_data_cadastro),
            data_instalacao: extrairData(e.vnd_data_instalacao),
            valor: (e.vnp_valor / 100).toFixed(2) || '0.00' // Converte para decimal e formata
        }));

        res.json({
            success: true,
            data: produtos,
            periodo: {
                start_date: startDate,
                end_date: endDate
            },
            metadata: {
                total_vendas: produtos.length,
                vendas_habilitadas: produtos.filter(p => p.status === 'HABILITADO').length
            }
        });

    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar dados',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Função auxiliar para validar datas (formato YYYY-MM-DD)
function validateDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) {
        throw new Error(`Formato de data inválido. Use YYYY-MM-DD`);
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        throw new Error('Data inválida');
    }
    
    return dateString; // Retorna no formato correto se válida
}

// Função auxiliar para formatar datas (ajuste conforme sua necessidade)
function extrairData(dataOriginal) {
    if (!dataOriginal) return 'Não informado';
    // Implemente sua lógica existente de formatação aqui
    return dataOriginal; // Exemplo simplificado
}

// Função auxiliar para formatar moeda (ajuste conforme sua necessidade)
function formatarParaReal(valor) {
    if (isNaN(parseFloat(valor))) return 'R$ 0,00';
    // Implemente sua lógica existente de formatação aqui
    console.log()
    return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
}
  
// Rota raiz
app.get('/', (req, res) => {
  res.send(`
    <h1>API de Relatórios Liguetalk</h1>
  `);
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});