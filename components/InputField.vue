<template>
  <div>
    <p>{{ props.title }}</p>
    <UInput
      size="sm"
      v-model="model"
      :placeholder="props.placeholder"
      @blur="emits('blur')" />
  </div>
</template>

<script setup>
  const props = defineProps(["title", "placeholder"]);
  const model = defineModel();
  const emits = defineEmits(["blur"]);
</script>
