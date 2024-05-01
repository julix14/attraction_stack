<template>
  <div>
    <p>{{ props.title }}</p>
    <UInput
      size="sm"
      v-model="model"
      :placeholder="props.placeholder" />
  </div>
</template>

<script setup>
  const props = defineProps(["title", "placeholder"]);
  const model = defineModel();
</script>
