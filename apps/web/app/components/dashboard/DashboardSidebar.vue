<script setup lang="ts">
interface NavSection {
  title: string
  icon: string
  items: { label: string; path: string }[]
  expanded: boolean
}

const sections = ref<NavSection[]>([
  {
    title: 'Fleet',
    icon: 'heroicons:paper-airplane',
    expanded: true,
    items: [
      { label: 'Overview', path: '/dashboard/fleet' },
      { label: 'Aircraft', path: '/dashboard/fleet/aircraft' },
      { label: 'Orders', path: '/dashboard/fleet/orders' },
      { label: 'Configurations', path: '/dashboard/fleet/configurations' },
      { label: 'Maintenance', path: '/dashboard/fleet/maintenance' },
    ]
  },
  {
    title: 'Airports',
    icon: 'heroicons:building-office-2',
    expanded: true,
    items: [
      { label: 'My Hubs', path: '/dashboard/airports/hubs' },
      { label: 'Routes', path: '/dashboard/airports/routes' },
      { label: 'Fees & Slots', path: '/dashboard/airports/fees' },
    ]
  },
  {
    title: 'Operations',
    icon: 'heroicons:cog-6-tooth',
    expanded: true,
    items: [
      { label: 'Live flights', path: '/dashboard/operations/live' },
      { label: 'Schedule', path: '/dashboard/operations/schedule' },
      { label: 'Fuel', path: '/dashboard/operations/fuel' },
      { label: 'Ground Services', path: '/dashboard/operations/ground' },
      { label: 'R&D', path: '/dashboard/operations/rd' },
    ]
  },
  {
    title: 'Finances',
    icon: 'heroicons:banknotes',
    expanded: true,
    items: [
      { label: 'Overview', path: '/dashboard/finances' },
      { label: 'R&F profit', path: '/dashboard/finances/profit' },
      { label: 'Costs', path: '/dashboard/finances/costs' },
      { label: 'Loans & leasing', path: '/dashboard/finances/loans' },
    ]
  },
  {
    title: 'Staff',
    icon: 'heroicons:user-group',
    expanded: true,
    items: [
      { label: 'Overview', path: '/dashboard/staff' },
      { label: 'Crew', path: '/dashboard/staff/crew' },
      { label: 'Ground staff', path: '/dashboard/staff/ground' },
      { label: 'Rosters', path: '/dashboard/staff/rosters' },
      { label: 'Training', path: '/dashboard/staff/training' },
    ]
  },
])

const toggleSection = (index: number) => {
  const section = sections.value[index]
  if (section) {
    section.expanded = !section.expanded
  }
}
</script>

<template>
  <aside class="w-64 bg-surface border-r border-border flex flex-col overflow-y-auto">
    <nav class="py-4">
      <div v-for="(section, index) in sections" :key="section.title" class="mb-2">
        <!-- Section header -->
        <button
          class="w-full px-4 py-2 flex items-center justify-between hover:bg-surface-subtle transition-colors"
          @click="toggleSection(index)"
        >
          <div class="flex items-center gap-3">
            <Icon :name="section.icon" class="w-5 h-5 text-text-muted" />
            <span class="text-h4 text-text-primary">{{ section.title }}</span>
          </div>
          <Icon
            name="heroicons:chevron-up"
            class="w-4 h-4 text-text-muted transition-transform"
            :class="{ 'rotate-180': !section.expanded }"
          />
        </button>

        <!-- Section items -->
        <div v-show="section.expanded" class="mt-1">
          <NuxtLink
            v-for="item in section.items"
            :key="item.path"
            :to="item.path"
            class="block px-4 py-2 pl-12 text-body text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors"
          >
            {{ item.label }}
          </NuxtLink>
        </div>
      </div>
    </nav>
  </aside>
</template>

