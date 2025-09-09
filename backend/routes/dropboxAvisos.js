const express = require('express')
const { Dropbox } = require('dropbox')
const XLSX = require('xlsx')
const fetch = require('node-fetch')

const router = express.Router()

const DROPBOX_ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN
const DROPBOX_FILE_PATH =
  '/Programação Semanal Equipes/Programação Semanal 2025/PROGRAMAÇÃO SEMANAL LV BCB.xlsm'

router.get('/avisos', async (req, res) => {
  try {
    const dbx = new Dropbox({ accessToken: DROPBOX_ACCESS_TOKEN, fetch })
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
