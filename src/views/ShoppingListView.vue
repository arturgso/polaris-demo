<script setup lang="ts">
import ShoppingItemCard from '../components/shoppingList/ShoppingItemCard.vue';
import { ShoppingListMock } from '../mocks/shoppingList.mock';

</script>

<template>
  <div class="grid grid-cols-3 gap-2 w-full">
    <div
      v-for="item in ShoppingListMock"
      :key="item.id"
    >
      <ShoppingItemCard :item="item" />
    </div>
  </div>
</template>