<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Sistema de Requisições </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Menu </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'

const linksList = [
  {
    title: 'Requisição',
    caption: 'Solicitar materiais',
    icon: 'assignment',
    link: '/requisicao',
  },
  {
    title: 'Lista de Requisições',
    caption: 'Visualizar requisições',
    icon: 'list',
    link: '/lista-requisicoes',
  },
  {
    title: 'Gestão',
    caption: 'Gerenciar requisições',
    icon: 'settings',
    link: '/gestao',
  },
  {
    title: 'Pendências',
    caption: 'Cadastrar pendências',
    icon: 'warning',
    link: '/pendencia',
  },
  {
    title: 'SIS',
    caption: 'Módulo SIS',
    icon: 'dashboard',
    link: '/sis',
  },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
