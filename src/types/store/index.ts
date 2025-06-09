/**
 * Store相关类型定义
 */

import { MenuThemeEnum, SystemThemeEnum } from '@/enums/appEnum'
import { LocationQueryRaw } from 'vue-router'

// 用户 saToken 信息
export interface SaTokenInfo {
  loginId: string // 此 token 对应的 LoginId，未登录时为 null，后端给的是 userId 返回
  isLogin: boolean // 此 token 是否已经登录
  tokenName: string // token 名称
  tokenValue: string // token 值
  loginType: string // 多账号体系下的账号类型
  tokenTimeout: string // token 剩余有效期（单位: 秒）
  sessionTimeout: string // Account-Session 剩余有效时间（单位: 秒）
  tokenSessionTimeout: string // Token-Session 剩余有效时间（单位: 秒）
  tokenActiveTimeout: string // token 距离被冻结还剩多少时间（单位: 秒
  loginDeviceType: string // 登录设备类型
  tag: string //自定义数据（暂无意义，留作扩展）
}

// 用户信息
export interface UserInfo {
  userId: number
  userName: string
  roles: string[]
  buttons: string[]
  avatar?: string
  email?: string
  phone?: string
}

// 系统主题样式（light | dark）
export interface SystemThemeType {
  className: string
}

// 定义包含多个主题的类型
export type SystemThemeTypes = {
  [key in Exclude<SystemThemeEnum, SystemThemeEnum.AUTO>]: SystemThemeType
}

// 菜单主题样式
export interface MenuThemeType {
  theme: MenuThemeEnum
  background: string
  systemNameColor: string
  textColor: string
  textActiveColor: string
  iconColor: string
  iconActiveColor: string
  tabBarBackground: string
  systemBackground: string
  leftLineColor: string
  rightLineColor: string
  img?: string
}

// 设置中心
export interface SettingState {
  theme: string
  uniqueOpened: boolean
  menuButton: boolean
  showRefreshButton: boolean
  showCrumbs: boolean
  autoClose: boolean
  showWorkTab: boolean
  showLanguage: boolean
  showNprogress: boolean
  themeModel: string
}

// 多标签
export interface WorkTab {
  title: string
  path: string
  name: string
  keepAlive: boolean
  fixedTab?: boolean
  params?: object
  query?: LocationQueryRaw
  icon?: string
  isActive?: boolean
}

// 用户Store状态
export interface UserState {
  userInfo: UserInfo | null
  token: string | null
  roles: string[]
  permissions: string[]
}

// 设置Store状态
export interface SettingStoreState extends SettingState {
  // 额外的设置状态
  collapsed: boolean
  device: 'desktop' | 'mobile'
  language: string
}

// 工作标签页Store状态
export interface WorkTabState {
  tabs: WorkTab[]
  activeTab: string
  cachedTabs: string[]
}

// 菜单Store状态
export interface MenuState {
  menuList: any[]
  isLoaded: boolean
  collapsed: boolean
}

// 根Store状态类型
export interface RootState {
  user: UserState
  setting: SettingStoreState
  workTab: WorkTabState
  menu: MenuState
}
