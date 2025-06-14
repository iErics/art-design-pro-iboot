import request from '@/utils/http'
import { BaseResponse } from '@/types/api'

interface LoginParams {
  userName: string
  password: string
}

interface UserListParams {
  current?: number
  size?: number
}

interface UserAddOrUpdateParams {
  userId?: string
  userName: string
  realName: string
  gender?: number
  email?: string
  mobile?: string
  avatar?: string
  intro?: string
  roleIds?: string[]
}

export class UserService {
  // 登录
  static login(params: LoginParams) {
    return request.post<BaseResponse>({
      url: '/auth/login',
      params
    })
  }

  // 登出
  static logout() {
    return request.post<BaseResponse>({
      url: '/auth/logout'
    })
  }

  // 获取用户信息
  static getUserInfo() {
    return request.get<BaseResponse>({
      url: '/user/info'
    })
  }

  // 获取用户列表
  static getUserPageList(params?: UserListParams) {
    return request.get<BaseResponse>({
      url: '/user/page',
      params
    })
  }

  // 新增或修改用户
  static saveOrUpdate(data?: UserAddOrUpdateParams) {
    return request.post<BaseResponse>({
      url: '/user/saveOrUpdate',
      data
    })
  }
}
