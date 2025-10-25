.DEFAULT_GOAL: build

BUILD_DIR		:= $(shell pwd)/dist
INFRA_DIR		:= $(shell pwd)/infra
SHA_256			:= $(shell git rev-parse --short HEAD)

.PHONY: install
install:
	pnpm install

.PHONY: clean
clean:
	@rm -rf dist
	@rm -rf .astro

.PHONY: dev
dev:
	@pnpm run dev

.PHONY: check
check:
	$(MAKE) check.app
	$(MAKE) check.infra

.PHONY: check.types
check.types:
	pnpm exec tsc --noEmit

.PHONY: check.lint
check.lint:
	oxlint

.PHONY: check.app
check.app:
	@pnpm run astro check
	$(MAKE) check.types
	$(MAKE) check.lint

.PHONY: check.infra
check.infra:
	cd ${INFRA_DIR} && \
		terraform fmt -check && \
		terraform validate && \
		tflint

.PHONY: build
build:
	@pnpm build

.PHONY: preview
preview: build
	@pnpm preview

.PHONY: deploy
deploy:
	@pnpm --filter @nvd.sh/deployer run execute --domain staging.nvd.sh --prefix ${SHA_256} --directory ${BUILD_DIR}

.PHONY: infra.init
infra.init:
	cd ${INFRA_DIR} && \
		tflint --init && \
		terraform init
