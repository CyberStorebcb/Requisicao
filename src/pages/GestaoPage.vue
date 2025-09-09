<template>
  <q-page padding>
    <div class="q-pa-md" style="max-width: 1200px; margin: 0 auto">
      <h4 class="text-h4 q-mb-lg text-center">Gestão de Requisições</h4>

      <!-- Estatísticas Gerais -->
      <div class="row q-gutter-md q-mb-lg">
        <div class="col-12 col-md-3">
          <q-card class="text-center">
            <q-card-section>
              <q-icon name="assignment" size="2rem" color="primary" />
              <div class="text-h6 q-mt-sm">{{ totalRequisicoes }}</div>
              <div class="text-subtitle2 text-grey-7">Total de Requisições</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card class="text-center">
            <q-card-section>
              <q-icon name="people" size="2rem" color="secondary" />
              <div class="text-h6 q-mt-sm">{{ totalSolicitantes }}</div>
              <div class="text-subtitle2 text-grey-7">Solicitantes</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card class="text-center">
            <q-card-section>
              <q-icon name="inventory" size="2rem" color="positive" />
              <div class="text-h6 q-mt-sm">{{ totalMateriais }}</div>
              <div class="text-subtitle2 text-grey-7">Materiais Solicitados</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card class="text-center">
            <q-card-section>
              <q-icon name="today" size="2rem" color="warning" />
              <div class="text-h6 q-mt-sm">{{ requisicoesHoje }}</div>
              <div class="text-subtitle2 text-grey-7">Requisições Hoje</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Ranking de Solicitantes -->
      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="row items-center q-gutter-sm">
            <q-icon name="leaderboard" size="1.5rem" color="primary" />
            <div class="text-h6">Ranking de Solicitantes</div>
            <q-space />
            <q-btn
              @click="refreshData"
              icon="refresh"
              label="Atualizar"
              color="primary"
              outline
              :loading="loading"
            />
          </div>
        </q-card-section>
        <q-card-section>
          <q-table
            :rows="rankingData"
            :columns="rankingColumns"
            row-key="id"
            :loading="loading"
            :pagination="{ rowsPerPage: 10 }"
          >
            <template v-slot:body-cell-posicao="props">
              <q-td :props="props">
                <q-badge
                  :color="getBadgeColor(props.row.posicao)"
                  :label="props.row.posicao + 'º'"
                  class="q-pa-sm"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-nome="props">
              <q-td :props="props">
                <div class="text-weight-medium">{{ props.row.nome }}</div>
              </q-td>
            </template>

            <template v-slot:body-cell-acoes="props">
              <q-td :props="props">
                <q-btn
                  @click="verDetalhes(props.row)"
                  icon="visibility"
                  label="Ver Detalhes"
                  color="primary"
                  flat
                  dense
                />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <!-- Requisições Recentes -->
      <q-card>
        <q-card-section>
          <div class="row items-center q-gutter-sm">
            <q-icon name="schedule" size="1.5rem" color="secondary" />
            <div class="text-h6">Requisições Recentes</div>
          </div>
        </q-card-section>
        <q-card-section>
          <q-table
            :rows="requisicoesRecentes"
            :columns="requisicoesColumns"
            row-key="id"
            :pagination="{ rowsPerPage: 5 }"
          >
            <template v-slot:body-cell-data_requisicao="props">
              <q-td :props="props">
                <div v-if="props.row.data_requisicao">
                  {{ formatDateColumn(props.row.data_requisicao) }}
                </div>
                <div v-else class="text-grey-6">
                  {{ formatDateColumn(props.row.created_at) }}
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-created_at="props">
              <q-td :props="props">
                {{ formatDateColumn(props.row.created_at) }}
              </q-td>
            </template>

            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-badge :color="getStatusColor(props.row.status)" :label="props.row.status" />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <!-- Modal de Detalhes -->
      <q-dialog v-model="showModal">
        <q-card style="min-width: 500px">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Detalhes - {{ selectedUser?.nome }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section v-if="selectedUser">
            <div class="q-mb-md">
              <strong>Posição no Ranking:</strong> {{ selectedUser.posicao }}º lugar
            </div>
            <div class="q-mb-md">
              <strong>Total de Requisições:</strong> {{ selectedUser.total_requisicoes }}
            </div>
            <div class="q-mb-md">
              <strong>Total de Materiais:</strong> {{ selectedUser.total_materiais || 0 }}
            </div>
            <div class="q-mb-md">
              <strong>Última Requisição:</strong>
              {{ new Date(selectedUser.ultima_requisicao).toLocaleDateString('pt-BR') }}
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '../services/api'

const $q = useQuasar()

const loading = ref(false)
const showModal = ref(false)
const selectedUser = ref(null)
const rankingData = ref([])
const requisicoesRecentes = ref([])

const rankingColumns = [
  { name: 'posicao', label: 'Posição', field: 'posicao', align: 'center' },
  { name: 'nome_solicitante', label: 'Nome', field: 'nome_solicitante', align: 'left' },
  {
    name: 'total_requisicoes',
    label: 'Total Requisições',
    field: 'total_requisicoes',
    align: 'center',
  },
  { name: 'total_materiais', label: 'Total Materiais', field: 'total_materiais', align: 'center' },
  {
    name: 'ultima_requisicao',
    label: 'Última Requisição',
    field: 'ultima_requisicao',
    align: 'center',
  },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' },
]

const requisicoesColumns = [
  { name: 'nome_solicitante', label: 'Solicitante', field: 'nome_solicitante', align: 'left' },
  {
    name: 'created_at',
    label: 'Data',
    field: 'created_at',
    align: 'center',
    format: (val) => new Date(val).toLocaleDateString('pt-BR'),
  },
  { name: 'total_materiais', label: 'Materiais', field: 'total_materiais', align: 'center' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
]

// Computed properties para estatísticas
const totalRequisicoes = computed(() => {
  return rankingData.value.reduce((total, user) => total + parseInt(user.total_requisicoes), 0)
})

const totalSolicitantes = computed(() => {
  return rankingData.value.length
})

const totalMateriais = computed(() => {
  return rankingData.value.reduce((total, user) => total + parseInt(user.total_materiais || 0), 0)
})

const requisicoesHoje = computed(() => {
  const hoje = new Date().toISOString().split('T')[0]
  return requisicoesRecentes.value.filter((req) => {
    const reqDate = new Date(req.created_at).toISOString().split('T')[0]
    return reqDate === hoje
  }).length
})

function getBadgeColor(posicao) {
  switch (posicao) {
    case 1:
      return 'yellow-7'
    case 2:
      return 'grey-5'
    case 3:
      return 'orange-7'
    default:
      return 'primary'
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'Aprovado':
      return 'positive'
    case 'Pendente':
      return 'warning'
    case 'Rejeitado':
      return 'negative'
    default:
      return 'grey'
  }
}

function verDetalhes(user) {
  selectedUser.value = user
  showModal.value = true
}

async function loadRankingData() {
  try {
    const response = await api.get('/requisicoes/stats/ranking')
    rankingData.value = response.data
  } catch (error) {
    console.error('Erro ao carregar ranking:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar dados do ranking',
      position: 'top',
    })
  }
}

async function loadRequisicoesRecentes() {
  try {
    const response = await api.get('/requisicoes')
    requisicoesRecentes.value = response.data.slice(0, 5) // Pegar apenas as 5 mais recentes
  } catch (error) {
    console.error('Erro ao carregar requisições:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar requisições recentes',
      position: 'top',
    })
  }
}

async function refreshData() {
  loading.value = true

  try {
    await Promise.all([loadRankingData(), loadRequisicoesRecentes()])

    $q.notify({
      type: 'positive',
      message: 'Dados atualizados com sucesso!',
      position: 'top',
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Erro ao atualizar dados.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.q-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.q-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>
