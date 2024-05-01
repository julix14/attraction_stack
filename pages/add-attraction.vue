<template>
  <div class="m-2">
    <p class="font-bold text-xl">Add Attraction</p>

    <form @submit.prevent="addAttraction">
      <div class="flex flex-col gap-y-2 mb-2">
        <div class="flex gap-x-2">
          <p>Is it regionally?</p>
          <UCheckbox v-model="isRegional" />
          <p>Is for single only?</p>
          <UCheckbox v-model="isSingleOnly" />
        </div>
        <InputField
          title="Name"
          placeholder="Enter attraction name"
          v-model="name" />
        <div>
          <p>Address</p>
          <UInput
            size="sm"
            v-model="address.street"
            placeholder="Enter attraction address" />
          <div class="flex min-w-full gap-x-2 mt-1">
            <UInput
              class="grow"
              size="sm"
              v-model="address.postalCode"
              placeholder="Postal Code" />
            <UInput
              class="grow"
              size="sm"
              v-model="address.city"
              placeholder="City" />
          </div>
        </div>
        <SocialMediaInput v-model="socialMediaLinks" />
        <div>
          <p>Website URL</p>
          <UInput
            size="sm"
            v-model="websiteUrl"
            placeholder="Enter attraction address" />
        </div>
        <div>
          <p>Google Maps Link</p>
          <UInput
            size="sm"
            v-model="googleMapsLink"
            placeholder="Enter attraction address" />
        </div>
        <div>
          <p>Price per person (From x €)</p>
          <UInput
            size="sm"
            type="number"
            v-model="price.from"
            placeholder="Enter attraction address" />
        </div>
        <div class="flex gap-x-2 items-center">
          <p>Student discount available?</p>
          <UCheckbox v-model="price.studentDiscount" />
        </div>
        <MultiSelect
          @category-selected="addCategory"
          @category-removed="removeCategory" />
      </div>

      <div class="flex flex-col">
        <p class="font-bold text-xl">Opening Hours</p>
        <div class="flex flex-col gap-y-2 overflow-hidden">
          <div class="flex flex-row gap-x-2">
            <TimeInput
              day="Monday"
              :opening-hours="openingHours.monday" />
            <UButton @click="fillOpeningHours">
              Copy opening hours for all days</UButton
            >
          </div>
          <TimeInput
            day="Tuesday"
            :opening-hours="openingHours.tuesday" />
          <TimeInput
            day="Wednesday"
            :opening-hours="openingHours.wednesday" />
          <TimeInput
            day="Thursday"
            :opening-hours="openingHours.thursday" />
          <TimeInput
            day="Friday"
            :opening-hours="openingHours.friday" />
          <TimeInput
            day="Saturday"
            :opening-hours="openingHours.saturday" />
          <TimeInput
            day="Sunday"
            :opening-hours="openingHours.sunday" />
        </div>
      </div>
      <UButton
        type="submit"
        class="m-2">
        Save
      </UButton>
    </form>
    <UModal
      v-model="showModal"
      class="">
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
  definePageMeta({
    middleware: ["auth"],
  });

  // General Values
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

  const { firestore } = useFirebaseClient();

  const duplicatesChecked = ref(false);

  // Return false if there are no duplicates, True if there are duplicates
  async function checkForDuplicates() {
    if (duplicatesChecked.value) {
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
      id: uuidv4(),
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
</script>
