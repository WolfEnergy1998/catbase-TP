# ----- BUILD STAGE -----
FROM node:lts as build-stage

ARG PWA_src="."
ARG DIST="/pwa"

WORKDIR ${DIST}

COPY ${PWA_src}/package*.json ./

RUN npm install

COPY ${PWA_src} .

RUN npx @quasar/cli build -m pwa

# ----- PRODUCTION STAGE -----
FROM node:lts as production-stage

ARG DIST="/pwa"
ARG PWA="/client"

ENV HOST="0.0.0.0"
ENV PORT="8080"

WORKDIR ${PWA}

COPY --from=build-stage ${DIST}/dist/pwa ./

EXPOSE ${PORT}

RUN npm install -g @quasar/cli

CMD ["quasar", "serve"]
