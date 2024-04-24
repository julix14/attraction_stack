<template>
  <div>
    <p class="font-bold text-xl">Add Attraction</p>

    <form @submit.prevent="addAttraction">
      <div class="flex flex-col gap-y-2 mb-2">
        <div>
          <p>Is it in Berlin?</p>
          <UToggle v-model="isBerlin" />
        </div>
        <div>
          <p>Is it regionally?</p>
          <UToggle v-model="isRegional" />
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
      <UButton type="submit">Save</UButton>
    </form>
  </div>
</template>

<script setup>
  import { initializeApp } from "firebase/app";
  import { getFirestore, collection, addDoc } from "@firebase/firestore";
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
      console.log(openingHours.value[day]);

      openingHours.value[day] = JSON.parse(
        JSON.stringify(openingHours.value["monday"])
      );
    });
  }

  const addAttractionApp = initializeApp(
    {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
    "[add-attraction]"
  );

  const db = getFirestore(addAttractionApp);

  async function addAttraction() {
    console.log("Saving");

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
    };
    try {
      const colRef = collection(db, "activities");
      console.log("colRef", colRef);
      const docRef = await addDoc(colRef, activity);
      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding attraction:", error);
    }
  }
</script>

<style></style>
