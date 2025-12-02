# Integração Melhor Envio - RT PRATAS

## 📦 O que foi implementado

✅ **Cálculo de frete em tempo real** - Integração com API v3 do Melhor Envio
✅ **Componentes React** - ShippingCalculator para seleção de transportadoras
✅ **Rastreamento de pedidos** - OrderTracking com histórico
✅ **Hook customizado** - useShippingCalculation para gerenciar estado
✅ **Migrações SQL** - Tabelas para armazenar dados de envio
✅ **Suporte múltiplas transportadoras** - Sedex, PAC, Jadlog, etc

---

## 🚀 Setup Inicial

### Credenciais Fornecidas

```
Contract ID: 7607
Token: B425XUxX89AjuHaFDzWUavTQuykpyEsoDHfbhgFz
```

### Configurar Variáveis de Ambiente

Adicione ao arquivo `.env.local` ou nas variáveis de ambiente do Vercel:

```
VITE_MELHOR_ENVIO_TOKEN=B425XUxX89AjuHaFDzWUavTQuykpyEsoDHfbhgFz
VITE_MELHOR_ENVIO_CONTRACT=7607
```

### Executar Migrações do Banco

Execute as duas novas migrações no Supabase:

1. **20251208_add_images_column.sql** - Adiciona coluna de imagens (já feito)
2. **20251209_add_melhor_envio_shipping.sql** - Adiciona rastreamento

As migrações criam:
- Coluna `melhor_envio_id` na tabela `orders`
- Coluna `tracking_code` na tabela `orders`
- Coluna `shipping_carrier` na tabela `orders`
- Coluna `shipping_cost` na tabela `orders`
- Coluna `shipping_deadline` na tabela `orders`
- Coluna `estimated_delivery_date` na tabela `orders`
- Tabela `shipping_logs` para histórico de rastreamento

---

## 📁 Arquivos Criados

### 1. **lib/melhorenvio.ts**
Funções para integração com API do Melhor Envio:
- `calculateShipping()` - Calcula opções de frete
- `createShipment()` - Cria envio
- `generateLabel()` - Gera etiqueta PDF
- `trackShipment()` - Rastreia pedido
- `getShipmentInfo()` - Info do envio
- `getAccountInfo()` - Info da conta

### 2. **components/ShippingCalculator.tsx**
Componente visual para cálculo e seleção de frete.

Uso:
```tsx
<ShippingCalculator
  zipCode={formData.zip_code}
  cartItems={cart}
  onShippingSelected={(option, cost) => {
    setShippingCost(cost);
    setSelectedShipping(option);
  }}
  onLoading={(loading) => setCalculatingShipping(loading)}
/>
```

### 3. **components/OrderTracking.tsx**
Componente para exibir rastreamento de pedidos.

Uso:
```tsx
<OrderTracking orderId={orderId} />
```

### 4. **hooks/useShippingCalculation.ts**
Hook customizado para gerenciar cálculo de frete.

Uso:
```tsx
const { loading, error, shippingOptions, calculateShipping } = useShippingCalculation();
const options = await calculateShipping(zipCode, cartItems);
```

---

## 🛒 Como Integrar ao Checkout

### Passo 1: Importar Componente

```tsx
import ShippingCalculator from '@/components/ShippingCalculator';
```

### Passo 2: Adicionar ao Formulário de Endereço

```tsx
export default function CheckoutStep1() {
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);

  return (
    <div>
      {/* Campos de endereço */}
      <input 
        type="text" 
        placeholder="CEP" 
        value={formData.zip_code}
        onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
      />
      
      {/* Calculador de frete */}
      <ShippingCalculator
        zipCode={formData.zip_code}
        cartItems={cart}
        onShippingSelected={(option, cost) => {
          setSelectedShipping(option);
          setShippingCost(cost);
        }}
      />
    </div>
  );
}
```

### Passo 3: Exibir Frete no Resumo

```tsx
<div className="p-4 bg-gray-50 rounded-xl">
  <h3 className="font-bold">Resumo do Pedido</h3>
  <p>Subtotal: R$ {subtotal.toLocaleString('pt-BR')}</p>
  {selectedShipping && (
    <p>Frete ({selectedShipping.name}): R$ {selectedShipping.price.toLocaleString('pt-BR')}</p>
  )}
  <p className="font-bold text-lg">
    Total: R$ {(subtotal + (selectedShipping?.price || 0)).toLocaleString('pt-BR')}
  </p>
</div>
```

### Passo 4: Criar Envio ao Confirmar Pedido

```tsx
import { createShipment, generateLabel } from '@/lib/melhorenvio';

const handleConfirmOrder = async () => {
  try {
    // 1. Criar shipment no Melhor Envio
    const shipment = await createShipment({
      to: {
        zipcode: formData.zip_code.replace(/\D/g, ''),
        state: formData.state,
        city: formData.city,
        address: formData.address,
        number: formData.number,
        complement: formData.complement,
      },
      products: cart.map(item => ({
        id: item.product.id,
        weight: item.product.weight || 0.1,
        height: item.product.height || 10,
        width: item.product.width || 10,
        length: item.product.length || 10,
        insurance_value: item.product.price * item.quantity,
        quantity: item.quantity,
      })),
      service: parseInt(selectedShipping.id),
      receipt: false,
      own_hand: false,
      non_commercial: false,
      invoice: { key: invoiceKey },
    });

    // 2. Gerar label (etiqueta de envio)
    const label = await generateLabel(shipment.id);
    console.log('Etiqueta gerada:', label);

    // 3. Salvar no banco de dados
    await supabase.from('orders').insert([{
      customer_id: customerId,
      total_amount: subtotal + selectedShipping.price,
      melhor_envio_id: shipment.id,
      tracking_code: shipment.tracking,
      shipping_carrier: selectedShipping.name,
      shipping_cost: selectedShipping.price,
      shipping_deadline: selectedShipping.deadline,
      estimated_delivery_date: new Date(
        Date.now() + selectedShipping.deadline * 24 * 60 * 60 * 1000
      ).toISOString().split('T')[0],
      status: 'pending',
      payment_method: 'pix', // ou credit_card
      zip_code: formData.zip_code,
      city: formData.city,
      state: formData.state,
    }]);

  } catch (error) {
    console.error('Erro ao confirmar pedido:', error);
  }
};
```

### Passo 5: Exibir Rastreamento na Conta do Cliente

```tsx
import OrderTracking from '@/components/OrderTracking';

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div>
      {orders.map(order => (
        <div key={order.id} className="mb-8 p-6 border rounded-lg">
          <h3>Pedido #{order.id.slice(0, 8).toUpperCase()}</h3>
          <OrderTracking orderId={order.id} />
        </div>
      ))}
    </div>
  );
}
```

---

## 📦 Dimensões Obrigatórias dos Produtos

Para cálculo correto de frete, cada produto precisa ter:

| Campo | Mínimo | Máximo | Padrão |
|-------|--------|--------|--------|
| weight (kg) | 0.01 | 30 | 0.1 |
| height (cm) | 2 | 200 | 10 |
| width (cm) | 11 | 200 | 10 |
| length (cm) | 16 | 200 | 10 |

Exemplo para pulseira:
```json
{
  "weight": 0.05,
  "height": 2,
  "width": 10,
  "length": 5
}
```

---

## 🧪 Testando a Integração

### Verificar Credenciais
```tsx
import { getAccountInfo } from '@/lib/melhorenvio';

try {
  const info = await getAccountInfo();
  console.log('Saldo:', info.balance);
  console.log('Conta válida ✅');
} catch (error) {
  console.error('Erro de autenticação ❌', error);
}
```

### Testar Cálculo de Frete
```tsx
import { calculateShipping } from '@/lib/melhorenvio';

const quotes = await calculateShipping({
  to: {
    zipcode: '01310100', // São Paulo
    state: 'SP',
    city: 'São Paulo',
    address: 'Avenida Paulista',
    number: '1000'
  },
  products: [{
    id: '1',
    width: 11,
    height: 16,
    length: 2,
    weight: 0.3,
    quantity: 1,
    insurance_value: 100,
    description: 'Produto teste'
  }]
});

console.log('Opções de frete:', quotes);
```

---

## 🚨 Troubleshooting

### "Could not authenticate"
- ✅ Verificar token: `B425XUxX89AjuHaFDzWUavTQuykpyEsoDHfbhgFz`
- ✅ Verificar se está em `.env.local` e no Vercel
- ✅ Regenerar token no painel Melhor Envio se necessário

### "Nenhuma opção de entrega"
- ✅ Verificar se CEP é válido
- ✅ Verificar dimensões do produto (mínimos acima)
- ✅ Tentar outro CEP
- ✅ Verificar se conta tem saldo

### "CEP inválido"
- ✅ Deve ter 8 dígitos
- ✅ Usar apenas números
- ✅ Pode usar hífen (será removido)

### "Erro ao gerar etiqueta"
- ✅ Aguardar alguns segundos após criar shipment
- ✅ Verificar se shipment foi criado com sucesso
- ✅ Confirmar dados da nota fiscal

---

## 🔗 Referências
