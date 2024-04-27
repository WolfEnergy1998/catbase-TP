<template>
  <div class="generations-info">
    <div class="align-select">
      <p>{{ $t('generations') }}:</p>
      <q-select
        class="q-select-size"
        color="primary"
        item-aligned
        borderless
        v-model="numOfGenerations"
        :options="options"
        :label="$t('generations')"
      />
    </div>
    <div>
      <p>{{ $t('inbreeding') }}: 0%</p>
      <q-tooltip anchor="top middle" self="top middle">
        {{ $t('inbreedingFuture') }}
      </q-tooltip>
    </div>
    <div>
      <p>{{ $t('completeInbreeding') }} 0%</p>
      <q-tooltip anchor="top middle" self="top middle">
        {{ $t('completeInbreedingFuture') }}
      </q-tooltip>
    </div>
  </div>

  <div class="row q-my-md">
    <q-btn flat class="underline" @click="showDouble = !showDouble">{{
      $t('markDoubles')
    }}</q-btn>
    <q-btn flat class="underline">{{ $t('geneticsCheck') }}</q-btn>
  </div>

  <div class="table-placeholder">
    <table class="generations-table">
      <tr v-for="(generation, index) in catsByGeneration" :key="index">
        <td
          :style="{
            height: heightInPx / Math.pow(2, index) + 'px',
          }"
          v-for="(cat, index2) in generation"
          :key="index2"
        >
          <div
            class="cat-cell"
            :style="{
              backgroundColor: isDouble(cat.name)
                ? getRandomHexaColor(cat.name)
                : '#ffffff',
            }"
          >
            <div
              :id="index + '-' + index2"
              class="select-fix-icon scrollable-icon"
              v-if="heightInPx / Math.pow(2, index) >= 720"
            >
              <div v-if="cat.id">
                <p>
                  <router-link
                    :class="[index2 % 2 == 0 ? 'man' : 'woman']"
                    :to="formatCatLink(cat)"
                    >{{ formatCatName(cat) }}
                  </router-link>
                  <br />
                  {{ cat.code }} {{ cat.color_code ? cat.color_code : cat.color
                  }}<br />
                  {{ cat.date_of_birth }}
                  <template v-if="cat.generation_number <= 2">
                    {{ cat.reg_num_current }}
                    {{ cat.chip }}
                  </template>
                </p>
              </div>
              <div v-else>No data</div>
            </div>
            <div class="tree-item" v-if="heightInPx / Math.pow(2, index) < 720">
              <div v-if="cat.id">
                <p :class="[index > 3 ? 'smaller-text' : '']">
                  <router-link
                    :class="[index2 % 2 == 0 ? 'man' : 'woman']"
                    :to="formatCatLink(cat)"
                    >{{ formatCatName(cat) }}</router-link
                  ><br />
                  {{ cat.code }} {{ cat.color_code ? cat.color_code : cat.color
                  }}<br />
                  {{ cat.date_of_birth }}
                  <template v-if="cat.generation_number <= 2">
                    <br />{{ cat.reg_num_current }}
                    <br />{{ cat.chip }}
                  </template>
                </p>
              </div>
              <div :class="[index > 3 ? 'smaller-text' : '']" v-else>
                No data
              </div>
            </div>
          </div>
        </td>
      </tr>
    </table>

    <div class="correctness-container">
      {{ $t('pedigreeCorrectness') }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref } from 'vue';
import { GenerationService } from 'src/services';

export default defineComponent({
  name: 'CatPedigree',
  props: ['pedigreeData'],
  setup() {
    let numOfGenerations = ref(4);
    window.onscroll = function () {
      scrollElements();
    };
    function scrollElements() {
      document.querySelectorAll('.scrollable-icon').forEach((elem: any) => {
        let col = elem?.id.split('-')[0];
        let row = elem?.id.split('-')[1];
        let colWidth =
          (document.querySelector('td:has(.cat-cell)')?.clientWidth as number) -
          8;
        elem.style.width = colWidth + 'px';
        let colHeight =
          (Math.pow(2, numOfGenerations.value) * 32) / Math.pow(2, col);
        if (numOfGenerations.value > 4)
          colHeight =
            (Math.pow(2, numOfGenerations.value) * 24) / Math.pow(2, col);
        if (
          window.pageYOffset > 150 + colHeight * parseInt(row) &&
          window.pageYOffset < 150 + colHeight * (parseInt(row) + 1) - 60
        ) {
          elem.classList.add('fixed-icon');
          let mrg = 150 + colHeight * parseInt(row);
          elem.style.marginTop = '-' + mrg + 'px';
          elem.style.bottom = 'initial';
        } else {
          if (elem.classList.contains('fixed-icon')) {
            elem.classList.remove('fixed-icon');
            elem.style.marginTop = 'initial';
            if (window.innerHeight / 2 > elem.getBoundingClientRect().top)
              elem.style.bottom = '0';
            else elem.style.bottom = 'initial';
          }
        }
      });
    }
    return {
      scrollElements,
      colWidth: 0,
      numOfGenerations,
      generations: ref([] as any[]),
      catsByGeneration: ref([] as any[]),
      doubles: ref([] as string[]),
      showDouble: ref(false),
    };
  },

  watch: {
    async numOfGenerations() {
      this.generations = [];
      this.catsByGeneration = [];
      let catResponse = (
        await GenerationService.get(
          this.$route.params.id as string,
          this.numOfGenerations as number
        )
      ).data;
      if ('error' in catResponse) {
        this.generations = [];
        this.catsByGeneration = [];
      } else {
        this.fillDoubles(catResponse);

        this.generations = Array.from(
          new Set(
            catResponse.map(
              (cat: { generation_number: any }) => cat.generation_number
            )
          )
        ).sort();
        this.generations.forEach((gen: any) => {
          this.catsByGeneration[gen] = catResponse.filter(
            (cat: { generation_number: any }) => cat.generation_number === gen
          );
        });
      }
      this.catsByGeneration.shift();
      this.scrollElements();
    },
  },
  updated() {
    this.scrollElements();
  },
  beforeMount() {
    if ('error' in this.pedigreeData) {
      this.generations = [];
      this.catsByGeneration = [];
    } else {
      this.fillDoubles(this.pedigreeData);

      this.generations = Array.from(
        new Set(
          this.pedigreeData.map(
            (cat: { generation_number: any }) => cat.generation_number
          )
        )
      ).sort();

      this.generations.forEach((gen: any) => {
        this.catsByGeneration[gen] = this.pedigreeData.filter(
          (cat: { generation_number: any }) => cat.generation_number === gen
        );
      });
      this.catsByGeneration.shift();
    }
  },
  computed: {
    heightInPx() {
      if (this.numOfGenerations > 4)
        return Math.pow(2, this.numOfGenerations) * 24;
      return Math.pow(2, this.numOfGenerations) * 32;
    },
    options() {
      if (this.$q.screen.width < 1300 && this.$q.screen.width > 1200) {
        this.setNumOfGenerations(9);
        return ['2', '3', '4', '5', '6', '7', '8', '9'];
      }
      if (this.$q.screen.width < 1200 && this.$q.screen.width > 1100) {
        this.setNumOfGenerations(8);
        return ['2', '3', '4', '5', '6', '7', '8'];
      }
      if (this.$q.screen.width < 1100 && this.$q.screen.width > 1000) {
        this.setNumOfGenerations(7);
        return ['2', '3', '4', '5', '6', '7'];
      }
      if (this.$q.screen.width < 1000 && this.$q.screen.width > 900) {
        this.setNumOfGenerations(6);
        return ['2', '3', '4', '5', '6'];
      }
      if (this.$q.screen.width < 900 && this.$q.screen.width > 800) {
        this.setNumOfGenerations(5);
        return ['2', '3', '4', '5'];
      }
      if (this.$q.screen.width < 800 && this.$q.screen.width > 700) {
        this.setNumOfGenerations(4);
        return ['2', '3', '4'];
      }
      if (this.$q.screen.width < 700 && this.$q.screen.width > 600) {
        this.setNumOfGenerations(3);
        return ['2', '3'];
      }
      if (this.$q.screen.width < 600 && this.$q.screen.width > 500) {
        this.setNumOfGenerations(2);
        return ['2'];
      }

      return ['2', '3', '4', '5', '6', '7', '8', '9', '10'];
    },
  },
  methods: {
    fillDoubles(data: any[]) {
      let names = data.map((cat: { name: string }) => cat.name);
      this.doubles = names
        .filter((e: any) => e !== undefined)
        .filter((item: string, index: number) => names.indexOf(item) !== index);
    },
    setNumOfGenerations(num: number) {
      if (this.numOfGenerations > num) {
        this.numOfGenerations = num;
      }
    },
    isDouble(name: string) {
      if (!this.showDouble) return false;
      return this.doubles.includes(name);
    },
    formatCatName(cat: any) {
      let name = cat.name ? cat.name : '';
      return name.trim();
    },
    formatCatLink(cat: any) {
      let link = `/cat/detail/${cat.id}/pedigree`;
      return link;
    },
    getRandomHexaColor(str: string) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      let color = 'rgba(';
      for (let i = 0; i < 3; i++) {
        let value = (hash >> (i * 8)) & 0xff;
        let add = ('00' + value.toString(16)).slice(-2);
        color += parseInt(add, 16) + ', ';
      }
      color += '0.5)';
      return color;
    },
  },
});
</script>

<style scoped lang="scss">
.edit-btn {
  width: 38px;
}

.fixed-icon {
  position: fixed;
}

.select-fix-icon:not(.fixed-icon) {
  position: absolute;
}

.fixed-icon-last {
  position: absolute;
  bottom: 0;
}

.select-fix-icon i {
  color: $primary;
}

.underline {
  text-decoration: underline;
}
.top-row {
  display: flex;
  padding-top: 25px;
  .ceter-name {
    margin-right: auto;
    h1 {
      margin: 0;
      font-family: 'Inter', sans-serif;
      font-style: normal;
      font-weight: 400;
      font-size: 32px;
      line-height: 39px;
      color: #000000;
    }
  }
}

.table {
  border-radius: 20px;
  outline-style: solid;
  outline-color: $primary;
  margin-top: 16px;
  display: flex;
  padding: 5px 16px 16px 16px;
  @media (max-width: 575.98px) {
    flex-direction: column;
  }
  .left-table {
    margin-right: 48px;
    display: flex;
    .values p {
      height: 21px;
    }
    @media (max-width: 767.98px) {
    }
    @media (max-width: 575.98px) {
      margin-right: 0px;
    }
    .names {
      margin-right: 16px;
    }

    p {
      margin: 15px 0 0;
    }
  }
  .values p {
    height: 21px;
  }
  .right-table {
    display: flex;
    @media (max-width: 767.98px) {
      margin-left: 4px;
    }
    @media (max-width: 575.98px) {
      margin-left: 0;
    }
    .names {
      margin-right: 16px;
    }

    p {
      margin: 15px 0 0;
    }
  }
}

.generations-table {
  gap: 0px;
  tr {
    gap: 0px;
  }
  .double {
    background-color: #c21d1d;
  }

  .cat-cell {
    position: relative;
    border: 2px solid #bebebe;
    height: 100%;
    border-radius: 12px;
    background-color: white;
    text-align: center;
    .smaller-text {
      font-size: 10px;
    }
  }
  .tree-item {
    height: 100%;
    #display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    text-align: center;

    p {
      margin: 0px;
    }

    i {
      color: $primary;
    }

    div:nth-child(2) {
      text-align: center;
    }

    div:first-child,
    div:last-child {
      width: 100%;
    }
  }
}
.generations-info {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: 16px;

  @media (max-width: 575.98px) {
    align-items: center;
    padding-left: 16px;
  }
  .align-select {
    display: flex;
    align-items: center;
    .q-field--item-aligned {
      padding: 0;
      padding-left: 5px;
      :deep(.q-icon) {
        margin-top: 13px;
      }
    }
  }
  :deep(.q-field--standard .q-field__control:before) {
    border-bottom: none;
  }

  p {
    margin: 0;
    margin-top: 15px;
  }
  .q-select-size {
    width: 35px;
  }
}

.table-placeholder {
  background-color: #f5f5f5;
  .generations-table {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f5f5;
    tr {
      width: 100%;
      display: flex;
      flex-direction: column;
      background-color: #f5f5f5;
      td {
        padding: 2px;
      }
    }
  }
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

.container-info-icon {
  margin-left: 16px;
}

.correctness-container {
  display: flex;
  justify-content: center;
  padding-top: 24px;
  font-size: 1.15em;
}
</style>
