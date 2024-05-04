<template>
  <div>
    <p>Address</p>
    <UInput
      size="sm"
      v-model="modelValue.street"
      placeholder="Enter attraction address"
      @blur="emits('blur')" />
    <div class="flex min-w-full gap-x-2 mt-1">
      <UInput
        class="grow"
        size="sm"
        v-model="modelValue.postalCode"
        placeholder="Postal Code"
        @blur="emits('blur')" />
      <UInput
        class="grow"
        size="sm"
        v-model="modelValue.city"
        placeholder="City"
        @blur="emits('blur')" />
    </div>
  </div>
</template>

<script setup>
  const model = defineModel();
  const emits = defineEmits(["blur"]);
</script>
