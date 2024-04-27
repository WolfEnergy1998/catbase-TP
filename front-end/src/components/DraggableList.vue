<template>
  <q-card flat bordered class="bg-grey-1 my-list">
    <q-card-section class="q-pb-none">
      <div class="q-mb-sm">
        {{ t('addValuesFrom') }} <span class="text-bold text-italic">SOURCE_DB</span> {{ t('columnAndSort') }}
      </div>
      <q-input
        v-model="todo"
        @keyup.enter="addTodo"
        type="text"
        :label="t('databaseName')"
        clearable
        outlined
      />
    </q-card-section>

    <q-card-section class="items-body">
      <q-scroll-area style="height: 225px;">
        <q-field borderless :model-value="databases">
          <template v-slot:control>
            <draggable
              :list="databases"
              item-key="id"
              @start="startDrag"
              @end="endDrag"
              v-bind="dragOptions"
              drag-class="drag"
              ghost-class="ghost"
            >
              <template #item="{element}">
                <q-item v-bind:style="dragging ? 'border:none;' : '' "
                        class="items-body-content"
                        dense
                        key="element">
                  <q-item-section class="item-wrapper">
                    <div style="display: flex; flex-direction: row">
                      <q-icon name="drag_handle" class="fa fa-align-justify handle"/>
                      <div style="display: flex; align-items: center;">
                        <div class="item-text">
                          {{ element.text }}
                        </div>
                      </div>

                    </div>

                    <q-icon name="delete"
                            float-right
                            class="delete-button"
                            @click="removeToDo(element.id)"
                    />
                  </q-item-section>
                </q-item>
              </template>
            </draggable>
          </template>
        </q-field>
      </q-scroll-area>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const { t } = useI18n({});
import draggable from 'vuedraggable';
import { uid } from 'quasar';
import {useI18n} from 'vue-i18n';
const emit = defineEmits(['updateDatabasesList']);

const databases = ref<{ id: string, text: string }[]>([]);
const todo = ref('');
const dragging = ref(false);
const dragOptions = {
  animation: 200,
  group: 'description',
  disabled: false,
  ghostClass: 'ghost',
};

const startDrag = () => {
  dragging.value = true;
}

const endDrag = () => {
  dragging.value = false;
  emit('updateDatabasesList', databases.value);
}

const removeToDo = (id: string) => {
  const index = databases.value.findIndex((item) => item.id === id);
  if (index !== -1) {
    databases.value.splice(index, 1);
  }
  emit('updateDatabasesList', databases.value);
}

const addTodo = () => {
  const newItem = { id: uid(), text: todo.value };
  databases.value.push(newItem);
  todo.value = '';
  emit('updateDatabasesList', databases.value);
}

</script>

<style scoped lang="scss">
  .my-list{
    max-width: 350px;
    margin: 10px 0 10px 10px;
  }

  .items-body-content {
    padding: 10px 10px 10px 2px;
    border-radius: 7px;
    width: 315px;
    background-color: #eaeaea;
    margin-bottom: 4px;
    border: 2px solid transparent;
  }

  .items-body-content:active, .items-body-content:active:hover {
    cursor: grabbing !important;
  }

  .items-body-content:not(:active):hover {
    border: 2px solid #c0c0c0;
  }

  .item-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .item-text {
    overflow:hidden;
    white-space:nowrap;
    text-overflow: ellipsis;
    width: 230px;
  }

  .delete-button {
    font-size: 24px;
    color: #606060;
  }

  .delete-button:hover {
    cursor: pointer;
    color: #d50000;
  }

  .handle {
    width: 40px;
    font-size: 24px;
  }

  .handle:hover {
    cursor: grab !important;
  }

  .handle:active {
    cursor: grabbing !important;
  }

  .ghost {
    opacity: 0.7;
    background-color: #0B5AA2;
    cursor: grabbing !important;
    color: #eaeaea;
    border: 2px solid transparent;

    .delete-button {
      color: #eaeaea;
    }
  }
</style>
