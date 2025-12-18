<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue';
import type { ImportStatus } from '@airlinesim/shared';

const datasets = [
  { id: 'airports', name: 'Airports (OurAirports)' },
  { id: 'aircraft-types', name: 'Aircraft Types (OpenAP / Wikidata)' }
];

const statuses = reactive<Record<string, ImportStatus | null>>({
  'airports': null,
  'aircraft-types': null
});

const pollingIntervals = reactive<Record<string, any>>({
  'airports': null,
  'aircraft-types': null
});

const fetchStatus = async (dataset: string) => {
  try {
    const data = await $api<ImportStatus>('/admin/import/status', {
      query: { dataset }
    });
    statuses[dataset] = data;
    
    if (data?.running) {
      if (!pollingIntervals[dataset]) {
        pollingIntervals[dataset] = setInterval(() => fetchStatus(dataset), 2000);
      }
    } else {
      if (pollingIntervals[dataset]) {
        clearInterval(pollingIntervals[dataset]);
        pollingIntervals[dataset] = null;
      }
    }
  } catch (e) {
    console.error(`Failed to fetch import status for ${dataset}`, e);
  }
};

const startImport = async (dataset: string, clearAll = false) => {
  const datasetName = datasets.find(d => d.id === dataset)?.name || dataset;
  if (clearAll) {
    if (!confirm(`WARNING: This will delete ALL existing ${datasetName} data. Are you sure?`)) {
      return;
    }
  }
  
  try {
    await $api('/admin/import/start', {
      method: 'POST',
      body: { dataset, clearAll }
    });
    fetchStatus(dataset);
  } catch (e) {
    console.error(`Failed to start import for ${dataset}`, e);
    alert(`Failed to start import for ${dataset}`);
  }
};

onMounted(() => {
  datasets.forEach(d => fetchStatus(d.id));
});

onUnmounted(() => {
  Object.values(pollingIntervals).forEach(interval => {
    if (interval) clearInterval(interval);
  });
});
</script>

<template>
  <div>
    <h2 class="text-h4 text-primary mb-6">Dashboard</h2>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div v-for="dataset in datasets" :key="dataset.id" class="bg-surface p-6 rounded-xl border border-border shadow-sm">
        <h3 class="text-body font-semibold text-text-primary">{{ dataset.name }}</h3>
        
        <div v-if="statuses[dataset.id]" class="mt-4">
          <!-- Progress Bar -->
          <div v-if="statuses[dataset.id]?.running || statuses[dataset.id]?.step === 'finished' || statuses[dataset.id]?.step === 'error'" class="mb-4">
            <div class="flex justify-between mb-1">
              <span class="text-caption text-text-muted transition-all duration-300" :class="{ 'text-error': statuses[dataset.id]?.step === 'error' }">
                {{ statuses[dataset.id]?.message }}
              </span>
              <span class="text-caption font-mono text-primary">
                {{ Math.round((statuses[dataset.id]?.progress / (statuses[dataset.id]?.total || 1)) * 100) }}%
              </span>
            </div>
            <div class="w-full bg-surface-subtle rounded-full h-2">
              <div 
                class="h-2 rounded-full transition-all duration-300" 
                :class="statuses[dataset.id]?.step === 'error' ? 'bg-error' : 'bg-primary'"
                :style="{ width: `${(statuses[dataset.id]?.progress / (statuses[dataset.id]?.total || 1)) * 100}%` }"
              ></div>
            </div>
          </div>

          <!-- Controls -->
          <div class="flex gap-4 mt-6">
            <button 
              @click="startImport(dataset.id, false)" 
              :disabled="statuses[dataset.id]?.running"
              class="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-body font-semibold hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              Update Data
            </button>
            <button 
              @click="startImport(dataset.id, true)" 
              :disabled="statuses[dataset.id]?.running"
              class="flex-1 px-4 py-2 bg-error-soft text-error rounded-lg text-body font-semibold hover:bg-error hover:text-white disabled:opacity-50 transition-colors border border-error/20"
            >
              Force Wipe & Re-import
            </button>
          </div>
        </div>
        <div v-else class="mt-4 animate-pulse h-24 bg-surface-subtle rounded-xl"></div>
      </div>
    </div>

    <div class="mt-8 bg-surface p-6 rounded-xl border border-border shadow-sm">
      <h3 class="text-body font-semibold text-text-primary mb-2">Management Quick Links</h3>
      <div class="flex flex-wrap gap-4">
        <NuxtLink to="/admin/airports" class="px-4 py-2 bg-surface-subtle border border-border rounded-lg text-body hover:bg-primary-soft hover:border-primary-soft hover:text-primary transition-colors">
          Manage Airports
        </NuxtLink>
        <NuxtLink to="/admin/aircraft-types" class="px-4 py-2 bg-surface-subtle border border-border rounded-lg text-body hover:bg-primary-soft hover:border-primary-soft hover:text-primary transition-colors">
          Manage Aircraft Types
        </NuxtLink>
        <NuxtLink to="/admin/airlines" class="px-4 py-2 bg-surface-subtle border border-border rounded-lg text-body hover:bg-primary-soft hover:border-primary-soft hover:text-primary transition-colors">
          Manage Airlines
        </NuxtLink>
      </div>
    </div>
  </div>
</template>


