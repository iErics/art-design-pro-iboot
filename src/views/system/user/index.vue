<template>
  <ArtTableFullScreen>
    <div class="account-page" id="table-full-screen">
      <!-- 搜索栏 -->
      <ArtSearchBar
        v-model:filter="formFilters"
        :items="formItems"
        @reset="handleReset"
        @search="handleSearch"
      ></ArtSearchBar>

      <ElCard shadow="never" class="art-table-card">
        <!-- 表格头部 -->
        <ArtTableHeader
          :columnList="columnOptions"
          v-model:columns="columnChecks"
          @refresh="handleRefresh"
        >
          <template #left>
            <ElButton @click="showDialog('add')">新增用户</ElButton>
          </template>
        </ArtTableHeader>

        <!-- 表格 -->
        <ArtTable
          ref="tableRef"
          row-key="id"
          :loading="loading"
          :data="tableData"
          :currentPage="pagination.currentPage"
          :pageSize="pagination.pageSize"
          :total="pagination.total"
          :marginTop="10"
          @selection-change="handleSelectionChange"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        >
          <template #default>
            <ElTableColumn v-for="col in columns" :key="col.prop || col.type" v-bind="col" />
          </template>
        </ArtTable>

        <ElDialog
          v-model="dialogVisible"
          :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
          width="30%"
          align-center
        >
          <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
            <ElFormItem label="用户名" prop="userName">
              <ElInput v-model="formData.userName" />
            </ElFormItem>
            <ElFormItem label="姓名" prop="realName">
              <ElInput v-model="formData.realName" />
            </ElFormItem>
            <ElFormItem label="手机号" prop="mobile">
              <ElInput v-model="formData.mobile" />
            </ElFormItem>
            <ElFormItem label="邮箱" prop="email">
              <ElInput v-model="formData.email" />
            </ElFormItem>
            <ElFormItem label="性别" prop="gender">
              <ElSelect v-model="formData.gender">
                <ElOption
                  v-for="item in genderOptions"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="角色" prop="role">
              <ElSelect v-model="formData.roleIds" multiple>
                <ElOption
                  v-for="role in roleList"
                  :key="role.roleId"
                  :value="role.roleId"
                  :label="role.roleName"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="简介" prop="intro">
              <ElInput v-model="formData.intro" :rows="2" type="textarea" />
            </ElFormItem>
          </ElForm>
          <template #footer>
            <div class="dialog-footer">
              <ElButton @click="dialogVisible = false">取消</ElButton>
              <ElButton type="primary" @click="handleSubmit">提交</ElButton>
            </div>
          </template>
        </ElDialog>
      </ElCard>
    </div>
  </ArtTableFullScreen>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import type { FormRules } from 'element-plus'
  import { ElDialog, ElMessage, ElMessageBox, ElTag, FormInstance } from 'element-plus'
  import { useCheckedColumns } from '@/composables/useCheckedColumns'
  import ArtButtonTable from '@/components/core/forms/ArtButtonTable.vue'
  import { UserService } from '@/api/usersApi'
  import { ApiStatus } from '@/utils/http/status'
  import { Option, SearchChangeParams, SearchFormItem } from '@/types'
  import { RoleService } from '@/api/roleApi'
  import { SysService } from '@/api/sysApi'
  import { generateAvatar } from '@/utils/ui/random-avatar'

  defineOptions({ name: 'User' }) // 定义组件名称，用于 KeepAlive 缓存控制

  const genderOptions = ref<Option[]>([])

  const dialogType = ref('add')
  const dialogVisible = ref(false)
  const loading = ref(false)

  // 定义表单搜索初始值
  const initialSearchState = {
    name: '',
    phone: '',
    address: '',
    level: '',
    email: '',
    date: '',
    daterange: '',
    status: '1'
  }

  const roleList = ref<any[]>([])

  // 响应式表单数据
  const formFilters = reactive({ ...initialSearchState })

  const pagination = reactive({
    currentPage: 1,
    pageSize: 20,
    total: 0
  })

  // 表格数据
  const tableData = ref<any[]>([])

  // 表格实例引用
  const tableRef = ref()

  // 选中的行数据
  const selectedRows = ref<any[]>([])

  // 重置表单
  const handleReset = () => {
    Object.assign(formFilters, { ...initialSearchState })
    pagination.currentPage = 1 // 重置到第一页
    getUserList()
  }

  // 搜索处理
  const handleSearch = () => {
    console.log('搜索参数:', formFilters)
    pagination.currentPage = 1 // 搜索时重置到第一页
    getUserList()
  }

  // 表单项变更处理
  const handleFormChange = (params: SearchChangeParams): void => {
    console.log('表单项变更:', params)
  }

  // 表单配置项
  const formItems: SearchFormItem[] = [
    {
      label: '用户名',
      prop: 'name',
      type: 'input',
      config: {
        clearable: true
      },
      onChange: handleFormChange
    },

    {
      label: '电话',
      prop: 'phone',
      type: 'input',
      config: {
        clearable: true
      },
      onChange: handleFormChange
    },
    {
      label: '用户等级',
      prop: 'level',
      type: 'select',
      config: {
        clearable: true
      },
      options: () => [
        { label: '普通用户', value: 'normal' },
        { label: 'VIP用户', value: 'vip' },
        { label: '高级VIP', value: 'svip' },
        { label: '企业用户', value: 'enterprise', disabled: true }
      ],
      onChange: handleFormChange
    },
    {
      label: '地址',
      prop: 'address',
      type: 'input',
      config: {
        clearable: true
      },
      onChange: handleFormChange
    },
    {
      label: '邮箱',
      prop: 'email',
      type: 'input',
      config: {
        clearable: true
      },
      onChange: handleFormChange
    },
    // 支持 9 种日期类型定义
    // 具体可参考 src/components/core/forms/art-search-bar/widget/art-search-date/README.md
    {
      prop: 'date',
      label: '日期',
      type: 'date',
      config: {
        type: 'date',
        placeholder: '请选择日期'
      }
    },
    {
      prop: 'daterange',
      label: '日期范围',
      type: 'daterange',
      config: {
        type: 'daterange',
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间'
      }
    },
    {
      label: '状态',
      prop: 'status',
      type: 'radio',
      options: [
        { label: '在线', value: '1' },
        { label: '离线', value: '2' }
      ],
      onChange: handleFormChange
    }
  ]

  // 列配置
  const columnOptions = [
    { label: '勾选', type: 'selection' },
    { label: '用户名', prop: 'avatar' },
    { label: '手机号', prop: 'mobile' },
    { label: '性别', prop: 'gender' },
    { label: '角色', prop: 'role' },
    { label: '状态', prop: 'userStatus' },
    { label: '创建日期', prop: 'createTime' },
    { label: '操作', prop: 'operation' }
  ]

  // 获取标签类型
  // 0：禁用 1: 启用 2: 离线 3: 异常 4: 注销
  const getTagType = (status: number) => {
    switch (status) {
      case 1:
        return 'success'
      case 2:
        return 'info'
      case 3:
        return 'warning'
      case 0:
        return 'danger'
      default:
        return 'info'
    }
  }

  // 构建标签文本
  const buildTagText = (status: number) => {
    let text = ''
    if (status === 0) {
      text = '禁用'
    } else if (status === 1) {
      text = '启用'
    } else if (status === 3) {
      text = '异常'
    } else if (status === 4) {
      text = '注销'
    }
    return text
  }

  // 显示对话框
  const showDialog = (type: string, row?: any) => {
    dialogVisible.value = true
    dialogType.value = type

    // 重置表单验证状态
    if (formRef.value) {
      formRef.value.resetFields()
    }

    if (type === 'edit' && row) {
      formData.value = { ...row }

      // 将用户角色代码数组直接赋值给formData.role
      formData.value.roleIds = Array.isArray(row.userRoles) ? row.userRoles : []
    } else {
      formData.value.userName = ''
      formData.value.mobile = ''
      formData.value.gender = 0
      formData.value.roleIds = []
    }
  }

  // 删除用户
  const deleteUser = () => {
    ElMessageBox.confirm('确定要注销该用户吗？', '注销用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      ElMessage.success('注销成功')
    })
  }

  // 动态列配置
  const { columnChecks, columns } = useCheckedColumns(() => [
    { type: 'selection' }, // 勾选列
    // { type: 'expand', label: '展开', width: 80 }, // 展开列
    // { type: 'index', label: '序号', width: 80 }, // 序号列
    {
      prop: 'avatar',
      label: '用户名',
      minWidth: 220,
      formatter: (row: any) => {
        return h('div', { class: 'user', style: 'display: flex; align-items: center' }, [
          row.avatar
            ? h('img', { class: 'avatar', src: row.avatar })
            : generateAvatar(row.realName),
          h('div', {}, [
            h('p', { class: 'user-name' }, `${row.realName} | ${row.userName}`),
            h('p', { class: 'email' }, row.email)
          ])
        ])
      }
    },
    {
      prop: 'gender',
      label: '性别',
      sortable: true,
      formatter: (row) => {
        const option = genderOptions.value.find((item) => item.value === row.gender)
        return option?.label || '未知'
      }
    },
    { prop: 'mobile', label: '手机号' },
    {
      prop: 'userStatus',
      label: '状态',
      formatter: (row) => {
        return h(ElTag, { type: getTagType(row.userStatus) }, () => buildTagText(row.userStatus))
      }
    },
    {
      prop: 'createTime',
      label: '创建日期',
      sortable: true
    },
    {
      prop: 'operation',
      label: '操作',
      width: 150,
      // fixed: 'right', // 固定在右侧
      // disabled: true,
      formatter: (row: any) => {
        return h('div', [
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => showDialog('edit', row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => deleteUser()
          })
        ])
      }
    }
  ])

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = ref({
    userId: '',
    userName: '',
    realName: '',
    gender: 1,
    email: '',
    mobile: '',
    avatar: '',
    intro: '',
    roleIds: [] as string[]
  })

  onMounted(() => {
    getUserList()
    getRoleList()
    getGenderOptions()
  })

  const getGenderOptions = async () => {
    const { success, data, msg } = await SysService.getOptions({ name: 'gender' })
    if (!success) {
      return ElMessage.error(msg)
    }
    // 根据选项名称动态获取对应的选项数组
    genderOptions.value = data.find((item: any) => item.name === 'gender')?.options || []
  }

  // 获取用户信息
  const getUserList = async () => {
    loading.value = true
    try {
      const params = {
        current: pagination.currentPage,
        size: pagination.pageSize
      }
      const res = await UserService.getUserPageList(params)
      if (res.code === ApiStatus.success) {
        // 使用本地头像替换接口返回的头像
        tableData.value = res.data.records /*.map((item: any, index: number) => {
          const avatarIndex = index % ACCOUNT_TABLE_DATA.length
          return {
            ...item,
            avatar: ACCOUNT_TABLE_DATA[avatarIndex].avatar
          }
        })*/
        loading.value = false

        pagination.currentPage = res.data.current
        pagination.pageSize = res.data.size
        pagination.total = res.data.total
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
      loading.value = false
    }
  }

  const getRoleList = async () => {
    const res = await RoleService.getRolePageList({})
    if (res.success) {
      roleList.value = res.data.records
    } else {
      ElMessage.error(res.msg)
    }
  }

  const handleRefresh = () => {
    getUserList()
  }

  // 处理表格行选择变化
  const handleSelectionChange = (selection: any[]) => {
    selectedRows.value = selection
  }

  // 表单验证规则
  const rules = reactive<FormRules>({
    userName: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    mobile: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    roleIds: [{ required: true, message: '请选择角色', trigger: 'change' }]
  })

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) {
      return
    }

    try {
      await formRef.value.validate()
      const { success, msg } = await UserService.saveOrUpdate(formData.value)
      if (!success) {
        return ElMessage.error(msg)
      }
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
      dialogVisible.value = false
      await getUserList()
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  // 处理表格分页变化
  const handleSizeChange = (newPageSize: number) => {
    pagination.pageSize = newPageSize
    getUserList()
  }

  const handleCurrentChange = (newCurrentPage: number) => {
    pagination.currentPage = newCurrentPage
    getUserList()
  }
</script>

<style lang="scss" scoped>
  .account-page {
    :deep(.user) {
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 6px;
      }

      > div {
        margin-left: 10px;

        .user-name {
          font-weight: 500;
          color: var(--art-text-gray-800);
        }
      }
    }
  }
</style>
