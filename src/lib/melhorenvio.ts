// Melhor Envio API Integration
// Documentação: https://docs.melhorenvio.com.br/reference/introducao-api-melhor-envio

const MELHOR_ENVIO_API = 'https://api.melhorenvio.com.br';
const TOKEN = import.meta.env.VITE_MELHOR_ENVIO_TOKEN || '';

// Tipos para a API do Melhor Envio
export type ShippingService = 'sedex' | 'pac' | 'jadlog-conventional' | 'jadlog-cargo';

export type ShippingQuote = {
  id: string;
  name: string;
  price: number;
  deadline: number;
  weight?: number;
  format?: string;
  insurance_value: number;
  includes: string[];
  logo: string;
};

export type ShippingAddress = {
  zipcode: string;
  state: string;
  city: string;
  address: string;
  number: string;
  complement?: string;
  reference?: string;
};

export type ShippingData = {
  from?: ShippingAddress;
  to: ShippingAddress;
  products: {
    id: string;
    width: number;
    height: number;
    length: number;
    weight: number;
    quantity: number;
    insurance_value: number;
    description: string;
  }[];
};

// Headers padrão para as requisições
const getHeaders = () => ({
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TOKEN}`,
  'User-Agent': 'RT-PRATAS (contato@rtratas.com.br)',
});

/**
 * Calcula o frete para diferentes transportadoras
 * @param shippingData Dados de origem, destino e produtos
 * @returns Array com opções de frete disponíveis
 */
export async function calculateShipping(shippingData: ShippingData): Promise<ShippingQuote[]> {
  try {
    console.log('🚚 Iniciando cálculo de frete...');
    console.log('📦 Dados enviados:', JSON.stringify(shippingData, null, 2));
    console.log('🔑 Token:', TOKEN ? '✓ Configurado' : '✗ Não configurado');

    const response = await fetch(`${MELHOR_ENVIO_API}/shipment/calculate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(shippingData),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', response.headers);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Erro da API:', error);
      throw new Error(`Erro ao calcular frete: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Resposta da API:', JSON.stringify(data, null, 2));

    if (!data || data.length === 0) {
      console.warn('⚠️ API retornou array vazio');
      return [];
    }

    // Formatar resposta para o padrão esperado
    interface QuoteResponse {
      id: string;
      name: string;
      price: string | number;
      deadline: string | number;
      weight?: number;
      insurance_value?: string | number;
      includes?: string[];
      logo?: string;
    }
    
    const quotes = (data as QuoteResponse[]).map((quote) => ({
      id: quote.id,
      name: quote.name,
      price: typeof quote.price === 'string' ? parseFloat(quote.price) : quote.price || 0,
      deadline: typeof quote.deadline === 'string' ? parseInt(quote.deadline) : quote.deadline || 0,
      weight: quote.weight,
      insurance_value: quote.insurance_value 
        ? typeof quote.insurance_value === 'string' 
          ? parseFloat(quote.insurance_value) 
          : quote.insurance_value 
        : 0,
      includes: quote.includes || [],
      logo: quote.logo || '',
    }));

    console.log('✅ Quotes formatadas:', quotes);
    return quotes;
  } catch (error) {
    console.error('❌ Erro ao calcular frete:', error);
    console.error('📋 Stack:', error instanceof Error ? error.stack : '');
    throw error;
  }
}

/**
 * Cria um envio no Melhor Envio
 * @param shipmentData Dados do envio
 * @returns ID do envio criado
 */
export async function createShipment(shipmentData: {
  to: ShippingAddress;
  products: {
    id: string;
    weight: number;
    height: number;
    width: number;
    length: number;
    insurance_value: number;
    quantity: number;
  }[];
  service: number;
  receipt: boolean;
  own_hand: boolean;
  non_commercial: boolean;
  invoice: {
    key: string;
  };
  tags?: {
    tag: string;
    url: string;
  }[];
}) {
  try {
    const response = await fetch(`${MELHOR_ENVIO_API}/shipment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(shipmentData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Erro ao criar envio:', error);
      throw new Error(`Erro ao criar envio: ${error.message}`);
    }

    const data = await response.json();
    console.log('Envio criado:', data);
    return data;
  } catch (error) {
    console.error('Erro ao criar envio:', error);
    throw error;
  }
}

/**
 * Gera etiqueta de envio (label)
 * @param shipmentId ID do envio
 * @returns URL da etiqueta em PDF
 */
export async function generateLabel(shipmentId: string): Promise<string> {
  try {
    const response = await fetch(`${MELHOR_ENVIO_API}/shipment/${shipmentId}/generate`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Erro ao gerar etiqueta:', error);
      throw new Error(`Erro ao gerar etiqueta: ${error.message}`);
    }

    const data = await response.json();
    console.log('Etiqueta gerada:', data);
    return data.label; // URL da etiqueta
  } catch (error) {
    console.error('Erro ao gerar etiqueta:', error);
    throw error;
  }
}

/**
 * Rastreia um envio
 * @param trackingCode Código de rastreamento
 * @returns Informações de rastreamento
 */
export async function trackShipment(trackingCode: string) {
  try {
    const response = await fetch(`${MELHOR_ENVIO_API}/shipment/tracking`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        objects: [trackingCode],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Erro ao rastrear envio:', error);
      throw new Error(`Erro ao rastrear envio: ${error.message}`);
    }

    const data = await response.json();
    console.log('Informações de rastreamento:', data);
    return data;
  } catch (error) {
    console.error('Erro ao rastrear envio:', error);
    throw error;
  }
}

/**
 * Obtém informações de um envio
 * @param shipmentId ID do envio
 * @returns Informações do envio
 */
export async function getShipmentInfo(shipmentId: string) {
  try {
    const response = await fetch(`${MELHOR_ENVIO_API}/shipment/${shipmentId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Erro ao obter informações do envio:', error);
      throw new Error(`Erro ao obter informações do envio: ${error.message}`);
    }

    const data = await response.json();
    console.log('Informações do envio:', data);
    return data;
  } catch (error) {
    console.error('Erro ao obter informações do envio:', error);
    throw error;
  }
}

/**
 * Obtém as informações da conta e saldo
 * @returns Informações da conta
 */
export async function getAccountInfo() {
  try {
    const response = await fetch(`${MELHOR_ENVIO_API}/me`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Erro ao obter informações da conta:', error);
      throw new Error(`Erro ao obter informações da conta: ${error.message}`);
    }

    const data = await response.json();
    console.log('Informações da conta:', data);
    return data;
  } catch (error) {
    console.error('Erro ao obter informações da conta:', error);
    throw error;
  }
}
