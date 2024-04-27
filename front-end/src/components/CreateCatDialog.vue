<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide" class="cat-dialog">
    <q-card class="q-dialog-plugin">
      <q-card-section class="q-dialog__title flex justify-between q-ma-sm">
        {{ cat.id !== undefined ? 'Edit' : 'Create' }} cat
        <q-icon name="close" style="cursor: pointer" @click="onCancelClick" />
      </q-card-section>
      <q-card-section>
        <div class="q-px-md">
          <div class="row">
            <div class="col">
              <q-input
                v-model="(cat.additionalInfo as CatInformation).titleBefore"
                :label="$t('titleBefore')"
                filled
              />
            </div>
            <div class="col">
              <q-input v-model="cat.name" :label="$t('name')" filled />
            </div>
            <div class="col">
              <q-input
                v-model="(cat.additionalInfo as CatInformation).titleAfter"
                :label="$t('titleAfter')"
                filled
              />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <q-select
                v-model="breed"
                :label="$t('breed')"
                filled
                :options="breedOptions"
              />
            </div>
            <div class="col">
              <q-input v-model="cat.dateOfBirth" :label="$t('birthDate')" filled />
            </div>
            <div class="col">
              <q-select
                filled
                clearable
                :label="$t('sex')"
                options-dense
                v-model="cat.gender"
                :options="sexOptions"
              />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <q-input v-model="cat.color" :label="$t('otherColor')" filled />
            </div>
            <div class="col">
              <q-input v-model="cat.colorCode" :label="$t('colorCode')" filled />
            </div>
          </div>

          <div class="row">
            <div class="col">
              <q-input
                v-model="cat.regNumCurrent"
                :label="$t('currentRegNo')"
                filled
              />
            </div>
            <div class="col">
              <q-input
                v-model="cat.regNumOrigin"
                :label="$t('originRegNo')"
                filled
              />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <q-input
                v-model="cat.countryCurrent"
                :label="$t('currCountry')"
                filled
              />
            </div>
            <div class="col">
              <q-input
                v-model="cat.countryOrigin"
                :label="$t('orgCountry')"
                filled
              />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <q-input
                v-model="(cat.additionalInfo as CatInformation).chip"
                :label="$t('chipNum')"
                filled
              />
            </div>
            <div class="col">
              <q-input
                v-model="(cat.additionalInfo as CatInformation).cattery"
                :label="$t('cattery')"
                filled
              />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <q-input
                v-model="(cat.additionalInfo as CatInformation).verifiedStatus"
                :label="$t('verifiedStatus')"
                filled
              />
            </div>
            <div class="col"></div>
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="q-px-xl">
          <div class="table-header">
            <h4>{{ $t('links') }}</h4>
            <div>
              <q-btn
                icon="add"
                color="primary"
                :label="$t('createLink')"
                @click="newLink"
              />
            </div>
          </div>
          <q-table :columns="columns" :rows="links" ref="tableRef">
            <template v-slot:body-cell-action="props">
              <q-td :props="props">
                <q-btn
                  color="green"
                  icon-right="edit"
                  no-caps
                  flat
                  dense
                  @click="editLink(links.indexOf(props.row))"
                />
                <q-btn
                  color="negative"
                  icon-right="delete"
                  no-caps
                  flat
                  dense
                  @click="deleteLink(links.indexOf(props.row))"
                />
              </q-td>
            </template>
          </q-table>
        </div>
      </q-card-section>
      <div class="q-px-xl q-mt-md">
        <div class="row">
          <div class="col col-btns">
            <div class="parent-box">
              <h5>{{ $t('father') }}:</h5>
              <h5>
                {{
                  (cat.reference as Reference).father
                    ? (cat.reference as Reference).father?.name
                    : (cat.reference as Reference).father_name
                }}
              </h5>
              <h5
                v-if="(cat.reference as Reference).father === undefined && (cat.reference as Reference).father_name === undefined"
              >
                -
              </h5>
              <q-icon
                v-if="(cat.reference as Reference).father !== undefined && (cat.reference as Reference).father_name !== undefined"
                name="delete"
                color="red"
                size="sm"
                class="q-ml-md"
                style="cursor: pointer"
                @click="removeFather()"
              >
                <q-tooltip>Remove</q-tooltip>
              </q-icon>
            </div>
            <q-btn
              color="primary"
              :label="$t('select')"
              @click="selectFather"
              class="q-ml-md btn"
            ></q-btn>
          </div>
          <div class="col col-btns">
            <div class="parent-box">
              <h5>{{ $t('mother') }}:</h5>
              <h5>
                {{
                  (cat.reference as Reference).mother
                    ? (cat.reference as Reference).mother?.name
                    : (cat.reference as Reference).mother_name
                }}
              </h5>
              <h5
                v-if="(cat.reference as Reference).mother === undefined && (cat.reference as Reference).mother_name === undefined"
              >
                -
              </h5>
              <q-icon
                v-if="(cat.reference as Reference).mother !== undefined && (cat.reference as Reference).mother_name !== undefined"
                name="delete"
                color="red"
                size="sm"
                class="q-ml-md"
                style="cursor: pointer"
                @click="removeMother()"
              >
                <q-tooltip>Remove</q-tooltip>
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
      <q-card-section> </q-card-section>

      <q-card-actions align="right">
        <q-btn flat color="primary" :label="$t('cancel')" @click="onCancelClick" />
        <q-btn flat color="primary" label="Save" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { QTableProps, useDialogPluginComponent } from 'quasar';
import { Breed, Cat, CatInformation, Link, Reference } from 'src/contracts';
import CatService from 'src/services/cat/CatService';
import { userAuthStore } from 'src/stores/auth-store';
import { cacheStore } from 'src/stores/cache-store';
import { defineComponent, ref } from 'vue';
import LinkDialog from './LinkDialog.vue';
import SelectCatDialog from './SelectCatDialog.vue';

export default defineComponent({
  props: {
    passedCat: {
      type: Object as () => Cat,
    },
  },
  emits: [...useDialogPluginComponent.emits],
  setup(props) {
    const tableRef = ref();

    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent();

    let breed = ref(
      null as { label: string | null; value: Breed | null } | null
    );
    let links = ref([] as Link[]);
    let cat;
    if (props.passedCat) {
      cat = ref(JSON.parse(JSON.stringify(props.passedCat)));
      breed = ref({
        label: props.passedCat.breed?.code,
        value: props.passedCat.breed,
      });
      links.value = cat.links ?? [];
      if (cat.value.reference === null) cat.value.reference = {} as Reference;
      if (cat.value.additionalInfo === null)
        cat.value.additionalInfo = {} as CatInformation;
    } else
      cat = ref({
        additionalInfo: {},
        links: [] as Link[],
        reference: {},
      } as Cat);

    return {
      tableRef,
      breed,
      selectedLink: ref(null as Link | null),
      links,
      cacheStore: cacheStore(),
      userAuthStore: userAuthStore(),
      breedOptions: ref([] as any[]),
      sexOptions: ['M', 'F'],
      cat,
      dialogRef,
      onDialogHide,

      onDialogOK,
      onCancelClick: onDialogCancel,
    };
  },
  async beforeMount() {
    if (!this.userAuthStore.isAuthenticated) await this.userAuthStore.check();
    if (!this.cacheStore.isLoaded) await this.cacheStore.loadData();

    let breeds = this.cacheStore.breeds;
    if (this.userAuthStore.isAdmin)
      breeds = this.userAuthStore.user?.breeds ?? [];
    this.breedOptions =
      breeds?.map((breed) => ({
        label: breed.code,
        value: breed,
      })) ?? [];
  },
  methods: {
    removeFather() {
      (this.cat.reference as Reference).father = undefined;
      (this.cat.reference as Reference).father_name = undefined;
    },
    removeMother() {
      (this.cat.reference as Reference).mother = undefined;
      (this.cat.reference as Reference).mother_name = undefined;
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
          (this.cat.reference as Reference).mother = selectedCat;
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
          (this.cat.reference as Reference).father = selectedCat;
        });
    },
    editLink: function (index: number) {
      this.selectedLink = this.links[index];
      this.openDialog();
    },
    newLink: function () {
      this.selectedLink = {} as Link;
      this.openDialog();
    },
    openDialog: function () {
      this.$q
        .dialog({
          component: LinkDialog,
          componentProps: {
            link: this.selectedLink,
          },
        })
        .onOk(async ({ link }) => {
          if (link.id !== undefined) {
            this.links[this.links.indexOf(this.selectedLink as Link)] =
              link as Link;
          } else {
            link.id = this.links.length + 1;
            this.links.push(link as Link);
          }
        });
    },
    deleteLink: function (index: number) {
      this.$q
        .dialog({
          title: this.$t('confirm'),
          message: this.$t('deleteLink'),
          cancel: true,
          persistent: false,
        })
        .onOk(async () => {
          this.links.splice(index, 1);
        });
    },
    onOKClick() {
      if (this.breed == null || this.breed.value == null) {
        this.$q.notify({
          message: this.$t('selectBreed'),
          color: 'negative',
          position: 'top',
        });
        return;
      }
      this.cat.breed = this.breed.value;
      this.cat.links = this.links.map((link) => {
        return {
          id: null,
          content: link.content,
          type: link.type,
        };
      });
      CatService.validateCat(this.cat);
      this.onDialogOK({
        cat: this.cat,
      });
    },
  },
  computed: {
    columns(): QTableProps['columns'] {
      return [
        {
          name: 'content',
          required: true,
          label: this.$t('content'),
          align: 'left',
          field: (row: Link) => row.content,
          sortable: true,
        },
        {
          name: 'type',
          required: true,
          label: this.$t('type'),
          align: 'left',
          field: (row: Link) => row.type,
          sortable: true,
        },
        { name: 'action',
          label: this.$t('action'),
          field: 'action'
        },
      ]}
  },
})
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

.cat-dialog .col {
  padding: 5px 10px;
}

.cat-dialog {
  .q-card__section--vert {
    padding: 0;
  }
  .q-dialog__title {
    padding-left: 8px;
    padding-top: 8px;
  }
}
.cat-dialog .q-dialog__inner--minimized > .q-dialog-plugin {
  width: 90%;
  max-width: 90% !important;
  @media (max-width: 575.98px) {
    max-width: 100% !important;
    width: 100%;
    height: 100%;
    max-height: 100% !important;
  }
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 30px;
  h4 {
    margin-bottom: 15px;
    margin-top: 15px;
  }
}

.btn {
  @media (max-width: 575.98px) {
    margin: 0;
  }
}
.col-btns {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
  @media (max-width: 575.98px) {
    flex-direction: column;
    align-items: center;
  }
}

.q-dialog__inner--minimized {
  @media (max-width: 575.98px) {
    padding: 0;
  }
}
</style>
