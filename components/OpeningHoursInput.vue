<template>
  <div class="flex flex-col">
    <p class="font-bold text-xl">Opening Hours</p>
    <div class="flex flex-col gap-y-2 overflow-hidden">
      <div class="flex flex-row gap-x-2">
        <TimeInput
          day="Monday"
          :opening-hours="modelValue.monday" />
        <UButton @click="fillOpeningHours">
          Copy opening hours for all days</UButton
        >
      </div>
      <TimeInput
        day="Tuesday"
        :opening-hours="modelValue.tuesday" />
      <TimeInput
        day="Wednesday"
        :opening-hours="modelValue.wednesday" />
      <TimeInput
        day="Thursday"
        :opening-hours="modelValue.thursday" />
      <TimeInput
        day="Friday"
        :opening-hours="modelValue.friday" />
      <TimeInput
        day="Saturday"
        :opening-hours="modelValue.saturday" />
      <TimeInput
        day="Sunday"
        :opening-hours="modelValue.sunday" />
    </div>
  </div>
</template>

<script setup>
  const openingHours = defineModel();

  function fillOpeningHours() {
    console.log("Filling opening hours");

    const days = [
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    days.forEach((day) => {
      openingHours.value[day] = JSON.parse(
        JSON.stringify(openingHours.value["monday"])
      );
    });
  }
</script>
