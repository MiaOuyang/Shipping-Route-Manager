<!-- 全局页脚 -->
<template>
  <ele-text
    type="placeholder"
    class="ele-footer"
    style="padding: 16px 0; text-align: center"
  >
    <div>
      {{ t('layout.footer.copyright') }}
    </div>
  </ele-text>
</template>

<script setup>
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
</script>
