<script setup>
import { ref, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  player: { type: Object, required: true },
  positionLabel: { type: String, default: '' },
})

const shortName = computed(() => {
  const parts = props.player.name.trim().split(/\s+/)
  return parts.map(p => p.charAt(0).toUpperCase() + '.').join(' ')
})

const emit = defineEmits(['update'])

const editing = ref(false)
const editName = ref('')
const editNumber = ref('')
const nameInput = ref(null)

function startEdit() {
  editing.value = true
  editName.value = props.player.name
  editNumber.value = props.player.number
  nextTick(() => {
    nameInput.value?.focus()
  })
}

function saveEdit() {
  emit('update', {
    id: props.player.id,
    name: editName.value,
    number: editNumber.value !== '' ? editNumber.value : '',
  })
  editing.value = false
}

function cancelEdit() {
  editing.value = false
}
</script>

<template>
  <div
    class="player-card group flex items-center justify-between rounded-lg border-2 border-section-border bg-card-bg px-2 py-1.5 md:px-4 md:py-3 transition-shadow hover:shadow-md select-none"
    :class="editing ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'"
    :draggable="!editing"
    @click.stop="startEdit"
  >
    <div v-if="!editing" class="flex-1 min-w-0">
      <div class="text-xs md:text-sm font-semibold text-navy truncate">
        <span class="md:hidden">{{ shortName }}</span>
        <span class="hidden md:inline">{{ player.name }}</span>
      </div>
      <div class="text-[10px] md:text-xs text-navy/60 hidden md:block">{{ positionLabel }}</div>
    </div>
    <div v-if="!editing" class="flex items-center gap-1 md:gap-2 ml-1 md:ml-2 shrink-0">
      <span v-if="player.number !== ''" class="text-base md:text-2xl font-extrabold text-navy">#{{ player.number }}</span>
      <svg class="w-3 h-3 md:w-4 md:h-4 text-navy/30 hidden md:block" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="6" cy="3" r="1.5" />
        <circle cx="10" cy="3" r="1.5" />
        <circle cx="6" cy="8" r="1.5" />
        <circle cx="10" cy="8" r="1.5" />
        <circle cx="6" cy="13" r="1.5" />
        <circle cx="10" cy="13" r="1.5" />
      </svg>
    </div>

    <form v-if="editing" class="flex flex-col gap-2 w-full" @submit.prevent="saveEdit" @click.stop>
      <input
        ref="nameInput"
        v-model="editName"
        type="text"
        class="rounded border border-section-border px-2 py-1 text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-navy/30"
        :placeholder="t('player.placeholder')"
        @keydown.esc="cancelEdit"
      />
      <div class="flex gap-2">
        <input
          v-model="editNumber"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          class="w-20 rounded border border-section-border px-2 py-1 text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-navy/30"
          placeholder="#"
          @keydown.esc="cancelEdit"
        />
        <button
          type="submit"
          class="flex-1 rounded bg-navy text-white text-xs font-semibold py-1 px-3 hover:bg-navy-light transition-colors"
        >
          {{ $t('player.ok') }}
        </button>
        <button
          type="button"
          class="rounded border border-section-border text-navy text-xs font-semibold py-1 px-3 hover:bg-gray-100 transition-colors"
          @click="cancelEdit"
        >
          {{ $t('player.cancel') }}
        </button>
      </div>
    </form>
  </div>
</template>
