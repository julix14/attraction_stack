<template>
  <div>
    <UTable
      :rows="rows"
      sortable
      :loading="tableLoad"
      @select="openDetails"
      :columns="columns"
      class="m-2" />
    <div
      class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
      <UPagination
        v-model="page"
        :page-count="pageCount"
        :total="categories.length" />
    </div>
  </div>
</template>

<script setup>
  import { collection } from "firebase/firestore";
  const { firestore } = useFirebaseClient();
  const categories = useCollection(collection(firestore, "categories"), {
    once: true,
  });

  const columns = [
    { key: "name", label: "Name" },
    { key: "id", label: "ID" },
  ];

  function openDetails(category) {
    console.log("To be implemented");
  }

  const tableLoad = computed(() => {
    // Don't know why this operation works in that way, but it does
    return categories.value < true;
  });

  const page = ref(1);
  const pageCount = 20;

  const rows = computed(() => {
    return categories.value.slice(
      (page.value - 1) * pageCount,
      page.value * pageCount
    );
  });
</script>
