import { onBeforeUnmount, onMounted, type Ref } from 'vue';

export function useClickOutside(elementRef: Ref<HTMLElement | null>, callback: () => void) {
  function handleDocumentClick(event: MouseEvent) {
    const target = event.target;

    if (!(target instanceof Node) || !elementRef.value || elementRef.value.contains(target)) {
      return;
    }

    callback();
  }

  onMounted(() => {
    document.addEventListener('click', handleDocumentClick);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick);
  });
}
