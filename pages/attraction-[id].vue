<template>
  <pre>{{ JSON.stringify(attraction, undefined, 4) }}</pre>
</template>

<script setup>
  definePageMeta({
    middleware: ["auth"],
  });
  import { collection, doc } from "firebase/firestore";

  const route = useRoute();
  const config = useRuntimeConfig();
  const id = route.params.id;

  const { firestore } = useFirebaseClient();
  const categories = useCollection(
    collection(firestore, "categories").withConverter({
      fromFirestore(snapshot, options) {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          name: data.name,
        };
      },
    })
  );
  const attraction = useDocument(
    doc(
      collection(firestore, `activities-${config.public.version}`),
      id
    ).withConverter({
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
          categories: data.categories.map((category) => {
            return categories.value.find((c) => c.id === category);
          }),
        };
      },
    }),
    {
      once: true,
    }
  );
</script>
