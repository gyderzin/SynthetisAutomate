<template>
  <v-dialog v-model="dialogForm" transition="dialog-bottom-transition" fullscreen>
    <v-card>
      <v-toolbar color="primary" dark>
        <!-- Corrigido: executar as duas ações corretamente -->
        <v-btn icon="mdi-close" @click="dialogForm = false; resetarFormulario()"></v-btn>
        <v-toolbar-title class="text-center">{{ modelo.titulo }}</v-toolbar-title>
      </v-toolbar>

      <v-stepper v-model="step" hide-actions :items="itemsStep">
        <!-- Step 1: Formulário -->
        <template v-slot:[`item.1`]>
          <div style="height: 70vh; overflow-y: auto; overflow-x: hidden;">
            <v-form ref="form">
              <v-row dense>
                <v-col cols="12" class="px-1">
                  <v-text-field v-model="nomeRelatorio" :rules="[regraObrigatoria]" outlined dense clearable
                    variant="solo-filled" label="Nome do Relatório">

                  </v-text-field>
                </v-col>
                <v-col v-for="chave in chaves" :key="chave.chave" cols="12" class="px-1">
                  <!-- Campo de texto -->
                  <v-text-field v-if="chave.campo === 'texto'" v-model="formData[chave.chave]"
                    :label="chave.label || chave.chave" :rules="[regraObrigatoria]" outlined dense clearable
                    variant="solo-filled"></v-text-field>

                  <!-- Campo de data -->
                  <v-menu v-else-if="chave.campo === 'data'" v-model="menus[chave.chave]"
                    :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto"
                    :nudge-right="40">
                    <template v-slot:activator="{ props }">
                      <v-text-field v-model="formData[chave.chave]" :label="chave.label || chave.chave"
                        :rules="[regraObrigatoria]" readonly v-bind="props" outlined dense clearable
                        variant="solo-filled"></v-text-field>
                    </template>
                    <v-date-picker v-model="menusData[chave.chave]" @update:model-value="setDate(chave.chave)"
                      locale="pt-BR" scrollable></v-date-picker>
                  </v-menu>

                  <!-- Campo técnico -->
                  <v-text-field v-if="chave.campo === 'técnico'" v-model="formData[chave.chave]"
                    :label="chave.label || chave.chave" :rules="[regraObrigatoria]" outlined dense clearable
                    variant="solo-filled"></v-text-field>

                  <!-- Campo seleção -->
                  <v-radio-group v-else-if="chave.campo === 'selecao'" v-model="camposRadio[chave.chave]"
                    :rules="[regraObrigatoria]">
                    <template v-slot:label>
                      <span class="font-weight-bold text-primary">{{ chave.label || chave.chave }}</span>
                    </template>
                    <v-radio label="Conforme" value="C"></v-radio>
                    <v-radio label="Não conforme" value="NC"></v-radio>
                  </v-radio-group>

                  <!-- Campo imagem -->
                  <v-file-input v-else-if="chave.campo === 'imagem'" :label="chave.label || chave.chave"
                    v-model="formData[chave.chave]" :rules="[regraObrigatoria]" prepend-icon="mdi-camera"
                    accept="image/*" capture="environment" outlined dense></v-file-input>
                </v-col>
              </v-row>
            </v-form>
          </div>
          <v-row>
            <v-col class="d-flex justify-end my-5">
              <v-btn color="primary" @click="avancarForm">Avançar</v-btn>
            </v-col>
          </v-row>
        </template>

        <!-- Step 2: Pendências -->
        <template v-slot:[`item.2`]>
          <div style="height: 70vh; overflow-y: auto; overflow-x: hidden;">
            <v-list density="comfortable" lines="two">
              <v-form ref="form2">
                <v-list-item v-for="(pendencia, index) in pendencias" :key="index" class="pa-2">
                  <v-card flat outlined class="pa-3 w-100">
                    <v-list-item-title class="text-h5">{{ pendencia.titulo }}</v-list-item-title>
                    <v-textarea v-model="pendencia.descriçao" label="Descreva a não conformidade" outlined dense
                      :rules="[regraObrigatoria]" class="mt-2"></v-textarea>
                    <v-file-input v-model="pendencia.imagem" label="Foto da não conformidade" prepend-icon="mdi-camera"
                      accept="image/*" capture="environment" outlined dense :rules="[regraObrigatoria]"></v-file-input>
                  </v-card>
                  <v-divider></v-divider>
                </v-list-item>
              </v-form>

              <v-list-item v-if="pendencias.length === 0">
                <v-list-item-content>
                  <v-list-item-title>Nenhuma pendência encontrada.</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </div>
          <v-row class="my-1">
            <v-col>
              <v-btn color="primary" text @click="step = 1">Voltar</v-btn>
            </v-col>
            <v-col class="d-flex justify-end">
              <!-- aqui: ao chamar sem argumento, a função avançará para o step 3 se existir termografia -->
              <v-btn color="primary" @click="avancarStep()">
                {{ termografia == true ? 'Avançar' : 'Finalizar' }}
              </v-btn>
            </v-col>
          </v-row>
        </template>

        <!-- Step 3: Termografias (opcional) -->
        <template v-slot:[`item.3`] v-if="termografia">
          <div style="height: 70vh; overflow-y: auto; overflow-x: hidden;">
            <v-form ref="form3">
              <v-row dense class="">
                <template v-for="chave in camposTermografias" :key="chave.chave">
                  <v-col cols="12" class="px-1">
                    <v-file-input v-if="chave.campo === 'termografia'" :label="chave.label || chave.chave"
                      v-model="formData[chave.chave]" :rules="[regraObrigatoria]" prepend-icon="mdi-camera"
                      accept="image/*" capture="environment" outlined dense></v-file-input>
                  </v-col>
                </template>
              </v-row>
            </v-form>
          </div>
          <v-row class="my-1">
            <v-col>
              <v-btn color="primary" text @click="step = 2">Voltar</v-btn>
            </v-col>
            <v-col class="d-flex justify-end">
              <!-- passar true indica que está finalizando no step de termografia -->
              <v-btn color="primary" @click="avancarStep(true)">
                Finalizar
              </v-btn>
            </v-col>
          </v-row>
        </template>
      </v-stepper>
    </v-card>

    <!-- DIALOG de confirmação (transformado em Promise) -->
    <v-dialog transition="dialog-bottom-transition" width="auto" v-model="dialogConfirmarSemTermo" persistent>
      <!-- removi o activator inútil -->
      <v-card color="warning" prepend-icon="mdi-camera"
        text="Caso você não tenha como anexar agora, há a possibilidade de anexar depois na aba de arquivos."
        title="Deseja prosseguir sem adicionar imagem termografica?">

        <v-card-actions>
          <v-row class="my-1" style="width:100%">
            <v-col class="mx-1 my-0 py-0">
              <!-- chama cancelar que resolve a promise com false -->
              <v-btn variant="outlined" @click="cancelarSemTermo()">
                Voltar
              </v-btn>
            </v-col>
            <v-col class="d-flex justify-end mx-1 my-0 py-0">
              <!-- confirma -->
              <v-btn variant="elevated" @click="confirmarSemTermoFuncion()" color="success">
                Confirmar
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-dialog>
</template>

<script>
export default {
  props: {
    modelValue: { type: Boolean, required: true },
    modelo: { type: Object, required: true },
    app: { required: true },
    alert: { required: true }
  },
  data() {
    return {
      step: 1,
      formData: {},
      menus: {},
      camposRadio: [],
      pendencias: [],
      menusData: {},
      termografia: undefined,
      nomeRelatorio: '',
      // imagensTermograficas removida (não usada)
      dialogConfirmarSemTermo: false,
      // confirmarSemTermo removida (não usada)
      confirmarSemTermoResolver: null, // resolver da promise do diálogo
    }
  },
  computed: {
    dialogForm: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit("update:modelValue", val)
      }
    },
    chaves() {
      let chavesReturn = []
      try {
        if (this.termografia == true) {
          JSON.parse(this.modelo.modelo_automacao).forEach(model => {
            if (model['campo'] != 'termografia') {
              chavesReturn.push(model)
            }
          })
          return chavesReturn
        } else {
          return JSON.parse(this.modelo.modelo_automacao || "[]")
        }
      } catch {
        return []
      }
    },
    camposTermografias() {
      let camposTermo = []
      if (this.termografia == true) {
        JSON.parse(this.modelo.modelo_automacao).forEach(model => {
          if (model['campo'] == 'termografia') {
            camposTermo.push(model)
          }
        })
        return camposTermo
      } else {
        return false
      }
    },
    itemsStep() {
      if (this.termografia) {
        return ['Formulário', 'Pendências', 'Termografias']
      } else {
        return ['Formulário', 'Pendências']
      }
    }
  },
  watch: {
    modelo: {
      immediate: true,
      deep: true,
      handler(novoModelo) {
        if (novoModelo?.modelo_automacao) {
          try {
            const campos = JSON.parse(novoModelo.modelo_automacao)
            this.termografia = novoModelo.termografia
            const valoresForm = {}
            const valoresRadio = {}
            const menusObj = {}
            const menusDataObj = {}

            const hojeISO = this.getTodayLocalISO()

            campos.forEach(item => {
              if (item.campo === "pendencias") {
                valoresForm[item.chave] = []
              } else if (item.campo === "data") {
                valoresForm[item.chave] = this.formatDate(hojeISO)
                menusObj[item.chave] = false
                menusDataObj[item.chave] = hojeISO
              } else if (item.campo === "técnico") {
                let tecnico = JSON.parse(localStorage.getItem("usuario")).usuario
                tecnico = tecnico
                  .split(".")
                  .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
                  .join(" ")
                valoresForm[item.chave] = tecnico
              } else if (item.campo === "selecao") {
                valoresRadio[item.chave] = ""
              } else if (item.campo === "imagem") {
                valoresForm[item.chave] = null
              } else {
                valoresForm[item.chave] = ""
              }
            })
            this.formData = valoresForm
            this.camposRadio = valoresRadio
            this.menus = menusObj
            this.menusData = menusDataObj
          } catch (e) {
            console.error("Erro ao processar modelo_automacao:", e)
          }
        }
      }
    }
  },
  methods: {
    // converte File -> base64
    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = err => reject(err)
        reader.readAsDataURL(file)
      })
    },

    // converte todos os campos que são File para base64
    async converterImagens(dados) {
      const novoDados = {}
      for (const chave in dados) {
        const valor = dados[chave]
        if (valor instanceof File) {
          novoDados[chave] = await this.fileToBase64(valor)
        } else {
          novoDados[chave] = valor
        }
      }
      return novoDados
    },

    async avancarForm() {
      const { valid } = await this.$refs.form.validate()
      if (valid) {
        // monta as pendências só com as que estão "NC"
        const pendenciasAutomatizadas = Object.entries(this.camposRadio)
          // eslint-disable-next-line no-unused-vars
          .filter(([_, estado]) => estado === "NC")
          .map(([chave]) => ({
            titulo: chave,
            descriçao: "",
            imagem: null
          }))

        // adiciona ao formData na chave "pendencias"
        this.formData["pendencias"] = pendenciasAutomatizadas
        this.pendencias = pendenciasAutomatizadas

        this.step++
      }
    },

    // Promise-based dialog: abre o dialog e retorna true/false conforme escolha do usuário
    confirmarSemTermoDialog() {
      return new Promise(resolve => {
        this.confirmarSemTermoResolver = resolve
        this.dialogConfirmarSemTermo = true
      })
    },

    // usado pelo botão Confirmar do dialog
    confirmarSemTermoFuncion() {
      if (this.confirmarSemTermoResolver) {
        this.confirmarSemTermoResolver(true)
      }
      this.dialogConfirmarSemTermo = false
      this.confirmarSemTermoResolver = null
    },

    // usado pelo botão Voltar do dialog
    cancelarSemTermo() {
      if (this.confirmarSemTermoResolver) {
        this.confirmarSemTermoResolver(false)
      }
      this.dialogConfirmarSemTermo = false
      this.confirmarSemTermoResolver = null
    },

    async avancarStep(stepTermo) {
      const { valid } = await this.$refs.form2.validate();
      if (!valid) return;

      // --- 1) Converte campos principais ---
      const formDataConvertido = await this.converterImagens(this.formData);

      // Campos de radio
      for (const [chave, valor] of Object.entries(this.camposRadio)) {
        formDataConvertido[chave] = valor;
      }

      // --- 2) Converte imagens das pendências ---
      const pendenciasConvertidas = [];
      for (const pendencia of this.pendencias) {
        const p = { ...pendencia };
        if (p.imagem instanceof File) {
          p.imagem = await this.fileToBase64(p.imagem);
        }
        pendenciasConvertidas.push(p);
      }

      // --- 3) Descobre chave das pendências ---
      let chavePendencia = null;
      for (const element of this.chaves) {
        if (element.campo === "pendências") {
          chavePendencia = element.chave;
          break;
        }
      }

      if (chavePendencia && formDataConvertido[chavePendencia] !== undefined) {
        delete formDataConvertido[chavePendencia];
      }

      // --- 4) Se NÃO possui termo → envia com pendentes vazios ---
      if (!this.termografia) {
        return this.enviarRelatorio(
          formDataConvertido,
          pendenciasConvertidas,
          chavePendencia,
          []  // nenhum item pendente
        );
      }

      // --- 5) FINAL COM TERMO ---
      if (stepTermo === true) {

        // 5.1 – cria lista de pendências
        const itensPendentes = [];

        for (const campo of this.camposTermografias) {
          const chave = campo.chave;
          const valor = this.formData[chave];
          if (!valor) {
            itensPendentes.push({
              chave: campo.chave,
              campo: campo.campo
            });
          }
        }

        // 5.2 – se existem pendentes → pedir confirmação
        if (itensPendentes.length > 0) {
          const confirmado = await this.confirmarSemTermoDialog();
          if (!confirmado) return;

          // Envia incluindo lista completa de pendentes
          return this.enviarRelatorio(
            formDataConvertido,
            pendenciasConvertidas,
            chavePendencia,
            itensPendentes
          );
        }

        // 5.3 – converte imagens de termografia
        for (const campo of this.camposTermografias) {
          const chave = campo.chave;
          const valor = this.formData[chave];
          if (valor instanceof File) {
            formDataConvertido[chave] = await this.fileToBase64(valor);
          }
        }

        // 5.4 – nenhum pendente
        return this.enviarRelatorio(
          formDataConvertido,
          pendenciasConvertidas,
          chavePendencia,
          []
        );
      }

      // --- 6) Indo para o step de termo ---
      if (this.termografia && !stepTermo) {
        this.step = 3;
      }
    }
    ,
    async enviarRelatorio(formData, pendencias, chavePendencia, itensPendentes = []) {
      this.app
        .gerarRelatorio(
          formData,
          pendencias,
          this.modelo.id,
          chavePendencia,
          itensPendentes,
          this.nomeRelatorio   // <<=== AGORA ENVIA ARRAY COMPLETO
        )
        .then((res) => {
          if (res != false && res == 200) {
            this.dialogForm = false;
            this.alert.callAlert({
              type: "success",
              title: "Relatório gerado com sucesso!",
              text: ""
            });
            this.resetarFormulario();
          } else {
            this.alert.callAlert({
              type: "alarm",
              title: "Não foi possível gerar o relatório.",
              text: "Contate o suporte técnico."
            });
          }
        });
    },
    regraObrigatoria(v) {
      return !!v || "Campo obrigatório"
    },

    formatDate(date, controll) {
      const d = new Date(date)
      let day = controll
        ? String(d.getDate()).padStart(2, "0")
        : String(d.getDate() + 1).padStart(2, "0")
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    },

    getTodayLocalISO() {
      const now = new Date()
      const tzoffset = now.getTimezoneOffset() * 60000
      return new Date(now - tzoffset).toISOString().slice(0, 10)
    },

    setDate(key) {
      this.formData[key] = this.formatDate(this.menusData[key], true)
      this.menus[key] = false
    },
    resetarFormulario() {
      this.step = 1;

      // Zera formData
      Object.keys(this.formData).forEach(k => {
        this.formData[k] = null;
      });

      // Zera radios
      Object.keys(this.camposRadio).forEach(k => {
        this.camposRadio[k] = "";
      });

      // Zera pendências
      this.pendencias = [];

      // Zera menus de datas
      Object.keys(this.menus).forEach(k => {
        this.menus[k] = false;
      });

      Object.keys(this.menusData).forEach(k => {
        this.menusData[k] = null;
      });

      // Reseta <v-form>
      if (this.$refs.form) {
        this.$refs.form.reset();
        this.$refs.form.resetValidation();
      }
    }
  }
}
</script>

<style scoped>
.v-toolbar-title {
  width: 100%;
  text-align: center;
}

.v-sheet {
  height: 100%;
}
</style>
