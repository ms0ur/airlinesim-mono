<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { ImportStatus } from '@airlinesim/shared';

const status = ref<ImportStatus | null>(null);
const polling = ref<any>(null);

const fetchStatus = async () => {
  try {
    const data = await $api<ImportStatus>('/admin/import/status');
    status.value = data;
    if (data?.running) {
      if (!polling.value) {
        polling.value = setInterval(fetchStatus, 2000);
      }
    } else {
      if (polling.value) {
        clearInterval(polling.value);
        polling.value = null;
      }
    }
  } catch (e) {
    console.error('Failed to fetch import status', e);
  }
};

onMounted(fetchStatus);
onUnmounted(() => {
  if (polling.value) clearInterval(polling.value);
});

const startImport = async (clearAll = false) => {
  if (clearAll) {
    if (!confirm('WARNING: This will delete ALL airports, runways, and countries. Are you sure?')) {
      return;
    }
  }
  await $api('/admin/import/start', {
    method: 'POST',
    query: { clearAll: clearAll.toString() }
  });
  fetchStatus();
};
</script>

<template>
  <div>
    <h2 class="text-h4 text-primary mb-6">Dashboard</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-surface p-6 rounded-xl border border-border shadow-sm">
        <h3 class="text-body font-semibold text-text-muted">Welcome</h3>
        <p class="text-h3 text-primary mt-2">Admin</p>
      </div>
      
      <!-- Import Control Card -->
      <div class="bg-surface p-6 rounded-xl border border-border shadow-sm col-span-1 md:col-span-2">
        <h3 class="text-body font-semibold text-text-primary">Data Import (OurAirports)</h3>
        
        <div v-if="status" class="mt-4">
          <div v-if="status.running || status.step === 'finished' || status.step === 'error'" class="mb-4">
            <div class="flex justify-between mb-1">
              <span class="text-caption text-text-muted">{{ status.message }}</span>
              <span class="text-caption font-mono text-primary">{{ Math.round((status.progress / (status.total || 1)) * 100) }}%</span>
            </div>
            <div class="w-full bg-surface-subtle rounded-full h-2">
              <div 
                class="bg-primary h-2 rounded-full transition-all duration-300" 
                :style="{ width: `${(status.progress / (status.total || 1)) * 100}%` }"
              ></div>
            </div>
          </div>

          <div class="flex gap-4">
            <button 
              @click="startImport(false)" 
              :disabled="status.running"
              class="px-4 py-2 bg-primary text-white rounded-lg text-body font-semibold hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              Update Data (Upsert)
            </button>
            <button 
              @click="startImport(true)" 
              :disabled="status.running"
              class="px-4 py-2 bg-error-soft text-error rounded-lg text-body font-semibold hover:bg-error hover:text-white disabled:opacity-50 transition-colors border border-error/20"
            >
              Clear & Re-import
            </button>
          </div>
        </div>
        <div v-else class="mt-4 animate-pulse h-20 bg-surface-subtle rounded-xl"></div>
      </div>
    </div>

    <div class="mt-8">
      <p class="text-body text-text-primary">
        Select a category from the sidebar to manage entities.
      </p>
    </div>
  </div>
</template>

