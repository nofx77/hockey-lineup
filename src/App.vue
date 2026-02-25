<script setup>
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { LANG_KEY } from './i18n/index.js'
import PlayerCard from './components/PlayerCard.vue'

const { t, locale } = useI18n()

const STORAGE_KEY = 'hockey-lineup-data'

function toggleLocale() {
  locale.value = locale.value === 'fr' ? 'en' : 'fr'
  localStorage.setItem(LANG_KEY, locale.value)
}

function getDefaultLineup() {
  return {
  attaquants: [
    {
      nameKey: 'groups.trio1',
      positions: [
        { labelKey: 'positions.lw', player: { id: 'a1', name: 'Attaquant 1', number: 11 } },
        { labelKey: 'positions.c', player: { id: 'a2', name: 'Attaquant 2', number: 12 } },
        { labelKey: 'positions.rw', player: { id: 'a3', name: 'Attaquant 3', number: 13 } },
      ],
    },
    {
      nameKey: 'groups.trio2',
      positions: [
        { labelKey: 'positions.lw', player: { id: 'a4', name: 'Attaquant 4', number: 14 } },
        { labelKey: 'positions.c', player: { id: 'a5', name: 'Attaquant 5', number: 15 } },
        { labelKey: 'positions.rw', player: { id: 'a6', name: 'Attaquant 6', number: 16 } },
      ],
    },
    {
      nameKey: 'groups.trio3',
      positions: [
        { labelKey: 'positions.lw', player: { id: 'a7', name: 'Attaquant 7', number: 17 } },
        { labelKey: 'positions.c', player: { id: 'a8', name: 'Attaquant 8', number: 18 } },
        { labelKey: 'positions.rw', player: { id: 'a9', name: 'Attaquant 9', number: 19 } },
      ],
    },
    {
      nameKey: 'groups.trio4',
      positions: [
        { labelKey: 'positions.lw', player: { id: 'a10', name: 'Attaquant 10', number: 20 } },
        { labelKey: 'positions.c', player: { id: 'a11', name: 'Attaquant 11', number: 21 } },
        { labelKey: 'positions.rw', player: { id: 'a12', name: 'Attaquant 12', number: 22 } },
      ],
    },
  ],
  defenseurs: [
    {
      nameKey: 'groups.duo1',
      positions: [
        { labelKey: 'positions.ld', player: { id: 'd1', name: 'Défenseur 1', number: 21 } },
        { labelKey: 'positions.rd', player: { id: 'd2', name: 'Défenseur 2', number: 22 } },
      ],
    },
    {
      nameKey: 'groups.duo2',
      positions: [
        { labelKey: 'positions.ld', player: { id: 'd3', name: 'Défenseur 3', number: 23 } },
        { labelKey: 'positions.rd', player: { id: 'd4', name: 'Défenseur 4', number: 24 } },
      ],
    },
    {
      nameKey: 'groups.duo3',
      positions: [
        { labelKey: 'positions.ld', player: { id: 'd5', name: 'Défenseur 5', number: 25 } },
        { labelKey: 'positions.rd', player: { id: 'd6', name: 'Défenseur 6', number: 26 } },
      ],
    },
  ],
  gardien: [
    {
      nameKey: 'groups.partant',
      positions: [
        { labelKey: 'positions.g', player: { id: 'g1', name: 'Gardien', number: 1 } },
      ],
    },
  ],
  }
}

// Migrate old data format (name/label → nameKey/labelKey)
function migrateLineup(data) {
  const labelToKey = {
    'Ailier gauche': 'positions.lw',
    'Centre': 'positions.c',
    'Ailier droit': 'positions.rw',
    'Défenseur gauche': 'positions.ld',
    'Défenseur droit': 'positions.rd',
    'Gardien de but': 'positions.g',
  }
  const nameToKey = {
    'Trio 1': 'groups.trio1',
    'Trio 2': 'groups.trio2',
    'Trio 3': 'groups.trio3',
    'Trio 4': 'groups.trio4',
    'Duo 1': 'groups.duo1',
    'Duo 2': 'groups.duo2',
    'Duo 3': 'groups.duo3',
    'Partant': 'groups.partant',
  }

  for (const section of ['attaquants', 'defenseurs', 'gardien']) {
    if (!data[section]) continue
    for (const group of data[section]) {
      if (group.name && !group.nameKey) {
        group.nameKey = nameToKey[group.name] || group.name
        delete group.name
      }
      for (const pos of group.positions) {
        if (pos.label && !pos.labelKey) {
          pos.labelKey = labelToKey[pos.label] || pos.label
          delete pos.label
        }
        if (pos.player) {
          delete pos.player.position
        }
      }
    }
  }
  return data
}

function loadLineup() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return migrateLineup(JSON.parse(saved))
    }
  } catch {
    // Données corrompues, on repart du défaut
  }
  return getDefaultLineup()
}

function saveLineup(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const lineup = reactive(loadLineup())

watch(lineup, (val) => {
  saveLineup(val)
}, { deep: true })

// Drag & drop swap logic
const dragSource = ref(null)
const dragOverPos = ref(null)

function onDragStart(sectionName, pos) {
  dragSource.value = { sectionName, pos }
}

function onDragOver(pos) {
  dragOverPos.value = pos
}

function onDragLeave() {
  dragOverPos.value = null
}

function onDrop(sectionName, targetPos) {
  dragOverPos.value = null
  if (!dragSource.value) return
  if (dragSource.value.sectionName !== sectionName) return
  if (dragSource.value.pos === targetPos) {
    dragSource.value = null
    return
  }

  const sourcePos = dragSource.value.pos
  const tempPlayer = { ...sourcePos.player }
  sourcePos.player = { ...targetPos.player }
  targetPos.player = tempPlayer

  dragSource.value = null
}

function onDragEnd() {
  dragSource.value = null
  dragOverPos.value = null
}

// Touch drag & drop for mobile
const touchClone = ref(null)
const touchSource = ref(null)
let touchTimeout = null
let touchStartX = 0
let touchStartY = 0

function onTouchStart(sectionName, pos, event) {
  const touch = event.touches[0]
  touchStartX = touch.clientX
  touchStartY = touch.clientY

  touchTimeout = setTimeout(() => {
    touchSource.value = { sectionName, pos }

    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    const clone = target.cloneNode(true)
    clone.style.position = 'fixed'
    clone.style.width = rect.width + 'px'
    clone.style.left = (touch.clientX - rect.width / 2) + 'px'
    clone.style.top = (touch.clientY - rect.height / 2) + 'px'
    clone.style.pointerEvents = 'none'
    clone.style.zIndex = '1000'
    clone.style.opacity = '0.85'
    clone.style.transform = 'rotate(2deg)'
    document.body.appendChild(clone)
    touchClone.value = clone
  }, 150)
}

function onTouchMove(event) {
  const touch = event.touches[0]

  // Cancel drag if not yet activated and finger moved little
  if (!touchSource.value) {
    const dx = touch.clientX - touchStartX
    const dy = touch.clientY - touchStartY
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      clearTimeout(touchTimeout)
    }
    return
  }

  event.preventDefault()

  // Move clone
  if (touchClone.value) {
    const rect = touchClone.value.getBoundingClientRect()
    touchClone.value.style.left = (touch.clientX - rect.width / 2) + 'px'
    touchClone.value.style.top = (touch.clientY - rect.height / 2) + 'px'
  }

  // Detect drop target
  const el = document.elementFromPoint(touch.clientX, touch.clientY)
  if (el) {
    const wrapper = el.closest('[data-section]')
    if (wrapper && wrapper.dataset.section === touchSource.value.sectionName) {
      const groupIdx = parseInt(wrapper.dataset.groupIndex)
      const posIdx = parseInt(wrapper.dataset.posIndex)
      const targetPos = lineup[wrapper.dataset.section][groupIdx].positions[posIdx]
      dragOverPos.value = targetPos
    } else {
      dragOverPos.value = null
    }
  } else {
    dragOverPos.value = null
  }
}

function onTouchEnd() {
  clearTimeout(touchTimeout)

  if (touchSource.value && dragOverPos.value) {
    onDrop(touchSource.value.sectionName, dragOverPos.value)
  }

  // Cleanup
  if (touchClone.value) {
    touchClone.value.remove()
    touchClone.value = null
  }
  touchSource.value = null
  dragOverPos.value = null
}

function updatePlayer(data) {
  const sections = ['attaquants', 'defenseurs', 'gardien']
  for (const sectionName of sections) {
    for (const group of lineup[sectionName]) {
      for (const pos of group.positions) {
        if (pos.player && pos.player.id === data.id) {
          pos.player.name = data.name
          pos.player.number = data.number
          return
        }
      }
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-page-bg pb-12" @touchmove="onTouchMove" @touchend="onTouchEnd">
    <!-- Header -->
    <header class="bg-navy text-white py-5 px-6 mb-8">
      <div class="max-w-5xl mx-auto flex items-center gap-5">
        <img src="/logo-QC.svg" alt="Logo Québec-Centre" class="w-28 h-28 shrink-0" />
        <div class="flex-1">
          <h1 class="text-xl md:text-2xl font-bold leading-tight">{{ $t('header.title') }}</h1>
          <p class="text-white/70 text-sm">{{ $t('header.subtitle') }}</p>
        </div>
        <button
          class="shrink-0 rounded-lg border border-white/30 px-3 py-1.5 text-sm font-semibold hover:bg-white/10 transition-colors"
          @click="toggleLocale"
        >
          {{ $t('lang') }}
        </button>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-4">
      <!-- Attaquants -->
      <section class="bg-white rounded-2xl border-2 border-dashed border-section-border p-4 md:p-6 mb-6">
        <h2 class="text-xl font-extrabold text-navy mb-4">{{ $t('sections.attaquants') }}</h2>

        <div v-for="(trio, gIdx) in lineup.attaquants" :key="trio.nameKey" class="mb-6 last:mb-0">
          <h3 class="text-base font-bold text-navy mb-2">{{ $t(trio.nameKey) }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div
              v-for="(pos, pIdx) in trio.positions"
              :key="pos.labelKey"
              class="rounded-lg p-1 -m-1 transition-colors"
              :class="{ 'bg-navy/10': dragOverPos === pos && dragSource?.pos !== pos }"
              data-section="attaquants"
              :data-group-index="gIdx"
              :data-pos-index="pIdx"
              @dragover.prevent="onDragOver(pos)"
              @dragleave="onDragLeave"
              @drop="onDrop('attaquants', pos)"
              @touchstart="onTouchStart('attaquants', pos, $event)"
            >
              <span class="text-xs font-semibold text-blue-accent uppercase tracking-wide mb-1 block">{{ $t(pos.labelKey) }}</span>
              <PlayerCard
                :player="pos.player"
                :position-label="$t(pos.labelKey)"
                @dragstart="onDragStart('attaquants', pos)"
                @dragend="onDragEnd"
                @update="updatePlayer"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Défenseurs + Gardien -->
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
        <!-- Défenseurs -->
        <section class="bg-white rounded-2xl border-2 border-dashed border-section-border p-4 md:p-6">
          <h2 class="text-xl font-extrabold text-navy mb-4">{{ $t('sections.defenseurs') }}</h2>

          <div v-for="(duo, gIdx) in lineup.defenseurs" :key="duo.nameKey" class="mb-6 last:mb-0">
            <h3 class="text-base font-bold text-navy mb-2">{{ $t(duo.nameKey) }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                v-for="(pos, pIdx) in duo.positions"
                :key="pos.labelKey"
                class="rounded-lg p-1 -m-1 transition-colors"
                :class="{ 'bg-navy/10': dragOverPos === pos && dragSource?.pos !== pos }"
                data-section="defenseurs"
                :data-group-index="gIdx"
                :data-pos-index="pIdx"
                @dragover.prevent="onDragOver(pos)"
                @dragleave="onDragLeave"
                @drop="onDrop('defenseurs', pos)"
                @touchstart="onTouchStart('defenseurs', pos, $event)"
              >
                <span class="text-xs font-semibold text-blue-accent uppercase tracking-wide mb-1 block">{{ $t(pos.labelKey) }}</span>
                <PlayerCard
                  :player="pos.player"
                  :position-label="$t(pos.labelKey)"
                  @dragstart="onDragStart('defenseurs', pos)"
                  @dragend="onDragEnd"
                  @update="updatePlayer"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Gardien -->
        <section class="bg-white rounded-2xl border-2 border-dashed border-section-border p-4 md:p-6 lg:w-72">
          <h2 class="text-xl font-extrabold text-navy mb-4">{{ $t('sections.gardien') }}</h2>

          <div v-for="(group, gIdx) in lineup.gardien" :key="group.nameKey" class="mb-6 last:mb-0">
            <h3 class="text-base font-bold text-navy mb-2">{{ $t(group.nameKey) }}</h3>
            <div
              v-for="(pos, pIdx) in group.positions"
              :key="pos.labelKey"
              class="rounded-lg p-1 -m-1 transition-colors"
              :class="{ 'bg-navy/10': dragOverPos === pos && dragSource?.pos !== pos }"
              data-section="gardien"
              :data-group-index="gIdx"
              :data-pos-index="pIdx"
              @dragover.prevent="onDragOver(pos)"
              @dragleave="onDragLeave"
              @drop="onDrop('gardien', pos)"
              @touchstart="onTouchStart('gardien', pos, $event)"
            >
              <span class="text-xs font-semibold text-blue-accent uppercase tracking-wide mb-1 block">{{ $t(pos.labelKey) }}</span>
              <PlayerCard
                :player="pos.player"
                :position-label="$t(pos.labelKey)"
                @dragstart="onDragStart('gardien', pos)"
                @dragend="onDragEnd"
                @update="updatePlayer"
              />
            </div>
          </div>
        </section>
      </div>

      <!-- Tip -->
      <div class="mt-6 bg-card-bg rounded-xl border border-section-border px-4 py-3 text-sm text-navy/70">
        <strong class="text-navy">{{ $t('tip.label') }}</strong> {{ $t('tip.text') }}
      </div>
    </main>
  </div>
</template>
