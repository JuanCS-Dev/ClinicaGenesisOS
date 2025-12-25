#!/bin/bash
# ============================================================================
# AUDITORIA DE MOCKS - Zero Tolerance Policy
# ============================================================================
# Clínica Genesis OS
# Este script detecta padrões de mock disfarçados no código.
# Execução: ./scripts/audit-mocks.sh
# ============================================================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          AUDITORIA DE MOCKS - ClinicaGenesisOS                 ║"
echo "║                  Zero Tolerance Policy                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

cd "$(dirname "$0")/.."

FOUND_ISSUES=0
WARNINGS=0

# Helper function para reportar
report_check() {
  local title="$1"
  local result="$2"
  local count="$3"

  if [ -n "$result" ]; then
    echo -e "${RED}❌ FALHOU${NC} - $count encontrado(s)"
    echo "$result" | head -20
    if [ "$count" -gt 20 ]; then
      echo -e "${YELLOW}   ... e mais $(($count - 20)) ocorrências${NC}"
    fi
    FOUND_ISSUES=$((FOUND_ISSUES + count))
  else
    echo -e "${GREEN}✅ PASSOU${NC}"
  fi
}

report_warning() {
  local title="$1"
  local result="$2"
  local count="$3"

  if [ -n "$result" ]; then
    echo -e "${YELLOW}⚠️  AVISO${NC} - $count encontrado(s)"
    echo "$result" | head -10
    WARNINGS=$((WARNINGS + count))
  else
    echo -e "${GREEN}✅ PASSOU${NC}"
  fi
}

# ============================================================================
# CHECK 1: Variáveis MOCK_* explícitas
# ============================================================================
echo -e "\n${BLUE}[1/9]${NC} Verificando variáveis MOCK_* explícitas..."
MOCKS=$(grep -rn "MOCK_\|mock_\|Mock_" src/pages src/components --include="*.tsx" --include="*.ts" 2>/dev/null || true)
MOCK_COUNT=$(echo "$MOCKS" | grep -c . 2>/dev/null || echo "0")
report_check "Variáveis MOCK_*" "$MOCKS" "$MOCK_COUNT"

# ============================================================================
# CHECK 2: Arrays hardcoded que parecem dados
# ============================================================================
echo -e "\n${BLUE}[2/9]${NC} Verificando arrays hardcoded suspeitos..."
HARDCODED=$(grep -rn "const.*=.*\[{.*id:" src/pages --include="*.tsx" 2>/dev/null | grep -v "node_modules\|\.test\.\|// " || true)
HARDCODED_COUNT=$(echo "$HARDCODED" | grep -c . 2>/dev/null || echo "0")
report_check "Arrays hardcoded" "$HARDCODED" "$HARDCODED_COUNT"

# ============================================================================
# CHECK 3: onClick handlers vazios
# ============================================================================
echo -e "\n${BLUE}[3/9]${NC} Verificando onClick handlers vazios..."
EMPTY_HANDLER=$(grep -rn "onClick={() => {}}\|onClick={()=>{}}" src/pages src/components --include="*.tsx" 2>/dev/null || true)
EMPTY_COUNT=$(echo "$EMPTY_HANDLER" | grep -c . 2>/dev/null || echo "0")
report_check "onClick vazios" "$EMPTY_HANDLER" "$EMPTY_COUNT"

# ============================================================================
# CHECK 4: Handlers que só fazem console.log (exceto error/warn)
# ============================================================================
echo -e "\n${BLUE}[4/9]${NC} Verificando handlers com apenas console.log..."
CONSOLE_ONLY=$(grep -rn "=> {$" src/pages --include="*.tsx" -A1 2>/dev/null | grep -E "console\.log\(" | grep -v "error\|warn\|Error\|catch" || true)
CONSOLE_COUNT=$(echo "$CONSOLE_ONLY" | grep -c . 2>/dev/null || echo "0")
report_check "Console-only handlers" "$CONSOLE_ONLY" "$CONSOLE_COUNT"

# ============================================================================
# CHECK 5: Dados fake com nomes comuns (brasileiro)
# ============================================================================
echo -e "\n${BLUE}[5/9]${NC} Verificando nomes/dados fake comuns..."
FAKE_DATA=$(grep -rn "João Silva\|Maria Santos\|Pedro Oliveira\|José Maria\|Ana Paula\|Carlos Eduardo" src/pages src/components --include="*.tsx" 2>/dev/null | grep -v "placeholder\|// \|test\|spec" || true)
FAKE_COUNT=$(echo "$FAKE_DATA" | grep -c . 2>/dev/null || echo "0")
report_check "Nomes fake" "$FAKE_DATA" "$FAKE_COUNT"

# ============================================================================
# CHECK 6: Emails/Telefones fake
# ============================================================================
echo -e "\n${BLUE}[6/9]${NC} Verificando emails/telefones fake..."
# Exclude: placeholders, comments, tests, JSDoc lines (starting with *)
FAKE_CONTACT=$(grep -rn "example@\|test@\|123456789\|11999999\|(11) 9" src/pages src/components --include="*.tsx" 2>/dev/null | grep -v "placeholder\|// \|\.test\.\|\.spec\." | grep -v " \* " || true)
CONTACT_COUNT=$(echo "$FAKE_CONTACT" | grep -c . 2>/dev/null || echo "0")
report_check "Contatos fake" "$FAKE_CONTACT" "$CONTACT_COUNT"

# ============================================================================
# CHECK 7: Datas hardcoded (2024-*, 2025-*)
# ============================================================================
echo -e "\n${BLUE}[7/9]${NC} Verificando datas hardcoded..."
HARDCODED_DATES=$(grep -rn "'2024-\|\"2024-\|'2025-\|\"2025-" src/pages --include="*.tsx" 2>/dev/null | grep -v "// \|format\|parse\|placeholder\|example" || true)
DATE_COUNT=$(echo "$HARDCODED_DATES" | grep -c . 2>/dev/null || echo "0")
report_check "Datas hardcoded" "$HARDCODED_DATES" "$DATE_COUNT"

# ============================================================================
# CHECK 8: TODO/FIXME/HACK placeholders (Warning only)
# ============================================================================
echo -e "\n${BLUE}[8/9]${NC} Verificando placeholders TODO/FIXME/HACK..."
PLACEHOLDERS=$(grep -rn "// TODO\|// FIXME\|// HACK\|// XXX" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "node_modules" || true)
PLACEHOLDER_COUNT=$(echo "$PLACEHOLDERS" | grep -c . 2>/dev/null || echo "0")
report_warning "Placeholders" "$PLACEHOLDERS" "$PLACEHOLDER_COUNT"

# ============================================================================
# CHECK 9: Imports de arquivos mock
# ============================================================================
echo -e "\n${BLUE}[9/9]${NC} Verificando imports de arquivos mock..."
MOCK_IMPORTS=$(grep -rn "from.*mock\|import.*mock\|from.*fake\|import.*fake" src/pages src/components --include="*.tsx" --include="*.ts" 2>/dev/null | grep -iv "jest\|test\|spec\|vitest" || true)
IMPORT_COUNT=$(echo "$MOCK_IMPORTS" | grep -c . 2>/dev/null || echo "0")
report_check "Mock imports" "$MOCK_IMPORTS" "$IMPORT_COUNT"

# ============================================================================
# RESUMO
# ============================================================================
echo -e "\n${BLUE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                        RESULTADO                               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

if [ $FOUND_ISSUES -eq 0 ]; then
  echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  ✅ AUDITORIA PASSOU - Zero mocks encontrados!                 ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
  if [ $WARNINGS -gt 0 ]; then
    echo -e "\n${YELLOW}⚠️  $WARNINGS avisos (não bloqueantes)${NC}"
    echo "   Considere resolver os TODO/FIXME/HACK quando possível."
  fi
  exit 0
else
  echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║  ❌ AUDITORIA FALHOU - $FOUND_ISSUES problemas encontrados               ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "   Corrija todos os itens acima antes de fazer deploy."
  echo "   Execute 'npm run audit:mocks' para re-verificar."
  exit 1
fi
