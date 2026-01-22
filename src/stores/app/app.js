import { defineStore } from 'pinia'
import api from '@/service/http.js'

export const useAppStore = defineStore('app', {
  state: () => ({
    modelos: [],
    relatorios: [],
  }),
  getters: {},
  actions: {
    async getModels(user) {
      try {
        const response = await api.get('/app/modelos?equipe=' + user.equipe)
        this.modelos = response.data
        this.error = ''
        return true
      } catch {
        return false
      }
    },
    async extrairVariaveis(doc) {
      try {
        const formData = new FormData()
        formData.append('file', doc)

        const response = await api.post('/app/extrair-variaveis', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        return response.data
      } catch (error) {
        console.error('Erro ao extrair variáveis:', error.response?.data || error.message)
        return false
      }
    },
    async adicionarNovoFormulario(titulo, descriçao, modelo_automaçao, doc, termografia) {
      let modelo_automaçao_JSON = JSON.stringify(modelo_automaçao)
      let equipe = JSON.parse(localStorage.getItem('usuario')).equipe

      const formData = new FormData()
      formData.append('titulo', titulo)
      formData.append('equipe', equipe)
      formData.append('descriçao', descriçao)
      formData.append('modelo_automacao', modelo_automaçao_JSON)
      formData.append('documento_modelo', doc) // File
      formData.append('termografia', termografia)

      try {
        const response = await api.post('app/novoModelo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        return response.data
      } catch (error) {
        console.error('Erro ao salvar formulário:', error.response?.data || error.message)
        return false
      }
    },
    async gerarRelatorio(
      chaves,
      pendencias,
      modelo,
      chavePendencia,
      itens_pendentes,
      nomeRelatorio,
    ) {
      const converterParaBase64 = async (file) => {
        if (!file) return null
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = (err) => reject(err)
          reader.readAsDataURL(file)
        })
      }

      // Converte dados
      const dadosConvertidos = {}
      for (const key in chaves) {
        const valor = chaves[key]
        dadosConvertidos[key] = valor instanceof File ? await converterParaBase64(valor) : valor
      }

      // Converte pendências
      const pendenciasConvertidas = await Promise.all(
        pendencias.map(async (p) => ({
          titulo: p.titulo,
          descriçao: p.descriçao,
          imagem: p.imagem instanceof File ? await converterParaBase64(p.imagem) : p.imagem,
        })),
      )
      console.log(itens_pendentes)
      try {
        let retorno = null

        await api
          .post(
            'automate/gerar-doc',
            {
              modelo_id: modelo,
              equipamento: 'QPE',
              dados: dadosConvertidos,
              responsavel: JSON.parse(localStorage.getItem('usuario')).usuario,
              pendencias: pendenciasConvertidas,
              chavePendencia: chavePendencia,
              itens_pendentes: itens_pendentes,
              nome_relatorio: nomeRelatorio,
            },
            { headers: { 'Content-Type': 'application/json' } },
          )
          .then((res) => {
            retorno = res.status
          })

        return retorno
      } catch (err) {
        console.error('ERRO:', err.response?.data || err.message)
        return false
      }
    },

    async recuperarRelatórios() {
      await api
        .get('/app/recuperarRelatorios', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        .then((res) => {
          this.relatorios = res.data
        })
        .catch((err) => console.error(err))
    },
    async baixarRelatorio(idRelatorio) {
      try {
        const response = await api.get('/app/baixarRelatorio/' + idRelatorio, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          responseType: 'blob',
        })

        // 1) Tente obter header via response.headers.get (fetch-like)
        let contentDisposition = null
        try {
          if (response.headers && typeof response.headers.get === 'function') {
            contentDisposition =
              response.headers.get('content-disposition') ||
              response.headers.get('Content-Disposition')
          }
        } catch (e) {
          console.log(e)
        }

        // 2) Fallback: tente via xhr original (axios coloca o xhr em response.request)
        if (!contentDisposition && response.request) {
          try {
            // Alguns objetos XHR usam getResponseHeader
            const req = response.request
            if (typeof req.getResponseHeader === 'function') {
              contentDisposition =
                req.getResponseHeader('Content-Disposition') ||
                req.getResponseHeader('content-disposition')
            }
          } catch (e) {
           console.log(e)
          }
        }

        // 3) Se ainda não tiver, tente ler a propriedade headers como objeto (axios antigo)
        if (!contentDisposition && response.headers && typeof response.headers === 'object') {
          contentDisposition =
            response.headers['content-disposition'] ||
            response.headers['Content-Disposition'] ||
            null
        }

        // 4) Extrai filename com suporte a filename* (RFC5987) e filename simples
        let fileName = 'relatorio.docx'
        if (contentDisposition) {
          // filename*=UTF-8''...  OR filename="..."
          let match = contentDisposition.match(/filename\*\s*=\s*([^;]+)/i)
          if (match) {
            // Ex: UTF-8''nome%20arquivo.docx
            let dec = match[1].trim()
            // remover possível charset prefix
            const parts = dec.split("''")
            if (parts.length === 2) {
              try {
                fileName = decodeURIComponent(parts[1])
              } catch {
                fileName = parts[1]
              }
            } else {
              fileName = dec.replace(/(^["'])|(["']$)/g, '')
            }
          } else {
            match =
              contentDisposition.match(/filename\s*=\s*"([^"]+)"/i) ||
              contentDisposition.match(/filename\s*=\s*([^;]+)/i)
            if (match && match[1]) {
              fileName = match[1].trim().replace(/(^["'])|(["']$)/g, '')
            }
          }
        }

        // garantir extensão .docx
        if (!fileName.toLowerCase().endsWith('.docx')) {
          fileName += '.docx'
        }

        // Criar URL e forçar download
        const url = window.URL.createObjectURL(
          new Blob([response.data], { type: response.data.type }),
        )
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()

        // limpar
        link.remove()
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Erro ao baixar relatório:', error)
      }
    },
    async enviarItensPendentes(id, itens) {
      try {
        const imagensDict = {}
        for (const item of itens) {
          imagensDict[item.chave] = item.imagem
        }
        const res = await api.post(
          'automate/resolver-itens-pendentes',
          {
            relatorio_id: id,
            imagens: imagensDict,
          },
          {
            headers: { 'Content-Type': 'application/json' },
          },
        )

        return res.data || true // retorna algo útil
      } catch (err) {
        console.error('ERRO AO ENVIAR ITENS PENDENTES:', err.response?.data || err.message)
        return false
      }
    },
  },
})
