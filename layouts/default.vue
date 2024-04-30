<template>
  <div>
    <header>
      <UHorizontalNavigation
        :links="links"
        class="border-b border-gray-200 dark:border-gray-800" />
    </header>
    <slot> </slot>
  </div>
</template>

<script setup>
  const links = [
    { label: "Home", to: "/", icon: "i-heroicons-home" },
    {
      label: "Add Attraction",
      to: "/add-attraction",
      icon: "i-heroicons-plus-circle",
    },
    {
      label: "List Attractions",
      to: "/list-attractions",
      icon: "i-heroicons-list-bullet",
    },
    {
      label: "List Categories",
      to: "/list-categories",
      icon: "i-heroicons-list-bullet",
    },
  ];
</script>
