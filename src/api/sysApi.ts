import request from '@/utils/http'
import { BaseResponse } from '@/types/api'

export class SysService {
  // 获取系统开放配置
  static getDataByKey(params: { dataKey: string }) {
    return request.get<BaseResponse>({
      url: '/sys/public/data-config',
      params
    })
  }
}
