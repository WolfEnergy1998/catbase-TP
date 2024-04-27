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
  </div>

  <div class="row q-my-md">
    <q-btn flat class="underline" @click="showDouble = !showDouble">{{
      $t('markDoubles')
    }}</q-btn>
  </div>

  <div class="q-px-xl q-mt-md">
    <div class="row">
      <div class="col-md-6 col-12 col-btns">
        <div class="parent-box">
          <h5>{{ $t('father') }}:</h5>
          <h5>
            {{
              (catAbstract.reference as Reference).father
                ? (catAbstract.reference as Reference).father?.name
                : (catAbstract.reference as Reference).father_name
            }}
          </h5>
          <h5
            v-if="(catAbstract.reference as Reference).father === undefined && (catAbstract.reference as Reference).father_name === undefined"
          >
            -
          </h5>
          <q-icon
            v-if="(catAbstract.reference as Reference).father !== undefined && (catAbstract.reference as Reference).father_name !== undefined"
            name="delete"
            color="red"
            size="sm"
            class="q-ml-md"
            style="cursor: pointer"
            @click="removeFather()"
          >
            <q-tooltip>{{ $t('remove') }}</q-tooltip>
          </q-icon>
        </div>
        <q-btn
          color="primary"
          :label="$t('select')"
          @click="selectFather"
          class="q-ml-md btn"
        ></q-btn>
      </div>
      <div class="col-md-6 col-12 col-btns">
        <div class="parent-box">
          <h5>{{ $t('mother') }}:</h5>
          <h5>
            {{
              (catAbstract.reference as Reference).mother
                ? (catAbstract.reference as Reference).mother?.name
                : (catAbstract.reference as Reference).mother_name
            }}
          </h5>
          <h5
            v-if="(catAbstract.reference as Reference).mother === undefined && (catAbstract.reference as Reference).mother_name === undefined"
          >
            -
          </h5>
          <q-icon
            v-if="(catAbstract.reference as Reference).mother !== undefined && (catAbstract.reference as Reference).mother_name !== undefined"
            name="delete"
            color="red"
            size="sm"
            class="q-ml-md"
            style="cursor: pointer"
            @click="removeMother()"
          >
            <q-tooltip>{{ $t('remove') }}</q-tooltip>
          </q-icon>
        </div>
        <q-btn
          color="primary"
          :label="$t('select')"
          @click="selectMother"
          class="q-ml-md btn"
        ></q-btn>
      </div>
    </div>
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
                  {{ cat.code }} {{ cat.color_code }}<br />
                  {{ cat.date_of_birth }}
                </p>
              </div>
              <div v-else>{{  $t('noData') }}</div>
            </div>
            <div class="tree-item" v-if="heightInPx / Math.pow(2, index) < 720">
              <div v-if="cat.id">
                <p>
                  <router-link
                    :class="[index2 % 2 == 0 ? 'man' : 'woman']"
                    :to="formatCatLink(cat)"
                    >{{ formatCatName(cat) }}</router-link
                  ><br />
                  {{ cat.code }} {{ cat.color_code }}<br />
                  {{ cat.date_of_birth }}
                </p>
              </div>
              <div v-else>{{  $t('noData') }}</div>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {GenerationService} from 'src/services';
import SelectCatDialog from 'components/SelectCatDialog.vue';
import {Reference} from 'src/contracts';

export default defineComponent({
  name: 'CatTestMating',
  props: ['testMatingData', 'catProp'],

  setup() {
    let newMother = false;
    let newFather = false;
    let numOfGenerations = ref(2);
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
          (Math.pow(2, numOfGenerations.value) * 50) / Math.pow(2, col);
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
      newMother,
      newFather,
      scrollElements,
      colWidth: 0,
      numOfGenerations,
      generations: ref([] as any[]),
      catsByGeneration: ref([] as any[]),
      doubles: ref([] as string[]),
      showDouble: ref(false),
    };
  },

  data() {
    return {
      catAbstract: Object.assign({}, this.catProp),
    };
  },

  watch: {
    async numOfGenerations() {
      await this.updateTree();
    },
  },
  updated() {
    this.scrollElements();
  },
  beforeMount() {
    if ('error' in this.testMatingData) {
      this.generations = [];
      this.catsByGeneration = [];
    } else {
      this.fillDoubles(this.testMatingData);

      this.generations = Array.from(
        new Set(
          this.testMatingData.map(
            (cat: { generation_number: any }) => cat.generation_number
          )
        )
      ).sort();

      this.generations.forEach((gen: any) => {
        this.catsByGeneration[gen] = this.testMatingData.filter(
          (cat: { generation_number: any }) => cat.generation_number === gen
        );
      });
      this.catsByGeneration.shift();
    }
  },
  computed: {
    heightInPx() {
      return Math.pow(2, this.numOfGenerations) * 50;
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
    async removeFather() {
      (this.catAbstract.reference as Reference).father = undefined;
      (this.catAbstract.reference as Reference).father_name = undefined;
      await this.updateTree();
    },
    async removeMother() {
      (this.catAbstract.reference as Reference).mother = undefined;
      (this.catAbstract.reference as Reference).mother_name = undefined;
      await this.updateTree();
    },
    selectMother: function () {
      this.$q
        .dialog({
          component: SelectCatDialog,
          componentProps: {
            gender: 'F',
          },
        })
        .onOk(async ({ selectedCat }) => {
          (this.catAbstract?.reference as Reference).mother = selectedCat;
          (this.catAbstract?.reference as Reference).mother_name =
            selectedCat.name;
          await this.updateTree();
        });
    },
    selectFather: function () {
      this.$q
        .dialog({
          component: SelectCatDialog,
          componentProps: {
            gender: 'M',
          },
        })
        .onOk(async ({ selectedCat }) => {
          (this.catAbstract?.reference as Reference).father = selectedCat;
          (this.catAbstract?.reference as Reference).father_name =
            selectedCat.name;
          await this.updateTree();
        });
    },
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
      return `/cat/detail/${cat.id}/pedigree`;
    },
    getRandomHexaColor(str: string) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      let color = '#';
      for (let i = 0; i < 3; i++) {
        let value = (hash >> (i * 8)) & 0xff;
        color += ('00' + value.toString(16)).slice(-2);
      }
      return color;
    },
    async updateTree() {
      this.generations = [];
      this.catsByGeneration = [];
      let fatherResponse = [];
      if (
        this.catAbstract &&
        this.catAbstract.reference &&
        this.catAbstract.reference.father
      ) {
        fatherResponse = (
          await GenerationService.get(
            this.catAbstract.reference.father.id as string,
            (this.numOfGenerations - 1) as number
          )
        ).data;

        for (let tempCat of fatherResponse) {
          tempCat.generation_number = tempCat.generation_number + 1;
        }
      } else {
        let min = 0;
        let max = 0;
        for (let i = 1; i < this.numOfGenerations; i++) {
          min = max;
          max += Math.pow(2, i);
          for (let j = min; j < max; j++) {
            fatherResponse.push({
              father_id: null,
              generation_number: i + 1,
              id: null,
              mother_id: null,
            });
          }
        }
      }

      let motherResponse = [];
      if (
        this.catAbstract &&
        this.catAbstract.reference &&
        this.catAbstract.reference.mother
      ) {
        motherResponse = (
          await GenerationService.get(
            this.catAbstract.reference.mother.id as string,
            (this.numOfGenerations - 1) as number
          )
        ).data;

        for (let tempCat of motherResponse) {
          tempCat.generation_number = tempCat.generation_number + 1;
        }
      } else {
        let min = 0;
        let max = 0;
        for (let i = 1; i < this.numOfGenerations; i++) {
          min = max;
          max += Math.pow(2, i);
          for (let j = min; j < max; j++) {
            motherResponse.push({
              father_id: null,
              generation_number: i + 1,
              id: null,
              mother_id: null,
            });
          }
        }
      }

      if ('error' in motherResponse || 'error' in fatherResponse) {
        this.generations = [];
        this.catsByGeneration = [];
        this.catAbstract = null;
      } else {
        let catResponse: any = [];

        if (this.catAbstract.reference.father) {
          let father_id = null;
          let father_name = this.catAbstract.reference.father.reference
            ? this.catAbstract.reference.father.reference.father_name
            : undefined;
          if (
            this.catAbstract.reference.father.reference &&
            this.catAbstract.reference.father.reference.father
          ) {
            father_id = this.catAbstract.reference.father.reference.father.id;
          }
          let mother_id = null;
          let mother_name = this.catAbstract.reference.father.reference
            ? this.catAbstract.reference.father.reference.mother_name
            : undefined;
          if (
            this.catAbstract.reference.father.reference &&
            this.catAbstract.reference.father.reference.mother
          ) {
            mother_id = this.catAbstract.reference.father.reference.mother.id;
          }
          catResponse.push({
            id: this.catAbstract.reference.father.id,
            name: this.catAbstract.reference.father.name,
            code: this.catAbstract.reference.father.breed.code,
            color_code: this.catAbstract.reference.father.colorCode,
            date_of_birth: this.catAbstract.reference.father.dateOfBirth,
            gender: this.catAbstract.reference.father.gender,
            mother_id,
            mother_name,
            father_id,
            father_name,
            generation_number: 1,
          });
        } else {
          catResponse.push({
            father_id: null,
            generation_number: 1,
            id: null,
            mother_id: null,
          });
        }

        if (this.catAbstract.reference.mother) {
          let father_id = null;
          let father_name = this.catAbstract.reference.mother.reference
            ? this.catAbstract.reference.mother.reference.father_name
            : undefined;
          if (
            this.catAbstract.reference.mother.reference &&
            this.catAbstract.reference.mother.reference.father
          ) {
            father_id = this.catAbstract.reference.mother.reference.father.id;
          }
          let mother_id = null;
          let mother_name = this.catAbstract.reference.mother.reference
            ? this.catAbstract.reference.mother.reference.mother_name
            : undefined;
          if (
            this.catAbstract.reference.mother.reference &&
            this.catAbstract.reference.mother.reference.mother
          ) {
            mother_id = this.catAbstract.reference.mother.reference.mother.id;
          }
          catResponse.push({
            id: this.catAbstract.reference.mother.id,
            name: this.catAbstract.reference.mother.name,
            code: this.catAbstract.reference.mother.breed.code,
            color_code: this.catAbstract.reference.mother.colorCode,
            date_of_birth: this.catAbstract.reference.mother.dateOfBirth,
            gender: this.catAbstract.reference.mother.gender,
            mother_id,
            mother_name,
            father_id,
            father_name,
            generation_number: 1,
          });
        } else {
          catResponse.push({
            father_id: null,
            generation_number: 1,
            id: null,
            mother_id: null,
          });
        }

        let min = 0;
        let max = 0;
        for (let i = 1; i < this.numOfGenerations; i++) {
          min = max;
          max += Math.pow(2, i);
          for (let j = min; j < max; j++) {
            catResponse.push(fatherResponse[j]);
          }

          for (let j = min; j < max; j++) {
            catResponse.push(motherResponse[j]);
          }
        }
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
});
</script>

<style scoped lang="scss">
.parent-box {
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  h5:not(:first-child) {
    color: black;
    margin-left: 15px;
  }
}

.col-btns {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 0 20px 0;
  @media (max-width: 575.98px) {
    flex-direction: column;
    align-items: center;
  }
}

.edit-btn {
  width: 38px;
}

.fixed-icon {
  position: fixed;
  margin-left: 4px;
}

.select-fix-icon:not(.fixed-icon) {
  position: absolute;
  margin-left: 4px;
}

.fixed-icon-last {
  position: absolute;
  bottom: 0;
  margin-left: 4px;
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
  }
  .tree-item {
    margin-left: 4px;
    height: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    text-align: center;

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
</style>
