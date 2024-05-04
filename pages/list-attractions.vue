<template>
  <div>
    <UTable
      :rows="rows"
      :columns="columns"
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
          websiteUrl: data.websiteUrl,
          price: formatPrice(data.price),
          address: formatAddress(data.address),
          isBerlin: data.isBerlin,
          isRegional: data.isRegional,
        };
      },
    }),
    { once: true }
  );

  const openDetails = (row) => {
    navigateTo(`/add-attraction?id=${row.id}`);
  };

  function formatAddress(address) {
    return `${address.street}, ${address.postalCode} ${address.city}`;
  }

  function formatPrice(price) {
    const priceLabel = price.studentDiscount
      ? "Free (Student Discount)"
      : "Free";
    if (price.from === 0 || !price.from) return priceLabel;

    return (
      "From " +
      price.from +
      " €" +
      (price.studentDiscount ? " (Student Discount)" : "")
    );
  }

  const tableLoad = computed(() => {
    return !attractions.value.length > 0;
  });

  const page = ref(1);
  const pageCount = 20;

  const rows = computed(() => {
    return attractions.value.slice(
      (page.value - 1) * pageCount,
      page.value * pageCount
    );
  });

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "websiteUrl",
      label: "Website",
      sortable: true,
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
    },
    {
      key: "address",
      label: "Address",
      sortable: true,
    },
    {
      key: "isBerlin",
      label: "Berlin",
      sortable: true,
    },
    {
      key: "isRegional",
      label: "Regional",
      sortable: true,
    },
  ];
</script>
