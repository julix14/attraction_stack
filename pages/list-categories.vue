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
  definePageMeta({
    middleware: ["auth"],
  });
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
    return !categories.value.length > 0;
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
