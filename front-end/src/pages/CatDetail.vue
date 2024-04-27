<template>
  <div class="background" :key="key">
    <div class="flex justify-center" v-if="loading">
      <q-spinner color="primary" size="3em" />
    </div>
    <div v-if="!loading">
      <div v-if="cat == null" class="flex justify-center">
        <h4>{{ $t('catNotExist') }}</h4>
      </div>

      <div v-if="cat !== null">
        <div class="top-row">
          <div class="ceter-name">
            <h4>{{ validateString(cat!.name) }}</h4>
            <q-input dense v-if="edit" v-model="cat!.name" />
          </div>

          <div class="buttons">
            <q-btn
              rounded
              class="q-mr-md edit-btn"
              color="green"
              icon="edit"
              @click="changeEdit"
              v-if="canUserEdit()"
            >
              <q-tooltip>{{ $t('editCat') }}</q-tooltip>
            </q-btn>
            <q-btn
              rounded
              class="q-mr-md edit-btn"
              color="red"
              icon="delete"
              @click="deleteCat"
              v-if="canUserEdit()"
            >
              <q-tooltip>{{ $t('deleteCat') }}</q-tooltip>
            </q-btn>
            <q-btn-dropdown color="primary" :label="$t('share')">
              <q-list>
                <q-item clickable v-close-popup @click="showPdf()">
                  <q-item-section>
                    <q-item-label>PDF</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="showImage()">
                  <q-item-section>
                    <q-item-label>JPG</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </div>

        <q-card class="my-card">
          <div class="table border border-dark row">
            <div class="col-12 col-md-4">
              <div class="field">
                <label>{{ $t('sex') }}:</label>
                <p>{{ validateString(cat!.gender) }}</p>
              </div>
              <div class="field">
                <label>{{ $t('breed') }}:</label>
                <p>{{ breed.label }}</p>
              </div>
              <div class="field">
                <label>EMS:</label>
                <p>
                  {{
                    cat.colorCode
                      ? validateString(cat!.colorCode)
                      : validateString(cat!.color)
                  }}
                </p>
              </div>
              <div class="field">
                <label>{{ $t('cattery') }}:</label>
                <p>{{ validateString(cat!.additionalInfo?.cattery) }}</p>
              </div>
              <div class="field">
                <label>{{ $t('birthday') }}:</label>
                <p>
                  {{
                    dateUtil.formatDate(
                      validateString(cat!.dateOfBirth),
                      'DD.MM.YYYY'
                    )
                  }}
                </p>
              </div>
            </div>
            <div class="col-12 col-md-8">
              <div class="field">
                <label>{{ $t('currentRegNo') }}:</label>
                <p>{{ validateString(cat!.regNumCurrent) }}</p>
              </div>
              <div class="field">
                <label>{{ $t('chipNum') }}:</label>
                <p>{{ validateString(cat!.additionalInfo?.chip) }}</p>
              </div>
              <div class="field">
                <label>{{ $t('currCountry') }}:</label>
                <p>{{ validateString(cat!.countryCurrent) }}</p>
              </div>
              <div class="field">
                <label>{{ $t('orgCountry') }}:</label>
                <p>{{ validateString(cat!.countryOrigin) }}</p>
              </div>
              <div class="field">
                <label>{{ $t('breedColor') }}:</label>
                <p>
                  {{ buildColorEMS() }}
                </p>
              </div>
            </div>
          </div>
        </q-card>
        <div>
          <q-tabs
            v-model="tab"
            :breakpoint="0"
            align="left"
            class="text-primary"
          >
            <q-tab name="pedigree" :label="$t('pedigree')" />
            <q-tab
              name="offspring"
              :label="$t('offspring') + ` (${countOffsprings})`"
            />
            <q-tab name="foundation" :label="$t('foundation')" />
            <q-tab name="testMating" :label="$t('testMating')" />
            <q-tab name="documents" :label="$t('documents')" />
          </q-tabs>
        </div>

        <div>
          <q-tab-panels
            class="panels"
            v-model="tab"
            animated
            swipeable
            vertical
            transition-prev="jump-up"
            transition-next="jump-up"
          >
            <q-tab-panel name="pedigree">
              <cat-pedigree
                :pedigreeData="pedigreeData"
                class="q-mt-md"
              ></cat-pedigree>
            </q-tab-panel>

            <q-tab-panel name="offspring">
              <cat-offspring
                :offspringData="offspringData"
                class="q-mt-md"
              ></cat-offspring>
            </q-tab-panel>
            <q-tab-panel name="foundation">
              <cat-foundation
                :foundationData="foundationData"
                class="q-mt-md"
              ></cat-foundation>
            </q-tab-panel>
            <q-tab-panel name="testMating">
              <cat-test-mating
                class="q-mt-md"
                :testMatingData="testMatingData"
                :catProp="catAbstract"
              ></cat-test-mating>
            </q-tab-panel>

            <q-tab-panel name="documents">
              <cat-documents
                :documentsData="cat.links"
                class="q-mt-md"
              ></cat-documents>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref } from 'vue';
import { Breed, Cat } from 'src/contracts/Cat';
import { date } from 'quasar';
import { catService } from 'src/services';
import { userAuthStore } from 'src/stores/auth-store';
import { cacheStore } from 'src/stores/cache-store';
import { GenerationService } from 'src/services';
import CatService from 'src/services/cat/CatService';
import CreateCatDialog from 'src/components/CreateCatDialog.vue';
import CatPedigree from './CatDetailComponents/CatPedigree.vue';
import CatOffspring from './CatDetailComponents/CatOffspring.vue';
import { OffspringService } from 'src/services';
import { FoundationService } from 'src/services';
import CatFoundation from './CatDetailComponents/CatFoundation.vue';
import CatTestMating from 'pages/CatDetailComponents/CatTestMating.vue';
import CatDocuments from 'pages/CatDetailComponents/CatDocuments.vue';

// valid color codes of length 5
const validColorCodes5 = ['dt(d)', 'et(e)'];

// valid color codes of length 4
const validColorCodes4 = ['x *t', 'x am', 'x cm', 'x pm', 'x em', 'x *m'];

// valid color codes of length 3
const validColorCodes3 = ['non'];

// valid color codes of length 2
const validColorCodes2 = [
  'nt',
  'at',
  'ft',
  'gt',
  '01',
  '02',
  '03',
  '04',
  '05',
  '09',
  '11',
  '12',
  '21',
  '22',
  '23',
  '24',
  '25',
  '31',
  '32',
  '33',
  '51',
  '52',
  '53',
  '54',
  '61',
  '62',
  '63',
  '64',
  '65',
  '66',
  '67',
  '71',
  '72',
  '73',
  '81',
  '82',
  '83',
  '84',
];

// valid color codes of length 1
const validColorCodes1 = [
  'w',
  'n',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'j',
  'o',
  'p',
  'q',
  'r',
  's',
  'y',
  'm',
  'x',
  '*',
];
export default defineComponent({
  components: {
    CatDocuments,
    CatTestMating,
    CatPedigree,
    CatOffspring,
    CatFoundation,
  },
  name: 'CatDetail',
  setup() {
    const cat = ref(null as Cat | null);
    const catAbstract = ref(null as Cat | null);
    return {
      breed: ref({
        label: '',
        value: {} as Breed,
      }),
      userAuthStore: userAuthStore(),
      cacheStore: cacheStore(),
      edit: ref(false),
      dateUtil: date,
      cat,
      catAbstract,
      breedOptions: [] as any[],
      loading: ref(true),
      key: ref(0),
      tab: ref('pedigree'),
      pedigreeData: ref(null as any),
      offspringData: ref(null as any),
      foundationData: ref(null as any),
      testMatingData: ref(null as any),
    };
  },
  async beforeMount() {
    if (!this.userAuthStore.isAuthenticated) await this.userAuthStore.check();
    if (!this.cacheStore.isLoaded) await this.cacheStore.loadData();

    let breeds = this.cacheStore.breeds;
    this.breedOptions =
      breeds?.map((breed) => ({
        label: breed.code,
        value: breed,
      })) ?? [];

    await this.loadData(this.$route.params.id as string);
  },

  async beforeRouteUpdate(to) {
    this.tab = 'pedigree';
    await this.loadData(to.params.id as string);
  },

  watch: {
    '$route.params': {
      handler: function (search) {
        if (search.tab == 'offspring') {
          this.tab = 'offspring';
        }
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    countOffsprings() {
      let count = 0;
      this.offspringData.forEach((element: any) => {
        count += element.offsprings.length;
      });
      return count;
    },
  },
  methods: {
    async loadData(catId: string) {
      this.loading = true;
      let response = await catService.get(catId);
      if ('error' in response) {
        this.cat = null;
        this.catAbstract = null;
      } else {
        this.cat = response as Cat;
        this.catAbstract = this.cat;
        if (
          this.cat.gender == 'M' &&
          this.catAbstract &&
          this.catAbstract.reference
        ) {
          this.catAbstract.reference.mother = undefined;
          this.catAbstract.reference.mother_name = undefined;
          this.catAbstract.reference.father_name = this.cat.name as string;
          this.catAbstract.reference.father = {
            id: this.cat.id,
            name: this.cat.name,
            countryOrigin: this.cat.countryOrigin,
            countryCurrent: this.cat.countryCurrent,
            color: this.cat.color,
            breed: this.cat.breed,
            colorCode: this.cat.colorCode,
            dateOfBirth: this.cat.dateOfBirth,
            gender: this.cat.gender,
            regNumOrigin: this.cat.regNumCurrent,
            regNumCurrent: this.cat.regNumCurrent,
          } as Cat;
        } else if (
          this.cat.gender == 'F' &&
          this.catAbstract &&
          this.catAbstract.reference
        ) {
          this.catAbstract.reference.father = undefined;
          this.catAbstract.reference.father_name = undefined;
          this.catAbstract.reference.mother_name = this.cat.name as string;
          this.catAbstract.reference.mother = {
            id: this.cat.id,
            name: this.cat.name,
            countryOrigin: this.cat.countryOrigin,
            countryCurrent: this.cat.countryCurrent,
            color: this.cat.color,
            colorCode: this.cat.colorCode,
            breed: this.cat.breed,
            dateOfBirth: this.cat.dateOfBirth,
            gender: this.cat.gender,
            regNumOrigin: this.cat.regNumCurrent,
            regNumCurrent: this.cat.regNumCurrent,
          } as Cat;
        }

        if (this.cat?.breed) {
          this.breed = {
            label: this.cat?.breed.code ?? '',
            value: this.cat?.breed as Breed,
          };
        }
        else {
          this.breed = {
            label: '',
            value: this.cat?.breed as Breed,
          };
        }
      }

      this.offspringData = (await OffspringService.get(catId)).data;
      this.pedigreeData = (
        await GenerationService.get(catId, 4 as number)
      ).data;
      this.testMatingData = [];

      let fatherMatingData = [];
      let motherMatingData = [];
      if (this.cat && this.cat.gender == 'M') {
        fatherMatingData = (await GenerationService.get(catId, 1 as number))
          .data;
        motherMatingData = [
          { father_id: null, generation_number: 1, id: null, mother_id: null },
          { father_id: null, generation_number: 1, id: null, mother_id: null },
        ];

        let father_id = null;
        let father_name = this.cat.reference
          ? this.cat.reference.father_name
          : undefined;
        if (this.cat.reference && this.cat.reference.father) {
          father_id = this.cat.reference.father.id;
        }
        let mother_id = null;
        let mother_name = this.cat.reference
          ? this.cat.reference.mother_name
          : undefined;
        if (this.cat.reference && this.cat.reference.mother) {
          mother_id = this.cat.reference.mother.id;
        }
        this.testMatingData.push({
          id: this.cat.id,
          name: this.cat.name,
          code: this.cat.breed? this.cat.breed.code : '',
          color_code: this.cat.colorCode,
          date_of_birth: this.cat.dateOfBirth,
          gender: this.cat.gender,
          mother_id,
          mother_name,
          father_id,
          father_name,
          generation_number: 1,
        });
        this.testMatingData.push({
          father_id: null,
          generation_number: 1,
          id: null,
          mother_id: null,
        });
      } else if (this.cat && this.cat.gender == 'F') {
        fatherMatingData = [
          { father_id: null, generation_number: 1, id: null, mother_id: null },
          { father_id: null, generation_number: 1, id: null, mother_id: null },
        ];
        motherMatingData = (await GenerationService.get(catId, 1 as number))
          .data;

        let father_id = null;
        let father_name = this.cat.reference
          ? this.cat.reference.father_name
          : undefined;
        if (this.cat.reference && this.cat.reference.father) {
          father_id = this.cat.reference.father.id;
        }
        let mother_id = null;
        let mother_name = this.cat.reference
          ? this.cat.reference.mother_name
          : undefined;
        if (this.cat.reference && this.cat.reference.mother) {
          mother_id = this.cat.reference.mother.id;
        }

        this.testMatingData.push({
          father_id: null,
          generation_number: 1,
          id: null,
          mother_id: null,
        });
        this.testMatingData.push({
          id: this.cat.id,
          name: this.cat.name,
          code: this.cat.breed ? this.cat.breed.code : '',
          color_code: this.cat.colorCode,
          date_of_birth: this.cat.dateOfBirth,
          gender: this.cat.gender,
          mother_id,
          mother_name,
          father_id,
          father_name,
          generation_number: 1,
        });
      }

      if (this.cat) {
        let min = 0;
        let max = 0;
        for (let i = 1; i < 2; i++) {
          min = max;
          max += Math.pow(2, i);
          for (let j = min; j < max; j++) {
            fatherMatingData[j].generation_number =
              fatherMatingData[j].generation_number + 1;
            this.testMatingData.push(fatherMatingData[j]);
          }
          for (let j = min; j < max; j++) {
            motherMatingData[j].generation_number =
              motherMatingData[j].generation_number + 1;
            this.testMatingData.push(motherMatingData[j]);
          }
        }
      } else {
        this.testMatingData = [
          { father_id: null, generation_number: 1, id: null, mother_id: null },
          { father_id: null, generation_number: 1, id: null, mother_id: null },
          { father_id: null, generation_number: 2, id: null, mother_id: null },
          { father_id: null, generation_number: 2, id: null, mother_id: null },
          { father_id: null, generation_number: 2, id: null, mother_id: null },
          { father_id: null, generation_number: 2, id: null, mother_id: null },
        ];
      }

      this.foundationData = (await FoundationService.get(catId)).data;

      this.loading = false;
      this.key++;
    },
    deleteCat: async function () {
      this.$q
        .dialog({
          title: this.$t('confirm'),
          message: this.$t('deleteText'),
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          await catService.delete(this.cat?.id as string);
          this.cat = null;
          this.$q.notify({
            message: this.$t('catDeleted'),
            color: 'positive',
            position: 'top',
            icon: 'check',
          });
        });
    },
    changeEdit: function () {
      this.$q
        .dialog({
          component: CreateCatDialog,
          componentProps: {
            passedCat: this.cat,
          },
        })
        .onOk(async ({ cat }) => {
          await CatService.update(cat);
        });
    },
    canUserEdit: function (): boolean {
      if (this.userAuthStore.isSuperAdmin) return true;
      return this.userAuthStore.isAdmin &&
        (this.cat as Cat).breed !== undefined &&
        this.userAuthStore.isAdminForBreed((this.cat as Cat).breed.code);
    },
    validateString: function (data: string | undefined | null) {
      if (data) {
        return data;
      } else {
        return '';
      }
    },
    async showPdf() {
      let route = await CatService.getPdfAndImage(this.cat?.id as string);
      window.open(route.path_to_pdf, '_blank');
    },
    async showImage() {
      let route = await CatService.getPdfAndImage(this.cat?.id as string);
      if (route.path_to_jpg) {
        var link = document.createElement('a');
        link.href = route.path_to_jpg;
        link.download = 'cat-' + this.cat?.id + '.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    buildColorEMS: function (): string {
      const validBreeds = [
        'ABY',
        'ACL',
        'ACS',
        'BAL',
        'BEN',
        'BLH',
        'BML',
        'BSH',
        'BUR',
        'CHA',
        'CRX',
        'CYM',
        'DRX',
        'DSP',
        'EUR',
        'EXO',
        'GRX',
        'JBS',
        'KBL',
        'KBS',
        'KOR',
        'LPL',
        'LPS',
        'MAN',
        'MAU',
        'MCO',
        'NFO',
        'NEM',
        'OCI',
        'OLH',
        'OSH',
        'PEB',
        'PER',
        'RAG',
        'RUS',
        'SBI',
        'SIA',
        'SIB',
        'SIN',
        'SNO',
        'SOK',
        'SOM',
        'SPH',
        'SRL',
        'SRS',
        'THA',
        'TUA',
        'TUV',
        'XLH',
        'XSH',
        'HCL',
        'HCS',
        'ABL',
        'ABS',
        'ALH',
        'AMS',
        'AMW',
        'ASH',
        'AUM',
        'BOM',
        'BRX',
        'JBL',
        'LYO',
        'MBT',
        'NEB',
        'RGM',
        'TGR',
        'TIF',
        'TOL',
        'TOS',
      ];
      let finalString = '';
      let colorRegex =
        /^((w|n|a|b|c|d|e|f|g|h|j|o|p|q|r|s|y|x \*t|nt|at|dt\(d\)|et\(e\)|ft|gt|m|x am|x cm|x pm|x em|x \*m|01|02|03|04|05|09|11|12|21|22|23|24|25|31|32|33|51|52|53|54|61|62|63|64|65|66|67|71|72|73|81|82|83|84|non|x|\*) )*(w|n|a|b|c|d|e|f|g|h|j|o|p|q|r|s|y|x \*t|nt|at|dt\(d\)|et\(e\)|ft|gt|m|x am|x cm|x pm|x em|x \*m|01|02|03|04|05|09|11|12|21|22|23|24|25|31|32|33|51|52|53|54|61|62|63|64|65|66|67|71|72|73|81|82|83|84|non|x|\*)$/g;
      if (this.cat) {
        if (this.cat.breed) {
          let breed = this.cat.breed.code.trim();
          if (validBreeds.indexOf(breed) > -1) {
            finalString = this.$t(breed);
          }
        }
        if (this.cat.colorCode) {
          let ems = this.cat.colorCode.trim();
          let tempFinal = '';
          let correctCode = true;
          if (colorRegex.test(ems)) {
            while (ems.length > 0) {
              if (
                ems.length >= 5 &&
                validColorCodes5.indexOf(ems.slice(0, 5)) > -1
              ) {
                if (ems.slice(0, 5) === 'dt(d)') {
                  tempFinal = tempFinal + ' ' + this.$t('dt_d_');
                } else if (ems.slice(0, 5) === 'et(e)') {
                  tempFinal = tempFinal + ' ' + this.$t('et_e_');
                }
                ems = ems.slice(5);
              } else if (
                ems.length >= 4 &&
                validColorCodes4.indexOf(ems.slice(0, 4)) > -1
              ) {
                if (ems.slice(0, 4) === 'x *t') {
                  tempFinal = tempFinal + ' ' + this.$t('x__t');
                } else if (ems.slice(0, 4) === 'x am') {
                  tempFinal = tempFinal + ' ' + this.$t('x_am');
                } else if (ems.slice(0, 4) === 'x cm') {
                  tempFinal = tempFinal + ' ' + this.$t('x_cm');
                } else if (ems.slice(0, 4) === 'x pm') {
                  tempFinal = tempFinal + ' ' + this.$t('x_pm');
                } else if (ems.slice(0, 4) === 'x em') {
                  tempFinal = tempFinal + ' ' + this.$t('x_em');
                } else if (ems.slice(0, 4) === 'x *m') {
                  tempFinal = tempFinal + ' ' + this.$t('x__m');
                }
                ems = ems.slice(4);
              } else if (
                ems.length >= 3 &&
                validColorCodes3.indexOf(ems.slice(0, 3)) > -1
              ) {
                if (ems.slice(0, 3) === 'non') {
                  tempFinal = tempFinal + ' ' + this.$t('non');
                }
                ems = ems.slice(3);
              } else if (
                ems.length >= 2 &&
                validColorCodes2.indexOf(ems.slice(0, 2)) > -1
              ) {
                if (ems.slice(0, 2) === '01') {
                  tempFinal = tempFinal + ' ' + this.$t('_1');
                } else if (ems.slice(0, 2) === '02') {
                  tempFinal = tempFinal + ' ' + this.$t('_2');
                } else if (ems.slice(0, 2) === '03') {
                  tempFinal = tempFinal + ' ' + this.$t('_3');
                } else if (ems.slice(0, 2) === '04') {
                  tempFinal = tempFinal + ' ' + this.$t('_4');
                } else if (ems.slice(0, 2) === '05') {
                  tempFinal = tempFinal + ' ' + this.$t('_5');
                } else if (ems.slice(0, 2) === '09') {
                  tempFinal = tempFinal + ' ' + this.$t('_9');
                } else {
                  tempFinal = tempFinal + ' ' + this.$t(ems.slice(0, 2));
                }
                ems = ems.slice(2);
              } else if (
                ems.length >= 1 &&
                validColorCodes1.indexOf(ems.slice(0, 1)) > -1
              ) {
                if (ems.slice(0, 1) === '*') {
                  tempFinal = tempFinal + ' ' + this.$t('astrix');
                } else {
                  tempFinal = tempFinal + ' ' + this.$t(ems.slice(0, 1));
                }
                ems = ems.slice(1);
              } else if (ems.length >= 1 && ems.slice(0, 1) === ' ') {
                ems = ems.slice(1);
              } else {
                correctCode = false;
                break;
              }
            }
            if (correctCode) {
              finalString = finalString + ' ' + tempFinal.trim();
            }
          }
        }
      }
      return finalString.trim();
    },
  },
});
</script>

<style scoped lang="scss">
h4 {
  margin-top: 0px;
  margin-bottom: 15px;
}
.my-card {
  width: 700px;
}

.edit-btn {
  width: 38px;
}
.panels {
  background-color: $secondary;

  .q-tab-panel {
    @media (max-width: 575.98px) {
      padding: 0px;
    }
  }
}
.background {
  padding: 24px;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  @media (max-width: 575.98px) {
    padding: 0px;
  }

  .underline {
    text-decoration: underline;
  }
  .top-row {
    display: flex;
    padding-top: 16px;
    @media (max-width: 575.98px) {
      flex-direction: column;
      padding: 16px;
      padding-bottom: 0px;
    }
    .buttons {
      @media (max-width: 575.98px) {
        margin-bottom: 16px;
      }
    }
    .ceter-name {
      margin-right: auto;
      margin-left: 8px;
      @media (max-width: 575.98px) {
        margin: 0px;
      }
    }
  }

  .table {
    .col-md-8 {
      label {
        width: 48% !important;
        @media (max-width: 1024px) {
          width: 30% !important;
        }
      }
    }
    .field {
      display: flex;
      align-items: center;
      height: 35px;
      label {
        width: 35%;
        @media (max-width: 1024px) {
          width: 30% !important;
        }
      }

      p {
        margin: 0;
      }
    }
    margin-top: 16px;
    padding: 10px 16px 10px 16px;

    @media (max-width: 575.98px) {
      outline-style: none;
      margin-top: 0px;
      padding-top: 0px;
    }
    .left-table {
      margin-right: 48px;
      display: flex;
      .values p {
        height: 21px;
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

  .q-tabs {
    margin-top: 16px;
  }
  .q-tab-panel {
    padding: 0px;
    background: #f5f5f5 !important;
  }
  .q-panel {
    background: #f5f5f5 !important;
  }

  .q-tab-panels {
    background: #f5f5f5 !important;
  }
}
</style>
