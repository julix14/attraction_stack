<template>
  <div>
    <UTable
      :rows="rows"
      :columns="columns"
      :loading="tableLoad"
      class="m-2">
      <template #actions-data="{ row }">
        <UDropdown :items="items(row)">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-ellipsis-horizontal-20-solid" />
        </UDropdown>
      </template>
    </UTable>
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
  import { collection, doc, deleteDoc } from "firebase/firestore";

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
    })
  );

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
    {
      key: "actions",
    },
  ];

  const items = (row) => [
    [
      {
        label: "View JSON",
        icon: "i-heroicons-code-bracket",
        click: () => navigateTo(`/attraction-${row.id}`),
      },
      {
        label: "Edit",
        icon: "i-heroicons-pencil-square",
        click: () => navigateTo(`/add-attraction?id=${row.id}`),
      },
    ],
    [
      {
        label: "Delete",
        icon: "i-heroicons-trash-20-solid",
        click: () => {
          if (confirm("Are you sure you want to delete this attraction?")) {
            deleteItem(row.id);
          }
        },
      },
    ],
  ];

  const deleteItem = async (id) => {
    await deleteDoc(doc(firestore, "activities", id));
    navigateTo("/list-attractions");
  };
</script>
