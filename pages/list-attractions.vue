<template>
  <div>
    <UTable
      :rows="rows"
      sortable
      :loading="tableLoad"
      @select="openDetails"
      class="m-2" />
    <div
      class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
      <UPagination
        v-model="page"
        :page-count="pageCount"
        :total="attractions.length" />
    </div>
  </div>
</template>

<script setup>
  definePageMeta({
    middleware: ["auth"],
  });
  import { collection } from "firebase/firestore";
  const { firestore } = useFirebaseClient();
  const attractions = useCollection(
    collection(firestore, "activities").withConverter({
      fromFirestore(snapshot, options) {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          name: data.name,
          socialMediaLink: data.socialMediaLink,
          websiteUrl: data.websiteUrl,
          price: data.price,
          address: data.address,
          isBerlin: data.isBerlin,
          isRegional: data.isRegional,
        };
      },
    }),
    { once: true }
  );

  const openDetails = (row) => {
    navigateTo(`/attraction-${row.id}`);
  };

  const tableLoad = computed(() => {
    // Don't know why this operation works in that way, but it does
    return attractions.value < true;
  });

  const page = ref(1);
  const pageCount = 20;

  const rows = computed(() => {
    return attractions.value.slice(
      (page.value - 1) * pageCount,
      page.value * pageCount
    );
  });
</script>
