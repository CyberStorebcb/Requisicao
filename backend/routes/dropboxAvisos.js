const express = require('express')
const { Dropbox } = require('dropbox')
const XLSX = require('xlsx')
const fetch = require('node-fetch')

const router = express.Router()

const DROPBOX_APP_KEY = process.env.DROPBOX_APP_KEY
const DROPBOX_APP_SECRET = process.env.DROPBOX_APP_SECRET
const DROPBOX_REFRESH_TOKEN = process.env.DROPBOX_REFRESH_TOKEN
const DROPBOX_FILE_PATH =
  '/Programação Semanal Equipes/Programação Semanal 2025/PROGRAMAÇÃO SEMANAL LV BCB.xlsm'

// Função para obter novo access_token usando refresh_token
async function getDropboxAccessToken() {
  const params = new URLSearchParams()
  params.append('grant_type', 'refresh_token')
  params.append('refresh_token', DROPBOX_REFRESH_TOKEN)
  params.append('client_id', DROPBOX_APP_KEY)
  params.append('client_secret', DROPBOX_APP_SECRET)
  const response = await fetch('https://api.dropbox.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })
  if (!response.ok) throw new Error('Erro ao renovar access_token do Dropbox')
  const data = await response.json()
  return data.access_token
}

router.get('/avisos', async (req, res) => {
  try {
    const accessToken = await getDropboxAccessToken()
    const dbx = new Dropbox({ accessToken, fetch })
    const file = await dbx.filesDownload({ path: DROPBOX_FILE_PATH })
    const buffer = file.result.fileBinary
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheet = workbook.Sheets['AVISOS']
    if (!sheet) return res.status(404).json({ error: 'Aba AVISOS não encontrada' })
    const data = XLSX.utils.sheet_to_json(sheet, { defval: '' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
