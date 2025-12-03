// Script para testar a API do Melhor Envio diretamente
const token = 'B425XUxX89AjuHaFDzWUavTQuykpyEsoDHfbhgFz';

const testData = {
  to: {
    zipcode: '01311100',
    state: 'SP',
    city: 'São Paulo',
    address: 'Avenida Paulista',
    number: '1000',
    complement: '',
  },
  products: [
    {
      id: '1',
      width: 15,
      height: 10,
      length: 20,
      weight: 0.5,
      quantity: 1,
      insurance_value: 100,
      description: 'Produto teste',
    },
  ],
};

console.log('🧪 Testando API do Melhor Envio...\n');
console.log('📍 Dados a enviar:', JSON.stringify(testData, null, 2));
console.log('\n');

fetch('https://api.melhorenvio.com.br/shipment/calculate', {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'User-Agent': 'RT-PRATAS (contato@rtratas.com.br)',
  },
  body: JSON.stringify(testData),
})
  .then((response) => {
    console.log('✅ Response status:', response.status);
    console.log('📋 Response headers:', {
      'Content-Type': response.headers.get('Content-Type'),
      'Content-Length': response.headers.get('Content-Length'),
    });
    return response.json();
  })
  .then((data) => {
    console.log('\n✅ Resposta da API:');
    console.log(JSON.stringify(data, null, 2));

    if (Array.isArray(data) && data.length > 0) {
      console.log('\n✅ Sucesso! Opções de frete disponíveis:');
      data.forEach((option) => {
        console.log(`  - ${option.name}: R$ ${option.price}`);
      });
    } else {
      console.log('\n⚠️ Nenhuma opção de frete retornada');
    }
  })
  .catch((error) => {
    console.error('\n❌ Erro ao fazer requisição:');
    console.error(error.message);
    console.error(error.stack);
  });
