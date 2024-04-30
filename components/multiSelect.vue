<template>
  <div class="flex flex-col w-fit">
    <p>Categories</p>
    <div
      class="flex gap-x-2 shadow-sm ring-1 ring-inset ring-gray-300 rounded-md border-0 bg-white px-2.5 py-1.5 focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:text-white dark:focus:ring-primary-400 dark:ring-gray-700 dark:placeholder-gray-500">
      <div
        class="flex items-center gap-x-2 bg-gray-200 rounded-md"
        v-for="category in selectedCategories">
        <p>{{ category.name }}</p>
        <UIcon
          name="i-heroicons-x-mark"
          @click="removeCategory(category)" />
      </div>
      <input
        id="search"
        type="text"
        v-model="search"
        @focus="showOptions = true"
        placeholder="Search categories" />
    </div>

    <select
      multiple
      v-if="showOptions">
      <option
        v-for="category in categoryOptions"
        :key="category.id"
        @click="selectCategory(category)">
        {{ category.name }}
      </option>
      <option
        v-if="categoryOptions.length === 0"
        key=""
        @click="createCategory()">
        Create category "{{ search }}"
      </option>
    </select>
  </div>
</template>

<script setup>
  import { useCollection } from "vuefire";
  import { collection } from "firebase/firestore";
  import { v4 as uuidv4 } from "uuid";
  const emits = defineEmits(["category-selected", "category-removed"]);

  function handleOutsideClick(event) {
    const inputElement = event.target.closest('input[id="search"]');
    const optionElements = event.target.closest("select");
    if (!inputElement && !optionElements) {
      showOptions.value = false;
    }
  }
  addEventListener("click", handleOutsideClick);

  const { firestore } = useFirebaseClient();
  const categories = useCollection(
    collection(firestore, "categories").withConverter({
      fromFirestore(snapshot, options) {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          name: data.name,
          selected: false,
          new: false,
        };
      },
    })
  );

  const showOptions = ref(false);
  const search = ref("");
  const selectedCategories = computed(() => {
    return categories.value.filter((category) => category.selected);
  });
  const categoryOptions = computed(() => {
    return categories.value.filter((category) => {
      return (
        category.selected === false &&
        (search.value.trim() === "" ||
          category.name.toLowerCase().includes(search.value.toLowerCase()))
      );
    });
  });

  categories.value.sort((a, b) => a.name.localeCompare(b.name));
  categories.value.forEach((category) => {
    categoryOptions.value.push(category);
  });

  function selectCategory(category) {
    category.selected = true;
    emits("category-selected", category);
    search.value = "";
  }

  function removeCategory(category) {
    category.selected = false;
    emits("category-removed", category);
    categories.value.sort((a, b) => a.name.localeCompare(b.name));
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function createCategory() {
    if (search.value.trim() === "") {
      return;
    }
    const newCategory = {
      id: uuidv4(),
      name: capitalizeFirstLetter(search.value.trim()),
      selected: true,
      new: true,
    };
    emits("category-selected", newCategory);

    categories.value.push(newCategory);
    search.value = "";
  }
</script>
