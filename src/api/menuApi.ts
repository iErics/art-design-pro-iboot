import { asyncRoutes } from '@/router/routes/asyncRoutes'
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

// 菜单接口
export const menuService = {
  async getMenuList(delay = 300): Promise<MenuResponse> {
    try {
      // 模拟接口返回的菜单数据
      const menuData = asyncRoutes
      // 处理菜单数据
      const menuList = menuData.map((route) => menuDataToRouter(route))
      // 模拟接口延迟
      await new Promise((resolve) => setTimeout(resolve, delay))

      return { menuList }
    } catch (error) {
      throw error instanceof Error ? error : new Error('获取菜单失败')
    }
  }
}
