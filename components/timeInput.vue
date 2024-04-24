<template>
  <div>
    <p class="font-bold">{{ day }}:</p>
    <div class="flex flex-row items-center">
      <UInput
        size="sm"
        class="mx-2 w-22"
        type="time"
        v-model="openingHours.openAt"
        :disabled="!openingHours.open" />
      <p>bis</p>
      <UInput
        size="sm"
        class="mx-2 w-22"
        v-model="openingHours.closeAt"
        type="time"
        :disabled="!openingHours.open" />
      <UToggle
        v-model="openingHours.open"
        @change="disableInputWhenClosed" />
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    openingHours: Object,
    day: String,
  });

  function disableInputWhenClosed() {
    if (!props.openingHours.open) {
      props.openingHours.openAt = "";
      props.openingHours.closeAt = "";
    }
  }
</script>
