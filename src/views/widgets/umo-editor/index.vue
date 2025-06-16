<template>
  <div class="page-content">
    <umo-editor v-bind="defaultOptions" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { UmoEditor } from '@umoteam/editor'

  const defaultOptions = ref({})
</script>
