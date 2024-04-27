<template>
  <main>
    <div id="intro" class="container_intro">
      <div class="container_cat_left">
        <q-icon
          class="big-cat"
          name="img:/team/cat_left.svg"
          color="secondary"
          text-color="black"
        />
      </div>

      <div class="container_text_outer">
        <div class="container_text">
          <span class="team_text">Tím 1</span>
          <span class="title_text">INFOCAT</span>
          <span class="description_text">Cats database</span>
          <div class="container_mail">
            <q-icon
              class="email_icon"
              name="email"
              href="mailto:timacikusiacik@gmail.com"
            />
            <a class="mail_text" href="mailto:timacikusiacik@gmail.com"
              >timacikusiacik@gmail.com</a
            >
          </div>
        </div>
      </div>
    </div>
    <div id="about_project" class="container_project">
      <div />
      <div class="container_project_text">
        <h1 class="project_title">O PROJEKTE</h1>
        <p class="project_text">
          Existuje mnoho databáz mačiek rôzne po celom svete. Väčšina krajín má
          svoju vlastnú databázu, kde sú zaregistrované mačky, ktoré majú svojho
          majiteľa v danej krajine. Stáva sa však, že jedna mačka je v týchto
          databázach viac krát, nakoľko ak bola predaná z napríklad Poľska do
          Švédska, tak sa nachádza v oboch databázach.
        </p>

        <p class="project_text">
          Cieľom nášho projektu je zjednotiť tieto databázy, aby mal používateľ
          všetky mačky na jednom mieste, a mohol nad nimi vykonávať svoje
          vyhľadávacie dopyty. So zjednotením je teda spojené aj vyhľadávania
          nad týmto množstvom mačiek. Vyhľadávací systém je implementovaný v
          podobe webovej aplikácie, ktorá podporuje vyhľadanie mačky podľa
          zvolených filtrov, zobrazenie mačky s jej rodokmeňom a ďalšie
          funkcionality.
        </p>

        <p class="project_text">
          Webová aplikácia je vhodná na rozšírenie do budúcnosti, kedy je možné
          pridať novú funkcionalitu spojenú s touto tematikou, alebo import
          ďalších databáz v podobe .CSV, ktorý môže vykonať administrátor
          stránky. Nakoľko v dnešnej dobe je všetko na internete, tak aj naša
          aplikácia nasleduje tento trend a je tak prístupná každému s
          pripojením na internet bez ohľadu na zariadenie, ktoré je použité na
          prístup na stránku.
        </p>
      </div>
      <div class="container_cat_right">
        <q-icon
          class="big-cat"
          name="img:/team/cat_right.svg"
          color="secondary"
          text-color="black"
        />
      </div>
    </div>
    <div id="about_us" class="container_us">
      <div class="container_us_text">
        <div />
        <div class="container_us_text_inner">
          <h1 class="title_text">O NÁS</h1>
          <p class="us_text">
            Sme tím zložený zo študentov prvého inžinierskeho ročníka na FIIT
            STU, ktorý majú za sebou bakalárske štúdium tak isto na FIIT-ke.
            Vďaka bakalárskemu štúdiu a pracovným skúsenostiam sa najviac
            orientujeme vo webových technológiách a dátovému inžinierstvu.
            Tímová práca nám tak isto nie je cudzia, dokážeme sa navzájom
            motivovať, povzbudiť a pomôcť si. Vďaka tímovému duchu držíme spolu
            a každý vieme kde máme miesto v tíme a ako vieme využiť naše silné
            stránky, aby sme náš projekt doniesli do úspešného cieľa.
          </p>
          <h1 class="our_team_text">NÁŠ TÍM</h1>
        </div>
      </div>
      <div class="container_photos">
        <div
          class="container_person"
          v-for="person in people"
          :key="person.name"
        >
          <a v-if="person.linkedin" target="_blank" :href="person.linkedin">
            <img class="photo" :src="person.photo" :alt="person.name" />
            <span class="name">{{ person.name }}</span>
          </a>
          <div v-else>
            <img class="photo" :src="person.photo" :alt="person.name" />
            <span class="name">{{ person.name }}</span>
          </div>
          <span class="description">{{ person.description }}</span>
        </div>
      </div>
    </div>
    <div id="time_sheet" class="container_time">
      <div class="container_time_text">
        <div />
        <div class="time_text">
          <h1 class="title_text">ČASOVÁ OS</h1>
        </div>
      </div>
      <div class="container_table">
        <table class="time_table">
          <thead>
            <tr>
              <th class="table_header">Názov</th>
              <th class="table_header cell_not_important">Dátum</th>
              <th class="table_header cell_not_important">Popis</th>
              <th class="table_header">Dokument</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="meeting in meetings" :key="meeting.name">
              <td class="cell_text">{{ meeting.name }}</td>
              <td class="cell_text cell_not_important">{{ meeting.date }}</td>
              <td class="cell_text cell_not_important">
                {{ meeting.description }}
              </td>
              <td class="cell_btn">
                  <q-btn
                    type="a"
                    color="grey-5"
                    text-color="black"
                    unelevated
                    :href=meeting.document
                    target="_blank"
                    >Stiahnuť
                  </q-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

const people = [
  {
    name: 'doc. Mgr. Monika Kováčová, PhD.',
    description: 'product and cats owner',
    photo: '/team/veduca.jpg',
    linkedin: null,
  },
  {
    name: 'Bc. Radovan Cyprich',
    description: 'meetings secretary, data engineer',
    photo: '/team/radko.jpg',
    linkedin: 'https://www.linkedin.com/in/radovan-cyprich-281b6b20a/',
  },
  {
    name: 'Bc. Matej Delinčák',
    description: 'scrum master, back-end',
    photo: '/team/deli.jpg',
    linkedin: 'https://www.linkedin.com/in/matej-delincak-093746206/',
  },
  {
    name: 'Bc. Matej Kuráň',
    description: 'safety manager, scraping expert',
    photo: '/team/kurky.jpg',
    linkedin: 'https://www.linkedin.com/in/matej-kuran/',
  },
  {
    name: 'Bc. Martin Pirkovský',
    description: 'communication manager, front-end',
    photo: '/team/pirky.jpg',
    linkedin: 'https://www.linkedin.com/in/martin-pirkovský-572638207/',
  },
  {
    name: 'Bc. Matej Pirschel',
    description: 'logo designer, UX',
    photo: '/team/pirs.jpg',
    linkedin: 'https://www.linkedin.com/in/matej-pirschel-626007231/',
  },
  {
    name: 'Bc. Peter Plevko',
    description: 'fun coordinator, fullstack',
    photo: '/team/pele.jpg',
    linkedin: 'https://www.linkedin.com/in/peter-plevko-0247a919b/',
  },
  {
    name: 'Bc. Matúš Vidiečan',
    description: 'emergency contact, dev-ops',
    photo: '/team/matus.jpg',
    linkedin: 'https://www.linkedin.com/in/matúš-vidiečan/',
  },
];

const meetings = [
  {
    name: 'Meeting 1',
    date: '04.10.2022',
    description: 'Introduction meeting',
    document: '/team_documents/meeting_1.pdf',
  },
  {
    name: 'Meeting 2',
    date: '11.10.2022',
    description: 'Stand-up',
    document: '/team_documents/meeting_2.pdf',
  },
  {
    name: 'Meeting 3',
    date: '18.10.2022',
    description: 'Stand-up, Sprint review',
    document: '/team_documents/meeting_3.pdf',
  },
  {
    name: 'Meeting 4',
    date: '25.10.2022',
    description: 'Stand-up',
    document: '/team_documents/meeting_4.pdf',
  },
  {
    name: 'Meeting 5',
    date: '8.11.2022',
    description: 'Stand-up, Sprint review',
    document: '/team_documents/meeting_5.pdf',
  },
  {
    name: 'Meeting 6',
    date: '15.11.2022',
    description: 'Stand-up, Sprint review',
    document: '/team_documents/meeting_6.pdf',
  },
  {
    name: 'Meeting 7',
    date: '22.11.2022',
    description: 'Stand-up',
    document: '/team_documents/meeting_7.pdf',
  },
  {
    name: 'Meeting 8',
    date: '29.11.2022',
    description: 'Stand-up, Sprint review',
    document: '/team_documents/meeting_8.pdf',
  },
  {
    name: 'Meeting 9',
    date: '6.12.2022',
    description: 'Stand-up',
    document: '/team_documents/meeting_9.pdf',
  },
  {
    name: 'Meeting 10',
    date: '13.12.2022',
    description: 'Stand-up, Sprint review',
    document: '/team_documents/meeting_10.pdf',
  },
  {
    name: 'Meeting 11',
    date: '21.02.2023',
    description: 'Stand-up',
    document: '/team_documents/meeting_11.pdf',
  },
  {
    name: 'Meeting 12',
    date: '28.02.2023',
    description: 'Stand-up, Sprint review',
    document: '/team_documents/meeting_12.pdf',
  },
  {
    name: 'Meeting 13',
    date: '07.03.2023',
    description: 'Stand-up',
    document: '/team_documents/meeting_13.pdf',
  },
  {
    name: 'Meeting 14',
    date: '14.03.2023',
    description: 'Stand-up, Sprint review',
    document: '/team_documents/meeting_14.pdf',
  },
  {
    name: 'Meeting 15',
    date: '28.03.2023',
    description: 'Stand-up, Sprint review',
    document: '/team_documents/meeting_15.pdf',
  },
  {
    name: 'Meeting 16',
    date: '18.04.2023',
    description: 'Stand-up, Sprint review',
    document: '/team_documents/meeting_16.pdf',
  },
  {
    name: 'Meeting 17',
    date: '25.04.2023',
    description: 'Stand-up, Sprint review',
    document: '/team_documents/meeting_17.pdf',
  },
];

export default defineComponent({
  name: 'TeamPage',
  setup() {
    return {
      meetings,
      people,
    };
  },
});
</script>

<style scoped lang="scss">
$primary: #287094;

.container_intro {
  display: grid;
  grid-template-columns: 517px 6fr 1fr;
  grid-template-areas: 'cat text space';
  justify-content: center;
  margin-left: 30px;
}

.container_cat_left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.container_text_outer {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  justify-content: center;
}

.container_text {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: center;
}

.container_mail {
  display: flex;
  align-items: center;
}

.team_text {
  font: 4em Bahnschrift;
  margin-bottom: 60px;
}

.title_text {
  font: 6.5em Bahnschrift;
  font-weight: bold;
  color: $primary;
  margin-bottom: 20px;
}

.description_text {
  font: 3em Bahnschrift;
  margin-bottom: 10px;
}

.email_icon {
  font-size: 35px;
}

.mail_text {
  color: black;
  text-decoration: none;
  font: 1.5em Bahnschrift;
  margin-left: 7px;
}

.mail_text:hover {
  color: $primary;
}

.big-cat {
  width: auto;
  height: 600px;
}

.container_project {
  display: grid;
  grid-template-columns: 1fr 6fr 517px;
  grid-template-areas: 'space text cat';
  justify-content: center;
  margin-right: 30px;
}

.container_cat_right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
}

.project_title {
  font: 6.5em Bahnschrift;
  font-weight: bold;
  color: $primary;
}

.project_text {
  position: relative;
  font: 1.25em Bahnschrift;
  margin-bottom: 40px;
  padding: 15px 50px 15px 80px;
  background: radial-gradient(
    circle,
    rgba(242, 251, 255, 1) 0%,
    rgba(230, 248, 255, 1) 100%
  );
  right: 80px;
  border-radius: 10px;
}

.container_us {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.container_us_text {
  display: grid;
  grid-template-columns: 1fr 6fr 517px;
  grid-template-areas: 'space text text';
  justify-content: flex-start;
}

.container_us_text_inner {
  grid-area: 1 / text;
}

.us_text {
  font: 1.25em Bahnschrift;
  margin-right: 100px;
}

.our_team_text {
  font: 4em Bahnschrift;
  color: $primary;
  margin-bottom: 40px;
}

.container_photos {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-gap: 20px;
  grid-template-areas:
    'person1 person2 person3 person4'
    'person5 person6 person7 person8';
  justify-content: center;
}

.container_person {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.photo {
  width: 100%;
  max-width: 250px;
  border-radius: 5px;
  box-shadow: 5px 5px 5px #e5e5e5;
}

.name {
  display: flex;
  justify-content: center;
  font: 1.25em Bahnschrift;
  font-weight: bold;
  margin: 12px 0 5px 0;
}

.description {
  display: flex;
  justify-content: center;
  font: 1em Bahnschrift;
}

.container_time {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.container_time_text {
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 6fr 517px;
  grid-template-areas: 'space text text';
  justify-content: flex-start;
}

.time_text {
  grid-area: 1 / text;
}

.time_table {
  width: 100%;
  background-color: #ffffff;
  border-collapse: collapse;
  border-width: 2px;
  border-color: #000000;
  border-style: solid;
  margin-bottom: 50px;
}

.time_table td,
.time_table th {
  border-width: 2px;
  border-color: #000000;
  border-style: solid;
}

.time_table thead {
  background-color: $primary;
}

.table_header {
  color: #ffffff;
  font: 1.5em Bahnschrift;
  padding: 10px 80px;
}

.cell_text {
  font: 1.25em Bahnschrift;
  text-align: center;
}

.cell_btn {
  text-align: center;
  font: 1.25em Bahnschrift;
  padding: 10px;
}

@media only screen and (max-width: 1000px) {
  .big-cat {
    display: none;
  }

  .container_intro {
    display: flex;
    justify-content: flex-start;
    margin: 30px 60px;
  }

  .container_project,
  .container_us_text,
  .container_time {
    display: flex;
    justify-content: flex-start;
    margin: 30px 60px;
  }

  .us_text {
    margin: 0;
  }

  .project_text {
    right: 0;
  }

  .container_photos {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr;
    grid-gap: 20px;
    grid-template-areas:
      'person1 person2'
      'person3 person4'
      'person5 person6'
      'person7 person8';
    justify-content: center;
  }

  .container_time_text {
    display: flex;
    justify-content: flex-start;
  }

  .cell_not_important {
    display: none;
  }
}
</style>
