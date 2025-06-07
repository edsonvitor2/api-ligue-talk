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
        const { start_date, end_date } = req.query;

        // Define as datas padrão se não forem informadas
        const startDate = start_date || '2025-05-01';
        const endDate = end_date || '2025-05-31';
        
        // Verifica se a data final é maior que a inicial
        if (new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({
                success: false,
                message: 'Data final não pode ser anterior à data inicial'
            });
        }

        console.log(startDate,endDate)

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

// Adicione esta nova rota após a rota '/relatorio-vendas-maio'
// server.js (ou app.js, dependendo do nome do seu arquivo)
app.get('/relatorio-meta-ads', async (req, res) => {
    try {
        // Configurações iniciais
        const accessToken = 'EAARKZCmz27gABO56dE23gs36QL3bUDmxV4s4s9ZCRv4qF7A4QdS20yQdeYc0wYweJV3pmvSNjsByPhWpJS2jgFVpqX7uELtWWqKgrkgcYnkL9KheNRwJRsIMQM8ZCYDKFyYmCx4ZAqzZAidA0ZBOK7fXwgdAh8GNRv22VxaWbvsOZCcWPwxZC36QDji65ZC0qqamrHgZDZD';
        const baseUrl = `https://graph.facebook.com/v22.0/act_1536376777207697/insights`;
        
        const params = new URLSearchParams({
            time_increment: '1',
            time_range: JSON.stringify({ since: '2025-04-01', until: '2025-06-30' }),
            level: 'campaign',
            fields: 'campaign_name,impressions,inline_link_clicks,cpc,ctr,spend,actions.action_type(messaging_conversation_started)',
            access_token: accessToken,
            limit: '250' // Aumentar o limite por página para reduzir paginação
        });

        let allCampaigns = [];
        let nextUrl = `${baseUrl}?${params.toString()}`;

        // Loop para lidar com paginação
        while (nextUrl) {
            const response = await fetch(nextUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Erro na API do Meta: ${response.status} - ${await response.text()}`);
            }

            const data = await response.json();
            allCampaigns = allCampaigns.concat(data.data || []);

            // Verificar se há mais páginas
            nextUrl = data.paging?.next || null;
            
            // Pequena pausa para evitar rate limiting
            if (nextUrl) await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Processar os dados
        const relatorio = allCampaigns.map(campaign => {
            const actions = Array.isArray(campaign.actions) ? campaign.actions : [];

            const leadsAction = actions.find(action =>
                action.action_type === 'onsite_conversion.messaging_conversation_started_7d' ||
                action.action_type === 'onsite_conversion.total_messaging_connection'
            );

            const leads = leadsAction ? parseInt(leadsAction.value) : 0;
            const spend = parseFloat(campaign.spend || '0');

            return {
                investimento: spend.toFixed(2),
                cliques: parseInt(campaign.inline_link_clicks || '0'),
                custo_clique: parseFloat(campaign.cpc || '0').toFixed(4),
                leads,
                custo_lead: leads > 0 ? (spend / leads).toFixed(2) : '0.00',
                campanha: campaign.campaign_name || 'Sem Nome',
                ctr: parseFloat(campaign.ctr || '0').toFixed(2),
                data_inicio: campaign.date_start,
                data_fim: campaign.date_stop
            };
        });

        res.json({
            success: true,
            data: relatorio,
            periodo: {
                start_date: '2025-04-01',
                end_date: '2025-06-30'
            },
            metadata: {
                total_campanhas: relatorio.length,
                total_investido: relatorio.reduce((sum, item) => sum + parseFloat(item.investimento), 0).toFixed(2),
                total_leads: relatorio.reduce((sum, item) => sum + item.leads, 0)
            }
        });

    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar dados do Meta Ads',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});