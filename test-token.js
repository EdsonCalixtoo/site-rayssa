// Teste simples para validar qual token funciona
const testToken = async (token, name) => {
  console.log(`\n🔄 Testando ${name}...`);
  console.log('Token:', token.substring(0, 30) + '...');
  
  try {
    const response = await fetch('https://api.melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'RT-PRATAS (contato@rtratas.com.br)',
      },
      body: JSON.stringify({
        from: {
          postal_code: "96020360"
        },
        to: {
          postal_code: "01018020"
        },
        products: [
          {
            id: "1",
            width: 15,
            height: 10,
            length: 20,
            weight: 0.5,
            quantity: 1,
            insurance_value: 100,
            description: "Test Product"
          }
        ]
      })
    });

    console.log(`✅ Status: ${response.status}`);
    
    if (!response.ok) {
      const error = await response.json();
      console.log(`❌ Erro:`, error);
    } else {
      const data = await response.json();
      console.log(`✅ Sucesso! Retornou ${Array.isArray(data) ? data.length : 0} carriers`);
      if (Array.isArray(data) && data.length > 0) {
        console.log(`   Primeiro carrier: ${data[0].name} - R$ ${data[0].price}`);
      }
    }
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
  }
};

// Testes
const oldToken = 'B425XUxX89AjuHaFDzWUavTQuykpyEsoDHfbhgFz';
const jwtToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NTYiLCJqdGkiOiI5ZmMyZDA1ZTA0MWMzOGM1MmM3ODZmYzcwODk1NjVmMDFmMzc3OTE3OTkxN2FmYjM1OTY0NTI1ZjBmMWJhZWRkMTZjYzRhZWNmNjFlMWZhZSIsImlhdCI6MTc2NDcyMDc0OS4wNDcxMTIsIm5iZiI6MTc2NDcyMDc0OS4wNDcxMTUsImV4cCI6MTc5NjI1Njc0OS4wMzk3NzMsInN1YiI6ImEwN2ZlZGZiLWEyN2QtNDI2OC05YmU5LTQ5ZDc2YzA0YzBiMCIsInNjb3BlcyI6WyJjYXJ0LXJlYWQiLCJjYXJ0LXdyaXRlIiwiY29tcGFuaWVzLXJlYWQiLCJjb21wYW5pZXMtd3JpdGUiLCJjb3Vwb25zLXJlYWQiLCJjb3Vwb25zLXdyaXRlIiwibm90aWZpY2F0aW9ucy1yZWFkIiwib3JkZXJzLXJlYWQiLCJwcm9kdWN0cy1yZWFkIiwicHJvZHVjdHMtZGVzdHJveSIsInByb2R1Y3RzLXdyaXRlIiwicHVyY2hhc2VzLXJlYWQiLCJzaGlwcGluZy1jYWxjdWxhdGUiLCJzaGlwcGluZy1jYW5jZWwiLCJzaGlwcGluZy1jaGVja291dCIsInNoaXBwaW5nLWNvbXBhbmllcyIsInNoaXBwaW5nLWdlbmVyYXRlIiwic2hpcHBpbmctcHJldmlldyIsInNoaXBwaW5nLXByaW50Iiwic2hpcHBpbmctc2hhcmUiLCJzaGlwcGluZy10cmFja2luZyIsImVjb21tZXJjZS1zaGlwcGluZyIsInRyYW5zYWN0aW9ucy1yZWFkIiwidXNlcnMtcmVhZCIsInVzZXJzLXdyaXRlIiwid2ViaG9va3MtcmVhZCIsIndlYmhvb2tzLXdyaXRlIiwid2ViaG9va3MtZGVsZXRlIiwidGRlYWxlci13ZWJob29rIl19.KQ_AWsNWbu5l5HWv1Yu50Dvr2w8FGtsXsJZ6TApfRGXuR5shP5G3bVZ3xZq71QKuI0PJ-zpeeRuw-7GT1RQGgW81AKzdsJHX25MeasFylSqGVjsU8DNuatCLNwFpQMxkvlD54Y3u-IU0xcjHQ5OGhSzZs-Rhp6Yz4jrn8QYVTtrBsQkUoBSg4m3yo55bc7jyQB5LjddKm-5SLF-3fL5NWu6KQoOdJk3_XFN4vabkaxT6diaMGIu195p8miW3HQ-odqWn2no165GQUV8xEug_6wHuFSaqw4rDUw7j6kCGp0tGTIUTiZkni2bFY5NW8lLwfBm4AHsEgGYalmoGTRVkCs-cUGBM75MY8i7zhbydTE_NUYFaXq9foj04HWbqcNxujApdUYUoaj2OxHt9PlHVKpZ7kI9Re6aN_-F4J-PcJo4Gjif79Wv_FXZHCLj4yz4GZLNMRyCjvVnUaJG-_XLxdRLM7p8jhxyKoJATtZ5uM46ujkjq3hFkhvXgiv9tFCYQgTXgN7quw3jQzXAq-dXVBZ3WXZhhcaWYzt-O0yZJ9WUNO2u0uZx9Wt-7PtHBBbj1bGSXdX0bJIOg7NaOgfZoYlfULFJ_CV2AA10LnCXLjNoRnlXHquRCpu1cvAh25-ZcW-vLNeWUGEu_PYOpB6EXfpwVbYv71oy-Yr_FXgT4mXk';

(async () => {
  await testToken(oldToken, 'Token Antigo');
  await testToken(jwtToken, 'JWT Token');
})();
