<template>
  <div class="m-2 grid grid-cols-4">
    <p
      class="font-bold text-xl col-span-3 col-start-1"
      v-if="id == undefined">
      Add Attraction
    </p>
    <p
      class="font-bold text-xl col-span-3 col-start-1"
      v-else>
      Edit Attraction
    </p>
    <form
      @submit.prevent="addAttraction"
      @keydown.enter.prevent
      class="col-span-3 col-start-1">
      <div class="flex flex-col gap-y-2 mb-2">
        <div class="flex gap-x-2 items-center">
          <p>Is it regionally?</p>
          <UCheckbox v-model="isRegional" />
          <p>Is for single only?</p>
          <UCheckbox v-model="isSingleOnly" />
          <UButton
            v-if="id !== undefined"
            @click="resetForm"
            class="m-2 ml-auto">
            Back to add Form
          </UButton>
        </div>
        <InputField
          title="Name"
          placeholder="Enter attraction name"
          v-model="name"
          @blur="checkForDuplicates" />
        <InputField
          title="Found at"
          placeholder="Enter where you found it"
          v-model="foundAt" />
        <AddressInput
          v-model="address"
          @blur="checkForDuplicates" />
        <SocialMediaInput v-model="socialMediaLinks" />
        <InputField
          title="Website URL"
          placeholder="Enter attraction URL"
          v-model="websiteUrl"
          @blur="checkForDuplicates" />
        <InputField
          title="Google Maps Link"
          placeholder="Enter google Maps Link"
          v-model="googleMapsLink" />
        <PriceInput
          v-model="price"
          withDiscount />
        <MultiSelect
          @category-selected="addCategory"
          @category-removed="removeCategory" />
      </div>
      <OpeningHoursInput v-model="openingHours" />
      <UButton
        type="submit"
        class="m-2">
        Save
      </UButton>
    </form>
    <UCard class="col-span-1 col-start-4 m-2">
      <p class="font-bold">Possible duplicates:</p>

      <NuxtLink
        v-for="duplicate in possibleDuplicates"
        :key="duplicate.id"
        :to="`/attraction-${duplicate.id}`"
        external
        target="_blank">
        <UCard
          class="my-2"
          :class="conditionalDuplicateFormatting(duplicate.score)">
          <p>Name: {{ duplicate.name }}</p>
          <p>Address:</p>
          <p class="nowrap truncate">{{ duplicate.address.joined }}</p>
          <p>Website: {{ duplicate.websiteUrl }}</p>
          <p>Score: {{ Math.round(duplicate.score * 1000) / 1000 }}</p>
        </UCard>
      </NuxtLink>
      <p v-if="possibleDuplicates.length === 0">No duplicates found</p></UCard
    >
  </div>
</template>

<script setup>
  import {
    writeBatch,
    doc,
    query,
    where,
    getDocs,
    collection,
  } from "firebase/firestore";
  import { v4 as uuidv4 } from "uuid";
  import InputField from "~/components/InputField.vue";
  import SocialMediaInput from "../components/SocialMediaInput.vue";
  import AddressInput from "../components/AddressInput.vue";
  import OpeningHoursInput from "../components/OpeningHoursInput.vue";
  import PriceInput from "../components/PriceInput.vue";
  import Fuse from "fuse.js";

  const { firestore } = useFirebaseClient();

  definePageMeta({
    middleware: ["auth"],
  });

  function resetForm() {
    isRegional.value = true;
    isSingleOnly.value = false;
    name.value = "";
    foundAt.value = "";
    socialMediaLinks.value = [{ platform: "", link: "" }];
    websiteUrl.value = "";
    googleMapsLink.value = "";
    price.value = {
      from: 0,
      studentDiscount: false,
    };
    address.value = {
      street: "",
      city: "",
      postalCode: "",
      country: "Germany",
    };
    openingHours.value = {
      monday: {
        openAt: "",
        closeAt: "",
        open: true,
      },
      tuesday: {
        openAt: "",
        closeAt: "",
        open: true,
      },
      wednesday: {
        openAt: "",
        closeAt: "",
        open: true,
      },
      thursday: {
        openAt: "",
        closeAt: "",
        open: true,
      },
      friday: {
        openAt: "",
        closeAt: "",
        open: true,
      },
      saturday: {
        openAt: "",
        closeAt: "",
        open: true,
      },
      sunday: {
        openAt: "",
        closeAt: "",
        open: true,
      },
    };
    categories.value = [];
    id = undefined;
    navigateTo("/add-attraction");
  }
  // General Values
  let id;

  const isSingleOnly = ref(false);
  const isRegional = ref(true);
  const foundAt = ref("");
  const name = ref("");
  const socialMediaLinks = ref([{ platform: "", link: "" }]);
  const websiteUrl = ref("");
  const googleMapsLink = ref("");
  const price = ref({
    from: 0,
    studentDiscount: false,
  });

  const address = ref({
    street: "",
    city: "",
    postalCode: "",
    country: "Germany",
    joined: computed(() => {
      return `${address.value.street}, ${address.value.postalCode} ${address.value.city}, ${address.value.country}`;
    }),
  });

  // Opening Hours
  const openingHours = ref({
    monday: {
      openAt: "",
      closeAt: "",
      open: true,
    },
    tuesday: {
      openAt: "",
      closeAt: "",
      open: true,
    },
    wednesday: {
      openAt: "",
      closeAt: "",
      open: true,
    },
    thursday: {
      openAt: "",
      closeAt: "",
      open: true,
    },
    friday: {
      openAt: "",
      closeAt: "",
      open: true,
    },
    saturday: {
      openAt: "",
      closeAt: "",
      open: true,
    },
    sunday: {
      openAt: "",
      closeAt: "",
      open: true,
    },
  });

  // Categories
  const categories = ref([]);

  function addCategory(category) {
    categories.value.push(category);
  }

  function removeCategory(category) {
    categories.value = categories.value.filter(
      (existingCategory) => existingCategory.id !== category.id
    );
  }

  const collectionRef = useCollection(collection(firestore, "activities"));
  const possibleDuplicates = ref([]);

  const fuseOptions = {
    includeScore: true,
    ignoreLocation: true,
    keys: ["name", "websiteUrl", "address.joined"],
  };
  const fuse = new Fuse(collectionRef.value, fuseOptions);
  function checkForDuplicates() {
    const results = [];
    if (name.value.trim() !== "") {
      results.push(...fuse.search(name.value));
    }
    if (websiteUrl.value.trim() !== "") {
      results.push(...fuse.search(websiteUrl.value));
    }
    if (
      address.value.joined.replace("Germany", "").replaceAll(",", "").trim() !==
      ""
    ) {
      results.push(
        ...fuse.search(
          address.value.joined.replace("Germany", "").replaceAll(",", "").trim()
        )
      );
    }

    possibleDuplicates.value = [];
    results.forEach((result) => {
      const item = result.item;
      item.score = result.score;
      possibleDuplicates.value.push(item);
    });

    // Combine duplicates getting average score
    const duplicates = possibleDuplicates.value.reduce((acc, current) => {
      const existing = acc.find((item) => item.id === current.id);
      if (existing) {
        existing.score = (existing.score + current.score) / 2;
      } else {
        acc.push(current);
      }
      return acc;
    }, []);

    possibleDuplicates.value = duplicates;
  }

  function conditionalDuplicateFormatting(score) {
    if (score < 0.3) {
      return "bg-red-200";
    } else if (score < 0.5) {
      return "bg-yellow-200";
    } else {
      return "bg-green-200";
    }
  }

  // Firestore storing
  async function addAttraction() {
    console.log("Saving attraction");
    const categoryIds = categories.value.map((category) => category.id);

    const newCategories = categories.value.filter((category) => {
      return category.new;
    });

    newCategories.forEach((category) => {
      delete category.new;
    });

    const activity = {
      id: id || uuidv4(),
      isSingleOnly: isSingleOnly.value,
      isRegional: isRegional.value,
      name: name.value.trim(),
      foundAt: foundAt.value.trim(),
      socialMediaLinks: socialMediaLinks.value,
      websiteUrl: websiteUrl.value.trim(),
      googleMapsLink: googleMapsLink.value.trim(),
      price: price.value,
      openingHours: openingHours.value,
      address: address.value,
      categories: categoryIds,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: useCurrentUser().value.displayName,
      updatedBy: useCurrentUser().value.displayName,
    };
    try {
      const batch = writeBatch(firestore);
      const activityRef = doc(firestore, "activities", activity.id);
      batch.set(activityRef, activity);
      newCategories.forEach((category) => {
        const categoryRef = doc(firestore, "categories", category.id);
        batch.set(categoryRef, category);
      });

      await batch.commit();

      console.log("Attraction saved");

      window.location.reload();
    } catch (error) {
      console.error("Error adding attraction:", error);
    }
  }

  // Editing
  const route = useRoute();
  const idToEdit = route.query.id;

  if (idToEdit) {
    const activityRef = collection(firestore, "activities");
    const q = query(activityRef, where("id", "==", idToEdit));
    const querySnapshot = await getDocs(q);
    const attraction = querySnapshot.docs[0].data();
    // Set values
    id = idToEdit;
    if (attraction.isSingleOnly !== undefined) {
      isSingleOnly.value = attraction.isSingleOnly;
    }
    if (attraction.isRegional !== undefined) {
      isRegional.value = attraction.isRegional;
    }
    if (attraction.foundAt !== undefined) {
      foundAt.value = attraction.foundAt;
    }
    if (attraction.name !== undefined) {
      name.value = attraction.name;
    }
    if (attraction.socialMediaLinks !== undefined) {
      socialMediaLinks.value = attraction.socialMediaLinks;
    }
    if (attraction.websiteUrl !== undefined) {
      websiteUrl.value = attraction.websiteUrl;
    }
    if (attraction.googleMapsLink !== undefined) {
      googleMapsLink.value = attraction.googleMapsLink;
    }
    if (attraction.price !== undefined) {
      price.value = attraction.price;
    }
    if (attraction.address !== undefined) {
      address.value = attraction.address;
    }
    if (attraction.openingHours !== undefined) {
      openingHours.value = attraction.openingHours;
    }
    if (attraction.categories !== undefined) {
      categories.value = attraction.categories;
    }
  }
</script>
