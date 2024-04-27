<template>
  <div class="border">
    <div v-if="offspringData.length > 0">
      <q-list>
        <q-expansion-item
          v-for="(generation, index) in offspringData"
          :key="index"
          class="expansion-item"
        >
          <template v-slot:header>
            <div class="new-header">
              <p>
                {{ formatBeforeLink(generation) }}
                <RouterLink
                  :to="formatCatLink(generation.parent)"
                  :class="[generation.parent.gender == 'M' ? 'man' : 'woman']"
                  >{{ formatCatName(generation.parent) }}</RouterLink
                >{{ formatAfterLink(generation.parent) }}
              </p>
              <p>
                {{ `${$t('offspring')}(${generation.offsprings.length})` }}
              </p>
            </div>
          </template>
          <div class="separator"></div>
          <q-card>
            <q-card-section>
              <div class="inner-offspring">
                <div>{{ $t('offspring') }}</div>
                <div class="inner-offspring-list-cats">
                  <div
                    v-for="(lowerGeneration, index2) in generation.offsprings"
                    :key="index2"
                  >
                    <p>
                      <RouterLink
                        :to="formatCatLink(lowerGeneration)"
                        :class="[
                          lowerGeneration.gender == 'M' ? 'man' : 'woman',
                        ]"
                        >{{ formatCatName(lowerGeneration) }}</RouterLink
                      >{{ formatAfterLink(lowerGeneration) }}
                    </p>
                  </div>
                </div>
                <div class="inner-offspring-list-offspring">
                  <div
                    v-for="(lowerGeneration, index2) in generation.offsprings"
                    :key="index2"
                  >
                    <div v-if="lowerGeneration.offspring_count > 0">
                      <RouterLink :to="formatOffspringLink(lowerGeneration)">
                        {{ formatOffspring(lowerGeneration.offspring_count) }}
                      </RouterLink>
                    </div>
                    <div v-else>
                      {{ formatOffspring(lowerGeneration.offspring_count) }}
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </div>
    <div v-else class="noData">{{ $t('noOffspringSoFar') }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CatOffspring',
  props: ['offspringData'],
  setup() {
    return {};
  },

  methods: {
    formatBeforeLink(generation: any) {
      let litterDate = generation.litter_date
        ? generation.litter_date + ' ' + this.$t('with') + ' '
        : '';
      let string = litterDate;
      return string;
    },

    formatAfterLink(generation: any) {
      let parentBreed = generation.code ? generation.code.trim() + ', ' : '';
      let parentColorCode = generation.color_code
        ? generation.color_code.trim() + ', '
        : '';
      let parentDateOfBirth = generation.date_of_birth
        ? generation.date_of_birth
        : '';
      let string = ', ' + parentBreed + parentColorCode + parentDateOfBirth;
      return string;
    },
    formatOffspring(offspring: any) {
      if (offspring == 0) {
        return this.$t('noOffspring');
      }
      return this.$t('Show offspring') + `(${offspring})`;
    },

    formatOffspringLink(offspring: any) {
      if (offspring == 0) {
        return this.$t('noOffspring');
      }
      return `/cat/detail/${offspring.id}/offspring`;
    },

    formatCatLink(cat: any) {
      let link = `/cat/detail/${cat.id}/pedigree`;
      return link;
    },
    formatCatName(generation: any) {
      let parentName = generation.name ? generation.name : '';
      let string = parentName;
      return string;
    },
  },
});
</script>

<style lang="scss" scoped>
.expansion-item .q-hoverable:hover.q-item > .q-focus-helper {
  border-radius: 20px;
}

.expansion-item.q-expansion-item--expanded
  .q-hoverable:hover.q-item
  > .q-focus-helper {
  border-radius: 20px 20px 0 0;
}
</style>
<style scoped lang="scss">
.border {
  background: #f5f5f5;
  padding: 10px;

  @media (max-width: 575.98px) {
    padding-left: 0px;
    padding-right: 0px;
  }

  .new-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    p {
      margin: 0px;
    }
  }
  .separator {
    border: 1px solid #000000;
  }
}

.expansion-item {
  background: #caccfc;
  border-radius: 20px;

  margin-bottom: 15px;

  &.q-expansion-item--expanded {
    background: #f5f5f5;
    border: 1px solid #000000;
    border-radius: 20px;

    @media (max-width: 575.98px) {
      padding: 0px;
      border: none;
    }

    .q-card {
      border-radius: 0 0 25px 25px;
    }
    .q-card__section {
      @media (max-width: 575.98px) {
        padding: 0px;
      }
    }
  }

  .inner-offspring {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    .inner-offspring-list-cats {
      display: flex;
      flex-direction: column;
      p {
        margin: 0px;
      }
    }
    .inner-offspring-list-offspring {
      display: flex;
      flex-direction: column;
    }
  }
}

.expansion-item:last-child {
  margin-bottom: 0px;
}
::deep(.q-item__section--main) {
  width: 97%;
}

.noData {
  display: flex;
  justify-content: center;
}
.woman {
  cursor: pointer;
  text-decoration: underline;
  color: #ff7e7e;
}
.man {
  cursor: pointer;
  text-decoration: underline;
  color: #0000ee;
}
</style>
