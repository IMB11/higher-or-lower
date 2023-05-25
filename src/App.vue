<script lang="ts">
import { defineComponent } from "vue";
import Game from "./components/Game.vue";

export default defineComponent({
  components: {
    Game,
  },
});
</script>

<template>
  <h1>Higher or Lower</h1>
  <Game />
</template>

<style scoped></style>
