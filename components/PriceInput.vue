<template>
  <div>
    <p>Price per person (From x €)</p>
    <UInput
      size="sm"
      type="number"
      v-model="modelValue.from"
      placeholder="Enter attraction address" />
  </div>
  <div
    class="flex gap-x-2 items-center"
    v-if="withDiscount">
    <p>Student discount available?</p>
    <UCheckbox v-model="modelValue.studentDiscount" />
  </div>
</template>

<script setup lang="ts">
  const model = defineModel();

  defineProps({
    withDiscount: Boolean,
  });
</script>
