<script lang="ts">
import { defineComponent } from "vue";
import GameComponent from "./components/GameComponent.vue";

export default defineComponent({
  components: {
    Game: GameComponent,
  },
});
</script>

<template>
  <h1>Higher or Lower</h1>
  <GameComponent />
</template>

<style scoped></style>
