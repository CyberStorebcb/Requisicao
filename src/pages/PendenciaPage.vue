<template>
  <q-page padding>
    <div class="q-pa-md" style="max-width: 800px; margin: 0 auto">
      <h4 class="text-h4 q-mb-lg text-center">Cadastro de Pendências</h4>

      <q-form @submit="submitForm" class="q-gutter-md">
        <!-- Campo PEP -->
        <q-input
          v-model="form.pep"
          filled
          label="PEP"
          placeholder="Digite o código PEP"
          :rules="[(val) => !!val || 'PEP é obrigatório']"
          required
          hint="Código de identificação do projeto"
        />

        <!-- Campo Tipo de Pendência -->
        <q-select
          v-model="form.tipoPendencia"
          filled
          label="Tipo de Pendência"
          :options="tiposPendencia"
          :rules="[(val) => !!val || 'Tipo de pendência é obrigatório']"
          required
          hint="Selecione o tipo da pendência"
        />

        <!-- Campo Localização -->
        <q-input
          v-model="form.localizacao"
          filled
          label="Localização"
          placeholder="Digite a localização da pendência"
          :rules="[(val) => !!val || 'Localização é obrigatória']"
          required
          hint="Local onde foi identificada a pendência"
        />

        <!-- Campo de Descrição da Pendência -->
        <q-input
          v-model="form.descricao"
          filled
          type="textarea"
          label="Descrição da Pendência"
          placeholder="Descreva detalhadamente a pendência encontrada"
          rows="4"
          :rules="[(val) => !!val || 'Descrição é obrigatória']"
          required
          hint="Detalhe a pendência identificada"
        />

        <!-- Campo para Anexar Imagem -->
        <div class="q-mb-md">
          <q-file
            v-model="form.imagem"
            filled
            label="Anexar Imagem"
            accept="image/*"
            @input="onFileSelected"
            hint="Anexe uma foto da pendência (formato: JPG, PNG, etc.)"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
        </div>

        <!-- Preview da Imagem -->
        <div v-if="imagePreview" class="q-mb-md">
          <q-card>
            <q-card-section>
              <div class="text-subtitle1">Preview da Imagem:</div>
            </q-card-section>
            <q-img :src="imagePreview" style="max-height: 200px" class="rounded-borders" />
            <q-card-actions align="right">
              <q-btn flat color="negative" icon="delete" label="Remover" @click="removeImage" />
            </q-card-actions>
          </q-card>
        </div>

        <!-- Campo de Data -->
        <q-input
          v-model="form.dataIdentificacao"
          filled
          label="Data de Identificação"
          type="date"
          :max="maxDate"
          :rules="[(val) => !!val || 'Data é obrigatória']"
          required
          hint="Data em que a pendência foi identificada"
        />

        <!-- Campo de Prioridade -->
        <q-select
          v-model="form.prioridade"
          filled
          label="Prioridade"
          :options="prioridades"
          :rules="[(val) => !!val || 'Prioridade é obrigatória']"
          required
          hint="Nível de prioridade da pendência"
        />

        <!-- Botões de Ação -->
        <div class="row q-gutter-sm q-mt-lg">
          <q-btn
            type="submit"
            label="Cadastrar Pendência"
            color="primary"
            icon="save"
            size="lg"
            :loading="loading"
          />
          <q-btn
            @click="resetForm"
            label="Limpar Formulário"
            color="grey"
            outline
            icon="refresh"
            size="lg"
          />
        </div>
      </q-form>

      <!-- Card com resumo da pendência -->
      <q-card v-if="showPreview" class="q-mt-lg">
        <q-card-section>
          <div class="text-h6">Resumo da Pendência</div>
        </q-card-section>
        <q-card-section>
          <p><strong>PEP:</strong> {{ form.pep }}</p>
          <p><strong>Tipo:</strong> {{ form.tipoPendencia?.label || form.tipoPendencia }}</p>
          <p><strong>Localização:</strong> {{ form.localizacao }}</p>
          <p><strong>Data de Identificação:</strong> {{ formatDate(form.dataIdentificacao) }}</p>
          <p><strong>Prioridade:</strong> {{ form.prioridade?.label || form.prioridade }}</p>
          <p><strong>Descrição:</strong> {{ form.descricao }}</p>
          <p v-if="form.imagem"><strong>Imagem:</strong> {{ form.imagem.name }}</p>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const loading = ref(false)
const showPreview = ref(false)
const imagePreview = ref(null)

const form = ref({
  pep: '',
  tipoPendencia: null,
  localizacao: '',
  descricao: '',
  imagem: null,
  dataIdentificacao: new Date().toISOString().split('T')[0],
  prioridade: null,
})

// Opções para Tipo de Pendência
const tiposPendencia = [
  { label: 'Documentação', value: 'documentacao' },
  { label: 'Material', value: 'material' },
  { label: 'Equipamento', value: 'equipamento' },
  { label: 'Estrutural', value: 'estrutural' },
  { label: 'Elétrica', value: 'eletrica' },
  { label: 'Hidráulica', value: 'hidraulica' },
  { label: 'Segurança', value: 'seguranca' },
  { label: 'Qualidade', value: 'qualidade' },
  { label: 'Prazo', value: 'prazo' },
  { label: 'Outros', value: 'outros' },
]

// Opções para Prioridade
const prioridades = [
  { label: 'Baixa', value: 'baixa', color: 'green' },
  { label: 'Média', value: 'media', color: 'orange' },
  { label: 'Alta', value: 'alta', color: 'red' },
  { label: 'Crítica', value: 'critica', color: 'purple' },
]

const maxDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

function onFileSelected() {
  if (form.value.imagem) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(form.value.imagem)
  }
}

function removeImage() {
  form.value.imagem = null
  imagePreview.value = null
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

async function submitForm() {
  loading.value = true

  try {
    // Criar FormData para enviar arquivo junto com os dados
    const formData = new FormData()
    formData.append('pep', form.value.pep)
    formData.append('tipoPendencia', form.value.tipoPendencia?.value || form.value.tipoPendencia)
    formData.append('localizacao', form.value.localizacao)
    formData.append('descricao', form.value.descricao)
    formData.append('dataIdentificacao', form.value.dataIdentificacao)
    formData.append('prioridade', form.value.prioridade?.value || form.value.prioridade)

    if (form.value.imagem) {
      formData.append('imagem', form.value.imagem)
    }

    // Fazer chamada para a API
    const response = await fetch('http://localhost:3000/api/pendencias', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    await response.json()

    showPreview.value = true

    $q.notify({
      type: 'positive',
      message: 'Pendência cadastrada com sucesso!',
      position: 'top',
    })
  } catch {
    console.error('Erro ao cadastrar pendência')
    $q.notify({
      type: 'negative',
      message: 'Erro ao cadastrar pendência. Verifique se o servidor está rodando.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = {
    pep: '',
    tipoPendencia: null,
    localizacao: '',
    descricao: '',
    imagem: null,
    dataIdentificacao: new Date().toISOString().split('T')[0],
    prioridade: null,
  }
  imagePreview.value = null
  showPreview.value = false

  $q.notify({
    type: 'info',
    message: 'Formulário limpo',
    position: 'top',
  })
}
</script>

<style scoped>
.q-page {
  min-height: 100vh;
}
</style>
