<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row items-center justify-between q-mb-lg">
        <h4 class="text-h4 q-mb-none">Lista de Requisições</h4>
        <q-btn
          @click="loadRequisicoes"
          label="Atualizar"
          color="primary"
          icon="refresh"
          :loading="loading"
        />
      </div>

      <!-- Filtros -->
      <q-card flat class="q-mb-md">
        <q-card-section>
          <div class="row q-gutter-md">
            <div class="col-md-3 col-xs-12">
              <q-input
                v-model="filtros.nome"
                filled
                label="Filtrar por Nome"
                placeholder="Nome do solicitante"
                clearable
                @input="filterRequisicoes"
              />
            </div>
            <div class="col-md-3 col-xs-12">
              <q-select
                v-model="filtros.status"
                filled
                label="Status"
                :options="statusOptions"
                clearable
                @update:model-value="filterRequisicoes"
              />
            </div>
            <div class="col-md-3 col-xs-12">
              <q-input
                v-model="filtros.dataInicio"
                filled
                type="date"
                label="Data Início"
                @update:model-value="filterRequisicoes"
              />
            </div>
            <div class="col-md-3 col-xs-12">
              <q-input
                v-model="filtros.dataFim"
                filled
                type="date"
                label="Data Fim"
                @update:model-value="filterRequisicoes"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Tabela de Requisições -->
      <q-table
        :rows="filteredRequisicoes"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        flat
        bordered
      >
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-chip :color="getStatusColor(props.value)" text-color="white" size="sm">
              {{ getStatusLabel(props.value) }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-data_requisicao="props">
          <q-td :props="props">
            {{ formatDate(props.value) }}
          </q-td>
        </template>

        <template v-slot:body-cell-created_at="props">
          <q-td :props="props">
            {{ formatDateTime(props.value) }}
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              color="primary"
              icon="visibility"
              size="sm"
              @click="viewRequisicao(props.row)"
            >
              <q-tooltip>Ver Detalhes</q-tooltip>
            </q-btn>
            <q-btn flat round color="info" icon="edit" size="sm" @click="openEditDialog(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="positive"
              icon="done_all"
              size="sm"
              @click="openConcluirDialog(props.row)"
              v-if="props.row.status !== 'concluída'"
            >
              <q-tooltip>Concluir</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="openDeleteDialog(props.row)"
            >
              <q-tooltip>Excluir</q-tooltip>
            </q-btn>
            <!-- Dialog de Senha -->
            <q-dialog v-model="showPasswordDialog">
              <q-card style="min-width: 300px">
                <q-card-section>
                  <div class="text-h6">Digite a senha para continuar</div>
                  <q-input
                    v-model="adminPassword"
                    type="password"
                    label="Senha"
                    autofocus
                    @keyup.enter="confirmPasswordAction"
                  />
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn
                    flat
                    label="Cancelar"
                    color="primary"
                    v-close-popup
                    @click="resetPasswordDialog"
                  />
                  <q-btn flat label="Confirmar" color="positive" @click="confirmPasswordAction" />
                </q-card-actions>
              </q-card>
            </q-dialog>

            <!-- Dialog de Edição -->
            <q-dialog v-model="showEditDialog">
              <q-card style="min-width: 400px">
                <q-card-section>
                  <div class="text-h6">Editar Requisição</div>
                  <q-input v-model="editData.nome_solicitante" label="Solicitante" />
                  <q-input
                    v-model="editData.data_requisicao"
                    label="Data da Requisição"
                    type="date"
                  />
                  <q-input v-model="editData.observacoes" label="Observações" type="textarea" />
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn
                    flat
                    label="Cancelar"
                    color="primary"
                    v-close-popup
                    @click="resetEditDialog"
                  />
                  <q-btn flat label="Salvar" color="positive" @click="submitEdit" />
                </q-card-actions>
              </q-card>
            </q-dialog>
          </q-td>
        </template>
      </q-table>

      <!-- Dialog de Detalhes da Requisição -->
      <q-dialog v-model="showDetails" style="max-width: 800px">
        <q-card>
          <q-card-section>
            <div class="text-h6">Detalhes da Requisição #{{ selectedRequisicao?.id }}</div>
          </q-card-section>

          <q-card-section v-if="selectedRequisicao">
            <div class="row q-gutter-md">
              <div class="col-12">
                <q-list bordered>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Solicitante</q-item-label>
                      <q-item-label>{{ selectedRequisicao.nome_solicitante }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Data da Requisição</q-item-label>
                      <q-item-label>{{
                        formatDate(selectedRequisicao.data_requisicao)
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Status</q-item-label>
                      <q-item-label>
                        <q-chip
                          :color="getStatusColor(selectedRequisicao.status)"
                          text-color="white"
                          size="sm"
                        >
                          {{ getStatusLabel(selectedRequisicao.status) }}
                        </q-chip>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item v-if="selectedRequisicao.observacoes">
                    <q-item-section>
                      <q-item-label caption>Observações</q-item-label>
                      <q-item-label>{{ selectedRequisicao.observacoes }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>

            <!-- Lista de Materiais -->
            <div class="q-mt-md" v-if="selectedRequisicao.materiais?.length">
              <div class="text-subtitle1 q-mb-sm">Materiais Solicitados</div>
              <q-table
                :rows="selectedRequisicao.materiais"
                :columns="materialsColumns"
                row-key="id"
                flat
                bordered
                hide-pagination
              />
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Fechar" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { reactive } from 'vue'
// Dialogs e estados para ações protegidas
const showPasswordDialog = ref(false)
const showEditDialog = ref(false)
const passwordAction = ref(null)
const passwordActionPayload = ref(null)
const adminPassword = ref('')
const editData = reactive({ id: null, nome_solicitante: '', data_requisicao: '', observacoes: '' })

function openDeleteDialog(row) {
  passwordAction.value = 'delete'
  passwordActionPayload.value = row
  showPasswordDialog.value = true
}
function openConcluirDialog(row) {
  passwordAction.value = 'concluir'
  passwordActionPayload.value = row
  showPasswordDialog.value = true
}
function openEditDialog(row) {
  editData.id = row.id
  editData.nome_solicitante = row.nome_solicitante
  editData.data_requisicao = row.data_requisicao?.slice(0, 10) || ''
  editData.observacoes = row.observacoes || ''
  showEditDialog.value = true
}
function resetEditDialog() {
  showEditDialog.value = false
  editData.id = null
  editData.nome_solicitante = ''
  editData.data_requisicao = ''
  editData.observacoes = ''
}
function resetPasswordDialog() {
  showPasswordDialog.value = false
  adminPassword.value = ''
  passwordAction.value = null
  passwordActionPayload.value = null
}
async function confirmPasswordAction() {
  if (passwordAction.value === 'delete') {
    await deleteRequisicao(passwordActionPayload.value)
  } else if (passwordAction.value === 'concluir') {
    await concluirRequisicao(passwordActionPayload.value)
  }
  resetPasswordDialog()
}
async function deleteRequisicao(row) {
  try {
    const response = await fetch(`http://localhost:3000/api/requisicoes/${row.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha: adminPassword.value }),
    })
    if (!response.ok) throw new Error('Falha ao excluir')
    $q.notify({ type: 'positive', message: 'Requisição excluída!', position: 'top' })
    await loadRequisicoes()
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao excluir: ' + (e.message || ''),
      position: 'top',
    })
  }
}
async function concluirRequisicao(row) {
  try {
    const response = await fetch(`http://localhost:3000/api/requisicoes/${row.id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Concluída', senha: adminPassword.value }),
    })
    if (!response.ok) throw new Error('Falha ao concluir')
    $q.notify({ type: 'positive', message: 'Requisição concluída!', position: 'top' })
    await loadRequisicoes()
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao concluir: ' + (e.message || ''),
      position: 'top',
    })
  }
}
async function submitEdit() {
  // Solicita senha antes de editar
  passwordAction.value = 'edit'
  passwordActionPayload.value = { ...editData }
  showEditDialog.value = false
  showPasswordDialog.value = true
}
watch(passwordAction, async (val) => {
  if (val === 'edit' && adminPassword.value) {
    await editRequisicao(passwordActionPayload.value)
    resetPasswordDialog()
  }
})
async function editRequisicao(data) {
  try {
    const response = await fetch(`http://localhost:3000/api/requisicoes/${data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome_solicitante: data.nome_solicitante,
        data_requisicao: data.data_requisicao,
        observacoes: data.observacoes,
        senha: adminPassword.value,
      }),
    })
    if (!response.ok) throw new Error('Falha ao editar')
    $q.notify({ type: 'positive', message: 'Requisição editada!', position: 'top' })
    await loadRequisicoes()
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao editar: ' + (e.message || ''),
      position: 'top',
    })
  }
}
import { ref, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const loading = ref(false)
const requisicoes = ref([])
const showDetails = ref(false)
const selectedRequisicao = ref(null)

const filtros = ref({
  nome: '',
  status: null,
  dataInicio: '',
  dataFim: '',
})

const statusOptions = [
  { label: 'Pendente', value: 'pendente' },
  { label: 'Aprovado', value: 'aprovado' },
  { label: 'Rejeitado', value: 'rejeitado' },
]

const columns = [
  {
    name: 'id',
    required: true,
    label: 'ID',
    align: 'left',
    field: 'id',
    sortable: true,
    style: 'width: 80px',
  },
  {
    name: 'nome_solicitante',
    required: true,
    label: 'Solicitante',
    align: 'left',
    field: 'nome_solicitante',
    sortable: true,
  },
  {
    name: 'data_requisicao',
    label: 'Data da Requisição',
    align: 'left',
    field: 'data_requisicao',
    sortable: true,
  },
  {
    name: 'total_materiais',
    label: 'Qtd. Materiais',
    align: 'center',
    field: 'total_materiais',
    sortable: true,
    style: 'width: 120px',
  },
  {
    name: 'status',
    label: 'Status',
    align: 'center',
    field: 'status',
    sortable: true,
    style: 'width: 120px',
  },
  {
    name: 'created_at',
    label: 'Criado em',
    align: 'left',
    field: 'created_at',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Ações',
    align: 'center',
    field: 'actions',
    style: 'width: 150px',
  },
]

const materialsColumns = [
  {
    name: 'descricao',
    required: true,
    label: 'Descrição',
    align: 'left',
    field: 'descricao',
  },
  {
    name: 'quantidade',
    label: 'Quantidade',
    align: 'center',
    field: 'quantidade',
  },
  {
    name: 'unidade',
    label: 'Unidade',
    align: 'center',
    field: 'unidade',
  },
]

const filteredRequisicoes = computed(() => {
  let filtered = [...requisicoes.value]

  if (filtros.value.nome) {
    filtered = filtered.filter((req) =>
      req.nome_solicitante.toLowerCase().includes(filtros.value.nome.toLowerCase()),
    )
  }

  if (filtros.value.status) {
    filtered = filtered.filter((req) => req.status === filtros.value.status.value)
  }

  if (filtros.value.dataInicio) {
    filtered = filtered.filter(
      (req) => new Date(req.data_requisicao) >= new Date(filtros.value.dataInicio),
    )
  }

  if (filtros.value.dataFim) {
    filtered = filtered.filter(
      (req) => new Date(req.data_requisicao) <= new Date(filtros.value.dataFim),
    )
  }

  return filtered
})

async function loadRequisicoes() {
  loading.value = true
  try {
    const response = await fetch('http://localhost:3000/api/requisicoes')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    requisicoes.value = data
  } catch (error) {
    console.error('Erro ao carregar requisições:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar requisições. Verifique se o servidor está rodando.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

async function viewRequisicao(requisicao) {
  try {
    const response = await fetch(`http://localhost:3000/api/requisicoes/${requisicao.id}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    selectedRequisicao.value = data
    showDetails.value = true
  } catch (error) {
    console.error('Erro ao carregar detalhes:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar detalhes da requisição',
      position: 'top',
    })
  }
}

function filterRequisicoes() {
  // A filtragem é feita automaticamente pelo computed
}

function getStatusColor(status) {
  switch (status) {
    case 'pendente':
      return 'orange'
    case 'aprovado':
      return 'positive'
    case 'rejeitado':
      return 'negative'
    default:
      return 'grey'
  }
}

function getStatusLabel(status) {
  switch (status) {
    case 'pendente':
      return 'Pendente'
    case 'aprovado':
      return 'Aprovado'
    case 'rejeitado':
      return 'Rejeitado'
    default:
      return 'Desconhecido'
  }
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('pt-BR')
}

function formatDateTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR')
}

onMounted(() => {
  loadRequisicoes()
})
</script>

<style scoped>
.q-table {
  background: white;
}

.q-chip {
  font-weight: bold;
}
</style>
