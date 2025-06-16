<template>
  <div class="page-content">
    <umo-editor v-bind="defaultOptions" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  import { UmoEditor } from '@umoteam/editor'

  const defaultOptions = ref({})
</script>
