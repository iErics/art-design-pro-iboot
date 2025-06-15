import { menuDataToRouter } from '@/router/utils/menuToRouter'
import { AppRouteRecord } from '@/types/router'
import request from '@/utils/http'
import { BaseResponse } from '@/types'

interface MenuResponse {
  menuList: AppRouteRecord[]
}

export class MenuService {
  // 获取用户菜单信息
  static getUserMenu() {
    return request.get<BaseResponse>({
      url: '/auth/getUserMenu'
    })
  }

  // 获取菜单列表
  static async getMenuList(): Promise<MenuResponse> {
    try {
      const menuData = (await this.getUserMenu()).data as AppRouteRecord[]
      // 处理菜单数据（当没有权限时需要判断 menuData 为空的情况用 ? 解决）
      const menuList = menuData?.map((route) => menuDataToRouter(route))
      return { menuList }
    } catch (error) {
      throw error instanceof Error ? error : new Error('获取菜单失败')
    }
  }
}
