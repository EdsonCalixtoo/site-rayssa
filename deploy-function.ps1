#!/usr/bin/env pwsh
# Script para fazer deploy da Edge Function via API do Supabase

$projectId = "ncxpxtzsqutzheqgpfpo"
$functionName = "calculate-shipping"
$supabaseUrl = "https://app.supabase.com"

# Seu token de acesso pessoal do Supabase
# Pegue em: https://app.supabase.com/account/tokens
$accessToken = Read-Host "Cole seu Personal Access Token do Supabase"

if ([string]::IsNullOrEmpty($accessToken)) {
    Write-Host "❌ Token não fornecido" -ForegroundColor Red
    exit 1
}

# Ler conteúdo da função
$functionContent = Get-Content -Path "supabase\functions\calculate-shipping\index.ts" -Raw

Write-Host "📤 Fazendo deploy da Edge Function..." -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
}

$body = @{
    "slug" = $functionName
    "body" = $functionContent
} | ConvertTo-Json

# Fazer request ao Supabase
try {
    $response = Invoke-RestMethod `
        -Uri "$supabaseUrl/api/v1/projects/$projectId/functions/$functionName" `
        -Method PATCH `
        -Headers $headers `
        -Body $body

    Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host $response | ConvertTo-Json
}
catch {
    Write-Host "❌ Erro no deploy:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}
