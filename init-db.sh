#!/bin/bash

# Script para inicializar o banco de dados do Supabase
# Execute: bash init-db.sh

echo "🔧 Inicializando banco de dados do Supabase..."

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não está instalado"
    echo "Instale com: npm install -g supabase"
    exit 1
fi

# Linkar projeto (se não estiver linkado)
echo "🔗 Linkando projeto..."
supabase link --project-ref lfbwxyzqdklfvuzzkctn

# Fazer push das migrations
echo "📤 Fazendo push das migrations..."
supabase db push

echo "✅ Banco de dados inicializado com sucesso!"
echo "Você agora pode criar produtos na dashboard!"
