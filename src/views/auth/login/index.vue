<template>
  <div class="login">
    <LoginLeftView></LoginLeftView>

    <div class="right-wrap">
      <div class="top-right-wrap">
        <div class="btn theme-btn" @click="toggleTheme">
          <i class="iconfont-sys">
            {{ isDark ? '&#xe6b5;' : '&#xe725;' }}
          </i>
        </div>
        <ElDropdown @command="changeLanguage" popper-class="langDropDownStyle">
          <div class="btn language-btn">
            <i class="iconfont-sys icon-language">&#xe611;</i>
          </div>
          <template #dropdown>
            <ElDropdownMenu>
              <div v-for="lang in languageOptions" :key="lang.value" class="lang-btn-item">
                <ElDropdownItem
                  :command="lang.value"
                  :class="{ 'is-selected': locale === lang.value }"
                >
                  <span class="menu-txt">{{ lang.label }}</span>
                  <i v-if="locale === lang.value" class="iconfont-sys icon-check">&#xe621;</i>
                </ElDropdownItem>
              </div>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>
      <div class="header">
        <ArtLogo class="icon" />
        <h1>{{ systemName }}</h1>
      </div>
      <div class="login-wrap">
        <div class="form">
          <h3 class="title">{{ $t('login.title') }}</h3>
          <p class="sub-title"
            >关注微信公号
            <el-link
              target="_blank"
              type="primary"
              underline="always"
              href="./iboot/iboot_wx_pub.jpg"
              >iboot
            </el-link>
            回复 “iboot” 获取账户密码登录体验。
          </p>
          <ElForm
            ref="formRef"
            :model="formData"
            :rules="rules"
            @keyup.enter="handleSubmit"
            style="margin-top: 25px"
          >
            <ElFormItem prop="username">
              <ElInput
                :placeholder="$t('login.placeholder[0]')"
                v-model.trim="formData.username"
                :prefix-icon="User"
              />
            </ElFormItem>
            <ElFormItem prop="password">
              <ElInput
                :placeholder="$t('login.placeholder[1]')"
                v-model.trim="formData.password"
                :prefix-icon="Lock"
                type="password"
                radius="8px"
                show-password
                autocomplete="off"
              />
            </ElFormItem>
            <div v-show="enableClickPass" class="drag-verify">
              <div class="drag-verify-content" :class="{ error: !isPassing && isClickPass }">
                <ArtDragVerify
                  ref="dragVerify"
                  v-model:value="isPassing"
                  :width="width < 500 ? 328 : 438"
                  :text="$t('login.sliderText')"
                  textColor="var(--art-gray-800)"
                  :successText="$t('login.sliderSuccessText')"
                  :progressBarBg="getCssVar('--el-color-primary')"
                  background="var(--art-gray-200)"
                  handlerBg="var(--art-main-bg-color)"
                />
              </div>
              <p class="error-text" :class="{ 'show-error-text': !isPassing && isClickPass }">{{
                $t('login.placeholder[2]')
              }}</p>
            </div>

            <div class="forget-password">
              <ElCheckbox v-model="formData.rememberPassword"
                >{{ $t('login.rememberPwd') }}
              </ElCheckbox>
              <RouterLink :to="RoutesAlias.ForgetPassword">{{ $t('login.forgetPwd') }}</RouterLink>
            </div>

            <div style="margin-top: 30px">
              <ElButton
                class="login-btn"
                type="primary"
                @click="handleSubmit"
                :loading="loading"
                v-ripple
              >
                {{ $t('login.btnText') }}
              </ElButton>
            </div>

            <div class="footer">
              <p>
                {{ $t('login.noAccount') }}
                <RouterLink :to="RoutesAlias.Register">{{ $t('login.register') }}</RouterLink>
              </p>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import AppConfig from '@/config'
  import { RoutesAlias } from '@/router/routesAlias'
  import { ElMessage, ElNotification } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import { HOME_PAGE } from '@/router/routesAlias'
  import { ApiStatus } from '@/utils/http/status'
  import { getCssVar } from '@/utils/ui'
  import { languageOptions } from '@/locales'
  import { LanguageEnum, SystemThemeEnum } from '@/enums/appEnum'
  import { useI18n } from 'vue-i18n'
  import { User, Lock } from '@element-plus/icons-vue'
  import { SysService } from '@/api/sysApi'

  defineOptions({ name: 'Login' })

  const { t } = useI18n()
  import { useSettingStore } from '@/store/modules/setting'
  import type { FormInstance, FormRules } from 'element-plus'

  const settingStore = useSettingStore()
  const { isDark, systemThemeType } = storeToRefs(settingStore)

  const dragVerify = ref()

  const userStore = useUserStore()
  const router = useRouter()
  const isPassing = ref(false)
  const isClickPass = ref(false)

  // 是否开启滑动验证
  const enableClickPass = ref(false)

  const systemName = AppConfig.systemInfo.name
  const formRef = ref<FormInstance>()

  const formData = reactive({
    username: '',
    password: '',
    rememberPassword: true
  })

  const rules = computed<FormRules>(() => ({
    username: [{ required: true, message: t('login.placeholder[0]'), trigger: 'blur' }],
    password: [{ required: true, message: t('login.placeholder[1]'), trigger: 'blur' }]
  }))

  const loading = ref(false)
  const { width } = useWindowSize()

  onMounted(async () => {
    const { data, success } = await SysService.getDataByKey({
      dataKey: 'iboot-studio.slide-validator.enabled'
    })
    if (success) {
      enableClickPass.value = 'true' === data
    }
  })

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        if (enableClickPass.value && !isPassing.value) {
          isClickPass.value = true
          return
        }

        loading.value = true

        const params = {
          userName: formData.username,
          password: formData.password,
          rememberPassword: formData.rememberPassword
        }

        try {
          const res = await UserService.login(params)

          if (res.code === ApiStatus.success) {
            const { saTokenInfo } = res.data

            if (saTokenInfo?.tokenValue) {
              userStore.setSaTokenInfo(saTokenInfo)
              const res = await UserService.getUserInfo()

              // 设置登录状态
              userStore.setLoginStatus(true)
              if (res.code === ApiStatus.success) {
                userStore.setUserInfo(res.data)
                userStore.setLoginStatus(true)
                await router.push(HOME_PAGE)
                // 登录成功提示
                showLoginSuccessNotice()
              } else {
                ElMessage.error(res.msg)
              }
            }
          } else {
            ElMessage.error(res.msg)
            loading.value = false
            resetDragVerify()
          }
        } finally {
          loading.value = false
          resetDragVerify()
        }
      }
    })
  }

  // 重置拖拽验证
  const resetDragVerify = () => {
    dragVerify.value.reset()
  }

  // 登录成功提示
  const showLoginSuccessNotice = () => {
    setTimeout(() => {
      ElNotification({
        title: t('login.success.title'),
        type: 'success',
        duration: 2500,
        zIndex: 10000,
        message: `${t('login.success.message')}, ${systemName}!`
      })
    }, 150)
  }

  // 切换语言
  const { locale } = useI18n()

  const changeLanguage = (lang: LanguageEnum) => {
    if (locale.value === lang) return
    locale.value = lang
    userStore.setLanguage(lang)
  }

  // 切换主题
  import { useTheme } from '@/composables/useTheme'
  import { UserService } from '@/api/usersApi'

  const toggleTheme = () => {
    let { LIGHT, DARK } = SystemThemeEnum
    useTheme().switchThemeStyles(systemThemeType.value === LIGHT ? DARK : LIGHT)
  }
</script>

<style lang="scss" scoped>
  @use './index';
</style>
