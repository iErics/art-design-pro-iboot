import request from '@/utils/http'
import { BaseResponse } from '@/types/api'

interface RoleQueryParams {
  roleName?: string
  roleCode?: string
  current?: number
  size?: number
}

export class RoleService {
  // 获取角色列表
  static getRolePageList(params?: RoleQueryParams) {
    return request.get<BaseResponse>({
      url: '/role/page',
      params
    })
  }
}
