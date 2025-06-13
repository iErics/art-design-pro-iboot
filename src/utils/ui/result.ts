import { BaseResponse } from '@/types'
import { h } from 'vue'
import { ElMessageBox, ElText, ElCollapse, ElCollapseItem } from 'element-plus'

export class Result {
  static tip(resp: BaseResponse, showDetail: boolean = true) {
    const { success, msg, detailMsg } = resp
    ElMessageBox({
      title: '提示',
      message: h(
        'div',
        null,
        [
          h(ElText, { type: 'danger' }, msg),
          detailMsg &&
            showDetail &&
            h(ElCollapse, { expandIconPosition: 'left' }, [
              h(ElCollapseItem, { title: '详情' }, () => h(ElText, { type: 'danger' }, detailMsg))
            ])
        ].filter(Boolean)
      ),
      confirmButtonText: '确认',
      showCancelButton: false,
      showClose: false,
      closeOnClickModal: false,
      closeOnPressEscape: false,
      type: success ? 'primary' : 'error',
      draggable: true
    })
      .then(() => {})
      .catch(() => {})
  }
}
