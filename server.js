const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 3205;
const statusWhats = '346,342,348,345,341,347,427';
const cors = require('cors');


// Configurações
const CONFIG = {
  TOKEN: 'd50f7a0e-2b04-47b7-8f8a-e9f5d8284b14',
  COMPANY_ID: '301',
  API_URL: 'https://sistema.liguetalk.com.br/index.php/API_control/sales_report_v1',
};

app.use(cors());

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

// Exemplo de uso:
const dataOriginal = "2025-04-10 21:14:27-03";
const dataSemHora = extrairData(dataOriginal);
console.log(dataSemHora); // Retorna um objeto Date representando 2025-04-10 00:00:00 no fuso local

  // Rota para total de vendas por produto
  app.get('/relatorio-vendas-marco', async (req, res) => {
    try {
      const params = new URLSearchParams({
        company_id: CONFIG.COMPANY_ID,
        status: '261,265,266',
        start_date: req.query.start_date || '2025-03-01',
        end_date: req.query.end_date || '2025-03-31'
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
      let vendas = data.data;
  
      let produtos = vendas.map(e => ({
        produto: e.vnp_nome || '',
        vendedor: e.usr_nome || '',
        status: e.vns_nome,
        total_Vendas_geradas: 1,
        total_Vendas_Habilitadas: e.vns_nome === 'HABILITADO' ? 1 : 0,
        data_cadastro: extrairData(e.vnd_data_cadastro),
        data_instalacao: extrairData(e.vnd_data_instalacao),
        valor: formatarParaReal(e.vnp_valor)
      }));
  
      res.json(produtos);
  
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados',
        error: error.message
      });
    }
  });
  
  app.get('/relatorio-vendas-abril', async (req, res) => {
    try {
      const params = new URLSearchParams({
        company_id: CONFIG.COMPANY_ID,
        status: '261,265,266',
        start_date: req.query.start_date || '2025-03-01',
        end_date: req.query.end_date || '2025-05-30'
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
      const vendas = data.data;

      let produtos = vendas.map(e => ({
        cliente: e.vnd_cli_nome,
        produto: e.vnp_nome || '',
        vendedor: e.usr_nome || '',
        status: e.vns_nome,
        total_Vendas_geradas: 1,
        total_Vendas_Habilitadas: e.vns_nome === 'HABILITADO' ? 1 : 0,
        total_Vendas_Canceladas: e.vns_nome === 'CANCELADO' ? 1 : 0,
        total_Vendas_Aguandando: e.vns_nome === 'AGUARDANDO HABILITAÇÃO' ? 1 : 0,
        data_cadastro: extrairData(e.vnd_data_cadastro),
        data_instalacao: extrairData(e.vnd_data_instalacao),
        valor: formatarParaReal(e.vnp_valor),
        data_agenda: extrairData(e.vnd_data_agenda) || '0000-00-00'
      }));
  
      res.json(produtos);
  
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados',
        error: error.message
      });
    }
  });
  
  
  
  app.get('/relatorio-vendas-maio', async (req, res) => {
    try {
      const params = new URLSearchParams({
        company_id: CONFIG.COMPANY_ID,
        status: '261,265,266',
        start_date: req.query.start_date || '2025-05-01',
        end_date: req.query.end_date || '2025-05-31'
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
      let vendas = data.data;
  
      let produtos = vendas.map(e => ({
        produto: e.vnp_nome || '',
        vendedor: e.usr_nome || '',
        status: e.vns_nome,
        total_Vendas_geradas: 1,
        total_Vendas_Habilitadas: e.vns_nome === 'HABILITADO' ? 1 : 0,
        data_cadastro: extrairData(e.vnd_data_cadastro),
        data_instalacao: extrairData(e.vnd_data_instalacao),
        valor: formatarParaReal(e.vnp_valor)
      }));
  
      res.json(produtos);
  
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados',
        error: error.message
      });
    }
  });
  
  app.get('/relatorio-vendas-junho', async (req, res) => {
    try {
      const params = new URLSearchParams({
        company_id: CONFIG.COMPANY_ID,
        status: '261,265,266',
        start_date: req.query.start_date || '2025-06-01',
        end_date: req.query.end_date || '2025-06-30'
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
      let vendas = data.data;
  
      let produtos = vendas.map(e => ({
        produto: e.vnp_nome || '',
        vendedor: e.usr_nome || '',
        status: e.vns_nome,
        total_Vendas_geradas: 1,
        total_Vendas_Habilitadas: e.vns_nome === 'HABILITADO' ? 1 : 0,
        data_cadastro: extrairData(e.vnd_data_cadastro),
        data_instalacao: extrairData(e.vnd_data_instalacao),
        valor: formatarParaReal(e.vnp_valor)
      }));
  
      res.json(produtos);
  
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados',
        error: error.message
      });
    }
  });
  
  app.get('/relatorio-vendas-julho', async (req, res) => {
    try {
      const params = new URLSearchParams({
        company_id: CONFIG.COMPANY_ID,
        status: '261,265,266',
        start_date: req.query.start_date || '2025-07-01',
        end_date: req.query.end_date || '2025-07-31'
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
      let vendas = data.data;
  
      let produtos = vendas.map(e => ({
        produto: e.vnp_nome || '',
        vendedor: e.usr_nome || '',
        status: e.vns_nome,
        total_Vendas_geradas: 1,
        total_Vendas_Habilitadas: e.vns_nome === 'HABILITADO' ? 1 : 0,
        data_cadastro: extrairData(e.vnd_data_cadastro),
        data_instalacao: extrairData(e.vnd_data_instalacao),
        valor: formatarParaReal(e.vnp_valor)
      }));
  
      res.json(produtos);
  
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados',
        error: error.message
      });
    }
  });
  
  app.get('/relatorio-vendas-agosto', async (req, res) => {
    try {
      const params = new URLSearchParams({
        company_id: CONFIG.COMPANY_ID,
        status: '261,265,266',
        start_date: req.query.start_date || '2025-08-01',
        end_date: req.query.end_date || '2025-08-31'
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
      let vendas = data.data;
  
      let produtos = vendas.map(e => ({
        produto: e.vnp_nome || '',
        vendedor: e.usr_nome || '',
        status: e.vns_nome,
        total_Vendas_geradas: 1,
        total_Vendas_Habilitadas: e.vns_nome === 'HABILITADO' ? 1 : 0,
        data_cadastro: extrairData(e.vnd_data_cadastro),
        data_instalacao: extrairData(e.vnd_data_instalacao),
        valor: formatarParaReal(e.vnp_valor)
      }));
  
      res.json(produtos);
  
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados',
        error: error.message
      });
    }
  });
  app.get('/relatorio-vendas-setembro', async (req, res) => {
    try {
      const params = new URLSearchParams({
        company_id: CONFIG.COMPANY_ID,
        status: '261,265,266',
        start_date: req.query.start_date || '2025-09-01',
        end_date: req.query.end_date || '2025-09-30'
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
      let vendas = data.data;
  
      let produtos = vendas.map(e => ({
        produto: e.vnp_nome || '',
        vendedor: e.usr_nome || '',
        status: e.vns_nome,
        total_Vendas_geradas: 1,
        total_Vendas_Habilitadas: e.vns_nome === 'HABILITADO' ? 1 : 0,
        data_cadastro: extrairData(e.vnd_data_cadastro),
        data_instalacao: extrairData(e.vnd_data_instalacao),
        valor: formatarParaReal(e.vnp_valor)
      }));
  
      res.json(produtos);
  
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados',
        error: error.message
      });
    }
  });
  
  app.get('/relatorio-vendas-outubro', async (req, res) => {
    try {
      const params = new URLSearchParams({
        company_id: CONFIG.COMPANY_ID,
        status: '261,265,266',
        start_date: req.query.start_date || '2025-10-01',
        end_date: req.query.end_date || '2025-10-31'
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
      let vendas = data.data;
  
      let produtos = vendas.map(e => ({
        produto: e.vnp_nome || '',
        vendedor: e.usr_nome || '',
        status: e.vns_nome,
        total_Vendas_geradas: 1,
        total_Vendas_Habilitadas: e.vns_nome === 'HABILITADO' ? 1 : 0,
        data_cadastro: extrairData(e.vnd_data_cadastro),
        data_instalacao: extrairData(e.vnd_data_instalacao),
        valor: formatarParaReal(e.vnp_valor)
      }));
  
      res.json(produtos);
  
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados',
        error: error.message
      });
    }
  });
  
  app.get('/relatorio-vendas-novembro', async (req, res) => {
    try {
      const params = new URLSearchParams({
        company_id: CONFIG.COMPANY_ID,
        status: '261,265,266',
        start_date: req.query.start_date || '2025-11-01',
        end_date: req.query.end_date || '2025-11-30'
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
      let vendas = data.data;
  
      let produtos = vendas.map(e => ({
        produto: e.vnp_nome || '',
        vendedor: e.usr_nome || '',
        status: e.vns_nome,
        total_Vendas_geradas: 1,
        total_Vendas_Habilitadas: e.vns_nome === 'HABILITADO' ? 1 : 0,
        data_cadastro: extrairData(e.vnd_data_cadastro),
        data_instalacao: extrairData(e.vnd_data_instalacao),
        valor: formatarParaReal(e.vnp_valor)
      }));
  
      res.json(produtos);
  
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados',
        error: error.message
      });
    }
  });
  
  app.get('/relatorio-vendas-dezembro', async (req, res) => {
    try {
      const params = new URLSearchParams({
        company_id: CONFIG.COMPANY_ID,
        status: '261,265,266',
        start_date: req.query.start_date || '2025-12-01',
        end_date: req.query.end_date || '2025-12-31'
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
      let vendas = data.data;
  
      let produtos = vendas.map(e => ({
        produto: e.vnp_nome || '',
        vendedor: e.usr_nome || '',
        status: e.vns_nome,
        total_Vendas_geradas: 1,
        total_Vendas_Habilitadas: e.vns_nome === 'HABILITADO' ? 1 : 0,
        data_cadastro: extrairData(e.vnd_data_cadastro),
        data_instalacao: extrairData(e.vnd_data_instalacao),
        valor: formatarParaReal(e.vnp_valor)
      }));
  
      res.json(produtos);
  
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados',
        error: error.message
      });
    }
  });
  // relatorio Whatsapp


  app.get('/relatorio-whatsapp-marco', async (req, res) => {
    try {
      const params = new URLSearchParams({
        company_id: CONFIG.COMPANY_ID,
        start_date: req.query.start_date || '2025-03-01',
        end_date: req.query.end_date || '2025-03-31',
        status: statusWhats
      });
  
      const response = await fetch(`https://sistema.liguetalk.com.br/index.php/API_control/whatsapp_report_v1?${params.toString()}`, {
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
      let vendas = data.data;
  
      let produtos = vendas.map(e => ({
        vendedor: e.usr_nome || '',
        total_leads: 1,
        primeiro_contato: extrairData(e.wtd_data_primeiro_contato)
      }));
  
      res.json(produtos);
  
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados',
        error: error.message
      });
    }
  });

  app.get('/relatorio-whatsapp-abril', async (req, res) => {
    try {
      const params = new URLSearchParams({
        company_id: CONFIG.COMPANY_ID,
        start_date: req.query.start_date || '2025-04-01',
        end_date: req.query.end_date || '2025-04-30',
        status: statusWhats
      });
  
      const response = await fetch(`https://sistema.liguetalk.com.br/index.php/API_control/whatsapp_report_v1?${params.toString()}`, {
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
      let vendas = data.data;
  
      let produtos = vendas.map(e => ({
        vendedor: e.usr_nome || '',
        total_leads: 1,
        primeiro_contato:extrairData(e.wtd_data_primeiro_contato),
        status:e.wtm_monitoracao
      }));
  
      res.json(produtos);
  
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados',
        error: error.message
      });
    }
  });
  app.get('/relatorio-whatsapp-maio', async (req, res) => {
    try {
      const params = new URLSearchParams({
        company_id: CONFIG.COMPANY_ID,
        start_date: req.query.start_date || '2025-05-01',
        end_date: req.query.end_date || '2025-05-31',
        status: statusWhats
      });
  
      const response = await fetch(`https://sistema.liguetalk.com.br/index.php/API_control/whatsapp_report_v1?${params.toString()}`, {
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
      let vendas = data.data;
  
      let produtos = vendas.map(e => ({
        vendedor: e.usr_nome || '',
        total_leads: 1,
        primeiro_contato: extrairData(e.wtd_data_primeiro_contato)
      }));
  
      res.json(produtos);
  
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados',
        error: error.message
      });
    }
  });
  app.get('/relatorio-whatsapp-junho', async (req, res) => {
    try {
      const params = new URLSearchParams({
        company_id: CONFIG.COMPANY_ID,
        start_date: req.query.start_date || '2025-06-01',
        end_date: req.query.end_date || '2025-06-30',
        status: statusWhats
      });
  
      const response = await fetch(`https://sistema.liguetalk.com.br/index.php/API_control/whatsapp_report_v1?${params.toString()}`, {
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
      let vendas = data.data;
  
      let produtos = vendas.map(e => ({
        vendedor: e.usr_nome || '',
        total_leads: 1,
        primeiro_contato: extrairData(e.wtd_data_primeiro_contato)
      }));
  
      res.json(produtos);
  
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados',
        error: error.message
      });
    }
  });
  app.get('/relatorio-whatsapp-julho', async (req, res) => {
    try {
      const params = new URLSearchParams({
        company_id: CONFIG.COMPANY_ID,
        start_date: req.query.start_date || '2025-07-01',
        end_date: req.query.end_date || '2025-07-31',
        status: statusWhats
      });
  
      const response = await fetch(`https://sistema.liguetalk.com.br/index.php/API_control/whatsapp_report_v1?${params.toString()}`, {
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
      let vendas = data.data;
  
      let produtos = vendas.map(e => ({
        vendedor: e.usr_nome || '',
        total_leads: 1,
        primeiro_contato: extrairData(e.wtd_data_primeiro_contato)
      }));
  
      res.json(produtos);
  
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados',
        error: error.message
      });
    }
  });
  app.get('/relatorio-whatsapp-agosto', async (req, res) => {
    try {
      const params = new URLSearchParams({
        company_id: CONFIG.COMPANY_ID,
        start_date: req.query.start_date || '2025-08-01',
        end_date: req.query.end_date || '2025-08-31',
        status: statusWhats
      });
  
      const response = await fetch(`https://sistema.liguetalk.com.br/index.php/API_control/whatsapp_report_v1?${params.toString()}`, {
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
      let vendas = data.data;
  
      let produtos = vendas.map(e => ({
        vendedor: e.usr_nome || '',
        total_leads: 1,
        primeiro_contato: extrairData(e.wtd_data_primeiro_contato)
      }));
  
      res.json(produtos);
  
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados',
        error: error.message
      });
    }
  });
  app.get('/relatorio-whatsapp-setembro', async (req, res) => {
    try {
      const params = new URLSearchParams({
        company_id: CONFIG.COMPANY_ID,
        start_date: req.query.start_date || '2025-09-01',
        end_date: req.query.end_date || '2025-09-30',
        status: statusWhats
      });
  
      const response = await fetch(`https://sistema.liguetalk.com.br/index.php/API_control/whatsapp_report_v1?${params.toString()}`, {
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
      let vendas = data.data;
  
      let produtos = vendas.map(e => ({
        vendedor: e.usr_nome || '',
        total_leads: 1,
        primeiro_contato: extrairData(e.wtd_data_primeiro_contato)
      }));
  
      res.json(produtos);
  
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados',
        error: error.message
      });
    }
  });
  app.get('/relatorio-whatsapp-outubro', async (req, res) => {
    try {
      const params = new URLSearchParams({
        company_id: CONFIG.COMPANY_ID,
        start_date: req.query.start_date || '2025-10-01',
        end_date: req.query.end_date || '2025-10-31',
        status: statusWhats
      });
  
      const response = await fetch(`https://sistema.liguetalk.com.br/index.php/API_control/whatsapp_report_v1?${params.toString()}`, {
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
      let vendas = data.data;
  
      let produtos = vendas.map(e => ({
        vendedor: e.usr_nome || '',
        total_leads: 1,
        primeiro_contato: extrairData(e.wtd_data_primeiro_contato)
      }));
  
      res.json(produtos);
  
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados',
        error: error.message
      });
    }
  });
  app.get('/relatorio-whatsapp-novembro', async (req, res) => {
    try {
      const params = new URLSearchParams({
        company_id: CONFIG.COMPANY_ID,
        start_date: req.query.start_date || '2025-11-01',
        end_date: req.query.end_date || '2025-11-30',
        status: statusWhats
      });
  
      const response = await fetch(`https://sistema.liguetalk.com.br/index.php/API_control/whatsapp_report_v1?${params.toString()}`, {
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
      let vendas = data.data;
  
      let produtos = vendas.map(e => ({
        vendedor: e.usr_nome || '',
        total_leads: 1,
        primeiro_contato: extrairData(e.wtd_data_primeiro_contato)
      }));
  
      res.json(produtos);
  
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados',
        error: error.message
      });
    }
  });
  app.get('/relatorio-whatsapp-dezembro', async (req, res) => {
    try {
      const params = new URLSearchParams({
        company_id: CONFIG.COMPANY_ID,
        start_date: req.query.start_date || '2025-12-01',
        end_date: req.query.end_date || '2025-12-31',
        status: statusWhats
      });
  
      const response = await fetch(`https://sistema.liguetalk.com.br/index.php/API_control/whatsapp_report_v1?${params.toString()}`, {
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
      let vendas = data.data;
  
      let produtos = vendas.map(e => ({
        vendedor: e.usr_nome || '',
        total_leads: 1,
        primeiro_contato: extrairData(e.wtd_data_primeiro_contato)
      }));
  
      res.json(produtos);
  
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados',
        error: error.message
      });
    }
  });
// Rota raiz
app.get('/', (req, res) => {
  res.send(`
    <h1>API de Relatórios Liguetalk</h1>

<p>Acesse os relatórios mensais diretamente pelos links abaixo:</p>

<p><a href="/relatorio-vendas-marco">/relatorio-vendas-marco</a>  
<br></p>

<p><a href="/relatorio-vendas-abril">/relatorio-vendas-abril</a>  
<br></p>

<p><a href="/relatorio-vendas-maio">/relatorio-vendas-maio</a>  
<br></p>

<p><a href="/relatorio-vendas-junho">/relatorio-vendas-junho</a>  
<br></p>

<p><a href="/relatorio-vendas-julho">/relatorio-vendas-julho</a>  
<br></p>

<p><a href="/relatorio-vendas-agosto">/relatorio-vendas-agosto</a>  
<br></p>

<p><a href="/relatorio-vendas-setembro">/relatorio-vendas-setembro</a>  
<br></p>

<p><a href="/relatorio-vendas-outubro">/relatorio-vendas-outubro</a>  
<br></p>

<p><a href="/relatorio-vendas-novembro">/relatorio-vendas-novembro</a>  
<br></p>

<p><a href="/relatorio-vendas-dezembro">/relatorio-vendas-dezembro</a>  
<br></p>


<h1>API de Relatórios WhatsApp - Liguetalk</h1>

<p>Acesse os relatórios mensais diretamente pelos links abaixo:</p>

<p><a href="/relatorio-whatsapp-marco">/relatorio-whatsapp-marco</a>  
<br></p>

<p><a href="/relatorio-whatsapp-abril">/relatorio-whatsapp-abril</a>  
<br></p>

<p><a href="/relatorio-whatsapp-maio">/relatorio-whatsapp-maio</a>  
<br></p>

<p><a href="/relatorio-whatsapp-junho">/relatorio-whatsapp-junho</a>  
<br></p>

<p><a href="/relatorio-whatsapp-julho">/relatorio-whatsapp-julho</a>  
<br></p>

<p><a href="/relatorio-whatsapp-agosto">/relatorio-whatsapp-agosto</a>  
<br></p>

<p><a href="/relatorio-whatsapp-setembro">/relatorio-whatsapp-setembro</a>  
<br></p>

<p><a href="/relatorio-whatsapp-outubro">/relatorio-whatsapp-outubro</a>  
<br></p>

<p><a href="/relatorio-whatsapp-novembro">/relatorio-whatsapp-novembro</a>  
<br></p>

<p><a href="/relatorio-whatsapp-dezembro">/relatorio-whatsapp-dezembro</a>  
<br></p>

  `);
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});