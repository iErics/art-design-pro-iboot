<template>
  <div class="app-container">
    <div class="canvas-editor"></div>
    <input type="file" name="file-docx" id="file-docx" accept=".docx" />
    <input type="file" name="file-excel" id="file-excel" accept=".xlsx" />
  </div>
</template>

<script setup>
  import { onMounted } from 'vue'
  import Editor, { ElementType } from '@hufe921/canvas-editor'
  import barcode1dPlugin from '@hufe921/canvas-editor-plugin-barcode1d'
  import barcode2dPlugin from '@hufe921/canvas-editor-plugin-barcode2d'
  import codeblockPlugin from '@hufe921/canvas-editor-plugin-codeblock'
  import docxPlugin from '@hufe921/canvas-editor-plugin-docx'
  import excelPlugin from '@hufe921/canvas-editor-plugin-excel'
  import floatingToolbarPlugin from '@hufe921/canvas-editor-plugin-floating-toolbar'
  import diagramPlugin from '@hufe921/canvas-editor-plugin-diagram'
  import casePlugin from '@hufe921/canvas-editor-plugin-case'

  let instance = (reactive < Editor) | (null > null)

  onMounted(() => {
    instance = new Editor(document.querySelector('.canvas-editor'), {
      main: [
        {
          value:
            '右键插入条形码、二维码、代码块、导出/导出word文档、导入excel、绘制流程图、转换大/小写；选择文本查看悬浮工具栏'
        },
        {
          value:
            '\nRight-click to insert barcode, QR code, code block, and export/import docx, load diagram, convert uppercase and lowercase; select text to view floating toolbar.'
        }
      ]
    })

    instance.use(barcode1dPlugin)
    instance.use(barcode2dPlugin)
    instance.use(codeblockPlugin)
    instance.use(docxPlugin)
    instance.use(excelPlugin)
    instance.use(floatingToolbarPlugin)
    instance.use(diagramPlugin)
    instance.use(casePlugin)

    const docxFileInput = document.querySelector('#file-docx')
    const excelFileInput = document.querySelector('#file-excel')

    instance.register.contextMenuList([
      {
        name: '插入条形码',
        when: (payload) => {
          return !payload.isReadonly && payload.editorTextFocus
        },
        callback: (command) => {
          const content = window.prompt('请输入内容')
          command.executeInsertBarcode1D(content, 200, 100)
        }
      },
      {
        name: '插入二维码',
        when: (payload) => {
          return !payload.isReadonly && payload.editorTextFocus
        },
        callback: (command) => {
          const content = window.prompt('请输入内容')
          command.executeInsertBarcode2D(content, 200, 200)
        }
      },
      {
        name: '插入代码块',
        when: (payload) => {
          return !payload.isReadonly && payload.editorTextFocus
        },
        callback: (command) => {
          const content = window.prompt('请输入内容')
          command.executeInsertCodeblock(content)
        }
      },
      {
        name: '导出文档',
        when: (payload) => true,
        callback: (command) => {
          command.executeExportDocx({
            fileName: 'canvas-editor'
          })
        }
      },
      {
        name: '导入文档',
        when: (payload) => true,
        callback: (command) => {
          docxFileInput.click()
        }
      },
      {
        name: '导入excel',
        when: (payload) => true,
        callback: (command) => {
          excelFileInput.click()
        }
      },
      {
        name: '打开/编辑流程图',
        when: (payload) => {
          return !payload.isReadonly && payload.editorTextFocus
        },
        callback: (command, context) => {
          const extension = context.startElement?.extension
          const data = extension?.name === 'diagram' ? extension.xml : ''
          command.executeLoadDiagram({
            data,
            onDestroy: (message) => {
              if (!message || !message.data) return
              const { bounds } = message
              if (!data) {
                // 新增
                command.executeInsertElementList([
                  {
                    type: ElementType.IMAGE,
                    width: bounds.width,
                    height: bounds.height,
                    value: message.data,
                    extension: {
                      name: 'diagram',
                      xml: message.xml
                    }
                  }
                ])
              } else {
                // 更新
                command.executeUpdateElementById({
                  id: context.startElement.id,
                  properties: {
                    width: bounds.width,
                    height: bounds.height,
                    value: message.data,
                    extension: {
                      name: 'diagram',
                      xml: message.xml
                    }
                  }
                })
              }
            }
          })
        }
      },
      {
        name: '转成大写',
        when: (payload) => {
          return !payload.isReadonly && payload.editorHasSelection
        },
        callback: (command) => {
          command.executeUpperCase()
        }
      },
      {
        name: '转成小写',
        when: (payload) => {
          return !payload.isReadonly && payload.editorHasSelection
        },
        callback: (command) => {
          command.executeLowerCase()
        }
      }
    ])

    docxFileInput.onchange = () => {
      const file = docxFileInput?.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (event) => {
        const buffer = event?.target?.result
        if (buffer instanceof ArrayBuffer) {
          instance.command.executeImportDocx({
            arrayBuffer: buffer
          })
        }
        docxFileInput.value = ''
      }
      reader.readAsArrayBuffer(file)
    }

    excelFileInput.onchange = () => {
      const file = excelFileInput?.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (event) => {
        const buffer = event?.target?.result
        if (buffer instanceof ArrayBuffer) {
          instance.command.executeImportExcel({
            arrayBuffer: buffer
          })
        }
        excelFileInput.value = ''
      }
      reader.readAsArrayBuffer(file)
    }
  })
</script>

<style scoped>
  input[type='file'] {
    display: none;
  }

  .app-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
