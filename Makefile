include .env
WORKSPACE_PORT ?= 3000

serve-operator:
	cd operator && npm install && npm run start

serve-operator-dev:
	cd operator && npm install && npm run start:dev



serve-workspace:
	cp .env workspace && cd workspace && npm run build && npx next start --port $(WORKSPACE_PORT)

serve-workspace-dev:
	cp .env worspace && cd workspace && npx next dev --port $(WORKSPACE_PORT)