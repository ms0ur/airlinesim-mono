<script setup lang="ts">
import Button from '~/components/ui/Button.vue'

interface Props {
  show: boolean
  aircraftType: any | null
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])

function formatValue(value: any): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

const flattenedCharacteristics = computed(() => {
  if (!props.aircraftType?.characteristics) return []
  
  const char = props.aircraftType.characteristics
  const items: { label: string, value: any, isCode?: boolean }[] = []

  // Basic Specs from YAML
  if (char.specs) {
    items.push({ label: 'Full YAML Spec', value: JSON.stringify(char.specs, null, 2), isCode: true })
  }

  // Fuel Model
  if (char.fuel_model) {
    items.push({ label: 'Fuel Model', value: `c1: ${char.fuel_model.c1}, c2: ${char.fuel_model.c2}, c3: ${char.fuel_model.c3}` })
  }

  // Engines
  if (char.engines && Array.isArray(char.engines)) {
    char.engines.forEach((eng: any, i: number) => {
      items.push({ 
        label: `Engine ${i + 1}`, 
        value: eng.name ? `${eng.name} (${eng.manufacturer || 'Unknown'})` : 'Unknown Engine' 
      })
      if (eng.max_thrust) {
        items.push({ label: `  Thrust`, value: `${eng.max_thrust} kN` })
      }
    })
  }

  // Wikidata
  if (char.wikidata) {
    items.push({ label: 'Wikidata QID', value: char.wikidata.qid })
  }

  return items
})
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-surface rounded-xl border border-border p-6 max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-h5 text-text-primary">
            Characteristics: {{ aircraftType?.displayName }}
          </h3>
          <button @click="emit('close')" class="text-text-muted hover:text-text-primary">
            <span class="text-2xl">×</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-4 pr-2">
          <div v-for="item in flattenedCharacteristics" :key="item.label" class="border-b border-border/50 pb-2">
            <div class="text-caption font-semibold text-text-muted uppercase mb-1">{{ item.label }}</div>
            <div v-if="item.isCode" class="bg-background p-3 rounded-lg overflow-x-auto">
              <pre class="text-xs font-mono text-text-primary whitespace-pre">{{ item.value }}</pre>
            </div>
            <div v-else class="text-body text-text-primary">
              {{ item.value }}
            </div>
          </div>
          
          <div v-if="!flattenedCharacteristics.length" class="text-center text-text-muted py-8">
            No detailed characteristics available for this type.
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <Button type="button" variant="primary" @click="emit('close')">Close</Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
