<script setup lang="ts">
const props = defineProps<{
  title?: string
  content?: string
}>()
</script>

<template>
  <div class="item">
    <h3>{{ props.title }}</h3>
    <p>{{ content }}</p>
  </div>
</template>
