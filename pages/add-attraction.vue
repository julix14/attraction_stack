<template>
  <div class="m-2">
    <p
      class="font-bold text-xl"
      v-if="id == undefined">
      Add Attraction
    </p>
    <p
      class="font-bold text-xl"
      v-else>
      Edit Attraction
    </p>
    <form @submit.prevent="addAttraction">
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
          v-model="name" />
        <AddressInput v-model="address" />
        <SocialMediaInput v-model="socialMediaLinks" />
        <InputField
          title="Website URL"
          placeholder="Enter attraction URL"
          v-model="websiteUrl" />
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
    <UModal v-model="showModal">
      <UCard>
        <template #header>
          <p class="font-bold text-xl">Checking for duplicates</p>
        </template>
        <div>
          <LoadingAnimation
            v-if="duplicates.length === 0 && duplicatesChecked === false" />
          <div v-else>
            <div
              v-if="duplicates.length > 0"
              class="gap-y-2">
              <NuxtLink
                v-for="duplicate in duplicates"
                :key="duplicate.id"
                :to="`/attraction-${duplicate.id}`"
                external
                target="_blank">
                <UCard class="m-2">
                  <p>Name: {{ duplicate.name }}</p>
                  <p>Address:</p>
                  <pre>
                    {{ JSON.stringify(duplicate.address, null, 4) }}
                  </pre>
                  <p>Website: {{ duplicate.websiteUrl }}</p>
                </UCard>
              </NuxtLink>
            </div>
            <p v-else>There are no duplicates</p>
          </div>
        </div>
        <template #footer>
          <div class="flex gap-x-2 justify-between">
            <UButton @click="closeDuplicateModel">
              Duplicates Checked - Save Activity
            </UButton>
            <UButton @click="showModal = false">Cancel</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
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
    or,
  } from "firebase/firestore";
  import { v4 as uuidv4 } from "uuid";
  import InputField from "~/components/InputField.vue";
  import SocialMediaInput from "../components/SocialMediaInput.vue";
  import AddressInput from "../components/AddressInput.vue";
  import OpeningHoursInput from "../components/OpeningHoursInput.vue";
  import PriceInput from "../components/PriceInput.vue";

  const { firestore } = useFirebaseClient();

  definePageMeta({
    middleware: ["auth"],
  });

  function resetForm() {
    isRegional.value = true;
    isSingleOnly.value = false;
    name.value = "";
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

  // Modal
  const showModal = ref(false);
  const duplicates = ref([]);

  const duplicatesChecked = ref(false);

  // Return false if there are no duplicates, True if there are duplicates
  async function checkForDuplicates() {
    if (duplicatesChecked.value || id !== undefined) {
      // Already checked for duplicates so indicate that there are no duplicates
      return false;
    }

    const activityRef = collection(firestore, "activities");

    const q = query(
      activityRef,
      or(
        where("name", "==", name.value),
        where("address", "==", address.value),
        where("googleMapsLink", "==", googleMapsLink.value),
        where("websiteUrl", "==", websiteUrl.value)
      )
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.size > 0) {
      querySnapshot.forEach((doc) => {
        duplicates.value.push(doc.data());
      });
      // There are duplicates
      return true;
    }
    // No duplicates
    return false;
  }

  function closeDuplicateModel() {
    duplicatesChecked.value = true;
    showModal.value = false;
  }

  // Firestore storing
  async function addAttraction() {
    console.log("Checking for duplicates");

    // Block the user from saving the attraction if there are duplicates
    showModal.value = true;

    const duplicatesFound = await checkForDuplicates();
    if (duplicatesFound) {
      console.log("Duplicates found");
      return;
    }

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
