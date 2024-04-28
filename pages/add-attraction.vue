<template>
  <div class="m-2">
    <p class="font-bold text-xl">Add Attraction</p>

    <form @submit.prevent="addAttraction">
      <div class="flex flex-col gap-y-2 mb-2">
        <div class="flex gap-x-2">
          <p>Is it in Berlin?</p>
          <UCheckbox v-model="isBerlin" />
        </div>
        <div class="flex gap-x-2">
          <p>Is it regionally?</p>
          <UCheckbox v-model="isRegional" />
        </div>
        <div>
          <p>Name</p>
          <UInput
            size="sm"
            v-model="name"
            placeholder="Enter attraction name" />
        </div>
        <div>
          <p>Opening Hours</p>
          <UInput
            size="sm"
            v-model="openingHoursOnWebsite"
            placeholder="Enter opening hours text" />
        </div>
        <div>
          <p>Address</p>
          <UInput
            size="sm"
            v-model="address"
            placeholder="Enter attraction address" />
        </div>
        <div>
          <p>Social Media Link</p>
          <UInput
            size="sm"
            v-model="socialMediaLink"
            placeholder="Enter attraction address" />
        </div>
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
          <p>Price per person</p>
          <UInput
            size="sm"
            v-model="price"
            placeholder="Enter attraction address" />
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
        class="m-2"
        >Save</UButton
      >
    </form>
  </div>
</template>

<script setup>
  import { writeBatch, doc } from "firebase/firestore";
  definePageMeta({
    middleware: ["auth"],
  });

  const isBerlin = ref(false);
  const isRegional = ref(true);
  const name = ref("");
  const socialMediaLink = ref("");
  const websiteUrl = ref("");
  const googleMapsLink = ref("");
  const price = ref(0);
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

  const openingHoursOnWebsite = ref("");

  const address = ref("");

  function fillOpeningHours() {
    console.log("Filling opening hours");
    // maybe need later: const defaultHours = { openAt: "", closeAt: "", open: true };

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

  const categories = ref([]);

  function addCategory(category) {
    categories.value.push(category);
  }

  function removeCategory(category) {
    categories.value = categories.value.filter(
      (existingCategory) => existingCategory.id !== category.id
    );
  }
  async function addAttraction() {
    const { firestore } = useFirebaseClient();
    console.log("Saving attraction");
    const categoryIds = categories.value.map((category) => category.id);

    const newCategories = categories.value.filter((category) => {
      return category.new;
    });

    newCategories.forEach((category) => {
      delete category.new;
    });

    const activity = {
      isBerlin: isBerlin.value,
      isRegional: isRegional.value,
      name: name.value,
      socialMediaLink: socialMediaLink.value,
      websiteUrl: websiteUrl.value,
      googleMapsLink: googleMapsLink.value,
      price: price.value,
      openingHours: openingHours.value,
      openingHoursOnWebsite: openingHoursOnWebsite.value,
      address: address.value,
      categories: categoryIds,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: useCurrentUser().displayName,
      updatedBy: useCurrentUser().displayName,
    };
    try {
      const batch = writeBatch(firestore);
      const activityRef = doc(firestore, "activities", activity.name);
      batch.set(activityRef, activity);
      newCategories.forEach((category) => {
        const categoryRef = doc(firestore, "categories", category.name);
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
