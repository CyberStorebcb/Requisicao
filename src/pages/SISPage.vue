<template>
  <q-page class="sis-bg" padding>
    <div class="q-pa-md flex flex-center">
      <div class="sis-container">
        <h4 class="sis-title text-h4 q-mb-lg">
          SIS - AVISOS <span class="sis-dropbox">(Dropbox)</span>
        </h4>
        <q-card class="sis-card">
          <q-card-section>
            <div class="sis-section-title text-subtitle1 q-mb-md">
              Registros da aba <b>AVISOS</b> da planilha Dropbox
            </div>
            <div class="row q-gutter-md q-mb-md sis-filtros-row">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="search"
                  label="Pesquisar"
                  dense
                  clearable
                  debounce="300"
                  @update:model-value="aplicarFiltro"
                  class="sis-filtro-input"
                  color="primary"
                  outlined
                  rounded
                  placeholder="Digite para buscar..."
                  prefix-icon="search"
                />
              </div>
              <div v-for="col in filterableColumns" :key="col.name" class="col-12 col-md-2">
                <q-select
                  v-model="filtros[col.name]"
                  :options="opcoesFiltro(col.name)"
                  :label="col.label"
                  dense
                  clearable
                  use-input
                  input-debounce="0"
                  @update:model-value="aplicarFiltro"
                  emit-value
                  map-options
                  new-value-mode="add"
                  class="sis-filtro-select"
                  color="primary"
                  outlined
                  rounded
                  placeholder="Filtrar..."
                />
              </div>
            </div>
            <div v-if="errorMsg" class="text-negative q-mb-md">{{ errorMsg }}</div>
            <q-table
              v-else
              :rows="registrosFiltrados"
              :columns="columns"
              row-key="__rowNum__"
              flat
              bordered
              :loading="loading"
              wrap-cells
              class="sis-table"
              color="primary"
            >
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const registros = ref([])
const loading = ref(false)
const columns = ref([])
const errorMsg = ref('')
const search = ref('')
const filtros = ref({})

const filterableColumns = computed(() => {
  // Apenas as colunas CP e PROGAMADO
  return columns.value.filter((col) => ['CP', 'PROGAMADO'].includes(col.name.toUpperCase()))
})

const registrosFiltrados = computed(() => {
  let rows = [...registros.value]
  // Filtro de pesquisa geral
  if (search.value) {
    const s = search.value.toLowerCase()
    rows = rows.filter((row) => {
      return columns.value.some((col) => {
        let val = row[col.name]
        if (col.format) {
          val = col.format(val)
        }
        return String(val).toLowerCase().includes(s)
      })
    })
  }
  // Filtros por coluna
  for (const key in filtros.value) {
    if (filtros.value[key]) {
      const col = columns.value.find((c) => c.name === key)
      rows = rows.filter((row) => {
        let val = row[key]
        if (col && col.format) {
          val = col.format(val)
        }
        return String(val) === String(filtros.value[key])
      })
    }
  }
  // Ordena por ordem decrescente da primeira coluna
  if (columns.value.length > 0) {
    const col = columns.value[0]
    rows.sort((a, b) => {
      let va = a[col.name]
      let vb = b[col.name]
      // Se for data, compara como data
      if (col.format) {
        va = col.format(va)
        vb = col.format(vb)
        // Tenta converter para data real
        const da = parseDateBR(va)
        const db = parseDateBR(vb)
        if (da && db) {
          return db - da
        }
      }
      // Se for número
      if (!isNaN(va) && !isNaN(vb)) {
        return Number(vb) - Number(va)
      }
      // String
      return String(vb).localeCompare(String(va))
    })
  }
  return rows
})

// Função auxiliar para converter dd/MM/yyyy em Date
function parseDateBR(str) {
  if (typeof str !== 'string') return null
  const [d, m, y] = str.split('/')
  if (!d || !m || !y) return null
  return new Date(Number(y), Number(m) - 1, Number(d))
}

function opcoesFiltro(colName) {
  const set = new Set(
    registros.value.map((row) => row[colName]).filter((v) => v != null && v !== ''),
  )
  return Array.from(set)
    .sort()
    .map((v) => ({ label: String(v), value: v }))
}

function aplicarFiltro() {
  // Computed já faz o filtro, função serve para trigger do debounce
}

async function carregarRegistros() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await fetch('http://localhost:3000/api/avisos')
    const data = await res.json()
    if (!Array.isArray(data)) {
      errorMsg.value = data.error || 'Erro ao carregar dados da planilha.'
      registros.value = []
      columns.value = []
      return
    }
    registros.value = data
    // Gera colunas dinamicamente a partir dos campos da primeira linha
    if (data.length > 0) {
      // Limita as colunas até "LEVANTADOR"
      const allKeys = Object.keys(data[0])
      const lastCol = 'LEVANTADOR'
      let limitedKeys = allKeys
      if (allKeys.includes(lastCol)) {
        const idx = allKeys.indexOf(lastCol)
        limitedKeys = allKeys.slice(0, idx + 1)
      }
      columns.value = limitedKeys.map((key) => {
        // Formata datas para colunas específicas
        let formatFn = undefined
        if (key.toUpperCase() === 'PRAZO P/ANEXAR') {
          formatFn = (val) => {
            if (!val) return ''
            // Se for número, converte de dias Excel para data
            if (!isNaN(val) && typeof val !== 'object') {
              const base = new Date(Date.UTC(1899, 11, 30))
              const d = new Date(base.getTime() + (Number(val) + 1) * 86400000)
              return d.toLocaleDateString('pt-BR')
            }
            // Se for string de data, tenta converter
            const d = new Date(val)
            if (!isNaN(d)) {
              return d.toLocaleDateString('pt-BR')
            }
            return val
          }
        } else if (key.toUpperCase() === 'AVISADO') {
          // Mantém a lógica para AVISADO se necessário
          formatFn = (val) => {
            if (!val) return ''
            if (!isNaN(val) && typeof val !== 'object') {
              const base = new Date(Date.UTC(1899, 11, 30))
              const d = new Date(base.getTime() + (Number(val) + 1) * 86400000)
              return d.toLocaleDateString('pt-BR')
            }
            const d = new Date(val)
            if (!isNaN(d)) {
              return d.toLocaleDateString('pt-BR')
            }
            return val
          }
        } else if (key.toUpperCase() === 'PROGAMADO') {
          // Mantém a lógica anterior para PROGAMADO
          formatFn = (val) => {
            if (!val) return ''
            if (!isNaN(val) && typeof val !== 'object') {
              const base = new Date(Date.UTC(1899, 11, 30))
              const d = new Date(base.getTime() + (Number(val) + 1) * 86400000)
              return d.toLocaleDateString('pt-BR')
            }
            const d = new Date(val)
            if (!isNaN(d)) {
              return d.toLocaleDateString('pt-BR')
            }
            return val
          }
        }
        return {
          name: key,
          label: key.toUpperCase(),
          field: key,
          align: 'left',
          sortable: true,
          format: formatFn,
        }
      })
    }
  } catch {
    errorMsg.value = 'Erro ao carregar dados da planilha.'
    registros.value = []
    columns.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  carregarRegistros()
})
</script>

<style scoped>
.sis-bg {
  background: linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%);
  min-height: 100vh;
}
.sis-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}
.sis-title {
  color: #1976d2;
  letter-spacing: 1px;
  font-weight: 700;
  text-shadow: 0 2px 8px #e3f2fd;
}
.sis-dropbox {
  color: #1ec218;
  font-weight: 400;
}
.sis-card {
  border-radius: 18px;
  box-shadow:
    0 4px 24px 0 rgba(25, 118, 210, 0.1),
    0 1.5px 6px 0 rgba(194, 24, 91, 0.08);
  border: 1px solid #e3f2fd;
}
.sis-section-title {
  color: #333;
  font-weight: 500;
  letter-spacing: 0.5px;
}
.sis-filtros-row {
  background: #1bd615;
  border-radius: 12px;
  padding: 12px 8px 4px 8px;
  box-shadow: 0 1px 4px 0 #fce4ec;
}
.sis-filtro-input,
.sis-filtro-select {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px 0 #e3f2fd;
}
.sis-table {
  background: #fff;
  border-radius: 10px;
  font-size: 15px;
  box-shadow: 0 2px 8px 0 #e3f2fd;
}
.sis-table thead tr th {
  background: #1976d2;
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}
.sis-table tbody tr {
  transition: background 0.2s;
}
.sis-table tbody tr:hover {
  background: #e3f2fd;
}
</style>
