<template>
  <div>
    <h1>Attractions</h1>
    <UTable :rows="attractions" />
  </div>
</template>

<script setup>
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
    })
  );
</script>
