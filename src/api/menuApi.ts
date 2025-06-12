import { menuDataToRouter } from '@/router/utils/menuToRouter'
import { AppRouteRecord } from '@/types/router'
import request from '@/utils/http'
import { BaseResponse } from '@/types'
import { ElMessage } from 'element-plus'

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
      const { data } = await this.getUserMenu()
      const menuData = data as AppRouteRecord[]
      if (menuData.length === 0) {
        ElMessage.warning('您没有任何菜单权限，请联系系统管理员！')
      }
      // 处理菜单数据（当没有权限时需要判断 menuData 为空的情况用 ? 解决）
      const menuList = menuData?.map((route) => menuDataToRouter(route))
      return { menuList }
    } catch (error) {
      throw error instanceof Error ? error : new Error('获取菜单失败')
    }
  }
}
