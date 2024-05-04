<template>
  <div>
    <p>Address</p>
    <UInput
      size="sm"
      v-model="modelValue.street"
      placeholder="Enter attraction address" />
    <div class="flex min-w-full gap-x-2 mt-1">
      <UInput
        class="grow"
        size="sm"
        v-model="modelValue.postalCode"
        placeholder="Postal Code" />
      <UInput
        class="grow"
        size="sm"
        v-model="modelValue.city"
        placeholder="City" />
    </div>
  </div>
</template>

<script setup>
  const model = defineModel();
</script>
