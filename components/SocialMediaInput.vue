<template>
  <div>
    <p>Social Media Links</p>
    <div
      v-for="item in socialMediaLinks"
      class="grid grid-cols-2 gap-2 mb-1">
      <UInput
        class="grow"
        size="sm"
        v-model="item.link"
        placeholder="Enter SocialMedia Link" />
      <USelectMenu
        class="grow"
        v-model="item.platform"
        :options="socialMediaPlatforms"
        placeholder="Select Platform"
        value-attribute="value"
        option-attribute="label" />
    </div>
    <div class="flex gap-x-2">
      <UButton @click="addSocialMediaLink">Add Social Media Link</UButton>
      <UButton @click="removeSocialMediaLink">Remove Social Media Link</UButton>
    </div>
  </div>
</template>

<script setup>
  const socialMediaLinks = defineModel();

  const socialMediaPlatforms = [
    { value: "facebook", label: "Facebook" },
    { value: "instagram", label: "Instagram" },
    { value: "twitter", label: "Twitter" },
    { value: "youtube", label: "Youtube" },
    { value: "tiktok", label: "TikTok" },
    { value: "other", label: "Other" },
  ];

  const addSocialMediaLink = () => {
    socialMediaLinks.value.push({
      platform: "",
      link: "",
    });
  };

  const removeSocialMediaLink = () => {
    if (socialMediaLinks.value.length === 1) return;
    socialMediaLinks.value.pop();
  };
</script>
