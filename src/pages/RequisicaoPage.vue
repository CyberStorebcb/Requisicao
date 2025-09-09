<template>
  <q-page class="req-bg" padding>
    <div class="q-pa-md flex flex-center">
      <div class="req-container">
        <h2 class="req-title text-center q-mb-lg">Requisição de Materiais</h2>
        <q-card class="req-card q-pa-lg">
          <q-card-section>
            <div class="text-subtitle1 q-mb-md req-guide">
              <q-icon name="info" color="primary" size="sm" /> Siga as etapas abaixo para solicitar
              materiais:
            </div>
            <ol class="req-steps q-mb-lg">
              <li>Selecione o <b>colaborador</b> responsável pela requisição.</li>
              <li>Adicione um ou mais <b>materiais</b> informando a descrição e quantidade.</li>
              <li>Escolha a <b>data da requisição</b> (apenas terças, quintas e sábados).</li>
              <li>Se necessário, preencha o campo de <b>observações</b>.</li>
              <li>Clique em <b>Enviar Requisição</b> para finalizar.</li>
            </ol>
            <q-form @submit.prevent="submitForm" class="q-gutter-md">
              <q-select
                v-model="form.colaborador"
                :options="filteredColaboradores"
                label="Colaborador"
                option-label="label"
                option-value="chapa"
                emit-value
                map-options
                filled
                :rules="[(val) => !!val || 'Selecione o colaborador']"
                class="req-field"
                color="primary"
                outlined
                rounded
                placeholder="Selecione o colaborador"
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                @filter="filterColaboradores"
              />
              <div class="q-mt-md">
                <div class="text-subtitle2 q-mb-sm"><b>Materiais Solicitados</b></div>
                <div
                  v-for="(material, index) in form.materiais"
                  :key="index"
                  class="row q-col-gutter-md q-mb-sm"
                >
                  <div class="col-8">
                    <q-input
                      v-model="material.descricao"
                      filled
                      label="Descrição do Material"
                      placeholder="Ex: Papel A4, Caneta, etc."
                      :rules="[(val) => !!val || 'Informe o material']"
                      class="req-field"
                      outlined
                      rounded
                    />
                  </div>
                  <div class="col-3">
                    <q-input
                      v-model="material.quantidade"
                      filled
                      type="number"
                      label="Quantidade"
                      placeholder="1"
                      min="1"
                      :rules="[(val) => (!!val && val > 0) || 'Quantidade deve ser maior que 0']"
                      class="req-field"
                      outlined
                      rounded
                    />
                  </div>
                  <div class="col-1 flex items-center">
                    <q-btn
                      v-if="form.materiais.length > 1"
                      @click="removeMaterial(index)"
                      icon="delete"
                      color="negative"
                      round
                      size="sm"
                    />
                  </div>
                </div>
                <q-btn
                  @click="addMaterial"
                  icon="add"
                  label="Adicionar Material"
                  color="primary"
                  flat
                  class="q-mt-sm req-add-btn"
                />
              </div>
              <q-input
                v-model="form.dataRequisicao"
                label="Data da Requisição"
                type="date"
                :min="minDate"
                :max="maxDate"
                filled
                :rules="[validateDateRule]"
                class="q-mt-md req-field"
                outlined
                rounded
                hint="Apenas terças, quintas e sábados são permitidas."
              />
              <q-input
                v-model="form.observacoes"
                label="Observações (opcional)"
                type="textarea"
                filled
                autogrow
                class="req-field"
                outlined
                rounded
                placeholder="Se necessário, adicione observações à requisição."
              />
              <div class="row q-gutter-md q-mt-lg">
                <div class="col">
                  <q-btn
                    type="submit"
                    color="primary"
                    label="Enviar Requisição"
                    icon="send"
                    class="full-width req-btn"
                  />
                </div>
                <div class="col">
                  <q-btn
                    @click="resetForm"
                    color="grey-4"
                    text-color="primary"
                    label="Limpar Formulário"
                    icon="refresh"
                    class="full-width req-btn"
                  />
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
        <q-card v-if="showPreview" class="q-mt-lg req-preview-card">
          <q-card-section>
            <div class="text-h6">Resumo da Requisição</div>
          </q-card-section>
          <q-card-section>
            <p><strong>Solicitante:</strong> {{ form.colaborador?.label || 'Não selecionado' }}</p>
            <p><strong>Chapa:</strong> {{ form.colaborador?.chapa || 'N/A' }}</p>
            <p><strong>Data da Requisição:</strong> {{ formatDate(form.dataRequisicao) }}</p>
            <p><strong>Data de Criação:</strong> {{ currentDate }}</p>
            <div class="q-mt-md">
              <strong>Materiais:</strong>
              <ul>
                <li v-for="material in form.materiais" :key="material.descricao">
                  {{ material.quantidade }} de {{ material.descricao }}
                </li>
              </ul>
            </div>
            <p v-if="form.observacoes"><strong>Observações:</strong> {{ form.observacoes }}</p>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()

const loading = ref(false)
const showPreview = ref(false)

// Lista de colaboradores
const colaboradores = [
  { chapa: '13795', nome: 'ABRAAO DOS SANTOS SILVA' },
  { chapa: '15884', nome: 'ALBERTO BATISTA DE OLIVEIRA JUNIOR' },
  { chapa: '13511', nome: 'ANDRE DOS SANTOS FERREIRA' },
  { chapa: '12557', nome: 'ANTONIO CARLOS DA SILVA SANTOS' },
  { chapa: '12492', nome: 'ANTONIO DA SILVA LIMA FILHO' },
  { chapa: '12588', nome: 'ANTONIO VARLEY DE OLIVEIRA DA FONSECA GOMES' },
  { chapa: '12459', nome: 'ANTONIO WILKE VIEIRA DOS REIS' },
  { chapa: '12652', nome: 'BRENNO DE BARROS BARRO' },
  { chapa: '12679', nome: 'CARLOS HENRIQUE SOARES FURTADO' },
  { chapa: '15836', nome: 'CESAR AUGUSTO FERREIRA' },
  { chapa: '12549', nome: 'DANILO AGUIAR DA SILVA' },
  { chapa: '12384', nome: 'DARLAN DE OLIVEIRA DA FONSECA GOMES' },
  { chapa: '13533', nome: 'DEBISON DE SOUSA SILVA' },
  { chapa: '12650', nome: 'DIEGO SOUSA DE LIMA' },
  { chapa: '12660', nome: 'DOMINGOS VALE DE SOUSA JUNIOR' },
  { chapa: '12336', nome: 'ELIGIO AGUIAR DE MACEDO' },
  { chapa: '13516', nome: 'ELISMAR ROCHA DE SOUSA' },
  { chapa: '12381', nome: 'EMERSON MACHADO COELHO JUNIOR' },
  { chapa: '12604', nome: 'ERNANDE DE LIMA LISBOA' },
  { chapa: '13138', nome: 'EZEQUIAS DE SOUZA ARAUJO' },
  { chapa: '12503', nome: 'EZEQUIEL DE SOUZA ARAUJO' },
  { chapa: '12600', nome: 'FELIPE GONCALVES DA COSTA' },
  { chapa: '13745', nome: 'FLAVIO PEREIRA DE SOUSA' },
  { chapa: '12533', nome: 'FRANCISCO CHAVES CORREIA' },
  { chapa: '12509', nome: 'FRANCISCO DAS CHAGAS PEREIRA LIMA' },
  { chapa: '12685', nome: 'FRANCISCO DE ASSIS NASCIMENTO FILHO' },
  { chapa: '12300', nome: 'GABRIEL MELO SOUSA' },
  { chapa: '12659', nome: 'GILSON SILVA DE SOUSA' },
  { chapa: '12670', nome: 'GLEISON KELLVY BRITO ARAUJO DOS SANTOS' },
  { chapa: '12593', nome: 'HIGOR RODRIGUES FURTADO' },
  { chapa: '14263', nome: 'ISRAEL LUCAS SOUSA' },
  { chapa: '12649', nome: 'JOSE ALEXANDRE MOTA DA PAZ' },
  { chapa: '14266', nome: 'JOSE FELIPE DE JESUS NASCIMENTO' },
  { chapa: '13518', nome: 'JOSE FRANCISCO RODRIGUES BATISTA' },
  { chapa: '12654', nome: 'JOSE RAIMUNDO SILVA DA CONCEICAO' },
  { chapa: '12456', nome: 'JOSELI FERREIRA DA SILVA' },
  { chapa: '12299', nome: 'JOSUE DE SOUSA SOARES' },
  { chapa: '13527', nome: 'KEVEN LUAN LAGO ALMEIDA' },
  { chapa: '13280', nome: 'LAERCIO COSTA LIMA' },
  { chapa: '12906', nome: 'LUIS DA COSTA' },
  { chapa: '12461', nome: 'LUIS GONZAGA DA CONCEIÇÃO NASCIMENTO' },
  { chapa: '12637', nome: 'MANOEL FABIO NASCIMENTO CORDEIRO' },
  { chapa: '14270', nome: 'MATHEUS SILVA DOS SANTOS' },
  { chapa: '12672', nome: 'MOISES FERREIRA DE SOUSA' },
  { chapa: '15891', nome: 'NAILSON DE ALENCAR MOURA' },
  { chapa: '12517', nome: 'OFELIO DE SOUSA ALVES' },
  { chapa: '12511', nome: 'PAULO HENRIQUE RODRIGUES DA SILVA' },
  { chapa: '12590', nome: 'RAIMUNDO NONATO DA SILVA OLIVEIRA' },
  { chapa: '13744', nome: 'RAIMUNDO RIBEIRO DA SILVA FILHO' },
  { chapa: '12483', nome: 'RENATO SILVA DE MATOS' },
  { chapa: '13765', nome: 'ROBSON DA SILVA FIGUEIREDO' },
  { chapa: '12607', nome: 'ROGERIO COSTA DA SILVA' },
  { chapa: '13404', nome: 'ROMARIO COSTA DA SILVA' },
  { chapa: '12651', nome: 'TEONILDO DA SILVA CARVALHO' },
  { chapa: '12598', nome: 'THYAGO DE SOUZA' },
  { chapa: '12575', nome: 'TIAGO DA SILVA RODRIGUES' },
  { chapa: '12338', nome: 'VILCEAN ROSA DE SOUSA' },
  { chapa: '12513', nome: 'WANDERSON RIBEIRO VALE' },
  { chapa: '12690', nome: 'ITALO BRUNO DA SILVA FONTES' },
  { chapa: '12522', nome: 'RAFAEL CARVALHO DA SILVA' },
  { chapa: '12514', nome: 'ANTONIO VALTER SOUSA DA SILVA JUNIOR' },
  { chapa: 'BCB', nome: '301' },
  { chapa: 'BCB', nome: '302' },
  { chapa: 'BCB', nome: '303' },
  { chapa: 'BCB', nome: '304' },
  { chapa: 'BCB', nome: '305' },
  { chapa: 'BCB', nome: '306' },
  { chapa: 'BCB', nome: '307' },
  { chapa: 'BCB', nome: '308' },
  { chapa: 'BCB', nome: '400' },
  { chapa: 'BCB', nome: 'CARREGAMENTO' },
  { chapa: 'BCB', nome: 'REPARO' },
]

// Criar options para o select (chapa + nome)
const colaboradoresOptions = colaboradores.map((col) => ({
  label: `${col.chapa} - ${col.nome}`,
  value: col.chapa,
  chapa: col.chapa,
  nome: col.nome,
}))

const filteredColaboradores = ref(colaboradoresOptions)

// Dias permitidos: Terça (2), Quinta (4), Sábado (6)
const allowedDays = [2, 4, 6]

function getNextAllowedDate() {
  const today = new Date()

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    if (allowedDays.includes(date.getDay())) {
      return date.toISOString().split('T')[0]
    }
  }

  return today.toISOString().split('T')[0]
}

const form = ref({
  colaborador: null,
  dataRequisicao: getNextAllowedDate(),
  materiais: [
    {
      descricao: '',
      quantidade: 1,
      // unidade removido
    },
  ],
  observacoes: '',
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('pt-BR')
})

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const maxDate = computed(() => {
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + 30) // 30 dias no futuro
  return futureDate.toISOString().split('T')[0]
})

const isDayAllowed = computed(() => {
  if (!form.value.dataRequisicao) return false
  const date = new Date(form.value.dataRequisicao + 'T00:00:00')
  const dayOfWeek = date.getDay()
  return allowedDays.includes(dayOfWeek)
})

function validateDateRule(val) {
  if (!val) return 'Data é obrigatória'

  const date = new Date(val + 'T00:00:00')
  const dayOfWeek = date.getDay()

  if (!allowedDays.includes(dayOfWeek)) {
    return 'Requisições são permitidas apenas nas terças, quintas e sábados'
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (date < today) {
    return 'A data não pode ser anterior a hoje'
  }

  return true
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function filterColaboradores(val, update) {
  if (val === '') {
    update(() => {
      filteredColaboradores.value = colaboradoresOptions
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    filteredColaboradores.value = colaboradoresOptions.filter(
      (v) =>
        v.label.toLowerCase().includes(needle) ||
        v.chapa.includes(needle) ||
        v.nome.toLowerCase().includes(needle),
    )
  })
}

function addMaterial() {
  form.value.materiais.push({
    descricao: '',
    quantidade: 1,
    // unidade removido
  })
}

function removeMaterial(index) {
  form.value.materiais.splice(index, 1)
}

async function submitForm() {
  // Validar se o dia é permitido antes de enviar
  if (!isDayAllowed.value) {
    $q.notify({
      type: 'negative',
      message: 'Requisições só são permitidas nas terças, quintas e sábados',
      position: 'top',
    })
    return
  }

  loading.value = true

  try {
    const payload = {
      nome_solicitante: form.value.colaborador?.nome || '',
      chapa_solicitante: form.value.colaborador?.chapa || '',
      data_requisicao: form.value.dataRequisicao,
      observacoes: form.value.observacoes,
      materiais: form.value.materiais.filter(
        (material) => material.descricao.trim() !== '' && material.quantidade > 0,
      ),
    }

    const response = await fetch('http://localhost:3000/api/requisicoes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    await response.json()

    $q.notify({
      type: 'positive',
      message: 'Requisição enviada com sucesso!',
      position: 'top',
    })
    // Redirecionar para a lista de requisições
    router.push('/lista-requisicoes')
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Erro ao enviar requisição. Verifique se o servidor está rodando.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = {
    colaborador: null,
    dataRequisicao: getNextAllowedDate(),
    materiais: [
      {
        descricao: '',
        quantidade: 1,
        // unidade removido
      },
    ],
    observacoes: '',
  }
  showPreview.value = false

  $q.notify({
    type: 'info',
    message: 'Formulário limpo',
    position: 'top',
  })
}
</script>

<style scoped>
.req-bg {
  background: linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%);
  min-height: 100vh;
}
.req-container {
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
}
.req-title {
  color: #1976d2;
  letter-spacing: 1px;
  font-weight: 700;
  text-shadow: 0 2px 8px #e3f2fd;
}
.req-card {
  border-radius: 18px;
  box-shadow:
    0 4px 24px 0 rgba(25, 118, 210, 0.1),
    0 1.5px 6px 0 rgba(194, 24, 91, 0.08);
  border: 1px solid #e3f2fd;
}
.req-guide {
  color: #333;
  font-weight: 500;
  background: #e3f2fd;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.req-steps {
  color: #444;
  font-size: 15px;
  margin-left: 18px;
  margin-bottom: 24px;
}
.req-field {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px 0 #e3f2fd;
}
.req-add-btn {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
}
.req-btn {
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
}
.req-preview-card {
  border-radius: 14px;
  box-shadow: 0 2px 8px 0 #e3f2fd;
  border: 1px solid #e3f2fd;
}
</style>
.q-page { min-height: 100vh; }
