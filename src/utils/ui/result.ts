import { BaseResponse } from '@/types'
import { h } from 'vue'
import { ElMessageBox, ElText, ElCollapse, ElCollapseItem, ElMessage } from 'element-plus'

export class Result {
  static async tip(resp: BaseResponse, showDetail: boolean = true) {
    const { msg, detailMsg } = resp

    // 辅助函数：复制文本到剪贴板并提供反馈
    const copyToClipboardWithFeedback = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        ElMessage.success('已复制详情到剪切板')
      } catch (err) {
        console.error('Failed to copy text: ', err)
        ElMessage.error('复制失败')
      }
    }

    ElMessageBox({
      title: '操作提示',
      message: h(
        'div',
        null,
        [
          h(ElText, { type: 'danger' }, msg),
          detailMsg &&
            showDetail &&
            h(
              ElCollapse,
              {
                expandIconPosition: 'left'
              },
              [
                h(
                  ElCollapseItem,
                  {
                    title: '详情',
                    style: {
                      maxHeight: '600px',
                      overflowY: 'auto'
                    }
                  },
                  () => h(ElText, { type: 'danger' }, detailMsg)
                )
              ]
            )
        ].filter(Boolean)
      ),
      confirmButtonText: '确认',
      cancelButtonText: '复制',
      showCancelButton: showDetail && Boolean(detailMsg),
      showClose: false,
      closeOnClickModal: false,
      closeOnPressEscape: false,
      draggable: true
    })
      .then(() => {})
      .catch((action) => {
        // ElMessageBox 的 catch 回调会收到点击的按钮类型，'cancel' 对应复制按钮
        if (action === 'cancel' && detailMsg) {
          copyToClipboardWithFeedback(detailMsg)
        }
      })
  }
}
